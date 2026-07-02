/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SOCIAL_ACTIVITIES_MOCK } from '../data';
import { Apple, HeartHandshake, ShoppingBag, Eye, Lock, Sparkles, TrendingUp, CheckCircle, ArrowRightLeft } from 'lucide-react';

export const SocialActivitiesTeaser: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Helper dynamic icons
  const getIcon = (name: string) => {
    switch (name) {
      case 'Apple':
        return <Apple className="w-5 h-5 text-emerald-600" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-5 h-5 text-amber-600" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5 text-indigo-600" />;
      default:
        return <HeartHandshake className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-8 relative overflow-hidden">
      {/* Visual background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-rc-red/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-rc-red bg-rc-red/10 border border-rc-red/15 px-2 py-0.5 rounded-md uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 animate-pulse text-rc-red" />
            Envisagé pour le Lot 2
          </span>
          <h4 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Espace Pilote : Activités Action Sociale (DTAS)
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
            Cette interface a été conçue pour intégrer de façon harmonieuse le domaine d'activité de votre homologue des questions sociales de la Croix-Rouge des Yvelines.
          </p>
        </div>

        {/* Lock/Unlock Toggle */}
        <button
          id="btn-toggle-lot2-preview"
          onClick={() => setIsUnlocked(!isUnlocked)}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-md transition shadow-xs cursor-pointer ${
            isUnlocked
              ? 'bg-rc-red text-white hover:bg-[#D7171E]'
              : 'bg-slate-900 text-white hover:bg-black border border-slate-800'
          }`}
        >
          {isUnlocked ? (
            <>
              <Eye className="w-4 h-4" />
              Réduire la démo DTAS
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              Débloquer l'aperçu conceptuel (Lot 2)
            </>
          )}
        </button>
      </div>

      {!isUnlocked ? (
        <div className="text-center py-8 px-4 max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500 shadow-2xs">
            <Lock className="w-6 h-6 text-slate-400" />
          </div>
          <h5 className="font-bold text-slate-800 text-sm">Maquette d'intégration DTAS prête</h5>
          <p className="text-xs text-slate-500 leading-relaxed mt-2">
            Notre module d'import flexible est structuré de façon à étendre les visualisations de bénévolat aux équipes d'aides alimentaires, de maraudes de convivialité et de vestiboutiques sans perturber le code existant.
          </p>
          <button
            onClick={() => setIsUnlocked(true)}
            className="text-xs text-rc-red font-bold hover:underline mt-4 inline-flex items-center gap-1 cursor-pointer"
          >
            Voir la simulation interactive maintenant
            <span>→</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Informational Box */}
          <div className="p-4 bg-indigo-50 border border-indigo-100/60 rounded-xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
            <div className="text-xs text-indigo-950 leading-relaxed">
              <p className="font-bold mb-0.5">Note de conception opérationnelle :</p>
              Les données sociales ci-dessous simulent les KPI d'accueil et d'accompagnement du département des Yvelines. Grâce au routeur unifié, l'import Excel pourra à l'avenir accepter des colonnes supplémentaires pour les tonnes de colis ou les personnes reçues.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SOCIAL_ACTIVITIES_MOCK.map((item) => (
              <div
                id={`social-card-${item.id}`}
                key={item.id}
                className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      {getIcon(item.iconName)}
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      Prog. Objectifs : {item.strategicProgress}%
                    </span>
                  </div>

                  <h5 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h5>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{item.description}</p>
                </div>

                {/* Simulated Metrics list */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  {item.metrics.map((m, mIdx) => (
                    <div key={mIdx} className="flex justify-between items-center text-xs">
                      <div>
                        <span className="block text-xs font-semibold text-slate-700">{m.label}</span>
                        <span className="text-[10px] text-slate-400">{m.sublabel}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-slate-850">{m.value}</span>
                        <span className="text-[10px] text-emerald-600 ml-1.5 font-bold">
                          {m.trend === 'up' ? '↑' : m.trend === 'down' ? '↓' : 'stable'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Small indicator light */}
                <div className="mt-4 pt-3 flex items-center justify-between text-[10px] text-indigo-600 border-t border-slate-105/60 font-semibold uppercase tracking-wider">
                  <span>Projeté à horizon 4 ans</span>
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-500" />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-100 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-3 border border-slate-200">
            <span className="text-xs text-slate-600 font-medium">
              Voulez-vous soumettre ou tester d'autres perspectives pour vos élus ?
            </span>
            <button
              onClick={() => setIsUnlocked(false)}
              className="text-xs text-slate-500 font-bold hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Retourner aux activités de Secours (DTUS)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
