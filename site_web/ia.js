// ia.js — reconnaissance d'images (camera) et de sons (micro) avec des modeles
// Teachable Machine. Le navigateur reconnait ; seul le NOM de la classe part
// vers le programme, sous forme d'une ligne de texte :
//
//     IA:<vision|son>:<classe>:<confiance 0-100>\n
//
// - simulateur : ligne poussee dans le faux uart (window.simu_uartPousser, un.js) ;
// - vraie carte : ecrite sur le port serie de la console (window.ecrireSerie, un.js).
// Le programme MicroPython (pilote "ia", genere par les blocs IA) la decode : le
// meme code tourne donc dans le simulateur et sur la carte.
//
// Bibliotheques (lib/tm/, embarquees dans l'exe, donc hors connexion) chargees
// seulement au premier besoin : tf.min.js (TensorFlow.js 1.3.1),
// teachablemachine-image.min.js, speech-commands.min.js.
//
// Le dernier resultat de chaque genre est RENVOYE toutes les 500 ms (RAPPEL_MS) :
// une ligne perdue sur le cable ne laisse plus la carte bloquee sur une ancienne
// classe, et le pilote de la carte oublie un resultat de plus de 1,5 s (navigateur
// ferme, cable debranche). L'apprentissage immediat et les QR codes (ia-immediat.js)
// passent par les memes fonctions, exposees dans window.iaNoyau.

const DOSSIER_LIB = 'lib/tm/';
const INTERVALLE_VISION_MS = 120;
const ECART_CONFIANCE = 10;        // renvoyer la confiance si elle varie d'au moins 10 points...
const DELAI_CONFIANCE_MS = 500;    // ...et pas plus d'une fois par demi-seconde
const RAPPEL_MS = 500;             // renvoi du dernier resultat, meme inchange

const $ = (sel, racine = document) => racine.querySelector(sel);

const panneau = $('#ia-panneau');
const curseurSeuil = $('#ia-seuil');
const valeurSeuil = $('#ia-seuil-val');
const caseCarte = $('#ia-vers-carte');
const etatCarte = $('#ia-etat-carte');

// ---------- chargement paresseux des bibliotheques ----------
const scriptsCharges = {};
function chargerScript(nom) {
    if (!scriptsCharges[nom]) {
        scriptsCharges[nom] = new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = DOSSIER_LIB + nom;
            s.onload = () => resolve();
            s.onerror = () => { delete scriptsCharges[nom]; reject(new Error('bibliothèque introuvable : ' + nom)); };
            document.head.appendChild(s);
        });
    }
    return scriptsCharges[nom];
}
async function chargerBibliotheque(genre) {
    await chargerScript('tf.min.js');
    await chargerScript(genre === 'vision' ? 'teachablemachine-image.min.js' : 'speech-commands.min.js');
}

// ---------- etat ----------
const seuil = () => (curseurSeuil ? Number(curseurSeuil.value) : 80);

const moteurs = {
    vision: { modele: null, classes: [], enMarche: false, flux: null, minuteur: null, occupe: false },
    son:    { modele: null, classes: [], enMarche: false, flux: null, reconnaisseur: null },
};
// classe === null : rien en cours pour ce genre (pas de renvoi periodique).
// Le genre "qr" (texte du dernier QR code, ia-immediat.js) n'a pas de moteur ici.
const dernierEnvoi = {
    vision: { classe: null, confiance: -1, instant: 0 },
    son:    { classe: null, confiance: -1, instant: 0 },
    qr:     { classe: null, confiance: -1, instant: 0 },
};
const colonne = genre => $('.ia-colonne[data-genre="' + genre + '"]');

function dire(genre, texte) { const e = $('.ia-statut', colonne(genre)); if (e) e.textContent = texte; }

// ---------- envoi vers le programme ----------
function slug(nom) {
    return typeof window.slugIA === 'function' ? window.slugIA(nom) : String(nom);
}

function majEtatCarte() {
    if (!etatCarte) return;
    if (!caseCarte || !caseCarte.checked) { etatCarte.textContent = ''; return; }
    etatCarte.textContent = window.carteConnectee && window.carteConnectee()
        ? 'Carte connectée : les résultats lui sont envoyés.'
        : 'Aucune carte connectée : utilisez « Connecter » dans la console.';
}

// Une ligne par changement de classe, plus un rappel de la confiance quand elle bouge.
// Le texte d'un QR code part tel quel (deja nettoye par ia-immediat.js) : ce n'est pas un nom de classe.
async function envoyer(genre, classe, confiance) {
    const ligne = 'IA:' + genre + ':' + (classe ? (genre === 'qr' ? classe : slug(classe)) : '') + ':' + confiance + '\n';
    if (typeof window.simu_uartPousser === 'function') window.simu_uartPousser(ligne);
    if (caseCarte && caseCarte.checked && typeof window.ecrireSerie === 'function') {
        await window.ecrireSerie(ligne);
    }
    majEtatCarte();
    return ligne;
}

// Point d'entree commun (camera, micro, et tests) : probas = [{nom, proba 0..1}, ...]
// col : colonne dont les barres sont mises a jour (l'apprentissage immediat a la sienne).
function traiterResultat(genre, probas, col = colonne(genre)) {
    let meilleur = null;
    for (const p of probas) if (!meilleur || p.proba > meilleur.proba) meilleur = p;
    const confiance = meilleur ? Math.round(meilleur.proba * 100) : 0;
    const retenue = meilleur && confiance >= seuil() ? meilleur.nom : '';

    if (col) {
        const lignes = $('.ia-classes', col).children;
        probas.forEach((p, i) => {
            const l = lignes[i];
            if (!l) return;
            $('.ia-classe-barre > i', l).style.width = Math.round(p.proba * 100) + '%';
            $('.ia-classe-pct', l).textContent = Math.round(p.proba * 100) + ' %';
            l.classList.toggle('retenue', retenue !== '' && p.nom === retenue);
        });
    }

    const d = dernierEnvoi[genre];
    const maintenant = Date.now();
    const classeChangee = retenue !== d.classe;
    const confianceBouge = retenue !== '' && Math.abs(confiance - d.confiance) >= ECART_CONFIANCE &&
        maintenant - d.instant >= DELAI_CONFIANCE_MS;
    if (classeChangee || confianceBouge) {
        d.classe = retenue;
        d.confiance = retenue ? confiance : 0;
        d.instant = maintenant;
        return envoyer(genre, retenue, d.confiance);
    }
    return null;
}

// Renvoi periodique du dernier resultat de chaque genre en cours (voir RAPPEL_MS).
setInterval(() => {
    const maintenant = Date.now();
    for (const genre of Object.keys(dernierEnvoi)) {
        const d = dernierEnvoi[genre];
        if (d.classe === null || maintenant - d.instant < RAPPEL_MS) continue;
        d.instant = maintenant;
        envoyer(genre, d.classe, d.confiance);
    }
}, 100);

// Plus rien n'est reconnu pour ce genre : le programme repart d'une classe vide,
// et le renvoi periodique s'arrete.
function liberer(genre) {
    const enCours = dernierEnvoi[genre].classe !== null;
    dernierEnvoi[genre] = { classe: null, confiance: -1, instant: 0 };
    if (!enCours) return;
    const ligne = 'IA:' + genre + '::0\n';
    if (typeof window.simu_uartPousser === 'function') window.simu_uartPousser(ligne);
    if (caseCarte && caseCarte.checked && typeof window.ecrireSerie === 'function') window.ecrireSerie(ligne);
}

function afficherClasses(genre, noms) {
    const conteneur = $('.ia-classes', colonne(genre));
    conteneur.textContent = '';
    for (const nom of noms) {
        const l = document.createElement('div');
        l.className = 'ia-classe';
        const n = document.createElement('span'); n.className = 'ia-classe-nom'; n.textContent = nom; n.title = nom;
        const b = document.createElement('span'); b.className = 'ia-classe-barre'; b.appendChild(document.createElement('i'));
        const p = document.createElement('span'); p.className = 'ia-classe-pct'; p.textContent = '0 %';
        l.append(n, b, p);
        conteneur.appendChild(l);
    }
}

// ---------- chargement des modeles ----------
function racineModele(adresse) {
    let a = adresse.trim();
    if (!a) throw new Error('Collez d\'abord l\'adresse du modèle.');
    if (!/^https?:\/\//i.test(a)) throw new Error('L\'adresse doit commencer par https://');
    a = a.replace(/[?#].*$/, '').replace(/(model|metadata)\.json$/i, '');
    return a.endsWith('/') ? a : a + '/';
}

// 3 fichiers choisis d'un coup : metadata*.json, autre .json = modele, .bin = poids.
function trierFichiers(fichiers) {
    const f = { modele: null, metadata: null, poids: null };
    for (const x of fichiers) {
        const nom = x.name.toLowerCase();
        if (nom.endsWith('.bin')) f.poids = x;
        else if (nom.endsWith('.json') && nom.includes('metadata')) f.metadata = x;
        else if (nom.endsWith('.json')) f.modele = x;
    }
    if (!f.modele || !f.metadata || !f.poids) {
        throw new Error('Sélectionnez les 3 fichiers à la fois : model.json, metadata.json et weights.bin.');
    }
    return f;
}

async function chargerModele(genre, source) {
    arreter(genre);
    const m = moteurs[genre];
    m.modele = null; m.reconnaisseur = null; m.classes = [];
    colonne(genre).querySelector('.ia-demarrer').disabled = true;
    dire(genre, 'Chargement des bibliothèques…');
    try {
        await chargerBibliotheque(genre);
        dire(genre, 'Chargement du modèle…');
        if (genre === 'vision') {
            if (source.fichiers) {
                const f = trierFichiers(source.fichiers);
                m.modele = await window.tmImage.loadFromFiles(f.modele, f.poids, f.metadata);
            } else {
                const r = racineModele(source.adresse);
                m.modele = await window.tmImage.load(r + 'model.json', r + 'metadata.json');
            }
            m.classes = m.modele.getClassLabels();
        } else {
            let modeleArt, meta;
            if (source.fichiers) {
                const f = trierFichiers(source.fichiers);
                const json = JSON.parse(await f.modele.text());
                const manifeste = json.weightsManifest || [];
                modeleArt = {
                    modelTopology: json.modelTopology,
                    weightSpecs: manifeste.reduce((acc, e) => acc.concat(e.weights), []),
                    weightData: await f.poids.arrayBuffer(),
                };
                meta = JSON.parse(await f.metadata.text());
            } else {
                const r = racineModele(source.adresse);
                modeleArt = r + 'model.json';
                meta = r + 'metadata.json';
            }
            m.reconnaisseur = window.speechCommands.create('BROWSER_FFT', undefined, modeleArt, meta);
            await m.reconnaisseur.ensureModelLoaded();
            m.classes = m.reconnaisseur.wordLabels();
        }
        afficherClasses(genre, m.classes);
        colonne(genre).querySelector('.ia-demarrer').disabled = false;
        dire(genre, 'Modèle chargé : ' + m.classes.length + ' classes. Cliquez « Démarrer ».');
        if (source.adresse) memoriser(genre, source.adresse);
    } catch (erreur) {
        dire(genre, 'Chargement impossible : ' + (erreur && erreur.message ? erreur.message : erreur));
    }
}

// ---------- camera ----------
// Le flux est partage : la reconnaissance ("reco") et la capture d'exemples
// ("capture") peuvent chacune le demander ; il s'eteint quand plus personne n'en a besoin.
const camera = { flux: null, raisons: new Set() };

// L'apercu de la colonne Vision ne s'affiche que pour SON usage ("reco", modele Teachable Machine) :
// l'apprentissage immediat et les QR codes ont leur propre apercu (raisons commencant par "imm").
function majApercuVision() {
    const video = $('#ia-video');
    if (video) video.classList.toggle('replie', !camera.flux || ![...camera.raisons].some(r => !r.startsWith('imm')));
}

async function ouvrirCamera(raison) {
    const video = $('#ia-video');
    if (!camera.flux) {
        camera.flux = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.srcObject = camera.flux;
        await video.play().catch(() => {});
    }
    camera.raisons.add(raison);
    majApercuVision();
}

function fermerCamera(raison) {
    if (raison) camera.raisons.delete(raison); else camera.raisons.clear();
    majApercuVision();
    if (camera.raisons.size) return;
    if (camera.flux) { camera.flux.getTracks().forEach(t => t.stop()); camera.flux = null; }
    const video = $('#ia-video');
    if (video) { video.srcObject = null; video.classList.add('replie'); }
}

async function demarrerVision() {
    const m = moteurs.vision;
    const video = $('#ia-video');
    await ouvrirCamera('reco');
    m.enMarche = true;
    m.minuteur = setInterval(async () => {
        if (m.occupe || !m.enMarche || video.readyState < 2) return;
        m.occupe = true;
        try {
            const sortie = await m.modele.predict(video);
            if (m.enMarche) {
                traiterResultat('vision', sortie.map(s => ({ nom: s.className, proba: s.probability })));
            }
        } catch (erreur) {
            dire('vision', 'Erreur de reconnaissance : ' + erreur.message);
        } finally {
            m.occupe = false;
        }
    }, INTERVALLE_VISION_MS);
}

function arreterVision() {
    const m = moteurs.vision;
    m.enMarche = false;
    if (m.minuteur) { clearInterval(m.minuteur); m.minuteur = null; }
    fermerCamera('reco');
}

// ---------- micro ----------
async function demarrerSon() {
    const m = moteurs.son;
    m.enMarche = true;
    await m.reconnaisseur.listen(resultat => {
        if (!m.enMarche) return;
        const scores = Array.from(resultat.scores);
        traiterResultat('son', m.classes.map((nom, i) => ({ nom, proba: scores[i] || 0 })));
    }, {
        probabilityThreshold: 0,
        invokeCallbackOnNoiseAndUnknown: true,
        overlapFactor: 0.5,
    });
}

function arreterSon() {
    const m = moteurs.son;
    m.enMarche = false;
    try { if (m.reconnaisseur && m.reconnaisseur.isListening()) m.reconnaisseur.stopListening(); } catch (e) { /* deja arrete */ }
}

// ---------- demarrer / arreter ----------
function majBouton(genre) {
    const b = $('.ia-demarrer', colonne(genre));
    const enMarche = moteurs[genre].enMarche;
    // (pas d'emoji : icone au trait pour Arreter, consigne du professeur nov. 2026)
    b.innerHTML = enMarche ? '<svg class="ia-icone" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
        + 'aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1.5"/></svg><span>Arrêter</span>' : '▶ Démarrer';
    b.classList.toggle('en-marche', enMarche);
}

function arreter(genre) {
    const enMarche = moteurs[genre].enMarche;
    if (genre === 'vision') arreterVision(); else arreterSon();
    if (enMarche) liberer(genre);
    majBouton(genre);
}

async function basculer(genre) {
    const m = moteurs[genre];
    if (m.enMarche) { arreter(genre); dire(genre, 'Arrêté.'); return; }
    if (!m.classes.length) return;
    // Un seul moteur a la fois par genre : l'apprentissage immediat du meme genre s'arrete.
    if (window.iaImmediat) window.iaImmediat.arreter(genre);
    dire(genre, genre === 'vision' ? 'Démarrage de la caméra…' : 'Démarrage du micro…');
    try {
        if (genre === 'vision') await demarrerVision(); else await demarrerSon();
        dire(genre, genre === 'vision' ? 'Caméra en marche.' : 'Micro en marche.');
    } catch (erreur) {
        arreter(genre);
        const refus = erreur && (erreur.name === 'NotAllowedError' || erreur.name === 'SecurityError');
        const absent = erreur && erreur.name === 'NotFoundError';
        dire(genre, refus ? 'Accès refusé : autorisez ' + (genre === 'vision' ? 'la caméra' : 'le micro') + ' dans le navigateur.'
            : absent ? 'Aucun' + (genre === 'vision' ? 'e caméra' : ' micro') + ' détecté.'
            : 'Démarrage impossible : ' + (erreur && erreur.message ? erreur.message : erreur));
    }
    majBouton(genre);
}

// ---------- creation de classes ----------
// Il n'y a plus d'entrainement ici : images, gestes, positions ET sons se creent dans
// « Apprentissage immediat » (ia-immediat.js, sans entrainement). Les colonnes Vision et
// Son ne font que CHARGER un modele Teachable Machine (une seule facon de creer).

// ---------- memoire des adresses (confort uniquement) ----------
function memoriser(genre, adresse) {
    try { localStorage.setItem('ia-url-' + genre, adresse); } catch (e) { /* stockage indisponible */ }
}
function rappeler(genre) {
    try { return localStorage.getItem('ia-url-' + genre) || ''; } catch (e) { return ''; }
}

// ---------- branchement de l'interface ----------
for (const genre of ['vision', 'son']) {
    const col = colonne(genre);
    if (!col) continue;
    const champ = $('.ia-url', col);
    champ.value = rappeler(genre);
    $('.ia-charger-url', col).addEventListener('click', () => chargerModele(genre, { adresse: champ.value }));
    champ.addEventListener('keydown', e => { if (e.key === 'Enter') chargerModele(genre, { adresse: champ.value }); });
    const entree = $('.ia-fichiers', col);
    $('.ia-charger-fichiers', col).addEventListener('click', () => entree.click());
    entree.addEventListener('change', () => {
        if (entree.files.length) chargerModele(genre, { fichiers: Array.from(entree.files) });
        entree.value = '';
    });
    $('.ia-demarrer', col).addEventListener('click', () => basculer(genre));
}
if (curseurSeuil) curseurSeuil.addEventListener('input', () => { valeurSeuil.textContent = curseurSeuil.value; });
if (caseCarte) caseCarte.addEventListener('change', majEtatCarte);
setInterval(() => { if (caseCarte && caseCarte.checked) majEtatCarte(); }, 2000);

// Camera et micro ne doivent pas rester allumes en cachette : on coupe a la fermeture de la page.
window.addEventListener('pagehide', () => { arreterVision(); arreterSon(); fermerCamera(); });

// Noms de classes connus pour un genre (menus des blocs IA, un.js) : modele Teachable
// Machine charge et apprentissage immediat du meme genre.
window.iaClassesConnues = function (genre) {
    const noms = [];
    if (moteurs[genre]) noms.push(...moteurs[genre].classes);
    if (window.iaImmediat) noms.push(...window.iaImmediat.classes(genre));
    const vus = new Set();
    return noms.map(n => String(n).trim()).filter(n => n && !vus.has(slug(n)) && vus.add(slug(n)));
};

// ---------- Fenetre IA : onglets, pastilles, pied, fermeture (oct. 2026) ----------
// Le bouton IA ouvre une fenetre centree (index.html). Un onglet par mode ; le titre suit l'onglet et, pour
// l'apprentissage immediat, ce que l'IA doit reconnaitre. Un point colore dans chaque onglet (bleu : pret, vert : en
// marche), deduit du bouton Demarrer ; le bouton IA de la barre est souligne en vert tant qu'une reconnaissance tourne,
// meme fenetre fermee. Pastilles du type : elles pilotent le menu deroulant d'origine (masque), dont le « change » fait
// tout le travail. Pied : « Tout effacer » (apprentissage immediat), « Termine » (= fermer). Echap ou un clic sur le
// voile ferment aussi la fenetre.
(function habillerFenetre() {
    const panneau = $('#ia-panneau');
    if (!panneau) return;
    const titre = $('#ia-titre-texte');
    const choix = $('.ia-imm-type');
    const onglets = Array.from(document.querySelectorAll('#ia-onglets .ia-onglet'));
    const TITRES = {
        images: 'Entraîner l\'IA à reconnaître des objets ou des images', mains: 'Entraîner l\'IA à reconnaître des signes de la main',
        bras: 'Entraîner l\'IA à reconnaître des positions des bras', sons: 'Entraîner l\'IA à reconnaître des sons ou des mots',
    };
    const AUTRES = { vision: 'Utiliser un modèle Teachable Machine (caméra)', son: 'Utiliser un modèle Teachable Machine (micro)',
                     qr: 'Créer ou lire un QR code' };   // modele : « Créer un QR code » ; ici l'onglet lit aussi
    const majTitre = () => {
        const o = panneau.dataset.onglet;
        if (titre) titre.textContent = o === 'immediat' ? TITRES[choix ? choix.value : 'images'] || TITRES.images : AUTRES[o] || '';
    };
    // Onglets Teachable Machine (camera, micro) : caches par defaut, affiches par la case « Modèles Teachable Machine »
    // de l'onglet Apprentissage immediat (choix garde dans le navigateur). Un onglet cache reste visible tant qu'il est
    // choisi (visite guidee) ou qu'une reconnaissance y tourne, pour ne jamais perdre de vue une IA en marche.
    const TM = ['vision', 'son'];
    const CLE_TM = 'ia_onglets_teachable_v1';
    let avecTM = false;
    try { avecTM = localStorage.getItem(CLE_TM) === '1'; } catch (erreur) { /* navigation privee : cases decochees */ }
    const enMarche = genre => !!document.querySelector('.ia-colonne[data-genre="' + genre + '"] .ia-demarrer.en-marche');
    function majOngletsTM() {
        onglets.forEach(b => {
            if (TM.includes(b.dataset.onglet)) b.hidden = !(avecTM || b.dataset.onglet === panneau.dataset.onglet || enMarche(b.dataset.onglet));
        });
    }
    function choisirOnglet(o) {
        if (!onglets.some(b => b.dataset.onglet === o)) return;
        if (panneau.dataset.onglet !== o) panneau.dataset.onglet = o;
        onglets.forEach(b => {
            const actif = b.dataset.onglet === o;
            b.classList.toggle('actif', actif);
            b.setAttribute('aria-selected', String(actif));
            b.tabIndex = actif ? 0 : -1;
        });
        majOngletsTM();
        majTitre();
    }
    onglets.forEach(b => {
        b.addEventListener('click', () => choisirOnglet(b.dataset.onglet));
        b.addEventListener('keydown', ev => {
            const pas = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
            if (!pas) return;
            const visibles = onglets.filter(x => !x.hidden), i = visibles.indexOf(b);
            const suivant = visibles[(i + pas + visibles.length) % visibles.length];
            choisirOnglet(suivant.dataset.onglet); suivant.focus(); ev.preventDefault();
        });
    });
    window.iaOnglet = choisirOnglet;
    choisirOnglet(panneau.dataset.onglet || 'immediat');

    const gauche = $('.ia-colonne[data-genre="immediat"] .ia-imm-gauche');
    if (gauche) {
        const option = document.createElement('label');
        option.className = 'ia-imm-option';
        option.title = 'Pour utiliser un modèle déjà entraîné sur Teachable Machine (teachablemachine.withgoogle.com)';
        option.innerHTML = '<input type="checkbox"> Afficher les onglets « Modèle Teachable Machine »';
        const caseTM = option.querySelector('input');
        caseTM.checked = avecTM;
        caseTM.addEventListener('change', () => {
            avecTM = caseTM.checked;
            try { localStorage.setItem(CLE_TM, avecTM ? '1' : '0'); } catch (erreur) { /* le choix ne survivra pas au rechargement */ }
            majOngletsTM();
        });
        gauche.appendChild(option);
    }
    for (const genre of TM) {
        const bouton = $('.ia-colonne[data-genre="' + genre + '"] .ia-demarrer');
        if (bouton) new MutationObserver(majOngletsTM).observe(bouton, { attributes: true, attributeFilter: ['class'] });
    }

    // Points d'etat des onglets et soulignement du bouton IA de la barre
    const boutonBarre = $('#btn-vue-ia');
    const majBarre = () => {
        if (boutonBarre) boutonBarre.classList.toggle('ia-en-marche', !!document.querySelector('.ia-colonne .ia-demarrer.en-marche'));
    };
    for (const col of document.querySelectorAll('.ia-colonne')) {
        const genre = col.dataset.genre, bouton = $('.ia-demarrer', col);
        const point = $('#ia-onglets .ia-onglet[data-onglet="' + genre + '"] .ia-onglet-point');
        if (!bouton || !point) continue;
        const maj = () => {
            const etat = bouton.classList.contains('en-marche') ? 'marche' : (!bouton.disabled && genre !== 'qr') ? 'pret' : '';
            point.dataset.etat = etat;
            point.title = etat === 'marche' ? 'en marche' : etat === 'pret' ? 'prêt' : '';
            majBarre();
        };
        new MutationObserver(maj).observe(bouton, { attributes: true, attributeFilter: ['class', 'disabled'] });
        maj();
    }

    // Pastilles « L'IA doit reconnaitre »
    const col = $('.ia-colonne[data-genre="immediat"]'), ligne = choix && choix.closest('.ia-modele');
    if (col && ligne) {
        // Libelles du modele R4, sans emoji (consigne du professeur, nov. 2026) ; « signes » : les « gestes » sont ceux du capteur Grove
        const LONGS = { images: 'Des objets ou des images', mains: 'Des signes de la main', bras: 'Des positions des bras', sons: 'Des sons ou des mots' };
        const groupe = document.createElement('div');
        groupe.className = 'ia-imm-pastilles';
        groupe.setAttribute('role', 'group');
        groupe.setAttribute('aria-label', 'Ce que l\'IA doit reconnaître');
        const synchro = () => {
            groupe.querySelectorAll('.ia-pastille').forEach(p => {
                p.setAttribute('aria-pressed', String(p.dataset.valeur === choix.value));
                p.disabled = choix.disabled;
            });
            majTitre();
        };
        for (const o of choix.options) {
            const p = document.createElement('button');
            p.type = 'button';
            p.className = 'btn-vue ia-pastille';
            p.dataset.valeur = o.value;
            p.textContent = LONGS[o.value] || o.textContent;
            p.addEventListener('click', () => {
                if (choix.value === o.value) return;
                choix.value = o.value;
                choix.dispatchEvent(new Event('change', { bubbles: true }));
                synchro();
            });
            groupe.appendChild(p);
        }
        ligne.appendChild(groupe);
        choix.addEventListener('change', () => setTimeout(synchro, 0));
        new MutationObserver(synchro).observe($('.ia-creer-classes', col) || col, { childList: true });   // importation, changement de type
        synchro();
    }

    // Pied et fermeture
    const fermer = () => { const b = $('#btn-ia-fermer'); if (b && !panneau.classList.contains('replie')) b.click(); };
    const effacer = $('.ia-pied-effacer'), termine = $('.ia-pied-termine');
    if (effacer) effacer.addEventListener('click', () => { const b = $('.ia-tout-effacer'); if (b) b.click(); });
    if (termine) termine.addEventListener('click', fermer);
    panneau.addEventListener('mousedown', ev => { if (ev.target === panneau) fermer(); });
    document.addEventListener('keydown', ev => {
        if (ev.key !== 'Escape' || panneau.classList.contains('replie')) return;
        const aide = $('#voile-aide');                     // la fenetre d'aide (?) se ferme d'abord
        if ((aide && getComputedStyle(aide).display !== 'none') || $('#ex-voile')) return;
        fermer();
    });
})();

window.iaNoyau = { traiterResultat, liberer, envoyer, ouvrirCamera, fermerCamera, camera, dernierEnvoi, moteurs, arreter, seuil };

window.iaTest = { liberer, camera, ouvrirCamera, fermerCamera, chargerBibliotheque, traiterResultat, chargerModele, basculer, arreter, moteurs, envoyer, trierFichiers, racineModele, dernierEnvoi };
