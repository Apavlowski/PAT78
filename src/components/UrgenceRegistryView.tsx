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
  Check, 
  Info,
  RotateCcw,
  Users,
  Trash2,
  PlusCircle,
  MapPin,
  Flame,
  Globe,
  CornerDownRight,
  HeartHandshake
} from 'lucide-react';
import { ParsedUrgenceRow, MetierStats, getYearFromDateString } from '../types';

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

interface UrgenceRegistryViewProps {
  isOpen: boolean;
  onClose: () => void;
  urgenceRows: ParsedUrgenceRow[] | null;
  setUrgenceRows: (rows: ParsedUrgenceRow[] | null) => void;
  fileName: string;
  setFileName: (name: string) => void;
  onDataImported: (newStats: MetierStats[]) => void;
  currentStats: MetierStats[];
}

const SIMULATED_URGENCE_DATA: ParsedUrgenceRow[] = [
  {
    dateDebut: "2026-01-15 18:00",
    dateFin: "2026-01-16 08:00",
    agrementMobilise: "A - Mission de Secours Populaire (Alerte)",
    contexteDescription: "Plan Grand Froid : Établissement d'un centre d'hébergement d'urgence secondaire (35 lits de camp déployés en urgence)",
    raisons: "Alerte grand froid de niveau orange émise par la préfecture des Yvelines",
    zoneAction: "Versailles - Gymnase Montbauron",
    appelCo: "Oui",
    integreBa: "Oui",
    nbPriseEnCharge: 28,
    moyensHumains: "6 équipiers d'urgence d'astreinte territoriale",
    moyensMateriel: "1 VCI, 30 lits de camp, duvets, kits hygiènes d'urgence",
    heuresBenevolat: 84
  },
  {
    dateDebut: "2026-03-12 14:00",
    dateFin: "2026-03-12 21:00",
    agrementMobilise: "B - Soutien des Populations (Sinistre)",
    contexteDescription: "Incendie majeur d'entrepôt industriel mobilisant de multiples casernes de pompiers et forçant l'évacuation",
    raisons: "Évacuation immédiate de 30 pavillons voisins menacés par les fumées toxiques",
    zoneAction: "Trappes - Quartier Sud",
    appelCo: "Oui",
    integreBa: "Non",
    nbPriseEnCharge: 55,
    moyensHumains: "4 secouristes équipiers d'urgence sociale",
    moyensMateriel: "1 Véhicule de Soutien aux Populations, boissons chaudes, 60 paniers-repas",
    heuresBenevolat: 28
  },
  {
    dateDebut: "2026-05-20 08:00",
    dateFin: "2026-05-20 20:00",
    agrementMobilise: "C - Encadrement Sécurité Aquatique",
    contexteDescription: "Inondations par débordement de la Seine suite à des pluies torrentielles persistantes",
    raisons: "Évacuation préventive d'un quartier de péniches et habitations de berge",
    zoneAction: "Conflans-Sainte-Honorine - Quai République",
    appelCo: "Non",
    integreBa: "Oui",
    nbPriseEnCharge: 14,
    moyensHumains: "8 sauveteurs aquatiques et équipiers barques",
    moyensMateriel: "2 embarcations légères de sauvetage (ELS), gilets et cordages",
    heuresBenevolat: 96
  }
];

export const UrgenceRegistryView: React.FC<UrgenceRegistryViewProps> = ({
  isOpen,
  onClose,
  urgenceRows,
  setUrgenceRows,
  fileName,
  setFileName,
  onDataImported,
  currentStats
}) => {
  const renderAgrementLabel = (val?: string) => {
    if (!val || val.trim() === '') {
      return <span className="text-slate-400 italic font-normal">Non spécifié</span>;
    }
    const clean = val.trim();
    const firstChar = clean.charAt(0).toUpperCase();
    const dictionary: Record<string, string> = {
      'A': "Opérations de secours",
      'B': "Actions de soutien aux populations sinistrées",
      'C': "Encadrement des bénévoles lors des actions de soutien aux populations sinistrées",
      'D': "Dispositifs prévisionnels de secours"
    };

    const matchedLabel = dictionary[firstChar];
    if (matchedLabel) {
      if (clean.length === 1 || clean.toUpperCase() === firstChar) {
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold text-[10.5px] bg-amber-50 text-amber-850 border border-amber-200" title={`${firstChar} : ${matchedLabel}`}>
            {firstChar} - {matchedLabel}
          </span>
        );
      }
      if (/^[A-D]\s*[-:]/i.test(clean)) {
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold text-[10.5px] bg-amber-50 text-amber-850 border border-amber-200" title={clean}>
            {clean}
          </span>
        );
      }
    }
    return <span className="text-slate-700 font-semibold">{clean}</span>;
  };

  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  const availableYears = useMemo(() => {
    if (!urgenceRows) return [];
    const yearsSet = new Set<string>();
    urgenceRows.forEach(row => {
      if (row.dateDebut) {
        const yr = getYearFromDateString(row.dateDebut);
        yearsSet.add(String(yr));
      }
    });
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [urgenceRows]);

  if (!isOpen) return null;

  const handleLoadSimulation = () => {
    setUrgenceRows(SIMULATED_URGENCE_DATA);
    setFileName("Plan_Soutien_Urgence_Yvelines_2026.xlsx");
    setFeedbackMsg("Profil type validé ! 3 évènements réels d'Urgence chargés en simulation.");
    setTimeout(() => setFeedbackMsg(''), 4500);
  };

  const handleDeleteRow = (index: number) => {
    if (!urgenceRows) return;
    const copied = [...urgenceRows];
    const removed = copied.splice(index, 1)[0];
    setUrgenceRows(copied.length > 0 ? copied : null);
    setFeedbackMsg(`L'événement d'Urgence "${removed.contexteDescription.substring(0, 30)}..." a été supprimé.`);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleInjectFromRegistry = () => {
    if (!urgenceRows) return;

    const countOfEvents = urgenceRows.length;
    const computedVolHours = urgenceRows.reduce((s, r) => s + (r.heuresBenevolat || 0), 0);

    const updatedStats: MetierStats[] = JSON.parse(JSON.stringify(currentStats));
    const urgenceObj = updatedStats.find(m => m.id === 'urgence');

    if (urgenceObj) {
      // Find year or integrate
      // Let's integrate default in 2026 or separate by years
      const rowsByYear: { [yr: number]: ParsedUrgenceRow[] } = {};
      urgenceRows.forEach(r => {
        const yr = r.dateDebut ? getYearFromDateString(r.dateDebut) : 2026;
        if (!rowsByYear[yr]) rowsByYear[yr] = [];
        rowsByYear[yr].push(r);
      });

      // Clear or rewrite selected histories 
      Object.keys(rowsByYear).forEach(yrStr => {
        const yr = parseInt(yrStr, 10);
        const subRows = rowsByYear[yr];
        const subVolHours = subRows.reduce((s, r) => s + (r.heuresBenevolat || 0), 0);

        const yearStats = urgenceObj.history.find(h => h.year === yr);
        if (yearStats) {
          yearStats.activitiesCount = subRows.length;
          yearStats.volunteerHours = subVolHours;
        } else {
          urgenceObj.history.push({
            year: yr,
            activitiesCount: subRows.length,
            volunteerHours: subVolHours
          });
        }
      });
      
      urgenceObj.history.sort((a, b) => a.year - b.year);

      // Add breakdown entries
      const newBreakdown: { name: string; count: number; hours: number }[] = [];
      urgenceRows.slice(0, 5).forEach(r => {
        newBreakdown.push({
          name: `${r.contexteDescription.substring(0, 45)}...`,
          count: 1,
          hours: r.heuresBenevolat
        });
      });
      urgenceObj.breakdown2026 = newBreakdown;
    }

    onDataImported(updatedStats);
    setFeedbackMsg(`Symphonie réussie ! ${countOfEvents} événements d'Urgence ont été consolidés dans le bilan d'activité.`);
    setTimeout(() => setFeedbackMsg(''), 4500);
  };

  const handleClearAll = () => {
    setUrgenceRows(null);
    setFileName('');
    setFeedbackMsg("Registre d'Urgence vidé.");
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const filteredRows = urgenceRows ? urgenceRows.filter(row => {
    let matchesPeriod = true;
    if (filterPeriod !== 'all') {
      const year = row.dateDebut ? String(getYearFromDateString(row.dateDebut)) : '';
      matchesPeriod = year === filterPeriod;
    }

    const matchesSearch = searchQuery === '' || 
      row.contexteDescription.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchQuery.toLowerCase()) ||
      row.agrementMobilise.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.zoneAction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.raisons.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch && matchesPeriod;
  }) : [];

  // Aggregates
  const totalHours = filteredRows.reduce((acc, row) => acc + (row.heuresBenevolat || 0), 0);
  const totalPec = filteredRows.reduce((acc, row) => acc + (row.nbPriseEnCharge || 0), 0);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-40 animate-fade-in print:bg-white print:p-0">
      <div className="bg-slate-50 rounded-2xl shadow-xl border border-slate-200 max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-slide-up print:shadow-none print:border-none print:max-h-full">
        
        {/* Modal Header */}
        <div className="bg-white border-b border-slate-200 p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100">
              <Flame className="w-5 h-5 text-amber-500 fill-current" />
            </div>
            <div>
              <h3 className="text-md font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Registre Consolidé des Interventions d'Urgence
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {fileName ? `Fichier importé : ${fileName}` : "Espace d'analyse et d'édition des astreintes et interventions Grand Froid / Crues / Sinistres"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-450 hover:text-slate-800 transition cursor-pointer print:hidden"
            title="Fermer cette vue"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal feedback strip */}
        {feedbackMsg && (
          <div className="bg-amber-500 text-white font-semibold text-xs px-5 py-2.5 flex items-center gap-2 animate-pulse shrink-0">
            <Info className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Stats Dashboard Row */}
        <div className="bg-white px-6 py-4 border-b border-slate-150 grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Événements urgents</span>
            <span className="text-lg font-bold text-slate-900 block font-mono mt-0.5">{filteredRows.length} enregistrés</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Bénévolat engagé</span>
            <span className="text-lg font-bold text-amber-600 block font-mono mt-0.5">{totalHours.toLocaleString('fr-FR')} h</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Prises en charge (PECs)</span>
            <span className="text-lg font-bold text-indigo-650 block font-mono mt-0.5">{totalPec.toLocaleString('fr-FR')} victimes</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Source de données</span>
            <span className="text-xs font-bold text-slate-600 block mt-1 truncate" title={fileName}>
              {fileName ? fileName : "Ressources de démonstration"}
            </span>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 print:hidden">
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Filter by Period/Year */}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-450" />
              <select
                id="filter-urgence-registry-period"
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

            {/* General Filter info */}
            <div className="text-[10px] bg-slate-200/65 border border-slate-250 text-slate-650 rounded-md px-2.5 py-1.5 font-bold font-mono">
              Filtre actiel : {filteredRows.length} / {urgenceRows?.length || 0} lignes
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Bar query input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                id="search-urgence-registry"
                type="text"
                placeholder="Rechercher contexte, agrément, zone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 pl-8 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rc-red focus:border-rc-red"
              />
            </div>

            {/* Clear All Data */}
            {urgenceRows && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2.5 py-1.5 text-xs text-red-700 bg-red-50 hover:bg-red-100 border border-red-250 rounded-md cursor-pointer font-bold transition whitespace-nowrap"
              >
                Vider le registre
              </button>
            )}
          </div>
        </div>

        {/* Content Container Area */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {!urgenceRows ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-md mx-auto my-8 space-y-4">
              <div className="w-12 h-12 bg-amber-50 rounded-full border border-amber-100 flex items-center justify-center mx-auto">
                <Flame className="w-6 h-6 text-amber-500 fill-current" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Aucune donnée d'Urgence chargée</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Le registre est vide. Vous pouvez importer un fichier d'urgence réel avec l'outil d'intégration d'activité ou charger notre lot de simulation pour tester notre module.
              </p>
              <button
                type="button"
                onClick={handleLoadSimulation}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-250 cursor-pointer transition"
              >
                Simuler un chargement d'Urgence
              </button>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/85 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-3">Intervention (Date)</th>
                      <th className="p-3">Agrément & Raison</th>
                      <th className="p-3">Contexte / Zone</th>
                      <th className="p-3 text-center">Raccords (CO / BA)</th>
                      <th className="p-3 text-right">Victimes</th>
                      <th className="p-3 text-right font-mono">Bénévolat</th>
                      <th className="p-3 text-center">Moyens</th>
                      <th className="p-3 text-center print:hidden">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/40 transition">
                        {/* Dates column */}
                        <td className="p-3 font-mono text-[11px] whitespace-nowrap">
                          <div className="font-bold text-slate-900 text-xs">
                            {formatDateToFR(row.dateDebut)}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            au {formatDateToFR(row.dateFin)}
                          </div>
                        </td>

                        {/* Agreement mobilised */}
                        <td className="p-3 max-w-[150px]">
                          <div className="font-semibold text-slate-800" title={row.agrementMobilise}>
                            {renderAgrementLabel(row.agrementMobilise)}
                          </div>
                          <div className="text-[10px] text-slate-400 italic line-clamp-1 mt-0.5" title={row.raisons}>
                            {row.raisons}
                          </div>
                        </td>

                        {/* Context & Description */}
                        <td className="p-3 max-w-[280px]">
                          <div className="font-bold text-slate-900 leading-snug line-clamp-2" title={row.contexteDescription}>
                            {row.contexteDescription}
                          </div>
                          <div className="text-[10px] flex items-center gap-1 text-slate-450 mt-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="font-medium text-slate-600">{row.zoneAction}</span>
                          </div>
                        </td>

                        {/* CO / BA matching */}
                        <td className="p-3">
                          <div className="flex flex-col gap-1 items-center justify-center">
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${row.appelCo.toLowerCase().includes('oui') ? 'bg-cyan-50 text-cyan-700 border border-cyan-100' : 'bg-slate-100 text-slate-450'}`}>
                              Appel CO: {row.appelCo}
                            </span>
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${row.integreBa.toLowerCase().includes('oui') ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-slate-100 text-slate-450'}`}>
                              Intégré BA: {row.integreBa}
                            </span>
                          </div>
                        </td>

                        {/* Victims cared for */}
                        <td className="p-3 text-right font-bold text-slate-800 font-mono text-xs whitespace-nowrap">
                          {row.nbPriseEnCharge} vict.
                        </td>

                        {/* Vol hours */}
                        <td className="p-3 text-right font-bold text-amber-600 font-mono text-xs whitespace-nowrap">
                          {row.heuresBenevolat} h
                        </td>

                        {/* Humanity & materials engagés */}
                        <td className="p-3 text-slate-600 max-w-[150px] whitespace-normal">
                          <div className="text-[10px]"><span className="font-semibold text-slate-700">Hommes :</span> {row.moyensHumains}</div>
                          <div className="text-[10px] mt-0.5"><span className="font-semibold text-slate-700">Matériel :</span> {row.moyensMateriel}</div>
                        </td>

                        {/* Actions buttons */}
                        <td className="p-3 text-center whitespace-nowrap print:hidden">
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(idx)}
                            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-700 rounded transition cursor-pointer"
                            title="Supprimer cette ligne"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Référentiel des agréments de sécurité civile */}
          <div className="mt-6 p-4 bg-slate-100/70 border border-slate-200 rounded-xl print:hidden">
            <div className="flex items-center gap-2 mb-2.5">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <h5 className="text-xs font-bold text-slate-800">Légende Référentielle des Agréments de Sécurité Civile</h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-white border border-slate-150 rounded-lg shadow-3xs flex items-start gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-amber-50 border border-amber-200 text-[11px] font-extrabold text-amber-700 font-mono shrink-0">A</span>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-855 leading-tight">Opérations de secours</p>
                  <p className="text-[10px] text-slate-450 leading-relaxed">Secours d'urgence, assistance aux victimes directes</p>
                </div>
              </div>
              <div className="p-2.5 bg-white border border-slate-150 rounded-lg shadow-3xs flex items-start gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-amber-50 border border-amber-200 text-[11px] font-extrabold text-amber-700 font-mono shrink-0">B</span>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-855 leading-tight">Actions de soutien aux populations sinistrées</p>
                  <p className="text-[10px] text-slate-450 leading-relaxed">Hébergement d'urgence, alimentation, réconfort de premier niveau</p>
                </div>
              </div>
              <div className="p-2.5 bg-white border border-slate-150 rounded-lg shadow-3xs flex items-start gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-amber-50 border border-amber-200 text-[11px] font-extrabold text-amber-700 font-mono shrink-0">C</span>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-855 leading-tight">Encadrement des bénévoles lors des actions de soutien aux populations sinistrées</p>
                  <p className="text-[10px] text-slate-450 leading-relaxed">Gestion des élans de solidarité et encadrement de bénévoles spontanés</p>
                </div>
              </div>
              <div className="p-2.5 bg-white border border-slate-150 rounded-lg shadow-3xs flex items-start gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-amber-50 border border-amber-200 text-[11px] font-extrabold text-amber-700 font-mono shrink-0">D</span>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-855 leading-tight">Dispositifs prévisionnels de secours</p>
                  <p className="text-[10px] text-slate-450 leading-relaxed">Postes de secours sur rassemblements de personnes et manifestations</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-white border-t border-slate-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-start gap-2 max-w-lg">
            <Info className="w-4 h-4 text-slate-450 mt-0.5 shrink-0" />
            <p className="text-[11px] text-slate-500 leading-normal">
              <b>Optionnel :</b> Si vous modifiez ou supprimez des lignes d'intervention d'urgence ci-dessus, vous devez cliquer sur "Consolider la mise à jour" pour recalculer le bilan officiel d'Urgence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {urgenceRows && (
              <button
                type="button"
                onClick={handleInjectFromRegistry}
                className="px-4 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Consolider la mise à jour
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg cursor-pointer"
            >
              Fermer le registre d'Urgence
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
