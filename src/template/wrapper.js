export const contentTemp = `<div class="content d-flex w-100 align-items-center">
    <div class="text">
    </div>
</div>`;
const dialog = `<div id="dialog" class="d-flex p-2">
    <div class="wrapper d-flex flex-column w-100">
        <header class="d-flex flex-row justify-content-between">
            <div class="name d-flex justify-content-center align-items-center"></div>
            <ul class="controls d-flex flex-row flex-wrap-reverse gap-2">
                <li class="qsave">qsave</li>
                <li class="qlave">qlave</li>
                <li class="save">save</li>
                <li class="load">load</li>
                <li class="config">config</li>
                <li class="log">log</li>
                <li class="exit">exit</li>
            </ul>
        </header>    
        <div class="contentWrapper d-flex flex-column">
            ${contentTemp}
        </div>
    </div>
</div>`;
export const defaultTpl = `<div class="d-flex w-100 h-100">
    <div id="vnDisp" class="flex-grow-1">
        <div class="backgroundWrap"></div>
        ${dialog}
    </div>
</div>`;