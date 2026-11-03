/**
 * @file components/SidebarNav.tsx
 * @description القائمة الجانبية اليمنى/اليسرى المطابقة لتصميم لوحة المكتب الفني مع التمييز الذهبي للتبويب النشط
 */

import React from 'react';
import {
  Home,
  FolderKanban,
  FileCode2,
  Calculator,
  FileSpreadsheet,
  Receipt,
  ArrowLeftRight,
  FileCheck2,
  ScrollText,
  MailCheck,
  FolderOpen,
  BarChart3,
  Settings,
  ArrowLeft,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { resetFilters, setActiveTab } from '../store/slices/dashboardSlice';
import { TabId } from '../types/dashboard';

interface NavItemConfig {
  id: TabId;
  label: string;
  icon: React.FC<{ className?: string }>;
}

export const NAV_ITEMS: NavItemConfig[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: Home },
  { id: 'projects', label: 'المشروعات', icon: FolderKanban },
  { id: 'drawings', label: 'الرسومات الهندسية', icon: FileCode2 },
  { id: 'boq', label: 'حصر الكميات (BOQ)', icon: Calculator },
  { id: 'tenders', label: 'المقايسات والتسعير', icon: FileSpreadsheet },
  { id: 'invoices', label: 'المستخلصات', icon: Receipt },
  { id: 'variation_orders', label: 'أوامر التغيير (V.O)', icon: ArrowLeftRight },
  { id: 'approvals', label: 'الإعتمادات الفنية', icon: FileCheck2 },
  { id: 'contracts', label: 'العقود', icon: ScrollText },
  { id: 'correspondence', label: 'المراسلات الفنية', icon: MailCheck },
  { id: 'documents', label: 'المستندات', icon: FolderOpen },
  { id: 'reports', label: 'التقارير', icon: BarChart3 },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
];

export const SidebarNav: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((s) => s.dashboard.activeTab);

  return (
    <aside className="w-full lg:w-[225px] shrink-0 bg-gradient-to-b from-[#3b1561] via-[#2e104d] to-[#210a38] dark:from-[#160726] dark:via-[#11051f] dark:to-[#0b0314] text-white flex flex-col justify-between p-3 lg:min-h-[calc(100vh-76px)] border-r border-purple-400/20 shadow-xl select-none">
      {/* قائمة الأقسام الـ 13 */}
      <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1">
        {NAV_ITEMS.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => dispatch(setActiveTab(item.id))}
              className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-[13px] font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-l from-[#fde68a] via-[#fcd34d] to-[#f59e0b] text-[#2e104d] shadow-md scale-[1.01]'
                  : 'text-purple-100 hover:bg-white/10 hover:text-white border-b border-white/5'
              }`}
            >
              {/* الأيقونة على اليسار والنص على اليمين كما في الصورة المرجعية */}
              <span className="truncate">{item.label}</span>
              <IconComponent
                className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive
                    ? 'text-[#3b1561]'
                    : 'text-purple-200 group-hover:text-amber-300'
                }`}
              />
            </button>
          );
        })}
      </nav>

      {/* زر العودة إلى البوابة في أسفل القائمة الجانبية */}
      <div className="mt-4 pt-3 border-t border-purple-300/20">
        <button
          type="button"
          onClick={() => {
            dispatch(resetFilters());
            dispatch(setActiveTab('dashboard'));
          }}
          className="flex w-full items-center justify-between rounded-full border border-purple-300/40 bg-gradient-to-r from-[#4c1d95]/80 to-[#3b0764]/80 px-4 py-2 text-xs font-bold text-purple-100 shadow-inner transition hover:border-amber-300/70 hover:text-white cursor-pointer whitespace-nowrap"
        >
          <span>العودة إلى البوابة</span>
          <ArrowLeft className="h-4 w-4 text-purple-200" />
        </button>
      </div>
    </aside>
  );
};
