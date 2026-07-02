/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MetierType = 'secourisme' | 'urgence' | 'formation';

export interface YearlyData {
  year: number;
  activitiesCount: number;
  volunteerHours: number;
}

export interface ActivityBreakdown {
  name: string;
  count: number;
  hours: number;
}

export interface MetierStats {
  id: MetierType;
  title: string;
  description: string;
  iconName: string;
  history: YearlyData[];
  breakdown2026: ActivityBreakdown[];
}

export interface StrategicGoal {
  id: string;
  category: MetierType;
  title: string;
  description: string;
  type: 'quantitatif' | 'qualitatif';
  target: string;
  startValue: number;
  currentValue: number;
  targetValue: number;
  unit?: string;
  statusText: string;
  progress: number; // 0 to 100
  fourYearHorizon: string; // Target year, e.g., "2029"
}

export interface ParsedDpsRow {
  ul: string;
  manifestation: string;
  statut: string;
  debut: string;
  fin: string;
  heuresDps: number;
  prelevement: number;
  tarifTheorique: number;
  dimensionnement: string;
  secouristesEngages: number;
  evac: boolean;
  heuresBenevolatCalculees: number;
  invalidReason?: string;
  isIgnored: boolean;
  isAlreadyKnown?: boolean;
  // Clinical Tech stats
  nbSoins: number;
  nbEvac: number;
  nbTrauma: number;
  nbMalaise: number;
  nbInconscient: number;
  nbAcr: number;
  medicalise: boolean;
}

export interface ParsedDtDirectRow {
  label: string;
  date: string;
  duree: number;
  nbSecouristes: number;
  devisSecours: number; 
  devisCrss: string; // non-empty means medicalised
  isMedicalise: boolean;
  reversementUl: number;
  repas: number;
  caNet: number;
  nbVacations4h: number;
  nbSoins: number;
  nbDecharge: number;
  nbEvac: number;
  nbAutre: number;
  nbPetitsSoins: number;
  nbTrauma: number;
  nbMalaise: number;
  nbInconscient: number;
  nbAcr: number;
  gainDt: number; // calculated: Devis secours - Reversement UL - Repas
  isAlreadyKnown?: boolean;
}

export interface ParsedReseauRow {
  date: string;
  duree: number;             // hours of guard duty, e.g. 12 or 24
  secouristesEngages: number; // always 4
  heuresBenevolat: number;    // calculated as: duree * 4
  isAlreadyKnown?: boolean;
}

export interface ParsedUrgenceRow {
  dateDebut: string;
  dateFin: string;
  agrementMobilise: string;
  contexteDescription: string;
  raisons: string;
  zoneAction: string;
  appelCo: string;
  integreBa: string;
  nbPriseEnCharge: number;
  moyensHumains: string;
  moyensMateriel: string;
  heuresBenevolat: number;
  isAlreadyKnown?: boolean;
}

export interface ParsedFormationPublicRow {
  ul: string;
  year: number;
  epscSessions: number;
  epscStagiaires: number;
  epscHeures: number;
  pscSessions: number;
  pscStagiaires: number;
  pscHeures: number;
  ipsenSessions: number;
  ipsenStagiaires: number;
  ipsenHeures: number;
  gqsSessions: number;
  gqsStagiaires: number;
  gqsHeures: number;
  recyclageSessions: number;
  recyclageStagiaires: number;
  recyclageHeures: number;
  isAlreadyKnown?: boolean;
}

// Support for Social Activities (Lot 2 teaser)
export type SocialMetierType = 'social_aide_alimentaire' | 'social_isolement' | 'social_vestiboutique';

export interface SocialActivityData {
  id: SocialMetierType;
  title: string;
  description: string;
  iconName: string;
  metrics: {
    label: string;
    value: string | number;
    sublabel: string;
    trend: 'up' | 'down' | 'stable';
  }[];
  strategicProgress: number;
}

// Utility to parse year from dates in various formats (ISO, FR, etc.)
export const getYearFromDateString = (dateStr?: string): number => {
  if (!dateStr) return 2026;
  const trimmed = dateStr.trim();
  // Check if it starts with 4 digits (ISO: YYYY-MM-DD)
  const isoMatch = trimmed.match(/^(\d{4})/);
  if (isoMatch) {
    return parseInt(isoMatch[1], 10);
  }
  // Check if it ends with 4 digits or contains /YYYY or -YYYY (French: DD/MM/YYYY)
  const frMatch = trimmed.match(/(?:\/|-)(\d{4})/);
  if (frMatch) {
    return parseInt(frMatch[1], 10);
  }
  // Fallback: look for any 4 digit sequence
  const anyFourDigits = trimmed.match(/\b(\d{4})\b/);
  if (anyFourDigits) {
    return parseInt(anyFourDigits[1], 10);
  }
  return 2026;
};

