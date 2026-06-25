const tools = [
    { name: "主变差动校验", file: "/mtdp", desc: "支持三相/单相法、各厂家动作特性计算", icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>` },
    { name: "后备保护动作区", file: "/mtbp", desc: "支持各厂家主变过流、零流保护动作区及灵敏角向量图可视化", icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>` },    { name: "距离保护校验", file: "/ip", desc: "接地及相间距离校验点、状态序列计算", icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>` },
    { name: "母差斜率校验", file: "/bdp", desc: "母线差动斜率定值及临界动作点计算", icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 1.1.9 2 2 2h12a2 2 0 002-2V7M4 7l8 4 8-4M4 7V5c0-1.1.9-2 2-2h12a2 2 0 002 2v2"></path></svg>` },
    { name: "主变通流计算", file: "/mtci", desc: "基于阻抗电压计算通流试验二、三次电流", icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>` },
    { name: "序量解析与合成", file: "/vr", desc: "对称分量法解析、向量图可视化展示", icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12V4m0 8l-6.9 4m6.9-4l6.9 4"></path><circle cx="12" cy="4" r="1.5" fill="currentColor"></circle><circle cx="5.1" cy="16" r="1.5" fill="currentColor"></circle><circle cx="18.9" cy="16" r="1.5" fill="currentColor"></circle><circle cx="12" cy="12" r="1" fill="currentColor"></circle></svg>` },
    { name: "GBK命名工具", file: "/dt", desc: "文本转编码，支持实时4位16进制转换", icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>` },
    { name: "进制转换工具", file: "/base", desc: "支持多种进制间的相互转换", icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path></svg>` },
    { name: "设备口令库", file: "/pw", desc: "常用设备口令管理器", icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>` }
];
export const renderIndex = () => {
    const cardsHtml = tools.map(tool => `
        <a href="${tool.file}" data-link class="block p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center space-x-4">
            <div class="p-3 bg-green-50 text-green-600 rounded-lg">${tool.icon}</div>
            <div>
                <div class="font-bold text-gray-800 text-base">${tool.name}</div>
                <div class="text-xs text-gray-500 mt-1">${tool.desc}</div>
            </div>
        </a>`).join('');
    return `
        <div class="bg-white p-6 shadow-sm text-center sticky top-0 z-50">
            <h1 class="font-bold text-xl text-gray-800">继保工具箱</h1>
        </div>
        <div class="max-w-4xl mx-auto p-4">
            <div id="toolList" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                ${cardsHtml}
            </div>
        </div>
    `;
};
export const initIndex = () => {
    
    console.log("🚀 导航首页装载成功");
};

const footer = document.createElement('footer');
footer.className = "text-center text-xs text-gray-400 py-4";
footer.innerHTML = `v${__APP_VERSION__}`;
document.body.appendChild(footer);