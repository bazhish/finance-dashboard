from __future__ import annotations

import math
import sqlite3
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
PUBLIC_DIR = BASE_DIR / "public"
DB_PATH = DATA_DIR / "finance.db"

DATA_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Ritmo Financeiro Pro", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def pad(value: int) -> str:
    return str(value).zfill(2)


def month_key_from_date(date_str: str) -> str:
    return date_str[:7]


def add_months(month_key: str, offset: int) -> str:
    year, month = [int(part) for part in month_key.split("-")]
    total_month = (year * 12 + (month - 1)) + offset
    new_year = total_month // 12
    new_month = total_month % 12 + 1
    return f"{new_year}-{pad(new_month)}"


def format_month_label(month_key: str) -> str:
    names = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    year, month = [int(part) for part in month_key.split("-")]
    return f"{names[month - 1]}/{str(year)[2:]}"


def get_current_month() -> str:
    from datetime import datetime
    return datetime.utcnow().strftime("%Y-%m")


def get_month_range(month_key: str) -> tuple[str, str]:
    year, month = [int(part) for part in month_key.split("-")]
    if month == 12:
        next_year, next_month = year + 1, 1
    else:
        next_year, next_month = year, month + 1

    from datetime import date, timedelta
    start = date(year, month, 1)
    end = date(next_year, next_month, 1) - timedelta(days=1)
    return start.isoformat(), end.isoformat()


def ensure_db() -> None:
    conn = get_connection()
    cur = conn.cursor()

    cur.executescript(
        """
        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          monthly_income REAL NOT NULL DEFAULT 0,
          daily_goal REAL NOT NULL DEFAULT 120,
          currency TEXT NOT NULL DEFAULT 'BRL'
        );

        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
          color TEXT NOT NULL DEFAULT '#9be768',
          icon TEXT DEFAULT '●',
          is_default INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS cards (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          brand TEXT NOT NULL,
          last_four TEXT NOT NULL,
          credit_limit REAL NOT NULL CHECK (credit_limit >= 0),
          closing_day INTEGER NOT NULL CHECK (closing_day BETWEEN 1 AND 31),
          due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
          color TEXT NOT NULL DEFAULT '#171717',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          amount REAL NOT NULL CHECK (amount > 0),
          type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
          category_id INTEGER,
          payment_method TEXT NOT NULL DEFAULT 'pix',
          transaction_date TEXT NOT NULL,
          notes TEXT DEFAULT '',
          card_id INTEGER,
          billing_month TEXT,
          installment_group TEXT,
          installment_number INTEGER,
          total_installments INTEGER,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(category_id) REFERENCES categories(id),
          FOREIGN KEY(card_id) REFERENCES cards(id)
        );
        """
    )

    cur.execute(
        """
        INSERT OR IGNORE INTO settings (id, monthly_income, daily_goal, currency)
        VALUES (1, 5500, 120, 'BRL')
        """
    )

    categories = [
        ("Salário", "income", "#9be768", "💼", 1),
        ("Freelance", "income", "#b8b8ff", "🧠", 1),
        ("Investimentos", "income", "#7cd992", "📈", 1),
        ("Moradia", "expense", "#ff8a80", "🏠", 1),
        ("Alimentação", "expense", "#ffd54f", "🍽️", 1),
        ("Mercado", "expense", "#ffcc80", "🛒", 1),
        ("Transporte", "expense", "#90caf9", "🚌", 1),
        ("Saúde", "expense", "#ef9a9a", "💊", 1),
        ("Educação", "expense", "#ce93d8", "📚", 1),
        ("Assinaturas", "expense", "#80cbc4", "📺", 1),
        ("Lazer", "expense", "#f48fb1", "🎮", 1),
        ("Contas", "expense", "#b0bec5", "💡", 1),
        ("Reserva", "expense", "#aed581", "💰", 1),
        ("Pets", "expense", "#bcaaa4", "🐶", 1),
        ("Presentes", "expense", "#ffab91", "🎁", 1),
        ("Outros", "expense", "#cfd8dc", "📌", 1),
    ]

    cur.executemany(
        """
        INSERT OR IGNORE INTO categories (name, type, color, icon, is_default)
        VALUES (?, ?, ?, ?, ?)
        """,
        categories,
    )

    cards_count = cur.execute("SELECT COUNT(*) AS total FROM cards").fetchone()["total"]
    if cards_count == 0:
        cur.executemany(
            """
            INSERT INTO cards (name, brand, last_four, credit_limit, closing_day, due_day, color)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            [
                ("Nubank Ultravioleta", "Mastercard", "4821", 4200, 7, 14, "#5b3df5"),
                ("Inter Gold", "Visa", "1940", 2600, 25, 5, "#ffb300"),
            ],
        )

    tx_count = cur.execute("SELECT COUNT(*) AS total FROM transactions").fetchone()["total"]
    conn.commit()
    conn.close()

    if tx_count == 0:
        seed_demo_data()


def row_to_dict(row: sqlite3.Row | None) -> Optional[dict]:
    return dict(row) if row is not None else None


def get_settings() -> dict:
    conn = get_connection()
    row = conn.execute("SELECT * FROM settings WHERE id = 1").fetchone()
    conn.close()
    return dict(row)


def list_categories() -> list[dict]:
    conn = get_connection()
    rows = conn.execute("SELECT * FROM categories ORDER BY type ASC, name ASC").fetchall()
    conn.close()
    return [dict(row) for row in rows]


def list_cards() -> list[dict]:
    conn = get_connection()
    rows = conn.execute("SELECT * FROM cards ORDER BY created_at ASC, id ASC").fetchall()
    conn.close()
    return [dict(row) for row in rows]


def list_transactions(month: Optional[str] = None) -> list[dict]:
    conn = get_connection()
    params: list[str] = []
    where = ""
    if month:
        where = "WHERE COALESCE(t.billing_month, substr(t.transaction_date, 1, 7)) = ?"
        params.append(month)

    rows = conn.execute(
        f"""
        SELECT t.*, c.name AS category_name, c.color AS category_color, cards.name AS card_name
        FROM transactions t
        LEFT JOIN categories c ON c.id = t.category_id
        LEFT JOIN cards ON cards.id = t.card_id
        {where}
        ORDER BY t.transaction_date DESC, t.id DESC
        LIMIT 100
        """,
        params,
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_cards_summary(month: str) -> list[dict]:
    conn = get_connection()
    cards = conn.execute("SELECT * FROM cards ORDER BY created_at ASC, id ASC").fetchall()
    result: list[dict] = []

    for card in cards:
        invoice = conn.execute(
            """
            SELECT COALESCE(SUM(amount), 0) AS total
            FROM transactions
            WHERE type = 'expense'
              AND card_id = ?
              AND COALESCE(billing_month, substr(transaction_date, 1, 7)) = ?
            """,
            (card["id"], month),
        ).fetchone()["total"]

        groups = conn.execute(
            """
            SELECT installment_group
            FROM transactions
            WHERE card_id = ?
              AND installment_group IS NOT NULL
            GROUP BY installment_group
            """,
            (card["id"],),
        ).fetchall()

        active_installments: list[dict] = []
        for group in groups:
            current_row = conn.execute(
                """
                SELECT installment_number, total_installments, title, amount, billing_month
                FROM transactions
                WHERE card_id = ?
                  AND installment_group = ?
                  AND billing_month = ?
                LIMIT 1
                """,
                (card["id"], group["installment_group"], month),
            ).fetchone()

            if current_row:
                active_installments.append(
                    {
                        "title": current_row["title"],
                        "installmentLabel": f'{current_row["installment_number"]}/{current_row["total_installments"]}',
                        "remaining": current_row["total_installments"] - current_row["installment_number"],
                        "amount": round(float(current_row["amount"]), 2),
                    }
                )
                continue

            future_count = conn.execute(
                """
                SELECT COUNT(*) AS total
                FROM transactions
                WHERE card_id = ?
                  AND installment_group = ?
                  AND billing_month >= ?
                """,
                (card["id"], group["installment_group"], month),
            ).fetchone()["total"]

            if future_count == 0:
                continue

            sample = conn.execute(
                """
                SELECT title, amount
                FROM transactions
                WHERE card_id = ?
                  AND installment_group = ?
                ORDER BY billing_month ASC
                LIMIT 1
                """,
                (card["id"], group["installment_group"]),
            ).fetchone()

            active_installments.append(
                {
                    "title": sample["title"],
                    "installmentLabel": "À frente",
                    "remaining": future_count,
                    "amount": round(float(sample["amount"]), 2),
                }
            )

        card_dict = dict(card)
        card_dict["invoice"] = round(float(invoice), 2)
        card_dict["availableCredit"] = round(float(card["credit_limit"] - invoice), 2)
        card_dict["activeInstallmentsCount"] = len(active_installments)
        card_dict["activeInstallments"] = active_installments
        result.append(card_dict)

    conn.close()
    return result


def get_dashboard(month: str) -> dict:
    conn = get_connection()
    settings = get_settings()

    totals = conn.execute(
        """
        SELECT
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) AS inflow,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS outflow
        FROM transactions
        WHERE COALESCE(billing_month, substr(transaction_date, 1, 7)) = ?
        """,
        (month,),
    ).fetchone()

    category_breakdown = conn.execute(
        """
        SELECT c.name, c.color, COALESCE(SUM(t.amount), 0) AS total
        FROM transactions t
        LEFT JOIN categories c ON c.id = t.category_id
        WHERE t.type = 'expense'
          AND COALESCE(t.billing_month, substr(t.transaction_date, 1, 7)) = ?
        GROUP BY c.name, c.color
        HAVING total > 0
        ORDER BY total DESC
        """,
        (month,),
    ).fetchall()

    months = [add_months(month, idx - 5) for idx in range(6)]
    monthly_trend: list[dict] = []
    for month_key in months:
        row = conn.execute(
            """
            SELECT
              COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) AS inflow,
              COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS outflow
            FROM transactions
            WHERE COALESCE(billing_month, substr(transaction_date, 1, 7)) = ?
            """,
            (month_key,),
        ).fetchone()

        inflow = round(float(row["inflow"]), 2)
        outflow = round(float(row["outflow"]), 2)
        monthly_trend.append(
            {
                "month": month_key,
                "label": format_month_label(month_key),
                "inflow": inflow,
                "outflow": outflow,
                "net": round(inflow - outflow, 2),
            }
        )

    recent_transactions = conn.execute(
        """
        SELECT t.*, c.name AS category_name, c.color AS category_color, cards.name AS card_name
        FROM transactions t
        LEFT JOIN categories c ON c.id = t.category_id
        LEFT JOIN cards ON cards.id = t.card_id
        ORDER BY t.transaction_date DESC, t.id DESC
        LIMIT 12
        """
    ).fetchall()

    conn.close()

    inflow = round(float(totals["inflow"]), 2)
    outflow = round(float(totals["outflow"]), 2)

    return {
        "month": month,
        "monthlyIncome": settings["monthly_income"],
        "inflow": inflow,
        "outflow": outflow,
        "balance": round(float(settings["monthly_income"]) + inflow - outflow, 2),
        "categoryBreakdown": [dict(row) for row in category_breakdown],
        "monthlyTrend": monthly_trend,
        "recentTransactions": [dict(row) for row in recent_transactions],
    }


def get_goals(month: str) -> dict:
    settings = get_settings()
    start, end = get_month_range(month)
    year, month_num = [int(part) for part in month.split("-")]

    from calendar import monthrange
    total_days = monthrange(year, month_num)[1]

    conn = get_connection()
    rows = conn.execute(
        """
        SELECT substr(transaction_date, 9, 2) AS day, COALESCE(SUM(amount), 0) AS total
        FROM transactions
        WHERE type = 'expense'
          AND transaction_date BETWEEN ? AND ?
          AND (billing_month IS NULL OR billing_month = ?)
        GROUP BY day
        """,
        (start, end, month),
    ).fetchall()
    conn.close()

    day_map = {int(row["day"]): float(row["total"]) for row in rows}
    days: list[dict] = []
    for day in range(1, total_days + 1):
        spent = round(day_map.get(day, 0.0), 2)
        remaining = round(float(settings["daily_goal"]) - spent, 2)
        progress = min(100.0, (spent / float(settings["daily_goal"])) * 100) if settings["daily_goal"] > 0 else 0.0
        status = "over" if spent > settings["daily_goal"] else ("empty" if spent == 0 else "ok")
        days.append(
            {
                "day": day,
                "spent": spent,
                "remaining": remaining,
                "progress": progress,
                "status": status,
            }
        )

    return {
        "month": month,
        "dailyGoal": float(settings["daily_goal"]),
        "days": days,
    }


def seed_demo_data() -> None:
    conn = get_connection()
    categories = conn.execute("SELECT * FROM categories").fetchall()
    cards = conn.execute("SELECT * FROM cards ORDER BY id ASC").fetchall()

    def category_id(name: str, type_name: str) -> int:
        for item in categories:
            if item["name"] == name and item["type"] == type_name:
                return int(item["id"])
        raise RuntimeError(f"Categoria não encontrada: {name}/{type_name}")

    nubank_id = cards[0]["id"] if cards else None
    inter_id = cards[1]["id"] if len(cards) > 1 else None

    rows = [
        ("Salário principal", 5500, "income", category_id("Salário", "income"), "transferência", "2026-03-05", "Salário do mês", None, None, None, None, None),
        ("Freela landing page", 850, "income", category_id("Freelance", "income"), "pix", "2026-03-12", "", None, None, None, None, None),
        ("Aluguel", 1400, "expense", category_id("Moradia", "expense"), "pix", "2026-03-05", "", None, None, None, None, None),
        ("Mercado atacado", 620, "expense", category_id("Mercado", "expense"), "débito", "2026-03-09", "", None, None, None, None, None),
        ("Uber e metrô", 180, "expense", category_id("Transporte", "expense"), "pix", "2026-03-15", "", None, None, None, None, None),
        ("Curso online", 120, "expense", category_id("Educação", "expense"), "pix", "2026-03-11", "", None, None, None, None, None),
        ("Netflix + Spotify", 64, "expense", category_id("Assinaturas", "expense"), "crédito", "2026-03-08", "", nubank_id, "2026-03", None, None, None),
        ("Jantar", 95, "expense", category_id("Alimentação", "expense"), "crédito", "2026-03-17", "", inter_id, "2026-03", None, None, None),
        ("Consulta", 210, "expense", category_id("Saúde", "expense"), "pix", "2026-03-18", "", None, None, None, None, None),
        ("Reserva investimento", 300, "expense", category_id("Reserva", "expense"), "transferência", "2026-03-19", "", None, None, None, None, None),
    ]

    conn.executemany(
        """
        INSERT INTO transactions
          (title, amount, type, category_id, payment_method, transaction_date, notes, card_id, billing_month, installment_group, installment_number, total_installments)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        rows,
    )

    def create_installments(card_id: int, title: str, total_amount: float, installments: int, start_month: str, purchase_date: str, category: int) -> None:
        group = f"{card_id}-{title}-{start_month}"
        amount_per = round(total_amount / installments, 2)
        for number in range(1, installments + 1):
            conn.execute(
                """
                INSERT INTO transactions
                  (title, amount, type, category_id, payment_method, transaction_date, notes, card_id, billing_month, installment_group, installment_number, total_installments)
                VALUES (?, ?, 'expense', ?, 'crédito', ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    title,
                    amount_per,
                    category,
                    purchase_date,
                    f"Compra parcelada {number}/{installments}",
                    card_id,
                    add_months(start_month, number - 1),
                    group,
                    number,
                    installments,
                ),
            )

    if nubank_id:
        create_installments(nubank_id, "Notebook para estudos", 2400, 8, "2026-01", "2026-01-10", category_id("Educação", "expense"))
    if inter_id:
        create_installments(inter_id, "Tênis", 540, 3, "2026-02", "2026-02-22", category_id("Lazer", "expense"))

    conn.commit()
    conn.close()


ensure_db()

class SettingsPayload(BaseModel):
    monthlyIncome: Optional[float] = Field(default=None, ge=0)
    dailyGoal: Optional[float] = Field(default=None, gt=0)


class CategoryPayload(BaseModel):
    name: str
    type: str = "expense"
    color: str = "#9be768"
    icon: str = "●"


class TransactionPayload(BaseModel):
    title: str
    amount: float = Field(gt=0)
    type: str = "expense"
    categoryId: Optional[int] = None
    paymentMethod: str = "pix"
    transactionDate: str
    notes: str = ""
    cardId: Optional[int] = None
    billingMonth: Optional[str] = None


class CardPayload(BaseModel):
    name: str
    brand: str
    lastFour: str
    creditLimit: float = Field(ge=0)
    closingDay: int = Field(ge=1, le=31)
    dueDay: int = Field(ge=1, le=31)
    color: str = "#171717"


class InstallmentPayload(BaseModel):
    title: str
    categoryId: Optional[int] = None
    totalAmount: float = Field(gt=0)
    totalInstallments: int = Field(ge=2, le=24)
    purchaseDate: str
    notes: str = ""




@app.get("/api/health")
def health() -> dict:
    return {"ok": True}


@app.get("/api/bootstrap")
def bootstrap(month: Optional[str] = None) -> dict:
    month_key = month or get_current_month()
    return {
        "settings": get_settings(),
        "categories": list_categories(),
        "cards": get_cards_summary(month_key),
        "transactions": list_transactions(month_key),
        "dashboard": get_dashboard(month_key),
    }


@app.get("/api/goals")
def goals(month: Optional[str] = None) -> dict:
    return get_goals(month or get_current_month())


@app.get("/api/cards")
def cards(month: Optional[str] = None) -> list[dict]:
    return get_cards_summary(month or get_current_month())


@app.post("/api/settings")
def save_settings(payload: SettingsPayload) -> dict:
    current = get_settings()
    monthly_income = payload.monthlyIncome if payload.monthlyIncome is not None else current["monthly_income"]
    daily_goal = payload.dailyGoal if payload.dailyGoal is not None else current["daily_goal"]

    conn = get_connection()
    conn.execute(
        """
        UPDATE settings
        SET monthly_income = ?, daily_goal = ?
        WHERE id = 1
        """,
        (monthly_income, daily_goal),
    )
    conn.commit()
    conn.close()
    return get_settings()


@app.post("/api/categories")
def create_category(payload: CategoryPayload) -> dict:
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Nome da categoria é obrigatório.")

    type_name = "income" if payload.type == "income" else "expense"

    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO categories (name, type, color, icon, is_default)
            VALUES (?, ?, ?, ?, 0)
            """,
            (name, type_name, payload.color.strip() or "#9be768", payload.icon.strip() or "●"),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM categories WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return dict(row)
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Categoria já existe ou é inválida.")
    finally:
        conn.close()


@app.post("/api/transactions")
def create_transaction(payload: TransactionPayload) -> dict:
    if len(payload.transactionDate) != 10:
        raise HTTPException(status_code=400, detail="Data inválida.")

    conn = get_connection()
    cursor = conn.execute(
        """
        INSERT INTO transactions
          (title, amount, type, category_id, payment_method, transaction_date, notes, card_id, billing_month, installment_group, installment_number, total_installments)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL)
        """,
        (
            payload.title.strip(),
            payload.amount,
            "income" if payload.type == "income" else "expense",
            payload.categoryId,
            payload.paymentMethod.strip(),
            payload.transactionDate,
            payload.notes.strip(),
            payload.cardId,
            payload.billingMonth.strip() if payload.billingMonth else None,
        ),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM transactions WHERE id = ?", (cursor.lastrowid,)).fetchone()
    conn.close()
    return dict(row)


@app.post("/api/cards")
def create_card(payload: CardPayload) -> dict:
    conn = get_connection()
    cursor = conn.execute(
        """
        INSERT INTO cards (name, brand, last_four, credit_limit, closing_day, due_day, color)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payload.name.strip(),
            payload.brand.strip(),
            payload.lastFour.strip(),
            payload.creditLimit,
            payload.closingDay,
            payload.dueDay,
            payload.color.strip() or "#171717",
        ),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM cards WHERE id = ?", (cursor.lastrowid,)).fetchone()
    conn.close()
    return dict(row)


@app.post("/api/cards/{card_id}/installments")
def create_installments(card_id: int, payload: InstallmentPayload) -> dict:
    if len(payload.purchaseDate) != 10:
        raise HTTPException(status_code=400, detail="Data da compra inválida.")

    conn = get_connection()
    card = conn.execute("SELECT * FROM cards WHERE id = ?", (card_id,)).fetchone()
    if not card:
        conn.close()
        raise HTTPException(status_code=404, detail="Cartão não encontrado.")

    group = f"{card_id}-{payload.title.strip()}-{payload.purchaseDate}"
    base_month = month_key_from_date(payload.purchaseDate)
    amount_per = round(payload.totalAmount / payload.totalInstallments, 2)

    for number in range(1, payload.totalInstallments + 1):
        conn.execute(
            """
            INSERT INTO transactions
              (title, amount, type, category_id, payment_method, transaction_date, notes, card_id, billing_month, installment_group, installment_number, total_installments)
            VALUES (?, ?, 'expense', ?, 'crédito', ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.title.strip(),
                amount_per,
                payload.categoryId,
                payload.purchaseDate,
                payload.notes.strip(),
                card_id,
                add_months(base_month, number - 1),
                group,
                number,
                payload.totalInstallments,
            ),
        )

    conn.commit()
    rows = conn.execute(
        """
        SELECT *
        FROM transactions
        WHERE installment_group = ?
        ORDER BY installment_number ASC
        """,
        (group,),
    ).fetchall()
    conn.close()
    return {
        "createdInstallments": len(rows),
        "group": group,
        "rows": [dict(row) for row in rows],
    }


@app.delete("/api/transactions/{transaction_id}")
def delete_transaction(transaction_id: int) -> dict:
    conn = get_connection()
    tx = conn.execute("SELECT * FROM transactions WHERE id = ?", (transaction_id,)).fetchone()
    if not tx:
        conn.close()
        raise HTTPException(status_code=404, detail="Lançamento não encontrado.")

    if tx["installment_group"]:
        conn.execute("DELETE FROM transactions WHERE installment_group = ?", (tx["installment_group"],))
        conn.commit()
        conn.close()
        return {"deletedGroup": True}

    conn.execute("DELETE FROM transactions WHERE id = ?", (transaction_id,))
    conn.commit()
    conn.close()
    return {"deleted": True}


@app.get("/")
def index() -> FileResponse:
    return FileResponse(PUBLIC_DIR / "index.html")


@app.get("/metas")
def metas() -> FileResponse:
    return FileResponse(PUBLIC_DIR / "metas.html")


app.mount("/", StaticFiles(directory=PUBLIC_DIR, html=True), name="public")
