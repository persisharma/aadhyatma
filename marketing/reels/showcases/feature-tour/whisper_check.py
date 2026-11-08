"""Minimal greedy Whisper decoder over sherpa-onnx's exported turbo model, used only to verify voice-over intelligibility.

sherpa-onnx's own recogniser truncates Devanagari output when a token ends inside a multi-byte character,
so tokens are joined as raw bytes here and decoded once at the end.
"""
import base64
from pathlib import Path

import numpy as np
import onnxruntime as ort


def _mel_filters(sr=16000, n_fft=400, n_mels=128):
    """Slaney-style mel filterbank (matches librosa.filters.mel defaults used by Whisper)."""
    def hz_to_mel(f):
        f = np.asanyarray(f, dtype=float)
        mel = f / (200.0 / 3)
        log_t = f >= 1000.0
        return np.where(log_t, 15.0 + np.log(np.maximum(f, 1e-10) / 1000.0) / (np.log(6.4) / 27.0), mel)

    def mel_to_hz(m):
        m = np.asanyarray(m, dtype=float)
        f = m * (200.0 / 3)
        log_t = m >= 15.0
        return np.where(log_t, 1000.0 * np.exp((np.log(6.4) / 27.0) * (m - 15.0)), f)

    fft_freqs = np.linspace(0, sr / 2, n_fft // 2 + 1)
    mel_f = mel_to_hz(np.linspace(hz_to_mel(0), hz_to_mel(sr / 2), n_mels + 2))
    fdiff = np.diff(mel_f)
    ramps = mel_f[:, None] - fft_freqs[None, :]
    weights = np.maximum(0, np.minimum(-ramps[:-2] / fdiff[:-1, None], ramps[2:] / fdiff[1:, None]))
    return weights * (2.0 / (mel_f[2:n_mels + 2] - mel_f[:n_mels]))[:, None]


class WhisperCheck:
    def __init__(self, model_dir):
        d = Path(model_dir)
        opts = ort.SessionOptions()
        opts.intra_op_num_threads = 4
        self.enc = ort.InferenceSession(str(d / "turbo-encoder.int8.onnx"), opts, providers=["CPUExecutionProvider"])
        self.dec = ort.InferenceSession(str(d / "turbo-decoder.int8.onnx"), opts, providers=["CPUExecutionProvider"])
        meta = self.enc.get_modelmeta().custom_metadata_map
        self.meta = meta
        self.vocab = {}
        for line in (d / "turbo-tokens.txt").read_text().splitlines():
            tok, idx = line.rsplit(" ", 1)
            self.vocab[int(idx)] = base64.b64decode(tok)
        self.filters = _mel_filters(n_mels=int(meta["n_mels"]))

    def _mel(self, audio16k):
        audio = np.concatenate([audio16k, np.zeros(16000 * 30 - len(audio16k) % (16000 * 30))])[: 16000 * 30]
        padded = np.pad(audio, 200, mode="reflect")
        window = np.hanning(401)[:-1]
        frames = np.lib.stride_tricks.sliding_window_view(padded, 400)[::160][:3000]
        power = np.abs(np.fft.rfft(frames * window, axis=1)) ** 2
        log_spec = np.log10(np.maximum(self.filters @ power.T, 1e-10))
        log_spec = np.maximum(log_spec, log_spec.max() - 8.0)
        return ((log_spec + 4.0) / 4.0).astype(np.float32)[None]

    def transcribe(self, audio, sr, lang):
        audio16k = np.interp(np.arange(0, len(audio), sr / 16000), np.arange(len(audio)), audio).astype(np.float32)
        cross_k, cross_v = self.enc.run(None, {"mel": self._mel(audio16k)})
        m = self.meta
        lang_token = int(m["all_language_tokens"].split(",")[m["all_language_codes"].split(",").index(lang)])
        tokens = [int(m["sot"]), lang_token, int(m["transcribe"]), int(m["no_timestamps"])]
        n_layer, n_ctx, n_state = int(m["n_text_layer"]), int(m["n_text_ctx"]), int(m["n_text_state"])
        k_cache = np.zeros((n_layer, 1, n_ctx, n_state), np.float32)
        v_cache = np.zeros_like(k_cache)
        feed, offset, out = tokens, 0, []
        for _ in range(120):
            logits, k_cache, v_cache = self.dec.run(None, {
                "tokens": np.array([feed], np.int64), "in_n_layer_self_k_cache": k_cache, "in_n_layer_self_v_cache": v_cache,
                "n_layer_cross_k": cross_k, "n_layer_cross_v": cross_v, "offset": np.array([offset], np.int64)})
            offset += len(feed)
            nxt = int(np.argmax(logits[0, -1]))
            if nxt == int(m["eot"]):
                break
            out.append(nxt)
            feed = [nxt]
        return b"".join(self.vocab.get(t, b"") for t in out).decode("utf-8", errors="replace").strip()
