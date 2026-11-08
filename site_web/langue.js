/* ══════════════════════════════════════════════════════════════════════════
   langue.js : EasyBloc micro:bit en français ou en anglais (étape 9, nov. 2026)
   Adapté de r4-langue.js (modèle EasyBloc R4 WiFi).

   - La langue se choisit avec le drapeau, à droite du menu « Aide » ; le choix
     est retenu sur le PC (localStorage « easybloc.langue »).
   - Le français reste la langue du code : chaque texte français sert de clé au
     dictionnaire anglais (langue-en.js, chargé juste avant). Un texte absent du
     dictionnaire reste en français.
   - tr('texte', { nom: … }) : traduit un texte du code ; {nom} est remplacé.
   - traduirePage(element) : traduit les textes fixes d'un morceau de page (textes,
     bulles title, placeholder, aria-label). Un élément marqué data-i18n="cle"
     reçoit tout son contenu HTML depuis DICO_EN['html:cle'].
   - Les textes tapés par l'élève (noms, messages, textes affichés) ne sont jamais
     traduits : les champs de saisie et les éléments [data-i18n-non] sont exclus.
   - Changer de langue recharge la page. Le programme affiché passe d'une langue à
     l'autre par sessionStorage (même onglet), effacé dès sa relecture : rien n'est
     conservé ensuite (RGPD).
   - Blockly : sa traduction anglaise (lib/blockly/msg/en.js, enregistrée dans le
     logiciel, anglais américain) est lue avant la française (MSG_EN) ; on la remet
     en place si la langue est l'anglais, avec l'orthographe britannique.
   ══════════════════════════════════════════════════════════════════════════ */
'use strict';
(function () {

const CLE_LANGUE = 'easybloc.langue';
const CLE_REPRISE = 'easybloc.repriseLangue';

window.LANGUE = (function () {
    try { return localStorage.getItem(CLE_LANGUE) === 'en' ? 'en' : 'fr'; } catch (e) { return 'fr'; }
})();
document.documentElement.lang = window.LANGUE;
const anglais = window.LANGUE === 'en';
const D = () => window.DICO_EN || {};
const a = s => Object.prototype.hasOwnProperty.call(D(), s);

/* Clés aux espaces resserrés : un long texte du code (visites guidées…) garde ses
   retours à la ligne et son indentation ; on le retrouve quand même. */
let clesResserrees = null;
const resserrer = t => String(t).replace(/\s+/g, ' ').trim();

/** Traduit un texte du code ; vars remplace les {repères}. */
window.tr = function (texte, vars) {
    let s = texte;
    if (anglais && typeof texte === 'string') {
        if (a(texte)) s = D()[texte];
        else if (/\s\s|\n/.test(texte)) {
            if (!clesResserrees) {
                clesResserrees = {};
                Object.keys(D()).forEach(k => { clesResserrees[resserrer(k)] = D()[k]; });
            }
            const r = resserrer(texte);
            if (Object.prototype.hasOwnProperty.call(clesResserrees, r)) s = clesResserrees[r];
        }
    }
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
    return s;
};

/* Messages dont une partie change : les clés qui contiennent des repères {x}
   deviennent des motifs, essayés quand le texte n'a pas de traduction exacte. */
let motifs = null;
/* Parties variables venant d'EasyBloc (sens, type…) : traduites à leur tour. Les
   autres (texte de l'élève, nom de fichier…) jamais. */
const VARIABLES_TRADUITES = ['pos', 'sens', 'e', 'g', 'axe', 'role', 'erreur', 'raison', 'type', 'conseil', 'rien'];
function construireMotifs() {
    motifs = [];
    Object.keys(D()).forEach(cle => {
        if (cle.indexOf('{') < 0 || cle.indexOf('html:') === 0) return;
        const noms = [];
        const source = cle.replace(/[.*+?^$()|[\]\\]/g, '\\$&')
            .replace(/\{(\w+)\}/g, (m, n) => { noms.push(n); return '([\\s\\S]*?)'; });
        if (!source.replace(/\(\[\\s\\S\]\*\?\)/g, '').trim()) return;   // un motif fait seulement de repères : jamais
        motifs.push({ re: new RegExp('^' + source + '$'), noms, cle, fixe: cle.replace(/\{\w+\}/g, '').length });
    });
    // Le motif le plus precis (le plus de texte fixe) d'abord : « {n} · {e} » ne doit pas masquer
    // « {n}/{t} exercices · {e} / {s} étoiles ».
    motifs.sort((p, q) => q.fixe - p.fixe);
}

/** Traduit un message complet (console, fenêtre du navigateur…) : texte exact, sinon
    motif à repères. Les puces et préfixes du début (« // », « • », espaces) restent. */
window.trTexte = function (s) {
    if (!anglais || typeof s !== 'string' || !s) return s;
    const m = s.match(/^([\s\/•›…·-]*)([\s\S]*?)(\s*)$/);
    const debut = m[1], coeur = m[2], fin = m[3];
    if (!coeur) return s;
    if (a(coeur)) return debut + D()[coeur] + fin;
    if (!motifs) construireMotifs();
    for (const p of motifs) {
        const r = coeur.match(p.re);
        if (!r) continue;
        const vars = {};
        p.noms.forEach((n, i) => {
            const v = r[i + 1];
            vars[n] = (VARIABLES_TRADUITES.indexOf(n) >= 0 && a(v)) ? D()[v] : v;
        });
        return debut + window.tr(p.cle, vars) + fin;
    }
    return s;
};

/* Les fenêtres du navigateur passent aussi par la traduction */
if (anglais) {
    ['alert', 'confirm', 'prompt'].forEach(nom => {
        const original = window[nom];
        window[nom] = function (message) {
            const args = Array.prototype.slice.call(arguments);
            args[0] = window.trTexte(message);
            return original.apply(window, args);
        };
    });
}

/* Blockly en anglais britannique : msg/en.js est écrit en anglais américain */
const BRITANNIQUE = [
    [/\bcolor/g, 'colour'], [/\bColor/g, 'Colour'], [/\bCOLOR/g, 'COLOUR'],
    [/\bcanceled\b/g, 'cancelled'], [/\bCanceled\b/g, 'Cancelled'],
    [/\bcenter/g, 'centre'], [/\bCenter/g, 'Centre'],
    [/\bbehavior/g, 'behaviour'], [/\bBehavior/g, 'Behaviour'],
];
if (anglais && window.MSG_EN && window.Blockly) {
    Object.keys(window.MSG_EN).forEach(cle => {
        let v = window.MSG_EN[cle];
        if (typeof v === 'string') BRITANNIQUE.forEach(([motif, uk]) => { v = v.replace(motif, uk); });
        Blockly.Msg[cle] = v;
    });
}

/* ── Blocs : surcouche de traduction (étape 9c) ───────────────────────────────
   Les définitions des blocs restent en français. Au moment où Blockly pose un champ
   dans un bloc, son libellé, les textes de ses menus déroulants et la bulle d'aide du
   bloc passent par tr(). Les VALEURS des menus ne changent pas : le code produit et un
   programme enregistré sont les mêmes dans les deux langues. Les champs de saisie
   (texte tapé par l'élève, nombres) ne sont jamais traduits. Les titres des groupes du
   tiroir (étiquettes de la boîte à outils) sont traduits quand elle est posée. */
if (anglais && window.Blockly) {
    const traduireOptions = options => Array.isArray(options)
        ? options.map(o => (Array.isArray(o) && typeof o[0] === 'string') ? [window.tr(o[0]), o[1]] : o) : options;
    // eleve : menus dynamiques des blocs IA = noms des classes choisis par l'eleve, jamais traduits (sauf « autre nom… »)
    const traduireChamp = (champ, eleve) => {
        if (!champ || typeof champ === 'string') return typeof champ === 'string' ? window.tr(champ) : champ;
        if (Blockly.FieldDropdown && champ instanceof Blockly.FieldDropdown) {
            const g = champ.menuGenerator_;
            if (typeof g === 'function') champ.menuGenerator_ = function () {
                const options = g.apply(this, arguments);
                return eleve ? options.map(o => (Array.isArray(o) && o[0] === '✎ autre nom…') ? [window.tr(o[0]), o[1]] : o) : traduireOptions(options);
            };
            else if (Array.isArray(g)) champ.menuGenerator_ = traduireOptions(g);
            try { champ.setValue(champ.getValue()); } catch (e) { /* texte affiche mis a jour au prochain rendu */ }
        } else if (Blockly.FieldLabel && champ instanceof Blockly.FieldLabel) {
            const v = champ.getValue();
            if (typeof v === 'string' && v) { const t = window.tr(v); if (t !== v) champ.setValue(t); }
        }
        return champ;
    };
    const Entree = (Blockly.inputs && Blockly.inputs.Input) || Blockly.Input;
    if (Entree && Entree.prototype.insertFieldAt) {
        const inserer = Entree.prototype.insertFieldAt;
        Entree.prototype.insertFieldAt = function (index, champ, nom) {
            const bloc = this.sourceBlock || this.sourceBlock_;
            return inserer.call(this, index, traduireChamp(champ, !!(bloc && /^ia_/.test(bloc.type))), nom);
        };
    }
    const bulle = Blockly.Block.prototype.setTooltip;
    Blockly.Block.prototype.setTooltip = function (texte) {
        if (typeof texte === 'string') texte = window.tr(texte);
        else if (typeof texte === 'function') { const f = texte; texte = function () { const r = f.apply(this, arguments); return typeof r === 'string' ? window.tr(r) : r; }; }
        return bulle.call(this, texte);
    };
    // Avertissements des blocs (triangle jaune)
    if (Blockly.BlockSvg && Blockly.BlockSvg.prototype.setWarningText) {
        const avertir = Blockly.BlockSvg.prototype.setWarningText;
        Blockly.BlockSvg.prototype.setWarningText = function (texte, id) {
            return avertir.call(this, typeof texte === 'string' ? window.trTexte(texte) : texte, id);
        };
    }
    // Étiquettes de groupes du tiroir (« kind: label ») : traduites quand la boîte à outils est posée
    const traduireToolbox = tb => {
        const visiter = n => {
            if (Array.isArray(n)) n.forEach(visiter);
            else if (n && typeof n === 'object') {
                if ((n.kind === 'label' || n.kind === 'button') && typeof n.text === 'string') n.text = window.tr(n.text);
                if (n.contents) visiter(n.contents);
            }
        };
        if (tb && typeof tb === 'object') visiter(tb.contents || tb);
        return tb;
    };
    const injecter = Blockly.inject;
    Blockly.inject = function (cible, options) {
        if (options && options.toolbox) traduireToolbox(options.toolbox);
        return injecter.call(this, cible, options);
    };
    if (Blockly.WorkspaceSvg) {
        const majToolbox = Blockly.WorkspaceSvg.prototype.updateToolbox;
        Blockly.WorkspaceSvg.prototype.updateToolbox = function (tb) { return majToolbox.call(this, traduireToolbox(tb)); };
    }
}

/* Jamais traduits par traduirePage : scripts, styles, Blockly, champs de saisie. */
// Zones ou s'affichent des textes de l'eleve (console, ecran LCD, noms des classes de l'IA, nom du programme) : jamais traduites.
const EXCLUS = 'script, style, textarea, .blocklySvg, .blocklyFlyout, .blocklyWidgetDiv, [data-i18n-non], '
             + '#console-sortie, #grove-lcd, .ia-classes, .ia-imm-vignettes, #nom-fichier';
const ATTRIBUTS = ['title', 'placeholder', 'aria-label', 'alt', 'data-titre'];

/** Traduit les textes fixes d'un morceau de page (rien à faire en français). */
window.traduirePage = function (racine) {
    if (!anglais || !racine) return;
    racine.querySelectorAll && racine.querySelectorAll('[data-i18n]').forEach(el => {
        const cle = 'html:' + el.getAttribute('data-i18n');
        if (a(cle)) el.innerHTML = D()[cle];
    });
    const marcheur = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT, {
        acceptNode: n => {
            const p = n.parentElement;
            if (!p || p.closest(EXCLUS)) return NodeFilter.FILTER_REJECT;
            return /\S/.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        },
    });
    const noeuds = [];
    while (marcheur.nextNode()) noeuds.push(marcheur.currentNode);
    noeuds.forEach(n => {
        const v = n.nodeValue, cle = v.replace(/\s+/g, ' ').trim();
        const t = window.trTexte(cle);
        if (t === cle) return;
        n.nodeValue = v.match(/^\s*/)[0] + t + v.match(/\s*$/)[0];
    });
    const elements = [racine].concat(racine.querySelectorAll ? [...racine.querySelectorAll('*')] : []);
    elements.forEach(el => {
        if (!el.getAttribute || el.closest(EXCLUS)) return;
        ATTRIBUTS.forEach(at => {
            const v = el.getAttribute(at);
            if (!v) return;
            const t = window.trTexte(v.trim());
            if (t !== v.trim()) el.setAttribute(at, t);
        });
    });
};

/* Textes posés ou changés par le code après le chargement (fenêtres, messages d'état,
   simulation…) : un observateur les traduit au fil de l'eau, dans toute la page sauf
   Blockly et les champs de saisie. */
if (anglais) {
    const OPTIONS_OBS = { childList: true, subtree: true, characterData: true,
                          attributes: true, attributeFilter: ['title', 'placeholder', 'aria-label'] };
    const traduireNoeud = n => {
        if (n.nodeType === 3) {
            const p = n.parentElement;
            if (!p || p.closest(EXCLUS) || !/\S/.test(n.nodeValue)) return;
            const v = n.nodeValue, cle = v.replace(/\s+/g, ' ').trim(), t = window.trTexte(cle);
            if (t !== cle) n.nodeValue = v.match(/^\s*/)[0] + t + v.match(/\s*$/)[0];
        } else if (n.nodeType === 1 && !n.closest(EXCLUS)) window.traduirePage(n);
    };
    const obs = new MutationObserver(mutations => {
        obs.disconnect();   // nos propres changements ne doivent pas relancer l'observateur
        mutations.forEach(m => {
            if (m.type === 'characterData') traduireNoeud(m.target);
            else if (m.type === 'attributes') { if (m.target.closest && !m.target.closest(EXCLUS)) window.traduirePage(m.target); }
            else m.addedNodes.forEach(traduireNoeud);
        });
        obs.observe(document.body, OPTIONS_OBS);
    });
    window.addEventListener('DOMContentLoaded', () => {
        window.traduirePage(document.body);
        document.title = window.trTexte(document.title);
        // Nom du programme : son texte (celui de l'eleve) n'est jamais traduit, mais son nom pour les lecteurs d'ecran oui
        const nomFichier = document.getElementById('nom-fichier');
        if (nomFichier) nomFichier.setAttribute('aria-label', window.tr('Nom du fichier'));
        obs.observe(document.body, OPTIONS_OBS);
    });
}

/* ── Le bouton drapeau ─────────────────────────────────────────────────── */
let numeroDrapeau = 0;
/** Drapeau dessiné en SVG (pas d'émoji) : 'fr' = France, 'en' = Royaume-Uni. */
function drapeau(langue) {
    if (langue === 'fr') {
        return '<svg class="drapeau" viewBox="0 0 3 2" aria-hidden="true">'
            + '<rect width="1" height="2" fill="#0055A4"/><rect x="1" width="1" height="2" fill="#FFFFFF"/>'
            + '<rect x="2" width="1" height="2" fill="#EF4135"/></svg>';
    }
    const n = ++numeroDrapeau;   // identifiants uniques : le drapeau paraît deux fois
    return '<svg class="drapeau" viewBox="0 0 60 30" aria-hidden="true">'
        + `<clipPath id="uk-a${n}"><path d="M0,0 v30 h60 v-30 z"/></clipPath>`
        + `<clipPath id="uk-b${n}"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>`
        + `<g clip-path="url(#uk-a${n})"><path d="M0,0 v30 h60 v-30 z" fill="#012169"/>`
        + '<path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" stroke-width="6"/>'
        + `<path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#uk-b${n})" stroke="#C8102E" stroke-width="4"/>`
        + '<path d="M30,0 v30 M0,15 h60" stroke="#FFFFFF" stroke-width="10"/>'
        + '<path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/></g></svg>';
}
const LANGUES = [['fr', 'Français'], ['en', 'English']];   // chaque nom dans sa propre langue

function construireBoutonLangue() {
    const bouton = document.getElementById('btn-langue');
    const menu = document.getElementById('menu-langue');
    if (!bouton || !menu) return;
    const nom = LANGUES.find(l => l[0] === window.LANGUE)[1];
    bouton.innerHTML = drapeau(window.LANGUE) + ' ▾';
    bouton.title = window.tr('Langue : {nom}', { nom });
    bouton.setAttribute('aria-label', window.tr('Langue : {nom}', { nom }));
    menu.innerHTML = '';
    LANGUES.forEach(([code, libelle]) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.lang = code;
        b.setAttribute('data-i18n-non', '');   // chaque langue garde son propre nom
        b.innerHTML = drapeau(code) + '<span>' + libelle + '</span>';
        if (code === window.LANGUE) b.classList.add('choisi');
        b.addEventListener('click', () => changerLangue(code));
        menu.appendChild(b);
    });
}

/** Change de langue : le programme affiché est gardé le temps du rechargement. */
function changerLangue(code) {
    if (code === window.LANGUE) return;
    try { localStorage.setItem(CLE_LANGUE, code); } catch (e) { /* navigation privée : la langue ne sera pas retenue */ }
    try {
        if (window.workspace && window.Blockly) {
            const champNom = document.getElementById('nom-fichier');
            sessionStorage.setItem(CLE_REPRISE, JSON.stringify({
                blocs: Blockly.serialization.workspaces.save(window.workspace),
                nom: champNom ? champNom.value : '',
                montage: typeof window.montageCommentaire === 'function' ? window.montageCommentaire() : '',
                ia: window.iaImmediat && window.iaImmediat.annexePy ? window.iaImmediat.annexePy() : '',
            }));
        }
    } catch (e) { /* sans reprise, la page se rouvre comme d'habitude */ }
    window.CHANGEMENT_LANGUE = true;   // pas d'alerte « quitter le site » : le programme est gardé
    location.reload();
}

/** Programme gardé lors d'un changement de langue (lu une seule fois, puis effacé). */
let reprise;
window.repriseLangue = function () {
    if (reprise !== undefined) return reprise;
    try {
        reprise = JSON.parse(sessionStorage.getItem(CLE_REPRISE) || 'null');
        sessionStorage.removeItem(CLE_REPRISE);
    } catch (e) { reprise = null; }
    if (!reprise || !reprise.blocs) reprise = null;
    return reprise;
};

window.addEventListener('DOMContentLoaded', () => {
    construireBoutonLangue();
    // Nom, places des modules et apprentissage de l'IA (modules chargés après un.js) : remis après le chargement
    const r = window.repriseLangue();
    if (!r) return;
    const champNom = document.getElementById('nom-fichier');
    if (champNom && r.nom) champNom.value = r.nom;
    if (r.montage && typeof window.montageRestaurer === 'function') {
        const m = r.montage.match(/^# montage : (\{.*\})/);
        try { if (m) window.montageRestaurer(JSON.parse(m[1])); } catch (e) { /* places perdues : rangement automatique */ }
    }
    if (r.ia && window.iaImmediat && window.iaImmediat.lireAnnexePy) {
        try { window.iaImmediat.lireAnnexePy(r.ia); } catch (e) { /* apprentissage perdu */ }
    }
});

})();
