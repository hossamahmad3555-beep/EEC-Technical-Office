/**
 * @file components/HeaderBanner.tsx
 * @description الشريط العلوي البانورامي للشركة المصرية الهندسية للمقاولات (EEC) - مطابق للصورة المرجعية مع دعم الوضع الليلي ومركز الإشعارات الفورية
 */

import React, { useState } from 'react';
import {
  HelpCircle,
  UserCircle2,
  ChevronDown,
  Moon,
  Sun,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  toggleDarkMode,
  resetDemoData,
  setActiveTab,
} from '../store/slices/dashboardSlice';
import { NotificationCenter } from './NotificationCenter';

export const HeaderBanner: React.FC = () => {
  const dispatch = useAppDispatch();
  const { darkMode, lastSavedAt } = useAppSelector((s) => s.dashboard);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  return (
    <header className="no-print relative w-full overflow-visible select-none border-b border-purple-300/60 dark:border-purple-900/60 bg-gradient-to-l from-[#351256] via-[#5c2c8c] to-[#dcd4f5] dark:from-[#19092b] dark:via-[#2c124d] dark:to-[#1e1b38] transition-colors duration-300">
      {/* خلفية معمارية وهندسية مرسومة بدقة (رافعات ومباني قيد الإنشاء عند الغروب كما في الصورة) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-90 dark:opacity-55">
        <svg
          viewBox="0 0 1440 110"
          fill="none"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="skyGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#311052" stopOpacity="0.95" />
              <stop offset="32%" stopColor="#65319c" stopOpacity="0.85" />
              <stop offset="48%" stopColor="#f59e0b" stopOpacity="0.45" />
              <stop offset="65%" stopColor="#fde68a" stopOpacity="0.7" />
              <stop offset="85%" stopColor="#e9d5ff" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#ddd6fe" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="goldArc" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
          </defs>

          <rect width="1440" height="110" fill="url(#skyGlow)" />

          {/* منحنى ذهبي وبنفسجي يفصل منطقة الشعار عن المشهد الهندسي */}
          <path
            d="M 880 0 C 960 45, 990 85, 1060 110 L 1440 110 L 1440 0 Z"
            fill="#3b1561"
            fillOpacity="0.92"
          />
          <path
            d="M 875 0 C 955 45, 985 85, 1055 110"
            stroke="url(#goldArc)"
            strokeWidth="5"
            fill="none"
          />

          {/* سحب خفيفة وإضاءة غروب خلف الأبراج الهندسية */}
          <circle cx="720" cy="78" r="55" fill="#fef08a" fillOpacity="0.45" />
          <circle cx="640" cy="65" r="75" fill="#fca5a5" fillOpacity="0.25" />

          {/* أفق المباني قيد الإنشاء والرافعات البرجية في المنتصف */}
          <g opacity="0.65" fill="#4c1d95">
            {/* مباني وشبكات إنشائية */}
            <rect x="520" y="45" width="38" height="65" rx="1" />
            <rect x="562" y="32" width="46" height="78" rx="1" />
            <rect x="615" y="52" width="32" height="58" rx="1" />
            <rect x="655" y="38" width="52" height="72" rx="1" />
            <rect x="715" y="48" width="38" height="62" rx="1" />
            <rect x="760" y="35" width="44" height="75" rx="1" />
            <rect x="810" y="55" width="36" height="55" rx="1" />
          </g>

          {/* شبكات نوافذ مضيئة ذهبية على المباني */}
          <g fill="#fde047" opacity="0.75">
            <rect x="570" y="40" width="6" height="6" />
            <rect x="580" y="40" width="6" height="6" />
            <rect x="590" y="40" width="6" height="6" />
            <rect x="570" y="50" width="6" height="6" />
            <rect x="580" y="50" width="6" height="6" />
            <rect x="665" y="46" width="8" height="5" />
            <rect x="678" y="46" width="8" height="5" />
            <rect x="665" y="56" width="8" height="5" />
            <rect x="768" y="44" width="6" height="6" />
            <rect x="778" y="44" width="6" height="6" />
          </g>

          {/* رافعات برجية (Tower Cranes) مطابقة للصورة */}
          <g stroke="#d97706" strokeWidth="2" opacity="0.85">
            {/* رافعة 1 */}
            <line x1="685" y1="8" x2="685" y2="95" strokeWidth="2.5" />
            <line x1="635" y1="18" x2="755" y2="18" strokeWidth="2" />
            <line x1="685" y1="8" x2="650" y2="18" />
            <line x1="685" y1="8" x2="735" y2="18" />
            <line x1="740" y1="18" x2="740" y2="38" strokeWidth="1.2" />

            {/* رافعة 2 */}
            <line x1="835" y1="12" x2="835" y2="95" strokeWidth="2.5" />
            <line x1="785" y1="22" x2="890" y2="22" strokeWidth="2" />
            <line x1="835" y1="12" x2="800" y2="22" />
            <line x1="835" y1="12" x2="875" y2="22" />

            {/* رافعة 3 */}
            <line x1="540" y1="16" x2="540" y2="95" strokeWidth="2" />
            <line x1="495" y1="25" x2="585" y2="25" strokeWidth="1.8" />
            <line x1="540" y1="16" x2="510" y2="25" />
            <line x1="540" y1="16" x2="575" y2="25" />
          </g>
        </svg>
      </div>

      {/* محتوى الهيدر في 3 مناطق متوازنة */}
      <div className="relative z-10 mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-2.5 lg:px-6">
        {/* المنطقة اليمنى بصرياً (إدارة المكتب الفني + التنبيهات الفورية + المدير) */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          {/* زر حساب مدير المكتب الفني */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu((p) => !p)}
              className="flex items-center gap-2 rounded-full bg-gradient-to-l from-[#4c1d95] to-[#6b21a8] px-3.5 py-1.5 text-white shadow-md ring-1 ring-white/30 transition hover:brightness-110 cursor-pointer whitespace-nowrap shrink-0"
            >
              <ChevronDown className="h-4 w-4 text-purple-200" />
              <span className="text-xs sm:text-sm font-bold tracking-wide">
                مدير المكتب الفني
              </span>
              <UserCircle2 className="h-5 w-5 text-white" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 p-3 shadow-xl z-50 text-right">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    م. حسام أحمد
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    رئيس قطاع المكتب الفني - EEC
                  </p>
                </div>
                <div className="flex items-center justify-between py-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <span>الحفظ التلقائي نشط</span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    محفوظ
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-2 tabular-nums">
                  آخر مزامنة: {lastSavedAt}
                </p>
                <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(setActiveTab('settings'));
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-right rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition cursor-pointer"
                  >
                    إعدادات النظام والمكتب الفني
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(resetDemoData());
                      setShowProfileMenu(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                  >
                    <span>إعادة ضبط البيانات الافتراضية</span>
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* أزرار المساعدة والتنبيهات الفورية والوضع الليلي */}
          <div className="flex items-center gap-2">
            {/* زر تبديل الوضع الفاتح / الداكن */}
            <button
              type="button"
              onClick={() => dispatch(toggleDarkMode())}
              title={darkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4c1d95] text-amber-300 shadow ring-1 ring-white/30 transition hover:scale-105 hover:bg-[#5b21b6] cursor-pointer"
            >
              {darkMode ? (
                <Sun className="h-4 w-4 text-amber-300" />
              ) : (
                <Moon className="h-4 w-4 text-white" />
              )}
            </button>

            {/* زر المساعدة */}
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              title="دليل استخدام لوحة المكتب الفني"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4c1d95] text-white shadow ring-1 ring-white/30 transition hover:scale-105 hover:bg-[#5b21b6] cursor-pointer"
            >
              <HelpCircle className="h-4 w-4" />
            </button>

            {/* نظام الإشعارات والتنبيهات الفورية المدار عبر Redux */}
            <NotificationCenter />
          </div>

          {/* عنوان إدارة المكتب الفني + أيقونة البرجل الهندسي الذهبي */}
          <div className="flex items-center gap-2.5 pr-1">
            {/* أيقونة البرجل الهندسي الذهبي (Compass) */}
            <div className="flex h-11 w-11 items-center justify-center">
              <svg
                viewBox="0 0 48 48"
                className="h-10 w-10 drop-shadow"
                fill="none"
              >
                <circle
                  cx="24"
                  cy="9"
                  r="4"
                  stroke="#d97706"
                  strokeWidth="3"
                  fill="#fef3c7"
                />
                <path
                  d="M24 5V2"
                  stroke="#b45309"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M21 12L10 42"
                  stroke="#d97706"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M27 12L38 42"
                  stroke="#b45309"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M13 30H35"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M24 24V35"
                  stroke="#b45309"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="text-right leading-tight">
              <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-[#3b0764] dark:text-purple-200">
                إدارة المكتب الفني
              </h1>
              <p className="text-xs sm:text-sm font-bold text-[#1e1b4b] dark:text-purple-300 tracking-wide">
                Technical Office
              </p>
            </div>
          </div>
        </div>

        {/* المنطقة اليسرى بصرياً (الشركة المصرية الهندسية للمقاولات + الشعار الدائري) */}
        <div className="flex items-center gap-3 text-left">
          <div className="text-right sm:text-left leading-tight">
            <h2 className="text-base sm:text-xl font-extrabold text-white drop-shadow-sm">
              الشركة المصرية الهندسية للمقاولات
            </h2>
            <p className="text-[11px] sm:text-xs font-semibold text-purple-100 tracking-wide">
              Egyptian Engineering Company (EEC)
            </p>
          </div>

          {/* الشعار الدائري للشركة */}
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full border-2 border-amber-300/80 bg-[#1e1b4b] p-1 shadow-lg">
            <svg viewBox="0 0 64 64" className="h-full w-full" fill="none">
              <circle
                cx="32"
                cy="32"
                r="29"
                stroke="#e2e8f0"
                strokeWidth="2"
                strokeDasharray="3 2"
              />
              <circle cx="32" cy="32" r="24" stroke="#fbbf24" strokeWidth="1.5" />
              {/* أبراج هندسية داخل الشعار */}
              <rect x="20" y="26" width="6" height="18" fill="#e2e8f0" />
              <rect x="29" y="18" width="7" height="26" fill="#fbbf24" />
              <rect x="39" y="23" width="6" height="21" fill="#e2e8f0" />
              <path
                d="M15 44H49"
                stroke="#fbbf24"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <text
                x="32"
                y="53"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="8"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                EEC
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* نافذة المساعدة السريعة */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 p-5 shadow-2xl text-right">
            <h3 className="text-base font-extrabold text-purple-900 dark:text-purple-200 mb-2">
              نبذة عن نظام إدارة المكتب الفني (EEC)
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 mb-3">
              يوفر هذا النظام متابعة لحظية لكافة أعمال المكتب الفني بالشركة المصرية الهندسية للمقاولات، بما يشمل حصر الكميات (BOQ)، الرسومات التنفيذية، المستخلصات المالية، أوامر التغيير (V.O)، والاعتمادات الفنية.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 mb-4">
              <li>• يتم حفظ كافة التعديلات والبيانات تلقائياً في المتصفح (LocalStorage).</li>
              <li>• يمكنك التبديل بين الوضع الفاتح والداكن في أي وقت من الشريط العلوي.</li>
              <li>• جميع الفلاتر والأزرار السفلية والقائمة الجانبية تفاعلية بالكامل.</li>
            </ul>
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full rounded-xl bg-purple-800 hover:bg-purple-700 py-2 text-xs font-bold text-white transition cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
