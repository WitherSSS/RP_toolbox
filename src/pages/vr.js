let isAnalysisMode = true; 
let phasorChartInstance = null;
class Complex {
    constructor(real, imag) { 
        this.real = real; 
        this.imag = imag; 
    }
    add(c) { return new Complex(this.real + c.real, this.imag + c.imag); }
    subtract(c) { return new Complex(this.real - c.real, this.imag - c.imag); }
    multiply(c) { return new Complex(this.real * c.real - this.imag * c.imag, this.real * c.imag + this.imag * c.real); }
    divide(n) { return new Complex(this.real / n, this.imag / n); }
    get abs() { return Math.sqrt(this.real * this.real + this.imag * this.imag); }
    get angle() { return (Math.atan2(this.imag, this.real) * 180 / Math.PI + 360) % 360; }
    static fromPolar(r, theta) { 
        const rad = theta * Math.PI / 180; 
        return new Complex(r * Math.cos(rad), r * Math.sin(rad)); 
    }
}
const a_op = Complex.fromPolar(1, 120); 
const a2_op = Complex.fromPolar(1, 240);
const phasorGridPlugin = {
    id: 'phasorGrid',
    beforeDraw: (chart) => {
        const { ctx, scales: { x, y } } = chart; 
        const centerX = x.getPixelForValue(0); 
        const centerY = y.getPixelForValue(0); 
        const maxVal = x.max; 
        if (maxVal <= 0) return; 
        const radiusMax = Math.abs(x.getPixelForValue(maxVal) - centerX);
        
        ctx.save(); 
        ctx.strokeStyle = '#f0f0f0'; 
        ctx.lineWidth = 1;
        
        
        for (let r = 0.25; r <= 1; r += 0.25) { 
            ctx.beginPath(); 
            ctx.arc(centerX, centerY, radiusMax * r, 0, 2 * Math.PI); 
            ctx.stroke(); 
            ctx.fillStyle = '#bbb'; 
            ctx.font = '10px Arial'; 
            ctx.fillText((maxVal * r).toFixed(1), centerX + radiusMax * r + 2, centerY - 2); 
        }
        
        
        ctx.strokeStyle = '#eee';
        for (let deg = 0; deg < 360; deg += 30) { 
            const rad = deg * Math.PI / 180; 
            ctx.beginPath(); 
            ctx.moveTo(centerX, centerY); 
            ctx.lineTo(centerX + radiusMax * Math.cos(rad), centerY - radiusMax * Math.sin(rad)); 
            ctx.stroke(); 
            ctx.fillStyle = '#999'; 
            const textR = radiusMax + 12; 
            ctx.fillText(deg + '°', centerX + textR * Math.cos(rad) - 8, centerY - textR * Math.sin(rad) + 4); 
        }
        ctx.restore();
    }
};
const vectorArrowsPlugin = {
    id: 'vectorArrows',
    afterDraw: (chart) => {
        const { ctx, scales: { x, y } } = chart; 
        const centerX = x.getPixelForValue(0); 
        const centerY = y.getPixelForValue(0);
        
        chart.data.datasets.forEach((dataset, i) => {
            if (!chart.isDatasetVisible(i)) return;
            dataset.data.forEach((pt, idx) => {
                if (Math.abs(pt.x) < 0.001 && Math.abs(pt.y) < 0.001) return;
                const targetX = x.getPixelForValue(pt.x); 
                const targetY = y.getPixelForValue(pt.y); 
                const color = Array.isArray(dataset.borderColor) ? dataset.borderColor[idx] : dataset.borderColor;
                
                
                ctx.save(); 
                ctx.beginPath(); 
                ctx.moveTo(centerX, centerY); 
                ctx.lineTo(targetX, targetY); 
                ctx.strokeStyle = color; 
                ctx.lineWidth = dataset.borderWidth || 2; 
                if (dataset.borderDash) ctx.setLineDash(dataset.borderDash); 
                ctx.stroke();
                
                
                const angle = Math.atan2(centerY - targetY, targetX - centerX); 
                ctx.translate(targetX, targetY); 
                ctx.rotate(-angle); 
                ctx.beginPath(); 
                ctx.moveTo(0, 0); 
                ctx.lineTo(-10, -4); 
                ctx.lineTo(-10, 4); 
                ctx.closePath(); 
                ctx.fillStyle = color; 
                ctx.fill(); 
                ctx.restore();
                
                
                ctx.fillStyle = color; 
                ctx.font = "bold 13px Arial"; 
                ctx.fillText(pt.label, targetX + Math.cos(angle) * 15 - 5, targetY - Math.sin(angle) * 15 + 5);
            });
        });
    }
};
export const renderVR = () => {
    return `
    <style>
        .symbol { color: #888; margin: 0 4px; font-size: 14px; }
        .section-title { line-height: 4em; cursor: pointer; display: flex; justify-content: center; align-items: center; margin-bottom: 1px; }
        .section-title svg { margin-left: 8px; width: 18px; height: 18px; color: #07c160; }
        .result-box { padding: 16px; background: white; margin-top: 10px; font-size: 14px; line-height: 1.8; color: #333; }
        .chart-wrapper { background: white; margin-top: 10px; width: 100%; max-width: 500px; margin-left: auto; margin-right: auto; aspect-ratio: 1 / 1; position: relative; }
    </style>
    <div id="header" class="bg-white p-4 shadow-sm flex items-center justify-between font-bold text-lg sticky top-0 z-50">
        <a href="/" data-link class="w-12 text-gray-500 hover:text-gray-800 flex items-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </a>
        <div class="flex-1 text-center truncate">序量解析与合成</div>
        <div class="w-12"></div>
    </div>
    <div id="modeTitle" class="section-title bg-gray-100 hover:bg-gray-200 transition-colors" onclick="toggleVRMode()">
        <span id="modeText">三相数据解析</span>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
    </div>
    <form id="calcForm">
        <div id="inputContent"></div>
        <button type="button" class="btn-primary" onclick="doVRCalculate()">计 算</button>
    </form>
    <div id="results" class="hidden">
        <div class="result-box border rounded shadow-sm mx-4" id="resultText"></div>
        <div class="chart-wrapper p-4"><canvas id="phasorChart"></canvas></div>
    </div>
    `;
};
export const initVR = () => {
    
    isAnalysisMode = true;
    phasorChartInstance = null;
    
    if (!window.Chart) {
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/chart.js";
        script.onload = () => {
            renderDynamicInputs();
        };
        document.head.appendChild(script);
    } else {
        renderDynamicInputs();
    }
    
    window.toggleVRMode = toggleVRMode;
    window.doVRCalculate = doVRCalculate;
};
function toggleVRMode() {
    isAnalysisMode = !isAnalysisMode;
    const modeTextEl = document.getElementById('modeText');
    if (modeTextEl) {
        modeTextEl.innerText = isAnalysisMode ? "三相数据解析" : "分量数据合成";
    }
    renderDynamicInputs();
    document.getElementById('results')?.classList.add('hidden');
}
function renderDynamicInputs() {
    const container = document.getElementById('inputContent');
    if (!container) return;
    if (isAnalysisMode) {
        container.innerHTML = `
            <div class="input-group"><label>A相:</label><input type="number" step="any" name="val1" value="10"><span class="symbol">∠</span><input type="number" step="any" name="ang1" value="0"><span class="symbol">°</span></div>
            <div class="input-group"><label>B相:</label><input type="number" step="any" name="val2" value="20"><span class="symbol">∠</span><input type="number" step="any" name="ang2" value="240"><span class="symbol">°</span></div>
            <div class="input-group"><label>C相:</label><input type="number" step="any" name="val3" value="30"><span class="symbol">∠</span><input type="number" step="any" name="ang3" value="120"><span class="symbol">°</span></div>`;
    } else {
        container.innerHTML = `
            <div class="input-group"><label>正序:</label><input type="number" step="any" name="val1" value="57.7"><span class="symbol">∠</span><input type="number" step="any" name="ang1" value="0"><span class="symbol">°</span></div>
            <div class="input-group"><label>负序:</label><input type="number" step="any" name="val2" value="0"><span class="symbol">∠</span><input type="number" step="any" name="ang2" value="0"><span class="symbol">°</span></div>
            <div class="input-group"><label>零序:</label><input type="number" step="any" name="val3" value="0"><span class="symbol">∠</span><input type="number" step="any" name="ang3" value="0"><span class="symbol">°</span></div>`;
    }
}
function doVRCalculate() {
    const form = document.getElementById('calcForm');
    const resultTextEl = document.getElementById('resultText');
    const resultsArea = document.getElementById('results');
    
    if (!form || !resultTextEl || !resultsArea) return;
    const fd = new FormData(form);
    const v1 = parseFloat(fd.get('val1')) || 0; 
    const a1 = parseFloat(fd.get('ang1')) || 0; 
    const v2 = parseFloat(fd.get('val2')) || 0; 
    const a2 = parseFloat(fd.get('ang2')) || 0; 
    const v3 = parseFloat(fd.get('val3')) || 0; 
    const a3 = parseFloat(fd.get('ang3')) || 0;
    let va, vb, vc, vp, vn, vz;
    if (isAnalysisMode) {
        
        va = Complex.fromPolar(v1, a1); 
        vb = Complex.fromPolar(v2, a2); 
        vc = Complex.fromPolar(v3, a3);
        vp = va.add(vb.multiply(a_op)).add(vc.multiply(a2_op)).divide(3); 
        vn = va.add(vb.multiply(a2_op)).add(vc.multiply(a_op)).divide(3); 
        vz = va.add(vb).add(vc).divide(3);
        resultTextEl.innerHTML = `
            <strong>解析结果：</strong><br>
            正序：<span class="font-bold text-yellow-600">${vp.abs.toFixed(2)}</span> ∠${vp.angle.toFixed(1)}°<br>
            负序：<span class="font-bold text-green-600">${vn.abs.toFixed(2)}</span> ∠${vn.angle.toFixed(1)}°<br>
            3倍零序 (3U0/3I0)：<span class="font-bold text-red-600">${(vz.abs * 3).toFixed(2)}</span> ∠${vz.angle.toFixed(1)}°
        `;
    } else {
        
        vp = Complex.fromPolar(v1, a1); 
        vn = Complex.fromPolar(v2, a2); 
        vz = Complex.fromPolar(v3 / 3, a3); 
        va = vp.add(vn).add(vz); 
        vb = vp.multiply(a2_op).add(vn.multiply(a_op)).add(vz); 
        vc = vp.multiply(a_op).add(vn.multiply(a2_op)).add(vz);
        resultTextEl.innerHTML = `
            <strong>合成结果：</strong><br>
            A相：<span class="font-bold text-amber-500">${va.abs.toFixed(2)}</span> ∠${va.angle.toFixed(1)}°<br>
            B相：<span class="font-bold text-green-500">${vb.abs.toFixed(2)}</span> ∠${vb.angle.toFixed(1)}°<br>
            C相：<span class="font-bold text-red-500">${vc.abs.toFixed(2)}</span> ∠${vc.angle.toFixed(1)}°
        `;
    }
    
    const uab = va.subtract(vb); 
    const ubc = vb.subtract(vc); 
    const uca = vc.subtract(va);
    resultTextEl.innerHTML += `
        <div class="mt-3 pt-2 border-t border-gray-100 text-gray-500 text-xs">
            线电压/电流差参考：<br>
            ΔUab: ${uab.abs.toFixed(1)}∠${uab.angle.toFixed(1)}° | 
            ΔUbc: ${ubc.abs.toFixed(1)}∠${ubc.angle.toFixed(1)}° | 
            ΔUca: ${uca.abs.toFixed(1)}∠${uca.angle.toFixed(1)}°
        </div>
    `;
    
    resultsArea.classList.remove('hidden');
    
    if (window.Chart) {
        updatePhasorChart(va, vb, vc, vp, vn, vz);
    }
}
function updatePhasorChart(va, vb, vc, vp, vn, vz) {
    const canvas = document.getElementById('phasorChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const vz3 = vz.multiply(new Complex(3, 0)); 
    
    const limit = Math.max(va.abs, vb.abs, vc.abs, vp.abs, vn.abs, vz3.abs, 1) * 1.3;
    if (phasorChartInstance) {
        phasorChartInstance.destroy();
    }
    phasorChartInstance = new window.Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: '全量(A/B/C)',
                    data: [{ x: va.real, y: va.imag, label: 'A' }, { x: vb.real, y: vb.imag, label: 'B' }, { x: vc.real, y: vc.imag, label: 'C' }],
                    borderColor: ['#ff9900', '#00ff00', '#ff0000'],
                    borderWidth: 3,
                    pointRadius: 0
                },
                {
                    label: '正序分量',
                    data: [{ x: vp.real, y: vp.imag, label: 'pA' }, { x: vp.multiply(a2_op).real, y: vp.multiply(a2_op).imag, label: 'pB' }, { x: vp.multiply(a_op).real, y: vp.multiply(a_op).imag, label: 'pC' }],
                    borderColor: '#eab308',
                    borderDash: [5, 5],
                    borderWidth: 1.5,
                    pointRadius: 0
                },
                {
                    label: '负序分量',
                    data: [{ x: vn.real, y: vn.imag, label: 'nA' }, { x: vn.multiply(a_op).real, y: vn.multiply(a_op).imag, label: 'nB' }, { x: vn.multiply(a2_op).real, y: vn.multiply(a2_op).imag, label: 'nC' }],
                    borderColor: '#22c55e',
                    borderDash: [5, 5],
                    borderWidth: 1.5,
                    pointRadius: 0
                },
                {
                    label: '3倍零序',
                    data: [{ x: vz3.real, y: vz3.imag, label: '3X0' }],
                    borderColor: '#ef4444',
                    borderDash: [2, 2],
                    borderWidth: 2,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1,
            scales: {
                x: { min: -limit, max: limit, display: false },
                y: { min: -limit, max: limit, display: false }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { boxWidth: 12, font: { size: 11 } }
                }
            }
        },
        plugins: [phasorGridPlugin, vectorArrowsPlugin]
    });
}