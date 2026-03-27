import { useState } from 'react';
import { Scale, FileText, Image, User, Briefcase, FileCheck, Printer, Sparkles, Copy, Check } from 'lucide-react';
import { callGemini, AI_PROMPTS } from '../utils/gemini';
import { toast } from 'sonner@2.0.3';

type EvidenceType = 
  | 'business-record' 
  | 'photograph' 
  | 'expert-testimony' 
  | 'document-authentication'
  | 'hearsay-exception'
  | 'character-evidence'
  | 'prior-statement';

interface FoundationScript {
  type: EvidenceType;
  title: string;
  introduction: string;
  questions: string[];
  citations: string[];
  notes: string;
}

export function FoundationBuilder() {
  const [selectedType, setSelectedType] = useState<EvidenceType | null>(null);
  const [customDetails, setCustomDetails] = useState('');
  const [script, setScript] = useState<FoundationScript | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const evidenceTypes = [
    {
      id: 'business-record' as EvidenceType,
      label: 'Business Records',
      icon: FileText,
      description: 'Business records exception to hearsay (FRE 803(6))',
      example: 'Medical records, invoices, logs'
    },
    {
      id: 'photograph' as EvidenceType,
      label: 'Photographs',
      icon: Image,
      description: 'Authentication of photos and images (FRE 901)',
      example: 'Photos, videos, digital images'
    },
    {
      id: 'expert-testimony' as EvidenceType,
      label: 'Expert Testimony',
      icon: Briefcase,
      description: 'Expert witness qualification (FRE 702)',
      example: 'Medical experts, forensic analysts'
    },
    {
      id: 'document-authentication' as EvidenceType,
      label: 'Document Authentication',
      icon: FileCheck,
      description: 'Authenticating documents (FRE 901-902)',
      example: 'Contracts, letters, emails'
    },
    {
      id: 'hearsay-exception' as EvidenceType,
      label: 'Hearsay Exceptions',
      icon: User,
      description: 'Various hearsay exceptions (FRE 803-804)',
      example: 'Present sense impressions, excited utterances'
    },
    {
      id: 'character-evidence' as EvidenceType,
      label: 'Character Evidence',
      icon: User,
      description: 'Character evidence rules (FRE 404-405)',
      example: 'Reputation, specific acts'
    },
    {
      id: 'prior-statement' as EvidenceType,
      label: 'Prior Statements',
      icon: FileText,
      description: 'Prior inconsistent statements (FRE 801(d))',
      example: 'Impeachment, prior testimony'
    }
  ];

  const handleGenerateScript = async () => {
    if (!selectedType) {
      toast.error('Please select an evidence type');
      return;
    }

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

    setIsGenerating(true);

    try {
      const selectedInfo = evidenceTypes.find(t => t.id === selectedType)!;
      
      const prompt = `Generate a complete foundation script for admitting ${selectedInfo.label} in a Florida dependency court proceeding.

Evidence Type: ${selectedInfo.label}
Description: ${selectedInfo.description}
${customDetails ? `Specific Details: ${customDetails}` : ''}

Provide a complete, word-for-word script including:

1. INTRODUCTION: Brief statement to the court announcing the evidence
2. FOUNDATION QUESTIONS: 8-12 specific questions to establish foundation (numbered)
   - Each question should be attorney-friendly and conversational
   - Include appropriate follow-up questions
   - Cover all required elements under Florida Rules of Evidence
3. CITATIONS: Relevant Florida Statutes and case law citations
4. PRACTICE NOTES: Tips for smooth admission, potential objections, and responses

Format the response clearly with sections labeled. Make it practical and ready to use in court.`;

      const response = await callGemini(prompt, AI_PROMPTS.evidence, apiKey);

      // Parse the response into structured script
      const parsedScript = parseFoundationScript(response, selectedType, selectedInfo.label);
      setScript(parsedScript);
      toast.success('Foundation script generated!');
    } catch (error) {
      toast.error('Failed to generate script. Please try again.');
      console.error('Script generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const parseFoundationScript = (aiResponse: string, type: EvidenceType, title: string): FoundationScript => {
    const lines = aiResponse.split('\n');
    const questions: string[] = [];
    const citations: string[] = [];
    let introduction = '';
    let notes = '';
    let currentSection = '';

    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      
      if (lowerLine.includes('introduction')) {
        currentSection = 'introduction';
      } else if (lowerLine.includes('question') || lowerLine.includes('foundation')) {
        currentSection = 'questions';
      } else if (lowerLine.includes('citation') || lowerLine.includes('statute') || lowerLine.includes('fre')) {
        currentSection = 'citations';
      } else if (lowerLine.includes('note') || lowerLine.includes('tip')) {
        currentSection = 'notes';
      } else {
        // Add content to current section
        const trimmed = line.trim();
        if (trimmed) {
          if (currentSection === 'introduction') {
            introduction += trimmed + ' ';
          } else if (currentSection === 'questions') {
            if (trimmed.match(/^\d+[.)]/) || trimmed.startsWith('Q:') || trimmed.startsWith('-')) {
              questions.push(trimmed.replace(/^[\d.)Q:\-]\s*/, ''));
            }
          } else if (currentSection === 'citations') {
            if (trimmed.match(/^\d+[.)]/) || trimmed.includes('§') || trimmed.includes('FRE') || trimmed.startsWith('-')) {
              citations.push(trimmed.replace(/^[\d.)\-]\s*/, ''));
            }
          } else if (currentSection === 'notes') {
            notes += trimmed + '\n';
          }
        }
      }
    });

    // If parsing didn't work well, create a basic structure
    if (questions.length === 0) {
      // Extract any numbered items
      lines.forEach(line => {
        if (line.match(/^\d+[.)]/) && line.length > 10) {
          questions.push(line.replace(/^[\d.)]\s*/, ''));
        }
      });
    }

    return {
      type,
      title,
      introduction: introduction.trim() || `Your Honor, I'd like to introduce ${title}.`,
      questions: questions.length > 0 ? questions : ['[Script generation in progress - questions will appear here]'],
      citations: citations.length > 0 ? citations : ['Florida Rules of Evidence'],
      notes: notes.trim() || 'Follow the script carefully and maintain witness engagement.'
    };
  };

  const handleCopyQuestion = (question: string, index: number) => {
    navigator.clipboard.writeText(question);
    setCopiedIndex(index);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-teal to-brand-deep-teal flex items-center justify-center shadow-lg">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Foundation Builder</h1>
            <p className="text-gray-600">Generate court-ready foundation scripts for evidence admission</p>
          </div>
        </div>
      </div>

      {/* Evidence Type Selection */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Evidence Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evidenceTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`card p-5 text-left transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-brand-teal shadow-lg' : ''
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected 
                      ? 'bg-gradient-to-br from-brand-teal to-brand-deep-teal' 
                      : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-1 ${
                      isSelected ? 'text-brand-teal' : 'text-gray-900'
                    }`}>
                      {type.label}
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                <p className="text-xs text-gray-500 italic">Example: {type.example}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Details */}
      {selectedType && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Customize Your Script</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specific Details (Optional)
              </label>
              <textarea
                value={customDetails}
                onChange={(e) => setCustomDetails(e.target.value)}
                placeholder="Add specific details about your evidence, witness, or case circumstances to customize the script..."
                className="input w-full"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: "Medical record from Tampa General Hospital dated 3/15/2025, custodian is Records Manager Jane Smith"
              </p>
            </div>
            
            <button
              onClick={handleGenerateScript}
              disabled={isGenerating}
              className="btn btn-primary flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  Generating Script...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Foundation Script
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Generated Script */}
      {script && (
        <div className="card p-6 space-y-6 print:shadow-none">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{script.title} Foundation</h2>
              <p className="text-sm text-gray-500 mt-1">Florida Rules of Evidence</p>
            </div>
            <button
              onClick={handlePrint}
              className="btn btn-secondary flex items-center gap-2 print:hidden"
            >
              <Printer className="w-4 h-4" />
              Print Script
            </button>
          </div>

          {/* Introduction */}
          <div className="bg-brand-teal/5 border-l-4 border-brand-teal p-4 rounded">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Scale className="w-5 h-5 text-brand-teal" />
              Opening Statement to Court
            </h3>
            <p className="text-gray-700 italic">{script.introduction}</p>
          </div>

          {/* Foundation Questions */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-brand-rose" />
              Foundation Questions
            </h3>
            <div className="space-y-3">
              {script.questions.map((question, idx) => (
                <div key={idx} className="flex gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-brand-rose flex items-center justify-center text-white font-semibold text-sm">
                      {idx + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">{question}</p>
                  </div>
                  <button
                    onClick={() => handleCopyQuestion(question, idx)}
                    className="btn btn-sm btn-ghost opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                    title="Copy question"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Citations */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              Legal Authority
            </h3>
            <ul className="space-y-2">
              {script.citations.map((citation, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-brand-rose mt-0.5">•</span>
                  <span>{citation}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Practice Notes */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-600" />
              Practice Notes & Tips
            </h3>
            <div className="prose prose-sm text-gray-700">
              <p className="whitespace-pre-line">{script.notes}</p>
            </div>
          </div>

          {/* Quick Reference Card */}
          <div className="bg-gradient-to-r from-brand-rose/10 to-brand-teal/10 p-6 rounded-xl border border-brand-rose/20">
            <h3 className="font-semibold text-gray-900 mb-3">📋 Quick Courtroom Checklist</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Before You Start:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>✓ Have witness sworn in</li>
                  <li>✓ Mark exhibit for identification</li>
                  <li>✓ Have exhibit ready to show witness</li>
                  <li>✓ Know your Rule citations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Common Objections:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Hearsay → Cite exception</li>
                  <li>• Lack of foundation → Continue questioning</li>
                  <li>• Relevance → Explain connection</li>
                  <li>• Authentication → Verify witness knowledge</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      {!script && (
        <div className="card p-8 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="max-w-2xl mx-auto text-center">
            <Scale className="w-16 h-16 mx-auto text-brand-teal mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">How to Use Foundation Builder</h3>
            <div className="text-gray-600 space-y-3 text-left">
              <p><strong>1. Select Evidence Type:</strong> Choose the type of evidence you need to admit</p>
              <p><strong>2. Add Details:</strong> Provide specific information about your evidence and witness</p>
              <p><strong>3. Generate Script:</strong> AI creates a complete, Florida-compliant foundation script</p>
              <p><strong>4. Use in Court:</strong> Print or copy the questions for your hearing</p>
            </div>
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-left">
              <p className="text-yellow-800">
                <strong>💡 Pro Tip:</strong> Practice your foundation script with your witness before the hearing. 
                This ensures smooth testimony and reduces the chance of objections.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
