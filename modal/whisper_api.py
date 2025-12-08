"""
Modal Whisper API - Shared transcription service
Deploy with: python -m modal deploy modal/whisper_api.py
"""

import modal

# Create Modal app
app = modal.App("whisper-transcription")

# Define the image with Whisper dependencies
whisper_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg")
    .pip_install("openai-whisper", "ffmpeg-python", "fastapi")
)


@app.function(
    image=whisper_image,
    gpu="T4",  # Use T4 GPU (cheapest, fast enough for short audio)
    timeout=300,  # 5 minute timeout
)
@modal.concurrent(max_inputs=10)
def transcribe(audio_bytes: bytes, language: str = "en") -> dict:
    """
    Transcribe audio bytes using Whisper.

    Args:
        audio_bytes: Raw audio data (webm, mp3, wav, etc.)
        language: Language code (default: "en" for English)

    Returns:
        dict with "text" and "segments"
    """
    import whisper
    import tempfile
    import os

    # Load the model (cached after first load)
    model = whisper.load_model("base")  # Options: tiny, base, small, medium, large

    # Write audio to temp file
    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
        f.write(audio_bytes)
        temp_path = f.name

    try:
        # Transcribe
        result = model.transcribe(
            temp_path,
            language=language,
            fp16=True,  # Use FP16 for faster inference on GPU
        )

        return {
            "text": result["text"].strip(),
            "segments": [
                {"start": s["start"], "end": s["end"], "text": s["text"]}
                for s in result.get("segments", [])
            ],
            "language": result.get("language", language),
        }
    finally:
        # Cleanup temp file
        os.unlink(temp_path)


@app.function(
    image=whisper_image,
    gpu="T4",
    timeout=300,
)
@modal.concurrent(max_inputs=10)
@modal.fastapi_endpoint(method="POST")
def transcribe_endpoint(request: dict) -> dict:
    """
    Web endpoint for transcription.

    Expects JSON with:
        - audio_base64: Base64 encoded audio
        - language: Optional language code (default: "en")

    Returns:
        - text: Transcribed text
        - segments: Array of {start, end, text}
    """
    import base64
    import whisper
    import tempfile
    import os

    # Decode base64 audio
    audio_base64 = request.get("audio_base64", "")
    language = request.get("language", "en")

    if not audio_base64:
        return {"error": "No audio_base64 provided", "text": ""}

    try:
        audio_bytes = base64.b64decode(audio_base64)
    except Exception as e:
        return {"error": f"Invalid base64: {str(e)}", "text": ""}

    # Load model
    model = whisper.load_model("base")

    # Write to temp file
    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
        f.write(audio_bytes)
        temp_path = f.name

    try:
        result = model.transcribe(
            temp_path,
            language=language,
            fp16=True,
        )

        return {
            "text": result["text"].strip(),
            "segments": [
                {"start": s["start"], "end": s["end"], "text": s["text"]}
                for s in result.get("segments", [])
            ],
            "language": result.get("language", language),
        }
    except Exception as e:
        return {"error": str(e), "text": ""}
    finally:
        os.unlink(temp_path)


# For local testing
if __name__ == "__main__":
    # Test with a sample
    print("Whisper API ready for deployment")
    print("Deploy with: python -m modal deploy modal/whisper_api.py")
