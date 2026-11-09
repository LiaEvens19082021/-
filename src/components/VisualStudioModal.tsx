import React, { useState } from 'react';
import {
  X,
  Check,
  Copy,
  Monitor,
  Code2,
  Terminal,
  FileCode,
  FolderOpen,
  Play,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface VisualStudioModalProps {
  onClose: () => void;
}

export const VisualStudioModal: React.FC<VisualStudioModalProps> = ({ onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeGuideTab, setActiveGuideTab] = useState<'vs2022' | 'vscode' | 'bat' | 'csharp'>('vs2022');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Запуск проекта в Visual Studio
              </h3>
              <p className="text-xs text-slate-500">
                Файлы решения (.sln), проекта (.esproj) и C# (.csproj) уже добавлены в проект
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-5 pt-3 border-b border-slate-100 flex items-center gap-2 bg-white">
          <button
            type="button"
            onClick={() => setActiveGuideTab('vs2022')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeGuideTab === 'vs2022'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Visual Studio 2022 (.sln)
          </button>
          <button
            type="button"
            onClick={() => setActiveGuideTab('bat')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeGuideTab === 'bat'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            В 1 клик на Windows (.bat)
          </button>
          <button
            type="button"
            onClick={() => setActiveGuideTab('vscode')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeGuideTab === 'vscode'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Visual Studio Code
          </button>
          <button
            type="button"
            onClick={() => setActiveGuideTab('csharp')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeGuideTab === 'csharp'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            C# .NET проект
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
          {activeGuideTab === 'vs2022' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                <span className="font-semibold text-blue-900 block mb-1">
                  💡 В корне проекта создан готовый файл решения:
                </span>
                <code className="text-xs font-mono font-bold text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200">
                  ShiftScheduleApp.sln
                </code>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-700 shrink-0 text-[11px]">
                    1
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Установите Node.js (если ещё не установлен)</div>
                    <p className="text-slate-500 mt-0.5">
                      Для запуска веб-интерфейса в Visual Studio требуется бесплатный Node.js LTS (скачать с официального сайта{' '}
                      <a
                        href="https://nodejs.org/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline font-medium"
                      >
                        nodejs.org
                      </a>
                      ).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-700 shrink-0 text-[11px]">
                    2
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Откройте файл ShiftScheduleApp.sln</div>
                    <p className="text-slate-500 mt-0.5">
                      Дважды кликните по файлу <b>ShiftScheduleApp.sln</b>, либо в Visual Studio 2022 выберите{' '}
                      <b>Файл → Открыть → Проект или решение...</b>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-700 shrink-0 text-[11px]">
                    3
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Нажмите зелёную кнопку «Запуск» (или F5)</div>
                    <p className="text-slate-500 mt-0.5">
                      Visual Studio автоматически запустит локальный сервер разработки и откроет окно приложения в вашем браузере по адресу{' '}
                      <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">http://localhost:3000</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeGuideTab === 'bat' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <span className="font-semibold text-emerald-900 block mb-1">
                  ⚡ Самый быстрый способ запустить всё на компьютере:
                </span>
                <p className="text-emerald-800">
                  Вам не нужно писать команды вручную — для этого уже подготовлен командный файл.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                  <span>START_PROJECT_WINDOWS.bat</span>
                </div>
                <p className="text-slate-600">
                  Просто дважды щёлкните по файлу <b>START_PROJECT_WINDOWS.bat</b> в папке проекта.
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-500 pl-1">
                  <li>Файл сам проверит наличие Node.js на компьютере;</li>
                  <li>При первом запуске автоматически скачает библиотеки (npm install);</li>
                  <li>Сам откроет в браузере страницу <b>http://localhost:3000</b> и запустит проект.</li>
                </ul>
              </div>
            </div>
          )}

          {activeGuideTab === 'vscode' && (
            <div className="space-y-4">
              <p className="text-slate-600">
                Если вы используете <b>Visual Studio Code</b>:
              </p>
              <div className="space-y-2.5">
                <div className="flex gap-2.5 items-start">
                  <FolderOpen className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <b>1. Откройте папку:</b> В меню VS Code выберите <i>File → Open Folder...</i> и укажите папку проекта.
                  </div>
                </div>
                <div className="flex gap-2.5 items-start">
                  <Play className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <b>2. Нажмите клавишу F5:</b> В проект уже добавлены конфигурации <code>.vscode/launch.json</code> и <code>.vscode/tasks.json</code>, поэтому запуск происходит в один клик.
                  </div>
                </div>
                <div className="flex gap-2.5 items-start">
                  <Terminal className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <b>3. Или через встроенный терминал:</b> Нажмите <code>Ctrl + `</code> и введите команду:
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-xs">
                <span>npm install &amp;&amp; npm run dev</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('npm install && npm run dev', 'npm')}
                  className="p-1 rounded hover:bg-slate-800 text-slate-300 transition"
                  title="Скопировать"
                >
                  {copiedKey === 'npm' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {activeGuideTab === 'csharp' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl">
                <span className="font-semibold text-purple-900 block mb-1">
                  🔷 Нативный проект C# 7.3 / .NET 7.0 в папке /csharp/
                </span>
                <p className="text-purple-800">
                  Специально адаптирован под спецификацию <b>C# 7.3</b> и <b>.NET 7.0</b> (совместим с Visual Studio 2017, 2019, 2022). Включает полный алгоритм графиков (2/2, 5/2, 1/3, 3/3), ставок, отпусков и больничных с консольным русскоязычным интерфейсом.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-slate-900">Как запустить C# проект в Visual Studio:</div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1">
                  <li>Откройте решение <b>ShiftScheduleApp.sln</b> в Visual Studio.</li>
                  <li>
                    В Обозревателе решений найдите проект <b>ShiftScheduleCSharp</b>.
                  </li>
                  <li>
                    Щёлкните по нему правой кнопкой мыши и выберите{' '}
                    <span className="font-medium text-slate-900">«Назначить запускаемым проектом»</span>.
                  </li>
                  <li>Нажмите <b>F5 (Запуск)</b> — откроется консольное приложение с табелем и расчётом зарплаты.</li>
                </ol>
              </div>

              <div className="space-y-1">
                <div className="font-semibold text-slate-900">Либо через командную строку:</div>
                <div className="flex items-center justify-between bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-xs">
                  <span>dotnet run --project csharp/ShiftScheduleCSharp.csproj</span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard('dotnet run --project csharp/ShiftScheduleCSharp.csproj', 'dotnet')
                    }
                    className="p-1 rounded hover:bg-slate-800 text-slate-300 transition"
                    title="Скопировать"
                  >
                    {copiedKey === 'dotnet' ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Подробное руководство сохранено в файле ИНСТРУКЦИЯ_VISUAL_STUDIO.md</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            Понятно, закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
