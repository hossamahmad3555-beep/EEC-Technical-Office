/**
 * @file store/index.ts
 * @description إعداد متجر Redux Toolkit مع الحفظ التلقائي الفوري في التخزين المحلي (LocalStorage Persistence)
 * يدعم الحفظ المستقل لحالة الفلاتر وتفضيلات المستخدم لضمان استعادتها بدقة عند إعادة تحميل الصفحة.
 */

import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import dashboardReducer, {
  DashboardState,
  initialDashboardState,
} from './slices/dashboardSlice';
import { DashboardFilters } from '../types/dashboard';

export const STORAGE_KEY = 'eec_technical_office_state_v1';
export const FILTERS_STORAGE_KEY = 'eec_technical_office_filters_v1';

/**
 * استرجاع تفضيلات الفلاتر المخزنة مسبقاً في التخزين المحلي
 */
export function loadSavedFilters(): DashboardFilters {
  try {
    const serializedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (serializedFilters) {
      const parsedFilters = JSON.parse(serializedFilters) as Partial<DashboardFilters>;
      return {
        ...initialDashboardState.filters,
        ...parsedFilters,
      };
    }
  } catch (err) {
    console.warn('تعذر قراءة الفلاتر المحفوظة من التخزين المحلي:', err);
  }
  return initialDashboardState.filters;
}

/**
 * استرجاع الحالة الشاملة المحفوظة من المتصفح عند بدء التشغيل لضمان استمرارية تجربة المستخدم
 */
function loadFromLocalStorage(): { dashboard: DashboardState } | undefined {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    const savedFilters = loadSavedFilters();

    if (!serializedState && !localStorage.getItem(FILTERS_STORAGE_KEY)) {
      return undefined;
    }

    const parsedState = serializedState
      ? (JSON.parse(serializedState) as Partial<DashboardState>)
      : undefined;

    // دمج الفلاتر بدقة مع إعطاء الأولوية للفلاتر المحفوظة صراحة لضمان استعادتها
    const mergedFilters: DashboardFilters = {
      ...initialDashboardState.filters,
      ...(parsedState?.filters || {}),
      ...savedFilters,
    };

    return {
      dashboard: {
        ...initialDashboardState,
        ...(parsedState || {}),
        filters: mergedFilters,
        activeModal: null, // عدم فتح نافذة منبثقة تلقائياً عند التحديث
      },
    };
  } catch (err) {
    console.warn('تعذر قراءة الحالة من التخزين المحلي:', err);
    return undefined;
  }
}

/**
 * حفظ الحالة وتفضيلات الفلاتر تلقائياً في التخزين المحلي عند أي تغيير
 */
function saveToLocalStorage(state: DashboardState) {
  try {
    // 1. حفظ الحالة الكاملة
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);

    // 2. حفظ مخصص ومستقل للفلاتر لضمان استعادة تفضيلات التصفية حتى في حال إعادة بناء أو تحديث بنية البيانات
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(state.filters));
  } catch (err) {
    console.warn('تعذر حفظ الحالة في التخزين المحلي:', err);
  }
}

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
  },
  preloadedState: loadFromLocalStorage(),
});

// الاشتراك في التحديثات لحفظ البيانات تلقائياً وتطبيق الوضع الليلي على عنصر جذر الصفحة
store.subscribe(() => {
  const state = store.getState().dashboard;
  saveToLocalStorage(state);

  if (typeof document !== 'undefined') {
    const htmlEl = document.documentElement;
    if (state.darkMode) {
      htmlEl.classList.add('dark');
    } else {
      htmlEl.classList.remove('dark');
    }
  }
});

// مزامنة الوضع الليلي عند التحميل الأولي
if (typeof document !== 'undefined') {
  const initialDark = store.getState().dashboard.darkMode;
  if (initialDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
