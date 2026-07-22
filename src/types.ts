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

export interface ExtraFormationItem {
  title: string;
  sessions: number;
  stagiaires: number;
  heures: number;
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
  extraFormations?: ExtraFormationItem[];
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

// Utility to format any Excel cell date value (string, Date object, or numeric Excel serial date) to YYYY-MM-DD HH:MM
export const formatExcelCellValue = (val: any): string => {
  if (val === undefined || val === null) return '';
  
  if (val instanceof Date) {
    const y = val.getUTCFullYear();
    const m = String(val.getUTCMonth() + 1).padStart(2, '0');
    const d = String(val.getUTCDate()).padStart(2, '0');
    const h = String(val.getUTCHours()).padStart(2, '0');
    const mi = String(val.getUTCMinutes()).padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${mi}`;
  }

  const str = String(val).trim();
  if (!str) return '';

  const num = Number(str);
  if (!isNaN(num) && num > 0 && /^\d+(\.\d+)?$/.test(str)) {
    try {
      let parsedAsSerial = '';
      let parsedYear = 0;
      
      if (num < 100000) {
        let days = Math.floor(num);
        if (days >= 60) {
          days--; // Excel 1900 leap year bug
        }
        const baseDate = new Date(Date.UTC(1899, 11, 31));
        const msInDay = 24 * 60 * 60 * 1000;
        const timeMs = baseDate.getTime() + days * msInDay;
        const fractional = num - Math.floor(num);
        const timeOfDayMs = Math.round(fractional * msInDay);
        const date = new Date(timeMs + timeOfDayMs);
        
        if (!isNaN(date.getTime())) {
          parsedYear = date.getUTCFullYear();
          const y = parsedYear;
          const m = String(date.getUTCMonth() + 1).padStart(2, '0');
          const d = String(date.getUTCDate()).padStart(2, '0');
          const h = String(date.getUTCHours()).padStart(2, '0');
          const mi = String(date.getUTCMinutes()).padStart(2, '0');
          parsedAsSerial = `${y}-${m}-${d} ${h}:${mi}`;
        }
      }

      // If the parsed year from serial date is within a realistic operational range (2010 to 2040), we accept it
      if (parsedAsSerial && parsedYear >= 2010 && parsedYear <= 2040) {
        return parsedAsSerial;
      }

      // If it yielded an unrealistic year (e.g. 1955), check if the integer part is a packed year format (like 20266 representing June 2026)
      const intPartStr = String(Math.floor(num));
      const isYearPrefixed = intPartStr.startsWith('201') || intPartStr.startsWith('202') || intPartStr.startsWith('203');
      
      if (isYearPrefixed) {
        const year = parseInt(intPartStr.substring(0, 4), 10);
        let month = 1;
        let day = 1;
        let validPacked = false;

        if (intPartStr.length === 8) {
          // YYYYMMDD
          month = parseInt(intPartStr.substring(4, 6), 10);
          day = parseInt(intPartStr.substring(6, 8), 10);
          if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            validPacked = true;
          }
        } else if (intPartStr.length === 6) {
          // YYYYMM
          month = parseInt(intPartStr.substring(4, 6), 10);
          if (month >= 1 && month <= 12) {
            validPacked = true;
          }
        } else if (intPartStr.length === 5) {
          // YYYYM (e.g. 20266 representing year 2026, month 6)
          month = parseInt(intPartStr.substring(4, 5), 10);
          if (month >= 1 && month <= 9) {
            validPacked = true;
          }
        }

        if (validPacked) {
          // Extract time from fractional part
          const fractional = num - Math.floor(num);
          let hStr = '00';
          let miStr = '00';
          if (fractional > 0) {
            const msInDay = 24 * 60 * 60 * 1000;
            const timeOfDayMs = Math.round(fractional * msInDay);
            const totalMinutes = Math.floor(timeOfDayMs / (60 * 1000));
            const hrs = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            hStr = String(hrs).padStart(2, '0');
            miStr = String(mins).padStart(2, '0');
          }
          const mStr = String(month).padStart(2, '0');
          const dStr = String(day).padStart(2, '0');
          return `${year}-${mStr}-${dStr} ${hStr}:${miStr}`;
        }
      }

      // Fallback to parsedAsSerial if nothing else matches (even if out of reasonable year range)
      if (parsedAsSerial) {
        return parsedAsSerial;
      }
    } catch (e) {
      // fallback
    }
  }

  return str;
};

