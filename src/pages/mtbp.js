const array = [
  "北京四方",
  "南瑞继保",
  "长园深瑞",
  "国电南自",
  "国电南自（1200）",
  "南瑞科技",
  "许继电气",
  "其它",
];
const array_k = [
  [-30, 85, 90, -80, 80],
  [45, 90, 0, -75, 90],
  [-30, 85, 90, -80, 90],
  [-30, 90, 90, -90, 90],
  [-45, 90, 90, -90, 90],
  [45, 90, 0, -75, 90],
  [-30, 90, 90, -70, 90],
  [45, 90, 0, -75, 90],
];
let isOvercurrentMode = true;
let currentManufacturerIndex = 0;

export const renderMTBP = () => {
  return `
    <style>
        .unit { width: 30px; text-align: right; color: #888; font-size: 14px; flex-shrink: 0; margin-left: 4px; }
        .section-title { line-height: 4em; cursor: pointer; display: flex; justify-content: center; align-items: center; margin-bottom: 1px; }
        .section-title svg { margin-left: 8px; width: 18px; height: 18px; color: #07c160; }
        .chart-wrapper { background: white; margin-top: 10px; width: 100%; max-width: 500px; margin-left: auto; margin-right: auto; aspect-ratio: 1 / 1; position: relative; }
    </style>
    <div id="header" class="bg-white p-4 shadow-sm flex items-center justify-between font-bold text-lg sticky top-0 z-50">
        <a href="/" data-link class="w-12 text-gray-500 hover:text-gray-800 flex items-center" aria-label="返回首页">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </a>
        <div class="flex-1 text-center truncate">后备保护动作区</div>
        <div class="w-12"></div>
    </div>
    <div id="modeTitle" class="section-title bg-gray-100 hover:bg-gray-200 transition-colors" onclick="toggleZoneMode()">
        <span id="modeText">主变过流</span>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
    </div>
    <form id="zoneForm" class="mt-4">
        <div class="input-group">
            <label>保护厂家:</label>
            <select id="manufacturer" name="manufacturer" class="text-[#07c160] font-bold"></select>
        </div>
        <div class="input-group">
            <label>动作方向:</label>
            <select id="direction" name="direction" class="text-blue-600 font-bold">
                <option value="transformer" selected>指变压器</option>
                <option value="busbar">指母线</option>
            </select>
        </div>
        <div id="dynamicInputs"></div>
        <div class="px-4 mt-4">
            <button type="button" class="w-full bg-[#07c160] text-white rounded py-2 text-base font-bold active:bg-green-600 transition-colors" onclick="drawZoneChart()">生成向量图</button>
        </div>
    </form>
    <div id="results" class="hidden">
        <div class="chart-wrapper p-4">
            <canvas id="zoneCanvas"></canvas>
        </div>
    </div>
    `;
};

export const initMTBP = () => {
  isOvercurrentMode = true;
  currentManufacturerIndex = 0;
  window.toggleZoneMode = toggleZoneMode;
  window.drawZoneChart = drawZoneChart;

  const mSelect = document.getElementById("manufacturer");
  if (!mSelect) return;

  mSelect.innerHTML = "";
  array.forEach((name, index) => {
    const opt = document.createElement("option");
    opt.value = index;
    opt.textContent = name;
    mSelect.appendChild(opt);
  });
  mSelect.addEventListener("change", (e) => {
    currentManufacturerIndex = parseInt(e.target.value);
    renderDynamicInputs();
  });
  document
    .getElementById("direction")
    .addEventListener("change", () => drawZoneChart());
  renderDynamicInputs();
};

function toggleZoneMode() {
  isOvercurrentMode = !isOvercurrentMode;
  const modeTextEl = document.getElementById("modeText");
  if (modeTextEl)
    modeTextEl.innerText = isOvercurrentMode ? "主变过流" : "主变零流";
  renderDynamicInputs();
  document.getElementById("results")?.classList.add("hidden");
}

function renderDynamicInputs() {
  const container = document.getElementById("dynamicInputs");
  if (!container) return;
  const k = array_k[currentManufacturerIndex];
  const sensAngle = isOvercurrentMode ? k[0] : k[3];
  const opZone = isOvercurrentMode ? k[1] : k[4];
  const wiring = isOvercurrentMode ? k[2] : null;
  let html = `
        <div class="input-group">
            <label>灵敏角:</label>
            <input type="number" step="any" id="sensAngle" value="${sensAngle}" onfocus="this.select()">
            <span class="unit">°</span>
        </div>
        <div class="input-group">
            <label>动作区:</label>
            <input type="number" step="any" id="opZone" value="${opZone}" onfocus="this.select()">
            <span class="unit">°</span>
        </div>
    `;
  if (isOvercurrentMode) {
    html += `
        <div class="input-group">
            <label>接线方式:</label>
            <select id="wiringMode" name="wiringMode">
                <option value="0" ${wiring === 0 ? "selected" : ""}>0</option>
                <option value="90" ${wiring === 90 ? "selected" : ""}>90</option>
            </select>
            <span class="unit">°</span>
        </div>`;
  }
  container.innerHTML = html;
  if (!document.getElementById("results").classList.contains("hidden"))
    drawZoneChart();
}

function drawZoneChart() {
  document.getElementById("results").classList.remove("hidden");
  const canvas = document.getElementById("zoneCanvas");
  const ctx = canvas.getContext("2d");
  const size = canvas.parentElement.clientWidth - 32;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + "px";
  canvas.style.height = size + "px";
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2,
    cy = size / 2,
    radius = size / 2 - 30;
  const direction = document.getElementById("direction").value;
  const sensAngleRaw =
    parseFloat(document.getElementById("sensAngle").value) || 0;
  const opZone = parseFloat(document.getElementById("opZone").value) || 0;
  const wiringVal = isOvercurrentMode
    ? parseFloat(document.getElementById("wiringMode").value) || 0
    : 0;

  const baseCurrentAngle = isOvercurrentMode
    ? -(sensAngleRaw + wiringVal)
    : sensAngleRaw;
  const currentAngle =
    (baseCurrentAngle + (direction === "busbar" ? 180 : 0)) % 360;

  let refVLabel = "",
    refVAngle = 0;
  if (isOvercurrentMode) {
    if (wiringVal === 0) {
      refVLabel = "U1";
      refVAngle = 0;
    } else {
      refVLabel = "Ubc";
      refVAngle = -90;
    }
  } else {
    refVLabel = "3U0";
    refVAngle = -180;
  }
  const currentLabel = isOvercurrentMode ? "Ia" : "3I0";

  ctx.strokeStyle = "#eee";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, cy - radius - 15);
  ctx.lineTo(cx, cy + radius + 15);
  ctx.moveTo(cx - radius - 15, cy);
  ctx.lineTo(cx + radius + 15, cy);
  ctx.stroke();

  ctx.fillStyle = "#aaa";
  ctx.font = "10px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("0°", cx, cy - radius - 20);
  ctx.fillText("90°", cx - radius - 20, cy);
  ctx.fillText("180°", cx, cy + radius + 20);
  ctx.fillText("-90°", cx + radius + 20, cy);

  const getX = (deg, r) => cx - r * Math.sin((deg * Math.PI) / 180);
  const getY = (deg, r) => cy - r * Math.cos((deg * Math.PI) / 180);
  const getCanvasRad = (deg) => -Math.PI / 2 - (deg * Math.PI) / 180;

  const bound1 = currentAngle + opZone,
    bound2 = currentAngle - opZone;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, radius, getCanvasRad(bound2), getCanvasRad(bound1), true);
  ctx.closePath();
  ctx.fillStyle = "rgba(7, 193, 96, 0.1)";
  ctx.fill();

  const drawDashedLine = (deg, label) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(getX(deg, radius), getY(deg, radius));
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#333";
    ctx.font = "11px Arial";
    let displayDeg = deg % 360;
    if (displayDeg > 180) displayDeg -= 360;
    if (displayDeg <= -180) displayDeg += 360;
    ctx.fillText(
      label + " (" + displayDeg + "°)",
      getX(deg, radius + 15),
      getY(deg, radius + 15),
    );
  };
  drawDashedLine(bound1, "上边界");
  drawDashedLine(bound2, "下边界");
  drawVector(
    ctx,
    cx,
    cy,
    refVAngle,
    radius * 0.7,
    "#3b82f6",
    refVLabel,
    getX,
    getY,
  );
  drawVector(
    ctx,
    cx,
    cy,
    currentAngle,
    radius * 0.9,
    "#ef4444",
    currentLabel,
    getX,
    getY,
  );
}

function drawVector(ctx, cx, cy, deg, length, color, label, getX, getY) {
  const endX = getX(deg, length),
    endY = getY(deg, length);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  const angle = Math.atan2(endY - cy, endX - cx);
  ctx.save();
  ctx.translate(endX, endY);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-12, -5);
  ctx.lineTo(-12, 5);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = color;
  ctx.font = "bold 13px Arial";
  let displayDeg = deg % 360;
  if (displayDeg > 180) displayDeg -= 360;
  if (displayDeg <= -180) displayDeg += 360;
  ctx.fillText(
    `${label}: ${displayDeg}°`,
    getX(deg, length + 15),
    getY(deg, length + 15),
  );
}
