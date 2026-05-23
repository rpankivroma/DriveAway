# Database Migrations (Alembic)

This directory contains the database migration scripts for the DriveAway platform.

## 🛠️ Configuration

The migrations are configured to connect **only** to your **XAMPP MySQL server**.
The connection settings are strictly loaded from the **`.env.example`** file in the `backend/` directory.

### Required variables in `.env.example`:
- `DB_USER`: Your MySQL username (e.g., `root`)
- `DB_PASSWORD`: Your MySQL password (can be empty)
- `DB_HOST`: Your MySQL host (e.g., `127.0.0.1`)
- `DB_PORT`: Your MySQL port (e.g., `3306`)
- `DB_NAME`: Your database name (e.g., `car_sharing`)

## 🚀 Commands

Run these commands from the **project root** directory:

### 1. Apply all pending migrations
Recreates the schema in your XAMPP database.
```bash
alembic upgrade head
```

### 2. Create a new migration
Automatically detects changes in `backend/models.py` and generates a new script.
```bash
alembic revision --autogenerate -m "description of changes"
```

### 3. Rollback the last migration
```bash
alembic downgrade -1
```

### 4. Check current migration status
```bash
alembic current
```

## 📂 Structure
- `env.py`: Configuration script that runs every time Alembic is invoked.
- `script.py.mako`: Template for new migration files.
- `versions/`: Directory containing individual migration scripts (e.g., `0001_initial_schema.py`).
