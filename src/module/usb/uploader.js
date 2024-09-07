import { EventEmitter } from "../util/index.js";

export default class FileUploader extends EventEmitter {
    /**
     * @param {Object} options 
    */
    constructor(options) {
        super();
        this.dropZone = null;
        this.fileInput = null;
        this.supportExtensions = [".mp3", ".wav", ".ogg", ".flac", ".aac", ".m4a"];
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
    init(dropZone, fileInput) {
        // setting elements to properties.
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
            const result = this.handleFileUpload.call(this, e);
            this.emit('fileDrop', result, this.side);
            if (this.onUpload) this.onUpload(result, this.side);
        }, { passive: false });
        this.fileInput.addEventListener("change", e => {
            const result = this.handleFileUpload.call(this, e);
            this.emit('fileInputChange', result, this.side);
            if (this.onUpload) this.onUpload(result, this.side);
        }, { passive: false });
    }
    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        this.dropZone.style.backgroundColor = this.colorSettings.dragover;
        this.emit('dragOver', event); // Emit dragOver event
    }

    handleDragLeave() {
        this.dropZone.style.backgroundColor = this.colorSettings.dragleave;
        this.emit('dragLeave'); // Emit dragLeave event
    }
    isAudioFile(fileName) {
        return this.supportExtensions.some((extension) =>
            fileName.toLowerCase().endsWith(extension)
        );
    }
    handleFileUpload(event) {
        event.preventDefault();
        event.stopPropagation();
        this.dropZone.style.backgroundColor = this.colorSettings.fileupload;
        let files = [];
        let dirs = [];

        if (event.type === "drop") {
            const items = event.dataTransfer.items;

            for (let i = 0; i < items.length; i++) {
                const item = items[i].webkitGetAsEntry();
                if (item) {
                    if (item.isDirectory) {
                        dirs.push(item);
                    } else if (this.isAudioFile(item.name)) {
                        files.push(item);
                    }
                }
            }
        } else if (event.type === "change") {
            files = Array.from(event.target.files).filter((file) =>
                this.isAudioFile(file.name)
            );
        }

        return { files, dirs }
    }
}