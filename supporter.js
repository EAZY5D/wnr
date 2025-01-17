let i18n = require("i18n");
const Store = require('electron-store');
const ipc = require('electron').ipcRenderer;
const path = require("path");
const cmdOrCtrl = require("cmd-or-ctrl");

let isDarkMode = false;

if (process.env.NODE_ENV === "portable") {
    try {
        store = new Store({
            cwd: require('@electron/remote').app.getPath('exe').replace("wnr.exe", ""),
            name: 'wnr-config'
        });//accept portable
    } catch (e) {
        console.log(e);
        store = new Store();
    }
} else store = new Store();
let styleCache = new Store({ name: 'style-cache' });//just contains styling cache
let timingData = new Store({ name: 'timing-data' });//just contains timing cache

isInDark();

const languageList = ['en', 'zh-CN', 'zh-TW'],//locale code
    languageNameList = ['English', '简体中文', '正體中文'],//real name
    isChinese = store.get("i18n").indexOf("zh") !== -1;

i18n.configure({
    locales: languageList,
    directory: __dirname + '/locales',
    missingKeyFn(locale, value) {
        console.warn(`missing translation of "${ value }" in [${ locale }]!`)
        return `${ value }-[${ locale }]`;
    }
});
i18n.setLocale(store.get("i18n"));//set locale

function isTimerWindow(isTimer) {
    if (isTimer) {
        ipc.send('timer-win', true);
    } else ipc.send('timer-win', false);
}

function call(content) {
    ipc.send(content);
}

function getHelp(idCode) {
    require('electron').shell.openExternal(isChinese ?
        'https://getwnr.com/zh/' + idCode + '.html' :
        'https://getwnr.com/' + idCode + '.html');
}

function isInDark() {
    isDarkMode = (store.get("dark-or-white") === 2) || (styleCache.get('isdark') && store.get("dark-or-white") !== 1);
    if (isDarkMode) {
        $('.whitemode-jetplane').remove();
        $('body').append(
            '<style class="darkmode-jetplane">::-webkit-scrollbar-track {background-color: #191919;} ::-webkit-scrollbar-thumb {background-color: #999999;} .dropdown-menu {border-color: #aaaaaa; background-color: #393939;} .dropdown-item:hover {background-color: #555555; color: #fefefe;} input[type="range"] {background-color: #aaaaaa33;} body {background-color: #191919;} hr {border-color: #666666;} #title, h1, h3 {color: #bbbbbb;} #settings-title, #predefined-tasks-sidebar, #settings-sidebar, #about-content {border-color: #aaaaaa33;} .settings-sidebar-block {color: #fefefe; background-color: #191919;} #loader-wrapper .loader-section {background: #191919;} .dropdown-item, .dropdown-item .text-info, label, li, select, #personalization input[type="text"], input[type="password"], #settings-container input[type="number"], input[type="time"], .settings-sidebar-block {color: #bbbbbb !important;} #settings-container input[type="text"], #settings-container input[type="number"], #settings-container input[type="password"], #settings-container input[type="text"], #extend-form input, #settings-container .dropdown .btn, #dropdown-menu-button {border-bottom-color: #cccccc23 !important;} input[type="text"]:focus, input[type="number"]:focus, input[type="password"]:focus, #settings-container input[type="text"]:focus, #settings-container input[type="number"]:focus, #settings-container .dropdown .btn:focus, #dropdown-menu-button:focus {border-bottom-color: #cccccc33 !important;} input[type="text"]:hover, input[type="number"]:hover, input[type="password"]:hover, #settings-container input[type="text"]:hover, #settings-container input[type="number"]:hover, #settings-container .dropdown .btn:hover, #dropdown-menu-button:hover {border-bottom-color: #cccccc28 !important;} .hotkey-setting {color: #aaaaaa;} html {border: #ffffff33 1px solid;}</style>'
        );
    } else {
        $('.darkmode-jetplane').remove();
        $('body').append('<style class="whitemode-jetplane">body {background-color: #fefefe;}</style>');
    }
}

ipc.on('darkModeChanges', function () {
    isInDark();
});//dark mode settings