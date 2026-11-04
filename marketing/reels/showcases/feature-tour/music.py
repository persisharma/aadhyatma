"""Synthesise an original, royalty-free tanpura drone with two temple-bell strikes.

Everything is generated from oscillators and noise here; no sampled or licensed audio is used.
Usage: python music.py <out.wav> <seconds> [cta_start_seconds]
"""
import sys
import wave

import numpy as np

SR = 48000
rng = np.random.default_rng(108)


def pluck(freq, seconds, decay=0.9996, brightness=0.55):
    """Karplus-Strong string with a soft jawari-style buzz."""
    n = int(SR * seconds)
    period = int(round(SR / freq))
    buf = rng.uniform(-1, 1, period)
    buf = np.convolve(buf, np.ones(3) / 3, mode="same")
    out = np.empty(n)
    for i in range(n):
        j = i % period
        nxt = buf[(j + 1) % period]
        out[i] = buf[j]
        buf[j] = decay * (brightness * buf[j] + (1 - brightness) * nxt)
    out = np.tanh(out * 2.2) / np.tanh(2.2)  # jawari buzz
    attack = np.minimum(1, np.arange(n) / (SR * 0.012))
    return out * attack


def bell(freq, seconds):
    t = np.arange(int(SR * seconds)) / SR
    partials = [(1.0, 1.0, 3.2), (2.0, 0.55, 2.4), (2.76, 0.42, 1.9), (5.4, 0.22, 1.1), (8.93, 0.12, 0.7)]
    sig = sum(a * np.sin(2 * np.pi * freq * r * t + rng.uniform(0, 6.28)) * np.exp(-t / d) for r, a, d in partials)
    sig *= np.minimum(1, t / 0.004)
    return sig / 2.3


def reverb(sig, seconds=2.4, mix=0.32):
    ir_t = np.arange(int(SR * seconds)) / SR
    ir = rng.normal(0, 1, ir_t.size) * np.exp(-ir_t / (seconds / 5))
    ir[0] = 0
    ir /= np.sqrt(np.sum(ir ** 2))
    n = sig.size + ir.size
    size = 1 << (n - 1).bit_length()
    wet = np.fft.irfft(np.fft.rfft(sig, size) * np.fft.rfft(ir, size), size)[: sig.size]
    return (1 - mix) * sig + mix * wet * 0.6


def main():
    out_path, total = sys.argv[1], float(sys.argv[2])
    cta = float(sys.argv[3]) if len(sys.argv) > 3 else None
    n = int(SR * (total + 0.5))
    mix = np.zeros(n)
    sa = 138.59  # C#3, a common tanpura Sa
    cycle = [sa * 0.75, sa * 2, sa * 2, sa]  # Pa, Sa', Sa', Sa (lower)
    gap = 0.62
    cache = {f: pluck(f, 3.4) for f in set(cycle)}
    t = 0.0
    k = 0
    while t < total:
        f = cycle[k % 4]
        s = int(t * SR)
        seg = cache[f][: n - s] * (0.9 if k % 4 else 1.0)
        mix[s : s + seg.size] += seg * 0.28
        t += gap * (1.35 if k % 4 == 3 else 1.0)
        k += 1
    for at, f in [(0.05, sa * 4), (cta, sa * 4)] if cta else [(0.05, sa * 4)]:
        s = int(at * SR)
        b = bell(f, 4.5)[: n - s]
        mix[s : s + b.size] += b * 0.55
    mix = reverb(mix)
    fade_in = np.minimum(1, np.arange(n) / (SR * 0.25))
    fade_out = np.clip((total - np.arange(n) / SR) / 1.2, 0, 1)
    mix *= fade_in * fade_out
    mix = mix / np.max(np.abs(mix)) * 0.8
    pcm = (np.stack([mix, np.roll(mix, int(SR * 0.011))], 1) * 32767).astype("<i2")
    with wave.open(out_path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


main()
