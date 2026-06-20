export const renderDT = () => {
    return `
    <style>
        .dt-container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .input-area { background: white; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); margin-bottom: 20px; }
        
        
        .input-area textarea { 
            width: 100%; 
            border: 1px solid #eee; 
            border-radius: 4px; 
            padding: 10px; 
            font-size: 14px; 
            outline: none; 
            resize: vertical; 
            min-height: 120px; 
            font-family: monospace; 
        }
        .input-area textarea:focus { border-color: #07c160; }
        
        .result-box { background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 8px; font-family: 'Courier New', Courier, monospace; font-size: 14px; line-height: 1.6; white-space: pre-wrap; word-break: break-all; min-height: 100px; position: relative; }
        .copy-btn { position: absolute; top: 10px; right: 10px; background: #444; color: #eee; font-size: 12px; padding: 4px 8px; border-radius: 4px; cursor: pointer; user-select: none; }
        .copy-btn:hover { background: #555; }
    </style>
    <div id="header" class="bg-white p-4 shadow-sm flex items-center justify-between font-bold text-lg sticky top-0 z-50">
        <a href="/" data-link class="w-12 text-gray-500 hover:text-gray-800 flex items-center" aria-label="返回首页">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </a>
        <div class="flex-1 text-center truncate">文本转 GBK 16进制</div>
        <div class="w-12"></div>
    </div>
    <div class="dt-container">
        <div class="input-area">
            <div class="text-sm text-gray-500 mb-2">输入文本：</div>
            <textarea id="inputText" class="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-green-500 focus:outline-none min-h-[120px] font-mono" oninput="convertDT()" placeholder="在此输入文字，结果将实时显示..."></textarea>
        </div>
        
        <div id="resultContainer" class="hidden">
            <div class="text-sm text-gray-500 mb-2">转换结果 (GBK Hex 4位)：</div>
            <div class="result-box" id="resultContent">
                <div class="copy-btn" id="copyBtn" onclick="copyResultDT()">复制</div>
                <div id="hexOutput"></div>
            </div>
        </div>
    </div>
    `;
};
export const initDT = () => {
    
    if (!window.GBK) {
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/gbk.js/dist/gbk.min.js";
        script.onload = () => {
            if (document.getElementById('inputText')?.value) {
                window.convertDT();
            }
        };
        document.head.appendChild(script);
    }
    
    window.convertDT = convertDT;
    window.copyResultDT = copyResultDT;
};
function convertDT() {
    const inputEl = document.getElementById('inputText');
    const containerEl = document.getElementById('resultContainer');
    const outputEl = document.getElementById('hexOutput');
    
    if (!inputEl || !containerEl || !outputEl) return;
    
    const input = inputEl.value;
    if (!input) {
        containerEl.classList.add('hidden');
        outputEl.innerText = "";
        return;
    }
    if (!window.GBK) {
        outputEl.innerText = "GBK 转换引擎正在后台加载，请稍候...";
        containerEl.classList.remove('hidden');
        return;
    }
    const lines = input.split('\n');
    let finalOutput = [];
    lines.forEach(line => {
        let lineHex = "";
        for (let char of line) {
            const bytes = window.GBK.encode(char);
            let hexString = "";
            
            bytes.forEach(byte => {
                hexString += byte.toString(16).toUpperCase().padStart(2, '0');
            });
            
            if (hexString.length === 2) {
                hexString = "00" + hexString;
            }
            lineHex += hexString + " ";
        }
        finalOutput.push(lineHex.trim());
    });
    outputEl.innerText = finalOutput.join('\n');
    containerEl.classList.remove('hidden');
}
function copyResultDT() {
    const outputEl = document.getElementById('hexOutput');
    const copyBtn = document.getElementById('copyBtn');
    if (!outputEl || !copyBtn) return;
    
    const text = outputEl.innerText;
    if (!text || text.startsWith("GBK 转换引擎")) return;
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        const originalText = copyBtn.innerText;
        copyBtn.innerText = "已复制";
        copyBtn.style.color = "#07c160";
        setTimeout(() => {
            copyBtn.innerText = originalText;
            copyBtn.style.color = "#eee";
        }, 1500);
    } catch (err) {
        console.error("复制失败: ", err);
    }
    
    document.body.removeChild(textarea);
}