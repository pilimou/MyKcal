#!/usr/bin/env node
import { spawnSync, spawn } from 'child_process';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = __dirname;
const APP_DIR = path.join(ROOT_DIR, 'app');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

function printHeader(title) {
  console.log('\n' + '='.repeat(45));
  console.log(`  ${title}`);
  console.log('='.repeat(45));
}

function runDev() {
  printHeader('🚀 啟動本機開發伺服器 (Next.js Dev Server)');
  const child = spawn(npmCmd, ['run', 'dev'], {
    cwd: APP_DIR,
    stdio: 'inherit',
    shell: true,
  });
  child.on('exit', (code) => {
    console.log(`\n🛑 開發伺服器已結束 (退出碼: ${code})`);
  });
}

function runBuild() {
  printHeader('🔨 執行建置與型別檢查 (Build Check)');
  const res = spawnSync(npmCmd, ['run', 'build'], {
    cwd: APP_DIR,
    stdio: 'inherit',
    shell: true,
  });
  if (res.status === 0) {
    console.log('\n✅ 建置與型別檢查成功！');
  } else {
    console.log(`\n❌ 建置失敗，退出碼: ${res.status}`);
  }
}

function runPush(commitMsg) {
  printHeader('📤 推送程式碼至 GitHub');
  const statusRes = spawnSync('git', ['status', '--porcelain'], {
    cwd: ROOT_DIR,
    encoding: 'utf-8',
  });

  if (!statusRes.stdout || !statusRes.stdout.trim()) {
    console.log('ℹ️ 目前沒有任何變更需要提交。');
    return;
  }

  console.log('📄 偵測到的變更清單：');
  console.log(statusRes.stdout.trim().split('\n').map(l => `   ${l}`).join('\n'));
  console.log();

  const doCommitAndPush = (msg) => {
    const finalMsg = msg || 'feat: update project';
    console.log('➕ 執行 git add . ...');
    spawnSync('git', ['add', '.'], { cwd: ROOT_DIR, stdio: 'inherit' });

    console.log(`📝 執行 git commit -m "${finalMsg}" ...`);
    spawnSync('git', ['commit', '-m', finalMsg], { cwd: ROOT_DIR, stdio: 'inherit' });

    console.log('🚀 執行 git push origin main ...');
    const pushRes = spawnSync('git', ['push', 'origin', 'main'], { cwd: ROOT_DIR, stdio: 'inherit' });

    if (pushRes.status === 0) {
      console.log('\n🎉 成功推送到 GitHub！');
    } else {
      console.log(`\n❌ 推送失敗，退出碼: ${pushRes.status}`);
    }
  };

  if (commitMsg) {
    doCommitAndPush(commitMsg);
  } else {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('💬 請輸入 Commit 訊息 (留空預設為 "feat: update project"): ', (ans) => {
      rl.close();
      doCommitAndPush(ans.trim());
    });
  }
}

function runStatus() {
  printHeader('📊 查看 Git 狀態');
  spawnSync('git', ['status'], { cwd: ROOT_DIR, stdio: 'inherit' });
}

function showInteractiveMenu() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  console.log('\n' + '━'.repeat(35));
  console.log('   🌟 MyKcal 專案管理工具');
  console.log('━'.repeat(35));
  console.log('  [1] 🚀 本機執行測試 (npm run dev)');
  console.log('  [2] 🔨 建置與檢查 (npm run build)');
  console.log('  [3] 📤 推送至 GitHub (git push)');
  console.log('  [4] 📊 查看狀態 (git status)');
  console.log('  [0] 🚪 退出');
  console.log('━'.repeat(35));

  rl.question('請選擇操作 [0-4]: ', (choice) => {
    rl.close();
    const c = choice.trim();
    if (c === '1') runDev();
    else if (c === '2') runBuild();
    else if (c === '3') runPush();
    else if (c === '4') runStatus();
    else if (c === '0') console.log('👋 再見！');
    else console.log('⚠️ 無效的選擇。');
  });
}

const args = process.argv.slice(2);
if (args.length > 0) {
  const cmd = args[0].toLowerCase();
  if (['dev', 'start', 'run'].includes(cmd)) runDev();
  else if (['build', 'check'].includes(cmd)) runBuild();
  else if (['push', 'deploy'].includes(cmd)) runPush(args.slice(1).join(' '));
  else if (['status', 'st'].includes(cmd)) runStatus();
  else {
    console.log(`
使用說明：
  node manage.mjs              啟動互動式選單
  node manage.mjs dev          啟動本機測試伺服器
  node manage.mjs build        執行建置檢查
  node manage.mjs push [訊息]   自動 commit 並推送到 GitHub
  node manage.mjs status       查看 Git 狀態
`);
  }
} else {
  showInteractiveMenu();
}
