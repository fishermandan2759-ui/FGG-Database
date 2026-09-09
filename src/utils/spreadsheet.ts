import * as XLSX from 'xlsx';
import { FieldDefinition, FieldType, SelectOption } from '../types';

export interface ParsedSpreadsheet {
  fileName: string;
  sheetName: string;
  headers: string[];
  sampleRows: any[][];
  totalRows: number;
  inferredFields: FieldDefinition[];
}

// Helper to sanitize header strings into field keys
export function sanitizeFieldName(header: string, index: number): string {
  if (!header || typeof header !== 'string' || header.trim() === '') {
    return `Column_${index + 1}`;
  }
  return header.trim();
}

// Generate field ID from name
export function generateFieldId(name: string): string {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/^_+|_+$/g, '');
  return clean ? `${clean}_${Math.random().toString(36).substring(2, 6)}` : `field_${Math.random().toString(36).substring(2, 6)}`;
}

// Intelligently infer field type from header name and sample values
export function inferFieldType(header: string, sampleValues: any[]): { type: FieldType; options?: SelectOption[] } {
  const lowerHeader = header.toLowerCase().trim();

  // Header keyword detection
  if (lowerHeader.includes('date') || lowerHeader.includes('deadline') || lowerHeader.includes('due') || lowerHeader.includes('dob') || lowerHeader.includes('created')) {
    return { type: 'date' };
  }
  if (lowerHeader.includes('price') || lowerHeader.includes('cost') || lowerHeader.includes('amount') || lowerHeader.includes('total') || lowerHeader.includes('salary') || lowerHeader.includes('revenue') || lowerHeader.includes('budget') || lowerHeader.includes('fee')) {
    return { type: 'currency' };
  }
  if (lowerHeader.includes('email') || lowerHeader.includes('e-mail')) {
    return { type: 'email' };
  }
  if (lowerHeader.includes('status') || lowerHeader.includes('state') || lowerHeader.includes('stage') || lowerHeader.includes('progress')) {
    const rawOptions = Array.from(new Set(sampleValues.filter(v => v !== null && v !== undefined && String(v).trim() !== '').map(v => String(v).trim())));
    const defaultStatusOptions = rawOptions.length > 0 ? rawOptions : ['Active', 'Pending', 'Completed', 'Archived'];
    const colors = ['emerald', 'amber', 'blue', 'purple', 'slate', 'rose'];
    return {
      type: 'status',
      options: defaultStatusOptions.slice(0, 8).map((label, idx) => ({
        id: `opt_${idx}`,
        label,
        color: colors[idx % colors.length]
      }))
    };
  }
  if (lowerHeader.includes('type') || lowerHeader.includes('category') || lowerHeader.includes('department') || lowerHeader.includes('priority')) {
    const rawOptions = Array.from(new Set(sampleValues.filter(v => v !== null && v !== undefined && String(v).trim() !== '').map(v => String(v).trim())));
    const defaultOptions = rawOptions.length > 0 ? rawOptions : ['Option A', 'Option B', 'Option C'];
    return {
      type: 'select',
      options: defaultOptions.slice(0, 10).map((label, idx) => ({
        id: `opt_${idx}`,
        label,
      }))
    };
  }
  if (lowerHeader.includes('is_') || lowerHeader.includes('has_') || lowerHeader.includes('active') || lowerHeader.includes('flag') || lowerHeader.includes('confirmed')) {
    return { type: 'checkbox' };
  }
  if (lowerHeader.includes('notes') || lowerHeader.includes('description') || lowerHeader.includes('comments') || lowerHeader.includes('bio') || lowerHeader.includes('summary')) {
    return { type: 'longtext' };
  }
  if (lowerHeader.includes('url') || lowerHeader.includes('link') || lowerHeader.includes('website')) {
    return { type: 'url' };
  }

  // Examine sample values if available
  const nonNullValues = sampleValues.filter(v => v !== null && v !== undefined && String(v).trim() !== '');
  if (nonNullValues.length > 0) {
    // Check if numeric
    const isAllNumeric = nonNullValues.every(v => {
      if (typeof v === 'number') return true;
      const str = String(v).replace(/[$,]/g, '').trim();
      return !isNaN(Number(str)) && str !== '';
    });
    if (isAllNumeric) {
      // If header or values look like money
      const hasCurrencyChar = nonNullValues.some(v => String(v).includes('$') || String(v).includes('€') || String(v).includes('£'));
      if (hasCurrencyChar) return { type: 'currency' };
      return { type: 'number' };
    }

    // Check if boolean
    const isAllBoolean = nonNullValues.every(v => {
      const s = String(v).toLowerCase();
      return s === 'true' || s === 'false' || s === 'yes' || s === 'no' || s === '1' || s === '0';
    });
    if (isAllBoolean) return { type: 'checkbox' };

    // Check if date
    const isAllDate = nonNullValues.every(v => {
      if (v instanceof Date) return true;
      const parsed = Date.parse(String(v));
      return !isNaN(parsed) && String(v).length >= 6;
    });
    if (isAllDate) return { type: 'date' };

    // Check if few repeating discrete values -> select
    const uniqueValues = Array.from(new Set(nonNullValues.map(v => String(v).trim())));
    if (uniqueValues.length > 1 && uniqueValues.length <= 6 && nonNullValues.length >= 3) {
      return {
        type: 'select',
        options: uniqueValues.map((label, idx) => ({ id: `opt_${idx}`, label }))
      };
    }
  }

  return { type: 'text' };
}

// Parse file (CSV, XLSX, XLS, TSV) into structured data
export async function parseSpreadsheetFile(file: File): Promise<ParsedSpreadsheet> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        if (!buffer) {
          throw new Error('Could not read file content');
        }

        // Use Uint8Array with type 'array' for robust modern XLSX/XLS handling
        const data = new Uint8Array(buffer as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error('The workbook contains no sheets.');
        }

        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to Array of Arrays
        const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (!rawRows || rawRows.length === 0) {
          throw new Error('Spreadsheet appears to be completely empty. Please ensure it has a header row.');
        }

        // Header row
        const headerRow = rawRows[0] || [];
        const headers = headerRow
          .map((col, idx) => sanitizeFieldName(String(col), idx))
          .filter(h => h.trim() !== '');

        if (headers.length === 0) {
          throw new Error('No valid column headers detected in the first row.');
        }

        // Data rows (might be empty if it's a blank template)
        const dataRows = rawRows.slice(1).filter(row => row && row.some(cell => cell !== '' && cell !== null && cell !== undefined));

        // Infer fields
        const inferredFields: FieldDefinition[] = headers.map((header, colIdx) => {
          const sampleValues = dataRows.slice(0, 15).map(r => r[colIdx]);
          const { type, options } = inferFieldType(header, sampleValues);
          return {
            id: generateFieldId(header),
            name: header,
            type,
            options,
            currencySymbol: type === 'currency' ? '$' : undefined,
          };
        });

        resolve({
          fileName: file.name,
          sheetName: firstSheetName,
          headers,
          sampleRows: dataRows.slice(0, 5),
          totalRows: dataRows.length,
          inferredFields,
        });
      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file from disk'));
    reader.readAsArrayBuffer(file);
  });
}

// Parse pasted tabular text (e.g. copied directly from Excel, Google Sheets, CSV, or TSV)
export function parsePastedSpreadsheetText(rawText: string, tableName: string = 'Imported Spreadsheet'): ParsedSpreadsheet {
  if (!rawText || !rawText.trim()) {
    throw new Error('Pasted content is empty.');
  }

  // Parse using XLSX string reader (handles tab-delimited and comma-delimited automatically)
  const workbook = XLSX.read(rawText.trim(), { type: 'string' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('No readable tabular rows found in pasted text.');
  }

  const headerRow = rawRows[0] || [];
  const headers = headerRow
    .map((col, idx) => sanitizeFieldName(String(col), idx))
    .filter(h => h.trim() !== '');

  if (headers.length === 0) {
    throw new Error('No valid headers detected. Ensure the first line contains your column names.');
  }

  const dataRows = rawRows.slice(1).filter(row => row && row.some(cell => cell !== '' && cell !== null && cell !== undefined));

  const inferredFields: FieldDefinition[] = headers.map((header, colIdx) => {
    const sampleValues = dataRows.slice(0, 15).map(r => r[colIdx]);
    const { type, options } = inferFieldType(header, sampleValues);
    return {
      id: generateFieldId(header),
      name: header,
      type,
      options,
      currencySymbol: type === 'currency' ? '$' : undefined,
    };
  });

  return {
    fileName: `${tableName}.xlsx`,
    sheetName: 'Sheet1',
    headers,
    sampleRows: dataRows.slice(0, 5),
    totalRows: dataRows.length,
    inferredFields,
  };
}

// Generate and trigger download of a Blank Spreadsheet Template
export function downloadBlankTemplate(templateName: string, columns: { name: string; example: string }[], format: 'xlsx' | 'csv' = 'xlsx') {
  const headers = columns.map(c => c.name);
  const exampleRow = columns.map(c => c.example);

  // 1 header row + 1 sample demonstration row
  const data = [headers, exampleRow];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');

  const filename = `${templateName.toLowerCase().replace(/\s+/g, '_')}_blank_template.${format}`;
  XLSX.writeFile(wb, filename);
}

// Export custom records to CSV or XLSX
export function exportTableData(
  records: any[],
  fields: FieldDefinition[],
  fileName: string,
  format: 'xlsx' | 'csv'
) {
  // Build headers & row objects
  const exportRows = records.map(record => {
    const rowObj: Record<string, any> = {};
    fields.forEach(field => {
      let val = record.data?.[field.id];
      if (val === undefined || val === null) {
        rowObj[field.name] = '';
      } else if (field.type === 'currency' && typeof val === 'number') {
        rowObj[field.name] = `${field.currencySymbol || '$'}${val.toFixed(2)}`;
      } else if (field.type === 'checkbox') {
        rowObj[field.name] = val ? 'Yes' : 'No';
      } else {
        rowObj[field.name] = val;
      }
    });
    return rowObj;
  });

  const ws = XLSX.utils.json_to_sheet(exportRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Exported Data');

  const fullFileName = `${fileName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.${format}`;
  XLSX.writeFile(wb, fullFileName);
}
