// ============================================================
// model.js — DD-LSTM 預測模型模擬 (Layer 3)
// ============================================================

/**
 * DD-LSTM 模型模擬器
 * 架構：Input Layer → LSTM ×2 (Dropout 0.2) → Dense → Output
 * 輸出：未來 30/60 分鐘車位可用率 (%)
 */
class DDLSTMModel {
    constructor() {
        this.windowSize = 24;
        this.lstmLayers = 2;
        this.dropout = 0.2;
        this.trained = true;
        this.modelMetrics = {
            mae: 3.2 + Math.random() * 1.5,
            rmse: 4.8 + Math.random() * 2.0,
            accuracy: 91.5 + Math.random() * 5,
        };
    }

    /**
     * 模擬 LSTM 預測 — 使用加權移動平均 + 時間趨勢 + 噪音
     * @param {Array} historicalData - 過去的佔用率序列
     * @param {Object} features - 外部特徵 (天氣, 假日等)
     * @param {number} horizonMinutes - 預測未來幾分鐘
     * @returns {Object} 預測結果
     */
    predict(historicalData, features, horizonMinutes = 30) {
        if (historicalData.length < this.windowSize) {
            return { predicted: null, confidence: 0 };
        }

        const recentData = historicalData.slice(-this.windowSize);
        const occupancies = recentData.map(d => d.occupancy);

        // 加權移動平均（近期資料權重較高）
        let weightedSum = 0;
        let weightTotal = 0;
        for (let i = 0; i < occupancies.length; i++) {
            const weight = Math.exp(i / occupancies.length * 2);
            weightedSum += occupancies[i] * weight;
            weightTotal += weight;
        }
        const weightedAvg = weightedSum / weightTotal;

        // 計算趨勢斜率
        const trend = this._calculateTrend(occupancies);

        // 時段因子
        const currentHour = new Date().getHours();
        const futureHour = (currentHour + horizonMinutes / 60) % 24;
        const hourFactor = this._getHourFactor(currentHour, futureHour);

        // 天氣影響因子
        const weatherFactor = this._getWeatherFactor(features.weather);

        // 假日影響因子
        const holidayFactor = features.isHoliday ? 1.08 : 1.0;

        // LSTM 模擬輸出
        let prediction = weightedAvg + trend * (horizonMinutes / 5) + hourFactor;
        prediction *= weatherFactor * holidayFactor;

        // 加入模型噪音 (Dropout 效果)
        const noise = (Math.random() - 0.5) * 6 * this.dropout;
        prediction += noise;

        // 信心度計算
        const confidence = Math.max(60, Math.min(98,
            95 - Math.abs(trend) * 3 - (horizonMinutes / 60) * 5 + Math.random() * 5
        ));

        prediction = Math.max(0, Math.min(100, prediction));

        return {
            predicted: Math.round(prediction * 10) / 10,
            confidence: Math.round(confidence * 10) / 10,
            trend: trend > 0.3 ? 'rising' : trend < -0.3 ? 'falling' : 'stable',
            trendValue: Math.round(trend * 100) / 100,
        };
    }

    /**
     * 計算趨勢 (線性回歸斜率)
     */
    _calculateTrend(data) {
        const n = data.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += data[i];
            sumXY += i * data[i];
            sumX2 += i * i;
        }
        return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    }

    /**
     * 時段變化因子
     */
    _getHourFactor(currentHour, futureHour) {
        const peakHours = [8, 9, 10, 12, 13, 17, 18, 19];
        const currentPeak = peakHours.includes(currentHour);
        const futurePeak = peakHours.includes(Math.floor(futureHour));

        if (!currentPeak && futurePeak) return 8;
        if (currentPeak && !futurePeak) return -8;
        return 0;
    }

    /**
     * 天氣影響因子
     */
    _getWeatherFactor(weather) {
        if (!weather) return 1.0;
        const factors = {
            '晴天': 1.0, '多雲': 1.02, '陰天': 1.05,
            '小雨': 1.10, '大雨': 1.18, '雷雨': 1.25
        };
        return factors[weather.condition] || 1.0;
    }

    /**
     * 批次預測所有停車場的 30/60 分鐘預測
     */
    batchPredict(parkingLots, weather) {
        const results = {};
        const isHol = ParkingData.isHoliday(new Date());

        parkingLots.forEach(lot => {
            const history = ParkingData.generateHistoricalData(lot, 3);
            const features = { weather, isHoliday: isHol };

            const pred30 = this.predict(history, features, 30);
            const pred60 = this.predict(history, features, 60);

            const currentOccupancy = history[history.length - 1].occupancy;
            const availableNow = Math.round(lot.totalSpaces * (1 - currentOccupancy / 100));

            results[lot.id] = {
                lot,
                currentOccupancy: Math.round(currentOccupancy * 10) / 10,
                availableNow,
                prediction30: pred30,
                prediction60: pred60,
                history: history.filter((_, i) => i % 3 === 0), // downsample for charts
                status: currentOccupancy > 90 ? 'critical' : currentOccupancy > 75 ? 'warning' : 'normal',
            };
        });

        return results;
    }

    /**
     * 取得模型效能指標
     */
    getMetrics() {
        return {
            mae: Math.round(this.modelMetrics.mae * 100) / 100,
            rmse: Math.round(this.modelMetrics.rmse * 100) / 100,
            accuracy: Math.round(this.modelMetrics.accuracy * 10) / 10,
            // baseline 比較
            baselines: {
                arima: { mae: 6.8, rmse: 8.5, accuracy: 82.1 },
                randomForest: { mae: 5.2, rmse: 7.1, accuracy: 85.3 },
                singleLSTM: { mae: 4.1, rmse: 5.9, accuracy: 88.7 },
            }
        };
    }
}

/**
 * 產生預測趨勢線資料 (用於圖表)
 */
function generatePredictionTimeline(lot, weather, steps = 12) {
    const model = new DDLSTMModel();
    const history = ParkingData.generateHistoricalData(lot, 4);
    const isHol = ParkingData.isHoliday(new Date());
    const features = { weather, isHoliday: isHol };
    const predictions = [];
    const now = new Date();

    for (let i = 1; i <= steps; i++) {
        const minutesAhead = i * 5;
        const pred = model.predict(history, features, minutesAhead);
        predictions.push({
            time: new Date(now.getTime() + minutesAhead * 60000),
            minutesAhead,
            occupancy: pred.predicted,
            confidence: pred.confidence,
        });
    }
    return predictions;
}

window.DDLSTMModel = DDLSTMModel;
window.generatePredictionTimeline = generatePredictionTimeline;
