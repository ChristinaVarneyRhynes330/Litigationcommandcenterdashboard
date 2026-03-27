import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age?: number;
  notes?: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string; // Judge, GAL, Opposing Counsel, Witness, etc.
  organization?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface Filing {
  id: string;
  title: string;
  filingDate: string;
  type: string; // Motion, Petition, Response, etc.
  status: string; // Filed, Draft, Pending
  dueDate?: string;
  notes?: string;
}

export interface CaseEvent {
  id: string;
  title: string;
  date: string;
  type: string; // Hearing, Deposition, Deadline, etc.
  location?: string;
  attendees?: string[];
  notes?: string;
  linkedEvidence?: string[];
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  category?: string;
  notes?: string;
}

export interface CaseData {
  // Core Case Info
  caseNumber: string;
  caseName: string;
  county: string;
  courtType: string; // Circuit, District, Family, Dependency
  filingDate: string;
  
  // Court Details
  judge: string;
  courtroom?: string;
  division?: string;
  
  // Case Entities
  children: Child[];
  contacts: Contact[];
  filings: Filing[];
  events: CaseEvent[];
  tasks: Task[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

interface CaseContextType {
  caseData: CaseData;
  updateCaseData: (updates: Partial<CaseData>) => void;
  addChild: (child: Omit<Child, 'id'>) => void;
  updateChild: (id: string, updates: Partial<Child>) => void;
  removeChild: (id: string) => void;
  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  removeContact: (id: string) => void;
  addFiling: (filing: Omit<Filing, 'id'>) => void;
  updateFiling: (id: string, updates: Partial<Filing>) => void;
  removeFiling: (id: string) => void;
  addEvent: (event: Omit<CaseEvent, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<CaseEvent>) => void;
  removeEvent: (id: string) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  resetCase: () => void;
}

const CASE_STORAGE_KEY = 'we_the_parent_case_data_v1';

const defaultCaseData: CaseData = {
  caseNumber: '',
  caseName: '',
  county: '',
  courtType: '',
  filingDate: '',
  judge: '',
  courtroom: '',
  division: '',
  children: [],
  contacts: [],
  filings: [],
  events: [],
  tasks: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export function CaseProvider({ children }: { children: ReactNode }) {
  const [caseData, setCaseData] = useState<CaseData>(() => {
    const stored = localStorage.getItem(CASE_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse case data:', e);
      }
    }
    return defaultCaseData;
  });

  // Save to localStorage whenever case data changes
  useEffect(() => {
    localStorage.setItem(CASE_STORAGE_KEY, JSON.stringify(caseData));
  }, [caseData]);

  const updateCaseData = (updates: Partial<CaseData>) => {
    setCaseData(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  };

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Child management
  const addChild = (child: Omit<Child, 'id'>) => {
    const newChild: Child = { ...child, id: generateId() };
    setCaseData(prev => ({
      ...prev,
      children: [...prev.children, newChild],
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateChild = (id: string, updates: Partial<Child>) => {
    setCaseData(prev => ({
      ...prev,
      children: prev.children.map(child => 
        child.id === id ? { ...child, ...updates } : child
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  const removeChild = (id: string) => {
    setCaseData(prev => ({
      ...prev,
      children: prev.children.filter(child => child.id !== id),
      updatedAt: new Date().toISOString(),
    }));
  };

  // Contact management
  const addContact = (contact: Omit<Contact, 'id'>) => {
    const newContact: Contact = { ...contact, id: generateId() };
    setCaseData(prev => ({
      ...prev,
      contacts: [...prev.contacts, newContact],
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setCaseData(prev => ({
      ...prev,
      contacts: prev.contacts.map(contact => 
        contact.id === id ? { ...contact, ...updates } : contact
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  const removeContact = (id: string) => {
    setCaseData(prev => ({
      ...prev,
      contacts: prev.contacts.filter(contact => contact.id !== id),
      updatedAt: new Date().toISOString(),
    }));
  };

  // Filing management
  const addFiling = (filing: Omit<Filing, 'id'>) => {
    const newFiling: Filing = { ...filing, id: generateId() };
    setCaseData(prev => ({
      ...prev,
      filings: [...prev.filings, newFiling],
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateFiling = (id: string, updates: Partial<Filing>) => {
    setCaseData(prev => ({
      ...prev,
      filings: prev.filings.map(filing => 
        filing.id === id ? { ...filing, ...updates } : filing
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  const removeFiling = (id: string) => {
    setCaseData(prev => ({
      ...prev,
      filings: prev.filings.filter(filing => filing.id !== id),
      updatedAt: new Date().toISOString(),
    }));
  };

  // Event management
  const addEvent = (event: Omit<CaseEvent, 'id'>) => {
    const newEvent: CaseEvent = { ...event, id: generateId() };
    setCaseData(prev => ({
      ...prev,
      events: [...prev.events, newEvent],
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateEvent = (id: string, updates: Partial<CaseEvent>) => {
    setCaseData(prev => ({
      ...prev,
      events: prev.events.map(event => 
        event.id === id ? { ...event, ...updates } : event
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  const removeEvent = (id: string) => {
    setCaseData(prev => ({
      ...prev,
      events: prev.events.filter(event => event.id !== id),
      updatedAt: new Date().toISOString(),
    }));
  };

  // Task management
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = { ...task, id: generateId() };
    setCaseData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setCaseData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === id ? { ...task, ...updates } : task
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  const removeTask = (id: string) => {
    setCaseData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== id),
      updatedAt: new Date().toISOString(),
    }));
  };

  const resetCase = () => {
    setCaseData(defaultCaseData);
    localStorage.removeItem(CASE_STORAGE_KEY);
  };

  return (
    <CaseContext.Provider
      value={{
        caseData,
        updateCaseData,
        addChild,
        updateChild,
        removeChild,
        addContact,
        updateContact,
        removeContact,
        addFiling,
        updateFiling,
        removeFiling,
        addEvent,
        updateEvent,
        removeEvent,
        addTask,
        updateTask,
        removeTask,
        resetCase,
      }}
    >
      {children}
    </CaseContext.Provider>
  );
}

export function useCaseContext() {
  const context = useContext(CaseContext);
  if (context === undefined) {
    throw new Error('useCaseContext must be used within a CaseProvider');
  }
  return context;
}
