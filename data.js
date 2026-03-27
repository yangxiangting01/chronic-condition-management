// ===== Mock Data =====
const APP_DATA = {
  user: {
    name: '测试用户01',
    age: 0,
    gender: '未知',
    disease: ['2型糖尿病', '高血压'],
    level: 'Lv.12 健康达人',
    points: 3840,
    avatar: '👨',
    joinDays: 186,
    streak: 23,
    healthScore: 78
  },

  vitals: [
    { id: 'bp', name: '血压', value: '128/82', unit: 'mmHg', icon: '🫀', color: '#FC5C65', bg: '#fff5f5', status: 'warning', statusText: '偏高', time: '今天 08:30', trend: [125,130,128,135,128,132,128] },
    { id: 'bs', name: '血糖', value: '6.8', unit: 'mmol/L', icon: '🩸', color: '#F7B731', bg: '#fffff0', status: 'warning', statusText: '偏高', time: '今天 07:00', trend: [7.2,6.9,7.1,6.8,7.0,6.8,6.8] },
    { id: 'hr', name: '心率', value: '72', unit: 'bpm', icon: '💓', color: '#FC5C65', bg: '#fff5f5', status: 'normal', statusText: '正常', time: '今天 08:30', trend: [68,72,70,75,72,71,72] },
    { id: 'weight', name: '体重', value: '72.5', unit: 'kg', icon: '⚖️', color: '#26de81', bg: '#f0fff4', status: 'normal', statusText: '正常', time: '今天 07:15', trend: [73.2,73.0,72.8,72.6,72.5,72.5,72.5] },
    { id: 'bmi', name: 'BMI', value: '24.2', unit: '', icon: '📊', color: '#2E86AB', bg: '#ebf8ff', status: 'normal', statusText: '正常', time: '今天 07:15', trend: [24.5,24.4,24.3,24.2,24.2,24.2,24.2] },
    { id: 'spo2', name: '血氧', value: '98', unit: '%', icon: '🫁', color: '#4ECDC4', bg: '#e6fffa', status: 'normal', statusText: '正常', time: '今天 08:30', trend: [97,98,98,97,98,98,98] }
  ],

  medications: [
    { id: 1, name: '二甲双胍', dose: '500mg', frequency: '每日3次', time: '07:00', icon: '💊', color: '#ebf8ff', taken: true, stock: 45, refillDate: '2026-04-10' },
    { id: 2, name: '格列美脲', dose: '2mg', frequency: '每日1次', time: '07:00', icon: '💊', color: '#f0fff4', taken: true, stock: 28, refillDate: '2026-04-05' },
    { id: 3, name: '厄贝沙坦', dose: '150mg', frequency: '每日1次', time: '08:00', icon: '💊', color: '#fff5f5', taken: false, stock: 12, refillDate: '2026-03-28' },
    { id: 4, name: '阿托伐他汀', dose: '20mg', frequency: '每日1次', time: '21:00', icon: '💊', color: '#faf5ff', taken: false, stock: 30, refillDate: '2026-04-15' },
    { id: 5, name: '阿司匹林', dose: '100mg', frequency: '每日1次', time: '12:00', icon: '💊', color: '#fffff0', taken: false, stock: 60, refillDate: '2026-05-01' }
  ],

  leaderboard: [
    { rank: 1, name: '测试用户02', avatar: '👩', points: 5280, disease: '高血压', streak: 45, change: 0, isMe: false, level: 'Lv.18' },
    { rank: 2, name: '测试用户03', avatar: '👨', points: 4960, disease: '糖尿病', streak: 38, change: 1, isMe: false, level: 'Lv.16' },
    { rank: 3, name: '测试用户04', avatar: '👩', points: 4720, disease: '冠心病', streak: 32, change: -1, isMe: false, level: 'Lv.15' },
    { rank: 4, name: '测试用户05', avatar: '👨', points: 4380, disease: '高血压', streak: 29, change: 2, isMe: false, level: 'Lv.14' },
    { rank: 5, name: '测试用户06', avatar: '👩', points: 4120, disease: '糖尿病', streak: 27, change: 0, isMe: false, level: 'Lv.13' },
    { rank: 6, name: '测试用户01', avatar: '👨', points: 3840, disease: '糖尿病', streak: 23, change: 1, isMe: true, level: 'Lv.12' },
    { rank: 7, name: '测试用户07', avatar: '👩', points: 3650, disease: '高血压', streak: 20, change: -1, isMe: false, level: 'Lv.12' },
    { rank: 8, name: '测试用户08', avatar: '👨', points: 3420, disease: '冠心病', streak: 18, change: 0, isMe: false, level: 'Lv.11' },
    { rank: 9, name: '测试用户09', avatar: '👩', points: 3180, disease: '糖尿病', streak: 15, change: 3, isMe: false, level: 'Lv.11' },
    { rank: 10, name: '测试用户10', avatar: '👨', points: 2960, disease: '高血压', streak: 12, change: -2, isMe: false, level: 'Lv.10' }
  ],

  achievements: [
    { id: 1, icon: '🏃', name: '运动达人', desc: '连续运动30天', locked: false },
    { id: 2, icon: '💊', name: '按时服药', desc: '连续服药7天', locked: false },
    { id: 3, icon: '🥗', name: '健康饮食', desc: '记录饮食14天', locked: false },
    { id: 4, icon: '📊', name: '数据控', desc: '记录100次指标', locked: false },
    { id: 5, icon: '🌟', name: '健康明星', desc: '健康分达到90', locked: true },
    { id: 6, icon: '🔥', name: '打卡狂人', desc: '连续打卡60天', locked: true },
    { id: 7, icon: '🏆', name: '排行榜冠军', desc: '登顶排行榜', locked: true },
    { id: 8, icon: '❤️', name: '爱心助手', desc: '帮助10位病友', locked: false },
    { id: 9, icon: '📚', name: '学习达人', desc: '完成20篇科普', locked: false },
    { id: 10, icon: '🎯', name: '目标达成', desc: '完成月度目标', locked: true },
    { id: 11, icon: '🌙', name: '早睡早起', desc: '规律作息30天', locked: true },
    { id: 12, icon: '💪', name: '坚持不懈', desc: '使用满半年', locked: false }
  ],

  posts: [
    {
      id: 1, avatar: '👩', name: '测试用户02', time: '2小时前', disease: '高血压',
      diseaseColor: 'tag-red',
      content: '今天血压控制得很好，128/80，坚持低盐饮食真的有效果！分享一下我的饮食心得：早餐燕麦粥+水煮蛋，午餐清蒸鱼+蔬菜，晚餐少吃。大家一起加油💪',
      likes: 42, comments: 18, shares: 6, liked: false,
      images: ['🥣', '🐟', '🥦']
    },
    {
      id: 2, avatar: '👨', name: '测试用户03', time: '4小时前', disease: '糖尿病',
      diseaseColor: 'tag-yellow',
      content: '餐后血糖7.2，比上周好多了。医生说我的糖化血红蛋白从7.8降到了6.9，真的很开心！坚持运动+饮食控制，大家不要放弃！',
      likes: 67, comments: 31, shares: 12, liked: true,
      images: []
    },
    {
      id: 3, avatar: '👩', name: '测试用户04', time: '昨天', disease: '冠心病',
      diseaseColor: 'tag-purple',
      content: '今天去复查，医生说心脏功能有所改善，继续保持。推荐大家试试太极拳，我坚持了3个月，感觉整个人精神多了，心率也稳定了很多。',
      likes: 89, comments: 45, shares: 23, liked: false,
      images: ['🧘', '🌿']
    }
  ],

  dietToday: {
    calories: { consumed: 1680, target: 1800 },
    carbs: { consumed: 180, target: 220, color: '#F7B731' },
    protein: { consumed: 72, target: 80, color: '#2E86AB' },
    fat: { consumed: 48, target: 55, color: '#FC5C65' },
    fiber: { consumed: 18, target: 25, color: '#26de81' },
    meals: [
      { time: '早餐 07:30', items: [
        { emoji: '🥣', name: '燕麦粥', amount: '200g', cal: 148 },
        { emoji: '🥚', name: '水煮蛋', amount: '1个', cal: 72 },
        { emoji: '🥛', name: '低脂牛奶', amount: '250ml', cal: 115 }
      ]},
      { time: '午餐 12:00', items: [
        { emoji: '🍚', name: '糙米饭', amount: '100g', cal: 116 },
        { emoji: '🐟', name: '清蒸鲈鱼', amount: '150g', cal: 135 },
        { emoji: '🥦', name: '西兰花', amount: '100g', cal: 34 },
        { emoji: '🥗', name: '凉拌黄瓜', amount: '100g', cal: 16 }
      ]},
      { time: '晚餐 18:30', items: [
        { emoji: '🍲', name: '杂粮粥', amount: '200g', cal: 120 },
        { emoji: '🥩', name: '瘦肉炒蔬菜', amount: '150g', cal: 180 },
        { emoji: '🍅', name: '番茄', amount: '100g', cal: 18 }
      ]}
    ]
  },

  exerciseToday: {
    steps: 8420,
    stepsTarget: 10000,
    calories: 320,
    caloriesTarget: 400,
    duration: 52,
    durationTarget: 60,
    activities: [
      { icon: '🚶', name: '晨间散步', duration: '30分钟', calories: 120, intensity: '低强度', color: '#ebf8ff' },
      { icon: '🏊', name: '游泳', duration: '22分钟', calories: 200, intensity: '中强度', color: '#f0fff4' }
    ],
    weeklySteps: [6200, 7800, 9100, 8420, 0, 0, 0]
  },

  weekLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  monthBP: {
    systolic: [132,128,135,130,128,125,130,128,132,128,125,128,130,128,132,128,125,128,130,128,132,128,125,128,130,128,132,128,125,128],
    diastolic: [85,82,88,84,82,80,84,82,85,82,80,82,84,82,85,82,80,82,84,82,85,82,80,82,84,82,85,82,80,82]
  },
  monthBS: [7.2,6.9,7.1,6.8,7.0,6.8,6.8,7.1,6.9,7.0,6.8,6.7,6.9,7.0,6.8,6.7,6.8,6.9,7.0,6.8,6.7,6.8,6.9,7.0,6.8,6.7,6.8,6.9,7.0,6.8]
};

// Points system
const POINT_ACTIONS = {
  recordVital: { points: 10, label: '记录指标' },
  takeMed: { points: 15, label: '按时服药' },
  logDiet: { points: 8, label: '记录饮食' },
  exercise: { points: 20, label: '完成运动' },
  dailyCheckin: { points: 5, label: '每日打卡' },
  postCommunity: { points: 12, label: '发布动态' },
  readArticle: { points: 3, label: '阅读科普' }
};
