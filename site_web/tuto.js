// tuto.js — visites guidees (generale, IA, console, clic droit), toutes dans le menu Aide de la barre d'outils.
//
// Une bulle explicative se place a cote de l'element presente, qui est mis en
// evidence (le reste de l'ecran est assombri). Le voile ne bloque PAS les clics :
// l'utilisateur manipule les vrais outils (glisser un bloc, lancer la simulation...).
// Certaines etapes attendent une action reelle ; le bouton « Suivant » reste
// toujours disponible pour ne jamais coincer quelqu'un.
//
// Une visite MONTRE ce dont elle parle (etape 11, nov. 2026, modele EasyBloc R4) : elle ouvre la vraie
// fenetre derriere la bulle (fenetre IA, console : sans allumer camera ni micro), ou dessine un menu du clic
// droit simule, construit a partir du vrai menu de Blockly (decor.menu).
//
// Pour ajouter ou modifier une etape : une entree dans ETAPES_GENERAL, ETAPES_IA, ETAPES_CONSOLE ou ETAPES_CLIC_DROIT.
//   titre, texte  : contenu de la bulle (texte simple, traduit par langue.js : cle = texte francais exact)
//   cible         : selecteur CSS, ou fonction renvoyant un element ou une zone (absent = bulle centree)
//   avant()       : prepare l'ecran (ouvrir un panneau...) quand l'etape s'affiche
//   decor         : { menu: 'bloc' | 'fond', surligne: /texte a mettre en evidence/ } — menu du clic droit simule,
//                   retire des que le vrai menu s'ouvre
//   attendre()    : renvoie true quand l'action demandee est faite (« Bien joué »)
//   attendreClic  : selecteur d'un element dont le clic valide l'etape
//   consigne      : phrase d'action affichee en gras sous le texte
// Pas d'emoji dans les textes (regle du logiciel) : seuls les signes ▸ ▾ ◀ ▶ ✕ ✓ sont permis.

const $ = (sel, racine = document) => racine.querySelector(sel);

const bouton = id => document.getElementById(id);
// Texte affiche dans la langue choisie (langue.js) : les verifications des etapes comparent au texte traduit.
const trad = t => (typeof window.tr === 'function' ? window.tr(t) : t);
const panneauOuvert = (btnId) => { const b = bouton(btnId); return !!b && !b.classList.contains('inactif'); };
function ouvrir(btnId) { const b = bouton(btnId); if (b && b.classList.contains('inactif')) b.click(); }

// Ligne de la boite a outils (colonne de categories) portant ce nom.
function categorie(nom) {
    for (const e of document.querySelectorAll('.blocklyToolboxCategory')) {
        const lib = $('.blocklyTreeLabel', e);
        // En anglais (langue.js), le libelle affiche est traduit : on compare aux deux
        if (lib && (lib.textContent.trim() === nom || lib.textContent.trim() === trad(nom))) return e;
    }
    return null;
}

// Zone qui englobe plusieurs elements (pour eclairer deux boutons voisins d'un coup). Elle se comporte comme un
// element pour la visite : rectangle (getBoundingClientRect) et parent (closest) du premier element.
function zone(...selecteurs) {
    const els = selecteurs.map(s => (typeof s === 'string' ? $(s) : s)).filter(e => e && e.getBoundingClientRect().width > 0);
    if (!els.length) return null;
    return {
        closest: s => els[0].closest(s),
        scrollIntoView: o => els[0].scrollIntoView(o),
        getBoundingClientRect: () => {
            const rs = els.map(e => e.getBoundingClientRect());
            const g = Math.min(...rs.map(r => r.left)), h = Math.min(...rs.map(r => r.top));
            const d = Math.max(...rs.map(r => r.right)), b = Math.max(...rs.map(r => r.bottom));
            return { left: g, top: h, right: d, bottom: b, width: d - g, height: b - h };
        },
    };
}

const blocs = () => (window.workspace ? window.workspace.getAllBlocks(false) : []);
const racineEst = (b, types) => types.includes(b.getRootBlock().type);
// Fiche du bloc (« Expliquer ce bloc ») ou, a defaut de fiche, ancienne fenetre d'aide
const ficheOuverte = () => ['#voile-fiche', '#voile-aide'].some(s => { const v = $(s); return !!v && v.classList.contains('ouvert'); });
function fermerFiche() {
    const v = $('#voile-fiche');
    if (v && v.classList.contains('ouvert')) { const f = $('#fiche-fermer'); if (f) f.click(); }
    const a = $('#voile-aide');
    if (a && a.classList.contains('ouvert')) { const f = $('#aide-fermer'); if (f) f.click(); }
}

const ETAPES_GENERAL = [
    {
        titre: 'Bienvenue',
        texte: 'Cette visite guidée présente les outils du logiciel, en 12 étapes. Vous pouvez manipuler le logiciel ' +
            'pendant la visite. « Suivant » passe à l\'étape d\'après sans rien faire, « Quitter » (ou la touche Échap) ' +
            'arrête la visite ; le menu « Aide » > « Visite guidée » la relance quand vous voulez.',
    },
    {
        titre: '1. Les catégories de blocs',
        texte: 'Les blocs sont rangés par catégories dans cette colonne : Boucles, Temps, Matrice LED, Capteurs… ' +
            'Cliquer sur une catégorie ouvre la liste de ses blocs. Les blocs se prennent avec la souris et se ' +
            'déposent dans la grande zone de droite.',
        cible: () => $('.blocklyToolboxDiv'),
        consigne: 'Cliquez sur « Boucles » pour voir ses blocs.',
        attendre: () => {
            const boite = window.workspace && window.workspace.getToolbox && window.workspace.getToolbox();
            const tiroir = boite && boite.getFlyout && boite.getFlyout();
            return !!(tiroir && tiroir.isVisible());
        },
    },
    {
        titre: '2. Votre premier programme',
        texte: 'Un programme commence par le bloc « au démarrage » (exécuté une fois) et le bloc « répéter ' +
            'indéfiniment » (catégorie Boucles), accroché en dessous. Les autres blocs s\'emboîtent dedans, comme des ' +
            'pièces de puzzle. Un bloc posé seul, hors de ces blocs, est grisé et n\'est pas exécuté.',
        cible: '#blocklyDiv',
        consigne: 'Glissez le bloc « afficher l\'icône » (catégorie Matrice LED) dans le bloc « au démarrage ».',
        attendre: () => blocs().some(b => b.type === 'afficher_icone' && racineEst(b, ['au_demarrage', 'boucle_infinie'])),
    },
    {
        titre: '3. Le code MicroPython',
        texte: 'Pendant que vous placez des blocs, leur traduction en MicroPython (le vrai code qui tourne sur la ' +
            'carte) apparaît ici, en direct. Le bouton « ✎ Éditer » permet de l\'écrire à la main. Le bouton du code, ' +
            'dans la barre d\'outils, affiche ou masque ce panneau.',
        cible: '#code-container',
        avant: () => ouvrir('btn-vue-code'),
    },
    {
        titre: '4. Le simulateur',
        texte: 'Cette carte micro:bit virtuelle exécute votre programme sans matériel : matrice de LED, boutons A et B, ' +
            'logo tactile, broches. Les modules Grove utilisés par le programme apparaissent dans le montage, branchés ' +
            'sur la carte ; le tableau « Périphériques » montre leur état et règle leurs mesures.',
        cible: '#simulator-container',
        avant: () => ouvrir('btn-vue-simu'),
    },
    {
        titre: '5. Lancer la simulation',
        texte: 'Ce bouton démarre le programme sur la carte virtuelle ; pendant la simulation, il sert à l\'arrêter.',
        cible: '#tb-lancer',
        avant: () => ouvrir('btn-vue-simu'),
        consigne: 'Cliquez sur « Lancer la simulation » : le cœur doit s\'afficher sur les LED.',
        attendreClic: '#tb-lancer',          // le programme d'exemple se termine tout de suite : on attend le clic, pas l'etat
    },
    {
        titre: '6. Boutons, gestes et capteurs',
        texte: 'Cliquez sur les boutons A et B de la carte virtuelle, ou sur « Secouer la carte », pour tester les blocs ' +
            '« lorsque le bouton… » et « lorsque… » (catégorie Capteurs). Les modules du montage se manipulent à la ' +
            'souris : tourner un potentiomètre, appuyer sur un bouton poussoir…',
        cible: '#simulateur-actions',
        avant: () => ouvrir('btn-vue-simu'),
    },
    {
        titre: '7. La console',
        texte: 'Le bloc « afficher dans la console » (catégorie Matrice LED) écrit des messages ici, depuis le simulateur ' +
            'ou depuis la vraie carte branchée en USB (bouton « Connecter »). L\'onglet « Graphique » trace les ' +
            'valeurs en courbes, et le bouton d\'export les enregistre dans un fichier Excel.',
        cible: '#btn-vue-console',
        consigne: 'Cliquez sur le bouton de la console, dans la barre d\'outils.',
        attendre: () => panneauOuvert('btn-vue-console'),
    },
    {
        titre: '8. Enregistrer et ouvrir',
        texte: 'Le menu « Fichier » commence un nouveau projet, charge un fichier .hex ou un script .py, et télécharge ' +
            'le programme (.hex pour la carte, .py pour un éditeur Python). Le nom du programme, affiché à côté, ' +
            'devient le nom du fichier téléchargé : cliquez dessus pour le changer.',
        cible: () => zone('#menu-fichier-btn', '#tb-nomfichier'),
    },
    {
        titre: '9. Envoyer sur la carte',
        texte: 'Branchez la micro:bit en USB : le bouton « Téléverser » écrit directement le programme sur le lecteur ' +
            'MICROBIT (Chrome ou Edge). C\'est comme glisser le fichier .hex sur la carte.',
        cible: '#btn-envoyer',
    },
    {
        titre: '10. L\'intelligence artificielle',
        texte: 'La fenêtre IA reconnaît des images (caméra) ou des sons (micro). L\'onglet « IA » apprend vos propres ' +
            'classes (quelques photos ou quelques sons par classe, sans entraînement) ; l\'onglet « QR code » lit des ' +
            'QR codes. Les classes reconnues déclenchent vos blocs.',
        cible: '#ia-fenetre',
        avant: () => { if (window.ouvrirPanneauIA) window.ouvrirPanneauIA(); },
    },
    {
        titre: '11. Les blocs IA',
        texte: 'La catégorie « IA » contient « lorsque l\'IA reconnaît… » (à compléter avec le nom d\'une classe), ' +
            '« l\'IA reconnaît », « dernière classe reconnue » et « confiance de l\'IA », puis trois blocs pour les QR codes. ' +
            'Lancez la simulation, puis la comparaison dans la fenêtre IA : les classes pilotent le programme.',
        cible: () => categorie('IA'),
    },
    {
        titre: '12. De l\'aide partout',
        texte: 'Clic droit sur un bloc > « Expliquer ce bloc » : la fiche du bloc, avec un programme d\'exemple à essayer ' +
            'd\'un clic. Les boutons « ? » de la console et de la fenêtre IA ouvrent leur aide. Les flèches de la barre du ' +
            'haut défont et refont ; le menu « Affichage » règle le thème et le contraste ; le drapeau change la langue.',
        cible: '#blocklyDiv',
        decor: { menu: 'bloc', surligne: /Expliquer ce bloc|Explain this block/ },
    },
    {
        titre: 'C\'est terminé',
        texte: 'Vous connaissez l\'essentiel. Le menu « Aide » > « Visite guidée » relance la visite à tout moment.',
    },
];

// ---------- visite guidee de la partie IA (menu Aide > Visite guidee IA) ----------
const colVision = '.ia-colonne[data-genre="vision"]';
const colImm = '.ia-colonne[data-genre="immediat"]';
const colQR = '.ia-colonne[data-genre="qr"]';
const ouvrirCreation = genre => { const d = $('.ia-colonne[data-genre="' + genre + '"] .ia-creer'); if (d) d.open = true; };
const panneauIA = () => { if (window.ouvrirPanneauIA) window.ouvrirPanneauIA(); };

const ETAPES_IA = [
    {
        titre: 'L\'intelligence artificielle',
        texte: 'Cette visite montre comment faire reconnaître des images (caméra) ou des sons (micro) à votre programme. ' +
            'Principe : la reconnaissance se fait sur l\'ordinateur ; la carte micro:bit (ou le simulateur) reçoit seulement ' +
            'le nom de la classe reconnue, et vos blocs réagissent. L\'image et le son ne quittent jamais votre ordinateur. ' +
            'Il faut une caméra ou un micro pour essayer.',
    },
    {
        titre: '1. Ouvrir la fenêtre IA',
        texte: 'Le bouton « IA » de la barre d\'outils ouvre la fenêtre IA ; « Terminé » la ferme (une reconnaissance en cours continue).',
        cible: '#btn-vue-ia',
        consigne: 'Cliquez sur « IA » pour ouvrir la fenêtre.',
        attendre: () => panneauOuvert('btn-vue-ia'),
    },
    {
        titre: '2. Les onglets',
        texte: '« IA » apprend vos propres classes avec la caméra (objets, signes de la main, positions des bras) ' +
            'ou le micro (sons et mots). « QR code » lit et crée des QR codes. Deux onglets « Teachable Machine », pour ' +
            'charger un modèle déjà fait, apparaissent quand on coche la case prévue, en bas de l\'onglet « IA ». ' +
            'Tous envoient leur résultat aux blocs de la catégorie « IA ».',
        cible: '#ia-onglets',
        avant: panneauIA,
    },
    {
        titre: '3. Créer ses classes : caméra ou micro',
        texte: 'L\'apprentissage immédiat n\'a pas besoin d\'entraînement : chaque exemple compte aussitôt. Choisissez d\'abord ' +
            'ce que l\'IA doit reconnaître : « Des objets ou des images », « Des signes de la main », « Des positions des bras » ' +
            '(caméra) ou « Des sons ou des mots » (micro). La caméra et le micro ne s\'allument que si vous cliquez ' +
            '(« Allumer la caméra », « Une photo », « Enregistrer »). Le navigateur demande l\'autorisation.',
        cible: colImm + ' .ia-imm-camera',
        avant: () => { panneauIA(); ouvrirCreation('immediat'); },
        consigne: 'Cliquez sur « Allumer la caméra » et autorisez-la (ou choisissez les sons et allumez le micro).',
        attendre: () => [colImm + ' .ia-imm-cadre', colImm + ' .ia-imm-niveau'].some(sel => { const c = $(sel); return !!c && !c.classList.contains('replie') && !c.classList.contains('eteint') && c.getBoundingClientRect().width > 0; }),
    },
    {
        titre: '4. Ajouter des exemples',
        texte: 'Chaque carte est une classe. Cliquez sur son nom pour le changer (par exemple « main », puis « fond ») : les blocs ' +
            'qui l\'utilisent suivent. Placez devant la caméra ce qu\'elle doit reconnaître : « Une photo » ajoute un exemple à ' +
            'chaque clic, « Plusieurs photos » en ajoute en rafale jusqu\'à « Arrêter ». Variez l\'angle, la distance, la lumière. ' +
            '« Ajouter des images » prend des fichiers. Pour les sons : « Enregistrer », faites le son plusieurs fois avec un court ' +
            'silence entre deux, puis « Arrêter ». Chaque exemple apparaît en vignette : cliquer dessus le supprime. ' +
            '« + Ajouter une classe » en ajoute une (8 au plus). Pour les gestes et les positions, seul le squelette est gardé, ' +
            'jamais la photo.',
        cible: colImm + ' .ia-creer-classes',
        avant: () => { panneauIA(); ouvrirCreation('immediat'); },
        consigne: 'Ajoutez au moins 5 exemples à chacune des deux classes.',
        attendre: () => { const n = Array.from(document.querySelectorAll(colImm + ' .ia-ex-n')); return n.length >= 2 && n.filter(e => Number(e.textContent) >= 5).length >= 2; },
    },
    {
        titre: '5. Tester',
        texte: '« Démarrer la comparaison » lance la reconnaissance en continu : une barre par classe montre la confiance en direct, ' +
            'et la classe retenue est mise en évidence. Montrez vos objets ou vos gestes à la caméra (ou faites vos sons) pour vérifier. ' +
            'Si deux classes se confondent, ajoutez-leur des exemples : c\'est pris en compte aussitôt, sans rien relancer.',
        cible: colImm + ' .ia-demarrer',
        avant: panneauIA,
        consigne: 'Cliquez sur « Démarrer la comparaison » et testez.',
        attendre: () => { const b = $(colImm + ' .ia-demarrer'); return !!b && (b.textContent.includes('Arrêter') || b.textContent.includes(trad('Arrêter'))); },
    },
    {
        titre: '6. Le seuil de confiance',
        texte: 'En dessous de ce pourcentage, l\'IA considère qu\'elle ne reconnaît « rien » (classe vide). Un seuil élevé évite les ' +
            'fausses détections mais en rate davantage ; un seuil bas réagit plus vite mais se trompe plus souvent. ' +
            '80 % est un bon départ.',
        cible: '#ia-seuil-groupe',
        avant: panneauIA,
    },
    {
        titre: '7. Enregistrer l\'apprentissage',
        texte: 'L\'apprentissage est rangé tout seul dans le fichier .py quand vous téléchargez le programme (menu « Fichier »), ' +
            'et rechargé quand vous rouvrez ce .py. Il n\'est pas dans le .hex. Seuls des nombres sont gardés, jamais les images ' +
            'ni les sons.',
        cible: colImm + ' .ia-creer-classes',
        avant: () => { panneauIA(); ouvrirCreation('immediat'); },
    },
    {
        titre: '8. Exporter et importer un modèle',
        texte: '« Exporter le modèle », en bas de la fenêtre, enregistre l\'apprentissage dans un fichier .json à part, avec le ' +
            'nom que vous lui donnez : pour le garder, le partager ou le réutiliser dans un autre programme. « Importer un modèle » ' +
            'recharge un tel fichier ; après confirmation, il remplace les classes en cours.',
        cible: () => zone('#ia-pied .ia-imm-exporter', '#ia-pied .ia-imm-importer'),
        avant: () => { panneauIA(); if (window.iaOnglet) window.iaOnglet('immediat'); },
    },
    {
        titre: '9. Ou charger un modèle Teachable Machine',
        texte: 'Les onglets « Teachable Machine » (caméra et micro) utilisent un modèle fait sur le site Teachable Machine. ' +
            'Collez son adresse puis « Charger » (il faut Internet), ou cliquez « Fichiers… » et sélectionnez ses trois fichiers ' +
            '(model.json, metadata.json, weights.bin) à la fois : cela fonctionne sans Internet. Démarrer un modèle arrête ' +
            'l\'apprentissage immédiat du même genre, et inversement.',
        cible: colVision + ' .ia-modele',
        avant: panneauIA,
    },
    {
        titre: '10. Les sons',
        texte: 'Les sons et les mots s\'apprennent aussi dans l\'onglet « IA » : choisissez « Des sons ou des mots », allumez ' +
            'le micro, puis « Enregistrer » sous une classe et faites le son plusieurs fois. Pas besoin de classe « bruit de fond » : ' +
            'le silence ne déclenche rien. Un son reconnu le reste 1 seconde ; il pilote les blocs « son ». Rien n\'est enregistré, ' +
            'seul un dessin du timbre est gardé.',
        cible: colImm + ' .ia-imm-pastilles',
        avant: () => { panneauIA(); ouvrirCreation('immediat'); },
    },
    {
        titre: '11. Les QR codes',
        texte: '« Lire les codes » fait lire les QR codes et codes-barres à la caméra ; leur texte arrive dans le programme. ' +
            '« Créer un QR code à imprimer » en fabrique un (par exemple « avancer », « stop ») à montrer ensuite à la caméra.',
        cible: colQR,
        avant: panneauIA,
    },
    {
        titre: '12. Les blocs IA',
        texte: 'La catégorie « IA » de la boîte à outils contient quatre blocs : « lorsque l\'IA reconnaît… » (réagit au changement ' +
            'de classe), « l\'IA reconnaît… » (condition à placer dans un « si »), « dernière classe reconnue » (le nom) et ' +
            '« confiance de l\'IA » (0 à 100) ; puis trois blocs pour les QR codes.',
        cible: () => categorie('IA'),
        consigne: 'Cliquez sur la catégorie « IA ».',
        attendre: () => {
            const boite = window.workspace && window.workspace.getToolbox && window.workspace.getToolbox();
            const sel = boite && boite.getSelectedItem && boite.getSelectedItem();
            return !!(sel && sel.getName && sel.getName() === 'IA');
        },
    },
    {
        titre: '13. Réagir à une classe',
        texte: 'Glissez « lorsque l\'IA vision reconnaît … » dans la zone de blocs, puis choisissez la classe dans sa liste ' +
            '(ou « ✎ autre nom… » ; majuscules et accents sont sans importance). Mettez à l\'intérieur ce que doit faire la carte : ' +
            'par exemple « afficher l\'icône » (cœur). Un second bloc pour l\'autre classe, et le programme obéit à la caméra.',
        cible: '#blocklyDiv',
        consigne: 'Posez un bloc « lorsque l\'IA reconnaît » dans la zone de blocs.',
        attendre: () => blocs().some(b => b.type === 'ia_lorsque_reconnu'),
    },
    {
        titre: '14. Essayer dans le simulateur',
        texte: 'Lancez la simulation, puis la comparaison dans la fenêtre IA : quand la classe est reconnue, vos blocs s\'exécutent ' +
            'sur la carte virtuelle. Le simulateur doit être en marche, sinon les résultats ne lui sont pas transmis.',
        cible: '#tb-lancer',
        avant: () => ouvrir('btn-vue-simu'),
        consigne: 'Cliquez sur « Lancer la simulation ».',
        attendreClic: '#tb-lancer',
    },
    {
        titre: '15. Avec la vraie carte',
        texte: '1) Branchez la micro:bit en USB. 2) Dans la console, cliquez « Connecter ». 3) Téléversez le programme. ' +
            '4) Cochez « Envoyer à la carte » ici, puis lancez la comparaison. EasyBloc reste ouvert : il reconnaît et ' +
            'envoie à la carte le nom de la classe par le câble USB. Chrome ou Edge sont nécessaires.',
        cible: '#ia-carte-label',
        avant: panneauIA,
    },
    {
        titre: '16. Besoin d\'aide ?',
        texte: 'Le bouton « ? » de la fenêtre ouvre l\'aide complète de l\'IA. Clic droit sur un bloc IA > « Expliquer ce bloc » ' +
            'ouvre sa fiche, avec un exemple à essayer.',
        cible: '#btn-ia-aide',
        avant: panneauIA,
    },
    {
        titre: 'Vous savez tout faire',
        texte: 'Apprendre des classes ou charger un modèle, les tester, les exporter, programmer des réactions et les essayer dans ' +
            'le simulateur ou sur la carte. Cette visite se relance par le menu « Aide » > « Visite guidée IA ».',
    },
];

// ---------- visite guidee de la console (menu Aide > Visite guidee Console) ----------
const ouvrirConsole = () => ouvrir('btn-vue-console');
const menuContextuel = () => { const m = $('.blocklyContextMenu'); return m && m.offsetWidth > 0 ? m : null; };
const menuContient = texte => { const m = menuContextuel(); return !!m && (m.textContent.includes(texte) || m.textContent.includes(trad(texte))); };

const ETAPES_CONSOLE = [
    {
        titre: 'La console',
        texte: 'La console affiche les messages de votre programme : valeurs de capteurs, étapes, résultats… C\'est l\'outil pour ' +
            '« voir ce que fait le programme », dans le simulateur comme sur la vraie carte. Elle peut aussi tracer des courbes, ' +
            'exporter vers Excel et envoyer du texte à la carte. Cette visite vous guide pas à pas.',
    },
    {
        titre: '1. Ouvrir la console',
        texte: 'La console se place en bas du logiciel. Le bouton de la console, dans la barre d\'outils, l\'affiche ou la masque. ' +
            'Elle s\'ouvre aussi toute seule à la première ligne reçue (sauf si vous l\'avez fermée vous-même).',
        cible: '#btn-vue-console',
        avant: () => { const b = bouton('btn-vue-console'); if (b && !b.classList.contains('inactif')) b.click(); },   // repart console fermee
        consigne: 'Cliquez sur le bouton de la console.',
        attendre: () => panneauOuvert('btn-vue-console'),
    },
    {
        titre: '2. Le bloc « afficher dans la console »',
        texte: 'C\'est lui qui écrit dans la console. Il se trouve dans la catégorie « Matrice LED » : il prend un texte ou une valeur ' +
            '(un capteur, un nombre, une variable…) et écrit une ligne à chaque exécution.',
        cible: () => categorie('Matrice LED'),
        consigne: 'Cliquez sur la catégorie « Matrice LED ».',
        attendre: () => {
            const boite = window.workspace && window.workspace.getToolbox && window.workspace.getToolbox();
            const sel = boite && boite.getSelectedItem && boite.getSelectedItem();
            return !!(sel && sel.getName && sel.getName() === 'Matrice LED');
        },
    },
    {
        titre: '3. Poser le bloc',
        texte: 'Glissez « afficher dans la console » dans « répéter indéfiniment » (ou « au démarrage »). Emboîtez-y un bloc de texte ' +
            '(catégorie Texte) ou un capteur, par exemple « température » (catégorie Capteurs). Ajoutez un bloc « attendre » d\'une ' +
            'seconde en dessous : sans pause, le programme écrirait des centaines de lignes à la seconde.',
        cible: '#blocklyDiv',
        consigne: 'Posez un bloc « afficher dans la console » dans votre programme.',
        attendre: () => blocs().some(b => b.type === 'afficher_console' && racineEst(b, ['au_demarrage', 'boucle_infinie'])),
    },
    {
        titre: '4. Lancer la simulation',
        texte: 'Les lignes apparaissent dans la console, dans l\'ordre où le programme les écrit. Lancer la simulation efface ' +
            'd\'abord la console. Seules les 1000 dernières lignes sont conservées.',
        cible: '#tb-lancer',
        avant: () => { ouvrir('btn-vue-simu'); ouvrirConsole(); },
        consigne: 'Cliquez sur « Lancer la simulation ».',
        attendreClic: '#tb-lancer',
    },
    {
        titre: '5. La zone de texte',
        texte: 'Les lignes du simulateur s\'affichent en clair. Celles de la vraie carte sont en vert, les informations en gris italique. ' +
            'La poignée en bas à droite de la zone permet de l\'agrandir (la zone de blocs se réduit d\'autant).',
        cible: '#console-sortie',
        avant: ouvrirConsole,
    },
    {
        titre: '6. L\'onglet Graphique',
        texte: 'L\'onglet « Graphique » trace en courbes les valeurs numériques de la console, au fil du temps (axe horizontal en ' +
            'secondes). Formats reconnus : un nombre par ligne (21.5), plusieurs courbes (12 40 7 ou (12, 40, 7)) ou des courbes ' +
            'nommées (temp:21 lum:40). Les autres lignes sont ignorées. Pour tracer une mesure, écrivez-la dans une boucle avec une pause.',
        cible: '#onglet-console-graphique',
        avant: ouvrirConsole,
        consigne: 'Cliquez sur l\'onglet « Graphique ».',
        attendre: () => { const b = $('#onglet-console-graphique'); return !!b && b.classList.contains('actif'); },
    },
    {
        titre: '7. Effacer la console',
        texte: 'La corbeille efface toutes les lignes de la console, y compris celles de la carte. Avant chaque simulation, la ' +
            'console est aussi effacée toute seule.',
        cible: '#btn-console-effacer',
        avant: () => { ouvrirConsole(); const t = $('#onglet-console-texte'); if (t) t.click(); },
    },
    {
        titre: '8. Exporter vers Excel',
        texte: 'Le bouton avec le petit graphique enregistre toutes les lignes affichées dans un fichier Excel (.xlsx) : numéro, ' +
            'heure, source (Simulateur, Carte ou Information), texte, et une colonne « Valeur numérique » remplie quand la ligne ' +
            'est un nombre : pratique pour faire des tableaux et des courbes de mesures.',
        cible: '#btn-console-exporter',
        avant: () => { ouvrirConsole(); const t = $('#onglet-console-texte'); if (t) t.click(); },
    },
    {
        titre: '9. Lire la vraie carte',
        texte: '1) Branchez la micro:bit en USB. 2) Cliquez « Connecter » et choisissez la carte dans la liste (Chrome ou Edge ' +
            'seulement). 3) Téléversez le programme : la carte redémarre et la console se reconnecte toute seule. ' +
            'Ses messages s\'affichent en vert. Si la connexion échoue, un autre onglet ou logiciel utilise déjà la carte : fermez-le.',
        cible: '#btn-console-carte',
        avant: ouvrirConsole,
    },
    {
        titre: '10. Envoyer du texte à la carte',
        texte: 'Une fois la carte connectée, ce champ lui envoie du texte (Entrée ou « Envoyer »). La carte ne le lit que si le ' +
            'programme attend une saisie, ou si elle est en mode REPL (programme arrêté). Le texte envoyé s\'affiche en gris, ' +
            'précédé de « > ».',
        cible: '#console-saisie',
        avant: ouvrirConsole,
    },
    {
        titre: '11. L\'aide et la fermeture',
        texte: 'Le bouton « ? » ouvre l\'aide complète de la console. La croix ✕ masque la console : elle ne se rouvrira alors plus ' +
            'toute seule, il faudra cliquer sur le bouton de la console.',
        cible: '#btn-console-aide',
        avant: ouvrirConsole,
    },
    {
        titre: 'Vous maîtrisez la console',
        texte: 'Afficher, tracer, exporter, lire la carte et lui répondre. Cette visite se relance par le menu « Aide » > ' +
            '« Visite guidée Console ».',
    },
];

// ---------- visite guidee du clic droit (menu Aide > Visite guidee clic droit) ----------
let nbBlocsDepart = 0;
const ETAPES_CLIC_DROIT = [
    {
        titre: 'Le clic droit',
        texte: 'Un clic droit (bouton droit de la souris) ouvre un menu d\'actions rapides. Il change selon l\'endroit : sur un bloc, ' +
            'ou sur le fond de la zone de blocs. Cette visite montre les actions utiles. Vous pouvez les essayer sur vos blocs : ' +
            '« Annuler » (Ctrl+Z) rattrape toute erreur.',
    },
    {
        titre: '1. Clic droit sur un bloc',
        texte: 'Placez le pointeur sur un bloc, puis appuyez sur le bouton droit de la souris : un menu apparaît à côté du bloc, ' +
            'comme celui dessiné ici. Dupliquer : copie le bloc et son contenu. Expliquer ce bloc : sa fiche. Ajouter un ' +
            'commentaire : une note attachée au bloc. Entrées en ligne : change la forme du bloc. Réduire : replie le bloc sur ' +
            'une ligne. Désactiver : le bloc est ignoré. Supprimer : retire le bloc et son contenu. Une entrée grisée est ' +
            'impossible ici : « au démarrage » ne se duplique pas, il n\'en faut qu\'un.',
        cible: '#blocklyDiv',
        decor: { menu: 'bloc' },
        consigne: 'Faites un clic droit sur un bloc (par exemple « au démarrage »).',
        attendre: () => !!menuContextuel() && (menuContient('Expliquer ce bloc') || menuContient('Aide sur ce bloc')),
    },
    {
        titre: '2. Expliquer ce bloc',
        texte: 'Cette entrée ouvre la fiche du bloc : à quoi il sert, comment l\'utiliser, ce qu\'il faut savoir, et un programme ' +
            'd\'exemple à essayer d\'un clic. Refermez la fiche avec « Fermer » ou la touche Échap.',
        cible: () => menuContextuel() || $('#blocklyDiv'),
        decor: { menu: 'bloc', surligne: /Expliquer ce bloc|Explain this block/ },
        consigne: 'Dans le menu, cliquez « Expliquer ce bloc » (faites d\'abord un clic droit sur un bloc si le menu est fermé).',
        attendre: ficheOuverte,
    },
    {
        titre: '3. Dupliquer un bloc',
        texte: 'Dupliquer copie le bloc avec son contenu : pratique pour répéter un bloc « afficher l\'icône » ou un « si ». ' +
            'La copie apparaît juste à côté, à déplacer ensuite.',
        cible: '#blocklyDiv',
        avant: () => { fermerFiche(); nbBlocsDepart = blocs().length; },
        decor: { menu: 'bloc', surligne: /Dupliquer|Duplicate/ },
        consigne: 'Clic droit sur un bloc autre que « au démarrage » (par exemple « répéter indéfiniment ») > « Dupliquer ».',
        attendre: () => blocs().length > nbBlocsDepart,
    },
    {
        titre: '4. Ajouter un commentaire',
        texte: 'Un commentaire est une note attachée à un bloc (une icône « ? » apparaît sur le bloc). Il explique à quoi sert ' +
            'ce bloc, pour vous ou pour quelqu\'un qui relit le programme. Le commentaire n\'est pas exécuté.',
        cible: '#blocklyDiv',
        decor: { menu: 'bloc', surligne: /commentaire|comment/i },
        consigne: 'Clic droit sur un bloc > « Ajouter un commentaire ».',
        attendre: () => blocs().some(b => typeof b.getCommentText === 'function' && b.getCommentText() !== null),
    },
    {
        titre: '5. Réduire un bloc',
        texte: 'Réduire replie un bloc (et ce qu\'il contient) sur une seule ligne : pratique pour garder un grand programme lisible. ' +
            'Le programme s\'exécute toujours normalement. « Développer le bloc » le déplie.',
        cible: '#blocklyDiv',
        decor: { menu: 'bloc', surligne: /Réduire|Collapse/ },
        consigne: 'Clic droit sur un bloc qui en contient d\'autres > « Réduire le bloc ».',
        attendre: () => blocs().some(b => typeof b.isCollapsed === 'function' && b.isCollapsed()),
    },
    {
        titre: '6. Désactiver un bloc',
        texte: 'Un bloc désactivé devient grisé et n\'est plus exécuté, ni dans le simulateur ni dans le code envoyé à la carte. C\'est ' +
            'utile pour tester une idée sans effacer ce qu\'on avait. Clic droit > « Activer le bloc » pour le remettre.',
        cible: '#blocklyDiv',
        decor: { menu: 'bloc', surligne: /Désactiver|Disable/ },
        consigne: 'Clic droit sur un bloc > « Désactiver le bloc ».',
        attendre: () => blocs().some(b => typeof b.isEnabled === 'function' && !b.isEnabled()),
    },
    {
        titre: '7. Clic droit sur le fond',
        texte: 'Sur une zone vide, le menu agit sur tout l\'espace de travail : Annuler / Refaire, Nettoyer les blocs (les range ' +
            'proprement en colonne), Réduire les blocs et Développer les blocs (tous à la fois), et Supprimer les blocs (efface tout : ' +
            'rattrapable par « Annuler »).',
        cible: '#blocklyDiv',
        decor: { menu: 'fond', surligne: /Nettoyer|Clean up/ },
        consigne: 'Faites un clic droit sur une zone vide du fond de la zone de blocs.',
        attendre: () => !!menuContextuel() && (menuContient('Nettoyer') || menuContient((Blockly.Msg && Blockly.Msg.CLEAN_UP) || 'Clean up')),
    },
    {
        titre: '8. Supprimer, c\'est rattrapable',
        texte: 'Supprimer un bloc : clic droit > « Supprimer le bloc », ou sélectionnez-le et appuyez sur Suppr. En cas d\'erreur, ' +
            'la flèche « Défaire » de la barre du haut (ou Ctrl+Z) le ramène ; la flèche « Refaire » (Ctrl+Maj+Z) rejoue l\'action. ' +
            'Faire glisser un bloc sur la corbeille le supprime aussi.',
        cible: '#btn-annuler',
    },
    {
        titre: 'C\'est tout',
        texte: 'Dupliquer, commenter, réduire, désactiver, ranger, expliquer : tout se trouve sous le bouton droit. ' +
            'Cette visite se relance par le menu « Aide » > « Visite guidée clic droit ».',
    },
];

// Parcours en cours (general ou IA) : choisi au demarrage.
let ETAPES = ETAPES_GENERAL;

// ---------- decor : menu du clic droit simule ----------
const echapper = t => String(t).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const texteOption = t => (typeof t === 'string' ? t : (t && t.textContent) || '');
function retirerDecor() { document.querySelectorAll('.tuto-faux').forEach(el => el.remove()); }

/** Le bloc montre par le menu simule : le premier qui n'est ni « au démarrage » ni « répéter indéfiniment », sinon le premier. */
function blocExemple() {
    const w = window.workspace;
    if (!w) return null;
    const tous = w.getTopBlocks(true).flatMap(t => t.getDescendants(true)).filter(b => !b.isShadow());
    const b = tous.find(x => x.type !== 'au_demarrage' && x.type !== 'boucle_infinie') || tous[0];
    return b && b.getSvgRoot() ? b : null;
}

/** Menu simule : ses choix sont ceux que Blockly afficherait vraiment, dans la langue choisie. */
function fauxMenu(type, surligne) {
    let choix = [], x, y;
    const w = window.workspace;
    if (!w) return;
    if (type === 'bloc') {
        const b = blocExemple();
        if (!b) return;
        const r = b.getSvgRoot().getBoundingClientRect();
        x = r.left + Math.min(70, r.width / 2);
        y = r.top + Math.min(16, r.height / 2);
        try { choix = b.generateContextMenu().map(o => ({ texte: texteOption(o.text), actif: o.enabled !== false })); }
        catch (e) { choix = []; }
    } else {
        const z = $('#blocklyDiv');
        if (!z) return;
        const r = z.getBoundingClientRect();
        x = r.left + r.width * 0.6;
        y = r.top + Math.min(r.height * 0.45, 260);
        try {
            choix = Blockly.ContextMenuRegistry.registry
                .getContextMenuOptions(Blockly.ContextMenuRegistry.ScopeType.WORKSPACE, { workspace: w })
                .map(o => ({ texte: texteOption(o.text), actif: o.enabled !== false }));
        } catch (e) { choix = []; }
    }
    if (!choix.length) return;
    const menu = document.createElement('div');
    menu.className = 'tuto-faux tuto-faux-menu';
    menu.setAttribute('aria-hidden', 'true');
    menu.setAttribute('data-i18n-non', '');              // deja dans la langue choisie (textes de Blockly)
    menu.innerHTML = choix.map(c => '<div class="' + (surligne && surligne.test(c.texte) ? 'surligne' : (c.actif ? '' : 'inactif'))
        + '">' + echapper(c.texte) + '</div>').join('');
    document.body.appendChild(menu);
    menu.style.left = Math.max(8, Math.min(x + 4, innerWidth - menu.offsetWidth - 8)) + 'px';
    menu.style.top = Math.max(8, Math.min(y + 4, innerHeight - menu.offsetHeight - 8)) + 'px';
    // Le pointeur de la souris, la ou l'on a « cliqué » avec le bouton droit
    const curseur = document.createElement('div');
    curseur.className = 'tuto-faux tuto-faux-curseur';
    curseur.setAttribute('aria-hidden', 'true');
    curseur.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M3 2l7 19 2.6-7.4L20 11z" '
        + 'fill="#000" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    curseur.style.left = (x - 3) + 'px';
    curseur.style.top = (y - 2) + 'px';
    document.body.appendChild(curseur);
}

/** Pose le decor d'une etape. Le menu simule n'est montre que tant que l'eleve n'a ni ouvert le vrai menu, ni fait l'action. */
function appliquerDecor(etape) {
    retirerDecor();
    const d = etape && etape.decor;
    if (!d || !actif) return;
    if (d.menu && !menuContextuel() && !attenteFaite && !ficheOuverte()) fauxMenu(d.menu, d.surligne);
}

// ---------- interface ----------
let actif = false;
let indice = 0;
let voile = null, spot = null, bulle = null, minuteur = null, attenteFaite = false, clicAttendu = false;

function creer() {
    voile = document.createElement('div');
    voile.id = 'tuto-voile';
    spot = document.createElement('div');
    spot.id = 'tuto-spot';
    bulle = document.createElement('div');
    bulle.id = 'tuto-bulle';
    bulle.setAttribute('role', 'dialog');
    bulle.setAttribute('aria-live', 'polite');
    bulle.innerHTML =
        '<div id="tuto-compteur"></div>' +
        '<h4 id="tuto-titre"></h4>' +
        '<p id="tuto-texte"></p>' +
        '<p id="tuto-consigne"></p>' +
        '<p id="tuto-fait">✓ Bien joué !</p>' +
        '<div id="tuto-boutons">' +
        '<button id="tuto-quitter" class="btn-vue">Quitter</button>' +
        '<span id="tuto-nav">' +
        '<button id="tuto-precedent" class="btn-vue">← Précédent</button>' +
        '<button id="tuto-suivant" class="btn-vue">Suivant →</button>' +
        '</span></div>';
    document.body.append(voile, spot, bulle);
    $('#tuto-quitter', bulle).addEventListener('click', arreter);
    $('#tuto-precedent', bulle).addEventListener('click', () => aller(indice - 1));
    $('#tuto-suivant', bulle).addEventListener('click', () => (indice >= ETAPES.length - 1 ? arreter() : aller(indice + 1)));
}

function cibleDe(etape) {
    if (!etape.cible) return null;
    try {
        let c = typeof etape.cible === 'function' ? etape.cible() : $(etape.cible);
        if (!c) return null;
        // Fenetre IA : une cible dans un onglet affiche cet onglet ; une cible hors de la fenetre la ferme (elle la cacherait).
        const onglet = c.closest && c.closest('#ia-panneau .ia-colonne');
        if (onglet && window.iaOnglet) window.iaOnglet(onglet.dataset.genre);
        else if (!(c.closest && c.closest('#ia-panneau')) && etape.cible !== '#btn-vue-ia' && window.fermerPanneauIA) window.fermerPanneauIA();
        const r = c.getBoundingClientRect();
        return r.width > 0 && r.height > 0 ? c : null;
    } catch (erreur) {
        return null;
    }
}

function placer() {
    if (!actif) return;
    const etape = ETAPES[indice];
    const c = cibleDe(etape);
    const vw = window.innerWidth, vh = window.innerHeight;
    const r0 = c ? c.getBoundingClientRect() : null;
    // Cadre de mise en evidence : marge reduite pour les petits elements serres (ligne de categorie, bouton),
    // sinon il deborde sur les voisins et semble les entourer aussi.
    const marge = r0 && r0.height < 40 ? 3 : 8;
    if (!c) {
        spot.style.display = 'none';
        voile.style.display = 'block';
        bulle.style.left = Math.max(12, (vw - bulle.offsetWidth) / 2) + 'px';
        bulle.style.top = Math.max(12, (vh - bulle.offsetHeight) / 3) + 'px';
        return;
    }
    voile.style.display = 'none';          // le voile est porte par l'ombre du cadre de mise en evidence
    const r = c.getBoundingClientRect();
    const x = Math.max(0, r.left - marge), y = Math.max(0, r.top - marge);
    const l = Math.min(vw - x, r.width + 2 * marge), h = Math.min(vh - y, r.height + 2 * marge);
    Object.assign(spot.style, { display: 'block', left: x + 'px', top: y + 'px', width: l + 'px', height: h + 'px' });
    const bw = bulle.offsetWidth, bh = bulle.offsetHeight;
    // Cote prefere : sous la cible, sinon au-dessus (alignee a gauche puis a droite), a droite, a gauche, sinon dans la cible.
    const essais = [
        [r.left, r.bottom + marge + 6],
        [r.left, r.top - bh - marge - 6],
        [r.right - bw, r.bottom + marge + 6],          // cible collee au bord droit : bulle alignee sur son bord droit
        [r.right - bw, r.top - bh - marge - 6],
        [r.right + marge + 6, r.top],
        [r.left - bw - marge - 6, r.top],
        [r.left + 16, r.top + 16],
    ];
    let pos = essais[essais.length - 1];
    for (const [px, py] of essais) {
        if (px >= 8 && py >= 8 && px + bw <= vw - 8 && py + bh <= vh - 8) { pos = [px, py]; break; }
    }
    // Menu simule : la bulle ne doit pas le cacher ; s'ils se chevauchent, elle passe de l'autre cote de l'ecran.
    const faux = $('.tuto-faux-menu');
    if (faux) {
        const m = faux.getBoundingClientRect();
        const chevauche = !(pos[0] + bw < m.left || pos[0] > m.right || pos[1] + bh < m.top || pos[1] > m.bottom);
        if (chevauche) pos = [m.left > vw / 2 ? 8 : vw - bw - 8, Math.max(8, Math.min(m.top, vh - bh - 8))];
    }
    bulle.style.left = Math.min(Math.max(8, pos[0]), Math.max(8, vw - bw - 8)) + 'px';
    bulle.style.top = Math.min(Math.max(8, pos[1]), Math.max(8, vh - bh - 8)) + 'px';
}

function aller(i) {
    if (i < 0 || i >= ETAPES.length) return;
    indice = i;
    attenteFaite = false;
    retirerDecor();
    const etape = ETAPES[i];
    clicAttendu = false;
    if (etape.attendreClic) {
        const el = $(etape.attendreClic);
        if (el) el.addEventListener('click', () => { if (indice === i) clicAttendu = true; }, { once: true });
    }
    try { if (etape.avant) etape.avant(); } catch (erreur) { /* l'etape s'affiche quand meme */ }
    $('#tuto-compteur', bulle).textContent = i === 0 || i === ETAPES.length - 1 ? '' : 'Étape ' + i + ' / ' + (ETAPES.length - 2);
    $('#tuto-titre', bulle).textContent = etape.titre;
    $('#tuto-texte', bulle).textContent = etape.texte;
    const consigne = $('#tuto-consigne', bulle);
    consigne.textContent = etape.consigne ? '▸ ' + etape.consigne : '';
    consigne.style.display = etape.consigne ? 'block' : 'none';
    $('#tuto-fait', bulle).style.display = 'none';
    $('#tuto-precedent', bulle).style.visibility = i === 0 ? 'hidden' : 'visible';
    const suivant = $('#tuto-suivant', bulle);
    suivant.textContent = i === 0 ? 'Commencer →' : i === ETAPES.length - 1 ? 'Terminer' : 'Suivant →';
    suivant.classList.remove('pret');
    // Les panneaux mettent un instant a s'ouvrir : on place la bulle (et le decor) apres leur mise en page.
    // Cible dans le panneau IA (a defilement) : on la ramene dans la zone visible, une seule fois par etape.
    setTimeout(() => {
        const c = cibleDe(etape);
        if (c && c.closest && c.closest('#ia-panneau')) c.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        if (indice === i) appliquerDecor(etape);
        placer();
    }, 150);
    placer();
    setTimeout(placer, 120);
    setTimeout(placer, 450);
}

function surveiller() {
    if (!actif) return;
    const etape = ETAPES[indice];
    // Le vrai menu (ou la fiche) remplace le menu simule
    if ($('.tuto-faux') && (menuContextuel() || ficheOuverte() || attenteFaite)) retirerDecor();
    placer();
    if ((etape.attendre || etape.attendreClic) && !attenteFaite) {
        let fait = false;
        try { fait = etape.attendreClic ? clicAttendu : !!etape.attendre(); } catch (erreur) { fait = false; }
        if (fait) {
            attenteFaite = true;
            retirerDecor();
            $('#tuto-fait', bulle).style.display = 'block';
            $('#tuto-suivant', bulle).classList.add('pret');
            placer();
        }
    }
}

function demarrer(parcours) {
    if (actif) return;
    ETAPES = parcours || ETAPES_GENERAL;
    if (!voile) creer();
    actif = true;
    document.body.classList.add('tuto-actif');
    voile.style.display = spot.style.display = bulle.style.display = 'block';
    minuteur = setInterval(surveiller, 300);
    aller(0);
}

function arreter() {
    if (!actif) return;
    actif = false;
    clearInterval(minuteur);
    retirerDecor();
    document.body.classList.remove('tuto-actif');
    voile.style.display = spot.style.display = bulle.style.display = 'none';
}

// Seule entree : menu Aide. (Re)demarre toujours la visite depuis le debut.
const btnMenu = bouton('tuto-menu-btn');
if (btnMenu) btnMenu.addEventListener('click', () => { arreter(); demarrer(ETAPES_GENERAL); });
const btnMenuConsole = bouton('tuto-console-menu-btn');
if (btnMenuConsole) btnMenuConsole.addEventListener('click', () => { arreter(); demarrer(ETAPES_CONSOLE); });
const btnMenuClicDroit = bouton('tuto-clicdroit-menu-btn');
if (btnMenuClicDroit) btnMenuClicDroit.addEventListener('click', () => { arreter(); demarrer(ETAPES_CLIC_DROIT); });
const btnMenuIA = bouton('tuto-ia-menu-btn');
if (btnMenuIA) btnMenuIA.addEventListener('click', () => { arreter(); demarrer(ETAPES_IA); });
window.addEventListener('resize', () => { placer(); if (actif) appliquerDecor(ETAPES[indice]); });
// Echap arrete la visite, SAUF s'il sert a fermer autre chose (menu contextuel, fiche d'un bloc) : phase de capture,
// pour lire l'etat avant que ces elements ne se ferment.
document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || !actif) return;
    if (menuContextuel() || ficheOuverte()) return;
    arreter();
}, true);

// ---------- message d'accueil : propose de « visiter » le menu Aide ----------
// Affiche a chaque demarrage, sous le bouton Aide, sauf si l'utilisateur a coche « Ne plus
// afficher ». Cliquer « Ouvrir le menu Aide » ouvre le menu et fait clignoter les visites.
const CLE_ACCUEIL = 'tuto-accueil-masque';
function accueilMasque() { try { return localStorage.getItem(CLE_ACCUEIL) === '1'; } catch (e) { return false; } }
function memoriserAccueilMasque() { try { localStorage.setItem(CLE_ACCUEIL, '1'); } catch (e) { /* stockage indisponible */ } }

let accueil = null;
function placerAccueil() {
    const cible = bouton('menu-aide-btn');
    if (!accueil || !cible) return;
    const r = cible.getBoundingClientRect();
    accueil.style.left = Math.max(8, Math.min(r.left, window.innerWidth - accueil.offsetWidth - 8)) + 'px';
    accueil.style.top = (r.bottom + 14) + 'px';
    const fleche = $('#tuto-accueil-fleche', accueil);
    if (fleche) fleche.style.left = Math.max(12, r.left + r.width / 2 - parseFloat(accueil.style.left) - 8) + 'px';
}
function fermerAccueil() {
    if (!accueil) return;
    if ($('#tuto-accueil-masquer', accueil).checked) memoriserAccueilMasque();
    accueil.remove();
    accueil = null;
    const cible = bouton('menu-aide-btn');
    if (cible) cible.classList.remove('tuto-clignote');
    window.removeEventListener('resize', placerAccueil);
}
function mettreEnAvantEntrees() {
    const entrees = ['tuto-menu-btn', 'tuto-ia-menu-btn', 'tuto-console-menu-btn', 'tuto-clicdroit-menu-btn'].map(bouton).filter(Boolean);
    entrees.forEach(e => e.classList.add('tuto-clignote'));
    const arret = () => entrees.forEach(e => e.classList.remove('tuto-clignote'));
    entrees.forEach(e => e.addEventListener('click', arret, { once: true }));
    const panneau = bouton('menu-aide-panneau');
    if (panneau) {
        const veille = setInterval(() => { if (!panneau.classList.contains('visible')) { arret(); clearInterval(veille); } }, 500);
    }
}
function afficherAccueil() {
    if (accueil || actif || accueilMasque() || !bouton('menu-aide-btn')) return;
    if (document.documentElement.dataset.editeur) return;   // multi-editeur radio : pas d'accueil dans chaque carte
    accueil = document.createElement('div');
    accueil.id = 'tuto-accueil';
    accueil.setAttribute('role', 'dialog');
    accueil.innerHTML =
        '<span id="tuto-accueil-fleche"></span>' +
        '<h4>Bienvenue</h4>' +
        '<p>Des <b>visites guidées</b> vous expliquent le logiciel pas à pas : visite générale, intelligence artificielle, ' +
        'console et clic droit. Elles se trouvent dans le menu <b>Aide</b>. Voulez-vous le visiter ?</p>' +
        '<label id="tuto-accueil-label"><input type="checkbox" id="tuto-accueil-masquer"> Ne plus afficher ce message</label>' +
        '<div id="tuto-accueil-boutons">' +
        '<button id="tuto-accueil-plus-tard" class="btn-vue">Plus tard</button>' +
        '<button id="tuto-accueil-ouvrir" class="btn-vue pret">Ouvrir le menu Aide</button>' +
        '</div>';
    document.body.appendChild(accueil);
    placerAccueil();
    const cible = bouton('menu-aide-btn');
    cible.classList.add('tuto-clignote');
    window.addEventListener('resize', placerAccueil);
    $('#tuto-accueil-plus-tard', accueil).addEventListener('click', fermerAccueil);
    $('#tuto-accueil-ouvrir', accueil).addEventListener('click', e => {
        e.stopPropagation();                         // sinon le clic « hors menu » le refermerait aussitot
        fermerAccueil();
        const panneau = bouton('menu-aide-panneau');
        if (panneau && !panneau.classList.contains('visible')) cible.click();
        mettreEnAvantEntrees();
    });
    // Ouvrir le menu soi-meme vaut reponse : le message n'a plus lieu d'etre.
    cible.addEventListener('click', () => fermerAccueil(), { once: true });
}
document.addEventListener('keydown', e => { if (e.key === 'Escape' && accueil) fermerAccueil(); });
setTimeout(afficherAccueil, 1200);

window.tutoTest = { cibleDe, demarrer, arreter, aller, ETAPES_GENERAL, ETAPES_IA, ETAPES_CONSOLE, ETAPES_CLIC_DROIT, etapes: () => ETAPES, etat: () => ({ actif, indice, attenteFaite, accueil: !!accueil }), categorie, afficherAccueil, fermerAccueil, CLE_ACCUEIL };
