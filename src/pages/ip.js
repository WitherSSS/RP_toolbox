export const renderIP = () => {
    return `
    <style>
        .input-group label { width: 110px; }
        .input-group .unit { width: 45px; }
        .section-title { line-height: 4em; }
        .result-card { padding: 16px; }
        .result-card-title { margin-bottom: 12px; font-size: 15px; }
        table { font-size: 12px; table-layout: fixed; }
        th, td { padding: 6px 2px; word-break: break-all; }
        th { font-weight: normal; }
        .status-badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; margin-bottom: 8px; font-weight: bold; }
        .badge-no-action { background: #ebf8ff; color: #2b6cb0; }
        .badge-action { background: #f0fff4; color: #2f855a; }
        .state-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 768px) { .state-grid { grid-template-columns: 1fr 1fr; } }
    </style>
    <div id="header" class="bg-white p-4 shadow-sm flex items-center justify-between font-bold text-lg sticky top-0 z-50">
        <a href="/" data-link class="w-12 text-gray-500 hover:text-gray-800 flex items-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </a>
        <div class="flex-1 text-center truncate">距离保护校验</div>
        <div class="w-12"></div>
    </div>
    <form id="calcForm">
        <div class="section-title">定值设置</div>
        <div class="input-group"><label>零补系数 K:</label><input type="number" step="any" name="K" value="0.7"><span class="unit"></span></div>
        <div class="input-group"><label>接地Ⅰ段:</label><input type="number" step="any" name="Z01" value="7.1"><span class="unit">Ω</span></div>
        <div class="input-group"><label>接地Ⅱ段:</label><input type="number" step="any" name="Z02" value="11.05"><span class="unit">Ω</span></div>
        <div class="input-group"><label>接地Ⅲ段:</label><input type="number" step="any" name="Z03" value="13.29"><span class="unit">Ω</span></div>
        <div class="input-group"><label>相间Ⅰ段:</label><input type="number" step="any" name="Z1" value="7.1"><span class="unit">Ω</span></div>
        <div class="input-group"><label>相间Ⅱ段:</label><input type="number" step="any" name="Z2" value="11.05"><span class="unit">Ω</span></div>
        <div class="input-group"><label>相间Ⅲ段:</label><input type="number" step="any" name="Z3" value="13.29"><span class="unit">Ω</span></div>
        <div class="input-group"><label>正序灵角 A1:</label><input type="number" step="any" name="A1" value="70"><span class="unit">°</span></div>
        <div class="input-group"><label>零序灵角 A0:</label><input type="number" step="any" name="A0" value="70"><span class="unit">°</span></div>
        
        <div class="section-title">试验参数</div>
        <div class="input-group"><label>试验电流 I:</label><input type="number" step="any" name="I" value="2"><span class="unit">A</span></div>
        <button type="button" class="btn-primary" onclick="calculate()">开始计算</button>
    </form>
    <div id="results" class="hidden result-container">
        <div class="hint-box">
            <strong>校验说明:</strong><br>
            1. 使用状态序列，一态设为：电压57.700V, 角度0.000°/240.000°/120.000°; 电流0.000A; 时间15s (用于PT断线复归)。<br>
            2. 下方模拟 <strong>A相接地</strong> 或 <strong>BC相间短路</strong>。假设偏移角均为0。<br>
            3. 反向故障校验：只需将三态的电流方向反向（增加180°）即可。
        </div>
        <div id="resultCards"></div>
        <div class="text-center text-xs text-gray-400 mt-6 pb-10">* 已经现场检验确认逻辑准确</div>
    </div>
    `;
};
export const initIP = () => {
    
    window.calculate = calculate;
};
function calculate() {
    const form = document.getElementById('calcForm');
    if (!form) return;
    const fd = new FormData(form); 
    const data = Object.fromEntries(fd.entries());
    
    
    const K = parseFloat(data.K) || 0.7; 
    const Z01 = parseFloat(data.Z01) || 7.1; 
    const Z02 = parseFloat(data.Z02) || 11.05; 
    const Z03 = parseFloat(data.Z03) || 13.29; 
    const Z1 = parseFloat(data.Z1) || 7.1; 
    const Z2 = parseFloat(data.Z2) || 11.05; 
    const Z3 = parseFloat(data.Z3) || 13.29; 
    const A1 = parseFloat(data.A1) || 70; 
    const A0 = parseFloat(data.A0) || 70; 
    const I = parseFloat(data.I) || 2;
    
    const resContainer = document.getElementById('resultCards'); 
    if (!resContainer) return;
    resContainer.innerHTML = "";
    
    
    const groundingPoints = [ 
        { name: "接地距离Ⅰ段", val: Z01 }, 
        { name: "接地距离Ⅱ段", val: Z02 }, 
        { name: "接地距离Ⅲ段", val: Z03 } 
    ];
    
    groundingPoints.forEach(p => { 
        const U_no = ((1 + K) * p.val * I * 1.05).toFixed(3); 
        const U_act = ((1 + K) * p.val * I * 0.95).toFixed(3); 
        resContainer.innerHTML += generateGroundCard(p.name, U_no, U_act, I, A0); 
    });
    
    
    const phasePoints = [ 
        { name: "相间距离Ⅰ段", val: Z1 }, 
        { name: "相间距离Ⅱ段", val: Z2 }, 
        { name: "相间距离Ⅲ段", val: Z3 } 
    ];
    
    const f = 57.7 * Math.sin(30 * Math.PI / 180);
    
    phasePoints.forEach(p => {
        const calcPhase = (factor) => { 
            const IZ = I * p.val * factor; 
            const Ubmag = Math.sqrt(f * f + IZ * IZ).toFixed(3); 
            const angleOff = (180 * Math.atan(IZ / f) / Math.PI); 
            return { 
                mag: Ubmag, 
                angleB: (180 + angleOff).toFixed(3), 
                angleC: (180 - angleOff).toFixed(3) 
            }; 
        };
        
        const pNo = calcPhase(1.05); 
        const pAct = calcPhase(0.95); 
        resContainer.innerHTML += generatePhaseCard(p.name, pNo, pAct, I, A1);
    });
    
    
    const resultsDiv = document.getElementById('results');
    if (resultsDiv) {
        resultsDiv.classList.remove('hidden'); 
        window.scrollTo({ top: resultsDiv.offsetTop - 80, behavior: 'smooth' });
    }
}
function generateGroundCard(name, Uno, Uact, I, A0) { 
    const I_fmt = parseFloat(I).toFixed(3); 
    const A0_fmt = parseFloat(A0).toFixed(3); 
    return `
    <div class="result-card">
        <div class="result-card-title">${name} (模拟A相接地)</div>
        <div class="state-grid">
            <div>
                <span class="status-badge badge-no-action">二态 (临界不动)</span>
                <table>
                    <thead>
                        <tr><th>相别</th><th>电压(V)</th><th>角度(°)</th><th>电流(A)</th><th>角度(°)</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>UA/IA</td><td class="font-bold text-blue-600">${Uno}</td><td>0.000</td><td class="font-bold">${I_fmt}</td><td>-${A0_fmt}</td></tr>
                        <tr><td>UB/IB</td><td>57.700</td><td>240.000</td><td>0.000</td><td>0.000</td></tr>
                        <tr><td>UC/IC</td><td>57.700</td><td>120.000</td><td>0.000</td><td>0.000</td></tr>
                    </tbody>
                </table>
            </div>
            <div>
                <span class="status-badge badge-action">三态 (临界动作)</span>
                <table>
                    <thead>
                        <tr><th>相别</th><th>电压(V)</th><th>角度(°)</th><th>电流(A)</th><th>角度(°)</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>UA/IA</td><td class="font-bold text-green-600">${Uact}</td><td>0.000</td><td class="font-bold">${I_fmt}</td><td>-${A0_fmt}</td></tr>
                        <tr><td>UB/IB</td><td>57.700</td><td>240.000</td><td>0.000</td><td>0.000</td></tr>
                        <tr><td>UC/IC</td><td>57.700</td><td>120.000</td><td>0.000</td><td>0.000</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>`; 
}
function generatePhaseCard(name, pNo, pAct, I, A1) { 
    const angleB = (270 - A1).toFixed(3); 
    const angleC = (90 - A1).toFixed(3); 
    const I_fmt = parseFloat(I).toFixed(3); 
    return `
    <div class="result-card">
        <div class="result-card-title">${name} (模拟BC相间短路)</div>
        <div class="state-grid">
            <div>
                <span class="status-badge badge-no-action">二态 (临界不动)</span>
                <table>
                    <thead>
                        <tr><th>相别</th><th>电压(V)</th><th>角度(°)</th><th>电流(A)</th><th>角度(°)</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>UA/IA</td><td>57.700</td><td>0.000</td><td>0.000</td><td>0.000</td></tr>
                        <tr><td>UB/IB</td><td class="font-bold text-blue-600">${pNo.mag}</td><td>${pNo.angleB}</td><td class="font-bold">${I_fmt}</td><td>${angleB}</td></tr>
                        <tr><td>UC/IC</td><td class="font-bold text-blue-600">${pNo.mag}</td><td>${pNo.angleC}</td><td class="font-bold">${I_fmt}</td><td>${angleC}</td></tr>
                    </tbody>
                </table>
            </div>
            <div>
                <span class="status-badge badge-action">三态 (临界动作)</span>
                <table>
                    <thead>
                        <tr><th>相别</th><th>电压(V)</th><th>角度(°)</th><th>电流(A)</th><th>角度(°)</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>UA/IA</td><td>57.700</td><td>0.000</td><td>0.000</td><td>0.000</td></tr>
                        <tr><td>UB/IB</td><td class="font-bold text-green-600">${pAct.mag}</td><td>${pAct.angleB}</td><td class="font-bold">${I_fmt}</td><td>${angleB}</td></tr>
                        <tr><td>UC/IC</td><td class="font-bold text-green-600">${pAct.mag}</td><td>${pAct.angleC}</td><td class="font-bold">${I_fmt}</td><td>${angleC}</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>`; 
}