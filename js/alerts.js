// ============================================================
// alerts.js — 警示通知系統 (Layer 4: Alert System)
// ============================================================

class AlertSystem {
    constructor() {
        this.alerts = [];
        this.maxAlerts = 50;
        this.thresholds = {
            critical: 95,   // 佔用率 >= 95% 觸發嚴重警告
            warning: 85,    // 佔用率 >= 85% 觸發一般警告
            predicted: 90,  // 預測未來佔用率 >= 90% 觸發預警
        };
    }

    /**
     * 檢查所有停車場狀態並生成警報
     */
    checkAndGenerate(parkingResults) {
        const newAlerts = [];
        const now = new Date();

        Object.values(parkingResults).forEach(result => {
            const { lot, currentOccupancy, prediction30, prediction60 } = result;

            // 即時滿位嚴重警告
            if (currentOccupancy >= this.thresholds.critical) {
                newAlerts.push(this._createAlert('critical', lot.name,
                    `目前佔用率已達 ${currentOccupancy}%，接近滿位！`, now));
            }
            // 即時高佔用警告
            else if (currentOccupancy >= this.thresholds.warning) {
                newAlerts.push(this._createAlert('warning', lot.name,
                    `目前佔用率 ${currentOccupancy}%，建議盡快前往或改選其他停車場。`, now));
            }

            // 30 分鐘預測警報
            if (prediction30.predicted >= this.thresholds.predicted) {
                newAlerts.push(this._createAlert('prediction', lot.name,
                    `預測 30 分鐘後佔用率將達 ${prediction30.predicted}%，信心度 ${prediction30.confidence}%`, now));
            }

            // 60 分鐘預測警報
            if (prediction60.predicted >= this.thresholds.predicted) {
                newAlerts.push(this._createAlert('prediction', lot.name,
                    `預測 60 分鐘後佔用率將達 ${prediction60.predicted}%，信心度 ${prediction60.confidence}%`, now));
            }
        });

        // 加入新警報
        this.alerts = [...newAlerts, ...this.alerts].slice(0, this.maxAlerts);
        return newAlerts;
    }

    _createAlert(type, lotName, message, timestamp) {
        const icons = { critical: '🚨', warning: '⚠️', prediction: '🔮' };
        const levels = { critical: '嚴重', warning: '警告', prediction: '預警' };
        return {
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            type,
            icon: icons[type],
            level: levels[type],
            lotName,
            message,
            timestamp,
            read: false,
        };
    }

    /**
     * 渲染警報到 DOM
     */
    renderAlerts(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (this.alerts.length === 0) {
            container.innerHTML = `
                <div class="alert-empty">
                    <span class="alert-empty-icon">✅</span>
                    <p>目前無任何警報，所有停車場運作正常</p>
                </div>`;
            return;
        }

        container.innerHTML = this.alerts.slice(0, 8).map(alert => `
            <div class="alert-item alert-${alert.type}" data-id="${alert.id}">
                <div class="alert-icon">${alert.icon}</div>
                <div class="alert-content">
                    <div class="alert-header">
                        <span class="alert-level">${alert.level}</span>
                        <span class="alert-lot">${alert.lotName}</span>
                        <span class="alert-time">${this._formatTime(alert.timestamp)}</span>
                    </div>
                    <p class="alert-message">${alert.message}</p>
                </div>
            </div>
        `).join('');
    }

    _formatTime(date) {
        const d = new Date(date);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }

    getUnreadCount() {
        return this.alerts.filter(a => !a.read).length;
    }
}

window.AlertSystem = new AlertSystem();
