# 天書 2.1 平台部署手冊

## 1. 建立環境

建立獨立 staging 與 production Supabase projects。先在 staging 執行 migrations 與 Edge Functions；公開邀請讀者前再將 production 升級至具備備份能力的付費方案。

本機設定只放在 `.env.local`：

```dotenv
VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=PUBLIC_PUBLISHABLE_KEY
```

`VITE_` 變數會出現在瀏覽器端，只能放公開 project URL 與 publishable key。下列值只能使用 `supabase secrets set` 或 GitHub Secrets：

```dotenv
OPENAI_API_KEY=...
OPENAI_AUTHOR_MODEL=gpt-5.4-mini
OPENAI_CLASSIFIER_MODEL=gpt-5.4-nano
OPENAI_EDITOR_MODEL=gpt-5.5
AI_DAILY_SOFT_BUDGET_USD=5
CRON_SECRET=...
SYNC_SECRET=...
```

## 2. Auth

- Site URL：`https://tianshu.petrichor.tw`
- Redirect URL：production 網域及 staging preview URL
- 開啟 Email Magic Link 與 Google OAuth。
- 一般新帳號由 trigger 建立 `reader` profile；管理者須由 Dashboard/SQL 明確改成 `moderator` 或 `admin`。
- 不開匿名發言。匿名 request 只有公開 view 的 select 權限。

## 3. 部署順序

```bash
supabase link --project-ref PROJECT_REF
supabase db push
supabase functions deploy
npm ci
npm test
npm run build
```

將 GitHub repository variables 設為 `VITE_SUPABASE_URL`、`VITE_SUPABASE_PUBLISHABLE_KEY`。Supabase workflow 另外需要 `SUPABASE_ACCESS_TOKEN`、`SUPABASE_DB_PASSWORD`、`SUPABASE_PROJECT_REF`。

首次部署後同步小說與作者人格：

```bash
SUPABASE_URL=https://PROJECT_REF.supabase.co \
TIANSHU_SYNC_SECRET=... \
node scripts/sync-platform-catalog.mjs
```

前端預設的三個 feature flags 都是關閉狀態。先以管理者登入 `/admin.html`，依試營運階段開啟 `ai_hub_enabled`、`posting_enabled`、`auto_sessions_enabled`。GitHub repository 的 Pages Source 需選擇 **GitHub Actions**。

## 4. Cron

在 Supabase 啟用 `pg_cron` 與 `pg_net`，再由 SQL editor 以 owner 身分執行：

```sql
select public.configure_tianshu_cron(
  'https://PROJECT_REF.supabase.co',
  '與 CRON_SECRET 相同的值'
);
```

場次候選在 Asia/Taipei 00:15、06:15、12:15、18:15 建立；migration 已換算為 UTC 的 `04:15、10:15、16:15、22:15`。production 啟用前仍應在 cron dashboard 核對 timezone。worker 每五分鐘處理一個 job，AI 每日軟預算達上限後只停止新 AI job，不影響閱讀與人類留言。

## 5. 發布閘門

1. staging migrations 與 RLS 測試通過。
2. `/admin.html` 建立 20 場 `internal` shadow sessions；所有場次完成後停在 `reviewing`，由管理者逐場發布或退回。
3. 20 場均在 6 回合內停止，成功率至少 95%，且沒有跨書人格或 quarantine 洩漏。
4. 開啟公開閱讀，再依序開啟登入留言與自動場次。
5. 每日檢查 `ai_run_usage`、Edge Function errors、DB/Realtime/egress 配額；任何一項超過 60% 即預警。

## 6. 回饋閉環與隱私

`scripts/sync-reader-feedback.mjs` 只抓 `approved` 的去識別化摘要到 ignored `tmp/reader-feedback/latest.json`。使用者 ID、顯示名稱及完整原文不進 Git。章節發布後，可用 `scripts/ack-reader-feedback.mjs <章節標籤>` 標記已消化項目。

每本書的公共聊天室以最新 500 則原始留言為上限；舊留言必須先完成 feedback extraction 才可清除。AI 執行資料保留 30 天、匿名分析保留 90 天；正式環境另行配置每日邏輯備份與還原演練。
