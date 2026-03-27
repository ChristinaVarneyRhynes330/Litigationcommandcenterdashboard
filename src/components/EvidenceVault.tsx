import { useState } from 'react';
import { FileText, Headphones, Video, Image as ImageIcon, Download, Tag, Search, Plus, Printer, FolderOpen, Sparkles, Eye, X, User, Calendar, MapPin, DollarSign, MessageSquare, Loader2 } from 'lucide-react';
import { DocumentCard } from './illustrations/DocumentCard';
import { EmptyState } from './illustrations/EmptyState';
import { callGemini, AI_PROMPTS } from '../utils/gemini';
import { toast } from 'sonner';

type Category = 'all' | 'docs' | 'audio' | 'video' | 'photos';

interface ExtractedFact {
  type: 'name' | 'date' | 'location' | 'quote' | 'amount' | 'other';
  content: string;
  context?: string;
}

interface Exhibit {
  id: string;
  batesNumber: string;
  name: string;
  category: Category;
  dateAdded: string;
  size: string;
  tags: string[];
  extractedFacts?: ExtractedFact[];
}

interface EvidenceVaultProps {
  onAddEvidence?: (evidence: {
    description: string;
    date: string;
    type: string;
    tags?: string[];
  }) => void;
}

export function EvidenceVault({ onAddEvidence }: EvidenceVaultProps = {}) {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLabelGenerator, setShowLabelGenerator] = useState(false);
  const [extractingFactsFor, setExtractingFactsFor] = useState<string | null>(null);
  const [viewingFactsFor, setViewingFactsFor] = useState<Exhibit | null>(null);
  const [exhibits, setExhibits] = useState<Exhibit[]>([
    { id: '1', batesNumber: 'EX-001-0001', name: 'Employment Contract.pdf', category: 'docs', dateAdded: '2025-11-15', size: '2.3 MB', tags: ['Contract', 'Key Evidence'] },
    { id: '2', batesNumber: 'EX-001-0045', name: 'Email Thread - Project Alpha.pdf', category: 'docs', dateAdded: '2025-11-18', size: '1.1 MB', tags: ['Correspondence'] },
    { id: '3', batesNumber: 'EX-002-0001', name: 'Witness Interview - Jane Doe.mp3', category: 'audio', dateAdded: '2025-11-20', size: '45.2 MB', tags: ['Witness', 'Testimony'] },
    { id: '4', batesNumber: 'EX-003-0001', name: 'Security Footage - Lobby.mp4', category: 'video', dateAdded: '2025-11-22', size: '523 MB', tags: ['Surveillance', 'Key Evidence'] },
    { id: '5', batesNumber: 'EX-004-0001', name: 'Product Defect Photo 1.jpg', category: 'photos', dateAdded: '2025-11-25', size: '4.5 MB', tags: ['Physical Evidence'] },
    { id: '6', batesNumber: 'EX-001-0102', name: 'Financial Statements Q3.pdf', category: 'docs', dateAdded: '2025-11-28', size: '3.7 MB', tags: ['Financial', 'Discovery'] },
    { id: '7', batesNumber: 'EX-004-0012', name: 'Accident Scene Photo.jpg', category: 'photos', dateAdded: '2025-12-01', size: '6.1 MB', tags: ['Scene', 'Key Evidence'] },
  ]);

  const handleExtractFacts = async (exhibit: Exhibit) => {
    // Get API key from localStorage
    const stored = localStorage.getItem('we_the_parent_app_state_v1');
    let apiKey = '';
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        apiKey = parsed.apiKey || '';
      } catch (e) {
        console.error('Failed to get API key');
      }
    }

    if (!apiKey) {
      toast.error('API key required. Please configure in Settings.');
      return;
    }

    setExtractingFactsFor(exhibit.id);

    try {
      const prompt = `Analyze this evidence document and extract key facts in a structured format.

Document: ${exhibit.name}
Bates Number: ${exhibit.batesNumber}

Extract and categorize the following:

1. NAMES - All persons, organizations, entities mentioned
2. DATES - All dates, timelines, deadlines
3. LOCATIONS - Addresses, places, jurisdictions
4. QUOTES - Important verbatim statements (if any)
5. AMOUNTS - Dollar amounts, percentages, quantities
6. OTHER KEY FACTS - Critical information not fitting above categories

Format each fact as:
TYPE: [name/date/location/quote/amount/other]
CONTENT: [the fact itself]
CONTEXT: [brief explanation of relevance]

Focus on legally relevant information for dependency court proceedings.`;

      const response = await callGemini(prompt, AI_PROMPTS.evidence, apiKey);

      // Parse the AI response into structured facts
      const facts = parseFactsFromAI(response);

      // Update the exhibit with extracted facts
      setExhibits(exhibits.map(e => 
        e.id === exhibit.id ? { ...e, extractedFacts: facts } : e
      ));

      setViewingFactsFor({ ...exhibit, extractedFacts: facts });
      toast.success(`Extracted ${facts.length} facts from ${exhibit.name}`);
    } catch (error) {
      toast.error('Failed to extract facts. Please try again.');
      console.error('Fact extraction error:', error);
    } finally {
      setExtractingFactsFor(null);
    }
  };

  const parseFactsFromAI = (aiResponse: string): ExtractedFact[] => {
    const facts: ExtractedFact[] = [];
    const lines = aiResponse.split('\n');
    let currentFact: Partial<ExtractedFact> = {};

    lines.forEach(line => {
      const trimmed = line.trim();
      
      if (trimmed.toLowerCase().startsWith('type:')) {
        if (currentFact.type && currentFact.content) {
          facts.push(currentFact as ExtractedFact);
        }
        const typeMatch = trimmed.match(/type:\s*(\w+)/i);
        if (typeMatch) {
          currentFact = { type: typeMatch[1].toLowerCase() as ExtractedFact['type'] };
        }
      } else if (trimmed.toLowerCase().startsWith('content:')) {
        currentFact.content = trimmed.replace(/content:\s*/i, '');
      } else if (trimmed.toLowerCase().startsWith('context:')) {
        currentFact.context = trimmed.replace(/context:\s*/i, '');
      }
    });

    // Add last fact
    if (currentFact.type && currentFact.content) {
      facts.push(currentFact as ExtractedFact);
    }

    return facts;
  };

  const getFactIcon = (type: string) => {
    switch (type) {
      case 'name': return <User className="w-4 h-4" />;
      case 'date': return <Calendar className="w-4 h-4" />;
      case 'location': return <MapPin className="w-4 h-4" />;
      case 'quote': return <MessageSquare className="w-4 h-4" />;
      case 'amount': return <DollarSign className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const getFactColor = (type: string) => {
    switch (type) {
      case 'name': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'date': return 'bg-green-50 text-green-700 border-green-200';
      case 'location': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'quote': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'amount': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const categories = [
    { id: 'all' as Category, label: 'All', icon: FileText, count: exhibits.length },
    { id: 'docs' as Category, label: 'Docs', icon: FileText, count: exhibits.filter(e => e.category === 'docs').length },
    { id: 'audio' as Category, label: 'Audio', icon: Headphones, count: exhibits.filter(e => e.category === 'audio').length },
    { id: 'video' as Category, label: 'Video', icon: Video, count: exhibits.filter(e => e.category === 'video').length },
    { id: 'photos' as Category, label: 'Photos', icon: ImageIcon, count: exhibits.filter(e => e.category === 'photos').length },
  ];

  const filteredExhibits = exhibits.filter(exhibit => {
    const matchesCategory = activeCategory === 'all' || exhibit.category === activeCategory;
    const matchesSearch = exhibit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exhibit.batesNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Simplified Hero */}
      <div className="card p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 bg-rose-100 border border-rose-200">
              <FolderOpen className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-semibold tracking-wide text-rose-700">EVIDENCE MANAGEMENT</span>
            </div>
            <h1 className="text-gray-900 text-3xl font-semibold mb-2">Evidence Vault</h1>
            <p className="text-gray-600 mb-6">Organize exhibits with professional Bates stamping & cataloging</p>
            
            <div className="flex gap-6 mb-6">
              <div>
                <div className="text-4xl font-bold text-gray-900 mb-1">{exhibits.length}</div>
                <div className="text-xs text-gray-600 uppercase tracking-wider">Total Exhibits</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-rose-600 mb-1">{exhibits.filter(e => e.tags.includes('Key Evidence')).length}</div>
                <div className="text-xs text-gray-600 uppercase tracking-wider">Key Evidence</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900 mb-1">{new Set(exhibits.flatMap(e => e.tags)).size}</div>
                <div className="text-xs text-gray-600 uppercase tracking-wider">Categories</div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="btn btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Upload Exhibit
              </button>
              <button className="btn btn-secondary flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Print Index
              </button>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-4">
              <DocumentCard type="pdf" size={100} />
              <DocumentCard type="image" size={100} />
              <DocumentCard type="video" size={100} />
              <DocumentCard type="audio" size={100} />
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills & Search Bar */}
      <div className="glass-card p-6">
        <div className="flex flex-col gap-4">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`pill-button flex items-center gap-2 whitespace-nowrap text-sm ${
                    isActive
                      ? 'bg-gradient-rose-r text-white'
                      : 'bg-white/40 text-[#36454F] hover:bg-white/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.label}</span>
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search exhibits by name or Bates number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
        </div>
      </div>

      {/* Bates Label Generator */}
      {showLabelGenerator && (
        <div className="glass-card p-6">
          <h3 className="mb-4">Exhibit Label Generator</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Bates Number</label>
              <input 
                type="text" 
                placeholder="EX-001-0001" 
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Exhibit Name</label>
              <input 
                type="text" 
                placeholder="Employment Contract" 
                className="input w-full"
              />
            </div>
          </div>
          <button className="pill-button bg-gradient-rose-r text-white">
            Generate & Print Label
          </button>
        </div>
      )}

      {/* Exhibit List */}
      <div className="glass-card">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-gray-900">Exhibits ({filteredExhibits.length})</h3>
          <button 
            onClick={() => setShowLabelGenerator(!showLabelGenerator)}
            className="btn btn-sm btn-outline flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Generate Labels
          </button>
        </div>
        
        <div className="p-6">
          {filteredExhibits.length === 0 ? (
            <div className="text-center py-12">
              <EmptyState className="w-24 h-24 mx-auto mb-4 text-gray-300" />
              <h3 className="text-gray-900 mb-2">No exhibits found</h3>
              <p className="text-sm text-gray-500">Try adjusting your filters or upload new evidence</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExhibits.map((exhibit) => {
                const Icon = categories.find(c => c.id === exhibit.category)?.icon || FileText;
                const isExtracting = extractingFactsFor === exhibit.id;
                
                return (
                  <div key={exhibit.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-white/40 rounded-lg hover:bg-white/60 transition-all">
                    <div className="flex items-center gap-3 md:gap-4 flex-1 w-full">
                      <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-gradient-rose flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="badge badge-primary font-mono text-xs">
                            {exhibit.batesNumber}
                          </span>
                          <p className="font-medium text-gray-900 truncate">{exhibit.name}</p>
                          {exhibit.extractedFacts && exhibit.extractedFacts.length > 0 && (
                            <span className="badge bg-brand-teal text-white text-xs">
                              {exhibit.extractedFacts.length} Facts
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span>{exhibit.dateAdded}</span>
                          <span>•</span>
                          <span>{exhibit.size}</span>
                          <span>•</span>
                          <div className="flex gap-2">
                            {exhibit.tags.map(tag => (
                              <span key={tag} className="badge badge-outline text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                      {exhibit.extractedFacts && exhibit.extractedFacts.length > 0 ? (
                        <button 
                          onClick={() => setViewingFactsFor(exhibit)}
                          className="btn btn-sm btn-secondary flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Facts
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleExtractFacts(exhibit)}
                          disabled={isExtracting}
                          className="btn btn-sm btn-secondary flex items-center gap-2"
                        >
                          {isExtracting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Extracting...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              Extract Facts
                            </>
                          )}
                        </button>
                      )}
                      <button className="btn btn-sm btn-outline flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Facts Modal */}
      {viewingFactsFor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card p-0 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-brand-rose/10 to-brand-teal/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Extracted Facts</h2>
                  <p className="text-gray-600 mb-1">{viewingFactsFor.name}</p>
                  <span className="badge badge-primary font-mono text-xs">{viewingFactsFor.batesNumber}</span>
                </div>
                <button
                  onClick={() => setViewingFactsFor(null)}
                  className="btn btn-ghost">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {viewingFactsFor.extractedFacts && viewingFactsFor.extractedFacts.length > 0 ? (
                <div className="space-y-4">
                  {/* Group facts by type */}
                  {['name', 'date', 'location', 'quote', 'amount', 'other'].map(type => {
                    const factsOfType = viewingFactsFor.extractedFacts?.filter(f => f.type === type) || [];
                    if (factsOfType.length === 0) return null;

                    const typeLabels: Record<string, string> = {
                      name: '👤 Names & Entities',
                      date: '📅 Dates & Timelines',
                      location: '📍 Locations',
                      quote: '💬 Key Quotes',
                      amount: '💰 Amounts & Figures',
                      other: '📋 Other Key Facts'
                    };

                    return (
                      <div key={type} className="space-y-3">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          {getFactIcon(type)}
                          {typeLabels[type]} ({factsOfType.length})
                        </h3>
                        <div className="space-y-2">
                          {factsOfType.map((fact, idx) => (
                            <div
                              key={idx}
                              className={`p-4 rounded-lg border ${getFactColor(type)}`}
                            >
                              <p className="font-medium mb-1">{fact.content}</p>
                              {fact.context && (
                                <p className="text-sm opacity-80">{fact.context}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No facts extracted yet</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-2">
              <button
                onClick={() => window.print()}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Facts Report
              </button>
              <button
                onClick={() => setViewingFactsFor(null)}
                className="btn btn-ghost ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}