#!/usr/bin/env python3
"""
MyKcal 專案自動化輔助腳本
支援功能：
  1. 本機執行測試 (Dev Server)
  2. 程式碼建置與 TypeScript 檢查 (Build Check)
  3. 自動 Commit & 推送至 GitHub (Git Push)
  4. 查看當前 Git 與專案狀態 (Status)
"""

import sys
import os
import subprocess
import shutil

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.join(ROOT_DIR, 'app')

def print_header(text: str):
    print("\n" + "=" * 50)
    print(f"  {text}")
    print("=" * 50)

def get_npm_command():
    if shutil.which('npm.cmd'):
        return 'npm.cmd'
    if shutil.which('npm'):
        return 'npm'
    return 'npm'

def run_dev():
    """啟動本機開發伺服器"""
    print_header("🚀 啟動本機開發伺服器 (Next.js Dev Server)")
    npm_cmd = get_npm_command()
    try:
        subprocess.run([npm_cmd, "run", "dev"], cwd=APP_DIR, check=True)
    except KeyboardInterrupt:
        print("\n\n🛑 已停止開發伺服器。")
    except Exception as e:
        print(f"\n❌ 執行失敗: {e}")

def run_build():
    """執行建置與 TypeScript 檢查"""
    print_header("🔨 執行建置與型別檢查 (Build Check)")
    npm_cmd = get_npm_command()
    try:
        result = subprocess.run([npm_cmd, "run", "build"], cwd=APP_DIR)
        if result.returncode == 0:
            print("\n✅ 建置與型別檢查成功！")
        else:
            print(f"\n❌ 建置失敗，退出碼: {result.returncode}")
        return result.returncode == 0
    except Exception as e:
        print(f"\n❌ 執行失敗: {e}")
        return False

def run_push(commit_msg: str = ""):
    """自動加入變更、Commit 並推送到 GitHub"""
    print_header("📤 推送程式碼至 GitHub")
    
    # Check git status first
    status_proc = subprocess.run(["git", "status", "--porcelain"], cwd=ROOT_DIR, capture_output=True, text=True)
    if not status_proc.stdout.strip():
        print("ℹ️ 目前沒有任何變更需要提交。")
        return

    print("📄 偵測到的變更清單：")
    for line in status_proc.stdout.strip().split('\n'):
        print(f"   {line}")
    print()

    if not commit_msg:
        commit_msg = input("💬 請輸入 Commit 訊息 (留空預設為 'feat: update project'): ").strip()
        if not commit_msg:
            commit_msg = "feat: update project"

    try:
        print("➕ 執行 git add . ...")
        subprocess.run(["git", "add", "."], cwd=ROOT_DIR, check=True)

        print(f"📝 執行 git commit -m \"{commit_msg}\" ...")
        subprocess.run(["git", "commit", "-m", commit_msg], cwd=ROOT_DIR, check=True)

        print("🚀 執行 git push origin main ...")
        push_res = subprocess.run(["git", "push", "origin", "main"], cwd=ROOT_DIR)

        if push_res.returncode == 0:
            print("\n🎉 成功推送到 GitHub！")
        else:
            print(f"\n❌ 推送失敗，退出碼: {push_res.returncode}")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Git 操作中斷: {e}")
    except Exception as e:
        print(f"\n❌ 發生錯誤: {e}")

def run_status():
    """查看 Git 狀態"""
    print_header("📊 查看 Git 狀態")
    subprocess.run(["git", "status"], cwd=ROOT_DIR)

def interactive_menu():
    while True:
        print("\n" + "━" * 40)
        print("   🌟 MyKcal 專案管理工具")
        print("━" * 40)
        print("  [1] 🚀 本機執行測試 (npm run dev)")
        print("  [2] 🔨 建置與檢查 (npm run build)")
        print("  [3] 📤 推送至 GitHub (git push)")
        print("  [4] 📊 查看狀態 (git status)")
        print("  [0] 🚪 退出")
        print("━" * 40)
        
        choice = input("請選擇操作 [0-4]: ").strip()
        if choice == '1':
            run_dev()
        elif choice == '2':
            run_build()
        elif choice == '3':
            run_push()
        elif choice == '4':
            run_status()
        elif choice == '0':
            print("👋 再見！")
            break
        else:
            print("⚠️ 無效的選擇，請重新輸入。")

def main():
    if len(sys.argv) > 1:
        cmd = sys.argv[1].lower()
        if cmd in ['dev', 'start', 'run']:
            run_dev()
        elif cmd in ['build', 'check']:
            run_build()
        elif cmd in ['push', 'deploy']:
            msg = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else ""
            run_push(msg)
        elif cmd in ['status', 'st']:
            run_status()
        elif cmd in ['help', '-h', '--help']:
            print("""
使用說明：
  python manage.py              啟動互動式選單
  python manage.py dev          啟動本機測試伺服器
  python manage.py build        執行建置檢查
  python manage.py push [訊息]   自動 commit 並推送到 GitHub
  python manage.py status       查看 Git 狀態
""")
        else:
            print(f"⚠️ 未知指令: {cmd}，輸入 python manage.py --help 查看用法。")
    else:
        interactive_menu()

if __name__ == '__main__':
    main()
