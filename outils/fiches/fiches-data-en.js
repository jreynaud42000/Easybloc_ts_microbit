/* ══════════════════════════════════════════════════════════════════════════
   EasyBloc micro:bit — English texts of the help sheets (step 10, Nov. 2026).
   Same keys as fiches-data.js (titre, sert, util, savoir, legende) ; the example programs and the value type come
   from the French sheet. British English and the model's vocabulary (students, analogue, Maths…).
   EXEMPLES_EN: free texts typed in the example programs (text boxes, variable names), French → English.
   ══════════════════════════════════════════════════════════════════════════ */
window.FICHES_EN = {
  afficher_icone: {
    titre: 'show icon …',
    sert: 'Lights up a ready-made little picture on the board\'s **LED matrix**: a heart, a happy face, a sad face or a ghost.',
    util: [
      'Choose the icon in the block\'s list.',
      'Put the block in the ‘on start’ block to show it once, or in the ‘forever’ block with the ‘wait’ block to make an animation.',
    ],
    savoir: [
      'The icon **stays on** until the next thing is shown, or until the ‘clear the screen’ block.',
      'To draw your own picture, LED by LED, use the ‘show image’ block.',
    ],
    legende: 'The heart shows for one second, then clears for one second, forever.',
  },
  grove_led_etat: {
    titre: '[LED] set the LED to … on pin …',
    sert: 'Turns the **Grove LED module** plugged into a pin of the board on or off.',
    util: [
      'Choose **HIGH (1)** to turn the LED on, **LOW (0)** to turn it off.',
      'Choose the pin where the module\'s cable is plugged in (P0, P1, P2…).',
    ],
    savoir: [
      'It is **all or nothing**: to set the brightness, use the ‘[LED] set the brightness to …’ block.',
      'On the Grove Shield, the **P0/P14** port is pin P0, the **P1/P15** port is P1, the **P2/P16** port is P2.',
      'The LED stays in its state until the next block that controls it.',
    ],
    legende: 'The LED plugged into P0 turns on for one second, then off for one second, forever.',
  },
  grove_potentiometre: {
    titre: 'potentiometer on … as …',
    sert: 'Returns the position of the knob of the **Grove potentiometer** (a knob you turn).',
    util: [
      'Choose the module\'s pin: **P0, P1 or P2** (the analogue inputs).',
      'Choose the unit: the **raw value** from 0 to 1023, the **angle** from 0 to 300° (the travel of the knob) or the **percentage** from 0 to 100 %.',
    ],
    savoir: [
      'Only pins **P0, P1 and P2** can read a value between 0 and 1023.',
      'In the simulator, turn the knob drawn in the wiring, or the ‘Potentiometer’ slider in the ‘Peripherals’ table.',
    ],
    legende: 'The angle of the potentiometer plugged into P0 is shown on the LED matrix, then the measurement starts again.',
  },
  grove_pir: {
    titre: 'motion detected on …',
    sert: 'Returns **true** when the **Grove motion detector** (PIR sensor) sees a person or an animal moving in front of it, **false** otherwise.',
    util: [
      'Choose the pin where the detector is plugged in.',
      'Put this block straight into an ‘if’ block.',
    ],
    savoir: [
      'It senses the **heat of a moving body**: a cold object that moves does not trigger it.',
      'After a movement, it stays **true** for a few seconds.',
      'In the simulator, click the white lens of the detector in the wiring, or tick ‘motion detected’ in the ‘Peripherals’ table.',
    ],
    legende: 'The buzzer plugged into P1 beeps when the motion detector plugged into P0 sees something move.',
  },
  // ═══════════════ Loops ═══════════════
  au_demarrage: {
    titre: 'on start',
    sert: 'Runs the blocks inside it **only once**, when the board starts.',
    util: [
      'Put inside what must happen only once: a welcome message, the setting of a module, the starting value of a variable.',
      'Attach the ‘forever’ block just below it for the rest of the program.',
    ],
    savoir: [
      'There is **only one** ‘on start’ block in a program.',
      'Nothing attaches above it: it is always the first block of the program.',
    ],
    legende: 'The word ‘Ready’ scrolls once at start, then a happy face stays on.',
  },
  boucle_infinie: {
    titre: 'forever',
    sert: 'Repeats the blocks inside it **endlessly**. It is the main loop of the program.',
    util: [
      'Attach it below the ‘on start’ block.',
      'Put inside what the board must do all the time: read a sensor, show a value, test a button.',
    ],
    savoir: [
      'The board never leaves this loop: the blocks attached **below** it never run.',
      'Add a ‘wait’ block to slow the loop down, for example to leave time to read a value.',
    ],
    legende: 'The heart shows for one second, then clears for one second, forever.',
  },
  controls_repeat_ext: {
    titre: 'repeat … times',
    sert: 'Repeats the blocks in ‘do’ the chosen **number of times**, then moves on to the rest of the program.',
    util: [
      'Type the number of turns in the box, or put in a block that returns a number (a variable, for example).',
      'Put the blocks to repeat in ‘do’.',
    ],
    savoir: [
      'With **0** in the box, the blocks in ‘do’ do not run.',
      'To know the number of the current turn, use the ‘count with … from … to … by …’ block instead.',
    ],
    legende: 'At start, the heart blinks 3 times, then a happy face stays on.',
  },
  controls_whileUntil: {
    titre: 'repeat while … / repeat until …',
    sert: 'Repeats the blocks in ‘do’ **while a condition is true** (‘while’), or **until it becomes true** (‘until’).',
    util: [
      'Choose ‘while’ or ‘until’ in the block\'s list.',
      'Attach a condition in the box: a block that returns true or false (button pressed, comparison…).',
      'Put the blocks to repeat in ‘do’.',
    ],
    savoir: [
      'The condition is tested **at the start of each turn**: if it is already false (‘while’) or already true (‘until’) at the beginning, the blocks in ‘do’ do not run.',
      'If the condition never changes, the loop never stops and the rest of the program does not run.',
      'In the simulator, a condition that depends on a button or a sensor cannot change while the loop is running: such a loop only works on the real board. In the simulator, test the button with an ‘if’ block placed in the ‘forever’ block instead.',
    ],
    legende: 'At start, the board picks a random number from 1 to 6 and shows it, until it gets a 6; then a happy face stays on.',
  },
  controls_for: {
    titre: 'count with … from … to … by …',
    sert: 'Repeats the blocks in ‘do’ while **counting with a variable**: it takes the start value, then goes up by the chosen step at each turn, up to the end value.',
    util: [
      'Choose the variable in the block\'s list (**i** at first).',
      'Type the start value, the end value and the step (how much the variable changes at each turn).',
      'In ‘do’, use the variable\'s block (‘Variables’ category) to know the number of the turn.',
    ],
    savoir: [
      'The end value **is included**: ‘from 1 to 5 by 1’ makes 5 turns (1, 2, 3, 4, 5).',
      'If the start value is bigger than the end value, the variable goes down: ‘from 5 to 1 by 1’ counts 5, 4, 3, 2, 1.',
    ],
    legende: 'At start, the numbers 1, 2, 3, 4 and 5 show one after the other, then a happy face stays on.',
  },

  // ═══════════════ Time ═══════════════
  attendre_temps: {
    titre: 'wait … second(s)',
    sert: '**Pauses** the program for the chosen time, then moves on to the next block.',
    util: [
      'Type the time in the box, or put in a block that returns a number.',
      'Choose the unit: **seconds** or **milliseconds** (1 second = 1000 milliseconds).',
    ],
    savoir: [
      'During the pause, **nothing else** runs.',
      'In seconds, a decimal number is written with a point: **0.5** waits half a second.',
    ],
    legende: 'The heart shows for one second, then clears for one second, forever.',
  },
  attendre_jusqua: {
    titre: 'wait until …',
    sert: 'Pauses the program **until a condition becomes true**, then moves on to the next block.',
    util: [
      'Attach a condition in the box: a block that returns true or false (button pressed, motion detected, comparison…).',
    ],
    savoir: [
      'The condition is checked every **10 milliseconds**.',
      'In the ‘on start’ block, the program really waits, simulator included. In the ‘forever’ block, the simulator skips the turn while the condition is false and tries again at the next turn.',
    ],
    legende: 'A sad face stays on until you press button A; then a heart shows.',
  },
  repeter_toutes_les: {
    titre: 'repeat every … h … min … s … ms',
    sert: 'Repeats the blocks inside it **endlessly**, with a pause of the chosen time after each pass.',
    util: [
      'Type the time in hours, minutes, seconds and milliseconds: the boxes add up (0 h 1 min 30 s 0 ms = a minute and a half).',
      'Put inside the blocks to repeat, for example a measurement to show.',
    ],
    savoir: [
      'The pause comes **after** the blocks: a turn lasts the time of the blocks, plus the pause.',
      'It is an endless loop: the blocks attached **below** it never run.',
    ],
    legende: 'The board\'s temperature shows, then the measurement starts again 5 seconds later.',
  },
  reset_chrono: {
    titre: 'reset the stopwatch to 0',
    sert: '**Restarts** the program\'s stopwatch **from 0**.',
    util: [
      'Put it where the measurement must start: in the ‘on start’ block, or when a button is pressed.',
      'Then read the elapsed time with the ‘stopwatch value in …’ block.',
    ],
    savoir: [
      'There is **only one** stopwatch in the program: each ‘reset the stopwatch to 0’ block restarts it from 0.',
    ],
    legende: 'The stopwatch starts from 0 at start, then the elapsed time, in seconds, shows every second.',
  },
  valeur_chrono: {
    titre: 'stopwatch value in …',
    sert: 'Returns the **elapsed time** since the last ‘reset the stopwatch to 0’ block.',
    util: [
      'Choose the unit: **(s)** for seconds, **(ms)** for milliseconds.',
      'Put this block in a block that expects a number: show, compare, store in a variable.',
    ],
    savoir: [
      'Without a ‘reset the stopwatch to 0’ block, the time is counted from the start of the board.',
      'In seconds, the result can be a decimal number (for example 2.5).',
    ],
    legende: 'The stopwatch starts from 0 at start, then the elapsed time, in seconds, shows every second.',
  },
  // ═══════════════ LED matrix ═══════════════
  afficher_valeur: {
    titre: 'show …',
    sert: 'Shows a **number** or a **text** on the board\'s **LED matrix**.',
    util: [
      'Attach in the box a number, a text, or a block that returns a value (a measurement, a variable…).',
    ],
    savoir: [
      'A text of several characters shows **one character after the other**, without scrolling; the last one stays on.',
      'To slide a text from right to left, use the ‘scroll’ block.',
      'The value stays on until the next thing is shown, or until the ‘clear the screen’ block.',
    ],
    legende: 'A random number from 1 to 6 shows, then another one 2 seconds later, forever.',
  },
  faire_defiler: {
    titre: 'scroll …',
    sert: '**Slides** a text or a number from right to left on the **LED matrix**.',
    util: [
      'Attach in the box a text, a number, or a block that returns a value.',
    ],
    savoir: [
      'The program **waits for the end of the scrolling** before moving on to the next block: a long text takes several seconds.',
      'At the end of the scrolling, the matrix is off.',
    ],
    legende: 'The text ‘Hello!’ scrolls once at start.',
  },
  afficher_image_matrice: {
    titre: 'show image …',
    sert: 'Lights up on the **LED matrix** a picture that you draw yourself, LED by LED.',
    util: [
      'Each box of the block matches one LED of the matrix: tick the boxes of the LEDs to light up.',
    ],
    savoir: [
      'The grid of the block has the same layout as the matrix: **5 rows of 5 LEDs**.',
      'The ticked LEDs light up at **full brightness**.',
      'The picture stays on until the next thing is shown, or until the ‘clear the screen’ block.',
    ],
    legende: 'A smile drawn box by box shows at start.',
  },
  effacer_ecran: {
    titre: 'clear the screen',
    sert: '**Turns off all the LEDs** of the board\'s matrix.',
    util: [
      'Put it after something shown to make it disappear, for example with the ‘wait’ block to make a picture blink.',
    ],
    savoir: [
      'It only turns off the LED matrix: the modules plugged into the board (LEDs, displays…) do not change.',
    ],
    legende: 'The heart shows for one second, then clears for one second, forever.',
  },
  afficher_console: {
    titre: 'show in the console …',
    sert: 'Writes a number or a text in the **console**, on a new line each time. Handy to follow measurements without using the LED matrix.',
    util: [
      'Attach in the box a text, a number, or a block that returns a value.',
      'Open the console with the ‘Show the console’ button of the toolbar, at the top: it opens at the bottom of the screen.',
    ],
    savoir: [
      'On the real board, the text goes through the **USB cable**: it shows in the console after ‘Connect’ (Chrome or Edge browser).',
      'Nothing shows on the LED matrix.',
    ],
    legende: 'The word ‘Start’ is written once, then the board\'s temperature is written every second in the console.',
  },
  // ═══════════════ Inputs/Outputs ═══════════════
  si_bouton_appuye: {
    titre: 'if button … is pressed then',
    sert: 'Runs the blocks inside it **if the chosen button is held down** when the program reaches this block.',
    util: [
      'Choose the button: **A**, **B**, or **A+B** (both at the same time).',
      'Put this block in the ‘forever’ block to watch the button all the time.',
    ],
    savoir: [
      'The button is only checked **when the program reaches it**: during a ‘wait’ block, a very short press can be missed.',
      'To react to every press, even a short one, use the ‘when button … is pressed’ block instead.',
      'In the simulator, press buttons A and B of the drawn board.',
    ],
    legende: 'Button A shows a happy face, button B clears the screen.',
  },
  si_logo_touche: {
    titre: 'if LOGO is touched then',
    sert: 'Runs the blocks inside it **if the board\'s touch logo** is touched when the program reaches this block.',
    util: [
      'Put this block in the ‘forever’ block to watch the logo all the time.',
    ],
    savoir: [
      'The touch logo is the small gold drawing above the LED matrix: it only exists on the **micro:bit V2** board.',
      'A simple touch of the finger is enough, without pressing.',
      'In the simulator, click the logo of the drawn board.',
    ],
    legende: 'A heart shows when the logo is touched.',
  },
  si_secoue_alors: {
    titre: 'if shaken then',
    sert: 'Runs the blocks inside it **if the board has been shaken** since the program last reached this block.',
    util: [
      'Put this block in the ‘forever’ block.',
    ],
    savoir: [
      'Each shake is counted **only once**: the next time, the block waits for a new shake.',
      'To know whether the board is being shaken **right now**, use the ‘gesture … is active’ block.',
      'In the simulator, click the ‘Shake the board’ button, below the drawn board.',
    ],
    legende: 'At each shake, a ghost shows for one second.',
  },
  bouton_est_appuye: {
    titre: 'button … is pressed',
    sert: 'Returns **true** while the chosen button is held down, **false** otherwise.',
    util: [
      'Choose the button: **A**, **B**, or **A+B** (both at the same time).',
      'Put this block in an ‘if’ or ‘wait until’ block.',
    ],
    savoir: [
      'It returns the state of the button **at the moment** the program reads it: a very short press, during a ‘wait’ block, can be missed.',
      'In the simulator, press buttons A and B of the drawn board.',
    ],
    legende: 'Button A shows a heart, button B clears the screen.',
  },
  logo_est_touche: {
    titre: 'the logo is pressed',
    sert: 'Returns **true** while the board\'s touch logo is touched, **false** otherwise.',
    util: [
      'Put this block in an ‘if’ or ‘wait until’ block.',
    ],
    savoir: [
      'The touch logo only exists on the **micro:bit V2** board.',
      'In the simulator, click the logo of the drawn board.',
    ],
    legende: 'A heart shows while the logo is touched.',
  },
  nombre_clics_bouton: {
    titre: 'number of clicks of button …',
    sert: 'Returns the **total number of clicks** on the chosen button since the board started.',
    util: [
      'Choose the button: **A** or **B**.',
      'Compare the result with a number in an ‘if’ block, or show it.',
    ],
    savoir: [
      'The counter **never goes back to 0** by itself: it counts all the clicks since the start, even spaced out.',
      'A click is counted even if the program was busy elsewhere at that moment.',
    ],
    legende: 'A heart shows when button B has been pressed 10 times in all.',
  },
  reinitialiser_microbit: {
    titre: '[Micro:bit] reset the board',
    sert: '**Restarts the board**: the program starts again from the beginning, as after pressing the reset button, on the back of the board.',
    util: [
      'Put it where the program must start again from scratch, for example when a button is pressed.',
    ],
    savoir: [
      'Nothing can be attached below this block: the board restarts at once.',
      'The variables go back to their starting value and the stopwatch starts again from 0.',
    ],
    legende: 'A heart shows at each start; button A restarts the board.',
  },
  // ═══════════════ Sensors ═══════════════
  lorsque_bouton: {
    titre: 'when button … is pressed',
    sert: 'Runs the blocks inside it **at each press** on the chosen button.',
    util: [
      'Choose the button: **A**, **B**, or **A+B** (both at the same time).',
      'Put this block on its own in the workspace: it does not attach to any other block.',
    ],
    savoir: [
      'A press runs the block **only once**, even if the button stays held down.',
      'A press on **A+B** does not also run the ‘when button A’ and ‘when button B’ blocks.',
      'The button is watched at each turn of the program\'s main loop (added automatically if there is none).',
      'In the simulator, press buttons A and B of the drawn board.',
    ],
    legende: 'Button A shows a happy face, button B clears the screen.',
  },
  lorsque_geste: {
    titre: 'when …',
    sert: 'Runs the blocks inside it when the board makes the chosen **gesture**: shaken, logo up or logo down.',
    util: [
      'Choose the gesture in the block\'s list.',
      'Put this block on its own in the workspace: it does not attach to any other block.',
    ],
    savoir: [
      'Each gesture runs the block **only once** per movement.',
      'In the simulator, only the ‘shake’ gesture exists: click the ‘Shake the board’ button, below the drawn board.',
    ],
    legende: 'When you shake the board, a ghost shows for one second.',
  },
  lorsque_broche: {
    titre: 'when pin … is …',
    sert: 'Runs the blocks inside it when pin **P0, P1 or P2** is touched with a finger (‘on’), or when you let go of it (‘released’).',
    util: [
      'Choose the pin, then ‘on’ or ‘released’.',
      'Put this block on its own in the workspace: it does not attach to any other block.',
    ],
    savoir: [
      '**One finger** on the pin is enough: the touch mode of the V2 board is switched on automatically.',
      'A pin used as a touch key must not be used at the same time by a plugged-in module.',
      'In the simulator, click pin 0, 1 or 2 of the drawn board.',
    ],
    legende: 'A finger on P0 shows a happy face for one second.',
  },
  lorsque_son_detecte: {
    titre: 'when the sound … is detected',
    sert: 'Runs the blocks inside it when the board\'s **microphone** hears a **loud** sound, or when it becomes **quiet** again.',
    util: [
      'Choose ‘loud’ or ‘quiet’.',
      'Put this block on its own in the workspace: it does not attach to any other block.',
    ],
    savoir: [
      'The microphone only exists on the **micro:bit V2** board.',
      'The level between ‘loud’ and ‘quiet’ is set with the ‘set the sound threshold’ block.',
      'The simulator hears no sound: this block only runs on the real board.',
    ],
    legende: 'A loud noise shows a sad face for one second.',
  },
  lorsque_logo: {
    titre: 'on the logo …',
    sert: 'Runs the blocks inside it when the board\'s **touch logo** is touched (‘pressed’), or when you let go of it (‘released’).',
    util: [
      'Choose ‘pressed’ or ‘released’.',
      'Put this block on its own in the workspace: it does not attach to any other block.',
    ],
    savoir: [
      'The touch logo only exists on the **micro:bit V2** board.',
      'In the simulator, click the logo of the drawn board.',
    ],
    legende: 'A heart shows when you touch the logo.',
  },
  capteur_acceleration: {
    titre: 'acceleration (mg) …',
    sert: 'Returns the **acceleration** measured by the board along the **x**, **y** or **z** axis, or the total **strength**.',
    util: [
      'Choose the axis: **x** (left-right), **y** (front-back), **z** (up-down), or **strength** (the three together).',
    ],
    savoir: [
      'The unit is the **milli-g (mg)**: 1000 mg is the Earth\'s gravity. With the board lying flat, the vertical axis therefore measures about 1000 mg.',
      'The measuring range is set with the ‘set the accelerometer range’ block.',
      'In the simulator, the board is always still and flat: try the program on the real board.',
    ],
    legende: 'The acceleration along the x axis shows every second on the LED matrix.',
  },
  broche_est_pressee: {
    titre: 'pin … is pressed',
    sert: 'Returns **true** while pin **P0, P1 or P2** is touched with a finger, **false** otherwise.',
    util: [
      'Choose the pin.',
      'Put this block in an ‘if’ or ‘wait until’ block.',
    ],
    savoir: [
      '**One finger** on the pin is enough: the touch mode of the V2 board is switched on automatically.',
      'In the simulator, click pin 0, 1 or 2 of the drawn board.',
    ],
    legende: 'A happy face shows while pin P0 is touched.',
  },
  capteur_luminosite: {
    titre: 'light level',
    sert: 'Returns the **light level** around the board, from **0** (dark) to **255** (very bright).',
    util: [
      'Show the value, or compare it with a number in an ‘if’ block (for example to turn on an LED when it is dark).',
    ],
    savoir: [
      'The light is measured by the **LED matrix** itself: there is no separate sensor.',
      'In the simulator, this measurement does not change (it is always 128): try the program on the real board.',
    ],
    legende: 'The light level shows every second on the LED matrix.',
  },
  capteur_boussole_direction: {
    titre: 'compass heading (°)',
    sert: 'Returns the **direction** the top of the board points to, in degrees: **0** for north, 90 for east, 180 for south, 270 for west.',
    util: [
      'Hold the board flat for a correct measurement.',
      'Put the ‘calibrate the compass’ block in the ‘on start’ block.',
    ],
    savoir: [
      'If the compass has not been calibrated yet, the board first starts the calibration.',
      'A magnet, a motor or an iron object near the board distorts the direction.',
      'In the simulator, this measurement does not change (it is always 0): try the program on the real board.',
    ],
    legende: 'The compass is calibrated once at start, then the direction shows every second.',
  },
  capteur_temperature: {
    titre: 'temperature (° C)',
    sert: 'Returns the **temperature** measured by the board, in **degrees Celsius**.',
    util: [
      'Show the value, or compare it with a number in an ‘if’ block.',
    ],
    savoir: [
      'It is the temperature of the board\'s **chip**: it is a little higher than the temperature of the air around.',
      'In the simulator, this measurement does not change (it is always 21 °C): try the program on the real board.',
    ],
    legende: 'The board\'s temperature shows every second on the LED matrix.',
  },
  geste_est_actif: {
    titre: 'gesture … is active',
    sert: 'Returns **true** while the board makes the chosen gesture (shaken, logo up, logo down), **false** otherwise.',
    util: [
      'Choose the gesture in the block\'s list.',
      'Put this block in an ‘if’ or ‘wait until’ block.',
    ],
    savoir: [
      'It stays **true during the whole gesture**, unlike the ‘if shaken then’ block, which counts each shake only once.',
      'In the simulator, only the ‘shake’ gesture exists: click the ‘Shake the board’ button, below the drawn board.',
    ],
    legende: 'A sad face shows while the board is being shaken.',
  },
  micro_intensite_son: {
    titre: 'sound level',
    sert: 'Returns the **level of the sound** heard by the board\'s microphone, from **0** (silence) to **255** (very loud).',
    util: [
      'Show the value, or compare it with a number in an ‘if’ block.',
    ],
    savoir: [
      'The microphone only exists on the **micro:bit V2** board.',
      'In the simulator, this measurement does not change (it is always 0): try the program on the real board.',
    ],
    legende: 'The sound level shows every second on the LED matrix.',
  },
  capteur_boussole_calibrer: {
    titre: 'calibrate the compass',
    sert: 'Starts the **setting of the compass**: the board asks you to tilt it in every direction.',
    util: [
      'Put it in the ‘on start’ block.',
      'During the setting, follow the instructions that scroll on the LED matrix: tilt the board in every direction until the setting ends.',
    ],
    savoir: [
      'The program **waits for the end of the setting** before moving on to the next block.',
      'Without this block, the board starts the setting by itself the first time the compass is read.',
    ],
    legende: 'The compass is calibrated once at start, then the direction shows every second.',
  },
  capteur_boussole_force: {
    titre: 'magnetic force (µT) …',
    sert: 'Returns the **magnetic field** measured by the board along the **x**, **y** or **z** axis, or its total **strength**, in **microteslas (µT)**.',
    util: [
      'Choose the axis, or **strength** for the three together.',
      'Bring a magnet near the board: the value changes.',
    ],
    savoir: [
      'In the simulator, this measurement does not change (it is always 0): try the program on the real board.',
    ],
    legende: 'The magnetic field along the x axis shows every second on the LED matrix.',
  },
  capteur_rotation: {
    titre: 'rotation (°) …',
    sert: 'Returns the **tilt** of the board in degrees: **pitch** when you tilt it forwards or backwards, **roll** when you tilt it left or right.',
    util: [
      'Choose **pitch** or **roll**.',
    ],
    savoir: [
      'The tilt is calculated from the accelerometer: it is only correct if the board does not move too fast.',
      'In the simulator, the board is always still and flat: try the program on the real board.',
    ],
    legende: 'The forwards-backwards tilt (pitch) shows every second on the LED matrix.',
  },
  temps_execution: {
    titre: 'running time …',
    sert: 'Returns the **time elapsed since the board started**.',
    util: [
      'Choose the unit: **(ms)** for milliseconds, **(micros)** for microseconds.',
    ],
    savoir: [
      '1 second = 1000 milliseconds = 1,000,000 microseconds.',
      'To measure a duration from a chosen moment, use the stopwatch blocks (‘Time’ category) instead.',
    ],
    legende: 'The time elapsed since start, in milliseconds, shows every second.',
  },
  gamme_accelerometre: {
    titre: 'set the accelerometer range …',
    sert: 'Sets the **measuring range** of the accelerometer: **1g, 2g, 4g or 8g**.',
    util: [
      'Put it in the ‘on start’ block.',
      'Choose a small range to measure small movements, a large range to measure strong shocks.',
    ],
    savoir: [
      'A larger range measures stronger shocks, but with **less precision**.',
    ],
    legende: 'The accelerometer is set to 8g, then the measured strength shows every second.',
  },
  micro_definir_seuil: {
    titre: 'set the sound threshold … to …',
    sert: 'Sets the **sound level** above which a sound is ‘loud’ (or below which it is ‘quiet’) for the ‘when the sound … is detected’ block.',
    util: [
      'Choose ‘loud’ or ‘quiet’, then type the threshold, from **0 to 255** (like the ‘sound level’ block).',
      'Put it in the ‘on start’ block.',
    ],
    savoir: [
      'The higher the ‘loud’ threshold, the more noise is needed to run the block.',
      'The microphone only exists on the **micro:bit V2** board. The simulator hears no sound.',
    ],
    legende: 'With a threshold of 200, only loud enough noises show the sad face.',
  },
  // ═══════════════ Actuators (Audio) ═══════════════
  audio_jouer: {
    titre: '[Audio] play music …',
    sert: 'Plays a **ready-made sound** on the board\'s speaker: a giggle (Giggle), a happy sound (Happy), a hello (Hello), a sad sound (Sad) or a twinkle (Twinkle).',
    util: [
      'Choose the sound in the block\'s list.',
    ],
    savoir: [
      'The speaker only exists on the **micro:bit V2** board.',
      'The program **waits for the end of the sound** before moving on to the next block.',
      'In the simulator, the sound is an imitation played by the computer: it can be a little different from the board\'s sound.',
    ],
    legende: 'Button A plays a giggle, button B stops the sound.',
  },
  audio_arreter: {
    titre: '[Audio] stop music',
    sert: '**Stops** the sound being played.',
    util: [
      'Put it, for example, in a ‘when button … is pressed’ block to cut the sound on demand.',
    ],
    savoir: [
      'If no sound is playing, it does nothing.',
    ],
    legende: 'Button A plays a giggle, button B stops the sound.',
  },
  music_jouer_melodie: {
    titre: '[Music] play melody …',
    sert: 'Plays a **ready-made melody**, note after note, on the board\'s speaker.',
    util: [
      'Choose the melody in the block\'s list.',
    ],
    savoir: [
      'The program **waits for the end of the melody** before moving on to the next block.',
      'The sound also goes out on pin **P0**: a buzzer plugged into P0 plays the same melody.',
      'In the simulator, the melody is played by the computer.',
    ],
    legende: 'Button A plays the ‘Entertainer’ melody.',
  },
  speech_dire: {
    titre: '[Speech] say … speed … pitch …',
    sert: 'Makes the board **speak**: it says the text with a synthetic voice.',
    util: [
      'Type the text to say in the box.',
      'Set the **speed** and the **pitch** of the voice, from **0 to 255**.',
    ],
    savoir: [
      'The voice pronounces words **the English way**.',
      'The **bigger** the ‘speed’ number, the **slower** the voice; the **bigger** the ‘pitch’ number, the **deeper** the voice.',
      'The program **waits for the end of the sentence** before moving on to the next block.',
    ],
    legende: 'The board says ‘Hello’ at start.',
  },
  // ═══════════════ Servos ═══════════════
  servo_angle: {
    titre: 'set the servomotor angle … to … °',
    sert: 'Turns a **servomotor** to the chosen angle, from **0 to 180°**, and holds it there.',
    util: [
      'Choose the pin where the servomotor is plugged in: **P0, P1 or P2**.',
      'Type the angle in the box, or put in a block that returns a number.',
    ],
    savoir: [
      'The program **does not wait** for the servomotor to get there: add a ‘wait’ block to give it time to turn.',
      'The angle is brought back into the range set with the ‘set the servomotor range’ block (0 to 180° at first).',
      'This block is made for a **positional** servomotor; for a continuous rotation servomotor, use the ‘servomotor … continuous rotation runs at … %’ block.',
    ],
    legende: 'The servomotor plugged into P0 goes to 90°, then to 0° one second later.',
  },
  servo_continu: {
    titre: 'servomotor … continuous rotation runs at … %',
    sert: 'Turns a **continuous rotation servomotor** at the chosen speed, from **−100 to 100 %**.',
    util: [
      'Choose the pin where the servomotor is plugged in: **P0, P1 or P2**.',
      'Type the speed: **0** to stop, a **negative** number to turn the other way.',
    ],
    savoir: [
      'The servomotor keeps turning until the next block that controls it.',
      'If the servomotor still turns slowly at 0 %, use the ‘set neutral stop of servomotor’ block or the ‘stop the servomotor’ block.',
    ],
    legende: 'The servomotor plugged into P0 turns at 50 % for two seconds, then stops.',
  },
  servo_arreter: {
    titre: 'stop the servomotor …',
    sert: '**Stops controlling** the servomotor: the board no longer sends it orders.',
    util: [
      'Choose the servomotor\'s pin.',
    ],
    savoir: [
      'A **continuous rotation** servomotor stops.',
      'A **positional** servomotor stays where it is, but no longer holds its position: you can turn it by hand.',
    ],
    legende: 'The servomotor plugged into P0 turns at 50 % for two seconds, then stops.',
  },
  servo_arret_neutre: {
    titre: 'set neutral stop of servomotor … to …',
    sert: 'With **ON**, a speed of **0 %** given to the continuous rotation servomotor **stops it completely**, instead of sending it the ‘middle position’ order.',
    util: [
      'Choose the servomotor\'s pin, then **ON** or **OFF**.',
      'Put this block in the ‘on start’ block.',
    ],
    savoir: [
      'Handy when the continuous rotation servomotor still turns slowly at 0 %.',
      'At first, the neutral stop is **OFF**.',
    ],
    legende: 'The neutral stop is switched on, then a speed of 0 % stops the servomotor plugged into P0.',
  },
  servo_intervalle: {
    titre: 'set the servomotor range … of … to …',
    sert: '**Limits the travel** of the servomotor between a minimum and a maximum angle.',
    util: [
      'Choose the servomotor\'s pin, then type the minimum and the maximum angle.',
      'Put this block in the ‘on start’ block, before turning the servomotor.',
    ],
    savoir: [
      'The minimum is brought back **between 0 and 90°**, the maximum **between 90 and 180°**.',
      'Then, an angle asked outside the range is brought back to the nearest limit: this protects a part that must not go too far.',
      'At first, the range goes from 0 to 180°.',
    ],
    legende: 'The travel of the servomotor plugged into P0 is limited from 30° to 150°, then it goes to 90°.',
  },
  servo_impulsion: {
    titre: 'set the servomotor pulse width … to … µs',
    sert: 'Controls the servomotor directly with the **length of the pulse** it receives, in **microseconds (µs)**.',
    util: [
      'Choose the servomotor\'s pin, then type the length.',
    ],
    savoir: [
      'The length is brought back **between 500 and 2500 µs**: 500 µs is 0°, **1500 µs** is the middle (90°), 2500 µs is 180°.',
      'The board sends a pulse every **20 milliseconds**.',
      'For everyday use, the ‘set the servomotor angle’ block is simpler.',
    ],
    legende: 'A pulse of 1500 µs puts the servomotor plugged into P0 in the middle.',
  },
  // ═══════════════ Extension boards: DFR0548, Motor:bit ═══════════════
  dfr_servo: {
    titre: 'DFR0548: servo … to … °',
    sert: 'Puts the **servomotor** plugged into one of the 8 servo outputs (**S1 to S8**) of the **DFR0548** motor board at the chosen angle.',
    util: [
      'Choose the output where the servomotor is plugged in, from **S1 to S8**.',
      'Type the angle, from **0 to 180°**, or put in a block that returns a number.',
    ],
    savoir: [
      'The DFR0548 board gets its orders through the **I2C bus** (pins P19 and P20): these pins must not be used for anything else.',
      'An angle below 0 or above 180 is brought back to 0 or 180°.',
      'The program **does not wait** for the servomotor to get there: add a ‘wait’ block.',
    ],
    legende: 'The servomotor plugged into S1 goes from 0° to 180°, then back, every second.',
  },
  dfr_moteur: {
    titre: 'DFR0548: motor … direction … speed … (0 to 255)',
    sert: 'Turns the **DC motor** plugged into one of the 4 motor outputs (**M1 to M4**) of the **DFR0548** board.',
    util: [
      'Choose the motor\'s output (M1 to M4) and the direction: **clockwise** or **anticlockwise**.',
      'Type the speed, from **0** (stop) to **255** (top speed).',
    ],
    savoir: [
      'The motor **keeps turning** until another order: remember the ‘DFR0548: stop’ block.',
      'The real direction depends on how the two motor wires are connected: swap them, or choose the other direction, if the motor turns the wrong way.',
      'The DFR0548 board gets its orders through the **I2C bus** (pins P19 and P20).',
    ],
    legende: 'Motor M1 turns clockwise for two seconds at speed 150, then stops.',
  },
  dfr_moteur_arreter: {
    titre: 'DFR0548: stop …',
    sert: '**Stops** a DC motor of the **DFR0548** board, or all four at once.',
    util: [
      'Choose the motor (M1 to M4), or **all motors**.',
    ],
    savoir: [
      'It only acts on the DC motors: the servomotors keep their position.',
    ],
    legende: 'Motor M1 turns clockwise for two seconds at speed 150, then stops.',
  },
  dfr_pas_a_pas: {
    titre: 'DFR0548: stepper motor … on … direction … of … …',
    sert: 'Turns a **stepper motor** plugged into two motor outputs of the **DFR0548** board by a number of **degrees** or **turns**, then stops it.',
    util: [
      'Choose the motor model: **28BYJ-48** or **42BYGH**.',
      'Choose the two outputs it is plugged into (**M1-M2** or **M3-M4**) and the direction.',
      'Type the amount, then choose the unit: **degrees** or **turns**.',
    ],
    savoir: [
      'The program **waits for the end of the movement** before moving on to the next block.',
      'The angle is obtained from a **turning time** (method of the DFRobot library): it can be a little different on the real motor. Check it and adjust the amount.',
      'A stepper motor uses **two motor outputs**: they can no longer be used for a DC motor.',
    ],
    legende: 'The 28BYJ-48 stepper motor plugged into M1-M2 makes one turn clockwise, then half a turn the other way.',
  },
  motorbit_moteur: {
    titre: 'Motor:bit: motor … direction … speed … (0 to 255)',
    sert: 'Turns the **DC motor** plugged into output **M1** or **M2** of the **Motor:bit** board (ELECFREAKS).',
    util: [
      'Choose the motor\'s output (M1 or M2) and the direction: **clockwise** or **anticlockwise**.',
      'Type the speed, from **0** (stop) to **255** (top speed).',
    ],
    savoir: [
      'The motor **keeps turning** until another order: remember the ‘Motor:bit: stop’ block.',
      'The Motor:bit board drives the motors with pins **P1, P2, P8 and P12**: do not plug another module into them.',
      'The real direction depends on how the two motor wires are connected.',
    ],
    legende: 'Motors M1 and M2 each turn for two seconds at speed 150, one after the other.',
  },
  motorbit_moteur_arreter: {
    titre: 'Motor:bit: stop …',
    sert: '**Stops** a motor of the **Motor:bit** board (M1 or M2), or both at once.',
    util: [
      'Choose **motor M1**, **motor M2** or **both motors**.',
    ],
    savoir: [
      'To stop both motors at once, choose **both motors**.',
    ],
    legende: 'Motors M1 and M2 each turn for two seconds at speed 150, one after the other.',
  },
  // ═══════════════ Extension boards: Maqueen Lite ═══════════════
  maqueenlite_moteur: {
    titre: 'Maqueen Lite: motor … to … (-255 to 255)',
    sert: 'Turns the **left** motor, the **right** motor or **both** motors of the **Maqueen Lite** robot at the chosen speed.',
    util: [
      'Choose the motor: left, right or both.',
      'Type the speed, from **−255 to 255**: a **negative** number goes backwards, **0** stops.',
    ],
    savoir: [
      'The motors **keep turning** until another order: remember the ‘Maqueen Lite: stop the motor’ block.',
      'To turn, give different speeds to the two motors (for example 100 on the left and 0 on the right).',
      'The robot gets its motor orders through the **I2C bus** (pins P19 and P20).',
      'In the simulator, the robot moves in the simulation area.',
    ],
    legende: 'Both motors turn at speed 50 for two seconds, then stop.',
  },
  maqueenlite_arreter: {
    titre: 'Maqueen Lite: stop the motor …',
    sert: '**Stops** the left motor, the right motor or both motors of the **Maqueen Lite** robot.',
    util: [
      'Choose the motor: left, right or both.',
    ],
    savoir: [
      'It is the same as the ‘Maqueen Lite: motor’ block with speed **0**.',
    ],
    legende: 'Both motors turn at speed 50 for two seconds, then stop.',
  },
  maqueenlite_distance: {
    titre: 'Maqueen Lite: distance (cm) ultrasonic sensor',
    sert: 'Returns the **distance** between the front of the robot and the nearest obstacle, in **centimetres**, measured by the ultrasonic sensor.',
    util: [
      'Show the value, or compare it with a number in an ‘if’ block (for example to stop before a wall).',
    ],
    savoir: [
      'The sensor uses pins **P1** (trigger) and **P2** (echo), fixed by the robot: they cannot be used for anything else.',
      'It returns **0** when no echo comes back (obstacle too far, or a surface that absorbs sound).',
      'In the simulator, set the distance with the robot\'s distance slider.',
    ],
    legende: 'The distance measured in front of the robot shows every second on the LED matrix.',
  },
  maqueenlite_ligne: {
    titre: 'Maqueen Lite: line sensor … (0 or 1)',
    sert: 'Returns the state of the **left** or **right** line sensor, under the robot: **0** or **1**.',
    util: [
      'Choose the sensor: left or right.',
      'Compare the result with 0 or 1 in an ‘if’ block.',
    ],
    savoir: [
      'The left sensor is read on pin **P13**, the right one on **P14**.',
      'Which value means the black line depends on the sensor: **check it** on your robot by putting the sensor on the line, then next to it.',
    ],
    legende: 'A happy face shows when the left line sensor is at 1.',
  },
  lorsque_maqueenlite_ligne: {
    titre: 'when the line sensor … changes to state …',
    sert: 'Runs the blocks inside it when the **left** or **right** line sensor of the Maqueen Lite **changes state**: it goes to **high (1)** or to **low (0)**.',
    util: [
      'Choose the sensor, then the expected state.',
      'Put this block on its own in the workspace: it does not attach to any other block.',
    ],
    savoir: [
      'The block runs when the state **changes**, not while the state lasts.',
      'The state is checked at each turn of the program\'s main loop.',
    ],
    legende: 'A heart shows when the left line sensor goes to high (1).',
  },
  maqueenlite_del: {
    titre: 'Maqueen Lite: LED … …',
    sert: '**Turns on** or **turns off** the left LED, the right LED or both LEDs at the front of the **Maqueen Lite** robot.',
    util: [
      'Choose the LED (left, right or both), then **on** or **off**.',
    ],
    savoir: [
      'The left LED is driven by pin **P8**, the right one by pin **P12**.',
      'The LED stays in its state until the next block that controls it.',
    ],
    legende: 'Both LEDs turn on for one second, then off for one second, forever.',
  },
  maqueenlite_servo: {
    titre: 'Maqueen Lite: servo … angle … °',
    sert: 'Puts the **servomotor** plugged into socket **S1** or **S2** of the **Maqueen Lite** robot at the chosen angle.',
    util: [
      'Choose the servomotor\'s socket: S1 or S2.',
      'Type the angle, from **0 to 180°**.',
    ],
    savoir: [
      'The program **does not wait** for the servomotor to get there: add a ‘wait’ block.',
      'The robot gets this order through the **I2C bus** (pins P19 and P20).',
    ],
    legende: 'Servomotor S1 goes to 90°, then to 0° one second later.',
  },

  // ═══════════════ Extension boards: LiDAR ═══════════════
  lidar_initialiser: {
    titre: 'LiDAR …: set the size …',
    sert: '**Prepares the LiDAR sensor** (DFRobot SEN0628) and chooses how it measures: a grid of **8×8** points, or the **4×4 avoidance** mode that gives the direction to follow.',
    util: [
      'Put this block **once**, in the ‘on start’ block, before all the other LiDAR blocks.',
      'Choose the sensor\'s address (**0x30** at first) and the mode.',
    ],
    savoir: [
      'The **4x4 avoidance** mode is needed for the blocks of the ‘Obstacle avoidance’ part.',
      'The **8x8 matrix** mode is needed for the ‘distance measured at point x … y …’ block.',
      'The address (0x30 to 0x33) chooses the sensor when several are plugged into the **I2C bus** (pins P19 and P20).',
    ],
    legende: 'The LiDAR is prepared in avoidance mode at start, then the distance of the obstacle in front shows every second.',
  },
  lidar_point: {
    titre: 'LiDAR …: distance measured at point x … y … (mm)',
    sert: 'Returns the **distance**, in **millimetres**, measured by the LiDAR at point **(x, y)** of its 8×8 grid.',
    util: [
      'Choose the sensor\'s address, then type **x** and **y**, from **0 to 7**.',
    ],
    savoir: [
      'This block only works in **8x8 matrix** mode: put the ‘LiDAR …: set the size 8x8 matrix’ block in the ‘on start’ block.',
      'It asks the sensor each time: the ‘get the avoidance data’ block is not needed here.',
    ],
    legende: 'The LiDAR is prepared in 8×8 matrix mode, then the distance measured at point (3, 3) shows every second.',
  },
  lidar_distance_evitement: {
    titre: 'LiDAR: set the avoidance distance to … (mm)',
    sert: 'Sets the **distance**, in **millimetres**, from which the LiDAR considers an object as an **obstacle** to avoid.',
    util: [
      'Put this block in the ‘on start’ block, after the ‘LiDAR …: set the size 4x4 avoidance’ block.',
    ],
    savoir: [
      'On a Maqueen robot, do not go above **200 mm**: beyond that, the beam can hit the floor and distort the detection (manufacturer\'s warning).',
    ],
    legende: 'The LiDAR is prepared in avoidance mode with a distance of 200 mm, then the advised direction shows every second.',
  },
  lidar_acquerir: {
    titre: 'LiDAR: get the avoidance data',
    sert: '**Reads the LiDAR sensor** and keeps its results: direction to follow, emergency signal and distances on the left, in front and on the right.',
    util: [
      'Put this block in the ‘forever’ block, **before** the blocks that read these results.',
    ],
    savoir: [
      'The ‘direction to follow’, ‘emergency signal’ and ‘distance of the obstacle’ blocks read the **last acquisition** again, not the sensor live.',
      'The **4x4 avoidance** mode is needed (‘set the size’ block).',
    ],
    legende: 'The LiDAR is prepared in avoidance mode with a distance of 200 mm, then the advised direction shows every second.',
  },
  lidar_urgence: {
    titre: 'LiDAR: emergency signal on?',
    sert: 'Returns **true** when the LiDAR has detected a **very close** obstacle, less than **100 mm** away, **false** otherwise.',
    util: [
      'Put this block in an ‘if’ block, after the ‘LiDAR: get the avoidance data’ block.',
    ],
    savoir: [
      'The result comes from the **last acquisition**: put the ‘get the avoidance data’ block just before.',
      'In the simulator, set the distances with the sliders of the ‘LiDAR’ panel.',
    ],
    legende: 'After each acquisition, a sad face shows if an obstacle is less than 100 mm away.',
  },
  lidar_direction: {
    titre: 'LiDAR: direction to follow to avoid the obstacle',
    sert: 'Returns the **direction advised** by the LiDAR to avoid the obstacle: **1** for left, **2** for right, **3** for straight on.',
    util: [
      'Compare the result with 1, 2 or 3 in an ‘if’ block to choose the robot\'s movement.',
      'Simpler: the ‘LiDAR: direction to follow is … ?’ block does the comparison for you.',
    ],
    savoir: [
      'The result comes from the **last acquisition**: put the ‘get the avoidance data’ block just before.',
      'In the simulator, set the distances with the sliders of the ‘LiDAR’ panel.',
    ],
    legende: 'The LiDAR is prepared in avoidance mode with a distance of 200 mm, then the advised direction shows every second.',
  },
  lidar_direction_est: {
    titre: 'LiDAR: direction to follow is … ?',
    sert: 'Returns **true** when the direction advised by the LiDAR is the chosen one (**left**, **right** or **straight on**), **false** otherwise.',
    util: [
      'Choose the direction, then put this block in an ‘if’ block.',
    ],
    savoir: [
      'The result comes from the **last acquisition**: put the ‘get the avoidance data’ block just before.',
    ],
    legende: 'After each acquisition, a happy face shows if the direction to follow is ‘left’.',
  },
  lidar_distance_cote: {
    titre: 'LiDAR: distance (in cm) of the obstacle to the …',
    sert: 'Returns the **distance**, in **centimetres**, of the obstacle on the **left**, in **front** or on the **right** of the LiDAR.',
    util: [
      'Choose the side: left, front or right.',
    ],
    savoir: [
      'The result comes from the **last acquisition**: put the ‘get the avoidance data’ block just before.',
      'The sensor measures in millimetres: the result in centimetres can be a decimal number.',
      'In the simulator, set the distances with the sliders of the ‘LiDAR’ panel.',
    ],
    legende: 'The LiDAR is prepared in avoidance mode at start, then the distance of the obstacle in front shows every second.',
  },
  // ═══════════════ Extension boards: Kitrobot v2 ═══════════════
  kitrobot_definir_servos: {
    titre: 'Kitrobot v2: left servo … right servo …',
    sert: 'Tells which pin(s) the left and right servomotors of the robot are plugged into, if they are not the default ones.',
    util: [
      'Put this block in the ‘on start’ block, before the other Kitrobot v2 blocks.',
      'Choose the pin(s).',
    ],
    savoir: [
      'This block is **optional**: without it, the software uses **P1** for the left servo and **P2** for the right servo.',
      'The Kitrobot v2 wiring has no public documentation: the default pins are a choice of the software. **Check the wiring** of your robot.',
    ],
    legende: 'The servos are set on P1 (left) and P2 (right), then the robot moves forward for two seconds.',
  },
  kitrobot_definir_ultrason: {
    titre: 'Kitrobot v2: ultrasonic sensor on …',
    sert: 'Tells which pin(s) the robot\'s ultrasonic sensor is plugged into, if they are not the default ones.',
    util: [
      'Put this block in the ‘on start’ block, before the other Kitrobot v2 blocks.',
      'Choose the pin(s).',
    ],
    savoir: [
      'This block is **optional**: without it, the software uses pin **P0**.',
      'The Kitrobot v2 wiring has no public documentation: the default pins are a choice of the software. **Check the wiring** of your robot.',
    ],
    legende: 'The ultrasonic sensor is set on P8, then the distance shows every second.',
  },
  kitrobot_definir_buzzer: {
    titre: 'Kitrobot v2: buzzer on …',
    sert: 'Tells which pin(s) the robot\'s buzzer is plugged into, if they are not the default ones.',
    util: [
      'Put this block in the ‘on start’ block, before the other Kitrobot v2 blocks.',
      'Choose the pin(s).',
    ],
    savoir: [
      'This block is **optional**: without it, the software uses pin **P8**.',
      'The Kitrobot v2 wiring has no public documentation: the default pins are a choice of the software. **Check the wiring** of your robot.',
    ],
    legende: 'The buzzer is set on P0, then it sounds at 440 Hz for 500 ms.',
  },
  kitrobot_definir_lignes: {
    titre: 'Kitrobot v2: left line sensor … right …',
    sert: 'Tells which pin(s) the left and right line sensors of the robot are plugged into, if they are not the default ones.',
    util: [
      'Put this block in the ‘on start’ block, before the other Kitrobot v2 blocks.',
      'Choose the pin(s).',
    ],
    savoir: [
      'This block is **optional**: without it, the software uses **P13** for the left sensor and **P14** for the right sensor.',
      'The Kitrobot v2 wiring has no public documentation: the default pins are a choice of the software. **Check the wiring** of your robot.',
    ],
    legende: 'The line sensors are set on P1 (left) and P2 (right); a happy face shows when the left sensor sees the line.',
  },
  kitrobot_definir_ruban: {
    titre: 'Kitrobot v2: RGB Strip on … with … LED(s)',
    sert: 'Tells which pin the robot\'s **RGB LED strip** is plugged into, and **how many LEDs** it has.',
    util: [
      'Put this block in the ‘on start’ block, before the Kitrobot v2 LED blocks.',
      'Choose the pin, then type the number of LEDs, from **1 to 64**.',
    ],
    savoir: [
      'This block is **optional**: without it, the software uses pin **P15** and a strip of **8 LEDs**.',
      'The Kitrobot v2 wiring has no public documentation: the default pins are a choice of the software. **Check the wiring** of your robot.',
    ],
    legende: 'The strip of 8 LEDs is set on P0, then the rainbow lights up.',
  },
  kitrobot_distance: {
    titre: 'Kitrobot v2: distance (cm)',
    sert: 'Returns the **distance** between the robot and the nearest obstacle, in **centimetres**, measured by its ultrasonic sensor.',
    util: [
      'Show the value, or compare it with a number in an ‘if’ block (for example to stop before a wall).',
    ],
    savoir: [
      'The sensor is read on pin **P0**, unless the ‘Kitrobot v2: ultrasonic sensor on …’ block gives another one.',
      'In the simulator, set the distance with the robot\'s distance slider.',
    ],
    legende: 'The distance measured in front of the robot shows every second on the LED matrix.',
  },
  kitrobot_ligne: {
    titre: 'Kitrobot v2: line sensor state …',
    sert: 'Returns **true** when the chosen line sensor (left or right) detects the line, **false** otherwise.',
    util: [
      'Choose the sensor: left or right.',
      'Put this block in an ‘if’ block.',
    ],
    savoir: [
      'Some line sensors give the **opposite** (true off the line): **check it** on your robot by putting the sensor on the line, then next to it.',
      'The sensors are read on **P13** (left) and **P14** (right), unless the ‘Kitrobot v2: left line sensor … right …’ block gives other ones.',
    ],
    legende: 'The line sensors are set on P1 (left) and P2 (right); a happy face shows when the left sensor sees the line.',
  },
  kitrobot_avancer: {
    titre: 'Kitrobot v2: … at speed … %',
    sert: 'Makes the robot go **forward** or **backward** in a straight line, at the chosen speed.',
    util: [
      'Choose **forward** or **backward**.',
      'Type the speed, from **0 to 100 %**.',
    ],
    savoir: [
      'The robot **keeps moving** until another order: remember the ‘Kitrobot v2: stop the robot’ block.',
      'The wheels are driven by two **continuous rotation servomotors**. If the robot goes backward instead of forward, swap the wiring on one side.',
      'In the simulator, the robot moves in the simulation area.',
    ],
    legende: 'The robot moves forward at 50 % for two seconds, then stops.',
  },
  kitrobot_pivoter: {
    titre: 'Kitrobot v2: spin … speed … %',
    sert: 'Makes the robot **turn on the spot**, clockwise (↻) or anticlockwise (↺), at the chosen speed.',
    util: [
      'Choose the direction, then type the speed, from **0 to 100 %**.',
    ],
    savoir: [
      'The robot **keeps turning** until another order: add a ‘wait’ block, then the ‘Kitrobot v2: stop the robot’ block.',
      'For a ready-made quarter turn, use the ‘spin left’ and ‘spin right’ blocks.',
    ],
    legende: 'The robot spins on the spot at 50 % for one second, then stops.',
  },
  kitrobot_moteur: {
    titre: 'Kitrobot v2: control the motor … direction … speed … %',
    sert: 'Controls **one motor** of the robot (left or right): its direction of rotation and its speed.',
    util: [
      'Choose the motor, the direction (↻ or ↺), then type the speed, from **0 to 100 %**.',
    ],
    savoir: [
      'The two motors face each other: to go forward, they turn in **opposite** directions. The ‘Kitrobot v2: forward’ block does it for you.',
      'The motor **keeps turning** until another order.',
    ],
    legende: 'The left motor turns at 50 % for two seconds, then stops.',
  },
  kitrobot_arreter_moteur: {
    titre: 'Kitrobot v2: stop the motor …',
    sert: '**Stops** the left or the right motor of the robot.',
    util: [
      'Choose the motor: left or right.',
    ],
    savoir: [
      'To stop both motors at once, use the ‘Kitrobot v2: stop the robot’ block.',
    ],
    legende: 'The left motor turns at 50 % for two seconds, then stops.',
  },
  kitrobot_case_avant: {
    titre: 'Kitrobot v2: move forward one square',
    sert: 'Makes the robot **move forward one square**, then stops it.',
    util: [
      'Chain this block with the other ‘one square’ and ‘spin’ blocks to follow a path on a grid.',
    ],
    savoir: [
      'The robot moves at 50 % for **0.6 second**: the length covered depends on the floor and the load. **Measure it** and adapt your grid.',
      'The program waits for the end of the movement before moving on to the next block.',
    ],
    legende: 'The robot moves forward one square, spins right, moves forward one more square, then moves back one square.',
  },
  kitrobot_case_arriere: {
    titre: 'Kitrobot v2: move back one square',
    sert: 'Makes the robot **move back one square**, then stops it.',
    util: [
      'Chain this block with the other ‘one square’ and ‘spin’ blocks.',
    ],
    savoir: [
      'The robot moves back at 50 % for **0.6 second**: the length covered depends on the floor and the load.',
      'The program waits for the end of the movement before moving on to the next block.',
    ],
    legende: 'The robot moves forward one square, spins right, moves forward one more square, then moves back one square.',
  },
  kitrobot_pivoter_gauche: {
    titre: 'Kitrobot v2: spin left',
    sert: 'Makes the robot turn **on the spot to the left**, by about a quarter turn, then stops it.',
    util: [
      'Chain this block with the ‘move forward one square’ and ‘move back one square’ blocks.',
    ],
    savoir: [
      'The robot spins at 50 % for **0.4 second**: the angle obtained (about 90°) depends on the floor and the load.',
      'The program waits for the end of the movement before moving on to the next block.',
    ],
    legende: 'The robot moves forward one square, spins right, moves forward one more square, then moves back one square.',
  },
  kitrobot_pivoter_droite: {
    titre: 'Kitrobot v2: spin right',
    sert: 'Makes the robot turn **on the spot to the right**, by about a quarter turn, then stops it.',
    util: [
      'Chain this block with the ‘move forward one square’ and ‘move back one square’ blocks.',
    ],
    savoir: [
      'The robot spins at 50 % for **0.4 second**: the angle obtained (about 90°) depends on the floor and the load.',
      'The program waits for the end of the movement before moving on to the next block.',
    ],
    legende: 'The robot moves forward one square, spins right, moves forward one more square, then moves back one square.',
  },
  kitrobot_arreter: {
    titre: 'Kitrobot v2: stop the robot',
    sert: '**Stops both motors** of the robot.',
    util: [
      'Put it after a movement block and a ‘wait’ block.',
    ],
    savoir: [
      'The board stops driving the wheel servomotors: the robot stops.',
    ],
    legende: 'The robot moves forward at 50 % for two seconds, then stops.',
  },
  kitrobot_buzzer: {
    titre: 'Kitrobot v2: buzzer at frequency … Hz for … ms',
    sert: 'Makes the robot\'s **buzzer sound** at the chosen frequency, for the chosen time.',
    util: [
      'Type the frequency in **hertz (Hz)**: the bigger it is, the higher the sound (440 Hz = A).',
      'Type the time in **milliseconds (ms)**: 1000 ms = 1 second.',
    ],
    savoir: [
      'The program **waits for the end of the sound** before moving on to the next block.',
      'A frequency of **0** makes a silent pause of the chosen time.',
      'The buzzer is driven by pin **P8**, unless the ‘Kitrobot v2: buzzer on …’ block gives another one.',
    ],
    legende: 'The buzzer sounds at 440 Hz for 500 ms at start.',
  },
  kitrobot_clignoter: {
    titre: 'Kitrobot v2: flash the robot',
    sert: 'Makes all the LEDs of the robot\'s strip **flash once**, in white.',
    util: [
      'Put this block in a loop with a ‘wait’ block to make the robot flash several times.',
    ],
    savoir: [
      'The flash lasts **0.15 second**, then all the LEDs of the strip turn off.',
    ],
    legende: 'The robot flashes once at start.',
  },
  kitrobot_del_couleur: {
    titre: 'Kitrobot v2: RGB LED … to …',
    sert: 'Lights up **one LED** of the robot\'s strip in the chosen **colour**.',
    util: [
      'Type the number of the LED: the first one is number **0**.',
      'Choose the colour in the block\'s list.',
    ],
    savoir: [
      'With a strip of 8 LEDs, the numbers go from **0 to 7**: a number outside does nothing.',
      'The LED keeps its colour until the next block that changes it.',
    ],
    legende: 'LED number 0 lights up in red.',
  },
  kitrobot_del_rgb: {
    titre: 'Kitrobot v2: RGB LED … to R … V … B …',
    sert: 'Lights up **one LED** of the robot\'s strip in a colour you mix with **red (R)**, **green (V on the block)** and **blue (B)**.',
    util: [
      'Type the number of the LED: the first one is number **0**.',
      'Type the amount of red, green and blue, each from **0 to 255** (0, 0, 0 = off; 255, 255, 255 = white).',
    ],
    savoir: [
      'With a strip of 8 LEDs, the numbers go from **0 to 7**: a number outside does nothing.',
    ],
    legende: 'LED number 0 lights up in green (red 0, green 255, blue 0).',
  },
  kitrobot_arcenciel: {
    titre: 'Kitrobot v2: Rainbow',
    sert: 'Lights up all the LEDs of the robot\'s strip with the **colours of the rainbow**, spread from red to violet.',
    util: [
      'Put this block where you want the rainbow to light up, for example in the ‘on start’ block.',
    ],
    savoir: [
      'The colours stay on until the next block that changes the LEDs.',
    ],
    legende: 'The rainbow lights up at start.',
  },
  // ═══════════════ Extension boards: Maqueen Plus ═══════════════
  maqueen_moteur: {
    titre: 'motor … to … (-255 to 255)',
    sert: 'Turns the **left** motor, the **right** motor or **both** motors of the **Maqueen Plus** robot at the chosen speed.',
    util: [
      'Choose the motor: left, right or both.',
      'Type the speed, from **−255 to 255**: a **negative** number goes backwards, **0** stops.',
    ],
    savoir: [
      'The motors **keep turning** until another order: remember the ‘stop the motor’ block.',
      'To turn, give different speeds to the two motors (for example 100 on the left and 0 on the right).',
      'The robot gets its orders through the **I2C bus** (pins P19 and P20).',
      'In the simulator, the robot moves on the track of the simulation area.',
    ],
    legende: 'Both motors turn at speed 50 for two seconds, then stop.',
  },
  maqueen_arreter: {
    titre: 'stop the motor …',
    sert: '**Stops** the left motor, the right motor or both motors of the **Maqueen Plus** robot.',
    util: [
      'Choose the motor: left, right or both.',
    ],
    savoir: [
      'It is the same as the ‘motor … to …’ block with speed **0**.',
    ],
    legende: 'Both motors turn at speed 50 for two seconds, then stop.',
  },
  maqueen_ligne_etat: {
    titre: 'line sensor … on the line',
    sert: 'Returns **true** when the chosen line sensor, under the robot, detects the line, **false** otherwise.',
    util: [
      'Choose one of the five sensors: **L2** (far left), **L1** (left), **M** (middle), **R1** (right), **R2** (far right).',
      'Put this block in an ‘if’ block to correct the robot\'s path.',
    ],
    savoir: [
      'To follow a line, you usually watch **L1**, **M** and **R1**: if the line goes under L1, the robot turns a little to the left, and so on.',
      'Put the robot on your track to **check** which line colour the sensors detect.',
      'In the simulator, the robot detects the line of the drawn track.',
    ],
    legende: 'A happy face shows when the middle sensor sees the line.',
  },
  maqueen_ligne_valeur: {
    titre: 'raw value of line sensor …',
    sert: 'Returns the **raw value** measured by one of the robot\'s five line sensors: it changes with the colour and the brightness of the surface.',
    util: [
      'Choose the sensor: L2, L1, M, R1 or R2.',
      'Show the value above the line, then next to it, to choose a threshold to compare in an ‘if’ block.',
    ],
    savoir: [
      'To simply know whether the sensor sees the line or not, the ‘line sensor … on the line’ block is simpler.',
    ],
    legende: 'The value of the middle sensor shows every second on the LED matrix.',
  },
  maqueen_phare: {
    titre: 'headlight … …',
    sert: '**Turns on** or **turns off** the left headlight, the right headlight or both headlights at the front of the **Maqueen Plus** robot.',
    util: [
      'Choose the headlight (left, right or both), then **on** or **off**.',
    ],
    savoir: [
      'The headlight stays in its state until the next block that controls it.',
    ],
    legende: 'Both headlights turn on for one second, then off for one second, forever.',
  },
  maqueen_rgb_couleur: {
    titre: 'RGB LEDs … as …',
    sert: 'Lights up one of the **four RGB LEDs** under the robot, or all of them, in the chosen **colour**.',
    util: [
      'Choose the LED: **L1**, **L2**, **R1**, **R2**, or **all**.',
      'Choose the colour in the block\'s list.',
    ],
    savoir: [
      'The RGB LEDs are driven by pin **P15**: it cannot be used for anything else.',
      'The LED keeps its colour until the next block that changes it, or until the ‘turn off the RGB LEDs’ block.',
    ],
    legende: 'All the RGB LEDs light up in red for two seconds, then turn off.',
  },
  maqueen_rgb_eteindre: {
    titre: 'turn off the RGB LEDs',
    sert: '**Turns off the four RGB LEDs** under the **Maqueen Plus** robot.',
    util: [
      'Put it where the LEDs must turn off.',
    ],
    savoir: [
      'It does not turn off the headlights: use the ‘headlight … off’ block for them.',
    ],
    legende: 'All the RGB LEDs light up in red for two seconds, then turn off.',
  },
  maqueen_distance: {
    titre: 'distance (cm) Maqueen ultrasonic sensor',
    sert: 'Returns the **distance** between the front of the robot and the nearest obstacle, in **centimetres**, measured by the Maqueen Plus ultrasonic sensor.',
    util: [
      'Show the value, or compare it with a number in an ‘if’ block (for example to stop before a wall).',
    ],
    savoir: [
      'The sensor uses pins **P13** (trigger) and **P14** (echo), fixed by the robot: they cannot be used for anything else.',
      'It returns **0** when no echo comes back (obstacle too far, or a surface that absorbs sound).',
      'In the simulator, set the distance with the robot\'s distance slider.',
    ],
    legende: 'The distance measured in front of the robot shows every second on the LED matrix.',
  },
  maqueen_v3_vitesse_suivi: {
    titre: 'Maqueen Plus v3: line follower speed …',
    sert: 'Sets the **speed** at which the V3 robot follows the line by itself, from **1** (slow) to **5** (fast).',
    util: [
      'Put this block in the ‘on start’ block, before starting the line follower.',
    ],
    savoir: [
      'This block needs a **Maqueen Plus V3** chassis: V1 and V2 chassis do not have this built-in line follower.',
      'A slow speed follows tight bends better.',
    ],
    legende: 'The follower speed is set to 3, the robot goes straight on at crossroads, then line following starts.',
  },
  maqueen_v3_mode_carrefour: {
    titre: 'Maqueen Plus v3: at crossroads, go …',
    sert: 'Chooses what the V3 robot does, during line following, when it reaches a **crossroads** (+ crossing): go **straight on**, turn **left**, turn **right** or **stop**.',
    util: [
      'Put this block in the ‘on start’ block, before starting the line follower.',
    ],
    savoir: [
      'This block needs a **Maqueen Plus V3** chassis: V1 and V2 chassis do not have this built-in line follower.',
      'The choice stays valid for all the next crossroads, until a new block.',
    ],
    legende: 'The follower speed is set to 3, the robot goes straight on at crossroads, then line following starts.',
  },
  maqueen_v3_mode_gauche: {
    titre: 'Maqueen Plus v3: at left junctions, go …',
    sert: 'Chooses what the V3 robot does, during line following, when a branch goes **to the left**: go **straight on**, turn **left** or **stop**.',
    util: [
      'Put this block in the ‘on start’ block, before starting the line follower.',
    ],
    savoir: [
      'This block needs a **Maqueen Plus V3** chassis: V1 and V2 chassis do not have this built-in line follower.',
    ],
    legende: 'The follower speed is set to 3, the robot goes straight on at crossroads, then line following starts.',
  },
  maqueen_v3_mode_droite: {
    titre: 'Maqueen Plus v3: at right junctions, go …',
    sert: 'Chooses what the V3 robot does, during line following, when a branch goes **to the right**: go **straight on**, turn **right** or **stop**.',
    util: [
      'Put this block in the ‘on start’ block, before starting the line follower.',
    ],
    savoir: [
      'This block needs a **Maqueen Plus V3** chassis: V1 and V2 chassis do not have this built-in line follower.',
    ],
    legende: 'The follower speed is set to 3, the robot goes straight on at crossroads, then line following starts.',
  },
  maqueen_v3_suiveur: {
    titre: 'Maqueen Plus v3: … the line follower',
    sert: '**Starts** or **stops** the built-in line follower of the V3 robot: once started, the robot **follows the line by itself**, with no other block.',
    util: [
      'Choose **start** or **stop**.',
      'First set the speed and the choices at junctions with the other ‘Maqueen Plus v3’ blocks.',
    ],
    savoir: [
      'This block needs a **Maqueen Plus V3** chassis: V1 and V2 chassis do not have this built-in line follower.',
      'During line following, the program goes on: it can for example watch the distance or the junctions.',
    ],
    legende: 'The V3 robot follows the line for ten seconds, then the follower stops.',
  },
  maqueen_v3_intersection_detectee: {
    titre: 'Maqueen Plus v3: junction detected (code)',
    sert: 'Returns the **code** of the last junction detected by the V3 robot during line following: **1** left, **2** right, **3** straight on, **4** stop.',
    util: [
      'Compare the result with a number in an ‘if’ block.',
      'Simpler: the ‘junction detected is … ?’ block does the comparison for you.',
    ],
    savoir: [
      'This block needs a **Maqueen Plus V3** chassis: V1 and V2 chassis do not have this built-in line follower.',
    ],
    legende: 'The code of the detected junction shows every second on the LED matrix.',
  },
  maqueen_v3_intersection_est: {
    titre: 'Maqueen Plus v3: junction detected is … ?',
    sert: 'Returns **true** when the last junction detected by the V3 robot is the chosen type (**straight on**, **left**, **right**, **stop**), **false** otherwise.',
    util: [
      'Choose the junction type, then put this block in an ‘if’ block.',
    ],
    savoir: [
      'This block needs a **Maqueen Plus V3** chassis: V1 and V2 chassis do not have this built-in line follower.',
    ],
    legende: 'A happy face shows when the detected junction is ‘left’.',
  },
  maqueen_v3_luminosite: {
    titre: 'Maqueen Plus v3: light level on the …',
    sert: 'Returns the **light** measured by the **left** or **right** light sensor of the V3 robot.',
    util: [
      'Choose the sensor: left or right.',
      'Compare both sides to make the robot go towards the light, for example.',
    ],
    savoir: [
      'This block needs a **Maqueen Plus V3** chassis.',
      'The value goes up with the light; show it to know the values in your classroom.',
    ],
    legende: 'The light measured on the left shows every second on the LED matrix.',
  },
  maqueen_v3_pid_avancer: {
    titre: 'Maqueen Plus v3: … … cm … wait until finished',
    sert: 'Makes the V3 robot go **forward** or **backward** by a **precise distance**, in centimetres: the wheels measure the path covered themselves.',
    util: [
      'Choose **forward** or **backward**, then type the distance in **centimetres**.',
      'Tick **wait until finished** so that the program waits for the arrival before moving on to the next block.',
    ],
    savoir: [
      'This block needs a **Maqueen Plus V3** chassis (wheels with encoder).',
      'Without ‘wait until finished’, the program goes on while the robot moves: the ‘stop the current PID control’ block can then interrupt it.',
    ],
    legende: 'The V3 robot sets off for 50 cm without waiting for the end; one second later, the movement is interrupted.',
  },
  maqueen_v3_pid_tourner: {
    titre: 'Maqueen Plus v3: turn … … ° … wait until finished',
    sert: 'Makes the V3 robot **turn** on the spot by a **precise angle**, in degrees, to the left or to the right.',
    util: [
      'Choose **left** or **right**, then type the angle in **degrees** (90 = a quarter turn).',
      'Tick **wait until finished** so that the program waits for the end of the turn.',
    ],
    savoir: [
      'This block needs a **Maqueen Plus V3** chassis (wheels with encoder).',
      'The left/right direction has not been checked on a real robot yet: **try it** and swap the choice if needed.',
    ],
    legende: 'The V3 robot turns 90° to the left and waits for the end of the turn.',
  },
  maqueen_v3_vitesse_reelle: {
    titre: 'Maqueen Plus v3: real speed of the wheel … (cm/s)',
    sert: 'Returns the **real speed** of the left or right wheel of the V3 robot, in **centimetres per second**, measured by the wheel encoder.',
    util: [
      'Choose the wheel: left or right.',
    ],
    savoir: [
      'This block needs a **Maqueen Plus V3** chassis (wheels with encoder).',
      'The real speed can differ from the requested speed: slippery floor, slope, load…',
    ],
    legende: 'The speed of the left wheel shows every second on the LED matrix.',
  },
  maqueen_v3_pid_stop: {
    titre: 'Maqueen Plus v3: stop the current PID control',
    sert: '**Interrupts** the precise movement or turn in progress on the V3 robot.',
    util: [
      'Put it after a ‘… cm’ or ‘turn … °’ block without ‘wait until finished’.',
    ],
    savoir: [
      'This block needs a **Maqueen Plus V3** chassis (wheels with encoder).',
    ],
    legende: 'The V3 robot sets off for 50 cm without waiting for the end; one second later, the movement is interrupted.',
  },
  maqueen_v3_del_carrosserie: {
    titre: 'Maqueen Plus v3: body LEDs … as …',
    sert: 'Lights up the **left** LED, the **right** LED or both LEDs of the V3 robot\'s **body** in the chosen colour.',
    util: [
      'Choose the LED, then the colour: red, green, yellow, blue, purple, cyan, white, or **off**.',
    ],
    savoir: [
      'This block needs a **Maqueen Plus V3** chassis.',
      'These LEDs are different from the four RGB LEDs underneath (‘RGB LEDs … as …’ block).',
    ],
    legende: 'Both body LEDs light up in red.',
  },
  maqueen_ir_init: {
    titre: 'Maqueen Plus: connect the infrared receiver to …',
    sert: 'Tells which pin the **infrared receiver** is plugged into: it receives the orders of the remote control.',
    util: [
      'Put this block in the ‘on start’ block.',
      'Choose the receiver\'s pin.',
    ],
    savoir: [
      'Without this block, the receiver is read on pin **P0**.',
      'Decoding follows the **NEC** protocol of common infrared remote controls; it has not been tried with a real receiver yet.',
      'In the simulator, choose a key in the ‘Infrared remote control (simulation)’ panel.',
    ],
    legende: 'The receiver is connected on P8, then the last code received shows every second (−1 if nothing).',
  },
  lorsque_ir_noire: {
    titre: 'when the command … is received from the black remote (NEC)',
    sert: 'Runs the blocks inside it when the chosen key of the DFRobot **black remote control** is pressed.',
    util: [
      'Choose the key, then put this block on its own in the workspace: it does not attach to any other block.',
    ],
    savoir: [
      'The receiver is watched at each turn of the program\'s main loop.',
      'The receiver is read on **P0**, unless the ‘connect the infrared receiver to …’ block gives another pin.',
      'In the simulator, choose the remote control and the key in the ‘Infrared remote control (simulation)’ panel.',
    ],
    legende: 'A heart shows when the Power key is pressed.',
  },
  lorsque_ir_grise: {
    titre: 'when the command … is received from the grey Car mp3 remote (NEC)',
    sert: 'Runs the blocks inside it when the chosen key of the **grey ‘Car mp3’ remote control** is pressed.',
    util: [
      'Choose the key, then put this block on its own in the workspace: it does not attach to any other block.',
    ],
    savoir: [
      'The receiver is watched at each turn of the program\'s main loop.',
      'The receiver is read on **P0**, unless the ‘connect the infrared receiver to …’ block gives another pin.',
      'In the simulator, choose the remote control and the key in the ‘Infrared remote control (simulation)’ panel.',
    ],
    legende: 'A heart shows when the CH key is pressed.',
  },
  maqueen_ir_decoder: {
    titre: 'Maqueen Plus: decode the infrared receiver',
    sert: '**Reads the infrared receiver** and keeps the code of the last key received.',
    util: [
      'Put it in the ‘forever’ block, before the ‘code received by the infrared receiver’ block.',
    ],
    savoir: [
      'This block is **optional** with the ‘when the command …’ blocks: they already read the receiver at each turn of the loop.',
    ],
    legende: 'The receiver is connected on P8, then the last code received shows every second (−1 if nothing).',
  },
  maqueen_ir_dernier_code: {
    titre: 'Maqueen Plus: code received by the infrared receiver',
    sert: 'Returns the **code** of the last key received by the infrared receiver, or **−1** if nothing has been received yet.',
    util: [
      'Put the ‘decode the infrared receiver’ block just before, in the loop.',
      'Show the code to find out the code of each key, then compare it in an ‘if’ block.',
    ],
    savoir: [
      'The code keeps the value of the **last** key received, even when nothing is pressed any more.',
    ],
    legende: 'The receiver is connected on P8, then the last code received shows every second (−1 if nothing).',
  },
  // ═══════════════ Radio ═══════════════
  radio_activer: {
    titre: 'turn on the radio',
    sert: '**Turns on the board\'s radio**: it can then send and receive messages from other micro:bit boards.',
    util: [
      'Put this block in the ‘on start’ block, before all the other radio blocks.',
    ],
    savoir: [
      'Without it, the board sends and receives **no** message.',
      'Boards only hear each other if they have the **same group** and the **same frequency band**.',
      'In the simulator, open the **radio multi-editor** (Radio menu): two simulated boards side by side talk by radio.',
    ],
    legende: 'The radio turns on at start; button A sends ‘Hi’ to the other boards of the same group.',
  },
  radio_groupe: {
    titre: 'radio: set group …',
    sert: 'Chooses the board\'s **radio group**, from **0 to 255**: only the boards of the same group receive its messages.',
    util: [
      'Put this block in the ‘on start’ block, just after the ‘turn on the radio’ block.',
      'Give the same number to all the boards that must talk to each other.',
    ],
    savoir: [
      'In class, give **a different group to each team**: the other teams\' messages will not disturb you.',
      'Without this block, the board is in group **0**.',
    ],
    legende: 'The board joins group 5; button A sends ‘Hi’ to the boards of this group.',
  },
  radio_envoyer_nombre: {
    titre: 'send the number … by radio',
    sert: '**Sends a number** by radio to the other boards of the same group.',
    util: [
      'Type the number, or put in a block that returns a number (a measurement, a variable…).',
    ],
    savoir: [
      'The receiving board uses the ‘when the radio receives a number’ block and the ‘radio: the number received’ block.',
      'These messages are not understood by a board programmed with MakeCode: both boards must be programmed with EasyBloc.',
    ],
    legende: 'Button A sends the number 5 to the other boards of the same group.',
  },
  radio_envoyer_valeur: {
    titre: 'send the value … = … by radio',
    sert: '**Sends a value with its name** by radio, for example ‘temp = 21’: the receiving board knows which measurement it is.',
    util: [
      'Type the name in the first box (a short word, without ‘=’).',
      'Put the value in the second box: a number, a text or a measurement.',
    ],
    savoir: [
      'The message goes out as **name=value**.',
      'The receiving board uses the ‘when the radio receives a named value’ block, then the ‘radio: the name received’ and ‘radio: the value received’ blocks.',
    ],
    legende: 'Button A sends the temperature under the name ‘temp’.',
  },
  radio_envoyer_texte: {
    titre: 'send radio msg …',
    sert: '**Sends a text** by radio to the other boards of the same group.',
    util: [
      'Type the text, or put in a block that returns a value.',
    ],
    savoir: [
      'Keep messages **short**: the micro:bit radio carries small messages.',
      'A text that contains ‘=’ is understood as a named value by the receiving board.',
      'The receiving board uses the ‘when the radio receives text’ block and the ‘radio: the text received’ block.',
    ],
    legende: 'The radio turns on at start; button A sends ‘Hi’ to the other boards of the same group.',
  },
  radio_quand_recu: {
    titre: 'when the radio receives …',
    sert: 'Runs the blocks inside it when the board **receives a message** of the chosen type: a number, a named value or text.',
    util: [
      'Choose the type of message expected.',
      'Put this block on its own in the workspace; inside, read the message with the ‘radio: …’ block.',
    ],
    savoir: [
      'The type is recognised from the form of the message: ‘42’ is a number, ‘temp=21’ a named value, anything else text.',
      'Do not forget the ‘turn on the radio’ block in the ‘on start’ block.',
      'The radio is watched at each turn of the program\'s main loop.',
      'In the simulator, type a message in the ‘Radio: message to receive’ field, then click ‘Simulate receiving’.',
    ],
    legende: 'When a number arrives by radio, it shows on the LED matrix.',
  },
  radio_lecture: {
    titre: 'radio: …',
    sert: 'Returns information about the **last message received**: the number, the name, the value, the text, or the signal strength.',
    util: [
      'Choose the information in the block\'s list.',
      'Put this block **inside** a ‘when the radio receives …’ block.',
    ],
    savoir: [
      '‘the number received’ and ‘the text received’ go with a message sent by ‘send the number’ or ‘send radio msg’; ‘the name received’ and ‘the value received’, with ‘send the value’.',
      '‘the signal strength’ is a **negative** number: the closer it is to 0, the closer the other board is.',
    ],
    legende: 'When a number arrives by radio, it shows on the LED matrix.',
  },
  radio_puissance: {
    titre: 'radio: transmit power …',
    sert: 'Sets the **power** the board sends its messages with, from **0** (shortest range) to **7** (longest range).',
    util: [
      'Put this block in the ‘on start’ block, after the ‘turn on the radio’ block.',
    ],
    savoir: [
      'A low power limits the range: handy so that a board only receives the boards **very close** to it.',
      'Without this block, the power is **6**.',
    ],
    legende: 'The radio transmits at maximum power (7): the range is the largest.',
  },
  radio_canal: {
    titre: 'radio: frequency band …',
    sert: 'Chooses the **frequency band** used by the radio, from **0 to 83**.',
    util: [
      'Put this block in the ‘on start’ block, after the ‘turn on the radio’ block.',
      'Give the same band to all the boards that must talk to each other.',
    ],
    savoir: [
      'Two boards on different bands **do not hear each other**, even with the same group.',
      'Without this block, the band is **7**.',
    ],
    legende: 'The radio uses band 7: the boards that must hear each other use the same band.',
  },
  // ═══════════════ AI ═══════════════
  ia_lorsque_reconnu: {
    titre: 'when the AI … recognises …',
    sert: 'Runs the blocks inside it when the AI **recognises the chosen class**: an object, a gesture or a position with the camera (**vision**), a sound or a word with the microphone (**sound**).',
    util: [
      'Choose **vision** or **sound**.',
      'Choose the class in the list: these are the classes created in the AI window. For a class not created yet, choose ‘✎ other name…’ and type its name.',
      'Put this block on its own in the workspace: it does not attach to any other block.',
    ],
    savoir: [
      'Recognition happens **on the computer** (PC camera or microphone, AI window): the board only receives the result, through the **USB cable**. Keep the board plugged in and EasyBloc open.',
      'The block runs when the AI **switches** to this class; it does not run again while the class stays the same.',
      'Accents and capital letters do not matter: ‘Cat’ and ‘cat’ are the same class.',
    ],
    legende: 'When the camera recognises the ‘Cat’ class, a heart shows; when the microphone recognises ‘Clap’, a ghost.',
  },
  ia_classe_est: {
    titre: 'the AI … recognises …',
    sert: 'Returns **true** while the last class recognised by the AI (camera or microphone) is the chosen one, **false** otherwise.',
    util: [
      'Choose **vision** or **sound**, then the class.',
      'Put this block in an ‘if’ block, in the ‘forever’ block.',
    ],
    savoir: [
      'Recognition happens **on the computer** (PC camera or microphone, AI window): the board only receives the result, through the **USB cable**. Keep the board plugged in and EasyBloc open.',
      'It becomes **false** again when the AI\'s confidence drops below the **confidence threshold** set in the AI window.',
    ],
    legende: 'While the camera recognises ‘Cat’, a heart is shown; otherwise the screen is empty.',
  },
  ia_derniere_classe: {
    titre: 'last class recognised by the AI …',
    sert: 'Returns the **name of the last class** recognised by the AI (camera or microphone), or an empty text if nothing is recognised.',
    util: [
      'Choose **vision** or **sound**.',
      'Show the result, or compare it with a text in an ‘if’ block.',
    ],
    savoir: [
      'The name is written **without accents or capital letters**, with ‘_’ instead of spaces: ‘Black cat’ becomes ‘black_cat’.',
      'A result that has not been confirmed for **1.5 seconds** is forgotten: the text becomes empty again.',
      'Recognition happens **on the computer** (PC camera or microphone, AI window): the board only receives the result, through the **USB cable**. Keep the board plugged in and EasyBloc open.',
    ],
    legende: 'The name of the last class recognised by the camera is written in the console every second.',
  },
  ia_confiance: {
    titre: 'AI confidence … (%)',
    sert: 'Returns how **sure** the AI is about the last class recognised, from **0 to 100 %**.',
    util: [
      'Choose **vision** or **sound**.',
      'Compare the value with a number to act only when the AI is **sure** (for example more than 80 %).',
    ],
    savoir: [
      'The value is updated when it **changes clearly**, not at every image.',
      'It goes back to **0** when nothing is recognised.',
      'Recognition happens **on the computer** (PC camera or microphone, AI window): the board only receives the result, through the **USB cable**. Keep the board plugged in and EasyBloc open.',
    ],
    legende: 'How sure the AI is about the recognised sound is written in the console every second.',
  },
  ia_qr_lorsque_lu: {
    titre: 'when a QR code is read',
    sert: 'Runs the blocks inside it **at each new QR code** (or barcode) read by the computer\'s camera.',
    util: [
      'Put this block on its own in the workspace; inside, read the text with the ‘text of the last QR code read’ block.',
    ],
    savoir: [
      'Reading happens **on the computer**: in the AI window, ‘QR code’ tab, click ‘▶ Read the codes’. The board receives the text through the **USB cable**.',
      'The same code shown continuously does not run the block again: take it away, then show it again.',
    ],
    legende: 'Each new code read scrolls its text on the LED matrix.',
  },
  ia_qr_visible: {
    titre: 'a QR code is visible',
    sert: 'Returns **true** while the computer\'s camera sees a QR code (or a barcode), **false** otherwise.',
    util: [
      'Put this block in an ‘if’ block, in the ‘forever’ block.',
    ],
    savoir: [
      'Reading happens **on the computer**: in the AI window, ‘QR code’ tab, click ‘▶ Read the codes’. The board receives the text through the **USB cable**.',
      'It becomes false again **less than a second** after the code disappears.',
    ],
    legende: 'A happy face shows while a code is visible; otherwise the screen is empty.',
  },
  ia_qr_texte: {
    titre: 'text of the last QR code read',
    sert: 'Returns the **text** contained in the last QR code (or barcode) read, or an empty text if no code has been read.',
    util: [
      'Put this block in the ‘when a QR code is read’ block to react to each code.',
    ],
    savoir: [
      'The text arrives **without accents** (‘Élève’ becomes ‘Eleve’) and cut at **60 characters**.',
      'It stays available after the code disappears, until the next code.',
      'Reading happens **on the computer**: in the AI window, ‘QR code’ tab, click ‘▶ Read the codes’. The board receives the text through the **USB cable**.',
    ],
    legende: 'Each new code read scrolls its text on the LED matrix.',
  },
  // ═══════════════ Grove: LED, bar, strip, buzzer ═══════════════
  grove_led_luminosite: {
    titre: '[LED] set the brightness to … on pin …',
    sert: 'Sets the **brightness** of the Grove LED module plugged into a pin, from **0** (off) to **1023** (maximum).',
    util: [
      'Type the level, or put in a block that returns a number (a potentiometer measurement, for example).',
      'Choose the module\'s pin.',
    ],
    savoir: [
      'A level below 0 or above 1023 is brought back to 0 or 1023.',
      'The LED actually blinks very fast: the eye sees a stronger or weaker light.',
      'To simply turn on or off, the ‘[LED] set the LED to …’ block is enough.',
    ],
    legende: 'The LED plugged into P0 is set to half its brightness (512 out of 1023).',
  },
  grove_barre_niveau: {
    titre: 'LED Bar on … level … (0 to 10)',
    sert: 'Lights up the LEDs of the **Grove LED bar** from the first one up to the chosen **level**, from **0** (all off) to **10** (all on), like a gauge.',
    util: [
      'Choose the **Grove port** the bar is plugged into (P0 / P14, P1 / P15…).',
      'Put a number in the box, or a measurement brought between 0 and 10 (for example the light divided by 100).',
    ],
    savoir: [
      'The bar uses **two pins**: those of the chosen port.',
      'It has 10 LEDs: 8 green, 1 orange and 1 red.',
      'A decimal number is rounded down; above 10, all the LEDs are on.',
    ],
    legende: 'The LED bar (port P0 / P14) shows the light measured on P1: the more light, the more LEDs on.',
  },
  grove_barre_led: {
    titre: 'LED Bar on … LED no. … …',
    sert: 'Turns **one LED** of the Grove LED bar on or off, without touching the others.',
    util: [
      'Choose the bar\'s port, then type the number of the LED, from **1 to 10**.',
      'Choose **on** or **off**.',
    ],
    savoir: [
      'A number outside 1 to 10 does nothing.',
      'The bar uses **two pins**: those of the chosen port.',
    ],
    legende: 'The LEDs of the bar light up one after the other, like a chaser.',
  },
  grove_ruban_definir: {
    titre: 'set the RGB Strip on … with … LED(s)',
    sert: 'Tells which pin the Grove **RGB LED strip** is plugged into, and **how many LEDs** it has.',
    util: [
      'Put this block in the ‘on start’ block, before the other strip blocks.',
      'Choose the pin, then type the number of LEDs, from **1 to 64**.',
    ],
    savoir: [
      'Without the ‘set the RGB Strip on …’ block, the strip is taken on pin **P1** with **16 LEDs**.',
      'Give the **real number** of LEDs: otherwise part of the strip stays off, or an LED number that is too big causes an error.',
    ],
    legende: 'A strip of 16 LEDs is set on P0, its brightness is set to 50 %, then it lights up in red.',
  },
  grove_ruban_couleur: {
    titre: 'colour the whole strip …',
    sert: 'Lights up **all the LEDs** of the RGB strip in the chosen **colour**.',
    util: [
      'Choose the colour in the block\'s list.',
    ],
    savoir: [
      'The colour takes into account the brightness set with the ‘strip brightness to … %’ block.',
      'Without the ‘set the RGB Strip on …’ block, the strip is taken on pin **P1** with **16 LEDs**.',
    ],
    legende: 'The whole strip lights up in red for two seconds, then turns off.',
  },
  grove_ruban_effacer: {
    titre: 'turn off the strip',
    sert: '**Turns off all the LEDs** of the RGB strip.',
    util: [
      'Put it where the strip must turn off.',
    ],
    savoir: [
      'To turn off one LED only, use the ‘turn off LED no. …’ block.',
    ],
    legende: 'The whole strip lights up in red for two seconds, then turns off.',
  },
  grove_ruban_couleur_index: {
    titre: 'colour LED no. … as …',
    sert: 'Lights up **one LED** of the RGB strip in the chosen **colour**, without touching the others.',
    util: [
      'Type the number of the LED, or put in a variable (to make a light move along, for example).',
      'Choose the colour in the block\'s list.',
    ],
    savoir: [
      'The LEDs are numbered **from 0**: with 16 LEDs, from 0 to 15. On the board, a number that is too big **stops the program** with an error; the simulator ignores it.',
    ],
    legende: 'LED number 0 lights up in green and LED number 1 in blue.',
  },
  grove_ruban_effacer_index: {
    titre: 'turn off LED no. …',
    sert: '**Turns off one LED** of the RGB strip, without touching the others.',
    util: [
      'Type the number of the LED to turn off.',
    ],
    savoir: [
      'The LEDs are numbered **from 0**: with 16 LEDs, from 0 to 15. On the board, a number that is too big **stops the program** with an error; the simulator ignores it.',
    ],
    legende: 'The whole strip lights up in red, then LED number 0 turns off two seconds later.',
  },
  grove_ruban_perso: {
    titre: 'colour the whole strip R … V … B …',
    sert: 'Lights up **all the LEDs** of the strip in a colour you mix with **red (R)**, **green (V on the block)** and **blue (B)**.',
    util: [
      'Type the amount of red, green and blue, each from **0 to 255** (0, 0, 0 = off; 255, 255, 255 = white).',
    ],
    savoir: [
      'Mixing colours: red + green = yellow, red + blue = purple, green + blue = cyan.',
      'The colour takes into account the brightness set with the ‘strip brightness to … %’ block.',
    ],
    legende: 'Red 255, green 128, blue 0: the strip lights up in orange.',
  },
  grove_ruban_perso_index: {
    titre: 'colour LED no. … R … V … B …',
    sert: 'Lights up **one LED** of the strip in a colour you mix with **red (R)**, **green (V on the block)** and **blue (B)**.',
    util: [
      'Type the number of the LED, then the amount of red, green and blue, each from **0 to 255**.',
    ],
    savoir: [
      'The LEDs are numbered **from 0**: with 16 LEDs, from 0 to 15. On the board, a number that is too big **stops the program** with an error; the simulator ignores it.',
    ],
    legende: 'LED number 0 takes a purple colour (red 255, green 0, blue 128).',
  },
  grove_ruban_luminosite: {
    titre: 'strip brightness to … %',
    sert: 'Sets the **brightness** of the RGB strip\'s colours, from **0 %** (off) to **100 %** (maximum).',
    util: [
      'Put this block **before** the blocks that colour the strip.',
    ],
    savoir: [
      'The brightness applies to the colours sent **afterwards**: the LEDs already lit do not change until they are coloured again.',
      'A lower brightness is easier on the eyes and uses less energy.',
    ],
    legende: 'A strip of 16 LEDs is set on P0, its brightness is set to 50 %, then it lights up in red.',
  },
  grove_buzzer_etat: {
    titre: 'buzzer on … …',
    sert: 'Makes the Grove buzzer **sound** (**on**) or **stop** (**off**).',
    util: [
      'Choose the buzzer\'s pin, then **on** or **off**.',
    ],
    savoir: [
      'When on, the buzzer **keeps sounding** until the ‘buzzer on … off’ block.',
      'The Grove buzzer always makes the **same sound**: to play notes, you need a speaker (blocks of the ‘Actuators (Audio)’ category).',
    ],
    legende: 'The buzzer plugged into P0 sounds for one second, is quiet for one second, and so on.',
  },
  grove_buzzer_bip: {
    titre: 'beep the buzzer on … for … ms',
    sert: 'Makes the Grove buzzer **sound** for the chosen **time**, then stops it.',
    util: [
      'Choose the buzzer\'s pin, then type the time in **milliseconds** (1000 ms = 1 second).',
    ],
    savoir: [
      'The program **waits for the end of the beep** before moving on to the next block.',
    ],
    legende: 'The buzzer plugged into P1 beeps when the motion detector plugged into P0 sees movement.',
  },
  // ═══════════════ Grove: motors and relay ═══════════════
  grove_relais: {
    titre: 'relay on … …',
    sert: 'Controls the **Grove relay**: a switch driven by the board, which turns **another circuit** on or off (lamp, motor, pump…).',
    util: [
      'Choose the relay\'s pin.',
      'Choose **closed (on)** to make the device work, **open (off)** to stop it.',
    ],
    savoir: [
      'The relay stays in its state until the next block that controls it.',
      'The controlled device has **its own power supply**, separate from the board: the relay only closes or opens its circuit. Never connect mains power without the help of a qualified adult.',
      'In the simulator, the drawn contact closes or opens.',
    ],
    legende: 'The relay plugged into P0 turns the lamp on for two seconds, then off for two seconds, forever.',
  },
  grove_moteur_vitesse: {
    titre: 'motor channel … speed …',
    sert: 'Turns the motor plugged into channel **1** or **2** of the **Grove motor driver**, at the chosen speed.',
    util: [
      'Choose the motor\'s channel.',
      'Type the speed, from **−63 to 63**: a **negative** number turns the other way, **0** stops.',
    ],
    savoir: [
      'The Grove motor driver (DRV8830) plugs into an **I2C** port and drives **two motors**, on channels 1 and 2.',
      'The motor **keeps turning** until another order: remember the ‘stop motor channel …’ block.',
      'A speed outside −63 to 63 is brought back to the nearest limit.',
    ],
    legende: 'The channel 1 motor turns at speed 50 for two seconds, then stops.',
  },
  grove_moteur_action: {
    titre: '… motor channel …',
    sert: '**Stops** or **brakes** the motor on the chosen channel of the Grove motor driver, or **clears its fault** after an overload.',
    util: [
      'Choose the action, then the channel (1 or 2).',
    ],
    savoir: [
      '**Stop** lets the motor slow down by itself; **brake** stops it faster.',
      'After an overload (a blocked motor, for example), the driver protects itself: **clear the fault** to be able to start the motor again. The ‘motor channel … speed …’ block also does it every time.',
      'The Grove motor driver (DRV8830) plugs into an **I2C** port and drives **two motors**, on channels 1 and 2.',
    ],
    legende: 'The channel 1 motor turns at speed 50 for two seconds, then stops.',
  },
  grove_moteur_defaut: {
    titre: 'fault of motor channel …',
    sert: 'Returns the **fault code** of the chosen channel of the Grove motor driver: **0** if all is well.',
    util: [
      'Compare the result with 0 in an ‘if’ block to detect a problem (blocked motor, overload…).',
    ],
    savoir: [
      'A number other than 0 means a fault: then use the ‘clear the fault of motor channel …’ block.',
      'The Grove motor driver (DRV8830) plugs into an **I2C** port and drives **two motors**, on channels 1 and 2.',
    ],
    legende: 'The fault code of channel 1 shows every second on the LED matrix.',
  },
  grove_pca_init: {
    titre: 'set up the 16-servo driver at address …',
    sert: 'Prepares the **16-servo driver** (PCA9685), which drives up to 16 servomotors.',
    util: [
      'Put this block in the ‘on start’ block.',
      'Choose the address: **0x7F** for the Grove module, **0x40** for most other PCA9685 boards.',
    ],
    savoir: [
      'With the Grove module (address 0x7F), this block is **optional**; with address 0x40, it is **required**.',
      'The 16-servo driver (PCA9685) plugs into an **I2C** port; the servomotors plug into its **channels 0 to 15**.',
    ],
    legende: 'The servomotor plugged into channel 0 of the 16-servo driver goes from 0 to 180°, then back, forever.',
  },
  grove_pca_angle: {
    titre: '16-servo driver: servo no. … to … °',
    sert: 'Puts the **servomotor** plugged into a channel of the 16-servo driver at the chosen angle.',
    util: [
      'Type the channel number, from **0 to 15**, then the angle, from **0 to 180°**.',
    ],
    savoir: [
      'A channel number or an angle outside the limits is brought back to the nearest limit.',
      'The program **does not wait** for the servomotor to get there: add a ‘wait’ block.',
      'In the simulator, the servomotor appears in the wiring as S0 to S15.',
    ],
    legende: 'The servomotor plugged into channel 0 of the 16-servo driver goes from 0 to 180°, then back, forever.',
  },
  grove_pca_continu: {
    titre: '16-servo driver: continuous servo no. … to … %',
    sert: 'Turns the **continuous rotation servomotor** plugged into a channel of the 16-servo driver, at the chosen speed.',
    util: [
      'Type the channel number, from **0 to 15**, then the speed, from **−100 to 100 %**: a negative number turns the other way, **0** stops.',
    ],
    savoir: [
      'If the servomotor still turns slowly at 0 %, it needs adjusting: try a small value (1 or −1, for example).',
      'The servomotor keeps turning until the next block that controls it.',
    ],
    legende: 'The continuous servomotor on channel 1 turns one way for two seconds, then the other way for two seconds.',
  },
  // ═══════════════ Grove: displays ═══════════════
  grove_4d_definir: {
    titre: 'set the 4-digit display: CLK … DIO …',
    sert: 'Tells which pins the Grove **4-digit display** is plugged into: **CLK** (clock) and **DIO** (data).',
    util: [
      'Put this block in the ‘on start’ block, before the other display blocks.',
      'Choose the two pins: those of the Grove port the display is plugged into.',
    ],
    savoir: [
      'This block is **optional**: without it, the display is taken with **CLK on P0** and **DIO on P1**.',
    ],
    legende: 'The display is set (CLK on P0, DIO on P1), its brightness is set to 3, then 1234 shows.',
  },
  grove_4d_nombre: {
    titre: 'show the number …',
    sert: 'Shows a **whole number** on the 4-digit display.',
    util: [
      'Type the number, or put in a block that returns a number (a measurement, a counter…).',
    ],
    savoir: [
      'The **4 digits** are always written: 42 shows as **0042**.',
      'A decimal number loses its decimal part (23.7 shows as 0023); above 9999, only the last 4 digits stay.',
      'A negative number shows a ‘-’ sign instead of the first digit.',
    ],
    legende: 'The number 1234 shows on the 4-digit display.',
  },
  grove_4d_chiffre: {
    titre: 'show the digit … at position …',
    sert: 'Shows **one digit** at the chosen position of the 4-digit display, without touching the others.',
    util: [
      'Type the digit, from **0 to 9**, then the position, from **0 to 3** (from left to right).',
    ],
    savoir: [
      'A value outside 0 to 9 **turns off** this position.',
      'A position outside 0 to 3 is brought back to 0 or 3.',
    ],
    legende: 'The digit 7 shows at position 2 (positions go from 0 to 3).',
  },
  grove_4d_points: {
    titre: '… the colon',
    sert: '**Turns on** or **turns off** the colon in the middle of the 4-digit display, for example to write a time (12:34).',
    util: [
      'Choose **turn on** or **turn off**.',
    ],
    savoir: [
      'The colon keeps its state when another number is shown.',
    ],
    legende: 'The number 1234 shows with the colon on: 12:34.',
  },
  grove_4d_luminosite: {
    titre: 'display brightness to …',
    sert: 'Sets the **brightness** of the 4-digit display, from **0** (weakest) to **7** (strongest).',
    util: [
      'Put this block in the ‘on start’ block, or change the brightness depending on the light in the room.',
    ],
    savoir: [
      'With 0, the display stays on, but very dimly: to turn it off, use the ‘clear the display’ block.',
      'A value outside 0 to 7 is brought back to 0 or 7.',
    ],
    legende: 'The display is set (CLK on P0, DIO on P1), its brightness is set to 3, then 1234 shows.',
  },
  grove_4d_effacer: {
    titre: 'clear the display',
    sert: '**Turns off all the digits** of the 4-digit display.',
    util: [
      'Put it where the display must turn off.',
    ],
    savoir: [
      'Without the ‘set the 4-digit display’ block, the display is taken with **CLK on P0** and **DIO on P1**.',
    ],
    legende: 'The number 1234 stays on for two seconds, then disappears.',
  },
  grove_lcd_init: {
    titre: 'set up the 16x2 LCD screen',
    sert: 'Prepares the **Grove 16x2 LCD screen**: 2 lines of 16 characters.',
    util: [
      'Put this block in the ‘on start’ block, before the other screen blocks.',
    ],
    savoir: [
      'This block is **optional**: The screen plugs into an **I2C** port; it is prepared by itself the first time it is used.',
      'The backlight of this screen is **always on**; it cannot be controlled.',
    ],
    legende: 'The LCD screen is prepared, then ‘Hello’ is written on the first line and ‘micro:bit’ on the second.',
  },
  grove_lcd_texte: {
    titre: 'LCD: show … at x … y …',
    sert: 'Writes a **text** or a **number** on the 16x2 LCD screen, from the chosen position.',
    util: [
      'Type the text, or put in a block that returns a value.',
      'Choose the position: **x** from **0 to 15** (column), **y** **0** (top line) or **1** (bottom line).',
    ],
    savoir: [
      'What goes past the end of the line is **cut off**.',
      'The new text is written **over** the old one without clearing it: a shorter text leaves the end of the old one. Clear first, or pad with spaces.',
      'Avoid **accented letters**: the screen does not know them and shows another sign instead.',
    ],
    legende: '‘Hello’ shows at the top left for two seconds, then the screen clears.',
  },
  grove_lcd_effacer: {
    titre: 'LCD: clear',
    sert: '**Clears all the text** of the 16x2 LCD screen.',
    util: [
      'Put it before writing a new text, so as not to keep leftovers of the old one.',
    ],
    savoir: [
      'The backlight stays on.',
    ],
    legende: '‘Hello’ shows at the top left for two seconds, then the screen clears.',
  },
  grove_lcd_alimenter: {
    titre: 'LCD: … the display',
    sert: '**Hides** or **shows again** the characters of the 16x2 LCD screen, without clearing them.',
    util: [
      'Choose **turn off** to hide the text, **turn on** to show it again.',
    ],
    savoir: [
      'The text is **kept**: it comes back as it was with ‘turn on’.',
      'The backlight of this screen stays on: it cannot be controlled.',
    ],
    legende: '‘Hello’ is written at start, then the text blinks: one second visible, one second hidden.',
  },
  grove_lcdrgb_init: {
    titre: 'set up the RGB LCD screen (V4.0)',
    sert: 'Prepares the **Grove RGB LCD screen** (version 4.0): 2 lines of 16 characters, with a lit background whose colour you choose.',
    util: [
      'Put this block in the ‘on start’ block, before the other screen blocks.',
    ],
    savoir: [
      'This block is **optional**: The screen plugs into an **I2C** port; it is prepared by itself the first time it is used. The background then lights up in **white**.',
      'According to this module\'s documentation, it needs a **5 V** power supply.',
    ],
    legende: 'The RGB LCD screen is prepared, then ‘Hello’ is written on the first line.',
  },
  grove_lcdrgb_texte: {
    titre: 'RGB LCD: show … at x … y …',
    sert: 'Writes a **text** or a **number** on the RGB LCD screen, from the chosen position.',
    util: [
      'Type the text, or put in a block that returns a value.',
      'Choose the position: **x** from **0 to 15** (column), **y** **0** (top line) or **1** (bottom line).',
    ],
    savoir: [
      'What goes past the end of the line is **cut off**.',
      'The new text is written **over** the old one without clearing it: clear first, or pad with spaces.',
      'Avoid **accented letters**: the screen does not know them and shows another sign instead.',
    ],
    legende: 'The background turns blue, ‘Hello’ shows, then the backlight turns off two seconds later.',
  },
  grove_lcdrgb_effacer: {
    titre: 'RGB LCD: clear',
    sert: '**Clears all the text** of the RGB LCD screen.',
    util: [
      'Put it before writing a new text, so as not to keep leftovers of the old one.',
    ],
    savoir: [
      'The background colour does not change.',
    ],
    legende: '‘Hello’ shows for two seconds, then the screen clears.',
  },
  grove_lcdrgb_alimenter: {
    titre: 'RGB LCD: … the display',
    sert: '**Hides** or **shows again** the characters of the RGB LCD screen, without clearing them.',
    util: [
      'Choose **turn off** to hide the text, **turn on** to show it again.',
    ],
    savoir: [
      'The text is **kept**: it comes back as it was with ‘turn on’.',
      'The lit background is controlled separately, with the ‘RGB LCD: … the backlight’ block.',
    ],
    legende: '‘Hello’ is written at start, then the text blinks: one second visible, one second hidden.',
  },
  grove_lcdrgb_fond_couleur: {
    titre: 'RGB LCD: backlight …',
    sert: 'Chooses the **colour of the lit background** of the RGB LCD screen from a list.',
    util: [
      'Choose the colour in the block\'s list.',
    ],
    savoir: [
      'The colour **black** turns the background off.',
      'To mix your own colour, use the ‘RGB LCD: backlight red … green … blue …’ block.',
    ],
    legende: 'The background turns blue, ‘Hello’ shows, then the backlight turns off two seconds later.',
  },
  grove_lcdrgb_fond_rvb: {
    titre: 'RGB LCD: backlight red … green … blue …',
    sert: 'Sets the **background colour** of the RGB LCD screen by mixing **red**, **green** and **blue**.',
    util: [
      'Type the amount of each colour, from **0 to 255** (0, 0, 0 = background off; 255, 255, 255 = white).',
    ],
    savoir: [
      'A value outside 0 to 255 is brought back to 0 or 255.',
      'If the backlight is off, the colour is kept and appears at the next ‘turn on the backlight’.',
    ],
    legende: 'The background takes an orange colour (red 255, green 128, blue 0), then ‘Orange’ shows.',
  },
  grove_lcdrgb_retro: {
    titre: 'RGB LCD: … the backlight',
    sert: '**Turns off** or **turns on again** the lit background of the RGB LCD screen.',
    util: [
      'Choose **turn off** or **turn on**.',
    ],
    savoir: [
      '‘Turn on’ brings back the **last colour** chosen.',
      'The text stays written, but it is hard to read without a lit background.',
    ],
    legende: 'The background turns blue, ‘Hello’ shows, then the backlight turns off two seconds later.',
  },
  grove_oled_init: {
    titre: 'set up the OLED screen 0.96"',
    sert: 'Prepares the small 0.96-inch **Grove OLED screen**: 8 lines of 21 characters.',
    util: [
      'Put this block in the ‘on start’ block, before the other screen blocks.',
    ],
    savoir: [
      'This block is **optional**: The screen plugs into an **I2C** port; it is prepared by itself the first time it is used.',
    ],
    legende: 'The OLED screen shows two lines, waits two seconds, then clears.',
  },
  grove_oled_texte: {
    titre: 'OLED: show … at column … line …',
    sert: 'Writes a **text** or a **number** on the OLED screen, from the chosen position.',
    util: [
      'Type the text, or put in a block that returns a value.',
      'Choose the **column**, from **0 to 20**, and the **line**, from **0 to 7** (0 = top).',
    ],
    savoir: [
      'What goes past the end of the line is **cut off**.',
      'Accented letters are replaced by the plain letter (é becomes e); other unknown signs become ‘?’.',
      'The new text is written over the old one: clear first, or pad with spaces.',
    ],
    legende: 'The OLED screen shows two lines, waits two seconds, then clears.',
  },
  grove_oled_effacer: {
    titre: 'OLED: clear the screen',
    sert: '**Clears** the whole OLED screen.',
    util: [
      'Put it before writing a new text, so as not to keep leftovers of the old one.',
    ],
    savoir: [
      'Clearing takes a short moment: avoid repeating it at each turn of a fast loop.',
    ],
    legende: 'The OLED screen shows two lines, waits two seconds, then clears.',
  },
  // ═══════════════ Grove: simple sensors ═══════════════
  grove_ultrason_cm: {
    titre: 'distance (cm) on …',
    sert: 'Returns the **distance** between the Grove ultrasonic sensor and the nearest obstacle, in **centimetres**.',
    util: [
      'Choose the sensor\'s pin.',
      'Show the value, or compare it with a number in an ‘if’ block (for example to react when something comes closer).',
    ],
    savoir: [
      'The Grove ultrasonic sensor uses **only one pin**: the one chosen in the block.',
      'It returns **0** when the echo does not come back in time (obstacle too far, or a surface that absorbs sound).',
      'In the simulator, set the distance with the slider of the ‘Peripherals’ table.',
    ],
    legende: 'The distance measured by the sensor plugged into P0 shows every second.',
  },
  grove_ultrason_pouces: {
    titre: 'distance (inches) on …',
    sert: 'Returns the **distance** between the Grove ultrasonic sensor and the nearest obstacle, in **inches** (1 inch = 2.54 cm).',
    util: [
      'Choose the sensor\'s pin.',
    ],
    savoir: [
      'Distances are usually measured in centimetres: prefer the ‘distance (cm) on …’ block.',
      'The Grove ultrasonic sensor uses **only one pin**: the one chosen in the block.',
      'It returns **0** when the echo does not come back in time.',
    ],
    legende: 'The distance measured by the sensor plugged into P0 shows every second.',
  },
  grove_joystick_valeur: {
    titre: 'joystick value on …',
    sert: 'Returns the **position of one axis** of the Grove joystick, from **0 to 1023**: about 512 when the stick is at rest.',
    util: [
      'Choose the pin of the axis to read: each axis (X or Y) has its own pin.',
    ],
    savoir: [
      'The joystick plugs into analogue inputs: **P0, P1 or P2**.',
      'Pressing the stick makes the X axis drop almost to 0.',
      'In the simulator, push the stick drawn in the wiring, or use the sliders of the ‘Peripherals’ table.',
    ],
    legende: 'The value of the X axis (pin P0) shows every second.',
  },
  grove_joystick_direction: {
    titre: 'joystick X … Y … towards …',
    sert: 'Returns **true** when the joystick is pushed in the chosen **direction** (up, down, left, right), or when it is **in the centre**.',
    util: [
      'Choose the pins of the **X** and **Y** axes, then the direction.',
      'Put this block in an ‘if’ block, in the ‘forever’ block.',
    ],
    savoir: [
      'The joystick counts as pushed when the axis goes **below 350** or **above 700** (out of 1023).',
      'For finer control, read the exact value with the ‘joystick value on …’ block.',
    ],
    legende: 'A happy face shows when the joystick (axes on P0 and P1) is pushed up.',
  },
  grove_joystick_bouton: {
    titre: 'joystick button on … pressed',
    sert: 'Returns **true** when you **press the stick** of the Grove joystick, **false** otherwise.',
    util: [
      'Choose the pin of the joystick\'s **X** axis.',
      'Put this block in an ‘if’ block.',
    ],
    savoir: [
      'The press is recognised because it makes the X axis drop **below 250**: pushing the stick fully to the left can give the same result.',
    ],
    legende: 'A heart shows when you press the joystick\'s stick.',
  },
  grove_bouton_lorsque: {
    titre: 'when the push button on … is pressed',
    sert: 'Runs the blocks inside it **at each press** on the Grove push button.',
    util: [
      'Choose the button\'s pin.',
      'Put this block on its own in the workspace: it does not attach to any other block.',
    ],
    savoir: [
      'A press runs the block **only once**, even if the button stays held down.',
      'The button is watched at each turn of the program\'s main loop.',
      'In the simulator, click the button drawn in the wiring.',
    ],
    legende: 'Each press on the push button (P0) adds 1 to the counter, which shows.',
  },
  grove_bouton_appuye: {
    titre: 'push button on … pressed',
    sert: 'Returns **true** while the Grove push button is held down, **false** otherwise.',
    util: [
      'Choose the button\'s pin.',
      'Put this block in an ‘if’ block, in the ‘forever’ block.',
    ],
    savoir: [
      'To react **once per press**, use the ‘when the push button on … is pressed’ block instead.',
      'In the simulator, keep clicking on the button drawn in the wiring.',
    ],
    legende: 'A heart shows while the push button (P0) is held down.',
  },
  grove_lumiere: {
    titre: 'light on … as …',
    sert: 'Returns the **light** received by the Grove light sensor: the more light, the bigger the value.',
    util: [
      'Choose the sensor\'s pin: **P0, P1 or P2** (analogue inputs).',
      'Choose the unit: the **value** from 0 to 1023, or the **percentage** from 0 to 100 %.',
    ],
    savoir: [
      'It is a **relative** measurement: it is used to compare (lighter, darker), not to measure light in lux.',
      'In the simulator, set the light with the ‘Light’ slider of the ‘Peripherals’ table.',
    ],
    legende: 'The light measured on P1, as a percentage, shows every second.',
  },
  grove_gestes_init: {
    titre: 'set up the gesture sensor',
    sert: 'Prepares the Grove **gesture sensor** (PAJ7620), which recognises hand movements in front of it.',
    util: [
      'Put this block in the ‘on start’ block.',
    ],
    savoir: [
      'This block is **optional**: the sensor is prepared by itself at its first reading.',
      'The gesture sensor plugs into an **I2C** port.',
    ],
    legende: 'The gesture sensor is prepared, then the last gesture detected shows every second.',
  },
  grove_gestes_est: {
    titre: 'the gesture detected is …',
    sert: 'Returns **true** when the gesture sensor has just detected the **chosen gesture**: up, down, left, right, forward, backward, a rotation one way or the other, or a wave.',
    util: [
      'Choose the gesture, then put this block in an ‘if’ block.',
    ],
    savoir: [
      'Each reading **uses up** the gesture: it is given only once. To test several gestures, first store the result of the ‘gesture detected’ block in a variable.',
      'Move your hand a few centimetres from the sensor, with a clear movement.',
      'In the simulator, choose the gesture by clicking the sensor drawn in the wiring.',
    ],
    legende: 'A happy face shows when the sensor detects an upward gesture.',
  },
  grove_gestes_lire: {
    titre: 'gesture detected',
    sert: 'Returns the **name of the last gesture** detected (‘haut’, ‘gauche’, ‘vague’…), or an empty text if no gesture has been made since the previous reading.',
    util: [
      'Show the result, or store it in a variable to compare it afterwards.',
    ],
    savoir: [
      'Each reading **uses up** the gesture: it is given only once. To test several gestures, first store the result of the ‘gesture detected’ block in a variable.',
      'The names are French words written without accents: ‘haut’ (up), ‘bas’ (down), ‘gauche’ (left), ‘droite’ (right), ‘avant’, ‘arriere’, ‘horaire’, ‘antihoraire’, ‘vague’ (wave).',
    ],
    legende: 'The gesture sensor is prepared, then the last gesture detected shows every second.',
  },
  // ═══════════════ Grove: environment, colour, clock ═══════════════
  grove_th_init: {
    titre: 'set up the temperature & humidity sensor',
    sert: 'Prepares the Grove I2C **temperature and humidity sensor** (AHT20 chip, also sold as DHT20).',
    util: [
      'Put this block in the ‘on start’ block.',
    ],
    savoir: [
      'This block is **optional**: the sensor is prepared by itself at its first measurement.',
      'The sensor plugs into an **I2C** port.',
    ],
    legende: 'The sensor is prepared, then the humidity (in %) shows every second.',
  },
  grove_th_mesure: {
    titre: 'T&H sensor: …',
    sert: 'Returns the **temperature** (in °C or °F) or the air **humidity** (in %) measured by the Grove I2C temperature and humidity sensor.',
    util: [
      'Choose the quantity: **temperature (°C)**, **temperature (°F)** or **humidity (%)**.',
    ],
    savoir: [
      'The result can be a decimal number.',
      'In the simulator, set the values with the sliders of the ‘Peripherals’ table.',
    ],
    legende: 'The temperature measured by the sensor shows every second.',
  },
  grove_dht11_definir: {
    titre: 'set the DHT11 on …',
    sert: 'Tells which pin the **DHT11** temperature and humidity sensor is plugged into.',
    util: [
      'Put this block in the ‘on start’ block.',
      'Choose the sensor\'s pin.',
    ],
    savoir: [
      'This block is **optional**: without it, the DHT11 is taken on pin **P1**.',
      'On the **micro:bit V2** board, reading the DHT is **experimental**: the block returns **-1** when the measurement fails, never a wrong value. The I2C temperature and humidity sensor (AHT20/DHT20) is more reliable.',
    ],
    legende: 'The DHT11 is set on P1, then the temperature shows every second.',
  },
  grove_dht11_mesure: {
    titre: 'DHT11: …',
    sert: 'Returns the **temperature** (in °C or °F) or the **humidity** (in %) measured by the **DHT11** sensor.',
    util: [
      'Choose the quantity: **temperature (°C)**, **temperature (°F)** or **humidity (%)**.',
    ],
    savoir: [
      'The DHT11 gives **one measurement per second** at most: no need to read it more often.',
      'On the **micro:bit V2** board, reading the DHT is **experimental**: the block returns **-1** when the measurement fails, never a wrong value. The I2C temperature and humidity sensor (AHT20/DHT20) is more reliable.',
    ],
    legende: 'The DHT11 is set on P1, then the temperature shows every second.',
  },
  grove_dht22_definir: {
    titre: 'set the DHT22 on …',
    sert: 'Tells which pin the **DHT22** temperature and humidity sensor is plugged into.',
    util: [
      'Put this block in the ‘on start’ block.',
      'Choose the sensor\'s pin.',
    ],
    savoir: [
      'This block is **optional**: without it, the DHT22 is taken on pin **P1**.',
      'On the **micro:bit V2** board, reading the DHT is **experimental**: the block returns **-1** when the measurement fails, never a wrong value. The I2C temperature and humidity sensor (AHT20/DHT20) is more reliable.',
    ],
    legende: 'The DHT22 is set on P1, then the temperature shows every second.',
  },
  grove_dht22_mesure: {
    titre: 'DHT22: …',
    sert: 'Returns the **temperature** (in °C or °F) or the **humidity** (in %) measured by the **DHT22** sensor.',
    util: [
      'Choose the quantity: **temperature (°C)**, **temperature (°F)** or **humidity (%)**.',
    ],
    savoir: [
      'The DHT22 gives **one measurement every 2 seconds** at most: no need to read it more often.',
      'On the **micro:bit V2** board, reading the DHT is **experimental**: the block returns **-1** when the measurement fails, never a wrong value. The I2C temperature and humidity sensor (AHT20/DHT20) is more reliable.',
    ],
    legende: 'The DHT22 is set on P1, then the temperature shows every second.',
  },
  grove_scd30_init: {
    titre: 'set up the CO₂ sensor SCD30',
    sert: 'Prepares the **SCD30 CO₂ sensor**, which also measures temperature and humidity.',
    util: [
      'Put this block in the ‘on start’ block.',
    ],
    savoir: [
      'This block is **optional**: the sensor is prepared by itself at its first measurement.',
      'The sensor plugs into an **I2C** port.',
    ],
    legende: 'The sensor is prepared, then the CO₂ (in ppm) shows every second.',
  },
  grove_scd30_lire: {
    titre: 'SCD30: …',
    sert: 'Returns the **CO₂** (in ppm), the **temperature** (in °C) or the **humidity** (in %) measured by the SCD30 sensor.',
    util: [
      'Choose the quantity: **CO₂ (ppm)**, **temperature (°C)** or **humidity (%)**.',
    ],
    savoir: [
      'CO₂ is measured in **ppm** (parts per million): outdoor air contains about 400 ppm; the higher the value in a room, the more it needs airing.',
      'In the simulator, set the values with the sliders of the ‘Peripherals’ table.',
    ],
    legende: 'The CO₂ measured by the SCD30 shows every second.',
  },
  grove_scd41_init: {
    titre: 'set up the CO₂ sensor SCD41',
    sert: 'Prepares the **SCD41 CO₂ sensor**, which also measures temperature and humidity.',
    util: [
      'Put this block in the ‘on start’ block.',
    ],
    savoir: [
      'This block is **optional**: the sensor is prepared by itself at its first measurement.',
      'The sensor plugs into an **I2C** port.',
    ],
    legende: 'The sensor is prepared, then the CO₂ (in ppm) shows every second.',
  },
  grove_scd41_lire: {
    titre: 'SCD41: …',
    sert: 'Returns the **CO₂** (in ppm), the **temperature** (in °C) or the **humidity** (in %) measured by the SCD41 sensor.',
    util: [
      'Choose the quantity: **CO₂ (ppm)**, **temperature (°C)** or **humidity (%)**.',
    ],
    savoir: [
      'CO₂ is measured in **ppm** (parts per million): outdoor air contains about 400 ppm; the higher the value in a room, the more it needs airing.',
      'In the simulator, set the values with the sliders of the ‘Peripherals’ table.',
    ],
    legende: 'The CO₂ measured by the SCD41 shows every second.',
  },
  grove_bmp280: {
    titre: 'BMP280: …',
    sert: 'Returns the **air pressure** (in hPa), the **temperature** (in °C) or the estimated **altitude** (in m) measured by the Grove BMP280 sensor.',
    util: [
      'Choose the quantity: **pressure (hPa)**, **temperature (°C)** or **altitude (m)**.',
    ],
    savoir: [
      'At sea level, the air pressure is about **1013 hPa**; it goes down as you go up.',
      'The altitude is **calculated** from the pressure, taking 1013.25 hPa at sea level: it also changes with the weather.',
      'The sensor plugs into an **I2C** port. ' + 'In the simulator, set the values with the sliders of the ‘Peripherals’ table.',
    ],
    legende: 'The air pressure measured by the BMP280 shows every second.',
  },
  grove_sgp30: {
    titre: 'SGP30 air quality: …',
    sert: 'Returns a measurement of **air quality** made by the Grove SGP30 sensor: the **eCO₂** (in ppm) or the **total VOC** (in ppb).',
    util: [
      'Choose the quantity: **eCO₂ (ppm)** or **Total VOC (ppb)**.',
    ],
    savoir: [
      '**VOC** are volatile organic compounds (solvents, perfumes, glues…); **eCO₂** is an estimate of CO₂ calculated by the sensor, not a real CO₂ measurement.',
      'During the **first 15 seconds**, the sensor warms up: it returns 400 ppm and 0 ppb.',
      'The sensor plugs into an **I2C** port. ' + 'In the simulator, set the values with the sliders of the ‘Peripherals’ table.',
    ],
    legende: 'A sad face shows when the VOC go above 500 ppb, a happy face otherwise.',
  },
  grove_couleur_init: {
    titre: 'set up the colour sensor',
    sert: 'Prepares the Grove **colour sensor** (VEML6040), which measures the amount of red, green, blue and white light.',
    util: [
      'Put this block in the ‘on start’ block.',
    ],
    savoir: [
      'This block is **optional**: the sensor is prepared by itself at its first measurement.',
      'The sensor plugs into an **I2C** port.',
    ],
    legende: 'The colour sensor is prepared, then the measured amount of red shows every second.',
  },
  grove_couleur_lire: {
    titre: 'colour sensor: channel …',
    sert: 'Returns the amount of **red**, **green**, **blue** or **white** light received by the colour sensor.',
    util: [
      'Choose the channel.',
      'To recognise a colour, compare the channels with each other: for example, the object is rather red if red is bigger than green and blue.',
    ],
    savoir: [
      'These are **raw values** (from 0 to 65535): they depend a lot on the lighting and on the object\'s distance.',
      'Put the object very close to the sensor, always at the same distance.',
    ],
    legende: 'The colour sensor is prepared, then the measured amount of red shows every second.',
  },
  grove_rtc_regler: {
    titre: 'set the clock to day … month … year … to … h … min … s',
    sert: 'Sets the Grove **real-time clock** (DS1307 or DS3231) to the given date and time.',
    util: [
      'Type the date (day, month, year) and the time (hours from 0 to 23, minutes, seconds).',
      'Put this block in the ‘on start’ block, upload the program **once**, then **remove the block** and upload again.',
    ],
    savoir: [
      'The module\'s **battery** keeps the time, even with the board unplugged: if the block stays in the program, the clock is set back to the same time at each start.',
      'The module plugs into an **I2C** port.',
      'In the simulator, the clock follows the computer\'s time, shifted by what the program has set.',
    ],
    legende: 'The clock is set once at start, then the time scrolls every 5 seconds.',
  },
  grove_rtc_lire: {
    titre: 'clock: …',
    sert: 'Returns one part of the real-time clock\'s date or time: the **hour** (0 to 23), the **minute**, the **second**, the **day**, the **month** or the **year**.',
    util: [
      'Choose the part to read.',
      'Compare it with a number in an ‘if’ block to trigger an action at a precise time.',
    ],
    savoir: [
      'To react at a precise time (an alarm clock), test **the hour and the minute** together with the ‘and’ block.',
      'The clock must first have been set with the ‘set the clock to …’ block.',
    ],
    legende: 'The buzzer plugged into P0 sounds at 7:30.',
  },
  grove_rtc_texte: {
    titre: 'clock: time as text (hh:mm:ss)',
    sert: 'Returns the real-time clock\'s **time** as **text** ‘hh:mm:ss’, for example ‘08:05:30’.',
    util: [
      'Show the text on the LED matrix (‘scroll’ block) or on a screen (LCD, OLED…).',
    ],
    savoir: [
      'Numbers smaller than 10 are written with a **0 in front**: 8:5 becomes ‘08:05’.',
    ],
    legende: 'The clock is set once at start, then the time scrolls every 5 seconds.',
  },
  // ═══════════════ Logic ═══════════════
  controls_if: {
    titre: 'if … do … else …',
    sert: 'Runs the blocks in ‘do’ **only if** a condition is true; otherwise, it can run other blocks (‘else’).',
    util: [
      'Attach a condition in the ‘if’ box: a block that returns true or false (button pressed, comparison…).',
      'Put in ‘do’ the blocks to run when the condition is true.',
      'To add ‘else’ or ‘else if’, click the block\'s **gear** and drag the parts you want.',
    ],
    savoir: [
      'The condition is tested **only once**, when the program reaches it: put the block in the ‘forever’ block to watch it all the time.',
      'With several ‘else if’, only the **first** true condition is run.',
    ],
    legende: 'A happy face shows while button A is pressed, a sad face otherwise.',
  },
  logic_ternary: {
    titre: 'test … if true … if false …',
    sert: 'Returns **one value or another** depending on a condition: the ‘if true’ value when the condition is true, the ‘if false’ value otherwise.',
    util: [
      'Attach the condition in ‘test’, then one value in ‘if true’ and another in ‘if false’.',
      'Put this block where a value is expected: show, store in a variable…',
    ],
    savoir: [
      'The result has the type of the chosen values: a number, a text… (here, a text).',
      'It is a short form of the ‘if … else’ block, when you only need to choose a value.',
    ],
    legende: 'At start, the board scrolls ‘Hot’ if the temperature is above 25 °C, ‘Cool’ otherwise.',
  },
  logic_compare: {
    titre: '… = …',
    sert: 'Compares two values and returns **true** or **false**: equal (=), different (≠), smaller (<), smaller or equal (≤), bigger (>), bigger or equal (≥).',
    util: [
      'Attach a value on each side, then choose the comparison in the block\'s list.',
      'Put this block in an ‘if’ or ‘repeat while’ block.',
    ],
    savoir: [
      'With a measurement that changes a little all the time (temperature, light), prefer < or > to =: the exact value may never be reached.',
      'You can also compare two texts: ‘=’ checks that they are identical.',
    ],
    legende: 'A sad face shows when the board\'s temperature is above 25 °C, a happy face otherwise.',
  },
  logic_operation: {
    titre: '… and …',
    sert: 'Combines two conditions: ‘**and**’ returns true if **both** are true; ‘**or**’ returns true if **at least one** is true.',
    util: [
      'Attach a condition on each side, then choose **and** or **or** in the block\'s list.',
    ],
    savoir: [
      'To combine more than two conditions, put an ‘and’ (or ‘or’) block inside another one.',
    ],
    legende: 'A heart shows only when buttons A and B are pressed together.',
  },
  logic_negate: {
    titre: 'not …',
    sert: '**Reverses** a condition: returns true when the condition is false, and false when it is true.',
    util: [
      'Attach the condition to reverse.',
    ],
    savoir: [
      '‘not button A is pressed’ is true as long as A is **not** pressed.',
    ],
    legende: 'A sad face shows while button A is not pressed, a happy face otherwise.',
  },
  logic_boolean: {
    titre: 'true / false',
    sert: 'Returns the value **true** or the value **false**, chosen in the block\'s list.',
    util: [
      'Store it in a variable to remember a state: on or off, game in progress or over…',
    ],
    savoir: [
      'With the ‘not’ block, you can easily switch from one state to the other: ‘set on to not on’.',
    ],
    legende: 'Button A turns the heart on or off: the ‘allume’ (on) variable switches between true and false.',
  },
  logic_null: {
    titre: 'null',
    sert: 'Returns the value **null**: ‘no value’.',
    util: [
      'Store it in a variable to show that it does not contain anything yet.',
    ],
    savoir: [
      'In the Python program, null is written **None**.',
      'This block is rarely used: for a number, starting at 0 is often better.',
    ],
    legende: 'A variable gets the value null at start, then it is written in the console (None).',
  },

  // ═══════════════ Maths ═══════════════
  math_number: {
    titre: '123 (number)',
    sert: 'Returns the **number** written in the block.',
    util: [
      'Click in the block to type the number.',
    ],
    savoir: [
      'A decimal number is written with a **point**: 2.5.',
      'A negative number is written with the minus sign: -3.',
    ],
    legende: 'The number 42 scrolls at start.',
  },
  math_constant: {
    titre: 'π',
    sert: 'Returns a **mathematical constant**: π (pi), e, φ (golden ratio), √2, √½ or ∞ (infinity).',
    util: [
      'Choose the constant in the block\'s list.',
    ],
    savoir: [
      'π is about 3.14: it is used to calculate the circumference or the area of a circle (circumference = 2 × π × radius).',
    ],
    legende: 'At start, the value of π scrolls on the LED matrix.',
  },
  math_arithmetic: {
    titre: '… + …',
    sert: 'Returns the result of a **calculation** between two numbers: addition (+), subtraction (−), multiplication (×), division (÷) or power (^).',
    util: [
      'Attach a number on each side, then choose the operation in the block\'s list.',
      'For a longer calculation, put a calculation block inside another one.',
    ],
    savoir: [
      'Division gives a **decimal** number: 7 ÷ 2 = 3.5.',
      'A division **by 0** stops the program with an error.',
      '‘^’ is the power: 2 ^ 3 = 2 × 2 × 2 = 8.',
    ],
    legende: 'At start, the result of 3 + 4 (that is 7) scrolls.',
  },
  math_modulo: {
    titre: 'remainder of … ÷ …',
    sert: 'Returns the **remainder** of the whole-number division of one number by another: the remainder of 17 ÷ 5 is 2 (17 = 3 × 5 + 2).',
    util: [
      'Attach the number to divide, then the divisor.',
    ],
    savoir: [
      'A number is **even** when the remainder of its division by 2 is **0**.',
      'The remainder comes back to 0 regularly: handy to do something every 5 turns, for example.',
    ],
    legende: 'At start, the remainder of 17 ÷ 5 (that is 2) scrolls.',
  },
  math_min_max: {
    titre: 'min of … and …',
    sert: 'Returns the **smaller** (min) or the **bigger** (max) of two numbers.',
    util: [
      'Choose **min** or **max**, then attach the two numbers.',
    ],
    savoir: [
      '‘max of measurement and 0’ prevents a negative result: it never goes below 0.',
    ],
    legende: 'At start, the bigger of 3 and 7 (that is 7) shows.',
  },
  math_absolue: {
    titre: 'absolute value of …',
    sert: 'Returns the **absolute value** of a number: the number without its sign (−5 becomes 5, 5 stays 5).',
    util: [
      'Attach the number.',
    ],
    savoir: [
      'Handy to know a **gap** without caring about its direction: absolute value of (measurement − target).',
    ],
    legende: 'At start, the absolute value of −5 (that is 5) shows.',
  },
  math_racine: {
    titre: 'square root …',
    sert: 'Returns the **square root** of a number: the square root of 16 is 4, because 4 × 4 = 16.',
    util: [
      'Attach the number.',
    ],
    savoir: [
      'The result is a decimal number (4.0).',
      'The square root of a **negative** number stops the program with an error.',
    ],
    legende: 'At start, the square root of 16 (that is 4) shows.',
  },
  math_arrondi_custom: {
    titre: 'round …',
    sert: 'Returns a number **rounded** to a whole number: to the nearest (round), up (round up) or down (round down).',
    util: [
      'Choose the kind of rounding, then attach the number.',
    ],
    savoir: [
      '3.7 gives 4 with ‘round’, 4 with ‘round up’ and 3 with ‘round down’.',
      'Handy before showing a decimal measurement on the LED matrix.',
    ],
    legende: 'At start, 3.7 rounded (that is 4) shows.',
  },
  math_constrain: {
    titre: 'constrain … low … high …',
    sert: 'Returns a number **brought back between two limits**: if it is too small, it becomes the low limit; too big, the high limit.',
    util: [
      'Attach the number, then the low limit and the high limit.',
    ],
    savoir: [
      'Handy to keep a value within what a module accepts, for example a servomotor angle between 0 and 180.',
    ],
    legende: 'At start, 150 constrained between 0 and 100 gives 100, which shows.',
  },
  math_random_int: {
    titre: 'random integer from … to …',
    sert: 'Returns a **random whole number** between the two chosen limits.',
    util: [
      'Type the smallest and the biggest possible values.',
    ],
    savoir: [
      'Both limits **can come out**: from 1 to 6, the result can be 1, 2, 3, 4, 5 or 6, like a die.',
      'A new number is drawn **each time** the program reaches this block.',
    ],
    legende: 'A random number from 1 to 6 shows, then another one 2 seconds later, forever.',
  },
  math_random_bool: {
    titre: 'pick random true or false',
    sert: 'Returns **true** or **false** at random, one chance in two, like heads or tails.',
    util: [
      'Put this block in an ‘if’ block.',
    ],
    savoir: [
      'A new draw is made **each time** the program reaches this block.',
    ],
    legende: 'Each press on button A flips a coin: happy face or sad face.',
  },
  math_map: {
    titre: 'map … of … and … to … and …',
    sert: 'Changes a value from a starting **range** to another range: for example a measurement from 0 to 1023 into a value from 0 to 4.',
    util: [
      'Attach the value, then the two limits of the starting range, then the two limits of the target range.',
    ],
    savoir: [
      'The result is often a **decimal** number: round it with the ‘round’ block if needed.',
      'A value **outside** the starting range gives a result outside the target range: use the ‘constrain’ block to limit it.',
    ],
    legende: 'The light level (0 to 255) is changed into a value from 0 to 4, which shows every second.',
  },
  math_convert: {
    titre: 'convert … from degrees to radians',
    sert: 'Converts an **angle** from degrees to radians, or from radians to degrees.',
    util: [
      'Attach the angle, then choose the direction of the conversion.',
    ],
    savoir: [
      '180° is π radians (about 3.14).',
    ],
    legende: 'At start, 180 degrees converted to radians (about 3.14) show.',
  },

  // ═══════════════ Text ═══════════════
  text: {
    titre: '“ … ”',
    sert: 'Returns the **text** written in the block.',
    util: [
      'Click in the block to type the text.',
    ],
    savoir: [
      'A text that contains digits stays a text: ‘12’ is not calculated like the number 12.',
      'The LED matrix does not show accented letters.',
    ],
    legende: 'The text ‘Hello!’ scrolls once at start.',
  },
  text_join: {
    titre: 'create text with …',
    sert: 'Returns a **text** made of several pieces put end to end: text, numbers, measurements…',
    util: [
      'Attach the pieces in the boxes, in order.',
      'To add boxes, click the block\'s **gear**.',
    ],
    savoir: [
      'The pieces are stuck together **without spaces**: add the spaces in your texts (‘Temp: ’ with a space at the end).',
    ],
    legende: 'At start, the board scrolls ‘Temp: ’ followed by the temperature.',
  },

  // ═══════════════ Variables ═══════════════
  variables_set: {
    titre: 'set … to …',
    sert: '**Stores a value** in a variable: a number, a text, a measurement… The variable keeps this value until the next change.',
    util: [
      'First create the variable with the ‘Create variable…’ button of the ‘Variables’ category.',
      'Choose the variable in the block\'s list, then attach the value.',
    ],
    savoir: [
      'Give your variables **clear names**: ‘score’, ‘speed’… rather than ‘a’ or ‘b’.',
      'Put the starting value in the ‘on start’ block.',
    ],
    legende: 'The counter starts at 0; each press on A adds 1 to it, and its value shows.',
  },
  variables_get: {
    titre: '… (variable)',
    sert: 'Returns the **value stored** in the variable.',
    util: [
      'Take the variable\'s block from the ‘Variables’ category, then put it where the value is expected.',
    ],
    savoir: [
      'A variable can contain a number, a text or true/false: its type is that of the last value stored.',
      'A variable read before getting a value is **null** (None).',
    ],
    legende: 'The counter starts at 0; each press on A adds 1 to it, and its value shows.',
  },
  math_change: {
    titre: 'change … by …',
    sert: '**Adds** a number to a variable\'s value: ‘change score by 1’ makes score go from 4 to 5.',
    util: [
      'Choose the variable, then type the number to add.',
    ],
    savoir: [
      'With a **negative** number, the variable goes down: ‘change lives by -1’.',
      'The variable must already contain a number: give it a starting value in the ‘on start’ block.',
    ],
    legende: 'The counter starts at 0; each press on A adds 1 to it, and its value shows.',
  },

  // ═══════════════ Functions ═══════════════
  procedures_defnoreturn: {
    titre: 'to do something',
    sert: '**Creates a function**: a series of blocks given a name, which can then be run with a single block, as many times as you like.',
    util: [
      'Click ‘do something’ to give the function a clear name (‘blink’, ‘forward’…).',
      'Put in the block the blocks the function must run.',
      'The block that runs the function then appears in the ‘Functions’ category.',
    ],
    savoir: [
      'The function block is put **on its own** in the workspace.',
      'To give the function **parameters**, click its gear.',
      'A function avoids copying the same blocks several times: you fix it in one place.',
    ],
    legende: 'The ‘clignoter’ (blink) function blinks the heart once; it is run three times at start.',
  },
  procedures_defreturn: {
    titre: 'to do something … return …',
    sert: '**Creates a function that returns a value**: it makes a calculation and gives the result to the block that ran it.',
    util: [
      'Give the function a clear name, then put in the block the calculation blocks.',
      'Attach in ‘return’ the value to return.',
      'To give the function **parameters** (the values it receives), click its gear.',
    ],
    savoir: [
      'The block that runs the function is a **round** block: it goes where a value is expected.',
      'The ‘if … return’ block returns a value earlier.',
    ],
    legende: 'The ‘limiter’ function returns the number it receives, but never more than 9: 25 gives 9, which shows.',
  },
  procedures_callnoreturn: {
    titre: 'do something',
    sert: '**Runs a function**: runs all the blocks of the function with this name.',
    util: [
      'Take this block from the ‘Functions’ category: it appears there as soon as a function is created.',
      'Put it where the function must run.',
    ],
    savoir: [
      'After the function, the program goes on with the next block.',
      'If the function has parameters, attach a value in each box of the block.',
    ],
    legende: 'The ‘clignoter’ (blink) function blinks the heart once; it is run three times at start.',
  },
  procedures_callreturn: {
    titre: 'do something (with result)',
    sert: '**Runs a function that returns a value**, and returns this result.',
    util: [
      'Take this block from the ‘Functions’ category, then put it where a value is expected.',
      'If the function has parameters, attach a value in each box of the block.',
    ],
    savoir: [
      'The type of the result depends on what the function returns: a number, a text…',
    ],
    legende: 'The ‘limiter’ function returns the number it receives, but never more than 9: 25 gives 9, which shows.',
  },
  procedures_ifreturn: {
    titre: 'if … return …',
    sert: 'In a function that returns a value, **returns at once** the given value **if** the condition is true; the rest of the function is then not run.',
    util: [
      'Put this block **inside** a ‘to do something … return’ block.',
      'Attach the condition, then the value to return.',
    ],
    savoir: [
      'This block can only be used in a function.',
    ],
    legende: 'The ‘limiter’ function returns the number it receives, but never more than 9: 25 gives 9, which shows.',
  },
  maqueen_v3_mode_T: {
    titre: 'Maqueen Plus v3: at T-junctions, go …',
    sert: 'Chooses what the V3 robot does, during line following, when it reaches a **T-junction** (the line stops and goes left and right): turn **left**, turn **right** or **stop**.',
    util: [
      'Put this block in the ‘on start’ block, before starting the line follower.',
    ],
    savoir: [
      'This block needs a **Maqueen Plus V3** chassis: V1 and V2 chassis do not have this built-in line follower.',
      'At a T, going straight on is impossible: only ‘left’, ‘right’ and ‘stop’ are offered.',
    ],
    legende: 'At start, the V3 robot turns right at T-junctions, then line following starts.',
  },
};
window.EXEMPLES_EN = {
  'Prêt': 'Ready',
  'Chaud': 'Hot',
  'Frais': 'Cool',
  'Temp : ': 'Temp: ',
  'compteur': 'counter',
  'Bonjour': 'Hello',
  'Chat': 'Cat',
  'Salut': 'Hi',
  'Bonjour !': 'Hello!',
  'Démarrage': 'Start',
  'dé': 'die',
  'i': 'i',
};
