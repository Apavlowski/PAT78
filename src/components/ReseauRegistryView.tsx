/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Filter, 
  Search, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  Check, 
  ArrowRight,
  Info,
  RotateCcw,
  Users
} from 'lucide-react';
import { ParsedReseauRow, MetierStats, getYearFromDateString } from '../types';

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

interface ReseauRegistryViewProps {
  isOpen: boolean;
  onClose: () => void;
  reseauRows: ParsedReseauRow[] | null;
  setReseauRows: (rows: ParsedReseauRow[] | null) => void;
  fileName: string;
  setFileName: (name: string) => void;
  onDataImported: (newStats: MetierStats[]) => void;
  currentStats: MetierStats[];
}

const CONSTANT_SECOURISTES_PAR_GARDE = 4;

const SIMULATED_SDIS_DATA: ParsedReseauRow[] = [
  { date: "2026-01-03", duree: 12, secouristesEngages: CONSTANT_SECOURISTES_PAR_GARDE, heuresBenevolat: 12 * CONSTANT_SECOURISTES_PAR_GARDE },
  { date: "2026-01-10", duree: 24, secouristesEngages: CONSTANT_SECOURISTES_PAR_GARDE, heuresBenevolat: 24 * CONSTANT_SECOURISTES_PAR_GARDE },
  { date: "2026-02-14", duree: 12, secouristesEngages: CONSTANT_SECOURISTES_PAR_GARDE, heuresBenevolat: 12 * CONSTANT_SECOURISTES_PAR_GARDE },
  { date: "2026-03-21", duree: 12, secouristesEngages: CONSTANT_SECOURISTES_PAR_GARDE, heuresBenevolat: 12 * CONSTANT_SECOURISTES_PAR_GARDE },
  { date: "2026-04-04", duree: 24, secouristesEngages: CONSTANT_SECOURISTES_PAR_GARDE, heuresBenevolat: 24 * CONSTANT_SECOURISTES_PAR_GARDE },
  { date: "2026-05-01", duree: 12, secouristesEngages: CONSTANT_SECOURISTES_PAR_GARDE, heuresBenevolat: 12 * CONSTANT_SECOURISTES_PAR_GARDE },
  { date: "2026-05-15", duree: 12, secouristesEngages: CONSTANT_SECOURISTES_PAR_GARDE, heuresBenevolat: 12 * CONSTANT_SECOURISTES_PAR_GARDE },
  { date: "2026-06-06", duree: 24, secouristesEngages: CONSTANT_SECOURISTES_PAR_GARDE, heuresBenevolat: 24 * CONSTANT_SECOURISTES_PAR_GARDE }
];

export const ReseauRegistryView: React.FC<ReseauRegistryViewProps> = ({
  isOpen,
  onClose,
  reseauRows,
  setReseauRows,
  fileName,
  setFileName,
  onDataImported,
  currentStats
}) => {
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  const availableYears = useMemo(() => {
    if (!reseauRows) return [];
    const yearsSet = new Set<string>();
    reseauRows.forEach(row => {
      if (row.date) {
        const yr = getYearFromDateString(row.date);
        yearsSet.add(String(yr));
      }
    });
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [reseauRows]);

  const handleLoadSimulation = () => {
    setReseauRows(SIMULATED_SDIS_DATA);
    setFileName("Gardes_SDIS_Versailles_S1_2026.xlsx");
    setFeedbackMsg("Profil type validé ! 8 gardes SDIS chargées en simulation.");
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

  const toggleGardeDuree = (row: ParsedReseauRow) => {
    if (!reseauRows) return;
    const copied = [...reseauRows];
    const originalIndex = copied.findIndex(r => r === row);
    if (originalIndex === -1) return;
    const current = copied[originalIndex];
    current.duree = current.duree === 12 ? 24 : 12;
    current.heuresBenevolat = current.duree * CONSTANT_SECOURISTES_PAR_GARDE;
    setReseauRows(copied);
    setFeedbackMsg(`La durée de la garde du ${current.date} est passée à ${current.duree} h.`);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleInjectFromRegistry = () => {
    if (!reseauRows) return;

    const countOfGuards = reseauRows.length;
    const computedVolHours = reseauRows.reduce((s, r) => s + r.heuresBenevolat, 0);

    const updatedStats: MetierStats[] = JSON.parse(JSON.stringify(currentStats));
    const secourismeObj = updatedStats.find(m => m.id === 'secourisme');

    if (secourismeObj) {
      const yearStats2026 = secourismeObj.history.find(h => h.year === 2026);
      if (yearStats2026) {
        yearStats2026.activitiesCount += countOfGuards;
        yearStats2026.volunteerHours += computedVolHours;
      }

      // Add as dynamic breakdown entry
      const existingBreakdown = secourismeObj.breakdown2026.filter(b => !b.name.includes('Garde SDIS Versailles'));
      
      const newBreakdownEntry = {
        name: `Réseau : Gardes SDIS Versailles`,
        count: countOfGuards,
        hours: computedVolHours
      };

      secourismeObj.breakdown2026 = [newBreakdownEntry, ...existingBreakdown].slice(0, 6);
    }

    onDataImported(updatedStats);
    setFeedbackMsg(`Symphonie réussie ! ${countOfGuards} gardes (soit ${computedVolHours} h de bénévolat) ont été injectées.`);
    setTimeout(() => setFeedbackMsg(''), 4500);
  };

  const handleClearAll = () => {
    setReseauRows(null);
    setFileName('');
    setFeedbackMsg("Registre des gardes SDIS vidé.");
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  // Filter and sort chronologically ascending
  const filteredRows = React.useMemo(() => {
    if (!reseauRows) return [];
    const filtered = reseauRows.filter(row => {
      let matchesPeriod = true;
      if (filterPeriod !== 'all') {
        const year = row.date ? String(getYearFromDateString(row.date)) : '';
        matchesPeriod = year === filterPeriod;
      }

      const safeDate = row.date || '';
      const matchesSearch = searchQuery === '' || 
        safeDate.includes(searchQuery) || 
        formatDateToFR(safeDate).includes(searchQuery);

      return matchesPeriod && matchesSearch;
    });

    // Sort chronologically ascending by date
    return filtered.sort((a, b) => {
      return parseDateToTimestamp(a.date) - parseDateToTimestamp(b.date);
    });
  }, [reseauRows, filterPeriod, searchQuery]);

  // Key Aggregating KPIs
  const totalGuards = filteredRows.length;
  const grandTotalDuree = filteredRows.reduce((s, r) => s + r.duree, 0);
  const grandTotalHeuresBenevolat = filteredRows.reduce((s, r) => s + r.heuresBenevolat, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-205 w-full max-w-5xl flex flex-col my-8 max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-[#1E293B] text-white p-5 rounded-t-xl flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-lg text-white">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono uppercase">
                  Réseau Opérationnel SDIS
                </span>
                {fileName && (
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                    {fileName}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                Registre des Gardes Organisées en Caserne — SDIS Versailles (78)
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

        {/* Modal Main Scrollable layout */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {reseauRows ? (
            /* ACTIVE DATA SCREEN */
            <>
              {/* Quick Actions Bar with stats */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-emerald-50/40 border border-emerald-100 p-4 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold uppercase text-emerald-805 tracking-wider">État Général des Gardes SDIS</h4>
                  <p className="text-[11px] text-slate-655 mt-1">
                    Ces gardes sont régies par contrat de partenariat avec les Pompiers de Versailles, engageant {CONSTANT_SECOURISTES_PAR_GARDE} secouristes par créneau de 12h ou 24h.
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
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-650 hover:bg-emerald-700 rounded shadow-xs transition cursor-pointer font-sans"
                  >
                    <Check className="w-4 h-4" /> Sync 2026 Dashboard
                  </button>
                </div>
              </div>

              {/* Aggregation Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Micro KPI: Total Gardes */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 relative overflow-hidden">
                  <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Gardes Effectuées</span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-800 font-mono">{totalGuards}</span>
                    <span className="text-xs font-bold text-slate-500">créneaux</span>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1">
                    Nombre total de gardes importées réelles
                  </p>
                </div>

                {/* Micro KPI: Crew Crew fixed size */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 relative overflow-hidden">
                  <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Équipage Mobilisé</span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-800 font-mono">{CONSTANT_SECOURISTES_PAR_GARDE}</span>
                    <span className="text-xs font-bold text-slate-550 flex items-center gap-1">secouristes / garde</span>
                  </div>
                  <p className="text-[9px] text-slate-550 mt-1">
                    Nombre réglementaire d'équipage Croix-Rouge
                  </p>
                  <div className="absolute right-4 top-4 text-slate-200">
                    <Users className="w-8 h-8 stroke-1" />
                  </div>
                </div>

                {/* Micro KPI: Computed hours */}
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 relative overflow-hidden">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Bénévolat Valorisé Réseaux</span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xl font-extrabold text-emerald-800 font-mono">+{grandTotalHeuresBenevolat.toLocaleString('fr-FR')}</span>
                    <span className="text-xs font-bold text-emerald-800">h</span>
                  </div>
                  <p className="text-[9px] text-emerald-650 mt-1">
                    Formula : {grandTotalDuree} h cumulées x {CONSTANT_SECOURISTES_PAR_GARDE} équipiers
                  </p>
                  <div className="absolute right-4 top-4 text-emerald-100">
                    <Clock className="w-8 h-8 stroke-1" />
                  </div>
                </div>

              </div>

              {/* Filters toolbar UI controls */}
              <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-lg flex flex-col sm:flex-row items-center gap-3 justify-between">
                
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  
                  {/* Filter by Period/Year */}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-450" />
                    <select
                      id="filter-registry-period"
                      value={filterPeriod}
                      onChange={(e) => setFilterPeriod(e.target.value)}
                      className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-700 font-medium cursor-pointer"
                    >
                      <option value="all">Toute période</option>
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
                      placeholder="Filtrer par date (ex: 2026-05)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="text-xs pl-8 pr-2.5 py-1 bg-white border border-slate-300 rounded w-[250px]"
                    />
                  </div>

                </div>

                <div className="text-slate-400 text-[11px] font-mono shrink-0">
                  Calcul Bénévolat : Durée x {CONSTANT_SECOURISTES_PAR_GARDE} intervenants
                </div>

              </div>

              {/* Registry Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-200 animate-slideUp">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#1E293B] text-slate-200 font-bold border-b border-slate-800">
                      <th className="p-3">Créneau / Indice</th>
                      <th className="p-3">Date de Garde</th>
                      <th className="p-3 text-center">Durée Officielle (switch horaire)</th>
                      <th className="p-3 text-center">Effectif Engagé Croix-Rouge</th>
                      <th className="p-3 text-right">Volume Bénévolat Consolidé</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                          Aucune ligne de garde ne correspond à vos recherches.
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row, idx) => {
                        return (
                          <tr 
                            key={idx}
                            className="border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors text-slate-700"
                          >
                            <td className="p-3 font-semibold text-slate-500 font-mono">
                              #{idx + 1}
                            </td>

                            <td className="p-3 font-bold text-slate-900 font-mono">
                              {formatDateToFR(row.date)}
                            </td>

                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => toggleGardeDuree(row)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 cursor-pointer"
                                title="Cliquez pour permuter entre 12h et 24h"
                              >
                                {row.duree} heures
                                <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                              </button>
                            </td>

                            <td className="p-3 text-center font-mono">
                              {row.secouristesEngages} équipiers (VPSP)
                            </td>

                            <td className="p-3 text-right font-mono font-bold text-emerald-700">
                              {row.heuresBenevolat} h
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
              <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-full w-14 h-14 mx-auto flex items-center justify-center">
                <ShieldAlert className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800">Aucun fichier Garde SDIS n'est importé</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Le registre est vide. Importez votre document Excel dans Section 4 ou simulez instantanément le planning de garde des pompiers de Versailles.
                </p>
              </div>

              <div className="p-3 bg-emerald-50 text-emerald-950 rounded border border-emerald-150 text-left text-[11.5px] space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-emerald-700" /> Réglementation SDIS Versailles :
                </div>
                <ul className="list-disc list-inside space-y-0.5 ml-1 text-slate-700">
                  <li>Chaque garde mobilise {CONSTANT_SECOURISTES_PAR_GARDE} secouristes à bord du VPSP Croix-Rouge.</li>
                  <li>Prise de garde à 12h ou 24h.</li>
                  <li>Le planning valorisé abondera le volume d'activité de l'Unité Locale de Versailles et du département.</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                <button
                  type="button"
                  onClick={handleLoadSimulation}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded transition cursor-pointer"
                >
                  Simuler le registre SDIS Versailles
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
          <span className="font-mono">DTUS 78 - Section Activité de Réseau (Gardes BSPP & SDIS)</span>
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
