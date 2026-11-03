/**
 * @file components/DashboardTablesAndActions.tsx
 * @description الجداول الثلاثة السفلية (أهم المهام الحالية، أبرز الرسومات، آخر الاعتمادات الفنية) مع التصفية الفورية لشريط البحث الذكي + شريط الإجراءات الـ 7 السفلي
 */

import React from 'react';
import {
  CheckCircle2,
  Hourglass,
  XCircle,
  Folder,
  ClipboardList,
  TrendingUp,
  Award,
  Plus,
  Upload,
  FileSpreadsheet,
  Calculator,
  ArrowLeftRight,
  BadgeCheck,
  BarChart3,
  FileCode2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  setActiveModal,
  setActiveTab,
  updateApprovalStatus,
  updateTaskProgress,
} from '../store/slices/dashboardSlice';
import { ApprovalStatus, ModalActionType } from '../types/dashboard';
import { EngineeringAuditLog } from './EngineeringAuditLog';

export const DashboardTablesAndActions: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    recentApprovals,
    topDrawings,
    drawingsList,
    currentTasks,
    variationOrdersList,
    filters,
  } = useAppSelector((s) => s.dashboard);

  const searchQuery = filters.searchQuery.trim().toLowerCase();

  // تصفية فورية لجدول الاعتمادات الفنية بناءً على الفلاتر وشريط البحث الذكي
  const filteredApprovals = recentApprovals.filter((a) => {
    if (
      filters.project !== 'جميع المشروعات' &&
      !a.project.includes(filters.project.replace('مشروع ', ''))
    ) {
      return false;
    }
    if (filters.discipline !== 'الكل' && a.discipline !== filters.discipline) {
      return false;
    }
    if (searchQuery) {
      const matchesApproval =
        a.type.toLowerCase().includes(searchQuery) ||
        a.project.toLowerCase().includes(searchQuery) ||
        a.referenceCode.toLowerCase().includes(searchQuery) ||
        a.status.toLowerCase().includes(searchQuery);
      if (!matchesApproval) return false;
    }
    return true;
  });

  // تصفية فورية لأوامر التغيير المطابقة إذا كتب المستخدم كود V.O في البحث
  const matchedVOsForApprovalCard = searchQuery
    ? variationOrdersList.filter(
        (vo) =>
          vo.code.toLowerCase().includes(searchQuery) ||
          vo.title.toLowerCase().includes(searchQuery) ||
          vo.project.toLowerCase().includes(searchQuery)
      )
    : [];

  // تصفية فورية لبطاقة أبرز الرسومات وأرقام اللوحات الهندسية
  const filteredDrawingCategories = topDrawings.filter((cat) => {
    if (
      filters.discipline !== 'الكل' &&
      cat.discipline !== filters.discipline
    ) {
      return false;
    }
    if (!searchQuery) return true;
    return (
      cat.title.toLowerCase().includes(searchQuery) ||
      cat.codeRange.toLowerCase().includes(searchQuery) ||
      cat.discipline.toLowerCase().includes(searchQuery)
    );
  });

  const matchedSpecificDrawings = searchQuery
    ? drawingsList.filter(
        (d) =>
          d.code.toLowerCase().includes(searchQuery) ||
          d.title.toLowerCase().includes(searchQuery) ||
          d.project.toLowerCase().includes(searchQuery)
      )
    : [];

  // تصفية فورية لجدول أهم المهام الحالية
  const filteredTasks = currentTasks.filter((t) => {
    if (
      filters.project !== 'جميع المشروعات' &&
      !filters.project.includes(t.project)
    ) {
      return false;
    }
    if (filters.discipline !== 'الكل' && t.discipline !== filters.discipline) {
      return false;
    }
    if (searchQuery) {
      return (
        t.taskName.toLowerCase().includes(searchQuery) ||
        t.project.toLowerCase().includes(searchQuery) ||
        t.discipline.toLowerCase().includes(searchQuery)
      );
    }
    return true;
  });

  const cycleStatus = (current: ApprovalStatus): ApprovalStatus => {
    if (current === 'معتمد') return 'قيد المراجعة';
    if (current === 'قيد المراجعة') return 'مرفوض';
    return 'معتمد';
  };

  const actionButtons: {
    id: ModalActionType;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'add_project', label: 'إضافة مشروع', icon: Plus },
    { id: 'upload_drawing', label: 'رفع رسومات', icon: Upload },
    { id: 'create_estimate', label: 'إعداد مقايسة', icon: FileSpreadsheet },
    { id: 'issue_invoice', label: 'إصدار مستخلص', icon: Calculator },
    { id: 'register_vo', label: 'تسجيل أمر تغيير (V.O)', icon: ArrowLeftRight },
    { id: 'track_approvals', label: 'متابعة الاعتمادات', icon: BadgeCheck },
    { id: 'technical_report', label: 'تقرير فني', icon: BarChart3 },
  ];

  return (
    <div className="space-y-3">
      {/* الصف الثالث: 3 بطاقات سفلية */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* 1. بطاقة أهم المهام الحالية (أقصى اليمين - 4 أعمدة) */}
        <div className="lg:col-span-4 rounded-2xl border border-purple-200/90 dark:border-purple-900/60 bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm sm:text-base font-extrabold text-[#1e1b4b] dark:text-purple-100">
              أهم المهام الحالية
            </h3>
            <ClipboardList className="h-5 w-5 text-purple-700 dark:text-purple-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-purple-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  <th className="py-1.5 px-2 rounded-r-lg">#</th>
                  <th className="py-1.5 px-2">المهمة</th>
                  <th className="py-1.5 px-2 text-center">المشروع</th>
                  <th className="py-1.5 px-2 rounded-l-lg text-left">
                    نسبة الإنجاز
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-4 text-center text-slate-400 dark:text-slate-500"
                    >
                      لا توجد مهام مطابقة لعبارة البحث الحالية
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const isAmber = task.progress < 50;
                    return (
                      <tr
                        key={task.id}
                        onClick={() =>
                          dispatch(
                            updateTaskProgress({
                              id: task.id,
                              progress:
                                task.progress >= 100 ? 40 : task.progress + 5,
                            })
                          )
                        }
                        title="انقر لتحديث نسبة إنجاز المهمة (+5%)"
                        className="hover:bg-purple-50/50 dark:hover:bg-slate-800/60 transition cursor-pointer"
                      >
                        <td className="py-2 px-2 font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                          {task.id}
                        </td>
                        <td className="py-2 px-2 text-slate-800 dark:text-slate-100 whitespace-nowrap">
                          {task.taskName}
                        </td>
                        <td className="py-2 px-2 text-center font-mono text-slate-700 dark:text-slate-200">
                          {task.project}
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-2.5 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                              <div
                                style={{ width: `${task.progress}%` }}
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isAmber ? 'bg-amber-500' : 'bg-emerald-600'
                                }`}
                              />
                            </div>
                            <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white tabular-nums w-8 text-left">
                              {task.progress}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. بطاقة أبرز الرسومات وأرقام اللوحات (المنتصف - 3 أعمدة) */}
        <div className="print-card lg:col-span-3 rounded-2xl border border-purple-200/90 dark:border-purple-900/60 bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm sm:text-base font-extrabold text-[#1e1b4b] dark:text-purple-100">
              أبرز الرسومات
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => dispatch(setActiveModal('generate_transmittal'))}
                title="توليد مذكرة تسليم رسومات (Transmittal)"
                className="no-print rounded-lg bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 dark:text-amber-300 hover:bg-amber-200 transition cursor-pointer"
              >
                مذكرة تسليم (Transmittal)
              </button>
              <TrendingUp className="h-5 w-5 text-purple-700 dark:text-purple-400" />
            </div>
          </div>

          <div className="space-y-2 text-xs font-bold">
            {/* عرض اللوحات الهندسية الفردية المطابقة لرقم الرسم عند البحث */}
            {matchedSpecificDrawings.map((drw) => (
              <div
                key={drw.id}
                onClick={() => dispatch(setActiveTab('drawings'))}
                className="flex items-center justify-between rounded-lg bg-emerald-50/80 dark:bg-slate-800 px-2 py-1.5 border border-emerald-200/70 dark:border-emerald-800/60 cursor-pointer"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileCode2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span
                    dir="ltr"
                    className="font-mono text-emerald-800 dark:text-emerald-300 shrink-0"
                  >
                    {drw.code}
                  </span>
                  <span className="text-slate-800 dark:text-slate-100 truncate">
                    {drw.title}
                  </span>
                </div>
                <span className="text-[10px] text-purple-700 dark:text-purple-300 shrink-0">
                  {drw.project}
                </span>
              </div>
            ))}

            {/* فئات الرسومات الـ 4 القياسية */}
            {filteredDrawingCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 last:border-none"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Folder className="h-4 w-4 text-amber-500 fill-amber-400 shrink-0" />
                  <span className="text-slate-800 dark:text-slate-100 truncate">
                    {cat.title}
                  </span>
                  <span
                    dir="ltr"
                    className="font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap"
                  >
                    {cat.codeRange}
                  </span>
                </div>
                <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-white tabular-nums pl-1">
                  {cat.count}
                </span>
              </div>
            ))}

            {filteredDrawingCategories.length === 0 &&
              matchedSpecificDrawings.length === 0 && (
                <p className="py-3 text-center text-slate-400 dark:text-slate-500">
                  لا توجد لوحات مطابقة لرقم الرسم المدخل
                </p>
              )}
          </div>
        </div>

        {/* 3. بطاقة آخر الاعتمادات الفنية وأوامر التغيير (أقصى اليسار - 5 أعمدة) */}
        <div className="lg:col-span-5 rounded-2xl border border-purple-200/90 dark:border-purple-900/60 bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm sm:text-base font-extrabold text-[#1e1b4b] dark:text-purple-100">
              آخر الاعتمادات الفنية
            </h3>
            <Award className="h-5 w-5 text-purple-700 dark:text-purple-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-purple-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  <th className="py-1.5 px-2 rounded-r-lg">الحالة</th>
                  <th className="py-1.5 px-2">نوع الاعتماد / الأمر</th>
                  <th className="py-1.5 px-2">المشروع</th>
                  <th className="py-1.5 px-2 rounded-l-lg text-left">
                    التاريخ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                {(searchQuery ? filteredApprovals : filteredApprovals.slice(0, 3)).map(
                  (app) => (
                    <tr
                      key={app.id}
                      onClick={() =>
                        dispatch(
                          updateApprovalStatus({
                            id: app.id,
                            status: cycleStatus(app.status),
                          })
                        )
                      }
                      title="انقر لتغيير حالة الاعتماد"
                      className="hover:bg-purple-50/50 dark:hover:bg-slate-800/60 transition cursor-pointer"
                    >
                      <td className="py-2 px-2 whitespace-nowrap">
                        {app.status === 'معتمد' && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span>معتمد</span>
                          </span>
                        )}
                        {app.status === 'قيد المراجعة' && (
                          <span className="inline-flex items-center gap-1 text-sky-700 dark:text-sky-400">
                            <Hourglass className="h-3.5 w-3.5 text-sky-600" />
                            <span>قيد المراجعة</span>
                          </span>
                        )}
                        {app.status === 'مرفوض' && (
                          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
                            <XCircle className="h-3.5 w-3.5 text-rose-600" />
                            <span>مرفوض</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-slate-800 dark:text-slate-100 whitespace-nowrap">
                        {app.type}
                      </td>
                      <td className="py-2 px-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {app.project}
                      </td>
                      <td
                        dir="ltr"
                        className="py-2 px-2 font-mono text-slate-700 dark:text-slate-300 tabular-nums text-left whitespace-nowrap"
                      >
                        {app.date}
                      </td>
                    </tr>
                  )
                )}

                {/* إظهار أوامر التغيير المطابقة أيضاً عند البحث عن V.O */}
                {matchedVOsForApprovalCard.map((vo) => (
                  <tr
                    key={vo.id}
                    onClick={() => dispatch(setActiveTab('variation_orders'))}
                    className="bg-rose-50/40 dark:bg-slate-800/50 hover:bg-rose-100/50 transition cursor-pointer"
                  >
                    <td className="py-2 px-2 whitespace-nowrap">
                      <span className="text-rose-700 dark:text-rose-400">
                        {vo.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-slate-800 dark:text-slate-100 whitespace-nowrap">
                      [{vo.code}] {vo.title}
                    </td>
                    <td className="py-2 px-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      {vo.project}
                    </td>
                    <td
                      dir="ltr"
                      className="py-2 px-2 font-mono text-slate-700 dark:text-slate-300 tabular-nums text-left whitespace-nowrap"
                    >
                      {vo.date}
                    </td>
                  </tr>
                ))}

                {filteredApprovals.length === 0 &&
                  matchedVOsForApprovalCard.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-4 text-center text-slate-400 dark:text-slate-500"
                      >
                        لا توجد اعتمادات أو أوامر تغيير مطابقة للبحث
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* مكون سجل آخر التعديلات على المستندات الهندسية (الرسومات والاعتمادات) لتعزيز المساءلة */}
      <EngineeringAuditLog />

      {/* شريط أزرار الإجراءات السريعة الـ 7 في أسفل اللوحة (يختفي عند الطباعة المباشرة) */}
      <div className="no-print grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1">
        {actionButtons.map((btn) => {
          const IconComp = btn.icon;
          return (
            <button
              key={btn.id}
              type="button"
              onClick={() => dispatch(setActiveModal(btn.id))}
              className="group flex items-center justify-center gap-2 rounded-2xl border border-purple-300/90 dark:border-purple-800 bg-gradient-to-b from-white to-purple-50/90 dark:from-slate-800 dark:to-slate-900 px-3 py-2.5 text-xs sm:text-[13px] font-extrabold text-[#2e104d] dark:text-purple-100 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-purple-500 hover:shadow-md active:translate-y-0 cursor-pointer whitespace-nowrap"
            >
              <IconComp className="h-4 w-4 text-purple-700 dark:text-purple-400 transition-transform group-hover:scale-110 shrink-0" />
              <span className="truncate">{btn.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
