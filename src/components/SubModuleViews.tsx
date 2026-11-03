/**
 * @file components/SubModuleViews.tsx
 * @description واجهات الأقسام الفرعية للقائمة الجانبية مع دعم البحث وتصدير التقارير الدورية إلى PDF و Excel
 */

import React, { useRef, useState } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  Hourglass,
  XCircle,
  ArrowRight,
  RotateCcw,
  Moon,
  Sun,
  FileSpreadsheet,
  FileDown,
  Loader2,
  Printer,
  FileCheck2,
  CheckSquare,
  Square,
  SlidersHorizontal,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  resetDemoData,
  setActiveModal,
  setActiveTab,
  setFilter,
  resetFilters,
  toggleDarkMode,
  toggleDrawingForTransmittal,
  updateApprovalStatus,
} from '../store/slices/dashboardSlice';
import { NAV_ITEMS } from './SidebarNav';
import {
  exportDashboardToExcel,
  exportElementToPdf,
} from '../utils/exportService';
import { EngineeringAuditLog } from './EngineeringAuditLog';
import { TransmittalGenerator } from './TransmittalGenerator';
import { CostComparisonChart } from './CostComparisonChart';

export const SubModuleViews: React.FC = () => {
  const dispatch = useAppDispatch();
  const dashboardState = useAppSelector((s) => s.dashboard);
  const {
    activeTab,
    projects,
    drawingsList,
    estimatesList,
    invoicesList,
    variationOrdersList,
    recentApprovals,
    darkMode,
    lastSavedAt,
    filters,
  } = dashboardState;

  const searchTerm = filters.searchQuery;
  const searchLower = searchTerm.trim().toLowerCase();
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const sectionPrintRef = useRef<HTMLDivElement>(null);

  const currentNav = NAV_ITEMS.find((n) => n.id === activeTab);

  const handleExportPdf = async () => {
    if (!sectionPrintRef.current || isExportingPdf) return;
    try {
      setIsExportingPdf(true);
      await exportElementToPdf(
        sectionPrintRef.current,
        `تقرير_${currentNav?.label || 'المكتب_الفني'}_EEC`
      );
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div ref={sectionPrintRef} className="space-y-4">
      {/* شريط عنوان القسم الفرعي وأزرار التصدير والطباعة والعودة للوحة التحكم الرئيسية */}
      <div className="print-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-white/95 dark:bg-slate-900/95 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => dispatch(setActiveTab('dashboard'))}
            className="no-print flex items-center gap-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/80 px-3 py-1.5 text-xs font-bold text-purple-900 dark:text-purple-200 hover:bg-purple-200 transition cursor-pointer"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة للوحة التحكم</span>
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#1e1b4b] dark:text-purple-100">
              {currentNav?.label} - المكتب الفني (EEC)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              إدارة ومتابعة السجلات الهندسية المعتمدة مع الطباعة المباشرة والتصدير الدوري لملفات Excel و PDF
            </p>
          </div>
        </div>

        {/* بحث سريع + أزرار طباعة وتصدير Excel/PDF + زر إضافة حسب القسم (تختفي عند الطباعة) */}
        <div className="no-print flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث في المشروعات، V.O، أرقام اللوحات..."
              value={searchTerm}
              onChange={(e) =>
                dispatch(
                  setFilter({ key: 'searchQuery', value: e.target.value })
                )
              }
              className="rounded-xl border border-purple-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pr-9 pl-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:border-purple-600 focus:outline-none"
            />
          </div>

          {/* زر الطباعة المباشرة للجدول المفتوح حالياً */}
          <button
            type="button"
            onClick={() => window.print()}
            title="طباعة مباشرة للجدول المفتوح حالياً (window.print)"
            className="flex items-center gap-1.5 rounded-xl bg-purple-700 hover:bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>طباعة الجدول</span>
          </button>

          {/* أزرار تصدير البيانات الحالية */}
          <button
            type="button"
            onClick={() => exportDashboardToExcel(dashboardState)}
            title="تصدير البيانات والجداول إلى ملف Excel (.xlsx)"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Excel</span>
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            title="تصدير الجدول الحالي إلى ملف PDF"
            className="flex items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-600 disabled:opacity-60 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
          >
            {isExportingPdf ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileDown className="h-3.5 w-3.5" />
            )}
            <span>PDF</span>
          </button>

          {activeTab === 'projects' && (
            <button
              type="button"
              onClick={() => dispatch(setActiveModal('add_project'))}
              className="flex items-center gap-1.5 rounded-xl bg-purple-800 hover:bg-purple-700 px-3.5 py-1.5 text-xs font-bold text-white shadow cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة مشروع</span>
            </button>
          )}

          {activeTab === 'drawings' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => dispatch(setActiveModal('generate_transmittal'))}
                className="flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-white shadow cursor-pointer"
              >
                <FileCheck2 className="h-4 w-4" />
                <span>
                  إصدار مذكرة تسليم (
                  {dashboardState.selectedDrawingIdsForTransmittal.length})
                </span>
              </button>
              <button
                type="button"
                onClick={() => dispatch(setActiveModal('upload_drawing'))}
                className="flex items-center gap-1.5 rounded-xl bg-purple-800 hover:bg-purple-700 px-3.5 py-1.5 text-xs font-bold text-white shadow cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>رفع لوحة هندسية</span>
              </button>
            </div>
          )}

          {(activeTab === 'boq' || activeTab === 'tenders') && (
            <button
              type="button"
              onClick={() => dispatch(setActiveModal('create_estimate'))}
              className="flex items-center gap-1.5 rounded-xl bg-purple-800 hover:bg-purple-700 px-3.5 py-1.5 text-xs font-bold text-white shadow cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>إعداد مقايسة</span>
            </button>
          )}

          {activeTab === 'invoices' && (
            <button
              type="button"
              onClick={() => dispatch(setActiveModal('issue_invoice'))}
              className="flex items-center gap-1.5 rounded-xl bg-purple-800 hover:bg-purple-700 px-3.5 py-1.5 text-xs font-bold text-white shadow cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>إصدار مستخلص</span>
            </button>
          )}

          {activeTab === 'variation_orders' && (
            <button
              type="button"
              onClick={() => dispatch(setActiveModal('register_vo'))}
              className="flex items-center gap-1.5 rounded-xl bg-purple-800 hover:bg-purple-700 px-3.5 py-1.5 text-xs font-bold text-white shadow cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>تسجيل أمر تغيير</span>
            </button>
          )}

          {activeTab === 'approvals' && (
            <button
              type="button"
              onClick={() => dispatch(setActiveModal('track_approvals'))}
              className="flex items-center gap-1.5 rounded-xl bg-purple-800 hover:bg-purple-700 px-3.5 py-1.5 text-xs font-bold text-white shadow cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة اعتماد فني</span>
            </button>
          )}
        </div>
      </div>

      {/* محتوى القسم حسب التبويب النشط */}
      {activeTab === 'projects' && (
        <div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-white/95 dark:bg-slate-900/95 p-4 shadow-sm overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-purple-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                <th className="py-2.5 px-3 rounded-r-xl">كود المشروع</th>
                <th className="py-2.5 px-3">اسم المشروع</th>
                <th className="py-2.5 px-3">الجهة المالكة</th>
                <th className="py-2.5 px-3">التخصص</th>
                <th className="py-2.5 px-3">القيمة (مليون ج.م)</th>
                <th className="py-2.5 px-3">المنصرف</th>
                <th className="py-2.5 px-3">نسبة الإنجاز</th>
                <th className="py-2.5 px-3 rounded-l-xl">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
              {projects
                .filter(
                  (p) =>
                    !searchLower ||
                    p.name.toLowerCase().includes(searchLower) ||
                    p.code.toLowerCase().includes(searchLower) ||
                    p.owner.toLowerCase().includes(searchLower) ||
                    p.discipline.toLowerCase().includes(searchLower)
                )
                .map((proj) => (
                  <tr
                    key={proj.id}
                    className="hover:bg-purple-50/50 dark:hover:bg-slate-800/60 transition"
                  >
                    <td className="py-3 px-3 font-mono text-purple-800 dark:text-purple-300">
                      {proj.code}
                    </td>
                    <td className="py-3 px-3 text-slate-900 dark:text-white">
                      {proj.name}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {proj.owner}
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-200">
                      {proj.discipline}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-900 dark:text-white tabular-nums">
                      {proj.valueMillion.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {proj.disbursedMillion.toFixed(1)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            style={{ width: `${proj.completionRate}%` }}
                            className="h-full bg-emerald-600 rounded-full"
                          />
                        </div>
                        <span className="font-mono tabular-nums">
                          {proj.completionRate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-emerald-700 dark:text-emerald-400">
                        {proj.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'drawings' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-white/95 dark:bg-slate-900/95 p-4 shadow-sm overflow-x-auto">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
              <span className="font-extrabold text-purple-900 dark:text-purple-200">
                قائمة اللوحات والرسومات الهندسية (حدد الرسومات لتوليد مذكرة تسليم Transmittal تلقائياً)
              </span>
              {dashboardState.selectedDrawingIdsForTransmittal.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    dispatch(setActiveModal('generate_transmittal'))
                  }
                  className="no-print flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 px-3 py-1 text-xs font-extrabold text-white shadow cursor-pointer"
                >
                  <FileCheck2 className="h-3.5 w-3.5" />
                  <span>
                    توليد مذكرة تسليم للرسومات المحددة (
                    {dashboardState.selectedDrawingIdsForTransmittal.length})
                  </span>
                </button>
              )}
            </div>
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-purple-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  <th className="no-print py-2.5 px-3 rounded-r-xl w-10">
                    اختيار
                  </th>
                  <th className="py-2.5 px-3">كود اللوحة</th>
                  <th className="py-2.5 px-3">عنوان الرسم الهندسي</th>
                  <th className="py-2.5 px-3">المشروع</th>
                  <th className="py-2.5 px-3">التخصص</th>
                  <th className="py-2.5 px-3">الإصدار</th>
                  <th className="py-2.5 px-3">تاريخ الإصدار</th>
                  <th className="py-2.5 px-3 rounded-l-xl">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                {drawingsList
                  .filter(
                    (d) =>
                      !searchLower ||
                      d.title.toLowerCase().includes(searchLower) ||
                      d.code.toLowerCase().includes(searchLower) ||
                      d.project.toLowerCase().includes(searchLower) ||
                      d.discipline.toLowerCase().includes(searchLower)
                  )
                  .map((drw) => {
                    const isSelected =
                      dashboardState.selectedDrawingIdsForTransmittal.includes(
                        drw.id
                      );
                    return (
                      <tr
                        key={drw.id}
                        onClick={() =>
                          dispatch(toggleDrawingForTransmittal(drw.id))
                        }
                        className={`transition cursor-pointer ${
                          isSelected
                            ? 'bg-purple-50/90 dark:bg-purple-950/50'
                            : 'hover:bg-purple-50/50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <td className="no-print py-3 px-3">
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-purple-700 dark:text-purple-400" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-400" />
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-purple-800 dark:text-purple-300">
                          {drw.code}
                        </td>
                        <td className="py-3 px-3 text-slate-900 dark:text-white">
                          {drw.title}
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                          {drw.project}
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-200">
                          {drw.discipline}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                          {drw.revision}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                          {drw.issueDate}
                        </td>
                        <td className="py-3 px-3 text-emerald-700 dark:text-emerald-400">
                          {drw.status}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* نظام توليد مذكرات تسليم الرسومات وسجل المذكرات الصادرة */}
          <TransmittalGenerator />
        </div>
      )}

      {(activeTab === 'boq' || activeTab === 'tenders') && (
        <div className="space-y-4">
          <CostComparisonChart />
          <div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-white/95 dark:bg-slate-900/95 p-4 shadow-sm overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-purple-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  <th className="py-2.5 px-3 rounded-r-xl">كود المقايسة</th>
                  <th className="py-2.5 px-3">بيان المقايسة وحصر الكميات</th>
                  <th className="py-2.5 px-3">المشروع</th>
                  <th className="py-2.5 px-3">عدد البنود</th>
                  <th className="py-2.5 px-3">القيمة التقديرية (مليون ج.م)</th>
                  <th className="py-2.5 px-3 rounded-l-xl">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                {estimatesList
                  .filter(
                    (est) =>
                      !searchLower ||
                      est.code.toLowerCase().includes(searchLower) ||
                      est.title.toLowerCase().includes(searchLower) ||
                      est.project.toLowerCase().includes(searchLower)
                  )
                  .map((est) => (
                    <tr
                      key={est.id}
                      className="hover:bg-purple-50/50 dark:hover:bg-slate-800/60"
                    >
                      <td className="py-3 px-3 font-mono text-purple-800 dark:text-purple-300">
                        {est.code}
                      </td>
                      <td className="py-3 px-3 text-slate-900 dark:text-white">
                        {est.title}
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        {est.project}
                      </td>
                      <td className="py-3 px-3 font-mono tabular-nums">
                        {est.itemsCount} بند
                      </td>
                      <td className="py-3 px-3 font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                        {est.estimatedMillion.toFixed(1)}
                      </td>
                      <td className="py-3 px-3 text-emerald-700 dark:text-emerald-400">
                        {est.status}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <CostComparisonChart />
          <div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-white/95 dark:bg-slate-900/95 p-4 shadow-sm overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-purple-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  <th className="py-2.5 px-3 rounded-r-xl">بيان المستخلص</th>
                  <th className="py-2.5 px-3">المشروع</th>
                  <th className="py-2.5 px-3">القيمة (مليون ج.م)</th>
                  <th className="py-2.5 px-3">تاريخ التقديم</th>
                  <th className="py-2.5 px-3 rounded-l-xl">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                {invoicesList
                  .filter(
                    (inv) =>
                      !searchLower ||
                      inv.invoiceNumber.toLowerCase().includes(searchLower) ||
                      inv.project.toLowerCase().includes(searchLower)
                  )
                  .map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-purple-50/50 dark:hover:bg-slate-800/60"
                    >
                      <td className="py-3 px-3 text-slate-900 dark:text-white">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        {inv.project}
                      </td>
                      <td className="py-3 px-3 font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                        {inv.amountMillion.toFixed(1)}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                        {inv.submissionDate}
                      </td>
                      <td className="py-3 px-3 text-emerald-700 dark:text-emerald-400">
                        {inv.status}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'variation_orders' && (
        <div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-white/95 dark:bg-slate-900/95 p-4 shadow-sm overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-purple-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                <th className="py-2.5 px-3 rounded-r-xl">كود الأمر</th>
                <th className="py-2.5 px-3">وصف أمر التغيير (V.O)</th>
                <th className="py-2.5 px-3">المشروع</th>
                <th className="py-2.5 px-3">القيمة (مليون ج.م)</th>
                <th className="py-2.5 px-3">التاريخ</th>
                <th className="py-2.5 px-3 rounded-l-xl">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
              {variationOrdersList
                .filter(
                  (vo) =>
                    !searchLower ||
                    vo.code.toLowerCase().includes(searchLower) ||
                    vo.title.toLowerCase().includes(searchLower) ||
                    vo.project.toLowerCase().includes(searchLower)
                )
                .map((vo) => (
                  <tr
                    key={vo.id}
                    className="hover:bg-purple-50/50 dark:hover:bg-slate-800/60"
                  >
                    <td className="py-3 px-3 font-mono text-purple-800 dark:text-purple-300">
                      {vo.code}
                    </td>
                    <td className="py-3 px-3 text-slate-900 dark:text-white">
                      {vo.title}
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                      {vo.project}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-900 dark:text-white tabular-nums">
                      {vo.valueMillion.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                      {vo.date}
                    </td>
                    <td className="py-3 px-3">
                      {vo.status === 'معتمد' && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" /> معتمد
                        </span>
                      )}
                      {vo.status === 'قيد المراجعة' && (
                        <span className="inline-flex items-center gap-1 text-sky-700 dark:text-sky-400">
                          <Hourglass className="h-4 w-4" /> قيد المراجعة
                        </span>
                      )}
                      {vo.status === 'مرفوض' && (
                        <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
                          <XCircle className="h-4 w-4" /> مرفوض
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-white/95 dark:bg-slate-900/95 p-4 shadow-sm overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-purple-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                <th className="py-2.5 px-3 rounded-r-xl">المرجع</th>
                <th className="py-2.5 px-3">نوع الاعتماد الفني</th>
                <th className="py-2.5 px-3">المشروع</th>
                <th className="py-2.5 px-3">التخصص</th>
                <th className="py-2.5 px-3">التاريخ</th>
                <th className="py-2.5 px-3 rounded-l-xl">الحالة (انقر للتبديل)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
              {recentApprovals.map((app) => (
                <tr
                  key={app.id}
                  onClick={() =>
                    dispatch(
                      updateApprovalStatus({
                        id: app.id,
                        status:
                          app.status === 'معتمد' ? 'قيد المراجعة' : 'معتمد',
                      })
                    )
                  }
                  className="hover:bg-purple-50/50 dark:hover:bg-slate-800/60 cursor-pointer"
                >
                  <td className="py-3 px-3 font-mono text-purple-800 dark:text-purple-300">
                    {app.referenceCode}
                  </td>
                  <td className="py-3 px-3 text-slate-900 dark:text-white">
                    {app.type}
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                    {app.project}
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-200">
                    {app.discipline}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                    {app.date}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-emerald-700 dark:text-emerald-400">
                      {app.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-white/95 dark:bg-slate-900/95 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-purple-900 dark:text-purple-200">
            إعدادات النظام والتخزين المحلي (LocalStorage)
          </h3>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                الوضع اللوني للواجهة (الوضع الفاتح / الوضع الداكن)
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                يتم حفظ تفضيل الإضاءة تلقائياً في المتصفح
              </p>
            </div>
            <button
              type="button"
              onClick={() => dispatch(toggleDarkMode())}
              className="flex items-center gap-2 rounded-xl bg-purple-800 hover:bg-purple-700 px-4 py-2 text-xs font-bold text-white cursor-pointer"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span>{darkMode ? 'التبديل للوضع الفاتح' : 'التبديل للوضع الداكن'}</span>
            </button>
          </div>

          {/* قسم إدارة حالة تفضيلات الفلاتر المحفوظة في LocalStorage */}
          <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <SlidersHorizontal className="h-4 w-4 text-purple-700 dark:text-purple-400" />
                  <span>تفضيلات فلاتر المشروعات والبحث المحفوظة (LocalStorage)</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  يتم الاحتفاظ بحالة الفلاتر تلقائياً في المتصفح وتستعاد عند كل إعادة تحميل للصفحة
                </p>
              </div>
              <button
                type="button"
                onClick={() => dispatch(resetFilters())}
                className="flex items-center gap-1.5 rounded-xl border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/70 hover:bg-purple-100 dark:hover:bg-purple-900 px-3 py-1.5 text-xs font-bold text-purple-800 dark:text-purple-300 transition cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>إعادة ضبط الفلاتر للافتراضي</span>
              </button>
            </div>

            {/* تفاصيل القيم المحفوظة حالياً */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-xs">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 p-2 border border-slate-200/60 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">السنة:</span>
                <span className="font-mono font-bold text-purple-800 dark:text-purple-300">{filters.year}</span>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 p-2 border border-slate-200/60 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">المشروع:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{filters.project}</span>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 p-2 border border-slate-200/60 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">المالك:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{filters.owner}</span>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 p-2 border border-slate-200/60 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">التخصص:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{filters.discipline}</span>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 p-2 border border-slate-200/60 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">حالة المشروع:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{filters.status}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                استعادة البيانات القياسية الافتراضية
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                آخر حفظ تلقائي: <span className="font-mono">{lastSavedAt}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => dispatch(resetDemoData())}
              className="flex items-center gap-2 rounded-xl border border-rose-300 dark:border-rose-800 px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>إعادة ضبط المصنع للبيانات</span>
            </button>
          </div>
        </div>
      )}

      {/* قسم المراسلات الفنية يعرض نظام توليد مذكرات تسليم الرسومات (Transmittals) */}
      {activeTab === 'correspondence' && <TransmittalGenerator />}

      {/* باقي التبويبات الوثائقية (العقود، المستندات، التقارير) */}
      {['contracts', 'documents', 'reports'].includes(
        activeTab
      ) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.slice(0, 3).map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-white/95 dark:bg-slate-900/95 p-4 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-400">
                  {p.code}
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  سجل نشط
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {currentNav?.label} - {p.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                المالك: {p.owner} · التخصص: {p.discipline}
              </p>
              <div className="pt-2 flex items-center justify-between text-xs font-bold text-purple-800 dark:text-purple-300 border-t border-slate-100 dark:border-slate-800">
                <span>عدد اللوحات: {p.drawingsCount}</span>
                <span>القيمة: {p.valueMillion} مليون ج.م</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* عرض سجل المساءلة وآخر التعديلات على المستندات الهندسية في أقسام الرسومات والاعتمادات والمستندات */}
      {(activeTab === 'documents' ||
        activeTab === 'drawings' ||
        activeTab === 'approvals') && <EngineeringAuditLog />}
    </div>
  );
};
