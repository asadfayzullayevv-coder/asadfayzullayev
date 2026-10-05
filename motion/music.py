"""Synthesized 15s high-energy track, 120 BPM, synced to the video timeline."""
import wave
import numpy as np

SR = 44100
DUR = 30.0
BPM = 120
BEAT = 60 / BPM
N = int(SR * DUR)
rng = np.random.default_rng(7)

L = np.zeros(N)
R = np.zeros(N)
drum_mask = np.ones(N)  # used to mute groove for the "stamp" break


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
    """Simple one-pole lowpass; a may be scalar or per-sample array (0..1)."""
    y = np.empty_like(x)
    a = np.broadcast_to(a, x.shape)
    s = 0.0
    for i in range(len(x)):
        s += a[i] * (x[i] - s)
        y[i] = s
    return y


def saw(f, t):
    return 2 * ((f * t) % 1.0) - 1


# ---------- instruments ----------
def kick(d=0.4, big=1.0):
    t = tt(d)
    f = 48 + 140 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * (6 / big))
    click = rng.standard_normal(len(t)) * np.exp(-t * 400) * 0.3
    return np.tanh((body + click) * 1.6)


def clap():
    t = tt(0.25)
    n = rng.standard_normal(len(t))
    n = n - onepole_lp(n, 0.15)  # highpass-ish
    env = np.zeros_like(t)
    for k, off in enumerate([0, 0.012, 0.024]):
        env += np.where(t >= off, np.exp(-(t - off) * (90 if k < 2 else 18)), 0)
    return n * env * 0.6


def hat(open_=False):
    d = 0.25 if open_ else 0.05
    t = tt(d)
    n = rng.standard_normal(len(t))
    n = n - onepole_lp(n, 0.5)
    return n * np.exp(-t * (14 if open_ else 70)) * 0.35


def crash(d=1.2):
    t = tt(d)
    n = rng.standard_normal(len(t))
    n = n - onepole_lp(n, 0.35)
    return n * np.exp(-t * 3.2) * 0.35


def boom():
    t = tt(1.2)
    sub = np.sin(2 * np.pi * (40 + 30 * np.exp(-t * 8)) * t) * np.exp(-t * 2.5)
    n = rng.standard_normal(len(t)) * np.exp(-t * 10) * 0.5
    return np.tanh((sub + onepole_lp(n, 0.2)) * 2.0) * 0.9


def pop():
    t = tt(0.08)
    f = 300 + 900 * np.exp(-t * 60)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 45) * 0.35


def whoosh(d=0.4, rise=True):
    t = tt(d)
    n = rng.standard_normal(len(t))
    p = t / d
    cutoff = 0.02 + 0.5 * (p if rise else 1 - p) ** 2
    env = np.sin(np.pi * np.clip(p, 0, 1)) ** 1.5
    return onepole_lp(n, cutoff) * env * 0.9


def riser(d):
    t = tt(d)
    p = t / d
    n = onepole_lp(rng.standard_normal(len(t)), 0.03 + 0.6 * p ** 2)
    tone = np.sin(2 * np.pi * np.cumsum(300 + 900 * p ** 2) / SR) * 0.15
    return (n * 0.6 + tone) * p ** 2


def pluck_chord(freqs, d=0.22, cutoff=0.18):
    t = tt(d)
    sigL = np.zeros(len(t))
    sigR = np.zeros(len(t))
    for f in freqs:
        for det, side in [(-0.12, 0), (0.0, 2), (0.12, 1)]:
            s = saw(f * (1 + det / 100 * 8), t + rng.random() * 0.01)
            if side in (0, 2):
                sigL += s
            if side in (1, 2):
                sigR += s
    env = np.exp(-t * 9)
    filt_a = cutoff * (0.3 + 0.7 * np.exp(-t * 12))
    return onepole_lp(sigL * env, filt_a) * 0.12, onepole_lp(sigR * env, filt_a) * 0.12


def arp_note(f, d=0.12):
    t = tt(d)
    s = np.sign(np.sin(2 * np.pi * f * t)) * 0.6 + saw(f, t) * 0.4
    return onepole_lp(s * np.exp(-t * 22), 0.25) * 0.12


# ---------- harmony ----------
A2, F2, C3, G2 = 110.0, 87.31, 130.81, 98.0
CH = {
    "Am": [220.0, 261.63, 329.63],
    "F": [174.61, 220.0, 261.63],
    "C": [261.63, 329.63, 392.0],
    "G": [196.0, 246.94, 293.66],
}
ROOT = {"Am": A2 / 2, "F": F2 / 2, "C": C3 / 2, "G": G2 / 2}
CYCLE = ["Am", "F", "C", "G"]


def chord_at(t):
    return "Am" if t < 3.0 else CYCLE[int((t - 3.0) // 2) % 4]


# ---------- arrangement ----------
DROP = 3.0
END_GROOVE = 30.0
CUTS = [5.5, 10.0, 14.5, 20.5, 25.5]
POPS = []
ARP_ON = lambda t: (5.5 <= t < 10) or (17.0 <= t < 20.5) or (20.5 <= t < 27.5)

# Hook build (0 - 3s)
add(boom() * 0.6, 0.0)
add(riser(2.6), 0.4, 0.8)
for i, t0 in enumerate(np.arange(0, DROP, BEAT / 2)):
    add(arp_note(CH["Am"][i % 3] * 2), t0, 0.35 + 0.65 * t0 / DROP)
for t0 in np.arange(2.0, DROP, BEAT / 2):
    add(clap(), t0, 0.15 + 0.25 * (t0 - 2.0))
for t0 in np.arange(0, DROP, BEAT):
    add(hat(), t0 + BEAT / 2, 0.6)

# Groove
for b in np.arange(DROP, END_GROOVE - 1e-6, BEAT):
    add(kick(), b, 0.95)
    if int(round((b - DROP) / BEAT)) % 2 == 1:
        add(clap(), b, 0.4)
    add(hat(open_=True), b + BEAT / 2, 0.28, pan=0.2)
    for k in range(4):
        add(hat(), b + k * BEAT / 4, 0.22 if k % 2 else 0.1, pan=-0.25)
    cl, cr = pluck_chord(CH[chord_at(b)])
    i0 = int((b + BEAT / 2) * SR)
    n = min(len(cl), N - i0)
    if n > 0:
        L[i0:i0 + n] += cl[:n]
        R[i0:i0 + n] += cr[:n]
    for k in range(4):
        tk = b + k * BEAT / 4
        if not ARP_ON(tk):
            continue
        ch = CH[chord_at(tk)]
        idx = int(round((tk - DROP) / (BEAT / 4)))
        add(arp_note(ch[[0, 1, 2, 1][idx % 4]] * 4, 0.1), tk, 0.3, pan=0.3 if k % 2 else -0.3)

# Bass, sidechained
t_all = np.arange(N) / SR
bass_f = np.array([ROOT[chord_at(x)] for x in t_all[::256]]).repeat(256)[:N]
ph = 2 * np.pi * np.cumsum(bass_f) / SR
bass = (np.sin(ph) * 0.7 + saw(1, ph / (2 * np.pi)) * 0.3 + np.sin(ph * 2) * 0.25)
bass = onepole_lp(bass, 0.05)
since_beat = (t_all - DROP) % BEAT
bass *= (1 - 0.95 * np.exp(-since_beat / 0.09)) * (t_all >= DROP) * 0.55
L += bass
R += bass

# Moments
add(boom(), DROP, 0.5)
add(crash(1.6), DROP, 0.6)
for cut in CUTS:
    add(whoosh(0.5), cut - 0.45, 0.45)
    add(crash(1.0), cut, 0.3)
for tp in POPS:
    add(pop(), tp, 0.65)
add(riser(1.5), 17.0, 0.4)
add(crash(1.0), 18.5, 0.35)
# stamp break
add(crash(1.2), 22.5, 0.3)
# end card
add(whoosh(0.6), 26.9, 0.5)
add(boom(), 27.5, 0.5)
add(crash(2.0), 27.5, 0.45)

# Master
fade = np.ones(N)
f0 = int(28.8 * SR)
fade[f0:] = np.linspace(1, 0, N - f0) ** 1.5
mix = np.stack([L, R], axis=1) * fade[:, None]
mix = np.tanh(mix * 0.9)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.95
pcm = (mix * 32767).astype(np.int16)
with wave.open("music.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("ok", pcm.shape)
