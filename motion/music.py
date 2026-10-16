"""40s score locked to the edit: 96 BPM, 1 bar = 2.5 s, every cut on a downbeat."""
import wave
import numpy as np

SR = 44100
DUR = 40.0
BPM = 96
BEAT = 60 / BPM          # 0.625 s
BAR = 4 * BEAT           # 2.5 s
N = int(SR * DUR)
rng = np.random.default_rng(11)
L = np.zeros(N)
R = np.zeros(N)
t_all = np.arange(N) / SR

GROOVE_IN = 2.5                      # beat enters with the first phone shot
CARDS = [7.5, 15.0, 22.5, 27.5]      # big phrases: accent on the downbeat
SHOTS = [2.5, 5.0, 12.5, 17.5, 25.0]  # phone shots: whoosh into the bar
BREAK = (30.0, 32.5)                 # "подкаблучник": drums drop out
END = 35.0                           # end card


def add(sig, t0, gain=1.0, pan=0.0):
    i0 = int(round(t0 * SR))
    if i0 >= N or i0 < 0:
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


def in_break(t):
    return BREAK[0] <= t < BREAK[1]


def grooving(t):
    return GROOVE_IN <= t < END and not in_break(t)


# one chord per bar: Am9 - Fmaj7 - C(add9) - G6
CHORDS = [
    [55.0, 220.0, 261.63, 329.63, 493.88],
    [43.65, 174.61, 220.0, 261.63, 329.63],
    [65.41, 196.0, 261.63, 293.66, 329.63],
    [49.0, 196.0, 246.94, 293.66, 329.63],
]


def chord_at(t):
    if t >= END:
        return CHORDS[0]
    return CHORDS[int(t // BAR) % 4]


# ---- pad (re-voiced exactly on every bar line) ----
pl, pr = np.zeros(N), np.zeros(N)
for b in range(int(DUR / BAR) + 1):
    t0 = b * BAR
    if t0 >= DUR:
        break
    d = (DUR - t0) if t0 >= END else BAR + 0.6
    t = tt(d)
    env = np.minimum(1, t / 0.25) * np.clip((d - t) / 0.6, 0, 1)
    sl, sr = np.zeros(len(t)), np.zeros(len(t))
    for f in chord_at(t0 + 0.01)[1:]:
        for det, side in [(-0.2, 0), (0.2, 1), (0.0, 2)]:
            w = 2 * ((f * (1 + det / 100) * t + rng.random()) % 1) - 1
            if side in (0, 2):
                sl += w
            if side in (1, 2):
                sr += w
    i0 = int(t0 * SR)
    n = min(len(t), N - i0)
    pl[i0:i0 + n] += (sl * env)[:n]
    pr[i0:i0 + n] += (sr * env)[:n]
pl = onepole_lp(onepole_lp(pl, 0.035), 0.035)
pr = onepole_lp(onepole_lp(pr, 0.035), 0.035)
L += pl * 0.06
R += pr * 0.06


# ---- drums ----
def kick():
    t = tt(0.45)
    f = 48 + 90 * np.exp(-t * 30)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8)
    click = rng.standard_normal(len(t)) * np.exp(-t * 500) * 0.15
    return np.tanh((body + click) * 1.3)


def clap():
    t = tt(0.3)
    n = rng.standard_normal(len(t))
    n = n - onepole_lp(n, 0.2)
    env = sum(np.where(t >= o, np.exp(-(t - o) * k), 0) for o, k in [(0, 120), (0.01, 120), (0.02, 22)])
    return n * env * 0.5


def hat(d=0.045, k=110):
    t = tt(d)
    n = rng.standard_normal(len(t))
    n = n - onepole_lp(n, 0.55)
    return n * np.exp(-t * k) * 0.3


beats = np.arange(GROOVE_IN, END - 1e-6, BEAT)
for i, b in enumerate(beats):
    if not grooving(b):
        continue
    add(kick(), b, 0.8)
    if i % 2 == 1:
        add(clap(), b, 0.45)
    add(hat(), b + BEAT / 2, 0.55, pan=0.25)
    add(hat(0.03, 160), b + BEAT / 4, 0.25, pan=-0.25)
    add(hat(0.03, 160), b + 3 * BEAT / 4, 0.25, pan=-0.25)

# ---- bass: root on every 8th, ducked by the kick ----
root = np.array([chord_at(x)[0] for x in t_all[::256]]).repeat(256)[:N]
ph = 2 * np.pi * np.cumsum(root) / SR
bass = np.sin(ph) + 0.25 * np.sin(2 * ph) + 0.1 * (2 * ((ph / (2 * np.pi)) % 1) - 1)
since = (t_all - GROOVE_IN) % BEAT
duck = 1 - 0.85 * np.exp(-since / 0.08)
gate = np.array([grooving(x) for x in t_all[::256]]).repeat(256)[:N].astype(float)
gate = onepole_lp(gate, 0.002)
L += bass * duck * gate * 0.32
R += bass * duck * gate * 0.32


# ---- glass pluck arpeggio on 8ths ----
def pluck(f, d=0.9):
    t = tt(d)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 8)
    return s * np.exp(-t * 5) * np.minimum(1, t / 0.004)


order = [1, 2, 3, 4, 3, 2, 1, 3]
for i, b in enumerate(np.arange(0.0, END, BEAT / 2)):
    ch = chord_at(b + 0.001)
    g = 0.05 if b < GROOVE_IN else (0.03 if in_break(b) else 0.07)
    add(pluck(ch[order[i % 8]] * 2), b, g, pan=0.3 if i % 2 else -0.3)


# ---- transitions ----
def swell(d):
    t = tt(d)
    p = t / d
    n = onepole_lp(rng.standard_normal(len(t)), 0.01 + 0.25 * p ** 2)
    return n * p ** 3


def impact():
    t = tt(2.0)
    sub = np.sin(2 * np.pi * (36 + 30 * np.exp(-t * 10)) * t) * np.exp(-t * 2.2)
    n = rng.standard_normal(len(t))
    air = (n - onepole_lp(n, 0.3)) * np.exp(-t * 3.0) * 0.25
    return sub + air


add(swell(2.3), GROOVE_IN - 2.3, 0.5)
for s in SHOTS[1:]:
    add(swell(0.6), s - 0.6, 0.3)
for c in CARDS:
    add(swell(0.9), c - 0.9, 0.4)
    add(impact(), c, 0.45)
add(swell(1.0), BREAK[0] - 1.0, 0.5)
add(impact(), BREAK[0], 0.8)
add(swell(0.9), BREAK[1] - 0.9, 0.4)
add(swell(1.2), END - 1.2, 0.5)
add(impact(), END, 0.9)

# ---- master ----
fade = np.ones(N)
fade[: int(0.5 * SR)] = np.linspace(0, 1, int(0.5 * SR))
f0 = int(38.0 * SR)
fade[f0:] = np.linspace(1, 0, N - f0) ** 1.5
mix = np.stack([L, R], axis=1) * fade[:, None]
mix = np.tanh(mix * 1.2)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.9
pcm = (mix * 32767).astype(np.int16)
with wave.open("music.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("ok", pcm.shape)
