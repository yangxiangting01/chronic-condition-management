/**
 * Store — localStorage 统一数据层
 * 所有读写通过此模块，数据持久化在浏览器本地
 */
const Store = {
  // ── 基础读写 ──────────────────────────────────────────
  get(key) {
    try { return JSON.parse(localStorage.getItem('ccp_' + key)); } catch { return null; }
  },
  set(key, val) {
    localStorage.setItem('ccp_' + key, JSON.stringify(val));
  },
  remove(key) { localStorage.removeItem('ccp_' + key); },
  clear() {
    Object.keys(localStorage).filter(k => k.startsWith('ccp_')).forEach(k => localStorage.removeItem(k));
  },

  // ── 当前登录用户 ──────────────────────────────────────
  getCurrentUser() { return this.get('currentUser'); },
  setCurrentUser(user) { this.set('currentUser', user); },
  logout() { this.remove('currentUser'); },

  // ── 用户表 ────────────────────────────────────────────
  getUsers() { return this.get('users') || []; },
  getUserById(id) { return this.getUsers().find(u => u.id === id) || null; },
  getUserByPhone(phone) { return this.getUsers().find(u => u.phone === phone) || null; },
  saveUser(user) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) users[idx] = user; else users.push(user);
    this.set('users', users);
  },
  deleteUser(id) { this.set('users', this.getUsers().filter(u => u.id !== id)); },

  // ── 医生表 ────────────────────────────────────────────
  getDoctors() { return this.get('doctors') || []; },
  getDoctorById(id) { return this.getDoctors().find(d => d.id === id) || null; },
  saveDoctor(doc) {
    const docs = this.getDoctors();
    const idx = docs.findIndex(d => d.id === doc.id);
    if (idx >= 0) docs[idx] = doc; else docs.push(doc);
    this.set('doctors', docs);
  },
  deleteDoctor(id) { this.set('doctors', this.getDoctors().filter(d => d.id !== id)); },

  // ── 健康指标记录 ──────────────────────────────────────
  getVitals(userId) {
    return (this.get('vitals') || []).filter(v => v.userId === userId);
  },
  addVital(record) {
    const all = this.get('vitals') || [];
    record.id = Date.now();
    record.createdAt = new Date().toISOString();
    all.unshift(record);
    this.set('vitals', all.slice(0, 500)); // 最多保留500条
  },
  deleteVital(id) { this.set('vitals', (this.get('vitals')||[]).filter(v => v.id !== id)); },

  // ── 用药记录 ──────────────────────────────────────────
  getMedications(userId) {
    return (this.get('medications') || []).filter(m => m.userId === userId);
  },
  saveMedication(med) {
    const all = this.get('medications') || [];
    const idx = all.findIndex(m => m.id === med.id);
    if (idx >= 0) all[idx] = med; else { med.id = Date.now(); all.push(med); }
    this.set('medications', all);
  },
  deleteMedication(id) { this.set('medications', (this.get('medications')||[]).filter(m => m.id !== id)); },

  // ── 饮食记录 ──────────────────────────────────────────
  getDietLogs(userId) {
    return (this.get('dietLogs') || []).filter(d => d.userId === userId);
  },
  addDietLog(log) {
    const all = this.get('dietLogs') || [];
    log.id = Date.now();
    log.createdAt = new Date().toISOString();
    all.unshift(log);
    this.set('dietLogs', all.slice(0, 300));
  },

  // ── 运动记录 ──────────────────────────────────────────
  getExerciseLogs(userId) {
    return (this.get('exerciseLogs') || []).filter(e => e.userId === userId);
  },
  addExerciseLog(log) {
    const all = this.get('exerciseLogs') || [];
    log.id = Date.now();
    log.createdAt = new Date().toISOString();
    all.unshift(log);
    this.set('exerciseLogs', all.slice(0, 300));
  },

  // ── 打卡记录 ──────────────────────────────────────────
  getCheckins(userId) { return this.get('checkins_' + userId) || []; },
  addCheckin(userId) {
    const today = new Date().toDateString();
    const list = this.getCheckins(userId);
    if (!list.includes(today)) { list.push(today); this.set('checkins_' + userId, list); return true; }
    return false;
  },
  hasCheckedIn(userId) {
    return this.getCheckins(userId).includes(new Date().toDateString());
  },
  getStreak(userId) {
    const list = this.getCheckins(userId);
    if (!list.length) return 0;
    let streak = 0, d = new Date();
    while (true) {
      if (list.includes(d.toDateString())) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  },

  // ── 积分 ──────────────────────────────────────────────
  getPoints(userId) { return this.get('points_' + userId) || 0; },
  addPoints(userId, pts, reason) {
    const cur = this.getPoints(userId);
    this.set('points_' + userId, cur + pts);
    const log = this.get('pointsLog_' + userId) || [];
    log.unshift({ pts, reason, time: new Date().toISOString() });
    this.set('pointsLog_' + userId, log.slice(0, 100));
    return cur + pts;
  },
  getPointsLog(userId) { return this.get('pointsLog_' + userId) || []; },

  // ── 服务订单 ──────────────────────────────────────────
  getOrders(userId) {
    const all = this.get('orders') || [];
    return userId ? all.filter(o => o.userId === userId) : all;
  },
  addOrder(order) {
    const all = this.get('orders') || [];
    order.id = 'SV' + Date.now();
    order.createdAt = new Date().toISOString();
    order.status = 'pending';
    all.unshift(order);
    this.set('orders', all);
    return order;
  },
  updateOrderStatus(id, status) {
    const all = this.get('orders') || [];
    const idx = all.findIndex(o => o.id === id);
    if (idx >= 0) { all[idx].status = status; this.set('orders', all); }
  },

  // ── 社区帖子 ──────────────────────────────────────────
  getPosts() { return this.get('posts') || []; },
  addPost(post) {
    const all = this.getPosts();
    post.id = Date.now();
    post.createdAt = new Date().toISOString();
    post.likes = 0; post.comments = 0; post.likedBy = [];
    all.unshift(post);
    this.set('posts', all.slice(0, 200));
    return post;
  },
  toggleLike(postId, userId) {
    const all = this.getPosts();
    const post = all.find(p => p.id === postId);
    if (!post) return;
    if (!post.likedBy) post.likedBy = [];
    const idx = post.likedBy.indexOf(userId);
    if (idx >= 0) { post.likedBy.splice(idx, 1); post.likes--; }
    else { post.likedBy.push(userId); post.likes++; }
    this.set('posts', all);
  },

  // ── 随访记录 ──────────────────────────────────────────
  getFollowups(doctorId) {
    const all = this.get('followups') || [];
    return doctorId ? all.filter(f => f.doctorId === doctorId) : all;
  },
  addFollowup(f) {
    const all = this.get('followups') || [];
    f.id = Date.now(); f.createdAt = new Date().toISOString();
    all.unshift(f); this.set('followups', all);
  },
  updateFollowup(id, data) {
    const all = this.get('followups') || [];
    const idx = all.findIndex(f => f.id === id);
    if (idx >= 0) { all[idx] = { ...all[idx], ...data }; this.set('followups', all); }
  },

  // ── 问诊消息 ──────────────────────────────────────────
  getMessages(roomId) { return this.get('msgs_' + roomId) || []; },
  addMessage(roomId, msg) {
    const all = this.getMessages(roomId);
    msg.id = Date.now(); msg.time = new Date().toISOString();
    all.push(msg); this.set('msgs_' + roomId, all.slice(-200));
  },

  // ── 系统通知 ──────────────────────────────────────────
  getNotifications(userId) { return this.get('notifs_' + userId) || []; },
  addNotification(userId, notif) {
    const all = this.getNotifications(userId);
    notif.id = Date.now(); notif.read = false; notif.time = new Date().toISOString();
    all.unshift(notif); this.set('notifs_' + userId, all.slice(0, 50));
  },
  markAllRead(userId) {
    const all = this.getNotifications(userId).map(n => ({ ...n, read: true }));
    this.set('notifs_' + userId, all);
  },

  // ── 统计汇总（后台用）────────────────────────────────
  getStats() {
    const users = this.getUsers();
    const doctors = this.getDoctors();
    const orders = this.getOrders();
    const posts = this.getPosts();
    const vitals = this.get('vitals') || [];
    return {
      totalUsers: users.filter(u => u.role === 'patient').length,
      totalDoctors: doctors.length,
      totalOrders: orders.length,
      activeOrders: orders.filter(o => o.status === 'active').length,
      totalPosts: posts.length,
      totalVitals: vitals.length,
      todayCheckins: users.filter(u => this.hasCheckedIn(u.id)).length,
      newUsersThisMonth: users.filter(u => {
        const d = new Date(u.createdAt || 0);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length
    };
  }
};
