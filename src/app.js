//project ref https://webvn.liriliri.io/

import FileUploader from "./module/usb/upload.js";
import VnDisp from "./module/vnDisp/index.js";

await new Promise(r => window.onload = () => r(1));

const dropZone_l = document.querySelector(".drop-zone._l");
const fileInput_l = document.getElementById("file-input_l");
const uploadModal_l = new bootstrap.Modal("#uploadModal_l");
const gitRibbon = $(".github-fork-ribbon");
uploadModal_l.show();
const fileUploader_l = new FileUploader({
    dropZone: dropZone_l,
    fileInput: fileInput_l,
    side: "left"
});
async function assetPreProc(assetManager) {
    // 알려진 이미지 파일 확장자
    const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff"];
    const imgFiles = imageExtensions.flatMap(ext => assetManager.filterFilesByExt(ext));

    // 알려진 오디오 파일 확장자
    const audioExtensions = [".mp3", ".wav", ".ogg", ".flac", ".aac", ".m4a"];
    const audioFiles = audioExtensions.flatMap(ext => assetManager.filterFilesByExt(ext));

    // 스크립트 파일 찾기
    const lrcFile = assetManager.allFiles.filter(file => file.name.endsWith(".lrc") && !file.name.includes("cmd"))[0];
    const cmdFile = assetManager.allFiles.filter(file => file.name.endsWith(".lrc") && file.name.includes("cmd"))[0];
    const styleFiles = assetManager.allFiles.filter(file => file.name.endsWith(".css"));
    const jsonFile = assetManager.allFiles.filter(file => file.name.endsWith(".json"))[0];
    const assets = {
        images: imgFiles,
        dialogs: [lrcFile, jsonFile].filter(Boolean),
        cmd: cmdFile,
        audios: audioFiles,
        styles: styleFiles
    };
    return { assets, assetManager };
}
const onload = async ({ assets, assetManager }) => {
    const vn = VnDisp.create({
        assets, assetManager
    });
    await vn.init();

}
const uploadHandler = async () => {
    const assets = await assetPreProc(fileUploader_l); // assetPreProc 호출
    uploadModal_l.hide();
    gitRibbon.hide();
    await onload(assets); // onload 호출
};
// 이벤트 리스너 등록
fileUploader_l.on("fileDrop", uploadHandler);
fileUploader_l.on("fileInputChange", uploadHandler);
