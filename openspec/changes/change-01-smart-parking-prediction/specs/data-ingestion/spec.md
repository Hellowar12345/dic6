## ADDED Requirements

### Requirement: TDX 即時資料擷取
系統 SHALL 透過排程器（Cron Job）每 5 分鐘呼叫 TDX REST API，擷取目標停車場的即時剩餘車位數量。

#### Scenario: 正常即時資料擷取
- **WHEN** 排程器觸發 TDX API 呼叫
- **THEN** 系統成功取得目標停車場的即時剩餘車位數，並儲存至時序資料庫

#### Scenario: API 連線失敗
- **WHEN** TDX API 回應逾時或回傳錯誤狀態碼
- **THEN** 系統記錄失敗事件，保留最近一次有效資料做為 fallback，並在下次排程時重試

### Requirement: TDX 歷史資料整合
系統 SHALL 支援匯入 TDX 歷史停車佔用率紀錄，用於模型訓練與驗證。

#### Scenario: 歷史資料成功匯入
- **WHEN** 系統啟動歷史資料匯入程序
- **THEN** 系統從 TDX 歷史資料 API 下載指定時間範圍的佔用率紀錄，並以 5 分鐘為單位整理存入資料庫

#### Scenario: 歷史資料缺值
- **WHEN** 歷史資料中存在缺值時段
- **THEN** 系統標記缺值時段，並使用前後插值法（linear interpolation）填補

### Requirement: 氣象資料整合
系統 SHALL 呼叫氣象局 API 取得目標區域的即時天氣資訊，包含溫度、降雨量、UV 指數。

#### Scenario: 氣象資料成功取得
- **WHEN** 系統呼叫氣象局 API
- **THEN** 取得溫度（°C）、降雨量（mm）、UV 指數，並關聯至對應停車場區域

#### Scenario: 氣象 API 不可用
- **WHEN** 氣象局 API 無法連線
- **THEN** 系統使用「晴天」作為預設天氣狀態，並記錄降級事件

### Requirement: 節假日日曆整合
系統 SHALL 整合國定假日與連假日曆，作為模型的時間特徵輸入。

#### Scenario: 判斷當前日期為假日
- **WHEN** 查詢日期為週末或國定假日
- **THEN** 系統將假日標記設為 `true`，供模型使用

#### Scenario: 判斷當前日期為平日
- **WHEN** 查詢日期為週一至週五且非國定假日
- **THEN** 系統將假日標記設為 `false`
