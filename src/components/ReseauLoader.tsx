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
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Check, 
  Info,
  Flame
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { MetierStats, ParsedReseauRow, formatExcelCellValue } from '../types';

interface ReseauLoaderProps {
  onDataImported: (newStats: MetierStats[]) => void;
  currentStats: MetierStats[];
  parsedReseauRows: ParsedReseauRow[] | null;
  setParsedReseauRows: React.Dispatch<React.SetStateAction<ParsedReseauRow[] | null>>;
  fileName: string;
  setFileName: React.Dispatch<React.SetStateAction<string>>;
  importStatus: { type: 'success' | 'error' | null; message: string };
  setImportStatus: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error' | null; message: string }>>;
  onInject?: (rows: ParsedReseauRow[], file: string) => void;
  existingReseauRows?: ParsedReseauRow[] | null;
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

export const ReseauLoader: React.FC<ReseauLoaderProps> = ({
  onDataImported,
  currentStats,
  parsedReseauRows,
  setParsedReseauRows,
  fileName,
  setFileName,
  importStatus,
  setImportStatus,
  onInject,
  existingReseauRows
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [integrationYear, setIntegrationYear] = useState<number>(2026);

  // Automatically detect default integration year from SDIS guard dates if possible
  const detectedYear = React.useMemo(() => {
    if (parsedReseauRows && parsedReseauRows.length > 0) {
      for (const r of parsedReseauRows) {
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
  }, [parsedReseauRows]);

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
      const utc_days = Math.floor(val - 25569);
      const date_info = new Date(utc_days * 86400 * 1050); // slight offset adjustment for xlsx day calculations
      // Let's use standard xlsx date creation
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

  // Build a sample SDIS Guard Excel file
  const handleDownloadTemplate = () => {
    try {
      const headers = ["Date", "Durée de garde"];
      const data = [
        headers,
        ["2026-01-03", 12],
        ["2026-01-10", 24],
        ["2026-02-14", 12],
        ["2026-03-21", 12],
        ["2026-04-04", 24]
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Gardes SDIS Versailles - Réseau");
      XLSX.writeFile(workbook, "modele_gardes_sdis_78.xlsx");
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: `Erreur de génération du modèle : ${err?.message || err}`
      });
    }
  };

  const handleLoadSimulation = () => {
    setParsedReseauRows(SIMULATED_SDIS_DATA);
    setFileName("Gardes_SDIS_Versailles_S1_2026.xlsx");
    setImportStatus({
      type: 'success',
      message: "Simulation chargée ! 8 gardes SDIS chez les pompiers de Versailles importées de manière conforme (680 heures de bénévolat générées)."
    });
  };

  // Process uploaded SDIS file
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

        // Normalize headers
        const headers = rows[0].map((h: any) => 
          String(h || '').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        );

        const dateIdx = headers.findIndex(h => h === 'date' || h.includes('jour') || h.includes('debut') || h.includes('le'));
        const dureeIdx = headers.findIndex(h => h.includes('duree') || h.includes('heure') || h.includes('garde') || h.includes('temps'));

        if (dateIdx === -1 || dureeIdx === -1) {
          throw new Error("Structure non conforme. Les colonnes requises sont 'Date' et 'Durée de garde'.");
        }

        const calculatedRows: ParsedReseauRow[] = [];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0 || row.every(val => val === undefined || val === null || val === '')) {
            continue;
          }

          const date = formatExcelCellValue(row[dateIdx]) || '2026-01';
          const duree = getCellNum(row, dureeIdx, 0);

          if (duree <= 0) continue; // Skip lines with zero durations

          // Rule: 1 garde engage 4 secouristes
          const heuresBenevolat = duree * CONSTANT_SECOURISTES_PAR_GARDE;

          // Check if already known in database/registry
          const isAlreadyKnown = !!(
            existingReseauRows &&
            existingReseauRows.some(existing => existing.date === date)
          );

          calculatedRows.push({
            date,
            duree,
            secouristesEngages: CONSTANT_SECOURISTES_PAR_GARDE,
            heuresBenevolat,
            isAlreadyKnown
          });
        }

        if (calculatedRows.length === 0) {
          throw new Error("Aucune ligne de garde valide trouvée ou toutes les durées sont égales à zéro.");
        }

        setParsedReseauRows(calculatedRows);
        setImportStatus({
          type: 'success',
          message: `Fichier analysé avec succès ! ${calculatedRows.length} lignes de gardes identifiées.`
        });
      } catch (err: any) {
        setImportStatus({
          type: 'error',
          message: `Erreur lors de la lecture : ${err?.message || 'Veuillez vérifier les en-têtes requises.'}`
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
    setParsedReseauRows(null);
    setFileName('');
    setImportStatus({ type: null, message: '' });
  };

  // Accumulate gardes SDIS into general Secourisme metrics
  const handleInjectReseau = () => {
    if (!parsedReseauRows) return;
    setShowConfirmModal(true);
  };

  const performActualReseauInjection = () => {
    if (!parsedReseauRows) return;

    // Adjust years in dates of parsedReseauRows to match selected integrationYear
    const adjustedRows = parsedReseauRows.map(r => {
      let adjDate = r.date;
      if (r.date && r.date.match(/^(\d{4})/)) {
        adjDate = r.date.replace(/^(\d{4})/, String(integrationYear));
      }
      return {
        ...r,
        date: adjDate
      };
    });

    const countOfGuards = adjustedRows.length;
    const computedVolHours = adjustedRows.reduce((s, r) => s + r.heuresBenevolat, 0);

    if (onInject) {
      onInject(adjustedRows, fileName);
    } else {
      const updatedStats: MetierStats[] = JSON.parse(JSON.stringify(currentStats));
      const secourismeObj = updatedStats.find(m => m.id === 'secourisme');

      if (secourismeObj) {
        const yearStats = secourismeObj.history.find(h => h.year === integrationYear);
        
        if (yearStats) {
          yearStats.activitiesCount += countOfGuards;
          yearStats.volunteerHours += computedVolHours;
        } else {
          secourismeObj.history.push({
            year: integrationYear,
            activitiesCount: countOfGuards,
            volunteerHours: computedVolHours
          });
          secourismeObj.history.sort((a, b) => a.year - b.year);
        }

        // Add as dynamic breakdown entry
        if (integrationYear === 2026) {
          const existingBreakdown = secourismeObj.breakdown2026.filter(b => !b.name.includes('Garde SDIS Versailles'));
          
          const newBreakdownEntry = {
            name: `Réseau : Gardes SDIS Versailles`,
            count: countOfGuards,
            hours: computedVolHours
          };

          secourismeObj.breakdown2026 = [newBreakdownEntry, ...existingBreakdown].slice(0, 6);
        }
      }

      onDataImported(updatedStats);
    }

    setParsedReseauRows(null);
    setFileName('');
    setImportStatus({
      type: 'success',
      message: `Injection réussie ! Elles ont été injectées dans le tableau de bord Secourisme ${integrationYear}. Retrouvez-les à tout moment dans l'onglet 'Gardes SDIS' ou via le sélecteur d'année.`
    });
  };

  const totalGuardsCount = parsedReseauRows ? parsedReseauRows.length : 0;
  const grandTotalDuree = parsedReseauRows ? parsedReseauRows.reduce((s, r) => s + r.duree, 0) : 0;
  const grandTotalVolHours = parsedReseauRows ? parsedReseauRows.reduce((s, r) => s + r.heuresBenevolat, 0) : 0;

  return (
    <div id="reseau-loader-container" className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-slideIn">
            <div className="bg-emerald-600 text-white p-4 flex items-center gap-2.5 font-bold">
              <Check className="w-5 h-5" />
              <span>Confirmer l'intégration (Gardes SDIS)</span>
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
                  <span className="text-slate-500">Nombre de gardes :</span>
                  <span className="font-bold text-slate-800">{totalGuardsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Heures de bénévolat :</span>
                  <span className="font-bold text-emerald-700">{grandTotalVolHours.toLocaleString('fr-FR')} h</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                Après intégration, la liste de travail ci-dessous sera vidée. Les données resteront accessibles et modifiables en cliquant sur le bouton "Gardes SDIS" en haut de la page.
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 border-t border-slate-150 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-350 text-slate-700 rounded hover:bg-slate-50 transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  performActualReseauInjection();
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs transition cursor-pointer"
              >
                Confirmer l'intégration
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-700 rounded-lg">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Module Opérationnel : Gardes SDIS (Réseau)</h4>
            <p className="text-xs text-slate-500">Planning et mobilisation hebdomadaire auprès des Pompiers de Versailles</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadTemplate}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-750 bg-emerald-50 hover:bg-emerald-100 rounded-md transition cursor-pointer border border-emerald-200"
          >
            <Download className="w-3.5 h-3.5" />
            Télécharger le modèle SDIS (.xlsx)
          </button>
        </div>
      </div>

      {!parsedReseauRows ? (
        /* DROP ZONE */
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50/50 border border-emerald-100/60 rounded-lg">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
              <div className="text-[11px] text-emerald-950 leading-relaxed">
                <p className="font-bold">Spécificités réglementaires d'importation :</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5 ml-1 text-slate-650">
                  <li><b>Format d'en-tête attendu :</b> Une colonne <code className="bg-white px-1 py-0.2 rounded border border-slate-200 font-mono font-bold">Date</code> et une colonne <code className="bg-white px-1 py-0.2 rounded border border-slate-200 font-mono font-bold">Durée de garde</code> (ex: 12 ou 24 en heures).</li>
                  <li><b>Multiplicateur Bénévolat :</b> Conformément aux accords SDIS, <span className="font-bold text-slate-900">chaque garde engage obligatoirement 2 secouristes</span>. Le cumul d'heures calculé sera égal à : <b>Durée de garde x 2</b>.</li>
                </ul>
              </div>
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
                ? 'border-emerald-500 bg-emerald-500/5 scale-[1.01]'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-emerald-500/5 text-emerald-600 rounded-full">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 animate-pulse">
                  Déposez ici le fichier des gardes pompiers (.xlsx, .xls ou .csv)
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Ou cliquez pour parcourir vos fichiers
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

          <div className="flex justify-center pt-1">
            <button
              onClick={handleLoadSimulation}
              type="button"
              className="px-5 py-2.5 text-xs font-bold text-white bg-slate-850 hover:bg-slate-755 rounded-lg cursor-pointer transition shadow-2xs"
            >
              Simuler l'injection de gardes SDIS Versailles (Année 2026)
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
        <div className="space-y-6">
          
          {/* File summary bar with Year Selector */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-600" />
                <span className="text-xs font-bold text-slate-855 truncate max-w-[200px]" title={fileName}>{fileName}</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-150 font-bold uppercase font-mono shrink-0">Contrat SDIS 78</span>
              </div>
              <span className="hidden sm:inline text-slate-300">|</span>
              <div className="flex items-center gap-2">
                <label htmlFor="integration-year-reseau-select" className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Année d'intégration :</label>
                <select
                  id="integration-year-reseau-select"
                  value={integrationYear}
                  onChange={(e) => setIntegrationYear(parseInt(e.target.value, 10))}
                  className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
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
                className="flex px-3 py-2 items-center justify-center text-xs font-semibold bg-white text-slate-655 border border-slate-300 rounded hover:bg-slate-100 transition cursor-pointer font-sans"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Vider
              </button>
              
              <button
                onClick={handleInjectReseau}
                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Injecter cumulativement dans Secourisme {integrationYear}
              </button>
            </div>
          </div>

          {/* Micro consolidated grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Gardes comptées */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 relative overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Nombre de gardes de réseau</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-slate-900 font-mono">{totalGuardsCount}</span>
                <span className="text-xs font-bold text-slate-500">gardes</span>
              </div>
              <p className="text-[9px] text-slate-500 mt-1">
                Durées cumulées au tableau de bord SDIS : {grandTotalDuree} h
              </p>
              <div className="absolute right-3 top-3.5 text-slate-200">
                <Calendar className="w-10 h-10 stroke-1" />
              </div>
            </div>

            {/* Secouristes par garde (Règle fixe) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 relative overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Taille de l'équipage</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-slate-900 font-mono">{CONSTANT_SECOURISTES_PAR_GARDE}</span>
                <span className="text-xs font-bold text-slate-550">équipiers / garde</span>
              </div>
              <p className="text-[9px] text-slate-550 mt-1">
                Convention standard SDIS Versailles - {CONSTANT_SECOURISTES_PAR_GARDE} intervenants.
              </p>
              <div className="absolute right-3 top-3.5 text-slate-200">
                <Users className="w-10 h-10 stroke-1" />
              </div>
            </div>

            {/* Volume d'heures de bénévolat consolidé */}
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 relative overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Volume Bénévolat Réseau</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-emerald-800 font-mono">+{grandTotalVolHours.toLocaleString('fr-FR')}</span>
                <span className="text-xs font-bold text-emerald-800">h</span>
              </div>
              <p className="text-[9px] text-emerald-650 mt-1">
                Converti de : {grandTotalDuree} h x {CONSTANT_SECOURISTES_PAR_GARDE} secouristes.
              </p>
              <div className="absolute right-3 top-3.5 text-emerald-100">
                <Clock className="w-10 h-10 stroke-1" />
              </div>
            </div>

          </div>

          {/* List of guard dates */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-tight">Liste des Gardes Rapprochées (SDIS Versailles)</h5>
            
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                    <th className="p-3">Numéro / Date de Garde</th>
                    <th className="p-3 text-center">Durée (h)</th>
                    <th className="p-3 text-center">Equipage requis</th>
                    <th className="p-3 text-right">Bénévolat Valorisé (h)</th>
                    <th className="p-3 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedReseauRows.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-100 last:border-none hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-semibold text-slate-900 font-mono flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded leading-none">#{idx + 1}</span>
                        <span>{formatDateToFR(row.date)}</span>
                        {row.isAlreadyKnown && (
                          <span 
                            className="inline-flex items-center text-[8px] font-extrabold uppercase text-blue-700 bg-blue-50 border border-blue-200 px-1 py-0.25 rounded-md shrink-0 cursor-help font-sans"
                            title="Garde déjà connue en base: sera mise à jour au lieu d'être dupliquée."
                          >
                            Mise à jour
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {row.duree} h
                      </td>
                      <td className="p-3 text-center font-mono text-slate-600">
                        {row.secouristesEngages} secouristes
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700">
                        {row.heuresBenevolat} h
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-block text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150">
                          Validé SDIS
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Prompt banner to integrate */}
          {importStatus.type === 'success' && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">Calculs complémentaires appliqués (x4)</p>
                <p className="text-xs mt-0.5 leading-relaxed">{importStatus.message}</p>
                <button
                  onClick={handleInjectReseau}
                  className="mt-2 text-xs font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-md border border-emerald-250 cursor-pointer hover:shadow-2xs transition inline-flex items-center gap-1"
                >
                  Intégrer les données dans Secourisme →
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
