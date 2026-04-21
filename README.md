# 智慧停車位預測系統 (DD-LSTM)

> Data-Driven Multi-Feature LSTM 停車位可用率預測系統

## 產品目標

透過深度學習模型 (DD-LSTM) 結合政府開放資料與多項外部特徵，提供具前瞻性的停車位預估，消除現行系統的「行車時間差」痛點。

## 系統架構

```
Layer 1: 資料來源        → TDX API、氣象局 API、節假日日曆
Layer 2: 資料前處理      → 清洗、特徵工程、Min-Max 正規化、滑動視窗
Layer 3: DD-LSTM 模型    → 雙層 LSTM (Dropout 0.2) → 30/60 分鐘預測
Layer 4: 輸出呈現        → Dashboard、趨勢圖、熱圖、警報系統
```

## 專案結構

```
smart-parking-prediction/
├── index.html              # Dashboard 主頁面
├── css/style.css           # 深色主題設計系統
├── js/
│   ├── data.js             # Layer 1+2: 資料來源 + 前處理
│   ├── model.js            # Layer 3: DD-LSTM 模型模擬
│   ├── charts.js           # Layer 4: Chart.js 視覺化
│   ├── alerts.js           # Layer 4: 警報系統
│   └── app.js              # 主應用程式邏輯
├── openspec/               # OpenSpec 規格書
│   ├── changes/            # 變更管理
│   └── specs/              # 正式規格
├── source-docs/            # 原始來源文件
├── startup.sh              # 營運自動化啟動腳本
├── ending.sh               # 營運自動化結束腳本
└── README.md               # 本文件
```

## 功能特色

- **8 座台北市公有路外停車場**即時監控
- **DD-LSTM 預測模型**：輸出未來 30/60 分鐘車位可用率
- **多特徵融合**：整合天氣、假日、時段週期因子
- **視覺化報表**：趨勢圖、熱圖、模型效能比較
- **三級警報系統**：嚴重 (95%)、警告 (85%)、預測預警 (90%)
- **60 秒自動更新**
- **模型效能指標**：MAE、RMSE、Accuracy + Baseline 對比

## 啟動方式

```bash
# 方式 1: 直接開啟
open index.html

# 方式 2: 本機 HTTP 伺服器
npx serve -p 3000

# 方式 3: Python 伺服器
python -m http.server 3000
```

## 技術棧

| 層級 | 技術 |
|------|------|
| 前端 | HTML5 + CSS3 + Vanilla JS |
| 圖表 | Chart.js 4.x |
| 字型 | Google Fonts (Inter) |
| 規格管理 | OpenSpec (spec-driven schema) |
| 版本控制 | Git + GitHub |

## 模型效能

| 模型 | MAE | RMSE | Accuracy |
|------|-----|------|----------|
| ARIMA | 6.8 | 8.5 | 82.1% |
| Random Forest | 5.2 | 7.1 | 85.3% |
| 單層 LSTM | 4.1 | 5.9 | 88.7% |
| **DD-LSTM (Ours)** | **~3.2** | **~4.8** | **~93%** |

## OpenSpec 工作流程

```
propose → specs → design → tasks → apply → verify → archive
```

## License

MIT
