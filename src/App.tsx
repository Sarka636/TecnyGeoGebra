import React, { useState, useEffect, useCallback } from 'react';
import { CircleTask, GeometricObjectInfo, HintLevel, TaskType, ValidationReport } from './types';
import { generateRandomTask, evaluateConstruction } from './utils/geometryChecker';
import { TaskHeader } from './components/TaskHeader';
import { GeoGebraView, extractGeoGebraObjects } from './components/GeoGebraView';
import { DidacticPanel } from './components/DidacticPanel';
import { TheoryModal } from './components/TheoryModal';
import { StepByStepGuide } from './components/StepByStepGuide';

export default function App() {
  const [task, setTask] = useState<CircleTask>(() => generateRandomTask('exterior'));
  const [objects, setObjects] = useState<GeometricObjectInfo[]>([]);
  const [hintLevel, setHintLevel] = useState<HintLevel>(0);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isTheoryOpen, setIsTheoryOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [ggbApiInstance, setGgbApiInstance] = useState<any>(null);

  // Initialize validation report when task changes
  useEffect(() => {
    setHintLevel(0);
    setObjects([]);
    const initialReport = evaluateConstruction(task, [], false, 1);
    setReport(initialReport);
  }, [task]);

  // Handle new task generation
  const handleNewTask = useCallback((preferredType?: TaskType) => {
    const newTask = generateRandomTask(preferredType);
    setTask(newTask);
    setHintLevel(0);
    setReport(null);
  }, []);

  // Handle objects changed from GeoGebra
  const handleObjectsChange = useCallback((newObjects: GeometricObjectInfo[]) => {
    setObjects(newObjects);
  }, []);

  // Main check button action
  const handleCheck = useCallback((claimNoSolution: boolean = false) => {
    setIsChecking(true);
    setTimeout(() => {
      let currentObjects = objects;
      if (ggbApiInstance) {
        try {
          const fresh = extractGeoGebraObjects(ggbApiInstance);
          if (fresh.length > 0) {
            currentObjects = fresh;
            setObjects(fresh);
          }
        } catch (e) {
          console.warn('Could not read fresh objects on check:', e);
        }
      }
      const activeHintLevel = hintLevel === 0 ? 1 : hintLevel;
      const evaluation = evaluateConstruction(task, currentObjects, claimNoSolution, activeHintLevel);
      setReport(evaluation);
      setIsChecking(false);
    }, 100);
  }, [task, objects, ggbApiInstance, hintLevel]);

  // Handle "Nemá řešení"
  const handleClaimNoSolution = useCallback(() => {
    handleCheck(true);
  }, [handleCheck]);

  // Progressive Hint button handler (1 -> 2 -> 3)
  const handleNextHint = useCallback(() => {
    let nextLevel: HintLevel;
    if (hintLevel === 0) {
      nextLevel = 1;
    } else if (hintLevel === 1) {
      nextLevel = 2;
    } else if (hintLevel === 2) {
      nextLevel = 3;
      setIsGuideOpen(true);
    } else {
      nextLevel = 3;
      setIsGuideOpen(true);
    }
    setHintLevel(nextLevel);

    // Re-evaluate with new hint level
    const evaluation = evaluateConstruction(task, objects, report?.claimNoSolution || false, nextLevel);
    setReport(evaluation);
  }, [hintLevel, task, objects, report]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <TaskHeader
        task={task}
        onNewTask={handleNewTask}
        onOpenTheory={() => setIsTheoryOpen(true)}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Canvas Area (7 cols on lg) */}
        <section className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          <GeoGebraView
            task={task}
            onObjectsChange={handleObjectsChange}
            onAppletReady={setGgbApiInstance}
            onRequestHint={handleNextHint}
            onCheck={() => handleCheck(false)}
          />

          {/* Quick instructions & tool tips */}
          <div
            id="geogebra-tool-hints-card"
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-800">Užitečné nástroje GeoGebry:</span>
              <span className="text-slate-600">
                🔵 Bod • 📏 Úsečka / Přímka • 🎯 Střed úsečky • ⭕ Thaletova kružnice • ✖️ Průsečík
              </span>
            </div>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
            >
              Zobrazit rozbor krok za krokem →
            </button>
          </div>
        </section>

        {/* Right / Didactic Agent Panel (5 cols on lg) */}
        <section className="lg:col-span-5 xl:col-span-4 h-full">
          <DidacticPanel
            report={report}
            hintLevel={hintLevel}
            onNextHint={handleNextHint}
            onCheck={() => handleCheck(false)}
            onClaimNoSolution={handleClaimNoSolution}
            isChecking={isChecking}
          />
        </section>
      </main>

      {/* Theory & Theorems Modal */}
      <TheoryModal
        isOpen={isTheoryOpen}
        onClose={() => setIsTheoryOpen(false)}
      />

      {/* Step-by-Step Construction Guide Modal */}
      <StepByStepGuide
        task={task}
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
