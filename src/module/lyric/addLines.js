export class AddLines {
    constructor(parent) {
        this.parent = parent;
    }

    /**
     * process the lyric lines
     * @param {String} e text
     * @param {{time:Number,text:String,extendedLyrics:{time:Number,text:String}[]}[]} t linesMap
     * @param {String[]} r timeArr
     * @returns {({ time: Number; text: String; avr: Number; extendedLyrics: {time:Number,text:String}[]; } | { time: String; text: Number; extendedLyrics: {time:Number,text:String}[]; avr: undefined; })}
     */
    initLine(e, t, r) {
        /**
         * milliseconds to timestamp.
         * @type {Number}
         */
        let a = 60 * parseInt(r[0]) * 60 * 1e3 + 60 * parseInt(r[1]) * 1e3 + 1e3 * parseInt(r[2]) + parseInt(r[3] || "0");
        if (this.parent.spTagMgr.supports) {
            const { text: r, avr: s, approchs } = this.parent.spTagMgr.avrAndText({ text: e, time: a, linesMap: t });
            return { time: a, text: r, avr: s, extendedLyrics: [], approchs };
        }
        return { time: a, text: e, extendedLyrics: [] };
    }
}