import AudioTransformText from './config/audio-transform-text.ts'
import {  transform_mp3_to_wav } from './utils/transform-mp3-to-wav.ts'

//const  audioTransformText= new AudioTransformText('./assets/output/audio_extracted.mp3')

//audioTransformText.AudioConvertText()

//const dir = "./src/video.mp4";
const dir = "./assets/output/audio_extracted.mp3"



async function p(){
    await transform_mp3_to_wav(dir)
} 

p()
