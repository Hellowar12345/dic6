## ADDED Requirements

### Requirement: MAE 評估指標
系統 SHALL 計算模型的 MAE（平均絕對誤差）指標，單位為百分比。

#### Scenario: MAE 計算
- **WHEN** 系統以測試集進行模型評估
- **THEN** 計算預測值與實際值的平均絕對差異，並顯示於 Dashboard 的模型效能區域

### Requirement: RMSE 評估指標
系統 SHALL 計算模型的 RMSE（均方根誤差）指標。

#### Scenario: RMSE 計算
- **WHEN** 系統以測試集進行模型評估
- **THEN** 計算預測值與實際值的均方根誤差，並顯示於 Dashboard

### Requirement: 預測準確率指標
系統 SHALL 計算模型的 Accuracy（預測準確率）指標，以百分比呈現。

#### Scenario: 準確率計算
- **WHEN** 系統以測試集進行模型評估
- **THEN** 顯示模型預測的整體準確率百分比

### Requirement: Baseline 模型比較
系統 SHALL 提供 DD-LSTM 與 ARIMA、Random Forest、單層 LSTM 三個 baseline 模型的效能比較。

#### Scenario: 比較圖表呈現
- **WHEN** 使用者查看模型效能區域
- **THEN** 顯示包含 4 個模型 MAE/RMSE 對比的分組長條圖

#### Scenario: 準確率比較
- **WHEN** 使用者查看模型效能區域
- **THEN** 顯示各模型準確率的圓環圖，DD-LSTM 以高亮色調強調

### Requirement: 交叉驗證場景
系統 SHALL 涵蓋平日 vs. 假日、晴天 vs. 雨天、高峰 vs. 離峰等不同場景的驗證結果。

#### Scenario: 場景分類驗證
- **WHEN** 系統完成交叉驗證
- **THEN** 各場景（平日/假日、晴天/雨天、高峰/離峰）的 MAE 與 RMSE 指標均可供查閱
