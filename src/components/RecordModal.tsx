import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Hash, 
  Type, 
  List, 
  CheckSquare, 
  FileText, 
  Mail, 
  Link,
  Clock,
  User as UserIcon,
  Lock,
  Building2,
  Shield,
  FileSearch
} from 'lucide-react';
import { TableSchema, DatabaseRecord, User, ROLE_PERMISSIONS } from '../types';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: TableSchema;
  record: DatabaseRecord | null; // null for new record
  onSaveRecord: (recordData: Record<string, any>, recordId?: string, targetTableId?: string) => void;
  onDeleteRecord?: (recordId: string) => void;
  currentUser: User;
}

const BUREAU_OPTIONS = [
  { id: 'tbl_special_crimes', label: 'Special Crimes Bureau', icon: Shield },
  { id: 'tbl_general_crimes', label: 'General Crimes Bureau', icon: Building2 },
  { id: 'tbl_homicide_section', label: 'Homicide Section', icon: FileSearch },
];

export const RecordModal: React.FC<RecordModalProps> = ({
  isOpen,
  onClose,
  table,
  record,
  onSaveRecord,
  onDeleteRecord,
  currentUser,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedBureauId, setSelectedBureauId] = useState<string>('tbl_special_crimes');

  const permissions = ROLE_PERMISSIONS[currentUser.role];
  const isEditing = !!record;
  const isReadOnly = isEditing ? !permissions.canEditRecords : !permissions.canAddRecords;
  const isMultiBureauView = table.id === 'all';

  useEffect(() => {
    if (record) {
      setFormData({ ...record.data });
      setSelectedBureauId(record.tableId || 'tbl_special_crimes');
    } else {
      // Default initial form data
      const initial: Record<string, any> = {};
      table.fields.forEach((field) => {
        if (field.type === 'checkbox') initial[field.id] = false;
        else if (field.type === 'date') initial[field.id] = new Date().toISOString().slice(0, 10);
        else if (field.type === 'status' && field.options && field.options.length > 0) {
          initial[field.id] = field.options[0].label;
        } else if (field.type === 'select' && field.options && field.options.length > 0) {
          initial[field.id] = field.options[0].label;
        } else {
          initial[field.id] = '';
        }
      });
      setFormData(initial);
      setSelectedBureauId(
        currentUser.assignedBureauId && currentUser.assignedBureauId !== 'all' 
          ? currentUser.assignedBureauId 
          : 'tbl_special_crimes'
      );
    }
  }, [record, table, isOpen, currentUser]);

  if (!isOpen) return null;

  const handleChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    const finalTableId = isMultiBureauView ? selectedBureauId : table.id;
    onSaveRecord(formData, record?.id, finalTableId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                {isEditing ? `Record Details (${table.name})` : `New Record in ${table.name}`}
              </h2>
              {isReadOnly && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  <Lock className="w-3 h-3 text-slate-500" /> Read-Only
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {isEditing
                ? `ID: ${record.id} • Created by ${record.createdBy || 'User'}`
                : 'Fill out the fields to add a new structured entry into the database.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="record-entry-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Bureau Selection for Multi-Bureau View */}
          {isMultiBureauView && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Assigned Bureau Database *</span>
              </label>
              <select
                disabled={isReadOnly}
                value={selectedBureauId}
                onChange={(e) => setSelectedBureauId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden cursor-pointer"
              >
                {BUREAU_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500">
                Specify which bureau repository will store this casework record.
              </p>
            </div>
          )}

          {table.fields.map((field) => {
            const val = formData[field.id] ?? '';

            return (
              <div key={field.id} className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {field.name}
                    {field.required && <span className="text-rose-500">*</span>}
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal uppercase">
                    {field.type}
                  </span>
                </label>

                {/* Input components based on field type */}
                {field.type === 'longtext' ? (
                  <textarea
                    rows={3}
                    disabled={isReadOnly}
                    value={val}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={`Enter ${field.name.toLowerCase()}...`}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden disabled:bg-slate-50 disabled:text-slate-500"
                  />
                ) : field.type === 'select' || field.type === 'status' ? (
                  <select
                    disabled={isReadOnly}
                    value={val}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden disabled:bg-slate-50 disabled:text-slate-500 font-medium cursor-pointer"
                  >
                    <option value="">-- Select Option --</option>
                    {field.options?.map((opt) => (
                      <option key={opt.id} value={opt.label}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'checkbox' ? (
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="checkbox"
                      id={`field_${field.id}`}
                      disabled={isReadOnly}
                      checked={Boolean(val)}
                      onChange={(e) => handleChange(field.id, e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 disabled:opacity-60 cursor-pointer"
                    />
                    <label htmlFor={`field_${field.id}`} className="text-xs text-slate-700 cursor-pointer">
                      {val ? 'Yes (Confirmed)' : 'No (Unchecked)'}
                    </label>
                  </div>
                ) : field.type === 'currency' ? (
                  <div className="relative rounded-lg shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-semibold">
                      {field.currencySymbol || '$'}
                    </div>
                    <input
                      type="number"
                      step="any"
                      disabled={isReadOnly}
                      value={val}
                      onChange={(e) => handleChange(field.id, e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                ) : field.type === 'number' ? (
                  <input
                    type="number"
                    step="any"
                    disabled={isReadOnly}
                    value={val}
                    onChange={(e) => handleChange(field.id, e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden disabled:bg-slate-50 disabled:text-slate-500"
                  />
                ) : field.type === 'date' ? (
                  <input
                    type="date"
                    disabled={isReadOnly}
                    value={val}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden disabled:bg-slate-50 disabled:text-slate-500 cursor-pointer"
                  />
                ) : field.type === 'email' ? (
                  <input
                    type="email"
                    disabled={isReadOnly}
                    value={val}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden disabled:bg-slate-50 disabled:text-slate-500"
                  />
                ) : (
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={val}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={`Enter ${field.name.toLowerCase()}...`}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden disabled:bg-slate-50 disabled:text-slate-500"
                  />
                )}
              </div>
            );
          })}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            {isEditing && onDeleteRecord && permissions.canDeleteRecords && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to permanently delete this record?')) {
                    onDeleteRecord(record.id);
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {!isReadOnly && (
              <button
                type="submit"
                form="record-entry-form"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Save Changes' : 'Create Record'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
