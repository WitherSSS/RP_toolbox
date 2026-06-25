export const renderBase = () => {
  return `
    <style>
        .base-container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .base-card { background: white; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); margin-bottom: 20px; }
        .input-group { margin-bottom: 20px; }
        .input-group label { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px; }
        .input-group label .title { font-weight: bold; color: #333; font-size: 14px; }
        .input-group label .badge { background: #f0fff4; color: #07c160; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        
        .input-group textarea { 
            width: 100%; 
            border: 1px solid #e5e7eb; 
            border-radius: 6px; 
            padding: 12px; 
            font-size: 16px; 
            font-family: 'Courier New', Courier, monospace; 
            outline: none; 
            transition: all 0.2s; 
            resize: vertical;
            min-height: 60px;
            word-break: break-all;
        }
        .input-group textarea:focus { border-color: #07c160; box-shadow: 0 0 0 2px rgba(7, 193, 96, 0.1); }
        .input-group textarea.is-invalid { border-color: #ef4444; background-color: #fef2f2; color: #ef4444; }
    </style>

    <div id="header" class="bg-white p-4 shadow-sm flex items-center justify-between font-bold text-lg sticky top-0 z-50">
        <a href="/" data-link class="w-12 text-gray-500 hover:text-gray-800 flex items-center" aria-label="返回首页">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </a>
        <div class="flex-1 text-center truncate">多进制转换</div>
        <div class="w-12"></div>
    </div>

    <div class="base-container">
        <div class="base-card">
            <div class="flex justify-between items-center mb-6 border-b pb-3">
                <div class="text-xs text-gray-500">
                </div>
                <select id="bitWidth" class="text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:border-green-500 bg-gray-50 font-bold text-gray-700">
                    <option value="64">64 Bit (Long)</option>
                    <option value="32">32 Bit (Int)</option>
                    <option value="16" selected>16 Bit (Short)</option>
                    <option value="8">8 Bit (Byte)</option>
                </select>
            </div>

            <div class="input-group">
                <label><span class="title">十六进制 (Hex)</span><span class="badge">Base 16</span></label>
                <textarea id="base-16" data-radix="16" rows="2"></textarea>
            </div>
            
            <div class="input-group">
                <label><span class="title">十进制 (Dec)</span><span class="badge text-blue-600 bg-blue-50">Base 10</span></label>
                <textarea id="base-10" data-radix="10" rows="2"></textarea>
            </div>
            
            <div class="input-group">
                <label><span class="title">八进制 (Oct)</span><span class="badge text-purple-600 bg-purple-50">Base 8</span></label>
                <textarea id="base-8" data-radix="8" rows="2"></textarea>
            </div>
            
            <div class="input-group">
                <label><span class="title">二进制 (Bin)</span><span class="badge text-orange-600 bg-orange-50">Base 2</span></label>
                <textarea id="base-2" data-radix="2" rows="3"></textarea>
            </div>
        </div>
    </div>
    `;
};

export const initBase = () => {
  const bases = [16, 10, 8, 2];
  const inputs = bases.map((radix) => document.getElementById(`base-${radix}`));
  const bitWidthSelect = document.getElementById("bitWidth");
  let lastActiveInput = document.getElementById("base-10");
  const regexMap = {
    16: /^-?[0-9A-Fa-f]+$/,
    10: /^-?[0-9]+$/,
    8: /^-?[0-7]+$/,
    2: /^-?[01]+$/,
  };

  const formatGroup = (str) => {
    return str
      .split("")
      .reverse()
      .reduce((acc, char, index) => {
        return char + (index > 0 && index % 4 === 0 ? " " : "") + acc;
      }, "");
  };

  const convert = (sourceInput) => {
    if (!sourceInput) return;
    lastActiveInput = sourceInput;
    const sourceRadix = parseInt(sourceInput.getAttribute("data-radix"));
    let rawStr = sourceInput.value.replace(/[\s,_]+/g, "");

    if (!rawStr || rawStr === "-") {
      inputs.forEach((inp) => {
        if (inp !== sourceInput) inp.value = "";
        inp.classList.remove("is-invalid");
      });
      return;
    }

    if (!regexMap[sourceRadix].test(rawStr)) {
      sourceInput.classList.add("is-invalid");
      return;
    }
    sourceInput.classList.remove("is-invalid");

    try {
      const bits = BigInt(bitWidthSelect.value);
      const mask = (1n << bits) - 1n;
      const signBit = 1n << (bits - 1n);
      const isNegative = rawStr.startsWith("-");
      const absStr = isNegative ? rawStr.substring(1) : rawStr;
      let rawBigInt;
      if (sourceRadix === 16) rawBigInt = BigInt("0x" + absStr);
      else if (sourceRadix === 8) rawBigInt = BigInt("0o" + absStr);
      else if (sourceRadix === 2) rawBigInt = BigInt("0b" + absStr);
      else rawBigInt = BigInt(absStr);

      if (isNegative) rawBigInt = -rawBigInt;
      const internalValUnsigned = rawBigInt & mask;

      inputs.forEach((inp) => {
        if (inp !== sourceInput) {
          inp.classList.remove("is-invalid");
          const targetRadix = parseInt(inp.getAttribute("data-radix"));
          let outStr = "";

          if (targetRadix === 10) {
            let signedVal = internalValUnsigned;
            if ((internalValUnsigned & signBit) !== 0n) {
              signedVal = internalValUnsigned - (1n << bits);
            }
            outStr = signedVal.toString(10);
          } else {
            outStr = internalValUnsigned.toString(targetRadix);
            if (targetRadix === 16) outStr = outStr.toUpperCase();
            if (targetRadix === 2) outStr = outStr.padStart(Number(bits), "0");
            if (targetRadix === 16)
              outStr = outStr.padStart(Number(bits) / 4, "0");
            if (targetRadix === 8)
              outStr = outStr.padStart(Math.ceil(Number(bits) / 3), "0");
            outStr = formatGroup(outStr);
          }
          inp.value = outStr;
        }
      });
    } catch (err) {
      sourceInput.classList.add("is-invalid");
    }
  };

  inputs.forEach((inp) => {
    if (inp) {
      inp.addEventListener("input", (e) => convert(e.target));
      inp.addEventListener("focus", () => inp.select());
    }
  });
  bitWidthSelect.addEventListener("change", () => convert(lastActiveInput));
};
