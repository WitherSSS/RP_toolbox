
export const renderMTCI = () => {
    return `
    <style>
        .input-group label { width: 110px; }
        .input-group .unit { width: 45px; }
        .section-title { line-height: 4em; }
        .result-card { padding: 16px; }
        .result-card-title { margin-bottom: 12px; font-size: 15px; }
        .data-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f9f9f9; }
        .data-row:last-child { border-bottom: none; }
        .data-label { color: #666; font-size: 14px; }
        .data-value { font-weight: bold; color: #333; font-size: 14px; }
        .highlight-box { background-color: #f0fff4; border: 1px solid #c6f6d5; padding: 12px; border-radius: 6px; margin-top: 10px; }
        .highlight-value { color: #07c160; font-size: 18px; font-weight: 800; }
    </style>
    <div id="header" class="bg-white p-4 shadow-sm flex items-center justify-between font-bold text-lg sticky top-0 z-50">
        <a href="/" data-link class="w-12 text-gray-500 hover:text-gray-800 flex items-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </a>
        <div class="flex-1 text-center truncate">主变通流计算</div>
        <div class="w-12"></div>
    </div>
    <form id="calcForm">
        <div class="section-title">铭牌参数</div>
        <div class="input-group"><label>主变容量:</label><input type="number" step="any" name="S" value="50" placeholder="50"><span class="unit">MVA</span></div>
        <div class="input-group"><label>高侧额压:</label><input type="number" step="any" name="Uh" value="110" placeholder="110"><span class="unit">kV</span></div>
        <div class="input-group"><label>低侧额压:</label><input type="number" step="any" name="Ul" value="10.5" placeholder="10.5"><span class="unit">kV</span></div>
        <div class="input-group"><label>短路阻抗:</label><input type="number" step="any" name="Uk" value="7.2" placeholder="7.2"><span class="unit">%</span></div>
        <div class="input-group"><label>高侧CT比值:</label><input type="number" step="any" name="CTh" value="80" placeholder="80"><span class="unit"></span></div>
        <div class="input-group"><label>低侧CT比值:</label><input type="number" step="any" name="CTl" value="600" placeholder="600"><span class="unit"></span></div>
        <button type="button" class="btn-primary" onclick="calculate()">计算</button>
    </form>
    <div id="results" class="hidden result-container">
        <div class="hint-box"><strong>试验方法:</strong><br>低压侧三相短接，高压侧三相接 400V</div>
        
        <div class="result-card">
            <div class="result-card-title">一次电流结果</div>
            <div class="data-row"><span class="data-label">高侧一次电流</span><span class="data-value" id="resIh">-- A</span></div>
            <div class="data-row"><span class="data-label">低侧一次电流</span><span class="data-value" id="resIl">-- A</span></div>
        </div>
        
        <div class="result-card">
            <div class="result-card-title">装置显示二次电流</div>
            <div class="highlight-box">
                <div class="flex justify-between items-center mb-2"><span class="text-sm font-semibold text-gray-700">高侧二次电流</span><span class="highlight-value" id="resIh2">-- mA</span></div>
                <div class="flex justify-between items-center"><span class="text-sm font-semibold text-gray-700">低侧二次电流</span><span class="highlight-value" id="resIl2">-- mA</span></div>
            </div>
        </div>
    </div>
    `;
};
export const initMTCI = () => {
    
    window.calculate = calculate;
};
function calculate() {
    const form = document.getElementById('calcForm');
    if (!form) return;
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    
    const S = parseFloat(data.S) || 50; 
    const Uh = parseFloat(data.Uh) || 110; 
    const Ul = parseFloat(data.Ul) || 10.5; 
    const Uk = parseFloat(data.Uk) || 7.2; 
    const CTh = parseFloat(data.CTh) || 80; 
    const CTl = parseFloat(data.CTl) || 600;
    
    const i = 0.01 * Uk;
    
    const Ih = (400 * S / (Math.sqrt(3) * i * Uh * Uh)).toFixed(1); 
    const Il = (400 * S / (Math.sqrt(3) * i * Uh * Ul)).toFixed(1);
    const Ih2 = (1000 * Ih / CTh).toFixed(0); 
    const Il2 = (1000 * Il / CTl).toFixed(0);
    
    document.getElementById('resIh').innerText = Ih + " A"; 
    document.getElementById('resIl').innerText = Il + " A"; 
    document.getElementById('resIh2').innerText = Ih2 + " mA"; 
    document.getElementById('resIl2').innerText = Il2 + " mA";
    
    const resultsDiv = document.getElementById('results');
    if (resultsDiv) {
        resultsDiv.classList.remove('hidden');
        window.scrollTo({ top: resultsDiv.offsetTop - 80, behavior: 'smooth' });
    }
}