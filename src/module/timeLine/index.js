import TimelinePlugin from "wavesurfer/plugins/timeline.esm.js";
import createElement from "wavesurfer/dom.js";
export { default as TimelineCfg } from "./cfg.js";
/**
 * remake for Coloring labels
 * @method initTimeline
 * @memberof TimelinePlugin
 * @returns {void}
 */
TimelinePlugin.prototype.initTimeline = function () {
    /**
     * Set the total duration of the timeline. 
     * If there is an `WaveSurfer` object, use the duration of the object,
     * Otherwise, use the duration set in the option.
     * @type {number}
     */
    const duration = this.wavesurfer?.getDuration() ?? this.options.duration ?? 0;

    /**
     * Calculate the number of pixels per second.
     * @type {number}
     */
    const pxPerSec =
        (this.wavesurfer?.getWrapper().scrollWidth ||
            this.timelineWrapper.scrollWidth) / duration;

    /**
     * Set the time interval. By default, use the values ​​provided in the options
     * If not provided, calculate the basic time interval.
     * @type {number}
     */
    const timeInterval =
        this.options.timeInterval ?? this.defaultTimeInterval(pxPerSec);

    /**
     * Set the gap between the default label. The default value is provided in the options
     * if it is not provided Calculate the default interval.
     * @type {number}
     */
    const primaryLabelInterval =
        this.options.primaryLabelInterval ??
        this.defaultPrimaryLabelInterval(pxPerSec);

    /**
     * Set the interval between the default label.
     * @type {number}
     */
    const primaryLabelSpacing = this.options.primaryLabelSpacing;

    /**
     * Set the spacing of the auxiliary label.The default value is provided in the options
     * if it is not provided Calculate the basic auxiliary interval.
     * @type {number}
     */
    const secondaryLabelInterval =
        this.options.secondaryLabelInterval ??
        this.defaultSecondaryLabelInterval(pxPerSec);

    /**
     * Set the interval between the auxiliary labels.
     * @type {number}
     */
    const secondaryLabelSpacing = this.options.secondaryLabelSpacing;

    /**
     * Determine the location to insert the timeline.
     * @type {boolean}
     */
    const isTop = this.options.insertPosition === "beforebegin";

    const timelineStyle = {
        height: `${this.options.height}px`,
        overflow: "hidden",
        fontSize: `${this.options.height / 2}px`,
        whiteSpace: "nowrap",
        ...(isTop
            ? {
                position: "absolute",
                top: "0",
                left: "0",
                right: "0",
                zIndex: "3",
            }
            : {
                position: "relative",
            }),
    }
    /**
     * Create a DIV element representing the timeline.
     * @type {HTMLDivElement}
     */
    const timeline = createElement("div", {
        style: timelineStyle
    });

    // Apply style and properties to the timeline elements.
    timeline.setAttribute("part", "timeline");

    if (typeof this.options.style === "string") {
        timeline.setAttribute(
            "style",
            timeline.getAttribute("style") + this.options.style
        );
    } else if (typeof this.options.style === "object") {
        Object.assign(timeline.style, this.options.style);
    }

    const notchStyle = {
        width: "0",
        height: "50%",
        display: "flex",
        flexDirection: "column",
        justifyContent: isTop ? "flex-start" : "flex-end",
        top: isTop ? "0" : "auto",
        bottom: isTop ? "auto" : "0",
        overflow: "visible",
        opacity: `${this.options.secondaryLabelOpacity ?? 0.25}`,
        position: "absolute",
        zIndex: "3",
    };

    /**
     * Create a DIV element that creates the scale to display in the timeline.
     * @type {HTMLDivElement}
     */
    const notchEl = createElement("div", {
        style: notchStyle
    });

    // Add time label and scale to the timeline.
    for (let i = 0, notches = 0; i < duration; i += timeInterval, notches++) {
        const notch = notchEl.cloneNode();

        // determine whether the Primary label and the Secondary label are available.
        const isPrimary =
            (Math.round(i * 100) / 100) % primaryLabelInterval === 0 ||
            (primaryLabelSpacing && notches % primaryLabelSpacing === 0);
        const isSecondary =
            (Math.round(i * 100) / 100) % secondaryLabelInterval === 0 ||
            (secondaryLabelSpacing && notches % secondaryLabelSpacing === 0);

        // Set the height of the scale, text and style.
        if (isPrimary || isSecondary) {
            notch.style.height = "100%";
            notch.style.textIndent = "3px";
            notch.textContent = this.options.formatTimeCallback(i);

            if (isPrimary) {
                notch.style.opacity = "1";
            }
        }

        if (isSecondary && this.options.primaryLabelColor) {
            notch.style.color = this.options.primaryLabelColor;
            notch.style.borderLeft = `1px solid ${this.options.primaryLabelColor}`;
        }

        if (!isSecondary && this.options.secondaryLabelColor) {
            notch.style.color = this.options.secondaryLabelColor;
            notch.style.borderLeft = `1px solid ${this.options.secondaryLabelColor}`;
        }

        // Set the type of scale and add that property.
        const mode = isPrimary ? "primary" : isSecondary ? "secondary" : "tick";
        notch.setAttribute("part", `timeline-notch timeline-notch-${mode}`);

        // Set the position of the scale.
        const offset = i * pxPerSec;
        notch.style.left = `${offset}px`;
        this.virtualAppend(offset, timeline, notch);
    }
    this.timelineWrapper.innerHTML = "";
    this.timelineWrapper.appendChild(timeline);

    // emitting ready event when it's done.
    this.emit("ready");
};
export { TimelinePlugin };