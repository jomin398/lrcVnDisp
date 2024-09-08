export default function parseCmd(string) {
    // bg 함수 인자 추출
    const bgRegex = /bg\("([^"]*)",?([^)]*)\)/g;
    const bgMatches = [...string.matchAll(bgRegex)].map((match) => [
        match[1],
        match[2] ? match[2].trim().replace(/"/g, "") : null,
    ]);

    // tEffect 함수 인자 추출 (수정된 부분)
    const tEffectRegex = /tEffect\(({.*\})\)/g;
    const tEffectMatches = [...string.matchAll(tEffectRegex)]
        .map((m) => JSON.parse(m[1]))
        ?.pop();
    
    // tAni, tShadowCol, tHlCol, tCol, tPos, label 추출
    const singleArgFunctions = ["tAni", "tShadowCol", "tHlCol", "tCol", "tPos", "label", "tSpeed", "bgCol"];
    const singleArgMatches = {};

    singleArgFunctions.forEach((func) => {
        const regex = new RegExp(`${func}\\("([^"]*)"\\)`, "g");
        singleArgMatches[func] = [...string.matchAll(regex)].map(
            (match) => match[1]
        ).pop();
    });
    return {
        bg: {
            src: bgMatches[0] ? bgMatches[0][0] : null,
            aniName: bgMatches[0] ? bgMatches[0][1] : null,
        },
        tEffect: {
            ...(tEffectMatches ? Object.fromEntries(Object.entries(tEffectMatches)) : {})
        } || null,
        ...singleArgMatches,
    };
}
