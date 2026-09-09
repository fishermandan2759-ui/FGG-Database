import React, { useState, useRef } from 'react';
import { 
  Shield, 
  ArrowRight, 
  Upload, 
  Database, 
  Search, 
  FileCheck, 
  Fingerprint, 
  Dna, 
  Users, 
  Building2,
  CheckCircle2,
  Sparkles,
  Camera,
  Lock,
  Layers,
  FileSearch,
  UserCheck,
  ChevronDown
} from 'lucide-react';
import { TableSchema, User } from '../types';

interface LandingPageProps {
  tables: TableSchema[];
  selectedBureauId: string;
  onSelectBureau: (bureauId: string) => void;
  onEnterDatabase: (bureauId: string) => void;
  currentUser?: User;
  allUsers?: User[];
  onSwitchUser?: (userId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  tables,
  selectedBureauId,
  onSelectBureau,
  onEnterDatabase,
  currentUser,
  allUsers,
  onSwitchUser,
}) => {
  const isSupervisorOrAdmin = !currentUser || currentUser.role === 'admin' || currentUser.role === 'supervisor' || currentUser.role === 'manager';
  const assignedBureau = currentUser?.assignedBureauId || 'tbl_special_crimes';

  // If basic user, enforce their assigned bureau
  const initialBureau = isSupervisorOrAdmin ? (selectedBureauId || 'tbl_special_crimes') : (assignedBureau === 'all' ? 'tbl_special_crimes' : assignedBureau);
  const [currentBureau, setCurrentBureau] = useState<string>(initialBureau);
  const [logoUrl, setLogoUrl] = useState<string>(() => {
    return localStorage.getItem('ccso_app_logo') || '/ccso-logo.jpg';
  });
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setLogoUrl(dataUrl);
          try {
            localStorage.setItem('ccso_app_logo', dataUrl);
            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 3500);
          } catch (err) {
            console.error('Failed to save custom logo to localStorage', err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBureauChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    // Check permission
    if (!isSupervisorOrAdmin && value !== assignedBureau && assignedBureau !== 'all') {
      return;
    }
    setCurrentBureau(value);
    onSelectBureau(value);
  };

  const handleLaunch = (targetBureau?: string) => {
    const bureau = targetBureau || currentBureau;
    if (!isSupervisorOrAdmin && bureau !== assignedBureau && assignedBureau !== 'all') {
      return;
    }
    onEnterDatabase(bureau);
  };

  // Bureau metadata details
  const bureauCards = [
    {
      id: 'tbl_special_crimes',
      name: 'Special Crimes Bureau',
      role: 'Special Investigations / SVU',
      description: 'CODIS matches, sexual assault forensic evidence tracking, and forensic genetic genealogy leads.',
      badge: 'SVU / FGG Lead Tracking',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Shield,
    },
    {
      id: 'tbl_general_crimes',
      name: 'General Crimes Bureau',
      role: 'Property & Major Felony Casework',
      description: 'Property crimes, armed robbery, commercial burglaries, touch DNA, and general felony CODIS casework.',
      badge: 'Felony Databank Casework',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Building2,
    },
    {
      id: 'tbl_homicide_section',
      name: 'Homicide Section',
      role: 'Cold Cases & Unidentified Deceased',
      description: 'Homicide investigations, cold case reviews, unidentified human remains (UHR), and advanced FGG casework.',
      badge: 'Major Cold Case & WGS',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: FileSearch,
    },
  ];

  const activeBureauMeta = bureauCards.find(b => b.id === currentBureau) || {
    id: 'all',
    name: 'All Bureaus (Consolidated View)',
    role: 'Multi-Bureau Oversight',
    description: 'Simultaneous view of Special Crimes Bureau, General Crimes Bureau, and Homicide Section.',
    badge: 'Supervisory Multi-View',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: Layers,
  };

  return (
    <div id="landing-page-container" className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-900">
      {/* Top Law Enforcement Bar & User Switcher */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Collier County Sheriff's Office &bull; Naples, FL
          </span>
        </div>

        {/* User Role & Profile Switcher for testing access levels */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs transition cursor-pointer"
                title="Change active user profile to test access controls"
              >
                <div className={`w-5 h-5 rounded-md ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-[10px]`}>
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="font-semibold text-slate-200">{currentUser.name}</span>
                  <span className="text-amber-400 font-mono text-[10px] ml-1.5 uppercase font-bold">
                    ({currentUser.role})
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userMenuOpen && allUsers && onSwitchUser && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-950 rounded-xl shadow-2xl border border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                  <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] text-slate-400">
                    <span className="font-bold text-amber-400 uppercase tracking-wider">Test User Access Levels</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">Switch profiles to observe bureau restrictions:</p>
                  </div>
                  <div className="p-1 space-y-0.5">
                    {allUsers.map((u) => {
                      const isSelected = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            onSwitchUser(u.id);
                            setUserMenuOpen(false);
                            if (u.role !== 'admin' && u.role !== 'supervisor' && u.role !== 'manager' && u.assignedBureauId && u.assignedBureauId !== 'all') {
                              setCurrentBureau(u.assignedBureauId);
                              onSelectBureau(u.assignedBureauId);
                            }
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            isSelected ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'text-slate-300 hover:bg-slate-850'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-md ${u.avatarColor} text-white flex items-center justify-center font-bold text-[10px]`}>
                              {u.name.charAt(0)}
                            </div>
                            <div className="text-left">
                              <span className="block font-medium">{u.name}</span>
                              <span className="block text-[9px] text-slate-400">
                                {u.assignedBureauId === 'all' || !u.assignedBureauId ? 'All Bureaus' : bureauCards.find(b => b.id === u.assignedBureauId)?.name || 'Assigned'}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-amber-400">
                            {u.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 border border-amber-500/20 font-mono text-[11px]">
              CJIS Compliant Portal
            </span>
          </div>
        </div>
      </header>

      {/* Main Center Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center">
        {/* Large Official Logo with Local Image Uploader */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()} title="Click to upload your original CCSO PNG logo">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            {/* Ambient Glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-600/20 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />
            
            {/* Logo Image */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1 bg-gradient-to-b from-amber-400 via-amber-600 to-amber-800 shadow-2xl transition-transform duration-300 group-hover:scale-105">
              <img
                src={logoUrl}
                alt="Collier County Sheriff's Office Official Logo"
                className="w-full h-full object-contain rounded-full bg-white shadow-inner"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 rounded-full bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-center p-2">
                <Camera className="w-6 h-6 mb-1 text-amber-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Change Logo</span>
                <span className="text-[9px] text-slate-300">Upload PNG/JPG</span>
              </div>
            </div>
          </div>

          {/* Upload helper button */}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 bg-slate-800/80 hover:bg-slate-800 px-3 py-1 rounded-full border border-amber-500/30 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Custom / Local Logo</span>
            </button>
            {uploadSuccess && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                <CheckCircle2 className="w-3 h-3" /> Logo Updated
              </span>
            )}
          </div>
        </div>

        {/* Agency Headings */}
        <div className="text-center mb-8 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wide uppercase mb-3">
            <Shield className="w-3.5 h-3.5" />
            <span>Collier County Sheriff's Office</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            CODIS / FGG Database
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400">
            Forensic Genetic Genealogy & Investigative Casework Management System
          </p>
        </div>

        {/* Bureau Selection Card */}
        <div className="w-full max-w-lg bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          <div className="space-y-5">
            {/* Dropdown Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="bureau-dropdown" className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Select Bureau
                </label>
                {!isSupervisorOrAdmin && (
                  <span className="text-[11px] text-amber-300/80 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" />
                    Restricted to Assigned Bureau
                  </span>
                )}
              </div>

              <div className="relative">
                <select
                  id="bureau-dropdown"
                  value={currentBureau}
                  onChange={handleBureauChange}
                  disabled={!isSupervisorOrAdmin}
                  className={`w-full appearance-none bg-slate-900 border-2 text-white text-base font-semibold rounded-xl px-4 py-3 pr-10 outline-none transition ${
                    isSupervisorOrAdmin 
                      ? 'border-amber-500/40 hover:border-amber-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 cursor-pointer' 
                      : 'border-slate-700 text-slate-300 opacity-90 cursor-not-allowed'
                  }`}
                >
                  <option value="tbl_special_crimes" className="bg-slate-900 text-white py-2" disabled={!isSupervisorOrAdmin && assignedBureau !== 'tbl_special_crimes' && assignedBureau !== 'all'}>
                    Special Crimes Bureau {!isSupervisorOrAdmin && assignedBureau !== 'tbl_special_crimes' ? '(Restricted)' : ''}
                  </option>
                  <option value="tbl_general_crimes" className="bg-slate-900 text-white py-2" disabled={!isSupervisorOrAdmin && assignedBureau !== 'tbl_general_crimes' && assignedBureau !== 'all'}>
                    General Crimes Bureau {!isSupervisorOrAdmin && assignedBureau !== 'tbl_general_crimes' ? '(Restricted)' : ''}
                  </option>
                  <option value="tbl_homicide_section" className="bg-slate-900 text-white py-2" disabled={!isSupervisorOrAdmin && assignedBureau !== 'tbl_homicide_section' && assignedBureau !== 'all'}>
                    Homicide Section {!isSupervisorOrAdmin && assignedBureau !== 'tbl_homicide_section' ? '(Restricted)' : ''}
                  </option>
                  {isSupervisorOrAdmin && (
                    <option value="all" className="bg-slate-900 text-emerald-300 font-bold py-2">
                      ⭐ View All 3 Databases Simultaneously
                    </option>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-amber-400">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* Selected Bureau Info Card */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/60">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{activeBureauMeta.name}</h3>
                    <p className="text-xs text-amber-400 font-medium">{activeBureauMeta.role}</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {activeBureauMeta.badge}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                {activeBureauMeta.description}
              </p>
            </div>

            {/* Primary Action Button */}
            <button
              id="launch-database-btn"
              type="button"
              onClick={() => handleLaunch()}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition duration-200 cursor-pointer"
            >
              <span>Open {activeBureauMeta.name}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Bureau Cards for 1-Click Access */}
        <div className="mt-8 w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-3">
          {bureauCards.map((bureau) => {
            const isSelected = currentBureau === bureau.id;
            const Icon = bureau.icon;
            const isLockedForUser = !isSupervisorOrAdmin && assignedBureau !== bureau.id && assignedBureau !== 'all';

            return (
              <button
                key={bureau.id}
                type="button"
                disabled={isLockedForUser}
                onClick={() => {
                  if (isLockedForUser) return;
                  setCurrentBureau(bureau.id);
                  onSelectBureau(bureau.id);
                  handleLaunch(bureau.id);
                }}
                className={`text-left p-3.5 rounded-xl border transition duration-200 relative ${
                  isLockedForUser
                    ? 'opacity-40 bg-slate-900/30 border-slate-800 cursor-not-allowed'
                    : isSelected
                    ? 'bg-slate-800 border-amber-400/80 shadow-md ring-1 ring-amber-400/50 cursor-pointer'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700 cursor-pointer'
                }`}
              >
                {isLockedForUser && (
                  <div className="absolute top-2 right-2 text-slate-500">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {bureau.name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
                  {bureau.description}
                </p>
                {isLockedForUser && (
                  <span className="mt-2 inline-block text-[10px] text-amber-400/70 font-mono">
                    Restricted Access
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* View All 3 Databases Quick Button for Supervisors/Admins */}
        {isSupervisorOrAdmin && (
          <div className="mt-4">
            <button
              onClick={() => {
                setCurrentBureau('all');
                onSelectBureau('all');
                handleLaunch('all');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-emerald-500/40 text-emerald-400 text-xs font-semibold hover:text-emerald-300 transition cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Supervisor / Administrator Multi-View: View All 3 Databases Simultaneously &rarr;</span>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/40 px-6 py-4 text-center text-xs text-slate-500">
        <p>
          Collier County Sheriff's Office &bull; Forensic Investigation Division &bull; Authorized Personnel Only
        </p>
      </footer>
    </div>
  );
};
