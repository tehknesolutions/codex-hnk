export interface HnkAcousticAnalysisV1 {
  schema: 'hnk-acoustic-analysis-v1';
  sampleRateHz: number;
  analyzedSampleCount: number;
  durationSeconds: number;
  rms: number;
  peak: number;
  zeroCrossingRate: number;
  spectralCentroidHz: number;
  dominantFrequencyHz: number;
  lowBandEnergyRatio: number;
  midBandEnergyRatio: number;
  highBandEnergyRatio: number;
  spectralFrames: number;
}

export interface HnkAcousticAnalysisAccumulator {
  push(samples: Float32Array, sampleRateHz: number): void;
  snapshot(durationSeconds: number): HnkAcousticAnalysisV1;
  reset(): void;
}

export interface HnkPcmWavCapture {
  push(samples: Float32Array, inputSampleRateHz: number): void;
  wavBytes(): Uint8Array;
  outputSampleRateHz(): number;
  sampleCount(): number;
  reset(): void;
}

function clamp01(value: number): number { return Math.max(0, Math.min(1, value)); }
function round(value: number, digits = 6): number { const p = 10 ** digits; return Math.round(value * p) / p; }
function isPowerOfTwo(value: number): boolean { return value > 0 && (value & (value - 1)) === 0; }
function floorPowerOfTwo(value: number): number { let n = 1; while (n * 2 <= value) n *= 2; return n; }

function fftMagnitude(samples: Float32Array): Float64Array {
  const n = samples.length;
  if (!isPowerOfTwo(n)) throw new Error('analysis_fft_size_must_be_power_of_two');
  const real = new Float64Array(n);
  const imag = new Float64Array(n);
  for (let i = 0; i < n; i += 1) {
    const hann = n === 1 ? 1 : 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1)));
    real[i] = samples[i] * hann;
  }
  for (let i = 1, j = 0; i < n; i += 1) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const tr = real[i]; real[i] = real[j]; real[j] = tr;
      const ti = imag[i]; imag[i] = imag[j]; imag[j] = ti;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const angle = (-2 * Math.PI) / len;
    const wLenCos = Math.cos(angle);
    const wLenSin = Math.sin(angle);
    for (let i = 0; i < n; i += len) {
      let wCos = 1;
      let wSin = 0;
      for (let j = 0; j < len / 2; j += 1) {
        const uR = real[i + j];
        const uI = imag[i + j];
        const vIndex = i + j + len / 2;
        const vR = real[vIndex] * wCos - imag[vIndex] * wSin;
        const vI = real[vIndex] * wSin + imag[vIndex] * wCos;
        real[i + j] = uR + vR;
        imag[i + j] = uI + vI;
        real[vIndex] = uR - vR;
        imag[vIndex] = uI - vI;
        const nextCos = wCos * wLenCos - wSin * wLenSin;
        wSin = wCos * wLenSin + wSin * wLenCos;
        wCos = nextCos;
      }
    }
  }
  const half = n / 2;
  const mag = new Float64Array(half);
  for (let i = 0; i < half; i += 1) mag[i] = Math.hypot(real[i], imag[i]);
  return mag;
}

function analyzeSpectrum(samples: Float32Array, sampleRateHz: number) {
  const usable = Math.min(2048, floorPowerOfTwo(samples.length));
  if (usable < 256) return null;
  const frame = samples.length === usable ? samples : samples.slice(samples.length - usable);
  const mag = fftMagnitude(frame);
  const binHz = sampleRateHz / usable;
  let total = 0, weighted = 0, low = 0, mid = 0, high = 0, dominant = 0, dominantMag = -1;
  for (let i = 1; i < mag.length; i += 1) {
    const hz = i * binHz;
    const energy = mag[i] * mag[i];
    total += energy;
    weighted += hz * energy;
    if (hz < 300) low += energy;
    else if (hz < 2000) mid += energy;
    else high += energy;
    if (mag[i] > dominantMag) { dominantMag = mag[i]; dominant = hz; }
  }
  return { centroid: total > 0 ? weighted / total : 0, dominant, low: total > 0 ? low / total : 0, mid: total > 0 ? mid / total : 0, high: total > 0 ? high / total : 0 };
}

export function createAcousticAnalysisAccumulatorV1(): HnkAcousticAnalysisAccumulator {
  let sampleRate = 0, samplesSeen = 0, sumSquares = 0, peak = 0, crossings = 0, previous: number | null = null;
  let spectralFrames = 0, centroidSum = 0, dominantSum = 0, lowSum = 0, midSum = 0, highSum = 0;
  return {
    push(samples, sampleRateHz) {
      if (!Number.isFinite(sampleRateHz) || sampleRateHz < 8000 || sampleRateHz > 192000) throw new Error('invalid_analysis_sample_rate');
      if (!(samples instanceof Float32Array) || samples.length === 0) return;
      if (sampleRate && Math.abs(sampleRate - sampleRateHz) > 1) throw new Error('analysis_sample_rate_changed');
      sampleRate = sampleRateHz;
      for (let i = 0; i < samples.length; i += 1) {
        const value = Math.max(-1, Math.min(1, Number.isFinite(samples[i]) ? samples[i] : 0));
        sumSquares += value * value; peak = Math.max(peak, Math.abs(value));
        if (previous !== null && ((previous < 0 && value >= 0) || (previous >= 0 && value < 0))) crossings += 1;
        previous = value;
      }
      samplesSeen += samples.length;
      const spectrum = analyzeSpectrum(samples, sampleRateHz);
      if (spectrum) { spectralFrames += 1; centroidSum += spectrum.centroid; dominantSum += spectrum.dominant; lowSum += spectrum.low; midSum += spectrum.mid; highSum += spectrum.high; }
    },
    snapshot(durationSeconds) {
      if (!Number.isFinite(durationSeconds) || durationSeconds <= 0 || durationSeconds > 180.5) throw new Error('invalid_analysis_duration');
      if (!sampleRate || !samplesSeen) throw new Error('acoustic_samples_required');
      const denom = Math.max(1, samplesSeen - 1);
      return { schema:'hnk-acoustic-analysis-v1', sampleRateHz:Math.round(sampleRate), analyzedSampleCount:samplesSeen, durationSeconds:round(durationSeconds,3), rms:round(Math.sqrt(sumSquares/samplesSeen)), peak:round(clamp01(peak)), zeroCrossingRate:round(crossings/denom), spectralCentroidHz:round(spectralFrames?centroidSum/spectralFrames:0,3), dominantFrequencyHz:round(spectralFrames?dominantSum/spectralFrames:0,3), lowBandEnergyRatio:round(spectralFrames?lowSum/spectralFrames:0), midBandEnergyRatio:round(spectralFrames?midSum/spectralFrames:0), highBandEnergyRatio:round(spectralFrames?highSum/spectralFrames:0), spectralFrames };
    },
    reset() { sampleRate=0;samplesSeen=0;sumSquares=0;peak=0;crossings=0;previous=null;spectralFrames=0;centroidSum=0;dominantSum=0;lowSum=0;midSum=0;highSum=0; },
  };
}

function writeAscii(view:DataView,offset:number,text:string){for(let i=0;i<text.length;i+=1)view.setUint8(offset+i,text.charCodeAt(i))}
export function createPcm16WavCaptureV1(targetSampleRateHz=24000):HnkPcmWavCapture{
  if(!Number.isInteger(targetSampleRateHz)||targetSampleRateHz<8000||targetSampleRateHz>48000)throw new Error('invalid_wav_target_sample_rate');
  let inputRate=0,phase=0;const samples:number[]=[];
  return{
    push(frame,rate){if(!(frame instanceof Float32Array)||!frame.length)return;if(!Number.isFinite(rate)||rate<8000||rate>192000)throw new Error('invalid_wav_input_sample_rate');if(inputRate&&Math.abs(inputRate-rate)>1)throw new Error('wav_input_sample_rate_changed');inputRate=rate;const ratio=rate/targetSampleRateHz;for(let i=0;i<frame.length;i+=1){if(phase<=0){samples.push(Math.max(-1,Math.min(1,Number.isFinite(frame[i])?frame[i]:0)));phase+=ratio}phase-=1}},
    wavBytes(){if(!samples.length)throw new Error('wav_samples_required');const dataSize=samples.length*2;const out=new Uint8Array(44+dataSize);const view=new DataView(out.buffer);writeAscii(view,0,'RIFF');view.setUint32(4,36+dataSize,true);writeAscii(view,8,'WAVE');writeAscii(view,12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,targetSampleRateHz,true);view.setUint32(28,targetSampleRateHz*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);writeAscii(view,36,'data');view.setUint32(40,dataSize,true);for(let i=0;i<samples.length;i+=1)view.setInt16(44+i*2,Math.max(-32768,Math.min(32767,Math.round(samples[i]*32767))),true);return out},
    outputSampleRateHz(){return targetSampleRateHz},sampleCount(){return samples.length},reset(){inputRate=0;phase=0;samples.length=0},
  }
}
