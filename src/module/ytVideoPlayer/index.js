import Timer from "wavesurfer/timer.js";
import { addEventSubscribe } from "../util/index.js";

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
    constructor(options) {
        this.cmdMgr = options.cmdMgr; this.lyricMgr = options.lyricMgr;
        this.player = null;
        this.timer = null;
        this.subscriptions = [];
    }
    initialize() {
        if (this.cmdMgr && this.cmdMgr.currentLine.ytVod && this.lyricMgr) {
            this.timer = new Timer();
            $(".backgroundWrap").append(
                `<video preload="auto" id="my-player" class="video-js"></video>`
            );
            const onready = () => {
                this.timer.start();
                $(".backgroundWrap").css({
                    "margin-bottom": `${$("#dialog").innerHeight()}px`,
                });
            };
            ytplayerOpt.sources[0].src = this.cmdMgr.currentLine.ytVod;
            this.player = videojs("my-player", ytplayerOpt);
            this.player.on("ready", onready);
            this.#addEventSubscribe(this.timer);
        }
    }

    #addEventSubscribe(timer) {
        addEventSubscribe(this.subscriptions, timer, 'tick', () => {
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
