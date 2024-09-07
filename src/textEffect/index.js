/** 
 * @typedef {Object} defaultOptions
 * @prop {String} e effect Name
 * @prop {Number} c effect Count on each char.
 * @prop {CSSStyleDeclaration} s css style.
 * @prop {String[]} styleFiles css files
 * @prop {String} baseUrl base URL
*/

import sakuraFall from "./sakura/index.js";


const defaultOptions = {
    "e": "sakura",
    "c": 2,
    "s": {
        "top": "5px"
    },
    "styleFiles": ["sakura.css"],
    "baseUrl": "./src/textEffect/"
};
export default class TextEffect {
    /**
     * 
     * @param {defaultOptions|String} options 
     */
    constructor(options) {
        if (typeof options === "string") options = this.lineParse(options);
        /**
         * 
         * @type {defaultOptions} options 
         */
        this.options = { ...defaultOptions, ...options };
        this.inited = false;
    }
    #appendStyleToHead() {
        // console.log(this.options.styleFiles);
        this.options.styleFiles.map(url => {
            url = url ? `${this.options.baseUrl}${this.options.e}/${url}` : null;

            let elm = document.head.querySelector(`link[rel="stylesheet"][href="${url}"]`);
            if (url && !elm) $("head").append(`<link rel="stylesheet" href="${url}"/>`);
        })
    }
    lineParse(string) {
        return JSON.parse(string);
    }

    get effectElem() {
        let elm = "";
        if (this.options.e == "sakura") elm = sakuraFall(this.options);
        return elm;
    }
    init() {
        if (this.inited) return;


        this.#appendStyleToHead();

        this.inited = true;
        return true;
    }
    applyEffect(charElement) {
        if (!this.inited) return;
        charElement.append(this.effectElem);
    }
}