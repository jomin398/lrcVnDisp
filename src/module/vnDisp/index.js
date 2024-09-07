import { main as mainOpt } from "../renderer/cfgs.js";
import { addArrTextRenderer, TextRenderer } from "../renderer/text.js";
import { LyricVn } from "../lrcVn/index.js";
import { initWavesurfer } from "../../initWavesurfer.js";
import { addEventSubscribe } from "../util/index.js";
import { default as CmdMgr } from "../cmdMgr/index.js";


function getjsonFile(scripts) {
    return scripts.filter(file => file.name.endsWith(".json"))[0];
}
function getLrcFile(scripts) {
    return scripts.filter(file => file.name.endsWith(".lrc"))[0];
}
export default class VnDisp {
    /** 
     * @param {mainOpt} options  
    */
    constructor(options) {
        this.options = { ...mainOpt, ...options };
        this.container = $(this.options.container);

        if (this.container.length === 0) {
            $("body").append(this.options.defaultTpl);
            this.container = $(this.options.container);
        }
        this.wavesurfer = null;
        /** @type {?TextRenderer[]} */
        this.textAnims = null;
        /** @type {?LyricVn} */
        this.lyricMgr = null;
        this.cmdMgr = null;
        /** @type {?Boolean} toggle to bind onclick on dialog box */
        this.textVnMode = false;
        window.vn = this;
    }

    updateAll() {
        this.textAnims.forEach(e => e.show());
    }
    get assets() {
        return this.options.assets;
    }
    get assetMgr() {
        return this.options.assetManager;
    }
    async init() {
        this.textAnims = [];
        //console.log(this.options.assets);

        if (this.assets.cmd) {
            this.cmdMgr = new CmdMgr({ ...this.options, isCmdLine: true, vnDisp: this, offset: 0 });
            const cmds = this.assets.cmd instanceof String ? await (await fetch(this.assets.cmd)).text() : await this.assets.cmd.text();
            this.cmdMgr.setLyric(cmds);
        }
        if (this.assets.styles) {
            this.assets.styles.map(cssFile => {
                $("head").append(`<link rel="stylesheet" href="${cssFile instanceof String ? cssFile : URL.createObjectURL(cssFile)}"/>`);
            })
        }
        let jsonFile = getjsonFile(this.assets.dialogs);
        let lrcFile = getLrcFile(this.assets.dialogs);
        if (jsonFile && !lrcFile) {
            this.textVnMode = true;
            this.options.dialogs = JSON.parse(jsonFile instanceof String ? await (await fetch(jsonFile)).text() : await jsonFile.text());
            addArrTextRenderer(this.textAnims, $("#dialog .content .text"), { ...this.options, cmdMgr: this.cmdMgr, textVnMode: this.textVnMode });
            this.play = () => this.updateAll();
        } else if (lrcFile) await this.initLyrics(lrcFile);

        await this.initAudio();

        this.syncAudioWithLyrics();
        return 1;
    }

    #setupLyricContainers(textAnims, options) {
        $(".contentWrapper :nth-child(1)").remove();
        ["ja", "japohy", "kor"].forEach((lang, i) => {
            const contentHtml = `
                <div id="${lang}" class="content d-flex w-100 align-items-center">
                    <div class="text"></div>
                </div>`;
            $("#dialog .contentWrapper").append(contentHtml).find(".content").css("border-radius", "unset");

            addArrTextRenderer(textAnims, $(`#dialog .content#${lang} .text`), { ...options, cmdMgr: this.cmdMgr });
        });
    }
    async initLyrics(file) {
        this.textVnMode = false;
        this.lyricMgr = new LyricVn({ isRemoveBlankLine: false, vnMgr: this, offset: 0 });
        if (!this.lyricMgr.lines.length) {
            const lyrics = file instanceof String ? await (await fetch(file)).text() : await file.text();
            this.lyricMgr.setLyric(lyrics);

            if (this.options.nameAllowLrcArtist) {
                this.options.overwriteName = this.lyricMgr.tags.artist;
            }
            this.#setupLyricContainers(this.textAnims, this.options);
        }
    }

    async initAudio() {
        if (this.assets.audios) {
            this.wavesurfer = await initWavesurfer(this.assets.audios[0]);
            this.play = () => this.wavesurfer.play();
            this.pause = () => this.wavesurfer.pause();
            this.wavesurfer.on('interaction', this.play);
        }
    }

    syncAudioWithLyrics() {
        if (this.wavesurfer && this.lyricMgr) {
            addEventSubscribe(
                this.wavesurfer.subscriptions,
                this.wavesurfer.timer,
                'tick',
                () => {
                    if (!this.wavesurfer.isSeeking()) {
                        let currentTime = this.wavesurfer.getCurrentTime() * 1e3;
                        if (this.cmdMgr) this.cmdMgr._refresh(currentTime);
                        this.lyricMgr._refresh(currentTime);
                    }
                }
            );

            this.play = () => {
                if (!this.lyricMgr.lines.length) return;
                this.wavesurfer.play();
            };
        }
    }

    /** @param {mainOpt} options  */
    static create(options) {
        return new VnDisp(options);
    }
    /** @type {function():void} a placeholder function fires onplay*/
    play() { };
    /** @type {function():void} a placeholder function fires onpause*/
    pause() { }
}
