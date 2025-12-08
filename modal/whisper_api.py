"""
Modal Whisper API - Fast streaming transcription service
Deploy with: python -m modal deploy modal/whisper_api.py

Uses faster-whisper (CTranslate2) for 4x faster transcription
"""

import modal

# Create Modal app
app = modal.App("whisper-transcription")

# Define the image with faster-whisper dependencies - preload model
whisper_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg")
    .pip_install("faster-whisper", "ffmpeg-python", "fastapi")
    .run_commands("python -c \"from faster_whisper import WhisperModel; WhisperModel('tiny', device='cpu', compute_type='int8')\"")
)


@app.function(
    image=whisper_image,
    cpu=2,
    memory=4096,
    timeout=300,
)
@modal.concurrent(max_inputs=10)
def transcribe(audio_bytes: bytes, language: str = "en") -> dict:
    """
    Transcribe audio bytes using faster-whisper.
    """
    from faster_whisper import WhisperModel
    import tempfile
    import os

    # Load model on CPU with int8 for reliability
    model = WhisperModel("base", device="cpu", compute_type="int8")

    # Write audio to temp file
    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
        f.write(audio_bytes)
        temp_path = f.name

    try:
        segments, info = model.transcribe(
            temp_path,
            language=language,
            beam_size=1,  # Faster with beam_size=1
            vad_filter=True,  # Filter out silence
        )

        # Collect all segments
        text_parts = []
        segment_list = []
        for segment in segments:
            text_parts.append(segment.text)
            segment_list.append({
                "start": segment.start,
                "end": segment.end,
                "text": segment.text
            })

        return {
            "text": "".join(text_parts).strip(),
            "segments": segment_list,
            "language": info.language,
        }
    finally:
        os.unlink(temp_path)


@app.function(
    image=whisper_image,
    cpu=4,
    memory=2048,
    timeout=60,
    container_idle_timeout=300,  # Keep warm for 5 min
)
@modal.concurrent(max_inputs=10)
@modal.fastapi_endpoint(method="POST")
def transcribe_endpoint(request: dict) -> dict:
    """
    Fast transcription endpoint using faster-whisper.

    Expects JSON with:
        - audio_base64: Base64 encoded audio
        - language: Optional language code (default: "en")

    Returns:
        - text: Transcribed text
        - segments: Array of {start, end, text}
    """
    import base64
    from faster_whisper import WhisperModel
    import tempfile
    import os

    audio_base64 = request.get("audio_base64", "")
    language = request.get("language", "en")

    if not audio_base64:
        return {"error": "No audio_base64 provided", "text": ""}

    try:
        audio_bytes = base64.b64decode(audio_base64)
    except Exception as e:
        return {"error": f"Invalid base64: {str(e)}", "text": ""}

    # Use tiny model for speed - still accurate for short audio
    model = WhisperModel("tiny", device="cpu", compute_type="int8", cpu_threads=4)

    # Write to temp file
    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
        f.write(audio_bytes)
        temp_path = f.name

    try:
        segments, info = model.transcribe(
            temp_path,
            language=language,
            beam_size=1,  # Faster inference
            vad_filter=True,  # Voice activity detection - filters silence
        )

        text_parts = []
        segment_list = []
        for segment in segments:
            text_parts.append(segment.text)
            segment_list.append({
                "start": segment.start,
                "end": segment.end,
                "text": segment.text
            })

        return {
            "text": "".join(text_parts).strip(),
            "segments": segment_list,
            "language": info.language,
        }
    except Exception as e:
        return {"error": str(e), "text": ""}
    finally:
        os.unlink(temp_path)


# Streaming endpoint for chunked audio
@app.function(
    image=whisper_image,
    cpu=4,
    memory=1024,
    timeout=30,
    container_idle_timeout=300,  # Keep warm for 5 min
)
@modal.concurrent(max_inputs=20)
@modal.fastapi_endpoint(method="POST")
def transcribe_chunk(request: dict) -> dict:
    """
    Fast chunk transcription for streaming.
    Optimized for small audio chunks (1-2 seconds).

    Expects JSON with:
        - audio_base64: Base64 encoded audio chunk
        - language: Optional language code (default: "en")
        - chunk_id: Optional chunk identifier

    Returns:
        - text: Transcribed text for this chunk
        - chunk_id: Echo back chunk_id
    """
    import base64
    from faster_whisper import WhisperModel
    import tempfile
    import os

    audio_base64 = request.get("audio_base64", "")
    language = request.get("language", "en")
    chunk_id = request.get("chunk_id", 0)

    if not audio_base64:
        return {"error": "No audio_base64 provided", "text": "", "chunk_id": chunk_id}

    try:
        audio_bytes = base64.b64decode(audio_base64)
    except Exception as e:
        return {"error": f"Invalid base64: {str(e)}", "text": "", "chunk_id": chunk_id}

    # Use tiny model with 4 CPU threads for speed
    model = WhisperModel("tiny", device="cpu", compute_type="int8", cpu_threads=4)

    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
        f.write(audio_bytes)
        temp_path = f.name

    try:
        segments, info = model.transcribe(
            temp_path,
            language=language,
            beam_size=1,
            vad_filter=True,
            without_timestamps=True,  # Faster for chunks
        )

        text = "".join(s.text for s in segments).strip()

        return {
            "text": text,
            "chunk_id": chunk_id,
            "language": info.language,
        }
    except Exception as e:
        return {"error": str(e), "text": "", "chunk_id": chunk_id}
    finally:
        os.unlink(temp_path)


if __name__ == "__main__":
    print("Faster-Whisper API ready for deployment")
    print("Deploy with: python -m modal deploy modal/whisper_api.py")
    print("")
    print("Endpoints:")
    print("  - transcribe_endpoint: Full transcription")
    print("  - transcribe_chunk: Fast chunk transcription for streaming")
