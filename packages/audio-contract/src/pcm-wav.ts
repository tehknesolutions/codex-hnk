export interface HnkPcm16WavCaptureV1{push(samples:Float32Array,inputSampleRateHz:number):void;wavBytes():Uint8Array;outputSampleRateHz():number;sampleCount():number;reset():void}
function writeAscii(view:DataView,offset:number,text:string){for(let i=0;i<text.length;i+=1)view.setUint8(offset+i,text.charCodeAt(i))}
export function createPcm16WavCaptureV1(targetSampleRateHz=24000):HnkPcm16WavCaptureV1{
 if(!Number.isInteger(targetSampleRateHz)||targetSampleRateHz<8000||targetSampleRateHz>48000)throw new Error('invalid_wav_target_sample_rate');
 let inputRate=0,phase=0,total=0;const chunks:Int16Array[]=[];
 return{
  push(frame,rate){if(!(frame instanceof Float32Array)||!frame.length)return;if(!Number.isFinite(rate)||rate<8000||rate>192000)throw new Error('invalid_wav_input_sample_rate');if(inputRate&&Math.abs(inputRate-rate)>1)throw new Error('wav_input_sample_rate_changed');inputRate=rate;const ratio=rate/targetSampleRateHz;const tmp=new Int16Array(Math.ceil(frame.length/Math.max(1,ratio))+2);let out=0;for(let i=0;i<frame.length;i+=1){if(phase<=0){const v=Math.max(-1,Math.min(1,Number.isFinite(frame[i])?frame[i]:0));tmp[out++]=Math.max(-32768,Math.min(32767,Math.round(v*32767)));phase+=ratio}phase-=1}if(out){const chunk=tmp.slice(0,out);chunks.push(chunk);total+=chunk.length}},
  wavBytes(){if(!total)throw new Error('wav_samples_required');const dataSize=total*2;const bytes=new Uint8Array(44+dataSize);const view=new DataView(bytes.buffer);writeAscii(view,0,'RIFF');view.setUint32(4,36+dataSize,true);writeAscii(view,8,'WAVE');writeAscii(view,12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,targetSampleRateHz,true);view.setUint32(28,targetSampleRateHz*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);writeAscii(view,36,'data');view.setUint32(40,dataSize,true);let offset=44;for(const chunk of chunks){for(let i=0;i<chunk.length;i+=1){view.setInt16(offset,chunk[i],true);offset+=2}}return bytes},
  outputSampleRateHz(){return targetSampleRateHz},sampleCount(){return total},reset(){inputRate=0;phase=0;total=0;chunks.length=0}
 }
}
