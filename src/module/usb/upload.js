import { EventEmitter } from "../util/index.js";
import JSZip from "jszip";
export default class FileUploader extends EventEmitter {
    constructor(options) {
        super();
        this.dropZone = null;
        this.fileInput = null;
        /**
         * @type {File[]} 모든 업로드된 파일을 저장하는 배열
         */
        this.allFiles = [];
        const { dropZone, fileInput, onUpload } = options;
        this.side = options.side || "left";
        this.init(dropZone, fileInput);
        this.onUpload = onUpload ?? void 0;
    }

    colorSettings = {
        dragover: "#f0f0f0",
        dragleave: "#fff",
        fileupload: "#fff"
    }
    async handleZipFile(zipFile) {
        const zip = await JSZip.loadAsync(zipFile);
        const zipFiles = [];

        await Promise.all(
            Object.keys(zip.files).map(async (filename) => {
                const file = zip.files[filename];
                if (!file.dir) {
                    const fileData = await file.async("blob");
                    const fileObj = new File([fileData], filename);
                    zipFiles.push(fileObj);
                }
            })
        );

        return zipFiles;
    }
    init(dropZone, fileInput) {
        const properties = ['dropZone', 'fileInput'];
        const elements = [dropZone, fileInput];
        for (let i = 0; i < properties.length; i++) {
            if (typeof elements[i] === 'string' || (elements[i] instanceof HTMLDivElement || elements[i] instanceof HTMLInputElement)) {
                this[properties[i]] = typeof elements[i] === 'string' ?
                    document.querySelector(elements[i]) :
                    elements[i];
            }
        }

        this.dropZone.addEventListener("dragover", this.handleDragOver.bind(this), { passive: false });
        this.dropZone.addEventListener("dragleave", this.handleDragLeave.bind(this), { passive: false });
        this.dropZone.addEventListener("drop", e => {
            this.handleFileUpload(e).then(result => {
                this.emit('fileDrop', result, this.side);
                if (this.onUpload) this.onUpload(result, this.side);
            });
        }, { passive: false });

        this.fileInput.addEventListener("change", e => {
            this.handleFileUpload(e).then(result => {
                this.emit('fileInputChange', result, this.side);
                if (this.onUpload) this.onUpload(result, this.side);
            });
        }, { passive: false });
    }

    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        this.dropZone.style.backgroundColor = this.colorSettings.dragover;
        this.emit('dragOver', event);
    }

    handleDragLeave() {
        this.dropZone.style.backgroundColor = this.colorSettings.dragleave;
        this.emit('dragLeave');
    }

    /**
     * 디렉토리 내부 파일을 재귀적으로 탐색하는 함수
     */
    async readDirectory(entry) {
        let files = [];
        const reader = entry.createReader();

        return new Promise((resolve, reject) => {
            const readEntries = () => {
                reader.readEntries(async (entries) => {
                    if (entries.length === 0) {
                        resolve(files);
                    } else {
                        for (let entry of entries) {
                            if (entry.isDirectory) {
                                const subFiles = await this.readDirectory(entry);
                                files.push(...subFiles);
                            } else {
                                // File 객체로 변환
                                const file = await new Promise((resolve) => entry.file(resolve));
                                files.push(file);
                            }
                        }
                        readEntries(); // 재귀적으로 더 많은 파일이 있을 수 있으니 읽기
                    }
                }, reject);
            };
            readEntries();
        });
    }

    /**
     * 파일 또는 디렉토리 업로드 처리
     */
    async handleFileUpload(event) {
        event.preventDefault();
        event.stopPropagation();
        this.dropZone.style.backgroundColor = this.colorSettings.fileupload;

        let files = [];
        let dirs = [];

        if (event.type === "drop") {
            const items = event.dataTransfer.items;
            await Promise.all(Array.from(items).map(async item => {
                const entry = item.webkitGetAsEntry();
                if (entry.isDirectory) {
                    dirs.push(entry);
                    const dirFiles = await this.readDirectory(entry);
                    files.push(...dirFiles);
                } else if (entry.filesystem) {
                    const file = await new Promise((resolve) => entry.file(resolve));
                    if (file.name.endsWith(".zip")) {
                        const zipFiles = await this.handleZipFile(file);
                        files.push(...zipFiles);
                    } else {
                        files.push(file);
                    }
                }
            }));
        } else if (event.type === "change") {
            for (let file of Array.from(event.target.files)) {
                if (file.name.endsWith(".zip")) {
                    const zipFiles = await this.handleZipFile(file);
                    files.push(...zipFiles);
                } else {
                    files.push(file);
                }
            }
        }

        this.allFiles.push(...files); // 모든 파일을 allFiles에 추가

        return { files, dirs };
    }
    getFileByName(fileName) {
        return this.allFiles.find(file => file.name === fileName) || null;
    }
    filterFilesByExt(extension) {
        return this.allFiles.filter(file => file.name.endsWith(extension));
    }
}
