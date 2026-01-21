import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";




class VideoProcessor {
    private  file_directory: string;

    constructor(file_directory:string){
        this.file_directory = file_directory;
        ffmpeg.setFfmpegPath(ffmpegStatic as string);

    }
    public processVideo():void{

        ffmpeg(this.file_directory).ffprobe((err, metadata) => {
        if (err) {
            console.error("Error getting video info:", err);
            return;
        }
        console.log("Video duration:", metadata.format.duration);
        console.log(
            "Video resolution:",
            metadata.streams[0].width + "x" + metadata.streams[0].height,
        );
        });



    ffmpeg(this.file_directory)
      .output("./assets/output/video_m.mp4")
      .videoCodec("libx264")
      .audioCodec("aac")
      .videoBitrate("5000k")
      .audioBitrate("192k")
      .audioChannels(2)
      .audioFrequency(48000)
    
    
      .on("start", (commandLine) => {
        console.log(" Comando:", commandLine);
      })
      .on("progress", (progress) => {
        if (progress.percent)
          console.log(` Progresso: ${progress.percent.toFixed(1)}%`);
      })
      .on("end", () => {
        console.log(" Terminou o processo!");
      })
      .on("error", (err) => {
        console.error(" Erro:", err.message);
      })
      .run();
    
    }

}


export default VideoProcessor;