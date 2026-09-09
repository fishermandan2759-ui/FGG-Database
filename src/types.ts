export type UserRole = 'admin' | 'supervisor' | 'manager' | 'editor' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedBureauId?: string; // 'tbl_special_crimes' | 'tbl_general_crimes' | 'tbl_homicide_section' | 'all'
  avatarColor: string;
  department?: string;
  badgeNumber?: string;
  lastActive?: string;
}

export type FieldType = 
  | 'text' 
  | 'number' 
  | 'currency' 
  | 'date' 
  | 'select' 
  | 'status' 
  | 'checkbox' 
  | 'email' 
  | 'url' 
  | 'longtext';

export interface SelectOption {
  id: string;
  label: string;
  color?: string; // Tailwind color name like 'blue', 'green', 'amber', etc.
}

export interface FieldDefinition {
  id: string;
  name: string;
  type: FieldType;
  required?: boolean;
  options?: SelectOption[]; // For 'select' and 'status'
  currencySymbol?: string; // e.g. '$'
  description?: string;
}

export interface TableSchema {
  id: string;
  name: string;
  description: string;
  icon?: string;
  fields: FieldDefinition[];
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseRecord {
  id: string;
  tableId: string;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // user name or id
}

export interface FilterCondition {
  id: string;
  fieldId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: any;
}

export interface ReportConfig {
  id: string;
  name: string;
  tableId: string;
  selectedFieldIds: string[];
  filters: FilterCondition[];
  sortFieldId?: string;
  sortOrder?: 'asc' | 'desc';
  aggregations: {
    fieldId: string;
    type: 'sum' | 'avg' | 'count' | 'min' | 'max';
  }[];
  createdAt: string;
}

export interface RolePermissions {
  canCreateTables: boolean;
  canEditSchema: boolean;
  canDeleteTables: boolean;
  canAddRecords: boolean;
  canEditRecords: boolean;
  canDeleteRecords: boolean;
  canExportReports: boolean;
  canManageUsers: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canCreateTables: true,
    canEditSchema: true,
    canDeleteTables: true,
    canAddRecords: true,
    canEditRecords: true,
    canDeleteRecords: true,
    canExportReports: true,
    canManageUsers: true,
  },
  supervisor: {
    canCreateTables: true,
    canEditSchema: false,
    canDeleteTables: false,
    canAddRecords: true,
    canEditRecords: true,
    canDeleteRecords: true,
    canExportReports: true,
    canManageUsers: false,
  },
  manager: {
    canCreateTables: true,
    canEditSchema: false,
    canDeleteTables: false,
    canAddRecords: true,
    canEditRecords: true,
    canDeleteRecords: true,
    canExportReports: true,
    canManageUsers: false,
  },
  editor: {
    canCreateTables: false,
    canEditSchema: false,
    canDeleteTables: false,
    canAddRecords: true,
    canEditRecords: true,
    canDeleteRecords: false,
    canExportReports: false,
    canManageUsers: false,
  },
  viewer: {
    canCreateTables: false,
    canEditSchema: false,
    canDeleteTables: false,
    canAddRecords: false,
    canEditRecords: false,
    canDeleteRecords: false,
    canExportReports: false,
    canManageUsers: false,
  },
};
