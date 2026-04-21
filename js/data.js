// ============================================================
// data.js — 資料來源模擬 (Layer 1) + 資料前處理 (Layer 2)
// ============================================================

/**
 * 模擬所有停車場的基本資訊
 */
const PARKING_LOTS = [
    { id: 'PL001', name: '台北車站地下停車場', area: '中正區', totalSpaces: 620, lat: 25.0478, lng: 121.5170 },
    { id: 'PL002', name: '信義威秀停車場', area: '信義區', totalSpaces: 480, lat: 25.0360, lng: 121.5675 },
    { id: 'PL003', name: '西門町立體停車場', area: '萬華區', totalSpaces: 350, lat: 25.0420, lng: 121.5082 },
    { id: 'PL004', name: '大安森林公園停車場', area: '大安區', totalSpaces: 550, lat: 25.0300, lng: 121.5355 },
    { id: 'PL005', name: '南港展覽館停車場', area: '南港區', totalSpaces: 800, lat: 25.0555, lng: 121.6170 },
    { id: 'PL006', name: '士林夜市停車場', area: '士林區', totalSpaces: 280, lat: 25.0880, lng: 121.5242 },
    { id: 'PL007', name: '內湖科技停車場', area: '內湖區', totalSpaces: 420, lat: 25.0780, lng: 121.5695 },
    { id: 'PL008', name: '松山機場停車場', area: '松山區', totalSpaces: 700, lat: 25.0630, lng: 121.5520 },
];

/**
 * 天氣狀態模擬 (氣象局 API)
 */
const WEATHER_CONDITIONS = ['晴天', '多雲', '陰天', '小雨', '大雨', '雷雨'];
const WEATHER_ICONS = {
    '晴天': '☀️', '多雲': '⛅', '陰天': '☁️',
    '小雨': '🌦️', '大雨': '🌧️', '雷雨': '⛈️'
};

/**
 * 節假日日曆
 */
function isHoliday(date) {
    const day = date.getDay();
    if (day === 0 || day === 6) return true;
    const holidays = [
        '01-01', '01-02', '02-28', '04-04', '04-05',
        '05-01', '06-03', '09-17', '10-10', '10-11'
    ];
    const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return holidays.includes(mmdd);
}

/**
 * 模擬即時天氣
 */
function getCurrentWeather() {
    const hour = new Date().getHours();
    const rand = Math.random();
    let condition;
    if (rand < 0.35) condition = '晴天';
    else if (rand < 0.55) condition = '多雲';
    else if (rand < 0.70) condition = '陰天';
    else if (rand < 0.85) condition = '小雨';
    else if (rand < 0.95) condition = '大雨';
    else condition = '雷雨';

    return {
        condition,
        icon: WEATHER_ICONS[condition],
        temperature: Math.round(22 + Math.random() * 12),
        humidity: Math.round(55 + Math.random() * 35),
        rainfall: condition.includes('雨') ? Math.round(Math.random() * 30) : 0,
        uv: condition === '晴天' ? Math.round(5 + Math.random() * 7) : Math.round(1 + Math.random() * 4),
    };
}

/**
 * 建立過去 24 小時的歷史佔用率資料 (TDX 歷史資料模擬)
 */
function generateHistoricalData(lot, hoursBack = 24) {
    const now = new Date();
    const data = [];
    const holiday = isHoliday(now);

    for (let i = hoursBack * 12; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 5 * 60000); // 每 5 分鐘一筆
        const hour = time.getHours();
        const minute = time.getMinutes();

        // 基礎佔用率曲線 (根據時段)
        let baseOccupancy = getBaseOccupancy(hour, lot.area, holiday);

        // 加入隨機波動
        const noise = (Math.random() - 0.5) * 12;
        let occupancy = Math.min(100, Math.max(5, baseOccupancy + noise));

        data.push({
            timestamp: time,
            hour,
            minute,
            occupancy: Math.round(occupancy * 10) / 10,
            availableSpaces: Math.round(lot.totalSpaces * (1 - occupancy / 100)),
            isHoliday: holiday,
            dayOfWeek: time.getDay(),
        });
    }

    return data;
}

/**
 * 根據時段與區域產生基礎佔用率
 */
function getBaseOccupancy(hour, area, isHoliday) {
    // 不同區域有不同的時段特性
    const patterns = {
        '中正區': [20, 15, 12, 10, 10, 15, 30, 55, 80, 90, 88, 85, 82, 85, 88, 90, 88, 82, 70, 55, 40, 35, 30, 25],
        '信義區': [25, 18, 12, 10, 8, 10, 20, 40, 60, 70, 78, 85, 90, 88, 82, 80, 85, 90, 95, 88, 70, 55, 40, 30],
        '萬華區': [15, 12, 10, 8, 8, 10, 20, 35, 50, 60, 70, 80, 85, 82, 78, 80, 85, 92, 95, 90, 75, 55, 35, 20],
        '大安區': [18, 15, 12, 10, 10, 12, 25, 50, 72, 82, 85, 88, 85, 83, 80, 78, 75, 70, 60, 50, 42, 35, 28, 22],
        '南港區': [10, 8, 6, 5, 5, 8, 18, 45, 75, 88, 90, 88, 82, 85, 88, 85, 78, 65, 45, 30, 20, 15, 12, 10],
        '士林區': [20, 15, 10, 8, 8, 10, 15, 25, 35, 45, 55, 65, 72, 70, 65, 60, 68, 80, 92, 95, 85, 65, 40, 28],
        '內湖區': [8, 6, 5, 5, 5, 8, 20, 50, 78, 90, 92, 90, 85, 82, 85, 88, 80, 65, 40, 25, 15, 12, 10, 8],
        '松山區': [15, 12, 10, 8, 8, 15, 35, 55, 70, 80, 82, 80, 78, 80, 82, 80, 75, 70, 60, 50, 40, 30, 22, 18],
    };

    let base = (patterns[area] || patterns['中正區'])[hour];

    // 假日調整
    if (isHoliday) {
        if (['信義區', '萬華區', '士林區'].includes(area)) {
            base = Math.min(100, base * 1.15);
        } else if (['內湖區', '南港區'].includes(area)) {
            base = base * 0.6;
        }
    }

    return base;
}

/**
 * Min-Max 正規化 (Layer 2: Preprocessing)
 */
function minMaxNormalize(data, min, max) {
    return data.map(v => (v - min) / (max - min));
}

/**
 * 反正規化
 */
function minMaxDenormalize(data, min, max) {
    return data.map(v => v * (max - min) + min);
}

/**
 * 滑動視窗建構 (Window Size = 24)
 */
function createSlidingWindows(data, windowSize = 24) {
    const windows = [];
    for (let i = 0; i <= data.length - windowSize; i++) {
        windows.push(data.slice(i, i + windowSize));
    }
    return windows;
}

/**
 * 特徵工程 — 萃取時段、星期、週期特徵
 */
function extractFeatures(dataPoint) {
    const hour = dataPoint.hour;
    return {
        hourSin: Math.sin(2 * Math.PI * hour / 24),
        hourCos: Math.cos(2 * Math.PI * hour / 24),
        dayOfWeek: dataPoint.dayOfWeek,
        isHoliday: dataPoint.isHoliday ? 1 : 0,
        isPeakHour: (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19) ? 1 : 0,
        occupancy: dataPoint.occupancy,
    };
}

// Export for use in other modules
window.ParkingData = {
    PARKING_LOTS,
    WEATHER_CONDITIONS,
    WEATHER_ICONS,
    getCurrentWeather,
    generateHistoricalData,
    isHoliday,
    minMaxNormalize,
    minMaxDenormalize,
    createSlidingWindows,
    extractFeatures,
    getBaseOccupancy,
};
