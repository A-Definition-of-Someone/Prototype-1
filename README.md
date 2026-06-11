# 🧩 Phantom Chess — Django Project on Azure

A humble Django-based web application designed for deployment on Microsoft Azure. This project integrates Azure Cache for Redis and is structured for scalable, secure cloud hosting.

## 🚀 Features

- Django backend with modular app structure
- Azure-ready configuration for seamless deployment
- Redis caching via Azure Cache for Redis
- Gimmick where the Chess Pieces can Disappear or Betray their owners, so its gonna be a bit chaotic or a letdown depending who's on the receiving end haha.

## ⚠️ Limitations
- Matchmaking works but live chess movements are not implemented.
- Chess logic does not encompass all cases.

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/phantom-chess.git
cd phantom-chess
```

### 2. Migrate the Database
On First Startup, Database needs to be migrated or error will occur.
```bash
python manage.py migrate
```

### 3. Run Collecstatic to generate static files if needed
```bash
python manage.py collectstatic
```
