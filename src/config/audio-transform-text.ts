import { pipeline } from '@huggingface/transformers'
import {createReadStream} from 'fs'
import waveFile  from 'wavefile'; 

class AudioTransformText{
    private file_directory:string

    constructor(file_directory:string){
        this.file_directory = file_directory
    }


    public async AudioConvertText():Promise<void>{
        const audio_directory = "./assets/audio1.wav";
        //let transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');
        
        let transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small')
        
        const audio = createReadStream(audio_directory , {
            highWaterMark: 1024  ,
            encoding: undefined
        })

   
        async function streamforbuffer(stream : any){
            const chunks = []
            for await (const chunk of stream){
                chunks.push(chunk)
            }
            return Buffer.concat(chunks)
        }
        const buffer = await streamforbuffer(audio)


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

        let start = performance.now();
        let output = await transcriber(audioData ,{
            language: 'pt',                     // Forçar português
            task: 'transcribe',
            stride_length_s: 5,                 // Overlap de 5s entre chunks
            chunk_length_s: 30,
            batch_size: 16 
        });
        let end = performance.now();

        console.log(`Execution duration: ${(end - start) / 1000} seconds`);
        console.log(output.text);
    }
}

export default AudioTransformText;