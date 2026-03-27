// ===== Admin Panel Logic =====
const PANEL_TITLES = {
  overview:'📊 数据总览', patients:'👥 患者管理', doctors:'👨‍⚕️ 医生管理',
  orders:'📦 服务订单', vitals:'📈 健康数据', posts:'💬 社区内容',
  followups:'📅 随访记录', settings:'⚙️ 系统设置'
};

function showPanel(name) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const p = document.getElementById('panel-' + name);
  if (p) p.classList.add('active');
  document.getElementById('adminTitle').textContent = PANEL_TITLES[name] || name;
  document.querySelectorAll('.sidebar .nav-item').forEach(i => i.classList.remove('active'));
  const renders = {
    overview: renderOverview, patients: renderPatients, doctors: renderDoctors,
    orders: renderOrders, vitals: renderVitals, posts: renderPosts,
    followups: renderFollowups, settings: renderSettings
  };
  if (renders[name]) renders[name]();
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

// ── Overview ──────────────────────────────────────────────────────────────────
function renderOverview() {
  const stats = Store.getStats();
  const users = Store.getUsers();
  const el = document.getElementById('overviewStats');
  if (!el) return;
  el.innerHTML = [
    { icon:'👥', label:'注册患者', val: stats.totalUsers, color:'var(--primary)', bg:'#ebf8ff', sub:'本月新增 '+stats.newUsersThisMonth },
    { icon:'👨‍⚕️', label:'签约医生', val: stats.totalDoctors, color:'#0d9488', bg:'#e6fffa', sub:'全部在职' },
    { icon:'📦', label:'服务订单', val: stats.totalOrders, color:'var(--warning)', bg:'#fffff0', sub:'进行中 '+stats.activeOrders },
    { icon:'📅', label:'今日打卡', val: stats.todayCheckins, color:'var(--success)', bg:'#f0fff4', sub:'共 '+stats.totalUsers+' 人' }
  ].map(s => `
    <div class="admin-stat">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="width:48px;height:48px;border-radius:12px;background:${s.bg};display:flex;align-items:center;justify-content:center;font-size:22px">${s.icon}</div>
        <div>
          <div class="val" style="color:${s.color}">${s.val}</div>
          <div style="font-size:12px;color:var(--text-muted)">${s.label}</div>
          <div style="font-size:11px;color:var(--text-muted)">${s.sub}</div>
        </div>
      </div>
    </div>
  `).join('');

  setTimeout(() => {
    Charts.line('userTrendChart',
      Array.from({length:10},(_,i)=>(i*3+1)+'日'),
      [{ data:[2,3,1,4,2,3,5,2,4,3], color:'#7c3aed', fill:true }],
      { min:0, max:8 });
    Charts.donut('diseaseChart',
      [52,38,22,16],
      ['#FC5C65','#2E86AB','#9b59b6','#26de81'],
      { centerText:'128', centerSubText:'患者', bg:'#fff' });
    Charts.line('checkinChart',
      ['周一','周二','周三','周四','周五','周六','周日'],
      [{ data:[82,88,79,91,85,76,89], color:'#0d9488', fill:true }],
      { min:60, max:100 });
    Charts.donut('orderChart',
      [stats.activeOrders, stats.totalOrders - stats.activeOrders],
      ['#26de81','#e2e8f0'],
      { centerText: stats.activeOrders+'', centerSubText:'进行中', bg:'#fff' });
  }, 100);

  const ra = document.getElementById('recentActivity');
  if (ra) {
    const vitals = Store.get('vitals') || [];
    const posts = Store.getPosts();
    const orders = Store.getOrders();
    const activities = [
      ...vitals.slice(0,3).map(v => ({ icon:'📊', text:`患者记录了${v.type==='bp'?'血压':'血糖'}数据`, time: v.createdAt })),
      ...posts.slice(0,2).map(p => ({ icon:'💬', text:`${p.authorName} 发布了社区动态`, time: p.createdAt })),
      ...orders.slice(0,2).map(o => ({ icon:'📦', text:`新服务订单: ${o.packName}`, time: o.createdAt }))
    ].sort((a,b) => new Date(b.time) - new Date(a.time)).slice(0,8);
    ra.innerHTML = activities.map(a => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
        <span style="font-size:18px">${a.icon}</span>
        <span style="flex:1;font-size:13px">${a.text}</span>
        <span style="font-size:11px;color:var(--text-muted)">${fmtTime(a.time)}</span>
      </div>
    `).join('');
  }

  const si = document.getElementById('storageInfo');
  if (si) {
    let total = 0;
    Object.keys(localStorage).filter(k=>k.startsWith('ccp_')).forEach(k => { total += (localStorage.getItem(k)||'').length; });
    si.textContent = `已使用约 ${(total/1024).toFixed(1)} KB / 5120 KB`;
  }
}

// ── Patients ──────────────────────────────────────────────────────────────────
function renderPatients() {
  const search = (document.getElementById('patientSearch')||{}).value||'';
  const diseaseF = (document.getElementById('patientDiseaseFilter')||{}).value||'';
  const statusF = (document.getElementById('patientStatusFilter')||{}).value||'';
  const doctors = Store.getDoctors();
  let users = Store.getUsers().filter(u => u.role === 'patient');
  if (search) users = users.filter(u => u.name.includes(search) || (u.phone||'').includes(search));
  if (diseaseF) users = users.filter(u => (u.disease||[]).some(d => d.includes(diseaseF)));
  if (statusF) users = users.filter(u => u.status === statusF);
  const cnt = document.getElementById('patientCount');
  if (cnt) cnt.textContent = `共 ${users.length} 名患者`;
  const tbody = document.getElementById('patientTableBody');
  if (!tbody) return;
  tbody.innerHTML = users.map(u => {
    const doc = doctors.find(d => d.id === u.doctorId);
    const pts = Store.getPoints(u.id);
    const streak = Store.getStreak(u.id);
    return `<tr>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:20px">${u.avatar||'👤'}</span>
          <div><div style="font-weight:600">${u.name}</div><div style="font-size:11px;color:var(--text-muted)">${u.phone}</div></div>
        </div>
      </td>
      <td>${u.age||'-'}岁 / ${u.gender||'-'}</td>
      <td>${(u.disease||[]).map(d=>`<span class="tag tag-blue" style="font-size:11px;margin:1px">${d}</span>`).join('')}</td>
      <td>${doc ? doc.name+'医生' : '<span style="color:var(--text-muted)">未签约</span>'}</td>
      <td style="font-weight:700;color:var(--primary)">${pts.toLocaleString()}</td>
      <td>${streak}天</td>
      <td><span class="status-dot status-${u.status||'active'}"></span>${u.status==='active'?'正常':'停用'}</td>
      <td><div class="actions">
        <button class="btn btn-outline btn-sm" onclick="viewUser('${u.id}')">查看</button>
        <button class="btn btn-outline btn-sm" onclick="editUser('${u.id}')">编辑</button>
        <button class="btn btn-sm" style="background:${u.status==='active'?'var(--warning)':'var(--success)'};color:#fff" onclick="toggleUserStatus('${u.id}')">
          ${u.status==='active'?'停用':'启用'}
        </button>
      </div></td>
    </tr>`;
  }).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:20px">暂无数据</td></tr>';
}

// ── Doctors ───────────────────────────────────────────────────────────────────
function renderDoctors() {
  const search = (document.getElementById('doctorSearch')||{}).value||'';
  const deptF = (document.getElementById('doctorDeptFilter')||{}).value||'';
  let docs = Store.getDoctors();
  if (search) docs = docs.filter(d => d.name.includes(search));
  if (deptF) docs = docs.filter(d => d.dept === deptF);
  const cnt = document.getElementById('doctorCount');
  if (cnt) cnt.textContent = `共 ${docs.length} 名医生`;
  const tbody = document.getElementById('doctorTableBody');
  if (!tbody) return;
  tbody.innerHTML = docs.map(d => `<tr>
    <td>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:20px">${d.avatar||'👨‍⚕️'}</span>
        <div><div style="font-weight:600">${d.name}</div><div style="font-size:11px;color:var(--text-muted)">${d.phone||''}</div></div>
      </div>
    </td>
    <td>${d.title} / ${d.dept}</td>
    <td style="font-size:12px">${d.hospital}</td>
    <td style="font-weight:700;color:var(--primary)">${d.patientCount}</td>
    <td>⭐ ${d.rating}</td>
    <td>${d.experience}年</td>
    <td><span class="status-dot status-${d.status||'active'}"></span>${d.status==='active'?'在职':'离职'}</td>
    <td><div class="actions">
      <button class="btn btn-outline btn-sm" onclick="editDoctor('${d.id}')">编辑</button>
      <button class="btn btn-danger btn-sm" onclick="deleteDoctor('${d.id}')">删除</button>
    </div></td>
  </tr>`).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:20px">暂无数据</td></tr>';
}

// ── Orders ────────────────────────────────────────────────────────────────────
function renderOrders() {
  const search = (document.getElementById('orderSearch')||{}).value||'';
  const statusF = (document.getElementById('orderStatusFilter')||{}).value||'';
  const users = Store.getUsers();
  const doctors = Store.getDoctors();
  let orders = Store.getOrders();
  if (search) orders = orders.filter(o => o.id.includes(search) || (users.find(u=>u.id===o.userId)||{}).name?.includes(search));
  if (statusF) orders = orders.filter(o => o.status === statusF);
  const cnt = document.getElementById('orderCount');
  if (cnt) cnt.textContent = `共 ${orders.length} 条订单`;
  const tbody = document.getElementById('orderTableBody');
  if (!tbody) return;
  const statusMap = { pending:'待确认', active:'进行中', done:'已完成', cancelled:'已取消' };
  const statusColor = { pending:'tag-yellow', active:'tag-green', done:'tag-blue', cancelled:'tag-red' };
  tbody.innerHTML = orders.map(o => {
    const user = users.find(u => u.id === o.userId);
    const doc = doctors.find(d => d.id === o.doctorId);
    return `<tr>
      <td style="font-size:12px;font-family:monospace">${o.id}</td>
      <td>${user ? user.name : o.userId}</td>
      <td>${o.packName}</td>
      <td>${doc ? doc.name+'医生' : '-'}</td>
      <td style="font-weight:700;color:var(--primary)">¥${o.price}</td>
      <td>${o.period}</td>
      <td><span class="tag ${statusColor[o.status]||'tag-blue'}">${statusMap[o.status]||o.status}</span></td>
      <td><div class="actions">
        ${o.status==='pending'?`<button class="btn btn-success btn-sm" onclick="updateOrder('${o.id}','active')">确认</button>`:''}
        ${o.status==='active'?`<button class="btn btn-primary btn-sm" onclick="updateOrder('${o.id}','done')">完成</button>`:''}
        <button class="btn btn-danger btn-sm" onclick="updateOrder('${o.id}','cancelled')">取消</button>
      </div></td>
    </tr>`;
  }).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:20px">暂无数据</td></tr>';
}

// ── Vitals ────────────────────────────────────────────────────────────────────
function renderVitals() {
  const userF = (document.getElementById('vitalsUserFilter')||{}).value||'';
  const typeF = (document.getElementById('vitalsTypeFilter')||{}).value||'';
  const users = Store.getUsers().filter(u=>u.role==='patient');
  const sel = document.getElementById('vitalsUserFilter');
  if (sel && sel.options.length <= 1) {
    users.forEach(u => { const o = document.createElement('option'); o.value=u.id; o.textContent=u.name; sel.appendChild(o); });
  }
  let vitals = Store.get('vitals') || [];
  if (userF) vitals = vitals.filter(v => v.userId === userF);
  if (typeF) vitals = vitals.filter(v => v.type === typeF);
  vitals = vitals.slice(0, 100);
  const cnt = document.getElementById('vitalsCount');
  if (cnt) cnt.textContent = `显示 ${vitals.length} 条记录`;
  const tbody = document.getElementById('vitalsTableBody');
  if (!tbody) return;
  tbody.innerHTML = vitals.map(v => {
    const user = users.find(u => u.id === v.userId);
    const val = v.type === 'bp' ? `${v.systolic}/${v.diastolic} mmHg` : `${v.value} mmol/L`;
    return `<tr>
      <td>${user ? user.name : v.userId}</td>
      <td><span class="tag ${v.type==='bp'?'tag-red':'tag-yellow'}">${v.type==='bp'?'血压':'血糖'}</span></td>
      <td style="font-weight:700">${val}</td>
      <td>${v.measureTime||v.time||'-'}</td>
      <td style="font-size:12px;color:var(--text-muted)">${fmtTime(v.createdAt)}</td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteVital(${v.id})">删除</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:20px">暂无数据</td></tr>';
}

// ── Posts ─────────────────────────────────────────────────────────────────────
function renderPosts() {
  const search = (document.getElementById('postSearch')||{}).value||'';
  const diseaseF = (document.getElementById('postDiseaseFilter')||{}).value||'';
  let posts = Store.getPosts();
  if (search) posts = posts.filter(p => p.content.includes(search));
  if (diseaseF) posts = posts.filter(p => p.disease === diseaseF);
  const cnt = document.getElementById('postCount');
  if (cnt) cnt.textContent = `共 ${posts.length} 条帖子`;
  const tbody = document.getElementById('postTableBody');
  if (!tbody) return;
  tbody.innerHTML = posts.map(p => `<tr>
    <td>${p.authorName||p.userId}</td>
    <td style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.content}</td>
    <td><span class="tag tag-blue" style="font-size:11px">${p.disease||'-'}</span></td>
    <td>❤️ ${p.likes||0}</td>
    <td>💬 ${p.comments||0}</td>
    <td style="font-size:12px;color:var(--text-muted)">${fmtTime(p.createdAt)}</td>
    <td><div class="actions">
      <button class="btn btn-danger btn-sm" onclick="deletePost(${p.id})">删除</button>
    </div></td>
  </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:20px">暂无数据</td></tr>';
}

// ── Followups ─────────────────────────────────────────────────────────────────
function renderFollowups() {
  const docF = (document.getElementById('followupDoctorFilter')||{}).value||'';
  const statusF = (document.getElementById('followupStatusFilter')||{}).value||'';
  const doctors = Store.getDoctors();
  const sel = document.getElementById('followupDoctorFilter');
  if (sel && sel.options.length <= 1) {
    doctors.forEach(d => { const o = document.createElement('option'); o.value=d.id; o.textContent=d.name+'医生'; sel.appendChild(o); });
  }
  let followups = Store.getFollowups();
  if (docF) followups = followups.filter(f => f.doctorId === docF);
  if (statusF) followups = followups.filter(f => f.status === statusF);
  const cnt = document.getElementById('followupCount');
  if (cnt) cnt.textContent = `共 ${followups.length} 条随访`;
  const tbody = document.getElementById('followupTableBody');
  if (!tbody) return;
  const prioColor = { high:'tag-red', mid:'tag-yellow', low:'tag-green' };
  const prioText = { high:'高', mid:'中', low:'低' };
  tbody.innerHTML = followups.map(f => {
    const doc = doctors.find(d => d.id === f.doctorId);
    return `<tr>
      <td style="font-weight:600">${f.patientName}</td>
      <td>${doc ? doc.name+'医生' : f.doctorId}</td>
      <td>${f.type}</td>
      <td>${f.date}</td>
      <td><span class="tag ${prioColor[f.priority]||'tag-blue'}">${prioText[f.priority]||f.priority}优先</span></td>
      <td><span class="tag ${f.status==='done'?'tag-green':'tag-yellow'}">${f.status==='done'?'已完成':'待随访'}</span></td>
      <td><div class="actions">
        ${f.status!=='done'?`<button class="btn btn-success btn-sm" onclick="completeFollowup('${f.id}')">完成</button>`:''}
        <button class="btn btn-danger btn-sm" onclick="deleteFollowup('${f.id}')">删除</button>
      </div></td>
    </tr>`;
  }).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:20px">暂无数据</td></tr>';
}

function renderSettings() {
  const si = document.getElementById('storageInfo');
  if (si) {
    let total = 0;
    Object.keys(localStorage).filter(k=>k.startsWith('ccp_')).forEach(k => { total += (localStorage.getItem(k)||'').length; });
    si.textContent = `已使用约 ${(total/1024).toFixed(1)} KB / 5120 KB（浏览器 localStorage 限额约 5MB）`;
  }
}

// ── Actions ───────────────────────────────────────────────────────────────────
function toggleUserStatus(id) {
  const user = Store.getUserById(id);
  if (!user) return;
  user.status = user.status === 'active' ? 'inactive' : 'active';
  Store.saveUser(user);
  renderPatients();
  App.showToast(`已${user.status==='active'?'启用':'停用'} ${user.name}`, 'success');
}

function viewUser(id) {
  const u = Store.getUserById(id);
  if (!u) return;
  const pts = Store.getPoints(id);
  const streak = Store.getStreak(id);
  alert(`患者信息\n姓名: ${u.name}\n手机: ${u.phone}\n年龄: ${u.age}岁\n病种: ${(u.disease||[]).join('、')}\n积分: ${pts}\n连续打卡: ${streak}天\n地址: ${u.address||'-'}`);
}

function editUser(id) {
  const u = Store.getUserById(id);
  if (!u) return;
  const name = prompt('修改姓名:', u.name);
  if (name && name !== u.name) { u.name = name; Store.saveUser(u); renderPatients(); App.showToast('已更新', 'success'); }
}

function openAddUser() {
  const name = prompt('患者姓名:');
  if (!name) return;
  const phone = prompt('手机号:');
  if (!phone) return;
  const user = {
    id: 'u' + Date.now(), role: 'patient', name, phone, password: '123456',
    age: 60, gender: '未知', avatar: '👤', disease: [],
    level: 1, status: 'active', createdAt: new Date().toISOString()
  };
  Store.saveUser(user);
  renderPatients();
  App.showToast('患者已添加', 'success');
}

function editDoctor(id) {
  const d = Store.getDoctorById(id);
  if (!d) return;
  const name = prompt('修改医生姓名:', d.name);
  if (name && name !== d.name) { d.name = name; Store.saveDoctor(d); renderDoctors(); App.showToast('已更新', 'success'); }
}

function deleteDoctor(id) {
  if (!confirm('确定删除该医生？')) return;
  Store.deleteDoctor(id);
  renderDoctors();
  App.showToast('已删除', 'success');
}

function openAddDoctor() {
  const name = prompt('医生姓名:');
  if (!name) return;
  const doc = {
    id: 'd' + Date.now(), name, title: '主治医师', dept: '全科',
    hospital: '社区卫生服务中心', avatar: '👨‍⚕️', phone: '',
    rating: 5.0, patientCount: 0, experience: 5,
    tags: [], intro: '', status: 'active', createdAt: new Date().toISOString()
  };
  Store.saveDoctor(doc);
  renderDoctors();
  App.showToast('医生已添加', 'success');
}

function updateOrder(id, status) {
  Store.updateOrderStatus(id, status);
  renderOrders();
  const map = { active:'已确认订单', done:'订单已完成', cancelled:'订单已取消' };
  App.showToast(map[status]||'已更新', 'success');
}

function deleteVital(id) {
  if (!confirm('确定删除该记录？')) return;
  Store.deleteVital(id);
  renderVitals();
  App.showToast('已删除', 'success');
}

function deletePost(id) {
  if (!confirm('确定删除该帖子？')) return;
  const posts = Store.getPosts().filter(p => p.id !== id);
  Store.set('posts', posts);
  renderPosts();
  App.showToast('帖子已删除', 'success');
}

function completeFollowup(id) {
  Store.updateFollowup(id, { status: 'done' });
  renderFollowups();
  App.showToast('随访已完成', 'success');
}

function deleteFollowup(id) {
  if (!confirm('确定删除该随访记录？')) return;
  const all = Store.getFollowups().filter(f => f.id !== id);
  Store.set('followups', all);
  renderFollowups();
  App.showToast('已删除', 'success');
}

// ── Export / Import ───────────────────────────────────────────────────────────
function exportData() {
  const data = {};
  Object.keys(localStorage).filter(k => k.startsWith('ccp_')).forEach(k => {
    data[k.replace('ccp_', '')] = JSON.parse(localStorage.getItem(k));
  });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `ccp_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  App.showToast('数据已导出', 'success');
}

function importData(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      Object.entries(data).forEach(([k, v]) => Store.set(k, v));
      App.showToast('数据导入成功，即将刷新', 'success');
      setTimeout(() => location.reload(), 1000);
    } catch { App.showToast('文件格式错误', 'danger'); }
  };
  reader.readAsText(file);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtTime(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return '刚刚';
  if (diff < 3600) return Math.floor(diff/60) + '分钟前';
  if (diff < 86400) return Math.floor(diff/3600) + '小时前';
  return d.toLocaleDateString('zh-CN');
}

document.addEventListener('DOMContentLoaded', () => {
  DB.init();
  App.init();
  const user = Store.getCurrentUser();
  if (user) document.getElementById('adminName').textContent = user.name;
  renderOverview();
});
