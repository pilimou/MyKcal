# MyKcal Project Context & AI Guidelines

本文件供 AI 輔助開發工具（如 Antigravity / Claude Code）快速掌握專案全貌與開發規範。

---

## 專案核心概況
- **專案名稱**：MyKcal (卡洛里與運動健康追蹤 PWA)
- **前端框架**：Next.js (App Router, React 19, TypeScript)
- **樣式庫**：Tailwind CSS v4 + Lucide Icons + Recharts
- **後端與資料存儲**：Notion API (`@notionhq/client`) 作為 Headless Database
- **AI 整合**：Google Generative AI (`@google/generative-ai` - `gemini-2.5-flash`)
- **身分驗證**：NextAuth.js (Credentials Provider + JWT Session, 與 Notion User DB 連動)
- **部署平台**：Vercel (Root Directory: `app`)

---

## 核心目錄結構
- `app/src/app/`：App Router 路由頁面（首頁、登入、拍照辨識、飲食紀錄、運動紀錄、身體數據、日曆、設定）
- `app/src/app/api/`：API Routes (`/analyze`, `/records`, `/exercises`, `/metrics`, `/stats`, `/user`, `/calendar`)
- `app/src/lib/notion.ts`：Notion SDK 封裝、CRUD 操作與資料轉換函式
- `app/src/lib/gemini.ts`：Gemini 2.5 Flash 圖片解析與 JSON 格式化 Prompt
- `app/src/lib/auth.ts`：NextAuth Options 與認證回呼邏輯
- `app/src/lib/types.ts`：全域 TypeScript 資料結構

---

## 開發守則與注意事項
1. **App Router 規範**：所有客戶端互動元件需明確標註 `'use client'`。
2. **Notion API 限制**：
   - Notion API 查詢與更新有頻率限制，且回應格式為巢狀 Property 物件，請一律透過 `app/src/lib/notion.ts` 封裝處理。
   - 所有寫入與查詢均需關聯 `UserEmail` 進行多租戶隔離。
3. **行動優先（Mobile-First）**：介面需優先確保手機螢幕尺寸的易用性與流暢度，按鈕與觸碰熱區需符合行動裝置規範。
4. **環境變數安全**：勿將 API Key 或 Session Secret 硬編碼在前端元件中。
