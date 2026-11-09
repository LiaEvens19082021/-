import React, { useState } from 'react';
import { X, Copy, Check, Download, Code2, Monitor } from 'lucide-react';
import { CSHARP_MODELS_CODE, CSHARP_CALCULATOR_CODE, CSHARP_WPF_XAML } from '../utils/csharpGenerator.ts';

interface CSharpCodeModalProps {
  onClose: () => void;
}

export const CSharpCodeModal: React.FC<CSharpCodeModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'models' | 'engine' | 'xaml' | 'guide'>('guide');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const getActiveCode = () => {
    switch (activeTab) {
      case 'models':
        return CSHARP_MODELS_CODE;
      case 'engine':
        return CSHARP_CALCULATOR_CODE;
      case 'xaml':
        return CSHARP_WPF_XAML;
      default:
        return '';
    }
  };

  const handleCopy = (code: string, tabName: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Проект для Microsoft Visual Studio на C# (.NET)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  WPF интерфейс
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Готовый код графического приложения на C# (не консоль) с моделями и расчётом зарплаты
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'guide'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              📖 Инструкция
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('models')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'models'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Models.cs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('engine')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'engine'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              ScheduleCalculator.cs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('xaml')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'xaml'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              MainWindow.xaml
            </button>
          </div>

          {activeTab !== 'guide' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(getActiveCode(), activeTab)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs transition"
              >
                {copiedTab === activeTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Скопировано!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Скопировать код</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDownloadFile(
                    activeTab === 'xaml' ? 'MainWindow.xaml' : `${activeTab}.cs`,
                    getActiveCode()
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Скачать файл</span>
              </button>
            </div>
          )}
        </div>

        {/* Code & Guide Content Body */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs">
          {activeTab === 'guide' ? (
            <div className="font-sans space-y-4 text-slate-700">
              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200">
                <h4 className="text-sm font-bold text-purple-900 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-purple-600" />
                  <span>Пошаговое руководство для запуска в Visual Studio</span>
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Вы можете пользоваться текущим веб-приложением прямо сейчас в браузере, а если вам нужно решение на C# в Visual Studio с графическим интерфейсом (не консоль), выполните 4 шага:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Создайте проект в Visual Studio</h5>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Откройте <strong>Visual Studio 2022 / 2026</strong> → «Создание проекта» → выберите шаблон <strong>«Приложение WPF (.NET)»</strong> (или Windows Forms) → Имя проекта: <code className="text-purple-700 font-semibold">ShiftScheduleApp</code>.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Добавьте файл Models.cs</h5>
                    <p className="text-slate-500 text-xs mt-0.5">
                      В Обозревателе решений правой кнопкой → Добавить → Класс <code className="text-purple-700 font-semibold">Models.cs</code>. Скопируйте код из вкладки <strong>Models.cs</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Добавьте ScheduleCalculator.cs</h5>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Добавьте файл <code className="text-purple-700 font-semibold">ScheduleCalculator.cs</code> и вставьте туда алгоритм расчёта графиков 2/2, 5/2, 1/3, больничных и отпускных.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    4
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Вставьте графический интерфейс в MainWindow.xaml</h5>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Откройте <code className="text-purple-700 font-semibold">MainWindow.xaml</code> и замените разметку на код из вкладки <strong>MainWindow.xaml</strong>. Нажмите <strong>F5</strong> для запуска!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
              <code>{getActiveCode()}</code>
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Совместимо с Visual Studio 2022 / 2026 (.NET 8 / 9)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
