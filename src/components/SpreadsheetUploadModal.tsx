import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Download, 
  Sparkles, 
  ArrowRight, 
  Database, 
  Clipboard, 
  Edit3, 
  HelpCircle,
  Type, 
  Hash, 
  DollarSign, 
  Calendar, 
  List, 
  CheckSquare, 
  FileText, 
  Mail, 
  Link 
} from 'lucide-react';
import { TableSchema, FieldDefinition, FieldType, DatabaseRecord } from '../types';
import { 
  parseSpreadsheetFile, 
  parsePastedSpreadsheetText,
  ParsedSpreadsheet, 
  downloadBlankTemplate, 
  generateFieldId,
  inferFieldType 
} from '../utils/spreadsheet';

interface SpreadsheetUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTableCreated: (newTable: TableSchema, importedRecords: DatabaseRecord[]) => void;
  currentUserName: string;
}

const FIELD_TYPES: { type: FieldType; label: string; icon: any }[] = [
  { type: 'text', label: 'Single Line Text', icon: Type },
  { type: 'number', label: 'Numeric Value', icon: Hash },
  { type: 'currency', label: 'Currency ($)', icon: DollarSign },
  { type: 'date', label: 'Calendar Date', icon: Calendar },
  { type: 'status', label: 'Status Badge', icon: List },
  { type: 'select', label: 'Dropdown Select', icon: List },
  { type: 'checkbox', label: 'Yes / No Checkbox', icon: CheckSquare },
  { type: 'longtext', label: 'Long Description / Notes', icon: FileText },
  { type: 'email', label: 'Email Address', icon: Mail },
  { type: 'url', label: 'Web URL / Link', icon: Link },
];

export const SpreadsheetUploadModal: React.FC<SpreadsheetUploadModalProps> = ({
  isOpen,
  onClose,
  onTableCreated,
  currentUserName,
}) => {
  const [importTab, setImportTab] = useState<'upload' | 'paste' | 'manual'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedSpreadsheet | null>(null);

  // Paste tab state
  const [pastedText, setPastedText] = useState('');
  const [pasteTableName, setPasteTableName] = useState('');

  // Manual columns tab state
  const [manualText, setManualText] = useState('');
  const [manualTableName, setManualTableName] = useState('');

  // Customization state
  const [tableName, setTableName] = useState('');
  const [tableDesc, setTableDesc] = useState('');
  const [configuredFields, setConfiguredFields] = useState<FieldDefinition[]>([]);
  const [importRows, setImportRows] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setError(null);
    setLoading(true);
    try {
      const result = await parseSpreadsheetFile(file);
      setParsedData(result);
      
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

      setTableName(cleanName || 'Custom Database Table');
      setTableDesc(`Created from uploaded spreadsheet "${file.name}" with ${result.headers.length} columns.`);
      setConfiguredFields(result.inferredFields);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to read file. Please ensure it is a readable spreadsheet or try copying and pasting its contents.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPastedText = () => {
    if (!pastedText.trim()) {
      setError('Please paste some tabular data or column headers from Excel or Google Sheets.');
      return;
    }
    setError(null);
    try {
      const defaultName = pasteTableName.trim() || 'Imported Spreadsheet';
      const result = parsePastedSpreadsheetText(pastedText, defaultName);
      setParsedData(result);
      setTableName(defaultName);
      setTableDesc(`Imported from pasted spreadsheet data (${result.headers.length} columns detected).`);
      setConfiguredFields(result.inferredFields);
    } catch (err: any) {
      setError(err.message || 'Failed to parse pasted data. Ensure the first line contains your column headers.');
    }
  };

  const handleProcessManualColumns = () => {
    if (!manualText.trim()) {
      setError('Please enter at least one column name.');
      return;
    }
    setError(null);
    try {
      const headers = manualText
        .split(/[,\n]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      if (headers.length === 0) {
        throw new Error('No valid column names detected.');
      }

      const inferredFields: FieldDefinition[] = headers.map(header => {
        const { type, options } = inferFieldType(header, []);
        return {
          id: generateFieldId(header),
          name: header,
          type,
          options,
          currencySymbol: type === 'currency' ? '$' : undefined,
        };
      });

      const name = manualTableName.trim() || 'Custom Database Table';
      setParsedData({
        fileName: 'Manual Schema',
        sheetName: 'Sheet1',
        headers,
        sampleRows: [],
        totalRows: 0,
        inferredFields,
      });
      setTableName(name);
      setTableDesc(`Custom database schema with ${headers.length} defined columns.`);
      setConfiguredFields(inferredFields);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateField = (index: number, updates: Partial<FieldDefinition>) => {
    setConfiguredFields(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  const handleAddField = () => {
    const newField: FieldDefinition = {
      id: generateFieldId('new_field'),
      name: `New Column ${configuredFields.length + 1}`,
      type: 'text',
    };
    setConfiguredFields([...configuredFields, newField]);
  };

  const handleRemoveField = (index: number) => {
    setConfiguredFields(configuredFields.filter((_, i) => i !== index));
  };

  const handleBuildDatabase = () => {
    if (!tableName.trim()) {
      setError('Please provide a name for this database table.');
      return;
    }
    if (configuredFields.length === 0) {
      setError('A database table must have at least one column.');
      return;
    }

    const tableId = `tbl_${Date.now()}`;
    const newTable: TableSchema = {
      id: tableId,
      name: tableName.trim(),
      description: tableDesc.trim(),
      fields: configuredFields,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let createdRecords: DatabaseRecord[] = [];
    if (parsedData && parsedData.sampleRows.length > 0 && importRows) {
      createdRecords = parsedData.sampleRows.map((row, idx) => {
        const recordData: Record<string, any> = {};
        configuredFields.forEach((field, colIdx) => {
          let val = row[colIdx];
          if (field.type === 'number' || field.type === 'currency') {
            const num = Number(String(val).replace(/[^0-9.-]+/g, ''));
            recordData[field.id] = isNaN(num) ? 0 : num;
          } else if (field.type === 'checkbox') {
            const s = String(val).toLowerCase();
            recordData[field.id] = s === 'true' || s === 'yes' || s === '1';
          } else {
            recordData[field.id] = val !== undefined && val !== null ? String(val) : '';
          }
        });

        return {
          id: `rec_${tableId}_${idx + 1}`,
          tableId,
          data: recordData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: currentUserName,
        };
      });
    }

    onTableCreated(newTable, createdRecords);
    onClose();
  };

  const resetModal = () => {
    setParsedData(null);
    setError(null);
    setTableName('');
    setTableDesc('');
    setPastedText('');
    setManualText('');
    setConfiguredFields([]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {parsedData ? 'Configure Detected Database Schema' : 'Import Spreadsheet or Template'}
              </h2>
              <p className="text-xs text-slate-500">
                {parsedData
                  ? 'We analyzed your columns. Customize types, labels, and options below before creating your table.'
                  : 'Upload an Excel (.xlsx, .xls) or CSV file, paste spreadsheet cells, or type your column names.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetModal();
              onClose();
            }}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative helper callout */}
        {!parsedData && (
          <div className="bg-amber-50/80 border-b border-amber-200/80 px-6 py-2.5 flex items-center gap-2.5 text-xs text-amber-900">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Where to upload:</strong> Use this in-app upload dialog or the <strong>Paste Cells</strong> tab below. <em>(If you tried attaching an .xlsx file to the AI Studio chat prompt at the bottom of the screen, the chat interface does not support .xlsx attachments directly).</em>
            </span>
          </div>
        )}

        {/* Tab switchers if not yet parsed */}
        {!parsedData && (
          <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
            <button
              onClick={() => { setImportTab('upload'); setError(null); }}
              className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                importTab === 'upload'
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File (.xlsx, .xls, .csv)</span>
            </button>
            <button
              onClick={() => { setImportTab('paste'); setError(null); }}
              className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                importTab === 'paste'
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste from Excel / Google Sheets</span>
            </button>
            <button
              onClick={() => { setImportTab('manual'); setError(null); }}
              className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                importTab === 'manual'
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Type Column Names</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Notice</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {!parsedData ? (
            <div className="space-y-6">
              {importTab === 'upload' && (
                <>
                  {/* Drag and drop area */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                      dragActive
                        ? 'border-indigo-600 bg-indigo-50/50 scale-[0.99]'
                        : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/80 bg-slate-50/30'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv,.tsv,.txt,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,text/plain,*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-2xs">
                      <Upload className="w-7 h-7" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 mb-1">
                      Drag and drop your spreadsheet here, or <span className="text-indigo-600 underline">browse file</span>
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                      Supports blank spreadsheets with just column headers, or populated sheets with example rows. 
                      Accepts <strong>.xlsx</strong>, <strong>.xls</strong>, <strong>.csv</strong>, and <strong>.tsv</strong>.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Auto-detects data types (Text, Currency, Dates, Dropdown badges, etc.)
                    </div>
                  </div>

                  {/* Downloadable Blank Example Templates */}
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Need a blank spreadsheet template to test?
                        </h4>
                        <p className="text-xs text-slate-500">
                          Download one of these pre-configured blank templates, inspect or modify the columns, and upload it right back!
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadBlankTemplate('Marine_Fleet_Inspection', [
                            { name: 'Equipment Code', example: 'EQ-902' },
                            { name: 'Vessel Name', example: 'FV Atlantic Pride' },
                            { name: 'Department', example: 'Navigation' },
                            { name: 'Service Cost', example: '3250' },
                            { name: 'Inspection Date', example: '2026-09-15' },
                            { name: 'Audit Status', example: 'Approved' },
                            { name: 'Certified OK', example: 'TRUE' },
                          ], 'xlsx');
                        }}
                        className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-left shadow-2xs group cursor-pointer"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600">
                            Fleet Inspection Sheet
                          </div>
                          <div className="text-[10px] text-slate-400">7 Column types (.xlsx)</div>
                        </div>
                        <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadBlankTemplate('Catch_Yield_Log', [
                            { name: 'Log Number', example: 'LOG-441' },
                            { name: 'Harvest Zone', example: 'Outer Sector B' },
                            { name: 'Species', example: 'Halibut' },
                            { name: 'Total Pounds', example: '8500' },
                            { name: 'Price Per Lb', example: '12.50' },
                            { name: 'Log Date', example: '2026-09-08' },
                            { name: 'Cleared by Port', example: 'Pending' },
                          ], 'xlsx');
                        }}
                        className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-left shadow-2xs group cursor-pointer"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600">
                            Offshore Catch Log
                          </div>
                          <div className="text-[10px] text-slate-400">7 Column types (.xlsx)</div>
                        </div>
                        <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadBlankTemplate('Crew_Assignments', [
                            { name: 'Crew Member Name', example: 'John Doe' },
                            { name: 'Role Title', example: 'First Mate' },
                            { name: 'Contact Email', example: 'john@example.com' },
                            { name: 'Shift Date', example: '2026-09-10' },
                            { name: 'Medical Clearance', example: 'TRUE' },
                            { name: 'Daily Rate', example: '450' },
                          ], 'csv');
                        }}
                        className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-left shadow-2xs group cursor-pointer"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600">
                            Crew Roster Template
                          </div>
                          <div className="text-[10px] text-slate-400">6 Column types (.csv)</div>
                        </div>
                        <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {importTab === 'paste' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Paste Spreadsheet Cells (Ctrl+V / Cmd+V)
                      </label>
                      <span className="text-[11px] text-slate-500">
                        Select cells or headers in Excel/Google Sheets, copy, and paste here
                      </span>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={pasteTableName}
                        onChange={(e) => setPasteTableName(e.target.value)}
                        placeholder="Database Table Name (e.g. Equipment Log)"
                        className="w-full mb-2 px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>

                    <textarea
                      rows={8}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder={`Example header row:\nItem Name\tCategory\tSerial Number\tCost\tStatus\tPurchase Date\n\nOr paste your copied table cells directly...`}
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                    />

                    <button
                      onClick={handleProcessPastedText}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Analyze Pasted Data</span>
                    </button>
                  </div>
                </div>
              )}

              {importTab === 'manual' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Enter Desired Column Names
                    </label>
                    <p className="text-xs text-slate-500">
                      Type or paste your column names separated by commas or new lines. We will auto-detect the types for you!
                    </p>

                    <div>
                      <input
                        type="text"
                        value={manualTableName}
                        onChange={(e) => setManualTableName(e.target.value)}
                        placeholder="Database Table Name (e.g. Vessel Maintenance)"
                        className="w-full mb-2 px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>

                    <textarea
                      rows={6}
                      value={manualText}
                      onChange={(e) => setManualText(e.target.value)}
                      placeholder="e.g. Equipment Name, Serial Number, Department, Cost, Maintenance Date, Status, Certified Safe"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                    />

                    <button
                      onClick={handleProcessManualColumns}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Configure Database Columns</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Schema Review & Configuration Screen */
            <div className="space-y-6">
              {/* File summary badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-900">Successfully Analyzed: </span>
                    <span className="text-xs font-medium text-slate-700">{parsedData.fileName}</span>
                    <span className="text-xs text-slate-500 ml-2">
                      ({parsedData.headers.length} columns detected, {parsedData.totalRows} row{parsedData.totalRows === 1 ? '' : 's'})
                    </span>
                  </div>
                </div>
                <button
                  onClick={resetModal}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
                >
                  Start over with another file
                </button>
              </div>

              {/* Table Name & Description Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Database Table Name *
                  </label>
                  <input
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="e.g. Vessel Maintenance Log"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Description / Purpose
                  </label>
                  <input
                    type="text"
                    value={tableDesc}
                    onChange={(e) => setTableDesc(e.target.value)}
                    placeholder="Brief description of data collected"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
                  />
                </div>
              </div>

              {/* Columns Table Configurator */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Columns & Field Types ({configuredFields.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Verify or change column data types. Each row in your spreadsheet becomes a structured database field.
                    </p>
                  </div>
                  <button
                    onClick={handleAddField}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Column
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3 w-8 text-center">#</th>
                        <th className="py-2.5 px-3">Column Name</th>
                        <th className="py-2.5 px-3">Data Type</th>
                        <th className="py-2.5 px-3">Sample Value</th>
                        <th className="py-2.5 px-3 w-16 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {configuredFields.map((field, idx) => {
                        const sampleVal = parsedData.sampleRows[0]?.[idx];
                        const displaySample = sampleVal !== undefined && sampleVal !== ''
                          ? String(sampleVal)
                          : '(Blank column header)';

                        return (
                          <tr key={field.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3 text-center text-slate-400 font-medium">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={field.name}
                                onChange={(e) => handleUpdateField(idx, { name: e.target.value })}
                                className="w-full px-2.5 py-1.5 text-xs font-medium rounded border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-white"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <select
                                value={field.type}
                                onChange={(e) => handleUpdateField(idx, { type: e.target.value as FieldType })}
                                className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-white font-medium text-slate-700 cursor-pointer"
                              >
                                {FIELD_TYPES.map((t) => (
                                  <option key={t.type} value={t.type}>
                                    {t.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 truncate max-w-xs font-mono text-[11px]">
                              {displaySample}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                onClick={() => handleRemoveField(idx)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Remove column"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sample Data Import Checkbox */}
              {parsedData.sampleRows.length > 0 && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    id="import-sample-rows"
                    checked={importRows}
                    onChange={(e) => setImportRows(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                  />
                  <label htmlFor="import-sample-rows" className="text-xs text-slate-700 cursor-pointer">
                    <span className="font-semibold text-slate-900">Import existing {parsedData.sampleRows.length} data row{parsedData.sampleRows.length === 1 ? '' : 's'}</span>
                    <span className="block text-slate-500 text-[11px]">
                      Uncheck if you only want the schema structure without the initial example rows.
                    </span>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              resetModal();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {parsedData && (
            <button
              onClick={handleBuildDatabase}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>Create Database Table ({configuredFields.length} Columns)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
