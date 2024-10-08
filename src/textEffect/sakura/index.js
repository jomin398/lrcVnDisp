export default function sakura(options) {
    const defaultoptions = {
        "styleFiles": ["sakura.css"],
        "c": 2,
        "s": {
            "top": "5px"
        }
    };
    const container = document.createElement('div');
    container.className = "sakura";
    let c = (options.c && typeof options.c == 'string' ? Number(options.c) : options.c) ?? 2;
    if (options?.s) Object.assign(container.style, defaultoptions.s, options.s)
    for (let i = 0; i < c; i++) {
        const span = document.createElement('span');
        container.appendChild(span);
    }
    return { container, defaultoptions };
}