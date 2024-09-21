import { default as HoverPlugin } from "wavesurfer/plugins/hover.esm.js";
import WaveSurfer from "wavesurfer.js";
import { TimelinePlugin, TimelineCfg } from "./module/timeLine/index.js";

import { HoverPluginCfg, WaveSurferCfg } from "./configs.js";
export async function initWavesurfer(audioPath) {
    const timelinePlugin = TimelinePlugin.create(TimelineCfg);
    const customSetting = {
        container: "#waveform",
        plugins: [
            timelinePlugin,
            // HoverPlugin.create(HoverPluginCfg)
        ],
        url: audioPath instanceof String ? audioPath : URL.createObjectURL(audioPath),
    }
    const ws = WaveSurfer.create({ ...WaveSurferCfg, ...customSetting });
    return ws;
}
