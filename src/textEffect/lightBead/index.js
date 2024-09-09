export default function lightBead(options) {
    const defaultoptions = {
        "styleFiles": ["style.css"],
        "c": 2
    };
    const container = document.createElement('div');
    container.className = "lightBead";
    let c = (options.c && typeof options.c == 'string' ? Number(options.c) : options.c) ?? 2;
    if (options?.s) Object.assign(container.style, options.s)
    for (let i = 0; i < c; i++) {
        const span = document.createElement('span');
        container.appendChild(span);
    }
    return { container, defaultoptions };
}