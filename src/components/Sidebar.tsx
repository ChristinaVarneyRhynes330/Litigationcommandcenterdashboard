import { 
  LayoutDashboard, 
  FolderOpen, 
  Bot, 
  Truck, 
  Gavel, 
  DollarSign, 
  BookOpen,
  Scale,
  Upload,
  BookMarked,
  FileText,
  Clock,
  ScaleIcon,
  Presentation
} from 'lucide-react';

type View = 'dashboard' | 'case-profile' | 'evidence' | 'ai-team' | 'logistics' | 'hearing' | 'finance' | 'library' | 'discovery' | 'binder' | 'timeline' | 'foundation' | 'presentation';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const navItems = [
  { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'case-profile' as View, label: 'Case Profile', icon: FileText },
  { id: 'timeline' as View, label: 'Timeline', icon: Clock },
  { id: 'evidence' as View, label: 'Evidence Vault', icon: FolderOpen },
  { id: 'foundation' as View, label: 'Foundation Builder', icon: ScaleIcon },
  { id: 'presentation' as View, label: 'Presentation', icon: Presentation },
  { id: 'ai-team' as View, label: 'AI Legal Team', icon: Bot },
  { id: 'logistics' as View, label: 'Logistics', icon: Truck },
  { id: 'hearing' as View, label: 'Hearing Mode', icon: Gavel },
  { id: 'finance' as View, label: 'Finance', icon: DollarSign },
  { id: 'library' as View, label: 'Law Library', icon: BookOpen },
  { id: 'discovery' as View, label: 'Discovery', icon: Upload },
  { id: 'binder' as View, label: 'The Binder', icon: BookMarked },
];

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col" style={{ boxShadow: 'var(--elevation-1)' }}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ 
            background: 'linear-gradient(135deg, #9F5166 0%, #8B4757 100%)',
            boxShadow: '0 4px 12px rgba(159, 81, 102, 0.3)'
          }}>
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-gray-900 truncate">We The Parent™</h2>
            <p className="text-xs text-gray-600">Legal OS</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      
      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="space-y-2 text-center">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Pro Se Dependency</div>
          <div className="text-sm font-medium text-brand-rose">Florida Family Law</div>
        </div>
      </div>
    </aside>
  );
}