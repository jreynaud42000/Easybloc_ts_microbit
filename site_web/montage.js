// montage.js — vue « montage » du simulateur : la micro:bit enfichee dans sa carte d'extension
// (Grove Shield v2.0 ou BitMaker V2 de Seeed, au choix, ou carte moteurs DFRobot DFR0548 ou ELECFREAKS Motor:bit),
// les modules du programme
// disposes autour et relies par leurs cables.
//
// Ou s'affiche le montage : dans la colonne du simulateur, a la place de la carte seule, des qu'un bloc
// d'extension est pose et que la colonne fait au moins 480 px (en dessous, modules et etiquettes seraient
// illisibles : la carte seule reste, avec le bouton « Voir le montage ») ; « Agrandir » ouvre la meme scene
// par-dessus la zone de blocs. Une seule scene, deplacee d'un endroit a l'autre.
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
    { motif: /^grove_dht11_definir$/,         nom: 'DHT11',                 champs: ['BROCHE'], picto: 'dht' },
    { motif: /^grove_dht22_definir$/,         nom: 'DHT22',                 champs: ['BROCHE'], picto: 'dht' },
    { motif: /^grove_barre_/,                 nom: 'Barre de LED',          champs: ['PORT'], picto: 'barre', large: true },
    { motif: /^servo_/,                       nom: 'Servomoteur',           champs: ['BROCHE'], picto: 'servo', servo: true },
    { motif: /^grove_oled_/,                  nom: 'Écran OLED',            i2c: true, picto: 'oled', large: true },
    { motif: /^grove_lcd_/,                   nom: 'Écran LCD 16×2',        i2c: true, picto: 'lcd', large: true },
    { motif: /^grove_lcdrgb_/,                nom: 'Écran LCD RGB',         i2c: true, picto: 'lcdrgb', large: true },
    { motif: /^grove_bmp280$/,                nom: 'Capteur de pression',   i2c: true, picto: 'puce' },
    { motif: /^grove_sgp30$/,                 nom: 'Capteur COV',           i2c: true, picto: 'puce' },
    { motif: /^grove_rtc_/,                   nom: 'Horloge RTC',           i2c: true, picto: 'rtc' },
    { motif: /^grove_pca_/,                   nom: 'Carte servos PCA9685',  i2c: true, picto: 'pca', large: true },
    { motif: /^grove_gestes_/,                nom: 'Capteur de gestes',     i2c: true, picto: 'puce' },
    { motif: /^grove_th_/,                    nom: 'Température, humidité', i2c: true, picto: 'puce' },
    { motif: /^grove_couleur_/,               nom: 'Capteur de couleur',    i2c: true, picto: 'couleur' },
    { motif: /^grove_moteur_/,                nom: 'Pilote de moteurs I2C', i2c: true, picto: 'pilote' },
    { motif: /^grove_scd30_/,                 nom: 'Capteur CO₂ SCD30',     i2c: true, picto: 'puce', large: true },
    { motif: /^grove_scd41_/,                 nom: 'Capteur CO₂ SCD41',     i2c: true, picto: 'puce' },
];
const BLOC_EXTENSION = /^(grove_|servo_|dfr_|motorbit_)/;
// Lecteur de l'etat en direct (majVivant) quand il differe du dessin : plusieurs capteurs partagent le dessin « puce ».
const VIVANT = {
    'Capteur de pression': 'pression', 'Capteur COV': 'cov', 'Capteur de gestes': 'gestes', 'Température, humidité': 'th',
    'DHT11': 'th', 'DHT22': 'th', 'Capteur CO₂ SCD30': 'co2', 'Capteur CO₂ SCD41': 'co2', 'Horloge RTC': 'rtc',
    'Capteur de couleur': 'couleur', 'Capteur de lumière': 'lumiere', 'Ultrason': 'ultrason', 'Potentiomètre': 'pot',
    'Détecteur de mouvement': 'pir', 'Bouton poussoir': 'bouton', 'Joystick': 'joystick',
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
    if (sans.includes('P13')) res.alerte = '⚠ P13 réservée aux LED de la carte';
    else if (sans.length) res.alerte = '⚠ ' + sans.join(', ') + ' sans port sur cette carte';
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
        if (RESERVEES_MOTORBIT[n]) { alerte = '⚠ P' + n + ' : moteur ' + RESERVEES_MOTORBIT[n]; return; }
        if (n === 0) { alerte = '⚠ P0 : buzzer de la carte'; return; }
        if (!GAUCHE_MOTORBIT.includes(n) && !DROITE_MOTORBIT.includes(n)) { alerte = '⚠ P' + n + ' absente de la carte'; return; }
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
    const blocs = window.workspace ? window.workspace.getAllBlocks(false) : [];
    const types = blocs.map(b => b.type);
    const dfr = types.some(t => /^dfr_/.test(t));
    // Des blocs Motor:bit imposent cette carte, comme ceux de la DFR0548 (celle-ci l'emporte si les deux sont poses).
    const motorbit = !dfr && (types.some(t => /^motorbit_/.test(t)) || choixCarte() === 'motorbit');
    const imposee = dfr ? 'dfr' : types.some(t => /^motorbit_/.test(t)) ? 'motorbit' : '';
    const bitmaker = !dfr && !motorbit && choixCarte() === 'bitmaker';
    const utile = types.some(t => BLOC_EXTENSION.test(t));
    const modules = new Map();
    const ajouter = (cle, m) => { if (!modules.has(cle)) modules.set(cle, m); };

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
        if (modules.has(cle)) continue;
        ajouter(cle, Object.assign({ nom: def.nom, picto: def.picto, large: def.large, pins, cle: 'P' + pins[0].slice(3) },
            dfr ? branchementDfr(pins, def.servo) : motorbit ? branchementMotorbit(pins, def.servo) :
            bitmaker ? branchementBitmaker(pins) : branchementGrove(pins)));
    }

    // Deux modules sur le meme port (ou la meme broche) : possible dans le programme, pas sur la table.
    const parPort = {};
    for (const m of modules.values()) for (const k of new Set(m.occupe || [])) (parPort[k] = parPort[k] || []).push(m);
    for (const liste of Object.values(parPort)) if (liste.length > 1) liste.forEach(m => { m.alerte = m.alerte || '⚠ port partagé'; });
    const i2c = [...modules.values()].filter(m => m.i2c);
    if (i2c.length > 1) i2c.forEach(m => { m.note = 'bus I2C partagé'; });

    return { utile, imposee, carte: dfr ? 'dfr' : motorbit ? 'motorbit' : bitmaker ? 'bitmaker' : 'grove', modules: [...modules.values()] };
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
        if (!m.fils.length) { m.cote = 'b'; m.ancre = [LARGEUR / 2, basCarte]; cotes.b.push(m); continue; }
        const [dx] = m.fils[0].d;
        m.cote = dx < 0 ? 'g' : dx > 0 ? 'd' : 'b';
        m.ancre = m.fils.reduce((s, f) => [s[0] + f.x / m.fils.length, s[1] + f.y / m.fils.length], [0, 0]);
        cotes[m.cote].push(m);
    }
    let bas = basCarte;
    for (const c of ['g', 'd']) {
        let y = 16;
        cotes[c].sort((a, b) => a.ancre[1] - b.ancre[1]).forEach(m => {
            m.y = Math.max(y, m.ancre[1] - 60);
            m.x = c === 'g' ? 30 : LARGEUR - 30 - MODULE.l;
            y = m.y + MODULE.h + 96;
            bas = Math.max(bas, y);
        });
    }
    // Rangee du bas (les ports Grove v2.0 sont tous en bas) : chaque module sous son port, a la ligne si elle deborde.
    // Chaque ligne est centree sous ses ports, sans sortir de la scene.
    const [xMin, xMax, pas] = [30, LARGEUR - 30, MODULE.l + 20];
    const parLigne = Math.floor((xMax - xMin + 20) / pas);
    const tries = cotes.b.sort((a, b) => a.ancre[0] - b.ancre[0]);
    for (let i = 0; i < tries.length; i += parLigne) {
        const ligne = tries.slice(i, i + parLigne), largeur = ligne.length * pas - 20;
        const centre = ligne.reduce((s, m) => s + m.ancre[0], 0) / ligne.length;
        const x0 = Math.max(xMin, Math.min(centre - largeur / 2, xMax - largeur));
        ligne.forEach((m, k) => {
            m.x = x0 + k * pas;
            m.y = basCarte + 90 + (i / parLigne) * (MODULE.h + 110);
            bas = Math.max(bas, m.y + MODULE.h + 96);
        });
    }
    return bas + 10;
}

/** Point d'arrivee du cable sur le module (cote tourne vers la carte) et direction d'arrivee. */
function arrivee(m) {
    if (m.cote === 'g') return { x: m.x + MODULE.l / 2 + largeurPcb(m) / 2 + 8, y: m.y + MODULE.h / 2, d: [-1, 0] };
    if (m.cote === 'd') return { x: m.x + MODULE.l / 2 - largeurPcb(m) / 2 - 8, y: m.y + MODULE.h / 2, d: [1, 0] };
    return { x: m.x + MODULE.l / 2, y: m.y - 6, d: [0, 1] };
}
const largeurPcb = m => (m.large ? 150 : 74);

// ---------- Dessin ----------
const r = (x, y, l, h, att) => `<rect x="${x}" y="${y}" width="${l}" height="${h}" ${att || ''}/>`;
const cercle = (x, y, rayon, att) => `<circle cx="${x}" cy="${y}" r="${rayon}" ${att || ''}/>`;
const texte = (x, y, t, att) => `<text x="${x}" y="${y}" ${att || ''}>${t}</text>`;
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
    // Ports Grove blancs, ouverts vers le bas ; leur nom est imprime dessous sur la carte, mais les cables le
    // cacheraient : il passe au-dessus, a la place des noms de fils (GND, 3V3...) trop petits a cette echelle.
    for (const [nom, p] of Object.entries(PORTS_GROVE)) {
        s += r(p.x - 27, p.y - 52, 54, 52, 'rx="3" fill="#f2f2f2" stroke="#b9b9b9"');
        s += r(p.x - 20, p.y - 32, 40, 30, 'rx="2" fill="#d6d6d6" stroke="#c2c2c2"') + r(p.x - 8, p.y - 40, 16, 8, 'fill="#d6d6d6"');
        [-12, -4, 4, 12].forEach(dx => { s += r(p.x + dx - 1.5, p.y - 26, 3, 14, 'fill="#c9a54a"'); });
        s += texte(p.x, p.y - 62, nom, 'class="montage-serigraphie" text-anchor="middle"');
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

function dessinFil(f, fin, o) {
    // Courbe de Bezier : chaque extremite part dans sa direction de sortie, decalee le long du connecteur.
    // Un fil peut d'abord suivre des points de passage (le 3V3 de la Grove contourne la carte par le bas).
    const e = { x: fin.x - fin.d[1] * o, y: fin.y + fin.d[0] * o };
    let d = `M${f.x} ${f.y}`, depart = f, dir = f.d;
    for (const [px, py] of f.passage || []) {
        d += ` L${px} ${py}`;
        const n = Math.hypot(px - depart.x, py - depart.y) || 1;
        dir = [(px - depart.x) / n, (py - depart.y) / n];
        depart = { x: px, y: py };
    }
    const long = Math.max(50, Math.hypot(e.x - depart.x, e.y - depart.y) * 0.45);
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
    const basCarte = etat.carte === 'dfr' ? DFR_BAS + 18 : etat.carte === 'motorbit' ? MB_BAS : etat.carte === 'bitmaker' ? BM_BAS : GROVE_PCB.y + GROVE_PCB.l;
    let hauteur = disposer(etat.modules, basCarte);
    let bas = { dfr: dessinCarteDfr, motorbit: dessinCarteMotorbit, bitmaker: dessinCarteBitmaker, grove: dessinCarteGrove }[etat.carte]();
    // Ruban sur les LED de la BitMaker : legende sous la carte, a la place du module et de son cable.
    const surCarte = etat.modules.find(m => m.surCarte);
    if (surCarte) hauteur = Math.max(hauteur, basCarte + 50);
    if (surCarte) bas += texte(LARGEUR / 2, basCarte + 30, echap(surCarte.nom + ' · ' + surCarte.etiquette +
                               (surCarte.note ? ' · ' + surCarte.note : '')), 'class="montage-note" text-anchor="middle"');
    for (const m of etat.modules) {
        if (m.x === undefined) continue;
        const fin = arrivee(m), n = m.fils.length;
        m.fils.forEach((f, i) => { bas += dessinFil(f, fin, (i - (n - 1) / 2) * 6); });
    }
    for (const m of etat.modules) {
        if (m.x === undefined) continue;
        const cx = m.x + MODULE.l / 2, cy = m.y + MODULE.h / 2;
        const vivant = VIVANT[m.nom] || m.picto;
        // Bouton poussoir et joystick : on appuie directement dessus (meme effet que dans « Peripheriques »).
        const appui = vivant === 'bouton' || vivant === 'joystick'
            ? ` role="button" tabindex="0" aria-label="${echap(m.nom)} ${echap(m.etiquette)} : maintenir pour appuyer"` : '';
        bas += `<g class="montage-module${appui ? ' montage-appui' : ''}" data-vivant="${vivant}" data-cle="${echap(m.cle || '')}" data-zone="${m.zone || ''}"${appui}>${dessinModule(m, cx, cy)}` +
               texte(cx, m.y + MODULE.h + 22, echap(m.nom), 'class="montage-libelle" text-anchor="middle"') +
               texte(cx, m.y + MODULE.h + 42, echap(m.etiquette), 'class="montage-note" text-anchor="middle"');
        bas += texte(cx, m.y + MODULE.h + 62, '', 'class="montage-valeur" text-anchor="middle"');
        const note = [m.alerte, m.note].filter(Boolean).join(' · ');
        if (note) bas += texte(cx, m.y + MODULE.h + 82, echap(note), `class="montage-note${m.alerte ? ' alerte' : ''}" text-anchor="middle"`);
        bas += '</g>';
    }
    return { bas, hauteur };
}

// ---------- Panneau ----------
const panneau = $('montage-panneau'), scene = $('montage-scene'), bouton = $('btn-montage');
const svgBas = $('montage-svg-bas'), svgHaut = $('montage-svg-haut'), place = $('montage-carte');
const titre = $('montage-sous-titre'), resume = $('montage-resume'), fermer = $('montage-fermer');
const choix = $('montage-choix'), choixAuto = $('montage-choix-auto');
const colonne = $('montage-colonne'), zoneColonne = $('montage-colonne-zone'), outilsColonne = $('montage-colonne-outils');
// « Agrandir » : case a cocher dans son etiquette ; l'etiquette sert de repere pour ranger le choix de la carte.
const caseAgrandir = $('montage-agrandir'), agrandir = caseAgrandir ? caseAgrandir.closest('label') || caseAgrandir : null;
const console_ = $('simulateur-console'), conteneur = $('simulator-container');
const zoneGrand = panneau ? panneau.querySelector('.montage-zone') : null;
const enteteGrand = panneau ? panneau.querySelector('.montage-entete') : null;
// mode : 'carte' (carte seule), 'colonne' (montage dans la colonne) ou 'grand' (par-dessus les blocs).
let mode = 'carte', grandDemande = false, utile = false, hauteurScene = 600, emplacement = null, attente = null;
const LARGEUR_COLONNE = 480, MARGE_COLONNE = 24;   // hysteresis : la barre de defilement ne fait pas osciller l'affichage

// Carte Grove ou BitMaker, memorisee dans le navigateur (Grove par defaut, ou si le stockage est indisponible).
const CLE_CARTE = 'montageCarte';
function choixCarte() {
    try { const c = localStorage.getItem(CLE_CARTE); return c === 'bitmaker' || c === 'motorbit' ? c : 'grove'; } catch (erreur) { return 'grove'; }
}

// Zoom de la simulation (demande de l'utilisateur) : Ctrl + molette sur la carte ou le montage, comme la molette dans
// la zone de blocs ; la molette seule fait toujours defiler la colonne. Le bouton « 100 % » remet l'echelle d'origine.
// Dans la barre du montage (colonne), une pastille a cote d'« Agrandir » (demande de l'utilisateur, nov. 2026) : a 100 %
// elle indique « Ctrl + molette pour zoomer », une fois zoome elle devient le bouton de retour. Ailleurs (carte seule,
// montage agrandi), le bouton n'apparait qu'une fois zoome, en haut de la colonne, comme avant.
const ZOOM_MIN = 0.5, ZOOM_MAX = 3;
let zoomSim = 1, boutonZoom = null, texteZoom = null;
function placerZoom() {
    if (!boutonZoom) return;
    // Deplacer un element lui fait perdre le focus clavier : seulement s'il n'est pas deja a sa place.
    if (mode === 'colonne') { if (boutonZoom.nextSibling !== agrandir) outilsColonne.insertBefore(boutonZoom, agrandir); }
    else if (boutonZoom.parentNode !== console_ || console_.firstChild !== boutonZoom) console_.insertBefore(boutonZoom, console_.firstChild);
    const indication = zoomSim === 1;
    boutonZoom.hidden = indication && mode !== 'colonne';
    boutonZoom.classList.toggle('indication', indication);
    // A 100 % la pastille n'est qu'une aide : hors de l'ordre de tabulation, et annoncee comme inactive.
    boutonZoom.tabIndex = indication ? -1 : 0;
    boutonZoom.setAttribute('aria-disabled', String(indication));
    texteZoom.textContent = indication ? 'Ctrl + molette pour zoomer' : 'Zoom ' + Math.round(zoomSim * 100) + ' % · revenir à 100 %';
}
function appliquerZoom() {
    const cadreCarte = $('carte-cadre');
    if (cadreCarte) cadreCarte.style.zoom = zoomSim === 1 ? '' : String(zoomSim);
    // Montage agrandi au-dela de la place : on le fait defiler depuis son bord gauche.
    for (const zone of [zoneColonne, zoneGrand]) if (zone) {
        zone.style.overflow = zoomSim > 1 ? 'auto' : '';
        zone.style.justifyContent = zoomSim > 1 ? 'flex-start' : '';
    }
    placerZoom();
    ajusterEchelle();
}
function installerZoom() {
    boutonZoom = document.createElement('button');
    boutonZoom.type = 'button';
    boutonZoom.className = 'sim-zoom';
    boutonZoom.title = 'Ctrl + molette pour zoomer sur la simulation';
    // Loupe dessinee (pas d'emoji) ; le texte vit dans son propre span pour ne pas effacer l'icone.
    boutonZoom.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor"'
        + ' stroke-width="2" stroke-linecap="round"><circle cx="10" cy="10" r="6"/><path d="M14.5 14.5L20 20M10 7.5v5M7.5 10h5"/></svg><span></span>';
    texteZoom = boutonZoom.lastChild;
    boutonZoom.addEventListener('click', () => { if (zoomSim !== 1) { zoomSim = 1; appliquerZoom(); } });
    placerZoom();
    const molette = e => {
        if (!e.ctrlKey || !e.deltaY) return;   // molette seule : defilement normal ; Ctrl : zoom (et pas celui du navigateur)
        e.preventDefault();
        zoomSim = Math.round(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomSim * (e.deltaY < 0 ? 1.1 : 1 / 1.1))) * 100) / 100;
        if (Math.abs(zoomSim - 1) < 0.05) zoomSim = 1;
        appliquerZoom();
    };
    console_.addEventListener('wheel', molette, { passive: false });
    if (zoneGrand) zoneGrand.addEventListener('wheel', molette, { passive: false });
}

function ajusterEchelle() {
    if (mode === 'carte') return;
    // La scene garde ses unites (1000 de large) ; le cadre porte la place reellement occupee.
    const cadre = scene.parentElement, zone = cadre.parentElement;
    // Ajuste a la largeur (defilement vertical si besoin) : ajuster aussi a la hauteur rendait tout illisible.
    // Le zoom de l'utilisateur s'applique ensuite (Ctrl + molette).
    const k = Math.max(0.35, Math.min(1.1, (zone.clientWidth - 24) / LARGEUR)) * zoomSim;
    scene.style.transform = 'scale(' + k + ')';
    cadre.style.width = Math.round(LARGEUR * k) + 'px';
    cadre.style.height = Math.round(hauteurScene * k) + 'px';
}

function redessiner() {
    const etat = lireMontage();
    utile = etat.utile;
    if (!utile) grandDemande = false;
    appliquerMode();
    if (mode === 'carte') return;
    const { bas, hauteur } = dessinerScene(etat);
    hauteurScene = hauteur;
    scene.style.height = hauteur + 'px';
    for (const svg of [svgBas, svgHaut]) svg.setAttribute('viewBox', `0 0 ${LARGEUR} ${hauteur}`);
    svgBas.innerHTML = bas;
    const fente = { dfr: FENTE, motorbit: FENTE_MOTORBIT, bitmaker: FENTE_BITMAKER, grove: FENTE_GROVE }[etat.carte];
    // Connecteur en plastique gris fonce sur la BitMaker et la Motor:bit, noir sur les deux autres cartes.
    const plastique = etat.carte === 'bitmaker' || etat.carte === 'motorbit' ? 'fill="#3a3c42" stroke="#55585f"' : 'fill="#0b0b0b" stroke="#2b2b2b"';
    svgHaut.innerHTML = r(fente.x, fente.y, fente.l, fente.h, `rx="4" ${plastique} stroke-width="2"`) +
                        r(fente.x + 6, fente.y + 4, fente.l - 12, 3, 'fill="#2a2a2a"') +
                        // Pattes cuivrees du connecteur, visibles sous le boitier sur la Grove v2.0.
                        (etat.carte === 'dfr' ? '' : Array.from({ length: 40 }, (_, i) =>
                            r(fente.x + 10 + i * 7.3, fente.y + fente.h - 2, 3, 7, 'fill="#b87333"')).join(''));
    titre.textContent = { dfr: 'Carte moteurs DFRobot DFR0548', motorbit: 'Carte moteurs ELECFREAKS Motor:bit V1.6',
                          bitmaker: 'Carte BitMaker V2 (Seeed)', grove: 'Carte Grove Shield for micro:bit v2.0 (Seeed)' }[etat.carte];
    // Choix de la carte : sans objet quand les blocs du programme imposent la DFR0548 ou la Motor:bit.
    if (choix) choix.hidden = !!etat.imposee;
    if (choixAuto) {
        choixAuto.hidden = !etat.imposee;
        choixAuto.textContent = (etat.imposee === 'motorbit' ? 'Carte Motor:bit' : 'Carte DFR0548') + ' : choisie car le programme utilise ses blocs.';
    }
    resume.innerHTML = etat.modules.length
        ? etat.modules.map(m => '<li>' + echap(m.nom) + ' : ' + echap(m.etiquette) + (m.note ? ' (' + echap(m.note) + ')' : '') +
                                (m.alerte ? ' — ' + echap(m.alerte.replace('⚠ ', '')) : '') + '</li>').join('')
        : '<li>Aucun module branché pour l\'instant.</li>';
    majReglages();
    rubanSurCarte = !!etat.modules.find(m => m.surCarte);
    copierLedsCarte();
    majVivant();
    ajusterEchelle();
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
        if (!el) { bras.classList.remove('mv-tourne', 'inverse'); return ''; }
        const cadran = el.querySelector('.servo-cadran'), rotor = el.querySelector('.servo-rotor');
        const continu = cadran.classList.contains('continu');
        bras.classList.toggle('mv-tourne', continu);
        bras.classList.toggle('inverse', cadran.classList.contains('inverse'));
        bras.style.setProperty('--duree', rotor.style.getPropertyValue('--duree') || '2s');
        bras.style.transform = continu ? '' : rotor.style.transform;
        return el.querySelector('.servo-etat').textContent;
    },
    led(g, cle) {
        const el = $$('#grove-leds .led-broche').find(x => x.querySelector('.led-nom').textContent === cle);
        const eclat = el ? Number(el.querySelector('.led-pastille').style.opacity) || 0 : 0;
        g.querySelector('.mv-led').setAttribute('fill', eclat ? '#ff3b30' : '#8e2f2c');
        g.querySelector('.mv-halo').setAttribute('opacity', (eclat * 0.45).toFixed(2));
        if (!el) return '';
        const niveau = Number(el.querySelector('.led-val').textContent);
        return niveau === 0 ? 'éteinte' : niveau >= 1023 ? 'allumée' : 'luminosité ' + niveau;
    },
    ruban(g) {
        const leds = $$('#grove-ruban .grove-led');
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
        g.querySelector('.mv-voyant').setAttribute('fill', ferme ? '#ff3b30' : '#5a1d1d');
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
    lcdrgb: g => LECTEURS.lcd(g),
    '4d'(g) {
        const ecran = $('grove-4digit-ecran'), cible = g.querySelector('.mv-4d');
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
    pilote() { const z = $('grove-moteurs'); return z ? z.textContent.trim() : ''; },

    // Capteurs : la valeur reglee dans « Peripheriques » (curseurs, cases), avec son unite.
    ultrason: () => texteDe('grove-distance-val') + ' cm',
    lumiere: () => texteDe('grove-lumiere-val'),
    pot(g) {
        const v = Number(($('grove-pot') || {}).value || 512), repere = g.querySelector('.mv-pot');
        if (repere) repere.style.transform = `rotate(${(v / 1023 * 300 - 150).toFixed(1)}deg)`;
        return texteDe('grove-pot-val');
    },
    pir(g) {
        const vu = !!($('grove-pir') || {}).checked;
        g.querySelector('.mv-pir').setAttribute('fill', vu ? '#ffe08a' : '#f4f4f4');
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
    gestes() { const l = $('grove-geste'); return l && l.selectedOptions[0] ? l.selectedOptions[0].textContent.trim() : ''; },
    rtc() { const z = $('grove-rtc'); return z ? z.textContent.trim().replace(/(\d{2}:\d{2}:\d{2})(?=\d)/, '$1 · ') : ''; },
    bouton(g) {
        const enfonce = boutonEnfonce || !!($('grove-bouton-maintenu') || {}).checked;
        g.querySelector('.mv-capuchon').setAttribute('fill', enfonce ? '#1a1a1a' : '#3a3a3a');
        g.querySelector('.mv-capuchon').setAttribute('r', enfonce ? 9 : 11);
        return enfonce ? 'appuyé' : 'relâché';
    },
    joystick(g) {
        const x = Number(($('grove-jx') || {}).value || 512), y = Number(($('grove-jy') || {}).value || 512);
        const enfonce = !!($('grove-jbtn') || {}).checked, manette = g.querySelector('.mv-manette');
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
    } else if (g.dataset.vivant === 'joystick') {
        const caseBouton = $('grove-jbtn');
        if (!caseBouton || caseBouton.checked === enfonce) return;
        caseBouton.checked = enfonce;
        caseBouton.dispatchEvent(new Event('change', { bubbles: true }));
    }
    majVivant();
}
function installerAppuis() {
    svgBas.addEventListener('pointerdown', e => {
        const g = e.target.closest('.montage-appui');
        if (!g) return;
        e.preventDefault();
        appuyerModule(g, true);
        const relacher = () => { appuyerModule(g, false); document.removeEventListener('pointerup', relacher); document.removeEventListener('pointercancel', relacher); };
        document.addEventListener('pointerup', relacher);
        document.addEventListener('pointercancel', relacher);
    });
    // Clavier : Espace ou Entree maintenus, comme un vrai bouton.
    svgBas.addEventListener('keydown', e => {
        const g = e.target.closest && e.target.closest('.montage-appui');
        if (g && (e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); appuyerModule(g, true); }
    });
    svgBas.addEventListener('keyup', e => {
        const g = e.target.closest && e.target.closest('.montage-appui');
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

function colonneAssezLarge() {
    if (!conteneur) return false;
    const st = getComputedStyle(conteneur);
    const largeur = conteneur.clientWidth - parseFloat(st.paddingLeft) - parseFloat(st.paddingRight);
    return largeur >= LARGEUR_COLONNE - (mode === 'colonne' ? MARGE_COLONNE : 0);
}

/** Place la carte, la scene et le choix de la carte d'extension selon le mode voulu. */
function appliquerMode() {
    const carte = $('microbit-board'), cadreCarte = $('carte-cadre'), cadreScene = scene.parentElement;
    if (!carte) return;
    const enColonne = utile && colonneAssezLarge();
    const voulu = utile && grandDemande ? 'grand' : enColonne ? 'colonne' : 'carte';
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
        // Scene et choix de la carte : dans la colonne, ou dans l'en-tete de la vue agrandie.
        if (voulu === 'grand') {
            zoneGrand.appendChild(cadreScene);
            enteteGrand.insertBefore(choixAuto, fermer);
            enteteGrand.insertBefore(choix, choixAuto);
        } else if (voulu === 'colonne') {
            zoneColonne.appendChild(cadreScene);
            outilsColonne.insertBefore(choix, agrandir);
            outilsColonne.insertBefore(choixAuto, agrandir);
        }
    }
    // Ce que montre la colonne : la carte seule, le montage, ou un rappel quand il est agrandi.
    panneau.hidden = mode !== 'grand';
    colonne.hidden = !(mode === 'colonne' || (mode === 'grand' && enColonne));
    colonne.classList.toggle('agrandi', mode === 'grand');
    console_.classList.toggle('montage-en-colonne', !colonne.hidden);
    cadreCarte.classList.toggle('montage-carte-absente', mode === 'grand' && !enColonne);
    bouton.hidden = !(utile && !enColonne);
    bouton.setAttribute('aria-expanded', String(mode === 'grand'));
    bouton.textContent = mode === 'grand' ? '🔌 Fermer le montage' : '🔌 Voir le montage';
    caseAgrandir.checked = mode === 'grand';
    placerZoom();
    majReglages();
    if (voulu !== ancien) {
        if (voulu === 'grand') fermer.focus();
        else if (ancien === 'grand') (voulu === 'colonne' ? caseAgrandir : bouton).focus();
        if (voulu !== 'carte') { Blockly.svgResize(window.workspace); requestAnimationFrame(() => redessiner()); }
        else Blockly.svgResize(window.workspace);
    }
}

function ouvrirGrand(ouvrir) {
    grandDemande = ouvrir;
    appliquerMode();
}

function installer() {
    if (!panneau || !bouton || !colonne || !caseAgrandir || !window.workspace) return false;
    bouton.addEventListener('click', () => ouvrirGrand(mode !== 'grand'));
    fermer.addEventListener('click', () => ouvrirGrand(false));
    caseAgrandir.addEventListener('change', () => ouvrirGrand(caseAgrandir.checked));
    installerZoom();
    if (choix) {
        const radio = choix.querySelector(`input[value="${choixCarte()}"]`);
        if (radio) radio.checked = true;
        choix.addEventListener('change', e => {
            try { localStorage.setItem(CLE_CARTE, e.target.value); } catch (erreur) { /* choix oublie au rechargement */ }
            redessiner();
        });
    }
    document.addEventListener('keydown', e => { if (mode === 'grand' && e.key === 'Escape') { e.preventDefault(); ouvrirGrand(false); } });
    window.workspace.addChangeListener(e => {
        if (e.isUiEvent) return;
        clearTimeout(attente);
        attente = setTimeout(redessiner, 150);
    });
    // Colonne redimensionnee (poignee, fenetre) : montage sur place ou carte seule, puis mise a l'echelle.
    new ResizeObserver(() => { appliquerMode(); ajusterEchelle(); }).observe(conteneur);
    new ResizeObserver(ajusterEchelle).observe(zoneGrand);
    const ruban = $('grove-ruban');
    if (ruban) new MutationObserver(() => { if (mode !== 'carte' && rubanSurCarte) copierLedsCarte(); })
        .observe(ruban, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    // Actionneurs en direct : lecture periodique tant que le montage est visible (l'OLED est une toile, sans
    // mutation a observer).
    setInterval(() => { if (mode !== 'carte' && document.visibilityState === 'visible') majVivant(); }, 200);
    installerAppuis();
    redessiner();
    return true;
}

// un.js cree l'espace de travail : on attend qu'il existe (une minute au plus, onglet visible). Minuterie et non
// requestAnimationFrame : un onglet en arriere-plan (ouvert depuis le Lanceur, par exemple) suspend les images, et la
// vue montage ne s'installait alors jamais ; une minuterie continue, ralentie, et rattrape des que l'onglet s'affiche.
(function attendre(essais) {
    if (!installer() && essais > 0) setTimeout(() => attendre(essais - 1), 50);
})(1200);
