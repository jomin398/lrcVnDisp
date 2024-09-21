export const TimelineCfg = {
  height: 30,
  insertPosition: 'beforebegin',
  timeInterval: 0.2,
  primaryLabelInterval: 5,
  secondaryLabelInterval: 1,
  style: {
    fontSize: '24px',
    color: '#2D5B88',
  },
};
export const HoverPluginCfg = {
  lineColor: '#ff0000',
  lineWidth: 2,
  labelBackground: '#555',
  labelColor: '#fff',
  labelSize: '11px'
};
export const WaveSurferCfg = {
  /** @type {Boolean?} audio play rate */
  audioRate: null,
  /**
   * color of the waveform
   * @type {string | string[] | CanvasGradient}
   */
  waveColor: "#664200",
  /**
   * color of the progress mask
   * @type {string | string[] | CanvasGradient}
   */
  progressColor: "#3b2600",
  /**
   * @type {String?} setting Audio backend.
   * @example "WebAudio" | "MediaElement"
   */
  backend: "WebAudio",
  /** @type {HTMLMediaElement?} Use an existing media element */
  media: null,
  /** @type {Boolean?} Whether to show mediaControls */
  mediaControls: false,
  /** @type {HTMLElement | string} waveform container */
  container: null,
  /** @type {string | string[] | CanvasGradient} cursor Width */
  cursorWidth: 1,
  /**
   * @type {Number?} Minimum pixels per second of audio (i.e. the zoom level)
   */
  minPxPerSec: 600,
  /** @type {Number?} Pre-computed audio duration in seconds*/
  duration: null,
  /**
   * @type {Boolean}
   * Stretch the waveform to fill the container
   */
  fillParent: true,
  /**
   * @type {Boolean?} allow auto Resize waveform canvases and waveform
   */
  responsive: true,
  /**
   * @type {Boolean} Pass false to disable clicks on the waveform
   */
  interact: true,
  dragToSeek: true,
  autoScroll: true,
  /**
   * @type {Boolean?} Play the audio when it loaded
   */
  autoplay: false,
  hideScrollbar: true,
  /**
   * @type {Boolean?} keep the cursor in the center of the waveform
   */
  autoCenter: true,
  /** @type {Number?} sampleRate of waveform */
  sampleRate: 8000,
  /** @type {String?} fetch audiodata with given url */
  url: null,
  /** @type {AudioContext?} */
  audioContext: null,
  /** @type {Boolean?} auto connect with audioDest */
  noAudio: false,
  /** @type {Boolean} toggle to use Internal clock */
  useExtraClock: true,
  /** @type {Object} Pre-loaded audio Buffer */
  buffers: {
    /** @type {AudioBuffer} forward audioData */
    buffer: null,
    /** @type {AudioBuffer} bufferReversed Reversed audioData */
    bufferReversed: null,
    /** @type {Number} duration audio duration in ms */
    duration: 0,
    /** @type {String?} imageUrl image url from id3 */
    imageUrl: null,
  },
};