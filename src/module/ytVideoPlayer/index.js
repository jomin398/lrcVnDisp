import Timer from "wavesurfer/timer.js";
import { addEventSubscribe } from "../util/index.js";
import CmdMgr from "../cmdMgr/index.js";
import { LyricVn } from "../lrcVn/index.js";

export const ytplayerOpt = {
    controls: true,
    autoplay: false,
    loop: false,
    muted: false,
    fluid: false,
    bigPlayButton: false,
    techOrder: ["youtube"],
    sources: [
        {
            type: "video/youtube",
            src: null,
        },
    ],
};

export class YTVideoPlayer {
    /** @param {{cmdMgr: CmdMgr,lyricMgr:LyricVn}} options */
    constructor(options) {
        this.cmdMgr = options.cmdMgr;
        this.lyricMgr = options.lyricMgr;
        this.player = null;
        this.timer = null;
        this.subscriptions = [];
    }
    initialize() {
        if (this.cmdMgr && this.cmdMgr.currentLine.ytVod && this.lyricMgr) {
            this.timer = new Timer();
            this.lyricMgr.vnMgr.container.css("--dispWidth", "420px");
            $(".backgroundWrap").append(
                `<video preload="auto" id="my-player" class="video-js"></video>`
            );
            ytplayerOpt.sources[0].src = this.cmdMgr.currentLine.ytVod;
            this.player = videojs("my-player", ytplayerOpt);
            this.player.on("ready", this.onready.bind(this));
            this.player.on("play", this.onplay.bind(this));
            this.#addEventSubscribe(this.timer);
        }
    }
    get ytModule() {
        return this.player.tech_.ytPlayer;
    }
    disableCC() {
        try {
            Array.from(this.player.textTracks()).filter(({ kind }) => !['chapters', 'metadata'].includes(kind)).forEach((track) => track.mode = "disabled")
            this.player.getCache().selectedLanguage = { enabled: false };
            this.ytModule.unloadModule("captions");
            this.ytModule.unloadModule("cc");
        } catch (_e) { }
    }
    onready() {
        this.timer.start();
        setTimeout(() => {
            const space = this.player.tech_.ytPlayer.playerInfo.videoContentRect.left;
            $("#dialog").css({
                bottom: "2em",
                margin: `0 ${space}px`,
            });
            this.disableCC();
        }, 1000);
    }
    onplay() {
        this.disableCC();
    }
    #addEventSubscribe(timer) {
        addEventSubscribe(this.subscriptions, timer, "tick", () => {
            if (!this.player.seeking()) {
                let currentTime = this.player.currentTime() * 1e3;
                this.tickCallback(currentTime);
            }
        });
    }

    tickCallback(currentTime) {
        // Implement the logic for tick callback here
        console.log(`Current time: ${currentTime}`);
    }
}
