import { useState } from 'react';
import { useCaseContext } from '../contexts/CaseContext';
import { Save, Plus, Trash2, User, Building2, Calendar, Gavel, FileText } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function CaseProfile() {
  const { caseData, updateCaseData, addChild, removeChild, updateChild } = useCaseContext();
  const [activeTab, setActiveTab] = useState<'basic' | 'children' | 'court'>('basic');
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [newChild, setNewChild] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    notes: '',
  });

  const handleSaveBasicInfo = () => {
    if (!caseData.caseNumber || !caseData.caseName) {
      toast.error('Case number and case name are required');
      return;
    }
    toast.success('Case information saved');
  };

  const handleAddChild = () => {
    if (!newChild.firstName || !newChild.lastName || !newChild.dateOfBirth) {
      toast.error('Child name and date of birth are required');
      return;
    }

    // Calculate age
    const birthDate = new Date(newChild.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    addChild({ ...newChild, age });
    setNewChild({ firstName: '', lastName: '', dateOfBirth: '', notes: '' });
    setIsAddingChild(false);
    toast.success('Child added to case profile');
  };

  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Case Profile</h1>
          <p className="text-gray-600 mt-1">Central repository for all case information</p>
        </div>
        {caseData.caseNumber && (
          <div className="text-right">
            <div className="text-sm text-gray-500">Case Number</div>
            <div className="text-lg font-semibold text-brand-rose">{caseData.caseNumber}</div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'basic'
              ? 'border-brand-rose text-brand-rose'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Building2 className="w-4 h-4 inline mr-2" />
          Basic Information
        </button>
        <button
          onClick={() => setActiveTab('children')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'children'
              ? 'border-brand-rose text-brand-rose'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <User className="w-4 h-4 inline mr-2" />
          Children ({caseData.children.length})
        </button>
        <button
          onClick={() => setActiveTab('court')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'court'
              ? 'border-brand-rose text-brand-rose'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Gavel className="w-4 h-4 inline mr-2" />
          Court Details
        </button>
      </div>

      {/* Basic Information Tab */}
      {activeTab === 'basic' && (
        <div className="card p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Case Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case Number *
              </label>
              <input
                type="text"
                value={caseData.caseNumber}
                onChange={(e) => updateCaseData({ caseNumber: e.target.value })}
                placeholder="e.g., 2023-DR-12345"
                className="input w-full"
              />
            </div>

            {/* Case Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case Name *
              </label>
              <input
                type="text"
                value={caseData.caseName}
                onChange={(e) => updateCaseData({ caseName: e.target.value })}
                placeholder="e.g., In re: [Child Name]"
                className="input w-full"
              />
            </div>

            {/* County */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                County *
              </label>
              <input
                type="text"
                value={caseData.county}
                onChange={(e) => updateCaseData({ county: e.target.value })}
                placeholder="e.g., Miami-Dade"
                className="input w-full"
              />
            </div>

            {/* Court Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Court Type *
              </label>
              <select
                value={caseData.courtType}
                onChange={(e) => updateCaseData({ courtType: e.target.value })}
                className="input w-full"
              >
                <option value="">Select court type</option>
                <option value="Circuit">Circuit Court</option>
                <option value="County">County Court</option>
                <option value="Family">Family Court</option>
                <option value="Dependency">Dependency Court</option>
                <option value="District">District Court</option>
              </select>
            </div>

            {/* Filing Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filing Date *
              </label>
              <input
                type="date"
                value={caseData.filingDate}
                onChange={(e) => updateCaseData({ filingDate: e.target.value })}
                className="input w-full"
              />
              {caseData.filingDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Filed {Math.floor((new Date().getTime() - new Date(caseData.filingDate).getTime()) / (1000 * 60 * 60 * 24))} days ago
                </p>
              )}
            </div>

            {/* Division */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Division
              </label>
              <input
                type="text"
                value={caseData.division || ''}
                onChange={(e) => updateCaseData({ division: e.target.value })}
                placeholder="e.g., Family Division A"
                className="input w-full"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleSaveBasicInfo} className="btn btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Basic Information
            </button>
          </div>
        </div>
      )}

      {/* Children Tab */}
      {activeTab === 'children' && (
        <div className="space-y-4">
          {/* Children List */}
          {caseData.children.length > 0 && (
            <div className="space-y-4">
              {caseData.children.map((child) => (
                <div key={child.id} className="card p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">First Name</label>
                        <input
                          type="text"
                          value={child.firstName}
                          onChange={(e) => updateChild(child.id, { firstName: e.target.value })}
                          className="input w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Last Name</label>
                        <input
                          type="text"
                          value={child.lastName}
                          onChange={(e) => updateChild(child.id, { lastName: e.target.value })}
                          className="input w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          value={child.dateOfBirth}
                          onChange={(e) => {
                            const age = calculateAge(e.target.value);
                            updateChild(child.id, { dateOfBirth: e.target.value, age });
                          }}
                          className="input w-full"
                        />
                        {child.dateOfBirth && (
                          <p className="text-xs text-gray-500 mt-1">
                            Age: {child.age} years old
                          </p>
                        )}
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                        <textarea
                          value={child.notes || ''}
                          onChange={(e) => updateChild(child.id, { notes: e.target.value })}
                          placeholder="Case-specific information about this child..."
                          className="input w-full"
                          rows={2}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${child.firstName} ${child.lastName} from case profile?`)) {
                          removeChild(child.id);
                          toast.success('Child removed');
                        }
                      }}
                      className="btn btn-sm btn-ghost text-red-600 hover:bg-red-50 ml-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Child Form */}
          {isAddingChild ? (
            <div className="card p-6 border-2 border-brand-rose/20">
              <h3 className="font-semibold text-gray-900 mb-4">Add Child</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={newChild.firstName}
                    onChange={(e) => setNewChild({ ...newChild, firstName: e.target.value })}
                    placeholder="First name"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={newChild.lastName}
                    onChange={(e) => setNewChild({ ...newChild, lastName: e.target.value })}
                    placeholder="Last name"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={newChild.dateOfBirth}
                    onChange={(e) => setNewChild({ ...newChild, dateOfBirth: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={newChild.notes}
                    onChange={(e) => setNewChild({ ...newChild, notes: e.target.value })}
                    placeholder="Case-specific information..."
                    className="input w-full"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddChild} className="btn btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Child
                </button>
                <button
                  onClick={() => {
                    setIsAddingChild(false);
                    setNewChild({ firstName: '', lastName: '', dateOfBirth: '', notes: '' });
                  }}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingChild(true)}
              className="btn btn-outline w-full flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Child to Case
            </button>
          )}

          {caseData.children.length === 0 && !isAddingChild && (
            <div className="card p-12 text-center">
              <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No children added to case profile yet</p>
              <p className="text-sm text-gray-500">
                Add the children involved in this dependency case to enable case-specific AI assistance
              </p>
            </div>
          )}
        </div>
      )}

      {/* Court Details Tab */}
      {activeTab === 'court' && (
        <div className="card p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Judge */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Gavel className="w-4 h-4 inline mr-1" />
                Presiding Judge *
              </label>
              <input
                type="text"
                value={caseData.judge}
                onChange={(e) => updateCaseData({ judge: e.target.value })}
                placeholder="Honorable [Judge Name]"
                className="input w-full"
              />
            </div>

            {/* Courtroom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Courtroom Number
              </label>
              <input
                type="text"
                value={caseData.courtroom || ''}
                onChange={(e) => updateCaseData({ courtroom: e.target.value })}
                placeholder="e.g., Courtroom 3A"
                className="input w-full"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                if (!caseData.judge) {
                  toast.error('Judge name is required');
                  return;
                }
                toast.success('Court details saved');
              }}
              className="btn btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Court Details
            </button>
          </div>

          {/* Quick Links Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Related Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="card p-4 hover:shadow-md transition-shadow text-left">
                <User className="w-6 h-6 text-brand-teal mb-2" />
                <div className="font-medium text-gray-900">People Directory</div>
                <div className="text-sm text-gray-500">Manage contacts & witnesses</div>
              </button>
              <button className="card p-4 hover:shadow-md transition-shadow text-left">
                <Calendar className="w-6 h-6 text-brand-teal mb-2" />
                <div className="font-medium text-gray-900">Timeline Builder</div>
                <div className="text-sm text-gray-500">Track case events</div>
              </button>
              <button className="card p-4 hover:shadow-md transition-shadow text-left">
                <FileText className="w-6 h-6 text-brand-teal mb-2" />
                <div className="font-medium text-gray-900">Filings Manager</div>
                <div className="text-sm text-gray-500">Track court filings</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Case Status Summary */}
      {caseData.caseNumber && (
        <div className="card p-6 bg-gradient-to-r from-brand-rose/5 to-brand-teal/5">
          <h3 className="font-semibold text-gray-900 mb-4">Case Status Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-brand-rose">{caseData.children.length}</div>
              <div className="text-sm text-gray-600">Children</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand-teal">{caseData.contacts.length}</div>
              <div className="text-sm text-gray-600">Contacts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand-sage">{caseData.events.length}</div>
              <div className="text-sm text-gray-600">Events</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand-deep-teal">{caseData.tasks.length}</div>
              <div className="text-sm text-gray-600">Tasks</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
