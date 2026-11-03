// un.js : Interface complète avec Animation du Texte
import { genererFichierHexFinal, extraireCodeDepuisHex } from './deux.js';

try {
    // ==========================================
    // 0. OUTILS COMMUNS AUX GÉNÉRATEURS
    // ==========================================

    const P = Blockly.Python;

    // Le panneau Grove est câblé en section 5 ; tant que ce n'est pas fait, le
    // premier appel à updatePythonCode ne doit pas essayer de le rafraîchir.
    let panneauGrovePret = false;

    /**
     * Déclare `from microbit import *`.
     *
     * À appeler dans TOUT générateur qui produit du code touchant à l'API de la
     * carte (display, Image, button_a, accelerometer, compass, microphone,
     * SoundEvent, Sound, pin_logo, pinN, temperature(), running_time(), sleep(),
     * reset()). Sans cet import, le programme s'arrête au démarrage sur un
     * NameError.
     */
    function importerMicrobit() {
        P.definitions_['import_microbit'] = 'from microbit import *';
    }

    /** Déclare un module supplémentaire (audio, music, speech, radio, math, time, random). */
    function importerModule(nom) {
        P.definitions_['import_' + nom] = 'import ' + nom;
    }

    /** Une entrée convertie en texte : display et radio n'acceptent que des chaînes. */
    function versTexte(block, nomEntree, defaut) {
        return 'str(' + (P.valueToCode(block, nomEntree, P.ORDER_NONE) || (defaut || '""')) + ')';
    }

    // ==========================================
    // 1. CRÉATION DE TOUS LES BLOCS MICRO:BIT
    // ==========================================

    // ---------- Temps ----------

    Blockly.Blocks['attendre_temps'] = { init: function() {
        this.appendValueInput("TEMPS").setCheck("Number").appendField("attendre");
        this.appendDummyInput().appendField(new Blockly.FieldDropdown([
            ["seconde.s", "s"], ["milliseconde.s", "ms"]
        ]), "UNITE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
    }};
    P.forBlock['attendre_temps'] = function(block) {
        importerMicrobit();
        const temps = P.valueToCode(block, 'TEMPS', P.ORDER_ATOMIC) || '0';
        return block.getFieldValue('UNITE') === 's'
            ? 'sleep(' + temps + ' * 1000)\n'
            : 'sleep(' + temps + ')\n';
    };

    Blockly.Blocks['attendre_jusqua'] = { init: function() {
        this.appendValueInput("CONDITION").setCheck("Boolean").appendField("attendre jusqu'à");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
    }};
    P.forBlock['attendre_jusqua'] = function(block) {
        importerMicrobit();
        const condition = P.valueToCode(block, 'CONDITION', P.ORDER_ATOMIC) || 'False';
        return 'while not (' + condition + '):\n' + P.INDENT + 'sleep(10)\n';
    };

    // Champs répartis sur trois lignes : sur une seule, le bloc faisait 539 px
    // et imposait à lui seul la largeur du tiroir de la catégorie.
    Blockly.Blocks['repeter_toutes_les'] = { init: function() {
        this.appendDummyInput().appendField("répéter toutes les");
        this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(0, 0), "H").appendField("h")
            .appendField(new Blockly.FieldNumber(0, 0), "M").appendField("min");
        this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(1, 0), "S").appendField("s")
            .appendField(new Blockly.FieldNumber(0, 0), "MS").appendField("ms");
        this.appendStatementInput("DO").setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
    }};
    P.forBlock['repeter_toutes_les'] = function(block) {
        importerMicrobit();
        const h = block.getFieldValue('H') || 0;
        const m = block.getFieldValue('M') || 0;
        const s = block.getFieldValue('S') || 0;
        const ms = block.getFieldValue('MS') || 0;
        const total = (h * 3600000) + (m * 60000) + (s * 1000) + Number(ms);
        const branche = P.statementToCode(block, 'DO') || P.INDENT + 'pass\n';
        return 'while True:\n' + branche + P.INDENT + 'sleep(' + total + ')\n';
    };

    Blockly.Blocks['reset_chrono'] = { init: function() {
        this.appendDummyInput().appendField("remettre le chronomètre à 0");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
    }};
    P.forBlock['reset_chrono'] = function(block) {
        importerMicrobit();
        return '_timer_start = running_time()\n';
    };

    Blockly.Blocks['valeur_chrono'] = { init: function() {
        this.appendDummyInput().appendField("valeur du chronomètre en")
            .appendField(new Blockly.FieldDropdown([["(s)", "s"], ["(ms)", "ms"]]), "UNITE");
        this.setOutput(true, "Number");
        this.setColour(230);
    }};
    P.forBlock['valeur_chrono'] = function(block) {
        importerMicrobit();
        let code = '(running_time() - globals().get("_timer_start", 0))';
        if (block.getFieldValue('UNITE') === 's') code += ' / 1000';
        return [code, P.ORDER_ATOMIC];
    };

    // ---------- Affichage ----------

    Blockly.Blocks['afficher_valeur'] = { init: function() {
        this.appendValueInput("VALEUR").appendField("afficher");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
    }};
    P.forBlock['afficher_valeur'] = function(block) {
        importerMicrobit();
        return 'display.show(' + versTexte(block, 'VALEUR') + ')\n';
    };

    Blockly.Blocks['faire_defiler'] = { init: function() {
        this.appendValueInput("VALEUR").appendField("faire défiler");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
    }};
    P.forBlock['faire_defiler'] = function(block) {
        importerMicrobit();
        return 'display.scroll(' + versTexte(block, 'VALEUR') + ')\n';
    };

    Blockly.Blocks['afficher_icone'] = { init: function() {
        this.appendDummyInput().appendField("afficher l'icône")
            .appendField(new Blockly.FieldDropdown([
                ["Cœur", "HEART"], ["Heureux", "HAPPY"], ["Triste", "SAD"], ["Fantôme", "GHOST"]
            ]), "ICONE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
    }};
    P.forBlock['afficher_icone'] = function(block) {
        importerMicrobit();
        return 'display.show(Image.' + block.getFieldValue('ICONE') + ')\n';
    };

    Blockly.Blocks['afficher_image_matrice'] = { init: function() {
        this.appendDummyInput().appendField("afficher l'image");
        for (let y = 0; y < 5; y++) {
            const ligne = this.appendDummyInput();
            for (let x = 0; x < 5; x++) {
                ligne.appendField(new Blockly.FieldCheckbox("FALSE"), "LED_" + x + "_" + y);
            }
        }
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
    }};
    P.forBlock['afficher_image_matrice'] = function(block) {
        importerMicrobit();
        let image = "";
        for (let y = 0; y < 5; y++) {
            for (let x = 0; x < 5; x++) {
                image += block.getFieldValue("LED_" + x + "_" + y) === 'TRUE' ? "9" : "0";
            }
            if (y < 4) image += ":";
        }
        return 'display.show(Image("' + image + '"))\n';
    };

    Blockly.Blocks['effacer_ecran'] = { init: function() {
        this.appendDummyInput().appendField("effacer l'écran");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
    }};
    P.forBlock['effacer_ecran'] = function(block) {
        importerMicrobit();
        return 'display.clear()\n';
    };

    // print() : sur la carte, la sortie part sur le port serie USB ; dans le
    // simulateur, elle va dans la console de la barre du bas (voir CONSOLE).
    Blockly.Blocks['afficher_console'] = { init: function() {
        this.appendValueInput("VALEUR").appendField("afficher dans la console");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip("Écrit la valeur dans la console, sur une nouvelle ligne.");
    }};
    P.forBlock['afficher_console'] = function(block) {
        importerMicrobit();
        return 'print(' + (P.valueToCode(block, 'VALEUR', P.ORDER_NONE) || '""') + ')\n';
    };

    // ---------- IA : vision et son (Teachable Machine) ----------
    //
    // La reconnaissance tourne dans le NAVIGATEUR (camera / micro, panneau IA,
    // ia.js). La carte n'a pas de camera : elle recoit seulement le RESULTAT,
    // une ligne de texte par l'USB, que lit son `uart` (par defaut relie a
    // l'USB sur micro:bit) :
    //     IA:<vision|son>:<classe>:<confiance 0-100>\n
    // <classe> est le nom de la classe passe par slugIA() (minuscules, sans
    // accents, lettres/chiffres/_ seulement) : c'est aussi le nom du
    // gestionnaire genere on_ia_<type>_<classe>. Le navigateur envoie une ligne
    // a chaque CHANGEMENT de classe (classe vide quand la confiance retombe sous
    // le seuil), puis la RENVOIE toutes les 500 ms : un resultat qui n'a pas ete
    // revu depuis 1,5 s est oublie (navigateur ferme, cable debranche, ligne
    // perdue). Le simulateur recoit les memes lignes par un faux `uart`.
    // Genre "qr" (ia-immediat.js) : IA:qr:<texte>:100 tant qu'un QR code est vu ;
    // le texte peut contenir des « : », recolles ici. on_ia_qr_lu a chaque
    // nouveau code, _ia_qr_texte garde le dernier lu.

    /** Nom de classe -> identifiant sur : "Chat noir !" devient "chat_noir". */
    function slugIA(texte) {
        const s = String(texte == null ? '' : texte).normalize('NFD').replace(/[̀-ͯ]/g, '')
            .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        return s || 'x';
    }
    window.slugIA = slugIA;

    function piloteIA() {
        importerMicrobit();
        pilote('ia', [
            '_ia_dernier = {"vision": "", "son": "", "qr": ""}',
            '_ia_proba = {"vision": 0, "son": 0, "qr": 0}',
            '_ia_vu = {"vision": 0, "son": 0, "qr": 0}',
            '_ia_qr_texte = ""',
            '_ia_tampon = ""',
            'uart.init(115200)',
            '',
            'def _ia_traiter():',
            '    global _ia_tampon, _ia_qr_texte',
            '    while uart.any():',
            '        morceau = uart.read()',
            '        if morceau:',
            '            try:',
            '                _ia_tampon = _ia_tampon + str(morceau, "utf-8")',
            '            except Exception:',
            '                pass',
            '    if len(_ia_tampon) > 200 and "\\n" not in _ia_tampon:',
            '        _ia_tampon = ""                        # pas de ligne complete : on repart de zero',
            '    while "\\n" in _ia_tampon:',
            '        coupe = _ia_tampon.split("\\n", 1)',
            '        _ia_tampon = coupe[1]',
            '        try:',
            '            champs = coupe[0].strip().split(":")',
            '            if len(champs) >= 3 and champs[0] == "IA" and champs[1] in _ia_dernier:',
            '                genre = champs[1]',
            '                if genre == "qr" and len(champs) > 4:',
            '                    champs = [champs[0], genre, ":".join(champs[2:-1]), champs[-1]]',
            '                classe = champs[2]',
            '                _ia_vu[genre] = running_time()',
            '                _ia_proba[genre] = int(champs[3]) if len(champs) > 3 else 100',
            '                if classe != _ia_dernier[genre]:',
            '                    _ia_dernier[genre] = classe',
            '                    if genre == "qr":',
            '                        action = None',
            '                        if classe:',
            '                            _ia_qr_texte = classe',
            '                            action = globals().get("on_ia_qr_lu")',
            '                    else:',
            '                        action = globals().get("on_ia_" + genre + "_" + classe)',
            '                    if action:',
            '                        action()',
            '        except Exception:',
            '            pass',
            '    for genre in _ia_dernier:',
            '        if _ia_dernier[genre] != "" and running_time() - _ia_vu[genre] > 1500:',
            '            _ia_dernier[genre] = ""                # resultat trop ancien : plus rien de reconnu',
            '            _ia_proba[genre] = 0',
        ]);
    }

    const TYPES_IA = [["vision", "vision"], ["son", "son"]];

    // Choix de la classe : menu des classes connues du panneau IA (modele charge,
    // classes en creation, apprentissage immediat : window.iaClassesConnues, ia.js),
    // plus « ✎ autre nom… » pour un modele pas encore charge. La valeur reste un
    // texte libre : un programme ouvert avant le modele garde ses noms de classes,
    // meme absents du menu (Blockly refuserait sinon toute valeur hors du menu).
    const AUTRE_CLASSE_IA = '__autre__';
    class ChampClasseIA extends Blockly.FieldDropdown {
        constructor(valeur) {
            super(function () {
                const actuelle = this.getValue() || valeur;
                const bloc = this.getSourceBlock();
                const genre = bloc ? bloc.getFieldValue('TYPE') : 'vision';
                const noms = typeof window.iaClassesConnues === 'function' ? window.iaClassesConnues(genre) : [];
                const options = noms.map(n => [n, n]);
                if (!noms.some(n => slugIA(n) === slugIA(actuelle))) options.unshift([actuelle, actuelle]);
                options.push(['✎ autre nom…', AUTRE_CLASSE_IA]);
                return options;
            }, function (nouvelle) {
                if (nouvelle !== AUTRE_CLASSE_IA) return nouvelle;
                Blockly.dialog.prompt('Nom de la classe (comme dans le panneau IA) :', this.getValue() || '', reponse => {
                    if (reponse && reponse.trim()) this.setValue(reponse.trim());
                });
                return null;
            });
            this.setValue(valeur);
        }
        doClassValidation_(nouvelle) {
            return typeof nouvelle === 'string' && nouvelle.trim() ? nouvelle : null;
        }
        // Le menu en cache peut ignorer une valeur qui vient d'arriver : on le regenere.
        doValueUpdate_(nouvelle) {
            super.doValueUpdate_(nouvelle);
            this.selectedOption = this.getOptions(false).find(o => o[1] === nouvelle) || [nouvelle, nouvelle];
        }
    }

    Blockly.Blocks['ia_lorsque_reconnu'] = { init: function() {
        this.appendDummyInput().appendField("lorsque l'IA")
            .appendField(new Blockly.FieldDropdown(TYPES_IA), "TYPE")
            .appendField("reconnaît")
            .appendField(new ChampClasseIA("classe"), "CLASSE");
        this.appendStatementInput("DO").setCheck(null);
        this.setColour(330);
        this.setTooltip("S'exécute quand l'IA passe à cette classe. Choisissez la classe dans la liste (classes du " +
                        "panneau IA) ou « ✎ autre nom… » (accents et majuscules sans importance).");
    }};
    P.forBlock['ia_lorsque_reconnu'] = function(block) {
        piloteIA();
        return declarerGestionnaire('on_ia_' + block.getFieldValue('TYPE') + '_' + slugIA(block.getFieldValue('CLASSE')),
                                    P.statementToCode(block, 'DO'));
    };

    Blockly.Blocks['ia_classe_est'] = { init: function() {
        this.appendDummyInput().appendField("l'IA")
            .appendField(new Blockly.FieldDropdown(TYPES_IA), "TYPE")
            .appendField("reconnaît")
            .appendField(new ChampClasseIA("classe"), "CLASSE");
        this.setOutput(true, "Boolean");
        this.setColour(330);
        this.setTooltip("Vrai tant que la dernière classe reconnue par l'IA est celle-ci.");
    }};
    P.forBlock['ia_classe_est'] = function(block) {
        piloteIA();
        return ['(_ia_dernier["' + block.getFieldValue('TYPE') + '"] == "' + slugIA(block.getFieldValue('CLASSE')) + '")',
                P.ORDER_RELATIONAL];
    };

    Blockly.Blocks['ia_derniere_classe'] = { init: function() {
        this.appendDummyInput().appendField("dernière classe reconnue par l'IA")
            .appendField(new Blockly.FieldDropdown(TYPES_IA), "TYPE");
        this.setOutput(true, "String");
        this.setColour(330);
        this.setTooltip("Nom de la classe sans accents ni majuscules (« chat_noir »), ou texte vide si rien n'est reconnu.");
    }};
    P.forBlock['ia_derniere_classe'] = function(block) {
        piloteIA();
        return ['_ia_dernier["' + block.getFieldValue('TYPE') + '"]', P.ORDER_MEMBER];
    };

    Blockly.Blocks['ia_confiance'] = { init: function() {
        this.appendDummyInput().appendField("confiance de l'IA")
            .appendField(new Blockly.FieldDropdown(TYPES_IA), "TYPE")
            .appendField("(%)");
        this.setOutput(true, "Number");
        this.setColour(330);
        this.setTooltip("De 0 à 100 : certitude de la dernière classe reconnue.");
    }};
    P.forBlock['ia_confiance'] = function(block) {
        piloteIA();
        return ['_ia_proba["' + block.getFieldValue('TYPE') + '"]', P.ORDER_MEMBER];
    };

    // QR codes et codes-barres lus par la camera du PC (colonne « 🔳 QR codes », ia-immediat.js).
    Blockly.Blocks['ia_qr_lorsque_lu'] = { init: function() {
        this.appendDummyInput().appendField("lorsqu'un code QR est lu");
        this.appendStatementInput("DO").setCheck(null);
        this.setColour(330);
        this.setTooltip("S'exécute à chaque nouveau QR code ou code-barres lu par la caméra (panneau IA, « Lire les codes »).");
    }};
    P.forBlock['ia_qr_lorsque_lu'] = function(block) {
        piloteIA();
        return declarerGestionnaire('on_ia_qr_lu', P.statementToCode(block, 'DO'));
    };

    Blockly.Blocks['ia_qr_visible'] = { init: function() {
        this.appendDummyInput().appendField("un code QR est visible");
        this.setOutput(true, "Boolean");
        this.setColour(330);
        this.setTooltip("Vrai tant que la caméra voit un QR code ou un code-barres.");
    }};
    P.forBlock['ia_qr_visible'] = function(block) {
        piloteIA();
        return ['(_ia_dernier["qr"] != "")', P.ORDER_RELATIONAL];
    };

    Blockly.Blocks['ia_qr_texte'] = { init: function() {
        this.appendDummyInput().appendField("texte du dernier code QR lu");
        this.setOutput(true, "String");
        this.setColour(330);
        this.setTooltip("Texte du dernier QR code ou code-barres lu, sans accents (texte vide si aucun).");
    }};
    P.forBlock['ia_qr_texte'] = function(block) {
        piloteIA();
        return ['_ia_qr_texte', P.ORDER_ATOMIC];
    };

    // ---------- Blocs « lorsque … » ----------
    //
    // MicroPython n'a pas de système d'événements : ces blocs produisent une
    // fonction, que la boucle construite en section 4 vient appeler. Tout nom
    // `on_…` défini ici DOIT avoir son entrée correspondante dans GESTIONNAIRES,
    // sans quoi le bloc reste sans effet.

    /**
     * Declare une fonction de gestionnaire en tete de programme.
     *
     * Les blocs « lorsque ... » se posent n'importe ou, et Blockly genere les
     * blocs de premier niveau dans l'ordre de leur position. Une fonction posee
     * sous la boucle serait donc definie apres l'appel qui l'utilise, d'ou un
     * NameError a l'execution. En passant par definitions_, elle remonte avant
     * tout le code executable, quelle que soit la disposition des blocs.
     */
    function declarerGestionnaire(nom, corps) {
        const contenu = corps.replace(/\s+$/, '');
        P.definitions_['gestionnaire_' + nom] =
            'def ' + nom + '():' + '\n' + (contenu ? contenu : P.INDENT + 'pass');
        return '';
    }
    Blockly.Blocks['lorsque_bouton'] = { init: function() {
        this.appendDummyInput().appendField("lorsque le bouton")
            .appendField(new Blockly.FieldDropdown([["A", "a"], ["B", "b"], ["A+B", "ab"]]), "BOUTON")
            .appendField("est pressé");
        this.appendStatementInput("DO").setCheck(null);
        this.setColour(300);
    }};
    // Un declenchement par appui (comme MakeCode), pas a chaque tour tant que le bouton reste enfonce : sur la carte,
    // la scrutation par is_pressed() rappelait le gestionnaire en boucle (message radio envoye sans fin, bouton B
    // noye). A et B : was_pressed(), memorise par la carte. A+B : front montant de « les deux enfonces », qui
    // consomme aussi les appuis de A et de B pour ne pas declencher en plus « lorsque A » et « lorsque B ».
    P.forBlock['lorsque_bouton'] = function(block) {
        importerMicrobit();
        if (block.getFieldValue('BOUTON') === 'ab') {
            pilote('boutons', [
                '_boutons_ab_avant = [False]',
                '',
                'def _boutons_ab():',
                '    appuye = button_a.is_pressed() and button_b.is_pressed()',
                '    front = appuye and not _boutons_ab_avant[0]',
                '    _boutons_ab_avant[0] = appuye',
                '    if front:',
                '        button_a.was_pressed()',
                '        button_b.was_pressed()',
                '    return front',
            ]);
        }
        return declarerGestionnaire('on_button_pressed_' + block.getFieldValue('BOUTON'), P.statementToCode(block, 'DO'));
    };

    Blockly.Blocks['lorsque_geste'] = { init: function() {
        this.appendDummyInput().appendField("lorsque")
            .appendField(new Blockly.FieldDropdown([
                ["secouer", "shake"], ["logo vers le haut", "up"], ["logo vers le bas", "down"]
            ]), "GESTE");
        this.appendStatementInput("DO").setCheck(null);
        this.setColour(300);
    }};
    P.forBlock['lorsque_geste'] = function(block) {
        importerMicrobit();
        return declarerGestionnaire('on_gesture_' + block.getFieldValue('GESTE'), P.statementToCode(block, 'DO'));
    };

    Blockly.Blocks['lorsque_broche'] = { init: function() {
        this.appendDummyInput().appendField("lorsque la broche")
            .appendField(new Blockly.FieldDropdown([["P0", "pin0"], ["P1", "pin1"], ["P2", "pin2"]]), "BROCHE")
            .appendField("est")
            .appendField(new Blockly.FieldDropdown([["activée", "touched"], ["relachée", "released"]]), "ETAT");
        this.appendStatementInput("DO").setCheck(null);
        this.setColour(300);
    }};
    P.forBlock['lorsque_broche'] = function(block) {
        importerMicrobit();
        activerToucheCapacitive(block.getFieldValue('BROCHE'));
        return declarerGestionnaire('on_pin_' + block.getFieldValue('BROCHE') + '_' + block.getFieldValue('ETAT'), P.statementToCode(block, 'DO'));
    };

    Blockly.Blocks['lorsque_son_detecte'] = { init: function() {
        this.appendDummyInput().appendField("lorsque le son")
            .appendField(new Blockly.FieldDropdown([["bruyant", "LOUD"], ["faible", "QUIET"]]), "SON")
            .appendField("est detecté");
        this.appendStatementInput("DO").setCheck(null);
        this.setColour(300);
    }};
    P.forBlock['lorsque_son_detecte'] = function(block) {
        importerMicrobit();
        return declarerGestionnaire('on_sound_' + block.getFieldValue('SON'), P.statementToCode(block, 'DO'));
    };

    Blockly.Blocks['lorsque_logo'] = { init: function() {
        this.appendDummyInput().appendField("sur le logo")
            .appendField(new Blockly.FieldDropdown([["appuyé", "touched"], ["relaché", "released"]]), "ACTION");
        this.appendStatementInput("DO").setCheck(null);
        this.setColour(300);
    }};
    P.forBlock['lorsque_logo'] = function(block) {
        importerMicrobit();
        return declarerGestionnaire('on_logo_' + block.getFieldValue('ACTION'), P.statementToCode(block, 'DO'));
    };

    // ---------- Entrées / Sorties ----------

    /** Condition « bouton pressé », commune à deux blocs. */
    function conditionBouton(bouton) {
        if (bouton === 'a') return 'button_a.is_pressed()';
        if (bouton === 'b') return 'button_b.is_pressed()';
        return '(button_a.is_pressed() and button_b.is_pressed())';
    }

    /**
     * P0/P1/P2 (PAS le logo, qui a son propre capteur capacitif dedie) : par
     * defaut, is_touched() utilise une detection RESISTIVE sur la vraie
     * carte - il faut toucher la broche ET une broche GND en meme temps,
     * sinon rien ne se declenche. Le simulateur, lui, considere un simple
     * clic sur la broche comme "touchee", sans notion de circuit GND - d'ou
     * un ecart signale par l'utilisateur ("simulation fonctionne mais pas
     * le reel"). set_touch_mode(CAPACITIVE), disponible sur la carte V2,
     * fait qu'un seul doigt suffit sur la vraie carte aussi, comme dans le
     * simulateur. Appelee une seule fois par broche (P.definitions_ dedup
     * par cle), avant toute lecture de cette broche.
     */
    function activerToucheCapacitive(broche) {
        importerMicrobit();
        P.definitions_['touche_capacitive_' + broche] =
            broche + '.set_touch_mode(' + broche + '.CAPACITIVE)';
    }

    Blockly.Blocks['si_bouton_appuye'] = { init: function() {
        this.appendDummyInput().appendField("si le bouton")
            .appendField(new Blockly.FieldDropdown([["A", "a"], ["B", "b"], ["A+B", "ab"]]), "BOUTON")
            .appendField("est appuyé alors");
        this.appendStatementInput("DO").setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
    }};
    P.forBlock['si_bouton_appuye'] = function(block) {
        importerMicrobit();
        const branche = P.statementToCode(block, 'DO') || P.INDENT + 'pass\n';
        return 'if ' + conditionBouton(block.getFieldValue('BOUTON')) + ':\n' + branche;
    };

    Blockly.Blocks['si_logo_touche'] = { init: function() {
        this.appendDummyInput().appendField("si LOGO est touché alors");
        this.appendStatementInput("DO").setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
    }};
    P.forBlock['si_logo_touche'] = function(block) {
        importerMicrobit();
        const branche = P.statementToCode(block, 'DO') || P.INDENT + 'pass\n';
        return 'if pin_logo.is_touched():\n' + branche;
    };

    Blockly.Blocks['si_secoue_alors'] = { init: function() {
        this.appendDummyInput().appendField("si secoué alors");
        this.appendStatementInput("DO").setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
    }};
    P.forBlock['si_secoue_alors'] = function(block) {
        importerMicrobit();
        const branche = P.statementToCode(block, 'DO') || P.INDENT + 'pass\n';
        return 'if accelerometer.was_gesture("shake"):\n' + branche;
    };

    Blockly.Blocks['bouton_est_appuye'] = { init: function() {
        this.appendDummyInput().appendField("bouton")
            .appendField(new Blockly.FieldDropdown([["A", "a"], ["B", "b"], ["A+B", "ab"]]), "BOUTON")
            .appendField("est appuyé");
        this.setOutput(true, "Boolean");
        this.setColour(300);
    }};
    P.forBlock['bouton_est_appuye'] = function(block) {
        importerMicrobit();
        return [conditionBouton(block.getFieldValue('BOUTON')), P.ORDER_ATOMIC];
    };

    Blockly.Blocks['broche_est_pressee'] = { init: function() {
        this.appendDummyInput().appendField("broche")
            .appendField(new Blockly.FieldDropdown([["P0", "pin0"], ["P1", "pin1"], ["P2", "pin2"]]), "BROCHE")
            .appendField("est pressée");
        this.setOutput(true, "Boolean");
        this.setColour(300);
    }};
    P.forBlock['broche_est_pressee'] = function(block) {
        importerMicrobit();
        activerToucheCapacitive(block.getFieldValue('BROCHE'));
        return [block.getFieldValue('BROCHE') + '.is_touched()', P.ORDER_ATOMIC];
    };

    Blockly.Blocks['geste_est_actif'] = { init: function() {
        this.appendDummyInput().appendField("geste")
            .appendField(new Blockly.FieldDropdown([
                ["secouer", "shake"], ["logo vers le haut", "up"], ["logo vers le bas", "down"]
            ]), "GESTE")
            .appendField("est actif");
        this.setOutput(true, "Boolean");
        this.setColour(300);
    }};
    P.forBlock['geste_est_actif'] = function(block) {
        importerMicrobit();
        return ['accelerometer.is_gesture("' + block.getFieldValue('GESTE') + '")', P.ORDER_ATOMIC];
    };

    Blockly.Blocks['logo_est_touche'] = { init: function() {
        this.appendDummyInput().appendField("le logo est appuyé");
        this.setOutput(true, "Boolean");
        this.setColour(300);
    }};
    P.forBlock['logo_est_touche'] = function(block) {
        importerMicrobit();
        return ['pin_logo.is_touched()', P.ORDER_ATOMIC];
    };

    Blockly.Blocks['nombre_clics_bouton'] = { init: function() {
        this.appendDummyInput().appendField("nombre de clics du bouton")
            .appendField(new Blockly.FieldDropdown([["A", "a"], ["B", "b"]]), "BOUTON");
        this.setOutput(true, "Number");
        this.setColour(210);
    }};
    P.forBlock['nombre_clics_bouton'] = function(block) {
        importerMicrobit();
        const bouton = block.getFieldValue('BOUTON');
        // button_x.get_presses() est une lecture CONSOMMATRICE sur la vraie
        // carte : elle renvoie le nombre de clics depuis le DERNIER appel puis
        // se remet a zero. Utilisee telle quelle, « si nombre de clics == 10 »
        // ne peut quasiment jamais se declencher — a chaque tour de boucle,
        // l'appel remet le compteur a zero avant d'avoir pu en accumuler 10.
        // Signale par l'utilisateur : marchait dans le simulateur (corrige a
        // part, voir plus bas) mais jamais sur la vraie carte, ou le
        // programme tourne en continu et appelle donc get_presses() bien
        // plus souvent qu'un simple clic. Un compteur global qui CUMULE
        // (+=) au lieu de remplacer redonne le total cumule attendu par
        // l'utilisateur, identique en simulation et sur la vraie carte
        // puisque c'est le MEME code Python qui tourne dans les deux cas.
        P.definitions_['clics_' + bouton] =
            '_clics_' + bouton + ' = 0\n' +
            'def _lire_clics_' + bouton + '():\n' +
            P.INDENT + 'global _clics_' + bouton + '\n' +
            P.INDENT + '_clics_' + bouton + ' += button_' + bouton + '.get_presses()\n' +
            P.INDENT + 'return _clics_' + bouton;
        return ['_lire_clics_' + bouton + '()', P.ORDER_FUNCTION_CALL];
    };

    Blockly.Blocks['reinitialiser_microbit'] = { init: function() {
        this.appendDummyInput().appendField("[Micro:bit] réinitialiser la carte");
        this.setPreviousStatement(true, null);
        this.setColour(210);
    }};
    P.forBlock['reinitialiser_microbit'] = function(block) {
        importerMicrobit();
        return 'reset()\n';
    };

    // ---------- Capteurs ----------

    Blockly.Blocks['capteur_acceleration'] = { init: function() {
        this.appendDummyInput().appendField("accélération (mg)")
            .appendField(new Blockly.FieldDropdown([["x", "x"], ["y", "y"], ["z", "z"], ["force", "strength"]]), "AXIS");
        this.setOutput(true, "Number");
        this.setColour(300);
    }};
    P.forBlock['capteur_acceleration'] = function(block) {
        importerMicrobit();
        const axe = block.getFieldValue('AXIS');
        const code = axe === 'strength' ? 'accelerometer.get_strength()' : 'accelerometer.get_' + axe + '()';
        return [code, P.ORDER_ATOMIC];
    };

    Blockly.Blocks['capteur_luminosite'] = { init: function() {
        this.appendDummyInput().appendField("niveau d'intensité lumineuse");
        this.setOutput(true, "Number");
        this.setColour(300);
    }};
    P.forBlock['capteur_luminosite'] = function(block) {
        importerMicrobit();
        return ['display.read_light_level()', P.ORDER_ATOMIC];
    };

    Blockly.Blocks['capteur_boussole_direction'] = { init: function() {
        this.appendDummyInput().appendField("direction de la boussole (°)");
        this.setOutput(true, "Number");
        this.setColour(300);
    }};
    P.forBlock['capteur_boussole_direction'] = function(block) {
        importerMicrobit();
        return ['compass.heading()', P.ORDER_ATOMIC];
    };

    Blockly.Blocks['capteur_boussole_force'] = { init: function() {
        this.appendDummyInput().appendField("force magnétique (µT)")
            .appendField(new Blockly.FieldDropdown([["x", "x"], ["y", "y"], ["z", "z"], ["force", "strength"]]), "AXIS");
        this.setOutput(true, "Number");
        this.setColour(300);
    }};
    P.forBlock['capteur_boussole_force'] = function(block) {
        importerMicrobit();
        const axe = block.getFieldValue('AXIS');
        const code = axe === 'strength' ? 'compass.get_field_strength()' : 'compass.get_' + axe + '()';
        return [code, P.ORDER_ATOMIC];
    };

    Blockly.Blocks['capteur_boussole_calibrer'] = { init: function() {
        this.appendDummyInput().appendField("calibrer la boussole");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(300);
    }};
    P.forBlock['capteur_boussole_calibrer'] = function(block) {
        importerMicrobit();
        return 'compass.calibrate()\n';
    };

    Blockly.Blocks['capteur_temperature'] = { init: function() {
        this.appendDummyInput().appendField("température (° C)");
        this.setOutput(true, "Number");
        this.setColour(300);
    }};
    P.forBlock['capteur_temperature'] = function(block) {
        importerMicrobit();
        return ['temperature()', P.ORDER_ATOMIC];
    };

    Blockly.Blocks['capteur_rotation'] = { init: function() {
        this.appendDummyInput().appendField("rotation (°)")
            .appendField(new Blockly.FieldDropdown([["pitch", "pitch"], ["roll", "roll"]]), "AXIS");
        this.setOutput(true, "Number");
        this.setColour(300);
    }};
    P.forBlock['capteur_rotation'] = function(block) {
        importerMicrobit();
        importerModule('math');
        if (block.getFieldValue('AXIS') === 'pitch') {
            P.definitions_['def_pitch'] =
                'def get_pitch():\n' +
                '    x, y, z = accelerometer.get_values()\n' +
                '    return int(math.atan2(y, math.sqrt(x*x + z*z)) * 180 / math.pi)';
            return ['get_pitch()', P.ORDER_ATOMIC];
        }
        P.definitions_['def_roll'] =
            'def get_roll():\n' +
            '    x, y, z = accelerometer.get_values()\n' +
            '    return int(math.atan2(-x, z) * 180 / math.pi)';
        return ['get_roll()', P.ORDER_ATOMIC];
    };

    Blockly.Blocks['temps_execution'] = { init: function() {
        this.appendDummyInput().appendField("temps d'exécution")
            .appendField(new Blockly.FieldDropdown([["(ms)", "ms"], ["(micros)", "us"]]), "UNITE");
        this.setOutput(true, "Number");
        this.setColour(300);
    }};
    P.forBlock['temps_execution'] = function(block) {
        importerMicrobit();
        if (block.getFieldValue('UNITE') === 'ms') {
            return ['running_time()', P.ORDER_ATOMIC];
        }
        importerModule('time');
        return ['time.ticks_us()', P.ORDER_ATOMIC];
    };

    Blockly.Blocks['gamme_accelerometre'] = { init: function() {
        this.appendDummyInput().appendField("spécifier la gamme de l'acceleromètre")
            .appendField(new Blockly.FieldDropdown([["1g", "1"], ["2g", "2"], ["4g", "4"], ["8g", "8"]]), "GAMME");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(300);
    }};
    P.forBlock['gamme_accelerometre'] = function(block) {
        importerMicrobit();
        return 'accelerometer.set_range(' + block.getFieldValue('GAMME') + ')\n';
    };

    Blockly.Blocks['micro_intensite_son'] = { init: function() {
        this.appendDummyInput().appendField("niveau sonore");
        this.setOutput(true, "Number");
        this.setColour(300);
    }};
    P.forBlock['micro_intensite_son'] = function(block) {
        importerMicrobit();
        return ['microphone.sound_level()', P.ORDER_ATOMIC];
    };

    Blockly.Blocks['micro_definir_seuil'] = { init: function() {
        this.appendDummyInput().appendField("définit le seuil du son")
            .appendField(new Blockly.FieldDropdown([["bruyant", "LOUD"], ["faible", "QUIET"]]), "SON")
            .appendField("à");
        this.appendValueInput("SEUIL").setCheck("Number");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(300);
        this.setInputsInline(true);
    }};
    P.forBlock['micro_definir_seuil'] = function(block) {
        importerMicrobit();
        const seuil = P.valueToCode(block, 'SEUIL', P.ORDER_ATOMIC) || '128';
        return 'microphone.set_threshold(SoundEvent.' + block.getFieldValue('SON') + ', ' + seuil + ')\n';
    };

    // ---------- Actionneurs (audio) ----------

    Blockly.Blocks['audio_jouer'] = { init: function() {
        this.appendDummyInput().appendField("[Audio] jouer la musique")
            .appendField(new Blockly.FieldDropdown([
                ["Giggle", "GIGGLE"], ["Happy", "HAPPY"], ["Hello", "HELLO"],
                ["Sad", "SAD"], ["Twinkle", "TWINKLE"]
            ]), "SON");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(330);
    }};
    P.forBlock['audio_jouer'] = function(block) {
        importerMicrobit();          // `Sound` appartient au module microbit
        importerModule('audio');
        return 'audio.play(Sound.' + block.getFieldValue('SON') + ')\n';
    };

    Blockly.Blocks['audio_arreter'] = { init: function() {
        this.appendDummyInput().appendField("[Audio] arrêter la musique");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(330);
    }};
    P.forBlock['audio_arreter'] = function(block) {
        importerModule('audio');
        return 'audio.stop()\n';
    };

    Blockly.Blocks['music_jouer_melodie'] = { init: function() {
        this.appendDummyInput().appendField("[Music] jouer la mélodie")
            .appendField(new Blockly.FieldDropdown([
                ["Dadadadum", "DADADADUM"], ["Pirates", "PUNCHLINE"], ["Entertainer", "ENTERTAINER"]
            ]), "MELODY");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(330);
    }};
    P.forBlock['music_jouer_melodie'] = function(block) {
        importerModule('music');
        return 'music.play(music.' + block.getFieldValue('MELODY') + ')\n';
    };

    Blockly.Blocks['speech_dire'] = { init: function() {
        this.appendValueInput("TEXT").setCheck("String").appendField("[Speech] dire");
        this.appendDummyInput()
            .appendField("vitesse").appendField(new Blockly.FieldNumber(100, 0, 255), "SPEED");
        this.appendDummyInput()
            .appendField("hauteur").appendField(new Blockly.FieldNumber(100, 0, 255), "PITCH");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(330);
    }};
    P.forBlock['speech_dire'] = function(block) {
        importerModule('speech');
        const texte = P.valueToCode(block, 'TEXT', P.ORDER_ATOMIC) || '""';
        return 'speech.say(' + texte + ', speed=' + block.getFieldValue('SPEED') +
               ', pitch=' + block.getFieldValue('PITCH') + ')\n';
    };

    // ---------- Communication ----------

    Blockly.Blocks['radio_activer'] = { init: function() {
        this.appendDummyInput().appendField("allumer la radio");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
    }};
    P.forBlock['radio_activer'] = function(block) {
        importerModule('radio');
        return 'radio.on()\n';
    };

    // Pas de setCheck sur l'entrée : on veut pouvoir envoyer un nombre (une
    // température, un compteur). La conversion est faite par le générateur, car
    // radio.send() n'accepte que des chaînes.
    Blockly.Blocks['radio_envoyer_texte'] = { init: function() {
        this.appendValueInput("MESSAGE").appendField("envoyer msg radio");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
    }};
    P.forBlock['radio_envoyer_texte'] = function(block) {
        importerModule('radio');
        return 'radio.send(' + versTexte(block, 'MESSAGE') + ')\n';
    };

    // Bloc de demarrage : son contenu s'execute une fois, avant tout le reste.
    // Ni encoche du dessus ni du dessous — il vit seul, comme dans MakeCode.
    Blockly.Blocks['au_demarrage'] = { init: function() {
        this.appendDummyInput().appendField("Au démarrage");
        this.appendStatementInput("DO").setCheck(null);
        // Encoche du bas seulement (pas du haut) : "Au démarrage" reste
        // toujours le bloc le plus haut — rien ne s'accroche AU-DESSUS —
        // mais peut désormais s'emboîter avec "Répéter indéfiniment" en
        // dessous, comme dans MakeCode, plutôt que de rester deux blocs
        // simplement juxtaposés sans lien physique. Purement visuel : le
        // code généré ne change pas (l'ordre suivait déjà la position
        // verticale, voir readme.txt), c'est juste que la position devient
        // garantie par l'accrochage plutôt que laissée au hasard.
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip("Exécuté une seule fois au démarrage de la carte, avant les boucles.");
    }};
    P.forBlock['au_demarrage'] = function(block) {
        const branche = P.statementToCode(block, 'DO');
        if (!branche.trim()) return '';
        // statementToCode indente d'un cran ; ce code est de premier niveau,
        // on le remet donc a plat.
        return branche.replace(new RegExp('^' + P.INDENT, 'gm'), '');
    };

    // ---------- Radio ----------
    //
    // MicroPython n'envoie que du texte : radio.send(chaine). MakeCode, lui,
    // encode des paquets binaires types. Les deux ne s'entendent donc PAS sur
    // les ondes. On adopte une convention texte simple, lisible et symetrique :
    //   un nombre      -> "42"
    //   un couple      -> "temperature=21"
    //   une chaine     -> "bonjour"
    // La reception decide du type d'apres la forme du message recu.

    const COULEUR_RADIO = 120;

    function piloteRadio() {
        importerMicrobit();
        importerModule('radio');
        pilote('radio', [
            '_radio_dernier = ["", "", "", 0]   # texte, nom, valeur, force du signal',
            '',
            'def _radio_nombre(texte):',
            '    try:',
            '        return int(texte)',
            '    except:',
            '        pass',
            '    try:',
            '        return float(texte)',
            '    except:',
            '        return None',
            '',
            'def _radio_traiter():',
            '    paquet = radio.receive_full()',
            '    if paquet is None:',
            '        return',
            // receive_full() rend les octets bruts : radio.send() les fait preceder d'un en-tete de 3 octets
            // (sur la carte, le message s'affichait « ?salut »). receive() fait la meme chose : str(...)[3:].
            '    message = str(paquet[0][3:], "utf-8")',
            '    _radio_dernier[0] = message',
            '    _radio_dernier[3] = paquet[1]',
            '    g = globals()',
            '    if "=" in message:',
            '        nom, _, valeur = message.partition("=")',
            '        _radio_dernier[1] = nom',
            '        _radio_dernier[2] = valeur',
            '        if "on_radio_valeur" in g:',
            '            g["on_radio_valeur"]()',
            '            return',
            '    nombre = _radio_nombre(message)',
            '    if nombre is not None and "on_radio_nombre" in g:',
            '        g["on_radio_nombre"]()',
            '        return',
            '    if "on_radio_texte" in g:',
            '        g["on_radio_texte"]()',
        ]);
    }

    Blockly.Blocks['radio_groupe'] = { init: function() {
        this.appendValueInput("GROUPE").setCheck("Number").appendField("radio : définir le groupe");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_RADIO);
        this.setTooltip("De 0 à 255. Seules les cartes du même groupe s'entendent.");
    }};
    P.forBlock['radio_groupe'] = function(block) {
        piloteRadio();
        return 'radio.config(group=' + (P.valueToCode(block, 'GROUPE', P.ORDER_NONE) || '1') + ')\n';
    };

    Blockly.Blocks['radio_envoyer_nombre'] = { init: function() {
        this.appendValueInput("NOMBRE").setCheck("Number").appendField("envoyer le nombre");
        this.appendDummyInput().appendField("par radio");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_RADIO);
    }};
    P.forBlock['radio_envoyer_nombre'] = function(block) {
        piloteRadio();
        return 'radio.send(str(' + (P.valueToCode(block, 'NOMBRE', P.ORDER_NONE) || '0') + '))\n';
    };

    Blockly.Blocks['radio_envoyer_valeur'] = { init: function() {
        this.appendValueInput("NOM").appendField("envoyer la valeur");
        this.appendValueInput("VALEUR").appendField("=");
        this.appendDummyInput().appendField("par radio");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_RADIO);
        this.setTooltip("Envoie « nom=valeur », que la réception sait relire.");
    }};
    P.forBlock['radio_envoyer_valeur'] = function(block) {
        piloteRadio();
        return 'radio.send(' + versTexte(block, 'NOM') + ' + "=" + ' +
               versTexte(block, 'VALEUR') + ')\n';
    };

    // --- Reception ---

    const TYPES_RADIO = [
        ["un nombre", "nombre"], ["une valeur nommée", "valeur"], ["du texte", "texte"]
    ];

    Blockly.Blocks['radio_quand_recu'] = { init: function() {
        this.appendDummyInput().appendField("quand la radio reçoit")
            .appendField(new Blockly.FieldDropdown(TYPES_RADIO), "TYPE");
        this.appendStatementInput("DO").setCheck(null);
        this.setColour(COULEUR_RADIO);
        this.setTooltip("Le type est déduit du message reçu : « 42 » est un nombre, " +
                        "« nom=valeur » une valeur nommée, le reste du texte.");
    }};
    P.forBlock['radio_quand_recu'] = function(block) {
        piloteRadio();
        return declarerGestionnaire('on_radio_' + block.getFieldValue('TYPE'),
                                    P.statementToCode(block, 'DO'));
    };

    // Valeurs distinctes obligatoires : deux options de meme valeur rendent le
    // menu ambigu, Blockly resolvant toujours vers la premiere.
    const LECTURES_RADIO = [
        ["le nombre reçu", "nombre"], ["le nom reçu", "nom"],
        ["la valeur reçue", "valeur"], ["le texte reçu", "texte"],
        ["la force du signal", "force"]
    ];
    const RANGS_RADIO = { texte: 0, nom: 1, valeur: 2, force: 3 };

    Blockly.Blocks['radio_lecture'] = { init: function() {
        this.appendDummyInput().appendField("radio :")
            .appendField(new Blockly.FieldDropdown(LECTURES_RADIO), "QUOI");
        this.setOutput(true, null);
        this.setColour(COULEUR_RADIO);
        this.setTooltip("À utiliser dans un bloc « quand la radio reçoit ».");
    }};
    P.forBlock['radio_lecture'] = function(block) {
        piloteRadio();
        const quoi = block.getFieldValue('QUOI');
        // Le message circule en texte : le nombre est reconverti a la lecture.
        if (quoi === 'nombre') return ['_radio_nombre(_radio_dernier[0])', P.ORDER_FUNCTION_CALL];
        return ['_radio_dernier[' + RANGS_RADIO[quoi] + ']', P.ORDER_MEMBER];
    };

    // --- Reglages avances ---

    Blockly.Blocks['radio_puissance'] = { init: function() {
        this.appendValueInput("NIVEAU").setCheck("Number")
            .appendField("radio : puissance d'émission");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_RADIO);
        this.setTooltip("De 0 (portée minimale) à 7 (maximale).");
    }};
    P.forBlock['radio_puissance'] = function(block) {
        piloteRadio();
        return 'radio.config(power=' + (P.valueToCode(block, 'NIVEAU', P.ORDER_NONE) || '7') + ')\n';
    };

    Blockly.Blocks['radio_canal'] = { init: function() {
        this.appendValueInput("CANAL").setCheck("Number")
            .appendField("radio : bande de fréquence");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_RADIO);
        this.setTooltip("De 0 à 83. Deux bandes différentes ne se gênent pas.");
    }};
    P.forBlock['radio_canal'] = function(block) {
        piloteRadio();
        return 'radio.config(channel=' + (P.valueToCode(block, 'CANAL', P.ORDER_NONE) || '7') + ')\n';
    };

    Blockly.Blocks['boucle_infinie'] = { init: function() {
        this.appendDummyInput().appendField("Répéter indéfiniment");
        this.appendStatementInput("DO").setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
    }};
    P.forBlock['boucle_infinie'] = function(block) {
        const branche = P.statementToCode(block, 'DO') || P.INDENT + 'pass\n';
        return 'while True:\n' + branche;
    };

    // ---------- Maths ----------

    Blockly.Blocks['math_min_max'] = { init: function() {
        this.appendValueInput("A").setCheck("Number")
            .appendField(new Blockly.FieldDropdown([["min", "min"], ["max", "max"]]), "OP").appendField("de");
        this.appendValueInput("B").setCheck("Number").appendField("et");
        this.setOutput(true, "Number");
        this.setColour(280);
    }};
    P.forBlock['math_min_max'] = function(block) {
        const a = P.valueToCode(block, 'A', P.ORDER_NONE) || '0';
        const b = P.valueToCode(block, 'B', P.ORDER_NONE) || '0';
        return [block.getFieldValue('OP') + '(' + a + ', ' + b + ')', P.ORDER_FUNCTION_CALL];
    };

    Blockly.Blocks['math_absolue'] = { init: function() {
        this.appendValueInput("NUM").setCheck("Number").appendField("valeur absolue de");
        this.setOutput(true, "Number");
        this.setColour(280);
    }};
    P.forBlock['math_absolue'] = function(block) {
        const num = P.valueToCode(block, 'NUM', P.ORDER_NONE) || '0';
        return ['abs(' + num + ')', P.ORDER_FUNCTION_CALL];
    };

    Blockly.Blocks['math_racine'] = { init: function() {
        this.appendValueInput("NUM").setCheck("Number")
            .appendField(new Blockly.FieldDropdown([["racine carrée", "sqrt"]]), "OP");
        this.setOutput(true, "Number");
        this.setColour(280);
    }};
    P.forBlock['math_racine'] = function(block) {
        importerModule('math');
        const num = P.valueToCode(block, 'NUM', P.ORDER_NONE) || '0';
        return ['math.sqrt(' + num + ')', P.ORDER_FUNCTION_CALL];
    };

    Blockly.Blocks['math_arrondi_custom'] = { init: function() {
        this.appendValueInput("NUM").setCheck("Number")
            .appendField(new Blockly.FieldDropdown([
                ["arrondi", "round"], ["arrondi supérieur", "ceil"], ["arrondi inférieur", "floor"]
            ]), "OP");
        this.setOutput(true, "Number");
        this.setColour(280);
    }};
    P.forBlock['math_arrondi_custom'] = function(block) {
        const op = block.getFieldValue('OP');
        const num = P.valueToCode(block, 'NUM', P.ORDER_NONE) || '0';
        if (op === 'round') return ['round(' + num + ')', P.ORDER_FUNCTION_CALL];
        importerModule('math');
        return ['math.' + op + '(' + num + ')', P.ORDER_FUNCTION_CALL];
    };

    Blockly.Blocks['math_random_bool'] = { init: function() {
        this.appendDummyInput().appendField("choisir au hasard vrai ou faux");
        this.setOutput(true, "Boolean");
        this.setColour(280);
    }};
    P.forBlock['math_random_bool'] = function(block) {
        importerModule('random');
        return ['random.choice([True, False])', P.ORDER_FUNCTION_CALL];
    };

    Blockly.Blocks['math_convert'] = { init: function() {
        this.appendValueInput("NUM").setCheck("Number").appendField("convert");
        this.appendDummyInput().appendField("from")
            .appendField(new Blockly.FieldDropdown([
                ["degrees to radians", "radians"], ["radians to degrees", "degrees"]
            ]), "OP");
        this.setOutput(true, "Number");
        this.setColour(280);
        this.setInputsInline(false);
    }};
    P.forBlock['math_convert'] = function(block) {
        importerModule('math');
        const num = P.valueToCode(block, 'NUM', P.ORDER_NONE) || '0';
        return ['math.' + block.getFieldValue('OP') + '(' + num + ')', P.ORDER_FUNCTION_CALL];
    };

    Blockly.Blocks['math_map'] = { init: function() {
        this.appendValueInput("VAL").setCheck("Number").appendField("projeter");
        this.appendValueInput("FROMLOW").setCheck("Number").appendField("de");
        this.appendValueInput("FROMHIGH").setCheck("Number").appendField("et");
        this.appendValueInput("TOLOW").setCheck("Number").appendField("à");
        this.appendValueInput("TOHIGH").setCheck("Number").appendField("et");
        this.setOutput(true, "Number");
        this.setColour(280);
        this.setInputsInline(false);
    }};
    P.forBlock['math_map'] = function(block) {
        P.definitions_['def_map'] =
            'def map_val(value, from_low, from_high, to_low, to_high):\n' +
            '    return (value - from_low) * (to_high - to_low) / (from_high - from_low) + to_low';
        const val = P.valueToCode(block, 'VAL', P.ORDER_NONE) || '0';
        const fromL = P.valueToCode(block, 'FROMLOW', P.ORDER_NONE) || '0';
        const fromH = P.valueToCode(block, 'FROMHIGH', P.ORDER_NONE) || '1023';
        const toL = P.valueToCode(block, 'TOLOW', P.ORDER_NONE) || '0';
        const toH = P.valueToCode(block, 'TOHIGH', P.ORDER_NONE) || '4';
        return ['map_val(' + val + ', ' + fromL + ', ' + fromH + ', ' + toL + ', ' + toH + ')',
                P.ORDER_FUNCTION_CALL];
    };

    // ---------- Servomoteurs ----------
    //
    // Conventions reprises de MakeCode (pxt-common-packages, libs/servo) :
    // angle 0-180 correspondant a une impulsion de 500 a 2500 us dans une
    // periode de 20 ms, soit 50 Hz. L'intervalle borne l'angle, le mini restant
    // entre 0 et 90 et le maxi entre 90 et 180.

    const COULEUR_SERVO = 140;
    const BROCHES_SERVO = [["P0", "pin0"], ["P1", "pin1"], ["P2", "pin2"]];
    const menuBrocheServo = () => new Blockly.FieldDropdown(BROCHES_SERVO);
    /** Nom lisible de la broche, qui sert de clé d'état côté MicroPython. */
    const nomBroche = block => block.getFieldValue('BROCHE').replace('pin', 'P');

    function piloteServo() {
        importerMicrobit();
        P.definitions_['servo_pilote'] =
            '# >>> pilote servo\n' + [
            '# Un servomoteur attend une impulsion de 500 a 2500 us toutes les 20 ms.',
            '# write_analog prend un rapport cyclique sur 1023 : d ou la conversion.',
            '_SERVO_ETAT = {}',
            '',
            'def _servo_etat(nom):',
            '    if nom not in _SERVO_ETAT:',
            '        _SERVO_ETAT[nom] = [0, 180, False]   # angle mini, maxi, arret au neutre',
            '    return _SERVO_ETAT[nom]',
            '',
            'def _servo_impulsion(broche, microsecondes, nom=""):',
            '    microsecondes = max(500, min(2500, int(microsecondes)))',
            '    broche.set_analog_period(20)',
            '    broche.write_analog(int(microsecondes * 1023 / 20000))',
            '',
            'def _servo_angle(broche, nom, angle):',
            '    etat = _servo_etat(nom)',
            '    angle = max(etat[0], min(etat[1], int(angle)))',
            '    _servo_impulsion(broche, 500 + angle * 2000 / 180, nom)',
            '',
            'def _servo_arreter(broche, nom):',
            '    # On cesse d envoyer des impulsions : le servo reste ou il est.',
            '    broche.write_analog(0)',
            '',
            'def _servo_continu(broche, nom, vitesse):',
            '    etat = _servo_etat(nom)',
            '    vitesse = max(-100, min(100, int(vitesse)))',
            '    angle = etat[0] + (vitesse + 100) * (etat[1] - etat[0]) / 200',
            '    angle = max(etat[0], min(etat[1], int(angle)))',
            '    # Neutre calcule comme dans MakeCode : (maxi - mini) // 2.',
            '    if etat[2] and angle == (etat[1] - etat[0]) // 2:',
            '        _servo_arreter(broche, nom)',
            '    else:',
            '        _servo_angle(broche, nom, angle)',
            '',
            'def _servo_intervalle(nom, mini, maxi):',
            '    etat = _servo_etat(nom)',
            '    etat[0] = max(0, min(90, int(mini)))',
            '    etat[1] = max(90, min(180, int(maxi)))',
            '',
            'def _servo_arret_neutre(nom, actif):',
            '    _servo_etat(nom)[2] = bool(actif)',
        ].join('\n') + '\n# <<< pilote servo';
    }

    Blockly.Blocks['servo_angle'] = { init: function() {
        this.appendDummyInput().appendField("régler l'angle du servomoteur")
            .appendField(menuBrocheServo(), "BROCHE").appendField("à");
        this.appendValueInput("ANGLE").setCheck("Number");
        this.appendDummyInput().appendField("°");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_SERVO);
        this.setTooltip("De 0 à 180°, borné par l'intervalle défini pour cette broche.");
    }};
    P.forBlock['servo_angle'] = function(block) {
        piloteServo();
        const angle = P.valueToCode(block, 'ANGLE', P.ORDER_NONE) || '90';
        return '_servo_angle(' + block.getFieldValue('BROCHE') +
               ', "' + nomBroche(block) + '", ' + angle + ')\n';
    };

    Blockly.Blocks['servo_continu'] = { init: function() {
        this.appendDummyInput().appendField("servomoteur")
            .appendField(menuBrocheServo(), "BROCHE")
            .appendField("à rotation continue fonctionne à");
        this.appendValueInput("VITESSE").setCheck("Number");
        this.appendDummyInput().appendField("%");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_SERVO);
        this.setTooltip("De -100 à 100 %. 0 correspond à l'arrêt du mouvement.");
    }};
    P.forBlock['servo_continu'] = function(block) {
        piloteServo();
        const vitesse = P.valueToCode(block, 'VITESSE', P.ORDER_NONE) || '0';
        return '_servo_continu(' + block.getFieldValue('BROCHE') +
               ', "' + nomBroche(block) + '", ' + vitesse + ')\n';
    };

    Blockly.Blocks['servo_arreter'] = { init: function() {
        this.appendDummyInput().appendField("arrêter le servomoteur")
            .appendField(menuBrocheServo(), "BROCHE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_SERVO);
        this.setTooltip("Cesse d'envoyer des impulsions : le servomoteur reste où il est.");
    }};
    P.forBlock['servo_arreter'] = function(block) {
        piloteServo();
        return '_servo_arreter(' + block.getFieldValue('BROCHE') +
               ', "' + nomBroche(block) + '")\n';
    };

    Blockly.Blocks['servo_arret_neutre'] = { init: function() {
        this.appendDummyInput().appendField("mettre l'arrêt au neutre du servomoteur")
            .appendField(menuBrocheServo(), "BROCHE").appendField("à")
            .appendField(new Blockly.FieldDropdown([["ON", "True"], ["OFF", "False"]]), "ETAT");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_SERVO);
        this.setTooltip("Si actif, une vitesse nulle arrête le servomoteur au lieu de le maintenir.");
    }};
    P.forBlock['servo_arret_neutre'] = function(block) {
        piloteServo();
        return '_servo_arret_neutre("' + nomBroche(block) + '", ' +
               block.getFieldValue('ETAT') + ')\n';
    };

    Blockly.Blocks['servo_intervalle'] = { init: function() {
        this.appendDummyInput().appendField("définir l'intervalle du servomoteur")
            .appendField(menuBrocheServo(), "BROCHE").appendField("de");
        this.appendValueInput("MINI").setCheck("Number");
        this.appendValueInput("MAXI").setCheck("Number").appendField("à");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_SERVO);
        this.setTooltip("Le mini est ramené entre 0 et 90, le maxi entre 90 et 180.");
    }};
    P.forBlock['servo_intervalle'] = function(block) {
        piloteServo();
        const mini = P.valueToCode(block, 'MINI', P.ORDER_NONE) || '0';
        const maxi = P.valueToCode(block, 'MAXI', P.ORDER_NONE) || '180';
        return '_servo_intervalle("' + nomBroche(block) + '", ' + mini + ', ' + maxi + ')\n';
    };

    Blockly.Blocks['servo_impulsion'] = { init: function() {
        this.appendDummyInput().appendField("régler la largeur d'impulsion du servomoteur")
            .appendField(menuBrocheServo(), "BROCHE").appendField("à");
        this.appendValueInput("MICROS").setCheck("Number");
        this.appendDummyInput().appendField("µs");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_SERVO);
        this.setTooltip("Bornée entre 500 et 2500 µs. 1500 µs correspond à la position centrale.");
    }};
    P.forBlock['servo_impulsion'] = function(block) {
        piloteServo();
        const micros = P.valueToCode(block, 'MICROS', P.ORDER_NONE) || '1500';
        return '_servo_impulsion(' + block.getFieldValue('BROCHE') + ', ' + micros +
               ', "' + nomBroche(block) + '")\n';
    };

    // ---------- Carte moteurs DFRobot DFR0548 (micro:bit Driver Expansion Board) ----------
    //
    // Une PCA9685 a l'adresse I2C 0x40, a 50 Hz, pilote 8 servos (S1 a S8) et 4 moteurs a courant continu
    // (M1 a M4), ou 2 moteurs pas a pas (M1-M2, M3-M4). Canaux, impulsions, sequences des pas a pas et durees
    // repris tels quels de la bibliotheque MakeCode officielle (DFRobot/pxt-motor, main.ts) :
    //  - servo Sn sur le canal 16 - n, impulsion de 600 a 2400 us pour 0 a 180 degres ;
    //  - moteur Mn sur les canaux (4 - n) x 2 (sens antihoraire) et (4 - n) x 2 + 1 (sens horaire), vitesse 0 a 255 x 16 ;
    //  - pas a pas : la PCA9685 produit la sequence elle-meme (4 canaux decales en phase) ; l'angle n'est
    //    obtenu que par la duree avant l'arret (42BYGH : 50000 x degres / 36000 ms ; 28BYJ-48 : 1000 x degres / 360 ms).
    // Pas verifie sur une vraie carte.

    const MENU_SERVOS_DFR = [1, 2, 3, 4, 5, 6, 7, 8].map(n => ['S' + n, String(n)]);
    const MENU_MOTEURS_DFR = [1, 2, 3, 4].map(n => ['M' + n, String(n)]);
    const MENU_SENS_DFR = [["↻ horaire", "1"], ["↺ antihoraire", "-1"]];

    function piloteDfr0548() {
        importerMicrobit();
        piloteRegistre();
        pilote('dfr0548', [
            'class _CarteDFR0548:',
            '    # Sequences des pas a pas (valeurs ON/OFF de la PCA9685), bibliotheque DFRobot pxt-motor',
            '    STP = ((2047, 4095), (1, 2047), (1023, 3071), (3071, 1023))     # 28BYJ-48',
            '    BYG = ((3071, 1023), (1023, 3071), (4095, 2047), (2047, 4095))  # 42BYGH',
            '',
            '    def __init__(self, adresse=0x40):',
            '        self.adr = adresse',
            '        i2c.init()',
            '        self._ecrire(0x00, 0x00)',
            '        ancien = self._lire(0x00)',
            '        self._ecrire(0x00, (ancien & 0x7F) | 0x10)   # veille, pour changer la frequence',
            '        self._ecrire(0xFE, 121)                      # 50 Hz : 25 MHz / (4096 x 50) - 1',
            '        self._ecrire(0x00, ancien)',
            '        sleep(5)',
            '        self._ecrire(0x00, ancien | 0xA1)            # redemarrage, auto-increment',
            '',
            '    def _ecrire(self, registre, valeur):',
            '        i2c.write(self.adr, bytes([registre, valeur]))',
            '',
            '    def _lire(self, registre):',
            '        i2c.write(self.adr, bytes([registre]))',
            '        return i2c.read(self.adr, 1)[0]',
            '',
            '    def _pwm(self, canal, debut, fin):',
            '        i2c.write(self.adr, bytes([0x06 + 4 * canal, debut & 0xFF, (debut >> 8) & 0xFF, fin & 0xFF, (fin >> 8) & 0xFF]))',
            '',
            '    def servo(self, numero, angle):',
            '        numero = max(1, min(8, int(numero)))',
            '        angle = max(0, min(180, angle))',
            '        self._pwm(16 - numero, 0, int((angle * 1800 / 180 + 600) * 4096 / 20000))',
            '',
            '    def moteur(self, numero, sens, vitesse):',
            '        numero = max(1, min(4, int(numero)))',
            '        v = max(-4095, min(4095, int(max(0, min(255, vitesse)) * 16 * sens)))',
            '        voie = (4 - numero) * 2',
            '        if v >= 0:',
            '            self._pwm(voie + 1, 0, v)',
            '            self._pwm(voie, 0, 0)',
            '        else:',
            '            self._pwm(voie + 1, 0, 0)',
            '            self._pwm(voie, 0, -v)',
            '',
            '    def arreter(self, numero):',
            '        voie = (4 - int(numero)) * 2',
            '        self._pwm(voie, 0, 0)',
            '        self._pwm(voie + 1, 0, 0)',
            '',
            '    def arreter_tout(self):',
            '        for numero in range(1, 5):',
            '            self.arreter(numero)',
            '',
            '    def pas_a_pas(self, modele, paire, sens, degres):',
            '        # paire 1 = M1-M2 (canaux 4 a 7), paire 2 = M3-M4 (canaux 0 a 3)',
            '        degres = abs(degres)',
            '        if degres == 0:',
            '            return',
            '        b = 4 if paire == 1 else 0',
            '        if modele == 28:',
            '            ordre = (b, b + 2, b + 1, b + 3) if sens > 0 else (b + 3, b + 1, b + 2, b)',
            '            for canal, (debut, fin) in zip(ordre, self.STP):',
            '                self._pwm(canal, debut, fin)',
            '            sleep(int(1000 * degres / 360))',
            '        else:',
            '            if sens > 0:',
            '                ordre = ((b + 3, 0), (b + 2, 1), (b + 1, 2), (b, 3))',
            '            else:',
            '                ordre = ((b + 3, 2), (b + 2, 3), (b + 1, 0), (b, 1))',
            '            for canal, i in ordre:',
            '                self._pwm(canal, self.BYG[i][0], self.BYG[i][1])',
            '            sleep(int(50000 * degres / 36000))',
            '        if paire == 1:',
            '            self.arreter(1)',
            '            self.arreter(2)',
            '        else:',
            '            self.arreter(3)',
            '            self.arreter(4)',
            '',
            'def _dfr0548():',
            '    return _grove_obj("dfr0548", _CarteDFR0548)',
        ]);
    }

    // Carte moteurs ELECFREAKS Motor:bit V1.6 : puce TB6612, deux moteurs a courant continu. Brochage de la
    // documentation ELECFREAKS et du paquet MakeCode pxt-motorbit : M1 vitesse P1 (MLI) et sens P8, M2 vitesse
    // P2 et sens P12 (niveau haut = sens horaire). Pas verifie sur une vraie carte.
    const MENU_MOTEURS_MOTORBIT = [['M1', '1'], ['M2', '2']];
    function piloteMotorbit() {
        importerMicrobit();
        piloteRegistre();
        pilote('motorbit', [
            'class _CarteMotorbit:',
            '    def _broches(self, numero):',
            '        return (pin1, pin8) if int(numero) == 1 else (pin2, pin12)',
            '',
            '    def moteur(self, numero, sens, vitesse):',
            '        vit, sens_broche = self._broches(numero)',
            '        sens_broche.write_digital(1 if sens > 0 else 0)',
            '        vit.write_analog(max(0, min(255, int(vitesse))) * 1023 // 255)',
            '',
            '    def arreter(self, numero):',
            '        self._broches(numero)[0].write_analog(0)',
            '',
            '    def arreter_tout(self):',
            '        self.arreter(1)',
            '        self.arreter(2)',
            '',
            'def _motorbit():',
            '    return _grove_obj("motorbit", _CarteMotorbit)',
        ]);
    }

    Blockly.Blocks['motorbit_moteur'] = { init: function() {
        this.appendDummyInput().appendField("Motor:bit : moteur").appendField(new Blockly.FieldDropdown(MENU_MOTEURS_MOTORBIT), "MOTEUR")
            .appendField("sens").appendField(new Blockly.FieldDropdown(MENU_SENS_DFR), "SENS").appendField("vitesse");
        this.appendValueInput("VITESSE").setCheck("Number");
        this.appendDummyInput().appendField("(0 à 255)");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip("Fait tourner le moteur à courant continu branché sur M1 ou M2 de la carte Motor:bit, dans le sens choisi, " +
                        "à la vitesse voulue (0 à 255). Le moteur tourne jusqu'à un autre ordre.");
    }};
    P.forBlock['motorbit_moteur'] = function(block) {
        piloteMotorbit();
        return '_motorbit().moteur(' + block.getFieldValue('MOTEUR') + ', ' + block.getFieldValue('SENS') + ', ' +
               (P.valueToCode(block, 'VITESSE', P.ORDER_NONE) || '0') + ')\n';
    };

    Blockly.Blocks['motorbit_moteur_arreter'] = { init: function() {
        this.appendDummyInput().appendField("Motor:bit : arrêter")
            .appendField(new Blockly.FieldDropdown([["le moteur M1", "1"], ["le moteur M2", "2"], ["les deux moteurs", "tous"]]), "MOTEUR");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip("Arrête un moteur de la carte Motor:bit, ou les deux.");
    }};
    P.forBlock['motorbit_moteur_arreter'] = function(block) {
        piloteMotorbit();
        const m = block.getFieldValue('MOTEUR');
        return m === 'tous' ? '_motorbit().arreter_tout()\n' : '_motorbit().arreter(' + m + ')\n';
    };

    Blockly.Blocks['dfr_servo'] = { init: function() {
        this.appendDummyInput().appendField("DFR0548 : servo").appendField(new Blockly.FieldDropdown(MENU_SERVOS_DFR), "SERVO")
            .appendField("à");
        this.appendValueInput("ANGLE").setCheck("Number");
        this.appendDummyInput().appendField("°");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip("Place le servomoteur branché sur la sortie choisie (S1 à S8) de la carte DFR0548 à l'angle voulu (0 à 180°).");
    }};
    P.forBlock['dfr_servo'] = function(block) {
        piloteDfr0548();
        return '_dfr0548().servo(' + block.getFieldValue('SERVO') + ', ' + (P.valueToCode(block, 'ANGLE', P.ORDER_NONE) || '90') + ')\n';
    };

    Blockly.Blocks['dfr_moteur'] = { init: function() {
        this.appendDummyInput().appendField("DFR0548 : moteur").appendField(new Blockly.FieldDropdown(MENU_MOTEURS_DFR), "MOTEUR")
            .appendField("sens").appendField(new Blockly.FieldDropdown(MENU_SENS_DFR), "SENS").appendField("vitesse");
        this.appendValueInput("VITESSE").setCheck("Number");
        this.appendDummyInput().appendField("(0 à 255)");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip("Fait tourner le moteur à courant continu branché sur la sortie choisie (M1 à M4), dans le sens choisi, " +
                        "à la vitesse voulue (0 à 255). Le moteur tourne jusqu'à un autre ordre.");
    }};
    P.forBlock['dfr_moteur'] = function(block) {
        piloteDfr0548();
        return '_dfr0548().moteur(' + block.getFieldValue('MOTEUR') + ', ' + block.getFieldValue('SENS') + ', ' +
               (P.valueToCode(block, 'VITESSE', P.ORDER_NONE) || '0') + ')\n';
    };

    Blockly.Blocks['dfr_moteur_arreter'] = { init: function() {
        this.appendDummyInput().appendField("DFR0548 : arrêter")
            .appendField(new Blockly.FieldDropdown([["le moteur M1", "1"], ["le moteur M2", "2"], ["le moteur M3", "3"],
                                                    ["le moteur M4", "4"], ["tous les moteurs", "tous"]]), "MOTEUR");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip("Arrête un moteur de la carte DFR0548, ou les quatre.");
    }};
    P.forBlock['dfr_moteur_arreter'] = function(block) {
        piloteDfr0548();
        const m = block.getFieldValue('MOTEUR');
        return m === 'tous' ? '_dfr0548().arreter_tout()\n' : '_dfr0548().arreter(' + m + ')\n';
    };

    Blockly.Blocks['dfr_pas_a_pas'] = { init: function() {
        this.appendDummyInput().appendField("DFR0548 : moteur pas à pas")
            .appendField(new Blockly.FieldDropdown([["28BYJ-48", "28"], ["42BYGH", "42"]]), "MODELE")
            .appendField("sur").appendField(new Blockly.FieldDropdown([["M1-M2", "1"], ["M3-M4", "2"]]), "PAIRE")
            .appendField("sens").appendField(new Blockly.FieldDropdown(MENU_SENS_DFR), "SENS").appendField("de");
        this.appendValueInput("QUANTITE").setCheck("Number");
        this.appendDummyInput().appendField(new Blockly.FieldDropdown([["degrés", "degres"], ["tours", "tours"]]), "UNITE");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip("Fait tourner un moteur pas à pas (28BYJ-48 ou 42BYGH) branché sur deux sorties moteur de la carte DFR0548, " +
                        "puis l'arrête. Le programme attend la fin du mouvement. L'angle est obtenu par une durée (bibliothèque " +
                        "DFRobot) : à vérifier sur le vrai moteur.");
    }};
    P.forBlock['dfr_pas_a_pas'] = function(block) {
        piloteDfr0548();
        let quantite = P.valueToCode(block, 'QUANTITE', P.ORDER_MULTIPLICATIVE) || '90';
        if (block.getFieldValue('UNITE') === 'tours') quantite = quantite + ' * 360';
        return '_dfr0548().pas_a_pas(' + block.getFieldValue('MODELE') + ', ' + block.getFieldValue('PAIRE') + ', ' +
               block.getFieldValue('SENS') + ', ' + quantite + ')\n';
    };

    // ---------- Grove ----------
    //
    // Les pilotes de ces modules ne sont pas dans le firmware : ils sont écrits
    // dans le programme généré, via definitions_. Chacun est encadré par
    //     # >>> pilote grove   …   # <<< pilote grove
    // pour que le simulateur puisse les retirer et leur substituer ses propres
    // objets : sur la carte on pilote de vraies broches, ici on dessine.

    const COULEUR_GROVE = 285;

    const BROCHES_GROVE = [
        ["P0", "pin0"], ["P1", "pin1"], ["P2", "pin2"], ["P8", "pin8"],
        ["P12", "pin12"], ["P13", "pin13"], ["P14", "pin14"],
        ["P15", "pin15"], ["P16", "pin16"]
    ];

    const COULEURS_GROVE = [
        ["rouge", "0xFF0000"], ["orange", "0xFF7F00"], ["jaune", "0xFFFF00"],
        ["vert", "0x00FF00"], ["bleu", "0x0000FF"], ["indigo", "0x4B0082"],
        ["violet", "0x8B00FF"], ["blanc", "0xFFFFFF"], ["noir", "0x000000"]
    ];

    const menuBroche = () => new Blockly.FieldDropdown(BROCHES_GROVE);
    const menuCouleur = () => new Blockly.FieldDropdown(COULEURS_GROVE);

    // --- LED simple sur une broche ---
    //
    // Aucun pilote ici : une LED se commande directement par la broche, et
    // c'est justement ce qu'il faut montrer a l'eleve. Le code produit est
    // celui qu'on ecrirait a la main.

    Blockly.Blocks['grove_led_etat'] = { init: function() {
        this.appendDummyInput().appendField("[LED] contrôler la LED à")
            .appendField(new Blockly.FieldDropdown([
                ["HAUT (1)", "1"], ["BAS (0)", "0"]
            ]), "ETAT")
            .appendField("sur la broche").appendField(menuBroche(), "BROCHE");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Allume (HAUT) ou éteint (BAS) la LED. Tout ou rien.");
    }};
    P.forBlock['grove_led_etat'] = function(block) {
        importerMicrobit();
        return block.getFieldValue('BROCHE') + '.write_digital(' +
               block.getFieldValue('ETAT') + ')\n';
    };

    Blockly.Blocks['grove_led_luminosite'] = { init: function() {
        this.appendValueInput("NIVEAU").setCheck("Number")
            .appendField("[LED] régler la luminosité à");
        this.appendDummyInput().appendField("sur la broche")
            .appendField(menuBroche(), "BROCHE");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("De 0 (éteinte) à 1023 (au maximum). La broche est " +
                        "pilotée en modulation de largeur d'impulsion.");
    }};
    P.forBlock['grove_led_luminosite'] = function(block) {
        importerMicrobit();
        const niveau = P.valueToCode(block, 'NIVEAU', P.ORDER_NONE) || '1023';
        // Bornage : write_analog leve une exception hors de 0-1023, ce qui
        // arreterait le programme sur la carte sans rien afficher.
        return block.getFieldValue('BROCHE') +
               '.write_analog(max(0, min(1023, ' + niveau + ')))\n';
    };

    /** Enrobe un pilote des marqueurs que le simulateur reconnaît. */
    function pilote(nom, lignes) {
        // Le nom figure dans le marqueur : c'est lui qui sert d'intitule au
        // resume replie de la transcription.
        P.definitions_['grove_' + nom] =
            '# >>> pilote ' + nom + '\n' + lignes.join('\n') + '\n# <<< pilote ' + nom;
    }

    /**
     * Registre des périphériques, créés à la première utilisation.
     *
     * Sans cela, oublier le bloc « définir … » donnait un NameError à
     * l'exécution — invisible tant qu'on n'avait pas lancé le programme, et
     * muet sur la carte. Chaque module a donc un accesseur qui le fabrique au
     * besoin ; le bloc « définir … » ne sert plus qu'à choisir d'autres
     * broches, et devient facultatif.
     *
     * Le registre est un dictionnaire : on peut y écrire depuis une fonction
     * sans avoir à déclarer `global`.
     */
    function piloteRegistre() {
        pilote('objets', [
            '_grove_objets = {}',
            '',
            'def _grove_obj(nom, fabrique):',
            '    if nom not in _grove_objets:',
            '        _grove_objets[nom] = fabrique()',
            '    return _grove_objets[nom]',
        ]);
    }

    // --- Ruban RGB WS2813 (module neopixel intégré au firmware) ---

    function piloteRuban() {
        importerMicrobit();
        importerModule('neopixel');
        piloteRegistre();
        // La luminosité est rangée dans une liste : on peut alors la changer
        // depuis une fonction sans avoir à déclarer `global`.
        pilote('teinte', [
            '_grove_lum = [100]',
            '',
            'def _grove_teinte(couleur):',
            '    f = _grove_lum[0] / 100',
            '    return (int(((couleur >> 16) & 255) * f),',
            '            int(((couleur >> 8) & 255) * f),',
            '            int((couleur & 255) * f))',
            '',
            '# Par defaut : broche P1, 16 LED.',
            'def _grove_ruban():',
            '    return _grove_obj("ruban", lambda: neopixel.NeoPixel(pin1, 16))',
        ]);
    }

    Blockly.Blocks['grove_ruban_definir'] = { init: function() {
        this.appendDummyInput().appendField("définir le ruban RGB sur")
            .appendField(menuBroche(), "BROCHE")
            .appendField("avec").appendField(new Blockly.FieldNumber(16, 1, 64), "NB")
            .appendField("LED(s)");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Facultatif : sans ce bloc, le ruban est pris sur P1 avec 16 LED.");
    }};
    P.forBlock['grove_ruban_definir'] = function(block) {
        piloteRuban();
        return '_grove_objets["ruban"] = neopixel.NeoPixel(' + block.getFieldValue('BROCHE') +
               ', ' + block.getFieldValue('NB') + ')\n';
    };

    Blockly.Blocks['grove_ruban_couleur'] = { init: function() {
        this.appendDummyInput().appendField("colorer tout le ruban en")
            .appendField(menuCouleur(), "COULEUR");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
    }};
    P.forBlock['grove_ruban_couleur'] = function(block) {
        piloteRuban();
        return '_grove_ruban().fill(_grove_teinte(' + block.getFieldValue('COULEUR') + '))\n_grove_ruban().show()\n';
    };

    Blockly.Blocks['grove_ruban_effacer'] = { init: function() {
        this.appendDummyInput().appendField("éteindre le ruban");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
    }};
    P.forBlock['grove_ruban_effacer'] = function(block) {
        piloteRuban();
        return '_grove_ruban().clear()\n';
    };

    Blockly.Blocks['grove_ruban_couleur_index'] = { init: function() {
        this.appendValueInput("INDEX").setCheck("Number").appendField("colorer la LED n°");
        this.appendDummyInput().appendField("en").appendField(menuCouleur(), "COULEUR");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
    }};
    P.forBlock['grove_ruban_couleur_index'] = function(block) {
        piloteRuban();
        const index = P.valueToCode(block, 'INDEX', P.ORDER_NONE) || '0';
        return '_grove_ruban()[' + index + '] = _grove_teinte(' + block.getFieldValue('COULEUR') + ')\n_grove_ruban().show()\n';
    };

    Blockly.Blocks['grove_ruban_effacer_index'] = { init: function() {
        this.appendValueInput("INDEX").setCheck("Number").appendField("éteindre la LED n°");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
    }};
    P.forBlock['grove_ruban_effacer_index'] = function(block) {
        piloteRuban();
        const index = P.valueToCode(block, 'INDEX', P.ORDER_NONE) || '0';
        return '_grove_ruban()[' + index + '] = (0, 0, 0)\n_grove_ruban().show()\n';
    };

    Blockly.Blocks['grove_ruban_perso'] = { init: function() {
        this.appendDummyInput().appendField("colorer tout le ruban en R");
        this.appendValueInput("R").setCheck("Number");
        this.appendValueInput("V").setCheck("Number").appendField("V");
        this.appendValueInput("B").setCheck("Number").appendField("B");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
    }};
    P.forBlock['grove_ruban_perso'] = function(block) {
        piloteRuban();
        const r = P.valueToCode(block, 'R', P.ORDER_NONE) || '0';
        const v = P.valueToCode(block, 'V', P.ORDER_NONE) || '0';
        const b = P.valueToCode(block, 'B', P.ORDER_NONE) || '0';
        return '_grove_ruban().fill(_grove_teinte(((' + r + ') << 16) + ((' + v + ') << 8) + (' + b + ')))\n_grove_ruban().show()\n';
    };

    Blockly.Blocks['grove_ruban_perso_index'] = { init: function() {
        this.appendValueInput("INDEX").setCheck("Number").appendField("colorer la LED n°");
        this.appendValueInput("R").setCheck("Number").appendField("en R");
        this.appendValueInput("V").setCheck("Number").appendField("V");
        this.appendValueInput("B").setCheck("Number").appendField("B");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
    }};
    P.forBlock['grove_ruban_perso_index'] = function(block) {
        piloteRuban();
        const index = P.valueToCode(block, 'INDEX', P.ORDER_NONE) || '0';
        const r = P.valueToCode(block, 'R', P.ORDER_NONE) || '0';
        const v = P.valueToCode(block, 'V', P.ORDER_NONE) || '0';
        const b = P.valueToCode(block, 'B', P.ORDER_NONE) || '0';
        return '_grove_ruban()[' + index + '] = _grove_teinte(((' + r + ') << 16) + ((' + v + ') << 8) + (' + b + '))\n_grove_ruban().show()\n';
    };

    Blockly.Blocks['grove_ruban_luminosite'] = { init: function() {
        this.appendValueInput("NIVEAU").setCheck("Number").appendField("luminosité du ruban à");
        this.appendDummyInput().appendField("%");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Le module neopixel n'a pas de réglage de luminosité : les couleurs sont atténuées avant envoi.");
    }};
    P.forBlock['grove_ruban_luminosite'] = function(block) {
        piloteRuban();
        const niveau = P.valueToCode(block, 'NIVEAU', P.ORDER_NONE) || '100';
        return '_grove_lum[0] = max(0, min(100, ' + niveau + '))\n';
    };

    // --- Afficheur 4 digits (TM1637, protocole 2 fils) ---

    function piloteAfficheur() {
        importerMicrobit();
        piloteRegistre();
        pilote('tm1637', [
            '_TM_SEG = (0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F)',
            '',
            'class _Afficheur4:',
            '    def __init__(self, clk, dio):',
            '        self.clk = clk',
            '        self.dio = dio',
            '        self.lum = 7',
            '        self.pts = False',
            '        self.tampon = [0, 0, 0, 0]',
            '',
            '    def _debut(self):',
            '        self.dio.write_digital(1)',
            '        self.clk.write_digital(1)',
            '        self.dio.write_digital(0)',
            '        self.clk.write_digital(0)',
            '',
            '    def _fin(self):',
            '        self.clk.write_digital(0)',
            '        self.dio.write_digital(0)',
            '        self.clk.write_digital(1)',
            '        self.dio.write_digital(1)',
            '',
            '    def _octet(self, valeur):',
            '        for i in range(8):',
            '            self.clk.write_digital(0)',
            '            self.dio.write_digital((valeur >> i) & 1)',
            '            self.clk.write_digital(1)',
            '        # neuvieme front : acquittement de l afficheur',
            '        self.clk.write_digital(0)',
            '        self.dio.write_digital(1)',
            '        self.clk.write_digital(1)',
            '        self.clk.write_digital(0)',
            '',
            '    def _envoyer(self):',
            '        self._debut(); self._octet(0x40); self._fin()',
            '        self._debut(); self._octet(0xC0)',
            '        for i in range(4):',
            '            v = self.tampon[i]',
            '            if i == 1 and self.pts:',
            '                v = v | 0x80',
            '            self._octet(v)',
            '        self._fin()',
            '        self._debut(); self._octet(0x88 | (self.lum & 7)); self._fin()',
            '',
            '    def effacer(self):',
            '        self.tampon = [0, 0, 0, 0]',
            '        self._envoyer()',
            '',
            '    def chiffre(self, position, valeur):',
            '        position = max(0, min(3, int(position)))',
            '        valeur = int(valeur)',
            '        self.tampon[position] = _TM_SEG[valeur % 10] if 0 <= valeur <= 9 else 0',
            '        self._envoyer()',
            '',
            '    def nombre(self, valeur):',
            '        valeur = int(valeur)',
            '        negatif = valeur < 0',
            '        valeur = abs(valeur) % 10000',
            '        for i in range(3, -1, -1):',
            '            self.tampon[i] = _TM_SEG[valeur % 10]',
            '            valeur = valeur // 10',
            '        if negatif:',
            '            self.tampon[0] = 0x40',
            '        self._envoyer()',
            '',
            '    def points(self, actif):',
            '        self.pts = bool(actif)',
            '        self._envoyer()',
            '',
            '    def luminosite(self, niveau):',
            '        self.lum = max(0, min(7, int(niveau)))',
            '        self._envoyer()',
            '',
            '# Par defaut : CLK sur P0, DIO sur P1.',
            'def _grove_afficheur():',
            '    return _grove_obj("afficheur", lambda: _Afficheur4(pin0, pin1))',
        ]);
    }

    Blockly.Blocks['grove_4d_definir'] = { init: function() {
        this.appendDummyInput().appendField("définir l'afficheur 4 digits : CLK")
            .appendField(menuBroche(), "CLK")
            .appendField("DIO").appendField(menuBroche(), "DIO");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Facultatif : sans ce bloc, CLK est pris sur P0 et DIO sur P1.");
    }};
    P.forBlock['grove_4d_definir'] = function(block) {
        piloteAfficheur();
        return '_grove_objets["afficheur"] = _Afficheur4(' + block.getFieldValue('CLK') +
               ', ' + block.getFieldValue('DIO') + ')\n';
    };

    Blockly.Blocks['grove_4d_nombre'] = { init: function() {
        this.appendValueInput("VALEUR").setCheck("Number").appendField("afficher le nombre");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
    }};
    P.forBlock['grove_4d_nombre'] = function(block) {
        piloteAfficheur();
        return '_grove_afficheur().nombre(' + (P.valueToCode(block, 'VALEUR', P.ORDER_NONE) || '0') + ')\n';
    };

    Blockly.Blocks['grove_4d_chiffre'] = { init: function() {
        this.appendValueInput("VALEUR").setCheck("Number").appendField("afficher le chiffre");
        this.appendValueInput("POSITION").setCheck("Number").appendField("à la position");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
    }};
    P.forBlock['grove_4d_chiffre'] = function(block) {
        piloteAfficheur();
        const valeur = P.valueToCode(block, 'VALEUR', P.ORDER_NONE) || '0';
        const position = P.valueToCode(block, 'POSITION', P.ORDER_NONE) || '0';
        return '_grove_afficheur().chiffre(' + position + ', ' + valeur + ')\n';
    };

    Blockly.Blocks['grove_4d_points'] = { init: function() {
        this.appendDummyInput().appendField(new Blockly.FieldDropdown([
            ["allumer", "True"], ["éteindre", "False"]
        ]), "ETAT").appendField("les deux points");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
    }};
    P.forBlock['grove_4d_points'] = function(block) {
        piloteAfficheur();
        return '_grove_afficheur().points(' + block.getFieldValue('ETAT') + ')\n';
    };

    Blockly.Blocks['grove_4d_luminosite'] = { init: function() {
        this.appendValueInput("NIVEAU").setCheck("Number").appendField("luminosité de l'afficheur à");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("De 0 (le plus faible) à 7 (le plus fort).");
    }};
    P.forBlock['grove_4d_luminosite'] = function(block) {
        piloteAfficheur();
        return '_grove_afficheur().luminosite(' + (P.valueToCode(block, 'NIVEAU', P.ORDER_NONE) || '7') + ')\n';
    };

    Blockly.Blocks['grove_4d_effacer'] = { init: function() {
        this.appendDummyInput().appendField("effacer l'afficheur");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
    }};
    P.forBlock['grove_4d_effacer'] = function(block) {
        piloteAfficheur();
        return '_grove_afficheur().effacer()\n';
    };

    // --- Télémètre à ultrasons (un seul fil, déclenchement puis écho) ---

    function piloteUltrason() {
        importerMicrobit();
        importerModule('machine');
        importerModule('utime');
        pilote('ultrason', [
            'def _grove_echo_us(broche):',
            '    broche.write_digital(0)',
            '    utime.sleep_us(2)',
            '    broche.write_digital(1)',
            '    utime.sleep_us(10)',
            '    broche.write_digital(0)',
            '    broche.set_pull(broche.NO_PULL)',
            '    # 30 ms de patience : au-dela, plus rien ne revient (~5 m)',
            '    return machine.time_pulse_us(broche, 1, 30000)',
            '',
            'def _grove_distance_cm(broche):',
            '    duree = _grove_echo_us(broche)',
            '    return 0 if duree < 0 else duree // 58',
            '',
            'def _grove_distance_pouces(broche):',
            '    duree = _grove_echo_us(broche)',
            '    return 0 if duree < 0 else duree // 148',
        ]);
    }

    Blockly.Blocks['grove_ultrason_cm'] = { init: function() {
        this.appendDummyInput().appendField("distance (cm) sur").appendField(menuBroche(), "BROCHE");
        this.setOutput(true, "Number");
        this.setColour(COULEUR_GROVE);
    }};
    P.forBlock['grove_ultrason_cm'] = function(block) {
        piloteUltrason();
        return ['_grove_distance_cm(' + block.getFieldValue('BROCHE') + ')', P.ORDER_FUNCTION_CALL];
    };

    Blockly.Blocks['grove_ultrason_pouces'] = { init: function() {
        this.appendDummyInput().appendField("distance (pouces) sur").appendField(menuBroche(), "BROCHE");
        this.setOutput(true, "Number");
        this.setColour(COULEUR_GROVE);
    }};
    P.forBlock['grove_ultrason_pouces'] = function(block) {
        piloteUltrason();
        return ['_grove_distance_pouces(' + block.getFieldValue('BROCHE') + ')', P.ORDER_FUNCTION_CALL];
    };

    // --- Joystick (deux axes analogiques, appui = axe X au plancher) ---

    function piloteJoystick() {
        importerMicrobit();
        pilote('joystick', [
            'def _grove_joystick(bx, by, direction):',
            '    x = bx.read_analog()',
            '    y = by.read_analog()',
            '    if direction == "gauche":',
            '        return x < 350',
            '    if direction == "droite":',
            '        return x > 700',
            '    if direction == "bas":',
            '        return y < 350',
            '    if direction == "haut":',
            '        return y > 700',
            '    return 350 <= x <= 700 and 350 <= y <= 700',
        ]);
    }

    Blockly.Blocks['grove_joystick_valeur'] = { init: function() {
        this.appendDummyInput().appendField("valeur du joystick sur").appendField(menuBroche(), "BROCHE");
        this.setOutput(true, "Number");
        this.setColour(COULEUR_GROVE);
        this.setTooltip("De 0 à 1023. Un axe par broche.");
    }};
    P.forBlock['grove_joystick_valeur'] = function(block) {
        importerMicrobit();
        return [block.getFieldValue('BROCHE') + '.read_analog()', P.ORDER_FUNCTION_CALL];
    };

    Blockly.Blocks['grove_joystick_direction'] = { init: function() {
        this.appendDummyInput().appendField("joystick X").appendField(menuBroche(), "X")
            .appendField("Y").appendField(menuBroche(), "Y")
            .appendField("vers").appendField(new Blockly.FieldDropdown([
                ["le haut", "haut"], ["le bas", "bas"],
                ["la gauche", "gauche"], ["la droite", "droite"], ["le centre", "centre"]
            ]), "DIRECTION");
        this.setOutput(true, "Boolean");
        this.setColour(COULEUR_GROVE);
    }};
    P.forBlock['grove_joystick_direction'] = function(block) {
        piloteJoystick();
        return ['_grove_joystick(' + block.getFieldValue('X') + ', ' + block.getFieldValue('Y') +
                ', "' + block.getFieldValue('DIRECTION') + '")', P.ORDER_FUNCTION_CALL];
    };

    Blockly.Blocks['grove_joystick_bouton'] = { init: function() {
        this.appendDummyInput().appendField("bouton du joystick sur")
            .appendField(menuBroche(), "BROCHE").appendField("pressé");
        this.setOutput(true, "Boolean");
        this.setColour(COULEUR_GROVE);
        this.setTooltip("L'appui sur le manche tire l'axe X presque à zéro.");
    }};
    P.forBlock['grove_joystick_bouton'] = function(block) {
        importerMicrobit();
        return ['(' + block.getFieldValue('BROCHE') + '.read_analog() < 250)', P.ORDER_ATOMIC];
    };

    // --- Potentiometre (Grove Rotary Angle Sensor) : une tension sur une broche analogique ---
    //
    // Le module donne 0 a 3,3 V sur 300° de course : read_analog() rend 0 a 1023.
    // Une fonction a part (et pas read_analog() directement) pour que le simulateur
    // la remplace par son curseur sans la confondre avec le joystick.

    function pilotePotentiometre() {
        importerMicrobit();
        pilote('potentiometre', [
            'def _grove_potentiometre(broche, unite):',
            '    v = broche.read_analog()',
            '    if unite == "angle":',
            '        return round(v * 300 / 1023)',
            '    if unite == "pourcent":',
            '        return round(v * 100 / 1023)',
            '    return v',
        ]);
    }

    const UNITES_POTENTIOMETRE = [
        ["valeur (0 à 1023)", "brut"], ["angle (0 à 300°)", "angle"], ["pourcentage (0 à 100 %)", "pourcent"]
    ];

    Blockly.Blocks['grove_potentiometre'] = { init: function() {
        this.appendDummyInput().appendField("potentiomètre sur").appendField(menuBroche(), "BROCHE")
            .appendField("en").appendField(new Blockly.FieldDropdown(UNITES_POTENTIOMETRE), "UNITE");
        this.setOutput(true, "Number");
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Position du bouton du potentiomètre Grove : valeur brute de 0 à 1023, angle de 0 à 300° " +
                        "ou pourcentage de 0 à 100 %. À brancher sur P0, P1 ou P2 (entrées analogiques).");
    }};
    P.forBlock['grove_potentiometre'] = function(block) {
        pilotePotentiometre();
        return ['_grove_potentiometre(' + block.getFieldValue('BROCHE') + ', "' + block.getFieldValue('UNITE') + '")',
                P.ORDER_FUNCTION_CALL];
    };

    // ======================================================================
    // PREMIER LOT GROVE (oct. 2026) : bouton poussoir, capteur de lumiere,
    // detecteur de mouvement PIR, buzzer, relais, ecran OLED 0,96".
    // ======================================================================
    // Chaque module passe par une fonction de pilote a son nom (_grove_bouton,
    // _grove_relais...) plutot que par read_digital()/write_digital() directs :
    // le simulateur remplace ces fonctions par ses commandes (panneau Grove)
    // sans les confondre avec une LED ou un joystick sur la meme broche.

    // --- Bouton poussoir (Grove Button : niveau haut quand il est enfonce) ---

    function piloteBouton() {
        importerMicrobit();
        pilote('bouton', [
            '_grove_bouton_avant = {}',
            '',
            'def _grove_bouton(broche):',
            '    return broche.read_digital() == 1',
            '',
            '# Vrai une seule fois par appui (front montant) : pour « lorsque le bouton est appuye ».',
            'def _grove_bouton_front(broche):',
            '    etat = broche.read_digital() == 1',
            '    avant = _grove_bouton_avant.get(id(broche), False)',
            '    _grove_bouton_avant[id(broche)] = etat',
            '    return etat and not avant',
        ]);
    }

    Blockly.Blocks['grove_bouton_appuye'] = { init: function() {
        this.appendDummyInput().appendField("bouton poussoir sur").appendField(menuBroche(), "BROCHE")
            .appendField("appuyé");
        this.setOutput(true, "Boolean");
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Vrai tant que le bouton poussoir Grove est enfoncé.");
    }};
    P.forBlock['grove_bouton_appuye'] = function(block) {
        piloteBouton();
        return ['_grove_bouton(' + block.getFieldValue('BROCHE') + ')', P.ORDER_FUNCTION_CALL];
    };

    Blockly.Blocks['grove_bouton_lorsque'] = { init: function() {
        this.appendDummyInput().appendField("lorsque le bouton poussoir sur").appendField(menuBroche(), "BROCHE")
            .appendField("est appuyé");
        this.appendStatementInput("DO").setCheck(null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("S'exécute une fois à chaque appui sur le bouton poussoir Grove.");
    }};
    P.forBlock['grove_bouton_lorsque'] = function(block) {
        piloteBouton();
        return declarerGestionnaire('on_grove_bouton_' + block.getFieldValue('BROCHE'), P.statementToCode(block, 'DO'));
    };

    // --- Capteur de lumiere (Grove Light Sensor : tension plus haute quand il y a plus de lumiere) ---

    function piloteLumiere() {
        importerMicrobit();
        pilote('lumiere', [
            'def _grove_lumiere(broche, unite):',
            '    v = broche.read_analog()',
            '    if unite == "pourcent":',
            '        return round(v * 100 / 1023)',
            '    return v',
        ]);
    }

    Blockly.Blocks['grove_lumiere'] = { init: function() {
        this.appendDummyInput().appendField("luminosité sur").appendField(menuBroche(), "BROCHE")
            .appendField("en").appendField(new Blockly.FieldDropdown([
                ["valeur (0 à 1023)", "brut"], ["pourcentage (0 à 100 %)", "pourcent"]
            ]), "UNITE");
        this.setOutput(true, "Number");
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Lumière reçue par le capteur de lumière Grove : plus il y a de lumière, plus la valeur " +
                        "est grande. À brancher sur P0, P1 ou P2 (entrées analogiques).");
    }};
    P.forBlock['grove_lumiere'] = function(block) {
        piloteLumiere();
        return ['_grove_lumiere(' + block.getFieldValue('BROCHE') + ', "' + block.getFieldValue('UNITE') + '")',
                P.ORDER_FUNCTION_CALL];
    };

    // --- Detecteur de mouvement PIR (Grove mini PIR : niveau haut quand un mouvement est vu) ---

    function pilotePir() {
        importerMicrobit();
        pilote('pir', [
            'def _grove_pir(broche):',
            '    return broche.read_digital() == 1',
        ]);
    }

    Blockly.Blocks['grove_pir'] = { init: function() {
        this.appendDummyInput().appendField("mouvement détecté sur").appendField(menuBroche(), "BROCHE");
        this.setOutput(true, "Boolean");
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Vrai quand le détecteur de mouvement PIR Grove voit bouger une personne ou un animal.");
    }};
    P.forBlock['grove_pir'] = function(block) {
        pilotePir();
        return ['_grove_pir(' + block.getFieldValue('BROCHE') + ')', P.ORDER_FUNCTION_CALL];
    };

    // --- Buzzer (Grove Buzzer, actif : il sonne tant que sa broche est au niveau haut) ---

    function piloteBuzzer() {
        importerMicrobit();
        pilote('buzzer', [
            'def _grove_buzzer(broche, etat):',
            '    broche.write_digital(1 if etat else 0)',
            '',
            'def _grove_buzzer_bip(broche, duree):',
            '    broche.write_digital(1)',
            '    sleep(int(duree))',
            '    broche.write_digital(0)',
        ]);
    }

    Blockly.Blocks['grove_buzzer_etat'] = { init: function() {
        this.appendDummyInput().appendField("buzzer sur").appendField(menuBroche(), "BROCHE")
            .appendField(new Blockly.FieldDropdown([["marche", "1"], ["arrêt", "0"]]), "ETAT");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Fait sonner le buzzer Grove (marche) ou le fait taire (arrêt).");
    }};
    P.forBlock['grove_buzzer_etat'] = function(block) {
        piloteBuzzer();
        return '_grove_buzzer(' + block.getFieldValue('BROCHE') + ', ' + block.getFieldValue('ETAT') + ')\n';
    };

    Blockly.Blocks['grove_buzzer_bip'] = { init: function() {
        this.appendValueInput("DUREE").setCheck("Number").appendField("bip du buzzer sur")
            .appendField(menuBroche(), "BROCHE").appendField("pendant");
        this.appendDummyInput().appendField("ms");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Fait sonner le buzzer Grove pendant la durée indiquée (en millisecondes), puis l'arrête.");
    }};
    P.forBlock['grove_buzzer_bip'] = function(block) {
        piloteBuzzer();
        return '_grove_buzzer_bip(' + block.getFieldValue('BROCHE') + ', ' +
               (P.valueToCode(block, 'DUREE', P.ORDER_NONE) || '200') + ')\n';
    };

    // --- Relais (Grove Relay : contact ferme tant que la broche est au niveau haut) ---

    function piloteRelais() {
        importerMicrobit();
        pilote('relais', [
            'def _grove_relais(broche, etat):',
            '    broche.write_digital(1 if etat else 0)',
        ]);
    }

    Blockly.Blocks['grove_relais'] = { init: function() {
        this.appendDummyInput().appendField("relais sur").appendField(menuBroche(), "BROCHE")
            .appendField(new Blockly.FieldDropdown([["fermé (marche)", "1"], ["ouvert (arrêt)", "0"]]), "ETAT");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Ferme le contact du relais Grove (l'appareil branché dessus fonctionne) ou l'ouvre (arrêt).");
    }};
    P.forBlock['grove_relais'] = function(block) {
        piloteRelais();
        return '_grove_relais(' + block.getFieldValue('BROCHE') + ', ' + block.getFieldValue('ETAT') + ')\n';
    };

    // --- Ecran OLED 0,96" 128x64 (Grove OLED Display 0.96", SSD1315 / SSD1306, I2C 0x3C) ---
    //
    // Mode texte, sans memoire d'image (la carte V1 n'a que 16 Ko) : chaque caractere est
    // ecrit directement dans l'ecran, 21 colonnes de 6 points sur 8 lignes de 8 points.
    // Police 5x7 classique (ASCII 32 a 126), la meme que le simulateur dessine (POLICE_OLED).
    // Les accents courants sont ramenes a la lettre simple, le reste devient « ? ».

    const POLICE_OLED = [
        0x00,0x00,0x00,0x00,0x00, 0x00,0x00,0x5F,0x00,0x00, 0x00,0x07,0x00,0x07,0x00, 0x14,0x7F,0x14,0x7F,0x14,
        0x24,0x2A,0x7F,0x2A,0x12, 0x23,0x13,0x08,0x64,0x62, 0x36,0x49,0x56,0x20,0x50, 0x00,0x05,0x03,0x00,0x00,
        0x00,0x1C,0x22,0x41,0x00, 0x00,0x41,0x22,0x1C,0x00, 0x14,0x08,0x3E,0x08,0x14, 0x08,0x08,0x3E,0x08,0x08,
        0x00,0x50,0x30,0x00,0x00, 0x08,0x08,0x08,0x08,0x08, 0x00,0x60,0x60,0x00,0x00, 0x20,0x10,0x08,0x04,0x02,
        0x3E,0x51,0x49,0x45,0x3E, 0x00,0x42,0x7F,0x40,0x00, 0x42,0x61,0x51,0x49,0x46, 0x21,0x41,0x45,0x4B,0x31,
        0x18,0x14,0x12,0x7F,0x10, 0x27,0x45,0x45,0x45,0x39, 0x3C,0x4A,0x49,0x49,0x30, 0x01,0x71,0x09,0x05,0x03,
        0x36,0x49,0x49,0x49,0x36, 0x06,0x49,0x49,0x29,0x1E, 0x00,0x36,0x36,0x00,0x00, 0x00,0x56,0x36,0x00,0x00,
        0x08,0x14,0x22,0x41,0x00, 0x14,0x14,0x14,0x14,0x14, 0x00,0x41,0x22,0x14,0x08, 0x02,0x01,0x51,0x09,0x06,
        0x32,0x49,0x79,0x41,0x3E, 0x7E,0x11,0x11,0x11,0x7E, 0x7F,0x49,0x49,0x49,0x36, 0x3E,0x41,0x41,0x41,0x22,
        0x7F,0x41,0x41,0x22,0x1C, 0x7F,0x49,0x49,0x49,0x41, 0x7F,0x09,0x09,0x09,0x01, 0x3E,0x41,0x49,0x49,0x7A,
        0x7F,0x08,0x08,0x08,0x7F, 0x00,0x41,0x7F,0x41,0x00, 0x20,0x40,0x41,0x3F,0x01, 0x7F,0x08,0x14,0x22,0x41,
        0x7F,0x40,0x40,0x40,0x40, 0x7F,0x02,0x0C,0x02,0x7F, 0x7F,0x04,0x08,0x10,0x7F, 0x3E,0x41,0x41,0x41,0x3E,
        0x7F,0x09,0x09,0x09,0x06, 0x3E,0x41,0x51,0x21,0x5E, 0x7F,0x09,0x19,0x29,0x46, 0x46,0x49,0x49,0x49,0x31,
        0x01,0x01,0x7F,0x01,0x01, 0x3F,0x40,0x40,0x40,0x3F, 0x1F,0x20,0x40,0x20,0x1F, 0x3F,0x40,0x38,0x40,0x3F,
        0x63,0x14,0x08,0x14,0x63, 0x07,0x08,0x70,0x08,0x07, 0x61,0x51,0x49,0x45,0x43, 0x00,0x7F,0x41,0x41,0x00,
        0x02,0x04,0x08,0x10,0x20, 0x00,0x41,0x41,0x7F,0x00, 0x04,0x02,0x01,0x02,0x04, 0x40,0x40,0x40,0x40,0x40,
        0x00,0x01,0x02,0x04,0x00, 0x20,0x54,0x54,0x54,0x78, 0x7F,0x48,0x44,0x44,0x38, 0x38,0x44,0x44,0x44,0x20,
        0x38,0x44,0x44,0x48,0x7F, 0x38,0x54,0x54,0x54,0x18, 0x08,0x7E,0x09,0x01,0x02, 0x0C,0x52,0x52,0x52,0x3E,
        0x7F,0x08,0x04,0x04,0x78, 0x00,0x44,0x7D,0x40,0x00, 0x20,0x40,0x44,0x3D,0x00, 0x7F,0x10,0x28,0x44,0x00,
        0x00,0x41,0x7F,0x40,0x00, 0x7C,0x04,0x18,0x04,0x78, 0x7C,0x08,0x04,0x04,0x78, 0x38,0x44,0x44,0x44,0x38,
        0x7C,0x14,0x14,0x14,0x08, 0x08,0x14,0x14,0x18,0x7C, 0x7C,0x08,0x04,0x04,0x08, 0x48,0x54,0x54,0x54,0x20,
        0x04,0x3F,0x44,0x40,0x20, 0x3C,0x40,0x40,0x20,0x7C, 0x1C,0x20,0x40,0x20,0x1C, 0x3C,0x40,0x30,0x40,0x3C,
        0x44,0x28,0x10,0x28,0x44, 0x0C,0x50,0x50,0x50,0x3C, 0x44,0x64,0x54,0x4C,0x44, 0x00,0x08,0x36,0x41,0x00,
        0x00,0x00,0x7F,0x00,0x00, 0x00,0x41,0x36,0x08,0x00, 0x10,0x08,0x08,0x10,0x08,
    ];
    window.POLICE_OLED = POLICE_OLED;
    // Accents courants -> lettre simple (meme table dans le pilote et dans le simulateur).
    const OLED_ACCENTS = 'àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ';
    const OLED_SANS_ACCENTS = 'aaaeeeeiioouuucAAAEEEEIIOOUUUC';
    window.oledAscii = function (texte) {
        return Array.from(String(texte)).map(c => {
            const i = OLED_ACCENTS.indexOf(c);
            if (i >= 0) c = OLED_SANS_ACCENTS[i];
            const o = c.charCodeAt(0);
            return o >= 32 && o <= 126 ? c : '?';
        }).join('');
    };

    function piloteOled() {
        importerMicrobit();
        piloteRegistre();
        const octets = POLICE_OLED.map(o => '\\x' + o.toString(16).padStart(2, '0')).join('');
        const lignesPolice = [];
        for (let i = 0; i < octets.length; i += 80) lignesPolice.push("    b'" + octets.slice(i, i + 80) + "'");
        pilote('oled', [
            '_OLED_POLICE = (',
            ...lignesPolice,
            ')',
            '_OLED_ACCENTS = "' + OLED_ACCENTS + '"',
            '_OLED_SANS = "' + OLED_SANS_ACCENTS + '"',
            '',
            'def _oled_ascii(texte):',
            '    r = ""',
            '    for c in texte:',
            '        i = _OLED_ACCENTS.find(c)',
            '        if i >= 0:',
            '            c = _OLED_SANS[i]',
            '        r += c if 32 <= ord(c) <= 126 else "?"',
            '    return r',
            '',
            'class _EcranOLED:',
            '    ADR = 0x3C',
            '',
            '    def __init__(self):',
            '        i2c.init()',
            '        for c in (0xAE, 0xD5, 0x80, 0xA8, 0x3F, 0xD3, 0x00, 0x40, 0x8D, 0x14, 0x20, 0x00,',
            '                  0xA1, 0xC8, 0xDA, 0x12, 0x81, 0xCF, 0xD9, 0xF1, 0xDB, 0x40, 0xA4, 0xA6, 0xAF):',
            '            self._commande(c)',
            '        self.effacer()',
            '',
            '    def _commande(self, valeur):',
            '        i2c.write(self.ADR, bytes([0x00, valeur]))',
            '',
            '    def _zone(self, x0, x1, page0, page1):',
            '        for c in (0x21, x0, x1, 0x22, page0, page1):',
            '            self._commande(c)',
            '',
            '    def effacer(self):',
            '        self._zone(0, 127, 0, 7)',
            '        vide = bytearray(17)',
            '        vide[0] = 0x40',
            '        for i in range(64):',
            '            i2c.write(self.ADR, vide)',
            '',
            '    def texte(self, message, x, y):',
            '        x = max(0, min(20, int(x)))',
            '        y = max(0, min(7, int(y)))',
            '        s = _oled_ascii(str(message))[:21 - x]',
            '        if not s:',
            '            return',
            '        self._zone(x * 6, x * 6 + len(s) * 6 - 1, y, y)',
            '        d = bytearray(1 + 6 * len(s))',
            '        d[0] = 0x40',
            '        for i in range(len(s)):',
            '            o = (ord(s[i]) - 32) * 5',
            '            for k in range(5):',
            '                d[1 + 6 * i + k] = _OLED_POLICE[o + k]',
            '        i2c.write(self.ADR, d)',
            '',
            'def _grove_oled():',
            '    return _grove_obj("oled", _EcranOLED)',
        ]);
    }

    Blockly.Blocks['grove_oled_init'] = { init: function() {
        this.appendDummyInput().appendField("initialiser l'écran OLED 0,96\"");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Adresse I²C 0x3C. Facultatif : l'écran s'initialise à la première utilisation.");
    }};
    P.forBlock['grove_oled_init'] = function(block) {
        piloteOled();
        return '_grove_objets["oled"] = _EcranOLED()\n';
    };

    Blockly.Blocks['grove_oled_texte'] = { init: function() {
        this.appendValueInput("TEXTE").appendField("OLED : afficher");
        this.appendValueInput("X").setCheck("Number").appendField("en colonne");
        this.appendValueInput("Y").setCheck("Number").appendField("ligne");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Colonne de 0 à 20, ligne de 0 à 7 (21 caractères sur 8 lignes).");
    }};
    P.forBlock['grove_oled_texte'] = function(block) {
        piloteOled();
        const x = P.valueToCode(block, 'X', P.ORDER_NONE) || '0';
        const y = P.valueToCode(block, 'Y', P.ORDER_NONE) || '0';
        return '_grove_oled().texte(' + versTexte(block, 'TEXTE') + ', ' + x + ', ' + y + ')\n';
    };

    Blockly.Blocks['grove_oled_effacer'] = { init: function() {
        this.appendDummyInput().appendField("OLED : effacer l'écran");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
    }};
    P.forBlock['grove_oled_effacer'] = function(block) {
        piloteOled();
        return '_grove_oled().effacer()\n';
    };

    // ======================================================================
    // DEUXIEME LOT GROVE (oct. 2026) : barre de LED, BMP280, SGP30, horloge
    // temps reel, pilote 16 servos. Meme principe que le premier lot : chaque
    // module passe par une classe ou une fonction de pilote a son nom, que le
    // simulateur remplace par ses commandes (index.html).
    // ======================================================================

    // Ports Grove a deux broches (carte d'extension Grove pour micro:bit) : broche jaune / broche blanche.
    const PORTS_GROVE = [
        ["P0 / P14", "pin0, pin14"], ["P1 / P15", "pin1, pin15"], ["P2 / P16", "pin2, pin16"], ["P8 / P12", "pin8, pin12"]
    ];

    // --- Barre de 10 LED (Grove LED Bar v2.0, puce MY9221, liaison donnees + horloge) ---
    //
    // Protocole repris de la bibliotheque Seeed (Grove_LED_Bar) : 16 bits de commande (0), puis 16 bits par
    // sortie (10 LED + 2 inutilisees), l'horloge CHANGE d'etat a chaque bit ; verrouillage par 4 impulsions
    // sur la ligne de donnees apres un temps au repos. Broche jaune = donnees (DI), blanche = horloge (DCKI).

    function piloteBarreLed() {
        importerMicrobit();
        piloteRegistre();
        pilote('barreled', [
            'class _BarreLED:',
            '    def __init__(self, donnee, horloge):',
            '        self.d = donnee',
            '        self.h = horloge',
            '        self.etat_h = 0',
            '        self.h.write_digital(0)',
            '        self.leds = [0] * 10',
            '        self._afficher()',
            '',
            '    def _envoyer(self, valeur):',
            '        for i in range(16):',
            '            self.d.write_digital((valeur >> (15 - i)) & 1)',
            '            self.etat_h = 1 - self.etat_h',
            '            self.h.write_digital(self.etat_h)',
            '',
            '    def _afficher(self):',
            '        self._envoyer(0)',
            '        for i in range(10):',
            '            self._envoyer(0xFF if self.leds[i] else 0)',
            '        self._envoyer(0)',
            '        self._envoyer(0)',
            '        self.d.write_digital(0)',
            '        sleep(1)',
            '        for i in range(4):',
            '            self.d.write_digital(1)',
            '            self.d.write_digital(0)',
            '',
            '    def niveau(self, n):',
            '        n = max(0, min(10, int(n)))',
            '        self.leds = [1 if i < n else 0 for i in range(10)]',
            '        self._afficher()',
            '',
            '    def led(self, numero, etat):',
            '        numero = int(numero)',
            '        if 1 <= numero <= 10:',
            '            self.leds[numero - 1] = 1 if etat else 0',
            '            self._afficher()',
            '',
            'def _grove_barre(donnee, horloge):',
            '    return _grove_obj("barre" + str(id(donnee)), lambda: _BarreLED(donnee, horloge))',
        ]);
    }

    Blockly.Blocks['grove_barre_niveau'] = { init: function() {
        this.appendValueInput("NIVEAU").setCheck("Number").appendField("barre de LED sur")
            .appendField(new Blockly.FieldDropdown(PORTS_GROVE), "PORT").appendField("niveau");
        this.appendDummyInput().appendField("(0 à 10)");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Allume les LED de la barre de 1 jusqu'au niveau indiqué (0 : toutes éteintes, 10 : toutes allumées).");
    }};
    P.forBlock['grove_barre_niveau'] = function(block) {
        piloteBarreLed();
        return '_grove_barre(' + block.getFieldValue('PORT') + ').niveau(' +
               (P.valueToCode(block, 'NIVEAU', P.ORDER_NONE) || '0') + ')\n';
    };

    Blockly.Blocks['grove_barre_led'] = { init: function() {
        this.appendValueInput("LED").setCheck("Number").appendField("barre de LED sur")
            .appendField(new Blockly.FieldDropdown(PORTS_GROVE), "PORT").appendField("LED n°");
        this.appendDummyInput().appendField(new Blockly.FieldDropdown([["allumée", "1"], ["éteinte", "0"]]), "ETAT");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Allume ou éteint une seule LED de la barre (numéro de 1 à 10).");
    }};
    P.forBlock['grove_barre_led'] = function(block) {
        piloteBarreLed();
        return '_grove_barre(' + block.getFieldValue('PORT') + ').led(' +
               (P.valueToCode(block, 'LED', P.ORDER_NONE) || '1') + ', ' + block.getFieldValue('ETAT') + ')\n';
    };

    // --- Pression et temperature (Grove Barometer BMP280, I2C 0x77) ---
    //
    // Formules de compensation en virgule flottante de la fiche technique Bosch (BMP280, §8.1).

    function piloteBmp280() {
        importerMicrobit();
        piloteRegistre();
        pilote('bmp280', [
            'class _CapteurBMP280:',
            '    ADR = 0x77',
            '',
            '    def __init__(self):',
            '        i2c.init()',
            '        i2c.write(self.ADR, bytes([0x88]))',
            '        c = i2c.read(self.ADR, 24)',
            '        mots = [c[2 * i] | (c[2 * i + 1] << 8) for i in range(12)]',
            '        s = lambda v: v - 65536 if v > 32767 else v',
            '        self.t = [mots[0], s(mots[1]), s(mots[2])]',
            '        self.p = [mots[3]] + [s(v) for v in mots[4:12]]',
            '        i2c.write(self.ADR, bytes([0xF5, 0x00]))',
            '        i2c.write(self.ADR, bytes([0xF4, 0x27]))      # x1 temperature, x1 pression, mode normal',
            '        sleep(10)',
            '',
            '    def _lire(self):',
            '        i2c.write(self.ADR, bytes([0xF7]))',
            '        d = i2c.read(self.ADR, 6)',
            '        adc_p = (d[0] << 12) | (d[1] << 4) | (d[2] >> 4)',
            '        adc_t = (d[3] << 12) | (d[4] << 4) | (d[5] >> 4)',
            '        T1, T2, T3 = self.t',
            '        v1 = (adc_t / 16384 - T1 / 1024) * T2',
            '        v2 = (adc_t / 131072 - T1 / 8192) ** 2 * T3',
            '        fin = v1 + v2',
            '        temperature = fin / 5120',
            '        P1, P2, P3, P4, P5, P6, P7, P8, P9 = self.p',
            '        v1 = fin / 2 - 64000',
            '        v2 = v1 * v1 * P6 / 32768 + v1 * P5 * 2',
            '        v2 = v2 / 4 + P4 * 65536',
            '        v1 = (P3 * v1 * v1 / 524288 + P2 * v1) / 524288',
            '        v1 = (1 + v1 / 32768) * P1',
            '        if v1 == 0:',
            '            return temperature, 0',
            '        p = (1048576 - adc_p - v2 / 4096) * 6250 / v1',
            '        p = p + (P9 * p * p / 2147483648 + p * P8 / 32768 + P7) / 16',
            '        return temperature, p / 100',
            '',
            '    def mesure(self, grandeur):',
            '        temperature, pression = self._lire()',
            '        if grandeur == "temperature":',
            '            return round(temperature, 1)',
            '        if grandeur == "altitude":',
            '            return round(44330 * (1 - (pression / 1013.25) ** (1 / 5.255)), 1)',
            '        return round(pression, 1)',
            '',
            'def _grove_bmp280():',
            '    return _grove_obj("bmp280", _CapteurBMP280)',
        ]);
    }

    Blockly.Blocks['grove_bmp280'] = { init: function() {
        this.appendDummyInput().appendField("BMP280 :").appendField(new Blockly.FieldDropdown([
            ["pression (hPa)", "pression"], ["température (°C)", "temperature"], ["altitude (m)", "altitude"]
        ]), "GRANDEUR");
        this.setOutput(true, "Number");
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Capteur de pression Grove BMP280 (port I²C) : pression de l'air en hectopascals, température en °C, " +
                        "ou altitude estimée en mètres (à partir d'une pression de 1013,25 hPa au niveau de la mer).");
    }};
    P.forBlock['grove_bmp280'] = function(block) {
        piloteBmp280();
        return ['_grove_bmp280().mesure("' + block.getFieldValue('GRANDEUR') + '")', P.ORDER_FUNCTION_CALL];
    };

    // --- Qualite de l'air (Grove VOC and eCO2 Gas Sensor, SGP30, I2C 0x58) ---
    //
    // Commandes Sensirion : 0x2003 demarre l'algorithme, 0x2008 mesure (reponse apres 12 ms : eCO2, CRC, COV, CRC).
    // Les 15 premieres secondes, le capteur rend 400 ppm et 0 ppb (chauffe).

    function piloteSgp30() {
        importerMicrobit();
        piloteRegistre();
        pilote('sgp30', [
            'class _CapteurSGP30:',
            '    ADR = 0x58',
            '',
            '    def __init__(self):',
            '        i2c.init()',
            '        i2c.write(self.ADR, bytes([0x20, 0x03]))',
            '        sleep(10)',
            '',
            '    def mesure(self, grandeur):',
            '        i2c.write(self.ADR, bytes([0x20, 0x08]))',
            '        sleep(12)',
            '        d = i2c.read(self.ADR, 6)',
            '        if grandeur == "cov":',
            '            return (d[3] << 8) | d[4]',
            '        return (d[0] << 8) | d[1]',
            '',
            'def _grove_sgp30():',
            '    return _grove_obj("sgp30", _CapteurSGP30)',
        ]);
    }

    Blockly.Blocks['grove_sgp30'] = { init: function() {
        this.appendDummyInput().appendField("qualité de l'air SGP30 :").appendField(new Blockly.FieldDropdown([
            ["eCO₂ (ppm)", "eco2"], ["COV totaux (ppb)", "cov"]
        ]), "GRANDEUR");
        this.setOutput(true, "Number");
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Capteur de qualité de l'air Grove SGP30 (port I²C) : équivalent CO₂ en ppm ou composés organiques " +
                        "volatils en ppb. Les 15 premières secondes, il rend 400 ppm et 0 ppb (chauffe).");
    }};
    P.forBlock['grove_sgp30'] = function(block) {
        piloteSgp30();
        return ['_grove_sgp30().mesure("' + block.getFieldValue('GRANDEUR') + '")', P.ORDER_FUNCTION_CALL];
    };

    // --- Horloge temps reel (Grove RTC DS1307 ; le DS3231 a les memes registres), I2C 0x68 ---
    //
    // Registres 0 a 6 en BCD : secondes (bit 7 = horloge arretee sur le DS1307), minutes, heures (mode 24 h),
    // jour de la semaine, jour, mois, annee (00 a 99).

    function piloteRtc() {
        importerMicrobit();
        piloteRegistre();
        pilote('rtc', [
            'class _HorlogeRTC:',
            '    ADR = 0x68',
            '',
            '    def __init__(self):',
            '        i2c.init()',
            '',
            '    def regler(self, annee, mois, jour, heure, minute, seconde):',
            '        bcd = lambda v: (int(v) // 10) * 16 + int(v) % 10',
            '        i2c.write(self.ADR, bytes([0, bcd(seconde) & 0x7F, bcd(minute), bcd(heure) & 0x3F, 1,',
            '                                   bcd(jour), bcd(mois), bcd(int(annee) % 100)]))',
            '',
            '    def _lire(self):',
            '        i2c.write(self.ADR, bytes([0]))',
            '        d = i2c.read(self.ADR, 7)',
            '        dec = lambda v: (v >> 4) * 10 + (v & 0x0F)',
            '        return {"seconde": dec(d[0] & 0x7F), "minute": dec(d[1]), "heure": dec(d[2] & 0x3F),',
            '                "jour": dec(d[4]), "mois": dec(d[5] & 0x1F), "annee": 2000 + dec(d[6])}',
            '',
            '    def lire(self, champ):',
            '        return self._lire()[champ]',
            '',
            '    def texte(self):',
            '        t = self._lire()',
            '        deux = lambda v: ("0" + str(v))[-2:]',
            '        return deux(t["heure"]) + ":" + deux(t["minute"]) + ":" + deux(t["seconde"])',
            '',
            'def _grove_rtc():',
            '    return _grove_obj("rtc", _HorlogeRTC)',
        ]);
    }

    Blockly.Blocks['grove_rtc_regler'] = { init: function() {
        this.appendDummyInput().appendField("régler l'horloge au");
        this.appendValueInput("JOUR").setCheck("Number").appendField("jour");
        this.appendValueInput("MOIS").setCheck("Number").appendField("mois");
        this.appendValueInput("ANNEE").setCheck("Number").appendField("année");
        this.appendValueInput("HEURE").setCheck("Number").appendField("à");
        this.appendValueInput("MINUTE").setCheck("Number").appendField("h");
        this.appendValueInput("SECONDE").setCheck("Number").appendField("min");
        this.appendDummyInput().appendField("s");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Met l'horloge temps réel Grove (DS1307 ou DS3231) à la date et à l'heure indiquées. À faire une " +
                        "seule fois : la pile du module garde l'heure, même carte débranchée.");
    }};
    P.forBlock['grove_rtc_regler'] = function(block) {
        piloteRtc();
        const v = (nom, defaut) => P.valueToCode(block, nom, P.ORDER_NONE) || defaut;
        return '_grove_rtc().regler(' + [v('ANNEE', '2026'), v('MOIS', '1'), v('JOUR', '1'), v('HEURE', '0'),
                                        v('MINUTE', '0'), v('SECONDE', '0')].join(', ') + ')\n';
    };

    Blockly.Blocks['grove_rtc_lire'] = { init: function() {
        this.appendDummyInput().appendField("horloge :").appendField(new Blockly.FieldDropdown([
            ["heure", "heure"], ["minute", "minute"], ["seconde", "seconde"],
            ["jour", "jour"], ["mois", "mois"], ["année", "annee"]
        ]), "CHAMP");
        this.setOutput(true, "Number");
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Lit l'heure, la minute, la seconde, le jour, le mois ou l'année de l'horloge temps réel Grove.");
    }};
    P.forBlock['grove_rtc_lire'] = function(block) {
        piloteRtc();
        return ['_grove_rtc().lire("' + block.getFieldValue('CHAMP') + '")', P.ORDER_FUNCTION_CALL];
    };

    Blockly.Blocks['grove_rtc_texte'] = { init: function() {
        this.appendDummyInput().appendField("horloge : heure en texte (hh:mm:ss)");
        this.setOutput(true, "String");
        this.setColour(COULEUR_GROVE);
        this.setTooltip("L'heure de l'horloge temps réel sous forme de texte, par exemple « 08:05:30 ».");
    }};
    P.forBlock['grove_rtc_texte'] = function(block) {
        piloteRtc();
        return ['_grove_rtc().texte()', P.ORDER_FUNCTION_CALL];
    };

    // --- Pilote 16 servos (Grove 16-Channel PWM Driver, PCA9685, I2C 0x7F ; cartes Adafruit et autres : 0x40) ---
    //
    // Frequence 50 Hz : prediviseur 25 MHz / (4096 x 50) - 1 = 121. Impulsion de 500 a 2500 us comme les servos
    // sur broche ; une periode de 20 ms vaut 4096 pas.

    function pilotePca9685() {
        importerMicrobit();
        piloteRegistre();
        pilote('pca9685', [
            'class _PiloteServos:',
            '    def __init__(self, adresse=0x7F):',
            '        self.adr = adresse',
            '        i2c.init()',
            '        self._ecrire(0x00, 0x10)          # veille, pour changer la frequence',
            '        self._ecrire(0xFE, 121)           # 50 Hz',
            '        self._ecrire(0x00, 0x00)',
            '        sleep(5)',
            '        self._ecrire(0x00, 0xA0)          # redemarrage, auto-increment',
            '',
            '    def _ecrire(self, registre, valeur):',
            '        i2c.write(self.adr, bytes([registre, valeur]))',
            '',
            '    def _impulsion(self, voie, microsecondes):',
            '        pas = int(max(500, min(2500, microsecondes)) * 4096 / 20000)',
            '        i2c.write(self.adr, bytes([0x06 + 4 * voie, 0, 0, pas & 0xFF, pas >> 8]))',
            '',
            '    def angle(self, voie, angle):',
            '        voie = max(0, min(15, int(voie)))',
            '        angle = max(0, min(180, int(angle)))',
            '        self._impulsion(voie, 500 + angle * 2000 / 180)',
            '',
            '    def continu(self, voie, vitesse):',
            '        voie = max(0, min(15, int(voie)))',
            '        vitesse = max(-100, min(100, int(vitesse)))',
            '        self._impulsion(voie, 1500 + vitesse * 10)',
            '',
            'def _grove_servos():',
            '    return _grove_obj("pca9685", _PiloteServos)',
        ]);
    }

    Blockly.Blocks['grove_pca_init'] = { init: function() {
        this.appendDummyInput().appendField("initialiser le pilote 16 servos à l'adresse")
            .appendField(new Blockly.FieldDropdown([["0x7F (Grove)", "0x7F"], ["0x40 (autres cartes)", "0x40"]]), "ADRESSE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Pilote 16 servos PCA9685 (port I²C). Facultatif avec le module Grove (adresse 0x7F) ; " +
                        "indispensable avec une carte à l'adresse 0x40.");
    }};
    P.forBlock['grove_pca_init'] = function(block) {
        pilotePca9685();
        return '_grove_objets["pca9685"] = _PiloteServos(' + block.getFieldValue('ADRESSE') + ')\n';
    };

    Blockly.Blocks['grove_pca_angle'] = { init: function() {
        this.appendValueInput("VOIE").setCheck("Number").appendField("pilote 16 servos : servo n°");
        this.appendValueInput("ANGLE").setCheck("Number").appendField("à");
        this.appendDummyInput().appendField("°");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Place le servomoteur branché sur la voie indiquée (0 à 15) à l'angle voulu (0 à 180°).");
    }};
    P.forBlock['grove_pca_angle'] = function(block) {
        pilotePca9685();
        return '_grove_servos().angle(' + (P.valueToCode(block, 'VOIE', P.ORDER_NONE) || '0') + ', ' +
               (P.valueToCode(block, 'ANGLE', P.ORDER_NONE) || '90') + ')\n';
    };

    Blockly.Blocks['grove_pca_continu'] = { init: function() {
        this.appendValueInput("VOIE").setCheck("Number").appendField("pilote 16 servos : servo continu n°");
        this.appendValueInput("VITESSE").setCheck("Number").appendField("à");
        this.appendDummyInput().appendField("%");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Fait tourner le servomoteur à rotation continue de la voie indiquée (0 à 15), de -100 à 100 % ; 0 = arrêt.");
    }};
    P.forBlock['grove_pca_continu'] = function(block) {
        pilotePca9685();
        return '_grove_servos().continu(' + (P.valueToCode(block, 'VOIE', P.ORDER_NONE) || '0') + ', ' +
               (P.valueToCode(block, 'VITESSE', P.ORDER_NONE) || '0') + ')\n';
    };

    // --- Capteur de gestes PAJ7620 (I2C) ---
    //
    // Table d'initialisation et registres repris de la bibliotheque Seeed
    // (Gesture_PAJ7620, src/paj7620.h) : 50 registres, adresse 0x73, resultats
    // en 0x43 (8 gestes) et 0x44 (le geste « vague »).

    const GESTES_PAJ = [
        ["vers le haut", "haut"], ["vers le bas", "bas"],
        ["vers la gauche", "gauche"], ["vers la droite", "droite"],
        ["vers l'avant", "avant"], ["vers l'arrière", "arriere"],
        ["sens horaire", "horaire"], ["sens antihoraire", "antihoraire"],
        ["vague", "vague"]
    ];

    function piloteGestes() {
        importerMicrobit();
        piloteRegistre();
        pilote('paj7620', [
            '_PAJ_ADR = 0x73',
            '_PAJ_INIT = (',
            '    (0xEF, 0x00), (0x37, 0x07), (0x38, 0x17), (0x39, 0x06), (0x42, 0x01),',
            '    (0x46, 0x2D), (0x47, 0x0F), (0x48, 0x3C), (0x49, 0x00), (0x4A, 0x1E),',
            '    (0x4C, 0x20), (0x51, 0x10), (0x5E, 0x10), (0x60, 0x27), (0x80, 0x42),',
            '    (0x81, 0x44), (0x82, 0x04), (0x8B, 0x01), (0x90, 0x06), (0x95, 0x0A),',
            '    (0x96, 0x0C), (0x97, 0x05), (0x9A, 0x14), (0x9C, 0x3F), (0xA5, 0x19),',
            '    (0xCC, 0x19), (0xCD, 0x0B), (0xCE, 0x13), (0xCF, 0x64), (0xD0, 0x21),',
            '    (0xEF, 0x01), (0x02, 0x0F), (0x03, 0x10), (0x04, 0x02), (0x25, 0x01),',
            '    (0x27, 0x39), (0x28, 0x7F), (0x29, 0x08), (0x3E, 0xFF), (0x5E, 0x3D),',
            '    (0x65, 0x96), (0x67, 0x97), (0x69, 0xCD), (0x6A, 0x01), (0x6D, 0x2C),',
            '    (0x6E, 0x01), (0x72, 0x01), (0x73, 0x35), (0x77, 0x01), (0xEF, 0x00),',
            ')',
            '',
            '# bit 0 a 7 du registre 0x43, puis bit 0 du registre 0x44',
            '_PAJ_NOMS = ("haut", "bas", "gauche", "droite",',
            '             "avant", "arriere", "horaire", "antihoraire")',
            '',
            'class _CapteurGestes:',
            '    def __init__(self):',
            '        i2c.init()',
            '        # Reveil du capteur : la premiere lecture echoue souvent.',
            '        try:',
            '            i2c.write(_PAJ_ADR, bytes([0x00]))',
            '            i2c.read(_PAJ_ADR, 1)',
            '        except OSError:',
            '            pass',
            '        sleep(5)',
            '        for registre, valeur in _PAJ_INIT:',
            '            i2c.write(_PAJ_ADR, bytes([registre, valeur]))',
            '',
            '    def lire(self):',
            '        try:',
            '            i2c.write(_PAJ_ADR, bytes([0x43]))',
            '            drapeaux = i2c.read(_PAJ_ADR, 2)',
            '        except OSError:',
            '            return ""',
            '        bas = drapeaux[0]',
            '        for i in range(8):',
            '            if bas & (1 << i):',
            '                return _PAJ_NOMS[i]',
            '        if drapeaux[1] & 1:',
            '            return "vague"',
            '        return ""',
            '',
            'def _grove_gestes():',
            '    return _grove_obj("gestes", _CapteurGestes)',
        ]);
    }

    Blockly.Blocks['grove_gestes_init'] = { init: function() {
        this.appendDummyInput().appendField("initialiser le capteur de gestes");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Facultatif : le capteur s'initialise à la première lecture.");
    }};
    P.forBlock['grove_gestes_init'] = function(block) {
        piloteGestes();
        return '_grove_objets["gestes"] = _CapteurGestes()\n';
    };

    Blockly.Blocks['grove_gestes_lire'] = { init: function() {
        this.appendDummyInput().appendField("geste détecté");
        this.setOutput(true, "String");
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Texte vide si aucun geste depuis la dernière lecture.");
    }};
    P.forBlock['grove_gestes_lire'] = function(block) {
        piloteGestes();
        return ['_grove_gestes().lire()', P.ORDER_FUNCTION_CALL];
    };

    Blockly.Blocks['grove_gestes_est'] = { init: function() {
        this.appendDummyInput().appendField("le geste détecté est")
            .appendField(new Blockly.FieldDropdown(GESTES_PAJ), "GESTE");
        this.setOutput(true, "Boolean");
        this.setColour(COULEUR_GROVE);
    }};
    P.forBlock['grove_gestes_est'] = function(block) {
        piloteGestes();
        return ['(_grove_gestes().lire() == "' + block.getFieldValue('GESTE') + '")', P.ORDER_ATOMIC];
    };

    // ---------- Grove : modules I2C ----------
    //
    // Adresses, trames et formules reprises des bibliotheques Seeed
    // (pxt-grove : sensors/AHT20.ts, blocks/GroveLCD1602v1.ts,
    // sensors/VEML6040.ts, sensors/DRV8830.ts, sensors/SCD30.ts,
    // sensors/SCD41.ts). Meme encadrement « pilote grove » que plus haut.

    /** CRC8 Sensirion (polynome 0x31, valeur initiale 0xFF), commun à AHT20 et SCD. */
    function piloteCrc8() {
        pilote('crc8', [
            'def _grove_crc8(donnees):',
            '    crc = 0xFF',
            '    for octet in donnees:',
            '        crc ^= octet',
            '        for _ in range(8):',
            '            if crc & 0x80:',
            '                crc = ((crc << 1) ^ 0x31) & 0xFF',
            '            else:',
            '                crc = (crc << 1) & 0xFF',
            '    return crc',
        ]);
    }

    // --- Température & humidité : AHT20, et DHT20 qui embarque la même puce ---

    function piloteTempHum() {
        importerMicrobit();
        piloteRegistre();
        piloteCrc8();
        pilote('aht20', [
            'class _CapteurTH:',
            '    ADR = 0x38',
            '',
            '    def __init__(self):',
            '        i2c.init()',
            '        sleep(40)',
            '        i2c.write(self.ADR, bytes([0xBE, 0x08, 0x00]))',
            '        sleep(10)',
            '',
            '    def _mesurer(self):',
            '        i2c.write(self.ADR, bytes([0xAC, 0x33, 0x00]))',
            '        sleep(80)',
            '        t = i2c.read(self.ADR, 7)',
            '        # Le 7e octet controle les 6 premiers : mesure rejetee si faux.',
            '        if _grove_crc8(t[0:6]) != t[6]:',
            '            return None',
            '        return t',
            '',
            '    def humidite(self):',
            '        t = self._mesurer()',
            '        if t is None:',
            '            return -1',
            '        brut = (t[1] << 12) + (t[2] << 4) + (t[3] >> 4)',
            '        return brut * 100 / 1048576',
            '',
            '    def temperature(self):',
            '        t = self._mesurer()',
            '        if t is None:',
            '            return -1',
            '        brut = ((t[3] & 0x0F) << 16) + (t[4] << 8) + t[5]',
            '        return brut * 200 / 1048576 - 50',
            '',
            'def _grove_th():',
            '    return _grove_obj("th", _CapteurTH)',
        ]);
    }

    Blockly.Blocks['grove_th_init'] = { init: function() {
        this.appendDummyInput().appendField("initialiser le capteur température & humidité");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("AHT20 ou DHT20 : même puce, adresse I²C 0x38. Facultatif.");
    }};
    P.forBlock['grove_th_init'] = function(block) {
        piloteTempHum();
        return '_grove_objets["th"] = _CapteurTH()\n';
    };

    Blockly.Blocks['grove_th_mesure'] = { init: function() {
        this.appendDummyInput().appendField("capteur T&H :")
            .appendField(new Blockly.FieldDropdown([
                ["température (°C)", "c"], ["température (°F)", "f"], ["humidité (%)", "h"]
            ]), "GRANDEUR");
        this.setOutput(true, "Number");
        this.setColour(COULEUR_GROVE);
    }};
    P.forBlock['grove_th_mesure'] = function(block) {
        piloteTempHum();
        const g = block.getFieldValue('GRANDEUR');
        if (g === 'h') return ['_grove_th().humidite()', P.ORDER_FUNCTION_CALL];
        if (g === 'f') return ['(_grove_th().temperature() * 9 / 5 + 32)', P.ORDER_ATOMIC];
        return ['_grove_th().temperature()', P.ORDER_FUNCTION_CALL];
    };

    // --- DHT11 et DHT22 : assembleur sur micro:bit V1, machine.time_pulse_us sur V2 (experimental) ---
    //
    // Assemblage ARM Thumb repris de rhubarbdog/microbit-dht11 (MIT), seule
    // implementation DHT11 connue pour micro:bit-MicroPython qui fonctionne
    // reellement : le protocole une-seule-broche de ces capteurs exige de
    // mesurer des impulsions de 26 a 70 microsecondes, hors de portee d'une
    // boucle Python interpretee, d'ou l'assembleur. Le DHT22 utilise le meme
    // schema de signal (mêmes durees d'impulsion), seul le decodage des 5
    // octets differe : le meme _dht_grab sert aux deux capteurs.
    //
    // Sur V2 (nRF52833 a 64 MHz contre 16 MHz pour le V1), ce meme code
    // echantillonne 4x trop vite et rate le signal. Un correctif communautaire
    // existe pour le DHT11 (multiplier le delai par 4) mais son auteur le
    // decrit lui-meme comme instable : une mesure valide toutes les ~20
    // secondes environ (issue #93, depot micropython-microbit-v2 de la
    // fondation micro:bit). Le decalage bit-a-bit ci-dessous (DHT_DECALAGE),
    // lui, n'a jamais ete revalide pour le V2 par personne.
    // Sur V2 (machine.freq() les distingue), une autre lecture prend donc le
    // relais (oct. 2026) : machine.time_pulse_us mesure la duree de chaque
    // impulsion haute (bit 0 ~27 us, bit 1 ~70 us), sans assembleur ni decalage
    // de broche ; la somme de controle ecarte une lecture fausse, jusqu'a 3
    // essais. Experimental tant qu'elle n'est pas validee sur de vraies cartes
    // et de vrais capteurs : en cas d'echec, les blocs renvoient -1, jamais une
    // valeur fausse. L'AHT20/DHT20 (I²C) reste le choix le plus sur sur V2.

    const DHT_DECALAGE = {
        pin0: 3, pin1: 2, pin2: 1, pin8: 18, pin12: 20,
        pin13: 23, pin14: 22, pin15: 21, pin16: 16
    };

    function piloteDht() {
        importerMicrobit();
        importerModule('machine');
        piloteRegistre();
        pilote('dht', [
            '@micropython.asm_thumb',
            'def _dht_birq():',
            "    cpsid('i')",
            '',
            '@micropython.asm_thumb',
            'def _dht_ubirq():',
            "    cpsie('i')",
            '',
            '# Echantillonne la broche pendant `limite` cycles et range 0/1 dans',
            '# `tampon` : c\'est la seule partie du pilote assez rapide et reguliere',
            '# pour suivre les impulsions du DHT11/DHT22. r0 = decalage bit GPIO,',
            '# r1 = tampon, r2 = limite. Ne pas modifier sans banc de mesure : un',
            '# decalage de delai casse silencieusement la lecture.',
            '@micropython.asm_thumb',
            'def _dht_grab(r0, r1, r2):',
            '    b(DEBUT)',
            '    label(DELAI)',
            '    mov(r7, 0x2d)',
            '    label(boucle_delai)',
            '    sub(r7, 1)',
            '    bne(boucle_delai)',
            '    bx(lr)',
            '    label(LIRE_BROCHE)',
            '    mov(r3, 0x50)',
            '    lsl(r3, r3, 16)',
            '    add(r3, 0x05)',
            '    lsl(r3, r3, 8)',
            '    add(r3, 0x10)',
            '    ldr(r4, [r3, 0])',
            '    mov(r3, 0x01)',
            '    lsl(r3, r0)',
            '    and_(r4, r3)',
            '    lsr(r4, r0)',
            '    bx(lr)',
            '    label(DEBUT)',
            '    mov(r5, 0x00)',
            '    label(boucle)',
            '    mov(r6, 0x00)',
            '    bl(LIRE_BROCHE)',
            '    orr(r6, r4)',
            '    bl(DELAI)',
            '    bl(LIRE_BROCHE)',
            '    lsl(r4, r4, 8)',
            '    orr(r6, r4)',
            '    bl(DELAI)',
            '    bl(LIRE_BROCHE)',
            '    lsl(r4, r4, 16)',
            '    orr(r6, r4)',
            '    bl(DELAI)',
            '    bl(LIRE_BROCHE)',
            '    lsl(r4, r4, 24)',
            '    orr(r6, r4)',
            '    bl(DELAI)',
            '    add(r1, r1, r5)',
            '    str(r6, [r1, 0])',
            '    sub(r1, r1, r5)',
            '    add(r5, r5, 4)',
            '    sub(r4, r2, r5)',
            '    bne(boucle)',
            '    mov(r0, r5)',
            '',
            '# Le tampon capture par blocs de 4 cycles compresses sur 4 octets :',
            "# on le redeplie en une liste de longueurs d'impulsions (des suites de",
            '# 1 consecutifs).',
            'def _dht_analyser(tampon):',
            '    longueurs = bytearray(50)',
            '    en_cours = 0',
            '    indice = 0',
            '    debut = True',
            '    for valeur in tampon:',
            '        if valeur == 1:',
            '            en_cours += 1',
            '        elif indice == 0 and en_cours == 0:',
            '            pass',
            '        elif debut:',
            '            en_cours = 0',
            '            debut = False',
            '        elif indice >= 50:',
            '            pass',
            '        elif en_cours > 0:',
            '            longueurs[indice] = en_cours',
            '            en_cours = 0',
            '            indice += 1',
            '    if indice == 0:',
            '        return None',
            '    resultat = bytearray(indice)',
            '    for i in range(indice):',
            '        resultat[i] = longueurs[i]',
            '    return resultat',
            '',
            "# Un bit court est un '0', un bit long est un '1' : le seuil est le",
            '# milieu entre la plus courte et la plus longue impulsion mesurees.',
            'def _dht_octets(impulsions):',
            '    plus_courte, plus_longue = 1000, 0',
            '    for l in impulsions:',
            '        if l < plus_courte: plus_courte = l',
            '        if l > plus_longue: plus_longue = l',
            '    seuil = plus_courte + (plus_longue - plus_courte) / 2',
            '    octets = bytearray(5)',
            '    indice_octet = 0',
            '    accumulateur = 0',
            '    for i, l in enumerate(impulsions):',
            '        accumulateur = (accumulateur << 1) & 0xFF',
            '        if l > seuil:',
            '            accumulateur |= 1',
            '        if (i + 1) % 8 == 0:',
            '            octets[indice_octet] = accumulateur',
            '            indice_octet += 1',
            '            accumulateur = 0',
            '    return octets',
            '',
            '# micro:bit V2 (64 MHz) : l\'assembleur ci-dessus echantillonne trop vite.',
            '# On mesure plutot la duree de chaque impulsion haute avec',
            '# machine.time_pulse_us : bit 0 = environ 27 us, bit 1 = environ 70 us.',
            '# Entre deux bits, la ligne reste basse 50 us : c\'est le temps dont la',
            '# boucle dispose pour relancer la mesure suivante (assez sur V2).',
            'def _dht_mesurer_octets_v2(broche, depart_ms):',
            '    mesure = machine.time_pulse_us',
            '    hauts = [0] * 41',
            '    import gc',
            '    gc.collect()   # pas de ramasse-miettes pendant la lecture',
            '    broche.write_digital(1)',
            '    sleep(50)',
            '    broche.write_digital(0)   # signal de depart',
            '    sleep(depart_ms)',
            '    broche.read_digital()     # la carte lache la ligne',
            '    broche.set_pull(broche.PULL_UP)',
            '    if mesure(broche, 0, 1000) < 0:   # reponse du capteur : bas ~80 us',
            '        return None',
            '    for i in range(41):   # haut ~80 us de la reponse, puis les 40 bits',
            '        hauts[i] = mesure(broche, 1, 1000)',
            '    octets = bytearray(5)',
            '    for i in range(40):',
            '        duree = hauts[i + 1]',
            '        if duree < 0:',
            '            return None   # impulsion manquee : mesure a refaire',
            '        octets[i // 8] = (octets[i // 8] << 1) | (1 if duree > 48 else 0)',
            '    if octets[4] != (octets[0] + octets[1] + octets[2] + octets[3]) & 0xFF:',
            '        return None',
            '    return octets',
            '',
            '# Commun aux deux capteurs : signal de depart, capture, verification du',
            '# nombre de bits recus. Renvoie les 5 octets bruts, ou None si la mesure',
            '# a echoue (capteur absent, bruit, ...). V2 : lecture par time_pulse_us,',
            '# jusqu\'a 3 essais (une impulsion peut etre manquee).',
            'def _dht_mesurer_octets(broche, decalage, depart_ms=20):',
            '    if machine.freq() > 20000000:',
            '        for essai in range(3):',
            '            octets = _dht_mesurer_octets_v2(broche, depart_ms)',
            '            if octets is not None:',
            '                return octets',
            '            sleep(1100)',
            '        return None',
            '    tampon = bytearray(320)',
            '    limite = (len(tampon) // 4) * 4',
            '    for i in range(limite, len(tampon)):',
            '        tampon[i] = 1',
            '    broche.write_digital(1)',
            '    sleep(50)',
            '    _dht_birq()',
            '    broche.write_digital(0)',
            '    sleep(20)',
            '    broche.set_pull(broche.PULL_UP)',
            '    capture = _dht_grab(decalage, tampon, limite)',
            '    _dht_ubirq()',
            '    if capture != limite:',
            '        return None',
            '    impulsions = _dht_analyser(tampon)',
            '    del tampon',
            '    if impulsions is None or len(impulsions) != 40:',
            '        return None',
            '    octets = _dht_octets(impulsions)',
            '    if octets[4] != (octets[0] + octets[1] + octets[2] + octets[3]) & 0xFF:',
            '        return None',
            '    return octets',
            '',
            'class _CapteurDHT11:',
            '    def __init__(self, broche, decalage):',
            '        self._p, self._d = broche, decalage',
            '        self.t, self.h = -1, -1',
            '',
            '    def _mesurer(self):',
            '        octets = _dht_mesurer_octets(self._p, self._d)',
            '        sleep(1000)   # le DHT11 refuse une nouvelle lecture avant ~1 s',
            '        if octets is None:',
            '            return False',
            '        self.t = octets[2] + octets[3] / 10',
            '        self.h = octets[0] + octets[1] / 10',
            '        return True',
            '',
            '    def temperature(self):',
            '        return self.t if self._mesurer() else -1',
            '',
            '    def humidite(self):',
            '        return self.h if self._mesurer() else -1',
            '',
            '# Meme signal que le DHT11, mais 16 bits par grandeur (dixiemes de degre',
            '# et de %) au lieu de deux octets entier+decimale : la temperature a un',
            '# bit de signe (bit de poids fort du 3e octet).',
            'class _CapteurDHT22:',
            '    def __init__(self, broche, decalage):',
            '        self._p, self._d = broche, decalage',
            '        self.t, self.h = -1, -1',
            '',
            '    def _mesurer(self):',
            '        octets = _dht_mesurer_octets(self._p, self._d, 2)   # depart : 1 a 10 ms pour le DHT22',
            '        sleep(2000)   # le DHT22 refuse une nouvelle lecture avant ~2 s',
            '        if octets is None:',
            '            return False',
            '        humidite_brute = (octets[0] << 8) | octets[1]',
            '        temperature_brute = ((octets[2] & 0x7F) << 8) | octets[3]',
            '        self.h = humidite_brute / 10',
            '        self.t = -temperature_brute / 10 if octets[2] & 0x80 else temperature_brute / 10',
            '        return True',
            '',
            '    def temperature(self):',
            '        return self.t if self._mesurer() else -1',
            '',
            '    def humidite(self):',
            '        return self.h if self._mesurer() else -1',
            '',
            'def _grove_dht11():',
            '    return _grove_obj("dht11", lambda: _CapteurDHT11(pin1, 2))',
            '',
            'def _grove_dht22():',
            '    return _grove_obj("dht22", lambda: _CapteurDHT22(pin1, 2))',
        ]);
    }

    function blocDefinirDht(type, nomCapteur, nomVariable, classe) {
        Blockly.Blocks[type] = { init: function() {
            this.appendDummyInput().appendField("définir le " + nomCapteur + " sur")
                .appendField(menuBroche(), "BROCHE");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COULEUR_GROVE);
            this.setTooltip("Facultatif : sans ce bloc, le " + nomCapteur + " est pris sur P1. " +
                "Sur micro:bit V2, lecture expérimentale : -1 si la mesure échoue (voir readme.txt §7). " +
                "L'AHT20/DHT20 (I²C) reste le plus fiable.");
        }};
        P.forBlock[type] = function(block) {
            piloteDht();
            const broche = block.getFieldValue('BROCHE');
            return '_grove_objets["' + nomVariable + '"] = ' + classe + '(' + broche + ', ' + DHT_DECALAGE[broche] + ')\n';
        };
    }

    function blocMesurerDht(type, nomCapteur, accesseur) {
        Blockly.Blocks[type] = { init: function() {
            this.appendDummyInput().appendField(nomCapteur + " :")
                .appendField(new Blockly.FieldDropdown([
                    ["température (°C)", "c"], ["température (°F)", "f"], ["humidité (%)", "h"]
                ]), "GRANDEUR");
            this.setOutput(true, "Number");
            this.setColour(COULEUR_GROVE);
            this.setTooltip("Mesure du capteur (une mesure par seconde au plus pour le DHT11, toutes les 2 s pour le DHT22). " +
                "Sur micro:bit V2, lecture expérimentale : -1 si la mesure échoue, jamais une valeur fausse. " +
                "L'AHT20/DHT20 (module I²C) reste le plus fiable.");
        }};
        P.forBlock[type] = function(block) {
            piloteDht();
            const g = block.getFieldValue('GRANDEUR');
            if (g === 'h') return [accesseur + '().humidite()', P.ORDER_FUNCTION_CALL];
            if (g === 'f') return ['(' + accesseur + '().temperature() * 9 / 5 + 32)', P.ORDER_ATOMIC];
            return [accesseur + '().temperature()', P.ORDER_FUNCTION_CALL];
        };
    }

    blocDefinirDht('grove_dht11_definir', 'DHT11', 'dht11', '_CapteurDHT11');
    blocMesurerDht('grove_dht11_mesure', 'DHT11', '_grove_dht11');
    blocDefinirDht('grove_dht22_definir', 'DHT22', 'dht22', '_CapteurDHT22');
    blocMesurerDht('grove_dht22_mesure', 'DHT22', '_grove_dht22');

    // --- Écran LCD 16x2 v1 (JHD1802) ---

    function piloteLcd() {
        importerMicrobit();
        piloteRegistre();
        pilote('lcd1602', [
            'class _EcranLCD:',
            '    ADR = 0x3E',
            '',
            '    def __init__(self):',
            '        i2c.init()',
            '        self.controle = 0x04',
            '        sleep(50)',
            '        self._commande(0x28)                       # 2 lignes, 5x8',
            '        self._commande(0x08 | self.controle)       # affichage allume',
            '        self._commande(0x06)                       # avance du curseur',
            '        self.effacer()',
            '',
            '    def _commande(self, valeur):',
            '        i2c.write(self.ADR, bytes([0x80, valeur]))',
            '',
            '    def _donnee(self, valeur):',
            '        i2c.write(self.ADR, bytes([0x40, valeur]))',
            '',
            '    def effacer(self):',
            '        self._commande(0x01)',
            '        sleep(2)',
            '',
            '    def allumer(self):',
            '        self.controle = self.controle | 0x04',
            '        self._commande(0x08 | self.controle)',
            '',
            '    def eteindre(self):',
            '        self.controle = self.controle & 0xFB',
            '        self._commande(0x08 | self.controle)',
            '',
            '    def texte(self, message, x, y):',
            '        x = max(0, min(15, int(x)))',
            '        y = max(0, min(1, int(y)))',
            '        self._commande((x | 0x80) if y == 0 else (x | 0xC0))',
            '        for c in str(message)[:16 - x]:',
            '            self._donnee(ord(c))',
            '',
            'def _grove_lcd():',
            '    return _grove_obj("lcd", _EcranLCD)',
        ]);
    }

    Blockly.Blocks['grove_lcd_init'] = { init: function() {
        this.appendDummyInput().appendField("initialiser l'écran LCD 16x2");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Adresse I²C 0x3E. Facultatif : l'écran s'initialise à la première utilisation.");
    }};
    P.forBlock['grove_lcd_init'] = function(block) {
        piloteLcd();
        return '_grove_objets["lcd"] = _EcranLCD()\n';
    };

    Blockly.Blocks['grove_lcd_texte'] = { init: function() {
        this.appendValueInput("TEXTE").appendField("LCD : afficher");
        this.appendValueInput("X").setCheck("Number").appendField("en x");
        this.appendValueInput("Y").setCheck("Number").appendField("y");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("x de 0 à 15, y de 0 à 1.");
    }};
    P.forBlock['grove_lcd_texte'] = function(block) {
        piloteLcd();
        const x = P.valueToCode(block, 'X', P.ORDER_NONE) || '0';
        const y = P.valueToCode(block, 'Y', P.ORDER_NONE) || '0';
        return '_grove_lcd().texte(' + versTexte(block, 'TEXTE') + ', ' + x + ', ' + y + ')\n';
    };

    Blockly.Blocks['grove_lcd_effacer'] = { init: function() {
        this.appendDummyInput().appendField("LCD : effacer");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
    }};
    P.forBlock['grove_lcd_effacer'] = function(block) {
        piloteLcd();
        return '_grove_lcd().effacer()\n';
    };

    Blockly.Blocks['grove_lcd_alimenter'] = { init: function() {
        this.appendDummyInput().appendField("LCD :")
            .appendField(new Blockly.FieldDropdown([
                ["allumer", "allumer"], ["éteindre", "eteindre"]
            ]), "ETAT").appendField("l'affichage");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Masque ou affiche les caractères. Le rétroéclairage de cet écran " +
                        "monochrome reste allumé en permanence : il ne se commande pas.");
    }};
    P.forBlock['grove_lcd_alimenter'] = function(block) {
        piloteLcd();
        return '_grove_lcd().' + block.getFieldValue('ETAT') + '()\n';
    };

    // --- Écran LCD 16x2 RGB Backlight V4.0 (JHD1313M3) ---
    //
    // Deux circuits I2C sur le meme module : le texte (0x3E, memes commandes
    // que le LCD v1 ci-dessus) et le retro-eclairage RGB (0x62, puce PCA9633
    // sur la V4.0 ; la V5.0 passe a 0x30 / SGM31323 et n'est PAS geree ici).
    // Sequence d'initialisation du retro-eclairage donnee par la fiche Seeed :
    // MODE1 = 0, MODE2 = 0, LEDOUT = 0xAA (PWM individuel sur les trois voies),
    // puis PWM : registre 4 = rouge, 3 = vert, 2 = bleu. Alimentation 5 V
    // (la V4.0 n'accepte pas le 3,3 V).

    function piloteLcdRgb() {
        importerMicrobit();
        piloteRegistre();
        pilote('lcdrgb', [
            'class _EcranLCDRGB:',
            '    ADR = 0x3E',
            '    RGB = 0x62',
            '',
            '    def __init__(self):',
            '        i2c.init()',
            '        self.controle = 0x04',
            '        self.couleur = (255, 255, 255)',
            '        self.fond_actif = True',
            '        sleep(50)',
            '        self._commande(0x28)                       # 2 lignes, 5x8',
            '        sleep(5)',
            '        self._commande(0x28)',
            '        sleep(1)',
            '        self._commande(0x28)',
            '        self._commande(0x08 | self.controle)       # affichage allume',
            '        self.effacer()',
            '        self._commande(0x06)                       # avance du curseur',
            '        self._rgb(0x00, 0x00)                      # MODE1',
            '        self._rgb(0x01, 0x00)                      # MODE2',
            '        self._rgb(0x08, 0xAA)                      # LEDOUT : PWM sur R, V, B',
            '        self.fond(255, 255, 255)',
            '',
            '    def _commande(self, valeur):',
            '        i2c.write(self.ADR, bytes([0x80, valeur]))',
            '',
            '    def _donnee(self, valeur):',
            '        i2c.write(self.ADR, bytes([0x40, valeur]))',
            '',
            '    def _rgb(self, registre, valeur):',
            '        i2c.write(self.RGB, bytes([registre, valeur]))',
            '',
            '    def effacer(self):',
            '        self._commande(0x01)',
            '        sleep(2)',
            '',
            '    def allumer(self):',
            '        self.controle = self.controle | 0x04',
            '        self._commande(0x08 | self.controle)',
            '',
            '    def eteindre(self):',
            '        self.controle = self.controle & 0xFB',
            '        self._commande(0x08 | self.controle)',
            '',
            '    def texte(self, message, x, y):',
            '        x = max(0, min(15, int(x)))',
            '        y = max(0, min(1, int(y)))',
            '        self._commande((x | 0x80) if y == 0 else (x | 0xC0))',
            '        for c in str(message)[:16 - x]:',
            '            self._donnee(ord(c))',
            '',
            '    def _ecrire_fond(self, r, v, b):',
            '        self._rgb(0x04, r)',
            '        self._rgb(0x03, v)',
            '        self._rgb(0x02, b)',
            '',
            '    def fond(self, r, v, b):',
            '        r = max(0, min(255, int(r)))',
            '        v = max(0, min(255, int(v)))',
            '        b = max(0, min(255, int(b)))',
            '        self.couleur = (r, v, b)',
            '        if self.fond_actif:',
            '            self._ecrire_fond(r, v, b)',
            '',
            '    def retro(self, actif):',
            '        self.fond_actif = actif',
            '        if actif:',
            '            self._ecrire_fond(self.couleur[0], self.couleur[1], self.couleur[2])',
            '        else:',
            '            self._ecrire_fond(0, 0, 0)',
            '',
            'def _grove_lcdrgb():',
            '    return _grove_obj("lcdrgb", _EcranLCDRGB)',
        ]);
    }

    Blockly.Blocks['grove_lcdrgb_init'] = { init: function() {
        this.appendDummyInput().appendField("initialiser l'écran LCD RGB (V4.0)");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Grove LCD RGB Backlight V4.0 (JHD1313M3) : texte à l'adresse I²C 0x3E, " +
                        "rétroéclairage à 0x62, alimentation 5 V. Facultatif : l'écran s'initialise " +
                        "à la première utilisation (fond blanc).");
    }};
    P.forBlock['grove_lcdrgb_init'] = function(block) {
        piloteLcdRgb();
        return '_grove_objets["lcdrgb"] = _EcranLCDRGB()\n';
    };

    Blockly.Blocks['grove_lcdrgb_texte'] = { init: function() {
        this.appendValueInput("TEXTE").appendField("LCD RGB : afficher");
        this.appendValueInput("X").setCheck("Number").appendField("en x");
        this.appendValueInput("Y").setCheck("Number").appendField("y");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("x de 0 à 15, y de 0 à 1.");
    }};
    P.forBlock['grove_lcdrgb_texte'] = function(block) {
        piloteLcdRgb();
        const x = P.valueToCode(block, 'X', P.ORDER_NONE) || '0';
        const y = P.valueToCode(block, 'Y', P.ORDER_NONE) || '0';
        return '_grove_lcdrgb().texte(' + versTexte(block, 'TEXTE') + ', ' + x + ', ' + y + ')\n';
    };

    Blockly.Blocks['grove_lcdrgb_effacer'] = { init: function() {
        this.appendDummyInput().appendField("LCD RGB : effacer");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
    }};
    P.forBlock['grove_lcdrgb_effacer'] = function(block) {
        piloteLcdRgb();
        return '_grove_lcdrgb().effacer()\n';
    };

    Blockly.Blocks['grove_lcdrgb_alimenter'] = { init: function() {
        this.appendDummyInput().appendField("LCD RGB :")
            .appendField(new Blockly.FieldDropdown([
                ["allumer", "allumer"], ["éteindre", "eteindre"]
            ]), "ETAT").appendField("l'affichage");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Masque ou affiche les caractères (ils sont conservés). " +
                        "Le rétroéclairage se commande à part : voir « rétroéclairage ».");
    }};
    P.forBlock['grove_lcdrgb_alimenter'] = function(block) {
        piloteLcdRgb();
        return '_grove_lcdrgb().' + block.getFieldValue('ETAT') + '()\n';
    };

    Blockly.Blocks['grove_lcdrgb_fond_couleur'] = { init: function() {
        this.appendDummyInput().appendField("LCD RGB : rétroéclairage")
            .appendField(menuCouleur(), "COULEUR");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Choisit la couleur du fond. « noir » éteint le fond (aucune lumière).");
    }};
    P.forBlock['grove_lcdrgb_fond_couleur'] = function(block) {
        piloteLcdRgb();
        const c = Number(block.getFieldValue('COULEUR'));
        return '_grove_lcdrgb().fond(' + ((c >> 16) & 255) + ', ' + ((c >> 8) & 255) + ', ' + (c & 255) + ')\n';
    };

    Blockly.Blocks['grove_lcdrgb_fond_rvb'] = { init: function() {
        this.appendValueInput("R").setCheck("Number").appendField("LCD RGB : rétroéclairage rouge");
        this.appendValueInput("V").setCheck("Number").appendField("vert");
        this.appendValueInput("B").setCheck("Number").appendField("bleu");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Chaque intensité va de 0 à 255.");
    }};
    P.forBlock['grove_lcdrgb_fond_rvb'] = function(block) {
        piloteLcdRgb();
        const r = P.valueToCode(block, 'R', P.ORDER_NONE) || '0';
        const v = P.valueToCode(block, 'V', P.ORDER_NONE) || '0';
        const b = P.valueToCode(block, 'B', P.ORDER_NONE) || '0';
        return '_grove_lcdrgb().fond(' + r + ', ' + v + ', ' + b + ')\n';
    };

    Blockly.Blocks['grove_lcdrgb_retro'] = { init: function() {
        this.appendDummyInput().appendField("LCD RGB :")
            .appendField(new Blockly.FieldDropdown([
                ["allumer", "True"], ["éteindre", "False"]
            ]), "ETAT").appendField("le rétroéclairage");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Éteindre coupe la lumière du fond ; allumer rétablit la dernière couleur choisie.");
    }};
    P.forBlock['grove_lcdrgb_retro'] = function(block) {
        piloteLcdRgb();
        return '_grove_lcdrgb().retro(' + block.getFieldValue('ETAT') + ')\n';
    };

    // --- Capteur de couleur VEML6040 ---

    function piloteCouleur() {
        importerMicrobit();
        piloteRegistre();
        pilote('veml6040', [
            'class _CapteurCouleur:',
            '    ADR = 0x10',
            '    CANAUX = {"rouge": 0x08, "vert": 0x09, "bleu": 0x0A, "blanc": 0x0B}',
            '',
            '    def __init__(self):',
            '        i2c.init()',
            '        # Configuration : mesure continue, integration 40 ms.',
            '        i2c.write(self.ADR, bytes([0x00, 0x00, 0x00]))',
            '        sleep(50)',
            '',
            '    def lire(self, canal):',
            '        i2c.write(self.ADR, bytes([self.CANAUX[canal]]))',
            '        t = i2c.read(self.ADR, 2)',
            '        return t[0] + (t[1] << 8)   # 16 bits, octet de poids faible en tete',
            '',
            'def _grove_couleur():',
            '    return _grove_obj("couleur", _CapteurCouleur)',
        ]);
    }

    Blockly.Blocks['grove_couleur_init'] = { init: function() {
        this.appendDummyInput().appendField("initialiser le capteur de couleur");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("VEML6040, adresse I²C 0x10. Facultatif.");
    }};
    P.forBlock['grove_couleur_init'] = function(block) {
        piloteCouleur();
        return '_grove_objets["couleur"] = _CapteurCouleur()\n';
    };

    Blockly.Blocks['grove_couleur_lire'] = { init: function() {
        this.appendDummyInput().appendField("capteur de couleur : canal")
            .appendField(new Blockly.FieldDropdown([
                ["rouge", "rouge"], ["vert", "vert"], ["bleu", "bleu"], ["blanc", "blanc"]
            ]), "CANAL");
        this.setOutput(true, "Number");
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Valeur brute sur 16 bits.");
    }};
    P.forBlock['grove_couleur_lire'] = function(block) {
        piloteCouleur();
        return ['_grove_couleur().lire("' + block.getFieldValue('CANAL') + '")', P.ORDER_FUNCTION_CALL];
    };

    // --- Pilote moteur DRV8830 (deux canaux, deux adresses) ---

    function piloteMoteur() {
        importerMicrobit();
        pilote('drv8830', [
            '# Canal 1 : adresse 8 bits 0xCA, canal 2 : 0xC0, decalees d un bit.',
            '_DRV_ADR = {1: 0x65, 2: 0x60}',
            '',
            'def _grove_moteur_ecrire(canal, registre, valeur):',
            '    i2c.init()',
            '    i2c.write(_DRV_ADR[canal], bytes([registre, valeur]))',
            '',
            'def _grove_moteur_vitesse(canal, vitesse):',
            '    vitesse = max(-63, min(63, int(vitesse)))',
            '    _grove_moteur_ecrire(canal, 0x01, 0x80)   # effacer un defaut en attente',
            '    sens = 0x01 if vitesse < 0 else 0x02',
            '    _grove_moteur_ecrire(canal, 0x00, ((abs(vitesse) & 0x3F) << 2) | sens)',
            '',
            'def _grove_moteur_arret(canal):',
            '    _grove_moteur_ecrire(canal, 0x00, 0x00)',
            '',
            'def _grove_moteur_frein(canal):',
            '    _grove_moteur_ecrire(canal, 0x00, 0x03)',
            '',
            'def _grove_moteur_effacer_defaut(canal):',
            '    _grove_moteur_ecrire(canal, 0x01, 0x80)',
            '',
            'def _grove_moteur_defaut(canal):',
            '    i2c.init()',
            '    i2c.write(_DRV_ADR[canal], bytes([0x01]))',
            '    return i2c.read(_DRV_ADR[canal], 1)[0]',
        ]);
    }

    const menuCanalMoteur = () => new Blockly.FieldDropdown([["1", "1"], ["2", "2"]]);

    Blockly.Blocks['grove_moteur_vitesse'] = { init: function() {
        this.appendValueInput("VITESSE").setCheck("Number")
            .appendField("moteur canal").appendField(menuCanalMoteur(), "CANAL")
            .appendField("vitesse");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("De -63 à 63. Négatif pour tourner à l'envers.");
    }};
    P.forBlock['grove_moteur_vitesse'] = function(block) {
        piloteMoteur();
        const v = P.valueToCode(block, 'VITESSE', P.ORDER_NONE) || '0';
        return '_grove_moteur_vitesse(' + block.getFieldValue('CANAL') + ', ' + v + ')\n';
    };

    Blockly.Blocks['grove_moteur_action'] = { init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                ["arrêter", "arret"], ["freiner", "frein"], ["effacer le défaut de", "effacer_defaut"]
            ]), "ACTION")
            .appendField("le moteur canal").appendField(menuCanalMoteur(), "CANAL");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
    }};
    P.forBlock['grove_moteur_action'] = function(block) {
        piloteMoteur();
        return '_grove_moteur_' + block.getFieldValue('ACTION') +
               '(' + block.getFieldValue('CANAL') + ')\n';
    };

    Blockly.Blocks['grove_moteur_defaut'] = { init: function() {
        this.appendDummyInput().appendField("défaut du moteur canal").appendField(menuCanalMoteur(), "CANAL");
        this.setOutput(true, "Number");
        this.setColour(COULEUR_GROVE);
        this.setTooltip("0 si tout va bien.");
    }};
    P.forBlock['grove_moteur_defaut'] = function(block) {
        piloteMoteur();
        return ['_grove_moteur_defaut(' + block.getFieldValue('CANAL') + ')', P.ORDER_FUNCTION_CALL];
    };

    // --- Capteurs de CO2 SCD30 et SCD41 ---

    function piloteScd30() {
        importerMicrobit();
        piloteRegistre();
        importerModule('ustruct');
        piloteCrc8();
        pilote('scd30', [
            'class _CapteurSCD30:',
            '    ADR = 0x61',
            '',
            '    def __init__(self):',
            '        i2c.init()',
            '        self._commande(0x0010, 0x0000)   # mesure continue',
            '        sleep(20)',
            '',
            '    def _commande(self, commande, valeur):',
            '        trame = bytes([commande >> 8, commande & 0xFF, valeur >> 8, valeur & 0xFF])',
            '        i2c.write(self.ADR, trame + bytes([_grove_crc8(trame[2:4])]))',
            '',
            '    def _pret(self):',
            '        i2c.write(self.ADR, bytes([0x02, 0x02]))',
            '        sleep(3)',
            '        t = i2c.read(self.ADR, 3)',
            '        return ((t[0] << 8) + t[1]) != 0',
            '',
            '    def lire(self, grandeur):',
            '        if not self._pret():',
            '            return -1',
            '        i2c.write(self.ADR, bytes([0x03, 0x00]))',
            '        sleep(3)',
            '        t = i2c.read(self.ADR, 18)',
            '        # Trois flottants, chacun en deux moities suivies de leur CRC.',
            '        depart = {"co2": 0, "temperature": 6, "humidite": 12}[grandeur]',
            '        d = depart',
            '        return ustruct.unpack(">f", bytes([t[d], t[d+1], t[d+3], t[d+4]]))[0]',
            '',
            'def _grove_scd30():',
            '    return _grove_obj("scd30", _CapteurSCD30)',
        ]);
    }

    function piloteScd41() {
        importerMicrobit();
        piloteRegistre();
        pilote('scd41', [
            'class _CapteurSCD41:',
            '    ADR = 0x62',
            '',
            '    def __init__(self):',
            '        i2c.init()',
            '        self._commande(0x3F86)   # arreter une mesure periodique en cours',
            '        sleep(500)',
            '        self._commande(0x3646)   # reinitialiser',
            '        sleep(30)',
            '        self._commande(0x21B1)   # demarrer la mesure periodique',
            '        sleep(10)',
            '',
            '    def _commande(self, commande):',
            '        i2c.write(self.ADR, bytes([commande >> 8, commande & 0xFF]))',
            '',
            '    def _pret(self):',
            '        self._commande(0xE4B8)',
            '        sleep(2)',
            '        t = i2c.read(self.ADR, 3)',
            '        return (((t[0] << 8) + t[1]) & 0x07FF) != 0',
            '',
            '    def lire(self, grandeur):',
            '        if not self._pret():',
            '            return -1',
            '        self._commande(0xEC05)',
            '        sleep(2)',
            '        t = i2c.read(self.ADR, 9)',
            '        if grandeur == "co2":',
            '            return (t[0] << 8) + t[1]',
            '        if grandeur == "temperature":',
            '            return ((t[3] << 8) + t[4]) * 175.0 / 65535.0 - 45.0',
            '        return ((t[6] << 8) + t[7]) * 100.0 / 65535.0',
            '',
            'def _grove_scd41():',
            '    return _grove_obj("scd41", _CapteurSCD41)',
        ]);
    }

    const GRANDEURS_CO2 = [["CO₂ (ppm)", "co2"], ["température (°C)", "temperature"], ["humidité (%)", "humidite"]];

    Blockly.Blocks['grove_scd30_init'] = { init: function() {
        this.appendDummyInput().appendField("initialiser le capteur CO₂ SCD30");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Adresse I²C 0x61. Facultatif.");
    }};
    P.forBlock['grove_scd30_init'] = function(block) {
        piloteScd30();
        return '_grove_objets["scd30"] = _CapteurSCD30()\n';
    };

    Blockly.Blocks['grove_scd30_lire'] = { init: function() {
        this.appendDummyInput().appendField("SCD30 :")
            .appendField(new Blockly.FieldDropdown(GRANDEURS_CO2), "GRANDEUR");
        this.setOutput(true, "Number");
        this.setColour(COULEUR_GROVE);
    }};
    P.forBlock['grove_scd30_lire'] = function(block) {
        piloteScd30();
        return ['_grove_scd30().lire("' + block.getFieldValue('GRANDEUR') + '")', P.ORDER_FUNCTION_CALL];
    };

    Blockly.Blocks['grove_scd41_init'] = { init: function() {
        this.appendDummyInput().appendField("initialiser le capteur CO₂ SCD41");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COULEUR_GROVE);
        this.setTooltip("Adresse I²C 0x62. Facultatif.");
    }};
    P.forBlock['grove_scd41_init'] = function(block) {
        piloteScd41();
        return '_grove_objets["scd41"] = _CapteurSCD41()\n';
    };

    Blockly.Blocks['grove_scd41_lire'] = { init: function() {
        this.appendDummyInput().appendField("SCD41 :")
            .appendField(new Blockly.FieldDropdown(GRANDEURS_CO2), "GRANDEUR");
        this.setOutput(true, "Number");
        this.setColour(COULEUR_GROVE);
    }};
    P.forBlock['grove_scd41_lire'] = function(block) {
        piloteScd41();
        return ['_grove_scd41().lire("' + block.getFieldValue('GRANDEUR') + '")', P.ORDER_FUNCTION_CALL];
    };

    // ==========================================
    // 1 bis. PROFIL ADMINISTRATEUR — configuration et libellés
    // ==========================================
    // Chargee et cablee AVANT l'injection de Blockly : les deux blocs de
    // depart (au_demarrage, boucle_infinie) sont crees juste apres l'inject,
    // et doivent deja beneficier des libelles personnalises s'il y en a.

    const CLE_CONFIG_ADMIN = 'easybloc_ts_config_admin';
    // Nom Easybloc (31 oct. 2026) : reglages enregistres sous l'ancienne cle repris une fois.
    try { if (localStorage.getItem(CLE_CONFIG_ADMIN) === null && localStorage.getItem('blockly_ts_config_admin') !== null)
              localStorage.setItem(CLE_CONFIG_ADMIN, localStorage.getItem('blockly_ts_config_admin')); } catch (erreur) { /* stockage indisponible */ }

    function configAdminParDefaut() {
        return { categories: { order: [], hidden: [], labels: {}, colors: {} }, groupes: {}, sousMenus: [], libellesBlocs: {} };
    }

    function chargerConfigAdmin() {
        const defaut = configAdminParDefaut();
        try {
            const brut = localStorage.getItem(CLE_CONFIG_ADMIN);
            if (!brut) return defaut;
            const lu = JSON.parse(brut);
            const config = {
                categories: Object.assign(defaut.categories, lu.categories),
                groupes: lu.groupes || {},
                sousMenus: lu.sousMenus || [],
                libellesBlocs: lu.libellesBlocs || {}
            };
            // Config enregistree par une version anterieure aux couleurs : completer
            // les champs manquants plutot que de planter au premier acces.
            if (!config.categories.colors) config.categories.colors = {};
            // Categorie « Affichage » renommee « Matrice LED » (oct. 2026) : une config enregistree avant garde ses reglages.
            const RENOMMEES = { 'Affichage': 'Matrice LED' };
            const c = config.categories;
            for (const [ancien, nouveau] of Object.entries(RENOMMEES)) {
                c.order = (c.order || []).map(n => (n === ancien ? nouveau : n));
                c.hidden = (c.hidden || []).map(n => (n === ancien ? nouveau : n));
                for (const table of [c.labels, c.colors]) {
                    if (table && ancien in table && !(nouveau in table)) { table[nouveau] = table[ancien]; delete table[ancien]; }
                }
            }
            for (const parent in config.groupes) {
                if (!config.groupes[parent].colors) config.groupes[parent].colors = {};
            }
            return config;
        } catch (erreur) { return defaut; }
    }

    function sauvegarderConfigAdmin() {
        try { localStorage.setItem(CLE_CONFIG_ADMIN, JSON.stringify(configAdmin)); }
        catch (erreur) { /* stockage indisponible : la config vaut pour la session */ }
    }

    let configAdmin = chargerConfigAdmin();

    // Chaque appendField("texte") sans nom cree un FieldLabel anonyme. On le
    // repere par sa position parmi les seuls FieldLabel du bloc (ordre des
    // appendField dans init) : une cle stable tant que le bloc n'est pas
    // reecrit, sans avoir a nommer a la main les centaines de libelles.
    function texteChampsLibelle(bloc) {
        const textes = [];
        for (const entree of bloc.inputList) {
            for (const champ of entree.fieldRow) {
                if (champ instanceof Blockly.FieldLabel) textes.push(champ.getValue());
            }
        }
        return textes;
    }

    function appliquerLibellesBloc(bloc) {
        let index = 0;
        for (const entree of bloc.inputList) {
            for (const champ of entree.fieldRow) {
                if (champ instanceof Blockly.FieldLabel) {
                    const voulu = configAdmin.libellesBlocs[bloc.type + '#' + index];
                    if (voulu !== undefined && champ.getValue() !== voulu) champ.setValue(voulu);
                    index++;
                }
            }
        }
    }

    // Espace de travail invisible, jamais injecte dans la page : sert
    // uniquement a instancier chaque type de bloc une fois pour relever ses
    // libelles d'origine, avant que la surcouche ne les modifie.
    const LIBELLES_DEFAUT = {};
    const espaceSonde = new Blockly.Workspace();
    for (const type in Blockly.Blocks) {
        const definition = Blockly.Blocks[type];
        if (!definition || typeof definition.init !== 'function') continue;
        const initOrigine = definition.init;

        try {
            const sonde = espaceSonde.newBlock(type);
            LIBELLES_DEFAUT[type] = texteChampsLibelle(sonde);
            sonde.dispose();
        } catch (erreur) { /* bloc dynamique ou mutateur incompatible hors atelier : ignore */ }

        definition.init = function() {
            initOrigine.call(this);
            appliquerLibellesBloc(this);
        };
    }
    espaceSonde.dispose();

    // ==========================================
    // 2. CRÉATION DE L'INTERFACE (TOOLBOX)
    // ==========================================
    // ---------- Couleurs des categories ----------
    // Une couleur par categorie, UNE seule table : la puce de la colonne de categories (bandeau.js la recopie depuis la
    // couleur de la categorie) ET les blocs de la categorie. Demande de l'utilisateur : les blocs ont exactement la couleur
    // de leur puce. Couleurs alignees sur la version Arduino R4 (EasyBloc) ; Capteurs, Actionneurs et Servos, sans
    // equivalent Arduino, ont une couleur choisie la plus eloignee possible des autres. Aucune couleur identique entre deux
    // categories. Les sous-categories (Radio, Grove) heritent de leur parent. Sur une couleur claire, le texte du
    // bloc passe en fonce (voir texteSombreSurBlocsClairs). Pour changer une couleur : modifier la ligne ci-dessous.
    const PALETTE_CATEGORIES = {
        'Boucles': '#fd7e14',
        'Temps': '#15aabf',
        'Matrice LED': '#f03e3e',
        'Entrées/Sorties': '#343a40',
        'Capteurs': '#d2cc79',
        'Actionneurs (Audio)': '#622d86',
        'Servos': '#25f478',
        // Cartes d'extension : chaque carte garde sa couleur (ses blocs ne changent pas de teinte).
        'Cartes d\'extension': '#0b7285',
        'DFR0548': '#0b7285',
        'Motor:bit': '#1971c2',
        'Radio': '#1864ab',
        'IA': '#9c6644',
        'Grove': '#2b8a3e',
        'Logique': '#fcc419',
        'Variables': '#e64980',
        'Maths': '#82c91e',
        'Texte': '#7048e8',
        'Fonctions': '#cc5de8',
        'Listes': '#a61e4d',
    };
    // Texte des blocs : blanc par defaut ; fonce sur les couleurs claires, ou le blanc contraste a moins de 3:1 (seuil
    // WCAG, luminance relative) : Boucles, Temps, Capteurs, Servos, Logique, Maths. Regle CSS par couleur : « un bloc dont le fond a cette
    // couleur » -> ses propres libelles (enfants directs : les blocs emboites gardent leur propre regle). Sans effet en
    // contraste eleve (blocs noirs ou blancs, voir index.html).
    (function texteSombreSurBlocsClairs() {
        const lum = hex => {
            const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
            return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
        };
        const FONCE = '#1a1a1a', L_FONCE = lum(FONCE);
        const claires = Object.values(PALETTE_CATEGORIES).filter(h => 1.05 / (lum(h) + 0.05) < 3);   // blanc sous 3:1 (seuil WCAG)
        if (!claires.length) return;
        const style = document.createElement('style');
        style.textContent = claires.map(h => ':root:not([data-contrast="high"]) g:has(> path.blocklyPath[fill="' + h + '" i]) > g > text.blocklyText:not(.blocklyDropdownText)')
            .join(',\n') + ' { fill: ' + FONCE + '; }';
        document.head.appendChild(style);
        window.blocsTexteFonce = claires;
    })();
    // Blocs de categories dynamiques de Blockly (absents de la liste du tiroir).
    const BLOCS_PALETTE_SUPPLEMENTAIRES = {
        'Variables': ['variables_get', 'variables_set', 'math_change'],
        'Fonctions': ['procedures_defnoreturn', 'procedures_defreturn', 'procedures_callnoreturn',
                      'procedures_callreturn', 'procedures_ifreturn'],
    };
    // ---------- Ordre des categories ----------
    // Ordre voulu par l'utilisateur (la table sert aussi d'ordre « par defaut » du panneau administrateur, qui part de
    // TOOLBOX_ORIGINAL). Les categories qui n'y figurent pas restent
    // a la suite, dans leur ordre d'origine. « Communication » est renommee « Radio ». « Graphique » n'existe pas encore.
    const ORDRE_CATEGORIES = ['Boucles', 'Temps', 'Matrice LED', 'Entrées/Sorties', 'Capteurs', 'Actionneurs (Audio)', 'Servos', 'Cartes d\'extension', 'Radio', 'IA', 'Grove',
                              'Logique', 'Variables', 'Maths', 'Texte', 'Fonctions', 'Listes'];
    const CATEGORIE_LISTES = {
        "kind": "category", "name": "Listes", "colour": "260",
        "contents": [
            { "kind": "block", "type": "lists_create_with", "extraState": { "itemCount": 3 } },
            { "kind": "block", "type": "lists_create_with", "extraState": { "itemCount": 0 } },
            { "kind": "block", "type": "lists_repeat", "inputs": { "NUM": { "shadow": { "type": "math_number", "fields": { "NUM": "5" } } } } },
            { "kind": "block", "type": "lists_length" },
            { "kind": "block", "type": "lists_isEmpty" },
            { "kind": "block", "type": "lists_indexOf" },
            { "kind": "block", "type": "lists_getIndex" },
            { "kind": "block", "type": "lists_setIndex" },
            { "kind": "block", "type": "lists_getSublist" }
        ]
    };
    function reordonnerToolbox(toolbox) {
        const cats = toolbox.contents;
        for (const c of cats) if (c.kind === 'category' && c.name === 'Communication') c.name = 'Radio';
        if (!cats.some(c => c.kind === 'category' && c.name === 'Listes')) cats.push(JSON.parse(JSON.stringify(CATEGORIE_LISTES)));
        const rang = c => { const i = ORDRE_CATEGORIES.indexOf(c.name); return i === -1 ? ORDRE_CATEGORIES.length : i; };
        const indexInitial = new Map(cats.map((c, i) => [c, i]));
        cats.sort((a, b) => rang(a) - rang(b) || indexInitial.get(a) - indexInitial.get(b));   // tri stable
        // Sous-categories de Grove par ordre alphabetique (accents et majuscules ignores, ordre francais).
        const grove = cats.find(c => c.kind === 'category' && c.name === 'Grove');
        if (grove && Array.isArray(grove.contents)) {
            grove.contents.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'fr', { sensitivity: 'base' }));
        }
        return toolbox;
    }

    function appliquerPaletteToolbox(toolbox) {
        reordonnerToolbox(toolbox);
        const parType = {};
        const parcourir = (categories, couleurParent) => {
            for (const cat of categories) {
                if (cat.kind !== 'category') continue;
                const couleur = PALETTE_CATEGORIES[cat.name] || couleurParent;
                if (!couleur) continue;
                cat.colour = couleur;
                for (const type of BLOCS_PALETTE_SUPPLEMENTAIRES[cat.name] || []) if (!parType[type]) parType[type] = couleur;
                const contenu = cat.contents || [];
                for (const e of contenu) if (e.kind === 'block' && e.type && !parType[e.type]) parType[e.type] = couleur;
                parcourir(contenu, couleur);
            }
        };
        parcourir(toolbox.contents, null);
        for (const type of Object.keys(parType)) {
            const def = Blockly.Blocks[type];
            if (!def || def.__palette || typeof def.init !== 'function') continue;
            const initOriginal = def.init;
            const couleur = parType[type];
            def.init = function () { initOriginal.apply(this, arguments); this.setColour(couleur); };
            def.__palette = true;
        }
        return toolbox;
    }

    // Tiroir de blocs (colonne des categories) : taille fixe, quel que soit le zoom de la zone de programmation
    // (demande de l'utilisateur, nov. 2026). Par defaut, Blockly lui donne l'echelle de l'espace de travail.
    Blockly.Flyout.prototype.getFlyoutScale = function () { return 1; };

    window.workspace = Blockly.inject('blocklyDiv', {
      // Images (corbeille, fleches) et sons de Blockly : dossier LOCAL. Sans
      // cette option, Blockly va les chercher sur blockly-demo.appspot.com.
      media: 'lib/blockly/media/',
      // Sans ces options, Blockly reste figé à l'échelle 1 : ni boutons de zoom,
      // ni molette, ni recentrage. Molette seule = zoom (voir move.wheel plus bas).
      zoom: {
        // Boutons ronds de Blockly (recentrer, +, -) dans la zone de blocs, en plus du
        // groupe de la barre du haut (demande de l'utilisateur, image de reference).
        // Ils sont dessines dans le canevas : voir les reglages de position / de
        // chevauchement avec la corbeille dans index.html (.blocklyZoom...).
        controls: true,
        wheel: true,
        pinch: true,
        startScale: 1.0,
        minScale: 0.3,
        maxScale: 3.0,
        scaleSpeed: 1.2
      },
      move: {
        scrollbars: { horizontal: true, vertical: true },
        drag: true,
        // Demande de l'utilisateur : la molette seule zoome / dezoome (autour du
        // curseur). Il faut zoom.wheel ACTIF et move.wheel INACTIF : avec les deux,
        // Blockly reserve le zoom a Ctrl+molette et fait defiler avec la molette.
        // On defile desormais au glisser (fond de l'espace) ou aux barres de defilement.
        wheel: false
      },
      grid: { spacing: 20, length: 3, colour: '#e8e8e8', snap: true },
      trashcan: true,
      // Un seul bloc de demarrage a la fois : deux rendraient l'ordre
      // d'execution ambigu. Le tiroir grise le bloc quand il est deja pose.
      maxInstances: { 'au_demarrage': 1 },
      toolbox: appliquerPaletteToolbox({
        "kind": "categoryToolbox",
        "contents": [
          {
            "kind": "category", "name": "Temps", "colour": "230",
            "contents": [
              { "kind": "block", "type": "attendre_temps", "inputs": { "TEMPS": { "shadow": { "type": "math_number", "fields": { "NUM": "1" } } } } },
              { "kind": "block", "type": "attendre_jusqua" },
              { "kind": "block", "type": "repeter_toutes_les" },
              { "kind": "block", "type": "reset_chrono" },
              { "kind": "block", "type": "valeur_chrono" }
            ]
          },
          {
            "kind": "category", "name": "Matrice LED", "colour": "160",
            "contents": [
              { "kind": "block", "type": "afficher_valeur", "inputs": { "VALEUR": { "shadow": { "type": "text", "fields": { "TEXT": "Bonjour !" } } } } },
              { "kind": "block", "type": "faire_defiler", "inputs": { "VALEUR": { "shadow": { "type": "text", "fields": { "TEXT": "Bonjour !" } } } } },
              { "kind": "block", "type": "afficher_icone" },
              { "kind": "block", "type": "afficher_image_matrice" },
              { "kind": "block", "type": "effacer_ecran" },
              { "kind": "block", "type": "afficher_console", "inputs": { "VALEUR": { "shadow": { "type": "text", "fields": { "TEXT": "Bonjour !" } } } } }
            ]
          },
          {
            "kind": "category", "name": "Entrées/Sorties", "colour": "210",
            "contents": [
              { "kind": "block", "type": "si_bouton_appuye" },
              { "kind": "block", "type": "si_logo_touche" },
              { "kind": "block", "type": "si_secoue_alors" },
              { "kind": "block", "type": "bouton_est_appuye" },
              { "kind": "block", "type": "logo_est_touche" },
              { "kind": "block", "type": "nombre_clics_bouton" },
              { "kind": "block", "type": "reinitialiser_microbit" }
            ]
          },
          {
            "kind": "category", "name": "Capteurs", "colour": "300",
            "contents": [
              { "kind": "block", "type": "lorsque_bouton" },
              { "kind": "block", "type": "lorsque_geste" },
              { "kind": "block", "type": "lorsque_broche" },
              { "kind": "block", "type": "lorsque_son_detecte" },
              { "kind": "block", "type": "lorsque_logo" },
              { "kind": "block", "type": "capteur_acceleration" },
              { "kind": "block", "type": "broche_est_pressee" },
              { "kind": "block", "type": "capteur_luminosite" },
              { "kind": "block", "type": "capteur_boussole_direction" },
              { "kind": "block", "type": "capteur_temperature" },
              { "kind": "block", "type": "geste_est_actif" },
              { "kind": "block", "type": "micro_intensite_son" },
              { "kind": "block", "type": "capteur_boussole_calibrer" },
              { "kind": "block", "type": "capteur_boussole_force" },
              { "kind": "block", "type": "capteur_rotation" },
              { "kind": "block", "type": "temps_execution" },
              { "kind": "block", "type": "gamme_accelerometre" },
              { "kind": "block", "type": "micro_definir_seuil", "inputs": { "SEUIL": { "shadow": { "type": "math_number", "fields": { "NUM": "128" } } } } }
            ]
          },
          {
            "kind": "category", "name": "Actionneurs (Audio)", "colour": "330",
            "contents": [
              { "kind": "block", "type": "audio_jouer" },
              { "kind": "block", "type": "audio_arreter" },
              { "kind": "block", "type": "music_jouer_melodie" },
              { "kind": "block", "type": "speech_dire", "inputs": { "TEXT": { "shadow": { "type": "text", "fields": { "TEXT": "Bonjour !" } } } } }
            ]
          },
          {
            "kind": "category", "name": "Communication", "colour": "120",
            "contents": [
            {
            "kind": "category", "name": "Groupe", "colour": "120",
            "contents": [
              { "kind": "block", "type": "radio_activer" },
              { "kind": "block", "type": "radio_groupe", "inputs": { "GROUPE": { "shadow": { "type": "math_number", "fields": { "NUM": "1" } } } } }
            ]
            },
            {
            "kind": "category", "name": "Envoi", "colour": "120",
            "contents": [
              { "kind": "block", "type": "radio_envoyer_nombre", "inputs": { "NOMBRE": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } } } },
              { "kind": "block", "type": "radio_envoyer_valeur", "inputs": { "NOM": { "shadow": { "type": "text", "fields": { "TEXT": "nom" } } }, "VALEUR": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } } } },
              { "kind": "block", "type": "radio_envoyer_texte", "inputs": { "MESSAGE": { "shadow": { "type": "text", "fields": { "TEXT": "salut" } } } } }
            ]
            },
            {
            "kind": "category", "name": "Réception", "colour": "120",
            "contents": [
              { "kind": "block", "type": "radio_quand_recu" },
              { "kind": "block", "type": "radio_lecture" }
            ]
            },
            {
            "kind": "category", "name": "Plus", "colour": "120",
            "contents": [
              { "kind": "block", "type": "radio_puissance", "inputs": { "NIVEAU": { "shadow": { "type": "math_number", "fields": { "NUM": "7" } } } } },
              { "kind": "block", "type": "radio_canal", "inputs": { "CANAL": { "shadow": { "type": "math_number", "fields": { "NUM": "7" } } } } }
            ]
            }
            ]
          },
          {
            "kind": "category", "name": "IA", "colour": "330",
            "contents": [
              { "kind": "label", "text": "Résultat envoyé par le panneau IA" },
              { "kind": "block", "type": "ia_lorsque_reconnu" },
              { "kind": "block", "type": "ia_classe_est" },
              { "kind": "block", "type": "ia_derniere_classe" },
              { "kind": "block", "type": "ia_confiance" },
              { "kind": "label", "text": "QR codes et codes-barres (panneau IA)" },
              { "kind": "block", "type": "ia_qr_lorsque_lu" },
              { "kind": "block", "type": "ia_qr_visible" },
              { "kind": "block", "type": "ia_qr_texte" }
            ]
          },
          {
            "kind": "category", "name": "Servos", "colour": String(COULEUR_SERVO),
            "contents": [
              { "kind": "label", "text": "Positionnel" },
              { "kind": "block", "type": "servo_angle", "inputs": { "ANGLE": { "shadow": { "type": "math_number", "fields": { "NUM": "90" } } } } },

              { "kind": "label", "text": "En continu" },
              { "kind": "block", "type": "servo_continu", "inputs": { "VITESSE": { "shadow": { "type": "math_number", "fields": { "NUM": "50" } } } } },
              { "kind": "block", "type": "servo_arreter" },

              { "kind": "label", "text": "Configuration" },
              { "kind": "block", "type": "servo_arret_neutre" },
              { "kind": "block", "type": "servo_intervalle", "inputs": { "MINI": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } }, "MAXI": { "shadow": { "type": "math_number", "fields": { "NUM": "180" } } } } },
              { "kind": "block", "type": "servo_impulsion", "inputs": { "MICROS": { "shadow": { "type": "math_number", "fields": { "NUM": "1500" } } } } }
            ]
          },
          {
            // Cartes d'extension reunies (choix de l'utilisateur, maquette A) : une sous-categorie par carte, comme Grove.
            "kind": "category", "name": "Cartes d'extension", "colour": "190",
            "contents": [
            {
            "kind": "category", "name": "DFR0548", "colour": "190",
            "contents": [
              { "kind": "label", "text": "Servomoteurs (S1 à S8)", "web-class": "groupe-flyout" },
              { "kind": "block", "type": "dfr_servo", "inputs": { "ANGLE": { "shadow": { "type": "math_number", "fields": { "NUM": "90" } } } } },
              { "kind": "label", "text": "Moteurs (M1 à M4)", "web-class": "groupe-flyout" },
              { "kind": "block", "type": "dfr_moteur", "inputs": { "VITESSE": { "shadow": { "type": "math_number", "fields": { "NUM": "150" } } } } },
              { "kind": "block", "type": "dfr_moteur_arreter" },
              { "kind": "label", "text": "Moteurs pas à pas", "web-class": "groupe-flyout" },
              { "kind": "block", "type": "dfr_pas_a_pas", "inputs": { "QUANTITE": { "shadow": { "type": "math_number", "fields": { "NUM": "90" } } } } }
            ]
            },
            {
            "kind": "category", "name": "Motor:bit", "colour": "210",
            "contents": [
              { "kind": "label", "text": "Moteurs (M1 et M2)", "web-class": "groupe-flyout" },
              { "kind": "block", "type": "motorbit_moteur", "inputs": { "VITESSE": { "shadow": { "type": "math_number", "fields": { "NUM": "150" } } } } },
              { "kind": "block", "type": "motorbit_moteur_arreter" }
            ]
            }
            ]
          },
          {
            // 37 blocs dans un seul tiroir demandaient plus de deux ecrans de
            // defilement : les derniers etaient introuvables en pratique. Un
            // sous-menu par module, chacun tenant d'un coup d'oeil.
            "kind": "category", "name": "Grove", "colour": String(COULEUR_GROVE),
            "contents": [
            {
            // LED, barre de LED et ruban RGB reunis : un titre par module, un trait fin entre deux modules (comme « Affichage »).
            "kind": "category", "name": "LED", "colour": String(COULEUR_GROVE),
            "contents": [
              { "kind": "label", "text": "LED" },
              { "kind": "block", "type": "grove_led_etat" },
              { "kind": "block", "type": "grove_led_luminosite", "inputs": { "NIVEAU": { "shadow": { "type": "math_number", "fields": { "NUM": "1023" } } } } },
              { "kind": "label", "text": "Barre de LED", "web-class": "groupe-flyout" },
              { "kind": "block", "type": "grove_barre_niveau", "inputs": { "NIVEAU": { "shadow": { "type": "math_number", "fields": { "NUM": "5" } } } } },
              { "kind": "block", "type": "grove_barre_led", "inputs": { "LED": { "shadow": { "type": "math_number", "fields": { "NUM": "1" } } } } },
              { "kind": "label", "text": "Ruban RGB (WS2813)", "web-class": "groupe-flyout" },
              { "kind": "block", "type": "grove_ruban_definir" },
              { "kind": "block", "type": "grove_ruban_couleur" },
              { "kind": "block", "type": "grove_ruban_effacer" },
              { "kind": "block", "type": "grove_ruban_couleur_index", "inputs": { "INDEX": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } } } },
              { "kind": "block", "type": "grove_ruban_effacer_index", "inputs": { "INDEX": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } } } },
              { "kind": "block", "type": "grove_ruban_perso", "inputs": { "R": { "shadow": { "type": "math_number", "fields": { "NUM": "255" } } }, "V": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } }, "B": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } } } },
              { "kind": "block", "type": "grove_ruban_perso_index", "inputs": { "INDEX": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } }, "R": { "shadow": { "type": "math_number", "fields": { "NUM": "255" } } }, "V": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } }, "B": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } } } },
              { "kind": "block", "type": "grove_ruban_luminosite", "inputs": { "NIVEAU": { "shadow": { "type": "math_number", "fields": { "NUM": "100" } } } } }
            ]
            },
            {
            "kind": "category", "name": "Buzzer", "colour": String(COULEUR_GROVE),
            "contents": [
              { "kind": "block", "type": "grove_buzzer_etat" },
              { "kind": "block", "type": "grove_buzzer_bip", "inputs": { "DUREE": { "shadow": { "type": "math_number", "fields": { "NUM": "200" } } } } }
              ]
            },
            {
            // Relais, pilote moteur et pilote 16 servos reunis : un titre par module, un trait fin entre deux modules.
            "kind": "category", "name": "Moteurs et relais", "colour": String(COULEUR_GROVE),
            "contents": [
              { "kind": "label", "text": "Relais" },
              { "kind": "block", "type": "grove_relais" },
              { "kind": "label", "text": "Pilote moteur", "web-class": "groupe-flyout" },
              { "kind": "block", "type": "grove_moteur_vitesse", "inputs": { "VITESSE": { "shadow": { "type": "math_number", "fields": { "NUM": "30" } } } } },
              { "kind": "block", "type": "grove_moteur_action" },
              { "kind": "block", "type": "grove_moteur_defaut" },
              { "kind": "label", "text": "Pilote 16 servos (PCA9685)", "web-class": "groupe-flyout" },
              { "kind": "block", "type": "grove_pca_init" },
              { "kind": "block", "type": "grove_pca_angle", "inputs": { "VOIE": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } }, "ANGLE": { "shadow": { "type": "math_number", "fields": { "NUM": "90" } } } } },
              { "kind": "block", "type": "grove_pca_continu", "inputs": { "VOIE": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } }, "VITESSE": { "shadow": { "type": "math_number", "fields": { "NUM": "50" } } } } }
              ]
            },
            {
            // Afficheur 4 digits, ecrans LCD (simple et RGB) et OLED reunis : un titre par module, un trait fin
            // entre deux modules (classe groupe-flyout, trait dessine par decorerGroupesFlyout plus bas).
            "kind": "category", "name": "Affichage", "colour": String(COULEUR_GROVE),
            "contents": [
              { "kind": "label", "text": "Afficheur 4 digits" },
              { "kind": "block", "type": "grove_4d_definir" },
              { "kind": "block", "type": "grove_4d_nombre", "inputs": { "VALEUR": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } } } },
              { "kind": "block", "type": "grove_4d_chiffre", "inputs": { "VALEUR": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } }, "POSITION": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } } } },
              { "kind": "block", "type": "grove_4d_points" },
              { "kind": "block", "type": "grove_4d_luminosite", "inputs": { "NIVEAU": { "shadow": { "type": "math_number", "fields": { "NUM": "7" } } } } },
              { "kind": "block", "type": "grove_4d_effacer" },
              { "kind": "label", "text": "Écran LCD 16x2", "web-class": "groupe-flyout" },
              { "kind": "block", "type": "grove_lcd_init" },
              { "kind": "block", "type": "grove_lcd_texte", "inputs": { "TEXTE": { "shadow": { "type": "text", "fields": { "TEXT": "Bonjour" } } }, "X": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } }, "Y": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } } } },
              { "kind": "block", "type": "grove_lcd_effacer" },
              { "kind": "block", "type": "grove_lcd_alimenter" },
              { "kind": "label", "text": "Écran LCD 16x2 RGB (rétroéclairage couleur)", "web-class": "groupe-flyout" },
              { "kind": "block", "type": "grove_lcdrgb_init" },
              { "kind": "block", "type": "grove_lcdrgb_texte", "inputs": { "TEXTE": { "shadow": { "type": "text", "fields": { "TEXT": "Bonjour" } } }, "X": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } }, "Y": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } } } },
              { "kind": "block", "type": "grove_lcdrgb_effacer" },
              { "kind": "block", "type": "grove_lcdrgb_alimenter" },
              { "kind": "block", "type": "grove_lcdrgb_fond_couleur" },
              { "kind": "block", "type": "grove_lcdrgb_fond_rvb", "inputs": { "R": { "shadow": { "type": "math_number", "fields": { "NUM": "255" } } }, "V": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } }, "B": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } } } },
              { "kind": "block", "type": "grove_lcdrgb_retro" },
              { "kind": "label", "text": "Écran OLED 0,96″", "web-class": "groupe-flyout" },
              { "kind": "block", "type": "grove_oled_init" },
              { "kind": "block", "type": "grove_oled_texte", "inputs": { "TEXTE": { "shadow": { "type": "text", "fields": { "TEXT": "Bonjour" } } }, "X": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } }, "Y": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } } } },
              { "kind": "block", "type": "grove_oled_effacer" }
              ]
            },
            {
            "kind": "category", "name": "Ultrason", "colour": String(COULEUR_GROVE),
            "contents": [
              { "kind": "block", "type": "grove_ultrason_cm" },
              { "kind": "block", "type": "grove_ultrason_pouces" },

              ]
            },
            {
            "kind": "category", "name": "Joystick", "colour": String(COULEUR_GROVE),
            "contents": [
              { "kind": "block", "type": "grove_joystick_valeur" },
              { "kind": "block", "type": "grove_joystick_direction" },
              { "kind": "block", "type": "grove_joystick_bouton" },

              ]
            },
            {
            "kind": "category", "name": "Potentiomètre", "colour": String(COULEUR_GROVE),
            "contents": [
              { "kind": "block", "type": "grove_potentiometre" },
              { "kind": "block", "type": "grove_potentiometre", "fields": { "UNITE": "angle" } }
              ]
            },
            {
            "kind": "category", "name": "Bouton poussoir", "colour": String(COULEUR_GROVE),
            "contents": [
              { "kind": "block", "type": "grove_bouton_lorsque" },
              { "kind": "block", "type": "grove_bouton_appuye" }
              ]
            },
            {
            "kind": "category", "name": "Capteur de lumière", "colour": String(COULEUR_GROVE),
            "contents": [
              { "kind": "block", "type": "grove_lumiere" }
              ]
            },
            {
            "kind": "category", "name": "Détecteur de mouvement (PIR)", "colour": String(COULEUR_GROVE),
            "contents": [
              { "kind": "block", "type": "grove_pir" }
              ]
            },
            {
            "kind": "category", "name": "Capteur de gestes", "colour": String(COULEUR_GROVE),
            "contents": [
              { "kind": "block", "type": "grove_gestes_init" },
              { "kind": "block", "type": "grove_gestes_est" },
              { "kind": "block", "type": "grove_gestes_lire" },

              ]
            },
            {
            // Capteurs d'environnement reunis (temperature et humidite, DHT11, DHT22, CO2, pression, qualite de l'air) :
            // un titre par module, un trait fin entre deux modules (comme « Affichage »).
            "kind": "category", "name": "Environnement", "colour": String(COULEUR_GROVE),
            "contents": [
              { "kind": "label", "text": "Température & humidité (capteur I²C)" },
              { "kind": "block", "type": "grove_th_init" },
              { "kind": "block", "type": "grove_th_mesure" },
              { "kind": "label", "text": "DHT11", "web-class": "groupe-flyout" },
              { "kind": "block", "type": "grove_dht11_definir" },
              { "kind": "block", "type": "grove_dht11_mesure" },
              { "kind": "label", "text": "DHT22", "web-class": "groupe-flyout" },
              { "kind": "block", "type": "grove_dht22_definir" },
              { "kind": "block", "type": "grove_dht22_mesure" },
              { "kind": "label", "text": "CO₂ (SCD30 / SCD41)", "web-class": "groupe-flyout" },
              { "kind": "block", "type": "grove_scd30_init" },
              { "kind": "block", "type": "grove_scd30_lire" },
              { "kind": "block", "type": "grove_scd41_init" },
              { "kind": "block", "type": "grove_scd41_lire" },
              { "kind": "label", "text": "Pression (BMP280)", "web-class": "groupe-flyout" },
              { "kind": "block", "type": "grove_bmp280" },
              { "kind": "label", "text": "Qualité de l'air (SGP30)", "web-class": "groupe-flyout" },
              { "kind": "block", "type": "grove_sgp30" }
              ]
            },
            {
            "kind": "category", "name": "Capteur de couleur", "colour": String(COULEUR_GROVE),
            "contents": [
              { "kind": "block", "type": "grove_couleur_init" },
              { "kind": "block", "type": "grove_couleur_lire" },

              ]
            },
            {
            "kind": "category", "name": "Horloge (RTC)", "colour": String(COULEUR_GROVE),
            "contents": [
              { "kind": "block", "type": "grove_rtc_regler", "inputs": { "JOUR": { "shadow": { "type": "math_number", "fields": { "NUM": "1" } } }, "MOIS": { "shadow": { "type": "math_number", "fields": { "NUM": "9" } } }, "ANNEE": { "shadow": { "type": "math_number", "fields": { "NUM": "2026" } } }, "HEURE": { "shadow": { "type": "math_number", "fields": { "NUM": "8" } } }, "MINUTE": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } }, "SECONDE": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } } } },
              { "kind": "block", "type": "grove_rtc_lire" },
              { "kind": "block", "type": "grove_rtc_texte" }
              ]
            }

            ]
          },
          {
            "kind": "category", "name": "Boucles", "colour": "120",
            "contents": [
              { "kind": "block", "type": "au_demarrage" },
              { "kind": "block", "type": "boucle_infinie" },
              { "kind": "block", "type": "controls_repeat_ext", "inputs": { "TIMES": { "shadow": { "type": "math_number", "fields": { "NUM": "10" } } } } },
              { "kind": "block", "type": "controls_whileUntil" },
              { "kind": "block", "type": "controls_for", "inputs": { "FROM": { "shadow": { "type": "math_number", "fields": { "NUM": "1" } } }, "TO": { "shadow": { "type": "math_number", "fields": { "NUM": "10" } } }, "BY": { "shadow": { "type": "math_number", "fields": { "NUM": "1" } } } } }
            ]
          },
          {
            "kind": "category", "name": "Logique", "colour": "210",
            "contents": [
              { "kind": "block", "type": "controls_if" },
              { "kind": "block", "type": "logic_compare" },
              { "kind": "block", "type": "logic_operation" },
              { "kind": "block", "type": "logic_negate" },
              { "kind": "block", "type": "logic_boolean" },
              { "kind": "block", "type": "logic_null" },
              { "kind": "block", "type": "logic_ternary" }
            ]
          },
          {
            "kind": "category", "name": "Variables", "custom": "VARIABLE", "colour": "330"
          },
          {
            // Categorie dynamique de Blockly : elle fournit la definition, la
            // definition avec retour, le retour conditionnel, et un bloc d'appel
            // par fonction creee. Les fonctions sont emises via definitions_,
            // donc placees avant tout code executable.
            "kind": "category", "name": "Fonctions", "custom": "PROCEDURE", "colour": "290"
          },
          {
            "kind": "category", "name": "Maths", "colour": "280",
            "contents": [
              { "kind": "block", "type": "math_number", "fields": { "NUM": "0" } },
              { "kind": "block", "type": "math_arithmetic", "fields": { "OP": "ADD" } },
              { "kind": "block", "type": "math_arithmetic", "fields": { "OP": "MINUS" } },
              { "kind": "block", "type": "math_arithmetic", "fields": { "OP": "MULTIPLY" } },
              { "kind": "block", "type": "math_arithmetic", "fields": { "OP": "DIVIDE" } },
              { "kind": "block", "type": "math_modulo", "inputs": { "DIVIDEND": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } }, "DIVISOR": { "shadow": { "type": "math_number", "fields": { "NUM": "1" } } } } },
              { "kind": "block", "type": "math_min_max", "inputs": { "A": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } }, "B": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } } } },
              { "kind": "block", "type": "math_absolue", "inputs": { "NUM": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } } } },
              { "kind": "block", "type": "math_racine", "inputs": { "NUM": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } } } },
              { "kind": "block", "type": "math_arrondi_custom", "inputs": { "NUM": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } } } },
              { "kind": "block", "type": "math_random_int", "inputs": { "FROM": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } }, "TO": { "shadow": { "type": "math_number", "fields": { "NUM": "10" } } } } },
              { "kind": "block", "type": "math_constrain", "inputs": { "VALUE": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } }, "LOW": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } }, "HIGH": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } } } },
              { "kind": "block", "type": "math_map", "inputs": { "VAL": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } }, "FROMLOW": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } }, "FROMHIGH": { "shadow": { "type": "math_number", "fields": { "NUM": "1023" } } }, "TOLOW": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } }, "TOHIGH": { "shadow": { "type": "math_number", "fields": { "NUM": "4" } } } } },
              { "kind": "block", "type": "math_random_bool" },
              { "kind": "block", "type": "math_convert", "inputs": { "NUM": { "shadow": { "type": "math_number", "fields": { "NUM": "0" } } } } },
              { "kind": "block", "type": "math_constant", "fields": { "CONSTANT": "PI" } }
            ]
          },
          {
            "kind": "category", "name": "Texte", "colour": "160",
            "contents": [
              { "kind": "block", "type": "text" },
              { "kind": "block", "type": "text_join" }
            ]
          }
        ]
      })
    });

    // Boutons ronds (recentrer, +, -) alignes sur la corbeille et regulierement espaces.
    // Par defaut, Blockly colle + et - (2 px au lieu de 11) et aligne les boutons (32 px de
    // large) par la droite avec la corbeille (47 px) : leurs centres etaient decales de 7,5 px.
    // Reglages lus par ZoomControls.position() a chaque redimensionnement.
    if (window.workspace.zoomControls_) {
      const zc = window.workspace.zoomControls_;
      const LARGEUR_CORBEILLE = 47;
      zc.SMALL_SPACING = zc.LARGE_SPACING;
      zc.MARGIN_HORIZONTAL += (LARGEUR_CORBEILLE - zc.WIDTH) / 2;
      Blockly.svgResize(window.workspace);
    }

    // Espace de depart : le demarrage puis la boucle, comme dans MakeCode.
    // Les blocs de premier niveau sont generes dans l'ordre de leur position,
    // le demarrage est donc pose au-dessus pour s'executer en premier.
    // Emboites d'office via "next" (le bloc "Au démarrage" a une encoche du
    // bas depuis la demande de l'utilisateur) plutot que juste juxtaposes :
    // meme rendu que MakeCode des l'ouverture, sans action de l'utilisateur.
    // Reutilisee par « Nouveau projet » (menu Fichier, plus bas), d'ou le nom
    // de fonction plutot qu'un bloc de code execute une seule fois ici.
    function chargerEspaceDeDepart() {
        Blockly.serialization.workspaces.load({ blocks: { languageVersion: 0, blocks: [
            { type: 'au_demarrage', x: 40, y: 40,
              next: { block: { type: 'boucle_infinie' } } }
        ]}}, window.workspace);
    }
    if (!window.workspace.getTopBlocks(false).length) {
        chargerEspaceDeDepart();
    }

    // ------------------------------------------
    // PANNEAU ADMINISTRATEUR — categories, sous-menus, libelles
    // ------------------------------------------
    // Blockly conserve la definition de la boite a outils dans
    // options.languageTree ; on la lit une seule fois ici (TOOLBOX_ORIGINAL)
    // et on la reconstruit a chaque changement plutot que de la modifier en
    // place, pour toujours pouvoir revenir a l'etat d'origine.

    function cloneProfond(x) { return JSON.parse(JSON.stringify(x)); }

    const TOOLBOX_ORIGINAL = cloneProfond(window.workspace.options.languageTree.contents);

    // Sous-menus masques la premiere fois que l'admin les rencontre (avant
    // toute config sauvegardee pour ce parent). Rien aujourd'hui — le DHT11 et
    // le DHT22 vivent dans « Environnement » (Grove), visibles comme le
    // reste : seuls le tooltip et le refus au runtime sur V2 (voir
    // piloteDht()) les distinguent desormais. Mecanisme garde pour un usage
    // futur.
    const SOUS_MENUS_MASQUES_PAR_DEFAUT = {};

    function groupesConfDefaut(nomParent) {
        return { order: [], hidden: (SOUS_MENUS_MASQUES_PAR_DEFAUT[nomParent] || []).slice(), labels: {}, colors: {} };
    }

    function construireCategorie(catOriginale) {
        const nomOrig = catOriginale.name;
        const nomAffiche = configAdmin.categories.labels[nomOrig] || nomOrig;
        const couleurAffichee = configAdmin.categories.colors[nomOrig] || catOriginale.colour;

        if (!catOriginale.contents) {
            // Categorie dynamique (Variables, Fonctions) : Blockly la remplit
            // lui-meme, seuls le nom affiche et la couleur peuvent etre changes.
            return Object.assign({}, catOriginale, { name: nomAffiche, colour: couleurAffichee });
        }

        const sousNatives = catOriginale.contents.filter(e => e.kind === 'category');
        let contenuFinal;

        if (sousNatives.length) {
            // Deja organisee en sous-menus (Communication, Grove) : on les
            // reordonne / masque / renomme / recolore. Pas de creation ici, la
            // categorie a deja sa structure.
            const groupesConf = configAdmin.groupes[nomOrig] || groupesConfDefaut(nomOrig);
            const dispo = new Map(sousNatives.map(s => [s.name, s]));
            const ordre = groupesConf.order.length ? groupesConf.order : [...dispo.keys()];
            const resultat = [];
            for (const nom of ordre) {
                if (!dispo.has(nom) || groupesConf.hidden.includes(nom)) { dispo.delete(nom); continue; }
                const s = dispo.get(nom);
                dispo.delete(nom);
                const label = groupesConf.labels[nom];
                const couleur = groupesConf.colors[nom];
                resultat.push((label || couleur)
                    ? Object.assign({}, s, label ? { name: label } : {}, couleur ? { colour: couleur } : {})
                    : s);
            }
            for (const [nom, s] of dispo) {
                if (groupesConf.hidden.includes(nom)) continue;
                const couleur = groupesConf.colors[nom];
                resultat.push(couleur ? Object.assign({}, s, { colour: couleur }) : s);
            }
            contenuFinal = resultat;
        } else {
            // Categorie a plat : les blocs repris dans un sous-menu
            // personnalise en sortent, le reste garde sa place d'origine. La
            // couleur d'un sous-menu personnalise vit directement dans son
            // entree (s.couleur), pas dans une table a part : rien a lire ici.
            const sousMenusIci = configAdmin.sousMenus.filter(s => s.parent === nomOrig);
            const typesExtraits = new Set(sousMenusIci.flatMap(s => s.blocs));
            const restants = catOriginale.contents.filter(e =>
                e.kind === 'label' || !typesExtraits.has(e.type));
            const sousPersonnalises = sousMenusIci.map(s => ({
                kind: 'category', name: s.nom, colour: s.couleur,
                contents: s.blocs
                    .map(type => catOriginale.contents.find(e => e.kind === 'block' && e.type === type))
                    .filter(Boolean)
            }));
            contenuFinal = [...restants, ...sousPersonnalises];
        }

        return { kind: 'category', name: nomAffiche, colour: couleurAffichee, contents: contenuFinal };
    }

    function construireToolbox() {
        const dispo = new Map(TOOLBOX_ORIGINAL.map(c => [c.name, c]));
        const ordre = configAdmin.categories.order.length
            ? configAdmin.categories.order : [...dispo.keys()];
        const resultat = [];
        for (const nom of ordre) {
            if (!dispo.has(nom)) continue;
            const cat = dispo.get(nom);
            dispo.delete(nom);
            if (!configAdmin.categories.hidden.includes(nom)) resultat.push(construireCategorie(cat));
        }
        for (const [nom, cat] of dispo) {
            if (!configAdmin.categories.hidden.includes(nom)) resultat.push(construireCategorie(cat));
        }
        return resultat;
    }

    function appliquerToolbox() {
        window.workspace.updateToolbox({ kind: 'categoryToolbox', contents: construireToolbox() });
        Blockly.svgResize(window.workspace);
    }

    // Toujours reconstruite au demarrage, meme sans config sauvegardee : des
    // sous-menus comme DHT11 sont masques par defaut (groupesConfDefaut) sans
    // que ca passe par configAdmin, l'injection Blockly seule ne le sait pas.
    appliquerToolbox();

    // --- Le panneau : construction commune (onglets) ---

    let voileOptions = null;
    let panneauOptions = null;
    let listeCategories = null;
    let selecteurParent = null;
    let zoneSousMenus = null;
    let champRecherche = null;
    let zoneLibelles = null;
    let zoneAide = null;
    let elementAttrape = null;
    let readmeCharge = false;

    /**
     * Convertit une teinte Blockly (0-360, comme "230") en hexadecimal, avec
     * la meme saturation/valeur (0.45 / 0.65) que la palette par defaut de
     * Blockly — sinon la pastille pre-remplie ne correspondrait pas a la
     * couleur reellement affichee dans la boite a outils.
     */
    function teinteVersHex(teinte) {
        const h = (((Number(teinte) || 0) % 360) + 360) % 360 / 360;
        const s = 0.45, v = 0.65;
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
        let r, g, b;
        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            default: r = v; g = p; b = q;
        }
        const versHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
        return '#' + versHex(r) + versHex(g) + versHex(b);
    }

    /** La couleur d'origine est une teinte numerique ; une surcharge est deja en hex. */
    function couleurEnHex(valeur) {
        return (typeof valeur === 'string' && valeur.startsWith('#')) ? valeur : teinteVersHex(valeur);
    }

    function construireLigneReordonnable(cle, texteAffiche, estMasque, couleur, onRenommer, onBasculerMasque, onChangerCouleur) {
        const ligne = document.createElement('li');
        ligne.draggable = true;
        ligne.dataset.cle = cle;
        ligne.classList.toggle('masquee', estMasque);

        const pastille = document.createElement('input');
        pastille.type = 'color';
        pastille.className = 'pastille-couleur';
        pastille.value = couleurEnHex(couleur);
        pastille.title = 'Changer la couleur';
        pastille.addEventListener('click', e => e.stopPropagation());
        pastille.addEventListener('mousedown', e => e.stopPropagation());
        pastille.addEventListener('input', () => onChangerCouleur(pastille.value));
        ligne.appendChild(pastille);

        const nomSpan = document.createElement('span');
        nomSpan.className = 'nom-ligne';
        nomSpan.textContent = texteAffiche;
        ligne.appendChild(nomSpan);

        const btnMasquer = document.createElement('button');
        btnMasquer.className = 'icone-admin';
        btnMasquer.title = estMasque ? 'Afficher aux élèves' : 'Masquer aux élèves';
        btnMasquer.textContent = estMasque ? '🚫' : '👁';
        btnMasquer.addEventListener('click', e => { e.stopPropagation(); onBasculerMasque(); });
        ligne.appendChild(btnMasquer);

        const btnRenommer = document.createElement('button');
        btnRenommer.className = 'icone-admin';
        btnRenommer.title = 'Renommer';
        btnRenommer.textContent = '✎';
        btnRenommer.addEventListener('click', e => {
            e.stopPropagation();
            const input = document.createElement('input');
            input.type = 'text';
            input.value = texteAffiche;
            nomSpan.replaceWith(input);
            input.focus();
            input.select();
            input.addEventListener('blur', () => onRenommer(input.value.trim() || null));
            input.addEventListener('keydown', e2 => {
                if (e2.key === 'Enter') input.blur();
                if (e2.key === 'Escape') { input.value = texteAffiche; input.blur(); }
            });
        });
        ligne.appendChild(btnRenommer);

        ligne.addEventListener('dragstart', () => { elementAttrape = ligne; ligne.classList.add('attrape'); });
        ligne.addEventListener('dragend', () => {
            ligne.classList.remove('attrape');
            elementAttrape = null;
            if (ligne.parentElement) [...ligne.parentElement.children].forEach(l => l.classList.remove('survol'));
        });
        ligne.addEventListener('dragover', e => {
            e.preventDefault();
            if (!elementAttrape || elementAttrape === ligne) return;
            ligne.classList.add('survol');
            const boite = ligne.getBoundingClientRect();
            const apres = e.clientY > boite.top + boite.height / 2;
            ligne.parentElement.insertBefore(elementAttrape, apres ? ligne.nextSibling : ligne);
        });
        ligne.addEventListener('dragleave', () => ligne.classList.remove('survol'));
        ligne.addEventListener('drop', e => e.preventDefault());

        return ligne;
    }

    function construireOptions() {
        if (voileOptions) return;
        voileOptions = document.createElement('div');
        voileOptions.id = 'voile-options';
        panneauOptions = document.createElement('div');
        panneauOptions.id = 'panneau-options';
        panneauOptions.innerHTML =
            '<h3>Panneau administrateur</h3>' +
            '<div class="onglets-admin">' +
            '<button class="onglet-admin" data-onglet="categories">Catégories</button>' +
            '<button class="onglet-admin" data-onglet="sousmenus">Sous-menus</button>' +
            '<button class="onglet-admin" data-onglet="libelles">Libellés</button>' +
            '<button class="onglet-admin" data-onglet="aide">Aide</button>' +
            '</div>' +
            '<div class="vue-admin" data-vue="categories">' +
            '<p>Glissez pour réordonner. L’œil masque une catégorie aux élèves, le crayon renomme ' +
            'son intitulé. Conservé d’une session à l’autre.</p>' +
            '<ul id="liste-categories" class="panneau-admin-liste"></ul>' +
            '<div class="actions">' +
            '<button id="btn-ordre-fermer">Fermer</button>' +
            '<button id="btn-ordre-defaut">Tout réinitialiser</button></div>' +
            '</div>' +
            '<div class="vue-admin" data-vue="sousmenus">' +
            '<p>Choisissez une catégorie : ses sous-menus existants se réorganisent, ou de nouveaux ' +
            'se créent en regroupant des blocs.</p>' +
            '<select id="selecteur-parent-sousmenu"></select>' +
            '<div id="zone-sousmenus"></div>' +
            '</div>' +
            '<div class="vue-admin" data-vue="libelles">' +
            '<p>Change le texte affiché sur un bloc, sans toucher au code généré.</p>' +
            '<input id="recherche-libelles" type="text" placeholder="Filtrer (ex: attendre, afficher)">' +
            '<div id="zone-libelles"></div>' +
            '</div>' +
            '<div class="vue-admin" data-vue="aide">' +
            '<p>Contenu de <code>readme.txt</code>, le mode d’emploi complet du projet.</p>' +
            '<a id="lien-readme" href="readme.txt" target="_blank" rel="noopener">Ouvrir dans un nouvel onglet ↗</a>' +
            '<pre id="zone-aide">Chargement…</pre>' +
            '</div>';
        voileOptions.appendChild(panneauOptions);
        document.body.appendChild(voileOptions);

        listeCategories = panneauOptions.querySelector('#liste-categories');
        selecteurParent = panneauOptions.querySelector('#selecteur-parent-sousmenu');
        zoneSousMenus = panneauOptions.querySelector('#zone-sousmenus');
        champRecherche = panneauOptions.querySelector('#recherche-libelles');
        zoneLibelles = panneauOptions.querySelector('#zone-libelles');
        zoneAide = panneauOptions.querySelector('#zone-aide');

        // Fermer en cliquant a cote, jamais en cliquant dans le panneau.
        voileOptions.addEventListener('click', e => {
            if (e.target === voileOptions) fermerOptions();
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && voileOptions.classList.contains('ouvert')) fermerOptions();
        });

        panneauOptions.querySelector('#btn-ordre-fermer').addEventListener('click', fermerOptions);
        panneauOptions.querySelector('#btn-ordre-defaut').addEventListener('click', () => {
            configAdmin = configAdminParDefaut();
            sauvegarderConfigAdmin();
            appliquerToolbox();
            remplirOngletCategories();
            remplirSelecteurParent();
        });

        panneauOptions.querySelectorAll('.onglet-admin').forEach(bouton => {
            bouton.addEventListener('click', () => {
                activerOnglet(bouton.dataset.onglet);
                if (bouton.dataset.onglet === 'aide') chargerAide();
            });
        });

        listeCategories.addEventListener('dragend', () => {
            configAdmin.categories.order = [...listeCategories.children].map(li => li.dataset.cle);
            sauvegarderConfigAdmin();
            appliquerToolbox();
        });
        selecteurParent.addEventListener('change', () => remplirZoneSousMenus(selecteurParent.value));
        champRecherche.addEventListener('input', () => remplirOngletLibelles(champRecherche.value));

        activerOnglet('categories');
    }

    function activerOnglet(nom) {
        panneauOptions.querySelectorAll('.onglet-admin').forEach(b => b.classList.toggle('actif', b.dataset.onglet === nom));
        panneauOptions.querySelectorAll('.vue-admin').forEach(v => v.classList.toggle('active', v.dataset.vue === nom));
    }

    // --- Onglet Aide ---
    // readme.txt est servi comme fichier statique par app.py, a cote
    // d'index.html : un simple fetch suffit, pas besoin de l'embarquer.

    function chargerAide() {
        if (readmeCharge) return;
        readmeCharge = true;
        zoneAide.textContent = 'Chargement…';
        fetch('readme.txt', { cache: 'no-store' })
            .then(reponse => {
                if (!reponse.ok) throw new Error('HTTP ' + reponse.status);
                return reponse.text();
            })
            .then(texte => { zoneAide.textContent = texte; })
            .catch(erreur => {
                readmeCharge = false; // permet de reessayer au prochain clic sur l'onglet
                zoneAide.textContent = 'Impossible de charger readme.txt (' + erreur.message + ').\n' +
                    "Verifier qu'il est bien a cote d'index.html, ou l'ouvrir directement : " +
                    new URL('readme.txt', location.href).href;
            });
    }

    // --- Onglet Catégories ---

    function remplirOngletCategories() {
        listeCategories.textContent = '';
        const noms = TOOLBOX_ORIGINAL.map(c => c.name);
        const ordre = configAdmin.categories.order.length
            ? configAdmin.categories.order.filter(n => noms.includes(n))
            : noms;
        for (const nomOrig of ordre) {
            const masque = configAdmin.categories.hidden.includes(nomOrig);
            const texte = configAdmin.categories.labels[nomOrig] || nomOrig;
            const couleur = configAdmin.categories.colors[nomOrig] ||
                TOOLBOX_ORIGINAL.find(c => c.name === nomOrig).colour;
            listeCategories.appendChild(construireLigneReordonnable(nomOrig, texte, masque, couleur,
                nouveauTexte => {
                    if (nouveauTexte && nouveauTexte !== nomOrig) configAdmin.categories.labels[nomOrig] = nouveauTexte;
                    else delete configAdmin.categories.labels[nomOrig];
                    sauvegarderConfigAdmin(); appliquerToolbox(); remplirOngletCategories(); remplirSelecteurParent();
                },
                () => {
                    const i = configAdmin.categories.hidden.indexOf(nomOrig);
                    if (i === -1) configAdmin.categories.hidden.push(nomOrig); else configAdmin.categories.hidden.splice(i, 1);
                    sauvegarderConfigAdmin(); appliquerToolbox(); remplirOngletCategories();
                },
                nouvelleCouleur => {
                    configAdmin.categories.colors[nomOrig] = nouvelleCouleur;
                    sauvegarderConfigAdmin(); appliquerToolbox();
                }));
        }
    }

    // --- Onglet Sous-menus ---

    function remplirSelecteurParent() {
        const valeurCourante = selecteurParent.value;
        selecteurParent.innerHTML = '';
        for (const c of TOOLBOX_ORIGINAL.filter(c => c.contents)) {
            const option = document.createElement('option');
            option.value = c.name;
            option.textContent = configAdmin.categories.labels[c.name] || c.name;
            selecteurParent.appendChild(option);
        }
        selecteurParent.value = [...selecteurParent.options].some(o => o.value === valeurCourante)
            ? valeurCourante : (selecteurParent.options[0] ? selecteurParent.options[0].value : '');
        remplirZoneSousMenus(selecteurParent.value);
    }

    function remplirZoneSousMenus(nomParent) {
        zoneSousMenus.textContent = '';
        const original = TOOLBOX_ORIGINAL.find(c => c.name === nomParent);
        if (!original) return;
        const sousNatives = original.contents.filter(e => e.kind === 'category');

        if (sousNatives.length) {
            const ul = document.createElement('ul');
            ul.className = 'panneau-admin-liste';
            const groupesConf = configAdmin.groupes[nomParent] || (configAdmin.groupes[nomParent] = groupesConfDefaut(nomParent));
            const nomsNatifs = sousNatives.map(s => s.name);
            const ordre = groupesConf.order.length ? groupesConf.order.filter(n => nomsNatifs.includes(n)) : nomsNatifs;
            for (const nom of ordre) {
                const masque = groupesConf.hidden.includes(nom);
                const texte = groupesConf.labels[nom] || nom;
                const couleur = groupesConf.colors[nom] || sousNatives.find(s => s.name === nom).colour;
                ul.appendChild(construireLigneReordonnable(nom, texte, masque, couleur,
                    nv => {
                        if (nv && nv !== nom) groupesConf.labels[nom] = nv; else delete groupesConf.labels[nom];
                        sauvegarderConfigAdmin(); appliquerToolbox(); remplirZoneSousMenus(nomParent);
                    },
                    () => {
                        const i = groupesConf.hidden.indexOf(nom);
                        if (i === -1) groupesConf.hidden.push(nom); else groupesConf.hidden.splice(i, 1);
                        sauvegarderConfigAdmin(); appliquerToolbox(); remplirZoneSousMenus(nomParent);
                    },
                    nouvelleCouleur => {
                        groupesConf.colors[nom] = nouvelleCouleur;
                        sauvegarderConfigAdmin(); appliquerToolbox();
                    }));
            }
            ul.addEventListener('dragend', () => {
                groupesConf.order = [...ul.children].map(li => li.dataset.cle);
                sauvegarderConfigAdmin(); appliquerToolbox();
            });
            zoneSousMenus.appendChild(ul);
            return;
        }

        // Categorie a plat : sous-menus personnalises existants, puis le
        // formulaire de creation avec les blocs restants.
        const existants = configAdmin.sousMenus.filter(s => s.parent === nomParent);
        if (existants.length) {
            const ul = document.createElement('ul');
            ul.className = 'panneau-admin-liste';
            for (const sm of existants) {
                const ligne = document.createElement('li');
                ligne.classList.add('sans-poignee');

                const pastille = document.createElement('input');
                pastille.type = 'color';
                pastille.className = 'pastille-couleur';
                pastille.value = couleurEnHex(sm.couleur);
                pastille.title = 'Changer la couleur';
                pastille.addEventListener('input', () => {
                    sm.couleur = pastille.value;
                    sauvegarderConfigAdmin(); appliquerToolbox();
                });
                ligne.appendChild(pastille);

                const nomSpan = document.createElement('span');
                nomSpan.className = 'nom-ligne';
                nomSpan.textContent = sm.nom + ' (' + sm.blocs.length + ' bloc' + (sm.blocs.length > 1 ? 's' : '') + ')';
                ligne.appendChild(nomSpan);
                const btnSuppr = document.createElement('button');
                btnSuppr.className = 'icone-admin';
                btnSuppr.title = 'Supprimer ce sous-menu (les blocs reviennent au niveau supérieur)';
                btnSuppr.textContent = '🗑';
                btnSuppr.addEventListener('click', () => {
                    configAdmin.sousMenus = configAdmin.sousMenus.filter(s => s !== sm);
                    sauvegarderConfigAdmin(); appliquerToolbox(); remplirZoneSousMenus(nomParent);
                });
                ligne.appendChild(btnSuppr);
                ul.appendChild(ligne);
            }
            zoneSousMenus.appendChild(ul);
        }

        const blocsRestants = original.contents.filter(e => e.kind === 'block' &&
            !configAdmin.sousMenus.some(s => s.parent === nomParent && s.blocs.includes(e.type)));
        if (!blocsRestants.length) return;

        const indication = document.createElement('p');
        indication.style.cssText = 'margin:10px 0 6px;font-size:12px;color:#b8b8b8;';
        indication.textContent = 'Regrouper des blocs dans un nouveau sous-menu :';
        zoneSousMenus.appendChild(indication);

        const champNom = document.createElement('input');
        champNom.type = 'text';
        champNom.id = 'champ-nom-sousmenu';
        champNom.placeholder = 'Nom du sous-menu';
        zoneSousMenus.appendChild(champNom);

        const listeCases = document.createElement('div');
        listeCases.style.cssText = 'max-height:160px;overflow-y:auto;margin:8px 0;';
        for (const bloc of blocsRestants) {
            const label = document.createElement('label');
            label.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:12px;padding:3px 0;font-family:monospace;';
            const case_ = document.createElement('input');
            case_.type = 'checkbox';
            case_.value = bloc.type;
            label.appendChild(case_);
            label.appendChild(document.createTextNode(bloc.type));
            listeCases.appendChild(label);
        }
        zoneSousMenus.appendChild(listeCases);

        const btnCreer = document.createElement('button');
        btnCreer.textContent = 'Créer le sous-menu';
        btnCreer.style.cssText = 'font-size:13px;padding:7px 12px;margin:0;';
        btnCreer.addEventListener('click', () => {
            const nom = champNom.value.trim();
            const coches = [...listeCases.querySelectorAll('input:checked')].map(c => c.value);
            if (!nom || !coches.length) return;
            configAdmin.sousMenus.push({
                id: 'sm_' + Date.now().toString(36), parent: nomParent, nom,
                couleur: original.colour, blocs: coches
            });
            sauvegarderConfigAdmin(); appliquerToolbox(); remplirZoneSousMenus(nomParent);
        });
        zoneSousMenus.appendChild(btnCreer);
    }

    // --- Onglet Libellés ---

    function texteEffectifChamp(type, index, defaut) {
        const cle = type + '#' + index;
        return configAdmin.libellesBlocs[cle] !== undefined ? configAdmin.libellesBlocs[cle] : defaut;
    }

    function appliquerLibellesSurCanevas(type) {
        for (const bloc of window.workspace.getAllBlocks(false)) {
            if (bloc.type === type) appliquerLibellesBloc(bloc);
        }
    }

    function remplirOngletLibelles(filtre) {
        zoneLibelles.textContent = '';
        const f = (filtre || '').toLowerCase().trim();
        if (!f) {
            const indication = document.createElement('p');
            indication.style.cssText = 'font-size:12px;color:#b8b8b8;';
            indication.textContent = 'Tapez un mot pour retrouver un bloc (ex: "attendre", "afficher").';
            zoneLibelles.appendChild(indication);
            return;
        }
        const types = Object.keys(LIBELLES_DEFAUT).filter(type => LIBELLES_DEFAUT[type].length && (
            type.toLowerCase().includes(f) || LIBELLES_DEFAUT[type].some(t => t.toLowerCase().includes(f))
        )).sort();

        for (const type of types) {
            const carte = document.createElement('div');
            carte.className = 'bloc-libelle';
            const titre = document.createElement('div');
            titre.className = 'type-bloc';
            titre.textContent = type;
            carte.appendChild(titre);

            LIBELLES_DEFAUT[type].forEach((defaut, index) => {
                const ligne = document.createElement('div');
                ligne.className = 'champ-libelle';
                const input = document.createElement('input');
                input.type = 'text';
                input.value = texteEffectifChamp(type, index, defaut);
                input.addEventListener('change', () => {
                    const cle = type + '#' + index;
                    if (input.value === defaut) delete configAdmin.libellesBlocs[cle];
                    else configAdmin.libellesBlocs[cle] = input.value;
                    sauvegarderConfigAdmin();
                    appliquerLibellesSurCanevas(type);
                });
                ligne.appendChild(input);

                const btnReset = document.createElement('button');
                btnReset.className = 'icone-admin';
                btnReset.title = 'Revenir au texte par défaut';
                btnReset.textContent = '↺';
                btnReset.addEventListener('click', () => {
                    input.value = defaut;
                    delete configAdmin.libellesBlocs[type + '#' + index];
                    sauvegarderConfigAdmin();
                    appliquerLibellesSurCanevas(type);
                });
                ligne.appendChild(btnReset);
                carte.appendChild(ligne);
            });
            zoneLibelles.appendChild(carte);
        }

        if (!types.length) {
            const vide = document.createElement('p');
            vide.style.cssText = 'font-size:12px;color:#b8b8b8;';
            vide.textContent = 'Aucun bloc ne correspond.';
            zoneLibelles.appendChild(vide);
        }
    }

    function ouvrirOptions() {
        construireOptions();
        remplirOngletCategories();
        remplirSelecteurParent();
        remplirOngletLibelles('');
        if (champRecherche) champRecherche.value = '';
        voileOptions.classList.add('ouvert');
    }

    function fermerOptions() {
        if (voileOptions) voileOptions.classList.remove('ouvert');
    }

    // --- Activation du mode administrateur ---
    // L'application est 100% cliente, sans serveur ni compte : il n'existe
    // aucune authentification reelle possible. Ce raccourci ne sert qu'a
    // eviter qu'un eleve tombe sur ces reglages par hasard, pas a proteger
    // quoi que ce soit serieusement.

    let adminActif = false;
    const btnOptions = document.getElementById('btn-options');

    function afficherToastAdmin(texte) {
        const toast = document.getElementById('toast-admin');
        if (!toast) return;
        toast.textContent = texte;
        toast.classList.add('visible');
        clearTimeout(afficherToastAdmin._t);
        afficherToastAdmin._t = setTimeout(() => toast.classList.remove('visible'), 2200);
    }

    function activerAdmin(actif) {
        adminActif = actif;
        if (btnOptions) btnOptions.style.display = actif ? 'inline-block' : 'none';
        if (!actif) fermerOptions();
        afficherToastAdmin(actif ? 'Mode administrateur activé' : 'Mode administrateur désactivé');
    }

    document.addEventListener('keydown', e => {
        if (e.ctrlKey && e.altKey && e.shiftKey && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            activerAdmin(!adminActif);
        }
    });

    if (btnOptions) btnOptions.addEventListener('click', ouvrirOptions);

    // Expose pour les verifications : le glisser-deposer et les raccourcis
    // clavier ne se simulent pas depuis la console.
    window.adminTest = {
        activer: () => activerAdmin(true),
        desactiver: () => activerAdmin(false),
        estActif: () => adminActif,
        etat: () => cloneProfond(configAdmin),
        ouvrirPanneau: ouvrirOptions,
        fermerPanneau: fermerOptions,
        ouvrirAide: () => { ouvrirOptions(); activerOnglet('aide'); chargerAide(); },
        reordonnerCategories: noms => {
            configAdmin.categories.order = noms.slice();
            sauvegarderConfigAdmin(); appliquerToolbox();
        },
        masquerCategorie: (nom, masquer) => {
            const i = configAdmin.categories.hidden.indexOf(nom);
            if (masquer && i === -1) configAdmin.categories.hidden.push(nom);
            if (!masquer && i !== -1) configAdmin.categories.hidden.splice(i, 1);
            sauvegarderConfigAdmin(); appliquerToolbox();
        },
        renommerCategorie: (nom, texte) => {
            if (texte) configAdmin.categories.labels[nom] = texte; else delete configAdmin.categories.labels[nom];
            sauvegarderConfigAdmin(); appliquerToolbox();
        },
        changerCouleurCategorie: (nom, hex) => {
            if (hex) configAdmin.categories.colors[nom] = hex; else delete configAdmin.categories.colors[nom];
            sauvegarderConfigAdmin(); appliquerToolbox();
        },
        changerCouleurSousMenu: (parent, nom, hex) => {
            const groupesConf = configAdmin.groupes[parent] || (configAdmin.groupes[parent] = groupesConfDefaut(parent));
            if (hex) groupesConf.colors[nom] = hex; else delete groupesConf.colors[nom];
            sauvegarderConfigAdmin(); appliquerToolbox();
        },
        creerSousMenu: (parent, nom, blocs) => {
            const original = TOOLBOX_ORIGINAL.find(c => c.name === parent);
            configAdmin.sousMenus.push({
                id: 'sm_' + Date.now().toString(36), parent, nom,
                couleur: original ? original.colour : '160', blocs: blocs.slice()
            });
            sauvegarderConfigAdmin(); appliquerToolbox();
        },
        supprimerSousMenu: id => {
            configAdmin.sousMenus = configAdmin.sousMenus.filter(s => s.id !== id);
            sauvegarderConfigAdmin(); appliquerToolbox();
        },
        changerCouleurSousMenuPersonnalise: (id, hex) => {
            const sm = configAdmin.sousMenus.find(s => s.id === id);
            if (sm && hex) { sm.couleur = hex; sauvegarderConfigAdmin(); appliquerToolbox(); }
        },
        renommerLibelleBloc: (type, index, texte) => {
            const cle = type + '#' + index;
            if (texte !== null) configAdmin.libellesBlocs[cle] = texte; else delete configAdmin.libellesBlocs[cle];
            sauvegarderConfigAdmin();
            appliquerLibellesSurCanevas(type);
        },
        libellesDefaut: type => (LIBELLES_DEFAUT[type] || []).slice(),
        reinitialiser: () => {
            configAdmin = configAdminParDefaut();
            sauvegarderConfigAdmin(); appliquerToolbox();
        }
    };

    // ------------------------------------------
    // REPLI DES PANNEAUX
    // ------------------------------------------
    // La boîte à outils ouvre un tiroir aussi large que son bloc le plus long ;
    // sur la catégorie Grove il ne restait presque plus rien pour travailler.
    // Replier la transcription ou le simulateur rend cette largeur au canevas.

    const resizerSimulateur = document.getElementById('simulateur-redimensionneur');
    const conteneurCode = document.getElementById('code-container');
    const conteneurSimulateur = document.getElementById('simulator-container');

    /**
     * La poignee de redimensionnement du simulateur n'a de sens que quand la
     * transcription est masquee : c'est le seul cas ou sa bordure gauche
     * touche directement la zone de blocs plutot que le panneau de code.
     */
    function synchroniserResizerSimulateur() {
        if (!resizerSimulateur) return;
        resizerSimulateur.classList.toggle('visible',
            conteneurCode.classList.contains('replie') &&
            !conteneurSimulateur.classList.contains('replie'));
    }

    function basculerPanneau(bouton, panneau) {
        const replie = panneau.classList.toggle('replie');
        bouton.classList.toggle('inactif', replie);
        // Blockly ne s'apercoit pas tout seul qu'on lui a rendu de la place.
        Blockly.svgResize(window.workspace);
        adapterEchelleSimulateur();
        synchroniserResizerSimulateur();
    }

    const btnVueCode = document.getElementById('btn-vue-code');
    const btnVueSimu = document.getElementById('btn-vue-simu');
    if (btnVueCode) {
        btnVueCode.addEventListener('click', () =>
            basculerPanneau(btnVueCode, conteneurCode));
    }
    if (btnVueSimu) {
        btnVueSimu.addEventListener('click', () =>
            basculerPanneau(btnVueSimu, conteneurSimulateur));
    }
    window.addEventListener('resize', () => Blockly.svgResize(window.workspace));
    // Le code est masque des le lancement (index.html) : la poignee du simulateur doit deja etre active.
    synchroniserResizerSimulateur();

    // ------------------------------------------
    // MASQUER LA COLONNE DE CATEGORIES PENDANT UN GLISSER DE BLOC
    // ------------------------------------------
    // Demande de l'utilisateur : la colonne (Temps, Affichage, Capteurs...)
    // masquee le temps qu'un bloc soit glisse, qu'il vienne d'etre pris dans
    // le tiroir ou deja pose sur l'espace de travail (« dans les 2 cas »),
    // pour rendre le maximum de place a la zone de blocs pendant le geste.
    // Le tiroir (la liste de blocs qui s'ouvre a cote d'une categorie), lui,
    // se referme deja tout seul des le debut du glisser (`autoClose`,
    // comportement Blockly par defaut) — seule la colonne elle-meme restait
    // affichee jusqu'ici.
    //
    // `Blockly.Events.BLOCK_DRAG` (= 'drag') se declenche avec `isStart` a
    // true puis false, aussi bien pour un bloc deja sur l'espace de travail
    // que pour un bloc tout juste sorti du tiroir (Blockly fait passer les
    // deux par le meme mecanisme de geste en interne) — verifie en direct
    // dans le navigateur avant d'ecrire ce code plutot que suppose.
    // `toolbox.setVisible()` s'occupe lui-meme de rendre l'espace a la zone
    // de blocs (verifie : largeur de la zone de travail passee de 487 a
    // 666px une fois la colonne masquee), `Blockly.svgResize()` reste
    // necessaire ensuite car Blockly ne s'apercoit jamais tout seul qu'on
    // lui a change sa place (meme motif que partout ailleurs dans ce fichier).
    //
    // Masquer la colonne deplace l'origine de la zone de travail de sa largeur (201 px, davantage avec le zoom du
    // navigateur) : sans compensation, tout le contenu glissait d'autant vers la gauche — y compris le bloc tenu,
    // qui se retrouvait loin a gauche du pointeur (« pointeur dans le vide » quand on prend un bloc par sa droite).
    // On fait donc defiler la zone de travail du meme ecart, dans l'autre sens : rien ne bouge a l'ecran, ni au
    // masquage, ni au retour de la colonne apres le lacher. Ecart residuel (defilement borne par Blockly) : la
    // translation du canevas est recalee directement.
    const boiteAOutils = window.workspace.getToolbox();

    // Trait fin et continu au-dessus des titres de groupe de la colonne de blocs (titres « web-class »: groupe-flyout,
    // par exemple Grove > Affichage) : Blockly ne sait faire que des espaces, le trait est ajoute a chaque ouverture.
    const tiroir = boiteAOutils && boiteAOutils.getFlyout && boiteAOutils.getFlyout();
    if (tiroir && typeof tiroir.show === 'function') {
        const afficherTiroir = tiroir.show.bind(tiroir);
        tiroir.show = function (contenu) {
            afficherTiroir(contenu);
            const largeur = tiroir.getWidth ? tiroir.getWidth() : 0;
            tiroir.getWorkspace().getCanvas().querySelectorAll('.groupe-flyout').forEach(titre => {
                if (titre.querySelector('.trait-groupe-flyout')) return;
                const x = titre.transform.baseVal.consolidate() ? titre.transform.baseVal.consolidate().matrix.e : 0;
                const trait = Blockly.utils.dom.createSvgElement('line', {
                    class: 'trait-groupe-flyout', x1: 0, y1: -12, x2: Math.max(40, largeur - 2 * x), y2: -12,
                }, null);
                titre.insertBefore(trait, titre.firstChild);
            });
        };
    }

    if (boiteAOutils) {
        const espace = window.workspace;
        const origineX = () => espace.getMetrics().absoluteLeft + espace.scrollX;   // abscisse ecran de l'origine du canevas
        window.workspace.addChangeListener((evenement) => {
            if (evenement.type !== Blockly.Events.BLOCK_DRAG) return;
            const avant = origineX();
            boiteAOutils.setVisible(!evenement.isStart);
            Blockly.svgResize(espace);
            const ecart = origineX() - avant;
            if (Math.abs(ecart) < 0.5) return;
            espace.scroll(espace.scrollX - ecart, espace.scrollY);
            // translate() attend la position ecran complete du canevas (marge de la colonne comprise).
            if (Math.abs(origineX() - avant) >= 0.5) espace.translate(avant, espace.scrollY + espace.getMetrics().absoluteTop);
        });
    }

    // ------------------------------------------
    // REDIMENSIONNEMENT DU SIMULATEUR PAR GLISSER (transcription masquee)
    // ------------------------------------------
    // Demande de l'utilisateur : agrandir/reduire le panneau simulateur en
    // glissant sa bordure gauche, uniquement quand "Code" est masque (seul
    // cas ou cette poignee separe directement le simulateur de la zone de
    // blocs — voir synchroniserResizerSimulateur ci-dessus). La largeur du
    // conteneur passe d'un pourcentage (`flex: 0 0 24%`) a une valeur fixe
    // en pixels pendant le glisser. La carte micro:bit, elle, garde une
    // taille fixe (voir adapterEchelleSimulateur, plus bas) : elle se
    // recentre toute seule dans l'espace disponible via `align-items:
    // center`, sans rien a recalculer ici. Blockly, lui, ne s'apercoit
    // jamais tout seul qu'on lui a change sa place.
    if (resizerSimulateur && conteneurSimulateur) {
        let xDepart = 0;
        let largeurDepart = 0;

        function deplacerResizerSimulateur(evenement) {
            // La poignee est a gauche du panneau : glisser vers la gauche
            // (delta negatif) l'agrandit, glisser vers la droite le reduit.
            const largeurBrute = largeurDepart - (evenement.clientX - xDepart);
            // Plafond calcule a la volee (pas un pourcentage fixe) pour que
            // la zone de blocs garde toujours au moins son min-width CSS
            // (260px) : #blockly-wrapper a flex-shrink actif mais pas
            // #simulator-container une fois sa largeur fixee en pixels, donc
            // rien d'autre ne l'empecherait de deborder.
            const largeurMax = document.getElementById('main-container').clientWidth - 260 - 6;
            const nouvelleLargeur = Math.max(250, Math.min(largeurMax, largeurBrute));
            conteneurSimulateur.style.flex = `0 0 ${nouvelleLargeur}px`;
            Blockly.svgResize(window.workspace);
        }

        function relacherResizerSimulateur() {
            document.removeEventListener('mousemove', deplacerResizerSimulateur);
            document.removeEventListener('mouseup', relacherResizerSimulateur);
            resizerSimulateur.classList.remove('actif');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        resizerSimulateur.addEventListener('mousedown', (evenement) => {
            if (!conteneurCode.classList.contains('replie')) return;
            xDepart = evenement.clientX;
            largeurDepart = conteneurSimulateur.getBoundingClientRect().width;
            resizerSimulateur.classList.add('actif');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            document.addEventListener('mousemove', deplacerResizerSimulateur);
            document.addEventListener('mouseup', relacherResizerSimulateur);
            evenement.preventDefault();
        });
    }

    // ------------------------------------------
    // THÈME CLAIR / SOMBRE, ET CONTRASTE NORMAL / ÉLEVÉ
    // ------------------------------------------
    // Les grandes surfaces (barre d'outils, panneaux, code) passent par des
    // variables CSS (voir index.html) ; Blockly n'a pas de thème sombre livré
    // (seuls "Classic" et "Zelos" existent) — quatre thèmes personnalisés
    // couvrent l'espace de travail, la boîte à outils et le tiroir (un par
    // combinaison clair/sombre × normal/élevé ; "clair normal" seul reste le
    // "Classic" fourni par Blockly, inchangé). Les couleurs "d'appareil"
    // (sprites, carte micro:bit, DEL...) ne suivent ni l'un ni l'autre :
    // elles représentent quelque chose de réel, comme les couleurs des
    // boutons d'action — la carte ne devient pas "plus accessible" en
    // changeant de couleur, ce n'est pas du texte à lire.
    // Police du texte des blocs : celle par defaut de Blockly, comme la version Arduino R4 (reglee dans le theme, pas en CSS :
    // Blockly mesure le texte avec cette police pour dimensionner les blocs ; jamais de gras).
    const POLICE_BLOCS = { family: 'sans-serif', weight: 'normal', size: 11 };   // police par defaut de Blockly (alignement sur la version Arduino R4)
    const THEME_SOMBRE_NORMAL = Blockly.Theme.defineTheme('sombreMicrobitV2', {
        base: Blockly.Themes.Classic,
        fontStyle: POLICE_BLOCS,
        componentStyles: {
            workspaceBackgroundColour: '#1e1f23',
            toolboxBackgroundColour: '#141517',
            toolboxForegroundColour: '#dddddd',
            flyoutBackgroundColour: '#2a2c31',
            flyoutForegroundColour: '#b5b8bf',
            flyoutOpacity: 1,
            scrollbarColour: '#5a5e66',
            insertionMarkerColour: '#ffffff',
            insertionMarkerOpacity: 0.3,
            cursorColour: '#ffffff'
        }
    });
    const THEME_SOMBRE_ELEVE = Blockly.Theme.defineTheme('sombreEleveMicrobitV2', {
        base: Blockly.Themes.Classic,
        fontStyle: POLICE_BLOCS,
        componentStyles: {
            workspaceBackgroundColour: '#000000',
            toolboxBackgroundColour: '#000000',
            toolboxForegroundColour: '#ffffff',
            flyoutBackgroundColour: '#000000',
            flyoutForegroundColour: '#ffffff',
            flyoutOpacity: 1,
            scrollbarColour: '#ffffff',
            insertionMarkerColour: '#ffffff',
            insertionMarkerOpacity: 0.5,
            cursorColour: '#ffffff'
        }
    });
    const THEME_CLAIR_ELEVE = Blockly.Theme.defineTheme('clairEleveMicrobitV2', {
        base: Blockly.Themes.Classic,
        fontStyle: POLICE_BLOCS,
        componentStyles: {
            workspaceBackgroundColour: '#ffffff',
            toolboxBackgroundColour: '#ffffff',
            toolboxForegroundColour: '#000000',
            flyoutBackgroundColour: '#ffffff',
            flyoutForegroundColour: '#000000',
            flyoutOpacity: 1,
            scrollbarColour: '#000000',
            insertionMarkerColour: '#000000',
            insertionMarkerOpacity: 0.3,
            cursorColour: '#000000'
        }
    });

    // « Clair normal » etait le theme Classic fourni par Blockly : un theme derive permet d'y fixer la police.
    const THEME_CLAIR_NORMAL = Blockly.Theme.defineTheme('clairMicrobitV2', {
        base: Blockly.Themes.Classic,
        fontStyle: POLICE_BLOCS,
        componentStyles: {
            workspaceBackgroundColour: '#f2f2ef',   // gris doux plutot que blanc (essai B, 31 oct. 2026)
            toolboxBackgroundColour: '#2e2e2e',     // colonne de categories sombre meme en clair (version Arduino R4)
            toolboxForegroundColour: '#dddddd',
            flyoutBackgroundColour: '#dcdcd7',
            flyoutForegroundColour: '#555555',
            flyoutOpacity: 1
        }
    });

    // Themes de saison (menu Affichage > Saison, bandeau.js) : variantes du sombre en contraste normal.
    const THEME_HALLOWEEN = Blockly.Theme.defineTheme('halloweenMicrobitV2', {
        base: THEME_SOMBRE_NORMAL,
        fontStyle: POLICE_BLOCS,
        componentStyles: {
            workspaceBackgroundColour: '#141414',
            toolboxBackgroundColour: '#0f0d12',
            flyoutBackgroundColour: '#1f1a24',
            scrollbarColour: '#6b4a80'
        }
    });
    const THEME_NOEL = Blockly.Theme.defineTheme('noelMicrobitV2', {
        base: THEME_SOMBRE_NORMAL,
        fontStyle: POLICE_BLOCS,
        componentStyles: {
            workspaceBackgroundColour: '#0d1b2a',
            toolboxBackgroundColour: '#08131f',
            flyoutBackgroundColour: '#13263a',
            scrollbarColour: '#4a6a8a'
        }
    });

    const THEME_SALON = Blockly.Theme.defineTheme('salonMicrobitV2', {   // salon Educatech Expo 2026 (bandeau.js)
        base: THEME_SOMBRE_NORMAL,
        fontStyle: POLICE_BLOCS,
        componentStyles: {
            workspaceBackgroundColour: '#12163a',
            toolboxBackgroundColour: '#0c1030',
            flyoutBackgroundColour: '#171c47',
            scrollbarColour: '#4b5bb0'
        }
    });

    function themeClairActif() {
        return document.documentElement.dataset.theme === 'light';
    }
    function contrasteEleveActif() {
        return document.documentElement.dataset.contrast === 'high';
    }
    function appliquerThemeBlockly() {
        const clair = themeClairActif(), eleve = contrasteEleveActif();
        const saison = { halloween: THEME_HALLOWEEN, noel: THEME_NOEL, salon: THEME_SALON }[document.documentElement.dataset.saison];
        const theme = clair
            ? (eleve ? THEME_CLAIR_ELEVE : THEME_CLAIR_NORMAL)
            // Sombre sans theme de saison : charte Educatech (demande de l'utilisateur, 31 oct. 2026), comme le salon.
            : (eleve ? THEME_SOMBRE_ELEVE : (saison || THEME_SALON));
        if (window.workspace.getTheme() !== theme) window.workspace.setTheme(theme);
    }
    new MutationObserver(appliquerThemeBlockly).observe(document.documentElement, { attributes: true, attributeFilter: ['data-saison'] });

    const btnTheme = document.getElementById('btn-theme');
    function appliquerTheme(clair) {
        document.documentElement.dataset.theme = clair ? 'light' : '';
        appliquerThemeBlockly();
        if (btnTheme) {
            // `.textContent` sur le bouton lui-même effacerait le <span
            // class="icone-bouton"> (taille réduite) posé autour de l'icône :
            // on cible ce span, avec repli sur le bouton si jamais absent.
            const icone = btnTheme.querySelector('.icone-bouton') || btnTheme;
            icone.textContent = 'Thème : ' + (clair ? 'clair' : 'sombre');   // theme actuel ; le titre dit l'action
            btnTheme.title = clair ? 'Passer au thème sombre' : 'Passer au thème clair';
        }
        try { localStorage.setItem('themeApp', clair ? 'light' : 'dark'); }
        catch (erreur) { /* navigation privee : le choix ne survivra pas au rechargement, tant pis */ }
    }

    const btnContraste = document.getElementById('btn-contraste');
    function appliquerContraste(eleve) {
        document.documentElement.dataset.contrast = eleve ? 'high' : '';
        appliquerThemeBlockly();
        if (btnContraste) {
            btnContraste.classList.toggle('actif', eleve);
            btnContraste.title = eleve ? 'Revenir au contraste normal' : 'Passer en contraste élevé';
        }
        try { localStorage.setItem('contrasteApp', eleve ? 'high' : 'normal'); }
        catch (erreur) { /* navigation privee : le choix ne survivra pas au rechargement, tant pis */ }
    }

    // Les attributs peuvent déjà être posés par le petit script en tête de
    // index.html (qui évite un flash) : on part de leur état plutôt que de
    // relire localStorage une deuxième fois, les deux doivent de toute façon
    // rester d'accord.
    appliquerTheme(themeClairActif());
    appliquerContraste(contrasteEleveActif());
    if (btnTheme) {
        btnTheme.addEventListener('click', () => appliquerTheme(!themeClairActif()));
    }
    if (btnContraste) {
        btnContraste.addEventListener('click', () => appliquerContraste(!contrasteEleveActif()));
    }

    // Filet principal : on surveille la taille du canevas lui-meme. Blockly garde
    // en cache les dimensions de son conteneur et place corbeille et barres de
    // defilement d'apres ce cache ; des qu'il est perime, ils partent hors de
    // l'ecran. Un observateur couvre toutes les causes — fenetre redimensionnee,
    // panneau replie, sections Grove affichees ou masquees, zoom du navigateur —
    // et se declenche apres le recalcul de la mise en page, donc au bon moment.
    if (window.ResizeObserver) {
        new ResizeObserver(() => Blockly.svgResize(window.workspace))
            .observe(document.getElementById('blocklyDiv'));
    }

    // ------------------------------------------
    // ZOOM DEPUIS LA BARRE
    // ------------------------------------------
    // Au chargement, Blockly place la corbeille d'apres des metriques pas encore
    // a jour : elle se retrouvait 329 px sous le bas du canevas, donc invisible.
    Blockly.svgResize(window.workspace);

    const zoomValeur = document.getElementById('zoom-valeur');

    function afficherZoom() {
        if (zoomValeur) zoomValeur.textContent = Math.round(window.workspace.getScale() * 100) + ' %';
    }

    // L'indicateur est accroche a setScale plutot qu'aux evenements : toutes les
    // facons de zoomer (boutons, molette, pincement, ajustement) y passent, alors
    // que l'evenement viewport_change ne se declenche pas de facon fiable.
    const reglerEchelleOrigine = window.workspace.setScale.bind(window.workspace);
    window.workspace.setScale = function(echelle) {
        const resultat = reglerEchelleOrigine(echelle);
        afficherZoom();
        return resultat;
    };

    function reglerZoom(sens) {
        window.workspace.zoomCenter(sens);
        afficherZoom();
    }

    /** Ajuste l'échelle aux blocs présents, ou revient à 100 % si l'espace est vide. */
    function ajusterZoom() {
        const ws = window.workspace;
        if (ws.getTopBlocks(false).length === 0) {
            ws.setScale(1);
        } else {
            ws.zoomToFit();
        }
        ws.scrollCenter();
        afficherZoom();
    }

    const btnZoomMoins = document.getElementById('btn-zoom-moins');
    const btnZoomPlus = document.getElementById('btn-zoom-plus');
    const btnZoomAjuster = document.getElementById('btn-zoom-ajuster');
    if (btnZoomMoins) btnZoomMoins.addEventListener('click', () => reglerZoom(-1));
    if (btnZoomPlus) btnZoomPlus.addEventListener('click', () => reglerZoom(1));
    if (btnZoomAjuster) btnZoomAjuster.addEventListener('click', ajusterZoom);

    afficherZoom();

    // ==========================================
    // 3. GESTION DES TÉLÉCHARGEMENTS (.HEX et .PY)
    // ==========================================
    window.currentPythonCode = "";

    const zoneEtat = document.getElementById('etat');
    const boutonHex = document.getElementById('download-btn');

    function afficherEtat(message, enErreur) {
        if (!zoneEtat) return;
        zoneEtat.textContent = message;
        zoneEtat.title = message || '';   // message complet au survol (le texte est tronque s'il est trop long)
        zoneEtat.classList.toggle('erreur', !!enErreur);
    }
    // Utilisé aussi par le simulateur Brython, qui n'a pas d'autre moyen de
    // remonter une erreur à l'utilisateur.
    window.simu_erreur = function(message) { afficherEtat('Simulateur : ' + message, true); };
    window.simu_ok = function() { afficherEtat('', false); };

    boutonHex.addEventListener('click', async () => {
        const codePython = window.currentPythonCode;
        if (!codePython || codePython.trim() === "") {
            afficherEtat("Ajoutez d'abord des blocs sur l'espace de travail.", true);
            return;
        }

        boutonHex.disabled = true;
        afficherEtat('Génération…', false);

        try {
            // La signature n'est ajoutee qu'au fichier ECRIT, jamais a
            // window.currentPythonCode (transcription affichee, simulateur) :
            // voir la section "RECONSTRUCTION DE BLOCS..." plus bas.
            const finalHex = await genererFichierHexFinal(SIGNATURE_EXPORT + codePython);
            const blob = new Blob([finalHex], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = nomFichierPour('programme-microbit.hex');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            afficherEtat('Fichier téléchargé.', false);
        } catch (error) {
            // On affiche la cause réelle : un message passe-partout masquerait le
            // vrai problème (firmware incomplet, CDN injoignable, image invalide…).
            console.error("Erreur lors de la génération du .hex :", error);
            afficherEtat(error.message, true);
        } finally {
            boutonHex.disabled = false;
        }
    });

    // ------------------------------------------
    // ENVOI DIRECT SUR LE LECTEUR MICROBIT
    // ------------------------------------------
    // Le lecteur n'accepte que des .hex : y deposer un .py ne ferait rien. On y
    // ecrit donc le meme fichier que celui du bouton de telechargement, ce qui
    // revient exactement a un glisser-deposer.
    //
    // L'API d'acces aux fichiers n'existe que sur Chrome et Edge ; ailleurs le
    // bouton est desactive plutot que trompeur.

    const boutonEnvoyer = document.getElementById('btn-envoyer');
    let dossierCarte = null;

    /** Un lecteur micro:bit porte toujours l'un de ces deux fichiers. */
    async function estLecteurMicrobit(dossier) {
        for (const nom of ['DETAILS.TXT', 'MICROBIT.HTM']) {
            try {
                await dossier.getFileHandle(nom);
                return true;
            } catch (erreur) { /* fichier absent, on essaie le suivant */ }
        }
        return false;
    }

    /** Redemande l'autorisation d'ecriture sur un dossier deja choisi. */
    async function autorisationEcriture(dossier) {
        const options = { mode: 'readwrite' };
        if (await dossier.queryPermission(options) === 'granted') return true;
        return await dossier.requestPermission(options) === 'granted';
    }

    // Fenetre modale de progression (markup : #voile-envoi, index.html). Au
    // premier plan et bloquante : rien d'autre ne doit etre clique pendant
    // que le lecteur de la carte est en cours d'ecriture.
    const fenetreEnvoi = {
        voile: document.getElementById('voile-envoi'),
        phase: document.getElementById('envoi-phase'),
        barre: document.getElementById('envoi-barre'),
        remplissage: document.getElementById('envoi-remplissage'),
        pourcent: document.getElementById('envoi-pourcent'),
        ouvrir(texte) {
            this.progression(0);
            this.etape(texte);
            if (this.voile) this.voile.classList.add('ouvert');
        },
        etape(texte) { if (this.phase) this.phase.textContent = texte; },
        progression(pct) {
            const p = Math.max(0, Math.min(100, Math.round(pct)));
            if (this.remplissage) this.remplissage.style.width = p + '%';
            if (this.pourcent) this.pourcent.textContent = p + ' %';
            if (this.barre) this.barre.setAttribute('aria-valuenow', String(p));
        },
        fermer(delaiMs) {
            const f = () => { if (this.voile) this.voile.classList.remove('ouvert'); };
            if (delaiMs) setTimeout(f, delaiMs); else f();
        }
    };
    window.fenetreEnvoiTest = fenetreEnvoi;

    // ------------------------------------------
    // CONSOLE (barre du bas, masquable)
    // ------------------------------------------
    // Une seule zone, deux sources : les print() du SIMULATEUR (file d'actions
    // du simulateur, voir print_console dans index.html) et la sortie serie de
    // la VRAIE CARTE (Web Serial, Chrome/Edge). Chaque ligne porte sa source
    // (data-src : sim / carte / info) pour la colorer et pour n'effacer que ce
    // qu'il faut.
    const consoleSortie = document.getElementById('console-sortie');
    const consoleEtat = document.getElementById('console-etat');
    const btnConsoleCarte = document.getElementById('btn-console-carte');
    const btnConsoleEffacer = document.getElementById('btn-console-effacer');
    const formConsole = document.getElementById('console-saisie');
    const champConsole = document.getElementById('console-entree');
    const btnConsoleEnvoyer = document.getElementById('console-envoyer');
    const MAX_LIGNES_CONSOLE = 1000;
    // Ligne en cours par source : un morceau recu sans saut de ligne final
    // (frequent en serie) doit se coller au suivant, pas faire une nouvelle ligne.
    const ligneConsoleCourante = { sim: null, carte: null, info: null };

    function nouvelleLigneConsole(source) {
        const ligne = document.createElement('span');
        ligne.className = 'console-ligne';
        ligne.dataset.src = source;
        ligne.dataset.t = String(Date.now());   // heure de reception, pour l'export Excel
        consoleSortie.appendChild(ligne);
        // Une boucle sans pause inonderait la page : on garde les dernieres lignes.
        while (consoleSortie.childElementCount > MAX_LIGNES_CONSOLE) {
            const premiere = consoleSortie.firstElementChild;
            for (const k of Object.keys(ligneConsoleCourante)) {
                if (ligneConsoleCourante[k] === premiere) ligneConsoleCourante[k] = null;
            }
            premiere.remove();
        }
        return ligne;
    }

    window.consoleAjouterLigne = (texte, source) => ecrireConsole(String(texte) + '\n', source || 'info');   // radio entre simulateurs
    function ecrireConsole(texte, source) {
        if (!consoleSortie) return;
        if (source !== 'info') ouvrirConsoleAuto();
        const enBas = consoleSortie.scrollTop + consoleSortie.clientHeight >= consoleSortie.scrollHeight - 8;
        const morceaux = String(texte).replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
        morceaux.forEach((morceau, i) => {
            if (i > 0) ligneConsoleCourante[source] = null;            // saut de ligne : on ferme la ligne en cours
            if (morceau === '' && i === morceaux.length - 1) return;   // rien apres le dernier saut de ligne
            if (!ligneConsoleCourante[source]) ligneConsoleCourante[source] = nouvelleLigneConsole(source);
            ligneConsoleCourante[source].textContent += morceau;
        });
        // On ne force le defilement que si l'utilisateur etait deja en bas.
        if (enBas) consoleSortie.scrollTop = consoleSortie.scrollHeight;
        planifierGraphique();
    }

    function effacerConsole(source) {
        if (!consoleSortie) return;
        if (!source) {
            consoleSortie.textContent = '';
            for (const k of Object.keys(ligneConsoleCourante)) ligneConsoleCourante[k] = null;
            planifierGraphique();
            return;
        }
        consoleSortie.querySelectorAll('.console-ligne[data-src="' + source + '"]').forEach(l => l.remove());
        ligneConsoleCourante[source] = null;
        planifierGraphique();
    }

    window.simu_console = function(texte) { window.simuQueue.push({ type: 'console', texte: String(texte) }); };
    window.simu_effacerConsole = effacerConsole;

    // Faux uart du simulateur (voir _UartMock, index.html) : file de texte envoyee
    // par le panneau IA. N'accepte rien tant que la simulation ne tourne pas, pour
    // qu'un vieux resultat ne soit pas livre au prochain "Lancer".
    window.simu_uartFile = [];
    window.simu_uartPousser = function(texte) {
        if (window.simuEnCours) window.simu_uartFile.push(String(texte));
    };
    window.simu_uartDisponible = function() { return window.simu_uartFile.length > 0; };
    window.simu_uartLire = function() { const t = window.simu_uartFile.join(''); window.simu_uartFile = []; return t; };
    window.simu_uartLireLigne = function() {
        const tout = window.simu_uartFile.join('');
        const i = tout.indexOf('\n');
        if (i < 0) { window.simu_uartFile = []; return tout; }
        window.simu_uartFile = tout.length > i + 1 ? [tout.slice(i + 1)] : [];
        return tout.slice(0, i + 1);
    };

    if (btnConsoleEffacer) btnConsoleEffacer.addEventListener('click', () => effacerConsole());

    // ---- Export Excel (.xlsx) ----
    // Fichier ecrit a la main, sans bibliotheque : un .xlsx est une archive ZIP
    // de quelques fichiers XML. Les entrees sont simplement STOCKEES (pas de
    // compression), ce qui suffit pour quelques milliers de lignes et evite
    // d'embarquer un compresseur. Marche hors ligne, exe compris.
    const TABLE_CRC32 = (() => {
        const table = new Uint32Array(256);
        for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
            table[n] = c >>> 0;
        }
        return table;
    })();
    function crc32(octets) {
        let c = 0xFFFFFFFF;
        for (let i = 0; i < octets.length; i++) c = TABLE_CRC32[(c ^ octets[i]) & 0xFF] ^ (c >>> 8);
        return (c ^ 0xFFFFFFFF) >>> 0;
    }

    /** Archive ZIP (sans compression) : fichiers = [{ nom, contenu: texte UTF-8 }]. */
    function creerZip(fichiers) {
        const encodeur = new TextEncoder();
        const maintenant = new Date();
        const heureDos = (maintenant.getHours() << 11) | (maintenant.getMinutes() << 5) | (maintenant.getSeconds() >> 1);
        const dateDos = ((maintenant.getFullYear() - 1980) << 9) | ((maintenant.getMonth() + 1) << 5) | maintenant.getDate();
        const locaux = [], centraux = [];
        let decalage = 0;
        const u16 = v => [v & 0xFF, (v >>> 8) & 0xFF];
        const u32 = v => [v & 0xFF, (v >>> 8) & 0xFF, (v >>> 16) & 0xFF, (v >>> 24) & 0xFF];
        fichiers.forEach(f => {
            const nom = encodeur.encode(f.nom), donnees = encodeur.encode(f.contenu), crc = crc32(donnees);
            // 0x0800 : noms en UTF-8 ; methode 0 : stocke.
            const commun = [...u16(20), ...u16(0x0800), ...u16(0), ...u16(heureDos), ...u16(dateDos),
                            ...u32(crc), ...u32(donnees.length), ...u32(donnees.length), ...u16(nom.length), ...u16(0)];
            locaux.push(Uint8Array.from([...u32(0x04034b50), ...commun]), nom, donnees);
            centraux.push(Uint8Array.from([...u32(0x02014b50), ...u16(20), ...commun,
                                           ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(decalage)]), nom);
            decalage += 30 + nom.length + donnees.length;
        });
        const tailleCentral = centraux.reduce((t, p) => t + p.length, 0);
        const fin = Uint8Array.from([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(fichiers.length),
                                     ...u16(fichiers.length), ...u32(tailleCentral), ...u32(decalage), ...u16(0)]);
        return new Blob([...locaux, ...centraux, fin], { type: 'application/zip' });
    }

    const echapperXml = t => String(t).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const heureLisible = ms => {
        const d = new Date(ms), p = (n, l = 2) => String(n).padStart(l, '0');
        return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()) + '.' + p(d.getMilliseconds(), 3);
    };
    const NOMS_SOURCES = { sim: 'Simulateur', carte: 'Carte', info: 'Information' };

    /** Lignes actuellement affichees dans la console, avec heure, source et valeur numerique eventuelle. */
    function lignesPourExport() {
        if (!consoleSortie) return [];
        return Array.from(consoleSortie.querySelectorAll('.console-ligne')).map((l, i) => {
            const texte = l.textContent;
            const nombre = texte.trim() !== '' && Number.isFinite(Number(texte.trim().replace(',', '.')))
                ? Number(texte.trim().replace(',', '.')) : null;
            return { n: i + 1, heure: heureLisible(Number(l.dataset.t) || Date.now()),
                     source: NOMS_SOURCES[l.dataset.src] || l.dataset.src, texte, nombre };
        });
    }

    function creerXlsxConsole(lignes) {
        const texteCell = t => '<c t="inlineStr"><is><t xml:space="preserve">' + echapperXml(t) + '</t></is></c>';
        const lignesXml = ['<row r="1">' + ['N°', 'Heure', 'Source', 'Texte', 'Valeur numérique'].map(texteCell).join('') + '</row>'];
        lignes.forEach((l, i) => {
            lignesXml.push('<row r="' + (i + 2) + '"><c><v>' + l.n + '</v></c>' + texteCell(l.heure) + texteCell(l.source) +
                           texteCell(l.texte) + (l.nombre === null ? '' : '<c><v>' + l.nombre + '</v></c>') + '</row>');
        });
        const enTete = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
        const ns = 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"';
        return creerZip([
            { nom: '[Content_Types].xml', contenu: enTete +
              '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
              '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
              '<Default Extension="xml" ContentType="application/xml"/>' +
              '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
              '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
              '</Types>' },
            { nom: '_rels/.rels', contenu: enTete +
              '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
              '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
              '</Relationships>' },
            { nom: 'xl/workbook.xml', contenu: enTete + '<workbook ' + ns +
              ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
              '<sheets><sheet name="Console" sheetId="1" r:id="rId1"/></sheets></workbook>' },
            { nom: 'xl/_rels/workbook.xml.rels', contenu: enTete +
              '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
              '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
              '</Relationships>' },
            { nom: 'xl/worksheets/sheet1.xml', contenu: enTete + '<worksheet ' + ns + '>' +
              '<cols><col min="1" max="1" width="7" customWidth="1"/><col min="2" max="2" width="14" customWidth="1"/>' +
              '<col min="3" max="3" width="13" customWidth="1"/><col min="4" max="4" width="50" customWidth="1"/>' +
              '<col min="5" max="5" width="18" customWidth="1"/></cols>' +
              '<sheetData>' + lignesXml.join('') + '</sheetData></worksheet>' },
        ]);
    }

    const btnConsoleExporter = document.getElementById('btn-console-exporter');
    if (btnConsoleExporter) {
        btnConsoleExporter.addEventListener('click', () => {
            const lignes = lignesPourExport();
            if (!lignes.length) { etatConsole('Rien à exporter : la console est vide.'); return; }
            const p = n => String(n).padStart(2, '0'), d = new Date();
            const nom = 'console-microbit-' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' +
                        p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds()) + '.xlsx';
            const blob = creerXlsxConsole(lignes);
            const url = URL.createObjectURL(new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
            const a = document.createElement('a');
            a.href = url; a.download = nom;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            URL.revokeObjectURL(url);
            etatConsole(lignes.length + ' ligne(s) exportée(s) dans ' + nom + '.');
        });
    }
    window.exportConsoleTest = { lignesPourExport, creerXlsxConsole };

    // ---- Graphique : courbes des valeurs numeriques de la console ----
    // Dessine sur un canevas, sans bibliotheque (marche hors ligne). Il lit les
    // lignes DEJA presentes dans la console (comme l'export Excel), donc
    // simulateur et vraie carte sont traites pareil. Formats reconnus, un par ligne :
    //   21.5            un nombre            -> serie "Valeur"
    //   (12, 40, 7)     n-uplet (aussi 12,40,7 ou 12 40 7, comme le traceur de Mu)
    //                                        -> series "Serie 1", "Serie 2"...
    //   temp:21 lum:40  paires nom:valeur    -> une serie par nom (aussi nom=valeur)
    // Une virgule collee entre deux chiffres est decimale (« 21,5 ») tant qu'il n'y
    // a qu'un nombre ; un n-uplet separe ses valeurs par virgule, point-virgule ou espace.
    const CHIFFRES = '[-+]?(?:\\d+(?:\\.\\d+)?|\\.\\d+)(?:[eE][-+]?\\d+)?';
    const RE_UN_NOMBRE = new RegExp('^[-+]?(?:\\d+(?:[.,]\\d+)?|[.,]\\d+)(?:[eE][-+]?\\d+)?$');
    const RE_VALEUR = new RegExp('^' + CHIFFRES + '$');
    const RE_PAIRE = new RegExp('([\\p{L}_][\\p{L}\\p{N}_ -]*?)\\s*[:=]\\s*(' + CHIFFRES + ')', 'gu');
    const COULEURS_COURBES = ['#4fc3f7', '#ff8a65', '#81c784', '#ffd54f', '#ba68c8', '#4db6ac', '#f06292', '#a1887f'];
    const MAX_POINTS_COURBE = 600;

    function extraireMesures(texte) {
        const t = texte.trim();
        if (!t) return [];
        if (RE_UN_NOMBRE.test(t)) return [['Valeur', Number(t.replace(',', '.'))]];
        const entre = /^\(.*\)$/.test(t) ? t.slice(1, -1).trim() : t;
        const morceaux = entre.split(/\s*[;,]\s*|\s+/).filter(m => m !== '');
        if (morceaux.length > 1 && morceaux.every(m => RE_VALEUR.test(m))) {
            return morceaux.map((m, i) => ['Série ' + (i + 1), Number(m)]);
        }
        const paires = [];
        let trouve;
        RE_PAIRE.lastIndex = 0;
        while ((trouve = RE_PAIRE.exec(t)) !== null) paires.push([trouve[1].trim(), Number(trouve[2])]);
        return paires;
    }

    /** Series { nom, points: [{t, v}] } tirees des lignes de la console, t en secondes depuis la premiere mesure. */
    function collecterSeries() {
        if (!consoleSortie) return [];
        const mesures = [];
        consoleSortie.querySelectorAll('.console-ligne').forEach(l => {
            if (l.dataset.src === 'info') return;
            const t = Number(l.dataset.t) || 0;
            extraireMesures(l.textContent).forEach(([nom, v]) => {
                if (Number.isFinite(v)) mesures.push({ t, v, nom, source: l.dataset.src });
            });
        });
        if (!mesures.length) return [];
        // Simulateur ET carte presents : on prefixe le nom pour ne pas melanger leurs courbes.
        const sources = new Set(mesures.map(m => m.source));
        const t0 = Math.min(...mesures.map(m => m.t));
        const parCle = new Map();
        mesures.forEach(m => {
            const cle = sources.size > 1 ? (NOMS_SOURCES[m.source] || m.source) + ' · ' + m.nom : m.nom;
            if (!parCle.has(cle)) parCle.set(cle, { nom: cle, points: [] });
            parCle.get(cle).points.push({ t: (m.t - t0) / 1000, v: m.v });
        });
        return Array.from(parCle.values()).map(s => {
            if (s.points.length > MAX_POINTS_COURBE) s.points = s.points.slice(-MAX_POINTS_COURBE);
            return s;
        });
    }

    /** Graduations « rondes » : pas de 1, 2 ou 5 x 10^n couvrant [min, max] en ~n intervalles. */
    function graduations(min, max, n) {
        const brut = (max - min) / n;
        const puissance = Math.pow(10, Math.floor(Math.log10(brut)));
        const reste = brut / puissance;
        const pas = (reste < 1.5 ? 1 : reste < 3 ? 2 : reste < 7 ? 5 : 10) * puissance;
        const valeurs = [];
        for (let v = Math.ceil(min / pas) * pas; v <= max + pas * 1e-9; v += pas) valeurs.push(Math.abs(v) < pas * 1e-9 ? 0 : v);
        return { valeurs, pas };
    }
    const formaterGraduation = (v, pas) => {
        const decimales = Math.max(0, Math.min(6, -Math.floor(Math.log10(pas))));
        return v.toFixed(decimales);
    };

    const zoneGraphique = document.getElementById('console-graphique');
    const canevasConsole = document.getElementById('console-canevas');
    let minuterieGraphique = null;
    const graphiqueVisible = () => !!zoneGraphique && !zoneGraphique.classList.contains('replie');

    function planifierGraphique() {
        if (!graphiqueVisible() || minuterieGraphique) return;
        // Regroupe les rafales de lignes : un seul dessin toutes les ~100 ms.
        minuterieGraphique = setTimeout(() => { minuterieGraphique = null; dessinerGraphique(); }, 100);
    }

    function dessinerGraphique() {
        if (!graphiqueVisible() || !canevasConsole) return;
        const largeur = zoneGraphique.clientWidth, hauteur = zoneGraphique.clientHeight;
        if (largeur < 20 || hauteur < 20) return;
        const ratio = window.devicePixelRatio || 1;
        if (canevasConsole.width !== Math.round(largeur * ratio) || canevasConsole.height !== Math.round(hauteur * ratio)) {
            canevasConsole.width = Math.round(largeur * ratio);
            canevasConsole.height = Math.round(hauteur * ratio);
        }
        const ctx = canevasConsole.getContext('2d');
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.clearRect(0, 0, largeur, hauteur);
        // Couleurs du theme en cours (sombre, clair, contraste eleve).
        const css = getComputedStyle(document.documentElement);
        const texte = css.getPropertyValue('--texte-saisie').trim() || '#d6e0ea';
        const trame = css.getPropertyValue('--bordure-chrome').trim() || '#555555';
        ctx.font = '11px sans-serif';
        ctx.textBaseline = 'middle';

        const series = collecterSeries();
        if (!series.length) {
            ctx.fillStyle = texte; ctx.globalAlpha = 0.7; ctx.textAlign = 'center';
            ctx.fillText('Aucune valeur numérique à tracer.', largeur / 2, hauteur / 2 - 8);
            ctx.fillText('Écrivez des nombres avec « afficher dans la console » (ex. 21.5, ou temp:21 lum:40).', largeur / 2, hauteur / 2 + 10);
            ctx.globalAlpha = 1;
            return;
        }

        const haut = 22, bas = 20, gauche = 46, droite = 12;
        const zw = largeur - gauche - droite, zh = hauteur - haut - bas;
        if (zw < 30 || zh < 20) return;
        let tmax = Math.max(...series.map(s => s.points[s.points.length - 1].t));
        let tmin = Math.min(...series.map(s => s.points[0].t));
        let vmin = Math.min(...series.map(s => Math.min(...s.points.map(p => p.v))));
        let vmax = Math.max(...series.map(s => Math.max(...s.points.map(p => p.v))));
        if (tmax - tmin < 1e-9) { tmin -= 1; tmax += 1; }
        if (vmax - vmin < 1e-9) { vmin -= 1; vmax += 1; }
        const marge = (vmax - vmin) * 0.06; vmin -= marge; vmax += marge;
        const X = t => gauche + (t - tmin) / (tmax - tmin) * zw;
        const Y = v => haut + (1 - (v - vmin) / (vmax - vmin)) * zh;

        // Grille et graduations
        ctx.lineWidth = 1; ctx.strokeStyle = trame; ctx.fillStyle = texte; ctx.textAlign = 'right';
        const gy = graduations(vmin, vmax, Math.max(2, Math.floor(zh / 28)));
        gy.valeurs.forEach(v => {
            const y = Math.round(Y(v)) + 0.5;
            ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.moveTo(gauche, y); ctx.lineTo(gauche + zw, y); ctx.stroke();
            ctx.globalAlpha = 1; ctx.fillText(formaterGraduation(v, gy.pas), gauche - 5, y);
        });
        ctx.textAlign = 'center';
        const gx = graduations(tmin, tmax, Math.max(2, Math.floor(zw / 70)));
        gx.valeurs.forEach(t => {
            const x = Math.round(X(t)) + 0.5;
            ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.moveTo(x, haut); ctx.lineTo(x, haut + zh); ctx.stroke();
            ctx.globalAlpha = 1; ctx.fillText(formaterGraduation(t, gx.pas) + ' s', x, hauteur - bas / 2 + 1);
        });
        ctx.globalAlpha = 1; ctx.strokeStyle = texte;
        ctx.strokeRect(gauche + 0.5, haut + 0.5, zw, zh);

        // Courbes
        ctx.save();
        ctx.beginPath(); ctx.rect(gauche, haut, zw, zh); ctx.clip();
        series.forEach((s, i) => {
            ctx.strokeStyle = ctx.fillStyle = COULEURS_COURBES[i % COULEURS_COURBES.length];
            ctx.lineWidth = 1.8; ctx.lineJoin = 'round';
            ctx.beginPath();
            s.points.forEach((p, k) => { if (k === 0) ctx.moveTo(X(p.t), Y(p.v)); else ctx.lineTo(X(p.t), Y(p.v)); });
            ctx.stroke();
            if (s.points.length <= 80) s.points.forEach(p => { ctx.beginPath(); ctx.arc(X(p.t), Y(p.v), 2.4, 0, Math.PI * 2); ctx.fill(); });
        });
        ctx.restore();

        // Legende : couleur, nom et derniere valeur
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        let x = gauche;
        series.forEach((s, i) => {
            const derniere = s.points[s.points.length - 1].v;
            const etiquette = s.nom + ' = ' + (Number.isInteger(derniere) ? derniere : derniere.toFixed(2));
            ctx.fillStyle = COULEURS_COURBES[i % COULEURS_COURBES.length];
            ctx.fillRect(x, haut / 2 - 4, 10, 8);
            ctx.fillStyle = texte;
            ctx.fillText(etiquette, x + 14, haut / 2);
            x += 14 + ctx.measureText(etiquette).width + 16;
        });
    }

    function afficherVueConsole(vue) {
        const graphique = vue === 'graphique';
        // La poignee de redimensionnement de la vue masquee est recopiee : on garde la meme hauteur.
        if (consoleSortie && zoneGraphique) {
            const h = (graphique ? consoleSortie : zoneGraphique).offsetHeight;
            if (h > 0) (graphique ? zoneGraphique : consoleSortie).style.height = h + 'px';
            consoleSortie.classList.toggle('replie', graphique);
            zoneGraphique.classList.toggle('replie', !graphique);
        }
        const ongletTexte = document.getElementById('onglet-console-texte');
        const ongletGraphique = document.getElementById('onglet-console-graphique');
        [[ongletTexte, !graphique], [ongletGraphique, graphique]].forEach(([b, actif]) => {
            if (!b) return;
            b.classList.toggle('actif', actif);
            b.setAttribute('aria-selected', String(actif));
        });
        if (graphique) dessinerGraphique();
    }
    const ongletTexteConsole = document.getElementById('onglet-console-texte');
    const ongletGraphiqueConsole = document.getElementById('onglet-console-graphique');
    if (ongletTexteConsole) ongletTexteConsole.addEventListener('click', () => afficherVueConsole('texte'));
    if (ongletGraphiqueConsole) ongletGraphiqueConsole.addEventListener('click', () => afficherVueConsole('graphique'));
    if (zoneGraphique && 'ResizeObserver' in window) new ResizeObserver(() => planifierGraphique()).observe(zoneGraphique);
    window.graphiqueConsoleTest = { extraireMesures, collecterSeries, dessinerGraphique, afficherVueConsole };

    // ---- Afficher / masquer la barre (bouton >_ de la barre d'outils) ----
    // Masquee au depart. Elle s'ouvre toute seule a la premiere sortie (print
    // du simulateur ou de la carte) tant que l'utilisateur ne l'a pas fermee
    // lui-meme : apres une fermeture volontaire, plus d'ouverture surprise.
    const consolePanneau = document.getElementById('console-panneau');
    const btnVueConsole = document.getElementById('btn-vue-console');
    const btnConsoleFermer = document.getElementById('btn-console-fermer');
    let consoleFermeeParUtilisateur = false;
    const consoleOuverte = () => !!consolePanneau && !consolePanneau.classList.contains('replie');
    function ouvrirConsoleAuto() {
        if (consolePanneau && !consoleOuverte() && !consoleFermeeParUtilisateur) {
            basculerPanneau(btnVueConsole, consolePanneau);
        }
    }
    if (btnVueConsole && consolePanneau) {
        btnVueConsole.addEventListener('click', () => {
            const etaitOuverte = consoleOuverte();
            basculerPanneau(btnVueConsole, consolePanneau);
            consoleFermeeParUtilisateur = etaitOuverte;
        });
    }
    if (btnConsoleFermer && consolePanneau) {
        btnConsoleFermer.addEventListener('click', () => {
            if (consoleOuverte()) basculerPanneau(btnVueConsole, consolePanneau);
            consoleFermeeParUtilisateur = true;
        });
    }
    // Agrandir la zone de sortie (poignee de la zone) rogne l'espace de blocs :
    // Blockly doit etre prevenu, sinon il garde une hauteur perimee.
    if (consolePanneau && 'ResizeObserver' in window) {
        new ResizeObserver(() => {
            try { Blockly.svgResize(window.workspace); } catch (erreur) { /* page en cours de chargement */ }
        }).observe(consolePanneau);
    }

    // ---- Redimensionnement de la console par glisser (bord haut) ----
    // Demande de l'utilisateur : regler la hauteur de la console en glissant son bord haut, comme le simulateur se regle
    // par son bord gauche. Monter agrandit. La hauteur s'applique aux DEUX vues (texte et graphique, box-sizing:
    // border-box) ; l'espace de blocs garde toujours au moins 150 px. Retenue dans ce navigateur pour la fois suivante ;
    // double-clic : hauteur de depart (148 px). Pointer events : souris, stylet et doigt.
    const redimConsole = document.getElementById('console-redimensionneur');
    const CLE_HAUTEUR_CONSOLE = 'console_hauteur_v1', HAUTEUR_CONSOLE_DEPART = 148, MIN_CONSOLE = 50, MIN_BLOCS = 150;
    function poserHauteurConsole(h) {
        for (const zone of [consoleSortie, zoneGraphique]) {
            if (!zone) continue;
            zone.style.height = h + 'px';
            zone.style.maxHeight = 'none';
        }
        planifierGraphique();
    }
    try {
        const memo = Number(localStorage.getItem(CLE_HAUTEUR_CONSOLE));
        if (memo >= MIN_CONSOLE) poserHauteurConsole(Math.min(memo, Math.round(window.innerHeight * 0.75)));
    } catch (erreur) { /* stockage indisponible : hauteur de depart */ }
    if (redimConsole && consoleSortie) {
        let yDepart = 0, hDepart = 0, hMax = 0;
        const vueVisible = () => (zoneGraphique && !zoneGraphique.classList.contains('replie')) ? zoneGraphique : consoleSortie;
        redimConsole.addEventListener('pointerdown', ev => {
            if (ev.button !== 0) return;
            yDepart = ev.clientY;
            hDepart = vueVisible().offsetHeight;
            const blocs = document.getElementById('main-container');
            hMax = hDepart + Math.max(0, (blocs ? blocs.getBoundingClientRect().height : 0) - MIN_BLOCS);
            try { redimConsole.setPointerCapture(ev.pointerId); } catch (erreur) { /* tant pis */ }
            redimConsole.classList.add('actif');
            document.body.style.cursor = 'row-resize';
            document.body.style.userSelect = 'none';
            ev.preventDefault();
        });
        redimConsole.addEventListener('pointermove', ev => {
            if (!redimConsole.classList.contains('actif')) return;
            poserHauteurConsole(Math.round(Math.max(MIN_CONSOLE, Math.min(hMax, hDepart - (ev.clientY - yDepart)))));
        });
        const relacher = () => {
            if (!redimConsole.classList.contains('actif')) return;
            redimConsole.classList.remove('actif');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            try { localStorage.setItem(CLE_HAUTEUR_CONSOLE, String(vueVisible().offsetHeight)); } catch (erreur) { /* rien */ }
        };
        redimConsole.addEventListener('pointerup', relacher);
        redimConsole.addEventListener('pointercancel', relacher);
        redimConsole.addEventListener('dblclick', () => {
            poserHauteurConsole(HAUTEUR_CONSOLE_DEPART);
            try { localStorage.removeItem(CLE_HAUTEUR_CONSOLE); } catch (erreur) { /* rien */ }
        });
    }

    // ---- Vraie carte : port serie USB (DAPLink, 115200 bauds) ----
    let portSerie = null;
    let lecteurSerie = null;
    // Vrai tant que l'utilisateur veut etre connecte : apres l'envoi d'un
    // programme la carte redemarre, son port disparait puis revient, et on
    // le rouvre alors tout seul pour ne pas rater les premiers print().
    let connexionVoulue = false;
    const pause = ms => new Promise(r => setTimeout(r, ms));

    function etatConsole(texte) { if (consoleEtat) consoleEtat.textContent = texte; }

    function majBoutonsConsole() {
        const connecte = !!portSerie;
        if (btnConsoleCarte) {
            btnConsoleCarte.textContent = connecte ? '🔌 Déconnecter' : '🔌 Connecter';
            btnConsoleCarte.classList.toggle('connecte', connecte);
        }
        if (champConsole) champConsole.disabled = !connecte;
        if (btnConsoleEnvoyer) btnConsoleEnvoyer.disabled = !connecte;
    }

    async function lireSortieCarte(port) {
        const decodeur = new TextDecoder();
        try {
            while (port.readable && portSerie === port) {
                lecteurSerie = port.readable.getReader();
                try {
                    for (;;) {
                        const { value, done } = await lecteurSerie.read();
                        if (done) break;
                        if (value) ecrireConsole(decodeur.decode(value, { stream: true }), 'carte');
                    }
                } finally {
                    lecteurSerie.releaseLock();
                    lecteurSerie = null;
                }
            }
        } catch (erreur) {
            // Port arrache ou erreur de lecture : traite juste apres.
        }
        if (portSerie === port) await fermerPortSerie(false, 'Liaison avec la carte interrompue.');
    }

    async function ouvrirPortSerie(port) {
        await port.open({ baudRate: 115200 });
        portSerie = port;
        majBoutonsConsole();
        etatConsole('Carte connectée (115200 bauds). Sa sortie s\'affiche en vert.');
        ecrireConsole('— carte connectée —\n', 'info');
        lireSortieCarte(port);
    }

    async function fermerPortSerie(parUtilisateur, message) {
        const port = portSerie;
        portSerie = null;
        if (parUtilisateur) connexionVoulue = false;
        majBoutonsConsole();
        try { if (lecteurSerie) await lecteurSerie.cancel(); } catch (erreur) { /* deja ferme */ }
        // close() echoue tant que le lecteur n'a pas rendu son verrou.
        for (let i = 0; i < 20 && lecteurSerie; i++) await pause(50);
        try { if (port) await port.close(); } catch (erreur) { /* deja ferme */ }
        if (message) {
            etatConsole(message);
            ecrireConsole('— ' + message + ' —\n', 'info');
        }
    }

    if (btnConsoleCarte) {
        btnConsoleCarte.addEventListener('click', async () => {
            if (portSerie) { await fermerPortSerie(true, 'Carte déconnectée.'); return; }
            if (!('serial' in navigator)) {
                etatConsole('La console de la carte demande Chrome ou Edge (Web Serial).');
                return;
            }
            try {
                // 0x0D28 : constructeur de l'interface USB des micro:bit (DAPLink).
                const port = await navigator.serial.requestPort({ filters: [{ usbVendorId: 0x0D28 }] });
                connexionVoulue = true;
                await ouvrirPortSerie(port);
            } catch (erreur) {
                connexionVoulue = false;
                etatConsole(erreur.name === 'NotFoundError'
                    ? 'Aucune carte choisie.'
                    : 'Connexion impossible : ' + erreur.message +
                      ' (un autre onglet ou programme utilise peut-être déjà la carte).');
            }
        });
    }

    if ('serial' in navigator) {
        navigator.serial.addEventListener('disconnect', evenement => {
            if (evenement.target === portSerie) fermerPortSerie(false, 'Carte débranchée ou redémarrée.');
        });
        navigator.serial.addEventListener('connect', async evenement => {
            if (!connexionVoulue || portSerie) return;
            for (let essai = 0; essai < 6 && !portSerie; essai++) {
                try { await ouvrirPortSerie(evenement.target); return; }
                catch (erreur) { await pause(400); }
            }
        });
    }

    if (formConsole) {
        formConsole.addEventListener('submit', async evenement => {
            evenement.preventDefault();
            if (!portSerie || !portSerie.writable) return;
            const texte = champConsole.value;
            champConsole.value = '';
            const ecrivain = portSerie.writable.getWriter();
            try {
                await ecrivain.write(new TextEncoder().encode(texte + '\r\n'));
                ecrireConsole('> ' + texte + '\n', 'info');
            } catch (erreur) {
                etatConsole('Envoi impossible : ' + erreur.message);
            } finally {
                ecrivain.releaseLock();
            }
        });
    }

    // Envoi de texte a la vraie carte pour le panneau IA (ia.js). Les envois sont
    // mis en file : un seul getWriter() a la fois, sinon le second echoue.
    // Renvoie false si aucune carte n'est connectee.
    let fileEcritureSerie = Promise.resolve();
    window.ecrireSerie = function (texte) {
        if (!portSerie || !portSerie.writable) return Promise.resolve(false);
        const port = portSerie;
        fileEcritureSerie = fileEcritureSerie.then(async () => {
            if (portSerie !== port || !port.writable) return false;
            const ecrivain = port.writable.getWriter();
            try {
                await ecrivain.write(new TextEncoder().encode(texte));
                return true;
            } catch (erreur) {
                return false;
            } finally {
                ecrivain.releaseLock();
            }
        });
        return fileEcritureSerie;
    };
    window.carteConnectee = () => !!portSerie;

    // ---- Panneau IA (bouton 🧠) : le moteur est dans ia.js ----
    const iaPanneau = document.getElementById('ia-panneau');
    const btnVueIA = document.getElementById('btn-vue-ia');
    const btnIAFermer = document.getElementById('btn-ia-fermer');
    if (btnVueIA && iaPanneau) {
        btnVueIA.addEventListener('click', () => basculerPanneau(btnVueIA, iaPanneau));
    }
    if (btnIAFermer && iaPanneau) {
        btnIAFermer.addEventListener('click', () => {
            if (!iaPanneau.classList.contains('replie')) basculerPanneau(btnVueIA, iaPanneau);
        });
    }
    if (iaPanneau && 'ResizeObserver' in window) {
        new ResizeObserver(() => {
            try { Blockly.svgResize(window.workspace); } catch (erreur) { /* page en cours de chargement */ }
        }).observe(iaPanneau);
    }
    window.ouvrirPanneauIA = function () {
        if (iaPanneau && btnVueIA && iaPanneau.classList.contains('replie')) basculerPanneau(btnVueIA, iaPanneau);
    };
    window.fermerPanneauIA = function () {
        if (iaPanneau && btnVueIA && !iaPanneau.classList.contains('replie')) basculerPanneau(btnVueIA, iaPanneau);
    };

    // ------------------------------------------
    // AIDE SUR UN BLOC (clic droit)
    // ------------------------------------------
    // Entree "Aide sur ce bloc" dans le menu contextuel de chaque bloc posé
    // dans l'espace de travail : ouvre une fenetre (#voile-aide, index.html)
    // avec le texte d'aide du bloc et le code MicroPython qu'il genere.
    //
    // Le texte vient, par ordre de priorite : de AIDE_BLOCS (explication
    // redigee, plus longue qu'une infobulle), puis de l'infobulle du bloc
    // (setTooltip, y compris celles des blocs natifs de Blockly), sinon d'un
    // message disant qu'aucune aide n'est redigee. Pour ajouter une aide :
    // une ligne dans AIDE_BLOCS, avec l'identifiant technique du bloc.
    const AIDE_BLOCS = {
        reset_chrono: "Mémorise l'instant présent comme point de départ du chronomètre. " +
            "Il n'existe qu'un seul chronomètre dans le programme : un nouveau « remettre le chronomètre à 0 » " +
            "remplace le précédent.",
        valeur_chrono: "Temps écoulé depuis le dernier « remettre le chronomètre à 0 », en secondes ou en " +
            "millisecondes. Si ce bloc n'a jamais été posé, le temps est compté depuis le démarrage de la carte.",
        attendre_jusqua: "Bloque le programme tant que la condition n'est pas vraie. Dans « Au démarrage », le " +
            "programme attend vraiment, simulateur compris. Dans « Répéter indéfiniment », le simulateur laisse " +
            "passer le tour tant que la condition est fausse et réessaie au tour suivant.",
        nombre_clics_bouton: "Nombre total de clics sur le bouton depuis le démarrage. Le compteur est cumulatif : " +
            "il ne se remet jamais à 0 tout seul, ce qui permet de tester « = 10 » même si les clics sont espacés.",
        lorsque_broche: "Exécute les blocs quand la broche P0, P1 ou P2 est touchée (ou relâchée). Un seul doigt " +
            "suffit : le mode tactile capacitif de la carte V2 est activé automatiquement.",
        broche_est_pressee: "Vrai tant que la broche P0, P1 ou P2 est touchée. Un seul doigt suffit : le mode " +
            "tactile capacitif de la carte V2 est activé automatiquement.",
        grove_lcd_alimenter: "Masque ou affiche les caractères de l'écran LCD. Le rétroéclairage de cet écran " +
            "monochrome est allumé en permanence et ne se commande pas.",

        // ---- Temps ----
        attendre_temps: "Met le programme en pause pendant la durée choisie, en secondes ou en millisecondes. " +
            "Rien d'autre ne s'exécute pendant ce temps.",
        repeter_toutes_les: "Répète sans fin les blocs placés à l'intérieur, en faisant une pause de la durée " +
            "indiquée (heures, minutes, secondes, millisecondes) après chaque passage.",

        // ---- Affichage ----
        afficher_valeur: "Affiche une valeur (texte ou nombre) sur la matrice de LED 5×5. Un texte de plusieurs " +
            "caractères est montré caractère par caractère ; pour le faire défiler, utiliser « faire défiler ».",
        ia_lorsque_reconnu: "Exécute les blocs quand l'IA (caméra ou micro, panneau IA) passe à la classe indiquée. " +
            "« vision » : objets, gestes, positions ; « son » : sons et mots. " +
            "Choisissez la classe dans la liste (classes du panneau IA : modèle chargé ou apprentissage immédiat), ou " +
            "« ✎ autre nom… » pour un modèle pas encore chargé ; accents et majuscules sont sans importance. " +
            "Le bloc ne se redéclenche pas tant que la classe reste la même ; il repart quand l'IA a reconnu autre chose " +
            "(ou plus rien, confiance sous le seuil) entre-temps. Marche dans le simulateur et sur la vraie carte.",
        ia_classe_est: "Vrai tant que la dernière classe reconnue par l'IA est celle indiquée. À poser dans un « si » " +
            "d'une boucle. Se remet à faux quand la confiance passe sous le seuil du panneau IA.",
        ia_derniere_classe: "Nom de la dernière classe reconnue, sans accents ni majuscules (« Chat noir » devient " +
            "« chat_noir »), ou un texte vide si rien n'est reconnu.",
        ia_confiance: "Certitude de l'IA pour la dernière classe reconnue, de 0 à 100 (en %). Elle est mise à jour " +
            "quand elle varie nettement, pas à chaque image.",
        ia_qr_lorsque_lu: "Exécute les blocs à chaque nouveau QR code ou code-barres lu par la caméra du PC (panneau IA, " +
            "colonne « QR codes », bouton « Lire les codes »). Le texte lu est donné par « texte du dernier code QR lu ». " +
            "Le même code montré en continu ne redéclenche pas le bloc ; il repart quand le code a disparu puis réapparu.",
        ia_qr_visible: "Vrai tant que la caméra voit un QR code ou un code-barres (il redevient faux moins d'une seconde " +
            "après que le code a disparu).",
        ia_qr_texte: "Texte du dernier QR code ou code-barres lu, sans accents (« Élève » devient « Eleve »), " +
            "60 caractères au plus. Il reste disponible après la disparition du code. Texte vide si aucun code n'a été lu.",
        afficher_console: "Écrit une valeur (texte ou nombre) dans la console, une ligne à chaque fois. Dans le " +
            "simulateur, elle apparaît dans la console (barre du bas, bouton « Console ») ; sur la vraie carte, elle part par le " +
            "câble USB et s'affiche après « Connecter » dans la console (Chrome ou Edge).",
        faire_defiler: "Fait défiler un texte ou un nombre de droite à gauche sur la matrice de LED 5×5.",
        afficher_icone: "Affiche une icône prédéfinie (cœur, visage heureux, triste, fantôme) sur la matrice de LED.",
        afficher_image_matrice: "Dessine une image : cochez les cases de la grille 5×5 pour choisir les LED à allumer.",
        effacer_ecran: "Éteint toutes les LED de la matrice 5×5.",

        // ---- Entrées / événements ----
        lorsque_bouton: "Exécute les blocs à l'intérieur quand le bouton A, B ou A+B est pressé. Le bouton est " +
            "surveillé à chaque tour de la boucle principale du programme (ajoutée automatiquement s'il n'y en a pas).",
        lorsque_geste: "Exécute les blocs à l'intérieur quand la carte est secouée, ou quand son logo est tourné " +
            "vers le haut ou vers le bas. Le geste n'est pris en compte qu'une fois par mouvement.",
        lorsque_son_detecte: "Exécute les blocs à l'intérieur quand le micro détecte un son bruyant ou faible " +
            "(le seuil se règle avec « définit le seuil du son »). Carte V2 uniquement.",
        lorsque_logo: "Exécute les blocs à l'intérieur quand le logo tactile de la carte est touché ou relâché " +
            "(carte V2 uniquement).",
        si_bouton_appuye: "Exécute les blocs à l'intérieur si le bouton choisi est enfoncé au moment où le " +
            "programme passe ici. À placer dans une boucle pour surveiller le bouton en continu.",
        si_logo_touche: "Exécute les blocs à l'intérieur si le logo tactile est touché au moment où le programme " +
            "passe ici (carte V2 uniquement).",
        si_secoue_alors: "Exécute les blocs à l'intérieur si la carte vient d'être secouée. La secousse n'est " +
            "comptée qu'une seule fois.",
        bouton_est_appuye: "Vrai tant que le bouton choisi (A, B ou A+B) est enfoncé, faux sinon. À utiliser dans " +
            "un bloc « si » ou « attendre jusqu'à ».",
        geste_est_actif: "Vrai tant que le geste choisi (secouer, logo vers le haut, logo vers le bas) est en cours, " +
            "faux sinon. Contrairement à « si secoué », il reste vrai pendant toute la durée du geste.",
        logo_est_touche: "Vrai tant que le logo tactile est touché, faux sinon (carte V2 uniquement).",
        reinitialiser_microbit: "Redémarre la carte : le programme recommence depuis le début, comme après un " +
            "appui sur le bouton reset.",

        // ---- Capteurs ----
        capteur_acceleration: "Accélération mesurée selon l'axe x, y ou z, en milli-g (mg), ou force totale. " +
            "Au repos, la pesanteur donne environ 1000 mg sur l'axe vertical.",
        capteur_luminosite: "Niveau de lumière ambiante, de 0 (obscurité) à 255 (très lumineux). La mesure est " +
            "faite par la matrice de LED.",
        capteur_boussole_direction: "Direction de la boussole en degrés (0 = nord). La boussole doit avoir été " +
            "calibrée : voir « calibrer la boussole ».",
        capteur_boussole_force: "Champ magnétique mesuré selon l'axe x, y ou z, ou force totale.",
        capteur_boussole_calibrer: "Lance la calibration de la boussole : la carte demande d'incliner dans tous " +
            "les sens pour remplir un cercle de LED. À faire avant de lire la direction.",
        capteur_temperature: "Température mesurée par la carte, en °C. C'est la température de la puce, un peu " +
            "plus élevée que celle de l'air ambiant.",
        capteur_rotation: "Inclinaison de la carte en degrés : « pitch » vers l'avant ou l'arrière, « roll » vers " +
            "la gauche ou la droite.",
        temps_execution: "Temps écoulé depuis le démarrage de la carte, en millisecondes ou en microsecondes.",
        gamme_accelerometre: "Règle l'étendue de mesure de l'accéléromètre (1g, 2g, 4g ou 8g). Une gamme plus " +
            "large mesure des chocs plus forts, mais avec moins de précision.",
        micro_intensite_son: "Niveau sonore capté par le micro de la carte, de 0 (silence) à 255 (très fort). " +
            "Carte V2 uniquement.",
        micro_definir_seuil: "Règle le niveau à partir duquel un son est considéré comme « bruyant » ou « faible » " +
            "pour le bloc « lorsque le son est détecté ». Carte V2 uniquement.",

        // ---- Audio et radio ----
        audio_jouer: "Joue un son intégré (rire, joyeux, bonjour, triste, scintillement) sur le haut-parleur " +
            "de la carte V2.",
        audio_arreter: "Arrête le son en cours de lecture.",
        music_jouer_melodie: "Joue une mélodie prédéfinie sur le haut-parleur de la carte.",
        speech_dire: "Prononce un texte avec la synthèse vocale de la carte, en anglais. La vitesse et la hauteur " +
            "de la voix se règlent de 0 à 255.",
        radio_activer: "Allume la radio de la carte, nécessaire avant d'envoyer ou de recevoir un message.",
        radio_envoyer_texte: "Envoie un texte par radio. Seules les cartes réglées sur le même groupe radio le " +
            "reçoivent.",
        radio_envoyer_nombre: "Envoie un nombre par radio. Seules les cartes réglées sur le même groupe radio " +
            "le reçoivent.",

        // ---- Boucles et maths ----
        boucle_infinie: "Répète sans fin les blocs placés à l'intérieur. C'est la boucle principale du programme : " +
            "la carte ne s'arrête jamais de l'exécuter. Ajoutez un bloc « attendre » pour la ralentir.",
        math_min_max: "Renvoie la plus petite ou la plus grande de deux valeurs.",
        math_absolue: "Renvoie la valeur absolue d'un nombre, c'est-à-dire sans son signe (−5 devient 5).",
        math_racine: "Renvoie la racine carrée d'un nombre.",
        math_arrondi_custom: "Arrondit un nombre à l'entier le plus proche, au-dessus (supérieur) ou en dessous " +
            "(inférieur).",
        math_convert: "Convertit un angle de degrés en radians, ou de radians en degrés.",
        math_map: "Projette une valeur d'une plage vers une autre. Exemple : une valeur de 0 à 1023 devient une " +
            "valeur de 0 à 4. Utile pour adapter la mesure d'un capteur.",

        // ---- Grove : ruban, afficheur, capteurs ----
        grove_ruban_couleur: "Allume tout le ruban de LED RGB avec la couleur choisie.",
        grove_ruban_effacer: "Éteint toutes les LED du ruban.",
        grove_ruban_couleur_index: "Allume une seule LED du ruban avec la couleur choisie. Le numéro des LED " +
            "commence à 0.",
        grove_ruban_effacer_index: "Éteint une seule LED du ruban. Le numéro des LED commence à 0.",
        grove_ruban_perso: "Allume tout le ruban avec une couleur composée de rouge, vert et bleu, chacun de 0 à 255.",
        grove_ruban_perso_index: "Allume une seule LED du ruban avec une couleur composée de rouge, vert et bleu, " +
            "chacun de 0 à 255. Le numéro des LED commence à 0.",
        grove_4d_nombre: "Affiche un nombre sur l'afficheur à 4 chiffres.",
        grove_4d_chiffre: "Affiche un seul chiffre à la position choisie de l'afficheur à 4 chiffres " +
            "(positions de 0 à 3, de gauche à droite).",
        grove_4d_points: "Allume ou éteint les deux points au milieu de l'afficheur à 4 chiffres (séparateur " +
            "d'une heure, par exemple).",
        grove_4d_effacer: "Éteint tous les chiffres de l'afficheur à 4 chiffres.",
        grove_ultrason_cm: "Distance mesurée par le capteur à ultrasons branché sur la broche choisie, en centimètres.",
        grove_ultrason_pouces: "Distance mesurée par le capteur à ultrasons branché sur la broche choisie, en pouces.",
        grove_joystick_direction: "Vrai si le joystick est poussé dans la direction choisie (ou au centre). " +
            "Choisir les broches sur lesquelles sont branchés ses axes X et Y.",
        grove_barre_niveau: "Allume les LED de la barre Grove (10 LED : 1 rouge, 1 orange, 8 vertes) de la première jusqu'au " +
            "niveau indiqué, de 0 (toutes éteintes) à 10 (toutes allumées). Pratique pour montrer une mesure, par exemple la " +
            "lumière divisée par 100. Choisir le port Grove où la barre est branchée (deux broches).",
        grove_barre_led: "Allume ou éteint une seule LED de la barre Grove, numérotée de 1 à 10, sans toucher aux autres.",
        grove_bmp280: "Mesure du capteur Grove BMP280 (port I²C) : pression de l'air en hectopascals (environ 1013 hPa au " +
            "niveau de la mer), température en °C, ou altitude estimée en mètres d'après la pression. Dans le simulateur : " +
            "curseurs « Pression » et « Température » du panneau Grove.",
        grove_sgp30: "Mesure du capteur de qualité de l'air Grove SGP30 (port I²C) : eCO₂ en ppm (équivalent dioxyde de carbone) " +
            "ou COV totaux en ppb (composés organiques volatils : solvants, parfums…). Les 15 premières secondes, il rend 400 ppm " +
            "et 0 ppb pendant qu'il chauffe. Dans le simulateur : curseurs « CO₂ » et « COV totaux ».",
        grove_rtc_regler: "Met l'horloge temps réel Grove (DS1307 ou DS3231, port I²C) à la date et à l'heure indiquées. À faire " +
            "une seule fois, puis retirer le bloc : la pile du module garde l'heure, même carte débranchée. Dans le simulateur, " +
            "l'horloge suit l'heure de l'ordinateur, décalée de ce que le programme a réglé.",
        grove_rtc_lire: "Lit l'heure (0 à 23), la minute, la seconde, le jour, le mois ou l'année de l'horloge temps réel Grove.",
        grove_rtc_texte: "L'heure de l'horloge temps réel sous forme de texte « hh:mm:ss », prête à afficher (écran LCD, OLED…).",
        grove_pca_init: "Prépare le pilote 16 servos PCA9685 (port I²C). Facultatif avec le module Grove (adresse 0x7F) ; " +
            "indispensable, avec l'adresse 0x40, pour la plupart des autres cartes PCA9685.",
        grove_pca_angle: "Place le servomoteur branché sur la voie indiquée du pilote 16 servos (0 à 15) à l'angle voulu (0 à 180°). " +
            "Dans le simulateur, il apparaît dans la zone « Servomoteurs » sous le nom S0 à S15.",
        grove_pca_continu: "Fait tourner le servomoteur à rotation continue branché sur la voie indiquée (0 à 15), de -100 à 100 % ; " +
            "0 l'arrête (au réglage près du servo).",
        dfr_servo: "Place le servomoteur branché sur l'une des 8 sorties servo (S1 à S8) de la carte moteurs DFRobot DFR0548 " +
            "à l'angle voulu, de 0 à 180°.",
        dfr_moteur: "Fait tourner le moteur à courant continu branché sur l'une des 4 sorties moteur (M1 à M4) de la carte " +
            "DFR0548, dans le sens horaire ou antihoraire, à une vitesse de 0 à 255. Il tourne jusqu'à un autre ordre.",
        dfr_moteur_arreter: "Arrête un moteur à courant continu de la carte DFR0548, ou les quatre à la fois.",
        motorbit_moteur: "Fait tourner le moteur à courant continu branché sur M1 ou M2 de la carte ELECFREAKS Motor:bit, dans le " +
            "sens horaire ou antihoraire, à une vitesse de 0 à 255. Il tourne jusqu'à un autre ordre. Les broches P1, P2, P8 et P12 " +
            "pilotent les moteurs : n'y branche pas d'autre module.",
        motorbit_moteur_arreter: "Arrête un moteur de la carte Motor:bit (M1 ou M2), ou les deux à la fois.",
        dfr_pas_a_pas: "Fait tourner un moteur pas à pas (28BYJ-48 ou 42BYGH) branché sur deux sorties moteur de la carte DFR0548 " +
            "(M1-M2 ou M3-M4), d'un nombre de degrés ou de tours, puis l'arrête. Le programme attend la fin du mouvement.",
        grove_bouton_appuye: "Vrai tant que le bouton poussoir Grove branché sur la broche choisie est enfoncé. À poser " +
            "dans un « si » d'une boucle. Dans le simulateur : bouton rouge « Appuyer » du panneau Grove (maintenir) ou case " +
            "« maintenu enfoncé ».",
        grove_bouton_lorsque: "Exécute les blocs une fois à chaque appui sur le bouton poussoir Grove (pas en continu " +
            "tant qu'il reste enfoncé). Marche dans le simulateur et sur la vraie carte.",
        grove_lumiere: "Lumière reçue par le capteur de lumière Grove, branché sur une entrée analogique (P0, P1 ou P2) : " +
            "valeur de 0 à 1023 ou pourcentage. Plus il y a de lumière, plus la valeur est grande. Dans le simulateur, " +
            "curseur « Lumière » du panneau Grove.",
        grove_pir: "Vrai quand le détecteur de mouvement PIR Grove voit bouger une personne ou un animal (il reste vrai " +
            "quelques secondes après le mouvement). Dans le simulateur, case « mouvement détecté » du panneau Grove.",
        grove_buzzer_etat: "Fait sonner le buzzer Grove (marche) ou le fait taire (arrêt). Il sonne tant qu'on ne l'arrête " +
            "pas. Dans le simulateur, une pastille orange vibre et un bip retentit.",
        grove_buzzer_bip: "Fait sonner le buzzer Grove pendant la durée indiquée en millisecondes (1000 ms = 1 s), puis " +
            "l'arrête. Le programme attend la fin du bip avant de continuer.",
        grove_relais: "Commande le relais Grove : fermé, l'appareil branché sur le relais (lampe, moteur, pompe…) fonctionne ; " +
            "ouvert, il s'arrête. Le relais permet de commander un circuit séparé de la carte. Dans le simulateur, le " +
            "contact dessiné se ferme ou s'ouvre.",
        grove_oled_init: "Prépare l'écran OLED 0,96\" (Grove, branché sur un port I²C). Facultatif : l'écran s'initialise " +
            "à la première utilisation.",
        grove_oled_texte: "Écrit un texte (ou un nombre) sur l'écran OLED, à partir de la colonne (0 à 20) et de la ligne " +
            "(0 à 7) indiquées : 21 caractères sur 8 lignes. Les accents sont remplacés par la lettre simple (é devient e).",
        grove_oled_effacer: "Efface tout l'écran OLED.",
        grove_potentiometre: "Position du bouton du potentiomètre Grove (Rotary Angle Sensor), branché sur une entrée " +
            "analogique (P0, P1 ou P2). Au choix : valeur brute de 0 à 1023, angle de 0 à 300° (la course du bouton) ou " +
            "pourcentage de 0 à 100 %. Dans le simulateur, tournez le bouton avec le curseur « Potentiomètre » du panneau Grove.",
        grove_gestes_est: "Vrai si le capteur de gestes vient de détecter le geste choisi (haut, bas, gauche, " +
            "droite, avant, arrière, rotation ou vague).",
        grove_th_mesure: "Mesure du capteur de température et d'humidité : température en °C ou °F, ou humidité en %.",
        grove_lcd_effacer: "Efface tout le texte de l'écran LCD 16x2.",
        grove_lcdrgb_effacer: "Efface tout le texte de l'écran LCD RGB. Le rétroéclairage ne change pas.",
        grove_moteur_action: "Commande le pilote de moteurs : arrêter le moteur du canal choisi, le freiner, ou " +
            "effacer son défaut après une surcharge.",
        grove_scd30_lire: "Mesure du capteur SCD30 : CO₂ en ppm, température en °C ou humidité en %.",
        grove_scd41_lire: "Mesure du capteur SCD41 : CO₂ en ppm, température en °C ou humidité en %.",
    };

    // ------------------------------------------
    // PROGRAMMES D'EXEMPLE
    // ------------------------------------------
    // Un petit programme par bloc (ou par famille de blocs), montre dans la
    // fenetre d'aide avec son code MicroPython, et inserable d'un clic dans
    // l'espace de travail. Chaque exemple est decrit en JSON de serialisation
    // Blockly, via les petites fonctions ex* ci-dessous. Pour en ajouter un :
    //   exemple(['id_du_bloc'], 'Titre', 'Explication.', [ ...blocs racines... ]);
    // (une racine = exStart / exLoop / exWhen, jamais un bloc isole : un bloc
    // pose seul est grise et n'est pas execute).
    const EXEMPLES_BLOCS = {};
    function exemple(ids, titre, texte, blocs) {
        const ex = { titre, texte, blocs };
        ids.forEach(id => { EXEMPLES_BLOCS[id] = ex; });
    }
    const exB = (type, champs, entrees) => {
        const b = { type };
        if (champs) b.fields = champs;
        if (entrees) b.inputs = entrees;
        return b;
    };
    const exSuite = (...bs) => {
        for (let i = bs.length - 2; i >= 0; i--) bs[i].next = { block: bs[i + 1] };
        return bs[0];
    };
    const exDans = (...bs) => ({ block: exSuite(...bs) });
    const exN = n => ({ block: exB('math_number', { NUM: n }) });
    const exT = s => ({ block: exB('text', { TEXT: s }) });
    const exV = b => ({ block: b });
    const exStart = (...bs) => exB('au_demarrage', null, { DO: exDans(...bs) });
    const exLoop = (...bs) => exB('boucle_infinie', null, { DO: exDans(...bs) });
    const exWhen = (type, champs, ...bs) => exB(type, champs, { DO: exDans(...bs) });
    const exWait = n => exB('attendre_temps', { UNITE: 's' }, { TEMPS: exN(n) });
    const exIcone = i => exB('afficher_icone', { ICONE: i });
    const exClear = () => exB('effacer_ecran');
    const exAff = b => exB('afficher_valeur', null, { VALEUR: exV(b) });
    const exSi = (cond, ...bs) => exB('controls_if', null, { IF0: exV(cond), DO0: exDans(...bs) });
    const exComp = (op, a, b) => exB('logic_compare', { OP: op }, { A: exV(a), B: exV(b) });
    const exMesure = bloc => [exLoop(exAff(bloc), exWait(1))];
    const exTexteMesure = "Affiche la valeur mesurée toutes les secondes sur la matrice de LED.";

    // ---- Temps, affichage ----
    exemple(['attendre_temps', 'afficher_icone', 'effacer_ecran', 'boucle_infinie'], 'Cœur qui clignote',
        "Le cœur reste affiché une seconde, puis s'efface une seconde, sans fin.",
        [exLoop(exIcone('HEART'), exWait(1), exClear(), exWait(1))]);
    exemple(['repeter_toutes_les'], 'Température toutes les 5 secondes',
        "Affiche la température de la carte, puis recommence 5 secondes plus tard.",
        [exStart(exB('repeter_toutes_les', { H: 0, M: 0, S: 5, MS: 0 },
            { DO: exDans(exAff(exB('capteur_temperature'))) }))]);
    exemple(['afficher_valeur'], 'Dé électronique',
        "Affiche un nombre au hasard entre 1 et 6, puis un autre 2 secondes plus tard.",
        [exLoop(exAff(exB('math_random_int', null, { FROM: exN(1), TO: exN(6) })), exWait(2))]);
    exemple(['afficher_console'], 'Suivre la température dans la console',
        "Écrit « Démarrage » une fois, puis la température de la carte chaque seconde dans la console.",
        [exStart(exB('afficher_console', null, { VALEUR: exT('Démarrage') })),
         exLoop(exB('afficher_console', null, { VALEUR: exV(exB('capteur_temperature')) }), exWait(1))]);
    exemple(['faire_defiler'], 'Message défilant', "Fait défiler « Bonjour ! » une fois au démarrage.",
        [exStart(exB('faire_defiler', null, { VALEUR: exT('Bonjour !') }))]);
    const LED_SOURIRE = ['1_1', '3_1', '0_3', '1_4', '2_4', '3_4', '4_3'];
    const champsImage = {};
    for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) {
        champsImage['LED_' + x + '_' + y] = LED_SOURIRE.includes(x + '_' + y) ? 'TRUE' : 'FALSE';
    }
    exemple(['afficher_image_matrice'], 'Un sourire dessiné',
        "Affiche une image dessinée case par case : ici, un sourire.",
        [exStart(exB('afficher_image_matrice', champsImage))]);

    // ---- Boutons, gestes, logo, broches, son ----
    exemple(['lorsque_bouton'], 'Bouton A : sourire, bouton B : effacer',
        "Chaque bouton a son propre bloc « lorsque » : A affiche un visage heureux, B efface l'écran.",
        [exWhen('lorsque_bouton', { BOUTON: 'a' }, exIcone('HAPPY')),
         exWhen('lorsque_bouton', { BOUTON: 'b' }, exClear())]);
    exemple(['si_bouton_appuye'], 'Surveiller deux boutons',
        "À chaque tour de boucle, le programme regarde si A ou B est enfoncé.",
        [exLoop(exB('si_bouton_appuye', { BOUTON: 'a' }, { DO: exDans(exIcone('HAPPY')) }),
                exB('si_bouton_appuye', { BOUTON: 'b' }, { DO: exDans(exClear()) }))]);
    exemple(['bouton_est_appuye'], 'Condition sur un bouton',
        "Dans un bloc « si », le bouton A affiche un cœur et le bouton B efface l'écran.",
        [exLoop(exSi(exB('bouton_est_appuye', { BOUTON: 'a' }), exIcone('HEART')),
                exSi(exB('bouton_est_appuye', { BOUTON: 'b' }), exClear()))]);
    exemple(['lorsque_geste'], 'Secouer la carte',
        "Quand on secoue la carte, un fantôme apparaît une seconde.",
        [exWhen('lorsque_geste', { GESTE: 'shake' }, exIcone('GHOST'), exWait(1), exClear())]);
    exemple(['si_secoue_alors'], 'Secousse dans une boucle',
        "À chaque secousse, un fantôme apparaît une seconde.",
        [exLoop(exB('si_secoue_alors', null, { DO: exDans(exIcone('GHOST'), exWait(1), exClear()) }))]);
    exemple(['geste_est_actif'], 'Triste pendant la secousse',
        "Un visage triste s'affiche tant que la carte est secouée.",
        [exLoop(exSi(exB('geste_est_actif', { GESTE: 'shake' }), exIcone('SAD')))]);
    exemple(['lorsque_logo'], 'Toucher le logo', "Touchez le logo : un cœur s'affiche.",
        [exWhen('lorsque_logo', { ACTION: 'touched' }, exIcone('HEART'))]);
    exemple(['si_logo_touche'], 'Logo dans une boucle', "Un cœur s'affiche quand le logo est touché.",
        [exLoop(exB('si_logo_touche', null, { DO: exDans(exIcone('HEART')) }))]);
    exemple(['logo_est_touche'], 'Condition sur le logo', "Un cœur s'affiche tant que le logo est touché.",
        [exLoop(exSi(exB('logo_est_touche'), exIcone('HEART')))]);
    exemple(['lorsque_broche'], 'Toucher la broche P0',
        "Un seul doigt sur P0 suffit : un visage heureux s'affiche une seconde.",
        [exWhen('lorsque_broche', { BROCHE: 'pin0', ETAT: 'touched' }, exIcone('HAPPY'), exWait(1), exClear())]);
    exemple(['broche_est_pressee'], 'Condition sur une broche',
        "Un visage heureux s'affiche tant que P0 est touchée.",
        [exLoop(exSi(exB('broche_est_pressee', { BROCHE: 'pin0' }), exIcone('HAPPY')))]);
    exemple(['lorsque_son_detecte'], 'Réagir à un bruit',
        "Un bruit fort fait apparaître un visage triste une seconde.",
        [exWhen('lorsque_son_detecte', { SON: 'LOUD' }, exIcone('SAD'), exWait(1), exClear())]);
    exemple(['micro_definir_seuil'], 'Régler le seuil du bruit',
        "Seuil à 200 : seuls les bruits assez forts déclenchent le visage triste.",
        [exStart(exB('micro_definir_seuil', { SON: 'LOUD' }, { SEUIL: exN(200) })),
         exWhen('lorsque_son_detecte', { SON: 'LOUD' }, exIcone('SAD'), exWait(1), exClear())]);
    // ---- IA (modèle Teachable Machine chargé dans le panneau 🧠) ----
    exemple(['ia_lorsque_reconnu'], 'Reconnaître un chat',
        "Quand la caméra reconnaît la classe « Chat », un cœur s'affiche ; quand le micro reconnaît « Clap », un fantôme.",
        [exWhen('ia_lorsque_reconnu', { TYPE: 'vision', CLASSE: 'Chat' }, exIcone('HEART')),
         exWhen('ia_lorsque_reconnu', { TYPE: 'son', CLASSE: 'Clap' }, exIcone('GHOST'))]);
    exemple(['ia_classe_est'], 'Condition sur la classe reconnue',
        "Tant que la caméra reconnaît « Chat », un cœur est affiché ; sinon l'écran est vide.",
        [exLoop(exSi(exB('ia_classe_est', { TYPE: 'vision', CLASSE: 'Chat' }), exIcone('HEART')),
                exSi(exB('logic_negate', null, { BOOL: exV(exB('ia_classe_est', { TYPE: 'vision', CLASSE: 'Chat' })) }), exClear()))]);
    exemple(['ia_derniere_classe'], 'Afficher la classe reconnue dans la console',
        "Écrit dans la console le nom de la dernière classe reconnue par la caméra, chaque seconde.",
        [exLoop(exB('afficher_console', null, { VALEUR: exV(exB('ia_derniere_classe', { TYPE: 'vision' })) }), exWait(1))]);
    exemple(['ia_confiance'], 'Afficher la confiance',
        "Écrit dans la console la certitude de l'IA (0 à 100) pour le son reconnu, chaque seconde.",
        [exLoop(exB('afficher_console', null, { VALEUR: exV(exB('ia_confiance', { TYPE: 'son' })) }), exWait(1))]);
    exemple(['reinitialiser_microbit'], 'Redémarrer avec le bouton A',
        "Un cœur s'affiche à chaque démarrage ; le bouton A redémarre la carte.",
        [exStart(exIcone('HEART')), exWhen('lorsque_bouton', { BOUTON: 'a' }, exB('reinitialiser_microbit'))]);

    // ---- Capteurs ----
    [['capteur_acceleration', exB('capteur_acceleration', { AXIS: 'x' }), "Accélération sur l'axe x"],
     ['capteur_luminosite', exB('capteur_luminosite'), 'Niveau de lumière'],
     ['capteur_boussole_direction', exB('capteur_boussole_direction'), 'Direction de la boussole'],
     ['capteur_boussole_force', exB('capteur_boussole_force', { AXIS: 'x' }), 'Champ magnétique sur x'],
     ['capteur_temperature', exB('capteur_temperature'), 'Température'],
     ['capteur_rotation', exB('capteur_rotation', { AXIS: 'pitch' }), 'Inclinaison avant/arrière'],
     ['temps_execution', exB('temps_execution', { UNITE: 'ms' }), "Temps depuis le démarrage"],
     ['micro_intensite_son', exB('micro_intensite_son'), 'Niveau sonore'],
    ].forEach(([id, bloc, titre]) => exemple([id], titre, exTexteMesure, exMesure(bloc)));
    exemple(['capteur_boussole_calibrer'], 'Calibrer puis lire la boussole',
        "La calibration se fait une fois au démarrage, puis la direction est affichée chaque seconde.",
        [exStart(exB('capteur_boussole_calibrer')),
         exLoop(exAff(exB('capteur_boussole_direction')), exWait(1))]);
    exemple(['gamme_accelerometre'], 'Gamme 8g pour des chocs forts',
        "Règle l'accéléromètre sur 8g, puis affiche la force mesurée chaque seconde.",
        [exStart(exB('gamme_accelerometre', { GAMME: '8' })),
         exLoop(exAff(exB('capteur_acceleration', { AXIS: 'strength' })), exWait(1))]);
    exemple(['reset_chrono', 'valeur_chrono'], 'Chronomètre',
        "Le chronomètre démarre à 0 au lancement, puis le temps écoulé (en secondes) est affiché chaque seconde.",
        [exStart(exB('reset_chrono')), exLoop(exAff(exB('valeur_chrono', { UNITE: 's' })), exWait(1))]);
    exemple(['attendre_jusqua'], 'Attendre le bouton A pour démarrer',
        "Un visage triste reste affiché tant qu'on n'appuie pas sur A ; ensuite un cœur apparaît.",
        [exStart(exIcone('SAD'), exB('attendre_jusqua', null, { CONDITION: exV(exB('bouton_est_appuye', { BOUTON: 'a' })) }),
                 exIcone('HEART'))]);
    exemple(['nombre_clics_bouton'], 'Au 10e clic sur B',
        "Un cœur s'affiche quand le bouton B a été pressé 10 fois en tout.",
        [exLoop(exSi(exComp('EQ', exB('nombre_clics_bouton', { BOUTON: 'b' }), exB('math_number', { NUM: 10 })),
                     exIcone('HEART')))]);

    // ---- Audio, radio ----
    exemple(['audio_jouer', 'audio_arreter'], 'Son avec les boutons',
        "A joue un rire ; B arrête le son.",
        [exWhen('lorsque_bouton', { BOUTON: 'a' }, exB('audio_jouer', { SON: 'GIGGLE' })),
         exWhen('lorsque_bouton', { BOUTON: 'b' }, exB('audio_arreter'))]);
    exemple(['music_jouer_melodie'], 'Mélodie sur le bouton A', "Le bouton A joue une mélodie.",
        [exWhen('lorsque_bouton', { BOUTON: 'a' }, exB('music_jouer_melodie', { MELODY: 'ENTERTAINER' }))]);
    exemple(['speech_dire'], 'La carte parle', "La carte dit « Hello » au démarrage (en anglais).",
        [exStart(exB('speech_dire', { SPEED: 100, PITCH: 100 }, { TEXT: exT('Hello') }))]);
    exemple(['radio_activer', 'radio_envoyer_texte'], 'Envoyer un message radio',
        "La radio est allumée au démarrage ; le bouton A envoie « Salut » aux autres cartes du même groupe.",
        [exStart(exB('radio_activer')),
         exWhen('lorsque_bouton', { BOUTON: 'a' }, exB('radio_envoyer_texte', null, { MESSAGE: exT('Salut') }))]);
    exemple(['radio_envoyer_nombre'], 'Envoyer un nombre par radio',
        "Le bouton A envoie le nombre 5 aux autres cartes du même groupe.",
        [exStart(exB('radio_activer')),
         exWhen('lorsque_bouton', { BOUTON: 'a' }, exB('radio_envoyer_nombre', null, { NOMBRE: exN(5) }))]);

    // ---- Maths ----
    const exCalcul = (id, bloc, titre) => exemple([id], titre, "Affiche le résultat du calcul au démarrage.", [exStart(exAff(bloc))]);
    exCalcul('math_min_max', exB('math_min_max', { OP: 'max' }, { A: exN(3), B: exN(7) }), 'Le plus grand de 3 et 7');
    exCalcul('math_absolue', exB('math_absolue', null, { NUM: exN(-5) }), 'Valeur absolue de −5');
    exCalcul('math_racine', exB('math_racine', { OP: 'sqrt' }, { NUM: exN(16) }), 'Racine carrée de 16');
    exCalcul('math_arrondi_custom', exB('math_arrondi_custom', { OP: 'round' }, { NUM: exN(3.7) }), 'Arrondir 3,7');
    exCalcul('math_convert', exB('math_convert', { OP: 'radians' }, { NUM: exN(180) }), '180 degrés en radians');
    exemple(['math_map'], 'Lumière de 0-255 vers 0-4',
        "Convertit le niveau de lumière (0 à 255) en une valeur de 0 à 4.",
        [exLoop(exAff(exB('math_map', null, { VAL: exV(exB('capteur_luminosite')), FROMLOW: exN(0),
            FROMHIGH: exN(255), TOLOW: exN(0), TOHIGH: exN(4) })), exWait(1))]);

    // ---- Grove ----
    exemple(['grove_ruban_couleur', 'grove_ruban_effacer'], 'Ruban rouge puis éteint',
        "Tout le ruban s'allume en rouge deux secondes, puis s'éteint.",
        [exStart(exB('grove_ruban_couleur', { COULEUR: '0xFF0000' }), exWait(2), exB('grove_ruban_effacer'))]);
    exemple(['grove_ruban_couleur_index'], 'Deux LED de couleurs différentes',
        "La LED n° 0 s'allume en vert et la LED n° 1 en bleu.",
        [exStart(exB('grove_ruban_couleur_index', { COULEUR: '0x00FF00' }, { INDEX: exN(0) }),
                 exB('grove_ruban_couleur_index', { COULEUR: '0x0000FF' }, { INDEX: exN(1) }))]);
    exemple(['grove_ruban_effacer_index'], 'Éteindre une seule LED',
        "Tout le ruban s'allume en rouge, puis la LED n° 0 s'éteint deux secondes plus tard.",
        [exStart(exB('grove_ruban_couleur', { COULEUR: '0xFF0000' }), exWait(2),
                 exB('grove_ruban_effacer_index', null, { INDEX: exN(0) }))]);
    exemple(['grove_ruban_perso'], 'Une couleur orange', "Rouge 255, vert 128, bleu 0 : un orange.",
        [exStart(exB('grove_ruban_perso', null, { R: exN(255), V: exN(128), B: exN(0) }))]);
    exemple(['grove_ruban_perso_index'], 'Une LED en violet', "La LED n° 0 prend une couleur violette.",
        [exStart(exB('grove_ruban_perso_index', null, { INDEX: exN(0), R: exN(255), V: exN(0), B: exN(128) }))]);
    exemple(['grove_4d_nombre'], 'Afficher 1234', "Le nombre 1234 s'affiche sur l'afficheur à 4 chiffres.",
        [exStart(exB('grove_4d_nombre', null, { VALEUR: exN(1234) }))]);
    exemple(['grove_4d_chiffre'], 'Un chiffre à une position',
        "Le chiffre 7 s'affiche à la position 2 (les positions vont de 0 à 3).",
        [exStart(exB('grove_4d_chiffre', null, { VALEUR: exN(7), POSITION: exN(2) }))]);
    exemple(['grove_4d_points'], 'Heure avec deux points', "Affiche 1234 avec les deux points allumés (12:34).",
        [exStart(exB('grove_4d_nombre', null, { VALEUR: exN(1234) }), exB('grove_4d_points', { ETAT: 'True' }))]);
    exemple(['grove_4d_effacer'], 'Afficher puis effacer', "Le nombre reste affiché deux secondes, puis disparaît.",
        [exStart(exB('grove_4d_nombre', null, { VALEUR: exN(1234) }), exWait(2), exB('grove_4d_effacer'))]);
    exemple(['grove_ultrason_cm'], 'Distance en centimètres',
        "Affiche chaque seconde la distance mesurée par le capteur branché sur P0.",
        exMesure(exB('grove_ultrason_cm', { BROCHE: 'pin0' })));
    exemple(['grove_ultrason_pouces'], 'Distance en pouces',
        "Affiche chaque seconde la distance mesurée par le capteur branché sur P0.",
        exMesure(exB('grove_ultrason_pouces', { BROCHE: 'pin0' })));
    exemple(['grove_joystick_direction'], 'Joystick vers le haut',
        "Un visage heureux s'affiche quand le joystick (axes sur P0 et P1) est poussé vers le haut.",
        [exLoop(exSi(exB('grove_joystick_direction', { X: 'pin0', Y: 'pin1', DIRECTION: 'haut' }), exIcone('HAPPY')))]);
    exemple(['grove_gestes_est'], 'Geste vers le haut',
        "Un visage heureux s'affiche quand le capteur détecte un geste vers le haut.",
        [exLoop(exSi(exB('grove_gestes_est', { GESTE: 'haut' }), exIcone('HAPPY')))]);
    exemple(['grove_th_mesure'], 'Température du capteur', exTexteMesure,
        exMesure(exB('grove_th_mesure', { GRANDEUR: 'c' })));
    exemple(['grove_scd30_lire'], 'CO₂ du SCD30', exTexteMesure, exMesure(exB('grove_scd30_lire', { GRANDEUR: 'co2' })));
    exemple(['grove_scd41_lire'], 'CO₂ du SCD41', exTexteMesure, exMesure(exB('grove_scd41_lire', { GRANDEUR: 'co2' })));
    exemple(['grove_lcd_init', 'grove_lcd_texte', 'grove_lcd_effacer', 'grove_lcd_alimenter'], 'Bonjour sur l\'écran LCD',
        "Affiche « Bonjour » en haut à gauche pendant deux secondes, puis efface l'écran.",
        [exStart(exB('grove_lcd_texte', null, { TEXTE: exT('Bonjour'), X: exN(0), Y: exN(0) }), exWait(2),
                 exB('grove_lcd_effacer'))]);
    exemple(['grove_lcdrgb_init', 'grove_lcdrgb_texte', 'grove_lcdrgb_effacer', 'grove_lcdrgb_alimenter',
             'grove_lcdrgb_fond_couleur', 'grove_lcdrgb_fond_rvb', 'grove_lcdrgb_retro'], 'Fond bleu puis éteint',
        "Le fond passe au bleu, « Bonjour » s'affiche, puis le rétroéclairage s'éteint deux secondes plus tard.",
        [exStart(exB('grove_lcdrgb_fond_couleur', { COULEUR: '0x0000FF' }),
                 exB('grove_lcdrgb_texte', null, { TEXTE: exT('Bonjour'), X: exN(0), Y: exN(0) }), exWait(2),
                 exB('grove_lcdrgb_retro', { ETAT: 'False' }))]);
    exemple(['grove_moteur_vitesse', 'grove_moteur_action'], 'Moteur 2 secondes',
        "Le moteur du canal 1 tourne à la vitesse 50 pendant deux secondes, puis s'arrête.",
        [exStart(exB('grove_moteur_vitesse', { CANAL: '1' }, { VITESSE: exN(50) }), exWait(2),
                 exB('grove_moteur_action', { ACTION: 'arret', CANAL: '1' }))]);

    // ---- Complements : blocs deja decrits par une infobulle (servos, radio avancee,
    // modules Grove secondaires) ----
    exemple(['au_demarrage'], 'Une fois au démarrage, puis en boucle',
        "« Au démarrage » s'exécute une seule fois ; ensuite la boucle tourne sans fin.",
        [exStart(exB('faire_defiler', null, { VALEUR: exT('Prêt') })), exLoop(exIcone('HAPPY'))]);

    exemple(['radio_groupe'], 'Choisir un groupe radio',
        "La carte rejoint le groupe 5 : seules les cartes du même groupe reçoivent ses messages.",
        [exStart(exB('radio_activer'), exB('radio_groupe', null, { GROUPE: exN(5) })),
         exWhen('lorsque_bouton', { BOUTON: 'a' }, exB('radio_envoyer_texte', null, { MESSAGE: exT('Salut') }))]);
    exemple(['radio_envoyer_valeur'], 'Envoyer une mesure nommée',
        "Le bouton A envoie la température sous le nom « temp ».",
        [exStart(exB('radio_activer')),
         exWhen('lorsque_bouton', { BOUTON: 'a' },
                exB('radio_envoyer_valeur', null, { NOM: exT('temp'), VALEUR: exV(exB('capteur_temperature')) }))]);
    exemple(['radio_quand_recu', 'radio_lecture'], 'Afficher le nombre reçu',
        "Quand un nombre arrive par radio, il s'affiche sur la matrice de LED.",
        [exStart(exB('radio_activer')),
         exWhen('radio_quand_recu', { TYPE: 'nombre' }, exAff(exB('radio_lecture', { QUOI: 'nombre' })))]);
    exemple(['radio_puissance'], 'Régler la puissance', "Puissance maximale (7) : la portée est la plus grande.",
        [exStart(exB('radio_activer'), exB('radio_puissance', null, { NIVEAU: exN(7) }))]);
    exemple(['radio_canal'], 'Choisir la bande de fréquence',
        "Bande 7 : deux cartes doivent utiliser la même bande pour s'entendre.",
        [exStart(exB('radio_activer'), exB('radio_canal', null, { CANAL: exN(7) }))]);

    exemple(['servo_angle'], 'Servo de 90° à 0°', "Le servo sur P0 se place à 90°, puis à 0° une seconde plus tard.",
        [exStart(exB('servo_angle', { BROCHE: 'pin0' }, { ANGLE: exN(90) }), exWait(1),
                 exB('servo_angle', { BROCHE: 'pin0' }, { ANGLE: exN(0) }))]);
    exemple(['servo_continu', 'servo_arreter'], 'Servo à rotation continue',
        "Le servo tourne à 50 % pendant deux secondes, puis s'arrête.",
        [exStart(exB('servo_continu', { BROCHE: 'pin0' }, { VITESSE: exN(50) }), exWait(2),
                 exB('servo_arreter', { BROCHE: 'pin0' }))]);
    exemple(['servo_arret_neutre'], 'Arrêt au neutre',
        "Avec l'arrêt au neutre actif, une vitesse nulle arrête le servo au lieu de le maintenir.",
        [exStart(exB('servo_arret_neutre', { BROCHE: 'pin0', ETAT: 'True' }),
                 exB('servo_continu', { BROCHE: 'pin0' }, { VITESSE: exN(0) }))]);
    exemple(['servo_intervalle'], 'Limiter la course du servo',
        "Limite le servo à l'intervalle 30° à 150°, puis le place à 90°.",
        [exStart(exB('servo_intervalle', { BROCHE: 'pin0' }, { MINI: exN(30), MAXI: exN(150) }),
                 exB('servo_angle', { BROCHE: 'pin0' }, { ANGLE: exN(90) }))]);
    exemple(['servo_impulsion'], 'Position centrale',
        "Une impulsion de 1500 µs place le servo en position centrale.",
        [exStart(exB('servo_impulsion', { BROCHE: 'pin0' }, { MICROS: exN(1500) }))]);

    exemple(['grove_led_etat'], 'LED clignotante', "La LED branchée sur P0 s'allume une seconde, puis s'éteint une seconde.",
        [exLoop(exB('grove_led_etat', { ETAT: '1', BROCHE: 'pin0' }), exWait(1),
                exB('grove_led_etat', { ETAT: '0', BROCHE: 'pin0' }), exWait(1))]);
    exemple(['grove_led_luminosite'], 'LED à mi-luminosité', "La LED sur P0 est réglée à la moitié de sa luminosité (512 sur 1023).",
        [exStart(exB('grove_led_luminosite', { BROCHE: 'pin0' }, { NIVEAU: exN(512) }))]);
    exemple(['grove_ruban_definir', 'grove_ruban_luminosite'], 'Ruban à demi-luminosité',
        "Définit un ruban de 16 LED sur P0, règle sa luminosité à 50 %, puis l'allume en rouge.",
        [exStart(exB('grove_ruban_definir', { BROCHE: 'pin0', NB: 16 }),
                 exB('grove_ruban_luminosite', null, { NIVEAU: exN(50) }),
                 exB('grove_ruban_couleur', { COULEUR: '0xFF0000' }))]);
    exemple(['grove_4d_definir', 'grove_4d_luminosite'], 'Afficheur 4 chiffres tamisé',
        "Branche l'afficheur (CLK sur P0, DIO sur P1), règle sa luminosité à 3, puis affiche 1234.",
        [exStart(exB('grove_4d_definir', { CLK: 'pin0', DIO: 'pin1' }),
                 exB('grove_4d_luminosite', null, { NIVEAU: exN(3) }),
                 exB('grove_4d_nombre', null, { VALEUR: exN(1234) }))]);
    exemple(['grove_joystick_valeur'], 'Valeur de l\'axe X', exTexteMesure,
        exMesure(exB('grove_joystick_valeur', { BROCHE: 'pin0' })));
    exemple(['grove_barre_niveau'], 'Barre de lumière', "La barre de LED (port P0 / P14) montre la lumière mesurée sur P1 : " +
        "plus il y a de lumière, plus il y a de LED allumées.",
        [exLoop(exB('grove_barre_niveau', { PORT: 'pin0, pin14' }, { NIVEAU: exV(exB('math_arithmetic', { OP: 'DIVIDE' },
            { A: exV(exB('grove_lumiere', { BROCHE: 'pin1', UNITE: 'brut' })), B: exN(100) })) }), exWait(0.2))]);
    exemple(['grove_barre_led'], 'Chenillard', "Les LED de la barre s'allument l'une après l'autre.",
        [exLoop(exB('controls_for', { VAR: { name: 'i' } }, { FROM: exN(1), TO: exN(10), BY: exN(1),
            DO: exDans(exB('grove_barre_led', { PORT: 'pin0, pin14', ETAT: '1' }, { LED: exV(exB('variables_get', { VAR: { name: 'i' } })) }),
                       exB('attendre_temps', { UNITE: 'ms' }, { TEMPS: exN(100) }),
                       exB('grove_barre_led', { PORT: 'pin0, pin14', ETAT: '0' }, { LED: exV(exB('variables_get', { VAR: { name: 'i' } })) })) }))]);
    exemple(['grove_bmp280'], 'Pression atmosphérique', exTexteMesure,
        exMesure(exB('grove_bmp280', { GRANDEUR: 'pression' })));
    exemple(['grove_sgp30'], 'Qualité de l\'air', "Un visage triste s'affiche quand les COV dépassent 500 ppb, un visage content sinon.",
        [exLoop(exB('controls_if', { }, { IF0: exV(exComp('GT', exB('grove_sgp30', { GRANDEUR: 'cov' }), exB('math_number', { NUM: 500 }))),
            DO0: exDans(exIcone('SAD')) }), exB('controls_if', null, { IF0: exV(exComp('LTE', exB('grove_sgp30', { GRANDEUR: 'cov' }),
            exB('math_number', { NUM: 500 }))), DO0: exDans(exIcone('HAPPY')) }), exWait(1))]);
    exemple(['grove_rtc_regler', 'grove_rtc_texte'], 'Afficher l\'heure', "Règle l'horloge une fois, puis fait défiler l'heure " +
        "toutes les 5 secondes.",
        [exStart(exB('grove_rtc_regler', null, { JOUR: exN(1), MOIS: exN(9), ANNEE: exN(2026), HEURE: exN(8), MINUTE: exN(0), SECONDE: exN(0) })),
         exLoop(exB('faire_defiler', null, { VALEUR: exV(exB('grove_rtc_texte')) }), exWait(5))]);
    exemple(['grove_rtc_lire'], 'Réveil', "Le buzzer (P0) sonne à 7 h 30.",
        [exLoop(exSi(exB('logic_operation', { OP: 'AND' }, {
            A: exV(exComp('EQ', exB('grove_rtc_lire', { CHAMP: 'heure' }), exB('math_number', { NUM: 7 }))),
            B: exV(exComp('EQ', exB('grove_rtc_lire', { CHAMP: 'minute' }), exB('math_number', { NUM: 30 }))) }),
            exB('grove_buzzer_bip', { BROCHE: 'pin0' }, { DUREE: exN(500) })), exWait(1))]);
    exemple(['grove_pca_init', 'grove_pca_angle'], 'Balayage d\'un servo', "Le servo branché sur la voie 0 du pilote 16 servos " +
        "va de 0 à 180° puis revient.",
        [exStart(exB('grove_pca_init', { ADRESSE: '0x7F' })),
         exLoop(exB('grove_pca_angle', null, { VOIE: exN(0), ANGLE: exN(0) }), exWait(1),
                exB('grove_pca_angle', null, { VOIE: exN(0), ANGLE: exN(180) }), exWait(1))]);
    exemple(['grove_pca_continu'], 'Servo continu', "Le servo continu de la voie 1 tourne 2 secondes dans un sens, puis dans l'autre.",
        [exLoop(exB('grove_pca_continu', null, { VOIE: exN(1), VITESSE: exN(60) }), exWait(2),
                exB('grove_pca_continu', null, { VOIE: exN(1), VITESSE: exN(-60) }), exWait(2))]);
    exemple(['dfr_servo'], 'Balayage d\'un servo (DFR0548)', "Le servo branché sur S1 de la carte DFR0548 passe de 0° à 180° " +
        "chaque seconde.",
        [exLoop(exB('dfr_servo', { SERVO: '1' }, { ANGLE: exN(0) }), exWait(1),
                exB('dfr_servo', { SERVO: '1' }, { ANGLE: exN(180) }), exWait(1))]);
    exemple(['dfr_moteur', 'dfr_moteur_arreter'], 'Moteur 2 secondes (DFR0548)', "Le moteur M1 tourne deux secondes dans le " +
        "sens horaire à la vitesse 150, puis s'arrête.",
        [exStart(exB('dfr_moteur', { MOTEUR: '1', SENS: '1' }, { VITESSE: exN(150) }), exWait(2),
                 exB('dfr_moteur_arreter', { MOTEUR: '1' }))]);
    exemple(['motorbit_moteur', 'motorbit_moteur_arreter'], 'Deux moteurs à tour de rôle (Motor:bit)', "Les moteurs M1 et M2 " +
        "de la carte Motor:bit tournent chacun deux secondes à la vitesse 150, l'un après l'autre.",
        [exLoop(exB('motorbit_moteur', { MOTEUR: '1', SENS: '1' }, { VITESSE: exN(150) }), exWait(2),
                exB('motorbit_moteur_arreter', { MOTEUR: '1' }),
                exB('motorbit_moteur', { MOTEUR: '2', SENS: '1' }, { VITESSE: exN(150) }), exWait(2),
                exB('motorbit_moteur_arreter', { MOTEUR: '2' }))]);
    exemple(['dfr_pas_a_pas'], 'Un tour de pas à pas (DFR0548)', "Le moteur pas à pas 28BYJ-48 branché sur M1-M2 fait un " +
        "tour dans le sens horaire, puis un demi-tour dans l'autre sens.",
        [exStart(exB('dfr_pas_a_pas', { MODELE: '28', PAIRE: '1', SENS: '1', UNITE: 'tours' }, { QUANTITE: exN(1) }),
                 exB('dfr_pas_a_pas', { MODELE: '28', PAIRE: '1', SENS: '-1', UNITE: 'degres' }, { QUANTITE: exN(180) }))]);
    exemple(['grove_bouton_lorsque'], 'Compter les appuis', "Chaque appui sur le bouton poussoir (P0) ajoute 1 au compteur affiché.",
        [exStart(exB('variables_set', { VAR: { name: 'compteur' } }, { VALUE: exN(0) })),
         exWhen('grove_bouton_lorsque', { BROCHE: 'pin0' },
             exB('math_change', { VAR: { name: 'compteur' } }, { DELTA: exN(1) }),
             exB('afficher_valeur', null, { VALEUR: { block: exB('variables_get', { VAR: { name: 'compteur' } }) } }))]);
    exemple(['grove_bouton_appuye'], 'Bouton appuyé', "Un cœur s'affiche tant que le bouton poussoir (P0) est enfoncé.",
        [exLoop(exSi(exB('grove_bouton_appuye', { BROCHE: 'pin0' }), exIcone('HEART')))]);
    exemple(['grove_lumiere'], 'Mesurer la lumière', exTexteMesure,
        exMesure(exB('grove_lumiere', { BROCHE: 'pin1', UNITE: 'pourcent' })));
    exemple(['grove_pir', 'grove_buzzer_bip'], 'Alarme', "Le buzzer (P1) bipe quand le détecteur de mouvement (P0) voit bouger.",
        [exLoop(exSi(exB('grove_pir', { BROCHE: 'pin0' }), exB('grove_buzzer_bip', { BROCHE: 'pin1' }, { DUREE: exN(300) })))]);
    exemple(['grove_buzzer_etat'], 'Bip toutes les secondes', "Le buzzer (P0) sonne une seconde, se tait une seconde, et ainsi de suite.",
        [exLoop(exB('grove_buzzer_etat', { BROCHE: 'pin0', ETAT: '1' }), exWait(1),
                exB('grove_buzzer_etat', { BROCHE: 'pin0', ETAT: '0' }), exWait(1))]);
    exemple(['grove_relais'], 'Lampe commandée', "Le relais (P0) allume la lampe 2 secondes, puis l'éteint 2 secondes.",
        [exLoop(exB('grove_relais', { BROCHE: 'pin0', ETAT: '1' }), exWait(2),
                exB('grove_relais', { BROCHE: 'pin0', ETAT: '0' }), exWait(2))]);
    exemple(['grove_oled_init', 'grove_oled_texte', 'grove_oled_effacer'], 'Bonjour sur l\'écran OLED',
        "Écrit deux lignes sur l'écran OLED, attend 2 secondes, puis l'efface.",
        [exStart(exB('grove_oled_init'),
                 exB('grove_oled_texte', null, { TEXTE: exT('Bonjour'), X: exN(0), Y: exN(0) }),
                 exB('grove_oled_texte', null, { TEXTE: exT('micro:bit'), X: exN(0), Y: exN(2) }),
                 exWait(2), exB('grove_oled_effacer'))]);
    exemple(['grove_potentiometre'], 'Angle du potentiomètre', exTexteMesure,
        exMesure(exB('grove_potentiometre', { BROCHE: 'pin0', UNITE: 'angle' })));
    exemple(['grove_joystick_bouton'], 'Appui sur le joystick', "Un cœur s'affiche quand on appuie sur le manche du joystick.",
        [exLoop(exSi(exB('grove_joystick_bouton', { BROCHE: 'pin0' }), exIcone('HEART')))]);
    exemple(['grove_gestes_init', 'grove_gestes_lire'], 'Lire le geste détecté',
        "Initialise le capteur de gestes, puis affiche chaque seconde le dernier geste détecté.",
        [exStart(exB('grove_gestes_init')), exLoop(exAff(exB('grove_gestes_lire')), exWait(1))]);
    exemple(['grove_th_init'], 'Humidité du capteur', "Initialise le capteur, puis affiche l'humidité (en %) chaque seconde.",
        [exStart(exB('grove_th_init')), exLoop(exAff(exB('grove_th_mesure', { GRANDEUR: 'h' })), exWait(1))]);
    exemple(['grove_dht11_definir', 'grove_dht11_mesure'], 'Température du DHT11',
        "Branche le DHT11 sur P1 et affiche la température chaque seconde. Sur micro:bit V2, lecture expérimentale (-1 si la mesure échoue).",
        [exStart(exB('grove_dht11_definir', { BROCHE: 'pin1' })),
         exLoop(exAff(exB('grove_dht11_mesure', { GRANDEUR: 'c' })), exWait(1))]);
    exemple(['grove_dht22_definir', 'grove_dht22_mesure'], 'Température du DHT22',
        "Branche le DHT22 sur P1 et affiche la température chaque seconde. Sur micro:bit V2, lecture expérimentale (-1 si la mesure échoue).",
        [exStart(exB('grove_dht22_definir', { BROCHE: 'pin1' })),
         exLoop(exAff(exB('grove_dht22_mesure', { GRANDEUR: 'c' })), exWait(1))]);
    exemple(['grove_couleur_init', 'grove_couleur_lire'], 'Lire le rouge détecté',
        "Initialise le capteur de couleur, puis affiche chaque seconde l'intensité de rouge mesurée.",
        [exStart(exB('grove_couleur_init')), exLoop(exAff(exB('grove_couleur_lire', { CANAL: 'rouge' })), exWait(1))]);
    exemple(['grove_moteur_defaut'], 'Surveiller le défaut du moteur', exTexteMesure,
        exMesure(exB('grove_moteur_defaut', { CANAL: '1' })));
    exemple(['grove_scd30_init'], 'Mesurer le CO₂ (SCD30)', "Initialise le capteur, puis affiche le CO₂ (ppm) chaque seconde.",
        [exStart(exB('grove_scd30_init')), exLoop(exAff(exB('grove_scd30_lire', { GRANDEUR: 'co2' })), exWait(1))]);
    exemple(['grove_scd41_init'], 'Mesurer le CO₂ (SCD41)', "Initialise le capteur, puis affiche le CO₂ (ppm) chaque seconde.",
        [exStart(exB('grove_scd41_init')), exLoop(exAff(exB('grove_scd41_lire', { GRANDEUR: 'co2' })), exWait(1))]);

    const voileAide = document.getElementById('voile-aide');

    function texteAideBloc(bloc) {
        if (AIDE_BLOCS[bloc.type]) return AIDE_BLOCS[bloc.type];
        try {
            let infobulle = bloc.tooltip;
            while (typeof infobulle === 'function') infobulle = infobulle();
            if (typeof infobulle === 'string' && infobulle.trim()) return infobulle.trim();
        } catch (erreur) { /* infobulle dynamique en echec : on passe au message par defaut */ }
        return "Aucune aide détaillée n'a encore été rédigée pour ce bloc.";
    }

    /** Code MicroPython de CE bloc seul (ses blocs-valeurs imbriques compris, pas les suivants). */
    function codeDuBloc(bloc) {
        try {
            let code = Blockly.Python.blockToCode(bloc, true);
            if (Array.isArray(code)) code = code[0];
            return (code || '').replace(/\s+$/, '');
        } catch (erreur) {
            return '';
        }
    }

    function ouvrirAideBloc(bloc) {
        if (!voileAide) return;
        let nom = '';
        try { nom = bloc.toString(80); } catch (erreur) { nom = bloc.type; }
        document.getElementById('aide-titre').textContent = 'Aide sur ce bloc';
        document.getElementById('aide-bloc-nom').textContent = nom || bloc.type;
        document.getElementById('aide-bloc-texte').textContent = texteAideBloc(bloc);
        const code = codeDuBloc(bloc);
        document.getElementById('aide-bloc-code-titre').style.display = code ? '' : 'none';
        const zoneCode = document.getElementById('aide-bloc-code');
        zoneCode.style.display = code ? '' : 'none';
        zoneCode.textContent = code;

        const ex = EXEMPLES_BLOCS[bloc.type];
        const zoneExemple = document.getElementById('aide-exemple');
        exempleAffiche = ex || null;
        zoneExemple.style.display = ex ? '' : 'none';
        if (ex) {
            document.getElementById('aide-exemple-titre').textContent = 'Exemple : ' + ex.titre;
            document.getElementById('aide-exemple-desc').textContent = ex.texte;
            document.getElementById('aide-exemple-code').textContent = codeExemple(ex);
        }

        document.getElementById('aide-exemple-details').open = false;
        voileAide.classList.add('ouvert');
        // Apres l'ouverture : Blockly mesure son conteneur, qui doit etre visible.
        if (ex) afficherExempleEnBlocs(ex);
        document.getElementById('aide-fermer').focus();
    }
    function fermerAideBloc() { if (voileAide) voileAide.classList.remove('ouvert'); }

    let exempleAffiche = null;

    // Petit espace Blockly en lecture seule, cree une fois puis reutilise.
    let espaceExemple = null;
    function afficherExempleEnBlocs(ex) {
        const conteneur = document.getElementById('aide-exemple-blocs');
        try {
            if (!espaceExemple) {
                espaceExemple = Blockly.inject(conteneur, {
                    media: 'lib/blockly/media/',
                    readOnly: true, sounds: false, trashcan: false,
                    zoom: { controls: false, wheel: false, pinch: false, startScale: 1 },
                    move: { scrollbars: true, drag: true, wheel: false },
                });
                // inject() fait de ce petit espace l'espace "principal" de Blockly
                // (copier/coller, annulation...) : on rend ce role au vrai programme.
                Blockly.common.setMainWorkspace(window.workspace);
            }
            espaceExemple.clear();
            espaceExemple.setScale(1);
            Blockly.svgResize(espaceExemple);
            Blockly.serialization.workspaces.load({ blocks: { languageVersion: 0,
                blocks: JSON.parse(JSON.stringify(ex.blocs)).map((b, i) => Object.assign(b, { x: 0, y: i * 1000 })) } },
                espaceExemple);
            // Les blocs racines sont empiles les uns sous les autres.
            let y = 0;
            espaceExemple.getTopBlocks(true).forEach(b => {
                const pos = b.getRelativeToSurfaceXY();
                b.moveBy(-pos.x, y - pos.y);
                y += b.getHeightWidth().height + 24;
            });
            // Echelle reduite si le programme depasse la zone, pour le voir en entier.
            const zone = espaceExemple.getBlocksBoundingBox();
            const largeur = zone.right - zone.left, hauteur = zone.bottom - zone.top;
            const echelle = Math.max(0.4, Math.min(1, (conteneur.clientWidth - 24) / largeur,
                                                      (conteneur.clientHeight - 24) / hauteur));
            espaceExemple.setScale(echelle);
            espaceExemple.scroll(12 - zone.left * echelle, 12 - zone.top * echelle);
        } catch (erreur) {
            console.error('Exemple en blocs :', erreur);
        }
    }

    /** Code MicroPython d'un exemple, calcule dans un espace de travail temporaire (le programme en cours n'est pas touche). */
    function codeExemple(ex) {
        const espace = new Blockly.Workspace();
        try {
            Blockly.serialization.workspaces.load({ blocks: { languageVersion: 0,
                blocks: JSON.parse(JSON.stringify(ex.blocs)).map((b, i) => Object.assign(b, { x: 0, y: i * 100 })) } }, espace);
            let code = genererCodeDepuisBlocs(espace);
            // Les pilotes de modules (dizaines de lignes) noieraient l'exemple :
            // ils sont ajoutes tout seuls au programme reel.
            const avecPilote = /# >>> pilote /.test(code);
            code = code.replace(/# >>> pilote (\S+)\r?\n[\s\S]*?\r?\n# <<< pilote \S+\r?\n?/g, '')
                       .replace(/\n{3,}/g, '\n\n').trim();
            return code + (avecPilote ? '\n\n# (le pilote du module est ajouté automatiquement)' : '');
        } catch (erreur) {
            console.error('Exemple d\'aide :', erreur);
            return '';
        } finally {
            espace.dispose();
        }
    }

    // « Au démarrage » (unique : maxInstances) et « Répéter indéfiniment » : si l'espace de travail en a déjà un, le
    // contenu de celui de l'exemple s'ajoute à la fin du sien au lieu de créer un doublon.
    const BLOCS_A_FUSIONNER = ['au_demarrage', 'boucle_infinie'];
    /** Bloc de ce type déjà présent : celui de la pile « Au démarrage » d'abord, sinon le premier posé seul en haut. */
    function blocAFusionner(espace, type) {
        const candidats = espace.getBlocksByType(type, true).filter(b => !b.isInsertionMarker() && !b.isShadow());
        if (type !== 'boucle_infinie') return candidats[0] || null;
        // Une boucle rangée dans une autre (« si », fonction...) n'est pas « la » boucle du programme.
        const principales = candidats.filter(b => !b.getSurroundParent());
        return principales.find(b => b.getRootBlock().type === 'au_demarrage') || principales[0] || null;
    }
    /** Ajoute la pile `def` (blocs d'instruction) à la fin de l'entrée DO de `cible`. Renvoie le premier bloc ajouté. */
    function ajouterDansDO(espace, cible, def) {
        const b = Blockly.serialization.blocks.append(def, espace, { recordUndo: true });
        let dernier = cible.getInputTargetBlock('DO');
        while (dernier && dernier.getNextBlock()) dernier = dernier.getNextBlock();
        const prise = dernier ? dernier.nextConnection : cible.getInput('DO').connection;
        if (prise && b.previousConnection) prise.connect(b.previousConnection);
        return b;
    }

    /** Ajoute l'exemple sous les blocs existants, en un seul pas d'annulation (Ctrl+Z). */
    function insererExemple(ex) {
        const espace = window.workspace;
        let x = 40, y = 40;
        const existants = espace.getTopBlocks(false);
        if (existants.length) {
            const zones = existants.map(b => b.getBoundingRectangle());
            x = Math.min(...zones.map(r => r.left));
            y = Math.max(...zones.map(r => r.bottom)) + 60;
        }
        let premier = null;
        Blockly.Events.setGroup(true);
        try {
            const aPoser = JSON.parse(JSON.stringify(ex.blocs));
            while (aPoser.length) {
                const def = aPoser.shift();
                const cible = BLOCS_A_FUSIONNER.includes(def.type) ? blocAFusionner(espace, def.type) : null;
                if (cible) {
                    // Ce qui suivait le bloc dans l'exemple (une boucle accrochée sous « Au démarrage ») est traité ensuite.
                    if (def.next && def.next.block) aPoser.unshift(def.next.block);
                    const contenu = def.inputs && def.inputs.DO && def.inputs.DO.block;
                    if (contenu) {
                        const b = ajouterDansDO(espace, cible, contenu);
                        if (!premier) premier = b;
                    }
                    continue;
                }
                const b = Blockly.serialization.blocks.append(def, espace, { recordUndo: true });
                const pos = b.getRelativeToSurfaceXY();
                b.moveBy(x - pos.x, y - pos.y);
                y = b.getBoundingRectangle().bottom + 40;
                if (!premier) premier = b;
            }
        } finally {
            Blockly.Events.setGroup(false);
        }
        if (premier) {
            try { espace.centerOnBlock(premier.id); } catch (erreur) { /* le centrage n'est qu'un confort */ }
            premier.select();
        }
    }

    if (voileAide) {
        document.getElementById('aide-fermer').addEventListener('click', fermerAideBloc);
        document.getElementById('aide-inserer').addEventListener('click', () => {
            if (!exempleAffiche) return;
            insererExemple(exempleAffiche);
            fermerAideBloc();
        });
        // Clic sur le voile (hors de la fenetre) ou Echap : on referme.
        voileAide.addEventListener('mousedown', e => { if (e.target === voileAide) fermerAideBloc(); });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && voileAide.classList.contains('ouvert')) fermerAideBloc();
        });
    }

    // ---- Aide sur la console (bouton « ? » de la barre du bas) ----
    // Meme fenetre que l'aide d'un bloc, sans code ni exemple.
    const TEXTE_AIDE_CONSOLE =
        "La console affiche les messages écrits par le programme avec le bloc « afficher dans la console » " +
        "(catégorie Matrice LED). Elle se trouve en bas de l'application.\n\n" +
        "AFFICHER OU MASQUER\n" +
        "• Bouton « Console » de la barre d'outils, ou croix ✕ de la console.\n" +
        "• Elle s'ouvre toute seule à la première ligne reçue, sauf si vous l'avez fermée vous-même.\n" +
        "• Changez sa hauteur en glissant son bord haut (le trait orange qui apparaît au survol) : vers le haut " +
        "pour l'agrandir, vers le bas pour la réduire. La hauteur est retenue pour la fois suivante ; un double-clic " +
        "sur ce bord rend la hauteur de départ.\n\n" +
        "AVEC LE SIMULATEUR\n" +
        "• Cliquez « Lancer la simulation » : les lignes apparaissent dans l'ordre où le programme les écrit.\n" +
        "• « Lancer la simulation » et « Réinitialiser la simulation » effacent ces lignes. " +
        "Seules les 1000 dernières lignes sont conservées.\n\n" +
        "AVEC LA VRAIE CARTE (Chrome ou Edge uniquement)\n" +
        "1. Branchez la carte micro:bit en USB.\n" +
        "2. Cliquez « Connecter » et choisissez la carte micro:bit dans la liste.\n" +
        "3. Envoyez le programme avec « Envoyer sur la carte » : la carte redémarre et la console se reconnecte " +
        "toute seule. Les lignes envoyées par la carte s'affichent en vert.\n" +
        "4. « Déconnecter » coupe la liaison (la console ne se reconnecte alors plus toute seule).\n" +
        "• Si la connexion échoue, un autre onglet ou programme utilise déjà la carte : fermez-le puis réessayez.\n\n" +
        "ENVOYER DU TEXTE À LA CARTE\n" +
        "• Écrivez dans le champ du bas puis appuyez sur Entrée (ou « Envoyer »). Le texte envoyé s'affiche en gris, " +
        "précédé de « > ».\n" +
        "• La carte ne le lit que si le programme attend une saisie avec input(), ou si la carte est en mode REPL " +
        "(programme arrêté).\n\n" +
        "GRAPHIQUE\n" +
        "• L'onglet « Graphique » trace en courbes les valeurs numériques de la console, au fil du temps " +
        "(axe horizontal en secondes depuis la première mesure). La vue se met à jour toute seule.\n" +
        "• Une ligne = un ou plusieurs points. Formats reconnus :\n" +
        "   21.5  : un nombre (une courbe « Valeur »)\n" +
        "   (12, 40, 7)  ou  12 40 7  : plusieurs courbes (« Série 1 », « Série 2 »…)\n" +
        "   temp:21 lum:40  : une courbe par nom (aussi nom=valeur)\n" +
        "• Les autres lignes (texte, informations) sont ignorées. Une virgule entre deux chiffres est une " +
        "virgule décimale quand la ligne ne contient qu'un nombre (« 21,5 »).\n" +
        "• La légende donne la dernière valeur de chaque courbe. Si le simulateur et la carte envoient " +
        "des valeurs, leurs courbes sont séparées. Les 600 derniers points de chaque courbe sont tracés.\n" +
        "• Pour tracer une mesure, écrivez-la avec « afficher dans la console » dans une boucle avec une pause.\n\n" +
        "EXPORTER VERS EXCEL\n" +
        "• Le bouton 📊 enregistre toutes les lignes affichées dans un fichier Excel (.xlsx).\n" +
        "• Colonnes : numéro, heure, source (Simulateur, Carte ou Information), texte, et une colonne « Valeur " +
        "numérique » remplie quand la ligne est un nombre : pratique pour tracer une courbe de mesures.\n\n" +
        "AUTRES BOUTONS\n" +
        "• 🗑 efface toute la console, y compris les lignes de la carte.";

    function ouvrirAideConsole() {
        if (!voileAide) return;
        document.getElementById('aide-titre').textContent = 'Aide sur la console';
        document.getElementById('aide-bloc-nom').textContent = 'Utiliser la console';
        document.getElementById('aide-bloc-texte').textContent = TEXTE_AIDE_CONSOLE;
        document.getElementById('aide-bloc-code-titre').style.display = 'none';
        document.getElementById('aide-bloc-code').style.display = 'none';
        document.getElementById('aide-exemple').style.display = 'none';
        exempleAffiche = null;
        voileAide.classList.add('ouvert');
        document.getElementById('aide-fermer').focus();
    }
    const btnConsoleAide = document.getElementById('btn-console-aide');
    if (btnConsoleAide) btnConsoleAide.addEventListener('click', ouvrirAideConsole);

    // ---- Aide sur l'IA (bouton « ? » du panneau IA) ----
    const TEXTE_AIDE_IA =
        "La fenêtre IA (bouton « IA » de la barre d'outils) reconnaît des images (caméra), des gestes, des positions, des " +
        "sons (micro) et des QR codes. « Terminé » la ferme : une reconnaissance en cours continue (bouton IA souligné en vert). " +
        "Le résultat pilote le programme par les blocs de la catégorie « IA », au choix dans le simulateur ou sur la " +
        "vraie carte. L'image et le son restent dans le navigateur : seul le nom de la classe est transmis.\n\n" +
        "1. APPRENDRE SES CLASSES : onglet « ⚡ Apprentissage immédiat » (sans entraînement, sans Internet)\n" +
        "• Choisissez ce que l'IA doit reconnaître : des objets ou des images, des gestes de la main, des positions des bras " +
        "(caméra), ou des sons ou des mots (micro).\n" +
        "• La caméra s'allume à l'ouverture de la fenêtre. Sur la carte d'une classe : « 📸 Une photo » ajoute un exemple à " +
        "chaque clic, « 🎞 Plusieurs photos » en ajoute en rafale jusqu'à « ■ Arrêter », « 📁 Ajouter des images » prend des " +
        "fichiers .png ou .jpg. Pour les sons : « 🎤 Enregistrer », faites le son (ou dites le mot) plusieurs fois avec un court " +
        "silence entre deux, puis « ■ Arrêter » : chaque son détecté devient un exemple.\n" +
        "• Chaque exemple a sa vignette sur la carte de sa classe (photo pour les objets, squelette pour les gestes et positions, " +
        "dessin du timbre pour les sons). Cliquer sur une vignette supprime cet exemple seulement ; 🧹 efface tous les " +
        "exemples de la classe ; ✕ supprime la classe ; « Tout effacer » (en bas) repart de deux classes vides.\n" +
        "• Chaque exemple compte aussitôt : « ▶ Démarrer » dès que 2 classes ont des exemples. Renommer une classe met à " +
        "jour les blocs qui l'utilisent.\n" +
        "• Images, gestes et positions pilotent les blocs « vision » ; les sons pilotent les blocs « son ». Un son reconnu " +
        "le reste 1 seconde.\n" +
        "• L'apprentissage (des nombres, jamais d'images ni de sons) est rangé dans le .py téléchargé et relu à son " +
        "ouverture ; « 💾 Exporter » le met dans un fichier .json à part. Il n'est pas dans le .hex. Les photos des " +
        "vignettes ne sont pas enregistrées (▣ après réouverture) ; squelettes et timbres se redessinent.\n\n" +
        "2. OU CHARGER UN MODÈLE TEACHABLE MACHINE (onglets « Modèle Teachable Machine », caméra et micro)\n" +
        "• Sur teachablemachine.withgoogle.com : « Exporter le modèle », onglet Tensorflow.js. Collez l'adresse puis " +
        "« Charger » (nécessite Internet), ou « Fichiers… » et sélectionnez les 3 fichiers à la fois (model.json, " +
        "metadata.json, weights.bin : fonctionne sans Internet).\n" +
        "• « Démarrer » : le navigateur demande l'autorisation d'utiliser la caméra ou le micro. Démarrer un modèle " +
        "arrête l'apprentissage immédiat du même genre, et inversement.\n\n" +
        "3. PROGRAMMER\n" +
        "• « lorsque l'IA reconnaît <classe> » : exécute les blocs quand cette classe est reconnue. Choisissez la classe dans " +
        "la liste, ou « ✎ autre nom… » (majuscules et accents sont ignorés).\n" +
        "• « l'IA reconnaît … », « dernière classe reconnue », « confiance de l'IA » : à utiliser dans des conditions.\n" +
        "• Seuil de confiance : en dessous, aucune classe n'est retenue.\n\n" +
        "4. SIMULATEUR OU VRAIE CARTE\n" +
        "• Simulateur : lancez la simulation, puis démarrez la reconnaissance. Les classes reconnues déclenchent les blocs.\n" +
        "• Vraie carte : connectez-la avec le bouton « Connecter » de la console, envoyez le programme, " +
        "cochez « Envoyer à la carte » puis démarrez la reconnaissance. Le navigateur doit rester ouvert : " +
        "c'est lui qui reconnaît, la carte reçoit seulement le résultat par le câble USB.\n" +
        "• Le programme doit contenir au moins un bloc IA, sinon la carte n'écoute pas le port USB.\n" +
        "• Le résultat est renvoyé deux fois par seconde ; la carte oublie un résultat de plus de 1,5 s " +
        "(navigateur fermé, câble débranché).\n\n" +
        "5. QR CODES ET CODES-BARRES\n" +
        "• Onglet « 🔳 QR codes et codes-barres » : « ▶ Lire les codes », puis les blocs « lorsqu'un code QR est lu », " +
        "« un code QR est visible », « texte du dernier code QR lu ». « Créer un QR code » en fabrique un à imprimer.\n\n" +
        "LIMITES\n" +
        "• Chrome ou Edge conseillé. La caméra et le micro demandent une page en localhost ou en HTTPS.\n" +
        "• Sons : la pièce doit être assez calme ; un bruit continu de plus de 1,5 s est ignoré.\n" +
        "• « Charger » une adresse Teachable Machine télécharge le modèle depuis les serveurs de Google (aucune image " +
        "ni aucun son n'y est envoyé). Sans Internet, utilisez « Fichiers… ».";

    function ouvrirAideIA() {
        if (!voileAide) return;
        document.getElementById('aide-titre').textContent = 'Aide sur l\'IA';
        document.getElementById('aide-bloc-nom').textContent = 'Reconnaissance d\'images et de sons';
        document.getElementById('aide-bloc-texte').textContent = TEXTE_AIDE_IA;
        document.getElementById('aide-bloc-code-titre').style.display = 'none';
        document.getElementById('aide-bloc-code').style.display = 'none';
        document.getElementById('aide-exemple').style.display = 'none';
        exempleAffiche = null;
        voileAide.classList.add('ouvert');
        document.getElementById('aide-fermer').focus();
    }
    const btnIAAide = document.getElementById('btn-ia-aide');
    if (btnIAAide) btnIAAide.addEventListener('click', ouvrirAideIA);

    Blockly.ContextMenuRegistry.registry.register({
        id: 'aide_sur_ce_bloc',
        scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
        displayText: () => 'Aide sur ce bloc',
        preconditionFn: () => 'enabled',
        callback: scope => ouvrirAideBloc(scope.block),
        weight: 1,
    });
    window.aideBlocTest = { ouvrir: ouvrirAideBloc, fermer: fermerAideBloc, AIDE_BLOCS,
                            espaceExemple: () => espaceExemple,
                            EXEMPLES_BLOCS, codeExemple, insererExemple };

    async function envoyerSurLaCarte() {
        const codePython = window.currentPythonCode;
        if (!codePython || !codePython.trim()) {
            afficherEtat("Ajoutez d'abord des blocs sur l'espace de travail.", true);
            return;
        }

        boutonEnvoyer.disabled = true;
        let envoiReussi = false;
        fenetreEnvoi.ouvrir('Génération du programme…');
        // On distingue les deux moitiés de l'opération : un firmware invalide
        // n'a rien à voir avec le lecteur, et proposer d'en redésigner un
        // envoyait sur une fausse piste.
        let etape = 'generation';
        try {
            // Générer d'abord : inutile de faire choisir un lecteur si le
            // programme ne peut de toute façon pas être produit.
            afficherEtat('Génération du programme…', false);
            const contenuHex = await genererFichierHexFinal(SIGNATURE_EXPORT + codePython);

            etape = 'lecteur';
            if (!dossierCarte) {
                afficherEtat('Choisissez le lecteur MICROBIT…', false);
                fenetreEnvoi.etape('Choisissez le lecteur MICROBIT…');
                const choisi = await window.showDirectoryPicker({ mode: 'readwrite', id: 'microbit' });
                if (!await estLecteurMicrobit(choisi)) {
                    throw new Error("Ce dossier ne ressemble pas au lecteur MICROBIT : ni DETAILS.TXT " +
                                    'ni MICROBIT.HTM ne s\'y trouvent. Choisir le lecteur de la carte.');
                }
                dossierCarte = choisi;
            }

            if (!await autorisationEcriture(dossierCarte)) {
                throw new Error("Autorisation d'écriture refusée sur le lecteur.");
            }

            afficherEtat('Écriture sur la carte…', false);
            fenetreEnvoi.etape('Écriture sur la carte…');
            fenetreEnvoi.progression(0);
            const fichier = await dossierCarte.getFileHandle('programme-microbit.hex', { create: true });
            const flux = await fichier.createWritable();
            // Par morceaux : le pourcentage affiche compte de vrais octets
            // ecrits. Plafonne a 99 % tant que close() n'est pas revenu — c'est
            // lui qui valide reellement l'ecriture sur le lecteur.
            const blob = new Blob([contenuHex], { type: 'application/octet-stream' });
            const TAILLE_MORCEAU = 32 * 1024;
            for (let debut = 0; debut < blob.size; debut += TAILLE_MORCEAU) {
                await flux.write(blob.slice(debut, debut + TAILLE_MORCEAU));
                fenetreEnvoi.progression(Math.min(99, (Math.min(debut + TAILLE_MORCEAU, blob.size) / blob.size) * 100));
            }
            fenetreEnvoi.etape('Finalisation…');
            await flux.close();
            fenetreEnvoi.progression(100);
            fenetreEnvoi.etape('Programme envoyé. La carte clignote puis redémarre.');
            envoiReussi = true;

            afficherEtat('Programme envoyé. La carte clignote puis redémarre.', false);
        } catch (erreur) {
            console.error('Envoi sur la carte :', erreur);
            if (erreur && erreur.name === 'AbortError') {
                afficherEtat('Envoi annulé.', false);
            } else if (etape === 'generation') {
                afficherEtat(erreur.message, true);
            } else {
                // Apres un transfert, le lecteur se demonte et se remonte : la
                // reference gardee ne vaut plus rien, il faut le redesigner.
                dossierCarte = null;
                afficherEtat(erreur.message + ' — recliquez pour redésigner le lecteur.', true);
            }
        } finally {
            // Succes : on laisse "100 %" lisible un instant. Echec ou
            // annulation : le message d'erreur est dans la barre d'etat, la
            // fenetre n'a plus de raison de rester.
            fenetreEnvoi.fermer(envoiReussi ? 1200 : 0);
            boutonEnvoyer.disabled = false;
        }
    }

    if (boutonEnvoyer) {
        if (typeof window.showDirectoryPicker !== 'function') {
            boutonEnvoyer.disabled = true;
            boutonEnvoyer.title = "Cette fonction demande Chrome ou Edge : Firefox et Safari " +
                                  "n'ont pas l'API d'accès aux fichiers. Utilisez le bouton .hex.";
        } else {
            boutonEnvoyer.addEventListener('click', envoyerSurLaCarte);
        }
    }

    document.getElementById('download-py-btn').addEventListener('click', () => {
        let codePython = window.currentPythonCode;
        if (!codePython || codePython.trim() === "") {
            codePython = "# Aucun bloc n'a été ajouté.\nfrom microbit import *\n";
        } else {
            codePython = SIGNATURE_EXPORT + codePython;
        }
        // Apprentissage immediat du panneau IA (ia-immediat.js) : commentaires a la fin, ignores par la carte.
        if (window.iaImmediat) codePython += window.iaImmediat.annexePy();
        const blob = new Blob([codePython], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nomFichierPour('script_microbit.py');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        afficherEtat('Script .py téléchargé.', false);
    });

    // Menu "Fichier" : regroupe les deux telechargements (demande de
    // l'utilisateur, avec une image de reference). Les boutons #download-btn
    // et #download-py-btn gardent leurs ecouteurs ci-dessus inchanges — seul
    // le balisage autour a bouge, pas leur id.
    document.querySelectorAll('.menu-deroulant').forEach(menu => {
        const bouton = menu.querySelector('.menu-btn');
        const panneau = menu.querySelector('.menu-panneau');
        if (!bouton || !panneau) return;
        bouton.addEventListener('click', e => {
            e.stopPropagation();
            const ouvrir = !panneau.classList.contains('visible');
            document.querySelectorAll('.menu-panneau.visible').forEach(p => p.classList.remove('visible'));
            if (ouvrir) panneau.classList.add('visible');
        });
        // Un clic dans le menu sur une entree le referme (les entrees gardent leurs propres ecouteurs).
        panneau.querySelectorAll('button').forEach(b => b.addEventListener('click', () => panneau.classList.remove('visible')));
    });
    // Un clic n'importe ou ailleurs referme les menus, comme un menu deroulant classique.
    document.addEventListener('click', e => {
        document.querySelectorAll('.menu-panneau.visible').forEach(p => {
            const menu = p.closest('.menu-deroulant');
            if (!menu || !menu.contains(e.target)) p.classList.remove('visible');
        });
    });

    // Champ « Nom du fichier » : nomme les fichiers telecharges (.hex, .py, capture .png).
    // Vide : les noms d'origine sont conserves. Les caracteres interdits par Windows sont retires.
    const champNomFichier = document.getElementById('nom-fichier');
    function nomFichierPour(nomParDefaut) {
        const ext = nomParDefaut.slice(nomParDefaut.lastIndexOf('.'));
        const brut = champNomFichier ? champNomFichier.value : '';
        let base = brut.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '').replace(/\.(hex|py|png)$/i, '').trim().replace(/[. ]+$/, '');
        if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(base)) base += '_';
        return base ? base + ext : nomParDefaut;
    }
    function definirNomFichier(nomDeFichier) {
        if (champNomFichier) champNomFichier.value = String(nomDeFichier || '').replace(/\.(hex|py)$/i, '');
    }
    window.nomFichierPour = nomFichierPour;
    if (champNomFichier) champNomFichier.addEventListener('keydown', e => { if (e.key === 'Enter') champNomFichier.blur(); });

    // ==========================================
    // 4. AFFICHAGE ET INJECTION AUTOMATIQUE DES ÉVÉNEMENTS
    // ==========================================

    // Chaque fonction `on_…` que peuvent produire les blocs « lorsque … » doit
    // figurer ici, sinon le bloc correspondant ne serait jamais exécuté.
    const GESTIONNAIRES = [
        // Un declenchement par appui (voir P.forBlock['lorsque_bouton']) ; A+B en premier : il consomme les appuis.
        ['def on_button_pressed_ab(', 'if _boutons_ab(): on_button_pressed_ab()'],
        ['def on_button_pressed_a(',  'if button_a.was_pressed(): on_button_pressed_a()'],
        ['def on_button_pressed_b(',  'if button_b.was_pressed(): on_button_pressed_b()'],
        ['def on_logo_touched(',      'if pin_logo.is_touched(): on_logo_touched()'],
        ['def on_logo_released(',     'if not pin_logo.is_touched(): on_logo_released()'],
        ['def on_pin_pin0_touched(',  'if pin0.is_touched(): on_pin_pin0_touched()'],
        ['def on_pin_pin1_touched(',  'if pin1.is_touched(): on_pin_pin1_touched()'],
        ['def on_pin_pin2_touched(',  'if pin2.is_touched(): on_pin_pin2_touched()'],
        ['def on_pin_pin0_released(', 'if not pin0.is_touched(): on_pin_pin0_released()'],
        ['def on_pin_pin1_released(', 'if not pin1.is_touched(): on_pin_pin1_released()'],
        ['def on_pin_pin2_released(', 'if not pin2.is_touched(): on_pin_pin2_released()'],
        ['def on_gesture_shake(',     "if accelerometer.was_gesture('shake'): on_gesture_shake()"],
        ['def on_gesture_up(',        "if accelerometer.was_gesture('up'): on_gesture_up()"],
        ['def on_gesture_down(',      "if accelerometer.was_gesture('down'): on_gesture_down()"],
        ['def on_sound_LOUD(',        'if microphone.was_event(SoundEvent.LOUD): on_sound_LOUD()'],
        ['def on_sound_QUIET(',       'if microphone.was_event(SoundEvent.QUIET): on_sound_QUIET()'],
        // La radio n'a pas d'interruption : on releve la boite aux lettres a
        // chaque tour, et le pilote appelle le gestionnaire qui convient.
        ['def on_radio_',             '_radio_traiter()'],
        // IA : meme principe (lecture de l'USB a chaque tour). Declenche des qu'un
        // bloc IA est utilise, pas seulement un gestionnaire : « l'IA reconnait »
        // et « derniere classe » ont aussi besoin que l'etat soit tenu a jour.
        ['def _ia_traiter(',          '_ia_traiter()'],
        // Bouton poussoir Grove : front montant (un declenchement par appui), une ligne par broche.
        ...BROCHES_GROVE.map(([, broche]) =>
            ['def on_grove_bouton_' + broche + '(', 'if _grove_bouton_front(' + broche + '): on_grove_bouton_' + broche + '()']),
    ];

    // ------------------------------------------
    // AFFICHAGE DE LA TRANSCRIPTION
    // ------------------------------------------
    // Les pilotes des modules Grove et des servos font plusieurs dizaines de
    // lignes et noyaient le programme de l'eleve. Ils sont replies derriere un
    // resume depliable. Le code envoye a la carte, lui, est complet : seul
    // l'affichage change.

    const pilotesOuverts = new Set();

    function afficherTranscription(code) {
        const zone = document.getElementById('code-display');
        if (!zone) return;
        if (!code) {
            zone.textContent = '# Glissez des blocs pour voir le code...';
            return;
        }
        zone.textContent = '';
        const motif = /# >>> pilote (\S+)\r?\n([\s\S]*?)\r?\n# <<< pilote \S+\r?\n?/g;
        let position = 0;
        let premier = true;
        let trouve;
        while ((trouve = motif.exec(code)) !== null) {
            // Un resume replie occupe deja sa propre ligne : les sauts de ligne
            // qui l'entouraient dans le code sont donc en trop a l'affichage.
            let avant = resserrer(code.slice(position, trouve.index));
            if (!premier) avant = avant.replace(/^\n+/, '\n');
            avant = avant.replace(/\n+$/, '');
            if (avant) zone.appendChild(document.createTextNode(avant));
            zone.appendChild(replierPilote(trouve[1], trouve[2]));
            premier = false;
            position = trouve.index + trouve[0].length;
        }
        let reste = resserrer(code.slice(position));
        if (!premier) reste = reste.replace(/^\n+/, '\n');
        if (reste) zone.appendChild(document.createTextNode(reste));
    }

    /** Retirer un pilote laisse un trou de lignes vides : on le resserre. */
    function resserrer(texte) {
        return texte.replace(/\n{3,}/g, '\n\n');
    }

    function replierPilote(nom, corps) {
        const bloc = document.createElement('details');
        bloc.className = 'pilote-replie';
        // On garde ouvert ce que l'utilisateur avait deplie : la transcription
        // est reconstruite a chaque modification du programme.
        bloc.open = pilotesOuverts.has(nom);
        bloc.addEventListener('toggle', () => {
            if (bloc.open) pilotesOuverts.add(nom); else pilotesOuverts.delete(nom);
        });

        const resume = document.createElement('summary');
        const nbLignes = corps.split('\n').length;
        resume.textContent = 'pilote ' + nom + ' — ' + nbLignes +
                             (nbLignes > 1 ? ' lignes' : ' ligne');
        const contenu = document.createElement('div');
        contenu.className = 'pilote-corps';
        contenu.textContent = corps;

        bloc.appendChild(resume);
        bloc.appendChild(contenu);
        return bloc;
    }

    // Declaree avant usage : updatePythonCode() (appelee tout de suite plus
    // bas) la lit, avant que la section EDITION MANUELLE ne soit atteinte.
    let editionManuelleActive = false;

    /** Le code tel que les blocs le decrivent, scrutation des evenements comprise. */
    // `espace` : par defaut l'espace de travail de l'eleve ; l'aide sur un bloc
    // (voir AIDE SUR UN BLOC) passe un espace temporaire pour calculer le
    // code d'un exemple sans toucher au programme en cours.
    function genererCodeDepuisBlocs(espace) {
        let codePython = Blockly.Python.workspaceToCode(espace || window.workspace);

        const appels = GESTIONNAIRES
            .filter(([signature]) => codePython.includes(signature))
            .map(([, appel]) => appel);

        if (appels.length) {
            // L'indentation doit suivre celle du générateur Python de Blockly
            // (P.INDENT), et non une valeur écrite en dur : mélanger 4 espaces et
            // 2 espaces dans la même suite donne un IndentationError.
            const boucles = /^([ \t]*)while True:[ \t]*$/gm;
            if (boucles.test(codePython)) {
                boucles.lastIndex = 0;
                // Toutes les boucles infinies reçoivent la scrutation, pas
                // seulement la première : sinon un programme à deux boucles
                // ignorerait les boutons dans l'une d'elles.
                codePython = codePython.replace(boucles, (ligne, marge) =>
                    ligne + '\n' + appels.map(a => marge + P.INDENT + a).join('\n'));
            } else {
                codePython += '\n# --- Boucle des événements (générée automatiquement) ---\n' +
                    'while True:\n' +
                    appels.map(a => P.INDENT + a).join('\n') + '\n' +
                    P.INDENT + 'sleep(100)\n';
            }
        }
        return codePython;
    }

    /**
     * Met a jour tout ce qui depend du code actuellement actif — qu'il vienne
     * des blocs ou d'une saisie manuelle (voir la section EDITION MANUELLE
     * plus bas) : la variable globale que lisent le simulateur et les
     * telechargements, le panneau Grove et le porte-broches A+B.
     */
    function definirCodeActuel(codePython) {
        window.currentPythonCode = codePython;

        if (panneauGrovePret) rafraichirPanneauGrove();

        const wrapAB = document.getElementById('wrap-ab');
        if (wrapAB) {
            wrapAB.style.display =
                (codePython.includes('button_a.is_pressed() and button_b.is_pressed()') ||
                 codePython.includes('_ab()')) ? 'flex' : 'none';
        }
    }

    /**
     * Un bloc « conteneur » (au démarrage, répéter indéfiniment, tous les
     * "lorsque ..." y compris radio_quand_recu) est légitimement seul en
     * haut de l'espace de travail : son utilité vient de son contenu (DO),
     * pas d'être accroché à un autre bloc. La plupart n'ont structurellement
     * ni previousConnection ni outputConnection (ils ne PEUVENT pas être
     * accrochés) — seul `boucle_infinie` fait exception (il a les deux,
     * pour pouvoir en théorie être chaîné) et doit donc être ajouté à la
     * main plutôt que déduit par la structure.
     */
    function estContainerLegitime(bloc) {
        return (!bloc.previousConnection && !bloc.outputConnection) || bloc.type === 'boucle_infinie';
    }

    /**
     * Un bloc posé sur l'espace de travail mais pas accroché à un conteneur
     * légitime (déposé seul, ou détaché d'une pile existante) ne fait rien :
     * il n'apparaissait avant nulle part dans `Blockly.Python.workspaceToCode`
     * qu'en tête de programme (un bloc `boucle_infinie`/`lorsque_...` orphelin
     * n'a pas de code propre hors de son DO, donc rien ne s'exécutait), ce qui
     * pouvait laisser croire à tort qu'il était actif. Demandé par
     * l'utilisateur : l'afficher visuellement désactivé (grisé/hachuré,
     * rendu Blockly standard) via `setEnabled()`, qui a aussi pour effet
     * d'exclure le bloc — et tout ce qu'il contient — de la génération de
     * code (`Generator.blockToCode` saute les blocs désactivés). Un seul
     * passage sur tous les blocs (pas seulement les blocs de haut niveau) :
     * `getRootBlock()` remonte jusqu'à l'ancêtre commun quel que soit le
     * type d'emboîtement (pile "suivant", entrée d'instruction, entrée de
     * valeur), donc un bloc qui devient correctement accroché est
     * automatiquement réactivé au prochain passage, sans cas particulier.
     *
     * Ne réagit qu'aux TRANSITIONS (orphelin ↔ rattaché), pas à chaque appel :
     * un premier jet forçait `setEnabled(actif)` à chaque passage, donc sur
     * CHAQUE changement de l'espace de travail — y compris le menu contextuel
     * natif de Blockly « Activer/Désactiver le bloc », dont le clic déclenche
     * lui-même un changement, aussitôt écrasé au passage suivant. Signalé par
     * l'utilisateur : « la fonction Activer le bloc n'a pas l'air de
     * fonctionner » — en fait le clic fonctionnait bel et bien, mais ce
     * correctif le rétablissait desactivé une fraction de seconde plus tard,
     * silencieusement. Pire : un bloc correctement accroché mais désactivé À
     * LA MAIN (pour le mettre de côté sans le retirer) se retrouvait réactivé
     * de force au même titre, cassant cette fonctionnalité native de Blockly
     * pour TOUT bloc, pas seulement les orphelins. Mémoriser le dernier état
     * structurel connu de chaque bloc (`legitimeOrphelin_`, propriété posée
     * directement dessus) permet de ne forcer `setEnabled()` que lorsque cet
     * état vient de changer (accroché → détaché, ou l'inverse) ; entre deux
     * transitions, l'état choisi par l'utilisateur — via le menu contextuel —
     * reste intact.
     */
    function mettreAJourBlocsOrphelins() {
        for (const bloc of window.workspace.getAllBlocks(false)) {
            const legitime = estContainerLegitime(bloc.getRootBlock());
            const etaitLegitime = bloc.legitimeOrphelin_;
            if (etaitLegitime === undefined || legitime !== etaitLegitime) {
                bloc.setEnabled(legitime);
            }
            bloc.legitimeOrphelin_ = legitime;
        }
    }
    window.blocsOrphelinsTest = { estContainerLegitime, mettreAJourBlocsOrphelins };
    // Expose aussi pour les verifications de la reconstruction (voir plus
    // bas) : les connexions de blocs posees par programme (tests) ne
    // declenchent pas toujours le change listener qui met a jour
    // window.currentPythonCode, contrairement a un vrai glisser-deposer.
    window.genererCodeTest = genererCodeDepuisBlocs;

    function updatePythonCode() {
        mettreAJourBlocsOrphelins();
        const codePython = genererCodeDepuisBlocs();
        // Pendant l'edition manuelle, les blocs restent geles (voile-blocs-figes)
        // donc ce listener ne devrait pas se declencher — filet de securite au
        // cas ou un evenement de workspace echapperait au gel.
        if (editionManuelleActive) return;
        definirCodeActuel(codePython);
        afficherTranscription(codePython);
    }
    window.workspace.addChangeListener(updatePythonCode);
    updatePythonCode();

    // ------------------------------------------
    // ANNULER / REFAIRE
    // ------------------------------------------
    // Blockly gere deja sa propre pile annuler/refaire (et les raccourcis
    // clavier Ctrl+Z / Ctrl+Maj+Z) ; ces deux boutons ne font qu'exposer
    // `workspace.undo()` dans la barre d'outils, avec le meme grisage que
    // les autres boutons desactives (`disabled`, pas la classe `.inactif`
    // qui sert aux boutons a bascule comme le theme).
    const boutonAnnuler = document.getElementById('btn-annuler');
    const boutonRefaire = document.getElementById('btn-refaire');
    function mettreAJourAnnulerRefaire() {
        if (boutonAnnuler) boutonAnnuler.disabled = window.workspace.getUndoStack().length === 0;
        if (boutonRefaire) boutonRefaire.disabled = window.workspace.getRedoStack().length === 0;
    }
    // `workspace.undo()` déclenche bien le change listener général, mais
    // celui-ci s'exécute avant que la pile inverse (refaire) ne soit à jour :
    // constaté en testant un aller-retour annuler/refaire complet, où le
    // bouton restait grisé à tort. On rafraîchit donc aussi explicitement
    // juste après l'appel, en plus du change listener pour les autres cas
    // (glisser un bloc, etc.).
    if (boutonAnnuler) boutonAnnuler.addEventListener('click', () => {
        window.workspace.undo(false);
        mettreAJourAnnulerRefaire();
    });
    if (boutonRefaire) boutonRefaire.addEventListener('click', () => {
        window.workspace.undo(true);
        mettreAJourAnnulerRefaire();
    });
    window.workspace.addChangeListener(mettreAJourAnnulerRefaire);
    mettreAJourAnnulerRefaire();

    // ------------------------------------------
    // ÉDITION MANUELLE DU CODE
    // ------------------------------------------
    // Blockly sait transformer des blocs en Python, jamais l'inverse de façon
    // fiable : du code tapé à la main ne peut donc pas revenir en blocs. Le
    // compromis retenu est un mode exclusif — soit les blocs pilotent le code
    // (comme avant), soit une saisie manuelle le remplace entièrement, jamais
    // les deux en même temps. « Revenir aux blocs » abandonne la saisie et
    // resynchronise sur ce que les blocs décrivent à cet instant.

    const btnEditerCode = document.getElementById('btn-editer-code');
    const zoneCodeAffichage = document.getElementById('code-display');
    const zoneCodeTexte = document.getElementById('code-edit');
    const banniereEdition = document.getElementById('banniere-edition-code');
    const voileBlocsFiges = document.getElementById('voile-blocs-figes');

    function entrerEditionManuelle() {
        editionManuelleActive = true;
        zoneCodeAffichage.style.display = 'none';
        zoneCodeTexte.classList.add('visible');
        zoneCodeTexte.value = window.currentPythonCode;
        banniereEdition.classList.add('visible');
        voileBlocsFiges.classList.add('visible');
        btnEditerCode.textContent = '↩ Revenir aux blocs';
        btnEditerCode.classList.add('actif');
        btnEditerCode.title = 'Abandonner la saisie manuelle et revenir au code généré par les blocs';
        zoneCodeTexte.focus();
    }

    function sortirEditionManuelle() {
        editionManuelleActive = false;
        zoneCodeTexte.classList.remove('visible');
        zoneCodeAffichage.style.display = '';
        banniereEdition.classList.remove('visible');
        voileBlocsFiges.classList.remove('visible');
        btnEditerCode.textContent = '✎ Éditer';
        btnEditerCode.classList.remove('actif');
        btnEditerCode.title = 'Saisir du code MicroPython à la main';

        const codePython = genererCodeDepuisBlocs();
        definirCodeActuel(codePython);
        afficherTranscription(codePython);
    }

    if (btnEditerCode) {
        btnEditerCode.addEventListener('click', () => {
            if (editionManuelleActive) sortirEditionManuelle(); else entrerEditionManuelle();
        });
    }
    if (zoneCodeTexte) {
        zoneCodeTexte.addEventListener('input', () => definirCodeActuel(zoneCodeTexte.value));
    }

    // Expose pour les verifications : taper dans un textarea ne se simule pas
    // depuis la console comme un clic.
    window.editionCodeTest = {
        activer: entrerEditionManuelle,
        desactiver: sortirEditionManuelle,
        estActif: () => editionManuelleActive,
        saisir: texte => { zoneCodeTexte.value = texte; definirCodeActuel(texte); }
    };

    // ------------------------------------------
    // NOUVEAU PROJET — menu "Fichier"
    // ------------------------------------------
    // Demande de l'utilisateur. Efface les blocs actuels et recharge l'espace
    // de depart (« Au démarrage » + « Répéter indéfiniment »), comme au tout
    // premier chargement de la page — confirmation prealable car rien n'est
    // jamais sauvegarde automatiquement (voir aussi la confirmation de
    // fermeture juste apres, meme raison).
    const nouveauProjetBtn = document.getElementById('nouveau-projet-btn');
    if (nouveauProjetBtn) {
        nouveauProjetBtn.addEventListener('click', () => {
            const confirme = window.confirm(
                'Créer un nouveau projet ? Le programme actuel sera perdu ' +
                '(téléchargez-le avant si vous voulez le garder).'
            );
            if (!confirme) return;
            if (editionManuelleActive) sortirEditionManuelle();
            window.workspace.clear();
            window.workspace.clearUndo();
            chargerEspaceDeDepart();
            definirNomFichier('');
            afficherEtat('Nouveau projet créé.', false);
        });
    }

    // ------------------------------------------
    // CONFIRMATION A LA FERMETURE DE L'ONGLET/FENETRE
    // ------------------------------------------
    // Demande de l'utilisateur : « Etes-vous sûr ? » avant de fermer l'appli.
    // Aucune sauvegarde automatique (le programme est perdu au rechargement,
    // voir readme.txt) : ce filet de securite couvre la fermeture de
    // l'onglet/fenetre, le rechargement (F5) et toute navigation qui quitte
    // la page. Les navigateurs modernes ignorent le texte passe ici et
    // affichent systematiquement leur propre message generique (« Quitter
    // le site ? »/« Leave site? »), par securite — pour empecher un site de
    // faire croire a un faux message trompeur — donc le texte exact demande
    // par l'utilisateur ne peut pas s'afficher tel quel, seul le PRINCIPE
    // d'une confirmation est reglable ici.
    window.addEventListener('beforeunload', (evenement) => {
        evenement.preventDefault();
        evenement.returnValue = '';
    });

    // ==========================================
    // RECONSTRUCTION DE BLOCS DEPUIS UN FICHIER GÉNÉRÉ PAR CETTE APPLI
    // ==========================================
    // Demande de l'utilisateur : « je veux pouvoir reconstruire les fichiers
    // générés par l'appli » — portée volontairement limitée à CES fichiers-là
    // (pas du Python arbitraire, voir la discussion qui a précédé cette
    // fonctionnalité) : chaque export porte désormais une signature en
    // première ligne, qui déclenche une tentative de reconstruction à
    // l'import. Sans elle (fichier étranger, ou trop ancien), comportement
    // inchangé : édition manuelle directe.
    //
    // Principe : `window.analyserCodePython()` (Brython, index.html) rend le
    // texte importé sous forme d'arbre syntaxique (module `ast` standard,
    // jamais de regex sur le texte — un commentaire ou une indentation
    // différente ne doit pas faire échouer l'analyse). Ce module JS parcourt
    // ensuite cet arbre et tente de faire correspondre chaque instruction/
    // expression à l'un des blocs de ce projet, en s'appuyant sur le fait que
    // CHAQUE générateur (voir plus haut, `P.forBlock[...]`) produit un motif
    // Python fixe et déterministe — jamais deux formulations différentes pour
    // le même bloc. C'est ce qui rend la reconstruction possible : impossible
    // pour du Python quelconque (plusieurs écritures valides n'ont pas de
    // bloc unique correspondant), réaliste seulement parce qu'on sait à
    // l'avance exactement ce que nos propres générateurs produisent.
    //
    // Couverture volontairement partielle : reconnaître les 165 blocs de ce
    // projet un par un est un chantier qui dépasse largement une seule passe
    // (voir l'ampleur déjà mesurée dans le fichier de suivi Excel). Tout ce
    // qui n'est pas encore reconnu retombe sur un bloc générique "code
    // personnalisé" qui garde le fragment Python d'origine tel quel — jamais
    // d'échec silencieux, jamais de code perdu, juste un bloc de moins que
    // l'idéal. La liste de ce qui EST couvert aujourd'hui est documentée
    // dans ETAT_DU_PROJET.md et PROMPT_RECREATION.md.

    const SIGNATURE_MARQUEUR = '# --BLOCKLY-MICROBIT-V2--';
    const SIGNATURE_EXPORT = SIGNATURE_MARQUEUR +
        ' genere par cette appli : reconstruction automatique possible a l\'import\n';

    // ------------------------------------------
    // Bloc de repli : "code personnalisé" (instruction) et son équivalent
    // pour une expression, utilisés partout où l'arbre importé ne correspond
    // à aucun motif reconnu. Une simple boîte de texte, générée telle quelle.
    // ------------------------------------------
    Blockly.Blocks['code_brut'] = { init: function() {
        this.appendDummyInput().appendField("code")
            .appendField(new Blockly.FieldTextInput(''), 'CODE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#5b5b5b');
        this.setTooltip("Fragment de code importé que cette appli ne sait pas encore " +
            "reconvertir en blocs. Le texte Python est conservé tel quel : rien n'est perdu, " +
            "ce fragment se comportera exactement comme dans le fichier importé.");
    }};
    P.forBlock['code_brut'] = function(block) {
        return block.getFieldValue('CODE') + '\n';
    };

    Blockly.Blocks['expression_brute'] = { init: function() {
        this.appendDummyInput().appendField("(")
            .appendField(new Blockly.FieldTextInput(''), 'CODE')
            .appendField(")");
        this.setOutput(true, null);
        this.setColour('#5b5b5b');
        this.setTooltip("Expression importée que cette appli ne sait pas encore reconvertir " +
            "en blocs — le texte Python d'origine est conservé tel quel.");
    }};
    P.forBlock['expression_brute'] = function(block) {
        return [block.getFieldValue('CODE') || '0', P.ORDER_ATOMIC];
    };

    // ------------------------------------------
    // Aides bas niveau sur l'arbre JSON produit par ast_vers_json (Brython)
    // ------------------------------------------
    function estAppel(noeud, nomAttendu) {
        // Appel du style `nom(...)` — func est un Name direct.
        return noeud && noeud._type === 'Call' && noeud.func && noeud.func._type === 'Name' &&
               (!nomAttendu || noeud.func.id === nomAttendu);
    }
    function estAppelAttribut(noeud, objetAttendu, methodeAttendue) {
        // Appel du style `objet.methode(...)`.
        return noeud && noeud._type === 'Call' && noeud.func && noeud.func._type === 'Attribute' &&
               noeud.func.value && noeud.func.value._type === 'Name' &&
               (!objetAttendu || noeud.func.value.id === objetAttendu) &&
               (!methodeAttendue || noeud.func.attr === methodeAttendue);
    }
    /** Retire un habillage `str(...)` s'il est present, sinon renvoie le noeud tel quel. */
    function sansStr(noeud) {
        if (estAppel(noeud, 'str') && noeud.args.length === 1) return noeud.args[0];
        return noeud;
    }
    function valeurConstante(noeud) {
        return noeud && noeud._type === 'Constant' ? noeud.value : undefined;
    }
    /**
     * Certains champs "broche" (servo_angle...)
     * ont des valeurs d'option ("pin0", "pin1"...) séparées sans guillemets
     * dans le générateur — ce sont donc des identifiants Python nus (noeud
     * `Name`) une fois importés, pas des chaînes littérales (`Constant`).
     * Vérifié en comparant le code réellement généré par ces blocs, pas
     * deviné depuis la lecture du générateur seule (une première version
     * de ce fichier s'était trompée sur ce point précis).
     */
    function identifiantNom(noeud) {
        return noeud && noeud._type === 'Name' ? noeud.id : undefined;
    }

    /** L'inverse exact de conditionBouton() (voir plus haut) : trois motifs fixes. */
    function inverserConditionBouton(noeud) {
        const estPressA = n => n && n._type === 'Call' && n.func && n.func._type === 'Attribute' &&
            n.func.value && n.func.value._type === 'Name' && n.func.value.id === 'button_a' && n.func.attr === 'is_pressed';
        const estPressB = n => n && n._type === 'Call' && n.func && n.func._type === 'Attribute' &&
            n.func.value && n.func.value._type === 'Name' && n.func.value.id === 'button_b' && n.func.attr === 'is_pressed';
        if (estPressA(noeud)) return 'a';
        if (estPressB(noeud)) return 'b';
        if (noeud && noeud._type === 'BoolOp' && noeud.op && noeud.op._type === 'And' &&
            noeud.values && noeud.values.length === 2 &&
            estPressA(noeud.values[0]) && estPressB(noeud.values[1])) return 'ab';
        return null;
    }

    // ------------------------------------------
    // Reconstruction des EXPRESSIONS (valeurs) — table + cas particuliers
    // ------------------------------------------
    /** Blocs "litteraux" natifs de Blockly, pour un Constant Python. */
    function reconstruireLitteral(noeud) {
        const v = valeurConstante(noeud);
        if (typeof v === 'number') return { type: 'math_number', fields: { NUM: String(v) } };
        if (typeof v === 'string') return { type: 'text', fields: { TEXT: v } };
        if (typeof v === 'boolean') return { type: 'logic_boolean', fields: { BOOL: v ? 'TRUE' : 'FALSE' } };
        return null;
    }

    const OP_ARITH = { Add: 'ADD', Sub: 'MINUS', Mult: 'MULTIPLY', Div: 'DIVIDE' };
    const OP_COMPARE = { Eq: 'EQ', NotEq: 'NEQ', Lt: 'LT', LtE: 'LTE', Gt: 'GT', GtE: 'GTE' };
    const OP_BOOL = { And: 'AND', Or: 'OR' };

    /** Appels Python `nom(...)` -> bloc de valeur, pour les blocs les plus simples. */
    const APPELS_VALEUR_SIMPLES = {
        // fonction Python : [type de bloc, [ordre des ENTREES de valeur (une seule ici, ou aucune)]]
        'abs': ['math_absolue', ['NUM']],
        '_grove_distance_cm': ['grove_ultrason_cm', []],
        '_grove_distance_pouces': ['grove_ultrason_pouces', []],
    };
    /** Idem, mais le premier argument est un CHAMP texte (menu deroulant), pas une valeur. */
    const APPELS_VALEUR_AVEC_CHAMP = {
    };

    function reconstruireExpression(noeud) {
        if (!noeud) return { type: 'logic_null' };

        const litteral = reconstruireLitteral(noeud);
        if (litteral) return litteral;

        // Avant les cas generiques : `_ia_qr_texte` n'est pas une variable, `_ia_dernier[...] == "x"`
        // n'est pas une simple comparaison.
        const ia = reconstruireExpressionIA(noeud);
        if (ia) return ia;
        const grove = reconstruireExpressionGrove(noeud);
        if (grove) return grove;

        if (noeud._type === 'Name') {
            // Variable Blockly : le nom sert aussi d'identifiant Blockly, une
            // variable de meme nom deja existante est reutilisee sinon creee.
            try {
                window.workspace.createVariable(noeud.id);
            } catch (erreur) { /* deja existante : tant mieux */ }
            return { type: 'variables_get', fields: { VAR: { name: noeud.id } } };
        }

        if (noeud._type === 'BinOp' && OP_ARITH[noeud.op._type]) {
            return { type: 'math_arithmetic', fields: { OP: OP_ARITH[noeud.op._type] },
                inputs: { A: { block: reconstruireExpression(noeud.left) },
                          B: { block: reconstruireExpression(noeud.right) } } };
        }
        if (noeud._type === 'Compare' && noeud.ops.length === 1 && OP_COMPARE[noeud.ops[0]._type]) {
            return { type: 'logic_compare', fields: { OP: OP_COMPARE[noeud.ops[0]._type] },
                inputs: { A: { block: reconstruireExpression(noeud.left) },
                          B: { block: reconstruireExpression(noeud.comparators[0]) } } };
        }
        if (noeud._type === 'BoolOp' && OP_BOOL[noeud.op._type] && noeud.values.length === 2) {
            return { type: 'logic_operation', fields: { OP: OP_BOOL[noeud.op._type] },
                inputs: { A: { block: reconstruireExpression(noeud.values[0]) },
                          B: { block: reconstruireExpression(noeud.values[1]) } } };
        }
        if (noeud._type === 'UnaryOp' && noeud.op._type === 'Not') {
            return { type: 'logic_negate', inputs: { BOOL: { block: reconstruireExpression(noeud.operand) } } };
        }
        // Un nombre negatif ("-100") n'est PAS un Constant negatif en Python :
        // c'est un UnaryOp(USub) enveloppant un Constant positif. Sans ce cas,
        // -100 tombait dans le repli generique (verifie sur un round-trip reel).
        if (noeud._type === 'UnaryOp' && noeud.op._type === 'USub' &&
            typeof valeurConstante(noeud.operand) === 'number') {
            return { type: 'math_number', fields: { NUM: String(-valeurConstante(noeud.operand)) } };
        }

        const boutonExpr = inverserConditionBouton(noeud);
        if (boutonExpr) return { type: 'bouton_est_appuye', fields: { BOUTON: boutonExpr } };

        if (estAppelAttribut(noeud, 'accelerometer', 'get_strength') && noeud.args.length === 0) {
            return { type: 'capteur_acceleration', fields: { AXIS: 'strength' } };
        }
        if (noeud._type === 'Call' && noeud.func._type === 'Attribute' &&
            noeud.func.value && noeud.func.value._type === 'Name' && noeud.func.value.id === 'accelerometer' &&
            /^get_[xyz]$/.test(noeud.func.attr) && noeud.args.length === 0) {
            return { type: 'capteur_acceleration', fields: { AXIS: noeud.func.attr.slice(4) } };
        }
        if (estAppelAttribut(noeud, 'display', 'read_light_level') && noeud.args.length === 0) {
            return { type: 'capteur_luminosite' };
        }

        if (noeud._type === 'Call' && noeud.func._type === 'Name') {
            const nomFonction = noeud.func.id;
            if (APPELS_VALEUR_SIMPLES[nomFonction]) {
                const [typeBloc, entrees] = APPELS_VALEUR_SIMPLES[nomFonction];
                const inputs = {};
                entrees.forEach((nomEntree, i) => {
                    inputs[nomEntree] = { block: reconstruireExpression(noeud.args[i]) };
                });
                return { type: typeBloc, inputs };
            }
            // _grove_potentiometre(pinX, "unite"), _grove_lumiere(pinX, "unite") : broche nue et unite en texte.
            const AVEC_UNITE = { '_grove_potentiometre': 'grove_potentiometre', '_grove_lumiere': 'grove_lumiere' };
            if (AVEC_UNITE[nomFonction] && noeud.args.length === 2 &&
                identifiantNom(noeud.args[0]) !== undefined && typeof valeurConstante(noeud.args[1]) === 'string') {
                return { type: AVEC_UNITE[nomFonction], fields: { BROCHE: identifiantNom(noeud.args[0]), UNITE: valeurConstante(noeud.args[1]) } };
            }
            // _grove_bouton(pinX), _grove_pir(pinX) : une broche nue.
            const SUR_BROCHE = { '_grove_bouton': 'grove_bouton_appuye', '_grove_pir': 'grove_pir' };
            if (SUR_BROCHE[nomFonction] && noeud.args.length === 1 && identifiantNom(noeud.args[0]) !== undefined) {
                return { type: SUR_BROCHE[nomFonction], fields: { BROCHE: identifiantNom(noeud.args[0]) } };
            }
            if (APPELS_VALEUR_AVEC_CHAMP[nomFonction] && noeud.args.length === 1) {
                const [typeBloc, nomChamp] = APPELS_VALEUR_AVEC_CHAMP[nomFonction];
                const v = valeurConstante(noeud.args[0]);
                if (typeof v === 'string') return { type: typeBloc, fields: { [nomChamp]: v } };
            }
        }

        // Repli : rien reconnu. `_source` (voir _ast_vers_json, index.html)
        // porte le texte Python EXACT de ce noeud, jamais un texte reconstruit.
        return { type: 'expression_brute', fields: { CODE: noeud._source || '0' } };
    }

    // ------------------------------------------
    // Reconstruction des INSTRUCTIONS — table + cas particuliers
    // ------------------------------------------
    /** `nom(champ_texte, valeur)` -> bloc, le plus frequent des motifs. */
    const APPELS_INSTRUCTION_CHAMP_VALEUR = {
    };
    /** `nom(valeur)` -> bloc, une seule entree de valeur. */
    const APPELS_INSTRUCTION_VALEUR = {
    };
    /** `nom()` -> bloc, aucun argument. */
    const APPELS_INSTRUCTION_SIMPLES = {
    };
    /** `nom(champ1, champ2)` -> bloc, deux champs litteraux (pas des valeurs). */

    /**
     * Tente de faire correspondre l'instruction en tete de `liste[i]` (et
     * eventuellement les suivantes) a un bloc connu. Renvoie soit
     * {bloc, consommees} (bloc JSON Blockly + nombre d'instructions
     * absorbees, au moins 1), soit null si rien ne correspond ici — auquel
     * cas l'appelant retombe sur le bloc "code personnalisé" générique.
     */
    function reconstruireInstructionUnique(liste, i) {
        const n = liste[i];

        // ---- import X / from Y import * : pur passe-partout, jamais posé
        // par l'utilisateur lui-même — chaque bloc qui en a besoin
        // réinjecte lui-même son import (importerMicrobit(), importerModule(),
        // piloteXxx()...) dès qu'on le repose. L'afficher comme un bloc
        // "code personnalisé" ne ferait qu'encombrer le haut du programme
        // reconstruit sans rien apporter — `bloc: null` fait sauter
        // l'instruction plutôt que de générer un bloc pour elle (voir
        // reconstruireListeInstructions). ----
        if (n._type === 'Import' || n._type === 'ImportFrom') {
            return { bloc: null, consommees: 1 };
        }
        // ---- pass : ecrit par le generateur pour un corps de bloc VIDE (« lorsque… » sans
        // rien dedans, « si » vide) ; un corps vide le redonne tout seul. ----
        if (n._type === 'Pass') {
            return { bloc: null, consommees: 1 };
        }

        // ---- Assign : reset_chrono, modules Grove ----
        if (n._type === 'Assign' && n.targets.length === 1) {
            const cible = n.targets[0];
            // _grove_objets["pca9685"] = _PiloteServos(0x7F ou 0x40) : bloc « initialiser le pilote 16 servos ».
            if (cible._type === 'Subscript' && cible.value._type === 'Name' && cible.value.id === '_grove_objets' &&
                valeurConstante(cible.slice) === 'pca9685' && estAppel(n.value, '_PiloteServos') && n.value.args.length === 1 &&
                (valeurConstante(n.value.args[0]) === 0x7F || valeurConstante(n.value.args[0]) === 0x40)) {
                return { bloc: { type: 'grove_pca_init', fields: { ADRESSE: valeurConstante(n.value.args[0]) === 0x40 ? '0x40' : '0x7F' } },
                         consommees: 1 };
            }
            // _grove_objets["oled"] = _EcranOLED() : bloc « initialiser l'ecran OLED ».
            if (cible._type === 'Subscript' && cible.value._type === 'Name' && cible.value.id === '_grove_objets' &&
                valeurConstante(cible.slice) === 'oled' && estAppel(n.value, '_EcranOLED')) {
                return { bloc: { type: 'grove_oled_init' }, consommees: 1 };
            }
            if (cible._type === 'Name' && cible.id === '_timer_start' &&
                estAppel(n.value, 'running_time')) {
                return { bloc: { type: 'reset_chrono' }, consommees: 1 };
            }
            return null;
        }

        if (n._type !== 'Expr') return null;
        const appel = n.value;

        // ---- _ia_traiter(), _radio_traiter(), _ir_traiter() : scrutation injectee
        // automatiquement en tete de « Répéter indéfiniment » (voir GESTIONNAIRES),
        // jamais posee par l'utilisateur : sautee, comme les imports. ----
        if (appel._type === 'Call' && appel.func._type === 'Name' && appel.args.length === 0 &&
            ['_ia_traiter', '_radio_traiter', '_ir_traiter'].includes(appel.func.id)) {
            return { bloc: null, consommees: 1 };
        }

        // ---- pinX.set_touch_mode(pinX.CAPACITIVE) : pur passe-partout
        // injecte automatiquement par lorsque_broche/broche_est_pressee
        // (voir activerToucheCapacitive plus haut), jamais pose par
        // l'utilisateur lui-meme - meme traitement que les imports
        // (bloc: null) : sauter l'instruction plutot que de generer un
        // bloc "code personnalisé" pour elle. ----
        if (estAppelAttribut(appel, null, 'set_touch_mode') && appel.args.length === 1 &&
            ['pin0', 'pin1', 'pin2'].includes(appel.func.value.id) &&
            appel.args[0]._type === 'Attribute' && appel.args[0].value._type === 'Name' &&
            appel.args[0].value.id === appel.func.value.id && appel.args[0].attr === 'CAPACITIVE') {
            return { bloc: null, consommees: 1 };
        }

        // ---- Deuxieme lot Grove : barre de LED, horloge, pilote 16 servos ----
        let mg;
        if ((mg = appelMethodeGrove(appel, '_grove_barre')) && mg[2].length === 2 &&
            identifiantNom(mg[2][0]) !== undefined && identifiantNom(mg[2][1]) !== undefined) {
            const port = identifiantNom(mg[2][0]) + ', ' + identifiantNom(mg[2][1]);
            if (mg[0] === 'niveau' && mg[1].length === 1) {
                return { bloc: { type: 'grove_barre_niveau', fields: { PORT: port },
                                 inputs: { NIVEAU: { block: reconstruireExpression(mg[1][0]) } } }, consommees: 1 };
            }
            if (mg[0] === 'led' && mg[1].length === 2 && (valeurConstante(mg[1][1]) === 0 || valeurConstante(mg[1][1]) === 1)) {
                return { bloc: { type: 'grove_barre_led', fields: { PORT: port, ETAT: String(valeurConstante(mg[1][1])) },
                                 inputs: { LED: { block: reconstruireExpression(mg[1][0]) } } }, consommees: 1 };
            }
        }
        if ((mg = appelMethodeGrove(appel, '_grove_rtc')) && mg[0] === 'regler' && mg[1].length === 6) {
            const noms = ['ANNEE', 'MOIS', 'JOUR', 'HEURE', 'MINUTE', 'SECONDE'], inputs = {};
            noms.forEach((nom, i) => { inputs[nom] = { block: reconstruireExpression(mg[1][i]) }; });
            return { bloc: { type: 'grove_rtc_regler', inputs }, consommees: 1 };
        }
        if ((mg = appelMethodeGrove(appel, '_grove_servos')) && mg[1].length === 2 && (mg[0] === 'angle' || mg[0] === 'continu')) {
            return { bloc: { type: mg[0] === 'angle' ? 'grove_pca_angle' : 'grove_pca_continu', inputs: {
                VOIE: { block: reconstruireExpression(mg[1][0]) },
                [mg[0] === 'angle' ? 'ANGLE' : 'VITESSE']: { block: reconstruireExpression(mg[1][1]) } } }, consommees: 1 };
        }

        // ---- Premier lot Grove : _grove_buzzer / _grove_relais(pinX, 0 ou 1), _grove_buzzer_bip(pinX, duree),
        // _grove_oled().texte(texte, x, y) et _grove_oled().effacer(). ----
        if (appel._type === 'Call' && appel.func._type === 'Attribute' && estAppel(appel.func.value, '_grove_oled')) {
            if (appel.func.attr === 'effacer' && appel.args.length === 0) {
                return { bloc: { type: 'grove_oled_effacer' }, consommees: 1 };
            }
            if (appel.func.attr === 'texte' && appel.args.length === 3) {
                return { bloc: { type: 'grove_oled_texte', inputs: {
                    TEXTE: { block: reconstruireExpression(sansStr(appel.args[0])) },
                    X: { block: reconstruireExpression(appel.args[1]) },
                    Y: { block: reconstruireExpression(appel.args[2]) } } }, consommees: 1 };
            }
        }
        if (appel._type === 'Call' && appel.func._type === 'Name' && appel.args.length === 2 &&
            identifiantNom(appel.args[0]) !== undefined) {
            const broche = identifiantNom(appel.args[0]), etat = valeurConstante(appel.args[1]);
            if ((appel.func.id === '_grove_buzzer' || appel.func.id === '_grove_relais') && (etat === 0 || etat === 1)) {
                return { bloc: { type: appel.func.id === '_grove_buzzer' ? 'grove_buzzer_etat' : 'grove_relais',
                                 fields: { BROCHE: broche, ETAT: String(etat) } }, consommees: 1 };
            }
            if (appel.func.id === '_grove_buzzer_bip') {
                return { bloc: { type: 'grove_buzzer_bip', fields: { BROCHE: broche },
                                 inputs: { DUREE: { block: reconstruireExpression(appel.args[1]) } } }, consommees: 1 };
            }
        }

        // ---- attendre_temps : sleep(x) ou sleep(x * 1000) ----
        if (estAppel(appel, 'sleep') && appel.args.length === 1) {
            const arg = appel.args[0];
            if (arg._type === 'BinOp' && arg.op._type === 'Mult' && valeurConstante(arg.right) === 1000) {
                return { bloc: { type: 'attendre_temps', fields: { UNITE: 's' },
                    inputs: { TEMPS: { block: reconstruireExpression(arg.left) } } }, consommees: 1 };
            }
            return { bloc: { type: 'attendre_temps', fields: { UNITE: 'ms' },
                inputs: { TEMPS: { block: reconstruireExpression(arg) } } }, consommees: 1 };
        }

        // ---- print(x) : afficher_console ----
        if (estAppel(appel, 'print') && appel.args.length === 1 && !(appel.keywords && appel.keywords.length)) {
            return { bloc: { type: 'afficher_console', inputs: { VALEUR: { block: reconstruireExpression(appel.args[0]) } } }, consommees: 1 };
        }

        // ---- display.show/scroll/clear ----
        if (estAppelAttribut(appel, 'display', 'show') && appel.args.length === 1) {
            return { bloc: { type: 'afficher_valeur', inputs: { VALEUR: { block: reconstruireExpression(sansStr(appel.args[0])) } } }, consommees: 1 };
        }
        if (estAppelAttribut(appel, 'display', 'scroll') && appel.args.length === 1) {
            return { bloc: { type: 'faire_defiler', inputs: { VALEUR: { block: reconstruireExpression(sansStr(appel.args[0])) } } }, consommees: 1 };
        }
        if (estAppelAttribut(appel, 'display', 'clear') && appel.args.length === 0) {
            return { bloc: { type: 'effacer_ecran' }, consommees: 1 };
        }

        // ---- audio / radio (methodes d'objet) ----
        if (estAppelAttribut(appel, 'audio', 'play') && appel.args.length === 1 &&
            appel.args[0]._type === 'Attribute' && appel.args[0].value._type === 'Name' && appel.args[0].value.id === 'Sound') {
            return { bloc: { type: 'audio_jouer', fields: { SON: appel.args[0].attr } }, consommees: 1 };
        }
        if (estAppelAttribut(appel, 'audio', 'stop') && appel.args.length === 0) {
            return { bloc: { type: 'audio_arreter' }, consommees: 1 };
        }
        if (estAppelAttribut(appel, 'radio', 'on') && appel.args.length === 0) {
            return { bloc: { type: 'radio_activer' }, consommees: 1 };
        }
        if (estAppelAttribut(appel, 'radio', 'send') && appel.args.length === 1) {
            return { bloc: { type: 'radio_envoyer_texte', inputs: { MESSAGE: { block: reconstruireExpression(sansStr(appel.args[0])) } } }, consommees: 1 };
        }
        if (estAppelAttribut(appel, 'radio', 'config') && appel.keywords && appel.keywords.length === 1 &&
            appel.keywords[0].arg === 'group') {
            return { bloc: { type: 'radio_groupe', inputs: { GROUPE: { block: reconstruireExpression(appel.keywords[0].value) } } }, consommees: 1 };
        }

        // ---- servo ----
        if (estAppel(appel, '_servo_angle') && appel.args.length === 3) {
            const broche = identifiantNom(appel.args[0]);
            if (broche !== undefined) {
                return { bloc: { type: 'servo_angle', fields: { BROCHE: broche },
                    inputs: { ANGLE: { block: reconstruireExpression(appel.args[2]) } } }, consommees: 1 };
            }
        }
        if (estAppel(appel, '_servo_arreter') && appel.args.length === 2) {
            const broche = identifiantNom(appel.args[0]);
            if (broche !== undefined) return { bloc: { type: 'servo_arreter', fields: { BROCHE: broche } }, consommees: 1 };
        }

        // ---- grove_ruban_couleur : DEUX instructions consommees d'un coup ----
        // COULEUR est un CHAMP (menu deroulant, valeurs hexadecimales fixes
        // "0xRRGGBB"), pas une entree de valeur — a la difference de la
        // plupart des autres blocs Grove. Verifie en generant reellement le
        // bloc plutot que suppose : `ast` transforme un litteral hexadecimal
        // Python en un entier decimal (Constant.value), d'ou la table de
        // correspondance plutot qu'une reconversion en base 16 a la main
        // (qui ne retrouverait pas forcement la meme casse/notation).
        if (appel._type === 'Call' && appel.func._type === 'Attribute' && appel.func.attr === 'fill' &&
            estAppel(appel.func.value, '_grove_ruban') && appel.args.length === 1 &&
            estAppel(appel.args[0], '_grove_teinte') && appel.args[0].args.length === 1) {
            const suivante = liste[i + 1];
            // `_grove_ruban().show()` : l'objet ("func.value") est lui-meme
            // un appel a _grove_ruban(), pas un simple nom — estAppelAttribut
            // ne couvre que le cas "nom.methode()", d'ou la verification directe.
            const suiteValide = suivante && suivante._type === 'Expr' && suivante.value._type === 'Call' &&
                suivante.value.func._type === 'Attribute' && suivante.value.func.attr === 'show' &&
                suivante.value.args.length === 0 && estAppel(suivante.value.func.value, '_grove_ruban');
            const valeurCouleur = valeurConstante(appel.args[0].args[0]);
            const optionCouleur = COULEURS_GROVE.find(([, hex]) => Number(hex) === valeurCouleur);
            if (suiteValide && optionCouleur) {
                return { bloc: { type: 'grove_ruban_couleur', fields: { COULEUR: optionCouleur[1] } }, consommees: 2 };
            }
        }
        if (appel._type === 'Call' && appel.func._type === 'Attribute' && appel.func.attr === 'clear' &&
            estAppel(appel.func.value, '_grove_ruban') && appel.args.length === 0) {
            return { bloc: { type: 'grove_ruban_effacer' }, consommees: 1 };
        }

        // ---- appels simples par table ----
        if (appel._type === 'Call' && appel.func._type === 'Name') {
            const nomFonction = appel.func.id;
            if (APPELS_INSTRUCTION_SIMPLES[nomFonction] && appel.args.length === 0) {
                return { bloc: { type: APPELS_INSTRUCTION_SIMPLES[nomFonction] }, consommees: 1 };
            }
            if (APPELS_INSTRUCTION_VALEUR[nomFonction] && appel.args.length === 1) {
                const [typeBloc, nomEntree] = APPELS_INSTRUCTION_VALEUR[nomFonction];
                return { bloc: { type: typeBloc, inputs: { [nomEntree]: { block: reconstruireExpression(appel.args[0]) } } }, consommees: 1 };
            }
            if (APPELS_INSTRUCTION_CHAMP_VALEUR[nomFonction] && appel.args.length === 2) {
                const [typeBloc, nomChamp, nomEntree] = APPELS_INSTRUCTION_CHAMP_VALEUR[nomFonction];
                const champ = valeurConstante(appel.args[0]);
                if (typeof champ === 'string') {
                    return { bloc: { type: typeBloc, fields: { [nomChamp]: champ },
                        inputs: { [nomEntree]: { block: reconstruireExpression(appel.args[1]) } } }, consommees: 1 };
                }
            }
        }

        return null;
    }

    /** If dont le test correspond a un des blocs "si ... alors" a une seule branche. */
    function reconstruireSiSpecial(noeud) {
        if (noeud.orelse && noeud.orelse.length) return null; // ces blocs n'ont pas de "sinon"
        const boutonIf = inverserConditionBouton(noeud.test);
        if (boutonIf) return { type: 'si_bouton_appuye', fields: { BOUTON: boutonIf },
            inputs: { DO: { block: reconstruireListeInstructions(noeud.body) } } };
        if (estAppelAttribut(noeud.test, 'pin_logo', 'is_touched') && noeud.test.args.length === 0) {
            return { type: 'si_logo_touche', inputs: { DO: { block: reconstruireListeInstructions(noeud.body) } } };
        }
        if (estAppelAttribut(noeud.test, 'accelerometer', 'was_gesture') && noeud.test.args.length === 1 &&
            valeurConstante(noeud.test.args[0]) === 'shake') {
            return { type: 'si_secoue_alors', inputs: { DO: { block: reconstruireListeInstructions(noeud.body) } } };
        }
        return null;
    }

    /** `while not (<cond>): sleep(10)` -> attendre_jusqua. */
    function reconstruireAttendreJusqua(noeud) {
        if (noeud._type !== 'While') return null;
        if (!(noeud.test._type === 'UnaryOp' && noeud.test.op._type === 'Not')) return null;
        if (!(noeud.body.length === 1 && noeud.body[0]._type === 'Expr' &&
              estAppel(noeud.body[0].value, 'sleep') && noeud.body[0].value.args.length === 1 &&
              valeurConstante(noeud.body[0].value.args[0]) === 10)) return null;
        return { type: 'attendre_jusqua', inputs: { CONDITION: { block: reconstruireExpression(noeud.test.operand) } } };
    }

    /** controls_if standard (Blockly natif), y compris elif/else en cascade. */
    function reconstruireControlsIf(noeud) {
        if (noeud._type !== 'If') return null;
        const mutation = { elseIfCount: 0, hasElse: false };
        const conditions = [noeud.test];
        const branches = [noeud.body];
        let reste = noeud.orelse;
        while (reste && reste.length === 1 && reste[0]._type === 'If') {
            mutation.elseIfCount++;
            conditions.push(reste[0].test);
            branches.push(reste[0].body);
            reste = reste[0].orelse;
        }
        const inputs = {};
        conditions.forEach((cond, idx) => { inputs['IF' + idx] = { block: reconstruireExpression(cond) }; });
        branches.forEach((corps, idx) => { inputs['DO' + idx] = { block: reconstruireListeInstructions(corps) }; });
        if (reste && reste.length) {
            mutation.hasElse = true;
            inputs['ELSE'] = { block: reconstruireListeInstructions(reste) };
        }
        return { type: 'controls_if', extraState: mutation, inputs };
    }

    /** controls_whileUntil natif : while <t> / while not <t>. */
    function reconstruireControlsWhile(noeud) {
        if (noeud._type !== 'While' || (noeud.orelse && noeud.orelse.length)) return null;
        if (noeud.test._type === 'UnaryOp' && noeud.test.op._type === 'Not') {
            return { type: 'controls_whileUntil', fields: { MODE: 'UNTIL' },
                inputs: { BOOL: { block: reconstruireExpression(noeud.test.operand) },
                          DO: { block: reconstruireListeInstructions(noeud.body) } } };
        }
        return { type: 'controls_whileUntil', fields: { MODE: 'WHILE' },
            inputs: { BOOL: { block: reconstruireExpression(noeud.test) },
                      DO: { block: reconstruireListeInstructions(noeud.body) } } };
    }

    /** controls_repeat_ext natif : `for count in range(<n>): ...` (nom de variable fixe cote Blockly). */
    function reconstruireControlsRepeat(noeud) {
        if (noeud._type !== 'For') return null;
        if (!(noeud.target._type === 'Name' && /^count\d*$/.test(noeud.target.id))) return null;
        if (!estAppel(noeud.iter, 'range') || noeud.iter.args.length !== 1) return null;
        return { type: 'controls_repeat_ext',
            inputs: { TIMES: { block: reconstruireExpression(noeud.iter.args[0]) },
                      DO: { block: reconstruireListeInstructions(noeud.body) } } };
    }

    /** FunctionDef `on_xxx_yyy` -> bloc "lorsque ..." correspondant (voir GESTIONNAIRES). */
    function reconstruireGestionnaire(noeud) {
        if (noeud._type !== 'FunctionDef') return null;
        const nom = noeud.name;
        let m;
        if ((m = /^on_button_pressed_(a|b|ab)$/.exec(nom))) {
            return { type: 'lorsque_bouton', fields: { BOUTON: m[1] }, corps: noeud.body };
        }
        if ((m = /^on_gesture_(shake|up|down)$/.exec(nom))) {
            return { type: 'lorsque_geste', fields: { GESTE: m[1] }, corps: noeud.body };
        }
        if ((m = /^on_pin_(pin[012])_(touched|released)$/.exec(nom))) {
            return { type: 'lorsque_broche', fields: { BROCHE: m[1], ETAT: m[2] }, corps: noeud.body };
        }
        if ((m = /^on_sound_(LOUD|QUIET)$/.exec(nom))) {
            return { type: 'lorsque_son_detecte', fields: { SON: m[1] }, corps: noeud.body };
        }
        if ((m = /^on_logo_(touched|released)$/.exec(nom))) {
            return { type: 'lorsque_logo', fields: { ACTION: m[1] }, corps: noeud.body };
        }
        if ((m = /^on_radio_(nombre|valeur|texte)$/.exec(nom))) {
            return { type: 'radio_quand_recu', fields: { TYPE: m[1] }, corps: noeud.body };
        }
        // IA : le nom de la fonction ne garde que la classe passee par slugIA() ; on retrouve
        // son vrai nom (accents, majuscules) parmi les classes connues du panneau IA, dont
        // l'apprentissage relu dans le meme .py (lireAnnexePy passe AVANT la reconstruction).
        if ((m = /^on_grove_bouton_(pin\d+)$/.exec(nom))) {
            return { type: 'grove_bouton_lorsque', fields: { BROCHE: m[1] }, corps: noeud.body };
        }
        if (nom === 'on_ia_qr_lu') {
            return { type: 'ia_qr_lorsque_lu', fields: {}, corps: noeud.body };
        }
        if ((m = /^on_ia_(vision|son)_([a-z0-9_]+)$/.exec(nom))) {
            return { type: 'ia_lorsque_reconnu', fields: { TYPE: m[1], CLASSE: nomClasseIA(m[1], m[2]) }, corps: noeud.body };
        }
        return null;
    }

    /** Classe IA d'apres son identifiant slugIA : vrai nom si le panneau IA la connait, sinon l'identifiant. */
    function nomClasseIA(genre, identifiant) {
        const connues = typeof window.iaClassesConnues === 'function' ? window.iaClassesConnues(genre) : [];
        return connues.find(n => window.slugIA(n) === identifiant) || identifiant;
    }

    /** `_ia_dernier["vision"]`, `_ia_proba["son"]`... -> [table, genre], sinon null. */
    function lectureIA(noeud) {
        if (!noeud || noeud._type !== 'Subscript' || !noeud.value || noeud.value._type !== 'Name') return null;
        if (noeud.value.id !== '_ia_dernier' && noeud.value.id !== '_ia_proba') return null;
        const genre = valeurConstante(noeud.slice);
        return ['vision', 'son', 'qr'].includes(genre) ? [noeud.value.id, genre] : null;
    }

    /** `_fabrique().methode(args)` -> [methode, args] si le motif correspond, sinon null. */
    function appelMethodeGrove(noeud, fabrique) {
        if (!noeud || noeud._type !== 'Call' || !noeud.func || noeud.func._type !== 'Attribute') return null;
        if (!estAppel(noeud.func.value, fabrique)) return null;
        return [noeud.func.attr, noeud.args, noeud.func.value.args];
    }

    /** Expressions du deuxieme lot Grove (BMP280, SGP30, horloge) -> bloc, sinon null. */
    function reconstruireExpressionGrove(noeud) {
        let m;
        if ((m = appelMethodeGrove(noeud, '_grove_bmp280')) && m[0] === 'mesure' && typeof valeurConstante(m[1][0]) === 'string') {
            return { type: 'grove_bmp280', fields: { GRANDEUR: valeurConstante(m[1][0]) } };
        }
        if ((m = appelMethodeGrove(noeud, '_grove_sgp30')) && m[0] === 'mesure' && typeof valeurConstante(m[1][0]) === 'string') {
            return { type: 'grove_sgp30', fields: { GRANDEUR: valeurConstante(m[1][0]) } };
        }
        if ((m = appelMethodeGrove(noeud, '_grove_rtc'))) {
            if (m[0] === 'lire' && typeof valeurConstante(m[1][0]) === 'string') return { type: 'grove_rtc_lire', fields: { CHAMP: valeurConstante(m[1][0]) } };
            if (m[0] === 'texte' && m[1].length === 0) return { type: 'grove_rtc_texte' };
        }
        return null;
    }

    /** Expressions des blocs IA (generateurs de un.js, section « IA ») -> bloc, sinon null. */
    function reconstruireExpressionIA(noeud) {
        if (noeud._type === 'Name' && noeud.id === '_ia_qr_texte') return { type: 'ia_qr_texte' };
        const lecture = lectureIA(noeud);
        if (lecture && lecture[1] !== 'qr') {
            return { type: lecture[0] === '_ia_dernier' ? 'ia_derniere_classe' : 'ia_confiance', fields: { TYPE: lecture[1] } };
        }
        if (noeud._type === 'Compare' && noeud.ops.length === 1 && typeof valeurConstante(noeud.comparators[0]) === 'string') {
            const gauche = lectureIA(noeud.left), texte = valeurConstante(noeud.comparators[0]);
            if (!gauche || gauche[0] !== '_ia_dernier') return null;
            if (gauche[1] === 'qr' && noeud.ops[0]._type === 'NotEq' && texte === '') return { type: 'ia_qr_visible' };
            if (gauche[1] !== 'qr' && noeud.ops[0]._type === 'Eq') {
                return { type: 'ia_classe_est', fields: { TYPE: gauche[1], CLASSE: nomClasseIA(gauche[1], texte) } };
            }
        }
        return null;
    }

    /**
     * Convertit une liste de noeuds AST (corps d'un bloc, d'une fonction...)
     * en une chaine de blocs Blockly (chainage `next`). Essaie chaque
     * matcher d'instruction dans l'ordre ; celui qui reconnait le motif
     * indique combien d'instructions il a absorbees (1 la plupart du temps,
     * 2 pour grove_ruban_couleur). Repli sur "code personnalisé" sinon.
     */
    function reconstruireListeInstructions(liste) {
        if (!liste || !liste.length) return null;
        const blocs = [];
        let i = 0;
        while (i < liste.length) {
            let resultat = null;
            for (const matcher of [reconstruireSiSpecial, reconstruireAttendreJusqua,
                                    reconstruireControlsIf, reconstruireControlsWhile, reconstruireControlsRepeat]) {
                const r = matcher(liste[i]);
                if (r) { resultat = { bloc: r, consommees: 1 }; break; }
            }
            if (!resultat) resultat = reconstruireInstructionUnique(liste, i);
            if (!resultat) {
                // `_source` (voir _ast_vers_json, index.html) porte le texte
                // Python EXACT de cette instruction, jamais un texte reconstruit :
                // rien de perdu, ce fragment se comportera comme dans le fichier importé.
                resultat = { bloc: { type: 'code_brut', fields: { CODE: liste[i]._source || '# (instruction non reconnue)' } }, consommees: 1 };
            }
            // `bloc: null` (import reconnu, voir reconstruireInstructionUnique) :
            // omis plutôt qu'affiché en "code personnalisé" — c'est du
            // passe-partout que les générateurs réinjectent tout seuls dès
            // qu'un bloc en a besoin (importerMicrobit(), importerModule()...),
            // jamais quelque chose que l'utilisateur pose lui-même.
            if (resultat.bloc) blocs.push(resultat.bloc);
            i += resultat.consommees;
        }
        // Chainage next.
        for (let k = blocs.length - 2; k >= 0; k--) blocs[k].next = { block: blocs[k + 1] };
        return blocs[0];
    }

    /**
     * Point d'entree : transforme le texte Python importe en arbre JSON pret
     * pour `Blockly.serialization.workspaces.load()`, ou renvoie null si
     * l'analyse syntaxique elle-meme a echoue (fichier corrompu, tronque...)
     * — dans ce cas l'appelant retombe sur l'edition manuelle, comme avant
     * cette fonctionnalite.
     */
    /**
     * Retire les sections "pilote" auto-injectées (bibliothèques des
     * servos, modules Grove...) avant l'analyse syntaxique :
     * ce sont des dizaines voire des centaines de lignes de définitions de
     * fonctions internes, jamais posées par l'utilisateur comme des blocs —
     * les laisser passer produisait un "code personnalisé" par instruction
     * (jusqu'à 80 sur un programme de test pourtant simple), noyant le
     * résultat utile sous du bruit. Même motif que `afficherTranscription()`
     * plus haut (qui les replie à l'affichage) : les délimiteurs `# >>> pilote
     * NOM`/`# <<< pilote NOM` sont écrits par ce fichier lui-même (voir
     * `piloteServo()`...), donc fiables sur un fichier
     * réellement généré par cette appli.
     */
    function retirerPilotes(code) {
        return code.replace(/# >>> pilote \S+\r?\n[\s\S]*?\r?\n# <<< pilote \S+\r?\n?/g, '');
    }

    function reconstruireDepuisCode(code) {
        const resultatJson = window.analyserCodePython(retirerPilotes(code));
        const resultat = JSON.parse(resultatJson);
        if (!resultat.ok) return null;

        const corpsModule = resultat.arbre.body;

        // Definitions de fonctions "on_xxx" (gestionnaires "lorsque ...") a
        // part, le reste (au demarrage / boucle infinie) va dans l'ordre.
        const gestionnaires = [];
        const instructionsPrincipales = [];
        for (const n of corpsModule) {
            const g = n._type === 'FunctionDef' ? reconstruireGestionnaire(n) : null;
            if (g) gestionnaires.push(g); else instructionsPrincipales.push(n);
        }

        // Scission Au demarrage / Repeter indefiniment : tout ce qui precede
        // le premier `while True:` de premier niveau est le demarrage, ce
        // while lui-meme est la boucle infinie (scrutation auto-injectee
        // retiree au passage), le reste (rare) suit la boucle.
        let indexBoucle = instructionsPrincipales.findIndex(n =>
            n._type === 'While' && valeurConstante(n.test) === true);

        const blocsPrincipaux = [];
        if (indexBoucle === -1) {
            const demarrage = { type: 'au_demarrage', x: 40, y: 40 };
            const corpsDemarrage = reconstruireListeInstructions(instructionsPrincipales);
            if (corpsDemarrage) demarrage.inputs = { DO: { block: corpsDemarrage } };
            blocsPrincipaux.push(demarrage);
        } else {
            const avant = instructionsPrincipales.slice(0, indexBoucle);
            const boucleNoeud = instructionsPrincipales[indexBoucle];
            const apres = instructionsPrincipales.slice(indexBoucle + 1);

            const demarrage = { type: 'au_demarrage', x: 40, y: 40 };
            const corpsDemarrage = reconstruireListeInstructions(avant);
            if (corpsDemarrage) demarrage.inputs = { DO: { block: corpsDemarrage } };

            // Retirer les lignes de scrutation auto-injectees (voir GESTIONNAIRES
            // plus bas dans ce fichier) : elles ne correspondent a aucun bloc,
            // ce sont nos propres blocs "lorsque ..." qui les remplacent.
            const nomsGestionnaires = new Set(gestionnaires.map(g => {
                if (g.type === 'lorsque_bouton') return 'on_button_pressed_' + g.fields.BOUTON;
                if (g.type === 'lorsque_geste') return 'on_gesture_' + g.fields.GESTE;
                if (g.type === 'lorsque_broche') return 'on_pin_' + g.fields.BROCHE + '_' + g.fields.ETAT;
                if (g.type === 'lorsque_son_detecte') return 'on_sound_' + g.fields.SON;
                if (g.type === 'lorsque_logo') return 'on_logo_' + g.fields.ACTION;
                if (g.type === 'radio_quand_recu') return 'on_radio_' + g.fields.TYPE;
                if (g.type === 'grove_bouton_lorsque') return 'on_grove_bouton_' + g.fields.BROCHE;
                return '';
            }));
            const corpsBoucleFiltre = boucleNoeud.body.filter(n => !(
                n._type === 'If' && n.test._type === 'Call' &&
                n.body.length === 1 && n.body[0]._type === 'Expr' &&
                n.body[0].value._type === 'Call' && n.body[0].value.func._type === 'Name' &&
                nomsGestionnaires.has(n.body[0].value.func.id)
            ));

            const boucle = { type: 'boucle_infinie' };
            const corpsBoucle = reconstruireListeInstructions(corpsBoucleFiltre);
            if (corpsBoucle) boucle.inputs = { DO: { block: corpsBoucle } };
            demarrage.next = { block: boucle };

            if (apres.length) {
                const suite = reconstruireListeInstructions(apres);
                if (suite) boucle.next = { block: suite };
            }
            blocsPrincipaux.push(demarrage);
        }

        // Blocs "lorsque ..." positionnes a cote, decales verticalement pour
        // ne pas se superposer.
        gestionnaires.forEach((g, idx) => {
            const bloc = { type: g.type, fields: g.fields, x: 400, y: 40 + idx * 150 };
            const corps = reconstruireListeInstructions(g.corps);
            if (corps) bloc.inputs = { DO: { block: corps } };
            blocsPrincipaux.push(bloc);
        });

        return { blocks: { languageVersion: 0, blocks: blocsPrincipaux } };
    }

    // Expose pour les verifications : reconstruire un texte sans passer par
    // un vrai import de fichier (input file non simulable depuis la console).
    window.reconstructionTest = { reconstruireDepuisCode, SIGNATURE_EXPORT, SIGNATURE_MARQUEUR };

    // ------------------------------------------
    // IMPORT D'UN FICHIER .py OU .hex — menu "Fichier"
    // ------------------------------------------
    // Blockly ne sait pas transformer du Python en blocs de façon générale
    // (voir plus haut) : un fichier importé bascule donc en édition manuelle,
    // SAUF s'il porte la signature de cette appli (SIGNATURE_MARQUEUR), auquel
    // cas une reconstruction en blocs est tentée d'abord (voir ci-dessus).
    // Pour un .hex, le texte n'est pas directement le programme — c'est un
    // binaire encodé Intel hex qui embarque tout le firmware ;
    // `extraireCodeDepuisHex` (deux.js) relit sa zone système de fichiers
    // avec la même bibliothèque microbit-fs que la génération, pour en
    // ressortir `main.py`.
    function importerCodeTexte(texte, origine) {
        if (texte.trimStart().startsWith(SIGNATURE_MARQUEUR)) {
            try {
                const workspaceJson = reconstruireDepuisCode(texte);
                if (workspaceJson) {
                    if (editionManuelleActive) sortirEditionManuelle();
                    window.workspace.clear();
                    window.workspace.clearUndo();
                    Blockly.serialization.workspaces.load(workspaceJson, window.workspace);
                    Blockly.svgResize(window.workspace);
                    const nbBrut = window.workspace.getAllBlocks(false).filter(b => b.type === 'code_brut' || b.type === 'expression_brute').length;
                    afficherEtat(origine + ' reconstruit en blocs' +
                        (nbBrut ? ` (${nbBrut} fragment${nbBrut > 1 ? 's' : ''} non reconnu${nbBrut > 1 ? 's' : ''}, en gris).` : '.'), false);
                    return;
                }
            } catch (erreur) {
                console.error('Reconstruction en blocs échouée, repli sur édition manuelle :', erreur);
            }
        }
        if (!editionManuelleActive) entrerEditionManuelle();
        zoneCodeTexte.value = texte;
        definirCodeActuel(texte);
        afficherTranscription(texte);
        afficherEtat(origine + ' importé — édition manuelle activée.', false);
    }

    const importHexBtn = document.getElementById('import-hex-btn');
    const importHexInput = document.getElementById('import-hex-input');
    if (importHexBtn && importHexInput) {
        importHexBtn.addEventListener('click', () => importHexInput.click());
        importHexInput.addEventListener('change', async () => {
            const fichier = importHexInput.files[0];
            importHexInput.value = ''; // permet de réimporter le même fichier ensuite
            if (!fichier) return;
            try {
                const texteHex = await fichier.text();
                const codePython = await extraireCodeDepuisHex(texteHex);
                importerCodeTexte(codePython, 'Fichier .hex');
                definirNomFichier(fichier.name);
            } catch (erreur) {
                afficherEtat('Import .hex échoué : ' + erreur.message, true);
            }
        });
    }

    const importPyBtn = document.getElementById('import-py-btn');
    const importPyInput = document.getElementById('import-py-input');
    if (importPyBtn && importPyInput) {
        importPyBtn.addEventListener('click', () => importPyInput.click());
        importPyInput.addEventListener('change', async () => {
            const fichier = importPyInput.files[0];
            importPyInput.value = '';
            if (!fichier) return;
            try {
                let texte = await fichier.text();
                // L'apprentissage IA eventuellement range a la fin est recharge, puis retire du code.
                if (window.iaImmediat) texte = window.iaImmediat.lireAnnexePy(texte);
                importerCodeTexte(texte, 'Script .py');
                definirNomFichier(fichier.name);
            } catch (erreur) {
                afficherEtat('Import .py échoué : ' + erreur.message, true);
            }
        });
    }

    // ==========================================
    // CAPTURE D'ÉCRAN DES BLOCS — export PNG, menu "Fichier"
    // ==========================================
    // Blockly ne pose AUCUN attribut `fill`/`font` inline sur le texte des blocs
    // (vérifié en direct : `.blocklyText` n'a pas d'attribut `fill`) — tout son
    // rendu vient des feuilles de style qu'il injecte dans <head>, jamais dans le
    // <svg> lui-même. Un SVG autonome exporté sans ces règles affiche donc des
    // blocs sans aucun texte : il faut les recopier dans un <style> embarqué.
    function collecterCssBlockly() {
        let css = '';
        for (const feuille of document.styleSheets) {
            try {
                for (const regle of feuille.cssRules) css += regle.cssText + '\n';
            } catch (erreur) {
                // Feuille d'une autre origine (CDN) : illisible depuis JS, ignorée.
            }
        }
        return css;
    }

    async function exporterCaptureBlocs() {
        const blocs = window.workspace.getAllBlocks(false);
        if (!blocs.length) {
            afficherEtat("Aucun bloc à capturer : ajoutez d'abord des blocs sur l'espace de travail.", true);
            return;
        }

        const MARGE = 20;
        const ECHELLE_EXPORT = 2; // export en 2x pour un PNG net sur écrans HiDPI

        try {
            const boite = window.workspace.getBlocksBoundingBox();
            const largeur = (boite.right - boite.left) + MARGE * 2;
            const hauteur = (boite.bottom - boite.top) + MARGE * 2;

            const theme = window.workspace.getTheme();
            const couleurFond = (theme && theme.getComponentStyle('workspaceBackgroundColour')) || '#ffffff';

            const NS_SVG = 'http://www.w3.org/2000/svg';
            const svgExport = document.createElementNS(NS_SVG, 'svg');
            svgExport.setAttribute('xmlns', NS_SVG);
            svgExport.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
            // Les règles de thème/contraste sont écrites `:root[data-theme=...] ...` :
            // dans un SVG autonome (chargé seul comme image), `:root` désigne le
            // <svg> racine lui-même, pas le <html> de la page — sans ces deux
            // attributs recopiés ici, ces règles ne correspondent jamais et le
            // contraste élevé, par exemple, exporte les couleurs du thème normal.
            svgExport.setAttribute('data-theme', document.documentElement.dataset.theme || '');
            svgExport.setAttribute('data-contrast', document.documentElement.dataset.contrast || '');
            svgExport.setAttribute('width', String(largeur));
            svgExport.setAttribute('height', String(hauteur));
            svgExport.setAttribute('viewBox', `0 0 ${largeur} ${hauteur}`);

            const style = document.createElementNS(NS_SVG, 'style');
            style.textContent = collecterCssBlockly();
            svgExport.appendChild(style);

            const fond = document.createElementNS(NS_SVG, 'rect');
            fond.setAttribute('width', '100%');
            fond.setAttribute('height', '100%');
            fond.setAttribute('fill', couleurFond);
            svgExport.appendChild(fond);

            // Les champs (menus déroulants, icônes) référencent des `clip-path`
            // définis dans les <defs> du <svg> principal — sans eux, recopiés tels
            // quels, les références `url(#...)` de la copie pointent dans le vide.
            const defsOriginal = window.workspace.getParentSvg().querySelector('defs');
            if (defsOriginal) svgExport.appendChild(defsOriginal.cloneNode(true));

            const groupe = window.workspace.getCanvas().cloneNode(true);
            groupe.setAttribute('transform', `translate(${MARGE - boite.left}, ${MARGE - boite.top})`);
            svgExport.appendChild(groupe);

            const texteSvg = new XMLSerializer().serializeToString(svgExport);
            const blobSvg = new Blob([texteSvg], { type: 'image/svg+xml;charset=utf-8' });
            const urlSvg = URL.createObjectURL(blobSvg);

            const image = new Image();
            await new Promise((resolue, echoue) => {
                image.onload = resolue;
                image.onerror = () => echoue(new Error("Le SVG généré n'a pas pu être chargé comme image."));
                image.src = urlSvg;
            });

            const canevas = document.createElement('canvas');
            canevas.width = largeur * ECHELLE_EXPORT;
            canevas.height = hauteur * ECHELLE_EXPORT;
            const contexte = canevas.getContext('2d');
            contexte.drawImage(image, 0, 0, canevas.width, canevas.height);
            URL.revokeObjectURL(urlSvg);

            const blobPng = await new Promise((resolue) => canevas.toBlob(resolue, 'image/png'));
            if (!blobPng) throw new Error("La conversion en PNG a échoué.");

            const urlPng = URL.createObjectURL(blobPng);
            const a = document.createElement('a');
            a.href = urlPng;
            a.download = nomFichierPour('programme-microbit.png');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(urlPng);

            afficherEtat('Capture d\'écran téléchargée.', false);
        } catch (erreur) {
            console.error('Erreur lors de la capture des blocs :', erreur);
            afficherEtat('Capture échouée : ' + erreur.message, true);
        }
    }

    const btnCaptureEcran = document.getElementById('capture-ecran-btn');
    if (btnCaptureEcran) btnCaptureEcran.addEventListener('click', exporterCaptureBlocs);

    // ==========================================
    // 5. FONCTIONS GRAPHIQUES POUR LE SIMULATEUR (AVEC ANIMATION TEXTE)
    // ==========================================
    const ledGrid = document.getElementById('led-grid');
    const leds = [];
    for (let i = 0; i < 25; i++) {
        const led = document.createElement('div');
        led.classList.add('led');
        ledGrid.appendChild(led);
        leds.push(led);
    }

    window.simuQueue = [];

    // Numéro de l'exécution en cours. Les suites différées (pauses, défilement,
    // notes, parole) ne reprennent la file que si elles appartiennent encore à
    // l'exécution courante : sans cela, un minuteur laissé par une exécution
    // interrompue ferait avancer la suivante d'un cran de trop.
    let jetonSimulation = 0;
    // Vrai si une pause (action 'sleep') a ete jouee depuis la fin du dernier passage de 5 tours
    // (voir simu_lancerTours : sinon, 20 ms de temps implicite laissent l'ecran se redessiner).
    let pauseDansPassage = false;

    /** Reprend la file après un délai, sauf si la simulation a été relancée entre-temps. */
    function suiteApres(ms) {
        const jeton = jetonSimulation;
        setTimeout(() => { if (jeton === jetonSimulation) window.simu_playQueue(); }, ms);
    }

    // Relancer la simulation coupe ce qui jouait encore : sinon deux exécutions
    // se superposent.
    window.simu_clearQueue = function() {
        window.simuQueue = []; jetonSimulation++; arreterSon();
        if (window.arreterBuzzerGrove) window.arreterBuzzerGrove();
    };
    // Lu par index.html (_executer_morceaux) pour savoir si une attente en
    // cours a ete interrompue (reinitialisation, nouveau declenchement).
    window.simu_jeton = function() { return jetonSimulation; };

    // Sert de base a running_time() (index.html), qui doit avancer avec le
    // temps reellement ecoule pour que les blocs "chronometre" (reset_chrono/
    // valeur_chrono) et "temps d'execution" restent utilisables en
    // simulation - performance.now() est du vrai temps d'horloge, coherent
    // avec les delais reels que ce simulateur impose deja (sleep, attendre).
    // Remis a zero dans simu_reinitialiser() (bouton "Reinitialiser" ou bloc
    // reset() du programme), comme un vrai redemarrage de carte remettrait
    // running_time() a 0.
    window.simu_tempsDepart = performance.now();
    window.simu_tempsEcoule = function() { return Math.round(performance.now() - window.simu_tempsDepart); };

    /** Demande une remise à zéro de la carte depuis le programme (bloc reset()). */
    window.simu_resetCarte = function() { window.simuQueue.push({ type: 'reset' }); };
    window.simu_effacerEcran = function() { window.simuQueue.push({ type: 'clear' }); };
    window.simu_afficherIcone = function(icone) { window.simuQueue.push({ type: 'show', value: icone }); };
    window.simu_sleep = function(ms) { window.simuQueue.push({ type: 'sleep', value: ms }); };
    // Utilise par sleep() (index.html) quand une boucle "attendre jusqu'à"
    // depasse sa limite d'iterations dans un exec() : ce cas queue quand
    // meme, avant d'abandonner, jusqu'a plusieurs milliers de faux
    // "sleep(10)" (voir _sleep_compteur, index.html) - les rejouer coute de
    // vraies secondes d'attente pour un resultat qui de toute facon
    // n'affiche jamais rien. On les retire donc de la file avant qu'elle
    // ne soit videe (simu_playQueue), plutot que de laisser l'utilisateur
    // attendre pour rien.
    window.simu_longueurFile = function() { return window.simuQueue.length; };
    window.simu_tronquerFile = function(longueur) { window.simuQueue.length = longueur; };
    // NOUVELLES FONCTIONS POUR LE TEXTE
    window.simu_showTexte = function(txt) { window.simuQueue.push({ type: 'showText', value: txt }); };
    window.simu_scrollTexte = function(txt) { window.simuQueue.push({ type: 'scrollText', value: txt }); };

    // ------------------------------------------
    // SORTIE SONORE (Web Audio)
    // ------------------------------------------
    // Le haut-parleur de la carte est un buzzer : une onde carrée en donne un
    // timbre proche. Les notes sont des couples [fréquence en Hz, durée en ms],
    // une fréquence nulle valant silence.
    //
    // Les mélodies de `music` suivent le decoupage officiel (1 temps = 4 tics,
    // 120 bpm, donc 1 tic = 125 ms). Les sons de `audio`, eux, sont des
    // approximations : ce sont des echantillons expressifs sur la vraie carte.

    const MELODIES = {
        DADADADUM: [[0, 250], [392, 250], [392, 250], [392, 250], [311.13, 1000],
                    [0, 250], [349.23, 250], [349.23, 250], [349.23, 250], [293.66, 1000]],
        PUNCHLINE: [[523.25, 375], [164.81, 125], [164.81, 125], [523.25, 125],
                    [164.81, 375], [196, 125], [0, 125], [155.56, 125]],
        ENTERTAINER: [[293.66, 125], [311.13, 125], [329.63, 125], [523.25, 250],
                      [329.63, 125], [523.25, 250], [329.63, 125], [523.25, 375],
                      [523.25, 125], [587.33, 125], [622.25, 125], [659.25, 125],
                      [523.25, 125], [587.33, 125], [659.25, 250], [493.88, 125],
                      [587.33, 250], [523.25, 500]],
    };

    const SONS = {
        GIGGLE:  [[659.25, 80], [783.99, 80], [659.25, 80], [880, 120]],
        HAPPY:   [[523.25, 120], [659.25, 120], [783.99, 120], [1046.5, 200]],
        HELLO:   [[783.99, 120], [523.25, 200]],
        SAD:     [[440, 200], [392, 200], [329.63, 300], [261.63, 400]],
        TWINKLE: [[1046.5, 80], [1318.51, 80], [1567.98, 80], [2093, 150]],
    };

    let ctxAudio = null;
    let oscillateursActifs = [];

    function contexteAudio() {
        const Constructeur = window.AudioContext || window.webkitAudioContext;
        if (!Constructeur) return null;
        if (!ctxAudio) ctxAudio = new Constructeur();
        // Les navigateurs suspendent le son tant qu'aucun clic n'a eu lieu.
        if (ctxAudio.state === 'suspended') ctxAudio.resume();
        return ctxAudio;
    }

    /**
     * Programme une suite de notes dans un contexte audio.
     *
     * Séparée de la lecture pour être vérifiable hors ligne (OfflineAudioContext).
     *
     * @returns {number} la durée totale, en secondes
     */
    function programmerNotes(ctx, sortie, notes, debut) {
        let t = debut;
        for (const [frequence, dureeMs] of notes) {
            const duree = dureeMs / 1000;
            if (frequence > 0) {
                const osc = ctx.createOscillator();
                const enveloppe = ctx.createGain();
                osc.type = 'square';
                osc.frequency.value = frequence;
                // Montée et descente rapides : sans elles, chaque note claque.
                enveloppe.gain.setValueAtTime(0, t);
                enveloppe.gain.linearRampToValueAtTime(1, t + 0.008);
                enveloppe.gain.setValueAtTime(1, Math.max(t + 0.008, t + duree - 0.015));
                enveloppe.gain.linearRampToValueAtTime(0, t + duree);
                osc.connect(enveloppe);
                enveloppe.connect(sortie);
                osc.start(t);
                osc.stop(t + duree);
                oscillateursActifs.push(osc);
                osc.onended = () => {
                    oscillateursActifs = oscillateursActifs.filter(o => o !== osc);
                };
            }
            t += duree;
        }
        return t - debut;
    }
    // Exposée pour pouvoir vérifier le rendu sonore sans haut-parleur.
    window.simu_programmerNotes = programmerNotes;
    window.simu_MELODIES = MELODIES;
    window.simu_SONS = SONS;

    /** Joue une suite de notes et renvoie sa durée en millisecondes. */
    function jouerNotes(notes) {
        const ctx = contexteAudio();
        if (!ctx) return 0;
        const volume = ctx.createGain();
        volume.gain.value = 0.18;
        volume.connect(ctx.destination);
        return programmerNotes(ctx, volume, notes, ctx.currentTime + 0.02) * 1000;
    }

    function arreterSon() {
        oscillateursActifs.forEach(osc => { try { osc.stop(); } catch (e) { /* déjà arrêté */ } });
        oscillateursActifs = [];
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    }

    function parler(texte, suite) {
        const synthese = window.speechSynthesis;
        if (!synthese || typeof SpeechSynthesisUtterance === 'undefined') {
            alert("La micro:bit dit : " + texte);
            suite();
            return;
        }
        let termine = false;
        const continuer = () => { if (!termine) { termine = true; suite(); } };
        const enonce = new SpeechSynthesisUtterance(texte);
        enonce.lang = 'en-GB';   // le module speech de la micro:bit parle anglais
        enonce.onend = continuer;
        enonce.onerror = continuer;
        synthese.cancel();
        synthese.speak(enonce);
        // Filet de sécurité : certains navigateurs n'émettent jamais onend.
        setTimeout(continuer, 1500 + texte.length * 90);
    }

    // ------------------------------------------
    // PÉRIPHÉRIQUES GROVE
    // ------------------------------------------
    // Les sorties (ruban, afficheur) passent par la file, pour rester dans
    // l'ordre du programme. Les entrées (distance, joystick, geste) sont lues
    // directement : ce sont des capteurs, pas des actions.

    const zoneRuban = document.getElementById('grove-ruban');
    const ecran4Digit = document.getElementById('grove-4digit-ecran');

    // Sept segments, dans l'ordre des bits du TM1637 : a b c d e f g.
    const SEGMENTS_7 = [
        ['a', '10,2 30,2 34,6 30,10 10,10 6,6'],
        ['b', '35,7 39,11 39,29 35,33 31,29 31,11'],
        ['c', '35,37 39,41 39,59 35,63 31,59 31,41'],
        ['d', '10,60 30,60 34,64 30,68 10,68 6,64'],
        ['e', '5,37 9,41 9,59 5,63 1,59 1,41'],
        ['f', '5,7 9,11 9,29 5,33 1,29 1,11'],
        ['g', '10,31 30,31 34,35 30,39 10,39 6,35'],
    ];
    let chiffres7 = [];
    let pointsDeuxPoints = null;

    function construireAfficheur7() {
        if (!ecran4Digit || chiffres7.length) return;
        const svgNS = 'http://www.w3.org/2000/svg';
        for (let i = 0; i < 4; i++) {
            const svg = document.createElementNS(svgNS, 'svg');
            svg.setAttribute('class', 'digit7');
            svg.setAttribute('viewBox', '0 0 40 70');
            const segments = {};
            for (const [nom, points] of SEGMENTS_7) {
                const p = document.createElementNS(svgNS, 'polygon');
                p.setAttribute('class', 'seg');
                p.setAttribute('points', points);
                svg.appendChild(p);
                segments[nom] = p;
            }
            ecran4Digit.appendChild(svg);
            chiffres7.push(segments);
            // Les deux points du TM1637 se placent entre le 2e et le 3e chiffre.
            if (i === 1) {
                pointsDeuxPoints = document.createElement('div');
                pointsDeuxPoints.className = 'digit7-points';
                pointsDeuxPoints.innerHTML = '<span></span><span></span>';
                ecran4Digit.appendChild(pointsDeuxPoints);
            }
        }
    }

    /**
     * Allume les segments d'après le motif envoyé par le pilote.
     *
     * @param {string} motifs  quatre octets en hexadécimal, séparés par des virgules
     * @param {boolean} points les deux points du milieu
     */
    function afficher7Segments(motifs, points) {
        construireAfficheur7();
        if (!chiffres7.length) return;
        const octets = String(motifs).split(',');
        chiffres7.forEach((segments, i) => {
            const valeur = parseInt(octets[i], 16) || 0;
            SEGMENTS_7.forEach(([nom], bit) => {
                segments[nom].classList.toggle('on', (valeur & (1 << bit)) !== 0);
            });
        });
        if (pointsDeuxPoints) pointsDeuxPoints.classList.toggle('on', !!points);
    }
    const curseurDistance = document.getElementById('grove-distance');
    const valeurDistance = document.getElementById('grove-distance-val');
    const curseurJX = document.getElementById('grove-jx');
    const curseurJY = document.getElementById('grove-jy');
    const valeurJX = document.getElementById('grove-jx-val');
    const valeurJY = document.getElementById('grove-jy-val');
    const caseBoutonJoystick = document.getElementById('grove-jbtn');
    const curseurPotentiometre = document.getElementById('grove-pot');
    // Premier lot Grove : commandes et zones d'affichage du panneau.
    const boutonPoussoirGrove = document.getElementById('grove-bouton-appui');
    const caseBoutonPoussoir = document.getElementById('grove-bouton-maintenu');
    const curseurLumiere = document.getElementById('grove-lumiere');
    const valeurLumiere = document.getElementById('grove-lumiere-val');
    const casePir = document.getElementById('grove-pir');
    const zoneBuzzer = document.getElementById('grove-buzzer');
    const zoneRelais = document.getElementById('grove-relais');
    const toileOled = document.getElementById('grove-oled');
    let boutonPoussoirEnfonce = false;
    // Deuxieme lot Grove
    const curseurPression = document.getElementById('grove-pression');
    const curseurCov = document.getElementById('grove-cov');
    const zoneBarreLed = document.getElementById('grove-barreled');
    const zoneRtc = document.getElementById('grove-rtc');
    let decalageRtc = 0;            // ms entre l'horloge simulee et celle du PC (reglee par le programme)
    const valeurPotentiometre = document.getElementById('grove-pot-val');
    const menuGesteGrove = document.getElementById('grove-geste');
    const boutonGesteGrove = document.getElementById('grove-geste-btn');

    const zoneLcd = document.getElementById('grove-lcd');
    const lignesLcd = [document.getElementById('grove-lcd-l0'), document.getElementById('grove-lcd-l1')];
    const curseurTemp = document.getElementById('grove-temp');
    const curseurHumi = document.getElementById('grove-humi');
    const curseurCo2 = document.getElementById('grove-co2');
    const selecteurCouleur = document.getElementById('grove-couleur');
    const zoneMoteurs = document.getElementById('grove-moteurs');
    const zoneLeds = document.getElementById('grove-leds');

    let ledsRuban = [];
    let etatLeds = {};
    let gesteGroveEnAttente = '';
    let tamponLcd = ['                ', '                '];
    // Module LCD RGB Backlight : couleur du fond [r, v, b] et fond allume ou
    // non. null = module v1 (fond bleu fixe, voir le CSS de #grove-lcd).
    let fondLcdRgb = null;
    let retroLcdAllume = true;
    function appliquerFondLcd() {
        if (!zoneLcd) return;
        if (!fondLcdRgb) {
            zoneLcd.style.background = '';
            zoneLcd.style.removeProperty('--lcd-texte');
            return;
        }
        const [r, v, b] = retroLcdAllume ? fondLcdRgb : [38, 42, 41];
        const haut = 'rgb(' + Math.min(255, Math.round(r * 1.08)) + ',' + Math.min(255, Math.round(v * 1.08)) + ',' + Math.min(255, Math.round(b * 1.08)) + ')';
        const bas = 'rgb(' + Math.round(r * 0.85) + ',' + Math.round(v * 0.85) + ',' + Math.round(b * 0.85) + ')';
        zoneLcd.style.background = 'linear-gradient(180deg, ' + haut + ' 0%, ' + bas + ' 100%)';
        // Caracteres sombres sur un fond clair, clairs sur un fond sombre :
        // sinon un fond blanc (couleur d'initialisation) rendrait le texte
        // invisible.
        const luminance = 0.299 * r + 0.587 * v + 0.114 * b;
        zoneLcd.style.setProperty('--lcd-texte', retroLcdAllume && luminance > 140 ? '#0d1b2a' : '#f4f8ff');
    }
    let etatMoteurs = { 1: 'arrêt', 2: 'arrêt' };
    const zoneServos = document.getElementById('grove-servos');
    let etatServos = {};
    const cadransServos = {};

    /** Crée le cadran d'une broche, ou rend celui qui existe déjà. */
    function cadranServo(nom) {
        if (cadransServos[nom]) return cadransServos[nom];
        const bloc = document.createElement('div');
        bloc.className = 'servo';
        // Servo « realiste » vu de dessus (choix de l'utilisateur parmi 4 modeles) : boitier bleu
        // type SG90 a deux oreilles, palonnier blanc a un bras qui tourne autour de l'axe (42, 52).
        bloc.innerHTML =
            '<svg class="servo-cadran" viewBox="0 0 120 96" width="60" height="48" aria-hidden="true">' +
            '<rect class="servo-corps" x="14" y="30" width="92" height="44" rx="5"/>' +
            '<rect class="servo-corps" x="4" y="44" width="112" height="14" rx="3"/>' +
            '<circle class="servo-trou" cx="9" cy="51" r="3"/><circle class="servo-trou" cx="111" cy="51" r="3"/>' +
            '<rect class="servo-dessus" x="20" y="36" width="80" height="32" rx="3"/>' +
            '<g class="servo-rotor"><path class="servo-bras" d="M42 52 L42 18"/>' +
            '<circle class="servo-trou-bras" cx="42" cy="24" r="1.5"/><circle class="servo-trou-bras" cx="42" cy="31" r="1.5"/>' +
            '<circle class="servo-trou-bras" cx="42" cy="38" r="1.5"/></g>' +
            '<circle class="servo-moyeu" cx="42" cy="52" r="7"/><circle class="servo-trou-bras" cx="42" cy="52" r="2.5"/>' +
            '</svg>' +
            '<div class="servo-nom"></div><div class="servo-etat"></div>';
        bloc.querySelector('.servo-nom').textContent = nom;
        zoneServos.appendChild(bloc);
        cadransServos[nom] = {
            cadran: bloc.querySelector('.servo-cadran'),
            rotor: bloc.querySelector('.servo-rotor'),
            texte: bloc.querySelector('.servo-etat')
        };
        return cadransServos[nom];
    }

    function dessinerServos() {
        if (!zoneServos) return;
        const noms = Object.keys(etatServos).sort();

        if (!noms.length) {
            zoneServos.textContent = 'aucun';
            for (const cle of Object.keys(cadransServos)) delete cadransServos[cle];
            return;
        }
        // Le texte « aucun » n'est pas un cadran : on le retire avant d'en poser un.
        if (zoneServos.firstChild && zoneServos.firstChild.nodeType === Node.TEXT_NODE) {
            zoneServos.textContent = '';
        }

        for (const nom of noms) {
            const info = etatServos[nom];
            const c = cadranServo(nom);
            // Le bras pointe vers le haut à 90° : l'angle du servo est donc
            // décalé de 90° pour l'affichage.
            const orientation = (Number(info.angle) || 0) - 90;

            c.cadran.classList.toggle('arret', info.mode === 'arret');
            if (info.mode === 'continu' && info.valeur !== 0) {
                // Deux secondes par tour à 100 %, proportionnellement plus lent
                // en dessous. Le sens vient du signe de la vitesse.
                const duree = Math.min(20, 200 / Math.abs(info.valeur));
                c.cadran.classList.add('continu');
                c.cadran.classList.toggle('inverse', info.valeur < 0);
                c.rotor.style.setProperty('--duree', duree.toFixed(2) + 's');
                c.texte.textContent = info.valeur + ' %';
            } else {
                c.cadran.classList.remove('continu', 'inverse');
                c.rotor.style.transform = 'rotate(' + orientation + 'deg)';
                if (info.mode === 'arret') c.texte.textContent = 'arrêt';
                else if (info.mode === 'impulsion') c.texte.textContent = info.valeur + ' µs';
                else if (info.mode === 'continu') c.texte.textContent = '0 %';
                else c.texte.textContent = info.valeur + '°';
            }
        }
    }

    // Les 32 cellules sont creees une seule fois, puis seul leur contenu
    // change : reconstruire le balisage a chaque ecriture ferait clignoter
    // l'ecran, et le vrai afficheur ne se rafraichit pas ainsi.
    const cellulesLcd = [];

    function preparerLcd() {
        if (cellulesLcd.length) return;
        lignesLcd.forEach((ligne, i) => {
            if (!ligne) return;
            cellulesLcd[i] = [];
            for (let c = 0; c < 16; c++) {
                const cellule = document.createElement('span');
                cellule.className = 'lcd-cell';
                ligne.appendChild(cellule);
                cellulesLcd[i].push(cellule);
            }
        });
    }

    function dessinerLcd() {
        preparerLcd();
        cellulesLcd.forEach((ligne, i) => {
            const texte = tamponLcd[i] || '';
            ligne.forEach((cellule, c) => {
                const caractere = texte.charAt(c) || ' ';
                // Une espace laisse la cellule vide : son fond suffit a la
                // rendre visible, comme les points eteints du composant.
                const contenu = caractere === ' ' ? '' : caractere;
                if (cellule.textContent !== contenu) cellule.textContent = contenu;
            });
        });
    }

    // Carte moteurs DFR0548 : vitesse signee de chaque moteur pilote (-255 a 255, negatif = antihoraire) et position
    // cumulee de chaque moteur pas a pas (degres), avec la duree du dernier mouvement pour animer l'axe.
    // Dessins (choix de l'utilisateur, modele A) : motoreducteur jaune « TT » et sa roue ; pas a pas dessine selon
    // le modele du bloc (28BYJ-48 rond argente, 42BYGH carre noir) avec un repere sur l'axe. Chaque vignette est
    // creee une fois puis seulement mise a jour : la reconstruire relancerait l'animation de la roue.
    let etatDfrMoteurs = {};
    let etatDfrPas = {};
    const zoneDfrMoteurs = document.getElementById('dfr-moteurs');
    const zoneDfrPas = document.getElementById('dfr-pas');
    const SVG_MOTEUR_TT =
        '<svg viewBox="0 0 170 90" aria-hidden="true">' +
        '<rect x="6" y="30" width="92" height="30" rx="5" fill="#f2c230" stroke="#8a6d10" stroke-width="1.5"/>' +
        '<rect x="98" y="35" width="10" height="20" fill="#f2c230" stroke="#8a6d10" stroke-width="1.5"/>' +
        '<rect x="20" y="38" width="44" height="14" rx="3" fill="#e2b020"/>' +
        '<circle cx="14" cy="45" r="3" fill="#8a6d10"/><rect x="0" y="40" width="6" height="10" fill="#9e9e9e"/>' +
        '<g class="dfr-roue">' +
        '<circle cx="130" cy="45" r="34" fill="#2b2b2b"/><circle cx="130" cy="45" r="24" fill="#fafafa" stroke="#9e9e9e"/>' +
        '<path d="M130 23 L130 67 M108 45 L152 45 M114.4 29.4 L145.6 60.6 M145.6 29.4 L114.4 60.6" stroke="#9e9e9e" stroke-width="3"/>' +
        '<circle cx="130" cy="45" r="6" fill="#f2c230" stroke="#8a6d10"/></g></svg>';
    const SVG_PAS = {
        '28BYJ-48': '<svg viewBox="0 0 100 100" aria-hidden="true">' +
            '<rect x="2" y="44" width="96" height="12" rx="3" fill="#c0c4c8" stroke="#6b7075"/>' +
            '<circle cx="8" cy="50" r="3" class="dfr-trou"/><circle cx="92" cy="50" r="3" class="dfr-trou"/>' +
            '<circle cx="50" cy="50" r="40" fill="#cfd4d8" stroke="#6b7075" stroke-width="1.5"/>' +
            '<rect x="34" y="84" width="32" height="12" rx="2" fill="#1e5fbf"/>' +
            '<circle cx="50" cy="36" r="13" fill="#e9eef2" stroke="#6b7075"/>' +
            '<g class="dfr-axe" style="transform-origin: 50px 36px">' +
            '<circle cx="50" cy="36" r="6" fill="#f2c230" stroke="#8a6d10"/><rect x="48" y="22" width="4" height="12" rx="1" fill="#c62828"/></g></svg>',
        '42BYGH': '<svg viewBox="0 0 100 100" aria-hidden="true">' +
            '<rect x="8" y="8" width="84" height="84" rx="8" fill="#2e2e2e" stroke="#111" stroke-width="1.5"/>' +
            '<circle cx="20" cy="20" r="4" fill="#9e9e9e"/><circle cx="80" cy="20" r="4" fill="#9e9e9e"/>' +
            '<circle cx="20" cy="80" r="4" fill="#9e9e9e"/><circle cx="80" cy="80" r="4" fill="#9e9e9e"/>' +
            '<circle cx="50" cy="50" r="20" fill="#3d3d3d" stroke="#6b7075"/>' +
            '<g class="dfr-axe" style="transform-origin: 50px 50px">' +
            '<circle cx="50" cy="50" r="7" fill="#c0c4c8"/><rect x="48" y="33" width="4" height="15" rx="1" fill="#f2c230"/></g></svg>',
    };
    // Memes dessins dans la vue montage (montage.js) : une seule source pour les moteurs.
    window.dessinsMoteursDfr = { tt: SVG_MOTEUR_TT, pas: SVG_PAS };
    /** « 1 tour + 90° », « 3 tours », « 45° » : plus lisible qu'un angle cumule de plusieurs milliers de degres. */
    function texteTours(degres) {
        const d = Math.round(Math.abs(degres)), tours = Math.floor(d / 360), reste = d % 360;
        const t = tours ? tours + (tours > 1 ? ' tours' : ' tour') : '';
        return (degres < 0 ? '↺ ' : '↻ ') + (t && reste ? t + ' + ' + reste + '°' : t || reste + '°');
    }
    /** Vignette d'un moteur (cle), creee au premier appel puis reutilisee. */
    function vignetteDfr(zone, cle, modele, svg) {
        let el = zone.querySelector('[data-cle="' + cle + '"]');
        if (el && el.dataset.modele !== modele) { el.remove(); el = null; }
        if (!el) {
            el = document.createElement('div');
            el.className = 'dfr-vignette';
            el.dataset.cle = cle;
            el.dataset.modele = modele;
            el.innerHTML = svg + '<div class="dfr-jauge"><div></div></div><div class="dfr-nom"></div>';
            const suivant = [...zone.children].find(x => x.dataset.cle > cle);
            zone.insertBefore(el, suivant || null);
        }
        return el;
    }
    // Carte Motor:bit : memes vignettes de moteur que la DFR0548, dans sa propre section.
    let etatMotorbit = {};
    const zoneMotorbit = document.getElementById('motorbit-moteurs');
    function dessinerMotorbit() {
        if (!zoneMotorbit) return;
        const numeros = Object.keys(etatMotorbit).sort();
        zoneMotorbit.hidden = !numeros.length;
        for (const n of numeros) {
            const v = etatMotorbit[n];
            const el = vignetteDfr(zoneMotorbit, n, 'tt', SVG_MOTEUR_TT);
            const roue = el.querySelector('.dfr-roue');
            el.classList.toggle('arret', v === 0);
            roue.classList.toggle('tourne', v !== 0);
            roue.classList.toggle('inverse', v < 0);
            if (v !== 0) roue.style.setProperty('--duree', Math.min(10, 255 / Math.abs(v)).toFixed(2) + 's');
            el.querySelector('.dfr-jauge div').style.width = Math.round(Math.abs(v) / 255 * 100) + '%';
            el.querySelector('.dfr-nom').textContent = 'M' + n + ' · ' + (v === 0 ? 'arrêt' : (v > 0 ? '↻ ' : '↺ ') + Math.abs(v));
        }
        for (const el of [...zoneMotorbit.children]) if (!(el.dataset.cle in etatMotorbit)) el.remove();
    }
    function dessinerDfr() {
        if (zoneDfrMoteurs) {
            const numeros = Object.keys(etatDfrMoteurs).sort();
            zoneDfrMoteurs.hidden = !numeros.length;
            for (const n of numeros) {
                const v = etatDfrMoteurs[n];
                const el = vignetteDfr(zoneDfrMoteurs, n, 'tt', SVG_MOTEUR_TT);
                const roue = el.querySelector('.dfr-roue');
                el.classList.toggle('arret', v === 0);
                roue.classList.toggle('tourne', v !== 0);
                roue.classList.toggle('inverse', v < 0);
                // Un tour en 1 s a pleine vitesse, plus lent en dessous ; le sens suit le signe.
                if (v !== 0) roue.style.setProperty('--duree', Math.min(10, 255 / Math.abs(v)).toFixed(2) + 's');
                el.querySelector('.dfr-jauge div').style.width = Math.round(Math.abs(v) / 255 * 100) + '%';
                el.querySelector('.dfr-nom').textContent = 'M' + n + ' · ' + (v === 0 ? 'arrêt' : (v > 0 ? '↻ ' : '↺ ') + Math.abs(v));
            }
            for (const el of [...zoneDfrMoteurs.children]) if (!(el.dataset.cle in etatDfrMoteurs)) el.remove();
        }
        if (zoneDfrPas) {
            const paires = Object.keys(etatDfrPas).sort();
            zoneDfrPas.hidden = !paires.length;
            for (const paire of paires) {
                const p = etatDfrPas[paire];
                const el = vignetteDfr(zoneDfrPas, paire, p.modele, SVG_PAS[p.modele] || SVG_PAS['28BYJ-48']);
                const axe = el.querySelector('.dfr-axe');
                axe.style.transition = 'transform ' + (p.duree / 1000).toFixed(2) + 's linear';
                axe.style.transform = 'rotate(' + p.position + 'deg)';
                el.querySelector('.dfr-nom').textContent = (paire === '1' ? 'M1-M2' : 'M3-M4') + ' · ' + p.modele + ' · ' + texteTours(p.position);
            }
            for (const el of [...zoneDfrPas.children]) if (!etatDfrPas[el.dataset.cle]) el.remove();
        }
    }

    function dessinerMoteurs() {
        if (zoneMoteurs) {
            zoneMoteurs.textContent = 'canal 1 : ' + etatMoteurs[1] + ' · canal 2 : ' + etatMoteurs[2];
        }
    }

    /**
     * LED simples : une pastille par broche effectivement pilotée.
     *
     * Rien n'est affiché tant que le programme n'a rien écrit — on ne sait pas
     * d'avance sur quelle broche la LED est câblée, et montrer les neuf broches
     * ferait un mur de pastilles éteintes.
     */
    function dessinerLeds() {
        if (!zoneLeds) return;
        const broches = Object.keys(etatLeds);
        if (!broches.length) {
            zoneLeds.innerHTML = '<span class="grove-vide">aucune broche pilotée</span>';
            return;
        }
        // Ordre des broches : celui du menu, pas celui des écritures, sinon
        // les pastilles sauteraient d'une exécution à l'autre.
        broches.sort((a, b) => Number(a) - Number(b));
        zoneLeds.innerHTML = broches.map(broche => {
            const niveau = etatLeds[broche];
            const f = niveau / 1023;
            // La luminosité perçue ne suit pas le rapport cyclique : une racine
            // rapproche l'affichage de ce que voit l'œil.
            const eclat = niveau ? 0.15 + 0.85 * Math.sqrt(f) : 0;
            return '<div class="led-broche">' +
                   '<span class="led-socle"><span class="led-pastille" style="opacity:' +
                   eclat.toFixed(3) + '"></span></span>' +
                   '<span class="led-nom">P' + broche + '</span>' +
                   '<span class="led-val">' + niveau + '</span></div>';
        }).join('');
    }

    // Chaque section du panneau Grove n'apparaît que si un bloc du module
    // correspondant est posé dans le programme : sur un projet qui n'utilise
    // qu'un ruban, les neuf autres n'ont rien à faire à l'écran.
    const SECTIONS_GROVE = [
        ['grove-sec-led',      /^grove_led_/],
        ['grove-sec-ruban',    /^grove_ruban_/],
        ['grove-sec-4digit',   /^grove_4d_/],
        ['grove-sec-ultrason', /^grove_ultrason_/],
        ['grove-sec-joystick', /^grove_joystick_/],
        ['grove-sec-potentiometre', /^grove_potentiometre$/],
        ['grove-sec-bouton',   /^grove_bouton_/],
        ['grove-sec-lumiere',  /^grove_lumiere$/],
        ['grove-sec-pir',      /^grove_pir$/],
        ['grove-sec-buzzer',   /^grove_buzzer_/],
        ['grove-sec-relais',   /^grove_relais$/],
        ['grove-sec-oled',     /^grove_oled_/],
        ['grove-sec-gestes',   /^grove_gestes_/],
        ['grove-sec-lcd',      /^grove_lcd(rgb)?_/],
        // Les SCD mesurent aussi température et humidité : leurs curseurs
        // servent donc aux trois capteurs.
        ['grove-sec-th',       /^grove_(th_|scd30_|scd41_|bmp280$)/],
        ['grove-sec-co2',      /^grove_(scd(30|41)_|sgp30$)/],
        ['grove-sec-pression', /^grove_bmp280$/],
        ['grove-sec-cov',      /^grove_sgp30$/],
        ['grove-sec-rtc',      /^grove_rtc_/],
        ['grove-sec-barreled', /^grove_barre_/],
        ['grove-sec-couleur',  /^grove_couleur_/],
        ['grove-sec-moteurs',  /^grove_moteur_/],
        ['grove-sec-servos',   /^(servo_|grove_pca_|dfr_servo$)/],
        ['grove-sec-dfr',      /^dfr_(moteur|moteur_arreter|pas_a_pas)$/],
        ['grove-sec-motorbit', /^motorbit_/],
        ['grove-sec-radio',    /^radio_quand_recu$/],
    ];

    function rafraichirPanneauGrove() {
        const types = window.workspace.getAllBlocks(false).map(b => b.type);
        let auMoinsUne = false;
        for (const [id, motif] of SECTIONS_GROVE) {
            const section = document.getElementById(id);
            if (!section) continue;
            const utilise = types.some(t => motif.test(t));
            section.classList.toggle('replie', !utilise);
            if (utilise) auMoinsUne = true;
        }
        const panneau = document.getElementById('grove-panneau');
        if (panneau) panneau.classList.toggle('replie', !auMoinsUne);

        // Montrer ou masquer ces sections change la hauteur de la colonne de
        // droite, donc celle du canevas. Sans cet avertissement, Blockly garde
        // en cache une hauteur perimee et place la corbeille hors de l'ecran.
        // Lire la geometrie force le navigateur a recalculer la mise en page :
        // l'appel synchrone voit donc deja les sections montrees ou masquees.
        Blockly.svgResize(window.workspace);
    }

    // ---- Premier lot Grove : buzzer, relais, ecran OLED ----
    let etatSortiesGrove = { buzzer: {}, relais: {} };
    let tamponOled = new Array(8).fill(' '.repeat(21));
    let oledActif = false;

    // Son du buzzer actif : un seul oscillateur (2,3 kHz, faible volume) tant qu'au moins un buzzer sonne.
    let sonBuzzer = null;
    function majSonBuzzer() {
        const sonne = Object.values(etatSortiesGrove.buzzer).some(v => v);
        if (sonne && !sonBuzzer) {
            try {
                const Contexte = window.AudioContext || window.webkitAudioContext;
                const contexte = new Contexte();
                const osc = contexte.createOscillator(), gain = contexte.createGain();
                osc.type = 'square'; osc.frequency.value = 2300; gain.gain.value = 0.03;
                osc.connect(gain); gain.connect(contexte.destination); osc.start();
                sonBuzzer = contexte;
            } catch (erreur) { sonBuzzer = null; }
        } else if (!sonne && sonBuzzer) {
            sonBuzzer.close().catch(() => {});
            sonBuzzer = null;
        }
    }
    // Arret de la simulation : le buzzer se tait (appele par simu_clearQueue).
    window.arreterBuzzerGrove = function() {
        etatSortiesGrove.buzzer = {};
        majSonBuzzer();
        dessinerSortiesGrove();
    };

    function dessinerSortiesGrove() {
        const lignes = (etat, dessin) => {
            const broches = Object.keys(etat).sort();
            return broches.length ? broches.map(b => dessin(b.replace(/^pin/, 'P').replace(/^(\d)/, 'P$1'), etat[b])).join('')
                                  : '<span class="grove-vide">aucun</span>';
        };
        if (zoneBuzzer) {
            zoneBuzzer.innerHTML = lignes(etatSortiesGrove.buzzer, (nom, on) =>
                '<div class="grove-sortie"><span class="buzzer-pastille' + (on ? ' on' : '') + '"></span>' + nom + ' : ' +
                (on ? 'sonne' : 'silencieux') + '</div>');
        }
        if (zoneRelais) {
            // Relais : module Grove dessine (modele A, choix de l'utilisateur), voyant rouge quand le contact est ferme.
            zoneRelais.innerHTML = lignes(etatSortiesGrove.relais, (nom, on) =>
                '<div class="relais-module' + (on ? ' actif' : '') + '">' +
                '<svg viewBox="0 0 120 100" width="72" height="60" aria-hidden="true">' +
                '<rect class="pot-carte" x="18" y="8" width="84" height="88" rx="6"/>' +
                '<circle class="pot-trou" cx="26" cy="16" r="3"/><circle class="pot-trou" cx="94" cy="16" r="3"/>' +
                '<rect class="relais-boitier" x="34" y="22" width="52" height="38" rx="3"/>' +
                '<text class="relais-marque" x="60" y="45" text-anchor="middle">RELAY</text>' +
                '<rect class="relais-bornier" x="30" y="68" width="24" height="14" rx="2"/>' +
                '<circle class="relais-vis" cx="37" cy="75" r="3"/><circle class="relais-vis" cx="47" cy="75" r="3"/>' +
                '<circle class="module-led" cx="80" cy="75" r="5"/></svg>' +
                '<span>' + nom + ' : ' + (on ? 'fermé (marche)' : 'ouvert (arrêt)') + '</span></div>');
        }
        majSonBuzzer();
    }

    // Ecran OLED 128 x 64 dessine point par point avec la meme police que le pilote (POLICE_OLED).
    function dessinerOled() {
        if (!toileOled) return;
        const ctx = toileOled.getContext('2d');
        const p = toileOled.width / 128;
        ctx.fillStyle = '#04070b';
        ctx.fillRect(0, 0, toileOled.width, toileOled.height);
        if (!oledActif) return;
        ctx.fillStyle = '#d6f1ff';
        tamponOled.forEach((ligne, y) => {
            for (let x = 0; x < ligne.length; x++) {
                const o = (ligne.charCodeAt(x) - 32) * 5;
                if (o <= 0) continue;
                for (let k = 0; k < 5; k++) {
                    const colonne = window.POLICE_OLED[o + k];
                    for (let b = 0; b < 8; b++) {
                        if (colonne & (1 << b)) ctx.fillRect((x * 6 + k) * p, (y * 8 + b) * p, p, p);
                    }
                }
            }
        });
    }

    function reinitialiserGrove() {
        if (zoneRuban) {
            zoneRuban.innerHTML = '<span class="grove-vide">non défini</span>';
            ledsRuban = [];
        }
        afficher7Segments('00,00,00,00', false);
        gesteGroveEnAttente = '';
        tamponLcd = ['                ', '                '];
        if (zoneLcd) zoneLcd.classList.remove('eteint');
        fondLcdRgb = null;
        retroLcdAllume = true;
        appliquerFondLcd();
        dessinerLcd();
        etatMoteurs = { 1: 'arrêt', 2: 'arrêt' };
        dessinerMoteurs();
        etatDfrMoteurs = {};
        etatDfrPas = {};
        dessinerDfr();
        etatMotorbit = {};
        dessinerMotorbit();
        etatLeds = {};
        dessinerLeds();
        etatServos = {};
        dessinerServos();
        etatSortiesGrove = { buzzer: {}, relais: {} };
        dessinerSortiesGrove();
        tamponOled = tamponOled.map(() => ' '.repeat(21));
        oledActif = false;
        dessinerOled();
        dessinerBarreLed('');
        afficherRtc();
    }

    window.simu_rubanDefinir = function(nombre) {
        window.simuQueue.push({ type: 'rubanDef', nombre: Number(nombre) });
    };
    window.simu_rubanAfficher = function(couleurs) {
        window.simuQueue.push({ type: 'rubanShow', couleurs: String(couleurs) });
    };
    window.simu_afficheur = function(motifs, points) {
        window.simuQueue.push({ type: 'afficheur', motifs: String(motifs), points: !!points });
    };
    window.simu_afficheurLuminosite = function(niveau) {
        window.simuQueue.push({ type: 'afficheurLum', niveau: Number(niveau) });
    };

    window.simu_led = function(broche, niveau) {
        window.simuQueue.push({ type: 'led', broche: String(broche), niveau: Number(niveau) });
    };

    window.simu_lcd = function(action, texte, x, y) {
        window.simuQueue.push({ type: 'lcd', action: String(action),
                                texte: String(texte), x: Number(x), y: Number(y) });
    };
    window.simu_motorbitMoteur = function(numero, vitesse) {
        window.simuQueue.push({ type: 'motorbitMoteur', numero: Number(numero), vitesse: Number(vitesse) });
    };
    window.simu_dfrMoteur = function(numero, vitesse) {
        window.simuQueue.push({ type: 'dfrMoteur', numero: Number(numero), vitesse: Number(vitesse) });
    };
    window.simu_dfrPas = function(paire, modele, degres, duree) {
        window.simuQueue.push({ type: 'dfrPas', paire: String(paire), modele: modele === 28 ? '28BYJ-48' : '42BYGH',
                                degres: Number(degres), duree: Number(duree) });
    };
    window.simu_moteur = function(canal, vitesse) {
        window.simuQueue.push({ type: 'moteur', canal: Number(canal), vitesse: vitesse });
    };
    // Un seul message est delivre par declenchement, comme une vraie boite aux
    // lettres qu'on vide : sans cela le meme message reviendrait a chaque tour.
    let messageRadioEnAttente = '';
    window.simu_radioRecevoir = function() {
        const m = messageRadioEnAttente;
        messageRadioEnAttente = '';
        return m;
    };

    // ---- Radio entre simulateurs (multi-editeur radio, multi.html, ou deux onglets du meme navigateur) ----
    // radio.send() du simulateur publie le message sur un BroadcastChannel ; chaque autre editeur dont la radio est
    // allumee sur le meme groupe et le meme canal le recoit comme avec « Simuler la reception ». Reglages par defaut de
    // MicroPython : groupe 0, canal 7. Tant que le programme recepteur n'a pas tourne, ses reglages sont lus dans son
    // code (radio.on(), radio.config(group=N) / channel=N ecrits en nombres).
    const ID_RADIO = Math.random().toString(36).slice(2);
    const radioSimu = { connue: false, code: '', allumee: false, groupe: 0, canal: 7 };
    window.simu_radioEtat = function(quoi, valeur) {
        const code = String(window.currentPythonCode || '');
        if (!radioSimu.connue || radioSimu.code !== code) Object.assign(radioSimu, reglagesRadioDuCode(), { connue: true, code });
        radioSimu[quoi] = quoi === 'allumee' ? !!valeur : Number(valeur);
    };
    function reglagesRadioDuCode() {
        const code = String(window.currentPythonCode || '');
        const nombre = (motif, defaut) => { const m = code.match(motif); return m ? Number(m[1]) : defaut; };
        return { allumee: /radio\.on\(\)/.test(code), groupe: nombre(/radio\.config\([^)]*group\s*=\s*(\d+)/, 0),
                 canal: nombre(/radio\.config\([^)]*channel\s*=\s*(\d+)/, 7) };
    }
    // Reglages vus pendant l'execution, tant que le programme n'a pas change depuis ; sinon ceux ecrits dans le code.
    const reglagesRadio = () => (radioSimu.connue && radioSimu.code === String(window.currentPythonCode || '') ? radioSimu : reglagesRadioDuCode());
    let busRadio = null;
    try { busRadio = 'BroadcastChannel' in window ? new BroadcastChannel('microbit-radio-v1') : null; } catch (erreur) { busRadio = null; }
    window.simu_radioEmettre = function(message) {
        const r = reglagesRadio();
        if (!busRadio || !r.allumee) return;
        busRadio.postMessage({ id: ID_RADIO, groupe: r.groupe, canal: r.canal, message: String(message) });
        if (typeof window.consoleAjouterLigne === 'function') window.consoleAjouterLigne('📡 envoyé : ' + message, 'info');
    };
    // Messages recus en file, un seul par declenchement (comme « Simuler la reception », qui poursuit la simulation
    // en cours ou la lance) ; 60 ms entre deux messages pour que chacun soit traite par le programme.
    const fileRadio = [];
    function distribuerRadio() {
        if (!fileRadio.length) return;
        messageRadioEnAttente = fileRadio.shift();
        if (typeof window.consoleAjouterLigne === 'function') window.consoleAjouterLigne('📡 reçu : ' + messageRadioEnAttente, 'info');
        window.simu_continuerOuLancer();
        messageRadioEnAttente = '';
        if (fileRadio.length) setTimeout(distribuerRadio, 60);
    }
    if (busRadio) {
        busRadio.onmessage = (ev) => {
            const d = ev.data || {}, r = reglagesRadio();
            if (d.id === ID_RADIO || !r.allumee || d.groupe !== r.groupe || d.canal !== r.canal) return;
            if (typeof window.simu_continuerOuLancer !== 'function') return;
            if (fileRadio.length < 20) fileRadio.push(String(d.message));   // au-dela, perdus comme sur la carte
            if (fileRadio.length === 1) distribuerRadio();
        };
    }

    window.simu_servo = function(broche, mode, valeur, angle) {
        window.simuQueue.push({ type: 'servo', broche: String(broche), mode: String(mode),
                                valeur: Math.round(Number(valeur)), angle: Number(angle) });
    };

    // Entrées : lues à l'instant où le programme les demande.
    window.simu_mesure = function(grandeur) {
        const g = String(grandeur);
        if (g === 'humidite') return curseurHumi ? Number(curseurHumi.value) : 0;
        if (g === 'co2') return curseurCo2 ? Number(curseurCo2.value) : 0;
        if (g === 'pression') return curseurPression ? Number(curseurPression.value) : 1013;
        if (g === 'cov') return curseurCov ? Number(curseurCov.value) : 0;
        return curseurTemp ? Number(curseurTemp.value) : 0;
    };
    window.simu_couleurCanal = function(canal) {
        if (!selecteurCouleur) return 0;
        const hexa = selecteurCouleur.value;                  // « #rrggbb »
        const r = parseInt(hexa.substr(1, 2), 16);
        const v = parseInt(hexa.substr(3, 2), 16);
        const b = parseInt(hexa.substr(5, 2), 16);
        // Le VEML6040 rend 16 bits : on transpose les 8 bits du sélecteur.
        const brut = { rouge: r, vert: v, bleu: b, blanc: Math.max(r, v, b) };
        return (brut[String(canal)] || 0) * 257;
    };
    window.simu_distanceCm = function() {
        return curseurDistance ? Number(curseurDistance.value) : 0;
    };
    window.simu_lireAnalogique = function(idBroche) {
        const id = String(idBroche);
        // L'appui sur le manche tire l'axe X presque à zéro, comme sur le module.
        if (id === '0' && caseBoutonJoystick && caseBoutonJoystick.checked) return 0;
        if (id === '1') return curseurJY ? Number(curseurJY.value) : 512;
        return curseurJX ? Number(curseurJX.value) : 512;
    };
    /** Barre de LED : etat des 10 LED (« 1,1,0,... »), mis en file comme les autres sorties. */
    window.simu_barreLed = function(leds) {
        window.simuQueue.push({ type: 'barreLed', leds: String(leds) });
    };
    /** Horloge temps reel : heure du PC decalee de ce que le programme a regle (comme la pile du module). */
    function heureRtc() { return new Date(Date.now() + decalageRtc); }
    window.simu_rtc = function(champ) {
        const d = heureRtc(), deux = v => String(v).padStart(2, '0');
        if (champ === 'texte') return deux(d.getHours()) + ':' + deux(d.getMinutes()) + ':' + deux(d.getSeconds());
        return { heure: d.getHours(), minute: d.getMinutes(), seconde: d.getSeconds(), jour: d.getDate(),
                 mois: d.getMonth() + 1, annee: d.getFullYear() }[champ] || 0;
    };
    window.simu_rtcRegler = function(annee, mois, jour, heure, minute, seconde) {
        decalageRtc = new Date(annee, mois - 1, jour, heure, minute, seconde).getTime() - Date.now();
        afficherRtc();
    };
    function afficherRtc() {
        if (!zoneRtc) return;
        const d = heureRtc(), deux = v => String(v).padStart(2, '0');
        zoneRtc.innerHTML = '<span class="rtc-heure">' + window.simu_rtc('texte') + '</span>' +
            '<span class="rtc-date">' + deux(d.getDate()) + '/' + deux(d.getMonth() + 1) + '/' + d.getFullYear() + '</span>';
    }
    setInterval(() => { if (zoneRtc && zoneRtc.offsetParent) afficherRtc(); }, 1000);

    function dessinerBarreLed(leds) {
        if (!zoneBarreLed) return;
        const etats = String(leds || '').split(',').map(Number);
        // Couleurs du module : LED 1 rouge, 2 orange, 3 a 10 vertes.
        zoneBarreLed.innerHTML = Array.from({ length: 10 }, (_, i) =>
            '<span class="barre-led' + (i === 0 ? ' rouge' : i === 1 ? ' orange' : '') + (etats[i] ? ' on' : '') + '"></span>').join('');
    }

    /** Premier lot Grove : entrees lues a l'instant ou le programme les demande. */
    window.simu_groveEntree = function(nom) {
        if (nom === 'bouton') return boutonPoussoirEnfonce || (caseBoutonPoussoir && caseBoutonPoussoir.checked) ? 1 : 0;
        if (nom === 'lumiere') return curseurLumiere ? Number(curseurLumiere.value) : 512;
        if (nom === 'pir') return casePir && casePir.checked ? 1 : 0;
        return 0;
    };
    /** Buzzer et relais : etat mis en file, comme les LED, pour suivre le rythme du programme. */
    window.simu_groveSortie = function(nom, broche, valeur) {
        window.simuQueue.push({ type: 'groveSortie', nom: String(nom), broche: String(broche), valeur: Number(valeur) });
    };
    window.simu_oled = function(action, texte, x, y) {
        window.simuQueue.push({ type: 'oled', action: String(action), texte: String(texte), x: Number(x), y: Number(y) });
    };

    /** Potentiometre Grove : position du curseur du panneau (0 a 1023), quelle que soit la broche. */
    window.simu_potentiometre = function() {
        return curseurPotentiometre ? Number(curseurPotentiometre.value) : 512;
    };
    window.simu_joystickDirection = function(direction) {
        const x = caseBoutonJoystick && caseBoutonJoystick.checked ? 0 : Number(curseurJX.value);
        const y = Number(curseurJY.value);
        if (direction === 'gauche') return x < 350;
        if (direction === 'droite') return x > 700;
        if (direction === 'bas') return y < 350;
        if (direction === 'haut') return y > 700;
        return x >= 350 && x <= 700 && y >= 350 && y <= 700;
    };
    /** Le capteur réel vide son registre à la lecture : on fait de même. */
    window.simu_gesteGrove = function() {
        const geste = gesteGroveEnAttente;
        gesteGroveEnAttente = '';
        return geste;
    };

    function dessinerRuban(nombre) {
        zoneRuban.innerHTML = '';
        ledsRuban = [];
        for (let i = 0; i < nombre; i++) {
            const led = document.createElement('div');
            led.className = 'grove-led';
            led.title = 'LED n° ' + i;
            zoneRuban.appendChild(led);
            ledsRuban.push(led);
        }
    }

    function colorerRuban(couleurs) {
        const liste = couleurs ? couleurs.split(',') : [];
        liste.forEach((hexa, i) => {
            if (!ledsRuban[i]) return;
            const eteinte = hexa === '000000';
            ledsRuban[i].style.background = eteinte ? '#2a2a2a' : '#' + hexa;
            ledsRuban[i].style.boxShadow = eteinte ? 'inset 0 0 2px #000' : '0 0 6px #' + hexa;
        });
    }

    if (curseurDistance) {
        curseurDistance.addEventListener('input', () => {
            valeurDistance.textContent = curseurDistance.value;
        });
    }
    if (curseurJX) curseurJX.addEventListener('input', () => { valeurJX.textContent = curseurJX.value; });
    if (curseurJY) curseurJY.addEventListener('input', () => { valeurJY.textContent = curseurJY.value; });
    // Bouton poussoir Grove : enfonce tant que le pointeur (souris, doigt) appuie dessus.
    if (boutonPoussoirGrove) {
        // Le capuchon dessine reste enfonce tant qu'on appuie, ou tant que « maintenu enfonce » est coche.
        const majVisuel = () => boutonPoussoirGrove.classList.toggle('enfonce',
            boutonPoussoirEnfonce || !!(caseBoutonPoussoir && caseBoutonPoussoir.checked));
        const regler = enfonce => () => { boutonPoussoirEnfonce = enfonce; majVisuel(); };
        boutonPoussoirGrove.addEventListener('pointerdown', regler(true));
        ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => boutonPoussoirGrove.addEventListener(t, regler(false)));
        if (caseBoutonPoussoir) caseBoutonPoussoir.addEventListener('change', majVisuel);
    }
    const visuelPir = document.getElementById('grove-pir-visuel');
    if (visuelPir && casePir) {
        const majPir = () => visuelPir.classList.toggle('actif', casePir.checked);
        const basculer = () => { casePir.checked = !casePir.checked; majPir(); };
        visuelPir.addEventListener('click', basculer);
        visuelPir.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); basculer(); } });
        casePir.addEventListener('change', majPir);
        majPir();
    }
    [['grove-pression', 'grove-pression-val'], ['grove-cov', 'grove-cov-val']].forEach(([idCurseur, idValeur]) => {
        const c = document.getElementById(idCurseur), v = document.getElementById(idValeur);
        if (c && v) c.addEventListener('input', () => { v.textContent = c.value; });
    });
    dessinerBarreLed('');
    afficherRtc();
    if (curseurLumiere) curseurLumiere.addEventListener('input', () => {
        valeurLumiere.textContent = curseurLumiere.value + ' (' + Math.round(Number(curseurLumiere.value) * 100 / 1023) + ' %)';
    });
    // Potentiometre : valeur brute et angle correspondant (300° de course), bouton du module
    // dessine tourne d'autant (-150° a gauche, +150° a droite).
    const rotorPotentiometre = document.getElementById('grove-pot-rotor');
    const visuelPotentiometre = document.getElementById('grove-pot-visuel');
    function majPotentiometre() {
        const v = Number(curseurPotentiometre.value);
        const angle = v * 300 / 1023;
        valeurPotentiometre.textContent = v + ' (' + Math.round(angle) + '°)';
        if (rotorPotentiometre) rotorPotentiometre.style.transform = 'rotate(' + (angle - 150).toFixed(1) + 'deg)';
    }
    if (curseurPotentiometre) {
        curseurPotentiometre.addEventListener('input', majPotentiometre);
        majPotentiometre();
    }
    // Tourner le bouton a la souris : l'angle du pointeur autour de l'axe donne la position.
    // Au-dela des butees (zone morte en bas), le bouton reste a 0 ou a 300°.
    if (visuelPotentiometre && curseurPotentiometre) {
        const viser = evenement => {
            const r = visuelPotentiometre.getBoundingClientRect();
            const x = (evenement.clientX - r.left) * 120 / r.width - 60;
            const y = (evenement.clientY - r.top) * 100 / r.height - 52;
            let angle = Math.atan2(x, -y) * 180 / Math.PI + 150;       // 0 = butee gauche
            if (angle < 0) angle += 360;
            if (angle > 300) angle = angle > 330 ? 0 : 300;
            curseurPotentiometre.value = String(Math.round(angle * 1023 / 300));
            majPotentiometre();
        };
        visuelPotentiometre.addEventListener('pointerdown', evenement => {
            visuelPotentiometre.setPointerCapture(evenement.pointerId);
            viser(evenement);
        });
        visuelPotentiometre.addEventListener('pointermove', evenement => {
            if (visuelPotentiometre.hasPointerCapture(evenement.pointerId)) viser(evenement);
        });
    }
    [['grove-temp', 'grove-temp-val'], ['grove-humi', 'grove-humi-val'],
     ['grove-co2', 'grove-co2-val']].forEach(([idCurseur, idValeur]) => {
        const c = document.getElementById(idCurseur);
        const v = document.getElementById(idValeur);
        if (c && v) c.addEventListener('input', () => { v.textContent = c.value; });
    });
    dessinerLcd();
    dessinerMoteurs();
    dessinerDfr();
    dessinerServos();

    window.simu_jouerMelodie = function(nom) {
        window.simuQueue.push({ type: 'son', notes: MELODIES[nom] || MELODIES.DADADADUM });
    };
    window.simu_jouerSon = function(nom) {
        window.simuQueue.push({ type: 'son', notes: SONS[nom] || SONS.HELLO });
    };
    window.simu_jouerNote = function(frequence, dureeMs) {
        window.simuQueue.push({ type: 'son', notes: [[Number(frequence), Number(dureeMs)]] });
    };
    window.simu_arreterSon = function() { window.simuQueue.push({ type: 'stopSon' }); };
    window.simu_parler = function(texte) { window.simuQueue.push({ type: 'parler', texte: String(texte) }); };

    window.simu_playQueue = function() {
        if (window.simuQueue.length === 0) {
            // Utilisé par l'exécution tour par tour (voir TOURS DE BOUCLE plus
            // bas) : une fois la file d'un tour entièrement rejouée, enchaîner
            // sur le tour suivant. Sans rappel en attente, comportement inchangé.
            const suite = window._simuApresVidageFile;
            window._simuApresVidageFile = null;
            if (suite) suite();
            return;
        }
        let action = window.simuQueue.shift();

        const textContainer = document.getElementById('led-text-container');
        const textContent = document.getElementById('led-text-content');

        if (action.type === 'clear') {
            leds.forEach(led => led.classList.remove('on'));
            if(textContainer) textContainer.style.display = 'none';
            window.simu_playQueue();
        }
        else if (action.type === 'show') {
            leds.forEach(led => led.classList.remove('on'));
            if(textContainer) textContainer.style.display = 'none';
            let pattern = [];
            if (action.value === "HEART") pattern = [1,3,5,6,7,8,9,10,11,12,13,14,16,17,18,22];
            else if (action.value === "HAPPY") pattern = [6,8,15,19,21,22,23];
            else if (action.value === "SAD") pattern = [6,8,16,17,18,20,24];
            else if (action.value === "GHOST") pattern = [0,1,2,3,4,5,7,9,10,11,12,13,14,15,16,17,18,19,20,22,24];
            else if (typeof action.value === 'string' && action.value.includes(':')) {
                let rows = action.value.split(':');
                for (let y = 0; y < 5; y++) {
                    if (rows[y]) {
                        for (let x = 0; x < 5; x++) {
                            if (rows[y][x] && rows[y][x] !== '0') {
                                pattern.push(y * 5 + x);
                            }
                        }
                    }
                }
            }
            pattern.forEach(index => { if(leds[index]) leds[index].classList.add('on'); });
            window.simu_playQueue();
        }
        // GESTION MAGIQUE DE L'AFFICHAGE ET DÉFILEMENT DU TEXTE
        else if (action.type === 'showText' || action.type === 'scrollText') {
            leds.forEach(led => led.classList.remove('on')); // Éteindre les LEDs
            if (textContainer && textContent) {
                textContainer.style.display = 'flex';
                textContent.textContent = action.value;

                if (action.type === 'scrollText') {
                    textContent.style.animation = 'none';
                    void textContent.offsetWidth; // Force le redémarrage de l'animation
                    let duration = Math.max(2, action.value.length * 0.3); // Le défilement s'adapte à la longueur
                    textContent.style.animation = `scroll-left ${duration}s linear forwards`;

                    const jeton = jetonSimulation;
                    setTimeout(() => {
                        if (jeton !== jetonSimulation) return;
                        textContainer.style.display = 'none';
                        window.simu_playQueue();
                    }, duration * 1000);
                } else {
                    // Affichage fixe (show)
                    textContent.style.animation = 'none';
                    textContent.style.transform = 'none';
                    const jeton = jetonSimulation;
                    setTimeout(() => {
                        if (jeton !== jetonSimulation) return;
                        textContainer.style.display = 'none';
                        window.simu_playQueue();
                    }, 1000); // Reste affiché 1 seconde avant de continuer
                }
            } else {
                window.simu_playQueue();
            }
        }
        else if (action.type === 'son') {
            // On enchaîne après la dernière note, pour que le son reste dans
            // l'ordre du programme vis-à-vis des affichages et des pauses.
            suiteApres(jouerNotes(action.notes));
        }
        else if (action.type === 'rubanDef') {
            dessinerRuban(action.nombre);
            window.simu_playQueue();
        }
        else if (action.type === 'rubanShow') {
            colorerRuban(action.couleurs);
            window.simu_playQueue();
        }
        else if (action.type === 'afficheur') {
            afficher7Segments(action.motifs, action.points);
            window.simu_playQueue();
        }
        else if (action.type === 'led') {
            etatLeds[action.broche] = Math.max(0, Math.min(1023, action.niveau));
            dessinerLeds();
            window.simu_playQueue();
        }
        else if (action.type === 'console') {
            ecrireConsole(action.texte, 'sim');
            window.simu_playQueue();
        }
        else if (action.type === 'lcd') {
            if (action.action === 'init' || action.action === 'effacer') {
                tamponLcd = ['                ', '                '];
                if (action.action === 'init') {
                    zoneLcd.classList.remove('eteint');
                    // 'rgb' : module RGB Backlight (fond blanc a l'init, comme
                    // sur la carte) ; sinon module v1 a fond bleu fixe.
                    fondLcdRgb = action.texte === 'rgb' ? [255, 255, 255] : null;
                    retroLcdAllume = true;
                    appliquerFondLcd();
                }
            } else if (action.action === 'fond') {
                const [r, v, b] = action.texte.split(',').map(Number);
                fondLcdRgb = [r, v, b];
                appliquerFondLcd();
            } else if (action.action === 'retro') {
                retroLcdAllume = action.texte === '1';
                appliquerFondLcd();
            } else if (action.action === 'allumer') {
                zoneLcd.classList.remove('eteint');
            } else if (action.action === 'eteindre') {
                zoneLcd.classList.add('eteint');
            } else if (action.action === 'texte') {
                const y = Math.max(0, Math.min(1, action.y));
                const x = Math.max(0, Math.min(15, action.x));
                const morceau = action.texte.slice(0, 16 - x);
                tamponLcd[y] = (tamponLcd[y].slice(0, x) + morceau +
                                tamponLcd[y].slice(x + morceau.length)).slice(0, 16);
            }
            dessinerLcd();
            window.simu_playQueue();
        }
        else if (action.type === 'groveSortie') {
            if (etatSortiesGrove[action.nom]) etatSortiesGrove[action.nom][action.broche] = action.valeur ? 1 : 0;
            dessinerSortiesGrove();
            window.simu_playQueue();
        }
        else if (action.type === 'barreLed') {
            dessinerBarreLed(action.leds);
            window.simu_playQueue();
        }
        else if (action.type === 'oled') {
            if (action.action === 'init' || action.action === 'effacer') {
                tamponOled = tamponOled.map(() => ' '.repeat(21));
                oledActif = true;
            } else if (action.action === 'texte') {
                const y = Math.max(0, Math.min(7, action.y)), x = Math.max(0, Math.min(20, action.x));
                const morceau = window.oledAscii(action.texte).slice(0, 21 - x);
                tamponOled[y] = (tamponOled[y].slice(0, x) + morceau + tamponOled[y].slice(x + morceau.length)).slice(0, 21);
                oledActif = true;
            }
            dessinerOled();
            window.simu_playQueue();
        }
        else if (action.type === 'servo') {
            etatServos[action.broche] = { mode: action.mode, valeur: action.valeur, angle: action.angle };
            dessinerServos();
            window.simu_playQueue();
        }
        else if (action.type === 'moteur') {
            etatMoteurs[action.canal] = action.vitesse === 'frein' ? 'frein'
                : (action.vitesse === 0 ? 'arrêt' : 'vitesse ' + action.vitesse);
            dessinerMoteurs();
            window.simu_playQueue();
        }
        else if (action.type === 'dfrMoteur') {
            // Un arret ne fait pas apparaitre un moteur jamais mis en marche (« arreter tous les moteurs »).
            if (action.vitesse !== 0 || action.numero in etatDfrMoteurs) etatDfrMoteurs[action.numero] = action.vitesse;
            dessinerDfr();
            window.simu_playQueue();
        }
        else if (action.type === 'motorbitMoteur') {
            if (action.vitesse !== 0 || action.numero in etatMotorbit) etatMotorbit[action.numero] = action.vitesse;
            dessinerMotorbit();
            window.simu_playQueue();
        }
        else if (action.type === 'dfrPas') {
            // L'aiguille tourne pendant la duree du mouvement ; la pause qui suit dans la file (sleep du
            // substitut Brython) occupe le programme ce meme temps, comme sur la carte.
            const p = etatDfrPas[action.paire] || { position: 0 };
            etatDfrPas[action.paire] = { position: p.position + action.degres, modele: action.modele, duree: action.duree };
            dessinerDfr();
            window.simu_playQueue();
        }
        else if (action.type === 'afficheurLum') {
            // 0 à 7 sur le module : on rend l'écart en opacité.
            ecran4Digit.style.opacity = String(0.25 + 0.75 * (action.niveau / 7));
            window.simu_playQueue();
        }
        else if (action.type === 'stopSon') {
            arreterSon();
            window.simu_playQueue();
        }
        else if (action.type === 'parler') {
            const jeton = jetonSimulation;
            parler(action.texte, () => { if (jeton === jetonSimulation) window.simu_playQueue(); });
        }
        else if (action.type === 'reset') {
            // Le bloc reset() redémarre la carte : l'écran s'éteint, le son se
            // tait, et ce qui suivait dans le programme n'est pas execute.
            window.simu_reinitialiser();
        }
        else if (action.type === 'sleep') {
            pauseDansPassage = true;   // du temps passe : pas de temps implicite en fin de passage (simu_lancerTours)
            suiteApres(action.value);
        }
    };

    // ------------------------------------------
    // TOURS DE BOUCLE — exécution qui laisse le temps de bouger
    // ------------------------------------------
    // exec() ne met jamais réellement en pause Python : sleep() se contente
    // d'empiler une action, tout le corps de la boucle s'exécute donc d'un
    // bloc. Pour un ruban LED ça n'a pas d'importance (rien ne dépend de son
    // état), mais un capteur de ligne DOIT voir la position mise à jour par
    // le tour précédent, pas 5 fois la même position de départ. La partie
    // Brython (index.html, lancer_simulation) isole donc le corps de la
    // PREMIERE boucle infinie de premier niveau et expose deux fonctions :
    // simu_tourSuivant() exécute un seul tour (et renvoie false en cas
    // d'erreur), simu_finDesTours() s'exécute une fois les tours épuisés.
    // C'est ici, côté JS, que le rythme réel (vider la file avec de vrais
    // délais avant d'enchaîner) est imposé.
    window.simu_lancerTours = function(nRestants) {
        if (nRestants <= 0) {
            if (typeof window.simu_finDesTours === 'function') window.simu_finDesTours();
            // Sur la vraie carte, "Repeter indefiniment" ne s'arrete jamais :
            // on enchaine donc un nouveau passage de 5 tours plutot que de
            // stopper la simulation, tant que rien n'a repris la main entre
            // temps (nouveau declenchement, reinitialisation - tous deux
            // passent par simu_clearQueue(), qui incremente jetonSimulation).
            // setTimeout(..., 0) casse la chaine d'appels synchrones a
            // chaque passage : sans lui, un programme sans aucun delai
            // (rien a rejouer dans la file) chainerait les passages en
            // recursion synchrone pure et finirait par depasser la pile.
            // Si le jeton a change, quelque chose de plus recent gere deja
            // simuEnCours correctement tout seul - rien a faire ici.
            const jeton = jetonSimulation;
            // Boucle sans aucune pause : on fait passer ici 20 ms entre deux passages, pour laisser
            // l'ecran se redessiner (sans cela, « afficher l'icone » seul dans « Repeter indefiniment »
            // laissait la matrice eteinte).
            const tempsImplicite = pauseDansPassage ? 0 : 20;
            pauseDansPassage = false;
            setTimeout(() => {
                if (jeton === jetonSimulation) window.simu_lancerTours(5);
            }, tempsImplicite);
            return;
        }
        window.simuEnCours = true;
        const succes = typeof window.simu_tourSuivant === 'function' ? window.simu_tourSuivant() : false;
        if (succes === false) { window.simuEnCours = false; return; }   // l'erreur est déjà affichée côté Brython
        const jeton = jetonSimulation;
        window._simuApresVidageFile = () => {
            if (jeton === jetonSimulation) window.simu_lancerTours(nRestants - 1);
        };
        window.simu_playQueue();
    };

    // ==========================================
    // 6. GESTION DES CLICS (BOUTONS, LOGO, BROCHES)
    // ==========================================
    window.simu_btnA_pressed = false;
    window.simu_btnB_pressed = false;
    window.simu_logo_pressed = false;
    window.simu_pin0_pressed = false;
    window.simu_pin1_pressed = false;
    window.simu_pin2_pressed = false;

    // Compteurs pour button_x.get_presses() (bloc "nombre de clics du bouton").
    // CONSOMMATEURS, comme sur la vraie carte (renvoient le total de clics
    // depuis le DERNIER appel, puis se remettent a zero) : la version
    // precedente de ce commentaire expliquait pourquoi un premier jet les
    // avait rendus non consommateurs (un simple total, remis a zero
    // seulement a la reinitialisation) pour contourner le fait que ce
    // simulateur n'execute jamais le programme en continu — mais ca
    // decalait le simulateur du comportement REEL de get_presses(), qui EST
    // consommateur. Resultat signale par l'utilisateur : « le mode
    // simulation fonctionne bien, par contre ça ne fonctionne pas en réel » —
    // le correctif non-consommateur ne faisait que masquer, dans le
    // simulateur seulement, un vrai piège du bloc "nombre de clics du
    // bouton" (voir P.forBlock['nombre_clics_bouton'] plus haut) : appele
    // directement dans "si nombre de clics == 10", get_presses() consomme
    // le compteur avant d'avoir pu accumuler quoi que ce soit d'utile, aussi
    // bien sur la vraie carte qu'en simulation. Corrige a la source (le
    // bloc genere maintenant son propre compteur cumulatif cote Python) :
    // ces deux compteurs-ci peuvent donc redevenir fidèles au materiel reel,
    // le meme code Python se comportant alors correctement dans les deux
    // environnements plutot que de compter sur une difference de simulateur.
    window.simu_btnA_clics = 0;
    window.simu_btnB_clics = 0;
    // Appui memorise pour button_x.was_pressed() : pose a l'appui, consomme a la lecture (un declenchement par appui).
    window.simu_appuiA = false;
    window.simu_appuiB = false;
    window.simu_consommerAppui = function(bouton) {
        const cle = bouton === 'a' ? 'simu_appuiA' : bouton === 'b' ? 'simu_appuiB' : null;
        if (!cle || !window[cle]) return false;
        window[cle] = false;
        return true;
    };
    window.simu_lireClicsBouton = function(bouton) {
        if (bouton === 'a') { const n = window.simu_btnA_clics; window.simu_btnA_clics = 0; return n; }
        if (bouton === 'b') { const n = window.simu_btnB_clics; window.simu_btnB_clics = 0; return n; }
        return 0;
    };

    // Vrai pendant les 5 tours d'un passage (voir simu_lancerTours plus bas) :
    // permet aux boutons/broches virtuels de ne PAS relancer toute la
    // simulation quand elle tourne déjà (voir lierCapteurTactile) — sinon un
    // appui pendant un passage en cours redémarre le programme depuis « Au
    // démarrage » (musique de lancement... tout repart de
    // zéro), au lieu d'être simplement vu par le passage déjà en cours.
    window.simuEnCours = false;

    // Geste en attente ('shake' ou null). Un geste est ponctuel : il ne vaut que
    // pour une exécution de la simulation, contrairement aux boutons qui sont
    // maintenus enfoncés.
    window.simu_geste = null;

    /** Lecture consommatrice, comme accelerometer.was_gesture() sur la carte. */
    window.simu_consommerGeste = function(geste) {
        if (window.simu_geste !== geste) return false;
        window.simu_geste = null;
        return true;
    };

    /** Lecture simple, comme accelerometer.is_gesture(). */
    window.simu_gesteActif = function(geste) {
        return window.simu_geste === geste;
    };

    const btnLancer = document.getElementById('run-sim');
    const carte = document.getElementById('microbit-board');

    // ------------------------------------------
    // MISE A L'ECHELLE DU SIMULATEUR
    // ------------------------------------------
    // La carte est dessinee en pixels fixes, a une taille volontairement
    // reduite d'un quart (elle ne doit pas remplir toute la largeur offerte,
    // ce qui laisse respirer les sections du panneau — peripheriques Grove,
    // radio, servomoteurs — placees au-dessous).
    //
    // Anciennement recalculee dynamiquement selon la largeur disponible
    // (agrandie jusqu'a 1.5x, reduite jusqu'a 0.55x) : demande explicite de
    // l'utilisateur de faire l'inverse, une fois le panneau redimensionnable
    // a la souris ajoute (voir plus haut) — agrandir le panneau ne doit PAS
    // agrandir la carte elle-meme, seulement lui laisser plus d'espace vide
    // autour (deja le cas tel quel : #simulator-container centre son contenu
    // via `align-items: center`, donc la carte se repositionne toute seule
    // sans qu'on ait besoin d'y toucher).
    const cadreCarte = document.getElementById('carte-cadre');
    const HAUTEUR_CARTE = 230;
    const REDUCTION = 0.75;

    function adapterEchelleSimulateur() {
        if (!cadreCarte || !carte) return;
        carte.style.transform = 'scale(' + REDUCTION + ')';
        // Un transform ne modifie pas la place occupee : le cadre s'en charge.
        cadreCarte.style.height = Math.round(HAUTEUR_CARTE * REDUCTION) + 'px';
    }

    adapterEchelleSimulateur();

    /**
     * Remet la simulation dans son état de départ.
     *
     * Vide la file, coupe le son et la parole, éteint les 25 LED et l'écran de
     * texte, relâche boutons, logo, broches et geste en attente, et efface le
     * message d'état. L'incrément du jeton neutralise les minuteurs encore en
     * vol : rien de l'exécution précédente ne peut plus reprendre la main.
     */
    window.simu_reinitialiser = function() {
        effacerConsole('sim');
        window.simu_uartFile = [];
        window.simuQueue = [];
        jetonSimulation++;
        arreterSon();
        // Sans quoi un appui sur un capteur virtuel juste apres "Reinitialiser"
        // poursuivrait la session perimee au lieu de repartir de "Au demarrage".
        if (window.simu_invaliderSession) window.simu_invaliderSession();
        window.simu_tempsDepart = performance.now();

        leds.forEach(led => led.classList.remove('on'));
        const conteneurTexte = document.getElementById('led-text-container');
        const contenuTexte = document.getElementById('led-text-content');
        if (conteneurTexte) conteneurTexte.style.display = 'none';
        if (contenuTexte) {
            contenuTexte.style.animation = 'none';
            contenuTexte.textContent = '';
        }
        if (carte) carte.classList.remove('secoue');

        window.simu_btnA_pressed = false;
        window.simu_btnB_pressed = false;
        window.simu_appuiA = window.simu_appuiB = false;
        window.simu_logo_pressed = false;
        window.simu_pin0_pressed = false;
        window.simu_pin1_pressed = false;
        window.simu_pin2_pressed = false;
        window.simu_btnA_clics = 0;
        window.simu_btnB_clics = 0;
        window.simu_geste = null;
        window.simuEnCours = false;
        window._simuApresVidageFile = null;

        reinitialiserGrove();
        afficherEtat('', false);
    };

    // Le geste Grove s'arme puis se joue, comme la secousse : il est ponctuel.
    if (boutonGesteGrove) {
        boutonGesteGrove.addEventListener('click', () => {
            gesteGroveEnAttente = menuGesteGrove.value;
            window.simu_continuerOuLancer();
            gesteGroveEnAttente = '';
        });
    }

    const btnReinit = document.getElementById('btn-reset');
    if (btnReinit) {
        btnReinit.addEventListener('click', () => {
            window.simu_reinitialiser();
            afficherEtat('Simulation réinitialisée.', false);
        });
    }

    /**
     * @param identifiantPython  L'identifiant MicroPython correspondant
     *   (`button_a`, `pin0`...) : si le code actuel ne le contient nulle
     *   part — ni lecture directe (`button_a.is_pressed()`), ni gestionnaire
     *   « lorsque » (`on_button_pressed_a`, qui scrute aussi `button_a`) —
     *   rien dans le programme ne peut réagir à cet appui, donc lancer une
     *   simulation pour lui n'aurait aucun effet visible : autant ne pas la
     *   déclencher. Signalé par l'utilisateur : « un appui sur A/B/broches
     *   0-1-2/logo déclenche la simulation même si aucun de ces connecteurs
     *   [n'est] affecté ». Simple recherche de sous-chaîne, pas une analyse
     *   du code : un faux positif (l'identifiant apparaît pour une autre
     *   raison, ex. une broche câblée à un module Grove) déclenche une
     *   simulation inutile mais inoffensive — c'est l'absence totale de
     *   l'identifiant qui est le seul cas visé ici.
     */
    function lierCapteurTactile(idHTML, nomVariableGlobale, identifiantPython) {
        const element = document.getElementById(idHTML);
        // Une simple sous-chaîne ne suffit pas : « pin1 » est aussi une
        // sous-chaîne de « pin12 »/« pin13 »/.../« pin16 » (broches Grove
        // valides, sans rapport avec la broche tactile 1) — un programme les
        // utilisant redéclenchait donc à tort la simulation en appuyant sur
        // la broche 1 virtuelle. `\b` (limite de mot) exclut ce cas : aucune
        // limite entre le « 1 » de « pin1 » et le « 2 » de « pin12», les deux
        // étant des caractères de mot.
        const motifIdentifiant = new RegExp('\\b' + identifiantPython + '\\b');
        if(element) {
            // La broche est un <rect> SVG transparent (voir .mb-edge) : ":active"
            // seul n'est pas assez fiable pour donner un retour visuel au clic,
            // d'ou une classe posee/retiree explicitement, comme le reste du
            // retour visuel de la carte (boutons, DEL).
            element.addEventListener('mousedown', () => {
                window[nomVariableGlobale] = true;
                element.classList.add('mb-edge-zone-active');
                // Compte aussi comme un "clic" pour get_presses() (voir plus
                // haut) — uniquement les boutons A/B, seuls concernés par ce
                // bloc (pas les broches ni le logo).
                if (idHTML === 'btn-a') { window.simu_btnA_clics++; window.simu_appuiA = true; }
                if (idHTML === 'btn-b') { window.simu_btnB_clics++; window.simu_appuiB = true; }
                // Un passage (5 tours, voir simu_lancerTours) est déjà en
                // cours : le drapeau qu'on vient de poser sera vu par ses
                // prochains tours tout seul. Relancer ici redémarrerait tout
                // le programme depuis « Au démarrage » —
                // musique de lancement, etc. — pour un simple appui de
                // bouton pendant que ça tourne déjà.
                const codeUtiliseCeCapteur = motifIdentifiant.test(window.currentPythonCode || '');
                if (codeUtiliseCeCapteur && !window.simuEnCours) window.simu_continuerOuLancer();
            });
            element.addEventListener('mouseup', () => {
                window[nomVariableGlobale] = false;
                element.classList.remove('mb-edge-zone-active');
            });
            element.addEventListener('mouseleave', () => {
                window[nomVariableGlobale] = false;
                element.classList.remove('mb-edge-zone-active');
            });
        }
    }

    lierCapteurTactile('btn-a', 'simu_btnA_pressed', 'button_a');
    lierCapteurTactile('btn-b', 'simu_btnB_pressed', 'button_b');
    lierCapteurTactile('mb-logo', 'simu_logo_pressed', 'pin_logo');
    lierCapteurTactile('pin0', 'simu_pin0_pressed', 'pin0');
    lierCapteurTactile('pin1', 'simu_pin1_pressed', 'pin1');
    lierCapteurTactile('pin2', 'simu_pin2_pressed', 'pin2');

    // Bouton « Secouer la carte » : arme le geste, lance la simulation, puis
    // désarme. Le tout est synchrone — le gestionnaire Brython de #run-sim
    // s'exécute pendant l'appel à click() — donc le geste est bien vu par le
    // programme, et par lui seul.
    const btnRadio = document.getElementById('grove-radio-envoi');
    if (btnRadio) {
        btnRadio.addEventListener('click', () => {
            const champ = document.getElementById('grove-radio-msg');
            messageRadioEnAttente = champ ? champ.value : '';
            window.simu_continuerOuLancer();
            messageRadioEnAttente = '';
        });
    }

    const btnSecouer = document.getElementById('btn-shake');
    if (btnSecouer) {
        btnSecouer.addEventListener('click', () => {
            if (carte) {
                carte.classList.remove('secoue');
                void carte.offsetWidth;      // force le redémarrage de l'animation
                carte.classList.add('secoue');
            }
            window.simu_geste = 'shake';
            window.simu_continuerOuLancer();
            window.simu_geste = null;
        });
    }

    // Tout le panneau Grove est en place : on peut le montrer, et le laisser
    // se mettre à jour à chaque modification du programme.
    panneauGrovePret = true;
    rafraichirPanneauGrove();

    const btnAB = document.getElementById('btn-ab');
    if (btnAB) {
        btnAB.addEventListener('mousedown', () => {
            window.simu_btnA_pressed = true;
            window.simu_btnB_pressed = true;
            window.simu_appuiA = window.simu_appuiB = true;   // comme sur la carte : A et B sont tous deux appuyes
            window.simu_continuerOuLancer();
        });
        btnAB.addEventListener('mouseup', () => {
            window.simu_btnA_pressed = false;
            window.simu_btnB_pressed = false;
        });
        btnAB.addEventListener('mouseleave', () => {
            window.simu_btnA_pressed = false;
            window.simu_btnB_pressed = false;
        });
    }

} catch(erreur) {
    console.error(erreur);
    const zone = document.getElementById('etat');
    if (zone) {
        zone.textContent = "Chargement de l'interface impossible : " + erreur.message;
        zone.classList.add('erreur');
    } else {
        alert("Une erreur est survenue lors du chargement de Blockly : " + erreur.message);
    }
}
