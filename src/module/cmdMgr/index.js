import VnDisp from "../vnDisp/index.js";
import findCurLineNum from "../lyric/findCurLineNum.js";
import Lyric from "../lyric/index.js";
/**
 * @typedef {Object} effectOpt
 * @prop {String} name The name of the effect
 * @prop {CSSStyleDeclaration} style
 * @prop {any}
 */

export default class CmdMgr extends Lyric {
    constructor(options) {
        super(options);
        /** @type {?VnDisp} */
        this.vn = options.vnDisp ?? null;
        this.onPlay = this.#onPlay;
        this.bgMgr = this.vn.bgMgr;

        this.prev = {
            bg: null,
        };
        this.currentLine = {
            bg: {
                src: null,
                aniName: null
            },
            /** @type {?effectOpt} */
            tEffect: null,
            label: "",
            tPos: "tl",
            tAni: "zoomInRight",
            tShadowCol: "#bd0094",
            tShadow: "2px 2px 2px #bd0094",
            tHlCol: "#ffcff5",
            tCol: "#ffffff",
            tSpeed: 500,
            bgCol: null,
            /** @type {Boolean} allow Text Append */
            tAppend: false,
            /** @type {?String} youtube url*/
            ytVod: null,
            /** @type {Number} lyric Offset time in milliseconds */
            lrcOff: 0,
            /** @type {Boolean} textBox visible */
            hideVn: false
        }
        this.onSetLyric = () => {
            this.#onPlay(0, this.lines[0]);
        }
    }
    /** @returns {{time:Number,text:Object|String,extendedLyrics:String[]}} */
    get initLine() {
        return this.lines[0];
    }
    #updateCmd(data) {
        if (data.label) this.currentLine.label = data.label == "null" ? " " : data.label;
        if (data.tPos) this.currentLine.tPos = data.tPos == "default" ? "tl" : data.tPos;
        if (data.tAni) this.currentLine.tAni = data.tAni;
        if (data.tShadowCol) {
            this.currentLine.tShadowCol = data.tShadowCol;
            this.currentLine.tShadow = `2px 2px 2px ${data.tShadowCol}`;
        }
        if (data.tShadow) this.currentLine.tShadow = data.tShadow;
        if (data.tHlCol) this.currentLine.tHlCol = data.tHlCol;
        if (data.tCol) this.currentLine.tCol = data.tCol;
        if (data.tEffect && (data.tEffect.e != null)) this.currentLine.tEffect = data.tEffect;
        if (data.bg) this.currentLine.bg = data.bg;
        if (data.tSpeed) this.currentLine.tSpeed = Number(data.tSpeed);
        if (data.bgCol) this.currentLine.bgCol = data.bgCol;
        if (data.tAppend != undefined) this.currentLine.tAppend = data.tAppend == "true" ? true : false;
        if (data.ytVod) this.currentLine.ytVod = data.ytVod;
        if (data.lrcOff) this.currentLine.lrcOff = Number(data.lrcOff);
        if (data.hideVn) this.currentLine.hideVn = data.hideVn == "true" ? true : false;
    }
    #onPlay(_n, o) {
        this.#updateCmd(o.text);
        // this.#updateBg(this.currentLine.bg);
        this.bgMgr.cmd = this.currentLine;
        this.bgMgr.update()
        if (this.currentLine.bgCol) this.vn.container.css('background-color', this.currentLine.bgCol);
        if (this.currentLine.hideVn) {
            $("#dialog").removeClass("d-flex");

            $("#dialog").css({ "display": "none" });
        } else if (this.currentLine.hideVn == false) {
            $("#dialog")[0].className = "d-flex p-2";
            $("#dialog").attr("css", "");
        }

    }
    _handleMaxLine() {
        this.onPlay(this.maxLine, this.lines[this.maxLine]);
    }
    _refresh(currentTime) {
        // 현재 재생 중인 라인의 번호를 계산하여 업데이트
        this.curLineNum = findCurLineNum(this.lines, currentTime, this.curLineNum);

        // 현재 라인과 다음 라인을 가져옴
        let curLine = this.lines[this.curLineNum];
        let nextLine = this.lines[this.curLineNum + 1];

        // 현재 라인의 시간 또는 다음 라인이 없을 경우 마지막 라인을 처리하고 종료
        if (!curLine || !nextLine) {
            this.onPlay(this.maxLine, this.lines[this.maxLine]);
            return;
        }

        // 현재 라인 시간과의 차이를 계산 (driftTime)
        const driftTime = currentTime - curLine.time;

        // 만약 driftTime이 0 이상이거나 첫 번째 라인일 경우
        if (driftTime >= 0 || this.curLineNum === 0) {
            // 다음 라인까지의 지연 시간을 계산하고 재생 속도에 맞게 조정
            const delay = (nextLine.time - curLine.time - driftTime) / this._playbackRate;

            // 지연 시간이 0보다 크면 현재 라인을 재생하고 라인 번호를 증가시킴
            if (delay > 0) {
                this.onPlay(this.curLineNum, curLine);
                this.curLineNum++;

                // 그렇지 않으면 현재 시간을 기준으로 새로운 라인을 찾고 라인 번호를 업데이트
            } else {
                let newCurLineNum = findCurLineNum(this.lines, currentTime, this.curLineNum + 1);
                if (newCurLineNum > this.curLineNum) this.curLineNum = newCurLineNum - 1;
            }
            return;
        }
    }
}