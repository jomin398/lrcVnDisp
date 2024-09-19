import { main as mainOpt } from "../renderer/cfgs.js";
import { addArrTextRenderer, TextRenderer } from "../renderer/text.js";
import { LyricVn } from "../lrcVn/index.js";
import { initWavesurfer } from "../../initWavesurfer.js";
import { addEventSubscribe } from "../util/index.js";
import { default as CmdMgr } from "../cmdMgr/index.js";
import WaveSurfer from "wavesurfer.js";
import { YTVideoPlayer } from "../ytVideoPlayer/index.js";
import BackGroundMgr from "../backGroundMgr/index.js";

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
        /** @type {?WaveSurfer} */
        this.wavesurfer = null;
        /** @type {?YTVideoPlayer} ytPlayer */
        this.ytPlayer = null;
        /** @type {?TextRenderer[]} */
        this.textAnims = null;
        /** @type {?LyricVn} */
        this.lyricMgr = null;
        /** @type {?CmdMgr} */
        this.cmdMgr = null;
        /** @type {?BackGroundMgr} */
        this.bgMgr = null;
        /** @type {?Boolean} toggle to bind onclick on dialog box */
        this.textVnMode = false;
        this.subscriptions = [];
        this.globalOffset = 0;
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
    get dialogElm() {
        return this.container.find("#dialog");
    }
    async init() {
        this.textAnims = [];
        this.bgMgr = new BackGroundMgr(".backgroundWrap", this.assets.images);
        if (this.assets.cmd) {
            this.cmdMgr = new CmdMgr({ ...this.options, isCmdLine: true, vnDisp: this, offset: 0 });
            const cmds = this.assets.cmd instanceof String ? await (await fetch(this.assets.cmd)).text() : await this.assets.cmd.text();
            this.cmdMgr.setLyric(cmds);
            if (this.cmdMgr.currentLine.lrcOff && this.cmdMgr.currentLine.lrcOff > 0) {
                this.globalOffset = this.cmdMgr.currentLine.lrcOff;
                this.cmdMgr = new CmdMgr({ ...this.options, isCmdLine: true, vnDisp: this, offset: this.globalOffset });
                this.cmdMgr.setLyric(cmds);
            }

            let hasBg = this.cmdMgr.lines.map(line => line.text.bg?.src).some(src => src !== null) ?? false;
            if (this.cmdMgr.currentLine.ytVod != null) hasBg = true;
            /*
            명령어에서 한번이라도 배경 이미지 사용하지 않으면 검은 화면이라 textbox 가 보이지 않음.
            그래서 noBg라고 class 를 붙여서 css 로 textbox 를 보이게 처리.
            */
            if (!hasBg) this.dialogElm.addClass("noBg");
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
        this.lyricMgr = new LyricVn({ isRemoveBlankLine: false, vnMgr: this, offset: this.globalOffset });
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
        // video mode false to add audio.
        if (!this.cmdMgr?.currentLine.ytVod && this.assets.audios && this.assets.audios.length) {
            this.wavesurfer = await initWavesurfer(this.assets.audios[0]);
            this.play = () => this.wavesurfer.play();
            this.pause = () => this.wavesurfer.pause();
            this.wavesurfer.on('interaction', this.play);
        }
    }
    tickCallback(currentTime) {
        if (this.cmdMgr) this.cmdMgr._refresh(currentTime);
        this.lyricMgr._refresh(currentTime);
    }
    syncAudioWithLyrics() {
        if (this.cmdMgr && this.lyricMgr && this.cmdMgr.initLine.text.lrcOff) {
            let offset = this.cmdMgr.currentLine.lrcOff ?? 0;
            this.lyricMgr.offset = offset;
            this.cmdMgr.offset = offset;
        }
        if (this.wavesurfer && this.lyricMgr) {
            addEventSubscribe(
                this.wavesurfer.subscriptions,
                this.wavesurfer.timer,
                'tick',
                () => {
                    if (!this.wavesurfer.isSeeking()) {
                        let currentTime = this.wavesurfer.getCurrentTime() * 1e3;
                        this.tickCallback(currentTime);
                    }
                }
            );

            this.play = () => {
                if (!this.lyricMgr.lines.length) return;
                this.wavesurfer.play();
            };
        } else if (this.cmdMgr && this.cmdMgr.currentLine.ytVod && this.lyricMgr) {
            this.ytPlayer = new YTVideoPlayer({ cmdMgr: this.cmdMgr, lyricMgr: this.lyricMgr });
            this.ytPlayer.tickCallback = this.tickCallback;
            this.ytPlayer.initialize();
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
