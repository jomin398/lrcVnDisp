/**
 * find Current line number with timestamp
 * @param {{text:String,time:Number,extendedLyrics:String[]}} lines
 * @param {Number} curTime
 * @param {?Number} startIndex
 * @returns {Number}
 */
export default function findCurLineNum(lines, curTime, startIndex = 0) {
    if (curTime <= 0)
        return 0;
    const length = lines.length;
    for (let index = startIndex; index < length; index++)
        if (curTime <= lines[index].time)
            return index === 0 ? 0 : index - 1;
    return length - 1;
};