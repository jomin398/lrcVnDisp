import TextEffect from "../../textEffect/index.js";
import CmdMgr from "../cmdMgr/index.js";
import { isJQuery } from "../util/index.js";

import { main as mainOpt } from "./cfgs.js";

/**
 * @typedef {{name:?String,text:String,anistyle:?String,autoShow:?Boolean,pos:"tl",tShadowCol:"#eb6864",hlCol:"#ff0900bf"}} dialog
 */

/**
 * @typedef {dialog[]} dialogs
 */

export class TextRenderer {
    /**
     * 
     * @param {import("jquery")|String} el
     * @param {mainOpt} options
     */
    constructor(el, options) {
        // If the element is not a jquery Object, select element by selector string
        if (!isJQuery(el) && typeof el === "string") el = $(el);

        /**
         * @type {import("jquery")}
         */
        this.el = el;
        /**
         * @type {dialog}
         */
        this.data = {};
        this.length = 0;
        let { dialogs, textApprochDelay, hlApDelay, hlDelay, hlCol, tShadowCol, tEffect, cmdMgr } = options;
        this.textApprochDelay = textApprochDelay;
        this.hlApDelay = hlApDelay ?? 50;
        this.hlDelay = hlDelay;
        this.hlCol = hlCol;
        this.tShadowCol = tShadowCol;
        this.timers = [];
        this.isPlaying = false;
        this.dialogs = dialogs;
        this.prevText = null;
        this.prevTextClass = null;
        /** @type {TextEffect} */
        this.textEffect = tEffect;

        this.followWrapperTheme = false;
        /**
         * @type {?CmdMgr}
         */
        this.cmdMgr = cmdMgr ?? null;
        this.isCmdMode = cmdMgr != null ? true : false ?? false;
        if (!options.lrcPath && options.textVnMode) this.el.parent().on('click', () => {
            this.play();
        });
    }

    lineIndex = 0;
    static init(...args) {
        return new TextRenderer(...args);
    }

    version = "0.0.1"
    isStop() {
        return !this.isPlaying;
    }

    stop() {
        this.isPlaying = false;
        this.stopTimer();
        this.el.find('span').show().removeAttr('class');
    }

    stopTimer() {
        for (var i = 0; i < this.length; i++) {
            if (this.timers[i]) {
                clearTimeout(this.timers[i]);
                this.timers[i] = null;
            }
        }
    }
    applyTextPos(textWrapElm, pos) {
        textWrapElm.removeClass(function (index, className) {
            return (className.match(/(^|\s)pos-\S+/g) || []).join(' ');
        });
        //re-add pos Class
        textWrapElm.addClass(`pos-${pos}`);
    }
    splitText(data) {
        var ret = '';
        for (var i = 0, len = data.length; i < len; i++) {

            var char = data[i];
            let isNewline = char === '\n';
            if (char === ' ') {
                char = '&nbsp;';
            }

            if (isNewline) {
                char = '<br>';
            }
            ret += isNewline ? char : `<span class="${"char" + i}">${char}</span>`;
        }
        return ret;
    }
    #applyTextEffect = () => { };
    async initTextEffect() {
        const effectCfg = this.isCmdMode ? this.cmdMgr.currentLine.tEffect : this.textEffect;
        if (effectCfg === null) return;
        if (this.textEffect != null) return;
        this.textEffect = new TextEffect(effectCfg);
        if (this.textEffect.inited) return;
        this.textEffect.init()
        this.#applyTextEffect =(e)=> this.textEffect.applyEffect(e);
    }
    show() {
        if (this.dialogs) this.data = this.dialogs[this.lineIndex];
        if (!this.data || this.isPlaying) return;
        let textElm = this.el;
        const textWrapElm = textElm.parent();
        let pos = "tl";

        let tSpeed = this.textApprochDelay;

        // this.cmdMgr
        if (!this.isCmdMode) {
            tSpeed = this.textApprochDelay;
            pos = this.data.pos;
        } else {
            let line = this.cmdMgr.currentLine;
            tSpeed = line.tSpeed;
            pos = (line.tPos == "default" ? "tl" : line.tPos) ?? "tl";
        }
        this.applyTextPos(textWrapElm, pos)
        if (this.data.text == this.prevText) return;


        this.length = this.data.text.length;
        this.stopTimer();


        this.isPlaying = true;
        this.prevText = this.data.text;
        textElm.html(this.splitText(this.data.text));

        const spanElements = textElm.find('span');
        spanElements.hide();
        this.initTextEffect()
        // 캐싱된 요소들을 활용해 반복작업을 최적화
        for (let i = 0; i < this.length; i++) {
            this.showChar(i, spanElements.eq(i), textElm);
        }
        textWrapElm.parent().find(".name")?.html(this.data.name);
        textWrapElm.parent().parent().find(".name")?.html(this.data.name);


        // 애니메이션이 끝나고 스타일 제거
        setTimeout(() => {
            this.stop();
            //spanElements.css("text-shadow", "unset");
            if (this.lineIndex) this.lineIndex++
        }, tSpeed + (tSpeed / 10) * this.length);
    }
    showChar(i, charElement) {
        let tSpeed = this.textApprochDelay;
        let anistyle = this.data.anistyle ?? "zoomInRight";
        if (this.isCmdMode) {
            let line = this.cmdMgr.currentLine;
            tSpeed = line.tSpeed ?? tSpeed;
            anistyle = line.tAni; //rotateInUpLeft
        }
        const animDuration = tSpeed / 1000 + 's'; //seconds
        const delay = i * (tSpeed / 10); // milliseconds
        charElement.css("text-shadow", "2px 2px 2px var(--tShadowCol)");

        this.#applyTextEffect(charElement);


        this.timers[i] = setTimeout(() => {
            charElement.css({
                "display": "inline-block",
                "animation-duration": animDuration,
            }).addClass(`tAni-${anistyle}`);
            this.timers[i] = null;
        }, delay);
    }

}
/**
 * @param {Array} textAnims 
 * @param {import("jquery")} element JQueryElement
 * @param {Object} options 
 */
export function addArrTextRenderer(textAnims, element, options) {
    textAnims.push(TextRenderer.init(element, options));
}
