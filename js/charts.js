// ============================================================
// charts.js — 視覺化報表 (Layer 4: Output - Charts)
// ============================================================

/**
 * 使用 Chart.js 繪製趨勢圖與熱圖
 */
class ParkingCharts {
    constructor() {
        this.charts = {};
        this.colors = {
            primary: '#6C5CE7',
            secondary: '#00CEC9',
            warning: '#FDCB6E',
            danger: '#FF7675',
            success: '#00B894',
            gradient1: ['rgba(108, 92, 231, 0.8)', 'rgba(108, 92, 231, 0.1)'],
            gradient2: ['rgba(0, 206, 201, 0.8)', 'rgba(0, 206, 201, 0.1)'],
        };
    }

    /**
     * 繪製即時趨勢圖
     */
    createTrendChart(canvasId, historicalData, predictions, lotName) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // 銷毀舊圖
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        // 歷史資料 (每 15 分鐘取一筆)
        const histLabels = historicalData.map(d => {
            const t = new Date(d.timestamp);
            return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
        });
        const histValues = historicalData.map(d => d.occupancy);

        // 預測資料
        const predLabels = predictions.map(d => {
            const t = new Date(d.time);
            return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
        });
        const predValues = predictions.map(d => d.occupancy);
        const confUpper = predictions.map(d => Math.min(100, d.occupancy + (100 - d.confidence) / 3));
        const confLower = predictions.map(d => Math.max(0, d.occupancy - (100 - d.confidence) / 3));

        const allLabels = [...histLabels, ...predLabels];
        const historicalLine = [...histValues, ...Array(predValues.length).fill(null)];
        const predictionLine = [...Array(histValues.length - 1).fill(null), histValues[histValues.length - 1], ...predValues];
        const upperBand = [...Array(histValues.length - 1).fill(null), histValues[histValues.length - 1], ...confUpper];
        const lowerBand = [...Array(histValues.length - 1).fill(null), histValues[histValues.length - 1], ...confLower];

        const gradient1 = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradient1.addColorStop(0, this.colors.gradient1[0]);
        gradient1.addColorStop(1, this.colors.gradient1[1]);

        const gradient2 = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradient2.addColorStop(0, 'rgba(0, 206, 201, 0.3)');
        gradient2.addColorStop(1, 'rgba(0, 206, 201, 0.02)');

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: allLabels,
                datasets: [
                    {
                        label: '歷史佔用率',
                        data: historicalLine,
                        borderColor: this.colors.primary,
                        backgroundColor: gradient1,
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2.5,
                        pointRadius: 0,
                        pointHoverRadius: 5,
                    },
                    {
                        label: 'DD-LSTM 預測',
                        data: predictionLine,
                        borderColor: this.colors.secondary,
                        backgroundColor: gradient2,
                        fill: true,
                        borderDash: [6, 3],
                        tension: 0.4,
                        borderWidth: 2.5,
                        pointRadius: 3,
                        pointBackgroundColor: this.colors.secondary,
                    },
                    {
                        label: '信心區間上界',
                        data: upperBand,
                        borderColor: 'rgba(0, 206, 201, 0.2)',
                        backgroundColor: 'transparent',
                        fill: false,
                        borderDash: [2, 4],
                        tension: 0.4,
                        borderWidth: 1,
                        pointRadius: 0,
                    },
                    {
                        label: '信心區間下界',
                        data: lowerBand,
                        borderColor: 'rgba(0, 206, 201, 0.2)',
                        backgroundColor: 'rgba(0, 206, 201, 0.05)',
                        fill: '-1',
                        borderDash: [2, 4],
                        tension: 0.4,
                        borderWidth: 1,
                        pointRadius: 0,
                    }
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: {
                    title: {
                        display: true,
                        text: `${lotName} — 佔用率趨勢與預測`,
                        color: '#E0E0E0',
                        font: { size: 14, weight: '600' },
                        padding: { bottom: 16 },
                    },
                    legend: {
                        labels: {
                            color: '#A0A0A0',
                            usePointStyle: true,
                            padding: 16,
                            filter: (item) => !item.text.includes('信心區間'),
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(20, 20, 40, 0.95)',
                        titleColor: '#fff',
                        bodyColor: '#ccc',
                        borderColor: 'rgba(108, 92, 231, 0.5)',
                        borderWidth: 1,
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y?.toFixed(1)}%`,
                        }
                    },
                    annotation: {
                        annotations: {
                            line1: {
                                type: 'line',
                                yMin: 90,
                                yMax: 90,
                                borderColor: 'rgba(255, 118, 117, 0.5)',
                                borderWidth: 1,
                                borderDash: [5, 5],
                                label: {
                                    content: '滿位警戒線 90%',
                                    display: true,
                                    color: '#FF7675',
                                    font: { size: 10 },
                                    position: 'end',
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: {
                            color: '#888',
                            maxTicksLimit: 12,
                            font: { size: 10 },
                        }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: {
                            color: '#888',
                            callback: v => v + '%',
                            font: { size: 10 },
                        }
                    },
                }
            }
        });
    }

    /**
     * 繪製停車場熱圖 (Heatmap)
     */
    createHeatmap(canvasId, parkingResults) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const lots = Object.values(parkingResults);
        const labels = lots.map(r => r.lot.name.replace('停車場', ''));
        const timeSlots = ['00', '03', '06', '09', '12', '15', '18', '21'];

        // 建構熱力數據
        const datasets = timeSlots.map((slot, slotIdx) => {
            const hour = parseInt(slot);
            return {
                label: `${slot}:00`,
                data: lots.map(r => {
                    const isHol = ParkingData.isHoliday(new Date());
                    return Math.round(ParkingData.getBaseOccupancy(hour, r.lot.area, isHol));
                }),
                backgroundColor: lots.map(r => {
                    const isHol = ParkingData.isHoliday(new Date());
                    const val = ParkingData.getBaseOccupancy(hour, r.lot.area, isHol);
                    return this._getHeatColor(val);
                }),
                borderColor: 'rgba(0,0,0,0.2)',
                borderWidth: 1,
                borderRadius: 3,
            };
        });

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    title: {
                        display: true,
                        text: '停車場佔用率熱圖 (各時段)',
                        color: '#E0E0E0',
                        font: { size: 14, weight: '600' },
                        padding: { bottom: 16 },
                    },
                    legend: {
                        labels: { color: '#A0A0A0', padding: 10, font: { size: 9 } },
                        position: 'top',
                    },
                    tooltip: {
                        backgroundColor: 'rgba(20, 20, 40, 0.95)',
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.x}%`,
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: false,
                        max: 100,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#888', callback: v => v + '%' }
                    },
                    y: {
                        stacked: false,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#A0A0A0', font: { size: 10 } }
                    }
                }
            }
        });
    }

    /**
     * 繪製模型比較圖
     */
    createModelComparisonChart(canvasId, metrics) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const models = ['ARIMA', 'Random Forest', '單層 LSTM', 'DD-LSTM (Ours)'];
        const maeData = [
            metrics.baselines.arima.mae,
            metrics.baselines.randomForest.mae,
            metrics.baselines.singleLSTM.mae,
            metrics.mae,
        ];
        const rmseData = [
            metrics.baselines.arima.rmse,
            metrics.baselines.randomForest.rmse,
            metrics.baselines.singleLSTM.rmse,
            metrics.rmse,
        ];
        const accData = [
            metrics.baselines.arima.accuracy,
            metrics.baselines.randomForest.accuracy,
            metrics.baselines.singleLSTM.accuracy,
            metrics.accuracy,
        ];

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: models,
                datasets: [
                    {
                        label: 'MAE',
                        data: maeData,
                        backgroundColor: [
                            'rgba(108, 92, 231, 0.4)',
                            'rgba(108, 92, 231, 0.4)',
                            'rgba(108, 92, 231, 0.4)',
                            'rgba(108, 92, 231, 0.9)',
                        ],
                        borderColor: this.colors.primary,
                        borderWidth: 1,
                        borderRadius: 6,
                    },
                    {
                        label: 'RMSE',
                        data: rmseData,
                        backgroundColor: [
                            'rgba(0, 206, 201, 0.4)',
                            'rgba(0, 206, 201, 0.4)',
                            'rgba(0, 206, 201, 0.4)',
                            'rgba(0, 206, 201, 0.9)',
                        ],
                        borderColor: this.colors.secondary,
                        borderWidth: 1,
                        borderRadius: 6,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '模型效能比較 (MAE / RMSE)',
                        color: '#E0E0E0',
                        font: { size: 14, weight: '600' },
                    },
                    legend: { labels: { color: '#A0A0A0' } },
                    tooltip: {
                        backgroundColor: 'rgba(20, 20, 40, 0.95)',
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#A0A0A0', font: { size: 10 } },
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#888' },
                    }
                }
            }
        });

        return accData;
    }

    /**
     * 繪製準確率比較圖
     */
    createAccuracyChart(canvasId, metrics) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const models = ['ARIMA', 'Random Forest', '單層 LSTM', 'DD-LSTM'];
        const accData = [
            metrics.baselines.arima.accuracy,
            metrics.baselines.randomForest.accuracy,
            metrics.baselines.singleLSTM.accuracy,
            metrics.accuracy,
        ];

        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: models,
                datasets: [{
                    data: accData,
                    backgroundColor: [
                        'rgba(255, 118, 117, 0.7)',
                        'rgba(253, 203, 110, 0.7)',
                        'rgba(108, 92, 231, 0.7)',
                        'rgba(0, 184, 148, 0.9)',
                    ],
                    borderColor: 'rgba(0,0,0,0.3)',
                    borderWidth: 2,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '55%',
                plugins: {
                    title: {
                        display: true,
                        text: '各模型預測準確率 (%)',
                        color: '#E0E0E0',
                        font: { size: 14, weight: '600' },
                    },
                    legend: {
                        position: 'bottom',
                        labels: { color: '#A0A0A0', padding: 12, usePointStyle: true },
                    },
                    tooltip: {
                        backgroundColor: 'rgba(20, 20, 40, 0.95)',
                        callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed.toFixed(1)}%` },
                    }
                }
            }
        });
    }

    /**
     * 根據佔用率回傳熱力顏色
     */
    _getHeatColor(value) {
        if (value >= 90) return 'rgba(255, 71, 87, 0.85)';
        if (value >= 75) return 'rgba(255, 165, 2, 0.75)';
        if (value >= 50) return 'rgba(253, 203, 110, 0.65)';
        if (value >= 25) return 'rgba(0, 206, 201, 0.55)';
        return 'rgba(0, 184, 148, 0.45)';
    }
}

window.ParkingCharts = new ParkingCharts();
