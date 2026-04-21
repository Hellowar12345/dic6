## Why

台灣汽車登記數達 800 萬輛（年增 2.3%），六都市中心駕駛平均花費 8-12 分鐘尋找車位，尋車車流佔市區整體交通量 30%。現行停車 App 僅顯示「當下」剩餘車位，無法預估駕駛人 30-60 分鐘後抵達時的狀況，導致「行車時間差」痛點無法解決。政府雖有歷史開放資料，但缺乏模型系統性學習時間序列規律，天氣、節假日等關鍵影響因子也未被整合。

## What Changes

- **新增 DD-LSTM 預測引擎**：建立 Data-Driven Multi-Feature LSTM 深度學習模型，提供未來 30/60 分鐘車位可用率預測
- **新增多源資料整合管線**：整合 TDX 即時/歷史 API、氣象局 API、節假日日曆等外部特徵
- **新增資料前處理模組**：包含資料清洗、特徵工程（時段/星期/週期特徵萃取）、Min-Max 正規化、滑動視窗序列建構
- **新增即時監控儀表板**：提供視覺化趨勢圖、停車場熱圖、即時車位狀態卡片
- **新增智慧警示系統**：當可用率低於安全閾值時觸發預警通知
- **新增模型評估模組**：支援 MAE、RMSE、Accuracy 指標，並與 ARIMA、Random Forest、單層 LSTM 等 baseline 比較

## Capabilities

### New Capabilities

- `data-ingestion`: TDX 即時/歷史資料擷取，Cron Job 每 5 分鐘同步，氣象與假日資料整合
- `data-preprocessing`: 資料清洗、特徵工程、Min-Max 正規化、Window Size=24 的滑動視窗序列建構
- `dd-lstm-model`: 雙層 LSTM（Dropout 0.2）預測模型，輸出未來 30/60 分鐘可用率
- `prediction-dashboard`: 即時監控儀表板，含趨勢圖、熱圖、車位狀態卡片、天氣面板
- `alert-system`: 滿位預警通知系統，支援嚴重警告/一般警告/預測預警三級機制
- `model-evaluation`: 模型效能評估與 baseline 比較（ARIMA, RF, 單層 LSTM）

### Modified Capabilities

_(無既有的 capabilities 需要修改，這是全新專案)_

## Impact

- **前端**：新增完整的 Web Dashboard（HTML/CSS/JS + Chart.js）
- **後端模型**：需要 PyTorch 或 TensorFlow 框架支援 LSTM 推論
- **資料來源**：依賴 TDX REST API、氣象局 API（需申請 API 金鑰）
- **資料庫**：需部署 InfluxDB 時序資料庫儲存歷史資料
- **部署**：四層端對端預測管線需容器化部署
- **目標場域**：初期以台北市公有路外停車場為主，設計需具備全台擴充性
