import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  Activity,
  BarChart3,
  Lightbulb,
  Calendar,
  FileText,
  Users,
  FolderOpen,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Brain
} from 'lucide-react';
import { useCaseContext } from '../contexts/CaseContext';
import { callGemini, AI_PROMPTS } from '../utils/gemini';
import { toast } from 'sonner@2.0.3';

interface AnalysisResult {
  id: string;
  timestamp: string;
  overallScore: number;
  trend: 'up' | 'down' | 'stable';
  trendChange: number;
  strengths: StrengthItem[];
  risks: RiskItem[];
  recommendations: RecommendationItem[];
  progress: ProgressArea[];
  insights: string[];
}

interface StrengthItem {
  title: string;
  description: string;
  importance: 'high' | 'medium' | 'low';
  evidence: string[];
}

interface RiskItem {
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  mitigation: string;
  deadline?: string;
}

interface RecommendationItem {
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  action: string;
  module?: string;
}

interface ProgressArea {
  area: string;
  current: number;
  target: number;
  status: 'ahead' | 'on-track' | 'behind' | 'critical';
}

interface StrategyEngineProps {
  apiKey: string;
  onNavigate?: (view: string) => void;
}

export function StrategyEngine({ apiKey, onNavigate }: StrategyEngineProps) {
  const { caseData } = useCaseContext();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(() => {
    const saved = localStorage.getItem('wtp_latest_analysis');
    return saved ? JSON.parse(saved) : null;
  });
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>(() => {
    const saved = localStorage.getItem('wtp_analysis_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'strengths' | 'risks' | 'recommendations' | 'progress'>('overview');

  // Auto-analyze on load if no recent analysis
  useEffect(() => {
    if (!analysis || isAnalysisStale(analysis.timestamp)) {
      // Don't auto-run, just show prompt
    }
  }, []);

  const isAnalysisStale = (timestamp: string) => {
    const hours = (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60);
    return hours > 24; // Stale after 24 hours
  };

  const runAnalysis = async (useAI: boolean = false) => {
    setIsAnalyzing(true);

    try {
      // Gather all case data
      const timeline = JSON.parse(localStorage.getItem('wtp_timeline') || '[]');
      const evidence = JSON.parse(localStorage.getItem('wtp_evidence') || '[]');
      const logs = JSON.parse(localStorage.getItem('wtp_logs') || '[]');
      const people = JSON.parse(localStorage.getItem('wtp_people') || '[]');
      const alerts = JSON.parse(localStorage.getItem('wtp_alerts') || '[]');

      let analysisResult: AnalysisResult;

      if (useAI && apiKey) {
        // Use Gemini for deep analysis
        analysisResult = await runAIAnalysis(timeline, evidence, logs, people, alerts);
      } else {
        // Use rule-based analysis
        analysisResult = runRuleBasedAnalysis(timeline, evidence, logs, people, alerts);
      }

      // Save analysis
      setAnalysis(analysisResult);
      localStorage.setItem('wtp_latest_analysis', JSON.stringify(analysisResult));

      // Add to history
      const newHistory = [analysisResult, ...analysisHistory].slice(0, 30); // Keep last 30
      setAnalysisHistory(newHistory);
      localStorage.setItem('wtp_analysis_history', JSON.stringify(newHistory));

      // Generate alerts from high-priority risks
      generateAlertsFromAnalysis(analysisResult);

      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runRuleBasedAnalysis = (
    timeline: any[],
    evidence: any[],
    logs: any[],
    people: any[],
    alerts: any[]
  ): AnalysisResult => {
    const strengths: StrengthItem[] = [];
    const risks: RiskItem[] = [];
    const recommendations: RecommendationItem[] = [];
    const progress: ProgressArea[] = [];

    // Calculate overall score
    let score = 50; // Base score

    // Analyze Timeline
    const upcomingHearings = timeline.filter(e => {
      const daysUntil = (new Date(e.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntil > 0 && daysUntil <= 30;
    });

    const recentVisits = timeline.filter(e => {
      const daysAgo = (Date.now() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24);
      return e.type === 'visit' && daysAgo <= 30;
    });

    if (recentVisits.length >= 4) {
      strengths.push({
        title: 'Consistent Visitation',
        description: `${recentVisits.length} visits documented in the last 30 days`,
        importance: 'high',
        evidence: recentVisits.map(v => v.title),
      });
      score += 15;
    } else if (recentVisits.length < 2) {
      risks.push({
        title: 'Limited Visitation Documentation',
        description: 'Only ' + recentVisits.length + ' visits documented in last 30 days',
        severity: 'high',
        mitigation: 'Document all visits immediately after they occur',
      });
      score -= 10;
    }

    // Analyze Evidence
    if (evidence.length === 0) {
      risks.push({
        title: 'No Evidence Uploaded',
        description: 'Evidence vault is empty',
        severity: 'high',
        mitigation: 'Upload key documents: case plan, visit reports, service completion certificates',
      });
      recommendations.push({
        title: 'Upload Critical Evidence',
        description: 'Start building your evidence vault',
        priority: 'urgent',
        action: 'Upload at least 5 key documents',
        module: 'evidence',
      });
      score -= 15;
    } else if (evidence.length < 5) {
      risks.push({
        title: 'Limited Evidence Collection',
        description: `Only ${evidence.length} documents uploaded`,
        severity: 'medium',
        mitigation: 'Continue uploading supporting documentation',
      });
      score -= 5;
    } else {
      strengths.push({
        title: 'Strong Evidence Collection',
        description: `${evidence.length} documents organized and Bates-stamped`,
        importance: 'high',
        evidence: evidence.slice(0, 5).map((e: any) => e.title),
      });
      score += 10;
    }

    // Analyze Logs
    if (logs.length > 0) {
      strengths.push({
        title: 'Detailed Case Documentation',
        description: `${logs.length} log entries tracking case progress`,
        importance: 'medium',
        evidence: [`${logs.length} recollections documented`],
      });
      score += 5;
    } else {
      recommendations.push({
        title: 'Start Recording Recollections',
        description: 'Document all interactions, visits, and observations',
        priority: 'high',
        action: 'Create your first log entry',
        module: 'logs',
      });
    }

    // Analyze People Directory
    const galContacts = people.filter((p: any) => 
      p.role?.toLowerCase().includes('gal')
    );
    const therapists = people.filter((p: any) => 
      p.role?.toLowerCase().includes('therapist')
    );
    const caseManagers = people.filter((p: any) => 
      p.role?.toLowerCase().includes('case manager')
    );

    if (galContacts.length > 0) {
      strengths.push({
        title: 'GAL Contact Established',
        description: 'Guardian ad Litem information tracked',
        importance: 'high',
        evidence: galContacts.map((p: any) => p.name),
      });
      score += 5;
    } else {
      recommendations.push({
        title: 'Add GAL to Directory',
        description: 'Track GAL contact information and interactions',
        priority: 'high',
        action: 'Add GAL details to People Directory',
        module: 'people',
      });
    }

    // Analyze Alerts
    const activeHighAlerts = alerts.filter((a: any) => 
      !a.dismissed && a.severity === 'high'
    );

    if (activeHighAlerts.length > 0) {
      risks.push({
        title: `${activeHighAlerts.length} High-Priority Alerts`,
        description: 'Urgent items require immediate attention',
        severity: 'high',
        mitigation: 'Address high-priority alerts in Alert Center',
        deadline: activeHighAlerts[0]?.dueDate,
      });
      score -= 5;
    }

    // Check for upcoming deadlines
    if (upcomingHearings.length > 0) {
      const nextHearing = upcomingHearings[0];
      const daysUntil = Math.ceil((new Date(nextHearing.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil <= 7) {
        recommendations.push({
          title: 'Prepare for Upcoming Hearing',
          description: `Hearing in ${daysUntil} days: ${nextHearing.title}`,
          priority: 'urgent',
          action: 'Review evidence, prepare testimony, organize documents',
          module: 'timeline',
        });
      }
    }

    // Progress Areas
    progress.push({
      area: 'Evidence Collection',
      current: evidence.length,
      target: 15,
      status: evidence.length >= 15 ? 'ahead' : evidence.length >= 10 ? 'on-track' : evidence.length >= 5 ? 'behind' : 'critical',
    });

    progress.push({
      area: 'Documentation (Logs)',
      current: logs.length,
      target: 10,
      status: logs.length >= 10 ? 'ahead' : logs.length >= 5 ? 'on-track' : logs.length >= 2 ? 'behind' : 'critical',
    });

    progress.push({
      area: 'Contact Management',
      current: people.length,
      target: 8,
      status: people.length >= 8 ? 'ahead' : people.length >= 5 ? 'on-track' : people.length >= 2 ? 'behind' : 'critical',
    });

    progress.push({
      area: 'Timeline Completeness',
      current: timeline.length,
      target: 20,
      status: timeline.length >= 20 ? 'ahead' : timeline.length >= 12 ? 'on-track' : timeline.length >= 5 ? 'behind' : 'critical',
    });

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push({
        title: 'Continue Strong Progress',
        description: 'Maintain your current documentation habits',
        priority: 'low',
        action: 'Keep recording visits, uploading evidence, and tracking interactions',
      });
    }

    // Add AI-powered recommendation
    recommendations.push({
      title: 'Get AI Strategy Analysis',
      description: 'Use Gemini AI for deeper insights and personalized recommendations',
      priority: 'medium',
      action: 'Run AI-powered analysis',
    });

    // Calculate trend
    let trend: 'up' | 'down' | 'stable' = 'stable';
    let trendChange = 0;
    
    if (analysisHistory.length > 0) {
      const previousScore = analysisHistory[0].overallScore;
      trendChange = score - previousScore;
      
      if (trendChange > 3) trend = 'up';
      else if (trendChange < -3) trend = 'down';
    }

    // Cap score at 0-100
    score = Math.max(0, Math.min(100, score));

    const insights = [
      `Case strength: ${score >= 70 ? 'Strong' : score >= 50 ? 'Moderate' : 'Needs Improvement'}`,
      `${strengths.length} strengths identified`,
      `${risks.length} risks to address`,
      `${recommendations.length} recommended actions`,
    ];

    return {
      id: `analysis-${Date.now()}`,
      timestamp: new Date().toISOString(),
      overallScore: score,
      trend,
      trendChange,
      strengths,
      risks,
      recommendations,
      progress,
      insights,
    };
  };

  const runAIAnalysis = async (
    timeline: any[],
    evidence: any[],
    logs: any[],
    people: any[],
    alerts: any[]
  ): AnalysisResult => {
    // First run rule-based analysis as baseline
    const baseAnalysis = runRuleBasedAnalysis(timeline, evidence, logs, people, alerts);

    // Then enhance with AI insights
    const prompt = `You are a legal strategist analyzing a child custody case. Analyze this case data and provide strategic insights:

CASE PROFILE:
- Case: ${caseData.caseName}
- Case Number: ${caseData.caseNumber}
- Court: ${caseData.courtName}
- Judge: ${caseData.judgeName}
- Children: ${caseData.children?.map(c => `${c.name} (age ${c.age})`).join(', ')}

DATA SUMMARY:
- Timeline Events: ${timeline.length}
- Evidence Documents: ${evidence.length}
- Log Entries: ${logs.length}
- Contacts: ${people.length}
- Active Alerts: ${alerts.filter((a: any) => !a.dismissed).length}

Recent Activity:
${timeline.slice(0, 5).map((e: any) => `- ${e.date}: ${e.title}`).join('\n')}

BASELINE ANALYSIS:
- Current Score: ${baseAnalysis.overallScore}/100
- Strengths: ${baseAnalysis.strengths.length}
- Risks: ${baseAnalysis.risks.length}

Provide 3-5 strategic insights that go beyond the basic analysis. Focus on:
1. Patterns in the data
2. Strategic opportunities
3. Hidden risks
4. Proactive recommendations
5. Long-term positioning

Format as a JSON array of insight strings.`;

    try {
      const response = await callGemini(prompt, AI_PROMPTS.advocate, apiKey);
      
      // Try to parse AI insights
      let aiInsights: string[] = [];
      try {
        aiInsights = JSON.parse(response);
      } catch {
        // If not JSON, split by lines
        aiInsights = response.split('\n').filter(line => line.trim().length > 0).slice(0, 5);
      }

      return {
        ...baseAnalysis,
        insights: [...baseAnalysis.insights, ...aiInsights],
      };
    } catch (error) {
      console.error('AI analysis error:', error);
      return baseAnalysis;
    }
  };

  const generateAlertsFromAnalysis = (analysis: AnalysisResult) => {
    const existingAlerts = JSON.parse(localStorage.getItem('wtp_alerts') || '[]');
    const newAlerts = [];

    // Generate alerts from high-severity risks
    for (const risk of analysis.risks) {
      if (risk.severity === 'high') {
        // Check if alert already exists
        const exists = existingAlerts.some((a: any) => 
          a.title.includes(risk.title) && !a.dismissed
        );

        if (!exists) {
          newAlerts.push({
            id: `strategy-risk-${Date.now()}-${Math.random()}`,
            type: 'risk',
            severity: 'high',
            title: risk.title,
            description: risk.description + '\n\nMitigation: ' + risk.mitigation,
            dismissed: false,
            createdAt: new Date().toISOString(),
            dueDate: risk.deadline,
          });
        }
      }
    }

    // Generate alerts from urgent recommendations
    for (const rec of analysis.recommendations) {
      if (rec.priority === 'urgent') {
        const exists = existingAlerts.some((a: any) => 
          a.title.includes(rec.title) && !a.dismissed
        );

        if (!exists) {
          newAlerts.push({
            id: `strategy-rec-${Date.now()}-${Math.random()}`,
            type: 'task',
            severity: 'high',
            title: rec.title,
            description: rec.description + '\n\nAction: ' + rec.action,
            dismissed: false,
            createdAt: new Date().toISOString(),
            actionUrl: rec.module,
            actionLabel: `Go to ${rec.module}`,
          });
        }
      }
    }

    if (newAlerts.length > 0) {
      const updatedAlerts = [...existingAlerts, ...newAlerts];
      localStorage.setItem('wtp_alerts', JSON.stringify(updatedAlerts));
      toast.info(`${newAlerts.length} new alerts generated from analysis`);
    }
  };

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getProgressColor = (status: ProgressArea['status']) => {
    switch (status) {
      case 'ahead': return 'bg-green-500';
      case 'on-track': return 'bg-blue-500';
      case 'behind': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Strategy Engine</h1>
              <p className="text-sm text-gray-600">AI-powered case analysis and recommendations</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => runAnalysis(false)}
              disabled={isAnalyzing}
              className="btn btn-secondary flex items-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              Quick Analysis
            </button>
            <button
              onClick={() => runAnalysis(true)}
              disabled={isAnalyzing || !apiKey}
              className="btn btn-primary flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              AI Analysis
            </button>
          </div>
        </div>

        {/* Overall Score */}
        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm opacity-80">Overall Strength</div>
                {analysis.trend === 'up' && <ArrowUp className="w-5 h-5" />}
                {analysis.trend === 'down' && <ArrowDown className="w-5 h-5" />}
                {analysis.trend === 'stable' && <Minus className="w-5 h-5" />}
              </div>
              <div className="text-4xl font-bold mb-1">{analysis.overallScore}%</div>
              <div className="text-sm opacity-80">
                {analysis.trend === 'up' && `↑ ${analysis.trendChange}% this week`}
                {analysis.trend === 'down' && `↓ ${Math.abs(analysis.trendChange)}% this week`}
                {analysis.trend === 'stable' && 'No change this week'}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div className="text-sm font-medium text-gray-700">Strengths</div>
              </div>
              <div className="text-3xl font-bold text-green-600 mb-1">{analysis.strengths.length}</div>
              <div className="text-sm text-gray-600">Building blocks</div>
            </div>

            <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div className="text-sm font-medium text-gray-700">Risks</div>
              </div>
              <div className="text-3xl font-bold text-red-600 mb-1">{analysis.risks.length}</div>
              <div className="text-sm text-gray-600">To address</div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-600" />
                <div className="text-sm font-medium text-gray-700">Actions</div>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-1">{analysis.recommendations.length}</div>
              <div className="text-sm text-gray-600">Recommended</div>
            </div>
          </div>
        )}

        {!analysis && !isAnalyzing && (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No analysis yet</h3>
            <p className="text-gray-600 mb-4">
              Run your first case analysis to get strategic insights
            </p>
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing your case data...</p>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && !isAnalyzing && (
        <>
          {/* Tabs */}
          <div className="card p-4">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'strengths', label: 'Strengths', icon: CheckCircle },
                { id: 'risks', label: 'Risks', icon: AlertTriangle },
                { id: 'recommendations', label: 'Actions', icon: Target },
                { id: 'progress', label: 'Progress', icon: BarChart3 },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      selectedTab === tab.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* AI Insights */}
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <h3 className="text-lg font-bold text-gray-900">Strategic Insights</h3>
                </div>
                <div className="space-y-3">
                  {analysis.insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="w-6 h-6 rounded-full bg-yellow-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-gray-700 flex-1">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Strengths */}
                <div className="card p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Top Strengths</h3>
                  <div className="space-y-3">
                    {analysis.strengths.slice(0, 3).map((strength, idx) => (
                      <div key={idx} className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="font-semibold text-gray-900 mb-1">{strength.title}</div>
                        <div className="text-sm text-gray-600">{strength.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Risks */}
                <div className="card p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Priority Risks</h3>
                  <div className="space-y-3">
                    {analysis.risks.slice(0, 3).map((risk, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border-2 ${getSeverityColor(risk.severity)}`}>
                        <div className="font-semibold text-gray-900 mb-1">{risk.title}</div>
                        <div className="text-sm text-gray-600">{risk.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Strengths Tab */}
          {selectedTab === 'strengths' && (
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Case Strengths</h3>
              <div className="space-y-4">
                {analysis.strengths.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No strengths identified yet. Continue building your case!</p>
                ) : (
                  analysis.strengths.map((strength, idx) => (
                    <div key={idx} className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 mb-1">{strength.title}</div>
                          <p className="text-gray-700 mb-3">{strength.description}</p>
                          {strength.evidence.length > 0 && (
                            <div>
                              <div className="text-sm font-semibold text-gray-700 mb-2">Supporting Evidence:</div>
                              <ul className="space-y-1">
                                {strength.evidence.map((ev, i) => (
                                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                    {ev}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          strength.importance === 'high' ? 'bg-green-600 text-white' :
                          strength.importance === 'medium' ? 'bg-green-100 text-green-700' :
                          'bg-green-50 text-green-600'
                        }`}>
                          {strength.importance}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Risks Tab */}
          {selectedTab === 'risks' && (
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Case Risks</h3>
              <div className="space-y-4">
                {analysis.risks.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No significant risks identified. Keep up the good work!</p>
                ) : (
                  analysis.risks.map((risk, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border-2 ${getSeverityColor(risk.severity)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <div className="font-bold text-gray-900">{risk.title}</div>
                          </div>
                          <p className="text-gray-700 mb-3">{risk.description}</p>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="text-sm font-semibold text-gray-700 mb-1">Mitigation Strategy:</div>
                            <p className="text-sm text-gray-600">{risk.mitigation}</p>
                          </div>
                          {risk.deadline && (
                            <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Deadline: {new Date(risk.deadline).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          risk.severity === 'high' ? 'bg-red-600 text-white' :
                          risk.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-50 text-yellow-600'
                        }`}>
                          {risk.severity}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Recommendations Tab */}
          {selectedTab === 'recommendations' && (
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recommended Actions</h3>
              <div className="space-y-4">
                {analysis.recommendations.map((rec, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border-2 ${
                    rec.priority === 'urgent' ? 'bg-red-50 border-red-200' :
                    rec.priority === 'high' ? 'bg-orange-50 border-orange-200' :
                    rec.priority === 'medium' ? 'bg-blue-50 border-blue-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-5 h-5 text-indigo-600" />
                          <div className="font-bold text-gray-900">{rec.title}</div>
                        </div>
                        <p className="text-gray-700 mb-2">{rec.description}</p>
                        <div className="bg-white rounded-lg p-3 border border-gray-200 mb-3">
                          <div className="text-sm font-semibold text-gray-700 mb-1">Action:</div>
                          <p className="text-sm text-gray-600">{rec.action}</p>
                        </div>
                        {rec.module && (
                          <button
                            onClick={() => onNavigate?.(rec.module!)}
                            className="btn btn-primary btn-sm"
                          >
                            Go to {rec.module}
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </button>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ml-4 ${
                        rec.priority === 'urgent' ? 'bg-red-600 text-white' :
                        rec.priority === 'high' ? 'bg-orange-600 text-white' :
                        rec.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Tab */}
          {selectedTab === 'progress' && (
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Progress Tracking</h3>
              <div className="space-y-6">
                {analysis.progress.map((prog, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-900">{prog.area}</div>
                      <div className="text-sm text-gray-600">
                        {prog.current} / {prog.target}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full transition-all ${getProgressColor(prog.status)}`}
                        style={{ width: `${Math.min(100, (prog.current / prog.target) * 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs font-medium ${
                        prog.status === 'ahead' ? 'text-green-600' :
                        prog.status === 'on-track' ? 'text-blue-600' :
                        prog.status === 'behind' ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {prog.status === 'ahead' ? '✓ Ahead of target' :
                         prog.status === 'on-track' ? '→ On track' :
                         prog.status === 'behind' ? '⚠ Behind target' :
                         '⚠ Critical'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round((prog.current / prog.target) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Info */}
          <div className="card p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                Last analyzed: {new Date(analysis.timestamp).toLocaleString()}
              </div>
              {isAnalysisStale(analysis.timestamp) && (
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="w-4 h-4" />
                  Analysis may be outdated - run again for latest insights
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
