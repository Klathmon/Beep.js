export default class Beep {

  /**
   * Creates the object via `new Beep()`
   * @param  {float}  volume   The volume of the output. This is a float from 0 to 1
   * @param  {string} waveType The shape of the audio wave you want to produce. Options are ['square', 'sine', 'triangle', 'sawtooth']
   * @return {Object}
   */
  constructor (volume = 1, waveType = 'square') {
    this._volume = volume
    this._waveType = waveType
  }

  /**
   * Call this to initalize the audio context.
   * On iOS this MUST happen from a user-submitted action (an onClick handler or something similar)
   * This method will be called automatically when you call beep() the first time
   *
   * @return {Promise}
   */
  init () {
    if (typeof this._audioContext === 'undefined') {
      this._audioContext = this._getAudioContext()
      return Promise.resolve()
    } else {
      return Promise.resolve()
    }
  }

  /**
   * Makes a beep sound in the frequency and the duration you pass
   * @param  {Array[Array[int, int]]} freqArray An array of sound/duration tuples that you want this to make.
   *                                  The inner arrays are in the format [frequency (in hz), time (in ms)].
   *                                  The sounds will be made directly one after the other until there are no more.
   *
   * @return {Promise}
   */
  beep (freqArray) {
    return this.init().then(() => {
      return new Promise((resolve, reject) => {
        const gainNode = this._createGainNode()
        const oscillatorNode = this._createOscillatorNode()
        oscillatorNode.onended = () => resolve() // Call resolve() when the beep is completely finished

        const startTime = this._audioContext.currentTime
        const [firstFreq, firstTime] = freqArray.shift() // Shift off the first element of the array as the first note
        let cumulativeTime = startTime + this._msToS(firstTime)
        oscillatorNode.frequency.value = firstFreq

        // Loop over the rest of the notes and tell the oscillatorNode to set the freq at the appropriate time
        // If there was only one sound/duration tuple then there will be 0 elements in the array at this point and it will be skipped
        freqArray.forEach(([freq, time]) => {
          oscillatorNode.frequency.setValueAtTime(freq, cumulativeTime)
          cumulativeTime += this._msToS(time)
        })

        // Connect the oscillatorNode to the destination (speaker output)
        oscillatorNode.connect(gainNode)
        gainNode.connect(this._audioContext.destination)

        // And finally start and stop the beep at the correct times
        oscillatorNode.start(startTime)
        oscillatorNode.stop(cumulativeTime)
      })
    })
  }

  /**
   * Creates an OscillatorNode in a cross-platform way
   * Also sets the waveType to what was given in the constructor
   * @return {object} oscillatorNode
   */
  _createOscillatorNode () {
    const oscillatorNode = this._audioContext.createOscillator()

    oscillatorNode.start = oscillatorNode.noteOn || oscillatorNode.start
    oscillatorNode.stop = oscillatorNode.noteOff || oscillatorNode.stop

    oscillatorNode.type = this._waveType

    return oscillatorNode
  }

  /**
   * Creates an GainNode in a cross-platform way
   * Also sets the volume to the constructor's value
   * @return {object} gainNode
   */
  _createGainNode () {
    const gainNode = this._audioContext.createGain()

    gainNode.start = gainNode.noteOn || gainNode.start
    gainNode.stop = gainNode.noteOff || gainNode.stop

    gainNode.gain.value = (this._volume)

    return gainNode
  }

  /**
   * Gets a new AudioContext in a cross-platform way
   * @return {object} audioContext
   */
  _getAudioContext () {
    return new (window.AudioContext || window.webkitAudioContext)
  }

  /**
   * Simple helper method to convert milliseconds to seconds
   * @param  {int} ms
   * @return {int} seconds
   */
  _msToS (ms) {
    return ms / 1000
  }
}
