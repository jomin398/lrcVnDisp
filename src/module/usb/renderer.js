
import { EventEmitter } from '../util/index.js';
import { createFileListItem, createDirectoryDetails, createHeader, sideLoadOverlay } from './templates.js';

export default class FileRenderer extends EventEmitter {
    /**
     * @param {Object} opt
     * @param {HTMLDivElement} opt.fileTree div to display folder structures
     * @param {function(File,Event,HTMLDivElement,String,Object,String):void} opt.onItmClick a callback to be called when the songItem is clicked
     * @param {function(File,Event,HTMLDivElement,String,Object,String):void} opt.onLeft a callback to be called when the overlay left button is clicked
     * @param {function(File,Event,HTMLDivElement,String,Object,String):void} opt.onRight a callback to be called when the overlay right button is clicked
     */
    constructor(opt) {
        super(); // Extend EventEmitter
        const { fileTree } = opt;
        let { onLeft, onRight, onItmClick } = opt;
        let noop = () => { };
        this.fileTree = fileTree;
        this.onItmClick = onItmClick ?? noop;
        this.onLeft = onLeft ?? noop;
        this.onRight = onRight ?? noop;
        this.allFiles = [];
    };
    async display(files, directories) {
        this.fileTree.innerHTML = "";

        const rootDetails = document.createElement("details");
        const rootSummary = document.createElement("summary");
        rootSummary.textContent = "root";
        rootDetails.appendChild(rootSummary);

        const root = document.createElement("div");
        root.className = "folder";
        const fileList = document.createElement("ul");
        fileList.className = "table-list";

        const header = createHeader();
        root.appendChild(fileList);
        rootDetails.appendChild(root);
        this.fileTree.append(header, rootDetails);

        await this.processEntries(files, directories, fileList);
        this.emit('displayComplete', { files, directories }); // Emit event when display is complete
    };

    async readDirectory(directory, container) {
        const reader = directory.createReader();
        reader.readEntries(async (entries) => {
            const files = [];
            const directories = [];

            const entryPromises = entries.map(async entry => {
                if (entry.isFile ) { //&& this.isAudioFile(entry.name)
                    return new Promise((resolve) => {
                        entry.file(async (file) => {
                            files.push(file);
                            this.allFiles.push(file);
                            await this.processEntries([file], [], container);
                            resolve();
                        });
                    });
                } else if (entry.isDirectory) {
                    directories.push(entry);
                }
            });

            await Promise.all(entryPromises);
            await this.processEntries([], directories, container);
        });
    };

    async processEntries(files, directories, container) {
        //this.isAudioFile(file.name)
        await Promise.all(
            files.map(async file => {
                if(!this.isAudioFile(file.name)) return;
                const { listItem, imgSrc, mediaTag, file: fileBlob } = await createFileListItem(file, sideLoadOverlay);

                listItem.querySelector(".overlay button#load_l").addEventListener(
                    "click",
                    event => this.#onListItmClick(fileBlob, event, listItem, imgSrc, mediaTag, "left", this.allFiles),
                    { passive: false }
                );
                listItem.querySelector(".overlay button#load_r").addEventListener(
                    "click",
                    event => this.#onListItmClick(fileBlob, event, listItem, imgSrc, mediaTag, "right", this.allFiles),
                    { passive: false }
                );
                listItem.addEventListener(
                    "click",
                    event => this.#onListItmClick(fileBlob, event, listItem, imgSrc, mediaTag, null, this.allFiles),
                    { passive: false }
                );

                container.appendChild(listItem);
                let leng = [...container.querySelectorAll(".song-info")].length;
                listItem.querySelector(".song-info :nth-child(1)").innerText =
                    String(leng ?? 0).padStart(3, '0');
            })
        );

        await Promise.all(
            directories.map(async (directory) => {
                const details = createDirectoryDetails(directory);
                await this.readDirectory(directory, details.querySelector('.folder'));
                container.appendChild(details);
            })
        );
        this.emit('processComplete', { files, directories }); // Emit event after processing entries
    };

    async #onListItmClick(file, event, element, imgSrc, mediaTag, selectSide, allfiles) {
        event.preventDefault();
        let overlay = element.querySelector(".load-buttons.overlay");
        [...this.fileTree.querySelectorAll(".song-info .overlay")].forEach(e => { if (e.classList.contains("show")) e.classList.remove("show"); });
        if (element.classList.contains("table-row") && overlay != null) {
            overlay.classList.toggle("show");
        }

        this.onItmClick(file, event, element);
        if (event.target instanceof HTMLButtonElement && overlay && overlay.classList.contains("show")) overlay.classList.toggle("show");
        if (selectSide) selectSide == "right" ? this.onRight(file, event, element, imgSrc, mediaTag, selectSide, allfiles) : this.onLeft(file, event, element, imgSrc, mediaTag, selectSide, allfiles);

        this.emit('itemClick', { file, event, element, imgSrc, mediaTag, selectSide }); // Emit event on item click
    }

    isAudioFile(fileName) {
        const audioExtensions = [".mp3", ".wav", ".ogg", ".flac", ".aac", ".m4a"];
        return audioExtensions.some((extension) =>
            fileName.toLowerCase().endsWith(extension)
        );
    }
}

