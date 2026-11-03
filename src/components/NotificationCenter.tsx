/**
 * @file components/NotificationCenter.tsx
 * @description نظام الإشعارات الفورية في الزاوية العلوية للوحة التحكم لمتابعة مواعيد تسليم الرسومات الهندسية وانتهاء صلاحية الاعتمادات الفنية باستخدام Redux Toolkit
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bell,
  Clock,
  AlertTriangle,
  FileCode2,
  BadgeCheck,
  CheckCheck,
  X,
  BellRing,
  ArrowUpLeft,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  clearActiveToast,
  dismissNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  setActiveTab,
  triggerUrgentCheckAlert,
} from '../store/slices/dashboardSlice';
import { NotificationCategory, SystemNotification } from '../types/dashboard';

export const NotificationCenter: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, activeToastId } = useAppSelector((s) => s.dashboard);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | NotificationCategory
  >('all');

  const containerRef = useRef<HTMLDivElement>(null);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // إخفاء التنبيه الفوري المنبثق تلقائياً بعد 7 ثوانٍ
  useEffect(() => {
    if (!activeToastId) return;
    const timer = setTimeout(() => {
      dispatch(clearActiveToast());
    }, 7000);
    return () => clearTimeout(timer);
  }, [activeToastId, dispatch]);

  // قائمة الإشعارات غير المستبعدة
  const visibleNotifications = useMemo(
    () => notifications.filter((n) => !n.dismissed),
    [notifications]
  );

  // عدد الإشعارات غير المقروءة
  const unreadCount = useMemo(
    () => visibleNotifications.filter((n) => !n.read).length,
    [visibleNotifications]
  );

  // تصفية الإشعارات حسب التبويب المختار (الكل / تسليم الرسومات / انتهاء الاعتمادات)
  const filteredNotifications = useMemo(() => {
    if (selectedCategory === 'all') return visibleNotifications;
    return visibleNotifications.filter((n) => n.category === selectedCategory);
  }, [visibleNotifications, selectedCategory]);

  // الإشعار العاجل النشط للنافذة الفورية (Instant Corner Toast)
  const activeToast = useMemo(
    () =>
      visibleNotifications.find(
        (n) => n.id === activeToastId && !n.read
      ) || null,
    [visibleNotifications, activeToastId]
  );

  const handleNotificationClick = (notif: SystemNotification) => {
    dispatch(markNotificationAsRead(notif.id));
    dispatch(setActiveTab(notif.targetTab));
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* زر جرس الإشعارات في الزاوية العلوية */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (activeToastId) {
            dispatch(clearActiveToast());
          }
        }}
        title="مركز تنبيهات مواعيد تسليم الرسومات وصلاحية الاعتمادات الفنية"
        className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-slate-800 text-[#4c1d95] dark:text-purple-300 shadow ring-1 ring-purple-300 dark:ring-purple-700 transition hover:scale-105 cursor-pointer"
      >
        <Bell className="h-4 w-4 fill-current" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-extrabold text-white shadow-xs tabular-nums">
            {unreadCount}
          </span>
        )}
      </button>

      {/* تنبيه فوري منبثق في الزاوية العلوية (Instant Corner Alert Banner) عند حلول موعد تسليم رسم أو قرب انتهاء صلاحية اعتماد */}
      <AnimatePresence>
        {activeToast && !isOpen && (
          <motion.div
            key={activeToast.id}
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 right-4 sm:right-6 z-50 w-80 sm:w-96 rounded-2xl border border-amber-300 dark:border-amber-700/80 bg-white/98 dark:bg-slate-900/98 p-3.5 shadow-2xl text-right backdrop-blur-md"
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2.5 min-w-0">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                    activeToast.category === 'drawing_deadline'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400'
                  }`}
                >
                  {activeToast.category === 'drawing_deadline' ? (
                    <FileCode2 className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-rose-600 dark:text-rose-400">
                    <span>
                      {activeToast.category === 'drawing_deadline'
                        ? 'تنبيه فوري: موعد تسليم رسومات'
                        : 'تنبيه فوري: انتهاء صلاحية اعتماد فني'}
                    </span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">
                      متبقي {activeToast.remainingDays} أيام
                    </span>
                  </div>

                  <p className="mt-0.5 text-xs font-extrabold text-slate-900 dark:text-white truncate">
                    {activeToast.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {activeToast.description}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-purple-800 dark:text-purple-300">
                      {activeToast.project} ({activeToast.referenceCode})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(activeToast)}
                      className="inline-flex items-center gap-1 font-extrabold text-purple-700 dark:text-purple-300 hover:underline cursor-pointer"
                    >
                      <span>معاينة الإجراء</span>
                      <ArrowUpLeft className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => dispatch(clearActiveToast())}
                title="إغلاق التنبيه الفوري"
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* لوحة مركز الإشعارات الكاملة في الزاوية العلوية */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xl z-50 text-right"
          >
            {/* رأس مركز الإشعارات */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-2.5">
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-purple-950 dark:text-purple-100">
                  مركز التنبيهات الهندسية الفورية
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  مواعيد تسليم الرسومات وصلاحية الاعتمادات الفنية
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => dispatch(triggerUrgentCheckAlert())}
                  title="فحص وتوليد تنبيه موعد تسليم / صلاحية فوري"
                  className="flex items-center gap-1 rounded-lg bg-purple-100 dark:bg-purple-950/90 px-2 py-1 text-[10px] font-extrabold text-purple-800 dark:text-purple-200 hover:bg-purple-200 transition cursor-pointer"
                >
                  <BellRing className="h-3 w-3" />
                  <span>فحص المواعيد</span>
                </button>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => dispatch(markAllNotificationsAsRead())}
                    title="تحديد الكل كمقروء"
                    className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
                  >
                    <CheckCheck className="h-3 w-3" />
                    <span>قراءة الكل</span>
                  </button>
                )}
              </div>
            </div>

            {/* أزرار تصفية فئات التنبيهات */}
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-2.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`rounded-lg py-1 transition cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-white dark:bg-slate-900 text-purple-900 dark:text-purple-200 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                الكل ({visibleNotifications.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('drawing_deadline')}
                className={`rounded-lg py-1 transition cursor-pointer ${
                  selectedCategory === 'drawing_deadline'
                    ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                تسليم الرسومات
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('approval_expiry')}
                className={`rounded-lg py-1 transition cursor-pointer ${
                  selectedCategory === 'approval_expiry'
                    ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                صلاحية الاعتمادات
              </button>
            </div>

            {/* قائمة التنبيهات */}
            <div className="max-h-72 space-y-2 overflow-y-auto pl-0.5">
              {filteredNotifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                  لا توجد تنبيهات نشطة في هذا التصنيف حالياً
                </div>
              ) : (
                filteredNotifications.map((item) => {
                  const isDrawing = item.category === 'drawing_deadline';
                  const isCritical = item.urgency === 'critical';

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`group relative rounded-xl border p-2.5 transition cursor-pointer ${
                        !item.read
                          ? 'border-purple-300/90 dark:border-purple-700/80 bg-purple-50/70 dark:bg-slate-800/90'
                          : 'border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/60 opacity-80'
                      } hover:border-purple-500`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          <div
                            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                              isDrawing
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-400'
                            }`}
                          >
                            {isDrawing ? (
                              <FileCode2 className="h-4 w-4" />
                            ) : (
                              <BadgeCheck className="h-4 w-4" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold">
                              <span
                                className={
                                  isCritical
                                    ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                                    : 'text-amber-700 dark:text-amber-400'
                                }
                              >
                                {isDrawing
                                  ? 'موعد تسليم لوحة'
                                  : 'انتهاء صلاحية اعتماد'}
                              </span>
                              <span className="text-slate-400">·</span>
                              <span className="inline-flex items-center gap-0.5 font-mono text-slate-600 dark:text-slate-300 tabular-nums">
                                <Clock className="h-2.5 w-2.5" />
                                متبقي {item.remainingDays} أيام
                              </span>
                            </div>

                            <h4 className="mt-0.5 text-xs font-extrabold text-slate-900 dark:text-white">
                              {item.title}
                            </h4>
                            <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                              {item.description}
                            </p>

                            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                              <span className="font-bold text-purple-800 dark:text-purple-300">
                                {item.project} · {item.referenceCode}
                              </span>
                              <span className="font-mono tabular-nums">
                                الاستحقاق: {item.dueDate}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* زر استبعاد الإشعار */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(dismissNotification(item.id));
                          }}
                          title="إخفاء التنبيه"
                          className="rounded-md p-1 text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700 hover:text-rose-600 cursor-pointer shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
