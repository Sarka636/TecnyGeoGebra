import React from 'react';
import { X, BookOpen, CheckCircle, Info, Sparkles } from 'lucide-react';

interface TheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TheoryModal: React.FC<TheoryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="theory-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="theory-modal-content"
        className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold">Teorie & Planimetrické věty: Tečna ke kružnici</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs sm:text-sm text-slate-700 max-h-[75vh] overflow-y-auto">
          {/* 1. Definice tečny */}
          <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2">
            <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              1. Definice tečny a bodu dotyku
            </h4>
            <p className="leading-relaxed">
              <strong>Tečna</strong> ke kružnici $k(S, r)$ je přímka $t$, která má s kružnicí právě <strong>jeden společný bod $T$</strong> (bod dotyku).
            </p>
            <p className="leading-relaxed text-blue-950 font-medium">
              Klíčová vlastnost: Poloměr kružnice $ST$ vedený do bodu dotyku je <strong>kolmý na tečnu $t$</strong> ($ST \perp t$). Trojúhelník $STM$ je pravoúhlý s pravým úhlem u vrcholu $T$.
            </p>
          </div>

          {/* 2. Thaletova věta */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2">
            <h4 className="font-bold text-indigo-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              2. Thaletova věta a Thaletova kružnice
            </h4>
            <p className="leading-relaxed">
              Množina všech bodů $T$ v rovině, z nichž je úsečka $SM$ vidět pod pravým úhlem ($90^\circ$), je <strong>Thaletova kružnice $\tau$</strong> sestrojená nad průměrem $SM$.
            </p>
            <p className="leading-relaxed font-mono text-xs bg-white/80 p-2.5 rounded-lg border border-indigo-200/60 text-indigo-900">
              Střed Thaletovy kružnice: S_SM = (S + M) / 2<br />
              Poloměr Thaletovy kružnice: r_τ = |SM| / 2
            </p>
          </div>

          {/* 3. Počet řešení podle polohy bodu M */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900">3. Počet řešení podle polohy bodu M:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs font-bold text-blue-700 mb-1">|SM| &gt; r (Vnější bod)</div>
                <div className="text-xs text-slate-600">
                  Existují <strong>2 tečny</strong> (t₁, t₂). Thaletova kružnice protne kružnici k ve 2 bodech T₁, T₂.
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs font-bold text-amber-700 mb-1">|SM| = r (Bod na kružnici)</div>
                <div className="text-xs text-slate-600">
                  Existuje právě <strong>1 tečna</strong>. Tečna je kolmice k poloměru SM vztyčená v bodě M.
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs font-bold text-rose-700 mb-1">|SM| &lt; r (Vnitřní bod)</div>
                <div className="text-xs text-slate-600">
                  <strong>0 tečen</strong>. Každá přímka procházející vnitřním bodem je sečnou. Úloha <strong>nemá řešení</strong>.
                </div>
              </div>
            </div>
          </div>

          {/* 4. Algoritmus konstrukce */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-2">
            <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              4. Přesný zápis konstrukce (pro vnější bod M)
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-xs text-emerald-950 font-medium">
              <li>Sestrojíme úsečku SM.</li>
              <li>Najdeme střed S_SM úsečky SM.</li>
              <li>Sestrojíme Thaletovu kružnici τ(S_SM, r_τ = |S_SM S|).</li>
              <li>Určíme body dotyku jako průsečíky kružnic: {'{T₁, T₂}'} = k ∩ τ.</li>
              <li>Sestrojíme přímky t₁ = MT₁ a t₂ = MT₂.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Rozumím, pokračovat v rýsování
          </button>
        </div>
      </div>
    </div>
  );
};
