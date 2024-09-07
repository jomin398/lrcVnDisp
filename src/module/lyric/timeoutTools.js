export const getNow = "object" == typeof performance && performance.now ? performance.now.bind(performance) : Date.now.bind(Date);
export const timeoutTools = {
    invokeTime: 0,
    animationFrameId: null,
    timeoutId: null,
    callback: null,
    thresholdTime: 200,
    run() {
        this.animationFrameId = window.requestAnimationFrame((() => {
            this.animationFrameId = null;
            let t = this.invokeTime - getNow();
            if (t > 0) return t < this.thresholdTime ? void this.run() : this.timeoutId = setTimeout((() => {
                this.timeoutId = null, this.run()
            }), t - this.thresholdTime);
            this.callback(t);
        }))
    },
    start(t = function(){}, i = 0) {
        this.callback = t;
        this.invokeTime = getNow() + i;
        this.run();
    },
    clear() {
        this.animationFrameId && (window.cancelAnimationFrame(this.animationFrameId),
            this.animationFrameId = null);
        this.timeoutId && (window.clearTimeout(this.timeoutId),
            this.timeoutId = null);
        this.callback = null
    }
};