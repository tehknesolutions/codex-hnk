export interface AcousticAnalysis {
  sampleRateHz: number;
  sampleCount: number;
  durationSeconds: number;
  rms: number;
  rmsDbfs: number;
  peak: number;
  peakDbfs: number;
  zeroCrossingRate: number;
  dominantFrequencyHz: number;
  spectralCentroidHz: number;
  waveform: number[];
  spectrum: number[];
}

const EPSILON = 1e-12;

function dbfs(amplitude: number): number {
  if (amplitude <= EPSILON) return -120;
  return Math.max(-120, 20 * Math.log10(Math.min(1, amplitude)));
}

export function decodeFloat32Pcm(data: ArrayBuffer, channels = 1): Float32Array {
  if (!Number.isInteger(channels) || channels < 1) throw new Error('invalid_channel_count');
  const interleaved = new Float32Array(data);
  if (channels === 1) return new Float32Array(interleaved);

  const frames = Math.floor(interleaved.length / channels);
  const mono = new Float32Array(frames);
  for (let frame = 0; frame < frames; frame += 1) {
    let sum = 0;
    for (let channel = 0; channel < channels; channel += 1) {
      sum += interleaved[frame * channels + channel] ?? 0;
    }
    mono[frame] = sum / channels;
  }
  return mono;
}

function powerOfTwoAtMost(value: number, cap: number): number {
  const limit = Math.max(2, Math.min(value, cap));
  let size = 1;
  while (size * 2 <= limit) size *= 2;
  return size;
}

function fftInPlace(real: Float64Array, imag: Float64Array): void {
  const n = real.length;
  if (n !== imag.length || n < 2 || (n & (n - 1)) !== 0) throw new Error('fft_size_must_be_power_of_two');

  for (let i = 1, j = 0; i < n; i += 1) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const realValue = real[i];
      real[i] = real[j];
      real[j] = realValue;
      const imagValue = imag[i];
      imag[i] = imag[j];
      imag[j] = imagValue;
    }
  }

  for (let length = 2; length <= n; length <<= 1) {
    const angle = (-2 * Math.PI) / length;
    const wLengthReal = Math.cos(angle);
    const wLengthImag = Math.sin(angle);
    for (let start = 0; start < n; start += length) {
      let wReal = 1;
      let wImag = 0;
      const half = length >> 1;
      for (let offset = 0; offset < half; offset += 1) {
        const even = start + offset;
        const odd = even + half;
        const oddReal = real[odd] * wReal - imag[odd] * wImag;
        const oddImag = real[odd] * wImag + imag[odd] * wReal;
        const evenReal = real[even];
        const evenImag = imag[even];
        real[even] = evenReal + oddReal;
        imag[even] = evenImag + oddImag;
        real[odd] = evenReal - oddReal;
        imag[odd] = evenImag - oddImag;
        const nextReal = wReal * wLengthReal - wImag * wLengthImag;
        wImag = wReal * wLengthImag + wImag * wLengthReal;
        wReal = nextReal;
      }
    }
  }
}

function downsampleAbsolute(samples: Float32Array, points: number): number[] {
  if (samples.length === 0) return Array.from({ length: points }, () => 0);
  return Array.from({ length: points }, (_, index) => {
    const start = Math.floor((index * samples.length) / points);
    const end = Math.max(start + 1, Math.floor(((index + 1) * samples.length) / points));
    let max = 0;
    for (let i = start; i < Math.min(end, samples.length); i += 1) max = Math.max(max, Math.abs(samples[i] ?? 0));
    return Math.min(1, max);
  });
}

function downsampleSpectrum(magnitudes: Float64Array, bins: number): number[] {
  if (magnitudes.length === 0) return Array.from({ length: bins }, () => 0);
  let globalMax = 0;
  for (const value of magnitudes) globalMax = Math.max(globalMax, value);
  if (globalMax <= EPSILON) return Array.from({ length: bins }, () => 0);

  return Array.from({ length: bins }, (_, index) => {
    const start = Math.floor((index * magnitudes.length) / bins);
    const end = Math.max(start + 1, Math.floor(((index + 1) * magnitudes.length) / bins));
    let max = 0;
    for (let i = start; i < Math.min(end, magnitudes.length); i += 1) max = Math.max(max, magnitudes[i] ?? 0);
    return Math.min(1, max / globalMax);
  });
}

export function analyzeFloat32Pcm(samples: Float32Array, sampleRateHz: number, maxFftSize = 2048): AcousticAnalysis {
  if (!Number.isFinite(sampleRateHz) || sampleRateHz <= 0) throw new Error('invalid_sample_rate');
  if (!Number.isInteger(maxFftSize) || maxFftSize < 32) throw new Error('invalid_fft_size');

  let sumSquares = 0;
  let peak = 0;
  let crossings = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const value = Number.isFinite(samples[i]) ? samples[i] : 0;
    sumSquares += value * value;
    peak = Math.max(peak, Math.abs(value));
    if (i > 0) {
      const previous = samples[i - 1] ?? 0;
      if ((previous < 0 && value >= 0) || (previous >= 0 && value < 0)) crossings += 1;
    }
  }

  const rms = samples.length ? Math.sqrt(sumSquares / samples.length) : 0;
  const fftSize = powerOfTwoAtMost(samples.length, maxFftSize);
  const real = new Float64Array(fftSize);
  const imag = new Float64Array(fftSize);
  const offset = Math.max(0, samples.length - fftSize);

  for (let i = 0; i < fftSize; i += 1) {
    const hann = fftSize > 1 ? 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1))) : 1;
    real[i] = (samples[offset + i] ?? 0) * hann;
  }

  fftInPlace(real, imag);
  const half = fftSize >> 1;
  const magnitudes = new Float64Array(half);
  let dominantIndex = 0;
  let dominantMagnitude = 0;
  let weightedHz = 0;
  let magnitudeSum = 0;

  for (let i = 1; i < half; i += 1) {
    const magnitude = Math.hypot(real[i], imag[i]);
    magnitudes[i] = magnitude;
    const frequency = (i * sampleRateHz) / fftSize;
    if (magnitude > dominantMagnitude) {
      dominantMagnitude = magnitude;
      dominantIndex = i;
    }
    weightedHz += frequency * magnitude;
    magnitudeSum += magnitude;
  }

  return {
    sampleRateHz,
    sampleCount: samples.length,
    durationSeconds: samples.length / sampleRateHz,
    rms,
    rmsDbfs: dbfs(rms),
    peak,
    peakDbfs: dbfs(peak),
    zeroCrossingRate: samples.length > 1 ? crossings / (samples.length - 1) : 0,
    dominantFrequencyHz: dominantMagnitude > EPSILON ? (dominantIndex * sampleRateHz) / fftSize : 0,
    spectralCentroidHz: magnitudeSum > EPSILON ? weightedHz / magnitudeSum : 0,
    waveform: downsampleAbsolute(samples, 48),
    spectrum: downsampleSpectrum(magnitudes, 36),
  };
}
