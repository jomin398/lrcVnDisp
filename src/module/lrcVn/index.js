import { default as Lyric } from '../lyric/index.js';
import findCurLineNum from '../lyric/findCurLineNum.js';
import { findColorByText } from '../util/index.js';
import VnDisp from '../vnDisp/index.js';

export class LyricVn extends Lyric {
    constructor(options) {
        super(options);
        /** @type {?VnDisp} */
        this.vnMgr = options.vnMgr;
        this.onPlay = this.#onPlay;
    }
    static create(options) {
        return new LyricVn(options);
    }
    /**
     * @type {{
     * bg: {src: ?String,aniName: ?String},
     * tEffect: {aniName: ?String,style: ?CSSStyleDeclaration},
     * label: ?String,
     * tPos: ?String, tAni: ?String, tShadowCol: ?String, tHlCol: ?String, tCol: ?String
     * }}
     */
    get cmdLine() {
        return this.vnMgr.cmdMgr?.currentLine ?? null;
    }
    _handleMaxLine() {
        this.onPlay(this.maxLine, this.lines[this.maxLine]);
    }
    /**
     * Updates the current line based on the current playback time.
     *
     * @param {number} currentTime - The current playback time in milliseconds.
     */
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
    #createAnimData(text, anistyle, overwriteName) {
        return {
            name: overwriteName ?? "가사",
            text: text,
            anistyle: anistyle
        };
    }
    #createInterludeData(isFirst) {
        let o = {
            name: "system",
            pos: "center",
            text: "- 간주중 -",
            anistyle: "tAni-lightSpeedIn"
        };
        if (isFirst) { delete o.name; };
        if (!isFirst) o.text = "";
        return o;
    }
    #isInterlude(arr) {
        const regex = /간주\s?중/g;
        return arr.some(item => regex.test(item));
    }
    #cmdGen(textArr) {
        if (!this.vnMgr.cmdMgr) return;
        let { tPos, tAni, label, tHlCol, tShadowCol, tCol, tShadow } = this.cmdLine;
        $(`.contentWrapper`).css({
            "--tCol": tCol,
            "--hlCol": tHlCol,
            "--tShadowCol": tShadowCol,
            "--tShadow": tShadow
        })
        this.vnMgr.textAnims.forEach((anim, i) => {
            let t = textArr[i];
            anim.data = {
                name: label ?? " ",
                text: t,
                anistyle: tAni
            };
            if (tPos) anim.data.pos = tPos;



        });
    }
    #autoGen(textArr) {
        if (this.vnMgr.cmdMgr) return;
        const isInterlude = this.#isInterlude(textArr)

        const { textAnims, options } = this.vnMgr;
        let { overwriteName, colorByText, hlCol, tCol, tShadowCol, tShadow } = options;

        $(`.contentWrapper`).css({
            "--tCol": tCol,
            "--hlCol": hlCol,
            "--tShadowCol": tShadowCol,
            "--tShadow": tShadow
        })

        // 간주 중인지 확인
        if (isInterlude) {
            // 간주 중일 때
            textAnims.forEach((anim, i) => {
                anim.data = this.#createInterludeData(i == 0);
            });
        } else {
            // 간주 중이 아닐 때
            const animStyle = "tAni-zoomInRight";
            textAnims.forEach((anim, i) => {
                let t = textArr[i];
                anim.data = this.#createAnimData(t, animStyle, overwriteName);
                if (colorByText) {
                    anim.followWrapperTheme = true;
                    const result = findColorByText(colorByText, t);
                    // console.log(result)
                    if (result) {
                        $(`.contentWrapper`).css({
                            "--hlCol": result[0],
                            "--tShadowCol": result[1]
                        })
                    }
                }
            });
        }
    }
    #onPlay(_n, o) {
        let { text, extendedLyrics } = o;
        let [jaPronunciation, korean] = extendedLyrics;
        let textArr = [text, jaPronunciation, korean];

        this.#autoGen(textArr);
        this.#cmdGen(textArr);
        this.vnMgr.updateAll();
    };
}
