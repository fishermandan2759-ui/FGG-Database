import React, { useState, useRef } from 'react';
import { 
  Database, 
  Upload, 
  FileText, 
  Users, 
  Plus, 
  ShieldCheck, 
  ChevronDown, 
  Lock,
  Layers,
  Sparkles,
  RotateCcw,
  Shield,
  Building2,
  FileSearch,
  Check,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { TableSchema, User, ROLE_PERMISSIONS } from '../types';

interface HeaderProps {
  tables: TableSchema[];
  activeTableId: string;
  onSelectTable: (tableId: string) => void;
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
  onOpenUploadModal: () => void;
  onOpenReportModal: () => void;
  onOpenUserModal: () => void;
  onOpenNewTableModal: () => void;
  onResetData: () => void;
  onOpenLandingPage?: () => void;
}

const BUREAU_INFO: Record<string, { name: string; role: string; icon: any; color: string; badge: string }> = {
  tbl_special_crimes: {
    name: 'Special Crimes Bureau',
    role: 'Special Investigations / SVU',
    icon: Shield,
    color: 'text-purple-700 bg-purple-100 border-purple-200',
    badge: 'SVU / FGG Lead Tracking',
  },
  tbl_general_crimes: {
    name: 'General Crimes Bureau',
    role: 'Property & Major Felony Casework',
    icon: Building2,
    color: 'text-blue-700 bg-blue-100 border-blue-200',
    badge: 'Felony Databank Casework',
  },
  tbl_homicide_section: {
    name: 'Homicide Section',
    role: 'Cold Cases & Unidentified Deceased',
    icon: FileSearch,
    color: 'text-rose-700 bg-rose-100 border-rose-200',
    badge: 'Major Cold Case & WGS',
  },
};

export const Header: React.FC<HeaderProps> = ({
  tables,
  activeTableId,
  onSelectTable,
  currentUser,
  allUsers,
  onSwitchUser,
  onOpenUploadModal,
  onOpenReportModal,
  onOpenUserModal,
  onOpenNewTableModal,
  onResetData,
  onOpenLandingPage,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [bureauMenuOpen, setBureauMenuOpen] = useState(false);
  const [customLogo, setCustomLogo] = useState<string>(() => {
    return localStorage.getItem('ccso_app_logo') || '/ccso-logo.jpg';
  });
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        if (dataUrl) {
          setCustomLogo(dataUrl);
          try {
            localStorage.setItem('ccso_app_logo', dataUrl);
          } catch (err) {
            console.error('Failed to save custom logo to localStorage', err);
          }
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const permissions = ROLE_PERMISSIONS[currentUser.role];
  const isSupervisorOrAdmin = currentUser.role === 'admin' || currentUser.role === 'supervisor' || currentUser.role === 'manager';
  const isAllBureaus = activeTableId === 'all';

  const roleBadgeColors: Record<string, string> = {
    admin: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    supervisor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    manager: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    editor: 'bg-amber-100 text-amber-700 border-amber-200',
    viewer: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  // Determine active display name
  const currentBureauMeta = BUREAU_INFO[activeTableId];
  const activeTableName = isAllBureaus 
    ? 'All Bureaus (Consolidated View)' 
    : (currentBureauMeta?.name || tables.find(t => t.id === activeTableId)?.name || 'CODIS Database');

  const customTables = tables.filter(t => 
    t.id !== 'tbl_special_crimes' && 
    t.id !== 'tbl_general_crimes' && 
    t.id !== 'tbl_homicide_section'
  );

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner & Main Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Title */}
          <div className="flex items-center gap-3">
            <div 
              className="relative group cursor-pointer" 
              onClick={() => logoInputRef.current?.click()} 
              title="Collier County Sheriff's Office (Click to upload/change original PNG logo)"
            >
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <img
                src={customLogo}
                alt="Collier County Sheriff's Office Logo"
                className="w-11 h-11 object-contain rounded-full shadow-xs ring-2 ring-amber-500/30 bg-white shrink-0 group-hover:ring-amber-500 transition-all"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white font-semibold transition-opacity uppercase tracking-wider">
                Upload
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">
                  CODIS/FGG
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 hidden sm:inline-flex items-center">
                  Collier County Sheriff's Office
                </span>
                {onOpenLandingPage && isSupervisorOrAdmin && (
                  <button
                    onClick={onOpenLandingPage}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 transition-colors shadow-2xs cursor-pointer ml-1"
                    title="Return to Bureau Portal Landing Page"
                  >
                    <Shield className="w-3 h-3" />
                    <span>Select Bureau</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Forensic Genetic Genealogy & Investigative Database System
              </p>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Upload Blank Spreadsheet Button */}
            {isSupervisorOrAdmin && (
              <button
                onClick={onOpenUploadModal}
                id="header-upload-spreadsheet-btn"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-2xs cursor-pointer"
                title="Upload or import spreadsheet template"
              >
                <Upload className="w-4 h-4 text-indigo-600" />
                <span className="hidden md:inline">Import Spreadsheet</span>
                <span className="md:hidden">Import</span>
              </button>
            )}

            {/* Export Reports Button */}
            <button
              onClick={onOpenReportModal}
              id="header-export-reports-btn"
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors shadow-2xs cursor-pointer ${
                permissions.canExportReports 
                  ? 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400' 
                  : 'text-slate-400 bg-slate-50 border border-slate-200 cursor-not-allowed'
              }`}
              title={permissions.canExportReports ? 'Build and export custom reports' : 'Export restricted by user role'}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">Reports & Export</span>
              <span className="md:hidden">Reports</span>
            </button>

            {/* User Profile & Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setBureauMenuOpen(false);
                }}
                id="user-profile-menu-button"
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                title="Switch active user or configure roles"
              >
                <div className={`w-7 h-7 rounded-lg ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left text-xs leading-tight">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span>{currentUser.name}</span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border ${roleBadgeColors[currentUser.role]}`}>
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {currentUser.assignedBureauId === 'all' || !currentUser.assignedBureauId 
                      ? 'Multi-Bureau' 
                      : BUREAU_INFO[currentUser.assignedBureauId]?.name || 'Assigned Bureau'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-500">{currentUser.email}</div>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-600">
                      <span className="font-medium">Access Scope:</span>
                      <span className="font-semibold text-slate-800">
                        {currentUser.role === 'admin' || currentUser.role === 'supervisor' 
                          ? 'Unrestricted (All Bureaus)' 
                          : BUREAU_INFO[currentUser.assignedBureauId || '']?.name || 'Assigned Bureau Only'}
                      </span>
                    </div>
                  </div>

                  {/* Switch User List */}
                  <div className="p-1">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Switch Active User (RBAC Preview)
                    </div>
                    {allUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          onSwitchUser(user.id);
                          setUserMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          user.id === currentUser.id 
                            ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-md ${user.avatarColor} text-white flex items-center justify-center font-bold text-[10px]`}>
                            {user.name.charAt(0)}
                          </div>
                          <div className="text-left">
                            <span className="block font-medium">{user.name}</span>
                            <span className="block text-[9px] text-slate-400">
                              {user.assignedBureauId === 'all' || !user.assignedBureauId ? 'All Bureaus' : BUREAU_INFO[user.assignedBureauId]?.name || 'Assigned'}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${roleBadgeColors[user.role]}`}>
                          {user.role}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 p-2 mt-1 flex justify-between items-center text-xs">
                    <button
                      onClick={() => {
                        onResetData();
                        setUserMenuOpen(false);
                      }}
                      className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-xs px-2 py-1 rounded hover:bg-slate-100 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Demo Data
                    </button>
                    <button
                      onClick={() => {
                        onOpenUserModal();
                        setUserMenuOpen(false);
                      }}
                      className="text-indigo-600 hover:text-indigo-700 font-medium px-2 py-1 rounded hover:bg-indigo-50 cursor-pointer"
                    >
                      Manage Roles &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bureau Bar: Only displays the active selected bureau, with switch controls for supervisors/admins */}
        <div className="flex items-center justify-between border-t border-slate-100 py-2.5">
          {/* Active Bureau Title & Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-amber-500" /> Active Database:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-slate-900">
                  {activeTableName}
                </span>
                {isAllBureaus ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    <span>3 Bureaus Consolidated</span>
                  </span>
                ) : (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                    currentBureauMeta ? currentBureauMeta.color : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {currentBureauMeta ? currentBureauMeta.badge : 'CODIS Table'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bureau Controls */}
          <div className="flex items-center gap-2">
            {/* For Supervisors and Admins: Bureau Switcher Dropdown & View All Option */}
            {isSupervisorOrAdmin ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setBureauMenuOpen(!bureauMenuOpen);
                    setUserMenuOpen(false);
                  }}
                  id="bureau-switcher-dropdown-btn"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors shadow-2xs cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Switch Bureau</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {bureauMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 border-b border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Select Bureau Database
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Only the selected bureau will be visible.
                      </p>
                    </div>

                    <div className="p-1 space-y-0.5">
                      {/* Special Crimes Bureau */}
                      <button
                        onClick={() => {
                          onSelectTable('tbl_special_crimes');
                          setBureauMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                          activeTableId === 'tbl_special_crimes'
                            ? 'bg-purple-50 text-purple-900 font-bold border border-purple-200'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                          <div>
                            <div className="font-semibold">Special Crimes Bureau</div>
                            <div className="text-[10px] text-slate-500">SVU / FGG Lead Tracking</div>
                          </div>
                        </div>
                        {activeTableId === 'tbl_special_crimes' && (
                          <Check className="w-4 h-4 text-purple-600" />
                        )}
                      </button>

                      {/* General Crimes Bureau */}
                      <button
                        onClick={() => {
                          onSelectTable('tbl_general_crimes');
                          setBureauMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                          activeTableId === 'tbl_general_crimes'
                            ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <div className="font-semibold">General Crimes Bureau</div>
                            <div className="text-[10px] text-slate-500">Felony Databank Casework</div>
                          </div>
                        </div>
                        {activeTableId === 'tbl_general_crimes' && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </button>

                      {/* Homicide Section */}
                      <button
                        onClick={() => {
                          onSelectTable('tbl_homicide_section');
                          setBureauMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                          activeTableId === 'tbl_homicide_section'
                            ? 'bg-rose-50 text-rose-900 font-bold border border-rose-200'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FileSearch className="w-4 h-4 text-rose-600 shrink-0" />
                          <div>
                            <div className="font-semibold">Homicide Section</div>
                            <div className="text-[10px] text-slate-500">Major Cold Case & WGS</div>
                          </div>
                        </div>
                        {activeTableId === 'tbl_homicide_section' && (
                          <Check className="w-4 h-4 text-rose-600" />
                        )}
                      </button>
                    </div>

                    {/* Multi-Database Option for Supervisors and Administrators */}
                    <div className="border-t border-slate-100 pt-1.5 p-1">
                      <button
                        onClick={() => {
                          onSelectTable('all');
                          setBureauMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                          isAllBureaus
                            ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-300'
                            : 'text-emerald-700 hover:bg-emerald-50/70 border border-dashed border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <div className="font-bold">View All 3 Databases Simultaneously</div>
                            <div className="text-[10px] text-emerald-600">Consolidated multi-bureau table</div>
                          </div>
                        </div>
                        {isAllBureaus && (
                          <Check className="w-4 h-4 text-emerald-600" />
                        )}
                      </button>
                    </div>

                    {/* Custom user uploaded tables if present */}
                    {customTables.length > 0 && (
                      <div className="border-t border-slate-100 pt-1.5 p-1">
                        <div className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Custom Uploaded Tables
                        </div>
                        {customTables.map(t => (
                          <button
                            key={t.id}
                            onClick={() => {
                              onSelectTable(t.id);
                              setBureauMenuOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between cursor-pointer ${
                              activeTableId === t.id ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span>{t.name}</span>
                            {activeTableId === t.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* For Basic Users: Show strictly restricted badge with no switching options */
              <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Restricted to <strong>{currentBureauMeta?.name || 'Assigned Bureau'}</strong></span>
              </div>
            )}

            {/* Quick Toggle for Supervisors/Admins to switch between single bureau & all 3 */}
            {isSupervisorOrAdmin && (
              <button
                onClick={() => {
                  if (isAllBureaus) {
                    onSelectTable(currentUser.assignedBureauId === 'all' ? 'tbl_special_crimes' : (currentUser.assignedBureauId || 'tbl_special_crimes'));
                  } else {
                    onSelectTable('all');
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer border ${
                  isAllBureaus
                    ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
                title="Toggle simultaneous view of all 3 databases"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isAllBureaus ? 'Single Bureau View' : 'View All 3 Databases'}</span>
                <span className="sm:hidden">{isAllBureaus ? 'Single' : 'All 3'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
