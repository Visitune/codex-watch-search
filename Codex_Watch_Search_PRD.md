# PRD --- Codex Official Texts Watch & Search

**Version:** 0.1\
**Date:** 3 September 2026\
**Statut:** Draft PRD\
**Périmètre:** Niveau A uniquement --- textes officiels du Codex
Alimentarius

------------------------------------------------------------------------

## 1. Résumé

### 1.1 Vision

Construire un service capable de :

1.  récupérer automatiquement le catalogue officiel des textes du Codex
    Alimentarius ;
2.  télécharger et historiser les versions disponibles des textes ;
3.  détecter automatiquement les nouveaux textes, révisions, retraits et
    changements de disponibilité ;
4.  comparer les versions pour identifier les changements de contenu ;
5.  produire une synthèse hebdomadaire des nouveautés et changements
    significatifs ;
6.  constituer un corpus documentaire permettant une recherche plein
    texte puis sémantique ;
7.  permettre à terme de poser des questions en langage naturel sur le
    corpus officiel avec références précises vers les textes et passages
    sources.

Le produit sera appelé provisoirement **Codex Watch & Search**.

### 1.2 Périmètre initial

Le produit porte exclusivement sur les **textes officiels publiés dans
le corpus Codex**, et non sur les documents de travail des comités,
agendas, CRD, working papers, propositions ou autres documents
préparatoires.

Le périmètre initial couvre les catégories exposées par le nouveau site
Codex :

-   Standards ;
-   Guidelines ;
-   Codes of Practice ;
-   Maximum Residue Limits (MRLs) ;
-   Miscellaneous.

Les bases de données numériques Codex consacrées aux pesticides,
médicaments vétérinaires et additifs seront considérées comme une
extension ultérieure. Elles ne sont pas nécessaires au MVP documentaire.

------------------------------------------------------------------------

# 2. Confirmation du changement de site Codex

## 2.1 Confirmation officielle

**Oui : il existe bien un nouveau site / une nouvelle version du site
Codex depuis le 28 août 2026.**

La page d'accueil officielle `codex.fao.org` affiche explicitement une
actualité datée du **28/08/2026** :

> "Welcome to the upgraded Codex Alimentarius website!"

La publication indique que le **site Codex Alimentarius modernisé a été
lancé dans les six langues officielles des Nations Unies**, avec de
nouvelles fonctionnalités, des fonctionnalités mises à jour et un accès
annoncé comme plus sécurisé et plus rapide.

Source officielle :

-   https://codex.fao.org/
-   https://codex.fao.org/home

La nouvelle application **Find a Codex text** est également accessible
sur ce nouveau domaine :

-   https://codex.fao.org/codex-texts/find-a-codex-text

## 2.2 Conséquence pour le projet

Le nouveau site doit être considéré comme la **source primaire à
investiguer** pour le collecteur.

Il ne faut cependant pas dépendre aveuglément de son implémentation
technique : l'application est dynamique et son API interne doit être
identifiée pendant la phase de développement.

Le projet doit donc prévoir :

1.  source primaire : nouvelle application Codex ;
2.  mécanisme de fallback : anciennes pages/canaux officiels FAO/Codex
    si nécessaire ;
3.  tests de non-régression après chaque évolution du site.

------------------------------------------------------------------------

# 3. Contexte et problème

Le Codex constitue un corpus international majeur de textes relatifs à
la sécurité des aliments, comprenant notamment des normes, lignes
directrices et codes de pratique.

Le site officiel permet de trouver les textes, mais la recherche
actuelle reste principalement orientée vers le **catalogue et ses
métadonnées**.

Le besoin métier est différent :

> Pouvoir surveiller automatiquement le corpus officiel et rechercher
> directement dans le contenu des textes.

Exemples de questions :

-   Quels nouveaux textes Codex ont été publiés cette semaine ?
-   Quels textes ont été révisés ?
-   Qu'est-ce qui a changé dans une nouvelle version ?
-   Quels textes Codex traitent des allergènes ?
-   Quels textes parlent de validation des mesures de maîtrise ?
-   Que dit le Codex sur la réutilisation de l'eau ?
-   Quels textes ont été modifiés en 2026 concernant l'étiquetage ?
-   Quels passages du Codex sont pertinents pour un sujet donné ?

Le produit doit répondre à ces questions sans remplacer la source
officielle.

------------------------------------------------------------------------

# 4. Sources officielles

## 4.1 Catalogue des textes

Source primaire :

**Codex --- Find a Codex text**

https://codex.fao.org/codex-texts/find-a-codex-text

La page indique actuellement cinq catégories sélectionnables :

-   standards ;
-   guidelines ;
-   codes of practice ;
-   maximum residue limits (MRLs) ;
-   miscellaneous.

Elle expose notamment :

-   Reference ;
-   Title ;
-   Committee ;
-   Last modified ;
-   langues disponibles EN / FR / ES / AR / ZH / RU.

## 4.2 Codex Texts --- FAO/WHO

Ancienne / complémentaire documentation officielle :

https://www.fao.org/fao-who-codexalimentarius/codex-texts/en/

Cette page décrit le rôle des textes Codex et distingue notamment les
textes généraux, les standards produits et les différents textes
apparentés.

## 4.3 Codex databases

https://codex.fao.org/codex-texts/codex-online-databases

Cette source décrit les bases numériques relatives notamment :

-   aux résidus de pesticides ;
-   aux résidus de médicaments vétérinaires ;
-   aux additifs alimentaires.

Ces bases sont **hors MVP documentaire**, mais leur existence doit être
prise en compte dans le modèle d'architecture.

------------------------------------------------------------------------

# 5. Types documentaires

Le modèle de données doit conserver explicitement le type Codex.

## 5.1 Standards

Identifiants généralement de type :

-   CXS ;
-   CXS...R pour certains standards régionaux.

Exemples :

-   CXS 1-1985 ;
-   CXS 192-1995 ;
-   CXS 193-1995 ;
-   CXS 362R-2025.

## 5.2 Guidelines

Identifiants de type :

-   CXG.

Exemples :

-   CXG 2-1985 ;
-   CXG 100-2023 ;
-   CXG 104-2024 ;
-   CXG 105-2024 ;
-   CXG 106-2025.

## 5.3 Codes of Practice

Identifiants de type :

-   CXC. 

Exemples :

-   CXC 1-1969 ;
-   CXC 82-2023 ;
-   CXC 83-2024.

## 5.4 Maximum Residue Limits

Identifiants de type :

-   CXM.

Les MRL doivent être traitées avec prudence car le Codex fournit
également des données numériques structurées associées.

Dans le MVP, les textes/documents CXM peuvent être historisés comme
documents, tandis que l'interrogation structurée des données MRL est
reportée.

## 5.5 Miscellaneous

Catégorie à conserver explicitement.

Il ne faut pas déduire automatiquement la catégorie uniquement à partir
du préfixe documentaire.

**Règle : le catalogue officiel est la source de vérité du type.**

------------------------------------------------------------------------

# 6. Objectifs produit

## O1 --- Couverture

Construire une copie structurée du catalogue officiel des textes Codex
inclus dans le périmètre.

## O2 --- Actualisation

Détecter automatiquement les nouveautés et modifications.

## O3 --- Historisation

Conserver les différentes versions récupérées.

## O4 --- Traçabilité

Chaque donnée doit être rattachée à une source officielle.

## O5 --- Diff documentaire

Identifier les sections et contenus modifiés entre deux versions.

## O6 --- Veille

Produire un bulletin hebdomadaire lisible.

## O7 --- Recherche

Permettre une recherche dans le contenu intégral des textes.

## O8 --- IA contrôlée

À terme, fournir des réponses en langage naturel fondées exclusivement
sur le corpus officiel sélectionné et accompagnées de références.

------------------------------------------------------------------------

# 7. Non-objectifs du MVP

Le MVP ne doit pas :

-   surveiller les working papers ;
-   surveiller les agendas de réunions ;
-   surveiller les CRD ;
-   surveiller les propositions de nouveaux travaux ;
-   reconstituer le processus d'élaboration avant adoption ;
-   intégrer immédiatement toutes les bases MRL structurées ;
-   remplacer le site Codex ;
-   produire une interprétation juridique des textes ;
-   présenter une recommandation comme une obligation réglementaire
    nationale ;
-   mélanger des versions historiques avec la version actuelle sans
    distinction explicite.

------------------------------------------------------------------------

# 8. Architecture fonctionnelle

``` text
                         CODEX OFFICIEL
                               |
                 +-------------+-------------+
                 |                           |
          Find a Codex text            Documents/PDF
                 |                           |
                 +-------------+-------------+
                               |
                         COLLECTOR
                               |
                    +----------+----------+
                    |                     |
                METADATA               FILES
                    |                     |
                    +----------+----------+
                               |
                         VERSIONING
                               |
                     +---------+---------+
                     |                   |
                 EXTRACTION             HASH
                     |                   |
                     +---------+---------+
                               |
                         DOCUMENT STORE
                               |
             +-----------------+-----------------+
             |                 |                 |
          SEARCH             DIFF             TOPICS
             |                 |                 |
       full text/vector    change detection   classification
             |                 |                 |
             +-----------------+-----------------+
                               |
                    +----------+----------+
                    |                     |
               CODEX SEARCH          CODEX WATCH
                    |                     |
                    +----------+----------+
                               |
                          USER / API
```

------------------------------------------------------------------------

# 9. Architecture technique cible

## 9.1 Collecte

Technologie recommandée :

-   Python ;
-   HTTP client ;
-   parsing HTML/JSON selon la source ;
-   téléchargement contrôlé des fichiers.

Le collecteur doit être découplé du site afin de pouvoir remplacer le
connecteur sans modifier la base documentaire.

## 9.2 Base

**PostgreSQL** comme base principale.

Extensions :

-   PostgreSQL Full Text Search ;
-   pgvector pour la recherche sémantique à partir d'une phase
    ultérieure.

Il n'est pas nécessaire d'introduire Elasticsearch, Pinecone, Weaviate
ou une autre base vectorielle spécialisée dans le MVP.

## 9.3 Stockage documentaire

Les PDF originaux doivent être conservés dans un stockage objet ou
filesystem dédié.

Chaque fichier doit être associé à :

-   URL source ;
-   date de téléchargement ;
-   taille ;
-   hash SHA-256 ;
-   langue ;
-   version ;
-   document parent.

------------------------------------------------------------------------

# 10. Modèle de données

## 10.1 `codex_document`

Représente l'identité logique du texte.

``` text
id
reference
document_type
title_original
title_en
title_fr
committee
regional_flag
official_status
first_adoption_year
current_modified_date
official_page_url
active
created_at
updated_at
```

## 10.2 `codex_document_version`

Représente une version d'un document dans une langue donnée.

``` text
id
document_id
language
version_date
source_url
sha256
file_size
downloaded_at
publication_date
supersedes_version_id
extraction_status
```

## 10.3 `codex_section`

``` text
id
version_id
page_start
page_end
section_number
section_title
parent_section_id
text
```

## 10.4 `codex_paragraph`

``` text
id
section_id
paragraph_number
text
page
```

## 10.5 `codex_table`

``` text
id
section_id
page
table_number
raw_text
structured_data
```

## 10.6 `codex_chunk`

Unité de recherche sémantique.

``` text
id
section_id
chunk_index
text
embedding
token_count
```

## 10.7 `codex_change`

``` text
id
document_id
old_version_id
new_version_id
section_id
change_type
importance
summary
created_at
```

Types de changement possibles :

-   ADDED ;
-   REMOVED ;
-   MODIFIED ;
-   MOVED ;
-   FORMAT_ONLY ;
-   TRANSLATION_ONLY.

## 10.8 `codex_collection_run`

Journal de collecte.

``` text
id
started_at
finished_at
source
status
documents_seen
documents_new
documents_modified
documents_removed
errors
```

------------------------------------------------------------------------

# 11. Identité documentaire

Le système doit distinguer :

### Identité logique

``` text
CXC 1-1969
```

### Version

``` text
CXC 1-1969 — version/date donnée
```

### Édition linguistique

``` text
CXC 1-1969 — EN
CXC 1-1969 — FR
CXC 1-1969 — ES
...
```

### Fichier physique

``` text
PDF téléchargé
SHA-256
```

Un même document peut donc avoir plusieurs versions et plusieurs
langues.

------------------------------------------------------------------------

# 12. Gestion des langues

Le nouveau site expose :

-   EN --- anglais ;
-   FR --- français ;
-   ES --- espagnol ;
-   AR --- arabe ;
-   ZH --- chinois ;
-   RU --- russe.

Le système doit enregistrer les langues disponibles au niveau de la
version/document.

Il ne faut pas supposer qu'une traduction existe toujours.

Une absence de PDF français ne doit pas être interprétée comme une
absence du texte.

------------------------------------------------------------------------

# 13. Détection des nouveautés

À chaque collecte :

``` text
catalogue actuel
       |
       v
clé documentaire
       |
       v
comparaison DB
       |
   +---+---+
   |       |
 nouveau  existant
   |       |
   v       v
 INSERT   vérifier date/hash
```

Un document est `NEW` lorsqu'il n'existe pas dans la base.

------------------------------------------------------------------------

# 14. Détection des modifications

La détection doit utiliser plusieurs niveaux.

## Niveau 1 --- métadonnées

Comparer :

-   Last modified ;
-   titre ;
-   comité ;
-   langues ;
-   URL.

## Niveau 2 --- fichier

Télécharger le PDF si nécessaire et calculer :

``` text
SHA-256
```

Si le hash est identique, le contenu physique est identique.

## Niveau 3 --- contenu

Si le hash change :

1.  extraire le texte ;
2.  identifier les pages ;
3.  identifier les sections ;
4.  comparer les versions ;
5.  détecter les ajouts/suppressions/modifications.

## Niveau 4 --- analyse IA

Le LLM intervient seulement après le diff déterministe pour :

-   résumer ;
-   classifier ;
-   expliquer ;
-   évaluer la portée documentaire.

------------------------------------------------------------------------

# 15. Diff documentaire

Le résultat attendu n'est pas simplement :

> PDF différent.

Il doit être :

``` text
CXC 1-1969

Section 2 — unchanged

Section 3 — unchanged

Section 4 — MODIFIED
    paragraph 4.2 changed

Section 5 — NEW
    new subsection 5.3

Annex I — MODIFIED
```

Puis un résumé :

``` text
Section 5.3
Nouveau contenu relatif à ...
```

La formulation doit toujours distinguer :

-   changement observé ;
-   interprétation automatique ;
-   impact potentiel.

------------------------------------------------------------------------

# 16. Importance du changement

Classification initiale :

### Faible

-   correction typographique ;
-   mise en forme ;
-   changement éditorial sans modification substantielle.

### Moyenne

-   clarification ;
-   ajout d'une précision ;
-   modification d'une recommandation secondaire.

### Élevée

-   nouvelle exigence/recommandation substantielle ;
-   nouvelle limite ;
-   modification d'un critère ;
-   changement important de méthode ;
-   modification significative d'une disposition
    d'étiquetage/hygiène/etc.

La classification est une **aide à la veille**, pas une qualification
juridique.

------------------------------------------------------------------------

# 17. Recherche

## Phase MVP

Recherche :

-   référence ;
-   titre ;
-   comité ;
-   type ;
-   date ;
-   texte intégral.

Exemples :

``` text
CXC 1-1969
allergen
Listeria
water reuse
HACCP
labelling
```

## Phase suivante

Recherche hybride :

``` text
BM25 / Full Text
        +
Vector Search
        +
Reranking
```

La recherche exacte reste indispensable pour les références normatives.

------------------------------------------------------------------------

# 18. Recherche sémantique

Le corpus doit être découpé en chunks liés à leur contexte :

``` text
document
  -> version
     -> section
        -> subsection
           -> paragraph
```

Chaque chunk conserve son identité source.

Exemple :

``` text
document = CXC 1-1969
version = 2026
language = EN
section = 9.3
page = 24
chunk = ...
```

Cela permet de citer la source avec précision.

------------------------------------------------------------------------

# 19. Ask Codex

Fonction cible :

> Question utilisateur\
> ↓\
> classification\
> ↓\
> recherche hybride\
> ↓\
> sélection des passages\
> ↓\
> génération de réponse\
> ↓\
> références sources

Exemple :

> Quels textes Codex traitent de la maîtrise des allergènes ?

La réponse doit retourner :

-   les textes pertinents ;
-   le niveau de pertinence ;
-   les sections ;
-   les extraits/paraphrases ;
-   les références ;
-   les liens officiels.

Le système doit refuser ou signaler clairement lorsqu'il ne trouve pas
de support suffisant dans le corpus.

------------------------------------------------------------------------

# 20. Principe de citation

Chaque réponse générée doit permettre de remonter à :

``` text
Document
  -> Version
     -> Langue
        -> Section
           -> Page
              -> URL officielle
```

Aucune affirmation substantielle ne doit être produite sans possibilité
de traçabilité vers le corpus.

------------------------------------------------------------------------

# 21. Bulletin hebdomadaire --- Codex Watch

Le bulletin doit être généré une fois par semaine.

Exemple :

``` text
CODEX WATCH
Semaine du XX au XX

Nouveaux textes : 4
Textes révisés : 7
Textes retirés : 1
Nouvelles traductions : 12

1. NOUVEAUX TEXTES

CXS xxx-2026
Titre
Type
Comité

Résumé
Impact potentiel

2. TEXTES RÉVISÉS

CXC xxx-xxxx
Sections modifiées
Résumé du changement

3. POINTS À SURVEILLER

...
```

Le bulletin doit distinguer clairement :

-   nouveau texte ;
-   texte révisé ;
-   nouvelle traduction ;
-   modification éditoriale ;
-   retrait.

------------------------------------------------------------------------

# 22. Fréquence de collecte

### Collecte

**Quotidienne recommandée**

La vérification du catalogue est légère.

### Bulletin

**Hebdomadaire**

Cela permet de regrouper les changements et d'éviter un flux trop
fréquent.

### Pourquoi ?

Le système ne doit pas attendre une semaine pour détecter une
modification.

Architecture :

``` text
Tous les jours
    |
    v
catalogue -> comparaison -> DB

Chaque semaine
    |
    v
changements -> analyse -> bulletin
```

------------------------------------------------------------------------

# 23. Journal d'audit

Chaque opération doit être enregistrée.

Exemple :

``` text
2026-09-03 06:00
source = codex
reference = CXC 1-1969
action = CHECK
last_modified = ...
sha256 = ...
result = UNCHANGED
```

ou :

``` text
2026-09-03 06:00
reference = CXS xxx-2026
action = NEW
sha256 = ...
source_url = ...
```

Le journal doit permettre de reconstruire pourquoi un changement a été
détecté.

------------------------------------------------------------------------

# 24. Robustesse du collecteur

Le nouveau site étant très récent, le connecteur doit être conçu pour
résister aux changements d'interface.

Architecture :

``` text
CodexSource
    |
    +-- NewCodexWebConnector
    |
    +-- LegacyCodexConnector
    |
    +-- DirectDocumentConnector
```

Chaque connecteur doit retourner un modèle normalisé :

``` python
CodexDocumentMetadata
```

Le reste du pipeline ne doit pas connaître la structure du site source.

------------------------------------------------------------------------

# 25. Découverte technique du nouveau site

Une phase de reverse engineering contrôlée est nécessaire.

Objectifs :

1.  identifier les scripts JavaScript ;
2.  identifier les requêtes XHR/fetch ;
3.  identifier l'endpoint JSON ;
4.  identifier les paramètres de recherche ;
5.  identifier la pagination ;
6.  identifier les identifiants internes ;
7.  identifier les URLs PDF ;
8.  identifier la gestion des langues ;
9.  identifier le comportement de `Last modified` ;
10. vérifier si un endpoint permet de récupérer l'ensemble du catalogue.

### Règle

Ne pas coder un scraper fragile avant d'avoir vérifié l'API ou les
données réellement utilisées par l'application.

------------------------------------------------------------------------

# 26. Snapshot initial

Avant d'activer la veille, le système doit effectuer un **full crawl
initial**.

Sorties :

``` text
codex_documents
codex_versions
codex_collection_run
```

Rapport :

``` text
Standards        : N
Guidelines       : N
Codes of Practice: N
MRLs             : N
Miscellaneous    : N
--------------------
Total            : N
```

Les valeurs `N` seront déterminées par le snapshot réel et non par une
estimation.

------------------------------------------------------------------------

# 27. Téléchargement

Pour chaque document :

1.  récupérer les URLs disponibles ;
2.  télécharger les langues disponibles ;
3.  calculer SHA-256 ;
4.  stocker le fichier ;
5.  enregistrer les métadonnées ;
6.  vérifier que le fichier est exploitable ;
7.  journaliser les erreurs.

Gestion des erreurs :

-   HTTP 404 ;
-   HTTP 403 ;
-   timeout ;
-   PDF invalide ;
-   PDF vide ;
-   document scanné ;
-   erreur d'extraction ;
-   changement d'URL.

------------------------------------------------------------------------

# 28. Extraction PDF

L'extraction doit conserver :

-   texte ;
-   page ;
-   titres ;
-   sections ;
-   sous-sections ;
-   tableaux ;
-   notes ;
-   annexes.

Un simple `PDF -> texte plat` est insuffisant pour le corpus Codex.

Les tableaux doivent être conservés séparément lorsque possible.

------------------------------------------------------------------------

# 29. Qualité de l'extraction

Chaque version reçoit un statut :

``` text
OK
PARTIAL
FAILED
OCR_REQUIRED
TABLE_EXTRACTION_WARNING
```

Le système ne doit pas indexer silencieusement un document mal extrait
comme s'il était complet.

------------------------------------------------------------------------

# 30. Sécurité et gouvernance

Le système doit conserver la provenance.

Pour chaque donnée :

``` text
source = Codex
source_url = ...
retrieved_at = ...
hash = ...
```

Le contenu officiel ne doit pas être modifié.

Les résumés et classifications générés par IA doivent être stockés
séparément du contenu source.

------------------------------------------------------------------------

# 31. Architecture des services

MVP :

``` text
codex-collector
codex-document-processor
codex-database
codex-search
codex-watch
web-ui
```

Pour un premier prototype, ces composants peuvent toutefois être
regroupés dans une seule application Python afin de limiter la
complexité.

------------------------------------------------------------------------

# 32. Stack recommandée

### Backend

Python 3.x

### API

FastAPI

### Database

PostgreSQL

### Vector

pgvector

### PDF

Bibliothèque d'extraction adaptée aux PDF + moteur OCR en fallback.

### Recherche

PostgreSQL FTS + pgvector.

### LLM

API LLM configurable.

Le produit ne doit pas être couplé structurellement à un fournisseur
unique.

### Frontend

Pour le MVP :

-   interface web légère ;
-   éventuellement React/Next.js si une interface plus complète est
    nécessaire.

------------------------------------------------------------------------

# 33. API interne

Endpoints cibles :

``` text
GET /documents
GET /documents/{id}
GET /documents/{id}/versions
GET /documents/{id}/changes
GET /documents/{id}/content

GET /search?q=...
GET /search?type=CXC
GET /search?committee=CCFH

GET /watch/latest
GET /watch/{date}

POST /ask
```

------------------------------------------------------------------------

# 34. Critères d'acceptation MVP

## Catalogue

-   [ ] Les cinq catégories du catalogue sont représentées.
-   [ ] Chaque document possède une référence unique.
-   [ ] Les métadonnées officielles sont conservées.
-   [ ] Les langues disponibles sont identifiées.
-   [ ] Les URLs officielles sont conservées.

## Documents

-   [ ] Les PDF disponibles peuvent être téléchargés.
-   [ ] Chaque fichier possède un SHA-256.
-   [ ] Les versions sont historisées.
-   [ ] Les erreurs de téléchargement sont journalisées.

## Veille

-   [ ] Un nouveau document est détecté.
-   [ ] Une modification est détectée.
-   [ ] Un retrait est détecté lorsque le catalogue le permet.
-   [ ] Les nouvelles traductions sont détectées.

## Diff

-   [ ] Le système distingue fichier différent et contenu différent.
-   [ ] Les sections modifiées sont identifiées lorsque possible.
-   [ ] Un résumé peut être généré.

## Recherche

-   [ ] Recherche par référence.
-   [ ] Recherche par titre.
-   [ ] Recherche par type.
-   [ ] Recherche par comité.
-   [ ] Recherche plein texte.

------------------------------------------------------------------------

# 35. Métriques

## Collecte

-   taux de réussite du crawl ;
-   nombre de documents vus ;
-   nombre de documents nouveaux ;
-   nombre de documents modifiés ;
-   nombre d'erreurs ;
-   temps moyen de collecte.

## Documents

-   taux de téléchargement réussi ;
-   taux d'extraction réussie ;
-   taux d'extraction partielle ;
-   couverture linguistique.

## Recherche

-   précision des résultats ;
-   taux de réponses sans source ;
-   taux de réponses correctement sourcées.

## Veille

-   délai entre publication officielle et détection ;
-   faux positifs ;
-   faux négatifs ;
-   qualité des résumés.

------------------------------------------------------------------------

# 36. Performance cible

Pour un corpus de quelques centaines à quelques milliers de documents et
leurs versions :

-   crawl catalogue : quelques minutes maximum ;
-   recherche simple : \< 1 seconde cible ;
-   recherche hybride : \< quelques secondes ;
-   consultation document : \< 2 secondes hors téléchargement ;
-   génération Ask Codex : dépendante du LLM.

Les objectifs seront ajustés après le snapshot réel.

------------------------------------------------------------------------

# 37. Plan de développement

## Phase 0 --- Discovery

-   analyser le nouveau site ;
-   identifier l'API ou les mécanismes de données ;
-   identifier les URLs PDF ;
-   comprendre la pagination ;
-   documenter le comportement du catalogue.

**Livrable :** spécification du connecteur Codex.

## Phase 1 --- Catalogue

-   collecteur ;
-   normalisation ;
-   PostgreSQL ;
-   snapshot initial.

**Livrable :** `codex_documents`.

## Phase 2 --- Documents

-   téléchargement ;
-   hash ;
-   stockage ;
-   extraction ;
-   versions.

**Livrable :** corpus local versionné.

## Phase 3 --- Veille

-   comparaison ;
-   détection ;
-   journal ;
-   bulletin.

**Livrable :** Codex Watch.

## Phase 4 --- Recherche

-   FTS ;
-   recherche par métadonnées ;
-   UI.

**Livrable :** Codex Search.

## Phase 5 --- Sémantique / IA

-   embeddings ;
-   recherche hybride ;
-   reranking ;
-   Ask Codex ;
-   citations.

**Livrable :** Codex Knowledge Engine.

------------------------------------------------------------------------

# 38. Risques

## R1 --- Le nouveau site change son API

**Mitigation :**

Connecteur isolé + tests automatiques + fallback.

## R2 --- URL PDF instable

**Mitigation :**

Conserver les fichiers et leur hash dès leur collecte.

## R3 --- Date de modification peu fiable

**Mitigation :**

SHA-256 + comparaison de contenu.

## R4 --- PDF mal structuré

**Mitigation :**

Extraction multi-moteur + OCR fallback + statut de qualité.

## R5 --- Traductions disponibles à des dates différentes

**Mitigation :**

Versionnement par langue.

## R6 --- Hallucination IA

**Mitigation :**

RAG strict, citations obligatoires, seuil de confiance et refus lorsque
les sources sont insuffisantes.

## R7 --- Confusion version actuelle / historique

**Mitigation :**

Modèle `document -> version -> langue -> fichier`.

------------------------------------------------------------------------

# 39. Principe fondamental du produit

Le système doit toujours distinguer :

``` text
SOURCE OFFICIELLE
       |
       +-- contenu original
       |
       +-- métadonnées
       |
       +-- historique
       |
       +-- liens

       VS

ANALYSE AUTOMATIQUE
       |
       +-- classification
       +-- résumé
       +-- tags
       +-- importance
       +-- réponse IA
```

L'IA n'est jamais la source.

------------------------------------------------------------------------

# 40. Évolution future hors périmètre actuel

Après validation du MVP :

### V2

-   bases MRL ;
-   GSFA ;
-   données structurées ;
-   questions quantitatives.

### V3

-   documents de comités ;
-   travaux en cours ;
-   suivi des étapes d'élaboration ;
-   veille prospective.

### V4

-   croisement avec réglementation UE ;
-   croisement avec réglementation française ;
-   mapping Codex ↔ réglementation ;
-   impact métier par secteur.

Ces extensions doivent rester séparées du corpus officiel initial.

------------------------------------------------------------------------

# 41. Références officielles

-   Codex Alimentarius --- nouveau site : https://codex.fao.org/
-   Find a Codex text :
    https://codex.fao.org/codex-texts/find-a-codex-text
-   Codex Texts --- FAO/WHO :
    https://www.fao.org/fao-who-codexalimentarius/codex-texts/en/
-   Codex databases :
    https://codex.fao.org/codex-texts/codex-online-databases
-   Codex Scorecard : https://codex.fao.org/resources/codex-scorecard

------------------------------------------------------------------------

# 42. Décision proposée

**Décision : lancer le MVP sur les textes officiels uniquement.**

Ordre de priorité :

1.  **CXS --- Standards**
2.  **CXG --- Guidelines**
3.  **CXC --- Codes of Practice**
4.  **CXM --- Maximum Residue Limits comme corpus documentaire**
5.  **Miscellaneous**

Le premier objectif technique est de produire un **snapshot complet et
vérifiable du catalogue actuel**, puis de construire le pipeline de
téléchargement/versionnement avant d'ajouter l'IA.
