/* ══════════════════════════════════════════════════════════════════════════
   EasyBloc micro:bit — données des fiches d'aide en français (étape 10, nov. 2026).

   Une entrée par fiche (même schéma que le modèle EasyBloc R4) :
     t        type du bloc (fichier aide/<t>.html)
     titre    ce qui est écrit sur le bloc (… à la place des cases)
     sert     « À quoi ça sert ? » (texte, ou tableau de paragraphes)
     valeur   pour un bloc rond : 'nombre', 'logique', 'texte' ou 'liste'
     util     « Comment l'utiliser ? » (replié à l'ouverture)
     savoir   « À savoir » : broches, plages, unités, temps, pièges (replié à l'ouverture)
     legende  ce que fait le programme d'exemple
     exemple  programme d'exemple COMPLET (blocs au format Blockly, liste des blocs de tête) ;
              sans « exemple », celui de l'aide d'avant (exempleDe, ou le type du bloc) est repris.
   Dans les textes, **mot** s'affiche en gras.
   Règles de rédaction (PROMPT.md) : mots simples ; dire ce que le bloc RENVOIE ; « le bloc « … » » pour citer un
   autre bloc ; plage et précision d'un capteur seulement si la documentation du module exact les donne.
   ══════════════════════════════════════════════════════════════════════════ */
/* Petits outils pour écrire les programmes d'exemple (format de sérialisation Blockly). */
function B(type, champs, entrees) { var b = { type: type }; if (champs) b.fields = champs; if (entrees) b.inputs = entrees; return b; }
function V(b) { return { block: b }; }
function N(n) { return V(B('math_number', { NUM: n })); }
function S() { var bs = Array.prototype.slice.call(arguments); for (var i = bs.length - 2; i >= 0; i--) bs[i].next = { block: bs[i + 1] }; return { block: bs[0] }; }
function T(s) { return V(B('text', { TEXT: s })); }
function ICONE(i) { return B('afficher_icone', { ICONE: i }); }
function ATT(s) { return B('attendre_temps', { UNITE: 's' }, { TEMPS: N(s) }); }

function SI(cond, alors, sinon) { var b = B('controls_if', null, { IF0: V(cond), DO0: alors }); if (sinon) { b.extraState = { hasElse: true }; b.inputs.ELSE = sinon; } return b; }
function BOUTON(x) { return B('bouton_est_appuye', { BOUTON: x }); }
function VAR(n) { return B('variables_get', { VAR: { name: n } }); }
function DEF(n, val) { return B('variables_set', { VAR: { name: n } }, { VALUE: val }); }
function AFF(v) { return B('afficher_valeur', null, { VALEUR: V(v) }); }
function DEFILE(v) { return B('faire_defiler', null, { VALEUR: V(v) }); }
function APPEL(n) { return Object.assign(B('procedures_callnoreturn'), { extraState: { name: n } }); }
function START() { return B('au_demarrage', null, { DO: S.apply(null, arguments) }); }
function LOOP() { return B('boucle_infinie', null, { DO: S.apply(null, arguments) }); }
function QUAND(type, champs) { return B(type, champs, { DO: S.apply(null, Array.prototype.slice.call(arguments, 2)) }); }

window.FICHES = [
  {
    t: 'afficher_icone',
    titre: 'afficher l\'icône …',
    sert: 'Allume sur la **matrice de LED** de la carte une petite image toute prête : un cœur, un visage heureux, un visage triste ou un fantôme.',
    util: [
      'Choisissez l\'icône dans la liste du bloc.',
      'Placez le bloc dans le bloc « au démarrage » pour l\'afficher une fois, ou dans le bloc « répéter indéfiniment » avec le bloc « attendre » pour faire une animation.',
    ],
    savoir: [
      'L\'icône **reste affichée** jusqu\'au prochain affichage, ou jusqu\'au bloc « effacer l\'écran ».',
      'Pour dessiner votre propre image, LED par LED, utilisez le bloc « afficher l\'image ».',
    ],
    legende: 'Le cœur s\'affiche une seconde, puis s\'efface une seconde, sans fin.',
  },
  {
    t: 'grove_led_etat',
    titre: '[LED] contrôler la LED à … sur la broche …',
    sert: 'Allume ou éteint le **module LED Grove** branché sur une broche de la carte.',
    util: [
      'Choisissez **HAUT (1)** pour allumer la LED, **BAS (0)** pour l\'éteindre.',
      'Choisissez la broche où le câble du module est branché (P0, P1, P2…).',
    ],
    savoir: [
      'C\'est **tout ou rien** : pour régler la luminosité, utilisez le bloc « [LED] régler la luminosité à … ».',
      'Sur la Grove Shield, le port **P0/P14** correspond à la broche P0, le port **P1/P15** à P1, le port **P2/P16** à P2.',
      'La LED reste dans son état jusqu\'au prochain bloc qui la commande.',
    ],
    legende: 'La LED branchée sur P0 s\'allume une seconde, puis s\'éteint une seconde, sans fin.',
  },
  {
    t: 'grove_potentiometre',
    titre: 'potentiomètre sur … en …',
    sert: 'Renvoie la position du bouton du **potentiomètre Grove** (bouton que l\'on tourne).',
    valeur: 'nombre',
    util: [
      'Choisissez la broche du module : **P0, P1 ou P2** (les entrées analogiques).',
      'Choisissez l\'unité : la **valeur brute** de 0 à 1023, l\'**angle** de 0 à 300° (la course du bouton) ou le **pourcentage** de 0 à 100 %.',
    ],
    savoir: [
      'Seules les broches **P0, P1 et P2** savent lire une valeur entre 0 et 1023.',
      'Dans le simulateur, tournez le bouton dessiné dans le montage, ou le curseur « Potentiomètre » du tableau « Périphériques ».',
    ],
    legende: 'L\'angle du potentiomètre branché sur P0 s\'affiche sur la matrice de LED, puis la mesure recommence.',
  },
  {
    t: 'grove_pir',
    titre: 'mouvement détecté sur …',
    sert: 'Renvoie **vrai** quand le **détecteur de mouvement Grove** (capteur PIR) voit bouger une personne ou un animal devant lui, **faux** sinon.',
    valeur: 'logique',
    util: [
      'Choisissez la broche où le détecteur est branché.',
      'Mettez ce bloc directement dans un bloc « si ».',
    ],
    savoir: [
      'Il sent la **chaleur d\'un corps qui bouge** : un objet froid qui bouge ne le déclenche pas.',
      'Après un mouvement, il reste à **vrai** quelques secondes.',
      'Dans le simulateur, cliquez sur la lentille blanche du détecteur dans le montage, ou cochez « mouvement détecté » dans le tableau « Périphériques ».',
    ],
    legende: 'Le buzzer branché sur P1 bipe quand le détecteur de mouvement branché sur P0 voit bouger.',
  },
  // ═══════════════ Boucles ═══════════════
  {
    t: 'au_demarrage',
    titre: 'au démarrage',
    sert: 'Exécute **une seule fois** les blocs placés à l\'intérieur, quand la carte démarre.',
    util: [
      'Placez dedans ce qui ne doit se faire qu\'une fois : un message d\'accueil, le réglage d\'un module, la valeur de départ d\'une variable.',
      'Accrochez le bloc « répéter indéfiniment » juste en dessous pour la suite du programme.',
    ],
    savoir: [
      'Il n\'y a **qu\'un seul** bloc « au démarrage » par programme.',
      'Rien ne s\'accroche au-dessus : c\'est toujours le premier bloc du programme.',
    ],
    legende: 'Le mot « Prêt » défile une fois au démarrage, puis un visage heureux reste affiché.',
  },
  {
    t: 'boucle_infinie',
    titre: 'répéter indéfiniment',
    sert: 'Répète **sans fin** les blocs placés à l\'intérieur. C\'est la boucle principale du programme.',
    util: [
      'Accrochez-le sous le bloc « au démarrage ».',
      'Placez dedans ce que la carte doit faire en permanence : lire un capteur, afficher une valeur, tester un bouton.',
    ],
    savoir: [
      'La carte ne sort jamais de cette boucle : les blocs accrochés **en dessous** ne s\'exécutent jamais.',
      'Ajoutez un bloc « attendre » pour ralentir la boucle, par exemple pour laisser le temps de lire une valeur.',
    ],
    legende: 'Le cœur s\'affiche une seconde, puis s\'efface une seconde, sans fin.',
  },
  {
    t: 'controls_repeat_ext',
    titre: 'répéter … fois',
    sert: 'Répète les blocs placés dans « faire » le **nombre de fois** choisi, puis passe à la suite du programme.',
    util: [
      'Écrivez le nombre de tours dans la case, ou mettez-y un bloc qui renvoie un nombre (une variable, par exemple).',
      'Placez dans « faire » les blocs à répéter.',
    ],
    savoir: [
      'Avec **0** dans la case, les blocs de « faire » ne s\'exécutent pas.',
      'Pour connaître le numéro du tour en cours, utilisez plutôt le bloc « compter avec … de … à … par … ».',
    ],
    legende: 'Au démarrage, le cœur clignote 3 fois, puis un visage heureux reste affiché.',
    exemple: [B('au_demarrage', null, { DO: S(
      B('controls_repeat_ext', null, { TIMES: N(3), DO: S(ICONE('HEART'), ATT(0.5), B('effacer_ecran'), ATT(0.5)) }),
      ICONE('HAPPY')) })],
  },
  {
    t: 'controls_whileUntil',
    titre: 'répéter tant que … / répéter jusqu\'à ce que …',
    sert: 'Répète les blocs placés dans « faire » **tant qu\'une condition est vraie** (« tant que »), ou **jusqu\'à ce qu\'elle devienne vraie** (« jusqu\'à ce que »).',
    util: [
      'Choisissez « tant que » ou « jusqu\'à ce que » dans la liste du bloc.',
      'Accrochez dans la case une condition : un bloc qui renvoie vrai ou faux (bouton appuyé, comparaison…).',
      'Placez dans « faire » les blocs à répéter.',
    ],
    savoir: [
      'La condition est testée **au début de chaque tour** : si elle est déjà fausse (« tant que ») ou déjà vraie (« jusqu\'à ce que ») au départ, les blocs de « faire » ne s\'exécutent pas.',
      'Si la condition ne change jamais, la boucle ne s\'arrête jamais et la suite du programme ne s\'exécute pas.',
      'Dans le simulateur, une condition qui dépend d\'un bouton ou d\'un capteur ne peut pas changer pendant que la boucle tourne : une telle boucle ne fonctionne que sur la vraie carte. Dans le simulateur, testez plutôt le bouton avec un bloc « si » placé dans le bloc « répéter indéfiniment ».',
    ],
    legende: 'Au démarrage, la carte tire un nombre au hasard entre 1 et 6 et l\'affiche, jusqu\'à obtenir un 6 ; ensuite un visage heureux reste affiché.',
    exemple: [B('au_demarrage', null, { DO: S(
      B('variables_set', { VAR: { name: 'dé' } }, { VALUE: N(0) }),
      B('controls_whileUntil', { MODE: 'UNTIL' }, {
        BOOL: V(B('logic_compare', { OP: 'EQ' }, { A: V(B('variables_get', { VAR: { name: 'dé' } })), B: N(6) })),
        DO: S(B('variables_set', { VAR: { name: 'dé' } }, { VALUE: V(B('math_random_int', null, { FROM: N(1), TO: N(6) })) }),
              B('afficher_valeur', null, { VALEUR: V(B('variables_get', { VAR: { name: 'dé' } })) }), ATT(1)) }),
      ICONE('HAPPY')) })],
  },
  {
    t: 'controls_for',
    titre: 'compter avec … de … à … par …',
    sert: 'Répète les blocs placés dans « faire » en faisant **compter une variable** : elle prend la valeur de départ, puis augmente du pas choisi à chaque tour, jusqu\'à la valeur d\'arrivée.',
    util: [
      'Choisissez la variable dans la liste du bloc (**i** au départ).',
      'Écrivez la valeur de départ, la valeur d\'arrivée et le pas (de combien la variable change à chaque tour).',
      'Dans « faire », utilisez le bloc de la variable (catégorie « Variables ») pour connaître le numéro du tour.',
    ],
    savoir: [
      'La valeur d\'arrivée **est comprise** : « de 1 à 5 par 1 » fait 5 tours (1, 2, 3, 4, 5).',
      'Si la valeur de départ est plus grande que la valeur d\'arrivée, la variable diminue : « de 5 à 1 par 1 » compte 5, 4, 3, 2, 1.',
    ],
    legende: 'Au démarrage, les nombres 1, 2, 3, 4 et 5 s\'affichent l\'un après l\'autre, puis un visage heureux reste affiché.',
    exemple: [B('au_demarrage', null, { DO: S(
      B('controls_for', { VAR: { name: 'i' } }, { FROM: N(1), TO: N(5), BY: N(1),
        DO: S(B('afficher_valeur', null, { VALEUR: V(B('variables_get', { VAR: { name: 'i' } })) }), ATT(1)) }),
      ICONE('HAPPY')) })],
  },

  // ═══════════════ Temps ═══════════════
  {
    t: 'attendre_temps',
    titre: 'attendre … seconde.s',
    sert: 'Met le programme **en pause** pendant la durée choisie, puis passe au bloc suivant.',
    util: [
      'Écrivez la durée dans la case, ou mettez-y un bloc qui renvoie un nombre.',
      'Choisissez l\'unité : **secondes** ou **millisecondes** (1 seconde = 1000 millisecondes).',
    ],
    savoir: [
      'Pendant la pause, **rien d\'autre** ne s\'exécute.',
      'En secondes, un nombre à virgule s\'écrit avec un point : **0.5** attend une demi-seconde.',
    ],
    legende: 'Le cœur s\'affiche une seconde, puis s\'efface une seconde, sans fin.',
  },
  {
    t: 'attendre_jusqua',
    titre: 'attendre jusqu\'à …',
    sert: 'Met le programme en pause **jusqu\'à ce qu\'une condition devienne vraie**, puis passe au bloc suivant.',
    util: [
      'Accrochez dans la case une condition : un bloc qui renvoie vrai ou faux (bouton appuyé, mouvement détecté, comparaison…).',
    ],
    savoir: [
      'La condition est vérifiée toutes les **10 millisecondes**.',
      'Dans le bloc « au démarrage », le programme attend vraiment, simulateur compris. Dans le bloc « répéter indéfiniment », le simulateur passe le tour tant que la condition est fausse et réessaie au tour suivant.',
    ],
    legende: 'Un visage triste reste affiché tant que l\'on n\'appuie pas sur le bouton A ; ensuite un cœur apparaît.',
  },
  {
    t: 'repeter_toutes_les',
    titre: 'répéter toutes les … h … min … s … ms',
    sert: 'Répète **sans fin** les blocs placés à l\'intérieur, avec une pause de la durée choisie après chaque passage.',
    util: [
      'Écrivez la durée en heures, minutes, secondes et millisecondes : les cases s\'additionnent (0 h 1 min 30 s 0 ms = une minute et demie).',
      'Placez dedans les blocs à répéter, par exemple une mesure à afficher.',
    ],
    savoir: [
      'La pause vient **après** les blocs : un tour dure le temps des blocs, plus la pause.',
      'C\'est une boucle sans fin : les blocs accrochés **en dessous** ne s\'exécutent jamais.',
    ],
    legende: 'La température de la carte s\'affiche, puis la mesure recommence 5 secondes plus tard.',
  },
  {
    t: 'reset_chrono',
    titre: 'remettre le chronomètre à 0',
    sert: 'Fait **repartir de 0** le chronomètre du programme.',
    util: [
      'Placez-le au moment où la mesure doit commencer : dans le bloc « au démarrage », ou quand un bouton est pressé.',
      'Lisez ensuite le temps écoulé avec le bloc « valeur du chronomètre en … ».',
    ],
    savoir: [
      'Il n\'y a **qu\'un seul** chronomètre dans le programme : chaque bloc « remettre le chronomètre à 0 » le fait repartir de 0.',
    ],
    legende: 'Le chronomètre part de 0 au démarrage, puis le temps écoulé, en secondes, s\'affiche chaque seconde.',
  },
  {
    t: 'valeur_chrono',
    titre: 'valeur du chronomètre en …',
    sert: 'Renvoie le **temps écoulé** depuis le dernier bloc « remettre le chronomètre à 0 ».',
    valeur: 'nombre',
    util: [
      'Choisissez l\'unité : **(s)** pour les secondes, **(ms)** pour les millisecondes.',
      'Mettez ce bloc dans un bloc qui attend un nombre : afficher, comparer, ranger dans une variable.',
    ],
    savoir: [
      'Sans bloc « remettre le chronomètre à 0 », le temps est compté depuis le démarrage de la carte.',
      'En secondes, le résultat peut être un nombre à virgule (par exemple 2.5).',
    ],
    legende: 'Le chronomètre part de 0 au démarrage, puis le temps écoulé, en secondes, s\'affiche chaque seconde.',
  },
  // ═══════════════ Matrice LED ═══════════════
  {
    t: 'afficher_valeur',
    titre: 'afficher …',
    sert: 'Montre un **nombre** ou un **texte** sur la **matrice de LED** de la carte.',
    util: [
      'Accrochez dans la case un nombre, un texte, ou un bloc qui renvoie une valeur (une mesure, une variable…).',
    ],
    savoir: [
      'Un texte de plusieurs caractères s\'affiche **un caractère après l\'autre**, sans défiler ; le dernier reste allumé.',
      'Pour faire glisser un texte de droite à gauche, utilisez le bloc « faire défiler ».',
      'La valeur reste affichée jusqu\'au prochain affichage, ou jusqu\'au bloc « effacer l\'écran ».',
    ],
    legende: 'Un nombre au hasard entre 1 et 6 s\'affiche, puis un autre 2 secondes plus tard, sans fin.',
  },
  {
    t: 'faire_defiler',
    titre: 'faire défiler …',
    sert: 'Fait **glisser** un texte ou un nombre de droite à gauche sur la **matrice de LED**.',
    util: [
      'Accrochez dans la case un texte, un nombre, ou un bloc qui renvoie une valeur.',
    ],
    savoir: [
      'Le programme **attend la fin du défilement** avant de passer au bloc suivant : un long texte prend plusieurs secondes.',
      'À la fin du défilement, la matrice est éteinte.',
    ],
    legende: 'Le texte « Bonjour ! » défile une fois au démarrage.',
  },
  {
    t: 'afficher_image_matrice',
    titre: 'afficher l\'image …',
    sert: 'Allume sur la **matrice de LED** une image que vous dessinez vous-même, LED par LED.',
    util: [
      'Chaque case du bloc correspond à une LED de la matrice : cochez les cases des LED à allumer.',
    ],
    savoir: [
      'La grille du bloc a la même disposition que la matrice : **5 lignes de 5 LED**.',
      'Les LED cochées s\'allument à **pleine luminosité**.',
      'L\'image reste affichée jusqu\'au prochain affichage, ou jusqu\'au bloc « effacer l\'écran ».',
    ],
    legende: 'Un sourire dessiné case par case s\'affiche au démarrage.',
  },
  {
    t: 'effacer_ecran',
    titre: 'effacer l\'écran',
    sert: '**Éteint toutes les LED** de la matrice de la carte.',
    util: [
      'Placez-le après un affichage pour le faire disparaître, par exemple avec le bloc « attendre » pour faire clignoter une image.',
    ],
    savoir: [
      'Il n\'éteint que la matrice de LED : les modules branchés sur la carte (LED, afficheurs…) ne changent pas.',
    ],
    legende: 'Le cœur s\'affiche une seconde, puis s\'efface une seconde, sans fin.',
  },
  {
    t: 'afficher_console',
    titre: 'afficher dans la console …',
    sert: 'Écrit un nombre ou un texte dans la **console**, sur une nouvelle ligne à chaque fois. Pratique pour suivre des mesures sans occuper la matrice de LED.',
    util: [
      'Accrochez dans la case un texte, un nombre, ou un bloc qui renvoie une valeur.',
      'Ouvrez la console avec le bouton « Afficher la console » de la barre d\'outils, en haut : elle s\'ouvre en bas de l\'écran.',
    ],
    savoir: [
      'Sur la vraie carte, le texte part par le **câble USB** : il s\'affiche dans la console après « Connecter » (navigateur Chrome ou Edge).',
      'Rien ne s\'affiche sur la matrice de LED.',
    ],
    legende: 'Le mot « Démarrage » s\'écrit une fois, puis la température de la carte s\'écrit chaque seconde dans la console.',
  },
  // ═══════════════ Entrées/Sorties ═══════════════
  {
    t: 'si_bouton_appuye',
    titre: 'si le bouton … est appuyé alors',
    sert: 'Exécute les blocs placés à l\'intérieur **si le bouton choisi est enfoncé** au moment où le programme passe sur ce bloc.',
    util: [
      'Choisissez le bouton : **A**, **B**, ou **A+B** (les deux en même temps).',
      'Placez ce bloc dans le bloc « répéter indéfiniment » pour surveiller le bouton en permanence.',
    ],
    savoir: [
      'Le bouton n\'est regardé qu\'au **passage du programme** : pendant un bloc « attendre », un appui très court peut passer inaperçu.',
      'Pour réagir à chaque appui, même court, utilisez plutôt le bloc « lorsque le bouton … est pressé ».',
      'Dans le simulateur, appuyez sur les boutons A et B de la carte dessinée.',
    ],
    legende: 'Le bouton A affiche un visage heureux, le bouton B efface l\'écran.',
  },
  {
    t: 'si_logo_touche',
    titre: 'si LOGO est touché alors',
    sert: 'Exécute les blocs placés à l\'intérieur **si le logo tactile** de la carte est touché au moment où le programme passe sur ce bloc.',
    util: [
      'Placez ce bloc dans le bloc « répéter indéfiniment » pour surveiller le logo en permanence.',
    ],
    savoir: [
      'Le logo tactile est le petit dessin doré au-dessus de la matrice de LED : il n\'existe que sur la carte **micro:bit V2**.',
      'Un simple contact du doigt suffit, sans appuyer.',
      'Dans le simulateur, cliquez sur le logo de la carte dessinée.',
    ],
    legende: 'Un cœur s\'affiche quand le logo est touché.',
  },
  {
    t: 'si_secoue_alors',
    titre: 'si secoué alors',
    sert: 'Exécute les blocs placés à l\'intérieur **si la carte a été secouée** depuis le dernier passage du programme sur ce bloc.',
    util: [
      'Placez ce bloc dans le bloc « répéter indéfiniment ».',
    ],
    savoir: [
      'Chaque secousse n\'est comptée **qu\'une seule fois** : au passage suivant, le bloc attend une nouvelle secousse.',
      'Pour savoir si la carte est secouée **en ce moment**, utilisez le bloc « geste … est actif ».',
      'Dans le simulateur, cliquez sur le bouton « Secouer la carte », sous la carte dessinée.',
    ],
    legende: 'À chaque secousse, un fantôme apparaît une seconde.',
  },
  {
    t: 'bouton_est_appuye',
    titre: 'bouton … est appuyé',
    sert: 'Renvoie **vrai** tant que le bouton choisi est enfoncé, **faux** sinon.',
    valeur: 'logique',
    util: [
      'Choisissez le bouton : **A**, **B**, ou **A+B** (les deux en même temps).',
      'Mettez ce bloc dans un bloc « si » ou « attendre jusqu\'à ».',
    ],
    savoir: [
      'Il renvoie l\'état du bouton **au moment** où le programme le lit : un appui très court, pendant un bloc « attendre », peut passer inaperçu.',
      'Dans le simulateur, appuyez sur les boutons A et B de la carte dessinée.',
    ],
    legende: 'Le bouton A affiche un cœur, le bouton B efface l\'écran.',
  },
  {
    t: 'logo_est_touche',
    titre: 'le logo est appuyé',
    sert: 'Renvoie **vrai** tant que le logo tactile de la carte est touché, **faux** sinon.',
    valeur: 'logique',
    util: [
      'Mettez ce bloc dans un bloc « si » ou « attendre jusqu\'à ».',
    ],
    savoir: [
      'Le logo tactile n\'existe que sur la carte **micro:bit V2**.',
      'Dans le simulateur, cliquez sur le logo de la carte dessinée.',
    ],
    legende: 'Un cœur s\'affiche tant que le logo est touché.',
  },
  {
    t: 'nombre_clics_bouton',
    titre: 'nombre de clics du bouton …',
    sert: 'Renvoie le **nombre total de clics** sur le bouton choisi depuis le démarrage de la carte.',
    valeur: 'nombre',
    util: [
      'Choisissez le bouton : **A** ou **B**.',
      'Comparez le résultat à un nombre dans un bloc « si », ou affichez-le.',
    ],
    savoir: [
      'Le compteur **ne se remet jamais à 0** tout seul : il compte tous les clics depuis le démarrage, même espacés.',
      'Un clic est compté même si le programme était occupé ailleurs à ce moment-là.',
    ],
    legende: 'Un cœur s\'affiche quand le bouton B a été pressé 10 fois en tout.',
  },
  {
    t: 'reinitialiser_microbit',
    titre: '[Micro:bit] réinitialiser la carte',
    sert: '**Redémarre la carte** : le programme recommence depuis le début, comme après un appui sur le bouton reset, au dos de la carte.',
    util: [
      'Placez-le à l\'endroit où le programme doit repartir de zéro, par exemple quand un bouton est pressé.',
    ],
    savoir: [
      'Rien ne peut s\'accrocher sous ce bloc : la carte redémarre aussitôt.',
      'Les variables reprennent leur valeur de départ et le chronomètre repart de 0.',
    ],
    legende: 'Un cœur s\'affiche à chaque démarrage ; le bouton A redémarre la carte.',
  },
  // ═══════════════ Capteurs ═══════════════
  {
    t: 'lorsque_bouton',
    titre: 'lorsque le bouton … est pressé',
    sert: 'Exécute les blocs placés à l\'intérieur **à chaque appui** sur le bouton choisi.',
    util: [
      'Choisissez le bouton : **A**, **B**, ou **A+B** (les deux en même temps).',
      'Posez ce bloc seul dans l\'espace de travail : il ne s\'accroche à aucun autre bloc.',
    ],
    savoir: [
      'Un appui ne déclenche le bloc **qu\'une fois**, même si le bouton reste enfoncé.',
      'Un appui sur **A+B** ne déclenche pas en plus les blocs « lorsque le bouton A » et « lorsque le bouton B ».',
      'Le bouton est surveillé à chaque tour de la boucle principale du programme (ajoutée automatiquement s\'il n\'y en a pas).',
      'Dans le simulateur, appuyez sur les boutons A et B de la carte dessinée.',
    ],
    legende: 'Le bouton A affiche un visage heureux, le bouton B efface l\'écran.',
  },
  {
    t: 'lorsque_geste',
    titre: 'lorsque …',
    sert: 'Exécute les blocs placés à l\'intérieur quand la carte fait le **geste** choisi : secouée, logo vers le haut ou logo vers le bas.',
    util: [
      'Choisissez le geste dans la liste du bloc.',
      'Posez ce bloc seul dans l\'espace de travail : il ne s\'accroche à aucun autre bloc.',
    ],
    savoir: [
      'Chaque geste ne déclenche le bloc **qu\'une fois** par mouvement.',
      'Dans le simulateur, seul le geste « secouer » existe : cliquez sur le bouton « Secouer la carte », sous la carte dessinée.',
    ],
    legende: 'Quand on secoue la carte, un fantôme apparaît une seconde.',
  },
  {
    t: 'lorsque_broche',
    titre: 'lorsque la broche … est …',
    sert: 'Exécute les blocs placés à l\'intérieur quand la broche **P0, P1 ou P2** est touchée avec le doigt (« activée »), ou quand on la lâche (« relâchée »).',
    util: [
      'Choisissez la broche, puis « activée » ou « relâchée ».',
      'Posez ce bloc seul dans l\'espace de travail : il ne s\'accroche à aucun autre bloc.',
    ],
    savoir: [
      '**Un seul doigt** sur la broche suffit : le mode tactile de la carte V2 est activé automatiquement.',
      'Une broche utilisée comme touche ne doit pas servir en même temps à un module branché.',
      'Dans le simulateur, cliquez sur la broche 0, 1 ou 2 de la carte dessinée.',
    ],
    legende: 'Un doigt sur P0 affiche un visage heureux pendant une seconde.',
  },
  {
    t: 'lorsque_son_detecte',
    titre: 'lorsque le son … est détecté',
    sert: 'Exécute les blocs placés à l\'intérieur quand le **micro** de la carte entend un son **bruyant**, ou quand il redevient **faible**.',
    util: [
      'Choisissez « bruyant » ou « faible ».',
      'Posez ce bloc seul dans l\'espace de travail : il ne s\'accroche à aucun autre bloc.',
    ],
    savoir: [
      'Le micro n\'existe que sur la carte **micro:bit V2**.',
      'Le niveau qui sépare « bruyant » et « faible » se règle avec le bloc « définit le seuil du son ».',
      'Le simulateur n\'entend aucun son : ce bloc ne se déclenche que sur la vraie carte.',
    ],
    legende: 'Un bruit fort fait apparaître un visage triste une seconde.',
  },
  {
    t: 'lorsque_logo',
    titre: 'sur le logo …',
    sert: 'Exécute les blocs placés à l\'intérieur quand le **logo tactile** de la carte est touché (« appuyé »), ou quand on le lâche (« relâché »).',
    util: [
      'Choisissez « appuyé » ou « relâché ».',
      'Posez ce bloc seul dans l\'espace de travail : il ne s\'accroche à aucun autre bloc.',
    ],
    savoir: [
      'Le logo tactile n\'existe que sur la carte **micro:bit V2**.',
      'Dans le simulateur, cliquez sur le logo de la carte dessinée.',
    ],
    legende: 'Un cœur s\'affiche quand on touche le logo.',
  },
  {
    t: 'capteur_acceleration',
    titre: 'accélération (mg) …',
    sert: 'Renvoie l\'**accélération** mesurée par la carte selon l\'axe **x**, **y** ou **z**, ou la **force** totale.',
    valeur: 'nombre',
    util: [
      'Choisissez l\'axe : **x** (gauche-droite), **y** (avant-arrière), **z** (haut-bas), ou **force** (les trois ensemble).',
    ],
    savoir: [
      'L\'unité est le **milli-g (mg)** : 1000 mg correspondent à la pesanteur terrestre. Carte posée à plat, l\'axe vertical mesure donc environ 1000 mg.',
      'L\'étendue de mesure se règle avec le bloc « spécifier la gamme de l\'accéléromètre ».',
      'Dans le simulateur, la carte est toujours immobile et à plat : essayez le programme sur la vraie carte.',
    ],
    legende: 'L\'accélération sur l\'axe x s\'affiche chaque seconde sur la matrice de LED.',
  },
  {
    t: 'broche_est_pressee',
    titre: 'broche … est pressée',
    sert: 'Renvoie **vrai** tant que la broche **P0, P1 ou P2** est touchée avec le doigt, **faux** sinon.',
    valeur: 'logique',
    util: [
      'Choisissez la broche.',
      'Mettez ce bloc dans un bloc « si » ou « attendre jusqu\'à ».',
    ],
    savoir: [
      '**Un seul doigt** sur la broche suffit : le mode tactile de la carte V2 est activé automatiquement.',
      'Dans le simulateur, cliquez sur la broche 0, 1 ou 2 de la carte dessinée.',
    ],
    legende: 'Un visage heureux s\'affiche tant que la broche P0 est touchée.',
  },
  {
    t: 'capteur_luminosite',
    titre: 'niveau d\'intensité lumineuse',
    sert: 'Renvoie le **niveau de lumière** autour de la carte, de **0** (obscurité) à **255** (très lumineux).',
    valeur: 'nombre',
    util: [
      'Affichez la valeur, ou comparez-la à un nombre dans un bloc « si » (par exemple pour allumer une LED quand il fait sombre).',
    ],
    savoir: [
      'La lumière est mesurée par la **matrice de LED** elle-même : il n\'y a pas de capteur à part.',
      'Dans le simulateur, cette mesure ne varie pas (elle vaut toujours 128) : essayez le programme sur la vraie carte.',
    ],
    legende: 'Le niveau de lumière s\'affiche chaque seconde sur la matrice de LED.',
  },
  {
    t: 'capteur_boussole_direction',
    titre: 'direction de la boussole (°)',
    sert: 'Renvoie la **direction** vers laquelle pointe le haut de la carte, en degrés : **0** pour le nord, 90 pour l\'est, 180 pour le sud, 270 pour l\'ouest.',
    valeur: 'nombre',
    util: [
      'Tenez la carte à plat pour une mesure juste.',
      'Placez le bloc « calibrer la boussole » dans le bloc « au démarrage ».',
    ],
    savoir: [
      'Si la boussole n\'a pas encore été calibrée, la carte lance d\'abord la calibration.',
      'Un aimant, un moteur ou un objet en fer près de la carte fausse la direction.',
      'Dans le simulateur, cette mesure ne varie pas (elle vaut toujours 0) : essayez le programme sur la vraie carte.',
    ],
    legende: 'La boussole est calibrée une fois au démarrage, puis la direction s\'affiche chaque seconde.',
    exempleDe: 'capteur_boussole_calibrer',
  },
  {
    t: 'capteur_temperature',
    titre: 'température (° C)',
    sert: 'Renvoie la **température** mesurée par la carte, en **degrés Celsius**.',
    valeur: 'nombre',
    util: [
      'Affichez la valeur, ou comparez-la à un nombre dans un bloc « si ».',
    ],
    savoir: [
      'C\'est la température de la **puce** de la carte : elle est un peu plus élevée que celle de l\'air autour.',
      'Dans le simulateur, cette mesure ne varie pas (elle vaut toujours 21 °C) : essayez le programme sur la vraie carte.',
    ],
    legende: 'La température de la carte s\'affiche chaque seconde sur la matrice de LED.',
  },
  {
    t: 'geste_est_actif',
    titre: 'geste … est actif',
    sert: 'Renvoie **vrai** tant que la carte fait le geste choisi (secouée, logo vers le haut, logo vers le bas), **faux** sinon.',
    valeur: 'logique',
    util: [
      'Choisissez le geste dans la liste du bloc.',
      'Mettez ce bloc dans un bloc « si » ou « attendre jusqu\'à ».',
    ],
    savoir: [
      'Il reste **vrai pendant tout le geste**, contrairement au bloc « si secoué alors » qui ne compte chaque secousse qu\'une fois.',
      'Dans le simulateur, seul le geste « secouer » existe : cliquez sur le bouton « Secouer la carte », sous la carte dessinée.',
    ],
    legende: 'Un visage triste s\'affiche tant que la carte est secouée.',
  },
  {
    t: 'micro_intensite_son',
    titre: 'niveau sonore',
    sert: 'Renvoie le **niveau du son** entendu par le micro de la carte, de **0** (silence) à **255** (très fort).',
    valeur: 'nombre',
    util: [
      'Affichez la valeur, ou comparez-la à un nombre dans un bloc « si ».',
    ],
    savoir: [
      'Le micro n\'existe que sur la carte **micro:bit V2**.',
      'Dans le simulateur, cette mesure ne varie pas (elle vaut toujours 0) : essayez le programme sur la vraie carte.',
    ],
    legende: 'Le niveau sonore s\'affiche chaque seconde sur la matrice de LED.',
  },
  {
    t: 'capteur_boussole_calibrer',
    titre: 'calibrer la boussole',
    sert: 'Lance le **réglage de la boussole** : la carte demande de l\'incliner dans tous les sens.',
    util: [
      'Placez-le dans le bloc « au démarrage ».',
      'Pendant le réglage, suivez les indications qui défilent sur la matrice de LED : inclinez la carte dans tous les sens jusqu\'à la fin du réglage.',
    ],
    savoir: [
      'Le programme **attend la fin du réglage** avant de passer au bloc suivant.',
      'Sans ce bloc, la carte lance le réglage d\'elle-même à la première lecture de la boussole.',
    ],
    legende: 'La boussole est calibrée une fois au démarrage, puis la direction s\'affiche chaque seconde.',
  },
  {
    t: 'capteur_boussole_force',
    titre: 'force magnétique (µT) …',
    sert: 'Renvoie le **champ magnétique** mesuré par la carte selon l\'axe **x**, **y** ou **z**, ou sa **force** totale, en **microteslas (µT)**.',
    valeur: 'nombre',
    util: [
      'Choisissez l\'axe, ou **force** pour les trois ensemble.',
      'Approchez un aimant de la carte : la valeur change.',
    ],
    savoir: [
      'Dans le simulateur, cette mesure ne varie pas (elle vaut toujours 0) : essayez le programme sur la vraie carte.',
    ],
    legende: 'Le champ magnétique sur l\'axe x s\'affiche chaque seconde sur la matrice de LED.',
  },
  {
    t: 'capteur_rotation',
    titre: 'rotation (°) …',
    sert: 'Renvoie l\'**inclinaison** de la carte en degrés : **pitch** quand on la penche vers l\'avant ou l\'arrière, **roll** quand on la penche vers la gauche ou la droite.',
    valeur: 'nombre',
    util: [
      'Choisissez **pitch** ou **roll**.',
    ],
    savoir: [
      'L\'inclinaison est calculée à partir de l\'accéléromètre : elle n\'est juste que si la carte ne bouge pas trop vite.',
      'Dans le simulateur, la carte est toujours immobile et à plat : essayez le programme sur la vraie carte.',
    ],
    legende: 'L\'inclinaison avant-arrière (pitch) s\'affiche chaque seconde sur la matrice de LED.',
  },
  {
    t: 'temps_execution',
    titre: 'temps d\'exécution …',
    sert: 'Renvoie le **temps écoulé depuis le démarrage** de la carte.',
    valeur: 'nombre',
    util: [
      'Choisissez l\'unité : **(ms)** pour les millisecondes, **(micros)** pour les microsecondes.',
    ],
    savoir: [
      '1 seconde = 1000 millisecondes = 1 000 000 microsecondes.',
      'Pour mesurer une durée à partir d\'un moment choisi, utilisez plutôt les blocs du chronomètre (catégorie « Temps »).',
    ],
    legende: 'Le temps écoulé depuis le démarrage, en millisecondes, s\'affiche chaque seconde.',
  },
  {
    t: 'gamme_accelerometre',
    titre: 'spécifier la gamme de l\'accéléromètre …',
    sert: 'Règle l\'**étendue de mesure** de l\'accéléromètre : **1g, 2g, 4g ou 8g**.',
    util: [
      'Placez-le dans le bloc « au démarrage ».',
      'Choisissez une petite gamme pour mesurer de petits mouvements, une grande gamme pour mesurer des chocs forts.',
    ],
    savoir: [
      'Une gamme plus large mesure des chocs plus forts, mais avec **moins de précision**.',
    ],
    legende: 'L\'accéléromètre est réglé sur 8g, puis la force mesurée s\'affiche chaque seconde.',
  },
  {
    t: 'micro_definir_seuil',
    titre: 'définit le seuil du son … à …',
    sert: 'Règle le **niveau sonore** à partir duquel un son est « bruyant » (ou en dessous duquel il est « faible ») pour le bloc « lorsque le son … est détecté ».',
    util: [
      'Choisissez « bruyant » ou « faible », puis écrivez le seuil, de **0 à 255** (comme le bloc « niveau sonore »).',
      'Placez-le dans le bloc « au démarrage ».',
    ],
    savoir: [
      'Plus le seuil « bruyant » est haut, plus il faut de bruit pour déclencher le bloc.',
      'Le micro n\'existe que sur la carte **micro:bit V2**. Le simulateur n\'entend aucun son.',
    ],
    legende: 'Avec un seuil à 200, seuls les bruits assez forts font apparaître le visage triste.',
  },
  // ═══════════════ Actionneurs (Audio) ═══════════════
  {
    t: 'audio_jouer',
    titre: '[Audio] jouer la musique …',
    sert: 'Joue un **son tout prêt** sur le haut-parleur de la carte : un rire (Giggle), un son joyeux (Happy), un bonjour (Hello), un son triste (Sad) ou un scintillement (Twinkle).',
    util: [
      'Choisissez le son dans la liste du bloc.',
    ],
    savoir: [
      'Le haut-parleur n\'existe que sur la carte **micro:bit V2**.',
      'Le programme **attend la fin du son** avant de passer au bloc suivant.',
      'Dans le simulateur, le son est une imitation jouée par l\'ordinateur : il peut être un peu différent de celui de la carte.',
    ],
    legende: 'Le bouton A joue un rire, le bouton B arrête le son.',
  },
  {
    t: 'audio_arreter',
    titre: '[Audio] arrêter la musique',
    sert: '**Arrête** le son en cours de lecture.',
    util: [
      'Placez-le, par exemple, dans un bloc « lorsque le bouton … est pressé » pour couper le son à la demande.',
    ],
    savoir: [
      'S\'il n\'y a aucun son en cours, il ne fait rien.',
    ],
    legende: 'Le bouton A joue un rire, le bouton B arrête le son.',
  },
  {
    t: 'music_jouer_melodie',
    titre: '[Music] jouer la mélodie …',
    sert: 'Joue une **mélodie toute prête**, note après note, sur le haut-parleur de la carte.',
    util: [
      'Choisissez la mélodie dans la liste du bloc.',
    ],
    savoir: [
      'Le programme **attend la fin de la mélodie** avant de passer au bloc suivant.',
      'Le son sort aussi sur la broche **P0** : un buzzer branché sur P0 joue la même mélodie.',
      'Dans le simulateur, la mélodie est jouée par l\'ordinateur.',
    ],
    legende: 'Le bouton A joue la mélodie « Entertainer ».',
  },
  {
    t: 'speech_dire',
    titre: '[Speech] dire … vitesse … hauteur …',
    sert: 'Fait **parler** la carte : elle prononce le texte avec une voix de synthèse.',
    util: [
      'Écrivez le texte à dire dans la case.',
      'Réglez la **vitesse** et la **hauteur** de la voix, de **0 à 255**.',
    ],
    savoir: [
      'La voix prononce les mots **à l\'anglaise** : écrivez le texte en anglais pour qu\'il soit compréhensible.',
      'Plus le nombre « vitesse » est **grand**, plus la voix est **lente** ; plus le nombre « hauteur » est **grand**, plus la voix est **grave**.',
      'Le programme **attend la fin de la phrase** avant de passer au bloc suivant.',
    ],
    legende: 'La carte dit « Hello » au démarrage.',
  },
  // ═══════════════ Servos ═══════════════
  {
    t: 'servo_angle',
    titre: 'régler l\'angle du servomoteur … à … °',
    sert: 'Fait tourner un **servomoteur** jusqu\'à l\'angle choisi, de **0 à 180°**, et l\'y maintient.',
    util: [
      'Choisissez la broche où le servomoteur est branché : **P0, P1 ou P2**.',
      'Écrivez l\'angle dans la case, ou mettez-y un bloc qui renvoie un nombre.',
    ],
    savoir: [
      'Le programme **n\'attend pas** que le servomoteur soit arrivé : ajoutez un bloc « attendre » pour lui laisser le temps de tourner.',
      'L\'angle est ramené dans l\'intervalle choisi avec le bloc « définir l\'intervalle du servomoteur » (de 0 à 180° au départ).',
      'Ce bloc est fait pour un servomoteur **positionnel** ; pour un servomoteur à rotation continue, utilisez le bloc « servomoteur … à rotation continue fonctionne à … % ».',
    ],
    legende: 'Le servomoteur branché sur P0 se place à 90°, puis à 0° une seconde plus tard.',
  },
  {
    t: 'servo_continu',
    titre: 'servomoteur … à rotation continue fonctionne à … %',
    sert: 'Fait tourner un **servomoteur à rotation continue** à la vitesse choisie, de **−100 à 100 %**.',
    util: [
      'Choisissez la broche où le servomoteur est branché : **P0, P1 ou P2**.',
      'Écrivez la vitesse : **0** pour l\'arrêt, un nombre **négatif** pour tourner dans l\'autre sens.',
    ],
    savoir: [
      'Le servomoteur continue de tourner jusqu\'au prochain bloc qui le commande.',
      'Si le servomoteur tourne encore doucement à 0 %, utilisez le bloc « mettre l\'arrêt au neutre du servomoteur » ou le bloc « arrêter le servomoteur ».',
    ],
    legende: 'Le servomoteur branché sur P0 tourne à 50 % pendant deux secondes, puis s\'arrête.',
  },
  {
    t: 'servo_arreter',
    titre: 'arrêter le servomoteur …',
    sert: '**Cesse de commander** le servomoteur : la carte ne lui envoie plus d\'ordre.',
    util: [
      'Choisissez la broche du servomoteur.',
    ],
    savoir: [
      'Un servomoteur **à rotation continue** s\'arrête.',
      'Un servomoteur **positionnel** reste où il est, mais ne tient plus sa position : on peut le tourner à la main.',
    ],
    legende: 'Le servomoteur branché sur P0 tourne à 50 % pendant deux secondes, puis s\'arrête.',
  },
  {
    t: 'servo_arret_neutre',
    titre: 'mettre l\'arrêt au neutre du servomoteur … à …',
    sert: 'Avec **ON**, une vitesse de **0 %** donnée au servomoteur à rotation continue l\'**arrête complètement**, au lieu de lui envoyer l\'ordre « position du milieu ».',
    util: [
      'Choisissez la broche du servomoteur, puis **ON** ou **OFF**.',
      'Placez ce bloc dans le bloc « au démarrage ».',
    ],
    savoir: [
      'Utile quand le servomoteur à rotation continue tourne encore doucement à 0 %.',
      'Au départ, l\'arrêt au neutre est sur **OFF**.',
    ],
    legende: 'L\'arrêt au neutre est activé, puis une vitesse de 0 % arrête le servomoteur branché sur P0.',
  },
  {
    t: 'servo_intervalle',
    titre: 'définir l\'intervalle du servomoteur … de … à …',
    sert: '**Limite la course** du servomoteur entre un angle mini et un angle maxi.',
    util: [
      'Choisissez la broche du servomoteur, puis écrivez l\'angle mini et l\'angle maxi.',
      'Placez ce bloc dans le bloc « au démarrage », avant de faire tourner le servomoteur.',
    ],
    savoir: [
      'Le mini est ramené **entre 0 et 90°**, le maxi **entre 90 et 180°**.',
      'Ensuite, un angle demandé hors de l\'intervalle est ramené à la limite la plus proche : cela protège une pièce qui ne doit pas aller trop loin.',
      'Au départ, l\'intervalle va de 0 à 180°.',
    ],
    legende: 'La course du servomoteur branché sur P0 est limitée de 30° à 150°, puis il se place à 90°.',
  },
  {
    t: 'servo_impulsion',
    titre: 'régler la largeur d\'impulsion du servomoteur … à … µs',
    sert: 'Commande le servomoteur directement par la **durée de l\'impulsion** qu\'il reçoit, en **microsecondes (µs)**.',
    util: [
      'Choisissez la broche du servomoteur, puis écrivez la durée.',
    ],
    savoir: [
      'La durée est ramenée **entre 500 et 2500 µs** : 500 µs correspond à 0°, **1500 µs** au milieu (90°), 2500 µs à 180°.',
      'La carte envoie une impulsion toutes les **20 millisecondes**.',
      'Pour un usage courant, le bloc « régler l\'angle du servomoteur » est plus simple.',
    ],
    legende: 'Une impulsion de 1500 µs place le servomoteur branché sur P0 au milieu.',
  },
  // ═══════════════ Cartes d'extension : DFR0548, Motor:bit ═══════════════
  {
    t: 'dfr_servo',
    titre: 'DFR0548 : servo … à … °',
    sert: 'Place le **servomoteur** branché sur une des 8 sorties servo (**S1 à S8**) de la carte moteurs **DFR0548** à l\'angle choisi.',
    util: [
      'Choisissez la sortie où le servomoteur est branché, de **S1 à S8**.',
      'Écrivez l\'angle, de **0 à 180°**, ou mettez-y un bloc qui renvoie un nombre.',
    ],
    savoir: [
      'La carte DFR0548 reçoit ses ordres par le **bus I2C** (broches P19 et P20) : ces broches ne doivent pas servir à autre chose.',
      'Un angle plus petit que 0 ou plus grand que 180 est ramené à 0 ou à 180°.',
      'Le programme **n\'attend pas** que le servomoteur soit arrivé : ajoutez un bloc « attendre ».',
    ],
    legende: 'Le servomoteur branché sur S1 passe de 0° à 180°, puis revient, chaque seconde.',
  },
  {
    t: 'dfr_moteur',
    titre: 'DFR0548 : moteur … sens … vitesse … (0 à 255)',
    sert: 'Fait tourner le **moteur à courant continu** branché sur une des 4 sorties moteur (**M1 à M4**) de la carte **DFR0548**.',
    util: [
      'Choisissez la sortie du moteur (M1 à M4) et le sens : **horaire** ou **antihoraire**.',
      'Écrivez la vitesse, de **0** (arrêt) à **255** (vitesse maximale).',
    ],
    savoir: [
      'Le moteur **continue de tourner** jusqu\'à un autre ordre : pensez au bloc « DFR0548 : arrêter ».',
      'Le sens réel dépend du branchement des deux fils du moteur : inversez-les, ou choisissez l\'autre sens, si le moteur tourne à l\'envers.',
      'La carte DFR0548 reçoit ses ordres par le **bus I2C** (broches P19 et P20).',
    ],
    legende: 'Le moteur M1 tourne deux secondes dans le sens horaire à la vitesse 150, puis s\'arrête.',
  },
  {
    t: 'dfr_moteur_arreter',
    titre: 'DFR0548 : arrêter …',
    sert: '**Arrête** un moteur à courant continu de la carte **DFR0548**, ou les quatre à la fois.',
    util: [
      'Choisissez le moteur (M1 à M4), ou **tous les moteurs**.',
    ],
    savoir: [
      'Il n\'agit que sur les moteurs à courant continu : les servomoteurs gardent leur position.',
    ],
    legende: 'Le moteur M1 tourne deux secondes dans le sens horaire à la vitesse 150, puis s\'arrête.',
  },
  {
    t: 'dfr_pas_a_pas',
    titre: 'DFR0548 : moteur pas à pas … sur … sens … de … …',
    sert: 'Fait tourner un **moteur pas à pas** branché sur deux sorties moteur de la carte **DFR0548**, d\'un nombre de **degrés** ou de **tours**, puis l\'arrête.',
    util: [
      'Choisissez le modèle du moteur : **28BYJ-48** ou **42BYGH**.',
      'Choisissez les deux sorties où il est branché (**M1-M2** ou **M3-M4**) et le sens.',
      'Écrivez la quantité, puis choisissez l\'unité : **degrés** ou **tours**.',
    ],
    savoir: [
      'Le programme **attend la fin du mouvement** avant de passer au bloc suivant.',
      'L\'angle est obtenu par une **durée de rotation** (méthode de la bibliothèque DFRobot) : il peut être un peu différent sur le vrai moteur. Vérifiez-le et ajustez la quantité.',
      'Un moteur pas à pas occupe **deux sorties moteur** : elles ne peuvent plus servir à un moteur à courant continu.',
    ],
    legende: 'Le moteur pas à pas 28BYJ-48 branché sur M1-M2 fait un tour dans le sens horaire, puis un demi-tour dans l\'autre sens.',
  },
  {
    t: 'motorbit_moteur',
    titre: 'Motor:bit : moteur … sens … vitesse … (0 à 255)',
    sert: 'Fait tourner le **moteur à courant continu** branché sur la sortie **M1** ou **M2** de la carte **Motor:bit** (ELECFREAKS).',
    util: [
      'Choisissez la sortie du moteur (M1 ou M2) et le sens : **horaire** ou **antihoraire**.',
      'Écrivez la vitesse, de **0** (arrêt) à **255** (vitesse maximale).',
    ],
    savoir: [
      'Le moteur **continue de tourner** jusqu\'à un autre ordre : pensez au bloc « Motor:bit : arrêter ».',
      'La carte Motor:bit commande les moteurs avec les broches **P1, P2, P8 et P12** : n\'y branchez pas d\'autre module.',
      'Le sens réel dépend du branchement des deux fils du moteur.',
    ],
    legende: 'Les moteurs M1 et M2 tournent chacun deux secondes à la vitesse 150, l\'un après l\'autre.',
  },
  {
    t: 'motorbit_moteur_arreter',
    titre: 'Motor:bit : arrêter …',
    sert: '**Arrête** un moteur de la carte **Motor:bit** (M1 ou M2), ou les deux à la fois.',
    util: [
      'Choisissez **le moteur M1**, **le moteur M2** ou **les deux moteurs**.',
    ],
    savoir: [
      'Pour arrêter les deux moteurs d\'un coup, choisissez **les deux moteurs**.',
    ],
    legende: 'Les moteurs M1 et M2 tournent chacun deux secondes à la vitesse 150, l\'un après l\'autre.',
  },
  // ═══════════════ Cartes d'extension : Maqueen Lite ═══════════════
  {
    t: 'maqueenlite_moteur',
    titre: 'Maqueen Lite : moteur … à … (-255 à 255)',
    sert: 'Fait tourner le moteur **gauche**, le moteur **droit** ou **les deux** moteurs du robot **Maqueen Lite** à la vitesse choisie.',
    util: [
      'Choisissez le moteur : gauche, droit ou les deux.',
      'Écrivez la vitesse, de **−255 à 255** : un nombre **négatif** fait reculer, **0** arrête.',
    ],
    savoir: [
      'Les moteurs **continuent de tourner** jusqu\'à un autre ordre : pensez au bloc « Maqueen Lite : arrêter le moteur ».',
      'Pour tourner, donnez des vitesses différentes aux deux moteurs (par exemple 100 à gauche et 0 à droite).',
      'Le robot reçoit ses ordres de moteur par le **bus I2C** (broches P19 et P20).',
      'Dans le simulateur, le robot se déplace dans la zone de simulation.',
    ],
    legende: 'Les deux moteurs tournent à la vitesse 50 pendant deux secondes, puis s\'arrêtent.',
  },
  {
    t: 'maqueenlite_arreter',
    titre: 'Maqueen Lite : arrêter le moteur …',
    sert: '**Arrête** le moteur gauche, le moteur droit ou les deux moteurs du robot **Maqueen Lite**.',
    util: [
      'Choisissez le moteur : gauche, droit ou les deux.',
    ],
    savoir: [
      'C\'est la même chose que le bloc « Maqueen Lite : moteur » avec la vitesse **0**.',
    ],
    legende: 'Les deux moteurs tournent à la vitesse 50 pendant deux secondes, puis s\'arrêtent.',
  },
  {
    t: 'maqueenlite_distance',
    titre: 'Maqueen Lite : distance (cm) capteur ultrason',
    sert: 'Renvoie la **distance** entre l\'avant du robot et l\'obstacle le plus proche, en **centimètres**, mesurée par le capteur à ultrasons.',
    valeur: 'nombre',
    util: [
      'Affichez la valeur, ou comparez-la à un nombre dans un bloc « si » (par exemple pour s\'arrêter avant un mur).',
    ],
    savoir: [
      'Le capteur utilise les broches **P1** (émission) et **P2** (écho), fixées par le robot : elles ne peuvent pas servir à autre chose.',
      'Il renvoie **0** quand aucun écho ne revient (obstacle trop loin ou surface qui absorbe le son).',
      'Dans le simulateur, réglez la distance avec le curseur de distance du robot.',
    ],
    legende: 'La distance mesurée devant le robot s\'affiche chaque seconde sur la matrice de LED.',
  },
  {
    t: 'maqueenlite_ligne',
    titre: 'Maqueen Lite : capteur de ligne … (0 ou 1)',
    sert: 'Renvoie l\'état du capteur de ligne **gauche** ou **droit**, sous le robot : **0** ou **1**.',
    valeur: 'nombre',
    util: [
      'Choisissez le capteur : gauche ou droit.',
      'Comparez le résultat à 0 ou à 1 dans un bloc « si ».',
    ],
    savoir: [
      'Le capteur gauche est lu sur la broche **P13**, le droit sur **P14**.',
      'La valeur qui correspond à la ligne noire dépend du capteur : **vérifiez-la** sur votre robot en posant le capteur sur la ligne, puis à côté.',
    ],
    legende: 'Un visage heureux s\'affiche quand le capteur de ligne gauche est à 1.',
  },
  {
    t: 'lorsque_maqueenlite_ligne',
    titre: 'lorsque le capteur de ligne … passe à l\'état …',
    sert: 'Exécute les blocs placés à l\'intérieur quand le capteur de ligne **gauche** ou **droit** du Maqueen Lite **change d\'état** : il passe à **haut (1)** ou à **bas (0)**.',
    util: [
      'Choisissez le capteur, puis l\'état attendu.',
      'Posez ce bloc seul dans l\'espace de travail : il ne s\'accroche à aucun autre bloc.',
    ],
    savoir: [
      'Le bloc se déclenche au **changement** d\'état, pas tant que l\'état dure.',
      'L\'état est vérifié à chaque tour de la boucle principale du programme.',
    ],
    legende: 'Un cœur s\'affiche quand le capteur de ligne gauche passe à l\'état haut (1).',
  },
  {
    t: 'maqueenlite_del',
    titre: 'Maqueen Lite : DEL … …',
    sert: '**Allume** ou **éteint** la DEL gauche, la DEL droite ou les deux DEL à l\'avant du robot **Maqueen Lite**.',
    util: [
      'Choisissez la DEL (gauche, droite ou les deux), puis **allumée** ou **éteinte**.',
    ],
    savoir: [
      'La DEL gauche est commandée par la broche **P8**, la droite par la broche **P12**.',
      'La DEL reste dans son état jusqu\'au prochain bloc qui la commande.',
    ],
    legende: 'Les deux DEL s\'allument une seconde, puis s\'éteignent une seconde, sans fin.',
  },
  {
    t: 'maqueenlite_servo',
    titre: 'Maqueen Lite : servo … angle … °',
    sert: 'Place le **servomoteur** branché sur la prise **S1** ou **S2** du robot **Maqueen Lite** à l\'angle choisi.',
    util: [
      'Choisissez la prise du servomoteur : S1 ou S2.',
      'Écrivez l\'angle, de **0 à 180°**.',
    ],
    savoir: [
      'Le programme **n\'attend pas** que le servomoteur soit arrivé : ajoutez un bloc « attendre ».',
      'Le robot reçoit cet ordre par le **bus I2C** (broches P19 et P20).',
    ],
    legende: 'Le servomoteur S1 se place à 90°, puis à 0° une seconde plus tard.',
  },

  // ═══════════════ Cartes d'extension : LiDAR ═══════════════
  {
    t: 'lidar_initialiser',
    titre: 'LiDAR … : configurer la taille …',
    sert: '**Prépare le capteur LiDAR** (DFRobot SEN0628) et choisit sa façon de mesurer : une grille de **8×8** points, ou le mode **évitement 4×4** qui donne la direction à suivre.',
    util: [
      'Placez ce bloc **une fois**, dans le bloc « au démarrage », avant tous les autres blocs LiDAR.',
      'Choisissez l\'adresse du capteur (**0x30** au départ) et le mode.',
    ],
    savoir: [
      'Le mode **Évitement 4x4** est nécessaire pour les blocs de la partie « Évitement d\'obstacle ».',
      'Le mode **Matrice 8x8** est nécessaire pour le bloc « distance mesurée au point x … y … ».',
      'L\'adresse (0x30 à 0x33) sert à choisir le capteur quand plusieurs sont branchés sur le **bus I2C** (broches P19 et P20).',
    ],
    legende: 'Le LiDAR est préparé en mode évitement au démarrage, puis la distance de l\'obstacle devant s\'affiche chaque seconde.',
    exemple: [B('au_demarrage', null, { DO: S(B('lidar_initialiser', { ADRESSE: '48', MODE: 'FALSE' })) }),
      B('boucle_infinie', null, { DO: S(B('lidar_acquerir'),
        B('afficher_valeur', null, { VALEUR: V(B('lidar_distance_cote', { COTE: 'avant' })) }), ATT(1)) })],
  },
  {
    t: 'lidar_point',
    titre: 'LiDAR … : distance mesurée au point x … y … (mm)',
    sert: 'Renvoie la **distance**, en **millimètres**, mesurée par le LiDAR au point **(x, y)** de sa grille de 8×8 points.',
    valeur: 'nombre',
    util: [
      'Choisissez l\'adresse du capteur, puis écrivez **x** et **y**, de **0 à 7**.',
    ],
    savoir: [
      'Ce bloc ne fonctionne qu\'en mode **Matrice 8x8** : placez le bloc « LiDAR … : configurer la taille Matrice 8x8 » dans le bloc « au démarrage ».',
      'Il interroge le capteur à chaque fois : le bloc « acquérir les données d\'évitement » n\'est pas utile ici.',
    ],
    legende: 'Le LiDAR est préparé en mode matrice 8×8, puis la distance mesurée au point (3, 3) s\'affiche chaque seconde.',
    exemple: [B('au_demarrage', null, { DO: S(B('lidar_initialiser', { ADRESSE: '48', MODE: 'TRUE' })) }),
      B('boucle_infinie', null, { DO: S(
        B('afficher_valeur', null, { VALEUR: V(B('lidar_point', { ADRESSE: '48', X: 3, Y: 3 })) }), ATT(1)) })],
  },
  {
    t: 'lidar_distance_evitement',
    titre: 'LiDAR : configurer la distance d\'évitement à … (mm)',
    sert: 'Règle la **distance**, en **millimètres**, à partir de laquelle le LiDAR considère qu\'un objet est un **obstacle** à éviter.',
    util: [
      'Placez ce bloc dans le bloc « au démarrage », après le bloc « LiDAR … : configurer la taille Évitement 4x4 ».',
    ],
    savoir: [
      'Sur un robot Maqueen, ne dépassez pas **200 mm** : au-delà, le faisceau peut toucher le sol et fausser la détection (avertissement du fabricant).',
    ],
    legende: 'Le LiDAR est préparé en mode évitement avec une distance de 200 mm, puis la direction conseillée s\'affiche chaque seconde.',
    exemple: [B('au_demarrage', null, { DO: S(B('lidar_initialiser', { ADRESSE: '48', MODE: 'FALSE' }),
        B('lidar_distance_evitement', null, { DISTANCE: N(200) })) }),
      B('boucle_infinie', null, { DO: S(B('lidar_acquerir'),
        B('afficher_valeur', null, { VALEUR: V(B('lidar_direction')) }), ATT(1)) })],
  },
  {
    t: 'lidar_acquerir',
    titre: 'LiDAR : acquérir les données d\'évitement',
    sert: '**Lit le capteur LiDAR** et garde ses résultats : direction à suivre, signal d\'urgence et distances à gauche, devant et à droite.',
    util: [
      'Placez ce bloc dans le bloc « répéter indéfiniment », **avant** les blocs qui lisent ces résultats.',
    ],
    savoir: [
      'Les blocs « direction à suivre », « signal d\'urgence » et « distance de l\'obstacle » relisent la **dernière acquisition**, pas le capteur en direct.',
      'Il faut le mode **Évitement 4x4** (bloc « configurer la taille »).',
    ],
    legende: 'Le LiDAR est préparé en mode évitement avec une distance de 200 mm, puis la direction conseillée s\'affiche chaque seconde.',
    exempleDe: 'lidar_distance_evitement',
  },
  {
    t: 'lidar_urgence',
    titre: 'LiDAR : signal d\'urgence activé ?',
    sert: 'Renvoie **vrai** quand le LiDAR a détecté un obstacle **très proche**, à moins de **100 mm**, **faux** sinon.',
    valeur: 'logique',
    util: [
      'Mettez ce bloc dans un bloc « si », après le bloc « LiDAR : acquérir les données d\'évitement ».',
    ],
    savoir: [
      'Le résultat vient de la **dernière acquisition** : placez le bloc « acquérir les données d\'évitement » juste avant.',
      'Dans le simulateur, réglez les distances avec les curseurs du panneau « LiDAR ».',
    ],
    legende: 'Après chaque acquisition, un visage triste s\'affiche si un obstacle est à moins de 100 mm.',
    exemple: [B('au_demarrage', null, { DO: S(B('lidar_initialiser', { ADRESSE: '48', MODE: 'FALSE' })) }),
      B('boucle_infinie', null, { DO: S(B('lidar_acquerir'),
        B('controls_if', null, { IF0: V(B('lidar_urgence')), DO0: S(ICONE('SAD')) })) })],
  },
  {
    t: 'lidar_direction',
    titre: 'LiDAR : direction à suivre pour éviter l\'obstacle',
    sert: 'Renvoie la **direction conseillée** par le LiDAR pour éviter l\'obstacle : **1** pour à gauche, **2** pour à droite, **3** pour tout droit.',
    valeur: 'nombre',
    util: [
      'Comparez le résultat à 1, 2 ou 3 dans un bloc « si » pour choisir le mouvement du robot.',
      'Plus simple : le bloc « LiDAR : direction à suivre est … ? » fait la comparaison pour vous.',
    ],
    savoir: [
      'Le résultat vient de la **dernière acquisition** : placez le bloc « acquérir les données d\'évitement » juste avant.',
      'Dans le simulateur, réglez les distances avec les curseurs du panneau « LiDAR ».',
    ],
    legende: 'Le LiDAR est préparé en mode évitement avec une distance de 200 mm, puis la direction conseillée s\'affiche chaque seconde.',
    exempleDe: 'lidar_distance_evitement',
  },
  {
    t: 'lidar_direction_est',
    titre: 'LiDAR : direction à suivre est … ?',
    sert: 'Renvoie **vrai** quand la direction conseillée par le LiDAR est celle choisie (**à gauche**, **à droite** ou **tout droit**), **faux** sinon.',
    valeur: 'logique',
    util: [
      'Choisissez la direction, puis mettez ce bloc dans un bloc « si ».',
    ],
    savoir: [
      'Le résultat vient de la **dernière acquisition** : placez le bloc « acquérir les données d\'évitement » juste avant.',
    ],
    legende: 'Après chaque acquisition, un visage heureux s\'affiche si la direction à suivre est « à gauche ».',
    exemple: [B('au_demarrage', null, { DO: S(B('lidar_initialiser', { ADRESSE: '48', MODE: 'FALSE' })) }),
      B('boucle_infinie', null, { DO: S(B('lidar_acquerir'),
        B('controls_if', null, { IF0: V(B('lidar_direction_est', { SENS: '1' })), DO0: S(ICONE('HAPPY')) })) })],
  },
  {
    t: 'lidar_distance_cote',
    titre: 'LiDAR : distance (en cm) de l\'obstacle à …',
    sert: 'Renvoie la **distance**, en **centimètres**, de l\'obstacle à **gauche**, **devant** ou à **droite** du LiDAR.',
    valeur: 'nombre',
    util: [
      'Choisissez le côté : gauche, devant ou droite.',
    ],
    savoir: [
      'Le résultat vient de la **dernière acquisition** : placez le bloc « acquérir les données d\'évitement » juste avant.',
      'Le capteur mesure en millimètres : le résultat en centimètres peut être un nombre à virgule.',
      'Dans le simulateur, réglez les distances avec les curseurs du panneau « LiDAR ».',
    ],
    legende: 'Le LiDAR est préparé en mode évitement au démarrage, puis la distance de l\'obstacle devant s\'affiche chaque seconde.',
    exempleDe: 'lidar_initialiser',
  },
  // ═══════════════ Cartes d'extension : Kitrobot v2 ═══════════════
  {
    t: 'kitrobot_definir_servos',
    titre: 'Kitrobot v2 : servo gauche … servo droit …',
    sert: 'Indique la ou les broches où sont branchés les servomoteurs gauche et droit du robot, si ce ne sont pas celles par défaut.',
    util: [
      'Placez ce bloc dans le bloc « au démarrage », avant les autres blocs Kitrobot v2.',
      'Choisissez la ou les broches.',
    ],
    savoir: [
      'Ce bloc est **facultatif** : sans lui, le logiciel utilise **P1** pour le servo gauche et **P2** pour le servo droit.',
      'Le câblage du Kitrobot v2 n\'a pas de documentation publique : les broches par défaut sont un choix du logiciel. **Vérifiez le câblage** de votre robot.',
    ],
    legende: 'Les servos sont déclarés sur P1 (gauche) et P2 (droit), puis le robot avance deux secondes.',
  },
  {
    t: 'kitrobot_definir_ultrason',
    titre: 'Kitrobot v2 : capteur ultrason sur …',
    sert: 'Indique la ou les broches où est branché le capteur à ultrasons du robot, si ce ne sont pas celles par défaut.',
    util: [
      'Placez ce bloc dans le bloc « au démarrage », avant les autres blocs Kitrobot v2.',
      'Choisissez la ou les broches.',
    ],
    savoir: [
      'Ce bloc est **facultatif** : sans lui, le logiciel utilise la broche **P0**.',
      'Le câblage du Kitrobot v2 n\'a pas de documentation publique : les broches par défaut sont un choix du logiciel. **Vérifiez le câblage** de votre robot.',
    ],
    legende: 'Le capteur à ultrasons est déclaré sur P8, puis la distance s\'affiche chaque seconde.',
  },
  {
    t: 'kitrobot_definir_buzzer',
    titre: 'Kitrobot v2 : buzzer sur …',
    sert: 'Indique la ou les broches où est branché le buzzer du robot, si ce ne sont pas celles par défaut.',
    util: [
      'Placez ce bloc dans le bloc « au démarrage », avant les autres blocs Kitrobot v2.',
      'Choisissez la ou les broches.',
    ],
    savoir: [
      'Ce bloc est **facultatif** : sans lui, le logiciel utilise la broche **P8**.',
      'Le câblage du Kitrobot v2 n\'a pas de documentation publique : les broches par défaut sont un choix du logiciel. **Vérifiez le câblage** de votre robot.',
    ],
    legende: 'Le buzzer est déclaré sur P0, puis il sonne à 440 Hz pendant 500 ms.',
  },
  {
    t: 'kitrobot_definir_lignes',
    titre: 'Kitrobot v2 : capteur de ligne gauche … droit …',
    sert: 'Indique la ou les broches où sont branchés les capteurs de ligne gauche et droit du robot, si ce ne sont pas celles par défaut.',
    util: [
      'Placez ce bloc dans le bloc « au démarrage », avant les autres blocs Kitrobot v2.',
      'Choisissez la ou les broches.',
    ],
    savoir: [
      'Ce bloc est **facultatif** : sans lui, le logiciel utilise **P13** pour le capteur gauche et **P14** pour le capteur droit.',
      'Le câblage du Kitrobot v2 n\'a pas de documentation publique : les broches par défaut sont un choix du logiciel. **Vérifiez le câblage** de votre robot.',
    ],
    legende: 'Les capteurs de ligne sont déclarés sur P1 (gauche) et P2 (droit) ; un visage heureux s\'affiche quand le capteur gauche voit la ligne.',
  },
  {
    t: 'kitrobot_definir_ruban',
    titre: 'Kitrobot v2 : ruban RGB sur … avec … LED(s)',
    sert: 'Indique sur quelle broche le **ruban de LED RGB** du robot est branché, et **combien de LED** il compte.',
    util: [
      'Placez ce bloc dans le bloc « au démarrage », avant les blocs de LED du Kitrobot v2.',
      'Choisissez la broche, puis écrivez le nombre de LED, de **1 à 64**.',
    ],
    savoir: [
      'Ce bloc est **facultatif** : sans lui, le logiciel utilise la broche **P15** et un ruban de **8 LED**.',
      'Le câblage du Kitrobot v2 n\'a pas de documentation publique : les broches par défaut sont un choix du logiciel. **Vérifiez le câblage** de votre robot.',
    ],
    legende: 'Le ruban de 8 LED est déclaré sur P0, puis l\'animation arc-en-ciel s\'allume.',
  },
  {
    t: 'kitrobot_distance',
    titre: 'Kitrobot v2 : distance (cm)',
    sert: 'Renvoie la **distance** entre le robot et l\'obstacle le plus proche, en **centimètres**, mesurée par son capteur à ultrasons.',
    valeur: 'nombre',
    util: [
      'Affichez la valeur, ou comparez-la à un nombre dans un bloc « si » (par exemple pour s\'arrêter avant un mur).',
    ],
    savoir: [
      'Le capteur est lu sur la broche **P0**, sauf si le bloc « Kitrobot v2 : capteur ultrason sur … » en indique une autre.',
      'Dans le simulateur, réglez la distance avec le curseur de distance du robot.',
    ],
    legende: 'La distance mesurée devant le robot s\'affiche chaque seconde sur la matrice de LED.',
  },
  {
    t: 'kitrobot_ligne',
    titre: 'Kitrobot v2 : état du capteur de ligne …',
    sert: 'Renvoie **vrai** quand le capteur de ligne choisi (gauche ou droit) détecte la ligne, **faux** sinon.',
    valeur: 'logique',
    util: [
      'Choisissez le capteur : gauche ou droit.',
      'Mettez ce bloc dans un bloc « si ».',
    ],
    savoir: [
      'Certains capteurs de ligne donnent l\'**inverse** (vrai hors de la ligne) : **vérifiez-le** sur votre robot en posant le capteur sur la ligne, puis à côté.',
      'Les capteurs sont lus sur **P13** (gauche) et **P14** (droit), sauf si le bloc « Kitrobot v2 : capteur de ligne gauche … droit … » en indique d\'autres.',
    ],
    legende: 'Les capteurs de ligne sont déclarés sur P1 (gauche) et P2 (droit) ; un visage heureux s\'affiche quand le capteur gauche voit la ligne.',
    exempleDe: 'kitrobot_definir_lignes',
  },
  {
    t: 'kitrobot_avancer',
    titre: 'Kitrobot v2 : … à la vitesse … %',
    sert: 'Fait **avancer** ou **reculer** le robot tout droit, à la vitesse choisie.',
    util: [
      'Choisissez **avancer** ou **reculer**.',
      'Écrivez la vitesse, de **0 à 100 %**.',
    ],
    savoir: [
      'Le robot **continue de rouler** jusqu\'à un autre ordre : pensez au bloc « Kitrobot v2 : arrêter le robot ».',
      'Les roues sont entraînées par deux **servomoteurs à rotation continue**. Si le robot recule au lieu d\'avancer, inversez le câblage d\'un côté.',
      'Dans le simulateur, le robot se déplace dans la zone de simulation.',
    ],
    legende: 'Le robot avance à 50 % pendant deux secondes, puis s\'arrête.',
  },
  {
    t: 'kitrobot_pivoter',
    titre: 'Kitrobot v2 : pivoter … vitesse … %',
    sert: 'Fait **tourner le robot sur place**, dans le sens horaire (↻) ou antihoraire (↺), à la vitesse choisie.',
    util: [
      'Choisissez le sens, puis écrivez la vitesse, de **0 à 100 %**.',
    ],
    savoir: [
      'Le robot **continue de tourner** jusqu\'à un autre ordre : ajoutez un bloc « attendre », puis le bloc « Kitrobot v2 : arrêter le robot ».',
      'Pour un quart de tour tout prêt, utilisez les blocs « pivoter à gauche » et « pivoter à droite ».',
    ],
    legende: 'Le robot pivote sur place à 50 % pendant une seconde, puis s\'arrête.',
  },
  {
    t: 'kitrobot_moteur',
    titre: 'Kitrobot v2 : contrôler le moteur … direction … vitesse … %',
    sert: 'Commande **un seul moteur** du robot (gauche ou droit) : son sens de rotation et sa vitesse.',
    util: [
      'Choisissez le moteur, le sens (↻ ou ↺), puis écrivez la vitesse, de **0 à 100 %**.',
    ],
    savoir: [
      'Les deux moteurs sont montés face à face : pour avancer, ils tournent dans des sens **opposés**. Le bloc « Kitrobot v2 : avancer » le fait pour vous.',
      'Le moteur **continue de tourner** jusqu\'à un autre ordre.',
    ],
    legende: 'Le moteur gauche tourne à 50 % pendant deux secondes, puis s\'arrête.',
  },
  {
    t: 'kitrobot_arreter_moteur',
    titre: 'Kitrobot v2 : arrêter le moteur …',
    sert: '**Arrête** le moteur gauche ou le moteur droit du robot.',
    util: [
      'Choisissez le moteur : gauche ou droit.',
    ],
    savoir: [
      'Pour arrêter les deux moteurs d\'un coup, utilisez le bloc « Kitrobot v2 : arrêter le robot ».',
    ],
    legende: 'Le moteur gauche tourne à 50 % pendant deux secondes, puis s\'arrête.',
  },
  {
    t: 'kitrobot_case_avant',
    titre: 'Kitrobot v2 : avancer d\'une case',
    sert: 'Fait **avancer** le robot d\'une **case**, puis l\'arrête.',
    util: [
      'Enchaînez ce bloc avec les autres blocs de déplacement « d\'une case » et « pivoter » pour suivre un parcours sur un quadrillage.',
    ],
    savoir: [
      'Le robot roule à 50 % pendant **0,6 seconde** : la longueur parcourue dépend du sol et de la charge. **Mesurez-la** et adaptez votre quadrillage.',
      'Le programme attend la fin du mouvement avant de passer au bloc suivant.',
    ],
    legende: 'Le robot avance d\'une case, pivote à droite, avance encore d\'une case, puis recule d\'une case.',
  },
  {
    t: 'kitrobot_case_arriere',
    titre: 'Kitrobot v2 : reculer d\'une case',
    sert: 'Fait **reculer** le robot d\'une **case**, puis l\'arrête.',
    util: [
      'Enchaînez ce bloc avec les autres blocs de déplacement « d\'une case » et « pivoter ».',
    ],
    savoir: [
      'Le robot recule à 50 % pendant **0,6 seconde** : la longueur parcourue dépend du sol et de la charge.',
      'Le programme attend la fin du mouvement avant de passer au bloc suivant.',
    ],
    legende: 'Le robot avance d\'une case, pivote à droite, avance encore d\'une case, puis recule d\'une case.',
  },
  {
    t: 'kitrobot_pivoter_gauche',
    titre: 'Kitrobot v2 : pivoter à gauche',
    sert: 'Fait tourner le robot **sur place vers la gauche**, d\'environ un quart de tour, puis l\'arrête.',
    util: [
      'Enchaînez ce bloc avec les blocs « avancer d\'une case » et « reculer d\'une case ».',
    ],
    savoir: [
      'Le robot pivote à 50 % pendant **0,4 seconde** : l\'angle obtenu (environ 90°) dépend du sol et de la charge.',
      'Le programme attend la fin du mouvement avant de passer au bloc suivant.',
    ],
    legende: 'Le robot avance d\'une case, pivote à droite, avance encore d\'une case, puis recule d\'une case.',
  },
  {
    t: 'kitrobot_pivoter_droite',
    titre: 'Kitrobot v2 : pivoter à droite',
    sert: 'Fait tourner le robot **sur place vers la droite**, d\'environ un quart de tour, puis l\'arrête.',
    util: [
      'Enchaînez ce bloc avec les blocs « avancer d\'une case » et « reculer d\'une case ».',
    ],
    savoir: [
      'Le robot pivote à 50 % pendant **0,4 seconde** : l\'angle obtenu (environ 90°) dépend du sol et de la charge.',
      'Le programme attend la fin du mouvement avant de passer au bloc suivant.',
    ],
    legende: 'Le robot avance d\'une case, pivote à droite, avance encore d\'une case, puis recule d\'une case.',
  },
  {
    t: 'kitrobot_arreter',
    titre: 'Kitrobot v2 : arrêter le robot',
    sert: '**Arrête les deux moteurs** du robot.',
    util: [
      'Placez-le après un bloc de déplacement et un bloc « attendre ».',
    ],
    savoir: [
      'La carte cesse de commander les servomoteurs des roues : le robot s\'arrête.',
    ],
    legende: 'Le robot avance à 50 % pendant deux secondes, puis s\'arrête.',
  },
  {
    t: 'kitrobot_buzzer',
    titre: 'Kitrobot v2 : buzzer à la fréquence … Hz pendant … ms',
    sert: 'Fait **sonner le buzzer** du robot à la fréquence choisie, pendant la durée choisie.',
    util: [
      'Écrivez la fréquence en **hertz (Hz)** : plus elle est grande, plus le son est aigu (440 Hz = la).',
      'Écrivez la durée en **millisecondes (ms)** : 1000 ms = 1 seconde.',
    ],
    savoir: [
      'Le programme **attend la fin du son** avant de passer au bloc suivant.',
      'Une fréquence de **0** fait une pause silencieuse de la durée choisie.',
      'Le buzzer est commandé par la broche **P8**, sauf si le bloc « Kitrobot v2 : buzzer sur … » en indique une autre.',
    ],
    legende: 'Le buzzer sonne à 440 Hz pendant 500 ms au démarrage.',
  },
  {
    t: 'kitrobot_clignoter',
    titre: 'Kitrobot v2 : clignoter le robot',
    sert: 'Fait **clignoter une fois** toutes les LED du ruban du robot, en blanc.',
    util: [
      'Placez ce bloc dans une boucle avec un bloc « attendre » pour faire clignoter le robot plusieurs fois.',
    ],
    savoir: [
      'Le flash dure **0,15 seconde**, puis toutes les LED du ruban s\'éteignent.',
    ],
    legende: 'Le robot clignote une fois au démarrage.',
  },
  {
    t: 'kitrobot_del_couleur',
    titre: 'Kitrobot v2 : LED RGB … à …',
    sert: 'Allume **une LED** du ruban du robot dans la **couleur** choisie.',
    util: [
      'Écrivez le numéro de la LED : la première porte le numéro **0**.',
      'Choisissez la couleur dans la liste du bloc.',
    ],
    savoir: [
      'Avec un ruban de 8 LED, les numéros vont de **0 à 7** : un numéro en dehors ne fait rien.',
      'La LED garde sa couleur jusqu\'au prochain bloc qui la change.',
    ],
    legende: 'La LED n° 0 s\'allume en rouge.',
  },
  {
    t: 'kitrobot_del_rgb',
    titre: 'Kitrobot v2 : LED RGB en … à R … V … B …',
    sert: 'Allume **une LED** du ruban du robot dans une couleur que vous composez avec du **rouge (R)**, du **vert (V)** et du **bleu (B)**.',
    util: [
      'Écrivez le numéro de la LED : la première porte le numéro **0**.',
      'Écrivez la quantité de rouge, de vert et de bleu, chacune de **0 à 255** (0, 0, 0 = éteinte ; 255, 255, 255 = blanc).',
    ],
    savoir: [
      'Avec un ruban de 8 LED, les numéros vont de **0 à 7** : un numéro en dehors ne fait rien.',
    ],
    legende: 'La LED n° 0 s\'allume en vert (rouge 0, vert 255, bleu 0).',
  },
  {
    t: 'kitrobot_arcenciel',
    titre: 'Kitrobot v2 : Arc-en-ciel',
    sert: 'Allume toutes les LED du ruban du robot avec les **couleurs de l\'arc-en-ciel**, réparties du rouge au violet.',
    util: [
      'Placez ce bloc où vous voulez allumer l\'arc-en-ciel, par exemple dans le bloc « au démarrage ».',
    ],
    savoir: [
      'Les couleurs restent allumées jusqu\'au prochain bloc qui change les LED.',
    ],
    legende: 'L\'arc-en-ciel s\'allume au démarrage.',
  },
  // ═══════════════ Cartes d'extension : Maqueen Plus ═══════════════
  {
    t: 'maqueen_moteur',
    titre: 'moteur … à … (-255 à 255)',
    sert: 'Fait tourner le moteur **gauche**, le moteur **droit** ou **les deux** moteurs du robot **Maqueen Plus** à la vitesse choisie.',
    util: [
      'Choisissez le moteur : gauche, droit ou les deux.',
      'Écrivez la vitesse, de **−255 à 255** : un nombre **négatif** fait reculer, **0** arrête.',
    ],
    savoir: [
      'Les moteurs **continuent de tourner** jusqu\'à un autre ordre : pensez au bloc « arrêter le moteur ».',
      'Pour tourner, donnez des vitesses différentes aux deux moteurs (par exemple 100 à gauche et 0 à droite).',
      'Le robot reçoit ses ordres par le **bus I2C** (broches P19 et P20).',
      'Dans le simulateur, le robot se déplace sur la piste de la zone de simulation.',
    ],
    legende: 'Les deux moteurs tournent à la vitesse 50 pendant deux secondes, puis s\'arrêtent.',
  },
  {
    t: 'maqueen_arreter',
    titre: 'arrêter le moteur …',
    sert: '**Arrête** le moteur gauche, le moteur droit ou les deux moteurs du robot **Maqueen Plus**.',
    util: [
      'Choisissez le moteur : gauche, droit ou les deux.',
    ],
    savoir: [
      'C\'est la même chose que le bloc « moteur … à … » avec la vitesse **0**.',
    ],
    legende: 'Les deux moteurs tournent à la vitesse 50 pendant deux secondes, puis s\'arrêtent.',
  },
  {
    t: 'maqueen_ligne_etat',
    titre: 'capteur de ligne … sur la ligne',
    sert: 'Renvoie **vrai** quand le capteur de ligne choisi, sous le robot, détecte la ligne, **faux** sinon.',
    valeur: 'logique',
    util: [
      'Choisissez un des cinq capteurs : **L2** (extrême gauche), **L1** (gauche), **M** (milieu), **R1** (droit), **R2** (extrême droit).',
      'Mettez ce bloc dans un bloc « si » pour corriger la trajectoire du robot.',
    ],
    savoir: [
      'Pour suivre une ligne, on surveille en général **L1**, **M** et **R1** : si la ligne passe sous L1, le robot tourne un peu à gauche, et ainsi de suite.',
      'Posez le robot sur votre piste pour **vérifier** quelle couleur de ligne les capteurs détectent.',
      'Dans le simulateur, le robot détecte la ligne de la piste dessinée.',
    ],
    legende: 'Un visage heureux s\'affiche quand le capteur du milieu voit la ligne.',
  },
  {
    t: 'maqueen_ligne_valeur',
    titre: 'valeur brute du capteur de ligne …',
    sert: 'Renvoie la **valeur brute** mesurée par un des cinq capteurs de ligne du robot : elle change avec la couleur et la clarté de la surface.',
    valeur: 'nombre',
    util: [
      'Choisissez le capteur : L2, L1, M, R1 ou R2.',
      'Affichez la valeur au-dessus de la ligne, puis à côté, pour choisir un seuil à comparer dans un bloc « si ».',
    ],
    savoir: [
      'Pour savoir simplement si le capteur voit la ligne ou non, le bloc « capteur de ligne … sur la ligne » est plus simple.',
    ],
    legende: 'La valeur du capteur du milieu s\'affiche chaque seconde sur la matrice de LED.',
  },
  {
    t: 'maqueen_phare',
    titre: 'phare … …',
    sert: '**Allume** ou **éteint** le phare gauche, le phare droit ou les deux phares à l\'avant du robot **Maqueen Plus**.',
    util: [
      'Choisissez le phare (gauche, droit ou les deux), puis **allumé** ou **éteint**.',
    ],
    savoir: [
      'Le phare reste dans son état jusqu\'au prochain bloc qui le commande.',
    ],
    legende: 'Les deux phares s\'allument une seconde, puis s\'éteignent une seconde, sans fin.',
  },
  {
    t: 'maqueen_rgb_couleur',
    titre: 'DEL RGB … en …',
    sert: 'Allume une des **quatre DEL RGB** du dessous du robot, ou toutes, dans la **couleur** choisie.',
    util: [
      'Choisissez la DEL : **L1**, **L2**, **R1**, **R2**, ou **toutes**.',
      'Choisissez la couleur dans la liste du bloc.',
    ],
    savoir: [
      'Les DEL RGB sont commandées par la broche **P15** : elle ne peut pas servir à autre chose.',
      'La DEL garde sa couleur jusqu\'au prochain bloc qui la change, ou jusqu\'au bloc « éteindre les DEL RGB ».',
    ],
    legende: 'Toutes les DEL RGB s\'allument en rouge deux secondes, puis s\'éteignent.',
  },
  {
    t: 'maqueen_rgb_eteindre',
    titre: 'éteindre les DEL RGB',
    sert: '**Éteint les quatre DEL RGB** du dessous du robot **Maqueen Plus**.',
    util: [
      'Placez-le où les DEL doivent s\'éteindre.',
    ],
    savoir: [
      'Il n\'éteint pas les phares : utilisez pour eux le bloc « phare … éteint ».',
    ],
    legende: 'Toutes les DEL RGB s\'allument en rouge deux secondes, puis s\'éteignent.',
  },
  {
    t: 'maqueen_distance',
    titre: 'distance (cm) capteur ultrason Maqueen',
    sert: 'Renvoie la **distance** entre l\'avant du robot et l\'obstacle le plus proche, en **centimètres**, mesurée par le capteur à ultrasons du Maqueen Plus.',
    valeur: 'nombre',
    util: [
      'Affichez la valeur, ou comparez-la à un nombre dans un bloc « si » (par exemple pour s\'arrêter avant un mur).',
    ],
    savoir: [
      'Le capteur utilise les broches **P13** (émission) et **P14** (écho), fixées par le robot : elles ne peuvent pas servir à autre chose.',
      'Il renvoie **0** quand aucun écho ne revient (obstacle trop loin ou surface qui absorbe le son).',
      'Dans le simulateur, réglez la distance avec le curseur de distance du robot.',
    ],
    legende: 'La distance mesurée devant le robot s\'affiche chaque seconde sur la matrice de LED.',
  },
  {
    t: 'maqueen_v3_vitesse_suivi',
    titre: 'Maqueen Plus v3 : vitesse du suiveur de ligne …',
    sert: 'Règle la **vitesse** à laquelle le robot V3 suit seul la ligne, de **1** (lent) à **5** (rapide).',
    util: [
      'Placez ce bloc dans le bloc « au démarrage », avant de démarrer le suiveur de ligne.',
    ],
    savoir: [
      'Ce bloc demande un châssis **Maqueen Plus V3** : les châssis V1 et V2 n\'ont pas ce suiveur de ligne intégré.',
      'Une vitesse lente suit mieux les virages serrés.',
    ],
    legende: 'La vitesse du suiveur est réglée sur 3, le robot va tout droit aux carrefours, puis le suivi de ligne démarre.',
  },
  {
    t: 'maqueen_v3_mode_carrefour',
    titre: 'Maqueen Plus v3 : aux carrefours, avancer …',
    sert: 'Choisit ce que fait le robot V3, pendant le suivi de ligne, quand il arrive à un **carrefour** (croisement en +) : aller **tout droit**, tourner **à gauche**, tourner **à droite** ou s\'**arrêter**.',
    util: [
      'Placez ce bloc dans le bloc « au démarrage », avant de démarrer le suiveur de ligne.',
    ],
    savoir: [
      'Ce bloc demande un châssis **Maqueen Plus V3** : les châssis V1 et V2 n\'ont pas ce suiveur de ligne intégré.',
      'Le choix reste valable pour tous les carrefours suivants, jusqu\'à un nouveau bloc.',
    ],
    legende: 'La vitesse du suiveur est réglée sur 3, le robot va tout droit aux carrefours, puis le suivi de ligne démarre.',
  },
  {
    t: 'maqueen_v3_mode_gauche',
    titre: 'Maqueen Plus v3 : aux intersections à gauche, avancer …',
    sert: 'Choisit ce que fait le robot V3, pendant le suivi de ligne, quand une branche part **vers la gauche** : aller **tout droit**, tourner **à gauche** ou s\'**arrêter**.',
    util: [
      'Placez ce bloc dans le bloc « au démarrage », avant de démarrer le suiveur de ligne.',
    ],
    savoir: [
      'Ce bloc demande un châssis **Maqueen Plus V3** : les châssis V1 et V2 n\'ont pas ce suiveur de ligne intégré.',
    ],
    legende: 'La vitesse du suiveur est réglée sur 3, le robot va tout droit aux carrefours, puis le suivi de ligne démarre.',
  },
  {
    t: 'maqueen_v3_mode_droite',
    titre: 'Maqueen Plus v3 : aux intersections à droite, avancer …',
    sert: 'Choisit ce que fait le robot V3, pendant le suivi de ligne, quand une branche part **vers la droite** : aller **tout droit**, tourner **à droite** ou s\'**arrêter**.',
    util: [
      'Placez ce bloc dans le bloc « au démarrage », avant de démarrer le suiveur de ligne.',
    ],
    savoir: [
      'Ce bloc demande un châssis **Maqueen Plus V3** : les châssis V1 et V2 n\'ont pas ce suiveur de ligne intégré.',
    ],
    legende: 'La vitesse du suiveur est réglée sur 3, le robot va tout droit aux carrefours, puis le suivi de ligne démarre.',
  },
  {
    t: 'maqueen_v3_suiveur',
    titre: 'Maqueen Plus v3 : … le suiveur de ligne',
    sert: '**Démarre** ou **arrête** le suiveur de ligne intégré du robot V3 : une fois démarré, le robot **suit seul** la ligne, sans autre bloc.',
    util: [
      'Choisissez **démarrer** ou **arrêter**.',
      'Réglez d\'abord la vitesse et les choix aux intersections avec les autres blocs « Maqueen Plus v3 ».',
    ],
    savoir: [
      'Ce bloc demande un châssis **Maqueen Plus V3** : les châssis V1 et V2 n\'ont pas ce suiveur de ligne intégré.',
      'Pendant le suivi, le programme continue : il peut par exemple surveiller la distance ou les intersections.',
    ],
    legende: 'Le robot V3 suit la ligne pendant dix secondes, puis le suiveur s\'arrête.',
  },
  {
    t: 'maqueen_v3_intersection_detectee',
    titre: 'Maqueen Plus v3 : intersection détectée (code)',
    sert: 'Renvoie le **code** de la dernière intersection détectée par le robot V3 pendant le suivi de ligne : **1** à gauche, **2** à droite, **3** tout droit, **4** stop.',
    valeur: 'nombre',
    util: [
      'Comparez le résultat à un nombre dans un bloc « si ».',
      'Plus simple : le bloc « intersection détectée est … ? » fait la comparaison pour vous.',
    ],
    savoir: [
      'Ce bloc demande un châssis **Maqueen Plus V3** : les châssis V1 et V2 n\'ont pas ce suiveur de ligne intégré.',
    ],
    legende: 'Le code de l\'intersection détectée s\'affiche chaque seconde sur la matrice de LED.',
  },
  {
    t: 'maqueen_v3_intersection_est',
    titre: 'Maqueen Plus v3 : intersection détectée est … ?',
    sert: 'Renvoie **vrai** quand la dernière intersection détectée par le robot V3 est du type choisi (**tout droit**, **à gauche**, **à droite**, **stop**), **faux** sinon.',
    valeur: 'logique',
    util: [
      'Choisissez le type d\'intersection, puis mettez ce bloc dans un bloc « si ».',
    ],
    savoir: [
      'Ce bloc demande un châssis **Maqueen Plus V3** : les châssis V1 et V2 n\'ont pas ce suiveur de ligne intégré.',
    ],
    legende: 'Un visage heureux s\'affiche quand l\'intersection détectée est « à gauche ».',
  },
  {
    t: 'maqueen_v3_luminosite',
    titre: 'Maqueen Plus v3 : intensité lumineuse à …',
    sert: 'Renvoie la **lumière** mesurée par le capteur de lumière **gauche** ou **droit** du robot V3.',
    valeur: 'nombre',
    util: [
      'Choisissez le capteur : gauche ou droite.',
      'Comparez les deux côtés pour faire aller le robot vers la lumière, par exemple.',
    ],
    savoir: [
      'Ce bloc demande un châssis **Maqueen Plus V3**.',
      'La valeur augmente avec la lumière ; affichez-la pour connaître les valeurs de votre salle.',
    ],
    legende: 'La lumière mesurée à gauche s\'affiche chaque seconde sur la matrice de LED.',
  },
  {
    t: 'maqueen_v3_pid_avancer',
    titre: 'Maqueen Plus v3 : … … cm … attendre la fin',
    sert: 'Fait **avancer** ou **reculer** le robot V3 d\'une **distance précise**, en centimètres : les roues mesurent elles-mêmes le chemin parcouru.',
    util: [
      'Choisissez **avancer** ou **reculer**, puis écrivez la distance en **centimètres**.',
      'Cochez **attendre la fin** pour que le programme attende l\'arrivée avant de passer au bloc suivant.',
    ],
    savoir: [
      'Ce bloc demande un châssis **Maqueen Plus V3** (roues avec codeur).',
      'Sans « attendre la fin », le programme continue pendant que le robot roule : le bloc « arrêter le contrôle PID en cours » peut alors l\'interrompre.',
    ],
    legende: 'Le robot V3 part pour 50 cm sans attendre la fin ; une seconde plus tard, le mouvement est interrompu.',
  },
  {
    t: 'maqueen_v3_pid_tourner',
    titre: 'Maqueen Plus v3 : tourner à … … ° … attendre la fin',
    sert: 'Fait **tourner** le robot V3 sur place d\'un **angle précis**, en degrés, vers la gauche ou vers la droite.',
    util: [
      'Choisissez **gauche** ou **droite**, puis écrivez l\'angle en **degrés** (90 = un quart de tour).',
      'Cochez **attendre la fin** pour que le programme attende la fin du virage.',
    ],
    savoir: [
      'Ce bloc demande un châssis **Maqueen Plus V3** (roues avec codeur).',
      'Le sens gauche/droite n\'a pas encore été vérifié sur un vrai robot : **essayez-le** et inversez le choix si besoin.',
    ],
    legende: 'Le robot V3 tourne de 90° vers la gauche et attend la fin du virage.',
  },
  {
    t: 'maqueen_v3_vitesse_reelle',
    titre: 'Maqueen Plus v3 : vitesse réelle de la roue … (cm/s)',
    sert: 'Renvoie la **vitesse réelle** de la roue gauche ou droite du robot V3, en **centimètres par seconde**, mesurée par le codeur de la roue.',
    valeur: 'nombre',
    util: [
      'Choisissez la roue : gauche ou droite.',
    ],
    savoir: [
      'Ce bloc demande un châssis **Maqueen Plus V3** (roues avec codeur).',
      'La vitesse réelle peut être différente de la vitesse demandée : sol glissant, pente, charge…',
    ],
    legende: 'La vitesse de la roue gauche s\'affiche chaque seconde sur la matrice de LED.',
  },
  {
    t: 'maqueen_v3_pid_stop',
    titre: 'Maqueen Plus v3 : arrêter le contrôle PID en cours',
    sert: '**Interrompt** le déplacement ou le virage précis en cours sur le robot V3.',
    util: [
      'Placez-le après un bloc « avancer … cm » ou « tourner à … ° » sans « attendre la fin ».',
    ],
    savoir: [
      'Ce bloc demande un châssis **Maqueen Plus V3** (roues avec codeur).',
    ],
    legende: 'Le robot V3 part pour 50 cm sans attendre la fin ; une seconde plus tard, le mouvement est interrompu.',
  },
  {
    t: 'maqueen_v3_del_carrosserie',
    titre: 'Maqueen Plus v3 : DEL de carrosserie … en …',
    sert: 'Allume la DEL **gauche**, la DEL **droite** ou les deux DEL de la **coque** du robot V3 dans la couleur choisie.',
    util: [
      'Choisissez la DEL, puis la couleur : rouge, vert, jaune, bleu, violet, cyan, blanc, ou **éteint**.',
    ],
    savoir: [
      'Ce bloc demande un châssis **Maqueen Plus V3**.',
      'Ces DEL sont différentes des quatre DEL RGB du dessous (bloc « DEL RGB … en … »).',
    ],
    legende: 'Les deux DEL de la coque s\'allument en rouge.',
  },
  {
    t: 'maqueen_ir_init',
    titre: 'Maqueen Plus : connecter le récepteur infrarouge à …',
    sert: 'Indique sur quelle broche est branché le **récepteur infrarouge** qui reçoit les ordres de la télécommande.',
    util: [
      'Placez ce bloc dans le bloc « au démarrage ».',
      'Choisissez la broche du récepteur.',
    ],
    savoir: [
      'Sans ce bloc, le récepteur est lu sur la broche **P0**.',
      'Le décodage suit le protocole **NEC** des télécommandes infrarouges courantes ; il n\'a pas encore été essayé avec un vrai récepteur.',
      'Dans le simulateur, choisissez une touche dans le panneau « Télécommande infrarouge (simulation) ».',
    ],
    legende: 'Le récepteur est connecté sur P8, puis le dernier code reçu s\'affiche chaque seconde (−1 si rien).',
  },
  {
    t: 'lorsque_ir_noire',
    titre: 'lorsque la commande … est reçue par télécommande noire (NEC)',
    sert: 'Exécute les blocs placés à l\'intérieur quand la touche choisie de la **télécommande noire** DFRobot est pressée.',
    util: [
      'Choisissez la touche, puis posez ce bloc seul dans l\'espace de travail : il ne s\'accroche à aucun autre bloc.',
    ],
    savoir: [
      'Le récepteur est surveillé à chaque tour de la boucle principale du programme.',
      'Le récepteur est lu sur **P0**, sauf si le bloc « connecter le récepteur infrarouge à … » en indique une autre.',
      'Dans le simulateur, choisissez la télécommande et la touche dans le panneau « Télécommande infrarouge (simulation) ».',
    ],
    legende: 'Un cœur s\'affiche quand la touche Power est pressée.',
  },
  {
    t: 'lorsque_ir_grise',
    titre: 'lorsque la commande … est reçue par télécommande grise Car mp3 (NEC)',
    sert: 'Exécute les blocs placés à l\'intérieur quand la touche choisie de la **télécommande grise** « Car mp3 » est pressée.',
    util: [
      'Choisissez la touche, puis posez ce bloc seul dans l\'espace de travail : il ne s\'accroche à aucun autre bloc.',
    ],
    savoir: [
      'Le récepteur est surveillé à chaque tour de la boucle principale du programme.',
      'Le récepteur est lu sur **P0**, sauf si le bloc « connecter le récepteur infrarouge à … » en indique une autre.',
      'Dans le simulateur, choisissez la télécommande et la touche dans le panneau « Télécommande infrarouge (simulation) ».',
    ],
    legende: 'Un cœur s\'affiche quand la touche CH est pressée.',
  },
  {
    t: 'maqueen_ir_decoder',
    titre: 'Maqueen Plus : décoder le récepteur infrarouge',
    sert: '**Lit le récepteur infrarouge** et garde le code de la dernière touche reçue.',
    util: [
      'Placez-le dans le bloc « répéter indéfiniment », avant le bloc « code reçu du récepteur infrarouge ».',
    ],
    savoir: [
      'Ce bloc est **facultatif** avec les blocs « lorsque la commande … » : ils lisent déjà le récepteur à chaque tour de boucle.',
    ],
    legende: 'Le récepteur est connecté sur P8, puis le dernier code reçu s\'affiche chaque seconde (−1 si rien).',
  },
  {
    t: 'maqueen_ir_dernier_code',
    titre: 'Maqueen Plus : code reçu du récepteur infrarouge',
    sert: 'Renvoie le **code** de la dernière touche reçue par le récepteur infrarouge, ou **−1** si rien n\'a encore été reçu.',
    valeur: 'nombre',
    util: [
      'Placez le bloc « décoder le récepteur infrarouge » juste avant, dans la boucle.',
      'Affichez le code pour découvrir celui de chaque touche, puis comparez-le dans un bloc « si ».',
    ],
    savoir: [
      'Le code garde la valeur de la **dernière** touche reçue, même quand on ne presse plus rien.',
    ],
    legende: 'Le récepteur est connecté sur P8, puis le dernier code reçu s\'affiche chaque seconde (−1 si rien).',
  },
  // ═══════════════ Radio ═══════════════
  {
    t: 'radio_activer',
    titre: 'allumer la radio',
    sert: '**Allume la radio** de la carte : elle peut ensuite envoyer et recevoir des messages des autres cartes micro:bit.',
    util: [
      'Placez ce bloc dans le bloc « au démarrage », avant tous les autres blocs radio.',
    ],
    savoir: [
      'Sans lui, la carte n\'envoie et ne reçoit **aucun** message.',
      'Les cartes ne s\'entendent que si elles ont le **même groupe** et la **même bande de fréquence**.',
      'Dans le simulateur, ouvrez le **multi-éditeur radio** (menu Radio) : deux cartes simulées côte à côte communiquent par radio.',
    ],
    legende: 'La radio s\'allume au démarrage ; le bouton A envoie « Salut » aux autres cartes du même groupe.',
  },
  {
    t: 'radio_groupe',
    titre: 'radio : définir le groupe …',
    sert: 'Choisit le **groupe radio** de la carte, de **0 à 255** : seules les cartes du même groupe reçoivent ses messages.',
    util: [
      'Placez ce bloc dans le bloc « au démarrage », juste après le bloc « allumer la radio ».',
      'Donnez le même numéro à toutes les cartes qui doivent se parler.',
    ],
    savoir: [
      'En classe, donnez un **groupe différent à chaque équipe** : les messages des autres équipes ne vous gêneront pas.',
      'Sans ce bloc, la carte est dans le groupe **0**.',
    ],
    legende: 'La carte rejoint le groupe 5 ; le bouton A envoie « Salut » aux cartes de ce groupe.',
  },
  {
    t: 'radio_envoyer_nombre',
    titre: 'envoyer le nombre … par radio',
    sert: '**Envoie un nombre** par radio aux autres cartes du même groupe.',
    util: [
      'Écrivez le nombre, ou mettez-y un bloc qui renvoie un nombre (une mesure, une variable…).',
    ],
    savoir: [
      'La carte qui reçoit utilise le bloc « quand la radio reçoit un nombre » et le bloc « radio : le nombre reçu ».',
      'Ces messages ne sont pas compris par une carte programmée avec MakeCode : les deux cartes doivent être programmées avec EasyBloc.',
    ],
    legende: 'Le bouton A envoie le nombre 5 aux autres cartes du même groupe.',
  },
  {
    t: 'radio_envoyer_valeur',
    titre: 'envoyer la valeur … = … par radio',
    sert: '**Envoie une valeur avec son nom** par radio, par exemple « temp = 21 » : la carte qui reçoit sait de quelle mesure il s\'agit.',
    util: [
      'Écrivez le nom dans la première case (un mot court, sans « = »).',
      'Mettez la valeur dans la seconde case : un nombre, un texte ou une mesure.',
    ],
    savoir: [
      'Le message part sous la forme **nom=valeur**.',
      'La carte qui reçoit utilise le bloc « quand la radio reçoit une valeur nommée », puis les blocs « radio : le nom reçu » et « radio : la valeur reçue ».',
    ],
    legende: 'Le bouton A envoie la température sous le nom « temp ».',
  },
  {
    t: 'radio_envoyer_texte',
    titre: 'envoyer msg radio …',
    sert: '**Envoie un texte** par radio aux autres cartes du même groupe.',
    util: [
      'Écrivez le texte, ou mettez-y un bloc qui renvoie une valeur.',
    ],
    savoir: [
      'Gardez des messages **courts** : la radio de la micro:bit transporte de petits messages.',
      'Un texte qui contient « = » est compris comme une valeur nommée par la carte qui reçoit.',
      'La carte qui reçoit utilise le bloc « quand la radio reçoit du texte » et le bloc « radio : le texte reçu ».',
    ],
    legende: 'La radio s\'allume au démarrage ; le bouton A envoie « Salut » aux autres cartes du même groupe.',
  },
  {
    t: 'radio_quand_recu',
    titre: 'quand la radio reçoit …',
    sert: 'Exécute les blocs placés à l\'intérieur quand la carte **reçoit un message** du type choisi : un nombre, une valeur nommée ou du texte.',
    util: [
      'Choisissez le type de message attendu.',
      'Posez ce bloc seul dans l\'espace de travail ; à l\'intérieur, lisez le message avec le bloc « radio : … ».',
    ],
    savoir: [
      'Le type est reconnu d\'après la forme du message : « 42 » est un nombre, « temp=21 » une valeur nommée, le reste du texte.',
      'N\'oubliez pas le bloc « allumer la radio » dans le bloc « au démarrage ».',
      'La radio est surveillée à chaque tour de la boucle principale du programme.',
      'Dans le simulateur, écrivez un message dans le champ « Radio : message à recevoir », puis cliquez sur « Simuler la réception ».',
    ],
    legende: 'Quand un nombre arrive par radio, il s\'affiche sur la matrice de LED.',
  },
  {
    t: 'radio_lecture',
    titre: 'radio : …',
    sert: 'Renvoie une information sur le **dernier message reçu** : le nombre, le nom, la valeur, le texte, ou la force du signal.',
    util: [
      'Choisissez l\'information dans la liste du bloc.',
      'Placez ce bloc **dans** un bloc « quand la radio reçoit … ».',
    ],
    savoir: [
      '« le nombre reçu » et « le texte reçu » vont avec un message envoyé par « envoyer le nombre » ou « envoyer msg radio » ; « le nom reçu » et « la valeur reçue », avec « envoyer la valeur ».',
      '« la force du signal » est un nombre **négatif** : plus il est proche de 0, plus l\'autre carte est proche.',
    ],
    legende: 'Quand un nombre arrive par radio, il s\'affiche sur la matrice de LED.',
  },
  {
    t: 'radio_puissance',
    titre: 'radio : puissance d\'émission …',
    sert: 'Règle la **puissance** avec laquelle la carte envoie ses messages, de **0** (portée la plus courte) à **7** (portée la plus longue).',
    util: [
      'Placez ce bloc dans le bloc « au démarrage », après le bloc « allumer la radio ».',
    ],
    savoir: [
      'Une faible puissance limite la portée : pratique pour qu\'une carte ne reçoive que les cartes **toutes proches**.',
      'Sans ce bloc, la puissance est de **6**.',
    ],
    legende: 'La radio émet à la puissance maximale (7) : la portée est la plus grande.',
  },
  {
    t: 'radio_canal',
    titre: 'radio : bande de fréquence …',
    sert: 'Choisit la **bande de fréquence** utilisée par la radio, de **0 à 83**.',
    util: [
      'Placez ce bloc dans le bloc « au démarrage », après le bloc « allumer la radio ».',
      'Donnez la même bande à toutes les cartes qui doivent se parler.',
    ],
    savoir: [
      'Deux cartes sur des bandes différentes **ne s\'entendent pas**, même avec le même groupe.',
      'Sans ce bloc, la bande est la **7**.',
    ],
    legende: 'La radio utilise la bande 7 : les cartes qui doivent s\'entendre utilisent la même bande.',
  },
  // ═══════════════ IA ═══════════════
  {
    t: 'ia_lorsque_reconnu',
    titre: 'lorsque l\'IA … reconnaît …',
    sert: 'Exécute les blocs placés à l\'intérieur quand l\'IA **reconnaît la classe choisie** : un objet, un geste ou une position avec la caméra (**vision**), un son ou un mot avec le micro (**son**).',
    util: [
      'Choisissez **vision** ou **son**.',
      'Choisissez la classe dans la liste : ce sont les classes créées dans la fenêtre IA. Pour une classe pas encore créée, choisissez « ✎ autre nom… » et écrivez son nom.',
      'Posez ce bloc seul dans l\'espace de travail : il ne s\'accroche à aucun autre bloc.',
    ],
    savoir: [
      'La reconnaissance se fait **sur l\'ordinateur** (caméra ou micro du PC, fenêtre IA) : la carte reçoit seulement le résultat, par le **câble USB**. Gardez la carte branchée et EasyBloc ouvert.',
      'Le bloc se déclenche quand l\'IA **passe** à cette classe ; il ne se redéclenche pas tant que la classe reste la même.',
      'Les accents et les majuscules ne comptent pas : « Chat » et « chat » sont la même classe.',
    ],
    legende: 'Quand la caméra reconnaît la classe « Chat », un cœur s\'affiche ; quand le micro reconnaît « Clap », un fantôme.',
  },
  {
    t: 'ia_classe_est',
    titre: 'l\'IA … reconnaît …',
    sert: 'Renvoie **vrai** tant que la dernière classe reconnue par l\'IA (caméra ou micro) est celle choisie, **faux** sinon.',
    valeur: 'logique',
    util: [
      'Choisissez **vision** ou **son**, puis la classe.',
      'Mettez ce bloc dans un bloc « si », dans le bloc « répéter indéfiniment ».',
    ],
    savoir: [
      'La reconnaissance se fait **sur l\'ordinateur** (caméra ou micro du PC, fenêtre IA) : la carte reçoit seulement le résultat, par le **câble USB**. Gardez la carte branchée et EasyBloc ouvert.',
      'Il redevient **faux** quand la confiance de l\'IA passe sous le **seuil de confiance** réglé dans la fenêtre IA.',
    ],
    legende: 'Tant que la caméra reconnaît « Chat », un cœur est affiché ; sinon l\'écran est vide.',
  },
  {
    t: 'ia_derniere_classe',
    titre: 'dernière classe reconnue par l\'IA …',
    sert: 'Renvoie le **nom de la dernière classe** reconnue par l\'IA (caméra ou micro), ou un texte vide si rien n\'est reconnu.',
    valeur: 'texte',
    util: [
      'Choisissez **vision** ou **son**.',
      'Affichez le résultat, ou comparez-le à un texte dans un bloc « si ».',
    ],
    savoir: [
      'Le nom est écrit **sans accents ni majuscules**, avec « _ » à la place des espaces : « Chat noir » devient « chat_noir ».',
      'Un résultat qui n\'a pas été confirmé depuis **1,5 seconde** est oublié : le texte redevient vide.',
      'La reconnaissance se fait **sur l\'ordinateur** (caméra ou micro du PC, fenêtre IA) : la carte reçoit seulement le résultat, par le **câble USB**. Gardez la carte branchée et EasyBloc ouvert.',
    ],
    legende: 'Le nom de la dernière classe reconnue par la caméra s\'écrit dans la console chaque seconde.',
  },
  {
    t: 'ia_confiance',
    titre: 'confiance de l\'IA … (%)',
    sert: 'Renvoie la **certitude** de l\'IA pour la dernière classe reconnue, de **0 à 100 %**.',
    valeur: 'nombre',
    util: [
      'Choisissez **vision** ou **son**.',
      'Comparez la valeur à un nombre pour n\'agir que lorsque l\'IA est **sûre** d\'elle (par exemple plus de 80 %).',
    ],
    savoir: [
      'La valeur est mise à jour quand elle **change nettement**, pas à chaque image.',
      'Elle revient à **0** quand rien n\'est reconnu.',
      'La reconnaissance se fait **sur l\'ordinateur** (caméra ou micro du PC, fenêtre IA) : la carte reçoit seulement le résultat, par le **câble USB**. Gardez la carte branchée et EasyBloc ouvert.',
    ],
    legende: 'La certitude de l\'IA pour le son reconnu s\'écrit dans la console chaque seconde.',
  },
  {
    t: 'ia_qr_lorsque_lu',
    titre: 'lorsqu\'un code QR est lu',
    sert: 'Exécute les blocs placés à l\'intérieur **à chaque nouveau QR code** (ou code-barres) lu par la caméra de l\'ordinateur.',
    util: [
      'Posez ce bloc seul dans l\'espace de travail ; à l\'intérieur, lisez le texte avec le bloc « texte du dernier code QR lu ».',
    ],
    savoir: [
      'La lecture se fait **sur l\'ordinateur** : dans la fenêtre IA, onglet « QR code », cliquez sur « ▶ Lire les codes ». La carte reçoit le texte par le **câble USB**.',
      'Le même code montré en continu ne redéclenche pas le bloc : il faut l\'enlever, puis le montrer à nouveau.',
    ],
    legende: 'Chaque nouveau code lu fait défiler son texte sur la matrice de LED.',
    exemple: [B('ia_qr_lorsque_lu', null, { DO: S(B('faire_defiler', null, { VALEUR: V(B('ia_qr_texte')) })) })],
  },
  {
    t: 'ia_qr_visible',
    titre: 'un code QR est visible',
    sert: 'Renvoie **vrai** tant que la caméra de l\'ordinateur voit un QR code (ou un code-barres), **faux** sinon.',
    valeur: 'logique',
    util: [
      'Mettez ce bloc dans un bloc « si », dans le bloc « répéter indéfiniment ».',
    ],
    savoir: [
      'La lecture se fait **sur l\'ordinateur** : dans la fenêtre IA, onglet « QR code », cliquez sur « ▶ Lire les codes ». La carte reçoit le texte par le **câble USB**.',
      'Il redevient faux **moins d\'une seconde** après la disparition du code.',
    ],
    legende: 'Un visage heureux s\'affiche tant qu\'un code est visible ; sinon l\'écran est vide.',
    exemple: [B('boucle_infinie', null, { DO: S(
      B('controls_if', null, { IF0: V(B('ia_qr_visible')), DO0: S(ICONE('HAPPY')) }),
      B('controls_if', null, { IF0: V(B('logic_negate', null, { BOOL: V(B('ia_qr_visible')) })), DO0: S(B('effacer_ecran')) })) })],
  },
  {
    t: 'ia_qr_texte',
    titre: 'texte du dernier code QR lu',
    sert: 'Renvoie le **texte** contenu dans le dernier QR code (ou code-barres) lu, ou un texte vide si aucun code n\'a été lu.',
    valeur: 'texte',
    util: [
      'Placez ce bloc dans le bloc « lorsqu\'un code QR est lu » pour réagir à chaque code.',
    ],
    savoir: [
      'Le texte arrive **sans accents** (« Élève » devient « Eleve ») et coupé à **60 caractères**.',
      'Il reste disponible après la disparition du code, jusqu\'au code suivant.',
      'La lecture se fait **sur l\'ordinateur** : dans la fenêtre IA, onglet « QR code », cliquez sur « ▶ Lire les codes ». La carte reçoit le texte par le **câble USB**.',
    ],
    legende: 'Chaque nouveau code lu fait défiler son texte sur la matrice de LED.',
    exempleDe: 'ia_qr_lorsque_lu',
  },
  // ═══════════════ Grove : LED, barre, ruban, buzzer ═══════════════
  {
    t: 'grove_led_luminosite',
    titre: '[LED] régler la luminosité à … sur la broche …',
    sert: 'Règle la **luminosité** du module LED Grove branché sur une broche, de **0** (éteinte) à **1023** (au maximum).',
    util: [
      'Écrivez le niveau, ou mettez-y un bloc qui renvoie un nombre (une mesure de potentiomètre, par exemple).',
      'Choisissez la broche du module.',
    ],
    savoir: [
      'Un niveau plus petit que 0 ou plus grand que 1023 est ramené à 0 ou à 1023.',
      'La LED clignote en réalité très vite : l\'œil voit une lumière plus ou moins forte.',
      'Pour seulement allumer ou éteindre, le bloc « [LED] contrôler la LED à … » suffit.',
    ],
    legende: 'La LED branchée sur P0 est réglée à la moitié de sa luminosité (512 sur 1023).',
  },
  {
    t: 'grove_barre_niveau',
    titre: 'barre de LED sur … niveau … (0 à 10)',
    sert: 'Allume les LED de la **barre de LED Grove** de la première jusqu\'au **niveau** choisi, de **0** (toutes éteintes) à **10** (toutes allumées), comme une jauge.',
    util: [
      'Choisissez le **port Grove** où la barre est branchée (P0 / P14, P1 / P15…).',
      'Mettez dans la case un nombre, ou une mesure ramenée entre 0 et 10 (par exemple la lumière divisée par 100).',
    ],
    savoir: [
      'La barre occupe **deux broches** : celles du port choisi.',
      'Elle compte 10 LED : 8 vertes, 1 orange et 1 rouge.',
      'Un nombre à virgule est arrondi à l\'entier inférieur ; au-delà de 10, toutes les LED sont allumées.',
    ],
    legende: 'La barre de LED (port P0 / P14) montre la lumière mesurée sur P1 : plus il y a de lumière, plus il y a de LED allumées.',
  },
  {
    t: 'grove_barre_led',
    titre: 'barre de LED sur … LED n° … …',
    sert: 'Allume ou éteint **une seule LED** de la barre de LED Grove, sans toucher aux autres.',
    util: [
      'Choisissez le port de la barre, puis écrivez le numéro de la LED, de **1 à 10**.',
      'Choisissez **allumée** ou **éteinte**.',
    ],
    savoir: [
      'Un numéro en dehors de 1 à 10 ne fait rien.',
      'La barre occupe **deux broches** : celles du port choisi.',
    ],
    legende: 'Les LED de la barre s\'allument l\'une après l\'autre, comme un chenillard.',
  },
  {
    t: 'grove_ruban_definir',
    titre: 'définir le ruban RGB sur … avec … LED(s)',
    sert: 'Indique sur quelle broche le **ruban de LED RGB** Grove est branché, et **combien de LED** il compte.',
    util: [
      'Placez ce bloc dans le bloc « au démarrage », avant les autres blocs du ruban.',
      'Choisissez la broche, puis écrivez le nombre de LED, de **1 à 64**.',
    ],
    savoir: [
      'Sans le bloc « définir le ruban RGB sur … », le ruban est pris sur la broche **P1** avec **16 LED**.',
      'Indiquez le **vrai nombre** de LED : sinon une partie du ruban reste éteinte, ou un numéro de LED trop grand provoque une erreur.',
    ],
    legende: 'Un ruban de 16 LED est défini sur P0, sa luminosité est réglée à 50 %, puis il s\'allume en rouge.',
  },
  {
    t: 'grove_ruban_couleur',
    titre: 'colorer tout le ruban en …',
    sert: 'Allume **toutes les LED** du ruban RGB dans la **couleur** choisie.',
    util: [
      'Choisissez la couleur dans la liste du bloc.',
    ],
    savoir: [
      'La couleur tient compte de la luminosité réglée avec le bloc « luminosité du ruban à … % ».',
      'Sans le bloc « définir le ruban RGB sur … », le ruban est pris sur la broche **P1** avec **16 LED**.',
    ],
    legende: 'Tout le ruban s\'allume en rouge deux secondes, puis s\'éteint.',
  },
  {
    t: 'grove_ruban_effacer',
    titre: 'éteindre le ruban',
    sert: '**Éteint toutes les LED** du ruban RGB.',
    util: [
      'Placez-le où le ruban doit s\'éteindre.',
    ],
    savoir: [
      'Pour éteindre une seule LED, utilisez le bloc « éteindre la LED n° … ».',
    ],
    legende: 'Tout le ruban s\'allume en rouge deux secondes, puis s\'éteint.',
  },
  {
    t: 'grove_ruban_couleur_index',
    titre: 'colorer la LED n° … en …',
    sert: 'Allume **une seule LED** du ruban RGB dans la **couleur** choisie, sans toucher aux autres.',
    util: [
      'Écrivez le numéro de la LED, ou mettez-y une variable (pour faire avancer une lumière, par exemple).',
      'Choisissez la couleur dans la liste du bloc.',
    ],
    savoir: [
      'Les LED sont numérotées **à partir de 0** : avec 16 LED, de 0 à 15. Sur la carte, un numéro trop grand **arrête le programme** avec une erreur ; le simulateur, lui, l\'ignore.',
    ],
    legende: 'La LED n° 0 s\'allume en vert et la LED n° 1 en bleu.',
  },
  {
    t: 'grove_ruban_effacer_index',
    titre: 'éteindre la LED n° …',
    sert: '**Éteint une seule LED** du ruban RGB, sans toucher aux autres.',
    util: [
      'Écrivez le numéro de la LED à éteindre.',
    ],
    savoir: [
      'Les LED sont numérotées **à partir de 0** : avec 16 LED, de 0 à 15. Sur la carte, un numéro trop grand **arrête le programme** avec une erreur ; le simulateur, lui, l\'ignore.',
    ],
    legende: 'Tout le ruban s\'allume en rouge, puis la LED n° 0 s\'éteint deux secondes plus tard.',
  },
  {
    t: 'grove_ruban_perso',
    titre: 'colorer tout le ruban en R … V … B …',
    sert: 'Allume **toutes les LED** du ruban dans une couleur que vous composez avec du **rouge (R)**, du **vert (V)** et du **bleu (B)**.',
    util: [
      'Écrivez la quantité de rouge, de vert et de bleu, chacune de **0 à 255** (0, 0, 0 = éteint ; 255, 255, 255 = blanc).',
    ],
    savoir: [
      'Mélanger les couleurs : rouge + vert = jaune, rouge + bleu = violet, vert + bleu = cyan.',
      'La couleur tient compte de la luminosité réglée avec le bloc « luminosité du ruban à … % ».',
    ],
    legende: 'Rouge 255, vert 128, bleu 0 : le ruban s\'allume en orange.',
  },
  {
    t: 'grove_ruban_perso_index',
    titre: 'colorer la LED n° … en R … V … B …',
    sert: 'Allume **une seule LED** du ruban dans une couleur que vous composez avec du **rouge (R)**, du **vert (V)** et du **bleu (B)**.',
    util: [
      'Écrivez le numéro de la LED, puis la quantité de rouge, de vert et de bleu, chacune de **0 à 255**.',
    ],
    savoir: [
      'Les LED sont numérotées **à partir de 0** : avec 16 LED, de 0 à 15. Sur la carte, un numéro trop grand **arrête le programme** avec une erreur ; le simulateur, lui, l\'ignore.',
    ],
    legende: 'La LED n° 0 prend une couleur violette (rouge 255, vert 0, bleu 128).',
  },
  {
    t: 'grove_ruban_luminosite',
    titre: 'luminosité du ruban à … %',
    sert: 'Règle la **luminosité** des couleurs du ruban RGB, de **0 %** (éteint) à **100 %** (au maximum).',
    util: [
      'Placez ce bloc **avant** les blocs qui colorent le ruban.',
    ],
    savoir: [
      'La luminosité s\'applique aux couleurs envoyées **ensuite** : les LED déjà allumées ne changent pas tant qu\'on ne les recolore pas.',
      'Une luminosité réduite fatigue moins les yeux et consomme moins d\'énergie.',
    ],
    legende: 'Un ruban de 16 LED est défini sur P0, sa luminosité est réglée à 50 %, puis il s\'allume en rouge.',
  },
  {
    t: 'grove_buzzer_etat',
    titre: 'buzzer sur … …',
    sert: 'Fait **sonner** le buzzer Grove (**marche**) ou le fait **taire** (**arrêt**).',
    util: [
      'Choisissez la broche du buzzer, puis **marche** ou **arrêt**.',
    ],
    savoir: [
      'En marche, le buzzer **sonne sans s\'arrêter** jusqu\'au bloc « buzzer sur … arrêt ».',
      'Le buzzer Grove fait toujours le **même son** : pour jouer des notes, il faut un haut-parleur (blocs de la catégorie « Actionneurs (Audio) »).',
    ],
    legende: 'Le buzzer branché sur P0 sonne une seconde, se tait une seconde, et ainsi de suite.',
  },
  {
    t: 'grove_buzzer_bip',
    titre: 'bip du buzzer sur … pendant … ms',
    sert: 'Fait **sonner** le buzzer Grove pendant la **durée** choisie, puis l\'arrête.',
    util: [
      'Choisissez la broche du buzzer, puis écrivez la durée en **millisecondes** (1000 ms = 1 seconde).',
    ],
    savoir: [
      'Le programme **attend la fin du bip** avant de passer au bloc suivant.',
    ],
    legende: 'Le buzzer branché sur P1 bipe quand le détecteur de mouvement branché sur P0 voit bouger.',
  },
  // ═══════════════ Grove : moteurs et relais ═══════════════
  {
    t: 'grove_relais',
    titre: 'relais sur … …',
    sert: 'Commande le **relais Grove** : un interrupteur commandé par la carte, qui allume ou éteint un **autre circuit** (lampe, moteur, pompe…).',
    util: [
      'Choisissez la broche du relais.',
      'Choisissez **fermé (marche)** pour faire fonctionner l\'appareil, **ouvert (arrêt)** pour l\'arrêter.',
    ],
    savoir: [
      'Le relais reste dans son état jusqu\'au prochain bloc qui le commande.',
      'L\'appareil commandé a **sa propre alimentation**, séparée de la carte : le relais ne fait que fermer ou ouvrir son circuit. Ne branchez jamais le secteur sans l\'aide d\'un adulte qualifié.',
      'Dans le simulateur, le contact dessiné se ferme ou s\'ouvre.',
    ],
    legende: 'Le relais branché sur P0 allume la lampe deux secondes, puis l\'éteint deux secondes, sans fin.',
  },
  {
    t: 'grove_moteur_vitesse',
    titre: 'moteur canal … vitesse …',
    sert: 'Fait tourner le moteur branché sur le canal **1** ou **2** du **pilote de moteurs Grove**, à la vitesse choisie.',
    util: [
      'Choisissez le canal du moteur.',
      'Écrivez la vitesse, de **−63 à 63** : un nombre **négatif** fait tourner dans l\'autre sens, **0** arrête.',
    ],
    savoir: [
      'Le pilote de moteurs Grove (DRV8830) se branche sur un port **I2C** et commande **deux moteurs**, sur les canaux 1 et 2.',
      'Le moteur **continue de tourner** jusqu\'à un autre ordre : pensez au bloc « arrêter le moteur canal … ».',
      'Une vitesse hors de −63 à 63 est ramenée à la limite la plus proche.',
    ],
    legende: 'Le moteur du canal 1 tourne à la vitesse 50 pendant deux secondes, puis s\'arrête.',
  },
  {
    t: 'grove_moteur_action',
    titre: '… le moteur canal …',
    sert: '**Arrête** ou **freine** le moteur du canal choisi du pilote de moteurs Grove, ou **efface son défaut** après une surcharge.',
    util: [
      'Choisissez l\'action, puis le canal (1 ou 2).',
    ],
    savoir: [
      '**Arrêter** laisse le moteur ralentir tout seul ; **freiner** l\'arrête plus vite.',
      'Après une surcharge (moteur bloqué, par exemple), le pilote se protège : **effacez le défaut** pour pouvoir redémarrer le moteur. Le bloc « moteur canal … vitesse … » le fait aussi à chaque fois.',
      'Le pilote de moteurs Grove (DRV8830) se branche sur un port **I2C** et commande **deux moteurs**, sur les canaux 1 et 2.',
    ],
    legende: 'Le moteur du canal 1 tourne à la vitesse 50 pendant deux secondes, puis s\'arrête.',
  },
  {
    t: 'grove_moteur_defaut',
    titre: 'défaut du moteur canal …',
    sert: 'Renvoie le **code de défaut** du canal choisi du pilote de moteurs Grove : **0** si tout va bien.',
    valeur: 'nombre',
    util: [
      'Comparez le résultat à 0 dans un bloc « si » pour détecter un problème (moteur bloqué, surcharge…).',
    ],
    savoir: [
      'Un autre nombre que 0 signale un défaut : utilisez alors le bloc « effacer le défaut sur le moteur canal … ».',
      'Le pilote de moteurs Grove (DRV8830) se branche sur un port **I2C** et commande **deux moteurs**, sur les canaux 1 et 2.',
    ],
    legende: 'Le code de défaut du canal 1 s\'affiche chaque seconde sur la matrice de LED.',
  },
  {
    t: 'grove_pca_init',
    titre: 'initialiser le pilote 16 servos à l\'adresse …',
    sert: 'Prépare le **pilote 16 servos** (PCA9685), qui commande jusqu\'à 16 servomoteurs.',
    util: [
      'Placez ce bloc dans le bloc « au démarrage ».',
      'Choisissez l\'adresse : **0x7F** pour le module Grove, **0x40** pour la plupart des autres cartes PCA9685.',
    ],
    savoir: [
      'Avec le module Grove (adresse 0x7F), ce bloc est **facultatif** ; avec l\'adresse 0x40, il est **indispensable**.',
      'Le pilote 16 servos (PCA9685) se branche sur un port **I2C** ; les servomoteurs se branchent sur ses **voies 0 à 15**.',
    ],
    legende: 'Le servomoteur branché sur la voie 0 du pilote 16 servos va de 0 à 180°, puis revient, sans fin.',
  },
  {
    t: 'grove_pca_angle',
    titre: 'pilote 16 servos : servo n° … à … °',
    sert: 'Place le **servomoteur** branché sur une voie du pilote 16 servos à l\'angle choisi.',
    util: [
      'Écrivez le numéro de la voie, de **0 à 15**, puis l\'angle, de **0 à 180°**.',
    ],
    savoir: [
      'Un numéro de voie ou un angle hors limites est ramené à la limite la plus proche.',
      'Le programme **n\'attend pas** que le servomoteur soit arrivé : ajoutez un bloc « attendre ».',
      'Dans le simulateur, le servomoteur apparaît dans le montage sous le nom S0 à S15.',
    ],
    legende: 'Le servomoteur branché sur la voie 0 du pilote 16 servos va de 0 à 180°, puis revient, sans fin.',
  },
  {
    t: 'grove_pca_continu',
    titre: 'pilote 16 servos : servo continu n° … à … %',
    sert: 'Fait tourner le **servomoteur à rotation continue** branché sur une voie du pilote 16 servos, à la vitesse choisie.',
    util: [
      'Écrivez le numéro de la voie, de **0 à 15**, puis la vitesse, de **−100 à 100 %** : un nombre négatif fait tourner dans l\'autre sens, **0** arrête.',
    ],
    savoir: [
      'Si le servomoteur tourne encore doucement à 0 %, c\'est qu\'il a besoin d\'un réglage : essayez une petite valeur (1 ou −1, par exemple).',
      'Le servomoteur continue de tourner jusqu\'au prochain bloc qui le commande.',
    ],
    legende: 'Le servomoteur continu de la voie 1 tourne deux secondes dans un sens, puis deux secondes dans l\'autre.',
  },
  // ═══════════════ Grove : affichages ═══════════════
  {
    t: 'grove_4d_definir',
    titre: 'définir l\'afficheur 4 digits : CLK … DIO …',
    sert: 'Indique sur quelles broches est branché l\'**afficheur à 4 chiffres** Grove : **CLK** (horloge) et **DIO** (données).',
    util: [
      'Placez ce bloc dans le bloc « au démarrage », avant les autres blocs de l\'afficheur.',
      'Choisissez les deux broches : celles du port Grove où l\'afficheur est branché.',
    ],
    savoir: [
      'Ce bloc est **facultatif** : sans lui, l\'afficheur est pris avec **CLK sur P0** et **DIO sur P1**.',
    ],
    legende: 'L\'afficheur est déclaré (CLK sur P0, DIO sur P1), sa luminosité est réglée à 3, puis 1234 s\'affiche.',
  },
  {
    t: 'grove_4d_nombre',
    titre: 'afficher le nombre …',
    sert: 'Affiche un **nombre entier** sur l\'afficheur à 4 chiffres.',
    util: [
      'Écrivez le nombre, ou mettez-y un bloc qui renvoie un nombre (une mesure, un compteur…).',
    ],
    savoir: [
      'Les **4 chiffres** sont toujours écrits : 42 s\'affiche **0042**.',
      'Un nombre à virgule perd sa partie décimale (23.7 s\'affiche 0023) ; au-delà de 9999, seuls les 4 derniers chiffres restent.',
      'Un nombre négatif affiche un signe « - » à la place du premier chiffre.',
    ],
    legende: 'Le nombre 1234 s\'affiche sur l\'afficheur à 4 chiffres.',
  },
  {
    t: 'grove_4d_chiffre',
    titre: 'afficher le chiffre … à la position …',
    sert: 'Affiche **un seul chiffre** à la position choisie de l\'afficheur à 4 chiffres, sans toucher aux autres.',
    util: [
      'Écrivez le chiffre, de **0 à 9**, puis la position, de **0 à 3** (de gauche à droite).',
    ],
    savoir: [
      'Une valeur hors de 0 à 9 **éteint** cette position.',
      'Une position hors de 0 à 3 est ramenée à 0 ou à 3.',
    ],
    legende: 'Le chiffre 7 s\'affiche à la position 2 (les positions vont de 0 à 3).',
  },
  {
    t: 'grove_4d_points',
    titre: '… les deux points',
    sert: '**Allume** ou **éteint** les deux points au milieu de l\'afficheur à 4 chiffres, par exemple pour écrire une heure (12:34).',
    util: [
      'Choisissez **allumer** ou **éteindre**.',
    ],
    savoir: [
      'Les deux points restent dans leur état quand on affiche un autre nombre.',
    ],
    legende: 'Le nombre 1234 s\'affiche avec les deux points allumés : 12:34.',
  },
  {
    t: 'grove_4d_luminosite',
    titre: 'luminosité de l\'afficheur à …',
    sert: 'Règle la **luminosité** de l\'afficheur à 4 chiffres, de **0** (la plus faible) à **7** (la plus forte).',
    util: [
      'Placez ce bloc dans le bloc « au démarrage », ou changez la luminosité selon la lumière de la salle.',
    ],
    savoir: [
      'Avec 0, l\'afficheur reste allumé, mais très faiblement : pour l\'éteindre, utilisez le bloc « effacer l\'afficheur ».',
      'Une valeur hors de 0 à 7 est ramenée à 0 ou à 7.',
    ],
    legende: 'L\'afficheur est déclaré (CLK sur P0, DIO sur P1), sa luminosité est réglée à 3, puis 1234 s\'affiche.',
  },
  {
    t: 'grove_4d_effacer',
    titre: 'effacer l\'afficheur',
    sert: '**Éteint tous les chiffres** de l\'afficheur à 4 chiffres.',
    util: [
      'Placez-le où l\'afficheur doit s\'éteindre.',
    ],
    savoir: [
      'Sans le bloc « définir l\'afficheur 4 digits », l\'afficheur est pris avec **CLK sur P0** et **DIO sur P1**.',
    ],
    legende: 'Le nombre 1234 reste affiché deux secondes, puis disparaît.',
  },
  {
    t: 'grove_lcd_init',
    titre: 'initialiser l\'écran LCD 16x2',
    sert: 'Prépare l\'**écran LCD Grove 16x2** : 2 lignes de 16 caractères.',
    util: [
      'Placez ce bloc dans le bloc « au démarrage », avant les autres blocs de l\'écran.',
    ],
    savoir: [
      'Ce bloc est **facultatif** : L\'écran se branche sur un port **I2C** ; il est préparé tout seul à sa première utilisation.',
      'Le rétroéclairage de cet écran est **toujours allumé** ; il ne se commande pas.',
    ],
    legende: 'L\'écran LCD est préparé, puis « Bonjour » s\'écrit sur la première ligne et « micro:bit » sur la seconde.',
    exemple: [B('au_demarrage', null, { DO: S(B('grove_lcd_init'),
      B('grove_lcd_texte', null, { TEXTE: T('Bonjour'), X: N(0), Y: N(0) }),
      B('grove_lcd_texte', null, { TEXTE: T('micro:bit'), X: N(0), Y: N(1) })) })],
  },
  {
    t: 'grove_lcd_texte',
    titre: 'LCD : afficher … en x … y …',
    sert: 'Écrit un **texte** ou un **nombre** sur l\'écran LCD 16x2, à partir de la position choisie.',
    util: [
      'Écrivez le texte, ou mettez-y un bloc qui renvoie une valeur.',
      'Choisissez la position : **x** de **0 à 15** (colonne), **y** **0** (ligne du haut) ou **1** (ligne du bas).',
    ],
    savoir: [
      'Ce qui dépasse la fin de la ligne est **coupé**.',
      'Le nouveau texte s\'écrit **par-dessus** l\'ancien sans l\'effacer : un texte plus court laisse la fin de l\'ancien. Effacez d\'abord, ou complétez avec des espaces.',
      'Évitez les **lettres accentuées** : l\'écran ne les connaît pas et affiche un autre signe à la place.',
    ],
    legende: '« Bonjour » s\'affiche en haut à gauche pendant deux secondes, puis l\'écran s\'efface.',
  },
  {
    t: 'grove_lcd_effacer',
    titre: 'LCD : effacer',
    sert: '**Efface tout le texte** de l\'écran LCD 16x2.',
    util: [
      'Placez-le avant d\'écrire un nouveau texte, pour ne pas garder de restes de l\'ancien.',
    ],
    savoir: [
      'Le rétroéclairage reste allumé.',
    ],
    legende: '« Bonjour » s\'affiche en haut à gauche pendant deux secondes, puis l\'écran s\'efface.',
  },
  {
    t: 'grove_lcd_alimenter',
    titre: 'LCD : … l\'affichage',
    sert: '**Masque** ou **fait réapparaître** les caractères de l\'écran LCD 16x2, sans les effacer.',
    util: [
      'Choisissez **éteindre** pour masquer le texte, **allumer** pour le faire réapparaître.',
    ],
    savoir: [
      'Le texte est **gardé** : il revient tel quel avec « allumer ».',
      'Le rétroéclairage de cet écran reste allumé : il ne se commande pas.',
    ],
    legende: '« Bonjour » s\'écrit au démarrage, puis le texte clignote : une seconde visible, une seconde masqué.',
    exemple: [B('au_demarrage', null, { DO: S(B('grove_lcd_texte', null, { TEXTE: T('Bonjour'), X: N(0), Y: N(0) })) }),
      B('boucle_infinie', null, { DO: S(B('grove_lcd_alimenter', { ETAT: 'eteindre' }), ATT(1),
        B('grove_lcd_alimenter', { ETAT: 'allumer' }), ATT(1)) })],
  },
  {
    t: 'grove_lcdrgb_init',
    titre: 'initialiser l\'écran LCD RGB (V4.0)',
    sert: 'Prépare l\'**écran LCD RGB Grove** (version 4.0) : 2 lignes de 16 caractères, avec un fond lumineux dont on choisit la couleur.',
    util: [
      'Placez ce bloc dans le bloc « au démarrage », avant les autres blocs de l\'écran.',
    ],
    savoir: [
      'Ce bloc est **facultatif** : L\'écran se branche sur un port **I2C** ; il est préparé tout seul à sa première utilisation. Le fond s\'allume alors en **blanc**.',
      'D\'après la documentation de ce module, il a besoin d\'une alimentation **5 V**.',
    ],
    legende: 'L\'écran LCD RGB est préparé, puis « Bonjour » s\'écrit sur la première ligne.',
    exemple: [B('au_demarrage', null, { DO: S(B('grove_lcdrgb_init'),
      B('grove_lcdrgb_texte', null, { TEXTE: T('Bonjour'), X: N(0), Y: N(0) })) })],
  },
  {
    t: 'grove_lcdrgb_texte',
    titre: 'LCD RGB : afficher … en x … y …',
    sert: 'Écrit un **texte** ou un **nombre** sur l\'écran LCD RGB, à partir de la position choisie.',
    util: [
      'Écrivez le texte, ou mettez-y un bloc qui renvoie une valeur.',
      'Choisissez la position : **x** de **0 à 15** (colonne), **y** **0** (ligne du haut) ou **1** (ligne du bas).',
    ],
    savoir: [
      'Ce qui dépasse la fin de la ligne est **coupé**.',
      'Le nouveau texte s\'écrit **par-dessus** l\'ancien sans l\'effacer : effacez d\'abord, ou complétez avec des espaces.',
      'Évitez les **lettres accentuées** : l\'écran ne les connaît pas et affiche un autre signe à la place.',
    ],
    legende: 'Le fond passe au bleu, « Bonjour » s\'affiche, puis le rétroéclairage s\'éteint deux secondes plus tard.',
  },
  {
    t: 'grove_lcdrgb_effacer',
    titre: 'LCD RGB : effacer',
    sert: '**Efface tout le texte** de l\'écran LCD RGB.',
    util: [
      'Placez-le avant d\'écrire un nouveau texte, pour ne pas garder de restes de l\'ancien.',
    ],
    savoir: [
      'La couleur du fond ne change pas.',
    ],
    legende: '« Bonjour » s\'affiche deux secondes, puis l\'écran s\'efface.',
    exemple: [B('au_demarrage', null, { DO: S(B('grove_lcdrgb_texte', null, { TEXTE: T('Bonjour'), X: N(0), Y: N(0) }), ATT(2),
      B('grove_lcdrgb_effacer')) })],
  },
  {
    t: 'grove_lcdrgb_alimenter',
    titre: 'LCD RGB : … l\'affichage',
    sert: '**Masque** ou **fait réapparaître** les caractères de l\'écran LCD RGB, sans les effacer.',
    util: [
      'Choisissez **éteindre** pour masquer le texte, **allumer** pour le faire réapparaître.',
    ],
    savoir: [
      'Le texte est **gardé** : il revient tel quel avec « allumer ».',
      'Le fond lumineux se commande à part, avec le bloc « LCD RGB : … le rétroéclairage ».',
    ],
    legende: '« Bonjour » s\'écrit au démarrage, puis le texte clignote : une seconde visible, une seconde masqué.',
    exemple: [B('au_demarrage', null, { DO: S(B('grove_lcdrgb_texte', null, { TEXTE: T('Bonjour'), X: N(0), Y: N(0) })) }),
      B('boucle_infinie', null, { DO: S(B('grove_lcdrgb_alimenter', { ETAT: 'eteindre' }), ATT(1),
        B('grove_lcdrgb_alimenter', { ETAT: 'allumer' }), ATT(1)) })],
  },
  {
    t: 'grove_lcdrgb_fond_couleur',
    titre: 'LCD RGB : rétroéclairage …',
    sert: 'Choisit la **couleur du fond** lumineux de l\'écran LCD RGB dans une liste.',
    util: [
      'Choisissez la couleur dans la liste du bloc.',
    ],
    savoir: [
      'La couleur **noir** éteint le fond.',
      'Pour composer votre propre couleur, utilisez le bloc « LCD RGB : rétroéclairage rouge … vert … bleu … ».',
    ],
    legende: 'Le fond passe au bleu, « Bonjour » s\'affiche, puis le rétroéclairage s\'éteint deux secondes plus tard.',
  },
  {
    t: 'grove_lcdrgb_fond_rvb',
    titre: 'LCD RGB : rétroéclairage rouge … vert … bleu …',
    sert: 'Règle la **couleur du fond** de l\'écran LCD RGB en mélangeant du **rouge**, du **vert** et du **bleu**.',
    util: [
      'Écrivez la quantité de chaque couleur, de **0 à 255** (0, 0, 0 = fond éteint ; 255, 255, 255 = blanc).',
    ],
    savoir: [
      'Une valeur hors de 0 à 255 est ramenée à 0 ou à 255.',
      'Si le rétroéclairage est éteint, la couleur est gardée et apparaît au prochain « allumer le rétroéclairage ».',
    ],
    legende: 'Le fond prend une couleur orange (rouge 255, vert 128, bleu 0), puis « Orange » s\'affiche.',
    exemple: [B('au_demarrage', null, { DO: S(B('grove_lcdrgb_fond_rvb', null, { R: N(255), V: N(128), B: N(0) }),
      B('grove_lcdrgb_texte', null, { TEXTE: T('Orange'), X: N(0), Y: N(0) })) })],
  },
  {
    t: 'grove_lcdrgb_retro',
    titre: 'LCD RGB : … le rétroéclairage',
    sert: '**Éteint** ou **rallume** le fond lumineux de l\'écran LCD RGB.',
    util: [
      'Choisissez **éteindre** ou **allumer**.',
    ],
    savoir: [
      '« Allumer » rétablit la **dernière couleur** choisie.',
      'Le texte reste écrit, mais il est difficile à lire sans fond lumineux.',
    ],
    legende: 'Le fond passe au bleu, « Bonjour » s\'affiche, puis le rétroéclairage s\'éteint deux secondes plus tard.',
  },
  {
    t: 'grove_oled_init',
    titre: 'initialiser l\'écran OLED 0,96"',
    sert: 'Prépare le petit **écran OLED Grove** de 0,96 pouce : 8 lignes de 21 caractères.',
    util: [
      'Placez ce bloc dans le bloc « au démarrage », avant les autres blocs de l\'écran.',
    ],
    savoir: [
      'Ce bloc est **facultatif** : L\'écran se branche sur un port **I2C** ; il est préparé tout seul à sa première utilisation.',
    ],
    legende: 'L\'écran OLED affiche deux lignes, attend deux secondes, puis s\'efface.',
  },
  {
    t: 'grove_oled_texte',
    titre: 'OLED : afficher … en colonne … ligne …',
    sert: 'Écrit un **texte** ou un **nombre** sur l\'écran OLED, à partir de la position choisie.',
    util: [
      'Écrivez le texte, ou mettez-y un bloc qui renvoie une valeur.',
      'Choisissez la **colonne**, de **0 à 20**, et la **ligne**, de **0 à 7** (0 = en haut).',
    ],
    savoir: [
      'Ce qui dépasse la fin de la ligne est **coupé**.',
      'Les lettres accentuées sont remplacées par la lettre simple (é devient e) ; les autres signes inconnus deviennent « ? ».',
      'Le nouveau texte s\'écrit par-dessus l\'ancien : effacez d\'abord, ou complétez avec des espaces.',
    ],
    legende: 'L\'écran OLED affiche deux lignes, attend deux secondes, puis s\'efface.',
  },
  {
    t: 'grove_oled_effacer',
    titre: 'OLED : effacer l\'écran',
    sert: '**Efface tout** l\'écran OLED.',
    util: [
      'Placez-le avant d\'écrire un nouveau texte, pour ne pas garder de restes de l\'ancien.',
    ],
    savoir: [
      'L\'effacement prend un court instant : évitez de le répéter à chaque tour d\'une boucle rapide.',
    ],
    legende: 'L\'écran OLED affiche deux lignes, attend deux secondes, puis s\'efface.',
  },
  // ═══════════════ Grove : capteurs simples ═══════════════
  {
    t: 'grove_ultrason_cm',
    titre: 'distance (cm) sur …',
    sert: 'Renvoie la **distance** entre le capteur à ultrasons Grove et l\'obstacle le plus proche, en **centimètres**.',
    valeur: 'nombre',
    util: [
      'Choisissez la broche du capteur.',
      'Affichez la valeur, ou comparez-la à un nombre dans un bloc « si » (par exemple pour réagir quand quelque chose s\'approche).',
    ],
    savoir: [
      'Le capteur Grove à ultrasons n\'utilise **qu\'une broche** : celle choisie dans le bloc.',
      'Il renvoie **0** quand l\'écho ne revient pas à temps (obstacle trop loin, ou surface qui absorbe le son).',
      'Dans le simulateur, réglez la distance avec le curseur du tableau « Périphériques ».',
    ],
    legende: 'La distance mesurée par le capteur branché sur P0 s\'affiche chaque seconde.',
  },
  {
    t: 'grove_ultrason_pouces',
    titre: 'distance (pouces) sur …',
    sert: 'Renvoie la **distance** entre le capteur à ultrasons Grove et l\'obstacle le plus proche, en **pouces** (1 pouce = 2,54 cm).',
    valeur: 'nombre',
    util: [
      'Choisissez la broche du capteur.',
    ],
    savoir: [
      'En France, on mesure plutôt en centimètres : utilisez de préférence le bloc « distance (cm) sur … ».',
      'Le capteur Grove à ultrasons n\'utilise **qu\'une broche** : celle choisie dans le bloc.',
      'Il renvoie **0** quand l\'écho ne revient pas à temps.',
    ],
    legende: 'La distance mesurée par le capteur branché sur P0 s\'affiche chaque seconde.',
  },
  {
    t: 'grove_joystick_valeur',
    titre: 'valeur du joystick sur …',
    sert: 'Renvoie la **position d\'un axe** du joystick Grove, de **0 à 1023** : environ 512 quand le manche est au repos.',
    valeur: 'nombre',
    util: [
      'Choisissez la broche de l\'axe à lire : chaque axe (X ou Y) a sa propre broche.',
    ],
    savoir: [
      'Le joystick se branche sur des entrées analogiques : **P0, P1 ou P2**.',
      'Un appui sur le manche fait tomber l\'axe X presque à 0.',
      'Dans le simulateur, poussez le manche dessiné dans le montage, ou utilisez les curseurs du tableau « Périphériques ».',
    ],
    legende: 'La valeur de l\'axe X (broche P0) s\'affiche chaque seconde.',
  },
  {
    t: 'grove_joystick_direction',
    titre: 'joystick X … Y … vers …',
    sert: 'Renvoie **vrai** quand le joystick est poussé dans la **direction** choisie (haut, bas, gauche, droite), ou quand il est **au centre**.',
    valeur: 'logique',
    util: [
      'Choisissez les broches des axes **X** et **Y**, puis la direction.',
      'Mettez ce bloc dans un bloc « si », dans le bloc « répéter indéfiniment ».',
    ],
    savoir: [
      'Le joystick compte comme poussé quand l\'axe passe **sous 350** ou **au-dessus de 700** (sur 1023).',
      'Pour une commande plus fine, lisez la valeur exacte avec le bloc « valeur du joystick sur … ».',
    ],
    legende: 'Un visage heureux s\'affiche quand le joystick (axes sur P0 et P1) est poussé vers le haut.',
  },
  {
    t: 'grove_joystick_bouton',
    titre: 'bouton du joystick sur … pressé',
    sert: 'Renvoie **vrai** quand on **appuie sur le manche** du joystick Grove, **faux** sinon.',
    valeur: 'logique',
    util: [
      'Choisissez la broche de l\'axe **X** du joystick.',
      'Mettez ce bloc dans un bloc « si ».',
    ],
    savoir: [
      'L\'appui est reconnu parce qu\'il fait tomber l\'axe X **sous 250** : pousser le manche tout à gauche peut donner le même résultat.',
    ],
    legende: 'Un cœur s\'affiche quand on appuie sur le manche du joystick.',
  },
  {
    t: 'grove_bouton_lorsque',
    titre: 'lorsque le bouton poussoir sur … est appuyé',
    sert: 'Exécute les blocs placés à l\'intérieur **à chaque appui** sur le bouton poussoir Grove.',
    util: [
      'Choisissez la broche du bouton.',
      'Posez ce bloc seul dans l\'espace de travail : il ne s\'accroche à aucun autre bloc.',
    ],
    savoir: [
      'Un appui ne déclenche le bloc **qu\'une fois**, même si le bouton reste enfoncé.',
      'Le bouton est surveillé à chaque tour de la boucle principale du programme.',
      'Dans le simulateur, cliquez sur le bouton dessiné dans le montage.',
    ],
    legende: 'Chaque appui sur le bouton poussoir (P0) ajoute 1 au compteur, qui s\'affiche.',
  },
  {
    t: 'grove_bouton_appuye',
    titre: 'bouton poussoir sur … appuyé',
    sert: 'Renvoie **vrai** tant que le bouton poussoir Grove est enfoncé, **faux** sinon.',
    valeur: 'logique',
    util: [
      'Choisissez la broche du bouton.',
      'Mettez ce bloc dans un bloc « si », dans le bloc « répéter indéfiniment ».',
    ],
    savoir: [
      'Pour réagir **une fois par appui**, utilisez plutôt le bloc « lorsque le bouton poussoir sur … est appuyé ».',
      'Dans le simulateur, maintenez le clic sur le bouton dessiné dans le montage.',
    ],
    legende: 'Un cœur s\'affiche tant que le bouton poussoir (P0) est enfoncé.',
  },
  {
    t: 'grove_lumiere',
    titre: 'luminosité sur … en …',
    sert: 'Renvoie la **lumière** reçue par le capteur de lumière Grove : plus il y a de lumière, plus la valeur est grande.',
    valeur: 'nombre',
    util: [
      'Choisissez la broche du capteur : **P0, P1 ou P2** (entrées analogiques).',
      'Choisissez l\'unité : la **valeur** de 0 à 1023, ou le **pourcentage** de 0 à 100 %.',
    ],
    savoir: [
      'C\'est une mesure **relative** : elle sert à comparer (plus clair, plus sombre), pas à mesurer la lumière en lux.',
      'Dans le simulateur, réglez la lumière avec le curseur « Lumière » du tableau « Périphériques ».',
    ],
    legende: 'La lumière mesurée sur P1, en pourcentage, s\'affiche chaque seconde.',
  },
  {
    t: 'grove_gestes_init',
    titre: 'initialiser le capteur de gestes',
    sert: 'Prépare le **capteur de gestes** Grove (PAJ7620), qui reconnaît les mouvements de la main devant lui.',
    util: [
      'Placez ce bloc dans le bloc « au démarrage ».',
    ],
    savoir: [
      'Ce bloc est **facultatif** : le capteur est préparé tout seul à sa première lecture.',
      'Le capteur de gestes se branche sur un port **I2C**.',
    ],
    legende: 'Le capteur de gestes est préparé, puis le dernier geste détecté s\'affiche chaque seconde.',
  },
  {
    t: 'grove_gestes_est',
    titre: 'le geste détecté est …',
    sert: 'Renvoie **vrai** quand le capteur de gestes vient de détecter le **geste choisi** : vers le haut, le bas, la gauche, la droite, l\'avant, l\'arrière, une rotation dans un sens ou dans l\'autre, ou une vague.',
    valeur: 'logique',
    util: [
      'Choisissez le geste, puis mettez ce bloc dans un bloc « si ».',
    ],
    savoir: [
      'Chaque lecture **consomme** le geste : il n\'est donné qu\'une fois. Pour tester plusieurs gestes, rangez d\'abord le résultat du bloc « geste détecté » dans une variable.',
      'Passez la main à quelques centimètres du capteur, d\'un mouvement franc.',
      'Dans le simulateur, choisissez le geste en cliquant sur le capteur dessiné dans le montage.',
    ],
    legende: 'Un visage heureux s\'affiche quand le capteur détecte un geste vers le haut.',
  },
  {
    t: 'grove_gestes_lire',
    titre: 'geste détecté',
    sert: 'Renvoie le **nom du dernier geste** détecté (« haut », « gauche », « vague »…), ou un texte vide si aucun geste n\'a été fait depuis la lecture précédente.',
    valeur: 'texte',
    util: [
      'Affichez le résultat, ou rangez-le dans une variable pour le comparer ensuite.',
    ],
    savoir: [
      'Chaque lecture **consomme** le geste : il n\'est donné qu\'une fois. Pour tester plusieurs gestes, rangez d\'abord le résultat du bloc « geste détecté » dans une variable.',
      'Les noms sont écrits sans accents : « arriere ».',
    ],
    legende: 'Le capteur de gestes est préparé, puis le dernier geste détecté s\'affiche chaque seconde.',
  },
  // ═══════════════ Grove : environnement, couleur, horloge ═══════════════
  {
    t: 'grove_th_init',
    titre: 'initialiser le capteur température & humidité',
    sert: 'Prépare le **capteur de température et d\'humidité** Grove I2C (puce AHT20, aussi vendue sous le nom DHT20).',
    util: [
      'Placez ce bloc dans le bloc « au démarrage ».',
    ],
    savoir: [
      'Ce bloc est **facultatif** : le capteur est préparé tout seul à sa première mesure.',
      'Le capteur se branche sur un port **I2C**.',
    ],
    legende: 'Le capteur est préparé, puis l\'humidité (en %) s\'affiche chaque seconde.',
  },
  {
    t: 'grove_th_mesure',
    titre: 'capteur T&H : …',
    sert: 'Renvoie la **température** (en °C ou en °F) ou l\'**humidité** de l\'air (en %) mesurée par le capteur de température et d\'humidité Grove I2C.',
    valeur: 'nombre',
    util: [
      'Choisissez la grandeur : **température (°C)**, **température (°F)** ou **humidité (%)**.',
    ],
    savoir: [
      'Le résultat peut être un nombre à virgule.',
      'Dans le simulateur, réglez les valeurs avec les curseurs du tableau « Périphériques ».',
    ],
    legende: 'La température mesurée par le capteur s\'affiche chaque seconde.',
  },
  {
    t: 'grove_dht11_definir',
    titre: 'définir le DHT11 sur …',
    sert: 'Indique sur quelle broche est branché le capteur de température et d\'humidité **DHT11**.',
    util: [
      'Placez ce bloc dans le bloc « au démarrage ».',
      'Choisissez la broche du capteur.',
    ],
    savoir: [
      'Ce bloc est **facultatif** : sans lui, le DHT11 est pris sur la broche **P1**.',
      'Sur la carte **micro:bit V2**, la lecture du DHT est **expérimentale** : le bloc renvoie **-1** quand la mesure échoue, jamais une valeur fausse. Le capteur de température et d\'humidité I2C (AHT20/DHT20) est plus fiable.',
    ],
    legende: 'Le DHT11 est déclaré sur P1, puis la température s\'affiche chaque seconde.',
  },
  {
    t: 'grove_dht11_mesure',
    titre: 'DHT11 : …',
    sert: 'Renvoie la **température** (en °C ou en °F) ou l\'**humidité** (en %) mesurée par le capteur **DHT11**.',
    valeur: 'nombre',
    util: [
      'Choisissez la grandeur : **température (°C)**, **température (°F)** ou **humidité (%)**.',
    ],
    savoir: [
      'Le DHT11 donne **une mesure par seconde** au plus : inutile de le lire plus souvent.',
      'Sur la carte **micro:bit V2**, la lecture du DHT est **expérimentale** : le bloc renvoie **-1** quand la mesure échoue, jamais une valeur fausse. Le capteur de température et d\'humidité I2C (AHT20/DHT20) est plus fiable.',
    ],
    legende: 'Le DHT11 est déclaré sur P1, puis la température s\'affiche chaque seconde.',
  },
  {
    t: 'grove_dht22_definir',
    titre: 'définir le DHT22 sur …',
    sert: 'Indique sur quelle broche est branché le capteur de température et d\'humidité **DHT22**.',
    util: [
      'Placez ce bloc dans le bloc « au démarrage ».',
      'Choisissez la broche du capteur.',
    ],
    savoir: [
      'Ce bloc est **facultatif** : sans lui, le DHT22 est pris sur la broche **P1**.',
      'Sur la carte **micro:bit V2**, la lecture du DHT est **expérimentale** : le bloc renvoie **-1** quand la mesure échoue, jamais une valeur fausse. Le capteur de température et d\'humidité I2C (AHT20/DHT20) est plus fiable.',
    ],
    legende: 'Le DHT22 est déclaré sur P1, puis la température s\'affiche chaque seconde.',
  },
  {
    t: 'grove_dht22_mesure',
    titre: 'DHT22 : …',
    sert: 'Renvoie la **température** (en °C ou en °F) ou l\'**humidité** (en %) mesurée par le capteur **DHT22**.',
    valeur: 'nombre',
    util: [
      'Choisissez la grandeur : **température (°C)**, **température (°F)** ou **humidité (%)**.',
    ],
    savoir: [
      'Le DHT22 donne **une mesure toutes les 2 secondes** au plus : inutile de le lire plus souvent.',
      'Sur la carte **micro:bit V2**, la lecture du DHT est **expérimentale** : le bloc renvoie **-1** quand la mesure échoue, jamais une valeur fausse. Le capteur de température et d\'humidité I2C (AHT20/DHT20) est plus fiable.',
    ],
    legende: 'Le DHT22 est déclaré sur P1, puis la température s\'affiche chaque seconde.',
  },
  {
    t: 'grove_scd30_init',
    titre: 'initialiser le capteur CO₂ SCD30',
    sert: 'Prépare le **capteur de CO₂ SCD30**, qui mesure aussi la température et l\'humidité.',
    util: [
      'Placez ce bloc dans le bloc « au démarrage ».',
    ],
    savoir: [
      'Ce bloc est **facultatif** : le capteur est préparé tout seul à sa première mesure.',
      'Le capteur se branche sur un port **I2C**.',
    ],
    legende: 'Le capteur est préparé, puis le CO₂ (en ppm) s\'affiche chaque seconde.',
  },
  {
    t: 'grove_scd30_lire',
    titre: 'SCD30 : …',
    sert: 'Renvoie le **CO₂** (en ppm), la **température** (en °C) ou l\'**humidité** (en %) mesurés par le capteur SCD30.',
    valeur: 'nombre',
    util: [
      'Choisissez la grandeur : **CO₂ (ppm)**, **température (°C)** ou **humidité (%)**.',
    ],
    savoir: [
      'Le CO₂ se mesure en **ppm** (parties par million) : l\'air extérieur en contient environ 400 ppm ; plus la valeur monte dans une salle, plus il faut aérer.',
      'Dans le simulateur, réglez les valeurs avec les curseurs du tableau « Périphériques ».',
    ],
    legende: 'Le CO₂ mesuré par le SCD30 s\'affiche chaque seconde.',
  },
  {
    t: 'grove_scd41_init',
    titre: 'initialiser le capteur CO₂ SCD41',
    sert: 'Prépare le **capteur de CO₂ SCD41**, qui mesure aussi la température et l\'humidité.',
    util: [
      'Placez ce bloc dans le bloc « au démarrage ».',
    ],
    savoir: [
      'Ce bloc est **facultatif** : le capteur est préparé tout seul à sa première mesure.',
      'Le capteur se branche sur un port **I2C**.',
    ],
    legende: 'Le capteur est préparé, puis le CO₂ (en ppm) s\'affiche chaque seconde.',
  },
  {
    t: 'grove_scd41_lire',
    titre: 'SCD41 : …',
    sert: 'Renvoie le **CO₂** (en ppm), la **température** (en °C) ou l\'**humidité** (en %) mesurés par le capteur SCD41.',
    valeur: 'nombre',
    util: [
      'Choisissez la grandeur : **CO₂ (ppm)**, **température (°C)** ou **humidité (%)**.',
    ],
    savoir: [
      'Le CO₂ se mesure en **ppm** (parties par million) : l\'air extérieur en contient environ 400 ppm ; plus la valeur monte dans une salle, plus il faut aérer.',
      'Dans le simulateur, réglez les valeurs avec les curseurs du tableau « Périphériques ».',
    ],
    legende: 'Le CO₂ mesuré par le SCD41 s\'affiche chaque seconde.',
  },
  {
    t: 'grove_bmp280',
    titre: 'BMP280 : …',
    sert: 'Renvoie la **pression de l\'air** (en hPa), la **température** (en °C) ou l\'**altitude** estimée (en m) mesurées par le capteur Grove BMP280.',
    valeur: 'nombre',
    util: [
      'Choisissez la grandeur : **pression (hPa)**, **température (°C)** ou **altitude (m)**.',
    ],
    savoir: [
      'Au niveau de la mer, la pression de l\'air est d\'environ **1013 hPa** ; elle baisse quand on monte.',
      'L\'altitude est **calculée** à partir de la pression, en prenant 1013,25 hPa au niveau de la mer : elle varie aussi avec la météo.',
      'Le capteur se branche sur un port **I2C**. ' + 'Dans le simulateur, réglez les valeurs avec les curseurs du tableau « Périphériques ».',
    ],
    legende: 'La pression de l\'air mesurée par le BMP280 s\'affiche chaque seconde.',
  },
  {
    t: 'grove_sgp30',
    titre: 'qualité de l\'air SGP30 : …',
    sert: 'Renvoie une mesure de la **qualité de l\'air** faite par le capteur Grove SGP30 : l\'**eCO₂** (en ppm) ou les **COV totaux** (en ppb).',
    valeur: 'nombre',
    util: [
      'Choisissez la grandeur : **eCO₂ (ppm)** ou **COV totaux (ppb)**.',
    ],
    savoir: [
      'Les **COV** sont des composés organiques volatils (solvants, parfums, colles…) ; l\'**eCO₂** est une estimation du CO₂ calculée par le capteur, pas une vraie mesure de CO₂.',
      'Pendant les **15 premières secondes**, le capteur chauffe : il renvoie 400 ppm et 0 ppb.',
      'Le capteur se branche sur un port **I2C**. ' + 'Dans le simulateur, réglez les valeurs avec les curseurs du tableau « Périphériques ».',
    ],
    legende: 'Un visage triste s\'affiche quand les COV dépassent 500 ppb, un visage content sinon.',
  },
  {
    t: 'grove_couleur_init',
    titre: 'initialiser le capteur de couleur',
    sert: 'Prépare le **capteur de couleur** Grove (VEML6040), qui mesure la quantité de rouge, de vert, de bleu et de lumière blanche.',
    util: [
      'Placez ce bloc dans le bloc « au démarrage ».',
    ],
    savoir: [
      'Ce bloc est **facultatif** : le capteur est préparé tout seul à sa première mesure.',
      'Le capteur se branche sur un port **I2C**.',
    ],
    legende: 'Le capteur de couleur est préparé, puis l\'intensité de rouge mesurée s\'affiche chaque seconde.',
  },
  {
    t: 'grove_couleur_lire',
    titre: 'capteur de couleur : canal …',
    sert: 'Renvoie la quantité de **rouge**, de **vert**, de **bleu** ou de lumière **blanche** reçue par le capteur de couleur.',
    valeur: 'nombre',
    util: [
      'Choisissez le canal.',
      'Pour reconnaître une couleur, comparez les canaux entre eux : par exemple, l\'objet est plutôt rouge si le rouge est plus grand que le vert et le bleu.',
    ],
    savoir: [
      'Ce sont des **valeurs brutes** (de 0 à 65535) : elles dépendent beaucoup de l\'éclairage et de la distance de l\'objet.',
      'Placez l\'objet tout près du capteur, toujours à la même distance.',
    ],
    legende: 'Le capteur de couleur est préparé, puis l\'intensité de rouge mesurée s\'affiche chaque seconde.',
  },
  {
    t: 'grove_rtc_regler',
    titre: 'régler l\'horloge au jour … mois … année … à … h … min … s',
    sert: 'Met l\'**horloge temps réel** Grove (DS1307 ou DS3231) à la date et à l\'heure indiquées.',
    util: [
      'Écrivez la date (jour, mois, année) et l\'heure (heures de 0 à 23, minutes, secondes).',
      'Placez ce bloc dans le bloc « au démarrage », téléversez le programme **une fois**, puis **retirez le bloc** et téléversez à nouveau.',
    ],
    savoir: [
      'La **pile** du module garde l\'heure, même carte débranchée : si le bloc reste dans le programme, l\'horloge est remise à la même heure à chaque démarrage.',
      'Le module se branche sur un port **I2C**.',
      'Dans le simulateur, l\'horloge suit l\'heure de l\'ordinateur, décalée de ce que le programme a réglé.',
    ],
    legende: 'L\'horloge est réglée une fois au démarrage, puis l\'heure défile toutes les 5 secondes.',
  },
  {
    t: 'grove_rtc_lire',
    titre: 'horloge : …',
    sert: 'Renvoie un élément de la date ou de l\'heure de l\'horloge temps réel : l\'**heure** (0 à 23), la **minute**, la **seconde**, le **jour**, le **mois** ou l\'**année**.',
    valeur: 'nombre',
    util: [
      'Choisissez l\'élément à lire.',
      'Comparez-le à un nombre dans un bloc « si » pour déclencher une action à une heure précise.',
    ],
    savoir: [
      'Pour réagir à une heure précise (un réveil), testez **l\'heure et la minute** ensemble avec le bloc « et ».',
      'L\'horloge doit d\'abord avoir été réglée avec le bloc « régler l\'horloge au … ».',
    ],
    legende: 'Le buzzer branché sur P0 sonne à 7 h 30.',
  },
  {
    t: 'grove_rtc_texte',
    titre: 'horloge : heure en texte (hh:mm:ss)',
    sert: 'Renvoie l\'**heure** de l\'horloge temps réel sous forme de **texte** « hh:mm:ss », par exemple « 08:05:30 ».',
    valeur: 'texte',
    util: [
      'Affichez le texte sur la matrice de LED (bloc « faire défiler ») ou sur un écran (LCD, OLED…).',
    ],
    savoir: [
      'Les nombres plus petits que 10 sont écrits avec un **0 devant** : 8 h 5 devient « 08:05 ».',
    ],
    legende: 'L\'horloge est réglée une fois au démarrage, puis l\'heure défile toutes les 5 secondes.',
  },
  // ═══════════════ Logique ═══════════════
  {
    t: 'controls_if',
    titre: 'si … faire … sinon …',
    sert: 'Exécute les blocs de « faire » **seulement si** une condition est vraie ; sinon, il peut exécuter d\'autres blocs (« sinon »).',
    util: [
      'Accrochez une condition dans la case « si » : un bloc qui renvoie vrai ou faux (bouton appuyé, comparaison…).',
      'Placez dans « faire » les blocs à exécuter quand la condition est vraie.',
      'Pour ajouter « sinon » ou « sinon si », cliquez sur la **roue dentée** du bloc et faites glisser les éléments voulus.',
    ],
    savoir: [
      'La condition est testée **une seule fois**, au passage du programme : placez le bloc dans le bloc « répéter indéfiniment » pour la surveiller sans arrêt.',
      'Avec plusieurs « sinon si », seule la **première** condition vraie est exécutée.',
    ],
    legende: 'Un visage heureux s\'affiche tant que le bouton A est appuyé, un visage triste sinon.',
    exemple: [LOOP(SI(BOUTON('a'), S(ICONE('HAPPY')), S(ICONE('SAD'))))],
  },
  {
    t: 'logic_ternary',
    titre: 'test … si vrai … si faux …',
    sert: 'Renvoie **une valeur ou une autre** selon une condition : la valeur « si vrai » quand la condition est vraie, la valeur « si faux » sinon.',
    valeur: 'texte',
    util: [
      'Accrochez la condition dans « test », puis une valeur dans « si vrai » et une autre dans « si faux ».',
      'Placez ce bloc là où une valeur est attendue : afficher, ranger dans une variable…',
    ],
    savoir: [
      'Le résultat a le type des valeurs choisies : un nombre, un texte… (ici, un texte).',
      'C\'est une forme courte du bloc « si … sinon », quand il s\'agit seulement de choisir une valeur.',
    ],
    legende: 'Au démarrage, la carte fait défiler « Chaud » si la température dépasse 25 °C, « Frais » sinon.',
    exemple: [START(DEFILE(B('logic_ternary', null, { IF: V(B('logic_compare', { OP: 'GT' }, { A: V(B('capteur_temperature')), B: N(25) })), THEN: T('Chaud'), ELSE: T('Frais') })))],
  },
  {
    t: 'logic_compare',
    titre: '… = …',
    sert: 'Compare deux valeurs et renvoie **vrai** ou **faux** : égal (=), différent (≠), plus petit (<), plus petit ou égal (≤), plus grand (>), plus grand ou égal (≥).',
    valeur: 'logique',
    util: [
      'Accrochez une valeur de chaque côté, puis choisissez la comparaison dans la liste du bloc.',
      'Mettez ce bloc dans un bloc « si » ou « répéter tant que ».',
    ],
    savoir: [
      'Avec une mesure qui change un peu tout le temps (température, lumière), préférez < ou > à = : la valeur exacte peut ne jamais être atteinte.',
      'On peut aussi comparer deux textes : « = » vérifie qu\'ils sont identiques.',
    ],
    legende: 'Un visage triste s\'affiche quand la température de la carte dépasse 25 °C, un visage heureux sinon.',
    exemple: [LOOP(SI(B('logic_compare', { OP: 'GT' }, { A: V(B('capteur_temperature')), B: N(25) }), S(ICONE('SAD')), S(ICONE('HAPPY'))), ATT(1))],
  },
  {
    t: 'logic_operation',
    titre: '… et …',
    sert: 'Combine deux conditions : « **et** » renvoie vrai si les **deux** sont vraies ; « **ou** » renvoie vrai si **au moins une** est vraie.',
    valeur: 'logique',
    util: [
      'Accrochez une condition de chaque côté, puis choisissez **et** ou **ou** dans la liste du bloc.',
    ],
    savoir: [
      'Pour combiner plus de deux conditions, mettez un bloc « et » (ou « ou ») dans un autre.',
    ],
    legende: 'Un cœur s\'affiche seulement quand les boutons A et B sont appuyés ensemble.',
    exemple: [LOOP(SI(B('logic_operation', { OP: 'AND' }, { A: V(BOUTON('a')), B: V(BOUTON('b')) }), S(ICONE('HEART')), S(B('effacer_ecran'))))],
  },
  {
    t: 'logic_negate',
    titre: 'non …',
    sert: '**Inverse** une condition : renvoie vrai quand la condition est fausse, et faux quand elle est vraie.',
    valeur: 'logique',
    util: [
      'Accrochez la condition à inverser.',
    ],
    savoir: [
      '« non bouton A appuyé » est vrai tant qu\'on **n\'appuie pas** sur A.',
    ],
    legende: 'Un visage triste s\'affiche tant que le bouton A n\'est pas appuyé, un visage heureux sinon.',
    exemple: [LOOP(SI(B('logic_negate', null, { BOOL: V(BOUTON('a')) }), S(ICONE('SAD')), S(ICONE('HAPPY'))))],
  },
  {
    t: 'logic_boolean',
    titre: 'vrai / faux',
    sert: 'Renvoie la valeur **vrai** ou la valeur **faux**, choisie dans la liste du bloc.',
    valeur: 'logique',
    util: [
      'Rangez-le dans une variable pour retenir un état : allumé ou éteint, partie en cours ou terminée…',
    ],
    savoir: [
      'Avec le bloc « non », on passe facilement d\'un état à l\'autre : « définir allume à non allume ».',
    ],
    legende: 'Le bouton A allume ou éteint le cœur : la variable « allume » passe de vrai à faux, et inversement.',
    exemple: [START(DEF('allume', V(B('logic_boolean', { BOOL: 'TRUE' })))),
      QUAND('lorsque_bouton', { BOUTON: 'a' }, DEF('allume', V(B('logic_negate', null, { BOOL: V(VAR('allume')) })))),
      LOOP(SI(VAR('allume'), S(ICONE('HEART')), S(B('effacer_ecran'))))],
  },
  {
    t: 'logic_null',
    titre: 'nul',
    sert: 'Renvoie la valeur **nul** : « aucune valeur ».',
    valeur: 'nombre',
    util: [
      'Rangez-le dans une variable pour indiquer qu\'elle ne contient encore rien.',
    ],
    savoir: [
      'Dans le programme Python, nul s\'écrit **None**.',
      'Ce bloc sert rarement : pour un nombre, on préfère souvent commencer à 0.',
    ],
    legende: 'Une variable reçoit la valeur nul au démarrage, puis elle est écrite dans la console (None).',
    exemple: [START(DEF('mesure', V(B('logic_null'))), B('afficher_console', null, { VALEUR: V(VAR('mesure')) }))],
  },

  // ═══════════════ Maths ═══════════════
  {
    t: 'math_number',
    titre: '123 (nombre)',
    sert: 'Renvoie le **nombre** écrit dans le bloc.',
    valeur: 'nombre',
    util: [
      'Cliquez dans le bloc pour écrire le nombre.',
    ],
    savoir: [
      'Un nombre à virgule s\'écrit avec un **point** : 2.5.',
      'Un nombre négatif s\'écrit avec le signe moins : -3.',
    ],
    legende: 'Le nombre 42 défile au démarrage.',
    exemple: [START(DEFILE(B('math_number', { NUM: 42 })))],
  },
  {
    t: 'math_constant',
    titre: 'π',
    sert: 'Renvoie une **constante mathématique** : π (pi), e, φ (nombre d\'or), √2, √½ ou ∞ (l\'infini).',
    valeur: 'nombre',
    util: [
      'Choisissez la constante dans la liste du bloc.',
    ],
    savoir: [
      'π vaut environ 3,14 : il sert à calculer le périmètre ou l\'aire d\'un cercle (périmètre = 2 × π × rayon).',
    ],
    legende: 'Au démarrage, la valeur de π défile sur la matrice de LED.',
    exemple: [START(DEFILE(B('math_constant', { CONSTANT: 'PI' })))],
  },
  {
    t: 'math_arithmetic',
    titre: '… + …',
    sert: 'Renvoie le résultat d\'un **calcul** entre deux nombres : addition (+), soustraction (−), multiplication (×), division (÷) ou puissance (^).',
    valeur: 'nombre',
    util: [
      'Accrochez un nombre de chaque côté, puis choisissez l\'opération dans la liste du bloc.',
      'Pour un calcul plus long, mettez un bloc de calcul dans un autre.',
    ],
    savoir: [
      'La division donne un nombre à **virgule** : 7 ÷ 2 = 3.5.',
      'Une division **par 0** arrête le programme avec une erreur.',
      '« ^ » est la puissance : 2 ^ 3 = 2 × 2 × 2 = 8.',
    ],
    legende: 'Au démarrage, le résultat de 3 + 4 (soit 7) défile.',
    exemple: [START(DEFILE(B('math_arithmetic', { OP: 'ADD' }, { A: N(3), B: N(4) })))],
  },
  {
    t: 'math_modulo',
    titre: 'reste de … ÷ …',
    sert: 'Renvoie le **reste** de la division entière d\'un nombre par un autre : le reste de 17 ÷ 5 est 2 (17 = 3 × 5 + 2).',
    valeur: 'nombre',
    util: [
      'Accrochez le nombre à diviser, puis le diviseur.',
    ],
    savoir: [
      'Un nombre est **pair** quand le reste de sa division par 2 vaut **0**.',
      'Le reste revient régulièrement à 0 : pratique pour faire une action tous les 5 tours, par exemple.',
    ],
    legende: 'Au démarrage, le reste de 17 ÷ 5 (soit 2) défile.',
    exemple: [START(DEFILE(B('math_modulo', null, { DIVIDEND: N(17), DIVISOR: N(5) })))],
  },
  {
    t: 'math_min_max',
    titre: 'min de … et …',
    sert: 'Renvoie le **plus petit** (min) ou le **plus grand** (max) de deux nombres.',
    valeur: 'nombre',
    util: [
      'Choisissez **min** ou **max**, puis accrochez les deux nombres.',
    ],
    savoir: [
      '« max de mesure et 0 » empêche un résultat négatif : il ne descend jamais sous 0.',
    ],
    legende: 'Au démarrage, le plus grand de 3 et 7 (soit 7) s\'affiche.',
  },
  {
    t: 'math_absolue',
    titre: 'valeur absolue de …',
    sert: 'Renvoie la **valeur absolue** d\'un nombre : le nombre sans son signe (−5 devient 5, 5 reste 5).',
    valeur: 'nombre',
    util: [
      'Accrochez le nombre.',
    ],
    savoir: [
      'Pratique pour connaître un **écart** sans se soucier du sens : valeur absolue de (mesure − consigne).',
    ],
    legende: 'Au démarrage, la valeur absolue de −5 (soit 5) s\'affiche.',
  },
  {
    t: 'math_racine',
    titre: 'racine carrée …',
    sert: 'Renvoie la **racine carrée** d\'un nombre : la racine carrée de 16 est 4, car 4 × 4 = 16.',
    valeur: 'nombre',
    util: [
      'Accrochez le nombre.',
    ],
    savoir: [
      'Le résultat est un nombre à virgule (4.0).',
      'La racine carrée d\'un nombre **négatif** arrête le programme avec une erreur.',
    ],
    legende: 'Au démarrage, la racine carrée de 16 (soit 4) s\'affiche.',
  },
  {
    t: 'math_arrondi_custom',
    titre: 'arrondi …',
    sert: 'Renvoie un nombre **arrondi** à l\'entier : au plus proche (arrondi), au-dessus (arrondi supérieur) ou en dessous (arrondi inférieur).',
    valeur: 'nombre',
    util: [
      'Choisissez le type d\'arrondi, puis accrochez le nombre.',
    ],
    savoir: [
      '3.7 donne 4 avec « arrondi », 4 avec « arrondi supérieur » et 3 avec « arrondi inférieur ».',
      'Utile avant d\'afficher une mesure à virgule sur la matrice de LED.',
    ],
    legende: 'Au démarrage, 3,7 arrondi (soit 4) s\'affiche.',
  },
  {
    t: 'math_constrain',
    titre: 'contraindre … entre … et …',
    sert: 'Renvoie un nombre **ramené entre deux limites** : s\'il est trop petit, il devient la limite basse ; trop grand, la limite haute.',
    valeur: 'nombre',
    util: [
      'Accrochez le nombre, puis la limite basse et la limite haute.',
    ],
    savoir: [
      'Pratique pour éviter qu\'une valeur sorte de ce qu\'un module accepte, par exemple un angle de servomoteur entre 0 et 180.',
    ],
    legende: 'Au démarrage, 150 contraint entre 0 et 100 donne 100, qui s\'affiche.',
    exemple: [START(DEFILE(B('math_constrain', null, { VALUE: N(150), LOW: N(0), HIGH: N(100) })))],
  },
  {
    t: 'math_random_int',
    titre: 'entier aléatoire entre … et …',
    sert: 'Renvoie un **nombre entier au hasard** entre les deux limites choisies.',
    valeur: 'nombre',
    util: [
      'Écrivez la plus petite et la plus grande valeur possibles.',
    ],
    savoir: [
      'Les deux limites **peuvent sortir** : entre 1 et 6, le résultat peut être 1, 2, 3, 4, 5 ou 6, comme un dé.',
      'Un nouveau nombre est tiré à **chaque** passage du programme sur ce bloc.',
    ],
    legende: 'Un nombre au hasard entre 1 et 6 s\'affiche, puis un autre 2 secondes plus tard, sans fin.',
    exempleDe: 'afficher_valeur',
  },
  {
    t: 'math_random_bool',
    titre: 'choisir au hasard vrai ou faux',
    sert: 'Renvoie **vrai** ou **faux** au hasard, une chance sur deux, comme un pile ou face.',
    valeur: 'logique',
    util: [
      'Mettez ce bloc dans un bloc « si ».',
    ],
    savoir: [
      'Un nouveau tirage est fait à **chaque** passage du programme sur ce bloc.',
    ],
    legende: 'Chaque appui sur le bouton A tire à pile ou face : visage heureux ou visage triste.',
    exemple: [QUAND('lorsque_bouton', { BOUTON: 'a' }, SI(B('math_random_bool'), S(ICONE('HAPPY')), S(ICONE('SAD'))))],
  },
  {
    t: 'math_map',
    titre: 'projeter … de … et … à … et …',
    sert: 'Transforme une valeur d\'une **plage** de départ vers une autre plage : par exemple une mesure de 0 à 1023 en une valeur de 0 à 4.',
    valeur: 'nombre',
    util: [
      'Accrochez la valeur, puis les deux limites de la plage de départ, puis les deux limites de la plage d\'arrivée.',
    ],
    savoir: [
      'Le résultat est souvent un nombre à **virgule** : arrondissez-le avec le bloc « arrondi » si besoin.',
      'Une valeur **hors** de la plage de départ donne un résultat hors de la plage d\'arrivée : utilisez le bloc « contraindre » pour le limiter.',
    ],
    legende: 'Le niveau de lumière (0 à 255) est transformé en une valeur de 0 à 4, qui s\'affiche chaque seconde.',
  },
  {
    t: 'math_convert',
    titre: 'convertir … des degrés en radians',
    sert: 'Convertit un **angle** de degrés en radians, ou de radians en degrés.',
    valeur: 'nombre',
    util: [
      'Accrochez l\'angle, puis choisissez le sens de la conversion.',
    ],
    savoir: [
      '180° correspondent à π radians (environ 3,14).',
    ],
    legende: 'Au démarrage, 180 degrés convertis en radians (environ 3,14) s\'affichent.',
  },

  // ═══════════════ Texte ═══════════════
  {
    t: 'text',
    titre: '« … »',
    sert: 'Renvoie le **texte** écrit dans le bloc.',
    valeur: 'texte',
    util: [
      'Cliquez dans le bloc pour écrire le texte.',
    ],
    savoir: [
      'Un texte qui contient des chiffres reste un texte : « 12 » ne se calcule pas comme le nombre 12.',
      'La matrice de LED n\'affiche pas les lettres accentuées.',
    ],
    legende: 'Le texte « Bonjour ! » défile une fois au démarrage.',
    exempleDe: 'faire_defiler',
  },
  {
    t: 'text_join',
    titre: 'créer un texte avec …',
    sert: 'Renvoie un **texte** fait de plusieurs morceaux mis bout à bout : du texte, des nombres, des mesures…',
    valeur: 'texte',
    util: [
      'Accrochez les morceaux dans les cases, dans l\'ordre.',
      'Pour ajouter des cases, cliquez sur la **roue dentée** du bloc.',
    ],
    savoir: [
      'Les morceaux sont collés **sans espace** : ajoutez les espaces dans vos textes (« Temp : » avec un espace à la fin).',
    ],
    legende: 'Au démarrage, la carte fait défiler « Temp : » suivi de la température.',
    exemple: [START(DEFILE(Object.assign(B('text_join', null, { ADD0: T('Temp : '), ADD1: V(B('capteur_temperature')) }), { extraState: { itemCount: 2 } })))],
  },

  // ═══════════════ Variables ═══════════════
  {
    t: 'variables_set',
    titre: 'définir … à …',
    sert: '**Range une valeur** dans une variable : un nombre, un texte, une mesure… La variable garde cette valeur jusqu\'au prochain changement.',
    util: [
      'Créez d\'abord la variable avec le bouton « Créer une variable… » de la catégorie « Variables ».',
      'Choisissez la variable dans la liste du bloc, puis accrochez la valeur.',
    ],
    savoir: [
      'Donnez des **noms clairs** à vos variables : « score », « vitesse »… plutôt que « a » ou « b ».',
      'Placez la valeur de départ dans le bloc « au démarrage ».',
    ],
    legende: 'Le compteur part de 0 ; chaque appui sur A lui ajoute 1, et sa valeur s\'affiche.',
    exemple: [START(DEF('compteur', N(0)), AFF(VAR('compteur'))),
      QUAND('lorsque_bouton', { BOUTON: 'a' }, B('math_change', { VAR: { name: 'compteur' } }, { DELTA: N(1) }), AFF(VAR('compteur')))],
  },
  {
    t: 'variables_get',
    titre: '… (variable)',
    sert: 'Renvoie la **valeur rangée** dans la variable.',
    valeur: 'nombre',
    util: [
      'Prenez le bloc de la variable dans la catégorie « Variables », puis placez-le là où la valeur est attendue.',
    ],
    savoir: [
      'Une variable peut contenir un nombre, un texte ou vrai/faux : son type est celui de la dernière valeur rangée.',
      'Une variable lue avant d\'avoir reçu une valeur vaut **nul** (None).',
    ],
    legende: 'Le compteur part de 0 ; chaque appui sur A lui ajoute 1, et sa valeur s\'affiche.',
    exempleDe: 'variables_set',
  },
  {
    t: 'math_change',
    titre: 'incrémenter … de …',
    sert: '**Ajoute** un nombre à la valeur d\'une variable : « incrémenter score de 1 » fait passer score de 4 à 5.',
    util: [
      'Choisissez la variable, puis écrivez le nombre à ajouter.',
    ],
    savoir: [
      'Avec un nombre **négatif**, la variable diminue : « incrémenter vies de -1 ».',
      'La variable doit déjà contenir un nombre : donnez-lui une valeur de départ dans le bloc « au démarrage ».',
    ],
    legende: 'Le compteur part de 0 ; chaque appui sur A lui ajoute 1, et sa valeur s\'affiche.',
    exempleDe: 'variables_set',
  },

  // ═══════════════ Fonctions ═══════════════
  {
    t: 'procedures_defnoreturn',
    titre: 'pour faire quelque chose',
    sert: '**Crée une fonction** : une suite de blocs à laquelle on donne un nom, et que l\'on peut ensuite exécuter d\'un seul bloc, autant de fois que l\'on veut.',
    util: [
      'Cliquez sur « faire quelque chose » pour donner un nom clair à la fonction (« clignoter », « avancer »…).',
      'Placez dans le bloc les blocs que la fonction doit exécuter.',
      'Le bloc qui lance la fonction apparaît alors dans la catégorie « Fonctions ».',
    ],
    savoir: [
      'Le bloc de la fonction se pose **seul** dans l\'espace de travail.',
      'Pour donner des **paramètres** à la fonction, cliquez sur sa roue dentée.',
      'Une fonction évite de recopier plusieurs fois les mêmes blocs : on la corrige à un seul endroit.',
    ],
    legende: 'La fonction « clignoter » fait clignoter le cœur une fois ; elle est lancée trois fois au démarrage.',
    exemple: [B('procedures_defnoreturn', { NAME: 'clignoter' }, { STACK: S(ICONE('HEART'), ATT(0.5), B('effacer_ecran'), ATT(0.5)) }),
      START(APPEL('clignoter'), APPEL('clignoter'), APPEL('clignoter'))],
  },
  {
    t: 'procedures_defreturn',
    titre: 'pour faire quelque chose … retourner …',
    sert: '**Crée une fonction qui renvoie une valeur** : elle fait un calcul et donne le résultat au bloc qui l\'a lancée.',
    util: [
      'Donnez un nom clair à la fonction, puis placez dans le bloc les blocs du calcul.',
      'Accrochez dans « retourner » la valeur à renvoyer.',
      'Pour donner des **paramètres** à la fonction (les valeurs qu\'elle reçoit), cliquez sur sa roue dentée.',
    ],
    savoir: [
      'Le bloc qui lance la fonction est un bloc **rond** : il se place là où une valeur est attendue.',
      'Le bloc « si … retourner » permet de renvoyer une valeur plus tôt.',
    ],
    legende: 'La fonction « limiter » renvoie le nombre reçu, mais jamais plus de 9 : 25 donne 9, qui s\'affiche.',
    exemple: [Object.assign(B('procedures_defreturn', { NAME: 'limiter' }, {
        STACK: { block: Object.assign(B('procedures_ifreturn', null, { CONDITION: V(B('logic_compare', { OP: 'GT' }, { A: V(VAR('x')), B: N(9) })), VALUE: N(9) }), { extraState: '<mutation value="1"></mutation>' }) },
        RETURN: V(VAR('x')) }), { extraState: { params: [{ name: 'x' }] } }),
      START(AFF(Object.assign(B('procedures_callreturn', null, { ARG0: N(25) }), { extraState: { name: 'limiter', params: ['x'] } })))],
  },
  {
    t: 'procedures_callnoreturn',
    titre: 'faire quelque chose',
    sert: '**Lance une fonction** : exécute tous les blocs de la fonction qui porte ce nom.',
    util: [
      'Prenez ce bloc dans la catégorie « Fonctions » : il y apparaît dès qu\'une fonction est créée.',
      'Placez-le à l\'endroit où la fonction doit s\'exécuter.',
    ],
    savoir: [
      'Après la fonction, le programme continue avec le bloc suivant.',
      'Si la fonction a des paramètres, accrochez une valeur dans chaque case du bloc.',
    ],
    legende: 'La fonction « clignoter » fait clignoter le cœur une fois ; elle est lancée trois fois au démarrage.',
    exempleDe: 'procedures_defnoreturn',
  },
  {
    t: 'procedures_callreturn',
    titre: 'faire quelque chose (avec résultat)',
    sert: '**Lance une fonction qui renvoie une valeur**, et renvoie ce résultat.',
    valeur: 'nombre',
    util: [
      'Prenez ce bloc dans la catégorie « Fonctions », puis placez-le là où une valeur est attendue.',
      'Si la fonction a des paramètres, accrochez une valeur dans chaque case du bloc.',
    ],
    savoir: [
      'Le type du résultat dépend de ce que la fonction renvoie : un nombre, un texte…',
    ],
    legende: 'La fonction « limiter » renvoie le nombre reçu, mais jamais plus de 9 : 25 donne 9, qui s\'affiche.',
    exempleDe: 'procedures_defreturn',
  },
  {
    t: 'procedures_ifreturn',
    titre: 'si … retourner …',
    sert: 'Dans une fonction qui renvoie une valeur, **renvoie tout de suite** la valeur indiquée **si** la condition est vraie ; la suite de la fonction n\'est alors pas exécutée.',
    util: [
      'Placez ce bloc **à l\'intérieur** d\'un bloc « pour faire quelque chose … retourner ».',
      'Accrochez la condition, puis la valeur à renvoyer.',
    ],
    savoir: [
      'Ce bloc ne peut être utilisé que dans une fonction.',
    ],
    legende: 'La fonction « limiter » renvoie le nombre reçu, mais jamais plus de 9 : 25 donne 9, qui s\'affiche.',
    exempleDe: 'procedures_defreturn',
  },
  {
    t: 'maqueen_v3_mode_T',
    titre: 'Maqueen Plus v3 : aux intersections en T, avancer …',
    sert: 'Choisit ce que fait le robot V3, pendant le suivi de ligne, quand il arrive à une **intersection en T** (la ligne s\'arrête et part à gauche et à droite) : tourner **à gauche**, tourner **à droite** ou s\'**arrêter**.',
    util: [
      'Placez ce bloc dans le bloc « au démarrage », avant de démarrer le suiveur de ligne.',
    ],
    savoir: [
      'Ce bloc demande un châssis **Maqueen Plus V3** : les châssis V1 et V2 n\'ont pas ce suiveur de ligne intégré.',
      'Au T, aller tout droit est impossible : seuls « à gauche », « à droite » et « stop » sont proposés.',
    ],
    legende: 'Au démarrage, le robot V3 tourne à droite aux intersections en T, puis le suivi de ligne démarre.',
    exemple: [START(B('maqueen_v3_mode_T', { MODE: '2' }), B('maqueen_v3_suiveur', { ACTIF: '1' }))],
  },
];
