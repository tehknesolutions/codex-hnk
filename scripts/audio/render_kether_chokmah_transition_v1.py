#!/usr/bin/env python3
"""Render the PROPOSAL_NOT_CANON Kether→Chokmah Transition V1 WAV.

This script is a deterministic production proposal, not a medical or
supernatural-effect claim. The generated file is not canonical until it is
listening-tested, approved, checksummed and registered as published.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import struct
import wave
from pathlib import Path

SAMPLE_RATE = 48_000
DURATION_SECONDS = 720
FADE_SECONDS = 36
LEFT_HZ = 429.0
RIGHT_HZ = 435.0
RITUAL_HZ = 528.0
CARRIER_AMPLITUDE = 0.28
RITUAL_AMPLITUDE = 0.08
MAX_INT16 = 32767

RECIPE = {
    "id": "hnk.audio.kether_chokmah.transition.v1",
    "status": "proposal",
    "sample_rate": SAMPLE_RATE,
    "duration_seconds": DURATION_SECONDS,
    "fade_in_seconds": FADE_SECONDS,
    "fade_out_seconds": FADE_SECONDS,
    "carrier_left_hz": LEFT_HZ,
    "carrier_right_hz": RIGHT_HZ,
    "carrier_center_hz": 432.0,
    "binaural_difference_hz": 6.0,
    "ritual_tones_hz": [RITUAL_HZ],
    "carrier_amplitude": CARRIER_AMPLITUDE,
    "ritual_amplitude": RITUAL_AMPLITUDE,
    "channels": 2,
    "sample_width_bytes": 2,
    "provenance": "HNK-original technical reconciliation proposal",
}


def envelope(t: float) -> float:
    if t < FADE_SECONDS:
        return t / FADE_SECONDS
    remaining = DURATION_SECONDS - t
    if remaining < FADE_SECONDS:
        return max(0.0, remaining / FADE_SECONDS)
    return 1.0


def clamp_sample(value: float) -> int:
    value = max(-1.0, min(1.0, value))
    return int(round(value * MAX_INT16))


def render(output: Path, chunk_seconds: int = 1) -> str:
    output.parent.mkdir(parents=True, exist_ok=True)
    frames_total = SAMPLE_RATE * DURATION_SECONDS
    chunk_frames = SAMPLE_RATE * chunk_seconds

    with wave.open(str(output), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)

        frame_index = 0
        while frame_index < frames_total:
            end = min(frames_total, frame_index + chunk_frames)
            data = bytearray()
            for i in range(frame_index, end):
                t = i / SAMPLE_RATE
                env = envelope(t)
                ritual = math.sin(2.0 * math.pi * RITUAL_HZ * t) * RITUAL_AMPLITUDE
                left = (
                    math.sin(2.0 * math.pi * LEFT_HZ * t) * CARRIER_AMPLITUDE
                    + ritual
                ) * env
                right = (
                    math.sin(2.0 * math.pi * RIGHT_HZ * t) * CARRIER_AMPLITUDE
                    + ritual
                ) * env
                data.extend(struct.pack("<hh", clamp_sample(left), clamp_sample(right)))
            wav.writeframes(data)
            frame_index = end

    digest = hashlib.sha256()
    with output.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output",
        default="dist/audio/kether-chokmah-transition-v1-proposal.wav",
    )
    parser.add_argument(
        "--recipe-json",
        default="dist/audio/kether-chokmah-transition-v1-proposal.json",
    )
    args = parser.parse_args()

    output = Path(args.output)
    sha256 = render(output)

    recipe = dict(RECIPE)
    recipe["sha256"] = sha256
    recipe["output"] = output.name

    recipe_path = Path(args.recipe_json)
    recipe_path.parent.mkdir(parents=True, exist_ok=True)
    recipe_path.write_text(
        json.dumps(recipe, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    print(json.dumps(recipe, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
