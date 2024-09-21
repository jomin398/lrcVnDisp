export { default as isJQuery } from "./isJQ.js";
export { default as EventEmitter } from "./event-emitter.js";
export { default as fileReadText } from "./fileReadText.js";
export { default as formAwaiter } from "./formAwaiter.js";
export function findColorByText(obj, str) {
    // 문자열에서 ':' 이전의 부분을 추출
    const key = str.split(':')[0] + ':'; // ':' 포함

    // 객체에서 해당 키와 일치하는 값 찾기
    if (obj[key]) {
        return obj[key];
    }

    return null; // 일치하는 키가 없을 경우 null 반환
}
/**
 * add Event subscriptions
 * @param {Array} subscriptions 
 * @param {EventEmitter} emitter 
 * @param {String} eventName 
 * @param {CallableFunction} handler 
 */
export function addEventSubscribe(subscriptions, emitter, eventName, handler) {
    if (typeof emitter != 'object' && !emitter instanceof EventEmitter) throw new TypeError('subscriptions must be an instance of EventEmitter');
    const subscription = emitter.on(eventName, handler);
    subscriptions.push(subscription);
}