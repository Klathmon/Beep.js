'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Beep class
 */

var Beep = function () {

  /**
   * Creates the object via `new Beep()`
   * @param  {float}  volume   The volume of the output. This is a float from 0 to 1
   * @param  {string} waveType The shape of the audio wave you want to produce. Options are ['square', 'sine', 'triangle', 'sawtooth']
   * @return {Object}
   */

  function Beep() {
    var volume = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
    var waveType = arguments.length <= 1 || arguments[1] === undefined ? 'square' : arguments[1];

    _classCallCheck(this, Beep);

    this._volume = volume;
    this._waveType = waveType;
  }

  /**
   * Call this to initalize the audio context.
   * On iOS this MUST happen from a user-submitted action (an onClick handler or something similar)
   * This method will be called automatically when you call beep() the first time
   *
   * @return {Promise}
   */


  Beep.prototype.init = function init() {
    if (typeof this._audioContext === 'undefined') {
      this._audioContext = this._getAudioContext();
      return Promise.resolve();
    } else {
      return Promise.resolve();
    }
  };

  /**
   * Makes a beep sound in the frequency and the duration you pass
   * @param  {Array[Array[int, int]]} freqArray An array of sound/duration tuples that you want this to make.
   *                                  The inner arrays are in the format [frequency (in hz), time (in ms)].
   *                                  The sounds will be made directly one after the other until there are no more.
   *
   * @return {Promise}
   */


  Beep.prototype.beep = function beep(freqArray) {
    var _this = this;

    return this.init().then(function () {
      return new Promise(function (resolve, reject) {
        var gainNode = _this._createGainNode(_this._volume);
        var oscillatorNode = _this._createOscillatorNode(_this._waveType);
        oscillatorNode.onended = function () {
          return resolve();
        }; // Call resolve() when the beep is completely finished

        var startTime = _this._audioContext.currentTime;

        var _freqArray$shift = freqArray.shift();

        var firstFreq = _freqArray$shift[0];
        var firstTime = _freqArray$shift[1]; // Shift off the first element of the array as the first note

        var cumulativeTime = startTime + _this._msToS(firstTime);
        oscillatorNode.frequency.value = firstFreq;

        // Loop over the rest of the notes and tell the oscillatorNode to set the freq at the appropriate time
        // If there was only one sound/duration tuple then there will be 0 elements in the array at this point and it will be skipped
        freqArray.forEach(function (_ref) {
          var freq = _ref[0];
          var time = _ref[1];

          oscillatorNode.frequency.setValueAtTime(freq, cumulativeTime);
          cumulativeTime += _this._msToS(time);
        });

        // Connect the oscillatorNode to the destination (speaker output)
        oscillatorNode.connect(gainNode);
        gainNode.connect(_this._audioContext.destination);

        // And finally start and stop the beep at the correct times
        oscillatorNode.start(startTime);
        oscillatorNode.stop(cumulativeTime);
      });
    });
  };

  /**
   * Creates an OscillatorNode in a cross-platform way
   * @param  {string} waveType       The type of the sound wave. Options are ['square', 'sine', 'triangle', 'sawtooth']
   * @return {object} oscillatorNode
   */


  Beep.prototype._createOscillatorNode = function _createOscillatorNode(waveType) {
    var oscillatorNode = this._audioContext.createOscillator();

    oscillatorNode.start = oscillatorNode.noteOn || oscillatorNode.start;
    oscillatorNode.stop = oscillatorNode.noteOff || oscillatorNode.stop;

    oscillatorNode.type = waveType;

    return oscillatorNode;
  };

  /**
   * Creates an GainNode in a cross-platform way
   * @param  {float}  volume   The volume of the output.
   * @return {object} gainNode
   */


  Beep.prototype._createGainNode = function _createGainNode(volume) {
    var gainNode = this._audioContext.createGain();

    gainNode.start = gainNode.noteOn || gainNode.start;
    gainNode.stop = gainNode.noteOff || gainNode.stop;

    gainNode.gain.value = volume;

    return gainNode;
  };

  /**
   * Gets a new AudioContext in a cross-platform way
   * @return {object} audioContext
   */


  Beep.prototype._getAudioContext = function _getAudioContext() {
    return new (window.AudioContext || window.webkitAudioContext)();
  };

  /**
   * Simple helper method to convert milliseconds to seconds
   * @param  {int} ms
   * @return {int} seconds
   */


  Beep.prototype._msToS = function _msToS(ms) {
    return ms / 1000;
  };

  return Beep;
}();

exports.default = Beep;

