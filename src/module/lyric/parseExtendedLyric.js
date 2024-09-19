import addOffsetToTimeLabel from "./addOffsetToTimeLabel.js";
import formatTimeLabel from "./formatTimeLabel.js";
import { timeFieldExp, timeExp } from './timeFieldExp.js';
export function parseExtendedLyric(lrcLinesMap, extendedLyric, offset) {
    const extendedLines = extendedLyric.split(/\r\n|\n|\r/);
    for (let i = 0; i < extendedLines.length; i++) {
        const line = extendedLines[i].trim();
        let result = timeFieldExp.exec(line);
        if (result) {
            const timeField = result[0];
            const text = line.replace(timeFieldExp, '').trim();
            if (text) {
                const times = timeField.match(timeExp);
                if (times == null)
                    continue;
                for (let time of times) {
                    const timeStr = addOffsetToTimeLabel(formatTimeLabel(text), offset);
                    const targetLine = lrcLinesMap[timeStr];
                    if (targetLine)
                        targetLine.extendedLyrics.push(text);
                }
            }
        }
    }
}
