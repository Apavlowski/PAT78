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
  Info
} from 'lucide-react';
import { ParsedDpsRow, MetierStats, getYearFromDateString, formatExcelCellValue } from '../types';

interface DpsRegistryViewProps {
  isOpen: boolean;
  onClose: () => void;
  dpsRows: ParsedDpsRow[] | null;
  setDpsRows: (rows: ParsedDpsRow[] | null) => void;
  fileName: string;
  setFileName: (name: string) => void;
  onDataImported: (newStats: MetierStats[]) => void;
  currentStats: MetierStats[];
}

const SIMULATED_DPS_DATA: ParsedDpsRow[] = [
  {
    ul: "Versailles",
    manifestation: "Grand Prix Hippique de Versailles",
    statut: "Confirmé",
    debut: "2026-05-12 14:00",
    fin: "2026-05-12 22:00",
    heuresDps: 8,
    prelevement: 150,
    tarifTheorique: 800,
    dimensionnement: "1 équipe et 1 binôme",
    secouristesEngages: 9, // 1 eq (4) + 1 bin (2) = 6. evac is true (+3) => 9 secouristes.
    evac: true,
    heuresBenevolatCalculees: 72,
    isIgnored: false,
    nbSoins: 5,
    nbEvac: 1,
    nbTrauma: 1,
    nbMalaise: 1,
    nbInconscient: 0,
    nbAcr: 0,
    medicalise: false
  },
  {
    ul: "DT",
    manifestation: "Fête de la Musique - Scène Centrale Yvelines",
    statut: "Confirmé",
    debut: "2026-06-21 16:00",
    fin: "2026-06-22 02:00",
    heuresDps: 10,
    prelevement: 300,
    tarifTheorique: 1500,
    dimensionnement: "2 équipes",
    secouristesEngages: 11, // 2 eq = 8. evac = true (+3) = 11.
    evac: true,
    heuresBenevolatCalculees: 110,
    isIgnored: false,
    nbSoins: 24,
    nbEvac: 3,
    nbTrauma: 6,
    nbMalaise: 4,
    nbInconscient: 1,
    nbAcr: 0,
    medicalise: true
  },
  {
    ul: "Saint-Germain",
    manifestation: "Tournoi de Tennis Intercommunal",
    statut: "Confirmé",
    debut: "2026-06-05 09:00",
    fin: "2026-06-05 17:00",
    heuresDps: 8,
    prelevement: 80,
    tarifTheorique: 450,
    dimensionnement: "1 binôme",
    secouristesEngages: 2,
    evac: false,
    heuresBenevolatCalculees: 16,
    isIgnored: false,
    nbSoins: 3,
    nbEvac: 0,
    nbTrauma: 0,
    nbMalaise: 1,
    nbInconscient: 0,
    nbAcr: 0,
    medicalise: false
  },
  {
    ul: "Poissy",
    manifestation: "Bourse de l'Auto ancienne",
    statut: "Option",
    debut: "2026-08-15 08:00",
    fin: "2026-08-15 14:00",
    heuresDps: 6,
    prelevement: 120,
    tarifTheorique: 300,
    dimensionnement: "1 PAPS",
    secouristesEngages: 2,
    evac: false,
    heuresBenevolatCalculees: 12,
    isIgnored: false,
    nbSoins: 1,
    nbEvac: 0,
    nbTrauma: 0,
    nbMalaise: 0,
    nbInconscient: 0,
    nbAcr: 0,
    medicalise: false
  },
  {
    ul: "Rambouillet",
    manifestation: "Fête de la Nature en Forêt",
    statut: "Confirmé",
    debut: "2026-05-30 10:00",
    fin: "2026-05-30 18:00",
    heuresDps: 8,
    prelevement: 60,
    tarifTheorique: 400,
    dimensionnement: "1 équipe",
    secouristesEngages: 4,
    evac: false,
    heuresBenevolatCalculees: 32,
    isIgnored: false,
    nbSoins: 2,
    nbEvac: 0,
    nbTrauma: 1,
    nbMalaise: 0,
    nbInconscient: 0,
    nbAcr: 0,
    medicalise: false
  },
  {
    ul: "DT92",
    manifestation: "Match de Rugby Colombes (Hors 78)",
    statut: "Confirmé",
    debut: "2026-04-18 10:00",
    fin: "2026-04-18 18:00",
    heuresDps: 8,
    prelevement: 0,
    tarifTheorique: 700,
    dimensionnement: "1 équipe",
    secouristesEngages: 4,
    evac: false,
    heuresBenevolatCalculees: 32,
    isIgnored: true,
    invalidReason: "Ignoré d'office : Attribué à un autre département (DT92)",
    nbSoins: 0,
    nbEvac: 0,
    nbTrauma: 0,
    nbMalaise: 0,
    nbInconscient: 0,
    nbAcr: 0,
    medicalise: false
  },
  {
    ul: "Mantes-la-Jolie",
    manifestation: "Triathlon Interdépartemental",
    statut: "Confirmé",
    debut: "2026-07-04 07:00",
    fin: "2026-07-04 15:00",
    heuresDps: 8,
    prelevement: 100,
    tarifTheorique: 600,
    dimensionnement: "1 équipe et 1 PAPS",
    secouristesEngages: 6,
    evac: false,
    heuresBenevolatCalculees: 48,
    isIgnored: false,
    nbSoins: 8,
    nbEvac: 1,
    nbTrauma: 4,
    nbMalaise: 2,
    nbInconscient: 0,
    nbAcr: 0,
    medicalise: false
  },
  {
    ul: "Conflans",
    manifestation: "Régate Fluviale de la Seine",
    statut: "Confirmé",
    debut: "2026-06-13 11:00",
    fin: "2026-06-13 19:00",
    heuresDps: 8,
    prelevement: 90,
    tarifTheorique: 500,
    dimensionnement: "1 équipe",
    secouristesEngages: 7, // 4 + 3 (evac)
    evac: true,
    heuresBenevolatCalculees: 56,
    isIgnored: false,
    nbSoins: 11,
    nbEvac: 2,
    nbTrauma: 5,
    nbMalaise: 3,
    nbInconscient: 1,
    nbAcr: 0,
    medicalise: false
  },
  {
    ul: "Sartrouville",
    manifestation: "Critérium cycliste de Sartrouville",
    statut: "Confirmé",
    debut: "2026-09-06 13:00",
    fin: "2026-09-06 19:00",
    heuresDps: 6,
    prelevement: 75,
    tarifTheorique: 450,
    dimensionnement: "1 équipe",
    secouristesEngages: 4,
    evac: false,
    heuresBenevolatCalculees: 24,
    isIgnored: false,
    nbSoins: 4,
    nbEvac: 0,
    nbTrauma: 3,
    nbMalaise: 1,
    nbInconscient: 0,
    nbAcr: 0,
    medicalise: false
  }
];

export const DpsRegistryView: React.FC<DpsRegistryViewProps> = ({ 
  isOpen, 
  onClose, 
  dpsRows, 
  setDpsRows, 
  fileName, 
  setFileName,
  onDataImported,
  currentStats
}) => {
  const [filterUl, setFilterUl] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showIgnored, setShowIgnored] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  // Handler to load dynamic representative simulation profiles
  const handleLoadSimulation = () => {
    setDpsRows(SIMULATED_DPS_DATA);
    setFileName("Simulation_DPS_Yvelines_Juin2026.xlsx");
    setFeedbackMsg("Profil type validé ! 9 d'activités opérationnelles injectées pour simulation.");
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

  // Helper to format date part for display in table
  const formatDatePartOnly = (dateStr?: string): string => {
    if (!dateStr) return '';
    const normalized = formatExcelCellValue(dateStr).trim();
    const frDateMatch = normalized.match(/^(\d{2}\/\d{2}\/\d{4})/);
    if (frDateMatch) {
      return frDateMatch[1];
    }
    const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [_, year, month, day] = match;
      return `${day}/${month}/${year}`;
    }
    return normalized.split(' ')[0];
  };

  // Switch status inside the table dynamically (Interactive simulation)
  const toggleStatut = (row: ParsedDpsRow) => {
    if (!dpsRows) return;
    const copied = [...dpsRows];
    const originalIndex = copied.findIndex(r => r === row);
    if (originalIndex === -1) return;
    const current = copied[originalIndex];
    if (current.statut === "Confirmé") {
      current.statut = "Option";
    } else {
      current.statut = "Confirmé";
    }
    setDpsRows(copied);
    setFeedbackMsg(`Le statut du poste "${current.manifestation}" a changé à ${current.statut}.`);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  // Trigger global injection into the parent state
  const handleInjectFromRegistry = () => {
    if (!dpsRows) return;

    // Filter to count only active / confirmed posts in Yvelines
    const activeConfirmedPosts = dpsRows.filter(r => {
      if (r.isIgnored) return false;
      const s = r.statut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return s.includes('confirme') || s.includes('cloture') || s.includes('realise') || s.includes('valide');
    });
    
    if (activeConfirmedPosts.length === 0) {
      setFeedbackMsg("Aucune ligne n'est validée et active (Confirmé, Clôturé, Réalisé, Validé). Veuillez modifier le statut ou charger des données.");
      return;
    }

    // Find the year from the first active post, or default to 2026
    const postYear = activeConfirmedPosts.length > 0 && activeConfirmedPosts[0].debut
      ? getYearFromDateString(activeConfirmedPosts[0].debut)
      : 2026;

    const consolidatedActivitiesCount = activeConfirmedPosts.length;
    const consolidatedVolunteerHours = Math.round(activeConfirmedPosts.reduce((sum, row) => sum + row.heuresBenevolatCalculees, 0));

    // Map into deep copy of original stats
    const updatedStats: MetierStats[] = JSON.parse(JSON.stringify(currentStats));
    const secourismeObj = updatedStats.find(m => m.id === 'secourisme');

    if (secourismeObj) {
      const yearStats = secourismeObj.history.find(h => h.year === postYear);
      if (yearStats) {
        yearStats.activitiesCount = consolidatedActivitiesCount;
        yearStats.volunteerHours = consolidatedVolunteerHours;
      } else {
        secourismeObj.history.push({
          year: postYear,
          activitiesCount: consolidatedActivitiesCount,
          volunteerHours: consolidatedVolunteerHours
        });
        secourismeObj.history.sort((a, b) => a.year - b.year);
      }

      // Populate breakdown
      const sortedManifestations = [...activeConfirmedPosts]
        .sort((a, b) => b.heuresBenevolatCalculees - a.heuresBenevolatCalculees);
      
      const newBreakdown = sortedManifestations.slice(0, 5).map(m => ({
        name: `${m.manifestation} (${m.ul})`,
        count: 1,
        hours: Math.round(m.heuresBenevolatCalculees)
      }));

      if (sortedManifestations.length > 5) {
        const otherManifestations = sortedManifestations.slice(5);
        const otherHrs = otherManifestations.reduce((sum, row) => sum + row.heuresBenevolatCalculees, 0);
        newBreakdown.push({
          name: `Autres postes du département (${otherManifestations.length} DPS)`,
          count: otherManifestations.length,
          hours: Math.round(otherHrs)
        });
      }

      if (postYear === 2026) {
        secourismeObj.breakdown2026 = newBreakdown;
      }
    }

    onDataImported(updatedStats);
    setFeedbackMsg(`Symphonie réussie ! Le tableau principal ${postYear} intègre à présent les ${consolidatedActivitiesCount} DPS pour ${consolidatedVolunteerHours} h.`);
    setTimeout(() => setFeedbackMsg(''), 4500);
  };

  const handleClearAll = () => {
    setDpsRows(null);
    setFileName('');
    setFeedbackMsg("Registre vidé d'office.");
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  // Get unique UL list (excluding ignored ones if selected, or including all)
  const availableUls = dpsRows 
    ? Array.from(new Set(dpsRows.filter(r => !r.isIgnored || showIgnored).map(r => r.ul))) 
    : [];

  const availableYears = React.useMemo(() => {
    if (!dpsRows) return [];
    const yearsSet = new Set<string>();
    dpsRows.forEach(row => {
      if (row.debut) {
        const yr = getYearFromDateString(row.debut);
        yearsSet.add(String(yr));
      }
    });
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [dpsRows]);

  // Filter and chronological sorting (ascending by start date)
  const filteredRows = React.useMemo(() => {
    if (!dpsRows) return [];
    const filtered = dpsRows.filter(row => {
      if (row.isIgnored && !showIgnored) return false;
      
      let matchesPeriod = true;
      if (filterPeriod !== 'all') {
        const year = row.debut ? String(getYearFromDateString(row.debut)) : '';
        matchesPeriod = year === filterPeriod;
      }

      const matchesUl = filterUl === 'all' || row.ul === filterUl;
      const matchesStatut = filterStatus === 'all' || row.statut === filterStatus;
      
      const safeManifestation = (row.manifestation || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const safeUl = (row.ul || '').toLowerCase();
      const safeDimensionnement = (row.dimensionnement || '').toLowerCase();
      const lowerQuery = searchQuery.toLowerCase();

      const matchesSearch = searchQuery === '' || 
        safeManifestation.includes(lowerQuery) ||
        safeUl.includes(lowerQuery) ||
        safeDimensionnement.includes(lowerQuery);
        
      return matchesUl && matchesStatut && matchesSearch && matchesPeriod;
    });

    // Sort chronologically ascending
    return filtered.sort((a, b) => {
      return parseDateToTimestamp(a.debut) - parseDateToTimestamp(b.debut);
    });
  }, [dpsRows, filterUl, filterStatus, filterPeriod, searchQuery, showIgnored]);

  // Helper for checking if row status is active of filtered set
  const isActiveRow = (r: ParsedDpsRow) => {
    if (r.isIgnored) return false;
    const s = r.statut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return s.includes('confirme') || s.includes('cloture') || s.includes('realise') || s.includes('valide');
  };

  // Statistics calculation for the filtered set
  const filteredActiveRows = filteredRows.filter(isActiveRow);
  const firstAidConfirmedCount = filteredActiveRows.length;
  const volunteerHoursSum = Math.round(filteredActiveRows.reduce((sum, r) => sum + r.heuresBenevolatCalculees, 0));
  const tarifTheoriqueSum = filteredActiveRows.reduce((sum, r) => sum + r.tarifTheorique, 0);
  const prelevementSum = filteredActiveRows.reduce((sum, r) => sum + r.prelevement, 0);
  const netUlRevenuesSum = tarifTheoriqueSum - prelevementSum;

  // Clinical totals (of filtered list)
  const clsSoins = filteredRows.filter(r => !r.isIgnored).reduce((s, r) => s + r.nbSoins, 0);
  const clsEvac = filteredRows.filter(r => !r.isIgnored).reduce((s, r) => s + r.nbEvac, 0);
  const clsTrauma = filteredRows.filter(r => !r.isIgnored).reduce((s, r) => s + r.nbTrauma, 0);
  const clsMalaise = filteredRows.filter(r => !r.isIgnored).reduce((s, r) => s + r.nbMalaise, 0);
  const clsInconscients = filteredRows.filter(r => !r.isIgnored).reduce((s, r) => s + r.nbInconscient, 0);
  const clsAcr = filteredRows.filter(r => !r.isIgnored).reduce((s, r) => s + r.nbAcr, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-205 w-full max-w-6xl flex flex-col my-8 max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-[#1E293B] text-white p-5 rounded-t-xl flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rc-red rounded-lg text-white">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-rc-red/20 text-rc-red border border-rc-red/30 px-2 py-0.5 rounded font-mono uppercase">
                  Service Secours 78
                </span>
                {fileName && (
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                    {fileName}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                Registre Opérationnel Adapté — Suivi Technique & Clinique des DPS
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
          
          {dpsRows ? (
            /* ACTIVE DATA SCREEN */
            <>
              {/* Quick Actions Bar with stats */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">État Général du Registre</h4>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Fichier source actif. Utilisez les leviers ci-dessous pour filtrer les lignes ou modifier le statut d'un poste.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
                  <button
                    onClick={handleInjectFromRegistry}
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rc-red hover:bg-[#D7171E] rounded shadow-xs transition cursor-pointer font-sans"
                  >
                    <Check className="w-4 h-4" /> Sync 2026 Dashboard
                  </button>
                </div>
              </div>

              {/* Aggregation Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* Micro KPI: Total Confirmed Posts */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-150">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">DPS Confirmés</span>
                  <span className="text-lg font-black text-slate-800 font-mono mt-0.5 block">{firstAidConfirmedCount} postes</span>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-[#D7171E] h-full" style={{ width: dpsRows ? `${Math.min(100, (firstAidConfirmedCount / dpsRows.length) * 100)}%` : '0%' }}></div>
                  </div>
                </div>

                {/* Micro KPI: Computed hours */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-150">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Bénévolat Consolidé</span>
                  <span className="text-lg font-black text-rc-red font-mono mt-0.5 block">{volunteerHoursSum.toLocaleString('fr-FR')} h</span>
                  <span className="text-[9px] text-slate-500 mt-1 block">Heures cumulées réelles</span>
                </div>

                {/* Micro KPI: Financial theoretical turnover */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-150">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Volume Facturation</span>
                  <span className="text-lg font-black text-slate-800 font-mono mt-0.5 block">{tarifTheoriqueSum.toLocaleString('fr-FR')} €</span>
                  <span className="text-[9px] text-slate-550 mt-1 block">Total DPS théorique</span>
                </div>

                {/* Micro KPI: DT share */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-150">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Prélèvement DT (Royalty)</span>
                  <span className="text-lg font-black text-slate-800 font-mono mt-0.5 block">{prelevementSum.toLocaleString('fr-FR')} €</span>
                  <div className="text-[9px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>Part DT :</span>
                    <span className="font-bold text-rc-red">{tarifTheoriqueSum ? Math.round((prelevementSum/tarifTheoriqueSum)*100) : 0}%</span>
                  </div>
                </div>

                {/* Micro KPI: Share returned to local units */}
                <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                  <span className="text-[9px] uppercase font-bold text-indigo-705 tracking-wider block">Rendement Reversé UL</span>
                  <span className="text-lg font-black text-indigo-900 font-mono mt-0.5 block">{netUlRevenuesSum.toLocaleString('fr-FR')} €</span>
                  <div className="text-[9px] text-indigo-705 mt-1 flex items-center justify-between">
                    <span>Rendement UL :</span>
                    <span className="font-bold text-emerald-800">{tarifTheoriqueSum ? Math.round((netUlRevenuesSum/tarifTheoriqueSum)*100) : 0}%</span>
                  </div>
                </div>

              </div>

              {/* Sanitaires & Clinical Panel Box details */}
              <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <Stethoscope className="w-5 h-5 text-rc-red" />
                  <h4 className="text-xs font-bold text-slate-905 uppercase tracking-wide">
                    Bilan Clinique & Pathologique (Indicateurs consolidés pour Bilan Siège)
                  </h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  
                  <div className="bg-white p-2.5 rounded-lg border border-slate-150 text-center">
                    <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider">Soins Dispensés</span>
                    <span className="text-base font-extrabold text-slate-900 font-mono leading-none mt-1 block">{clsSoins}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-150 text-center">
                    <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider">Traumatologie</span>
                    <span className="text-base font-extrabold text-amber-700 font-mono leading-none mt-1 block">{clsTrauma}</span>
                    <span className="text-[8px] text-slate-400 block mt-1">({clsSoins ? Math.round((clsTrauma/clsSoins)*100) : 0}% des soins)</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-150 text-center">
                    <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider">Malaises Types</span>
                    <span className="text-base font-extrabold text-slate-700 font-mono leading-none mt-1 block">{clsMalaise}</span>
                    <span className="text-[8px] text-slate-400 block mt-1">({clsSoins ? Math.round((clsMalaise/clsSoins)*100) : 0}%)</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-150 text-center">
                    <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider">Inconscients G0</span>
                    <span className="text-base font-extrabold text-purple-700 font-mono leading-none mt-1 block">{clsInconscients}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                    <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider">Arrêts ACR</span>
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
              <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-lg flex flex-col md:flex-row items-center gap-3 justify-between">
                
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  
                  {/* Filter by UL */}
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-450" />
                    <select
                      id="filter-registry-ul"
                      value={filterUl}
                      onChange={(e) => setFilterUl(e.target.value)}
                      className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-700 font-medium cursor-pointer"
                    >
                      <option value="all">Tous les Métiers locaux (UL / DT)</option>
                      {availableUls.map(ul => (
                        <option key={ul} value={ul}>{ul === 'DT' ? 'Direction Territoriale' : `Unité Locale ${ul}`}</option>
                      ))}
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

                  {/* Filter by Statut */}
                  <div className="flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-slate-455" />
                    <select
                      id="filter-registry-status"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-700 font-medium cursor-pointer"
                    >
                      <option value="all">Tous les Statuts</option>
                      <option value="Confirmé">Confirmé (Réalisé)</option>
                      <option value="Option">Option (Provisionnel)</option>
                    </select>
                  </div>

                  {/* Search Bar query input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      placeholder="Rechercher une manifestation..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="text-xs pl-8 pr-2.5 py-1 bg-white border border-slate-300 rounded w-[200px]"
                    />
                  </div>

                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showIgnored}
                      onChange={(e) => setShowIgnored(e.target.checked)}
                      className="rounded border-slate-300 text-rc-red focus:ring-rc-red"
                    />
                    Afficher lignes extraterritoriales (DT75, DT92...)
                  </label>
                </div>

              </div>

              {/* Registry Rows Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#1E293B] text-slate-200 font-bold border-b border-slate-800">
                      <th className="p-3">UL / Porteur</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Manifestations (Evénement)</th>
                      <th className="p-3 text-center">Statut (Bouton d'édition)</th>
                      <th className="p-3">Dispositif & Dimensionnement</th>
                      <th className="p-3 text-center">Évac ?</th>
                      <th className="p-3 text-center">Dr (h)</th>
                      <th className="p-3 text-right">Prélèvement DT</th>
                      <th className="p-3 text-right">Volume Bénévolat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400 italic">
                          Aucun poste ne correspond à vos filtres actuels.
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row, idx) => {
                        return (
                          <tr 
                            key={idx}
                            className={`border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors ${
                              row.isIgnored ? 'bg-rose-50/40 text-slate-400' : 'text-slate-700'
                            }`}
                          >
                            <td className="p-3">
                              {row.isIgnored ? (
                                <div className="flex items-center gap-1 text-slate-400" title={row.invalidReason}>
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                  <span className="line-through">{row.ul}</span>
                                </div>
                              ) : (
                                <span className="font-bold text-slate-800">
                                  {row.ul === 'DT' ? 'Direction Territoriale' : `UL ${row.ul}`}
                                </span>
                              )}
                            </td>

                            <td className="p-3 font-mono font-medium text-slate-600 whitespace-nowrap">
                              {formatDatePartOnly(row.debut) || '-'}
                            </td>

                            <td className="p-3 font-semibold text-slate-900 max-w-[200px] truncate" title={row.manifestation}>
                              {row.manifestation}
                            </td>

                            <td className="p-3 text-center">
                              {row.isIgnored ? (
                                <span className="inline-block text-[9px] font-bold uppercase text-rose-600 bg-rose-100/60 px-1.5 py-0.5 rounded">
                                  Filtré (Hors 78)
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => toggleStatut(row)}
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded cursor-pointer transition border hover:opacity-85 ${
                                    row.statut === 'Confirmé'
                                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                      : 'text-amber-700 bg-amber-50 border-amber-200'
                                  }`}
                                  title="Cliquez pour permuter entre 'Confirmé' et 'Option'"
                                >
                                  {row.statut}
                                  <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                                </button>
                              )}
                            </td>

                            <td className="p-3 text-slate-500 text-[11px] max-w-[150px] truncate" title={row.dimensionnement}>
                              {row.dimensionnement}
                            </td>

                            <td className="p-3 text-center">
                              {row.isIgnored ? '-' : (row.evac ? (
                                <span className="text-emerald-600 font-extrabold">OUI (+3 eq.)</span>
                              ) : (
                                <span className="text-slate-400">NON</span>
                              ))}
                            </td>

                            <td className="p-3 text-center font-mono">
                              {row.isIgnored ? '-' : `${row.heuresDps}h`}
                            </td>

                            <td className="p-3 text-right font-mono text-slate-600 font-medium">
                              {row.isIgnored ? '-' : `${row.prelevement} €`}
                            </td>

                            <td className="p-3 text-right">
                              {row.isIgnored ? '-' : (
                                <div>
                                  <span className="font-bold font-mono text-rc-red">{row.heuresBenevolatCalculees} h</span>
                                  <span className="block text-[9px] text-slate-400">({row.secouristesEngages} secouristes)</span>
                                </div>
                              )}
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
              <div className="p-4 bg-rose-500/10 text-rc-red rounded-full w-14 h-14 mx-auto flex items-center justify-center">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800">Aucun fichier DPS n'est Actif dans le registre</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Le système est prêt pour le traitement. Vous pouvez glisser-déposer votre fichier excel d'activité DPS dans le module de la Section 4 ("Intégrateur DPS"), ou simuler immédiatement l'importation de dossiers types yvelinois.
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded border border-amber-200 text-left text-[11px] text-amber-850 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-amber-700" /> Particularités de la simulation :
                </p>
                <ul className="list-disc list-inside space-y-0.5 ml-1 text-slate-700">
                  <li>Incorpore 9 dossiers fictifs basés sur les UL yvelinoises réelles.</li>
                  <li>Simule l'exclusion automatique des fiches DT92 et l'isolement des prélèvements DT.</li>
                  <li>Génère des indicateurs sanitaires types pour le bilan annuel.</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                <button
                  type="button"
                  onClick={handleLoadSimulation}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded transition cursor-pointer"
                >
                  Simuler le registre type Yvelines (Juin 2026)
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
          <span className="font-mono">DTUS 78 - Rapport consolidé de postes de secours v2.0</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded cursor-pointer"
          >
            Fermer l'Écran Adapté
          </button>
        </div>

      </div>
    </div>
  );
};
