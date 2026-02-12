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
        //let transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');



        await this.ensureWavFormat()
        
        
        const transcriber = await this.initializeTranscriberMode()
      
   
        const buffer = await this.loadAndProcessAudio()

       const audioData = this.processAudioBuffer(buffer)

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


        const stream = createWriteStream(`./assets/legendas/text/${this.name}.txt`, {
            flags: 'w',
            
        })
        const streamJson = createWriteStream(`./assets/legendas/timestamp/${this.name}.json`,{
            flags:'w'
        })



        const dados = output.chunks

        stream.write(output.text)

        streamJson.write("[ \n")
        dados.forEach((item, index)=>{
            const linha = JSON.stringify(item);
            const isLast = index === dados.length - 1;
            streamJson.write('  ' + linha + (isLast ? '' : ',') + '\n');
        } )
        streamJson.write("]")

        
        
        stream.end()
        console.log(`Execution duration: ${(end - start) / 1000} seconds`);
    }

    private async ensureWavFormat(){

        const typefile = this.audioPath.split(".").pop()
        
        if(typefile!= 'wav'){
            await transform_mp3_to_wav(this.audioPath)
            this.audioPath = `./assets/wav/${this.name}.wav`
        }
    }

    private async initializeTranscriberMode(){
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





}

export default AudioTranscriber;