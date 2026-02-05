let ctx: AudioContext | null = null;
let unlocked = false;

const STORAGE_KEY = "emots@sounds-enabled";
const MASTER_GAIN = 1;

function getCtx(): AudioContext | null {
	if (!unlocked) return null;
	if (!ctx) ctx = new AudioContext();
	if (ctx.state === "suspended") ctx.resume();
	return ctx;
}

export function unlockAudio(): void {
	if (unlocked) return;
	unlocked = true;
	if (!ctx) ctx = new AudioContext();
	if (ctx.state === "suspended") ctx.resume();
}

export function isSoundEnabled(): boolean {
	if (typeof window === "undefined") return false;
	return localStorage.getItem(STORAGE_KEY) !== "false";
}

export function setSoundsEnabled(enabled: boolean): void {
	if (typeof window === "undefined") return;
	localStorage.setItem(STORAGE_KEY, String(enabled));
}

export const sounds = {
	hover: () => {
		if (!isSoundEnabled()) return;
		const c = getCtx();
		if (!c) return;
		try {
			const t = c.currentTime;

			const osc = c.createOscillator();
			osc.type = "sine";
			osc.frequency.value = 800;

			const harmonic = c.createOscillator();
			harmonic.type = "sine";
			harmonic.frequency.value = 1600;

			const gain = c.createGain();
			gain.gain.setValueAtTime(0.06, t);
			gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

			const harmonicGain = c.createGain();
			harmonicGain.gain.setValueAtTime(0.02, t);
			harmonicGain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

			const master = c.createGain();
			master.gain.value = MASTER_GAIN;

			osc.connect(gain).connect(master).connect(c.destination);
			harmonic.connect(harmonicGain).connect(master);

			osc.start(t);
			harmonic.start(t);
			osc.stop(t + 0.07);
			harmonic.stop(t + 0.05);
		} catch {}
	},

	click: () => {
		if (!isSoundEnabled()) return;
		const c = getCtx();
		if (!c) return;
		try {
			const t = c.currentTime;
			const upDelay = 0.08;

			const playTick = (start: number, freq: number, gain: number) => {
				const noise = c.createBufferSource();
				const buf = c.createBuffer(1, c.sampleRate * 0.01, c.sampleRate);
				const data = buf.getChannelData(0);
				for (let i = 0; i < data.length; i++) {
					data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 40);
				}
				noise.buffer = buf;

				const bp = c.createBiquadFilter();
				bp.type = "bandpass";
				bp.frequency.value = freq;
				bp.Q.value = 2.5;

				const g = c.createGain();
				g.gain.setValueAtTime(gain, start);
				g.gain.exponentialRampToValueAtTime(0.001, start + 0.012);

				noise.connect(bp).connect(g).connect(master);
				noise.start(start);
			};

			const master = c.createGain();
			master.gain.value = MASTER_GAIN;
			master.connect(c.destination);

			playTick(t, 4500, 0.35);
			playTick(t + upDelay, 5500, 0.25);
		} catch {}
	},

	meow: () => {
		if (!isSoundEnabled()) return;
		const c = getCtx();
		if (!c) return;
		try {
			const t = c.currentTime;
			const dur = 0.35;
			const peak = t + 0.08;
			const end = t + dur;
			const baseFreq = 329.63 + (Math.random() - 0.5) * 20; // E4 ± 10Hz

			const main = c.createOscillator();
			main.type = "sawtooth";
			main.frequency.setValueAtTime(baseFreq, t);
			main.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, peak);
			main.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, end);

			const f1 = c.createOscillator();
			f1.frequency.setValueAtTime(baseFreq * 1.5, t);
			f1.frequency.exponentialRampToValueAtTime(baseFreq * 2.86, peak);
			f1.frequency.exponentialRampToValueAtTime(baseFreq * 1.26, end);

			const f2 = c.createOscillator();
			f2.frequency.setValueAtTime(baseFreq * 3, t);
			f2.frequency.exponentialRampToValueAtTime(baseFreq * 5.5, peak);
			f2.frequency.exponentialRampToValueAtTime(baseFreq * 2.52, end);

			const filter = c.createBiquadFilter();
			filter.type = "bandpass";
			filter.Q.value = 2;
			filter.frequency.setValueAtTime(1200, t);
			filter.frequency.linearRampToValueAtTime(2800, peak);
			filter.frequency.linearRampToValueAtTime(1000, end);

			const mainGain = c.createGain();
			mainGain.gain.setValueAtTime(0, t);
			mainGain.gain.linearRampToValueAtTime(0.6, t + 0.02);
			mainGain.gain.linearRampToValueAtTime(0.8, peak);
			mainGain.gain.linearRampToValueAtTime(0, end);

			const formantGain = c.createGain();
			formantGain.gain.setValueAtTime(0, t);
			formantGain.gain.linearRampToValueAtTime(0.25, t + 0.03);
			formantGain.gain.linearRampToValueAtTime(0.4, peak);
			formantGain.gain.linearRampToValueAtTime(0, end);

			const master = c.createGain();
			master.gain.value = MASTER_GAIN;

			main
				.connect(mainGain)
				.connect(filter)
				.connect(master)
				.connect(c.destination);
			f1.connect(formantGain).connect(filter);
			f2.connect(formantGain);

			main.start(t);
			f1.start(t);
			f2.start(t);
			main.stop(end);
			f1.stop(end);
			f2.stop(end);
		} catch {}
	},

	ghostApproach: () => {
		if (!isSoundEnabled()) return;
		const c = getCtx();
		if (!c) return;
		try {
			const t = c.currentTime;
			const totalDur = 3.5;

			// Long reverb for cathedral resonance
			const convolver = c.createConvolver();
			const reverbLen = c.sampleRate * 3;
			const reverbBuf = c.createBuffer(2, reverbLen, c.sampleRate);
			for (let ch = 0; ch < 2; ch++) {
				const data = reverbBuf.getChannelData(ch);
				for (let i = 0; i < reverbLen; i++) {
					data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (reverbLen * 0.35));
				}
			}
			convolver.buffer = reverbBuf;

			const dry = c.createGain();
			dry.gain.value = 0.5;
			const wet = c.createGain();
			wet.gain.value = 0.5;

			const master = c.createGain();
			master.gain.value = MASTER_GAIN;

			// Harmonic pad: sustained E major chord (E3, G#3, B3) + ghostly Bb
			const padNotes = [164.81, 207.65, 246.94, 116.54]; // E3, G#3, B3, Bb2
			for (const [freq, i] of padNotes.entries()) {
				const osc = c.createOscillator();
				osc.type = "sine";
				osc.frequency.value = freq;

				// Slight detune for warmth
				const osc2 = c.createOscillator();
				osc2.type = "sine";
				osc2.frequency.value = freq * 1.003;

				const padGain = c.createGain();
				const amp = i === 3 ? 0.06 : 0.1; // Bb quieter
				padGain.gain.setValueAtTime(0, t);
				padGain.gain.linearRampToValueAtTime(amp, t + 0.8);
				padGain.gain.setValueAtTime(amp, t + totalDur - 0.8);
				padGain.gain.linearRampToValueAtTime(0, t + totalDur);

				osc.connect(padGain);
				osc2.connect(padGain);
				padGain.connect(master).connect(c.destination);

				osc.start(t);
				osc2.start(t);
				osc.stop(t + totalDur + 0.5);
				osc2.stop(t + totalDur + 0.5);
			}

			// Westminster chimes: G#4 → F#4 → E4 → B3
			// Long decay (2.5s+) so notes overlap and blend
			const chimeNotes = [
				{ freq: 415.3, time: 0.2 }, // G#4
				{ freq: 369.99, time: 0.75 }, // F#4
				{ freq: 329.63, time: 1.3 }, // E4
				{ freq: 246.94, time: 1.85 }, // B3 (dominant)
			];

			// Bell partials (non-harmonic) + beating from "cracked bell" effect
			const bellPartials = [1, 2.0, 3.0, 4.2, 5.4];

			for (const { freq, time } of chimeNotes.values()) {
				const start = t + time;

				for (const [ratio, i] of bellPartials.entries()) {
					// Main partial
					const osc = c.createOscillator();
					osc.type = "sine";
					osc.frequency.value = freq * ratio * 0.998; // slight flat

					// Beating partial (Big Ben crack effect)
					const osc2 = c.createOscillator();
					osc2.type = "sine";
					osc2.frequency.value = freq * ratio * 1.002; // slight sharp

					const amp = 0.4 / (i + 1);
					const decay = 2.5 - i * 0.3; // long decay, higher partials shorter

					const gain = c.createGain();
					gain.gain.setValueAtTime(amp, start);
					gain.gain.exponentialRampToValueAtTime(0.001, start + decay);

					osc.connect(gain);
					osc2.connect(gain);
					gain.connect(dry).connect(master);
					if (i < 3) gain.connect(convolver).connect(wet).connect(master);

					osc.start(start);
					osc2.start(start);
					osc.stop(start + decay + 0.2);
					osc2.stop(start + decay + 0.2);
				}
			}
		} catch {}
	},

	ghostWink: () => {
		if (!isSoundEnabled()) return;
		const c = getCtx();
		if (!c) return;
		try {
			const t = c.currentTime;

			// Resolution: B3 → E4 → G#4 (ascending to tonic, same octave as approach)
			const winkNotes = [
				{ freq: 246.94, time: 0 }, // B3
				{ freq: 329.63, time: 0.08 }, // E4 (tonic!)
				{ freq: 415.3, time: 0.16 }, // G#4
			];

			const master = c.createGain();
			master.gain.value = MASTER_GAIN;

			// Light reverb
			const convolver = c.createConvolver();
			const reverbLen = c.sampleRate * 0.8;
			const reverbBuf = c.createBuffer(2, reverbLen, c.sampleRate);
			for (let ch = 0; ch < 2; ch++) {
				const data = reverbBuf.getChannelData(ch);
				for (let i = 0; i < reverbLen; i++) {
					data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (reverbLen * 0.15));
				}
			}
			convolver.buffer = reverbBuf;

			const wet = c.createGain();
			wet.gain.value = 0.3;

			winkNotes.forEach(({ freq, time }) => {
				const osc = c.createOscillator();
				osc.type = "sine";
				osc.frequency.value = freq;

				const osc2 = c.createOscillator();
				osc2.type = "sine";
				osc2.frequency.value = freq * 2; // octave harmonic

				const start = t + time;

				const gain = c.createGain();
				gain.gain.setValueAtTime(0.4, start);
				gain.gain.exponentialRampToValueAtTime(0.01, start + 0.4);

				const gain2 = c.createGain();
				gain2.gain.setValueAtTime(0.15, start);
				gain2.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

				osc.connect(gain);
				osc2.connect(gain2);
				gain.connect(master).connect(c.destination);
				gain.connect(convolver).connect(wet).connect(c.destination);
				gain2.connect(master);

				osc.start(start);
				osc2.start(start);
				osc.stop(start + 0.5);
				osc2.stop(start + 0.3);
			});
		} catch {}
	},
};
