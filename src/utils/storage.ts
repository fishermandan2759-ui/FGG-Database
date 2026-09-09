import { TableSchema, DatabaseRecord, User, FieldDefinition } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin',
    name: 'Dan Fisherman',
    email: 'FishermanDan2759@gmail.com',
    role: 'admin',
    assignedBureauId: 'all',
    avatarColor: 'bg-indigo-600',
    department: 'Forensic Genealogy & Administration',
    badgeNumber: 'CCSO-001',
    lastActive: 'Just now',
  },
  {
    id: 'usr_supervisor',
    name: 'Lt. Sarah Jenkins',
    email: 's.jenkins@colliersheriff.org',
    role: 'supervisor',
    assignedBureauId: 'all',
    avatarColor: 'bg-emerald-600',
    department: 'Major Crimes Division / Supervisory',
    badgeNumber: 'CCSO-112',
    lastActive: '15m ago',
  },
  {
    id: 'usr_special_crimes',
    name: 'Det. Thomas Rossi',
    email: 't.rossi@colliersheriff.org',
    role: 'editor',
    assignedBureauId: 'tbl_special_crimes',
    avatarColor: 'bg-purple-600',
    department: 'Special Crimes Bureau',
    badgeNumber: 'CCSO-289',
    lastActive: '30m ago',
  },
  {
    id: 'usr_general_crimes',
    name: 'Det. Andrea Torres',
    email: 'a.torres@colliersheriff.org',
    role: 'editor',
    assignedBureauId: 'tbl_general_crimes',
    avatarColor: 'bg-blue-600',
    department: 'General Crimes Bureau',
    badgeNumber: 'CCSO-341',
    lastActive: '45m ago',
  },
  {
    id: 'usr_homicide',
    name: 'Det. Mike Sterling',
    email: 'm.sterling@colliersheriff.org',
    role: 'editor',
    assignedBureauId: 'tbl_homicide_section',
    avatarColor: 'bg-rose-600',
    department: 'Homicide Section',
    badgeNumber: 'CCSO-177',
    lastActive: '1h ago',
  },
  {
    id: 'usr_analyst',
    name: 'Analyst Elena Rostova',
    email: 'e.rostova@fdle.state.fl.us',
    role: 'viewer',
    assignedBureauId: 'tbl_special_crimes',
    avatarColor: 'bg-slate-600',
    department: 'Special Crimes Bureau / FDLE Liaison',
    badgeNumber: 'FDLE-842',
    lastActive: 'Yesterday',
  },
];

// Standard CODIS Database Template Fields
export const CODIS_TEMPLATE_FIELDS: FieldDefinition[] = [
  { id: 'fld_case_no', name: 'Case Number', type: 'text', required: true, description: 'Primary agency case identifier' },
  { id: 'fld_agency', name: 'Agency / Division', type: 'text', description: 'Submitting law enforcement bureau or agency' },
  { 
    id: 'fld_offense', 
    name: 'Offense / Crime Type', 
    type: 'select',
    options: [
      { id: 'sa', label: 'Sexual Assault' },
      { id: 'hom', label: 'Homicide / Suspicious Death' },
      { id: 'rob', label: 'Armed Robbery / Carjacking' },
      { id: 'burg', label: 'Commercial / Residential Burglary' },
      { id: 'ht', label: 'Human Trafficking' },
      { id: 'kid', label: 'Kidnapping / Stalking' },
      { id: 'uhr', label: 'Unidentified Human Remains (UHR)' },
      { id: 'gt', label: 'Grand Theft / Major Felonies' },
      { id: 'assault', label: 'Aggravated Assault / Battery' },
      { id: 'other', label: 'Other Felony Casework' }
    ] 
  },
  { id: 'fld_specimen_id', name: 'CODIS Specimen ID', type: 'text', required: true, description: 'Unique laboratory specimen barcode/number' },
  {
    id: 'fld_specimen_category',
    name: 'Specimen Category',
    type: 'select',
    options: [
      { id: 'forensic_unk', label: 'Forensic Unknown (Crime Scene)' },
      { id: 'convicted_off', label: 'Convicted Offender Profile' },
      { id: 'arrestee', label: 'Arrestee Known Sample' },
      { id: 'suspect_ref', label: 'Suspect Known Reference' },
      { id: 'uhr_spec', label: 'Unidentified Deceased (UHR)' },
      { id: 'missing_ref', label: 'Missing Person / Kinship Reference' }
    ]
  },
  {
    id: 'fld_codis_level',
    name: 'CODIS Index Level',
    type: 'select',
    options: [
      { id: 'ndis', label: 'NDIS (National DNA Index)' },
      { id: 'sdis', label: 'SDIS (Florida State / FDLE Index)' },
      { id: 'ldis', label: 'LDIS (Collier County Local Index)' },
      { id: 'pending', label: 'Pending Databank Upload' }
    ]
  },
  {
    id: 'fld_codis_status',
    name: 'CODIS Hit / Match Status',
    type: 'status',
    options: [
      { id: 'hit_ndis', label: 'NDIS Confirmed Offender Hit', color: 'emerald' },
      { id: 'hit_sdis', label: 'SDIS State Match Pending', color: 'blue' },
      { id: 'hit_ldis', label: 'LDIS Local Forensic Match', color: 'indigo' },
      { id: 'uploaded', label: 'Profile Uploaded & Active', color: 'sky' },
      { id: 'search', label: 'Search in Progress', color: 'amber' },
      { id: 'nohit', label: 'No Match to Date', color: 'slate' },
      { id: 'confirm_req', label: 'Offender Hit Confirmation Req.', color: 'rose' }
    ]
  },
  { id: 'fld_hit_date', name: 'CODIS Hit Date', type: 'date' },
  {
    id: 'fld_sample_type',
    name: 'Biological Sample Type',
    type: 'select',
    options: [
      { id: 'touch', label: 'Touch DNA' },
      { id: 'blood', label: 'Blood Stain / Swab' },
      { id: 'semen', label: 'Semen / Sexual Assault Swab' },
      { id: 'saliva', label: 'Saliva / Drink Swab' },
      { id: 'bone', label: 'Bone / Skeletal Tissue' },
      { id: 'hair', label: 'Rootless Hair / Follicle' }
    ]
  },
  {
    id: 'fld_str_profile',
    name: 'STR Profile Status',
    type: 'select',
    options: [
      { id: 'core20', label: 'Complete 20 Core CODIS Loci' },
      { id: 'partial', label: 'Partial Profile (12-19 Loci)' },
      { id: 'mixture', label: 'DNA Mixture (2+ Contributors)' },
      { id: 'ystr', label: 'Y-STR Profile' },
      { id: 'snp_wgs', label: 'SNP / Microarray Ready' }
    ]
  },
  { id: 'fld_matched_subject', name: 'Matched Subject / Offender Lead', type: 'text' },
  { id: 'fld_investigator', name: 'Lead Detective / Investigator', type: 'text' },
  { id: 'fld_lab_case_no', name: 'FDLE / Crime Lab Case #', type: 'text' },
  { id: 'fld_upload_date', name: 'Date Uploaded to CODIS', type: 'date' },
  {
    id: 'fld_case_status',
    name: 'Case Status',
    type: 'status',
    options: [
      { id: 'st_active', label: 'Active Investigation', color: 'blue' },
      { id: 'st_warrant', label: 'Arrest Warrant Issued', color: 'amber' },
      { id: 'st_cleared', label: 'Cleared by Arrest', color: 'emerald' },
      { id: 'st_sao', label: 'Referred to State Attorney', color: 'indigo' },
      { id: 'st_cold', label: 'Cold Case Review', color: 'slate' }
    ]
  },
  { id: 'fld_notes', name: 'Investigative Notes / Case Synopsis', type: 'longtext' }
];

export const INITIAL_TABLES: TableSchema[] = [
  {
    id: 'tbl_special_crimes',
    name: 'Special Crimes Bureau',
    description: 'CODIS offender hits, sexual assault forensic evidence (SAK), serial violent offenders, and FGG leads.',
    icon: 'Shield',
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-09-08T12:30:00.000Z',
    fields: CODIS_TEMPLATE_FIELDS,
  },
  {
    id: 'tbl_general_crimes',
    name: 'General Crimes Bureau',
    description: 'Commercial burglaries, armed robberies, touch DNA, auto theft rings, and general felony CODIS casework.',
    icon: 'Briefcase',
    createdAt: '2026-08-05T09:15:00.000Z',
    updatedAt: '2026-09-08T11:00:00.000Z',
    fields: CODIS_TEMPLATE_FIELDS,
  },
  {
    id: 'tbl_homicide_section',
    name: 'Homicide Section',
    description: 'Homicides, suspicious deaths, cold case reviews, unidentified human remains (UHR), and advanced FGG casework.',
    icon: 'FileSearch',
    createdAt: '2026-08-10T10:00:00.000Z',
    updatedAt: '2026-09-08T13:10:00.000Z',
    fields: CODIS_TEMPLATE_FIELDS,
  },
];

export const INITIAL_RECORDS: DatabaseRecord[] = [
  // Special Crimes Bureau Records
  {
    id: 'rec_scb_1',
    tableId: 'tbl_special_crimes',
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-09-02T10:15:00Z',
    createdBy: 'Det. Thomas Rossi',
    data: {
      fld_case_no: '2024-SCB-0842',
      fld_agency: 'CCSO Special Crimes Bureau',
      fld_offense: 'Sexual Assault',
      fld_specimen_id: 'CCSO-SAK-2024-0842-A1',
      fld_specimen_category: 'Forensic Unknown (Crime Scene)',
      fld_codis_level: 'NDIS (National DNA Index)',
      fld_codis_status: 'NDIS Confirmed Offender Hit',
      fld_hit_date: '2026-08-14',
      fld_sample_type: 'Semen / Sexual Assault Swab',
      fld_str_profile: 'Complete 20 Core CODIS Loci',
      fld_matched_subject: 'Marcus Tyler Vance (FL DOC #Y89104)',
      fld_investigator: 'Det. Thomas Rossi #289',
      fld_lab_case_no: 'FDLE-FTM-24-00918',
      fld_upload_date: '2024-04-12',
      fld_case_status: 'Arrest Warrant Issued',
      fld_notes: 'Confirmed 24-loci STR match in NDIS against convicted offender profile registered in Pinellas County. Arrest warrant executed.',
    },
  },
  {
    id: 'rec_scb_2',
    tableId: 'tbl_special_crimes',
    createdAt: '2026-08-03T11:30:00Z',
    updatedAt: '2026-09-05T14:40:00Z',
    createdBy: 'Dan Fisherman',
    data: {
      fld_case_no: '2023-SCB-0419',
      fld_agency: 'CCSO Special Crimes Bureau',
      fld_offense: 'Serial Offense',
      fld_specimen_id: 'CCSO-2023-0419-SP2',
      fld_specimen_category: 'Forensic Unknown (Crime Scene)',
      fld_codis_level: 'SDIS (Florida State / FDLE Index)',
      fld_codis_status: 'SDIS State Match Pending',
      fld_hit_date: '2026-07-28',
      fld_sample_type: 'Saliva / Drink Swab',
      fld_str_profile: 'Partial Profile (12-19 Loci)',
      fld_matched_subject: 'Pending State Lab Re-Analysis',
      fld_investigator: 'Sgt. K. Miller #412',
      fld_lab_case_no: 'FDLE-FTM-23-01452',
      fld_upload_date: '2023-11-08',
      fld_case_status: 'Active Investigation',
      fld_notes: 'State databank candidate match flagged in Broward County. Secondary confirmatory sample requested from regional laboratory.',
    },
  },
  {
    id: 'rec_scb_3',
    tableId: 'tbl_special_crimes',
    createdAt: '2026-08-05T14:00:00Z',
    updatedAt: '2026-09-07T08:20:00Z',
    createdBy: 'Lt. Sarah Jenkins',
    data: {
      fld_case_no: '2025-SCB-0112',
      fld_agency: 'CCSO Special Crimes Bureau',
      fld_offense: 'Human Trafficking',
      fld_specimen_id: 'CCSO-2025-HT-033',
      fld_specimen_category: 'Forensic Unknown (Crime Scene)',
      fld_codis_level: 'NDIS (National DNA Index)',
      fld_codis_status: 'Profile Uploaded & Active',
      fld_hit_date: '',
      fld_sample_type: 'Touch DNA',
      fld_str_profile: 'Complete 20 Core CODIS Loci',
      fld_matched_subject: 'Unknown Male Contributor',
      fld_investigator: 'Det. Thomas Rossi #289',
      fld_lab_case_no: 'FDLE-FTM-25-00304',
      fld_upload_date: '2025-02-19',
      fld_case_status: 'Active Investigation',
      fld_notes: 'High quality Touch DNA recovered from hotel room card reader and telephone handle. Successfully uploaded to NDIS with weekly automatic searches.',
    },
  },

  // General Crimes Bureau Records
  {
    id: 'rec_gcb_1',
    tableId: 'tbl_general_crimes',
    createdAt: '2026-08-05T10:00:00Z',
    updatedAt: '2026-09-04T16:10:00Z',
    createdBy: 'Det. Andrea Torres',
    data: {
      fld_case_no: '2024-GCB-1290',
      fld_agency: 'CCSO General Crimes Bureau',
      fld_offense: 'Armed Robbery / Carjacking',
      fld_specimen_id: 'GCB-DNA-24-1290',
      fld_specimen_category: 'Forensic Unknown (Crime Scene)',
      fld_codis_level: 'NDIS (National DNA Index)',
      fld_codis_status: 'NDIS Confirmed Offender Hit',
      fld_hit_date: '2026-08-20',
      fld_sample_type: 'Touch DNA',
      fld_str_profile: 'Complete 20 Core CODIS Loci',
      fld_matched_subject: 'Derrick Lamont Hayes (Miami-Dade)',
      fld_investigator: 'Det. Andrea Torres #341',
      fld_lab_case_no: 'FDLE-FTM-24-08819',
      fld_upload_date: '2024-06-15',
      fld_case_status: 'Arrest Warrant Issued',
      fld_notes: 'Steering wheel Touch DNA swab matched multi-conviction felon in NDIS. Warrant issued for Armed Robbery and Grand Theft Auto.',
    },
  },
  {
    id: 'rec_gcb_2',
    tableId: 'tbl_general_crimes',
    createdAt: '2026-08-08T13:20:00Z',
    updatedAt: '2026-09-06T11:45:00Z',
    createdBy: 'Det. Andrea Torres',
    data: {
      fld_case_no: '2024-GCB-2041',
      fld_agency: 'CCSO General Crimes Bureau',
      fld_offense: 'Commercial / Residential Burglary',
      fld_specimen_id: 'GCB-DNA-24-2041-B',
      fld_specimen_category: 'Forensic Unknown (Crime Scene)',
      fld_codis_level: 'SDIS (Florida State / FDLE Index)',
      fld_codis_status: 'LDIS Local Forensic Match',
      fld_hit_date: '2026-08-02',
      fld_sample_type: 'Blood Stain / Swab',
      fld_str_profile: 'Complete 20 Core CODIS Loci',
      fld_matched_subject: 'Connected to Lee County Series #14',
      fld_investigator: 'Det. C. Bradley #154',
      fld_lab_case_no: 'FDLE-FTM-24-10243',
      fld_upload_date: '2024-07-22',
      fld_case_status: 'Active Investigation',
      fld_notes: 'Broken window blood droplet matched unresolved commercial break-in in Bonita Springs. Joint task force coordination underway.',
    },
  },
  {
    id: 'rec_gcb_3',
    tableId: 'tbl_general_crimes',
    createdAt: '2026-08-12T09:40:00Z',
    updatedAt: '2026-09-07T13:10:00Z',
    createdBy: 'Lt. Sarah Jenkins',
    data: {
      fld_case_no: '2025-GCB-0318',
      fld_agency: 'CCSO General Crimes Bureau',
      fld_offense: 'Grand Theft / Major Felonies',
      fld_specimen_id: 'GCB-DNA-25-0318-S1',
      fld_specimen_category: 'Forensic Unknown (Crime Scene)',
      fld_codis_level: 'LDIS (Collier County Local Index)',
      fld_codis_status: 'Search in Progress',
      fld_hit_date: '',
      fld_sample_type: 'Touch DNA',
      fld_str_profile: 'Partial Profile (12-19 Loci)',
      fld_matched_subject: 'Awaiting Next Monthly NDIS Run',
      fld_investigator: 'Det. Andrea Torres #341',
      fld_lab_case_no: 'FDLE-FTM-25-01994',
      fld_upload_date: '2025-03-01',
      fld_case_status: 'Active Investigation',
      fld_notes: 'Touch DNA lifted from high-end jewelry showcase pry marks. Profile uploaded to LDIS and scheduled for monthly NDIS upload search.',
    },
  },

  // Homicide Section Records
  {
    id: 'rec_hom_1',
    tableId: 'tbl_homicide_section',
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-09-08T09:30:00Z',
    createdBy: 'Det. Mike Sterling',
    data: {
      fld_case_no: '1988-CCSO-0941',
      fld_agency: 'CCSO Homicide Section',
      fld_offense: 'Unidentified Human Remains (UHR)',
      fld_specimen_id: 'CCSO-UHR-1988-0941',
      fld_specimen_category: 'Unidentified Deceased (UHR)',
      fld_codis_level: 'NDIS (National DNA Index)',
      fld_codis_status: 'No Match to Date',
      fld_hit_date: '',
      fld_sample_type: 'Bone / Skeletal Tissue',
      fld_str_profile: 'SNP / Microarray Ready',
      fld_matched_subject: 'FGG Kinship Lead: "St. Clair Line"',
      fld_investigator: 'Det. Mike Sterling #177',
      fld_lab_case_no: 'FDLE-FTM-88-00441 / OTH-2024-81',
      fld_upload_date: '2004-03-15',
      fld_case_status: 'Active Investigation',
      fld_notes: '1988 Everglades unidentified Jane Doe. STR CODIS upload returned no national hit. Bone extract converted to SNP array at Othram; active 2nd-cousin tree building in progress.',
    },
  },
  {
    id: 'rec_hom_2',
    tableId: 'tbl_homicide_section',
    createdAt: '2026-08-12T14:30:00Z',
    updatedAt: '2026-09-08T12:00:00Z',
    createdBy: 'Dan Fisherman',
    data: {
      fld_case_no: '2001-CCSO-0284',
      fld_agency: 'CCSO Homicide Section',
      fld_offense: 'Homicide / Suspicious Death',
      fld_specimen_id: 'CCSO-HOM-2001-0284-EV1',
      fld_specimen_category: 'Forensic Unknown (Crime Scene)',
      fld_codis_level: 'NDIS (National DNA Index)',
      fld_codis_status: 'NDIS Confirmed Offender Hit',
      fld_hit_date: '2026-08-19',
      fld_sample_type: 'Blood Stain / Swab',
      fld_str_profile: 'Complete 20 Core CODIS Loci',
      fld_matched_subject: 'Gregory Wayne Cole (FDOC #C29410)',
      fld_investigator: 'Det. Mike Sterling #177',
      fld_lab_case_no: 'FDLE-FTM-01-03912',
      fld_upload_date: '2001-06-20',
      fld_case_status: 'Referred to State Attorney',
      fld_notes: '2001 Naples cold case homicide. Fingerprint and blood sample from rear entryway matched felony arrestee sample in NDIS. Direct indictment packet sent to SAO.',
    },
  },
  {
    id: 'rec_hom_3',
    tableId: 'tbl_homicide_section',
    createdAt: '2026-08-15T11:00:00Z',
    updatedAt: '2026-09-07T16:20:00Z',
    createdBy: 'Det. Mike Sterling',
    data: {
      fld_case_no: '2024-CCSO-0711',
      fld_agency: 'CCSO Homicide Section',
      fld_offense: 'Homicide / Suspicious Death',
      fld_specimen_id: 'CCSO-2024-0711-K4',
      fld_specimen_category: 'Forensic Unknown (Crime Scene)',
      fld_codis_level: 'NDIS (National DNA Index)',
      fld_codis_status: 'Profile Uploaded & Active',
      fld_hit_date: '',
      fld_sample_type: 'Touch DNA',
      fld_str_profile: 'Complete 20 Core CODIS Loci',
      fld_matched_subject: 'Unknown Suspect Profile',
      fld_investigator: 'Det. Laura Vance #198',
      fld_lab_case_no: 'FDLE-FTM-24-04183',
      fld_upload_date: '2024-08-12',
      fld_case_status: 'Active Investigation',
      fld_notes: 'Full male STR profile recovered from crime scene weapon ligature. Search in progress across state and national databanks.',
    },
  },
];

const STORAGE_KEYS = {
  TABLES: 'ccso_codis_tables_v3',
  RECORDS: 'ccso_codis_records_v3',
  USERS: 'ccso_codis_users_v3',
  CURRENT_USER_ID: 'ccso_codis_current_user_id_v3',
  SELECTED_BUREAU_ID: 'ccso_selected_bureau_id_v3',
};

// Helper: Check if a user uploaded spreadsheet template exists in any storage key
export function findUploadedTemplateSchema(): FieldDefinition[] | null {
  try {
    const keysToCheck = [
      STORAGE_KEYS.TABLES,
      'ccso_codis_tables_v2',
      'ccso_tables_data',
      'tables',
    ];
    for (const key of keysToCheck) {
      const raw = localStorage.getItem(key);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          const match = list.find((t: any) => 
            t && t.name && (
              /template.*codis|codis.*template/i.test(t.name) ||
              (t.name.toLowerCase().includes('template') && t.name.toLowerCase().includes('codis'))
            )
          );
          if (match && Array.isArray(match.fields) && match.fields.length > 0) {
            return match.fields;
          }
        }
      }
    }
  } catch (e) {
    console.error('Error finding uploaded template schema', e);
  }
  return null;
}

// Synchronize all three bureaus to use the specified template fields while keeping their unique names
export function applyCodisTemplateToBureaus(existingTables: TableSchema[], templateFields?: FieldDefinition[]): TableSchema[] {
  const fieldsToApply = templateFields || findUploadedTemplateSchema() || CODIS_TEMPLATE_FIELDS;
  return existingTables.map(t => {
    if (t.id === 'tbl_special_crimes' || t.id === 'tbl_general_crimes' || t.id === 'tbl_homicide_section') {
      return {
        ...t,
        fields: fieldsToApply,
        updatedAt: new Date().toISOString(),
      };
    }
    return t;
  });
}

export function getStoredTables(): TableSchema[] {
  try {
    const templateFields = findUploadedTemplateSchema() || CODIS_TEMPLATE_FIELDS;

    const raw = localStorage.getItem(STORAGE_KEYS.TABLES);
    if (raw) {
      const parsed: TableSchema[] = JSON.parse(raw);
      const bureauIds = ['tbl_special_crimes', 'tbl_general_crimes', 'tbl_homicide_section'];
      const hasAllBureaus = bureauIds.every(id => parsed.some(t => t.id === id));
      
      if (hasAllBureaus) {
        // Ensure all bureaus have the template fields
        const updated = parsed.map(t => {
          if (bureauIds.includes(t.id)) {
            return {
              ...t,
              fields: templateFields,
            };
          }
          return t;
        });
        return updated;
      }
    }

    // Check v2 storage for any extra custom tables
    const oldRaw = localStorage.getItem('ccso_codis_tables_v2');
    let extraTables: TableSchema[] = [];
    if (oldRaw) {
      try {
        const oldParsed: TableSchema[] = JSON.parse(oldRaw);
        extraTables = oldParsed.filter(t => 
          t.id !== 'tbl_special_crimes' && 
          t.id !== 'tbl_general_crimes' && 
          t.id !== 'tbl_homicide_section'
        );
      } catch {
        // ignore
      }
    }

    // Model all 3 bureaus after the CODIS database template
    const modeledBureaus = INITIAL_TABLES.map(t => ({
      ...t,
      fields: templateFields,
    }));

    return [...modeledBureaus, ...extraTables];
  } catch (e) {
    console.error('Failed reading tables from localStorage', e);
  }
  return INITIAL_TABLES;
}

export function saveStoredTables(tables: TableSchema[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
  } catch (e) {
    console.error('Failed saving tables to localStorage', e);
  }
}

export function getStoredRecords(): DatabaseRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (raw) {
      const parsed: DatabaseRecord[] = JSON.parse(raw);
      const hasBureauRecords = parsed.some(r => 
        r.tableId === 'tbl_special_crimes' || 
        r.tableId === 'tbl_general_crimes' || 
        r.tableId === 'tbl_homicide_section'
      );
      if (hasBureauRecords) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed reading records from localStorage', e);
  }
  return INITIAL_RECORDS;
}

export function saveStoredRecords(records: DatabaseRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed saving records to localStorage', e);
  }
}

export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (raw) {
      const parsed: User[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure Dan Fisherman exists and has assignedBureauId
        const hasDan = parsed.some(u => u.id === 'usr_admin' || u.email === 'FishermanDan2759@gmail.com');
        if (hasDan) {
          return parsed.map(u => {
            // Assign default assignedBureauId if missing
            if (!u.assignedBureauId) {
              if (u.role === 'admin' || u.role === 'supervisor' || (u.role as string) === 'manager') {
                return { ...u, assignedBureauId: 'all' };
              }
              return { ...u, assignedBureauId: 'tbl_special_crimes' };
            }
            return u;
          });
        }
      }
    }
  } catch (e) {
    console.error('Failed reading users from localStorage', e);
  }
  return INITIAL_USERS;
}

export function saveStoredUsers(users: User[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Failed saving users to localStorage', e);
  }
}

export function getStoredCurrentUserId(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (id) return id;
  } catch (e) {
    console.error('Failed reading current user id', e);
  }
  return INITIAL_USERS[0].id;
}

export function saveStoredCurrentUserId(id: string) {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
  } catch (e) {
    console.error('Failed saving current user id', e);
  }
}

export function getStoredSelectedBureau(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_BUREAU_ID) || 'tbl_special_crimes';
  } catch {
    return 'tbl_special_crimes';
  }
}

export function saveStoredSelectedBureau(bureauId: string) {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_BUREAU_ID, bureauId);
  } catch (e) {
    console.error('Failed saving selected bureau', e);
  }
}

export function resetToDemoData() {
  localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(INITIAL_TABLES));
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_RECORDS));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, INITIAL_USERS[0].id);
  localStorage.setItem(STORAGE_KEYS.SELECTED_BUREAU_ID, 'tbl_special_crimes');
}
