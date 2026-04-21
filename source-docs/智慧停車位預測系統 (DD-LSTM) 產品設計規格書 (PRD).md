智慧停車位預測系統 (DD-LSTM) 產品設計規格書 (PRD)
一、 產品概述
產品名稱：智慧停車位預測系統 (Data-Driven Multi-Feature Prediction System)
。
產品目標：透過深度學習模型 (DD-LSTM) 結合政府開放資料與多項外部特徵，提供具前瞻性的停車位預估，消除現行系統的「行車時間差」痛點
。
目標場域：公有路外停車場（初期以台北市為主要驗證場域，具備全台擴充性）
。
二、 市場背景與痛點分析
市場規模與成本：台灣汽車登記數達 800 萬輛（年增約 2.3%），六都市中心駕駛平均需花費 8-12 分鐘尋找車位，尋車車流佔市區整體交通量 30%
。
現有系統三大缺口
：
無法預測未來：現行 App 僅顯示「當下」的剩餘車位，無法預估駕駛人 30 至 60 分鐘後抵達時的狀況。
歷史規律未被挖掘：政府雖有開放歷史資料，卻缺乏模型系統性地學習其時間序列規律。
外部特徵未被整合：現有系統忽略天氣（如雨天醫院停車場滿載）、節假日（連假商圈提早客滿）等關鍵影響因子。
三、 系統架構規格 (System Architecture)
本系統採用輕量化、可即時部署的四層式端對端預測管線
：
Layer 1：資料來源 (Data Sources)
TDX 即時 API：提供即時停車剩餘數量。
TDX 歷史資料：提供停車場的歷史佔用紀錄。
氣象局 API：提供溫度、降雨、UV 等天氣資訊。
節假日日曆：提供國定假日、連假等時間特徵。
Layer 2：資料前處理 (Preprocessing)
資料清洗：進行缺值處理與去雜訊。
特徵工程：萃取時段、星期、週期等特徵。
正規化：採用 Min-Max Scaling。
滑動視窗 (Sliding Window)：建構 Sequence 輸入結構。
Layer 3：預測模型 (DD-LSTM Model)
包含：Input Layer、LSTM Layer ×2、Dense Layer、Output Layer。
Layer 4：輸出呈現 (Output)
輸出未來 30 分鐘與 60 分鐘的車位可用率 (%)。
提供視覺化報表（趨勢圖、熱圖）。
提供警示通知（滿位預警）。
四、 資料流與實作設計 (Data Flow)
資料擷取 (Data Ingestion)：透過排程器 (Cron Job) 每 5 分鐘呼叫一次 TDX REST API，同步拉取資料並儲存至 InfluxDB 時序資料庫
。
特徵融合 (Feature Fusion)：使用 Pandas 進行資料處理，結合天氣與假日特徵，設定 Window Size 為 24 的滑動視窗來建構 LSTM 輸入序列，並完成 Min-Max 正規化
。
模型推論 (Model Inference)：以 PyTorch 或 TensorFlow 框架運行，通過兩層 LSTM（搭配 Dropout 0.2）輸出未來 30/60 分鐘的可用率預測
。
輸出呈現 (Result Output)：預測結果寫入資料庫後，由前端 Dashboard 即時顯示，當可用率低於安全閾值時，透過 Alert System 觸發預警，並藉由 REST API 提供對外服務
。
五、 系統驗證與評估指標
對比基準 (Baseline)：ARIMA、Random Forest、單層 LSTM
。
評估指標：MAE (平均絕對誤差)、RMSE (均方根誤差)、Accuracy (預測準確率)
。
交叉驗證場景：涵蓋平日 vs. 假日、晴天 vs. 雨天、高峰 vs. 離峰時段，確保系統在複雜場景下的精準度
。