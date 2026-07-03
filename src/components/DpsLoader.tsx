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
  UserCheck, 
  HeartHandshake, 
  HelpCircle, 
  RotateCcw, 
  X, 
  Info,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Stethoscope
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { MetierStats, ParsedDpsRow, getYearFromDateString, formatExcelCellValue } from '../types';

interface DpsLoaderProps {
  onDataImported: (newStats: MetierStats[]) => void;
  currentStats: MetierStats[];
  parsedRows: ParsedDpsRow[] | null;
  setParsedRows: React.Dispatch<React.SetStateAction<ParsedDpsRow[] | null>>;
  fileName: string;
  setFileName: React.Dispatch<React.SetStateAction<string>>;
  importStatus: { type: 'success' | 'error' | null; message: string };
  setImportStatus: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error' | null; message: string }>>;
  onInject?: (rows: ParsedDpsRow[], file: string) => void;
  existingDpsRows?: ParsedDpsRow[] | null;
}

export const DpsLoader: React.FC<DpsLoaderProps> = ({ 
  onDataImported, 
  currentStats,
  parsedRows,
  setParsedRows,
  fileName,
  setFileName,
  importStatus,
  setImportStatus,
  onInject,
  existingDpsRows
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [showIgnoredRows, setShowIgnoredRows] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [integrationYear, setIntegrationYear] = useState<number>(2026);

  // Automatically detect default integration year from data if possible
  const detectedYear = React.useMemo(() => {
    if (parsedRows && parsedRows.length > 0) {
      for (const r of parsedRows) {
        if (r.debut) {
          const match = r.debut.match(/^(\d{4})/);
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
  }, [parsedRows]);

  React.useEffect(() => {
    if (detectedYear) {
      setIntegrationYear(detectedYear);
    }
  }, [detectedYear]);

  // Helper parser for Dimensionnement to calculate baseline first-responders (secouristes)
  const parseDimensionnement = (dimStr: string): { count: number; breakdown: string } => {
    if (!dimStr) return { count: 2, breakdown: 'Par défaut (2 secouristes)' };
    const normalized = dimStr.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Clean up synonymous / alternative descriptions (e.g. "binome (paps)" or "binome ou paps" to just "binome")
    let cleaned = normalized;
    cleaned = cleaned.replace(/(binome|bin)\s*\(\s*paps\s*\)/g, "$1");
    cleaned = cleaned.replace(/paps\s*\(\s*(binome|bin)\s*\)/g, "paps");
    cleaned = cleaned.replace(/(binome|bin)\s+(ou|\/|et\/ou)\s*paps/g, "$1");
    cleaned = cleaned.replace(/paps\s+(ou|\/|et\/ou)\s*(binome|bin)/g, "paps");

    let count = 0;
    const partsArray: string[] = [];

    // Check teams ("équipe" = 4)
    const teamMatch = cleaned.match(/(\d+)\s*(equipe|eq)/);
    if (teamMatch) {
      const qte = parseInt(teamMatch[1], 10);
      count += qte * 4;
      partsArray.push(`${qte} équipe(s) [${qte * 4} pers]`);
    } else if (cleaned.includes("equipe") || cleaned.includes("unite d'intervention")) {
      count += 4;
      partsArray.push(`1 équipe [4 pers]`);
    }

    // Check binomes ("binôme" / "binome" = 2)
    const binomeMatch = cleaned.match(/(\d+)\s*(binome|bin)/);
    if (binomeMatch) {
      const qte = parseInt(binomeMatch[1], 10);
      count += qte * 2;
      partsArray.push(`${qte} binôme(s) [${qte * 2} pers]`);
    } else if (cleaned.includes("binome") || cleaned.includes("binôme")) {
      count += 2;
      partsArray.push(`1 binôme [2 pers]`);
    }

    // Check PAPS ("paps" = 2)
    const papsMatch = cleaned.match(/(\d+)\s*paps/);
    if (papsMatch) {
      const qte = parseInt(papsMatch[1], 10);
      count += qte * 2;
      partsArray.push(`${qte} PAPS [${qte * 2} pers]`);
    } else if (cleaned.includes("paps")) {
      count += 2;
      partsArray.push(`1 PAPS [2 pers]`);
    }

    // If nothing parsed, but a simple digit is listed (e.g. "5 secouristes")
    if (count === 0) {
      const digitsMatch = cleaned.match(/(\d+)/);
      if (digitsMatch) {
        const parsedDigits = parseInt(digitsMatch[1], 10);
        if (parsedDigits > 0) {
          return { count: parsedDigits, breakdown: `${parsedDigits} secouristes mentionnés` };
        }
      }
    }

    if (count === 0) {
      return { count: 2, breakdown: 'Non spécifié / PAPS (2 pers)' };
    }

    return { count, breakdown: partsArray.join(' + ') };
  };

  // Helper logic to format sheet cells or read value safely
  const getCellValue = (row: any, index: number, defaultValue: string = ''): string => {
    if (!row || index === -1 || row[index] === undefined || row[index] === null) {
      return defaultValue;
    }
    return String(row[index]).trim();
  };

  const getCellNum = (row: any, index: number, defaultValue: number = 0): number => {
    if (!row || index === -1 || row[index] === undefined || row[index] === null) {
      return defaultValue;
    }
    const val = parseFloat(String(row[index]).replace(/[^\d.-]/g, ''));
    return isNaN(val) ? defaultValue : val;
  };

  // Build a dummy DPS Excel model file filled with illustrative data
  const handleDownloadDpsTemplate = () => {
    try {
      const headers = [
        "Prélèvement", "UL", "Statut", "Début", "Fin", "Heures", "Vac4h", 
        "MANIFESTATION", "Adresse complète", "RIS", "Dimensionnement", "Tarif théorique", 
        "Valide DT", "Agrément", "Evac ?", "Médicalisé ?", "Durée", 
        "NB Vacations 4H", "Nb Soins", "Nb décharge", "Nb évac", "Nb autre", 
        "Nb petits soins", "Nb trauma", "Nb Malaise", "Nb inconscient", "Nb ACR"
      ];

      const data = [
        headers,
        [
          150, "Versailles", "Confirmé", "2026-05-12 14:00", "2026-05-12 22:00", 8, "Oui",
          "Grand Prix Hippique de Versailles", "Château de Versailles - 78000", "0.25", "1 équipe et 1 binôme", 800,
          "Oui", "Agréé", "OUI", "NON", 8, 2, 5, 0, 1, 0, 4, 1, 1, 0, 0
        ],
        [
          300, "DT", "Confirmé", "2026-06-21 16:00", "2026-06-22 02:00", 10, "Oui",
          "Fête de la Musique - Scène Centrale Yvelines", "Place du Marché - Versailles 78000", "0.45", "2 équipes", 1500,
          "Oui", "Agréé", "OUI", "OUI", 10, 3, 24, 2, 3, 1, 15, 6, 4, 1, 0
        ],
        [
          80, "Saint-Germain", "Confirmé", "2026-06-05 09:00", "2026-06-05 17:00", 8, "Non",
          "Tournoi de Tennis Intercommunal", "Complexe Sportif - Saint-Germain-en-Laye 78100", "0.15", "1 binôme", 450,
          "Oui", "Agréé", "NON", "NON", 8, 2, 3, 0, 0, 0, 3, 0, 1, 0, 0
        ],
        [
          0, "DT92", "Confirmé", "2026-04-18 10:00", "2026-04-18 18:00", 8, "Non",
          "Match de Rugby Colombes (Ignoré - Hors IDF 78)", "Stade Olympique Colombes 92700", "0.20", "1 équipe", 700,
          "Oui", "Agréé", "NON", "NON", 8, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0
        ],
        [
          120, "Poissy", "Option", "2026-08-15 08:00", "2026-08-15 14:00", 6, "Non",
          "Bourse à l'Auto - Poissy 78300 (Option)", "Parc des Expositions - Poissy 78300", "0.10", "1 PAPS", 300,
          "Oui", "Agréé", "NON", "NON", 6, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0
        ],
        [
          60, "Rambouillet", "Confirmé", "2026-05-30 10:00", "2026-05-30 18:00", 8, "Non",
          "Fête de la Nature en Forêt", "Étang de la Tour - Rambouillet 78120", "0.15", "1 équipe", 400,
          "Oui", "Agréé", "NON", "NON", 8, 2, 2, 0, 0, 0, 1, 1, 0, 0, 0
        ]
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "DPS Réalisés - DTUS 78");
      
      XLSX.writeFile(workbook, "modele_import_dps_dtus78.xlsx");
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: `Erreur interne lors du téléchargement : ${err?.message || err}`
      });
    }
  };

  // General Parse Handler for the uploaded sheet file
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
        
        // Convert to array of arrays to have maximum parsing control
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        if (rows.length < 2) {
          throw new Error("Le fichier semble vide ou ne comprend pas de ligne d'en-tête et de données.");
        }

        // Detect indices of crucial headers (fuzzy string matching)
        const headers = rows[0].map((h: any) => String(h || '').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
        
        const prelevementIdx = headers.findIndex(h => h.includes('prelevement') || h.includes('prelev'));
        const ulIdx = headers.findIndex(h => h === 'ul' || h.includes('unite'));
        const statutIdx = headers.findIndex(h => h.includes('statut') || h.includes('status'));
        const debutIdx = headers.findIndex(h => h.includes('debut') || h.includes('start'));
        const finIdx = headers.findIndex(h => h.includes('fin') || h.includes('end'));
        const heuresIdx = headers.findIndex(h => h === 'heures' || h === 'heure' || h.includes('duree'));
        const manifestationIdx = headers.findIndex(h => h.includes('manifestation') || h.includes('libelle') || h.includes('evenement'));
        const dimensionnementIdx = headers.findIndex(h => h.includes('dimensionnement') || h.includes('taille') || h.includes('dispositif'));
        const tarifIdx = headers.findIndex(h => h.includes('tarif theorique') || h.includes('tarif') || h.includes('montant'));
        const evacIdx = headers.findIndex(h => (h === 'evac' || h === 'evac ?' || h.includes('evacuation') || h.includes('evac?')) && !h.includes('nb') && !h.includes('nombre'));
        
        // Clinical stats index checks
        const nbSoinsIdx = headers.findIndex(h => h.includes('nb soins') || h.includes('nb_soins'));
        const nbEvacIdx = headers.findIndex(h => h.includes('nb evac') || h.includes('nb_evac'));
        const nbTraumaIdx = headers.findIndex(h => h.includes('nb trauma') || h.includes('nb_trauma'));
        const nbMalaiseIdx = headers.findIndex(h => h.includes('nb malaise') || h.includes('nb_malaise'));
        const nbInconscientIdx = headers.findIndex(h => h.includes('nb inconscient') || h.includes('nb_inconscient'));
        const nbAcrIdx = headers.findIndex(h => h.includes('nb acr') || h.includes('nb_acr'));
        const medicaliseIdx = headers.findIndex(h => h.includes('medicalise') || h.includes('docteur'));

        if (ulIdx === -1 || manifestationIdx === -1 || heuresIdx === -1) {
          throw new Error("Structure non-reconnaissable. Assurez-vous d'avoir au moins les colonnes 'UL', 'MANIFESTATION' et 'Heures'.");
        }

        const calculatedRows: ParsedDpsRow[] = [];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0 || row.every(val => val === undefined || val === null || val === '')) {
            continue; // Skip blank lines
          }

          const rawUl = getCellValue(row, ulIdx, '');
          const manifestation = getCellValue(row, manifestationIdx, 'Poste de Secours indéterminé');
          const statut = getCellValue(row, statutIdx, 'Confirmé');
          const debut = formatExcelCellValue(row[debutIdx]);
          const fin = formatExcelCellValue(row[finIdx] !== undefined && row[finIdx] !== null ? row[finIdx] : row[debutIdx]);
          const rawHeures = getCellNum(row, heuresIdx, 0);
          const rawPrelevement = getCellNum(row, prelevementIdx, 0);
          const rawTarif = getCellNum(row, tarifIdx, 0);
          const dimensionnement = getCellValue(row, dimensionnementIdx, '1 binôme');
          
          let evac = false;
          if (evacIdx !== -1) {
            const rawEvac = getCellValue(row, evacIdx, 'NON').toUpperCase();
            evac = rawEvac.includes('OUI') || rawEvac === 'O' || rawEvac === 'Y' || rawEvac.includes('YES');
          }

          let medicalise = false;
          if (medicaliseIdx !== -1) {
            const rawMed = getCellValue(row, medicaliseIdx, 'NON').toUpperCase();
            medicalise = rawMed.includes('OUI') || rawMed === 'O' || rawMed === 'Y';
          }

          // Fetch clinical values
          const nbSoins = getCellNum(row, nbSoinsIdx, 0);
          const nbEvac = getCellNum(row, nbEvacIdx, 0);
          const nbTrauma = getCellNum(row, nbTraumaIdx, 0);
          const nbMalaise = getCellNum(row, nbMalaiseIdx, 0);
          const nbInconscient = getCellNum(row, nbInconscientIdx, 0);
          const nbAcr = getCellNum(row, nbAcrIdx, 0);

          // Filtering instructions:
          // "si il y a marqué DT c'est que c'est un poste porté par la DT et je produirais un autre type de fichier d'import."
          // "Si c'est marqué DT92 ou 75 par exemple, la ligne n'est pas à prendre en compte"
          // We assume "DT" (or "DT 78") is valid. But if there are letters or numbers like DT92, DT75, DT91, DT93, DT94, etc., it should be ignored.
          const normalizedUl = rawUl.toUpperCase().replace(/\s/g, '');
          let isIgnored = false;
          let invalidReason = undefined;

          if (!rawUl) {
            isIgnored = true;
            invalidReason = "Déclaration d'Unité Locale manquante";
          } else if (normalizedUl.includes('DT') && normalizedUl !== 'DT' && normalizedUl !== 'DT78' && normalizedUl !== 'DTUS' && normalizedUl !== 'DTUS78') {
            isIgnored = true;
            invalidReason = `Ignoré d'office : Attribué à un autre département (${rawUl})`;
          }

          // Calculate first responders engaged based on rule:
          // dimensionnement baseline + (if evac === true, add 3 first-responders)
          // Operationally, a PAPS is strictly 2 first-responders (no independent evacuation team can be added).
          const dimResponders = parseDimensionnement(dimensionnement);
          const isPapsOnly = dimResponders.count <= 2 && (dimensionnement.toLowerCase().includes('paps') || dimResponders.breakdown.toUpperCase().includes('PAPS'));
          const extraEvacResponders = (evac && !isPapsOnly) ? 3 : 0;
          const totalResponders = isPapsOnly ? 2 : (dimResponders.count + extraEvacResponders);

          // calculate total volunteer hours
          const hoursBenevolat = totalResponders * rawHeures;

          // Check if already known in database/registry
          const isAlreadyKnown = !!(
            !isIgnored &&
            existingDpsRows &&
            existingDpsRows.some(existing => {
              const existingDate = existing.debut ? existing.debut.substring(0, 10) : '';
              const newDate = debut ? debut.substring(0, 10) : '';
              return (
                existing.manifestation.trim().toLowerCase() === manifestation.trim().toLowerCase() &&
                existingDate === newDate &&
                existing.ul.trim().toLowerCase() === rawUl.trim().toLowerCase()
              );
            })
          );

          calculatedRows.push({
            ul: rawUl,
            manifestation,
            statut,
            debut,
            fin,
            heuresDps: rawHeures,
            prelevement: rawPrelevement,
            tarifTheorique: rawTarif,
            dimensionnement: `${dimensionnement} (Base: ${dimResponders.count} pers${evac ? ' + Évacuation: +3 pers' : ''})`,
            secouristesEngages: totalResponders,
            evac,
            heuresBenevolatCalculees: hoursBenevolat,
            invalidReason,
            isIgnored,
            isAlreadyKnown,
            nbSoins: nbSoins || (nbTrauma + nbMalaise + nbInconscient), // fallback to sum of specific ones if total is zero
            nbEvac,
            nbTrauma,
            nbMalaise,
            nbInconscient,
            nbAcr,
            medicalise
          });
        }

        if (calculatedRows.length === 0) {
          throw new Error("Aucune ligne d'activité exploitable n'a été décryptée.");
        }

        setParsedRows(calculatedRows);
        setImportStatus({
          type: 'success',
          message: `Fichier analysé avec succès. ${calculatedRows.filter(r => !r.isIgnored).length} postes de secours détectés pour la DTUS 78 (${calculatedRows.filter(r => r.isIgnored).length} lignes filtrées d'office).`
        });
      } catch (err: any) {
        setImportStatus({
          type: 'error',
          message: `Échec du chargement du fichier : ${err?.message || 'Structure de fichier incorrecte.'}`
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

  // Directly inject the computed consolidated values into the App state (for Secourisme 2026)
  const injectDpsDataIntoDashboard = () => {
    if (!parsedRows) return;

    // Filter to count only confirmed/clôturés, non-ignored posts
    const activeConfirmedPosts = parsedRows.filter(r => {
      if (r.isIgnored) return false;
      const s = r.statut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return s.includes('confirme') || s.includes('cloture') || s.includes('realise') || s.includes('valide');
    });
    
    if (activeConfirmedPosts.length === 0) {
      setImportStatus({
        type: 'error',
        message: "Impossible d'injecter : Aucune ligne n'est validée et marquée au statut actif (Confirmé, Clôturé, Réalisé, Validé). Veuillez modifier le statut dans le tableau ci-dessous avant d'injecter."
      });
      return;
    }

    setShowConfirmModal(true);
  };

  const performActualDpsInjection = () => {
    if (!parsedRows) return;

    // Adjust years in dates (debut, fin) of parsedRows to match selected integrationYear
    const adjustedRows = parsedRows.map(r => {
      let adjDebut = r.debut;
      let adjFin = r.fin;
      if (r.debut && r.debut.match(/^(\d{4})/)) {
        adjDebut = r.debut.replace(/^(\d{4})/, String(integrationYear));
      }
      if (r.fin && r.fin.match(/^(\d{4})/)) {
        adjFin = r.fin.replace(/^(\d{4})/, String(integrationYear));
      }

      return {
        ...r,
        debut: adjDebut,
        fin: adjFin
      };
    });

    const activeConfirmedPosts = adjustedRows.filter(r => {
      if (r.isIgnored) return false;
      const s = r.statut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return s.includes('confirme') || s.includes('cloture') || s.includes('realise') || s.includes('valide');
    });
    const consolidatedActivitiesCount = activeConfirmedPosts.length;
    const consolidatedVolunteerHours = Math.round(activeConfirmedPosts.reduce((sum, row) => sum + row.heuresBenevolatCalculees, 0));

    if (onInject) {
      onInject(adjustedRows, fileName);
    } else {
      // Map into deep copy of original stats
      const updatedStats: MetierStats[] = JSON.parse(JSON.stringify(currentStats));
      const secourismeObj = updatedStats.find(m => m.id === 'secourisme');

      if (secourismeObj) {
        // Find historical stats entry or inject a new baseline
        const yearStats = secourismeObj.history.find(h => h.year === integrationYear);
        
        if (yearStats) {
          // Set new values straight from calculated totals
          yearStats.activitiesCount = consolidatedActivitiesCount;
          yearStats.volunteerHours = consolidatedVolunteerHours;
        } else {
          secourismeObj.history.push({
            year: integrationYear,
            activitiesCount: consolidatedActivitiesCount,
            volunteerHours: consolidatedVolunteerHours
          });
          secourismeObj.history.sort((a, b) => a.year - b.year);
        }

        // Populate breakdown with top manifestations
        const sortedManifestations = [...activeConfirmedPosts]
          .sort((a, b) => b.heuresBenevolatCalculees - a.heuresBenevolatCalculees);
        
        const newBreakdown = sortedManifestations.slice(0, 5).map(m => ({
          name: `${m.manifestation} (${m.ul})`,
          count: 1,
          hours: Math.round(m.heuresBenevolatCalculees)
        }));

        // Add "Autres DPS consolidés" if more exist
        if (sortedManifestations.length > 5) {
          const otherManifestations = sortedManifestations.slice(5);
          const otherHrs = otherManifestations.reduce((sum, row) => sum + row.heuresBenevolatCalculees, 0);
          newBreakdown.push({
            name: `Autres postes du département (${otherManifestations.length} DPS)`,
            count: otherManifestations.length,
            hours: Math.round(otherHrs)
          });
        }

        if (integrationYear === 2026) {
          secourismeObj.breakdown2026 = newBreakdown;
        }
      }

      onDataImported(updatedStats);
    }

    setParsedRows(null);
    setFileName('');
    setImportStatus({
      type: 'success',
      message: `Injection opérationnelle réussie ! Le bilan ${integrationYear} du Secourisme intègre désormais ${consolidatedActivitiesCount} postes de secours confirmés pour un volume de ${consolidatedVolunteerHours.toLocaleString('fr-FR')} heures de bénévolat. Retrouvez-les à tout moment dans le 'Registre DPS'.`
    });
  };

  const handleReset = () => {
    setParsedRows(null);
    setFileName('');
    setImportStatus({ type: null, message: '' });
  };

  // Metrics aggregations for active confirmed / clôturés posts
  const activeConfirmed = parsedRows ? parsedRows.map(r => {
    let adjDebut = r.debut;
    let adjFin = r.fin;
    if (r.debut && r.debut.match(/^(\d{4})/)) {
      adjDebut = r.debut.replace(/^(\d{4})/, String(integrationYear));
    }
    if (r.fin && r.fin.match(/^(\d{4})/)) {
      adjFin = r.fin.replace(/^(\d{4})/, String(integrationYear));
    }
    return {
      ...r,
      debut: adjDebut,
      fin: adjFin
    };
  }).filter(r => {
    if (r.isIgnored) return false;
    const s = r.statut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return s.includes('confirme') || s.includes('cloture') || s.includes('realise') || s.includes('valide');
  }) : [];
  
  const totalDpsConfirmed = activeConfirmed.length;
  const totalHoursBenevolat = Math.round(activeConfirmed.reduce((sum, r) => sum + r.heuresBenevolatCalculees, 0));
  const totalTarifTheorique = activeConfirmed.reduce((sum, r) => sum + r.tarifTheorique, 0);
  const totalPrelevementDt = activeConfirmed.reduce((sum, r) => sum + r.prelevement, 0);
  const totalSoldeUl = totalTarifTheorique - totalPrelevementDt;

  // Clinical totals
  const totalNbSoins = activeConfirmed.reduce((sum, r) => sum + r.nbSoins, 0);
  const totalNbEvac = activeConfirmed.reduce((sum, r) => sum + r.nbEvac, 0);
  const totalTrauma = activeConfirmed.reduce((sum, r) => sum + r.nbTrauma, 0);
  const totalMalaise = activeConfirmed.reduce((sum, r) => sum + r.nbMalaise, 0);
  const totalInconscient = activeConfirmed.reduce((sum, r) => sum + r.nbInconscient, 0);
  const totalAcr = activeConfirmed.reduce((sum, r) => sum + r.nbAcr, 0);
  const pctMedicalise = totalDpsConfirmed > 0 
    ? Math.round((activeConfirmed.filter(r => r.medicalise).length / totalDpsConfirmed) * 100) 
    : 0;

  const parsedDataYear = activeConfirmed.length > 0 && activeConfirmed[0].debut
    ? getYearFromDateString(activeConfirmed[0].debut)
    : 2026;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-slideIn">
            <div className="bg-rc-red text-white p-4 flex items-center gap-2.5 font-bold">
              <Check className="w-5 h-5" />
              <span>Confirmer l'intégration (Registre DPS)</span>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Voulez-vous intégrer ces données consolidées dans le tableau de bord Secourisme {integrationYear} ?
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Source :</span>
                  <span className="font-bold text-slate-805 truncate max-w-[200px]">{fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nombre de postes validés :</span>
                  <span className="font-bold text-slate-800">{totalDpsConfirmed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Heures de bénévolat :</span>
                  <span className="font-bold text-rc-red">{totalHoursBenevolat.toLocaleString('fr-FR')} h</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                Après intégration, la liste de travail ci-dessous sera vidée. Les données resteront accessibles et modifiables en cliquant sur le bouton "Registre DPS" en haut de la page.
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
                  performActualDpsInjection();
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rc-red hover:bg-[#D7171E] rounded shadow-xs transition cursor-pointer"
              >
                Confirmer l'intégration
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Element Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 text-rc-red rounded-lg">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Module Opérationnel : Intégrateur DPS (Postes de Secours)</h4>
            <p className="text-xs text-slate-500">Formattage de suivi des effectifs, prélèvements et statistiques cliniques annuelles</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadDpsTemplate}
            type="button"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rc-red bg-rc-red/10 hover:bg-rc-red/15 rounded-md transition cursor-pointer border border-rc-red/15"
          >
            <Download className="w-3.5 h-3.5" />
            Télécharger le Modèle DPS (.xlsx)
          </button>
        </div>
      </div>

      {!parsedRows ? (
        /* DROP ZONE */
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg flex items-start gap-3">
            <Info className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
            <div className="text-[11px] text-indigo-950 leading-relaxed">
              <p className="font-bold">Guide des règles de gestion intégrées :</p>
              <ul className="list-disc list-inside mt-1 space-y-1 ml-1 text-slate-700">
                <li><b>Filtrage Territorial :</b> Exclusion automatique des lignes provenant d'autres départements (comme DT92 ou DT75).</li>
                <li><b>Calcul des Équipiers :</b> Établi automatiquement à <b>4 équipiers par équipe</b>, <b>2 équipiers par binôme ou PAPS</b>.</li>
                <li><b>Évacuation :</b> L'option <i>"Evac ? : OUI"</i> ajoute d'office <b>3 secouristes supplémentaires</b> sur le dispositif (hors PAPS qui reste strictement limité à 2 personnes).</li>
                <li><b>Heures de Bénévolat :</b> Somme de <span className="font-semibold text-slate-800">Nbre Secouristes Final × Heures de DPS</span>.</li>
                <li><b>Flux financier :</b> Suivi de la taxe Territoriale (Prélèvements DT) et de la part reversée aux Unités Locales.</li>
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
                ? 'border-rc-red bg-rc-red/5 scale-[1.01]'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-rose-500/5 text-rc-red rounded-full">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Activez l'analyse par glisser-déposer de votre fichier Excel de DPS ici
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Supports : fichiers .xlsx, .xls ou .csv contenant les colonnes d'activité et de dimensionnement
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

          {importStatus.type === 'error' && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-md text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{importStatus.message}</span>
            </div>
          )}
        </div>
      ) : (
        /* RESULTS & INTERACTIVE REPORT */
        <div className="space-y-6 animate-slideIn">
          
          {/* File Header with Selectable Integration Year */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]" title={fileName}>{fileName}</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 font-bold uppercase shrink-0">Prêt à l'analyse</span>
              </div>
              <span className="hidden sm:inline text-slate-300">|</span>
              <div className="flex items-center gap-2">
                <label htmlFor="integration-year-select" className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Année d'intégration :</label>
                <select
                  id="integration-year-select"
                  value={integrationYear}
                  onChange={(e) => setIntegrationYear(parseInt(e.target.value, 10))}
                  className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-rc-red cursor-pointer"
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
                title="Déposer un autre fichier"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Recommencer
              </button>
              
              <button
                onClick={injectDpsDataIntoDashboard}
                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rc-red hover:bg-[#D7171E] rounded shadow-xs transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Injecter dans Secourisme {integrationYear}
              </button>
            </div>
          </div>

          {/* KPI Dashboard Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* KPI 1: DPS Volontaires */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 relative overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Volume Bénévolat</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-slate-900 font-mono">{totalHoursBenevolat.toLocaleString('fr-FR')}</span>
                <span className="text-xs font-bold text-slate-500">heures</span>
              </div>
              <p className="text-[9px] text-slate-500 mt-1 leading-normal">
                Équivalent à {totalDpsConfirmed} dispositif(s) secouriste(s) confirmés.
              </p>
              <div className="absolute right-3 top-3.5 text-slate-200">
                <Clock className="w-10 h-10 stroke-1" />
              </div>
            </div>

            {/* KPI 2: Direct Tax DT Levy */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 relative overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Taxation DT (78)</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-rc-red font-mono">{totalPrelevementDt.toLocaleString('fr-FR')}</span>
                <span className="text-xs font-bold text-rc-red">€</span>
              </div>
              <p className="text-[9px] text-slate-500 mt-1 leading-normal">
                Prélèvements DT consolidés sur l'ensemble des postes.
              </p>
              <div className="absolute right-3 top-3.5 text-slate-200">
                <Coins className="w-10 h-10 stroke-1" />
              </div>
            </div>

            {/* KPI 3: Local Units share */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 relative overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Part Unités Locales</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-green-700 font-mono">{totalSoldeUl.toLocaleString('fr-FR')}</span>
                <span className="text-xs font-bold text-green-700">€</span>
              </div>
              <p className="text-[9px] text-slate-500 mt-1 leading-normal">
                Excédent net restitué au financement des UL yvelinoises.
              </p>
              <div className="absolute right-3 top-3.5 text-slate-200">
                <TrendingUp className="w-10 h-10 stroke-1" />
              </div>
            </div>

            {/* KPI 4: Clinical Medical ratios */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 relative overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Médicalisation DPS</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-indigo-700 font-mono">{pctMedicalise}</span>
                <span className="text-xs font-bold text-indigo-700">%</span>
              </div>
              <p className="text-[9px] text-slate-500 mt-1 leading-normal">
                Taux de présence médecin/infirmier opérationnel.
              </p>
              <div className="absolute right-3 top-3.5 text-slate-200">
                <Stethoscope className="w-10 h-10 stroke-1" />
              </div>
            </div>
          </div>

          {/* Clinical stats widget details */}
          <div className="p-4 bg-slate-55 border border-slate-200 rounded-lg">
            <h5 className="text-[11px] font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-1.5 mb-3">
              <Stethoscope className="w-4 h-4 text-rc-red" />
              Bilan Clinique & Sanitaire consolidé (Service technique Secours {parsedDataYear})
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
              <div className="bg-white p-2 rounded border border-slate-150">
                <span className="block text-slate-400 text-[9px] font-bold uppercase">Nb Soins</span>
                <span className="text-sm font-extrabold text-slate-800 font-mono">{totalNbSoins}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-150">
                <span className="block text-slate-400 text-[9px] font-bold uppercase">Nb Trauma</span>
                <span className="text-sm font-extrabold text-amber-700 font-mono">{totalTrauma}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-150">
                <span className="block text-slate-400 text-[9px] font-bold uppercase">Malaise</span>
                <span className="text-sm font-extrabold text-slate-700 font-mono">{totalMalaise}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-150">
                <span className="block text-slate-400 text-[9px] font-bold uppercase">Inconscients</span>
                <span className="text-sm font-extrabold text-purple-700 font-mono">{totalInconscient}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-150">
                <span className="block text-slate-400 text-[9px] font-bold uppercase">Nb ACR</span>
                <span className="text-sm font-extrabold text-rc-red font-mono">{totalAcr}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-150">
                <span className="block text-emerald-850 text-[9px] font-bold uppercase">Évacuations (112)</span>
                <span className="text-sm font-extrabold text-emerald-700 font-mono">{totalNbEvac}</span>
              </div>
            </div>
          </div>

          {/* Interactive rows table representation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-tight">Liste des postes de secours analysés</span>
              
              <button
                onClick={() => setShowIgnoredRows(!showIgnoredRows)}
                className="text-xs font-bold text-rc-red hover:underline flex items-center gap-1 cursor-pointer"
              >
                {showIgnoredRows ? `Masquer les lignes filtrées` : `Afficher les lignes filtrées / ignorées (${parsedRows.filter(r => r.isIgnored).length})`}
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-3xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                    <th className="p-3">UL Référente</th>
                    <th className="p-3">Libellé Manifestation</th>
                    <th className="p-3 text-center">Statut</th>
                    <th className="p-3">Dimensionnement</th>
                    <th className="p-3 text-center">Durée</th>
                    <th className="p-3 text-right">Prélèvement DT</th>
                    <th className="p-3 text-right">Total Bénévolat</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row, index) => {
                    if (row.isIgnored && !showIgnoredRows) return null;

                    return (
                      <tr 
                        key={index} 
                        className={`border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors ${
                          row.isIgnored ? 'bg-rose-50/50 text-slate-450' : 'text-slate-700'
                        }`}
                      >
                        {/* UL Column */}
                        <td className="p-3">
                          {row.isIgnored ? (
                            <div className="flex items-center gap-1" title={row.invalidReason}>
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                              <span className="line-through">{row.ul || 'Vide'}</span>
                            </div>
                          ) : (
                            <span className="font-bold text-slate-800">
                              {row.ul === 'DT' ? 'Direction Territoriale (78)' : `UL ${row.ul}`}
                            </span>
                          )}
                        </td>

                        {/* Manifestation Column */}
                        <td className="p-3 font-medium truncate max-w-[200px]" title={row.manifestation}>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="truncate">{row.manifestation}</span>
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

                        {/* Status Column */}
                        <td className="p-3 text-center">
                          {row.isIgnored ? (
                            <span className="inline-block text-[9px] font-bold uppercase text-rose-600 bg-rose-100/60 px-1.5 py-0.5 rounded">
                              Rejeté
                            </span>
                          ) : (
                            <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                              row.statut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('conf') ||
                              row.statut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('clot') ||
                              row.statut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('real') ||
                              row.statut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('valide')
                                ? 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                                : 'text-amber-700 bg-amber-50 border border-amber-100'
                            }`}>
                              {row.statut}
                            </span>
                          )}
                        </td>

                        {/* Dimensionnement breakdown */}
                        <td className="p-3 text-[11px] text-slate-500 max-w-[180px] truncate" title={row.dimensionnement}>
                          {row.dimensionnement}
                        </td>

                        {/* DPS Hours */}
                        <td className="p-3 text-center font-mono text-slate-600">
                          {row.heuresDps}h
                        </td>

                        {/* DT Levy split value */}
                        <td className="p-3 text-right font-mono text-slate-650 font-medium">
                          {row.isIgnored ? '-' : `${row.prelevement} €`}
                        </td>

                        {/* Computed Volunteer Hours */}
                        <td className="p-3 text-right">
                          {row.isIgnored ? (
                            <span className="text-slate-400 font-mono">-</span>
                          ) : (
                            <div className="flex flex-col items-end">
                              <span className="font-mono font-bold text-rc-red">{row.heuresBenevolatCalculees} h</span>
                              <span className="text-[9px] text-slate-400">({row.secouristesEngages} secouristes)</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <p className="text-[10px] text-slate-400 italic">
              *Seuls les postes de secours confirmés ou clôturés (marqués "Confirmé", "Clôturé", etc.) et validés techniquement sont consolidés lors de l'injection.
            </p>
          </div>

          {/* Action trigger feedback */}
          {importStatus.type === 'success' && (
            <div
              className={`p-4 rounded-lg border flex items-start gap-3 transition-all bg-emerald-50 border-emerald-100 text-emerald-800`}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div className="text-xs">
                <p className="font-bold">Succès de l'analyse opérationnelle</p>
                <p className="mt-0.5 opacity-95 leading-relaxed">{importStatus.message}</p>
                <button
                  onClick={injectDpsDataIntoDashboard}
                  className="mt-2 text-xs text-rc-red font-extrabold hover:underline flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded border border-slate-250 shadow-2xs"
                >
                  Intégrer immédiatement ces données consolidées dans le dashboard Secourisme 2026 →
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
