import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Shield, 
  UserPlus, 
  Check, 
  Lock, 
  Trash2, 
  Mail, 
  Building, 
  Clock, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  KeyRound,
  Building2,
  Database
} from 'lucide-react';
import { User, UserRole, ROLE_PERMISSIONS } from '../types';

interface UserAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User;
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
  onUpdateUserBureau?: (userId: string, newBureauId: string) => void;
  onAddUser: (newUser: Omit<User, 'id'>) => void;
  onDeleteUser: (userId: string) => void;
  onSwitchUser: (userId: string) => void;
}

const BUREAU_OPTIONS = [
  { id: 'tbl_special_crimes', label: 'Special Crimes Bureau' },
  { id: 'tbl_general_crimes', label: 'General Crimes Bureau' },
  { id: 'tbl_homicide_section', label: 'Homicide Section' },
  { id: 'all', label: 'All Bureaus (Unrestricted Access)' },
];

export const UserAccessModal: React.FC<UserAccessModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onUpdateUserRole,
  onUpdateUserBureau,
  onAddUser,
  onDeleteUser,
  onSwitchUser,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'matrix'>('users');
  const [showAddForm, setShowAddForm] = useState(false);

  // New user form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [role, setRole] = useState<UserRole>('editor');
  const [assignedBureauId, setAssignedBureauId] = useState<string>('tbl_special_crimes');

  if (!isOpen) return null;

  const isAdmin = currentUser.role === 'admin';

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const colors = ['bg-indigo-600', 'bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-amber-600', 'bg-rose-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const finalBureau = (role === 'admin' || role === 'supervisor') ? 'all' : assignedBureauId;

    onAddUser({
      name: name.trim(),
      email: email.trim(),
      department: department.trim() || (finalBureau === 'all' ? 'Administrative / Multi-Bureau' : BUREAU_OPTIONS.find(b => b.id === finalBureau)?.label || 'General Operations'),
      badgeNumber: badgeNumber.trim() || undefined,
      role,
      assignedBureauId: finalBureau,
      avatarColor: randomColor,
      lastActive: 'Just registered',
    });

    setName('');
    setEmail('');
    setDepartment('');
    setBadgeNumber('');
    setRole('editor');
    setAssignedBureauId('tbl_special_crimes');
    setShowAddForm(false);
  };

  const roleDescriptions: Record<UserRole, string> = {
    admin: 'Full administrator. Access to any bureau, can view all 3 databases simultaneously, configure schemas, assign bureaus, and manage all users.',
    supervisor: 'Supervisory role. Access to any bureau, can view all 3 databases simultaneously, edit/delete records, and export casework reports.',
    manager: 'Supervisory role. Can view any bureau, view all databases simultaneously, and edit records.',
    editor: 'Basic user (Investigator / Detective). Restricted strictly to their assigned bureau. Cannot access other bureaus or view multi-database consolidated views.',
    viewer: 'Basic user (Analyst / Reviewer). Read-only access strictly within their assigned bureau. Cannot view other bureaus.',
  };

  const roleBadgeStyles: Record<UserRole, string> = {
    admin: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    supervisor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    manager: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    editor: 'bg-amber-50 text-amber-700 border-amber-200',
    viewer: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const bureauBadgeStyles: Record<string, string> = {
    tbl_special_crimes: 'bg-purple-50 text-purple-800 border-purple-200',
    tbl_general_crimes: 'bg-blue-50 text-blue-800 border-blue-200',
    tbl_homicide_section: 'bg-rose-50 text-rose-800 border-rose-200',
    all: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };

  const getBureauLabel = (id?: string) => {
    if (!id || id === 'all') return 'All Bureaus (Unrestricted)';
    const found = BUREAU_OPTIONS.find(b => b.id === id);
    return found ? found.label : id;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">User Bureau Assignments & Access Control</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  RBAC & Bureau Boundary
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Assign users to specific bureaus (Special Crimes, General Crimes, Homicide). Basic users only see their assigned bureau, while Supervisors & Admins can access any bureau and view all 3 simultaneously.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/40">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Accounts & Bureau Assignments ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'matrix'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Permissions & Bureau Access Matrix</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'users' ? (
            <div className="space-y-6">
              {/* Header Action bar */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Authorized User Accounts & Bureau Allocation
                  </h3>
                  <p className="text-xs text-slate-500">
                    Switch your active identity to any user below to test their bureau view boundaries and permissions in real time.
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{showAddForm ? 'Cancel' : 'Add New User'}</span>
                  </button>
                )}
              </div>

              {/* Add User Form */}
              {showAddForm && (
                <form
                  onSubmit={handleCreateUser}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in duration-100"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Provision New User Account & Bureau Assignment
                    </span>
                    <span className="text-[11px] text-slate-500">Configure role and assigned database</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Det. Jason Vance"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="j.vance@colliersheriff.org"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Badge # / Unit ID
                      </label>
                      <input
                        type="text"
                        value={badgeNumber}
                        onChange={(e) => setBadgeNumber(e.target.value)}
                        placeholder="CCSO-521"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Assigned Access Role
                      </label>
                      <select
                        value={role}
                        onChange={(e) => {
                          const newRole = e.target.value as UserRole;
                          setRole(newRole);
                          if (newRole === 'admin' || newRole === 'supervisor') {
                            setAssignedBureauId('all');
                          } else if (assignedBureauId === 'all') {
                            setAssignedBureauId('tbl_special_crimes');
                          }
                        }}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                      >
                        <option value="supervisor">Supervisor (Can view any bureau & view all 3)</option>
                        <option value="admin">Admin (Full Control, any bureau, view all 3)</option>
                        <option value="editor">Basic User / Editor (Assigned bureau only)</option>
                        <option value="viewer">Basic User / Viewer (Assigned bureau read-only)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Assigned Bureau (Access Scope)
                      </label>
                      {role === 'admin' || role === 'supervisor' ? (
                        <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span><strong>Supervisors & Admins</strong> automatically have access to all bureaus and the option to view all 3 databases simultaneously.</span>
                        </div>
                      ) : (
                        <select
                          value={assignedBureauId}
                          onChange={(e) => setAssignedBureauId(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-300 bg-amber-50/50 text-amber-900 focus:ring-2 focus:ring-indigo-500 outline-hidden font-semibold cursor-pointer"
                        >
                          <option value="tbl_special_crimes">Special Crimes Bureau</option>
                          <option value="tbl_general_crimes">General Crimes Bureau</option>
                          <option value="tbl_homicide_section">Homicide Section</option>
                        </select>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs cursor-pointer"
                    >
                      Save User Account
                    </button>
                  </div>
                </form>
              )}

              {/* Users List Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4">User & Department</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Assigned Bureau</th>
                      <th className="py-2.5 px-3">Bureau Visibility</th>
                      <th className="py-2.5 px-4 text-right">Switch / Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => {
                      const isCurrent = user.id === currentUser.id;
                      const isSupervisorOrAdmin = user.role === 'admin' || user.role === 'supervisor' || user.role === 'manager';
                      const currentBureauId = user.assignedBureauId || (isSupervisorOrAdmin ? 'all' : 'tbl_special_crimes');

                      return (
                        <tr
                          key={user.id}
                          className={`transition-colors ${
                            isCurrent ? 'bg-indigo-50/40' : 'hover:bg-slate-50/70'
                          }`}
                        >
                          {/* User Info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg ${user.avatarColor} text-white flex items-center justify-center font-bold text-xs`}>
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 flex items-center gap-2">
                                  {user.name}
                                  {isCurrent && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                                      YOU
                                    </span>
                                  )}
                                  {user.badgeNumber && (
                                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-600">
                                      {user.badgeNumber}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500">{user.email} &bull; {user.department}</div>
                              </div>
                            </div>
                          </td>

                          {/* Access Role */}
                          <td className="py-3 px-3">
                            {isAdmin && !isCurrent ? (
                              <select
                                value={user.role}
                                onChange={(e) => {
                                  const newRole = e.target.value as UserRole;
                                  onUpdateUserRole(user.id, newRole);
                                  if ((newRole === 'admin' || newRole === 'supervisor') && onUpdateUserBureau) {
                                    onUpdateUserBureau(user.id, 'all');
                                  }
                                }}
                                className={`text-xs font-semibold px-2 py-1 rounded border ${roleBadgeStyles[user.role]} focus:ring-1 focus:ring-indigo-500 outline-hidden cursor-pointer`}
                              >
                                <option value="supervisor">Supervisor</option>
                                <option value="admin">Admin</option>
                                <option value="editor">Editor (Basic)</option>
                                <option value="viewer">Viewer (Basic)</option>
                              </select>
                            ) : (
                              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded border capitalize ${roleBadgeStyles[user.role]}`}>
                                {user.role === 'editor' ? 'Editor (Basic)' : user.role === 'viewer' ? 'Viewer (Basic)' : user.role}
                              </span>
                            )}
                          </td>

                          {/* Assigned Bureau */}
                          <td className="py-3 px-3">
                            {isAdmin && !isCurrent && !isSupervisorOrAdmin && onUpdateUserBureau ? (
                              <select
                                value={currentBureauId}
                                onChange={(e) => onUpdateUserBureau(user.id, e.target.value)}
                                className={`text-xs font-bold px-2 py-1 rounded border ${bureauBadgeStyles[currentBureauId] || 'border-slate-200'} focus:ring-1 focus:ring-indigo-500 outline-hidden cursor-pointer`}
                              >
                                <option value="tbl_special_crimes">Special Crimes Bureau</option>
                                <option value="tbl_general_crimes">General Crimes Bureau</option>
                                <option value="tbl_homicide_section">Homicide Section</option>
                              </select>
                            ) : (
                              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded border ${bureauBadgeStyles[currentBureauId] || 'border-slate-200'}`}>
                                <Building2 className="w-3 h-3" />
                                <span>{getBureauLabel(currentBureauId)}</span>
                              </span>
                            )}
                          </td>

                          {/* Bureau Visibility Explanation */}
                          <td className="py-3 px-3 text-[11px] text-slate-600">
                            {isSupervisorOrAdmin ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" />
                                Any Bureau + View All 3
                              </span>
                            ) : (
                              <span className="text-amber-700 font-medium flex items-center gap-1">
                                <Lock className="w-3 h-3 text-amber-600" />
                                Assigned Bureau Only
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!isCurrent && (
                                <button
                                  onClick={() => onSwitchUser(user.id)}
                                  className="px-2.5 py-1 text-xs font-semibold rounded-md text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 transition-colors cursor-pointer"
                                  title={`Switch active session to ${user.name}`}
                                >
                                  Test As {user.name.split(' ')[0]}
                                </button>
                              )}

                              {isAdmin && !isCurrent && (
                                <button
                                  onClick={() => onDeleteUser(user.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete user account"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Permissions Matrix View */
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Role-Based Bureau & Privilege Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Detailed comparison of bureau accessibility and system operations across all roles.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">System Capability / Access Level</th>
                      <th className="py-3 px-3 text-center text-indigo-700 bg-indigo-50/50">Admin</th>
                      <th className="py-3 px-3 text-center text-emerald-700 bg-emerald-50/50">Supervisor</th>
                      <th className="py-3 px-3 text-center text-amber-700 bg-amber-50/50">Editor (Basic)</th>
                      <th className="py-3 px-3 text-center text-slate-700 bg-slate-50/50">Viewer (Basic)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      {
                        name: 'Multi-Bureau Access (Any Bureau)',
                        desc: 'Switch freely between Special Crimes, General Crimes, and Homicide',
                        admin: true,
                        supervisor: true,
                        editor: false,
                        viewer: false,
                      },
                      {
                        name: 'Simultaneous Multi-Database View ("View All 3")',
                        desc: 'Inspect all three bureau databases consolidated simultaneously in one table',
                        admin: true,
                        supervisor: true,
                        editor: false,
                        viewer: false,
                      },
                      {
                        name: 'Assign Users to Specific Bureaus',
                        desc: 'Allocate detectives and personnel to their authorized bureau database',
                        admin: true,
                        supervisor: false,
                        editor: false,
                        viewer: false,
                      },
                      {
                        name: 'Insert New CODIS Records & Data Rows',
                        desc: 'Add new casework, specimen IDs, and match details',
                        admin: true,
                        supervisor: true,
                        editor: true,
                        viewer: false,
                      },
                      {
                        name: 'Edit & Update Existing Casework Records',
                        desc: 'Update specimen hits, investigative leads, and dispositions',
                        admin: true,
                        supervisor: true,
                        editor: true,
                        viewer: false,
                      },
                      {
                        name: 'Delete Records',
                        desc: 'Permanently remove casework records from the database',
                        admin: true,
                        supervisor: true,
                        editor: false,
                        viewer: false,
                      },
                      {
                        name: 'Generate & Export Forensic Reports',
                        desc: 'Download filtered Excel/CSV exports and printable summaries',
                        admin: true,
                        supervisor: true,
                        editor: false,
                        viewer: false,
                      },
                      {
                        name: 'Modify Schema & Field Definitions',
                        desc: 'Add, rename, or reorder column types in the database',
                        admin: true,
                        supervisor: false,
                        editor: false,
                        viewer: false,
                      },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{row.name}</div>
                          <div className="text-[11px] text-slate-500">{row.desc}</div>
                        </td>
                        <td className="py-3 px-3 text-center bg-indigo-50/20">
                          {row.admin ? (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                          )}
                        </td>
                        <td className="py-3 px-3 text-center bg-emerald-50/20">
                          {row.supervisor ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                          )}
                        </td>
                        <td className="py-3 px-3 text-center bg-amber-50/20">
                          {row.editor ? (
                            <CheckCircle2 className="w-4 h-4 text-amber-600 mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                          )}
                        </td>
                        <td className="py-3 px-3 text-center bg-slate-50/20">
                          {row.viewer ? (
                            <CheckCircle2 className="w-4 h-4 text-slate-600 mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-slate-400" />
            <span>Currently testing as: <strong className="text-slate-800 font-semibold">{currentUser.name} ({currentUser.role})</strong> &bull; Assigned: <strong>{getBureauLabel(currentUser.assignedBureauId)}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
