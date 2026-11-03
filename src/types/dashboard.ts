/**
 * @file types/dashboard.ts
 * @description التوصيفات القياسية (TypeScript Interfaces) لنظام لوحة تحكم المكتب الفني - EEC
 */

export type TabId =
  | 'dashboard'
  | 'projects'
  | 'drawings'
  | 'boq'
  | 'tenders'
  | 'invoices'
  | 'variation_orders'
  | 'approvals'
  | 'contracts'
  | 'correspondence'
  | 'documents'
  | 'reports'
  | 'settings';

export type DisciplineType = 'إنشائي' | 'معماري' | 'كهرباء' | 'ميكانيكا' | 'تشطيبات';

export type ApprovalStatus = 'معتمد' | 'قيد المراجعة' | 'مرفوض';

export type ProjectStatus = 'قيد التنفيذ' | 'منجز' | 'متأخر';

export interface ProjectItem {
  id: string;
  name: string;
  code: string;
  owner: string;
  discipline: DisciplineType;
  year: string;
  valueMillion: number;
  disbursedMillion: number;
  completionRate: number;
  status: ProjectStatus;
  drawingsCount: number;
  boqCount: number;
  invoicesCount: number;
  voCount: number;
  approvalsCount: number;
}

export interface TechnicalApproval {
  id: string;
  type: string;
  project: string;
  date: string;
  status: ApprovalStatus;
  discipline: DisciplineType;
  referenceCode: string;
}

export interface DrawingCategorySummary {
  id: string;
  title: string;
  codeRange: string;
  count: number;
  discipline: DisciplineType;
}

export interface DrawingItem {
  id: string;
  code: string;
  title: string;
  project: string;
  discipline: DisciplineType;
  revision: string;
  issueDate: string;
  status: ApprovalStatus;
}

export interface CurrentTaskItem {
  id: number;
  taskName: string;
  project: string;
  progress: number;
  discipline: DisciplineType;
  dueDate: string;
}

export interface VariationOrderItem {
  id: string;
  code: string;
  title: string;
  project: string;
  valueMillion: number;
  date: string;
  status: ApprovalStatus;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  project: string;
  amountMillion: number;
  submissionDate: string;
  status: ApprovalStatus;
}

export interface TenderEstimateItem {
  id: string;
  code: string;
  title: string;
  project: string;
  estimatedMillion: number;
  itemsCount: number;
  status: ApprovalStatus;
}

export interface DisciplineWorkShare {
  discipline: DisciplineType;
  percentage: number;
  color: string;
  plannedProgress: number;
  actualProgress: number;
}

export interface MonthlyDrawingStat {
  month: string;
  count: number;
}

export interface DashboardFilters {
  year: string;
  project: string;
  owner: string;
  discipline: string;
  status: string;
  searchQuery: string;
}

export type ModalActionType =
  | 'add_project'
  | 'upload_drawing'
  | 'create_estimate'
  | 'issue_invoice'
  | 'register_vo'
  | 'track_approvals'
  | 'technical_report'
  | 'generate_transmittal'
  | null;

export type NotificationCategory = 'drawing_deadline' | 'approval_expiry';

export type NotificationUrgency = 'critical' | 'warning' | 'info';

export interface SystemNotification {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  urgency: NotificationUrgency;
  project: string;
  referenceCode: string;
  dueDate: string;
  remainingDays: number;
  read: boolean;
  dismissed: boolean;
  targetTab: TabId;
  createdAt: string;
}

export type AuditDocumentType = 'رسم هندسي' | 'اعتماد فني';

export type AuditActionKind =
  | 'رفع إصدار جديد'
  | 'تحديث حالة الاعتماد'
  | 'تعديل مراجعة فنية'
  | 'تسجيل اعتماد جديد';

export interface EngineeringAuditEntry {
  id: string;
  documentType: AuditDocumentType;
  documentCode: string;
  documentTitle: string;
  project: string;
  discipline: DisciplineType;
  action: AuditActionKind;
  modifiedBy: string;
  userRole: string;
  modifiedAt: string;
  revisionOrStatus: string;
}

export type TransmittalPurpose =
  | 'للاعتماد والتنفيذ'
  | 'للمراجعة وإبداء الرأي'
  | 'للعلم والإحاطة'
  | 'تسليم نهائي (As-Built)';

export interface TransmittalDrawingSnapshot {
  drawingId: string;
  code: string;
  title: string;
  discipline: DisciplineType;
  revision: string;
  copiesCount: number;
}

export interface TransmittalNote {
  id: string;
  referenceNumber: string;
  project: string;
  recipient: string;
  attention: string;
  issueDate: string;
  purpose: TransmittalPurpose;
  notes: string;
  drawings: TransmittalDrawingSnapshot[];
  issuedBy: string;
  status: 'صادر' | 'مستلم ومعتمد' | 'قيد المراجعة';
}
