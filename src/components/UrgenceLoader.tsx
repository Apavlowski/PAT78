/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Clock, 
  Users, 
  Calendar, 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Check, 
  Info,
  MapPin,
  HeartHandshake
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { MetierStats, ParsedUrgenceRow, formatExcelCellValue } from '../types';

interface UrgenceLoaderProps {
  onDataImported: (newStats: MetierStats[]) => void;
  currentStats: MetierStats[];
  parsedUrgenceRows: ParsedUrgenceRow[] | null;
  setParsedUrgenceRows: React.Dispatch<React.SetStateAction<ParsedUrgenceRow[] | null>>;
  fileName: string;
  setFileName: React.Dispatch<React.SetStateAction<string>>;
  importStatus: { type: 'success' | 'error' | null; message: string };
  setImportStatus: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error' | null; message: string }>>;
  onInject?: (rows: ParsedUrgenceRow[], file: string) => void;
  existingUrgenceRows?: ParsedUrgenceRow[] | null;
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

export const UrgenceLoader: React.FC<UrgenceLoaderProps> = ({
  onDataImported,
  currentStats,
  parsedUrgenceRows,
  setParsedUrgenceRows,
  fileName,
  setFileName,
  importStatus,
  setImportStatus,
  onInject,
  existingUrgenceRows
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [integrationYear, setIntegrationYear] = useState<number>(2026);

  // Automatically detect year from the start dates
  const detectedYear = React.useMemo(() => {
    if (parsedUrgenceRows && parsedUrgenceRows.length > 0) {
      for (const r of parsedUrgenceRows) {
        if (r.dateDebut) {
          const match = r.dateDebut.match(/^(\d{4})/);
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
  }, [parsedUrgenceRows]);

  React.useEffect(() => {
    if (detectedYear) {
      setIntegrationYear(detectedYear);
    }
  }, [detectedYear]);

  // Safe XML/Excel Cell Value reader 
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
      const dateObj = new Date(1899, 11, 30);
      dateObj.setDate(dateObj.getDate() + Math.floor(val));
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const d = String(dateObj.getDate()).padStart(2, '0');
      const fraction = val - Math.floor(val);
      if (fraction > 0) {
        const totalSeconds = Math.round(fraction * 86400);
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        return `${y}-${m}-${d} ${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      }
      return `${y}-${m}-${d}`;
    }
    return String(val).trim();
  };

  const getCellNum = (row: any, index: number, defaultValue: number = 0): number => {
    if (!row || index === -1 || row[index] === undefined || row[index] === null) {
      return defaultValue;
    }
    const rawVal = row[index];
    if (typeof rawVal === 'number') return rawVal;
    const val = parseFloat(String(rawVal).replace(/[^\d.-]/g, ''));
    return isNaN(val) ? defaultValue : val;
  };

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

  // Generate model template for users
  const handleDownloadTemplate = () => {
    try {
      const headers = [
        "Date de début",
        "Date de fin",
        "Agrément mobilisé",
        "Contexte et description des actions menées",
        "Raisons",
        "Zone d'action",
        "Appel CO",
        "Intégré BA",
        "Nb prise en charge",
        "Moyens humains engagés",
        "Moyens matériel engagé",
        "Heures bénévolat"
      ];
      const data = [
        headers,
        [
          "2026-01-15 18:00", 
          "2026-01-16 08:00", 
          "A - Mission de Secours Populaire (Alerte)", 
          "Plan Grand Froid : Établissement d'un centre d'hébergement d'urgence de 35 places",
          "Alerte grand froid de niveau orange",
          "Versailles - Gymnase Montbauron",
          "Oui",
          "Oui",
          28,
          "6 équipiers d'urgence d'astreinte",
          "1 VCI, 30 lits de camp, couvertures",
          84
        ],
        [
          "2026-03-12 14:00",
          "2026-03-12 21:00",
          "B - Soutien des Populations (Sinistre)",
          "Soutien aux populations suite à un feu d'entrepôt industriel",
          "Evacuation pavillons voisins menacés par les fumées",
          "Trappes",
          "Oui",
          "Non",
          55,
          "4 équipiers d'urgence sociale",
          "1 véhicule logistique, boissons chaudes, 60 repas",
          28
        ]
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Activités Urgence DTUS 78");
      XLSX.writeFile(workbook, "modele_suivi_urgences_78.xlsx");
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: `Erreur de génération du modèle : ${err?.message || err}`
      });
    }
  };

  const handleLoadSimulation = () => {
    setParsedUrgenceRows(SIMULATED_URGENCE_DATA);
    setFileName("Plan_Soutien_Urgence_Yvelines_2026.xlsx");
    setImportStatus({
      type: 'success',
      message: "Simulation d'Urgence chargée ! 3 évènements majeurs analysés (totalisant 208 heures de bénévolat d'urgence et 97 personnes prises en charge)."
    });
  };

  const handleFileProcess = (file: File) => {
    setFileName(file.name);
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension !== 'xlsx' && fileExtension !== 'xls' && fileExtension !== 'csv') {
      setImportStatus({
        type: 'error',
        message: 'Format non supporté. Veuillez importer un document Excel (.xlsx, .xls) ou CSV (.csv).'
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
          throw new Error("Fichier vide ou illisible.");
        }

        // Normalize headers - removing accents and lowercasing
        const headers = rows[0].map((h: any) => 
          String(h || '').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        );

        // Column lookups Matching:
        const startIdx = headers.findIndex(h => h.includes('debut') || h.includes('depart') || h.includes('commence') || h === 'date');
        const endIdx = headers.findIndex(h => h.includes('fin') || h.includes('arrivee') || h.includes('termine'));
        const agrementIdx = headers.findIndex(h => h.includes('agrement') || h.includes('mobilise') || h.includes('type'));
        const descIdx = headers.findIndex(h => h.includes('contexte') || h.includes('description') || h.includes('actions') || h.includes('menees'));
        const raisonIdx = headers.findIndex(h => h.includes('raison') || h.includes('motif') || h.includes('pourquoi'));
        const zoneIdx = headers.findIndex(h => h.includes('zone') || h.includes('lieu') || h.includes('endroit') || h.includes('secteur') || h.includes('ville'));
        const appelCoIdx = headers.findIndex(h => h.includes('co') || h.includes('appel'));
        const integreBaIdx = headers.findIndex(h => h.includes('ba') || h.includes('integre'));
        const pecIdx = headers.findIndex(h => h.includes('prise') || h.includes('charge') || h.includes('pec') || h.includes('vic') || h.includes('nb'));
        const humainsIdx = headers.findIndex(h => h.includes('humain') || h.includes('secou') || h.includes('pers') || h.includes('agent'));
        const materielIdx = headers.findIndex(h => h.includes('materiel') || h.includes('vehic') || h.includes('outil'));
        const benevolatIdx = headers.findIndex(h => h.includes('heure') || h.includes('benevolat') || h.includes('h_') || h.includes('volontaire'));

        if (startIdx === -1) {
          throw new Error("Colonne 'Date de début' introuvable dans l'en-tête de votre document.");
        }

        const calculatedRows: ParsedUrgenceRow[] = [];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0 || row.every(val => val === undefined || val === null || val === '')) {
            continue;
          }

          const debut = formatExcelCellValue(row[startIdx]) || '2026-01-01';
          const fin = formatExcelCellValue(row[endIdx] !== undefined && row[endIdx] !== null ? row[endIdx] : row[startIdx]) || debut;
          const agrementMobilise = getCellValue(row, agrementIdx, '');
          const contexteDescription = getCellValue(row, descIdx, 'Intervention d\'urgence territoriale');
          const raisons = getCellValue(row, raisonIdx, 'Sollicitation officielle');
          const zoneAction = getCellValue(row, zoneIdx, 'Yvelines (78)');
          const appelCo = getCellValue(row, appelCoIdx, 'Oui');
          const integreBa = getCellValue(row, integreBaIdx, 'Oui');
          
          const nbPriseEnCharge = getCellNum(row, pecIdx, 0);
          const moyensHumains = getCellValue(row, humainsIdx, 'Équipe d\'urgence');
          const moyensMateriel = getCellValue(row, materielIdx, 'Véhicule d\'intervention');
          const heuresBenevolat = getCellNum(row, benevolatIdx, 0);

          // Check duplicate
          const isAlreadyKnown = !!(
            existingUrgenceRows &&
            existingUrgenceRows.some(existing => existing.dateDebut === debut && existing.contexteDescription === contexteDescription)
          );

          calculatedRows.push({
            dateDebut: debut,
            dateFin: fin,
            agrementMobilise,
            contexteDescription,
            raisons,
            zoneAction,
            appelCo,
            integreBa,
            nbPriseEnCharge,
            moyensHumains,
            moyensMateriel,
            heuresBenevolat,
            isAlreadyKnown
          });
        }

        if (calculatedRows.length === 0) {
          throw new Error("Aucune ligne d'activité d'urgence exploitable n'a été trouvée.");
        }

        setParsedUrgenceRows(calculatedRows);
        setImportStatus({
          type: 'success',
          message: `Fichier analysé avec succès ! ${calculatedRows.length} interventions d'urgence identifiées.`
        });
      } catch (err: any) {
        setImportStatus({
          type: 'error',
          message: `Erreur lors du traitement du fichier : ${err?.message || 'Vérifiez la conformité des en-têtes requises.'}`
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

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleReset = () => {
    setParsedUrgenceRows(null);
    setFileName('');
    setImportStatus({ type: null, message: '' });
  };

  const triggerInject = () => {
    if (!parsedUrgenceRows || parsedUrgenceRows.length === 0) return;
    
    // Adjust years if needed
    const adjustedRows = parsedUrgenceRows.map(r => {
      let adjDebut = r.dateDebut;
      let adjFin = r.dateFin;
      if (r.dateDebut && r.dateDebut.match(/^(\d{4})/)) {
        adjDebut = r.dateDebut.replace(/^(\d{4})/, String(integrationYear));
      }
      if (r.dateFin && r.dateFin.match(/^(\d{4})/)) {
        adjFin = r.dateFin.replace(/^(\d{4})/, String(integrationYear));
      }
      return {
        ...r,
        dateDebut: adjDebut,
        dateFin: adjFin
      };
    });

    const activeConfirmed = adjustedRows;
    const computedVolHours = activeConfirmed.reduce((s, r) => s + (r.heuresBenevolat || 0), 0);

    // Deep clone the stats
    const updatedStats: MetierStats[] = JSON.parse(JSON.stringify(currentStats));
    const urgenceObj = updatedStats.find(m => m.id === 'urgence');

    if (urgenceObj) {
      // Aggregate into targeted year historical stats
      const yearStats = urgenceObj.history.find(h => h.year === integrationYear);
      if (yearStats) {
        yearStats.activitiesCount += activeConfirmed.length;
        yearStats.volunteerHours += Math.round(computedVolHours);
      } else {
        urgenceObj.history.push({
          year: integrationYear,
          activitiesCount: activeConfirmed.length,
          volunteerHours: Math.round(computedVolHours)
        });
      }
      // Sort history
      urgenceObj.history.sort((a, b) => a.year - b.year);

      // Refresh breakdown for that integrated year (update the categories representation)
      const newBreakdown = [...urgenceObj.breakdown2026];
      activeConfirmed.slice(0, 3).forEach(r => {
        newBreakdown.push({
          name: `${r.contexteDescription.substring(0, 45)}...`,
          count: 1,
          hours: r.heuresBenevolat
        });
      });
      urgenceObj.breakdown2026 = newBreakdown.slice(0, 6);
    }

    if (onInject) {
      onInject(adjustedRows, fileName);
    }

    onDataImported(updatedStats);
    setShowConfirmModal(false);
    handleReset();
  };

  const grandTotalVolHours = parsedUrgenceRows ? parsedUrgenceRows.reduce((s, r) => s + (r.heuresBenevolat || 0), 0) : 0;
  const grandTotalPec = parsedUrgenceRows ? parsedUrgenceRows.reduce((s, r) => s + (r.nbPriseEnCharge || 0), 0) : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition duration-300">
      {/* Tab Header Detail info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500 fill-current" />
            Loader d'Activité d'Urgence
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Gérez l'historique d'Urgence (Hébergements Grand Froid, Incendies, Maraudes) en important le registre Excel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            En-têtes Modèles (.xlsx)
          </button>
          <button
            type="button"
            onClick={handleLoadSimulation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-250 rounded-md transition cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Simuler Urgence
          </button>
        </div>
      </div>

      {/* Main Drag-drop Zone / Upload area */}
      {!parsedUrgenceRows ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[220px] ${
            dragActive 
              ? 'border-rc-red bg-rc-red/[0.02]' 
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/40 hover:bg-slate-50/80'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleSelectFile}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
          <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-3 mb-4 shadow-2xs">
            <FileSpreadsheet className="w-6 h-6 text-rc-red" />
          </div>
          <p className="text-sm font-bold text-slate-800">
            {dragActive ? "Déposez votre fichier d'Urgence ici" : "Déposez votre document d'activité d'Urgence ici"}
          </p>
          <p className="text-xs text-slate-500 mt-1.5 max-w-md">
            Prise en charge du format Excel (.xlsx / .xls) ou CSV. Vos colonnes seront identifiées d'office à partir de l'en-tête.
          </p>
          <p className="text-[10px] uppercase font-bold text-rc-red tracking-wider mt-4">
            cliquer pour parcourir vos fichiers localement
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Analysis Header summary */}
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-650 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-950">Fichier d'urgence identifié : <span className="font-mono text-xs">{fileName}</span></p>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Prêt pour l'intégration dans l'historique d'Activité DTUS 78.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-250 rounded-md transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Réinitialiser
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-850 rounded-md shadow-2xs transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Valider l'Injection
              </button>
            </div>
          </div>

          {/* Micro consolidated indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Interventions</span>
              <span className="text-lg font-bold text-slate-900 font-mono mt-0.5 block">{parsedUrgenceRows.length} actives</span>
            </div>
            
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bénévolat cumulé</span>
              <span className="text-lg font-bold text-amber-600 font-mono mt-0.5 block">{grandTotalVolHours.toLocaleString('fr-FR')} h</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Prises en charge</span>
              <span className="text-lg font-bold text-indigo-650 font-mono mt-0.5 block">{grandTotalPec.toLocaleString('fr-FR')} vict.</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Année analysée</span>
              <span className="text-lg font-bold text-emerald-700 font-mono mt-0.5 block">{integrationYear}</span>
            </div>
          </div>

          {/* Table list of parsed events */}
          <div className="border border-slate-150 rounded-xl overflow-hidden bg-white">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-150 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-650 uppercase tracking-wider">Aperçu avant fusion de données ({parsedUrgenceRows.length} lignes)</span>
              <span className="text-[10px] text-slate-450 italic">Colonnes traduites automatiquement</span>
            </div>

            <div className="overflow-x-auto max-h-[300px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-150 font-bold">
                    <th className="p-2.5">Date Début / Fin</th>
                    <th className="p-2.5">Agrément / Mission</th>
                    <th className="p-2.5">Contexte & Zone</th>
                    <th className="p-2.5 text-center">Appel CO / BA</th>
                    <th className="p-2.5 text-right">PECs</th>
                    <th className="p-2.5 text-right">Vol. Bénévolat</th>
                    <th className="p-2.5 text-center">État</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedUrgenceRows.map((row, idx) => (
                    <tr key={idx} className={`hover:bg-slate-50/50 transition ${row.isAlreadyKnown ? 'bg-amber-50/20' : ''}`}>
                      <td className="p-2.5 font-mono text-[11px] text-slate-700 space-y-0.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{formatDateToFR(row.dateDebut)}</div>
                        <div className="text-[9px] text-slate-400">au {formatDateToFR(row.dateFin)}</div>
                      </td>
                      <td className="p-2.5 font-medium text-slate-700 max-w-[150px]" title={row.agrementMobilise}>
                        {renderAgrementLabel(row.agrementMobilise)}
                      </td>
                      <td className="p-2.5 text-slate-600 max-w-[250px]">
                        <div className="font-bold text-slate-800 line-clamp-1">{row.contexteDescription}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 shrink-0 text-slate-450" />
                          <span>{row.zoneAction}</span>
                          <span className="mx-1">•</span>
                          <span className="italic truncate">{row.raisons}</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-center font-semibold text-slate-700">
                        <div className="flex justify-center gap-1.5 text-[10px]">
                          <span className={`px-1.5 py-0.5 rounded ${row.appelCo.toLowerCase().includes('oui') ? 'bg-cyan-50 text-cyan-700 border border-cyan-100' : 'bg-slate-100 text-slate-450'}`}>CO: {row.appelCo}</span>
                          <span className={`px-1.5 py-0.5 rounded ${row.integreBa.toLowerCase().includes('oui') ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-slate-100 text-slate-450'}`}>BA: {row.integreBa}</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-800 font-mono">
                        {row.nbPriseEnCharge} vict.
                      </td>
                      <td className="p-2.5 text-right font-bold text-amber-600 font-mono">
                        {row.heuresBenevolat} h
                      </td>
                      <td className="p-2.5 text-center">
                        {row.isAlreadyKnown ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 bg-amber-50 rounded border border-amber-100" title="Cette intervention correspond à un évènement déjà enregistré">
                            Doublon suspecté
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 bg-emerald-50 rounded border border-emerald-100">
                            Nouveau
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Overlay Modal */}
      {showConfirmModal && parsedUrgenceRows && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-50 rounded-full border border-amber-100">
                <Flame className="w-6 h-6 text-amber-500 fill-current" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Confirmation d'injection (Urgence)</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Voulez-vous intégrer ces {parsedUrgenceRows.length} données d'Urgence dans le tableau de bord de la Direction ({integrationYear}) ?
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50/50 rounded-lg space-y-2 border border-amber-100">
              <h5 className="text-[10px] font-bold text-slate-650 uppercase tracking-wider">Détail des volumes :</h5>
              <ul className="text-xs space-y-1 text-slate-700">
                <li className="flex justify-between"><span>Nombre d'événements :</span> <b>+{parsedUrgenceRows.length}</b></li>
                <li className="flex justify-between"><span>Heures de Bénévolat cumulées :</span> <b className="text-amber-600 font-mono">+{grandTotalVolHours} h</b></li>
                <li className="flex justify-between"><span>Bilan de Prise en charge :</span> <b className="text-indigo-650 font-mono">+{grandTotalPec} personnes</b></li>
              </ul>
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="modal-integration-year" className="text-xs font-semibold text-slate-600">Année cible d'injection :</label>
              <select
                id="modal-integration-year"
                value={integrationYear}
                onChange={(e) => setIntegrationYear(parseInt(e.target.value, 10))}
                className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-700 font-medium shrink-0 cursor-pointer"
              >
                <option value={2026}>2026 (Année courante)</option>
                <option value={2025}>2025 (Antérieure)</option>
                <option value={2024}>2024 (Baseline)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={triggerInject}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-md shadow-2xs cursor-pointer"
              >
                Confirmer l'ajout au Bilan {integrationYear}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Référentiel des agréments de sécurité civile */}
      <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-2 mb-2.5">
          <HeartHandshake className="w-4 h-4 text-emerald-600" />
          <h5 className="text-xs font-bold text-slate-800">Référentiel des Agréments de Sécurité Civile</h5>
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

      {/* Information strip banner */}
      <div className="mt-4 p-3 bg-blue-50/60 border border-blue-100 text-[11px] leading-normal text-blue-800 rounded-lg flex items-start gap-2.5">
        <Info className="w-4 h-4 shrink-0 text-blue-550 mt-0.5" />
        <p>
          <b>Consolidation automatique :</b> L'import d'Urgence met à jour instantanément les indicateurs globaux d'activité et d'heures de l'Urgence. Les interventions peuvent également être consultées à volonté dans l'onglet <b>Registre de l'Urgence</b>.
        </p>
      </div>
    </div>
  );
};
