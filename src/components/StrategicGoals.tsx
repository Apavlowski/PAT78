/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StrategicGoal, MetierType, ParsedDpsRow, ParsedDtDirectRow, ParsedReseauRow, getYearFromDateString, ParsedFormationPublicRow } from '../types';
import { 
  Target, 
  ListChecks, 
  TrendingUp, 
  CheckCircle, 
  Sliders, 
  Check, 
  X, 
  Edit2, 
  Info, 
  Home, 
  Activity, 
  Users, 
  FileSignature, 
  DollarSign, 
  Briefcase,
  Layers,
  GraduationCap,
  FlameKindling,
  ShieldCheck,
  RotateCcw,
  Coins
} from 'lucide-react';

interface StrategicGoalsProps {
  goals: StrategicGoal[];
  selectedCategory: MetierType;
  onUpdateProgress: (goalId: string, newValue: number) => void;
  onUpdateFullVal?: (goalId: string, startVal: number, currentVal: number, targetVal: number) => void;
  dpsRows?: ParsedDpsRow[] | null;
  dtDirectRows?: ParsedDtDirectRow[] | null;
  reseauRows?: ParsedReseauRow[] | null;
  formationRows?: ParsedFormationPublicRow[] | null;
}

export const StrategicGoals: React.FC<StrategicGoalsProps> = ({
  goals,
  selectedCategory,
  onUpdateProgress,
  onUpdateFullVal,
  dpsRows,
  dtDirectRows,
  reseauRows,
  formationRows
}) => {
  // Sync internal tab state with top-level active metier
  const [activeTab, setActiveTab] = useState<MetierType>(selectedCategory);

  // Determine the last full year. Since we are in 2026, the last full year is 2025.
  // We can look at the years present in our data, and select the highest year that is strictly less than 2026 (or default to 2025).
  const dpsYears = dpsRows ? dpsRows.map(r => getYearFromDateString(r.debut)) : [];
  const dtYears = dtDirectRows ? dtDirectRows.map(r => getYearFromDateString(r.date)) : [];
  const formationYears = formationRows ? formationRows.map(r => r.year) : [];
  const allYears = Array.from(new Set([...dpsYears, ...dtYears, ...formationYears])).filter(y => y > 2000 && y < 2100);
  
  const lastFullYear = allYears.filter(y => y < 2026).length > 0
    ? Math.max(...allYears.filter(y => y < 2026))
    : 2025;

  // Dynamic calculation for PSC persons trained (EPSC + PSC CLASSIQUE) for the last full year
  const activeEpscFormed = formationRows
    ? formationRows.filter(r => r.year === lastFullYear)
        .reduce((sum, r) => sum + (r.epscStagiaires || 0), 0)
    : 0;

  const activePscFormed = formationRows
    ? formationRows.filter(r => r.year === lastFullYear)
        .reduce((sum, r) => sum + (r.pscStagiaires || 0), 0)
    : 0;

  const totalPscFormed = activeEpscFormed + activePscFormed;
  const hasFormationData = totalPscFormed > 0;

  // Dynamic calculations for standard 4p/4h (16 hrs) DPS equivalence restricted to the last full year
  const activeLocalDpsHours = dpsRows
    ? dpsRows.filter(r => {
        if (r.isIgnored) return false;
        // Verify it belongs to the last full year
        if (getYearFromDateString(r.debut) !== lastFullYear) return false;
        const s = r.statut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return s.includes('confirme') || s.includes('cloture') || s.includes('realise') || s.includes('valide');
      }).reduce((sum, r) => sum + r.heuresBenevolatCalculees, 0)
    : 0;

  const activeDtDirectHours = dtDirectRows
    ? dtDirectRows.filter(r => {
        // Verify it belongs to the last full year
        return getYearFromDateString(r.date) === lastFullYear;
      }).reduce((sum, r) => sum + (r.duree * r.nbSecouristes), 0)
    : 0;

  const totalSecourismeVolunteerHours = activeLocalDpsHours + activeDtDirectHours;
  const computedDpsEquivalents = Math.round(totalSecourismeVolunteerHours / 16);
  const hasLoadedData = totalSecourismeVolunteerHours > 0;

  // Dynamic financial products calculations for the last full year (e.g. 2025)
  const localDpsTarifTotal = dpsRows
    ? dpsRows.filter(r => {
        if (r.isIgnored) return false;
        if (getYearFromDateString(r.debut) !== lastFullYear) return false;
        if (r.ul.toUpperCase() === 'DT') return false;
        const s = r.statut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return s.includes('confirme') || s.includes('cloture') || s.includes('realise') || s.includes('valide');
      }).reduce((sum, r) => sum + (r.tarifTheorique || 0), 0)
    : 0;

  const localDpsPrelevementTotal = dpsRows
    ? dpsRows.filter(r => {
        if (r.isIgnored) return false;
        if (getYearFromDateString(r.debut) !== lastFullYear) return false;
        if (r.ul.toUpperCase() === 'DT') return false;
        const s = r.statut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return s.includes('confirme') || s.includes('cloture') || s.includes('realise') || s.includes('valide');
      }).reduce((sum, r) => sum + (r.prelevement || 0), 0)
    : 0;

  const dtDirectDevisTotal = dtDirectRows
    ? dtDirectRows.filter(r => {
        return getYearFromDateString(r.date) === lastFullYear;
      }).reduce((sum, r) => sum + (r.devisSecours || 0), 0)
    : 0;

  const dtDirectRepasTotal = dtDirectRows
    ? dtDirectRows.filter(r => {
        return getYearFromDateString(r.date) === lastFullYear;
      }).reduce((sum, r) => sum + (r.repas || 0), 0)
    : 0;

  const dtDirectNetInvoicing = dtDirectDevisTotal - dtDirectRepasTotal;

  const hasFinancialData = localDpsTarifTotal > 0 || dtDirectDevisTotal > 0;
  const computedDpsInvoicingTotal = localDpsTarifTotal + dtDirectNetInvoicing;
  const prelevementPercentage = localDpsTarifTotal > 0
    ? Math.round((localDpsPrelevementTotal / localDpsTarifTotal) * 100)
    : 0;

  useEffect(() => {
    setActiveTab(selectedCategory);
  }, [selectedCategory]);

  const filteredGoals = goals.filter(g => g.category === activeTab);

  // Editing State
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editStartVal, setEditStartVal] = useState<number>(0);
  const [editCurrentVal, setEditCurrentVal] = useState<number>(0);
  const [editTargetVal, setEditTargetVal] = useState<number>(0);

  const startEditing = (goal: StrategicGoal) => {
    setEditingGoalId(goal.id);
    setEditStartVal(goal.startValue ?? 0);
    setEditCurrentVal(goal.currentValue);
    setEditTargetVal(goal.targetValue);
  };

  const handleSave = (goalId: string) => {
    if (onUpdateFullVal) {
      onUpdateFullVal(goalId, editStartVal, editCurrentVal, editTargetVal);
    } else {
      onUpdateProgress(goalId, editCurrentVal);
    }
    setEditingGoalId(null);
  };

  const resetToDefault = (goalId: string) => {
    // Basic reset helper based on original values
    const original = goals.find(g => g.id === goalId);
    if (original) {
      setEditStartVal(original.startValue ?? 0);
      setEditCurrentVal(original.currentValue);
      setEditTargetVal(original.targetValue);
    }
  };

  // Counting helpers for tab labels
  const countGoals = (cat: MetierType) => goals.filter(g => g.category === cat).length;

  const getStatusBadge = (progress: number) => {
    if (progress >= 100) {
      return (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <CheckCircle className="w-3.5 h-3.5" />
          Réussite 100%
        </span>
      );
    }
    if (progress >= 60) {
      return (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 shadow-3xs">
          <TrendingUp className="w-3.5 h-3.5" />
          En bonne voie
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 text-center">
        Initialisé
      </span>
    );
  };

  // Dynamic colors & decorations based on active tab
  const getTabStyles = (tab: MetierType) => {
    const isActive = activeTab === tab;
    switch (tab) {
      case 'urgence':
        return isActive
          ? 'bg-amber-600 text-white shadow-md shadow-amber-600/15 border-amber-600'
          : 'bg-white text-slate-600 hover:text-amber-700 hover:bg-amber-50/50 border-slate-250';
      case 'formation':
        return isActive
          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/15 border-blue-600'
          : 'bg-white text-slate-600 hover:text-blue-700 hover:bg-blue-50/50 border-slate-250';
      case 'secourisme':
        return isActive
          ? 'bg-rc-red text-white shadow-md shadow-rc-red/15 border-rc-red'
          : 'bg-white text-slate-600 hover:text-rc-red hover:bg-red-50/50 border-slate-250';
      default:
        return '';
    }
  };

  const getIndicatorDecoration = (tab: MetierType) => {
    switch (tab) {
      case 'urgence': return 'border-l-4 border-l-amber-500';
      case 'formation': return 'border-l-4 border-l-blue-500';
      case 'secourisme': return 'border-l-4 border-l-rc-red';
    }
  };

  const getCardWidthStyles = (count: number) => {
    if (count === 1) {
      return "w-full max-w-2xl mx-auto";
    }
    if (count === 2) {
      return "w-full md:w-[calc(50%-12px)] max-w-lg md:max-w-xl grow";
    }
    if (count === 3) {
      return "w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-md lg:max-w-lg grow";
    }
    return "w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] max-w-md xl:max-w-[340px] grow";
  };

  return (
    <div className="bg-white text-slate-800 rounded-xl border border-slate-200 shadow-md p-6 relative overflow-hidden print:border-none print:shadow-none">
      {/* Decorative colored top line based on the active domain */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 transition-colors duration-500 ${
        activeTab === 'urgence' ? 'bg-amber-500' : activeTab === 'formation' ? 'bg-blue-500' : 'bg-rc-red'
      }`} />

      {/* Main possessive strategic identifier */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-100 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-xl transition-all duration-300 ${
            activeTab === 'urgence' ? 'bg-amber-50 text-amber-600' : activeTab === 'formation' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-rc-red'
          }`}>
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-extrabold text-slate-950 tracking-tight flex items-center flex-wrap gap-2">
              Plan d'Action Territorial
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded border font-mono uppercase bg-slate-50 border-slate-200 text-slate-500">
                Horizon 2030 (4 Ans)
              </span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Suivi et valorisation des indicateurs de performance à long terme de la Croix-Rouge française des Yvelines.
            </p>
          </div>
        </div>

        {/* Global summary count */}
        <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 bg-slate-50 border border-slate-150 px-3.5 py-2 rounded-lg">
          <ListChecks className="w-4 h-4 text-slate-400" />
          <span>{goals.length} Objectifs opérationnels cumulés</span>
        </div>
      </div>

      {/* 3 tabs navigation representing the operational domains requested by the user */}
      <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200/80 mb-6 flex flex-col md:flex-row gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('secourisme')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 text-xs font-bold rounded-lg border transition-all cursor-pointer ${getTabStyles('secourisme')}`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Secourisme</span>
          <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded-full ${
            activeTab === 'secourisme' ? 'bg-white/20 text-white' : 'bg-red-100 text-rc-red'
          }`}>
            {countGoals('secourisme')}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('urgence')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 text-xs font-bold rounded-lg border transition-all cursor-pointer ${getTabStyles('urgence')}`}
        >
          <FlameKindling className="w-4 h-4" />
          <span>Urgence et soutien de crise</span>
          <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded-full ${
            activeTab === 'urgence' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
          }`}>
            {countGoals('urgence')}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('formation')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 text-xs font-bold rounded-lg border transition-all cursor-pointer ${getTabStyles('formation')}`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Formation Sécurité Civile</span>
          <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded-full ${
            activeTab === 'formation' ? 'bg-white/20 text-white' : 'bg-blue-105 text-blue-800'
          }`}>
            {countGoals('formation')}
          </span>
        </button>
      </div>

      {/* Main explanation pane depending on active tab */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 flex items-start gap-3.5">
        <Info className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-slate-600 leading-relaxed">
          {activeTab === 'urgence' && (
            <p>
              <strong>Urgence et soutien de crise</strong> : Couvre le plan d'équipement d'urgence territoriale comprenant les lots matériels spécialisés 
              <span className="font-semibold text-amber-700"> (CAI, CHU, CMCC et PAI)</span>, le déploiement d’Équipes Locales de l’Urgence (ÉLU), 
              la contractualisation de conventions communales avec les maires du département et le recrutement de formateurs spécialisés aux logistiques de crise.
            </p>
          )}
          {activeTab === 'formation' && (
            <p>
              <strong>Formation Sécurité Civile</strong> : Met l'accent sur l'extension du taux d'équipement de la population générale yvelinoise au 
              <span className="font-semibold text-blue-700"> Secours Civique de niveau 1 (PSC1)</span> et le management du réseau de moniteurs et formateurs d'adultes requis pour son acheminement.
            </p>
          )}
          {activeTab === 'secourisme' && (
            <p>
              <strong>Secourisme</strong> : Recense l'activité des <span className="font-semibold text-rc-red">Dispositifs Prévisionnels de Secours (DPS)</span>, 
              le volume de recettes générées réinvesties dans le département, ainsi que l'encadrement diplômant des équipiers de premiers secours (PSE1 / PSE2).
            </p>
          )}
        </div>
      </div>

      {/* Grid of indicators */}
      <div className="flex flex-wrap justify-center gap-6">
        {filteredGoals.map(goal => {
          const startVal = goal.startValue ?? 0;
          let currentVal = goal.currentValue;
          
          if (goal.id === 'sec_dps_count' && hasLoadedData) {
            currentVal = computedDpsEquivalents;
          } else if (goal.id === 'sec_dps_finance' && hasFinancialData) {
            currentVal = Math.round(computedDpsInvoicingTotal / 1000); // in k€
          } else if (goal.id === 'for_psc_formees' && hasFormationData) {
            currentVal = totalPscFormed;
          }

          const targetVal = goal.targetValue;
          
          // Math for calculating percentage progress proportionally from departure to target
          const totalDelta = targetVal - startVal;
          const actualDelta = currentVal - startVal;
          
          let progressRatioPercent = 0;
          if (totalDelta > 0) {
            progressRatioPercent = Math.min(Math.round((actualDelta / totalDelta) * 100), 100);
          } else {
            progressRatioPercent = targetVal > 0 ? Math.min(Math.round((currentVal / targetVal) * 100), 100) : 0;
          }
          progressRatioPercent = Math.max(0, progressRatioPercent);

          const isEditing = editingGoalId === goal.id;

          return (
            <div
              id={`pos-goal-box-${goal.id}`}
              key={goal.id}
              className={`bg-white rounded-xl p-5 border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-all ${getIndicatorDecoration(activeTab)} ${getCardWidthStyles(filteredGoals.length)}`}
            >
              {/* Top part grouped in a flex-col to prevent vertical separation of top components */}
              <div className="flex-1 flex flex-col space-y-4 mb-4">
                {/* Box Top Title */}
                <div className="space-y-1.5 flex-shrink-0 md:min-h-[96px]">
                  <div className="flex items-start justify-between gap-1.5">
                    <h5 className="text-xs font-bold text-slate-900 tracking-tight leading-normal">
                      {goal.title}
                    </h5>
                    {getStatusBadge(progressRatioPercent)}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    {goal.description}
                  </p>
                </div>

              {/* Graphical Progress timeline featuring Departure -> Today -> Target */}
              <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg space-y-3.5">
                {/* Horizontal segment timeline */}
                <div className="relative pt-2 pb-1 mx-1.5">
                  {/* Gray background track */}
                  <div className="absolute top-[0.65rem] left-0 right-0 h-1 bg-slate-200 rounded-full" />
                  
                  {/* Highly evident transition gauge */}
                  <div 
                    className={`absolute top-[0.65rem] left-0 h-1 rounded-full transition-all duration-500 ${
                      activeTab === 'urgence' ? 'bg-amber-500' : activeTab === 'formation' ? 'bg-blue-500' : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${progressRatioPercent}%` }}
                  />

                  {/* Node points represent indices milestones */}
                  <div className="relative flex justify-between z-10">
                    {/* Depart node */}
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white shadow-3xs" />
                    
                    {/* Dynamic current indicator element proportional */}
                    <div 
                      className="absolute transition-all duration-500" 
                      style={{ 
                        left: `${progressRatioPercent}%`, 
                        transform: 'translateX(-50%)' 
                      }}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs flex items-center justify-center animate-pulse ${
                        activeTab === 'urgence' ? 'bg-amber-500' : activeTab === 'formation' ? 'bg-blue-500' : 'bg-emerald-500'
                      }`}>
                        <div className="w-1 h-1 bg-white rounded-full" />
                      </div>
                    </div>

                    {/* Target Node */}
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-700 border-2 border-white shadow-3xs" />
                  </div>
                </div>

                {/* Values values metrics alignment */}
                <div className="grid grid-cols-3 text-center gap-1">
                  <div className="text-left">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Départ</span>
                    <span className="text-xs font-semibold font-mono text-slate-600">{startVal}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Valeur Actuelle</span>
                    <span className={`text-[13px] font-extrabold font-mono inline-block px-1 rounded ${
                      activeTab === 'urgence' ? 'text-amber-700 bg-amber-50' : activeTab === 'formation' ? 'text-blue-700 bg-blue-50' : 'text-emerald-700 bg-emerald-50'
                    }`}>{currentVal}</span>
                    {((goal.id === 'sec_dps_count' && hasLoadedData) || (goal.id === 'sec_dps_finance' && hasFinancialData) || (goal.id === 'for_psc_formees' && hasFormationData)) && (
                      <span className="block text-[7px] text-emerald-600 font-extrabold uppercase tracking-wide mt-0.5 animate-pulse">Auto-Calculé</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Objectif</span>
                    <span className="text-xs font-bold font-mono text-slate-700 block truncate">{targetVal} {goal.unit ? goal.unit.split(' ')[0] : ''}</span>
                  </div>
                </div>

                {/* Percentage progress box */}
                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60 font-medium">
                  <span className="text-slate-400 block pb-0.5">Avancement :</span>
                  <span className={`font-bold font-mono px-2 py-0.5 rounded text-[10px] ${
                    progressRatioPercent >= 100 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : activeTab === 'urgence' 
                      ? 'bg-amber-105 text-amber-700' 
                      : activeTab === 'formation' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {progressRatioPercent}% de l'objectif
                  </span>
                </div>
              </div>

              {/* Special Dynamic DPS Equivalents Panel */}
              {goal.id === 'sec_dps_count' && (
                <div className="bg-red-50/60 border border-red-200/80 rounded-xl p-3.5 text-[11px] space-y-2 leading-tight">
                  <div className="flex flex-col gap-0.5 justify-start mb-1">
                    <div className="flex items-center gap-1.5 font-bold text-rc-red text-[11px] uppercase tracking-wider">
                      <Activity className="w-3.5 h-3.5 shrink-0" />
                      <span>Calculateur d'Équivalents (Dernière Année Pleine : {lastFullYear})</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-medium italic pl-5">
                      Filtre exclusif sur la dernière année pleine clôturée ({lastFullYear})
                    </span>
                  </div>
                  {hasLoadedData ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-slate-600">
                        <span>DPS Locaux :</span>
                        <span className="font-semibold font-mono text-slate-800">{activeLocalDpsHours.toLocaleString('fr-FR')} h</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>DPS Directs DT :</span>
                        <span className="font-semibold font-mono text-slate-800">{activeDtDirectHours.toLocaleString('fr-FR')} h</span>
                      </div>
                      <div className="flex justify-between border-t border-red-200 pt-1.5 text-slate-800 font-extrabold text-[11px]">
                        <span>Cumul Bénévolat DPS :</span>
                        <span className="font-mono text-rc-red">{totalSecourismeVolunteerHours.toLocaleString('fr-FR')} h</span>
                      </div>
                      <div className="bg-white border border-red-100 rounded-lg p-2 mt-2 text-slate-950 font-extrabold flex items-center justify-between text-[11px] shadow-3xs">
                        <span className="text-slate-500 font-bold">Éq. DPS (base 16h) :</span>
                        <span className="text-rc-red text-xs font-black font-mono bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">{computedDpsEquivalents} {computedDpsEquivalents > 1 ? 'postes' : 'poste'}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[10px] leading-relaxed italic">
                      Importez vos rapports DPS locaux et DT pour l'année {lastFullYear} pour voir la conversion d'heures cumulées en équivalent DPS de 4 secouristes durant 4h (16h de bénévolat).
                    </p>
                  )}
                </div>
              )}

              {/* Special Dynamic DPS Financial Products Panel */}
              {goal.id === 'sec_dps_finance' && (
                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5 text-[11px] space-y-2 leading-tight">
                  <div className="flex flex-col gap-0.5 justify-start mb-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-[11px] uppercase tracking-wider">
                      <Coins className="w-3.5 h-3.5 shrink-0 animate-bounce" />
                      <span>Reconstitution Financière ({lastFullYear})</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-medium italic pl-5">
                      Filtre exclusif sur la dernière année pleine clôturée ({lastFullYear})
                    </span>
                  </div>
                  {hasFinancialData ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-slate-600">
                        <span>Postes Locaux (Tarif global) :</span>
                        <span className="font-semibold font-mono text-slate-800">{localDpsTarifTotal.toLocaleString('fr-FR')} €</span>
                      </div>
                      <div className="flex justify-between text-slate-600 items-baseline">
                        <span className="flex items-center gap-1">
                          <span>Part prélevée DT sur Locaux :</span>
                          <span className="text-[9px] text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded font-extrabold">{prelevementPercentage}%</span>
                        </span>
                        <span className="font-semibold font-mono text-slate-800">{localDpsPrelevementTotal.toLocaleString('fr-FR')} €</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Postes Directs DT (Cumul Devis) :</span>
                        <span className="font-semibold font-mono text-slate-800">{dtDirectDevisTotal.toLocaleString('fr-FR')} €</span>
                      </div>
                      <div className="flex justify-between text-slate-500 italic pl-2 text-[10px]">
                        <span>└─ Déduction Frais de Repas DT :</span>
                        <span>-{dtDirectRepasTotal.toLocaleString('fr-FR')} €</span>
                      </div>
                      <div className="flex justify-between border-t border-emerald-200 pt-1.5 text-slate-850 font-extrabold text-[11px] bg-white border border-emerald-100 p-2 rounded-lg mt-2 shadow-3xs">
                        <span className="text-slate-500 font-bold">Invoicing total reconstitué :</span>
                        <span className="text-emerald-800 text-xs font-black font-mono">
                          {computedDpsInvoicingTotal.toLocaleString('fr-FR')} €
                          <span className="text-[9px] text-slate-500 font-normal ml-1">
                            ({(computedDpsInvoicingTotal / 1000).toFixed(1)} k€)
                          </span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[10px] leading-relaxed italic">
                      Importez vos rapports DPS locaux (tarif théorique & prélèvement) et de postes directs DT (devis secours et repas déduits) pour l'année {lastFullYear} afin d'analyser la reconstitution de la facturation globale et le taux de prélèvement.
                    </p>
                  )}
                </div>
              )}

              {/* Special Dynamic PSC Trained citizens Panel */}
              {goal.id === 'for_psc_formees' && (
                <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5 text-[11px] space-y-2 leading-tight">
                  <div className="flex flex-col gap-0.5 justify-start mb-1">
                    <div className="flex items-center gap-1.5 font-bold text-blue-800 text-[11px] uppercase tracking-wider">
                      <GraduationCap className="w-3.5 h-3.5 shrink-0 animate-pulse" />
                      <span>Consolidation Formations ({lastFullYear})</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-medium italic pl-5">
                      Somme cumulée de l'EPSC et du PSC classique ({lastFullYear})
                    </span>
                  </div>
                  {hasFormationData ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-slate-600">
                        <span>Initiations EPSC (Stagiaires) :</span>
                        <span className="font-semibold font-mono text-slate-800">{activeEpscFormed.toLocaleString('fr-FR')}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Formations PSC classique (Stagiaires) :</span>
                        <span className="font-semibold font-mono text-slate-800">{activePscFormed.toLocaleString('fr-FR')}</span>
                      </div>
                      <div className="flex justify-between border-t border-blue-200 pt-1.5 text-slate-850 font-extrabold text-[11px] bg-white border border-blue-100 p-2 rounded-lg mt-2 shadow-3xs">
                        <span className="text-slate-500 font-bold">Total Sécurité Civile consolidé :</span>
                        <span className="text-blue-800 text-xs font-black font-mono">
                          {totalPscFormed.toLocaleString('fr-FR')} personnes
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[10px] leading-relaxed italic">
                      Importez vos bilans de formation d'Unité Locale pour l'année {lastFullYear} pour consolider automatiquement le nombre de citoyens formés.
                    </p>
                  )}
                </div>
              )}

              </div>

              {/* Action Button & In-Line Edit Form Container */}
              <div className="mt-auto">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => startEditing(goal)}
                    className="w-full flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg cursor-pointer transition-all shadow-3xs"
                  >
                    <Edit2 className="w-3 h-3 text-slate-400" />
                    Valoriser & Modifier
                  </button>
                ) : (
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-250 space-y-3 shadow-inner">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                      <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Sliders className="w-3 h-3 text-slate-400" />
                        Ajuster l'indicateur
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingGoalId(null)}
                        className="text-slate-400 hover:text-slate-650 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-0.5">
                        <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wide">Départ</label>
                        <input
                          type="number"
                          value={editStartVal}
                          onChange={(e) => setEditStartVal(Number(e.target.value))}
                          className="w-full px-1.5 py-0.5 text-xs font-mono font-bold text-slate-700 border border-slate-250 bg-white rounded focus:border-slate-400 focus:outline-none focus:ring-0"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wide">Actuel</label>
                        <input
                          type="number"
                          value={editCurrentVal}
                          onChange={(e) => setEditCurrentVal(Number(e.target.value))}
                          className="w-full px-1.5 py-0.5 text-xs font-mono font-bold text-slate-800 border border-slate-250 bg-white rounded focus:border-indigo-400 focus:outline-none focus:ring-0"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wide">Objectif</label>
                        <input
                          type="number"
                          value={editTargetVal}
                          onChange={(e) => setEditTargetVal(Number(e.target.value))}
                          className="w-full px-1.5 py-0.5 text-xs font-mono font-bold text-slate-800 border border-slate-250 bg-white rounded focus:border-slate-400 focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>

                    <div className="flex gap-1.5 justify-between pt-1 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => resetToDefault(goal.id)}
                        title="Restaurer les valeurs initiales"
                        className="p-1 text-slate-400 hover:text-slate-600 rounded bg-white border border-slate-200"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>

                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingGoalId(null)}
                          className="px-2 py-0.5 text-[9px] font-bold text-slate-500 bg-white hover:bg-slate-50 border border-slate-200 rounded"
                        >
                          Fermer
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSave(goal.id)}
                          className="px-2.5 py-0.5 text-[9px] font-bold text-white bg-slate-800 hover:bg-slate-900 rounded flex items-center gap-0.5 shadow-2xs"
                        >
                          <Check className="w-2.5 h-2.5" />
                          OK
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
