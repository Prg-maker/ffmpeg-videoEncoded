import AudioTransformText from './config/audio/audio-transcribe.ts'
import {  transform_mp3_to_wav } from './utils/transform-mp3-to-wav.ts'
import VideoEncoding from './config/video/video-encoding-config.ts'
//const  audioTransformText= new AudioTransformText('./assets/output/audio_extracted.mp3')

//audioTransformText.AudioConvertText()

//const dir = "./src/video.mp4";
const dir = "./assets/wav/audio_extracted.wav"



const audio = new AudioTransformText(dir)
audio.transcribe()
//const videoEncodig = new VideoEncoding(dir)
//videoEncodig.process_video_default()