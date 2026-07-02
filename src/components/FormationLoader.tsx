/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Trash2, 
  Grid, 
  Play, 
  Download, 
  GraduationCap, 
  ArrowRight,
  Calculator,
  Award,
  BookOpen
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { MetierStats, ParsedFormationPublicRow } from '../types';

interface FormationLoaderProps {
  onDataImported: (newStats: MetierStats[]) => void;
  currentStats: MetierStats[];
  parsedFormationRows: ParsedFormationPublicRow[] | null;
  setParsedFormationRows: React.Dispatch<React.SetStateAction<ParsedFormationPublicRow[] | null>>;
  fileName: string;
  setFileName: React.Dispatch<React.SetStateAction<string>>;
  importStatus: { type: 'success' | 'error' | null; message: string };
  setImportStatus: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error' | null; message: string }>>;
  onInject?: (rows: ParsedFormationPublicRow[], file: string) => void;
  existingFormationRows?: ParsedFormationPublicRow[] | null;
}

const SIMULATED_FORMATION_DATA: ParsedFormationPublicRow[] = [
  {
    ul: "78 - Chevreuse",
    year: 2025,
    epscSessions: 12, epscStagiaires: 57, epscHeures: 153,
    pscSessions: 18, pscStagiaires: 101, pscHeures: 162,
    ipsenSessions: 14, ipsenStagiaires: 94, ipsenHeures: 189,
    gqsSessions: 3, gqsStagiaires: 19, gqsHeures: 53,
    recyclageSessions: 2, recyclageStagiaires: 16, recyclageHeures: 23
  },
  {
    ul: "78 - Saint Quentin en Yvelines",
    year: 2025,
    epscSessions: 11, epscStagiaires: 94, epscHeures: 143,
    pscSessions: 0, pscStagiaires: 0, pscHeures: 0,
    ipsenSessions: 3, ipsenStagiaires: 32, ipsenHeures: 25.5,
    gqsSessions: 0, gqsStagiaires: 0, gqsHeures: 0,
    recyclageSessions: 0, recyclageStagiaires: 0, recyclageHeures: 0
  },
  {
    ul: "78 - Les Mureaux",
    year: 2025,
    epscSessions: 8, epscStagiaires: 69, epscHeures: 107,
    pscSessions: 0, pscStagiaires: 0, pscHeures: 0,
    ipsenSessions: 0, ipsenStagiaires: 0, ipsenHeures: 0,
    gqsSessions: 0, gqsStagiaires: 0, gqsHeures: 0,
    recyclageSessions: 0, recyclageStagiaires: 0, recyclageHeures: 0
  },
  {
    ul: "78 - Poissy",
    year: 2025,
    epscSessions: 9, epscStagiaires: 90, epscHeures: 121.5,
    pscSessions: 0, pscStagiaires: 0, pscHeures: 0,
    ipsenSessions: 5, ipsenStagiaires: 44, ipsenHeures: 67.5,
    gqsSessions: 0, gqsStagiaires: 0, gqsHeures: 0,
    recyclageSessions: 0, recyclageStagiaires: 0, recyclageHeures: 0
  },
  {
    ul: "78 - Sartrouville",
    year: 2025,
    epscSessions: 6, epscStagiaires: 55, epscHeures: 84,
    pscSessions: 1, pscStagiaires: 8, pscHeures: 9,
    ipsenSessions: 4, ipsenStagiaires: 33, ipsenHeures: 52,
    gqsSessions: 0, gqsStagiaires: 0, gqsHeures: 0,
    recyclageSessions: 0, recyclageStagiaires: 0, recyclageHeures: 0
  },
  {
    ul: "78 - Versailles Grand Parc Ouest",
    year: 2025,
    epscSessions: 13, epscStagiaires: 132, epscHeures: 154,
    pscSessions: 8, pscStagiaires: 68, pscHeures: 68,
    ipsenSessions: 17, ipsenStagiaires: 166, ipsenHeures: 159,
    gqsSessions: 11, gqsStagiaires: 101, gqsHeures: 209,
    recyclageSessions: 0, recyclageStagiaires: 0, recyclageHeures: 0
  },
  {
    ul: "78 - Cœur de Mauldre",
    year: 2025,
    epscSessions: 0, epscStagiaires: 0, epscHeures: 0,
    pscSessions: 5, pscStagiaires: 55, pscHeures: 42,
    ipsenSessions: 0, ipsenStagiaires: 0, ipsenHeures: 0,
    gqsSessions: 0, gqsStagiaires: 0, gqsHeures: 0,
    recyclageSessions: 0, recyclageStagiaires: 0, recyclageHeures: 0
  },
  {
    ul: "78 - Boucle de Seine Sud",
    year: 2025,
    epscSessions: 0, epscStagiaires: 0, epscHeures: 0,
    pscSessions: 7, pscStagiaires: 73, pscHeures: 59.5,
    ipsenSessions: 0, ipsenStagiaires: 0, ipsenHeures: 0,
    gqsSessions: 1, gqsStagiaires: 1, gqsHeures: 19,
    recyclageSessions: 0, recyclageStagiaires: 0, recyclageHeures: 0
  },
  {
    ul: "78 - Viroflay-Vélizy",
    year: 2025,
    epscSessions: 0, epscStagiaires: 0, epscHeures: 0,
    pscSessions: 3, pscStagiaires: 27, pscHeures: 28,
    ipsenSessions: 0, ipsenStagiaires: 0, ipsenHeures: 0,
    gqsSessions: 0, gqsStagiaires: 0, gqsHeures: 0,
    recyclageSessions: 0, recyclageStagiaires: 0, recyclageHeures: 0
  },
  {
    ul: "78 - Saint Germain en Laye",
    year: 2025,
    epscSessions: 5, epscStagiaires: 42, epscHeures: 62,
    pscSessions: 0, pscStagiaires: 0, pscHeures: 0,
    ipsenSessions: 0, ipsenStagiaires: 0, ipsenHeures: 0,
    gqsSessions: 0, gqsStagiaires: 0, gqsHeures: 0,
    recyclageSessions: 0, recyclageStagiaires: 0, recyclageHeures: 0
  },
  {
    ul: "78 - La Celle-Saint-Cloud",
    year: 2025,
    epscSessions: 1, epscStagiaires: 10, epscHeures: 13.5,
    pscSessions: 0, pscStagiaires: 0, pscHeures: 0,
    ipsenSessions: 0, ipsenStagiaires: 0, ipsenHeures: 0,
    gqsSessions: 0, gqsStagiaires: 0, gqsHeures: 0,
    recyclageSessions: 0, recyclageStagiaires: 0, recyclageHeures: 0
  }
];

export const FormationLoader: React.FC<FormationLoaderProps> = ({
  onDataImported,
  currentStats,
  parsedFormationRows,
  setParsedFormationRows,
  fileName,
  setFileName,
  importStatus,
  setImportStatus,
  onInject,
  existingFormationRows
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetYear, setTargetYear] = useState<number>(2025);

  const totalLoadedSessions = React.useMemo(() => {
    if (!parsedFormationRows) return 0;
    return parsedFormationRows.reduce((acc, curr) => 
      acc + curr.epscSessions + curr.pscSessions + curr.ipsenSessions + curr.gqsSessions + curr.recyclageSessions, 0
    );
  }, [parsedFormationRows]);

  const totalLoadedStagiaires = React.useMemo(() => {
    if (!parsedFormationRows) return 0;
    return parsedFormationRows.reduce((acc, curr) => 
      acc + curr.epscStagiaires + curr.pscStagiaires + curr.ipsenStagiaires + curr.gqsStagiaires + curr.recyclageStagiaires, 0
    );
  }, [parsedFormationRows]);

  const totalLoadedHeures = React.useMemo(() => {
    if (!parsedFormationRows) return 0;
    return parsedFormationRows.reduce((acc, curr) => 
      acc + curr.epscHeures + curr.pscHeures + curr.ipsenHeures + curr.gqsHeures + curr.recyclageHeures, 0
    );
  }, [parsedFormationRows]);

  // Safe numerical cells parser
  const parseNum = (val: any): number => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return val;
    const clean = String(val).replace(',', '.').replace(/\s/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const handleDownloadTemplate = () => {
    try {
      const headers1 = ["2025", "ePSC - elearning et présentiel", "", "", "PSC", "", "", "IPSEN", "", "", "GQS", "", "", "recyclage PSC", "", ""];
      const headers2 = ["Structure", "Sessions", "Stagiaires", "Heures", "Sessions", "Stagiaires", "Heures", "Sessions", "Stagiaires", "Heures", "Sessions", "Stagiaires", "Heures", "Sessions", "Stagiaires", "Heures"];
      
      const rows = [
        headers1,
        headers2,
        ["78 - Chevreuse", 12, 57, 153, 18, 101, 162, 14, 94, 189, 3, 19, 53, 2, 16, 23],
        ["78 - Saint Quentin en Yvelines", 11, 94, 143, 0, 0, 0, 3, 32, 25.5, 0, 0, 0, 0, 0, 0],
        ["78 - Les Mureaux", 8, 69, 107, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ["78 - Poissy", 9, 90, 121.5, 0, 0, 0, 5, 44, 67.5, 0, 0, 0, 0, 0, 0],
        ["78 - Sartrouville", 6, 55, 84, 1, 8, 9, 4, 33, 52, 0, 0, 0, 0, 0, 0],
        ["78 - Versailles Grand Parc Ouest", 13, 132, 154, 8, 68, 68, 17, 166, 159, 11, 101, 209, 0, 0, 0],
        ["78 - Cœur de Mauldre", 0, 0, 0, 5, 55, 42, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ["78 - Boucle de Seine Sud", 0, 0, 0, 7, 73, 59.5, 0, 0, 0, 1, 1, 19, 0, 0, 0],
        ["78 - Viroflay-Vélizy", 0, 0, 0, 3, 27, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ["78 - Saint Germain en Laye", 5, 42, 62, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ["78 - La Celle-Saint-Cloud", 1, 10, 13.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Formations_Structures_Locales");
      
      XLSX.writeFile(workbook, "modele_formations_grand_public.xlsx");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création du modèle Excel.");
    }
  };

  const handleSimulate = () => {
    setParsedFormationRows(SIMULATED_FORMATION_DATA);
    setFileName("Formations_Grand_Public_UL_2025.xlsx");
    setTargetYear(2025);
    setImportStatus({
      type: 'success',
      message: "Simulation active : 11 Unités Locales chargées avec les volumes officiels du PDF !"
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'xlsx' && fileExtension !== 'xls' && fileExtension !== 'csv') {
      setImportStatus({
        type: 'error',
        message: 'Format de fichier non supporté. Veuillez déposer un document Excel (.xlsx, .xls) ou CSV.'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return;
        const workbook = XLSX.read(data, { type: fileExtension === 'csv' ? 'string' : 'array' });
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        if (rawRows.length < 2) {
          throw new Error("L'onglet est vide ou ne comporte pas assez de lignes.");
        }

        // Try to scan for year in row 0
        let detectedYear = 2025;
        for (let rIndex = 0; rIndex < Math.min(3, rawRows.length); rIndex++) {
          const rowVals = rawRows[rIndex];
          if (rowVals) {
            for (const cellVal of rowVals) {
              const parsedCell = parseInt(cellVal, 10);
              if (!isNaN(parsedCell) && parsedCell >= 2024 && parsedCell <= 2030) {
                detectedYear = parsedCell;
                break;
              }
            }
          }
        }
        setTargetYear(detectedYear);

        const loadedRows: ParsedFormationPublicRow[] = [];
        
        // Scan for rows starting with "78" or looking like UL rows
        for (let idx = 0; idx < rawRows.length; idx++) {
          const row = rawRows[idx];
          if (!row || row.length === 0) continue;
          
          const maybeUlName = String(row[0] || '').trim();
          if (maybeUlName.startsWith("78") || maybeUlName.includes("Chevreuse") || maybeUlName.includes("Saint Quentin") || maybeUlName.includes("Mureaux")) {
            // This is a data row!
            loadedRows.push({
              ul: maybeUlName,
              year: detectedYear,
              epscSessions: parseNum(row[1]),
              epscStagiaires: parseNum(row[2]),
              epscHeures: parseNum(row[3]),
              pscSessions: parseNum(row[4]),
              pscStagiaires: parseNum(row[5]),
              pscHeures: parseNum(row[6]),
              ipsenSessions: parseNum(row[7]),
              ipsenStagiaires: parseNum(row[8]),
              ipsenHeures: parseNum(row[9]),
              gqsSessions: parseNum(row[10]),
              gqsStagiaires: parseNum(row[11]),
              gqsHeures: parseNum(row[12]),
              recyclageSessions: parseNum(row[13]),
              recyclageStagiaires: parseNum(row[14]),
              recyclageHeures: parseNum(row[15]),
              isAlreadyKnown: existingFormationRows?.some(existing => existing.ul === maybeUlName && existing.year === detectedYear)
            });
          }
        }

        if (loadedRows.length === 0) {
          throw new Error("Aucune ligne de structure éligible (ex: commençant par '78') n'a été détectée.");
        }

        setFileName(file.name);
        setParsedFormationRows(loadedRows);
        setImportStatus({
          type: 'success',
          message: `Fichier analysé : ${loadedRows.length} structures repérées pour l'année ${detectedYear} !`
        });

      } catch (err: any) {
        setImportStatus({
          type: 'error',
          message: `Erreur d'analyse : ${err.message || "Veuillez vérifier l'en-tête du tableau."}`
        });
      }
    };

    if (fileExtension === 'csv') {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleReset = () => {
    setParsedFormationRows(null);
    setFileName('');
    setImportStatus({ type: null, message: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTriggerInject = () => {
    if (!parsedFormationRows || parsedFormationRows.length === 0) return;
    setShowConfirmModal(true);
  };

  const triggerInject = () => {
    if (!parsedFormationRows || parsedFormationRows.length === 0) return;
    
    // Adjust years in all rows before injecting
    const adjustedRows = parsedFormationRows.map(r => ({
      ...r,
      year: targetYear
    }));

    if (onInject) {
      onInject(adjustedRows, fileName);
    }

    setShowConfirmModal(false);
    handleReset();
  };

  return (
    <div id="formation-loader-container" className="space-y-6">
      {/* Introduction */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-50 border border-blue-150 text-blue-700 rounded-lg">
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-850">Chargement des Formations Grand Public</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Importez les bilans des formations portées par les structures locales (Unités Locales) des Yvelines. 
              Cet outil intègre les sessions dispensées pour chaque formation éligible : <b>ePSC</b>, <b>PSC</b>, <b>IPSEN</b>, <b>GQS</b> et <b>recyclage PSC</b>.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition font-medium cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            Télécharger le Modèle type (.xlsx)
          </button>
          <button
            type="button"
            onClick={handleSimulate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition font-medium cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-emerald-600" />
            Simuler les données du PDF ({targetYear || 2025})
          </button>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div
        id="formation-drag-drop-zone"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 py-10 transition text-center cursor-pointer flex flex-col items-center justify-center space-y-3 ${
          dragActive
            ? 'border-blue-600 bg-blue-50/50'
            : fileName
              ? 'border-emerald-500 bg-emerald-50/10'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/40 hover:bg-slate-50/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
        />

        {!fileName ? (
          <>
            <div className="p-3 bg-white border border-slate-200 shadow-3xs rounded-full">
              <Upload className="w-6 h-6 text-slate-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800">
                Déposez votre fichier de formation (.xlsx, .xls ou .csv)
              </p>
              <p className="text-xs text-slate-450">
                ou cliquez pour parcourir vos dossiers locaux
              </p>
            </div>
            <div className="text-[10.5px] text-slate-400 max-w-md mx-auto leading-relaxed">
              Le tableau doit correspondre à la structure à colonnes multiples avec une ligne par Unité Locale des Yvelines.
            </div>
          </>
        ) : (
          <>
            <div className="p-3 bg-white border border-emerald-200 shadow-3xs rounded-full text-emerald-600">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-slate-850 truncate max-w-sm">
                Fichier : {fileName}
              </p>
              <p className="text-xs text-slate-500 italic">
                Année détectée : {targetYear}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="mt-2 inline-flex items-center gap-1 px-2 py-1 text-xs text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Retirer le fichier
            </button>
          </>
        )}
      </div>

      {/* Validation feed back */}
      {importStatus.message && (
        <div className={`p-4 border rounded-xl flex items-start gap-3 ${
          importStatus.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-850' 
            : 'bg-rose-50 border-rose-200 text-rose-850'
        }`}>
          {importStatus.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs space-y-1.5 w-full">
            <h5 className="font-bold">{importStatus.type === 'success' ? 'Validation Réussie' : 'Erreur d\'Intégration'}</h5>
            <p className="leading-relaxed">{importStatus.message}</p>
            
            {importStatus.type === 'success' && parsedFormationRows && parsedFormationRows.length > 0 && (
              <div className="pt-2 border-t border-emerald-200 grid grid-cols-3 gap-2.5 text-[11px] font-semibold text-emerald-900 mt-2">
                <div className="bg-emerald-100/50 p-2 rounded border border-emerald-200/40 text-center">
                  <div className="text-[10px] uppercase opacity-75 font-bold mb-0.5">Sessions totales</div>
                  <div className="text-sm font-black">{totalLoadedSessions}</div>
                </div>
                <div className="bg-emerald-100/50 p-2 rounded border border-emerald-200/40 text-center">
                  <div className="text-[10px] uppercase opacity-75 font-bold mb-0.5">Stagiaires formés</div>
                  <div className="text-sm font-black">{totalLoadedStagiaires.toLocaleString()}</div>
                </div>
                <div className="bg-emerald-100/50 p-2 rounded border border-emerald-200/40 text-center">
                  <div className="text-[10px] uppercase opacity-75 font-bold mb-0.5">Heures cumulées</div>
                  <div className="text-sm font-black">{totalLoadedHeures.toLocaleString()} h</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Draft table preview */}
      {parsedFormationRows && parsedFormationRows.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid className="w-4 h-4 text-slate-500" />
              <h5 className="text-xs font-bold text-slate-800">
                Aperçu des Données à Importer ({parsedFormationRows.length} structures locales)
              </h5>
            </div>
            <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
              Année : {targetYear}
            </span>
          </div>

          <div className="overflow-x-auto max-h-[350px]">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-2.5 pl-4 sticky left-0 bg-slate-100 z-10 border-r border-slate-200">Localisation</th>
                  <th className="p-2.5 text-center bg-blue-50/40 border-r border-slate-200" colSpan={3}>ePSC (eLearning)</th>
                  <th className="p-2.5 text-center bg-indigo-50/40 border-r border-slate-200" colSpan={3}>PSC1 (Présentiel)</th>
                  <th className="p-2.5 text-center bg-purple-50/40 border-r border-slate-200" colSpan={3}>IPS & IPSEN</th>
                  <th className="p-2.5 text-center bg-amber-50/40 border-r border-slate-200" colSpan={3}>GQS</th>
                  <th className="p-2.5 text-center bg-emerald-50/40" colSpan={3}>Recyclage PSC</th>
                </tr>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[9px]">
                  <th className="p-2 pl-4 sticky left-0 bg-slate-100 z-10 border-r border-slate-200">Unité Locale</th>
                  {/* ePSC */}
                  <th className="p-2 text-center bg-blue-50/20">Se</th><th className="p-2 text-center bg-blue-50/20">St</th><th className="p-2 text-center bg-blue-50/20 border-r border-slate-205">He</th>
                  {/* PSC */}
                  <th className="p-2 text-center bg-indigo-50/20">Se</th><th className="p-2 text-center bg-indigo-50/20">St</th><th className="p-2 text-center bg-indigo-50/20 border-r border-slate-205">He</th>
                  {/* IPSEN */}
                  <th className="p-2 text-center bg-purple-50/20">Se</th><th className="p-2 text-center bg-purple-50/20">St</th><th className="p-2 text-center bg-purple-50/20 border-r border-slate-205">He</th>
                  {/* GQS */}
                  <th className="p-2 text-center bg-amber-50/20">Se</th><th className="p-2 text-center bg-amber-50/20">St</th><th className="p-2 text-center bg-amber-50/20 border-r border-slate-205">He</th>
                  {/* recyclage */}
                  <th className="p-2 text-center bg-emerald-50/20">Se</th><th className="p-2 text-center bg-emerald-50/20">St</th><th className="p-2 text-center bg-emerald-50/20">He</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {parsedFormationRows.map((row, i) => {
                  const subTotalSe = row.epscSessions + row.pscSessions + row.ipsenSessions + row.gqsSessions + row.recyclageSessions;
                  const isVoid = subTotalSe === 0;

                  return (
                    <tr 
                      key={i} 
                      className={`hover:bg-slate-50 transition ${isVoid ? 'bg-slate-50/50 text-slate-400' : 'text-slate-700'}`}
                    >
                      <td className="p-2.5 pl-4 font-bold sticky left-0 bg-white hover:bg-slate-50 border-r border-slate-200 z-10 shrink-0">
                        {row.ul}
                      </td>
                      {/* ePSC */}
                      <td className="p-2 text-center font-semibold text-slate-800">{row.epscSessions || '-'}</td>
                      <td className="p-2 text-center text-slate-600">{row.epscStagiaires || '-'}</td>
                      <td className="p-2 text-center text-slate-500 font-mono border-r border-slate-200">{row.epscHeures ? `${row.epscHeures} h` : '-'}</td>
                      
                      {/* PSC */}
                      <td className="p-2 text-center font-semibold text-slate-800">{row.pscSessions || '-'}</td>
                      <td className="p-2 text-center text-slate-600">{row.pscStagiaires || '-'}</td>
                      <td className="p-2 text-center text-slate-500 font-mono border-r border-slate-200">{row.pscHeures ? `${row.pscHeures} h` : '-'}</td>
                      
                      {/* IPSEN */}
                      <td className="p-2 text-center font-semibold text-slate-800">{row.ipsenSessions || '-'}</td>
                      <td className="p-2 text-center text-slate-600">{row.ipsenStagiaires || '-'}</td>
                      <td className="p-2 text-center text-slate-500 font-mono border-r border-slate-200">{row.ipsenHeures ? `${row.ipsenHeures} h` : '-'}</td>
                      
                      {/* GQS */}
                      <td className="p-2 text-center font-semibold text-slate-800">{row.gqsSessions || '-'}</td>
                      <td className="p-2 text-center text-slate-600">{row.gqsStagiaires || '-'}</td>
                      <td className="p-2 text-center text-slate-500 font-mono border-r border-slate-200">{row.gqsHeures ? `${row.gqsHeures} h` : '-'}</td>
                      
                      {/* recyclage */}
                      <td className="p-2 text-center font-semibold text-slate-800">{row.recyclageSessions || '-'}</td>
                      <td className="p-2 text-center text-slate-600">{row.recyclageStagiaires || '-'}</td>
                      <td className="p-2 text-center text-slate-500 font-mono">{row.recyclageHeures ? `${row.recyclageHeures} h` : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <span className="text-slate-500">
              Légende colonnes : <b>Se</b> = Nombre Sessions, <b>St</b> = Nombre Stagiaires, <b>He</b> = Heures de formation
            </span>
            <button
              type="button"
              onClick={handleTriggerInject}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              Consolider et actualiser le Bilan Formation {targetYear}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Manual note / legend */}
      <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-2 leading-relaxed">
        <div className="flex items-center gap-1.5 text-slate-800 font-bold">
          <Award className="w-3.5 h-3.5 text-amber-600" />
          <span>Informations sur le Référentiel Grand Public</span>
        </div>
        <ul className="list-disc pl-4 space-y-1 text-slate-500 text-[11px]">
          <li><b>ePSC</b> : Format mixte combinant apprentissage en ligne (e-learning) et mise en situation pratique.</li>
          <li><b>PSC (ou PSC1)</b> : Module classique de Prévention et Secours Civiques de niveau 1 (durée de ~7h en moyenne).</li>
          <li><b>IPSEN</b> : Initiation aux Premiers Secours Enfant et Nourrisson, à destination des parents et professionnels de la petite enfance.</li>
          <li><b>GQS</b> : Sensibilisation courte aux Gestes Qui Sauvent (~2 heures d'initiation).</li>
          <li><b>recyclage PSC</b> : Formations de maintien des acquis pour les secouristes ou formateurs.</li>
        </ul>
      </div>

      {/* Confirmation Overlay Modal */}
      {showConfirmModal && parsedFormationRows && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-full border border-blue-100 shrink-0">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-sans">Confirmation d'intégration (Formations)</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Voulez-vous intégrer ces {parsedFormationRows.length} bilans locaux de Formation dans le tableau de bord départemental ({targetYear}) ?
                </p>
              </div>
            </div>

            <div className="p-3 bg-blue-50/50 rounded-lg space-y-2 border border-blue-100">
              <h5 className="text-[10px] font-bold text-slate-650 uppercase tracking-wider">Détail des volumes chargés :</h5>
              <ul className="text-xs space-y-1 text-slate-700">
                <li className="flex justify-between"><span>Structures locales :</span> <b>{parsedFormationRows.length} structures</b></li>
                <li className="flex justify-between"><span>Total Sessions dispensées :</span> <b className="text-blue-750 font-mono">{totalLoadedSessions} sessions</b></li>
                <li className="flex justify-between"><span>Total Stagiaires formés :</span> <b className="text-emerald-700 font-mono">{totalLoadedStagiaires} stagiaires</b></li>
                <li className="flex justify-between"><span>Total Heures de Formation :</span> <b className="text-amber-600 font-mono">{totalLoadedHeures.toLocaleString('fr-FR')} h</b></li>
              </ul>
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="modal-integration-year-f" className="text-xs font-semibold text-slate-600">Année cible d'injection :</label>
              <select
                id="modal-integration-year-f"
                value={targetYear}
                onChange={(e) => setTargetYear(parseInt(e.target.value, 10))}
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
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-2xs cursor-pointer"
              >
                Confirmer l'ajout au Bilan {targetYear}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
