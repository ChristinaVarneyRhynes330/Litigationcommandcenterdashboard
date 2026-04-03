import { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  Calendar, 
  FileText, 
  Users, 
  FolderOpen, 
  MessageSquare,
  Clock,
  Tag,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useCaseContext } from '../contexts/CaseContext';

interface SearchResult {
  id: string;
  type: 'event' | 'evidence' | 'person' | 'log' | 'conversation' | 'fact';
  title: string;
  description: string;
  date?: string;
  icon: any;
  color: string;
  metadata?: Record<string, string>;
  matchedText?: string;
}

interface GlobalSearchProps {
  onNavigate?: (view: string, id?: string) => void;
}

export function GlobalSearch({ onNavigate }: GlobalSearchProps) {
  const { caseData } = useCaseContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('wtp_recent_searches');
    return saved ? JSON.parse(saved) : [];
  });

  const filters = [
    { id: 'all', label: 'All', icon: Search },
    { id: 'event', label: 'Timeline', icon: Calendar },
    { id: 'evidence', label: 'Evidence', icon: FolderOpen },
    { id: 'person', label: 'People', icon: Users },
    { id: 'log', label: 'Logs', icon: FileText },
    { id: 'conversation', label: 'AI Chats', icon: MessageSquare },
  ];

  // Perform search
  const performSearch = (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const lowerTerm = term.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search Timeline Events
    const timeline = JSON.parse(localStorage.getItem('wtp_timeline') || '[]');
    timeline.forEach((event: any) => {
      if (
        event.title?.toLowerCase().includes(lowerTerm) ||
        event.description?.toLowerCase().includes(lowerTerm) ||
        event.location?.toLowerCase().includes(lowerTerm)
      ) {
        searchResults.push({
          id: event.id,
          type: 'event',
          title: event.title,
          description: event.description || 'No description',
          date: event.date,
          icon: Calendar,
          color: 'blue',
          metadata: {
            Date: new Date(event.date).toLocaleDateString(),
            Type: event.type || 'Event',
          },
          matchedText: event.description?.substring(0, 100),
        });
      }
    });

    // Search Evidence
    const evidence = JSON.parse(localStorage.getItem('wtp_evidence') || '[]');
    evidence.forEach((item: any) => {
      if (
        item.title?.toLowerCase().includes(lowerTerm) ||
        item.description?.toLowerCase().includes(lowerTerm) ||
        item.batesNumber?.toLowerCase().includes(lowerTerm)
      ) {
        searchResults.push({
          id: item.id,
          type: 'evidence',
          title: item.title,
          description: item.description || 'No description',
          date: item.dateAdded,
          icon: FolderOpen,
          color: 'purple',
          metadata: {
            'Bates #': item.batesNumber,
            Type: item.type,
          },
          matchedText: item.description?.substring(0, 100),
        });
      }
    });

    // Search People
    const people = JSON.parse(localStorage.getItem('wtp_people') || '[]');
    people.forEach((person: any) => {
      if (
        person.name?.toLowerCase().includes(lowerTerm) ||
        person.role?.toLowerCase().includes(lowerTerm) ||
        person.organization?.toLowerCase().includes(lowerTerm) ||
        person.notes?.toLowerCase().includes(lowerTerm)
      ) {
        searchResults.push({
          id: person.id,
          type: 'person',
          title: person.name,
          description: person.role,
          icon: Users,
          color: 'teal',
          metadata: {
            Role: person.role,
            Organization: person.organization || 'N/A',
          },
          matchedText: person.notes?.substring(0, 100),
        });
      }
    });

    // Search Logs
    const logs = JSON.parse(localStorage.getItem('wtp_logs') || '[]');
    logs.forEach((log: any) => {
      if (
        log.title?.toLowerCase().includes(lowerTerm) ||
        log.content?.toLowerCase().includes(lowerTerm)
      ) {
        searchResults.push({
          id: log.id,
          type: 'log',
          title: log.title,
          description: log.content?.substring(0, 100) + '...',
          date: log.date,
          icon: FileText,
          color: 'orange',
          metadata: {
            Date: new Date(log.date).toLocaleDateString(),
            Tags: log.tags?.join(', ') || 'None',
          },
          matchedText: log.content?.substring(0, 100),
        });
      }
    });

    // Search Extracted Facts
    const facts = JSON.parse(localStorage.getItem('wtp_extracted_facts') || '[]');
    facts.forEach((fact: any) => {
      if (fact.content?.toLowerCase().includes(lowerTerm)) {
        searchResults.push({
          id: fact.id,
          type: 'fact',
          title: `Fact from ${fact.source}`,
          description: fact.content,
          date: fact.extractedAt,
          icon: Tag,
          color: 'green',
          metadata: {
            Type: fact.type,
            Source: fact.source,
          },
          matchedText: fact.content?.substring(0, 100),
        });
      }
    });

    // Filter by selected type
    const filtered = selectedFilter === 'all' 
      ? searchResults 
      : searchResults.filter(r => r.type === selectedFilter);

    // Sort by relevance (date, then alphabetically)
    filtered.sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return a.title.localeCompare(b.title);
    });

    setResults(filtered);
    setIsSearching(false);

    // Save to recent searches
    if (term.trim() && !recentSearches.includes(term.trim())) {
      const updated = [term.trim(), ...recentSearches.slice(0, 9)];
      setRecentSearches(updated);
      localStorage.setItem('wtp_recent_searches', JSON.stringify(updated));
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedFilter]);

  const handleResultClick = (result: SearchResult) => {
    // Navigate to the appropriate view
    switch (result.type) {
      case 'event':
        onNavigate?.('timeline', result.id);
        break;
      case 'evidence':
        onNavigate?.('evidence', result.id);
        break;
      case 'person':
        onNavigate?.('people', result.id);
        break;
      case 'log':
        onNavigate?.('logs', result.id);
        break;
      default:
        break;
    }
  };

  const handleRecentSearch = (term: string) => {
    setSearchTerm(term);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('wtp_recent_searches');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center shadow-lg">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Global Search</h1>
            <p className="text-sm text-gray-600">Search across all case data</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search everything... (names, dates, events, documents, notes)"
            className="input w-full pl-12 pr-12 py-4 text-lg"
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = selectedFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-brand-teal text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{filter.label}</span>
                {isActive && results.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                    {results.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Searches */}
      {!searchTerm && recentSearches.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase">Recent Searches</h3>
            <button
              onClick={clearRecentSearches}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term, idx) => (
              <button
                key={idx}
                onClick={() => handleRecentSearch(term)}
                className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 flex items-center gap-2"
              >
                <Clock className="w-3 h-3" />
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchTerm && (
        <div className="card p-6">
          {isSearching ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal mx-auto mb-4"></div>
              <p className="text-gray-600">Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">
                Try different keywords or check your spelling
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {results.length} {results.length === 1 ? 'result' : 'results'} for "{searchTerm}"
                </h3>
              </div>

              <div className="space-y-3">
                {results.map((result) => {
                  const Icon = result.icon;
                  return (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-brand-teal hover:bg-brand-teal/5 transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg bg-${result.color}-100 flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className={`w-5 h-5 text-${result.color}-600`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 group-hover:text-brand-teal truncate">
                              {result.title}
                            </h4>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-teal flex-shrink-0" />
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {result.description}
                          </p>
                          {result.metadata && (
                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                              {Object.entries(result.metadata).map(([key, value]) => (
                                <span key={key}>
                                  <span className="font-medium">{key}:</span> {value}
                                </span>
                              ))}
                            </div>
                          )}
                          {result.matchedText && (
                            <div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-gray-700 italic">
                              "...{result.matchedText}..."
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Tips */}
      {!searchTerm && recentSearches.length === 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Search Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-600 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Timeline Events</h4>
              <p className="text-sm text-gray-600">
                Search by date, location, or event description
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <FolderOpen className="w-8 h-8 text-purple-600 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Evidence</h4>
              <p className="text-sm text-gray-600">
                Find documents by title, Bates number, or content
              </p>
            </div>
            <div className="p-4 bg-teal-50 rounded-lg">
              <Users className="w-8 h-8 text-teal-600 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">People</h4>
              <p className="text-sm text-gray-600">
                Search by name, role, or organization
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <FileText className="w-8 h-8 text-orange-600 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Logs</h4>
              <p className="text-sm text-gray-600">
                Find entries by title, content, or tags
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
