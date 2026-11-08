// ia-immediat.js — apprentissage IMMEDIAT (sans entrainement) et lecture des QR codes.
//
// Complete ia.js (modeles Teachable Machine, chargement seulement) : les resultats passent
// par les memes fonctions (window.iaNoyau), donc par les memes blocs IA et la meme ligne
// envoyee au programme :
//     IA:vision:<classe>:<confiance>\n   IA:son:<classe>:<confiance>\n   IA:qr:<texte>:100\n
//
// 1. Apprentissage immediat (onglet « IA »)
//    Chaque exemple est resume en une EMPREINTE (des nombres) :
//      - objets et images : MobileNet v3 (MediaPipe Image Embedder), 1024 nombres ;
//      - signes de la main : les 21 points de la main (MediaPipe Hands), ramenes au
//        poignet et a la taille de la main, main gauche retournee : 63 nombres ;
//      - positions des bras : epaules, coudes, poignets (MediaPipe Pose), ramenes au
//        milieu des epaules et a leur largeur : 12 nombres ;
//      - sons et mots : le micro, timbre (MFCC) de 30 instants, 360 nombres
//        (ia-son-immediat.js). Les sons pilotent les blocs « son », le reste « vision ».
//    Reconnaitre = chercher les K exemples les plus proches : chacun vote pour sa
//    classe (k plus proches voisins). Aucun entrainement : un exemple ajoute compte
//    aussitot. Camera : les votes des LISSAGE dernieres images sont moyennes. Son : un
//    son reconnu le reste DUREE_SON ms, puis plus rien n'est reconnu.
//    Exemples (fenetre IA, une carte par classe) : « Une photo », « Plusieurs photos » jusqu'a « Arreter »,
//    « Ajouter des images » (.png / .jpg) ; sons : « Enregistrer » jusqu'a « Arreter ». Comme le modele R4 (et la
//    consigne du professeur, nov. 2026) : la camera et le micro ne s'allument JAMAIS sans un clic de l'eleve
//    (« Allumer la camera / le micro », une capture, « Demarrer ») ; ils s'eteignent quand la fenetre se ferme.
//    Chaque exemple a sa VIGNETTE (cliquer dessus le supprime) : petite photo pour les
//    objets et images (en memoire seulement, jamais enregistree), squelette dessine pour
//    les gestes et positions, dessin du timbre pour les sons.
//
// 2. QR codes et codes-barres (onglet « QR code ») : ZXing lit l'image de la
//    camera ; le texte (sans accents) part vers le programme. Un code qui n'est plus
//    vu depuis 700 ms n'est plus « visible ». La meme colonne cree un QR code a imprimer.
//
// Sauvegarde : l'apprentissage (les empreintes, JAMAIS les images ni les sons) est range
// dans le .py telecharge (lignes de commentaire « # >>> apprentissage-ia » a la fin,
// ignorees par MicroPython) et relu a son ouverture ; « 💾 Exporter » / « 📂 Importer »
// font la meme chose dans un fichier .json a part. Il n'est pas mis dans le .hex : la
// place y est comptee et la carte n'en a pas besoin.
//
// Donnees personnelles : l'image et le son restent dans le navigateur. Aucune requete
// hors de l'application : MediaPipe (lib/mediapipe) et ZXing (lib/zxing) sont embarques.

const MP = 'lib/mediapipe/';
const MAX_CLASSES = 8;
const MAX_EXEMPLES = 200;          // par classe, comme le modele R4 (taille du .py : environ 1,4 Ko par exemple d'image)
const K = 5;
const LISSAGE = 3;
const INTERVALLE_RECO_MS = 150;
const INTERVALLE_CAPTURE_MS = 120;
const DUREE_SON = 1000;            // ms : un son reconnu le reste ce temps
const INTERVALLE_QR_MS = 200;
const QR_VISIBLE_MS = 700;
const QR_LONGUEUR_MAX = 60;        // un texte plus long est coupe (affichage sur la carte)
const VIGNETTE_L = 48, VIGNETTE_H = 36;

const TYPES = {
    images: { nom: 'objets ou images', fichier: 'mobilenet_v3_small.tflite', genre: 'vision' },
    mains: { nom: 'signes de la main', fichier: 'hand_landmarker.task', genre: 'vision' },
    bras: { nom: 'positions des bras', fichier: 'pose_landmarker_lite.task', genre: 'vision' },
    sons: { nom: 'sons ou mots', fichier: null, genre: 'son' },
};

const $ = (sel, racine = document) => racine.querySelector(sel);

// Icones au trait de la fenetre IA (consigne du professeur : pas d'emojis, icones SVG au trait, nov. 2026)
const TRAITS_IA = {
    photo: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>',
    rafale: '<rect x="3" y="7" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>',
    dossier: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
    micro: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M12 18v4"/>',
    gomme: '<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="1.5"/>',
};
const icone = nom => '<svg class="ia-icone" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + TRAITS_IA[nom] + '</svg>';
const avecIcone = (nom, texte) => icone(nom) + '<span>' + texte + '</span>';

const col = $('.ia-colonne[data-genre="immediat"]');
const colQR = $('.ia-colonne[data-genre="qr"]');
const noyau = () => window.iaNoyau;
const son = () => window.iaSonImmediat;
const attente = ms => new Promise(r => setTimeout(r, ms));
const messageErreur = e => (e && e.message ? e.message : String(e));

/** Nom d'une classe creee par le logiciel (« Classe 1 », « Class 1 » en anglais). */
const nomClasse = n => window.tr ? window.tr('Classe {n}', { n }) : 'Classe ' + n;

// ---------- etat ----------
// classes : [{ nom, ex: [{ v: Float32Array, vignette: dataURL | null }] }]
const etat = {
    type: 'images',
    classes: [{ nom: nomClasse(1), ex: [] }, { nom: nomClasse(2), ex: [] }],
    enMarche: false, minuteur: null, occupe: false, historique: [], finSon: null,
};
const estSon = () => etat.type === 'sons';
const genre = () => TYPES[etat.type].genre;

function dire(texte) { const e = $('.ia-statut', col); if (e) e.textContent = texte; }
function direCreer(texte) { const e = $('.ia-creer-statut', col); if (e) e.textContent = texte; }

// ---------- MediaPipe (charge au premier besoin) ----------
let mediapipe = null;
const modeles = {};

// Le navigateur n'importe un module que si le serveur l'annonce comme JavaScript.
// app.py le fait ; pour un autre serveur qui annoncerait text/plain, on relit le
// fichier et on l'importe sous la bonne etiquette (toujours en local).
async function importerModule(adresse) {
    try {
        return await import(adresse);
    } catch (erreur) {
        const r = await fetch(adresse);
        if (!r.ok) throw new Error('bibliothèque introuvable : ' + adresse + ' (' + r.status + ')');
        const url = URL.createObjectURL(new Blob([await r.text()], { type: 'text/javascript' }));
        try { return await import(url); } finally { URL.revokeObjectURL(url); }
    }
}

function chargerMediapipe() {
    if (!mediapipe) {
        const base = new URL(MP, location.href).href;
        mediapipe = (async () => {
            const mp = await importerModule(base + 'vision_bundle.mjs');
            return { mp, fichiers: await mp.FilesetResolver.forVisionTasks(base + 'wasm') };
        })();
        mediapipe.catch(() => { mediapipe = null; });
    }
    return mediapipe;
}

// Les sons n'ont pas de modele a charger (calcul fait dans ia-son-immediat.js).
function modele(type) {
    if (type === 'sons') return Promise.resolve(null);
    if (!modeles[type]) {
        const base = new URL(MP, location.href).href;
        modeles[type] = chargerMediapipe().then(({ mp, fichiers }) => {
            const options = { baseOptions: { modelAssetPath: base + TYPES[type].fichier, delegate: 'CPU' }, runningMode: 'IMAGE' };
            if (type === 'mains') return mp.HandLandmarker.createFromOptions(fichiers, { ...options, numHands: 1 });
            if (type === 'bras') return mp.PoseLandmarker.createFromOptions(fichiers, { ...options, numPoses: 1 });
            return mp.ImageEmbedder.createFromOptions(fichiers, { ...options, l2Normalize: true, quantize: false });
        });
        modeles[type].catch(() => { delete modeles[type]; });
    }
    return modeles[type];
}

// ---------- empreintes ----------
const LIAISONS_MAIN = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11],
    [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]];
const POINTS_BRAS = [11, 12, 13, 14, 15, 16];                    // epaules, coudes, poignets
const LIAISONS_BRAS = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24]];
// Les memes liaisons, numerotees dans l'empreinte des bras (0 a 5 = points 11 a 16).
const LIAISONS_EMPREINTE_BRAS = [[0, 1], [0, 2], [2, 4], [1, 3], [3, 5]];

// Les points de MediaPipe sont en fractions de la largeur et de la hauteur : multiplier x
// par le rapport largeur / hauteur rend les distances comparables dans les deux sens.
function formeMain(points, gauche, rapport) {
    const o = points[0];
    const sens = gauche ? -1 : 1;                                 // main gauche vue comme une droite
    const p = points.map(q => [(q.x - o.x) * rapport * sens, q.y - o.y, (q.z - o.z) * rapport]);
    const taille = Math.max(...p.map(([x, y]) => Math.hypot(x, y))) || 1;
    return Float32Array.from(p.flatMap(([x, y, z]) => [x / taille, y / taille, z / taille]));
}

// Pas de retournement ici : « bras gauche leve » et « bras droit leve » restent differents.
function formeBras(points, rapport) {
    const g = points[11], d = points[12];
    const cx = (g.x + d.x) / 2, cy = (g.y + d.y) / 2;
    const largeur = Math.hypot((g.x - d.x) * rapport, g.y - d.y) || 1;
    return Float32Array.from(POINTS_BRAS.flatMap(i => [(points[i].x - cx) * rapport / largeur, (points[i].y - cy) / largeur]));
}

// Une image (video, toile, ImageBitmap) -> { v, points, liaisons } ou null si rien d'utilisable.
async function empreinte(source, largeur, hauteur) {
    const m = await modele(etat.type);
    const rapport = largeur / hauteur;
    if (etat.type === 'mains') {
        const r = m.detect(source);
        if (!r.landmarks || !r.landmarks.length) return null;
        const cote = r.handedness && r.handedness[0] && r.handedness[0][0];
        return { v: formeMain(r.landmarks[0], !!cote && cote.categoryName === 'Left', rapport), points: r.landmarks[0], liaisons: LIAISONS_MAIN };
    }
    if (etat.type === 'bras') {
        const r = m.detect(source);
        const p = r.landmarks && r.landmarks[0];
        if (!p || (p[11].visibility || 0) < 0.5 || (p[12].visibility || 0) < 0.5) return null;   // les deux epaules
        return { v: formeBras(p, rapport), points: p, liaisons: LIAISONS_BRAS };
    }
    const r = m.embed(source);
    return { v: Float32Array.from(r.embeddings[0].floatEmbedding), points: null, liaisons: null };
}

// Plus grand = plus ressemblant. Images : empreintes de longueur 1, le produit scalaire
// est le cosinus. Squelettes : moins le carre de la distance. Sons : moins la distance
// apres alignement dans le temps (DTW).
function proximite(a, b) {
    if (etat.type === 'sons') return -son().distance(a, b);
    let s = 0;
    if (etat.type === 'images') { for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }
    for (let i = 0; i < a.length; i++) { const d = a[i] - b[i]; s += d * d; }
    return -s;
}

// K plus proches voisins : part des votes de chaque classe (0..1), ou null s'il manque des exemples.
function voter(v) {
    if (etat.classes.filter(c => c.ex.length).length < 2) return null;
    const voisins = [];
    etat.classes.forEach((c, i) => c.ex.forEach(e => voisins.push([proximite(v, e.v), i])));
    voisins.sort((a, b) => b[0] - a[0]);
    const k = Math.min(K, voisins.length);
    const voix = etat.classes.map(() => 0);
    for (let i = 0; i < k; i++) voix[voisins[i][1]] += 1 / k;
    return voix;
}

// ---------- vignettes ----------
// Gestes et positions : le squelette est redessine a partir de l'EMPREINTE (jamais la photo),
// en miroir comme l'apercu de la camera. Il se redessine donc aussi apres une ouverture de fichier.
function vignetteSquelette(v, type) {
    const pts = [], liaisons = type === 'mains' ? LIAISONS_MAIN : LIAISONS_EMPREINTE_BRAS;
    const pas = type === 'mains' ? 3 : 2;
    for (let i = 0; i + 1 < v.length; i += pas) pts.push([-v[i], v[i + 1]]);
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const echelle = Math.min((VIGNETTE_L - 8) / ((x1 - x0) || 1), (VIGNETTE_H - 8) / ((y1 - y0) || 1));
    const ox = (VIGNETTE_L - (x1 - x0) * echelle) / 2 - x0 * echelle, oy = (VIGNETTE_H - (y1 - y0) * echelle) / 2 - y0 * echelle;
    const toile = document.createElement('canvas');
    toile.width = VIGNETTE_L; toile.height = VIGNETTE_H;
    const ctx = toile.getContext('2d');
    ctx.fillStyle = '#1b1d21'; ctx.fillRect(0, 0, VIGNETTE_L, VIGNETTE_H);
    ctx.strokeStyle = '#2ecc71'; ctx.lineWidth = 1.5;
    for (const [a, b] of liaisons) {
        ctx.beginPath(); ctx.moveTo(ox + pts[a][0] * echelle, oy + pts[a][1] * echelle);
        ctx.lineTo(ox + pts[b][0] * echelle, oy + pts[b][1] * echelle); ctx.stroke();
    }
    ctx.fillStyle = '#ffffff';
    for (const [x, y] of pts) { ctx.beginPath(); ctx.arc(ox + x * echelle, oy + y * echelle, 1.3, 0, 2 * Math.PI); ctx.fill(); }
    return toile.toDataURL('image/png');
}

// Objets et images : petite photo du carre central, en memoire seulement (pas dans le .py).
const toileVignette = document.createElement('canvas');
toileVignette.width = VIGNETTE_L; toileVignette.height = VIGNETTE_H;
function vignettePhoto(source, largeur, hauteur, miroir) {
    const ctx = toileVignette.getContext('2d');
    const rapport = VIGNETTE_L / VIGNETTE_H;
    const l = Math.min(largeur, hauteur * rapport), h = l / rapport;
    ctx.save();
    if (miroir) { ctx.translate(VIGNETTE_L, 0); ctx.scale(-1, 1); }
    ctx.drawImage(source, (largeur - l) / 2, (hauteur - h) / 2, l, h, 0, 0, VIGNETTE_L, VIGNETTE_H);
    ctx.restore();
    return toileVignette.toDataURL('image/jpeg', 0.7);
}

// Vignette d'un exemple : calculee a la demande si elle manque (exemple relu d'un fichier).
function vignetteDe(e) {
    if (e.vignette === undefined) {
        e.vignette = etat.type === 'sons' ? son().vignette(e.v, VIGNETTE_L, VIGNETTE_H)
            : etat.type === 'images' ? null : vignetteSquelette(e.v, etat.type);
    }
    return e.vignette;
}

// Compteur d'une carte de classe : le nombre (lu par la visite guidee) puis « exemple(s) ».
function majCompte(compteur, n) {
    compteur.textContent = String(n);
    if (compteur.nextElementSibling) compteur.nextElementSibling.textContent = n > 1 ? ' exemples' : ' exemple';
}

function elementVignette(c, e, compteur) {
    const b = document.createElement('button');
    b.className = 'ia-imm-vignette';
    b.title = 'Exemple de « ' + c.nom + ' » — cliquer pour le supprimer';
    const src = vignetteDe(e);
    if (src) { const img = document.createElement('img'); img.src = src; img.alt = ''; b.appendChild(img); }
    else b.textContent = '▣';                         // photo non conservee (exemple relu d'un fichier)
    b.addEventListener('click', () => {
        const i = c.ex.indexOf(e);
        if (i >= 0) c.ex.splice(i, 1);
        b.remove();
        if (compteur) majCompte(compteur, c.ex.length);
        etat.historique = [];
        majDemarrer();
        direCreer('Exemple supprimé de « ' + c.nom + ' » (' + c.ex.length + ' restant' + (c.ex.length > 1 ? 's' : '') + ').');
    });
    return b;
}

// ---------- camera, micro et apercu ----------
const video = $('.ia-imm-video', col);
const calque = $('.ia-imm-calque', col);
const niveau = $('.ia-imm-niveau', col);

function brancherApercu(element, allumer) {
    const flux = noyau().camera.flux;
    element.srcObject = allumer ? flux : null;
    // Le cadre de l'apprentissage immediat reste affiche (noir, « Caméra éteinte ») ; celui des QR codes se replie.
    const cadre = element.closest('.ia-imm-cadre');
    cadre.classList.toggle(cadre.dataset.toujours ? 'eteint' : 'replie', !allumer);
    if (allumer) element.play().catch(() => {});
}

// Garde un cadre aux proportions de la video : le squelette se superpose exactement.
function ajusterCadre(element) {
    if (!element.videoWidth) return;
    const cadre = element.closest('.ia-imm-cadre');
    cadre.style.height = Math.round(cadre.clientWidth * element.videoHeight / element.videoWidth) + 'px';
}

// Jauge du micro : volume au-dessus du bruit de fond ; verte pendant un son detecte.
function afficherNiveau(db, fond, enSon) {
    const i = niveau.firstElementChild;
    i.style.width = Math.max(0, Math.min(100, (db - fond) * 3)) + '%';
    niveau.classList.toggle('son', enSon);
}

// Les rappels du micro vont a la capture (« Enregistrer » en cours) ou a la reconnaissance.
let captureSon = null;
function surSon(v) {
    if (captureSon) { captureSon(v); return; }
    if (etat.enMarche && estSon()) reconnaitreSon(v);
}

async function allumerCapteur(raison) {
    if (estSon()) {
        await son().allumer(raison, { surSon, surNiveau: afficherNiveau });
        niveau.classList.remove('replie');
        return;
    }
    await noyau().ouvrirCamera(raison);
    brancherApercu(video, true);
}

function eteindreCapteur(raison) {
    son().eteindre(raison);
    if (!son().allume()) { niveau.classList.add('replie'); afficherNiveau(-100, 0, false); }
    noyau().fermerCamera(raison);
    const encore = noyau().camera.raisons;
    if (!encore.has('imm-capture') && !encore.has('imm-reco')) { brancherApercu(video, false); effacerCalque(); }
}

const capteurAllume = raison => (estSon() ? son().allume(raison) : noyau().camera.raisons.has(raison));

function effacerCalque() { calque.getContext('2d').clearRect(0, 0, calque.width, calque.height); }

function dessinerSquelette(resultat) {
    calque.width = calque.clientWidth; calque.height = calque.clientHeight;
    const ctx = calque.getContext('2d');
    ctx.clearRect(0, 0, calque.width, calque.height);
    if (!resultat || !resultat.points) return;
    const p = resultat.points, l = calque.width, h = calque.height;
    ctx.strokeStyle = '#2ecc71'; ctx.fillStyle = '#ffffff'; ctx.lineWidth = 2;
    for (const [a, b] of resultat.liaisons) {
        if (!p[a] || !p[b]) continue;
        ctx.beginPath(); ctx.moveTo(p[a].x * l, p[a].y * h); ctx.lineTo(p[b].x * l, p[b].y * h); ctx.stroke();
    }
    const utiles = etat.type === 'bras' ? [11, 12, 13, 14, 15, 16, 23, 24] : p.map((_, i) => i);
    for (const i of utiles) { if (p[i]) { ctx.beginPath(); ctx.arc(p[i].x * l, p[i].y * h, 2.5, 0, 2 * Math.PI); ctx.fill(); } }
}

// ---------- classes (interface) ----------
function nomsClasses() { return etat.classes.map(c => c.nom.trim()).filter(Boolean); }

// Renommer une classe met a jour les blocs IA (du genre de l'apprentissage) qui l'utilisaient.
function renommerDansLesBlocs(ancien, nouveau) {
    const ws = window.workspace;
    if (!ws || !window.slugIA || !ancien || !nouveau || window.slugIA(ancien) === window.slugIA(nouveau)) return;
    const cle = window.slugIA(ancien);
    Blockly.Events.setGroup(true);
    try {
        for (const b of ws.getAllBlocks(false)) {
            if ((b.type === 'ia_lorsque_reconnu' || b.type === 'ia_classe_est') &&
                b.getFieldValue('TYPE') === genre() && window.slugIA(b.getFieldValue('CLASSE')) === cle) {
                b.setFieldValue(nouveau, 'CLASSE');
            }
        }
    } finally {
        Blockly.Events.setGroup(false);
    }
}

// Textes qui changent selon ce que l'on apprend : images (camera) ou sons (micro).
const AIDES = {
    images: 'Pour chaque classe, prenez des photos avec la webcam : « Une photo » à chaque clic, ou « Plusieurs photos » ' +
        'en montrant l\'objet sous plusieurs angles, puis « Arrêter ». Vous pouvez aussi ajouter des images (.png, .jpg). Une ' +
        'vingtaine d\'exemples par classe suffit souvent. Ensuite, testez : les barres montrent ce que l\'IA reconnaît. ' +
        'Cliquer sur une vignette supprime cet exemple.',
    mains: 'Pour chaque classe, montrez le signe de la main à la webcam (une seule main, bien éclairée) : « Une photo » à chaque clic, ou ' +
        '« Plusieurs photos » en bougeant un peu la main, puis « Arrêter ». Une vingtaine d\'exemples par classe suffit souvent. ' +
        'Ensuite, testez : les barres montrent ce que l\'IA reconnaît. Cliquer sur une vignette supprime cet exemple.',
    bras: 'Reculez pour que le haut du corps soit dans l\'image, puis prenez la position de chaque classe : « Une photo » à chaque ' +
        'clic, ou « Plusieurs photos » en bougeant un peu, puis « Arrêter ». Ensuite, testez : les barres montrent ce que l\'IA ' +
        'reconnaît. Cliquer sur une vignette supprime cet exemple.',
    sons: 'Pour chaque classe, cliquez « Enregistrer », faites le son (ou dites le mot) plusieurs fois avec un court silence entre ' +
        'deux, puis « Arrêter » : chaque son détecté devient un exemple. Pas besoin de classe « bruit de fond » : le silence ne ' +
        'déclenche rien. Ensuite, testez. Cliquer sur une vignette supprime cet exemple.',
};
const PRIVE = {
    images: 'Les images restent dans l\'ordinateur. Seul un résumé chiffré de chaque exemple est gardé, et il est enregistré avec votre programme (.py).',
    mains: 'Les images restent dans l\'ordinateur. Seul le squelette de la main (des nombres) est gardé, et il est enregistré avec votre programme (.py).',
    bras: 'Les images restent dans l\'ordinateur. Seul le squelette du haut du corps (des nombres) est gardé, et il est enregistré avec votre programme (.py).',
    sons: 'Le son reste dans l\'ordinateur. Seul un dessin du timbre (des nombres) est gardé, et il est enregistré avec votre programme (.py).',
};
function majTextesType() {
    const bouton = $('.ia-imm-camera', col);
    const allume = capteurAllume('imm-capture');
    bouton.innerHTML = estSon() ? avecIcone('micro', allume ? 'Éteindre le micro' : 'Allumer le micro') : avecIcone('photo', allume ? 'Éteindre la caméra' : 'Allumer la caméra');
    bouton.title = estSon() ? 'Allumer ou éteindre le micro' : 'Allumer ou éteindre la caméra';
    bouton.classList.toggle('en-marche', allume);
    col.classList.toggle('type-sons', estSon());
    $('.ia-sous-titre', col).textContent = estSon() ? 'micro' : 'caméra';
    $('.ia-creer-aide', col).textContent = AIDES[etat.type];
    $('.ia-imm-prive', col).textContent = PRIVE[etat.type];
}

// Une carte par classe : nom modifiable, nombre d'exemples, vider, supprimer ; boutons de capture ; vignettes.
function majLignes() {
    arreterRafale();
    const conteneur = $('.ia-creer-classes', col);
    conteneur.textContent = '';
    const bouton = (classe, texte, titre) => {
        const b = document.createElement('button');
        b.className = 'btn-vue ' + classe; b.textContent = texte; b.title = titre;
        return b;
    };
    etat.classes.forEach((c, i) => {
        const l = document.createElement('div');
        l.className = 'ia-ex ia-imm-ex' + (estSon() ? ' sans-images' : '');
        const haut = document.createElement('div');
        haut.className = 'ia-ex-haut';
        const nom = document.createElement('input');
        nom.className = 'ia-ex-nom'; nom.value = c.nom; nom.spellcheck = false; nom.maxLength = 30;
        nom.title = 'Nom de la classe (cliquer pour le changer)'; nom.setAttribute('aria-label', 'Nom de la classe');
        let avant = c.nom;
        nom.addEventListener('input', () => { c.nom = nom.value; });
        nom.addEventListener('change', () => {
            const propre = nom.value.trim();
            if (!propre || etat.classes.some((x, j) => j !== i && window.slugIA(x.nom) === window.slugIA(propre))) {
                direCreer(propre ? 'Deux classes portent le même nom.' : 'Chaque classe doit avoir un nom.');
                c.nom = nom.value = avant;
                return;
            }
            c.nom = nom.value = propre;
            renommerDansLesBlocs(avant, propre);
            avant = propre;
            majBarres();
        });
        const compte = document.createElement('span'); compte.className = 'ia-ex-compte';
        const n = document.createElement('span'); n.className = 'ia-ex-n';
        compte.append(n, document.createElement('span'));
        majCompte(n, c.ex.length);
        const vider = bouton('ia-ex-icone ia-ex-vider', '', 'Effacer les exemples de cette classe (la classe reste)');
        vider.innerHTML = icone('gomme');
        vider.addEventListener('click', () => {
            if (c.ex.length && !confirm('Effacer les ' + c.ex.length + ' exemple(s) de « ' + c.nom + ' » ?')) return;
            c.ex = []; apresModification();
            direCreer('Exemples de « ' + c.nom + ' » effacés.');
        });
        const sup = bouton('ia-ex-icone ia-ex-sup', '✕', 'Supprimer cette classe et ses exemples');
        sup.addEventListener('click', () => {
            if (c.ex.length && !confirm('Supprimer la classe « ' + c.nom + ' » et ses ' + c.ex.length + ' exemple(s) ?')) return;
            etat.classes.splice(i, 1); apresModification();
        });
        haut.append(nom, compte, vider, sup);
        const vignettes = document.createElement('div');
        vignettes.className = 'ia-imm-vignettes';
        c.ex.forEach(e => vignettes.appendChild(elementVignette(c, e, n)));
        const actions = document.createElement('div');
        actions.className = 'ia-ex-actions';
        if (estSon()) {
            const enr = bouton('ia-ex-capt', '', 'Écouter le micro : chaque son détecté devient un exemple, jusqu\'à « Arrêter »');
            enr.innerHTML = enr.dataset.html = avecIcone('micro', 'Enregistrer');
            enr.addEventListener('click', () => basculerRafale(enr, c, n, vignettes));
            actions.append(enr);
        } else {
            const une = bouton('ia-ex-photo', '', 'Ajouter un exemple : l\'image actuelle de la caméra');
            une.innerHTML = avecIcone('photo', 'Une photo');
            une.addEventListener('click', () => unePhoto(c, n, vignettes));
            const plusieurs = bouton('ia-ex-capt', '', 'Ajouter des exemples en rafale, jusqu\'à « Arrêter »');
            plusieurs.innerHTML = plusieurs.dataset.html = avecIcone('rafale', 'Plusieurs photos');
            plusieurs.addEventListener('click', () => basculerRafale(plusieurs, c, n, vignettes));
            const fichiers = bouton('ia-imm-images', '', 'Ajouter des exemples depuis des images (.png, .jpg)');
            fichiers.innerHTML = avecIcone('dossier', 'Ajouter des images');
            fichiers.addEventListener('click', () => { entreeImages.dataset.classe = String(i); entreeImages.click(); });
            actions.append(une, plusieurs, fichiers);
        }
        l.append(haut, actions, vignettes);
        conteneur.appendChild(l);
    });
    $('.ia-ajouter-classe', col).disabled = etat.classes.length >= MAX_CLASSES;
}

// Barres de resultat : meme balisage que les colonnes Teachable Machine (ia.js).
function majBarres() {
    const conteneur = $('.ia-classes', col);
    conteneur.textContent = '';
    for (const c of etat.classes) {
        const l = document.createElement('div');
        l.className = 'ia-classe';
        const n = document.createElement('span'); n.className = 'ia-classe-nom'; n.textContent = c.nom; n.title = c.nom;
        const b = document.createElement('span'); b.className = 'ia-classe-barre'; b.appendChild(document.createElement('i'));
        const p = document.createElement('span'); p.className = 'ia-classe-pct'; p.textContent = '0 %';
        l.append(n, b, p);
        conteneur.appendChild(l);
    }
}

function majDemarrer() {
    const b = $('.ia-demarrer', col);
    b.innerHTML = etat.enMarche ? avecIcone('stop', 'Arrêter la comparaison') : '▶ Démarrer la comparaison';   // libelles du modele R4
    b.classList.toggle('en-marche', etat.enMarche);
    b.disabled = !etat.enMarche && etat.classes.filter(c => c.ex.length).length < 2;
}

function apresModification() {
    etat.historique = [];
    majTextesType();
    majLignes();
    majBarres();
    majDemarrer();
}

// ---------- ajout d'exemples ----------
function ajouterExemple(c, v, vignette, vignettes, compteur) {
    if (c.ex.length >= MAX_EXEMPLES) return false;
    const e = { v, vignette };
    c.ex.push(e);
    if (vignettes) vignettes.appendChild(elementVignette(c, e, compteur));
    return true;
}

const MESSAGE_RIEN = {
    mains: 'Aucune main détectée : montrez une seule main, bien éclairée.',
    bras: 'Épaules non visibles : reculez pour que le haut du corps soit dans l\'image.',
    images: '',
    sons: '',
};

// Capteur pret pour une capture : allume a la demande (camera : attendre la premiere image).
async function capteurPret() {
    const pret = () => (estSon() ? son().allume() : (!!noyau().camera.flux && video.readyState >= 2));
    if (pret()) return true;
    try {
        await allumerCapteur('imm-capture');
        majTextesType();
        for (let t = 0; !pret() && t < 40; t++) await attente(100);
        return pret();
    } catch (erreur) {
        direCreer(messageCapteur(erreur));
        majTextesType();
        return false;
    }
}
function messageCapteur(erreur) {
    const refus = erreur && (erreur.name === 'NotAllowedError' || erreur.name === 'SecurityError');
    if (estSon()) return refus ? 'Micro refusé : autorisez-le dans le navigateur.' : 'Micro indisponible : ' + messageErreur(erreur);
    return (refus ? 'Caméra refusée par le navigateur' : 'Caméra indisponible') + ' : vous pouvez quand même ajouter des images.';
}

// Une image de la camera -> un exemple. Renvoie false quand le maximum est atteint.
async function capturerUne(c, compteur, vignettes) {
    const l = video.videoWidth, h = video.videoHeight;
    const r = await empreinte(video, l, h);
    dessinerSquelette(r);
    const vignette = r && (etat.type === 'images' ? vignettePhoto(video, l, h, true) : vignetteSquelette(r.v, etat.type));
    if (!r) { direCreer(MESSAGE_RIEN[etat.type] || 'Image inutilisable.'); return true; }
    if (!ajouterExemple(c, r.v, vignette, vignettes, compteur)) { direCreer('Maximum atteint : ' + MAX_EXEMPLES + ' exemples par classe.'); return false; }
    majCompte(compteur, c.ex.length);
    direCreer('Exemple ajouté à « ' + c.nom + ' » (' + c.ex.length + ').');
    majDemarrer();
    return true;
}

async function unePhoto(c, compteur, vignettes) {
    if (rafale) return;
    if (!(await capteurPret())) return;
    try {
        direCreer('Chargement du modèle « ' + TYPES[etat.type].nom + ' »…');
        await modele(etat.type);
        await capturerUne(c, compteur, vignettes);
    } catch (erreur) {
        direCreer('Capture impossible : ' + messageErreur(erreur));
    }
}

// « Plusieurs photos » (camera) ou « Enregistrer » (micro) : capture continue jusqu'a un second clic.
let rafale = null;                  // { bouton } pendant une capture continue
function arreterRafale() {
    if (!rafale) return;
    const b = rafale.bouton;
    rafale = null; captureSon = null;
    b.classList.remove('enregistre');
    b.innerHTML = b.dataset.html;
    majDemarrer();
}
async function basculerRafale(bouton, c, compteur, vignettes) {
    if (rafale && rafale.bouton === bouton) { arreterRafale(); direCreer('Capture arrêtée : ' + c.ex.length + ' exemple(s) dans « ' + c.nom + ' ».'); return; }
    arreterRafale();
    if (!(await capteurPret())) return;
    const moi = { bouton };
    rafale = moi;
    bouton.classList.add('enregistre');
    bouton.innerHTML = avecIcone('stop', 'Arrêter');
    if (estSon()) {
        // Le micro ecoute deja : chaque son detecte pendant l'enregistrement devient un exemple.
        direCreer('Faites le son « ' + c.nom + ' » (plusieurs fois, avec un court silence entre deux).');
        captureSon = v => {
            if (!ajouterExemple(c, v, son().vignette(v, VIGNETTE_L, VIGNETTE_H), vignettes, compteur)) {
                direCreer('Maximum atteint : ' + MAX_EXEMPLES + ' exemples par classe.'); arreterRafale(); return;
            }
            majCompte(compteur, c.ex.length);
            direCreer('Son ajouté à « ' + c.nom + ' » (' + c.ex.length + ').');
            majDemarrer();
        };
        return;
    }
    try {
        direCreer('Chargement du modèle « ' + TYPES[etat.type].nom + ' »…');
        await modele(etat.type);
        if (rafale === moi) direCreer('Capture en cours : montrez « ' + c.nom + ' » sous plusieurs angles.');
        while (rafale === moi) {
            if (!(await capturerUne(c, compteur, vignettes))) break;
            await attente(INTERVALLE_CAPTURE_MS);
        }
    } catch (erreur) {
        direCreer('Capture impossible : ' + messageErreur(erreur));
    }
    if (rafale === moi) arreterRafale();
}

const entreeImages = $('.ia-imm-fichiers', col);
const toileImage = document.createElement('canvas');

async function ajouterImages(c, fichiers) {
    direCreer('Chargement du modèle « ' + TYPES[etat.type].nom + ' »…');
    let ajoutes = 0, rejetes = 0;
    try {
        await modele(etat.type);
        for (const f of fichiers) {
            let image = null;
            try {
                image = await createImageBitmap(f);
                toileImage.width = image.width; toileImage.height = image.height;
                toileImage.getContext('2d').drawImage(image, 0, 0);
                const r = await empreinte(toileImage, image.width, image.height);
                const vignette = r && (etat.type === 'images' ? vignettePhoto(toileImage, image.width, image.height, false) : vignetteSquelette(r.v, etat.type));
                if (r && ajouterExemple(c, r.v, vignette)) ajoutes++; else rejetes++;
            } catch (erreur) {
                rejetes++;
            } finally {
                if (image && image.close) image.close();
            }
            direCreer('Images : ' + ajoutes + ' ajoutée(s)…');
        }
        direCreer(ajoutes + ' image(s) ajoutée(s) à « ' + c.nom + ' »' +
            (rejetes ? ', ' + rejetes + ' refusée(s) (' + (MESSAGE_RIEN[etat.type] || 'illisible ou maximum atteint') + ')' : '') + '.');
    } catch (erreur) {
        direCreer('Chargement impossible : ' + messageErreur(erreur));
    }
    apresModification();
}

entreeImages.addEventListener('change', () => {
    const c = etat.classes[Number(entreeImages.dataset.classe)];
    const fichiers = Array.from(entreeImages.files);
    entreeImages.value = '';
    if (c && fichiers.length) ajouterImages(c, fichiers);
});

// ---------- reconnaissance ----------
async function demarrer() {
    if (etat.enMarche) return;
    if (etat.classes.filter(c => c.ex.length).length < 2) { dire('Il faut au moins 2 classes avec des exemples.'); return; }
    const noms = nomsClasses();
    if (noms.length !== etat.classes.length || new Set(noms.map(n => window.slugIA(n))).size !== noms.length) {
        dire('Chaque classe doit avoir un nom différent.'); return;
    }
    // Un seul moteur a la fois par genre : le modele Teachable Machine du meme genre s'arrete.
    if (noyau().moteurs[genre()].enMarche) noyau().arreter(genre());
    dire(estSon() ? 'Démarrage du micro…' : 'Chargement du modèle « ' + TYPES[etat.type].nom + ' »…');
    try {
        await modele(etat.type);
        await allumerCapteur('imm-reco');
    } catch (erreur) {
        const refus = erreur && (erreur.name === 'NotAllowedError' || erreur.name === 'SecurityError');
        const quoi = estSon() ? 'le micro' : 'la caméra';
        dire(refus ? 'Accès refusé : autorisez ' + quoi + ' dans le navigateur.'
            : erreur && erreur.name === 'NotFoundError' ? (estSon() ? 'Aucun micro détecté.' : 'Aucune caméra détectée.')
            : 'Démarrage impossible : ' + messageErreur(erreur));
        return;
    }
    etat.enMarche = true;
    etat.historique = [];
    majBarres();
    if (estSon()) {
        // Rien n'est reconnu tant qu'aucun son n'est entendu : le programme part d'une classe vide.
        noyau().traiterResultat('son', etat.classes.map(c => ({ nom: c.nom, proba: 0 })), col);
    } else {
        etat.minuteur = setInterval(reconnaitre, INTERVALLE_RECO_MS);
    }
    dire('Reconnaissance en marche (' + TYPES[etat.type].nom + ').');
    majDemarrer();
}

async function reconnaitre() {
    if (etat.occupe || !etat.enMarche || video.readyState < 2) return;
    etat.occupe = true;
    try {
        ajusterCadre(video);
        const r = await empreinte(video, video.videoWidth, video.videoHeight);
        if (!etat.enMarche) return;
        dessinerSquelette(r);
        const voix = r ? voter(r.v) : etat.classes.map(() => 0);
        if (!voix) return;
        etat.historique.push(voix);
        if (etat.historique.length > LISSAGE) etat.historique.shift();
        const moyenne = voix.map((_, i) => etat.historique.reduce((s, h) => s + (h[i] || 0), 0) / etat.historique.length);
        noyau().traiterResultat('vision', etat.classes.map((c, i) => ({ nom: c.nom, proba: moyenne[i] })), col);
    } catch (erreur) {
        dire('Erreur de reconnaissance : ' + messageErreur(erreur));
    } finally {
        etat.occupe = false;
    }
}

// Un son entendu : vote des plus proches voisins, resultat garde DUREE_SON ms puis remis a vide.
function reconnaitreSon(v) {
    const voix = voter(v);
    if (!voix) return;
    noyau().traiterResultat('son', etat.classes.map((c, i) => ({ nom: c.nom, proba: voix[i] })), col);
    clearTimeout(etat.finSon);
    etat.finSon = setTimeout(() => {
        if (etat.enMarche && estSon()) noyau().traiterResultat('son', etat.classes.map(c => ({ nom: c.nom, proba: 0 })), col);
    }, DUREE_SON);
}

// genreDemande : arreter seulement si l'apprentissage en cours pilote ce genre (appel depuis ia.js).
function arreter(genreDemande) {
    if (!etat.enMarche || (genreDemande && genreDemande !== genre())) return;
    etat.enMarche = false;
    clearInterval(etat.minuteur); etat.minuteur = null;
    clearTimeout(etat.finSon); etat.finSon = null;
    eteindreCapteur('imm-reco');
    noyau().liberer(genre());
    dire('Arrêté.');
    majDemarrer();
}

// ---------- sauvegarde ----------
// Images : empreinte de longueur 1, chaque nombre ramene a un octet signe (1 Ko par
// exemple au lieu de 4). Squelettes et sons : gardes tels quels (Float32).
function octetsVersBase64(octets) {
    let s = '';
    for (let i = 0; i < octets.length; i += 0x8000) s += String.fromCharCode.apply(null, octets.subarray(i, i + 0x8000));
    return btoa(s);
}
function base64VersOctets(texte) {
    const s = atob(texte);
    const u = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
    return u;
}
function coder(v, type) {
    if (type !== 'images') return octetsVersBase64(new Uint8Array(Float32Array.from(v).buffer));
    return octetsVersBase64(new Uint8Array(Int8Array.from(v, x => Math.max(-127, Math.min(127, Math.round(x * 127)))).buffer));
}
function decoder(texte, type) {
    const u = base64VersOctets(texte);
    if (type !== 'images') return new Float32Array(u.buffer);
    const v = Float32Array.from(new Int8Array(u.buffer), x => x / 127);
    const n = Math.hypot(...v) || 1;
    return v.map(x => x / n);
}

// Noms des classes par defaut selon le type, comme le modele R4 (NOMS_DEFAUT) : a l'ouverture, apres « Tout effacer »
// et au changement de type tant que l'eleve n'a pas renomme ses classes.
// Noms crees par le logiciel : dans la langue de l'interface (ensuite, ce sont ceux de l'eleve, jamais traduits).
const NOMS_DEFAUT = { images: [nomClasse(1), nomClasse(2)], mains: [window.tr('Main ouverte'), window.tr('Poing')],
                      bras: [window.tr('Bras en haut'), window.tr('Bras en bas')], sons: [window.tr('Avance'), window.tr('Stop')] };
const classesParDefaut = type => (NOMS_DEFAUT[type] || NOMS_DEFAUT.images).map(nom => ({ nom, ex: [] }));
const nomsParDefaut = () => etat.classes.length === 2 && Object.values(NOMS_DEFAUT).some(n => n[0] === etat.classes[0].nom && n[1] === etat.classes[1].nom);

let nomModele = '';   // dernier nom donne au modele (propose a l'export suivant, repris a l'import)
function versDonnees() {
    return {
        format: 'apprentissage-ia-microbit', version: 1, nom: nomModele || undefined, type: etat.type,
        classes: etat.classes.map(c => ({ nom: c.nom, exemples: c.ex.map(e => coder(e.v, etat.type)) })),
    };
}

// Les vignettes ne sont pas dans le fichier : celles des squelettes et des sons se
// redessinent a partir des empreintes ; les photos (objets et images) ne reviennent pas.
function depuisDonnees(d, demander) {
    if (!d || d.format !== 'apprentissage-ia-microbit' || !Array.isArray(d.classes)) throw new Error('ce fichier ne contient pas de modèle IA d\'EasyBloc micro:bit');
    const type = TYPES[d.type] ? d.type : 'images';
    // Import par le bouton (comme le modele R4) : confirmation avant de remplacer des exemples, ou de changer de type
    if (demander) {
        const n = etat.classes.reduce((s, c) => s + c.ex.length, 0);
        if (type !== etat.type) {
            if (!confirm('Ce modèle est pour les « ' + TYPES[type].nom + ' » : l\'IA va passer à ce type' +
                         (n ? ' et remplacer vos ' + etat.classes.length + ' classes et leurs ' + n + ' exemples' : '') + '. Continuer ?')) return;
        } else if (n && !confirm('Importer ce modèle remplace vos ' + etat.classes.length + ' classes et leurs ' + n + ' exemples. Continuer ?')) return;
    }
    if (typeof d.nom === 'string' && d.nom.trim()) nomModele = d.nom.trim().slice(0, 60);
    const classes = d.classes.slice(0, MAX_CLASSES).map((c, i) => ({
        nom: String(c.nom || nomClasse(i + 1)).slice(0, 30),
        ex: (c.exemples || []).slice(0, MAX_EXEMPLES).map(e => ({ v: decoder(e, type), vignette: undefined })),
    }));
    arreter();
    eteindreCapteur('imm-capture');
    etat.type = type;
    etat.classes = classes.length ? classes : [{ nom: nomClasse(1), ex: [] }, { nom: nomClasse(2), ex: [] }];
    $('.ia-imm-type', col).value = type;
    apresModification();
    const total = etat.classes.reduce((s, c) => s + c.ex.length, 0);
    direCreer((nomModele && d.nom ? 'Modèle « ' + nomModele + ' » importé : ' : 'Modèle importé : ') + TYPES[type].nom + ', ' +
              etat.classes.length + ' classes, ' + total + ' exemple' + (total > 1 ? 's' : '') + '.');
}

const aDesExemples = () => etat.classes.some(c => c.ex.length);

// .py : section de commentaires a la fin, ignoree par MicroPython et par la reconstruction en blocs.
const DEBUT_ANNEXE = '# >>> apprentissage-ia';
const FIN_ANNEXE = '# <<< apprentissage-ia';

// Le JSON (sans retour a la ligne : JSON.stringify les echappe) est coupe en lignes
// de 100 caracteres, chacune precedee de « # » ; la relecture recolle les morceaux.
// Les espaces (seulement dans les noms de classes) sont ecrits en sequence d'echappement
// JSON (barre oblique inverse, u0020) : un editeur qui retire les espaces en fin de ligne
// ne peut pas abimer un nom coupe a cet endroit.
function annexePy() {
    if (!aDesExemples()) return '';
    const texte = JSON.stringify(versDonnees()).replace(/ /g, '\\u0020');
    const lignes = [];
    for (let i = 0; i < texte.length; i += 100) lignes.push('# ' + texte.slice(i, i + 100));
    return '\n' + DEBUT_ANNEXE + ' (exemples du panneau IA, ignore par la carte)\n' + lignes.join('\n') + '\n' + FIN_ANNEXE + '\n';
}

// Renvoie le texte sans l'annexe ; charge l'apprentissage s'il y en a un.
function lireAnnexePy(texte) {
    const motif = /\r?\n?# >>> apprentissage-ia[^\n]*\r?\n([\s\S]*?)# <<< apprentissage-ia[^\n]*\r?\n?/;
    const m = motif.exec(texte);
    if (!m) return texte;
    try {
        const json = m[1].split(/\r?\n/).filter(l => l.startsWith('# ')).map(l => l.slice(2)).join('');
        depuisDonnees(JSON.parse(json));
    } catch (erreur) {
        direCreer('Apprentissage du fichier illisible : ' + messageErreur(erreur));
    }
    return texte.replace(motif, '\n');
}

// Comme le modele R4 : l'eleve nomme son modele, c'est le nom du fichier telecharge.
async function exporter() {
    if (!aDesExemples()) { direCreer('Rien à exporter : ajoutez d\'abord des exemples.'); return; }
    arreterRafale();
    const programme = ($('#nom-fichier') && $('#nom-fichier').value.trim()) || '';
    const propose = nomModele || ('Modèle IA - ' + TYPES[etat.type].nom + (programme ? ' - ' + programme : ''));
    const saisi = window.demanderNomProgramme
        ? await window.demanderNomProgramme('Exporter le modèle', 'Quel nom voulez-vous donner à votre modèle IA ? C\'est le nom du fichier téléchargé.',
                                            propose, true, { etiquette: 'Nom du modèle IA', exemple: 'Par exemple : signes-robot-groupe3' })
        : propose;
    if (saisi === null) return;   // annule
    nomModele = saisi.replace(/\.json$/i, '').replace(/[\\/:*?"<>|]+/g, '-').trim() || 'Modèle IA';
    const nom = nomModele + '.json';
    const lien = document.createElement('a');
    lien.href = URL.createObjectURL(new Blob([JSON.stringify(versDonnees())], { type: 'application/json' }));
    lien.download = nom;
    document.body.appendChild(lien); lien.click(); lien.remove();
    setTimeout(() => URL.revokeObjectURL(lien.href), 10000);
    const n = etat.classes.reduce((s, c) => s + c.ex.length, 0);
    direCreer('Modèle exporté dans le fichier « ' + nom + ' » (' + etat.classes.length + ' classes, ' + n + ' exemple' + (n > 1 ? 's' : '') + ').');
}

const entreeImport = $('.ia-imm-import-fichier', col);
entreeImport.addEventListener('change', async () => {
    const f = entreeImport.files[0];
    entreeImport.value = '';
    if (!f) return;
    try { depuisDonnees(JSON.parse(await f.text()), true); } catch (erreur) { direCreer('Import impossible : ' + messageErreur(erreur) + '. Rien n\'a été changé.'); }
});

// ---------- branchement de l'interface ----------
$('.ia-imm-type', col).addEventListener('change', evenement => {
    const nouveau = evenement.target.value;
    if (aDesExemples() && !confirm('Changer de type efface les exemples de toutes les classes. Continuer ?')) {
        evenement.target.value = etat.type; return;
    }
    arreter();
    arreterRafale();
    eteindreCapteur('imm-capture');
    const parDefaut = nomsParDefaut();
    etat.type = nouveau;
    if (parDefaut) etat.classes = classesParDefaut(nouveau); else etat.classes.forEach(c => { c.ex = []; });
    apresModification();
    direCreer('Type : ' + TYPES[nouveau].nom + '. Ajoutez des exemples à chaque classe.');
    synchroCapteurAuto();
});
$('.ia-imm-camera', col).addEventListener('click', async () => {
    try {
        if (capteurAllume('imm-capture')) { arreterRafale(); eteindreCapteur('imm-capture'); }
        else { await allumerCapteur('imm-capture'); modele(etat.type).catch(() => {}); direCreer(''); }
    } catch (erreur) {
        direCreer(messageCapteur(erreur));
    }
    majTextesType();
});
video.addEventListener('loadedmetadata', () => ajusterCadre(video));
$('.ia-ajouter-classe', col).addEventListener('click', () => {
    if (etat.classes.length >= MAX_CLASSES) return;
    let n = etat.classes.length + 1;
    while (etat.classes.some(c => window.slugIA(c.nom) === window.slugIA(nomClasse(n)))) n++;
    etat.classes.push({ nom: nomClasse(n), ex: [] });
    apresModification();
});
$('.ia-tout-effacer', col).addEventListener('click', () => {
    if (aDesExemples() && !confirm('Supprimer toutes les classes et leurs exemples ?')) return;
    arreter();
    etat.classes = classesParDefaut(etat.type);
    apresModification();
    direCreer('Exemples effacés.');
});
$('.ia-demarrer', col).addEventListener('click', () => (etat.enMarche ? arreter() : demarrer()));
// Boutons dans le pied de la fenetre (comme le modele R4)
$('#ia-pied .ia-imm-exporter').addEventListener('click', exporter);
$('#ia-pied .ia-imm-importer').addEventListener('click', () => entreeImport.click());
apresModification();

// Comme le modele R4 : la camera et le micro ne s'allument qu'a un clic de l'eleve (jamais a l'ouverture de la
// fenetre). Fenetre fermee ou autre onglet : le capteur de capture s'eteint (une reconnaissance en cours continue, elle).
const panneauIA = document.getElementById('ia-panneau');
function synchroCapteurAuto() {
    const visible = !!panneauIA && !panneauIA.classList.contains('replie') && panneauIA.dataset.onglet === 'immediat';
    if (!visible && capteurAllume('imm-capture')) {
        arreterRafale();
        eteindreCapteur('imm-capture');
        majTextesType();
    }
}
if (panneauIA) new MutationObserver(synchroCapteurAuto).observe(panneauIA, { attributes: true, attributeFilter: ['class', 'data-onglet'] });

// =====================================================================
// QR codes et codes-barres (ZXing, lib/zxing)
// =====================================================================
const qr = { enMarche: false, minuteur: null, lecteur: null, vuA: 0, texte: '', toile: document.createElement('canvas') };
const videoQR = $('.ia-imm-video', colQR);

function direQR(texte) { const e = $('.ia-statut', colQR); if (e) e.textContent = texte; }

let zxing = null;
function chargerZxing() {
    if (window.ZXing) return Promise.resolve(window.ZXing);
    if (!zxing) {
        zxing = new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'lib/zxing/zxing-0.21.3.min.js';
            s.onload = () => resolve(window.ZXing);
            s.onerror = () => { zxing = null; reject(new Error('bibliothèque introuvable : lib/zxing/zxing-0.21.3.min.js')); };
            document.head.appendChild(s);
        });
    }
    return zxing;
}

// La carte affiche mal les accents et un « : » est le separateur de la ligne IA
// (le pilote recolle les morceaux, mais autant rester simple) : texte ASCII seulement.
function texteCarte(t) {
    return String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\x20-\x7e]/g, '?')
        .trim().slice(0, QR_LONGUEUR_MAX);
}

function lecteurQR(Z) {
    if (!qr.lecteur) {
        const indices = new Map();
        indices.set(Z.DecodeHintType.POSSIBLE_FORMATS, [Z.BarcodeFormat.QR_CODE, Z.BarcodeFormat.EAN_13, Z.BarcodeFormat.EAN_8,
            Z.BarcodeFormat.UPC_A, Z.BarcodeFormat.UPC_E, Z.BarcodeFormat.CODE_128, Z.BarcodeFormat.CODE_39, Z.BarcodeFormat.DATA_MATRIX]);
        indices.set(Z.DecodeHintType.TRY_HARDER, true);
        qr.lecteur = new Z.MultiFormatReader();
        qr.lecteur.setHints(indices);
    }
    return qr.lecteur;
}

// Lit un code dans une toile ; renvoie le texte ou null (cas normal : aucun code sur l'image).
function decoderToile(Z, toile) {
    const L = lecteurQR(Z);
    try {
        return L.decode(new Z.BinaryBitmap(new Z.HybridBinarizer(new Z.HTMLCanvasElementLuminanceSource(toile)))).getText();
    } catch (erreur) {
        return null;
    } finally {
        L.reset();
    }
}

function signalerQR(texte) {
    const d = noyau().dernierEnvoi.qr;
    if (texte !== d.classe) {
        d.classe = texte; d.confiance = texte ? 100 : 0; d.instant = Date.now();
        noyau().envoyer('qr', texte, d.confiance);
    }
    $('.ia-qr-texte', colQR).textContent = qr.texte ? 'Dernier code lu : ' + qr.texte : '';
    $('.ia-qr-texte', colQR).classList.toggle('vu', !!texte);
}

function lireQR() {
    if (!qr.enMarche || videoQR.readyState < 2 || !videoQR.videoWidth) return;
    ajusterCadre(videoQR);
    qr.toile.width = videoQR.videoWidth; qr.toile.height = videoQR.videoHeight;
    qr.toile.getContext('2d', { willReadFrequently: true }).drawImage(videoQR, 0, 0);
    const brut = decoderToile(window.ZXing, qr.toile);
    if (brut !== null) { qr.vuA = performance.now(); qr.texte = texteCarte(brut); }
    signalerQR(performance.now() - qr.vuA < QR_VISIBLE_MS ? qr.texte : '');
}

async function demarrerQR() {
    direQR('Chargement…');
    try {
        await chargerZxing();
        await noyau().ouvrirCamera('imm-qr');
    } catch (erreur) {
        direQR(erreur && erreur.name === 'NotAllowedError' ? 'Accès refusé : autorisez la caméra dans le navigateur.' : 'Démarrage impossible : ' + messageErreur(erreur));
        return;
    }
    brancherApercu(videoQR, true);
    qr.enMarche = true; qr.vuA = 0;
    qr.minuteur = setInterval(lireQR, INTERVALLE_QR_MS);
    signalerQR('');
    direQR('Montrez un QR code ou un code-barres à la caméra.');
    majQR();
}

function arreterQR() {
    if (!qr.enMarche) return;
    qr.enMarche = false;
    clearInterval(qr.minuteur); qr.minuteur = null;
    noyau().fermerCamera('imm-qr');
    brancherApercu(videoQR, false);
    noyau().liberer('qr');
    $('.ia-qr-texte', colQR).classList.remove('vu');
    direQR('Arrêté.');
    majQR();
}

function majQR() {
    const b = $('.ia-demarrer', colQR);
    b.innerHTML = qr.enMarche ? avecIcone('stop', 'Arrêter') : '▶ Lire les codes';
    b.classList.toggle('en-marche', qr.enMarche);
}

// --- creer un QR code a imprimer (memes bibliotheques, rien ne sort du navigateur) ---
async function creerQR() {
    const texte = $('.ia-qr-a-creer', colQR).value.trim();
    const toile = $('.ia-qr-image', colQR);
    if (!texte) { direQR('Écrivez d\'abord le texte du QR code.'); return; }
    try {
        const Z = await chargerZxing();
        const indices = new Map([[Z.EncodeHintType.MARGIN, 2], [Z.EncodeHintType.CHARACTER_SET, 'UTF-8']]);
        const matrice = new Z.QRCodeWriter().encode(texte, Z.BarcodeFormat.QR_CODE, 0, 0, indices);
        const n = matrice.getWidth(), pas = Math.max(4, Math.floor(240 / n));
        toile.width = toile.height = n * pas;
        const ctx = toile.getContext('2d');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, toile.width, toile.height);
        ctx.fillStyle = '#000000';
        for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (matrice.get(x, y)) ctx.fillRect(x * pas, y * pas, pas, pas);
        toile.classList.remove('replie');
        $('.ia-qr-telecharger', colQR).disabled = false;
        direQR('QR code créé : téléchargez-le pour l\'imprimer.');
    } catch (erreur) {
        direQR('Création impossible : ' + messageErreur(erreur));
    }
}

function telechargerQR() {
    const toile = $('.ia-qr-image', colQR);
    const nom = 'qr-' + (texteCarte($('.ia-qr-a-creer', colQR).value).replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'code') + '.png';
    toile.toBlob(blob => {
        const lien = document.createElement('a');
        lien.href = URL.createObjectURL(blob); lien.download = nom;
        document.body.appendChild(lien); lien.click(); lien.remove();
        setTimeout(() => URL.revokeObjectURL(lien.href), 10000);
    }, 'image/png');
}

// --- planche A4 : une liste de textes, un QR code par ligne, imprimee par le navigateur (rien ne sort du poste) ---
// Gabarits pour une feuille A4 a marges de 10 mm (190 x 277 mm utiles) ; chaque case a un contour en pointilles pour
// decouper. Les images sont fabriquees a 8 px par module au moins : nettes a l'impression, quelle que soit la taille.
const PLANCHES_QR = {
    petit: { code: 35, colonnes: 4, lignes: 5 },
    moyen: { code: 55, colonnes: 3, lignes: 4 },
    grand: { code: 80, colonnes: 2, lignes: 3 },
};
const MAX_PLANCHE_QR = 120;
const echapperHtml = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]));

async function imageQR(Z, texte) {
    const indices = new Map([[Z.EncodeHintType.MARGIN, 2], [Z.EncodeHintType.CHARACTER_SET, 'UTF-8']]);
    const matrice = new Z.QRCodeWriter().encode(texte, Z.BarcodeFormat.QR_CODE, 0, 0, indices);
    const n = matrice.getWidth(), pas = Math.max(8, Math.ceil(600 / n));
    const toile = document.createElement('canvas');
    toile.width = toile.height = n * pas;
    const ctx = toile.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, toile.width, toile.height);
    ctx.fillStyle = '#000000';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (matrice.get(x, y)) ctx.fillRect(x * pas, y * pas, pas, pas);
    return toile.toDataURL('image/png');
}

async function imprimerPlancheQR() {
    const statut = $('.ia-qr-planche-statut', colQR);
    const dire = m => { statut.textContent = m; };
    const textes = $('.ia-qr-liste', colQR).value.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (!textes.length) { dire('Écrivez au moins un texte (un par ligne).'); return; }
    if (textes.length > MAX_PLANCHE_QR) { dire('Au plus ' + MAX_PLANCHE_QR + ' QR codes par impression.'); return; }
    const trop = textes.find(t => t.length > 200);
    if (trop) { dire('Texte trop long (200 caractères au plus) : « ' + trop.slice(0, 30) + '… »'); return; }
    const g = PLANCHES_QR[$('.ia-qr-taille', colQR).value] || PLANCHES_QR.moyen;
    const legende = $('.ia-qr-legende', colQR).checked;
    const bouton = $('.ia-qr-imprimer', colQR);
    bouton.disabled = true;
    dire('Fabrication des QR codes…');
    try {
        const Z = await chargerZxing();
        const images = [];
        for (const t of textes) images.push(await imageQR(Z, t));
        const parPage = g.colonnes * g.lignes, pages = [];
        for (let i = 0; i < images.length; i += parPage) {
            const cases = images.slice(i, i + parPage).map((src, k) =>
                '<div class="case"><img src="' + src + '" alt=""><div class="texte">' + (legende ? echapperHtml(textes[i + k]) : '') + '</div></div>').join('');
            pages.push('<div class="page">' + cases + '</div>');
        }
        const largeur = (190 / g.colonnes).toFixed(2), hauteur = (277 / g.lignes).toFixed(2);
        const doc = '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>QR codes</title><style>' +
            '@page { size: A4 portrait; margin: 10mm; }' +
            '* { box-sizing: border-box; } html, body { margin: 0; background: #fff; color: #000; font-family: Arial, sans-serif; }' +
            '.page { display: grid; grid-template-columns: repeat(' + g.colonnes + ', ' + largeur + 'mm); grid-auto-rows: ' + hauteur + 'mm;' +
            ' width: 190mm; break-after: page; page-break-after: always; }' +
            '.page:last-child { break-after: auto; page-break-after: auto; }' +
            '.case { border: 0.3mm dashed #999; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2mm; overflow: hidden; }' +
            '.case img { width: ' + g.code + 'mm; height: ' + g.code + 'mm; image-rendering: pixelated; }' +
            '.texte { font-size: ' + (g.code >= 55 ? 14 : 11) + 'pt; text-align: center; max-width: 95%; overflow-wrap: anywhere; min-height: 1em; }' +
            '</style></head><body>' + pages.join('') + '</body></html>';
        const ancien = document.getElementById('ia-qr-impression');
        if (ancien) ancien.remove();
        const cadre = document.createElement('iframe');
        cadre.id = 'ia-qr-impression';
        cadre.setAttribute('aria-hidden', 'true');
        cadre.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';
        cadre.onload = () => {
            const imgs = Array.from(cadre.contentDocument.images);
            Promise.all(imgs.map(im => im.complete ? null : new Promise(ok => { im.onload = im.onerror = ok; }))).then(() => {
                cadre.contentWindow.focus();
                cadre.contentWindow.print();
            });
        };
        cadre.srcdoc = doc;
        document.body.appendChild(cadre);
        dire(textes.length + ' QR code' + (textes.length > 1 ? 's' : '') + ' sur ' + pages.length + ' page' + (pages.length > 1 ? 's' : '') +
             ' A4 : choisissez l\'imprimante (ou « Enregistrer en PDF »), échelle 100 %.');
    } catch (erreur) {
        dire('Impression impossible : ' + messageErreur(erreur));
    } finally {
        bouton.disabled = false;
    }
}

$('.ia-demarrer', colQR).addEventListener('click', () => (qr.enMarche ? arreterQR() : demarrerQR()));
$('.ia-qr-imprimer', colQR).addEventListener('click', imprimerPlancheQR);
videoQR.addEventListener('loadedmetadata', () => ajusterCadre(videoQR));
$('.ia-qr-creer', colQR).addEventListener('click', creerQR);
$('.ia-qr-a-creer', colQR).addEventListener('keydown', e => { if (e.key === 'Enter') creerQR(); });
$('.ia-qr-telecharger', colQR).addEventListener('click', telechargerQR);

// Camera coupee a la fermeture de la page, comme dans ia.js.
window.addEventListener('pagehide', () => { arreter(); arreterQR(); });

window.iaImmediat = {
    arreter,
    // Classes de l'apprentissage en cours, pour les menus des blocs du genre demande.
    classes: genreDemande => (!genreDemande || genreDemande === genre() ? nomsClasses() : []),
    annexePy,
    lireAnnexePy,
    // Pour les verifications depuis la console (pas d'usage dans l'application).
    test: { etat, qr, TYPES, empreinte, voter, proximite, coder, decoder, versDonnees, depuisDonnees, ajouterImages,
            formeMain, formeBras, modele, chargerZxing, decoderToile, texteCarte, signalerQR, demarrer, demarrerQR, arreterQR,
            renommerDansLesBlocs, reconnaitre, reconnaitreSon, vignetteSquelette, vignetteDe, genre },
};
