import { pipeline } from '@huggingface/transformers'
import {createReadStream , createWriteStream} from 'fs'
import waveFile  from 'wavefile'; 

interface OutputInterface {
    text : string
    chunks: []
}

interface OutputInterfaceTimestamp{
    timestamp: Number[]
    text:string
}
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
            language: 'pt',                     
            task: 'transcribe',
            stride_length_s: 5,                 
            chunk_length_s: 30,
            batch_size: 16,
            return_timestamps: true
        }) as OutputInterface;
        let end = performance.now();


        const stream = createWriteStream("./assets/out.txt", {})



        stream.write(output.text)


        for (let chunk  of output.chunks) {
            stream.write(JSON.stringify(chunk) + '\n')
        } 

        stream.end()
        console.log(`Execution duration: ${(end - start) / 1000} seconds`);
    }
}

export default AudioTransformText;