/**
 * @file store/slices/dashboardSlice.ts
 * @description إدارة الحالة المركزية للمكتب الفني باستخدام Redux Toolkit مع دعم التصفية والإضافة الفورية
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ActiveTabState,
  ApprovalStatus,
  CurrentTaskItem,
  DashboardFilters,
  DisciplineWorkShare,
  DrawingCategorySummary,
  DrawingItem,
  EngineeringAuditEntry,
  InvoiceItem,
  ModalActionType,
  MonthlyDrawingStat,
  ProjectItem,
  SystemNotification,
  TabId,
  TechnicalApproval,
  TenderEstimateItem,
  TransmittalNote,
  VariationOrderItem,
} from '../../types/dashboard';

export interface DashboardState {
  activeTab: TabId;
  darkMode: boolean;
  filters: DashboardFilters;
  activeModal: ModalActionType;
  lastSavedAt: string;
  notifications: SystemNotification[];
  activeToastId: string | null;
  auditLogs: EngineeringAuditEntry[];
  transmittalsList: TransmittalNote[];
  selectedDrawingIdsForTransmittal: string[];
  // الإحصائيات الأساسية المطابقة للصورة المرجعية
  baseKpis: {
    totalProjects: number;
    totalDrawings: number;
    totalEstimates: number;
    totalInvoices: number;
    totalVariationOrders: number;
    totalApprovals: number;
    totalValueMillion: number;
    totalDisbursedMillion: number;
    overallCompletion: number;
    completedTasksCount: number;
    inProgressTasksCount: number;
    delayedTasksCount: number;
    totalWorkItems: number;
  };
  voSummary: {
    total: number;
    approved: number;
    underReview: number;
    rejected: number;
  };
  disciplineStats: DisciplineWorkShare[];
  monthlyDrawings: MonthlyDrawingStat[];
  recentApprovals: TechnicalApproval[];
  topDrawings: DrawingCategorySummary[];
  currentTasks: CurrentTaskItem[];
  projects: ProjectItem[];
  drawingsList: DrawingItem[];
  variationOrdersList: VariationOrderItem[];
  invoicesList: InvoiceItem[];
  estimatesList: TenderEstimateItem[];
}

export const initialDashboardState: DashboardState = {
  activeTab: 'dashboard',
  darkMode: false,
  filters: {
    year: '2026',
    project: 'جميع المشروعات',
    owner: 'الكل',
    discipline: 'الكل',
    status: 'الكل',
    searchQuery: '',
  },
  activeModal: null,
  lastSavedAt: '2026-11-03 10:30',
  activeToastId: 'NOTIF-01',
  notifications: [
    {
      id: 'NOTIF-01',
      title: 'اقتراب موعد تسليم لوحة تسليح اللبشة (S-105)',
      description:
        'يتبقى يومان فقط على الموعد التعاقدي لتسليم الرسومات التنفيذية للقطاع الشمالي.',
      category: 'drawing_deadline',
      urgency: 'critical',
      project: 'مشروع ABC',
      referenceCode: 'S-105',
      dueDate: '2026-11-05',
      remainingDays: 2,
      read: false,
      dismissed: false,
      targetTab: 'drawings',
      createdAt: 'منذ 10 دقائق',
    },
    {
      id: 'NOTIF-02',
      title: 'قرب انتهاء صلاحية اعتماد مواد العزل الحراري',
      description:
        'تنتهي صلاحية الاعتماد الفني الحالي خلال 3 أيام ويلزم تجديد شهادة الاختبار المعملية.',
      category: 'approval_expiry',
      urgency: 'critical',
      project: 'مشروع Delta',
      referenceCode: 'SUB-DLT-089',
      dueDate: '2026-11-06',
      remainingDays: 3,
      read: false,
      dismissed: false,
      targetTab: 'approvals',
      createdAt: 'منذ 25 دقيقة',
    },
    {
      id: 'NOTIF-03',
      title: 'موعد تسليم مخططات الواجهات الكيرتن وول (A-118)',
      description:
        'اقترب الموعد المحدد لتسليم الإصدار المعدل Rev.02 للاستشاري العام للمشروع.',
      category: 'drawing_deadline',
      urgency: 'warning',
      project: 'مشروع Delta',
      referenceCode: 'A-118',
      dueDate: '2026-11-08',
      remainingDays: 5,
      read: false,
      dismissed: false,
      targetTab: 'drawings',
      createdAt: 'منذ ساعة',
    },
    {
      id: 'NOTIF-04',
      title: 'انتهاء صلاحية اعتماد عينات الكابلات ولوحات التوزيع',
      description:
        'يلزم تحديث اعتماد المورد المعتمد قبل صرف الدفعة القادمة من المستخلص الجاري.',
      category: 'approval_expiry',
      urgency: 'warning',
      project: 'مشروع Nile',
      referenceCode: 'SUB-NIL-211',
      dueDate: '2026-11-09',
      remainingDays: 6,
      read: false,
      dismissed: false,
      targetTab: 'approvals',
      createdAt: 'منذ ساعتين',
    },
    {
      id: 'NOTIF-05',
      title: 'موعد تسليم رسومات شبكة مكافحة الحريق (M-112)',
      description:
        'مراجعة مطابقة الكود المصري للحريق قبل التسليم النهائي للمالك.',
      category: 'drawing_deadline',
      urgency: 'info',
      project: 'مشروع Capital',
      referenceCode: 'M-112',
      dueDate: '2026-11-11',
      remainingDays: 8,
      read: true,
      dismissed: false,
      targetTab: 'drawings',
      createdAt: 'أمس',
    },
  ],
  auditLogs: [
    {
      id: 'AUD-101',
      documentType: 'رسم هندسي',
      documentCode: 'S-105',
      documentTitle: 'مخطط تسليح لبشة الأساسات الرئيسية - القطاع الشمالي',
      project: 'مشروع ABC',
      discipline: 'إنشائي',
      action: 'رفع إصدار جديد',
      modifiedBy: 'م. حسام أحمد',
      userRole: 'مدير المكتب الفني',
      modifiedAt: '2026-11-02 14:20',
      revisionOrStatus: 'Rev.03 · معتمد',
    },
    {
      id: 'AUD-102',
      documentType: 'اعتماد فني',
      documentCode: 'SUB-DLT-089',
      documentTitle: 'إعتماد تعديل مسارات التكييف (V.O-03)',
      project: 'مشروع Delta',
      discipline: 'معماري',
      action: 'تحديث حالة الاعتماد',
      modifiedBy: 'م. سارة محمود',
      userRole: 'مهندس أول معماري',
      modifiedAt: '2026-11-01 11:45',
      revisionOrStatus: 'قيد المراجعة',
    },
    {
      id: 'AUD-103',
      documentType: 'رسم هندسي',
      documentCode: 'A-118',
      documentTitle: 'تفاصيل الواجهات الكيرتن وول والمداخل الرئيسية',
      project: 'مشروع Delta',
      discipline: 'معماري',
      action: 'تعديل مراجعة فنية',
      modifiedBy: 'م. طارق عبد الرحمن',
      userRole: 'مهندس تصميم معماري',
      modifiedAt: '2026-10-30 16:10',
      revisionOrStatus: 'Rev.02 · قيد المراجعة',
    },
    {
      id: 'AUD-104',
      documentType: 'اعتماد فني',
      documentCode: 'SUB-NIL-211',
      documentTitle: 'إعتماد مواد البديل للوحات التوزيع الفرعية',
      project: 'مشروع Nile',
      discipline: 'كهرباء',
      action: 'تسجيل اعتماد جديد',
      modifiedBy: 'م. كريم عادل',
      userRole: 'رئيس قسم الكهرباء',
      modifiedAt: '2026-10-28 09:30',
      revisionOrStatus: 'معتمد',
    },
    {
      id: 'AUD-105',
      documentType: 'رسم هندسي',
      documentCode: 'M-112',
      documentTitle: 'شبكة مكافحة الحريق والصناديق وتمديدات الطلمبات',
      project: 'مشروع Capital',
      discipline: 'ميكانيكا',
      action: 'رفع إصدار جديد',
      modifiedBy: 'م. نهى الشاذلي',
      userRole: 'مهندس ميكانيكا أول',
      modifiedAt: '2026-10-25 13:15',
      revisionOrStatus: 'Rev.04 · معتمد',
    },
  ],
  baseKpis: {
    totalProjects: 14,
    totalDrawings: 582,
    totalEstimates: 12,
    totalInvoices: 9,
    totalVariationOrders: 6,
    totalApprovals: 24,
    totalValueMillion: 1250.0,
    totalDisbursedMillion: 861.8,
    overallCompletion: 72.6,
    completedTasksCount: 908,
    inProgressTasksCount: 252,
    delayedTasksCount: 90,
    totalWorkItems: 1250,
  },
  voSummary: {
    total: 6,
    approved: 4,
    underReview: 1,
    rejected: 1,
  },
  disciplineStats: [
    {
      discipline: 'إنشائي',
      percentage: 40,
      color: '#7e22ce', // Purple
      actualProgress: 85,
      plannedProgress: 78,
    },
    {
      discipline: 'معماري',
      percentage: 22,
      color: '#2563eb', // Blue
      actualProgress: 80,
      plannedProgress: 72,
    },
    {
      discipline: 'كهرباء',
      percentage: 18,
      color: '#f59e0b', // Amber/Gold
      actualProgress: 75,
      plannedProgress: 68,
    },
    {
      discipline: 'ميكانيكا',
      percentage: 12,
      color: '#16a34a', // Green
      actualProgress: 70,
      plannedProgress: 65,
    },
    {
      discipline: 'تشطيبات',
      percentage: 8,
      color: '#dc2626', // Red
      actualProgress: 60,
      plannedProgress: 55,
    },
  ],
  monthlyDrawings: [
    { month: 'يناير', count: 20 },
    { month: 'فبراير', count: 31 },
    { month: 'مارس', count: 38 },
    { month: 'أبريل', count: 45 },
    { month: 'مايو', count: 48 },
    { month: 'يونيو', count: 52 },
    { month: 'يوليو', count: 65 },
    { month: 'أغسطس', count: 68 },
    { month: 'سبتمبر', count: 78 },
    { month: 'أكتوبر', count: 84 },
    { month: 'نوفمبر', count: 92 },
    { month: 'ديسمبر', count: 108 },
  ],
  recentApprovals: [
    {
      id: 'APP-01',
      type: 'إعتماد رسومات تنفيذية',
      project: 'مشروع ABC',
      date: '2026-11-02',
      status: 'معتمد',
      discipline: 'إنشائي',
      referenceCode: 'SUB-ABC-104',
    },
    {
      id: 'APP-02',
      type: 'إعتماد تعديل (V.O-03)',
      project: 'مشروع Delta',
      date: '2026-10-30',
      status: 'قيد المراجعة',
      discipline: 'معماري',
      referenceCode: 'SUB-DLT-089',
    },
    {
      id: 'APP-03',
      type: 'إعتماد مواد البديل',
      project: 'مشروع Nile',
      date: '2026-10-28',
      status: 'معتمد',
      discipline: 'كهرباء',
      referenceCode: 'SUB-NIL-211',
    },
    {
      id: 'APP-04',
      type: 'إعتماد مخططات التكييف المركزي',
      project: 'مشروع Capital',
      date: '2026-10-24',
      status: 'معتمد',
      discipline: 'ميكانيكا',
      referenceCode: 'SUB-CAP-055',
    },
    {
      id: 'APP-05',
      type: 'إعتماد عينات الواجهات الزجاجية',
      project: 'مشروع Lotus',
      date: '2026-10-19',
      status: 'معتمد',
      discipline: 'تشطيبات',
      referenceCode: 'SUB-LTS-032',
    },
  ],
  topDrawings: [
    {
      id: 'DRW-CAT-1',
      title: 'رسومات إنشائية',
      codeRange: '(S-101 ~ S-160)',
      count: 160,
      discipline: 'إنشائي',
    },
    {
      id: 'DRW-CAT-2',
      title: 'رسومات معمارية',
      codeRange: '(A-101 ~ A-220)',
      count: 120,
      discipline: 'معماري',
    },
    {
      id: 'DRW-CAT-3',
      title: 'رسومات كهرباء',
      codeRange: '(E-101 ~ E-180)',
      count: 180,
      discipline: 'كهرباء',
    },
    {
      id: 'DRW-CAT-4',
      title: 'رسومات ميكانيكا',
      codeRange: '(M-101 ~ M-122)',
      count: 122,
      discipline: 'ميكانيكا',
    },
  ],
  currentTasks: [
    {
      id: 1,
      taskName: 'مراجعة الرسومات التنفيذية',
      project: 'ABC',
      progress: 85,
      discipline: 'إنشائي',
      dueDate: '2026-11-10',
    },
    {
      id: 2,
      taskName: 'إعداد مستخلص رقم (7)',
      project: 'Delta',
      progress: 70,
      discipline: 'معماري',
      dueDate: '2026-11-12',
    },
    {
      id: 3,
      taskName: 'دراسة أمر تغيير (V.O-04)',
      project: 'Nile',
      progress: 40,
      discipline: 'كهرباء',
      dueDate: '2026-11-18',
    },
  ],
  projects: [
    {
      id: 'PRJ-01',
      name: 'مشروع ABC الإداري المتكامل',
      code: 'EEC-2026-ABC',
      owner: 'هيئة المجتمعات العمرانية',
      discipline: 'إنشائي',
      year: '2026',
      valueMillion: 340.0,
      disbursedMillion: 265.5,
      completionRate: 85,
      status: 'قيد التنفيذ',
      drawingsCount: 160,
      boqCount: 4,
      invoicesCount: 3,
      voCount: 2,
      approvalsCount: 8,
    },
    {
      id: 'PRJ-02',
      name: 'مشروع Delta التجاري والطبي',
      code: 'EEC-2026-DLT',
      owner: 'شركة دلتا للتطوير العقاري',
      discipline: 'معماري',
      year: '2026',
      valueMillion: 285.0,
      disbursedMillion: 198.0,
      completionRate: 70,
      status: 'قيد التنفيذ',
      drawingsCount: 142,
      boqCount: 3,
      invoicesCount: 2,
      voCount: 2,
      approvalsCount: 6,
    },
    {
      id: 'PRJ-03',
      name: 'مشروع Nile الأبراج السكنية',
      code: 'EEC-2026-NIL',
      owner: 'المجموعة الوطنية للاستثمار',
      discipline: 'كهرباء',
      year: '2026',
      valueMillion: 260.0,
      disbursedMillion: 152.3,
      completionRate: 58,
      status: 'متأخر',
      drawingsCount: 128,
      boqCount: 2,
      invoicesCount: 2,
      voCount: 1,
      approvalsCount: 5,
    },
    {
      id: 'PRJ-04',
      name: 'مشروع Capital المقر الرئيسي',
      code: 'EEC-2026-CAP',
      owner: 'شركة العاصمة الإدارية',
      discipline: 'ميكانيكا',
      year: '2026',
      valueMillion: 215.0,
      disbursedMillion: 150.0,
      completionRate: 92,
      status: 'منجز',
      drawingsCount: 92,
      boqCount: 2,
      invoicesCount: 1,
      voCount: 1,
      approvalsCount: 3,
    },
    {
      id: 'PRJ-05',
      name: 'مشروع Lotus الفندقي السياحي',
      code: 'EEC-2025-LTS',
      owner: 'مجموعة لوتس للفنادق',
      discipline: 'تشطيبات',
      year: '2025',
      valueMillion: 150.0,
      disbursedMillion: 96.0,
      completionRate: 64,
      status: 'قيد التنفيذ',
      drawingsCount: 60,
      boqCount: 1,
      invoicesCount: 1,
      voCount: 0,
      approvalsCount: 2,
    },
  ],
  drawingsList: [
    {
      id: 'DRW-101',
      code: 'S-105',
      title: 'مخطط تسليح لبشة الأساسات الرئيسية - القطاع الشمالي',
      project: 'مشروع ABC',
      discipline: 'إنشائي',
      revision: 'Rev.03',
      issueDate: '2026-11-01',
      status: 'معتمد',
    },
    {
      id: 'DRW-102',
      code: 'A-118',
      title: 'تفاصيل الواجهات الكيرتن وول والمداخل الرئيسية',
      project: 'مشروع Delta',
      discipline: 'معماري',
      revision: 'Rev.02',
      issueDate: '2026-10-29',
      status: 'قيد المراجعة',
    },
    {
      id: 'DRW-103',
      code: 'E-142',
      title: 'مخطط مسارات الكابلات ولوحات التوزيع الفرعية',
      project: 'مشروع Nile',
      discipline: 'كهرباء',
      revision: 'Rev.01',
      issueDate: '2026-10-25',
      status: 'معتمد',
    },
    {
      id: 'DRW-104',
      code: 'M-112',
      title: 'شبكة مكافحة الحريق والصناديق وتمديدات الطلمبات',
      project: 'مشروع Capital',
      discipline: 'ميكانيكا',
      revision: 'Rev.04',
      issueDate: '2026-10-21',
      status: 'معتمد',
    },
  ],
  variationOrdersList: [
    {
      id: 'VO-01',
      code: 'V.O-01',
      title: 'تعديل واجهات الألمنيوم إلى قطاع عازل للصوت والحرارة',
      project: 'مشروع ABC',
      valueMillion: 14.5,
      date: '2026-09-14',
      status: 'معتمد',
    },
    {
      id: 'VO-02',
      code: 'V.O-02',
      title: 'إضافة مولد كهرباء احتياطي قدرة 1500 ك.ف.أ',
      project: 'مشروع Capital',
      valueMillion: 9.2,
      date: '2026-09-28',
      status: 'معتمد',
    },
    {
      id: 'VO-03',
      code: 'V.O-03',
      title: 'تعديل مسارات التكييف المركزي بالدور التجاري',
      project: 'مشروع Delta',
      valueMillion: 6.8,
      date: '2026-10-30',
      status: 'قيد المراجعة',
    },
    {
      id: 'VO-04',
      code: 'V.O-04',
      title: 'استبدال أرضيات الجرانيت بالرخام المستورد في البهو',
      project: 'مشروع Nile',
      valueMillion: 4.1,
      date: '2026-10-15',
      status: 'مرفوض',
    },
  ],
  invoicesList: [
    {
      id: 'INV-07',
      invoiceNumber: 'مستخلص جاري رقم (7)',
      project: 'مشروع Delta',
      amountMillion: 42.5,
      submissionDate: '2026-11-01',
      status: 'قيد المراجعة',
    },
    {
      id: 'INV-06',
      invoiceNumber: 'مستخلص جاري رقم (6)',
      project: 'مشروع ABC',
      amountMillion: 68.0,
      submissionDate: '2026-10-20',
      status: 'معتمد',
    },
    {
      id: 'INV-05',
      invoiceNumber: 'مستخلص جاري رقم (5)',
      project: 'مشروع Nile',
      amountMillion: 35.4,
      submissionDate: '2026-10-11',
      status: 'معتمد',
    },
  ],
  estimatesList: [
    {
      id: 'EST-01',
      code: 'BOQ-2026-01',
      title: 'مقايسة الأعمال الاعتيادية والهيكل الخرساني',
      project: 'مشروع ABC',
      estimatedMillion: 185.0,
      itemsCount: 145,
      status: 'معتمد',
    },
    {
      id: 'EST-02',
      code: 'BOQ-2026-02',
      title: 'مقايسة الإلكتروميكانيك والأنظمة الذكية MEP',
      project: 'مشروع Delta',
      estimatedMillion: 112.4,
      itemsCount: 98,
      status: 'معتمد',
    },
    {
      id: 'EST-03',
      code: 'BOQ-2026-03',
      title: 'مقايسة التشطيبات الداخلية والواجهات المعمارية',
      project: 'مشروع Nile',
      estimatedMillion: 74.8,
      itemsCount: 64,
      status: 'قيد المراجعة',
    },
  ],
};

const nowTimestamp = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: initialDashboardState,
  reducers: {
    setActiveTab(state, action: PayloadAction<TabId>) {
      state.activeTab = action.payload;
      state.lastSavedAt = nowTimestamp();
    },
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
      state.lastSavedAt = nowTimestamp();
    },
    setFilter(
      state,
      action: PayloadAction<{ key: keyof DashboardFilters; value: string }>
    ) {
      state.filters[action.payload.key] = action.payload.value;
      state.lastSavedAt = nowTimestamp();
    },
    resetFilters(state) {
      state.filters = {
        year: '2026',
        project: 'جميع المشروعات',
        owner: 'الكل',
        discipline: 'الكل',
        status: 'الكل',
        searchQuery: '',
      };
      state.lastSavedAt = nowTimestamp();
    },
    setActiveModal(state, action: PayloadAction<ModalActionType>) {
      state.activeModal = action.payload;
    },
    addProject(state, action: PayloadAction<Omit<ProjectItem, 'id'>>) {
      const newProject: ProjectItem = {
        ...action.payload,
        id: `PRJ-${Date.now().toString().slice(-4)}`,
      };
      state.projects.unshift(newProject);
      state.baseKpis.totalProjects += 1;
      state.baseKpis.totalValueMillion = Number(
        (state.baseKpis.totalValueMillion + newProject.valueMillion).toFixed(1)
      );
      state.lastSavedAt = nowTimestamp();
    },
    addDrawing(state, action: PayloadAction<Omit<DrawingItem, 'id'>>) {
      const newDrawing: DrawingItem = {
        ...action.payload,
        id: `DRW-${Date.now().toString().slice(-4)}`,
      };
      state.drawingsList.unshift(newDrawing);
      state.baseKpis.totalDrawings += 1;
      // تحديث فئة الرسومات المناظرة
      const cat = state.topDrawings.find(
        (c) => c.discipline === newDrawing.discipline
      );
      if (cat) {
        cat.count += 1;
      }
      // تحديث الشهر الأخير
      if (state.monthlyDrawings.length > 0) {
        state.monthlyDrawings[state.monthlyDrawings.length - 1].count += 1;
      }
      // إنشاء إشعار تنبيه فوري بموعد مراجعة وتسليم اللوحة المضافة
      const newNotifId = `NOTIF-${Date.now().toString().slice(-4)}`;
      state.notifications.unshift({
        id: newNotifId,
        title: `جدولة موعد تسليم اللوحة (${newDrawing.code})`,
        description: `تم إدراج "${newDrawing.title}" ويلزم تسليم المراجعة النهائية خلال 3 أيام.`,
        category: 'drawing_deadline',
        urgency: 'warning',
        project: newDrawing.project,
        referenceCode: newDrawing.code,
        dueDate: newDrawing.issueDate,
        remainingDays: 3,
        read: false,
        dismissed: false,
        targetTab: 'drawings',
        createdAt: 'الآن',
      });
      state.activeToastId = newNotifId;
      state.lastSavedAt = nowTimestamp();
    },
    addEstimate(state, action: PayloadAction<Omit<TenderEstimateItem, 'id'>>) {
      const newEst: TenderEstimateItem = {
        ...action.payload,
        id: `EST-${Date.now().toString().slice(-4)}`,
      };
      state.estimatesList.unshift(newEst);
      state.baseKpis.totalEstimates += 1;
      state.lastSavedAt = nowTimestamp();
    },
    addInvoice(state, action: PayloadAction<Omit<InvoiceItem, 'id'>>) {
      const newInv: InvoiceItem = {
        ...action.payload,
        id: `INV-${Date.now().toString().slice(-4)}`,
      };
      state.invoicesList.unshift(newInv);
      state.baseKpis.totalInvoices += 1;
      state.baseKpis.totalDisbursedMillion = Number(
        (state.baseKpis.totalDisbursedMillion + newInv.amountMillion).toFixed(1)
      );
      state.lastSavedAt = nowTimestamp();
    },
    addVariationOrder(
      state,
      action: PayloadAction<Omit<VariationOrderItem, 'id'>>
    ) {
      const newVo: VariationOrderItem = {
        ...action.payload,
        id: `VO-${Date.now().toString().slice(-4)}`,
      };
      state.variationOrdersList.unshift(newVo);
      state.baseKpis.totalVariationOrders += 1;
      state.voSummary.total += 1;
      if (newVo.status === 'معتمد') state.voSummary.approved += 1;
      else if (newVo.status === 'قيد المراجعة') state.voSummary.underReview += 1;
      else state.voSummary.rejected += 1;
      state.lastSavedAt = nowTimestamp();
    },
    addTechnicalApproval(
      state,
      action: PayloadAction<Omit<TechnicalApproval, 'id'>>
    ) {
      const newApp: TechnicalApproval = {
        ...action.payload,
        id: `APP-${Date.now().toString().slice(-4)}`,
      };
      state.recentApprovals.unshift(newApp);
      state.baseKpis.totalApprovals += 1;
      // إنشاء إشعار تنبيه فوري بمتابعة صلاحية الاعتماد الفني
      const newNotifId = `NOTIF-${Date.now().toString().slice(-4)}`;
      state.notifications.unshift({
        id: newNotifId,
        title: `تنبيه صلاحية: ${newApp.type}`,
        description: `تم تسجيل الاعتماد (${newApp.referenceCode}) وتنتهي فترة المراجعة المبدئية خلال 4 أيام.`,
        category: 'approval_expiry',
        urgency: 'critical',
        project: newApp.project,
        referenceCode: newApp.referenceCode,
        dueDate: newApp.date,
        remainingDays: 4,
        read: false,
        dismissed: false,
        targetTab: 'approvals',
        createdAt: 'الآن',
      });
      state.activeToastId = newNotifId;
      state.lastSavedAt = nowTimestamp();
    },
    updateApprovalStatus(
      state,
      action: PayloadAction<{ id: string; status: ApprovalStatus }>
    ) {
      const item = state.recentApprovals.find((a) => a.id === action.payload.id);
      if (item) {
        item.status = action.payload.status;
        state.lastSavedAt = nowTimestamp();
      }
    },
    updateTaskProgress(
      state,
      action: PayloadAction<{ id: number; progress: number }>
    ) {
      const task = state.currentTasks.find((t) => t.id === action.payload.id);
      if (task) {
        task.progress = Math.min(100, Math.max(0, action.payload.progress));
        state.lastSavedAt = nowTimestamp();
      }
    },
    markNotificationAsRead(state, action: PayloadAction<string>) {
      const notif = state.notifications.find((n) => n.id === action.payload);
      if (notif) {
        notif.read = true;
        if (state.activeToastId === action.payload) {
          state.activeToastId = null;
        }
        state.lastSavedAt = nowTimestamp();
      }
    },
    markAllNotificationsAsRead(state) {
      state.notifications.forEach((n) => {
        n.read = true;
      });
      state.activeToastId = null;
      state.lastSavedAt = nowTimestamp();
    },
    dismissNotification(state, action: PayloadAction<string>) {
      const notif = state.notifications.find((n) => n.id === action.payload);
      if (notif) {
        notif.dismissed = true;
        if (state.activeToastId === action.payload) {
          state.activeToastId = null;
        }
        state.lastSavedAt = nowTimestamp();
      }
    },
    triggerUrgentCheckAlert(state) {
      const newNotifId = `NOTIF-${Date.now().toString().slice(-4)}`;
      const isDrawingAlert = state.notifications.length % 2 === 0;
      const newAlert: SystemNotification = isDrawingAlert
        ? {
            id: newNotifId,
            title: 'تنبيه عاجل: موعد تسليم لوحة تكييف مركزي (M-119)',
            description:
              'يتبقى 24 ساعة على الموعد النهائي لتسليم المخططات التنفيذية لمشروع ABC.',
            category: 'drawing_deadline',
            urgency: 'critical',
            project: 'مشروع ABC',
            referenceCode: 'M-119',
            dueDate: '2026-11-04',
            remainingDays: 1,
            read: false,
            dismissed: false,
            targetTab: 'drawings',
            createdAt: 'الآن',
          }
        : {
            id: newNotifId,
            title: 'تنبيه انتهاء صلاحية: اعتماد عينات الخرسانة الجاهزة',
            description:
              'تنتهي صلاحية شهادة الاعتماد الفني لمحطة الخلط خلال يومين لمشروع Nile.',
            category: 'approval_expiry',
            urgency: 'critical',
            project: 'مشروع Nile',
            referenceCode: 'SUB-NIL-304',
            dueDate: '2026-11-05',
            remainingDays: 2,
            read: false,
            dismissed: false,
            targetTab: 'approvals',
            createdAt: 'الآن',
          };

      state.notifications.unshift(newAlert);
      state.activeToastId = newNotifId;
      state.lastSavedAt = nowTimestamp();
    },
    clearActiveToast(state) {
      state.activeToastId = null;
    },
    toggleDrawingForTransmittal(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.selectedDrawingIdsForTransmittal.includes(id)) {
        state.selectedDrawingIdsForTransmittal =
          state.selectedDrawingIdsForTransmittal.filter((item) => item !== id);
      } else {
        state.selectedDrawingIdsForTransmittal.push(id);
      }
    },
    setSelectedDrawingsForTransmittal(state, action: PayloadAction<string[]>) {
      state.selectedDrawingIdsForTransmittal = action.payload;
    },
    addTransmittal(state, action: PayloadAction<Omit<TransmittalNote, 'id'>>) {
      const newTransmittal: TransmittalNote = {
        ...action.payload,
        id: `TRN-${Date.now().toString().slice(-4)}`,
      };
      state.transmittalsList.unshift(newTransmittal);
      state.selectedDrawingIdsForTransmittal = [];

      // توثيق إصدار مذكرة التسليم في سجل المساءلة والمراجعات الهندسية
      state.auditLogs.unshift({
        id: `AUD-${Date.now().toString().slice(-4)}`,
        documentType: 'رسم هندسي',
        documentCode: newTransmittal.referenceNumber,
        documentTitle: `إصدار مذكرة تسليم رسومات (${newTransmittal.drawings.length} لوحات) - ${newTransmittal.purpose}`,
        project: newTransmittal.project,
        discipline: newTransmittal.drawings[0]?.discipline || 'إنشائي',
        action: 'رفع إصدار جديد',
        modifiedBy: newTransmittal.issuedBy,
        userRole: 'مدير المكتب الفني',
        modifiedAt: nowTimestamp(),
        revisionOrStatus: `${newTransmittal.drawings.length} لوحات · ${newTransmittal.status}`,
      });

      // إشعار فوري بتوليد مذكرة التسليم
      const newNotifId = `NOTIF-${Date.now().toString().slice(-4)}`;
      state.notifications.unshift({
        id: newNotifId,
        title: `تم إصدار مذكرة تسليم (${newTransmittal.referenceNumber})`,
        description: `تتضمن ${newTransmittal.drawings.length} لوحات هندسية موجهة إلى ${newTransmittal.recipient}.`,
        category: 'drawing_deadline',
        urgency: 'info',
        project: newTransmittal.project,
        referenceCode: newTransmittal.referenceNumber,
        dueDate: newTransmittal.issueDate,
        remainingDays: 5,
        read: false,
        dismissed: false,
        targetTab: 'correspondence',
        createdAt: 'الآن',
      });
      state.activeToastId = newNotifId;
      state.lastSavedAt = nowTimestamp();
    },
    updateTransmittalStatus(
      state,
      action: PayloadAction<{
        id: string;
        status: 'صادر' | 'مستلم ومعتمد' | 'قيد المراجعة';
      }>
    ) {
      const trn = state.transmittalsList.find(
        (t) => t.id === action.payload.id
      );
      if (trn) {
        trn.status = action.payload.status;
        state.lastSavedAt = nowTimestamp();
      }
    },
    resetDemoData() {
      return { ...initialDashboardState, lastSavedAt: nowTimestamp() };
    },
  },
});

export const {
  setActiveTab,
  toggleDarkMode,
  setFilter,
  resetFilters,
  setActiveModal,
  addProject,
  addDrawing,
  addEstimate,
  addInvoice,
  addVariationOrder,
  addTechnicalApproval,
  updateApprovalStatus,
  updateTaskProgress,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  dismissNotification,
  triggerUrgentCheckAlert,
  clearActiveToast,
  toggleDrawingForTransmittal,
  setSelectedDrawingsForTransmittal,
  addTransmittal,
  updateTransmittalStatus,
  resetDemoData,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
