# Litigation Command Center - Complete Implementation Roadmap

## Overview
This document outlines how to build and integrate all 30 features from the feature map into your existing React application structure.

---

## ✅ ALREADY IMPLEMENTED (Core Infrastructure)

### Working Components:
1. **Landing Page** - Entry point with professional branding
2. **Dashboard** - Main overview with Docket Clock
3. **Evidence Vault** - Document repository with Bates numbering system
4. **AI Legal Team Enhanced** - 5 specialized AI agents (Strategist, Drafter, Negotiator, Cross-Examiner, Clerk)
5. **Logistics** - Discovery tracking and conferral logs
6. **Hearing Mode** - Focus mode for courtroom prep
7. **Finance** - Expense tracking
8. **Law Library** - Legal research interface
9. **Discovery Manager** - File organization
10. **The Binder** - Trial binder with TOC generation
11. **Settings** - API key and Bates prefix configuration

### Working Infrastructure:
- ✅ Gemini API integration (`/utils/gemini.ts`)
- ✅ LocalStorage persistence
- ✅ Bates numbering engine
- ✅ State management
- ✅ Environment variables (VITE_GEMINI_API_KEY)
- ✅ Responsive design with mobile navigation
- ✅ Night Winter color palette

---

## 📋 FEATURES TO BUILD (Organized by Priority)

## PHASE 1: Core Data Management (High Priority)

### Feature #4: Case Profile / Case Kernel
**Status:** Needs dedicated interface  
**Location:** New component `/components/CaseProfile.tsx`

**What to Build:**
```typescript
interface CaseData {
  caseNumber: string;
  county: string;
  courtType: string;
  caseName: string;
  filingDate: string;
  judge: string;
  children: Child[];
  contacts: Contact[];
  filings: Filing[];
  events: Event[];
  tasks: Task[];
}
```

**Implementation Steps:**
1. Create CaseProfile component with form fields for core case info
2. Add navigation link in Sidebar
3. Store case data in localStorage under `case_profile_data`
4. Create context provider to share case data across components
5. Display case summary badge in Dashboard

**Dependencies:** None - Foundation for everything else

---

### Feature #11: Compliance Tracking (3.01(g) Conferral Log)
**Status:** Partially implemented in Logistics  
**Location:** Enhance `/components/Logistics.tsx`

**What to Build:**
- Conferral attempt logger with timestamps
- Email/letter template generator
- Compliance certificate generator
- Visual compliance status dashboard

**Implementation Steps:**
1. Add conferral log section to Logistics
2. Create form to log each conferral attempt
3. Generate downloadable certificate
4. Add timeline view of conferral attempts

---

### Feature #28: People Directory
**Status:** Basic structure exists at `/components/People.tsx`  
**Location:** Enhance existing component

**What to Build:**
- Contact categories (Witnesses, Opposing Counsel, Clerk, Judge, GAL, etc.)
- Contact cards with role, phone, email, notes
- Search and filter functionality
- Link contacts to events and evidence

**Implementation Steps:**
1. Create comprehensive contact form
2. Add categorization and tagging
3. Create contact directory view
4. Link contacts to case events

---

## PHASE 2: Evidence & Document Processing

### Feature #6: Multimodal Evidence Ingestion Layer
**Status:** Basic upload in EvidenceVault  
**Location:** Enhance `/components/EvidenceVault.tsx`

**What to Build:**
- Drag-and-drop upload zone
- Mobile camera integration (HTML5 capture)
- OCR text extraction using Gemini Vision API
- File preview and annotation tools
- Redaction toggle functionality

**Implementation Steps:**
1. Add file drop zone with react-dropzone
2. Implement file preview for PDFs, images, audio, video
3. Add OCR button that calls Gemini Vision API for image files
4. Create annotation overlay for marking up documents
5. Add redaction mode with black boxes

---

### Feature #7: Evidence Extractor / Fact-Finding Wizard
**Status:** Not implemented  
**Location:** Add to `/components/EvidenceVault.tsx` as modal

**What to Build:**
- AI-powered fact extraction from documents
- Named entity recognition (dates, names, locations)
- Quote extraction with source citation
- Link facts to original document location

**Implementation Steps:**
1. Add "Extract Facts" button to each evidence item
2. Send document text to Gemini with extraction prompt
3. Display extracted facts in structured format
4. Save extracted facts linked to evidence ID

---

### Feature #8: Evidence X-Ray (Admissibility Analysis)
**Status:** Not implemented  
**Location:** Add to `/components/EvidenceVault.tsx`

**What to Build:**
- Admissibility checker analyzing:
  - Relevance (FRE 401-403)
  - Hearsay exceptions (FRE 801-807)
  - Authentication requirements (FRE 901-902)
  - Best evidence rule (FRE 1001-1008)
- Foundation checklist generator

**Implementation Steps:**
1. Add "Check Admissibility" button to evidence items
2. Create AI prompt analyzing evidence against Florida rules
3. Display admissibility report with color-coded status
4. Generate foundation script for admission

---

### Feature #18: Predicate Builder / Foundation Builder
**Status:** Not implemented  
**Location:** New component `/components/FoundationBuilder.tsx`

**What to Build:**
- Word-for-word scripts for laying foundation
- Evidence type selection (business record, expert testimony, etc.)
- Question checklist generator
- Printable courtroom cards

**Implementation Steps:**
1. Create evidence type selector
2. Generate foundation questions using AI
3. Create printable script format
4. Link to Evidence Vault items

---

## PHASE 3: Timeline & Deadlines

### Feature #9: Timeline Builder
**Status:** Not implemented  
**Location:** New component `/components/TimelineBuilder.tsx`

**What to Build:**
- Interactive chronological timeline
- Event cards linked to evidence
- Visual timeline with zoom/scroll
- Export to narrative format

**Implementation Steps:**
1. Create timeline data structure
2. Build timeline visualization using Recharts or custom SVG
3. Add event creation form
4. Link events to evidence and contacts
5. Create timeline export function

**Libraries:** `recharts` or custom React components

---

### Feature #10: Deadline Calculator (Enhanced)
**Status:** Basic implementation in Dashboard  
**Location:** Enhance `/components/Dashboard.tsx`

**What to Build:**
- Rule-based deadline calculations:
  - 90-day service deadline
  - 135-day discovery deadline
  - 30-day response deadlines
  - Custom rule calculations
- Visual countdown timers
- Email/SMS reminders (if using backend)

**Implementation Steps:**
1. Add deadline calculator utility function
2. Create deadline rules engine
3. Display active deadlines in Dashboard
4. Add visual countdown with ProgressRing component
5. Add manual deadline override

---

### Feature #26: Alerts / Automated Notice System
**Status:** Not implemented  
**Location:** Add to `/components/Dashboard.tsx` and create notification system

**What to Build:**
- Alert cards for:
  - Upcoming deadlines (< 7 days)
  - Missing evidence
  - Incomplete filings
  - Timeline gaps
- Dismissible alerts with localStorage tracking

**Implementation Steps:**
1. Create alerts checker function
2. Display alert badges in Dashboard
3. Add alert detail modal
4. Store dismissed alerts in localStorage

---

## PHASE 4: AI-Powered Legal Tools

### Feature #1: Chat Command Center / AI Chat Vault
**Status:** Implemented as War Room in AILegalTeamEnhanced  
**Enhancement:** Add conversation history vault

**What to Build:**
- Save all chat sessions with timestamps
- Searchable conversation archive
- Flag important messages
- Promote AI outputs to strategy notes

**Implementation Steps:**
1. Modify AILegalTeamEnhanced to save all conversations
2. Add conversation history panel
3. Create search function
4. Add "Save to Strategy" button on messages

---

### Feature #2: Reflection / Recollection Log System
**Status:** Not implemented  
**Location:** New component `/components/RecollectionLog.tsx`

**What to Build:**
- Voice dictation input (Web Speech API)
- Raw thought capture
- AI-powered structuring and fact extraction
- Name/date/issue identification

**Implementation Steps:**
1. Add speech-to-text button using Web Speech API
2. Create text input for manual entry
3. Send raw text to Gemini for structuring
4. Save structured data to case logs

---

### Feature #3: Conversation History Vault
**Status:** Not implemented  
**Location:** Enhance `/components/AILegalTeamEnhanced.tsx`

**What to Build:**
- Full chat session storage
- Session browser with search
- Export conversations to drafts
- Tag and categorize conversations

**Implementation Steps:**
1. Save every chat message to localStorage with metadata
2. Create history browser UI
3. Add search and filter
4. Add export to document function

---

### Feature #12: Narrative Generator
**Status:** Not implemented  
**Location:** Link to Timeline Builder

**What to Build:**
- Select timeline events
- Generate persuasive narrative
- Editable output
- Export for declarations

**Implementation Steps:**
1. Add event selection in Timeline
2. Create "Generate Narrative" button
3. Send events to Gemini with narrative prompt
4. Display editable narrative
5. Save to drafting area

---

### Feature #13: AI Legal Research Assistant (Enhanced)
**Status:** Basic in Law Library  
**Location:** Enhance `/components/LawLibrary.tsx`

**What to Build:**
- Florida statute search
- Case law search with citations
- Plain language legal answers
- Save research to notes

**Implementation Steps:**
1. Add research query input
2. Call Gemini with research prompt
3. Format with proper citations
4. Add "Save Research" button

---

### Feature #14: Citation Builder
**Status:** Not implemented  
**Location:** Add to `/components/LawLibrary.tsx`

**What to Build:**
- Auto-format citations in Bluebook style
- Citation suggestion during drafting
- Link to source materials
- Citation library

**Implementation Steps:**
1. Create citation formatter utility
2. Add citation input form
3. Generate Bluebook-formatted output
4. Store citations in library

---

### Feature #15: Drafting Engine
**Status:** Implemented in AILegalTeamEnhanced with Drafter agent  
**Enhancement:** Add step-by-step workflow

**What to Build:**
- Guided drafting wizard
- Pull case facts from Case Profile
- Pull legal authorities from Law Library
- 20-minute completion goal

**Implementation Steps:**
1. Add wizard UI to Drafter chat
2. Pull case data from context
3. Create multi-step prompt sequence
4. Generate downloadable Word/PDF

---

### Feature #16: Strategy Planner
**Status:** Partially in AILegalTeamEnhanced (Strategist)  
**Enhancement:** Add dedicated strategy view

**What to Build:**
- Case posture assessment
- SWOT analysis
- Risk identification
- Next steps recommendations
- Timing optimization

**Implementation Steps:**
1. Create strategy dashboard
2. Add case analysis prompt
3. Display strategic recommendations
4. Track strategic decisions

---

### Feature #17: Contradiction Index Engine
**Status:** Not implemented  
**Location:** New component `/components/ContradictionFinder.tsx`

**What to Build:**
- Compare statements across documents
- Flag inconsistencies
- Generate impeachment scripts
- Link to evidence sources

**Implementation Steps:**
1. Select documents to compare
2. Extract statements using AI
3. Cross-reference and find conflicts
4. Display contradiction report

---

### Feature #19: GAL Accountability Checker
**Status:** Not implemented  
**Location:** New component `/components/GALChecker.tsx`

**What to Build:**
- Analyze GAL conduct against Florida standards
- Bias detection
- Citation generator for challenges
- Compliance checklist

**Implementation Steps:**
1. Create GAL statement input
2. Send to Gemini with Florida GAL standards
3. Generate bias analysis
4. Create challenge template

---

## PHASE 5: Courtroom Tools

### Feature #20: Courtroom Prep Studio
**Status:** Implemented as Hearing Mode  
**Enhancement:** Add rehearsal features

**What to Build:**
- Script editor with AI feedback
- Judge simulator (already implemented)
- Timing rehearsal
- Weakness identifier

**Implementation Steps:**
1. Add script timing calculator
2. Create weakness analysis prompt
3. Add rehearsal mode with stopwatch

---

### Feature #21: Live Courtroom Helper
**Status:** Not implemented  
**Location:** Add to `/components/HearingMode.tsx`

**What to Build:**
- Live transcription (Web Speech API)
- Manual note-taking mode
- Objection glossary quick reference
- Issue spotter

**Implementation Steps:**
1. Add speech-to-text for live transcription
2. Create note-taking textarea
3. Add objection reference cards
4. Create collapsible quick reference panel

---

### Feature #22: Transcription Engine
**Status:** Not implemented  
**Location:** New component `/components/TranscriptionTool.tsx`

**What to Build:**
- Audio file upload
- Transcription using Gemini or Web Speech API
- Speaker tagging
- Searchable output

**Implementation Steps:**
1. Add audio file uploader
2. Convert audio to text (browser or API)
3. Add speaker identification
4. Save transcripts to evidence

---

### Feature #29: Panic Button
**Status:** Emergency guidance function exists in App.tsx  
**Enhancement:** Add floating UI button

**What to Build:**
- Floating panic button (always visible)
- Emergency scenario selector
- Immediate guidance display
- Action checklists

**Implementation Steps:**
1. Add floating button component
2. Create modal with scenario selector
3. Call handleEmergencyGuidance
4. Display actionable checklist

---

## PHASE 6: Final Features

### Feature #24: Binder Export
**Status:** Implemented at `/components/Binder.tsx`  
**Enhancement:** Add professional export

**What to Build:**
- Print-optimized styling
- PDF export capability
- Auto-generated TOC
- Tab dividers

**Implementation Steps:**
1. Add print CSS
2. Create PDF export using browser print
3. Generate TOC from evidence
4. Add tab divider pages

---

### Feature #25: Certificate of Service Generator
**Status:** Not implemented  
**Location:** Add to `/components/Binder.tsx` or drafting area

**What to Build:**
- Auto-populate service certificate
- Service method selector
- Date auto-fill
- Template insertion

**Implementation Steps:**
1. Create certificate template
2. Add form for service details
3. Auto-fill from case data
4. Append to documents

---

### Feature #27: Finance & Costs
**Status:** Implemented at `/components/Finance.tsx`  
**Enhancement:** Add Bill of Costs generator

**What to Build:**
- Categorized expense tracking
- Receipt attachment
- Bill of Costs export
- Cost recovery calculator

**Implementation Steps:**
1. Add expense categories
2. Create receipt upload
3. Generate Bill of Costs template
4. Calculate total recoverable costs

---

### Feature #30: Discovery Manager
**Status:** Implemented at `/components/DiscoveryManager.tsx`  
**Enhancement:** Add AI organization

**What to Build:**
- Auto-categorize uploaded files
- Smart folder suggestions
- Duplicate detection
- Response tracking

**Implementation Steps:**
1. Add file categorization logic
2. Create folder structure
3. Add duplicate file checker
4. Track discovery responses

---

## 🎯 RECOMMENDED BUILD ORDER

### Week 1: Core Foundation
1. Case Profile (#4) - **Critical foundation**
2. People Directory (#28)
3. Enhanced Compliance Tracking (#11)

### Week 2: Evidence Processing
4. Multimodal Evidence Ingestion (#6)
5. Evidence Extractor (#7)
6. Evidence X-Ray (#8)

### Week 3: Timeline & Planning
7. Timeline Builder (#9)
8. Enhanced Deadline Calculator (#10)
9. Alert System (#26)
10. Strategy Planner (#16)

### Week 4: AI Legal Tools
11. Recollection Log (#2)
12. Conversation History Vault (#3)
13. Narrative Generator (#12)
14. Contradiction Finder (#17)

### Week 5: Courtroom & Drafting
15. Foundation Builder (#18)
16. Live Courtroom Helper (#21)
17. Transcription Engine (#22)
18. Citation Builder (#14)

### Week 6: Specialized Features
19. GAL Accountability Checker (#19)
20. Panic Button UI (#29)
21. Certificate of Service (#25)
22. Enhanced Binder Export (#24)

---

## 🔧 TECHNICAL IMPLEMENTATION GUIDE

### State Management Strategy
```typescript
// Create centralized context for case data
interface AppContext {
  caseProfile: CaseData;
  evidence: Evidence[];
  timeline: TimelineEvent[];
  contacts: Contact[];
  conversations: ChatSession[];
  // ... etc
}

// Use React Context + localStorage
const AppContext = createContext<AppContext>(defaultState);
```

### Component Communication Pattern
```
App.tsx (State Container)
├── CaseProfileContext.Provider
│   ├── Dashboard (read case data)
│   ├── EvidenceVault (read/write evidence)
│   ├── TimelineBuilder (read case data + evidence)
│   ├── AILegalTeamEnhanced (read all, write conversations)
│   └── Binder (read evidence)
```

### AI Integration Pattern
All AI features follow this pattern:
```typescript
// 1. Prepare context-aware prompt
const prompt = `${AI_PROMPTS.base}\nCase: ${caseData.caseName}\nTask: ${userRequest}`;

// 2. Call Gemini
const response = await callGemini(prompt, systemPrompt, apiKey);

// 3. Parse and display result
const structured = parseAIResponse(response);

// 4. Save to localStorage
saveToHistory(structured);
```

### File Upload & Processing
```typescript
// Evidence ingestion flow
1. User uploads file → FileReader API
2. Extract metadata → file.name, file.type, file.size
3. Extract text → 
   - PDF: use pdfjs-dist
   - Image: Gemini Vision API
   - DOCX: use mammoth
4. Generate Bates number
5. Save to localStorage + display
```

---

## 📦 REQUIRED LIBRARIES (Add to package.json)

```json
{
  "dependencies": {
    // Already have these:
    "react": "^18.3.1",
    "lucide-react": "latest",
    "recharts": "^2.x",
    
    // Need to add:
    "react-dropzone": "^14.x",        // File uploads
    "date-fns": "^3.x",               // Date calculations
    "pdfjs-dist": "^4.x",             // PDF text extraction
    "mammoth": "^1.x",                // DOCX to HTML
    "react-speech-recognition": "^3.x" // Voice dictation
  }
}
```

---

## 🎨 UI COMPONENT LIBRARY USAGE

Your Night Winter palette is already configured in `/styles/globals.css`.

### Component Patterns:
- **Forms:** Use existing form components from `/components/ui/`
- **Data Display:** Card components with elevation
- **Navigation:** Tabs for multi-step workflows
- **Modals:** Dialog component for focused tasks
- **Lists:** Accordion for collapsible sections
- **Status:** Badge component with color coding

---

## ✨ QUICK START: Build Your First Feature

### Example: Building the Panic Button UI

**Step 1:** Create floating button in App.tsx
```typescript
// Add to App.tsx after Settings button
<button
  onClick={() => setIsPanicOpen(true)}
  className="fixed bottom-4 right-4 btn btn-error btn-lg rounded-full shadow-xl"
  aria-label="Emergency Guidance"
>
  🚨 PANIC
</button>
```

**Step 2:** Create modal with scenarios
```typescript
// In PanicButton.tsx
const scenarios = [
  { id: 'missed_deadline', label: 'Missed a Deadline', icon: '⏰' },
  { id: 'motion_dismiss', label: 'Motion to Dismiss Filed', icon: '⚖️' },
  { id: 'conferral_fail', label: 'Conferral Failed', icon: '📧' }
];
```

**Step 3:** Call existing emergency function
```typescript
const handleScenario = async (scenario: string) => {
  setLoading(true);
  const guidance = await handleEmergencyGuidance(scenario);
  setGuidance(guidance);
  setLoading(false);
};
```

**Step 4:** Display results
```typescript
<div className="prose">
  {guidance.split('\n').map((line, i) => (
    <p key={i}>{line}</p>
  ))}
</div>
```

---

## 🚀 DEPLOYMENT CHECKLIST

Before deploying each new feature:
- [ ] Test localStorage persistence
- [ ] Test with empty state (first-time user)
- [ ] Test mobile responsiveness
- [ ] Test with/without API key
- [ ] Test Gemini API error handling
- [ ] Verify Night Winter palette usage
- [ ] Add to navigation if needed

---

## 📞 NEXT STEPS

**Choose your starting point:**
1. **Want complete functionality first?** → Start with Case Profile + People Directory
2. **Want impressive AI features?** → Start with Evidence Extractor + Contradiction Finder  
3. **Want courtroom tools?** → Start with Panic Button UI + Foundation Builder
4. **Want the full timeline?** → Start with Timeline Builder + Deadline Calculator

**Tell me which feature you want to build first, and I'll:**
1. Generate the complete component code
2. Wire it into your existing app structure
3. Test it with your Gemini API integration
4. Deploy it to your Vercel instance

---

## 🎓 FEATURE IMPLEMENTATION TEMPLATES

Each feature follows this template structure:

```typescript
// /components/FeatureName.tsx
import { useState } from 'react';
import { callGemini } from '../utils/gemini';

interface FeatureNameProps {
  // Props from App.tsx
}

export function FeatureName({ }: FeatureNameProps) {
  // Local state
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Handlers
  const handleAction = async () => {
    setLoading(true);
    // Call AI or process data
    setLoading(false);
  };
  
  // Render
  return (
    <div className="space-y-6">
      <h1>Feature Name</h1>
      {/* Feature UI */}
    </div>
  );
}
```

---

**Ready to build? Tell me which feature to start with! 🚀**
