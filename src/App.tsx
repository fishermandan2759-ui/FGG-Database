import React, { useState, useEffect, useMemo } from 'react';
import { TableSchema, DatabaseRecord, User, UserRole, ROLE_PERMISSIONS } from './types';
import { 
  getStoredTables, 
  saveStoredTables, 
  getStoredRecords, 
  saveStoredRecords, 
  getStoredUsers, 
  saveStoredUsers, 
  getStoredCurrentUserId, 
  saveStoredCurrentUserId, 
  resetToDemoData,
  CODIS_TEMPLATE_FIELDS,
  applyCodisTemplateToBureaus
} from './utils/storage';
import { Header } from './components/Header';
import { TableView } from './components/TableView';
import { SpreadsheetUploadModal } from './components/SpreadsheetUploadModal';
import { ReportBuilderModal } from './components/ReportBuilderModal';
import { UserAccessModal } from './components/UserAccessModal';
import { RecordModal } from './components/RecordModal';
import { TableSettingsModal } from './components/TableSettingsModal';
import { NewTableModal } from './components/NewTableModal';
import { LandingPage } from './components/LandingPage';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  // Landing Page state (loads when you first access this program)
  const [showLandingPage, setShowLandingPage] = useState<boolean>(true);

  // Database tables & records
  const [tables, setTables] = useState<TableSchema[]>(() => {
    const raw = getStoredTables();
    return applyCodisTemplateToBureaus(raw);
  });
  const [records, setRecords] = useState<DatabaseRecord[]>(() => getStoredRecords());

  // User Management & RBAC
  const [users, setUsers] = useState<User[]>(() => getStoredUsers());
  const [currentUserId, setCurrentUserId] = useState<string>(() => getStoredCurrentUserId());

  const currentUser = useMemo(() => {
    return users.find(u => u.id === currentUserId) || users[0];
  }, [users, currentUserId]);

  const isSupervisorOrAdmin = useMemo(() => {
    return currentUser.role === 'admin' || currentUser.role === 'supervisor' || currentUser.role === 'manager';
  }, [currentUser.role]);

  // Active Table ID (supports 'all' for simultaneous view of all 3 bureau databases)
  const [activeTableId, setActiveTableId] = useState<string>(() => {
    const defaultUser = users.find(u => u.id === currentUserId) || users[0];
    const isSuper = defaultUser.role === 'admin' || defaultUser.role === 'supervisor' || defaultUser.role === 'manager';
    if (!isSuper && defaultUser.assignedBureauId && defaultUser.assignedBureauId !== 'all') {
      return defaultUser.assignedBureauId;
    }
    return 'tbl_special_crimes';
  });

  // Access control constraint: Basic users cannot access other bureaus or 'all'
  useEffect(() => {
    if (!isSupervisorOrAdmin) {
      const allowedBureau = (currentUser.assignedBureauId && currentUser.assignedBureauId !== 'all') 
        ? currentUser.assignedBureauId 
        : 'tbl_special_crimes';
      if (activeTableId !== allowedBureau) {
        setActiveTableId(allowedBureau);
      }
    }
  }, [currentUser.id, currentUser.role, currentUser.assignedBureauId, isSupervisorOrAdmin, activeTableId]);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isNewTableModalOpen, setIsNewTableModalOpen] = useState(false);
  const [isTableSettingsModalOpen, setIsTableSettingsModalOpen] = useState(false);
  
  // Record Modal
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<DatabaseRecord | null>(null);

  // User Feedback Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Sync to localStorage
  useEffect(() => {
    saveStoredTables(tables);
  }, [tables]);

  useEffect(() => {
    saveStoredRecords(records);
  }, [records]);

  useEffect(() => {
    saveStoredUsers(users);
  }, [users]);

  useEffect(() => {
    saveStoredCurrentUserId(currentUserId);
  }, [currentUserId]);

  // Build the active table object (either specific bureau or consolidated multi-view)
  const activeTable = useMemo<TableSchema>(() => {
    if (activeTableId === 'all') {
      return {
        id: 'all',
        name: 'All Bureaus — Consolidated CODIS Database',
        description: 'Simultaneous supervisory view of Special Crimes Bureau, General Crimes Bureau, and Homicide Section.',
        fields: tables[0]?.fields || CODIS_TEMPLATE_FIELDS,
      };
    }
    return tables.find(t => t.id === activeTableId) || tables[0];
  }, [activeTableId, tables]);

  const permissions = ROLE_PERMISSIONS[currentUser.role];

  // User Switching
  const handleSwitchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUserId(userId);
      const isSuper = user.role === 'admin' || user.role === 'supervisor' || user.role === 'manager';
      if (!isSuper && user.assignedBureauId && user.assignedBureauId !== 'all') {
        setActiveTableId(user.assignedBureauId);
      }
      showToast(`Switched active profile to ${user.name} (${user.role.toUpperCase()})`, 'info');
    }
  };

  // Record Handlers
  const handleOpenAddRecord = () => {
    if (!permissions.canAddRecords) {
      showToast('Your role does not have permission to add records.', 'error');
      return;
    }
    setActiveRecord(null);
    setIsRecordModalOpen(true);
  };

  const handleOpenEditRecord = (record: DatabaseRecord) => {
    setActiveRecord(record);
    setIsRecordModalOpen(true);
  };

  const handleSaveRecord = (formData: Record<string, any>, recordId?: string, targetTableId?: string) => {
    const destinationTableId = targetTableId || (activeTable.id === 'all' ? 'tbl_special_crimes' : activeTable.id);

    if (recordId) {
      // Edit existing
      if (!permissions.canEditRecords) {
        showToast('Your role does not have permission to edit records.', 'error');
        return;
      }
      setRecords(prev => prev.map(r => {
        if (r.id === recordId) {
          return {
            ...r,
            tableId: destinationTableId,
            data: formData,
            updatedAt: new Date().toISOString(),
          };
        }
        return r;
      }));
      showToast('Record successfully updated.', 'success');
    } else {
      // Add new
      if (!permissions.canAddRecords) {
        showToast('Your role does not have permission to add records.', 'error');
        return;
      }
      const newRec: DatabaseRecord = {
        id: `rec_${destinationTableId}_${Date.now()}`,
        tableId: destinationTableId,
        data: formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser.name,
      };
      setRecords(prev => [newRec, ...prev]);
      showToast('New record added to database.', 'success');
    }
  };

  const handleDeleteRecord = (recordId: string) => {
    if (!permissions.canDeleteRecords) {
      showToast('Your role does not have permission to delete records.', 'error');
      return;
    }
    setRecords(prev => prev.filter(r => r.id !== recordId));
    showToast('Record deleted.', 'info');
  };

  const handleDuplicateRecord = (record: DatabaseRecord) => {
    if (!permissions.canAddRecords) {
      showToast('Your role does not have permission to add records.', 'error');
      return;
    }
    const targetId = record.tableId || (activeTable.id === 'all' ? 'tbl_special_crimes' : activeTable.id);
    const dup: DatabaseRecord = {
      ...record,
      id: `rec_${targetId}_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser.name,
    };
    setRecords(prev => [dup, ...prev]);
    showToast('Record duplicated.', 'success');
  };

  // Table Handlers
  const handleTableCreated = (newTable: TableSchema, importedRecords: DatabaseRecord[]) => {
    setTables(prev => [...prev, newTable]);
    if (importedRecords.length > 0) {
      setRecords(prev => [...importedRecords, ...prev]);
    }
    setActiveTableId(newTable.id);
    showToast(
      `Database table "${newTable.name}" created with ${newTable.fields.length} columns and ${importedRecords.length} records.`,
      'success'
    );
  };

  const handleUpdateTable = (updatedTable: TableSchema) => {
    if (!permissions.canEditSchema) {
      showToast('Only Administrators can modify table schemas.', 'error');
      return;
    }
    setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
    showToast(`Table schema "${updatedTable.name}" updated.`, 'success');
  };

  const handleDeleteTable = (tableId: string) => {
    if (!permissions.canDeleteTables) {
      showToast('Only Administrators can delete tables.', 'error');
      return;
    }
    // Protect core bureau tables
    if (tableId === 'tbl_special_crimes' || tableId === 'tbl_general_crimes' || tableId === 'tbl_homicide_section') {
      showToast('Cannot delete core bureau databases.', 'error');
      return;
    }
    const remaining = tables.filter(t => t.id !== tableId);
    setTables(remaining);
    setRecords(prev => prev.filter(r => r.tableId !== tableId));
    setActiveTableId(remaining[0].id);
    showToast('Custom table and records permanently removed.', 'info');
  };

  // User Management Handlers
  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    if (currentUser.role !== 'admin') {
      showToast('Only Administrators can modify user roles.', 'error');
      return;
    }
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updatedBureau = (newRole === 'admin' || newRole === 'supervisor') ? 'all' : (u.assignedBureauId === 'all' ? 'tbl_special_crimes' : u.assignedBureauId);
        return { 
          ...u, 
          role: newRole,
          assignedBureauId: updatedBureau
        };
      }
      return u;
    }));
    showToast('User role updated successfully.', 'success');
  };

  const handleUpdateUserBureau = (userId: string, newBureauId: string) => {
    if (currentUser.role !== 'admin') {
      showToast('Only Administrators can assign bureaus to users.', 'error');
      return;
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, assignedBureauId: newBureauId } : u));
    showToast('User bureau assignment updated.', 'success');
  };

  const handleAddUser = (newUserData: Omit<User, 'id'>) => {
    if (currentUser.role !== 'admin') {
      showToast('Only Administrators can provision users.', 'error');
      return;
    }
    const newUser: User = {
      ...newUserData,
      id: `usr_${Date.now()}`,
    };
    setUsers(prev => [...prev, newUser]);
    showToast(`User account created for ${newUser.name}.`, 'success');
  };

  const handleDeleteUser = (userId: string) => {
    if (currentUser.role !== 'admin') {
      showToast('Only Administrators can delete users.', 'error');
      return;
    }
    if (userId === currentUser.id) {
      showToast('You cannot delete your own active account.', 'error');
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    showToast('User account removed.', 'info');
  };

  const handleResetData = () => {
    if (confirm('Reset all databases and user accounts back to initial demonstration state?')) {
      resetToDemoData();
      const demoTables = applyCodisTemplateToBureaus(getStoredTables());
      setTables(demoTables);
      setRecords(getStoredRecords());
      setUsers(getStoredUsers());
      setCurrentUserId(getStoredCurrentUserId());
      setActiveTableId('tbl_special_crimes');
      setShowLandingPage(true);
      showToast('Demo data restored.', 'info');
    }
  };

  const handleToggleAllBureaus = () => {
    if (!isSupervisorOrAdmin) {
      showToast('Only Supervisors and Administrators can view all databases simultaneously.', 'error');
      return;
    }
    if (activeTableId === 'all') {
      setActiveTableId(currentUser.assignedBureauId === 'all' || !currentUser.assignedBureauId ? 'tbl_special_crimes' : currentUser.assignedBureauId);
    } else {
      setActiveTableId('all');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-800'
              : toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-800'
              : 'bg-slate-900 text-white border-slate-800'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100 ml-2 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {showLandingPage ? (
        /* Initial Landing Page for Bureau Selection */
        <LandingPage
          tables={tables}
          selectedBureauId={activeTableId}
          onSelectBureau={(id) => {
            setActiveTableId(id);
          }}
          onEnterDatabase={(id) => {
            setActiveTableId(id);
            setShowLandingPage(false);
          }}
          currentUser={currentUser}
          allUsers={users}
          onSwitchUser={handleSwitchUser}
        />
      ) : (
        <>
          {/* Main Header with Navigation, Upload Button, Reports Button & RBAC profile switcher */}
          <Header
            tables={tables}
            activeTableId={activeTableId}
            onSelectTable={(id) => setActiveTableId(id)}
            currentUser={currentUser}
            allUsers={users}
            onSwitchUser={handleSwitchUser}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenUserModal={() => setIsUserModalOpen(true)}
            onOpenNewTableModal={() => setIsNewTableModalOpen(true)}
            onResetData={handleResetData}
            onOpenLandingPage={() => setShowLandingPage(true)}
          />

          {/* Main Table Area */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {activeTable ? (
              <TableView
                table={activeTable}
                records={records}
                currentUser={currentUser}
                onAddRecord={handleOpenAddRecord}
                onEditRecord={handleOpenEditRecord}
                onDeleteRecord={handleDeleteRecord}
                onDuplicateRecord={handleDuplicateRecord}
                onOpenTableSettings={() => setIsTableSettingsModalOpen(true)}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
                onOpenReportModal={() => setIsReportModalOpen(true)}
                isAllBureausView={activeTableId === 'all'}
                onToggleAllBureaus={handleToggleAllBureaus}
                onSelectBureau={(id) => setActiveTableId(id)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500">
                No active database table found.
              </div>
            )}
          </main>
        </>
      )}

      {/* Spreadsheet Upload & Schema Detection Modal */}
      <SpreadsheetUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onTableCreated={handleTableCreated}
        currentUserName={currentUser.name}
      />

      {/* Custom Report Builder & Exporter Modal */}
      <ReportBuilderModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        tables={tables}
        records={records}
        activeTableId={activeTableId}
        currentUser={currentUser}
      />

      {/* User Access Control & Permissions Modal */}
      <UserAccessModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        users={users}
        currentUser={currentUser}
        onUpdateUserRole={handleUpdateUserRole}
        onUpdateUserBureau={handleUpdateUserBureau}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
        onSwitchUser={handleSwitchUser}
      />

      {/* Record Creation & Editing Modal */}
      {activeTable && (
        <RecordModal
          isOpen={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
          table={activeTable}
          record={activeRecord}
          onSaveRecord={handleSaveRecord}
          onDeleteRecord={handleDeleteRecord}
          currentUser={currentUser}
        />
      )}

      {/* Table Settings & Schema Editor Modal */}
      {activeTable && activeTable.id !== 'all' && (
        <TableSettingsModal
          isOpen={isTableSettingsModalOpen}
          onClose={() => setIsTableSettingsModalOpen(false)}
          table={activeTable}
          onUpdateTable={handleUpdateTable}
          onDeleteTable={handleDeleteTable}
          currentUser={currentUser}
        />
      )}

      {/* New Blank Table Modal */}
      <NewTableModal
        isOpen={isNewTableModalOpen}
        onClose={() => setIsNewTableModalOpen(false)}
        onCreateTable={(newTable) => {
          handleTableCreated(newTable, []);
        }}
        currentUser={currentUser}
      />
    </div>
  );
}
