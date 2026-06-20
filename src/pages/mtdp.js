
const array = ["北京四方", "南瑞继保", "南瑞继保-高值", "长园深瑞", "国电南自", "南瑞科技", "其它"];
const array_k = [
    [.2, .5, .7, .6, 5], 
    [.2, .5, .75, .5, 6], 
    [0, .6, .6, .8, 6], 
    [0, .5, .75, 1, 6], 
    [0, .5, .7, .8, 3], 
    [0, .5, .8, .5, 5], 
    [.2, .5, .7, .6, 5]
];
let currentIndex = 0; 
let calcContext = null;
export const renderMTDP = () => {
    return `
    <style>
        .input-group label { width: 100px; }
        .input-group .unit { width: 40px; }
        .section-title { line-height: 3em; }
        .result-card { padding: 12px; }
        .result-card-title { margin-bottom: 8px; }
        table { font-size: 12px; }
        th, td { padding: 6px 2px; }
    </style>
    <div id="header" class="bg-white p-4 shadow-sm flex items-center justify-between font-bold text-lg sticky top-0 z-50">
        <a href="/" data-link class="w-12 text-gray-500 hover:text-gray-800 flex items-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </a>
        <div class="flex-1 text-center truncate">主变差动校验</div>
        <div class="w-12"></div>
    </div>
    <form id="calcForm">
        <div class="section-title">参数</div>
        <div class="input-group"><label>主变容量:</label><input type="number" step="any" name="S" value="50" onfocus="this.select()"  onblur="if(this.value==='') this.value='50'"><span class="unit">MVA</span></div>
        <div class="input-group"><label>高侧额压:</label><input type="number" step="any" name="Uh" value="110" onfocus="this.select()"  onblur="if(this.value==='') this.value='110'"><span class="unit">kV</span></div>
        <div class="input-group"><label>低侧额压:</label><input type="number" step="any" name="Ul" value="10.5" onfocus="this.select()"  onblur="if(this.value==='') this.value='10.5'"><span class="unit">kV</span></div>
        <div class="input-group"><label>接线方式:</label><select name="Clock" class="text-gray-700"><option value="11" selected>11 (Yd11)</option><option value="0">0 (Yy0)</option></select><span class="unit">点</span></div>
        <div class="input-group"><label>高CT比值:</label><input type="number" step="any" name="CTh" value="160" onfocus="this.select()"  onblur="if(this.value==='') this.value='160'"><span class="unit"></span></div>
        <div class="input-group"><label>低CT比值:</label><input type="number" step="any" name="CTl" value="800" onfocus="this.select()"  onblur="if(this.value==='') this.value='800'"><span class="unit"></span></div>
        
        <div class="section-title">定值</div>
        <div class="input-group"><label>启动值:</label><input type="number" step="any" name="Iqd" value="0.5" onfocus="this.select()"  onblur="if(this.value==='') this.value='0.5'"><span class="unit">Ie</span></div>
        <div class="input-group"><label>差速断:</label><input type="number" step="any" name="Isd" value="7" onfocus="this.select()"  onblur="if(this.value==='') this.value='7'"><span class="unit">Ie</span></div>
        
        <div class="section-title">动作特性</div>
        <div class="input-group"><label>保护厂家:</label><select id="manufacturer" class="text-[#07c160] font-bold"></select></div>
        <div id="slopes-container"></div>
        <div class="input-group"><label>校验方法:</label><select name="TestMethod" class="text-blue-600 font-bold"><option value="3phase">三相法</option><option value="1phase">单相法</option></select></div>
        
        <div class="section-title">人工计算点 (可不输)</div>
        <div id="rgzs-container"></div>
        <div class="bg-white px-4 py-2 flex justify-end border-b border-gray-100">
            <button type="button" class="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded border border-blue-200 font-bold" onclick="addRgzsRow()">+ 增加计算点</button>
        </div>
        <button type="button" class="btn-primary" onclick="calculate()">计算</button>
    </form>
    <div id="results" class="hidden result-container">
        <div id="summaryInfo" class="mb-4 p-3 bg-blue-50 rounded text-sm text-blue-800"></div>
        <div id="resultContent"></div>
        
        <div id="reverseSection" class="mt-8 p-4 bg-white rounded shadow-sm border-t-4 border-blue-500 hidden">
            <div class="font-bold text-blue-600 mb-2 border-b pb-2">倒推斜率与截距</div>
            <div class="text-xs text-gray-500 mb-3">输入实加电流(A)，计算对应两点的实际斜率，请确保上方已完成主计算以同步基准参数。</div>
            <div class="flex space-x-2 mb-3">
                <div class="flex-1 bg-gray-50 p-2 rounded border">
                    <div class="text-xs font-bold mb-1 text-gray-700">测试点 1</div>
                    <div class="flex items-center text-xs mb-1"><span class="w-8">高压</span><input type="number" step="any" id="rev_h1" class="w-full text-right bg-white border border-gray-200 px-1 py-1 rounded" value="0" onfocus="this.select()" onblur="if(this.value==='') this.value='0'"></div>
                    <div class="flex items-center text-xs"><span class="w-8">低压</span><input type="number" step="any" id="rev_l1" class="w-full text-right bg-white border border-gray-200 px-1 py-1 rounded" value="0" onfocus="this.select()" onblur="if(this.value==='') this.value='0'"></div>
                </div>
                <div class="flex-1 bg-gray-50 p-2 rounded border">
                    <div class="text-xs font-bold mb-1 text-gray-700">测试点 2</div>
                    <div class="flex items-center text-xs mb-1"><span class="w-8">高压</span><input type="number" step="any" id="rev_h2" class="w-full text-right bg-white border border-gray-200 px-1 py-1 rounded" value="0" onfocus="this.select()" onblur="if(this.value==='') this.value='0'"></div>
                    <div class="flex items-center text-xs"><span class="w-8">低压</span><input type="number" step="any" id="rev_l2" class="w-full text-right bg-white border border-gray-200 px-1 py-1 rounded" value="0" onfocus="this.select()" onblur="if(this.value==='') this.value='0'"></div>
                </div>
            </div>
            <button type="button" class="w-full bg-blue-500 text-white rounded py-2 text-sm font-bold active:bg-blue-600" onclick="calculateReverse()">计算实际斜率</button>
            <div id="reverseResult" class="mt-3 text-sm hidden"></div>
        </div>
    </div>
    `;
};
export const initMTDP = () => {
    
    window.addRgzsRow = addRgzsRow;
    window.calculate = calculate;
    window.calculateReverse = calculateReverse;
    const mSelect = document.getElementById('manufacturer');
    if (!mSelect) return;
    
    mSelect.innerHTML = '';
    array.forEach((name, index) => {
        const opt = document.createElement('option');
        opt.value = index;
        opt.textContent = name;
        mSelect.appendChild(opt);
    });
    
    mSelect.addEventListener('change', (e) => {
        currentIndex = parseInt(e.target.value);
        renderSlopes(currentIndex);
    });
    
    renderSlopes(0);
    initRgzsRows();
};
function addRgzsRow(initVal = '') {
    const container = document.getElementById('rgzs-container');
    if (!container) return;
    const index = container.children.length + 1;
    const div = document.createElement('div');
    div.className = "input-group";
    div.innerHTML = `<label>横坐标 ${index}:</label><input type="number" step="any" name="RGZS" value="${initVal}" onfocus="this.select()"  onblur="if(this.value==='') this.value=''"><span class="unit">Ie</span>`;
    container.appendChild(div);
}
function initRgzsRows() {
    const container = document.getElementById('rgzs-container');
    if (container) {
        container.innerHTML = '';
        addRgzsRow();
        addRgzsRow();
    }
}
function renderSlopes(index) {
    const container = document.getElementById('slopes-container');
    if (!container) return;
    const k = array_k[index];
    let html = `<div class="input-group"><label>一段斜率:</label><input type="number" step="any" name="K1" value="${k[0]}" onfocus="this.select()"  onblur="if(this.value==='') this.value='${k[0]}'"><span class="unit"></span></div><div class="input-group"><label>二段斜率:</label><input type="number" step="any" name="K2" value="${k[1]}" onfocus="this.select()"  onblur="if(this.value==='') this.value='${k[1]}'"><span class="unit"></span></div>`;
    if (index !== 2) html += `<div class="input-group"><label>三段斜率:</label><input type="number" step="any" name="K3" value="${k[2]}" onfocus="this.select()"  onblur="if(this.value==='') this.value='${k[2]}'"><span class="unit"></span></div>`;
    html += `<div class="input-group"><label>拐点1:</label><input type="number" step="any" name="Z1" value="${k[3]}" onfocus="this.select()"  onblur="if(this.value==='') this.value='${k[3]}'"><span class="unit">Ie</span></div>`;
    if (index !== 2) html += `<div class="input-group"><label>拐点2:</label><input type="number" step="any" name="Z2" value="${k[4]}" onfocus="this.select()"  onblur="if(this.value==='') this.value='${k[4]}'"><span class="unit">Ie</span></div>`;
    container.innerHTML = html;
}
function createTableHtml(title, highCur, lowCur, clock, method) {
    const isReverse = parseFloat(lowCur) < 0; 
    const hVal = Math.abs(parseFloat(highCur)); 
    const lVal = Math.abs(parseFloat(lowCur)); 
    const isNari = (currentIndex === 1 || currentIndex === 2);
    let rows = "";
    
    if (method === "3phase") {
        const hAngles = [0, 240, 120]; 
        const lAngles = (clock === "11") ? (isReverse ? [30, 270, 150] : [210, 90, 330]) : (isReverse ? [0, 240, 120] : [180, 60, 300]);
        rows = `<tr><td>A</td><td>${hVal.toFixed(3)}</td><td>${hAngles[0]}</td><td>${lVal.toFixed(3)}</td><td>${lAngles[0]}</td></tr><tr><td>B</td><td>${hVal.toFixed(3)}</td><td>${hAngles[1]}</td><td>${lVal.toFixed(3)}</td><td>${lAngles[1]}</td></tr><tr><td>C</td><td>${hVal.toFixed(3)}</td><td>${hAngles[2]}</td><td>${lVal.toFixed(3)}</td><td>${lAngles[2]}</td></tr>`;
    } else {
        if (clock === "0") {
            rows = `<tr><td>A</td><td>${hVal.toFixed(3)}</td><td>0</td><td>${lVal.toFixed(3)}</td><td>180</td></tr><tr><td>B</td><td>0.000</td><td>0</td><td>0.000</td><td>0</td></tr><tr><td>C</td><td>0.000</td><td>0</td><td>0.000</td><td>0</td></tr>`;
        } else {
            if (isNari) { 
                const lbVal = Math.sqrt(3) * lVal; 
                rows = `<tr><td>A</td><td>${hVal.toFixed(3)}</td><td>180</td><td>${lbVal.toFixed(3)}</td><td>0</td></tr><tr><td>B</td><td>${hVal.toFixed(3)}</td><td>0</td><td>0.000</td><td>0</td></tr><tr><td>C</td><td>0.000</td><td>0</td><td>0.000</td><td>0</td></tr>`; 
            } else { 
                const haVal = Math.sqrt(3) * hVal; 
                rows = `<tr><td>A</td><td>${haVal.toFixed(3)}</td><td>0</td><td>${lVal.toFixed(3)}</td><td>180</td></tr><tr><td>B</td><td>0.000</td><td>0</td><td>0.000</td><td>0</td></tr><tr><td>C</td><td>0.000</td><td>0</td><td>${lVal.toFixed(3)}</td><td>0</td></tr>`; 
            }
        }
    }
    let hint = title.includes("平衡") ? "装置内差流应接近 0。" : (!isReverse ? "临界点：稍微 <span class='text-blue-600 font-bold'>↓降低↓</span> 低侧电流动作， <span class='text-red-600 font-bold'>↑增加↑</span> 不动作。" : "临界点：稍微 <span class='text-red-600 font-bold'>↑增加↑</span> 低侧电流动作， <span class='text-blue-600 font-bold'>↓降低↓</span> 不动作。");
    return `<div class="result-card"><div class="result-card-title">${title}</div><table><thead><tr><th>相别</th><th colspan="2">高压侧</th><th colspan="2">低压侧</th></tr><tr><th>-</th><th>电流(A)</th><th>角度(°)</th><th>电流(A)</th><th>角度(°)</th></tr></thead><tbody>${rows}</tbody></table><div class="hint-text text-[11px]">${hint}</div></div>`;
}
function calculate() {
    const form = document.getElementById('calcForm'); 
    if (!form) return;
    const fd = new FormData(form); 
    const data = Object.fromEntries(fd.entries());
    
    const S = parseFloat(data.S) || 50; 
    const Uh = parseFloat(data.Uh) || 110; 
    const Ul = parseFloat(data.Ul) || 10.5; 
    const CTh = parseFloat(data.CTh) || 160; 
    const CTl = parseFloat(data.CTl) || 800; 
    const Clock = data.Clock; 
    const TestMethod = data.TestMethod;
    
    let Iqd = parseFloat(data.Iqd ?? 0.5); 
    if (currentIndex === 2) Iqd = 1.2;
    
    const Isd = parseFloat(data.Isd ?? 7); 
    const K1 = parseFloat(data.K1 ?? 0.2); 
    const K2 = parseFloat(data.K2 ?? 0.5); 
    const K3 = parseFloat(data.K3 ?? 0.7); 
    const Z1 = parseFloat(data.Z1 ?? 0.6); 
    const Z2 = parseFloat(data.Z2 ?? 5);
    
    const rgzsInputs = document.querySelectorAll('#rgzs-container input[name="RGZS"]'); 
    let rgzsList = []; 
    rgzsInputs.forEach(input => { 
        const val = parseFloat(input.value) || 0; 
        if (val > 0) rgzsList.push(val); 
    }); 
    const isManual = rgzsList.length > 0;
    
    const Ieh = (1000 * S / (Math.sqrt(3) * Uh * CTh)).toFixed(3); 
    const Iel = (1000 * S / (Math.sqrt(3) * Ul * CTl)).toFixed(3); 
    const IsdH = (1.05 * Isd * Ieh).toFixed(3); 
    const IsdL = (0.95 * Isd * Ieh).toFixed(3); 
    const y = (Uh * CTh / (Ul * CTl)).toFixed(3); 
    const K_val = (1 / y).toFixed(3);
    
    calcContext = { 
        Ieh: parseFloat(Ieh), 
        Iel: parseFloat(Iel), 
        Clock: Clock, 
        TestMethod: TestMethod, 
        Z1: parseFloat(Z1), 
        Z2: parseFloat(Z2), 
        Isd: Isd, 
        isNari: (currentIndex === 1 || currentIndex === 2), 
        isNariHigh: (currentIndex === 2) 
    };
    
    let html = "";
    if (!isManual && currentIndex !== 2) html += createTableHtml("1. 平衡校验", Ieh, Iel, Clock, TestMethod);
    
    if (!isManual) {
        if (currentIndex !== 2) { 
            let X1 = (Math.random() * 0.1 + (Z1 - 0.1)).toFixed(1); 
            const IhX1 = ((2 * X1 + Iqd + K1 * X1) * Ieh / 2).toFixed(3); 
            const IlX1 = ((2 * X1 - Iqd - K1 * X1) * Ieh / 2 * y).toFixed(3); 
            html += createTableHtml(`2. 第一段校验 (Ir=${X1}Ie)`, IhX1, IlX1, Clock, TestMethod); 
        }
        let X2 = (Math.random() * (Z2 - Z1 - 0.4) + Z1 + 0.4).toFixed(1); 
        const IhX2 = ((2 * X2 + Iqd + K1 * Z1 + (X2 - Z1) * K2) * Ieh / 2).toFixed(3); 
        const IlX2 = ((2 * X2 - Iqd - K1 * Z1 - (X2 - Z1) * K2) * Ieh / 2 * y).toFixed(3); 
        html += createTableHtml(`3. ${currentIndex === 2 ? "" : "第二段"}校验 (Ir=${X2}Ie)`, IhX2, IlX2, Clock, TestMethod);
        
        if (currentIndex !== 2) { 
            let X3 = (Math.random() * (9 - Z2 - 0.5) + Z2 + 0.5).toFixed(1); 
            const IhX3 = ((2 * X3 + Iqd + K1 * Z1 + (Z2 - Z1) * K2 + (X3 - Z2) * K3) * Ieh / 2).toFixed(3); 
            const IlX3 = ((2 * X3 - Iqd - K1 * Z1 - (Z2 - Z1) * K2 - (X3 - Z2) * K3) * Ieh / 2 * y).toFixed(3); 
            html += createTableHtml(`4. 第三段校验 (Ir=${X3}Ie)`, IhX3, IlX3, Clock, TestMethod); 
        }
    } else {
        rgzsList.forEach((X, idx) => {
            X = parseFloat(X);
            if (X <= Z1 && currentIndex !== 2) { 
                const IhX = ((2 * X + Iqd + K1 * X) * Ieh / 2).toFixed(3); 
                const IlX = ((2 * X - Iqd - K1 * X) * Ieh / 2 * y).toFixed(3); 
                html += createTableHtml(`人工校验点 ${idx + 1} (第一段, Ir=${X}Ie)`, IhX, IlX, Clock, TestMethod); 
            }
            if (X > Z1 && X <= Z2) { 
                const IhX = ((2 * X + Iqd + K1 * Z1 + (X - Z1) * K2) * Ieh / 2).toFixed(3); 
                const IlX = ((2 * X - Iqd - K1 * Z1 - (X - Z1) * K2) * Ieh / 2 * y).toFixed(3); 
                html += createTableHtml(`人工校验点 ${idx + 1} (${currentIndex === 2 ? "" : "第二段"}, Ir=${X}Ie)`, IhX, IlX, Clock, TestMethod); 
            }
            if (X > Z2 && currentIndex !== 2) { 
                const IhX = ((2 * X + Iqd + K1 * Z1 + (Z2 - Z1) * K2 + (X - Z2) * K3) * Ieh / 2).toFixed(3); 
                const IlX = ((2 * X - Iqd - K1 * Z1 - (Z2 - Z1) * K2 - (X - Z2) * K3) * Ieh / 2 * y).toFixed(3); 
                html += createTableHtml(`人工校验点 ${idx + 1} (第三段, Ir=${X}Ie)`, IhX, IlX, Clock, TestMethod); 
            }
        });
    }
    
    if (currentIndex === 2) html += `<div class="p-3 bg-orange-50 text-orange-700 text-xs rounded mb-4">高值比率差动不受CT断线闭锁...</div>`;
    if (!isManual && currentIndex !== 2) html += `<div class="result-card"><div class="result-card-title">5. 差速断校验 (高侧三相)</div><div class="text-sm space-y-1 p-2"><p>动作 (1.05倍): <span class="font-bold text-red-600">${IsdH} A</span></p><p>不动作 (0.95倍): <span class="font-bold text-green-600">${IsdL} A</span></p></div></div>`;
    
    document.getElementById('summaryInfo').innerHTML = `基准 Ie = ${Ieh} A | 系数 K = ${K_val}`; 
    document.getElementById('resultContent').innerHTML = html; 
    document.getElementById('reverseSection').classList.remove('hidden'); 
    document.getElementById('reverseResult').classList.add('hidden'); 
    document.getElementById('results').classList.remove('hidden'); 
    
    window.scrollTo({ top: document.getElementById('results').offsetTop - 80, behavior: 'smooth' });
}
function calculateReverse() {
    if (!calcContext) return;
    const h1 = Math.abs(parseFloat(document.getElementById('rev_h1').value) || 0); 
    const l1 = Math.abs(parseFloat(document.getElementById('rev_l1').value) || 0); 
    const h2 = Math.abs(parseFloat(document.getElementById('rev_h2').value) || 0); 
    const l2 = Math.abs(parseFloat(document.getElementById('rev_l2').value) || 0);
    
    if (h1 === 0 && l1 === 0 && h2 === 0 && l2 === 0) return;
    
    const getPoint = (h, l) => { 
        let hBase = h; 
        let lBase = l; 
        if (calcContext.TestMethod === "1phase" && calcContext.Clock !== "0") { 
            if (calcContext.isNari) lBase = l / Math.sqrt(3); 
            else hBase = h / Math.sqrt(3); 
        } 
        const hPu = hBase / calcContext.Ieh; 
        const lPu = lBase / calcContext.Iel; 
        const Id = Math.abs(hPu - lPu); 
        const Ir = (hPu + lPu) / 2; 
        return { Id, Ir }; 
    };
    
    const p1 = getPoint(h1, l1); 
    const p2 = getPoint(h2, l2);
    let resultHtml = "";
    
    if (Math.abs(p2.Ir - p1.Ir) < 0.0001) {
        resultHtml = `<div class="p-2 mt-2 bg-red-50 text-red-600 border border-red-200 rounded text-center">两点制动电流(Ir)相同，无法计算斜率！</div>`;
    } else {
        const k = (p2.Id - p1.Id) / (p2.Ir - p1.Ir); 
        const c = p1.Id - k * p1.Ir;
        const getSegment = (ir) => { 
            if (ir <= calcContext.Z1) return 1; 
            if (calcContext.isNariHigh) return 2; 
            if (ir <= calcContext.Z2) return 2; 
            return 3; 
        };
        const s1 = getSegment(p1.Ir); 
        const s2 = getSegment(p2.Ir);
        let warnHtml = "";
        
        if (s1 !== s2) warnHtml += `<div class="mt-2 text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200 text-xs">⚠️ 注意：输入的两点不在同一斜率段上！<br><span class="font-normal text-red-500">点1位于第 ${s1} 段 (Ir=${p1.Ir.toFixed(3)})，点2位于第 ${s2} 段 (Ir=${p2.Ir.toFixed(3)})。计算出的特性曲线可能失真。</span></div>`;
        if (p1.Id > calcContext.Isd || p2.Id > calcContext.Isd) warnHtml += `<div class="mt-2 text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200 text-xs">⚠️ 警告：换算出的差动电流已大于速断定值 (${calcContext.Isd} Ie)！<br><span class="font-normal text-red-500">点1 Id = ${p1.Id.toFixed(3)} Ie | 点2 Id = ${p2.Id.toFixed(3)} Ie。<br>请检查保护装置是否已动作于【差动速断】，导致比率差动判定失效！</span></div>`;
        
        resultHtml = `<div class="bg-blue-50 p-3 rounded border border-blue-100"><div class="grid grid-cols-2 gap-2 mb-2 border-b border-blue-200 pb-2 text-blue-800 text-xs"><div>点1：Ir=${p1.Ir.toFixed(3)}, Id=${p1.Id.toFixed(3)}</div><div>点2：Ir=${p2.Ir.toFixed(3)}, Id=${p2.Id.toFixed(3)}</div></div><div class="text-center font-mono text-base pt-1">实测斜率 K = <span class="text-blue-600 font-bold text-lg">${k.toFixed(4)}</span></div><div class="text-center text-gray-600 mt-1 text-xs">实际截距 = <span class="font-bold">${c.toFixed(4)}</span> Ie</div>${warnHtml}</div>`;
    }
    const resDiv = document.getElementById('reverseResult'); 
    resDiv.innerHTML = resultHtml; 
    resDiv.classList.remove('hidden');
}