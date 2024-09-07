import findCurLineNum from './findCurLineNum.js';
import { lrclineParse } from './lrclineParse.js';
import { parseLrcTags } from './parseLrcTags.js';
import { timeoutTools, getNow } from './timeoutTools.js';
export default class Lyric {
    lyric;
    extendedLyrics;
    tags;
    lines;
    onPlay;
    onSetLyric;
    isPlay;
    curLineNum;
    maxLine;
    offset;
    isRemoveBlankLine;
    _playbackRate;
    _performanceTime;
    _startTime;
    /**
     * @param {Object} options
     * @param {?String} options.lyric
     * @param {?String[]} options.extendedLyrics
     * @param {?Number} options.offset
     * @param {?Number} options.playbackRate
     * @param {?function(Number,{text:String,time:Number,extendedLyrics:String[]}):void} options.onPlay
     * @param {?(() => void)} options.onSetLyric
     * @param {?Boolean} options.isRemoveBlankLine
     * @param {?Boolean} options.isCmdLine
     */
    constructor(options) {
        let { lyric = '', extendedLyrics = [], offset = 150, playbackRate = 1, onPlay = function () { }, onSetLyric = function () { }, isRemoveBlankLine = true, isCmdLine = false } = options;
        this.lyric = lyric;
        this.extendedLyrics = extendedLyrics;
        this.tags = null;
        this.lines = [];
        this.onPlay = onPlay;
        this.onSetLyric = onSetLyric;
        this.isPlay = false;
        this.curLineNum = 0;
        this.maxLine = 0;
        this.offset = offset;
        this.isRemoveBlankLine = isRemoveBlankLine;
        this._playbackRate = playbackRate;
        this._performanceTime = 0;
        this._startTime = 0;
        this.isEnableParseCmd = isCmdLine;
        this._init();
    }
    /**
     * @param {Object} options
     * @param {?String} options.lyric
     * @param {?String[]} options.extendedLyrics
     * @param {?Number} options.offset
     * @param {?Number} options.playbackRate
     * @param {?function(Number,{text:String,time:Number,extendedLyrics:String[]}):void} options.onPlay
     * @param {?(() => void)} options.onSetLyric
     * @param {?Boolean} options.isRemoveBlankLine
     * @param {?Boolean} options.isCmdLine
     */
    static create(options) {
        return new Lyric(options);
    }
    _init() {
        if (this.lyric == null)
            this.lyric = '';
        if (this.extendedLyrics == null)
            this.extendedLyrics = [];
        this.tags = parseLrcTags(this.lyric);
        let { lines, maxLine } = lrclineParse(this.lyric, this.extendedLyrics, this.isRemoveBlankLine, this.isEnableParseCmd);
        this.lines = lines;
        this.maxLine = maxLine;
        this.onSetLyric(this.lines);
    }

    _currentTime() {
        return (getNow() - this._performanceTime) * this._playbackRate + this._startTime;
    }
    _handleMaxLine() {
        this.onPlay(this.curLineNum, this.lines[this.curLineNum]);
        this.pause();
    }
    _refresh() {
        this.curLineNum++;
        if (this.curLineNum >= this.maxLine) {
            this._handleMaxLine();
            return;
        }
        let curLine = this.lines[this.curLineNum];
        const currentTime = this._currentTime();
        const driftTime = currentTime - curLine.time;
        if (driftTime >= 0 || this.curLineNum === 0) {
            let nextLine = this.lines[this.curLineNum + 1];
            const delay = (nextLine.time - curLine.time - driftTime) / this._playbackRate;
            if (delay > 0) {
                if (this.isPlay) {
                    timeoutTools.start(() => {
                        if (!this.isPlay)
                            return;
                        this._refresh();
                    }, delay);
                }
                this.onPlay(this.curLineNum, curLine);
            }
            else {
                let newCurLineNum = findCurLineNum(this.lines, currentTime, this.curLineNum + 1);
                if (newCurLineNum > this.curLineNum)
                    this.curLineNum = newCurLineNum - 1;
                this._refresh();
            }
            return;
        }
        this.curLineNum = findCurLineNum(this.lines, currentTime, this.curLineNum) - 1;
        this._refresh();
    }
    /**
     * Play lyric
     * @param time play time, unit: ms
     */
    play(curTime = 0) {
        if (!this.lines.length)
            return;
        this.pause();
        this.isPlay = true;
        this._performanceTime = getNow() - Math.trunc(this.tags.offset + this.offset);
        this._startTime = curTime;
        // this._offset = this.tags.offset + this.offset
        this.curLineNum = findCurLineNum(this.lines, this._currentTime()) - 1;
        this._refresh();
    }
    /**
     * Pause lyric
     */
    pause() {
        if (!this.isPlay)
            return;
        this.isPlay = false;
        timeoutTools.clear();
        if (this.curLineNum === this.maxLine)
            return;
        const curLineNum = findCurLineNum(this.lines, this._currentTime());
        if (this.curLineNum !== curLineNum) {
            this.curLineNum = curLineNum;
            this.onPlay(curLineNum, this.lines[curLineNum]);
        }
    }
    /**
     * Set playback rate
     * @param playbackRate playback rate
     */
    setPlaybackRate(playbackRate) {
        this._playbackRate = playbackRate;
        if (!this.lines.length)
            return;
        if (!this.isPlay)
            return;
        this.play(this._currentTime());
    }
    /**
     * Set lyric
     * @param lyricStr lyric file text
     * @param extendedLyricStrs extended lyric file text array, for example lyric translations
     */
    setLyric(lyric, extendedLyrics = []) {
        // console.log(extendedLyrics)
        if (this.isPlay)
            this.pause();
        this.lyric = lyric;
        this.extendedLyrics = extendedLyrics;
        this._init();
    }
}