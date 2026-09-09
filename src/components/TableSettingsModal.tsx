import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Trash2, 
  Plus, 
  Save, 
  Layers, 
  AlertTriangle,
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
import { TableSchema, FieldDefinition, FieldType, User, ROLE_PERMISSIONS } from '../types';
import { generateFieldId } from '../utils/spreadsheet';

interface TableSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: TableSchema;
  onUpdateTable: (updatedTable: TableSchema) => void;
  onDeleteTable: (tableId: string) => void;
  currentUser: User;
}

const FIELD_TYPES: { type: FieldType; label: string }[] = [
  { type: 'text', label: 'Single Line Text' },
  { type: 'number', label: 'Numeric Value' },
  { type: 'currency', label: 'Currency ($)' },
  { type: 'date', label: 'Calendar Date' },
  { type: 'status', label: 'Status Badge' },
  { type: 'select', label: 'Dropdown Select' },
  { type: 'checkbox', label: 'Yes/No Checkbox' },
  { type: 'longtext', label: 'Long Description / Notes' },
  { type: 'email', label: 'Email Address' },
  { type: 'url', label: 'Web Link' },
];

export const TableSettingsModal: React.FC<TableSettingsModalProps> = ({
  isOpen,
  onClose,
  table,
  onUpdateTable,
  onDeleteTable,
  currentUser,
}) => {
  const permissions = ROLE_PERMISSIONS[currentUser.role];
  const canEditSchema = permissions.canEditSchema;
  const canDeleteTable = permissions.canDeleteTables;

  const [name, setName] = useState(table.name);
  const [description, setDescription] = useState(table.description);
  const [fields, setFields] = useState<FieldDefinition[]>([...table.fields]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpdateField = (index: number, updates: Partial<FieldDefinition>) => {
    if (!canEditSchema) return;
    setFields((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  const handleAddField = () => {
    if (!canEditSchema) return;
    const newField: FieldDefinition = {
      id: generateFieldId('col'),
      name: `Column ${fields.length + 1}`,
      type: 'text',
    };
    setFields([...fields, newField]);
  };

  const handleRemoveField = (index: number) => {
    if (!canEditSchema) return;
    if (fields.length <= 1) {
      setError('A database table must retain at least one column.');
      return;
    }
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError('Table name cannot be empty.');
      return;
    }
    if (fields.length === 0) {
      setError('Table must have at least one column.');
      return;
    }

    onUpdateTable({
      ...table,
      name: name.trim(),
      description: description.trim(),
      fields,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  const handleDelete = () => {
    if (!canDeleteTable) return;
    if (confirm(`Are you certain you want to permanently delete "${table.name}" and all records inside it?`)) {
      onDeleteTable(table.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Database Table Settings & Schema
              </h2>
              <p className="text-xs text-slate-500">
                Configure table metadata, manage columns, and customize schema definitions.
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {!canEditSchema && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-amber-800 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Schema alterations are restricted to <strong>Administrator</strong> role. You can inspect the structure, but cannot modify columns.
              </span>
            </div>
          )}

          {/* Table Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Table Name
              </label>
              <input
                type="text"
                disabled={!canEditSchema}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden disabled:bg-slate-50 disabled:text-slate-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Description / Purpose
              </label>
              <input
                type="text"
                disabled={!canEditSchema}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>

          {/* Column List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Column Definitions ({fields.length})
              </label>
              {canEditSchema && (
                <button
                  onClick={handleAddField}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Column
                </button>
              )}
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 w-8 text-center">#</th>
                    <th className="py-2.5 px-3">Column Label</th>
                    <th className="py-2.5 px-3">Data Type</th>
                    <th className="py-2.5 px-3 w-16 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fields.map((field, idx) => (
                    <tr key={field.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 text-center text-slate-400 text-[10px]">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          disabled={!canEditSchema}
                          value={field.name}
                          onChange={(e) => handleUpdateField(idx, { name: e.target.value })}
                          className="w-full px-2.5 py-1 text-xs font-medium rounded border border-slate-300 focus:border-indigo-500 outline-hidden disabled:bg-transparent disabled:border-transparent"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <select
                          disabled={!canEditSchema}
                          value={field.type}
                          onChange={(e) => handleUpdateField(idx, { type: e.target.value as FieldType })}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white font-medium text-slate-700 focus:border-indigo-500 outline-hidden disabled:bg-transparent disabled:border-transparent cursor-pointer"
                        >
                          {FIELD_TYPES.map((t) => (
                            <option key={t.type} value={t.type}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3 text-center">
                        {canEditSchema && (
                          <button
                            onClick={() => handleRemoveField(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                            title="Delete column"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Danger Zone: Delete Table */}
          {canDeleteTable && (
            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                  Delete Database Table
                </h4>
                <p className="text-[11px] text-rose-700">
                  Permanently deletes this entire table and all its stored records.
                </p>
              </div>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-rose-600 hover:bg-rose-700 shadow-2xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Table</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          {canEditSchema && (
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
