import { useState, useRef, useEffect } from 'react';
import { 
  Brain, 
  FileEdit, 
  ClipboardCheck, 
  Handshake, 
  MessageSquare, 
  Send, 
  Loader2, 
  Plus,
  Upload,
  Mic,
  Calendar,
  Users,
  FolderOpen,
  Scale,
  FileText,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Search,
  Command
} from 'lucide-react';
import { callGemini, AI_PROMPTS } from '../utils/gemini';
import { useCaseContext } from '../contexts/CaseContext';
import { toast } from 'sonner@2.0.3';

type Agent = 'command' | 'strategist' | 'drafter' | 'clerk' | 'negotiator' | 'examiner';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  actions?: Action[];
  data?: any;
}

interface Action {
  label: string;
  icon?: any;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}

interface CommandCenterProps {
  apiKey: string;
  onNavigate?: (view: string) => void;
}

interface Command {
  trigger: string[];
  description: string;
  action: (params: string) => void;
  icon: any;
}

export function CommandCenter({ apiKey, onNavigate }: CommandCenterProps) {
  const { caseData, addEvent, addPerson } = useCaseContext();
  const [activeAgent, setActiveAgent] = useState<Agent>('command');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: `Welcome to your Legal Command Center! 👋

I'm here to help you manage your case. You can:

**Quick Commands:**
• "Add event" - Add to timeline
• "New log" - Record recollection
• "Search [term]" - Find anything
• "Extract facts" - Analyze document
• "Create motion" - Draft filing
• "Show risks" - Get strategy analysis
• "Add person" - New contact

**Or just chat naturally** - I'll understand what you need and route your request to the right tool.

What would you like to do?`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const agents = [
    {
      id: 'command' as Agent,
      name: 'Command Center',
      icon: Command,
      description: 'Central hub - route to any tool',
      color: '#9F5166',
      gradient: 'from-brand-rose to-brand-deep-rose',
      welcomeMessage: 'Command Center active. Type commands or chat naturally.'
    },
    {
      id: 'strategist' as Agent,
      name: 'Strategist',
      icon: Brain,
      description: 'Case strategy and legal theory',
      color: '#4B5563',
      gradient: 'from-gray-600 to-gray-700',
      welcomeMessage: 'Legal Strategist ready. Let\'s analyze your case strategy.'
    },
    {
      id: 'drafter' as Agent,
      name: 'Drafter',
      icon: FileEdit,
      description: 'Motion and brief generation',
      color: '#B76E79',
      gradient: 'from-[#B76E79] to-[#8B4B56]',
      welcomeMessage: 'Drafter ready. What document shall we create?'
    },
    {
      id: 'clerk' as Agent,
      name: 'Clerk',
      icon: ClipboardCheck,
      description: 'Compliance and procedural checks',
      color: '#0D9488',
      gradient: 'from-[#0D9488] to-[#0F766E]',
      welcomeMessage: 'Clerk ready. Let me check your compliance and procedures.'
    },
    {
      id: 'negotiator' as Agent,
      name: 'Negotiator',
      icon: Handshake,
      description: 'Settlement analysis and negotiation',
      color: '#6B7280',
      gradient: 'from-gray-500 to-gray-600',
      welcomeMessage: 'Negotiator ready. Let\'s explore settlement options.'
    },
    {
      id: 'examiner' as Agent,
      name: 'Cross-Examiner',
      icon: MessageSquare,
      description: 'Witness preparation and questions',
      color: '#8B4B56',
      gradient: 'from-[#8B4B56] to-[#B76E79]',
      welcomeMessage: 'Cross-Examiner ready. Who shall we prepare to question?'
    },
  ];

  const quickActions = [
    {
      label: 'Add Event',
      icon: Calendar,
      description: 'Add to timeline',
      command: 'add event',
    },
    {
      label: 'New Log',
      icon: FileText,
      description: 'Record recollection',
      command: 'new log',
    },
    {
      label: 'Add Person',
      icon: Users,
      description: 'New contact',
      command: 'add person',
    },
    {
      label: 'Search',
      icon: Search,
      description: 'Find anything',
      command: 'search',
    },
    {
      label: 'Extract Facts',
      icon: Sparkles,
      description: 'Analyze document',
      command: 'extract facts',
    },
    {
      label: 'Create Motion',
      icon: Scale,
      description: 'Draft filing',
      command: 'create motion',
    },
  ];

  const parseCommand = (input: string): { command: string; params: string } | null => {
    const lower = input.toLowerCase().trim();
    
    // Command patterns
    const patterns = [
      { regex: /^(add|create|new)\s+(event|timeline)/i, command: 'add_event' },
      { regex: /^(new|create|add)\s+(log|entry|recollection)/i, command: 'new_log' },
      { regex: /^(add|new)\s+(person|contact|people)/i, command: 'add_person' },
      { regex: /^search\s+(.+)/i, command: 'search' },
      { regex: /^(extract|analyze)\s+(facts?|document)/i, command: 'extract_facts' },
      { regex: /^(create|draft|write)\s+(motion|filing)/i, command: 'create_motion' },
      { regex: /^(show|what|get)\s+(risks?|strategy|analysis)/i, command: 'show_risks' },
      { regex: /^(show|view|open)\s+(timeline|events)/i, command: 'view_timeline' },
      { regex: /^(show|view|open)\s+(evidence|vault)/i, command: 'view_evidence' },
      { regex: /^help$/i, command: 'help' },
    ];

    for (const pattern of patterns) {
      const match = lower.match(pattern.regex);
      if (match) {
        const params = match[match.length - 1] || '';
        return { command: pattern.command, params };
      }
    }

    return null;
  };

  const executeCommand = async (command: string, params: string) => {
    const actions: Action[] = [];

    switch (command) {
      case 'add_event':
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `I'll help you add an event to your timeline. Please provide:\n\n• **Event title** (e.g., "Supervised visit at DCF office")\n• **Date**\n• **Description** (optional)\n• **Location** (optional)`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          actions: [
            {
              label: 'Open Timeline Builder',
              icon: Calendar,
              onClick: () => onNavigate?.('timeline'),
              variant: 'primary'
            }
          ]
        }]);
        break;

      case 'new_log':
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Let's record your recollection. You can:\n\n✍️ **Type it out** - Just start writing below\n🎤 **Voice record** - Coming soon!\n\nI'll automatically extract:\n• Events for timeline\n• People mentioned\n• Issues to track\n• Actions needed`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          actions: [
            {
              label: 'Start Recording Log',
              icon: FileText,
              onClick: () => {
                setInput('LOG: ');
                inputRef.current?.focus();
              },
              variant: 'primary'
            }
          ]
        }]);
        break;

      case 'add_person':
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `I'll help you add a contact to your People Directory. Please provide:\n\n• **Name**\n• **Role** (e.g., GAL, Case Manager, Judge)\n• **Contact info** (optional)\n• **Notes** (optional)`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          actions: [
            {
              label: 'Quick Add Person',
              icon: Users,
              onClick: () => {
                setInput('PERSON: Name | Role | ');
                inputRef.current?.focus();
              },
              variant: 'primary'
            }
          ]
        }]);
        break;

      case 'search':
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `🔍 **Global Search**\n\nWhat would you like to search for? I'll search across:\n• Timeline events\n• Evidence documents\n• Extracted facts\n• Logs and notes\n• People and contacts\n• AI conversations`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          actions: [
            {
              label: 'Open Search',
              icon: Search,
              onClick: () => {
                // Future: Open global search modal
                toast.info('Global search coming soon!');
              },
              variant: 'primary'
            }
          ]
        }]);
        break;

      case 'extract_facts':
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `📄 **Evidence Fact Extractor**\n\nI can analyze any document and extract:\n• 👤 Names & entities\n• 📅 Dates & timelines\n• 📍 Locations\n• 💬 Key quotes\n• 💰 Amounts & figures\n• 📋 Other key facts\n\nWhich document would you like me to analyze?`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          actions: [
            {
              label: 'Go to Evidence Vault',
              icon: FolderOpen,
              onClick: () => onNavigate?.('evidence'),
              variant: 'primary'
            }
          ]
        }]);
        break;

      case 'create_motion':
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `⚖️ **Motion Drafting**\n\nI can help you create:\n• Motion to Compel\n• Motion for Modification\n• Motion to Dismiss\n• Response to Motion\n• Affidavit\n\nWhat type of motion do you need?`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          actions: [
            {
              label: 'Draft Motion',
              icon: FileEdit,
              onClick: () => {
                setActiveAgent('drafter');
                setInput('Draft a motion to ');
                inputRef.current?.focus();
              },
              variant: 'primary'
            }
          ]
        }]);
        break;

      case 'show_risks':
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `🎯 **Strategy Analysis**\n\nLet me analyze your case for:\n• Strengths and weaknesses\n• Potential risks\n• Recommended actions\n• Evidence gaps\n• Deadline warnings\n\nAnalyzing your case data...`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        }]);

        // Switch to strategist and analyze
        setTimeout(() => {
          setActiveAgent('strategist');
          handleAIResponse('Analyze my case for risks, strengths, and recommended next steps.');
        }, 500);
        break;

      case 'view_timeline':
        onNavigate?.('timeline');
        setMessages(prev => [...prev, {
          role: 'system',
          content: '📅 Opening Timeline Builder...',
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        }]);
        break;

      case 'view_evidence':
        onNavigate?.('evidence');
        setMessages(prev => [...prev, {
          role: 'system',
          content: '🗂️ Opening Evidence Vault...',
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        }]);
        break;

      case 'help':
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `📚 **Command Center Help**\n\n**Quick Commands:**\n• \`add event\` - Add to timeline\n• \`new log\` - Record recollection\n• \`add person\` - New contact\n• \`search [term]\` - Global search\n• \`extract facts\` - Analyze document\n• \`create motion\` - Draft filing\n• \`show risks\` - Strategy analysis\n\n**Or just chat naturally!** I understand:\n• "What are my biggest risks?"\n• "Add the hearing on March 25"\n• "Search for all events with the GAL"\n• "Help me draft a motion"\n\n**Switch Agents:**\nClick an agent below to get specialized help.`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        }]);
        break;

      default:
        return false;
    }

    return true;
  };

  const handleAIResponse = async (userInput: string) => {
    if (!apiKey) {
      toast.error('Please add your Gemini API key in Settings');
      setIsLoading(false);
      return;
    }

    try {
      const activeAgentData = agents.find(a => a.id === activeAgent);
      const systemPrompt = activeAgent === 'command' 
        ? AI_PROMPTS.advocate 
        : AI_PROMPTS[activeAgent as keyof typeof AI_PROMPTS] || AI_PROMPTS.advocate;

      // Add case context
      let contextualPrompt = userInput;
      if (caseData.caseNumber) {
        contextualPrompt = `CASE CONTEXT:
Case: ${caseData.caseName}
Case Number: ${caseData.caseNumber}
Court: ${caseData.courtName}
Judge: ${caseData.judgeName}
Children: ${caseData.children?.map(c => `${c.name} (${c.age})`).join(', ')}

USER REQUEST: ${userInput}`;
      }

      const response = await callGemini(contextualPrompt, systemPrompt, apiKey);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or check your API key in Settings.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);

    // Check for commands first
    const parsedCommand = parseCommand(userInput);
    
    if (parsedCommand && activeAgent === 'command') {
      const executed = await executeCommand(parsedCommand.command, parsedCommand.params);
      if (executed) {
        setIsLoading(false);
        return;
      }
    }

    // Otherwise, route to AI
    await handleAIResponse(userInput);
  };

  const handleQuickAction = (command: string) => {
    setInput(command);
    inputRef.current?.focus();
  };

  const handleAgentSwitch = (agentId: Agent) => {
    setActiveAgent(agentId);
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      setMessages(prev => [...prev, {
        role: 'system',
        content: `Switched to ${agent.name}. ${agent.welcomeMessage}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const activeAgentData = agents.find(a => a.id === activeAgent);

  return (
    <div className="h-screen flex flex-col max-w-7xl mx-auto">
      {/* Header */}
      <div className="card p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activeAgentData?.gradient} flex items-center justify-center shadow-lg`}>
              {activeAgentData && <activeAgentData.icon className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{activeAgentData?.name}</h1>
              <p className="text-sm text-gray-600">{activeAgentData?.description}</p>
            </div>
          </div>
          {caseData.caseNumber && (
            <div className="text-right">
              <div className="text-xs text-gray-500">Active Case</div>
              <div className="font-semibold text-gray-900">{caseData.caseName}</div>
            </div>
          )}
        </div>

        {/* Agent Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {agents.map((agent) => {
            const Icon = agent.icon;
            const isActive = activeAgent === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => handleAgentSwitch(agent.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${agent.gradient} text-white shadow-md`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{agent.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      {showQuickActions && activeAgent === 'command' && (
        <div className="card p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Quick Actions</h3>
            <button
              onClick={() => setShowQuickActions(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Hide
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.command)}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border-2 border-gray-200 hover:border-brand-teal hover:bg-brand-teal/5 transition-all"
                >
                  <Icon className="w-5 h-5 text-brand-teal" />
                  <div className="text-xs font-medium text-gray-900 text-center">{action.label}</div>
                  <div className="text-xs text-gray-500">{action.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="card flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role !== 'user' && (
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activeAgentData?.gradient} flex items-center justify-center flex-shrink-0`}>
                  {message.role === 'system' ? (
                    <AlertCircle className="w-4 h-4 text-white" />
                  ) : (
                    activeAgentData && <activeAgentData.icon className="w-4 h-4 text-white" />
                  )}
                </div>
              )}
              <div className={`flex-1 max-w-3xl ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                <div
                  className={`rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-brand-teal text-white'
                      : message.role === 'system'
                      ? 'bg-gray-100 text-gray-700 border border-gray-200'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-line">{message.content}</p>
                  {message.actions && message.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {message.actions.map((action, idx) => {
                        const ActionIcon = action.icon;
                        return (
                          <button
                            key={idx}
                            onClick={action.onClick}
                            className={`btn ${
                              action.variant === 'primary'
                                ? 'btn-primary'
                                : action.variant === 'secondary'
                                ? 'btn-secondary'
                                : 'btn-ghost'
                            } btn-sm flex items-center gap-2`}
                          >
                            {ActionIcon && <ActionIcon className="w-4 h-4" />}
                            {action.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className="text-xs opacity-60 mt-2">{message.timestamp}</div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activeAgentData?.gradient} flex items-center justify-center`}>
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-gray-500">Thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={activeAgent === 'command' ? 'Type a command or chat naturally...' : 'Chat with ' + activeAgentData?.name + '...'}
              className="input flex-1"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="btn btn-primary"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <Command className="w-3 h-3" />
            <span>Try: "add event", "search [term]", "create motion", or chat naturally</span>
          </div>
        </div>
      </div>
    </div>
  );
}
