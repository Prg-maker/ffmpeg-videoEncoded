import { pipeline } from '@huggingface/transformers'
import {createReadStream , createWriteStream} from 'fs'
import waveFile  from 'wavefile'; 
import {transform_mp3_to_wav} from '../../utils/transform-mp3-to-wav.ts'

interface OutputInterface {
    text : string
    chunks: [
       
    ]
}




class AudioTransformText{
    private audio_directory:string
    constructor(audio_directory:string){
        this.audio_directory = audio_directory
       
    }

    
    public async AudioConvertText():Promise<void>{
        //let transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');

        const typefile = this.audio_directory.split(".").pop()
        
        if(typefile!= 'wav'){
                await transform_mp3_to_wav(this.audio_directory)
        }
        const name = this.audio_directory.split("/").pop()?.split(".")[0]
        const directory = `./assets/wav/${name}.wav`
        console.log(directory)
        let transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small')
        
        const audio = createReadStream(directory , {
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
            // @ts-ignore 
            batch_size: 16,
            return_timestamps: true
        }) as OutputInterface;
        let end = performance.now();


        const stream = createWriteStream("./assets/out.txt", )
        const streamJson = createWriteStream("./assets/out.json",{
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
}

export default AudioTransformText;