// bandeau.js — comportement du bandeau du haut (apparence identique a la version Arduino R4).
//
// AUCUNE fonction existante du logiciel n'est modifiee ni dupliquee : ce fichier ne fait que
//  - relayer les nouveaux boutons du modele vers les boutons / fonctions qui existent deja
//    (#btn-theme, #btn-contraste, #btn-console-carte, #run-sim, #btn-reset...) ;
//  - mettre a jour les libelles variables (Afficher / Masquer la console...) et les coches ✓,
//    en observant l'etat deja tenu par le logiciel (classes, attributs data-theme / data-contrast,
//    window.simuEnCours).
// Les menus deroulants (ouverture / fermeture) restent geres par le code existant (un.js).

const $ = id => document.getElementById(id);
const racine = document.documentElement;

// ---------- Affichage : theme et contraste ----------
// #btn-theme et #btn-contraste (caches) basculent ; on ne les clique que si l'etat voulu differe.
const themeClair = () => racine.dataset.theme === 'light';
const contrasteEleve = () => racine.dataset.contrast === 'high';
function choisirTheme(clair) { if (themeClair() !== clair && $('btn-theme')) $('btn-theme').click(); }
function choisirContraste(eleve) { if (contrasteEleve() !== eleve && $('btn-contraste')) $('btn-contraste').click(); }

// ---------- Affichage : theme de saison (Halloween, Noel, salon Educatech Expo) ----------
// Choix memorise dans saisonApp : aucune, halloween, noel, salon ou auto (selon la date). L'attribut data-saison
// est pose des le chargement par le petit script en tete de index.html ; un.js y accorde le theme Blockly.
// Un theme de saison est une variante du sombre en contraste normal : le choisir y ramene, et choisir
// le theme clair ou le contraste eleve revient a « Aucune ».
const SAISONS = ['aucune', 'halloween', 'noel', 'salon', 'auto'];
const SALON = { titre: 'Educatech Expo', dates: '2-4 déc. 2026', stand: 'K3' };   // a mettre a jour pour un autre salon
function saisonDuJour(d = new Date()) {
    const m = d.getMonth() + 1, j = d.getDate();
    if ((m === 10 && j >= 15) || (m === 11 && j <= 2)) return 'halloween';
    if (d.getFullYear() === 2026 && m === 12 && j >= 2 && j <= 4) return 'salon';   // meme regle qu'en tete de index.html
    return m === 12 ? 'noel' : '';
}
function choixSaison() {
    let choix = 'aucune';
    try { choix = localStorage.getItem('saisonApp') || 'aucune'; } catch (erreur) { /* navigation privee */ }
    return SAISONS.includes(choix) ? choix : 'aucune';
}
function appliquerSaison(choix) {
    try { localStorage.setItem('saisonApp', choix); } catch (erreur) { /* le choix ne survivra pas au rechargement */ }
    const saison = choix === 'auto' ? saisonDuJour() : (choix === 'aucune' ? '' : choix);
    if (saison) { racine.dataset.saison = saison; choisirTheme(false); choisirContraste(false); }
    else delete racine.dataset.saison;
    majCoches();
}
SAISONS.forEach(choix => {
    const b = $('aff-saison-' + choix);
    if (b) b.addEventListener('click', () => appliquerSaison(choix));
});
const quitterSaison = () => { if (choixSaison() !== 'aucune') appliquerSaison('aucune'); };

// Decorations : un repere dans le bandeau, juste apres le logo, et un calque sur la zone de programmation.
if ($('tb-logo') && !$('tb-saison')) {
    const repere = document.createElement('span');
    repere.id = 'tb-saison';
    repere.setAttribute('aria-hidden', 'true');
    $('tb-logo').after(repere);
}
// Dessins des decors (SVG dans la page, aucun fichier a telecharger) : Halloween « Nuit hantee », Noel « Village enneige ».
const svg = (classe, vue, contenu) => '<svg class="' + classe + '" viewBox="' + vue + '" aria-hidden="true">' + contenu + '</svg>';
function dessinToile() {   // toile d'araignee accrochee au coin haut droit
    const coin = [110, 0], bouts = [[8, 0], [12, 44], [38, 82], [74, 106], [110, 110]];
    let d = bouts.map(([x, y]) => 'M110 0 L' + x + ' ' + y).join(' ');
    for (const f of [0.28, 0.52, 0.76, 0.98]) {
        const pts = bouts.map(([x, y]) => [coin[0] + (x - coin[0]) * f, coin[1] + (y - coin[1]) * f]);
        d += ' M' + pts[0].join(' ');
        for (let i = 1; i < pts.length; i++) {
            const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
            d += ' Q' + ((ax + bx) / 2 + (coin[0] - (ax + bx) / 2) * 0.12) + ' ' + ((ay + by) / 2 + (coin[1] - (ay + by) / 2) * 0.12) + ' ' + bx + ' ' + by;
        }
    }
    return '<path d="' + d + '" fill="none" stroke="#e6e6e6" stroke-width="1"/>';
}
const citrouille = (x, y, s) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
    '<ellipse cx="12" cy="13" rx="11" ry="9" fill="#e8590c"/><ellipse cx="12" cy="13" rx="5" ry="9" fill="#fd7e14"/>' +
    '<rect x="10.5" y="1" width="3" height="5" rx="1" fill="#2b8a3e"/>' +
    '<path class="deco-lueur" d="M6 11 L9 9 L9 12Z M18 11 L15 9 L15 12Z M6 15 Q12 20 18 15 Q12 17 6 15Z" fill="#ffd43b"/></g>';
const chauve = (x, y, s) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><g class="chauve">' +
    '<path d="M0 4 C3 -2 7 -2 9 3 C10 1 11 1 12 3 C14 -2 18 -2 21 4 C18 3 16 5 15 7 C13 5 12 6 10.5 8 C9 6 8 5 6 7 C5 5 3 3 0 4Z" fill="#06030a" stroke="#ffd68a" stroke-opacity="0.55" stroke-width="0.6"/></g></g>';   // liseré clair : visibles sur la nuit
const sapin = (x, y, s) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
    '<path d="M10 0 L20 14 L15 14 L22 24 L-2 24 L5 14 L0 14Z" fill="#2b8a3e"/>' +
    '<path d="M10 0 L14 6 L6 6Z M5 14 L15 14 L16 16 L4 16Z M-2 24 L22 24 L20 21 L0 21Z" fill="#f1f6fb"/>' +
    '<rect x="8" y="24" width="4" height="4" fill="#6b3e1f"/></g>';
function dessinGuirlande() {   // fil en festons et ampoules qui clignotent, sur toute la largeur du bandeau
    const COULEURS = ['#ffd43b', '#4dabf7', '#ff6b6b', '#69db7c'];
    let fil = 'M0 2', ampoules = '';
    for (let i = 0; i < 100; i++) {
        const x = i * 36;
        fil += ' Q' + (x + 18) + ' 16 ' + (x + 36) + ' 2';
        ampoules += '<rect x="' + (x + 16) + '" y="8" width="4" height="4" fill="#495057"/>' +
            '<ellipse class="' + (i % 2 ? 'deco-lueur' : 'deco-lueur-2') + '" cx="' + (x + 18) + '" cy="17.5" rx="4.6" ry="6" fill="' + COULEURS[i % 4] + '"/>';
    }
    return '<path d="' + fil + '" fill="none" stroke="#212529" stroke-width="1.4"/>' + ampoules;
}
if ($('blockly-wrapper') && !$('deco-saison')) {
    const deco = document.createElement('div');
    deco.id = 'deco-saison';
    deco.setAttribute('aria-hidden', 'true');
    deco.innerHTML =
        '<div class="deco-halloween deco-brume"></div>' +
        svg('deco-halloween deco-lune', '0 0 70 70', '<circle cx="35" cy="35" r="30" fill="#ffe8a3"/>' +
            '<circle cx="26" cy="28" r="5" fill="#f2d47a"/><circle cx="44" cy="44" r="7" fill="#f2d47a"/><circle cx="46" cy="23" r="3" fill="#f2d47a"/>') +
        svg('deco-halloween deco-toile', '0 0 110 110', dessinToile()) +
        svg('deco-halloween deco-chauves', '0 0 280 110', chauve(200, 20, 2.2) + chauve(110, 50, 1.6) + chauve(30, 14, 1.2)) +
        svg('deco-halloween deco-manoir', '0 0 190 130',
            '<path d="M0 130 L0 70 L20 70 L20 40 L30 22 L40 40 L40 70 L60 70 L60 50 L95 18 L130 50 L130 70 L150 70 L150 30 L160 12 L170 30 L170 130Z" fill="#06030a"/>' +
            '<g fill="#ffd43b"><rect class="deco-lueur" x="27" y="48" width="6" height="8"/><rect class="deco-lueur-2" x="84" y="55" width="8" height="10"/>' +
            '<rect class="deco-lueur" x="99" y="55" width="8" height="10"/><rect class="deco-lueur-2" x="157" y="42" width="6" height="8"/>' +
            '<rect class="deco-lueur-2" x="68" y="88" width="8" height="10"/><rect class="deco-lueur" x="114" y="88" width="8" height="10"/></g>' +
            '<rect x="89" y="104" width="12" height="26" rx="6" fill="#ffa94d" opacity="0.8"/>') +
        svg('deco-halloween deco-citrouilles', '0 0 96 46', citrouille(0, 6, 1.8) + citrouille(50, 18, 1.25)) +
        '<div class="deco-noel deco-neige"></div><div class="deco-noel deco-neige deco-neige-2"></div><div class="deco-noel deco-neige deco-neige-3"></div>' +
        '<svg class="deco-noel deco-collines" viewBox="0 0 1000 70" preserveAspectRatio="none" aria-hidden="true">' +
            '<path d="M0 70 L0 40 Q120 10 260 34 T520 30 T780 26 T1000 32 L1000 70Z" fill="#dde9f5"/>' +
            '<path d="M0 70 L0 56 Q200 32 420 50 T1000 46 L1000 70Z" fill="#f5f9fd"/></svg>' +
        svg('deco-noel deco-sapins', '0 0 150 70', sapin(10, 26, 1.4) + sapin(62, 14, 1.9) + sapin(118, 32, 1.2)) +
        svg('deco-noel deco-etoile', '0 0 34 34', '<path class="deco-lueur" d="M17 1 L21 12 L33 12 L23.5 19 L27 31 L17 24 L7 31 L10.5 19 L1 12 L13 12Z" fill="#ffd43b"/>') +
        svg('deco-salon deco-circuit-haut', '0 0 320 190',
            '<g fill="none" stroke-width="2"><path class="deco-piste" d="M320 120 H250 V160 H190" stroke="#2bb3a0"/>' +
            '<path class="deco-piste" d="M320 176 H280 V140" stroke="#7b5cff" style="animation-delay:-1s"/>' +
            '<path class="deco-piste" d="M200 0 V40 H150 V90" stroke="#e0218a" style="animation-delay:-2s"/></g>' +
            '<g><circle class="deco-lueur" cx="190" cy="160" r="4" fill="#2bb3a0"/><circle class="deco-lueur-2" cx="280" cy="140" r="4" fill="#7b5cff"/>' +
            '<circle class="deco-lueur" cx="150" cy="90" r="4" fill="#e0218a"/></g>') +
        svg('deco-salon deco-circuit-bas', '0 0 260 120',
            '<g fill="none" stroke-width="2"><path class="deco-piste" d="M0 110 H60 V70 H130" stroke="#e0218a"/>' +
            '<path class="deco-piste" d="M0 30 H40 V50 H90" stroke="#2bb3a0" style="animation-delay:-1.5s"/></g>' +
            '<circle class="deco-lueur-2" cx="130" cy="70" r="4" fill="#e0218a"/><circle class="deco-lueur" cx="90" cy="50" r="4" fill="#2bb3a0"/>') +
        '<div class="deco-salon deco-badge-salon">' + SALON.titre + ' · ' + SALON.dates +
            '<b>Technologie Services</b><span class="stand">Stand ' + SALON.stand + '</span></div>' +
        '<div class="deco-salon deco-banniere-salon"><span>' +
            ('Programmez votre micro:bit : essayez ! · Technologie Services · Stand ' + SALON.stand + ' · ' + SALON.titre + ' · ').repeat(4) +
            '</span></div>';
    $('blockly-wrapper').appendChild(deco);
}
if ($('toolbar') && !$('guirlande-saison')) {
    const guirlande = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    guirlande.id = 'guirlande-saison';
    guirlande.setAttribute('aria-hidden', 'true');
    guirlande.setAttribute('height', '26');
    guirlande.innerHTML = dessinGuirlande();
    $('toolbar').appendChild(guirlande);
}
// ---------- Multi-editeur radio (multi.html) ----------
// Fichier > Multi-editeur radio ouvre deux editeurs cote a cote dans un nouvel onglet (le travail en cours reste ici).
// Dans chacun d'eux (?editeur=1 ou 2), une pastille « Carte 1 / Carte 2 » suit le logo et l'entree du menu disparait.
if ($('multi-editeur-btn')) {
    if (racine.dataset.editeur) $('multi-editeur-btn').hidden = true;
    else $('multi-editeur-btn').addEventListener('click', () => { window.open('multi.html', '_blank', 'noopener'); });
}
// Bouton « Radio » du bandeau (a droite de IA) : meme effet que l'entree du menu Fichier, cache dans le multi-editeur.
if ($('btn-radio-multi')) {
    if (racine.dataset.editeur || !$('multi-editeur-btn')) $('btn-radio-multi').hidden = true;
    else $('btn-radio-multi').addEventListener('click', () => $('multi-editeur-btn').click());
}
// Proposition du multi-editeur : quand l'eleve glisse un bloc Radio (types radio_*) dans la zone de programmation,
// un bandeau (#proposition-radio) propose d'ouvrir le multi-editeur. Seul le glisser declenche (evenement 'drag' de
// fin) : charger un fichier, un exercice ou un exemple ne glisse rien. Une seule fois par onglet (sessionStorage) ;
// « Ne plus proposer » est memorise dans le navigateur (localStorage). Jamais dans le multi-editeur lui-meme.
const CLE_RADIO_VUE = 'propositionRadioVue', CLE_RADIO_JAMAIS = 'propositionRadioJamais';
function lireStockage(stockage, cle) { try { return stockage.getItem(cle); } catch (erreur) { return null; } }
function ecrireStockage(stockage, cle) { try { stockage.setItem(cle, '1'); } catch (erreur) { /* navigation privee */ } }
function installerPropositionRadio() {
    const bandeau = $('proposition-radio'), ws = window.workspace, reactiver = $('proposition-radio-reactiver');
    if (reactiver && (racine.dataset.editeur || !$('multi-editeur-btn'))) reactiver.hidden = true;
    if (!bandeau || !ws || racine.dataset.editeur || !$('multi-editeur-btn')) return;
    const fermer = () => { bandeau.hidden = true; };
    // Bandeau et confirmation : centres sur l'espace de programmation, a droite de la colonne de categories
    // (qui les recouvrirait sinon).
    const placer = el => {
        const boite = ws.getToolbox && ws.getToolbox();
        const colonne = boite && boite.getWidth ? boite.getWidth() : 0;
        el.style.left = 'calc(' + colonne + 'px + (100% - ' + colonne + 'px) / 2)';
        el.style.maxWidth = 'calc(100% - ' + (colonne + 24) + 'px)';
    };
    // Menu Aide > Reactiver : annule « Ne plus proposer » (et le « deja propose » de l'onglet), grisee sinon.
    const majReactiver = () => { if (reactiver) reactiver.disabled = !lireStockage(localStorage, CLE_RADIO_JAMAIS); };
    majReactiver();
    if (reactiver) reactiver.addEventListener('click', () => {
        try { localStorage.removeItem(CLE_RADIO_JAMAIS); sessionStorage.removeItem(CLE_RADIO_VUE); } catch (erreur) { /* navigation privee */ }
        majReactiver();
        const info = $('proposition-radio-info');
        if (info) { placer(info); info.hidden = false; clearTimeout(info.minuteur); info.minuteur = setTimeout(() => { info.hidden = true; }, 3500); }
    });
    $('proposition-radio-ouvrir').addEventListener('click', () => { fermer(); $('multi-editeur-btn').click(); });
    $('proposition-radio-plus-tard').addEventListener('click', fermer);
    $('proposition-radio-jamais').addEventListener('click', () => { ecrireStockage(localStorage, CLE_RADIO_JAMAIS); fermer(); majReactiver(); });
    ws.addChangeListener(ev => {
        if (ev.type !== Blockly.Events.BLOCK_DRAG || ev.isStart) return;
        if (lireStockage(sessionStorage, CLE_RADIO_VUE) || lireStockage(localStorage, CLE_RADIO_JAMAIS)) return;
        const bloc = ws.getBlockById(ev.blockId);   // absent si le bloc a fini a la corbeille
        if (!bloc || !bloc.getDescendants(false).some(b => b.type.startsWith('radio_'))) return;
        ecrireStockage(sessionStorage, CLE_RADIO_VUE);
        placer(bandeau);
        bandeau.hidden = false;
    });
}
if (window.workspace) installerPropositionRadio();
else window.addEventListener('load', installerPropositionRadio);
if (racine.dataset.editeur && $('tb-logo')) {
    const pastille = document.createElement('span');
    pastille.id = 'tb-carte';
    pastille.textContent = 'Carte ' + racine.dataset.editeur;
    pastille.title = 'Multi-éditeur radio : carte simulée n° ' + racine.dataset.editeur;
    $('tb-logo').after(pastille);
}

// Repere de saison du bandeau : la meme icone SVG au trait que le menu Affichage (pas d'emoji, comme la version Arduino R4).
function majRepereSaison() {
    const repere = $('tb-saison');
    if (!repere) return;
    const bouton = $({ halloween: 'aff-saison-halloween', noel: 'aff-saison-noel', salon: 'aff-saison-salon' }[racine.dataset.saison]);
    const icone = bouton && bouton.querySelector('svg');
    repere.innerHTML = '';
    if (icone) {
        const copie = icone.cloneNode(true);
        copie.setAttribute('width', '20');
        copie.setAttribute('height', '20');
        repere.appendChild(copie);
    }
}

function majCoches() {
    const bascule = (id, vrai) => { const b = $(id); if (b) b.classList.toggle('choisi', !!vrai); };
    bascule('aff-theme-clair', themeClair());
    bascule('aff-theme-sombre', !themeClair());
    bascule('aff-contraste-normal', !contrasteEleve());
    bascule('aff-contraste-eleve', contrasteEleve());
    const saison = choixSaison();
    SAISONS.forEach(choix => bascule('aff-saison-' + choix, saison === choix));
    majRepereSaison();
}
if ($('aff-theme-clair')) $('aff-theme-clair').addEventListener('click', () => { quitterSaison(); choisirTheme(true); });
if ($('aff-theme-sombre')) $('aff-theme-sombre').addEventListener('click', () => choisirTheme(false));
if ($('aff-contraste-normal')) $('aff-contraste-normal').addEventListener('click', () => choisirContraste(false));
if ($('aff-contraste-eleve')) $('aff-contraste-eleve').addEventListener('click', () => { quitterSaison(); choisirContraste(true); });
new MutationObserver(majCoches).observe(racine, { attributes: true, attributeFilter: ['data-theme', 'data-contrast', 'data-saison'] });
majCoches();

// ---------- Libelles Afficher / Masquer (l'etat « ferme » = classe .inactif, posee par le code existant) ----------
function suivreBascule(idBouton, idLibelle, quandOuvert, quandFerme) {
    const bouton = $(idBouton), libelle = $(idLibelle);
    if (!bouton || !libelle) return;
    const maj = () => { libelle.textContent = bouton.classList.contains('inactif') ? quandFerme : quandOuvert; };
    new MutationObserver(maj).observe(bouton, { attributes: true, attributeFilter: ['class'] });
    maj();
}
suivreBascule('btn-vue-console', 'lib-console', 'Masquer la console', 'Afficher la console');
suivreBascule('btn-vue-simu', 'lib-simulation', 'Masquer la simulation', 'Afficher la simulation');
suivreBascule('btn-vue-code', 'lib-code', 'Masquer le code', 'Afficher le code');

// ---------- Voyant de connexion de la carte (bouton Console) ----------
// Le bouton « Moniteur serie » du modele est fusionne dans « Console » : la console EST le moniteur.
// Le bouton « Console » affiche / masque le panneau ; la connexion se fait avec « Connecter » dans la
// console (#btn-console-carte, code existant). Le voyant reflete l'etat de ce bouton (classe .connecte).
const boutonCarte = $('btn-console-carte');
const voyant = $('voyant-carte');
if (boutonCarte && voyant) {
    const majVoyant = () => {
        const connecte = boutonCarte.classList.contains('connecte');
        voyant.classList.toggle('connecte', connecte);
        const texte = connecte ? 'Carte connectée' : 'Carte non connectée';
        voyant.title = texte;
        voyant.setAttribute('aria-label', texte);
    };
    new MutationObserver(majVoyant).observe(boutonCarte, { attributes: true, attributeFilter: ['class'] });
    majVoyant();
}

// ---------- Lancer la simulation / Arreter ----------
// Lancer = #run-sim ; Arreter = #btn-reset (« Reinitialiser la simulation », qui arrete le programme).
const lancer = $('tb-lancer');
if (lancer) {
    lancer.addEventListener('click', () => {
        const cible = window.simuEnCours === true ? $('btn-reset') : $('run-sim');
        if (cible) cible.click();
    });
    let enCours = null;
    setInterval(() => {
        const maintenant = window.simuEnCours === true;
        if (maintenant === enCours) return;
        enCours = maintenant;
        lancer.classList.toggle('running', maintenant);
        if ($('tb-lancer-label')) $('tb-lancer-label').textContent = maintenant ? 'Arrêter' : 'Lancer la simulation';
        const icone = $('tb-lancer-icone');
        if (icone) icone.innerHTML = maintenant ? '<rect x="5" y="5" width="14" height="14" rx="1"/>' : '<polygon points="5,3 19,12 5,21"/>';
    }, 250);
}

// ---------- Selecteur de carte (menu + « rechercher les cartes ») ----------
// Web Serial memorise les cartes deja autorisees (navigator.serial.getPorts). Le menu les liste ; ⟳ ouvre la
// fenetre de choix du navigateur pour en autoriser une nouvelle (requestPort). Le bouton « Connecter » de la
// console (code existant, un.js) appelle navigator.serial.requestPort a chaque clic : on y intercale un relais
// qui renvoie directement la carte choisie dans le menu, sans rouvrir la fenetre. Sans carte choisie, ou si le
// relais ne s'applique pas, la fenetre de choix habituelle s'ouvre (comportement d'origine).
// Le choix ne concerne que la connexion serie : « Televerser » garde son propre choix de lecteur MICROBIT.
const VENDEUR_MICROBIT = 0x0D28;
const choix = $('port-select'), rechercher = $('port-refresh');
let serialActif = null;           // objet navigator.serial utilise (parametrable pour les tests)
let cartes = [];                  // ports connus (SerialPort), dans l'ordre du menu
let appelInterne = false;         // vrai pendant NOTRE appel a requestPort (ne pas le detourner)
const dejaEnveloppe = new WeakSet();

const estMicrobit = port => { try { return port.getInfo().usbVendorId === VENDEUR_MICROBIT; } catch (e) { return false; } };
const carteChoisie = () => { const i = choix ? parseInt(choix.value, 10) : NaN; return Number.isInteger(i) ? cartes[i] || null : null; };

function remplirCartes(aSelectionner) {
    if (!choix) return;
    const ancienne = aSelectionner || carteChoisie();
    choix.textContent = '';
    if (!cartes.length) {
        const o = document.createElement('option'); o.value = ''; o.textContent = 'micro:bit'; choix.appendChild(o);
        choix.title = 'Aucune carte autorisée : cliquez ⟳ ou « Connecter » dans la console pour en choisir une';
        return;
    }
    cartes.forEach((port, i) => {
        const o = document.createElement('option');
        o.value = String(i); o.textContent = cartes.length > 1 ? 'micro:bit ' + (i + 1) : 'micro:bit';
        choix.appendChild(o);
    });
    const idx = ancienne ? cartes.indexOf(ancienne) : -1;
    choix.value = String(idx >= 0 ? idx : 0);
    choix.title = 'Carte à connecter (appliqué au prochain « Connecter ») — ' + cartes.length + ' carte(s) autorisée(s)';
}

async function chargerCartes(aSelectionner) {
    if (!serialActif) return;
    try { cartes = (await serialActif.getPorts()).filter(estMicrobit); } catch (e) { cartes = []; }
    remplirCartes(aSelectionner);
}

function demarrerCartes(serial) {
    serialActif = serial || null;
    if (!choix || !rechercher) return;
    if (!serialActif) {
        choix.disabled = true; rechercher.disabled = true;
        $('port-group').title = 'Cartes micro:bit : demande Chrome ou Edge (Web Serial)';
        return;
    }
    choix.disabled = false; rechercher.disabled = false;
    if (!dejaEnveloppe.has(serialActif)) {
        dejaEnveloppe.add(serialActif);
        const origine = serialActif.requestPort.bind(serialActif);
        serialActif.requestPort = async function (options) {
            if (!appelInterne) {
                const deja = carteChoisie();
                if (deja) return deja;                                   // carte choisie dans le menu : pas de fenetre
            }
            const port = await origine(options);                          // fenetre de choix du navigateur
            if (!appelInterne && estMicrobit(port)) chargerCartes(port); // la carte autorisee apparait dans le menu
            return port;
        };
        serialActif.addEventListener('connect', () => chargerCartes());
        serialActif.addEventListener('disconnect', () => chargerCartes());
    }
    chargerCartes();
}

if (rechercher) {
    rechercher.addEventListener('click', async () => {
        if (!serialActif || rechercher.classList.contains('occupe')) return;
        rechercher.classList.add('occupe');
        appelInterne = true;
        try {
            const port = await serialActif.requestPort({ filters: [{ usbVendorId: VENDEUR_MICROBIT }] });
            await chargerCartes(port);
        } catch (e) {
            /* fenetre fermee sans choix (NotFoundError) : rien a faire */
        } finally {
            appelInterne = false;
            rechercher.classList.remove('occupe');
        }
    });
}
demarrerCartes('serial' in navigator ? navigator.serial : null);
window.bandeauTest = { demarrerCartes, chargerCartes, cartes: () => cartes };

// ---------- Puces rondes de la colonne de categories ----------
// Blockly colore chaque categorie par la bordure gauche de sa ligne (rectangle). On recopie cette couleur dans
// --puce (variable CSS) pour dessiner une puce ronde a la place ; la bordure est supprimee par le CSS (index.html).
// La puce a EXACTEMENT la couleur des blocs de sa categorie (table PALETTE_CATEGORIES, un.js) ; une sous-categorie
// prend la couleur de sa categorie principale.
function colorerPuces() {
    document.querySelectorAll('.blocklyToolboxCategory .blocklyTreeRow').forEach(ligne => {
        // Colonne de 160 px : « Entrees/Sorties » passe a la ligne apres la barre oblique, pas au milieu d'un mot.
        const nom = ligne.querySelector('.blocklyTreeLabel');
        if (nom && nom.textContent.includes('/') && !nom.textContent.includes('/​')) nom.textContent = nom.textContent.replace(/\//g, '/​');
        const base = getComputedStyle(ligne).borderLeftColor;
        if (!base || ligne.dataset.puceBase === base) return;
        ligne.dataset.puceBase = base;
        ligne.style.setProperty('--puce', base);
    });
}
colorerPuces();
const boiteOutils = document.querySelector('.blocklyToolboxDiv');
if (boiteOutils) {
    // La boite a outils est reconstruite (panneau administrateur, changement de langue...) : on recolore.
    new MutationObserver(colorerPuces).observe(boiteOutils, { childList: true, subtree: true });
}
// Categorie parente (Radio, Grove, Cartes d'extension, Robots) d'une sous-categorie ouverte : classe contient-actif
// (lisere et texte blanc, voir index.html), comme la version Arduino R4.
function marquerParentActif() {
    document.querySelectorAll('.blocklyTreeRow.contient-actif').forEach(l => l.classList.remove('contient-actif'));
    const boite = window.workspace && window.workspace.getToolbox && window.workspace.getToolbox();
    const choix = boite && boite.getSelectedItem && boite.getSelectedItem();
    const parent = choix && choix.getParent && choix.getParent();
    const ligne = parent && parent.getDiv && parent.getDiv() && parent.getDiv().querySelector('.blocklyTreeRow');
    if (ligne) ligne.classList.add('contient-actif');
}
if (window.workspace && window.Blockly) {
    window.workspace.addChangeListener(e => { if (e.type === Blockly.Events.TOOLBOX_ITEM_SELECT) marquerParentActif(); });
}

// ---------- Recherche de blocs (au-dessus de la premiere categorie) ----------
// Zone de saisie placee en haut de la colonne de categories. Elle cherche dans TOUS les blocs de la boite a outils
// d'origine (toutes categories, sous-categories comprises) et affiche les resultats dans le tiroir, comme une
// categorie : les blocs se prennent et se deposent normalement. Le texte cherche = ce qui s'affiche sur le bloc
// (« attendre ... secondes »), le nom de sa categorie et, en second rang, son texte d'aide.
// Variables et Fonctions (tiroirs generes a la volee) sont interroges a chaque recherche (voir blocsDynamiques).
const normaliser = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
let indexBlocs = null;                 // [{ def, texte, aide, categorie }]

function parcourirBoite(contenus, chemin, sortie) {
    for (const e of contenus || []) {
        if (e.kind === 'category') parcourirBoite(e.contents, chemin.concat(e.name), sortie);
        else if (e.kind === 'block' && e.type) sortie.push({ def: e, chemin });
    }
}

function construireIndex() {
    const ws = window.workspace;
    const arbre = ws && ws.options && ws.options.languageTree;
    const brut = [];
    if (arbre) parcourirBoite(arbre.contents, [], brut);
    const aides = (window.aideBlocTest && window.aideBlocTest.AIDE_BLOCS) || {};
    const scratch = new Blockly.Workspace();
    const resultat = [];
    for (const { def, chemin } of brut) {
        let texte = '';
        try {
            const b = Blockly.serialization.blocks.append(def, scratch);
            texte = b.toString(200, '?');
            b.dispose(false);
        } catch (erreur) { texte = def.type; }
        const noms = chemin.map(c => c === 'Communication' ? 'Radio' : c);
        resultat.push({ def, texte: normaliser(texte + ' ' + def.type.replace(/_/g, ' ')), aide: normaliser(aides[def.type] || ''),
            categorie: normaliser(noms.join(' ')), titre: noms.join(' · ') });   // titre des resultats : « Grove · LED »
    }
    scratch.dispose();
    return resultat;
}

// Variables et Fonctions : tiroirs generes par Blockly a la volee (selon les variables et fonctions creees). On interroge
// les memes generateurs que la boite a outils a chaque recherche, pour que le bouton « Creer une variable… », les blocs
// de variables et les appels des fonctions deja definies soient trouvables.
// Mots que l'on pense a taper pour ces blocs mais qui ne figurent pas dans leur libelle francais (« definir x a », « incrementer »...).
const SYNONYMES_DYNAMIQUES = {
    variables_set: 'mettre definir affecter donner valeur variable',
    variables_get: 'variable valeur lire utiliser',
    math_change: 'changer ajouter augmenter incrementer variable',
    procedures_defnoreturn: 'creer definir nouvelle fonction procedure',
    procedures_defreturn: 'creer definir nouvelle fonction retour resultat renvoyer',
    procedures_ifreturn: 'retourner renvoyer si fonction',
    procedures_callnoreturn: 'appeler appel executer lancer fonction procedure',
    procedures_callreturn: 'appeler appel utiliser resultat fonction procedure',
};
function blocsDynamiques() {
    const ws = window.workspace;
    const liste = [];
    const ajouter = (generateur, categorie) => {
        let defs = [];
        try { defs = Blockly.utils.toolbox.convertFlyoutDefToJsonArray(generateur(ws)); } catch (erreur) { return; }
        const scratch = new Blockly.Workspace();
        try { ws.getAllVariables().forEach(v => scratch.createVariable(v.name, v.type, v.getId())); } catch (erreur) { /* variables absentes : texte de repli */ }
        for (const def of defs) {
            let texte = '';
            if (String(def.kind).toUpperCase() === 'BUTTON') {
                texte = String(def.text || '').replace(/%\{BKY_(\w+)\}/g, (m, cle) => (Blockly.Msg && Blockly.Msg[cle]) || '');   // %{BKY_NEW_VARIABLE} -> « Creer une variable… »
            } else {
                try {
                    const b = Blockly.Xml.domToBlock(def.blockxml, scratch);
                    texte = b.toString(200, '?');
                    b.dispose(false);
                } catch (erreur) { texte = ''; }
            }
            const synonymes = SYNONYMES_DYNAMIQUES[def.type] || (String(def.kind).toUpperCase() === 'BUTTON' ? 'nouvelle variable ajouter' : '');
            liste.push({ def, texte: normaliser(texte + ' ' + synonymes + ' ' + String(def.type || '').replace(/_/g, ' ')), aide: '', categorie: normaliser(categorie), titre: categorie });
        }
        scratch.dispose();
    };
    ajouter(Blockly.Variables.flyoutCategory, 'Variables');
    ajouter(Blockly.Procedures.flyoutCategory, 'Fonctions');
    return liste;
}

function chercherEntrees(requete) {
    const mots = normaliser(requete).split(/\s+/).filter(Boolean);
    if (!mots.length) return [];
    if (!indexBlocs) indexBlocs = construireIndex();
    const premier = [], second = [];
    for (const e of indexBlocs.concat(blocsDynamiques())) {
        const base = e.texte + ' ' + e.categorie;
        if (mots.every(m => base.includes(m))) premier.push(e);
        else if (e.aide && mots.every(m => (base + ' ' + e.aide).includes(m))) second.push(e);
    }
    return premier.concat(second).slice(0, 40);
}
function chercherBlocs(requete) { return chercherEntrees(requete).map(e => e.def); }

// Contenu du tiroir de resultats, comme la version Arduino R4 : un petit titre par categorie (« Grove · LED »), ses
// blocs, puis un espace. Les categories gardent l'ordre de la colonne ; dans chacune, les blocs trouves par leur
// libelle passent avant ceux trouves par leur texte d'aide.
function contenuRecherche(requete) {
    const groupes = new Map();
    for (const e of chercherEntrees(requete)) {
        if (!groupes.has(e.titre)) groupes.set(e.titre, []);
        groupes.get(e.titre).push(e);
    }
    const rang = new Map();   // rang de chaque categorie dans la colonne (Variables et Fonctions, hors index : a la fin)
    (indexBlocs || []).forEach((e, i) => { if (!rang.has(e.titre)) rang.set(e.titre, i); });
    const titres = [...groupes.keys()].sort((a, b) => (rang.has(a) ? rang.get(a) : 1e6) - (rang.has(b) ? rang.get(b) : 1e6));
    const contenu = [];
    for (const titre of titres) {
        contenu.push({ kind: 'label', text: titre, 'web-class': 'titre-recherche' });
        groupes.get(titre).forEach(e => contenu.push(e.def));
        contenu.push({ kind: 'sep', gap: 28 });
    }
    return contenu;
}

const zoneRecherche = document.createElement('div');
zoneRecherche.id = 'recherche-blocs';
zoneRecherche.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true">' +
    '<circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>' +
    '<input type="search" id="recherche-blocs-champ" placeholder="Rechercher un bloc…" autocomplete="off" spellcheck="false" ' +
    'aria-label="Rechercher un bloc" title="Tapez au moins 2 lettres (« attendre », « LED », « servo »…) : les blocs correspondants s\'affichent">' +
    '<button type="button" id="recherche-blocs-effacer" title="Effacer la recherche" aria-label="Effacer la recherche">✕</button>';
const champRecherche = zoneRecherche.querySelector('input');
const boutonEffacer = zoneRecherche.querySelector('button');

function installerRecherche() {
    const boite = document.querySelector('.blocklyToolboxDiv');
    if (!boite) return;
    if (zoneRecherche.parentElement !== boite) boite.insertBefore(zoneRecherche, boite.firstChild);
}

let minuterieRecherche = null;
function lancerRecherche() {
    const toolbox = window.workspace && window.workspace.getToolbox && window.workspace.getToolbox();
    if (!toolbox) return;
    const tiroir = toolbox.getFlyout && toolbox.getFlyout();
    if (!tiroir) return;
    const requete = champRecherche.value;
    zoneRecherche.classList.toggle('remplie', !!requete);   // affiche la croix d'effacement
    if (requete.trim().length < 2) {             // comme la version Arduino R4 : la recherche commence a 2 lettres
        if (toolbox.clearSelection) toolbox.clearSelection();
        tiroir.autoClose = true;                 // comportement normal des categories
        tiroir.hide();
        return;
    }
    const contenu = contenuRecherche(requete);
    if (toolbox.clearSelection) toolbox.clearSelection();
    tiroir.autoClose = false;                    // le tiroir de resultats RESTE ouvert apres un depot (Echap ou effacer pour le fermer)
    tiroir.show(contenu.length ? contenu : [{ kind: 'label', text: 'Aucun bloc ne correspond à « ' + requete.trim() + ' »' }]);
}
function effacerRecherche() { champRecherche.value = ''; lancerRecherche(); }
champRecherche.addEventListener('input', () => { clearTimeout(minuterieRecherche); minuterieRecherche = setTimeout(lancerRecherche, 150); });
champRecherche.addEventListener('keydown', e => {
    if (e.key === 'Escape') { effacerRecherche(); e.stopPropagation(); }
});
boutonEffacer.addEventListener('click', () => { effacerRecherche(); champRecherche.focus(); });
// Choisir une categorie vide la recherche (le tiroir montre alors cette categorie).
document.addEventListener('click', e => {
    if (e.target.closest && e.target.closest('.blocklyToolboxCategory')) {
        if (champRecherche.value) { champRecherche.value = ''; zoneRecherche.classList.remove('remplie'); }
        const toolbox = window.workspace && window.workspace.getToolbox && window.workspace.getToolbox();
        const tiroir = toolbox && toolbox.getFlyout && toolbox.getFlyout();
        if (tiroir) tiroir.autoClose = true;     // une categorie se referme apres un depot, comme avant
    }
}, true);

installerRecherche();
{
    const boite = document.querySelector('.blocklyToolboxDiv');
    // La boite a outils est reconstruite (panneau administrateur) : la zone de recherche doit rester en tete.
    if (boite) new MutationObserver(installerRecherche).observe(boite, { childList: true });
}
window.bandeauTest = Object.assign(window.bandeauTest || {}, { chercherBlocs, blocsDynamiques, construireIndex: () => (indexBlocs = construireIndex()) });

// ---------- Nom du programme : largeur ajustee au texte, nom complet dans la bulle ----------
// Comme la version Arduino R4 : le cadre suit la longueur du nom (80 a 240 px, voir index.html) ; un nom plus long est
// coupe par « … » et la bulle le montre en entier. Le nom change aussi par programme (chargement d'un fichier, un.js) :
// le setter de .value du champ est enveloppe pour suivre ces changements.
const champNom = $('nom-fichier');
const cadreNom = $('tb-nomfichier');
const TITRE_NOM = cadreNom ? cadreNom.title : '';
function ajusterNom() {
    if (!champNom) return;
    const texte = champNom.value || champNom.placeholder || '';
    const ctx = (ajusterNom.c = ajusterNom.c || document.createElement('canvas')).getContext('2d');
    const style = getComputedStyle(champNom);
    ctx.font = style.fontWeight + ' ' + style.fontSize + ' ' + style.fontFamily;
    champNom.style.width = Math.min(216, Math.max(56, Math.ceil(ctx.measureText(texte).width) + 4)) + 'px';
    if (cadreNom) cadreNom.title = champNom.value ? champNom.value + ' — cliquez pour le renommer.' : TITRE_NOM;
}
if (champNom) {
    const valeur = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    Object.defineProperty(champNom, 'value', {
        configurable: true,
        get() { return valeur.get.call(this); },
        set(v) { valeur.set.call(this, v); ajusterNom(); compacterBientot(); },
    });
    champNom.addEventListener('input', () => { ajusterNom(); compacterBientot(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajusterNom);
}

// ---------- Fenetre « Donnez un nom a votre programme » / « Renommer le programme » ----------
// Comme la version Arduino R4 (demanderNomProgramme de blockly-jeulin.html, nov. 2026) : fond grise, titre sur le bandeau
// de couleur, champ, exemple, Valider (et Annuler si annulable). Renvoie une Promise : le nom saisi, ou null si annule.
// annulable = false : l'eleve doit donner un nom (premier bloc pose).
// options (fenetre « Exporter le modele » de l'IA) : { etiquette, exemple } a la place de ceux du nom du programme
function demanderNomProgramme(titre, texte, valeur, annulable, options) {
    return new Promise(resolve => {
        const ancien = $('fenetre-nom-voile');
        if (ancien) ancien.remove();
        const voile = document.createElement('div');
        voile.id = 'fenetre-nom-voile';
        voile.className = 'fen-voile';
        voile.innerHTML = '<div class="fen-boite" role="dialog" aria-modal="true" aria-labelledby="fenetre-nom-titre">'
            + '<h3 class="fen-titre" id="fenetre-nom-titre"></h3><div class="fen-corps"><p></p>'
            + '<input type="text" maxlength="60" autocomplete="off" spellcheck="false" aria-label="Nom du programme">'
            + '<span class="fen-exemple">Par exemple : feu-tricolore-groupe3</span></div>'
            + '<div class="fen-pied">' + (annulable ? '<button type="button" class="fen-btn annuler">Annuler</button>' : '')
            + '<button type="button" class="fen-btn principal">Valider</button></div></div>';
        voile.querySelector('h3').textContent = titre;
        voile.querySelector('p').textContent = texte;
        if (options && options.etiquette) voile.querySelector('input').setAttribute('aria-label', options.etiquette);
        if (options && options.exemple) voile.querySelector('.fen-exemple').textContent = options.exemple;
        const champ = voile.querySelector('input');
        const ok = voile.querySelector('.principal');
        champ.value = valeur || '';
        const majOk = () => { ok.disabled = !champ.value.trim(); };
        const finir = v => {
            voile.remove();
            document.removeEventListener('keydown', clavier, true);
            resolve(v);
        };
        const clavier = e => {
            if (e.key === 'Escape' && annulable) { e.stopPropagation(); finir(null); }
            else if (e.key === 'Enter' && !ok.disabled) { e.preventDefault(); finir(champ.value.trim()); }
        };
        champ.addEventListener('input', majOk);
        ok.onclick = () => finir(champ.value.trim());
        if (annulable) voile.querySelector('.annuler').onclick = () => finir(null);
        document.addEventListener('keydown', clavier, true);
        document.body.appendChild(voile);
        majOk();
        setTimeout(() => { champ.focus(); champ.select(); }, 30);
    });
}
window.demanderNomProgramme = demanderNomProgramme;

// Renommer : clic (ou Entree) sur le cadre du nom, dans le bandeau.
async function renommerProgramme() {
    if (!champNom) return;
    const saisie = await demanderNomProgramme('Renommer le programme', 'Nouveau nom pour votre programme :', champNom.value, true);
    if (saisie !== null) champNom.value = saisie.replace(/\.(hex|py)$/i, '');
}
if (cadreNom) {
    cadreNom.addEventListener('click', e => { e.preventDefault(); renommerProgramme(); });
    cadreNom.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); renommerProgramme(); } });
}

// Premier bloc pose par l'eleve dans un programme sans nom : il le nomme (comme le modele). Seuls les blocs poses a la
// main comptent (evenement enregistre pour « Annuler ») : le chargement d'un fichier, d'un exemple, d'un exercice ou d'une
// seance ne declenche rien. Pendant une visite guidee ou une autre fenetre de nom, on attend.
let nomEnAttente = false;
function visiteEnCours() { const b = $('tuto-bulle'); return !!b && getComputedStyle(b).display !== 'none'; }
function demanderNomAuPremierBloc() {
    if (!champNom || champNom.value.trim() || nomEnAttente) return;
    nomEnAttente = true;
    const essayer = () => {
        if (champNom.value.trim()) { nomEnAttente = false; return; }
        if (visiteEnCours() || $('fenetre-nom-voile')) { setTimeout(essayer, 800); return; }
        if (window.workspace && window.workspace.isDragging()) { setTimeout(essayer, 300); return; }   // bloc encore tenu
        demanderNomProgramme('Donnez un nom à votre programme',
            'Votre programme commence ! Quel nom voulez-vous lui donner ? C\'est le nom du fichier quand vous le téléchargerez.',
            '', false).then(nom => {
                nomEnAttente = false;
                if (nom) champNom.value = nom.replace(/\.(hex|py)$/i, '');
            });
    };
    setTimeout(essayer, 400);   // le bloc finit d'etre pose
}
if (window.workspace && window.Blockly) {
    window.workspace.addChangeListener(e => {
        if (e.type === Blockly.Events.BLOCK_CREATE && e.recordUndo) demanderNomAuPremierBloc();
    });
}

// ---------- Bandeau du haut : JAMAIS sur deux lignes ----------
// Comme la version Arduino R4 (r4-interface.js § 10) : le bandeau ne passe pas a la ligne (flex-wrap: nowrap, index.html) ;
// on choisit le plus petit palier de compactage qui le fait tenir (classes .compact-1 a .compact-5, cumulees), a chaque
// changement de taille de la fenetre et de texte dans le bandeau (nom du programme, « Arreter », « Masquer la console »...).
const PALIERS_BANDEAU = 5;
let compactageEnCours = false;
function compacterBandeau() {
    const barre = $('toolbar');
    if (!barre || compactageEnCours) return;
    compactageEnCours = true;
    const deborde = () => barre.scrollWidth > barre.clientWidth + 1;
    for (let n = 1; n <= PALIERS_BANDEAU; n++) barre.classList.remove('compact-' + n);
    for (let n = 1; n <= PALIERS_BANDEAU && deborde(); n++) barre.classList.add('compact-' + n);
    barre.dataset.palier = String([...barre.classList].filter(c => c.startsWith('compact-')).length);
    compactageEnCours = false;
}
let minuterieBandeau = null;
function compacterBientot() { clearTimeout(minuterieBandeau); minuterieBandeau = setTimeout(compacterBandeau, 30); }
ajusterNom();
compacterBandeau();
window.addEventListener('resize', compacterBientot);
if ($('toolbar')) new MutationObserver(compacterBientot).observe($('toolbar'), { subtree: true, childList: true, characterData: true });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(compacterBandeau);
window.bandeauTest.compacterBandeau = compacterBandeau;

// ---------- Barre de la simulation (comme la version Arduino R4, nov. 2026) ----------
// Menu « Affichage » : simulation seule, tableau seul (panneau « Peripheriques »...), ou les deux ; choix memorise.
const CLE_VUE_SIMU = 'affichageSimulation';
const conteneurSimu = $('simulator-container');
function appliquerVueSimu(vue) {
    if (!conteneurSimu) return;
    conteneurSimu.classList.toggle('vue-simulation', vue === 'simulation');
    conteneurSimu.classList.toggle('vue-tableau', vue === 'tableau');
    document.querySelectorAll('#sim-affichage [data-vue]').forEach(b => b.classList.toggle('choisi', b.dataset.vue === vue));
}
document.querySelectorAll('#sim-affichage [data-vue]').forEach(b => b.addEventListener('click', () => {
    try { localStorage.setItem(CLE_VUE_SIMU, b.dataset.vue); } catch (erreur) { /* choix oublie au rechargement */ }
    appliquerVueSimu(b.dataset.vue);
    window.dispatchEvent(new Event('resize'));   // la vue de la simulation se recale sur sa nouvelle taille
}));
let vueSimu = 'deux';
try { vueSimu = localStorage.getItem(CLE_VUE_SIMU) || 'deux'; } catch (erreur) { /* stockage indisponible */ }
appliquerVueSimu(['simulation', 'tableau', 'deux'].includes(vueSimu) ? vueSimu : 'deux');

// « Reinitialiser » = « Arreter » puis « Lancer la simulation », en un clic. Si la simulation tourne, on attend qu'elle
// soit vraiment arretee (3 s au plus) avant de la relancer ; sinon on la lance.
const boutonReinit = $('sim-reinit');
if (boutonReinit) {
    boutonReinit.addEventListener('click', () => {
        if (boutonReinit.disabled) return;
        if (window.simuEnCours !== true) { if ($('run-sim')) $('run-sim').click(); return; }
        boutonReinit.disabled = true;
        if ($('btn-reset')) $('btn-reset').click();
        const debut = performance.now();
        (function attendre() {
            if (window.simuEnCours === true && performance.now() - debut < 3000) { setTimeout(attendre, 30); return; }
            boutonReinit.disabled = false;
            if (window.simuEnCours !== true && $('run-sim')) $('run-sim').click();
        })();
    });
}

// Barre jamais sur deux lignes : libelles masques par paliers quand la colonne est etroite (icones seules).
const barreSimu = $('sim-barre');
function compacterBarreSimu() {
    if (!barreSimu) return;
    for (let n = 1; n <= 4; n++) barreSimu.classList.remove('compact-' + n);
    for (let n = 1; n <= 4 && barreSimu.scrollWidth > barreSimu.clientWidth + 1; n++) barreSimu.classList.add('compact-' + n);
}
if (barreSimu) {
    new ResizeObserver(compacterBarreSimu).observe(barreSimu);
    new MutationObserver(() => requestAnimationFrame(compacterBarreSimu)).observe(barreSimu, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden'] });
    compacterBarreSimu();
}

// ---------- Bouton « Accueil » : retour a la page d'accueil du lanceur (blockly_ts_lanceur) ----------
// L'editeur ouvert depuis la page d'accueil recoit l'adresse de retour :
//  - ?lanceur=<port>  lanceur local : retour vers http://localhost:<port>/ ;
//  - ?accueil=<url>   version en ligne : retour vers cette adresse, acceptee seulement sur jreynaud42000.github.io
//                     (ou localhost) pour qu'un lien exterieur ne puisse pas detourner le bouton.
// L'adresse est gardee pour l'onglet (sessionStorage) : le bouton reste apres un rechargement sans le parametre.
// Ouvert autrement (lancer_projet.bat, favori, exe), l'editeur n'affiche pas ce bouton.
function adresseAccueil() {
    const parametres = new URLSearchParams(location.search);
    const port = parametres.get('lanceur');
    if (/^\d{2,5}$/.test(port || '')) return 'http://localhost:' + port + '/';
    try {
        const url = new URL(parametres.get('accueil') || '');
        const local = url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname);
        if (local || (url.protocol === 'https:' && url.hostname === 'jreynaud42000.github.io')) return url.href;
    } catch (e) { /* parametre absent ou adresse invalide */ }
    return null;
}
function installerAccueil() {
    let adresse = adresseAccueil();
    try {
        if (adresse) sessionStorage.setItem('accueilLanceur', adresse);
        else adresse = sessionStorage.getItem('accueilLanceur');
    } catch (e) { /* stockage refuse : bouton seulement si le parametre est la */ }
    const barre = $('toolbar');
    if (!adresse || !barre || $('tb-accueil')) return;
    const lien = document.createElement('a');
    lien.id = 'tb-accueil';
    lien.className = 'tb-btn';
    lien.href = adresse;
    lien.title = "Revenir à l'accueil : choix de l'éditeur";
    lien.style.textDecoration = 'none';
    lien.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>' +
        '<span>Accueil</span>';
    barre.insertBefore(lien, barre.firstChild);
}
installerAccueil();
