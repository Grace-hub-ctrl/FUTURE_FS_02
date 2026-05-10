import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import Database from 'better-sqlite3';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('crm.db');
db.pragma('journal_mode = WAL'); // Performance optimization for production

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT DEFAULT 'Personal',
    source TEXT NOT NULL,
    status TEXT DEFAULT 'New',
    priority INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    leadId TEXT NOT NULL,
    note TEXT NOT NULL,
    action TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE CASCADE
  );
`);

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Seed default user
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
if (userCount.count === 0) {
  const hashedPassword = bcrypt.hashSync(ADMIN_PASSWORD, 10);
  db.prepare('INSERT INTO users (id, username, password) VALUES (?, ?, ?)').run('admin-id', 'admin', hashedPassword);
}

const LeadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().default('Private'),
  source: z.string().default('Website'),
});

const StatusSchema = z.enum(['New', 'Contacted', 'Qualified', 'In Progress', 'Converted', 'Lost']);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security & Utility Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Vite needs this disabled in dev
  }));
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(cors());
  app.use(express.json());

  // Rate Limiting
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 login requests per windowMs
    message: { error: 'Too many login attempts, please try again later.' }
  });

  // Auth Middleware
  const authenticateToken = (req: any, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Auth session expired' });
      req.user = user;
      next();
    });
  };

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth Routes
  app.post('/api/login', authLimiter, (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    res.json({ token, user: { id: user.id, username: user.username } });
  });

  app.get('/api/me', authenticateToken, (req: any, res) => {
    res.json(req.user);
  });

  // Protected API Routes
  app.get('/api/leads', authenticateToken, (req, res) => {
    try {
      const leads = db.prepare('SELECT * FROM leads ORDER BY createdAt DESC').all();
      const leadsWithActivities = leads.map((lead: any) => {
        const activities = db.prepare('SELECT * FROM activities WHERE leadId = ? ORDER BY timestamp DESC').all(lead.id);
        
        // Lead Heat Scoring Logic
        let heatScore = 0;
        const createdDate = new Date(lead.createdAt);
        const now = new Date();
        const diffInHours = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

        if (lead.status === 'Converted') heatScore = 100;
        else if (lead.status === 'Lost') heatScore = 0;
        else {
          heatScore = 40;
          if (lead.status === 'Contacted') heatScore += 15;
          if (lead.status === 'In Progress') heatScore += 30;
          if (lead.status === 'Qualified') heatScore += 45;
          if (diffInHours < 24) heatScore += 20;
          if (diffInHours > 168) heatScore -= 30;
          heatScore += (activities.length * 5);
        }

        return {
          ...lead,
          activities,
          heatScore: Math.min(100, Math.max(0, heatScore))
        };
      });
      res.json(leadsWithActivities);
    } catch (error) {
      res.status(500).json({ error: 'Internal database error' });
    }
  });

  app.post('/api/leads', authenticateToken, (req, res) => {
    try {
      const { name, email, company, source } = LeadSchema.parse(req.body);
      const id = crypto.randomUUID().substring(0, 8);
      
      db.prepare('INSERT INTO leads (id, name, email, company, source) VALUES (?, ?, ?, ?, ?)').run(id, name, email, company, source);
      
      const activityId = crypto.randomUUID().substring(0, 8);
      db.prepare('INSERT INTO activities (id, leadId, note, action) VALUES (?, ?, ?, ?)').run(
        activityId, id, `Lead initialized via ${source}`, 'Creation'
      );

      res.status(201).json({ id, name, email, company, source, status: 'New' });
    } catch (error) {
      res.status(400).json({ error: 'Invalid lead data signature' });
    }
  });

  app.patch('/api/leads/:id', authenticateToken, (req, res) => {
    try {
      const { id } = req.params;
      const { status } = z.object({ status: StatusSchema }).parse(req.body);
      
      const existing = db.prepare('SELECT status FROM leads WHERE id = ?').get(id) as any;
      if (!existing) return res.status(404).json({ error: 'Lead profile not found' });

      db.prepare('UPDATE leads SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
      
      const activityId = crypto.randomUUID().substring(0, 8);
      db.prepare('INSERT INTO activities (id, leadId, note, action) VALUES (?, ?, ?, ?)').run(
        activityId, id, `Transitioned: ${existing.status} ➔ ${status}`, 'Status Update'
      );

      res.json({ id, status });
    } catch (error) {
      res.status(400).json({ error: 'State transition rejected' });
    }
  });

  app.post('/api/leads/:id/notes', authenticateToken, (req, res) => {
    try {
      const { id } = req.params;
      const { note } = z.object({ note: z.string().min(1).max(1000) }).parse(req.body);
      
      const activityId = crypto.randomUUID().substring(0, 8);
      db.prepare('INSERT INTO activities (id, leadId, note, action) VALUES (?, ?, ?, ?)').run(
        activityId, id, note, 'Note Added'
      );

      res.status(201).json({ id: activityId, leadId: id, note });
    } catch (error) {
      res.status(400).json({ error: 'Communication log invalid' });
    }
  });

  app.post('/api/leads/bulk', authenticateToken, (req, res) => {
    try {
      const leads = z.array(LeadSchema).parse(req.body);
      const insertLead = db.prepare('INSERT INTO leads (id, name, email, company, source) VALUES (?, ?, ?, ?, ?)');
      const insertActivity = db.prepare('INSERT INTO activities (id, leadId, note, action) VALUES (?, ?, ?, ?)');

      const transaction = db.transaction((leadsToImport) => {
        for (const lead of leadsToImport) {
          const id = crypto.randomUUID().substring(0, 8);
          insertLead.run(id, lead.name, lead.email, lead.company || 'Private', lead.source || 'Import');
          insertActivity.run(
            crypto.randomUUID().substring(0, 8), 
            id, 
            'Lead imported via bulk upload', 
            'Creation'
          );
        }
      });

      transaction(leads);
      res.status(201).json({ message: `Successfully imported ${leads.length} leads` });
    } catch (error) {
      console.error('Bulk import error:', error);
      res.status(400).json({ error: 'Invalid bulk data format' });
    }
  });

  app.delete('/api/leads/:id', authenticateToken, (req, res) => {
    try {
      const { id } = req.params;
      db.prepare('DELETE FROM leads WHERE id = ?').run(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Erase operation failed' });
    }
  });


  // Vite middleware or Static files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(`[ERROR] ${new Date().toISOString()}:`, err.stack || err);
    res.status(err.status || 500).json({
      error: process.env.NODE_ENV === 'production' 
        ? 'A system error occurred. Please contact support.' 
        : err.message
    });
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SYSTEM] LeadVault running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // Graceful Shutdown
  process.on('SIGTERM', () => {
    console.log('[SYSTEM] SIGTERM received. Closing resources...');
    server.close(() => {
      db.close();
      process.exit(0);
    });
  });
}

// Initial Sample Data (if empty)
const count = db.prepare('SELECT COUNT(*) as count FROM leads').get() as any;
if (count.count === 0) {
  const sampleLeads = [
    { name: 'Marcus Sterling', email: 'marcus@sterling.co', company: 'Sterling Co', source: 'LinkedIn', status: 'Converted', createdDaysAgo: 15 },
    { name: 'Elena Vance', email: 'vance@blackmesa.org', company: 'Black Mesa', source: 'Website', status: 'Contacted', createdDaysAgo: 7 },
    { name: 'David Sarif', email: 'sarif@industries.net', company: 'Sarif Industries', source: 'Referral', status: 'New', createdDaysAgo: 2 },
    { name: 'Adam Jensen', email: 'adam@sarif.com', company: 'Sarif Industries', source: 'LinkedIn', status: 'Qualified', createdDaysAgo: 20 },
    { name: 'Lara Croft', email: 'lara@tombraid.er', company: 'Croft Manor', source: 'Website', status: 'Lost', createdDaysAgo: 25 },
    { name: 'Nathan Drake', email: 'nathan@uncharted.com', company: 'Fortune Hunter', source: 'Referral', status: 'In Progress', createdDaysAgo: 10 },
    { name: 'Sam Fisher', email: 'sam@echelon.gov', company: 'Third Echelon', source: 'Website', status: 'New', createdDaysAgo: 1 },
    { name: 'Billie Lurk', email: 'billie@eyeless.com', company: 'The Eyeless', source: 'LinkedIn', status: 'Converted', createdDaysAgo: 14 },
    { name: 'Faith Connors', email: 'faith@runners.net', company: 'City of Glass', source: 'Website', status: 'In Progress', createdDaysAgo: 4 },
    { name: 'Corvo Attano', email: 'corvo@dunwall.gov', company: 'Royal Guard', source: 'Referral', status: 'Qualified', createdDaysAgo: 9 },
    { name: 'Jill Valentine', email: 'jill@stars.pd', company: 'S.T.A.R.S', source: 'LinkedIn', status: 'Contacted', createdDaysAgo: 6 },
    { name: 'Leon Kennedy', email: 'leon@rpd.gov', company: 'D.S.O', source: 'Referral', status: 'In Progress', createdDaysAgo: 3 },
    { name: 'Arthur Morgan', email: 'arthur@van-der-linde.com', company: 'Outlaws', source: 'Website', status: 'Qualified', createdDaysAgo: 12 },
    { name: 'Geralt of Rivia', email: 'geralt@kaermorhen.pl', company: 'Witchers Inc', source: 'LinkedIn', status: 'Converted', createdDaysAgo: 30 },
    { name: 'Ciri Fiona', email: 'ciri@skellige.is', company: 'Elder Blood', source: 'Website', status: 'Lost', createdDaysAgo: 22 },
    { name: 'Joel Miller', email: 'joel@fireflies.org', company: 'Survivalists', source: 'Referral', status: 'In Progress', createdDaysAgo: 5 },
    { name: 'Ellie Williams', email: 'ellie@jackson.co', company: 'Jackson Settlement', source: 'Website', status: 'Qualified', createdDaysAgo: 8 },
  ];
  
  sampleLeads.forEach(l => {
    const id = crypto.randomUUID().substring(0, 8);
    const date = new Date();
    date.setDate(date.getDate() - (l as any).createdDaysAgo);
    const dateStr = date.toISOString();

    db.prepare('INSERT INTO leads (id, name, email, company, source, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      id, l.name, l.email, l.company, l.source, l.status, dateStr
    );
    
    db.prepare('INSERT INTO activities (id, leadId, note, action, timestamp) VALUES (?, ?, ?, ?, ?)').run(
      crypto.randomUUID().substring(0, 8), id, 'Lead prospect identified', 'Creation', dateStr
    );

    if (l.status !== 'New') {
      const activityDate = new Date(date);
      activityDate.setDate(activityDate.getDate() + 2);
      db.prepare('INSERT INTO activities (id, leadId, note, action, timestamp) VALUES (?, ?, ?, ?, ?)').run(
        crypto.randomUUID().substring(0, 8), id, `Transitioned to ${l.status}`, 'Status Update', activityDate.toISOString()
      );
    }
  });
}

startServer().catch(err => {
  console.error('[CRITICAL] Server startup failed:', err);
  process.exit(1);
});
