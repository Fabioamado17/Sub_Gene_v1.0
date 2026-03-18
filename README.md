# Sub_Gene_v1.0 — Gerador de Legendas

Aplicação web para gerar ficheiros de legendas (.srt) a partir de ficheiros de vídeo .mkv, utilizando o modelo Whisper da OpenAI para transcrição de áudio.

---

## Como funciona

1. O utilizador faz upload de um ficheiro .mkv no browser.
2. O frontend envia o ficheiro para o backend via HTTP.
3. O backend extrai o áudio com FFmpeg e transcreve-o com o Whisper.
4. O ficheiro .srt gerado é devolvido ao browser e o download inicia automaticamente.

---

## Estrutura do projeto

```
Sub_Gene_v1.0/
  frontend/   - SPA em React + Vite
  backend/    - API em FastAPI (Python)
  DEVLOG.md   - Registo de todas as alterações com explicações didáticas
```

---

## Requisitos

- Node.js 18 ou superior
- Python 3.10 ou superior
- FFmpeg instalado e acessível (ver nota abaixo)

---

## Instalação e arranque

### Backend

```bash
cd backend
source venv/Scripts/activate   # Windows
# source venv/bin/activate     # macOS / Linux
uvicorn main:app --reload
```

Fica disponível em `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Fica disponível em `http://localhost:5173`.

---

## Nota sobre o FFmpeg

O FFmpeg foi instalado via winget e o caminho absoluto está definido em `backend/main.py`. Se o FFmpeg estiver disponível no PATH do sistema, a linha `FFMPEG_PATH` pode ser substituída apenas por `"ffmpeg"`.

---

## Dependências principais

### Frontend
- React 19
- Vite 6
- Axios

### Backend
- FastAPI
- Uvicorn
- openai-whisper
- python-multipart

---

## Modelos Whisper disponíveis

O modelo é configurado em `backend/main.py`. Modelos mais grandes são mais precisos mas mais lentos:

| Modelo | Velocidade | Precisão |
|--------|------------|----------|
| tiny   | Muito rápido | Baixa   |
| base   | Rápido       | Razoável (predefinido) |
| small  | Moderado     | Boa      |
| medium | Lento        | Muito boa |
| large  | Muito lento  | Excelente |
