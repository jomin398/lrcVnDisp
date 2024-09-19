import addOffsetToTimeLabel from "./addOffsetToTimeLabel.js";
import formatTimeLabel from "./formatTimeLabel.js";
import { parseCmd } from "./parseCmd.js";
import { parseExtendedLyric } from "./parseExtendedLyric.js";
import { timeFieldExp, timeExp } from "./timeFieldExp.js";

export function lrclineParse(lyric, extendedLyrics, isRemoveBlankLine, isCmdLine, offset) {
    let lines = [];
    let maxLine = 0;
    const splitedLines = lyric.split(/\r\n|\n|\r/);
    const linesMap = {};
    const length = splitedLines.length;
    for (let i = 0; i < length; i++) {
        const line = splitedLines[i].trim();
        let result = timeFieldExp.exec(line);
        if (result) {
            const timeField = result[0];
            const text = line.replace(timeFieldExp, '').trim();
            if (text || !isRemoveBlankLine) {
                const times = timeField.match(timeExp);
                if (times == null)
                    continue;
                for (let time of times) {
                    const timeStr = addOffsetToTimeLabel(formatTimeLabel(time), offset);
                    if (linesMap[timeStr]) {
                        linesMap[timeStr].extendedLyrics.push(isCmdLine ? parseCmd(text) : text);
                        continue;
                    }
                    const timeArr = timeStr.split(':');
                    if (timeArr.length > 3)
                        continue;
                    else if (timeArr.length < 3)
                        for (let i = 3 - timeArr.length; i--;)
                            timeArr.unshift('0');
                    if (timeArr[2].includes('.'))
                        timeArr.splice(2, 1, ...timeArr[2].split('.'));
                    linesMap[timeStr] = {
                        time: parseInt(timeArr[0]) * 60 * 60 * 1000 + parseInt(timeArr[1]) * 60 * 1000 + parseInt(timeArr[2]) * 1000 + parseInt(timeArr[3] || '0'),
                        text: isCmdLine ? parseCmd(text) : text,
                        extendedLyrics: [],
                    };
                }
            }
        }
    }
    for (const lrc of extendedLyrics)
        parseExtendedLyric(linesMap, lrc, offset);
    lines = Object.values(linesMap);
    lines.sort((a, b) => {
        return a.time - b.time;
    });
    maxLine = lines.length - 1;
    return { lines, maxLine };
}
