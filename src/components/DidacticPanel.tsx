import React from 'react';
import { HintLevel, ValidationReport } from '../types';
import {
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  HelpCircle,
  ArrowRightCircle,
  ShieldCheck,
  Ban,
  Sparkles,
  Layers,
  Award,
} from 'lucide-react';

interface DidacticPanelProps {
  report: ValidationReport | null;
  hintLevel: HintLevel;
  onNextHint: () => void;
  onCheck: () => void;
  onClaimNoSolution: () => void;
  isChecking?: boolean;
}

export const DidacticPanel: React.FC<DidacticPanelProps> = ({
  report,
  hintLevel,
  onNextHint,
  onCheck,
  onClaimNoSolution,
  isChecking = false,
}) => {
  const feedback = report?.didacticFeedback;

  return (
    <aside
      id="didactic-agent-panel"
      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-full"
    >
      {/* Panel Header */}
      <div
        id="didactic-panel-header"
        className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              Didaktický průvodce
            </h2>
            <p className="text-[11px] text-slate-300 font-normal">
              Metodické vedení pro 1. ročník SŠ
            </p>
          </div>
        </div>

        {/* Hint Level Indicator */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-semibold">
          <span className="text-slate-300 text-[11px]">Nápověda:</span>
          <span className="text-amber-300 font-bold">
            {hintLevel === 0 ? 'Připravena' : `Úroveň ${hintLevel}/3`}
          </span>
        </div>
      </div>

      {/* Main Feedback Content Container */}
      <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
        {/* Status Alert Banner if evaluated */}
        {report && (
          <div
            id="validation-status-badge"
            className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
              report.status === 'correct' || report.status === 'no_solution_correct'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : report.status === 'partially_correct' || report.status === 'missing_thales_method'
                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                : report.status === 'empty'
                ? 'bg-blue-50/80 border-blue-200 text-blue-900'
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}
          >
            {report.status === 'correct' || report.status === 'no_solution_correct' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : report.status === 'partially_correct' || report.status === 'missing_thales_method' ? (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : report.status === 'empty' ? (
              <Layers className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-xs uppercase tracking-wider">
                {report.status === 'correct' && 'Konstrukce je zcela správná! 🎉'}
                {report.status === 'no_solution_correct' && 'Správné vyhodnocení – úloha nemá řešení! 🎯'}
                {report.status === 'partially_correct' && 'Částečně hotovo – 1 tečna ověřena'}
                {report.status === 'missing_thales_method' && 'Chybí Thaletova kružnice (odhadnuté tečny)'}
                {report.status === 'empty' && 'Rýsovací plocha připravena'}
                {report.status === 'incorrect' && 'Zatím neodpovídá podmínkám tečny'}
                {report.status === 'no_solution_incorrect' && 'Pozor: Tato úloha řešení má'}
              </p>
              <p className="text-[11px] mt-0.5 opacity-90">
                Ověřeno geometrickým kontrolorem (vzdálenost |SM| = {report.distanceSM.toFixed(2)}, poloměr r = {report.radius}).
              </p>
            </div>
          </div>
        )}

        {/* 5-POINT DIDACTIC FEEDBACK STRUCTURE */}
        {feedback ? (
          <div id="didactic-5-points" className="space-y-3">
            {/* 1. Jedna konkrétní správná věc */}
            <div
              id="feedback-point-1"
              className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-slate-800 space-y-1"
            >
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>1. Co je v konstrukci správně:</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed pl-5 font-medium">
                {feedback.correctItem}
              </p>
            </div>

            {/* 2. Nejdůležitější chyba */}
            <div
              id="feedback-point-2"
              className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-slate-800 space-y-1"
            >
              <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>2. Hlavní nedostatek / chyba:</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed pl-5 font-medium">
                {feedback.mainMistake}
              </p>
            </div>

            {/* 3. Jedna nápověda */}
            <div
              id="feedback-point-3"
              className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-slate-800 space-y-1"
            >
              <div className="flex items-center justify-between text-indigo-900 font-bold text-xs">
                <div className="flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-indigo-600" />
                  <span>3. Didaktická nápověda:</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                  {hintLevel === 0 ? 'Úroveň 1' : `Úroveň ${hintLevel}`}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed pl-5 whitespace-pre-line font-medium">
                {feedback.hint}
              </p>
            </div>

            {/* 4. Jedna otázka pro žáka */}
            <div
              id="feedback-point-4"
              className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-slate-800 space-y-1"
            >
              <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>4. Otázka k zamyšlení pro tebe:</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed pl-5 italic font-medium">
                „{feedback.studentQuestion}“
              </p>
            </div>

            {/* 5. Jeden další proveditelný krok */}
            <div
              id="feedback-point-5"
              className="p-3 bg-slate-100/80 rounded-xl border border-slate-200 text-slate-800 space-y-1"
            >
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                <ArrowRightCircle className="w-4 h-4 text-slate-700" />
                <span>5. Tvůj další doporučený krok:</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed pl-5 font-semibold">
                {feedback.nextActionableStep}
              </p>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <Layers className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-medium text-slate-600">
              Začni rýsovat tečny v GeoGebře a klikni na „Zkontrolovat“.
            </p>
            <p className="text-[11px] text-slate-400">
              Didaktický průvodce ti poskytne zpětnou vazbu k tvému postupu.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons Bar at bottom of panel */}
      <div
        id="didactic-panel-actions"
        className="p-4 bg-slate-50 border-t border-slate-200/80 space-y-2.5"
      >
        <div className="grid grid-cols-2 gap-2">
          {/* Primary Check Button */}
          <button
            id="btn-check-construction"
            onClick={onCheck}
            disabled={isChecking}
            className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isChecking ? 'Kontroluji...' : 'Zkontrolovat'}</span>
          </button>

          {/* Hint Progressive Button */}
          <button
            id="btn-request-hint"
            onClick={onNextHint}
            className="w-full py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Lightbulb className="w-4 h-4 text-indigo-600" />
            <span>
              {hintLevel === 0 ? 'Nápověda 1' : hintLevel === 1 ? 'Nápověda 2' : hintLevel === 2 ? 'Nápověda 3' : 'Zopakovat nápovědu'}
            </span>
          </button>
        </div>

        {/* Claim No Solution Button */}
        <button
          id="btn-claim-no-solution"
          onClick={onClaimNoSolution}
          className="w-full py-2 px-3 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-red-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <Ban className="w-3.5 h-3.5" />
          <span>Úloha nemá řešení (0 tečen)</span>
        </button>
      </div>
    </aside>
  );
};
