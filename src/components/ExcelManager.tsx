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
  Database, 
  Play, 
  Settings, 
  Columns, 
  Eye, 
  ArrowRight, 
  Check, 
  X, 
  Layers 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { MetierStats } from '../types';
import { SAMPLE_CSV_TEMPLATE_COMPLET, parseCSVData } from '../data';

interface ExcelManagerProps {
  onDataImported: (newStats: MetierStats[]) => void;
  currentStats: MetierStats[];
}

interface LoadedFileInfo {
  fileName: string;
  sheetNames: string[];
  selectedSheet: string;
  columns: string[];
  rawRows: any[][];
  mappings: {
    metierCol: string;
    yearCol: string;
    countCol: string;
    hoursCol: string;
  };
  workbook: XLSX.WorkBook;
}

export const ExcelManager: React.FC<ExcelManagerProps> = ({ onDataImported, currentStats }) => {
  const [dragActive, setDragActive] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });
  
  // Preview stats loaded
  const [parsedPreview, setParsedPreview] = useState<{ metier: string; year: number; count: number; hours: number }[] | null>(null);
  
  // State for the interactive column mapper
  const [loadedFile, setLoadedFile] = useState<LoadedFileInfo | null>(null);
  const [showMappingPanel, setShowMappingPanel] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to auto-fit and download standard template
  const handleDownloadTemplate = () => {
    try {
      const data = [
        ["Métier", "Année", "Nombre d'Activités", "Heures de Bénévolat"],
        ["Secourisme", 2024, 420, 24500],
        ["Secourisme", 2025, 512, 32600],
        ["Secourisme", 2026, 505, 31200],
        ["Urgence", 2024, 0, 0],
        ["Urgence", 2025, 64, 5400],
        ["Urgence", 2026, 90, 8100],
        ["Formation", 2024, 210, 6800],
        ["Formation", 2025, 235, 7900],
        ["Formation", 2026, 290, 10500]
      ];
      
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Données - DTUS 78");
      
      worksheet['!cols'] = [
        { wch: 15 }, // Métier
        { wch: 10 }, // Année
        { wch: 20 }, // Activités
        { wch: 22 }  // Bénévolat
      ];

      XLSX.writeFile(workbook, "croix_rouge_yvelines_template.xlsx");
    } catch (err) {
      // Fallback to CSV
      const blob = new Blob([SAMPLE_CSV_TEMPLATE_COMPLET], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'croix_rouge_yvelines_template.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Helper to auto-detect columns
  const autoDetectMappings = (cols: string[]) => {
    let metierCol = cols[0] || '';
    let yearCol = cols[1] || '';
    let countCol = cols[2] || '';
    let hoursCol = cols[3] || '';

    cols.forEach(col => {
      const lCol = col.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      if (lCol.includes('metier') || lCol.includes('service') || lCol.includes('pole') || lCol.includes('type') || lCol.includes('domaine')) {
        metierCol = col;
      } else if (lCol.includes('annee') || lCol.includes('an') || lCol.includes('year') || lCol.includes('date')) {
        yearCol = col;
      } else if (lCol.includes('activit') || lCol.includes('action') || lCol.includes('nombre') || lCol.includes('count') || lCol.includes('volume') || lCol.includes('total') || lCol.includes('qte')) {
        countCol = col;
      } else if (lCol.includes('heure') || lCol.includes('benevolat') || lCol.includes('volunteer') || lCol.includes('hours') || lCol.includes('h ')) {
        hoursCol = col;
      }
    });

    return { metierCol, yearCol, countCol, hoursCol };
  };

  // Handle parsed workbook
  const handleWorkbook = (workbook: XLSX.WorkBook, fileName: string) => {
    try {
      const sheetNames = workbook.SheetNames;
      if (sheetNames.length === 0) {
        throw new Error("Aucune feuille trouvée dans le fichier.");
      }
      
      const initialSheet = sheetNames[0];
      const worksheet = workbook.Sheets[initialSheet];
      
      // Parse list of rows
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      if (rows.length === 0) {
        throw new Error("Le fichier est vide.");
      }
      
      // Find first non-empty row to determine columns
      let headerRowIndex = 0;
      while (headerRowIndex < rows.length && (!rows[headerRowIndex] || rows[headerRowIndex].length === 0)) {
        headerRowIndex++;
      }
      
      if (headerRowIndex >= rows.length) {
        throw new Error("Aucune ligne d'en-tête trouvée.");
      }
      
      const columns = rows[headerRowIndex].map((col: any) => String(col || '').trim());
      const rawRows = rows.slice(headerRowIndex + 1).filter(r => r && r.length > 0) as any[][];
      
      const detected = autoDetectMappings(columns);
      
      setLoadedFile({
        fileName,
        sheetNames,
        selectedSheet: initialSheet,
        columns,
        rawRows,
        mappings: detected,
        workbook
      });
      
      setShowMappingPanel(true);
      setImportStatus({
        type: null,
        message: ''
      });
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: `Échec de l'analyse : ${err?.message || 'Structure de fichier inconnue ou non supportée'}`
      });
    }
  };

  // Switch tabs/sheets dynamically inside XLSX
  const handleSheetChange = (sheetName: string) => {
    if (!loadedFile) return;
    try {
      const worksheet = loadedFile.workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (rows.length === 0) {
        throw new Error("La feuille sélectionnée est vide.");
      }
      
      let headerRowIndex = 0;
      while (headerRowIndex < rows.length && (!rows[headerRowIndex] || rows[headerRowIndex].length === 0)) {
        headerRowIndex++;
      }
      
      const columns = rows[headerRowIndex].map((col: any) => String(col || '').trim());
      const rawRows = rows.slice(headerRowIndex + 1).filter(r => r && r.length > 0) as any[][];
      const detected = autoDetectMappings(columns);
      
      setLoadedFile({
        ...loadedFile,
        selectedSheet: sheetName,
        columns,
        rawRows,
        mappings: detected
      });
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: `Erreur lors du changement de feuille : ${err.message}`
      });
    }
  };

  // Load the actual mapped files into the current state
  const confirmMappingImport = () => {
    if (!loadedFile) return;
    const { rawRows, columns, mappings } = loadedFile;

    // Find dynamic column indices
    const metierIdx = columns.indexOf(mappings.metierCol);
    const yearIdx = columns.indexOf(mappings.yearCol);
    const countIdx = columns.indexOf(mappings.countCol);
    const hoursIdx = columns.indexOf(mappings.hoursCol);

    const updates: { metier: string; year: number; count: number; hours: number }[] = [];
    const parseErrors: string[] = [];

    rawRows.forEach((row, index) => {
      const rowNum = index + 2; // offset header line
      const rawMetier = String(row[metierIdx] || '').trim();
      
      // Skip empty or purely blank lines
      if (!rawMetier && row.every(val => val === undefined || val === null || val === '')) {
        return;
      }

      const cleanYearStr = String(row[yearIdx] || '').trim().replace(/['"\s]/g, '');
      const cleanCountStr = String(row[countIdx] || '').trim().replace(/['"\s]/g, '').replace(/h/gi, '');
      const cleanHoursStr = String(row[hoursIdx] || '').trim().replace(/['"\s]/g, '').replace(/h/gi, '');

      const year = parseInt(cleanYearStr, 10);
      const count = parseInt(cleanCountStr, 10);
      const hours = parseInt(cleanHoursStr, 10);

      if (isNaN(year) || isNaN(count) || isNaN(hours)) {
        if (rawMetier) {
          parseErrors.push(`Ligne ${rowNum} : Données numériques incorrectes (Année: "${row[yearIdx]}", Activité: "${row[countIdx]}", Heures: "${row[hoursIdx]}")`);
        }
        return;
      }

      updates.push({ metier: rawMetier, year, count, hours });
    });

    if (updates.length === 0) {
      setImportStatus({
        type: 'error',
        message: parseErrors.length > 0 
          ? `Impossible d'importer : \n${parseErrors.slice(0, 2).join('\n')}` 
          : 'Aucune ligne de données valide trouvée avec la configuration actuelle.'
      });
      return;
    }

    // Create copy of original metrics
    const newStats: MetierStats[] = JSON.parse(JSON.stringify(currentStats));

    // Map metier label to standard ID
    const translateMetier = (input: string): string | null => {
      const normalized = input.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      if (normalized.includes('secou')) return 'secourisme';
      if (normalized.includes('urg')) return 'urgence';
      if (normalized.includes('format')) return 'formation';
      return null;
    };

    let matchedRowsCount = 0;
    updates.forEach(up => {
      const targetId = translateMetier(up.metier);
      if (!targetId) return;

      const metierObj = newStats.find(m => m.id === targetId);
      if (metierObj) {
        matchedRowsCount++;
        const yearObj = metierObj.history.find(h => h.year === up.year);
        if (yearObj) {
          yearObj.activitiesCount = up.count;
          yearObj.volunteerHours = up.hours;
        } else {
          metierObj.history.push({
            year: up.year,
            activitiesCount: up.count,
            volunteerHours: up.hours
          });
          metierObj.history.sort((a, b) => a.year - b.year);
        }
      }
    });

    if (matchedRowsCount === 0) {
      setImportStatus({
        type: 'error',
        message: `Aucun métier reconnu ("Secourisme", "Urgence", "Formation"). Vos colonnes métier contiennent des valeurs comme "${updates.slice(0, 3).map(u => u.metier).join(', ')}"`
      });
      return;
    }

    onDataImported(newStats);
    setParsedPreview(updates);
    setImportStatus({
      type: 'success',
      message: `Analyse et intégration réussies ! ${matchedRowsCount} lignes d'activités ont permis de rafraîchir le dashboard avec vos données des Yvelines.`
    });
    setShowMappingPanel(false);
    setLoadedFile(null);

    // Fade preview warning after 8s
    setTimeout(() => {
      setImportStatus({ type: null, message: '' });
    }, 8000);
  };

  // Handle uploaded File
  const handleFile = (file: File) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) return;
          const workbook = XLSX.read(data, { type: 'array' });
          handleWorkbook(workbook, file.name);
        } catch (err: any) {
          setImportStatus({
            type: 'error',
            message: `Erreur de lecture Excel : ${err?.message || 'Fichier protégé ou corrompu.'}`
          });
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (fileExtension === 'csv' || fileExtension === 'txt') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result;
          if (typeof text !== 'string') return;
          const workbook = XLSX.read(text, { type: 'string' });
          handleWorkbook(workbook, file.name);
        } catch (err: any) {
          setImportStatus({
            type: 'error',
            message: `Erreur de lecture CSV : ${err?.message || 'Format incorrect.'}`
          });
        }
      };
      reader.readAsText(file);
    } else {
      setImportStatus({
        type: 'error',
        message: 'Type de fichier non supporté dans le navigateur. Veuillez déposer un fichier Excel (.xlsx, .xls) ou CSV (.csv, .txt).'
      });
    }
  };

  // Drag and drop events
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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Active Simulation trigger for scenario sandboxing
  const handleSimulateLoad = (type: 'fort' | 'baisse') => {
    let simulatedCSV = '';
    if (type === 'fort') {
      simulatedCSV = `Métier,Année,Nombre d'Activités,Heures de Bénévolat
Secourisme,2024,420,24500
Secourisme,2025,512,32600
Secourisme,2026,535,34800
Urgence,2024,0,0
Urgence,2025,64,5400
Urgence,2026,95,9800
Formation,2024,210,6800
Formation,2025,235,7900
Formation,2026,280,10500`;
    } else {
      simulatedCSV = `Métier,Année,Nombre d'Activités,Heures de Bénévolat
Secourisme,2024,420,24500
Secourisme,2025,512,32600
Secourisme,2026,430,22500
Urgence,2024,0,0
Urgence,2025,64,5400
Urgence,2026,50,4900
Formation,2024,210,6800
Formation,2025,235,7900
Formation,2026,200,6900`;
    }
    
    // Parse simulated string with standard excel/csv reader to trigger analyzer too
    try {
      const workbook = XLSX.read(simulatedCSV, { type: 'string' });
      handleWorkbook(workbook, `Simulation_${type === 'fort' ? 'Forte_Activite' : 'Activite_Moderee'}.csv`);
    } catch (e) {
      // fallback to silent parse
      const res = parseCSVData(simulatedCSV);
      if (res.success && res.data) {
        onDataImported(res.data);
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
      
      {/* Box Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
        <div className="p-2.5 bg-rc-red/10 text-rc-red rounded-lg">
          <FileSpreadsheet className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-900">Intégration et Analyseur de fichiers Excel / CSV</h4>
          <p className="text-xs text-slate-500">Intégrez nativement vos classeurs de suivi et vérifiez leur structure de colonnes</p>
        </div>
      </div>

      {/* Main Grid: split between uploads and the current state */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Input or mapping panel */}
        <div className="lg:col-span-7 space-y-5">
          {!showMappingPanel ? (
            <>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Afin de faciliter le dialogue d'activité avec les élus des Yvelines (78), vous pouvez importer directement vos classeurs Excel ou fichiers CSV de suivi. Cet assistant analysera la structure du fichier, identifiera les en-têtes et vous permettra de mapper les colonnes en toute autonomie.
              </p>

              <div className="flex flex-wrap gap-2.5">
                <button
                  id="btn-download-template"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rc-red bg-rc-red/10 hover:bg-rc-red/15 rounded-md transition cursor-pointer border border-rc-red/15"
                >
                  <Download className="w-3.5 h-3.5" />
                  Télécharger le Modèle type (.xlsx)
                </button>
                <button
                  id="btn-select-file"
                  onClick={triggerFileSelect}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition cursor-pointer border border-slate-200"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Parcourir un fichier...
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept=".xlsx,.xls,.csv,.txt"
                  className="hidden"
                />
              </div>

              {/* Drag and Drop Zone Area */}
              <div
                id="excel-drop-zone"
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={`border-2 border-dashed rounded-lg p-9 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-rc-red bg-rc-red/5 scale-[1.01]'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="p-3 bg-rc-red/5 text-rc-red rounded-full">
                    <FileSpreadsheet className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Glissez votre fichier de suivi Excel, XLS ou CSV ici
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-sm mx-auto">
                      L'application lira la structure, affichera les colonnes disponibles et vous proposera de les mapper en quelques secondes.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* INTERACTIVE STRUCTURE ANALYZER & COLUMN MAPPER */
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-5 animate-slideIn">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-4.5 h-4.5 text-rc-red animate-spin" />
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Analyse de Structure : {loadedFile?.fileName}
                    </h5>
                    <p className="text-[10px] text-slate-500">Configurez l'équivalence de vos colonnes de suivi</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowMappingPanel(false);
                    setLoadedFile(null);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded bg-white border border-slate-200 cursor-pointer"
                  title="Annuler"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sheet selector if XLSX has multiple tabs */}
              {loadedFile && loadedFile.sheetNames.length > 1 && (
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Sélecteur d'Onglets (Feuilles Excel décelées) :
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {loadedFile.sheetNames.map((sheet, index) => (
                      <button
                        key={index}
                        onClick={() => handleSheetChange(sheet)}
                        className={`text-xs px-2.5 py-1 rounded border transition ${
                          loadedFile.selectedSheet === sheet
                            ? 'bg-rc-red text-white border-rc-red font-semibold'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {sheet}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Column Selectors fields */}
              {loadedFile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                      <Layers className="w-3 h-3 text-slate-400" /> Métier de la Croix-Rouge
                    </label>
                    <select
                      value={loadedFile.mappings.metierCol}
                      onChange={(e) => setLoadedFile({
                        ...loadedFile,
                        mappings: { ...loadedFile.mappings, metierCol: e.target.value }
                      })}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-rc-red focus:border-rc-red text-slate-800"
                    >
                      <option value="">-- Ignorer ou Positionnel --</option>
                      {loadedFile.columns.map((col, idx) => (
                        <option key={idx} value={col}>{col || `Colonne ${idx + 1}`}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                      <Database className="w-3 h-3 text-slate-400" /> Année d'exercice
                    </label>
                    <select
                      value={loadedFile.mappings.yearCol}
                      onChange={(e) => setLoadedFile({
                        ...loadedFile,
                        mappings: { ...loadedFile.mappings, yearCol: e.target.value }
                      })}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-rc-red focus:border-rc-red text-slate-800"
                    >
                      <option value="">-- Ignorer ou Positionnel --</option>
                      {loadedFile.columns.map((col, idx) => (
                        <option key={idx} value={col}>{col || `Colonne ${idx + 1}`}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                      <Columns className="w-3 h-3 text-slate-400" /> Volume / Nombre d'activités
                    </label>
                    <select
                      value={loadedFile.mappings.countCol}
                      onChange={(e) => setLoadedFile({
                        ...loadedFile,
                        mappings: { ...loadedFile.mappings, countCol: e.target.value }
                      })}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-rc-red focus:border-rc-red text-slate-800"
                    >
                      <option value="">-- Ignorer ou Positionnel --</option>
                      {loadedFile.columns.map((col, idx) => (
                        <option key={idx} value={col}>{col || `Colonne ${idx + 1}`}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                      <Eye className="w-3 h-3 text-slate-400" /> Heures de Bénévolat associées
                    </label>
                    <select
                      value={loadedFile.mappings.hoursCol}
                      onChange={(e) => setLoadedFile({
                        ...loadedFile,
                        mappings: { ...loadedFile.mappings, hoursCol: e.target.value }
                      })}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-rc-red focus:border-rc-red text-slate-800"
                    >
                      <option value="">-- Ignorer ou Positionnel --</option>
                      {loadedFile.columns.map((col, idx) => (
                        <option key={idx} value={col}>{col || `Colonne ${idx + 1}`}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Row Extraction Preview */}
              {loadedFile && (
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Aperçu direct (3 premières lignes extraites) :</span>
                  <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white text-[11px]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                          {loadedFile.columns.map((header, hIdx) => (
                            <th key={hIdx} className="p-2 whitespace-nowrap">{header || `Colonne ${hIdx + 1}`}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {loadedFile.rawRows.slice(0, 3).map((row, rIdx) => (
                          <tr key={rIdx} className="border-b border-slate-100 last:border-none text-slate-600">
                            {loadedFile.columns.map((_, colIdx) => (
                              <td key={colIdx} className="p-2 truncate max-w-[150px]">{String(row[colIdx] === undefined ? '' : row[colIdx])}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons for confirm import */}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowMappingPanel(false);
                    setLoadedFile(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 transition cursor-pointer"
                >
                  Annuler l'analyse
                </button>
                <button
                  type="button"
                  onClick={confirmMappingImport}
                  className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold bg-rc-red hover:bg-[#D7171E] text-white rounded-md transition cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  Valider et Appliquer le Mapping
                </button>
              </div>
            </div>
          )}

          {/* Feedback message overlay */}
          {importStatus.type && (
            <div
              id="import-feedback-box"
              className={`p-4 rounded-lg border flex items-start gap-3 transition-all ${
                importStatus.type === 'success'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                  : 'bg-rose-50 border-rose-100 text-rose-800'
              }`}
            >
              {importStatus.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0 animate-bounce" />
              )}
              <div className="text-xs">
                <p className="font-bold">{importStatus.type === 'success' ? 'Traitement accompli' : 'Alerte d\'intégration'}</p>
                <p className="mt-0.5 opacity-90 whitespace-pre-line leading-relaxed">{importStatus.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: sandbox simulations & last parsing overview */}
        <div className="lg:col-span-5 bg-slate-50 rounded-lg p-5 border border-slate-200 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100">
              <Database className="w-3 h-3" />
              SIMULATEUR DE SCÉNARIOS D'ÉLUS
            </span>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pour modéliser l'interactivité d'un dialogue d'activité devant l'Assemblée sans avoir de fichier XLSX sous la main, chargez un scénario type :
            </p>

            <div className="space-y-2">
              <button
                id="simulate-scenario-strong"
                onClick={() => handleSimulateLoad('fort')}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-white border hover:border-slate-200 bg-slate-150/60 rounded-lg text-xs transition font-medium cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Play className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                  <span>Forte Activité Opérationnelle 2026</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Simuler</span>
              </button>

              <button
                id="simulate-scenario-low"
                onClick={() => handleSimulateLoad('baisse')}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-white border hover:border-slate-200 bg-slate-150/60 rounded-lg text-xs transition font-medium cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Play className="w-3 h-3 text-rose-500 fill-rose-500" />
                  <span>Baisse d'Activité / Consolidé</span>
                </div>
                <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">Simuler</span>
              </button>
            </div>
          </div>

          {/* Raw preview table representing parsed content */}
          {parsedPreview && (
            <div className="mt-5 pt-4 border-t border-slate-200 animate-fadeIn">
              <div className="flex items-center gap-1 mb-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Aperçu des données actives injectées :</p>
              </div>
              <div className="max-h-[140px] overflow-y-auto rounded-md border border-slate-200 bg-white text-[11px] shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                      <th className="p-2">Métier</th>
                      <th className="p-2 text-center">Année</th>
                      <th className="p-2 text-right">Activités</th>
                      <th className="p-2 text-right">Bénévolat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedPreview.slice(0, 4).map((row, index) => (
                      <tr key={index} className="border-b border-slate-100 last:border-none text-slate-600 hover:bg-slate-50/50">
                        <td className="p-2 capitalize font-semibold text-slate-700">{row.metier}</td>
                        <td className="p-2 text-center font-mono">{row.year}</td>
                        <td className="p-2 text-right font-mono font-semibold">{row.count}</td>
                        <td className="p-2 text-right font-mono font-semibold text-rc-red">{row.hours.toLocaleString('fr-FR')}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-[9px] text-slate-400 italic">
                  Aperçu limité aux premières lignes.
                </p>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                  Dashboard à Jour
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
