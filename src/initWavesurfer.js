import { default as HoverPlugin } from "wavesurfer/plugins/hover.esm.js";
import { default as TimelinePlugin } from "wavesurfer/plugins/timeline.esm.js";
import WaveSurfer from "wavesurfer.js";
import { HoverPluginCfg, TimelineCfg, WaveSurferCfg } from "./configs.js";
export async function initWavesurfer(audioPath) {
    const timelinePlugin = TimelinePlugin.create(TimelineCfg);
    const customSetting = {
        container: "#waveform",
        plugins: [
            timelinePlugin,
            HoverPlugin.create(HoverPluginCfg)
        ],
        url: audioPath instanceof String ? audioPath : URL.createObjectURL(audioPath),
    }
    const ws = WaveSurfer.create({ ...WaveSurferCfg, ...customSetting });
    return ws;
}
