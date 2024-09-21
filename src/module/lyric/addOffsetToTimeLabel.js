
export default function addOffsetToTimeLabel(label, offset, preventNegTime) {
    // 분, 초, 밀리초를 분리
    const [minutes, secondsWithMilliseconds] = label.split(":");
    const [seconds, milliseconds = "0"] = secondsWithMilliseconds.split(".");

    // 총 밀리초 계산
    let totalMilliseconds = Number(minutes) * 60 * 1000 +
        Number(seconds) * 1000 +
        Number(milliseconds.padEnd(3, "0"));
    if (totalMilliseconds + offset < 0 && preventNegTime) { return null; };
    // 오프셋 적용 후 음수가 되지 않도록 보정
    totalMilliseconds = Math.max(0, totalMilliseconds + offset);

    // 새로운 분, 초, 밀리초 계산
    const newMinutes = Math.floor(totalMilliseconds / 60000);
    const newSeconds = Math.floor((totalMilliseconds % 60000) / 1000);
    const newMilliseconds = totalMilliseconds % 1000;

    // 최종 결과 문자열 생성
    const resultTimeStamp = `${String(newMinutes).padStart(2, "0")}:${String(newSeconds).padStart(2, "0")}.${String(newMilliseconds).padStart(3, "0")}`;
    return resultTimeStamp;
}
