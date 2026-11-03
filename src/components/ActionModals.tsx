/**
 * @file components/ActionModals.tsx
 * @description النوافذ التفاعلية لإضافة مشروعات، رفع رسومات، إعداد مقايسات، إصدار مستخلصات، تسجيل أوامر تغيير، متابعة الاعتمادات، وتصدير التقارير الدورية (PDF / Excel)
 */

import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  X,
  FileText,
  Printer,
  FileSpreadsheet,
  FileDown,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  addDrawing,
  addEstimate,
  addInvoice,
  addProject,
  addTechnicalApproval,
  addVariationOrder,
  setActiveModal,
} from '../store/slices/dashboardSlice';
import { ApprovalStatus, DisciplineType } from '../types/dashboard';
import {
  exportDashboardToExcel,
  exportElementToPdf,
} from '../utils/exportService';
import { TransmittalGenerator } from './TransmittalGenerator';

export const ActionModals: React.FC = () => {
  const dispatch = useAppDispatch();
  const dashboardState = useAppSelector((s) => s.dashboard);
  const {
    activeModal,
    baseKpis,
    recentApprovals,
    projects,
    currentTasks,
    topDrawings,
    filters,
  } = dashboardState;

  const reportPrintRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  // حقول نموذج إضافة مشروع
  const [projName, setProjName] = useState('');
  const [projOwner, setProjOwner] = useState('هيئة المجتمعات العمرانية');
  const [projDiscipline, setProjDiscipline] =
    useState<DisciplineType>('إنشائي');
  const [projValue, setProjValue] = useState('120');

  // حقول نموذج رفع رسم هندسي
  const [drwCode, setDrwCode] = useState('S-161');
  const [drwTitle, setDrwTitle] = useState('');
  const [drwProject, setDrwProject] = useState('مشروع ABC');
  const [drwDiscipline, setDrwDiscipline] =
    useState<DisciplineType>('إنشائي');

  // حقول نموذج إعداد مقايسة
  const [estCode, setEstCode] = useState('BOQ-2026-04');
  const [estTitle, setEstTitle] = useState('');
  const [estProject, setEstProject] = useState('مشروع ABC');
  const [estAmount, setEstAmount] = useState('45.5');

  // حقول نموذج إصدار مستخلص
  const [invNumber, setInvNumber] = useState('مستخلص جاري رقم (8)');
  const [invProject, setInvProject] = useState('مشروع ABC');
  const [invAmount, setInvAmount] = useState('32.0');

  // حقول نموذج تسجيل أمر تغيير V.O
  const [voCode, setVoCode] = useState('V.O-05');
  const [voTitle, setVoTitle] = useState('');
  const [voProject, setVoProject] = useState('مشروع Delta');
  const [voValue, setVoValue] = useState('8.5');
  const [voStatus, setVoStatus] = useState<ApprovalStatus>('قيد المراجعة');

  // حقول نموذج إضافة اعتماد فني
  const [appType, setAppType] = useState('إعتماد رسومات تنفيذية');
  const [appProject, setAppProject] = useState('مشروع ABC');
  const [appDiscipline] = useState<DisciplineType>('إنشائي');

  if (!activeModal) return null;

  const closeModal = () => {
    setExportSuccessMsg(null);
    dispatch(setActiveModal(null));
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  const handleExcelDownload = () => {
    exportDashboardToExcel(dashboardState);
    setExportSuccessMsg('تم تصدير ملف Excel (.xlsx) متعدد الأوراق بنجاح');
    setTimeout(() => setExportSuccessMsg(null), 3500);
  };

  const handlePdfDownload = async () => {
    if (!reportPrintRef.current || isExportingPdf) return;
    try {
      setIsExportingPdf(true);
      await exportElementToPdf(
        reportPrintRef.current,
        `التقرير_الفني_الدوري_EEC_${filters.year}`
      );
      setExportSuccessMsg('تم تصدير التقرير الدوري بصيغة PDF بنجاح');
      setTimeout(() => setExportSuccessMsg(null), 3500);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18 }}
          className={`w-full ${
            activeModal === 'technical_report' ||
            activeModal === 'generate_transmittal'
              ? 'max-w-5xl'
              : 'max-w-lg'
          } rounded-2xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 p-5 shadow-2xl text-right my-auto`}
        >
          {/* 1. إضافة مشروع جديد */}
          {activeModal === 'add_project' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!projName.trim()) return;
                dispatch(
                  addProject({
                    name: projName.trim(),
                    code: `EEC-2026-${Math.floor(100 + Math.random() * 900)}`,
                    owner: projOwner,
                    discipline: projDiscipline,
                    year: '2026',
                    valueMillion: parseFloat(projValue) || 100,
                    disbursedMillion: 0,
                    completionRate: 15,
                    status: 'قيد التنفيذ',
                    drawingsCount: 12,
                    boqCount: 1,
                    invoicesCount: 0,
                    voCount: 0,
                    approvalsCount: 1,
                  })
                );
                setProjName('');
                closeModal();
              }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-extrabold text-purple-900 dark:text-purple-200">
                  إضافة مشروع هندسي جديد
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اسم المشروع
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مشروع أبراج العلمين الجديدة"
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      الجهة المالكة
                    </label>
                    <input
                      type="text"
                      value={projOwner}
                      onChange={(e) => setProjOwner(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      التخصص الرئيسي
                    </label>
                    <select
                      value={projDiscipline}
                      onChange={(e) =>
                        setProjDiscipline(e.target.value as DisciplineType)
                      }
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                    >
                      <option value="إنشائي">إنشائي</option>
                      <option value="معماري">معماري</option>
                      <option value="كهرباء">كهرباء</option>
                      <option value="ميكانيكا">ميكانيكا</option>
                      <option value="تشطيبات">تشطيبات</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    القيمة التعاقدية (مليون ج.م)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={projValue}
                    onChange={(e) => setProjValue(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono text-slate-900 dark:text-white tabular-nums"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-800 hover:bg-purple-700 px-5 py-2 text-xs font-bold text-white shadow cursor-pointer"
                >
                  حفظ المشروع وتحديث المؤشرات
                </button>
              </div>
            </form>
          )}

          {/* 2. رفع رسومات هندسية */}
          {activeModal === 'upload_drawing' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!drwTitle.trim()) return;
                dispatch(
                  addDrawing({
                    code: drwCode,
                    title: drwTitle.trim(),
                    project: drwProject,
                    discipline: drwDiscipline,
                    revision: 'Rev.01',
                    issueDate: todayStr,
                    status: 'معتمد',
                  })
                );
                setDrwTitle('');
                closeModal();
              }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-extrabold text-purple-900 dark:text-purple-200">
                  رفع وإصدار لوحة هندسية جديدة
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      كود اللوحة
                    </label>
                    <input
                      type="text"
                      required
                      value={drwCode}
                      onChange={(e) => setDrwCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      التخصص الهندسي
                    </label>
                    <select
                      value={drwDiscipline}
                      onChange={(e) =>
                        setDrwDiscipline(e.target.value as DisciplineType)
                      }
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                    >
                      <option value="إنشائي">إنشائي</option>
                      <option value="معماري">معماري</option>
                      <option value="كهرباء">كهرباء</option>
                      <option value="ميكانيكا">ميكانيكا</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    عنوان اللوحة التفصيلي
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مخطط تسليح سقف الدور الأول علوي"
                    value={drwTitle}
                    onChange={(e) => setDrwTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    المشروع التابع
                  </label>
                  <select
                    value={drwProject}
                    onChange={(e) => setDrwProject(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="مشروع ABC">مشروع ABC</option>
                    <option value="مشروع Delta">مشروع Delta</option>
                    <option value="مشروع Nile">مشروع Nile</option>
                    <option value="مشروع Capital">مشروع Capital</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-700 hover:bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow cursor-pointer"
                >
                  رفع واعتماد الرسم الهندسي
                </button>
              </div>
            </form>
          )}

          {/* 3. إعداد مقايسة جديدة */}
          {activeModal === 'create_estimate' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!estTitle.trim()) return;
                dispatch(
                  addEstimate({
                    code: estCode,
                    title: estTitle.trim(),
                    project: estProject,
                    estimatedMillion: parseFloat(estAmount) || 25,
                    itemsCount: 85,
                    status: 'معتمد',
                  })
                );
                setEstTitle('');
                closeModal();
              }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-extrabold text-purple-900 dark:text-purple-200">
                  إعداد مقايسة كميات وتسعير (BOQ)
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      كود المقايسة
                    </label>
                    <input
                      type="text"
                      required
                      value={estCode}
                      onChange={(e) => setEstCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      المشروع
                    </label>
                    <select
                      value={estProject}
                      onChange={(e) => setEstProject(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                    >
                      <option value="مشروع ABC">مشروع ABC</option>
                      <option value="مشروع Delta">مشروع Delta</option>
                      <option value="مشروع Nile">مشروع Nile</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    بيان المقايسة
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مقايسة أعمال شبكات التيار الخفيف"
                    value={estTitle}
                    onChange={(e) => setEstTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    القيمة التقديرية (مليون ج.م)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={estAmount}
                    onChange={(e) => setEstAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono text-slate-900 dark:text-white tabular-nums"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-800 hover:bg-purple-700 px-5 py-2 text-xs font-bold text-white shadow cursor-pointer"
                >
                  إدراج المقايسة
                </button>
              </div>
            </form>
          )}

          {/* 4. إصدار مستخلص مالي */}
          {activeModal === 'issue_invoice' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                dispatch(
                  addInvoice({
                    invoiceNumber: invNumber,
                    project: invProject,
                    amountMillion: parseFloat(invAmount) || 20,
                    submissionDate: todayStr,
                    status: 'معتمد',
                  })
                );
                closeModal();
              }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-extrabold text-purple-900 dark:text-purple-200">
                  إصدار مستخلص أعمال جاري
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رقم وبيان المستخلص
                  </label>
                  <input
                    type="text"
                    required
                    value={invNumber}
                    onChange={(e) => setInvNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      المشروع
                    </label>
                    <select
                      value={invProject}
                      onChange={(e) => setInvProject(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                    >
                      <option value="مشروع ABC">مشروع ABC</option>
                      <option value="مشروع Delta">مشروع Delta</option>
                      <option value="مشروع Nile">مشروع Nile</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      قيمة المستخلص (مليون ج.م)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={invAmount}
                      onChange={(e) => setInvAmount(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono text-slate-900 dark:text-white tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-700 hover:bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow cursor-pointer"
                >
                  إصدار المستخلص وتحديث الصرف
                </button>
              </div>
            </form>
          )}

          {/* 5. تسجيل أمر تغيير (V.O) */}
          {activeModal === 'register_vo' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!voTitle.trim()) return;
                dispatch(
                  addVariationOrder({
                    code: voCode,
                    title: voTitle.trim(),
                    project: voProject,
                    valueMillion: parseFloat(voValue) || 5,
                    date: todayStr,
                    status: voStatus,
                  })
                );
                setVoTitle('');
                closeModal();
              }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-extrabold text-purple-900 dark:text-purple-200">
                  تسجيل أمر تغيير جديد (Variation Order)
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      رقم أمر التغيير
                    </label>
                    <input
                      type="text"
                      required
                      value={voCode}
                      onChange={(e) => setVoCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      الحالة
                    </label>
                    <select
                      value={voStatus}
                      onChange={(e) =>
                        setVoStatus(e.target.value as ApprovalStatus)
                      }
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                    >
                      <option value="معتمد">معتمد</option>
                      <option value="قيد المراجعة">قيد المراجعة</option>
                      <option value="مرفوض">مرفوض</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    وصف التعديل الفني
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: تعديل نظام التكييف في الدور الإداري"
                    value={voTitle}
                    onChange={(e) => setVoTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      المشروع
                    </label>
                    <select
                      value={voProject}
                      onChange={(e) => setVoProject(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                    >
                      <option value="مشروع ABC">مشروع ABC</option>
                      <option value="مشروع Delta">مشروع Delta</option>
                      <option value="مشروع Nile">مشروع Nile</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      التكلفة (مليون ج.م)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={voValue}
                      onChange={(e) => setVoValue(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono text-slate-900 dark:text-white tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2 text-xs font-bold text-white shadow cursor-pointer"
                >
                  تسجيل أمر التغيير
                </button>
              </div>
            </form>
          )}

          {/* 6. متابعة وإضافة الاعتمادات الفنية */}
          {activeModal === 'track_approvals' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                dispatch(
                  addTechnicalApproval({
                    type: appType,
                    project: appProject,
                    date: todayStr,
                    status: 'معتمد',
                    discipline: appDiscipline,
                    referenceCode: `SUB-${Math.floor(100 + Math.random() * 899)}`,
                  })
                );
                closeModal();
              }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-extrabold text-purple-900 dark:text-purple-200">
                  متابعة وتسجيل الاعتمادات الفنية
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1.5 border border-slate-100 dark:border-slate-800 rounded-xl p-2 bg-slate-50/60 dark:bg-slate-800/50 text-xs">
                {recentApprovals.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800"
                  >
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {a.type} ({a.project})
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="font-bold text-purple-900 dark:text-purple-300">
                  إضافة طلب اعتماد فني جديد:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={appType}
                    onChange={(e) => setAppType(e.target.value)}
                    className="col-span-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  />
                  <select
                    value={appProject}
                    onChange={(e) => setAppProject(e.target.value)}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="مشروع ABC">مشروع ABC</option>
                    <option value="مشروع Delta">مشروع Delta</option>
                    <option value="مشروع Nile">مشروع Nile</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  إغلاق
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-800 hover:bg-purple-700 px-5 py-2 text-xs font-bold text-white shadow cursor-pointer"
                >
                  تسجيل اعتماد جديد
                </button>
              </div>
            </form>
          )}

          {/* 7. التقرير الفني الدوري الشامل مع خيارات التصدير إلى PDF و Excel */}
          {activeModal === 'technical_report' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-700 dark:text-purple-400" />
                  <h3 className="text-base font-extrabold text-purple-900 dark:text-purple-200">
                    تقرير المكتب الفني الدوري وتصدير البيانات (PDF / Excel)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {exportSuccessMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{exportSuccessMsg}</span>
                </div>
              )}

              {/* منطقة التقرير القابلة للتصدير المباشر إلى PDF */}
              <div
                ref={reportPrintRef}
                className="space-y-3 rounded-2xl border border-purple-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
              >
                <div className="flex flex-wrap items-center justify-between border-b border-purple-100 dark:border-slate-800 pb-2.5">
                  <div>
                    <h4 className="text-sm font-extrabold text-[#3b0764] dark:text-purple-200">
                      الشركة المصرية الهندسية للمقاولات (EEC) - إدارة المكتب الفني
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      التقرير التنفيذي للمؤشرات والجداول الهندسية · السنة المالية:{' '}
                      <span className="font-mono font-bold">{filters.year}</span>{' '}
                      · النطاق: {filters.project}
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                    {todayStr}
                  </span>
                </div>

                {/* ملخص المؤشرات الـ 7 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="rounded-xl bg-purple-50/90 dark:bg-slate-800 p-2.5">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                      إجمالي المشروعات
                    </span>
                    <span className="font-mono text-base font-extrabold text-purple-900 dark:text-purple-200 tabular-nums">
                      {baseKpis.totalProjects} مشروع
                    </span>
                  </div>
                  <div className="rounded-xl bg-emerald-50/90 dark:bg-slate-800 p-2.5">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                      نسبة الإنجاز العام
                    </span>
                    <span className="font-mono text-base font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {baseKpis.overallCompletion}%
                    </span>
                  </div>
                  <div className="rounded-xl bg-amber-50/90 dark:bg-slate-800 p-2.5">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                      إجمالي الرسومات والمقايسات
                    </span>
                    <span className="font-mono text-base font-extrabold text-amber-700 dark:text-amber-400 tabular-nums">
                      {baseKpis.totalDrawings} لوحة / {baseKpis.totalEstimates} مقايسة
                    </span>
                  </div>
                  <div className="rounded-xl bg-sky-50/90 dark:bg-slate-800 p-2.5">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                      المنصرف / التعاقدي
                    </span>
                    <span className="font-mono text-base font-extrabold text-sky-800 dark:text-sky-300 tabular-nums">
                      {baseKpis.totalDisbursedMillion} / {baseKpis.totalValueMillion} م.ج
                    </span>
                  </div>
                </div>

                {/* جدول مختصر لأهم المشروعات والاعتمادات داخل التقرير */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-2.5">
                    <h5 className="text-xs font-extrabold text-purple-900 dark:text-purple-300 mb-1.5">
                      موقف المشروعات الحالية
                    </h5>
                    <table className="w-full text-right text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                          <th className="pb-1">المشروع</th>
                          <th className="pb-1">القيمة</th>
                          <th className="pb-1">الإنجاز</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                        {projects.slice(0, 4).map((p) => (
                          <tr key={p.id}>
                            <td className="py-1 text-slate-800 dark:text-slate-200">
                              {p.name}
                            </td>
                            <td className="py-1 font-mono tabular-nums">
                              {p.valueMillion} م.ج
                            </td>
                            <td className="py-1 font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                              {p.completionRate}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-2.5">
                    <h5 className="text-xs font-extrabold text-purple-900 dark:text-purple-300 mb-1.5">
                      آخر الاعتمادات والمهام الجارية
                    </h5>
                    <table className="w-full text-right text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                          <th className="pb-1">البيان</th>
                          <th className="pb-1">المشروع</th>
                          <th className="pb-1">الموقف</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                        {recentApprovals.slice(0, 2).map((a) => (
                          <tr key={a.id}>
                            <td className="py-1 text-slate-800 dark:text-slate-200">
                              {a.type}
                            </td>
                            <td className="py-1">{a.project}</td>
                            <td className="py-1 text-emerald-700 dark:text-emerald-400">
                              {a.status}
                            </td>
                          </tr>
                        ))}
                        {currentTasks.slice(0, 2).map((t) => (
                          <tr key={t.id}>
                            <td className="py-1 text-slate-800 dark:text-slate-200">
                              {t.taskName}
                            </td>
                            <td className="py-1 font-mono">{t.project}</td>
                            <td className="py-1 font-mono text-purple-700 dark:text-purple-300 tabular-nums">
                              {t.progress}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* إحصائية أبرز الرسومات */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 px-3 py-2 text-[11px] font-bold">
                  {topDrawings.map((d) => (
                    <span key={d.id} className="text-slate-700 dark:text-slate-300">
                      {d.title}:{' '}
                      <strong className="font-mono text-purple-800 dark:text-purple-300 tabular-nums">
                        {d.count}
                      </strong>
                    </span>
                  ))}
                </div>
              </div>

              {/* أزرار التصدير الفوري إلى Excel و PDF والطباعة */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExcelDownload}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow transition cursor-pointer"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>تصدير الجداول والمؤشرات (Excel .xlsx)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePdfDownload}
                    disabled={isExportingPdf}
                    className="flex items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-600 disabled:opacity-60 px-4 py-2 text-xs font-bold text-white shadow transition cursor-pointer"
                  >
                    {isExportingPdf ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileDown className="h-4 w-4" />
                    )}
                    <span>تصدير التقرير الدوري (PDF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 rounded-xl bg-purple-800 hover:bg-purple-700 px-3.5 py-2 text-xs font-bold text-white shadow transition cursor-pointer"
                  >
                    <Printer className="h-4 w-4" />
                    <span>طباعة</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          )}

          {/* 8. نافذة توليد مذكرات تسليم الرسومات الهندسية (Transmittals) */}
          {activeModal === 'generate_transmittal' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-base font-extrabold text-purple-900 dark:text-purple-200">
                  توليد مذكرة تسليم رسومات هندسية (Drawing Transmittal)
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <TransmittalGenerator compactMode />
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
