/**
 * @file components/TransmittalGenerator.tsx
 * @description نظام توليد مذكرات تسليم الرسومات الهندسية (Transmittals) تلقائياً بناءً على اختيار الرسومات من قائمة المشروع، مع إضافة ملاحظات ورقم مرجعي ومعاينة/طباعة وتصدير PDF
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FileCheck2,
  Send,
  Printer,
  FileDown,
  CheckSquare,
  Square,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  addTransmittal,
  setSelectedDrawingsForTransmittal,
  toggleDrawingForTransmittal,
  updateTransmittalStatus,
} from '../store/slices/dashboardSlice';
import {
  TransmittalDrawingSnapshot,
  TransmittalNote,
  TransmittalPurpose,
} from '../types/dashboard';
import { exportElementToPdf } from '../utils/exportService';

interface TransmittalGeneratorProps {
  compactMode?: boolean;
}

export const TransmittalGenerator: React.FC<TransmittalGeneratorProps> = ({
  compactMode = false,
}) => {
  const dispatch = useAppDispatch();
  const {
    drawingsList,
    transmittalsList,
    selectedDrawingIdsForTransmittal,
    filters,
  } = useAppSelector((s) => s.dashboard);

  const todayStr = new Date().toISOString().slice(0, 10);

  // توليد رقم مرجعي قياسي تلقائي لمذكرة التسليم
  const generateAutoRefNumber = (projName: string, count: number) => {
    const codeMap: Record<string, string> = {
      'مشروع ABC': 'ABC',
      'مشروع Delta': 'DLT',
      'مشروع Nile': 'NIL',
      'مشروع Capital': 'CAP',
    };
    const projCode = codeMap[projName] || 'EEC';
    const seq = String(count + 1).padStart(3, '0');
    return `TRN-${projCode}-${filters.year}-${seq}`;
  };

  const [selectedProject, setSelectedProject] = useState<string>(
    filters.project !== 'جميع المشروعات' ? filters.project : 'مشروع ABC'
  );
  const [referenceNumber, setReferenceNumber] = useState<string>(() =>
    generateAutoRefNumber('مشروع ABC', transmittalsList.length)
  );
  const [recipient, setRecipient] = useState<string>(
    'المكتب الاستشاري الهندسي العام للمشروع'
  );
  const [attention, setAttention] = useState<string>(
    'السيد المهندس / مدير إدارة الإشراف والاعتمادات الفنية'
  );
  const [purpose, setPurpose] =
    useState<TransmittalPurpose>('للاعتماد والتنفيذ');
  const [copiesPerDrawing, setCopiesPerDrawing] = useState<number>(3);
  const [notes, setNotes] = useState<string>(
    'مرفق لسيادتكم النسخ القياسية للرسومات التنفيذية الموضحة بالجدول أدناه، برجاء المراجعة والاعتماد للبدء في التنفيذ بالموقع.'
  );

  // مذكرة التسليم المختارة للمعاينة الرسمية أو الطباعة
  const [previewTransmittal, setPreviewTransmittal] =
    useState<TransmittalNote | null>(transmittalsList[0] || null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const printSheetRef = useRef<HTMLDivElement>(null);

  // تحديث الرقم المرجعي تلقائياً عند تغيير المشروع أو عدد المذكرات
  useEffect(() => {
    setReferenceNumber(
      generateAutoRefNumber(selectedProject, transmittalsList.length)
    );
  }, [selectedProject, transmittalsList.length]);

  // قائمة الرسومات الخاصة بالمشروع المختار
  const projectDrawings = useMemo(
    () => drawingsList.filter((d) => d.project === selectedProject),
    [drawingsList, selectedProject]
  );

  // الرسومات المحددة حالياً داخل المشروع المختار
  const selectedProjectDrawings = useMemo(
    () =>
      projectDrawings.filter((d) =>
        selectedDrawingIdsForTransmittal.includes(d.id)
      ),
    [projectDrawings, selectedDrawingIdsForTransmittal]
  );

  const handleSelectAllProjectDrawings = () => {
    if (selectedProjectDrawings.length === projectDrawings.length) {
      dispatch(setSelectedDrawingsForTransmittal([]));
    } else {
      dispatch(
        setSelectedDrawingsForTransmittal(projectDrawings.map((d) => d.id))
      );
    }
  };

  const handleGenerateTransmittal = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProjectDrawings.length === 0) return;

    const snapshots: TransmittalDrawingSnapshot[] = selectedProjectDrawings.map(
      (d) => ({
        drawingId: d.id,
        code: d.code,
        title: d.title,
        discipline: d.discipline,
        revision: d.revision,
        copiesCount: copiesPerDrawing,
      })
    );

    const newNotePayload: Omit<TransmittalNote, 'id'> = {
      referenceNumber:
        referenceNumber.trim() ||
        generateAutoRefNumber(selectedProject, transmittalsList.length),
      project: selectedProject,
      recipient: recipient.trim() || 'الاستشاري الهندسي للمشروع',
      attention: attention.trim() || 'مدير الإشراف الهندسي',
      issueDate: todayStr,
      purpose,
      notes:
        notes.trim() ||
        'مرفق لسيادتكم اللوحات الهندسية الموضحة أعلاه للمراجعة والاعتماد.',
      drawings: snapshots,
      issuedBy: 'م. حسام أحمد',
      status: 'صادر',
    };

    dispatch(addTransmittal(newNotePayload));
    setPreviewTransmittal({
      ...newNotePayload,
      id: `TRN-${Date.now().toString().slice(-4)}`,
    });

    setSuccessBanner(
      `تم توليد وإصدار مذكرة تسليم الرسومات رقم (${newNotePayload.referenceNumber}) بنجاح (${snapshots.length} لوحات)`
    );
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleExportPreviewPdf = async () => {
    if (!printSheetRef.current || !previewTransmittal || isExportingPdf) return;
    try {
      setIsExportingPdf(true);
      await exportElementToPdf(
        printSheetRef.current,
        `مذكرة_تسليم_رسومات_${previewTransmittal.referenceNumber}`
      );
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="print-card rounded-2xl border border-purple-200/90 dark:border-purple-900/60 bg-white/95 dark:bg-slate-900/95 p-4 shadow-sm space-y-4">
      {/* رأس النظام */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
            <FileCheck2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-[#1e1b4b] dark:text-purple-100">
              نظام توليد مذكرات تسليم الرسومات الهندسية (Drawing Transmittals)
            </h3>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              اختر المشروع وحدد اللوحات الهندسية لتوليد مذكرة تسليم رسمية برقم مرجعي وملاحظات فنية قابلة للطباعة والتصدير
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="rounded-xl bg-purple-50 dark:bg-slate-800 px-3 py-1 text-purple-900 dark:text-purple-200 border border-purple-200/60 dark:border-slate-700">
            إجمالي المذكرات الصادرة:{' '}
            <strong className="font-mono tabular-nums">
              {transmittalsList.length}
            </strong>
          </span>
        </div>
      </div>

      {successBanner && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* شبكة العمل: العمود الأيمن (اختيار رسومات المشروع وإعداد المذكرة) + العمود الأيسر (معاينة مذكرة التسليم الرسمية وسجل المذكرات) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* 1. نموذج اختيار الرسومات وتوليد المذكرة (6 أعمدة) */}
        <form
          onSubmit={handleGenerateTransmittal}
          className="no-print xl:col-span-6 space-y-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3.5 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* اختيار المشروع */}
            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-200 mb-1">
                1. اختيار المشروع الهندسي
              </label>
              <select
                value={selectedProject}
                onChange={(e) => {
                  setSelectedProject(e.target.value);
                  dispatch(setSelectedDrawingsForTransmittal([]));
                }}
                className="w-full rounded-xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 font-bold text-slate-900 dark:text-white focus:border-purple-600 focus:outline-none"
              >
                <option value="مشروع ABC">مشروع ABC</option>
                <option value="مشروع Delta">مشروع Delta</option>
                <option value="مشروع Nile">مشروع Nile</option>
                <option value="مشروع Capital">مشروع Capital</option>
              </select>
            </div>

            {/* الرقم المرجعي للمذكرة */}
            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-200 mb-1">
                2. الرقم المرجعي للمذكرة (Reference No.)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full rounded-xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 font-mono font-bold text-purple-900 dark:text-purple-200 focus:border-purple-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setReferenceNumber(
                      generateAutoRefNumber(
                        selectedProject,
                        transmittalsList.length
                      )
                    )
                  }
                  title="توليد رقم مرجعي تلقائي"
                  className="rounded-xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-purple-700 dark:text-purple-300 hover:bg-purple-50 cursor-pointer shrink-0"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* قائمة اختيار الرسومات من المشروع المحدد */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-extrabold text-slate-700 dark:text-slate-200">
                3. تحديد الرسومات الهندسية المرفقة من قائمة ({selectedProject})
              </label>
              <button
                type="button"
                onClick={handleSelectAllProjectDrawings}
                className="text-[11px] font-extrabold text-purple-700 dark:text-purple-300 hover:underline cursor-pointer"
              >
                {selectedProjectDrawings.length === projectDrawings.length &&
                projectDrawings.length > 0
                  ? 'إلغاء تحديد الكل'
                  : `تحديد كافة لوحات المشروع (${projectDrawings.length})`}
              </button>
            </div>

            <div className="max-h-44 overflow-y-auto space-y-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2">
              {projectDrawings.length === 0 ? (
                <p className="py-4 text-center text-slate-400">
                  لا توجد لوحات مسجلة لهذا المشروع حالياً
                </p>
              ) : (
                projectDrawings.map((drw) => {
                  const isChecked =
                    selectedDrawingIdsForTransmittal.includes(drw.id);
                  return (
                    <div
                      key={drw.id}
                      onClick={() =>
                        dispatch(toggleDrawingForTransmittal(drw.id))
                      }
                      className={`flex items-center justify-between rounded-lg px-2.5 py-2 transition cursor-pointer ${
                        isChecked
                          ? 'bg-purple-50 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-700'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isChecked ? (
                          <CheckSquare className="h-4 w-4 text-purple-700 dark:text-purple-400 shrink-0" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-400 shrink-0" />
                        )}
                        <span
                          dir="ltr"
                          className="font-mono font-extrabold text-purple-800 dark:text-purple-300 shrink-0"
                        >
                          [{drw.code}]
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
                          {drw.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">
                          {drw.discipline}
                        </span>
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {drw.revision}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* بيانات الجهة المرسل إليها والغرض من التسليم */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                الجهة المرسل إليها
              </label>
              <input
                type="text"
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                الغرض من التسليم
              </label>
              <select
                value={purpose}
                onChange={(e) =>
                  setPurpose(e.target.value as TransmittalPurpose)
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-bold text-slate-900 dark:text-white"
              >
                <option value="للاعتماد والتنفيذ">للاعتماد والتنفيذ</option>
                <option value="للمراجعة وإبداء الرأي">
                  للمراجعة وإبداء الرأي
                </option>
                <option value="للعلم والإحاطة">للعلم والإحاطة</option>
                <option value="تسليم نهائي (As-Built)">
                  تسليم نهائي (As-Built)
                </option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                عدد النسخ لكل لوحة
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={copiesPerDrawing}
                onChange={(e) =>
                  setCopiesPerDrawing(parseInt(e.target.value, 10) || 1)
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono font-bold text-slate-900 dark:text-white tabular-nums"
              />
            </div>
          </div>

          {/* الملاحظات الفنية المرفقة بالمذكرة */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              4. ملاحظات وتوصيات المكتب الفني على مذكرة التسليم
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أدخل أي ملاحظات فنية أو اشتراطات خاصة بتسليم الرسومات..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-purple-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              اللوحات المحددة:{' '}
              <strong className="font-mono text-purple-800 dark:text-purple-300">
                {selectedProjectDrawings.length}
              </strong>{' '}
              لوحة
            </span>

            <button
              type="submit"
              disabled={selectedProjectDrawings.length === 0}
              className="flex items-center gap-1.5 rounded-xl bg-purple-800 hover:bg-purple-700 disabled:opacity-50 px-5 py-2 text-xs font-extrabold text-white shadow transition cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>توليد وإصدار مذكرة التسليم (Transmittal)</span>
            </button>
          </div>
        </form>

        {/* 2. معاينة نموذج مذكرة التسليم الرسمية القابلة للطباعة والتصدير (6 أعمدة) */}
        <div className="xl:col-span-6 flex flex-col justify-between space-y-3">
          {previewTransmittal ? (
            <div
              ref={printSheetRef}
              className="rounded-2xl border-2 border-purple-300/90 dark:border-purple-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3 text-xs"
            >
              {/* ترويسة نموذج Transmittal الرسمي */}
              <div className="flex items-start justify-between border-b-2 border-purple-900 dark:border-purple-700 pb-2.5">
                <div>
                  <h4 className="text-sm font-extrabold text-[#3b0764] dark:text-purple-200">
                    الشركة المصرية الهندسية للمقاولات (EEC)
                  </h4>
                  <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    قطاع المكتب الفني · مذكرة تسليم رسومات هندسية (Drawing
                    Transmittal)
                  </p>
                </div>
                <div className="text-left font-mono">
                  <span className="inline-block rounded-lg bg-purple-900 text-white px-2.5 py-1 text-xs font-extrabold">
                    {previewTransmittal.referenceNumber}
                  </span>
                  <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                    التاريخ: {previewTransmittal.issueDate}
                  </span>
                </div>
              </div>

              {/* بيانات المرسل إليه والمشروع والغرض */}
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-purple-50/60 dark:bg-slate-800/70 p-2.5 text-[11px] font-bold border border-purple-100 dark:border-slate-700">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    المشروع:{' '}
                  </span>
                  <span className="text-slate-900 dark:text-white">
                    {previewTransmittal.project}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    الغرض:{' '}
                  </span>
                  <span className="text-purple-800 dark:text-purple-300">
                    {previewTransmittal.purpose}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    إلى:{' '}
                  </span>
                  <span className="text-slate-900 dark:text-white">
                    {previewTransmittal.recipient}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    عناية:{' '}
                  </span>
                  <span className="text-slate-800 dark:text-slate-200">
                    {previewTransmittal.attention}
                  </span>
                </div>
              </div>

              {/* جدول اللوحات المرفقة داخل المذكرة */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-[11px]">
                  <thead>
                    <tr className="bg-purple-100/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold">
                      <th className="py-1.5 px-2 rounded-r-lg">#</th>
                      <th className="py-1.5 px-2">رقم اللوحة</th>
                      <th className="py-1.5 px-2">عنوان الرسم الهندسي</th>
                      <th className="py-1.5 px-2">التخصص</th>
                      <th className="py-1.5 px-2">الإصدار</th>
                      <th className="py-1.5 px-2 rounded-l-lg text-center">
                        النسخ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                    {previewTransmittal.drawings.map((d, idx) => (
                      <tr key={`${d.drawingId}-${idx}`}>
                        <td className="py-1.5 px-2 font-mono tabular-nums">
                          {idx + 1}
                        </td>
                        <td
                          dir="ltr"
                          className="py-1.5 px-2 font-mono text-purple-800 dark:text-purple-300"
                        >
                          {d.code}
                        </td>
                        <td className="py-1.5 px-2 text-slate-900 dark:text-white">
                          {d.title}
                        </td>
                        <td className="py-1.5 px-2 text-slate-600 dark:text-slate-300">
                          {d.discipline}
                        </td>
                        <td className="py-1.5 px-2 font-mono text-emerald-700 dark:text-emerald-400">
                          {d.revision}
                        </td>
                        <td className="py-1.5 px-2 font-mono text-center tabular-nums">
                          {d.copiesCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* الملاحظات والتوقيعات */}
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2.5 border border-slate-200/70 dark:border-slate-700 text-[11px]">
                <span className="font-extrabold text-slate-800 dark:text-slate-200 block mb-0.5">
                  ملاحظات المكتب الفني:
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {previewTransmittal.notes}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                <span>إعداد واعتماد: {previewTransmittal.issuedBy}</span>
                <span>توقيع المستلم (الاستشاري): ____________________</span>
              </div>
            </div>
          ) : null}

          {/* أزرار طباعة وتصدير المذكرة المعروضة */}
          {previewTransmittal && (
            <div className="no-print flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                معاينة المذكرة:{' '}
                <strong className="font-mono text-purple-800 dark:text-purple-300">
                  {previewTransmittal.referenceNumber}
                </strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportPreviewPdf}
                  disabled={isExportingPdf}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-600 disabled:opacity-50 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                >
                  {isExportingPdf ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileDown className="h-3.5 w-3.5" />
                  )}
                  <span>تصدير المذكرة (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-800 hover:bg-purple-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>طباعة المذكرة</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* سجل مذكرات تسليم الرسومات الصادرة (Transmittal Log) */}
      {!compactMode && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs sm:text-sm font-extrabold text-[#1e1b4b] dark:text-purple-200 mb-2">
            سجل مذكرات تسليم الرسومات الصادرة (Transmittals Register)
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-purple-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  <th className="py-2 px-3 rounded-r-xl">الرقم المرجعي</th>
                  <th className="py-2 px-3">المشروع</th>
                  <th className="py-2 px-3">الجهة المستلمة</th>
                  <th className="py-2 px-3">الغرض</th>
                  <th className="py-2 px-3">الرسومات المرفقة</th>
                  <th className="py-2 px-3">تاريخ الإصدار</th>
                  <th className="py-2 px-3">الحالة (انقر للتحديث)</th>
                  <th className="no-print py-2 px-3 rounded-l-xl text-left">
                    معاينة
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                {transmittalsList.map((trn) => (
                  <tr
                    key={trn.id}
                    className="hover:bg-purple-50/50 dark:hover:bg-slate-800/60 transition"
                  >
                    <td
                      dir="ltr"
                      className="py-2.5 px-3 font-mono text-purple-800 dark:text-purple-300 text-right"
                    >
                      {trn.referenceNumber}
                    </td>
                    <td className="py-2.5 px-3 text-slate-900 dark:text-white">
                      {trn.project}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {trn.recipient}
                    </td>
                    <td className="py-2.5 px-3 text-purple-800 dark:text-purple-300">
                      {trn.purpose}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-slate-800 dark:text-slate-200">
                        {trn.drawings.length} لوحات (
                        {trn.drawings.map((d) => d.code).join(', ')})
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                      {trn.issueDate}
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            updateTransmittalStatus({
                              id: trn.id,
                              status:
                                trn.status === 'صادر'
                                  ? 'قيد المراجعة'
                                  : trn.status === 'قيد المراجعة'
                                  ? 'مستلم ومعتمد'
                                  : 'صادر',
                            })
                          )
                        }
                        className={`inline-flex items-center gap-1 cursor-pointer ${
                          trn.status === 'مستلم ومعتمد'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : trn.status === 'قيد المراجعة'
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-sky-700 dark:text-sky-400'
                        }`}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>{trn.status}</span>
                      </button>
                    </td>
                    <td className="no-print py-2.5 px-3 text-left">
                      <button
                        type="button"
                        onClick={() => setPreviewTransmittal(trn)}
                        className="inline-flex items-center gap-1 rounded-lg bg-purple-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-extrabold text-purple-900 dark:text-purple-200 hover:bg-purple-200 cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>عرض المذكرة</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
