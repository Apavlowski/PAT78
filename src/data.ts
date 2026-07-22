/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MetierStats, StrategicGoal, SocialActivityData } from './types';

// Realistic 2024, 2025, 2026 data for Croix-Rouge française des Yvelines (DTUS 78)
export const INITIAL_METIER_STATS: MetierStats[] = [
  {
    id: 'secourisme',
    title: 'Secourisme',
    description: 'Postes de secours (DPS), réseaux de secours (gardes BSPP/SAMU) et assistance technique.',
    iconName: 'ShieldAlert',
    history: [
      { year: 2024, activitiesCount: 0, volunteerHours: 0 },
      { year: 2025, activitiesCount: 0, volunteerHours: 0 },
      { year: 2026, activitiesCount: 0, volunteerHours: 0 }
    ],
    breakdown2026: []
  },
  {
    id: 'urgence',
    title: 'Urgence et soutien de crise',
    description: 'Soutien aux populations, hébergement d\'urgence (Grand Froid), interventions sur sinistres (incendies, crues).',
    iconName: 'FlameKindling',
    history: [
      { year: 2024, activitiesCount: 0, volunteerHours: 0 },
      { year: 2025, activitiesCount: 64, volunteerHours: 5400 },
      { year: 2026, activitiesCount: 78, volunteerHours: 7200 } // Growth due to extreme weather & plan grand froid reinforcement
    ],
    breakdown2026: [
      { name: 'Plan Grand Froid (Maraudes & Centres)', count: 32, hours: 3400 },
      { name: 'Soutien Incendies & Évacuations Habitations', count: 18, hours: 1200 },
      { name: 'Crues de la Seine & Affluents (Soutien)', count: 14, hours: 1500 },
      { name: 'Centres d\'Accueil Collectif de Crise (CAI)', count: 8, hours: 800 },
      { name: 'Exercices Thématiques Territoriaux', count: 6, hours: 300 }
    ]
  },
  {
    id: 'formation',
    title: 'Formation Sécurité Civile',
    description: 'Formations (ePSC, PSC1, IPS) et qualifiantes pour les secouristes.',
    iconName: 'GraduationCap',
    history: [
      { year: 2024, activitiesCount: 210, volunteerHours: 6800 },
      { year: 2025, activitiesCount: 235, volunteerHours: 7900 },
      { year: 2026, activitiesCount: 260, volunteerHours: 9100 }
    ],
    breakdown2026: [
      { name: 'PSC1 (Prévention et Secours Civiques de niveau 1)', count: 185, hours: 5200 },
      { name: 'PSE1 & PSE2 (Secouristes Opérationnels)', count: 28, hours: 2100 },
      { name: 'Formations de Formateurs (Secourisme / PSC)', count: 12, hours: 900 },
      { name: 'IPS & IPSEN (Initiations Enfants/Nourrissons)', count: 30, hours: 600 },
      { name: 'Formations Spécifiques Urgence / Logistique', count: 5, hours: 300 }
    ]
  }
];

// Strategic 4-year projection goals (2026-2030)
export const STRATEGIC_GOALS: StrategicGoal[] = [
  // Urgence
  {
    id: 'urg_cai',
    category: 'urgence',
    title: "Nombre de lots CAI",
    description: "Centres d'Accueil des Impliqués. Matériel technique et d'accueil physique d'urgence pour zones d'évacuation.",
    type: 'quantitatif',
    target: "Disposer de 6 lots CAI prêts au déploiement",
    startValue: 2,
    currentValue: 4,
    targetValue: 6,
    unit: 'lots CAI',
    statusText: 'Déploiement en cours sur les communes cibles',
    progress: 50,
    fourYearHorizon: '2030'
  },
  {
    id: 'urg_chu',
    category: 'urgence',
    title: "Nombre de lots CHU",
    description: "Centres d'Hébergement d'Urgence. Équipements de couchage d'urgence mobile (lits, duvets et kits d'hygiène).",
    type: 'quantitatif',
    target: "Disposer de 5 lots CHU complets (250 places cumulées)",
    startValue: 1,
    currentValue: 3,
    targetValue: 5,
    unit: 'lots CHU',
    statusText: 'Renforcement du stock d’hébergement temporaire',
    progress: 50,
    fourYearHorizon: '2030'
  },
  {
    id: 'urg_cmcc',
    category: 'urgence',
    title: "Nombre de lots CMCC",
    description: "Cellules Mobiles de Commande et de Coordination. Systèmes de télécommunications et PC mobiles itinérants.",
    type: 'quantitatif',
    target: "Avoir 2 cellules radio mobiles de commandement opérationnelles",
    startValue: 1,
    currentValue: 1,
    targetValue: 2,
    unit: 'lots CMCC',
    statusText: '1 cellule de direction opérationnelle déjà active',
    progress: 0,
    fourYearHorizon: '2030'
  },
  {
    id: 'urg_pai',
    category: 'urgence',
    title: "Nombre de PAI",
    description: "Postes d'Accueil des Impliqués. Matériels d'accueil psycho-social, d'enregistrement et de soutien d'urgence.",
    type: 'quantitatif',
    target: "Mettre en service 4 lots PAI répartis sur le département",
    startValue: 1,
    currentValue: 2,
    targetValue: 4,
    unit: 'PAI',
    statusText: '2 installations opérationnelles de premier secours socio-médical',
    progress: 33,
    fourYearHorizon: '2030'
  },
  {
    id: 'urg_local_capacity',
    category: 'urgence',
    title: "Nombre d'équipes locales d'urgence",
    description: "Équipes Locales d'Urgence (ÉLU) opérationnelles agréées au sein des Unités Locales.",
    type: 'quantitatif',
    target: "Mettre en place 10 Équipes Locales d'Urgence (ÉLU) autonomes",
    startValue: 2,
    currentValue: 6,
    targetValue: 10,
    unit: 'équipes',
    statusText: '6 unités territoriales dotées d\'équipes locales entraînées',
    progress: 50,
    fourYearHorizon: '2030'
  },
  {
    id: 'urg_conventions',
    category: 'urgence',
    title: "Nombre de conventions avec les communes",
    description: "Conventions cadres de partenariat signées pour l'organisation et l'anticipation de la réponse de crise locale.",
    type: 'quantitatif',
    target: "Signer des conventions formelles avec 30 communes clés",
    startValue: 5,
    currentValue: 18,
    targetValue: 30,
    unit: 'conventions',
    statusText: 'Forte dynamique partenariale engagée avec les maires',
    progress: 52,
    fourYearHorizon: '2030'
  },
  {
    id: 'urg_formateurs',
    category: 'urgence',
    title: "Nombre de formateurs à l'urgence",
    description: "Formateurs d'urgence et de spécialités de crise actifs (sauvetage, logistique, commandement).",
    type: 'quantitatif',
    target: "Maintenir un vivier de 15 formateurs d'urgence actifs",
    startValue: 3,
    currentValue: 9,
    targetValue: 15,
    unit: 'formateurs',
    statusText: 'Nouveau stage départemental planifié',
    progress: 50,
    fourYearHorizon: '2030'
  },
  
  // Formation
  {
    id: 'for_psc_formees',
    category: 'formation',
    title: "Nombre de personnes formées au PSC",
    description: "Citoyens formés au Premiers Secours Civiques par nos formateurs agréés.",
    type: 'quantitatif',
    target: "Former 4 500 personnes au PSC par an",
    startValue: 2500,
    currentValue: 3800,
    targetValue: 4500,
    unit: 'personnes',
    statusText: 'Soutien des partenariats scolaires et entreprises',
    progress: 65,
    fourYearHorizon: '2030'
  },
  {
    id: 'for_formateurs_psc',
    category: 'formation',
    title: "Nombre de formateurs PSC",
    description: "Moniteurs et formateurs d'adultes PSC1 actifs habilités dans les Unités Locales.",
    type: 'quantitatif',
    target: "Atteindre 50 formateurs PSC actifs et recyclés",
    startValue: 22,
    currentValue: 38,
    targetValue: 50,
    unit: 'formateurs',
    statusText: 'Forte implication lors des recyclages nationaux obligatoires',
    progress: 57,
    fourYearHorizon: '2030'
  },

  // Secourisme
  {
    id: 'sec_dps_count',
    category: 'secourisme',
    title: "Nombre de DPS (Équivalents 4p. / 4h)",
    description: "Dispositifs Prévisionnels de Secours d'urgence pour la couverture sanitaire de manifestations publiques (calculé sur la base d'un standard de 4 secouristes pendant 4 heures, soit 16 heures de bénévolat par DPS).",
    type: 'quantitatif',
    target: "Assurer la tenue de 600 DPS de secours par an",
    startValue: 380,
    currentValue: 512,
    targetValue: 600,
    unit: 'DPS',
    statusText: 'Demandes croissantes liées à la reprise sportive',
    progress: 60,
    fourYearHorizon: '2030'
  },
  {
    id: 'sec_dps_finance',
    category: 'secourisme',
    title: "Valeur des produits financiers associés aux DPS (global)",
    description: "Produits de facturation issus de la réalisation de DPS, affectés à l'achat de matériel d'urgence.",
    type: 'quantitatif',
    target: "Générer 150 k€ de produits d'exploitation DPS annuels",
    startValue: 60,
    currentValue: 112,
    targetValue: 150,
    unit: 'k€',
    statusText: 'Indexation des grilles tarifaires départementales ajustée',
    progress: 58,
    fourYearHorizon: '2030'
  },
  {
    id: 'sec_pse_volunteers',
    category: 'secourisme',
    title: "Nombre de PSE",
    description: "Secouristes équipiers actifs titulaires du diplôme national de Premiers Secours en Équipe.",
    type: 'quantitatif',
    target: "Atteindre 400 équipiers secouristes PSE validés de niveau 1 & 2",
    startValue: 250,
    currentValue: 320,
    targetValue: 400,
    unit: 'secouristes PSE',
    statusText: 'Formations initiales programmées au premier semestre',
    progress: 47,
    fourYearHorizon: '2030'
  }
];

// Mock data representing the DTAS "Activités Sociales" (Lot 2 teaser)
export const SOCIAL_ACTIVITIES_MOCK: SocialActivityData[] = [
  {
    id: 'social_aide_alimentaire',
    title: 'Aide Alimentaire & Administrative',
    description: 'Distribution de colis repas, épiceries sociales, petits déjeuners et aide au retour aux droits.',
    iconName: 'Apple',
    metrics: [
      { label: 'Personnes Accompagnées', value: '14 200', sublabel: 'Familles yvelinoises', trend: 'up' },
      { label: 'Tonnes Distribuées', value: '185 T', sublabel: 'Sourcing local et banques', trend: 'up' },
      { label: 'Heures de Bénévolat', value: '12 800 h', sublabel: 'Investissement social', trend: 'up' }
    ],
    strategicProgress: 75
  },
  {
    id: 'social_isolement',
    title: 'Lutte contre l\'Isolement',
    description: 'Visites aux personnes âgées, appels téléphoniques de convivialité, et maraudes de soutien moral.',
    iconName: 'HeartHandshake',
    metrics: [
      { label: 'Séniors Accompagnés', value: '820', sublabel: 'Visites à domicile', trend: 'up' },
      { label: 'Appels Conviviaux', value: '3 400', sublabel: 'Croix-Rouge chez vous 78', trend: 'stable' },
      { label: 'Bénévoles Engagés', value: '140', sublabel: 'Équipe de proximité', trend: 'up' }
    ],
    strategicProgress: 60
  },
  {
    id: 'social_vestiboutique',
    title: 'Vestiboutiques & Accompagnement Matériel',
    description: 'Vente solidaire de vêtements de seconde main de qualité et accompagnement vestimentaire d\'urgence.',
    iconName: 'ShoppingBag',
    metrics: [
      { label: 'Boutiques Actives', value: '8', sublabel: 'Partout dans le 78', trend: 'stable' },
      { label: 'Articles Donnés / Vendus', value: '25 000', sublabel: 'Vêtements de seconde main', trend: 'up' },
      { label: 'Recettes réinvesties', value: '45 k€', sublabel: 'Pour financer le social', trend: 'up' }
    ],
    strategicProgress: 88
  }
];

// Pre-generated CSV text for template simulation, helping users test upload
export const SAMPLE_CSV_TEMPLATE_SECOURISME = `Métier,Année,Nombre d'Activités,Heures de Bénévolat
Secourisme,2024,420,24500
Secourisme,2025,512,32600
Secourisme,2026,520,31000`;

export const SAMPLE_CSV_TEMPLATE_COMPLET = `Métier,Année,Nombre d'Activités,Heures de Bénévolat
Secourisme,2024,420,24500
Secourisme,2025,512,32600
Secourisme,2026,505,31200
Urgence,2024,0,0
Urgence,2025,64,5400
Urgence,2026,90,8100
Formation,2024,210,6800
Formation,2025,235,7900
Formation,2026,290,10500`;

// Helper: Parse CSV string to updated model
export function parseCSVData(csvText: string): { success: boolean; data?: MetierStats[]; error?: string } {
  try {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      return { success: false, error: 'Fichier vide ou incorrect' };
    }

    // Verify headers (dynamic check for accents and synonyms)
    const headerLine = lines[0].toLowerCase();
    const delimiter = headerLine.includes(';') ? ';' : ',';
    const headerParts = headerLine.split(delimiter).map(h => h.trim());
    
    let metierIdx = -1;
    let yearIdx = -1;
    let countIdx = -1;
    let hoursIdx = -1;

    headerParts.forEach((part, index) => {
      // Metier synonyms
      if (part.includes('metier') || part.includes('métier') || part.includes('service') || part.includes('pole') || part.includes('type') || part.includes('domaine')) {
        metierIdx = index;
      }
      // Year synonyms
      else if (part.includes('annee') || part.includes('année') || part.includes('an') || part.includes('year') || part.includes('date')) {
        yearIdx = index;
      }
      // Count synonyms
      else if (part.includes('activit') || part.includes('action') || part.includes('nombre') || part.includes('count') || part.includes('volume') || part.includes('total') || part.includes('qte') || part.includes('qté')) {
        countIdx = index;
      }
      // Hours synonyms
      else if (part.includes('heure') || part.includes('benevolat') || part.includes('bénévolat') || part.includes('volunteer') || part.includes('hours') || part.includes('h ')) {
        hoursIdx = index;
      }
    });

    // Fallback if not identified
    if (metierIdx === -1) metierIdx = 0;
    if (yearIdx === -1) yearIdx = 1;
    if (countIdx === -1) countIdx = 2;
    if (hoursIdx === -1) hoursIdx = 3;

    // Structure list structure
    const updates: { metier: string; year: number; count: number; hours: number }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split(delimiter);
      if (parts.length < Math.max(metierIdx, yearIdx, countIdx, hoursIdx) + 1) {
        continue;
      }

      const metierStr = (parts[metierIdx] || '').trim().toLowerCase();
      const year = parseInt((parts[yearIdx] || '').trim().replace(/['"\s]/g, ''), 10);
      const count = parseInt((parts[countIdx] || '').trim().replace(/['"\s]/g, ''), 10);
      const hours = parseInt((parts[hoursIdx] || '').trim().replace(/['"\s]/g, ''), 10);

      if (isNaN(year) || isNaN(count) || isNaN(hours)) {
        // Log or return error if data is clearly malformed, but skip empty or header lines
        if (metierStr) {
          return { success: false, error: `Erreur à la ligne ${i + 1} : les données chiffrées doivent être des nombres ("${parts[yearIdx]}", "${parts[countIdx]}", "${parts[hoursIdx]}")` };
        }
        continue;
      }

      updates.push({ metier: metierStr, year, count, hours });
    }

    if (updates.length === 0) {
      return { success: false, error: 'Aucune ligne de données exploitable trouvée. Assurez-vous d\'avoir au moins une ligne valide.' };
    }

    // Deep clone the base stats
    const newStats: MetierStats[] = JSON.parse(JSON.stringify(INITIAL_METIER_STATS));

    // Map metier string to ID
    const translateMetier = (input: string): string | null => {
      const normalized = input.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      if (normalized.includes('secou')) return 'secourisme';
      if (normalized.includes('urg')) return 'urgence';
      if (normalized.includes('format')) return 'formation';
      return null;
    };

    updates.forEach(up => {
      const targetId = translateMetier(up.metier);
      if (!targetId) return;

      const metierObj = newStats.find(m => m.id === targetId);
      if (metierObj) {
        // Find existing year or create new
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
          // Sort by year
          metierObj.history.sort((a, b) => a.year - b.year);
        }
      }
    });

    return { success: true, data: newStats };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur inattendue de lecture' };
  }
}
