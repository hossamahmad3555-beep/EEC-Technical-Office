/**
 * @file components/DashboardCharts.tsx
 * @description المخططات الهندسية والبيانية التفاعلية للوحة تحكم المكتب الفني (توزيع الأعمال، موقف المشروعات، نسبة الإنجاز، إصدار الرسومات، المستخلصات المالية، أوامر التغيير)
 */

import React from 'react';
import {
  CheckCircle2,
  Hourglass,
  Clock,
  XCircle,
  TrendingUp,
  BarChart2,
  ClipboardCheck,
  Coins,
  ArrowLeftRight,
} from 'lucide-react';
import { useAppSelector } from '../store';
import { CostComparisonChart } from './CostComparisonChart';

export const DashboardCharts: React.FC = () => {
  const {
    disciplineStats,
    monthlyDrawings,
    baseKpis,
    voSummary,
    filters,
  } = useAppSelector((s) => s.dashboard);

  // حساب معامل فلترة ديناميكي إذا اختار المستخدم مشروعاً محدداً أو سنة محددة
  const filterMultiplier =
    filters.project !== 'جميع المشروعات'
      ? 0.28
      : filters.year === '2025'
      ? 0.65
      : 1;

  const totalWorkItems = Math.round(baseKpis.totalWorkItems * filterMultiplier);
  const completedCount = Math.round(
    baseKpis.completedTasksCount * filterMultiplier
  );
  const inProgressCount = Math.round(
    baseKpis.inProgressTasksCount * filterMultiplier
  );
  const delayedCount = Math.round(baseKpis.delayedTasksCount * filterMultiplier);

  const contractValue = Number(
    (baseKpis.totalValueMillion * filterMultiplier).toFixed(1)
  );
  const disbursedValue = Number(
    (baseKpis.totalDisbursedMillion * filterMultiplier).toFixed(1)
  );
  const remainingValue = Number((contractValue - disbursedValue).toFixed(1));
  const disbursedPercent =
    contractValue > 0
      ? Number(((disbursedValue / contractValue) * 100).toFixed(1))
      : 68.9;

  // إعداد شرائح الدونت تشارت (توزيع الأعمال حسب التخصص)
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;

  // إعداد نقاط منحنى معدل إصدار الرسومات الشهرية
  const chartWidth = 420;
  const chartHeight = 115;
  const maxDrawingCount = 120;
  const points = monthlyDrawings.map((item, idx) => {
    // في التصميم العربي: يناير على اليسار وديسمبر على اليمين كما في الصورة المرجعية!
    // لنتأكد من الصورة المرجعية: على المحور الأفقي من اليسار لليمين: يناير، فبراير، مارس، أبريل، مايو، يونيو، يوليو، أغسطس، سبتمبر، أكتوبر، نوفمبر، ديسمبر (وعند ديسمبر فوقها شارة 108 باللون البنفسجي).
    const x =
      32 +
      (idx / (monthlyDrawings.length - 1)) * (chartWidth - 52);
    const scaledCount = Math.round(item.count * filterMultiplier);
    const y =
      chartHeight -
      22 -
      (Math.min(scaledCount, maxDrawingCount) / maxDrawingCount) *
        (chartHeight - 42);
    return { x, y, month: item.month, count: scaledCount };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPoints = `${points[0].x},${chartHeight - 22} ${polylinePoints} ${
    points[points.length - 1].x
  },${chartHeight - 22}`;

  return (
    <div className="space-y-3">
      {/* الصف الأول من المخططات: 3 بطاقات (نسبة الإنجاز العام | موقف الأعمال بالمشروعات | توزيع الأعمال حسب التخصص) */}
      {/* ملاحظة الترتيب البصري في الصورة المرجعية:
          اليسار: توزيع الأعمال حسب التخصص
          الوسط: موقف الأعمال بالمشروعات
          اليمين: نسبة الإنجاز العام
          بما أن الصفحة dir="rtl"، فإن العمود الأول في Grid يظهر على اليمين والعمود الثالث يظهر على اليسار!
          لذلك نضع:
          1) نسبة الإنجاز العام (تظهر على اليمين)
          2) موقف الأعمال بالمشروعات (تظهر في المنتصف)
          3) توزيع الأعمال حسب التخصص (تظهر على اليسار)
          وهذا يطابق الصورة المرجعية 100%! */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* 1. بطاقة نسبة الإنجاز العام (أقصى اليمين - 4 أعمدة) */}
        <div className="lg:col-span-4 rounded-2xl border border-purple-200/90 dark:border-purple-900/60 bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm sm:text-base font-extrabold text-[#1e1b4b] dark:text-purple-100">
              نسبة الإنجاز العام
            </h3>
            <ClipboardCheck className="h-5 w-5 text-purple-700 dark:text-purple-400" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* قائمة المنجز / قيد التنفيذ / متأخر */}
            <div className="w-full sm:w-3/5 space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 px-3 py-2">
                <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {completedCount}
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  المنجز
                </span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 px-3 py-2">
                <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {inProgressCount}
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  قيد التنفيذ
                </span>
                <Hourglass className="h-4 w-4 text-sky-600 shrink-0" />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 px-3 py-2">
                <span className="font-mono text-base font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">
                  {delayedCount}
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  متأخر
                </span>
                <Clock className="h-4 w-4 text-rose-600 shrink-0" />
              </div>
            </div>

            {/* حلقة نسبة الإنجاز 72.6% */}
            <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  stroke="currentColor"
                  strokeWidth="14"
                  className="text-slate-200 dark:text-slate-700"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  stroke="#15803d"
                  strokeWidth="14"
                  strokeDasharray={2 * Math.PI * 46}
                  strokeDashoffset={
                    2 * Math.PI * 46 * (1 - baseKpis.overallCompletion / 100)
                  }
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {baseKpis.overallCompletion}%
                </span>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  إجمالي التقدم
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. بطاقة موقف الأعمال بالمشروعات (المنتصف - 4 أعمدة) */}
        <div className="lg:col-span-4 rounded-2xl border border-purple-200/90 dark:border-purple-900/60 bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm sm:text-base font-extrabold text-[#1e1b4b] dark:text-purple-100">
              موقف الأعمال بالمشروعات
            </h3>
            <BarChart2 className="h-5 w-5 text-purple-700 dark:text-purple-400" />
          </div>

          {/* وسيلة الإيضاح: مخطط (ذهبي) | فعلي (بنفسجي) */}
          <div className="flex items-center justify-center gap-6 text-xs font-bold mb-2">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-amber-500 inline-block" />
              <span className="text-slate-700 dark:text-slate-300">مخطط</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-purple-700 inline-block" />
              <span className="text-slate-700 dark:text-slate-300">فعلي</span>
            </div>
          </div>

          {/* الأعمدة البيانية (من اليسار لليمين كما في الصورة: إنشائي، معماري، كهرباء، ميكانيكا، تشطيبات) */}
          <div
            dir="ltr"
            className="flex items-end justify-between gap-2 h-32 pt-4 px-1 border-b border-slate-200 dark:border-slate-700"
          >
            {/* المحور الرأسي */}
            <div className="flex flex-col justify-between h-full text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 pb-1 pr-1 tabular-nums">
              <span>100%</span>
              <span>80%</span>
              <span>60%</span>
              <span>40%</span>
              <span>20%</span>
              <span>0%</span>
            </div>

            {disciplineStats.map((item) => (
              <div
                key={item.discipline}
                className="flex flex-col items-center flex-1 h-full justify-end"
              >
                <div className="flex items-end justify-center gap-1 w-full h-24">
                  {/* عمود الفعلي (بنفسجي) */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200 mb-0.5 tabular-nums">
                      {item.actualProgress}%
                    </span>
                    <div
                      style={{ height: `${(item.actualProgress / 100) * 76}px` }}
                      className="w-3.5 sm:w-4 rounded-t bg-gradient-to-t from-purple-900 to-purple-500 shadow-xs transition-all duration-300"
                    />
                  </div>
                  {/* عمود المخطط (ذهبي) */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 mb-0.5 tabular-nums">
                      {item.plannedProgress}%
                    </span>
                    <div
                      style={{ height: `${(item.plannedProgress / 100) * 76}px` }}
                      className="w-3.5 sm:w-4 rounded-t bg-gradient-to-t from-amber-600 to-amber-400 shadow-xs transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* تسميات التخصصات أسفل الأعمدة */}
          <div
            dir="ltr"
            className="flex items-center justify-between pl-8 pr-1 pt-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300"
          >
            {disciplineStats.map((item) => (
              <span key={item.discipline} className="flex-1 text-center">
                {item.discipline}
              </span>
            ))}
          </div>
        </div>

        {/* 3. بطاقة توزيع الأعمال حسب التخصص (أقصى اليسار - 4 أعمدة) */}
        <div className="lg:col-span-4 rounded-2xl border border-purple-200/90 dark:border-purple-900/60 bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm sm:text-base font-extrabold text-[#1e1b4b] dark:text-purple-100">
              توزيع الأعمال حسب التخصص
            </h3>
            <TrendingUp className="h-5 w-5 text-purple-700 dark:text-purple-400" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* القائمة النسبية للتخصصات */}
            <div className="w-full sm:w-1/2 space-y-1.5">
              {disciplineStats.map((d) => (
                <div
                  key={d.discipline}
                  className="flex items-center justify-between text-xs font-bold border-b border-slate-100 dark:border-slate-800 pb-1"
                >
                  <span className="font-mono text-slate-900 dark:text-white tabular-nums">
                    {d.percentage}%
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-700 dark:text-slate-200">
                      {d.discipline}
                    </span>
                    <span
                      style={{ backgroundColor: d.color }}
                      className="h-3 w-3 rounded-xs shrink-0"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* مخطط الدونت (1,250 عمل) */}
            <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
              <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
                {disciplineStats.map((slice) => {
                  const strokeDasharray = `${
                    (slice.percentage / 100) * circumference
                  } ${circumference}`;
                  const strokeDashoffset = -(
                    (cumulativePercent / 100) *
                    circumference
                  );
                  cumulativePercent += slice.percentage;

                  return (
                    <circle
                      key={slice.discipline}
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth="22"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-lg font-extrabold text-slate-900 dark:text-white tabular-nums leading-none">
                  {totalWorkItems.toLocaleString('en-US')}
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                  عمل
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* الصف الثاني من المخططات: 3 بطاقات (أوامر التغيير V.O | المستخلصات المالية | معدل إصدار الرسومات الشهرية) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* 1. بطاقة أوامر التغيير V.O (أقصى اليمين - 4 أعمدة) */}
        <div className="lg:col-span-4 rounded-2xl border border-purple-200/90 dark:border-purple-900/60 bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm sm:text-base font-extrabold text-[#1e1b4b] dark:text-purple-100">
              أوامر التغيير (V.O)
            </h3>
            <ArrowLeftRight className="h-5 w-5 text-purple-700 dark:text-purple-400" />
          </div>

          <div className="space-y-1.5 text-xs font-bold">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 border border-slate-200/60 dark:border-slate-700">
              <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
                {voSummary.total}
              </span>
              <span className="text-slate-700 dark:text-slate-200">
                إجمالي الأوامر
              </span>
              <span className="w-4" />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 border border-slate-200/60 dark:border-slate-700">
              <span className="font-mono text-sm font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
                {voSummary.approved}
              </span>
              <span className="text-slate-700 dark:text-slate-200">معتمدة</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 border border-slate-200/60 dark:border-slate-700">
              <span className="font-mono text-sm font-extrabold text-sky-700 dark:text-sky-400 tabular-nums">
                {voSummary.underReview}
              </span>
              <span className="text-slate-700 dark:text-slate-200">
                قيد المراجعة
              </span>
              <Hourglass className="h-4 w-4 text-sky-600" />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 border border-slate-200/60 dark:border-slate-700">
              <span className="font-mono text-sm font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">
                {voSummary.rejected}
              </span>
              <span className="text-slate-700 dark:text-slate-200">مرفوضة</span>
              <XCircle className="h-4 w-4 text-rose-600" />
            </div>
          </div>
        </div>

        {/* 2. بطاقة المستخلصات المالية (المنتصف - 4 أعمدة) */}
        <div className="lg:col-span-4 rounded-2xl border border-purple-200/90 dark:border-purple-900/60 bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm sm:text-base font-extrabold text-[#1e1b4b] dark:text-purple-100">
              المستخلصات المالية{' '}
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                (مليون ج.م)
              </span>
            </h3>
            <Coins className="h-5 w-5 text-purple-700 dark:text-purple-400" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* حلقة نسبة الصرف 68.9% */}
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
              <svg viewBox="0 0 110 110" className="h-full w-full -rotate-90">
                <circle
                  cx="55"
                  cy="55"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-slate-200 dark:text-slate-700"
                  fill="none"
                />
                <circle
                  cx="55"
                  cy="55"
                  r="42"
                  stroke="#16a34a"
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={
                    2 * Math.PI * 42 * (1 - disbursedPercent / 100)
                  }
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {disbursedPercent}%
                </span>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  نسبة الصرف
                </span>
              </div>
            </div>

            {/* تفاصيل القيمة التعاقدية وإجمالي المستخلصات والمتبقي */}
            <div className="w-full sm:w-3/5 space-y-2 text-xs font-bold">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span className="text-slate-700 dark:text-slate-200">
                  القيمة التعاقدية
                </span>
                <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {contractValue.toLocaleString('en-US', {
                    minimumFractionDigits: 1,
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span className="text-slate-700 dark:text-slate-200">
                  إجمالي المستخلصات
                </span>
                <span className="font-mono text-sm font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {disbursedValue.toLocaleString('en-US', {
                    minimumFractionDigits: 1,
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-200">
                  المتبقي
                </span>
                <span className="font-mono text-sm font-extrabold text-purple-800 dark:text-purple-300 tabular-nums">
                  {remainingValue.toLocaleString('en-US', {
                    minimumFractionDigits: 1,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. بطاقة معدل إصدار الرسومات الشهرية (أقصى اليسار - 4 أعمدة) */}
        <div className="lg:col-span-4 rounded-2xl border border-purple-200/90 dark:border-purple-900/60 bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm sm:text-base font-extrabold text-[#1e1b4b] dark:text-purple-100">
              معدل إصدار الرسومات الشهرية
            </h3>
            <TrendingUp className="h-5 w-5 text-purple-700 dark:text-purple-400" />
          </div>

          <div dir="ltr" className="relative w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-32 overflow-visible"
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9333ea" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#9333ea" stopOpacity="0.03" />
                </linearGradient>
              </defs>

              {/* خطوط الشبكة الأفقية */}
              {[0, 20, 40, 60, 80, 100, 120].map((val) => {
                const y =
                  chartHeight -
                  22 -
                  (val / maxDrawingCount) * (chartHeight - 42);
                return (
                  <g key={val}>
                    <line
                      x1="28"
                      y1={y}
                      x2={chartWidth - 10}
                      y2={y}
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-800"
                      strokeWidth="0.7"
                    />
                    <text
                      x="22"
                      y={y + 3}
                      textAnchor="end"
                      className="fill-slate-500 dark:fill-slate-400 text-[8px] font-mono font-bold"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* المساحة المظللة تحت المنحنى */}
              <polygon points={areaPoints} fill="url(#areaGrad)" />

              {/* الخط الرئيسي */}
              <polyline
                fill="none"
                stroke="#6b21a8"
                strokeWidth="2.2"
                points={polylinePoints}
              />

              {/* النقاط وأسماء الشهور */}
              {points.map((pt, i) => (
                <g key={pt.month}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="3.2"
                    className="fill-white stroke-[#6b21a8]"
                    strokeWidth="2"
                  />
                  {/* شارة القيمة العليا عند آخر شهر (ديسمبر = 108) */}
                  {i === points.length - 1 && (
                    <g>
                      <rect
                        x={pt.x - 18}
                        y={pt.y - 23}
                        width="32"
                        height="16"
                        rx="4"
                        fill="#581c87"
                      />
                      <text
                        x={pt.x - 2}
                        y={pt.y - 12}
                        textAnchor="middle"
                        className="fill-white font-mono text-[9px] font-bold"
                      >
                        {pt.count}
                      </text>
                    </g>
                  )}
                  <text
                    x={pt.x}
                    y={chartHeight - 7}
                    textAnchor="middle"
                    className="fill-slate-700 dark:fill-slate-300 text-[8px] font-bold"
                  >
                    {pt.month}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* الصف الثالث من المخططات: مخطط Recharts التفاعلي لمقارنة التكلفة التقديرية (المقايسات) والتكلفة الفعلية (المستخلصات) لكل مشروع */}
      <CostComparisonChart />
    </div>
  );
};
