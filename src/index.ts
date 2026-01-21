import ConfigF from './config/video-encoding-config.ts'


const dir = "./src/video.mp4";

const c = new ConfigF(dir)

c.process_youtube_video_short()