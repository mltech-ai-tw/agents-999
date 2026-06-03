<div align="center">

# agents-999

**999 個免費 AI 顧問代理人。用你自己的 API 金鑰。**

[![線上展示](https://img.shields.io/badge/線上展示-agents--999-7c5cff?style=flat-square)](https://agents-999.vercel.app)
[![授權: MIT](https://img.shields.io/badge/授權-MIT-green?style=flat-square)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![一鍵部署 Vercel](https://img.shields.io/badge/部署-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/new/clone?repository-url=https://github.com/mltech-ai-tw/agents-999)

[English](./README.md) · **繁體中文**

</div>

一個獨立、可自架的 Next.js 網頁應用，讓任何人都能用自己的 LLM API 金鑰執行 999 個
AI 顧問代理人。免帳號、免註冊，除了你選擇的 LLM 供應商外，資料不會傳到任何地方。
**API 金鑰只儲存在你瀏覽器的 `localStorage`** — 僅在代理單次請求時送到伺服器使用，
絕不留存。

支援：**OpenAI · Anthropic · Gemini · Ollama · Mistral · Groq · Azure OpenAI**

---

## 快速開始

```bash
git clone https://github.com/mltech-ai-tw/agents-999
cd agents-999
npm install
npm run dev
# 開啟 http://localhost:3000 → 設定 → 加入你的 API 金鑰 → 執行任一代理人
```

## 部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mltech-ai-tw/agents-999)

可跑在任何 Node.js 主機 — Vercel、Railway、Render、Fly.io 或自架。
**沒有任何伺服器端密鑰** 需要設定：金鑰在請求當下由每位使用者的瀏覽器提供。

```bash
npm run build
npm start
```

---

## 運作原理

```
使用者輸入 → /api/run → lib/llm/router → 供應商 → SSE 串流 → UI（打字機效果）
```

你的 API 金鑰流向：`localStorage → 請求標頭 → /api/run（使用後即丟，不儲存）→ 供應商 API`

- **首頁 (`/`)** — 可搜尋、可依分類篩選的 999 個代理人卡片網格。
- **執行頁 (`/tools/[id]`)** — 每個代理人的動態表單、模型選擇器（只顯示你已設定金鑰的供應商）、
  即時串流輸出，附複製／重設。
- **設定頁 (`/settings`)** — 每個供應商一個區塊、金鑰顯示／隱藏、各供應商「測試連線」、
  預設供應商／模型、清除全部。

整個介面皆為雙語（繁體中文 / English），可由頁首切換。

---

## 代理人分類

全部 999 個代理人分為 12 大類。在首頁用搜尋 ＋ 分類篩選即可快速找到。

| 分類 | 數量 | 涵蓋內容 |
|------|-----:|----------|
| 🧭 **策略 Strategy** | 137 | 市場進入、成長、轉型、併購、競爭情報、情境規劃 |
| 📣 **行銷 Marketing** | 102 | 行銷活動、SEO、內容、社群、付費廣告、上市、留存 |
| 👥 **人才 People** | 100 | 招募、績效、文化、領導、組織設計、薪酬 |
| 🤝 **銷售 Sales** | 98 | 管道、提案、談判、客戶成功、Playbook、賦能 |
| 💰 **財務 Finance** | 93 | 募資、估值、ROI、預測、投資人關係、定價 |
| ✨ **品牌 Brand** | 88 | 品牌識別、命名、定位、故事、公關、危機溝通 |
| 📦 **產品 Product** | 87 | 路線圖、規格、探索、指標、用戶研究、優先排序 |
| ⚖️ **法務 Legal** | 76 | 合約、合規、資料隱私、ESG、補助、盡職調查 |
| 💻 **開發 Dev** | 72 | 架構、技術選型、API 文件、技術債、自動化 |
| ⚙️ **營運 Ops** | 65 | 流程優化、會議、廠商、利害關係人、供應鏈 |
| 📝 **內容 Content** | 44 | 文案、編輯、腳本、文件撰寫 |
| 🔧 **作業 Operations** | 37 | 日常執行、工作流程、協調 |

---

## 精選代理人

每個代理人都跑在智慧雙語 prompt 產生器上。以下 **200 個旗艦代理人** 另外附有
**手工調校的輸入表單與結構化 prompt** — 會在適合時輸出 Markdown 表格、資料圖表
(` ```chart `) 與 Mermaid 流程圖 (` ```mermaid `)。展開分類即可瀏覽。

<details>
<summary><b>🧭 策略 Strategy</b> — 53 個精選</summary>

- **轉型路線圖** · Transformation Roadmap — 成熟度評估 → 三階段計畫 → 風險審查
- **商業計畫審查** · Business Plan Review — 正反雙方審查，資深顧問評分
- **市場進入分析師** · Market Entry Analyst — 競爭／法規／在地化 → GTM 路線圖
- **商業模式壓力測試** · Business Model Stress Test — 熊／牛／情境 → 投資等級與驗證實驗
- **合作備忘錄產生器** · Partnership MOU Generator — 條款架構／法律風險 → 可直接使用的 MOU
- **數位轉型成熟度評估** · DT Maturity Assessor — 診斷 → CDO 三年路線圖
- **AI 應用場景規劃師** · AI Use Case Planner — 機會掃描 → 流程／客戶／數據 AI → 優先路線圖
- **訂閱制商業模式設計師** · Subscription Model Designer — 架構 → 成長／流失／財務 → MRR 路線圖
- **外包策略顧問** · Outsourcing Strategy Advisor — 需求 → 成本效益／風險 → 外包決策
- **董事會模擬器** · Board Meeting Simulator — CEO 提案 → CFO/CMO/CTO/獨董審議 → 主席決議
- **企業危機戰情室** · Corporate Crisis War Room — 指揮官 → PR/法務/營運/社群 → 黃金 60 分鐘計畫
- **AI 紅隊分析師** · AI Red Team Analyst — 市場／執行／財務／外部四路攻擊 → 防禦策略
- **競爭對手回應模擬器** · Competitor Response Simulator — 領導者／挑戰者／利基沙盤 → 情報戰情室
- **工作流程自動化規劃師** · Workflow Automation Planner — 流程審計 → AI Agent／無代碼／ROI
- **策略轉型顧問** · Strategic Pivot Advisor — 診斷 → 三方向 → 資本與溝通策略
- **數據故事生成器** · Data Story Generator — 數據洞察 → 敘事 + 視覺化 + 行動方案
- **產業生態系地圖** · Industry Ecosystem Map — 定位 → 玩家地圖 + 合作機會 + 依賴風險
- **供應鏈韌性規劃師** · Supply Chain Resilience Planner — 風險 → 多元化 + 應急 + 可視性
- **M&A 目標分析師** · M&A Target Analyst — 目標標準 + 綜效 + 整合計畫 + 風險
- **PLG 策略設計師** · PLG Strategy Designer — PLG 評估 + 免費方案 + 啟動 + 擴張
- **加盟可行性分析師** · Franchise Feasibility Analyst — 市場 + 財務模型 + 法律 + 擴張路線圖
- **技術債務分析器** · Technical Debt Analyzer — 診斷 + 架構 + 代碼品質 + 清償路線圖
- **國際擴張規劃師** · International Expansion Planner — 準備度 + 在地化 + 合規 + GTM
- **API 文件生成器** · API Documentation Generator — 端點規格 + 數據模型 + SDK 範例 + 錯誤表
- **競品功能對比矩陣** · Competitive Feature Matrix — 功能矩陣 + 差距分析 + 藍海 + 路線圖
- **AI 會議記錄助理** · AI Meeting Minutes Assistant — 結構化記錄 + 行動 + 跟進信 + Slack
- **用戶訪談分析師** · User Interview Analyzer — 洞察 + 主題編碼 + 產品機會
- **商業模式畫布** · Business Model Canvas Generator — 完整 BMC + 假設驗證 + PMF + 單位經濟
- **A/B 測試設計師** · A/B Test Designer — 假設 + 樣本數 + 分組 + 統計指引
- **競爭者 SWOT 分析師** · Competitor SWOT Analyst — SWOT + TOWS + 差異化地圖 + 90 天計畫
- **用戶回饋分類器** · User Feedback Classifier — 情感 + 主題分類 + 痛點 + 行動
- **用戶留存策略設計師** · User Retention Strategy Designer — 診斷 + 留存計畫 + 經濟效益
- **創業點子工廠** · Startup Idea Factory — 5 個構想 + VC 評估 + 客戶與可行性分析
- **市場調研報告師** · Market Research Reporter — 市場規模 + 格局 + 消費者洞察 + 進入策略
- **產品上市計畫師** · Product Launch Planner — GTM 策略 + 執行計畫 + 公關社群
- **市場定位地圖生成器** · Market Positioning Map Generator — 定位圖 + 差異化 + 訊息架構
- **競爭定價全景分析師** · Competitive Pricing Landscape Analyst — 定價地圖 + 策略 + 收益優化
- **KPI 設計師** · KPI Designer — KPI 框架 + 層層串聯 + 儀表板規劃
- **競爭情報分析師** · Competitive Intelligence Analyst — 威脅評估 + 信號 + 差異化 + Playbook
- **AI 導入準備度評估師** · AI Adoption Readiness Assessor — 六維評分 + 路線圖 + 風險障礙
- **營運效率診斷師** · Operations Efficiency Diagnostician — 流程診斷 + 自動化 + 指標設計
- **策略聯盟提案師** · Strategic Alliance Proposal Advisor — 協同 + 提案架構 + 關係管理
- **執行摘要生成器** · Executive Summary Generator — 完整摘要 + 多場景版本 + 受眾調整指南
- **談判教練** · Negotiation Coach — 籌碼 + 戰術 + 對方心理解碼
- **決策矩陣分析師** · Decision Matrix Analyst — 評估框架 + 加權矩陣 + 風險後悔分析
- **情境規劃師** · Scenario Planner — 未來情境 + 四象限故事 + 韌性戰略
- **企業風險評估師** · Enterprise Risk Assessor — 風險識別 + 影響／機率矩陣 + 緩解
- **流程優化顧問** · Process Optimization Advisor — 瓶頸診斷 + 再造 + 落地計畫
- **銷售預測顧問** · Sales Forecast Advisor — 三情境預測 + 方法論 + 銷售行動計畫
- **成長策略顧問** · Growth Strategy Advisor — 成長診斷 + 策略設計 + 執行路線圖
- **ESG 策略顧問** · ESG Strategy Advisor — 重大性評估 + ESG 策略 + 揭露報告
- **創新漏斗設計師** · Innovation Funnel Designer — 創新診斷 + 漏斗 + 組合管理
- **供應商稽核顧問** · Supplier Audit Advisor — 風險評估 + 盡職調查 + 合約管理

</details>

<details>
<summary><b>📣 行銷 Marketing</b> — 28 個精選</summary>

- **競品分析** · Competitor Analysis — 並行定位爬梳 → 差異化整合
- **社群月曆** · Social Media Calendar — 策略 → 內容 → 平台優化，整月貼文
- **跨渠道廣告生成** · Cross-Channel Ad Generator — 策略師 + Google/Meta/LinkedIn/YouTube
- **競爭情報雷達** · Competitive Intelligence Radar — 定位 + 功能比較 → 銷售戰鬥手冊
- **顧客成功故事** · Customer Success Story — 戲劇化 + 量化 → 官網／LinkedIn／銷售格式
- **產品發布公關套件** · Product Launch PR Kit — 新聞稿／社群／Email + 發布時間軸
- **電子報策略師** · Newsletter Strategist — 受眾 → 內容／成長／商業化 + 30 天行事曆
- **數位廣告受眾設計師** · Digital Ad Audience Designer — Meta/Google/LinkedIn 受眾設計 + 媒體計畫
- **影片腳本生成器** · Video Script Generator — 腳本／鉤子／故事板 + 完整製作計畫
- **客戶案例研究撰寫師** · Client Case Study Writer — 問題／成果／見證 → 完整案例
- **定價頁面優化師** · Pricing Page Optimizer — 定價審計 + 方案重設計 + 文案 + 異議克服
- **社群成長規劃師** · Community Growth Planner — 健康 + 獲客 + 參與 + 商業化
- **Product Hunt 上線策略師** · Product Hunt Launch Strategist — Tagline + 熱身 + 內容 + 上線清單
- **SEO 關鍵字研究師** · SEO Keyword Researcher — 核心關鍵字 + 長尾 + 內容日曆 + 技術 SEO
- **Landing Page 優化師** · Landing Page Optimizer — CRO 審計 + 文案改寫 + UX + CTA
- **廣告素材生成器** · Ad Creative Generator — 完整 Meta/Google/影片素材包 + 創意策略
- **電郵培育序列師** · Email Nurture Sequence Creator — 完整序列 + A/B 測試 + KPI 目標
- **社群聆聽報告師** · Social Listening Reporter — 情感 + 情緒分類 + 危機信號
- **網站 SEO 健檢師** · Website SEO Health Checker — 技術 SEO + 內容策略 + 外鏈建立
- **媒體公關素材生成器** · Media PR Materials Generator — 新聞稿 + 接觸 + 跨平台公關
- **成長實驗設計師** · Growth Experiment Designer — 假設 + A/B 設計 + 漏斗分析
- **客戶留存優化師** · Customer Retention Optimizer — 根因 + 留存計畫 + 召回策略
- **內容日曆規劃師** · Content Calendar Planner — 內容策略 + 月度日曆 + 批量生產
- **產品上市計畫師** · Product Launch Plan Advisor — GTM + 上市執行 + 公關社群
- **品牌策略設計師** · Brand Strategy Designer — 品牌識別 + 訊息架構 + 多觸點
- **客戶細分引擎** · Customer Segmentation Engine — 行為分群 + 價值分層 + CRM 行動
- **行銷預算配置師** · Marketing Budget Allocator — 管道 ROI 審計 + 最優配置 + ROI 預測
- **媒體計畫規劃師** · Media Plan Planner — 全渠道策略 + 創意 + 投放優化

</details>

<details>
<summary><b>👥 人才 People</b> — 29 個精選</summary>

- **履歷診斷 + 面試題** · Resume Diagnostics + Interview Questions — 3 位 HR 評估 + 專屬題庫
- **企業文化設計師** · Company Culture Designer — 價值觀／規範／儀式 → 宣言與 90 天計畫
- **職涯轉型規劃師** · Career Pivot Planner — 技能差距 + 市場 + 個人品牌 → 轉型計畫
- **員工敬業度診斷師** · Employee Engagement Diagnostician — 文化／主管／職涯 → 提升計畫
- **組織設計顧問** · Organizational Design Advisor — 結構診斷 → 再設計藍圖
- **工作面試準備教練** · Job Interview Prep Coach — 行為／技術／文化契合 → 備戰計畫
- **LinkedIn 個人品牌優化器** · LinkedIn Personal Brand Optimizer — 標題／經歷／人脈 → 升級計畫
- **薪酬談判教練** · Salary Negotiation Coach — 籌碼 + HR 模擬 + 反提案話術
- **會議效率教練** · Meeting Efficiency Coach — 議程 + 引導 + 行動清單 + 跟進
- **團隊衝突調解師** · Team Conflict Mediator — 雙方同理 → 調解 + 預防
- **股權激勵設計師** · Equity Incentive Designer — 期權池 + 分配 + 台灣稅務 + 留才
- **員工 NPS 分析師** · Employee NPS Analyst — 驅動因素 + 流失預警 + 文化健康 + 行動
- **員工績效評估生成器** · Employee Performance Review Generator — 評估 + 能力 + IDP + SMART 目標
- **全面薪酬優化師** · Total Rewards Optimizer — 薪酬審計 + 福利 + 長期激勵
- **職涯導師計畫生成器** · Career Mentorship Plan Generator — 技能差距 + 學習路線 + 導師配對
- **團隊效能診斷師** · Team Performance Diagnostician — 診斷 + 協作 + 激勵設計
- **敏捷教練建議師** · Agile Coach Advisor — 成熟度診斷 + 實踐 + 文化轉型
- **人才招募策略師** · Talent Acquisition Strategist — 人才輪廓 + 面試設計 + Offer 策略
- **變革管理計畫師** · Change Management Planner — 準備度 + 執行計畫 + 溝通策略
- **雇主品牌設計師** · Employer Brand Designer — EVP + 內容策略 + 招募渠道
- **文化契合度顧問** · Culture Fit Advisor — 文化 DNA + 面試問題 + 入職計畫
- **領導力教練** · Leadership Coach — 風格評估 + 發展計畫 + 挑戰應對
- **團隊健康診斷師** · Team Health Diagnostician — 健康診斷 + 介入 + 團隊儀式
- **離職訪談分析師** · Exit Interview Analyst — 離職模式 + 文化診斷 + 留才計畫
- **職涯路徑規劃師** · Career Path Planner — 現況 + 短中長期路徑 + 加速策略
- **結構化面試設計師** · Structured Interview Designer — 能力框架 + 題庫 + 評分標準
- **敏捷 Scrum 教練** · Agile Scrum Coach — 成熟度 + 框架設計 + 儀式指南
- **人才品牌設計師** · Talent Brand Designer — 品牌診斷 + EVP + 傳播計畫
- **職位評分卡生成器** · Job Scorecard Generator — 職位畫像 + 結構化面試 + 入職路徑

</details>

<details>
<summary><b>🤝 銷售 Sales</b> — 22 個精選</summary>

- **顧客反應模擬** · Customer Response Simulator — 4 角色反應 → 流失與傳播分析
- **顧客旅程地圖** · Customer Journey Map — Persona → 5 旅程階段 → CX 策略
- **談判劇本產生器** · Negotiation Script Generator — BATNA／戰術／情境 → 完整劇本
- **客服偏轉器** · CS Deflector — 技術／政策／同理 → 可直接發送回覆
- **銷售通話分析師** · Sales Call Analyst — 反對意見／關係 → 跟進腳本
- **流失防禦引擎** · Churn Defense Engine — 高危畫像 + 挽回 + 留存 → 30 天計畫
- **提案定價信函** · Proposal Pricing Letter — 心理／定位／價值 → 可發送 B2B 信函
- **會議前簡報** · Pre-Meeting Brief — 對方／議程／籌碼 → 一頁戰略簡報
- **AI 採購談判助手** · AI Procurement Negotiator — 市場情報／BATNA／戰術 → 完整劇本
- **B2B 提案書生成器** · B2B Proposal Generator — 解決方案／ROI／成交 → 完整提案架構
- **競標策略顧問** · Bidding Strategy Advisor — 定價／技術／風險 → 得標計畫
- **電商選品策略師** · E-commerce Product Selection Strategist — 趨勢／競品／財務 → 選品決策
- **客戶健康評分師** · Customer Health Scorer — 使用／關係／干預／劇本評分
- **競品定價監控器** · Competitive Pricing Monitor — 競品比較 + 架構 + 定價心理戰術
- **客戶情緒旅程地圖** · Customer Emotion Journey Map — 情緒評分 + 障礙 + WOW 驚喜設計
- **銷售管道預測分析** · Sales Pipeline Forecast Analyst — 加權預測 + 健康 + 即時行動
- **客服腳本生成器** · Customer Service Script Generator — 客服 SOP + 情境同理話術 + KPI
- **銷售提案強化師** · Sales Proposal Enhancer — 審計 + 說服改寫 + 定價故事 + 成交
- **銷售通路策略師** · Sales Channel Strategist — 通路設計 + 夥伴策略 + 賦能
- **銷售 Playbook 生成器** · Sales Playbook Generator — ICP + 訊息 + 反對處理 + 成交
- **營收運營優化師** · Revenue Operations Optimizer — RevOps 診斷 + 對齊 + 技術成長
- **銷售賦能建構師** · Sales Enablement Builder — 準備度 + 內容武器庫 + 培訓計畫

</details>

<details>
<summary><b>💰 財務 Finance</b> — 25 個精選</summary>

- **ROI 試算** · ROI Calculator — 公司資訊 → AI 導入 ROI 與節省估算
- **Pitch Deck 故事** · Pitch Deck Storyteller — 分析師 + 6 投影片 agent + 敘事顧問
- **財務健康掃描器** · Financial Health Scanner — 現金流／成本／融資 → 90 天改善計畫
- **定價實驗設計師** · Pricing Experiment Designer — A/B／客群／收益 → 6 個月定價手冊
- **投資人更新信** · Investor Update Letter — 牽引力／風險／請求 → 完整投資人信
- **董事會簡報** · Board Deck — 財務敘事／路線 → 投影片腳本與預測提問
- **融資準備評估師** · Fundraising Readiness Assessor — 牽引力／市場／團隊 → 投委會決議與 90 天準備
- **加速器申請書生成器** · Accelerator Application Generator — 故事／牽引力／團隊 → 整合材料
- **Term Sheet 分析師** · Term Sheet Analyst — 投資方／創辦人保護／稀釋 → 談判策略
- **盡職調查清單生成器** · Due Diligence Checklist Generator — 法律／財務／市場 DD → 決策摘要
- **投資人壓力測試** · Investor Pressure Test — VC／天使／CVC／PE 四路審問 → 投委會評估
- **投資論點生成器** · Investment Thesis Generator — 多頭／空頭／護城河／時機四路分析
- **營收預測引擎** · Revenue Forecast Engine — 樂觀／基本／悲觀情境 + 成長槓桿
- **天使投資人 Pitch 模擬器** · Angel Investor Pitch Simulator — 犀利問題 + 優勢 + 改善建議
- **新創估值計算師** · Startup Valuation Calculator — DCF／可比／VC 法 — 三種估值範圍
- **商業計畫書生成器** · Business Plan Generator — 摘要 + 市場分析 + 財務模型 + 融資
- **Pitch Deck 投資評分師** · Pitch Deck Investment Scorer — VC 裁決評分 + 分析 + 修改建議
- **投資人接觸信生成器** · Investor Outreach Letter Generator — 冷信／LinkedIn + 跟進 + 會議準備
- **融資資料室準備師** · Data Room Prep Advisor — DD 文件清單 + 敘事 + 問答預測
- **募資財務模型師** · Fundraising Financial Model — 估值 + 財務預測 + 投資人接觸
- **政府補助申請顧問** · Government Grant Application Advisor — 適合計畫 + 文件策略 + 提升成功率
- **投資人 Pitch 準備師** · Investor Pitch Preparation Advisor — 故事線 + Deck 結構 + 刁難問答
- **收入模式優化師** · Revenue Model Optimizer — 模式健診 + 多元收入流 + 預測
- **融資策略顧問** · Funding Strategy Advisor — 融資準備度 + 投資人策略 + 簡報
- **定價審計師** · Pricing Auditor — 收入漏洞診斷 + 架構重設計 + 漲價實驗

</details>

<details>
<summary><b>✨ 品牌 Brand</b> — 17 個精選</summary>

- **網站診斷** · Website Diagnostics — 輸入 URL → SEO 與 UX 問題診斷
- **文案產生器** · Copy Generator — Hero、VP、About 與 SEO meta 並行
- **電商文案產生器** · E-commerce Copywriter — 情感／功能／SEO → 蝦皮/FB/LINE 全套
- **品牌識別工作坊** · Brand Identity Workshop — 命名／視覺／語調 → 完整品牌手冊
- **產品定位聲明產生器** · Positioning Statement Generator — 進攻／防守／利基 → 聲明與層次
- **品牌危機預防師** · Brand Crisis Prevention Advisor — 聲譽／營運／社群風險 → 早期預警
- **品牌命名工作坊** · Brand Naming Workshop — 語言／市場／商標 → 最終推薦
- **媒體公關策略師** · Media PR Strategist — 媒體／危機／網紅 → PR 總監年度計畫
- **播客腳本生成器** · Podcast Script Generator — 腳本／問題／節目筆記 + 成長策略
- **創辦人故事生成器** · Founder Story Generator — 起源／使命／願景 → 完整敘事
- **內容再利用引擎** · Content Repurposing Engine — LinkedIn/Twitter/Email/YouTube/Podcast 五路
- **品牌危機溝通生成器** · Brand Crisis Communication Generator — 媒體／社群／內部／信任重建
- **UX 文案優化師** · UX Copy Optimizer — Before/After 改寫 + 錯誤訊息 + 上線引導
- **品牌規範生成器** · Brand Guidelines Generator — 品牌精髓 + 語調 + 視覺 + 文案規範
- **品牌故事生成器** · Brand Story Generator — 英雄旅程 + 多版本文案 + 傳播策略
- **品牌健診師** · Brand Health Auditor — 健康評估 + 一致性稽核 + 演化策略
- **危機應對劇本師** · Crisis Response Playbook — 緊急評估 + 即時應對 + 信任重建

</details>

<details>
<summary><b>📦 產品 Product</b> — 14 個精選</summary>

- **需求 Pipeline** · Requirement Pipeline — 三個 agent 依序分析專案需求
- **協作模擬** · Collaboration Simulator — PM → Dev → QA 交接，展示真實流程
- **會議行動清單** · Meeting Action List — 3 個 agent 提取決策、行動與風險
- **產品路線圖** · Product Roadmap Builder — RICE/MoSCoW/Impact-Effort → 季度計畫
- **技術規格文件** · Technical Specification Doc — 前端/後端/DB/API/安全 + Tech Lead
- **知識庫建構器** · Knowledge Base Builder — FAQ 生成 + 缺口分析 → KB 架構
- **用戶訪談設計師** · User Interview Designer — 探索／可用性／情感 → 訪談腳本
- **市場調查問卷設計師** · Market Survey Designer — 量化／質性／意圖 → 問卷與偏誤警告
- **線上課程設計師** · Online Course Designer — 策略 → 大綱 + 完課機制 + 上線
- **功能優先排序器 (RICE)** · Feature Prioritizer (RICE) — 多功能 RICE 評分 → CPO 建議
- **產品反饋綜合師** · Product Feedback Synthesizer — 主題萃取 + 優先矩陣 + 路線圖行動
- **產品探索引擎** · Product Discovery Engine — 用戶研究 + 概念發想 + 驗證實驗
- **產品指標分析師** · Product Metrics Analyst — 指標體系 + 儀表板 + 成長實驗
- **設計衝刺引導師** · Design Sprint Facilitator — 五日衝刺計畫 + 工具包 + 原型測試

</details>

<details>
<summary><b>⚖️ 法務 Legal · 💻 開發 Dev · ⚙️ 營運 Ops</b> — 12 個精選</summary>

- **補助申請書產生器** · Grant Application Writer — 摘要/計畫/預算/影響力 → 合規審查評分
- **法律文件起草助手** · Legal Document Drafter — 核心/保護條款 + 風險 → 審查報告
- **ESG 永續報告** · ESG Sustainability Report — 環境/社會/治理 → 重大性矩陣與路線圖
- **法規合規審查師** · Regulatory Compliance Reviewer — 個資/勞工/公司法 → 行動計畫
- **法規合規檢查師** · Regulatory Compliance Checker — 適用法規 + 缺口分析 + 修正路線圖
- **合約談判準備師** · Contract Negotiation Prep Advisor — 風險分析 + 策略 + 條款修改
- **企業合規顧問** · Corporate Compliance Advisor — 風險掃描 + 自查清單 + 路線圖
- **資料隱私評估師** · Data Privacy Assessor — 隱私風險 + 政策框架 + 技術保護
- **技術棧顧問** · Tech Stack Advisor — 技術選型 + 比較 + 擴展性 + 路線圖
- **廠商談判策略師** · Vendor Negotiation Strategist — 談判力 + 戰術 + 關鍵條款攻略
- **會議促進師** · Meeting Facilitator — 議程設計 + 促進技術 + 會後追蹤
- **利害關係人地圖** · Stakeholder Mapping — 影響力地圖 + 參與策略 + 溝通計畫

</details>

> 其餘約 799 個代理人涵蓋相同的 12 大類，使用共用的智慧 prompt 產生器。
> 在首頁用關鍵字搜尋或分類篩選即可找到。

---

## 供應商

| 供應商    | 所需憑證                              | 備註 |
|-----------|---------------------------------------|------|
| OpenAI    | API 金鑰                              | Chat Completions，串流 |
| Anthropic | API 金鑰                              | Messages API，串流 |
| Gemini    | API 金鑰                              | `streamGenerateContent`（SSE）|
| Ollama    | Base URL（預設 `localhost:11434`）    | 本機，免金鑰 |
| Mistral   | API 金鑰                              | OpenAI 相容 |
| Groq      | API 金鑰                              | OpenAI 相容 |
| Azure     | Endpoint ＋ 部署名稱 ＋ API 金鑰      | OpenAI 相容 |

---

## 指令

| 指令                  | 用途 |
|-----------------------|------|
| `npm run dev`        | 啟動開發伺服器（http://localhost:3000）|
| `npm run build`      | 正式版建置（預先渲染所有代理人頁面）|
| `npm start`          | 提供正式版建置 |
| `npm run lint`       | ESLint（next/core-web-vitals）|
| `npm run typecheck`  | `tsc --noEmit` |
| `npm run gen:agents` | 從來源 metadata 重新產生 `lib/agents/data.ts` |

---

## 新增／客製代理人

999 個代理人以扁平 metadata 形式定義在 `lib/agents/data.ts`（自動產生），於載入時透過
通用 prompt 產生器轉成可執行的代理人。若要客製單一代理人的輸入欄位或 prompt，
**請勿編輯自動產生的檔案** — 改在 `lib/agents/overrides.ts` 加一筆。詳見
[CONTRIBUTING.md](./CONTRIBUTING.md)。

---

## 不在範圍內（v1）

無帳號／OAuth · 無對話歷史 · 無代理人串接 · 無檔案／圖片輸入 ·
無 UI 內建代理人建立 · 無使用分析。

---

## 授權

MIT — 見 [LICENSE](./LICENSE)。
