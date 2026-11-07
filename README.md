# ChronoLycee - Optimiseur d'Emplois du Temps Scolaires

Application web de génération et d'optimisation d'emplois du temps pour lycées (élèves et professeurs) développée avec React, Vite et Tailwind CSS. L'outil permet de modéliser un établissement sans limite supérieure sur le nombre d'élèves, d'allouer dynamiquement le nombre de professeurs par matière (avec un minimum strict de 1 professeur par discipline) et de compacter les emplois du temps dans une fenêtre horaire cible (par exemple 08h00 - 15h00).

## Fonctionnalités principales

- **Mise à l'échelle libre des effectifs** : Saisie sans plafond du nombre total d'élèves et calcul automatique du nombre de divisions (classes).
- **Gestion granulaire des enseignants** : Configuration du nombre de professeurs (minimum 1) et du volume horaire hebdomadaire par matière.
- **Dimensionnement automatique** : Calcul mathématique du nombre idéal d'enseignants requis pour faire tenir 100 % des cours dans la fenêtre horaire cible.
- **Fenêtre horaire et légèreté paramétrables** : Définition de l'heure idéale de début (ex. 08h00), de l'heure idéale de fin (ex. 15h00), de la charge quotidienne cible et de la pause méridienne.
- **Édition interactive** : Permutation manuelle de deux créneaux par simple clic avec vérification instantanée des conflits enseignants.
- **Exportation des données** : Export complet des emplois du temps générés aux formats CSV et JSON.

---

## Algorithme d'optimisation utilisé

Le problème de génération d'emplois du temps scolaires (*High-School Timetabling Problem*) est un problème d'optimisation combinatoire NP-difficile. Pour obtenir un calcul instantané dans le navigateur tout en garantissant des emplois du temps compacts et équilibrés, ChronoLycee utilise une approche hybride en trois phases :

### 1. Pré-allocation par équilibrage de charge (Round-Robin Load Balancing)

Lorsqu'une matière est enseignée à $C$ classes par $P$ professeurs, l'algorithme attribue les classes aux enseignants selon une distribution cyclique uniforme (*Round-Robin*). Cette étape évite qu'un unique professeur ne cumule trop de classes, ce qui saturerait ses créneaux entre 08h00 et 15h00 et forcerait mécaniquement certaines classes à avoir cours après 15h00.

De plus, l'outil intègre une formule de dimensionnement permettant de déterminer le nombre minimal de professeurs $P_{\text{idéal}}$ nécessaire pour qu'aucun cours ne déborde hors de la fenêtre cible :

$$P_{\text{idéal}} = \max\left(1, \left\lceil \frac{H_{\text{classe}} \times C}{\min(S_{\text{max}}, W_{\text{cible}})} \right\rceil\right)$$

Où :
- $H_{\text{classe}}$ est le volume horaire hebdomadaire de la matière pour une classe.
- $C$ est le nombre total de classes.
- $S_{\text{max}}$ est le service hebdomadaire maximal d'un enseignant.
- $W_{\text{cible}}$ est le nombre de créneaux disponibles par semaine à l'intérieur de la fenêtre cible (ex. de 08h00 à 15h00 hors pause déjeuner).

### 2. Heuristique constructive gloutonne multicritère (Most-Constrained-First Greedy Heuristic)

Les séances de cours à placer sont triées par ordre décroissant de difficulté : les professeurs ayant le volume horaire global le plus élevé voient leurs séances placées en priorité.

Pour chaque séance, le solveur filtre d'abord les créneaux respectant les **contraintes dures (Hard Constraints)** :
1. Aucune collision d'emploi du temps pour la classe.
2. Aucune collision d'emploi du temps pour le professeur.
3. Respect de la pause méridienne obligatoire (si activée).
4. Respect du plafond horaire quotidien maximal d'une classe.

Parmi tous les créneaux valides $(j, h)$ (jour $j$, heure $h$), l'algorithme sélectionne celui qui minimise une fonction de coût pondérée modélisant les **contraintes souples (Soft Constraints)** :

$$F(j, h) = P_{\text{tard}}(h) + P_{\text{tôt}}(h) + P_{\text{trous}}(j, h) + P_{\text{surcharge}}(j) + P_{\text{répétition}}(j)$$

- **Pénalité de fin tardive $P_{\text{tard}}(h)$** : Pénalité quadratique appliquée dès que l'heure $h$ dépasse l'heure de fin idéale $H_{\text{fin}}$. Plus un créneau est tardif (ex. 16h00 ou 17h00), plus son coût croît rapidement, forçant l'algorithme à saturer prioritairement la plage cible.
- **Pénalité de début matinal $P_{\text{tôt}}(h)$** : Pénalité quadratique si le cours est placé avant l'heure de début idéale $H_{\text{début}}$.
- **Pénalité de creux $P_{\text{trous}}(j, h)$** : Pénalise la création d'heures de permanence (trous) au sein d'une même journée pour les élèves.
- **Pénalité de surcharge quotidienne $P_{\text{surcharge}}(j)$** : Pénalité quadratique lorsque le nombre d'heures sur la journée $j$ dépasse le seuil de légèreté souhaité (ex. 5 heures par jour), ce qui lisse la charge de travail sur les 5 jours de la semaine.
- **Pénalité de répétition $P_{\text{répétition}}(j)$** : Évite de placer plus de deux heures d'une même matière dans la même journée et favorise les créneaux consécutifs si deux heures ont lieu le même jour.

### 3. Recherche locale par descente (Steepest-Descent Hill-Climbing)

Une fois la solution initiale construite, l'algorithme exécute plusieurs passes d'optimisation locale par échanges intra-classe (*2-opt swaps* et déplacements vers créneaux libres). 

Pour chaque cours placé en dehors de la fenêtre horaire cible ou générant un trou :
1. Le solveur inspecte tous les autres créneaux $(j_2, h_2)$ de la semaine pour la même classe.
2. Il vérifie que le déplacement ou la permutation entre $(j_1, h_1)$ et $(j_2, h_2)$ n'entraîne aucun conflit chez les professeurs concernés.
3. Si la permutation réduit le score de pénalité global de la classe, l'échange est validé immédiatement.

---

## Architecture du projet

```text
chrono-lycee/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── index.css
    ├── App.jsx
    ├── engine/
    │   ├── constants.js
    │   └── optimizer.js
    ├── utils/
    │   └── exporters.js
    └── components/
        ├── Header.jsx
        ├── SidebarConfig.jsx
        ├── TimetableGrid.jsx
        ├── TeacherView.jsx
        └── AnalyticsView.jsx