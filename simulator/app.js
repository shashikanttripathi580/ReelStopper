/**
 * ReelStopper Simulator Engine
 *
 * Implements the full PRD specification:
 * - Real-time reel scrolling simulation with signature extraction
 * - Duplicate event filtering and debouncing (Section 18)
 * - Color progression stages (Sections 8 & 13)
 * - Floating Overlay Counter pill anchored above Like button (Section 7)
 * - 50 & 100 Reel break reminder modals (Sections 9 & 12)
 * - Dashboard, History, and Settings sub-screens
 */

// Simulated Reel Feed Items
const SAMPLE_REELS = [
  {
    author: '@nature_daily',
    avatar: '🌱',
    caption: 'Finding calm amidst the endless digital noise. Remember to breathe. 🌿 #mindfulness #nature',
    audio: 'Original Audio — Nature Meditations',
    gradient: 'linear-gradient(135deg, #09201a 0%, #0d2818 50%, #171124 100%)',
    likes: '234K',
    comments: '1,234'
  },
  {
    author: '@tech_craft',
    avatar: '⚡',
    caption: 'Building lightweight mobile tools with zero cloud overhead. Clean Kotlin architecture! 🚀',
    audio: 'Lo-Fi Chill Beats — Episode 42',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #1e293b 50%, #0f172a 100%)',
    likes: '48.9K',
    comments: '892'
  },
  {
    author: '@urban_explorer',
    avatar: '🏙️',
    caption: 'Midnight walks in Tokyo under neon lights. Walking instead of scrolling tonight. 🌧️',
    audio: 'Tokyo Rain Sounds (Binaural)',
    gradient: 'linear-gradient(135deg, #31102f 0%, #181829 50%, #0f172a 100%)',
    likes: '112K',
    comments: '2,410'
  },
  {
    author: '@focus_zen',
    avatar: '🧘',
    caption: 'How many reels deep are you? Check that little leaf in the corner! 🌾',
    audio: 'Calm Waves — Morning Tide',
    gradient: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #0c0a09 100%)',
    likes: '95.2K',
    comments: '1,840'
  },
  {
    author: '@science_bites',
    avatar: '🔭',
    caption: 'The neuroscience of infinite scroll dopamine loops explained in 45 seconds.',
    audio: 'Synthesizer Waves — Neuro Pulse',
    gradient: 'linear-gradient(135deg, #172554 0%, #1e1b4b 50%, #111827 100%)',
    likes: '340K',
    comments: '4,102'
  }
];

// Color Stages matching PRD Sections 8 & 13
const COLOR_STAGES = [
  {
    id: 0,
    name: '0 Reels',
    min: 0,
    max: 0,
    textColor: 'rgba(161, 161, 170, 0.7)',
    bgColor: 'rgba(24, 24, 27, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    glow: 'none',
    leafEmoji: '🌱',
    meaning: 'Just started',
    stageClass: 'rowStage0'
  },
  {
    id: 1,
    name: '1–10 Reels',
    min: 1,
    max: 10,
    textColor: '#86EFAC',
    bgColor: 'rgba(20, 83, 45, 0.45)',
    borderColor: 'rgba(74, 222, 128, 0.4)',
    glow: '0 0 12px rgba(74, 222, 128, 0.2)',
    leafEmoji: '🌱',
    meaning: 'Low count',
    stageClass: 'rowStage1'
  },
  {
    id: 2,
    name: '11–25 Reels',
    min: 11,
    max: 25,
    textColor: '#4ADE80',
    bgColor: 'rgba(21, 128, 61, 0.45)',
    borderColor: 'rgba(34, 197, 94, 0.6)',
    glow: '0 0 14px rgba(34, 197, 94, 0.25)',
    leafEmoji: '🌿',
    meaning: 'Normal',
    stageClass: 'rowStage2'
  },
  {
    id: 3,
    name: '26–49 Reels',
    min: 26,
    max: 49,
    textColor: '#BEF264',
    bgColor: 'rgba(101, 163, 13, 0.45)',
    borderColor: 'rgba(163, 230, 53, 0.7)',
    glow: '0 0 16px rgba(163, 230, 53, 0.3)',
    leafEmoji: '🌿',
    meaning: 'Approaching break',
    stageClass: 'rowStage3'
  },
  {
    id: 4,
    name: '50 Reels',
    min: 50,
    max: 50,
    textColor: '#FACC15',
    bgColor: 'rgba(161, 98, 7, 0.55)',
    borderColor: '#FACC15',
    glow: '0 0 20px rgba(250, 204, 21, 0.5)',
    leafEmoji: '🌾',
    meaning: 'Break reminder',
    stageClass: 'rowStage4'
  },
  {
    id: 5,
    name: '51–74 Reels',
    min: 51,
    max: 74,
    textColor: '#FB923C',
    bgColor: 'rgba(194, 65, 12, 0.5)',
    borderColor: 'rgba(249, 115, 22, 0.75)',
    glow: '0 0 18px rgba(249, 115, 22, 0.35)',
    leafEmoji: '🍂',
    meaning: 'Continued scrolling',
    stageClass: 'rowStage5'
  },
  {
    id: 6,
    name: '75–99 Reels',
    min: 75,
    max: 99,
    textColor: '#F87171',
    bgColor: 'rgba(185, 28, 28, 0.55)',
    borderColor: 'rgba(239, 68, 68, 0.8)',
    glow: '0 0 20px rgba(239, 68, 68, 0.4)',
    leafEmoji: '🍁',
    meaning: 'High count',
    stageClass: 'rowStage6'
  },
  {
    id: 7,
    name: '100+ Reels',
    min: 100,
    max: 99999,
    textColor: '#EF4444',
    bgColor: 'rgba(153, 27, 27, 0.65)',
    borderColor: '#EF4444',
    glow: '0 0 24px rgba(239, 68, 68, 0.6)',
    leafEmoji: '🔴',
    meaning: 'Strong break reminder',
    stageClass: 'rowStage7'
  }
];

// App State
let state = {
  currentCount: 0,
  todayTotal: 74,
  breakThreshold: 50,
  maxReminder: 100,
  trackingActive: true,
  currentReelIndex: 0,
  lastReelSignature: 'reel-0',
  autoScrollInterval: null,
  activeStage: COLOR_STAGES[0]
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  updateUi();
  logEvent('info', 'ReelStopper simulator loaded. System ready.');
});

function initClock() {
  function tick() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const clockEl = document.getElementById('phoneClock');
    if (clockEl) clockEl.innerText = `${h}:${m}`;
  }
  tick();
  setInterval(tick, 30000);
}

// Stage Calculation
function getStageForCount(count) {
  for (const s of COLOR_STAGES) {
    if (count >= s.min && count <= s.max) return s;
  }
  return COLOR_STAGES[COLOR_STAGES.length - 1];
}

// Reel Navigation & Detection
function simulateNextReel() {
  if (!state.trackingActive) {
    logEvent('warn', 'Scroll detected, but tracking is currently PAUSED.');
    return;
  }

  state.currentReelIndex = (state.currentReelIndex + 1) % SAMPLE_REELS.length;
  const reel = SAMPLE_REELS[state.currentReelIndex];
  const newSignature = `reel-${state.currentReelIndex}-${reel.author}`;

  // Duplicate Check (PRD Section 18)
  if (newSignature === state.lastReelSignature) {
    logEvent('dup', `[Duplicate Dropped] Repeated accessibility event for ${reel.author}`);
    return;
  }

  state.lastReelSignature = newSignature;
  state.currentCount++;
  state.todayTotal++;

  logEvent('count', `[Accessibility] New reel detected: ${reel.author} | Count: ${state.currentCount}`);

  // Animate pill
  const pill = document.getElementById('floatingOverlayCounter');
  if (pill) {
    pill.classList.remove('pulse-anim');
    void pill.offsetWidth;
    pill.classList.add('pulse-anim');
  }

  // Check 50 & 100 Milestones
  if (state.currentCount === 50) {
    showBreakReminder(50);
  } else if (state.currentCount === 100) {
    showBreakReminder(100);
  }

  updateReelDisplay(reel);
  updateUi();
}

function simulatePreviousReel() {
  state.currentReelIndex = (state.currentReelIndex - 1 + SAMPLE_REELS.length) % SAMPLE_REELS.length;
  const reel = SAMPLE_REELS[state.currentReelIndex];
  updateReelDisplay(reel);
  logEvent('info', `Swiped back to previous reel: ${reel.author}`);
}

function simulateDuplicateEvent() {
  const reel = SAMPLE_REELS[state.currentReelIndex];
  logEvent('dup', `[Duplicate Event] UI layout refresh in ${reel.author} filtered out. Count remains ${state.currentCount}.`);
}

function updateReelDisplay(reel) {
  const bg = document.getElementById('reelVideoBg');
  if (bg) bg.style.background = reel.gradient;

  const authorEl = document.getElementById('reelAuthor');
  if (authorEl) authorEl.innerText = reel.author;

  const avatarEl = document.getElementById('reelAvatar');
  if (avatarEl) avatarEl.innerText = reel.avatar;

  const captionEl = document.getElementById('reelCaption');
  if (captionEl) captionEl.innerText = reel.caption;

  const audioEl = document.getElementById('reelAudio');
  if (audioEl) audioEl.innerText = reel.audio;

  const indEl = document.getElementById('reelIndexIndicator');
  if (indEl) indEl.innerText = `Reel ${state.currentReelIndex + 1} / ${SAMPLE_REELS.length}`;
}

// Master UI Update
function updateUi() {
  const stage = getStageForCount(state.currentCount);
  state.activeStage = stage;

  // 1. Update Floating Overlay Counter (above Like button)
  const overlayCount = document.getElementById('overlayCount');
  const overlayLeaf = document.getElementById('overlayLeaf');
  const floatingPill = document.getElementById('floatingOverlayCounter');

  if (overlayCount) overlayCount.innerText = state.currentCount;
  if (overlayLeaf) overlayLeaf.innerText = stage.leafEmoji;

  if (floatingPill) {
    floatingPill.style.backgroundColor = stage.bgColor;
    floatingPill.style.borderColor = stage.borderColor;
    floatingPill.style.boxShadow = stage.glow !== 'none' ? `${stage.glow}, 0 4px 14px rgba(0, 0, 0, 0.4)` : '0 4px 14px rgba(0, 0, 0, 0.4)';
    overlayCount.style.color = stage.textColor;
    overlayLeaf.style.color = stage.textColor;
  }

  // 2. Update Dashboard Hero Card
  const dashCountBig = document.getElementById('dashCountBig');
  const dashLeafIcon = document.getElementById('dashLeafIcon');
  const dashStageBadge = document.getElementById('dashStageBadge');
  const dashHeroCard = document.getElementById('dashHeroCard');
  const dashUntilBreak = document.getElementById('dashUntilBreak');
  const dashUntilMax = document.getElementById('dashUntilMax');
  const dashTodayTotal = document.getElementById('dashTodayTotal');
  const histCountToday = document.getElementById('histCountToday');

  if (dashCountBig) {
    dashCountBig.innerText = state.currentCount;
    dashCountBig.style.color = stage.textColor;
  }
  if (dashLeafIcon) dashLeafIcon.innerText = stage.leafEmoji;
  if (dashStageBadge) {
    dashStageBadge.innerText = stage.meaning;
    dashStageBadge.style.color = stage.textColor;
  }
  if (dashHeroCard) {
    dashHeroCard.style.backgroundColor = stage.bgColor;
    dashHeroCard.style.borderColor = stage.borderColor;
  }

  if (dashUntilBreak) {
    const left = state.breakThreshold - state.currentCount;
    dashUntilBreak.innerText = left <= 0 ? 'Reached' : left;
  }

  if (dashUntilMax) {
    const left = state.maxReminder - state.currentCount;
    dashUntilMax.innerText = left <= 0 ? 'Reached' : left;
  }

  if (dashTodayTotal) dashTodayTotal.innerText = `${state.todayTotal} reels`;
  if (histCountToday) histCountToday.innerText = `${state.todayTotal} reels`;

  // 3. Update Inspector Panel
  const inspEmoji = document.getElementById('inspEmoji');
  const inspStageName = document.getElementById('inspStageName');
  const inspMeaning = document.getElementById('inspMeaning');
  const inspColorSample = document.getElementById('inspColorSample');
  const inspColorCode = document.getElementById('inspColorCode');

  if (inspEmoji) inspEmoji.innerText = stage.leafEmoji;
  if (inspStageName) inspStageName.innerText = `${stage.name} (${stage.meaning})`;
  if (inspMeaning) inspMeaning.innerText = `Token: ${stage.textColor} | Range: ${stage.min}–${stage.max}`;
  if (inspColorSample) {
    inspColorSample.style.backgroundColor = stage.textColor;
    inspColorSample.style.borderColor = stage.borderColor;
  }
  if (inspColorCode) inspColorCode.innerText = stage.textColor;

  // Update highlighted row in inspector table
  document.querySelectorAll('.stages-reference-table tr').forEach((row) => row.classList.remove('active'));
  const activeRow = document.getElementById(stage.stageClass);
  if (activeRow) activeRow.classList.add('active');
}

// Milestone Jumps
function jumpToCount(num) {
  state.currentCount = num;
  state.todayTotal = Math.max(state.todayTotal, num);
  logEvent('info', `[Inspector Jump] Set reel count to ${num}`);

  if (num === 50) showBreakReminder(50);
  if (num === 100) showBreakReminder(100);

  updateUi();
}

// Reset Session
function resetCurrentSession() {
  state.currentCount = 0;
  logEvent('warn', 'Session count reset to 0 reels. Leaf returned to translucent stage.');
  updateUi();
}

// Clear History
function clearHistory() {
  state.todayTotal = 0;
  logEvent('alert', 'Local history cleared. Today count set to 0.');
  updateUi();
}

// Tracking Toggle
function toggleTracking() {
  state.trackingActive = !state.trackingActive;
  const btn = document.getElementById('btnTrackingToggle');
  const chk = document.getElementById('chkTracking');
  const statusText = document.getElementById('dashStatusText');
  const pulseDot = document.getElementById('dashPulseDot');

  if (btn) btn.innerText = state.trackingActive ? 'Pause Tracking' : 'Start Tracking';
  if (chk) chk.checked = state.trackingActive;

  if (statusText) statusText.innerText = state.trackingActive ? 'Tracking Active' : 'Tracking Paused';
  if (pulseDot) pulseDot.style.background = state.trackingActive ? 'var(--brand-green)' : '#71717a';

  logEvent('info', state.trackingActive ? 'Tracking started.' : 'Tracking paused by user.');
}

// Break Threshold Picker
function setBreakThreshold(val) {
  state.breakThreshold = val;
  document.querySelectorAll('.th-btn').forEach((b) => b.classList.remove('active'));
  event.target.classList.add('active');
  logEvent('info', `Break reminder threshold set to ${val} reels.`);
  updateUi();
}

// Auto-Scroll Toggle
function toggleAutoScroll() {
  const btn = document.getElementById('btnAutoScroll');
  if (state.autoScrollInterval) {
    clearInterval(state.autoScrollInterval);
    state.autoScrollInterval = null;
    if (btn) btn.innerHTML = '<span>▶️</span> Auto-Scroll Feed';
    logEvent('info', 'Auto-scroll stopped.');
  } else {
    state.autoScrollInterval = setInterval(() => {
      simulateNextReel();
    }, 2000);
    if (btn) btn.innerHTML = '<span>⏸️</span> Stop Auto-Scroll';
    logEvent('info', 'Auto-scroll started (every 2.0s).');
  }
}

// Break Reminders (PRD Sections 9 & 12)
function showBreakReminder(milestone) {
  const modal = document.getElementById('breakReminderModal');
  const badge = document.getElementById('modalBadge');
  const title = document.getElementById('modalTitle');
  const desc = document.getElementById('modalDesc');
  const btnBreak = document.getElementById('modalBtnBreak');

  if (!modal) return;

  if (milestone === 100) {
    badge.innerText = '🔴 100 reels';
    badge.classList.add('red-milestone');
    title.innerText = "You've watched 100 reels.";
    desc.innerText = 'Consider taking a longer break and giving your mind some rest.';
    btnBreak.classList.add('red-milestone');
    logEvent('alert', '🚨 [100 REEL MILESTONE] Strong break reminder triggered.');
  } else {
    badge.innerText = '🌱 50 reels';
    badge.classList.remove('red-milestone');
    title.innerText = 'Time for a break?';
    desc.innerText = "You've watched 50 reels. Take a short break.";
    btnBreak.classList.remove('red-milestone');
    logEvent('warn', '🟡 [50 REEL MILESTONE] 50 reels watched. Break reminder triggered.');
  }

  modal.classList.add('active');
}

function dismissBreakReminder() {
  const modal = document.getElementById('breakReminderModal');
  if (modal) modal.classList.remove('active');
  logEvent('info', 'Break reminder dismissed. User elected to continue watching.');
}

function triggerCalmBreak() {
  dismissBreakReminder();
  const calmModal = document.getElementById('calmBreathingModal');
  if (calmModal) calmModal.classList.add('active');
  logEvent('info', 'User opted into mindful pause break.');
}

function closeBreathingModal() {
  const calmModal = document.getElementById('calmBreathingModal');
  if (calmModal) calmModal.classList.remove('active');
  logEvent('info', 'Mindful break completed.');
}

// Mode & Subscreen Switching
function switchPhoneMode(mode) {
  const btnReels = document.getElementById('btnModeReels');
  const btnApp = document.getElementById('btnModeApp');
  const screenReels = document.getElementById('phoneScreenReels');
  const screenApp = document.getElementById('phoneScreenApp');

  if (mode === 'reels') {
    btnReels.classList.add('active');
    btnApp.classList.remove('active');
    screenReels.classList.add('active');
    screenApp.classList.remove('active');
  } else {
    btnApp.classList.add('active');
    btnReels.classList.remove('active');
    screenApp.classList.add('active');
    screenReels.classList.remove('active');
  }
}

function setAppSubScreen(screenId) {
  document.querySelectorAll('.app-sub-screen').forEach((el) => el.classList.remove('active'));
  const target = document.getElementById(`subScreen${screenId.charAt(0).toUpperCase() + screenId.slice(1)}`);
  if (target) target.classList.add('active');
}

function handleCounterPillClick() {
  // Tap overlay to view app dashboard
  switchPhoneMode('app');
  setAppSubScreen('dashboard');
  logEvent('info', 'Overlay pill clicked: opened ReelStopper Dashboard.');
}

// Terminal Logging
function logEvent(type, message) {
  const terminal = document.getElementById('eventTerminalLog');
  if (!terminal) return;

  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const line = document.createElement('div');
  line.className = `log-line ${type}`;
  line.innerText = `[${time}] ${message}`;

  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}

function clearEventLog() {
  const terminal = document.getElementById('eventTerminalLog');
  if (terminal) terminal.innerHTML = '';
}
