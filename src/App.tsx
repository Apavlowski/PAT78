/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Printer,
  Sparkles,
  Calendar,
  Clock,
  Layers,
  Heart,
  ChevronRight,
  Shield,
  FileText,
  BadgeAlert,
  Trash2,
  Flame,
  X
} from 'lucide-react';
import { MetierType, MetierStats, StrategicGoal, ParsedDpsRow, ParsedDtDirectRow, ParsedReseauRow, ParsedUrgenceRow, ParsedFormationPublicRow, getYearFromDateString } from './types';
import { INITIAL_METIER_STATS, STRATEGIC_GOALS } from './data';
import { MetricCard } from './components/MetricCard';
import { ChartsView } from './components/ChartsView';
import { StrategicGoals } from './components/StrategicGoals';
import { ExcelManager } from './components/ExcelManager';
import { DpsLoader } from './components/DpsLoader';
import { DtDirectLoader } from './components/DtDirectLoader';
import { ReseauLoader } from './components/ReseauLoader';
import { UrgenceLoader } from './components/UrgenceLoader';
import { FormationLoader } from './components/FormationLoader';
import { DpsRegistryView } from './components/DpsRegistryView';
import { DtDirectRegistryView } from './components/DtDirectRegistryView';
import { ReseauRegistryView } from './components/ReseauRegistryView';
import { UrgenceRegistryView } from './components/UrgenceRegistryView';
import { FormationRegistryView } from './components/FormationRegistryView';
import { SocialActivitiesTeaser } from './components/SocialActivitiesTeaser';
import { DocumentationView } from './components/DocumentationView';

// Helper to check if a date fits into the YTD period (up to June 9th)
const isWithinYtdPeriod = (dateStr?: string) => {
  if (!dateStr) return true;
  const trimmed = dateStr.trim();
  let match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    if (month < 6) return true;
    if (month === 6 && day <= 9) return true;
    return false;
  }
  match = trimmed.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    if (month < 6) return true;
    if (month === 6 && day <= 9) return true;
    return false;
  }
  return true; // fallback
};

export default function App() {
  const [isDataErased, setIsDataErased] = useState<boolean>(() => {
    return localStorage.getItem('cr_is_data_erased') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('cr_is_data_erased', String(isDataErased));
  }, [isDataErased]);

  const [selectedMetier, setSelectedMetier] = useState<MetierType>(() => {
    const saved = localStorage.getItem('cr_selected_metier');
    return (saved as MetierType) || 'secourisme';
  });
  const [metierStats, setMetierStats] = useState<MetierStats[]>(() => {
    const saved = localStorage.getItem('cr_metier_stats');
    if (saved) {
      const parsed = JSON.parse(saved) as MetierStats[];
      return parsed.map(m => {
        const match = INITIAL_METIER_STATS.find(i => i.id === m.id);
        const title = match ? match.title : m.title;
        const description = match ? match.description : m.description;

        if (m.id === 'secourisme') {
          return {
            ...m,
            title,
            description,
            history: m.history.map(h => {
              if (h.year === 2024 && h.activitiesCount === 420) {
                return { ...h, activitiesCount: 0, volunteerHours: 0 };
              }
              if (h.year === 2025 && h.activitiesCount === 512) {
                return { ...h, activitiesCount: 0, volunteerHours: 0 };
              }
              return h;
            })
          };
        }
        return {
          ...m,
          title,
          description
        };
      });
    }
    return INITIAL_METIER_STATS;
  });
  const [strategicGoals, setStrategicGoals] = useState<StrategicGoal[]>(() => {
    const saved = localStorage.getItem('cr_strategic_goals');
    if (!saved) return STRATEGIC_GOALS;
    try {
      const parsed: StrategicGoal[] = JSON.parse(saved);
      const activeIds = parsed.map(g => g.id);
      const newIds = STRATEGIC_GOALS.map(g => g.id);
      const hasMismatch = newIds.some(id => !activeIds.includes(id)) || activeIds.some(id => !newIds.includes(id));
      if (hasMismatch) {
        localStorage.setItem('cr_strategic_goals', JSON.stringify(STRATEGIC_GOALS));
        return STRATEGIC_GOALS;
      }
      return parsed;
    } catch (e) {
      return STRATEGIC_GOALS;
    }
  });
  const [printNarrative, setPrintNarrative] = useState(() => {
    return localStorage.getItem('cr_print_narrative') || '';
  });
  const [isSummarizerOpen, setIsSummarizerOpen] = useState(false);
  const [compareYtd, setCompareYtd] = useState<boolean>(() => {
    return localStorage.getItem('cr_compare_ytd') !== 'false'; // true by default!
  });
  const [selectedAnalysisYear, setSelectedAnalysisYear] = useState<number>(() => {
    const saved = localStorage.getItem('cr_selected_analysis_year');
    return saved ? parseInt(saved, 10) : 2026;
  });
  useEffect(() => {
    localStorage.setItem('cr_selected_analysis_year', String(selectedAnalysisYear));
  }, [selectedAnalysisYear]);
  const [activeImportTab, setActiveImportTab] = useState<'dps' | 'dt_direct' | 'reseau' | 'urgence' | 'formation' | 'annual'>(() => {
    const saved = localStorage.getItem('cr_active_import_tab');
    return (saved as any) || 'dps';
  });
  
  // Shared registry state for detailed DPS loader entries
  const [dpsRows, setDpsRows] = useState<ParsedDpsRow[] | null>(() => {
    const saved = localStorage.getItem('cr_dps_rows');
    return saved ? JSON.parse(saved) : null;
  });
  const [dpsFileName, setDpsFileName] = useState<string>(() => {
    return localStorage.getItem('cr_dps_file_name') || '';
  });
  const [dpsImportStatus, setDpsImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>(() => {
    const saved = localStorage.getItem('cr_dps_import_status');
    return saved ? JSON.parse(saved) : { type: null, message: '' };
  });
  const [isDpsRegistryViewOpen, setIsDpsRegistryViewOpen] = useState(false);
  const [isDtDirectRegistryViewOpen, setIsDtDirectRegistryViewOpen] = useState(false);
  const [isReseauRegistryViewOpen, setIsReseauRegistryViewOpen] = useState(false);
  const [isIntegrationOpen, setIsIntegrationOpen] = useState(false);
  const [isDocumentationOpen, setIsDocumentationOpen] = useState(false);

  // Shared state for DT Direct loader entries
  const [dtDirectRows, setDtDirectRows] = useState<ParsedDtDirectRow[] | null>(() => {
    const saved = localStorage.getItem('cr_dt_direct_rows');
    return saved ? JSON.parse(saved) : null;
  });
  const [dtDirectFileName, setDtDirectFileName] = useState<string>(() => {
    return localStorage.getItem('cr_dt_direct_file_name') || '';
  });
  const [dtDirectImportStatus, setDtDirectImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>(() => {
    const saved = localStorage.getItem('cr_dt_direct_import_status');
    return saved ? JSON.parse(saved) : { type: null, message: '' };
  });

  // Shared state for Reseau (Garde SDIS) entries
  const [reseauRows, setReseauRows] = useState<ParsedReseauRow[] | null>(() => {
    const saved = localStorage.getItem('cr_reseau_rows');
    return saved ? JSON.parse(saved) : null;
  });
  const [reseauFileName, setReseauFileName] = useState<string>(() => {
    return localStorage.getItem('cr_reseau_file_name') || '';
  });
  const [reseauImportStatus, setReseauImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>(() => {
    const saved = localStorage.getItem('cr_reseau_import_status');
    return saved ? JSON.parse(saved) : { type: null, message: '' };
  });

  // Shared state for Urgence entries
  const [urgenceRows, setUrgenceRows] = useState<ParsedUrgenceRow[] | null>(() => {
    const saved = localStorage.getItem('cr_urgence_rows');
    return saved ? JSON.parse(saved) : null;
  });
  const [urgenceFileName, setUrgenceFileName] = useState<string>(() => {
    return localStorage.getItem('cr_urgence_file_name') || '';
  });
  const [urgenceImportStatus, setUrgenceImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>(() => {
    const saved = localStorage.getItem('cr_urgence_import_status');
    return saved ? JSON.parse(saved) : { type: null, message: '' };
  });

  const [isUrgenceRegistryViewOpen, setIsUrgenceRegistryViewOpen] = useState(false);

  // Shared state for Formation entries
  const [formationRows, setFormationRows] = useState<ParsedFormationPublicRow[] | null>(() => {
    const saved = localStorage.getItem('cr_formation_rows');
    return saved ? JSON.parse(saved) : null;
  });
  const [formationFileName, setFormationFileName] = useState<string>(() => {
    return localStorage.getItem('cr_formation_file_name') || '';
  });
  const [formationImportStatus, setFormationImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>(() => {
    const saved = localStorage.getItem('cr_formation_import_status');
    return saved ? JSON.parse(saved) : { type: null, message: '' };
  });

  const [isFormationRegistryViewOpen, setIsFormationRegistryViewOpen] = useState(false);

  // Local drafted loading workflow state (before confirmation)
  const [dpsDraftRows, setDpsDraftRows] = useState<ParsedDpsRow[] | null>(null);
  const [dpsDraftFileName, setDpsDraftFileName] = useState<string>('');
  const [dpsDraftImportStatus, setDpsDraftImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const [dtDirectDraftRows, setDtDirectDraftRows] = useState<ParsedDtDirectRow[] | null>(null);
  const [dtDirectDraftFileName, setDtDirectDraftFileName] = useState<string>('');
  const [dtDirectDraftImportStatus, setDtDirectDraftImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const [reseauDraftRows, setReseauDraftRows] = useState<ParsedReseauRow[] | null>(null);
  const [reseauDraftFileName, setReseauDraftFileName] = useState<string>('');
  const [reseauDraftImportStatus, setReseauDraftImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const [urgenceDraftRows, setUrgenceDraftRows] = useState<ParsedUrgenceRow[] | null>(null);
  const [urgenceDraftFileName, setUrgenceDraftFileName] = useState<string>('');
  const [urgenceDraftImportStatus, setUrgenceDraftImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const [formationDraftRows, setFormationDraftRows] = useState<ParsedFormationPublicRow[] | null>(null);
  const [formationDraftFileName, setFormationDraftFileName] = useState<string>('');
  const [formationDraftImportStatus, setFormationDraftImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  // Callbacks to commit injected draft files to the official suivis / registries
  const handleInjectDpsInRegistry = (rows: ParsedDpsRow[], file: string) => {
    let updatedCount = 0;
    let addedCount = 0;

    setDpsRows(prev => {
      if (!prev || prev.length === 0) {
        addedCount = rows.length;
        return rows;
      }
      const merged = [...prev];
      rows.forEach(newRow => {
        const newDate = newRow.debut ? newRow.debut.substring(0, 10) : '';
        const existingIdx = merged.findIndex(existing => {
          const existingDate = existing.debut ? existing.debut.substring(0, 10) : '';
          return (
            existing.manifestation.trim().toLowerCase() === newRow.manifestation.trim().toLowerCase() &&
            existingDate === newDate &&
            existing.ul.trim().toLowerCase() === newRow.ul.trim().toLowerCase()
          );
        });

        if (existingIdx !== -1) {
          // Update clinical care statistics & outcomes
          merged[existingIdx] = {
            ...merged[existingIdx],
            nbSoins: newRow.nbSoins,
            nbEvac: newRow.nbEvac,
            nbTrauma: newRow.nbTrauma,
            nbMalaise: newRow.nbMalaise,
            nbInconscient: newRow.nbInconscient,
            nbAcr: newRow.nbAcr,
            medicalise: newRow.medicalise,
            // also update administrative if changed
            statut: newRow.statut,
            dimensionnement: newRow.dimensionnement,
            heuresDps: newRow.heuresDps,
            prelevement: newRow.prelevement,
            tarifTheorique: newRow.tarifTheorique,
            secouristesEngages: newRow.secouristesEngages,
            evac: newRow.evac,
            heuresBenevolatCalculees: newRow.heuresBenevolatCalculees,
          };
          updatedCount++;
        } else {
          merged.push(newRow);
          addedCount++;
        }
      });
      return merged;
    });

    setDpsFileName(file);
    setDpsImportStatus({
      type: 'success',
      message: `Injection opérationnelle réussie ! ${addedCount} nouveaux postes de secours intégrés, ${updatedCount} postes existants mis à jour (prises en charge et bilans cliniques).`
    });
  };

  const handleInjectDtDirectInRegistry = (rows: ParsedDtDirectRow[], file: string) => {
    let updatedCount = 0;
    let addedCount = 0;

    setDtDirectRows(prev => {
      if (!prev || prev.length === 0) {
        addedCount = rows.length;
        return rows;
      }
      const merged = [...prev];
      rows.forEach(newRow => {
        const existingIdx = merged.findIndex(existing => 
          existing.label.trim().toLowerCase() === newRow.label.trim().toLowerCase() &&
          existing.date === newRow.date
        );

        if (existingIdx !== -1) {
          // Update clinical care statistics & outcomes
          merged[existingIdx] = {
            ...merged[existingIdx],
            nbSoins: newRow.nbSoins,
            nbDecharge: newRow.nbDecharge,
            nbEvac: newRow.nbEvac,
            nbAutre: newRow.nbAutre,
            nbPetitsSoins: newRow.nbPetitsSoins,
            nbTrauma: newRow.nbTrauma,
            nbMalaise: newRow.nbMalaise,
            nbInconscient: newRow.nbInconscient,
            nbAcr: newRow.nbAcr,
            isMedicalise: newRow.isMedicalise,
            devisCrss: newRow.devisCrss,
            // other details
            duree: newRow.duree,
            nbSecouristes: newRow.nbSecouristes,
            devisSecours: newRow.devisSecours,
            reversementUl: newRow.reversementUl,
            repas: newRow.repas,
            caNet: newRow.caNet,
            nbVacations4h: newRow.nbVacations4h,
            gainDt: newRow.gainDt,
          };
          updatedCount++;
        } else {
          merged.push(newRow);
          addedCount++;
        }
      });
      return merged;
    });

    setDtDirectFileName(file);
    setDtDirectImportStatus({
      type: 'success',
      message: `Injection opérationnelle réussie ! ${addedCount} nouveaux postes directs DT intégrés, ${updatedCount} postes existants mis à jour (prises en charge et bilans cliniques).`
    });
  };

  const handleInjectReseauInRegistry = (rows: ParsedReseauRow[], file: string) => {
    let updatedCount = 0;
    let addedCount = 0;

    setReseauRows(prev => {
      if (!prev || prev.length === 0) {
        addedCount = rows.length;
        return rows;
      }
      const merged = [...prev];
      rows.forEach(newRow => {
        const existingIdx = merged.findIndex(existing => existing.date === newRow.date);
        if (existingIdx !== -1) {
          merged[existingIdx] = {
            ...merged[existingIdx],
            duree: newRow.duree,
            secouristesEngages: newRow.secouristesEngages,
            heuresBenevolat: newRow.heuresBenevolat,
          };
          updatedCount++;
        } else {
          merged.push(newRow);
          addedCount++;
        }
      });
      return merged;
    });

    setReseauFileName(file);
    setReseauImportStatus({
      type: 'success',
      message: `Injection opérationnelle réussie ! ${addedCount} nouvelles gardes intégrées, ${updatedCount} gardes réseau sdis existantes mises à jour.`
    });
  };

  const handleInjectUrgenceInRegistry = (rows: ParsedUrgenceRow[], file: string) => {
    let updatedCount = 0;
    let addedCount = 0;

    setUrgenceRows(prev => {
      if (!prev || prev.length === 0) {
        addedCount = rows.length;
        return rows;
      }
      const merged = [...prev];
      rows.forEach(newRow => {
        const existingIdx = merged.findIndex(existing => 
          existing.dateDebut === newRow.dateDebut && 
          existing.contexteDescription === newRow.contexteDescription
        );
        if (existingIdx !== -1) {
          merged[existingIdx] = {
            ...merged[existingIdx],
            dateFin: newRow.dateFin,
            agrementMobilise: newRow.agrementMobilise,
            raisons: newRow.raisons,
            zoneAction: newRow.zoneAction,
            appelCo: newRow.appelCo,
            integreBa: newRow.integreBa,
            nbPriseEnCharge: newRow.nbPriseEnCharge,
            moyensHumains: newRow.moyensHumains,
            moyensMateriel: newRow.moyensMateriel,
            heuresBenevolat: newRow.heuresBenevolat,
          };
          updatedCount++;
        } else {
          merged.push(newRow);
          addedCount++;
        }
      });
      return merged;
    });

    setUrgenceFileName(file);
    setUrgenceImportStatus({
      type: 'success',
      message: `La fusion des interventions d'urgence a été opérée ! ${addedCount} nouvelles missions enregistrées et ${updatedCount} doublons consolidés.`
    });
  };

  const handleInjectFormationInRegistry = (rows: ParsedFormationPublicRow[], file: string) => {
    let updatedCount = 0;
    let addedCount = 0;

    setFormationRows(prev => {
      if (!prev || prev.length === 0) {
        addedCount = rows.length;
        return rows;
      }
      const merged = [...prev];
      rows.forEach(newRow => {
        const existingIdx = merged.findIndex(existing => 
          existing.ul.toLowerCase() === newRow.ul.toLowerCase() && 
          existing.year === newRow.year
        );
        if (existingIdx !== -1) {
          merged[existingIdx] = newRow;
          updatedCount++;
        } else {
          merged.push(newRow);
          addedCount++;
        }
      });
      return merged;
    });

    setFormationFileName(file);
    setFormationImportStatus({
      type: 'success',
      message: `La fusion des bilans de formation locale a été opérée ! ${addedCount} structures enregistrées et ${updatedCount} doublons consolidés.`
    });
  };

  // Dynamic consolidation of Formation statistics YoY
  const consolidatedFormationStatsByYear = useMemo(() => {
    const yearsData: {
      [year: number]: {
        activitiesCount: number;
        volunteerHours: number;
        epscSe: number; epscSt: number; epscHe: number;
        pscSe: number; pscSt: number; pscHe: number;
        ipsenSe: number; ipsenSt: number; ipsenHe: number;
        gqsSe: number; gqsSt: number; gqsHe: number;
        recyclageSe: number; recyclageSt: number; recyclageHe: number;
        rows: ParsedFormationPublicRow[];
      }
    } = {};

    [2024, 2025, 2026].forEach(yr => {
      yearsData[yr] = {
        activitiesCount: 0,
        volunteerHours: 0,
        epscSe: 0, epscSt: 0, epscHe: 0,
        pscSe: 0, pscSt: 0, pscHe: 0,
        ipsenSe: 0, ipsenSt: 0, ipsenHe: 0,
        gqsSe: 0, gqsSt: 0, gqsHe: 0,
        recyclageSe: 0, recyclageSt: 0, recyclageHe: 0,
        rows: []
      };
    });

    const activeRows = formationRows ? formationRows : [];

    activeRows.forEach(r => {
      const yr = r.year;
      if (!yearsData[yr]) {
        yearsData[yr] = {
          activitiesCount: 0,
          volunteerHours: 0,
          epscSe: 0, epscSt: 0, epscHe: 0,
          pscSe: 0, pscSt: 0, pscHe: 0,
          ipsenSe: 0, ipsenSt: 0, ipsenHe: 0,
          gqsSe: 0, gqsSt: 0, gqsHe: 0,
          recyclageSe: 0, recyclageSt: 0, recyclageHe: 0,
          rows: []
        };
      }
      yearsData[yr].rows.push(r);
      
      const totalSe = r.epscSessions + r.pscSessions + r.ipsenSessions + r.gqsSessions + r.recyclageSessions;
      const totalHe = r.epscHeures + r.pscHeures + r.ipsenHeures + r.gqsHeures + r.recyclageHeures;

      const scaleMultiplier = compareYtd ? 0.44 : 1.0;

      yearsData[yr].activitiesCount += Math.round(totalSe * scaleMultiplier);
      yearsData[yr].volunteerHours += Math.round(totalHe * scaleMultiplier);

      yearsData[yr].epscSe += Math.round(r.epscSessions * scaleMultiplier);
      yearsData[yr].epscSt += Math.round(r.epscStagiaires * scaleMultiplier);
      yearsData[yr].epscHe += Math.round(r.epscHeures * scaleMultiplier);

      yearsData[yr].pscSe += Math.round(r.pscSessions * scaleMultiplier);
      yearsData[yr].pscSt += Math.round(r.pscStagiaires * scaleMultiplier);
      yearsData[yr].pscHe += Math.round(r.pscHeures * scaleMultiplier);

      yearsData[yr].ipsenSe += Math.round(r.ipsenSessions * scaleMultiplier);
      yearsData[yr].ipsenSt += Math.round(r.ipsenStagiaires * scaleMultiplier);
      yearsData[yr].ipsenHe += Math.round(r.ipsenHeures * scaleMultiplier);

      yearsData[yr].gqsSe += Math.round(r.gqsSessions * scaleMultiplier);
      yearsData[yr].gqsSt += Math.round(r.gqsStagiaires * scaleMultiplier);
      yearsData[yr].gqsHe += Math.round(r.gqsHeures * scaleMultiplier);

      yearsData[yr].recyclageSe += Math.round(r.recyclageSessions * scaleMultiplier);
      yearsData[yr].recyclageSt += Math.round(r.recyclageStagiaires * scaleMultiplier);
      yearsData[yr].recyclageHe += Math.round(r.recyclageHeures * scaleMultiplier);
    });

    return yearsData;
  }, [formationRows, compareYtd]);

  // Synchronized robust consolidation helper grouped by Year for Secourisme stats
  const consolidatedStatsByYear = useMemo(() => {
    const yearsData: {
      [year: number]: {
        activitiesCount: number;
        volunteerHours: number;
        activeDps: ParsedDpsRow[];
        dtHrs: number;
        dtCount: number;
        reseauHrs: number;
        reseauCount: number;
      }
    } = {};

    const getYearFromDate = (dateStr?: string) => {
      return getYearFromDateString(dateStr);
    };

    // Initialize default structures for 2024, 2025, 2026 to ensure they always exist in compilation
    [2024, 2025, 2026].forEach(yr => {
      yearsData[yr] = {
        activitiesCount: 0,
        volunteerHours: 0,
        activeDps: [],
        dtHrs: 0,
        dtCount: 0,
        reseauHrs: 0,
        reseauCount: 0
      };
    });

    // 1. Calculate active local DPS (ignore = false, statut includes "confirme", "cloture", "realise" or "valide")
    const activeDps = dpsRows ? dpsRows.filter(r => {
      if (r.isIgnored) return false;
      const s = r.statut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const isConfirmed = s.includes('confirme') || s.includes('cloture') || s.includes('realise') || s.includes('valide');
      if (!isConfirmed) return false;
      if (compareYtd) {
        return isWithinYtdPeriod(r.debut);
      }
      return true;
    }) : [];

    activeDps.forEach(r => {
      const yr = getYearFromDate(r.debut);
      if (!yearsData[yr]) {
        yearsData[yr] = { activitiesCount: 0, volunteerHours: 0, activeDps: [], dtHrs: 0, dtCount: 0, reseauHrs: 0, reseauCount: 0 };
      }
      yearsData[yr].activeDps.push(r);
      yearsData[yr].activitiesCount++;
      yearsData[yr].volunteerHours += Math.round(r.heuresBenevolatCalculees);
    });

    // 2. Calculate DT Direct
    const activeDt = dtDirectRows ? dtDirectRows.filter(r => {
      if (compareYtd) {
        return isWithinYtdPeriod(r.date);
      }
      return true;
    }) : [];

    activeDt.forEach(r => {
      const yr = getYearFromDate(r.date);
      if (!yearsData[yr]) {
        yearsData[yr] = { activitiesCount: 0, volunteerHours: 0, activeDps: [], dtHrs: 0, dtCount: 0, reseauHrs: 0, reseauCount: 0 };
      }
      yearsData[yr].dtCount++;
      yearsData[yr].dtHrs += Math.round(r.duree * r.nbSecouristes);
      yearsData[yr].activitiesCount++;
      yearsData[yr].volunteerHours += Math.round(r.duree * r.nbSecouristes);
    });

    // 3. Calculate Reseau / Gardes SDIS
    const activeReseau = reseauRows ? reseauRows.filter(r => {
      if (compareYtd) {
        return isWithinYtdPeriod(r.date);
      }
      return true;
    }) : [];

    activeReseau.forEach(r => {
      const yr = getYearFromDate(r.date);
      if (!yearsData[yr]) {
        yearsData[yr] = { activitiesCount: 0, volunteerHours: 0, activeDps: [], dtHrs: 0, dtCount: 0, reseauHrs: 0, reseauCount: 0 };
      }
      yearsData[yr].reseauCount++;
      yearsData[yr].reseauHrs += Math.round(r.heuresBenevolat);
      yearsData[yr].activitiesCount++;
      yearsData[yr].volunteerHours += Math.round(r.heuresBenevolat);
    });

    return yearsData;
  }, [dpsRows, dtDirectRows, reseauRows, compareYtd]);

  const consolidatedUrgenceStatsByYear = useMemo(() => {
    const yearsData: {
      [year: number]: {
        activitiesCount: number;
        volunteerHours: number;
        rows: ParsedUrgenceRow[];
      }
    } = {};

    const getYearFromDate = (dateStr?: string) => {
      return getYearFromDateString(dateStr);
    };

    [2024, 2025, 2026].forEach(yr => {
      yearsData[yr] = {
        activitiesCount: 0,
        volunteerHours: 0,
        rows: []
      };
    });

    const activeRows = urgenceRows ? urgenceRows : [];

    activeRows.forEach(r => {
      if (compareYtd && !isWithinYtdPeriod(r.dateDebut)) {
        return;
      }
      const yr = getYearFromDate(r.dateDebut);
      if (!yearsData[yr]) {
        yearsData[yr] = { activitiesCount: 0, volunteerHours: 0, rows: [] };
      }
      yearsData[yr].rows.push(r);
      yearsData[yr].activitiesCount++;
      yearsData[yr].volunteerHours += Math.round(r.heuresBenevolat || 0);
    });

    return yearsData;
  }, [urgenceRows, compareYtd]);

  // 1. Formation stats - always YTD
  const ytdConsolidatedFormationStatsByYear = useMemo(() => {
    const yearsData: {
      [year: number]: {
        activitiesCount: number;
        volunteerHours: number;
        epscSe: number; epscSt: number; epscHe: number;
        pscSe: number; pscSt: number; pscHe: number;
        ipsenSe: number; ipsenSt: number; ipsenHe: number;
        gqsSe: number; gqsSt: number; gqsHe: number;
        recyclageSe: number; recyclageSt: number; recyclageHe: number;
        rows: ParsedFormationPublicRow[];
      }
    } = {};

    [2024, 2025, 2026].forEach(yr => {
      yearsData[yr] = {
        activitiesCount: 0,
        volunteerHours: 0,
        epscSe: 0, epscSt: 0, epscHe: 0,
        pscSe: 0, pscSt: 0, pscHe: 0,
        ipsenSe: 0, ipsenSt: 0, ipsenHe: 0,
        gqsSe: 0, gqsSt: 0, gqsHe: 0,
        recyclageSe: 0, recyclageSt: 0, recyclageHe: 0,
        rows: []
      };
    });

    const activeRows = formationRows ? formationRows : [];

    activeRows.forEach(r => {
      const yr = r.year;
      if (!yearsData[yr]) {
        yearsData[yr] = {
          activitiesCount: 0,
          volunteerHours: 0,
          epscSe: 0, epscSt: 0, epscHe: 0,
          pscSe: 0, pscSt: 0, pscHe: 0,
          ipsenSe: 0, ipsenSt: 0, ipsenHe: 0,
          gqsSe: 0, gqsSt: 0, gqsHe: 0,
          recyclageSe: 0, recyclageSt: 0, recyclageHe: 0,
          rows: []
        };
      }
      yearsData[yr].rows.push(r);
      
      const totalSe = r.epscSessions + r.pscSessions + r.ipsenSessions + r.gqsSessions + r.recyclageSessions;
      const totalHe = r.epscHeures + r.pscHeures + r.ipsenHeures + r.gqsHeures + r.recyclageHeures;

      const scaleMultiplier = 0.44;

      yearsData[yr].activitiesCount += Math.round(totalSe * scaleMultiplier);
      yearsData[yr].volunteerHours += Math.round(totalHe * scaleMultiplier);

      yearsData[yr].epscSe += Math.round(r.epscSessions * scaleMultiplier);
      yearsData[yr].epscSt += Math.round(r.epscStagiaires * scaleMultiplier);
      yearsData[yr].epscHe += Math.round(r.epscHeures * scaleMultiplier);

      yearsData[yr].pscSe += Math.round(r.pscSessions * scaleMultiplier);
      yearsData[yr].pscSt += Math.round(r.pscStagiaires * scaleMultiplier);
      yearsData[yr].pscHe += Math.round(r.pscHeures * scaleMultiplier);

      yearsData[yr].ipsenSe += Math.round(r.ipsenSessions * scaleMultiplier);
      yearsData[yr].ipsenSt += Math.round(r.ipsenStagiaires * scaleMultiplier);
      yearsData[yr].ipsenHe += Math.round(r.ipsenHeures * scaleMultiplier);

      yearsData[yr].gqsSe += Math.round(r.gqsSessions * scaleMultiplier);
      yearsData[yr].gqsSt += Math.round(r.gqsStagiaires * scaleMultiplier);
      yearsData[yr].gqsHe += Math.round(r.gqsHeures * scaleMultiplier);

      yearsData[yr].recyclageSe += Math.round(r.recyclageSessions * scaleMultiplier);
      yearsData[yr].recyclageSt += Math.round(r.recyclageStagiaires * scaleMultiplier);
      yearsData[yr].recyclageHe += Math.round(r.recyclageHeures * scaleMultiplier);
    });

    return yearsData;
  }, [formationRows]);

  // 2. Secourisme stats - always YTD
  const ytdConsolidatedStatsByYear = useMemo(() => {
    const yearsData: {
      [year: number]: {
        activitiesCount: number;
        volunteerHours: number;
        activeDps: ParsedDpsRow[];
        dtHrs: number;
        dtCount: number;
        reseauHrs: number;
        reseauCount: number;
      }
    } = {};

    const getYearFromDate = (dateStr?: string) => {
      return getYearFromDateString(dateStr);
    };

    [2024, 2025, 2026].forEach(yr => {
      yearsData[yr] = {
        activitiesCount: 0,
        volunteerHours: 0,
        activeDps: [],
        dtHrs: 0,
        dtCount: 0,
        reseauHrs: 0,
        reseauCount: 0
      };
    });

    const activeDps = dpsRows ? dpsRows.filter(r => {
      if (r.isIgnored) return false;
      const s = r.statut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const isConfirmed = s.includes('confirme') || s.includes('cloture') || s.includes('realise') || s.includes('valide');
      if (!isConfirmed) return false;
      return isWithinYtdPeriod(r.debut);
    }) : [];

    activeDps.forEach(r => {
      const yr = getYearFromDate(r.debut);
      if (!yearsData[yr]) {
        yearsData[yr] = { activitiesCount: 0, volunteerHours: 0, activeDps: [], dtHrs: 0, dtCount: 0, reseauHrs: 0, reseauCount: 0 };
      }
      yearsData[yr].activeDps.push(r);
      yearsData[yr].activitiesCount++;
      yearsData[yr].volunteerHours += Math.round(r.heuresBenevolatCalculees);
    });

    const activeDt = dtDirectRows ? dtDirectRows.filter(r => {
      return isWithinYtdPeriod(r.date);
    }) : [];

    activeDt.forEach(r => {
      const yr = getYearFromDate(r.date);
      if (!yearsData[yr]) {
        yearsData[yr] = { activitiesCount: 0, volunteerHours: 0, activeDps: [], dtHrs: 0, dtCount: 0, reseauHrs: 0, reseauCount: 0 };
      }
      yearsData[yr].dtCount++;
      yearsData[yr].dtHrs += Math.round(r.duree * r.nbSecouristes);
      yearsData[yr].activitiesCount++;
      yearsData[yr].volunteerHours += Math.round(r.duree * r.nbSecouristes);
    });

    const activeReseau = reseauRows ? reseauRows.filter(r => {
      return isWithinYtdPeriod(r.date);
    }) : [];

    activeReseau.forEach(r => {
      const yr = getYearFromDate(r.date);
      if (!yearsData[yr]) {
        yearsData[yr] = { activitiesCount: 0, volunteerHours: 0, activeDps: [], dtHrs: 0, dtCount: 0, reseauHrs: 0, reseauCount: 0 };
      }
      yearsData[yr].reseauCount++;
      yearsData[yr].reseauHrs += Math.round(r.heuresBenevolat);
      yearsData[yr].activitiesCount++;
      yearsData[yr].volunteerHours += Math.round(r.heuresBenevolat);
    });

    return yearsData;
  }, [dpsRows, dtDirectRows, reseauRows]);

  // 3. Urgence stats - always YTD
  const ytdConsolidatedUrgenceStatsByYear = useMemo(() => {
    const yearsData: {
      [year: number]: {
        activitiesCount: number;
        volunteerHours: number;
        rows: ParsedUrgenceRow[];
      }
    } = {};

    const getYearFromDate = (dateStr?: string) => {
      return getYearFromDateString(dateStr);
    };

    [2024, 2025, 2026].forEach(yr => {
      yearsData[yr] = {
        activitiesCount: 0,
        volunteerHours: 0,
        rows: []
      };
    });

    const activeRows = urgenceRows ? urgenceRows : [];

    activeRows.forEach(r => {
      if (!isWithinYtdPeriod(r.dateDebut)) {
        return;
      }
      const yr = getYearFromDate(r.dateDebut);
      if (!yearsData[yr]) {
        yearsData[yr] = { activitiesCount: 0, volunteerHours: 0, rows: [] };
      }
      yearsData[yr].rows.push(r);
      yearsData[yr].activitiesCount++;
      yearsData[yr].volunteerHours += Math.round(r.heuresBenevolat || 0);
    });

    return yearsData;
  }, [urgenceRows]);

  // Always-YTD metier stats for the top indicators of the domain cards
  const ytdMetierStats = useMemo(() => {
    const updated = JSON.parse(JSON.stringify(INITIAL_METIER_STATS)) as MetierStats[];
    
    // a. Secourisme
    const secourismeObj = updated.find(m => m.id === 'secourisme');
    if (secourismeObj) {
      const baselines: { [year: number]: { activitiesCount: number; volunteerHours: number } } = {
        2024: { activitiesCount: 0, volunteerHours: 0 },
        2025: { activitiesCount: 0, volunteerHours: 0 },
        2026: { activitiesCount: 0, volunteerHours: 0 }
      };

      const yearsToHandle = [2024, 2025, 2026];

      yearsToHandle.forEach(yr => {
        const yrData = ytdConsolidatedStatsByYear[yr];
        const histEntry = secourismeObj.history.find(h => h.year === yr);
        const hasImportedData = yrData && (yrData.activitiesCount > 0 || yrData.volunteerHours > 0 || yrData.activeDps.length > 0);

        if (histEntry) {
          if (hasImportedData) {
            histEntry.activitiesCount = yrData.activitiesCount;
            histEntry.volunteerHours = yrData.volunteerHours;
          } else {
            histEntry.activitiesCount = baselines[yr].activitiesCount;
            histEntry.volunteerHours = baselines[yr].volunteerHours;
          }
        } else if (hasImportedData) {
          secourismeObj.history.push({
            year: yr,
            activitiesCount: yrData.activitiesCount,
            volunteerHours: yrData.volunteerHours
          });
        }
      });

      secourismeObj.history.sort((a, b) => a.year - b.year);

      const yrData2026 = ytdConsolidatedStatsByYear[2026] || { activeDps: [], dtCount: 0, dtHrs: 0, reseauCount: 0, reseauHrs: 0 };
      const newBreakdown: { name: string; count: number; hours: number }[] = [];

      const sortedDps = [...yrData2026.activeDps]
        .sort((a, b) => b.heuresBenevolatCalculees - a.heuresBenevolatCalculees);
      
      sortedDps.slice(0, 3).forEach(m => {
        newBreakdown.push({
          name: `${m.manifestation} (${m.ul})`,
          count: 1,
          hours: Math.round(m.heuresBenevolatCalculees)
        });
      });

      if (sortedDps.length > 3) {
        const otherDps = sortedDps.slice(3);
        const otherHrs = otherDps.reduce((sum, row) => sum + row.heuresBenevolatCalculees, 0);
        newBreakdown.push({
          name: `Autres postes consolidés (${otherDps.length} DPS)`,
          count: otherDps.length,
          hours: Math.round(otherHrs)
        });
      }

      if (yrData2026.dtCount > 0) {
        newBreakdown.push({
          name: `Postes direct DT (${yrData2026.dtCount} DPS)`,
          count: yrData2026.dtCount,
          hours: yrData2026.dtHrs
        });
      }

      if (yrData2026.reseauCount > 0) {
        newBreakdown.push({
          name: `Réseau : Gardes SDIS Versailles (${yrData2026.reseauCount} gardes)`,
          count: yrData2026.reseauCount,
          hours: yrData2026.reseauHrs
        });
      }

      secourismeObj.breakdown2026 = newBreakdown.slice(0, 6);
    }

    // b. Urgence
    const urgenceObj = updated.find(m => m.id === 'urgence');
    if (urgenceObj) {
      const urgenceBaselines: { [year: number]: { activitiesCount: number; volunteerHours: number } } = {
        2024: { activitiesCount: 0, volunteerHours: 0 },
        2025: { 
          activitiesCount: isDataErased ? 0 : Math.round(64 * 0.44), 
          volunteerHours: isDataErased ? 0 : Math.round(5400 * 0.44)
        },
        2026: { 
          activitiesCount: isDataErased ? 0 : Math.round(78 * 0.44), 
          volunteerHours: isDataErased ? 0 : Math.round(7200 * 0.44)
        }
      };

      const yearsToHandleUrgence = [2024, 2025, 2026];
      yearsToHandleUrgence.forEach(yr => {
        const yrDataU = ytdConsolidatedUrgenceStatsByYear[yr];
        const histEntryU = urgenceObj.history.find(h => h.year === yr);
        const hasImportedDataU = yrDataU && yrDataU.rows.length > 0;

        if (histEntryU) {
          if (hasImportedDataU) {
            histEntryU.activitiesCount = yrDataU.activitiesCount;
            histEntryU.volunteerHours = yrDataU.volunteerHours;
          } else {
            histEntryU.activitiesCount = urgenceBaselines[yr].activitiesCount;
            histEntryU.volunteerHours = urgenceBaselines[yr].volunteerHours;
          }
        } else if (hasImportedDataU) {
          urgenceObj.history.push({
            year: yr,
            activitiesCount: yrDataU.activitiesCount,
            volunteerHours: yrDataU.volunteerHours
          });
        }
      });

      urgenceObj.history.sort((a, b) => a.year - b.year);

      const yrData2026U = ytdConsolidatedUrgenceStatsByYear[2026] || { rows: [] };
      if (yrData2026U.rows.length > 0) {
        const newBreakdownU: { name: string; count: number; hours: number }[] = [];
        yrData2026U.rows.slice(0, 5).forEach(r => {
          newBreakdownU.push({
            name: r.contexteDescription.length > 45 ? `${r.contexteDescription.substring(0, 45)}...` : r.contexteDescription,
            count: 1,
            hours: r.heuresBenevolat
          });
        });
        urgenceObj.breakdown2026 = newBreakdownU;
      } else {
        const defaultUrgence = INITIAL_METIER_STATS.find(m => m.id === 'urgence');
        if (defaultUrgence) {
          urgenceObj.breakdown2026 = isDataErased ? [] : JSON.parse(JSON.stringify(defaultUrgence.breakdown2026)).map((item: any) => ({
            ...item,
            count: Math.round(item.count * 0.44) || 1,
            hours: Math.round(item.hours * 0.44)
          }));
        }
      }
    }

    // c. Formation
    const formationObj = updated.find(m => m.id === 'formation');
    if (formationObj) {
      const formationBaselines: { [year: number]: { activitiesCount: number; volunteerHours: number } } = {
        2024: { 
          activitiesCount: isDataErased ? 0 : Math.round(210 * 0.44), 
          volunteerHours: isDataErased ? 0 : Math.round(6800 * 0.44)
        },
        2025: { 
          activitiesCount: isDataErased ? 0 : Math.round(235 * 0.44), 
          volunteerHours: isDataErased ? 0 : Math.round(7900 * 0.44)
        },
        2026: { 
          activitiesCount: isDataErased ? 0 : Math.round(260 * 0.44), 
          volunteerHours: isDataErased ? 0 : Math.round(9100 * 0.44)
        }
      };

      const yearsToHandleFormation = [2024, 2025, 2026];
      yearsToHandleFormation.forEach(yr => {
        const yrDataF = ytdConsolidatedFormationStatsByYear[yr];
        const histEntryF = formationObj.history.find(h => h.year === yr);
        const hasImportedDataF = yrDataF && yrDataF.rows.length > 0;

        if (histEntryF) {
          if (hasImportedDataF) {
            histEntryF.activitiesCount = yrDataF.activitiesCount;
            histEntryF.volunteerHours = yrDataF.volunteerHours;
          } else {
            histEntryF.activitiesCount = formationBaselines[yr].activitiesCount;
            histEntryF.volunteerHours = formationBaselines[yr].volunteerHours;
          }
        } else if (hasImportedDataF) {
          formationObj.history.push({
            year: yr,
            activitiesCount: yrDataF.activitiesCount,
            volunteerHours: yrDataF.volunteerHours
          });
        }
      });

      formationObj.history.sort((a, b) => a.year - b.year);

      const yrDataActiveF = ytdConsolidatedFormationStatsByYear[selectedAnalysisYear] || { rows: [] };
      if (yrDataActiveF.rows.length > 0) {
        const newBreakdownF: { name: string; count: number; hours: number }[] = [];
        if (yrDataActiveF.epscSe > 0 || yrDataActiveF.epscHe > 0) {
          newBreakdownF.push({ name: 'ePSC (Mixte / eLearning)', count: yrDataActiveF.epscSe, hours: Math.round(yrDataActiveF.epscHe) });
        }
        if (yrDataActiveF.pscSe > 0 || yrDataActiveF.pscHe > 0) {
          newBreakdownF.push({ name: 'PSC1 (Prévention & Secours)', count: yrDataActiveF.pscSe, hours: Math.round(yrDataActiveF.pscHe) });
        }
        if (yrDataActiveF.ipsenSe > 0 || yrDataActiveF.ipsenHe > 0) {
          newBreakdownF.push({ name: 'IPS & IPSEN (Enfance)', count: yrDataActiveF.ipsenSe, hours: Math.round(yrDataActiveF.ipsenHe) });
        }
        if (yrDataActiveF.gqsSe > 0 || yrDataActiveF.gqsHe > 0) {
          newBreakdownF.push({ name: 'GQS (Gestes Qui Sauvent)', count: yrDataActiveF.gqsSe, hours: Math.round(yrDataActiveF.gqsHe) });
        }
        if (yrDataActiveF.recyclageSe > 0 || yrDataActiveF.recyclageHe > 0) {
          newBreakdownF.push({ name: 'Recyclage PSC', count: yrDataActiveF.recyclageSe, hours: Math.round(yrDataActiveF.recyclageHe) });
        }
        formationObj.breakdown2026 = newBreakdownF;
      } else {
        const defaultFormation = INITIAL_METIER_STATS.find(m => m.id === 'formation');
        if (defaultFormation) {
          formationObj.breakdown2026 = isDataErased ? [] : JSON.parse(JSON.stringify(defaultFormation.breakdown2026)).map((item: any) => ({
            ...item,
            count: Math.round(item.count * 0.44) || 1,
            hours: Math.round(item.hours * 0.44)
          }));
        }
      }
    }

    return updated;
  }, [
    ytdConsolidatedStatsByYear, 
    ytdConsolidatedUrgenceStatsByYear, 
    ytdConsolidatedFormationStatsByYear, 
    selectedAnalysisYear, 
    isDataErased
  ]);

  // Keep metierStats fully updated reactively in a safe way without infinite rendering loops
  useEffect(() => {
    setMetierStats(prev => {
      const updated = JSON.parse(JSON.stringify(prev)) as MetierStats[];
      const secourismeObj = updated.find(m => m.id === 'secourisme');
      if (!secourismeObj) return prev;

      // 1. Update historical year statistics dynamically for secourisme
      const baselines: { [year: number]: { activitiesCount: number; volunteerHours: number } } = {
        2024: { activitiesCount: 0, volunteerHours: 0 },
        2025: { activitiesCount: 0, volunteerHours: 0 },
        2026: { activitiesCount: 0, volunteerHours: 0 }
      };

      const yearsToHandle = [2024, 2025, 2026];

      yearsToHandle.forEach(yr => {
        const yrData = consolidatedStatsByYear[yr];
        const histEntry = secourismeObj.history.find(h => h.year === yr);
        
        // Check if there is actual uploaded/imported data for this year
        const hasImportedData = yrData && (yrData.activitiesCount > 0 || yrData.volunteerHours > 0 || yrData.activeDps.length > 0);

        if (histEntry) {
          if (hasImportedData) {
            histEntry.activitiesCount = yrData.activitiesCount;
            histEntry.volunteerHours = yrData.volunteerHours;
          } else {
            // Restore default static baseline
            histEntry.activitiesCount = baselines[yr].activitiesCount;
            histEntry.volunteerHours = baselines[yr].volunteerHours;
          }
        } else if (hasImportedData) {
          // If a new year somehow appears, we add it!
          secourismeObj.history.push({
            year: yr,
            activitiesCount: yrData.activitiesCount,
            volunteerHours: yrData.volunteerHours
          });
        }
      });

      // Keep history sorted
      secourismeObj.history.sort((a, b) => a.year - b.year);

      // 2. Build detailed breakdown for secourisme
      const yrData2026 = consolidatedStatsByYear[2026] || { activeDps: [], dtCount: 0, dtHrs: 0, reseauCount: 0, reseauHrs: 0 };
      const newBreakdown: { name: string; count: number; hours: number }[] = [];

      // Add top 3 largest individual DPS for 2026
      const sortedDps = [...yrData2026.activeDps]
        .sort((a, b) => b.heuresBenevolatCalculees - a.heuresBenevolatCalculees);
      
      sortedDps.slice(0, 3).forEach(m => {
        newBreakdown.push({
          name: `${m.manifestation} (${m.ul})`,
          count: 1,
          hours: Math.round(m.heuresBenevolatCalculees)
        });
      });

      // Add remaining consolidated DPS if there are more
      if (sortedDps.length > 3) {
        const otherDps = sortedDps.slice(3);
        const otherHrs = otherDps.reduce((sum, row) => sum + row.heuresBenevolatCalculees, 0);
        newBreakdown.push({
          name: `Autres postes consolidés (${otherDps.length} DPS)`,
          count: otherDps.length,
          hours: Math.round(otherHrs)
        });
      }

      // Add DT Direct group summary if exist
      if (yrData2026.dtCount > 0) {
        newBreakdown.push({
          name: `Postes direct DT (${yrData2026.dtCount} DPS)`,
          count: yrData2026.dtCount,
          hours: yrData2026.dtHrs
        });
      }

      // Add Gardes SDIS group summary if exist
      if (yrData2026.reseauCount > 0) {
        newBreakdown.push({
          name: `Réseau : Gardes SDIS Versailles (${yrData2026.reseauCount} gardes)`,
          count: yrData2026.reseauCount,
          hours: yrData2026.reseauHrs
        });
      }

      secourismeObj.breakdown2026 = newBreakdown.slice(0, 6);

      // 3. Update historical year statistics dynamically for urgence
      const urgenceObj = updated.find(m => m.id === 'urgence');
      if (urgenceObj) {
        const urgenceBaselines: { [year: number]: { activitiesCount: number; volunteerHours: number } } = {
          2024: { activitiesCount: 0, volunteerHours: 0 },
          2025: { 
            activitiesCount: isDataErased ? 0 : (compareYtd ? Math.round(64 * 0.44) : 64), 
            volunteerHours: isDataErased ? 0 : (compareYtd ? Math.round(5400 * 0.44) : 5400) 
          },
          2026: { 
            activitiesCount: isDataErased ? 0 : (compareYtd ? Math.round(78 * 0.44) : 78), 
            volunteerHours: isDataErased ? 0 : (compareYtd ? Math.round(7200 * 0.44) : 7200) 
          }
        };

        const yearsToHandleUrgence = [2024, 2025, 2026];
        yearsToHandleUrgence.forEach(yr => {
          const yrDataU = consolidatedUrgenceStatsByYear[yr];
          const histEntryU = urgenceObj.history.find(h => h.year === yr);
          const hasImportedDataU = yrDataU && yrDataU.rows.length > 0;

          if (histEntryU) {
            if (hasImportedDataU) {
              histEntryU.activitiesCount = yrDataU.activitiesCount;
              histEntryU.volunteerHours = yrDataU.volunteerHours;
            } else {
              histEntryU.activitiesCount = urgenceBaselines[yr].activitiesCount;
              histEntryU.volunteerHours = urgenceBaselines[yr].volunteerHours;
            }
          } else if (hasImportedDataU) {
            urgenceObj.history.push({
              year: yr,
              activitiesCount: yrDataU.activitiesCount,
              volunteerHours: yrDataU.volunteerHours
            });
          }
        });

        urgenceObj.history.sort((a, b) => a.year - b.year);

        const yrData2026U = consolidatedUrgenceStatsByYear[2026] || { rows: [] };
        if (yrData2026U.rows.length > 0) {
          const newBreakdownU: { name: string; count: number; hours: number }[] = [];
          yrData2026U.rows.slice(0, 5).forEach(r => {
            newBreakdownU.push({
              name: r.contexteDescription.length > 45 ? `${r.contexteDescription.substring(0, 45)}...` : r.contexteDescription,
              count: 1,
              hours: r.heuresBenevolat
            });
          });
          urgenceObj.breakdown2026 = newBreakdownU;
        } else {
          // Restore default hardcoded breakdown from INITIAL_METIER_STATS
          const defaultUrgence = INITIAL_METIER_STATS.find(m => m.id === 'urgence');
          if (defaultUrgence) {
            urgenceObj.breakdown2026 = isDataErased ? [] : JSON.parse(JSON.stringify(defaultUrgence.breakdown2026)).map((item: any) => ({
              ...item,
              count: compareYtd ? Math.round(item.count * 0.44) || 1 : item.count,
              hours: compareYtd ? Math.round(item.hours * 0.44) : item.hours
            }));
          }
        }
      }

      // 4. Update historical year statistics dynamically for formation
      const formationObj = updated.find(m => m.id === 'formation');
      if (formationObj) {
        const formationBaselines: { [year: number]: { activitiesCount: number; volunteerHours: number } } = {
          2024: { 
            activitiesCount: isDataErased ? 0 : (compareYtd ? Math.round(210 * 0.44) : 210), 
            volunteerHours: isDataErased ? 0 : (compareYtd ? Math.round(6800 * 0.44) : 6800) 
          },
          2025: { 
            activitiesCount: isDataErased ? 0 : (compareYtd ? Math.round(235 * 0.44) : 235), 
            volunteerHours: isDataErased ? 0 : (compareYtd ? Math.round(7900 * 0.44) : 7900) 
          },
          2026: { 
            activitiesCount: isDataErased ? 0 : (compareYtd ? Math.round(260 * 0.44) : 260), 
            volunteerHours: isDataErased ? 0 : (compareYtd ? Math.round(9100 * 0.44) : 9100) 
          }
        };

        const yearsToHandleFormation = [2024, 2025, 2026];
        yearsToHandleFormation.forEach(yr => {
          const yrDataF = consolidatedFormationStatsByYear[yr];
          const histEntryF = formationObj.history.find(h => h.year === yr);
          const hasImportedDataF = yrDataF && yrDataF.rows.length > 0;

          if (histEntryF) {
            if (hasImportedDataF) {
              histEntryF.activitiesCount = yrDataF.activitiesCount;
              histEntryF.volunteerHours = yrDataF.volunteerHours;
            } else {
              histEntryF.activitiesCount = formationBaselines[yr].activitiesCount;
              histEntryF.volunteerHours = formationBaselines[yr].volunteerHours;
            }
          } else if (hasImportedDataF) {
            formationObj.history.push({
              year: yr,
              activitiesCount: yrDataF.activitiesCount,
              volunteerHours: yrDataF.volunteerHours
            });
          }
        });

        formationObj.history.sort((a, b) => a.year - b.year);

        // Dynamic breakdown for formation of the active analysis year
        const yrDataActiveF = consolidatedFormationStatsByYear[selectedAnalysisYear] || { rows: [] };
        if (yrDataActiveF.rows.length > 0) {
          const newBreakdownF: { name: string; count: number; hours: number }[] = [];
          if (yrDataActiveF.epscSe > 0 || yrDataActiveF.epscHe > 0) {
            newBreakdownF.push({ name: 'ePSC (Mixte / eLearning)', count: yrDataActiveF.epscSe, hours: Math.round(yrDataActiveF.epscHe) });
          }
          if (yrDataActiveF.pscSe > 0 || yrDataActiveF.pscHe > 0) {
            newBreakdownF.push({ name: 'PSC1 (Prévention & Secours)', count: yrDataActiveF.pscSe, hours: Math.round(yrDataActiveF.pscHe) });
          }
          if (yrDataActiveF.ipsenSe > 0 || yrDataActiveF.ipsenHe > 0) {
            newBreakdownF.push({ name: 'IPS & IPSEN (Enfance)', count: yrDataActiveF.ipsenSe, hours: Math.round(yrDataActiveF.ipsenHe) });
          }
          if (yrDataActiveF.gqsSe > 0 || yrDataActiveF.gqsHe > 0) {
            newBreakdownF.push({ name: 'GQS (Gestes Qui Sauvent)', count: yrDataActiveF.gqsSe, hours: Math.round(yrDataActiveF.gqsHe) });
          }
          if (yrDataActiveF.recyclageSe > 0 || yrDataActiveF.recyclageHe > 0) {
            newBreakdownF.push({ name: 'Recyclage PSC', count: yrDataActiveF.recyclageSe, hours: Math.round(yrDataActiveF.recyclageHe) });
          }
          formationObj.breakdown2026 = newBreakdownF;
        } else {
          // Restore default hardcoded breakdown from INITIAL_METIER_STATS
          const defaultFormation = INITIAL_METIER_STATS.find(m => m.id === 'formation');
          if (defaultFormation) {
            formationObj.breakdown2026 = isDataErased ? [] : JSON.parse(JSON.stringify(defaultFormation.breakdown2026)).map((item: any) => ({
              ...item,
              count: compareYtd ? Math.round(item.count * 0.44) || 1 : item.count,
              hours: compareYtd ? Math.round(item.hours * 0.44) : item.hours
            }));
          }
        }
      }

      // Simple comparison helper to prevent redundant state updates
      const isDifferent = JSON.stringify(prev) !== JSON.stringify(updated);
      return isDifferent ? updated : prev;
    });
  }, [consolidatedStatsByYear, consolidatedUrgenceStatsByYear, consolidatedFormationStatsByYear, selectedAnalysisYear, isDataErased, compareYtd]);

  // Synchronize state with localStorage
  useEffect(() => {
    localStorage.setItem('cr_selected_metier', selectedMetier);
  }, [selectedMetier]);

  useEffect(() => {
    localStorage.setItem('cr_metier_stats', JSON.stringify(metierStats));
  }, [metierStats]);

  useEffect(() => {
    localStorage.setItem('cr_strategic_goals', JSON.stringify(strategicGoals));
  }, [strategicGoals]);

  useEffect(() => {
    localStorage.setItem('cr_print_narrative', printNarrative);
  }, [printNarrative]);

  useEffect(() => {
    localStorage.setItem('cr_active_import_tab', activeImportTab);
  }, [activeImportTab]);

  useEffect(() => {
    if (dpsRows) {
      localStorage.setItem('cr_dps_rows', JSON.stringify(dpsRows));
    } else {
      localStorage.removeItem('cr_dps_rows');
    }
  }, [dpsRows]);

  useEffect(() => {
    localStorage.setItem('cr_dps_file_name', dpsFileName);
  }, [dpsFileName]);

  useEffect(() => {
    localStorage.setItem('cr_dps_import_status', JSON.stringify(dpsImportStatus));
  }, [dpsImportStatus]);

  useEffect(() => {
    if (dtDirectRows) {
      localStorage.setItem('cr_dt_direct_rows', JSON.stringify(dtDirectRows));
    } else {
      localStorage.removeItem('cr_dt_direct_rows');
    }
  }, [dtDirectRows]);

  useEffect(() => {
    localStorage.setItem('cr_dt_direct_file_name', dtDirectFileName);
  }, [dtDirectFileName]);

  useEffect(() => {
    localStorage.setItem('cr_dt_direct_import_status', JSON.stringify(dtDirectImportStatus));
  }, [dtDirectImportStatus]);

  useEffect(() => {
    if (reseauRows) {
      localStorage.setItem('cr_reseau_rows', JSON.stringify(reseauRows));
    } else {
      localStorage.removeItem('cr_reseau_rows');
    }
  }, [reseauRows]);

  useEffect(() => {
    localStorage.setItem('cr_reseau_file_name', reseauFileName);
  }, [reseauFileName]);

  useEffect(() => {
    localStorage.setItem('cr_reseau_import_status', JSON.stringify(reseauImportStatus));
  }, [reseauImportStatus]);

  useEffect(() => {
    if (urgenceRows) {
      localStorage.setItem('cr_urgence_rows', JSON.stringify(urgenceRows));
    } else {
      localStorage.removeItem('cr_urgence_rows');
    }
  }, [urgenceRows]);

  useEffect(() => {
    localStorage.setItem('cr_urgence_file_name', urgenceFileName);
  }, [urgenceFileName]);

  useEffect(() => {
    localStorage.setItem('cr_urgence_import_status', JSON.stringify(urgenceImportStatus));
  }, [urgenceImportStatus]);

  useEffect(() => {
    if (formationRows) {
      localStorage.setItem('cr_formation_rows', JSON.stringify(formationRows));
    } else {
      localStorage.removeItem('cr_formation_rows');
    }
  }, [formationRows]);

  useEffect(() => {
    localStorage.setItem('cr_formation_file_name', formationFileName);
  }, [formationFileName]);

  useEffect(() => {
    localStorage.setItem('cr_formation_import_status', JSON.stringify(formationImportStatus));
  }, [formationImportStatus]);

  const selectedStats = metierStats.find(m => m.id === selectedMetier) || metierStats[0];

  const availableYearsForSelectedMetier = useMemo(() => {
    const list = selectedStats.history
      .filter(h => h.activitiesCount > 0 || h.volunteerHours > 0)
      .map(h => h.year);
    if (list.length === 0) {
      return [2026]; // Fallback to 2026 if there's no data at all
    }
    return list;
  }, [selectedStats]);

  // If the active year is not in the list of available years for the selected métier,
  // automatically transition user to the maximum (latest) available year
  useEffect(() => {
    if (!availableYearsForSelectedMetier.includes(selectedAnalysisYear)) {
      setSelectedAnalysisYear(Math.max(...availableYearsForSelectedMetier));
    }
  }, [availableYearsForSelectedMetier, selectedAnalysisYear]);

  // Handler for custom Excel imports
  const handleDataImported = (newStats: MetierStats[]) => {
    setMetierStats(newStats);
  };

  // Reset all secourisme data, DPS rows, DT Direct rows, Urgence rows, and Formation rows
  const handleResetAllSecourismeData = () => {
    // Completely reset secourisme, urgence, and formation metrics to zero/empty
    setMetierStats(prev => {
      return prev.map(m => {
        if (m.id === 'secourisme' || m.id === 'urgence' || m.id === 'formation') {
          return {
            ...m,
            history: m.history.map(h => [2024, 2025, 2026].includes(h.year) ? { ...h, activitiesCount: 0, volunteerHours: 0 } : h),
            breakdown2026: []
          };
        }
        return m;
      });
    });

    setIsDataErased(true);

    // Clear state of DPS rows
    setDpsRows(null);
    setDpsFileName('');
    setDpsImportStatus({ type: null, message: '' });

    // Clear state of DT Direct rows
    setDtDirectRows(null);
    setDtDirectFileName('');
    setDtDirectImportStatus({ type: null, message: '' });

    // Clear state of Reseau (Garde SDIS) rows
    setReseauRows(null);
    setReseauFileName('');
    setReseauImportStatus({ type: null, message: '' });

    // Clear state of Urgence rows
    setUrgenceRows(null);
    setUrgenceFileName('');
    setUrgenceImportStatus({ type: null, message: '' });

    // Clear state of Formation rows
    setFormationRows(null);
    setFormationFileName('');
    setFormationImportStatus({ type: null, message: '' });
  };

  // Handler to update Strategic plan values directly (Interactive simulation)
  const handleUpdateStrategicProgress = (goalId: string, newValue: number) => {
    setStrategicGoals(prev =>
      prev.map(goal => {
        if (goal.id === goalId) {
          const progressPercent = Math.min(Math.round((newValue / goal.targetValue) * 100), 100);
          return {
            ...goal,
            currentValue: newValue,
            progress: progressPercent,
            statusText: `Mis à jour à ${progressPercent}% - En cours`
          };
        }
        return goal;
      })
    );
  };

  const handleUpdateStrategicFullVal = (goalId: string, startVal: number, currentVal: number, targetVal: number) => {
    setStrategicGoals(prev =>
      prev.map(goal => {
        if (goal.id === goalId) {
          const deltaTotal = targetVal - startVal;
          const progressPercent = deltaTotal > 0
            ? Math.min(Math.round(((currentVal - startVal) / deltaTotal) * 100), 100)
            : Math.min(Math.round((currentVal / targetVal) * 100), 100);
          return {
            ...goal,
            startValue: startVal,
            currentValue: currentVal,
            targetValue: targetVal,
            progress: Math.max(0, progressPercent),
            statusText: `Objectif mis à jour : ${Math.max(0, progressPercent)}% d'avancement`
          };
        }
        return goal;
      })
    );
  };

  // Aggregated data calculation for key top visual metrics based on the selected year
  const totalHoursForSelectedYear = metierStats.reduce((acc, curr) => {
    const data = curr.history.find(h => h.year === selectedAnalysisYear);
    return acc + (data?.volunteerHours || 0);
  }, 0);

  const totalActivitiesForSelectedYear = metierStats.reduce((acc, curr) => {
    const data = curr.history.find(h => h.year === selectedAnalysisYear);
    return acc + (data?.activitiesCount || 0);
  }, 0);

  const totalHours2025 = metierStats.reduce((acc, curr) => {
    const data = curr.history.find(h => h.year === 2025);
    return acc + (data?.volunteerHours || 0);
  }, 0);

  const totalActivities2025 = metierStats.reduce((acc, curr) => {
    const data = curr.history.find(h => h.year === 2025);
    return acc + (data?.activitiesCount || 0);
  }, 0);

  const totalHours2026 = metierStats.reduce((acc, curr) => {
    const data = curr.history.find(h => h.year === 2026);
    return acc + (data?.volunteerHours || 0);
  }, 0);

  const totalActivities2026 = metierStats.reduce((acc, curr) => {
    const data = curr.history.find(h => h.year === 2026);
    return acc + (data?.activitiesCount || 0);
  }, 0);

  // Trigger browser print helper
  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="main-app" className="min-h-screen bg-rc-light text-rc-dark antialiased font-sans">
      
      {/* Red Cross Departmental Banner Header */}
      <header className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Branding Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-rc-red rounded-lg flex items-center justify-center shadow-sm">
                {/* Traditional Red Cross custom icon */}
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-current">
                  <path d="M10.5 4h3v6.5H20v3h-6.5V20h-3v-6.5H4v-3h6.5z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-rc-red tracking-wider uppercase bg-rc-red/10 px-2 py-0.5 rounded border border-rc-red/15">
                    Yvelines - 78
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Code DTUS-2026
                  </span>
                </div>
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Croix-Rouge française
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  Direction Territoriale de l'Urgence et du Secourisme (DTUS 78)
                </p>
              </div>
            </div>

            {/* Print & Action Bar */}
            <div className="flex items-center gap-3">
              <button
                id="btn-open-documentation"
                onClick={() => setIsDocumentationOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-750 bg-slate-100 hover:bg-slate-200 border border-slate-220 rounded-md transition cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                Guide & Doc
              </button>
              <button
                id="btn-open-integration"
                onClick={() => setIsIntegrationOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-rc-red hover:bg-[#D7171E] rounded-md transition cursor-pointer shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
                Intégrer des données
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 relative overflow-hidden print:border-none print:shadow-none print:p-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rc-red/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none print:hidden" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Pilotage d'Activité DTUS des Yvelines
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Bilan global consolidé de la Direction Territoriale de l'Urgence et du Secourisme (DTUS 78).
              </p>
            </div>

            {/* Quick summary numbers box */}
            <div className="lg:col-span-7 bg-slate-50/75 border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 print:bg-white">
              {/* Year 2025 (Last complete year) */}
              <div className="flex-1 space-y-3 pb-4 sm:pb-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-extrabold">Dernière Année Complète (2025)</span>
                  <span className="text-[9px] px-2 py-0.5 bg-slate-200/70 text-slate-700 font-bold rounded">Bilan</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Actions Secours</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-slate-800 font-mono tracking-tight">
                      {totalActivities2025.toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Heures Bénévolat</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-slate-800 font-mono tracking-tight">
                      {totalHours2025.toLocaleString('fr-FR')} h
                    </span>
                  </div>
                </div>
                
                <div className="pt-2 text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  Données consolidées à 100%
                </div>
              </div>

              {/* Year 2026 (Year in progress) */}
              <div className="flex-1 space-y-3 pt-4 sm:pt-0 sm:pl-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-rc-red font-extrabold">Année en cours (2026)</span>
                  <span className="text-[9px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold rounded animate-pulse">En cours</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Actions Secours</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                      {totalActivities2026.toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Heures Bénévolat</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-rc-red font-mono tracking-tight">
                      {totalHours2026.toLocaleString('fr-FR')} h
                    </span>
                  </div>
                </div>
                
                <div className="pt-2 text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Mise à jour : Juin 2026
                </div>
              </div>
            </div>
          </div>

        </div>


        {/* Section 1 : Métiers / Focus Domain metrics selection row */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-rc-red" />
                1. Choix du Métier Opérationnel
              </h3>
            </div>
            <span className="text-xs text-slate-500 italic">Cliquez sur un métier pour charger ses analyses et objectifs</span>
          </div>

          {/* Cards list for Metiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metierStats.map((stats) => {
              const ytdStats = ytdMetierStats.find(y => y.id === stats.id) || stats;
              return (
                <MetricCard
                  key={stats.id}
                  stats={ytdStats}
                  onSelect={() => setSelectedMetier(stats.id)}
                  isSelected={selectedMetier === stats.id}
                  compareYtd={true}
                  onOpenDpsRegistry={() => setIsDpsRegistryViewOpen(true)}
                  onOpenDtDirect={() => setIsDtDirectRegistryViewOpen(true)}
                  onOpenReseauRegistry={() => setIsReseauRegistryViewOpen(true)}
                  onOpenUrgenceRegistry={() => setIsUrgenceRegistryViewOpen(true)}
                  onOpenFormationRegistry={() => setIsFormationRegistryViewOpen(true)}
                />
              );
            })}
          </div>
        </section>

        {/* Section 2 : Charts & Dynamic YoY analyses */}
        <section id="charts-and-historical">
          <ChartsView 
            stats={selectedStats} 
            dpsRows={dpsRows} 
            dtDirectRows={dtDirectRows}
            reseauRows={reseauRows}
            urgenceRows={urgenceRows}
            formationRows={formationRows}
            compareYtd={compareYtd}
            setCompareYtd={setCompareYtd}
            selectedAnalysisYear={selectedAnalysisYear}
            setSelectedAnalysisYear={setSelectedAnalysisYear}
          />
        </section>

        {/* Section 3 : Strategic 4-year projection goals target */}
        <section id="strategic-four-year-vision">
          <StrategicGoals
            goals={strategicGoals}
            selectedCategory={selectedMetier}
            onUpdateProgress={handleUpdateStrategicProgress}
            onUpdateFullVal={handleUpdateStrategicFullVal}
            dpsRows={dpsRows}
            dtDirectRows={dtDirectRows}
            reseauRows={reseauRows}
            formationRows={formationRows}
          />
        </section>

        {/* Section 5 : Lot 2 preview (Activités Sociales) */}
        <section id="social-activities-teaser-lot2">
          <SocialActivitiesTeaser />
        </section>

      </main>

      {/* Clean elegant footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-rc-red rounded flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-white fill-current">
                <path d="M10.5 4h3v6.5H20v3h-6.5V20h-3v-6.5H4v-3h6.5z" />
              </svg>
            </div>
            <span className="font-bold text-slate-800">Direction Territoriale des Yvelines</span>
            <span>- Tous droits réservés © 2026</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-100 font-semibold font-mono">
              Vite 6 + React 19 + Recharts Ready
            </span>
            <a href="https://www.croix-rouge.fr" target="_blank" rel="noreferrer" className="hover:text-rc-red font-semibold transition">
              croix-rouge.fr
            </a>
          </div>
        </div>
      </footer>

      {/* Adapated screen / Registre de Suivi DPS detailed overlay */}
      <DpsRegistryView
        isOpen={isDpsRegistryViewOpen}
        onClose={() => setIsDpsRegistryViewOpen(false)}
        dpsRows={dpsRows}
        setDpsRows={setDpsRows}
        fileName={dpsFileName}
        setFileName={setDpsFileName}
        onDataImported={handleDataImported}
        currentStats={metierStats}
      />

      {/* Registre de Suivi Postes Directs DT detailed overlay */}
      <DtDirectRegistryView
        isOpen={isDtDirectRegistryViewOpen}
        onClose={() => setIsDtDirectRegistryViewOpen(false)}
        dtDirectRows={dtDirectRows}
        setDtDirectRows={setDtDirectRows}
        fileName={dtDirectFileName}
        setFileName={setDtDirectFileName}
        onDataImported={handleDataImported}
        currentStats={metierStats}
      />

      {/* Registre de Suivi Gardes SDIS (Réseau) detailed overlay */}
      <ReseauRegistryView
        isOpen={isReseauRegistryViewOpen}
        onClose={() => setIsReseauRegistryViewOpen(false)}
        reseauRows={reseauRows}
        setReseauRows={setReseauRows}
        fileName={reseauFileName}
        setFileName={setReseauFileName}
        onDataImported={handleDataImported}
        currentStats={metierStats}
      />

      {/* Registre de Suivi de l'Urgence detailed overlay */}
      <UrgenceRegistryView
        isOpen={isUrgenceRegistryViewOpen}
        onClose={() => setIsUrgenceRegistryViewOpen(false)}
        urgenceRows={urgenceRows}
        setUrgenceRows={setUrgenceRows}
        fileName={urgenceFileName}
        setFileName={setUrgenceFileName}
        onDataImported={handleDataImported}
        currentStats={metierStats}
      />

      {/* Registre de Suivi de la Formation Grand Public detailed overlay */}
      <FormationRegistryView
        isOpen={isFormationRegistryViewOpen}
        onClose={() => setIsFormationRegistryViewOpen(false)}
        formationRows={formationRows}
        setFormationRows={setFormationRows}
        fileName={formationFileName}
        setFileName={setFormationFileName}
        onDataImported={handleDataImported}
        currentStats={metierStats}
      />

      {/* Popin d'Intégration Globale des Données Opérationnelles */}
      {isIntegrationOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-205 w-full max-w-6xl flex flex-col my-8 max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#1E293B] text-white p-5 rounded-t-xl flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rc-red rounded-lg text-white">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-rc-red/20 text-rc-red border border-rc-red/30 px-2 py-0.5 rounded font-mono uppercase">
                      Workspace Importation
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Formats acceptés : XLSX, XLS, CSV
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                    Intégrer de Nouvelles Données Opérationnelles & Bilan d'Activités
                  </h3>
                </div>
              </div>
              
              <button 
                type="button"
                onClick={() => setIsIntegrationOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Tab Workspace */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-xs text-slate-650 leading-relaxed space-y-1.5 shadow-3xs">
                <p className="font-bold text-[#0F172A] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Générateur Universel d'Activité DTUS 78 :
                </p>
                <p>
                  Glissez-déposez vos fichiers Excel d'activité ou de garde SDIS ci-dessous pour injecter vos bilans de postes. Le système analysera d'office les colonnes adaptées, éliminera les lignes extraterritoriales, et procédera à une fusion d'évènements pour éviter tout doublon dans le registre consolidé de la Direction.
                </p>
              </div>

              {/* Loader with custom tabs inside the dialogue popin */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <div className="flex gap-4 overflow-x-auto no-scrollbar">
                    <button
                      id="tab-import-dps"
                      onClick={() => setActiveImportTab('dps')}
                      className={`pb-3 text-xs sm:text-sm font-bold border-b-2 px-4 transition shrink-0 cursor-pointer ${
                        activeImportTab === 'dps'
                          ? 'border-rc-red text-rc-red font-extrabold'
                          : 'border-transparent text-slate-550 hover:text-slate-800'
                      }`}
                    >
                      Suivi Détaillé des DPS (Postes de Secours)
                    </button>
                    <button
                      id="tab-import-dt-direct"
                      onClick={() => setActiveImportTab('dt_direct')}
                      className={`pb-3 text-xs sm:text-sm font-bold border-b-2 px-4 transition shrink-0 cursor-pointer ${
                        activeImportTab === 'dt_direct'
                          ? 'border-rc-red text-rc-red font-extrabold'
                          : 'border-transparent text-slate-550 hover:text-slate-800'
                      }`}
                    >
                      Postes Directs de la DT
                    </button>
                    <button
                      id="tab-import-reseau"
                      onClick={() => setActiveImportTab('reseau')}
                      className={`pb-3 text-xs sm:text-sm font-bold border-b-2 px-4 transition shrink-0 cursor-pointer ${
                        activeImportTab === 'reseau'
                          ? 'border-rc-red text-rc-red font-extrabold'
                          : 'border-transparent text-slate-550 hover:text-slate-800'
                      }`}
                    >
                      Réseau : Gardes SDIS
                    </button>
                    <button
                      id="tab-import-urgence"
                      onClick={() => setActiveImportTab('urgence')}
                      className={`pb-3 text-xs sm:text-sm font-bold border-b-2 px-4 transition shrink-0 cursor-pointer ${
                        activeImportTab === 'urgence'
                          ? 'border-rc-red text-rc-red font-extrabold'
                          : 'border-transparent text-slate-550 hover:text-slate-800'
                      }`}
                    >
                      Urgence
                    </button>
                    <button
                      id="tab-import-formation"
                      onClick={() => setActiveImportTab('formation')}
                      className={`pb-3 text-xs sm:text-sm font-bold border-b-2 px-4 transition shrink-0 cursor-pointer ${
                        activeImportTab === 'formation'
                          ? 'border-rc-red text-rc-red font-extrabold'
                          : 'border-transparent text-slate-550 hover:text-slate-800'
                      }`}
                    >
                      Formations Grand Public
                    </button>
                    <button
                      id="tab-import-annual"
                      onClick={() => setActiveImportTab('annual')}
                      className={`pb-3 text-xs sm:text-sm font-bold border-b-2 px-4 transition shrink-0 cursor-pointer ${
                        activeImportTab === 'annual'
                          ? 'border-rc-red text-rc-red font-extrabold'
                          : 'border-transparent text-slate-550 hover:text-slate-800'
                      }`}
                    >
                      Bilans Annuels Globaux (Par Métier)
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="hidden md:block">
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-1.5 rounded font-mono">
                        Saisie Directe / Upload
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  {activeImportTab === 'dps' && (
                    <DpsLoader 
                      onDataImported={handleDataImported} 
                      currentStats={metierStats}
                      parsedRows={dpsDraftRows}
                      setParsedRows={setDpsDraftRows}
                      fileName={dpsDraftFileName}
                      setFileName={setDpsDraftFileName}
                      importStatus={dpsDraftImportStatus}
                      setImportStatus={setDpsDraftImportStatus}
                      onInject={handleInjectDpsInRegistry}
                      existingDpsRows={dpsRows}
                    />
                  )}
                  {activeImportTab === 'dt_direct' && (
                    <DtDirectLoader 
                      onDataImported={handleDataImported}
                      currentStats={metierStats}
                      parsedDtRows={dtDirectDraftRows}
                      setParsedDtRows={setDtDirectDraftRows}
                      fileName={dtDirectDraftFileName}
                      setFileName={setDtDirectDraftFileName}
                      importStatus={dtDirectDraftImportStatus}
                      setImportStatus={setDtDirectDraftImportStatus}
                      onInject={handleInjectDtDirectInRegistry}
                      existingDtDirectRows={dtDirectRows}
                    />
                  )}
                  {activeImportTab === 'reseau' && (
                    <ReseauLoader 
                      onDataImported={handleDataImported}
                      currentStats={metierStats}
                      parsedReseauRows={reseauDraftRows}
                      setParsedReseauRows={setReseauDraftRows}
                      fileName={reseauDraftFileName}
                      setFileName={setReseauDraftFileName}
                      importStatus={reseauDraftImportStatus}
                      setImportStatus={setReseauDraftImportStatus}
                      onInject={handleInjectReseauInRegistry}
                      existingReseauRows={reseauRows}
                    />
                  )}
                  {activeImportTab === 'urgence' && (
                    <UrgenceLoader 
                      onDataImported={handleDataImported}
                      currentStats={metierStats}
                      parsedUrgenceRows={urgenceDraftRows}
                      setParsedUrgenceRows={setUrgenceDraftRows}
                      fileName={urgenceDraftFileName}
                      setFileName={setUrgenceDraftFileName}
                      importStatus={urgenceDraftImportStatus}
                      setImportStatus={setUrgenceDraftImportStatus}
                      onInject={handleInjectUrgenceInRegistry}
                      existingUrgenceRows={urgenceRows}
                    />
                  )}
                  {activeImportTab === 'formation' && (
                    <FormationLoader 
                      onDataImported={handleDataImported}
                      currentStats={metierStats}
                      parsedFormationRows={formationDraftRows}
                      setParsedFormationRows={setFormationDraftRows}
                      fileName={formationDraftFileName}
                      setFileName={setFormationDraftFileName}
                      importStatus={formationDraftImportStatus}
                      setImportStatus={setFormationDraftImportStatus}
                      onInject={handleInjectFormationInRegistry}
                      existingFormationRows={formationRows}
                    />
                  )}
                  {activeImportTab === 'annual' && (
                    <ExcelManager onDataImported={handleDataImported} currentStats={metierStats} />
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between rounded-b-xl text-xs text-slate-500">
              <span className="font-mono">DTUS 78 — Espace de Chargement Sécurisé</span>
              <button
                type="button"
                onClick={() => setIsIntegrationOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md cursor-pointer"
              >
                Fermer l'espace d'intégration
              </button>
            </div>

          </div>
        </div>
      )}

      <DocumentationView isOpen={isDocumentationOpen} onClose={() => setIsDocumentationOpen(false)} />
    </div>
  );
}
