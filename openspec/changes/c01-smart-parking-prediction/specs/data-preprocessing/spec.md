## ADDED Requirements

### Requirement: 資料清洗與去雜訊
系統 SHALL 對原始擷取資料執行清洗程序，包含缺值處理與異常值過濾。

#### Scenario: 缺值偵測與填補
- **WHEN** 輸入資料序列中存在缺值（null 或 NaN）
- **THEN** 系統使用線性插值法填補缺值，並記錄填補筆數

#### Scenario: 異常值過濾
- **WHEN** 佔用率數值超出合理範圍（< 0% 或 > 100%）
- **THEN** 系統將異常值裁切至 [0, 100] 範圍

### Requirement: 時間特徵工程
系統 SHALL 從時間戳中萃取週期性特徵，包含小時正弦/餘弦編碼、星期幾、是否尖峰時段。

#### Scenario: 小時週期編碼
- **WHEN** 處理帶有時間戳的資料點
- **THEN** 系統產生 `hourSin = sin(2π × hour / 24)` 和 `hourCos = cos(2π × hour / 24)` 兩個特徵

#### Scenario: 尖峰時段識別
- **WHEN** 時間戳的小時值介於 8-10 或 17-19
- **THEN** 系統將 `isPeakHour` 標記為 1，否則為 0

### Requirement: Min-Max 正規化
系統 SHALL 使用 Min-Max Scaling 將所有數值特徵正規化至 [0, 1] 範圍。

#### Scenario: 佔用率正規化
- **WHEN** 輸入原始佔用率值（例如 75%）
- **THEN** 系統輸出 `(75 - min) / (max - min)` 的正規化值

#### Scenario: 反正規化還原
- **WHEN** 模型輸出正規化後的預測值
- **THEN** 系統能將其反轉換為原始 [0, 100] 百分比範圍

### Requirement: 滑動視窗序列建構
系統 SHALL 使用 Window Size = 24 的滑動視窗將時序資料轉換為 LSTM 可接受的輸入序列。

#### Scenario: 滑動視窗建構
- **WHEN** 輸入包含 N 個時間步的資料序列（N ≥ 24）
- **THEN** 系統產生 (N - 24 + 1) 個長度為 24 的序列視窗

#### Scenario: 資料不足以建構視窗
- **WHEN** 輸入資料長度 < 24
- **THEN** 系統回傳空序列集合，並記錄警告
