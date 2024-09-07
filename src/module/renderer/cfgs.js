import { defaultTpl } from "../../template/wrapper.js";
import FileUploader from "../usb/upload.js";
/**
 * @typedef {{name:?String,text:String,anistyle:?String,autoShow:?Boolean,pos:"tl"}[]} dialogs
 */

export const main = {
    /**
     * @type {String}
     */
    container: '#vnDisp',
    defaultTpl,
    /**
     * @type {?dialogs}
     */
    dialogs: null,
    /**
     * @type {Number} Delay for text Approch
     */
    textApprochDelay: 300,
    /**
     * @type {Number} Delay for text HighLight Approch
     */
    hlApDelay: 50,
    /**
     * @type {?Number} Delay for text HighLight
     */
    hlDelay: 50,
    /**
     * @type {?String} a hex color String for HighLight.
     */
    hlCol: "#ffcff5",
    /**
     * @type {?String} a hex color String for text Shadow (text outline).
     */
    tShadowCol: "#bd0094",
    /**
    * @type {?String} a hex color String for text (text color).
    */
    tCol: "#ffffff",
    /** @type {?FileUploader} */
    assetManager: null,
    assets: {
        /** @type {?Array<String|File>} paths to load image files.*/
        images: null,
        /** @type {?Array<String|File>} paths to load script (lrc, json) files. */
        dialogs: null,
        /** @type {?Array<String|File>} paths to load audio files.*/
        audios: null,
        /** @type {?String|File} path to load cmd file. */
        cmd: null,
        /** @type {?Array<String|File>} paths to load css files.*/
        styles: null,
    },
    /** @type {?String} overwritten vn name label*/
    overwriteName: null,
    /** @type {?Boolean} Allow overwrite vn name label as LrcArtist */
    nameAllowLrcArtist: true,
    /** @type {?Object.<string,String[]>} coloring By Text [hilight,shadow] */
    colorByText: null,
    /** @type {?Object} text Effect */
    tEffect:null,
};