/**
 * @file components/EngineeringAuditLog.tsx
 * @description مكون سجل التعديلات الأخيرة على المستندات الهندسية (الرسومات الهندسية والاعتمادات الفنية) مع عرض اسم المهندس/المستخدم وتاريخ التغيير لتعزيز المساءلة والشفافية
 */

import React, { useMemo, useState } from 'react';
import {
  History,
  FileCode2,
  BadgeCheck,
  UserCheck,
  Clock,
  ArrowUpLeft,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { setActiveTab } from '../store/slices/dashboardSlice';
import { AuditDocumentType } from '../types/dashboard';

export const EngineeringAuditLog: React.FC = () => {
  const dispatch = useAppDispatch();
  const { auditLogs, filters } = useAppSelector((s) => s.dashboard);

  const [docTypeFilter, setDocTypeFilter] = useState<'all' | AuditDocumentType>(
    'all'
  );

  const searchQuery = filters.searchQuery.trim().toLowerCase();

  // تصفية سجل التعديلات الهندسية بناءً على نوع المستند والفلاتر العلوية وشريط البحث الذكي
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((entry) => {
      if (docTypeFilter !== 'all' && entry.documentType !== docTypeFilter) {
        return false;
      }
      if (
        filters.project !== 'جميع المشروعات' &&
        !entry.project.includes(filters.project.replace('مشروع ', ''))
      ) {
        return false;
      }
      if (
        filters.discipline !== 'الكل' &&
        entry.discipline !== filters.discipline
      ) {
        return false;
      }
      if (searchQuery) {
        const matchesSearch =
          entry.documentCode.toLowerCase().includes(searchQuery) ||
          entry.documentTitle.toLowerCase().includes(searchQuery) ||
          entry.modifiedBy.toLowerCase().includes(searchQuery) ||
          entry.project.toLowerCase().includes(searchQuery) ||
          entry.action.toLowerCase().includes(searchQuery);
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [auditLogs, docTypeFilter, filters, searchQuery]);

  return (
    <div className="print-card rounded-2xl border border-purple-200/90 dark:border-purple-900/60 bg-white/95 dark:bg-slate-900/95 p-4 shadow-sm">
      {/* رأس مكون سجل التعديلات والمساءلة الهندسية */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-[#1e1b4b] dark:text-purple-100">
              سجل آخر التعديلات على المستندات الهندسية (الرسومات والاعتمادات الفنية)
            </h3>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              توثيق فوري لعمليات الرفع والمراجعة وتحديث الحالات مع اسم المستخدم وتاريخ التغيير لتعزيز المساءلة
            </p>
          </div>
        </div>

        {/* أزرار التصفية السريعة حسب نوع المستند (الكل / رسومات هندسية / اعتمادات فنية) */}
        <div className="no-print flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setDocTypeFilter('all')}
            className={`rounded-lg px-3 py-1 transition cursor-pointer whitespace-nowrap ${
              docTypeFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-purple-900 dark:text-purple-200 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            الكل ({auditLogs.length})
          </button>
          <button
            type="button"
            onClick={() => setDocTypeFilter('رسم هندسي')}
            className={`rounded-lg px-3 py-1 transition cursor-pointer whitespace-nowrap ${
              docTypeFilter === 'رسم هندسي'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            الرسومات الهندسية
          </button>
          <button
            type="button"
            onClick={() => setDocTypeFilter('اعتماد فني')}
            className={`rounded-lg px-3 py-1 transition cursor-pointer whitespace-nowrap ${
              docTypeFilter === 'اعتماد فني'
                ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            الاعتمادات الفنية
          </button>
        </div>
      </div>

      {/* جدول سجل التعديلات والمساءلة */}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="bg-purple-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
              <th className="py-2 px-3 rounded-r-xl">نوع المستند والكود</th>
              <th className="py-2 px-3">بيان المستند الهندسي</th>
              <th className="py-2 px-3">المشروع والتخصص</th>
              <th className="py-2 px-3">الإجراء المنفذ</th>
              <th className="py-2 px-3">قام بالتعديل (المسؤول)</th>
              <th className="py-2 px-3">الإصدار / الحالة</th>
              <th className="py-2 px-3 rounded-l-xl text-left">
                تاريخ ووقت التغيير
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
            {filteredAuditLogs.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-6 text-center text-slate-400 dark:text-slate-500"
                >
                  لا توجد سجلات تعديل مطابقة لمعايير التصفية الحالية
                </td>
              </tr>
            ) : (
              filteredAuditLogs.slice(0, 8).map((log) => {
                const isDrawing = log.documentType === 'رسم هندسي';
                return (
                  <tr
                    key={log.id}
                    onClick={() =>
                      dispatch(
                        setActiveTab(isDrawing ? 'drawings' : 'approvals')
                      )
                    }
                    title="انقر للانتقال إلى سجل المستند الهندسي"
                    className="group hover:bg-purple-50/50 dark:hover:bg-slate-800/60 transition cursor-pointer"
                  >
                    {/* نوع المستند والكود */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {isDrawing ? (
                          <FileCode2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <BadgeCheck className="h-4 w-4 text-purple-700 dark:text-purple-400 shrink-0" />
                        )}
                        <div>
                          <span className="text-slate-800 dark:text-slate-200 block">
                            {log.documentType}
                          </span>
                          <span
                            dir="ltr"
                            className="font-mono text-[11px] text-purple-800 dark:text-purple-300"
                          >
                            {log.documentCode}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* بيان المستند */}
                    <td className="py-2.5 px-3 text-slate-900 dark:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{log.documentTitle}</span>
                        <ArrowUpLeft className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                    </td>

                    {/* المشروع والتخصص */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-slate-800 dark:text-slate-200">
                        {log.project}
                      </span>
                      <span className="mx-1.5 text-slate-400">·</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {log.discipline}
                      </span>
                    </td>

                    {/* الإجراء المنفذ */}
                    <td className="py-2.5 px-3 whitespace-nowrap text-purple-900 dark:text-purple-300">
                      {log.action}
                    </td>

                    {/* اسم المستخدم الذي قام بالتعديل والدور الوظيفي */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                          <span className="text-slate-900 dark:text-white block">
                            {log.modifiedBy}
                          </span>
                          <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                            {log.userRole}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* الإصدار أو الحالة */}
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-emerald-700 dark:text-emerald-400">
                      {log.revisionOrStatus}
                    </td>

                    {/* تاريخ ووقت التغيير */}
                    <td
                      dir="ltr"
                      className="py-2.5 px-3 whitespace-nowrap text-left font-mono text-slate-600 dark:text-slate-300 tabular-nums"
                    >
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{log.modifiedAt}</span>
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
