# MyKcal - 智慧卡洛里與運動健康追蹤 PWA

> 專為行動裝置打造的飲食熱量、運動消耗與身體數據追蹤系統。結合 **Google Gemini AI 影像辨識** 與 **Notion 無頭資料庫（Headless CMS/DB）**，並自動部署於 **Vercel**。

---

## 核心功能

- **AI 拍照估算熱量（`/scan`）**：拍照或上傳食物照片，透過 Google Gemini 2.5 Flash 自動辨識餐點、預估卡洛里、三大營養素（蛋白質/碳水/脂肪）與市場價格。
- **多餐別飲食管理（`/records`）**：支援早餐、午餐、下午茶、晚餐、宵夜、點心六種餐別分類與搜尋。
- **運動紀錄追蹤（`/exercise`）**：登記每日運動項目、時長/組數與燃燒卡洛里。
- **身體指標與趨勢圖表（`/metrics`）**：記錄體重、體脂率、腰圍、骨骼肌，並以互動式圖表可視化趨勢變化。
- **日曆總覽（`/calendar`）**：以日曆檢視歷史飲食、運動與身體數據。
- **個人化 TDEE 目標設定（`/settings`）**：依據性別、年齡、身高體重與活動量自動計算或手動調整每日目標。
- **公開唯讀月曆分享（`/share/[token]`）**：可產生免登入的專屬隨機分享網址（例如 `/share/k7x9a2b1`），支援隨時「一鍵重設代碼廢除舊連結」停止舊訪客查看。
- **Notion 使用者身分驗證（`/login`）**：以 NextAuth.js 搭配 Notion 使用者資料庫進行登入與多用戶資料隔離。

---

## 技術架構

| 領域 | 使用技術 |
| :--- | :--- |
| **前端框架** | [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript) |
| **UI 與圖表** | Tailwind CSS v4, Lucide React Icons, Recharts |
| **資料庫 (DB)** | [Notion API](https://developers.notion.com/) (`@notionhq/client`) |
| **AI 影像辨識** | [Google Generative AI](https://ai.google.dev/) (`gemini-2.5-flash`) |
| **身分驗證** | [NextAuth.js](https://next-auth.js.org/) (Credentials Provider + JWT Session) |
| **託管與部署** | [Vercel](https://vercel.com/)（與 GitHub Repo 自動同步部署） |

---

## 專案檔案結構

```text
my-kcal/
├── README.md                  # 專案主說明文件
├── AGENTS.md                  # AI 助手架構與開發指引
└── app/                       # Next.js 應用程式核心目錄
    ├── package.json           # 專案依賴與腳本
    ├── tsconfig.json          # TypeScript 設定
    ├── public/                # 靜態資源與圖示
    └── src/
        ├── middleware.ts      # 路由權限中介軟體
        ├── lib/               # 核心邏輯與共用服務
        │   ├── auth.ts        # NextAuth 驗證設定
        │   ├── gemini.ts      # Gemini AI 食物辨識與 Prompt
        │   ├── notion.ts      # Notion API 資料讀寫 CRUD 操作
        │   └── types.ts       # 全域 TypeScript 型別定義
        ├── components/        # 共用 UI 元件（導覽列、卡片、圖表等）
        └── app/               # App Router 路由頁面
            ├── page.tsx       # 儀表板首頁 (Dashboard)
            ├── layout.tsx     # 根佈局與導覽列
            ├── login/         # 登入頁面
            ├── scan/          # AI 照片拍照辨識頁面
            ├── records/       # 飲食紀錄清單
            ├── exercise/      # 運動紀錄頁面
            ├── metrics/       # 身體指標與數據圖表
            ├── calendar/      # 日曆總覽
            ├── settings/      # 個人設定與目標調整
            ├── share/[name]/  # 公開唯讀分享月曆頁面
            └── api/           # 後端 API Routes
                ├── auth/      # NextAuth 端點
                ├── analyze/   # Gemini AI 辨識 API
                ├── records/   # 飲食資料 CRUD
                ├── exercises/ # 運動資料 CRUD
                ├── metrics/   # 身體指標 CRUD
                ├── share/[name]/ # 公開月曆資料 API
                ├── stats/     # 統計數據計算 API
                ├── user/      # 使用者資料 API
                └── calendar/  # 日曆資料匯總 API
```

---

## Notion 資料庫結構說明

本專案使用 4 個 Notion Database 作為資料存儲，請在 Notion 建立對應資料庫並授權給 Notion Integration：

### 1. 飲食紀錄資料庫 (`NOTION_DATABASE_ID`)
- `Name` (title)：食物名稱
- `Date` (date)：攝取日期 (YYYY-MM-DD)
- `Meal` (select)：餐別（早餐 / 午餐 / 下午茶 / 晚餐 / 宵夜 / 點心）
- `Calories` (number)：熱量 (kcal)
- `Protein` (number)：蛋白質 (g)
- `Carbs` (number)：碳水化合物 (g)
- `Fat` (number)：脂肪 (g)
- `Price` (number)：花費金額 (TWD)
- `UserEmail` (email 或 rich_text)：使用者 Email

### 2. 使用者資料庫 (`NOTION_USER_DATABASE_ID`)
- `Name` (title)：使用者名稱
- `Email` (email 或 rich_text)：電子信箱
- `Gender` (select)：性別（male / female / other）
- `Birthday` (date)：生日
- `Height` (number)：身高 (cm)
- `Weight` (number)：體重 (kg)
- `ActivityLevel` (select)：活動程度（久坐 / 輕度 / 中度 / 重度 / 極重度）
- `TargetCalories` (number)：目標熱量 (kcal)

### 3. 身體指標資料庫 (`NOTION_METRICS_DATABASE_ID`)
- `Date` (date)：記錄日期
- `Weight` (number)：體重 (kg)
- `BodyFat` (number)：體脂率 (%)
- `Waist` (number)：腰圍 (cm)
- `SkeletalMuscle` (number)：骨骼肌重 (kg)
- `UserEmail` (email 或 rich_text)：使用者 Email

### 4. 運動紀錄資料庫 (`NOTION_EXERCISES_DATABASE_ID`)
- `Date` (date)：運動日期
- `Type` (select 或 rich_text)：運動類型
- `Amount` (rich_text)：運動量（如：跑步 5 公里、重訓 45 分鐘）
- `CaloriesBurned` (number)：消耗熱量 (kcal)
- `UserEmail` (email 或 rich_text)：使用者 Email

---

## 環境變數設定 (`.env.local`)

請在 `app/` 目錄下建立 `.env.local` 檔案，填入以下金鑰：

```env
# Notion 整合金鑰
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_USER_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_METRICS_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_EXERCISES_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Gemini API
GEMINI_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# NextAuth 設定
NEXTAUTH_SECRET=your-random-secret-key-at-least-32-chars
NEXTAUTH_URL=http://localhost:3000
```

> **部署至 Vercel 時**：請至 Vercel 專案後台的 `Settings > Environment Variables`，將上述環境變數完整填入。`NEXTAUTH_URL` 請設定為 Vercel 指派的 Production 網址。

---

## 本地開發步驟

```bash
# 1. 進入 app 目錄
cd app

# 2. 安裝相依套件
npm install

# 3. 啟動開發伺服器
npm run dev
```

開啟瀏覽器前往 [http://localhost:3000](http://localhost:3000) 即可開始使用。

---

## 部署至 Vercel

1. 將程式碼推送到 GitHub 存儲庫。
2. 登入 [Vercel](https://vercel.com/)，匯入此 GitHub 專案。
3. **重要**：在 Project Settings 中將 **Root Directory** 設定為 `app`。
4. 填入所有必要的 **Environment Variables**。
5. 點擊 **Deploy**，日後每次 Push 至 `main` 分支將自動觸發 CI/CD 部署。
