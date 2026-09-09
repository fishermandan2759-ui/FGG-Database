import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  SlidersHorizontal, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy, 
  Settings, 
  LayoutGrid, 
  Kanban, 
  Lock, 
  Check, 
  X, 
  Calendar, 
  DollarSign, 
  Hash, 
  Type, 
  List, 
  CheckSquare, 
  FileText, 
  Mail, 
  ExternalLink,
  ChevronRight,
  Database,
  FileSpreadsheet,
  Layers,
  Building2,
  Shield,
  FileSearch
} from 'lucide-react';
import { TableSchema, DatabaseRecord, FieldDefinition, FieldType, User, ROLE_PERMISSIONS } from '../types';

interface TableViewProps {
  table: TableSchema;
  records: DatabaseRecord[];
  currentUser: User;
  onAddRecord: () => void;
  onEditRecord: (record: DatabaseRecord) => void;
  onDeleteRecord: (recordId: string) => void;
  onDuplicateRecord: (record: DatabaseRecord) => void;
  onOpenTableSettings: () => void;
  onOpenUploadModal: () => void;
  onOpenReportModal: () => void;
  isAllBureausView?: boolean;
  onToggleAllBureaus?: () => void;
  onSelectBureau?: (bureauId: string) => void;
}

const BUREAU_LABELS: Record<string, { name: string; badgeColor: string; icon: any }> = {
  tbl_special_crimes: {
    name: 'Special Crimes Bureau',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Shield,
  },
  tbl_general_crimes: {
    name: 'General Crimes Bureau',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Building2,
  },
  tbl_homicide_section: {
    name: 'Homicide Section',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    icon: FileSearch,
  },
};

export const TableView: React.FC<TableViewProps> = ({
  table,
  records,
  currentUser,
  onAddRecord,
  onEditRecord,
  onDeleteRecord,
  onDuplicateRecord,
  onOpenTableSettings,
  onOpenUploadModal,
  onOpenReportModal,
  isAllBureausView = false,
  onToggleAllBureaus,
  onSelectBureau,
}) => {
  const permissions = ROLE_PERMISSIONS[currentUser.role];
  const isSupervisorOrAdmin = currentUser.role === 'admin' || currentUser.role === 'supervisor' || currentUser.role === 'manager';

  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [bureauColumnFilter, setBureauColumnFilter] = useState<string>('');
  const [activeBureauPill, setActiveBureauPill] = useState<string>('all');
  const [sortFieldId, setSortFieldId] = useState<string>(table.fields[0]?.id || '');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeFilterFieldId, setActiveFilterFieldId] = useState<string>('');
  const [activeFilterValue, setActiveFilterValue] = useState<string>('');

  const handleColumnFilterChange = (fieldId: string, val: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [fieldId]: val
    }));
  };

  const clearAllColumnFilters = () => {
    setColumnFilters({});
    setBureauColumnFilter('');
    setActiveBureauPill('all');
  };

  const activeColumnFilterCount = useMemo(() => {
    let count = Object.values(columnFilters).filter((v: string) => Boolean(v && v.trim())).length;
    if (bureauColumnFilter.trim()) count++;
    return count;
  }, [columnFilters, bureauColumnFilter]);

  // Find primary status or select column for Kanban view
  const statusField = useMemo(() => {
    return (
      table.fields.find(f => f.type === 'status') ||
      table.fields.find(f => f.type === 'select') ||
      table.fields[1] ||
      table.fields[0]
    );
  }, [table]);

  // Bureau counts for multi-view pill filter
  const bureauCounts = useMemo(() => {
    const scb = records.filter(r => r.tableId === 'tbl_special_crimes').length;
    const gcb = records.filter(r => r.tableId === 'tbl_general_crimes').length;
    const hom = records.filter(r => r.tableId === 'tbl_homicide_section').length;
    return {
      all: scb + gcb + hom,
      tbl_special_crimes: scb,
      tbl_general_crimes: gcb,
      tbl_homicide_section: hom,
    };
  }, [records]);

  // Filter & sort records
  const processedRecords = useMemo(() => {
    let result: DatabaseRecord[];

    if (isAllBureausView || table.id === 'all') {
      result = records.filter(r => 
        r.tableId === 'tbl_special_crimes' || 
        r.tableId === 'tbl_general_crimes' || 
        r.tableId === 'tbl_homicide_section'
      );
      // Pill quick filter
      if (activeBureauPill !== 'all') {
        result = result.filter(r => r.tableId === activeBureauPill);
      }
      // Bureau column search filter
      if (bureauColumnFilter.trim()) {
        const bq = bureauColumnFilter.toLowerCase();
        result = result.filter(r => {
          const bureauMeta = BUREAU_LABELS[r.tableId];
          const name = bureauMeta ? bureauMeta.name.toLowerCase() : '';
          return name.includes(bq);
        });
      }
    } else {
      result = records.filter(r => r.tableId === table.id);
    }

    // Global Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(record => {
        const bureauMeta = BUREAU_LABELS[record.tableId];
        const bureauNameMatch = bureauMeta && bureauMeta.name.toLowerCase().includes(q);
        const dataMatch = Object.values(record.data).some(val => {
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(q);
        });
        return bureauNameMatch || dataMatch;
      });
    }

    // Dropdown Status Filter
    if (activeFilterFieldId && activeFilterValue) {
      result = result.filter(record => {
        const val = record.data[activeFilterFieldId];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase() === activeFilterValue.toLowerCase();
      });
    }

    // Per-Column Filter Searches (Instant typing filter)
    const activeFilters = Object.entries(columnFilters)
      .map(([id, text]): [string, string] => [id, String(text || '')])
      .filter(([_, text]) => text.trim() !== '');
    if (activeFilters.length > 0) {
      result = result.filter(record => {
        return activeFilters.every(([fieldId, filterText]) => {
          const val = record.data[fieldId];
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(filterText.toLowerCase());
        });
      });
    }

    // Sort
    if (sortFieldId) {
      const field = table.fields.find(f => f.id === sortFieldId);
      result.sort((a, b) => {
        const valA = a.data[sortFieldId];
        const valB = b.data[sortFieldId];

        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        let cmp = 0;
        if (field?.type === 'number' || field?.type === 'currency') {
          cmp = Number(valA) - Number(valB);
        } else {
          cmp = String(valA).localeCompare(String(valB));
        }

        return sortDirection === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [records, table, isAllBureausView, activeBureauPill, bureauColumnFilter, searchQuery, activeFilterFieldId, activeFilterValue, columnFilters, sortFieldId, sortDirection]);

  const handleSort = (fieldId: string) => {
    if (sortFieldId === fieldId) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortFieldId(fieldId);
      setSortDirection('asc');
    }
  };

  const renderFieldIcon = (type: FieldType) => {
    switch (type) {
      case 'currency': return <DollarSign className="w-3 h-3 text-emerald-600" />;
      case 'number': return <Hash className="w-3 h-3 text-blue-600" />;
      case 'date': return <Calendar className="w-3 h-3 text-purple-600" />;
      case 'status': return <List className="w-3 h-3 text-amber-600" />;
      case 'select': return <List className="w-3 h-3 text-slate-600" />;
      case 'checkbox': return <CheckSquare className="w-3 h-3 text-indigo-600" />;
      case 'email': return <Mail className="w-3 h-3 text-cyan-600" />;
      case 'url': return <ExternalLink className="w-3 h-3 text-sky-600" />;
      case 'longtext': return <FileText className="w-3 h-3 text-slate-500" />;
      default: return <Type className="w-3 h-3 text-slate-400" />;
    }
  };

  const getStatusPillColor = (statusValue: string, field?: FieldDefinition) => {
    const opt = field?.options?.find(
      (o) => o.label.toLowerCase() === statusValue.toLowerCase()
    );
    if (opt?.color) {
      const colorMap: Record<string, string> = {
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
        amber: 'bg-amber-50 text-amber-700 border-amber-200',
        yellow: 'bg-amber-50 text-amber-700 border-amber-200',
        rose: 'bg-rose-50 text-rose-700 border-rose-200',
        red: 'bg-rose-50 text-rose-700 border-rose-200',
        slate: 'bg-slate-100 text-slate-700 border-slate-200',
        sky: 'bg-sky-50 text-sky-700 border-sky-200',
      };
      return colorMap[opt.color] || 'bg-slate-100 text-slate-700 border-slate-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div id="table-view-container" className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Top Action Header Bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 shrink-0 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left Title and Stats */}
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isAllBureausView || table.id === 'all'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-900'
            }`}>
              {isAllBureausView || table.id === 'all' ? (
                <Layers className="w-5 h-5" />
              ) : (
                <Database className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-none">
                  {table.name}
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {processedRecords.length} {processedRecords.length === 1 ? 'Record' : 'Records'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {table.description}
              </p>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            {/* View All 3 Databases Option for Supervisors and Administrators */}
            {isSupervisorOrAdmin && onToggleAllBureaus && (
              <button
                onClick={onToggleAllBureaus}
                id="btn-toggle-multi-database"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border shadow-2xs ${
                  isAllBureausView || table.id === 'all'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                }`}
                title={isAllBureausView || table.id === 'all' ? 'Return to single bureau view' : 'Inspect all 3 bureau databases simultaneously'}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {isAllBureausView || table.id === 'all' 
                    ? 'Switch to Single Bureau' 
                    : 'View All 3 Databases Simultaneously'}
                </span>
              </button>
            )}

            {/* Layout Mode (Table vs Kanban) */}
            <div className="bg-slate-100 p-0.5 rounded-lg flex items-center border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                id="view-mode-table-btn"
                className={`p-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Spreadsheet Table View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                id="view-mode-kanban-btn"
                className={`p-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Status Kanban Board"
              >
                <Kanban className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Table Schema Settings (Admins only) */}
            {permissions.canEditSchema && (
              <button
                onClick={onOpenTableSettings}
                id="btn-table-settings"
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                title="Table Schema & Column Configuration"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}

            {/* Add Record Button */}
            <button
              onClick={onAddRecord}
              disabled={!permissions.canAddRecords}
              id="btn-add-record"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs ${
                permissions.canAddRecords
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
              title={permissions.canAddRecords ? 'Add new record' : 'Your role does not allow adding records'}
            >
              {permissions.canAddRecords ? (
                <Plus className="w-3.5 h-3.5" />
              ) : (
                <Lock className="w-3 h-3" />
              )}
              <span>Add Record</span>
            </button>
          </div>
        </div>

        {/* Multi-Bureau Quick Filter Pills (Shown only when viewing all 3 databases) */}
        {(isAllBureausView || table.id === 'all') && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3" /> Filter Bureau:
            </span>
            <button
              onClick={() => setActiveBureauPill('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                activeBureauPill === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Bureaus ({bureauCounts.all})
            </button>
            <button
              onClick={() => setActiveBureauPill('tbl_special_crimes')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeBureauPill === 'tbl_special_crimes'
                  ? 'bg-purple-700 text-white'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              <Shield className="w-3 h-3" />
              Special Crimes ({bureauCounts.tbl_special_crimes})
            </button>
            <button
              onClick={() => setActiveBureauPill('tbl_general_crimes')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeBureauPill === 'tbl_general_crimes'
                  ? 'bg-blue-700 text-white'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <Building2 className="w-3 h-3" />
              General Crimes ({bureauCounts.tbl_general_crimes})
            </button>
            <button
              onClick={() => setActiveBureauPill('tbl_homicide_section')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeBureauPill === 'tbl_homicide_section'
                  ? 'bg-rose-700 text-white'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <FileSearch className="w-3 h-3" />
              Homicide Section ({bureauCounts.tbl_homicide_section})
            </button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${isAllBureausView || table.id === 'all' ? 'all 3 bureaus' : table.name} across all columns...`}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            {statusField && statusField.options && statusField.options.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium text-[11px]">Filter {statusField.name}:</span>
                <select
                  value={activeFilterFieldId === statusField.id ? activeFilterValue : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setActiveFilterFieldId(statusField.id);
                      setActiveFilterValue(e.target.value);
                    } else {
                      setActiveFilterFieldId('');
                      setActiveFilterValue('');
                    }
                  }}
                  className="text-xs rounded-md border border-slate-200 px-2 py-1 bg-white text-slate-700 outline-hidden cursor-pointer font-medium"
                >
                  <option value="">All</option>
                  {statusField.options.map((opt) => (
                    <option key={opt.id} value={opt.label}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(searchQuery || activeFilterValue || activeColumnFilterCount > 0) && (
              <div className="flex items-center gap-2">
                {activeColumnFilterCount > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-medium border border-amber-300">
                    {activeColumnFilterCount} column {activeColumnFilterCount === 1 ? 'filter' : 'filters'} active
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilterFieldId('');
                    setActiveFilterValue('');
                    clearAllColumnFilters();
                  }}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-slate-50/50 p-4 sm:p-6">
        {processedRecords.length === 0 ? (
          /* Empty State */
          <div className="max-w-md mx-auto my-12 text-center p-8 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              {searchQuery || activeFilterValue || activeColumnFilterCount > 0 ? 'No matching records found' : 'No records in this database yet'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              {searchQuery || activeFilterValue || activeColumnFilterCount > 0
                ? 'Try clearing your search query or column filters.'
                : 'Get started by creating your first casework entry.'}
            </p>
            <div className="flex items-center justify-center gap-2">
              {permissions.canAddRecords && (
                <button
                  onClick={onAddRecord}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Record</span>
                </button>
              )}
              {isSupervisorOrAdmin && (
                <button
                  onClick={onOpenUploadModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Import Spreadsheet</span>
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'table' ? (
          /* Table Grid View */
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px] select-none">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center text-slate-400 font-semibold border-r border-slate-200/60">
                      #
                    </th>

                    {/* Bureau Column (Visible when viewing all 3 databases simultaneously) */}
                    {(isAllBureausView || table.id === 'all') && (
                      <th className="py-2.5 px-3.5 whitespace-nowrap border-r border-slate-200/60 bg-slate-200/40 text-slate-900 font-bold">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Bureau</span>
                        </div>
                      </th>
                    )}

                    {table.fields.map((field) => {
                      const isSorted = sortFieldId === field.id;
                      return (
                        <th
                          key={field.id}
                          onClick={() => handleSort(field.id)}
                          className="py-2.5 px-3.5 whitespace-nowrap cursor-pointer hover:bg-slate-200/60 transition-colors border-r border-slate-200/60"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 text-slate-800">
                              {renderFieldIcon(field.type)}
                              <span>{field.name}</span>
                            </span>
                            <span className="text-slate-400">
                              {isSorted ? (
                                sortDirection === 'asc' ? (
                                  <ArrowUp className="w-3 h-3 text-indigo-600" />
                                ) : (
                                  <ArrowDown className="w-3 h-3 text-indigo-600" />
                                )
                              ) : (
                                <ArrowUpDown className="w-3 h-3 opacity-30" />
                              )}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                    <th className="py-2.5 px-3 w-20 text-center">Actions</th>
                  </tr>

                  {/* Per-Column Instant Search Row */}
                  <tr className="bg-slate-50/95 border-t border-slate-200/90 text-slate-600 font-normal">
                    <th className="py-2 px-2 text-center text-slate-400 border-r border-slate-200/60 font-mono text-[10px]">
                      <Filter className="w-3.5 h-3.5 mx-auto text-slate-400" />
                    </th>

                    {/* Bureau Column Instant Search */}
                    {(isAllBureausView || table.id === 'all') && (
                      <th className="p-1.5 border-r border-slate-200/60 font-normal bg-slate-100/40">
                        <div className="relative flex items-center min-w-[130px]">
                          <Search className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
                          <input
                            type="text"
                            value={bureauColumnFilter}
                            onChange={(e) => setBureauColumnFilter(e.target.value)}
                            placeholder="Filter Bureau..."
                            className={`w-full text-[11px] font-normal pl-6.5 pr-6 py-1 rounded-md border outline-hidden transition-all ${
                              bureauColumnFilter
                                ? 'border-amber-500 bg-amber-50/80 text-slate-900 font-medium ring-1 ring-amber-400/50'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-400'
                            }`}
                          />
                          {bureauColumnFilter && (
                            <button
                              type="button"
                              onClick={() => setBureauColumnFilter('')}
                              className="absolute right-1.5 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </th>
                    )}

                    {table.fields.map((field) => {
                      const filterVal = columnFilters[field.id] || '';
                      return (
                        <th key={`col-filter-${field.id}`} className="p-1.5 border-r border-slate-200/60 font-normal">
                          <div className="relative flex items-center min-w-[140px]">
                            <Search className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
                            <input
                              type="text"
                              value={filterVal}
                              onChange={(e) => handleColumnFilterChange(field.id, e.target.value)}
                              placeholder={`Filter ${field.name}...`}
                              className={`w-full text-[11px] font-normal pl-6.5 pr-6 py-1 rounded-md border outline-hidden transition-all ${
                                filterVal
                                  ? 'border-amber-500 bg-amber-50/80 text-slate-900 font-medium ring-1 ring-amber-400/50'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-400'
                              }`}
                            />
                            {filterVal && (
                              <button
                                type="button"
                                onClick={() => handleColumnFilterChange(field.id, '')}
                                className="absolute right-1.5 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                                title={`Clear filter for ${field.name}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </th>
                      );
                    })}
                    <th className="py-1.5 px-2 text-center font-normal">
                      {activeColumnFilterCount > 0 ? (
                        <button
                          type="button"
                          onClick={clearAllColumnFilters}
                          className="text-[10px] font-bold text-rose-600 hover:text-rose-800 underline cursor-pointer"
                          title="Clear all column searches"
                        >
                          Clear
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">Search</span>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedRecords.map((record, index) => {
                    const bureauMeta = BUREAU_LABELS[record.tableId];

                    return (
                      <tr
                        key={record.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => onEditRecord(record)}
                      >
                        {/* Row Index */}
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[10px] border-r border-slate-100">
                          {index + 1}
                        </td>

                        {/* Bureau Column (when viewing all 3 databases) */}
                        {(isAllBureausView || table.id === 'all') && (
                          <td className="py-2.5 px-3.5 whitespace-nowrap border-r border-slate-100">
                            {bureauMeta ? (
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold border ${bureauMeta.badgeColor}`}>
                                <bureauMeta.icon className="w-3 h-3" />
                                <span>{bureauMeta.name}</span>
                              </span>
                            ) : (
                              <span className="text-slate-500 font-medium text-xs">
                                {record.tableId}
                              </span>
                            )}
                          </td>
                        )}

                        {/* Fields */}
                        {table.fields.map((field) => {
                          const val = record.data[field.id];

                          return (
                            <td
                              key={field.id}
                              className="py-2.5 px-3.5 whitespace-nowrap text-slate-800 border-r border-slate-100 max-w-xs truncate"
                            >
                              {val === undefined || val === null || val === '' ? (
                                <span className="text-slate-300">—</span>
                              ) : field.type === 'status' ? (
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusPillColor(
                                    String(val),
                                    field
                                  )}`}
                                >
                                  {String(val)}
                                </span>
                              ) : field.type === 'select' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                  {String(val)}
                                </span>
                              ) : field.type === 'currency' && typeof val === 'number' ? (
                                <span className="font-semibold text-slate-900 font-mono">
                                  {field.currencySymbol || '$'}
                                  {val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              ) : field.type === 'number' && typeof val === 'number' ? (
                                <span className="font-mono text-slate-900 font-medium">
                                  {val.toLocaleString()}
                                </span>
                              ) : field.type === 'checkbox' ? (
                                val ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Yes
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[11px]">No</span>
                                )
                              ) : field.type === 'date' ? (
                                <span className="text-slate-600 font-mono text-[11px]">
                                  {String(val)}
                                </span>
                              ) : field.type === 'email' ? (
                                <a
                                  href={`mailto:${val}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-indigo-600 hover:underline"
                                >
                                  {String(val)}
                                </a>
                              ) : (
                                <span className="truncate">{String(val)}</span>
                              )}
                            </td>
                          );
                        })}

                        {/* Row Actions */}
                        <td
                          className="py-2 px-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEditRecord(record)}
                              className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                              title="Edit record"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {permissions.canAddRecords && (
                              <button
                                onClick={() => onDuplicateRecord(record)}
                                className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                title="Duplicate record"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {permissions.canDeleteRecords && (
                              <button
                                onClick={() => {
                                  if (confirm('Delete this record?')) {
                                    onDeleteRecord(record.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Delete record"
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
          /* Kanban Status Board View */
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-start">
            {statusField?.options?.map((opt) => {
              const columnRecords = processedRecords.filter(
                (r) => String(r.data[statusField.id]).toLowerCase() === opt.label.toLowerCase()
              );

              return (
                <div
                  key={opt.id}
                  className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{opt.label}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                        {columnRecords.length}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-[70vh] overflow-y-auto pr-1">
                    {columnRecords.length === 0 ? (
                      <div className="py-6 text-center text-slate-300 text-xs italic">
                        No entries
                      </div>
                    ) : (
                      columnRecords.map((record) => {
                        const bureauMeta = BUREAU_LABELS[record.tableId];

                        return (
                          <div
                            key={record.id}
                            onClick={() => onEditRecord(record)}
                            className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer space-y-2"
                          >
                            {(isAllBureausView || table.id === 'all') && bureauMeta && (
                              <div className="flex items-center gap-1">
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${bureauMeta.badgeColor}`}>
                                  {bureauMeta.name}
                                </span>
                              </div>
                            )}

                            <div className="font-semibold text-xs text-slate-900 line-clamp-1">
                              {String(record.data[table.fields[0].id] || 'Untitled')}
                            </div>

                            {/* 2nd & 3rd fields preview */}
                            <div className="text-[11px] text-slate-500 space-y-1">
                              {table.fields.slice(1, 4).map((f) => {
                                if (f.id === statusField.id) return null;
                                const v = record.data[f.id];
                                if (v === undefined || v === null || v === '') return null;
                                return (
                                  <div key={f.id} className="flex items-center justify-between gap-1">
                                    <span className="text-slate-400">{f.name}:</span>
                                    <span className="font-medium text-slate-700 truncate max-w-[120px]">
                                      {f.type === 'currency' && typeof v === 'number'
                                        ? `$${v.toLocaleString()}`
                                        : String(v)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                              <span>ID: {record.id.slice(-6)}</span>
                              <span className="text-indigo-600 font-medium hover:underline">
                                Edit &rarr;
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
