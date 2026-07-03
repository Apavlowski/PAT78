/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Filter, 
  Stethoscope, 
  Search, 
  Building2, 
  Calendar, 
  Clock, 
  Coins, 
  HeartHandshake, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Check, 
  ArrowRight,
  TrendingUp,
  Download,
  Flame,
  Info,
  RotateCcw
} from 'lucide-react';
import { ParsedDtDirectRow, MetierStats, getYearFromDateString } from '../types';

// Convert dates to human readable French format JJ/MM/AAAA
const formatDateToFR = (dateStr?: string): string => {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (/^\d{2}\/\d{2}\/\d{4}/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2}))?/);
  if (match) {
    const [_, year, month, day, hr, min] = match;
    const datePart = `${day}/${month}/${year}`;
    if (hr && min) {
      return `${datePart} ${hr}:${min}`;
    }
    return datePart;
  }
  return trimmed;
};

interface DtDirectRegistryViewProps {
  isOpen: boolean;
  onClose: () => void;
  dtDirectRows: ParsedDtDirectRow[] | null;
  setDtDirectRows: (rows: ParsedDtDirectRow[] | null) => void;
  fileName: string;
  setFileName: (name: string) => void;
  onDataImported: (newStats: MetierStats[]) => void;
  currentStats: MetierStats[];
}

const SIMULATED_DT_DIRECT_DATA: ParsedDtDirectRow[] = [
  {
    label: "Festival Electro Yvelines Direct DT",
    date: "2026-07-10",
    duree: 12,
    nbSecouristes: 16,
    devisSecours: 4800,
    devisCrss: "Médecin + Infirmier CRSS",
    isMedicalise: true,
    reversementUl: 3200,
    repas: 240,
    caNet: 4560,
    nbVacations4h: 48,
    nbSoins: 35,
    nbDecharge: 4,
    nbEvac: 3,
    nbAutre: 12,
    nbPetitsSoins: 20,
    nbTrauma: 10,
    nbMalaise: 18,
    nbInconscient: 2,
    nbAcr: 0,
    gainDt: 1360
  },
  {
    label: "Triathlon International de Rambouillet",
    date: "2026-06-14",
    duree: 8,
    nbSecouristes: 10,
    devisSecours: 2400,
    devisCrss: "",
    isMedicalise: false,
    reversementUl: 1600,
    repas: 150,
    caNet: 2250,
    nbVacations4h: 20,
    nbSoins: 14,
    nbDecharge: 0,
    nbEvac: 1,
    nbAutre: 4,
    nbPetitsSoins: 10,
    nbTrauma: 8,
    nbMalaise: 4,
    nbInconscient: 0,
    nbAcr: 0,
    gainDt: 650
  },
  {
    label: "Meeting Aérien de Saint-Cyr-l'École",
    date: "2026-09-05",
    duree: 9,
    nbSecouristes: 12,
    devisSecours: 3200,
    devisCrss: "Infirmier urgentiste",
    isMedicalise: true,
    reversementUl: 2200,
    repas: 180,
    caNet: 3020,
    nbVacations4h: 27,
    nbSoins: 8,
    nbDecharge: 1,
    nbEvac: 0,
    nbAutre: 3,
    nbPetitsSoins: 5,
    nbTrauma: 4,
    nbMalaise: 3,
    nbInconscient: 0,
    nbAcr: 0,
    gainDt: 820
  },
  {
    label: "Raid VTT des Portes de l'Île-de-France",
    date: "2026-05-17",
    duree: 7,
    nbSecouristes: 8,
    devisSecours: 1900,
    devisCrss: "",
    isMedicalise: false,
    reversementUl: 1300,
    repas: 100,
    caNet: 1800,
    nbVacations4h: 14,
    nbSoins: 11,
    nbDecharge: 2,
    nbEvac: 1,
    nbAutre: 2,
    nbPetitsSoins: 6,
    nbTrauma: 7,
    nbMalaise: 2,
    nbInconscient: 0,
    nbAcr: 0,
    gainDt: 500
  },
  {
    label: "Feu d'artifice majeur des Yvelines",
    date: "2026-07-13",
    duree: 6,
    nbSecouristes: 18,
    devisSecours: 3900,
    devisCrss: "UMPC DT",
    isMedicalise: true,
    reversementUl: 2700,
    repas: 200,
    caNet: 3700,
    nbVacations4h: 27,
    nbSoins: 22,
    nbDecharge: 1,
    nbEvac: 2,
    nbAutre: 5,
    nbPetitsSoins: 14,
    nbTrauma: 12,
    nbMalaise: 7,
    nbInconscient: 1,
    nbAcr: 0,
    gainDt: 1000
  }
];

export const DtDirectRegistryView: React.FC<DtDirectRegistryViewProps> = ({
  isOpen,
  onClose,
  dtDirectRows,
  setDtDirectRows,
  fileName,
  setFileName,
  onDataImported,
  currentStats
}) => {
  const [filterMed, setFilterMed] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  const handleLoadSimulation = () => {
    setDtDirectRows(SIMULATED_DT_DIRECT_DATA);
    setFileName("Simulation_DT_Direct_Juin2026.xlsx");
    setFeedbackMsg("Profil type validé ! 5 postes en direct de la DT injectés avec succès.");
    setTimeout(() => setFeedbackMsg(''), 4500);
  };

  // Helper to parse date to timestamp for reliable chronological sorting
  const parseDateToTimestamp = (dateStr?: string): number => {
    if (!dateStr) return 0;
    const trimmed = dateStr.trim();
    
    // YYYY-MM-DD
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2}))?/);
    if (isoMatch) {
      const [_, year, month, day, hr, min] = isoMatch;
      return new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        hr ? parseInt(hr, 10) : 0,
        min ? parseInt(min, 10) : 0
      ).getTime();
    }

    // DD/MM/YYYY
    const frMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
    if (frMatch) {
      const [_, day, month, year, hr, min] = frMatch;
      return new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        hr ? parseInt(hr, 10) : 0,
        min ? parseInt(min, 10) : 0
      ).getTime();
    }

    const ts = Date.parse(trimmed);
    return isNaN(ts) ? 0 : ts;
  };

  const toggleMedicalised = (row: ParsedDtDirectRow) => {
    if (!dtDirectRows) return;
    const copied = [...dtDirectRows];
    const originalIndex = copied.findIndex(r => r === row);
    if (originalIndex === -1) return;
    const current = copied[originalIndex];
    current.isMedicalise = !current.isMedicalise;
    current.devisCrss = current.isMedicalise ? "Médecin / Infirmier SSU" : "";
    setDtDirectRows(copied);
    setFeedbackMsg(`La médicalisation du poste "${current.label}" a été modifiée.`);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleInjectFromRegistry = () => {
    if (!dtDirectRows) return;

    const totalDtDirectPosts = dtDirectRows.length;
    const calculatedHours = Math.round(dtDirectRows.reduce((sum, r) => sum + (r.duree * r.nbSecouristes), 0));

    // Deep copy of original stats
    const updatedStats: MetierStats[] = JSON.parse(JSON.stringify(currentStats));
    const secourismeObj = updatedStats.find(m => m.id === 'secourisme');

    if (secourismeObj) {
      const yearStats2026 = secourismeObj.history.find(h => h.year === 2026);
      if (yearStats2026) {
        // Accumulate or set sustainably on top of pre-loaded DPS
        // We set cumulative logic to display them clearly or replace beautifully
        yearStats2026.activitiesCount += totalDtDirectPosts;
        yearStats2026.volunteerHours += calculatedHours;
      }

      // Format as beautiful rows in breakdown
      const dtBreakdowns = dtDirectRows.map(r => ({
        name: `[DT Direct] ${r.label}`,
        count: 1,
        hours: Math.round(r.duree * r.nbSecouristes)
      }));

      const existingBreakdown = secourismeObj.breakdown2026.filter(b => !b.name.startsWith('[DT Direct]'));
      secourismeObj.breakdown2026 = [...dtBreakdowns, ...existingBreakdown].slice(0, 6);
    }

    onDataImported(updatedStats);
    setFeedbackMsg(`Symphonie réussie ! ${totalDtDirectPosts} postes (pour ${calculatedHours.toLocaleString('fr-FR')} h de bénévolat) ont été injectés cumulativement.`);
    setTimeout(() => setFeedbackMsg(''), 4500);
  };

  const handleClearAll = () => {
    setDtDirectRows(null);
    setFileName('');
    setFeedbackMsg("Registre des postes directs DT vidé.");
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const availableYears = React.useMemo(() => {
    if (!dtDirectRows) return [];
    const yearsSet = new Set<string>();
    dtDirectRows.forEach(row => {
      if (row.date) {
        const yr = getYearFromDateString(row.date);
        yearsSet.add(String(yr));
      }
    });
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [dtDirectRows]);

  if (!isOpen) return null;

  // Filter and sort chronologically ascending
  const filteredRows = React.useMemo(() => {
    if (!dtDirectRows) return [];
    const filtered = dtDirectRows.filter(row => {
      let matchesPeriod = true;
      if (filterPeriod !== 'all') {
        const year = row.date ? String(getYearFromDateString(row.date)) : '';
        matchesPeriod = year === filterPeriod;
      }

      const matchesMed = filterMed === 'all' || 
        (filterMed === 'medicalise' && row.isMedicalise) ||
        (filterMed === 'non_medicalise' && !row.isMedicalise);

      const matchesSearch = searchQuery === '' || 
        row.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchQuery.toLowerCase()) ||
        row.devisCrss.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesMed && matchesSearch && matchesPeriod;
    });

    // Sort chronologically ascending
    return filtered.sort((a, b) => {
      return parseDateToTimestamp(a.date) - parseDateToTimestamp(b.date);
    });
  }, [dtDirectRows, filterMed, filterPeriod, searchQuery]);

  // Financial aggregates
  const totalDevisSum = filteredRows.reduce((s, r) => s + r.devisSecours, 0);
  const totalReversementSum = filteredRows.reduce((s, r) => s + r.reversementUl, 0);
  const totalRepasSum = filteredRows.reduce((s, r) => s + r.repas, 0);
  const totalGainDtSum = filteredRows.reduce((s, r) => s + r.gainDt, 0);
  const totalHoursSum = Math.round(filteredRows.reduce((s, r) => s + (r.duree * r.nbSecouristes), 0));
  const medicalisedCount = filteredRows.filter(r => r.isMedicalise).length;

  // Clinical aggregation
  const clsSoins = filteredRows.reduce((s, r) => s + r.nbSoins, 0);
  const clsEvac = filteredRows.reduce((s, r) => s + r.nbEvac, 0);
  const clsTrauma = filteredRows.reduce((s, r) => s + r.nbTrauma, 0);
  const clsMalaise = filteredRows.reduce((s, r) => s + r.nbMalaise, 0);
  const clsInconscients = filteredRows.reduce((s, r) => s + r.nbInconscient, 0);
  const clsAcr = filteredRows.reduce((s, r) => s + r.nbAcr, 0);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-205 w-full max-w-6xl flex flex-col my-8 max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-[#1E293B] text-white p-5 rounded-t-xl flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-lg text-white">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono uppercase">
                  Direction Territoriale 78
                </span>
                {fileName && (
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                    {fileName}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                Registre Opérationnel Direct DT — Grands Dispositifs & Analyses Financières
              </h3>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Fermer la vue"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Area */}
        {feedbackMsg && (
          <div className="bg-amber-50 border-b border-amber-200 p-3 text-center text-xs font-bold text-amber-900 animate-slideDown">
            {feedbackMsg}
          </div>
        )}

        {/* Modal Main Scrollable split layout */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {dtDirectRows ? (
            /* ACTIVE DATA SCREEN */
            <>
              {/* Quick Actions Bar with stats */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-indigo-50/40 border border-indigo-100 p-4 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold uppercase text-indigo-805 tracking-wider">État Général des Postes Directs DT</h4>
                  <p className="text-[11px] text-slate-650 mt-1">
                    Fichier actif. Les grands dispositifs sont facturés en direct par la DT avec reversement négocié aux ULs partenaires.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
                  <button
                    onClick={handleClearAll}
                    type="button"
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold bg-white hover:bg-slate-100 border border-slate-300 text-slate-605 rounded transition cursor-pointer"
                  >
                    Vider le Registre
                  </button>

                  <button
                    onClick={handleInjectFromRegistry}
                    type="button"
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-700 rounded shadow-xs transition cursor-pointer font-sans"
                  >
                    <Check className="w-4 h-4" /> Sync 2026 Dashboard
                  </button>
                </div>
              </div>

              {/* Aggregation Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* Micro KPI: Total Posts */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-150">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Dispositifs Directs DT</span>
                  <span className="text-lg font-black text-slate-800 font-mono mt-0.5 block">{filteredRows.length} postes</span>
                  <div className="text-[9px] text-slate-500 mt-1.5 flex justify-between items-center">
                    <span>Médicalisés :</span>
                    <span className="font-bold text-indigo-700">{medicalisedCount}</span>
                  </div>
                </div>

                {/* Micro KPI: Hours */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-150">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Bénévolat Valorisé</span>
                  <span className="text-lg font-black text-rc-red font-mono mt-0.5 block">{totalHoursSum.toLocaleString('fr-FR')} h</span>
                  <span className="text-[9px] text-slate-500 mt-1 block">Heures terrain réelles</span>
                </div>

                {/* Micro KPI: Financial theoretical turnover */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-150">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">CA Devis Facturé</span>
                  <span className="text-lg font-black text-slate-800 font-mono mt-0.5 block">{totalDevisSum.toLocaleString('fr-FR')} €</span>
                  <span className="text-[9px] text-slate-550 mt-1 block">Total facturation brute</span>
                </div>

                {/* Micro KPI: UL Share */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-150">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Reversé aux UL</span>
                  <span className="text-lg font-black text-slate-800 font-mono mt-0.5 block">{totalReversementSum.toLocaleString('fr-FR')} €</span>
                  <div className="text-[9px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>Taux UL :</span>
                    <span className="font-bold text-emerald-700">{totalDevisSum ? Math.round((totalReversementSum / totalDevisSum) * 100) : 0}%</span>
                  </div>
                </div>

                {/* Micro KPI: Margin DT */}
                <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                  <span className="text-[9px] uppercase font-bold text-indigo-705 tracking-wider block">Gain DT Conservé (Marge)</span>
                  <span className="text-lg font-black text-indigo-900 font-mono mt-0.5 block">+{totalGainDtSum.toLocaleString('fr-FR')} €</span>
                  <div className="text-[9px] text-indigo-705 mt-1 flex items-center justify-between">
                    <span>Marge DT :</span>
                    <span className="font-bold text-indigo-705">{totalDevisSum ? Math.round((totalGainDtSum / totalDevisSum) * 100) : 0}%</span>
                  </div>
                </div>

              </div>

              {/* Sanitaires & Clinical Panel Box details */}
              <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <Stethoscope className="w-5 h-5 text-rc-red" />
                  <h4 className="text-xs font-bold text-slate-905 uppercase tracking-wide">
                    Bilan Clinique Technique (Indicateurs consolidés pour Bilan Siège)
                  </h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  
                  <div className="bg-white p-2.5 rounded-lg border border-slate-150 text-center">
                    <span className="block text-slate-450 text-[9px] font-bold uppercase tracking-wider">Soins Dispensés</span>
                    <span className="text-base font-extrabold text-slate-900 font-mono leading-none mt-1 block">{clsSoins}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-150 text-center">
                    <span className="block text-slate-450 text-[9px] font-bold uppercase tracking-wider">Traumatologie</span>
                    <span className="text-base font-extrabold text-amber-700 font-mono leading-none mt-1 block">{clsTrauma}</span>
                    <span className="text-[8px] text-slate-400 block mt-1">({clsSoins ? Math.round((clsTrauma/clsSoins)*100) : 0}% des soins)</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-150 text-center">
                    <span className="block text-slate-450 text-[9px] font-bold uppercase tracking-wider">Malaises Types</span>
                    <span className="text-base font-extrabold text-slate-700 font-mono leading-none mt-1 block">{clsMalaise}</span>
                    <span className="text-[8px] text-slate-400 block mt-1">({clsSoins ? Math.round((clsMalaise/clsSoins)*100) : 0}%)</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-150 text-center">
                    <span className="block text-slate-450 text-[9px] font-bold uppercase tracking-wider">Inconscients G0</span>
                    <span className="text-base font-extrabold text-purple-700 font-mono leading-none mt-1 block">{clsInconscients}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                    <span className="block text-slate-450 text-[9px] font-bold uppercase tracking-wider">Arrêts ACR</span>
                    <span className="text-base font-extrabold text-rc-red font-mono leading-none mt-1 block">{clsAcr}</span>
                    {clsAcr > 0 && <span className="text-[8px] text-rose-600 font-bold block mt-1">Defib Activée</span>}
                  </div>

                  <div className="bg-emerald-50 rounded-lg border border-emerald-200 text-center p-2.5">
                    <span className="block text-emerald-800 text-[9px] font-bold uppercase tracking-wider">Évacuations (112)</span>
                    <span className="text-base font-extrabold text-emerald-800 font-mono leading-none mt-1 block">{clsEvac}</span>
                    <span className="text-[8px] text-emerald-600 font-semibold block mt-1">Hôpital / SAMU</span>
                  </div>

                </div>
              </div>

              {/* Filters toolbar UI controls */}
              <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-lg flex flex-col sm:flex-row items-center gap-3 justify-between">
                
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  
                  {/* Filter by Medicalisation */}
                  <div className="flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-450" />
                    <select
                      id="filter-registry-med"
                      value={filterMed}
                      onChange={(e) => setFilterMed(e.target.value)}
                      className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-700 font-medium cursor-pointer"
                    >
                      <option value="all">Toutes médicalisations</option>
                      <option value="medicalise">Postes Médicalisés (CRSS)</option>
                      <option value="non_medicalise">Postes Non Médicalisés</option>
                    </select>
                  </div>

                  {/* Filter by Period/Year */}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-450" />
                    <select
                      id="filter-registry-period"
                      value={filterPeriod}
                      onChange={(e) => setFilterPeriod(e.target.value)}
                      className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-700 font-medium cursor-pointer"
                    >
                      <option value="all">Toute année</option>
                      {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  {/* Search Bar query input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      placeholder="Rechercher un poste direct..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="text-xs pl-8 pr-2.5 py-1 bg-white border border-slate-300 rounded w-[250px]"
                    />
                  </div>

                </div>

                <div className="text-slate-400 text-[11px] font-mono shrink-0">
                  Marge calculée = Devis - Revers. - Repas
                </div>

              </div>

              {/* Registry Rows Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-200 animate-slideUp">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#1E293B] text-slate-200 font-bold border-b border-slate-800">
                      <th className="p-3">Label (Grands Postes)</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-center">Durée</th>
                      <th className="p-3 text-center">Médicalisation (Bouton switch)</th>
                      <th className="p-3 text-right">Devis Brut</th>
                      <th className="p-3 text-right">Reversement UL</th>
                      <th className="p-3 text-right">Bénév. (h)</th>
                      <th className="p-3 text-right text-indigo-300">Marge DT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                          Aucun poste ne correspond à vos filtres actuels.
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row, idx) => {
                        return (
                          <tr 
                            key={idx}
                            className="border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors text-slate-705"
                          >
                            <td className="p-3 font-semibold text-slate-900 max-w-[200px] truncate" title={row.label}>
                              {row.label}
                            </td>

                            <td className="p-3 font-mono text-slate-550 text-[11px]">
                              {formatDateToFR(row.date)}
                            </td>

                            <td className="p-3 text-center font-mono text-slate-600">
                              {row.duree} h
                            </td>

                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => toggleMedicalised(row)}
                                className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded cursor-pointer transition border hover:opacity-85 ${
                                  row.isMedicalise
                                    ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                                    : 'text-slate-500 bg-slate-50 border-slate-250'
                                }`}
                                title="Cliquez pour permuter la présence médicale"
                              >
                                {row.isMedicalise ? 'Médicalisé ✔' : 'Non Médicalisé'}
                                <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                              </button>
                            </td>

                            <td className="p-3 text-right font-mono font-medium">
                              {row.devisSecours.toLocaleString('fr-FR')} €
                            </td>

                            <td className="p-3 text-right font-mono text-emerald-650">
                              {row.reversementUl.toLocaleString('fr-FR')} €
                            </td>

                            <td className="p-3 text-right">
                              <span className="font-bold font-mono text-rc-red">{row.duree * row.nbSecouristes} h</span>
                              <span className="block text-[9px] text-slate-400">({row.nbSecouristes} sec.)</span>
                            </td>

                            <td className="p-3 text-right font-mono font-bold bg-indigo-500/5 text-indigo-700">
                              {row.gainDt.toLocaleString('fr-FR')} €
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            /* EMPTY SCREEN STATE WITH SIMULATION OFFERS */
            <div className="text-center py-12 px-4 shadow-3xs border border-slate-100 rounded-xl space-y-6 max-w-lg mx-auto">
              <div className="p-4 bg-indigo-500/10 text-indigo-600 rounded-full w-14 h-14 mx-auto flex items-center justify-center">
                <Flame className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800">Aucun fichier Postes Directs DT n'est connecté</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Importez votre rapport technique Excel depuis Section 4 ou initialisez immédiatement les données de simulation de la DTUS78.
                </p>
              </div>

              <div className="p-3 bg-indigo-50 text-indigo-950 rounded border border-indigo-200 text-left text-[11px] space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-indigo-705" /> Bénévolat Direct DT :
                </p>
                <ul className="list-disc list-inside space-y-0.5 ml-1 text-slate-700">
                  <li>Formule réglementaire : Durée x effectifs (ex: 12h x 16 secouristes = 192h).</li>
                  <li>Incorpore 5 manifestations majeures d'Yvelines (Festival Electro, Raid VTT, etc.).</li>
                  <li>Intègre les indicateurs cliniques et la présence médicale dans le bilan d'activité.</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                <button
                  type="button"
                  onClick={handleLoadSimulation}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded transition cursor-pointer"
                >
                  Simuler l'injection des Postes Directs DT
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition cursor-pointer"
                >
                  Retour au Tableau de Bord
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between rounded-b-xl text-xs text-slate-500">
          <span className="font-mono">DTUS 78 - Section des Grands Dispositifs Portés par la DT</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded cursor-pointer"
          >
            Fermer l'Écran
          </button>
        </div>

      </div>
    </div>
  );
};
