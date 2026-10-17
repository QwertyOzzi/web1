import os
import sys
import json
import sqlite3
import mimetypes
import urllib.parse
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
import uuid
import base64
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = BASE_DIR
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
DB_PATH = os.path.join(BASE_DIR, "data", "store.db")

os.makedirs(PUBLIC_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "data"), exist_ok=True)

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Settings table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    """)
    
    # Products table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE,
            title TEXT NOT NULL,
            price REAL NOT NULL DEFAULT 0,
            currency TEXT DEFAULT '₽',
            category TEXT DEFAULT 'Сборки',
            badge TEXT DEFAULT 'Цифровой товар',
            short_desc TEXT,
            description TEXT,
            image_url TEXT,
            download_url TEXT,
            contact_tg TEXT,
            is_active INTEGER DEFAULT 1,
            created_at INTEGER
        )
    """)
    
    # Default settings
    default_settings = {
        "store_name": "Arz MODS • Jimi Hopper",
        "avatar_url": "/uploads/avatar.svg",
        "bio": "Приватные сборки, скрипты и графика для SA-MP / Arizona RP. Быстрая выдача и поддержка.",
        "telegram_username": "jimi_hopper",
        "currency": "₽"
    }
    for k, v in default_settings.items():
        cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)", (k, v))
        
    # Check if products table is empty, then seed initial product
    cursor.execute("SELECT COUNT(*) FROM products")
    count = cursor.fetchone()[0]
    if count == 0:
        now = int(time.time())
        seed_products = [
            (
                "ByO",
                "[Gta by Jimi_Hopper ]",
                490,
                "₽",
                "Сборки",
                "Хит продаж",
                "Серая графика с шейдерами, приватный скрипт, аксы на медведя, заменки оружия.",
                "Cерая графика с шейдерами 🎨\n\nПриватный скрипт с широкой кастомизацией под себя, красивые аксы на медведя, аксессуары, заменки для Калашей и обреза 🔫.\n\n✨ Преимущества:\n• Оптимизирована для слабых и средних ПК\n• Стабильный FPS без просадок на серверах Arizona RP\n• Встроенные эксклюзивные эффекты и звуки стрельбы\n• Полная инструкция по установке в архиве\n\n📦 После оплаты вы мгновенно получаете прямую ссылку на скачивание архива с модом и скриптом.",
                "/uploads/byo_cover.jpeg" if os.path.exists(os.path.join(UPLOADS_DIR, "byo_cover.jpeg")) else "https://s3.tribute.tg/tribute/images/91/71debc72-f3e2-44a0-9e6d-235d1d19973f.jpeg",
                "https://t.me/jimi_hopper",
                "@jimi_hopper",
                1,
                now
            ),
            (
                "arizona-helper",
                "Private ARZ Helper Script v2.5",
                290,
                "₽",
                "Скрипты",
                "Новинка",
                "Автоматизация рутины, таймеры каптов, удобный биндер и меню кастомизации.",
                "Полностью безопасный и оптимизированный хелпер для Arizona RP 🛠️\n\nОсобенности:\n• Умный фаст-коннект с защитой от бана IP\n• Кастомный инвентарь и быстрые бинды на клавиши\n• Таймеры спавна и учет ресурсов\n• Удобное меню /arz с гибкими настройками под себя\n\nПоддержка и обновления включены!",
                "",
                "https://t.me/jimi_hopper",
                "@jimi_hopper",
                1,
                now - 3600
            ),
            (
                "colormod-pack",
                "Atmospheric Gray & Sunset ColorMod Pack",
                150,
                "₽",
                "Графика",
                "Цифровой товар",
                "Набор сочных колормодов: серый стиль, закатный и контрастный киношный вид.",
                "Стильный колормод, идеально подходящий для каптов и комфортной игры 🌅\n\n• Без падения FPS\n• 3 пресета: Gray Cold, Sunset Warm, Film Dark\n• Работает на любой версии GTA SA\n• Мгновенная установка в один клик",
                "",
                "https://t.me/jimi_hopper",
                "@jimi_hopper",
                1,
                now - 7200
            )
        ]
        cursor.executemany("""
            INSERT INTO products (
                slug, title, price, currency, category, badge, short_desc, description,
                image_url, download_url, contact_tg, is_active, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, seed_products)
        
    conn.commit()
    conn.close()
    sync_json_files()

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def sync_json_files():
    """Auto-exports SQLite database to data/products.json and data/settings.json so Git push deploys latest data."""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products ORDER BY id DESC")
        products = [dict(row) for row in cursor.fetchall()]

        cursor.execute("SELECT key, value FROM settings")
        settings = {row["key"]: row["value"] for row in cursor.fetchall()}
        conn.close()

        data_dir = os.path.join(BASE_DIR, "data")
        os.makedirs(data_dir, exist_ok=True)

        with open(os.path.join(data_dir, "products.json"), "w", encoding="utf-8") as f:
            json.dump(products, f, ensure_ascii=False, indent=2)

        with open(os.path.join(data_dir, "settings.json"), "w", encoding="utf-8") as f:
            json.dump(settings, f, ensure_ascii=False, indent=2)

        # Also sync public/data if present
        pub_data = os.path.join(BASE_DIR, "public", "data")
        if os.path.exists(pub_data):
            with open(os.path.join(pub_data, "products.json"), "w", encoding="utf-8") as f:
                json.dump(products, f, ensure_ascii=False, indent=2)
            with open(os.path.join(pub_data, "settings.json"), "w", encoding="utf-8") as f:
                json.dump(settings, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[Warning] Could not export JSON files: {e}")


class StoreHTTPRequestHandler(BaseHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and disable aggressive caching for local dev
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # API: Products list
        if path == "/api/products":
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM products ORDER BY id DESC")
            rows = [dict(row) for row in cursor.fetchall()]
            conn.close()
            self.send_json(rows)
            return

        # API: Single product by ID or slug
        if path.startswith("/api/products/"):
            identifier = path[len("/api/products/"):]
            conn = get_db()
            cursor = conn.cursor()
            if identifier.isdigit():
                cursor.execute("SELECT * FROM products WHERE id = ?", (int(identifier),))
            else:
                cursor.execute("SELECT * FROM products WHERE slug = ?", (identifier,))
            row = cursor.fetchone()
            conn.close()
            if row:
                self.send_json(dict(row))
            else:
                self.send_json({"error": "Product not found"}, status=404)
            return

        # API: Settings
        if path == "/api/settings":
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT key, value FROM settings")
            settings = {row["key"]: row["value"] for row in cursor.fetchall()}
            conn.close()
            self.send_json(settings)
            return

        # Serve static uploads
        if path.startswith("/uploads/"):
            filename = urllib.parse.unquote(path[len("/uploads/"):])
            filepath = os.path.join(UPLOADS_DIR, filename)
            if os.path.exists(filepath) and os.path.isfile(filepath):
                self.serve_file(filepath)
            else:
                self.send_error(404, "Upload not found")
            return

        # Serve static public files
        requested_file = path.lstrip("/")
        if not requested_file or path.startswith("/p/"):
            # SPA Fallback: root or /p/<slug> serves index.html
            filepath = os.path.join(PUBLIC_DIR, "index.html")
        else:
            filepath = os.path.join(PUBLIC_DIR, requested_file)

        if os.path.exists(filepath) and os.path.isfile(filepath):
            self.serve_file(filepath)
        else:
            # Fallback to index.html for SPA client-side routing
            index_path = os.path.join(PUBLIC_DIR, "index.html")
            if os.path.exists(index_path):
                self.serve_file(index_path)
            else:
                self.send_error(404, "File not found")

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # API: Add Product
        if path == "/api/products":
            data = self.read_json()
            if not data or not data.get("title"):
                self.send_json({"error": "Title is required"}, status=400)
                return

            slug = data.get("slug") or str(uuid.uuid4())[:8]
            slug = slug.strip().replace(" ", "-")
            title = data.get("title", "").strip()
            price = float(data.get("price", 0))
            currency = data.get("currency", "₽")
            category = data.get("category", "Сборки")
            badge = data.get("badge", "Цифровой товар")
            short_desc = data.get("short_desc", "")
            description = data.get("description", "")
            image_url = data.get("image_url", "")
            download_url = data.get("download_url", "")
            contact_tg = data.get("contact_tg", "")
            is_active = 1 if data.get("is_active", True) else 0
            created_at = int(time.time())

            conn = get_db()
            cursor = conn.cursor()
            try:
                cursor.execute("""
                    INSERT INTO products (
                        slug, title, price, currency, category, badge, short_desc, description,
                        image_url, download_url, contact_tg, is_active, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    slug, title, price, currency, category, badge, short_desc, description,
                    image_url, download_url, contact_tg, is_active, created_at
                ))
                product_id = cursor.lastrowid
                conn.commit()
                cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
                new_row = dict(cursor.fetchone())
                conn.close()
                sync_json_files()
                self.send_json({"success": True, "product": new_row}, status=201)
            except sqlite3.IntegrityError:
                # slug collision, regenerate with suffix
                slug = f"{slug}-{int(time.time())}"
                cursor.execute("""
                    INSERT INTO products (
                        slug, title, price, currency, category, badge, short_desc, description,
                        image_url, download_url, contact_tg, is_active, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    slug, title, price, currency, category, badge, short_desc, description,
                    image_url, download_url, contact_tg, is_active, created_at
                ))
                product_id = cursor.lastrowid
                conn.commit()
                cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
                new_row = dict(cursor.fetchone())
                conn.close()
                sync_json_files()
                self.send_json({"success": True, "product": new_row}, status=201)
            return

        # API: Save Settings
        if path == "/api/settings":
            data = self.read_json()
            if not data:
                self.send_json({"error": "No data provided"}, status=400)
                return
            conn = get_db()
            cursor = conn.cursor()
            for k, v in data.items():
                cursor.execute("""
                    INSERT INTO settings (key, value) VALUES (?, ?)
                    ON CONFLICT(key) DO UPDATE SET value = excluded.value
                """, (str(k), str(v)))
            conn.commit()
            cursor.execute("SELECT key, value FROM settings")
            updated = {row["key"]: row["value"] for row in cursor.fetchall()}
            conn.close()
            sync_json_files()
            self.send_json({"success": True, "settings": updated})
            return

        # API: File / Image Upload (Base64 JSON payload)
        if path == "/api/upload":
            data = self.read_json()
            if not data or not data.get("file_data"):
                self.send_json({"error": "No file_data supplied"}, status=400)
                return

            try:
                file_str = data["file_data"]
                file_name = data.get("file_name", "image.jpg")
                ext = os.path.splitext(file_name)[1].lower()
                if not ext:
                    ext = ".jpg"

                # Check if data url format
                if "," in file_str:
                    header, base64_data = file_str.split(",", 1)
                else:
                    base64_data = file_str

                file_bytes = base64.b64decode(base64_data)
                unique_name = f"img_{int(time.time())}_{uuid.uuid4().hex[:6]}{ext}"
                target_path = os.path.join(UPLOADS_DIR, unique_name)

                with open(target_path, "wb") as f:
                    f.write(file_bytes)

                url = f"/uploads/{unique_name}"
                self.send_json({"success": True, "url": url})
            except Exception as e:
                self.send_json({"error": f"Upload error: {str(e)}"}, status=500)
            return

        self.send_error(404, "Endpoint not found")

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # API: Update Product
        if path.startswith("/api/products/"):
            identifier = path[len("/api/products/"):]
            data = self.read_json()
            if not data:
                self.send_json({"error": "No data provided"}, status=400)
                return

            conn = get_db()
            cursor = conn.cursor()
            if identifier.isdigit():
                cursor.execute("SELECT * FROM products WHERE id = ?", (int(identifier),))
            else:
                cursor.execute("SELECT * FROM products WHERE slug = ?", (identifier,))
            row = cursor.fetchone()
            if not row:
                conn.close()
                self.send_json({"error": "Product not found"}, status=404)
                return

            prod_id = row["id"]
            fields = ["title", "slug", "price", "currency", "category", "badge",
                      "short_desc", "description", "image_url", "download_url", "contact_tg", "is_active"]
            
            updates = []
            vals = []
            for f in fields:
                if f in data:
                    updates.append(f"{f} = ?")
                    vals.append(data[f])

            if updates:
                vals.append(prod_id)
                query = f"UPDATE products SET {', '.join(updates)} WHERE id = ?"
                cursor.execute(query, vals)
                conn.commit()

            cursor.execute("SELECT * FROM products WHERE id = ?", (prod_id,))
            updated_prod = dict(cursor.fetchone())
            conn.close()
            sync_json_files()
            self.send_json({"success": True, "product": updated_prod})
            return

        self.send_error(404, "Endpoint not found")

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # API: Delete Product
        if path.startswith("/api/products/"):
            identifier = path[len("/api/products/"):]
            conn = get_db()
            cursor = conn.cursor()
            if identifier.isdigit():
                cursor.execute("DELETE FROM products WHERE id = ?", (int(identifier),))
            else:
                cursor.execute("DELETE FROM products WHERE slug = ?", (identifier,))
            deleted = cursor.rowcount > 0
            conn.commit()
            conn.close()
            if deleted:
                sync_json_files()
                self.send_json({"success": True})
            else:
                self.send_json({"error": "Product not found"}, status=404)
            return

        self.send_error(404, "Endpoint not found")

    def read_json(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length == 0:
                return {}
            body = self.rfile.read(content_length)
            return json.loads(body.decode("utf-8"))
        except Exception:
            return {}

    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def serve_file(self, filepath):
        ctype, _ = mimetypes.guess_type(filepath)
        if not ctype:
            if filepath.endswith(".js"):
                ctype = "application/javascript"
            elif filepath.endswith(".css"):
                ctype = "text/css"
            elif filepath.endswith(".json"):
                ctype = "application/json"
            elif filepath.endswith(".svg"):
                ctype = "image/svg+xml"
            else:
                ctype = "application/octet-stream"

        try:
            with open(filepath, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", f"{ctype}; charset=utf-8" if "text" in ctype or "javascript" in ctype or "json" in ctype else ctype)
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error(500, f"Error reading file: {str(e)}")

def run_server(port=5000):
    init_db()
    server_address = ("0.0.0.0", port)
    httpd = ThreadingHTTPServer(server_address, StoreHTTPRequestHandler)
    print(f"=====================================================")
    print(f"  WebSell Store Server started successfully!")
    print(f"  Local URL:   http://localhost:{port}")
    print(f"  Tribute URL: http://localhost:{port}/p/ByO")
    print(f"=====================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()

if __name__ == "__main__":
    port = 5000
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])
    run_server(port)
