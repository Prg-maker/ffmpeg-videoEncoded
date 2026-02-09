import AudioTransformText from './config/audio/audio-transform-text.ts'
import {  transform_mp3_to_wav } from './utils/transform-mp3-to-wav.ts'
import VideoEncoding from './config/video/video-encoding-config.ts'
//const  audioTransformText= new AudioTransformText('./assets/output/audio_extracted.mp3')

//audioTransformText.AudioConvertText()

//const dir = "./src/video.mp4";
const dir = "./assets/output/audio_extracted.mp3"



const audio = new AudioTransformText(dir)
audio.AudioConvertText()
//const videoEncodig = new VideoEncoding(dir)
//videoEncodig.process_video_default()