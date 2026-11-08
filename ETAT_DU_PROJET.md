# État du projet — éditeur Blockly micro:bit V2

Dossier de travail d'origine : `C:\Users\jreyn\OneDrive\Bureau\blockly_ts` (V2.0C)
Dossier de travail actuel (variante V2.0E sans séance ni robots) : `C:\Users\jreyn\OneDrive\Documents\claude\easybloc_ts_microbit`
Copiée de : `C:\Users\jreyn\OneDrive\Documents\claude\easybloc_ts_adacraft_minimal` (oct. 2026), en retirant le mode séance (`seances.js`, menu Fichier > Séance) et les robots (catégorie Robots : Maqueen Plus, Maqueen Lite, Kitrobot v2, LiDAR ; panneau Piste ; télécommande infrarouge simulée). Les lignes du tableau et les points à vérifier qui les concernaient sont retirés.
Vérifié après le retrait (navigateur intégré, oct. 2026) : aucune erreur JavaScript au chargement ; colonne de catégories sans « Robots », menu Fichier sans « Séance » ; simulation d'un « afficher l'icône » dans « Répéter indéfiniment » (matrice allumée) ; exercices, évaluation et rapport sans bouton « Rendre mon travail ». Pas vérifié : l'exe PyInstaller, le site hébergé, une vraie carte.
Lancement : double-clic sur `lancer_projet.bat`, puis <http://localhost:8000> — ou l'exe `dist\MicrobitEasybloc_V2.0E.exe`
Hébergement : dossier `site_web` (site statique, voir `PROMPT_RECREATION.md` §26)
Fichiers ajoutés depuis la V2.0C : `bandeau.js`, `montage.js`, `exercices.js`, `exercices.json`, `ia-immediat.js`, `ia-son-immediat.js`, `lib/mediapipe`, `lib/zxing`, `site_web/` (voir la section « Évolutions de la copie »)

Mise à jour du 08/11/2026 : reprise de tous les travaux faits depuis le 03/11 dans TS_Easybloc (`Easybloc_ts_adacraft_minimal`, commits 3a270ed à 526b3db) par une fusion à trois voies : alignement sur EasyBloc R4 (bandeau, catégories, fenêtres, couleurs), anglais (`langue.js`, `langue-en.js`, `lib/blockly/msg/en.js`), fiches d'aide (`aide/`, `aide/en/`, générateur `outils/fiches/`), visites guidées réécrites, dessins détaillés des modules Grove et Hub I2C (`modules-dessins.js`), icônes au trait (`icones.js`), police Inter (`lib/polices`). Retirés de nouveau : tout ce qui touche aux séances et aux robots (y compris les 63 fiches d'aide des blocs robots, dans chaque langue). Conservé de la variante : « Exercices pas à pas » dans le menu Fichier, sans mode évaluation. Vérifié dans le navigateur (FR et EN) : aucune erreur JavaScript, catégories sans Robots, simulation, montage avec Hub I2C, fiche d'aide, visites guidées. Pas vérifié : l'exe, le site hébergé (avant envoi), une vraie carte.

Ce fichier dit **où on en est** : ce qui a été vérifié, ce qui ne peut l'être
sans matériel, et ce qui a été écarté. Les deux autres documents complètent :

- `readme.txt` — mode d'emploi et pièges d'usage
- `PROMPT_RECREATION.md` — tout reconstruire de zéro, avec les 80 pièges connus (nº 0 à nº 79) ; §22 à §27 pour les évolutions de la copie

---

## Vérifié dans le navigateur

La vérification se fait en pilotant l'application depuis la console, jamais en
se fiant à l'absence d'erreur.

| Domaine | Ce qui a été contrôlé |
| --- | --- |
| Génération du `.hex` | fichier relu avec une instance `MicropythonFsHex` indépendante : `main.py` identique au code source, hex universel V1+V2 |
| Firmware non vierge | la zone du système de fichiers est effacée puis réécrite ; testé avec un firmware contenant déjà un programme |
| Firmware tronqué ou en cache | refusé avec le nombre d'octets reçus ; lecture en `cache: no-store` |
| Imports MicroPython | **0 bloc sur 49** oublie `from microbit import *` (28 en défaut au départ) |
| Blocs « lorsque … » | indentation cohérente, scrutation injectée dans **toutes** les boucles, les 16 gestionnaires câblés |
| Blocs orphelins affichés désactivés | Demande explicite de l'utilisateur : « quand un bloc de programmation est déposé... et qu'il n'est pas accroché à un autre bloc, il [doit être] affiché comme désactivé ». Un bloc posé seul (ou détaché d'une pile) était auparavant rendu normalement (pleine couleur) alors qu'il ne faisait déjà rien la plupart du temps — et pire, un bloc d'instruction orphelin **était bien inclus** dans `Blockly.Python.workspaceToCode()` (chaque bloc de haut niveau génère son propre code, orphelin ou pas), donc s'exécutait une fois au tout début du programme, en dehors de toute structure visible, un comportement surprenant. Détection par la structure plutôt qu'une liste de noms : un bloc est un conteneur légitime (`au_demarrage`, tous les `lorsque_...`, `radio_quand_recu`) s'il n'a **ni** `previousConnection` **ni** `outputConnection` — ils ne peuvent structurellement pas être accrochés à autre chose. Seule exception, non déductible de la structure : `boucle_infinie` a les deux connecteurs (il peut en théorie être chaîné) mais reste fonctionnel seul, donc exclu à la main. `bloc.getRootBlock()` remonte jusqu'à l'ancêtre commun quel que soit le type d'emboîtement (pile, entrée d'instruction, entrée de valeur) : un seul passage sur `getAllBlocks()`, pas besoin de cas particulier pour un bloc qui devient correctement accroché (redevient actif tout seul au passage suivant). `setEnabled()` (API Blockly standard) fait à la fois le rendu grisé/hachuré et l'exclusion de la génération de code. Vérifié : bloc posé seul → désactivé et absent du code généré ; reconnecté sous « Au démarrage » → réactivé et son code réapparaît ; bloc de valeur (nombre) posé seul → désactivé aussi ; les deux blocs de démarrage par défaut (`au_demarrage`, `boucle_infinie`) jamais désactivés. — Bug signalé par l'utilisateur (capture d'écran du menu contextuel) : « la fonction "Activer le bloc" n'a pas l'air de fonctionner ». Cause : `mettreAJourBlocsOrphelins()` forçait `setEnabled(actif)` à CHAQUE passage (donc à chaque changement de l'espace de travail), y compris juste après que l'utilisateur ait cliqué « Activer le bloc » dans le menu contextuel natif de Blockly — ce clic déclenche lui-même un changement, aussitôt écrasé au passage suivant, silencieusement. Pire : ça cassait aussi « Désactiver le bloc » pour un bloc correctement accroché (réactivé de force au même titre), une fonctionnalité Blockly native complètement indépendante des blocs orphelins. Corrigé en ne réagissant qu'aux TRANSITIONS structurelles (orphelin ↔ rattaché), mémorisées par bloc (`bloc.legitimeOrphelin_`) : `setEnabled()` n'est appelé que si l'état structurel vient de changer depuis le dernier passage ; entre deux transitions, l'état choisi par l'utilisateur via le menu contextuel reste intact. Vérifié dans le navigateur avec de vrais clics de menu contextuel (coordonnées calculées depuis `getBoundingClientRect()` des éléments `.blocklyMenuItem`, pas de simple appel programmatique à `setEnabled()` qui ne déclenche pas forcément le même évènement) : bloc orphelin + « Activer le bloc » → reste activé après un délai (contre désactivé à nouveau avant ce correctif) ; bloc correctement accroché + « Désactiver le bloc » → reste désactivé, absent du code généré ; non-régression du comportement d'origine confirmée (détacher un bloc accroché → désactivé automatiquement, le rattacher → réactivé automatiquement, sans intervention manuelle) |
| « Au démarrage » emboîtable avec « Répéter indéfiniment » | Demande de l'utilisateur, avec une image de référence : une encoche du bas sur « Au démarrage », comme dans MakeCode, pour l'accrocher physiquement à « Répéter indéfiniment » plutôt que les laisser simplement juxtaposés. Ajouté `setNextStatement(true, null)` sur `au_demarrage` (toujours **pas** de `previousStatement` : il doit rester le bloc le plus haut, rien ne s'accroche au-dessus). Espace de travail par défaut mis à jour pour les emboîter d'office (`next: { block: { type: 'boucle_infinie' } }` dans le JSON de sérialisation Blockly, à la place de deux blocs juste positionnés l'un sous l'autre). Aucun changement de génération de code : l'ordre des blocs de premier niveau suivait déjà la position verticale, l'emboîtement le garantit physiquement mais ne le crée pas. Vérifié : les deux blocs par défaut sont bien parent/enfant (`getParent()`) dès le chargement, code généré identique avant/après, détachement puis rattachement testés (`unplug()`/`connect()`), le registre des blocs orphelins (entrée précédente) n'est pas perturbé par le nouveau connecteur (`au_demarrage` n'a toujours pas de `previousConnection`, donc reste détecté comme conteneur légitime) |
| Menu « Fichier » regroupant les téléchargements | Demande de l'utilisateur, avec une image de référence : les deux boutons « Télécharger le fichier .hex » et « Télécharger le script .py », auparavant toujours visibles côte à côte dans la barre d'outils, sont désormais dans un menu déroulant « 📁 Fichier ▾ ». Les deux boutons gardent leurs `id` (`download-btn`, `download-py-btn`) et leurs écouteurs existants inchangés — seul le balisage autour a changé, aucune modification des gestionnaires de clic eux-mêmes. Ouverture/fermeture au clic sur le bouton, fermeture automatique au clic ailleurs dans la page ou après avoir choisi un des deux téléchargements (comme un menu déroulant classique). Vérifié dans le navigateur : ouverture affiche les deux boutons, clic à l'extérieur referme, clic sur « .py » déclenche bien le téléchargement (`zoneEtat` confirme « Script .py téléchargé. ») et referme le menu au passage |
| Import d'un fichier .hex ou .py | Demande de l'utilisateur, dans le prolongement du menu « Fichier ». Un fichier importé bascule directement en **édition manuelle** (Blockly ne sait pas transformer du Python en blocs, voir la section dédiée) — même mécanisme que si l'utilisateur tapait le code lui-même, juste pré-rempli. Le cas `.py` est trivial (texte lu tel quel). Le cas `.hex` est plus subtil : un `.hex` n'est pas le programme, c'est un firmware complet encodé en Intel hex avec le programme écrit dans sa zone système de fichiers — `extraireCodeDepuisHex()` (nouvelle fonction dans `deux.js`, symétrique de `genererFichierHexFinal`) reconstruit la même base propre (notre `firmware.hex`, nettoyé si besoin) puis y importe le fichier fourni (`MicropythonFsHex.importFilesFromHex()`, la même bibliothèque `microbit-fs` que l'écriture) pour en relire `main.py`. Vérifié par un aller-retour complet en conditions réelles dans le navigateur : générer un `.hex` avec `genererFichierHexFinal()`, l'importer aussitôt via `<input type="file">` (simulé par `DataTransfer`, un vrai clic ne se scripte pas), et confirmer que le texte relu est identique à l'original — testé aussi bien en partant de blocs que d'un script `.py`. Erreur réutilisée avec un fichier invalide : le message d'origine (`verifierFirmwareComplet`) parlait à tort de « firmware.hex » et du cache serveur même pour un fichier importé par l'utilisateur — paramétré (`nomFichier`) pour donner le bon message selon le cas, bug trouvé en testant volontairement un fichier invalide, pas deviné à l'avance |
| Thème clair / sombre | Demande de l'utilisateur. Grandes surfaces (barre d'outils, panneaux latéraux, panneau de code, menu « Fichier », panneau administrateur, champs de saisie sur fond sombre) passées à des variables CSS (`--fond-chrome`, `--fond-saisie`, `--texte-chrome`, `--bordure-chrome`, `--fond-code`, `--texte-code`…), deux jeux de valeurs (`:root` = sombre, l'état d'origine du projet ; `:root[data-theme="light"]` = nouveau). Volontairement **pas** touché : les couleurs « d'appareil » (sprites de robots, carte micro:bit, DEL, bézel du joystick, étiquette de fanion départ/arrivée) qui représentent quelque chose de réel, et les couleurs d'accent des boutons/catégories — comme le reste de l'interface, ni l'un ni l'autre ne change avec le thème de l'appli. Blockly n'a pas de thème sombre livré (seuls `Classic` et `Zelos` existent, vérifié par `Object.keys(Blockly.Themes)`) : un thème personnalisé (`Blockly.Theme.defineTheme`, `componentStyles.workspaceBackgroundColour`/`toolboxBackgroundColour`/`flyoutBackgroundColour`…) couvre l'espace de travail, la boîte à outils et le tiroir, appliqué via `workspace.setTheme()`. Bouton 🌙/☀️ dans la barre d'outils, choix persisté (`localStorage.themeApp`), appliqué par un petit `<script>` en tête de `<head>` (avant le `<style>` principal) pour éviter un flash du thème par défaut au chargement. Vérifié dans le navigateur, thème clair : boîte à outils et tiroir clairs et lisibles, panneau de code blanc à texte sombre, panneau Maqueen Plus (sélecteur de piste, curseurs, télécommande IR) entièrement lisible, panneau administrateur (catégories, onglet Aide avec le contenu de `readme.txt`) entièrement lisible — et non-régression du thème sombre après bascule aller-retour, persistance confirmée après rechargement de page |
| Contraste normal / élevé | Demande de l'utilisateur, orthogonale au thème clair/sombre (les deux se combinent librement : 4 états possibles). Mêmes variables CSS poussées vers le noir/blanc pur plutôt que des teintes intermédiaires (`:root[data-contrast="high"]`, `:root[data-theme="light"][data-contrast="high"]`), avec des bordures épaissies (2px) ajoutées aux grandes surfaces pour qu'elles restent visibles une fois les nuances aplaties. Trois thèmes Blockly personnalisés au lieu d'un seul (`sombreMicrobitV2`, `sombreEleveMicrobitV2`, `clairEleveMicrobitV2` — « clair normal » reste `Blockly.Themes.Classic`, fourni tel quel), choisis en croisant les deux réglages. Bouton ◐ à côté du bouton de thème, même mécanisme de persistance (`localStorage.contrasteApp`) et d'application avant le premier rendu. Vérifié dans le navigateur les 4 combinaisons : sombre+élevé (fond noir pur, texte blanc, boîte à outils/tiroir noirs), clair+élevé (fond blanc pur, texte noir, boîte à outils/tiroir blancs), non-régression de sombre+normal et clair+normal déjà vérifiés, `workspace.getTheme().name` confirmé correspondre à chaque combinaison, persistance confirmée après rechargement (les deux réglages survivent indépendamment).

Passe suivante, avec une image de référence de l'utilisateur (« je veux que le contraste élevé ressemble à ça ») : les BLOCS eux-mêmes devaient aussi passer en noir avec un simple contour blanc, plutôt que remplis de la couleur de leur catégorie — les variables CSS et les thèmes Blockly ci-dessus ne touchent que le fond de l'espace de travail/de la boîte à outils, pas le remplissage des blocs (chaque bloc pose sa couleur via `setColour()` à l'initialisation, indépendamment du thème du workspace). Résolu en ciblant directement les éléments SVG que Blockly dessine pour chaque bloc (`.blocklyPath`, `.blocklyPathDark`, `.blocklyPathLight`, `.blocklyText`), avec `!important` : Blockly leur pose `fill`/`stroke` en **attributs de présentation SVG**, la source la plus basse priorité de la cascade CSS, qu'une règle de feuille de style l'emporte donc sans peine — vérifié que `!important` n'était même pas strictement nécessaire mais gardé pour la robustesse. Aucune modification du JS qui construit les blocs. Vérifié dans le navigateur : blocs simples (`au_demarrage`, `boucle_infinie`) et bloc à champ (`lorsque_bouton`, menu déroulant "A") comparés côte à côte avec la référence — fond noir, contour blanc, texte blanc, champ de saisie du bloc resté lisible sans y toucher (fond clair par défaut de Blockly, déjà suffisamment contrasté) |
| Capture d'écran des blocs (.png) | Demande de l'utilisateur : « créer une fonction sreenshot avec téléchargement en png automatique ». Bouton `capture-ecran-btn`, d'abord placé dans le menu « Fichier » puis sorti en bouton autonome de la barre d'outils (demande de suivi : « je veux que le connecteur de capture des blocs se trouve entre le connecteur "fichier" et "envoyer sur la carte" ») — pur déplacement de balisage HTML, aucun changement du JS de capture. Principe : cloner `workspace.getCanvas()` (le `<g>` qui contient tous les blocs), le recadrer sur `workspace.getBlocksBoundingBox()` avec une marge, l'envelopper dans un `<svg>` autonome, puis SVG → `Blob` → `Image` → `<canvas>` (échelle ×2 pour un rendu net) → `toBlob('image/png')` → téléchargement (même schéma que les boutons .hex/.py). Deux pièges trouvés en testant, pas devinés à l'avance (voir `PROMPT_RECREATION.md` §11-12, PIÈGE nº 46) : (1) `.blocklyText` n'a aucun attribut `fill` propre — tout son rendu vient des feuilles de style que Blockly injecte dans `<head>`, jamais dans le SVG lui-même, donc il faut recopier ces règles (`document.styleSheets`) dans un `<style>` intégré au SVG exporté, sans quoi le texte est invisible ; (2) les règles de thème/contraste du panneau (§ ci-dessus) sont écrites `:root[data-contrast="high"] ...` — dans un SVG chargé seul comme image, `:root` désigne le `<svg>` lui-même, pas le `<html>` de la page d'origine, donc une première version exportait le contraste élevé avec les couleurs normales (blocs verts au lieu de noir/blanc) tant que `data-theme`/`data-contrast` n'étaient pas recopiés comme attributs du `<svg>` exporté. Vérifié dans le navigateur, en interceptant `URL.createObjectURL` pour inspecter les blobs produits (SVG intermédiaire puis PNG final) et en réaffichant le PNG dans une `<img>` de test : capture correcte dans les 4 combinaisons thème/contraste (sombre+normal, clair+normal, clair+élevé, sombre+élevé — texte et couleurs de blocs fidèles à l'état affiché à l'écran au moment du clic), message d'erreur clair si l'espace de travail est vide, fond transparent remplacé par la couleur de fond du thème courant (`theme.getComponentStyle('workspaceBackgroundColour')`, avec repli sur blanc si `null` comme pour le thème `Classic`) |
| Boutons « Annuler » / « Refaire » | Demande de l'utilisateur, avec « envoyer sur la carte » comme repère de position : « je veux aussi 2 connecteurs "annuler" et "refaire" situés à droite de "envoyer sur la carte" ». Exposent simplement `workspace.undo(false)`/`workspace.undo(true)` (API Blockly publique, redondante avec les raccourcis clavier Ctrl+Z/Ctrl+Maj+Z déjà actifs par défaut) ; état grisé/actif calculé à partir de `workspace.getUndoStack().length`/`getRedoStack().length` (accesseurs publics, pas besoin de piles privées). Piège trouvé en testant un aller-retour complet (voir `PROMPT_RECREATION.md` PIÈGE nº 47) : le `addChangeListener` général se déclenche bien après un clic sur « Annuler », mais AVANT que la pile « refaire » ne soit repeuplée en interne — « Refaire » restait grisé à tort juste après un « Annuler ». Corrigé en rafraîchissant l'état des deux boutons explicitement dans le gestionnaire de clic, juste après l'appel à `undo()`, en plus du `addChangeListener` conservé pour les autres cas (glisser un bloc, etc.). Vérifié dans le navigateur par un aller-retour piloté souris/clavier (pas d'appel programmatique à `moveBy()`/`Events.fire()`, qui ne peuple pas fidèlement la pile — même limite de test déjà documentée ailleurs) : au chargement les deux boutons sont grisés (piles vides), glisser un bloc active « Annuler » seul, cliquer « Annuler » ramène le bloc à sa position d'origine (`getRelativeToSurfaceXY()` vérifié) et bascule l'état des deux boutons, cliquer « Refaire » restaure la position glissée et rebascule l'état |
| Taille des icônes de la barre d'outils | Demande de l'utilisateur : « réduire la taille des icônes ». Les emoji (📁 📷 📤 ↶ ↷ ⚙ 🌙 ◐ ⬇ ⬆) posés en tête du texte des boutons s'affichent par défaut nettement plus grands que le texte environnant. Chaque icône enveloppée dans `<span class="icone-bouton">`, réglée à `font-size: 0.75em` (relatif à la taille du bouton, donc cohérent même si celle-ci change ailleurs). Piège trouvé en testant le bouton thème (🌙/☀️) : `appliquerTheme()` remplaçait l'icône par `btnTheme.textContent = ...`, ce qui efface TOUS les enfants du bouton y compris le nouveau `<span>` — corrigé en ciblant `btnTheme.querySelector('.icone-bouton')` plutôt que le bouton lui-même. Vérifié dans le navigateur : bascule thème clair/sombre re-teste bien après coup (le `<span>` survit, `innerHTML` confirmé), icônes du menu « Fichier » (⬇/⬆) également réduites et lisibles |
| Redimensionnement du simulateur par glisser | Demande de l'utilisateur : « quand l'affichage "Code" est masqué, je veux pouvoir agrandir/réduire la partie simulateur visuel par un glisser gauche ou droite ». Poignée `#simulateur-redimensionneur` (6px, `cursor: col-resize`) insérée entre `#code-container` et `#simulator-container` dans le balisage, visible uniquement quand la transcription est repliée (`code-container.replie`) — c'est le seul cas où cette bordure sépare directement le simulateur de la zone de blocs, sinon le panneau de code s'intercale entre les deux. Glisser passe `#simulator-container` d'un `flex: 0 0 24%` à une largeur fixe en pixels, plafonnée dynamiquement (pas un pourcentage figé) pour que `#blockly-wrapper` garde toujours au moins ses 260px de `min-width` CSS. Vérifié dans le navigateur : glisser vers la gauche agrandit exactement du delta glissé, glisser loin vers la droite se plafonne à 250px, glisser loin vers la gauche se plafonne exactement à `largeur totale − 260 − 6`, poignée qui redisparaît en rouvrant « Code » sans que la largeur choisie ne soit perdue. — Suivi nº1 : « je ne veux pas que la taille des éléments affichés change [...] je veux juste qu'ils se repositionnent de façon logique ». La toute première version rescalait la carte micro:bit en direct pendant le glisser (`adapterEchelleSimulateur` observait `#carte-cadre` par `ResizeObserver`, jusqu'à ×1.5) — comportement pré-existant hérité de la mise à l'échelle selon la largeur de fenêtre. Retiré : la carte garde une échelle fixe (`REDUCTION = 0.75`), recentrée par flexbox. — Suivi nº2, capture d'écran à l'appui : les boutons et le panneau « Piste » s'étiraient toujours bord à bord (seule la carte avait été corrigée). Plafonnés eux aussi. — Suivi nº3 (celui-ci définitif, remplace le plafonnage uniforme du nº2) : « est-il possible d'envisager un repositionnement automatique des éléments affichés en fonction de la place ? » → au lieu d'un simple `max-width` qui laisse juste du vide autour de chaque élément, restructuration en 2 groupes pour un vrai réagencement : `#simulateur-console` (carte + `#simulateur-actions` — les 3 boutons désormais enveloppés ensemble) en `display:flex; flex-wrap:wrap` — se placent côte à côte si la largeur le permet (210px + 268px + 20px de gap), repassent l'un sous l'autre sinon ; `#simulateur-panneaux` (Grove/Piste/LiDAR, désormais enveloppés ensemble) en `display:grid; grid-template-columns: repeat(auto-fill, 268px)` — se rangent en 2 colonnes si 2×268px+gap tient dans la largeur dispo, sinon retombent en 1 colonne. Aucun JS, aucune requête de conteneur (`@container`) : le retour à la ligne natif de `flex-wrap`/`grid-auto-fill` suffit. Liste des enfants directs vérifiée en direct (`document.getElementById(...).children`) plutôt que devinée depuis l'indentation HTML (trompeuse ici : `#microbit-board` indenté au même niveau que son parent `#carte-cadre`, décalage préexistant sans rapport). Vérifié dans le navigateur à plusieurs largeurs : état par défaut (250px) inchangé (tout empilé, non-régression confirmée par capture), à 607px carte+boutons passent côte à côte (mêmes coordonnées Y, largeurs 210px/268px inchangées), à 750px Grove et Piste se rangent aussi côte à côte (LiDAR passe à la ligne suivante), retour à 250px effondre tout en une colonne sans reliquat, cas à un seul panneau visible (les 2 autres masqués par `.replie`) reste correctement centré. — Suivi nº4, capture d'écran du panneau Grove à l'appui : « pourquoi les éléments s'affichent en colonne ? j'avais demandé un affichage auto adaptatif sur la zone ». Deux angles morts du nº3 : (1) `#simulateur-panneaux` utilisait `auto-fill` avec des colonnes de largeur FIXE (268px) — un seul panneau visible (Grove seul, par exemple) restait donc coincé à 268px avec tout l'espace restant vide à côté, jamais utilisé ; (2) l'adaptation s'arrêtait au niveau des 3 panneaux eux-mêmes (Grove/Piste/LiDAR) sans descendre plus bas — À L'INTÉRIEUR de `#grove-panneau`, les 11 modules (Ruban RGB, capteur de gestes, LED, écran LCD, Température/Humidité, CO₂, etc., chacun un `.grove-bloc`) restaient empilés verticalement quelle que soit la largeur disponible, avec zéro adaptation. Corrigé sur les deux fronts : `#simulateur-panneaux` passe de `repeat(auto-fill, 268px)` à `repeat(auto-fit, minmax(268px, 1fr))` (`auto-fit` replie les colonnes vides au lieu de garder leur largeur fixe, et les colonnes restantes se partagent l'espace libéré) ; `#grove-panneau` et `#lidar-panneau` deviennent eux-mêmes des grilles (`repeat(auto-fill, minmax(190px, 1fr))`) pour leurs propres `.grove-bloc`, avec le `<h4>` du panneau étendu sur toute la largeur (`grid-column: 1 / -1`) pour rester un vrai titre plutôt qu'une cellule de grille. `#piste-panneau` volontairement laissé tel quel : c'est un seul widget cohérent (sélecteur + piste + robot + réglages spécifiques au robot actif), pas une liste de cartes indépendantes comme Grove/LiDAR — le transformer en grille aurait cassé sa mise en page interne sans rapport avec la demande. Piège de test rencontré en vérifiant : les sections `.grove-bloc` masquées portent la classe `.replie` (`display:none !important`) recalculée automatiquement par `rafraichirPanneauGrove()` selon les blocs réellement utilisés dans le programme — les retirer à la main pour le test se faisait aussitôt écraser par le prochain passage de cette fonction (déclenché par n'importe quel événement, y compris un `scroll`) ; contourné en regroupant retrait des classes et lecture des positions dans un seul appel atomique, sans autre événement entre les deux. Vérifié dans le navigateur : 6 modules Grove forcés visibles à 650px de large → rangés en 3 colonnes de 205px (mêmes coordonnées Y par rangée de 3) ; état par défaut (panneau non élargi) → toujours en 1 colonne, aucune régression |
| Colonne de catégories masquée pendant un glisser de bloc | Demande de l'utilisateur : « masquer [la colonne de blocs] quand l'élève a sélectionné son bloc jusqu'à ce qu'il le pose puis réapparaît une fois le bloc posé », confirmé pour « les 2 cas » (nouveau bloc pris dans le tiroir ET bloc déjà posé qu'on repositionne) après question de clarification. Le tiroir (la liste de blocs qui s'ouvre à côté d'une catégorie) se refermait déjà tout seul dès le début d'un glisser (`autoClose`, comportement Blockly par défaut, vérifié via `toolbox.getFlyout().autoClose === true`) — restait la colonne des catégories elle-même (Temps, Affichage, Capteurs…), toujours affichée. Écouté via `Blockly.Events.BLOCK_DRAG` (constante `'drag'`, confirmée en direct plutôt que devinée) sur `workspace.addChangeListener` : `isStart: true`/`false` encadre exactement un glisser, que le bloc vienne d'être créé depuis le tiroir ou qu'il soit déjà sur l'espace de travail — les deux passent par le même mécanisme de geste Blockly en interne, vérifié par test réel des deux cas séparément. `toolbox.setVisible(!isStart)` (méthode publique) + `Blockly.svgResize(window.workspace)` (comme partout ailleurs dans ce fichier, Blockly ne s'aperçoit jamais tout seul qu'on lui a changé sa place) : la zone de blocs récupère bien la largeur libérée (487px → 666px mesuré). Piège de test (pas un bug de l'app) : le premier essai de glisser un bloc hors du tiroir avec `left_click_drag` en un seul geste n'aboutissait pas (bloc jamais posé, `isStart:false` jamais reçu) — un glisser en 2 étapes (petit décalage intermédiaire avant la position finale) a abouti normalement ; la simulation d'un glisser programmatique par `dispatchEvent` direct (sans passer par le tiroir) s'est aussi révélée peu fiable, cohérent avec les limites de test déjà documentées ailleurs dans ce projet — le geste réel à la souris, lui, fonctionne du premier coup. Vérifié dans le navigateur : bloc existant glissé → colonne masquée pendant, réapparue après (capture d'écran) ; nouveau bloc glissé depuis le tiroir « Temps » → même comportement, bloc correctement posé sur l'espace de travail à la fin (capture d'écran) |
| Appui bouton/broche virtuel pendant un passage déjà en cours | Bug signalé par l'utilisateur (capture d'écran d'un programme Maqueen Plus avec musique de démarrage + boucle moteur) : « lors de l'appui sur les boutons virtuels A, B, 0, 1, 2, logo ça actionne la simulation ». Confirmé volontaire au départ après clarification (« c'est un problème à corriger ») : `lierCapteurTactile()` appelait `btnLancer.click()` sur CHAQUE appui, sans regarder si un passage (5 tours, voir `simu_lancerTours`) était déjà en train de tourner — `lancer_simulation` (Brython, index.html) repart entièrement de zéro à chaque clic (`simu_clearQueue()`, objets Grove/servos réinitialisés, code ré-exécuté depuis le haut), donc un appui pendant un passage en cours redémarrait tout le programme : position du robot perdue, musique de « Au démarrage » rejouée, etc., pour un simple appui censé n'être vu que par le passage déjà lancé. Nouveau drapeau `window.simuEnCours` (posé à `true` dans `simu_lancerTours` tant que `nRestants > 0`, à `false` une fois les 5 tours épuisés OU sur une erreur en cours de tour OU par `simu_reinitialiser()`) : `lierCapteurTactile()` ne relance `btnLancer.click()` que si `!window.simuEnCours` — sinon il se contente de poser le drapeau (`window.simu_btnA_pressed` etc.), que les tours déjà en cours liront tout seuls à leur prochain passage, exactement comme un appui réel sur la carte. Portée volontairement limitée aux boutons/broches (A, B, logo, 0, 1, 2) : « Secouer la carte » et « Simuler la réception » (radio Grove) utilisent un code séparé, pas `lierCapteurTactile()`, donc non affectés par ce correctif — non demandé par l'utilisateur, et un geste ponctuel « secouer » a une sémantique différente d'un bouton maintenu. Vérifié dans le navigateur avec un programme à délai réel (`sleep(1000)` dans la boucle, pour avoir une fenêtre de plusieurs secondes à tester) : un appui pendant le passage laisse `simuEnCours` à `true` et ne déclenche AUCUN nouveau passage (compteur de démarrages resté à 1) tout en posant bien `simu_btnA_pressed`, `simuEnCours` repasse à `false` une fois les 5 tours écoulés, et un appui alors que c'est inactif relance bien un nouveau passage comme avant (compteur passé à 2). — Suivi immédiat, même signalement : « un appui sur A/B/broches 0-1-2/logo déclenche la simulation même si aucun de ces connecteurs [n'est] affecté ». Le correctif ci-dessus ne regardait que si un passage était DÉJÀ en cours, pas si le programme utilisait seulement CE capteur-là — appuyer sur la broche 2 déclenchait toujours un passage complet (musique, mouvement...) même si le programme n'utilisait que le bouton A. `lierCapteurTactile()` reçoit désormais un 3ᵉ paramètre, l'identifiant MicroPython du capteur (`button_a`, `button_b`, `pin_logo`, `pin0`, `pin1`, `pin2`) ; `btnLancer.click()` n'est appelé que si `window.currentPythonCode` contient cet identifiant (simple recherche de sous-chaîne — couvre aussi bien la lecture directe `button_a.is_pressed()` que les gestionnaires « lorsque », qui scrutent le même identifiant en interne). Vérifié dans le navigateur : programme n'utilisant que `button_a` → appuyer sur B/logo/0/1/2 ne déclenche AUCUN passage (0 démarrage chacun), appuyer sur A en déclenche bien un ; programme par défaut (`pass`, n'utilise rien) → aucun des 6 appuis ne déclenche quoi que ce soit ; programme utilisant `pin1` → appuyer sur la broche 1 déclenche bien un passage, confirmant que la détection fonctionne aussi pour les broches, pas seulement les boutons. — Troisième suivi, même signalement : « le problème reste avec la broche 1 ». Angle mort de la recherche de sous-chaîne : `"pin12".includes("pin1")` vaut `true` (comme `pin13`...`pin16`, des broches Grove courantes) — un programme les utilisant, sans jamais utiliser `pin1` lui-même, redéclenchait quand même la simulation en appuyant sur la broche 1 virtuelle. Seul `pin1` a cet angle mort (aucun autre identifiant du jeu n'est le préfixe d'un autre). Remplacé par une recherche à limites de mot (`new RegExp('\\b' + identifiantPython + '\\b')`) : pas de limite de mot entre le `1` de `pin1` et le `2` de `pin12` (tous deux des caractères de mot), donc le motif ne correspond plus à l'intérieur de `pin12`. Vérifié dans le navigateur : programme utilisant `pin12`+`pin13` (jamais `pin1`) → broche 1 virtuelle inerte (0 démarrage, contre 1 avant ce correctif) ; programme utilisant réellement `pin1` → déclenche toujours ; non-régression de `button_a` re-vérifiée avec un délai d'attente suffisant entre chaque appui (un premier essai trop rapproché avait montré à tort `btn-a` inerte — `simuEnCours` encore vrai d'un passage précédent pas terminé, artefact de test isolé et corrigé plutôt qu'un vrai bug) |
| « Nouveau projet » (menu Fichier) + confirmation à la fermeture | Demande de l'utilisateur : « dans le menu fichier : Créer une fonction "Nouveau Projet". Lors de la fermeture de l'app, demander une confirmation de type "Etes-vous sûr ?" ». « Nouveau projet » : `window.confirm()` (rien n'existait avant dans le projet), puis sort de l'édition manuelle si active (`sortirEditionManuelle()`), vide l'espace de travail (`workspace.clear()` + `clearUndo()`) et recharge l'espace de départ par défaut — factorisé dans `chargerEspaceDeDepart()`, réutilisant la fonction qui posait déjà « Au démarrage »/« Répéter indéfiniment » au tout premier chargement de la page (évite de dupliquer le JSON de sérialisation Blockly à deux endroits). Confirmation à la fermeture : `beforeunload` + `preventDefault()`, seul mécanisme possible en JS — les navigateurs modernes ignorent le texte personnalisé et affichent systématiquement leur propre message générique (sécurité, empêche un site d'afficher un faux message trompeur), donc le texte exact « Êtes-vous sûr ? » ne peut pas s'afficher tel quel, seul le principe (une confirmation avant de quitter) est réglable. Couvre la fermeture de l'onglet/fenêtre, F5 et toute navigation qui quitte la page — cohérent avec l'absence totale de sauvegarde automatique (le programme est perdu au rechargement de toute façon, voir readme.txt). Vérifié dans le navigateur : `window.confirm` remplacé temporairement pour lire le message exact et pour simuler Annuler (aucun changement, blocs intacts) puis OK (3 blocs → 2 blocs par défaut, code régénéré à `while True: pass`) sans manipuler de vraie boîte de dialogue native ; édition manuelle activée puis « Nouveau projet » → édition quittée proprement (voile levé, `editionManuelleActive` à `false`) en plus de la remise à zéro des blocs ; `beforeunload` déclenché synthétiquement confirme `event.preventDefault()` bien appelé (`defaultPrevented === true`) |
| Reconstruction de blocs à l'import (fichiers générés par l'appli) | Demande de l'utilisateur : « je veux pouvoir reconstruire les fichiers générés par l'appli ». Portée volontairement limitée aux fichiers que l'appli a elle-même produits (pas du Python arbitraire, discuté et validé avant de commencer) : chaque export (.hex et .py, bouton de téléchargement ou « Envoyer sur la carte ») porte désormais une signature en première ligne (`SIGNATURE_MARQUEUR`) ; à l'import, sa présence déclenche une tentative de reconstruction en blocs, son absence retombe sur l'édition manuelle comme avant (non-régression vérifiée). Architecture : `window.analyserCodePython()` (Brython, index.html) parse le texte avec le module `ast` standard et le renvoie en JSON (jamais de regex sur le texte, robuste aux commentaires/indentation) ; côté JS, `reconstruireDepuisCode()` parcourt cet arbre et fait correspondre chaque instruction/expression à l'un des blocs du projet via une table de motifs (chaque générateur `P.forBlock[...]` produit un texte Python fixe et déterministe, ce qui rend la correspondance inverse possible). Couverture volontairement partielle (~40 blocs sur 169, répartis dans toutes les catégories, plus les blocs natifs Blockly if/tant que/répéter/opérateurs) : tout ce qui n'est pas reconnu retombe sur un bloc générique "code" (nouveau `code_brut`/`expression_brute`) qui garde le fragment Python d'origine tel quel — jamais d'échec silencieux. Cinq bugs réels trouvés en testant un aller-retour complet (générer depuis de vrais blocs, exporter, réimporter, comparer), aucun deviné à l'avance : (1) les champs "broche" (servo, Kitrobot, LiDAR) sont des identifiants Python nus (`pin0`) dans le code généré, pas des chaînes — confondu au départ avec un champ numérique/texte ; (2) `grove_ruban_couleur` a son COULEUR en CHAMP (menu déroulant hexadécimal), pas en entrée de valeur, à la différence de la plupart des autres blocs Grove ; (3) Brython pose parfois `lineno`/`col_offset` d'un noeud composite (`BinOp`, `Assign`, `Import`...) sur son seul token opérateur plutôt que sur tout son empan — corrigé en calculant l'empan par le BAS (union avec tous les descendants) plutôt qu'en growing sur la position propre du noeud, avec un repli par reconstruction sémantique pour `Import` (aucun descendant positionné pour s'appuyer dessus) ; (4) un litteral `b""` (défaut d'un paramètre dans le code des pilotes auto-injectés) n'est pas sérialisable en JSON tel quel ; (5) le code des pilotes auto-injectés (`# >>> pilote X ... # <<< pilote X`, des dizaines à des centaines de lignes par module) se retrouvait lui-même soumis à la reconstruction si on ne le retirait pas avant analyse — jusqu'à 80 blocs "code" parasites sur un programme pourtant simple. Suivi utilisateur (capture d'écran à l'appui) : les imports (`from microbit import *`, `import neopixel`...) affichés comme blocs "code" étaient du pur passe-partout — désormais silencieusement omis (réinjectés tout seuls par les générateurs dès qu'un bloc en a besoin) plutôt qu'affichés. Limite structurelle confirmée et expliquée à l'utilisateur, pas corrigible : un bloc chaîné juste après « Au démarrage » (sibling) et le même bloc niché DANS « Au démarrage » produisent un texte Python rigoureusement identique (aucune ligne vide, aucun marqueur) — la reconstruction ne peut donc pas deviner lequel des deux agencements était l'original, seulement reproduire un équivalent fonctionnellement identique (même ordre d'exécution). Vérifié dans le navigateur par un aller-retour complet couvrant ~22 blocs répartis dans 8 catégories (Temps, Affichage, Entrées/Sorties, Actionneurs, Communication, Servos, Maqueen Plus, Maqueen Lite, Kitrobot, LiDAR, Grove, plus un gestionnaire « lorsque » et des expressions imbriquées) : 0 bloc "code" restant sur le programme de test final, `Blockly.serialization.workspaces.load()` accepté sans erreur, code régénéré depuis les blocs reconstruits fonctionnellement équivalent à l'original ; non-régression vérifiée sur un fichier sans signature (repli édition manuelle intact) et sur un fichier signé mais syntaxiquement corrompu (repli propre, pas de plantage) |
| Compteur de clics du bouton (`get_presses()`) — deux passes, la première corrigeait le mauvais bout | Bug signalé par l'utilisateur (capture d'écran d'un programme « si nombre de clics du bouton B = 10 alors afficher l'icône Cœur » qui ne se déclenchait jamais). Cause immédiate : `ButtonMock.get_presses()` (index.html) renvoyait `0` sans condition. — **Suivi nº1 (corrigé puis annulé)** : un compteur JS non consommateur (`window.simu_btnA_clics`/`simu_btnB_clics`, ne se remettant à zéro qu'à la réinitialisation manuelle) faisait marcher le simulateur, mais le bloc générait toujours `button_b.get_presses()` tel quel — la VRAIE carte, elle, utilise l'API réelle du firmware MicroPython, consommatrice (renvoie le total depuis la dernière lecture PUIS se remet à zéro), donc « si nombre de clics == 10 » ne se déclenchait quasiment jamais sur la vraie carte (chaque lecture remet le compteur à zéro avant d'avoir pu en accumuler 10). Signalé par l'utilisateur : « le mode simulation fonctionne bien, par contre ça ne fonctionne pas en réel ». — **Suivi nº2 (correctif définitif)** : déplacé la solution du simulateur vers le GÉNÉRATEUR du bloc lui-même (`P.forBlock['nombre_clics_bouton']`), qui pose désormais un compteur Python global cumulatif (`_clics_b = 0` + `def _lire_clics_b(): global _clics_b; _clics_b += button_b.get_presses(); return _clics_b`) plutôt que d'appeler `get_presses()` directement — cette fois le MÊME code Python tourne sur la vraie carte et dans le simulateur, donc la même logique s'applique aux deux ; `ButtonMock.get_presses()` peut redevenir fidèle au matériel réel (consommateur) puisque l'accumulation ne dépend plus de lui. Vérifié : le code généré (`_clics_b = 0\ndef _lire_clics_b(): ...`) est correct pour une exécution continue sur la vraie carte. Limite restante, découverte en re-testant dans le navigateur après ce correctif : le simulateur n'exécute JAMAIS le programme en continu — il ré-`exec()` le code ENTIER à chaque passage de 5 tours déclenché par un clic quand rien n'est déjà en cours (voir `simuEnCours`, PIÈGE nº 49), ce qui réinitialise `_clics_b = 0` à chaque passage séparé ; des clics espacés de plus de quelques dizaines de ms (le temps qu'un passage sans `sleep()` se termine) ne s'accumulent donc plus dans LE SIMULATEUR, même si le même programme fonctionnerait correctement sur la vraie carte. Pas corrigé dans cette passe : nécessiterait de séparer l'exécution du code de premier niveau (une seule fois) de la répétition des tours (sans ré-exécuter les globales à chaque fois) — un changement plus large de l'architecture d'exécution du simulateur, mis de côté après explication à l'utilisateur plutôt que tenté sans discussion |
| Simulateur | LED, texte défilant, son (rendu hors ligne : durée, énergie, hauteur des notes), parole, gestes consommés à la lecture |
| Icônes prédéfinies (`Image.HAPPY`/`SAD`/`GHOST`/`HEART`) | Bug réel trouvé (signalé par l'utilisateur, qui a comparé HAPPY et SAD affichés côte à côte) et corrigé : HAPPY, SAD et GHOST allumaient un motif de LED erroné, sans rapport avec le vrai micro:bit — seule HEART était juste. Les quatre re-vérifiées pixel par pixel contre la définition officielle (`microbit_constimage.c`, dépôt `microbit-foundation/micropython-microbit-v2`) |
| Grove | 11 modules, code généré conforme aux sources Seeed, affichage conditionnel des sections |
| Servos | bornes, intervalle, rotation continue, arrêt au neutre, animation des cadrans |
| Mise en page | canevas synchronisé avec Blockly dans 9 situations, corbeille et zoom toujours visibles |
| Simulateur : fidélité visuelle de la carte micro:bit | Voir le détail complet (8 passes) dans la section dédiée ci-dessous, « Historique — fidélité visuelle de la carte micro:bit ». État actuel : LED éteintes visibles (boîtier clair), connecteur de bord en **SVG** (réglette plate, dents fines denses, bord du bas **onduleux** — le vrai trait distinctif du V2, « bosselé » vs le bord plat du V1, mentionné sur microbit.org/fr), USB et indicateur micro ajoutés, étiquettes A/B en triangle bleu avec lettre imprimée, badge « V2 » déplacé en étiquette d'interface (il est en réalité sérigraphié au dos, jamais sur la face avant) |
| Envoi sur la carte | écriture simulée avec un faux lecteur : 1 877 004 octets, tous les cas d'erreur |
| Panneau administrateur | Ctrl+Alt+Maj+A active/désactive, bouton ⚙ rouge caché sinon. Réordonner/masquer/renommer/**recolorer** une catégorie (pastille `<input type="color">`, conversion teinte Blockly → hex vérifiée par calcul), idem pour les sous-menus natifs (Communication, Grove) et les sous-menus personnalisés, création d'un sous-menu personnalisé avec extraction des blocs choisis, renommage d'un libellé de bloc appliqué aux blocs déjà posés et aux nouveaux, onglet Aide qui charge `readme.txt` par `fetch()` (28 420 caractères reçus, testé aussi après un blocage transitoire du serveur mono-thread — voir « détail agaçant » plus bas). Persisté en localStorage (sauf l'onglet Aide, sans état), testé via `window.adminTest` (voir un.js) faute de pouvoir simuler un glisser-déposer ou un clic sur un `<input type="color">` |
| Édition manuelle du code | Bouton « ✎ Éditer » : bascule vers un `<textarea>`, gèle le canevas Blockly (voile visuel qui capte aussi les clics), la saisie remplace `window.currentPythonCode` en direct — vérifié que `.hex`/`.py`/simulateur le lisent bien à cet instant. « Revenir aux blocs » restaure le code généré et dégèle. Testé via `window.editionCodeTest` (voir un.js), non persisté (perdu au rechargement, comme l'espace de travail lui-même) |
| Exécution tour par tour | Réécrit pour que `sleep()` laisse vraiment un capteur voir l'effet du tour précédent (voir `PROMPT_RECREATION.md` §14). Non-régression vérifiée sur le test déjà documenté : `was_gesture` déclenche 1 fois sur 5 tours, `is_gesture` 5 fois, identique à avant. Vérifié aussi : événements « lorsque … » toujours scrutés à chaque tour, programme sans boucle infinie, et repli correct sur l'ancien comportement avec deux boucles infinies empilées (cas rare) |

## Évolutions de la copie `easybloc_ts_adacraft_vilain` (V2.0C → V2.0E, oct. 2026)

Toutes les évolutions ci-dessous ont été faites dans la **copie** `C:\Users\jreyn\OneDrive\Documents\claude\easybloc_ts_adacraft_vilain`
(le projet principal `blockly_ts` reste à la V2.0C, exe compris). Principe de travail : **ne modifier aucune fonction existante** quand un
nouveau fichier suffit — d'où `bandeau.js` et `exercices.js`, qui s'appuient sur les identifiants et les classes existants (`.inactif`,
`#btn-vue-*`, `window.workspace`, `window.simuEnCours`…). Détails de réalisation : `PROMPT_RECREATION.md` §22 à §26 (pièges nº 59 à nº 70) et
`readme.txt` §23 à §31.

| Domaine | Ce qui a été fait et contrôlé |
| --- | --- |
| Bandeau supérieur (modèle Arduino R4) | Refait pour ressembler au modèle d'un collègue : logo (retiré depuis), menu Fichier, nom du programme, Défaire/Refaire, Capture, Console / Simulation / Code / IA (libellés Afficher/Masquer qui suivent l'état), sélecteur de carte, Téléverser, Lancer la simulation, version, menu Aide. Les `id` d'origine sont conservés, seul le balisage change ; la logique de bascule des libellés est dans `bandeau.js` (`MutationObserver` sur la classe `.inactif`). Vérifié à 1280, 1366 et 1920 px (une ou deux rangées, aucun bouton coupé) ; message d'état transformé en bulle absolue sous la barre (il faisait passer la barre sur deux rangées) |
| Couleur du bandeau | Orange de la charte Technologie Services : `#ff5501` en clair, `#d94700` en sombre (texte blanc plus lisible), noir en contraste élevé ; filet bas `#b33a00`. Liseré blanc de 3 px sous chaque bouton **activé** (console, simulation, code, IA affichés = classe `.inactif` absente) |
| Console = Moniteur série | Un seul panneau « Console » pour trois sources de lignes (simulateur / carte / info) ; le bouton Console affiche ou masque, avec un voyant (anneau vide = carte non connectée, disque vert plein = connectée, `#btn-console-carte.connecte`) ; « Moniteur » devient un raccourci vers « Connecter ». Reconnexion automatique après un téléversement (`connexionVoulue`) |
| Hauteur de la console par glisser (oct. 2026) | Barre `#console-redimensionneur` sur le bord haut (pointer events : souris, stylet, doigt), même hauteur pour les vues Texte et Graphique, butée à 50 px et à 150 px d'espace de blocs, hauteur retenue (`console_hauteur_v1`, localStorage), double-clic = 148 px. **Vérifié** au glisser réel : +170 px, butée, bandeau immobile, bascule Texte/Graphique, double-clic, reprise après rechargement |
| Sélecteur de carte | `demarrerCartes(serial)` : enveloppe `serial.requestPort`, liste les ports déjà autorisés (`getPorts`), filtre sur le fabricant micro:bit `0x0D28`, 115 200 bauds. Testé avec de **faux ports** seulement ; un faux port doit remettre `readable` à `null` à sa fermeture sinon la boucle de lecture tourne sans fin et gèle l'onglet |
| Catégories : ordre, noms, regroupements | Ordre : Boucles, Temps, Matrice LED (ex-Affichage), Entrées/Sorties, Capteurs, Actionneurs (Audio), Servos, Radio, IA, Grove, Logique, Variables, Maths, Texte, Fonctions, Listes. « Communication » renommée **Radio** (Groupe, Envoi, Réception, Plus) ; catégorie **Listes** ajoutée (blocs de liste natifs de Blockly). Tout se fait dans `reordonnerToolbox()` (tri stable, appelée en premier par `appliquerPaletteToolbox`) — aucune définition de bloc touchée |
| Couleurs de catégories | Une table unique `PALETTE_CATEGORIES` (`un.js`) pilote la couleur des blocs **et** des pastilles (oct. 2026 : les blocs prennent exactement la couleur de leur pastille, couleurs de la version Arduino R4 ; `colorerPuces()` recopie la couleur de la catégorie, donc une couleur changée au panneau administrateur change aussi la pastille). 17 couleurs toutes différentes. Texte foncé (#1a1a1a) sur les 7 couleurs où le blanc contraste à moins de 3:1 (Boucles, Temps, Capteurs, Servos, Logique, Maths, Robots) : règle CSS `g:has(> path.blocklyPath[fill=…]) > g > text.blocklyText`, sans effet en contraste élevé. **Vérifié** : 43 catégories et sous-catégories + Variables/Fonctions, aucun écart bloc/pastille |
| Pastilles rondes | 18 px, retrait de 33 px (47 px pour les sous-catégories), couleur dans `--puce` posée par `colorerPuces()` ; liseré blanc fin (noir ou blanc épais en contraste élevé) |
| Recherche de blocs | Champ au-dessus de « Boucles », collé en haut pendant le défilement ; index construit au premier usage (~50 ms) sur **toute** la boîte d'origine, plus les catégories dynamiques Variables et Fonctions (relues à chaque recherche) ; synonymes pour les blocs dont le libellé ne contient pas le mot cherché ; le tiroir reste ouvert après un dépôt de bloc (gestion d'`autoClose`) |
| Polices | Interface : `Segoe UI` (variable `--font`, repli Arial). Texte des blocs : réglé dans le **thème Blockly** (`fontStyle`, jamais en CSS, car Blockly mesure le texte pour dimensionner les blocs) ; après l'alignement Arduino : police par défaut `sans-serif`, 11 pt, jamais de gras |
| Alignement sur la version Arduino R4 (4 modes) | Prompt « police et couleurs pour un collègue » appliqué **sans toucher aux blocs, noms ni ordre** : fonds de la page, de la colonne de catégories, de la zone de programmation (+ grille 20/3, aimantation `snap: true`), du tiroir, de la simulation, du code et de la console dans les quatre modes (sombre = défaut, clair, contraste élevé clair, contraste élevé sombre) ; catégorie choisie avec filet `#e8a020` ; blocs en contraste élevé : blancs à bord noir en clair, noirs à bord blanc en sombre. Variables CSS `--ec-*` par mode. Non repris : accent turquoise du modèle (charte orange gardée), barre d'onglets `CARTE…` (absente chez moi). Vérifié visuellement dans les 4 modes |
| Exercices pas à pas + mode évaluation | `exercices.js` (moteur) + `exercices.json` (16 exercices, 5 niveaux, modifiables à la main). Panneau « Mission » déplaçable, 3 indices, solution, validation automatique par lecture des blocs, étoiles, déverrouillage progressif, progression par élève (localStorage), export/import JSON, tableau de classe (CSV, impression). Évaluation : sans aide, 3 essais (100/75/50 % des points), chronomètre facultatif, note sur 20, rapport imprimable. **Vérifié** : les 16 règles refusent l'espace vide et acceptent leur solution ; un exercice validé en direct (3 étoiles enregistrées) ; une évaluation complète (1 essai raté puis réussi, un exercice passé) → note 7,5/20 et rapport affichés. Non vérifié : impression réelle, exports de fichiers, import, glisser-déposer réel de blocs |
| Site statique `site_web` | Dossier prêt à héberger (GitHub Pages…) : `index.html`, `un.js`, `deux.js`, `trois.js`, `ia.js`, `tuto.js`, `bandeau.js`, `exercices.js`, `exercices.json`, `firmware.hex`, `readme.txt`, `lib/` (36 fichiers, 15 Mo), `.nojekyll`. Testé servi par un simple serveur statique : 36 catégories, espace de travail actif, simulateur chargé. Logo et mention « RAJ Editions » retirés de la page |
| Exécutables | V2.0D (bandeau, recherche, alignement Arduino, liserés) et **V2.0E** (+ exercices) construits avec PyInstaller (16,2 Mo). Contenu de l'archive vérifié (tous les fichiers, version, menus). **Aucun des deux n'a pu être lancé depuis la session** (accès refusé par Windows) |
| IA reprise d'EasyBloc TS (oct. 2026, après la V2.0E) | `ia-immediat.js` + `lib/mediapipe` (27 Mo) + `lib/zxing`. Apprentissage **immédiat** (k plus proches voisins, sans entraînement) : objets et images, **gestes de la main**, **positions des bras** ; exemples par la caméra ou par des **fichiers images** ; apprentissage **rangé dans le `.py`** (et export/import `.json`) ; **QR codes et codes-barres** (lecture + création à imprimer, 3 blocs) ; classe des blocs IA choisie dans une **liste**, renommage propagé aux blocs ; **doublon supprimé** à la demande de l'utilisateur : la colonne Vision ne fait plus que charger un modèle Teachable Machine, la création d'images passe par l'apprentissage immédiat (visite guidée IA réécrite, 15 étapes, toutes les cibles vérifiées) ; résultat **renvoyé toutes les 500 ms** et oublié par la carte après 1,5 s. **Vérifié** dans le navigateur : MediaPipe et ZXing chargés en local (aucune requête externe), 4 images inédites sur 4 bien classées, les 3 modèles chargés, normalisation main/bras (miroir, échelle), simulateur : gestionnaire déclenché **une seule fois** malgré les renvois, texte QR contenant « : » intact, classe oubliée 1,5 s après l'arrêt des envois ; aller-retour `.py` (CRLF, espaces de fin retirés), QR créé puis relu. **Non vérifié** : vraie caméra (gestes et positions réels), vraie carte, exe non reconstruit |
| IA : sons immédiats, vignettes, reconstruction (oct. 2026) | Type **« sons et mots »** dans l'apprentissage immédiat (`ia-son-immediat.js` : MFCC + DTW, sans modèle) ; entraînement du son et `lib/tm/base` (7,3 Mo) **retirés** ; **vignettes** des exemples (photo, squelette, timbre) et **suppression d'un exemple** par clic ; **reconstruction en blocs** des gestionnaires et expressions IA à l'import d'un `.py`. **Vérifié** : sons fabriqués (3 « mots ») : 9 sons détectés sur 9, bruit continu de 2 s ignoré, 6 sur 6 reconnus malgré volume ×1 à ×6 et durée 0,30 à 0,55 s ; lignes `IA:son:…` puis classe vide après 1 s ; vignettes (sons, photos, squelettes) et suppression ; aller-retour `.py` ; programme IA complet reconstruit **sans aucun bloc « code »**, code régénéré identique, radio non régressée ; visite guidée (17 étapes) et aide. **Non vérifié** : vrai micro (refusé dans le navigateur de test), vraie caméra, vraie carte |
| Grove : potentiomètre et premier lot (oct. 2026) | Potentiomètre (module dessiné, bouton tourné à la souris), puis **bouton poussoir** (état et « lorsque … appuyé »), **capteur de lumière**, **détecteur de mouvement PIR**, **buzzer** (marche/arrêt, bip), **relais**, **écran OLED 0,96" SSD1306** (texte 21 × 8, police 5 × 7 commune au pilote et au simulateur). **Vérifié** dans le simulateur : 18 sous-catégories Grove, les 10 nouveaux blocs génèrent leur code, aide et exemple pour chacun ; programme complet (relais selon le PIR, buzzer selon le bouton, lumière sur l'OLED) ; deux appuis = deux déclenchements ; buzzer coupé à l'arrêt ; les 95 caractères de la police lisibles ; reconstruction des blocs depuis un `.py` avec code régénéré identique. **Non vérifié** : modules réels sur une vraie carte (OLED en particulier) |
| Grove : deuxième lot (oct. 2026) | **Barre de LED** MY9221, **BMP280** (pression, température, altitude), **SGP30** (eCO₂, COV), **horloge temps réel** DS1307/DS3231, **pilote 16 servos** PCA9685. **Vérifié** dans le simulateur : 23 sous-catégories Grove, les 10 nouveaux blocs génèrent leur code, aide et exemple pour chacun ; programme complet (barre à 6 + LED 10, 1000 hPa → altitude 110,9 m, eCO₂ et COV, horloge réglée au 14/07/2026 9 h 05, servos S3 à 45° et S7 continu) ; reconstruction des blocs depuis un `.py`. **Non vérifié** : aucun des cinq pilotes sur une vraie carte |
| Panneau IA en cartes (oct. 2026, modèle A choisi parmi 3 maquettes) | Une carte par mode (icône SVG, titre, sous-titre, badge d'état déduit du bouton Démarrer par MutationObserver, carte en marche encadrée), pastilles du type (pilotent le menu d'origine masqué, recalées après annulation ou importation), interrupteur « Envoyer à la carte », boutons arrondis, barres pleines ; couleurs par `color-mix` sur `--texte-code`. Habillage en fin d'`ia.js` ; `ia-immediat.js` ne change plus que le sous-titre ; visite guidée pointée sur les pastilles. **Vérifié** à 1536 px (4 cartes sur une ligne), pastilles Sons/Objets, badge « en marche », thèmes sombre et clair, contraste élevé sombre et clair. **Non vérifié** : caméra et micro réels |
| Fenêtre IA (oct. 2026, d'après la version Arduino R4) | Le panneau du bas devient une fenêtre centrée (même DOM, mêmes classes pour le moteur) : bandeau titre qui suit le type, onglets avec point d'état, pied (Tout effacer, seuil, interrupteur, Terminé), cartes de classes (Une photo, Plusieurs photos ↔ Arrêter, Ajouter des images, Enregistrer pour les sons, 🧹 vider), caméra allumée à l'ouverture (`synchroCapteurAuto`), visite guidée qui bascule l'onglet de sa cible et referme la fenêtre pour une cible extérieure (`window.iaOnglet`, `window.fermerPanneauIA`). **Vérifié** : ouverture, titre, refus de caméra (message), 8 images ajoutées par fichiers, compteurs et vignettes, suppression d'une vignette, vider, Démarrer activé, pastille Sons (Enregistrer, cadre masqué), 4 onglets, Échap, voile, Terminé, flèches, 17 étapes de la visite IA, thèmes sombre et clair. **Non vérifié** : caméra et micro réels (bloqués dans l'aperçu), donc « Une photo », « Plusieurs photos » et « Enregistrer » en vrai |
| Multi-éditeur radio (oct. 2026, d'après Vittascience) | Fichier > Multi-éditeur radio ouvre `multi.html` dans un nouvel onglet : deux éditeurs complets côte à côte (`index.html?editeur=1` et `?editeur=2`, pastille « Carte 1 / Carte 2 », poignée de largeur). `radio.send()` du simulateur publie sur un BroadcastChannel ; l'autre carte reçoit si sa radio est allumée sur le même groupe et le même canal (réglages vus à l'exécution, sinon lus dans le code ; défaut groupe 0, canal 7), comme avec « Simuler la réception ». Console : « 📡 envoyé » / « 📡 reçu ». Chaque carte range ses données à part (préfixe `multi1:` / `multi2:`, réglages d'affichage communs). **Vérifié** : envoi et réception entre les deux cartes, groupe différent ignoré, données séparées, entrée du menu. **Non vérifié** : plus de deux onglets ouverts en même temps (ils partagent aussi la radio), exe reconstruit |

### Bugs rencontrés pendant ces évolutions (corrigés)

- **Page GitHub Pages vide** : le dossier `lib/` n'avait pas été envoyé (404 sur Blockly, Brython, microbit-fs) → `brython is not defined`, aucun bloc. Rien à corriger dans le code.
- **Flèche de dépliage invisible en contraste élevé sombre** : c'est un sprite noir de Blockly ; remplacée par ▸ / ▾ à la couleur du texte.
- **Caractère de contrôle `\x15` dans le CSS** : `'\\25B8'` écrit par un script Python lancé depuis un heredoc est devenu `\25` (octal) ; les symboles se mettent directement ou par `chr(0x25B8)`.
- **JSON d'exercices invalide** : accolades mal appariées dans une solution écrite à la main ; régénérée avec `json.dumps`. Valider toujours `exercices.json` après modification.
- **`validerEval()` sans session** (évaluation refusée par `confirm()` dans un test automatisé) : garde ajoutée.

### À vérifier avec du matériel ou chez l'utilisateur

1. L'exe V2.0E **lancé** sur un poste (démarrage, menus Exercices, port 8000 libre — un autre serveur Python l'occupait pendant les tests).
2. Le sélecteur de carte et le voyant avec une vraie carte et un vrai port série.
3. Les exercices en classe : choix des seuils (3 essais, 75 % / 50 %), exercices 5.2 et 5.4, impression du rapport.
4. Le blocage antivirus des exes PyInstaller : désactiver UPX (`upx=False` dans `app.spec`), livrer en dossier plutôt qu'en un fichier, signer avec un certificat de signature de code, ou déclarer l'exe comme faux positif.
5. L'IA reprise d'EasyBloc avec une vraie caméra (gestes de la main, positions des bras, QR codes imprimés), un vrai micro (sons et mots : réglage des seuils dans une salle de classe bruyante) et une vraie carte (renvoi toutes les 500 ms, oubli après 1,5 s, programme avec de longues attentes). Exe à reconstruire (`ia-immediat.js` ajouté à `app.spec`, +27 Mo pour MediaPipe).

## Historique — fidélité visuelle de la carte micro:bit

Signalé par l'utilisateur (« le visuel de la carte micro:bit n'est pas conforme
à l'original »), avec `microbit.org/fr/get-started/features/overview/` comme
référence de départ. Huit passes successives, chacune déclenchée par un
nouveau retour de l'utilisateur :

1. **Premier passage** (diagrammes officiels V2 de la page microbit.org) :
   LED éteintes quasi invisibles (fond très sombre `#2a2a2a`) → recolorées en
   boîtier clair. Plots du connecteur en grand trou noir → refaits pleins or.
   Trois éléments manquants ajoutés en CSS pur : connecteur micro-USB,
   indicateur du microphone (nouveauté V2), deuxième triangle d'accent en coin.
2. **« le bord inférieur n'est pas plat, il y a des encoches »** : le grand
   rayon de coin bas (25px) grignotait les coins de la réglette dorée en un
   arrondi parasite — réduit à 6px. Conclusion **erronée** à ce stade (voir
   passe 8) : le diagramme alors utilisé ne montrait pas le bord « bosselé »
   propre au V2 (mentionné sur microbit.org), d'où l'hypothèse à tort qu'un
   bord plat était correct.
3. **Capture avant/dos envoyée, clarifiée « ce sont les 2 faces de la
   carte »** : le texte « V2 » est en réalité sérigraphié au **dos**, jamais
   sur la face avant simulée — déplacé de la carte vers une étiquette
   d'interface à côté du titre (`#mb-version-tag`).
4. **« pourquoi ne dessines-tu pas les encoches correctement »** : analyse
   pixel par pixel (Pillow) plutôt qu'une relecture à l'œil — le motif
   `repeating-linear-gradient` était trop dense/uniforme ; espacé pour
   imiter des dents individuelles.
5. **« c'est encore pire »** : l'espacement a révélé un défaut géométrique
   jusque-là masqué par la densité — les coins très arrondis (15px) de deux
   plots voisins se touchaient dans l'espace laissé par `space-around`,
   dessinant une pointe triangulaire parasite. Corrigé en séparant plots et
   dents en deux éléments distincts (`.mb-pin`, `.mb-dents`).
6. **« N'es-tu pas capable de le faire ? »** : téléchargement local du
   diagramme officiel + échantillonnage Pillow ciblé (bouton A, triangle
   d'accent) — a trouvé deux écarts réels invisibles sur petites captures :
   étiquettes A/B en triangle bleu avec lettre imprimée dedans (pas une
   lettre isolée), bouton à deux languettes au bord bas (pas 4 pastilles aux
   coins). Bleu d'accent corrigé à la valeur mesurée `rgb(1,145,220)`.
7. **« pourquoi refuses-tu de dessiner le connecteur ainsi ? » (capture
   jointe)** : cette capture montrait le style du **simulateur MakeCode
   officiel** (pxt-microbit), pas une photo du circuit imprimé — plots en
   dôme très arrondi, trou clair gris/blanc, dents confinées à une bande
   basse. Reconstruit en conséquence.
8. **« toujours pas », puis nouvelle capture confirmée comme référence** :
   cette capture montrait encore un **troisième style différent** — réglette
   plate (pas de dômes), dents fines denses sur toute la largeur, et surtout
   un **bord du bas onduleux** avec une encoche peu profonde sous chaque
   étiquette. Ce bord ondulé est exactement le « bord inférieur bosselé »
   propre au V2 mentionné dès le début sur microbit.org/fr (par opposition
   au bord plat du V1) — la conclusion de la passe 2 était donc fausse : ce
   diagramme-là ne montrait simplement pas ce détail, il n'était pas absent
   de la vraie carte. Après plusieurs échecs à obtenir cette forme en CSS
   (dégradés/`border-radius` qui ne collent jamais bien un bord ondulé),
   **le connecteur est passé en SVG** (`<path>` avec des arcs pour
   l'ondulation, motif de dents en `<pattern>` peint directement dans le
   tracé — donc jamais de débordement hors du contour, contrairement aux
   tentatives CSS précédentes). Les identifiants `#pin0`/`#pin1`/`#pin2`
   (écouteurs tactiles dans `un.js`) portés sur des `<rect>` transparentes
   superposées ; aucune modification JS nécessaire. Vérifié : `getElementById`
   fonctionne sur les éléments SVG comme sur des `<div>`, `mousedown`/`mouseup`
   synthétiques confirmés déclencher `window.simu_pin0_pressed`, rendu net à
   taille réelle comme en gros plan (vectoriel, pas de crénelage).
9. **« le problème d'encoches est résolu mais maintenant il y a un problème
   au niveau de l'affichage des broches »** : régression réelle introduite
   par le passage en SVG (passe 8), pas trouvée par les tests de la passe 8
   (qui vérifiaient seulement que le clic déclenchait bien
   `window.simu_pin0_pressed`, pas l'apparence). L'ancien `.mb-pin:active {
   filter: brightness(0.8) }` sur un `<div>` plein n'a pas d'équivalent
   direct sur un `<rect>` SVG à `fill="transparent"` : rien à assombrir. Au
   clic, plus aucun retour visuel sur la broche pressée, alors que la
   fonction marchait toujours (confirmé par `MouseEvent` synthétique avant
   de corriger : `pressed` passait bien à `true`, seul le rendu ne bougeait
   pas). Corrigé dans `lierCapteurTactile()` (`un.js`) en posant/retirant
   explicitement une classe (`mb-edge-zone-active`, remplie
   `rgba(0,0,0,0.28)`) sur `mousedown`/`mouseup`/`mouseleave`, plutôt que de
   compter sur `:active` seul — plus fiable, et surtout testable par les
   mêmes événements synthétiques qui avaient validé la fonction.
10. **« je veux ça » (capture jointe, sans ambiguïté cette fois)** : combine
    en réalité les deux styles précédents plutôt que d'en remplacer un par
    l'autre — le dôme rond à trou clair de la passe 6/7 **et** le bord bas
    onduleux « bosselé » de la passe 8. Le SVG existant (passe 8) a été
    étendu plutôt que reconstruit : la bande à dents onduleuse reste
    inchangée (fond, `y` décalé de +18 pour laisser la place aux dômes
    au-dessus), et cinq petits `<path>` en dôme (arc `A`) sont peints
    **par-dessus**, en or plein sans motif de dents, avec un léger
    chevauchement (10px) vers le bas pour ne laisser aucune couture visible
    avec la bande — même principe que la passe 5 (deux formes distinctes
    plutôt qu'un fond partagé retouché), mais cette fois en complément l'une
    de l'autre au lieu d'être des alternatives. Vérifié par capture d'écran
    à fort zoom, comparé côte à côte, et non-régression du retour visuel au
    clic (passe 9) et de la génération de code confirmées.
11. **« c'est mieux mais, c'est pas encore correct »** : cette fois une
    mesure de proportions plutôt qu'une nouvelle capture — échantillonnage
    de colonnes verticales (Pillow) pour trouver où le fond passe du noir
    (au-dessus) à l'or des dents (en dessous), entre deux dômes. Mesuré
    ≈ 21 % de hauteur noire chez la référence contre 31 % dans notre rendu
    (frontière dôme/bande à `y=18` sur un total de 58) : les dômes étaient
    trop hauts par rapport à la bande à dents. Confirmé par l'utilisateur
    avant de corriger (question à choix : zone noire/dents, taille des
    dômes, ou autre — réponse « oui, la zone noire/dents »). Frontière
    ramenée à `y=12`, arcs des dômes passés en ellipse (`rx=18 ry=12` au
    lieu d'un cercle `18,18`) pour rester aussi larges mais moins hauts,
    trou et étiquettes repositionnés en conséquence. Vérifié par capture
    d'écran à fort zoom et sur la réglette complète.
12. **Nombre exact de petites pistes précisé par l'utilisateur** : « une
    piste à gauche du connecteur 0 ; entre 0 et 1, 4 pistes ; entre 1 et 2,
    5 ; entre 2 et 3V, 5 ; entre 3V et GND, 4 ; une piste à droite de GND ».
    Le motif `<pattern>` répété (une dent tous les 6px, sans se soucier du
    compte final dans chaque espace) ne pouvait pas garantir ce genre de
    nombre exact — remplacé par des `<rect>` individuels, un par dent,
    positionnés par calcul (chaque groupe de N dents réparti à intervalles
    égaux dans son espace disponible). Vérifié en comptant par le DOM
    (`querySelectorAll` sur les dents, tri des `x`) plutôt qu'à l'œil :
    1/4/5/5/4/1, conforme à la demande.
13. **« il n'y a pas 4 pistes dorées entre 0 et 1 ni entre 3v et GND »** :
    confusion de vocabulaire trouvée après coup — « piste » désigne le
    segment **doré** (la trace du connecteur), pas le trait **sombre**
    séparateur compté à la passe 12. Pour N pistes visibles et bien
    détachées dans un espace, il faut N+1 traits séparateurs (un contre
    chaque dôme voisin, pas seulement entre les pistes internes) : avec
    seulement N-1 traits internes (passe 12), la piste tout contre chaque
    dôme se fondait dans sa couleur, sans frontière visible — d'où N-1
    pistes clairement détachées à l'écran au lieu de N (invisible pour les
    groupes à 5, plus flagrant pour les groupes à 4). Recalculé en
    conséquence (24 traits au lieu de 20) et corrigé aussi l'ordre de
    peinture : les dômes sont maintenant peints AVANT les traits (pas
    après), pour qu'un trait collé pile sur le bord d'un dôme ne soit plus
    partiellement recouvert par lui. Vérifié par capture d'écran ciblée sur
    chaque groupe (0-1 et 3V-GND en particulier) et par comptage DOM des 24
    traits.
14. **« je veux que les 20 pistes dorées aient toutes la même largeur »** :
    avec des positions de dômes fixes et un espace identique (20px) pour
    chaque groupe interne, un groupe à 4 pistes et un groupe à 5 pistes ne
    peuvent **pas** avoir la même largeur de piste avec la même largeur de
    trait — plus de pistes dans le même espace donne forcément des pistes
    plus étroites. Recalculé en sens inverse : largeur de piste fixée à
    2,6 (constante voulue), largeur de trait fixée à 2, puis la largeur
    d'espace nécessaire déduite pour chaque groupe (4 pistes + 5 traits =
    20,4 ; 5 pistes + 6 traits = 25) — ce qui déplace les dômes eux-mêmes
    (ils ne sont plus espacés uniformément), avec un effet en cascade sur
    toutes les coordonnées dépendantes : les 5 chemins de dôme, les 20
    positions de traits séparateurs, les 5 trous clairs, les 5 étiquettes,
    les points de l'ondulation du bord bas (recalés sur les nouveaux
    centres de dôme, sinon l'encoche ne serait plus centrée dessous), et
    les 5 zones cliquables (bornées aux nouveaux milieux d'espace plutôt
    qu'à des tranches fixes de 56px). Vérifié par calcul direct sur le DOM
    plutôt qu'à l'œil : distance entre chaque paire de traits consécutifs
    (hors largeur des dômes eux-mêmes) — les 20 pistes mesurent exactement
    2,6 partout, aucune exception.
15. **« les connecteurs 0/1/2/3V/GND [doivent avoir] une largeur égale à 5
    fois la largeur d'une piste dorée »** : contrainte de ratio en plus des
    deux déjà acquises (largeur totale = 280, les 20 pistes égales entre
    elles) — un système à résoudre, pas une valeur à changer isolément.
    Largeur de trait gardée fixe (2), largeur de piste P et largeur de dôme
    5P posées comme inconnues, résolu via `45P + 24×2 = 280` (équation
    obtenue en sommant tous les espaces et dômes en fonction de P) →
    P ≈ 5,1556, dôme ≈ 25,78 (`rx` 12,89). Toutes les coordonnées
    dépendantes recalculées en cascade une nouvelle fois (dômes, traits,
    trous, étiquettes, ondulation du bord bas, zones cliquables) selon la
    même méthode que la passe 14. Vérifié par script : les 20 pistes
    mesurent 5,15–5,16 (uniforme), et largeur dôme ÷ largeur piste = 5,0
    exactement.

16. **Photo de la vraie carte fournie (oct. 2026), « je veux une représentation
    exacte »** : carte redessinée d'après la photo (maquette A choisie parmi deux) —
    triangles vert d'eau (`#1f9a80`, trois le long du bord haut), zone gris foncé et
    pistes de circuit discrètes (`.mb-pcb`), poussoirs à boîtier métallisé avec 4 plots
    et 4 pattes, LED CMS blanc cassé à pastille orange, logo et or mats (`#c39a45`),
    connecteur USB centré. Connecteur **mesuré sur la photo** (Pillow : profil de l'or
    colonne par colonne, courbe de luminosité le long de la bande pour les traits,
    photo inclinée d'environ 2° donc mesures prises côté pastilles 0 et 1) en gardant
    les règles validées aux passes 12 à 15 : 20 pistes égales, 1 / 4 / 5 / 5 / 4 / 1,
    pastille = 5 pistes. Changements : traits de 1,4 (au lieu de 2, d'où piste 5,48 et
    pastille 27,38) ; dômes = côtés droits + demi-cercle de rayon 13,69, sommet 21 au-
    dessus de la bande ; trous de rayon 10,2 (au lieu de 5) **découpés dans la carte**
    par un masque CSS (on voit le fond derrière, comme sur la vraie), l'ombre portée
    passant de `box-shadow` à `filter: drop-shadow` sur `#carte-cadre` pour suivre la
    découpe ; bande de 28 ; encoche à fond plat sous chaque pastille (3,6 de profondeur,
    17 de large) ; étiquettes toutes en 11 (3V et GND compris). Identifiants et zones
    cliquables conservés ; vérifié : `pin0` à `pin2`, logo et bouton A s'activent et
    se mettent en surbrillance, aucune erreur console.

Leçon retenue pour la suite : un même mot (« encoches », « bord ») a désigné
successivement trois défauts différents selon la capture en main à ce
moment-là — ne jamais supposer que deux signalements consécutifs parlent du
même défaut sans une capture ou un repère visuel précis à l'appui. Autre
leçon (passe 9) : un changement de balisage (`<div>` → SVG) peut préserver
la logique (l'ID, l'écouteur, la variable globale) tout en perdant un
comportement purement visuel qui reposait sur une propriété CSS différente
(`filter` sur un fond opaque vs `fill` sur un fond transparent) — tester
« ça déclenche toujours » ne suffit pas, il faut aussi retester « ça se
voit toujours » après ce genre de changement.

## À vérifier avec du matériel — je n'ai pas de carte

Rien de tout cela n'est douteux, mais rien n'est confirmé non plus.

1. **Le transfert réel** vers le lecteur MICROBIT (bouton « Envoyer sur la carte »).
   Toute la chaîne est testée sauf l'écriture sur le vrai volume.
2. **Le capteur de gestes PAJ7620.** Table d'initialisation reprise de la
   bibliothèque Seeed, logique de lecture conforme à la documentation, mais
   jamais confronté à la puce.
3. **Les six modules I²C** — AHT20/DHT20, LCD 16x2, VEML6040, DRV8830, SCD30,
   SCD41. Adresses et trames reprises des sources Seeed. Le simulateur valide la
   logique des blocs, pas le dialogue I²C.
4. **Le pilote TM1637** (afficheur 4 digits) : protocole bit-bangé sans
   temporisations explicites. Si l'afficheur reste éteint, c'est le premier
   endroit où regarder.
5. **Les servomoteurs** : conversion impulsion → `write_analog` jamais mesurée à
   l'oscilloscope.
6. **Le DHT11 et le DHT22.** Même pilote assembleur ARM Thumb (repris de
   rhubarbdog/microbit-dht11, MIT) pour capturer le signal, jamais exécuté sur
   une vraie carte ; seul le décodage des 5 octets diffère entre les deux
   capteurs, vérifié par calcul contre l'exemple du datasheet DHT22 (65,2 %,
   35,1 °C) mais pas sur un capteur réel. Sur V1 la source amont est réputée
   fonctionner ; sur V2 le pilote refuse volontairement la lecture (voir readme
   §7) au lieu de deviner un décalage bit-à-bit non vérifié. Visibles par
   défaut dans « Température & humidité », plus masqués séparément depuis que
   le sous-menu dédié a été fusionné avec AHT20/DHT20 — seuls le tooltip et le
   -1 renvoyé sur V2 avertissent maintenant. Si un V1 ou un DHT22 est
   disponible : poser le bloc, vérifier `temperature()`/`humidite()` contre un
   thermomètre, et surtout confirmer qu'un `write_digital`/`set_pull` répété ne
   perturbe pas un autre module câblé en même temps (`_dht_birq`/`_ubirq`
   coupent les interruptions le temps de la capture).
7. **La carte moteurs DFR0548** (oct. 2026). Canaux, impulsions, séquences et
   durées repris de la bibliothèque MakeCode officielle `DFRobot/pxt-motor`
   (`main.ts`). Vérifié : le pilote généré, exécuté avec un faux bus I²C, écrit
   exactement les mêmes registres que cette bibliothèque (initialisation 50 Hz,
   S1 → canal 15, S8 → canal 8, M1 → canaux 6/7, M2 → canaux 4/5, séquences 28BYJ-48
   et 42BYGH). Jamais exécuté sur une vraie carte. Si disponible : vérifier le sens
   « horaire » de chaque moteur, et surtout l'angle réel des pas à pas — la
   bibliothèque obtient l'angle par une durée (1 s par tour pour le 28BYJ-48),
   ce qui paraît très rapide pour ce moteur et doit être mesuré.
8. **La vue montage** (oct. 2026, `montage.js`, readme §44). Vérifié dans le
   navigateur intégré : carte Grove avec bouton, potentiomètre, ultrason, LED,
   OLED, LCD, buzzer sur P8 et barre de LED sur P8/P12 (« port partagé », « bus I2C
   partagé », « hors port Grove ») ; carte DFR0548 avec moteur M1, pas à pas
   M3 + M4, servo S2, modules sur P0 et P13, OLED ; la carte revient à sa place à
   la fermeture (Échap, focus rendu au bouton), boutons et broches cliquables dans
   le montage, thèmes sombre, clair et contraste élevé. Carte Grove redessinée
   ensuite dans Mode classe d'après les photos du produit (The Pi Hut, vue de dessus
   avec règle) : ports en bas, 8 pastilles pour pinces crocodile, modules en rangée
   sous leurs ports ; reprise ici à l'identique, non rouverte dans le navigateur
   (la rangée du bas, plus large, sert aussi aux servos de la DFR0548). Positions
   Grove mesurées sur photo, à quelques millimètres près ; la DFR0548 reste stylisée
   (aucune photo relevée).
   **BitMaker V2** et choix de la carte (boutons radio « Carte d'extension »,
   mémorisés dans `localStorage` sous `montageCarte`) : carte dessinée d'après la
   photo de dessus Seeed (`114992653_front-05`, 563 × 692 px pour 57 × 70 mm,
   chaque cote convertie depuis les pixels). Vérifié dans le navigateur : bouton
   sur ~P0, LED sur P12 (port ~P2), ultrason sur P8, OLED sur I2C, lumière sur
   P15, potentiomètre sur ~P1, joystick X/Y sur P1/P2, buzzer sur P13 (« P13
   réservée aux LED de la carte ») ; bascule Grove ↔ BitMaker mémorisée, choix
   remplacé par la phrase DFR0548 dès qu'un bloc DFR0548 est posé, étiquettes de
   44 px, thèmes sombre et clair. À comparer avec une vraie carte : sens des fils
   de chaque port (lu sur la sérigraphie, de haut en bas).
   Ruban sur P13 avec la BitMaker = les 4 LED de la carte : vérifié en lançant la
   simulation (LED 0 rouge et LED 2 verte, puis LED 1 bleue avec un ruban de 8 LED
   et la mention « la carte n'a que 4 LED »), extinction à la réinitialisation ;
   sur la carte Grove, le même ruban reste sur la pastille P13. Les couleurs sont
   recopiées de `#grove-ruban` (MutationObserver), sans toucher à `un.js`.
   **Montage dans la colonne** (maquette B choisie par l'utilisateur) : une seule
   scène, déplacée entre `#montage-colonne-zone` et la vue agrandie ; trois modes
   (carte seule, colonne, agrandi), seuil de 480 px avec 24 px d'hystérésis
   (ResizeObserver sur `#simulator-container`). Vérifié : montage BitMaker dans
   une colonne de 538 px, carte seule et bouton « Voir le montage » à 303 px,
   retour automatique en élargissant, « Agrandir » puis Échap ou « Fermer »
   (choix de la carte déplacé avec la scène, focus rendu au bon bouton), thèmes
   sombre et clair. Un premier essai de redimensionnement est resté sans effet
   dans le volet de test en arrière-plan (images suspendues) ; refait ensuite,
   les deux sens ont fonctionné. À revoir sur un vrai poste en faisant glisser la
   poignée de la colonne.
   **DFR0548 redessinée** d'après le schéma « Board Overview » du wiki DFRobot
   (750 × 673 px, carte de x 100 à 642 et de y 37 à 662, cotes converties depuis
   les pixels), tournée d'un demi-tour (connecteur en haut, sous la micro:bit).
   Vérifié dans le navigateur : moteurs M1 et M2, pas à pas 42BYGH sur M3 + M4,
   servos S1 et S8, bouton sur P0, ultrason sur P16, OLED sur l'IIC ; phrase
   DFR0548 à la place du choix de carte ; aucune erreur console. À comparer avec
   une vraie carte : l'ordre des vis du bornier (lu sur la sérigraphie du schéma,
   M4 2B- à M1 1A+ de gauche à droite avant le demi-tour).
   **Montage en direct** (variante 1 choisie par l'utilisateur : valeur sous le
   dessin). `majVivant()` recopie toutes les 200 ms l'affichage de
   « Périphériques » (lecteurs par module dans `LECTEURS`, clé du module dans
   `data-cle` : `1`..`4` pour les moteurs, `DFR S1`, `P0`...), sans toucher à
   `un.js`. Vérifié en simulation : roue du moteur M1 à 150, servo DFR S1 à 45°,
   LED P1 allumée, buzzer P2 qui sonne, OLED « Bonjour ! » ; ultrason et
   potentiomètre qui suivent leurs curseurs (repère du potentiomètre tourné) ;
   bouton P0 appuyé dans le montage → `simu_groveEntree('bouton')` = 1 puis 0 ;
   bouton du joystick au clavier (Espace) ; couleur de la valeur en sombre, clair
   et contraste élevé ; aucune erreur console. Piège de test : les blocs ajoutés
   par script n'émettent pas d'événement dans le navigateur intégré, le code
   n'est donc pas régénéré ; `workspace.fireChangeListener(new BlockMove(bloc))`
   le force, et le premier lancement après chargement par script reste muet
   (relancer).
   **Réglages des capteurs** (mélange choisi par l'utilisateur : liste réduite aux
   réglages + titre repliable, déplié par défaut, mémorisé sous
   `montageReglagesReplies`). `majReglages()` pose `montage-reglages` sur
   `#grove-panneau` en mode colonne ; les sections masquées restent mises à jour
   par `un.js`. Vérifié : LCD, bouton, ultrason, LED → la liste ne montre que
   l'ultrason et la case « maintenu enfoncé » ; repli et dépli mémorisés ; liste
   complète en vue agrandie ; LCD du montage bleu, texte blanc « Bonjour ».
9. **La carte Motor:bit V1.6** (oct. 2026, readme §45). Brochage repris de la
   documentation ELECFREAKS et du paquet MakeCode pxt-motorbit (M1 : P1 vitesse,
   P8 sens ; M2 : P2 vitesse, P12 sens), jamais exécuté sur une vraie carte.
   Vérifié dans le navigateur : code généré `_motorbit().moteur(1, 1, 150)` avec le
   pilote sur pin1 / pin8 ; M1 à ↻ 150 et M2 à ↺ 80 dans « Périphériques » et dans
   le montage ; Motor:bit imposée par ses blocs (phrase à la place du choix),
   choisie aussi par le bouton radio ; ultrason sur P13, OLED sur l'I2C P19 / P20,
   alertes « P0 : buzzer de la carte » et « P8 : moteur M1 » ; aucune erreur
   console. Dessin d'après le dessin coté du wiki ELECFREAKS (zXGYS2h.jpg, consulté
   dans le navigateur, non téléchargé). Si une carte est disponible : vérifier le
   sens « horaire » de chaque moteur et le niveau de P8 / P12.
10. **Catégorie « Cartes d'extension »** (oct. 2026, maquette A choisie par
   l'utilisateur) : « Carte moteurs DFR0548 » et « Carte moteurs Motor:bit » réunies
   dans une catégorie parente avec deux sous-catégories (DFR0548, Motor:bit), comme
   Grove ; couleurs des blocs inchangées. Repris de Mode classe, où il a été vérifié : colonne des
   catégories, tiroir Motor:bit (2 blocs, bleu), panneau administrateur (catégorie et
   ses deux sous-menus), aucune erreur console. Un réglage administrateur déjà fait
   sur une ancienne catégorie ne s'applique plus.
11. **Affichage du 31 oct. 2026** (readme §46) : charte Educatech pour le thème sombre
   par défaut (variables du salon appliquées aussi sans saison, thème Blockly `THEME_SALON`),
   logo sans pastille blanche (gardée en contraste élevé, bandeau noir), case « Agrandir »,
   zoom Ctrl + molette de la simulation (`zoomSim` dans `montage.js`, propriété CSS `zoom`
   sur `#carte-cadre`, échelle de la scène multipliée). Vérifié dans Mode classe : bandeau
   en dégradé, fonds bleu nuit, case cochée puis décochée par Échap, zoom 146 % puis
   retour à 100 % dans le montage, 121 % sur la carte seule, aucune erreur console.
   Thème clair ensuite (essai B montré avant modification) : bandeau Educatech et fonds
   gris doux (zone de blocs `#f2f2ef` dans le thème Blockly clair) ; contraste élevé inchangé.

## Écarté volontairement

| Module | Raison |
| --- | --- |
| **Vision AI V2** | pile SSCMA complète, JSON transporté par blocs sur I²C. Un projet en soi. |
| **UartWiFi** | initialiser l'UART sur des broches externes coupe la liaison série USB ; temporisations AT à régler avec le module en main. |
| **Import dans MakeCode** | formats incompatibles par construction, voir `readme.txt` §4. |

## Limites connues, sans remède prévu

- Le tiroir de la catégorie **Boucles** fait 406 px, imposé par `controls_for`,
  un bloc natif de Blockly. Les autres catégories sont sous 400 px.
- La **corbeille** dépasse de 4 px à droite du canevas : marge calculée par
  Blockly, sans réglage exposé.
- L'envoi sur la carte demande **Chrome ou Edge**. Firefox et Safari n'ont pas
  l'API d'accès aux fichiers ; le bouton y est désactivé.
- Après chaque transfert, le lecteur se démonte et se remonte : il faut le
  redésigner au clic suivant. C'est le comportement de la carte, pas un défaut.
- Le mode administrateur n'a **aucune sécurité réelle** : l'app est 100 %
  cliente, le raccourci Ctrl+Alt+Maj+A n'est qu'une dissuasion contre un clic
  accidentel d'élève, pas une authentification. La config est en localStorage,
  donc propre à chaque navigateur/poste : pas de partage automatique entre
  postes d'une salle.

## Reprendre dans une nouvelle conversation

Donner ces trois fichiers comme point de départ :

```
C:\Users\jreyn\OneDrive\Documents\claude\easybloc_ts_adacraft_vilain\ETAT_DU_PROJET.md
C:\Users\jreyn\OneDrive\Documents\claude\easybloc_ts_adacraft_vilain\readme.txt
C:\Users\jreyn\OneDrive\Documents\claude\easybloc_ts_adacraft_vilain\PROMPT_RECREATION.md
```

Puis préciser ce qu'on veut faire. Le code lui-même est commenté en français, en
expliquant les raisons plutôt que le fonctionnement — c'est là que se trouve le
détail des choix.

Rappel de méthode utile : **rien n'est considéré comme fonctionnel sans mesure**.
Pour le `.hex`, relire le fichier produit ; pour les blocs, générer chacun seul ;
pour la mise en page, comparer les dimensions au conteneur.

## Détail agaçant à connaître

Le navigateur garde `un.js`, `deux.js`, `bandeau.js`, `exercices.js` et `firmware.hex` en cache. Après toute
modification, recharger par **Ctrl+Maj+R**, sinon on teste l'ancienne version.
Le firmware est désormais lu en `no-store`, mais pas les scripts.

`app.py` utilisait `socketserver.TCPServer`, **mono-thread** : le navigateur
ouvrant plusieurs connexions en parallèle pour charger `trois.js`, `deux.js`
et `un.js`, le serveur restait bloqué sur la première (gardée ouverte en
HTTP/1.1 keep-alive) et ne répondait jamais aux autres — `index.html`
s'affichait (première requête servie), mais l'espace de travail Blockly
restait vide indéfiniment, `un.js` n'étant jamais exécuté. Pas qu'un souci de
test occasionnel : n'importe quel navigateur peut déclencher ce blocage dès
le tout premier chargement. Corrigé en ajoutant `socketserver.ThreadingMixIn`
à `Serveur` — écarté un temps par crainte d'un accès concurrent au lecteur de
carte dans `deux.js`, mais ce lecteur est piloté côté navigateur (File System
Access API) : le serveur Python ne fait que servir des fichiers statiques en
lecture seule, sans état partagé entre requêtes, donc rien à protéger.
