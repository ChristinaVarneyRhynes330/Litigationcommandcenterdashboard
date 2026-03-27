The **We The Parent™ — Full Project Feature Map** is a consolidated legal operating system for pro se dependency litigation, now fully implemented in a React architecture that merges the core functionality of the original HTML mockup with modern design and maintainability. The system is made of distinct but interconnected modules, all centered around managing a single case.

Here is the consolidated feature map, detailing the complete functionality and purpose of each module, including confirmed implementation and enhancements:

### **I. Core Application Modules (The System Backbone)**

| No.    | Feature Name                                    | Functionality and Purpose                                                                                                                                                                                                                                                                                          |
| :----: | :---------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1.** | **Chat Command Center / AI Chat Vault**         | The main conversational interface, implemented as the **War Room Chat Interface** using the **Strategist (Teal)** agent. It handles user questions, file uploads, and thought dictation, providing case-aware answers and securely storing all **AI Conversation History** for later reuse in strategy or motions. |
| **2.** | **Reflection / Recollection Log System**        | Captures raw, spoken, or typed "thought dumps." It structures and extracts key facts like names, dates, possible issues, and contradictions, preserving the user's original wording before saving the data as structured case logs.                                                                                |
| **3.** | **Conversation History Vault**                  | A secure archive that stores timestamped, case-linked chat sessions, makes them searchable, and allows users to flag useful AI outputs for promotion to strategy notes or draft support.                                                                                                                           |
| **4.** | **Case Profile / Case Kernel**                  | The system's central backbone. It stores all core data entities (`Case`, `Child`, `Contact`, `Filing`, `Evidence`, `Event/Hearing`, `Task`, etc.), upon which every other feature relies.                                                                                                                          |
| **5.** | **Evidence Binder / Evidence Management**       | The central repository for documents. It accepts and securely stores uploads (PDFs, DOCX, images, audio/video), extracts text and metadata, and links the evidence to issues, events, and drafts.                                                                                                                  |
| **6.** | **Multimodal Evidence Ingestion Layer**         | The intake pipeline for evidence, featuring cross-platform uploads via drag-and-drop or mobile camera scan-to-PDF. It includes **Scribe OCR** for image-to-text transcription, as well as annotation overlays, exhibit labeling, and redaction toggles.                                                            |
| **7.** | **Evidence Extractor / Fact-Finding Wizard**    | A tool that uses AI to pull critical, referenceable data (dates, names, quotes) from documents and link the extracted facts directly to their source location in the original document.                                                                                                                            |
| **8.** | **Exhibit Engine / Court-Ready Evidence Layer** | Structures uploaded materials into courtroom-usable exhibits. It applies **Bates Numbering** (with a customizable prefix, defaulted to PLTF), maintains a chain-of-custody log, and supports export into the filing binder. It also includes the **Evidence X-Ray** for admissibility analysis.                    |

### **II. Timeline, Deadlines, and Logistics**

| No.     | Feature Name                                           | Functionality and Purpose                                                                                                                                                                                                                             |
| :-----: | :----------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **9.**  | **Timeline Builder / Procedural Chronology Generator** | Creates a chronological, interactive record of all case events (filings, hearings, contacts), linking each event to its supporting evidence.                                                                                                          |
| **10.** | **Deadline Calculator / Notification System**          | Tracks all hearing and filing deadlines. The **Dashboard's Docket Clock** automatically performs **Specific Date Math** to calculate key deadlines, including the 90-day service deadline, 135-day discovery estimate, and 30-day response due dates. |
| **11.** | **Compliance Tracking**                                | Helps users track and prove compliance with required tasks and services. The **Logistics** section includes the **Discovery Tracker** and the **3.01(g) Conferral Log** for documenting attempts at conferral with opposing counsel.                  |
| **12.** | **Narrative Generator**                                | A synthesis tool that takes selected timeline events and turns them into a persuasive, editable written chronology or case narrative for use in declarations and summaries.                                                                           |

### **III. Legal Drafting and AI Consultation**

| No.     | Feature Name                                    | Functionality and Purpose                                                                                                                                                                                                                                         |
| :-----: | :---------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **13.** | **AI Legal Research Assistant**                 | Provides source-anchored answers to legal questions in plain language, using RAG over the **Florida Corpus** (curated legal packs). It includes the **Precedent Finder** to generate search queries for binding case law and saves results to **Research Notes**. |
| **14.** | **Citation Builder / Auto-Suggestion**          | Formats statutes and cases in professional, Bluebook-style, attaches corresponding links, and suggests relevant authorities during the drafting process.                                                                                                          |
| **15.** | **Drafting Engine / Document Authoring Engine** | A system, powered by the **Drafter (Rose)** agent, that uses a stepwise process to guide factual intake, pull case facts and legal authorities, and produce court-ready drafts of motions, affidavits, and objections, aiming for completion in ≤ 20 minutes.     |
| **16.** | **Strategy Planner / AI Case Analysis**         | The "thinking layer" that tracks case posture, identifies risks/strengths, and suggests next steps. It includes advanced components like **Predictive Analytics & Outcome Forecasting** and **Timing Optimization**.                                              |
| **17.** | **Contradiction Index Engine**                  | A specialized function that automatically compares statements across various records (affidavits, testimony, logs) to flag inconsistencies for strategy and impeachment.                                                                                          |
| **18.** | **Predicate Builder / Foundation Builder**      | A courtroom aid that provides word-for-word scripts and question checklists required to lay the legal foundation for admitting evidence.                                                                                                                          |
| **19.** | **GAL Accountability Checker**                  | Analyzes the conduct and statements of the Guardian ad Litem (GAL) against Florida legal standards and flags potential bias, providing citations for a formal challenge.                                                                                          |

### **IV. Courtroom, Financial, and Management Tools**

| No.     | Feature Name                                              | Functionality and Purpose                                                                                                                                                                                                            |
| :-----: | :-------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **20.** | **Courtroom Prep Studio / Prep Room**                     | Supports rehearsal via **Focus Mode (HearingMode)** (a dedicated dark mode that hides distractions). It features a hearing script editor and an AI **Judge Simulator** to predict and generate likely questions based on the script. |
| **21.** | **Live Courtroom Helper / Real-Time Court Support**       | Assists during hearings with features like live transcription/manual note mode, **Objection Glossaries**, issue spotting, and quick references. This feeds directly into the post-hearing log.                                       |
| **22.** | **Transcription Engine**                                  | Converts uploaded audio (from hearings or interviews) into searchable text, supporting speaker tagging for use in evidence review.                                                                                                   |
| **23.** | **Dashboard / Litigation Control Dashboard**              | The primary overview layer, summarizing upcoming hearings, recent evidence, drafted filings, and urgent alerts, often using color-coded status indicators.                                                                           |
| **24.** | **Binder Export / Filing Index**                          | The final packaging layer, implemented as **The Binder** component. It generates a professional, printable trial binder **Table of Contents (TOC)** based on evidence organization and Bates numbers.                                |
| **25.** | **Service of Process / Certificate of Service Generator** | A procedural layer that automatically adds and fills the Certificate of Service block onto final court filings.                                                                                                                      |
| **26.** | **Alerts / Automated Notice System**                      | An automated monitoring layer that sends reminders for deadlines, missing items, chronology gaps, and unresolved filings.                                                                                                            |
| **27.** | **Finance & Costs**                                       | Tracks total litigation costs (e.g., printing expenses) for potential inclusion in a **Bill of Costs** if the user prevails.                                                                                                         |
| **28.** | **People Directory**                                      | Allows users to log and categorize case contacts such as Witnesses, Opposing Counsel, Clerk, and Judge.                                                                                                                              |
| **29.** | **Panic Button (Emergency Triage)**                       | A floating emergency feature that, when triggered, offers immediate AI guidance for three scenarios: **Missed Deadlines, Motion to Dismiss, and Conferral Failure**.                                                                 |
| **30.** | **Discovery Manager**                                     | An AI-powered file organization system.                                                                                                                                                                                              |

### **V. Implementation and Design Summary**

The project has successfully completed the migration and integration phase, resulting in a single application that combines the functional strengths of the original prototype with the structural benefits of React.

**Key Implementation Highlights:**

  * **Completion Status:** All critical, AI-driven components from the HTML mockup (War Room, Motion Drafter, Focus Mode, Panic Button, Settings, The Binder, and all 5+ specialized AI agents) have been successfully **Ported to the React framework**.
  * **AI Staff Directory:** The **AILegalTeamEnhanced** component manages five specialized AI agents, each with a unique role and color:
      * **Strategist (Teal)**: War Room chat.
      * **Drafter (Rose)**: Motion generation.
      * **Negotiator (Deep Teal)**: Settlement analysis.
      * **Cross-Examiner (Deep Rose)**: Witness prep.
      * **Clerk (Sage)**: Procedural compliance.
  * **Data Persistence:** The application features complete state management, with all settings, the Bates counter, evidence arrays, and chat history saved to `localStorage`.

**UI/UX and Design Philosophy:**

  * **Unified Color Palette:** The design successfully integrates the **Unified Luxury Color Palette** across the application, achieving a premium feel by combining:
      * **Signature Rose-Gold:** The primary signature color, providing warmth and empowerment.
      * **Sophisticated Teal & Sage:** Used as professional, calming secondary accents.
      * **Warm Neutrals:** The foundation for elegance and rich charcoals for contrast.
  * **Superior User Experience:** The design is praised for its **Clean Typography Hierarchy** (Playfair Display, Lato, Cormorant Garamond), **Practical Workflows**, and superior **Mobile Responsive UX**.
  * **Innovative Features:** The **Focus Mode** for courtroom prep and the **Panic Button (Emergency Triage)** are highlighted as "brilliant" and "genius" features for mitigating litigation stress.
