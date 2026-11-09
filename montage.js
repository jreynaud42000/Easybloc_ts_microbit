// montage.js — vue « montage » du simulateur : la micro:bit enfichee dans sa carte d'extension
// (Grove Shield v2.0 ou BitMaker V2 de Seeed, au choix, ou carte moteurs DFRobot DFR0548 ou ELECFREAKS Motor:bit),
// les modules du programme
// disposes autour et relies par leurs cables.
//
// Ou s'affiche le montage : toujours dans la colonne du simulateur (micro:bit seule sans bloc d'extension), dans une
// vue qu'on zoome et deplace comme la zone des blocs (echelle fixe, molette, Recentrer / + / −, nov. 2026) ;
// « Agrandir » ouvre la meme scene par-dessus la zone de blocs. Une seule scene, deplacee d'un endroit a l'autre.
//
// Le montage montre OU chaque module est branche, d'apres les blocs poses, et ce que font les
// actionneurs pendant la simulation (moteurs, servos, LED, buzzer, relais, ecrans) : il recopie ce
// qu'affiche la liste « Peripheriques » (majVivant), qui garde les curseurs des capteurs. La carte micro:bit n'est pas copiee : #microbit-board est
// deplace dans le montage a l'ouverture et remis a sa place a la fermeture, avec ses
// identifiants et ses ecouteurs (broches, logo, boutons A et B, LED).
//
// Proportions : la micro:bit (52 mm) fait 280 unites, soit 5,4 unites par mm ; la carte Grove
// (72 mm x 72 mm) en fait 388. La Grove Shield v2.0 suit les photos du fabricant (ports, pastilles,
// connecteur), la BitMaker V2 (57 x 70 mm) la photo de dessus du fabricant, la DFR0548 le schema « Board
// Overview » de DFRobot, tournee d'un demi-tour pour que la micro:bit reste a l'endroit.

import { K_MODULE, DESSINS_MODULES, HUB_PRISES, HUB_BAS_PRISE, COULEURS_LED, defsModules, allumerLed, allumerRelais, allumerBouton, allumerLumiere, allumerPir, allumerPotentiometre, allumerJoystick, allumerBarreLed, allumerQuatreDigits, allumerRuban, allumerLcdRgb, allumerGestes, allumerServo } from './modules-dessins.js';

const $ = id => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const LARGEUR = 1000;                                   // largeur de la scene, en unites
const CARTE = { x: 360, y: 20, l: 280, h: 230 };        // place de la micro:bit dans la scene
const FENTE_GROVE = { x: 344, y: 226, l: 312, h: 58 };  // connecteur de la Grove Shield v2.0 (35 a 46 mm du haut)
const MODULE = { l: 170, h: 74 };                       // zone de dessin d'un module (hors libelles)

// ---------- Couleurs des fils ----------
const GROVE = ['#f2c230', '#f4f4f4', '#d63a2f', '#1b1b1b'];   // jaune SIG1, blanc SIG2, rouge VCC, noir GND
const F = { jaune: '#f2c230', blanc: '#f4f4f4', rouge: '#d63a2f', noir: '#1b1b1b',
            orange: '#f08a24', marron: '#6d4026', bleu: '#3a7bd5', rose: '#e58fb5', vert: '#2e9b4f' };

// ---------- Modules reconnus dans le programme ----------
// champs : listes deroulantes de broches du bloc ; i2c : module branche sur le bus I2C.
const MODULES = [
    { motif: /^grove_led_(etat|luminosite)$/,  nom: 'LED',                   champs: ['BROCHE'], picto: 'led' },
    { motif: /^grove_ruban_definir$/,         nom: 'Ruban RGB',             champs: ['BROCHE'], picto: 'ruban', large: true },
    { motif: /^grove_4d_definir$/,            nom: 'Afficheur 4 digits',    champs: ['CLK', 'DIO'], picto: '4d', large: true },
    { motif: /^grove_ultrason_/,              nom: 'Ultrason',              champs: ['BROCHE'], picto: 'ultrason', large: true },
    { motif: /^grove_joystick_(valeur|bouton)$/, nom: 'Joystick',           champs: ['BROCHE'], picto: 'joystick' },
    { motif: /^grove_joystick_direction$/,    nom: 'Joystick',              champs: ['X', 'Y'], picto: 'joystick' },
    { motif: /^grove_potentiometre$/,         nom: 'Potentiomètre',         champs: ['BROCHE'], picto: 'pot' },
    { motif: /^grove_bouton_/,                nom: 'Bouton poussoir',       champs: ['BROCHE'], picto: 'bouton' },
    { motif: /^grove_lumiere$/,               nom: 'Capteur de lumière',    champs: ['BROCHE'], picto: 'lumiere' },
    { motif: /^grove_pir$/,                   nom: 'Détecteur de mouvement', champs: ['BROCHE'], picto: 'pir' },
    { motif: /^grove_buzzer_/,                nom: 'Buzzer',                champs: ['BROCHE'], picto: 'buzzer' },
    { motif: /^grove_relais$/,                nom: 'Relais',                champs: ['BROCHE'], picto: 'relais' },
    { motif: /^grove_dht11_definir$/,         nom: 'DHT11',                 champs: ['BROCHE'], picto: 'dht11' },
    { motif: /^grove_dht22_definir$/,         nom: 'DHT22',                 champs: ['BROCHE'], picto: 'dht22' },
    { motif: /^grove_barre_/,                 nom: 'Barre de LED',          champs: ['PORT'], picto: 'barre', large: true },
    { motif: /^servo_/,                       nom: 'Servomoteur',           champs: ['BROCHE'], picto: 'servo', servo: true },
    { motif: /^grove_oled_/,                  nom: 'Écran OLED',            i2c: true, picto: 'oled', large: true },
    { motif: /^grove_lcd_/,                   nom: 'Écran LCD 16×2',        i2c: true, picto: 'lcd', large: true },
    { motif: /^grove_lcdrgb_/,                nom: 'Écran LCD RGB',         i2c: true, picto: 'lcdrgb', large: true },
    { motif: /^grove_bmp280$/,                nom: 'Capteur de pression',   i2c: true, picto: 'bmp280' },
    { motif: /^grove_sgp30$/,                 nom: 'Capteur COV',           i2c: true, picto: 'sgp30' },
    { motif: /^grove_rtc_/,                   nom: 'Horloge RTC',           i2c: true, picto: 'rtc' },
    { motif: /^grove_pca_/,                   nom: 'Carte servos PCA9685',  i2c: true, picto: 'servo16', large: true },
    { motif: /^grove_gestes_/,                nom: 'Capteur de gestes',     i2c: true, picto: 'paj7620' },
    { motif: /^grove_th_/,                    nom: 'Température, humidité', i2c: true, picto: 'dht20' },
    { motif: /^grove_couleur_/,               nom: 'Capteur de couleur',    i2c: true, picto: 'couleur' },
    { motif: /^grove_moteur_/,                nom: 'Pilote de moteurs I2C', i2c: true, picto: 'pilote' },
    { motif: /^grove_scd30_/,                 nom: 'Capteur CO₂ SCD30',     i2c: true, picto: 'scd30', large: true },
    { motif: /^grove_scd41_/,                 nom: 'Capteur CO₂ SCD41',     i2c: true, picto: 'scd41' },
];
const BLOC_EXTENSION = /^(grove_|servo_|dfr_|motorbit_)/;
// Lecteur de l'etat en direct (majVivant) quand il differe du dessin : plusieurs capteurs partagent le dessin « puce ».
const VIVANT = {
    'Capteur de pression': 'pression', 'Capteur COV': 'cov', 'Capteur de gestes': 'gestes', 'Température, humidité': 'th',
    'DHT11': 'th', 'DHT22': 'th', 'Capteur CO₂ SCD30': 'co2', 'Capteur CO₂ SCD41': 'co2', 'Horloge RTC': 'rtc',
    'Capteur de couleur': 'couleur', 'Capteur de lumière': 'lumiere', 'Ultrason': 'ultrason', 'Potentiomètre': 'pot',
    'Détecteur de mouvement': 'pir', 'Bouton poussoir': 'bouton', 'Joystick': 'joystick', 'Carte servos PCA9685': 'servo16',
};

// ---------- Cartes d'extension ----------
// Chaque point de branchement donne l'origine des fils (x, y), leur direction de sortie (d)
// et l'ecart entre fils voisins le long du connecteur (pas, dans le sens perpendiculaire).
// Grove Shield v2.0 relevee sur les photos du fabricant : carte noire 72 x 72 mm (x 306 a 694, y 39 a 427)
// echancree en haut entre deux oreilles, micro:bit couchee sur la moitie haute et enfichee dans le connecteur
// du milieu, 4 ports Grove alignes en bas et ouverts vers le bas, 8 pastilles pour pinces crocodile sur les bords.
const GROVE_PCB = { x: 306, y: 39, l: 388, oreille: 58, encoche: 65 };
const PORTS_GROVE = {
    'I2C':    { x: 388, y: 404, d: [0, 1] }, 'P0/P14': { x: 462, y: 404, d: [0, 1] },
    'P1/P15': { x: 536, y: 404, d: [0, 1] }, 'P2/P16': { x: 611, y: 404, d: [0, 1] },
};
const PORT_DE_BROCHE = { pin0: 'P0/P14', pin14: 'P0/P14', pin1: 'P1/P15', pin15: 'P1/P15', pin2: 'P2/P16', pin16: 'P2/P16' };
// Pastilles (pinces crocodile ou fiches banane 4 mm) : GND, P8, P12, P13 a gauche ; 3V3, P0, P1, P2 a droite.
const PASTILLES_GROVE = {
    GND: { x: 322, y: 57, d: [-1, 0] },  P8: { x: 322, y: 115, d: [-1, 0] },
    P12: { x: 322, y: 355, d: [-1, 0] }, P13: { x: 322, y: 406, d: [-1, 0] },
    '3V3': { x: 678, y: 57, d: [1, 0] }, P0: { x: 678, y: 115, d: [1, 0] },
    P1: { x: 678, y: 355, d: [1, 0] },   P2: { x: 678, y: 406, d: [1, 0] },
};
const Y_SOUS_GROVE = 446;   // passage du fil 3V3 sous la carte, vers les modules de gauche

// BitMaker V2 relevee sur la photo de dessus du fabricant (114992653_front-05 : carte de 563 x 692 px pour
// 57 x 70 mm) ; chaque cote se convertit directement depuis les pixels de la photo. Carte noire, connecteur
// de la micro:bit a 13,5 mm du haut, 3 ports Grove a gauche (P8, I2C, P15) et 3 a droite (~P0, ~P1, ~P2),
// 4 LED RGB sur P13 en losange, 5 pastilles pour pinces crocodile en bas (0, 1, 2, VCC, GND).
const BM = { x: 346.5, y: 154, k: 307 / 563, ox: 418, oy: 186 };
const bx = px => BM.x + (px - BM.ox) * BM.k, by = py => BM.y + (py - BM.oy) * BM.k;
const BM_BAS = by(878);
const FENTE_BITMAKER = { x: bx(400), y: by(320), l: (1000 - 400) * BM.k, h: (390 - 320) * BM.k };
// Ports : centre vertical sur la photo, cote, signaux 1 et 2 (fils jaune et blanc), noms des fils de haut en bas.
const PORTS_BITMAKER = {
    'P8':  { cy: 467.5, g: true,  sig: ['pin8', 'pin14'], fils: ['GND', 'VCC', 'P14', 'P8'] },
    'I2C': { cy: 597.5, g: true,  sig: [],                fils: ['GND', 'VCC', 'SDA', 'SCL'] },
    'P15': { cy: 727.5, g: true,  sig: ['pin15', 'pin16'], fils: ['GND', 'VCC', 'P16', 'P15'] },
    '~P0': { cy: 467.5, g: false, sig: ['pin0', 'pin1'],  fils: ['~P0', '~P1', 'VCC', 'GND'] },
    '~P1': { cy: 597.5, g: false, sig: ['pin1', 'pin2'],  fils: ['~P1', '~P2', 'VCC', 'GND'] },
    '~P2': { cy: 727.5, g: false, sig: ['pin2', 'pin12'], fils: ['~P2', 'P12', 'VCC', 'GND'] },
};
// Port d'une broche seule : celui ou elle est le signal 1 (fil jaune).
const PORT_BITMAKER_DE_BROCHE = { pin8: 'P8', pin14: 'P8', pin15: 'P15', pin16: 'P15', pin0: '~P0', pin1: '~P1', pin2: '~P2', pin12: '~P2' };

/** Les 4 fils d'un port de la BitMaker, dans l'ordre de la serigraphie (de haut en bas, pas de 20 px sur la photo). */
function filsPortBitmaker(nom) {
    const p = PORTS_BITMAKER[nom];
    const x = p.g ? bx(403) : bx(998), d = [p.g ? -1 : 1, 0];
    const signal1 = p.fils[p.g ? 3 : 0];
    const couleur = f => f === 'GND' ? F.noir : f === 'VCC' ? F.rouge : f === signal1 ? F.jaune : F.blanc;
    return p.fils.map((f, i) => ({ x, y: by(p.cy + (i - 1.5) * 20), d, c: couleur(f) }));
}

function branchementBitmaker(pins) {
    // Un port qui porte toutes les broches du module (joystick X/Y sur ~P0, par exemple), sinon un cable par port.
    const entier = Object.keys(PORTS_BITMAKER).find(n => PORTS_BITMAKER[n].sig[0] === pins[0] &&
                                                         pins.every(b => PORTS_BITMAKER[n].sig.includes(b)));
    const ports = entier ? [entier] : [...new Set(pins.map(b => PORT_BITMAKER_DE_BROCHE[b]).filter(Boolean))];
    const sans = pins.filter(b => !PORT_BITMAKER_DE_BROCHE[b]).map(b => 'P' + b.slice(3));
    const res = { fils: ports.flatMap(filsPortBitmaker), etiquette: ports.concat(sans).join(' + '),
                  // Port et broches : sur cette carte, P1 et P2 sortent chacune sur deux ports.
                  occupe: ports.map(n => 'port ' + n).concat(pins) };
    if (sans.includes('P13')) res.alerte = 'P13 réservée aux LED de la carte';
    else if (sans.length) res.alerte = sans.join(', ') + ' sans port sur cette carte';
    return res;
}

// DFR0548 relevee sur le schema « Board Overview » du wiki DFRobot (750 x 673 px, carte de x 100 a 642 et de
// y 37 a 662). Sur la carte, le connecteur de la micro:bit est en bas : on la tourne d'un demi-tour (connecteur
// en haut, sous la micro:bit qui reste lisible), les inscriptions restant redessinees a l'endroit. Apres le
// demi-tour : bornier M1 a M4 en bas, alimentation, prise jack et interrupteur a gauche, broches de la micro:bit
// (P, 3V3, GND), servos (S, VIN, GND) et I2C a droite.
const DFR = { x: 344, y: 161, k: 312 / 542, ox: 642, oy: 662 };
const dx = px => DFR.x + (DFR.ox - px) * DFR.k, dy = py => DFR.y + (DFR.oy - py) * DFR.k;
const DFR_BAS = dy(37);
const FENTE = { x: dx(640), y: dy(545), l: 540 * DFR.k, h: 50 * DFR.k };
// Vis du bornier (pixels du schema) : la borne + de chaque moteur, puis la borne -.
const VIS_DFR = { 1: [538, 490], 2: [442, 394], 3: [346, 298], 4: [250, 202] };
const NOMS_VIS_DFR = { 1: ['1A+', '1A-'], 2: ['1B+', '1B-'], 3: ['2A+', '2A-'], 4: ['2B+', '2B-'] };
// Rangees de broches : ordonnee de chaque rangee sur le schema (pas de 24,3 px).
const yRangDfr = i => 432.3 - i * 24.33;
const GPIO_DFR = { P0: yRangDfr(0), P1: yRangDfr(1), P2: yRangDfr(2), P8: yRangDfr(3), P12: yRangDfr(4),
                   P13: yRangDfr(5), P14: yRangDfr(6), P15: yRangDfr(7), P16: yRangDfr(8) };
const COLONNES_GPIO = { S: 157, V: 133, G: 110 }, COLONNES_SERVO = { S: 268, V: 245, G: 220 };
const I2C_DFR = { C: 157, D: 133, V: 205, G: 181 };   // ordonnees des rangees ; broches prises a x 110

/** Fils d'une rangee a 3 broches (signal, V, G) vers la droite. */
function filsRangeeDfr(colonnes, y, couleurs) {
    return ['S', 'V', 'G'].map((c, i) => ({ x: dx(colonnes[c]), y: dy(y), d: [1, 0], c: couleurs[i] }));
}

// Motor:bit V1.6 relevee sur le dessin cote du wiki ELECFREAKS (carte blanche de 60 x 47,5 mm, de x 222 a 578 et
// de y 148 a 432 sur le dessin) : connecteur de la micro:bit en haut (pas de demi-tour), bornier bleu des moteurs a
// gauche (M1+, M1-, M2-, M2+), buzzer sur P0, broches G-3V3-S (P3 a P7, P9 a P11) et G-VCC-S (P13 a P16, P19 et P20,
// I2C sur P19 = SCL et P20 = SDA), alimentation 6 a 12 V et interrupteur a droite.
const MB = { x: 338.5, y: 228, k: 323 / 356, ox: 222, oy: 148 };
const mx = px => MB.x + (px - MB.ox) * MB.k, my = py => MB.y + (py - MB.oy) * MB.k;
const MB_BAS = my(432);
const FENTE_MOTORBIT = { x: mx(230), y: my(148), l: 340 * MB.k, h: 37 * MB.k };
const VIS_MOTORBIT = { 1: [222, 247], 2: [308, 283] };   // vis + puis - de chaque moteur (ordonnees sur le dessin)
const GAUCHE_MOTORBIT = [3, 4, 5, 6, 7, 9, 10, 11], DROITE_MOTORBIT = [13, 14, 15, 16, 19, 20];
const xBrocheMotorbit = n => GAUCHE_MOTORBIT.includes(n) ? 287 + GAUCHE_MOTORBIT.indexOf(n) * 15.2 : 487 + DROITE_MOTORBIT.indexOf(n) * 15;
const RANGS_MOTORBIT = { S: 257, V: 271, G: 285 };
const RESERVEES_MOTORBIT = { 1: 'M1', 8: 'M1', 2: 'M2', 12: 'M2' };

/** Fils d'une broche de la Motor:bit : a gauche ils descendent vers les modules du bas, a droite ils partent a droite. */
function filsBrocheMotorbit(n, couleurs) {
    const x = xBrocheMotorbit(n), gauche = GAUCHE_MOTORBIT.includes(n);
    return ['S', 'V', 'G'].map((r, i) => ({ x: mx(x) + (gauche ? (i - 1) * 3 : 0), y: my(RANGS_MOTORBIT[r]),
                                            d: gauche ? [0, 1] : [1, 0], c: couleurs[i] }));
}
function filsI2cMotorbit() {
    // P19 = SCL (fil jaune), P20 = SDA (blanc), alimentation prise sur la rangee VCC / GND de P19.
    return [{ x: mx(xBrocheMotorbit(19)), y: my(RANGS_MOTORBIT.S), d: [1, 0], c: F.jaune },
            { x: mx(xBrocheMotorbit(20)), y: my(RANGS_MOTORBIT.S), d: [1, 0], c: F.blanc },
            { x: mx(xBrocheMotorbit(19)), y: my(RANGS_MOTORBIT.V), d: [1, 0], c: F.rouge },
            { x: mx(xBrocheMotorbit(19)), y: my(RANGS_MOTORBIT.G), d: [1, 0], c: F.noir }];
}
function branchementMotorbit(pins, servo) {
    const fils = [], noms = pins.map(p => 'P' + p.slice(3));
    let alerte = '';
    pins.forEach((p, i) => {
        const n = Number(p.slice(3));
        if (RESERVEES_MOTORBIT[n]) { alerte = 'P' + n + ' : moteur ' + RESERVEES_MOTORBIT[n]; return; }
        if (n === 0) { alerte = 'P0 : buzzer de la carte'; return; }
        if (!GAUCHE_MOTORBIT.includes(n) && !DROITE_MOTORBIT.includes(n)) { alerte = 'P' + n + ' absente de la carte'; return; }
        const rang = filsBrocheMotorbit(n, [servo ? F.orange : (fils.length ? F.blanc : F.jaune), F.rouge, servo ? F.marron : F.noir]);
        fils.push(...(fils.length ? rang.slice(0, 1) : rang));
    });
    return { fils, etiquette: noms.join(' + '), occupe: noms, alerte };
}

// ---------- Lecture du programme ----------
function broches(bloc, champs) {
    const res = [];
    for (const c of champs || []) {
        const v = bloc.getFieldValue(c);
        if (v) for (const p of String(v).split(/\s*,\s*/)) if (!res.includes(p)) res.push(p);
    }
    return res;
}

/** Modules a dessiner, chacun avec ses fils : [{ nom, picto, large, etiquette, note, fils: [{x, y, d, c}] }]. */
function lireMontage() {
    // Blocs desactives (hachures), ou poses dans un bloc desactive : ignores, comme dans le programme envoye a la carte.
    const blocs = (window.workspace ? window.workspace.getAllBlocks(false) : [])
        .filter(b => b.isEnabled() && !(b.getInheritedDisabled && b.getInheritedDisabled()));
    const types = blocs.map(b => b.type);
    const dfr = types.some(t => /^dfr_/.test(t));
    // Des blocs Motor:bit imposent cette carte, comme ceux de la DFR0548 (celle-ci l'emporte si les deux sont poses).
    const motorbit = !dfr && (types.some(t => /^motorbit_/.test(t)) || choixCarte() === 'motorbit');
    const imposee = dfr ? 'dfr' : types.some(t => /^motorbit_/.test(t)) ? 'motorbit' : '';
    const bitmaker = !dfr && !motorbit && choixCarte() === 'bitmaker';
    const utile = types.some(t => BLOC_EXTENSION.test(t));
    const modules = new Map();
    const ajouter = (cle, m) => { if (!modules.has(cle)) { m.id = cle; modules.set(cle, m); } };

    for (const b of blocs) {
        if (dfr && /^dfr_(moteur|moteur_arreter)$/.test(b.type)) {
            const n = b.getFieldValue('MOTEUR');
            if (!VIS_DFR[n]) continue;
            const [plus, moins] = VIS_DFR[n];
            ajouter('M' + n, { nom: 'Moteur C.C.', picto: 'moteur', large: true, etiquette: 'M' + n, occupe: ['M' + n], cle: n,
                fils: [{ x: dx(plus), y: dy(10), d: [0, 1], c: F.rouge }, { x: dx(moins), y: dy(10), d: [0, 1], c: F.noir }] });
            continue;
        }
        if (motorbit && /^motorbit_moteur(_arreter)?$/.test(b.type)) {
            const n = b.getFieldValue('MOTEUR');
            if (!VIS_MOTORBIT[n]) continue;
            const [plus, moins] = VIS_MOTORBIT[n];
            ajouter('MB' + n, { nom: 'Moteur C.C.', picto: 'moteur', large: true, etiquette: 'M' + n, occupe: ['M' + n], cle: n,
                zone: 'motorbit-moteurs',
                fils: [{ x: mx(222), y: my(plus), d: [-1, 0], c: F.rouge }, { x: mx(222), y: my(moins), d: [-1, 0], c: F.noir }] });
            continue;
        }
        if (dfr && b.type === 'dfr_pas_a_pas') {
            const paire = b.getFieldValue('PAIRE'), modele = b.getFieldValue('MODELE') === '42' ? '42BYGH' : '28BYJ-48';
            const [a, c] = paire === '2' ? [3, 4] : [1, 2];
            const couleurs = modele === '42BYGH' ? [F.noir, F.vert, F.rouge, F.bleu] : [F.orange, F.rose, F.jaune, F.bleu];
            const fils = [];
            [a, c].forEach((n, i) => { VIS_DFR[n].forEach((vis, j) => fils.push({ x: dx(vis), y: dy(10), d: [0, 1], c: couleurs[i * 2 + j] })); });
            ajouter('PAS' + paire, { nom: 'Pas à pas ' + modele, picto: 'pas', modele, cle: paire, etiquette: 'M' + a + ' + M' + c, occupe: ['M' + a, 'M' + c], fils });
            continue;
        }
        if (dfr && b.type === 'dfr_servo') {
            const n = Number(b.getFieldValue('SERVO'));
            ajouter('S' + n, { nom: 'Servomoteur', picto: 'servo', etiquette: 'S' + n, occupe: ['S' + n], cle: 'DFR S' + n,
                fils: filsRangeeDfr(COLONNES_SERVO, yRangDfr(n - 1), [F.orange, F.rouge, F.marron]) });
            continue;
        }
        const def = MODULES.find(m => m.motif.test(b.type));
        if (!def) continue;
        if (def.i2c) {
            ajouter(def.nom, { nom: def.nom, picto: def.picto, large: def.large, etiquette: 'I2C', i2c: true,
                fils: dfr ? filsI2cDfr() : motorbit ? filsI2cMotorbit() : bitmaker ? filsPortBitmaker('I2C') : filsPort(PORTS_GROVE.I2C) });
            // Pilote 16 servos : servomoteur dessine sur chaque voie ecrite en nombre (voie 0 = P1 ... 15 = P16)
            if (def.picto === 'servo16' && /^grove_pca_(angle|continu)$/.test(b.type)) {
                const cible = b.getInputTargetBlock('VOIE'), voie = cible && cible.type === 'math_number' ? Number(cible.getFieldValue('NUM')) : NaN;
                const m = modules.get(def.nom);
                m.sorties = m.sorties || [];
                if (Number.isInteger(voie) && voie >= 0 && voie <= 15) {
                    const o = m.sorties.find(s => s.n === voie + 1);
                    if (o) o.continu = o.continu || b.type === 'grove_pca_continu';
                    else m.sorties.push({ n: voie + 1, continu: b.type === 'grove_pca_continu' });
                }
            }
            continue;
        }
        const pins = broches(b, def.champs);
        if (!pins.length) continue;
        if (bitmaker && def.picto === 'ruban' && pins[0] === 'pin13') {
            // Sur la BitMaker, P13 pilote les 4 LED soudees : pas de module ni de cable, ce sont elles qui s'allument.
            ajouter('ruban-carte', { nom: def.nom, etiquette: 'LED de la carte (P13)', fils: [], surCarte: true,
                                     note: Number(b.getFieldValue('NB')) > 4 ? 'la carte n\'a que 4 LED' : '' });
            continue;
        }
        const cle = def.nom + '|' + pins.join(',');
        // Servomoteur a rotation continue (bloc « servo continu ») : dessine avec sa roue (modele R4)
        const continu = !!def.servo && b.type === 'servo_continu';
        if (modules.has(cle)) { if (continu) modules.get(cle).continu = true; continue; }
        ajouter(cle, Object.assign({ nom: def.nom, picto: def.picto, large: def.large, pins, cle: 'P' + pins[0].slice(3), continu,
            nb: def.picto === 'ruban' ? Number(b.getFieldValue('NB')) || 16 : undefined },
            dfr ? branchementDfr(pins, def.servo) : motorbit ? branchementMotorbit(pins, def.servo) :
            bitmaker ? branchementBitmaker(pins) : branchementGrove(pins)));
    }

    // Deux modules sur le meme port (ou la meme broche) : possible dans le programme, pas sur la table.
    const parPort = {};
    for (const m of modules.values()) for (const k of new Set(m.occupe || [])) (parPort[k] = parPort[k] || []).push(m);
    // Danger signale par un bandeau rouge et un contour rouge autour des modules (choix de l'utilisateur, nov. 2026).
    // Un meme couple peut se partager le port et la broche : une seule ligne, avec la broche (pin0 -> P0) si connue.
    const conflits = new Map();
    for (const [port, liste] of Object.entries(parPort)) {
        if (liste.length < 2) continue;
        const cle = liste.map(m => m.id).sort().join('|'), broche = /^pin\d+$/.test(port) ? 'P' + port.slice(3) : '';
        const deja = conflits.get(cle);
        if (!deja) conflits.set(cle, { port: broche || port.replace(/^port\s*/, ''), noms: liste.map(m => m.nom) });
        else if (broche) deja.port = broche;
        liste.forEach(m => { m.alerte = m.alerte || 'broche partagée'; m.conflit = true; });
    }
    const i2c = [...modules.values()].filter(m => m.i2c);
    let liste = [...modules.values()];
    if (i2c.length > 1 && !dfr && !motorbit) liste = avecHubs(liste, i2c);
    else if (i2c.length > 1) i2c.forEach(m => { m.note = 'bus I2C partagé'; });

    // Sans bloc d'extension : la micro:bit seule dans la scene (carte « aucune »), comme la simulation du modele.
    const carte = !utile ? 'aucune' : dfr ? 'dfr' : motorbit ? 'motorbit' : bitmaker ? 'bitmaker' : 'grove';
    return { utile, imposee, carte, modules: liste, conflits: [...conflits.values()] };
}

/** Plusieurs modules I2C sur une carte a prises Grove (Grove Shield, BitMaker) : une prise ne prend qu'un cable, on
    intercale un Hub I2C Grove (choix de l'utilisateur, nov. 2026). Cable de la carte sur J1 du premier hub, un module
    par prise J2, J3, J4 ; au-dela de 3 modules, hubs chaines (J4 d'un hub vers J1 du suivant, « Chainable » chez
    Seeed). m.source : hub et prise d'ou part le cable du module (relierHubs, une fois les places connues) ;
    m.niveau : rangee du module (le hub avant ses modules, disposer). */
function avecHubs(liste, i2c) {
    const nbHubs = Math.max(1, Math.ceil((i2c.length - 3) / 2) + 1);
    const hubs = [];
    for (let h = 1; h <= nbHubs; h++) {
        hubs.push({ id: 'hub' + h, nom: 'Hub I2C', picto: 'hub', hub: h, niveau: h - 1,
            etiquette: h === 1 ? 'I2C' : 'J4 du hub ' + (h - 1),
            fils: i2c[0].fils.map(f => Object.assign({}, f)),
            source: h > 1 ? { hub: 'hub' + (h - 1), prise: 4 } : null });
    }
    let i = 0;
    hubs.forEach((hub, h) => {
        for (const prise of h < nbHubs - 1 ? [2, 3] : [2, 3, 4]) {
            const m = i2c[i++];
            if (!m) break;
            m.source = { hub: hub.id, prise };
            m.niveau = h + 1;
            m.note = 'hub I2C' + (nbHubs > 1 ? ' ' + (h + 1) : '') + ', J' + prise;
        }
    });
    // Ordre : les autres modules, puis chaque hub suivi de ses modules
    const autres = liste.filter(m => !m.i2c);
    const ordonnes = [];
    hubs.forEach(hub => ordonnes.push(hub, ...i2c.filter(m => m.source.hub === hub.id)));
    return autres.concat(ordonnes);
}
/** Broches d'une prise du hub (dessinHub : GND, VCC, SDA, SCL de haut en bas, prise ouverte vers le haut), dans l'ordre
    des fils GROVE (jaune SCL, blanc SDA, rouge VCC, noir GND). Comme sur la prise D2 de reference (demande de
    l'utilisateur, nov. 2026) : chaque fil entre par l'ouverture et finit sur sa broche, les fils decales en biais pour
    ne pas se cacher (noir a gauche et le moins enfonce, jaune a droite et le plus enfonce). */
const HUB_BROCHES_Y = [12.5, 10.5, 8.5, 6.5];
function brochesHub(geo, prise) {
    const cx = HUB_PRISES[prise - 1];
    return GROVE.map((c, i) => geo.point(cx - 1.6 + (3 - i) * 0.95, HUB_BROCHES_Y[i]));
}
const pointBroche = (p, c) => cercle(p.x, p.y, 2.4, `fill="${c}" stroke="#333" stroke-width="0.8"`);

/** Cables des modules branches sur un hub : ils partent des broches de la prise (J2 a J4) du hub, vers le haut (la
    prise s'ouvre vers le haut), une fois celui-ci place. */
function relierHubs(modules) {
    for (const m of modules) {
        if (!m.source) continue;
        const hub = modules.find(x => x.id === m.source.hub), geo = hub && geometrie(hub);
        if (!geo) continue;
        const a = geo.rot * Math.PI / 180, d = [Math.round(Math.sin(a)), Math.round(-Math.cos(a))];
        const broches = brochesHub(geo, m.source.prise);
        m.fils = GROVE.map((c, i) => ({ x: broches[i].x, y: broches[i].y, d, c, surHub: true }));
    }
}

function filsPort(p) {
    // Les 4 fils sortent cote a cote du connecteur, perpendiculairement a la direction de sortie
    // (vers le bas sur la Grove v2.0 : GND, 3V3, signal 2, signal 1 de gauche a droite, comme sur la carte).
    return GROVE.map((c, i) => ({ x: p.x - p.d[1] * (i - 1.5) * 8, y: p.y + p.d[0] * (i - 1.5) * 8, d: p.d, c }));
}
function filsI2cDfr() {
    // Connecteur IIC : C (SCL, fil jaune), D (SDA, blanc), V (rouge), G (noir).
    return [['C', F.jaune], ['D', F.blanc], ['V', F.rouge], ['G', F.noir]].map(([b, c]) => ({ x: dx(110), y: dy(I2C_DFR[b]), d: [1, 0], c }));
}

function branchementGrove(pins) {
    const fils = [], etiquettes = [];
    let horsGrove = false;
    for (const port of [...new Set(pins.map(p => PORT_DE_BROCHE[p]).filter(Boolean))]) {
        fils.push(...filsPort(PORTS_GROVE[port]));
        etiquettes.push(port);
    }
    const autres = pins.filter(p => !PORT_DE_BROCHE[p]);
    if (autres.length) {
        // Pastilles du bord : un fil a pince crocodile par signal, plus GND (a gauche) et 3V3 (a droite, le fil
        // passe sous la carte pour rejoindre le module, range a gauche avec les pastilles P8, P12 et P13).
        horsGrove = true;
        const pince = nom => Object.assign({ pince: true }, PASTILLES_GROVE[nom]);
        autres.forEach((p, i) => { if (PASTILLES_GROVE['P' + p.slice(3)]) fils.push(Object.assign(pince('P' + p.slice(3)), { c: i ? F.blanc : F.jaune })); });
        const v = PASTILLES_GROVE['3V3'];
        fils.push(Object.assign(pince('GND'), { c: F.noir }),
                  Object.assign(pince('3V3'), { c: F.rouge, passage: [[v.x + 46, v.y], [v.x + 46, Y_SOUS_GROVE], [GROVE_PCB.x - 20, Y_SOUS_GROVE]] }));
        etiquettes.push(autres.map(p => 'P' + p.slice(3)).join('/'));
    }
    const occupe = [...new Set(pins.map(p => PORT_DE_BROCHE[p] || 'P' + p.slice(3)))];
    return { fils, etiquette: etiquettes.join(' + '), note: horsGrove ? 'hors port Grove' : '', occupe };
}

function branchementDfr(pins, servo) {
    // Connecteurs a 3 broches (signal, V, G) : cable complet sur le premier signal, fil seul pour les suivants.
    const fils = [];
    pins.forEach((p, i) => {
        const nom = 'P' + p.slice(3), y = GPIO_DFR[nom];
        if (y === undefined) return;
        const rangee = filsRangeeDfr(COLONNES_GPIO, y, [servo ? F.orange : (i ? F.blanc : F.jaune), F.rouge, servo ? F.marron : F.noir]);
        fils.push(...(i ? rangee.slice(0, 1) : rangee));
    });
    const noms = pins.map(p => 'P' + p.slice(3));
    return { fils, etiquette: noms.join(' + '), occupe: noms };
}

// ---------- Disposition des modules autour de la carte ----------
function disposer(modules, basCarte) {
    const cotes = { g: [], d: [], b: [] };
    for (const m of modules) {
        if (m.surCarte) continue;
        if (dimensions(m) && dimensions(m).fixe) {
            // Ruban de LED (modele R4) : fixe, au-dessus de la carte, centre ; son cable descend jusqu'au port.
            m.fixe = true;
            m.x = LARGEUR / 2 - MODULE.l / 2;
            m.y = CARTE.y - 50 - hauteurModule(m);
            continue;
        }
        if (!m.fils.length) { m.cote = 'b'; m.ancre = [LARGEUR / 2, basCarte]; cotes.b.push(m); continue; }
        const [dx] = m.fils[0].d;
        m.cote = dx < 0 ? 'g' : dx > 0 ? 'd' : 'b';
        m.ancre = m.fils.reduce((s, f) => [s[0] + f.x / m.fils.length, s[1] + f.y / m.fils.length], [0, 0]);
        cotes[m.cote].push(m);
    }
    let bas = basCarte;
    for (const c of ['g', 'd']) {
        let y = 16;
        cotes[c].sort((a, b) => (a.niveau || 0) - (b.niveau || 0) || a.ancre[1] - b.ancre[1]).forEach(m => {
            m.y = Math.max(y, m.ancre[1] - 60);
            m.x = c === 'g' ? 30 : LARGEUR - 30 - MODULE.l;
            y = m.y + hauteurModule(m, c === 'g' ? 'droite' : 'gauche') + 96;
            bas = Math.max(bas, y);
        });
    }
    // Rangee du bas (les ports Grove v2.0 sont tous en bas) : chaque module sous son port, a la ligne si elle deborde.
    // Chaque ligne est centree sous ses ports, sans sortir de la scene.
    // Chaque module prend sa largeur reelle (au moins une case) : l'ecran LCD RGB (80 mm) ne chevauche pas ses voisins.
    const [xMin, xMax, ecart] = [30, LARGEUR - 30, 20];
    // Hub I2C : chaque niveau (hub, puis ses modules) commence une nouvelle ligne
    const tries = cotes.b.sort((a, b) => (a.niveau || 0) - (b.niveau || 0) || a.ancre[0] - b.ancre[0]);
    const lignes = [];
    for (const m of tries) {
        const l = largeurModule(m, 'haut'), ligne = lignes[lignes.length - 1];
        if (ligne && ligne.niveau === (m.niveau || 0) && ligne.largeur + ecart + l <= xMax - xMin) { ligne.modules.push(m); ligne.largeur += ecart + l; }
        else lignes.push({ modules: [m], largeur: l, niveau: m.niveau || 0 });
    }
    let yLigne = basCarte + 90;
    for (const { modules: ligne, largeur } of lignes) {
        const centre = ligne.reduce((s, m) => s + m.ancre[0], 0) / ligne.length;
        let x = Math.max(xMin, Math.min(centre - largeur / 2, xMax - largeur));
        const hLigne = Math.max(...ligne.map(m => hauteurModule(m, 'haut')));   // le module le plus haut de la ligne
        ligne.forEach(m => {
            const l = largeurModule(m, 'haut');
            m.x = x + (l - MODULE.l) / 2;   // m.x : bord gauche de la case, le dessin est centre dessus
            m.y = yLigne;
            x += l + ecart;
            bas = Math.max(bas, m.y + hLigne + 96);
        });
        yLigne += hLigne + 110;
    }
    return bas + 10;
}

// Modules dessines d'apres le modele (modules-dessins.js) : comme le modele (rotationVers, r4-board-svg.js), chaque module
// est tourne par quart de tour pour que sa prise regarde le port d'ou part son cable (afficheurs : jamais tournes). Sa
// taille reelle (une fois tourne) compte pour le rangement et la place des libelles.
const COTES = ['haut', 'droite', 'bas', 'gauche'];   // dans le sens des aiguilles d'une montre
const ARRIVEE = { haut: [0, 1], droite: [-1, 0], bas: [0, -1], gauche: [1, 0] };   // sens du cable qui arrive sur une prise
function rotationVers(def, cote) {
    if (def.afficheur) return 0;
    return ((COTES.indexOf(cote) - COTES.indexOf(def.connecteur.sens)) * 90 + 360) % 360;
}
/** Cote ou doit se trouver la prise : vers le port de la carte d'extension (depart des fils), ou celui du rangement. */
function coteVoulu(m) {
    if (m.x !== undefined && m.fils && m.fils.length) {
        const px = m.fils.reduce((s, f) => s + f.x, 0) / m.fils.length, py = m.fils.reduce((s, f) => s + f.y, 0) / m.fils.length;
        const dx = px - (m.x + MODULE.l / 2), dy = py - (m.y + MODULE.h / 2);
        return Math.abs(dy) >= Math.abs(dx) ? (dy > 0 ? 'bas' : 'haut') : (dx > 0 ? 'droite' : 'gauche');
    }
    return { g: 'droite', d: 'gauche', b: 'haut' }[m.cote] || 'haut';
}
/** Dessin d'un module avec sa taille du moment (le ruban depend de son nombre de LED : def.taille). */
function dimensions(m) {
    const def = DESSINS_MODULES[m.picto];
    return def && def.taille ? Object.assign({}, def, def.taille(m)) : def;
}
/** Hauteur occupee par un module (au moins la case MODULE.h), pour le rangement et les libelles. */
function hauteurModule(m, cote) {
    const def = dimensions(m);
    if (!def) return MODULE.h;
    const rot = rotationVers(def, cote || coteVoulu(m));
    // deborde : ce qui depasse du circuit (oreilles, lentille du PIR), en mm de chaque cote, pour ne pas toucher les libelles
    return Math.max(MODULE.h, ((rot % 180 ? def.largeur : def.hauteur) + 2 * (def.deborde || 0)) * K_MODULE);
}
/** Largeur occupee par un module (au moins la case MODULE.l), pour le rangement. */
function largeurModule(m, cote) {
    const def = dimensions(m);
    if (!def) return MODULE.l;
    const rot = rotationVers(def, cote || coteVoulu(m));
    return Math.max(MODULE.l, ((rot % 180 ? def.hauteur : def.largeur) + 2 * (def.deborde || 0)) * K_MODULE);
}
/** Geometrie d'un module dessine : rotation, centre, et passage d'un point du dessin (mm) a la scene. */
function geometrie(m) {
    const def = dimensions(m);
    if (!def || m.x === undefined) return null;
    const rot = rotationVers(def, coteVoulu(m));
    const w0 = def.largeur * K_MODULE, h0 = def.hauteur * K_MODULE, haut = hauteurModule(m);
    const cx = m.x + MODULE.l / 2, cy = m.y + haut / 2, a = rot * Math.PI / 180;
    const point = (px, py) => {
        const x = px * K_MODULE - w0 / 2, y = py * K_MODULE - h0 / 2;
        return { x: cx + x * Math.cos(a) - y * Math.sin(a), y: cy + x * Math.sin(a) + y * Math.cos(a) };
    };
    const cote = COTES[(COTES.indexOf(def.connecteur.sens) + rot / 90) % 4];
    return { def, rot, cx, cy, w0, h0, haut, point, cote };
}

/** Point d'arrivee du cable sur le module (cote tourne vers la carte) et direction d'arrivee. */
function arrivee(m) {
    const geo = geometrie(m);
    if (geo) {
        // Module dessine (modele R4) : sur sa prise (tournee vers le port), le cable y arrive en sens inverse de sa sortie.
        const p = geo.point(geo.def.connecteur.x, geo.def.connecteur.y);
        return { x: p.x, y: p.y, d: ARRIVEE[geo.cote] };
    }
    if (m.cote === 'g') return { x: m.x + MODULE.l / 2 + largeurPcb(m) / 2 + 8, y: m.y + MODULE.h / 2, d: [-1, 0] };
    if (m.cote === 'd') return { x: m.x + MODULE.l / 2 - largeurPcb(m) / 2 - 8, y: m.y + MODULE.h / 2, d: [1, 0] };
    return { x: m.x + MODULE.l / 2, y: m.y - 6, d: [0, 1] };
}
const largeurPcb = m => (m.large ? 150 : 74);

// ---------- Dessin ----------
const r = (x, y, l, h, att) => `<rect x="${x}" y="${y}" width="${l}" height="${h}" ${att || ''}/>`;
const cercle = (x, y, rayon, att) => `<circle cx="${x}" cy="${y}" r="${rayon}" ${att || ''}/>`;
const texte = (x, y, t, att) => `<text x="${x}" y="${y}" ${att || ''}>${t}</text>`;
const trTexte = t => (window.trTexte ? window.trTexte(String(t)) : String(t));
const echap = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function trou(x, y) { return cercle(x, y, 9, 'fill="#c9a54a"') + cercle(x, y, 5, 'fill="#0b0b0b"'); }

function dessinCarteGrove() {
    const { x, y, l, oreille, encoche } = GROVE_PCB, droite = x + l, bas = y + l;
    // Carte noire echancree en haut : la micro:bit couvre l'echancrure.
    let s = `<path d="M${x + 8} ${y} H${x + oreille} V${y + encoche} H${droite - oreille} V${y} H${droite - 8} Q${droite} ${y} ${droite} ${y + 8} ` +
            `V${bas - 8} Q${droite} ${bas} ${droite - 8} ${bas} H${x + 8} Q${x} ${bas} ${x} ${bas - 8} V${y + 8} Q${x} ${y} ${x + 8} ${y} Z" ` +
            'fill="#111214" stroke="#34383e" stroke-width="2"/>';
    // Prise micro USB et voyant PWR a gauche, connecteur plat a droite, quelques composants.
    s += r(x - 4, 166, 30, 30, 'rx="3" fill="#b9bec4" stroke="#7d838a"') + r(x + 2, 174, 18, 14, 'rx="2" fill="#5d636a"');
    // Textes verticaux, comme sur la carte : a l'horizontale, la micro:bit les cacherait.
    const vertical = (tx, ty, t) => texte(tx, ty, t, `class="montage-serigraphie petite" text-anchor="middle" dominant-baseline="central" transform="rotate(90 ${tx} ${ty})"`);
    s += vertical(x + 40, 181, 'USB');
    s += r(x + 14, 250, 10, 6, 'fill="#e8e8e8"') + vertical(x + 40, 253, 'PWR');
    s += r(droite - 30, 186, 18, 80, 'rx="2" fill="#e6dcc6" stroke="#9b917c"') + r(droite - 26, 192, 6, 68, 'fill="#3b3b3b"');
    [[372, 300], [398, 300], [600, 300], [626, 300]].forEach(([cx, cy]) => {
        s += r(cx, cy, 14, 8, 'fill="#c9a26a"') + r(cx + 4, cy, 6, 8, 'fill="#3a2f22"'); });
    // Pastilles pour pinces crocodile : cuivre au bord, nom sous forme verticale comme sur la carte.
    for (const [nom, p] of Object.entries(PASTILLES_GROVE)) {
        const g = p.d[0] < 0, bord = g ? x : droite - 34;
        s += r(bord, p.y - 17, 34, 34, 'rx="9" fill="#d9822b"') + cercle(p.x, p.y, 12, 'fill="#f0b45e"') +
             cercle(p.x, p.y, 7, 'style="fill: var(--fond-chrome)"');
        const tx = g ? p.x + 26 : p.x - 26;
        s += texte(tx, p.y, nom, `class="montage-serigraphie petite" text-anchor="middle" dominant-baseline="central" transform="rotate(${g ? 90 : -90} ${tx} ${p.y})"`);
    }
    // Ports Grove ouverts vers le bas, dessines comme ceux de la BitMaker (choix de l'utilisateur, nov. 2026) :
    // boitier beige vu de profil, ouverture plus foncee cote cable, 4 broches dorees cote carte. Leur nom est imprime
    // dessous sur la carte, mais les cables le cacheraient : il passe au-dessus.
    for (const [nom, p] of Object.entries(PORTS_GROVE)) {
        s += r(p.x - 27, p.y - 52, 54, 52, 'rx="3" fill="#ece3d6" stroke="#bfb3a2"');
        s += r(p.x - 18, p.y - 28, 36, 25, 'rx="2" fill="#d8cdbb" stroke="#c9bca7"');
        [-12, -4, 4, 12].forEach(dx => { s += r(p.x + dx - 1.75, p.y - 60, 3.5, 8, 'fill="#c9a54a"'); });
        s += texte(p.x, p.y - 64, nom, 'class="montage-serigraphie" text-anchor="middle"');
    }
    return s;
}

function dessinCarteBitmaker() {
    // Rectangle (x1, y1) - (x2, y2) et texte, en pixels de la photo.
    const rp = (x1, y1, x2, y2, att) => r(bx(x1), by(y1), (x2 - x1) * BM.k, (y2 - y1) * BM.k, att);
    const tp = (x, y, t, att) => texte(bx(x), by(y), t, att);
    let s = rp(418, 186, 981, 878, 'rx="9" fill="#111214" stroke="#34383e" stroke-width="2"');
    // Bandeau du haut (en partie sous la micro:bit) : prise batterie JST, micro USB, selecteur 5 V / 3,3 V.
    s += rp(462, 192, 530, 268, 'rx="2" fill="#ece3d6" stroke="#bfb3a2"') + rp(472, 202, 520, 240, 'fill="#d8cdbb"');
    s += rp(655, 178, 742, 228, 'rx="3" fill="#c0c4c8" stroke="#7d838a"');
    s += rp(845, 205, 935, 247, 'rx="2" fill="#1b1b1b"') + rp(858, 212, 892, 240, 'fill="#c0c4c8"');
    s += tp(437, 248, 'GND', 'class="montage-serigraphie micro"') + tp(433, 278, 'VBAT', 'class="montage-serigraphie micro"');
    s += tp(828, 203, '5V', 'class="montage-serigraphie micro" text-anchor="middle"');
    s += tp(950, 203, '3.3V', 'class="montage-serigraphie micro" text-anchor="middle"');
    // Ports Grove beiges ouverts vers l'exterieur, noms des fils et etiquette blanche du port.
    for (const [nom, p] of Object.entries(PORTS_BITMAKER)) {
        const [x1, x2] = p.g ? [403, 490] : [893, 998];
        s += rp(x1, p.cy - 62, x2, p.cy + 62, 'rx="3" fill="#ece3d6" stroke="#bfb3a2"');
        s += rp(p.g ? x1 + 6 : x2 - 46, p.cy - 40, p.g ? x1 + 46 : x2 - 6, p.cy + 40, 'rx="2" fill="#d8cdbb" stroke="#c9bca7"');
        p.fils.forEach((f, i) => {
            const y = p.cy + (i - 1.5) * 20;
            s += rp(p.g ? 492 : 880, y - 4, p.g ? 512 : 900, y + 4, 'fill="#c9a54a"');
            s += tp(p.g ? 518 : 874, y + 4, f, `class="montage-serigraphie micro" text-anchor="${p.g ? 'start' : 'end'}"`);
        });
        // Etiquette blanche du port, mesuree sur la photo (44 x 25 px).
        const ex = p.g ? 582 : 823;
        s += rp(ex - 22, p.cy - 13, ex + 22, p.cy + 12, 'rx="2" fill="#f4f4f4"') +
             tp(ex, p.cy + 6, nom, 'class="montage-etiquette moyenne" text-anchor="middle"');
        if (!p.g) s += tp(ex, p.cy + 30, 'Analog', 'class="montage-serigraphie micro" text-anchor="middle"');
    }
    // Reperes A et B, nom de la carte, trous de fixation.
    s += rp(570, 405, 600, 432, 'rx="2" fill="#f4f4f4"') + tp(585, 426, 'A', 'class="montage-etiquette moyenne" text-anchor="middle"');
    s += rp(795, 405, 825, 432, 'rx="2" fill="#f4f4f4"') + tp(810, 426, 'B', 'class="montage-etiquette moyenne" text-anchor="middle"');
    s += rp(615, 450, 785, 482, 'rx="8.7" fill="#f4f4f4"') + tp(700, 474, 'BitMaker', 'class="montage-etiquette" text-anchor="middle"');
    s += tp(700, 500, 'V2', 'class="montage-serigraphie micro" text-anchor="middle"');
    for (const x of [620, 783]) s += cercle(bx(x), by(553), 17 * BM.k, 'style="fill: var(--fond-chrome)"');
    // 4 LED RGB adressables (Pixel 0 a 3) en losange autour de l'etiquette P13.
    // Un ruban defini sur P13 les allume (voir copierLedsCarte) ; eteintes, elles restent blanches.
    [[700, 690], [745, 722], [700, 754], [652, 722]].forEach(([x, y], i) => {
        s += rp(x - 10, y - 10, x + 10, y + 10, `class="montage-pixel" data-led="${i}" fill="#f4f4f4" stroke="#9a9a9a"`) +
             cercle(bx(x), by(y), 2.5, 'fill="#8a6d6d"'); });
    s += rp(681, 713, 719, 731, 'fill="#f4f4f4"') + tp(700, 727, 'P13', 'class="montage-etiquette petite" text-anchor="middle"');
    // Pastilles pour pinces crocodile : cuivre jusqu'au bord, trou oblong, nom dessous.
    [[445, 540, '0'], [555, 650, '1'], [665, 740, '2'], [752, 845, 'VCC'], [855, 950, 'GND']].forEach(([x1, x2, nom]) => {
        s += rp(x1, 805, x2, 878, 'rx="4" fill="#c8a27c"');
        s += rp(x1 + 10, 813, x2 - 10, 848, `rx="${17.5 * BM.k}" style="fill: var(--fond-chrome)"`);
        s += tp((x1 + x2) / 2, 870, nom, 'class="montage-pastille" text-anchor="middle"');
    });
    return s;
}

function dessinCarteMotorbit() {
    // Rectangle (x1, y1) - (x2, y2) et texte, en pixels du dessin cote. Serigraphie noire sur la carte blanche.
    const rp = (x1, y1, x2, y2, att) => r(mx(x1), my(y1), (x2 - x1) * MB.k, (y2 - y1) * MB.k, att);
    const tp = (x, y, t, att) => texte(mx(x), my(y), t, att);
    const ser = (x, y, t, ancre) => tp(x, y, t, `class="montage-serigraphie-noire" text-anchor="${ancre || 'middle'}"`);
    let s = rp(222, 148, 578, 432, 'rx="9" fill="#f7f7f5" stroke="#8d939a" stroke-width="2"');
    for (const [x, y] of [[300, 218], [493, 218], [300, 410], [493, 410]]) {
        s += cercle(mx(x), my(y), 13 * MB.k, 'fill="#e0b84a"') + cercle(mx(x), my(y), 7 * MB.k, 'style="fill: var(--fond-chrome)"');
    }
    // Bornier bleu des moteurs et noms des bornes.
    s += rp(222, 210, 268, 322, 'rx="3" fill="#2f7fc4" stroke="#1d5b91"');
    [[222, 'M1+'], [247, 'M1-'], [283, 'M2-'], [308, 'M2+']].forEach(([y, nom]) => {
        s += cercle(mx(242), my(y), 9 * MB.k, 'fill="#d8dde2" stroke="#6b7075"') +
             `<path d="M${mx(242) - 5} ${my(y)} H${mx(242) + 5} M${mx(242)} ${my(y) - 5} V${my(y) + 5}" stroke="#6b7075" stroke-width="1.2"/>`;
        // Noms des bornes ecrits a la verticale, comme sur la carte : a l'horizontale ils mordraient sur les broches.
        s += tp(276, y, nom, `class="montage-serigraphie-noire" text-anchor="middle" dominant-baseline="central" transform="rotate(90 ${mx(276)} ${my(y)})"`);
    });
    // Buzzer passif (P0), voyant PWR, puce TB6612, regulateurs.
    s += rp(225, 340, 280, 395, 'rx="4" fill="#222"') + cercle(mx(252), my(367), 14 * MB.k, 'class="mv-buzzer-carte" fill="#3a3a3a"');
    s += ser(252, 404, 'P0');
    s += rp(326, 372, 340, 384, 'fill="#e65a4a"') + ser(318, 381, 'PWR', 'end');
    s += rp(318, 300, 352, 352, 'fill="#222"') + tp(335, 330, 'TB6612', 'class="montage-cartouche" text-anchor="middle"');
    s += rp(420, 330, 452, 356, 'fill="#2b2b2b"') + rp(372, 388, 404, 412, 'fill="#2b2b2b"') + cercle(mx(440), my(398), 13 * MB.k, 'fill="#3a3a3a"');
    // Broches G-3V3-S (gauche, signal jaune) et G-VCC-S (droite, signal bleu), numeros dessus, noms des rangees.
    const rangee = (n, signal) => [['S', signal], ['V', '#d63a2f'], ['G', '#1b1b1b']].map(([rg, c]) =>
        rp(xBrocheMotorbit(n) - 6.5, RANGS_MOTORBIT[rg] - 6.5, xBrocheMotorbit(n) + 6.5, RANGS_MOTORBIT[rg] + 6.5, `fill="${c}" stroke="#111"`) +
        rp(xBrocheMotorbit(n) - 2, RANGS_MOTORBIT[rg] - 2, xBrocheMotorbit(n) + 2, RANGS_MOTORBIT[rg] + 2, 'fill="#c9a54a"')).join('');
    GAUCHE_MOTORBIT.forEach(n => { s += rangee(n, '#f2c230') + ser(xBrocheMotorbit(n), 245, String(n)); });
    DROITE_MOTORBIT.forEach(n => { s += rangee(n, '#2f7fc4') + ser(xBrocheMotorbit(n), 245, String(n)); });
    const cartouche = (x, y, t) => rp(x - 10, y - 6.5, x + 10, y + 6.5, 'fill="#111"') + tp(x, y + 3, t, 'class="montage-cartouche" text-anchor="middle"');
    [['S', 'SIG'], ['V', '3V3'], ['G', 'GND']].forEach(([rg, t]) => { s += cartouche(412, RANGS_MOTORBIT[rg], t); });
    [['S', 'SIG'], ['V', 'VCC'], ['G', 'GND']].forEach(([rg, t]) => { s += cartouche(468, RANGS_MOTORBIT[rg], t); });
    s += ser(524, 230, 'I2C : 19 SCL · 20 SDA', 'end');
    // Selecteur VCC 5 V / 3,3 V, alimentation 6 a 12 V, interrupteur OFF/ON.
    s += rp(530, 205, 570, 222, 'rx="2" fill="#1b1b1b"') + rp(533, 208, 548, 219, 'fill="#d8dde2"');
    s += tp(536, 200, '5V', 'class="montage-serigraphie-noire mini" text-anchor="middle"') +
         tp(551, 200, 'VCC', 'class="montage-serigraphie-noire mini" text-anchor="middle"') +
         tp(566, 200, '3V3', 'class="montage-serigraphie-noire mini" text-anchor="middle"');
    s += rp(533, 313, 575, 365, 'rx="3" fill="#2f7fc4" stroke="#1d5b91"');
    for (const y of [326, 352]) s += cercle(mx(554), my(y), 9 * MB.k, 'fill="#d8dde2" stroke="#6b7075"');
    s += ser(527, 330, 'GND', 'end') + ser(527, 356, 'VIN', 'end') + ser(500, 343, 'DC 6-12V', 'end');
    s += ser(500, 386, 'MOTOR:BIT', 'end') + rp(512, 375, 574, 390, 'fill="#111"');
    s += tp(528, 386, 'OFF', 'class="montage-cartouche" text-anchor="middle"') + tp(558, 386, 'ON', 'class="montage-cartouche" text-anchor="middle"');
    s += rp(532, 403, 568, 418, 'rx="2" fill="#1b1b1b"') + rp(552, 406, 565, 415, 'fill="#d8dde2"');
    return s;
}

function dessinCarteDfr() {
    // Rectangle (x1, y1) - (x2, y2) du schema, retourne ; texte a l'endroit.
    const rp = (x1, y1, x2, y2, att) => r(dx(x2), dy(y2), (x2 - x1) * DFR.k, (y2 - y1) * DFR.k, att);
    const tp = (x, y, t, att) => texte(dx(x), dy(y), t, att);
    const ser = (x, y, t, ancre) => tp(x, y, t, `class="montage-serigraphie micro" text-anchor="${ancre || 'middle'}"`);
    let s = rp(100, 37, 642, 662, 'rx="9" fill="#15171a" stroke="#34383e" stroke-width="2"');
    for (const [x, y] of [[130, 68], [615, 68], [130, 592], [615, 592]]) {
        s += cercle(dx(x), dy(y), 18 * DFR.k, 'fill="#c9a54a"') + cercle(dx(x), dy(y), 9 * DFR.k, 'style="fill: var(--fond-chrome)"');
    }
    // Bornier vert des moteurs (8 vis), noms des bornes et des moteurs.
    s += rp(178, 10, 565, 112, 'rx="3" fill="#2f9e5b" stroke="#1d6b3c"') + rp(178, 10, 565, 40, 'fill="#25804a"');
    for (const [n, vis] of Object.entries(VIS_DFR)) {
        vis.forEach((x, j) => {
            s += cercle(dx(x), dy(72), 20 * DFR.k, 'fill="#c0c4c8" stroke="#6b7075"') +
                 `<path d="M${dx(x) - 7} ${dy(72)} H${dx(x) + 7} M${dx(x)} ${dy(72) - 7} V${dy(72) + 7}" stroke="#6b7075" stroke-width="1.5"/>`;
            s += ser(x, 126, NOMS_VIS_DFR[n][j]);
        });
        s += tp((vis[0] + vis[1]) / 2, 150, 'M' + n, 'class="montage-etiquette-claire" text-anchor="middle"');
    }
    // Alimentation : bornier - +, prise jack, interrupteur ON/OFF, voyant PWR.
    s += rp(588, 140, 640, 240, 'rx="3" fill="#2f9e5b" stroke="#1d6b3c"');
    for (const y of [166, 212]) s += cercle(dx(607), dy(y), 17 * DFR.k, 'fill="#c0c4c8" stroke="#6b7075"');
    s += tp(560, 160, '−', 'class="montage-serigraphie" text-anchor="middle"') + tp(560, 206, '+', 'class="montage-serigraphie" text-anchor="middle"');
    s += ser(500, 245, '3,5 à 5,5 V');
    s += rp(537, 250, 640, 345, 'rx="3" fill="#1b1b1b" stroke="#444"') + rp(560, 270, 600, 325, 'fill="#2b2b2b"');
    s += rp(535, 350, 650, 478, 'rx="3" fill="#d9d9d9" stroke="#999"') + rp(640, 395, 690, 430, 'rx="2" fill="#2b2b2b"');
    s += ser(520, 395, 'ON', 'end') + ser(520, 440, 'OFF', 'end');
    s += rp(492, 400, 503, 410, 'fill="#e65a4a"') + ser(497, 425, 'PWR');
    // Composants (pilotes de moteurs, PCA9685).
    s += rp(322, 215, 368, 290, 'fill="#222"') + rp(378, 215, 424, 290, 'fill="#222"') + rp(318, 370, 380, 442, 'fill="#222"');
    // Rangees de broches : couleur du plastique comme sur la carte, et nom de chaque colonne imprime.
    const rangee = (colonnes, y) => [['G', '#2b2b2b'], ['V', '#b8352b'], ['S', '#5cae3e']].map(([c, coul]) =>
        rp(colonnes[c] - 10, y - 10, colonnes[c] + 10, y + 10, `fill="${coul}" stroke="#111"`) +
        rp(colonnes[c] - 3, y - 3, colonnes[c] + 3, y + 3, 'fill="#c9a54a"')).join('');
    Object.entries(GPIO_DFR).forEach(([nom, y]) => { s += rangee(COLONNES_GPIO, y) + ser(175, y + 4, nom, 'end'); });
    for (let n = 1; n <= 8; n++) s += rangee(COLONNES_SERVO, yRangDfr(n - 1)) + ser(285, yRangDfr(n - 1) + 4, 'S' + n, 'end');
    [['GND', 110], ['3V3', 133], ['P', 157], ['GND', 220], ['VIN', 245], ['S', 268]].forEach(([t, x]) => { s += ser(x, 462, t); });
    // Connecteur IIC : deux colonnes de 4 broches, D C G V.
    for (const [b, y] of Object.entries(I2C_DFR)) {
        for (const x of [110, 133]) s += rp(x - 10, y - 10, x + 10, y + 10, 'fill="#8d9399" stroke="#111"') + rp(x - 3, y - 3, x + 3, y + 3, 'fill="#c9a54a"');
        s += ser(152, y + 4, b, 'end');
    }
    s += ser(122, 110, 'IIC');
    return s;
}

/** Dessin d'un module, centre sur (cx, cy), connecteur tourne vers la carte. */
function dessinModule(m, cx, cy) {
    const geo = geometrie(m);
    if (geo) {
        const dessin = geo.def.dessin(geo.cx - geo.w0 / 2, geo.cy - geo.h0 / 2, m);
        return geo.rot ? `<g transform="rotate(${geo.rot} ${geo.cx} ${geo.cy})">${dessin}</g>` : dessin;
    }
    const dessins = window.dessinsMoteursDfr;
    const imbrique = (svg, l, h) => svg.replace('<svg ', `<svg x="${cx - l / 2}" y="${cy - h / 2}" width="${l}" height="${h}" `);
    if (m.picto === 'moteur' && dessins) return imbrique(dessins.tt, 150, 80);
    if (m.picto === 'pas' && dessins) return imbrique(dessins.pas[m.modele] || dessins.pas['28BYJ-48'], 80, 80);
    if (m.picto === 'servo') {
        // Palonnier vers le haut a 90 degres, comme dans « Peripheriques » ; il tourne autour de l'axe (cx + 18, cy).
        return r(cx - 40, cy - 18, 80, 36, 'rx="4" fill="#2c64c4" stroke="#173f85"') + r(cx - 52, cy - 6, 104, 12, 'rx="3" fill="#2c64c4"') +
               cercle(cx + 18, cy, 12, 'fill="#e6e6e6"') +
               `<g class="mv-palonnier" style="transform-origin: ${cx + 18}px ${cy}px">` +
               r(cx + 14, cy - 34, 8, 40, 'rx="4" fill="#f5f5f5" stroke="#bbb"') + '</g>' + cercle(cx + 18, cy, 4, 'fill="#bbb"');
    }
    const l = largeurPcb(m), h = 74;
    let s = r(cx - l / 2, cy - h / 2, l, h, 'rx="6" fill="#3d8f4a" stroke="#2a6534"');
    s += cercle(cx - l / 2 + 9, cy - h / 2 + 9, 4, 'fill="#c9a54a"') + cercle(cx + l / 2 - 9, cy + h / 2 - 9, 4, 'fill="#c9a54a"');
    // Connecteur Grove blanc, sur le bord tourne vers la carte.
    if (m.cote === 'g') s += r(cx + l / 2 - 2, cy - 14, 10, 28, 'rx="2" fill="#f2f2f2" stroke="#b9b9b9"');
    else if (m.cote === 'd') s += r(cx - l / 2 - 8, cy - 14, 10, 28, 'rx="2" fill="#f2f2f2" stroke="#b9b9b9"');
    else s += r(cx - 14, cy - h / 2 - 8, 28, 10, 'rx="2" fill="#f2f2f2" stroke="#b9b9b9"');
    switch (m.picto) {
        case 'led': s += cercle(cx, cy, 24, 'class="mv-halo" fill="#ff3b30" opacity="0"') +
                         cercle(cx, cy, 15, 'class="mv-led" fill="#8e2f2c" stroke="#5c1715"') + cercle(cx - 5, cy - 5, 4, 'fill="#ff9d9a" opacity="0.6"'); break;
        case 'bouton': s += r(cx - 18, cy - 18, 36, 36, 'rx="3" fill="#202020"') + cercle(cx, cy, 11, 'class="mv-capuchon" fill="#3a3a3a" stroke="#555"'); break;
        // Repere du potentiometre : il tourne autour de son centre, de -150 a +150 degres (comme dans « Peripheriques »).
        case 'pot': s += r(cx - 18, cy - 18, 36, 36, 'rx="3" fill="#2c64c4"') + cercle(cx, cy, 12, 'fill="#e6e6e6"') +
                         `<g class="mv-pot" style="transform-origin: ${cx}px ${cy}px">` + r(cx - 2, cy - 12, 4, 10, 'fill="#555"') + '</g>'; break;
        // Manette du joystick : deplacee selon X et Y (512 au centre).
        case 'joystick': s += cercle(cx, cy, 24, 'fill="#262626"') + cercle(cx, cy, 13, 'class="mv-manette" fill="#4a4a4a" stroke="#777"'); break;
        case 'lumiere': s += cercle(cx, cy, 13, 'fill="#e8913a" stroke="#a65d18"') + `<path d="M${cx - 8} ${cy - 3} h4 v6 h4 v-6 h4 v6 h4" stroke="#7a3f0a" stroke-width="2" fill="none"/>`; break;
        case 'pir': s += cercle(cx, cy, 24, 'class="mv-pir" fill="#f4f4f4" stroke="#c9c9c9"') + cercle(cx, cy, 14, 'fill="none" stroke="#dcdcdc"'); break;
        case 'buzzer': s += cercle(cx, cy, 20, 'fill="#1e1e1e"') + cercle(cx, cy, 4, 'fill="#555"') +
                            cercle(cx, cy, 28, 'class="mv-onde" fill="none" stroke="#f2c230" stroke-width="3"'); break;
        case 'relais': s += r(cx - 24, cy - 20, 48, 40, 'rx="3" fill="#2c64c4"') + texte(cx, cy + 5, 'RELAIS', 'class="montage-puce" text-anchor="middle"') +
                            cercle(cx + 30, cy + 24, 5, 'class="mv-voyant" fill="#5a1d1d" stroke="#222"'); break;
        case 'dht': s += r(cx - 18, cy - 24, 36, 48, 'rx="3" fill="#7fb3e6"') + [0, 1, 2, 3].map(i => r(cx - 12, cy - 18 + i * 10, 24, 4, 'fill="#4a7fb8"')).join(''); break;
        case 'ultrason': s += cercle(cx - 32, cy, 24, 'fill="#c9cfd6" stroke="#7f8790"') + cercle(cx + 32, cy, 24, 'fill="#c9cfd6" stroke="#7f8790"') +
                              cercle(cx - 32, cy, 15, 'fill="#3a3f45"') + cercle(cx + 32, cy, 15, 'fill="#3a3f45"'); break;
        case 'ruban': s += r(cx - 66, cy - 10, 132, 20, 'fill="#151515"') +
                           [0, 1, 2, 3, 4].map(i => r(cx - 58 + i * 25, cy - 6, 16, 12, `class="mv-ruban" data-i="${i}" fill="#2a2a2a" stroke="#444"`)).join(''); break;
        // Couleurs du module (comme dans « Peripheriques ») : LED 1 rouge, 2 orange, 3 a 10 vertes ; eteintes, en sombre.
        case 'barre': s += r(cx - 64, cy - 14, 128, 28, 'fill="#151515"') + Array.from({ length: 10 }, (_, i) =>
                           r(cx - 58 + i * 12, cy - 9, 8, 18, `class="mv-barre" data-i="${i}" data-couleur="${i === 0 ? '#ff3b30' : i === 1 ? '#ff9500' : '#34c759'}" fill="#2e3a2e"`)).join(''); break;
        case '4d': s += r(cx - 58, cy - 22, 116, 44, 'fill="#111"') + texte(cx, cy + 12, '88:88', 'class="montage-segments mv-4d-repos" text-anchor="middle"') +
                        `<foreignObject class="mv-4d" x="${cx - 56}" y="${cy - 20}" width="112" height="40"></foreignObject>`; break;
        // Ecran : image de l'OLED de « Peripheriques » (128 x 64, meme police que le pilote).
        case 'oled': s += r(cx - 50, cy - 26, 100, 52, 'fill="#05070a" stroke="#333"') +
                          `<image class="mv-oled" x="${cx - 48}" y="${cy - 24}" width="96" height="48" preserveAspectRatio="none"/>`; break;
        // Deux lignes de 16 caracteres, recopiees de l'ecran de « Peripheriques ».
        case 'lcd': s += r(cx - 64, cy - 22, 128, 44, 'class="mv-lcd-fond" fill="#2747c9" stroke="#13246b"') +
                         [0, 1].map(l => texte(cx - 58, cy - 4 + l * 16, '', `class="mv-lcd montage-lcd" data-l="${l}" fill="#f2f6fb"`)).join(''); break;
        case 'lcdrgb': s += r(cx - 64, cy - 22, 128, 44, 'class="mv-lcd-fond" fill="#3c8de0" stroke="#1d5aa0"') +
                            [0, 1].map(l => texte(cx - 58, cy - 4 + l * 16, '', `class="mv-lcd montage-lcd" data-l="${l}" fill="#f2f6fb"`)).join(''); break;
        case 'rtc': s += cercle(cx + 14, cy, 20, 'fill="#c0c4c8" stroke="#6b7075"') + r(cx - 28, cy - 10, 20, 20, 'fill="#111"'); break;
        case 'couleur': s += r(cx - 22, cy - 22, 44, 44, 'rx="4" class="mv-couleur" fill="none" stroke-width="4"') + r(cx - 12, cy - 12, 24, 24, 'fill="#111"') + cercle(cx - 24, cy, 6, 'fill="#fffbe6" stroke="#ccc"') + cercle(cx + 24, cy, 6, 'fill="#fffbe6" stroke="#ccc"'); break;
        case 'pca': s += r(cx - 14, cy - 14, 28, 28, 'fill="#111"') + Array.from({ length: 8 }, (_, i) => r(cx - 66 + i * 8, cy + 20, 6, 10, 'fill="#c9a54a"')).join(''); break;
        case 'pilote': s += r(cx - 16, cy - 16, 32, 32, 'fill="#111"') + r(cx - 30, cy - 30, 14, 14, 'fill="#2f9e5b"') + r(cx + 16, cy - 30, 14, 14, 'fill="#2f9e5b"'); break;
        default: s += r(cx - 14, cy - 14, 28, 28, 'fill="#111"') + r(cx - 10, cy - 10, 20, 20, 'fill="none" stroke="#444"');
    }
    return s;
}

/** Cable du ruban (fixe au-dessus de la carte) : il sort du port, contourne la carte par la gauche puis monte jusqu'a
    la prise du ruban (un fil par contact, ecartes pour ne pas se croiser). */
function routeRuban(f, i, p, basCarte) {
    const ecart = i * 7, xMontee = p.x;
    if (f.d[1] > 0) return Object.assign({}, f, { passage: [[f.x, basCarte + 24 + ecart], [xMontee, basCarte + 24 + ecart]] });
    if (f.d[0] < 0) return Object.assign({}, f, { passage: [[Math.min(f.x - 20 - ecart, xMontee + 40), f.y], [xMontee, f.y]] });
    // Port tourne vers la droite : on monte par la droite, puis on passe au-dessus de la carte
    const xDroite = LARGEUR - 200 + ecart, yHaut = CARTE.y - 20 + ecart;
    return Object.assign({}, f, { passage: [[xDroite, f.y], [xDroite, yHaut], [xMontee + 30, yHaut]] });
}

function dessinFil(f, fin, o) {
    // Courbe de Bezier : chaque extremite part dans sa direction de sortie, decalee le long du connecteur.
    // Un fil peut d'abord suivre des points de passage (le 3V3 de la Grove contourne la carte par le bas).
    const e = { x: fin.x - fin.d[1] * o, y: fin.y + fin.d[0] * o };
    // Coins des points de passage arrondis (rayon jusqu'a 22) : pas d'angle droit sur le trajet.
    let d = `M${f.x} ${f.y}`, depart = f, dir = f.d;
    const pts = f.passage || [];
    pts.forEach(([px, py], k) => {
        const n = Math.hypot(px - depart.x, py - depart.y) || 1;
        dir = [(px - depart.x) / n, (py - depart.y) / n];
        const suiv = pts[k + 1];
        if (suiv) {
            const n2 = Math.hypot(suiv[0] - px, suiv[1] - py) || 1, rayon = Math.min(22, n / 2, n2 / 2);
            d += ` L${px - dir[0] * rayon} ${py - dir[1] * rayon} Q${px} ${py} ${px + (suiv[0] - px) / n2 * rayon} ${py + (suiv[1] - py) / n2 * rayon}`;
        } else d += ` L${px} ${py}`;
        depart = { x: px, y: py };
    });
    // Tangentes moderees : courbes douces, sans « marche » en S entre la prise et le module.
    const long = Math.max(30, Math.hypot(e.x - depart.x, e.y - depart.y) * 0.33);
    d += ` C${depart.x + dir[0] * long} ${depart.y + dir[1] * long} ${e.x - fin.d[0] * long} ${e.y - fin.d[1] * long} ${e.x} ${e.y}`;
    let s = `<path d="${d}" class="montage-fil-ombre" stroke-linejoin="round"/><path d="${d}" stroke="${f.c}" class="montage-fil" stroke-linejoin="round"/>`;
    if (f.pince) {
        // Pince crocodile serree sur la pastille, dans l'axe du fil.
        const a = Math.atan2(f.d[1], f.d[0]) * 180 / Math.PI;
        s += `<g transform="translate(${f.x} ${f.y}) rotate(${a})">` + r(-4, -6, 30, 12, `rx="5" fill="${f.c}" stroke="#555"`) +
             r(-8, -4, 10, 8, 'rx="2" fill="#c0c4c8" stroke="#6b7075"') + '</g>';
    }
    return s;
}

function dessinerScene(etat) {
    if (etat.carte === 'aucune') return { bas: '', hauteur: CARTE.y + CARTE.h + 20 };   // micro:bit seule
    const basCarte = etat.carte === 'dfr' ? DFR_BAS + 18 : etat.carte === 'motorbit' ? MB_BAS : etat.carte === 'bitmaker' ? BM_BAS : GROVE_PCB.y + GROVE_PCB.l;
    let hauteur = disposer(etat.modules, basCarte);
    for (const m of etat.modules) m.couleur = COULEURS_MODULES[m.id] || 'rouge';
    // Modules deplaces par l'eleve (PLACES) : a leur place ; le cable arrive par le cote tourne vers la carte.
    for (const m of etat.modules) {
        const p = !m.surCarte && !m.fixe && PLACES[m.id];
        if (!p) continue;
        [m.x, m.y] = p;
        m.cote = m.y + MODULE.h / 2 > basCarte ? 'b' : m.x + MODULE.l / 2 < LARGEUR / 2 ? 'g' : 'd';
        hauteur = Math.max(hauteur, m.y + hauteurModule(m) + 96);
    }
    relierHubs(etat.modules);
    // Effets communs des modules dessines (halo des LED), en tete de la scene
    let bas = defsModules() + { dfr: dessinCarteDfr, motorbit: dessinCarteMotorbit, bitmaker: dessinCarteBitmaker, grove: dessinCarteGrove }[etat.carte]();
    // Ruban sur les LED de la BitMaker : legende sous la carte, a la place du module et de son cable.
    const surCarte = etat.modules.find(m => m.surCarte);
    if (surCarte) hauteur = Math.max(hauteur, basCarte + 50);
    if (surCarte) bas += texte(LARGEUR / 2, basCarte + 30, echap(surCarte.nom + ' · ' + surCarte.etiquette +
                               (surCarte.note ? ' · ' + surCarte.note : '')), 'class="montage-note" text-anchor="middle"');
    let filsDessus = '', points = '';   // points des broches du hub : par-dessus les fils
    for (const m of etat.modules) {
        if (m.x === undefined) continue;
        const fin = arrivee(m), n = m.fils.length;
        m.routeBas = false;
        const geo = geometrie(m), contacts = geo && geo.def.connecteur.contacts;
        // Hub I2C : le cable de la carte entre dans J1 et chaque fil finit sur sa broche, marquee d'un point ; dessine
        // par-dessus le hub (sinon le boitier de la prise le cacherait).
        if (m.hub && geo && n === 4) {
            const broches = brochesHub(geo, 1);
            m.fils.forEach((f, i) => { filsDessus += dessinFil(f, { x: broches[i].x, y: broches[i].y, d: fin.d }, 0); points += pointBroche(broches[i], f.c); });
            continue;
        }
        // Modules branches sur un hub : leurs fils partent des broches de J2 a J4, par-dessus le hub, avec un point.
        const depuisHub = m.fils.length && m.fils[0].surHub;
        if (depuisHub) for (const f of m.fils) points += pointBroche(f, f.c);
        // Module dessine (modele R4) : chaque fil arrive sur son contact de la prise (SIG, NC, VCC, GND), d'apres la serigraphie.
        if (contacts && contacts.length === n) {
            const conn = geo.def.connecteur, vertical = conn.sens === 'haut' || conn.sens === 'bas';
            m.fils.forEach((f, iFil) => {
                // Contact choisi par la couleur du fil (jaune SIG1, blanc SIG2, rouge VCC, noir GND) : l'ordre des fils
                // depend de la carte (inverse sur la BitMaker, ou le noir arrivait sur SCL ; nov. 2026).
                const iCouleur = GROVE.indexOf(f.c), i = iCouleur >= 0 ? iCouleur : iFil;
                const p = vertical ? geo.point(contacts[i], conn.y) : geo.point(conn.x, contacts[i]);
                // Prise en bas a gauche du circuit, ouverte vers la gauche (ecrans LCD) : le cable contourne le module
                // par le cote le plus court (demande de l'utilisateur, nov. 2026 ; avant, toujours par le haut, meme
                // quand le cable arrivait a hauteur du module) : par le haut, ou sous le module puis par son coin bas
                // gauche (le texte du module descend alors sous les fils). Fils ranges pour ne pas se croiser au coin.
                // Le cable sort d'abord de sa prise dans le sens ou elle s'ouvre (vers le bas sous le shield Grove,
                // sur le cote pour les prises laterales), sans traverser la carte ni les prises voisines (nov. 2026).
                const haut = geo.cy - geo.h0 / 2, basM = geo.cy + geo.h0 / 2;
                const yDessus = haut - 28, yDessous = basM + 12, xGauche = geo.cx - geo.w0 / 2 - 22;
                const [sx, sy] = f.d, surCarte = !depuisHub;
                const sortie = { x: f.x + sx * 22, y: f.y + sy * 22 };
                if (surCarte && sy > 0) sortie.y = Math.max(sortie.y, basCarte + 14);
                if (surCarte && sy < 0) sortie.y = Math.min(sortie.y, CARTE.y - 14);
                // Rangee du passage (au-dessus ou au-dessous du module) : dans le prolongement de la sortie, et hors de
                // la carte si la prise s'ouvre a l'oppose du module ; la plus courte des rangees possibles.
                const opposee = sx !== 0 && (xGauche - sortie.x) * sx < 0;
                const permise = y => sy > 0 ? y >= sortie.y : sy < 0 ? y <= sortie.y
                    : !(surCarte && opposee) || y < CARTE.y - 14 || y > basCarte + 14;
                const cout = y => Math.abs(y - sortie.y) + Math.abs(p.y - y);
                const rangees = [yDessus, yDessous].filter(permise).sort((a, b) => cout(a) - cout(b));
                const rangee = rangees.length ? rangees[0] : sy !== 0 ? sortie.y : basCarte + 28;
                const parBas = rangee > p.y;
                if (parBas && rangee >= yDessous) m.routeBas = true;
                // Fils ranges pour ne pas se croiser : kd a l'arrivee (ordre des contacts de l'ecran), ks a la sortie
                // (ordre dans la prise de la carte). Les deux ordres different souvent : l'echange se fait une seule
                // fois, en biais, au milieu du trajet horizontal, comme un cable legerement vrille (nov. 2026).
                const kd = parBas ? i : n - 1 - i, v = parBas ? 1 : -1;
                const rang = cle => { const tri = m.fils.map((g, j) => j).sort((a, b) => cle(m.fils[b]) - cle(m.fils[a])); return tri.indexOf(iFil); };
                const xc = xGauche - kd * 7, yArrivee = rangee + v * kd * 6;
                const passage = [];
                let xDebut;
                if (sy !== 0) {
                    // Sortie verticale : le fil le plus proche du cote ou part le cable tourne le premier.
                    const ks = rang(g => g.x * Math.sign(xc - f.x));
                    // Rangees de rangee a rangee + v * 18 ; le premier a tourner prend celle la plus proche de la prise.
                    const yDepart = rangee + v * (Math.sign(sy) === v ? ks : n - 1 - ks) * 6;
                    passage.push([f.x, yDepart]);
                    xDebut = f.x;
                    if (yDepart !== yArrivee && Math.abs(xc - xDebut) > 90) {
                        const xm = (xDebut + xc) / 2, h = Math.sign(xc - xDebut), demi = Math.min(45, Math.abs(xc - xDebut) / 4);
                        passage.push([xm - h * demi, yDepart], [xm + h * demi, yArrivee]);
                    } else if (yDepart !== yArrivee) passage.push([xc + 30, yDepart], [xc + 30, yArrivee]);
                } else {
                    // Sortie laterale : le fil le plus proche du cote ou monte (ou descend) le cable tourne le premier,
                    // puis, au coin suivant, celui qui est le plus loin de la carte.
                    // t : sens dans lequel le cable monte ou descend vers sa rangee (pas forcement v).
                    const t = Math.sign(rangee - f.y) || v;
                    const ks1 = rang(g => g.y * t), xVoie = sortie.x + sx * ks1 * 6;
                    const memeSens = Math.sign(xc - xVoie) === sx;
                    const ordre = memeSens ? n - 1 - ks1 : ks1;   // ordre de passage au coin suivant
                    const yDepart = rangee + v * (t === v ? ordre : n - 1 - ordre) * 6;
                    passage.push([xVoie, f.y], [xVoie, yDepart]);
                    xDebut = sortie.x;
                    if (yDepart !== yArrivee && Math.abs(xc - xDebut) > 90) {
                        const xm = (xDebut + xc) / 2, h = Math.sign(xc - xDebut), demi = Math.min(45, Math.abs(xc - xDebut) / 4);
                        passage.push([xm - h * demi, yDepart], [xm + h * demi, yArrivee]);
                    } else if (yDepart !== yArrivee) passage.push([xc + 30, yDepart], [xc + 30, yArrivee]);
                }
                const yPassage = yArrivee;
                passage.push([xc, yPassage], [xc, p.y], [xc + 14, p.y]);
                const contour = geo.def.filsDessus && Object.assign({}, f, { passage });
                const fil = dessinFil(m.fixe ? routeRuban(f, iFil, p, basCarte) : contour || f, { x: p.x, y: p.y, d: fin.d }, 0);
                if (geo.def.filsDessus || depuisHub) filsDessus += fil; else bas += fil;
            });
            continue;
        }
        m.fils.forEach((f, i) => { const fil = dessinFil(f, fin, (i - (n - 1) / 2) * 6); if (depuisHub) filsDessus += fil; else bas += fil; });
    }
    for (const m of etat.modules) {
        if (m.x === undefined) continue;
        const hMod = hauteurModule(m), cx = m.x + MODULE.l / 2, cy = m.y + MODULE.h / 2;
        const vivant = VIVANT[m.nom] || m.picto;
        // Bouton poussoir et joystick : on appuie directement dessus (meme effet que dans « Peripheriques »).
        // Detecteur PIR dessine : un clic sur la lentille bascule le mouvement (comme le modele).
        const pirDessine = vivant === 'pir' && DESSINS_MODULES[m.picto];
        const appui = vivant === 'joystick' && DESSINS_MODULES[m.picto]
            ? ` role="button" tabindex="0" aria-label="${echap(m.nom)} ${echap(m.etiquette)} : glisser ou flèches pour pousser le manche, Espace pour appuyer"`
            : vivant === 'bouton' || vivant === 'joystick'
            ? ` role="button" tabindex="0" aria-label="${echap(m.nom)} ${echap(m.etiquette)} : maintenir pour appuyer"`
            : pirDessine ? ` role="button" tabindex="0" aria-label="${echap(m.nom)} ${echap(m.etiquette)} : cliquer pour simuler un mouvement (un autre clic l'arrête)"` : '';
        // Potentiometre dessine : bouton noir tourne a la souris, fleches du clavier (role slider)
        const reglable = vivant === 'pot' && DESSINS_MODULES[m.picto]
            ? ` role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="1023" aria-label="${echap(m.nom)} ${echap(m.etiquette)} : tourner le bouton (flèches du clavier)"` : '';
        // Ruban fixe au-dessus de la carte : ses libelles au-dessus de lui (sous lui, il y a la carte)
        // Cable passe sous le module (ecrans LCD) : le texte descend sous les fils.
        const yLib = m.fixe ? m.y - 92 : m.y + hMod + (m.routeBas ? 34 : 0);
        if (m.routeBas) hauteur = Math.max(hauteur, yLib + 96);
        // Hub I2C : ses libelles a droite, les cables de ses modules partent par le bas
        const geoHub = m.hub && geometrie(m);
        const xLib = geoHub ? geoHub.cx + (geoHub.rot % 180 ? geoHub.h0 : geoHub.w0) / 2 + 14 : cx;
        const ancreLib = geoHub ? 'start' : 'middle', yLibH = geoHub ? geoHub.cy - 30 : yLib;
        bas += `<g class="montage-module${appui ? ' montage-appui' : ''}" data-id="${echap(m.id || '')}" data-vivant="${vivant}" data-cle="${echap(m.cle || '')}" data-zone="${m.zone || ''}"${m.fixe ? ' data-fixe="1"' : ''}${appui}${reglable}>${dessinModule(m, cx, cy)}` +
               texte(xLib, yLibH + 22, echap(m.nom), `class="montage-libelle" text-anchor="${ancreLib}"`) +
               texte(xLib, yLibH + 42, echap(m.etiquette), `class="montage-note" text-anchor="${ancreLib}"`);
        if (m.conflit) {
            const g = geometrie(m), tourne = g && g.rot % 180;
            const l = g ? (tourne ? g.h0 : g.w0) : MODULE.l, h = g ? (tourne ? g.w0 : g.h0) : hMod;
            const x0 = g ? g.cx - l / 2 : m.x, y0 = g ? g.cy - h / 2 : m.y;
            bas += r(x0 - 8, y0 - 8, l + 16, h + 16, 'rx="10" class="montage-conflit"');
        }
        bas += texte(cx, yLib + 62, '', 'class="montage-valeur" text-anchor="middle"');
        const note = [m.alerte, m.note].filter(Boolean).join(' · ');
        if (note) bas += texte(cx, yLib + 82, echap(note), `class="montage-note${m.alerte ? ' alerte' : ''}${m.conflit ? ' conflit' : ''}" text-anchor="middle"`);
        bas += '</g>';
    }
    bas += filsDessus + points;
    return { bas, hauteur };
}

// ---------- Panneau ----------
const panneau = $('montage-panneau'), scene = $('montage-scene'), bouton = $('btn-montage');
const svgBas = $('montage-svg-bas'), svgHaut = $('montage-svg-haut'), place = $('montage-carte');
const titre = $('montage-sous-titre'), resume = $('montage-resume'), fermer = $('montage-fermer');
// Barre de la simulation (index.html, nov. 2026) : menu « Carte d'extension » et bouton « Agrandir » / « Fermer ».
const choix = $('sim-carte'), choixAuto = $('montage-choix-auto'), nomCarteMenu = $('sim-carte-nom');
const colonne = $('montage-colonne'), zoneColonne = $('montage-colonne-zone');
const boutonAgrandir = $('sim-agrandir');
const NOMS_CARTES = { grove: 'Grove Shield v2.0', bitmaker: 'BitMaker V2', motorbit: 'Motor:bit V1.6', dfr: 'DFR0548' };
const ICONE_AGRANDIR = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" '
    + 'stroke-linejoin="round" aria-hidden="true"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>'
    + '<line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';
const ICONE_FERMER = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" '
    + 'aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';
const console_ = $('simulateur-console'), conteneur = $('simulator-container');
const zoneGrand = panneau ? panneau.querySelector('.montage-zone') : null;
const enteteGrand = panneau ? panneau.querySelector('.montage-entete') : null;
// mode : 'carte' (carte seule), 'colonne' (montage dans la colonne) ou 'grand' (par-dessus les blocs).
let mode = 'carte', grandDemande = false, utile = false, hauteurScene = 600, emplacement = null, attente = null;

// Carte Grove ou BitMaker, memorisee dans le navigateur (Grove par defaut, ou si le stockage est indisponible).
const CLE_CARTE = 'montageCarte';
function choixCarte() {
    try { const c = localStorage.getItem(CLE_CARTE); return c === 'bitmaker' || c === 'motorbit' ? c : 'grove'; } catch (erreur) { return 'grove'; }
}

// ---------- Vue de la simulation : un espace de travail, comme la zone des blocs ----------
// Comme la version Arduino R4 (VUE, zoomer, recentrerVue de r4-board-svg.js, nov. 2026) : ECHELLE FIXE (elargir la
// colonne donne de la place autour, la carte ne grossit pas) ; molette = zoom autour du pointeur (x 1,2 par cran, de
// 0,3 a 3 fois la taille normale) ; glisser le fond = se deplacer ; boutons Recentrer / + / − en bas a droite. Tant que
// l'eleve n'a ni zoome ni deplace la vue, elle se recentre seule (nouveau module, autre zone, autre taille).
// (VUE.cx, VUE.cy) = point de la scene (en unites, 1000 de large) affiche au centre du cadre ; VUE.s = pixels par unite.
const ECHELLE_NORMALE = 0.75;   // la micro:bit (280 unites) a la taille de l'ancienne carte seule (210 px)
const ZOOM_MINI = 0.3, ZOOM_MAXI = 3, PAS_ZOOM = 1.2;
const VUE = { s: ECHELLE_NORMALE, cx: LARGEUR / 2, cy: 300, touchee: false };
function cadreVue() { return scene.parentElement; }

function appliquerVue() {
    const cadre = cadreVue();
    if (!cadre) return;
    const l = cadre.clientWidth, h = cadre.clientHeight;
    scene.style.transform = `translate(${l / 2 - VUE.cx * VUE.s}px, ${h / 2 - VUE.cy * VUE.s}px) scale(${VUE.s})`;
}

/** Zoome d'un facteur f autour du point (px, py) du cadre, en pixels (le point sous le pointeur y reste). */
function zoomer(f, px, py) {
    const cadre = cadreVue();
    if (!cadre) return;
    if (px === undefined) { px = cadre.clientWidth / 2; py = cadre.clientHeight / 2; }
    const s0 = VUE.s, s1 = Math.max(ECHELLE_NORMALE * ZOOM_MINI, Math.min(ECHELLE_NORMALE * ZOOM_MAXI, s0 * f));
    const dx = px - cadre.clientWidth / 2, dy = py - cadre.clientHeight / 2;
    VUE.cx += dx / s0 - dx / s1;
    VUE.cy += dy / s0 - dy / s1;
    VUE.s = s1;
    VUE.touchee = true;
    appliquerVue();
}

/** Bornes du contenu de la scene (carte d'extension, modules, cables, etiquettes, micro:bit), en unites. */
function bornesContenu() {
    let x0 = CARTE.x, y0 = CARTE.y, x1 = CARTE.x + CARTE.l, y1 = CARTE.y + CARTE.h;
    try {
        const b = svgBas.getBBox();
        if (b && b.width) { x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height); }
    } catch (erreur) { /* scene pas encore affichee */ }
    return { x0, y0, x1, y1 };
}

/** Recentrer : toute la simulation dans le cadre, sans depasser la taille normale. */
function recentrerVue() {
    const cadre = cadreVue();
    // Cadre pas encore affiche (taille nulle) : on ne calcule rien, sinon le zoom tomberait au minimum
    if (!cadre || cadre.clientWidth < 50 || cadre.clientHeight < 50) return;
    const b = bornesContenu(), marge = 20;
    const s = Math.min((cadre.clientWidth - 2 * marge) / (b.x1 - b.x0), (cadre.clientHeight - 2 * marge) / (b.y1 - b.y0));
    VUE.s = Math.max(ECHELLE_NORMALE * ZOOM_MINI, Math.min(ECHELLE_NORMALE, s));
    VUE.cx = (b.x0 + b.x1) / 2;
    VUE.cy = (b.y0 + b.y1) / 2;
    VUE.touchee = false;
    appliquerVue();
}

// Taille du cadre changee (colonne elargie, fenetre, vue agrandie) : meme echelle, recentrage si la vue n'a pas ete touchee.
function cadreRedimensionne() { if (!VUE.touchee) recentrerVue(); else appliquerVue(); }

const ICONES_VUE = {
    recentrer: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">'
        + '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>',
    plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    moins: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>',
};
function installerVue() {
    const cadre = cadreVue();
    // Boutons Recentrer / + / − : dans le cadre, ils le suivent (colonne ou vue agrandie).
    const boutons = document.createElement('div');
    boutons.className = 'vue-boutons';
    [['recentrer', 'Recentrer la simulation', recentrerVue], ['plus', 'Zoomer', () => zoomer(PAS_ZOOM)],
     ['moins', 'Dézoomer', () => zoomer(1 / PAS_ZOOM)]].forEach(([nom, titreBouton, action]) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.title = titreBouton;
        b.setAttribute('aria-label', titreBouton);
        b.innerHTML = ICONES_VUE[nom];
        b.addEventListener('click', action);
        boutons.appendChild(b);
    });
    cadre.appendChild(boutons);
    // Molette = zoom (pas le defilement de la colonne), autour du pointeur.
    cadre.addEventListener('wheel', e => {
        if (!e.deltaY) return;
        e.preventDefault();
        const r = cadre.getBoundingClientRect();
        zoomer(e.deltaY < 0 ? PAS_ZOOM : 1 / PAS_ZOOM, e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });
    // Glisser le fond = se deplacer. La carte (boutons, logo, broches), les modules qu'on appuie et les boutons gardent
    // leur propre geste.
    cadre.addEventListener('pointerdown', e => {
        if (e.button !== 0 || e.target.closest('#microbit-board, .montage-module, .vue-boutons, button, input, select')) return;
        const x0 = e.clientX, y0 = e.clientY, cx0 = VUE.cx, cy0 = VUE.cy;
        let bouge = false;
        const bouger = ev => {
            if (!bouge && Math.abs(ev.clientX - x0) + Math.abs(ev.clientY - y0) < 4) return;   // simple clic tremble
            if (!bouge) { bouge = true; cadre.classList.add('vue-deplacee'); }
            VUE.cx = cx0 - (ev.clientX - x0) / VUE.s;
            VUE.cy = cy0 - (ev.clientY - y0) / VUE.s;
            VUE.touchee = true;
            appliquerVue();
        };
        const finir = () => {
            cadre.classList.remove('vue-deplacee');
            cadre.removeEventListener('pointermove', bouger);
            cadre.removeEventListener('pointerup', finir);
            cadre.removeEventListener('pointercancel', finir);
        };
        cadre.setPointerCapture(e.pointerId);
        cadre.addEventListener('pointermove', bouger);
        cadre.addEventListener('pointerup', finir);
        cadre.addEventListener('pointercancel', finir);
    });
    new ResizeObserver(cadreRedimensionne).observe(cadre);
}

function redessiner() {
    const etat = lireMontage();
    utile = etat.utile;
    appliquerMode();
    if (mode === 'carte') return;
    dessinerSvg(etat);
    titre.textContent = { dfr: 'Carte moteurs DFRobot DFR0548', motorbit: 'Carte moteurs ELECFREAKS Motor:bit V1.6',
                          bitmaker: 'Carte BitMaker V2 (Seeed)', grove: 'Carte Grove Shield for micro:bit v2.0 (Seeed)',
                          aucune: 'Carte micro:bit V2' }[etat.carte];
    finirRedessin(etat);
}

/** Dessine la scene (carte d'extension, modules, cables) ; sert aussi pendant le deplacement d'un module. */
let dernierEtat = null;
// Tableau synchronise avec le montage : la pastille de « LED sur broche » prend la couleur de sa LED (rouge par defaut,
// comme le dessin). Regle de style par broche (data-broche, un.js) : elle survit a la reconstruction de la liste.
function couleursLedsTableau(etat) {
    let feuille = document.getElementById('couleurs-leds-tableau');
    if (!feuille) { feuille = document.createElement('style'); feuille.id = 'couleurs-leds-tableau'; document.head.appendChild(feuille); }
    feuille.textContent = etat.modules.filter(m => m.picto === 'led' && m.pins).map(m => {
        const c = COULEURS_LED[COULEURS_MODULES[m.id]] || COULEURS_LED.rouge;
        return `#grove-leds .led-broche[data-broche="${m.pins[0].replace('pin', '')}"] .led-pastille { ` +
               `background: radial-gradient(circle at 35% 30%, #ffffff, ${c.allumee} 45%, ${c.eteinte}); box-shadow: 0 0 7px ${c.halo}; }`;
    }).join('\n');
}

function dessinerSvg(etat) {
    dernierEtat = etat;
    couleursLedsTableau(etat);
    const { bas, hauteur } = dessinerScene(etat);
    hauteurScene = hauteur;
    scene.style.height = hauteur + 'px';
    for (const svg of [svgBas, svgHaut]) svg.setAttribute('viewBox', `0 0 ${LARGEUR} ${hauteur}`);
    svgBas.innerHTML = bas;
    const fente = { dfr: FENTE, motorbit: FENTE_MOTORBIT, bitmaker: FENTE_BITMAKER, grove: FENTE_GROVE }[etat.carte];
    if (!fente) {
        svgHaut.innerHTML = '';   // micro:bit seule : pas de connecteur
    } else {
        // Connecteur en plastique gris fonce sur la BitMaker et la Motor:bit, noir sur les deux autres cartes.
        const plastique = etat.carte === 'bitmaker' || etat.carte === 'motorbit' ? 'fill="#3a3c42" stroke="#55585f"' : 'fill="#0b0b0b" stroke="#2b2b2b"';
        svgHaut.innerHTML = r(fente.x, fente.y, fente.l, fente.h, `rx="4" ${plastique} stroke-width="2"`) +
                            r(fente.x + 6, fente.y + 4, fente.l - 12, 3, 'fill="#2a2a2a"') +
                            // Pattes cuivrees du connecteur, visibles sous le boitier sur la Grove v2.0.
                            (etat.carte === 'dfr' ? '' : Array.from({ length: 40 }, (_, i) =>
                                r(fente.x + 10 + i * 7.3, fente.y + fente.h - 2, 3, 7, 'fill="#b87333"')).join(''));
    }
}

/** Bandeau rouge en haut du montage : deux modules (ou plus) sur la meme broche. */
function majBandeauConflit(etat) {
    let bandeau = $('montage-alerte');
    if (!bandeau) {
        bandeau = document.createElement('p');
        bandeau.id = 'montage-alerte';
        bandeau.setAttribute('role', 'status');
    }
    if (bandeau.parentElement !== cadreVue()) cadreVue().appendChild(bandeau);
    const en = window.LANGUE === 'en';
    const lignes = (etat.conflits || []).map(c => {
        const noms = c.noms.map(trTexte), fin = noms.pop();
        return en ? noms.join(', ') + ' and ' + fin + ' are on the same pin ' + c.port
                  : noms.join(', ') + ' et ' + fin + ' sont sur la même broche ' + c.port;
    });
    bandeau.hidden = !lignes.length;
    bandeau.innerHTML = lignes.map(t => '<span>' + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' + echap(t) + '</span>').join('');
}

function finirRedessin(etat) {
    majBandeauConflit(etat);
    // Menu « Carte d'extension » : seulement avec un montage ; carte imposee par les blocs (DFR0548, Motor:bit) :
    // les autres choix sont grises et une phrase dit pourquoi.
    if (choix) {
        choix.hidden = !etat.utile;
        if (nomCarteMenu) nomCarteMenu.textContent = NOMS_CARTES[etat.carte] || 'Carte';
        choix.querySelectorAll('[data-carte]').forEach(b => {
            b.classList.toggle('choisi', b.dataset.carte === etat.carte);
            b.disabled = !!etat.imposee && b.dataset.carte !== etat.carte;
        });
    }
    if (choixAuto) {
        choixAuto.hidden = !etat.imposee;
        choixAuto.textContent = (etat.imposee === 'motorbit' ? 'Carte Motor:bit' : 'Carte DFR0548') + ' : choisie car le programme utilise ses blocs.';
    }
    resume.innerHTML = etat.modules.length
        // Chaque morceau traduit a part (en anglais) : la ligne entiere ne correspond a aucune cle du dictionnaire
        ? etat.modules.map(m => '<li>' + echap(trTexte(m.nom)) + (window.LANGUE === 'en' ? ': ' : ' : ') + echap(trTexte(m.etiquette)) + (m.note ? ' (' + echap(trTexte(m.note)) + ')' : '') +
                                (m.alerte ? ' — ' + echap(trTexte(m.alerte)) : '') + '</li>').join('')
        : '<li>Aucun module branché pour l\'instant.</li>';
    majReglages();
    rubanSurCarte = !!etat.modules.find(m => m.surCarte);
    copierLedsCarte();
    majVivant();
    // Echelle fixe : la vue garde son zoom et sa position ; tant que l'eleve n'y a pas touche, elle se recentre sur le
    // nouveau contenu (modules ajoutes ou retires).
    if (!VUE.touchee) recentrerVue(); else appliquerVue();
}

// LED de la BitMaker : elles reprennent les couleurs que « Peripheriques » donne au ruban (#grove-ruban, un.js),
// sans autre source d'etat : les deux affichages ne peuvent pas diverger.
let rubanSurCarte = false;
function copierLedsCarte() {
    const leds = document.querySelectorAll('#grove-ruban .grove-led');
    svgBas.querySelectorAll('.montage-pixel').forEach(pixel => {
        const led = rubanSurCarte && leds[Number(pixel.dataset.led)];
        const fond = led ? led.style.background : '';
        const allumee = fond && !/42, 42, 42|#2a2a2a/i.test(fond);
        pixel.style.fill = allumee ? fond : '';
        pixel.style.filter = allumee ? `drop-shadow(0 0 4px ${fond})` : '';
    });
}

// ---------- Actionneurs en direct ----------
// Chaque module dessine reprend l'etat que « Peripheriques » affiche (un.js), sans autre source : les deux
// affichages ne peuvent pas diverger. Lecture toutes les 200 ms tant que le montage est visible.
const $$ = (sel, base) => [...(base || document).querySelectorAll(sel)];
const apres = (texte, sep) => { const i = String(texte).lastIndexOf(sep); return i < 0 ? '' : texte.slice(i + sep.length).trim(); };
let derniereImageOled = '';

const LECTEURS = {
    moteur(g, cle) {
        const el = document.querySelector(`#${g.dataset.zone || 'dfr-moteurs'} [data-cle="${cle}"]`), roue = g.querySelector('.dfr-roue');
        if (roue) {
            const source = el && el.querySelector('.dfr-roue');
            roue.classList.toggle('tourne', !!source && source.classList.contains('tourne'));
            roue.classList.toggle('inverse', !!source && source.classList.contains('inverse'));
            if (source) roue.style.setProperty('--duree', source.style.getPropertyValue('--duree') || '1s');
        }
        return el ? apres(el.querySelector('.dfr-nom').textContent, '·') : '';
    },
    pas(g, cle) {
        const el = document.querySelector(`#dfr-pas [data-cle="${cle}"]`), axe = g.querySelector('.dfr-axe');
        if (!el) return '';
        const source = el.querySelector('.dfr-axe');
        if (axe && source) { axe.style.transition = source.style.transition; axe.style.transform = source.style.transform; }
        return apres(el.querySelector('.dfr-nom').textContent, '·');
    },
    servo(g, cle) {
        const el = $$('#grove-servos .servo').find(x => x.querySelector('.servo-nom').textContent === cle);
        const bras = g.querySelector('.mv-palonnier');
        if (!el) { if (bras) bras.classList.remove('mv-tourne', 'inverse'); else allumerServo(g, { angle: 90, tourne: false }); return ''; }
        const cadran = el.querySelector('.servo-cadran'), rotor = el.querySelector('.servo-rotor');
        const continu = cadran.classList.contains('continu');
        if (!bras) {
            // Dessin du modele : angle du cadran de « Peripheriques » (bras vers le haut a 90 degres : rotate(angle - 90))
            const a = /rotate\((-?[\d.]+)deg\)/.exec(rotor.style.transform || '');
            allumerServo(g, { angle: a ? Number(a[1]) + 90 : undefined, tourne: continu, inverse: cadran.classList.contains('inverse'),
                              duree: rotor.style.getPropertyValue('--duree') || '2s' });
            return el.querySelector('.servo-etat').textContent;
        }
        bras.classList.toggle('mv-tourne', continu);
        bras.classList.toggle('inverse', cadran.classList.contains('inverse'));
        bras.style.setProperty('--duree', rotor.style.getPropertyValue('--duree') || '2s');
        bras.style.transform = continu ? '' : rotor.style.transform;
        return el.querySelector('.servo-etat').textContent;
    },
    led(g, cle) {
        const el = $$('#grove-leds .led-broche').find(x => x.querySelector('.led-nom').textContent === cle);
        const eclat = el ? Number(el.querySelector('.led-pastille').style.opacity) || 0 : 0;
        allumerLed(g, eclat);
        if (!el) return '';
        const niveau = Number(el.querySelector('.led-val').textContent);
        return niveau === 0 ? 'éteinte' : niveau >= 1023 ? 'allumée' : 'luminosité ' + niveau;
    },
    ruban(g) {
        const leds = $$('#grove-ruban .grove-led');
        if (g.querySelector('.mv-ruban-led')) allumerRuban(g, leds.map(l => l.style.background && !/42, 42, 42/.test(l.style.background) ? l.style.background : ''));
        $$('.mv-ruban', g).forEach(c => {
            const fond = leds[Number(c.dataset.i)] ? leds[Number(c.dataset.i)].style.background : '';
            c.style.fill = fond && !/42, 42, 42/.test(fond) ? fond : '';
        });
        if (!leds.length) return '';
        const allumees = leds.filter(l => l.style.background && !/42, 42, 42/.test(l.style.background)).length;
        return allumees + ' LED allumée' + (allumees > 1 ? 's' : '') + ' sur ' + leds.length;
    },
    barre(g) {
        const leds = $$('#grove-barreled .barre-led');
        if (g.querySelector('.mv-segment')) allumerBarreLed(g, leds.map(l => l.classList.contains('on')));   // dessin du modele
        $$('.mv-barre', g).forEach(c => {
            const on = leds[Number(c.dataset.i)] && leds[Number(c.dataset.i)].classList.contains('on');
            c.setAttribute('fill', on ? c.dataset.couleur : '#2e3a2e');
        });
        return leds.length ? 'niveau ' + leds.filter(l => l.classList.contains('on')).length + ' / 10' : '';
    },
    buzzer(g, cle) {
        const ligne = $$('#grove-buzzer .grove-sortie').find(x => x.textContent.startsWith(cle + ' :'));
        const sonne = !!ligne && /sonne/.test(ligne.textContent);
        g.querySelector('.mv-onde').classList.toggle('actif', sonne);
        return ligne ? (sonne ? 'sonne' : 'silencieux') : '';
    },
    relais(g, cle) {
        // Le texte du dessin (« RELAY ») precede celui de l'etat : seule l'etiquette compte.
        const el = $$('#grove-relais .relais-module').find(x => (x.querySelector('span') || x).textContent.startsWith(cle + ' :'));
        const ferme = !!el && el.classList.contains('actif');
        if (g.querySelector('.mv-lame')) allumerRelais(g, ferme);   // dessin du modele : contact, voyant D3 et halo
        else g.querySelector('.mv-voyant').setAttribute('fill', ferme ? '#ff3b30' : '#5a1d1d');
        return el ? (ferme ? 'fermé (marche)' : 'ouvert (arrêt)') : '';
    },
    oled(g) {
        const toile = $('grove-oled'), image = g.querySelector('.mv-oled');
        if (!toile || !image) return '';
        const donnees = toile.toDataURL();
        if (donnees !== derniereImageOled || image.getAttribute('href') !== donnees) {
            derniereImageOled = donnees;
            image.setAttribute('href', donnees);
        }
        return '';
    },
    lcd(g) {
        // Fond et caracteres repris de l'ecran de « Peripheriques » (bleu, retroeclairage RGB, ou eteint).
        const ecran = $('grove-lcd'), cellule = document.querySelector('#grove-lcd .lcd-cell'), fond = g.querySelector('.mv-lcd-fond');
        if (ecran && fond) { const c = getComputedStyle(ecran).backgroundColor; if (c && c !== 'rgba(0, 0, 0, 0)') fond.setAttribute('fill', c); }
        const eteint = !!ecran && ecran.classList.contains('eteint');
        const encre = cellule ? getComputedStyle(cellule).color : '';
        $$('.mv-lcd', g).forEach(t => {
            t.setAttribute('fill', eteint ? 'transparent' : encre || '#f2f6fb');
            const ligne = $('grove-lcd-l' + t.dataset.l);
            t.textContent = ligne ? $$('.lcd-cell', ligne).map(c => c.textContent || ' ').join('') : '';
        });
        return '';
    },
    lcdrgb(g) {
        if (!g.querySelector('.mv-lcd-vitre')) return LECTEURS.lcd(g);
        // Dessin du modele : meme texte et meme retroeclairage que le tableau de « Peripheriques » (un.js)
        const etat = window.etatLcdRgb ? window.etatLcdRgb() : null, ecran = $('grove-lcd');
        const lignes = [0, 1].map(l => { const z = $('grove-lcd-l' + l); return z ? $$('.lcd-cell', z).map(c => c.textContent || ' ').join('') : ''; });
        allumerLcdRgb(g, etat && etat.retro && etat.rgb ? etat.rgb : null, lignes, !(ecran && ecran.classList.contains('eteint')));
        return '';
    },
    '4d'(g) {
        const ecran = $('grove-4digit-ecran'), cible = g.querySelector('.mv-4d');
        if (ecran && g.querySelector('.mv-seg')) {
            // Dessin du modele : memes segments que le tableau de « Peripheriques » (a a g = bits 0 a 6)
            const codes = $$('svg.digit7', ecran).map(c => $$('.seg', c).reduce((v, p, bit) => v | (p.classList.contains('on') ? 1 << bit : 0), 0));
            const points = !!ecran.querySelector('.digit7-points.on');
            allumerQuatreDigits(g, codes, points, ecran.style.opacity === '' ? 1 : Number(ecran.style.opacity));
            return '';
        }
        if (!ecran || !cible) return '';
        const allume = !!ecran.querySelector('svg');
        g.querySelector('.mv-4d-repos').style.display = allume ? 'none' : '';
        if (allume) {
            const k = Math.min(112 / (ecran.scrollWidth || 112), 40 / (ecran.scrollHeight || 40));
            cible.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" class="montage-4d" style="transform: scale(${k.toFixed(3)});` +
                              ` opacity: ${ecran.style.opacity || 1}">${ecran.innerHTML}</div>`;
        }
        return '';
    },
    servo16(g) {
        // Chaque servomoteur dessine suit son cadran « S0 » ... « S15 » de « Peripheriques » (simulateur : voie -> S + voie)
        const textes = [];
        $$('.mv-servo16', g).forEach(sg => {
            const nom = 'S' + sg.dataset.voie, el = $$('#grove-servos .servo').find(x => x.querySelector('.servo-nom').textContent === nom);
            if (!el) { allumerServo(sg, { angle: 90, tourne: false }); return; }
            const cadran = el.querySelector('.servo-cadran'), rotor = el.querySelector('.servo-rotor');
            const a = /rotate\((-?[\d.]+)deg\)/.exec(rotor.style.transform || '');
            allumerServo(sg, { angle: a ? Number(a[1]) + 90 : undefined, tourne: cadran.classList.contains('continu'),
                               inverse: cadran.classList.contains('inverse'), duree: rotor.style.getPropertyValue('--duree') || '2s' });
            textes.push(nom + ' : ' + el.querySelector('.servo-etat').textContent);
        });
        return textes.join(' · ');
    },
    pilote() { const z = $('grove-moteurs'); return z ? z.textContent.trim() : ''; },

    // Capteurs : la valeur reglee dans « Peripheriques » (curseurs, cases), avec son unite.
    ultrason: () => texteDe('grove-distance-val') + ' cm',
    lumiere(g) {
        if (g.querySelector('.mv-lentille')) allumerLumiere(g, Number(($('grove-lumiere') || {}).value || 0));   // halo de la lentille
        return texteDe('grove-lumiere-val');
    },
    pot(g) {
        const v = Number(($('grove-pot') || {}).value || 512), repere = g.querySelector('.mv-pot');
        if (g.querySelector('.mv-repere')) { allumerPotentiometre(g, v); g.setAttribute('aria-valuenow', v); }   // dessin du modele
        if (repere) repere.style.transform = `rotate(${(v / 1023 * 300 - 150).toFixed(1)}deg)`;
        return texteDe('grove-pot-val');
    },
    pir(g) {
        const vu = !!($('grove-pir') || {}).checked;
        if (g.querySelector('.mv-appui')) allumerPir(g, vu);   // dessin du modele : cercle vert autour de la lentille
        else g.querySelector('.mv-pir').setAttribute('fill', vu ? '#ffe08a' : '#f4f4f4');
        return vu ? 'mouvement détecté' : 'rien ne bouge';
    },
    th: () => texteDe('grove-temp-val') + ' °C · ' + texteDe('grove-humi-val') + ' %',
    co2: () => texteDe('grove-co2-val') + ' ppm',
    pression: () => texteDe('grove-pression-val') + ' hPa',
    cov: () => texteDe('grove-cov-val') + ' ppb',
    couleur(g) {
        const c = ($('grove-couleur') || {}).value || '';
        const cadre = g.querySelector('.mv-couleur');
        if (cadre) cadre.setAttribute('stroke', c || 'none');
        return c ? 'couleur ' + c.toUpperCase() : '';
    },
    gestes(g) {
        allumerGestes(g, Date.now() < gesteEclaire);   // dessin du modele : fenetre eclairee juste apres un geste
        const l = $('grove-geste');
        return l && l.selectedOptions[0] ? l.selectedOptions[0].textContent.trim() : '';
    },
    rtc() { const z = $('grove-rtc'); return z ? z.textContent.trim().replace(/(\d{2}:\d{2}:\d{2})(?=\d)/, '$1 · ') : ''; },
    bouton(g) {
        const enfonce = boutonEnfonce || !!($('grove-bouton-maintenu') || {}).checked;
        if (g.querySelector('.mv-appui')) allumerBouton(g, enfonce);   // dessin du modele : touche et anneau vert
        else {
            g.querySelector('.mv-capuchon').setAttribute('fill', enfonce ? '#1a1a1a' : '#3a3a3a');
            g.querySelector('.mv-capuchon').setAttribute('r', enfonce ? 9 : 11);
        }
        return enfonce ? 'appuyé' : 'relâché';
    },
    joystick(g) {
        const x = Number(($('grove-jx') || {}).value || 512), y = Number(($('grove-jy') || {}).value || 512);
        const enfonce = !!($('grove-jbtn') || {}).checked, manette = g.querySelector('.mv-manette');
        if (!manette) { allumerJoystick(g, x, y, enfonce); return 'X ' + x + ' · Y ' + y + (enfonce ? ' · appuyé' : ''); }   // dessin du modele
        manette.style.transform = `translate(${((x - 512) / 512 * 9).toFixed(1)}px, ${((512 - y) / 512 * 9).toFixed(1)}px)`;
        manette.setAttribute('fill', enfonce ? '#2a2a2a' : '#4a4a4a');
        return 'X ' + x + ' · Y ' + y + (enfonce ? ' · appuyé' : '');
    },
};
const texteDe = id => { const e = $(id); return e ? e.textContent.trim() : ''; };

// Appui dans le montage : relaye au bouton de « Peripheriques » (bouton poussoir) ou a sa case (joystick).
let boutonEnfonce = false;
function appuyerModule(g, enfonce) {
    if (g.dataset.vivant === 'bouton') {
        const source = $('grove-bouton-appui');
        if (!source || boutonEnfonce === enfonce) return;
        boutonEnfonce = enfonce;
        source.dispatchEvent(new PointerEvent(enfonce ? 'pointerdown' : 'pointerup', { bubbles: true }));
    } else if (g.dataset.vivant === 'pir') {
        // Bascule : un appui change l'etat, le relachement ne fait rien (comme le modele)
        const casePir = $('grove-pir');
        if (!casePir || !enfonce) return;
        casePir.checked = !casePir.checked;
        casePir.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (g.dataset.vivant === 'joystick') {
        const caseBouton = $('grove-jbtn');
        if (!caseBouton || caseBouton.checked === enfonce) return;
        caseBouton.checked = enfonce;
        caseBouton.dispatchEvent(new Event('change', { bubbles: true }));
    }
    majVivant();
}
// ---------- Modules deplacables (comme la version Arduino R4, glisserModule, nov. 2026) ----------
// On deplace un module a la souris, son cable suit. Au premier deplacement, les autres modules restent a la place ou
// ils sont affiches (sinon le rangement automatique les reorganiserait). Les places sont enregistrees dans le programme
// .py / .hex (ligne « # montage : ... », un.js) et relues a l'import ; sans place, rangement automatique.
// Bouton et joystick : on appuie sur leur dessin, on les deplace par leurs libelles.
const PLACES = {};   // id du module -> [x, y] dans la scene
function figerLesAutres(id) {
    if (!dernierEtat) return;
    for (const m of dernierEtat.modules) {
        if (m.id === id || m.surCarte || PLACES[m.id] || m.x === undefined) continue;
        PLACES[m.id] = [Math.round(m.x), Math.round(m.y)];
    }
}
// Couleur d'un module (LED) : un clic sur le module, sans le deplacer, ouvre la liste des couleurs (comme le modele).
// Choix retenu par module et enregistre avec les places (ligne « # montage »).
const COULEURS_MODULES = {};   // id du module -> nom de couleur (COULEURS_LED)
function choisirCouleur(id, x, y) {
    const ancien = document.getElementById('menu-couleur-module');
    if (ancien) ancien.remove();
    const menu = document.createElement('div');
    menu.id = 'menu-couleur-module';
    menu.className = 'tb-dropdown-menu visible';
    menu.setAttribute('role', 'menu');
    menu.innerHTML = '<div class="menu-titre">Couleur de la LED</div>' + Object.values(COULEURS_LED).map(c =>
        `<button type="button" role="menuitemradio" data-couleur="${c.nom}" class="${(COULEURS_MODULES[id] || 'rouge') === c.nom ? 'choisi' : ''}">` +
        `<span class="menu-pastille" style="background:${c.allumee}"></span>${c.nom}</button>`).join('');
    menu.style.cssText = `position:fixed;left:${Math.min(x, window.innerWidth - 180)}px;top:${Math.min(y, window.innerHeight - 220)}px;z-index:200200;`;
    document.body.appendChild(menu);
    const fermer = () => { menu.remove(); document.removeEventListener('pointerdown', dehors, true); document.removeEventListener('keydown', clavier, true); };
    const dehors = e => { if (!menu.contains(e.target)) fermer(); };
    const clavier = e => { if (e.key === 'Escape') { e.stopPropagation(); fermer(); } };
    menu.addEventListener('click', e => {
        const b = e.target.closest('[data-couleur]');
        if (!b) return;
        COULEURS_MODULES[id] = b.dataset.couleur;
        fermer();
        if (dernierEtat) { dessinerSvg(dernierEtat); majVivant(); }
    });
    setTimeout(() => { document.addEventListener('pointerdown', dehors, true); document.addEventListener('keydown', clavier, true); }, 0);
    const premier = menu.querySelector('button.choisi') || menu.querySelector('button');
    if (premier) premier.focus();
}
// Capteur de gestes (comme le modele, choisirGeste) : un clic sur le module, sans le deplacer, ouvre la liste des gestes ;
// en choisir un le declenche, comme « Declencher le geste » de « Peripheriques » (meme liste, meme bouton). La fenetre
// du capteur s'eclaire un instant.
let gesteEclaire = 0;
function choisirGeste(x, y) {
    const liste = $('grove-geste'), declencher = $('grove-geste-btn');
    if (!liste || !declencher) return;
    const ancien = document.getElementById('menu-couleur-module');
    if (ancien) ancien.remove();
    const menu = document.createElement('div');
    menu.id = 'menu-couleur-module';
    menu.className = 'tb-dropdown-menu visible';
    menu.setAttribute('role', 'menu');
    menu.innerHTML = '<div class="menu-titre">Geste devant le capteur</div>' + [...liste.options].map(o =>
        `<button type="button" role="menuitem" data-geste="${echap(o.value)}" class="${o.selected ? 'choisi' : ''}">${echap(o.textContent.trim())}</button>`).join('');
    menu.style.cssText = `position:fixed;left:${Math.min(x, window.innerWidth - 200)}px;top:${Math.min(y, window.innerHeight - 330)}px;z-index:200200;`;
    document.body.appendChild(menu);
    const fermer = () => { menu.remove(); document.removeEventListener('pointerdown', dehors, true); document.removeEventListener('keydown', clavier, true); };
    const dehors = e => { if (!menu.contains(e.target)) fermer(); };
    const clavier = e => { if (e.key === 'Escape') { e.stopPropagation(); fermer(); } };
    menu.addEventListener('click', e => {
        const b = e.target.closest('[data-geste]');
        if (!b) return;
        liste.value = b.dataset.geste;
        liste.dispatchEvent(new Event('change', { bubbles: true }));
        fermer();
        declencher.click();
        gesteEclaire = Date.now() + 700;
        majVivant();
        setTimeout(majVivant, 750);
    });
    setTimeout(() => { document.addEventListener('pointerdown', dehors, true); document.addEventListener('keydown', clavier, true); }, 0);
    const premier = menu.querySelector('button.choisi') || menu.querySelector('button');
    if (premier) premier.focus();
}

function installerDeplacement() {
    svgBas.addEventListener('pointerdown', e => {
        const g = e.target.closest('.montage-module');
        if (!g || e.button !== 0 || !g.dataset.id) return;
        if (g.classList.contains('montage-appui') && zoneAppui(g, e.target)) return;   // appui (installerAppuis)
        if (e.target.closest('.mv-tourner')) return;   // bouton du potentiometre : on le tourne (installerAppuis)
        const id = g.dataset.id, m = dernierEtat && dernierEtat.modules.find(x => x.id === id);
        if (!m || m.x === undefined || m.fixe) return;   // ruban : fixe au-dessus de la carte
        e.preventDefault();
        e.stopPropagation();
        const x0 = e.clientX, y0 = e.clientY, depart = [m.x, m.y];
        let bouge = false;
        const bouger = ev => {
            // 5 px a l'ecran : un clic un peu tremble n'est pas un deplacement
            if (!bouge && Math.abs(ev.clientX - x0) + Math.abs(ev.clientY - y0) < 5) return;
            if (!bouge) { bouge = true; figerLesAutres(id); cadreVue().classList.add('module-deplace'); }
            VUE.touchee = true;   // pas de recentrage pendant qu'on deplace un module
            PLACES[id] = [Math.round(depart[0] + (ev.clientX - x0) / VUE.s), Math.round(depart[1] + (ev.clientY - y0) / VUE.s)];
            dessinerSvg(dernierEtat);
            majVivant();
        };
        const finir = ev => {
            cadreVue().classList.remove('module-deplace');
            const def = DESSINS_MODULES[m.picto];
            if (!bouge && ev.type === 'pointerup' && def && def.couleurs) choisirCouleur(id, ev.clientX, ev.clientY);
            if (!bouge && ev.type === 'pointerup' && def && def.gestes) choisirGeste(ev.clientX, ev.clientY);
            document.removeEventListener('pointermove', bouger);
            document.removeEventListener('pointerup', finir);
            document.removeEventListener('pointercancel', finir);
        };
        document.addEventListener('pointermove', bouger);
        document.addEventListener('pointerup', finir);
        document.addEventListener('pointercancel', finir);
    });
}
// Ligne ajoutee au programme exporte (.py, .hex) quand des modules ont ete deplaces ; la carte choisie voyage avec.
window.montageCommentaire = () => (Object.keys(PLACES).length || Object.keys(COULEURS_MODULES).length)
    ? '# montage : ' + JSON.stringify({ carte: choixCarte(), places: PLACES, couleurs: COULEURS_MODULES }) + '\n' : '';
// Import d'un programme (ou nouveau projet) : places relues dans la ligne « # montage », ou effacees (null).
window.montageRestaurer = donnees => {
    for (const k of Object.keys(PLACES)) delete PLACES[k];
    for (const k of Object.keys(COULEURS_MODULES)) delete COULEURS_MODULES[k];
    if (donnees && donnees.couleurs && typeof donnees.couleurs === 'object') {
        for (const [k, c] of Object.entries(donnees.couleurs)) if (COULEURS_LED[c]) COULEURS_MODULES[k] = c;
    }
    if (donnees && donnees.places && typeof donnees.places === 'object') {
        for (const [k, p] of Object.entries(donnees.places)) {
            if (Array.isArray(p) && p.length >= 2 && p.every(Number.isFinite)) PLACES[k] = [Math.round(p[0]), Math.round(p[1])];
        }
    }
    if (donnees && ['grove', 'bitmaker', 'motorbit'].includes(donnees.carte)) {
        try { localStorage.setItem(CLE_CARTE, donnees.carte); } catch (erreur) { /* choix oublie au rechargement */ }
    }
    VUE.touchee = false;
    clearTimeout(attente);
    attente = setTimeout(redessiner, 150);
};

/** Zone ou l'on appuie : la touche dessinee (mv-appui) comme le modele, sinon tout le pictogramme sauf ses libelles.
    Ailleurs, on deplace le module (installerDeplacement). */
function zoneAppui(g, cible) {
    if (g.querySelector('.mv-manche')) return !!cible.closest('.mv-manche');   // joystick dessine : le dome
    return g.querySelector('.mv-appui') ? !!cible.closest('.mv-appui') : !cible.closest('text');
}

/** Regle le potentiometre (0 a 1023) : meme effet que le curseur de « Peripheriques ». */
function reglerPotentiometre(valeur) {
    const curseur = $('grove-pot');
    if (!curseur) return;
    curseur.value = Math.max(0, Math.min(1023, Math.round(valeur)));
    curseur.dispatchEvent(new Event('input', { bubbles: true }));
    majVivant();
}
/** Bouton du potentiometre tourne a la souris, comme le modele (tournerBouton) : l'angle autour de son centre, dans
    le repere du module (qui peut etre tourne), de -150 a +150 degres, donne 0 a 1023 ; au-dela, il reste en butee. */
function tournerPotentiometre(g, e) {
    e.preventDefault();
    e.stopPropagation();
    const bouton = g.querySelector('.mv-tourner circle'), r = bouton.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const m = dernierEtat && dernierEtat.modules.find(x => x.id === g.dataset.id), geo = m && geometrie(m);
    const rotModule = geo ? geo.rot : 0;
    let dernier = Number(($('grove-pot') || {}).value) || 0;
    const bouger = ev => {
        let a = Math.atan2(ev.clientX - cx, cy - ev.clientY) * 180 / Math.PI - rotModule;   // 0 = haut du module
        a = ((a + 540) % 360) - 180;
        if (a > 150 || a < -150) a = dernier > 511 ? 150 : -150;
        dernier = Math.round((a + 150) / 300 * 1023);
        reglerPotentiometre(dernier);
    };
    const finir = () => {
        cadreVue().classList.remove('module-tourne');
        document.removeEventListener('pointermove', bouger);
        document.removeEventListener('pointerup', finir);
        document.removeEventListener('pointercancel', finir);
    };
    cadreVue().classList.add('module-tourne');
    document.addEventListener('pointermove', bouger);
    document.addEventListener('pointerup', finir);
    document.addEventListener('pointercancel', finir);
    bouger(e);
}

/** Regle les axes du joystick (0 a 1023) : meme effet que les curseurs X et Y de « Peripheriques ». */
function reglerJoystick(vx, vy) {
    [['grove-jx', vx], ['grove-jy', vy]].forEach(([id, v]) => {
        const c = $(id);
        if (!c) return;
        c.value = Math.max(0, Math.min(1023, Math.round(v)));
        c.dispatchEvent(new Event('input', { bubbles: true }));
    });
    majVivant();
}
/** Pousse le manche dans une direction de l'ecran (nx, ny de -1 a 1, course circulaire) : ramenee dans le repere du
    module (qui peut etre tourne), dans le sens du vrai module (X baisse vers la prise, Y vers la droite du dessin). */
function pousserVers(g, nx, ny) {
    const m = dernierEtat && dernierEtat.modules.find(x => x.id === g.dataset.id), geo = m && geometrie(m);
    const a = (geo ? geo.rot : 0) * Math.PI / 180;
    const mx = Math.cos(a) * nx + Math.sin(a) * ny, my = -Math.sin(a) * nx + Math.cos(a) * ny;
    reglerJoystick(512 - my * 511.5, 512 - mx * 511.5);
}
/** Joystick manipule a la souris, comme le modele (pousserJoystick) : glisser le dome pousse le manche (au bout de la
    course a mi-rayon de la jupe, sur un cercle), il revient au centre au relachement (ressort) ; un clic rapide sans
    glisser appuie sur le bouton pendant une demi-seconde. Plage 0 a 1023 (choix du professeur, nov. 2026). */
function pousserJoystick(g, e) {
    e.preventDefault();
    e.stopPropagation();
    const r = g.querySelector('.mv-manche circle').getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2, course = r.width / 4;
    const x0 = e.clientX, y0 = e.clientY, t0 = Date.now();
    let bouge = false;
    const bouger = ev => {
        if (!bouge && Math.abs(ev.clientX - x0) + Math.abs(ev.clientY - y0) < 4) return;
        bouge = true;
        const dx = (ev.clientX - cx) / course, dy = (ev.clientY - cy) / course, d = Math.hypot(dx, dy), f = d > 1 ? 1 / d : 1;
        pousserVers(g, dx * f, dy * f);
    };
    const finir = () => {
        cadreVue().classList.remove('module-tourne');
        document.removeEventListener('pointermove', bouger);
        document.removeEventListener('pointerup', finir);
        document.removeEventListener('pointercancel', finir);
        if (bouge) { reglerJoystick(512, 512); return; }        // le ressort ramene le manche au centre
        if (Date.now() - t0 > 600) return;                      // appui long sans bouger : rien
        appuyerModule(g, true);
        setTimeout(() => appuyerModule(g, false), 500);
    };
    cadreVue().classList.add('module-tourne');
    document.addEventListener('pointermove', bouger);
    document.addEventListener('pointerup', finir);
    document.addEventListener('pointercancel', finir);
}

function installerAppuis() {
    svgBas.addEventListener('pointerdown', e => {
        const manche = e.button === 0 && e.target.closest('.mv-manche');
        if (manche) { pousserJoystick(manche.closest('.montage-module'), e); return; }
        const potentiometre = e.button === 0 && e.target.closest('.mv-tourner');
        if (potentiometre) { tournerPotentiometre(potentiometre.closest('.montage-module'), e); return; }
        const g = e.target.closest('.montage-appui');
        if (!g || !zoneAppui(g, e.target)) return;
        e.preventDefault();
        appuyerModule(g, true);
        const relacher = () => { appuyerModule(g, false); document.removeEventListener('pointerup', relacher); document.removeEventListener('pointercancel', relacher); };
        document.addEventListener('pointerup', relacher);
        document.addEventListener('pointercancel', relacher);
    });
    // Clavier : Espace ou Entree maintenus, comme un vrai bouton.
    svgBas.addEventListener('keydown', e => {
        const reglable = e.target.closest && e.target.closest('.montage-module[role="slider"]');
        if (reglable) {
            const pas = { ArrowUp: 32, ArrowRight: 32, ArrowDown: -32, ArrowLeft: -32, PageUp: 128, PageDown: -128 }[e.key];
            const v = Number(($('grove-pot') || {}).value) || 0;
            if (pas) { e.preventDefault(); reglerPotentiometre(v + pas); }
            else if (e.key === 'Home') { e.preventDefault(); reglerPotentiometre(0); }
            else if (e.key === 'End') { e.preventDefault(); reglerPotentiometre(1023); }
            return;
        }
        const g = e.target.closest && e.target.closest('.montage-appui');
        // Joystick dessine : les fleches poussent le manche dans leur direction a l'ecran (relache : retour au centre)
        const fleche = g && g.querySelector('.mv-manche') && { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key];
        if (fleche) { e.preventDefault(); pousserVers(g, fleche[0], fleche[1]); return; }
        if (g && (e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); appuyerModule(g, true); }
    });
    svgBas.addEventListener('keyup', e => {
        const g = e.target.closest && e.target.closest('.montage-appui');
        if (g && g.querySelector('.mv-manche') && /^Arrow/.test(e.key)) { e.preventDefault(); reglerJoystick(512, 512); return; }
        if (g && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); appuyerModule(g, false); }
    });
}

function majVivant() {
    if (mode === 'carte') return;
    for (const g of $$('#montage-svg-bas .montage-module[data-vivant]')) {
        const lire = LECTEURS[g.dataset.vivant];
        if (!lire) continue;
        let valeur = '';
        try { valeur = lire(g, g.dataset.cle) || ''; } catch (erreur) { valeur = ''; }
        const t = g.querySelector('.montage-valeur');
        if (t && t.textContent !== valeur) t.textContent = valeur;
    }
}

// ---------- « Peripheriques » pendant le montage dans la colonne ----------
// Les actionneurs ne s'affichent plus que dans le montage ; la liste garde les reglages des capteurs, sous le
// titre « Reglages des capteurs », qui la replie ou la deplie (memorise, depliee par defaut). Les sections
// cachees restent a jour (un.js) : le montage les recopie.
const SECTIONS_REGLAGES = ['grove-sec-ultrason', 'grove-sec-joystick', 'grove-sec-potentiometre', 'grove-sec-bouton',
    'grove-sec-lumiere', 'grove-sec-pir', 'grove-sec-pression', 'grove-sec-cov', 'grove-sec-gestes', 'grove-sec-th',
    'grove-sec-co2', 'grove-sec-couleur', 'grove-sec-radio'];
const CLE_REGLAGES = 'montageReglagesReplies';
let basculeReglages = null;
function reglagesReplies() { try { return localStorage.getItem(CLE_REGLAGES) === '1'; } catch (erreur) { return false; } }
function majReglages() {
    const liste = $('grove-panneau');
    if (!liste) return;
    const actif = mode === 'colonne';
    if (actif && !basculeReglages) {
        basculeReglages = document.createElement('button');
        basculeReglages.type = 'button';
        basculeReglages.id = 'montage-reglages-bascule';
        basculeReglages.className = 'montage-reglages-bascule';
        basculeReglages.addEventListener('click', () => {
            try { localStorage.setItem(CLE_REGLAGES, reglagesReplies() ? '0' : '1'); } catch (erreur) { /* oublie au rechargement */ }
            majReglages();
        });
        liste.insertBefore(basculeReglages, liste.firstChild);
    }
    liste.classList.toggle('montage-reglages', actif);
    if (!basculeReglages) return;
    const replie = reglagesReplies();
    liste.classList.toggle('reglages-replies', actif && replie);
    // Aucun capteur a regler (seulement des actionneurs) : la liste disparait.
    const visibles = SECTIONS_REGLAGES.filter(id => { const e = $(id); return e && !e.classList.contains('replie'); });
    liste.classList.toggle('reglages-vides', actif && !visibles.length);
    basculeReglages.hidden = !actif;
    basculeReglages.setAttribute('aria-expanded', String(!replie));
    basculeReglages.textContent = (replie ? '▸ ' : '▾ ') + 'Réglages des capteurs';
}

// ---------- Capture de la simulation agrandie (comme la version Arduino R4, capturerSimulation, nov. 2026) ----------
// Le bouton « Capture » du bandeau (un.js), simulation agrandie : image de la simulation TELLE QU'ON LA VOIT (zoom et
// position du moment ; carte, carte d'extension, modules, cables, etiquettes, dans leur etat du moment), sans le tableau
// ni les boutons poses dessus. La micro:bit etant dessinee en HTML, la scene est recopiee dans un <foreignObject>, avec
// les styles de la page et la police Inter rangee dans l'image. Fichier « <nom du programme> - simulation.png ».
window.simulationAgrandie = () => mode === 'grand';
window.capturerSimulation = async function () {
    const cadre = cadreVue();
    if (!cadre || cadre.clientWidth < 2 || cadre.clientHeight < 2) return false;
    try {
        const largeur = cadre.clientWidth, hauteur = cadre.clientHeight, finesse = 2;
        let fond = 'rgb(247, 247, 247)';
        for (let e = cadre; e; e = e.parentElement) {
            const c = getComputedStyle(e).backgroundColor;
            if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') { fond = c; break; }
        }
        const copie = scene.cloneNode(true);   // garde ses id : les regles de la page (#montage-scene, #microbit-board...) s'appliquent
        // Les toiles (ecran OLED...) ne se recopient pas : leur image du moment les remplace.
        const toiles = scene.querySelectorAll('canvas'), copies = copie.querySelectorAll('canvas');
        toiles.forEach((t, i) => {
            try {
                const img = document.createElement('img');
                img.src = t.toDataURL();
                img.style.cssText = getComputedStyle(t).cssText || '';
                img.width = t.width; img.height = t.height;
                img.className = t.className;
                copies[i].replaceWith(img);
            } catch (erreur) { /* toile illisible : laissee vide */ }
        });
        const racineHtml = document.documentElement;
        const html = new XMLSerializer().serializeToString(copie);
        // Masque de la carte (trous du connecteur, image data: dans le CSS) : il ne se charge pas dans une image SVG et
        // rendait la micro:bit invisible ; sur la capture, la carte est donc pleine (trous non decoupes).
        const css = (typeof window.policeInterCss === 'function' ? await window.policeInterCss() : '') +
                    (typeof window.collecterCssCapture === 'function' ? window.collecterCssCapture() : '') +
                    '#microbit-board { -webkit-mask-image: none !important; mask-image: none !important; }\n';
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + largeur + '" height="' + hauteur + '"' +
            ' data-theme="' + (racineHtml.dataset.theme || '') + '" data-contrast="' + (racineHtml.dataset.contrast || '') + '"' +
            (racineHtml.dataset.saison ? ' data-saison="' + racineHtml.dataset.saison + '"' : '') + '>' +
            '<style>' + css.replace(/<\/style/gi, '<\\/style') + '</style>' +
            '<rect width="100%" height="100%" fill="' + fond + '"/>' +
            '<foreignObject x="0" y="0" width="' + largeur + '" height="' + hauteur + '">' +
            '<div xmlns="http://www.w3.org/1999/xhtml" class="montage-cadre-echelle" style="position:relative;width:' + largeur +
            'px;height:' + hauteur + 'px;overflow:hidden;font-family:var(--font);">' + html + '</div></foreignObject></svg>';
        // Adresse data: et non blob: : Chrome considere une image SVG a <foreignObject> chargee depuis un blob comme non sure
        // (toile « teintee », export PNG refuse).
        const source = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        const image = new Image();
        await new Promise((ok, ko) => { image.onload = ok; image.onerror = () => ko(new Error('image SVG illisible')); image.src = source; });
        const toile = document.createElement('canvas');
        toile.width = Math.ceil(largeur * finesse);
        toile.height = Math.ceil(hauteur * finesse);
        const ctx = toile.getContext('2d');
        ctx.fillStyle = fond;
        ctx.fillRect(0, 0, toile.width, toile.height);
        ctx.drawImage(image, 0, 0, toile.width, toile.height);
        const png = await new Promise(ok => toile.toBlob(ok, 'image/png'));
        if (!png) throw new Error('conversion en PNG impossible');
        const base = (typeof window.nomFichierPour === 'function' ? window.nomFichierPour('programme.png') : 'programme.png').replace(/\.png$/i, '');
        const lien = document.createElement('a');
        lien.href = URL.createObjectURL(png);
        lien.download = base + ' - simulation.png';
        document.body.appendChild(lien);
        lien.click();
        lien.remove();
        setTimeout(() => URL.revokeObjectURL(lien.href), 1000);
        return true;
    } catch (erreur) {
        console.error('Capture de la simulation :', erreur);
        return false;
    }
};

// ---------- Tableau range en colonnes (comme la version Arduino R4, r4RangerTableau, nov. 2026) ----------
// Autant de colonnes (190 px au moins) que la largeur du panneau le permet ; les panneaux visibles, du plus haut au plus
// petit, vont chacun dans la colonne la moins haute ; chaque colonne garde l'ordre habituel des panneaux, et la colonne
// du premier est a gauche. Rien ne bouge tant que la liste des panneaux visibles et le nombre de colonnes restent les
// memes, ni pendant que l'eleve modifie un champ (curseur tenu, texte en cours de saisie) : on range des qu'il a fini.
const LARGEUR_PANNEAU = 190, ECART_PANNEAUX = 18;
let ordrePanneaux = null, signatureTableau = '';
function enSaisie(liste) {
    const champ = document.activeElement;
    return !!champ && liste.contains(champ) && /^(INPUT|SELECT|TEXTAREA)$/.test(champ.tagName) && champ.type !== 'checkbox' && champ.type !== 'radio';
}
function rangerTableau() {
    const liste = $('grove-panneau');
    if (!liste) return;
    if (!ordrePanneaux) ordrePanneaux = [...liste.querySelectorAll('.grove-bloc')];
    const largeur = liste.clientWidth;
    const visible = p => getComputedStyle(p).display !== 'none';
    if (!largeur) { signatureTableau = ''; return; }   // tableau cache : rien a mesurer
    const n = Math.max(1, Math.floor((largeur + ECART_PANNEAUX) / (LARGEUR_PANNEAU + ECART_PANNEAUX)));
    const pleins = ordrePanneaux.filter(visible);
    const signature = n + '|' + pleins.map(p => p.id).join(',');
    if (signature === signatureTableau && liste.querySelector(':scope > .tab-colonnes')) return;
    if (enSaisie(liste)) return;   // champ en cours de modification : on rangera quand il sera quitte (focusout)
    signatureTableau = signature;
    const hauteur = new Map(pleins.map(p => [p, p.offsetHeight]));   // mesurees avant de deplacer quoi que ce soit
    const cols = Array.from({ length: n }, () => ({ h: 0, panneaux: [] }));
    pleins.slice().sort((a, b) => hauteur.get(b) - hauteur.get(a)).forEach(p => {
        const c = cols.reduce((m, x) => (x.h < m.h ? x : m), cols[0]);
        c.panneaux.push(p);
        c.h += hauteur.get(p) + 12;
    });
    const rang = p => ordrePanneaux.indexOf(p);
    cols.forEach(c => c.panneaux.sort((a, b) => rang(a) - rang(b)));
    cols.sort((a, b) => (a.panneaux.length ? rang(a.panneaux[0]) : 1e6) - (b.panneaux.length ? rang(b.panneaux[0]) : 1e6));
    ordrePanneaux.filter(p => !visible(p)).forEach(p => cols[0].panneaux.push(p));   // panneaux caches : premiere colonne
    const bloc = document.createElement('div');
    bloc.className = 'tab-colonnes';
    cols.forEach(c => {
        const d = document.createElement('div');
        d.className = 'tab-col';
        c.panneaux.forEach(p => d.appendChild(p));
        bloc.appendChild(d);
    });
    const ancien = liste.querySelector(':scope > .tab-colonnes');
    if (ancien) ancien.remove();
    liste.appendChild(bloc);
}
// Minuterie courte (comme le modele) plutot que requestAnimationFrame, suspendu quand l'onglet n'est pas affiche.
let minuterieTableau = null;
function rangerBientot() { clearTimeout(minuterieTableau); minuterieTableau = setTimeout(rangerTableau, 30); }
function installerTableau() {
    const liste = $('grove-panneau');
    if (!liste) return;
    rangerTableau();
    new ResizeObserver(rangerBientot).observe(liste);
    window.addEventListener('resize', rangerBientot);
    liste.addEventListener('focusout', rangerBientot);   // rangement retenu pendant une saisie : fait des qu'elle est finie
    // Un panneau apparait ou disparait (blocs poses ou retires, reglages replies...) : classes qui changent.
    new MutationObserver(rangerBientot).observe(liste, { subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'style'] });
}

/** Place la carte, la scene et le choix de la carte d'extension selon le mode voulu. */
function appliquerMode() {
    const carte = $('microbit-board'), cadreCarte = $('carte-cadre'), cadreScene = scene.parentElement;
    if (!carte) return;
    // Simulation comme espace de travail (nov. 2026) : la scene (micro:bit seule ou montage) est TOUJOURS affichee,
    // dans la colonne ou agrandie ; plus de seuil de largeur (on zoome et on se deplace dans la vue).
    const enColonne = true;
    const voulu = grandDemande ? 'grand' : 'colonne';
    const ancien = mode;
    if (voulu !== ancien) {
        mode = voulu;
        if (voulu === 'carte') {
            if (emplacement) emplacement.parent.insertBefore(carte, emplacement.suivant);
        } else if (carte.parentNode !== place) {
            // La carte change de parent : ses ecouteurs et identifiants la suivent.
            emplacement = { parent: carte.parentNode, suivant: carte.nextSibling };
            place.appendChild(carte);
        }
        // Scene : dans la colonne, ou dans la vue agrandie (par-dessus les colonnes de categories et de blocs).
        if (voulu === 'grand') zoneGrand.appendChild(cadreScene);
        else if (voulu === 'colonne') zoneColonne.appendChild(cadreScene);
    }
    // Vue agrandie (comme le modele) : la simulation passe par-dessus les blocs ; la colonne ne garde que la barre, les
    // boutons d'action et le tableau, qui prend toute la hauteur.
    panneau.hidden = mode !== 'grand';
    colonne.hidden = mode === 'grand';
    conteneur.classList.toggle('simulation-agrandie', mode === 'grand');
    colonne.classList.toggle('agrandi', mode === 'grand');
    console_.classList.toggle('montage-en-colonne', !colonne.hidden);
    cadreCarte.classList.toggle('montage-carte-absente', mode === 'grand' && !enColonne);
    bouton.hidden = true;   // « Voir le montage » : la scene est toujours visible dans la colonne
    bouton.setAttribute('aria-expanded', String(mode === 'grand'));
    bouton.innerHTML = window.icone('prise') + (mode === 'grand' ? 'Fermer le montage' : 'Voir le montage');
    if (boutonAgrandir) {
        const grand = mode === 'grand';
        boutonAgrandir.innerHTML = (grand ? ICONE_FERMER : ICONE_AGRANDIR) + '<span class="sim-lib">' + (grand ? 'Fermer' : 'Agrandir') + '</span>';
        boutonAgrandir.title = grand ? 'Fermer la simulation agrandie (Échap)' : 'Agrandir la simulation';
        boutonAgrandir.setAttribute('aria-expanded', String(grand));
    }
    majReglages();
    if (voulu !== ancien) {
        if (boutonAgrandir && (voulu === 'grand' || ancien === 'grand')) boutonAgrandir.focus();
        if (voulu !== 'carte') { Blockly.svgResize(window.workspace); requestAnimationFrame(() => { redessiner(); recentrerVue(); }); }
        else Blockly.svgResize(window.workspace);
    }
}

function ouvrirGrand(ouvrir) {
    grandDemande = ouvrir;
    appliquerMode();
}

function installer() {
    if (!panneau || !bouton || !colonne || !boutonAgrandir || !window.workspace) return false;
    bouton.addEventListener('click', () => ouvrirGrand(mode !== 'grand'));
    fermer.addEventListener('click', () => ouvrirGrand(false));
    boutonAgrandir.addEventListener('click', () => ouvrirGrand(mode !== 'grand'));
    installerVue();
    if (choix) {
        choix.querySelectorAll('[data-carte]').forEach(b => b.addEventListener('click', () => {
            try { localStorage.setItem(CLE_CARTE, b.dataset.carte); } catch (erreur) { /* choix oublie au rechargement */ }
            redessiner();
        }));
    }
    // Echap ferme la vue agrandie, sauf si une fenetre (nom du programme...) est ouverte par-dessus : elle se ferme d'abord.
    document.addEventListener('keydown', e => {
        if (mode !== 'grand' || e.key !== 'Escape' || e.defaultPrevented || document.querySelector('.fen-voile')) return;
        e.preventDefault();
        ouvrirGrand(false);
    });
    window.workspace.addChangeListener(e => {
        if (e.isUiEvent) return;
        clearTimeout(attente);
        attente = setTimeout(redessiner, 150);
    });
    // Taille du cadre de la vue : surveillee par installerVue (meme echelle, recentrage tant que la vue n'est pas touchee).
    const ruban = $('grove-ruban');
    if (ruban) new MutationObserver(() => { if (mode !== 'carte' && rubanSurCarte) copierLedsCarte(); })
        .observe(ruban, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    // Actionneurs en direct : lecture periodique tant que le montage est visible (l'OLED est une toile, sans
    // mutation a observer).
    setInterval(() => { if (mode !== 'carte' && document.visibilityState === 'visible') majVivant(); }, 200);
    installerAppuis();
    installerDeplacement();
    installerTableau();
    redessiner();
    return true;
}

// un.js cree l'espace de travail : on attend qu'il existe (une minute au plus, onglet visible). Minuterie et non
// requestAnimationFrame : un onglet en arriere-plan (ouvert depuis le Lanceur, par exemple) suspend les images, et la
// vue montage ne s'installait alors jamais ; une minuterie continue, ralentie, et rattrape des que l'onglet s'affiche.
(function attendre(essais) {
    if (!installer() && essais > 0) setTimeout(() => attendre(essais - 1), 50);
})(1200);
