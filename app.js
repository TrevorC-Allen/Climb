const STORE_KEY = "climb.training.v1";
const SENT_RESULTS = new Set(["flash", "onsight", "send"]);
const ROUTE_DISCIPLINES = new Set(["toprope", "lead"]);

const STYLE_OPTIONS = [
  ["slab", "板壁"],
  ["vertical", "直壁"],
  ["overhang", "仰角"],
  ["crimp", "小边"],
  ["sloper", "斜面"],
  ["dynamic", "动态"],
  ["balance", "平衡"],
  ["footwork", "脚法"],
  ["endurance", "耐力"],
  ["power", "力量"],
];

const DISCIPLINE_LABELS = {
  boulder: "抱石",
  toprope: "顶绳",
  lead: "先锋",
};

const RESULT_LABELS = {
  flash: "Flash",
  onsight: "Onsight",
  send: "完成",
  attempt: "尝试",
  fail: "未完成",
};

const GRADE_OPTIONS = {
  V: ["V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12"],
  YDS: ["5.7", "5.8", "5.9", "5.10a", "5.10b", "5.10c", "5.10d", "5.11a", "5.11b", "5.11c", "5.11d", "5.12a", "5.12b", "5.12c", "5.12d", "5.13a"],
};

const MEDIAPIPE_TASKS_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34";
const MEDIAPIPE_WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm";
const POSE_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task";

const POSE_CONNECTIONS = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [27, 31],
  [24, 26],
  [26, 28],
  [28, 32],
];

const SUPPORT_LANDMARKS = [
  { id: "leftHand", index: 15 },
  { id: "rightHand", index: 16 },
  { id: "leftFoot", index: 31, fallbackIndex: 27 },
  { id: "rightFoot", index: 32, fallbackIndex: 28 },
];

const DEFAULT_GYMS = ["Vmore", "香蕉攀岩", "AOB", "岩时"];

const LEGACY_GYM_MAP = {
  "岩点 Boulder Lab": "Vmore",
  "白石岩馆": "香蕉攀岩",
  "云壁 Climb": "AOB",
};

let state = loadState();
let dashboardFilter = "all";
let cameraStream = null;
let overlayFrame = null;
let showCenterTrail = false;
let centerTrail = [];
let poseLandmarker = null;
let poseModelLoading = false;
let poseTrackingActive = false;
let poseFrame = null;
let latestPoseLandmarks = null;
let latestPoseValues = null;
let lastPoseVideoTime = -1;
let lastPoseRenderTime = 0;
let supportTracker = {};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

document.addEventListener("DOMContentLoaded", () => {
  $("#todayLabel").textContent = formatLongDate(new Date());
  renderStyleTags();
  bindEvents();
  setFormDefaults();
  updateGradeOptions();
  renderAll();
  updateMotionAnalyzer();
  startOverlayLoop();
  registerServiceWorker();
});

function bindEvents() {
  $$("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  $$(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      dashboardFilter = button.dataset.disciplineFilter;
      $$(".segment").forEach((item) => item.classList.toggle("active", item === button));
      renderGradeChart();
    });
  });

  $("#entryForm").addEventListener("submit", handleEntrySubmit);
  $("#entryForm").addEventListener("reset", () => {
    setTimeout(() => {
      setFormDefaults();
      updateGradeOptions();
    }, 0);
  });

  $("#fillTodayButton").addEventListener("click", () => {
    $("#dateInput").value = toDateInputValue(new Date());
    renderSessionSummary();
  });

  $("#dateInput").addEventListener("change", renderSessionSummary);

  $("#rpeInput").addEventListener("input", () => {
    $("#rpeOutput").textContent = $("#rpeInput").value;
  });

  $("#disciplineInput").addEventListener("change", () => {
    $("#gradeSystemInput").value = $("#disciplineInput").value === "boulder" ? "V" : "YDS";
    $("#gradeInput").value = "";
    updateGradeOptions();
  });

  $("#gradeSystemInput").addEventListener("change", () => {
    $("#gradeInput").value = "";
    updateGradeOptions();
  });

  $("#historyFilter").addEventListener("change", renderHistory);
  $("#gymFilter").addEventListener("change", renderHistory);
  $("#historyTable").addEventListener("click", handleHistoryClick);

  $("#exportButton").addEventListener("click", exportData);
  $("#importButton").addEventListener("click", () => $("#importInput").click());
  $("#importInput").addEventListener("change", importData);
  $("#clearButton").addEventListener("click", clearData);

  $("#cameraButton").addEventListener("click", toggleCamera);
  $("#centerTrailButton").addEventListener("click", toggleCenterTrail);
  $("#videoInput").addEventListener("change", handleVideoImport);
  $("#saveSnapshotButton").addEventListener("click", saveMotionSnapshot);

  ["leftElbowRange", "rightElbowRange", "supportRange", "centerRange", "twistRange"].forEach((id) => {
    $(`#${id}`).addEventListener("input", updateMotionAnalyzer);
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  navigator.serviceWorker.register("./sw.js").catch((error) => {
    console.warn("Service worker registration failed", error);
  });
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return migrateState({
        entries: Array.isArray(parsed.entries) ? parsed.entries : [],
        motionSnapshots: Array.isArray(parsed.motionSnapshots) ? parsed.motionSnapshots : [],
      });
    }
  } catch (error) {
    console.warn("Failed to load local data", error);
  }

  return createSeedState();
}

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function createSeedState() {
  return {
    entries: [
      seedEntry(-24, "Vmore", "boulder", "V", "V2", "flash", 1, 4, ["slab", "footwork"], "静音脚做得不错。"),
      seedEntry(-22, "香蕉攀岩", "boulder", "V", "V3", "send", 2, 6, ["vertical", "balance"], "最后一手需要先压髋。"),
      seedEntry(-20, "香蕉攀岩", "boulder", "V", "V4", "attempt", 5, 8, ["overhang", "power"], "第二个大动态还不稳定。"),
      seedEntry(-18, "AOB", "toprope", "YDS", "5.10a", "onsight", 1, 5, ["vertical", "endurance"], "节奏稳定。"),
      seedEntry(-15, "Vmore", "boulder", "V", "V3", "flash", 1, 5, ["sloper", "balance"], "斜面点需要保持重心低。"),
      seedEntry(-13, "Vmore", "boulder", "V", "V4", "send", 3, 7, ["crimp", "footwork"], "换脚后身体没有晃。"),
      seedEntry(-10, "岩时", "lead", "YDS", "5.10c", "attempt", 2, 8, ["endurance", "vertical"], "上半段泵感明显。"),
      seedEntry(-7, "香蕉攀岩", "boulder", "V", "V4", "fail", 6, 9, ["overhang", "dynamic"], "开门严重，右脚没有跟上。"),
      seedEntry(-5, "Vmore", "boulder", "V", "V5", "attempt", 4, 8, ["power", "dynamic"], "第一段可以进，收尾掉。"),
      seedEntry(-3, "AOB", "toprope", "YDS", "5.10b", "send", 1, 6, ["endurance", "footwork"], "脚点读取更快。"),
      seedEntry(-1, "岩时", "boulder", "V", "V4", "send", 2, 7, ["vertical", "balance"], "重心移动更平顺。"),
    ],
    motionSnapshots: [
      {
        id: makeId(),
        date: offsetDate(-1),
        leftElbow: 156,
        rightElbow: 176,
        support: 2,
        centerOffset: 48,
        twist: 34,
        evaluation: {
          score: 61,
          openDoorRisk: true,
          armIssue: "右手接近锁死",
        },
      },
    ],
  };
}

function migrateState(data) {
  return {
    entries: data.entries.map((entry) => {
      if (!GRADE_OPTIONS[entry.gradeSystem]) {
        return {
          ...entry,
          gym: normalizeGymName(entry.gym),
          gradeSystem: entry.discipline === "boulder" ? "V" : "YDS",
          grade: entry.discipline === "boulder" ? legacyBoulderToV(entry.grade) : legacyRouteToYds(entry.grade),
        };
      }

      return {
        ...entry,
        gym: normalizeGymName(entry.gym),
        grade: formatGradeInput(entry.gradeSystem, entry.grade),
      };
    }),
    motionSnapshots: data.motionSnapshots,
  };
}

function normalizeGymName(gym) {
  return LEGACY_GYM_MAP[gym] || gym;
}

function legacyRouteToYds(grade) {
  const legacy = ["5a", "5b", "5c", "6a", "6a+", "6b", "6b+", "6c", "6c+", "7a", "7a+", "7b", "7b+", "7c"];
  const yds = ["5.8", "5.9", "5.9", "5.10a", "5.10b", "5.10c", "5.10d", "5.11a", "5.11b", "5.11d", "5.12a", "5.12b", "5.12c", "5.12d"];
  const index = legacy.indexOf(String(grade).toLowerCase());
  return yds[index] || "5.10a";
}

function legacyBoulderToV(grade) {
  const legacy = ["4", "5", "5+", "6A", "6A+", "6B", "6B+", "6C", "6C+", "7A", "7A+", "7B", "7B+", "7C", "7C+", "8A"];
  const vScale = ["V0", "V1", "V2", "V3", "V3", "V4", "V4", "V5", "V5", "V6", "V7", "V8", "V8", "V9", "V10", "V11"];
  const index = legacy.indexOf(String(grade).toUpperCase());
  return vScale[index] || "V3";
}

function seedEntry(days, gym, discipline, gradeSystem, grade, result, attempts, rpe, styles, notes) {
  return {
    id: makeId(),
    date: offsetDate(days),
    gym,
    discipline,
    gradeSystem,
    grade,
    result,
    attempts,
    rpe,
    styles,
    notes,
    createdAt: new Date().toISOString(),
  };
}

function setView(viewName) {
  const titleMap = {
    dashboard: "训练看板",
    log: "记录训练",
    motion: "动作分析",
    history: "历史记录",
  };

  $$(".view").forEach((view) => view.classList.remove("active"));
  $(`#${viewName}-view`).classList.add("active");
  $("#viewTitle").textContent = titleMap[viewName];
  $$(".nav-item").forEach((item) => {
    const active = item.dataset.view === viewName;
    item.classList.toggle("active", active);
    if (active) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  });
}

function renderAll() {
  state.entries.sort((a, b) => `${b.date}${b.createdAt || ""}`.localeCompare(`${a.date}${a.createdAt || ""}`));
  renderStats();
  renderGradeChart();
  renderAdvice();
  renderProgress();
  renderRecent();
  renderSessionSummary();
  renderGymOptions();
  renderHistory();
  saveState();
}

function renderStyleTags() {
  $("#styleTags").innerHTML = STYLE_OPTIONS.map(([id, label]) => `
    <label class="tag-option">
      <input type="checkbox" name="styles" value="${id}" />
      <span>${label}</span>
    </label>
  `).join("");
}

function setFormDefaults() {
  $("#dateInput").value = toDateInputValue(new Date());
  $("#gymInput").value = state.entries[0]?.gym || "";
  $("#disciplineInput").value = "boulder";
  $("#gradeSystemInput").value = "V";
  $("#resultInput").value = "send";
  $("#attemptsInput").value = "1";
  $("#rpeInput").value = "6";
  $("#rpeOutput").textContent = "6";
}

function updateGradeOptions() {
  const system = $("#gradeSystemInput").value;
  const options = GRADE_OPTIONS[system] || [];
  $("#gradeOptions").innerHTML = options.map((grade) => `<option value="${escapeHtml(grade)}"></option>`).join("");
}

function formatGradeInput(system, grade) {
  const value = String(grade || "").trim();
  if (system === "V") {
    const match = value.match(/^v?\s*(\d+)$/i);
    return match ? `V${match[1]}` : value.toUpperCase();
  }
  if (system === "YDS") {
    return value.toLowerCase();
  }
  return value;
}

function handleEntrySubmit(event) {
  event.preventDefault();
  const styles = $$("input[name='styles']:checked").map((item) => item.value);
  const entry = {
    id: makeId(),
    date: $("#dateInput").value,
    gym: $("#gymInput").value.trim(),
    discipline: $("#disciplineInput").value,
    gradeSystem: $("#gradeSystemInput").value,
    grade: formatGradeInput($("#gradeSystemInput").value, $("#gradeInput").value),
    result: $("#resultInput").value,
    attempts: clamp(Number($("#attemptsInput").value), 1, 99),
    rpe: clamp(Number($("#rpeInput").value), 1, 10),
    styles,
    notes: $("#notesInput").value.trim(),
    createdAt: new Date().toISOString(),
  };

  if (!entry.date || !entry.gym || !entry.grade) {
    return;
  }

  state.entries.unshift(entry);
  $("#entryForm").reset();
  setFormDefaults();
  renderAll();
  setView("dashboard");
}

function renderStats() {
  const recent = state.entries.filter((entry) => daysSince(entry.date) <= 30);
  const sessionDays = new Set(recent.map((entry) => `${entry.date}:${entry.gym}`));
  const sent = state.entries.filter(isSent).length;
  const sendRate = state.entries.length ? Math.round((sent / state.entries.length) * 100) : 0;
  const stableBoulder = stableGrade((entry) => entry.discipline === "boulder");
  const stableRoute = stableGrade((entry) => ROUTE_DISCIPLINES.has(entry.discipline));
  const load7 = trainingLoad(7);
  const load28 = trainingLoad(28);
  const weeklyAverage = Math.max(1, Math.round(load28 / 4));

  $("#metricSessions").textContent = sessionDays.size;
  $("#metricSessionsHint").textContent = `${recent.length} 条记录`;
  $("#metricSendRate").textContent = `${sendRate}%`;
  $("#metricSendRateHint").textContent = `${sent}/${state.entries.length || 0} 完成`;
  $("#metricStableBoulder").textContent = stableBoulder || "-";
  $("#metricStableRoute").textContent = stableRoute || "-";
  $("#sidebarLoad").textContent = load7;
  $("#sidebarLoadLabel").textContent = load7 > weeklyAverage * 1.35 ? "比平时偏高" : load7 < weeklyAverage * 0.55 ? "比平时偏低" : "节奏稳定";
}

function renderGradeChart() {
  const entries = filterByDashboardDiscipline(state.entries);
  const groups = new Map();

  entries.forEach((entry) => {
    const key = `${entry.gradeSystem}:${entry.grade}`;
    if (!groups.has(key)) {
      groups.set(key, {
        grade: entry.grade,
        gradeSystem: entry.gradeSystem,
        score: gradeScore(entry),
        total: 0,
        sent: 0,
      });
    }

    const group = groups.get(key);
    group.total += 1;
    if (isSent(entry)) {
      group.sent += 1;
    }
  });

  const rows = Array.from(groups.values()).sort((a, b) => b.score - a.score || a.grade.localeCompare(b.grade));
  const max = Math.max(1, ...rows.map((row) => row.total));

  if (!rows.length) {
    $("#gradeChart").innerHTML = `<div class="empty-state">暂无可展示的难度结构</div>`;
    return;
  }

  $("#gradeChart").innerHTML = rows.map((row) => {
    const width = Math.max(8, Math.round((row.total / max) * 100));
    const label = row.grade;
    return `
      <div class="grade-row">
        <div class="grade-name">${escapeHtml(label)}</div>
        <div class="bar-track" aria-hidden="true">
          <div class="bar-fill" style="width: ${width}%"></div>
        </div>
        <div class="grade-count">${row.sent}/${row.total}</div>
      </div>
    `;
  }).join("");
}

function renderAdvice() {
  const advice = buildAdvice();
  $("#coachStatus").textContent = `${advice.length} 条建议`;
  $("#adviceList").innerHTML = advice.map((item) => `
    <article class="advice-item">
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.body)}</p>
    </article>
  `).join("");
}

function buildAdvice() {
  if (!state.entries.length) {
    return [
      {
        title: "先建立基线",
        body: "记录 3 到 5 次训练后，系统会开始判断稳定难度、薄弱风格和负荷变化。",
      },
    ];
  }

  const advice = [];
  const successRate = state.entries.filter(isSent).length / state.entries.length;
  const recent = state.entries.filter((entry) => daysSince(entry.date) <= 21);
  const projectEntries = recent.filter((entry) => !isSent(entry));
  const topProject = highestGrade(projectEntries);
  const stylePressure = mostCommonStyle(projectEntries);
  const load7 = trainingLoad(7);
  const load28 = trainingLoad(28);
  const averageWeek = load28 / 4;
  const motion = summarizeMotion();
  const stableBoulder = stableGrade((entry) => entry.discipline === "boulder");
  const maxBoulder = highestGrade(state.entries.filter((entry) => entry.discipline === "boulder" && isSent(entry)));

  if (successRate < 0.45) {
    advice.push({
      title: "把完成率拉回可训练区",
      body: "下一次训练安排 60% 到 70% 的线路在稳定难度内，保留少量极限尝试，先恢复动作质量。",
    });
  } else if (successRate > 0.72 && stableBoulder && maxBoulder && stableBoulder === maxBoulder.label) {
    advice.push({
      title: "可以轻推一个新难度",
      body: `你的完成率较高，${stableBoulder} 已经稳定。下一次抱石可以选 2 到 3 条高一档线路做项目。`,
    });
  } else {
    advice.push({
      title: "保持金字塔厚度",
      body: "每次训练保留足够的中等难度完成量，再把最高难度放在精力最好的前半段尝试。",
    });
  }

  if (topProject) {
    advice.push({
      title: `项目线聚焦 ${topProject.label}`,
      body: `近期卡在 ${topProject.label} 较多。把尝试次数拆成读线、单步、连接三段，避免每次都完整硬冲。`,
    });
  }

  if (stylePressure) {
    advice.push({
      title: `${stylePressure.label} 是当前薄弱项`,
      body: `未完成记录里 ${stylePressure.label} 出现最多。热身后加 15 分钟同风格低难度练习，再进入项目线。`,
    });
  }

  if (motion.openDoorRisk >= 0.4) {
    advice.push({
      title: "开门风险偏高",
      body: "换手前先找第三支撑点，优先补脚、旗脚或压髋，让重心回到支撑线附近。",
    });
  }

  if (motion.armIssueRate >= 0.4) {
    advice.push({
      title: "手臂使用需要更细",
      body: "检测到过伸或弯臂硬拉偏多。热身线路里刻意做直臂悬挂、肩胛下沉和移动前放松。",
    });
  }

  if (load7 > averageWeek * 1.45 && load7 > 35) {
    advice.push({
      title: "本周负荷上升较快",
      body: "下一次可以做轻量技术课，控制高强度尝试数，让手指和肩肘有恢复窗口。",
    });
  }

  return advice.slice(0, 5);
}

function renderProgress() {
  const boulders = state.entries.filter((entry) => entry.discipline === "boulder");
  const routes = state.entries.filter((entry) => ROUTE_DISCIPLINES.has(entry.discipline));
  const recent = state.entries.filter((entry) => daysSince(entry.date) <= 30);
  const sentRate = state.entries.length ? Math.round((state.entries.filter(isSent).length / state.entries.length) * 100) : 0;
  const recentLoad = trainingLoad(30);
  const flashOnsight = state.entries.filter((entry) => entry.result === "flash" || entry.result === "onsight").length;
  const flashRate = state.entries.length ? Math.round((flashOnsight / state.entries.length) * 100) : 0;
  const motion = summarizeMotion();

  const items = [
    {
      title: `抱石 ${state.entries.filter((entry) => entry.discipline === "boulder" && isSent(entry)).length}/${boulders.length}`,
      body: `最高完成 ${highestGrade(boulders.filter(isSent))?.label || "-"}，稳定 ${stableGrade((entry) => entry.discipline === "boulder") || "-"}`,
      value: sentRate,
    },
    {
      title: `难度 ${routes.filter(isSent).length}/${routes.length}`,
      body: `最高完成 ${highestGrade(routes.filter(isSent))?.label || "-"}，稳定 ${stableGrade((entry) => ROUTE_DISCIPLINES.has(entry.discipline)) || "-"}`,
      value: routes.length ? Math.round((routes.filter(isSent).length / routes.length) * 100) : 0,
    },
    {
      title: `Flash / Onsight ${flashRate}%`,
      body: `近 30 天 ${recent.length} 条记录，负荷 ${recentLoad}`,
      value: flashRate,
    },
    {
      title: `动作质量 ${motion.score}%`,
      body: `开门风险 ${Math.round(motion.openDoorRisk * 100)}%，手臂风险 ${Math.round(motion.armIssueRate * 100)}%`,
      value: motion.score,
    },
  ];

  $("#progressStrip").innerHTML = items.map((item) => `
    <article class="progress-item">
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.body)}</p>
      </div>
      <div class="progress-rail" aria-hidden="true">
        <div class="progress-fill" style="width: ${clamp(item.value, 4, 100)}%"></div>
      </div>
    </article>
  `).join("");
}

function renderRecent() {
  const recent = state.entries.slice(0, 5);
  if (!recent.length) {
    $("#recentList").innerHTML = `<div class="empty-state">暂无训练记录</div>`;
    return;
  }

  $("#recentList").innerHTML = recent.map((entry) => `
    <article class="recent-item">
      <div>
        <strong>${escapeHtml(entry.grade)} · ${escapeHtml(DISCIPLINE_LABELS[entry.discipline])}</strong>
        <div class="recent-meta">
          <span>${formatShortDate(entry.date)}</span>
          <span>${escapeHtml(entry.gym)}</span>
          <span>${entry.attempts} 尝试</span>
        </div>
      </div>
      ${resultPill(entry.result)}
    </article>
  `).join("");
}

function renderSessionSummary() {
  const date = $("#dateInput")?.value || toDateInputValue(new Date());
  const entries = state.entries.filter((entry) => entry.date === date);
  const sent = entries.filter(isSent).length;
  const load = entries.reduce((sum, entry) => sum + entry.attempts * entry.rpe, 0);
  const avgRpe = entries.length ? (entries.reduce((sum, entry) => sum + entry.rpe, 0) / entries.length).toFixed(1) : "-";

  $("#sessionSummary").innerHTML = `
    <article class="session-card">
      <strong>${entries.length} 条线路，${sent} 条完成</strong>
      <p>平均强度 ${avgRpe}，训练负荷 ${load}</p>
    </article>
  `;

  if (!entries.length) {
    $("#miniTimeline").innerHTML = `<div class="empty-state">当天还没有记录</div>`;
    return;
  }

  $("#miniTimeline").innerHTML = entries.slice(0, 8).map((entry) => `
    <div class="timeline-item">
      <span class="timeline-dot" aria-hidden="true"></span>
      <p>${escapeHtml(entry.grade)} ${escapeHtml(RESULT_LABELS[entry.result])}，${entry.attempts} 尝试。${escapeHtml(entry.notes || "")}</p>
    </div>
  `).join("");
}

function renderHistory() {
  const historyFilter = $("#historyFilter").value;
  const gymFilter = $("#gymFilter").value;
  const entries = state.entries.filter((entry) => {
    const disciplineMatch =
      historyFilter === "all" ||
      (historyFilter === "boulder" && entry.discipline === "boulder") ||
      (historyFilter === "route" && ROUTE_DISCIPLINES.has(entry.discipline)) ||
      (historyFilter === "sent" && isSent(entry)) ||
      (historyFilter === "project" && !isSent(entry));
    const gymMatch = gymFilter === "all" || entry.gym === gymFilter;
    return disciplineMatch && gymMatch;
  });

  $("#historyTable").innerHTML = entries.map((entry) => `
    <tr>
      <td>${formatShortDate(entry.date)}</td>
      <td>${escapeHtml(entry.gym)}</td>
      <td>${escapeHtml(DISCIPLINE_LABELS[entry.discipline])}</td>
      <td><strong>${escapeHtml(entry.grade)}</strong></td>
      <td>${resultPill(entry.result)}</td>
      <td>${entry.attempts}</td>
      <td>
        <div class="table-meta">
          ${(entry.styles || []).map((style) => `<span class="chip">${escapeHtml(styleLabel(style))}</span>`).join("")}
        </div>
      </td>
      <td><button class="delete-row" type="button" data-delete-id="${entry.id}">删除</button></td>
    </tr>
  `).join("");
}

function renderGymOptions() {
  const selectedGym = $("#gymFilter").value || "all";
  const gyms = Array.from(new Set([...DEFAULT_GYMS, ...state.entries.map((entry) => entry.gym).filter(Boolean)])).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
  $("#gymOptions").innerHTML = gyms.map((gym) => `<option value="${escapeHtml(gym)}"></option>`).join("");
  $("#gymFilter").innerHTML = `<option value="all">全部岩馆</option>${gyms.map((gym) => `<option value="${escapeHtml(gym)}">${escapeHtml(gym)}</option>`).join("")}`;
  $("#gymFilter").value = gyms.includes(selectedGym) ? selectedGym : "all";
}

function handleHistoryClick(event) {
  const button = event.target.closest("[data-delete-id]");
  if (!button) {
    return;
  }
  state.entries = state.entries.filter((entry) => entry.id !== button.dataset.deleteId);
  renderAll();
}

function filterByDashboardDiscipline(entries) {
  if (dashboardFilter === "boulder") {
    return entries.filter((entry) => entry.discipline === "boulder");
  }
  if (dashboardFilter === "route") {
    return entries.filter((entry) => ROUTE_DISCIPLINES.has(entry.discipline));
  }
  return entries;
}

function toggleCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
    stopPoseTracking();
    $("#motionVideo").srcObject = null;
    $("#videoState").textContent = "摄像头已关闭";
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    $("#videoState").textContent = "当前环境不支持摄像头";
    return;
  }

  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
    .then((stream) => {
      cameraStream = stream;
      $("#motionVideo").srcObject = stream;
      $("#motionVideo").controls = false;
      $("#motionVideo").muted = true;
      playVideoAndTrack($("#motionVideo"));
      $("#videoState").textContent = "摄像头预览，正在准备姿态识别";
    })
    .catch(() => {
      $("#videoState").textContent = "无法开启摄像头";
    });
}

function handleVideoImport(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }
  const video = $("#motionVideo");
  video.srcObject = null;
  video.src = URL.createObjectURL(file);
  video.controls = true;
  video.muted = false;
  playVideoAndTrack(video);
  $("#videoState").textContent = "本地视频，正在准备姿态识别";
}

function playVideoAndTrack(video) {
  const playPromise = video.play();
  if (playPromise?.then) {
    playPromise.then(() => startPoseTracking()).catch(() => startPoseTracking());
    return;
  }
  startPoseTracking();
}

async function startPoseTracking() {
  if (poseTrackingActive) {
    return;
  }

  poseTrackingActive = true;
  latestPoseLandmarks = null;
  latestPoseValues = null;
  supportTracker = {};
  lastPoseVideoTime = -1;
  $("#videoState").textContent = "正在加载姿态模型";

  try {
    await ensurePoseLandmarker();
    $("#videoState").textContent = "姿态识别已开启";
    poseFrame = requestAnimationFrame(detectPoseFrame);
  } catch (error) {
    poseTrackingActive = false;
    $("#videoState").textContent = "姿态模型加载失败，已回到演示模式";
    console.warn("Pose model failed", error);
  }
}

function stopPoseTracking() {
  poseTrackingActive = false;
  latestPoseLandmarks = null;
  latestPoseValues = null;
  supportTracker = {};
  lastPoseVideoTime = -1;
  if (poseFrame) {
    cancelAnimationFrame(poseFrame);
    poseFrame = null;
  }
}

async function ensurePoseLandmarker() {
  if (poseLandmarker) {
    return poseLandmarker;
  }

  if (poseModelLoading) {
    while (poseModelLoading) {
      await wait(80);
    }
    return poseLandmarker;
  }

  poseModelLoading = true;
  try {
    const { FilesetResolver, PoseLandmarker } = await import(MEDIAPIPE_TASKS_URL);
    const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);
    poseLandmarker = await createPoseLandmarker(PoseLandmarker, vision, "GPU")
      .catch(() => createPoseLandmarker(PoseLandmarker, vision, "CPU"));
    return poseLandmarker;
  } finally {
    poseModelLoading = false;
  }
}

function createPoseLandmarker(PoseLandmarker, vision, delegate) {
  return PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: POSE_MODEL_URL,
      delegate,
    },
    runningMode: "VIDEO",
    numPoses: 1,
    minPoseDetectionConfidence: 0.45,
    minPosePresenceConfidence: 0.45,
    minTrackingConfidence: 0.45,
  });
}

function detectPoseFrame(now) {
  if (!poseTrackingActive || !poseLandmarker) {
    return;
  }

  const video = $("#motionVideo");
  const hasFrame = video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0;
  const frameChanged = video.srcObject || video.currentTime !== lastPoseVideoTime || video.paused;

  if (hasFrame && frameChanged) {
    lastPoseVideoTime = video.currentTime;
    const result = poseLandmarker.detectForVideo(video, now);
    const landmarks = result.landmarks?.[0];
    if (landmarks) {
      latestPoseLandmarks = landmarks;
      latestPoseValues = derivePoseValues(landmarks, now);
      if (now - lastPoseRenderTime > 220) {
        lastPoseRenderTime = now;
        renderMotionAnalyzer(latestPoseValues);
      }
    }
  }

  poseFrame = requestAnimationFrame(detectPoseFrame);
}

function toggleCenterTrail() {
  showCenterTrail = !showCenterTrail;
  centerTrail = [];
  updateCenterTrailButton();
  $("#videoState").textContent = showCenterTrail ? "重心轨迹已显示" : "重心轨迹已隐藏";
  drawMotionOverlay();
}

function updateCenterTrailButton() {
  const button = $("#centerTrailButton");
  button.classList.toggle("active", showCenterTrail);
  button.setAttribute("aria-pressed", String(showCenterTrail));
  button.setAttribute("aria-label", showCenterTrail ? "隐藏重心轨迹" : "显示重心轨迹");
  button.setAttribute("title", showCenterTrail ? "隐藏重心轨迹" : "显示重心轨迹");
}

function updateMotionAnalyzer() {
  renderMotionAnalyzer(getMotionValues());
  drawMotionOverlay();
}

function renderMotionAnalyzer(values) {
  const evaluation = evaluateMotion(values);

  $("#leftElbowOutput").textContent = `${Math.round(values.leftElbow)}°`;
  $("#rightElbowOutput").textContent = `${Math.round(values.rightElbow)}°`;
  $("#supportOutput").textContent = Math.round(values.support);
  $("#centerOutput").textContent = Math.round(values.centerOffset);
  $("#twistOutput").textContent = `${Math.round(values.twist)}°`;

  $("#motionMetrics").innerHTML = evaluation.cards.map((card) => `
    <article class="motion-card">
      <div>
        <strong>${escapeHtml(card.title)}</strong>
        <p>${escapeHtml(card.body)}</p>
      </div>
      <span class="motion-badge ${card.level}">${escapeHtml(card.label)}</span>
    </article>
  `).join("");
}

function getMotionValues() {
  return {
    leftElbow: Number($("#leftElbowRange").value),
    rightElbow: Number($("#rightElbowRange").value),
    support: Number($("#supportRange").value),
    centerOffset: Number($("#centerRange").value),
    twist: Number($("#twistRange").value),
  };
}

function evaluateMotion(values) {
  const cards = [];
  const armCards = [armEvaluation("左臂", values.leftElbow), armEvaluation("右臂", values.rightElbow)];
  cards.push(...armCards);

  if (values.support >= 3) {
    cards.push({
      title: "三点支撑",
      body: "当前支撑点足够，移动前仍需确认下一脚或下一手的位置。",
      label: "稳定",
      level: "good",
    });
  } else if (values.support === 2) {
    cards.push({
      title: "三点支撑",
      body: "只有两个稳定支点，重心偏离时容易产生开门。",
      label: "谨慎",
      level: "warn",
    });
  } else {
    cards.push({
      title: "三点支撑",
      body: "支撑点过少，这更像动态动作或失稳片段。",
      label: "风险",
      level: "risk",
    });
  }

  const centerLevel = Math.abs(values.centerOffset) > 55 ? "risk" : Math.abs(values.centerOffset) > 32 ? "warn" : "good";
  cards.push({
    title: "重心移动",
    body: centerLevel === "good" ? "重心接近支撑区域。" : "重心明显偏离支撑区域，优先补脚或压髋。",
    label: centerLevel === "good" ? "平顺" : centerLevel === "warn" ? "偏移" : "失稳",
    level: centerLevel,
  });

  const openDoorRisk = values.support <= 2 && Math.abs(values.centerOffset) > 35 && values.twist > 25;
  cards.push({
    title: "开门风险",
    body: openDoorRisk ? "支撑线、重心和躯干旋转同时进入风险区。" : "当前组合没有明显开门信号。",
    label: openDoorRisk ? "高" : "低",
    level: openDoorRisk ? "risk" : "good",
  });

  const score = Math.max(0, 100 - cards.reduce((sum, card) => sum + (card.level === "risk" ? 24 : card.level === "warn" ? 12 : 0), 0));
  return {
    cards,
    score,
    openDoorRisk,
    armIssue: armCards.find((card) => card.level !== "good")?.body || "",
  };
}

function armEvaluation(label, angle) {
  if (angle >= 180) {
    return {
      title: `${label}肘角`,
      body: "肘部进入过伸区间，注意不要把关节当作被动挂点。",
      label: "过伸",
      level: "risk",
    };
  }

  if (angle >= 170) {
    return {
      title: `${label}肘角`,
      body: "肘部接近锁死，保留微屈并用肩胛控制身体。",
      label: "接近锁死",
      level: "warn",
    };
  }

  if (angle <= 105) {
    return {
      title: `${label}肘角`,
      body: "肘角持续过小，可能在用弯臂硬拉完成移动。",
      label: "硬拉",
      level: "warn",
    };
  }

  return {
    title: `${label}肘角`,
    body: "肘角处在可控区间，继续观察移动中的持续时间。",
    label: "可控",
    level: "good",
  };
}

function saveMotionSnapshot() {
  const values = getMotionValues();
  const evaluation = evaluateMotion(values);
  state.motionSnapshots.unshift({
    id: makeId(),
    date: toDateInputValue(new Date()),
    ...values,
    evaluation: {
      score: evaluation.score,
      openDoorRisk: evaluation.openDoorRisk,
      armIssue: evaluation.armIssue,
    },
  });
  renderAll();
  $("#videoState").textContent = "动作片段已保存";
}

function startOverlayLoop() {
  const tick = () => {
    drawMotionOverlay();
    overlayFrame = requestAnimationFrame(tick);
  };
  overlayFrame = requestAnimationFrame(tick);
}

function drawMotionOverlay() {
  const canvas = $("#motionCanvas");
  if (!canvas) {
    return;
  }
  const ctx = canvas.getContext("2d");
  const values = getMotionValues();
  const width = canvas.width;
  const height = canvas.height;
  const t = performance.now() / 1000;

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  for (let x = 120; x < width; x += 120) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 90; y < height; y += 90) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  if (latestPoseLandmarks && latestPoseValues) {
    drawRealPoseOverlay(ctx, latestPoseLandmarks, latestPoseValues);
    ctx.restore();
    return;
  }

  const holds = [
    [225, 385],
    [330, 250],
    [485, 160],
    [620, 285],
  ];
  holds.forEach(([x, y], index) => {
    ctx.beginPath();
    ctx.fillStyle = index < values.support ? "rgba(52,199,89,0.92)" : "rgba(255,255,255,0.28)";
    ctx.arc(x, y, 11, 0, Math.PI * 2);
    ctx.fill();
  });

  const centerX = width / 2 + values.centerOffset * 2.1;
  const hipY = height * 0.58;
  const shoulderY = height * 0.36;
  const headY = height * 0.25;
  const sway = Math.sin(t * 1.5) * 4;
  const twist = values.twist / 90;
  const shoulderLeft = [centerX - 70 - twist * 25, shoulderY + sway];
  const shoulderRight = [centerX + 70 + twist * 25, shoulderY - sway];
  const hipLeft = [centerX - 48 + twist * 20, hipY];
  const hipRight = [centerX + 48 - twist * 20, hipY];
  const head = [centerX, headY + sway];
  const leftElbow = elbowPoint(shoulderLeft, [-1, 1], values.leftElbow);
  const rightElbow = elbowPoint(shoulderRight, [1, 1], values.rightElbow);
  const leftWrist = [leftElbow[0] - 60, leftElbow[1] + 42];
  const rightWrist = [rightElbow[0] + 60, rightElbow[1] + 42];
  const leftKnee = [hipLeft[0] - 36, hipY + 95];
  const rightKnee = [hipRight[0] + 36, hipY + 95];
  const leftAnkle = [leftKnee[0] - 40, leftKnee[1] + 80];
  const rightAnkle = [rightKnee[0] + 40, rightKnee[1] + 80];
  const centerPoint = [centerX, hipY - 18 + sway * 0.25];

  ctx.strokeStyle = "rgba(255,255,255,0.84)";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  drawLine(ctx, shoulderLeft, shoulderRight);
  drawLine(ctx, shoulderLeft, hipLeft);
  drawLine(ctx, shoulderRight, hipRight);
  drawLine(ctx, hipLeft, hipRight);
  drawLine(ctx, shoulderLeft, leftElbow);
  drawLine(ctx, leftElbow, leftWrist);
  drawLine(ctx, shoulderRight, rightElbow);
  drawLine(ctx, rightElbow, rightWrist);
  drawLine(ctx, hipLeft, leftKnee);
  drawLine(ctx, leftKnee, leftAnkle);
  drawLine(ctx, hipRight, rightKnee);
  drawLine(ctx, rightKnee, rightAnkle);

  [head, shoulderLeft, shoulderRight, hipLeft, hipRight, leftElbow, rightElbow, leftWrist, rightWrist, leftKnee, rightKnee, leftAnkle, rightAnkle].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  updateCenterTrail(centerPoint);
  if (showCenterTrail) {
    drawCenterTrail(ctx);
  }

  ctx.strokeStyle = "rgba(10,132,255,0.36)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2, height * 0.18);
  ctx.lineTo(width / 2, height * 0.88);
  ctx.stroke();
  ctx.beginPath();
  ctx.fillStyle = Math.abs(values.centerOffset) > 55 ? "rgba(255,69,58,0.96)" : Math.abs(values.centerOffset) > 32 ? "rgba(255,159,10,0.96)" : "rgba(10,132,255,0.96)";
  ctx.arc(centerPoint[0], centerPoint[1], 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawRealPoseOverlay(ctx, landmarks, values) {
  const projected = values.projected || projectPoseLandmarks(landmarks);
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const centerPoint = values.centerPoint;

  ctx.strokeStyle = "rgba(255,255,255,0.82)";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  POSE_CONNECTIONS.forEach(([fromIndex, toIndex]) => {
    const from = visiblePoint(projected[fromIndex]);
    const to = visiblePoint(projected[toIndex]);
    if (from && to) {
      drawLine(ctx, from, to);
    }
  });

  projected.forEach((point, index) => {
    if (!visiblePoint(point, 0.45)) {
      return;
    }
    const isSupportPoint = values.supportPointIds?.has(index);
    ctx.beginPath();
    ctx.fillStyle = isSupportPoint ? "rgba(52,199,89,0.96)" : "rgba(255,255,255,0.88)";
    ctx.arc(point[0], point[1], isSupportPoint ? 7 : 4, 0, Math.PI * 2);
    ctx.fill();
  });

  updateCenterTrail(centerPoint);
  if (showCenterTrail) {
    drawCenterTrail(ctx);
  }

  ctx.strokeStyle = "rgba(10,132,255,0.36)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2, height * 0.12);
  ctx.lineTo(width / 2, height * 0.92);
  ctx.stroke();

  ctx.beginPath();
  ctx.fillStyle = Math.abs(values.centerOffset) > 55 ? "rgba(255,69,58,0.96)" : Math.abs(values.centerOffset) > 32 ? "rgba(255,159,10,0.96)" : "rgba(10,132,255,0.96)";
  ctx.arc(centerPoint[0], centerPoint[1], 10, 0, Math.PI * 2);
  ctx.fill();
}

function derivePoseValues(landmarks) {
  const projected = projectPoseLandmarks(landmarks);
  const fallback = getMotionValues();
  const canvas = $("#motionCanvas");
  const width = canvas.width;
  const height = canvas.height;
  const leftElbow = jointAngle(projected[11], projected[13], projected[15]) || fallback.leftElbow;
  const rightElbow = jointAngle(projected[12], projected[14], projected[16]) || fallback.rightElbow;
  const centerPoint = bodyCenter(projected) || [width / 2, height * 0.56];
  const centerOffset = clamp(((centerPoint[0] - width / 2) / (width / 2)) * 100, -100, 100);
  const twist = torsoTwist(projected) || fallback.twist;
  const supportDetails = countStableSupportPoints(projected);

  return {
    leftElbow,
    rightElbow,
    support: supportDetails.count,
    centerOffset,
    twist,
    centerPoint,
    projected,
    supportPointIds: supportDetails.indices,
  };
}

function projectPoseLandmarks(landmarks) {
  const canvas = $("#motionCanvas");
  const video = $("#motionVideo");
  const width = canvas.width;
  const height = canvas.height;
  const videoWidth = video.videoWidth || width;
  const videoHeight = video.videoHeight || height;
  const scale = Math.max(width / videoWidth, height / videoHeight);
  const displayWidth = videoWidth * scale;
  const displayHeight = videoHeight * scale;
  const offsetX = (width - displayWidth) / 2;
  const offsetY = (height - displayHeight) / 2;

  return landmarks.map((landmark) => {
    const x = offsetX + landmark.x * displayWidth;
    const y = offsetY + landmark.y * displayHeight;
    const point = [x, y];
    point.visibility = landmark.visibility ?? landmark.presence ?? 1;
    return point;
  });
}

function jointAngle(a, b, c) {
  if (!visiblePoint(a) || !visiblePoint(b) || !visiblePoint(c)) {
    return null;
  }

  const ab = [a[0] - b[0], a[1] - b[1]];
  const cb = [c[0] - b[0], c[1] - b[1]];
  const dot = ab[0] * cb[0] + ab[1] * cb[1];
  const abLength = Math.hypot(ab[0], ab[1]);
  const cbLength = Math.hypot(cb[0], cb[1]);
  if (!abLength || !cbLength) {
    return null;
  }

  const cosine = clamp(dot / (abLength * cbLength), -1, 1);
  return Math.acos(cosine) * 180 / Math.PI;
}

function bodyCenter(points) {
  const weighted = [
    [points[11], 0.18],
    [points[12], 0.18],
    [points[23], 0.28],
    [points[24], 0.28],
    [points[25], 0.04],
    [points[26], 0.04],
  ].filter(([point]) => visiblePoint(point));

  const weightSum = weighted.reduce((sum, [, weight]) => sum + weight, 0);
  if (!weightSum) {
    return null;
  }

  const x = weighted.reduce((sum, [point, weight]) => sum + point[0] * weight, 0) / weightSum;
  const y = weighted.reduce((sum, [point, weight]) => sum + point[1] * weight, 0) / weightSum;
  return [x, y];
}

function torsoTwist(points) {
  const leftShoulder = visiblePoint(points[11]);
  const rightShoulder = visiblePoint(points[12]);
  const leftHip = visiblePoint(points[23]);
  const rightHip = visiblePoint(points[24]);
  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
    return null;
  }

  const shoulderAngle = Math.atan2(rightShoulder[1] - leftShoulder[1], rightShoulder[0] - leftShoulder[0]);
  const hipAngle = Math.atan2(rightHip[1] - leftHip[1], rightHip[0] - leftHip[0]);
  let diff = Math.abs((shoulderAngle - hipAngle) * 180 / Math.PI);
  while (diff > 180) {
    diff -= 180;
  }
  if (diff > 90) {
    diff = 180 - diff;
  }
  return diff;
}

function countStableSupportPoints(points) {
  const indices = new Set();
  let count = 0;

  SUPPORT_LANDMARKS.forEach((target) => {
    const point = visiblePoint(points[target.index]) || visiblePoint(points[target.fallbackIndex]);
    const landmarkIndex = visiblePoint(points[target.index]) ? target.index : target.fallbackIndex;
    if (!point) {
      delete supportTracker[target.id];
      return;
    }

    const tracker = supportTracker[target.id] || { point, stillFrames: 0 };
    const moved = distance(tracker.point, point);
    tracker.stillFrames = moved < 8 ? Math.min(8, tracker.stillFrames + 1) : Math.max(0, tracker.stillFrames - 2);
    tracker.point = point;
    supportTracker[target.id] = tracker;

    if (tracker.stillFrames >= 2) {
      count += 1;
      indices.add(landmarkIndex);
    }
  });

  return { count, indices };
}

function visiblePoint(point, threshold = 0.35) {
  if (!point) {
    return null;
  }
  return (point.visibility ?? 1) >= threshold ? point : null;
}

function updateCenterTrail(point) {
  if (!showCenterTrail) {
    return;
  }

  const last = centerTrail[centerTrail.length - 1];
  if (!last || distance(last, point) > 1.8) {
    centerTrail.push(point);
  }

  if (centerTrail.length > 160) {
    centerTrail = centerTrail.slice(-160);
  }
}

function drawCenterTrail(ctx) {
  if (centerTrail.length < 2) {
    return;
  }

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  centerTrail.forEach((point, index) => {
    if (index === 0) {
      return;
    }
    const previous = centerTrail[index - 1];
    const alpha = 0.16 + (index / centerTrail.length) * 0.52;
    ctx.strokeStyle = `rgba(10,132,255,${alpha})`;
    ctx.lineWidth = 2 + (index / centerTrail.length) * 4;
    ctx.beginPath();
    ctx.moveTo(previous[0], previous[1]);
    ctx.lineTo(point[0], point[1]);
    ctx.stroke();
  });

  const start = centerTrail[0];
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  ctx.arc(start[0], start[1], 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function distance(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function elbowPoint(shoulder, direction, angle) {
  const bend = (190 - angle) / 130;
  return [
    shoulder[0] + direction[0] * (62 + bend * 30),
    shoulder[1] + direction[1] * (56 - bend * 18),
  ];
}

function drawLine(ctx, from, to) {
  ctx.beginPath();
  ctx.moveTo(from[0], from[1]);
  ctx.lineTo(to[0], to[1]);
  ctx.stroke();
}

function summarizeMotion() {
  if (!state.motionSnapshots.length) {
    return {
      score: 78,
      openDoorRisk: 0,
      armIssueRate: 0,
    };
  }

  const snapshots = state.motionSnapshots.slice(0, 8);
  const openDoorRisk = snapshots.filter((snapshot) => snapshot.evaluation?.openDoorRisk).length / snapshots.length;
  const armIssueRate = snapshots.filter((snapshot) => snapshot.evaluation?.armIssue).length / snapshots.length;
  const score = Math.round(snapshots.reduce((sum, snapshot) => sum + (snapshot.evaluation?.score || 70), 0) / snapshots.length);

  return {
    score,
    openDoorRisk,
    armIssueRate,
  };
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `climb-training-${toDateInputValue(new Date())}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported.entries)) {
        throw new Error("Invalid data");
      }
      state = migrateState({
        entries: imported.entries,
        motionSnapshots: Array.isArray(imported.motionSnapshots) ? imported.motionSnapshots : [],
      });
      renderAll();
    } catch (error) {
      alert("导入失败，请检查 JSON 文件。");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function clearData() {
  if (!confirm("确定清空所有本地记录吗？")) {
    return;
  }
  state = {
    entries: [],
    motionSnapshots: [],
  };
  renderAll();
}

function stableGrade(predicate) {
  const groups = new Map();
  state.entries.filter((entry) => predicate(entry) && isSent(entry)).forEach((entry) => {
    const key = `${entry.gradeSystem}:${entry.grade}`;
    const current = groups.get(key) || { entry, count: 0, score: gradeScore(entry) };
    current.count += 1;
    groups.set(key, current);
  });

  return Array.from(groups.values())
    .filter((group) => group.count >= 2)
    .sort((a, b) => b.score - a.score)[0]?.entry.grade || null;
}

function highestGrade(entries) {
  return entries
    .slice()
    .sort((a, b) => gradeScore(b) - gradeScore(a))[0]
    ? {
        label: entries.slice().sort((a, b) => gradeScore(b) - gradeScore(a))[0].grade,
        entry: entries.slice().sort((a, b) => gradeScore(b) - gradeScore(a))[0],
      }
    : null;
}

function mostCommonStyle(entries) {
  const counts = new Map();
  entries.forEach((entry) => {
    (entry.styles || []).forEach((style) => {
      counts.set(style, (counts.get(style) || 0) + 1);
    });
  });

  const [style, count] = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0] || [];
  return count >= 2 ? { id: style, label: styleLabel(style), count } : null;
}

function trainingLoad(days) {
  return state.entries
    .filter((entry) => daysSince(entry.date) <= days)
    .reduce((sum, entry) => sum + entry.attempts * entry.rpe, 0);
}

function gradeScore(entry) {
  const options = GRADE_OPTIONS[entry.gradeSystem] || [];
  const normalized = normalizeGrade(entry.gradeSystem, entry.grade);
  const normalizedOptions = options.map((grade) => normalizeGrade(entry.gradeSystem, grade));
  const index = normalizedOptions.indexOf(normalized);
  if (index >= 0) {
    return gradeBase(entry.gradeSystem) + index;
  }

  if (entry.gradeSystem === "V") {
    const match = normalized.match(/V(\d+)/);
    return match ? gradeBase("V") + Number(match[1]) : 0;
  }

  const number = Number(String(entry.grade).replace(/[^\d.]/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function gradeBase(system) {
  return {
    V: 100,
    YDS: 220,
  }[system] || 0;
}

function normalizeGrade(system, grade) {
  const value = String(grade || "").trim();
  if (system === "V" || system === "YDS") {
    return value.toUpperCase();
  }
  return value;
}

function isSent(entry) {
  return SENT_RESULTS.has(entry.result);
}

function resultPill(result) {
  const type = SENT_RESULTS.has(result) ? "sent" : result === "fail" ? "fail" : "project";
  return `<span class="result-pill ${type}">${escapeHtml(RESULT_LABELS[result] || result)}</span>`;
}

function styleLabel(id) {
  return STYLE_OPTIONS.find(([value]) => value === id)?.[1] || id;
}

function makeId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function offsetDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit" }).format(new Date(`${value}T00:00:00`));
}

function formatLongDate(date) {
  return new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(date);
}

function daysSince(value) {
  const date = new Date(`${value}T00:00:00`);
  const now = new Date();
  const diff = now.setHours(0, 0, 0, 0) - date.getTime();
  return diff / 86400000;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

window.addEventListener("beforeunload", () => {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
  }
  if (overlayFrame) {
    cancelAnimationFrame(overlayFrame);
  }
});
