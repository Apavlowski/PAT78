# 📋 Guide de l'Utilisateur et Documentation Technique
## Application de Pilotage d'Activité – Croix-Rouge française des Yvelines (DTUS 78)

Bienvenue dans la documentation officielle de l'application de pilotage d'activité de la **Direction Territoriale de l'Urgence et du Secourisme des Yvelines (DTUS 78)**. Ce guide est conçu pour vous accompagner dans la prise en main fonctionnelle de l'outil, vous détailler son architecture technique et spécifier précisément les formats d'importation de fichiers requis pour alimenter la plateforme.

---

## 🗺️ Sommaire
1. [🌟 Présentation Générale & Vision Fonctionnelle](#1-présentation-générale--vision-fonctionnelle)
2. [🧭 Guide Utilisateur (Fonctionnalités Clés)](#2-guide-utilisateur-fonctionnalités-clés)
3. [📊 Registres & Analyses par Métier](#3-registres--analyses-par-métier)
4. [🛠️ Architecture Technique & Spécifications](#4-architecture-technique--spécifications)
5. [📥 Formats d'Importation Excel & CSV (Détaillés)](#5-formats-dimportation-excel--csv-détaillés)
6. [💡 FAQ & Résolution des Problèmes](#6-faq--résolution-des-problèmes)

---

## 1. 🌟 Présentation Générale & Vision Fonctionnelle

L'application **Croix-Rouge Yvelines (DTUS 78)** est un tableau de bord décisionnel conçu pour consolider, analyser et valoriser l'activité opérationnelle liée à l'urgence, au secourisme et à la formation au sein du département des Yvelines.

### Les objectifs majeurs de l'outil :
*   **Centraliser les données d'activité** provenant de différentes Unités Locales (UL) ou d'opérations départementales gérées en direct par la Direction Territoriale (DT).
*   **Faciliter le Dialogue d'Activité** avec les élus locaux, la préfecture et les partenaires institutionnels (SDIS 78, SAMU 78) en présentant des indicateurs clairs, fiables et comparables.
*   **Piloter les objectifs stratégiques** du Plan d'Action Territorial en suivant l'état d'avancement des grands projets opérationnels de manière interactive.
*   **Assurer la souveraineté et la confidentialité des données** grâce à un traitement intégralement effectué côté client (navigateur) sans transfert de données personnelles vers des serveurs tiers.

---

## 2. 🧭 Guide Utilisateur (Fonctionnalités Clés)

L'interface de l'application est structurée de manière logique, fluide et hautement visuelle, respectant la charte graphique de la Croix-Rouge française (accents rouges typiques, structures claires et espacées).

### A. Le Bandeau d'Accueil et Indicateurs Globaux
Le sommet du tableau de bord présente en temps réel le statut consolidé du département.
*   **Bilan 2025 (Dernière année complète)** : Affiche le volume total d'actions de secours et le volume global d'heures de bénévolat accomplies.
*   **Bilan 2026 (Année en cours)** : Présente les indicateurs dynamiques au fur et à mesure que l'année avance. Un badge vert clignotant **"En cours"** rappelle l'état actif des données.

### B. Choix du Métier Opérationnel
Le pilotage se divise en trois grands « métiers » opérationnels. Cliquez sur l'une des trois cartes interactives pour adapter instantanément tout le reste de l'application (graphiques, plans d'action, registres) au domaine sélectionné :
1.  **Secourisme** : Couvre les dispositifs prévisionnels de secours (DPS), les gardes de réseau de secours (SDIS, SAMU) et l'activité opérationnelle de base.
2.  **Urgence** : Couvre les mobilisations de crise (Plans Orsec, Grand Froid, inondations, incendies, hébergements d'urgence sociale).
3.  **Formation** : Couvre les sessions d'apprentissage du Grand Public (PSC1, ePSC, IPSEN, GQS, recyclages).

### C. Le Sélecteur d'Année d'Analyse et Mode YTD
Le panneau d'analyse dispose de deux outils d'analyse temporelle cruciaux pour le dialogue d'activité :
*   **Sélecteur d'Année d'Exercice (2024, 2025, 2026)** : Actualise les diagrammes de répartition de l'activité.
*   **Interrupteur de Comparaison YTD (Year-to-Date)** : 
    *   *Actif* : Restreint l'analyse des années 2024 et 2025 uniquement aux données enregistrées **avant le 9 juin** de chaque année respective. Cela permet une comparaison rigoureuse à périmètre temporel égal avec l'année en cours (2026).
    *   *Inactif* : Affiche les années complètes consolidées à 100%.

### D. Le Plan d'Action Territorial (Objectifs Stratégiques)
Situé en milieu de page, ce module permet de suivre l'avancement concret des chantiers prioritaires du département (ex. : *Hébergement d'Urgence Départemental, Médicalisation des DPS, Recrutement de formateurs, etc.*).
*   **Sizing adaptatif** : Les cartes s'ajustent intelligemment (jusqu'à 4 par ligne) et se centrent automatiquement pour optimiser l'espace visuel disponible.
*   **Édition Interactive** : En tant que gestionnaire, vous pouvez cliquer sur "Modifier" sur chaque carte pour ajuster :
    *   Le titre de l'objectif stratégique.
    *   L'étape clé actuelle (parmi les phases du projet : *Départ, Courant, Cible*).
    *   Le pourcentage de progression globale (qui met à jour la jauge colorée).
    *   Le statut de réalisation (*En retard, Conforme, En avance, Finalisé*).

---

## 3. 📊 Registres & Analyses par Métier

Pour chacun des métiers, vous disposez d'un bouton **"Consulter le Registre Détaillé"** qui ouvre un panneau de gestion puissant et interactif permettant de visualiser les lignes de données extraites des fichiers importés.

### A. Registre des DPS (Secourisme)
Il répertorie toutes les manifestations couvertes dans les Yvelines, avec un calcul automatisé du dimensionnement :
*   Le système analyse les chaînes de caractères (ex. : *"1 équipe + 1 binôme"*) pour en déduire automatiquement l'effectif de secouristes engagés (ex. : 4 + 2 = 6 personnes).
*   Il calcule les indicateurs clés : soins effectués, traumatismes, malaises, évacuations, arrêts cardio-respiratoires (ACR).

### B. Registre des Gardes SDIS (Secourisme - Réseau)
Il récapitule les vacations de gardes effectuées par les bénévoles auprès des pompiers du Service Départemental d'Incendie et de Secours (SDIS 78) :
*   Chaque garde de 12h ou 24h génère automatiquement un volume d'heures bénévoles consolidées en appliquant un coefficient multiplicateur standard de **4 équipiers par garde**.

### C. Registre des Activités en Direct DT (Secourisme - DT Direct)
Liste les opérations de grande envergure gérées directement par l'échelon territorial des Yvelines :
*   Il suit les flux financiers (Tarif devis, repas, reversement aux Unités Locales associées, gain net conservé par la direction départementale pour investir dans le matériel de crise).

### D. Registre des Interventions d'Urgence (Urgence)
Répertorie l'historique des déclenchements d'urgence sociale ou de secours de crise (incendies, hébergements d'urgence, soutien aux sinistrés) sous l'égide de la préfecture ou du CO (Centre Opérationnel).

### E. Registre des Formations Grand Public (Formation)
Affiche la ventilation complète des formations dispensées dans les différentes Unités Locales (UL) des Yvelines, ventilée par type d'apprentissage (PSC1, ePSC, Gestes Qui Sauvent, IPSEN, Recyclages).

---

## 4. 🛠️ Architecture Technique & Spécifications

L'application est bâtie sur un socle technologique moderne garantissant légèreté, robustesse et une exécution immédiate sans serveur d'application lourd.

### Fiche Technique :
*   **Framework Principal** : React 18+ (en TypeScript strict) initié avec l'outil de build ultra-rapide **Vite**.
*   **Styling & Design** : Tailwind CSS. La mise en page utilise des classes utilitaires fluides et respecte un jeu de variables de thème Croix-Rouge (`bg-rc-red`, `bg-rc-light`, `text-rc-dark`).
*   **Moteur d'Animations** : Framer Motion (importé depuis `motion/react`) assurant des transitions fluides lors de l'ouverture des registres, le changement de métier opérationnel, et les modales d'importation.
*   **Visualisation Graphique** : Librairie **Recharts** (utilisant des composants réactifs SVG pour dessiner les diagrammes en barres, lignes et secteurs de manière accessible et fluide).
*   **Moteur de Parsing Documentaire** : Librairie **XLSX (SheetJS)**. Elle permet la lecture synchrone et asynchrone des formats binaires Excel (`.xlsx`, `.xls`) et textuels (`.csv`, `.txt`) directement dans le navigateur de l'utilisateur sous forme de tableaux structurés.
*   **Système de Persistance** : **LocalStorage**. Les modifications apportées aux objectifs stratégiques, l'effacement de la base, le choix de l'année d'analyse, l'état de l'interrupteur YTD et l'ensemble des registres importés sont conservés localement dans le navigateur. L'utilisateur peut ainsi fermer sa session et retrouver son tableau de bord intact au prochain démarrage.

---

## 5. 📥 Formats d'Importation Excel & CSV (Détaillés)

L'une des fonctionnalités phares de l'outil est son **Analyseur de structure et de colonnes de classeurs**. Vous pouvez importer vos propres fichiers de suivi. L'application dispose de modèles types téléchargeables pour chaque onglet d'import.

Voici les structures exactes attendues pour chaque type d'importation :

### 1️⃣ Import Consolidé Global (Module d'Analyseur de Structure)
Ce module universel permet de rafraîchir en une seule fois les données globales de l'historique annuel de l'ensemble des trois métiers.

*   **Extensions supportées** : `.xlsx`, `.xls`, `.csv`, `.txt`
*   **En-têtes de colonnes obligatoires (ou détectés par synonymes)** :
    *   **Métier** (détecte aussi : *service, pole, type, domaine*) : Doit contenir l'une des valeurs suivantes : `"Secourisme"`, `"Urgence"`, `"Formation"`.
    *   **Année** (détecte aussi : *an, year, date*) : Doit être une valeur entière : `2024`, `2025` ou `2026`.
    *   **Nombre d'Activités** (détecte aussi : *actions, volume, total, qte, nombre*) : Valeur entière positive.
    *   **Heures de Bénévolat** (détecte aussi : *heures, volunteer, hours*) : Valeur entière positive.

*   **Exemple de contenu type (CSV)** :
    ```csv
    Métier,Année,Nombre d'Activités,Heures de Bénévolat
    Secourisme,2024,420,24500
    Secourisme,2025,512,32600
    Secourisme,2026,505,31200
    Urgence,2025,64,5400
    Urgence,2026,90,8100
    Formation,2025,235,7900
    ```

---

### 2️⃣ Import Spécifique : Registre des DPS (Secourisme)
Permet d'importer la liste détaillée des Dispositifs Prévisionnels de Secours (DPS) réalisés dans le département.

*   **Extensions supportées** : `.xlsx`, `.xls`, `.csv`
*   **En-têtes de colonnes requis (sensibles à la casse et accentuation)** :
    *   `Prélèvement` : Montant prélevé ou reversé (numérique).
    *   `UL` : Unité Locale organisatrice (ex : *"Versailles"*, *"Saint-Germain"*).
    *   `Statut` : État du dispositif (*"Confirmé"*, *"Option"*, etc.).
    *   `Début` : Date et heure de début au format `AAAA-MM-JJ HH:MM` (ex : `2026-05-12 14:00`).
    *   `Fin` : Date et heure de fin au format `AAAA-MM-JJ HH:MM`.
    *   `Heures` : Durée cumulée (numérique).
    *   `Vac4h` : Validation de vacation (*"Oui"*, *"Non"*).
    *   `MANIFESTATION` : Nom de l'événement couvert.
    *   `Adresse complète` : Lieu de la manifestation.
    *   `RIS` : Indice de Risque calculé (ex : `0.25`).
    *   `Dimensionnement` : Structure des secours. Le système parse automatiquement cette chaîne pour calculer l'effectif :
        *   *"1 équipe"* ou *"equipe"* = 4 secouristes
        *   *"1 binôme"* ou *"binome"* = 2 secouristes
        *   *"1 PAPS"* = 2 secouristes
        *   Exemple : *"2 équipes et 1 binôme"* sera évalué à (2*4) + 2 = **10 secouristes**.
    *   `Tarif théorique` : Devis en € (numérique).
    *   `Valide DT` : Signature territoriale (*"Oui"*, *"Non"*).
    *   `Agrément` : Statut légal.
    *   `Evac ?` : Indicateur de transport sanitaire (*"OUI"*, *"NON"*).
    *   `Médicalisé ?` : Présence de médecin/infirmier (*"OUI"*, *"NON"*).
    *   `Nb Soins` : Volume de fiches de soins de l'événement (numérique).
    *   `Nb décharge` : Fiches de décharge (numérique).
    *   `Nb évac` : Nombre de victimes évacuées vers un centre hospitalier (numérique).
    *   `Nb petits soins` | `Nb trauma` | `Nb Malaise` | `Nb inconscient` | `Nb ACR` : Catégories médicales (numériques).

---

### 3️⃣ Import Spécifique : Gardes SDIS (Secourisme)
Sert à intégrer l'ensemble des participations bénévoles au réseau de secours public auprès des pompiers des Yvelines.

*   **Extensions supportées** : `.xlsx`, `.xls`, `.csv`
*   **En-têtes de colonnes requis** :
    *   `Date` (ou synonymes : *jour, debut, le*) : Date de la garde au format `AAAA-MM-JJ` (ex : `2026-01-03`).
    *   `Durée de garde` (ou synonymes : *duree, heure, garde, temps*) : Durée de la garde en heures (généralement `12` ou `24`).

*   *Règle métier embarquée* : Chaque garde valide importe automatiquement une équipe complète de **4 secouristes**. Le volume d'heures bénévoles injecté est égal à : `Durée de garde × 4`.

---

### 4️⃣ Import Spécifique : Activités Directes DT (Secourisme)
Intègre les actions d'envergure départementale gérées directement par la DTUS 78 sans passer par l'échelon des Unités Locales.

*   **Extensions supportées** : `.xlsx`, `.xls`, `.csv`
*   **En-têtes de colonnes requis** :
    *   `MANIFESTATION` : Nom de l'opération.
    *   `Date` : Date de l'événement (`AAAA-MM-JJ`).
    *   `Heures` : Durée d'action.
    *   `Nb secouristes` : Effectif engagé.
    *   `Tarif théorique` (ou *devis secours*) : Montant du devis global en €.
    *   `Devis CRSS` (ou *médicalisé*) : Si non vide, l'opération est marquée comme médicalisée.
    *   `Reversement UL` : Part reversée aux Unités Locales d'appui en €.
    *   `Repas` : Frais de repas des bénévoles en €.
    *   `CA Net` : Chiffre d'affaires net perçu (devis - reversement - repas).

---

### 5️⃣ Import Spécifique : Interventions d'Urgence (Urgence)
Importe le registre des déclenchements sur les sinistres de crise ou plans d'urgence sociale.

*   **Extensions supportées** : `.xlsx`, `.xls`, `.csv`
*   **En-têtes de colonnes requis** :
    *   `Date de début` : Début de l'intervention (`AAAA-MM-JJ HH:MM`).
    *   `Date de fin` : Clôture de l'intervention (`AAAA-MM-JJ HH:MM`).
    *   `Agrément mobilisé` : Type de mission d'Urgence et de Secours (ex: *"A - Mission de Secours Populaire"*, *"B - Soutien des Populations"*).
    *   `Contexte et description des actions menées` : Résumé de l'opération (ex : *"Plan Grand Froid : Établissement d'un centre d'hébergement d'urgence secondaire"*).
    *   `Raisons` : Cause du déclenchement préfectoral ou municipal.
    *   `Zone d'action` : Commune ou gymnase d'accueil (ex : *"Versailles - Gymnase Montbauron"*).
    *   `Appel CO` : Déclenchement via le Centre Opérationnel (*"Oui"*, *"Non"*).
    *   `Intégré BA` : Saisie ou intégration dans la base nationale (*"Oui"*, *"Non"*).
    *   `Nb prise en charge` : Nombre de personnes sinistrées ou sans-abri accueillies et prises en charge.
    *   `Moyens humains engagés` : Nombre d'équipiers d'urgence d'astreinte engagés.
    *   `Moyens matériel engagé` : Liste du matériel de catastrophe (lits, duvets, véhicules VCI).
    *   `Heures bénévolat` : Cumul des heures de présence des bénévoles engagés.

---

### 6️⃣ Import Spécifique : Formations Grand Public (Formation)
Permet de consolider l'activité de formation aux premiers secours dispensée par l'ensemble des Unités Locales (UL) du département.

*   **Extensions supportées** : `.xlsx`, `.xls`
*   **En-têtes de colonnes requis (Structure Matricielle Double Entête)** :
    *   Ligne 1 : Indique l'année dans la première cellule (ex : `2025`), puis le nom des formations sur 3 colonnes chacune (ex : `"ePSC - elearning et présentiel"`, `"PSC"`, `"IPSEN"`, `"GQS"`, `"recyclage PSC"`).
    *   Ligne 2 : Les colonnes par formation doivent s'appeler :
        *   `Structure` (Première colonne - liste les UL, ex : `"78 - Chevreuse"`, `"78 - Poissy"`)
        *   `Sessions` | `Stagiaires` | `Heures` pour chaque formation respective.

---

## 6. 💡 FAQ & Résolution des Problèmes

### ❓ "L'application affiche 'Structure non conforme' lors de mon import. Pourquoi ?"
*   **Solution** : Assurez-vous que vos en-têtes de colonnes (première ligne de votre fichier Excel) correspondent exactement aux intitulés listés ci-dessus. En cas de doute, ouvrez le panneau d'intégration, sélectionnez l'onglet correspondant et cliquez sur le bouton rouge **"Télécharger le modèle type"**. Vous obtiendrez un fichier pré-configuré avec la structure exacte attendue.

### ❓ "Que se passe-t-il si je clique sur 'Réinitialiser la base de données' ?"
*   **Solution** : Ce bouton efface toutes vos importations personnalisées enregistrées dans le stockage local (LocalStorage) et recharge le scénario initial de la DTUS 78. C'est idéal pour nettoyer des imports de test et recommencer sur une base saine. Vos fichiers d'origine sur votre ordinateur ne sont jamais affectés.

### ❓ "Puis-je exporter ou imprimer mon tableau de bord ?"
*   **Solution** : Oui. L'application intègre une mise en page CSS spécifique pour l'impression. Cliquez sur les boutons d'export ou utilisez le raccourci classique `Ctrl + P` (ou `Cmd + P` sur Mac). Les éléments d'interface inutiles (boutons d'imports, modales, outils d'administration) seront automatiquement masqués pour produire un rapport papier ou PDF extrêmement propre et professionnel, parfait pour vos réunions de Dialogue d'Activité.

---

*Documentation mise à jour en juillet 2026 pour la Direction Territoriale de l'Urgence et du Secourisme de la Croix-Rouge des Yvelines.*
