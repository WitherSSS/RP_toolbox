export const renderBDP = () => {
    return `
    <style>
        .input-group label { width: 100px; }
        .input-group .unit { width: 40px; }
        .section-title { line-height: 3em; }
        .result-card { padding: 12px; }
        .result-card-title { margin-bottom: 8px; }
        table { font-size: 13px; width: 100%; border-collapse: collapse; }
        th, td { padding: 8px 4px; text-align: center; border-bottom: 1px solid #f3f4f6; }
        th { font-weight: 600; background-color: #f9fafb; color: #374151; }
        .hint-text { margin-top: 8px; font-size: 12px; color: #6b7280; line-height: 1.5; }
    </style>
    <div id="header" class="bg-white p-4 shadow-sm flex items-center justify-between font-bold text-lg sticky top-0 z-50">
        <a href="/" data-link class="w-12 text-gray-500 hover:text-gray-800 flex items-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </a>
        <div class="flex-1 text-center truncate">母差斜率校验</div>
        <div class="w-12"></div>
    </div>
    <form id="calcForm">
        <div class="section-title">定值</div>
        <div class="input-group"><label>启动值:</label><input type="number" step="any" name="Iqd" value="0.4" onfocus="this.select()"  onblur="if(this.value==='') this.value='0.4'"><span class="unit">A</span></div>
        
        <div class="section-title">动作特性</div>
        <div class="input-group">
            <label>保护厂家:</label>
            <select id="manufacturer" class="flex-1 text-right bg-transparent outline-none text-[#07c160] font-medium"></select>
        </div>
        <div class="input-group"><label>斜率:</label><input type="number" step="any" id="K2_input" name="K2" value="0.3" onfocus="this.select()"  onblur="if(this.value==='') this.value='0.3'"><span class="unit"></span></div>
        <button type="button" class="btn-primary" onclick="calculate()">计算</button>
    </form>
    <div id="results" class="hidden result-container">
        <div id="resultContent"></div>
    </div>
    `;
};
export const initBDP = () => {
    const array = ["南瑞继保", "深瑞"]; 
    const array_k = [[0, 0.3], [0, 0.43]];
    let currentIndex = 0; 
    
    const mSelect = document.getElementById('manufacturer');
    const kInput = document.getElementById('K2_input');
    if (mSelect && kInput) {
        
        mSelect.innerHTML = ""; 
        
        array.forEach((name, index) => { 
            const opt = document.createElement('option'); 
            opt.value = index; 
            opt.textContent = name; 
            mSelect.appendChild(opt); 
        });
        
        mSelect.addEventListener('change', (e) => { 
            currentIndex = parseInt(e.target.value); 
            kInput.value = array_k[currentIndex][1]; 
        });
    }
    
    window.calculate = calculate;
};
function getAngles(branch, isReverse = false) { 
    if (branch === 1) return [0, 240, 120]; 
    else return isReverse ? [0, 240, 120] : [180, 60, 300]; 
}
function createTableHtml(title, b1Cur, b2Cur) {
    const isReverse = parseFloat(b2Cur) < 0; 
    const b1Angles = getAngles(1); 
    const b2Angles = getAngles(2, isReverse); 
    const b1Val = Math.abs(parseFloat(b1Cur)).toFixed(3); 
    const b2Val = Math.abs(parseFloat(b2Cur)).toFixed(3);
    
    let hint = ""; 
    if (!isReverse) {
        hint = "此时保护处于动作临界点。稍微 <span class='text-blue-600 font-bold'>↓降低↓</span> 支路2电流动作， <span class='text-red-600 font-bold'>↑增加↑</span> 不动作。";
    } else {
        hint = "此时保护处于动作临界点。稍微 <span class='text-red-600 font-bold'>↑增加↑</span> 支路2电流动作， <span class='text-blue-600 font-bold'>↓降低↓</span> 不动作。";
    }
    return `
    <div class="result-card">
        <div class="result-card-title">${title}</div>
        <table>
            <thead>
                <tr><th colspan="2">支路1 (引入侧)</th><th colspan="2">支路2 (制动侧)</th></tr>
                <tr><th>电流(A)</th><th>角度(°)</th><th>电流(A)</th><th>角度(°)</th></tr>
            </thead>
            <tbody>
                <tr><td class="font-bold">${b1Val}</td><td>${b1Angles[0]}</td><td class="font-bold text-green-600">${b2Val}</td><td>${b2Angles[0]}</td></tr>
                <tr><td class="font-bold">${b1Val}</td><td>${b1Angles[1]}</td><td class="font-bold text-green-600">${b2Val}</td><td>${b2Angles[1]}</td></tr>
                <tr><td class="font-bold">${b1Val}</td><td>${b1Angles[2]}</td><td class="font-bold text-green-600">${b2Val}</td><td>${b2Angles[2]}</td></tr>
            </tbody>
        </table>
        <div class="hint-text">${hint}</div>
    </div>`;
}
function calculate() {
    const form = document.getElementById('calcForm');
    if (!form) return;
    const fd = new FormData(form); 
    const data = Object.fromEntries(fd.entries());
    
    const Iqd = parseFloat(data.Iqd) || 0.4; 
    const K2 = parseFloat(data.K2) || 0.3;
    
    
    const IhX1 = ((Iqd + Iqd / K2) / 2).toFixed(3); 
    const IlX1 = ((Iqd / K2 - Iqd) / 2).toFixed(3); 
    const IhX2 = ((Iqd + Iqd / K2 + K2 + 1) / 2).toFixed(3); 
    const IlX2 = ((Iqd / K2 + 1 - Iqd - K2) / 2).toFixed(3);
    
    let html = ""; 
    html += createTableHtml("1. 第一个校验点 (两支路变比设置需相同)", IhX1, IlX1); 
    html += createTableHtml("2. 第二个校验点", IhX2, IlX2);
    
    
    const resultContent = document.getElementById('resultContent');
    const resultsDiv = document.getElementById('results');
    
    if (resultContent && resultsDiv) {
        resultContent.innerHTML = html; 
        resultsDiv.classList.remove('hidden'); 
        window.scrollTo({ top: resultsDiv.offsetTop - 80, behavior: 'smooth' });
    }
}