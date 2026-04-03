import { useState } from 'react';
import { Toaster } from 'sonner@2.0.3';
import { CaseProvider } from './contexts/CaseContext';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { Dashboard } from './components/Dashboard';
import { CaseProfile } from './components/CaseProfile';
import { EvidenceVault } from './components/EvidenceVault';
import { CommandCenter } from './components/CommandCenter';
import { Logs } from './components/Logs';
import { People } from './components/People';
import { GlobalSearch } from './components/GlobalSearch';
import { AlertSystem } from './components/AlertSystem';
import { StrategyEngine } from './components/StrategyEngine';
import { Logistics } from './components/Logistics';
import { HearingMode } from './components/HearingMode';
import { Finance } from './components/Finance';
import { LawLibrary } from './components/LawLibrary';
import { Binder } from './components/Binder';
import { TimelineBuilder } from './components/TimelineBuilder';
import { FoundationBuilder } from './components/FoundationBuilder';
import { CourtroomPresentation } from './components/CourtroomPresentation';
import { Settings } from './components/Settings';

type View = 
  | 'dashboard' 
  | 'case-profile' 
  | 'evidence' 
  | 'command' 
  | 'logs' 
  | 'people' 
  | 'search' 
  | 'alerts' 
  | 'strategy' 
  | 'logistics' 
  | 'hearing' 
  | 'finance' 
  | 'library' 
  | 'binder' 
  | 'timeline' 
  | 'foundation' 
  | 'presentation';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'case-profile':
        return <CaseProfile />;
      case 'evidence':
        return <EvidenceVault />;
      case 'command':
        return <CommandCenter apiKey={apiKey} onNavigate={setCurrentView} />;
      case 'logs':
        return <Logs />;
      case 'people':
        return <People />;
      case 'search':
        return <GlobalSearch onNavigate={setCurrentView} />;
      case 'alerts':
        return <AlertSystem />;
      case 'strategy':
        return <StrategyEngine apiKey={apiKey} />;
      case 'logistics':
        return <Logistics />;
      case 'hearing':
        return <HearingMode />;
      case 'finance':
        return <Finance />;
      case 'library':
        return <LawLibrary />;
      case 'binder':
        return <Binder />;
      case 'timeline':
        return <TimelineBuilder />;
      case 'foundation':
        return <FoundationBuilder />;
      case 'presentation':
        return <CourtroomPresentation />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <CaseProvider>
      <Toaster position="top-right" />
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar currentView={currentView} onNavigate={setCurrentView} />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <MobileNav currentView={currentView} onNavigate={setCurrentView} />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {renderView()}
        </main>

        {/* Settings Modal */}
        {showSettings && (
          <Settings
            apiKey={apiKey}
            onApiKeyChange={handleApiKeyChange}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </CaseProvider>
  );
}
