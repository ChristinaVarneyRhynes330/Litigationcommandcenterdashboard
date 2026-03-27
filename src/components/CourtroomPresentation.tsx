import { useState, useEffect } from 'react';
import { 
  Presentation, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Image as ImageIcon,
  FileText,
  Quote,
  BarChart3,
  Maximize2,
  Eye,
  Trash2,
  GripVertical,
  Sparkles,
  Download,
  Printer
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Slide {
  id: string;
  type: 'title' | 'exhibit' | 'quote' | 'facts' | 'chart' | 'argument';
  title: string;
  content: string;
  batesNumber?: string;
  imageUrl?: string;
  notes?: string;
  backgroundColor?: string;
}

interface PresentationData {
  id: string;
  name: string;
  caseTitle: string;
  slides: Slide[];
  createdAt: string;
}

const STORAGE_KEY = 'we_the_parent_presentations_v1';

export function CourtroomPresentation() {
  const [presentations, setPresentations] = useState<PresentationData[]>([]);
  const [currentPresentation, setCurrentPresentation] = useState<PresentationData | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPresentationName, setNewPresentationName] = useState('');
  const [isAddingSlide, setIsAddingSlide] = useState(false);
  const [newSlide, setNewSlide] = useState<Partial<Slide>>({
    type: 'title',
    title: '',
    content: '',
  });

  // Load presentations from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPresentations(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load presentations');
      }
    }
  }, []);

  // Save presentations to localStorage
  useEffect(() => {
    if (presentations.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presentations));
    }
  }, [presentations]);

  const slideTypes = [
    { value: 'title', label: 'Title Slide', icon: FileText, color: '#9F5166' },
    { value: 'exhibit', label: 'Exhibit Display', icon: ImageIcon, color: '#24bca3' },
    { value: 'quote', label: 'Key Quote', icon: Quote, color: '#8e9775' },
    { value: 'facts', label: 'Facts List', icon: FileText, color: '#6B7280' },
    { value: 'chart', label: 'Visual Chart', icon: BarChart3, color: '#F59E0B' },
    { value: 'argument', label: 'Argument Points', icon: Sparkles, color: '#8B5CF6' },
  ];

  const handleCreatePresentation = () => {
    if (!newPresentationName.trim()) {
      toast.error('Presentation name is required');
      return;
    }

    // Get case data from localStorage
    let caseTitle = 'My Case';
    const stored = localStorage.getItem('we_the_parent_case_data_v1');
    if (stored) {
      try {
        const caseData = JSON.parse(stored);
        caseTitle = caseData.caseName || 'My Case';
      } catch (e) {
        console.error('Could not load case data');
      }
    }

    const newPresentation: PresentationData = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newPresentationName,
      caseTitle,
      slides: [
        {
          id: '1',
          type: 'title',
          title: newPresentationName,
          content: caseTitle,
          backgroundColor: '#0a0d1a',
        }
      ],
      createdAt: new Date().toISOString(),
    };

    setPresentations([...presentations, newPresentation]);
    setCurrentPresentation(newPresentation);
    setNewPresentationName('');
    setIsCreating(false);
    toast.success('Presentation created!');
  };

  const handleAddSlide = () => {
    if (!currentPresentation) return;
    if (!newSlide.title || !newSlide.content) {
      toast.error('Title and content are required');
      return;
    }

    const slide: Slide = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: newSlide.type as Slide['type'],
      title: newSlide.title,
      content: newSlide.content,
      batesNumber: newSlide.batesNumber,
      imageUrl: newSlide.imageUrl,
      notes: newSlide.notes,
      backgroundColor: newSlide.backgroundColor || '#ffffff',
    };

    const updatedPresentation = {
      ...currentPresentation,
      slides: [...currentPresentation.slides, slide],
    };

    setCurrentPresentation(updatedPresentation);
    setPresentations(presentations.map(p => 
      p.id === currentPresentation.id ? updatedPresentation : p
    ));

    setNewSlide({ type: 'title', title: '', content: '' });
    setIsAddingSlide(false);
    toast.success('Slide added!');
  };

  const handleDeleteSlide = (slideId: string) => {
    if (!currentPresentation) return;
    if (confirm('Delete this slide?')) {
      const updatedPresentation = {
        ...currentPresentation,
        slides: currentPresentation.slides.filter(s => s.id !== slideId),
      };
      setCurrentPresentation(updatedPresentation);
      setPresentations(presentations.map(p => 
        p.id === currentPresentation.id ? updatedPresentation : p
      ));
      if (currentSlideIndex >= updatedPresentation.slides.length) {
        setCurrentSlideIndex(Math.max(0, updatedPresentation.slides.length - 1));
      }
      toast.success('Slide deleted');
    }
  };

  const handleStartPresentation = () => {
    setIsPresentationMode(true);
    setCurrentSlideIndex(0);
  };

  const handleNextSlide = () => {
    if (currentPresentation && currentSlideIndex < currentPresentation.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (!isPresentationMode) return;
    if (e.key === 'ArrowRight' || e.key === ' ') handleNextSlide();
    if (e.key === 'ArrowLeft') handlePrevSlide();
    if (e.key === 'Escape') setIsPresentationMode(false);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPresentationMode, currentSlideIndex]);

  const currentSlide = currentPresentation?.slides[currentSlideIndex];

  const renderSlideContent = (slide: Slide, isPreview: boolean = false) => {
    const textSize = isPreview ? 'text-sm' : 'text-4xl';
    const contentSize = isPreview ? 'text-xs' : 'text-2xl';

    switch (slide.type) {
      case 'title':
        return (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <h1 className={`font-bold mb-4 ${textSize}`} style={{ color: '#9F5166' }}>
              {slide.title}
            </h1>
            <p className={`${contentSize} text-gray-300`}>{slide.content}</p>
          </div>
        );

      case 'exhibit':
        return (
          <div className="h-full flex flex-col p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`font-bold ${textSize}`} style={{ color: '#24bca3' }}>
                {slide.title}
              </h2>
              {slide.batesNumber && (
                <span className={`px-4 py-2 bg-brand-rose rounded ${isPreview ? 'text-xs' : 'text-xl'} font-mono text-white`}>
                  {slide.batesNumber}
                </span>
              )}
            </div>
            <div className="flex-1 flex items-center justify-center bg-white rounded-lg">
              {slide.imageUrl ? (
                <img src={slide.imageUrl} alt={slide.title} className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="text-center text-gray-500">
                  <ImageIcon className={`mx-auto mb-4 ${isPreview ? 'w-8 h-8' : 'w-24 h-24'}`} />
                  <p className={contentSize}>Exhibit Placeholder</p>
                  <p className={isPreview ? 'text-xs' : 'text-lg'}>{slide.content}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'quote':
        return (
          <div className="h-full flex flex-col items-center justify-center p-12">
            <Quote className={`mb-8 ${isPreview ? 'w-8 h-8' : 'w-20 h-20'}`} style={{ color: '#8e9775' }} />
            <blockquote className={`${contentSize} italic text-white text-center mb-6 max-w-4xl leading-relaxed`}>
              "{slide.content}"
            </blockquote>
            <p className={`${isPreview ? 'text-xs' : 'text-xl'} text-gray-400`}>— {slide.title}</p>
          </div>
        );

      case 'facts':
        const facts = slide.content.split('\n').filter(f => f.trim());
        return (
          <div className="h-full p-8">
            <h2 className={`font-bold mb-8 ${textSize}`} style={{ color: '#6B7280' }}>
              {slide.title}
            </h2>
            <ul className="space-y-4">
              {facts.map((fact, idx) => (
                <li key={idx} className={`flex items-start gap-4 ${contentSize} text-white`}>
                  <span className="text-brand-teal font-bold">{idx + 1}.</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case 'argument':
        const points = slide.content.split('\n').filter(p => p.trim());
        return (
          <div className="h-full p-8">
            <h2 className={`font-bold mb-8 ${textSize}`} style={{ color: '#8B5CF6' }}>
              {slide.title}
            </h2>
            <div className="space-y-6">
              {points.map((point, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div 
                    className={`${isPreview ? 'w-8 h-8 text-sm' : 'w-12 h-12 text-xl'} rounded-full bg-brand-rose flex items-center justify-center text-white font-bold flex-shrink-0`}
                  >
                    {idx + 1}
                  </div>
                  <p className={`${contentSize} text-white pt-1`}>{point}</p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center">
              <h2 className={`font-bold mb-4 ${textSize} text-white`}>{slide.title}</h2>
              <p className={`${contentSize} text-gray-300 whitespace-pre-line`}>{slide.content}</p>
            </div>
          </div>
        );
    }
  };

  // Presentation Mode (Full Screen)
  if (isPresentationMode && currentPresentation && currentSlide) {
    return (
      <div 
        className="fixed inset-0 z-50 flex flex-col"
        style={{ 
          background: currentSlide.backgroundColor || '#0a0d1a',
        }}
      >
        {/* Slide Content */}
        <div className="flex-1">
          {renderSlideContent(currentSlide)}
        </div>

        {/* Controls */}
        <div className="bg-black/80 backdrop-blur-sm p-4 flex items-center justify-between">
          <button
            onClick={() => setIsPresentationMode(false)}
            className="btn btn-ghost text-white"
          >
            Exit Presentation
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevSlide}
              disabled={currentSlideIndex === 0}
              className="btn btn-ghost text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="text-white font-medium">
              {currentSlideIndex + 1} / {currentPresentation.slides.length}
            </div>

            <button
              onClick={handleNextSlide}
              disabled={currentSlideIndex === currentPresentation.slides.length - 1}
              className="btn btn-ghost text-white disabled:opacity-30"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {currentSlide.notes && (
            <div className="text-white text-sm max-w-md">
              <div className="font-semibold mb-1">Speaker Notes:</div>
              <div className="text-gray-300">{currentSlide.notes}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main Interface
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-rose to-brand-deep-rose flex items-center justify-center shadow-lg">
              <Presentation className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Courtroom Presentation</h1>
              <p className="text-gray-600">Interactive visual arguments and exhibit display</p>
            </div>
          </div>
        </div>
        {!currentPresentation && (
          <button
            onClick={() => setIsCreating(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Presentation
          </button>
        )}
      </div>

      {/* Create Presentation Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Presentation</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Presentation Name *
                </label>
                <input
                  type="text"
                  value={newPresentationName}
                  onChange={(e) => setNewPresentationName(e.target.value)}
                  placeholder="e.g., Opening Arguments - Reunification Hearing"
                  className="input w-full"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={handleCreatePresentation} className="btn btn-primary flex-1">
                Create
              </button>
              <button onClick={() => setIsCreating(false)} className="btn btn-ghost">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Presentation List */}
      {!currentPresentation && presentations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presentations.map((pres) => (
            <div key={pres.id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <Presentation className="w-8 h-8 text-brand-rose" />
                <span className="text-xs text-gray-500">
                  {pres.slides.length} slides
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{pres.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{pres.caseTitle}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPresentation(pres)}
                  className="btn btn-primary flex-1 text-sm"
                >
                  Open
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this presentation?')) {
                      setPresentations(presentations.filter(p => p.id !== pres.id));
                      toast.success('Presentation deleted');
                    }
                  }}
                  className="btn btn-ghost text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!currentPresentation && presentations.length === 0 && (
        <div className="card p-12 text-center">
          <Presentation className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Presentations Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create visual presentations for your oral arguments. Display exhibits, quotes, and key points during your hearing.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="btn btn-primary mx-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create First Presentation
          </button>
        </div>
      )}

      {/* Presentation Editor */}
      {currentPresentation && (
        <>
          {/* Presentation Header */}
          <div className="card p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currentPresentation.name}</h2>
                <p className="text-gray-600">{currentPresentation.caseTitle}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPresentation(null)}
                  className="btn btn-ghost"
                >
                  Back to List
                </button>
                <button
                  onClick={() => setIsAddingSlide(true)}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Slide
                </button>
                <button
                  onClick={handleStartPresentation}
                  disabled={currentPresentation.slides.length === 0}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Start Presentation
                </button>
              </div>
            </div>
          </div>

          {/* Add Slide Modal */}
          {isAddingSlide && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Slide</h2>
                
                <div className="space-y-4">
                  {/* Slide Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slide Type *</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {slideTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.value}
                            onClick={() => setNewSlide({ ...newSlide, type: type.value as any })}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              newSlide.type === type.value
                                ? 'border-brand-teal bg-brand-teal/10'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className="w-6 h-6 mx-auto mb-2" style={{ color: type.color }} />
                            <div className="text-xs font-medium text-center">{type.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slide Title *</label>
                    <input
                      type="text"
                      value={newSlide.title}
                      onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                      placeholder="e.g., Exhibit A - Medical Records, Key Points, Witness Quote"
                      className="input w-full"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content * {newSlide.type === 'facts' || newSlide.type === 'argument' ? '(One per line)' : ''}
                    </label>
                    <textarea
                      value={newSlide.content}
                      onChange={(e) => setNewSlide({ ...newSlide, content: e.target.value })}
                      placeholder={
                        newSlide.type === 'quote' 
                          ? 'Enter the quote text...' 
                          : newSlide.type === 'facts' || newSlide.type === 'argument'
                          ? 'Enter each point on a new line...'
                          : 'Enter slide content...'
                      }
                      className="input w-full"
                      rows={4}
                    />
                  </div>

                  {/* Bates Number (for exhibits) */}
                  {newSlide.type === 'exhibit' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bates Number</label>
                      <input
                        type="text"
                        value={newSlide.batesNumber || ''}
                        onChange={(e) => setNewSlide({ ...newSlide, batesNumber: e.target.value })}
                        placeholder="e.g., PLTF-001"
                        className="input w-full"
                      />
                    </div>
                  )}

                  {/* Speaker Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Speaker Notes</label>
                    <textarea
                      value={newSlide.notes || ''}
                      onChange={(e) => setNewSlide({ ...newSlide, notes: e.target.value })}
                      placeholder="Notes for yourself during presentation..."
                      className="input w-full"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button onClick={handleAddSlide} className="btn btn-primary flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Slide
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingSlide(false);
                      setNewSlide({ type: 'title', title: '', content: '' });
                    }}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Slide Preview Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentPresentation.slides.map((slide, index) => (
              <div 
                key={slide.id}
                className={`card p-0 overflow-hidden cursor-pointer hover:ring-2 hover:ring-brand-teal transition-all ${
                  index === currentSlideIndex ? 'ring-2 ring-brand-rose' : ''
                }`}
                onClick={() => setCurrentSlideIndex(index)}
              >
                <div 
                  className="h-40 relative"
                  style={{ 
                    background: slide.backgroundColor || '#0a0d1a',
                    fontSize: '0.5rem',
                  }}
                >
                  {renderSlideContent(slide, true)}
                </div>
                <div className="p-3 bg-white border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500">Slide {index + 1}</div>
                      <div className="text-sm font-medium text-gray-900 truncate">{slide.title}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSlide(slide.id);
                      }}
                      className="btn btn-sm btn-ghost text-red-600 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Current Slide Preview */}
          {currentSlide && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Current Slide Preview: {currentSlide.title}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevSlide}
                    disabled={currentSlideIndex === 0}
                    className="btn btn-sm btn-ghost"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium">
                    {currentSlideIndex + 1} / {currentPresentation.slides.length}
                  </span>
                  <button
                    onClick={handleNextSlide}
                    disabled={currentSlideIndex === currentPresentation.slides.length - 1}
                    className="btn btn-sm btn-ghost"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div 
                className="w-full aspect-video rounded-lg overflow-hidden"
                style={{ background: currentSlide.backgroundColor || '#0a0d1a' }}
              >
                <div style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', height: '200%' }}>
                  {renderSlideContent(currentSlide)}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
