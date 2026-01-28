import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";

class AudioEncodingConfig {
  private file_directory: string;

  constructor(file_directory: string) {
    this.file_directory = file_directory;
    ffmpeg.setFfmpegPath(ffmpegStatic as string);

    ffmpeg(this.file_directory).ffprobe((err, metadata) => {
      if (err) {
        console.error("Error getting video info:", err);
        return;
      }
      console.log("Video duration:", metadata.format.duration);
    });
  }

  public extract_audio(): void {
    ffmpeg(this.file_directory)
      .noVideo()
      .output("./assets/output/audio_extracted.mp3")
      .audioCodec("libmp3lame")
      .audioBitrate("192k")
      .audioChannels(2)
      .audioFrequency(48000)
      .addOutputOption("-q:a", "0")
      .addOutputOption("-compression_level", "0")
      .format("mp3")
      .addOutputOption("-id3v2_version", "3")
      .addOutputOption("-write_xing", "0")
      .addOutputOption("-af", "loudnorm=I=-16:TP=-1.5:LRA=11")
      .addOutputOption("-ignore_unknown")
      .addOutputOption("-max_muxing_queue_size", "1024")
      .addOutputOption(
        "-af",
        "silenceremove=start_periods=1:start_duration=1:start_threshold=-50dB",
      )
      .on("error", (err) => {
        console.error("Error", err.message);
      })
      .on("progress", (progress) => {
        if (progress.percent)
          console.log(`Progresso: ${progress.percent.toFixed(1)}%`);
      })
      .on("end", _ => {
        console.log("O processo terminou!");
      })
      .run();
  }
}

export default AudioEncodingConfig;
