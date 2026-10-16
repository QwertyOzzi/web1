import os
import sys
import subprocess
import webbrowser

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
GIT_EXE = os.path.join(BASE_DIR, ".tools", "git", "cmd", "git.exe")
REPO_URL = "https://github.com/QwertyOzzi/web1.git"

if not os.path.exists(GIT_EXE):
    # Try global git
    GIT_EXE = "git"

def run_git(args, capture=False):
    cmd = [GIT_EXE] + args
    try:
        if capture:
            res = subprocess.run(cmd, cwd=BASE_DIR, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8", errors="replace")
            return res.returncode, res.stdout, res.stderr
        else:
            res = subprocess.run(cmd, cwd=BASE_DIR)
            return res.returncode, "", ""
    except Exception as e:
        return 1, "", str(e)

def main():
    print("=" * 60)
    print("       Arz MODS WebSell • Выгрузка на GitHub")
    print(f"       Репозиторий: {REPO_URL}")
    print("=" * 60)
    print()

    # 1. Check git
    code, out, _ = run_git(["--version"], capture=True)
    if code != 0:
        print("[!] Ошибка: Git не найден.")
        return

    print(f"[1/4] Используется: {out.strip()}")

    # 2. Stage and commit
    print("[2/4] Проверка изменений и подготовка файлов...")
    run_git(["add", "."])
    code, status_out, _ = run_git(["status", "--porcelain"], capture=True)
    if status_out.strip():
        run_git(["commit", "-m", "Update: Cosmic Storefront & Products"])
        print("      Файлы успешно зафиксированы.")
    else:
        print("      Все файлы уже зафиксированы.")

    run_git(["branch", "-M", "main"])

    # 3. Push to GitHub
    print()
    print("[3/4] Отправка на GitHub...")
    print("Для загрузки на GitHub нужен Personal Access Token (токен доступа).")
    print("Если у вас есть токен (начинается на ghp_...), вставьте его ниже.")
    print("Если токена нет, просто нажмите ENTER для стандартного входа через Git.")
    print()
    print("Где взять токен (если еще нет): https://github.com/settings/tokens")
    print("(Нужен Classic Token с галочкой 'repo')")
    print()

    token = input("Вставьте GitHub Token (или нажмите Enter): ").strip()

    if token:
        # Push with token
        auth_url = f"https://{token}@github.com/QwertyOzzi/web1.git"
        print("\nОтправка файлов с токеном на GitHub...")
        code, out, err = run_git(["push", "-u", auth_url, "main"], capture=False)
        # Ensure remote URL doesn't keep the token in plain text
        run_git(["remote", "set-url", "origin", REPO_URL])
    else:
        print("\nОтправка через Git...")
        code, _, _ = run_git(["push", "-u", "origin", "main"], capture=False)

    print()
    if code == 0:
        print("=" * 60)
        print("  [УСПЕХ] Сайт успешно загружен в репозиторий!")
        print("=" * 60)
        print()
        print("Теперь включите бесплатный хостинг GitHub Pages:")
        print("1. Сейчас откроется страница настроек репозитория:")
        print("   https://github.com/QwertyOzzi/web1/settings/pages")
        print("2. В разделе 'Build and deployment' выберите:")
        print("   - Branch: 'main'")
        print("   - Folder: '/ (root)'")
        print("3. Нажмите Save!")
        print()
        print("Ваш сайт будет доступен в интернете по адресу:")
        print("   https://qwertyozzi.github.io/web1/")
        print("=" * 60)
        try:
            webbrowser.open("https://github.com/QwertyOzzi/web1/settings/pages")
        except Exception:
            pass
    else:
        print("=" * 60)
        print("  [!] Не удалось отправить файлы на GitHub.")
        print("  Возможные причины:")
        print("  1. Неверный токен или логин.")
        print("  2. Нет прав на запись в репозиторий https://github.com/QwertyOzzi/web1.git")
        print("=" * 60)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nПрервано пользователем.")
    except Exception as e:
        print(f"\nОшибка: {e}")
