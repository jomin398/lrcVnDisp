export default class BackGroundMgr {
    constructor(selector, images) {
        this.container = typeof selector === "string" ? $(selector) : selector;
        this.prev = null;
        /** @type {CmdMgr.currentLine} */
        this.cmd = null;
        this.images = images;
    }
    bgiSearch(search, filelist) {
        let r = filelist.filter(file => file.name.includes(search))[0];
        if (r) r = URL.createObjectURL(r);
        return r;
    }
    update() {
        let { aniName, src } = this.cmd.bg;
        if (this.prev === this.cmd.bg) return;

        if (aniName === "null" || src === "null") this.prev = null;
        if (!src) return;
        this.container.children("img.bg").remove();
        if (src == "null") return;

        let bgiSearchResult = this.bgiSearch(src, this.images);
        let bgElm = $(`<img  class="bg tAni-${aniName ?? "noAni"}" src="${bgiSearchResult ?? src}">`);
        this.container.append(bgElm);
        bgElm.css({
            "animation-duration": "0.5s",
        });
        bgElm.attr("alt", `bgiError: Cannot Load url:${src}`);
        this.prev = this.cmd.bg;
    }
}
