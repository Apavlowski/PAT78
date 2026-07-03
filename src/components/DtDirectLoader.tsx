/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Coins, 
  Activity, 
  Check, 
  AlertTriangle, 
  RotateCcw, 
  Info,
  TrendingUp,
  Stethoscope,
  Heart,
  Beef,
  Flame
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { MetierStats, ParsedDtDirectRow, formatExcelCellValue } from '../types';

interface DtDirectLoaderProps {
  onDataImported: (newStats: MetierStats[]) => void;
  currentStats: MetierStats[];
  parsedDtRows: ParsedDtDirectRow[] | null;
  setParsedDtRows: React.Dispatch<React.SetStateAction<ParsedDtDirectRow[] | null>>;
  fileName: string;
  setFileName: React.Dispatch<React.SetStateAction<string>>;
  importStatus: { type: 'success' | 'error' | null; message: string };
  setImportStatus: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error' | null; message: string }>>;
  onInject?: (rows: ParsedDtDirectRow[], file: string) => void;
  existingDtDirectRows?: ParsedDtDirectRow[] | null;
}

const SIMULATED_DT_DIRECT_DATA: ParsedDtDirectRow[] = [
  {
    label: "Festival Electro Yvelines Direct DT",
    date: "2026-07-10",
    duree: 12,
    nbSecouristes: 16,
    devisSecours: 4800,
    devisCrss: "Médecin + Infirmier CRSS", // Non empty => medicalised
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
    gainDt: 1360 // 4800 - 3200 - 240
  },
  {
    label: "Triathlon International de Rambouillet",
    date: "2026-06-14",
    duree: 8,
    nbSecouristes: 10,
    devisSecours: 2400,
    devisCrss: "", // Empty => not medicalised
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
    gainDt: 650 // 2400 - 1600 - 150
  },
  {
    label: "Meeting Aérien de Saint-Cyr-l'École",
    date: "2026-09-05",
    duree: 9,
    nbSecouristes: 12,
    devisSecours: 3200,
    devisCrss: "Infirmier urgentiste", // Non empty => medicalised
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
    gainDt: 820 // 3200 - 2200 - 180
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
    gainDt: 500 // 1900 - 1300 - 100
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
    gainDt: 1000 // 3900 - 2700 - 200
  }
];

export const DtDirectLoader: React.FC<DtDirectLoaderProps> = ({
  onDataImported,
  currentStats,
  parsedDtRows,
  setParsedDtRows,
  fileName,
  setFileName,
  importStatus,
  setImportStatus,
  onInject,
  existingDtDirectRows
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [integrationYear, setIntegrationYear] = useState<number>(2026);

  // Automatically detect default integration year from data if possible
  const detectedYear = React.useMemo(() => {
    if (parsedDtRows && parsedDtRows.length > 0) {
      for (const r of parsedDtRows) {
        if (r.date) {
          const match = r.date.match(/^(\d{4})/);
          if (match) {
            const yr = parseInt(match[1], 10);
            if ([2024, 2025, 2026].includes(yr)) {
              return yr;
            }
          }
        }
      }
    }
    return null;
  }, [parsedDtRows]);

  React.useEffect(() => {
    if (detectedYear) {
      setIntegrationYear(detectedYear);
    }
  }, [detectedYear]);

  // Helper values safely parsing Excel cell values
  const getCellValue = (row: any, index: number, defaultValue: string = ''): string => {
    if (!row || index === -1 || row[index] === undefined || row[index] === null) {
      return defaultValue;
    }
    const val = row[index];
    if (val instanceof Date) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const d = String(val.getDate()).padStart(2, '0');
      const hrs = val.getHours();
      const mins = val.getMinutes();
      if (hrs === 0 && mins === 0) {
        return `${y}-${m}-${d}`;
      }
      return `${y}-${m}-${d} ${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }
    if (typeof val === 'number' && val >= 30000 && val <= 60000) {
      const UTC_days = Math.floor(val - 25569);
      const dateObj = new Date(1899, 11, 30);
      dateObj.setDate(dateObj.getDate() + Math.floor(val));
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const d = String(dateObj.getDate()).padStart(2, '0');
      const fraction = val - Math.floor(val);
      if (fraction > 0) {
        const totalSeconds = Math.round(fraction * 86450);
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        return `${y}-${m}-${d} ${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      }
      return `${y}-${m}-${d}`;
    }
    return String(val).trim();
  };

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

  const getCellNum = (row: any, index: number, defaultValue: number = 0): number => {
    if (!row || index === -1 || row[index] === undefined || row[index] === null) {
      return defaultValue;
    }
    const val = parseFloat(String(row[index]).replace(/[^\d.-]/g, ''));
    return isNaN(val) ? defaultValue : val;
  };

  // Build a dummy Direct DT Excel file with the specified headers
  const handleDownloadDtTemplate = () => {
    try {
      const headers = [
        "Label",
        "Date",
        "Durée",
        "Nombre de secouristes",
        "Devis secours",
        "Devis CRSS",
        "Reversement UL",
        "Repas",
        "CA net",
        "NB Vacations 4H",
        "Nb Soins",
        "Nb décharge",
        "Nb évac",
        "Nb autre",
        "Nb petits soins",
        "Nb trauma",
        "Nb Malaise",
        "Nb inconscient",
        "Nb ACR"
      ];

      const data = [
        headers,
        [
          "Festival Electro Yvelines Direct DT", "2026-07-10", 12, 16, 4800, "Médecin + Infirmier CRSS", 3200, 240, 4560, 48, 35, 4, 3, 12, 20, 10, 18, 2, 0
        ],
        [
          "Triathlon International de Rambouillet", "2026-06-14", 8, 10, 2400, "", 1600, 150, 2250, 20, 14, 0, 1, 4, 10, 8, 4, 0, 0
        ],
        [
          "Meeting Aérien de Saint-Cyr-l'École", "2026-09-05", 9, 12, 3200, "Infirmier d'Urgence CRSS", 2200, 180, 3020, 27, 8, 1, 0, 3, 5, 4, 3, 0, 0
        ]
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Postes Directs DT - DTUS 78");
      
      XLSX.writeFile(workbook, "modele_postes_directs_dt_78.xlsx");
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: `Erreur interne lors de la génération du modèle : ${err?.message || err}`
      });
    }
  };

  // Instant simulation loader
  const handleLoadSimulation = () => {
    setParsedDtRows(SIMULATED_DT_DIRECT_DATA);
    setFileName("Simulation_DT_Direct_Juin2026.xlsx");
    setImportStatus({
      type: 'success',
      message: "Simulation chargée ! 5 dispositifs portés en direct par la DT ont été injectés avec calculs financiers et clinique complets."
    });
  };

  // Process selected file
  const handleFileProcess = (file: File) => {
    setFileName(file.name);
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension !== 'xlsx' && fileExtension !== 'xls' && fileExtension !== 'csv') {
      setImportStatus({
        type: 'error',
        message: 'Type de fichier non supporté. Veuillez déposer un fichier Excel (.xlsx, .xls) ou un fichier CSV (.csv).'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return;
        const workbook = XLSX.read(data, { type: fileExtension === 'csv' ? 'string' : 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        if (rows.length < 2) {
          throw new Error("Le fichier semble vide ou ne comprend pas de ligne d'en-tête et de données.");
        }

        // Detect Indices (Normalizing and stripping French accents)
        const headers = rows[0].map((h: any) => 
          String(h || '').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        );

        const labelIdx = headers.findIndex(h => h === 'label' || h.includes('libelle') || h.includes('manifestation') || h.includes('evenement') || h === 'titre');
        const dateIdx = headers.findIndex(h => h === 'date' || h.includes('debut') || h.includes('le'));
        const dureeIdx = headers.findIndex(h => h === 'duree' || h.includes('heure') || h.includes('temps'));
        const secouristesIdx = headers.findIndex(h => h.includes('secouriste') || h.includes('nombre de secouristes') || h.includes('equipe') || h.includes('effectif'));
        const devisSecoursIdx = headers.findIndex(h => h.includes('devis secours') || h.includes('prix facture') || h.includes('global') || h.includes('tarif'));
        const devisCrssIdx = headers.findIndex(h => h.includes('devis crss') || h === 'crss');
        const reversementUlIdx = headers.findIndex(h => h.includes('reversement') || h.includes('ul') || h.includes('revers'));
        const repasIdx = headers.findIndex(h => h === 'repas' || h.includes('nourriture') || h.includes('frais'));
        const caNetIdx = headers.findIndex(h => h.includes('ca net') || h === 'ca_net' || h.includes('chiffre d\'affaire'));
        const vacationsIdx = headers.findIndex(h => h.includes('vacation') || h.includes('vacations') || h.includes('nb v'));
        
        // Clinical Headers indices
        const nbSoinsIdx = headers.findIndex(h => h === 'nb soins' || h.includes('nb_soins') || h === 'soins');
        const nbDechargeIdx = headers.findIndex(h => h.includes('decharge') || h === 'nb_decharge');
        const nbEvacIdx = headers.findIndex(h => h === 'nb evac' || h.includes('nb_evac') || h === 'evacuation' || h.includes('evac'));
        const nbAutreIdx = headers.findIndex(h => h.includes('autre'));
        const nbPetitsSoinsIdx = headers.findIndex(h => h.includes('petits soins') || h.includes('petit'));
        const nbTraumaIdx = headers.findIndex(h => h.includes('trauma'));
        const nbMalaiseIdx = headers.findIndex(h => h.includes('malaise'));
        const nbInconscientIdx = headers.findIndex(h => h.includes('inconscient'));
        const nbAcrIdx = headers.findIndex(h => h === 'nb acr' || h.includes('nb_acr') || h.includes('acr'));

        if (labelIdx === -1 || dureeIdx === -1 || devisSecoursIdx === -1) {
          throw new Error("Structure de colonnes incorrecte. Colonnes vitales manquantes : 'Label', 'Durée' et 'Devis secours'.");
        }

        const calculatedRows: ParsedDtDirectRow[] = [];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0 || row.every(val => val === undefined || val === null || val === '')) {
            continue; // skip blank rows
          }

          const label = getCellValue(row, labelIdx, 'Poste Direct DT indéterminé');
          const date = formatExcelCellValue(row[dateIdx]) || '2026-06';
          const duree = getCellNum(row, dureeIdx, 0);
          const nbSecouristes = getCellNum(row, secouristesIdx, 0);
          const devisSecours = getCellNum(row, devisSecoursIdx, 0);
          const devisCrss = getCellValue(row, devisCrssIdx, '');
          const reversementUl = getCellNum(row, reversementUlIdx, 0);
          const repas = getCellNum(row, repasIdx, 0);
          const caNet = getCellNum(row, caNetIdx, devisSecours);
          const nbVacations4h = getCellNum(row, vacationsIdx, 0);

          const nbSoins = getCellNum(row, nbSoinsIdx, 0);
          const nbDecharge = getCellNum(row, nbDechargeIdx, 0);
          const nbEvac = getCellNum(row, nbEvacIdx, 0);
          const nbAutre = getCellNum(row, nbAutreIdx, 0);
          const nbPetitsSoins = getCellNum(row, nbPetitsSoinsIdx, 0);
          const nbTrauma = getCellNum(row, nbTraumaIdx, 0);
          const nbMalaise = getCellNum(row, nbMalaiseIdx, 0);
          const nbInconscient = getCellNum(row, nbInconscientIdx, 0);
          const nbAcr = getCellNum(row, nbAcrIdx, 0);

          // Rule: devisCrss non empty and not '0' => medicalised
          const trimmedCrss = devisCrss.trim();
          const isMedicalise = trimmedCrss !== '' && 
                               trimmedCrss !== '0' && 
                               trimmedCrss !== '0.00' && 
                               trimmedCrss !== '0,00' && 
                               trimmedCrss.toLowerCase() !== 'non' && 
                               trimmedCrss.toLowerCase() !== 'aucun';

          // DT Gain calculator formula: Devis secours - Reversement UL - Repas
          const gainDt = devisSecours - reversementUl - repas;

          // Check if already known in database/registry
          const isAlreadyKnown = !!(
            existingDtDirectRows &&
            existingDtDirectRows.some(existing => 
              existing.label.trim().toLowerCase() === label.trim().toLowerCase() &&
              existing.date === date
            )
          );

          calculatedRows.push({
            label,
            date,
            duree,
            nbSecouristes,
            devisSecours,
            devisCrss,
            isMedicalise,
            reversementUl,
            repas,
            caNet,
            nbVacations4h,
            nbSoins,
            nbDecharge,
            nbEvac,
            nbAutre,
            nbPetitsSoins,
            nbTrauma,
            nbMalaise,
            nbInconscient,
            nbAcr,
            gainDt,
            isAlreadyKnown
          });
        }

        if (calculatedRows.length === 0) {
          throw new Error("Aucune ligne d'activité DT Direct exploitable trouvée.");
        }

        setParsedDtRows(calculatedRows);
        setImportStatus({
          type: 'success',
          message: `Fichier DT Direct validé avec succès ! ${calculatedRows.length} postes détectés pour un gain global DT de ${calculatedRows.reduce((s, r)=> s + r.gainDt, 0).toLocaleString('fr-FR')} €.`
        });
      } catch (err: any) {
        setImportStatus({
          type: 'error',
          message: `Erreur d'analyse : ${err?.message || 'Vérifiez la conformité des en-têtes requises.'}`
        });
      }
    };

    if (fileExtension === 'csv') {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleReset = () => {
    setParsedDtRows(null);
    setFileName('');
    setImportStatus({ type: null, message: '' });
  };

  // Inject DT Direct posts data into core "Secourisme" dashboards
  const handleInjectDtDirect = () => {
    if (!parsedDtRows) return;
    setShowConfirmModal(true);
  };

  const performActualDtDirectInjection = () => {
    if (!parsedDtRows) return;

    // Adjust years in dates of parsedDtRows to match selected integrationYear
    const adjustedRows = parsedDtRows.map(r => {
      let adjDate = r.date;
      if (r.date && r.date.match(/^(\d{4})/)) {
        adjDate = r.date.replace(/^(\d{4})/, String(integrationYear));
      }
      return {
        ...r,
        date: adjDate
      };
    });

    const totalDtDirectPosts = adjustedRows.length;
    const calculatedHours = Math.round(adjustedRows.reduce((sum, r) => sum + (r.duree * r.nbSecouristes), 0));

    if (onInject) {
      onInject(adjustedRows, fileName);
    } else {
      // Deep copy of existing stats
      const updatedStats: MetierStats[] = JSON.parse(JSON.stringify(currentStats));
      const secourismeObj = updatedStats.find(m => m.id === 'secourisme');

      if (secourismeObj) {
        const yearStats = secourismeObj.history.find(h => h.year === integrationYear);
        
        if (yearStats) {
          yearStats.activitiesCount += totalDtDirectPosts;
          yearStats.volunteerHours += calculatedHours;
        } else {
          secourismeObj.history.push({
            year: integrationYear,
            activitiesCount: totalDtDirectPosts,
            volunteerHours: calculatedHours
          });
          secourismeObj.history.sort((a, b) => a.year - b.year);
        }

        // Append DT Direct posts into the breakdown
        const dtBreakdowns = adjustedRows.map(r => ({
          name: `[DT Direct] ${r.label}`,
          count: 1,
          hours: Math.round(r.duree * r.nbSecouristes)
        }));

        // Keep existing breakdown entries (excluding old [DT Direct] duplicates) and append new ones
        if (integrationYear === 2026) {
          const existingBreakdown = secourismeObj.breakdown2026.filter(b => !b.name.startsWith('[DT Direct]'));
          secourismeObj.breakdown2026 = [...dtBreakdowns, ...existingBreakdown].slice(0, 6);
        }
      }

      onDataImported(updatedStats);
    }

    setParsedDtRows(null);
    setFileName('');
    setImportStatus({
      type: 'success',
      message: `Symphonie réussie ! ${totalDtDirectPosts} postes portés en direct par la DT (pour ${calculatedHours.toLocaleString('fr-FR')} h de bénévolat) ont été injectés dans le tableau de bord Secourisme ${integrationYear}. Retrouvez-les à tout moment dans l'onglet 'Postes directs DT' ou via le sélecteur d'année.`
    });
  };

  // Calculation summaries
  const totalDevis = parsedDtRows ? parsedDtRows.reduce((s, r)=> s + r.devisSecours, 0) : 0;
  const totalReversement = parsedDtRows ? parsedDtRows.reduce((s, r)=> s + r.reversementUl, 0) : 0;
  const totalRepas = parsedDtRows ? parsedDtRows.reduce((s, r)=> s + r.repas, 0) : 0;
  const totalGainDt = parsedDtRows ? parsedDtRows.reduce((s, r)=> s + r.gainDt, 0) : 0;
  const totalHoursCalculated = parsedDtRows ? Math.round(parsedDtRows.reduce((s, r)=> s + (r.duree * r.nbSecouristes), 0)) : 0;
  const pctMedicalised = parsedDtRows ? Math.round((parsedDtRows.filter(r => r.isMedicalise).length / parsedDtRows.length) * 100) : 0;

  // Clinical aggregation
  const dclSoins = parsedDtRows ? parsedDtRows.reduce((s, r) => s + r.nbSoins, 0) : 0;
  const dclEvac = parsedDtRows ? parsedDtRows.reduce((s, r) => s + r.nbEvac, 0) : 0;
  const dclTrauma = parsedDtRows ? parsedDtRows.reduce((s, r) => s + r.nbTrauma, 0) : 0;
  const dclMalaise = parsedDtRows ? parsedDtRows.reduce((s, r) => s + r.nbMalaise, 0) : 0;
  const dclInconscients = parsedDtRows ? parsedDtRows.reduce((s, r) => s + r.nbInconscient, 0) : 0;
  const dclAcr = parsedDtRows ? parsedDtRows.reduce((s, r) => s + r.nbAcr, 0) : 0;

  return (
    <div id="dt-direct-loader-container" className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-slideIn">
            <div className="bg-indigo-600 text-white p-4 flex items-center gap-2.5 font-bold">
              <Check className="w-5 h-5" />
              <span>Confirmer l'intégration (Postes direct DT)</span>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-650 leading-relaxed">
                Voulez-vous intégrer ces données consolidées dans le tableau de bord Secourisme {integrationYear} ?
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Source :</span>
                  <span className="font-bold text-slate-805 truncate max-w-[200px]">{fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Postes directs DT :</span>
                  <span className="font-bold text-slate-800">{parsedDtRows ? parsedDtRows.length : 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Heures de bénévolat :</span>
                  <span className="font-bold text-indigo-700">{totalHoursCalculated.toLocaleString('fr-FR')} h</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-slate-200 pt-1.5">
                  <span className="text-slate-500">Marge nette DT :</span>
                  <span className="font-bold text-emerald-700">{totalGainDt.toLocaleString('fr-FR')} €</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                Après intégration, la liste de travail ci-dessous sera vidée. Les données resteront accessibles et modifiables en cliquant sur le bouton "Postes directs DT" en haut de la page.
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 border-t border-slate-150 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  performActualDtDirectInjection();
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-xs transition cursor-pointer"
              >
                Confirmer l'intégration
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header section with template downloading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-700 rounded-lg">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Module Opérationnel DT : Postes Directs DT</h4>
            <p className="text-xs text-slate-500">Intégration et analyse financière des grands dispositifs portés et facturés en direct par la DTUS 78</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadDtTemplate}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition cursor-pointer border border-indigo-150"
          >
            <Download className="w-3.5 h-3.5" />
            Télécharger le Modèle DT (.xlsx)
          </button>
        </div>
      </div>

      {!parsedDtRows ? (
        /* DROP ZONE */
        <div className="space-y-4">
          <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-lg flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
            <div className="text-[11px] text-amber-950 leading-relaxed">
              <p className="font-bold">Spécificités et règles de calcul financières & techniques :</p>
              <ul className="list-disc list-inside mt-1 space-y-1 ml-1 text-slate-700">
                <li><b>Calcul de Marge (Gain DT) :</b> <span className="font-semibold text-slate-800">Devis secours - Reversement UL - Repas</span>.</li>
                <li><b>Médicalisation :</b> Détectée automatiquement si la colonne <i>Devis CRSS</i> est renseignée (médecin, infirmier, etc.).</li>
                <li><b>Bénévolat :</b> Consolidé sur la formule : <span className="font-semibold text-slate-800">Durée x Nombre de secouristes</span>.</li>
                <li><b>Suivi clinique :</b> Extraction et consolidation des indicateurs de traumatologie, malaise, réanimation, ACR pour bilan national.</li>
              </ul>
            </div>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-9 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-indigo-500 bg-indigo-500/5 scale-[1.01]'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-indigo-500/5 text-indigo-600 rounded-full">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 animate-pulse">
                  Glissez-déposez ici votre fichier d'activité Direct DT (.xlsx, .xls ou .csv)
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Ou cliquez pour sélectionner dans vos dossiers locaux
                </p>
              </div>
            </div>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />

          <div className="flex justify-center pt-2">
            <button
              onClick={handleLoadSimulation}
              type="button"
              className="px-5 py-2.5 text-xs font-bold text-white bg-slate-850 hover:bg-slate-750 rounded-lg cursor-pointer transition shadow-2xs"
            >
              Simuler l'injection de 5 grands postes directs DT (Yvelines 2026)
            </button>
          </div>

          {importStatus.type === 'error' && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-md text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{importStatus.message}</span>
            </div>
          )}
        </div>
      ) : (
        /* RESULTS INTERACTIVE LAYOUT */
        <div className="space-y-6 animate-slideIn">
          
          {/* File summary and Action Buttons with Year Selector */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4.5 h-4.5 text-indigo-600" />
                <span className="text-xs font-bold text-slate-850 truncate max-w-[200px]" title={fileName}>{fileName}</span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded border border-indigo-150 font-bold uppercase font-mono shrink-0">Registre DT Actif</span>
              </div>
              <span className="hidden sm:inline text-slate-300">|</span>
              <div className="flex items-center gap-2">
                <label htmlFor="integration-year-dt-select" className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Année d'intégration :</label>
                <select
                  id="integration-year-dt-select"
                  value={integrationYear}
                  onChange={(e) => setIntegrationYear(parseInt(e.target.value, 10))}
                  className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-indigo-600 cursor-pointer"
                >
                  <option value={2026}>2026 (Année en cours)</option>
                  <option value={2025}>2025 (Année -1)</option>
                  <option value={2024}>2024 (Année -2)</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 w-full lg:w-auto shrink-0">
              <button
                onClick={handleReset}
                className="flex px-3 py-2 items-center justify-center text-xs font-semibold bg-white text-slate-600 border border-slate-300 rounded hover:bg-slate-100 transition cursor-pointer"
                title="Charger un autre fichier"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Vider
              </button>
              
              <button
                onClick={handleInjectDtDirect}
                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-xs transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Injecter cumulativement dans Secourisme {integrationYear}
              </button>
            </div>
          </div>

          {/* Micro KPI Financial & operational Grid for DT Profits */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* KPI 1: Gain DT Profit (Formula: Devis secours - Reversement UL - Repas) */}
            <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100 relative overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">Marge DT (Gain Réel)</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-indigo-900 font-mono">+{totalGainDt.toLocaleString('fr-FR')}</span>
                <span className="text-xs font-bold text-indigo-900">€</span>
              </div>
              <div className="text-[9px] text-slate-500 mt-1 leading-normal flex justify-between">
                <span>Rendement DT :</span>
                <span className="font-bold text-indigo-700">{totalDevis ? Math.round((totalGainDt/totalDevis)*100) : 0}% du Chiffre d'Affaires</span>
              </div>
              <div className="absolute right-3 top-3.5 text-indigo-100">
                <Coins className="w-10 h-10 stroke-1" />
              </div>
            </div>

            {/* KPI 2: Chiffre d'affaires facturé global */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 relative overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Devis global facturé</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-slate-900 font-mono">{totalDevis.toLocaleString('fr-FR')}</span>
                <span className="text-xs font-bold text-slate-500">€</span>
              </div>
              <p className="text-[9px] text-slate-500 mt-1 leading-normal">
                Montant facturé aux donneurs d'ordres extérieurs.
              </p>
              <div className="absolute right-3 top-3.5 text-slate-200">
                <TrendingUp className="w-10 h-10 stroke-1" />
              </div>
            </div>

            {/* KPI 3: Reversé aux UL partenaires */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 relative overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Reversement total aux UL</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-emerald-700 font-mono">{totalReversement.toLocaleString('fr-FR')}</span>
                <span className="text-xs font-bold text-emerald-700">€</span>
              </div>
              <p className="text-[9px] text-slate-500 mt-1 leading-normal">
                Financement reversé aux Unités Locales yvelinoises partenaires.
              </p>
              <div className="absolute right-3 top-3.5 text-slate-200">
                <Heart className="w-10 h-10 stroke-1" />
              </div>
            </div>

            {/* KPI 4: Bénévolat Consolidé */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 relative overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Volume Bénévolat DT</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-rc-red font-mono">{totalHoursCalculated.toLocaleString('fr-FR')}</span>
                <span className="text-xs font-bold text-rc-red">h</span>
              </div>
              <div className="text-[9px] text-slate-500 mt-1 leading-normal">
                Calcul : {totalHoursCalculated} h apportées sur le territoire.
              </div>
              <div className="absolute right-3 top-3.5 text-slate-200">
                <Clock className="w-10 h-10 stroke-1" />
              </div>
            </div>

          </div>

          {/* Clinical stats for Bilan Siège */}
          <div className="p-4 bg-rose-500/5 border border-rose-100 rounded-lg">
            <h5 className="text-[11px] font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-1.5 mb-3">
              <Stethoscope className="w-4 h-4 text-rc-red" />
              Bilan Clinique & Pathologique (Indicateurs consolidés direct DT/médicalisé)
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
              <div className="bg-white p-2 rounded border border-slate-150">
                <span className="block text-slate-400 text-[9px] font-bold uppercase">Nb Soins</span>
                <span className="text-sm font-extrabold text-slate-800 font-mono">{dclSoins}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-150">
                <span className="block text-slate-400 text-[9px] font-bold uppercase">Nb Trauma</span>
                <span className="text-sm font-extrabold text-amber-700 font-mono">{dclTrauma}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-150">
                <span className="block text-slate-400 text-[9px] font-bold uppercase">Malaises</span>
                <span className="text-sm font-extrabold text-slate-700 font-mono">{dclMalaise}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-150">
                <span className="block text-slate-400 text-[9px] font-bold uppercase">Inconscients</span>
                <span className="text-sm font-extrabold text-purple-700 font-mono">{dclInconscients}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-150">
                <span className="block text-slate-400 text-[9px] font-bold uppercase">Nb ACR</span>
                <span className="text-sm font-extrabold text-rc-red font-mono">{dclAcr}</span>
              </div>
              <div className="bg-emerald-50 p-2 rounded border border-emerald-200 text-emerald-800 font-semibold">
                <span className="block text-[9px] font-bold uppercase opacity-80">Évacuations</span>
                <span className="text-sm font-extrabold font-mono">{dclEvac} Evac</span>
              </div>
            </div>
            
            <div className="mt-3 flex items-center gap-2 text-[11px] text-indigo-855 font-medium">
              <div className="p-1 rounded-full bg-indigo-100 text-indigo-700">
                <Stethoscope className="w-3.5 h-3.5" />
              </div>
              <span>Présence Médicale (Disposant de CRSS) : <strong className="text-indigo-900">{parsedDtRows.filter(r => r.isMedicalise).length} postes</strong> ({pctMedicalised}% de taux de médicalisation globale)</span>
            </div>
          </div>

          {/* Table list of DT Direct entries with edit toggle */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-tight">Postes en direct de la DTUS 78</h5>
            
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                    <th className="p-3">Label Manifestation</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-center">Durée (h)</th>
                    <th className="p-3 text-center">Médicalisation (CRSS)</th>
                    <th className="p-3 text-right">Devis Secours</th>
                    <th className="p-3 text-right">Reversement UL</th>
                    <th className="p-3 text-right">Frais Repas</th>
                    <th className="p-3 text-right font-semibold text-indigo-850">Gain DT</th>
                    <th className="p-3 text-right">Bénévolat</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedDtRows.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-100 last:border-none hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-semibold text-slate-900 max-w-[200px] truncate" title={row.label}>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="truncate">{row.label}</span>
                          {row.isAlreadyKnown && (
                            <span 
                              className="inline-flex items-center text-[8px] font-extrabold uppercase text-blue-700 bg-blue-50 border border-blue-200 px-1 py-0.25 rounded-md shrink-0 cursor-help"
                              title="Déjà connu en base : ne fera l'objet que d'une mise à jour (prises en charge et bilans cliniques) pour éviter les doublons."
                            >
                              Mise à jour
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-slate-550 text-[11px]">
                        {formatDateToFR(row.date)}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {row.duree} h
                      </td>
                      <td className="p-3 text-center">
                        {row.isMedicalise ? (
                          <span className="inline-block text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded" title={row.devisCrss}>
                            Médicalisé ✔
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-700">
                        {row.devisSecours.toLocaleString('fr-FR')} €
                      </td>
                      <td className="p-3 text-right font-mono text-emerald-700">
                        {row.reversementUl.toLocaleString('fr-FR')} €
                      </td>
                      <td className="p-3 text-right font-mono text-rose-700">
                        {row.repas.toLocaleString('fr-FR')} €
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-indigo-700 bg-indigo-50/30">
                        {row.gainDt.toLocaleString('fr-FR')} €
                      </td>
                      <td className="p-3 text-right">
                        <span className="font-bold text-rc-red font-mono">{row.duree * row.nbSecouristes} h</span>
                        <span className="block text-[9px] text-slate-400">({row.nbSecouristes} secouristes)</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-indigo-50 text-indigo-950 rounded border border-indigo-150 flex items-start gap-2.5">
              <Check className="w-4 h-4 text-indigo-650 shrink-0 mt-0.5" />
              <div className="text-[10px] leading-relaxed">
                <strong>Prêt pour l'injection :</strong> En cliquant sur le bouton <i>"Injecter cumulativement"</i>, ces {parsedDtRows.length} postes viendront abonder les statistiques {integrationYear} de l'activité Secourisme, et s'afficheront de manière distincte dans le diagramme d'analyse détaillé.
              </div>
            </div>
          </div>

          {/* Action Success Alert Box */}
          {importStatus.type === 'success' && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">Analyse operationnelle concluante</p>
                <p className="text-xs mt-0.5 leading-relaxed">{importStatus.message}</p>
                <button
                  onClick={handleInjectDtDirect}
                  className="mt-2 text-xs font-black text-indigo-700 bg-white px-3 py-1.5 rounded-md border border-slate-200 cursor-pointer hover:shadow-xs transition flex items-center gap-1"
                >
                  Intégrer les données dans Secourisme {integrationYear} →
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
