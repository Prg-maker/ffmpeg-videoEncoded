import ConfigF from './config/video-encoding-config.ts'
import AudioEncodingConfig from './config/audio-encoding-config.ts'

const dir = "./src/video.mp4";


const audioConfig = new AudioEncodingConfig(dir)


audioConfig.extract_audio()