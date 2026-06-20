import { renderIndex, initIndex } from './pages/index.js';
import { renderPW, initPW } from './pages/pw.js';
import { renderMTDP, initMTDP } from './pages/mtdp.js';
import { renderMTCI, initMTCI } from './pages/mtci.js';
import { renderIP, initIP } from './pages/ip.js';
import { renderDT, initDT } from './pages/dt.js';
import { renderBDP, initBDP } from './pages/bdp.js';
import { renderVR, initVR } from './pages/vr.js';
import { renderBase, initBase } from './pages/base.js';
const routes = {
    "/": { render: renderIndex, init: initIndex },
    "/pw": { render: renderPW, init: initPW },
    "/mtdp": { render: renderMTDP, init: initMTDP },
    "/mtci": { render: renderMTCI, init: initMTCI },
    "/ip": { render: renderIP, init: initIP },
    "/dt": { render: renderDT, init: initDT },
    "/bdp": { render: renderBDP, init: initBDP },
    "/vr": { render: renderVR, init: initVR },
    "/base": { render: renderBase, init: initBase }
};
const router = async () => {
    const path = window.location.pathname;
    const route = routes[path] || routes["/"];
    const appContainer = document.getElementById('app');
    if (appContainer) {
        cleanGlobalEffects();
        appContainer.innerHTML = route.render();
        if (route.init) {
            route.init();
        }
    }
};
export const navigateTo = (url) => {
    if (window.location.pathname !== url) {
        window.history.pushState(null, null, url);
        router();
    }
};
function cleanGlobalEffects() {
    const deadFuncs = ['calculate', 'convertDT', 'copyResultDT', 'toggleVRMode', 'doVRCalculate'];
    deadFuncs.forEach(f => {
        if (window[f]) delete window[f];
    });
}
export const initRouter = () => {
    document.body.addEventListener("click", (e) => {
        const targetLink = e.target.closest("[data-link]");
        if (targetLink) {
            e.preventDefault();
            navigateTo(targetLink.getAttribute("href"));
        }
    });
    window.addEventListener("popstate", router);
    router();
    console.log("⚓ 核心路由驱动中心初始化完毕");
};