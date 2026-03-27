/**
 * DB — 初始化种子数据，首次运行时写入 localStorage
 * 之后所有操作通过 Store 读写，数据持久保存在本机浏览器
 */
const DB = {
  SEED_KEY: 'ccp_seeded_v2',

  init() {
    if (localStorage.getItem(this.SEED_KEY)) return; // 已初始化，跳过
    this._seedUsers();
    this._seedDoctors();
    this._seedVitals();
    this._seedMedications();
    this._seedPosts();
    this._seedOrders();
    this._seedFollowups();
    this._seedPoints();
    this._seedCheckins();
    localStorage.setItem(this.SEED_KEY, '1');
    console.log('[DB] 种子数据初始化完成');
  },

  reset() {
    Store.clear();
    localStorage.removeItem(this.SEED_KEY);
    this.init();
    console.log('[DB] 数据已重置');
  },

  _seedUsers() {
    const users = [
      {
        id: 'u001', role: 'patient', name: '测试用户01', phone: '13800000001', password: '123456',
        age: 0, gender: '未知', avatar: '👨', disease: ['2型糖尿病', '高血压'],
        level: 12, address: 'xxxx社区xx栋xxx室', doctorId: 'd001',
        bloodType: 'A', height: 173, weight: 72.5,
        emergencyContact: '测试联系人01', emergencyPhone: '13900000099',
        joinDate: 'xxxx年xx月xx日', createdAt: '2025-09-15T08:00:00Z', status: 'active'
      },
      {
        id: 'u002', role: 'patient', name: '测试用户02', phone: '13800000002', password: '123456',
        age: 0, gender: '未知', avatar: '👩', disease: ['高血压'],
        level: 18, address: 'xxxx社区xx栋xxx室', doctorId: 'd001',
        bloodType: 'O', height: 160, weight: 58.0,
        emergencyContact: '测试联系人02', emergencyPhone: '13900000088',
        joinDate: 'xxxx年xx月xx日', createdAt: '2025-08-01T08:00:00Z', status: 'active'
      },
      {
        id: 'u003', role: 'patient', name: '测试用户03', phone: '13800000003', password: '123456',
        age: 0, gender: '未知', avatar: '👨', disease: ['2型糖尿病'],
        level: 16, address: 'xxxx社区xx栋xxx室', doctorId: 'd001',
        bloodType: 'B', height: 170, weight: 78.0,
        emergencyContact: '测试联系人03', emergencyPhone: '13900000077',
        joinDate: 'xxxx年xx月xx日', createdAt: '2025-07-10T08:00:00Z', status: 'active'
      },
      {
        id: 'u004', role: 'patient', name: '测试用户04', phone: '13800000004', password: '123456',
        age: 0, gender: '未知', avatar: '👩', disease: ['冠心病'],
        level: 15, address: 'xxxx社区xx栋xxx室', doctorId: 'd002',
        bloodType: 'AB', height: 158, weight: 55.0,
        emergencyContact: '测试联系人04', emergencyPhone: '13900000066',
        joinDate: 'xxxx年xx月xx日', createdAt: '2025-10-05T08:00:00Z', status: 'active'
      },
      {
        id: 'u005', role: 'patient', name: '测试用户05', phone: '13800000005', password: '123456',
        age: 0, gender: '未知', avatar: '👨', disease: ['高血压'],
        level: 14, address: 'xxxx社区xx栋xxx室', doctorId: 'd001',
        bloodType: 'A', height: 175, weight: 80.0,
        emergencyContact: '测试联系人05', emergencyPhone: '13900000055',
        joinDate: 'xxxx年xx月xx日', createdAt: '2025-11-20T08:00:00Z', status: 'active'
      },
      {
        id: 'admin001', role: 'admin', name: '系统管理员', phone: '10000000000', password: 'admin888',
        avatar: '🔧', createdAt: '2025-01-01T00:00:00Z', status: 'active'
      }
    ];
    Store.set('users', users);
  },

  _seedDoctors() {
    const doctors = [
      {
        id: 'd001', userId: 'doc_u001', name: '测试医生01', title: '主治医师', dept: '全科',
        hospital: 'xxxx社区卫生服务中心', avatar: '👨‍⚕️', phone: '13700000001',
        rating: 4.9, patientCount: 128, experience: 12,
        tags: ['糖尿病', '高血压', '慢病管理'],
        intro: '从事全科医学12年，擅长慢性病综合管理。',
        workdays: '周一至周五', workHours: '08:00-17:00',
        status: 'active', createdAt: '2025-01-01T00:00:00Z'
      },
      {
        id: 'd002', userId: 'doc_u002', name: '测试医生02', title: '副主任医师', dept: '内科',
        hospital: 'xxxx社区卫生服务中心', avatar: '👩‍⚕️', phone: '13700000002',
        rating: 4.8, patientCount: 96, experience: 15,
        tags: ['冠心病', '心律失常', '老年病'],
        intro: '内科专业15年，擅长心血管疾病及老年慢性病管理。',
        workdays: '周一至周六', workHours: '08:30-17:30',
        status: 'active', createdAt: '2025-01-01T00:00:00Z'
      },
      {
        id: 'd003', userId: 'doc_u003', name: '测试医生03', title: '主治医师', dept: '中医科',
        hospital: 'xxxx社区卫生服务中心', avatar: '👨‍⚕️', phone: '13700000003',
        rating: 4.7, patientCount: 84, experience: 10,
        tags: ['中医调理', '针灸', '慢病调养'],
        intro: '中西医结合治疗慢性病，擅长通过中医手段辅助慢病管理。',
        workdays: '周二至周日', workHours: '09:00-18:00',
        status: 'active', createdAt: '2025-01-01T00:00:00Z'
      }
    ];
    Store.set('doctors', doctors);
  },

  _seedVitals() {
    const records = [];
    const users = ['u001', 'u002', 'u003'];
    const now = new Date();
    users.forEach(uid => {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        records.push({
          id: Date.now() + Math.random(),
          userId: uid,
          type: 'bp',
          systolic: 120 + Math.floor(Math.random() * 20),
          diastolic: 75 + Math.floor(Math.random() * 15),
          date: dateStr,
          time: '08:30',
          createdAt: d.toISOString()
        });
        records.push({
          id: Date.now() + Math.random(),
          userId: uid,
          type: 'bs',
          value: (5.5 + Math.random() * 2.5).toFixed(1),
          measureTime: '空腹',
          date: dateStr,
          time: '07:00',
          createdAt: d.toISOString()
        });
      }
    });
    Store.set('vitals', records);
  },

  _seedMedications() {
    const meds = [
      { id: 'm001', userId: 'u001', name: '二甲双胍', dose: '500mg', frequency: '每日3次', time: '07:00', stock: 45, refillDate: '2026-04-10', taken: true },
      { id: 'm002', userId: 'u001', name: '格列美脲', dose: '2mg', frequency: '每日1次', time: '07:00', stock: 28, refillDate: '2026-04-05', taken: true },
      { id: 'm003', userId: 'u001', name: '厄贝沙坦', dose: '150mg', frequency: '每日1次', time: '08:00', stock: 12, refillDate: '2026-03-28', taken: false },
      { id: 'm004', userId: 'u001', name: '阿托伐他汀', dose: '20mg', frequency: '每日1次', time: '21:00', stock: 30, refillDate: '2026-04-15', taken: false },
      { id: 'm005', userId: 'u002', name: '氨氯地平', dose: '5mg', frequency: '每日1次', time: '08:00', stock: 60, refillDate: '2026-05-01', taken: true },
      { id: 'm006', userId: 'u003', name: '二甲双胍', dose: '1000mg', frequency: '每日2次', time: '07:00', stock: 40, refillDate: '2026-04-20', taken: false }
    ];
    Store.set('medications', meds);
  },

  _seedPosts() {
    const posts = [
      {
        id: 1001, userId: 'u002', authorName: '测试用户02', authorAvatar: '👩',
        disease: '高血压', diseaseColor: 'tag-red',
        content: '今天血压控制得很好，128/80，坚持低盐饮食真的有效果！分享一下我的饮食心得：早餐燕麦粥+水煮蛋，午餐清蒸鱼+蔬菜，晚餐少吃。大家一起加油💪',
        likes: 42, comments: 18, likedBy: ['u001', 'u003'],
        images: ['🥣', '🐟', '🥦'],
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
      },
      {
        id: 1002, userId: 'u003', authorName: '测试用户03', authorAvatar: '👨',
        disease: '糖尿病', diseaseColor: 'tag-yellow',
        content: '餐后血糖7.2，比上周好多了。医生说我的糖化血红蛋白从7.8降到了6.9，真的很开心！坚持运动+饮食控制，大家不要放弃！',
        likes: 67, comments: 31, likedBy: ['u001'],
        images: [],
        createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
      },
      {
        id: 1003, userId: 'u004', authorName: '测试用户04', authorAvatar: '👩',
        disease: '冠心病', diseaseColor: 'tag-purple',
        content: '今天去复查，医生说心脏功能有所改善，继续保持。推荐大家试试太极拳，我坚持了3个月，感觉整个人精神多了。',
        likes: 89, comments: 45, likedBy: [],
        images: ['🧘', '🌿'],
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
      }
    ];
    Store.set('posts', posts);
  },

  _seedOrders() {
    const orders = [
      {
        id: 'SV2026031201', userId: 'u001', doctorId: 'd001',
        packName: '慢病全程管理包', price: 499, period: '3个月',
        startDate: '2026-03-01', endDate: '2026-06-01',
        status: 'active', progress: 30,
        nextService: '2026-03-28 上门随访',
        createdAt: '2026-03-01T10:00:00Z'
      },
      {
        id: 'SV2026010501', userId: 'u001', doctorId: 'd003',
        packName: '营养咨询', price: 60, period: '单次',
        startDate: '2026-01-05', endDate: '2026-01-05',
        status: 'done', progress: 100,
        nextService: '-',
        createdAt: '2026-01-05T09:00:00Z'
      },
      {
        id: 'SV2026020801', userId: 'u002', doctorId: 'd001',
        packName: '高血压基础管理包', price: 199, period: '3个月',
        startDate: '2026-02-08', endDate: '2026-05-08',
        status: 'active', progress: 55,
        nextService: '2026-03-25 电话随访',
        createdAt: '2026-02-08T10:00:00Z'
      }
    ];
    Store.set('orders', orders);
  },

  _seedFollowups() {
    const followups = [
      { id: 'f001', doctorId: 'd001', patientId: 'u001', patientName: '测试用户01', type: '电话随访', date: '2026-03-24', status: 'pending', disease: '糖尿病+高血压', priority: 'high', createdAt: '2026-03-20T00:00:00Z' },
      { id: 'f002', doctorId: 'd001', patientId: 'u003', patientName: '测试用户03', type: '上门随访', date: '2026-03-24', status: 'pending', disease: '糖尿病', priority: 'high', createdAt: '2026-03-20T00:00:00Z' },
      { id: 'f003', doctorId: 'd002', patientId: 'u004', patientName: '测试用户04', type: '门诊随访', date: '2026-03-25', status: 'pending', disease: '冠心病', priority: 'mid', createdAt: '2026-03-20T00:00:00Z' },
      { id: 'f004', doctorId: 'd001', patientId: 'u002', patientName: '测试用户02', type: '电话随访', date: '2026-03-25', status: 'done', disease: '高血压', priority: 'low', createdAt: '2026-03-20T00:00:00Z' }
    ];
    Store.set('followups', followups);
  },

  _seedPoints() {
    const pointsData = { u001: 3840, u002: 5280, u003: 4960, u004: 4720, u005: 4380 };
    Object.entries(pointsData).forEach(([uid, pts]) => Store.set('points_' + uid, pts));
    Store.set('pointsLog_u001', [
      { pts: 5, reason: '每日打卡', time: new Date().toISOString() },
      { pts: 10, reason: '记录血压', time: new Date().toISOString() },
      { pts: 15, reason: '按时服药', time: new Date().toISOString() }
    ]);
  },

  _seedCheckins() {
    const users = ['u001', 'u002', 'u003', 'u004', 'u005'];
    users.forEach(uid => {
      const days = uid === 'u001' ? 23 : uid === 'u002' ? 45 : uid === 'u003' ? 38 : uid === 'u004' ? 32 : 29;
      const list = [];
      for (let i = 0; i < days; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        list.push(d.toDateString());
      }
      Store.set('checkins_' + uid, list);
    });
  }
};
