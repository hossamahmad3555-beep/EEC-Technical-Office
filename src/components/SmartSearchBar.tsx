/**
 * @file components/SmartSearchBar.tsx
 * @description شريط بحث ذكي في الجزء العلوي من لوحة التحكم يتيح البحث عبر المشروعات، أوامر التغيير (V.O)، وأرقام الرسومات مع تصفية فورية للنتائج أثناء الكتابة
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  X,
  FolderKanban,
  ArrowLeftRight,
  FileCode2,
  BadgeCheck,
  ArrowUpLeft,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { setActiveTab, setFilter } from '../store/slices/dashboardSlice';
import { TabId } from '../types/dashboard';

export const SmartSearchBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    filters,
    projects,
    variationOrdersList,
    drawingsList,
    topDrawings,
    recentApprovals,
  } = useAppSelector((s) => s.dashboard);

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const query = filters.searchQuery.trim().toLowerCase();

  // إغلاق القائمة المنسدلة عند النقر خارج شريط البحث
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // اختصار لوحة المفاتيح (Ctrl+K أو /) للتركيز السريع على البحث الذكي
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // تصفية فورية للمشروعات، أوامر التغيير، أرقام الرسومات، والاعتمادات أثناء الكتابة
  const searchResults = useMemo(() => {
    if (!query) {
      return {
        matchedProjects: [],
        matchedVOs: [],
        matchedDrawings: [],
        matchedDrawingCategories: [],
        matchedApprovals: [],
        totalCount: 0,
      };
    }

    const matchedProjects = projects.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query) ||
        p.owner.toLowerCase().includes(query) ||
        p.discipline.toLowerCase().includes(query)
    );

    const matchedVOs = variationOrdersList.filter(
      (vo) =>
        vo.code.toLowerCase().includes(query) ||
        vo.title.toLowerCase().includes(query) ||
        vo.project.toLowerCase().includes(query) ||
        vo.status.toLowerCase().includes(query)
    );

    const matchedDrawings = drawingsList.filter(
      (d) =>
        d.code.toLowerCase().includes(query) ||
        d.title.toLowerCase().includes(query) ||
        d.project.toLowerCase().includes(query) ||
        d.discipline.toLowerCase().includes(query)
    );

    const matchedDrawingCategories = topDrawings.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.codeRange.toLowerCase().includes(query) ||
        c.discipline.toLowerCase().includes(query)
    );

    const matchedApprovals = recentApprovals.filter(
      (a) =>
        a.type.toLowerCase().includes(query) ||
        a.project.toLowerCase().includes(query) ||
        a.referenceCode.toLowerCase().includes(query)
    );

    const totalCount =
      matchedProjects.length +
      matchedVOs.length +
      matchedDrawings.length +
      matchedDrawingCategories.length +
      matchedApprovals.length;

    return {
      matchedProjects,
      matchedVOs,
      matchedDrawings,
      matchedDrawingCategories,
      matchedApprovals,
      totalCount,
    };
  }, [
    query,
    projects,
    variationOrdersList,
    drawingsList,
    topDrawings,
    recentApprovals,
  ]);

  const handleSelectResult = (targetTab: TabId, projectFilter?: string) => {
    if (projectFilter) {
      dispatch(setFilter({ key: 'project', value: projectFilter }));
    }
    dispatch(setActiveTab(targetTab));
    setIsOpen(false);
  };

  const clearSearch = () => {
    dispatch(setFilter({ key: 'searchQuery', value: '' }));
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full sm:w-72 md:w-80 lg:w-96">
      {/* حقل الإدخال الذكي */}
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute right-3.5 h-4 w-4 text-purple-700 dark:text-purple-400" />
        <input
          ref={inputRef}
          type="text"
          value={filters.searchQuery}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            dispatch(
              setFilter({ key: 'searchQuery', value: e.target.value })
            );
            setIsOpen(true);
          }}
          placeholder="بحث ذكي: مشروع، أمر تغيير (V.O-03)، رقم لوحة (S-105)..."
          aria-label="بحث ذكي عبر المشروعات وأوامر التغيير وأرقام الرسومات"
          className="w-full rounded-full border border-purple-300 dark:border-purple-800 bg-white dark:bg-slate-900 pr-9 pl-16 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-xs transition focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
        />

        {/* عداد النتائج الفوري أو اختصار الكيبورد + زر المسح */}
        <div className="absolute left-2.5 flex items-center gap-1">
          {query ? (
            <>
              <span className="rounded-full bg-purple-100 dark:bg-purple-950 px-2 py-0.5 font-mono text-[10px] font-extrabold text-purple-800 dark:text-purple-300 tabular-nums">
                {searchResults.totalCount} نتيجة
              </span>
              <button
                type="button"
                onClick={clearSearch}
                title="مسح البحث"
                className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <span
              dir="ltr"
              className="hidden sm:inline-block rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400"
            >
              Ctrl+K
            </span>
          )}
        </div>
      </div>

      {/* قائمة النتائج الفورية المنسدلة (Instant Smart Search Popover) */}
      {isOpen && query.length > 0 && (
        <div className="absolute right-0 left-0 mt-2 max-h-[420px] overflow-y-auto rounded-2xl border border-purple-200 dark:border-purple-800 bg-white/98 dark:bg-slate-900/98 p-3 shadow-2xl z-50 text-right backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2 text-[11px]">
            <span className="font-extrabold text-purple-900 dark:text-purple-200">
              نتائج البحث والتصفية الفورية
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-semibold">
              يتم تحديث الجداول والمؤشرات تلقائياً أثناء الكتابة
            </span>
          </div>

          {searchResults.totalCount === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
              لا توجد نتائج مطابقة لـ «
              <strong className="text-slate-800 dark:text-slate-200">
                {filters.searchQuery}
              </strong>
              » في المشروعات أو أوامر التغيير أو أرقام الرسومات.
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {/* 1. نتائج المشروعات */}
              {searchResults.matchedProjects.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-purple-800 dark:text-purple-300 mb-1.5">
                    <FolderKanban className="h-3.5 w-3.5" />
                    <span>
                      المشروعات ({searchResults.matchedProjects.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.matchedProjects.map((proj) => (
                      <button
                        key={proj.id}
                        type="button"
                        onClick={() => handleSelectResult('projects')}
                        className="flex w-full items-center justify-between rounded-xl bg-purple-50/60 dark:bg-slate-800/70 hover:bg-purple-100/80 dark:hover:bg-slate-800 px-3 py-2 text-right transition cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{proj.name}</span>
                            <span className="font-mono text-[11px] text-purple-700 dark:text-purple-300">
                              [{proj.code}]
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            المالك: {proj.owner} · التخصص: {proj.discipline}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-mono font-bold tabular-nums">
                          <span>{proj.valueMillion} م.ج</span>
                          <ArrowUpLeft className="h-3.5 w-3.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. نتائج أوامر التغيير (V.O) */}
              {searchResults.matchedVOs.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-rose-700 dark:text-rose-400 mb-1.5">
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                    <span>
                      أوامر التغيير V.O ({searchResults.matchedVOs.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.matchedVOs.map((vo) => (
                      <button
                        key={vo.id}
                        type="button"
                        onClick={() => handleSelectResult('variation_orders')}
                        className="flex w-full items-center justify-between rounded-xl bg-rose-50/60 dark:bg-slate-800/70 hover:bg-rose-100/70 dark:hover:bg-slate-800 px-3 py-2 text-right transition cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="font-mono text-rose-700 dark:text-rose-400">
                              {vo.code}
                            </span>
                            <span>{vo.title}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {vo.project} · التاريخ: {vo.date}
                          </div>
                        </div>
                        <div className="text-left">
                          <span className="block font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                            {vo.valueMillion} م.ج
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                            {vo.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. نتائج أرقام اللوحات والرسومات الهندسية */}
              {(searchResults.matchedDrawings.length > 0 ||
                searchResults.matchedDrawingCategories.length > 0) && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 mb-1.5">
                    <FileCode2 className="h-3.5 w-3.5" />
                    <span>
                      الرسومات الهندسية وأرقام اللوحات (
                      {searchResults.matchedDrawings.length +
                        searchResults.matchedDrawingCategories.length}
                      )
                    </span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.matchedDrawings.map((drw) => (
                      <button
                        key={drw.id}
                        type="button"
                        onClick={() => handleSelectResult('drawings')}
                        className="flex w-full items-center justify-between rounded-xl bg-emerald-50/60 dark:bg-slate-800/70 hover:bg-emerald-100/70 dark:hover:bg-slate-800 px-3 py-2 text-right transition cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span
                              dir="ltr"
                              className="font-mono text-emerald-700 dark:text-emerald-400"
                            >
                              [{drw.code}]
                            </span>
                            <span>{drw.title}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {drw.project} · التخصص: {drw.discipline} · الإصدار:{' '}
                            {drw.revision}
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          {drw.status}
                        </span>
                      </button>
                    ))}

                    {searchResults.matchedDrawingCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectResult('drawings')}
                        className="flex w-full items-center justify-between rounded-xl bg-amber-50/60 dark:bg-slate-800/70 hover:bg-amber-100/70 dark:hover:bg-slate-800 px-3 py-1.5 text-right transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                          <span>{cat.title}</span>
                          <span
                            dir="ltr"
                            className="font-mono text-xs text-purple-700 dark:text-purple-300"
                          >
                            {cat.codeRange}
                          </span>
                        </div>
                        <span className="font-mono font-extrabold text-slate-900 dark:text-white tabular-nums">
                          {cat.count} لوحة
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. نتائج الاعتمادات الفنية */}
              {searchResults.matchedApprovals.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-sky-700 dark:text-sky-400 mb-1.5">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    <span>
                      الاعتمادات الفنية ({searchResults.matchedApprovals.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.matchedApprovals.map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => handleSelectResult('approvals')}
                        className="flex w-full items-center justify-between rounded-xl bg-sky-50/60 dark:bg-slate-800/70 hover:bg-sky-100/70 dark:hover:bg-slate-800 px-3 py-1.5 text-right transition cursor-pointer"
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {app.type}
                          </span>
                          <span className="mx-1.5 text-slate-400">·</span>
                          <span className="text-slate-600 dark:text-slate-300">
                            {app.project}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-sky-700 dark:text-sky-400">
                          {app.referenceCode}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
