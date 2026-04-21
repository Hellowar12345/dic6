# 智慧停車位預測系統 (DD-LSTM) — 開發對話紀錄

> **日期**: 2026-04-21  
> **工具**: Antigravity + OpenSpec  
> **GitHub Repo**: https://github.com/Hellowar12345/dic6

---

## 對話 1：根據 PRD 產生程式碼

### 👤 使用者
> 幫我根據 PDR 和資訊圖表產生 code

### 🤖 Antigravity

讀取桌面上的 PRD 文件：`智慧停車位預測系統 (DD-LSTM) 產品設計規格書 (PRD).md`。

根據 PRD 的四層架構，開始產生前端模組程式碼：

#### 產出的 JS 模組

| 檔案 | 對應 PRD 層級 | 說明 |
|------|--------------|------|
| `js/data.js` | Layer 1 + Layer 2 | 資料來源模擬（TDX API、氣象局、假日日曆）+ 前處理（清洗、特徵工程、Min-Max 正規化、滑動視窗） |
| `js/model.js` | Layer 3 | DD-LSTM 模型模擬器（雙層 LSTM + Dropout 0.2），輸出 30/60 分鐘預測 |
| `js/charts.js` | Layer 4 | Chart.js 視覺化（趨勢圖、熱圖、模型比較圖、準確率圓環圖） |
| `js/alerts.js` | Layer 4 | 三級警報系統（嚴重 95%、警告 85%、預測預警 90%） |

#### `data.js` 重點
- 模擬 8 座台北市停車場（台北車站、信義威秀、西門町、大安森林公園等）
- 各區域有不同的 24 小時佔用率曲線模型
- 支援假日調整（商圈假日佔用率 ×1.15，科技園區 ×0.6）
- 完整的 Min-Max 正規化/反正規化、Window Size=24 滑動視窗

#### `model.js` 重點
- `DDLSTMModel` 類別模擬 LSTM 預測邏輯
- 使用加權移動平均 + 線性趨勢 + 時段因子 + 天氣因子 + 假日因子
- 信心度計算與趨勢方向判斷（rising / stable / falling）
- Baseline 比較指標：ARIMA (MAE 6.8), RF (MAE 5.2), 單層 LSTM (MAE 4.1), DD-LSTM (MAE ~3.2)

---

## 對話 2：使用 OpenSpec 產出規格書

### 👤 使用者
> 用 antigravity + openspec 產出規格書 = PDR

### 🤖 Antigravity

偵測到系統已安裝 OpenSpec CLI，開始按照 spec-driven 工作流程（proposal → specs → design → tasks）產出規格書。

#### Step 1: 初始化 OpenSpec
```bash
openspec init --tools antigravity
```
建立 `.agent/` 目錄（含 4 個 skills 和 4 個 workflows）。

#### Step 2: 建立 Change
```bash
openspec new change "smart-parking-prediction-system"
```
在 `openspec/changes/smart-parking-prediction-system/` 建立變更目錄。

#### Step 3: 查詢 Artifact 依賴順序
```bash
openspec status --change "smart-parking-prediction-system" --json
```
確認建構順序：`proposal` → `design` + `specs` → `tasks`

#### Step 4: 依序建立 Artifacts

##### 4a. Proposal（為什麼需要此系統）

使用 `openspec instructions proposal` 取得模板與指引後，建立 `proposal.md`：

- **Why**: 800 萬輛汽車、8-12 分鐘尋車、30% 無效車流、「行車時間差」痛點
- **What Changes**: 6 大功能新增（DD-LSTM 引擎、多源資料管線、前處理模組、Dashboard、警示、評估）
- **Capabilities**: 定義 6 個新能力
  - `data-ingestion`
  - `data-preprocessing`
  - `dd-lstm-model`
  - `prediction-dashboard`
  - `alert-system`
  - `model-evaluation`

##### 4b. Design（如何實作）

建立 `design.md`，包含 6 個關鍵技術決策：

| # | 決策 | 選擇 | 理由 |
|---|------|------|------|
| 1 | 模型架構 | 雙層 LSTM + Dropout 0.2 | 在推論速度與擬合能力間取得平衡 |
| 2 | 滑動視窗 | Window Size = 24 | 2 小時涵蓋完整通勤尖峰週期 |
| 3 | 正規化 | Min-Max Scaling | 佔用率為 [0,100] 有界值，最自然 |
| 4 | 擷取頻率 | 每 5 分鐘 | 與 TDX API 更新頻率一致 |
| 5 | 前端技術 | Vanilla HTML/CSS/JS + Chart.js | 輕量化部署原則 |
| 6 | 時序 DB | InfluxDB | 時序資料優化的寫入/查詢效能 |

風險分析涵蓋：API 不穩定、天氣預報錯誤、突發事件、模型冷啟動、季節性模式飄移等。

##### 4c. Specs（做什麼 — 6 個規格檔案）

每個 Capability 各建立一個 `spec.md`，使用 WHEN/THEN 格式定義可測試場景：

| Capability | 需求數 | 場景數 | 重點規格 |
|------------|--------|--------|----------|
| `data-ingestion` | 4 | 8 | TDX 即時/歷史資料、氣象 API、假日日曆、API 失敗 fallback |
| `data-preprocessing` | 4 | 6 | 缺值處理、hourSin/hourCos 編碼、Min-Max 正規化、滑動視窗 |
| `dd-lstm-model` | 5 | 8 | 雙層 LSTM 架構、30/60 分鐘預測、多特徵融合、批次推論 |
| `prediction-dashboard` | 7 | 11 | 狀態卡片、趨勢圖、熱圖、天氣面板、60 秒自動更新、響應式 |
| `alert-system` | 5 | 7 | 三級警報（95%/85%/90%）、列表渲染、未讀計數 |
| `model-evaluation` | 5 | 5 | MAE/RMSE/Accuracy、Baseline 比較、交叉驗證場景 |

**總計: 30 個需求、45 個可測試場景**

##### 4d. Tasks（實作步驟）

建立 `tasks.md`，拆解為 9 大群組、40+ 個 checkbox 任務：

1. **專案初始化** (3 tasks) — 目錄結構、CDN、CSS 設計系統
2. **資料來源模組** (5 tasks) — 停車場資料、TDX 模擬、歷史資料、氣象、假日
3. **資料前處理模組** (5 tasks) — 清洗、特徵工程、正規化、滑動視窗、區域曲線
4. **DD-LSTM 模型模組** (6 tasks) — 類別設計、30/60 分鐘預測、多特徵融合、批次預測
5. **趨勢圖與熱圖** (5 tasks) — Chart.js 圖表實例管理、趨勢圖、熱圖、模型比較
6. **警示系統** (7 tasks) — 三級閾值、警報生成、DOM 渲染、未讀計數
7. **Dashboard 主頁面** (6 tasks) — HTML 結構、深色主題 CSS、狀態卡片、響應式
8. **主應用程式邏輯** (5 tasks) — 初始化流程、60 秒更新、停車場切換、模組整合
9. **驗證與文件** (4 tasks) — 場景驗證、警報驗證、響應式驗證、README

#### Step 5: 最終狀態確認
```bash
openspec status --change smart-parking-prediction-system
```
```
Progress: 4/4 artifacts complete
[x] proposal
[x] design
[x] specs
[x] tasks
All artifacts complete!
```

---

## 對話 3：推送至 GitHub

### 👤 使用者
> 幫我推上 github https://github.com/Hellowar12345/dic6

### 🤖 Antigravity

執行 Git 操作：

```bash
git init
git add -A
git config user.email "Hellowar12345@users.noreply.github.com"
git config user.name "Hellowar12345"
git commit -m "feat: DD-LSTM smart parking prediction system - OpenSpec specs and frontend modules"
git remote add origin https://github.com/Hellowar12345/dic6.git
git branch -M main
git push -u origin main
```

**結果**: ✅ 成功推送 22 個檔案、2660 行至 `main` 分支。

---

## 對話 4：整理對話紀錄

### 👤 使用者
> 把對話整理成 md 也推上去

### 🤖 Antigravity
建立本檔案 `conversation-log.md` 並推送至 GitHub。

---

## 專案檔案結構

```
smart-parking-prediction/
├── .agent/
│   ├── skills/
│   │   ├── openspec-apply-change/SKILL.md
│   │   ├── openspec-archive-change/SKILL.md
│   │   ├── openspec-explore/SKILL.md
│   │   └── openspec-propose/SKILL.md
│   └── workflows/
│       ├── opsx-apply.md
│       ├── opsx-archive.md
│       ├── opsx-explore.md
│       └── opsx-propose.md
├── css/                          (待實作)
├── js/
│   ├── alerts.js                 — 警示通知系統
│   ├── charts.js                 — Chart.js 視覺化圖表
│   ├── data.js                   — 資料來源模擬 + 前處理
│   └── model.js                  — DD-LSTM 模型模擬器
├── openspec/
│   ├── changes/
│   │   └── smart-parking-prediction-system/
│   │       ├── .openspec.yaml
│   │       ├── proposal.md       — 提案：為什麼
│   │       ├── design.md         — 設計：如何做
│   │       ├── tasks.md          — 任務：做什麼
│   │       └── specs/
│   │           ├── data-ingestion/spec.md
│   │           ├── data-preprocessing/spec.md
│   │           ├── dd-lstm-model/spec.md
│   │           ├── prediction-dashboard/spec.md
│   │           ├── alert-system/spec.md
│   │           └── model-evaluation/spec.md
│   └── specs/                    (尚未歸檔)
├── conversation-log.md           — 本檔案
└── index.html                    (待實作)
```

---

## 下一步

執行 `/opsx:apply` 即可依照 `tasks.md` 逐步完成所有實作任務，包含：
- `index.html` 主頁面
- `css/style.css` 深色主題設計
- `js/app.js` 主應用程式邏輯
- 完整的 Dashboard UI
