import { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Calendar, 
  FileText, 
  Clock,
  CheckCircle,
  Bell,
  Filter,
  Plus,
  Trash2
} from 'lucide-react';
import { useCaseContext } from '../contexts/CaseContext';
import { toast } from 'sonner@2.0.3';

interface Alert {
  id: string;
  type: 'deadline' | 'risk' | 'task' | 'system' | 'missing';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionUrl?: string;
  actionLabel?: string;
  dismissed: boolean;
  dueDate?: string;
  createdAt: string;
}

interface AlertSystemProps {
  onNavigate?: (view: string) => void;
}

export function AlertSystem({ onNavigate }: AlertSystemProps) {
  const { caseData } = useCaseContext();
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem('wtp_alerts');
    return saved ? JSON.parse(saved) : [];
  });
  const [showDismissed, setShowDismissed] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [newAlert, setNewAlert] = useState<Partial<Alert>>({
    type: 'task',
    severity: 'medium',
    title: '',
    description: '',
    dueDate: '',
  });

  // Save alerts to localStorage
  const saveAlerts = (updatedAlerts: Alert[]) => {
    setAlerts(updatedAlerts);
    localStorage.setItem('wtp_alerts', JSON.stringify(updatedAlerts));
  };

  // Generate automatic alerts based on case data
  useEffect(() => {
    const autoAlerts: Alert[] = [];

    // Check for upcoming deadlines (from timeline)
    const timeline = JSON.parse(localStorage.getItem('wtp_timeline') || '[]');
    const today = new Date();
    const upcomingDays = 7;

    timeline.forEach((event: any) => {
      if (event.type === 'hearing' || event.type === 'deadline') {
        const eventDate = new Date(event.date);
        const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntil >= 0 && daysUntil <= upcomingDays) {
          const existingAlert = alerts.find(a => 
            a.title.includes(event.title) && !a.dismissed
          );

          if (!existingAlert) {
            autoAlerts.push({
              id: `auto-deadline-${event.id}`,
              type: 'deadline',
              severity: daysUntil <= 3 ? 'high' : 'medium',
              title: `Upcoming: ${event.title}`,
              description: `${event.title} is in ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}`,
              dueDate: event.date,
              dismissed: false,
              createdAt: new Date().toISOString(),
              actionUrl: 'timeline',
              actionLabel: 'View in Timeline',
            });
          }
        }
      }
    });

    // Check for missing evidence
    const evidence = JSON.parse(localStorage.getItem('wtp_evidence') || '[]');
    if (evidence.length === 0) {
      const existingAlert = alerts.find(a => a.title.includes('No evidence') && !a.dismissed);
      if (!existingAlert) {
        autoAlerts.push({
          id: 'auto-missing-evidence',
          type: 'missing',
          severity: 'medium',
          title: 'No evidence uploaded',
          description: 'Start building your evidence vault to strengthen your case',
          dismissed: false,
          createdAt: new Date().toISOString(),
          actionUrl: 'evidence',
          actionLabel: 'Go to Evidence Vault',
        });
      }
    }

    // Check for incomplete case profile
    if (!caseData.caseNumber || !caseData.children || caseData.children.length === 0) {
      const existingAlert = alerts.find(a => a.title.includes('Complete Case Profile') && !a.dismissed);
      if (!existingAlert) {
        autoAlerts.push({
          id: 'auto-incomplete-profile',
          type: 'system',
          severity: 'high',
          title: 'Complete Case Profile',
          description: 'Add case details and children information to get personalized AI assistance',
          dismissed: false,
          createdAt: new Date().toISOString(),
          actionUrl: 'case-profile',
          actionLabel: 'Complete Profile',
        });
      }
    }

    // Check for GAL report deadline (example risk alert)
    const logs = JSON.parse(localStorage.getItem('wtp_logs') || '[]');
    const hasGALMention = logs.some((log: any) => 
      log.content?.toLowerCase().includes('gal') || log.title?.toLowerCase().includes('gal')
    );
    
    if (hasGALMention && evidence.length < 5) {
      const existingAlert = alerts.find(a => a.title.includes('GAL Evidence') && !a.dismissed);
      if (!existingAlert) {
        autoAlerts.push({
          id: 'auto-gal-evidence',
          type: 'risk',
          severity: 'high',
          title: 'GAL Evidence Preparation',
          description: 'You have limited evidence uploaded. GAL may request documentation of your progress.',
          dismissed: false,
          createdAt: new Date().toISOString(),
          actionUrl: 'evidence',
          actionLabel: 'Upload Evidence',
        });
      }
    }

    if (autoAlerts.length > 0) {
      const mergedAlerts = [...alerts, ...autoAlerts];
      // Remove duplicates
      const uniqueAlerts = mergedAlerts.filter((alert, index, self) =>
        index === self.findIndex((a) => a.id === alert.id)
      );
      saveAlerts(uniqueAlerts);
    }
  }, [caseData]);

  // Create manual alert
  const handleCreateAlert = () => {
    if (!newAlert.title?.trim()) {
      toast.error('Please provide an alert title');
      return;
    }

    const alert: Alert = {
      id: `alert-${Date.now()}`,
      type: newAlert.type as Alert['type'],
      severity: newAlert.severity as Alert['severity'],
      title: newAlert.title,
      description: newAlert.description || '',
      dueDate: newAlert.dueDate,
      dismissed: false,
      createdAt: new Date().toISOString(),
    };

    saveAlerts([alert, ...alerts]);
    setNewAlert({
      type: 'task',
      severity: 'medium',
      title: '',
      description: '',
      dueDate: '',
    });
    setIsCreating(false);
    toast.success('Alert created!');
  };

  // Dismiss alert
  const handleDismiss = (alertId: string) => {
    const updatedAlerts = alerts.map(alert =>
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    );
    saveAlerts(updatedAlerts);
    toast.success('Alert dismissed');
  };

  // Delete alert
  const handleDelete = (alertId: string) => {
    saveAlerts(alerts.filter(alert => alert.id !== alertId));
    toast.success('Alert deleted');
  };

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    if (!showDismissed && alert.dismissed) return false;
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    if (filterType !== 'all' && alert.type !== filterType) return false;
    return true;
  });

  // Sort by severity and date
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    // First by dismissed status
    if (a.dismissed !== b.dismissed) return a.dismissed ? 1 : -1;
    
    // Then by severity
    const severityOrder = { high: 0, medium: 1, low: 2 };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    
    // Then by due date (if exists)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    // Finally by created date
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const activeAlerts = alerts.filter(a => !a.dismissed);
  const highPriorityAlerts = activeAlerts.filter(a => a.severity === 'high');

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'deadline': return Calendar;
      case 'risk': return AlertTriangle;
      case 'task': return CheckCircle;
      case 'missing': return FileText;
      default: return Info;
    }
  };

  const getSeverityStyles = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          badge: 'bg-red-100 text-red-700',
        };
      case 'medium':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: 'text-orange-600',
          badge: 'bg-orange-100 text-orange-700',
        };
      case 'low':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-700',
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Alert Center</h1>
              <p className="text-sm text-gray-600">Deadlines, risks, and reminders</p>
            </div>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Alert
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">{highPriorityAlerts.length}</div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">{activeAlerts.length}</div>
            <div className="text-sm text-gray-600">Active Alerts</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {alerts.filter(a => a.dismissed).length}
            </div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {alerts.filter(a => a.type === 'deadline' && !a.dismissed).length}
            </div>
            <div className="text-sm text-gray-600">Deadlines</div>
          </div>
        </div>
      </div>

      {/* Create Alert Form */}
      {isCreating && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Create New Alert</h2>
            <button
              onClick={() => setIsCreating(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={newAlert.title}
                onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                placeholder="e.g., File response to motion"
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={newAlert.type}
                onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as Alert['type'] })}
                className="input w-full"
              >
                <option value="task">Task</option>
                <option value="deadline">Deadline</option>
                <option value="risk">Risk</option>
                <option value="missing">Missing Data</option>
                <option value="system">System</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={newAlert.severity}
                onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value as Alert['severity'] })}
                className="input w-full"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={newAlert.dueDate}
                onChange={(e) => setNewAlert({ ...newAlert, dueDate: e.target.value })}
                className="input w-full"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newAlert.description}
                onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                placeholder="Additional details..."
                rows={4}
                className="input w-full"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={handleCreateAlert}
              className="btn btn-primary"
            >
              Create Alert
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      {!isCreating && (
        <div className="card p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1 flex gap-4">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="input"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input"
              >
                <option value="all">All Types</option>
                <option value="deadline">Deadlines</option>
                <option value="risk">Risks</option>
                <option value="task">Tasks</option>
                <option value="missing">Missing Data</option>
                <option value="system">System</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={showDismissed}
                onChange={(e) => setShowDismissed(e.target.checked)}
                className="rounded border-gray-300"
              />
              Show dismissed
            </label>
          </div>
        </div>
      )}

      {/* Alerts List */}
      {!isCreating && (
        <div className="space-y-4">
          {sortedAlerts.length === 0 ? (
            <div className="card p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {alerts.length === 0 ? 'No alerts yet' : 'No alerts match your filters'}
              </h3>
              <p className="text-gray-600">
                {alerts.length === 0 
                  ? 'Alerts will appear here automatically or you can create custom reminders'
                  : 'Try adjusting your filters'
                }
              </p>
            </div>
          ) : (
            sortedAlerts.map((alert) => {
              const AlertIcon = getAlertIcon(alert.type);
              const styles = getSeverityStyles(alert.severity);

              return (
                <div
                  key={alert.id}
                  className={`card p-6 border-2 ${styles.border} ${styles.bg} ${
                    alert.dismissed ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-white flex items-center justify-center flex-shrink-0`}>
                      <AlertIcon className={`w-6 h-6 ${styles.icon}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900">
                              {alert.title}
                            </h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles.badge}`}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                            {alert.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(alert.dueDate).toLocaleDateString()}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(alert.createdAt).toLocaleDateString()}
                            </span>
                            <span className={`px-2 py-0.5 rounded bg-white text-gray-700`}>
                              {alert.type}
                            </span>
                          </div>
                        </div>

                        {!alert.dismissed && (
                          <button
                            onClick={() => handleDismiss(alert.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        {alert.actionUrl && !alert.dismissed && (
                          <button
                            onClick={() => onNavigate?.(alert.actionUrl!)}
                            className="btn btn-primary btn-sm"
                          >
                            {alert.actionLabel || 'Take Action'}
                          </button>
                        )}
                        {alert.dismissed && (
                          <button
                            onClick={() => handleDelete(alert.id)}
                            className="btn btn-ghost btn-sm text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}