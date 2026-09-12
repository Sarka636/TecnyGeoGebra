import React, { useState } from 'react';
import { CircleTask } from '../types';
import { ChevronRight, ChevronLeft, Play, CheckCircle2, Compass, Layers } from 'lucide-react';

interface StepByStepGuideProps {
  task: CircleTask;
  isOpen: boolean;
  onClose: () => void;
}

export const StepByStepGuide: React.FC<StepByStepGuideProps> = ({ task, isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const isExterior = task.taskType === 'exterior';
  const isOnCircle = task.taskType === 'on_circle';
  const isInterior = task.taskType === 'interior';

  const exteriorSteps = [
    {
      title: 'Krok 1: Úsečka SM',
      desc: 'Spojte střed kružnice S a daný bod M úsečkou SM.',
      notation: '1. úsečka SM',
      tip: 'Použijte v GeoGebře nástroj „Úsečka“ a klikněte na body S a M.',
    },
    {
      title: 'Krok 2: Střed úsečky SM (S_SM)',
      desc: 'Najděte střed úsečky SM a označte jej jako S_SM.',
      notation: '2. S_SM; S_SM je střed SM',
      tip: 'Použijte nástroj „Střed nebo středobod“ a klikněte na úsečku SM.',
    },
    {
      title: 'Krok 3: Thaletova kružnice τ',
      desc: 'Sestrojte kružnici τ se středem v bodě S_SM a poloměrem |S_SM S| (prochází body S i M).',
      notation: '3. τ(S_SM, r = |S_SM S|)',
      tip: 'Použijte nástroj „Kružnice daná středem a bodem“: klikněte na S_SM a pak na S.',
    },
    {
      title: 'Krok 4: Průsečíky T₁ a T₂ (Body dotyku)',
      desc: 'Průsečíky původní kružnice k a Thaletovy kružnice τ jsou hledané body dotyku T₁ a T₂.',
      notation: '4. {T₁, T₂} = k ∩ τ',
      tip: 'Použijte nástroj „Průsečík“ a klikněte na obě kružnice k a τ.',
    },
    {
      title: 'Krok 5: Sestrojení tečen t₁ a t₂',
      desc: 'Veďte přímky spojující bod M s nalezenými body dotyku T₁ a T₂. Tyto přímky jsou hledané tečny.',
      notation: '5. t₁ = MT₁, t₂ = MT₂',
      tip: 'Použijte nástroj „Přímka“ pro přímku MT₁ a pro přímku MT₂.',
    },
  ];

  const onCircleSteps = [
    {
      title: 'Krok 1: Spojnice středu a bodu (Poloměr SM)',
      desc: 'Sestrojte poloměr nebo přímku procházející středem S a bodem M na kružnici.',
      notation: '1. přímka SM',
      tip: 'Použijte nástroj „Přímka“ nebo „Úsečka“.',
    },
    {
      title: 'Krok 2: Kolmice v bodě M',
      desc: 'V bodě M sestrojte přímku kolmou k přímce SM. Tato kolmice je hledaná tečna t.',
      notation: '2. t ⊥ SM v bodě M',
      tip: 'Použijte nástroj „Kolmice“: klikněte na bod M a na přímku SM.',
    },
  ];

  const interiorSteps = [
    {
      title: 'Analýza polohy bodu M',
      desc: 'Vzdálenost |SM| je menší než poloměr kružnice r (|SM| < r).',
      notation: '|SM| < r ⇒ M ∈ vnitřek k',
      tip: 'Každá přímka procházející vnitřkem kružnice je sečnou se 2 průsečíky.',
    },
    {
      title: 'Závěr: Nemá řešení',
      desc: 'Z vnitřního bodu nelze sestrojit žádnou tečnu. Klikněte na tlačítko „Úloha nemá řešení“.',
      notation: 'Počet řešení = 0',
      tip: 'Úloha nemá v oboru reálných čísel žádné řešení.',
    },
  ];

  const steps = isExterior ? exteriorSteps : isOnCircle ? onCircleSteps : interiorSteps;

  return (
    <div
      id="guide-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="guide-modal-box"
        className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 bg-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold">Úplný průvodce konstrukcí (Úroveň nápovědy 3)</h3>
          </div>
          <span className="text-xs bg-indigo-800/60 px-2.5 py-0.5 rounded-full text-indigo-200">
            {currentStep + 1} / {steps.length}
          </span>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 rounded-full bg-blue-600 text-white items-center justify-center text-xs font-bold">
              {currentStep + 1}
            </span>
            <h4 className="font-bold text-slate-900 text-sm">{steps[currentStep].title}</h4>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">{steps[currentStep].desc}</p>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Zápis konstrukce:</div>
            <div className="font-mono text-xs font-semibold text-blue-900">
              {steps[currentStep].notation}
            </div>
          </div>

          <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900">
            <strong>GeoGebra tip:</strong> {steps[currentStep].tip}
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 flex items-center gap-1 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Předchozí
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors"
            >
              Další krok
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors"
            >
              Rozumím, jdu rýsovat
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
