import { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase,
  User,
  X,
  Save,
  Calendar,
  FileText,
  Link as LinkIcon
} from 'lucide-react';
import { useCaseContext } from '../contexts/CaseContext';
import { toast } from 'sonner@2.0.3';

interface Person {
  id: string;
  name: string;
  role: string;
  relationship: string;
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  organization?: string;
  notes: string;
  timeline: string[]; // event IDs
  evidence: string[]; // exhibit IDs
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export function PeopleDirectory() {
  const { caseData } = useCaseContext();
  const [people, setPeople] = useState<Person[]>(() => {
    const saved = localStorage.getItem('wtp_people');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCreating, setIsCreating] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [viewingPerson, setViewingPerson] = useState<Person | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [newPerson, setNewPerson] = useState<Partial<Person>>({
    name: '',
    role: '',
    relationship: '',
    contact: {},
    organization: '',
    notes: '',
    tags: [],
    timeline: [],
    evidence: [],
  });

  // Save people to localStorage
  const savePeople = (updatedPeople: Person[]) => {
    setPeople(updatedPeople);
    localStorage.setItem('wtp_people', JSON.stringify(updatedPeople));
  };

  // Create new person
  const handleCreatePerson = () => {
    if (!newPerson.name?.trim() || !newPerson.role?.trim()) {
      toast.error('Please provide name and role');
      return;
    }

    const person: Person = {
      id: `person-${Date.now()}`,
      name: newPerson.name,
      role: newPerson.role,
      relationship: newPerson.relationship || '',
      contact: newPerson.contact,
      organization: newPerson.organization,
      notes: newPerson.notes || '',
      timeline: newPerson.timeline || [],
      evidence: newPerson.evidence || [],
      tags: newPerson.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    savePeople([...people, person]);
    setNewPerson({
      name: '',
      role: '',
      relationship: '',
      contact: {},
      organization: '',
      notes: '',
      tags: [],
      timeline: [],
      evidence: [],
    });
    setIsCreating(false);
    toast.success('Person added to directory!');
  };

  // Update existing person
  const handleUpdatePerson = () => {
    if (!editingPerson) return;

    const updatedPeople = people.map(person =>
      person.id === editingPerson.id
        ? { ...editingPerson, updatedAt: new Date().toISOString() }
        : person
    );

    savePeople(updatedPeople);
    setEditingPerson(null);
    toast.success('Person updated!');
  };

  // Delete person
  const handleDeletePerson = (personId: string) => {
    if (confirm('Are you sure you want to remove this person from your directory?')) {
      savePeople(people.filter(person => person.id !== personId));
      setViewingPerson(null);
      toast.success('Person removed');
    }
  };

  // Get all unique roles
  const allRoles = Array.from(new Set(people.map(p => p.role)));

  // Filter people
  const filteredPeople = people.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.organization?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || person.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Role presets
  const rolePresets = [
    'Guardian Ad Litem (GAL)',
    'Case Manager',
    'Judge',
    'Attorney',
    'Therapist',
    'Service Provider',
    'Witness',
    'Family Member',
    'DCF Worker',
    'Supervisor',
    'Other'
  ];

  // Relationship presets
  const relationshipPresets = [
    'Neutral',
    'Supportive',
    'Adversarial',
    'Professional',
    'Family',
    'Unknown'
  ];

  // Group people by role
  const peopleByRole = filteredPeople.reduce((acc, person) => {
    if (!acc[person.role]) {
      acc[person.role] = [];
    }
    acc[person.role].push(person);
    return acc;
  }, {} as Record<string, Person[]>);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">People Directory</h1>
              <p className="text-sm text-gray-600">Case participants and contacts</p>
            </div>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Person
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-teal-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-teal-600">{people.length}</div>
            <div className="text-sm text-gray-600">Total People</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{allRoles.length}</div>
            <div className="text-sm text-gray-600">Roles</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {people.filter(p => p.contact?.phone || p.contact?.email).length}
            </div>
            <div className="text-sm text-gray-600">With Contact Info</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">
              {people.reduce((sum, p) => sum + p.timeline.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Timeline Links</div>
          </div>
        </div>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingPerson) && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isCreating ? 'Add New Person' : 'Edit Person'}
            </h2>
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingPerson(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={isCreating ? newPerson.name : editingPerson?.name || ''}
                  onChange={(e) => {
                    if (isCreating) {
                      setNewPerson({ ...newPerson, name: e.target.value });
                    } else if (editingPerson) {
                      setEditingPerson({ ...editingPerson, name: e.target.value });
                    }
                  }}
                  placeholder="Full name"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={isCreating ? newPerson.role : editingPerson?.role || ''}
                  onChange={(e) => {
                    if (isCreating) {
                      setNewPerson({ ...newPerson, role: e.target.value });
                    } else if (editingPerson) {
                      setEditingPerson({ ...editingPerson, role: e.target.value });
                    }
                  }}
                  className="input w-full"
                >
                  <option value="">Select role...</option>
                  {rolePresets.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship
                </label>
                <select
                  value={isCreating ? newPerson.relationship : editingPerson?.relationship || ''}
                  onChange={(e) => {
                    if (isCreating) {
                      setNewPerson({ ...newPerson, relationship: e.target.value });
                    } else if (editingPerson) {
                      setEditingPerson({ ...editingPerson, relationship: e.target.value });
                    }
                  }}
                  className="input w-full"
                >
                  <option value="">Select relationship...</option>
                  {relationshipPresets.map((rel) => (
                    <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization
                </label>
                <input
                  type="text"
                  value={isCreating ? newPerson.organization : editingPerson?.organization || ''}
                  onChange={(e) => {
                    if (isCreating) {
                      setNewPerson({ ...newPerson, organization: e.target.value });
                    } else if (editingPerson) {
                      setEditingPerson({ ...editingPerson, organization: e.target.value });
                    }
                  }}
                  placeholder="e.g., DCF, Children's Network"
                  className="input w-full"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase">Contact Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={isCreating ? newPerson.contact?.phone : editingPerson?.contact?.phone || ''}
                  onChange={(e) => {
                    if (isCreating) {
                      setNewPerson({ 
                        ...newPerson, 
                        contact: { ...newPerson.contact, phone: e.target.value }
                      });
                    } else if (editingPerson) {
                      setEditingPerson({ 
                        ...editingPerson, 
                        contact: { ...editingPerson.contact, phone: e.target.value }
                      });
                    }
                  }}
                  placeholder="(555) 123-4567"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={isCreating ? newPerson.contact?.email : editingPerson?.contact?.email || ''}
                  onChange={(e) => {
                    if (isCreating) {
                      setNewPerson({ 
                        ...newPerson, 
                        contact: { ...newPerson.contact, email: e.target.value }
                      });
                    } else if (editingPerson) {
                      setEditingPerson({ 
                        ...editingPerson, 
                        contact: { ...editingPerson.contact, email: e.target.value }
                      });
                    }
                  }}
                  placeholder="email@example.com"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={isCreating ? newPerson.contact?.address : editingPerson?.contact?.address || ''}
                  onChange={(e) => {
                    if (isCreating) {
                      setNewPerson({ 
                        ...newPerson, 
                        contact: { ...newPerson.contact, address: e.target.value }
                      });
                    } else if (editingPerson) {
                      setEditingPerson({ 
                        ...editingPerson, 
                        contact: { ...editingPerson.contact, address: e.target.value }
                      });
                    }
                  }}
                  placeholder="Street address"
                  rows={3}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={isCreating ? newPerson.notes : editingPerson?.notes || ''}
                  onChange={(e) => {
                    if (isCreating) {
                      setNewPerson({ ...newPerson, notes: e.target.value });
                    } else if (editingPerson) {
                      setEditingPerson({ ...editingPerson, notes: e.target.value });
                    }
                  }}
                  placeholder="Additional information..."
                  rows={3}
                  className="input w-full"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={isCreating ? handleCreatePerson : handleUpdatePerson}
              className="btn btn-primary flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {isCreating ? 'Add Person' : 'Update Person'}
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingPerson(null);
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Person Detail View */}
      {viewingPerson && !editingPerson && (
        <div className="card p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold">
                {viewingPerson.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{viewingPerson.name}</h2>
                <p className="text-gray-600">{viewingPerson.role}</p>
                {viewingPerson.organization && (
                  <p className="text-sm text-gray-500">{viewingPerson.organization}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingPerson(viewingPerson);
                  setViewingPerson(null);
                }}
                className="btn btn-secondary btn-sm"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewingPerson(null)}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase">Contact Information</h3>
              
              {viewingPerson.contact?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <a href={`tel:${viewingPerson.contact.phone}`} className="text-brand-teal hover:underline">
                    {viewingPerson.contact.phone}
                  </a>
                </div>
              )}

              {viewingPerson.contact?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <a href={`mailto:${viewingPerson.contact.email}`} className="text-brand-teal hover:underline">
                    {viewingPerson.contact.email}
                  </a>
                </div>
              )}

              {viewingPerson.contact?.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-700">{viewingPerson.contact.address}</span>
                </div>
              )}

              {viewingPerson.relationship && (
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Relationship: {viewingPerson.relationship}</span>
                </div>
              )}
            </div>

            {/* Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase">Case Links</h3>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">
                    {viewingPerson.timeline.length} Timeline Events
                  </div>
                  <div className="text-sm text-gray-600">Linked to this person</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-medium text-gray-900">
                    {viewingPerson.evidence.length} Evidence Items
                  </div>
                  <div className="text-sm text-gray-600">Related documents</div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {viewingPerson.notes && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Notes</h3>
              <p className="text-gray-700 whitespace-pre-line p-4 bg-gray-50 rounded-lg">
                {viewingPerson.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => handleDeletePerson(viewingPerson.id)}
              className="btn btn-ghost text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove from Directory
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      {!isCreating && !editingPerson && !viewingPerson && (
        <div className="card p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search people..."
                className="input w-full pl-10"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="input md:w-64"
            >
              <option value="all">All Roles</option>
              {allRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* People Grid */}
      {!isCreating && !editingPerson && !viewingPerson && (
        <div className="space-y-6">
          {filteredPeople.length === 0 ? (
            <div className="card p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No people in directory yet</h3>
              <p className="text-gray-600 mb-4">
                Start building your case contact directory
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="btn btn-primary"
              >
                Add First Person
              </button>
            </div>
          ) : (
            Object.entries(peopleByRole).map(([role, rolePeople]) => (
              <div key={role}>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {role} ({rolePeople.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rolePeople.map((person) => (
                    <button
                      key={person.id}
                      onClick={() => setViewingPerson(person)}
                      className="card p-4 text-left hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                          {person.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{person.name}</h4>
                          {person.organization && (
                            <p className="text-sm text-gray-600 truncate">{person.organization}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            {person.contact?.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                Phone
                              </span>
                            )}
                            {person.contact?.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                Email
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
