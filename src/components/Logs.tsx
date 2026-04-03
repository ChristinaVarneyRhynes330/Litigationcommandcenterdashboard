import { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Mic, 
  Save, 
  X, 
  Calendar, 
  Users, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Tag,
  Sparkles,
  Search,
  Filter,
  Edit2,
  Trash2
} from 'lucide-react';
import { useCaseContext } from '../contexts/CaseContext';
import { toast } from 'sonner@2.0.3';

interface Log {
  id: string;
  date: string;
  title: string;
  content: string;
  audioUrl?: string;
  extractedEvents?: ExtractedEvent[];
  extractedPeople?: ExtractedPerson[];
  extractedIssues?: ExtractedIssue[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface ExtractedEvent {
  description: string;
  date?: string;
  location?: string;
  addedToTimeline: boolean;
}

interface ExtractedPerson {
  name: string;
  role?: string;
  addedToDirectory: boolean;
}

interface ExtractedIssue {
  description: string;
  priority: 'high' | 'medium' | 'low';
  flagged: boolean;
}

export function Logs() {
  const { caseData } = useCaseContext();
  const [logs, setLogs] = useState<Log[]>(() => {
    const saved = localStorage.getItem('wtp_logs');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCreating, setIsCreating] = useState(false);
  const [editingLog, setEditingLog] = useState<Log | null>(null);
  const [newLog, setNewLog] = useState({
    title: '',
    content: '',
    tags: [] as string[],
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [isExtracting, setIsExtracting] = useState(false);
  const [showExtractedData, setShowExtractedData] = useState<string | null>(null);

  // Save logs to localStorage
  const saveLogs = (updatedLogs: Log[]) => {
    setLogs(updatedLogs);
    localStorage.setItem('wtp_logs', JSON.stringify(updatedLogs));
  };

  // Create new log
  const handleCreateLog = () => {
    if (!newLog.title.trim() || !newLog.content.trim()) {
      toast.error('Please provide both title and content');
      return;
    }

    const log: Log = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title: newLog.title,
      content: newLog.content,
      tags: newLog.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveLogs([log, ...logs]);
    setNewLog({ title: '', content: '', tags: [] });
    setIsCreating(false);
    toast.success('Log entry saved!');
  };

  // Update existing log
  const handleUpdateLog = () => {
    if (!editingLog) return;

    const updatedLogs = logs.map(log =>
      log.id === editingLog.id
        ? { ...editingLog, updatedAt: new Date().toISOString() }
        : log
    );

    saveLogs(updatedLogs);
    setEditingLog(null);
    toast.success('Log updated!');
  };

  // Delete log
  const handleDeleteLog = (logId: string) => {
    if (confirm('Are you sure you want to delete this log entry?')) {
      saveLogs(logs.filter(log => log.id !== logId));
      toast.success('Log deleted');
    }
  };

  // AI Extraction (mock for now - will integrate with Gemini)
  const handleExtractData = async (logId: string) => {
    setIsExtracting(true);
    setShowExtractedData(logId);

    // Mock extraction - In production, this calls Gemini API
    setTimeout(() => {
      const log = logs.find(l => l.id === logId);
      if (!log) return;

      // Mock extracted data
      const extracted: Log = {
        ...log,
        extractedEvents: [
          {
            description: 'Supervised visit at DCF office',
            date: '2026-03-25',
            location: 'DCF Regional Office',
            addedToTimeline: false,
          },
        ],
        extractedPeople: [
          {
            name: 'Sarah Johnson',
            role: 'Case Manager (Children\'s Network)',
            addedToDirectory: false,
          },
        ],
        extractedIssues: [
          {
            description: 'Michael mentioned new school - need to follow up',
            priority: 'medium',
            flagged: false,
          },
        ],
      };

      const updatedLogs = logs.map(l => l.id === logId ? extracted : l);
      saveLogs(updatedLogs);
      setIsExtracting(false);
      toast.success('Data extracted! Review and add to your case.');
    }, 2000);
  };

  // Add extracted event to timeline
  const handleAddToTimeline = (logId: string, eventIndex: number) => {
    const updatedLogs = logs.map(log => {
      if (log.id === logId && log.extractedEvents) {
        const events = [...log.extractedEvents];
        events[eventIndex] = { ...events[eventIndex], addedToTimeline: true };
        return { ...log, extractedEvents: events };
      }
      return log;
    });
    saveLogs(updatedLogs);
    toast.success('Event added to timeline!');
  };

  // Add extracted person to directory
  const handleAddToDirectory = (logId: string, personIndex: number) => {
    const updatedLogs = logs.map(log => {
      if (log.id === logId && log.extractedPeople) {
        const people = [...log.extractedPeople];
        people[personIndex] = { ...people[personIndex], addedToDirectory: true };
        return { ...log, extractedPeople: people };
      }
      return log;
    });
    saveLogs(updatedLogs);
    toast.success('Person added to directory!');
  };

  // Flag issue
  const handleFlagIssue = (logId: string, issueIndex: number) => {
    const updatedLogs = logs.map(log => {
      if (log.id === logId && log.extractedIssues) {
        const issues = [...log.extractedIssues];
        issues[issueIndex] = { ...issues[issueIndex], flagged: !issues[issueIndex].flagged };
        return { ...log, extractedIssues: issues };
      }
      return log;
    });
    saveLogs(updatedLogs);
    toast.success('Issue flagged!');
  };

  // Add tag
  const handleAddTag = (tag: string) => {
    if (isCreating) {
      if (!newLog.tags.includes(tag)) {
        setNewLog({ ...newLog, tags: [...newLog.tags, tag] });
      }
    } else if (editingLog) {
      if (!editingLog.tags.includes(tag)) {
        setEditingLog({ ...editingLog, tags: [...editingLog.tags, tag] });
      }
    }
  };

  // Remove tag
  const handleRemoveTag = (tag: string) => {
    if (isCreating) {
      setNewLog({ ...newLog, tags: newLog.tags.filter(t => t !== tag) });
    } else if (editingLog) {
      setEditingLog({ ...editingLog, tags: editingLog.tags.filter(t => t !== tag) });
    }
  };

  // Get all unique tags
  const allTags = Array.from(new Set(logs.flatMap(log => log.tags)));

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = filterTag === 'all' || log.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  // Quick tag suggestions
  const quickTags = ['visit', 'call', 'email', 'hearing', 'incident', 'concern', 'progress', 'documentation'];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Case Logs</h1>
              <p className="text-sm text-gray-600">Personal recollections and case journal</p>
            </div>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Log Entry
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{logs.length}</div>
            <div className="text-sm text-gray-600">Total Entries</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {logs.reduce((sum, log) => sum + (log.extractedEvents?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Events Extracted</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {logs.reduce((sum, log) => sum + (log.extractedPeople?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">People Identified</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">
              {logs.reduce((sum, log) => sum + (log.extractedIssues?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Issues Flagged</div>
          </div>
        </div>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingLog) && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isCreating ? 'New Log Entry' : 'Edit Log Entry'}
            </h2>
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingLog(null);
                setNewLog({ title: '', content: '', tags: [] });
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={isCreating ? newLog.title : editingLog?.title || ''}
                onChange={(e) => {
                  if (isCreating) {
                    setNewLog({ ...newLog, title: e.target.value });
                  } else if (editingLog) {
                    setEditingLog({ ...editingLog, title: e.target.value });
                  }
                }}
                placeholder="e.g., Supervised Visit - March 25, 2026"
                className="input w-full"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={isCreating ? newLog.content : editingLog?.content || ''}
                onChange={(e) => {
                  if (isCreating) {
                    setNewLog({ ...newLog, content: e.target.value });
                  } else if (editingLog) {
                    setEditingLog({ ...editingLog, content: e.target.value });
                  }
                }}
                placeholder="Describe what happened, who was there, what was said, your observations, and any concerns..."
                rows={8}
                className="input w-full"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Write freely - AI will extract events, people, and issues for you!
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(isCreating ? newLog.tags : editingLog?.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm"
                  >
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {quickTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleAddTag(tag)}
                    className="px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-50 text-sm"
                    disabled={(isCreating ? newLog.tags : editingLog?.tags || []).includes(tag)}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={isCreating ? handleCreateLog : handleUpdateLog}
                className="btn btn-primary flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {isCreating ? 'Save Entry' : 'Update Entry'}
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingLog(null);
                  setNewLog({ title: '', content: '', tags: [] });
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      {!isCreating && !editingLog && (
        <div className="card p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search logs..."
                className="input w-full pl-10"
              />
            </div>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="input md:w-48"
            >
              <option value="all">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Log Entries */}
      {!isCreating && !editingLog && (
        <div className="space-y-4">
          {filteredLogs.length === 0 ? (
            <div className="card p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No log entries yet</h3>
              <p className="text-gray-600 mb-4">
                Start recording your case recollections and observations
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="btn btn-primary"
              >
                Create First Entry
              </button>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="card p-6">
                {/* Log Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{log.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(log.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!log.extractedEvents && (
                      <button
                        onClick={() => handleExtractData(log.id)}
                        className="btn btn-secondary btn-sm flex items-center gap-2"
                        disabled={isExtracting && showExtractedData === log.id}
                      >
                        <Sparkles className="w-4 h-4" />
                        {isExtracting && showExtractedData === log.id ? 'Extracting...' : 'Extract Data'}
                      </button>
                    )}
                    <button
                      onClick={() => setEditingLog(log)}
                      className="btn btn-ghost btn-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="btn btn-ghost btn-sm text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tags */}
                {log.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {log.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Content */}
                <p className="text-gray-700 whitespace-pre-line mb-4">{log.content}</p>

                {/* Extracted Data */}
                {(log.extractedEvents || log.extractedPeople || log.extractedIssues) && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      AI Extracted Data
                    </div>

                    {/* Events */}
                    {log.extractedEvents && log.extractedEvents.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">📅 Events</div>
                        <div className="space-y-2">
                          {log.extractedEvents.map((event, idx) => (
                            <div
                              key={idx}
                              className="flex items-start justify-between p-3 rounded-lg bg-blue-50 border border-blue-200"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{event.description}</div>
                                {event.date && (
                                  <div className="text-sm text-gray-600">Date: {event.date}</div>
                                )}
                                {event.location && (
                                  <div className="text-sm text-gray-600">Location: {event.location}</div>
                                )}
                              </div>
                              {!event.addedToTimeline ? (
                                <button
                                  onClick={() => handleAddToTimeline(log.id, idx)}
                                  className="btn btn-primary btn-sm ml-2"
                                >
                                  Add to Timeline
                                </button>
                              ) : (
                                <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* People */}
                    {log.extractedPeople && log.extractedPeople.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">👤 People</div>
                        <div className="space-y-2">
                          {log.extractedPeople.map((person, idx) => (
                            <div
                              key={idx}
                              className="flex items-start justify-between p-3 rounded-lg bg-green-50 border border-green-200"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{person.name}</div>
                                {person.role && (
                                  <div className="text-sm text-gray-600">{person.role}</div>
                                )}
                              </div>
                              {!person.addedToDirectory ? (
                                <button
                                  onClick={() => handleAddToDirectory(log.id, idx)}
                                  className="btn btn-primary btn-sm ml-2"
                                >
                                  Add to Directory
                                </button>
                              ) : (
                                <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Issues */}
                    {log.extractedIssues && log.extractedIssues.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">⚠️ Issues</div>
                        <div className="space-y-2">
                          {log.extractedIssues.map((issue, idx) => (
                            <div
                              key={idx}
                              className="flex items-start justify-between p-3 rounded-lg bg-orange-50 border border-orange-200"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="font-medium text-gray-900">{issue.description}</div>
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs ${
                                      issue.priority === 'high'
                                        ? 'bg-red-100 text-red-700'
                                        : issue.priority === 'medium'
                                        ? 'bg-orange-100 text-orange-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}
                                  >
                                    {issue.priority}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleFlagIssue(log.id, idx)}
                                className={`btn btn-sm ml-2 ${
                                  issue.flagged ? 'btn-primary' : 'btn-secondary'
                                }`}
                              >
                                {issue.flagged ? 'Flagged' : 'Flag'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
