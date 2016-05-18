# Beep.js
Simple wrapper around the WebAudio API

### Usage:
```javascript
var Beep = require('beepjs')

var volume = 1 // Volume is a float. 0 is silenced, 1 is full volume
var waveType = 'square' // WaveType is a string that describes the shape of the sound wave. Options are 'square', 'sine', 'triangle', or 'sawtooth'.

var beep = new Beep(volume, waveType)

/**
 * You need to call init() to create the `AudioContext` for the system.
 * On iOS init() must be called from a user action (onClick, onMousedown, onKeyDown, etc...)
 * On all platforms this will be automatically called for you on your first call of beep()
 */
beep.init()

/**
 * Beep takes an array of sound/duration tuples. Each tuple is a single "note".
 * It returns a promise that will be resolved when the entire beep is done.
 * The call below will do a single note at 1000hz for 100 milliseconds
 */
beep.beep([[1000, 100]])
  .then(function () {
    // The next call will do 3 beeps each right after the other in increasing pitch for 100ms each (300ms total)
    return beep.beep([[1000, 100], [2000, 100], [3000, 100]])
  })
```

### Notes:

* Whenever possible use the built-in array format for creating multiple tones. Callbacks in javascript are not precise enough and you will end up getting strange delays inbetween beeps.
* A frequency of 0 will be 'silence' and can be used as breaks in the beep array method
* the beep.init() call must happen from user interaction on iOS before any attempts to call beep.beep(...)

### License:
The MIT License (MIT)

See LICENSE.txt for details
