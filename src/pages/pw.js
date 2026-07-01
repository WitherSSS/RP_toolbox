let appState = { rawRecords: [] };
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");

// 数据兼容处理：兼容旧版单条数据和新版多条 items 数组
function getRecordItems(record) {
  if (record.items && Array.isArray(record.items)) return record.items;
  return [{ password: record.password || "", model: record.model || "", remark: record.remark || "" }];
}

export const renderPW = () => {
  return `
    <style>
        .accordion-content { transition: max-height 0.25s ease-out, opacity 0.2s ease-out; max-height: 0; opacity: 0; overflow: hidden; }
        .accordion-content.open { opacity: 1; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .alpha-sidebar { user-select: none; touch-action: none; }
    </style>
    <div id="appView" class="flex-1 flex flex-col max-w-2xl w-full mx-auto bg-white shadow-sm min-h-screen relative pb-20">
        <div id="header" class="bg-white p-4 shadow-sm flex items-center justify-between font-bold text-lg sticky top-0 z-30">
            <a href="/" data-link class="w-12 text-gray-500 hover:text-gray-800 flex items-center" aria-label="返回首页">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            </a>
            <div class="flex-1 text-center text-gray-800 truncate">设备口令库</div>
            <div class="w-12 flex justify-end">
                <button onclick="openModal()" class="bg-[#07c160] hover:bg-[#06ad56] text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors shadow-sm flex items-center">添加</button>
            </div>
        </div>
        <div class="p-4 bg-white sticky top-[60px] z-30 border-b border-slate-50">
            <div class="relative">
                <input type="text" id="searchInput" oninput="handleSearch()" placeholder="搜索厂家、型号、备注..." class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#07c160] focus:bg-white transition-all text-sm">
                <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
        </div>
        <div id="listContainer" class="flex-1 overflow-y-auto px-4 py-2 space-y-6 no-scrollbar">
            <div class="text-center py-16 text-slate-400 text-sm animate-pulse">数据加载中...</div>
        </div>
        <div id="alphaSidebar" class="alpha-sidebar fixed right-2 top-1/2 -translate-y-1/2 flex flex-col items-center bg-white/90 backdrop-blur-md py-3 px-1.5 rounded-full shadow-md border border-slate-100 z-40 space-y-0.5 text-[10px] font-bold text-slate-400">
        </div>
    </div>
    
    <div id="formModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 flex-shrink-0">
                <h3 id="modalTitle" class="text-lg font-bold text-slate-900">添加记录</h3>
                <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <div class="overflow-y-auto p-6 flex-1 no-scrollbar">
                <form id="recordForm" onsubmit="saveRecord(event)" class="space-y-4">
                    <input type="hidden" id="recordId">
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">厂家名称 <span class="text-red-500">*</span></label>
                        <input type="text" id="formVendor" required class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#07c160] focus:outline-none text-sm mb-2">
                    </div>
                    
                    <div id="entriesContainer" class="space-y-2"></div>
                    
                    <button type="button" onclick="addFormEntry()" class="w-full mt-2 py-2 border-2 border-dashed border-slate-200 text-slate-500 rounded-lg text-sm font-bold hover:border-[#07c160] hover:text-[#07c160] bg-slate-50/50 hover:bg-[#f0fff4] transition-colors flex items-center justify-center space-x-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        <span>添加一行口令</span>
                    </button>

                    <div class="mt-6 pt-4 border-t border-slate-100">
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 text-[#07c160]">管理员验证 <span class="text-red-500">*</span></label>
                        <input type="text" id="adminPassword" required placeholder="输入操作授权码" style="-webkit-text-security: disc;" class="w-full px-3 py-2 border border-[#c6f6d5] bg-[#f0fff4] rounded-xl focus:ring-2 focus:ring-[#07c160] focus:outline-none text-sm font-mono text-center tracking-widest">
                    </div>
                    <div class="pt-4 flex space-x-3">
                        <button type="button" id="deleteBtn" onclick="deleteRecord()" class="hidden flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2.5 rounded-xl transition-colors text-sm">删除</button>
                        <button type="submit" class="flex-2 flex-1 bg-[#07c160] hover:bg-[#06ad56] text-white font-semibold py-2.5 rounded-xl transition-colors shadow-sm text-sm text-center">保存上传</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <div id="toast" class="fixed top-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-full shadow-lg z-50 hidden transition-all duration-300 opacity-0 transform -translate-y-4 flex items-center space-x-2 text-sm text-white font-medium">
        <span id="toastMsg">提示信息</span>
    </div>
    `;
};

export const initPW = () => {
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.handleSearch = handleSearch;
  window.toggleAccordion = toggleAccordion;
  window.saveRecord = saveRecord;
  window.deleteRecord = deleteRecord;
  window.addFormEntry = addFormEntry; 

  initAlphaSidebar();
  setupTouchListeners();
  fetchData();
};

function addFormEntry(data = {}) {
    const container = document.getElementById('entriesContainer');
    const row = document.createElement('div');
    row.className = 'entry-row flex items-start gap-2 bg-white border border-slate-200 rounded-lg p-2 relative shadow-sm transition-all';
    row.innerHTML = `
        <div class="flex-1">
            <textarea required rows="2" placeholder="设备口令 *" class="entry-password w-full px-2 py-1.5 border border-slate-200 rounded-md focus:ring-2 focus:ring-[#07c160] focus:outline-none text-sm font-mono whitespace-pre-wrap resize-y">${escapeHtml(data.password || '')}</textarea>
        </div>
        <div class="flex-1">
            <input type="text" placeholder="设备型号" class="entry-model w-full px-2 py-1.5 border border-slate-200 rounded-md focus:ring-2 focus:ring-[#07c160] focus:outline-none text-sm" value="${escapeHtml(data.model || '')}">
        </div>
        <div class="flex-1">
            <input type="text" placeholder="备注信息" class="entry-remark w-full px-2 py-1.5 border border-slate-200 rounded-md focus:ring-2 focus:ring-[#07c160] focus:outline-none text-sm" value="${escapeHtml(data.remark || '')}">
        </div>
        <button type="button" onclick="this.closest('.entry-row').remove()" class="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0 mt-1.5 px-1" title="删除此行">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
    `;
    container.appendChild(row);
}

function initAlphaSidebar() {
  const sidebar = document.getElementById("alphaSidebar");
  if (sidebar) {
    sidebar.innerHTML = ALPHABET.map(
      (l) => `<div data-letter="${l}" class="w-5 h-5 flex items-center justify-center rounded-full transition-all cursor-pointer">${l}</div>`,
    ).join("");
  }
}

function setupTouchListeners() {
  const sidebar = document.getElementById("alphaSidebar");
  if (!sidebar) return;
  const handleAlphaNav = (clientX, clientY) => {
    const target = document.elementFromPoint(clientX, clientY);
    if (target && target.dataset && target.dataset.letter) {
      const letter = target.dataset.letter;
      Array.from(sidebar.children).forEach((el) => {
        if (el.dataset.letter === letter)
          el.classList.add("bg-[#07c160]", "text-white", "scale-110");
        else el.classList.remove("bg-[#07c160]", "text-white", "scale-110");
      });
      scrollToSection(letter);
    }
  };
  sidebar.addEventListener("touchstart", (e) =>
    handleAlphaNav(e.touches[0].clientX, e.touches[0].clientY),
  );
  sidebar.addEventListener("touchmove", (e) => {
    e.preventDefault();
    handleAlphaNav(e.touches[0].clientX, e.touches[0].clientY);
  });
  sidebar.addEventListener("touchend", () =>
    setTimeout(
      () =>
        Array.from(sidebar.children).forEach((el) =>
          el.classList.remove("bg-[#07c160]", "text-white", "scale-110"),
        ),
      300,
    ),
  );
  sidebar.addEventListener("mousedown", (e) => {
    handleAlphaNav(e.clientX, e.clientY);
    const onMouseMove = (me) => handleAlphaNav(me.clientX, me.clientY);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener(
      "mouseup",
      () => {
        window.removeEventListener("mousemove", onMouseMove);
        Array.from(sidebar.children).forEach((el) =>
          el.classList.remove("bg-[#07c160]", "text-white", "scale-110"),
        );
      },
      { once: true },
    );
  });
}

function scrollToSection(letter) {
  const el = document.getElementById(`section-${letter}`);
  if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
}

async function fetchData() {
  try {
    const response = await fetch("/api/passwords");
    if (!response.ok) throw new Error("网络响应不正常");
    const data = await response.json();
    appState.rawRecords = Array.isArray(data) ? data : [];
    renderRecords();
  } catch (err) {
    showToast("数据加载失败，请检查网络", "error");
    const container = document.getElementById("listContainer");
    if (container)
      container.innerHTML = `<div class="text-center py-16 text-red-400 text-sm">拉取云端数据失败 (或处于离线模式未缓存)</div>`;
  }
}

function getFirstLetter(str) {
  if (!str) return "#";
  const firstChar = str.trim().charAt(0);
  if (/^[A-Za-z]/.test(firstChar)) return firstChar.toUpperCase();
  try {
    return firstChar.localeCompare("阿", "zh") < 0 ? "#" : firstChar.localeCompare("八", "zh") < 0 ? "A" : firstChar.localeCompare("擦", "zh") < 0 ? "B" : firstChar.localeCompare("搭", "zh") < 0 ? "C" : firstChar.localeCompare("蛾", "zh") < 0 ? "D" : firstChar.localeCompare("发", "zh") < 0 ? "E" : firstChar.localeCompare("噶", "zh") < 0 ? "F" : firstChar.localeCompare("哈", "zh") < 0 ? "G" : firstChar.localeCompare("击", "zh") < 0 ? "H" : firstChar.localeCompare("喀", "zh") < 0 ? "J" : firstChar.localeCompare("垃", "zh") < 0 ? "K" : firstChar.localeCompare("妈", "zh") < 0 ? "L" : firstChar.localeCompare("拿", "zh") < 0 ? "M" : firstChar.localeCompare("哦", "zh") < 0 ? "N" : firstChar.localeCompare("啪", "zh") < 0 ? "O" : firstChar.localeCompare("期", "zh") < 0 ? "P" : firstChar.localeCompare("然", "zh") < 0 ? "Q" : firstChar.localeCompare("撒", "zh") < 0 ? "R" : firstChar.localeCompare("塌", "zh") < 0 ? "S" : firstChar.localeCompare("挖", "zh") < 0 ? "T" : firstChar.localeCompare("昔", "zh") < 0 ? "W" : firstChar.localeCompare("压", "zh") < 0 ? "X" : firstChar.localeCompare("匝", "zh") < 0 ? "Y" : "Z";
  } catch (e) {
    return "#";
  }
}

function renderRecords(filterText = "") {
  const container = document.getElementById("listContainer");
  if (!container) return;
  container.innerHTML = "";
  const keyword = filterText.trim().toLowerCase();
  
  const filtered = appState.rawRecords.filter(r => {
    if (r.vendor.toLowerCase().includes(keyword)) return true;
    const items = getRecordItems(r);
    return items.some(item => 
      (item.model && item.model.toLowerCase().includes(keyword)) ||
      (item.remark && item.remark.toLowerCase().includes(keyword)) ||
      (item.password && item.password.toLowerCase().includes(keyword))
    );
  });

  let groups = {};
  ALPHABET.forEach((l) => (groups[l] = []));
  filtered.forEach((item) => {
    let letter = getFirstLetter(item.vendor);
    if (!groups[letter]) letter = "#";
    groups[letter].push(item);
  });

  let hasContent = false;
  ALPHABET.forEach((letter) => {
    const itemsGroup = groups[letter];
    if (itemsGroup.length === 0) return;
    hasContent = true;
    const section = document.createElement("div");
    section.id = `section-${letter}`;
    section.className = "scroll-mt-32";
    section.innerHTML = `<h2 class="text-xs font-bold text-[#07c160] bg-slate-50 py-1 mb-2 px-1 tracking-wider rounded">${letter}</h2><div class="bg-white rounded-xl border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">${itemsGroup
      .map((item) => {
        const recordItems = getRecordItems(item);
        let allPwList = [];
        recordItems.forEach(it => {
            allPwList = allPwList.concat((it.password || "").split("\n").map(p => p.trim()).filter(Boolean));
        });

        return `<div class="bg-white">
            <div onclick="toggleAccordion(this)" class="w-full px-4 py-3.5 flex justify-between items-center hover:bg-slate-50/50 cursor-pointer active:bg-slate-100/50 transition-colors">
                <div class="font-semibold text-slate-800 text-base flex-shrink-0 truncate max-w-[45%]">
                    ${escapeHtml(item.vendor)}
                </div>
                <div class="flex-1 min-w-0 mx-3 flex justify-end" onclick="event.stopPropagation();">
                    <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-nowrap" style="max-width: 100%;">
                        ${allPwList.length ? allPwList.map(pw => `<span class="text-xs font-mono font-bold text-[#07c160] bg-[#f0fff4] border border-[#c6f6d5] px-2 py-1 rounded whitespace-nowrap select-all">${escapeHtml(pw)}</span>`).join('') : '<span class="text-slate-400 text-xs">暂无口令</span>'}
                    </div>
                </div>
                <button onclick="event.stopPropagation(); openModal('${item.id}')" class="flex-shrink-0 text-slate-300 hover:text-[#07c160] p-1 border-l border-slate-100 pl-2 ml-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
            </div>
            
            <div class="accordion-content bg-slate-50/40">
                <div class="px-3 py-2 border-t border-slate-100 space-y-1.5">
                    ${recordItems.map((rItem) => {
                        const subPwList = (rItem.password || "").split("\n").map(p => p.trim()).filter(Boolean);
                        return `
                        <div class="flex items-center gap-2 bg-white px-2 py-1.5 rounded-md border border-slate-200/50 shadow-sm text-xs">
                            <div class="flex-1 min-w-0 flex items-center gap-1 overflow-x-auto no-scrollbar">
                                ${subPwList.length ? subPwList.map(p => `<span class="text-[#07c160] font-mono font-bold bg-[#f0fff4] border border-[#c6f6d5] px-1 py-0.5 rounded select-all whitespace-nowrap">${escapeHtml(p)}</span>`).join('') : '<span class="text-slate-300 font-normal">-</span>'}
                            </div>
                            <div class="flex-1 min-w-0 text-slate-600 truncate border-l border-slate-100 pl-2" title="${escapeHtml(rItem.model)}">${escapeHtml(rItem.model) || '<span class="text-slate-300 font-normal">-</span>'}</div>
                            <div class="flex-1 min-w-0 text-slate-500 truncate border-l border-slate-100 pl-2" title="${escapeHtml(rItem.remark)}">${escapeHtml(rItem.remark) || '<span class="text-slate-300 font-normal">-</span>'}</div>
                        </div>`;
                    }).join("")}
                </div>
            </div>
        </div>`;
      })
      .join("")}</div>`;
    container.appendChild(section);
  });
  if (!hasContent)
    container.innerHTML = `<div class="text-center py-16 text-slate-400 text-sm"><svg class="w-12 h-12 mx-auto text-slate-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>暂无匹配的密码记录</div>`;
}

function toggleAccordion(el) {
  const content = el.nextElementSibling;
  if (content.classList.contains("open")) {
    content.style.maxHeight = "0px";
    content.classList.remove("open");
  } else {
    content.style.maxHeight = content.scrollHeight + "px";
    content.classList.add("open");
  }
}

function handleSearch() {
  renderRecords(document.getElementById("searchInput").value);
}

function openModal(id = null) {
  const modal = document.getElementById("formModal");
  document.getElementById("recordForm").reset();
  document.getElementById("entriesContainer").innerHTML = ""; 
  document.getElementById("adminPassword").value = sessionStorage.getItem("admin_pass") || "";
  
  if (id && typeof id === "string") {
    const record = appState.rawRecords.find((r) => r.id === id);
    if (record) {
      document.getElementById("modalTitle").textContent = "修改记录详情";
      document.getElementById("recordId").value = record.id;
      document.getElementById("formVendor").value = record.vendor;
      
      const items = getRecordItems(record);
      items.forEach(it => addFormEntry(it));
      
      document.getElementById("deleteBtn").classList.remove("hidden");
    }
  } else {
    document.getElementById("modalTitle").textContent = "新增密码记录";
    document.getElementById("recordId").value = "";
    document.getElementById("deleteBtn").classList.add("hidden");
    addFormEntry(); 
  }
  modal.classList.remove("hidden");
}

function closeModal() {
  document.getElementById("formModal").classList.add("hidden");
}

async function saveRecord(e) {
  e.preventDefault();
  const id = document.getElementById("recordId").value;
  const vendor = document.getElementById("formVendor").value.trim();
  const adminPass = document.getElementById("adminPassword").value.trim();
  
  const entryEls = document.querySelectorAll('.entry-row');
  const items = Array.from(entryEls).map(el => {
      return {
          password: el.querySelector('.entry-password').value.trim(),
          model: el.querySelector('.entry-model').value.trim(),
          remark: el.querySelector('.entry-remark').value.trim()
      };
  }).filter(it => it.password); 

  if (!vendor || items.length === 0 || !adminPass) {
      return showToast("请完整填写必填项(厂家及至少一条口令)", "error");
  }
  
  sessionStorage.setItem("admin_pass", adminPass);
  let newRecords = [...appState.rawRecords];
  
  const topLevelData = {
      password: items[0].password,
      model: items[0].model,
      remark: items[0].remark
  };

  if (id) {
    const idx = newRecords.findIndex((r) => r.id === id);
    if (idx !== -1) newRecords[idx] = { id, vendor, items, ...topLevelData };
  } else {
    newRecords.push({
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      vendor,
      items,
      ...topLevelData
    });
  }
  await syncToCloudflare(newRecords, adminPass);
}

async function deleteRecord() {
  const id = document.getElementById("recordId").value;
  const vendor = document.getElementById("formVendor").value;
  const adminPass = document.getElementById("adminPassword").value.trim();
  if (!adminPass) return showToast("请输入管理员操作密码", "error");
  if (!id) return;
  const confirmName = prompt(`警告：此操作不可逆！\n请输入设备厂家名称 "${vendor}" 以确认永久删除：`);
  if (confirmName !== vendor) return showToast("输入不匹配，已取消删除", "error");
  
  sessionStorage.setItem("admin_pass", adminPass);
  const newRecords = appState.rawRecords.filter((r) => r.id !== id);
  await syncToCloudflare(newRecords, adminPass);
}

async function syncToCloudflare(newRecordsData, adminPass) {
  const btn = document.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.innerHTML = "正在上传...";
  try {
    const payload = { password: adminPass, data: newRecordsData };
    const response = await fetch("/api/passwords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.status === 401) throw new Error("管理员密码错误，拒绝修改");
    let resData = {};
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      resData = await response.json();
    }
    if (!response.ok) throw new Error(resData.error || `服务器响应异常 (${response.status})`);
    
    appState.rawRecords = newRecordsData;
    showToast("数据同步成功", "success");
    closeModal();
    renderRecords(document.getElementById("searchInput").value);
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = "保存上传";
  }
}

function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  const msgEl = document.getElementById("toastMsg");
  if (!toast || !msgEl) return;

  toast.className = `fixed top-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full shadow-lg z-[100] transition-all duration-300 flex items-center space-x-2 text-sm text-white font-medium transform`;
  if (type === "success") toast.classList.add("bg-[#07c160]");
  else toast.classList.add("bg-red-500");
  msgEl.textContent = msg;
  requestAnimationFrame(() => {
    toast.classList.remove("hidden");
    setTimeout(() => {
      toast.classList.remove("opacity-0", "-translate-y-4");
      toast.classList.add("opacity-100", "translate-y-0");
    }, 10);
  });
  setTimeout(() => {
    toast.classList.remove("opacity-100", "translate-y-0");
    toast.classList.add("opacity-0", "-translate-y-4");
    setTimeout(() => toast.classList.add("hidden"), 300);
  }, 2500);
}

function escapeHtml(string) {
  const matchHtmlRegExp = /["'&<>]/;
  const str = "" + string;
  const match = matchHtmlRegExp.exec(str);
  if (!match) return str;
  let escape;
  let html = "";
  let index = 0;
  let lastIndex = 0;
  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: escape = "&quot;"; break;
      case 38: escape = "&amp;"; break;
      case 39: escape = "&#39;"; break;
      case 60: escape = "&lt;"; break;
      case 62: escape = "&gt;"; break;
      default: continue;
    }
    if (lastIndex !== index) html += str.substring(lastIndex, index);
    lastIndex = index + 1;
    html += escape;
  }
  return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
}