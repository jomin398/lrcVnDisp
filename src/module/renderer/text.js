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
        /** @type {Boolean} 기존 택스트에 추가여부 */
        this.allowAppendText = false;
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
        this.#applyTextEffect = (e) => this.textEffect.applyEffect(e);
    }
    show() {
        if (this.dialogs) this.data = this.dialogs[this.lineIndex];
        if (!this.data || this.isPlaying) return;
        let textElm = this.el;
        const textWrapElm = textElm.parent();
        let pos = "tl";
        let tSpeed = this.textApprochDelay;
        let isAllowAppending = this.allowAppendText;
        if (!this.isCmdMode) {
            tSpeed = this.textApprochDelay;
            pos = this.data.pos;
        } else {
            let line = this.cmdMgr.currentLine;
            tSpeed = line.tSpeed;
            pos = (line.tPos == "default" ? "tl" : line.tPos) ?? "tl";
            isAllowAppending = line.tAppend ?? false;
        }

        this.applyTextPos(textWrapElm, pos);
        const newText = this.data.text;
        if (newText === this.prevText) return;
        this.length = newText.length;
        this.stopTimer();
        this.isPlaying = true;
        this.prevText = newText;
        // 대화 이름 표시
        this.updateNameDisplay(textWrapElm);
        if (isAllowAppending) { this.appendText(textElm, newText) } else this.replaceText(textElm, newText);
        setTimeout(() => {
            this.stop();
            if (this.lineIndex) this.lineIndex++;
        }, tSpeed + (tSpeed / 10) * this.length);
    }
    appendText(textElm, newText) {
        const existingSpans = textElm.find('span');
        const existingLength = existingSpans.length;

        textElm.html(textElm.html() + this.splitText(" " + newText));

        existingSpans.hide();
        const newSpans = textElm.find('span').slice(existingLength);
        this.animateText(newSpans, textElm);
    };
    // 전체 텍스트를 새로 교체
    replaceText(textElm, newText) {
        textElm.html(this.splitText(newText));
        const spanElements = textElm.find('span');
        this.animateText(spanElements, textElm);
    }
    animateText(spans, textElm) {
        this.initTextEffect();
        spans.hide();
        spans.each((index, el) => {
            this.showChar(index, $(el), textElm);
        });
    };

    updateNameDisplay(textWrapElm) {
        const nameElement = textWrapElm.parent().find(".name");
        const parentNameElement = textWrapElm.parent().parent().find(".name");

        if (nameElement.length) nameElement.html(this.data.name);
        if (parentNameElement.length) parentNameElement.html(this.data.name);
    }
    showChar(i, charElement) {
        let tSpeed = this.textApprochDelay;
        let anistyle = this.data.anistyle ?? "zoomInRight";
        let tShadow = this.data.tShadow ?? "2px 2px 2px var(--tShadowCol)";
        if (this.isCmdMode) {
            let line = this.cmdMgr.currentLine;
            tSpeed = line.tSpeed ?? tSpeed;
            anistyle = line.tAni; //rotateInUpLeft
            tShadow = line.tShadow;
        }
        const animDuration = tSpeed / 1000 + 's'; //seconds
        const delay = i * (tSpeed / 10); // milliseconds
        charElement.css("text-shadow", tShadow);
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
