import React, { useState, useMemo } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Printer, 
  Filter, 
  CheckSquare, 
  Square, 
  Layers, 
  BarChart2, 
  Table, 
  Lock,
  Calendar,
  DollarSign,
  Hash,
  Sparkles,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { TableSchema, DatabaseRecord, FieldDefinition, User, ROLE_PERMISSIONS } from '../types';
import { exportTableData } from '../utils/spreadsheet';

interface ReportBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: TableSchema[];
  records: DatabaseRecord[];
  activeTableId: string;
  currentUser: User;
}

export const ReportBuilderModal: React.FC<ReportBuilderModalProps> = ({
  isOpen,
  onClose,
  tables,
  records,
  activeTableId,
  currentUser,
}) => {
  const permissions = ROLE_PERMISSIONS[currentUser.role];

  const [selectedTableId, setSelectedTableId] = useState<string>(activeTableId);
  const [reportTitle, setReportTitle] = useState<string>('Custom Operations Report');
  const [selectedColumnIds, setSelectedColumnIds] = useState<string[]>([]);
  
  // Quick Filters
  const [filterFieldId, setFilterFieldId] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const currentTable = useMemo(() => {
    return tables.find(t => t.id === selectedTableId) || tables[0];
  }, [tables, selectedTableId]);

  // Sync selected columns when table changes
  React.useEffect(() => {
    if (currentTable) {
      // Default select all columns
      setSelectedColumnIds(currentTable.fields.map(f => f.id));
      setReportTitle(`${currentTable.name} Summary Report`);
      setFilterFieldId('');
      setFilterValue('');
    }
  }, [currentTable?.id]);

  // Filter records belonging to selected table
  const tableRecords = useMemo(() => {
    if (!currentTable) return [];
    return records.filter(r => r.tableId === currentTable.id);
  }, [records, currentTable]);

  // Apply search & column filters to report records
  const filteredRecords = useMemo(() => {
    let list = [...tableRecords];

    // Column-specific filter
    if (filterFieldId && filterValue.trim()) {
      const field = currentTable?.fields.find(f => f.id === filterFieldId);
      list = list.filter(r => {
        const val = r.data[filterFieldId];
        if (val === undefined || val === null) return false;
        if (field?.type === 'number' || field?.type === 'currency') {
          return Number(val) >= Number(filterValue);
        }
        return String(val).toLowerCase().includes(filterValue.toLowerCase());
      });
    }

    // General text search
    if (searchFilter.trim()) {
      const query = searchFilter.toLowerCase();
      list = list.filter(r => {
        return Object.values(r.data).some(v => 
          v !== null && v !== undefined && String(v).toLowerCase().includes(query)
        );
      });
    }

    return list;
  }, [tableRecords, filterFieldId, filterValue, searchFilter, currentTable]);

  // Selected field objects
  const activeFields = useMemo(() => {
    if (!currentTable) return [];
    return currentTable.fields.filter(f => selectedColumnIds.includes(f.id));
  }, [currentTable, selectedColumnIds]);

  // Calculate summary metrics for numeric columns
  const numericSummaries = useMemo(() => {
    if (!currentTable) return [];
    const numFields = activeFields.filter(f => f.type === 'number' || f.type === 'currency');
    
    return numFields.map(field => {
      const values = filteredRecords
        .map(r => Number(r.data[field.id]))
        .filter(n => !isNaN(n));

      const sum = values.reduce((acc, v) => acc + v, 0);
      const avg = values.length > 0 ? sum / values.length : 0;
      const min = values.length > 0 ? Math.min(...values) : 0;
      const max = values.length > 0 ? Math.max(...values) : 0;

      return {
        field,
        sum,
        avg,
        min,
        max,
        count: values.length,
      };
    });
  }, [activeFields, filteredRecords, currentTable]);

  if (!isOpen) return null;

  // Toggle column selection
  const toggleColumn = (id: string) => {
    if (selectedColumnIds.includes(id)) {
      if (selectedColumnIds.length === 1) return; // keep at least one
      setSelectedColumnIds(selectedColumnIds.filter(c => c !== id));
    } else {
      setSelectedColumnIds([...selectedColumnIds, id]);
    }
  };

  const selectAllColumns = () => {
    if (currentTable) {
      setSelectedColumnIds(currentTable.fields.map(f => f.id));
    }
  };

  const handleExport = (format: 'xlsx' | 'csv') => {
    if (!permissions.canExportReports) return;
    exportTableData(filteredRecords, activeFields, reportTitle, format);
  };

  const handleExportJSON = () => {
    if (!permissions.canExportReports) return;
    const exportData = filteredRecords.map(r => {
      const obj: Record<string, any> = {};
      activeFields.forEach(f => {
        obj[f.name] = r.data[f.id];
      });
      return obj;
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Custom Report Generator & Exporter</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Data Selection
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Select your database, pick desired columns, filter records, and export to Excel (.xlsx), CSV, or Printable Report.
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

        {/* Access control check */}
        {!permissions.canExportReports ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Export Access Restricted</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your active role (<strong>{currentUser.role}</strong>) does not have permission to export database reports.
              Switch to an <strong>Admin</strong> or <strong>Manager</strong> profile using the user profile menu to export.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Step 1 & 2: Database Table & Columns Selection Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              {/* Select Table */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  1. Source Database Table
                </label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                >
                  {tables.map((tbl) => (
                    <option key={tbl.id} value={tbl.id}>
                      {tbl.name} ({tbl.fields.length} cols)
                    </option>
                  ))}
                </select>
              </div>

              {/* Report Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  2. Report Document Title
                </label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="e.g. Q3 Fleet Maintenance & Financial Report"
                  className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>
            </div>

            {/* Column Selection Chips */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Select Columns to Include ({selectedColumnIds.length} of {currentTable?.fields.length || 0})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAllColumns}
                    className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={() => setSelectedColumnIds(currentTable?.fields.slice(0, 3).map(f => f.id) || [])}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Primary Only
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-slate-200 bg-white">
                {currentTable?.fields.map((field) => {
                  const isSelected = selectedColumnIds.includes(field.id);
                  return (
                    <button
                      key={field.id}
                      onClick={() => toggleColumn(field.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold shadow-2xs'
                          : 'bg-slate-50 text-slate-500 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>{field.name}</span>
                      <span className="text-[10px] opacity-70 uppercase tracking-wider">
                        ({field.type})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Filtering & Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Filter by Specific Column
                </label>
                <select
                  value={filterFieldId}
                  onChange={(e) => setFilterFieldId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white"
                >
                  <option value="">All Columns</option>
                  {currentTable?.fields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Filter Condition / Value
                </label>
                <input
                  type="text"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  placeholder="e.g. Operational, or > 5000"
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Search across report rows
                </label>
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Type to search..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white"
                />
              </div>
            </div>

            {/* Calculated KPI / Aggregations Summary */}
            {numericSummaries.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-emerald-600" />
                  Calculated Financial & Numeric Aggregations
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {numericSummaries.map((summary) => (
                    <div key={summary.field.id} className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <div className="text-[11px] font-semibold text-slate-500 truncate mb-1">
                        {summary.field.name}
                      </div>
                      <div className="text-lg font-bold text-slate-900">
                        {summary.field.type === 'currency'
                          ? `$${summary.sum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : summary.sum.toLocaleString()}
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-1">
                        <span>Avg: {summary.field.type === 'currency' ? `$${summary.avg.toFixed(2)}` : summary.avg.toFixed(1)}</span>
                        <span>Max: {summary.field.type === 'currency' ? `$${summary.max.toFixed(0)}` : summary.max}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Interactive Report Preview Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Table className="w-4 h-4 text-slate-500" />
                  Report Preview ({filteredRecords.length} records selected)
                </span>
                <span className="text-[11px] text-slate-400">
                  Data reflects selected columns and applied filters
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs max-h-72">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/80 sticky top-0 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3 w-8 text-center">#</th>
                      {activeFields.map((field) => (
                        <th key={field.id} className="py-2.5 px-3 whitespace-nowrap">
                          {field.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={activeFields.length + 1} className="py-8 text-center text-slate-400 text-xs">
                          No records match the current filter selection.
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((record, idx) => (
                        <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2 px-3 text-center text-slate-400 text-[10px]">
                            {idx + 1}
                          </td>
                          {activeFields.map((field) => {
                            const val = record.data[field.id];
                            return (
                              <td key={field.id} className="py-2 px-3 whitespace-nowrap text-slate-800">
                                {field.type === 'currency' && typeof val === 'number'
                                  ? `$${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                                  : field.type === 'checkbox'
                                  ? (val ? 'Yes' : 'No')
                                  : String(val !== undefined && val !== null ? val : '—')}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer with Export Action Buttons */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>

          {permissions.canExportReports && (
            <div className="flex items-center gap-2">
              {/* Export to Excel (.xlsx) */}
              <button
                onClick={() => handleExport('xlsx')}
                id="btn-export-excel"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                title="Download formatted Excel spreadsheet"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel (.xlsx)</span>
              </button>

              {/* Export to CSV (.csv) */}
              <button
                onClick={() => handleExport('csv')}
                id="btn-export-csv"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
                title="Download comma-separated values"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>

              {/* Print / Save as PDF */}
              <button
                onClick={handlePrint}
                id="btn-print-report"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
                title="Print or save as PDF"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print / PDF View</span>
              </button>

              {/* Export JSON */}
              <button
                onClick={handleExportJSON}
                id="btn-export-json"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Download JSON format"
              >
                <span>JSON</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
