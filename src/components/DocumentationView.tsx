/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  BookOpen, 
  FileText, 
  Sliders, 
  Table2, 
  HelpCircle, 
  Terminal, 
  CheckCircle2, 
  Download, 
  Cpu, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Layers,
  MapPin,
  Calendar,
  Check,
  Eye,
  Printer,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DocumentationViewProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'guide' | 'imports' | 'captures' | 'tech';

export const DocumentationView: React.FC<DocumentationViewProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('guide');
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    document.body.classList.add('print-doc-only');
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('print-doc-only');
        setIsPrinting(false);
      }, 500);
    }, 300);
  };

  const handleDownloadHTML = () => {
    setIsDownloading(true);
    
    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dossier de Spécifications Techniques & Guide de Transition - Croix-Rouge française DTUS 78</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
    }
    code, pre {
      font-family: 'JetBrains Mono', monospace;
    }
    @media print {
      body {
        background: white !important;
        color: black !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .no-print {
        display: none !important;
      }
      .page-break {
        page-break-before: always !important;
        break-before: page !important;
      }
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800">
  <!-- Interactive banner for printing -->
  <div class="no-print bg-slate-900 text-white py-3.5 px-6 sticky top-0 z-50 flex flex-wrap justify-between items-center gap-4 shadow-md border-b border-slate-800">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-extrabold text-white text-xl">
        +
      </div>
      <div>
        <h1 class="text-xs font-black uppercase tracking-wider text-slate-100">Croix-Rouge française Yvelines</h1>
        <p class="text-[10px] text-slate-400 font-medium">Projet DTUS 78 • Dossier de Spécifications Techniques</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button onclick="window.print()" class="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-xs py-2 px-4 rounded transition cursor-pointer shadow-sm">
        Imprimer le Dossier de Transition (PDF / Papier)
      </button>
    </div>
  </div>

  <div class="max-w-4xl mx-auto my-8 bg-white p-12 shadow-sm rounded-xl border border-slate-200 print:shadow-none print:border-none print:my-0 print:p-0">
    <!-- PAGE 1: COVER PAGE -->
    <div class="flex flex-col justify-between h-[26.5cm] border-4 border-slate-900 p-10">
      <div>
        <div class="flex items-center gap-4 border-b-2 border-red-600 pb-6 mb-12">
          <div class="w-12 h-12 bg-red-600 rounded flex items-center justify-center font-extrabold text-white text-3xl">
            +
          </div>
          <div>
            <h1 class="text-xl font-black uppercase tracking-wider text-slate-900">Croix-Rouge française</h1>
            <p class="text-[10px] font-semibold uppercase tracking-widest text-red-600">Yvelines • DTUS 78</p>
          </div>
        </div>

        <div class="mt-20 space-y-4">
          <h1 class="text-3xl font-black text-slate-900 tracking-tight leading-tight uppercase">
            Dossier de Spécifications Techniques &amp; Guide d'Utilisation
          </h1>
          <p class="text-sm text-slate-600 font-semibold max-w-2xl">
            Application Territoriale de Pilotage d'Activité et de Dialogue Stratégique de la DTUS des Yvelines (78).
          </p>
          
          <div class="bg-slate-50 p-6 rounded-md border border-slate-200 mt-8 space-y-2 text-xs">
            <p class="font-bold text-slate-800 uppercase text-[10px]">Statut du document : Dossier de Transition</p>
            <p class="text-slate-600 leading-relaxed">
              Ce livrable technique complet a été rédigé à l'attention de l'équipe de développement informatique reprenant le projet. Il regroupe l'architecture applicative, les règles de modélisation (Typescript), les formules de calcul automatisées (YTD, dimensionnement), ainsi que le plan de transition détaillé pour le déploiement sur base de données Cloud.
            </p>
          </div>
        </div>
      </div>

      <div class="border-t border-slate-200 pt-8 mt-auto flex justify-between text-[10px] text-slate-500 font-mono">
        <div>
          <p class="font-bold text-slate-800">Éditeur &amp; Propriétaire :</p>
          <p>Direction Territoriale de l'Urgence et du Secourisme des Yvelines (DTUS 78)</p>
        </div>
        <div class="text-right">
          <p class="font-bold text-slate-800">Projet Référence :</p>
          <p>v2026.07-DEV • Transition &amp; Passation</p>
          <p>Date de génération : Juillet 2026</p>
        </div>
      </div>
    </div>

    <!-- PAGE 2: SOMMAIRE -->
    <div class="page-break pt-12 space-y-6">
      <h3 class="text-xl font-bold text-slate-900 border-b-2 border-red-600 pb-2">Sommaire &amp; Vision Fonctionnelle</h3>
      
      <div class="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-3">
        <h4 class="font-bold text-slate-800 text-xs uppercase tracking-wider">Table des Matières</h4>
        <ol class="list-decimal pl-6 space-y-2 font-semibold text-sm text-slate-700">
          <li>Vision Fonctionnelle &amp; Contexte d'Activité (DTUS 78)</li>
          <li>Architecture Logicielle Globale (React 18 / Vite / Sovereignty-By-Design)</li>
          <li>Modélisation de la Base de Données (Schémas &amp; Interfaces Typescript)</li>
          <li>Moteurs Algorithmiques de Calcul (Mode YTD, Parser de Dimensionnement, Gain DT Net)</li>
          <li>Détail des Formats d'Importation de Fichiers (Excel, CSV)</li>
          <li>Instructions de Reprise pour l'Équipe de Développement (Lot 2 &amp; Cloud Database)</li>
        </ol>
      </div>

      <div class="space-y-4 text-sm leading-relaxed text-slate-700 text-justify">
        <h4 class="text-base font-bold text-slate-900 uppercase">1. Présentation Générale &amp; Vision Métier</h4>
        <p>
          L'application de pilotage d'activité de la <strong>DTUS Yvelines (78)</strong> est un cockpit décisionnel conçu pour consolider, analyser et valoriser l'activité opérationnelle liée aux trois grands métiers territoriaux : le Secourisme, l'Urgence et la Formation. Elle permet d'étudier l'historique sur 3 ans (2024 à 2026) pour préparer les sessions annuelles de <strong>Dialogue Stratégique</strong> avec les instances nationales et les partenaires régaliens (SDIS, SAMU, ARS, Préfecture).
        </p>
        <p>
          <strong>Un enjeu de Souveraineté de Donnée (Sovereignty-By-Design) :</strong> Par conception, l'outil s'exécute exclusivement en local (dans le navigateur de l'utilisateur). Aucune donnée d'activité, aucune ligne d'événement, aucun identifiant n'est transmis sur un serveur externe. Tout calcul de consolidation, d'analyse statistique clinique (trauma, malaise, ACR) ou financière (reversement UL) est effectué côté client via la mémoire vive (RAM) et persistant localement via le <strong>LocalStorage</strong>.
        </p>
      </div>
    </div>

    <!-- PAGE 3: ARCHITECTURE LOGICIELLE GLOBALE -->
    <div class="page-break pt-12 space-y-6">
      <h3 class="text-xl font-bold text-slate-900 border-b-2 border-red-600 pb-2">2. Architecture Logicielle &amp; Persistance</h3>
      
      <div class="space-y-4 text-sm leading-relaxed text-slate-700">
        <h4 class="text-base font-bold text-slate-800 uppercase">A. Technologies Employées</h4>
        <p>
          L'application repose sur un environnement moderne garantissant robustesse, réactivité et typage statique rigoureux :
        </p>
        <ul class="list-disc pl-6 space-y-2">
          <li><strong>Framework principal :</strong> React 18 avec l'outil d'assemblage ultra-rapide <strong>Vite</strong>.</li>
          <li><strong>Langage :</strong> TypeScript avec typage strict activé pour toutes les interfaces d'activité.</li>
          <li><strong>Design System :</strong> Tailwind CSS v4, permettant des animations interactives et une feuille de style d'impression optimisée pour les formats A4 standard.</li>
          <li><strong>Librairie de Graphiques :</strong> <strong>Recharts</strong>, configuré pour tracer dynamiquement les barres, courbes cumulées et diagrammes circulaires à partir des registres.</li>
          <li><strong>Analyseur de Fichiers :</strong> <strong>SheetJS (xlsx)</strong>, pour parser à la volée les classeurs Excel (.xlsx, .xls) et fichiers délimités (.csv).</li>
        </ul>

        <h4 class="text-base font-bold text-slate-800 uppercase mt-4">B. Clés et Structure de Persistance (LocalStorage)</h4>
        <p>
          L'état réactif de l'application est synchronisé avec les clés de stockage locales suivantes. Les développeurs pourront s'y référer pour inspecter ou injecter des données par défaut :
        </p>
        <table class="w-full text-left text-xs border-collapse border border-slate-300 mt-2">
          <thead>
            <tr class="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
              <th class="p-2 border border-slate-300">Clé LocalStorage</th>
              <th class="p-2 border border-slate-300">Type JSON stocké</th>
              <th class="p-2 border border-slate-300">Description / Rôle métier</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-slate-200">
              <td class="p-2 font-mono border border-slate-300 font-bold text-red-600">cr78_dps_activities</td>
              <td class="p-2 font-mono border border-slate-300">Array&lt;ParsedDpsRow&gt;</td>
              <td class="p-2 border border-slate-300">Registre complet des DPS (Dispositifs Prévisionnels de Secours).</td>
            </tr>
            <tr class="border-b border-slate-200">
              <td class="p-2 font-mono border border-slate-300 font-bold text-red-600">cr78_dt_direct_activities</td>
              <td class="p-2 font-mono border border-slate-300">Array&lt;ParsedDtDirectRow&gt;</td>
              <td class="p-2 border border-slate-300">Opérations gérées directement par l'échelon départemental (DT).</td>
            </tr>
            <tr class="border-b border-slate-200">
              <td class="p-2 font-mono border border-slate-300 font-bold text-red-600">cr78_reseau_activities</td>
              <td class="p-2 font-mono border border-slate-300">Array&lt;ParsedReseauRow&gt;</td>
              <td class="p-2 border border-slate-300">Gardes réseau SDIS / SAMU assurées par les secouristes des Yvelines.</td>
            </tr>
            <tr class="border-b border-slate-200">
              <td class="p-2 font-mono border border-slate-300 font-bold text-red-600">cr78_urgence_activities</td>
              <td class="p-2 font-mono border border-slate-300">Array&lt;ParsedUrgenceRow&gt;</td>
              <td class="p-2 border border-slate-300">Déploiements et mobilisations de crise (ex : inondations, Orsec).</td>
            </tr>
            <tr class="border-b border-slate-200">
              <td class="p-2 font-mono border border-slate-300 font-bold text-red-600">cr78_formation_activities</td>
              <td class="p-2 font-mono border border-slate-300">Array&lt;ParsedFormationPublicRow&gt;</td>
              <td class="p-2 border border-slate-300">Statistiques d'apprentissage des sessions grand public (PSC1, IPSEN, GQS).</td>
            </tr>
            <tr class="border-b border-slate-200">
              <td class="p-2 font-mono border border-slate-300 font-bold text-red-600">cr78_strategic_goals</td>
              <td class="p-2 font-mono border border-slate-300">Array&lt;StrategicGoal&gt;</td>
              <td class="p-2 border border-slate-300">Plan d'action de la DTUS contenant l'avancement et le statut des objectifs.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- PAGE 4: MODELISATION DE LA BASE DE DONNEES LOCAL -->
    <div class="page-break pt-12 space-y-6">
      <h3 class="text-xl font-bold text-slate-900 border-b-2 border-red-600 pb-2">3. Modélisation de Données &amp; Typescript</h3>
      <p class="text-sm text-slate-700">
        Pour assurer l'intégrité des calculs, le fichier central <code>/src/types.ts</code> définit rigoureusement les structures de données. Voici les interfaces de référence pour l'intégration de nouveaux flux de données :
      </p>

      <div class="space-y-4 font-mono text-[9px] bg-slate-900 text-slate-200 p-5 rounded-lg overflow-x-auto leading-relaxed">
<pre>
// 1. Représentation d'une ligne d'activité DPS
export interface ParsedDpsRow {
  ul: string;                      // Unité locale organisatrice
  manifestation: string;           // Intitulé de l'événement couvert
  statut: string;                  // Réalisé, Planifié, Annulé
  debut: string;                   // Date/Heure de début (format ISO ou FR)
  fin: string;                     // Date/Heure de fin
  heuresDps: number;               // Volume horaire global de l'événement
  prelevement: number;             // Quote-part prélevée (en euros)
  tarifTheorique: number;          // Coût d'indemnisation global
  dimensionnement: string;         // Descriptif brut textuel (ex: "1 équipe + 1 binôme")
  secouristesEngages: number;      // Effectif de secouristes déduit par le parser
  evac: boolean;                   // Flag indiquant si une évacuation médicale a eu lieu
  heuresBenevolatCalculees: number;// Heures de bénévolat déduites (Durée d'opération * Effectif)
  nbSoins: number;                 // Nombre total de gestes cliniques de premier secours
  nbEvac: number;                  // Nombre d'évacuations réelles vers un centre hospitalier
  nbTrauma: number;                // Cas de traumatologie clinique rencontrés
  nbMalaise: number;               // Cas de malaises pris en charge
  nbInconscient: number;           // Cas d'inconscience (PLS)
  nbAcr: number;                   // Arrêts Cardio-Respiratoires (ACR)
  medicalise: boolean;             // Présence d'un médecin ou infirmier
}

// 2. Représentation d'une garde de Réseau de Secours (SDIS / SAMU)
export interface ParsedReseauRow {
  date: string;                    // Date de la garde
  duree: number;                   // Durée d'astreinte en heures
  secouristesEngages: number;      // Effectif réglementaire (ambulance = 4)
  heuresBenevolat: number;         // Heures bénévolat cumulées (calculé : duree * 4)
}

// 3. Objectif Stratégique du Plan d'Action Territorial
export interface StrategicGoal {
  id: string;                      // Identifiant unique
  category: 'secourisme' | 'urgence' | 'formation';
  title: string;                   // Titre de l'objectif
  description: string;             // Explications contextuelles
  type: 'quantitatif' | 'qualitatif';
  target: string;                  // Cible textuelle ou jalons
  startValue: number;              // Valeur initiale au lancement (2024)
  currentValue: number;            // Valeur mesurée à l'instant T (2026)
  targetValue: number;             // Valeur cible attendue à horizon 2029
  unit?: string;                   // Unité de mesure optionnelle (%, effectif, etc.)
  statusText: string;              // Statut textuel synthétique
  progress: number;                // Pourcentage global de progression (0 à 100)
  fourYearHorizon: string;         // Horizon temporel
}
</pre>
      </div>
    </div>

    <!-- PAGE 5: MOTEURS ALGORITHMIQUES DE CALCUL -->
    <div class="page-break pt-12 space-y-6">
      <h3 class="text-xl font-bold text-slate-900 border-b-2 border-red-600 pb-2">4. Moteurs Algorithmiques de Calcul Clés</h3>
      <p class="text-sm text-slate-700 text-justify">
        L'application intègre des modules algorithmiques de calcul automatique qui convertissent les données d'importation brutes en indicateurs décisionnels fiables. Deux moteurs sont cruciaux pour la cohérence des rapports :
      </p>

      <div class="space-y-4 text-xs">
        {/* ALGORITHME YTD */}
        <div class="bg-slate-50 p-5 rounded border border-slate-200">
          <h4 class="text-xs font-bold text-slate-900 uppercase">A. Algorithme de Comparaison Temporelle "Year-To-Date" (YTD)</h4>
          <p class="mt-1 leading-relaxed text-slate-650">
            Afin de ne pas comparer de manière inéquitable les années pleines consolidées de 2024 et 2025 avec l'année en cours (2026) qui n'est que partiellement saisie, l'application applique un filtrage calendaire strict lorsqu'elle est en mode YTD :
          </p>
          <div class="bg-white p-3 rounded border border-slate-200 font-mono text-[9px] text-slate-700 mt-2 overflow-x-auto">
<pre>
// Seuil de comparaison calendaire (Le dialogue d'activité a lieu le 9 juin 2026)
const YTD_CUTOFF_MONTH = 5; // Juin (indexé à 0 en JavaScript)
const YTD_CUTOFF_DAY = 9;   // 9ème jour

export const filterYTD = (activities: any[], isYtdMode: boolean, analysisYear: number) => {
  if (!isYtdMode) return activities; // Retourne 100% des données si désactivé

  return activities.filter(activity => {
    const actYear = getYearFromDate(activity.date);
    
    // Si l'activité est d'une année antérieure (2024, 2025), on restreint
    if (actYear &lt; analysisYear) {
      const actDate = new Date(activity.date);
      const month = actDate.getMonth();
      const day = actDate.getDate();
      
      // On conserve uniquement les événements programmés avant le 9 juin de l'année concernée
      if (month &gt; YTD_CUTOFF_MONTH || (month === YTD_CUTOFF_MONTH &amp;&amp; day &gt; YTD_CUTOFF_DAY)) {
        return false;
      }
    }
    return true;
  });
};
</pre>
          </div>
        </div>

        {/* PARSER DE DIMENSIONNEMENT */}
        <div class="bg-slate-50 p-5 rounded border border-slate-200 mt-4">
          <h4 class="text-xs font-bold text-slate-900 uppercase">B. Analyseur Syntaxique du Dimensionnement des DPS</h4>
          <p class="mt-1 leading-relaxed text-slate-650">
            Les effectifs engagés ne sont pas toujours saisis sous forme numérique. Le système parse automatiquement le texte de la colonne <em>Dimensionnement</em> pour déduire le nombre de secouristes d'après les standards opérationnels de la Croix-Rouge française :
          </p>
          <ul class="list-disc pl-6 mt-2 space-y-1 text-slate-700">
            <li><strong>"Équipe" / "EQ" / "VPSP" :</strong> Détecté comme 1 équipe d'intervention de secours d'urgence, soit <strong>4 secouristes</strong>.</li>
            <li><strong>"Binôme" / "BIN" :</strong> Détecté comme un binôme de premiers secours, soit <strong>2 secouristes</strong>.</li>
            <li><strong>"PAPS" (Point d'Alerte et de Premiers Secours) :</strong> Détecté comme un dispositif léger, soit <strong>2 secouristes</strong>.</li>
            <li><strong>Calcul des heures bénévoles :</strong> <code>Heures Bénévolat = (Heure Fin - Heure Début) × Secouristes Engagés</code>.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- PAGE 6: SPECIFICATIONS IMPORTS EXCEL / CSV -->
    <div class="page-break pt-12 space-y-6">
      <h3 class="text-xl font-bold text-slate-900 border-b-2 border-red-600 pb-2">5. Spécifications Techniques d'Importation</h3>
      <p class="text-sm text-slate-700">
        L'outil de chargement utilise <strong>xlsx</strong> en mode lecture purement locale. Voici la cartographie rigoureuse des en-têtes attendus par l'application pour valider et intégrer les données :
      </p>

      <div class="space-y-6 text-xs">
        <div>
          <h4 class="font-bold text-red-600 border-l-4 border-red-600 pl-2 uppercase">Gabarit 1 : Dispositifs Prévisionnels de Secours (DPS)</h4>
          <table class="w-full text-left text-xs border-collapse border border-slate-300 mt-2">
            <thead>
              <tr class="bg-slate-100 font-bold border-b border-slate-300">
                <th class="p-2 border border-slate-300">Intitulé de colonne attendu</th>
                <th class="p-2 border border-slate-300">Type requis</th>
                <th class="p-2 border border-slate-300">Règle de conversion &amp; Valeur par défaut</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-slate-200">
                <td class="p-2 font-mono border border-slate-300 font-bold">MANIFESTATION</td>
                <td class="p-2 border border-slate-300">Texte (Non vide)</td>
                <td class="p-2 border border-slate-300">Identifie l'événement. Si vide, la ligne est rejetée.</td>
              </tr>
              <tr class="border-b border-slate-200">
                <td class="p-2 font-mono border border-slate-300 font-bold">UL</td>
                <td class="p-2 border border-slate-300">Texte</td>
                <td class="p-2 border border-slate-300">Unité locale organisatrice (ex: "Versailles"). Par défaut "DT Yvelines".</td>
              </tr>
              <tr class="border-b border-slate-200">
                <td class="p-2 font-mono border border-slate-300 font-bold">Début / Fin</td>
                <td class="p-2 border border-slate-300">Date ISO/FR</td>
                <td class="p-2 border border-slate-300">Converti en objet Date JavaScript. Utilisé pour calculer la durée de l'opération.</td>
              </tr>
              <tr class="border-b border-slate-200">
                <td class="p-2 font-mono border border-slate-300 font-bold">Dimensionnement</td>
                <td class="p-2 border border-slate-300">Texte libre</td>
                <td class="p-2 border border-slate-300">Analysé par le moteur syntaxique pour en extraire le nombre de bénévoles.</td>
              </tr>
              <tr class="border-b border-slate-200">
                <td class="p-2 font-mono border border-slate-300 font-bold">Nb Soins / Nb évac</td>
                <td class="p-2 border border-slate-300">Entier &gt;= 0</td>
                <td class="p-2 border border-slate-300">Si absent, valorisé par défaut à 0. Utilisé pour les statistiques cliniques.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h4 class="font-bold text-emerald-600 border-l-4 border-emerald-600 pl-2 uppercase">Gabarit 2 : Activités Directes de la DT</h4>
          <table class="w-full text-left text-xs border-collapse border border-slate-300 mt-2">
            <thead>
              <tr class="bg-slate-100 font-bold border-b border-slate-300">
                <th class="p-2 border border-slate-300">Intitulé de colonne attendu</th>
                <th class="p-2 border border-slate-300">Type requis</th>
                <th class="p-2 border border-slate-300">Description / Rôle dans la formule financière</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-slate-200">
                <td class="p-2 font-mono border border-slate-300 font-bold">Tarif théorique</td>
                <td class="p-2 border border-slate-300">Nombre (Euros)</td>
                <td class="p-2 border border-slate-300">Devis financier global facturé par l'échelon départemental.</td>
              </tr>
              <tr class="border-b border-slate-200">
                <td class="p-2 font-mono border border-slate-300 font-bold">Reversement UL</td>
                <td class="p-2 border border-slate-300">Nombre (Euros)</td>
                <td class="p-2 border border-slate-300">Part reversée à l'unité locale d'origine en compensation de ses secouristes.</td>
              </tr>
              <tr class="border-b border-slate-200">
                <td class="p-2 font-mono border border-slate-300 font-bold">CA Net</td>
                <td class="p-2 border border-slate-300">Nombre (Euros)</td>
                <td class="p-2 border border-slate-300">Gain net conservé par la DT (Calculé : Devis - Reversement - Repas).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- PAGE 7: PASSATION ET HANDOVER DEVELOPPEURS -->
    <div class="page-break pt-12 space-y-6">
      <h3 class="text-xl font-bold text-slate-900 border-b-2 border-red-600 pb-2">6. Plan de Transition &amp; Reprise de Code (Remise d'Outil)</h3>
      <p class="text-sm text-slate-700 text-justify">
        Pour l'équipe de développement reprenant le projet, voici les directives architecturales recommandées pour implémenter les évolutions futures majeures :
      </p>

      <div class="space-y-4 text-xs text-slate-700">
        <div class="bg-slate-50 p-5 rounded border border-slate-200 space-y-2">
          <h4 class="font-bold text-slate-900 text-xs uppercase">Étape 1 : Comment intégrer le Lot 2 (Les Activités Sociales)</h4>
          <p class="text-slate-650 leading-relaxed">
            Le Lot d'activité sociale (Aide alimentaire, Vestiboutique, Lutte contre l'isolement) est déjà esquissé dans les types et la structure. Pour le rendre 100% interactif :
          </p>
          <ol class="list-decimal pl-6 space-y-1 text-slate-600">
            <li>Déclarer de nouvelles clés LocalStorage (ex: <code>cr78_social_activities</code>).</li>
            <li>Modifier le sélecteur de métier principal dans <code>src/App.tsx</code> pour intégrer les métiers sociaux aux côtés de 'secourisme', 'urgence' et 'formation'.</li>
            <li>Réutiliser le composant générique d'import en adaptant les en-têtes requis (ex: Colonnes <em>Bénéficiaires</em>, <em>Kilos distribués</em>, <em>Heures d'écoute</em>).</li>
          </ol>
        </div>

        <div class="bg-slate-50 p-5 rounded border border-slate-200 space-y-2 mt-4">
          <h4 class="font-bold text-slate-900 text-xs uppercase">Étape 2 : Migration vers une Base de Données Cloud (Firebase Firestore)</h4>
          <p class="text-slate-650 leading-relaxed">
            Si la DTUS souhaite partager ce tableau de bord en temps réel entre plusieurs cadres ou unités locales avec authentification sécurisée :
          </p>
          <ol class="list-decimal pl-6 space-y-1 text-slate-600">
            <li>
              <strong>Initialiser le SDK client :</strong> Créer un fichier <code>src/lib/firebase.ts</code> et configurer Firestore avec <code>getFirestore()</code>.
            </li>
            <li>
              <strong>Remplacer le LocalStorage :</strong> Remplacer les appels de lecture/écriture du hook React (ex: <code>localStorage.setItem</code>) par des fonctions asynchrones Firestore (<code>setDoc</code>, <code>getDoc</code>) ou un écouteur temps réel (<code>onSnapshot</code>).
            </li>
            <li>
              <strong>Mettre en place la Sécurité :</strong> Activer Firestore Auth pour s'assurer que seuls les emails en <code>@croix-rouge.fr</code> puissent modifier les objectifs stratégiques départementaux.
            </li>
          </ol>
        </div>

        <div class="border-t border-slate-200 pt-8 text-center text-xs">
          <p class="font-bold text-slate-800">Fin du Dossier de Spécifications Techniques</p>
          <p class="text-slate-500 mt-1">
            Ce document constitue le livrable de référence officiel de l'application de pilotage d'activité 2026 de la DTUS 78.
          </p>
          <p class="text-[10px] text-slate-400 mt-4 font-mono">
            © 2026 Croix-Rouge française • Direction Territoriale des Yvelines • Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'CroixRouge78_Guide_Utilisateur_Documentation.html');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloading(false);
    }, 1200);
  };

  if (!isOpen) return null;

  // Features list for interactive mockups
  const dashboardFeatures = [
    { id: 1, title: "1. En-tête Croix-Rouge & Code Territoire", desc: "Affiche l'identité départementale (Yvelines - 78) et le code DTUS-2026. Permet d'ouvrir le panneau d'import de données global.", x: "12%", y: "8%" },
    { id: 2, title: "2. Consolidé Annuel & Indicateur YTD", desc: "Compare les volumes d'activité et d'heures bénévoles entre 2025 et 2026. S'adapte dynamiquement si la comparaison Year-to-Date (YTD) est activée (jusqu'au 9 juin).", x: "85%", y: "15%" },
    { id: 3, title: "3. Sélecteur de Métier Opérationnel", desc: "Trois boutons thématiques (Secourisme, Urgence, Formation) pour charger instantanément les indicateurs, les graphiques et le plan d'action associés.", x: "30%", y: "38%" },
    { id: 4, title: "4. Évolutions Historiques & Diagrammes", desc: "Représentations graphiques de l'activité sur trois ans (2024-2026) avec répartition fine par type de mission ou par structure locale.", x: "75%", y: "55%" },
    { id: 5, title: "5. Plan d'Action Territorial Territorialisé", desc: "Objectifs stratégiques départementaux sous forme de cartes d'avancement modifiables (étapes clés, indicateurs, jauge de progression).", x: "32%", y: "78%" },
    { id: 6, title: "6. Registres & Outils d'Import Fins", desc: "Outils de chargement par glisser-déposer de classeurs réels (SDIS, DPS, Direct) avec vérification de la cohérence des lignes et de l'effectif.", x: "80%", y: "88%" }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        />

        {/* Slide-over panel container */}
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-5xl bg-white h-full shadow-2xl flex flex-col z-10"
        >
          {/* Header */}
          <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rc-red rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-extrabold tracking-tight">Guide Utilisateur & Spécifications Techniques</h2>
                <p className="text-xs text-slate-300 font-medium">DTUS 78 • Documentation interactive complète de l'application</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition duration-150 cursor-pointer"
              title="Fermer la documentation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tab Bar */}
          <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex flex-wrap gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                activeTab === 'guide' 
                  ? 'bg-rc-red text-white' 
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200 shadow-3xs'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Guide Fonctionnel
            </button>
            <button
              onClick={() => setActiveTab('imports')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                activeTab === 'imports' 
                  ? 'bg-rc-red text-white' 
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200 shadow-3xs'
              }`}
            >
              <Table2 className="w-3.5 h-3.5" />
              Formats d'Imports Excel / CSV
            </button>
            <button
              onClick={() => setActiveTab('captures')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                activeTab === 'captures' 
                  ? 'bg-rc-red text-white' 
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200 shadow-3xs'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Captures Interactives & Schémas
            </button>
            <button
              onClick={() => setActiveTab('tech')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                activeTab === 'tech' 
                  ? 'bg-rc-red text-white' 
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200 shadow-3xs'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Fiche Technique & Sécurité
            </button>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={handleDownloadHTML}
                disabled={isDownloading}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer shadow-3xs border border-indigo-650 disabled:opacity-75"
                title="Télécharger le guide complet au format HTML autonome (idéal pour imprimer ou lire hors-ligne)"
              >
                {isDownloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                {isDownloading ? 'Génération...' : 'Télécharger (.html)'}
              </button>

              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shadow-3xs border border-emerald-650 disabled:opacity-75"
                title="Lancer l'impression directe de la documentation"
              >
                {isPrinting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Printer className="w-3.5 h-3.5" />
                )}
                {isPrinting ? 'Préparation...' : 'Imprimer'}
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
            
            {/* TAB 1: GUIDE FONCTIONNEL */}
            {activeTab === 'guide' && (
              <div className="space-y-6 animate-fadeIn text-slate-700 text-xs sm:text-sm">
                
                {/* Intro Card */}
                <div className="bg-rc-red/5 border border-rc-red/10 rounded-xl p-5 flex items-start gap-4">
                  <div className="p-3 bg-rc-red/10 text-rc-red rounded-lg shrink-0">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm">Qu'est-ce que le Dashboard DTUS 78 ?</h3>
                    <p className="leading-relaxed">
                      C'est un outil décisionnel qui permet de consolider l'activité opérationnelle de la Direction Territoriale de l'Urgence et du Secourisme des Yvelines. Il offre aux cadres départementaux un support visuel interactif idéal pour préparer les réunions de <strong>Dialogue d'Activité</strong> avec les élus, la préfecture et les partenaires institutionnels.
                    </p>
                  </div>
                </div>

                {/* Grid guidelines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3.5">
                    <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-rc-red" />
                      Analyse Temporelle & Mode YTD
                    </h4>
                    <p className="leading-relaxed">
                      La comparaison d'activité d'une année sur l'autre peut être biaisée en cours d'année. Pour résoudre cela, l'application intègre le mode <strong>YTD (Year-to-Date)</strong>.
                    </p>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs space-y-2">
                      <p className="font-semibold text-slate-800">Comment l'utiliser ?</p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600">
                        <li><strong>Bouton YTD Activé :</strong> Restreint automatiquement les données des années précédentes (2024, 2025) à la même période calendaire que l'année en cours (soit du 1er janvier au 9 juin).</li>
                        <li><strong>Bouton YTD Désactivé :</strong> Compare l'année 2026 en cours avec les années complètes consolidées à 100%.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3.5">
                    <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-rc-red" />
                      Plan d'Action Territorial
                    </h4>
                    <p className="leading-relaxed">
                      Ce module permet d'administrer et d'exposer l'état d'avancement des grands chantiers opérationnels stratégiques du département (ex : Équipes de soutien, médicalisation, formateurs).
                    </p>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs space-y-2">
                      <p className="font-semibold text-slate-800">Fonctionnalités d'édition :</p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600">
                        <li><strong>Mise en page fluide :</strong> Les cartes s'élargissent proprement s'il y a peu d'éléments pour optimiser la visibilité.</li>
                        <li><strong>Édition en direct :</strong> Modifiez les titres, étapes charnières (Départ, Actuel, Cible), jauges de progression et statuts opérationnels (Conforme, Retard, En avance, Finalisé).</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Print guidelines */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                    Impression Haute Qualité (PDF / Papier)
                  </h4>
                  <p className="leading-relaxed">
                    L'application possède une feuille de style d'impression intégrée. En utilisant le raccourci <strong>Ctrl + P</strong> (ou Cmd + P sur Mac) ou les boutons d'impression, tous les contrôles techniques (boutons d'imports, formulaires de modification, modales de configuration) sont masqués pour ne laisser que les indicateurs opérationnels épurés et les graphiques.
                  </p>
                </div>

              </div>
            )}

            {/* TAB 2: FORMATS D'IMPORTS */}
            {activeTab === 'imports' && (
              <div className="space-y-6 animate-fadeIn text-slate-700 text-xs sm:text-sm">
                
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-bold text-slate-900 text-sm">Spécifications des classeurs Excel / CSV</h3>
                  <span className="text-xs text-rc-red font-semibold bg-rc-red/10 px-2.5 py-0.5 rounded border border-rc-red/15">
                    Modèles disponibles au téléchargement dans l'application
                  </span>
                </div>

                <p className="leading-relaxed">
                  L'application intègre des analyseurs spécifiques pour chaque flux de données Croix-Rouge. Pour chaque import, des fichiers types pré-remplis avec la structure exacte attendue sont téléchargeables via le bouton <strong>"Télécharger le Modèle type"</strong> de l'onglet d'intégration correspondant.
                </p>

                {/* Accordion / Table style for import specifications */}
                <div className="space-y-4">
                  
                  {/* Item 1: DPS */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider bg-rose-50 border border-rose-100 text-rc-red px-2 py-0.5 rounded">
                        1. Dispositifs Prévisionnels de Secours (DPS)
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">Format : .xlsx, .xls, .csv</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Permet d'importer la liste détaillée des manifestations couvertes. Le système calcule automatiquement l'effectif des secouristes en parsant la colonne "Dimensionnement" (ex : "2 équipes et 1 binôme" = 10 secouristes).
                    </p>
                    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-[11px]">
                      <table className="w-full text-left font-mono text-slate-600">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-800 font-bold">
                            <th className="p-1">En-tête requis</th>
                            <th className="p-1">Type</th>
                            <th className="p-1">Exemple / Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-100"><td className="p-1 font-bold text-slate-800">MANIFESTATION</td><td className="p-1 text-slate-500">Texte</td><td className="p-1">Grand Prix Hippique de Versailles</td></tr>
                          <tr className="border-b border-slate-100"><td className="p-1 font-bold text-slate-800">UL</td><td className="p-1 text-slate-500">Texte</td><td className="p-1">Versailles, Poissy, Rambouillet...</td></tr>
                          <tr className="border-b border-slate-100"><td className="p-1 font-bold text-slate-800">Début</td><td className="p-1 text-slate-500">Date/Heure</td><td className="p-1">2026-05-12 14:00 (ou format standard Excel)</td></tr>
                          <tr className="border-b border-slate-100"><td className="p-1 font-bold text-slate-800">Dimensionnement</td><td className="p-1 text-slate-500">Texte</td><td className="p-1">"1 équipe et 1 binôme" (analysé en 6 pers)</td></tr>
                          <tr><td className="p-1 font-bold text-slate-800">Nb Soins / Nb évac</td><td className="p-1 text-slate-500">Nombre</td><td className="p-1">Volume de blessés et évacuations vers hôpital</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Item 2: SDIS */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        2. Gardes Réseau SDIS (Pompiers)
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">Format : .xlsx, .xls, .csv</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Sert à charger les participations aux gardes chez les pompiers du 78. Chaque ligne de garde validée de 12h ou 24h génère automatiquement un volume d'heures bénévoles sur la base réglementaire de <strong>4 équipiers engagés</strong>.
                    </p>
                    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-[11px]">
                      <table className="w-full text-left font-mono text-slate-600">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-800 font-bold">
                            <th className="p-1">En-tête requis</th>
                            <th className="p-1">Type</th>
                            <th className="p-1">Exemple / Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-100"><td className="p-1 font-bold text-slate-800">Date</td><td className="p-1 text-slate-500">Date</td><td className="p-1">2026-01-03 (Jour de la garde)</td></tr>
                          <tr><td className="p-1 font-bold text-slate-800">Durée de garde</td><td className="p-1 text-slate-500">Nombre</td><td className="p-1">12 ou 24 (Heures de vacation)</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Item 3: Direct DT */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                        3. Activités Directes DT (Territoire Yvelines)
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">Format : .xlsx, .xls, .csv</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Données financières et d'activité des grands événements départementaux pilotés en direct (ex: festivals, meetings). Affiche le gain net de la DT78 après reversement aux ULs d'appui.
                    </p>
                    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-[11px]">
                      <table className="w-full text-left font-mono text-slate-600">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-800 font-bold">
                            <th className="p-1">En-tête requis</th>
                            <th className="p-1">Type</th>
                            <th className="p-1">Exemple / Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-100"><td className="p-1 font-bold text-slate-800">MANIFESTATION</td><td className="p-1 text-slate-500">Texte</td><td className="p-1">Festival Electro Yvelines Direct DT</td></tr>
                          <tr className="border-b border-slate-100"><td className="p-1 font-bold text-slate-800">Tarif théorique</td><td className="p-1 text-slate-500">Nombre</td><td className="p-1">Montant global facturé en € (devis)</td></tr>
                          <tr className="border-b border-slate-100"><td className="p-1 font-bold text-slate-800">Reversement UL</td><td className="p-1 text-slate-500">Nombre</td><td className="p-1">Part financière reversée à l'UL opérationnelle</td></tr>
                          <tr><td className="p-1 font-bold text-slate-800">Devis CRSS</td><td className="p-1 text-slate-500">Texte</td><td className="p-1">"Médecin + Inf" (si non vide, le DPS est marqué médicalisé)</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Item 4: Urgences */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider bg-purple-50 border border-purple-100 text-purple-700 px-2 py-0.5 rounded">
                        4. Missions d'Urgence sociale et de crise
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">Format : .xlsx, .xls, .csv</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Sert à documenter les interventions d'urgence sous réquisition préfectorale (Plan Grand Froid, inondations, évacuations).
                    </p>
                    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-[11px]">
                      <table className="w-full text-left font-mono text-slate-600">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-800 font-bold">
                            <th className="p-1">En-tête requis</th>
                            <th className="p-1">Type</th>
                            <th className="p-1">Exemple / Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-100"><td className="p-1 font-bold text-slate-800">Date de début</td><td className="p-1 text-slate-500">Date/Heure</td><td className="p-1">2026-01-15 18:00</td></tr>
                          <tr className="border-b border-slate-100"><td className="p-1 font-bold text-slate-800">Agrément mobilisé</td><td className="p-1 text-slate-500">Texte</td><td className="p-1">A - Mission de Secours Populaire (Alerte)</td></tr>
                          <tr className="border-b border-slate-100"><td className="p-1 font-bold text-slate-800">Contexte et description des actions menées</td><td className="p-1 text-slate-500">Texte</td><td className="p-1">Plan Grand Froid : Établissement d'un centre d'hébergement</td></tr>
                          <tr><td className="p-1 font-bold text-slate-800">Heures bénévolat</td><td className="p-1 text-slate-500">Nombre</td><td className="p-1">Total d'heures cumulées par les équipiers d'urgence</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Item 5: Formations */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded">
                        5. Formations d'Apprentissage Grand Public
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">Format : .xlsx, .xls</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Consolide l'ensemble de l'activité de formation grand public par Unité Locale du 78. Ce fichier attend une structure de matrice double-entête pour chaque formation dispensée.
                    </p>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-[11px] space-y-2">
                      <p className="font-semibold text-slate-800">Structure de double en-tête attendue :</p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600">
                        <li><strong>Ligne 1 :</strong> Colonne 1: Année (ex : <code className="bg-slate-200 px-1 rounded font-mono">2025</code>), puis les types de formations répétés sur 3 colonnes chacun (<code className="bg-slate-200 px-1 rounded font-mono">ePSC...</code>, <code className="bg-slate-200 px-1 rounded font-mono">PSC</code>, <code className="bg-slate-200 px-1 rounded font-mono">IPSEN</code>, <code className="bg-slate-200 px-1 rounded font-mono">GQS</code>, <code className="bg-slate-200 px-1 rounded font-mono">recyclage PSC</code>).</li>
                        <li><strong>Ligne 2 :</strong> Les colonnes d'en-tête de données doivent être : <code className="bg-slate-200 px-1 rounded font-mono">Structure</code> (ex: Chevreuse, Poissy) puis <code className="bg-slate-200 px-1 rounded font-mono">Sessions</code>, <code className="bg-slate-200 px-1 rounded font-mono">Stagiaires</code>, <code className="bg-slate-200 px-1 rounded font-mono">Heures</code> répétés pour chaque bloc de formation.</li>
                      </ul>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 3: CAPTURES INTERACTIVES */}
            {activeTab === 'captures' && (
              <div className="space-y-6 animate-fadeIn text-slate-700 text-xs sm:text-sm">
                
                <div className="border-b border-slate-200 pb-2">
                  <h3 className="font-bold text-slate-900 text-sm">Schémas & Captures Interactives de l'Interface</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Survolez ou cliquez sur les cercles rouges numérotés de l'illustration vectorielle ci-dessous pour inspecter les rôles et l'interactivité de chaque bloc d'interface du Dashboard de pilotage.
                  </p>
                </div>

                {/* Simulated High-Fidelity SVG Interactive Layout Mockup */}
                <div className="relative bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-hidden shadow-inner flex flex-col items-center">
                  
                  {/* Decorative background grids */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

                  {/* Header info */}
                  <div className="w-full max-w-lg bg-slate-800/80 rounded border border-slate-700 p-2 text-center text-[10px] text-slate-400 font-mono z-10 mb-4">
                    CROIX-ROUGE 78 - DISPOSITION DES BLOCS DE PILOTAGE
                  </div>

                  {/* Vector layout of app */}
                  <div className="relative w-full max-w-2xl aspect-video bg-slate-950 rounded-lg border border-slate-800 shadow-xl p-3 flex flex-col gap-2 z-10">
                    
                    {/* Header line */}
                    <div className="h-6 w-full bg-slate-900 rounded border border-slate-800 flex items-center justify-between px-2 text-[8px] text-slate-400 font-mono">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded bg-rc-red" />
                        <span>Croix-Rouge française (DTUS 78)</span>
                      </div>
                      <div className="h-4 w-12 bg-rc-red/10 border border-rc-red/30 rounded" />
                    </div>

                    {/* Welcoming banner mockup */}
                    <div className="h-10 w-full bg-slate-900/60 rounded border border-slate-800 p-1.5 flex gap-2 justify-between">
                      <div className="w-1/3 bg-slate-850 rounded" />
                      <div className="w-1/2 bg-slate-850 rounded flex gap-1 p-0.5">
                        <div className="flex-1 bg-slate-800 rounded" />
                        <div className="flex-1 bg-slate-800 rounded" />
                      </div>
                    </div>

                    {/* Metiers selector cards layout */}
                    <div className="h-10 w-full flex gap-2">
                      <div className="flex-1 bg-slate-900/40 rounded border border-rc-red/40 flex items-center justify-center text-[8px] text-rc-red font-bold">Secourisme</div>
                      <div className="flex-1 bg-slate-900/10 rounded border border-slate-800 flex items-center justify-center text-[8px] text-slate-500">Urgence</div>
                      <div className="flex-1 bg-slate-900/10 rounded border border-slate-800 flex items-center justify-center text-[8px] text-slate-500">Formation</div>
                    </div>

                    {/* Main Charts area */}
                    <div className="flex-1 w-full flex gap-2">
                      {/* Left: Recharts graph lines */}
                      <div className="flex-1 bg-slate-900/40 rounded border border-slate-800 p-2 flex flex-col justify-between">
                        <div className="h-1 w-1/4 bg-slate-800 rounded" />
                        <div className="flex-1 flex items-end justify-between px-2 gap-1.5 pt-2">
                          <div className="w-4 h-1/3 bg-slate-800 rounded-xs" />
                          <div className="w-4 h-2/3 bg-slate-800 rounded-xs" />
                          <div className="w-4 h-5/6 bg-rc-red/60 rounded-xs" />
                          <div className="w-4 h-1/2 bg-slate-800 rounded-xs" />
                          <div className="w-4 h-3/4 bg-rc-red/60 rounded-xs" />
                        </div>
                      </div>
                      {/* Right: Pie distribution or breakdown list */}
                      <div className="w-1/3 bg-slate-900/40 rounded border border-slate-800 p-2 flex flex-col gap-1.5">
                        <div className="h-1 w-1/2 bg-slate-800 rounded" />
                        <div className="flex-1 flex flex-col gap-1 justify-center">
                          <div className="h-1.5 w-full bg-slate-850 rounded" />
                          <div className="h-1.5 w-5/6 bg-slate-850 rounded" />
                          <div className="h-1.5 w-2/3 bg-slate-850 rounded" />
                        </div>
                      </div>
                    </div>

                    {/* Strategic plan bento box */}
                    <div className="h-12 w-full bg-slate-900/50 rounded border border-slate-800 p-1.5 flex gap-1.5">
                      <div className="flex-1 bg-slate-850 rounded p-1 flex flex-col justify-between">
                        <div className="h-1 w-1/2 bg-slate-750 rounded" />
                        <div className="h-1.5 w-full bg-slate-700 rounded-full" />
                      </div>
                      <div className="flex-1 bg-slate-850 rounded p-1 flex flex-col justify-between">
                        <div className="h-1 w-1/2 bg-slate-750 rounded" />
                        <div className="h-1.5 w-full bg-slate-700 rounded-full" />
                      </div>
                      <div className="flex-1 bg-slate-850 rounded p-1 flex flex-col justify-between">
                        <div className="h-1 w-1/2 bg-slate-750 rounded" />
                        <div className="h-1.5 w-full bg-slate-700 rounded-full" />
                      </div>
                    </div>

                    {/* Interactive Red hotspots overlay */}
                    {dashboardFeatures.map((feat) => (
                      <button
                        key={feat.id}
                        onMouseEnter={() => setHoveredFeature(feat.id)}
                        onMouseLeave={() => setHoveredFeature(null)}
                        onClick={() => setHoveredFeature(feat.id)}
                        className={`absolute w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-lg transition duration-200 cursor-pointer ${
                          hoveredFeature === feat.id 
                            ? 'bg-emerald-500 scale-125 z-35 animate-none' 
                            : 'bg-rc-red hover:bg-emerald-500 animate-pulse'
                        }`}
                        style={{ left: feat.x, top: feat.y }}
                      >
                        {feat.id}
                      </button>
                    ))}

                  </div>

                  {/* Hotspot details panel */}
                  <div className="w-full max-w-xl bg-slate-50 rounded-lg p-4 border border-slate-200 text-xs mt-4 min-h-[90px] transition duration-200">
                    {hoveredFeature !== null ? (
                      <div className="space-y-1 animate-fadeIn">
                        <h5 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          {dashboardFeatures.find(f => f.id === hoveredFeature)?.title}
                        </h5>
                        <p className="text-slate-600 leading-relaxed">
                          {dashboardFeatures.find(f => f.id === hoveredFeature)?.desc}
                        </p>
                      </div>
                    ) : (
                      <div className="text-slate-400 italic text-center py-4 flex flex-col items-center justify-center">
                        <HelpCircle className="w-5 h-5 mb-1 text-slate-300" />
                        Glissez le curseur ou cliquez sur l'un des cercles numérotés ci-dessus pour inspecter les fonctionnalités.
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}

            {/* TAB 4: TECHNIQUE */}
            {activeTab === 'tech' && (
              <div className="space-y-6 animate-fadeIn text-slate-700 text-xs sm:text-sm">
                
                <div className="border-b border-slate-200 pb-2">
                  <h3 className="font-bold text-slate-900 text-sm">Fiche d'Architecture Technique</h3>
                  <p className="text-xs text-slate-500 mt-1">Spécifications d'exécution, technologies embarquées et cadre de conformité.</p>
                </div>

                {/* Tech list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-rc-red" />
                      Socle Technologique
                    </h4>
                    <ul className="space-y-2 text-xs">
                      <li className="flex items-start gap-1.5">
                        <span className="font-bold text-slate-800">React 18 & TypeScript :</span> Compilateur moderne typé pour éviter les pannes au runtime.
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="font-bold text-slate-800">SheetJS XLSX Parser :</span> Algorithmes rapides d'extraction de lignes à partir d'en-têtes Excel décelés.
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="font-bold text-slate-800">Framer Motion :</span> Gestion des animations, transitions de vues, ouvertures de registres et notifications de succès.
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="font-bold text-slate-800">Recharts :</span> Dessin dynamique des courbes annuelles d'évolution de l'urgence et du secourisme.
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Sécurité & Confidentialité
                    </h4>
                    <p className="leading-relaxed text-slate-600">
                      L'application est entièrement conçue selon le principe du <strong>Privacy by Design</strong> et s'exécute de manière souveraine.
                    </p>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-1.5">
                      <p className="font-bold text-slate-800 text-[10.5px]">Garanties de sécurité :</p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-500 text-[10.5px]">
                        <li><strong>Côté client exclusif :</strong> Aucun fichier Excel importé n'est envoyé sur un réseau ou un serveur. Tout est analysé localement dans la mémoire vive de votre navigateur.</li>
                        <li><strong>Pas de cookies traceurs :</strong> Seul le stockage LocalStorage standard du navigateur est utilisé pour sauvegarder l'état de votre tableau de bord.</li>
                      </ul>
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>

          {/* Footer banner */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <span className="text-[10px] text-slate-400 italic">DTUS 78 • Documentation de Référence v2026.07.02</span>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-md transition cursor-pointer"
            >
              Fermer le guide
            </button>
          </div>

        </motion.div>
      </div>

      {createPortal(
        <div className="print-doc-container hidden print:block bg-white text-slate-800 p-12 font-sans text-xs leading-relaxed">
          {/* Page 1: COVER PAGE */}
          <div className="flex flex-col justify-between h-[25.5cm] border-4 border-slate-900 p-10">
            <div>
              <div className="flex items-center gap-4 border-b-2 border-red-600 pb-6 mb-12">
                <div className="w-12 h-12 bg-red-600 rounded flex items-center justify-center font-extrabold text-white text-3xl">
                  +
                </div>
                <div>
                  <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">Croix-Rouge française</h1>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-red-600">Yvelines • DTUS 78</p>
                </div>
              </div>

              <div className="mt-24 space-y-4">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight uppercase">
                  Dossier de Spécifications Techniques &amp; Guide d'Utilisation
                </h1>
                <p className="text-sm text-slate-650 font-semibold max-w-2xl">
                  Application Territoriale de Pilotage d'Activité et de Dialogue Stratégique de la DTUS des Yvelines (78).
                </p>
                <div className="bg-slate-50 p-4 rounded-md border border-slate-250 mt-8">
                  <p className="font-bold text-slate-800 uppercase text-[10px]">Statut du document : Dossier de Transmission</p>
                  <p className="text-slate-600 mt-1">
                    Ce document fournit aux équipes de développement informatique l'ensemble des règles métier, des structures de données (Typescript), des algorithmes clés et du plan de reprise de code requis pour maintenir, héberger ou étendre l'application territoriale.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-8 mt-auto flex justify-between text-[10px] text-slate-500 font-mono">
              <div>
                <p className="font-bold text-slate-800">Éditeur &amp; Propriétaire :</p>
                <p>Direction Territoriale de l'Urgence et du Secourisme des Yvelines (DTUS 78)</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800">Référence projet :</p>
                <p>v2026.07-DEV • Dossier Technique de Transition</p>
                <p>Date d'édition : Juillet 2026</p>
              </div>
            </div>
          </div>

          {/* Page 2: SOMMAIRE & INTRODUCTION */}
          <div className="page-break pt-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b-2 border-red-600 pb-2">Sommaire &amp; Vision Fonctionnelle</h3>
            
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-850 text-xs uppercase tracking-wider">Table des Matières</h4>
              <ol className="list-decimal pl-6 space-y-1.5 font-semibold text-slate-700">
                <li>Vision Fonctionnelle &amp; Contexte d'Activité (DTUS 78)</li>
                <li>Architecture Logicielle Globale (React 18 / Vite / Sovereignty-By-Design)</li>
                <li>Modélisation de la Base de Données (Schémas &amp; Interfaces Typescript)</li>
                <li>Moteurs Algorithmiques de Calcul (Mode YTD, Parser de Dimensionnement, Gain DT Net)</li>
                <li>Détail des Formats d'Importation de Fichiers (Excel, CSV)</li>
                <li>Instructions de Reprise pour l'Équipe de Développement (Lot 2 &amp; Cloud Database)</li>
              </ol>
            </div>

            <div className="space-y-4 text-slate-700 text-justify">
              <h4 className="text-sm font-bold text-slate-900 uppercase">1. Présentation Générale &amp; Objectifs Métier</h4>
              <p>
                L'application de pilotage d'activité de la <strong>DTUS Yvelines (78)</strong> est un cockpit décisionnel conçu pour consolider, analyser et valoriser l'activité opérationnelle liée aux trois grands métiers territoriaux : le Secourisme, l'Urgence et la Formation. Elle permet d'étudier l'historique sur 3 ans (2024 à 2026) pour préparer les sessions annuelles de <strong>Dialogue Stratégique</strong> avec les instances nationales et les partenaires régaliens (SDIS, SAMU, ARS, Préfecture).
              </p>
              <p>
                <strong>Un enjeu de Souveraineté de Donnée (Sovereignty-By-Design) :</strong> Par conception, l'outil s'exécute exclusivement en local (dans le navigateur de l'utilisateur). Aucune donnée d'activité, aucune ligne d'événement, aucun identifiant n'est transmis sur un serveur externe. Tout calcul de consolidation, d'analyse statistique clinique (trauma, malaise, ACR) ou financière (reversement UL) est effectué côté client via la mémoire vive (RAM) et persistant localement via le <strong>LocalStorage</strong>.
              </p>
            </div>
          </div>

          {/* Page 3: ARCHITECTURE LOGICIELLE GLOBALE */}
          <div className="page-break pt-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b-2 border-red-600 pb-2">2. Architecture Logicielle &amp; Persistance</h3>
            
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800 uppercase">A. Technologies Employées</h4>
              <p>
                L'application repose sur un environnement moderne garantissant robustesse, réactivité et typage statique rigoureux :
              </p>
              <ul className="list-disc pl-6 space-y-1 text-slate-700">
                <li><strong>Framework principal :</strong> React 18 avec l'outil d'assemblage ultra-rapide <strong>Vite</strong>.</li>
                <li><strong>Langage :</strong> TypeScript avec typage strict activé pour toutes les interfaces d'activité.</li>
                <li><strong>Design System :</strong> Tailwind CSS v4, permettant des animations interactives et une feuille de style d'impression optimisée pour les formats A4 standard.</li>
                <li><strong>Librairie de Graphiques :</strong> <strong>Recharts</strong>, configuré pour tracer dynamiquement les barres, courbes cumulées et diagrammes circulaires à partir des registres.</li>
                <li><strong>Analyseur de Fichiers :</strong> <strong>SheetJS (xlsx)</strong>, pour parser à la volée les classeurs Excel (.xlsx, .xls) et fichiers délimités (.csv).</li>
              </ul>

              <h4 className="text-sm font-bold text-slate-800 uppercase">B. Clés et Structure de Persistance (LocalStorage)</h4>
              <p>
                L'état réactif de l'application est synchronisé avec les clés de stockage locales suivantes. Les développeurs pourront s'y référer pour inspecter ou injecter des données par défaut :
              </p>
              <table className="w-full text-left text-[9px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
                    <th className="p-1.5 border border-slate-300">Clé LocalStorage</th>
                    <th className="p-1.5 border border-slate-300">Type JSON stocké</th>
                    <th className="p-1.5 border border-slate-300">Description / Rôle métier</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-1.5 font-mono border border-slate-300 font-bold">cr78_dps_activities</td>
                    <td className="p-1.5 font-mono border border-slate-300">Array&lt;ParsedDpsRow&gt;</td>
                    <td className="p-1.5 border border-slate-300">Registre complet des DPS (Dispositifs Prévisionnels de Secours).</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-1.5 font-mono border border-slate-300 font-bold">cr78_dt_direct_activities</td>
                    <td className="p-1.5 font-mono border border-slate-300">Array&lt;ParsedDtDirectRow&gt;</td>
                    <td className="p-1.5 border border-slate-300">Opérations gérées directement par l'échelon départemental (DT).</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-1.5 font-mono border border-slate-300 font-bold">cr78_reseau_activities</td>
                    <td className="p-1.5 font-mono border border-slate-300">Array&lt;ParsedReseauRow&gt;</td>
                    <td className="p-1.5 border border-slate-300">Gardes réseau SDIS / SAMU assurées par les secouristes des Yvelines.</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-1.5 font-mono border border-slate-300 font-bold">cr78_urgence_activities</td>
                    <td className="p-1.5 font-mono border border-slate-300">Array&lt;ParsedUrgenceRow&gt;</td>
                    <td className="p-1.5 border border-slate-300">Déploiements et mobilisations de crise (ex : inondations, Orsec).</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-1.5 font-mono border border-slate-300 font-bold">cr78_formation_activities</td>
                    <td className="p-1.5 font-mono border border-slate-300">Array&lt;ParsedFormationPublicRow&gt;</td>
                    <td className="p-1.5 border border-slate-300">Statistiques d'apprentissage des sessions grand public (PSC1, IPSEN, GQS).</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-1.5 font-mono border border-slate-300 font-bold">cr78_strategic_goals</td>
                    <td className="p-1.5 font-mono border border-slate-300">Array&lt;StrategicGoal&gt;</td>
                    <td className="p-1.5 border border-slate-300">Plan d'action de la DTUS contenant l'avancement et le statut des objectifs.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Page 4: MODELISATION DE LA BASE DE DONNEES LOCAL */}
          <div className="page-break pt-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b-2 border-red-600 pb-2">3. Modélisation de Données &amp; Typescript</h3>
            <p className="text-slate-700">
              Pour assurer l'intégrité des calculs, le fichier central <code className="font-bold">/src/types.ts</code> définit rigoureusement les structures de données. Voici les interfaces clés à respecter pour toute extension :
            </p>

            <div className="space-y-4 font-mono text-[8px] bg-slate-900 text-slate-200 p-4 rounded-lg overflow-x-auto leading-tight">
{`// 1. Représentation d'une ligne d'activité DPS (Dispositif Prévisionnel de Secours)
export interface ParsedDpsRow {
  ul: string;                      // Unité locale organisatrice (ex: Versailles, St-Germain...)
  manifestation: string;           // Intitulé de l'événement couvert
  statut: string;                  // Réalisé, Planifié, Annulé
  debut: string;                   // Date/Heure de début (format ISO ou FR)
  fin: string;                     // Date/Heure de fin
  heuresDps: number;               // Volume horaire global de l'événement
  prelevement: number;             // Quote-part prélevée (en euros)
  tarifTheorique: number;          // Coût d'indemnisation global
  dimensionnement: string;         // Descriptif brut textuel (ex: "1 équipe + 1 binôme")
  secouristesEngages: number;      // Effectif de secouristes déduit par le parser
  evac: boolean;                   // Flag indiquant si une évacuation médicale a eu lieu
  heuresBenevolatCalculees: number;// Heures de bénévolat déduites (Durée d'opération * Effectif)
  nbSoins: number;                 // Nombre total de gestes cliniques de premier secours
  nbEvac: number;                  // Nombre d'évacuations réelles vers un centre hospitalier
  nbTrauma: number;                // Cas de traumatologie clinique rencontrés
  nbMalaise: number;               // Cas de malaises pris en charge
  nbInconscient: number;           // Cas d'inconscience (PLS)
  nbAcr: number;                   // Arrêts Cardio-Respiratoires (ACR / Utilisation de défibrillateur)
  medicalise: boolean;             // Présence d'un médecin, infirmier ou VPSP médicalisé
}

// 2. Représentation d'une garde de Réseau de Secours (SDIS / SAMU)
export interface ParsedReseauRow {
  date: string;                    // Date calendaire de la garde
  duree: number;                   // Durée d'astreinte en heures (généralement 12h ou 24h)
  secouristesEngages: number;      // Effectif réglementaire (bloqué à 4 équipiers par ambulance)
  heuresBenevolat: number;         // Heures bénévolat cumulées (calculé : duree * 4)
}

// 3. Objectif Stratégique du Plan d'Action Territorial
export interface StrategicGoal {
  id: string;                      // Identifiant unique
  category: 'secourisme' | 'urgence' | 'formation'; // Thématique métier
  title: string;                   // Titre de l'objectif
  description: string;             // Explications contextuelles
  type: 'quantitatif' | 'qualitatif';
  target: string;                  // Cible textuelle ou jalons
  startValue: number;              // Valeur initiale au lancement (2024)
  currentValue: number;            // Valeur mesurée à l'instant T (2026)
  targetValue: number;             // Valeur cible attendue à horizon 2029
  unit?: string;                   // Unité de mesure optionnelle (%, effectif, etc.)
  statusText: string;              // Statut textuel synthétique
  progress: number;                // Pourcentage global de progression (0 à 100)
  fourYearHorizon: string;         // Horizon temporel (ex: "2029")
}`}
            </div>
          </div>

          {/* Page 5: MOTEURS ALGORITHMIQUES DE CALCUL */}
          <div className="page-break pt-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b-2 border-red-600 pb-2">4. Moteurs Algorithmiques de Calcul Clés</h3>
            <p className="text-slate-755 text-justify">
              L'application intègre des modules algorithmiques de calcul automatique qui convertissent les données d'importation brutes en indicateurs décisionnels fiables. Trois moteurs sont cruciaux pour la cohérence des rapports :
            </p>

            <div className="space-y-4">
              {/* ALGORITHME YTD */}
              <div className="bg-slate-50 p-4 rounded border border-slate-250">
                <h4 className="text-xs font-bold text-slate-900 uppercase">A. Algorithme de Comparaison Temporelle "Year-To-Date" (YTD)</h4>
                <p className="mt-1">
                  Afin de ne pas comparer de manière inéquitable les années pleines consolidées de 2024 et 2025 avec l'année en cours (2026) qui n'est que partiellement saisie, l'application applique un filtrage calendaire strict lorsqu'elle est en mode YTD :
                </p>
                <div className="bg-white p-2.5 rounded border border-slate-200 font-mono text-[8px] text-slate-700 mt-2">
{`// Seuil de comparaison calendaire (Le dialogue d'activité a lieu le 9 juin 2026)
const YTD_CUTOFF_MONTH = 5; // Juin (indexé à 0 en JavaScript)
const YTD_CUTOFF_DAY = 9;   // 9ème jour

export const filterYTD = (activities: any[], isYtdMode: boolean, analysisYear: number) => {
  if (!isYtdMode) return activities; // Retourne 100% des données si désactivé

  return activities.filter(activity => {
    const actYear = getYearFromDate(activity.date);
    
    // Si l'activité est d'une année antérieure (2024, 2025), on restreint
    if (actYear < analysisYear) {
      const actDate = new Date(activity.date);
      const month = actDate.getMonth();
      const day = actDate.getDate();
      
      // On conserve uniquement les événements programmés avant le 9 juin de l'année concernée
      if (month > YTD_CUTOFF_MONTH || (month === YTD_CUTOFF_MONTH && day > YTD_CUTOFF_DAY)) {
        return false;
      }
    }
    return true;
  });
};`}
                </div>
              </div>

              {/* PARSER DE DIMENSIONNEMENT */}
              <div className="bg-slate-50 p-4 rounded border border-slate-250">
                <h4 className="text-xs font-bold text-slate-900 uppercase">B. Analyseur Syntaxique du Dimensionnement des DPS</h4>
                <p className="mt-1">
                  Les effectifs engagés ne sont pas toujours saisis sous forme numérique. Le système parse automatiquement le texte de la colonne <em>Dimensionnement</em> pour déduire le nombre de secouristes d'après les standards opérationnels de la Croix-Rouge française :
                </p>
                <ul className="list-disc pl-6 mt-1 space-y-1">
                  <li><strong>"Équipe" / "EQ" / "VPSP" :</strong> Détecté comme 1 équipe d'intervention de secours d'urgence, soit <strong>4 secouristes</strong>.</li>
                  <li><strong>"Binôme" / "BIN" :</strong> Détecté comme un binôme de premiers secours, soit <strong>2 secouristes</strong>.</li>
                  <li><strong>"PAPS" (Point d'Alerte et de Premiers Secours) :</strong> Détecté comme un dispositif léger, soit <strong>2 secouristes</strong>.</li>
                  <li><strong>Calcul des heures bénévoles :</strong> <code className="bg-white px-1 py-0.5 rounded border">Heures Bénévolat = (Heure Fin - Heure Début) × Secouristes Engagés</code>.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Page 6: SPECIFICATIONS IMPORTS EXCEL / CSV */}
          <div className="page-break pt-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b-2 border-red-600 pb-2">5. Spécifications Techniques d'Importation</h3>
            <p className="text-slate-700">
              L'outil de chargement utilise <strong>xlsx</strong> en mode lecture purement locale. Voici la cartographie rigoureuse des en-têtes attendus par l'application pour valider et intégrer les données. Si l'un des en-têtes requis est absent, le système de validation rejette la ligne de manière sécurisée en levant une exception visualisable dans le panneau de rapport de cohérence :
            </p>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-red-600 border-l-4 border-red-600 pl-2 uppercase">Gabarit 1 : Dispositifs Prévisionnels de Secours (DPS)</h4>
                <table className="w-full text-left text-[9px] border-collapse border border-slate-300 mt-1.5">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-300">
                      <th className="p-1 border border-slate-300">Intitulé de colonne attendu</th>
                      <th className="p-1 border border-slate-300">Type requis</th>
                      <th className="p-1 border border-slate-300">Règle de conversion &amp; Valeur par défaut</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-1 font-mono border border-slate-300 font-bold">MANIFESTATION</td>
                      <td className="p-1 border border-slate-300">Texte (Non vide)</td>
                      <td className="p-1 border border-slate-300">Identifie l'événement. Si vide, la ligne est rejetée.</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-1 font-mono border border-slate-300 font-bold">UL</td>
                      <td className="p-1 border border-slate-300">Texte</td>
                      <td className="p-1 border border-slate-300">Unité locale organisatrice (ex: "Versailles"). Par défaut "DT Yvelines".</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-1 font-mono border border-slate-300 font-bold">Début / Fin</td>
                      <td className="p-1 border border-slate-300">Date ISO/FR</td>
                      <td className="p-1 border border-slate-300">Converti en objet Date JavaScript. Utilisé pour calculer la durée de l'opération.</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-1 font-mono border border-slate-300 font-bold">Dimensionnement</td>
                      <td className="p-1 border border-slate-300">Texte libre</td>
                      <td className="p-1 border border-slate-300">Analysé par le moteur syntaxique pour en extraire le nombre de bénévoles.</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-1 font-mono border border-slate-300 font-bold">Nb Soins / Nb évac</td>
                      <td className="p-1 border border-slate-300">Entier &gt;= 0</td>
                      <td className="p-1 border border-slate-300">Si absent, valorisé par défaut à 0. Utilisé pour les statistiques cliniques.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="text-xs font-bold text-emerald-600 border-l-4 border-emerald-600 pl-2 uppercase">Gabarit 2 : Activités Directes de la DT</h4>
                <table className="w-full text-left text-[9px] border-collapse border border-slate-300 mt-1.5">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-300">
                      <th className="p-1 border border-slate-300">Intitulé de colonne attendu</th>
                      <th className="p-1 border border-slate-300">Type requis</th>
                      <th className="p-1 border border-slate-300">Description / Rôle dans la formule financière</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-1 font-mono border border-slate-300 font-bold">Tarif théorique</td>
                      <td className="p-1 border border-slate-300">Nombre (Euros)</td>
                      <td className="p-1 border border-slate-300">Devis financier global facturé par l'échelon départemental.</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-1 font-mono border border-slate-300 font-bold">Reversement UL</td>
                      <td className="p-1 border border-slate-300">Nombre (Euros)</td>
                      <td className="p-1 border border-slate-300">Part reversée à l'unité locale d'origine en compensation de ses secouristes.</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-1 font-mono border border-slate-300 font-bold">CA Net</td>
                      <td className="p-1 border border-slate-300">Nombre (Euros)</td>
                      <td className="p-1 border border-slate-300">Gain net conservé par la DT (Calculé : Devis - Reversement - Repas).</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Page 7: DOCUMENT DE PASSATION ET HANDOVER DEVELOPPEURS */}
          <div className="page-break pt-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b-2 border-red-600 pb-2">6. Plan de Transition &amp; Reprise de Code (Remise d'Outil)</h3>
            <p className="text-slate-755 text-justify">
              Pour l'équipe de développement reprenant le projet, voici les directives architecturales recommandées pour implémenter les évolutions futures majeures :
            </p>

            <div className="space-y-4 text-slate-700">
              <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase">Étape 1 : Comment intégrer le Lot 2 (Les Activités Sociales)</h4>
                <p className="text-[11px]">
                  Le Lot d'activité sociale (Aide alimentaire, Vestiboutique, Lutte contre l'isolement) est déjà esquissé dans les types et la structure. Pour le rendre 100% interactif :
                </p>
                <ol className="list-decimal pl-6 space-y-1 text-slate-600 text-[10px]">
                  <li>Déclarer de nouvelles clés LocalStorage (ex: <code className="bg-white px-1">cr78_social_activities</code>).</li>
                  <li>Modifier le sélecteur de métier principal dans <code className="bg-white px-1">src/App.tsx</code> pour intégrer les métiers sociaux aux côtés de 'secourisme', 'urgence' et 'formation'.</li>
                  <li>Réutiliser le composant générique d'import en adaptant les en-têtes requis (ex: Colonnes <em>Bénéficiaires</em>, <em>Kilos distribués</em>, <em>Heures d'écoute</em>).</li>
                </ol>
              </div>

              <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase">Étape 2 : Migration vers une Base de Données Cloud (Firebase Firestore)</h4>
                <p className="text-[11px]">
                  Si la DTUS souhaite partager ce tableau de bord en temps réel entre plusieurs cadres ou unités locales avec authentification sécurisée :
                </p>
                <ol className="list-decimal pl-6 space-y-1 text-slate-600 text-[10px]">
                  <li>
                    <strong>Initialiser le SDK client :</strong> Créer un fichier <code className="bg-white px-1">src/lib/firebase.ts</code> et configurer Firestore avec <code className="bg-white px-1">getFirestore()</code>.
                  </li>
                  <li>
                    <strong>Remplacer le LocalStorage :</strong> Remplacer les appels de lecture/écriture du hook React (ex: <code className="bg-white px-1">localStorage.setItem</code>) par des fonctions asynchrones Firestore (<code className="bg-white px-1">setDoc</code>, <code className="bg-white px-1">getDoc</code>) ou un écouteur temps réel (<code className="bg-white px-1">onSnapshot</code>).
                  </li>
                  <li>
                    <strong>Mettre en place la Sécurité :</strong> Activer Firestore Auth pour s'assurer que seuls les emails en <code className="bg-white px-1">@croix-rouge.fr</code> puissent modifier les objectifs stratégiques départementaux.
                  </li>
                </ol>
              </div>

              <div className="border-t border-slate-200 pt-6 text-center">
                <p className="font-bold text-slate-800">Fin du Dossier Technique Territorial</p>
                <p className="text-slate-500 text-[10px] mt-1">
                  Ce document constitue la référence officielle de l'application de pilotage d'activité 2026 de la DTUS 78.
                </p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </AnimatePresence>
  );
};
