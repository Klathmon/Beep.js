export default class Beep {

  /**
   * Creates the object via `new Beep()`
   * @param  {float}  volume   The volume of the output. This is a float from 0 to 1
   * @param  {string} waveType The shape of the audio wave you want to produce. Options are ['square', 'sine', 'triangle', 'sawtooth']
   * @return {Object}
   */
  constructor (volume = 1, waveType = 'square') {
    this.volume = volume
    this.waveType = waveType
  }

  /**
   * Call this to initalize the audio context.
   * On iOS this MUST happen from a user-submitted action (an onClick handler or something similar)
   * This method will be called automatically when you call beep() the first time
   *
   * @return {Promise}
   */
  init () {
    if (typeof this.audioContext === 'undefined') {
      this.audioContext = this._getAudioContext()
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
        oscillatorNode.onended = () => resolve()

        const startTime = this.audioContext.currentTime
        const [firstFreq, firstTime] = freqArray.shift()
        let cumulativeTime = startTime + this._msToS(firstTime)

        oscillatorNode.frequency.value = firstFreq

        freqArray.forEach(([freq, time]) => {
          oscillatorNode.frequency.setValueAtTime(freq, cumulativeTime)
          cumulativeTime += this._msToS(time)
        })

        oscillatorNode.connect(gainNode)
        gainNode.connect(this.audioContext.destination)

        oscillatorNode.start(startTime)
        oscillatorNode.stop(cumulativeTime)
      })
    })
  }

  /**
   * Creates an OscillatorNode in a cross-platform way
   * @return {object} oscillatorNode
   */
  _createOscillatorNode () {
    const oscillatorNode = this.audioContext.createOscillator()

    oscillatorNode.start = oscillatorNode.noteOn || oscillatorNode.start
    oscillatorNode.stop = oscillatorNode.noteOff || oscillatorNode.stop

    oscillatorNode.type = this.waveType

    return oscillatorNode
  }

  /**
   * Creates an GainNode in a cross-platform way
   * @return {object} gainNode
   */
  _createGainNode () {
    const gainNode = this.audioContext.createGain()

    gainNode.start = gainNode.noteOn || gainNode.start
    gainNode.stop = gainNode.noteOff || gainNode.stop

    gainNode.gain.value = (this.volume)

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
