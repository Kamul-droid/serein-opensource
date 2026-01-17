from fastapi import FastAPI, UploadFile, File, Form

app = FastAPI()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    model: str = Form("base"),
    language: str | None = Form(None),
):
    _ = await audio.read()
    return {
        "text": "transcription placeholder",
        "model": model,
        "language": language,
        "filename": audio.filename,
    }
