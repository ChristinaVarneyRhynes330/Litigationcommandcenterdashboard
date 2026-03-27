import { useState } from 'react';
import { useCaseContext } from '../contexts/CaseContext';
import { Calendar, Plus, Trash2, Link as LinkIcon, Eye, Filter, Download, Clock, MapPin, Users, FileText, Sparkles } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  type: 'hearing' | 'filing' | 'service' | 'contact' | 'deadline' | 'investigation' | 'other';
  description: string;
  location?: string;
  attendees?: string[];
  linkedEvidence?: string[];
  outcome?: string;
  importance: 'high' | 'medium' | 'low';
}

export function TimelineBuilder() {
  const { caseData, addEvent, updateEvent, removeEvent } = useCaseContext();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [newEvent, setNewEvent] = useState<Partial<TimelineEvent>>({
    title: '',
    date: '',
    type: 'other',
    description: '',
    importance: 'medium',
  });

  const eventTypes = [
    { value: 'hearing', label: 'Court Hearing', icon: '⚖️', color: '#9F5166' },
    { value: 'filing', label: 'Court Filing', icon: '📄', color: '#24bca3' },
    { value: 'service', label: 'Service/Visitation', icon: '🤝', color: '#8e9775' },
    { value: 'contact', label: 'Contact/Meeting', icon: '👥', color: '#6B7280' },
    { value: 'deadline', label: 'Deadline', icon: '⏰', color: '#EF4444' },
    { value: 'investigation', label: 'Investigation', icon: '🔍', color: '#F59E0B' },
    { value: 'other', label: 'Other Event', icon: '📌', color: '#8B5CF6' },
  ];

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) {
      toast.error('Title and date are required');
      return;
    }

    const event: TimelineEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newEvent.title,
      date: newEvent.date,
      type: newEvent.type as TimelineEvent['type'],
      description: newEvent.description || '',
      location: newEvent.location,
      attendees: newEvent.attendees,
      linkedEvidence: newEvent.linkedEvidence,
      outcome: newEvent.outcome,
      importance: newEvent.importance as TimelineEvent['importance'],
    };

    setEvents([...events, event].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    
    // Also add to case context
    addEvent({
      title: event.title,
      date: event.date,
      type: event.type,
      location: event.location,
      attendees: event.attendees,
      linkedEvidence: event.linkedEvidence,
      notes: event.description,
    });

    setNewEvent({
      title: '',
      date: '',
      type: 'other',
      description: '',
      importance: 'medium',
    });
    setIsAddingEvent(false);
    toast.success('Event added to timeline');
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm('Remove this event from timeline?')) {
      setEvents(events.filter(e => e.id !== id));
      removeEvent(id);
      toast.success('Event removed');
    }
  };

  const filteredEvents = filterType === 'all' 
    ? events 
    : events.filter(e => e.type === filterType);

  const getEventColor = (type: string) => {
    return eventTypes.find(t => t.value === type)?.color || '#6B7280';
  };

  const getEventIcon = (type: string) => {
    return eventTypes.find(t => t.value === type)?.icon || '📌';
  };

  const calculateDaysSince = (date: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    const diffTime = today.getTime() - eventDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `In ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timeline Builder</h1>
          <p className="text-gray-600 mt-1">Visual chronology of your case events</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'timeline' ? 'list' : 'timeline')}
            className="btn btn-secondary"
          >
            {viewMode === 'timeline' ? 'List View' : 'Timeline View'}
          </button>
          <button
            onClick={() => setIsAddingEvent(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Event
          </button>
        </div>
      </div>

      {/* Case Context Banner */}
      {caseData.caseNumber && (
        <div className="card p-4 bg-brand-rose/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Case Timeline</div>
              <div className="font-semibold text-gray-900">{caseData.caseName}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-brand-rose">{events.length}</div>
              <div className="text-sm text-gray-600">Events</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 mr-2">Filter:</span>
          <button
            onClick={() => setFilterType('all')}
            className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          >
            All Events ({events.length})
          </button>
          {eventTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setFilterType(type.value)}
              className={`btn btn-sm ${filterType === type.value ? 'btn-primary' : 'btn-ghost'}`}
            >
              {type.icon} {type.label} ({events.filter(e => e.type === type.value).length})
            </button>
          ))}
        </div>
      </div>

      {/* Add Event Modal */}
      {isAddingEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Timeline Event</h2>
            
            <div className="space-y-4">
              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Type *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {eventTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setNewEvent({ ...newEvent, type: type.value as any })}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        newEvent.type === type.value
                          ? 'border-brand-teal bg-brand-teal/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className="text-xs font-medium">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g., Case Management Hearing, Home Visit, Filing Motion"
                  className="input w-full"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="input w-full"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={newEvent.location || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="e.g., Courtroom 4A, Parent's Home, DCF Office"
                  className="input w-full"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Describe what happened at this event..."
                  className="input w-full"
                  rows={3}
                />
              </div>

              {/* Outcome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Outcome/Result</label>
                <textarea
                  value={newEvent.outcome || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, outcome: e.target.value })}
                  placeholder="What was the result or outcome of this event?"
                  className="input w-full"
                  rows={2}
                />
              </div>

              {/* Importance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Importance</label>
                <select
                  value={newEvent.importance}
                  onChange={(e) => setNewEvent({ ...newEvent, importance: e.target.value as any })}
                  className="input w-full"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High - Critical Event</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={handleAddEvent} className="btn btn-primary flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </button>
              <button
                onClick={() => {
                  setIsAddingEvent(false);
                  setNewEvent({ title: '', date: '', type: 'other', description: '', importance: 'medium' });
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && filteredEvents.length > 0 && (
        <div className="card p-6">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-rose via-brand-teal to-brand-sage" />
            
            {/* Events */}
            <div className="space-y-8">
              {filteredEvents.map((event, index) => (
                <div key={event.id} className="relative pl-20">
                  {/* Timeline dot */}
                  <div 
                    className="absolute left-5 w-7 h-7 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                    style={{ backgroundColor: getEventColor(event.type) }}
                  >
                    <span className="text-xs">{getEventIcon(event.type)}</span>
                  </div>

                  {/* Event card */}
                  <div className="card p-5 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span 
                            className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                            style={{ backgroundColor: getEventColor(event.type) }}
                          >
                            {eventTypes.find(t => t.value === event.type)?.label}
                          </span>
                          {event.importance === 'high' && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold">
                              CRITICAL
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(event.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                          <div className="text-gray-500">
                            {calculateDaysSince(event.date)}
                          </div>
                        </div>

                        {event.location && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </div>
                        )}

                        {event.description && (
                          <p className="text-gray-700 mb-3">{event.description}</p>
                        )}

                        {event.outcome && (
                          <div className="bg-brand-teal/10 border-l-4 border-brand-teal p-3 rounded">
                            <div className="text-xs font-semibold text-brand-teal mb-1">OUTCOME:</div>
                            <div className="text-sm text-gray-700">{event.outcome}</div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="btn btn-sm btn-ghost text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && filteredEvents.length > 0 && (
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <div key={event.id} className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: `${getEventColor(event.type)}20` }}
                  >
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <div className="text-sm text-gray-600">
                      {new Date(event.date).toLocaleDateString()} • {calculateDaysSince(event.date)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="btn btn-sm btn-secondary"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="btn btn-sm btn-ghost text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {events.length === 0 && (
        <div className="card p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Yet</h3>
          <p className="text-gray-600 mb-6">
            Start building your case timeline by adding important events, hearings, and deadlines.
          </p>
          <button
            onClick={() => setIsAddingEvent(true)}
            className="btn btn-primary mx-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add First Event
          </button>
        </div>
      )}

      {/* Quick Actions */}
      {events.length > 0 && (
        <div className="card p-6 bg-gradient-to-r from-brand-rose/5 to-brand-teal/5">
          <h3 className="font-semibold text-gray-900 mb-4">Timeline Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button className="btn btn-outline flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Generate Narrative
            </button>
            <button className="btn btn-outline flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Export Timeline
            </button>
            <button className="btn btn-outline flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              Print Timeline
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
