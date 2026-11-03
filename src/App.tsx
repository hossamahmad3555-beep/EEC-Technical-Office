/**
 * @file App.tsx
 * @description المكون الرئيسي للوحة تحكم المكتب الفني - الشركة المصرية الهندسية للمقاولات (EEC)
 * يدعم الوضع الفاتح والداكن، الحفظ التلقائي عبر Redux Toolkit، التصدير الفوري إلى PDF و Excel، والانتقالات السلسة عبر Framer Motion
 */

import React, { useRef, useState } from 'react';
import { Provider } from 'react-redux';
import { AnimatePresence, motion } from 'motion/react';
import {
  Layers,
  ChevronDown,
  Folder,
  FileCode2,
  Calculator,
  Receipt,
  ArrowLeftRight,
  BadgeCheck,
  Boxes,
  FileSpreadsheet,
  FileDown,
  Loader2,
  Printer,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { store, useAppDispatch, useAppSelector } from './store';
import { setActiveTab, setFilter, resetFilters } from './store/slices/dashboardSlice';
import { HeaderBanner } from './components/HeaderBanner';
import { SidebarNav, NAV_ITEMS } from './components/SidebarNav';
import { DashboardCharts } from './components/DashboardCharts';
import { DashboardTablesAndActions } from './components/DashboardTablesAndActions';
import { ActionModals } from './components/ActionModals';
import { SubModuleViews } from './components/SubModuleViews';
import { SmartSearchBar } from './components/SmartSearchBar';
import { TabId } from './types/dashboard';
import {
  exportDashboardToExcel,
  exportElementToPdf,
} from './utils/exportService';

const DashboardWorkspace: React.FC = () => {
  const dispatch = useAppDispatch();
  const dashboardState = useAppSelector((s) => s.dashboard);
  const { activeTab, filters, baseKpis } = dashboardState;

  const workspaceCaptureRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // معامل تصفية فوري لتحديث الأرقام عند تغيير الفلاتر
  const filterMultiplier =
    filters.project !== 'جميع المشروعات'
      ? 0.28
      : filters.year === '2025'
      ? 0.65
      : 1;

  // التحقق من تفعيل فلاتر مخصصة بخلاف القيم الافتراضية
  const isCustomFilterActive =
    filters.year !== '2026' ||
    filters.project !== 'جميع المشروعات' ||
    filters.owner !== 'الكل' ||
    filters.discipline !== 'الكل' ||
    filters.status !== 'الكل';

  const activeFiltersCount = [
    filters.year !== '2026',
    filters.project !== 'جميع المشروعات',
    filters.owner !== 'الكل',
    filters.discipline !== 'الكل',
    filters.status !== 'الكل',
  ].filter(Boolean).length;

  const handleExportDashboardPdf = async () => {
    if (!workspaceCaptureRef.current || isExportingPdf) return;
    try {
      setIsExportingPdf(true);
      await exportElementToPdf(
        workspaceCaptureRef.current,
        `لوحة_تحكم_المكتب_الفني_EEC_${filters.year}`
      );
    } finally {
      setIsExportingPdf(false);
    }
  };

  // بطاقات المؤشرات الـ 7 العلوية بترتيبها المطابق للصورة المرجعية
  const kpiCards: {
    id: string;
    title: string;
    value: string | number;
    subtitle?: string;
    targetTab: TabId;
    icon: React.FC<{ className?: string }>;
    iconBg: string;
    iconColor: string;
  }[] = [
    {
      id: 'value',
      title: 'قيمة المشروعات',
      value: Math.round(
        baseKpis.totalValueMillion * filterMultiplier
      ).toLocaleString('en-US'),
      subtitle: 'مليون ج.م',
      targetTab: 'projects',
      icon: Boxes,
      iconBg: 'bg-amber-100/90 dark:bg-amber-950/70',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      id: 'approvals',
      title: 'الإعتمادات الفنية',
      value: Math.max(
        1,
        Math.round(baseKpis.totalApprovals * filterMultiplier)
      ),
      targetTab: 'approvals',
      icon: BadgeCheck,
      iconBg: 'bg-emerald-100/90 dark:bg-emerald-950/70',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'vo',
      title: 'أوامر (V.O)',
      value: Math.max(
        1,
        Math.round(baseKpis.totalVariationOrders * filterMultiplier)
      ),
      targetTab: 'variation_orders',
      icon: ArrowLeftRight,
      iconBg: 'bg-rose-100/90 dark:bg-rose-950/70',
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
    {
      id: 'invoices',
      title: 'المستخلصات',
      value: Math.max(1, Math.round(baseKpis.totalInvoices * filterMultiplier)),
      targetTab: 'invoices',
      icon: Receipt,
      iconBg: 'bg-purple-100/90 dark:bg-purple-950/70',
      iconColor: 'text-purple-700 dark:text-purple-400',
    },
    {
      id: 'estimates',
      title: 'المقايسات',
      value: Math.max(
        1,
        Math.round(baseKpis.totalEstimates * filterMultiplier)
      ),
      targetTab: 'tenders',
      icon: Calculator,
      iconBg: 'bg-red-100/90 dark:bg-red-950/70',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    {
      id: 'drawings',
      title: 'الرسومات',
      value: Math.max(
        10,
        Math.round(baseKpis.totalDrawings * filterMultiplier)
      ),
      targetTab: 'drawings',
      icon: FileCode2,
      iconBg: 'bg-green-100/90 dark:bg-green-950/70',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      id: 'projects',
      title: 'إجمالي المشروعات',
      value:
        filters.project !== 'جميع المشروعات'
          ? 1
          : Math.max(1, Math.round(baseKpis.totalProjects * filterMultiplier)),
      targetTab: 'projects',
      icon: Folder,
      iconBg: 'bg-purple-100/90 dark:bg-purple-950/70',
      iconColor: 'text-purple-700 dark:text-purple-400',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#e6dff7] dark:bg-[#0d0717] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      {/* البانر العلوي البانورامي للشركة المصرية الهندسية للمقاولات */}
      <HeaderBanner />

      {/* حاوية العمل السفلية: القائمة الجانبية على اليسار + مساحة لوحة التحكم الرئيسية على اليمين */}
      <div className="flex flex-1 flex-col lg:flex-row-reverse">
        {/* القائمة الجانبية */}
        <SidebarNav />

        {/* مساحة العمل الرئيسية */}
        <main className="flex-1 p-3 sm:p-4 overflow-x-hidden">
          <div
            ref={workspaceCaptureRef}
            className="print-workspace-container mx-auto max-w-[1600px] rounded-3xl border border-purple-300/80 dark:border-purple-900/50 bg-gradient-to-b from-[#f3effd] via-[#ece5fc] to-[#e4dbfa] dark:from-[#150c28] dark:via-[#120a21] dark:to-[#0f081d] p-3.5 sm:p-4 shadow-inner"
          >
            {/* ترويسة رسمية مخصصة للطباعة فقط (تظهر عند استدعاء window.print()) */}
            <div className="print-only-header hidden items-center justify-between border-b-2 border-purple-900 pb-3 mb-4">
              <div>
                <h1 className="text-lg font-extrabold text-slate-900">
                  الشركة المصرية الهندسية للمقاولات (EEC) - إدارة المكتب الفني
                </h1>
                <p className="text-xs font-bold text-slate-600">
                  تقرير مطبوع:{' '}
                  {NAV_ITEMS.find((n) => n.id === activeTab)?.label ||
                    'لوحة تحكم المكتب الفني'}{' '}
                  · السنة المالية: {filters.year} · نطاق المشروعات:{' '}
                  {filters.project} · التخصص: {filters.discipline}
                </p>
              </div>
              <div className="text-left font-mono text-xs font-bold text-slate-700">
                <div>تاريخ الطباعة: {new Date().toISOString().slice(0, 10)}</div>
                <div>Technical Office Report</div>
              </div>
            </div>

            {/* شريط العنوان والفلاتر الـ 5 العلوية + أزرار الطباعة والتصدير السريع (يختفي شريط التحكم عند الطباعة) */}
            <div className="no-print mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
              {/* الفلاتر الـ 5 (تظهر على اليمين في RTL) */}
              <div className="flex flex-wrap items-center gap-2">
                {/* 1. السنة */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-extrabold text-[#1e1b4b] dark:text-purple-200">
                    السنة
                  </span>
                  <div className="relative">
                    <select
                      aria-label="السنة"
                      value={filters.year}
                      onChange={(e) =>
                        dispatch(
                          setFilter({ key: 'year', value: e.target.value })
                        )
                      }
                      className="appearance-none rounded-full border border-purple-300 dark:border-purple-800 bg-white dark:bg-slate-900 pr-3.5 pl-7 py-1 text-xs font-extrabold text-slate-800 dark:text-slate-100 shadow-xs focus:border-purple-600 focus:outline-none cursor-pointer font-mono tabular-nums"
                    >
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-purple-700 dark:text-purple-400" />
                  </div>
                </div>

                {/* 2. جميع المشروعات */}
                <div className="relative">
                  <select
                    aria-label="المشروع"
                    value={filters.project}
                    onChange={(e) =>
                      dispatch(
                        setFilter({ key: 'project', value: e.target.value })
                      )
                    }
                    className="appearance-none rounded-full border border-purple-300 dark:border-purple-800 bg-white dark:bg-slate-900 pr-3.5 pl-7 py-1 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-xs focus:border-purple-600 focus:outline-none cursor-pointer"
                  >
                    <option value="جميع المشروعات">جميع المشروعات</option>
                    <option value="مشروع ABC">مشروع ABC</option>
                    <option value="مشروع Delta">مشروع Delta</option>
                    <option value="مشروع Nile">مشروع Nile</option>
                    <option value="مشروع Capital">مشروع Capital</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-purple-700 dark:text-purple-400" />
                </div>

                {/* 3. المالك */}
                <div className="relative">
                  <select
                    aria-label="المالك"
                    value={filters.owner}
                    onChange={(e) =>
                      dispatch(
                        setFilter({ key: 'owner', value: e.target.value })
                      )
                    }
                    className="appearance-none rounded-full border border-purple-300 dark:border-purple-800 bg-white dark:bg-slate-900 pr-3.5 pl-7 py-1 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-xs focus:border-purple-600 focus:outline-none cursor-pointer"
                  >
                    <option value="الكل">المالك</option>
                    <option value="هيئة المجتمعات العمرانية">
                      هيئة المجتمعات العمرانية
                    </option>
                    <option value="شركة دلتا للتطوير العقاري">
                      شركة دلتا للتطوير
                    </option>
                    <option value="المجموعة الوطنية للاستثمار">
                      المجموعة الوطنية
                    </option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-purple-700 dark:text-purple-400" />
                </div>

                {/* 4. التخصص */}
                <div className="relative">
                  <select
                    aria-label="التخصص"
                    value={filters.discipline}
                    onChange={(e) =>
                      dispatch(
                        setFilter({ key: 'discipline', value: e.target.value })
                      )
                    }
                    className="appearance-none rounded-full border border-purple-300 dark:border-purple-800 bg-white dark:bg-slate-900 pr-3.5 pl-7 py-1 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-xs focus:border-purple-600 focus:outline-none cursor-pointer"
                  >
                    <option value="الكل">التخصص</option>
                    <option value="إنشائي">إنشائي</option>
                    <option value="معماري">معماري</option>
                    <option value="كهرباء">كهرباء</option>
                    <option value="ميكانيكا">ميكانيكا</option>
                    <option value="تشطيبات">تشطيبات</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-purple-700 dark:text-purple-400" />
                </div>

                {/* 5. حالة المشروع */}
                <div className="relative">
                  <select
                    aria-label="حالة المشروع"
                    value={filters.status}
                    onChange={(e) =>
                      dispatch(
                        setFilter({ key: 'status', value: e.target.value })
                      )
                    }
                    className="appearance-none rounded-full border border-purple-300 dark:border-purple-800 bg-white dark:bg-slate-900 pr-3.5 pl-7 py-1 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-xs focus:border-purple-600 focus:outline-none cursor-pointer"
                  >
                    <option value="الكل">حالة المشروع</option>
                    <option value="قيد التنفيذ">قيد التنفيذ</option>
                    <option value="منجز">منجز</option>
                    <option value="متأخر">متأخر</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-purple-700 dark:text-purple-400" />
                </div>

                {/* شارة حالة حفظ الفلاتر في LocalStorage وزر إعادة الضبط السريع */}
                <div className="flex items-center gap-1.5 mr-1">
                  {isCustomFilterActive && (
                    <button
                      type="button"
                      onClick={() => dispatch(resetFilters())}
                      title="إعادة ضبط كافة الفلاتر للقيم الافتراضية وحفظها في التخزين المحلي"
                      className="flex items-center gap-1 rounded-full border border-purple-300 dark:border-purple-700 bg-purple-100/90 dark:bg-purple-950/80 hover:bg-purple-200 dark:hover:bg-purple-900 px-2.5 py-1 text-[11px] font-bold text-purple-900 dark:text-purple-200 shadow-xs transition cursor-pointer whitespace-nowrap"
                    >
                      <RotateCcw className="h-3 w-3 shrink-0" />
                      <span>إعادة ضبط ({activeFiltersCount})</span>
                    </button>
                  )}

                  <div
                    title="تفضيلات الفلاتر الحالية (السنة، المشروع، المالك، التخصص، الحالة) يتم حفظها تلقائياً في التخزين المحلي (LocalStorage) وتستعاد عند تحديث الصفحة"
                    className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50/80 dark:bg-purple-950/50 border border-purple-200/80 dark:border-purple-800/80 rounded-full px-2.5 py-1 whitespace-nowrap select-none"
                  >
                    <SlidersHorizontal className="h-3 w-3 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span className="hidden sm:inline">حفظ تلقائي للفلاتر</span>
                    <span className="sm:hidden">محفوظة</span>
                  </div>
                </div>
              </div>

              {/* المنطقة اليسرى: شريط البحث الذكي الفوري + زر الطباعة المباشرة + أزرار تصدير التقارير الدورية + عنوان لوحة تحكم المكتب الفني */}
              <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto justify-between xl:justify-end">
                {/* شريط البحث الذكي عبر المشروعات وأوامر التغيير وأرقام الرسومات */}
                <SmartSearchBar />

                <div className="flex items-center gap-1.5">
                  {/* زر الطباعة المباشرة لبطاقات المؤشرات والجداول المفتوحة حالياً */}
                  <button
                    type="button"
                    onClick={() => window.print()}
                    title="طباعة مباشرة لبطاقات المؤشرات (KPIs) والجداول المفتوحة حالياً"
                    className="flex items-center gap-1.5 rounded-full border border-purple-300 dark:border-purple-700 bg-purple-100/90 dark:bg-purple-950/80 hover:bg-purple-700 hover:text-white dark:hover:bg-purple-700 px-3 py-1 text-xs font-extrabold text-purple-900 dark:text-purple-200 shadow-xs transition cursor-pointer whitespace-nowrap"
                  >
                    <Printer className="h-3.5 w-3.5 shrink-0" />
                    <span>طباعة مباشرة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportDashboardToExcel(dashboardState)}
                    title="تصدير بيانات المؤشرات والجداول الحالية إلى ملف Excel (.xlsx)"
                    className="flex items-center gap-1.5 rounded-full border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-700 px-3 py-1 text-xs font-extrabold text-emerald-800 dark:text-emerald-200 shadow-xs transition cursor-pointer whitespace-nowrap"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 shrink-0" />
                    <span>تصدير Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportDashboardPdf}
                    disabled={isExportingPdf}
                    title="تصدير لوحة المؤشرات والجداول الحالية إلى ملف PDF"
                    className="flex items-center gap-1.5 rounded-full border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/70 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-700 disabled:opacity-60 px-3 py-1 text-xs font-extrabold text-rose-800 dark:text-rose-200 shadow-xs transition cursor-pointer whitespace-nowrap"
                  >
                    {isExportingPdf ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                    ) : (
                      <FileDown className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span>تصدير PDF</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#1e1b4b] dark:text-purple-100">
                    لوحة تحكم المكتب الفني
                  </h2>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-700/15 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300">
                    <Layers className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* انتقالات سلسة بين الصفحات والتبويبات باستخدام Framer Motion */}
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' ? (
                <motion.div
                  key="main-dashboard"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="space-y-3"
                >
                  {/* شريط بطاقات المؤشرات الرئيسية الـ 7 */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2.5">
                    {kpiCards.map((card) => {
                      const IconComp = card.icon;
                      return (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => dispatch(setActiveTab(card.targetTab))}
                          className="print-card group flex items-center justify-between rounded-2xl border border-purple-200/90 dark:border-purple-900/60 bg-white/95 dark:bg-slate-900/95 p-3 text-right shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:border-purple-400 hover:shadow-md cursor-pointer"
                        >
                          {/* الأرقام والعنوان على اليمين */}
                          <div className="flex flex-col items-center sm:items-start flex-1 min-w-0">
                            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 truncate w-full text-center">
                              {card.title}
                            </span>
                            <span className="mt-1 font-mono text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white tabular-nums leading-none w-full text-center">
                              {card.value}
                            </span>
                            {card.subtitle && (
                              <span className="mt-0.5 text-[11px] font-extrabold text-slate-700 dark:text-slate-300 w-full text-center">
                                {card.subtitle}
                              </span>
                            )}
                          </div>

                          {/* الدائرة اللونية للأيقونة على اليسار */}
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${card.iconBg} ${card.iconColor} transition-transform group-hover:scale-105`}
                          >
                            <IconComp className="h-5 w-5" />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* صفوف المخططات البيانية الـ 6 */}
                  <DashboardCharts />

                  {/* الجداول الـ 3 السفلية + شريط الأزرار الـ 7 */}
                  <DashboardTablesAndActions />
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <SubModuleViews />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* النوافذ المنبثقة التفاعلية للأزرار السفلية */}
      <ActionModals />
    </div>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <DashboardWorkspace />
    </Provider>
  );
}
