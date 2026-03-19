import os
import uuid
import subprocess
import tempfile
import shutil
import sqlite3
from datetime import datetime
from pathlib import Path
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

ENABLE_WHISPER = os.getenv("ENABLE_WHISPER", "false").lower() == "true"

if ENABLE_WHISPER:
    import ctypes
    import whisper

    def short_path(long_path: str) -> str:
        buf = ctypes.create_unicode_buffer(512)
        ctypes.windll.kernel32.GetShortPathNameW(long_path, buf, 512)
        return buf.value or long_path

    FFMPEG_LONG = r"C:\Users\Fábio Amado\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin\ffmpeg.exe"
    FFMPEG_PATH = short_path(FFMPEG_LONG)
    FFMPEG_DIR  = short_path(str(Path(FFMPEG_LONG).parent))
    os.environ["PATH"] = FFMPEG_DIR + os.pathsep + os.environ.get("PATH", "")
    model = whisper.load_model("tiny")

DB_PATH    = Path(os.getenv("DB_PATH", "C:/SubGenTemp/gestao.db"))
TEMP_DIR   = Path(os.getenv("TEMP_DIR", "C:/SubGenTemp"))
OUTPUT_DIR = TEMP_DIR / "output"
TEMP_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)
tempfile.tempdir = str(TEMP_DIR)

def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS luz_entries (
            id    INTEGER PRIMARY KEY AUTOINCREMENT,
            date  TEXT    NOT NULL,
            value REAL    NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS agua_entries (
            id    INTEGER PRIMARY KEY AUTOINCREMENT,
            date  TEXT    NOT NULL,
            value REAL    NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS gas_entries (
            id    INTEGER PRIMARY KEY AUTOINCREMENT,
            date  TEXT    NOT NULL,
            value REAL    NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS prestacao_entries (
            id    INTEGER PRIMARY KEY AUTOINCREMENT,
            date  TEXT    NOT NULL,
            value REAL    NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS televisao_entries (
            id    INTEGER PRIMARY KEY AUTOINCREMENT,
            date  TEXT    NOT NULL,
            value REAL    NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS compras (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT    NOT NULL,
            quantity   TEXT    NOT NULL DEFAULT '',
            done       INTEGER NOT NULL DEFAULT 0,
            created_at TEXT    NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS ordenado_entries (
            id    INTEGER PRIMARY KEY AUTOINCREMENT,
            date  TEXT    NOT NULL,
            value REAL    NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS compras_entries (
            id    INTEGER PRIMARY KEY AUTOINCREMENT,
            date  TEXT    NOT NULL,
            store TEXT    NOT NULL,
            value REAL    NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()

if ENABLE_WHISPER:
    print(f"FFmpeg (curto):  {FFMPEG_PATH}")
    print(f"FFmpeg dir PATH: {FFMPEG_DIR}")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://192.168.1.9:5173,capacitor://localhost,http://localhost").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

if ENABLE_WHISPER:
    model = whisper.load_model("tiny")


class LuzEntry(BaseModel):
    date: str
    value: float


class ComprasEntry(BaseModel):
    date: str
    store: str
    value: float


def _update_bill(table: str, entry_id: int, entry: LuzEntry):
    conn = get_db()
    result = conn.execute(
        f"UPDATE {table} SET date = ?, value = ? WHERE id = ?",
        (entry.date, entry.value, entry_id),
    )
    conn.commit()
    if result.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Registo não encontrado.")
    row = conn.execute(f"SELECT * FROM {table} WHERE id = ?", (entry_id,)).fetchone()
    conn.close()
    return dict(row)


@app.get("/luz")
def list_luz():
    conn = get_db()
    rows = conn.execute("SELECT * FROM luz_entries ORDER BY date DESC").fetchall()
    conn.close()
    return [dict(row) for row in rows]


@app.post("/luz", status_code=201)
def add_luz(entry: LuzEntry):
    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO luz_entries (date, value) VALUES (?, ?)",
        (entry.date, entry.value),
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"id": new_id, "date": entry.date, "value": entry.value}


@app.delete("/luz/{entry_id}")
def delete_luz(entry_id: int):
    conn = get_db()
    result = conn.execute("DELETE FROM luz_entries WHERE id = ?", (entry_id,))
    conn.commit()
    conn.close()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Registo não encontrado.")
    return {"detail": "Registo apagado."}


@app.patch("/luz/{entry_id}")
def update_luz(entry_id: int, entry: LuzEntry):
    return _update_bill("luz_entries", entry_id, entry)


@app.get("/agua")
def list_agua():
    conn = get_db()
    rows = conn.execute("SELECT * FROM agua_entries ORDER BY date DESC").fetchall()
    conn.close()
    return [dict(row) for row in rows]


@app.post("/agua", status_code=201)
def add_agua(entry: LuzEntry):
    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO agua_entries (date, value) VALUES (?, ?)",
        (entry.date, entry.value),
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"id": new_id, "date": entry.date, "value": entry.value}


@app.delete("/agua/{entry_id}")
def delete_agua(entry_id: int):
    conn = get_db()
    result = conn.execute("DELETE FROM agua_entries WHERE id = ?", (entry_id,))
    conn.commit()
    conn.close()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Registo não encontrado.")
    return {"detail": "Registo apagado."}


@app.patch("/agua/{entry_id}")
def update_agua(entry_id: int, entry: LuzEntry):
    return _update_bill("agua_entries", entry_id, entry)


@app.get("/gas")
def list_gas():
    conn = get_db()
    rows = conn.execute("SELECT * FROM gas_entries ORDER BY date DESC").fetchall()
    conn.close()
    return [dict(row) for row in rows]


@app.post("/gas", status_code=201)
def add_gas(entry: LuzEntry):
    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO gas_entries (date, value) VALUES (?, ?)",
        (entry.date, entry.value),
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"id": new_id, "date": entry.date, "value": entry.value}


@app.delete("/gas/{entry_id}")
def delete_gas(entry_id: int):
    conn = get_db()
    result = conn.execute("DELETE FROM gas_entries WHERE id = ?", (entry_id,))
    conn.commit()
    conn.close()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Registo não encontrado.")
    return {"detail": "Registo apagado."}


@app.patch("/gas/{entry_id}")
def update_gas(entry_id: int, entry: LuzEntry):
    return _update_bill("gas_entries", entry_id, entry)


@app.get("/prestacao")
def list_prestacao():
    conn = get_db()
    rows = conn.execute("SELECT * FROM prestacao_entries ORDER BY date DESC").fetchall()
    conn.close()
    return [dict(row) for row in rows]


@app.post("/prestacao", status_code=201)
def add_prestacao(entry: LuzEntry):
    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO prestacao_entries (date, value) VALUES (?, ?)",
        (entry.date, entry.value),
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"id": new_id, "date": entry.date, "value": entry.value}


@app.delete("/prestacao/{entry_id}")
def delete_prestacao(entry_id: int):
    conn = get_db()
    result = conn.execute("DELETE FROM prestacao_entries WHERE id = ?", (entry_id,))
    conn.commit()
    conn.close()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Registo não encontrado.")
    return {"detail": "Registo apagado."}


@app.patch("/prestacao/{entry_id}")
def update_prestacao(entry_id: int, entry: LuzEntry):
    return _update_bill("prestacao_entries", entry_id, entry)


@app.get("/televisao")
def list_televisao():
    conn = get_db()
    rows = conn.execute("SELECT * FROM televisao_entries ORDER BY date DESC").fetchall()
    conn.close()
    return [dict(row) for row in rows]


@app.post("/televisao", status_code=201)
def add_televisao(entry: LuzEntry):
    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO televisao_entries (date, value) VALUES (?, ?)",
        (entry.date, entry.value),
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"id": new_id, "date": entry.date, "value": entry.value}


@app.delete("/televisao/{entry_id}")
def delete_televisao(entry_id: int):
    conn = get_db()
    result = conn.execute("DELETE FROM televisao_entries WHERE id = ?", (entry_id,))
    conn.commit()
    conn.close()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Registo não encontrado.")
    return {"detail": "Registo apagado."}


@app.patch("/televisao/{entry_id}")
def update_televisao(entry_id: int, entry: LuzEntry):
    return _update_bill("televisao_entries", entry_id, entry)


@app.get("/ordenado")
def list_ordenado():
    conn = get_db()
    rows = conn.execute("SELECT * FROM ordenado_entries ORDER BY date DESC").fetchall()
    conn.close()
    return [dict(row) for row in rows]


@app.post("/ordenado", status_code=201)
def add_ordenado(entry: LuzEntry):
    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO ordenado_entries (date, value) VALUES (?, ?)",
        (entry.date, entry.value),
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"id": new_id, "date": entry.date, "value": entry.value}


@app.patch("/ordenado/{entry_id}")
def update_ordenado(entry_id: int, entry: LuzEntry):
    return _update_bill("ordenado_entries", entry_id, entry)


@app.delete("/ordenado/{entry_id}")
def delete_ordenado(entry_id: int):
    conn = get_db()
    result = conn.execute("DELETE FROM ordenado_entries WHERE id = ?", (entry_id,))
    conn.commit()
    conn.close()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Registo não encontrado.")
    return {"detail": "Registo apagado."}


@app.get("/compras_entries")
def list_compras_entries():
    conn = get_db()
    rows = conn.execute("SELECT * FROM compras_entries ORDER BY date DESC").fetchall()
    conn.close()
    return [dict(row) for row in rows]


@app.post("/compras_entries", status_code=201)
def add_compras_entry(entry: ComprasEntry):
    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO compras_entries (date, store, value) VALUES (?, ?, ?)",
        (entry.date, entry.store, entry.value),
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"id": new_id, "date": entry.date, "store": entry.store, "value": entry.value}


@app.patch("/compras_entries/{entry_id}")
def update_compras_entry(entry_id: int, entry: ComprasEntry):
    conn = get_db()
    result = conn.execute(
        "UPDATE compras_entries SET date = ?, store = ?, value = ? WHERE id = ?",
        (entry.date, entry.store, entry.value, entry_id),
    )
    conn.commit()
    if result.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Registo não encontrado.")
    row = conn.execute("SELECT * FROM compras_entries WHERE id = ?", (entry_id,)).fetchone()
    conn.close()
    return dict(row)


@app.delete("/compras_entries/{entry_id}")
def delete_compras_entry(entry_id: int):
    conn = get_db()
    result = conn.execute("DELETE FROM compras_entries WHERE id = ?", (entry_id,))
    conn.commit()
    conn.close()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Registo não encontrado.")
    return {"detail": "Registo apagado."}


class CompraItem(BaseModel):
    name: str
    quantity: str = ''


@app.get("/compras")
def list_compras():
    conn = get_db()
    rows = conn.execute("SELECT * FROM compras ORDER BY done ASC, created_at DESC").fetchall()
    conn.close()
    return [dict(row) for row in rows]


@app.post("/compras", status_code=201)
def add_compra(item: CompraItem):
    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO compras (name, quantity, done, created_at) VALUES (?, ?, 0, ?)",
        (item.name.strip(), item.quantity.strip(), datetime.now().isoformat()),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM compras WHERE id = ?", (cursor.lastrowid,)).fetchone()
    conn.close()
    return dict(row)


@app.patch("/compras/{item_id}/toggle")
def toggle_compra(item_id: int):
    conn = get_db()
    conn.execute("UPDATE compras SET done = 1 - done WHERE id = ?", (item_id,))
    conn.commit()
    row = conn.execute("SELECT * FROM compras WHERE id = ?", (item_id,)).fetchone()
    conn.close()
    if row is None:
        raise HTTPException(status_code=404, detail="Item não encontrado.")
    return dict(row)


@app.delete("/compras/{item_id}")
def delete_compra(item_id: int):
    conn = get_db()
    result = conn.execute("DELETE FROM compras WHERE id = ?", (item_id,))
    conn.commit()
    conn.close()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Item não encontrado.")
    return {"detail": "Item apagado."}


def format_timestamp(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds % 1) * 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def segments_to_srt(segments) -> str:
    lines = []
    for i, seg in enumerate(segments, start=1):
        start = format_timestamp(seg["start"])
        end = format_timestamp(seg["end"])
        lines.append(f"{i}\n{start} --> {end}\n{seg['text'].strip()}\n")
    return "\n".join(lines)


def cleanup_tmp(tmp_dir: Path):
    shutil.rmtree(tmp_dir, ignore_errors=True)


@app.post("/upload")
async def upload(file: UploadFile = File(...), language: str = Form(None)):
    if not ENABLE_WHISPER:
        raise HTTPException(status_code=503, detail="Geração de legendas não disponível neste servidor.")
    if not file.filename.lower().endswith(".mkv"):
        raise HTTPException(status_code=400, detail="Apenas ficheiros .mkv são suportados.")

    tmp_dir  = Path(tempfile.mkdtemp())
    mkv_path = tmp_dir / f"{uuid.uuid4()}.mkv"
    wav_path = tmp_dir / "audio.wav"
    mkv_stem = Path(file.filename).stem

    try:
        mkv_path.write_bytes(await file.read())

        result = subprocess.run(
            [FFMPEG_PATH, "-i", str(mkv_path), "-vn", "-ar", "16000", "-ac", "1", str(wav_path)],
            capture_output=True,
            encoding="utf-8",
            errors="replace",
        )
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail="Erro ao extrair áudio com FFmpeg.")

        transcribe_opts = {"language": language} if language else {}
        transcription = model.transcribe(str(wav_path), **transcribe_opts)
        detected_language = transcription.get("language", "und")
        out_path = OUTPUT_DIR / f"{mkv_stem}_{detected_language}.srt"
        out_path.write_text(segments_to_srt(transcription["segments"]), encoding="utf-8")

    finally:
        cleanup_tmp(tmp_dir)

    return FileResponse(str(out_path), media_type="text/plain", filename=out_path.name)


@app.post("/embed")
async def embed(mkv: UploadFile = File(...), srt: UploadFile = File(...)):
    if not ENABLE_WHISPER:
        raise HTTPException(status_code=503, detail="Incorporação de legendas não disponível neste servidor.")
    if not mkv.filename.lower().endswith(".mkv"):
        raise HTTPException(status_code=400, detail="O primeiro ficheiro deve ser .mkv.")
    if not srt.filename.lower().endswith(".srt"):
        raise HTTPException(status_code=400, detail="O segundo ficheiro deve ser .srt.")

    tmp_dir  = Path(tempfile.mkdtemp())
    mkv_path = tmp_dir / f"{uuid.uuid4()}.mkv"
    srt_path = tmp_dir / "legendas.srt"
    out_path = unique_output_path("video_legendado.mkv")

    try:
        mkv_path.write_bytes(await mkv.read())
        srt_path.write_bytes(await srt.read())

        result = subprocess.run(
            [FFMPEG_PATH, "-i", str(mkv_path), "-i", str(srt_path),
             "-c", "copy", "-c:s", "srt", str(out_path)],
            capture_output=True,
            encoding="utf-8",
            errors="replace",
        )
        if result.returncode != 0:
            print(f"FFmpeg stderr: {result.stderr}")
            raise HTTPException(status_code=500, detail="Erro ao incorporar as legendas.")

    finally:
        cleanup_tmp(tmp_dir)

    return FileResponse(str(out_path), media_type="video/x-matroska", filename=out_path.name)


@app.get("/files")
async def list_files():
    if not ENABLE_WHISPER:
        return []
    files = []
    for f in sorted(OUTPUT_DIR.iterdir(), key=lambda x: x.stat().st_mtime, reverse=True):
        if f.is_file():
            stat = f.stat()
            files.append({
                "name": f.name,
                "size": stat.st_size,
                "created_at": datetime.fromtimestamp(stat.st_mtime).strftime("%d/%m/%Y %H:%M"),
            })
    return files


@app.delete("/files/{filename}")
async def delete_file(filename: str):
    file_path = OUTPUT_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Ficheiro não encontrado.")
    if file_path.parent != OUTPUT_DIR:
        raise HTTPException(status_code=400, detail="Operação não permitida.")
    file_path.unlink()
    return {"detail": "Ficheiro apagado."}
