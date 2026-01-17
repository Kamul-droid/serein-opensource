import io
import struct
from fastapi import FastAPI
from fastapi.responses import Response
from pydantic import BaseModel

app = FastAPI()

DEFAULT_VOICES = [
    "tts_models/en/ljspeech/tacotron2-DDC",
    "tts_models/en/ljspeech/fast_pitch",
]


class TTSRequest(BaseModel):
    text: str
    voice: str | None = None
    speed: float | None = None


def generate_silence_wav(duration_seconds: float = 1.0, sample_rate: int = 22050) -> bytes:
    total_samples = int(duration_seconds * sample_rate)
    buffer = io.BytesIO()

    num_channels = 1
    bits_per_sample = 16
    byte_rate = sample_rate * num_channels * bits_per_sample // 8
    block_align = num_channels * bits_per_sample // 8
    data_size = total_samples * block_align

    buffer.write(b"RIFF")
    buffer.write(struct.pack("<I", 36 + data_size))
    buffer.write(b"WAVEfmt ")
    buffer.write(struct.pack("<I", 16))
    buffer.write(struct.pack("<H", 1))
    buffer.write(struct.pack("<H", num_channels))
    buffer.write(struct.pack("<I", sample_rate))
    buffer.write(struct.pack("<I", byte_rate))
    buffer.write(struct.pack("<H", block_align))
    buffer.write(struct.pack("<H", bits_per_sample))
    buffer.write(b"data")
    buffer.write(struct.pack("<I", data_size))

    silence = struct.pack("<h", 0)
    for _ in range(total_samples):
        buffer.write(silence)

    return buffer.getvalue()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/voices")
def voices():
    return {"items": DEFAULT_VOICES}


@app.post("/api/tts")
def tts(request: TTSRequest):
    audio = generate_silence_wav()
    return Response(content=audio, media_type="audio/wav")
