# dd-lstm-model Specification

## Purpose
TBD - created by archiving change c01-smart-parking-prediction. Update Purpose after archive.
## Requirements
### Requirement: DD-LSTM 模型架構
系統 SHALL 實作雙層 LSTM 模型，架構為：Input Layer → LSTM Layer ×2（各搭配 Dropout 0.2）→ Dense Layer → Output Layer。

#### Scenario: 模型接收序列輸入
- **WHEN** 輸入一個長度為 24、包含多特徵的時序序列
- **THEN** 模型依序通過兩層 LSTM 處理後，經 Dense 層輸出預測值

#### Scenario: Dropout 正規化
- **WHEN** 模型在訓練階段運行
- **THEN** 每層 LSTM 後以 20% 的機率隨機丟棄神經元，防止過擬合

### Requirement: 30 分鐘可用率預測
系統 SHALL 能輸出目標停車場未來 30 分鐘的車位可用率（%）預測。

#### Scenario: 成功預測 30 分鐘
- **WHEN** 模型接收包含歷史佔用率、天氣、假日等特徵的輸入序列
- **THEN** 輸出未來 30 分鐘的佔用率預測值（0-100%），附帶信心度百分比

#### Scenario: 預測結果包含趨勢資訊
- **WHEN** 模型完成 30 分鐘預測
- **THEN** 同時回傳趨勢方向（rising / stable / falling）

### Requirement: 60 分鐘可用率預測
系統 SHALL 能輸出目標停車場未來 60 分鐘的車位可用率（%）預測。

#### Scenario: 成功預測 60 分鐘
- **WHEN** 模型接收包含歷史佔用率、天氣、假日等特徵的輸入序列
- **THEN** 輸出未來 60 分鐘的佔用率預測值（0-100%），附帶信心度百分比

#### Scenario: 60 分鐘預測信心度低於 30 分鐘
- **WHEN** 比較同一停車場的 30 分鐘與 60 分鐘預測
- **THEN** 60 分鐘預測的信心度 SHALL 不高於 30 分鐘預測的信心度

### Requirement: 多特徵融合推論
模型 SHALL 整合時序佔用率、天氣狀態、假日標記、時段週期等多維特徵進行推論。

#### Scenario: 雨天影響
- **WHEN** 天氣特徵為「大雨」
- **THEN** 模型預測的佔用率 SHALL 高於同時段晴天的預測值（反映雨天開車需求增加）

#### Scenario: 假日影響
- **WHEN** 假日特徵為 true 且停車場位於商圈
- **THEN** 模型預測的佔用率 SHALL 反映假日商圈停車需求增加的趨勢

### Requirement: 批次預測
系統 SHALL 支援一次對多個停車場執行批次預測。

#### Scenario: 同時預測多個停車場
- **WHEN** 系統接收 8 個停車場的預測請求
- **THEN** 系統回傳每個停車場的即時佔用率、30 分鐘預測、60 分鐘預測結果集合

