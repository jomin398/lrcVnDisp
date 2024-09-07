async function convertWebdirFile(file) {
    return file.filesystem
        ? await new Promise((r) => file.file(d => r(d)))
        : file;
}

async function extractTagsAndCreateImageURL(blob) {
    try {
        const result = await new Promise((resolve, reject) => {
            jsmediatags.read(blob, {
                onSuccess: function (tagData) {
                    resolve(tagData);
                },
                onError: function (error) {
                    //ignore empty tag data
                    if (!error.info.includes("No suitable tag"))
                        reject(error);
                },
            });
        });
        let imgUrl;
        if (result.tags && result.tags.picture) {
            const picture = result.tags.picture;
            const base64String = picture.data.reduce(
                (acc, byte) => acc + String.fromCharCode(byte),
                ""
            );
            imgUrl =
                "data:" + picture.format + ";base64," + window.btoa(base64String);
        }
        return { result, imgUrl };
    } catch (error) {
        console.error("Error extracting tags and creating image URL:", error);
        return { result: null, imgUrl: null };
    }
}
export async function createFileListItem(file, overLay) {
    file = await convertWebdirFile(file);
    let { imgUrl: imgSrc, result: mediaTag } = await extractTagsAndCreateImageURL(file);
    let artist = mediaTag?.tags?.artist ?? "Unknown";
    const listItem = document.createElement("li");
    listItem.className = "table-row";
    listItem.innerHTML = `
        <span class="table-cell"><img ${imgSrc ? `src="${imgSrc}"` : ""}/></span>
        <div class="song-info">
            <span class="table-cell">1</span>
            <span class="table-cell">${file.name}</span>
            <span class="table-cell">${artist}</span>
            
            ${overLay ?? ""}
        </div>
    `;
    return { listItem, imgSrc, mediaTag, file };
}

export function createDirectoryDetails(directory) {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = directory.name;
    details.appendChild(summary);

    const subTree = document.createElement("div");
    subTree.className = "folder";
    details.appendChild(subTree);

    return details;
}

export function createHeader() {
    const header = document.createElement("li");
    header.className = "table-row header";
    header.innerHTML = `
        <span class="table-cell">folder</span>
        <span class="table-cell">img</span>
        <span class="table-cell">No</span>
        <span class="table-cell">Song Name</span>
        <span class="table-cell">Artist</span>
        
    `;
    //<span class="table-cell">Genre</span>
    return header;
}
export const sideLoadOverlay = `<div class="load-buttons overlay">
<button type="button" class="btn btn-primary" id="load_l">LOAD 1</button>
<button type="button" class="btn btn-primary" id="load_r">LOAD 2</button>
</div>`;