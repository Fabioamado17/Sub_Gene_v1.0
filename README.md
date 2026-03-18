# Sub_Gene_v1.0 — Gerador de Legendas

Aplicação web com duas funcionalidades principais:
- Gerar um ficheiro `.srt` a partir de um vídeo `.mkv` (transcrição via Whisper)
- Incorporar um ficheiro `.srt` existente num vídeo `.mkv`

---

## Funcionalidades

### Gerar Legendas
1. Faz upload de um ficheiro `.mkv`
2. O backend extrai o áudio com FFmpeg e transcreve com o modelo Whisper
3. O ficheiro `legendas.srt` é devolvido e o download inicia automaticamente

### Incorporar Legendas
1. Faz upload de um ficheiro `.mkv` e de um ficheiro `.srt`
2. O backend usa FFmpeg para muxar as legendas no contentor MKV sem recodificar
3. O ficheiro `video_legendado.mkv` é devolvido e o download inicia automaticamente

---

## Estrutura do projeto

```
Sub_Gene_v1.0/
  frontend/         - SPA em React + Vite
    src/
      components/   - UploadArea, ProgressStatus, Tabs
      services/     - api.js (comunicação com o backend)
  backend/
    main.py         - API FastAPI com endpoints /upload e /embed
    requirements.txt
  DEVLOG.md         - Registo de todas as alterações com explicações didáticas
```

---

## Requisitos

- Node.js 18 ou superior
- Python 3.10 ou superior
- FFmpeg (instalado via winget — ver nota abaixo)

---

## Instalação e arranque

### Backend

```powershell
cd backend
venv\Scripts\activate
uvicorn main:app --reload
```

Fica disponível em `http://localhost:8000`.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Fica disponível em `http://localhost:5173`.

---

## Endpoints da API

| Método | Endpoint  | Descrição |
|--------|-----------|-----------|
| POST   | `/upload` | Recebe `.mkv`, devolve `.srt` gerado pelo Whisper |
| POST   | `/embed`  | Recebe `.mkv` + `.srt`, devolve `.mkv` com legendas incorporadas |

---

## Nota sobre o FFmpeg

O FFmpeg foi instalado via winget. O caminho está definido em `backend/main.py` como `FFMPEG_LONG`. O código converte-o automaticamente para o formato curto do Windows (8.3) para evitar problemas com caracteres especiais em caminhos Unicode.

O diretório do FFmpeg é também adicionado ao `PATH` do processo Python para que o Whisper o consiga encontrar internamente.

Os ficheiros temporários são criados em `C:\SubGenTemp` (sem caracteres especiais) e apagados automaticamente após cada pedido.

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

Configurado em `backend/main.py` na linha `whisper.load_model(...)`. Modelos maiores são mais precisos mas mais lentos em CPU:

| Modelo | Velocidade | Precisão |
|--------|------------|----------|
| tiny   | Muito rápido | Baixa (predefinido) |
| base   | Rápido       | Razoável |
| small  | Moderado     | Boa      |
| medium | Lento        | Muito boa |
| large  | Muito lento  | Excelente |

Para ficheiros grandes (mais de 30 minutos) recomenda-se usar `tiny` ou `base` em CPU, ou considerar a API Whisper da OpenAI.
