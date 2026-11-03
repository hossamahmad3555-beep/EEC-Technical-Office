/**
 * @file utils/exportService.ts
 * @description خدمة تصدير بيانات المؤشرات والجداول الهندسية للمكتب الفني (EEC) إلى ملفات Excel (.xlsx) و PDF (.pdf)
 */

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { DashboardState } from '../store/slices/dashboardSlice';

/**
 * تصدير كافة مؤشرات الأداء والجداول الحالية إلى ملف Excel متعدد الأوراق (.xlsx)
 * مع تفعيل اتجاه القراءة من اليمين إلى اليسار (RTL) لدعم اللغة العربية بشكل كامل
 */
export function exportDashboardToExcel(state: DashboardState): void {
  const workbook = XLSX.utils.book_new();

  // 1. ورقة ملخص مؤشرات الأداء الرئيسية (KPIs)
  const kpiRows = [
    {
      'المؤشر القياسي': 'إجمالي المشروعات',
      'القيمة الحالية': state.baseKpis.totalProjects,
      'الوحدة': 'مشروع',
    },
    {
      'المؤشر القياسي': 'إجمالي اللوحات والرسومات الهندسية',
      'القيمة الحالية': state.baseKpis.totalDrawings,
      'الوحدة': 'لوحة',
    },
    {
      'المؤشر القياسي': 'إجمالي المقايسات (BOQ)',
      'القيمة الحالية': state.baseKpis.totalEstimates,
      'الوحدة': 'مقايسة',
    },
    {
      'المؤشر القياسي': 'إجمالي المستخلصات الجارية',
      'القيمة الحالية': state.baseKpis.totalInvoices,
      'الوحدة': 'مستخلص',
    },
    {
      'المؤشر القياسي': 'أوامر التغيير (V.O)',
      'القيمة الحالية': state.baseKpis.totalVariationOrders,
      'الوحدة': 'أمر تغيير',
    },
    {
      'المؤشر القياسي': 'الاعتمادات الفنية',
      'القيمة الحالية': state.baseKpis.totalApprovals,
      'الوحدة': 'اعتماد',
    },
    {
      'المؤشر القياسي': 'القيمة التعاقدية الإجمالية',
      'القيمة الحالية': state.baseKpis.totalValueMillion,
      'الوحدة': 'مليون ج.م',
    },
    {
      'المؤشر القياسي': 'إجمالي المستخلصات المنصرفة',
      'القيمة الحالية': state.baseKpis.totalDisbursedMillion,
      'الوحدة': 'مليون ج.م',
    },
    {
      'المؤشر القياسي': 'المتبقي من القيمة التعاقدية',
      'القيمة الحالية': Number(
        (
          state.baseKpis.totalValueMillion -
          state.baseKpis.totalDisbursedMillion
        ).toFixed(1)
      ),
      'الوحدة': 'مليون ج.م',
    },
    {
      'المؤشر القياسي': 'نسبة الإنجاز العام للمشروعات',
      'القيمة الحالية': `${state.baseKpis.overallCompletion}%`,
      'الوحدة': 'نسبة مئوية',
    },
    {
      'المؤشر القياسي': 'الأعمال المنجزة',
      'القيمة الحالية': state.baseKpis.completedTasksCount,
      'الوحدة': 'عمل',
    },
    {
      'المؤشر القياسي': 'الأعمال قيد التنفيذ',
      'القيمة الحالية': state.baseKpis.inProgressTasksCount,
      'الوحدة': 'عمل',
    },
    {
      'المؤشر القياسي': 'الأعمال المتأخرة',
      'القيمة الحالية': state.baseKpis.delayedTasksCount,
      'الوحدة': 'عمل',
    },
  ];
  const kpiSheet = XLSX.utils.json_to_sheet(kpiRows);
  kpiSheet['!cols'] = [{ wch: 36 }, { wch: 18 }, { wch: 16 }];
  kpiSheet['!views'] = [{ rightToLeft: true }];
  XLSX.utils.book_append_sheet(workbook, kpiSheet, 'ملخص المؤشرات');

  // 2. ورقة سجل المشروعات الهندسية
  const projectRows = state.projects.map((p) => ({
    'كود المشروع': p.code,
    'اسم المشروع': p.name,
    'الجهة المالكة': p.owner,
    'التخصص الرئيسي': p.discipline,
    'السنة': p.year,
    'القيمة التعاقدية (مليون ج.م)': p.valueMillion,
    'المنصرف (مليون ج.م)': p.disbursedMillion,
    'نسبة الإنجاز (%)': `${p.completionRate}%`,
    'عدد الرسومات': p.drawingsCount,
    'حالة المشروع': p.status,
  }));
  const projectSheet = XLSX.utils.json_to_sheet(projectRows);
  projectSheet['!cols'] = [
    { wch: 16 },
    { wch: 30 },
    { wch: 26 },
    { wch: 14 },
    { wch: 10 },
    { wch: 22 },
    { wch: 18 },
    { wch: 15 },
    { wch: 14 },
    { wch: 14 },
  ];
  projectSheet['!views'] = [{ rightToLeft: true }];
  XLSX.utils.book_append_sheet(workbook, projectSheet, 'المشروعات');

  // 3. ورقة آخر الاعتمادات الفنية
  const approvalRows = state.recentApprovals.map((a) => ({
    'كود المرجع': a.referenceCode,
    'نوع الاعتماد الفني': a.type,
    'المشروع': a.project,
    'التخصص': a.discipline,
    'تاريخ الاعتماد': a.date,
    'الحالة': a.status,
  }));
  const approvalSheet = XLSX.utils.json_to_sheet(approvalRows);
  approvalSheet['!cols'] = [
    { wch: 16 },
    { wch: 28 },
    { wch: 18 },
    { wch: 14 },
    { wch: 15 },
    { wch: 15 },
  ];
  approvalSheet['!views'] = [{ rightToLeft: true }];
  XLSX.utils.book_append_sheet(workbook, approvalSheet, 'الاعتمادات الفنية');

  // 4. ورقة الرسومات الهندسية وتوزيع التخصصات
  const drawingRows = state.drawingsList.map((d) => ({
    'كود اللوحة': d.code,
    'عنوان اللوحة': d.title,
    'المشروع': d.project,
    'التخصص الهندسي': d.discipline,
    'رقم الإصدار': d.revision,
    'تاريخ الإصدار': d.issueDate,
    'الحالة': d.status,
  }));
  const drawingSheet = XLSX.utils.json_to_sheet(drawingRows);
  drawingSheet['!cols'] = [
    { wch: 14 },
    { wch: 42 },
    { wch: 18 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
    { wch: 14 },
  ];
  drawingSheet['!views'] = [{ rightToLeft: true }];
  XLSX.utils.book_append_sheet(workbook, drawingSheet, 'الرسومات الهندسية');

  // 5. ورقة أهم المهام الحالية وتوزيع التخصصات
  const taskRows = state.currentTasks.map((t) => ({
    'رقم المهمة': t.id,
    'بيان المهمة': t.taskName,
    'المشروع': t.project,
    'التخصص': t.discipline,
    'نسبة الإنجاز (%)': `${t.progress}%`,
    'تاريخ الاستحقاق': t.dueDate,
  }));
  const taskSheet = XLSX.utils.json_to_sheet(taskRows);
  taskSheet['!cols'] = [
    { wch: 12 },
    { wch: 32 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
  ];
  taskSheet['!views'] = [{ rightToLeft: true }];
  XLSX.utils.book_append_sheet(workbook, taskSheet, 'المهام الحالية');

  // 6. ورقة المستخلصات وأوامر التغيير
  const financialRows = [
    ...state.invoicesList.map((inv) => ({
      'النوع': 'مستخلص مالي',
      'البيان / الكود': inv.invoiceNumber,
      'المشروع': inv.project,
      'القيمة (مليون ج.م)': inv.amountMillion,
      'التاريخ': inv.submissionDate,
      'الحالة': inv.status,
    })),
    ...state.variationOrdersList.map((vo) => ({
      'النوع': `أمر تغيير (${vo.code})`,
      'البيان / الكود': vo.title,
      'المشروع': vo.project,
      'القيمة (مليون ج.م)': vo.valueMillion,
      'التاريخ': vo.date,
      'الحالة': vo.status,
    })),
  ];
  const financialSheet = XLSX.utils.json_to_sheet(financialRows);
  financialSheet['!cols'] = [
    { wch: 20 },
    { wch: 38 },
    { wch: 18 },
    { wch: 18 },
    { wch: 15 },
    { wch: 15 },
  ];
  financialSheet['!views'] = [{ rightToLeft: true }];
  XLSX.utils.book_append_sheet(
    workbook,
    financialSheet,
    'المستخلصات وأوامر التغيير'
  );

  // 7. ورقة سجل التعديلات والمساءلة على المستندات الهندسية (Audit Log)
  if (state.auditLogs && state.auditLogs.length > 0) {
    const auditRows = state.auditLogs.map((log) => ({
      'نوع المستند': log.documentType,
      'كود المستند': log.documentCode,
      'بيان المستند الهندسي': log.documentTitle,
      'المشروع': log.project,
      'التخصص': log.discipline,
      'الإجراء المنفذ': log.action,
      'قام بالتعديل (المسؤول)': log.modifiedBy,
      'المسمى الوظيفي': log.userRole,
      'الإصدار / الحالة': log.revisionOrStatus,
      'تاريخ ووقت التغيير': log.modifiedAt,
    }));
    const auditSheet = XLSX.utils.json_to_sheet(auditRows);
    auditSheet['!cols'] = [
      { wch: 15 },
      { wch: 16 },
      { wch: 38 },
      { wch: 18 },
      { wch: 14 },
      { wch: 20 },
      { wch: 22 },
      { wch: 20 },
      { wch: 18 },
      { wch: 18 },
    ];
    auditSheet['!views'] = [{ rightToLeft: true }];
    XLSX.utils.book_append_sheet(workbook, auditSheet, 'سجل تعديلات المستندات');
  }

  // 8. ورقة مذكرات تسليم الرسومات الهندسية (Drawing Transmittals)
  if (state.transmittalsList && state.transmittalsList.length > 0) {
    const transmittalRows = state.transmittalsList.map((trn) => ({
      'الرقم المرجعي للمذكرة': trn.referenceNumber,
      'المشروع': trn.project,
      'الجهة المستلمة': trn.recipient,
      'عناية': trn.attention,
      'الغرض من التسليم': trn.purpose,
      'عدد اللوحات': trn.drawings.length,
      'أكواد اللوحات المرفقة': trn.drawings.map((d) => d.code).join(' , '),
      'الملاحظات الفنية': trn.notes,
      'تاريخ الإصدار': trn.issueDate,
      'الحالة': trn.status,
    }));
    const transmittalSheet = XLSX.utils.json_to_sheet(transmittalRows);
    transmittalSheet['!cols'] = [
      { wch: 22 },
      { wch: 18 },
      { wch: 28 },
      { wch: 24 },
      { wch: 20 },
      { wch: 14 },
      { wch: 24 },
      { wch: 40 },
      { wch: 15 },
      { wch: 16 },
    ];
    transmittalSheet['!views'] = [{ rightToLeft: true }];
    XLSX.utils.book_append_sheet(
      workbook,
      transmittalSheet,
      'مذكرات تسليم الرسومات'
    );
  }

  const dateStamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(
    workbook,
    `تقرير_المكتب_الفني_EEC_${state.filters.year}_${dateStamp}.xlsx`
  );
}

/**
 * تصدير تقرير المكتب الفني الدوري أو لوحة المؤشرات الحالية إلى ملف PDF عالي الدقة
 * يدعم النصوص العربية والجداول والمخططات البيانية بدقة كاملة
 */
export async function exportElementToPdf(
  element: HTMLElement,
  fileNamePrefix = 'تقرير_المكتب_الفني_EEC'
): Promise<void> {
  const isDark = document.documentElement.classList.contains('dark');
  const dataUrl = await toPng(element, {
    quality: 0.98,
    pixelRatio: 2,
    backgroundColor: isDark ? '#0f081d' : '#f3effd',
    cacheBust: true,
  });

  const img = new Image();
  img.src = dataUrl;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (err) => reject(err);
  });

  // إنشاء ملف PDF بالوضع الأفقي (Landscape A4) ليناسب عرض لوحة التحكم والجداول الهندسية
  const pdf = new jsPDF({
    orientation: img.width >= img.height ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin * 2;

  const imgRatio = img.width / img.height;
  let renderWidth = maxWidth;
  let renderHeight = renderWidth / imgRatio;

  if (renderHeight > maxHeight) {
    renderHeight = maxHeight;
    renderWidth = renderHeight * imgRatio;
  }

  const offsetX = (pageWidth - renderWidth) / 2;
  const offsetY = (pageHeight - renderHeight) / 2;

  pdf.addImage(dataUrl, 'PNG', offsetX, offsetY, renderWidth, renderHeight);

  const dateStamp = new Date().toISOString().slice(0, 10);
  pdf.save(`${fileNamePrefix}_${dateStamp}.pdf`);
}
