/* ══════════════════════════════════════════════════════════════════════════
   EasyBloc micro:bit — générateur des fiches d'aide (étape 10, nov. 2026).
   Adapté de generer-fiches.js du modèle EasyBloc R4.

   À charger DANS l'éditeur, ouvert par le serveur de fabrication
   (outils/fiches/serveur-fiches.py, qui accepte POST /_generer-aide), après
   fiches-data.js (et fiches-data-en.js pour l'anglais). Puis, dans la console :
       await genererFiches();            // toutes les fiches de window.FICHES
       await genererFiches(['grove_pir']) // seulement celles-ci
   Langue des fiches = langue d'EasyBloc au moment de la génération (drapeau) :
   en anglais, les textes viennent de window.FICHES_EN et les fiches vont dans aide/en/.

   Pour chaque fiche : le programme d'exemple est chargé dans la zone de blocs,
   ses blocs sont dessinés en SVG (styles calculés figés), et la page
   aide/<type>.html est écrite. Choix du professeur (nov. 2026) : le dessin est
   rangé DANS la page (SVG en ligne) et non dans une image séparée ; il utilise
   donc la police Inter de la fiche, sans police à intégrer dans chaque image.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
'use strict';

var PROPS = ['fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray',
  'font-family', 'font-size', 'font-weight', 'font-style', 'text-anchor', 'dominant-baseline', 'opacity', 'color'];

function enAnglais() { return window.LANGUE === 'en'; }

var GABARIT = {
  fr: { lang: 'fr', aide: 'Aide - ', bloc: 'Bloc : ', sert: 'À quoi ça sert ?', util: 'Comment l\'utiliser ?',
        savoir: 'À savoir', exemple: 'Exemple', renvoie: 'Ce bloc renvoie ', alt: 'Programme d\'exemple',
        essayer: '▶ Essayer ce programme dans EasyBloc',
        mention: 'Fiche EasyBloc micro:bit - Technologie Services. Modifiable : éditez ce fichier HTML.',
        horsEasybloc: 'Ouvrez cette fiche depuis EasyBloc (clic droit sur un bloc, puis « Expliquer ce bloc ») pour essayer le programme.',
        racine: '' },
  en: { lang: 'en-GB', aide: 'Help - ', bloc: 'Block: ', sert: 'What is it for?', util: 'How to use it?',
        savoir: 'Good to know', exemple: 'Example', renvoie: 'This block returns ', alt: 'Example program',
        essayer: '▶ Try this program in EasyBloc',
        mention: 'EasyBloc micro:bit help sheet - Technologie Services. Editable: edit this HTML file.',
        horsEasybloc: 'Open this help sheet from EasyBloc (right-click a block, then ‘Explain this block’) to try the program.',
        racine: '../' },
};
function G() { return GABARIT[enAnglais() ? 'en' : 'fr']; }

var VALEURS = {
  nombre: 'un <b>nombre</b> (à brancher dans un autre bloc, là où on attend un nombre, ou dans un bloc de comparaison = &lt; &gt;)',
  logique: 'une réponse <b>vrai/faux</b> (à brancher directement dans un bloc « si », ou dans un bloc de la catégorie Logique)',
  texte: 'un <b>texte</b> (à afficher, ou à comparer à un autre texte avec le bloc « = » de la catégorie Logique)',
  liste: 'une <b>liste</b> (à ranger dans une variable avec le bloc « définir … à … »)',
};
var VALEURS_EN = {
  nombre: 'a <b>number</b> (to plug into another block, where a number is expected, or into a comparison block = &lt; &gt;)',
  logique: 'a <b>true/false</b> answer (to plug straight into an ‘if’ block, or into a block from the Logic category)',
  texte: 'a <b>text</b> (to show, or to compare with another text using the ‘=’ block of the Logic category)',
  liste: 'a <b>list</b> (to store in a variable with the ‘set … to …’ block)',
};

function attendre(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
function echapper(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function enrichir(s) { return echapper(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); }
function paragraphes(v) { return [].concat(v || []).map(function (p) { return '<p>' + enrichir(p) + '</p>'; }).join('\n'); }

/** Dessin SVG autonome des blocs de la zone de programmation (styles calculés figés). */
function capturerSVG(ws) {
  Blockly.svgResize(ws);
  var bbox = ws.getBlocksBoundingBox(), pad = 6;
  var x = bbox.left - pad, y = bbox.top - pad;
  var w = (bbox.right - bbox.left) + 2 * pad, h = (bbox.bottom - bbox.top) + 2 * pad;
  var canvas = ws.getCanvas();
  var clone = canvas.cloneNode(true);
  clone.removeAttribute('transform');
  var orig = canvas.querySelectorAll('*'), cl = clone.querySelectorAll('*');
  var aRetirer = [];
  for (var i = 0; i < orig.length; i++) {
    // Curseur clavier et marqueurs de Blockly (trait au-dessus d'un bloc) : pas dans l'image
    if (/blocklyCursor|blocklyMarker|blocklyInsertionMarker/.test(orig[i].getAttribute('class') || '')) { aRetirer.push(cl[i]); continue; }
    var cs = getComputedStyle(orig[i]), st = '';
    // Éléments masqués (coche d'une case non cochée…) : la classe retirée, ils réapparaîtraient
    if (cs.display === 'none' || cs.visibility === 'hidden') { aRetirer.push(cl[i]); continue; }
    for (var p = 0; p < PROPS.length; p++) { var v = cs.getPropertyValue(PROPS[p]); if (v) st += PROPS[p] + ':' + v + ';'; }
    cl[i].setAttribute('style', st);
    cl[i].removeAttribute('class');
    if (cl[i].id) cl[i].removeAttribute('id');
  }
  aRetirer.forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
  return '<svg class="aide-blocs" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + G().alt + '" viewBox="'
       + x + ' ' + y + ' ' + w + ' ' + h + '" width="' + Math.ceil(w) + '" height="' + Math.ceil(h) + '">'
       + new XMLSerializer().serializeToString(clone) + '</svg>';
}

/* Bouton « Essayer ce programme » : la fiche est affichée DANS EasyBloc (fenêtre intégrée) ; elle demande à la page
   EasyBloc de charger son exemple (window.parent.essayerExemple). Ouverte seule, elle explique quoi faire. */
function scriptEssayer() {
  return 'function essayerExemple(id) {\n'
    + '  var blocs = JSON.parse(document.getElementById(id || "programme-exemple").textContent);\n'
    + '  var easybloc = null;\n'
    + '  try { easybloc = window.parent && window.parent !== window && window.parent.essayerExemple; } catch (e) {}\n'
    + '  if (easybloc) window.parent.essayerExemple(blocs);\n'
    + '  else alert(' + JSON.stringify(G().horsEasybloc) + ');\n'
    + '}\n';
}

function couleurBloc(type) {
  try { var ws = new Blockly.Workspace(); var b = ws.newBlock(type); var c = b.getColour(); ws.dispose(); return c; }
  catch (e) { return '#6a2c91'; }
}

function ficheHTML(f, dessin, programme) {
  var g = G();
  return '<!doctype html>\n'
    + '<html lang="' + g.lang + '"><head><meta charset="utf-8">\n'
    + '<title>' + g.aide + echapper(f.titre) + '</title>\n'
    + '<link rel="stylesheet" href="' + g.racine + 'style-aide.css">\n'
    + '</head><body>\n'
    + '<div class="aide-entete" style="background:' + couleurBloc(f.t) + '">\n'
    + '<h1>' + echapper(f.titre) + '</h1><div class="aide-type">' + g.bloc + f.t + '</div>\n'
    + '</div>\n'
    + '<div class="aide-corps">\n'
    + '<h2>' + g.sert + '</h2>' + paragraphes(f.sert) + '\n'
    + (f.valeur ? '<p class="aide-valeur">' + g.renvoie + (enAnglais() ? VALEURS_EN : VALEURS)[f.valeur] + '.</p>\n' : '')
    // « Comment l'utiliser ? » et « À savoir » sont repliés à l'ouverture (clic sur le titre pour déplier).
    + '<details class="aide-repli"><summary><h2>' + g.util + '</h2></summary>' + paragraphes(f.util) + '\n</details>\n'
    + (f.savoir && f.savoir.length
        ? '<details class="aide-repli"><summary><h2>' + g.savoir + '</h2></summary><ul class="aide-savoir">'
          + f.savoir.map(function (s) { return '<li>' + enrichir(s) + '</li>'; }).join('') + '</ul></details>\n'
        : '')
    + '<h2>' + g.exemple + '</h2>\n'
    + '<div class="aide-exemple">' + dessin + '\n'
    + '<div class="aide-legende">' + enrichir(f.legende) + '</div>\n'
    + '<button class="aide-essayer" type="button" onclick="essayerExemple(\'programme-exemple\')">' + g.essayer + '</button></div>\n'
    + '<script type="application/json" id="programme-exemple">' + JSON.stringify(programme).replace(/</g, '\\u003c') + '</script>\n'
    + '<script>\n' + scriptEssayer() + '</script>\n'
    + '</div>\n'
    + '<div class="aide-pied">\n'
    + '<img class="aide-logo" src="' + g.racine + 'logo-technologie-services.png" alt="Technologie Services">\n'
    + '<span class="aide-mention">' + g.mention + '</span>\n'
    + '</div>\n'
    + '</body></html>\n';
}

async function ecrire(fichier, contenu) {
  var r = await fetch('/_generer-aide', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                                         body: JSON.stringify({ fichier: fichier, contenu: contenu }) });
  var j = await r.json();
  if (!j.ok) throw new Error(fichier + ' : ' + (j.erreur || 'erreur inconnue'));
}

/* Fiches anglaises : les textes libres de l'exemple (champs texte, variables) sont traduits par window.EXEMPLES_EN. */
var aTraduire = {};
function traduireTexte(t, ou) {
  if (t == null || !/[A-Za-zÀ-ÿ]/.test(t)) return t;
  var d = window.EXEMPLES_EN || {};
  if (Object.prototype.hasOwnProperty.call(d, t)) return d[t];
  aTraduire[t] = ou;
  return t;
}
function traduireAtelier(ws, ou) {
  var carte = ws.getVariableMap();
  // Blockly 10 : le nom d'une variable est la propriété « name » (getName() n'existe qu'à partir de Blockly 11)
  carte.getAllVariables().forEach(function (v) { var nom = v.getName ? v.getName() : v.name, n = traduireTexte(nom, ou); if (n !== nom) carte.renameVariable(v, n); });
  ws.getAllBlocks(false).forEach(function (b) {
    b.inputList.forEach(function (e) { e.fieldRow.forEach(function (c) {
      // Cases de texte, et nom de classe des blocs IA (menu qui accepte un texte libre)
      var texteLibre = (c instanceof Blockly.FieldTextInput && !(c instanceof Blockly.FieldNumber)) ||
                       (/^ia_/.test(b.type) && c.name === 'CLASSE');
      if (texteLibre && c.name) {
        var t = c.getValue(), n = traduireTexte(t, ou); if (n !== t) c.setValue(n);
      }
    }); });
  });
}

/* Programme d'exemple d'une fiche : le sien, sinon celui de l'aide d'avant (exemple validé, un.js). */
function programmeDe(f) {
  if (f.exemple) return f.exemple;
  // « exempleDe » renvoie d'abord à l'exemple écrit dans une autre fiche, puis à celui de l'aide d'avant
  var autre = f.exempleDe && (window.FICHES || []).filter(function (g) { return g.t === f.exempleDe && g.exemple; })[0];
  if (autre) return autre.exemple;
  var ex =window.aideBlocTest && window.aideBlocTest.EXEMPLES_BLOCS[f.exempleDe || f.t];
  if (!ex) throw new Error('pas de programme d\'exemple');
  return ex.blocs;
}

async function capturerExemple(ws, blocs, ou) {
  ws.clear();
  JSON.parse(JSON.stringify(blocs)).forEach(function (def) { Blockly.serialization.blocks.append(def, ws, { recordUndo: false }); });
  if (enAnglais()) traduireAtelier(ws, ou);
  // « répéter indéfiniment » s'accroche sous « au démarrage » (comme dans l'éditeur), pour l'image et pour « Essayer »
  var tetes = ws.getTopBlocks(true);
  var depart = tetes.filter(function (b) { return b.type === 'au_demarrage' && !b.getNextBlock(); })[0];
  var boucle = tetes.filter(function (b) { return b.type === 'boucle_infinie' && !b.getParent(); })[0];
  if (depart && boucle && depart.nextConnection && boucle.previousConnection) depart.nextConnection.connect(boucle.previousConnection);
  if (Blockly.renderManagement && Blockly.renderManagement.triggerQueuedRenders) Blockly.renderManagement.triggerQueuedRenders(ws);
  try { ws.cleanUp(); } catch (e) { /* rien */ }
  await attendre(60);
  var dessin = capturerSVG(ws);
  var programme = ws.getTopBlocks(true).map(function (b) { return Blockly.serialization.blocks.save(b, { addCoordinates: false }); });
  return { dessin: dessin, programme: programme };
}

window.genererFiches = async function (seulement) {
  if (!window.FICHES) { console.error('window.FICHES absent (fiches-data.js non chargé)'); return; }
  var ws = window.workspace;
  var anglais = enAnglais();
  if (anglais && !window.FICHES_EN) { console.error('window.FICHES_EN absent (fiches-data-en.js non chargé)'); return; }
  var dossier = anglais ? 'aide/en/' : 'aide/';
  var ok = [], ko = [], sansTraduction = [];
  aTraduire = {};
  for (var i = 0; i < window.FICHES.length; i++) {
    var f = window.FICHES[i];
    if (seulement && seulement.indexOf(f.t) < 0) continue;
    if (anglais) {
      var en = window.FICHES_EN[f.t];
      if (!en) { sansTraduction.push(f.t); continue; }
      f = Object.assign({}, f, en);
    }
    try {
      var r = await capturerExemple(ws, programmeDe(f), f.t);
      await ecrire(dossier + f.t + '.html', ficheHTML(f, r.dessin, r.programme));
      ok.push(f.t);
    } catch (e) { ko.push(f.t + ' -> ' + e.message); console.error('[ECHEC] ' + f.t, e); }
  }
  ws.clear();
  console.log('=== TERMINÉ : ' + ok.length + ' OK, ' + ko.length + ' en échec ===');
  return { ok: ok, ko: ko, sansTraduction: sansTraduction, aTraduire: Object.keys(aTraduire) };
};
})();
