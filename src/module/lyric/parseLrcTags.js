export function parseLrcTags(lyric) {
    const defaultTags = {
        title: '',
        artist: '',
        album: '',
        offset: 0,
        by: '',
    };


    const tagRegMap = {
        title: 'ti',
        artist: 'ar',
        album: 'al',
        offset: 'offset',
        by: 'by',
    };
    const tags = { ...defaultTags };
    for (let tag of Object.keys(tags)) {
        const matches = lyric.match(new RegExp(`\\[${tagRegMap[tag]}:([^\\]]*)]`, 'i'));
        if (matches) {
            // @ts-expect-error
            tags[tag] = matches[1];
        }
    }
    if (tags.offset) {
        let offset = parseInt(tags.offset);
        tags.offset = Number.isNaN(offset) ? 0 : offset;
    }
    else {
        tags.offset = 0;
    }

    return tags;
}
