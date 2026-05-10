import React from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { Lead, LeadStatus } from '../types';
import { LeadCard } from './LeadCard';
import { Badge } from '../lib/utils';
import { Plus } from 'lucide-react';

interface KanbanBoardProps {
  leads: Lead[];
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onLeadClick: (lead: Lead) => void;
  onAddLead: () => void;
}

const COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'New', label: 'New Leads', color: 'bg-blue-500' },
  { id: 'Contacted', label: 'In Contact', color: 'bg-indigo-500' },
  { id: 'In Progress', label: 'Processing', color: 'bg-amber-500' },
  { id: 'Qualified', label: 'Qualified', color: 'bg-emerald-500' },
  { id: 'Converted', label: 'Converted', color: 'bg-green-600' },
  { id: 'Lost', label: 'Lost', color: 'bg-zinc-700' }
];

export function KanbanBoard({ leads, onStatusChange, onLeadClick, onAddLead }: KanbanBoardProps) {
  const [activeLead, setActiveLead] = React.useState<Lead | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const lead = leads.find(l => l.id === active.id);
    if (lead) setActiveLead(lead);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeLead = leads.find(l => l.id === activeId);
    if (!activeLead) return;

    // Check if dropped over a column or another card
    const overColumn = COLUMNS.find(c => c.id === overId);
    const overLead = leads.find(l => l.id === overId);
    
    const newStatus = overColumn ? overColumn.id : overLead ? overLead.status : null;

    if (newStatus && newStatus !== activeLead.status) {
      onStatusChange(activeId, newStatus);
    }

    setActiveLead(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-8 overflow-x-auto pb-8 min-h-[calc(100vh-22rem)] scrollbar-hide">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex flex-col gap-5 w-80 shrink-0">
            <div className="flex items-center justify-between px-3">
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full ${col.color} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{col.label}</h2>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-700 font-bold ml-1">({leads.filter(l => l.status === col.id).length})</span>
              </div>
              {col.id === 'New' && (
                <button 
                  onClick={onAddLead}
                  className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-600 hover:text-zinc-400"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <SortableContext
              id={col.id}
              items={leads.filter(l => l.status === col.id).map(l => l.id)}
              strategy={verticalListSortingStrategy}
            >
              <div 
                id={col.id}
                className="flex flex-col gap-4 bg-zinc-100/50 dark:bg-zinc-900/20 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 min-h-[500px]"
              >
                {leads
                  .filter((lead) => lead.status === col.id)
                  .map((lead) => (
                    <LeadCard key={lead.id} lead={lead} onClick={onLeadClick} />
                  ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.5',
            },
          },
        }),
      }}>
        {activeLead ? <LeadCard lead={activeLead} onClick={() => {}} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
