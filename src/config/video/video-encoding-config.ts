  import ffmpeg from "fluent-ffmpeg";
  import ffmpegStatic from "ffmpeg-static";


  interface video_encoded_options {
    name: string;
    size?: "default" | "youtube_short"| "instagram_reel" | number;
    type: "mp4" | "mov" | "avi";
  }
  class VideoEncodingConfig {


    private file_directory : string ;
    private name :string;

    constructor(file_directory: string) {
      this.file_directory = file_directory;

      this.name = file_directory.split("/").filter(n => {
        if(n.includes(".mp4")) return n
      })[0]

      
      ffmpeg.setFfmpegPath(ffmpegStatic as string );

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
      
      
    
    }
    public process_video_default(): void {
      ffmpeg(this.file_directory)
        .output(`./assets/video/default/${this.name.split(".")[0]}_default.mp4`)
        .videoCodec("libx264")
        .audioCodec("aac")
        .videoBitrate("5000k")
        .audioBitrate("192k")
        .audioChannels(2)
        .audioFrequency(48000)

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

    public process_youtube_video_short(): void {

      console.log(this.name)
      ffmpeg(this.file_directory)
        // arrumar esse this.file_directory, pega todo diretorio mas so quero pegar o nome
        .output(`./assets/video/youtube_short/${this.name.split(".")[0]}_youtube_short.mp4`)
        .videoCodec("libx264")

        
        .audioCodec("aac")
        .videoFilters([
          {
            filter: "scale",
            options: "1080:1920:force_original_aspect_ratio=increase",
          },
          {
            filter: "crop",
            options: "1080:1920",
          },
        ])
        .fps(30)
        .videoBitrate("8000k")
        .audioBitrate("192k")
        .audioChannels(2)
        .audioFrequency(48000)
        .outputOptions([
          "-profile:v high",
          "-level 4.2",
          "-pix_fmt yuv420p",
          "-movflags +faststart",
          "-g 60",
        ])
        .on("progress", (progress) => {
          if (progress.percent)
            console.log(` Progresso: ${progress.percent.toFixed(1)}%`);
        })
        .on("end", () => {
          console.log("Short pronto para YouTube 🚀");
        })
        .on("error", (err) => {
          console.error("Erro:", err);
        })
        .run();
    }

    // falta implementar as outras configurações de tamanho e tipo de arquivo
    public process_video_default_with_options({
      name,
      type,
      size,
    }: video_encoded_options):void{
      

      ffmpeg(this.file_directory)
            .output(`./assets/output/${name}.${type}`)
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

  export default VideoEncodingConfig;
