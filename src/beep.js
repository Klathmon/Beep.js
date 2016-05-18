export default class Beep {

  constructor (volume = 1, waveType = 'square') {
    this.volume = volume
    this.waveType = waveType
  }

  init () {
    if (typeof this.audioContext === 'undefined') {
      this.audioContext = this._getAudioContext()
      return Promise.resolve()
    } else {
      return Promise.resolve()
    }
  }

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

  _createOscillatorNode () {
    var oscillatorNode = this.audioContext.createOscillator()

    oscillatorNode.start = oscillatorNode.noteOn || oscillatorNode.start
    oscillatorNode.stop = oscillatorNode.noteOff || oscillatorNode.stop

    oscillatorNode.type = this.waveType

    return oscillatorNode
  }

  _createGainNode () {
    let gainNode = this.audioContext.createGain()

    gainNode.start = gainNode.noteOn || gainNode.start
    gainNode.stop = gainNode.noteOff || gainNode.stop

    gainNode.gain.value = (this.volume)

    return gainNode
  }

  _getAudioContext () {
    return new (window.AudioContext || window.webkitAudioContext)
  }

  _msToS (ms) {
    return ms / 1000
  }
}
