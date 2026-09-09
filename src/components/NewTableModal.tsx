import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Database, 
  ArrowRight,
  Type,
  Hash,
  DollarSign,
  Calendar,
  List,
  CheckSquare,
  FileText
} from 'lucide-react';
import { TableSchema, FieldDefinition, FieldType, User } from '../types';
import { generateFieldId } from '../utils/spreadsheet';

interface NewTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTable: (newTable: TableSchema) => void;
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
  { type: 'longtext', label: 'Long Notes / Text' },
];

export const NewTableModal: React.FC<NewTableModalProps> = ({
  isOpen,
  onClose,
  onCreateTable,
  currentUser,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<FieldDefinition[]>([
    { id: generateFieldId('name'), name: 'Item / Record Name', type: 'text', required: true },
    { id: generateFieldId('status'), name: 'Status', type: 'status', options: [
      { id: '1', label: 'Active', color: 'emerald' },
      { id: '2', label: 'Pending', color: 'amber' },
      { id: '3', label: 'Completed', color: 'blue' },
    ]},
    { id: generateFieldId('cost'), name: 'Value / Amount', type: 'currency', currencySymbol: '$' },
    { id: generateFieldId('date'), name: 'Recorded Date', type: 'date' },
  ]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddField = () => {
    const newField: FieldDefinition = {
      id: generateFieldId('col'),
      name: `Column ${fields.length + 1}`,
      type: 'text',
    };
    setFields([...fields, newField]);
  };

  const handleUpdateField = (index: number, updates: Partial<FieldDefinition>) => {
    setFields(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  const handleRemoveField = (index: number) => {
    if (fields.length <= 1) {
      setError('A database table must have at least one column.');
      return;
    }
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Table name is required.');
      return;
    }
    if (fields.length === 0) {
      setError('At least one column is required.');
      return;
    }

    const newTable: TableSchema = {
      id: `tbl_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      fields,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onCreateTable(newTable);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Create New Database Table</h2>
              <p className="text-xs text-slate-500">
                Design a custom database table with structured rows and columns.
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

        <form id="new-table-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Database Table Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fuel Consumption Log"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Description / Notes
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Operational purpose of this table"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Columns & Field Types ({fields.length})
              </label>
              <button
                type="button"
                onClick={handleAddField}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Column
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2 px-3 w-8 text-center">#</th>
                    <th className="py-2 px-3">Column Name</th>
                    <th className="py-2 px-3">Data Type</th>
                    <th className="py-2 px-3 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fields.map((field, idx) => (
                    <tr key={field.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 text-center text-slate-400 text-[10px]">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          required
                          value={field.name}
                          onChange={(e) => handleUpdateField(idx, { name: e.target.value })}
                          className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 focus:border-indigo-500 outline-hidden bg-white"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <select
                          value={field.type}
                          onChange={(e) => handleUpdateField(idx, { type: e.target.value as FieldType })}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white text-slate-700 outline-hidden font-medium cursor-pointer"
                        >
                          {FIELD_TYPES.map((t) => (
                            <option key={t.type} value={t.type}>{t.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveField(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="new-table-form"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Create Table</span>
          </button>
        </div>
      </div>
    </div>
  );
};
