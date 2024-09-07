export default function sakuraFall(options) {
    const sakuraContainer = document.createElement('div');
    sakuraContainer.className = "sakura";
    if (options?.style) Object.assign(sakuraContainer.style, options.style)
    for (let i = 0; i < options.c ?? 5; i++) {
        const span = document.createElement('span');
        sakuraContainer.appendChild(span);
    }
    return sakuraContainer;
}