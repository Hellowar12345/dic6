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

## 模型效能預估

| 模型 | MAE | RMSE | Accuracy |
|------|-----|------|----------|
| ARIMA | 6.8 | 8.5 | 82.1% |
| Random Forest | 5.2 | 7.1 | 85.3% |
| 單層 LSTM | 4.1 | 5.9 | 88.7% |
| **DD-LSTM (Ours)** | **~3.2** | **~4.8** | **~93%** |

---

## 📅 今日實作總結 (2026/04/21)

今天我們主要完成了 **DD-LSTM 智慧停車位預測系統** 的 0 到 1 建置，涵蓋了程式碼實作、規格書撰寫以及自動化協作流程的建立。以下是重點摘要：

### 1. 核心前端系統建置
- 根據產品設計規格書 (PRD) ，實作了四層架構的前端邏輯 (`data.js`, `model.js`, `charts.js`, `alerts.js`)。
- 開發了玻璃擬物化 (Glassmorphism) 風格的深色主題 Dashboard 介面 (`index.html`, `style.css`)，支援 60 秒動態載入與 Chart.js 動態更新。
- 整合並排除了 `Chart.js` 初始化的載入時序問題。

### 2. OpenSpec 規格書系統導入
- 在專案中初始化 **OpenSpec v1.2.0**，載入 `spec-driven` schema。
- 設定 `config.yaml` 限制所有新的變更 (Change) 都必須是以 `cNN-` 為前綴的命名。
- 提出了第一個專案變更 `c01-smart-parking-prediction`，並依序藉由指令自動生成了：
  - `proposal.md` (技術提案)
  - `design.md` (架構決策)
  - 6 份業務範圍 `specs/` (涵蓋資料、模型、前端與驗證)
  - `tasks.md` (實作拆解：包含 46 項明確 Checklists)
- 透過 `bash ending.sh` 自動化將所有 Spec 文件**歸檔並入主目錄**中。

### 3. 營運與開發自動化 (DevOps Scripts)
根據整合專案核心執行綱要建立了兩個自動化 Bash 腳本，用以規範協作：
- `startup.sh`: 執行時自動拉取 Github 程式碼、閱讀交接紀錄 (`HANDOVER.md`) 並列舉出 OpenSpec 後續開發步驟建議。
- `ending.sh`: 將實作的 `tasks.md` 狀態更新，並檢查只要任務 100% 完工就自動把變更 (Change) Archive 歸檔，生成新的交接記錄、發布 commit 以及自動 Push 至 Github。

### 4. 版本控制與備存
- 專案程式碼、自動化腳本、與 PRD 的靜態原始參照檔案 (PDF / Markdown)，已全數整合推上 Github： [Hellowar12345/dic6](https://github.com/Hellowar12345/dic6)。

> **下一階段** 👉 啟動新的需求時，開發者只需開發環境執行 `./startup.sh` 並鍵入 `openspec new change c02-xxx` 即可進入下一輪的迭代。

## License

MIT
