import os
import uuid
import subprocess
import tempfile
import whisper
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

FFMPEG_PATH = r"C:\Users\Fábio Amado\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin\ffmpeg.exe"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = whisper.load_model("base")


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


@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".mkv"):
        raise HTTPException(status_code=400, detail="Apenas ficheiros .mkv são suportados.")

    tmp_dir = tempfile.mkdtemp()
    mkv_path = os.path.join(tmp_dir, f"{uuid.uuid4()}.mkv")
    wav_path = os.path.join(tmp_dir, "audio.wav")
    srt_path = os.path.join(tmp_dir, "legendas.srt")

    try:
        with open(mkv_path, "wb") as f:
            f.write(await file.read())

        result = subprocess.run(
            [FFMPEG_PATH, "-i", mkv_path, "-vn", "-ar", "16000", "-ac", "1", wav_path],
            capture_output=True,
        )
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail="Erro ao extrair áudio com FFmpeg.")

        transcription = model.transcribe(wav_path)
        srt_content = segments_to_srt(transcription["segments"])

        with open(srt_path, "w", encoding="utf-8") as f:
            f.write(srt_content)

        return FileResponse(srt_path, media_type="text/plain", filename="legendas.srt")

    finally:
        os.remove(mkv_path)
        if os.path.exists(wav_path):
            os.remove(wav_path)
