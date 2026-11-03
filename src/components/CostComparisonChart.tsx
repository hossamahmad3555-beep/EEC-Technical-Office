/**
 * @file components/CostComparisonChart.tsx
 * @description مخطط بياني تفاعلي باستخدام مكتبة Recharts يقارن بين التكلفة التقديرية (المقايسات) والتكلفة الفعلية (المستخلصات) لكل مشروع
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
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  ArrowUpLeft,
  ArrowDownRight,
  Layers,
} from 'lucide-react';
import { useAppSelector } from '../store';

interface ProjectCostComparisonDatum {
  id: string;
  projectName: string;
  shortName: string;
  discipline: string;
  estimatedCost: number; // التكلفة التقديرية (المقايسات) - مليون ج.م
  actualCost: number; // التكلفة الفعلية (المستخلصات) - مليون ج.م
  variance: number; // الوفر أو التجاوز المالي
  disbursementRatio: number; // نسبة الصرف الفعلي إلى التقديري (%)
}

export const CostComparisonChart: React.FC = () => {
  const {
    projects,
    estimatesList,
    invoicesList,
    darkMode,
    filters,
  } = useAppSelector((s) => s.dashboard);

  const [chartMode, setChartMode] = useState<'bar' | 'composed'>('bar');

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

    return sourceProjects.map((proj) => {
      // استخراج اسم المشروع المختصر (مثل: مشروع ABC)
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

      // التكلفة التقديرية (المقايسات المعتمدة للمشروع)
      const estimatedCost = Number(
        Math.max(proj.valueMillion, extraEstimates).toFixed(1)
      );

      // التكلفة الفعلية (المستخلصات المنصرفة للمشروع)
      const actualCost = Number(
        Math.max(proj.disbursedMillion, extraInvoices).toFixed(1)
      );

      const variance = Number((estimatedCost - actualCost).toFixed(1));
      const disbursementRatio =
        estimatedCost > 0
          ? Number(((actualCost / estimatedCost) * 100).toFixed(1))
          : 0;

      return {
        id: proj.id,
        projectName: proj.name,
        shortName,
        discipline: proj.discipline,
        estimatedCost,
        actualCost,
        variance,
        disbursementRatio,
      };
    });
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
    return {
      totalEstimated: Number(totalEstimated.toFixed(1)),
      totalActual: Number(totalActual.toFixed(1)),
      totalVariance,
      avgRatio,
    };
  }, [chartData]);

  // ألوان متوافقة مع الوضعين الفاتح والداكن وهوية EEC
  const axisTextColor = darkMode ? '#cbd5e1' : '#334155';
  const gridStrokeColor = darkMode ? '#1e293b' : '#e2e8f0';
  const estimatedColor = '#7e22ce'; // بنفسجي ملكي للتكلفة التقديرية (المقايسات)
  const actualColor = '#10b981'; // أخضر زمردي للتكلفة الفعلية (المستخلصات)

  // تخصيص نافذة التلميح التفاعلية (Custom Arabic Tooltip)
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
        className="min-w-[235px] rounded-2xl border border-purple-200 dark:border-purple-800 bg-white/98 dark:bg-slate-900/98 p-3.5 shadow-xl text-right text-xs"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
          <span className="font-extrabold text-[#1e1b4b] dark:text-purple-200">
            {data.projectName}
          </span>
        </div>

        <div className="space-y-1.5 font-bold">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="h-2.5 w-2.5 rounded-xs bg-purple-700 inline-block" />
              التكلفة التقديرية (المقايسات):
            </span>
            <span className="font-mono text-purple-800 dark:text-purple-300 tabular-nums">
              {data.estimatedCost.toLocaleString('en-US', {
                minimumFractionDigits: 1,
              })}{' '}
              م.ج
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500 inline-block" />
              التكلفة الفعلية (المستخلصات):
            </span>
            <span className="font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
              {data.actualCost.toLocaleString('en-US', {
                minimumFractionDigits: 1,
              })}{' '}
              م.ج
            </span>
          </div>

          <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">
              المتبقي من المقايسة:
            </span>
            <span className="font-mono text-amber-600 dark:text-amber-400 tabular-nums">
              {data.variance.toLocaleString('en-US', {
                minimumFractionDigits: 1,
              })}{' '}
              م.ج
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">
              نسبة الصرف الفعلي:
            </span>
            <span className="font-mono text-slate-900 dark:text-white tabular-nums">
              {data.disbursementRatio}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-purple-200/90 dark:border-purple-900/60 bg-white/95 dark:bg-slate-900/95 p-4 shadow-sm">
      {/* رأس المخطط: العنوان + ملخص المؤشرات المالية + أزرار تبديل نمط العرض */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-[#1e1b4b] dark:text-purple-100">
              مقارنة التكلفة التقديرية (المقايسات) والتكلفة الفعلية (المستخلصات) لكل مشروع
            </h3>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              تحليل تفاعلي للموقف المالي للمشروعات الجارية بالمليون جنيه مصري (م.ج)
            </p>
          </div>
        </div>

        {/* مؤشرات إجمالية سريعة + مفتاح التبديل بين الأعمدة والمنحنى */}
        <div className="flex flex-wrap items-center gap-3">
          {/* وسيلة الإيضاح والمجاميع */}
          <div className="flex flex-wrap items-center gap-4 rounded-xl bg-purple-50/70 dark:bg-slate-800/80 px-3 py-1.5 border border-purple-100 dark:border-slate-700 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-purple-700 inline-block" />
              <span className="text-slate-600 dark:text-slate-300">
                إجمالي المقايسات:
              </span>
              <span className="font-mono text-purple-900 dark:text-purple-200 font-extrabold tabular-nums">
                {totals.totalEstimated.toLocaleString('en-US', {
                  minimumFractionDigits: 1,
                })}{' '}
                م.ج
              </span>
            </div>

            <span className="text-slate-300 dark:text-slate-600">|</span>

            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-emerald-500 inline-block" />
              <span className="text-slate-600 dark:text-slate-300">
                إجمالي المستخلصات:
              </span>
              <span className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold tabular-nums">
                {totals.totalActual.toLocaleString('en-US', {
                  minimumFractionDigits: 1,
                })}{' '}
                م.ج
              </span>
            </div>

            <span className="hidden sm:inline text-slate-300 dark:text-slate-600">
              |
            </span>

            <div className="hidden sm:flex items-center gap-1">
              {totals.totalVariance >= 0 ? (
                <ArrowDownRight className="h-3.5 w-3.5 text-amber-600" />
              ) : (
                <ArrowUpLeft className="h-3.5 w-3.5 text-rose-600" />
              )}
              <span className="text-slate-600 dark:text-slate-300">
                المتبقي:
              </span>
              <span className="font-mono text-amber-700 dark:text-amber-400 font-extrabold tabular-nums">
                {totals.totalVariance.toLocaleString('en-US', {
                  minimumFractionDigits: 1,
                })}{' '}
                م.ج ({totals.avgRatio}%)
              </span>
            </div>
          </div>

          {/* أزرار تبديل نمط مخطط Recharts */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setChartMode('bar')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
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
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                chartMode === 'composed'
                  ? 'bg-white dark:bg-slate-900 text-purple-900 dark:text-purple-200 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>مخطط مركب</span>
            </button>
          </div>
        </div>
      </div>

      {/* مساحة الرسم التفاعلي باستخدام مكتبة Recharts */}
      <div dir="ltr" className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'bar' ? (
            <BarChart
              data={chartData}
              margin={{ top: 12, right: 20, left: 10, bottom: 5 }}
              barGap={8}
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
                tick={{
                  fill: axisTextColor,
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'IBM Plex Mono, monospace',
                }}
                axisLine={false}
                tickLine={false}
                unit=" م.ج"
                width={65}
              />
              <Tooltip
                content={renderCustomTooltip}
                cursor={{
                  fill: darkMode
                    ? 'rgba(139, 92, 246, 0.12)'
                    : 'rgba(147, 51, 234, 0.07)',
                }}
              />

              <Bar
                dataKey="estimatedCost"
                name="التكلفة التقديرية (المقايسات)"
                fill="url(#estimatedBarGrad)"
                radius={[6, 6, 0, 0]}
                maxBarSize={38}
              >
                {chartData.map((entry) => (
                  <Cell key={`est-${entry.id}`} fill="url(#estimatedBarGrad)" />
                ))}
              </Bar>

              <Bar
                dataKey="actualCost"
                name="التكلفة الفعلية (المستخلصات)"
                fill="url(#actualBarGrad)"
                radius={[6, 6, 0, 0]}
                maxBarSize={38}
              >
                {chartData.map((entry) => (
                  <Cell key={`act-${entry.id}`} fill="url(#actualBarGrad)" />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <ComposedChart
              data={chartData}
              margin={{ top: 12, right: 20, left: 10, bottom: 5 }}
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
                tick={{
                  fill: axisTextColor,
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'IBM Plex Mono, monospace',
                }}
                axisLine={false}
                tickLine={false}
                unit=" م.ج"
                width={65}
              />
              <Tooltip content={renderCustomTooltip} />

              <Area
                type="monotone"
                dataKey="estimatedCost"
                name="التكلفة التقديرية (المقايسات)"
                fill="url(#estimatedAreaGrad)"
                stroke={estimatedColor}
                strokeWidth={2.5}
              />
              <Bar
                dataKey="actualCost"
                name="التكلفة الفعلية (المستخلصات)"
                fill={actualColor}
                radius={[6, 6, 0, 0]}
                maxBarSize={34}
              />
              <Line
                type="monotone"
                dataKey="actualCost"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 4, fill: '#f59e0b' }}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* شريط تفصيلي سفلي لنسب الصرف الفعلي مقارنة بالمقايسات التقديرية لكل مشروع */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {chartData.map((proj) => (
          <div
            key={proj.id}
            className="flex items-center justify-between rounded-xl bg-slate-50/90 dark:bg-slate-800/70 px-3 py-1.5 border border-slate-200/60 dark:border-slate-700/70 text-xs"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Layers className="h-3.5 w-3.5 text-purple-700 dark:text-purple-400 shrink-0" />
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                {proj.shortName}
              </span>
            </div>
            <span className="font-mono text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums shrink-0">
              {proj.disbursementRatio}% صرف
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
