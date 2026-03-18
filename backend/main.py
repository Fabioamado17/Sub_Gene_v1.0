import os
import uuid
import subprocess
import tempfile
import ctypes
import shutil
import sqlite3
import whisper
from datetime import datetime
from pathlib import Path
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

def short_path(long_path: str) -> str:
    buf = ctypes.create_unicode_buffer(512)
    ctypes.windll.kernel32.GetShortPathNameW(long_path, buf, 512)
    return buf.value or long_path


FFMPEG_LONG = r"C:\Users\Fábio Amado\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin\ffmpeg.exe"
FFMPEG_PATH = short_path(FFMPEG_LONG)
FFMPEG_DIR  = short_path(str(Path(FFMPEG_LONG).parent))

os.environ["PATH"] = FFMPEG_DIR + os.pathsep + os.environ.get("PATH", "")

TEMP_DIR   = Path("C:/SubGenTemp")
OUTPUT_DIR = Path("C:/SubGenTemp/output")
DB_PATH    = Path("C:/SubGenTemp/gestao.db")
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
    conn.commit()
    conn.close()

init_db()

print(f"FFmpeg (curto):  {FFMPEG_PATH}")
print(f"FFmpeg dir PATH: {FFMPEG_DIR}")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = whisper.load_model("tiny")


class LuzEntry(BaseModel):
    date: str
    value: float


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
