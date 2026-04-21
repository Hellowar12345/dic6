## ADDED Requirements

### Requirement: 停車場即時狀態卡片
Dashboard SHALL 顯示每個停車場的即時狀態卡片，包含名稱、區域、總車位數、目前剩餘車位數、佔用率百分比、狀態指示（正常/警告/嚴重）。

#### Scenario: 正常狀態顯示
- **WHEN** 停車場佔用率 < 75%
- **THEN** 卡片以綠色指示「正常」狀態，顯示即時剩餘車位數

#### Scenario: 警告狀態顯示
- **WHEN** 停車場佔用率 ≥ 75% 且 < 90%
- **THEN** 卡片以橘色指示「警告」狀態

#### Scenario: 嚴重狀態顯示
- **WHEN** 停車場佔用率 ≥ 90%
- **THEN** 卡片以紅色指示「嚴重」狀態，並顯示閃爍效果

### Requirement: 30/60 分鐘預測顯示
Dashboard SHALL 在每個停車場卡片中顯示 DD-LSTM 模型的 30 分鐘和 60 分鐘預測結果。

#### Scenario: 預測結果呈現
- **WHEN** 使用者查看停車場卡片
- **THEN** 顯示 30 分鐘後預測佔用率、60 分鐘後預測佔用率、信心度百分比、趨勢方向箭頭

### Requirement: 佔用率趨勢圖
Dashboard SHALL 提供互動式時間序列折線圖，同時呈現歷史佔用率與預測佔用率曲線。

#### Scenario: 趨勢圖完整呈現
- **WHEN** 使用者選擇一個停車場
- **THEN** 圖表顯示過去 24 小時的歷史佔用率（實線）與未來 60 分鐘的預測值（虛線），包含信心區間帶

#### Scenario: 滿位警戒線
- **WHEN** 趨勢圖渲染
- **THEN** 在 90% 佔用率位置繪製紅色虛線警戒線

### Requirement: 停車場佔用率熱圖
Dashboard SHALL 提供矩陣式熱圖，以顏色深淺呈現各停車場在不同時段的佔用率分布。

#### Scenario: 熱圖顏色對應
- **WHEN** 佔用率 ≥ 90%
- **THEN** 顯示深紅色
- **WHEN** 佔用率 ≥ 75%
- **THEN** 顯示橘色
- **WHEN** 佔用率 ≥ 50%
- **THEN** 顯示黃色
- **WHEN** 佔用率 < 50%
- **THEN** 顯示藍綠色

### Requirement: 天氣資訊面板
Dashboard SHALL 顯示當前天氣狀態面板，包含天氣圖示、溫度、濕度、降雨量、UV 指數。

#### Scenario: 天氣面板渲染
- **WHEN** Dashboard 載入
- **THEN** 顯示目前天氣狀態（含 emoji 圖示）、溫度（°C）、濕度（%）、降雨量（mm）、UV 指數

### Requirement: 自動定時更新
Dashboard SHALL 每 60 秒自動更新所有停車場資料與預測結果。

#### Scenario: 自動重新載入
- **WHEN** 距上次更新超過 60 秒
- **THEN** 系統重新擷取資料、執行預測、更新所有視覺化元件，並顯示最後更新時間

### Requirement: 響應式設計
Dashboard SHALL 支援桌面與平板裝置的瀏覽器瀏覽。

#### Scenario: 桌面裝置
- **WHEN** 視窗寬度 ≥ 1024px
- **THEN** 採用多欄配置，停車場卡片以 4 欄 grid 排列

#### Scenario: 平板裝置
- **WHEN** 視窗寬度在 768px ~ 1023px 之間
- **THEN** 採用 2 欄配置
