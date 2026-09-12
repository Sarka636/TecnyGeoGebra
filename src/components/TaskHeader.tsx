import React, { useState } from 'react';
import { CircleTask, TaskType } from '../types';
import { RefreshCw, BookOpen, Circle, Compass, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';

interface TaskHeaderProps {
  task: CircleTask;
  onNewTask: (preferredType?: TaskType) => void;
  onOpenTheory: () => void;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({
  task,
  onNewTask,
  onOpenTheory,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const distanceSM = Math.hypot(task.pointM.x - task.center.x, task.pointM.y - task.center.y);

  return (
    <header
      id="app-main-header"
      className="bg-white border-b border-slate-200/80 shadow-xs sticky top-0 z-30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Brand & Task Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Tečna ke kružnici
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                1. ročník SŠ
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Didaktické procvičování planimetrických konstrukcí s GeoGebrou
            </p>
          </div>
        </div>

        {/* Action Controls & New Task Dropdown */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-end">
          <button
            id="btn-open-theory"
            onClick={onOpenTheory}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all flex items-center gap-1.5 border border-slate-200/60"
          >
            <BookOpen className="w-4 h-4 text-slate-600" />
            <span>Teorie a věty</span>
          </button>

          {/* New Task Split Button */}
          <div className="relative inline-flex rounded-xl shadow-xs">
            <button
              id="btn-new-task-main"
              onClick={() => onNewTask()}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-l-xl transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Nová úloha</span>
            </button>
            <button
              id="btn-new-task-dropdown"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-2 py-2 text-white bg-blue-700 hover:bg-blue-800 rounded-r-xl border-l border-blue-500/50 transition-colors"
              title="Vybrat typ úlohy"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {dropdownOpen && (
              <div
                id="new-task-menu"
                className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs text-slate-700"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Vyberte typ polohy bodu M:
                </div>
                <button
                  onClick={() => onNewTask('exterior')}
                  className="w-full text-left px-3.5 py-2 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between transition-colors"
                >
                  <span className="font-medium">1. Bod vně kružnice</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100/70 text-blue-800 font-semibold">2 tečny</span>
                </button>
                <button
                  onClick={() => onNewTask('on_circle')}
                  className="w-full text-left px-3.5 py-2 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between transition-colors"
                >
                  <span className="font-medium">2. Bod na kružnici</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100/70 text-amber-800 font-semibold">1 tečna</span>
                </button>
                <button
                  onClick={() => onNewTask('interior')}
                  className="w-full text-left px-3.5 py-2 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between transition-colors"
                >
                  <span className="font-medium">3. Bod uvnitř kružnice</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100/70 text-red-800 font-semibold">0 tečen</span>
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={() => onNewTask()}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-600 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Náhodný výběr</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Specification Banner */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border-t border-slate-200/60 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Circle className="w-3.5 h-3.5 text-blue-600" />
              Zadání:
            </span>
            <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200/80 font-mono text-slate-800 font-semibold shadow-2xs">
              k(S[{task.center.x}, {task.center.y}], r = {task.radius})
            </span>
            <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200/80 font-mono text-red-700 font-semibold shadow-2xs">
              M[{task.pointM.x}, {task.pointM.y}]
            </span>
            <span className="text-slate-500 font-medium hidden md:inline">
              Vzdálenost |SM| = {distanceSM.toFixed(2)} cm (poloměr r = {task.radius} cm)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Očekávaný výsledek:</span>
            {task.taskType === 'exterior' && (
              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-semibold">
                2 tečny (t₁, t₂)
              </span>
            )}
            {task.taskType === 'on_circle' && (
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold">
                1 tečna (kolmice v M)
              </span>
            )}
            {task.taskType === 'interior' && (
              <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-semibold">
                Nemá řešení (0 tečen)
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
