/**
 * @file store/index.ts
 * @description إعداد متجر Redux Toolkit مع الحفظ التلقائي الفوري في التخزين المحلي (LocalStorage Persistence)
 */

import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import dashboardReducer, {
  DashboardState,
  initialDashboardState,
} from './slices/dashboardSlice';

const STORAGE_KEY = 'eec_technical_office_state_v1';

/**
 * استرجاع الحالة المحفوظة من المتصفح عند بدء التشغيل لضمان استمرارية تجربة المستخدم
 */
function loadFromLocalStorage(): { dashboard: DashboardState } | undefined {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return undefined;
    const parsed = JSON.parse(serialized) as DashboardState;
    return {
      dashboard: {
        ...initialDashboardState,
        ...parsed,
        activeModal: null, // عدم فتح نافذة منبثقة تلقائياً عند التحديث
      },
    };
  } catch (err) {
    console.warn('تعذر قراءة الحالة من التخزين المحلي:', err);
    return undefined;
  }
}

/**
 * حفظ الحالة تلقائياً في التخزين المحلي عند أي تغيير
 */
function saveToLocalStorage(state: DashboardState) {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
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
