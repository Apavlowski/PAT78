/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line
} from 'recharts';
import { MetierStats, ParsedDpsRow, ParsedDtDirectRow, ParsedReseauRow, ParsedUrgenceRow, ParsedFormationPublicRow, getYearFromDateString } from '../types';
import { 
  Calendar, 
  Hourglass, 
  TrendingUp, 
  HelpCircle,
  Home,
  Shield,
  Flame,
  Clock,
  ArrowUpRight,
  Info,
  CheckCircle,
  Award,
  Users
} from 'lucide-react';

interface ChartsViewProps {
  stats: MetierStats;
  dpsRows?: ParsedDpsRow[] | null;
  dtDirectRows?: ParsedDtDirectRow[] | null;
  reseauRows?: ParsedReseauRow[] | null;
  urgenceRows?: ParsedUrgenceRow[] | null;
  formationRows?: ParsedFormationPublicRow[] | null;
  compareYtd?: boolean;
  setCompareYtd: (val: boolean) => void;
  selectedAnalysisYear: number;
  setSelectedAnalysisYear: (year: number) => void;
}

export const ChartsView: React.FC<ChartsViewProps> = ({ 
  stats, 
  dpsRows, 
  dtDirectRows, 
  reseauRows, 
  urgenceRows,
  formationRows,
  compareYtd = false,
  setCompareYtd,
  selectedAnalysisYear,
  setSelectedAnalysisYear
}) => {
  const [activeTab, setActiveTab] = useState<'evolution' | 'repartition' | 'types_volume'>('evolution');
  const [selectedFormationUl, setSelectedFormationUl] = useState<string>("Tous");

  // Helper to determine if a date falls within the same YTD period (up to June 9th)
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

  // Fallback to evolution tab if currently selected tab is not available with other metiers
  React.useEffect(() => {
    if (stats.id !== 'secourisme' && activeTab === 'types_volume') {
      setActiveTab('evolution');
    }
  }, [stats.id, activeTab]);

  // Dynamic breakdown of DPS per Unités Locales (UL)
  const ulBreakdownData = React.useMemo(() => {
    if (stats.id !== 'secourisme') return [];

    const dpsForSelectedYear = dpsRows ? dpsRows.filter(row => {
      const yr = getYearFromDateString(row.debut);
      if (yr !== selectedAnalysisYear) return false;
      if (compareYtd) {
        return isWithinYtdPeriod(row.debut);
      }
      return true;
    }) : [];

    const hasDataForSelectedYear = dpsForSelectedYear.length > 0;

    if (hasDataForSelectedYear) {
      const groups: { [key: string]: { dpsCount: number; hours: number } } = {};
      
      const activeDps = dpsForSelectedYear.filter(r => {
        if (r.isIgnored) return false;
        const s = r.statut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return s.includes('confirme') || s.includes('cloture') || s.includes('realise') || s.includes('valide');
      });

      activeDps.forEach(row => {
        let rawUl = row.ul ? row.ul.trim() : "Direction Territoriale";
        if (!rawUl) rawUl = "Direction Territoriale";
        
        // Normalize name: Saint-Germain, Versailles, Poissy, etc.
        const normalizedUl = rawUl
          .split(/[\s-]+/)
          .map(word => {
            const low = word.toLowerCase();
            if (low === 'st' || low === 'saint') return 'St';
            if (low === 'germain') return 'Germain';
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          })
          .join('-');

        if (!groups[normalizedUl]) {
          groups[normalizedUl] = { dpsCount: 0, hours: 0 };
        }
        groups[normalizedUl].dpsCount += 1;
        groups[normalizedUl].hours += Math.round(row.heuresBenevolatCalculees);
      });

      return Object.entries(groups).map(([name, data]) => ({
        name,
        dpsCount: data.dpsCount,
        hours: data.hours,
      })).sort((a, b) => b.dpsCount - a.dpsCount);
    } else {
      // Since 2024 and 2025 are cleared, return empty if no data imported
      if (selectedAnalysisYear === 2024 || selectedAnalysisYear === 2025) {
        return [];
      }

      return [
        { name: 'Versailles', dpsCount: 85, hours: 9800 },
        { name: 'St-Germain-en-Laye', dpsCount: 42, hours: 4100 },
        { name: 'Rambouillet', dpsCount: 30, hours: 2800 },
        { name: 'Mantes-la-Jolie', dpsCount: 25, hours: 2250 },
        { name: 'Poissy', dpsCount: 22, hours: 1900 },
        { name: 'Conflans', dpsCount: 18, hours: 1400 },
        { name: 'Sartrouville', dpsCount: 10, hours: 750 },
      ].sort((a, b) => b.dpsCount - a.dpsCount);
    }
  }, [stats.id, dpsRows, selectedAnalysisYear, compareYtd]);

  // Chart data formatting for Recharts
  const availableYears = React.useMemo(() => {
    const list = stats.history
      .filter(h => h.activitiesCount > 0 || h.volunteerHours > 0)
      .map(h => h.year);
    if (list.length === 0) {
      return [2026];
    }
    return list;
  }, [stats.history]);

  const historyData = React.useMemo(() => {
    return stats.history
      .filter(item => item.activitiesCount > 0 || item.volunteerHours > 0)
      .map(item => ({
        name: item.year.toString(),
        'Activités (volume)': item.activitiesCount,
        'Bénévole (heures)': item.volunteerHours,
        'Ratio Heures / Act': Math.round(item.volunteerHours / (item.activitiesCount || 1)),
      }));
  }, [stats.history]);

  // Get unique list of ULs from the loaded formations data
  const formationUls = React.useMemo(() => {
    if (!formationRows || formationRows.length === 0) {
      return [
        "78 - Chevreuse", 
        "78 - Saint Quentin en Yvelines", 
        "78 - Les Mureaux", 
        "78 - Poissy", 
        "78 - Sartrouville", 
        "78 - Versailles Grand Parc Ouest", 
        "78 - Cœur de Mauldre", 
        "78 - Boucle de Seine Sud", 
        "78 - Viroflay-Vélizy", 
        "78 - Saint Germain en Laye", 
        "78 - La Celle-Saint-Cloud"
      ].sort();
    }
    const uls = new Set<string>();
    formationRows.forEach(r => {
      if (r.ul) {
        uls.add(r.ul.trim());
      }
    });
    return Array.from(uls).sort();
  }, [formationRows]);

  // Dynamic breakdown of Urgence by reasons (motifs)
  const urgenceBreakdownData = React.useMemo(() => {
    let activeRows = urgenceRows ? urgenceRows : [];
    
    // Filter by year
    activeRows = activeRows.filter(r => {
      const yr = getYearFromDateString(r.dateDebut);
      if (yr !== selectedAnalysisYear) return false;
      if (compareYtd) {
        return isWithinYtdPeriod(r.dateDebut);
      }
      return true;
    });

    if (activeRows.length > 0) {
      const groups: { [motif: string]: { count: number; hours: number } } = {};
      activeRows.forEach(r => {
        const rawMotif = r.raisons || r.contexteDescription || "Autre motif d'urgence";
        let motif = rawMotif.trim();
        motif = motif.charAt(0).toUpperCase() + motif.slice(1);
        
        if (!groups[motif]) {
          groups[motif] = { count: 0, hours: 0 };
        }
        groups[motif].count += 1;
        groups[motif].hours += Math.round(r.heuresBenevolat || 0);
      });

      return Object.entries(groups).map(([name, data]) => ({
        name: name.length > 32 ? name.substring(0, 32) + '...' : name,
        fullName: name,
        'Activités': data.count,
        'Heures': data.hours
      })).sort((a, b) => b.Heures - a.Heures);
    } else {
      // Clear or simulated mode
      if (selectedAnalysisYear === 2024 || selectedAnalysisYear === 2025) {
        if (!urgenceRows || urgenceRows.length === 0) {
          return [];
        }
      }

      // Default mock categories
      const scaleMultiplier = compareYtd ? 0.44 : 1.0;
      return [
        { name: 'Plan Grand Froid (Maraudes & Centres)', count: 32, hours: 3400 },
        { name: 'Soutien Incendies & Évacuations Habitations', count: 18, hours: 1200 },
        { name: 'Crues de la Seine & Affluents (Soutien)', count: 14, hours: 1500 },
        { name: 'Centres d\'Accueil Collectif de Crise (CAI)', count: 8, hours: 800 },
        { name: 'Exercices Thématiques Territoriaux', count: 6, hours: 305 }
      ].map(item => ({
        name: item.name.length > 32 ? item.name.substring(0, 32) + '...' : item.name,
        fullName: item.name,
        'Activités': Math.round(item.count * scaleMultiplier) || (scaleMultiplier < 1 ? 0 : 1),
        'Heures': Math.round(item.hours * scaleMultiplier)
      })).sort((a, b) => b.Heures - a.Heures);
    }
  }, [urgenceRows, selectedAnalysisYear, compareYtd]);

  // Dynamic breakdown of Formations
  const formationBreakdownData = React.useMemo(() => {
    let activeRows = formationRows ? formationRows : [];
    
    // Filter by year
    activeRows = activeRows.filter(r => r.year === selectedAnalysisYear);
    
    // Filter by UL
    if (selectedFormationUl !== "Tous") {
      activeRows = activeRows.filter(r => r.ul && r.ul.trim() === selectedFormationUl.trim());
    }
    
    const scaleMultiplier = compareYtd ? 0.44 : 1.0;

    let epscSe = 0, epscHe = 0;
    let pscSe = 0, pscHe = 0;
    let ipsenSe = 0, ipsenHe = 0;
    let gqsSe = 0, gqsHe = 0;
    let recyclageSe = 0, recyclageHe = 0;

    if (activeRows.length > 0) {
      activeRows.forEach(r => {
        epscSe += r.epscSessions;
        epscHe += r.epscHeures;

        pscSe += r.pscSessions;
        pscHe += r.pscHeures;

        ipsenSe += r.ipsenSessions;
        ipsenHe += r.ipsenHeures;

        gqsSe += r.gqsSessions;
        gqsHe += r.gqsHeures;

        recyclageSe += r.recyclageSessions;
        recyclageHe += r.recyclageHeures;
      });
    } else {
      if (!formationRows || formationRows.length === 0) {
        // Fallback to static values representing the whole of Yvelines or scaled per UL
        let baseBreakdown = [
          { name: 'PSC1 (Prévention et Secours Civiques de niveau 1)', count: 185, hours: 5200 },
          { name: 'PSE1 & PSE2 (Secouristes Opérationnels)', count: 28, hours: 2100 },
          { name: 'Formations de Formateurs (Secourisme / PSC)', count: 12, hours: 900 },
          { name: 'IPS & IPSEN (Initiations Enfants/Nourrissons)', count: 30, hours: 600 },
          { name: 'Formations Spécifiques Urgence / Logistique', count: 5, hours: 300 }
        ];

        // Specific UL scaled in mock mode
        const scale = selectedFormationUl === "Tous" ? 1.0 : 0.12; 
        return baseBreakdown.map(item => ({
          name: item.name.length > 32 ? item.name.substring(0, 32) + '...' : item.name,
          fullName: item.name,
          'Activités': Math.round(item.count * scale * scaleMultiplier) || (scaleMultiplier < 1 ? 0 : 1),
          'Heures': Math.round(item.hours * scale * scaleMultiplier)
        })).sort((a, b) => b.Heures - a.Heures);
      }
    }

    const list: { name: string; count: number; hours: number }[] = [];
    
    if (epscSe > 0 || epscHe > 0) {
      list.push({ name: 'ePSC (Mixte / eLearning)', count: Math.round(epscSe * scaleMultiplier), hours: Math.round(epscHe * scaleMultiplier) });
    }
    if (pscSe > 0 || pscHe > 0) {
      list.push({ name: 'PSC1 (Prévention & Secours)', count: Math.round(pscSe * scaleMultiplier), hours: Math.round(pscHe * scaleMultiplier) });
    }
    if (ipsenSe > 0 || ipsenHe > 0) {
      list.push({ name: 'IPS & IPSEN (Enfance)', count: Math.round(ipsenSe * scaleMultiplier), hours: Math.round(ipsenHe * scaleMultiplier) });
    }
    if (gqsSe > 0 || gqsHe > 0) {
      list.push({ name: 'GQS (Gestes Qui Sauvent)', count: Math.round(gqsSe * scaleMultiplier), hours: Math.round(gqsHe * scaleMultiplier) });
    }
    if (recyclageSe > 0 || recyclageHe > 0) {
      list.push({ name: 'Recyclage PSC', count: Math.round(recyclageSe * scaleMultiplier), hours: Math.round(recyclageHe * scaleMultiplier) });
    }

    return list.map(item => ({
      name: item.name.length > 32 ? item.name.substring(0, 32) + '...' : item.name,
      fullName: item.name,
      'Activités': item.count,
      'Heures': item.hours
    })).sort((a, b) => b.Heures - a.Heures);
  }, [formationRows, selectedAnalysisYear, selectedFormationUl, compareYtd]);

  const dynamicBreakdownData = React.useMemo(() => {
    if (stats.id === 'secourisme') {
      // For Secourisme:
      const rawDps = dpsRows ? dpsRows.filter(r => {
        const yr = getYearFromDateString(r.debut);
        if (yr !== selectedAnalysisYear) return false;
        if (compareYtd) {
          return isWithinYtdPeriod(r.debut);
        }
        return true;
      }) : [];

      const activeConfirmedDps = rawDps.filter(r => {
        if (r.isIgnored) return false;
        const s = r.statut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return s.includes('confirme') || s.includes('cloture') || s.includes('realise') || s.includes('valide');
      });

      const rawDt = dtDirectRows ? dtDirectRows.filter(r => {
        const yr = getYearFromDateString(r.date);
        if (yr !== selectedAnalysisYear) return false;
        if (compareYtd) {
          return isWithinYtdPeriod(r.date);
        }
        return true;
      }) : [];

      const rawReseau = reseauRows ? reseauRows.filter(r => {
        const yr = getYearFromDateString(r.date);
        if (yr !== selectedAnalysisYear) return false;
        if (compareYtd) {
          return isWithinYtdPeriod(r.date);
        }
        return true;
      }) : [];

      const hasData = activeConfirmedDps.length > 0 || rawDt.length > 0 || rawReseau.length > 0;

      if (hasData) {
        const list: { name: string; count: number; hours: number }[] = [];

        const sortedDps = [...activeConfirmedDps].sort((a, b) => b.heuresBenevolatCalculees - a.heuresBenevolatCalculees);
        sortedDps.slice(0, 3).forEach(m => {
          list.push({
            name: `${m.manifestation} (${m.ul})`,
            count: 1,
            hours: Math.round(m.heuresBenevolatCalculees)
          });
        });

        if (sortedDps.length > 3) {
          const others = sortedDps.slice(3);
          list.push({
            name: `Autres postes consolidés (${others.length} DPS)`,
            count: others.length,
            hours: Math.round(others.reduce((sum, r) => sum + r.heuresBenevolatCalculees, 0))
          });
        }

        if (rawDt.length > 0) {
          list.push({
            name: `Postes direct DT (${rawDt.length} DPS)`,
            count: rawDt.length,
            hours: Math.round(rawDt.reduce((sum, r) => sum + (r.duree * r.nbSecouristes), 0))
          });
        }

        if (rawReseau.length > 0) {
          list.push({
            name: `Réseau : Gardes SDIS Versailles (${rawReseau.length} gardes)`,
            count: rawReseau.length,
            hours: Math.round(rawReseau.reduce((sum, r) => sum + r.heuresBenevolat, 0))
          });
        }

        return list.map(item => ({
          name: item.name.length > 32 ? item.name.substring(0, 32) + '...' : item.name,
          fullName: item.name,
          'Activités': item.count,
          'Heures': item.hours,
        }));
      } else {
        // 2024 and 2025 deleted/cleared years should return empty array by default unless data imported
        if (selectedAnalysisYear === 2024 || selectedAnalysisYear === 2025) {
          return [];
        }

        return [
          { name: 'Versailles Triathlon Festival', count: 1, hours: 3200 },
          { name: 'FanZone PSG-Arsenal (St Germain)', count: 1, hours: 2200 },
          { name: 'Compétition BMX J2 (BSS)', count: 1, hours: 180 },
          { name: 'Autres postes consolidés', count: 80, hours: 14500 },
          { name: 'Postes direct DT (11 DPS)', count: 11, hours: 9200 },
          { name: 'Réseau : Gardes SDIS Versailles', count: 80, hours: 7300 },
        ].map(item => ({
          name: item.name,
          fullName: item.name,
          'Activités': item.count,
          'Heures': item.hours,
        }));
      }
    } else if (stats.id === 'urgence') {
      return urgenceBreakdownData;
    } else {
      // stats.id === 'formation'
      return formationBreakdownData;
    }
  }, [
    stats.id, 
    stats.breakdown2026, 
    dpsRows, 
    dtDirectRows, 
    reseauRows, 
    selectedAnalysisYear, 
    compareYtd, 
    urgenceBreakdownData, 
    formationBreakdownData
  ]);

  const breakdownData = dynamicBreakdownData;

  const totalBreakdownHours = React.useMemo(() => {
    return dynamicBreakdownData.reduce((sum, item) => sum + (item.Heures || 0), 0) || 1;
  }, [dynamicBreakdownData]);

  // Group activities by category for Secourisme (Locaux, Territoriaux, Réseau)
  const getSecourismeTypeData = () => {
    let locauxHrs = 0;
    let locauxCount = 0;
    let terrHrs = 0;
    let terrCount = 0;
    let sdisHrs = 0;
    let sdisCount = 0;

    const rawDps = dpsRows ? dpsRows.filter(r => {
      const yr = getYearFromDateString(r.debut);
      if (yr !== selectedAnalysisYear) return false;
      if (compareYtd) {
        return isWithinYtdPeriod(r.debut);
      }
      return true;
    }) : [];

    const activeConfirmedDps = rawDps.filter(r => {
      if (r.isIgnored) return false;
      const s = r.statut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return s.includes('confirme') || s.includes('cloture') || s.includes('realise') || s.includes('valide');
    });

    const rawDt = dtDirectRows ? dtDirectRows.filter(r => {
      const yr = getYearFromDateString(r.date);
      if (yr !== selectedAnalysisYear) return false;
      if (compareYtd) {
        return isWithinYtdPeriod(r.date);
      }
      return true;
    }) : [];

    const rawReseau = reseauRows ? reseauRows.filter(r => {
      const yr = getYearFromDateString(r.date);
      if (yr !== selectedAnalysisYear) return false;
      if (compareYtd) {
        return isWithinYtdPeriod(r.date);
      }
      return true;
    }) : [];

    const hasData = activeConfirmedDps.length > 0 || rawDt.length > 0 || rawReseau.length > 0;

    if (hasData) {
      locauxHrs = activeConfirmedDps.reduce((sum, r) => sum + r.heuresBenevolatCalculees, 0);
      locauxCount = activeConfirmedDps.length;

      terrHrs = rawDt.reduce((sum, r) => sum + (r.duree * r.nbSecouristes), 0);
      terrCount = rawDt.length;

      sdisHrs = rawReseau.reduce((sum, r) => sum + r.heuresBenevolat, 0);
      sdisCount = rawReseau.length;
    } else {
      // 2024 and 2025 deleted/cleared years should return 0 by default unless data imported
      if (selectedAnalysisYear === 2024 || selectedAnalysisYear === 2025) {
        locauxHrs = 0;
        locauxCount = 0;
        terrHrs = 0;
        terrCount = 0;
        sdisHrs = 0;
        sdisCount = 0;
      } else {
        locauxHrs = 14500;
        locauxCount = 280;
        terrHrs = 9200;
        terrCount = 42;
        sdisHrs = 7300;
        sdisCount = 80;
      }
    }

    const totalHrs = locauxHrs + terrHrs + sdisHrs || 1;

    return [
      {
        id: 'locaux',
        name: 'DPS Locaux (Proximité)',
        description: 'Postes de premiers secours organisés en direct par les Unités Locales (sport amateur, kermesses, fêtes municipales).',
        hours: locauxHrs,
        count: locauxCount,
        percentage: Math.round((locauxHrs / totalHrs) * 100),
        color: '#ED1C24', // Red-cross red
        bgLight: 'bg-red-50/60',
        borderCol: 'border-red-100',
        textCol: 'text-red-700',
        badgeCol: 'bg-red-100/80 text-red-800'
      },
      {
        id: 'territoriaux',
        name: 'DPS Territoriaux (Grand Format)',
        description: 'Dispositifs départementaux d\'envergure gérés sous l\'égide de la Direction Territoriale (Versailles, Vélodrome, matches phares).',
        hours: terrHrs,
        count: terrCount,
        percentage: Math.round((terrHrs / totalHrs) * 100),
        color: '#6366F1', // Royal Indigo DT
        bgLight: 'bg-indigo-50/60',
        borderCol: 'border-indigo-150',
        textCol: 'text-indigo-700',
        badgeCol: 'bg-indigo-150 text-indigo-800'
      },
      {
        id: 'reseau',
        name: 'Réseau (Gardes SDIS)',
        description: 'Gardes opérationnelles chez les Pompiers de Versailles (SDIS 78) - Équipage standard requis de 2 secouristes par garde.',
        hours: sdisHrs,
        count: sdisCount,
        percentage: Math.round((sdisHrs / totalHrs) * 100),
        color: '#10B981', // Emerald SDIS
        bgLight: 'bg-emerald-50/60',
        borderCol: 'border-emerald-150',
        textCol: 'text-emerald-700',
        badgeCol: 'bg-emerald-105 text-emerald-800'
      }
    ];
  };

  const secourismeTypes = getSecourismeTypeData();

  // Theme colors matching Red Cross identity and clean slate styling
  const COLORS = ['#ED1C24', '#F97316', '#3B82F6', '#10B981', '#8B5CF6'];

  // Analytical observations based on selected domain
  const getObservation = (id: string) => {
    switch (id) {
      case 'secourisme':
        return {
          title: "Analyse d'activité : Secourisme",
          context: "L'année 2025 a constitué un sommet d'activité historique en raison de la mobilisation exceptionnelle pour les Jeux Olympiques et Paralympiques dans le département des Yvelines (Château de Versailles, Vélodrome National de Saint-Quentin-en-Yvelines). L'année 2026 démontre une consolidation remarquable de nos effectifs avec un niveau d'activité qui reste près de 15% supérieur à l'année de référence 2024.",
          alert: "Alerte RH : Le taux de sollicitation par bénévole atteint des seuils élevés (environ 60h par bénévole actif). Une vigilance est maintenue sur la rotation des équipes lors des DPS à fort engagement."
        };
      case 'urgence':
        return {
          title: "Analyse d'activité : Urgence",
          context: "La courbe d'activités liées à l'urgence (soutien de crise) est en nette augmentation (+62% d'activités depuis 2024). Cette hausse s'explique par la récurrence des aléas climatiques (crues fluviales locales dans les Yvelines) et le renforcement structurel de nos dispositifs de maraudes et d'accueil en cas de déclenchement du Plan Grand Froid.",
          alert: "Perspectives stratégiques : Le besoin en logistique d'urgence commande d'accélérer l'acquisition du futur Véhicule de Commandement Territorial pour une coordination préfectorale optimale."
        };
      case 'formation':
        return {
          title: "Analyse d'activité : Formation",
          context: "La progression de la formation de sécurité civile est particulièrement robuste et régulière (+24% en volume d'heures en deux ans). Ce levier est essentiel car il sensibilise le grand public (PSC1) et génère de nouvelles vocations de bénévoles opérationnels pour nos Unités Locales.",
          alert: "Débouché opérationnel : 12% des candidats formés cette année au PSC1 ont manifesté un intérêt concret pour rejoindre les rangs des équipes de secours des Yvelines."
        };
      default:
        return { title: "", context: "", alert: "" };
    }
  };

  const obs = getObservation(stats.id);

  const hasImportedDataForSelectedYear = React.useMemo(() => {
    if (stats.id !== 'secourisme') return false;
    const dpsHas = dpsRows ? dpsRows.some(r => {
      return getYearFromDateString(r.debut) === selectedAnalysisYear;
    }) : false;
    const dtHas = dtDirectRows ? dtDirectRows.some(r => {
      return getYearFromDateString(r.date) === selectedAnalysisYear;
    }) : false;
    const reseauHas = reseauRows ? reseauRows.some(r => {
      return getYearFromDateString(r.date) === selectedAnalysisYear;
    }) : false;
    return dpsHas || dtHas || reseauHas;
  }, [stats.id, dpsRows, dtDirectRows, reseauRows, selectedAnalysisYear]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
      {/* Header and selection */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-b border-slate-100 pb-5 mb-6 gap-4">
        <div>
          <h4 className="text-base font-bold text-slate-900">Analyses Visuelles : {stats.title}</h4>
          <p className="text-xs text-slate-500">Croix-Rouge française - Direction Yvelines (78)</p>
          
          {/* Actionable Year Selector pills and YTD Comparison toggle */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2">
            {availableYears.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Année d'analyse :</span>
                <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200">
                  {availableYears.map(yr => (
                    <button
                      key={yr}
                      id={`btn-year-${yr}`}
                      onClick={() => setSelectedAnalysisYear(yr)}
                      className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                        selectedAnalysisYear === yr
                          ? 'bg-[#1E293B] text-white shadow-xs font-extrabold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Période :</span>
              <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200">
                <button
                  type="button"
                  id="btn-ytd-false"
                  onClick={() => {
                    setCompareYtd(false);
                    localStorage.setItem('cr_compare_ytd', 'false');
                  }}
                  className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    !compareYtd
                      ? 'bg-white text-slate-900 shadow-xs ring-1 ring-black/5 font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Année complète
                </button>
                <button
                  type="button"
                  id="btn-ytd-true"
                  onClick={() => {
                    setCompareYtd(true);
                    localStorage.setItem('cr_compare_ytd', 'true');
                  }}
                  className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    compareYtd
                      ? 'bg-rc-red text-white shadow-xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Même Période (YTD : au 9 Juin)
                </button>
              </div>
            </div>
          </div>

          {/* Formations Unité Locale filter */}
          {stats.id === 'formation' && (
            <div className="flex flex-wrap items-center gap-2 mt-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg max-w-fit shadow-2xs">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Unité Locale :</span>
              <select
                id="select-formation-ul"
                value={selectedFormationUl}
                onChange={(e) => setSelectedFormationUl(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-300 rounded-md px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-rc-red text-ellipsis max-w-[220px]"
              >
                <option value="Tous">Tous (Ensemble des Yvelines)</option>
                {formationUls.map(ul => (
                  <option key={ul} value={ul}>{ul}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-100/80 p-1 rounded-lg flex-wrap gap-1">
          <button
            id={`tab-evolution-${stats.id}`}
            onClick={() => setActiveTab('evolution')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'evolution'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Évolution Pluriannuelle
          </button>
          <button
            id={`tab-repartition-${stats.id}`}
            onClick={() => setActiveTab('repartition')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'repartition'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Hourglass className="w-3.5 h-3.5 text-slate-500" />
            Répartition par Secteurs ({selectedAnalysisYear})
          </button>
          {stats.id === 'secourisme' && (
            <button
              id={`tab-types-volume-${stats.id}`}
              onClick={() => setActiveTab('types_volume')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'types_volume'
                  ? 'bg-white text-slate-900 shadow-xs font-extrabold border-l-2 border-rc-red sm:border-l-0'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rc-red " />
              Volume par Activité
            </button>
          )}
        </div>
      </div>

      {activeTab === 'evolution' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main double chart */}
          <div className="lg:col-span-12 space-y-6">
            <h5 className="text-xs font-semibold text-slate-705 flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-4 h-4 text-rc-red" />
              Volume d'Activité & Engagement Bénévole (2024 - 2026)
            </h5>
            
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={historyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#ED1C24" fontSize={11} tickLine={false} axisLine={false} label={{ value: 'Nb Activités', angle: -90, position: 'insideLeft', style: { fill: '#64748B', fontSize: 10 } }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} label={{ value: 'Heures de Bénévolat', angle: 90, position: 'insideRight', style: { fill: '#64748B', fontSize: 10 } }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '11px' }}
                    labelFormatter={(label) => `Année ${label}`}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar yAxisId="left" dataKey="Activités (volume)" fill="#ED1C24" radius={[4, 4, 0, 0]} barSize={40} />
                  <Line yAxisId="right" type="monotone" dataKey="Bénévole (heures)" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-400 italic text-center">
              * Note : L'axe rouge montre le nombre d'activités (colonnes). L'axe bleu correspond aux heures totales de bénévolat accumulées.
            </p>
          </div>
        </div>
      ) : activeTab === 'repartition' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Chart: DPS count breakdown / UL breakdown */}
          <div className="lg:col-span-6 space-y-4">
            <h5 className="text-xs font-semibold text-slate-705 mb-2">
              {stats.id === 'secourisme' && `Volume de DPS par Unité Locale (${selectedAnalysisYear})`}
              {stats.id === 'urgence' && `Volumétrie d'Activités par Motifs d'Urgence (${selectedAnalysisYear})`}
              {stats.id === 'formation' && (selectedFormationUl === 'Tous' 
                ? `Volumétrie par Types de Formation - Toutes UL (${selectedAnalysisYear})`
                : `Volumétrie par Types de Formation - ${selectedFormationUl} (${selectedAnalysisYear})`
              )}
            </h5>
            <div className="h-[280px]">
              {(stats.id === 'secourisme' ? ulBreakdownData.length : breakdownData.length) === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-slate-50/60 rounded-lg border border-dashed border-slate-200 text-slate-400">
                    <Hourglass className="w-8 h-8 mb-2 stroke-1 text-slate-355" />
                    <p className="text-xs font-semibold text-slate-600">Aucune donnée disponible</p>
                    {stats.id === 'secourisme' && (
                      <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">Utilisez le bouton "Intégrer des données" pour charger des postes réels.</p>
                    )}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={stats.id === 'secourisme' ? ulBreakdownData : breakdownData} 
                    layout="vertical" 
                    margin={{ top: 5, right: 10, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                    <XAxis type="number" stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={10} width={130} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: '#F8FAFC' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          if (stats.id === 'secourisme') {
                            return (
                              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-md text-xs">
                                <p className="font-semibold text-slate-900 mb-1">Croix-Rouge {data.name}</p>
                                <p className="text-red-655 font-bold"><span className="font-bold">{data.dpsCount}</span> DPS</p>
                                <p className="text-[#3B82F6] font-bold"><span className="font-bold">{data.hours.toLocaleString('fr-FR')}</span> heures bénévoles</p>
                                <p className="text-slate-500 text-[10px] mt-1 font-medium italic">Ratio : {data.dpsCount > 0 ? Math.round(data.hours / data.dpsCount) : 0}h / DPS</p>
                              </div>
                            );
                          } else {
                            return (
                              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-md text-xs">
                                <p className="font-semibold text-slate-900 mb-1">{data.fullName}</p>
                                <p className="text-red-655 font-bold"><span className="font-bold">{data.Activités}</span> activités</p>
                                <p className="text-[#3B82F6] font-bold"><span className="font-bold">{data.Heures}</span> heures cumulées ({data.Activités > 0 ? Math.round(data.Heures / data.Activités) : 0}h / act)</p>
                              </div>
                            );
                          }
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey={stats.id === 'secourisme' ? 'dpsCount' : 'Activités'} fill="#ED1C24" radius={[0, 4, 4, 0]}>
                      {(stats.id === 'secourisme' ? ulBreakdownData : breakdownData).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Right Chart: Time split by UL */}
          <div className="lg:col-span-6 space-y-4">
            <h5 className="text-xs font-semibold text-slate-705 mb-2">
              {stats.id === 'secourisme' && `Bénévolat : Volume horaire cumulé par Unité Locale (${selectedAnalysisYear})`}
              {stats.id === 'urgence' && `Bénévolat : Investissement Temps cumulé par Motifs d'Urgence (${selectedAnalysisYear})`}
              {stats.id === 'formation' && (selectedFormationUl === 'Tous'
                ? `Bénévolat : Investissement Temps cumulé de Formation - Toutes UL (${selectedAnalysisYear})`
                : `Bénévolat : Investissement Temps cumulé de Formation - ${selectedFormationUl} (${selectedAnalysisYear})`
              )}
            </h5>
            <div className="h-[280px] flex items-center justify-center">
              {(stats.id === 'secourisme' ? ulBreakdownData.length : breakdownData.length) === 0 ? (
                <div className="h-full w-full flex flex-col items-center justify-center text-center p-4 bg-slate-50/60 rounded-lg border border-dashed border-slate-200 text-slate-400">
                    <Clock className="w-8 h-8 mb-2 stroke-1 text-slate-355" />
                    <p className="text-xs font-semibold text-slate-600">Aucun volume horaire à modéliser</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.id === 'secourisme' ? ulBreakdownData : breakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey={stats.id === 'secourisme' ? 'hours' : 'Heures'}
                      >
                        {(stats.id === 'secourisme' ? ulBreakdownData : breakdownData).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const currentYearStats = stats.history.find(h => h.year === selectedAnalysisYear);
                            const totalHrs = stats.id === 'secourisme'
                              ? (currentYearStats?.volunteerHours || 1)
                              : totalBreakdownHours;
                            if (stats.id === 'secourisme') {
                              return (
                                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-md text-xs">
                                  <p className="font-semibold text-slate-900 mb-1">Croix-Rouge {data.name}</p>
                                  <p className="text-[#3B82F6] font-bold">{data.hours.toLocaleString('fr-FR')} heures ({Math.round((data.hours / totalHrs) * 100)}%)</p>
                                </div>
                              );
                            } else {
                              return (
                                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-md text-xs">
                                  <p className="font-semibold text-slate-900 mb-1">{data.name}</p>
                                  <p className="text-[#3B82F6] font-bold">{data.Heures.toLocaleString('fr-FR')} heures ({Math.round((data.Heures / totalHrs) * 100)}%)</p>
                                </div>
                              );
                            }
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col justify-center space-y-2 max-w-[220px] text-xs">
                    {(stats.id === 'secourisme' ? ulBreakdownData : breakdownData).map((entry, index) => {
                      const valueHours = stats.id === 'secourisme' ? entry.hours : (entry as any).Heures;
                      return (
                        <div key={entry.name} className="flex items-start gap-1.5">
                          <span className="w-3 h-3 rounded mt-0.5 shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-[11px] text-slate-600 line-clamp-1" title={stats.id === 'secourisme' ? `Croix-Rouge ${entry.name}` : (entry as any).fullName}>
                            {stats.id === 'secourisme' ? `UL ${entry.name}` : (entry as any).fullName} : <b className="text-slate-850 font-semibold">{valueHours.toLocaleString('fr-FR')}h</b>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* types_volume SECOURISME CUSTOM VIEW */
        <div className="space-y-6">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <Info className="w-4.5 h-4.5 text-slate-500 mt-0.5 shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-slate-850 uppercase tracking-tight">Répartition par filières d'activité</h5>
                <p className="text-[11px] text-slate-550 leading-relaxed max-w-3xl mt-0.5">
                  Visualisation modulaire du bénévolat secours consolidé en {selectedAnalysisYear}. L'engagement est ventilé entre les interventions de proximité (DPS locaux), les dispositifs territoriaux (DPS DT / Postes Directs) et le réseau opérationnel d'urgence auprès des pompiers (Réseau : Gardes SDIS).
                </p>
              </div>
            </div>

            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md border shrink-0 ${
              hasImportedDataForSelectedYear 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-250 font-extrabold animate-pulse'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {hasImportedDataForSelectedYear 
                ? `● Mode : Données Réelles Importées (${selectedAnalysisYear})` 
                : `● Mode : Modèle de Référence (Simulé ${selectedAnalysisYear})`}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Visual stacked gauge & Recharts Bar Chart */}
            <div className="lg:col-span-12 space-y-4 bg-white p-5 rounded-xl border border-slate-150 shadow-2xs">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-extrabold text-slate-700 uppercase tracking-tight flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-rc-red" />
                  Visualisation comparative : volumes horaires de bénévolat
                </h5>
                <span className="text-[10px] text-slate-450 font-bold font-mono">Cumul h {selectedAnalysisYear} : {secourismeTypes.reduce((s, x) => s + x.hours, 0).toLocaleString('fr-FR')} h</span>
              </div>

              {/* Stacked Percentage Gauge */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
                  <span>Proportions relatives des filières</span>
                  <span className="font-mono text-slate-800">100% de l'effort Secourisme</span>
                </div>
                <div className="flex h-7 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs">
                  {secourismeTypes.map(typ => typ.hours > 0 && (
                    <div 
                      key={typ.id}
                      style={{ width: `${typ.percentage}%`, backgroundColor: typ.color }}
                      className="transition-all duration-300 hover:brightness-95 relative group flex items-center justify-center cursor-pointer"
                      title={`${typ.name}: ${typ.hours.toLocaleString('fr-FR')}h (${typ.percentage}%)`}
                    >
                      {typ.percentage > 5 && (
                        <span className="text-[10px] font-extrabold text-white font-mono leading-none drop-shadow-sm select-none">
                          {typ.percentage}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recharts Bar Chart specifically custom styled for the 3 types */}
              <div className="h-[220px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={secourismeTypes} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', fontSize: '11px' }}
                      formatter={(value: any) => [`${value.toLocaleString('fr-FR')} h`, 'Heures de bénévolat']}
                    />
                    <Bar dataKey="hours" radius={[6, 6, 0, 0]} barSize={55} animationDuration={800}>
                      {secourismeTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Bento Grid comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {secourismeTypes.map((category) => {
              const IsLocal = category.id === 'locaux';
              const IsTerr = category.id === 'territoriaux';
              const IsReseau = category.id === 'reseau';
              
              return (
                <div 
                  key={category.id} 
                  className={`bg-white rounded-xl border border-slate-200 transition-all hover:shadow-md overflow-hidden flex flex-col justify-between`}
                >
                  <div className="p-5 space-y-4">
                    {/* Small visual accent line */}
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${category.bgLight} ${category.textCol}`}>
                        {IsLocal && <Home className="w-5 h-5" />}
                        {IsTerr && <Shield className="w-5 h-5" />}
                        {IsReseau && <Flame className="w-5 h-5 text-emerald-650" />}
                      </div>
                      
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${category.badgeCol} uppercase tracking-wider`}>
                        {category.percentage}% du total
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h6 className="text-xs font-bold text-slate-850 uppercase tracking-tight">{category.name}</h6>
                      <p className="text-[11px] text-slate-500 leading-relaxed min-h-[50px]">{category.description}</p>
                    </div>

                    {/* Big numbers block */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-450 tracking-wider flex items-center gap-0.5">
                          <Clock className="w-3 h-3 text-slate-400" /> Bénévolat
                        </span>
                        <div className="mt-1 flex items-baseline gap-0.5">
                          <span className="text-lg font-extrabold text-slate-850 font-mono">
                            {category.hours.toLocaleString('fr-FR')}
                          </span>
                          <span className="text-[10px] text-slate-550 font-bold">h</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-450 tracking-wider flex items-center gap-0.5">
                          <Users className="w-3 h-3 text-slate-400" /> Actions
                        </span>
                        <div className="mt-1 flex items-baseline gap-0.5">
                          <span className="text-lg font-extrabold text-slate-850 font-mono">
                            {category.count}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase">
                            {IsReseau ? 'gardes' : 'postes'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer ratio & operational rule reminder */}
                  <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-650">Ratio d'engagement</span>
                    <span className="font-bold text-slate-850 font-mono">
                      {category.count > 0 ? Math.round(category.hours / category.count) : 0} h / act
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
