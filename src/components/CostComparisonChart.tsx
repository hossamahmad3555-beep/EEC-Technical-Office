/**
 * @file components/CostComparisonChart.tsx
 * @description مخطط بياني تفاعلي باستخدام مكتبة Recharts للمقارنة بين التكلفة التقديرية للمقايسات والتكلفة الفعلية المنفذة،
 * مع إمكانية التبديل الفوري بين عرض القيمة المالية (مليون ج.م) أو النسبة المئوية (%)، وتعدد أنماط الرسم البياني.
 */

import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
  LabelList,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  ArrowUpLeft,
  ArrowDownRight,
  Layers,
  Percent,
  Coins,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAppSelector } from '../store';

export type CostDisplayUnit = 'financial' | 'percentage';
export type ChartStyleMode = 'bar' | 'composed';

interface ProjectCostComparisonDatum {
  id: string;
  projectName: string;
  shortName: string;
  discipline: string;
  // القيم المالية (بالمليون ج.م)
  estimatedCost: number; // التكلفة التقديرية (المقايسات) - مليون ج.م
  actualCost: number; // التكلفة الفعلية المنفذة (المستخلصات) - مليون ج.م
  variance: number; // الوفر أو المتبقي من المقايسة - مليون ج.م
  // النسب المئوية (%)
  estimatedPercent: number; // النسبة المرجعية للمقايسة التقديرية (100%)
  actualPercent: number; // نسبة التكلفة الفعلية المنفذة من المقايسة (%)
  remainingPercent: number; // النسبة المتبقية من المقايسة (%)
  projectWeightPercent: number; // الوزن النسبي لمقايسة المشروع من إجمالي مقايسات الشركة (%)
  disbursementRatio: number; // مرادف لنسبة الصرف الفعلي (%)
}

export const CostComparisonChart: React.FC = () => {
  const {
    projects,
    estimatesList,
    invoicesList,
    darkMode,
    filters,
  } = useAppSelector((s) => s.dashboard);

  // حالة التبديل بين القيمة المالية (مليون ج.م) والنسبة المئوية (%)
  const [displayUnit, setDisplayUnit] = useState<CostDisplayUnit>('financial');
  // حالة التبديل بين الأعمدة المزدوجة والمخطط المركب
  const [chartMode, setChartMode] = useState<ChartStyleMode>('bar');
  // حالة إظهار أو إخفاء الأرقام فوق الأعمدة مباشرة
  const [showDataLabels, setShowDataLabels] = useState<boolean>(true);
  // المشروع المحدد للتركيز البصري عند النقر
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  // بناء مصفوفة البيانات المجمعة لكل مشروع من حالة Redux (المشروعات + المقايسات + المستخلصات)
  const chartData = useMemo<ProjectCostComparisonDatum[]>(() => {
    const filteredProjects = projects.filter((p) => {
      if (
        filters.project !== 'جميع المشروعات' &&
        !p.name.includes(filters.project.replace('مشروع ', ''))
      ) {
        return false;
      }
      if (filters.discipline !== 'الكل' && p.discipline !== filters.discipline) {
        return false;
      }
      if (filters.year !== '2026' && p.year !== filters.year) {
        return false;
      }
      if (filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.trim().toLowerCase();
        const matchesProj =
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.owner.toLowerCase().includes(q) ||
          p.discipline.toLowerCase().includes(q);
        if (!matchesProj) return false;
      }
      return true;
    });

    const sourceProjects =
      filteredProjects.length > 0 ? filteredProjects : projects;

    // أولاً نحسب التكاليف المالية لكل مشروع
    const rawItems = sourceProjects.map((proj) => {
      const shortMatch = proj.name.match(/مشروع\s+[A-Za-z0-9\u0600-\u06FF]+/);
      const shortName = shortMatch ? shortMatch[0] : proj.name;

      // جمع المقايسات المضافة لهذا المشروع إن وجدت، أو استخدام القيمة التعاقدية/التقديرية للمشروع
      const extraEstimates = estimatesList
        .filter((e) => proj.name.includes(e.project.replace('مشروع ', '')))
        .reduce((acc, item) => acc + item.estimatedMillion, 0);

      // جمع المستخلصات المضافة لهذا المشروع
      const extraInvoices = invoicesList
        .filter((inv) => proj.name.includes(inv.project.replace('مشروع ', '')))
        .reduce((acc, item) => acc + item.amountMillion, 0);

      const estimatedCost = Number(
        Math.max(proj.valueMillion, extraEstimates).toFixed(1)
      );

      const actualCost = Number(
        Math.max(proj.disbursedMillion, extraInvoices).toFixed(1)
      );

      const variance = Number((estimatedCost - actualCost).toFixed(1));
      const actualPercent =
        estimatedCost > 0
          ? Number(((actualCost / estimatedCost) * 100).toFixed(1))
          : 0;
      const remainingPercent = Number(
        Math.max(0, 100 - actualPercent).toFixed(1)
      );

      return {
        id: proj.id,
        projectName: proj.name,
        shortName,
        discipline: proj.discipline,
        estimatedCost,
        actualCost,
        variance,
        estimatedPercent: 100,
        actualPercent,
        remainingPercent,
        disbursementRatio: actualPercent,
      };
    });

    const grandTotalEstimated = rawItems.reduce(
      (sum, item) => sum + item.estimatedCost,
      0
    );

    return rawItems.map((item) => ({
      ...item,
      projectWeightPercent:
        grandTotalEstimated > 0
          ? Number(((item.estimatedCost / grandTotalEstimated) * 100).toFixed(1))
          : 0,
    }));
  }, [projects, estimatesList, invoicesList, filters]);

  // إجماليات المقارنة لجميع المشروعات المعروضة
  const totals = useMemo(() => {
    const totalEstimated = chartData.reduce(
      (sum, d) => sum + d.estimatedCost,
      0
    );
    const totalActual = chartData.reduce((sum, d) => sum + d.actualCost, 0);
    const totalVariance = Number((totalEstimated - totalActual).toFixed(1));
    const avgRatio =
      totalEstimated > 0
        ? Number(((totalActual / totalEstimated) * 100).toFixed(1))
        : 0;
    const remainingRatio = Number(Math.max(0, 100 - avgRatio).toFixed(1));

    return {
      totalEstimated: Number(totalEstimated.toFixed(1)),
      totalActual: Number(totalActual.toFixed(1)),
      totalVariance,
      avgRatio,
      remainingRatio,
    };
  }, [chartData]);

  // مفاتيح البيانات الديناميكية حسب وضع العرض (مالي أو نسبة مئوية)
  const estimatedDataKey =
    displayUnit === 'financial' ? 'estimatedCost' : 'estimatedPercent';
  const actualDataKey =
    displayUnit === 'financial' ? 'actualCost' : 'actualPercent';
  const yAxisUnit = displayUnit === 'financial' ? ' م.ج' : '%';

  // ألوان متوافقة مع الوضعين الفاتح والداكن وهوية EEC
  const axisTextColor = darkMode ? '#cbd5e1' : '#334155';
  const gridStrokeColor = darkMode ? '#1e293b' : '#e2e8f0';
  const estimatedColor = '#7e22ce'; // بنفسجي ملكي للتكلفة التقديرية (المقايسات)
  const actualColor = '#10b981'; // أخضر زمردي للتكلفة الفعلية المنفذة

  // تنسيق القيم فوق الأعمدة
  const formatBarLabel = (val: unknown) => {
    const num = Number(val);
    if (Number.isNaN(num)) return '';
    return displayUnit === 'financial' ? `${num.toFixed(0)}` : `${num.toFixed(1)}%`;
  };

  // تخصيص نافذة التلميح التفاعلية (Custom Arabic Tooltip) تعرض القيمة المالية والنسبة المئوية معاً
  const renderCustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: ProjectCostComparisonDatum }>;
  }) => {
    if (!active || !payload || payload.length === 0) return null;
    const data = payload[0].payload;

    return (
      <div
        dir="rtl"
        className="min-w-[265px] rounded-2xl border border-purple-200 dark:border-purple-800 bg-white/98 dark:bg-slate-900/98 p-3.5 shadow-xl text-right text-xs"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2.5 gap-2">
          <span className="font-extrabold text-[#1e1b4b] dark:text-purple-200 truncate">
            {data.projectName}
          </span>
          <span className="rounded-lg bg-purple-100 dark:bg-purple-950/90 px-2 py-0.5 text-[10px] font-extrabold text-purple-800 dark:text-purple-300 shrink-0">
            {data.discipline}
          </span>
        </div>

        <div className="space-y-2 font-bold">
          {/* التكلفة التقديرية للمقايسات */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="h-2.5 w-2.5 rounded-xs bg-purple-700 inline-block" />
              التكلفة التقديرية (المقايسات):
            </span>
            <span className="font-mono text-purple-800 dark:text-purple-300 tabular-nums">
              {data.estimatedCost.toLocaleString('en-US', {
                minimumFractionDigits: 1,
              })}{' '}
              م.ج (100%)
            </span>
          </div>

          {/* التكلفة الفعلية المنفذة */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500 inline-block" />
              التكلفة الفعلية المنفذة:
            </span>
            <span className="font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
              {data.actualCost.toLocaleString('en-US', {
                minimumFractionDigits: 1,
              })}{' '}
              م.ج ({data.actualPercent}%)
            </span>
          </div>

          {/* شريط تقدم بصري لنسبة التنفيذ المالي داخل التلميح */}
          <div className="pt-1">
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${Math.min(100, data.actualPercent)}%` }}
                className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-purple-600"
              />
            </div>
          </div>

          {/* المتبقي والفارق */}
          <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">
              المتبقي من المقايسة:
            </span>
            <span className="font-mono text-amber-600 dark:text-amber-400 tabular-nums">
              {data.variance.toLocaleString('en-US', {
                minimumFractionDigits: 1,
              })}{' '}
              م.ج ({data.remainingPercent}%)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">
              الوزن النسبي من إجمالي المقايسات:
            </span>
            <span className="font-mono text-slate-800 dark:text-slate-200 tabular-nums">
              {data.projectWeightPercent}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="print-card rounded-2xl border border-purple-200/90 dark:border-purple-900/60 bg-white/95 dark:bg-slate-900/95 p-4 shadow-sm">
      {/* رأس المخطط: العنوان + أزرار التبديل بين القيمة المالية والنسبة المئوية + أنماط المخطط */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 shrink-0">
            {displayUnit === 'financial' ? (
              <Coins className="h-5 w-5" />
            ) : (
              <Percent className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-[#1e1b4b] dark:text-purple-100">
                مقارنة التكلفة التقديرية للمقايسات والتكلفة الفعلية المنفذة
              </h3>
              <span className="rounded-lg bg-purple-100 dark:bg-purple-950/80 px-2.5 py-0.5 text-[11px] font-extrabold text-purple-800 dark:text-purple-300">
                {displayUnit === 'financial'
                  ? 'عرض القيمة المالية (مليون ج.م)'
                  : 'عرض النسبة المئوية (%)'}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {displayUnit === 'financial'
                ? 'تحليل تفاعلي للمقايسات التقديرية المعتمدة مقابل المستخلصات الفعلية المنفذة بالمليون جنيه مصري (م.ج)'
                : 'مقارنة النسبة المئوية للتنفيذ الفعلي والمنصرف مقابل الموازنة التقديرية المعتمدة للمقايسة (100%)'}
            </p>
          </div>
        </div>

        {/* أدوات التحكم: التبديل بين القيمة المالية والنسبة المئوية + نمط المخطط */}
        <div className="no-print flex flex-wrap items-center gap-2">
          {/* مفتاح التبديل الأساسي: القيمة المالية | النسبة المئوية */}
          <div
            role="group"
            aria-label="تبديل وحدة العرض بين القيمة المالية والنسبة المئوية"
            className="flex items-center gap-1 rounded-xl bg-purple-100/80 dark:bg-slate-800 p-1 border border-purple-200/80 dark:border-slate-700"
          >
            <button
              type="button"
              onClick={() => setDisplayUnit('financial')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
                displayUnit === 'financial'
                  ? 'bg-purple-800 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-purple-900 dark:hover:text-white'
              }`}
            >
              <Coins className="h-3.5 w-3.5" />
              <span>القيمة المالية (م.ج)</span>
            </button>
            <button
              type="button"
              onClick={() => setDisplayUnit('percentage')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
                displayUnit === 'percentage'
                  ? 'bg-purple-800 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-purple-900 dark:hover:text-white'
              }`}
            >
              <Percent className="h-3.5 w-3.5" />
              <span>النسبة المئوية (%)</span>
            </button>
          </div>

          {/* أزرار تبديل نمط مخطط Recharts */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/70 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setChartMode('bar')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                chartMode === 'bar'
                  ? 'bg-white dark:bg-slate-900 text-purple-900 dark:text-purple-200 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>أعمدة مزدوجة</span>
            </button>
            <button
              type="button"
              onClick={() => setChartMode('composed')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                chartMode === 'composed'
                  ? 'bg-white dark:bg-slate-900 text-purple-900 dark:text-purple-200 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>مخطط مركب</span>
            </button>
          </div>

          {/* زر إظهار/إخفاء القيم على الأعمدة */}
          <button
            type="button"
            onClick={() => setShowDataLabels((prev) => !prev)}
            title="إظهار أو إخفاء الأرقام فوق الأعمدة"
            className={`flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${
              showDataLabels
                ? 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {showDataLabels ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">القيم</span>
          </button>
        </div>
      </div>

      {/* شريط المؤشرات الإجمالية المتغير حسب وضع العرض (مالي أو نسبة مئوية) */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-purple-50/70 dark:bg-slate-800/80 px-3.5 py-2 border border-purple-100 dark:border-slate-700 text-xs font-bold">
        <div className="flex flex-wrap items-center gap-4">
          {/* البند الأول: المقايسات التقديرية */}
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-purple-700 inline-block" />
            <span className="text-slate-600 dark:text-slate-300">
              {displayUnit === 'financial'
                ? 'إجمالي التكلفة التقديرية (المقايسات):'
                : 'المعيار المرجعي للمقايسات المعتمدة:'}
            </span>
            <span className="font-mono text-purple-900 dark:text-purple-200 font-extrabold tabular-nums">
              {displayUnit === 'financial'
                ? `${totals.totalEstimated.toLocaleString('en-US', {
                    minimumFractionDigits: 1,
                  })} م.ج`
                : `100% (${totals.totalEstimated.toLocaleString('en-US', {
                    minimumFractionDigits: 1,
                  })} م.ج)`}
            </span>
          </div>

          <span className="hidden sm:inline text-slate-300 dark:text-slate-600">
            |
          </span>

          {/* البند الثاني: التكلفة الفعلية المنفذة */}
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-emerald-500 inline-block" />
            <span className="text-slate-600 dark:text-slate-300">
              {displayUnit === 'financial'
                ? 'إجمالي التكلفة الفعلية المنفذة:'
                : 'متوسط نسبة التنفيذ الفعلي:'}
            </span>
            <span className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold tabular-nums">
              {displayUnit === 'financial'
                ? `${totals.totalActual.toLocaleString('en-US', {
                    minimumFractionDigits: 1,
                  })} م.ج`
                : `${totals.avgRatio}% (${totals.totalActual.toLocaleString(
                    'en-US',
                    {
                      minimumFractionDigits: 1,
                    }
                  )} م.ج)`}
            </span>
          </div>

          <span className="hidden md:inline text-slate-300 dark:text-slate-600">
            |
          </span>

          {/* البند الثالث: الفارق أو النسبة المتبقية */}
          <div className="flex items-center gap-1">
            {totals.totalVariance >= 0 ? (
              <ArrowDownRight className="h-3.5 w-3.5 text-amber-600" />
            ) : (
              <ArrowUpLeft className="h-3.5 w-3.5 text-rose-600" />
            )}
            <span className="text-slate-600 dark:text-slate-300">
              {displayUnit === 'financial'
                ? 'المتبقي للتنفيذ:'
                : 'النسبة المتبقية من المقايسات:'}
            </span>
            <span className="font-mono text-amber-700 dark:text-amber-400 font-extrabold tabular-nums">
              {displayUnit === 'financial'
                ? `${totals.totalVariance.toLocaleString('en-US', {
                    minimumFractionDigits: 1,
                  })} م.ج (${totals.avgRatio}% منفذ)`
                : `${totals.remainingRatio}% (${totals.totalVariance.toLocaleString(
                    'en-US',
                    {
                      minimumFractionDigits: 1,
                    }
                  )} م.ج)`}
            </span>
          </div>
        </div>

        {/* شارة حالة الموازنة */}
        <div className="flex items-center gap-1.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/70 px-2.5 py-1 text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300">
          {totals.totalVariance >= 0 ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>التنفيذ الفعلي ضمن سقف المقايسات المعتمدة</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span>تجاوز سقف المقايسات التقديرية</span>
            </>
          )}
        </div>
      </div>

      {/* مساحة الرسم التفاعلي باستخدام مكتبة Recharts */}
      <div dir="ltr" className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'bar' ? (
            <BarChart
              data={chartData}
              margin={{ top: 24, right: 24, left: 12, bottom: 5 }}
              barGap={10}
            >
              <defs>
                <linearGradient id="estimatedBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9333ea" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#581c87" stopOpacity={0.9} />
                </linearGradient>
                <linearGradient id="actualBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#047857" stopOpacity={0.9} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={gridStrokeColor}
              />
              <XAxis
                dataKey="shortName"
                tick={{
                  fill: axisTextColor,
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: 'Cairo, sans-serif',
                }}
                axisLine={{ stroke: gridStrokeColor }}
                tickLine={false}
              />
              <YAxis
                domain={displayUnit === 'percentage' ? [0, 115] : ['auto', 'auto']}
                tick={{
                  fill: axisTextColor,
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'IBM Plex Mono, monospace',
                }}
                axisLine={false}
                tickLine={false}
                unit={yAxisUnit}
                width={68}
              />
              <Tooltip
                content={renderCustomTooltip}
                cursor={{
                  fill: darkMode
                    ? 'rgba(139, 92, 246, 0.12)'
                    : 'rgba(147, 51, 234, 0.07)',
                }}
              />

              {/* خط مرجعي لمتوسط نسبة التنفيذ عند اختيار عرض النسبة المئوية */}
              {displayUnit === 'percentage' && (
                <ReferenceLine
                  y={totals.avgRatio}
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                  strokeWidth={1.8}
                  label={{
                    value: `متوسط التنفيذ ${totals.avgRatio}%`,
                    position: 'insideTopRight',
                    fill: darkMode ? '#fbbf24' : '#b45309',
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                />
              )}

              <Bar
                dataKey={estimatedDataKey}
                name={
                  displayUnit === 'financial'
                    ? 'التكلفة التقديرية (المقايسات)'
                    : 'المقايسة التقديرية المرجعية (%)'
                }
                fill="url(#estimatedBarGrad)"
                radius={[6, 6, 0, 0]}
                maxBarSize={42}
                onClick={(data) =>
                  setHighlightedProjectId((prev) =>
                    prev === data.id ? null : data.id
                  )
                }
                className="cursor-pointer"
              >
                {showDataLabels && (
                  <LabelList
                    dataKey={estimatedDataKey}
                    position="top"
                    formatter={formatBarLabel}
                    style={{
                      fill: darkMode ? '#d8b4fe' : '#581c87',
                      fontSize: 10,
                      fontWeight: 800,
                      fontFamily: 'IBM Plex Mono, monospace',
                    }}
                  />
                )}
                {chartData.map((entry) => (
                  <Cell
                    key={`est-${entry.id}`}
                    fill="url(#estimatedBarGrad)"
                    opacity={
                      highlightedProjectId && highlightedProjectId !== entry.id
                        ? 0.4
                        : 1
                    }
                  />
                ))}
              </Bar>

              <Bar
                dataKey={actualDataKey}
                name={
                  displayUnit === 'financial'
                    ? 'التكلفة الفعلية المنفذة'
                    : 'نسبة التكلفة الفعلية المنفذة (%)'
                }
                fill="url(#actualBarGrad)"
                radius={[6, 6, 0, 0]}
                maxBarSize={42}
                onClick={(data) =>
                  setHighlightedProjectId((prev) =>
                    prev === data.id ? null : data.id
                  )
                }
                className="cursor-pointer"
              >
                {showDataLabels && (
                  <LabelList
                    dataKey={actualDataKey}
                    position="top"
                    formatter={formatBarLabel}
                    style={{
                      fill: darkMode ? '#6ee7b7' : '#047857',
                      fontSize: 10,
                      fontWeight: 800,
                      fontFamily: 'IBM Plex Mono, monospace',
                    }}
                  />
                )}
                {chartData.map((entry) => (
                  <Cell
                    key={`act-${entry.id}`}
                    fill="url(#actualBarGrad)"
                    opacity={
                      highlightedProjectId && highlightedProjectId !== entry.id
                        ? 0.4
                        : 1
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <ComposedChart
              data={chartData}
              margin={{ top: 24, right: 24, left: 12, bottom: 5 }}
            >
              <defs>
                <linearGradient id="estimatedAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={estimatedColor} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={estimatedColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={gridStrokeColor}
              />
              <XAxis
                dataKey="shortName"
                tick={{
                  fill: axisTextColor,
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: 'Cairo, sans-serif',
                }}
                axisLine={{ stroke: gridStrokeColor }}
                tickLine={false}
              />
              <YAxis
                domain={displayUnit === 'percentage' ? [0, 115] : ['auto', 'auto']}
                tick={{
                  fill: axisTextColor,
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'IBM Plex Mono, monospace',
                }}
                axisLine={false}
                tickLine={false}
                unit={yAxisUnit}
                width={68}
              />
              <Tooltip content={renderCustomTooltip} />

              <Area
                type="monotone"
                dataKey={estimatedDataKey}
                name={
                  displayUnit === 'financial'
                    ? 'التكلفة التقديرية (المقايسات)'
                    : 'المقايسة التقديرية المرجعية (%)'
                }
                fill="url(#estimatedAreaGrad)"
                stroke={estimatedColor}
                strokeWidth={2.5}
              />
              <Bar
                dataKey={actualDataKey}
                name={
                  displayUnit === 'financial'
                    ? 'التكلفة الفعلية المنفذة'
                    : 'نسبة التكلفة الفعلية المنفذة (%)'
                }
                fill={actualColor}
                radius={[6, 6, 0, 0]}
                maxBarSize={38}
              >
                {showDataLabels && (
                  <LabelList
                    dataKey={actualDataKey}
                    position="top"
                    formatter={formatBarLabel}
                    style={{
                      fill: darkMode ? '#6ee7b7' : '#047857',
                      fontSize: 10,
                      fontWeight: 800,
                      fontFamily: 'IBM Plex Mono, monospace',
                    }}
                  />
                )}
              </Bar>
              <Line
                type="monotone"
                dataKey={actualDataKey}
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 4, fill: '#f59e0b' }}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* بطاقات تفصيلية سفلية لكل مشروع تتبدل ديناميكياً بين القيمة المالية والنسبة المئوية */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {chartData.map((proj) => {
          const isSelected = highlightedProjectId === proj.id;
          return (
            <button
              key={proj.id}
              type="button"
              onClick={() =>
                setHighlightedProjectId((prev) =>
                  prev === proj.id ? null : proj.id
                )
              }
              className={`flex flex-col justify-between rounded-xl px-3 py-2 border text-right text-xs transition cursor-pointer ${
                isSelected
                  ? 'border-purple-600 bg-purple-50/90 dark:bg-purple-950/60 shadow-xs'
                  : 'border-slate-200/70 dark:border-slate-700/70 bg-slate-50/90 dark:bg-slate-800/70 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5 w-full mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Layers className="h-3.5 w-3.5 text-purple-700 dark:text-purple-400 shrink-0" />
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate">
                    {proj.shortName}
                  </span>
                </div>
                <span className="font-mono text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums shrink-0">
                  {displayUnit === 'financial'
                    ? `${proj.actualCost} / ${proj.estimatedCost} م.ج`
                    : `${proj.actualPercent}% منفذ`}
                </span>
              </div>

              {/* شريط تقدم صغير يوضح نسبة التكلفة الفعلية إلى المقايسة التقديرية */}
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, proj.actualPercent)}%` }}
                  className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-purple-600 transition-all duration-300"
                />
              </div>

              <div className="mt-1 flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 w-full">
                <span>
                  {displayUnit === 'financial'
                    ? `نسبة الصرف: ${proj.actualPercent}%`
                    : `الفعلي: ${proj.actualCost} م.ج`}
                </span>
                <span className="font-mono text-amber-700 dark:text-amber-400 tabular-nums">
                  {displayUnit === 'financial'
                    ? `متبقي: ${proj.variance} م.ج`
                    : `متبقي: ${proj.remainingPercent}%`}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
