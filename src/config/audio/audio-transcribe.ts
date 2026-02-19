import { pipeline } from '@huggingface/transformers'
import {createReadStream , createWriteStream} from 'fs'
import waveFile  from 'wavefile'; 
import {transform_mp3_to_wav} from '../../utils/transform-mp3-to-wav.ts'


interface Chunk{
    timestamp: [number , number]
    text:string
}

interface TranscriptionOutput {
    text : string
    chunks: Chunk[]
}




class AudioTranscriber{
    private audioPath:string
    private name : string | undefined
    
    constructor(audioPath:string){
        this.audioPath = audioPath
       this.name = this.audioPath.split("/").pop()?.split(".")[0]
    }

    
    public async transcribe():Promise<void>{


        await this.ensureWavFormat()
        const transcriber = await this.initializeTranscriberMode()
        const buffer = await this.loadAndProcessAudio()
        const audioData = this.processAudioBuffer(buffer)
        const output = await this.performTranscription(transcriber, audioData)
        this.saveTranscription(output)
        
        
        
    }
    private async ensureWavFormat(){

        const typefile = this.audioPath.split(".").pop()
        
        if(typefile!= 'wav'){
            await transform_mp3_to_wav(this.audioPath)
            this.audioPath = `./assets/wav/${this.name}.wav`
        }
    }

    private async initializeTranscriberMode(){
        //let transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');
        return await await pipeline('automatic-speech-recognition', 'Xenova/whisper-small')
    }

    private async loadAndProcessAudio(){
        
        const audioBuffer = await this.streamToBuffer()

        return audioBuffer
    }

    private async streamToBuffer():Promise<Buffer>{
        
        const audio = createReadStream(this.audioPath , {
            highWaterMark: 1024  ,
            encoding: undefined
        })
        
        const chunks: Buffer[] = []

        for await (const chunk of audio){
            chunks.push(chunk )
        }
        return Buffer.concat(chunks as any);
    }

    private  processAudioBuffer(buffer: Buffer){

        let wav = new waveFile.WaveFile(buffer as any)

        wav.toBitDepth('32f'); 
        wav.toSampleRate(16000); 
        let audioData = wav.getSamples();
        if (Array.isArray(audioData)) {
        if (audioData.length > 1) {
            const SCALING_FACTOR = Math.sqrt(2);

            
            for (let i = 0; i < audioData[0].length; ++i) {
            audioData[0][i] = SCALING_FACTOR * (audioData[0][i] + audioData[1][i]) / 2;
            }
        }

        
        audioData = audioData[0];
        }

        return audioData  ;
    }

    private async performTranscription(transcriber: any, audioData:any):Promise<TranscriptionOutput>{
        let start = performance.now();
        
        let output = await transcriber(audioData ,{
            language: 'pt',                     
            task: 'transcribe',
            stride_length_s: 5,                 
            chunk_length_s: 30,
            // @ts-ignore 
            batch_size: 16,
            return_timestamps: true
        }) as TranscriptionOutput;
        let end = performance.now();

        console.log(`Execution duration: ${(end - start) / 1000} seconds`);


        return output
    }

    private async saveTranscription(transcription:TranscriptionOutput):Promise<void>{
        const filename = this.name || "trasncription"

        await Promise.all([
            this.saveTextFile(filename, transcription.text),
            this.saveTextJson(filename, transcription.chunks),
            this.saveSrt(filename, transcription.chunks)
        ])
    }

    private async saveTextFile(filename: string , content: string):Promise<void>{
        const stream = createWriteStream(`./assets/legendas/text/${filename}.txt`, {
            flags: "w"
        })

        stream.write(content)
        stream.end()

    }



    private async saveTextJson(filaname:string, content:Chunk[]):Promise<void>{

        const streamJson = createWriteStream(`./assets/legendas/timestamp/${this.name}.json`,{
            flags:'w'
        })

        streamJson.write("[ \n")
        content.forEach((item, index)=>{
            const linha = JSON.stringify(item);
            const isLast = index === content.length - 1;
            streamJson.write('  ' + linha + (isLast ? '' : ',') + '\n');
        } )
        streamJson.write("]")
        streamJson.end()

    }

    private formatTimeSRT(seconds: number): string {
  const totalSeconds = Math.max(0, seconds);
  
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  const ms = Math.floor((totalSeconds - Math.floor(totalSeconds)) * 1000);
  
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}


    private async saveSrt(filaname:string, content:Chunk[]):Promise<void>{

        const streamSrt = createWriteStream(`./assets/legendas/srt/${this.name}.srt`,{
            flags:'w',
               encoding: 'utf8'
        }) 
        
        content.forEach((item, index) => {
            const startTime = this.formatTimeSRT(item.timestamp[0])
            const endTime = this.formatTimeSRT(item.timestamp[1])
            const text= item.text.trim()
            streamSrt.write(`${index + 1}\n`);
            streamSrt.write(`${startTime} --> ${endTime}\n`);
            streamSrt.write(`${text}\n\n`);
        })

    }



}

export default AudioTranscriber;