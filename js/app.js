// ============================================================
// app.js — 主應用程式邏輯 (Layer 4: 整合所有模組)
// ============================================================

class SmartParkingApp {
    constructor() {
        this.model = new DDLSTMModel();
        this.weather = null;
        this.results = null;
        this.selectedLot = 'PL001';
        this.updateInterval = 60000; // 60 秒
        this.timer = null;
    }

    /**
     * 初始化 Dashboard
     */
    async init() {
        console.log('🚗 智慧停車位預測系統啟動中...');

        // 1. 取得天氣
        this.weather = ParkingData.getCurrentWeather();

        // 2. 執行批次預測
        this.results = this.model.batchPredict(ParkingData.PARKING_LOTS, this.weather);

        // 3. 渲染所有 UI 元件
        this.renderStats();
        this.renderWeather();
        this.renderParkingCards();
        this.renderTrendChart();
        this.renderHeatmap();
        this.renderModelMetrics();
        this.renderModelComparison();
        this.renderAlerts();
        this.updateTimestamp();

        // 4. 綁定事件
        this.bindEvents();

        // 5. 啟動自動更新
        this.startAutoRefresh();

        console.log('✅ Dashboard 載入完成');
    }

    /**
     * 渲染統計列
     */
    renderStats() {
        const lots = Object.values(this.results);
        const totalSpaces = lots.reduce((sum, r) => sum + r.lot.totalSpaces, 0);
        const totalAvailable = lots.reduce((sum, r) => sum + r.availableNow, 0);
        const avgOccupancy = lots.reduce((sum, r) => sum + r.currentOccupancy, 0) / lots.length;
        const criticalCount = lots.filter(r => r.status === 'critical').length;

        document.getElementById('stat-total-lots').textContent = lots.length;
        document.getElementById('stat-total-spaces').textContent = totalSpaces.toLocaleString();
        document.getElementById('stat-available').textContent = totalAvailable.toLocaleString();
        document.getElementById('stat-avg-occupancy').textContent = avgOccupancy.toFixed(1) + '%';

        const avgEl = document.getElementById('stat-avg-occupancy');
        if (avgOccupancy > 80) avgEl.style.color = 'var(--accent-red)';
        else if (avgOccupancy > 60) avgEl.style.color = 'var(--accent-yellow)';
        else avgEl.style.color = 'var(--accent-green)';

        // 嚴重狀態
        const critEl = document.getElementById('stat-critical');
        if (critEl) {
            critEl.textContent = criticalCount;
            critEl.style.color = criticalCount > 0 ? 'var(--accent-red)' : 'var(--accent-green)';
        }
    }

    /**
     * 渲染天氣面板
     */
    renderWeather() {
        const w = this.weather;
        document.getElementById('weather-icon').textContent = w.icon;
        document.getElementById('weather-temp').textContent = w.temperature + '°C';
        document.getElementById('weather-condition').textContent = w.condition;
        document.getElementById('weather-humidity').textContent = w.humidity + '%';
        document.getElementById('weather-rainfall').textContent = w.rainfall + 'mm';
        document.getElementById('weather-uv').textContent = w.uv;
    }

    /**
     * 渲染停車場卡片
     */
    renderParkingCards() {
        const grid = document.getElementById('parking-grid');
        grid.innerHTML = '';

        Object.values(this.results).forEach(result => {
            const { lot, currentOccupancy, availableNow, prediction30, prediction60, status } = result;
            const occClass = status === 'critical' ? 'critical' : status === 'warning' ? 'warning' : 'normal';
            const trendIcon30 = prediction30.trend === 'rising' ? '↑' : prediction30.trend === 'falling' ? '↓' : '→';
            const trendIcon60 = prediction60.trend === 'rising' ? '↑' : prediction60.trend === 'falling' ? '↓' : '→';

            const card = document.createElement('div');
            card.className = `parking-card status-${status} ${lot.id === this.selectedLot ? 'active' : ''}`;
            card.dataset.lotId = lot.id;
            card.innerHTML = `
                <div class="pc-header">
                    <div class="pc-name">${lot.name}</div>
                    <div class="pc-area">${lot.area}</div>
                </div>
                <div class="pc-occupancy ${occClass}">${currentOccupancy}%</div>
                <div class="pc-available">剩餘 ${availableNow} / ${lot.totalSpaces} 格</div>
                <div class="pc-predictions">
                    <div class="pc-pred">
                        <div class="pc-pred-label">30分鐘後</div>
                        <div class="pc-pred-value">${prediction30.predicted}%</div>
                        <div class="pc-pred-trend trend-${prediction30.trend}">${trendIcon30} ${prediction30.confidence}%</div>
                    </div>
                    <div class="pc-pred">
                        <div class="pc-pred-label">60分鐘後</div>
                        <div class="pc-pred-value">${prediction60.predicted}%</div>
                        <div class="pc-pred-trend trend-${prediction60.trend}">${trendIcon60} ${prediction60.confidence}%</div>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    /**
     * 渲染趨勢圖
     */
    renderTrendChart() {
        const result = this.results[this.selectedLot];
        if (!result) return;

        const predictions = generatePredictionTimeline(result.lot, this.weather);
        ParkingCharts.createTrendChart('trend-chart', result.history, predictions, result.lot.name);
    }

    /**
     * 渲染熱圖
     */
    renderHeatmap() {
        ParkingCharts.createHeatmap('heatmap-chart', this.results);
    }

    /**
     * 渲染模型效能指標
     */
    renderModelMetrics() {
        const metrics = this.model.getMetrics();
        document.getElementById('metric-mae').textContent = metrics.mae;
        document.getElementById('metric-rmse').textContent = metrics.rmse;
        document.getElementById('metric-accuracy').textContent = metrics.accuracy + '%';
    }

    /**
     * 渲染模型比較圖
     */
    renderModelComparison() {
        const metrics = this.model.getMetrics();
        ParkingCharts.createModelComparisonChart('comparison-chart', metrics);
        ParkingCharts.createAccuracyChart('accuracy-chart', metrics);
    }

    /**
     * 渲染警報
     */
    renderAlerts() {
        AlertSystem.checkAndGenerate(this.results);
        AlertSystem.renderAlerts('alerts-list');

        const badge = document.getElementById('alert-badge');
        const count = AlertSystem.getUnreadCount();
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-flex' : 'none';
        }
    }

    /**
     * 更新時間戳
     */
    updateTimestamp() {
        const now = new Date();
        const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const el = document.getElementById('update-time');
        if (el) el.textContent = `最後更新: ${ts}`;
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        document.getElementById('parking-grid').addEventListener('click', (e) => {
            const card = e.target.closest('.parking-card');
            if (!card) return;
            this.selectedLot = card.dataset.lotId;

            document.querySelectorAll('.parking-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            this.renderTrendChart();
        });
    }

    /**
     * 自動更新
     */
    startAutoRefresh() {
        this.timer = setInterval(() => {
            this.weather = ParkingData.getCurrentWeather();
            this.results = this.model.batchPredict(ParkingData.PARKING_LOTS, this.weather);
            this.renderStats();
            this.renderWeather();
            this.renderParkingCards();
            this.renderTrendChart();
            this.renderAlerts();
            this.updateTimestamp();
            console.log('🔄 Dashboard 已自動更新');
        }, this.updateInterval);
    }
}

// 啟動應用 — 使用 window.onload 確保 Chart.js CDN 完全載入
window.addEventListener('load', () => {
    try {
        const app = new SmartParkingApp();
        app.init();
    } catch (e) {
        console.error('Dashboard 初始化失敗:', e);
    }
});
