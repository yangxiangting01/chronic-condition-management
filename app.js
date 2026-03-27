// ===== App Core =====
const App = {
  currentPage: 'dashboard',

  init() {
    this.setupSidebar();
    this.setupMobileNav();
    this.setupModals();
    this.renderPage();
  },

  setupSidebar() {
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!hamburger) return;
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('open');
    });
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  },

  setupMobileNav() {
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        if (page) this.navigate(page);
      });
    });
  },

  setupModals() {
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.modal-overlay').classList.remove('open');
      });
    });
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.classList.remove('open');
      });
    });
  },

  openModal(id) {
    document.getElementById(id)?.classList.add('open');
  },

  closeModal(id) {
    document.getElementById(id)?.classList.remove('open');
  },

  navigate(page) {
    window.location.href = page + '.html';
  },

  renderPage() {
    // Detect current page from body data attribute
    const page = document.body.dataset.page;
    if (!page) return;
    this.currentPage = page;
    // Highlight active nav
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });
    document.querySelectorAll('.mobile-nav-item[data-page]').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });
  },

  showToast(msg, type = 'success') {
    const toast = document.createElement('div');
    const colors = { success: '#26de81', danger: '#FC5C65', warning: '#fd9644', info: '#2E86AB' };
    toast.style.cssText = `position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:${colors[type]};color:#fff;padding:10px 20px;border-radius:20px;font-size:14px;font-weight:600;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.2);transition:opacity 0.3s;`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 2500);
  }
};

// ===== Dashboard Page =====
const Dashboard = {
  init() {
    this.renderVitals();
    this.renderMedications();
    this.renderHealthScore();
    this.renderTrendChart();
    this.renderWeeklyChart();
    this.setupCheckin();
    this.renderAlerts();
  },

  renderHealthScore() {
    const score = APP_DATA.user.healthScore;
    const canvas = document.getElementById('healthScoreRing');
    if (!canvas) return;
    Charts.ring('healthScoreRing', score, 100, '#2E86AB', { lineWidth: 10 });
    const el = document.getElementById('healthScoreNum');
    if (el) el.textContent = score;
  },

  renderVitals() {
    const container = document.getElementById('vitalsContainer');
    if (!container) return;
    container.innerHTML = APP_DATA.vitals.map(v => `
      <div class="vital-item" onclick="Dashboard.showVitalDetail('${v.id}')">
        <div class="vital-icon" style="background:${v.bg}">
          <span>${v.icon}</span>
        </div>
        <div class="vital-info">
          <div class="vital-name">${v.name}</div>
          <div><span class="vital-value">${v.value}</span> <span class="vital-unit">${v.unit}</span></div>
          <div style="font-size:11px;color:var(--text-muted)">${v.time}</div>
        </div>
        <div class="vital-status ${v.status}">${v.statusText}</div>
      </div>
    `).join('');
  },

  renderMedications() {
    const container = document.getElementById('medContainer');
    if (!container) return;
    const today = APP_DATA.medications.filter(m => ['07:00','08:00','12:00'].includes(m.time));
    container.innerHTML = today.map(m => `
      <div class="med-item">
        <div class="med-icon" style="background:${m.color}">${m.icon}</div>
        <div class="med-info">
          <div class="med-name">${m.name}</div>
          <div class="med-dose">${m.dose} · ${m.frequency}</div>
        </div>
        <div class="med-time">${m.time}</div>
        <div class="med-check ${m.taken ? 'done' : ''}" onclick="Dashboard.toggleMed(${m.id}, this)">
          ${m.taken ? '✓' : ''}
        </div>
      </div>
    `).join('');
  },

  toggleMed(id, el) {
    const med = APP_DATA.medications.find(m => m.id === id);
    if (!med) return;
    med.taken = !med.taken;
    el.classList.toggle('done', med.taken);
    el.textContent = med.taken ? '✓' : '';
    if (med.taken) App.showToast(`已记录服用 ${med.name}`, 'success');
  },

  renderTrendChart() {
    const v = APP_DATA.vitals.find(v => v.id === 'bp');
    if (!v) return;
    setTimeout(() => {
      Charts.line('trendChart', APP_DATA.weekLabels, [
        { data: APP_DATA.monthBP.systolic.slice(-7), color: '#FC5C65', fill: true },
        { data: APP_DATA.monthBP.diastolic.slice(-7), color: '#2E86AB', fill: false }
      ], { min: 60, max: 160 });
    }, 100);
  },

  renderWeeklyChart() {
    setTimeout(() => {
      Charts.bar('weeklyBSChart', APP_DATA.weekLabels, [
        { data: APP_DATA.monthBS.slice(-7), color: '#F7B731' }
      ], { max: 10 });
    }, 100);
  },

  renderAlerts() {
    const alerts = [];
    const bp = APP_DATA.vitals.find(v => v.id === 'bp');
    if (bp && bp.status !== 'normal') alerts.push({ type: 'warning', msg: `血压偏高 (${bp.value} mmHg)，请注意休息，减少盐分摄入` });
    const lowStock = APP_DATA.medications.filter(m => m.stock < 15);
    lowStock.forEach(m => alerts.push({ type: 'danger', msg: `${m.name} 库存不足 (剩余${m.stock}片)，请及时补充` }));
    const container = document.getElementById('alertsContainer');
    if (!container) return;
    container.innerHTML = alerts.map(a => `
      <div class="alert alert-${a.type}">
        <span>${a.type === 'warning' ? '⚠️' : '🚨'}</span>
        <span>${a.msg}</span>
      </div>
    `).join('') || '<div class="alert alert-success"><span>✅</span><span>今日健康状况良好，继续保持！</span></div>';
  },

  setupCheckin() {
    const btn = document.getElementById('checkinBtn');
    if (!btn) return;
    const today = new Date().toDateString();
    const lastCheckin = localStorage.getItem('lastCheckin');
    if (lastCheckin === today) {
      btn.textContent = '✅ 已打卡';
      btn.disabled = true;
    }
    btn.addEventListener('click', () => {
      localStorage.setItem('lastCheckin', today);
      btn.textContent = '✅ 已打卡';
      btn.disabled = true;
      App.showToast('打卡成功！获得 5 积分', 'success');
    });
  },

  showVitalDetail(id) {
    const v = APP_DATA.vitals.find(v => v.id === id);
    if (!v) return;
    document.getElementById('vitalDetailTitle').textContent = v.name + '趋势';
    document.getElementById('vitalDetailValue').textContent = v.value + ' ' + v.unit;
    App.openModal('vitalDetailModal');
    setTimeout(() => {
      Charts.line('vitalDetailChart', APP_DATA.weekLabels, [
        { data: v.trend, color: v.color, fill: true }
      ]);
    }, 100);
  }
};

// ===== Leaderboard Page =====
const Leaderboard = {
  currentTab: 'week',
  init() {
    this.renderTop3();
    this.renderList();
    this.renderAchievements();
    this.setupTabs();
  },

  renderTop3() {
    const top3 = APP_DATA.leaderboard.slice(0, 3);
    const order = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd
    const ranks = [2, 1, 3];
    const sizes = ['56px', '72px', '56px'];
    const colors = ['#a0aec0', '#F7B731', '#cd7f32'];
    const container = document.getElementById('top3Container');
    if (!container) return;
    container.innerHTML = order.map((u, i) => `
      <div class="lb-top-item rank-${ranks[i]}">
        ${ranks[i] === 1 ? '<div class="lb-crown">👑</div>' : ''}
        <div class="lb-avatar" style="width:${sizes[i]};height:${sizes[i]};background:linear-gradient(135deg,${colors[i]}88,${colors[i]});font-size:${ranks[i]===1?'28':'22'}px">
          ${u.avatar}
        </div>
        <div class="lb-rank-badge" style="background:${colors[i]}">${ranks[i]}</div>
        <div class="lb-name">${u.name}</div>
        <div class="lb-score">${u.points.toLocaleString()} 分</div>
      </div>
    `).join('');
  },

  renderList() {
    const container = document.getElementById('lbListContainer');
    if (!container) return;
    container.innerHTML = APP_DATA.leaderboard.map(u => `
      <div class="lb-list-item ${u.isMe ? 'me' : ''}">
        <div class="lb-rank-num ${u.rank <= 3 ? 'top' : ''}">${u.rank <= 3 ? ['🥇','🥈','🥉'][u.rank-1] : u.rank}</div>
        <div class="avatar" style="width:40px;height:40px;background:linear-gradient(135deg,#4ECDC4,#2E86AB);font-size:18px">${u.avatar}</div>
        <div class="lb-user-info">
          <div class="lb-user-name">${u.name} ${u.isMe ? '<span class="tag tag-blue" style="font-size:10px">我</span>' : ''}</div>
          <div class="lb-user-meta">${u.level} · 连续${u.streak}天 · ${u.disease}</div>
        </div>
        <div style="text-align:right">
          <div class="lb-points">${u.points.toLocaleString()}</div>
          <div class="lb-change ${u.change > 0 ? 'up' : u.change < 0 ? 'down' : ''}">
            ${u.change > 0 ? '▲'+u.change : u.change < 0 ? '▼'+Math.abs(u.change) : '—'}
          </div>
        </div>
      </div>
    `).join('');
  },

  renderAchievements() {
    const container = document.getElementById('achievementsContainer');
    if (!container) return;
    container.innerHTML = APP_DATA.achievements.map(a => `
      <div class="achievement-item ${a.locked ? 'locked' : ''}" title="${a.desc}">
        <div class="achievement-icon">${a.icon}</div>
        <div class="achievement-name">${a.name}</div>
      </div>
    `).join('');
  },

  setupTabs() {
    document.querySelectorAll('.lb-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.lb-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTab = btn.dataset.tab;
        App.showToast('已切换到' + btn.textContent + '榜单');
      });
    });
  }
};

// ===== Medication Page =====
const Medication = {
  init() {
    this.renderMedList();
    this.renderCalendar();
    this.renderAdherenceChart();
    this.setupAddMed();
  },

  renderMedList() {
    const container = document.getElementById('medListContainer');
    if (!container) return;
    container.innerHTML = APP_DATA.medications.map(m => `
      <div class="med-item" style="background:var(--card);border:1.5px solid var(--border);border-radius:var(--radius-sm);margin-bottom:10px;padding:14px">
        <div class="med-icon" style="background:${m.color}">${m.icon}</div>
        <div class="med-info">
          <div class="med-name">${m.name} <span class="tag tag-blue" style="font-size:11px">${m.dose}</span></div>
          <div class="med-dose">${m.frequency} · ${m.time}</div>
          <div style="margin-top:6px">
            <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-bottom:4px">
              <span>库存: ${m.stock}片</span>
              <span>补药日: ${m.refillDate}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width:${Math.min(m.stock/60*100,100)}%;background:${m.stock<15?'var(--danger)':'var(--success)'}"></div>
            </div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
          <div class="med-check ${m.taken?'done':''}" onclick="Medication.toggleTaken(${m.id},this)">${m.taken?'✓':''}</div>
          ${m.stock < 15 ? '<span class="tag tag-red" style="font-size:10px">⚠️ 补药</span>' : ''}
        </div>
      </div>
    `).join('');
  },

  toggleTaken(id, el) {
    const med = APP_DATA.medications.find(m => m.id === id);
    if (!med) return;
    med.taken = !med.taken;
    el.classList.toggle('done', med.taken);
    el.textContent = med.taken ? '✓' : '';
    App.showToast(med.taken ? `已记录服用 ${med.name} +15积分` : `已取消 ${med.name}`, med.taken ? 'success' : 'warning');
  },

  renderCalendar() {
    const container = document.getElementById('medCalContainer');
    if (!container) return;
    const days = ['日','一','二','三','四','五','六'];
    let html = days.map(d => `<div class="med-cal-day">${d}</div>`).join('');
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    for (let i = 0; i < firstDay; i++) html += `<div class="med-cal-cell empty"></div>`;
    for (let d = 1; d <= today.getDate(); d++) {
      const isToday = d === today.getDate();
      const taken = Math.random() > 0.15;
      const cls = isToday ? 'today' : taken ? 'taken' : 'missed';
      html += `<div class="med-cal-cell ${cls}">${d}</div>`;
    }
    container.innerHTML = html;
  },

  renderAdherenceChart() {
    setTimeout(() => {
      Charts.bar('adherenceChart', APP_DATA.weekLabels, [
        { data: [3,3,2,3,3,3,2], color: '#26de81' },
        { data: [0,0,1,0,0,0,1], color: '#FC5C65' }
      ], { max: 5 });
    }, 100);
  },

  setupAddMed() {
    const btn = document.getElementById('addMedBtn');
    if (btn) btn.addEventListener('click', () => App.openModal('addMedModal'));
    const form = document.getElementById('addMedForm');
    if (form) form.addEventListener('submit', e => {
      e.preventDefault();
      App.closeModal('addMedModal');
      App.showToast('药物添加成功', 'success');
    });
  }
};

// ===== Diet Page =====
const Diet = {
  init() {
    this.renderNutrition();
    this.renderMeals();
    this.renderWeeklyCalChart();
    this.setupAddFood();
  },

  renderNutrition() {
    const d = APP_DATA.dietToday;
    const pct = Math.round(d.calories.consumed / d.calories.target * 100);
    setTimeout(() => {
      Charts.donut('nutritionChart',
        [d.carbs.consumed, d.protein.consumed, d.fat.consumed, d.fiber.consumed],
        [d.carbs.color, d.protein.color, d.fat.color, d.fiber.color],
        { centerText: d.calories.consumed + '', centerSubText: '千卡', bg: '#fff' }
      );
    }, 100);

    const legend = document.getElementById('nutritionLegend');
    if (legend) {
      const items = [
        { label: '碳水', val: d.carbs.consumed, target: d.carbs.target, color: d.carbs.color, unit: 'g' },
        { label: '蛋白质', val: d.protein.consumed, target: d.protein.target, color: d.protein.color, unit: 'g' },
        { label: '脂肪', val: d.fat.consumed, target: d.fat.target, color: d.fat.color, unit: 'g' },
        { label: '膳食纤维', val: d.fiber.consumed, target: d.fiber.target, color: d.fiber.color, unit: 'g' }
      ];
      legend.innerHTML = items.map(it => `
        <div class="nutrition-legend-item">
          <div class="legend-dot" style="background:${it.color}"></div>
          <span style="flex:1">${it.label}</span>
          <span style="font-weight:700">${it.val}/${it.target}${it.unit}</span>
        </div>
      `).join('');
    }

    const calBar = document.getElementById('calProgressBar');
    if (calBar) calBar.style.width = pct + '%';
    const calText = document.getElementById('calProgressText');
    if (calText) calText.textContent = `${d.calories.consumed} / ${d.calories.target} 千卡 (${pct}%)`;
  },

  renderMeals() {
    const container = document.getElementById('mealsContainer');
    if (!container) return;
    container.innerHTML = APP_DATA.dietToday.meals.map(meal => `
      <div style="margin-bottom:16px">
        <div style="font-size:13px;font-weight:700;color:var(--primary);margin-bottom:8px">${meal.time}</div>
        ${meal.items.map(item => `
          <div class="food-item">
            <div class="food-emoji">${item.emoji}</div>
            <div class="food-info">
              <div class="food-name">${item.name}</div>
              <div class="food-amount">${item.amount}</div>
            </div>
            <div class="food-cal">${item.cal} 千卡</div>
          </div>
        `).join('')}
      </div>
    `).join('');
  },

  renderWeeklyCalChart() {
    setTimeout(() => {
      Charts.bar('weeklyCalChart', APP_DATA.weekLabels, [
        { data: [1750, 1820, 1680, 1900, 1680, 0, 0], color: '#F7B731' }
      ], { max: 2200 });
    }, 100);
  },

  setupAddFood() {
    const btn = document.getElementById('addFoodBtn');
    if (btn) btn.addEventListener('click', () => App.openModal('addFoodModal'));
  }
};

// ===== Exercise Page =====
const Exercise = {
  init() {
    this.renderRings();
    this.renderActivities();
    this.renderWeeklySteps();
    this.setupStartExercise();
  },

  renderRings() {
    const ex = APP_DATA.exerciseToday;
    setTimeout(() => {
      Charts.ring('stepsRing', ex.steps, ex.stepsTarget, '#2E86AB', { lineWidth: 10 });
      Charts.ring('calRing', ex.calories, ex.caloriesTarget, '#FC5C65', { lineWidth: 10 });
      Charts.ring('durRing', ex.duration, ex.durationTarget, '#26de81', { lineWidth: 10 });
    }, 100);

    const stepsEl = document.getElementById('stepsValue');
    if (stepsEl) stepsEl.textContent = ex.steps.toLocaleString();
    const calEl = document.getElementById('calBurnValue');
    if (calEl) calEl.textContent = ex.calories;
    const durEl = document.getElementById('durValue');
    if (durEl) durEl.textContent = ex.duration;
  },

  renderActivities() {
    const container = document.getElementById('activitiesContainer');
    if (!container) return;
    container.innerHTML = APP_DATA.exerciseToday.activities.map(a => `
      <div class="activity-item">
        <div class="activity-icon" style="background:${a.color}">${a.icon}</div>
        <div class="activity-info">
          <div class="activity-name">${a.name}</div>
          <div class="activity-meta">${a.duration} · <span class="tag tag-blue" style="font-size:11px">${a.intensity}</span></div>
        </div>
        <div class="activity-cal">-${a.calories} 千卡</div>
      </div>
    `).join('');
  },

  renderWeeklySteps() {
    setTimeout(() => {
      Charts.bar('weeklyStepsChart', APP_DATA.weekLabels, [
        { data: APP_DATA.exerciseToday.weeklySteps, color: '#4ECDC4' }
      ], { max: 12000 });
    }, 100);
  },

  setupStartExercise() {
    const btn = document.getElementById('startExerciseBtn');
    if (btn) btn.addEventListener('click', () => App.openModal('exerciseModal'));
  }
};

// ===== Community Page =====
const Community = {
  init() {
    this.renderPosts();
    this.setupPost();
  },

  renderPosts() {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    container.innerHTML = APP_DATA.posts.map(p => `
      <div class="post-card">
        <div class="post-header">
          <div class="post-avatar" style="background:linear-gradient(135deg,#4ECDC4,#2E86AB)">${p.avatar}</div>
          <div>
            <div class="post-user-name">${p.name}</div>
            <div class="post-time">${p.time}</div>
          </div>
          <span class="tag ${p.diseaseColor} post-disease-tag">${p.disease}</span>
        </div>
        <div class="post-content">${p.content}</div>
        ${p.images.length ? `<div class="post-images">${p.images.map(img=>`<div class="post-img">${img}</div>`).join('')}</div>` : ''}
        <div class="post-actions">
          <button class="post-action-btn ${p.liked?'liked':''}" onclick="Community.toggleLike(${p.id},this)">
            ${p.liked?'❤️':'🤍'} <span>${p.likes}</span>
          </button>
          <button class="post-action-btn">💬 <span>${p.comments}</span></button>
          <button class="post-action-btn">↗️ <span>${p.shares}</span></button>
        </div>
      </div>
    `).join('');
  },

  toggleLike(id, btn) {
    const post = APP_DATA.posts.find(p => p.id === id);
    if (!post) return;
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
    btn.classList.toggle('liked', post.liked);
    btn.innerHTML = `${post.liked?'❤️':'🤍'} <span>${post.likes}</span>`;
  },

  setupPost() {
    const btn = document.getElementById('newPostBtn');
    if (btn) btn.addEventListener('click', () => App.openModal('newPostModal'));
    const form = document.getElementById('newPostForm');
    if (form) form.addEventListener('submit', e => {
      e.preventDefault();
      App.closeModal('newPostModal');
      App.showToast('发布成功！获得 12 积分', 'success');
    });
  }
};

// ===== Report Page =====
const Report = {
  init() {
    this.renderMetrics();
    this.renderBPChart();
    this.renderBSChart();
    this.renderRadar();
  },

  renderMetrics() {
    const container = document.getElementById('reportMetricsContainer');
    if (!container) return;
    container.innerHTML = APP_DATA.vitals.map(v => `
      <div class="report-metric">
        <div class="report-metric-icon" style="background:${v.bg}">${v.icon}</div>
        <div class="report-metric-info">
          <div class="report-metric-name">${v.name}</div>
          <div class="report-metric-value" style="color:${v.color}">${v.value} <span style="font-size:13px;font-weight:400;color:var(--text-muted)">${v.unit}</span></div>
        </div>
        <div class="report-metric-bar">
          <div class="progress-bar">
            <div class="progress-fill" style="width:${v.status==='normal'?75:v.status==='warning'?88:95}%;background:${v.status==='normal'?'var(--success)':v.status==='warning'?'var(--warning)':'var(--danger)'}"></div>
          </div>
          <div style="font-size:11px;margin-top:3px;text-align:right" class="vital-status ${v.status}">${v.statusText}</div>
        </div>
      </div>
    `).join('');
  },

  renderBPChart() {
    const labels = Array.from({length: 30}, (_, i) => i % 5 === 0 ? (i+1)+'日' : '');
    setTimeout(() => {
      Charts.line('bpMonthChart', labels, [
        { data: APP_DATA.monthBP.systolic, color: '#FC5C65', fill: false },
        { data: APP_DATA.monthBP.diastolic, color: '#2E86AB', fill: false }
      ], { min: 60, max: 160 });
    }, 100);
  },

  renderBSChart() {
    const labels = Array.from({length: 30}, (_, i) => i % 5 === 0 ? (i+1)+'日' : '');
    setTimeout(() => {
      Charts.line('bsMonthChart', labels, [
        { data: APP_DATA.monthBS, color: '#F7B731', fill: true }
      ], { min: 4, max: 10 });
    }, 100);
  },

  renderRadar() {
    // Simple radar using canvas
    const canvas = document.getElementById('radarChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height;
    const cx = W/2, cy = H/2, r = Math.min(W,H)/2 - 30;
    const labels = ['血压', '血糖', '运动', '饮食', '服药', '睡眠'];
    const values = [0.75, 0.72, 0.84, 0.80, 0.90, 0.70];
    const n = labels.length;
    const angle = (i) => (i / n) * Math.PI * 2 - Math.PI / 2;

    ctx.clearRect(0, 0, W, H);

    // Grid
    [0.25, 0.5, 0.75, 1].forEach(scale => {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const x = cx + Math.cos(angle(i)) * r * scale;
        const y = cy + Math.sin(angle(i)) * r * scale;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Axes
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r);
      ctx.strokeStyle = '#e2e8f0';
      ctx.stroke();
      ctx.fillStyle = '#718096';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const lx = cx + Math.cos(angle(i)) * (r + 18);
      const ly = cy + Math.sin(angle(i)) * (r + 18);
      ctx.fillText(labels[i], lx, ly);
    }

    // Data
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = cx + Math.cos(angle(i)) * r * values[i];
      const y = cy + Math.sin(angle(i)) * r * values[i];
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(46,134,171,0.2)';
    ctx.fill();
    ctx.strokeStyle = '#2E86AB';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
};

// ===== Health Record Page =====
const HealthRecord = {
  init() {
    this.renderTimeline();
    this.renderDiseaseInfo();
  },

  renderTimeline() {
    const container = document.getElementById('timelineContainer');
    if (!container) return;
    const events = [
      { date: '2026-03-20', title: '复诊记录', desc: '血糖控制良好，糖化血红蛋白6.9%，继续当前治疗方案', color: '#26de81' },
      { date: '2026-03-10', title: '血压异常', desc: '血压升至145/92，医生调整厄贝沙坦剂量至150mg', color: '#FC5C65' },
      { date: '2026-02-28', title: '体检报告', desc: '年度体检完成，肾功能正常，血脂略偏高，建议控制饮食', color: '#F7B731' },
      { date: '2026-02-15', title: '运动目标达成', desc: '本月累计运动时长超过600分钟，获得运动达人徽章', color: '#2E86AB' },
      { date: '2026-01-20', title: '新增用药', desc: '医生建议加用阿托伐他汀20mg控制血脂', color: '#9b59b6' },
      { date: '2025-12-01', title: '确诊高血压', desc: '血压持续偏高，确诊为高血压，开始药物治疗', color: '#FC5C65' }
    ];
    container.innerHTML = events.map(e => `
      <div class="timeline-item">
        <div class="timeline-dot" style="background:${e.color}"></div>
        <div class="timeline-content">
          <div class="timeline-date">${e.date}</div>
          <div class="timeline-title">${e.title}</div>
          <div class="timeline-desc">${e.desc}</div>
        </div>
      </div>
    `).join('');
  },

  renderDiseaseInfo() {
    const container = document.getElementById('diseaseContainer');
    if (!container) return;
    const diseases = [
      { name: '2型糖尿病', since: '2023-06', control: '良好', icon: '🩸', color: '#fffff0', borderColor: '#F7B731',
        targets: [{ label: '空腹血糖', target: '4.4-7.0 mmol/L', current: '6.8', ok: true },
                  { label: '餐后2h血糖', target: '<10.0 mmol/L', current: '8.2', ok: true },
                  { label: '糖化血红蛋白', target: '<7.0%', current: '6.9%', ok: true }] },
      { name: '高血压', since: '2025-12', control: '一般', icon: '🫀', color: '#fff5f5', borderColor: '#FC5C65',
        targets: [{ label: '收缩压', target: '<130 mmHg', current: '128', ok: true },
                  { label: '舒张压', target: '<80 mmHg', current: '82', ok: false }] }
    ];
    container.innerHTML = diseases.map(d => `
      <div class="card" style="border-left:4px solid ${d.borderColor};margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <span style="font-size:28px">${d.icon}</span>
          <div>
            <div style="font-size:16px;font-weight:700">${d.name}</div>
            <div style="font-size:12px;color:var(--text-muted)">确诊时间: ${d.since} · 控制状态: <span style="color:${d.control==='良好'?'var(--success)':'var(--warning)'};font-weight:600">${d.control}</span></div>
          </div>
        </div>
        ${d.targets.map(t => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:13px;color:var(--text-muted)">${t.label}</span>
            <span style="font-size:13px">${t.target}</span>
            <span style="font-size:14px;font-weight:700;color:${t.ok?'var(--success)':'var(--danger)'}">${t.current} ${t.ok?'✓':'⚠️'}</span>
          </div>
        `).join('')}
      </div>
    `).join('');
  }
};

// Init on page load
document.addEventListener('DOMContentLoaded', () => {
  App.init();
  const page = document.body.dataset.page;
  if (page === 'dashboard') Dashboard.init();
  else if (page === 'leaderboard') {
    Leaderboard.init();
    if (typeof renderDailyTasks === 'function') renderDailyTasks();
  }
  else if (page === 'medication') Medication.init();
  else if (page === 'diet') Diet.init();
  else if (page === 'exercise') Exercise.init();
  else if (page === 'community') Community.init();
  else if (page === 'report') Report.init();
  else if (page === 'health-record') HealthRecord.init();
});
