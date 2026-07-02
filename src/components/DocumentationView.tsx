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
  <title>Guide d'Utilisateur & Spécifications - Croix-Rouge française DTUS 78</title>
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
        <h1 class="text-xs font-black uppercase tracking-wider">Croix-Rouge française Yvelines</h1>
        <p class="text-[10px] text-slate-400 font-medium">Guide Officiel d'Utilisation • DTUS 78</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button onclick="window.print()" class="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-xs py-2 px-4 rounded transition cursor-pointer shadow-sm">
        Imprimer / Exporter en PDF
      </button>
    </div>
  </div>

  <div class="max-w-4xl mx-auto my-8 bg-white p-12 shadow-sm rounded-xl border border-slate-200 print:shadow-none print:border-none print:my-0 print:p-0">
    <!-- PAGE 1: COVER PAGE -->
    <div class="flex flex-col justify-between h-[27cm] border-4 border-slate-900 p-10">
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

        <div class="mt-24 space-y-4">
          <h2 class="text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Guide de l'Utilisateur &amp; Documentation Technique
          </h2>
          <p class="text-sm text-slate-600 font-medium max-w-2xl">
            Application Territoriale de Pilotage d'Activité et de Dialogue Stratégique de la DTUS des Yvelines.
          </p>
        </div>
      </div>

      <div class="border-t border-slate-200 pt-8 mt-auto flex justify-between text-[10px] text-slate-500 font-mono">
        <div>
          <p class="font-bold text-slate-800">Éditeur :</p>
          <p>Direction Territoriale de l'Urgence et du Secourisme (DTUS 78)</p>
        </div>
        <div class="text-right">
          <p class="font-bold text-slate-800">Référence :</p>
          <p>v2026.07 • Document de Service Officiel</p>
          <p>Date d'édition : Juillet 2026</p>
        </div>
      </div>
    </div>

    <!-- PAGE 2: INTRO -->
    <div class="page-break pt-12 space-y-6">
      <h3 class="text-xl font-bold text-slate-900 border-b-2 border-red-600 pb-2">Sommaire &amp; Présentation Générale</h3>
      
      <div class="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-3">
        <h4 class="font-bold text-slate-800 text-xs uppercase tracking-wider">Sommaire</h4>
        <ol class="list-decimal pl-6 space-y-2 font-medium text-sm text-slate-700">
          <li>Présentation de l'Outil de Pilotage DTUS 78</li>
          <li>Guide de Prise en Main (Sélecteur de Métier, Mode YTD, Plan Stratégique)</li>
          <li>Fiche d'Architecture Technique (SheetJS, LocalStorage, Securité)</li>
          <li>Spécifications des formats d'importation Excel / CSV</li>
          <li>Foire Aux Questions &amp; Résolution des problèmes</li>
        </ol>
      </div>

      <div class="space-y-4 text-sm leading-relaxed text-slate-700">
        <h4 class="text-base font-bold text-slate-900">1. Présentation Générale &amp; Vision Fonctionnelle</h4>
        <p>
          L'application de pilotage d'activité de la <strong>DTUS Yvelines (78)</strong> est un tableau de bord décisionnel conçu pour consolider, analyser et valoriser l'activité opérationnelle liée à l'urgence, au secourisme et à la formation au sein du département des Yvelines.
        </p>
        <p>
          Elle permet aux équipes d'encadrement départemental de disposer d'indicateurs synthétiques clairs lors des dialogues d'activité avec les partenaires (SDIS, SAMU, Préfecture) et de suivre avec précision l'avancement des grands projets territoriaux.
        </p>
        <p>
          Tout le processus de calcul, de consolidation, et d'affichage est effectué 100% côté client (navigateur local), sans aucun transit ou stockage de données confidentielles sur des serveurs tiers, garantissant ainsi la totale souveraineté des données de la Croix-Rouge française.
        </p>
      </div>
    </div>

    <!-- PAGE 3: USER GUIDE -->
    <div class="page-break pt-12 space-y-6">
      <h3 class="text-xl font-bold text-slate-900 border-b-2 border-red-600 pb-2">2. Guide de l'Utilisateur (Fonctionnalités Clés)</h3>
      
      <div class="space-y-4 text-sm leading-relaxed text-slate-700">
        <h4 class="text-base font-bold text-slate-800 uppercase tracking-wide">A. Le Sélecteur d'Année d'Analyse et Mode YTD</h4>
        <p>
          Pour comparer objectivement les indicateurs de l'année en cours avec les années précédentes, l'application intègre une comparaison temporelle rigoureuse appelée <strong>Year-To-Date (YTD)</strong>.
        </p>
        <ul class="list-disc pl-6 space-y-2">
          <li>
            <strong>Mode YTD Activé :</strong> Restreint l'analyse temporelle des années 2024 et 2025 uniquement aux données enregistrées <strong>avant le 9 juin</strong> de chaque année respective. Cela permet une comparaison équitable à périmètre calendaire égal avec l'année en cours (2026).
          </li>
          <li>
            <strong>Mode YTD Désactivé :</strong> Affiche les années complètes consolidées à 100%.
          </li>
        </ul>

        <h4 class="text-base font-bold text-slate-800 uppercase tracking-wide">B. Choix du Métier Opérationnel</h4>
        <p>
          Toutes les fonctionnalités de l'application s'adaptent dynamiquement en fonction du métier sélectionné en haut de l'écran :
        </p>
        <ul class="list-disc pl-6 space-y-2">
          <li><strong>Secourisme :</strong> Analyse des dispositifs prévisionnels de secours (DPS), des gardes de réseau de secours (SDIS, SAMU) et de l'activité départementale gérée en direct par la Direction Territoriale (DT).</li>
          <li><strong>Urgence :</strong> Mobilisations de crise (Plans Orsec, hébergements d'urgence sociale, soutien aux sinistrés).</li>
          <li><strong>Formation :</strong> Sessions d'apprentissage Grand Public (PSC1, ePSC, Gestes qui sauvent, IPSEN, Recyclages).</li>
        </ul>

        <h4 class="text-base font-bold text-slate-800 uppercase tracking-wide">C. Le Plan d'Action Territorial (Objectifs Stratégiques)</h4>
        <p>
          Ce module permet de suivre l'avancement concret des chantiers prioritaires du département (ex : <em>Hébergement d'Urgence Départemental, Médicalisation des DPS, Recrutement de formateurs, etc.</em>).
          Chaque carte est modifiable interactivement (titre, statut de réalisation, pourcentage de progression globale, étapes clés), et les modifications sont enregistrées automatiquement.
        </p>
      </div>
    </div>

    <!-- PAGE 4: SPECIFICATIONS IMPORTS EXCEL / CSV -->
    <div class="page-break pt-12 space-y-6">
      <h3 class="text-xl font-bold text-slate-900 border-b-2 border-red-600 pb-2">3. Spécifications des Formats d'Importation Excel / CSV</h3>
      <p class="text-sm">
        L'application de pilotage intègre des analyseurs de fichiers très robustes capables de déceler et de mapper automatiquement les en-têtes et les valeurs de colonnes. Les modèles types correspondants peuvent être téléchargés depuis l'outil d'intégration.
      </p>

      <div class="space-y-6">
        <div class="space-y-2">
          <h4 class="text-sm font-bold text-red-600 border-l-4 border-red-600 pl-2">Format 1 : Dispositifs Prévisionnels de Secours (DPS)</h4>
          <p class="text-xs text-slate-600">
            Le système calcule automatiquement l'effectif des secouristes en parsant la colonne <em>Dimensionnement</em> (ex: "1 équipe et 1 binôme" = 6 secouristes).
          </p>
          <table class="w-full text-left text-xs border-collapse border border-slate-300">
            <thead>
              <tr class="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                <th class="p-2 border border-slate-300">En-tête requis</th>
                <th class="p-2 border border-slate-300">Type de donnée</th>
                <th class="p-2 border border-slate-300">Description / Valeurs autorisées</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-slate-200">
                <td class="p-2 font-mono border border-slate-300 font-bold">MANIFESTATION</td>
                <td class="p-2 border border-slate-300">Texte</td>
                <td class="p-2 border border-slate-300">Nom de l'événement couvert.</td>
              </tr>
              <tr class="border-b border-slate-200">
                <td class="p-2 font-mono border border-slate-300 font-bold">UL</td>
                <td class="p-2 border border-slate-300">Texte</td>
                <td class="p-2 border border-slate-300">Unité locale organisatrice (ex: Versailles).</td>
              </tr>
              <tr class="border-b border-slate-200">
                <td class="p-2 font-mono border border-slate-300 font-bold">Début / Fin</td>
                <td class="p-2 border border-slate-300">Date &amp; Heure</td>
                <td class="p-2 border border-slate-300">Format standard de date (ex: 2026-05-12 14:00).</td>
              </tr>
              <tr class="border-b border-slate-200">
                <td class="p-2 font-mono border border-slate-300 font-bold">Dimensionnement</td>
                <td class="p-2 border border-slate-300">Texte</td>
                <td class="p-2 border border-slate-300">"1 équipe", "1 binôme", "2 équipes" (analysé en effectif).</td>
              </tr>
              <tr class="border-b border-slate-200">
                <td class="p-2 font-mono border border-slate-300 font-bold">Nb Soins / Nb évac</td>
                <td class="p-2 border border-slate-300">Nombre entier</td>
                <td class="p-2 border border-slate-300">Statistiques médicales et transferts hôpital.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- PAGE 5: AUTRES FORMATS D'IMPORTS -->
    <div class="page-break pt-12 space-y-6">
      <h3 class="text-xl font-bold text-slate-900 border-b-2 border-slate-300 pb-2">3. Spécifications d'Imports (Suite)</h3>
      
      <div class="space-y-6">
        <div class="space-y-2">
          <h4 class="text-sm font-bold text-blue-600 border-l-4 border-blue-600 pl-2">Format 2 : Gardes de Réseau SDIS (Pompiers)</h4>
          <p class="text-xs text-slate-600">
            Chaque ligne de garde de 12h ou 24h injecte automatiquement un volume réglementaire de 4 équipiers d'astreinte.
          </p>
          <table class="w-full text-left text-xs border-collapse border border-slate-300">
            <thead>
              <tr class="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                <th class="p-2 border border-slate-300">En-tête requis</th>
                <th class="p-2 border border-slate-300">Type de donnée</th>
                <th class="p-2 border border-slate-300">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-slate-200">
                <td class="p-2 font-mono border border-slate-300 font-bold">Date</td>
                <td class="p-2 border border-slate-300">Date</td>
                <td class="p-2 border border-slate-300">Date de la garde (ex : 2026-01-03).</td>
              </tr>
              <tr>
                <td class="p-2 font-mono border border-slate-300 font-bold">Durée de garde</td>
                <td class="p-2 border border-slate-300">Nombre</td>
                <td class="p-2 border border-slate-300">Durée en heures de la garde (généralement 12 ou 24).</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="space-y-2 mt-6">
          <h4 class="text-sm font-bold text-emerald-600 border-l-4 border-emerald-600 pl-2">Format 3 : Activités Directes DT (Territoire Yvelines)</h4>
          <p class="text-xs text-slate-600">
            Ce registre comptabilise les opérations d'envergure départementale gérées en direct par la DT.
          </p>
          <table class="w-full text-left text-xs border-collapse border border-slate-300">
            <thead>
              <tr class="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                <th class="p-2 border border-slate-300">En-tête requis</th>
                <th class="p-2 border border-slate-300">Type de donnée</th>
                <th class="p-2 border border-slate-300">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-slate-200">
                <td class="p-2 font-mono border border-slate-300 font-bold">MANIFESTATION</td>
                <td class="p-2 border border-slate-300">Texte</td>
                <td class="p-2 border border-slate-300">Nom de l'opération.</td>
              </tr>
              <tr>
                <td class="p-2 font-mono border border-slate-300 font-bold">CA Net</td>
                <td class="p-2 border border-slate-300">Nombre</td>
                <td class="p-2 border border-slate-300">Gain net territorial (Calculé : Devis - Reversement - Repas).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- PAGE 6: TECHNIQUE ET FAQ -->
    <div class="page-break pt-12 space-y-6">
      <h3 class="text-xl font-bold text-slate-900 border-b-2 border-red-600 pb-2">4. Fiche Technique &amp; FAQ</h3>
      
      <div class="grid grid-cols-2 gap-6 text-xs text-slate-700">
        <div class="space-y-2">
          <h4 class="font-bold text-slate-850">Architecture de l'Application</h4>
          <p>
            L'application de pilotage est entièrement assemblée en <strong>React 18</strong>, <strong>TypeScript</strong> et <strong>Tailwind CSS</strong>. Elle s'exécute de façon instantanée et sécurisée sans base de données hébergée externe.
          </p>
        </div>
        
        <div class="space-y-2">
          <h4 class="font-bold text-emerald-700">Souveraineté des Données</h4>
          <p>
            Aucune information nominative ou confidentielle n'est transférée en ligne. Le LocalStorage sert d'espace de stockage sécurisé local.
          </p>
        </div>
      </div>

      <div class="border-t border-slate-200 pt-6 space-y-4 text-xs text-slate-700">
        <h4 class="font-bold text-slate-900">5. Foire Aux Questions (FAQ)</h4>
        <div class="space-y-3">
          <div>
            <p class="font-bold text-slate-850">Q: Pourquoi le bouton d'impression directe ne réagit pas ?</p>
            <p class="text-slate-600">R: Dans certains navigateurs, l'iframe de démonstration bloque l'accès à la boîte d'impression. C'est pourquoi nous mettons à votre disposition le bouton "Télécharger le Guide complet (.html)". Ouvrez ce fichier HTML sur votre ordinateur, puis lancez l'impression pour obtenir votre PDF sans aucune contrainte !</p>
          </div>
          <div>
            <p class="font-bold text-slate-850">Q: Puis-je exporter le tableau de bord principal ?</p>
            <p class="text-slate-600">R: Oui ! Une feuille de style d'impression est intégrée sur l'ensemble de l'application. Faites Ctrl+P ou utilisez le raccourci d'impression pour générer un bilan papier ou un rapport PDF épuré.</p>
          </div>
        </div>
      </div>

      <div class="pt-12 text-center text-[10px] text-slate-400 font-mono">
        © 2026 Croix-Rouge française • Direction Territoriale des Yvelines • Tous droits réservés.
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
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Guide de l'Utilisateur &amp; Documentation Technique
                </h2>
                <p className="text-sm text-slate-600 font-medium max-w-2xl">
                  Application Territoriale de Pilotage d'Activité et de Dialogue Stratégique de la DTUS des Yvelines.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-8 mt-auto flex justify-between text-[10px] text-slate-500 font-mono">
              <div>
                <p className="font-bold text-slate-800">Éditeur :</p>
                <p>Direction Territoriale de l'Urgence et du Secourisme (DTUS 78)</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800">Référence :</p>
                <p>v2026.07 • Document de Service Officiel</p>
                <p>Date d'édition : Juillet 2026</p>
              </div>
            </div>
          </div>

          {/* Page 2: SOMMAIRE & INTRODUCTION */}
          <div className="page-break pt-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b-2 border-red-600 pb-2">Sommaire &amp; Présentation Générale</h3>
            
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs">Sommaire</h4>
              <ol className="list-decimal pl-6 space-y-2 font-medium">
                <li>Présentation de l'Outil de Pilotage DTUS 78</li>
                <li>Guide Fonctionnel (Sélecteur de Métier, Mode YTD, Plan Stratégique)</li>
                <li>Fiche Technique (Formats d'Import, SheetJS, LocalStorage)</li>
                <li>Spécifications des formats d'importation Excel / CSV</li>
                <li>Foire Aux Questions &amp; Dépannage rapide</li>
              </ol>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900">1. Présentation Générale &amp; Vision Fonctionnelle</h4>
              <p>
                L'application de pilotage d'activité de la <strong>DTUS Yvelines (78)</strong> est un tableau de bord décisionnel conçu pour consolider, analyser et valoriser l'activité opérationnelle liée à l'urgence, au secourisme et à la formation au sein du département des Yvelines.
              </p>
              <p>
                Elle permet aux équipes d'encadrement départemental de disposer d'indicateurs synthétiques clairs lors des dialogues d'activité avec les partenaires (SDIS, SAMU, Préfecture) et de suivre avec précision l'avancement des grands projets territoriaux.
              </p>
            </div>
          </div>

          {/* Page 3: GUIDE DE L'UTILISATEUR */}
          <div className="page-break pt-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b-2 border-red-600 pb-2">2. Guide de l'Utilisateur (Fonctionnalités Clés)</h3>
            
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800">A. Le Sélecteur d'Année d'Analyse et Mode YTD</h4>
              <p>
                Pour comparer objectivement les indicateurs de l'année en cours avec les années précédentes, l'application intègre une comparaison rigoureuse appelée <strong>Year-To-Date (YTD)</strong>.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Mode YTD Activé :</strong> Restreint l'analyse temporelle des années 2024 et 2025 uniquement aux données enregistrées <strong>avant le 9 juin</strong> de chaque année respective. Cela permet une comparaison équitable à périmètre calendaire égal avec l'année en cours (2026).
                </li>
                <li>
                  <strong>Mode YTD Désactivé :</strong> Affiche les années complètes consolidées à 100%.
                </li>
              </ul>

              <h4 className="text-sm font-bold text-slate-800">B. Choix du Métier Opérationnel</h4>
              <p>
                Toutes les fonctionnalités de l'application s'adaptent dynamiquement en fonction du métier sélectionné en haut de l'écran :
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Secourisme :</strong> Analyse des dispositifs prévisionnels de secours (DPS), des gardes de réseau de secours (SDIS, SAMU) et de l'activité départementale gérée en direct par la Direction Territoriale (DT).</li>
                <li><strong>Urgence :</strong> Mobilisations de crise (Plans Orsec, hébergements d'urgence sociale, soutien aux sinistrés).</li>
                <li><strong>Formation :</strong> Sessions d'apprentissage Grand Public (PSC1, ePSC, Gestes qui sauvent, IPSEN, Recyclages).</li>
              </ul>

              <h4 className="text-sm font-bold text-slate-800">C. Le Plan d'Action Territorial (Objectifs Stratégiques)</h4>
              <p>
                Ce module permet de suivre l'avancement concret des chantiers prioritaires du département (ex : <em>Hébergement d'Urgence Départemental, Médicalisation des DPS, Recrutement de formateurs, etc.</em>).
                Chaque carte est modifiable interactivement (titre, statut de réalisation, pourcentage de progression globale, étapes clés), et les modifications sont enregistrées automatiquement.
              </p>
            </div>
          </div>

          {/* Page 4: SPECIFICATIONS IMPORTS EXCEL / CSV */}
          <div className="page-break pt-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b-2 border-red-600 pb-2">3. Spécifications des Formats d'Importation Excel / CSV</h3>
            <p>
              L'application de pilotage intègre des analyseurs automatiques de classeurs capables d'extraire les données d'activité de vos fichiers. Vous pouvez télécharger des modèles types pré-configurés pour chacun des imports décrits ci-dessous directement depuis la modale d'intégration de l'application.
            </p>

            <div className="space-y-6">
              {/* Table DPS */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-red-600 border-l-4 border-red-600 pl-2">Format 1 : Dispositifs Prévisionnels de Secours (DPS)</h4>
                <p className="text-[10px]">
                  Le système parse automatiquement le texte de la colonne <em>Dimensionnement</em> pour en déduire automatiquement l'effectif engagé (ex: 2 équipes + 1 binôme = 10 secouristes).
                </p>
                <table className="w-full text-left text-[10px] border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                      <th className="p-1.5 border border-slate-300">En-tête requis</th>
                      <th className="p-1.5 border border-slate-300">Type de donnée</th>
                      <th className="p-1.5 border border-slate-300">Description / Valeurs autorisées</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-1.5 font-mono border border-slate-300">MANIFESTATION</td>
                      <td className="p-1.5 border border-slate-300">Texte</td>
                      <td className="p-1.5 border border-slate-300">Nom de l'événement couvert.</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-1.5 font-mono border border-slate-300">UL</td>
                      <td className="p-1.5 border border-slate-300">Texte</td>
                      <td className="p-1.5 border border-slate-300">Unité locale organisatrice (ex: Versailles, Saint-Germain).</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-1.5 font-mono border border-slate-300">Début / Fin</td>
                      <td className="p-1.5 border border-slate-300">Date &amp; Heure</td>
                      <td className="p-1.5 border border-slate-300">Format standard de date (ex: 2026-05-12 14:00).</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-1.5 font-mono border border-slate-300">Dimensionnement</td>
                      <td className="p-1.5 border border-slate-300">Texte</td>
                      <td className="p-1.5 border border-slate-300">"1 équipe", "1 binôme", "1 équipe et 1 PAPS" (analysé en effectif).</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 font-mono border border-slate-300">Nb Soins / Nb évac</td>
                      <td className="p-1.5 border border-slate-300">Nombre entier</td>
                      <td className="p-1.5 border border-slate-300">Fiches de soins remplies ou évacuations réelles de blessés.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Page 5: AUTRES FORMATS D'IMPORTS */}
          <div className="page-break pt-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b-2 border-slate-300 pb-2">3. Spécifications d'Imports (Suite)</h3>
            
            <div className="space-y-6">
              {/* Table SDIS & DIRECT */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-blue-600 border-l-4 border-blue-600 pl-2">Format 2 : Gardes de Réseau SDIS (Pompiers)</h4>
                <p className="text-[10px]">
                  Chaque ligne de garde de 12h ou 24h injecte automatiquement un volume réglementaire de 4 équipiers d'astreinte (Calcul des heures bénévoles: Durée × 4).
                </p>
                <table className="w-full text-left text-[10px] border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                      <th className="p-1.5 border border-slate-300">En-tête requis</th>
                      <th className="p-1.5 border border-slate-300">Type de donnée</th>
                      <th className="p-1.5 border border-slate-300">Description / Exemples</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-1.5 font-mono border border-slate-300">Date</td>
                      <td className="p-1.5 border border-slate-300">Date</td>
                      <td className="p-1.5 border border-slate-300">Date de la garde (ex : 2026-01-03).</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 font-mono border border-slate-300">Durée de garde</td>
                      <td className="p-1.5 border border-slate-300">Nombre</td>
                      <td className="p-1.5 border border-slate-300">Durée en heures de la garde (généralement 12 ou 24).</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-emerald-600 border-l-4 border-emerald-600 pl-2">Format 3 : Activités Directes DT (Territoire Yvelines)</h4>
                <p className="text-[10px]">
                  Ce registre comptabilise les opérations de grande envergure pilotées en direct par l'échelon départemental.
                </p>
                <table className="w-full text-left text-[10px] border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                      <th className="p-1.5 border border-slate-300">En-tête requis</th>
                      <th className="p-1.5 border border-slate-300">Type de donnée</th>
                      <th className="p-1.5 border border-slate-300">Description / Exemples</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-1.5 font-mono border border-slate-300">MANIFESTATION</td>
                      <td className="p-1.5 border border-slate-300">Texte</td>
                      <td className="p-1.5 border border-slate-300">Nom de l'opération départementale.</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-1.5 font-mono border border-slate-300">Tarif théorique</td>
                      <td className="p-1.5 border border-slate-300">Nombre (Euros)</td>
                      <td className="p-1.5 border border-slate-300">Montant total facturé sur devis.</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-1.5 font-mono border border-slate-300">Reversement UL</td>
                      <td className="p-1.5 border border-slate-300">Nombre (Euros)</td>
                      <td className="p-1.5 border border-slate-300">Part financière reversée à l'Unité Locale de renfort.</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 font-mono border border-slate-300">CA Net</td>
                      <td className="p-1.5 border border-slate-300">Nombre (Euros)</td>
                      <td className="p-1.5 border border-slate-300">Gain net conservé par la DT (Calculé : Devis - Reversement - Repas).</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Page 6: FICHE TECHNIQUE, SECURITE ET FAQ */}
          <div className="page-break pt-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b-2 border-red-600 pb-2">4. Fiche Technique, Sécurité &amp; FAQ</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-xs">Architecture Technique</h4>
                <p className="text-[10px]">
                  L'application est développée en <strong>React 18</strong> et <strong>TypeScript</strong>. Elle utilise <strong>Vite</strong> comme outil d'assemblage ultra-rapide. Les graphiques interactifs sont animés avec <strong>Recharts</strong>, tandis que le parsing local des classeurs Excel est géré de façon fluide par la bibliothèque <strong>SheetJS (XLSX)</strong>.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-bold text-emerald-700 text-xs">Confidentialité (Privacy By Design)</h4>
                <p className="text-[10px]">
                  <strong>Aucune donnée personnelle n'est envoyée vers un serveur externe.</strong> Les opérations de parsing, d'analyse et d'affichage sont exécutées intégralement dans la mémoire vive de votre navigateur. La sauvegarde de votre tableau de bord s'effectue localement et de manière sécurisée via le <strong>LocalStorage</strong> de votre ordinateur.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6 space-y-4">
              <h4 className="text-sm font-bold text-slate-900">5. Foire Aux Questions (FAQ)</h4>
              
              <div className="space-y-3 text-[10px]">
                <div>
                  <p className="font-bold text-slate-800">Q: L'analyseur affiche 'Structure non conforme' lors de mon import. Pourquoi ?</p>
                  <p className="text-slate-600">R: Vérifiez que les en-têtes de colonnes (première ligne de votre fichier Excel) correspondent exactement aux titres attendus. Pour éviter les erreurs, téléchargez le modèle type pré-configuré depuis l'interface d'intégration et collez-y vos données.</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Q: Que se passe-t-il si je clique sur 'Réinitialiser la base de données' ?</p>
                  <p className="text-slate-600">R: Ce bouton nettoie les données importées de votre LocalStorage et recharge le scénario initial de démonstration de la DTUS 78. Vos fichiers stockés sur votre ordinateur ne sont pas affectés.</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Q: Comment enregistrer en PDF à partir du menu d'impression ?</p>
                  <p className="text-slate-600">R: Une fois le dialogue d'impression ouvert, dans le champ 'Destination', sélectionnez 'Enregistrer au format PDF' ou 'Enregistrer comme PDF' à la place de votre imprimante physique locale, puis validez.</p>
                </div>
              </div>
            </div>

            <div className="pt-12 text-center text-[9px] text-slate-400 font-mono">
              © 2026 Croix-Rouge française • Direction Territoriale des Yvelines • Tous droits réservés.
            </div>
          </div>
        </div>,
        document.body
      )}
    </AnimatePresence>
  );
};
