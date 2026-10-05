"""Calm, premium ambient track (40s): warm pads, soft pulse, glassy plucks."""
import wave
import numpy as np

SR = 44100
DUR = 40.0
BPM = 96
BEAT = 60 / BPM
N = int(SR * DUR)
rng = np.random.default_rng(3)
L = np.zeros(N)
R = np.zeros(N)
t_all = np.arange(N) / SR


def add(sig, t0, gain=1.0, pan=0.0):
    i0 = int(t0 * SR)
    if i0 >= N:
        return
    sig = sig[: N - i0]
    L[i0:i0 + len(sig)] += sig * gain * (1 - max(pan, 0))
    R[i0:i0 + len(sig)] += sig * gain * (1 + min(pan, 0))


def tt(d):
    return np.arange(int(d * SR)) / SR


def onepole_lp(x, a):
    y = np.empty_like(x)
    a = np.broadcast_to(a, x.shape)
    s = 0.0
    for i in range(len(x)):
        s += a[i] * (x[i] - s)
        y[i] = s
    return y


# Am9 - Fmaj7 - C(add9) - G6, each chord 5 s (8 beats)
CHORDS = [
    [110.0, 220.0, 261.63, 329.63, 493.88],
    [87.31, 174.61, 220.0, 261.63, 329.63],
    [65.41, 130.81, 196.0, 293.66, 329.63],
    [98.0, 196.0, 246.94, 293.66, 329.63],
]
CH_LEN = 5.0


def chord_at(t):
    return CHORDS[int(t // CH_LEN) % 4]


# ---- pad: detuned saws, heavy lowpass, slow crossfades ----
pad_l = np.zeros(N)
pad_r = np.zeros(N)
for ci in range(int(DUR // CH_LEN) + 1):
    t0 = ci * CH_LEN
    d = CH_LEN + 2.0
    t = tt(d)
    env = np.minimum(1, t / 1.6) * np.clip((d - t) / 2.0, 0, 1)
    sl = np.zeros(len(t))
    sr = np.zeros(len(t))
    for f in chord_at(t0)[1:]:
        for det, side in [(-0.25, 0), (0.25, 1), (0.0, 2)]:
            w = 2 * ((f * (1 + det / 100) * t + rng.random()) % 1) - 1
            if side in (0, 2):
                sl += w
            if side in (1, 2):
                sr += w
    i0 = int(t0 * SR)
    n = min(len(t), N - i0)
    if n <= 0:
        continue
    pad_l[i0:i0 + n] += (sl * env)[:n]
    pad_r[i0:i0 + n] += (sr * env)[:n]
cut = 0.025 + 0.02 * np.sin(2 * np.pi * t_all / 20) ** 2  # slow filter breathing
pad_l = onepole_lp(onepole_lp(pad_l, cut), cut)
pad_r = onepole_lp(onepole_lp(pad_r, cut), cut)
L += pad_l * 0.07
R += pad_r * 0.07

# ---- sub bass, sustained root ----
root = np.array([chord_at(x)[0] for x in t_all[::512]]).repeat(512)[:N]
ph = 2 * np.pi * np.cumsum(root) / SR
sub = np.sin(ph) * 0.5 + np.sin(ph * 2) * 0.12
sub *= np.clip((t_all - 3.0) / 2.0, 0, 1) * 0.35
L += sub
R += sub


# ---- soft pulse (felt kick) from 3.4s ----
def soft_kick():
    t = tt(0.5)
    f = 45 + 60 * np.exp(-t * 25)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)


def tick():
    t = tt(0.04)
    n = rng.standard_normal(len(t))
    n = n - onepole_lp(n, 0.6)
    return n * np.exp(-t * 120) * 0.2


for b in np.arange(3.4, 37.4, BEAT):
    add(soft_kick(), b, 0.45)
for b in np.arange(7.0, 37.4, BEAT / 2):
    add(tick(), b + BEAT / 4, 0.35, pan=0.3)


# ---- glassy plucks: slow arpeggio ----
def pluck(f, d=1.6):
    t = tt(d)
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 6)
    return s * np.exp(-t * 3.5) * np.minimum(1, t / 0.005)


pattern = [1, 2, 3, 4, 3, 2]
k = 0
for b in np.arange(3.4, 37.0, BEAT):
    ch = chord_at(b)
    f = ch[pattern[k % len(pattern)]] * 2
    add(pluck(f), b, 0.09, pan=0.35 if k % 2 else -0.35)
    k += 1


# ---- gentle swells into each title card ----
def swell(d=1.2):
    t = tt(d)
    p = t / d
    n = onepole_lp(rng.standard_normal(len(t)), 0.02 + 0.08 * p)
    return n * p ** 2 * 0.8


for c in [9.5, 17.0, 24.0, 29.5, 32.2, 35.0]:
    add(swell(), c - 1.2, 0.35)


# ---- final resolve ----
def low_hit():
    t = tt(3.0)
    return np.sin(2 * np.pi * (38 + 20 * np.exp(-t * 6)) * t) * np.exp(-t * 1.4)


add(low_hit(), 37.5, 0.5)

# Master
fade = np.ones(N)
fade[: int(0.8 * SR)] = np.linspace(0, 1, int(0.8 * SR))
f0 = int(38.0 * SR)
fade[f0:] = np.linspace(1, 0, N - f0) ** 1.4
mix = np.stack([L, R], axis=1) * fade[:, None]
mix = np.tanh(mix * 1.1)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.9
pcm = (mix * 32767).astype(np.int16)
with wave.open("music.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("ok", pcm.shape)
