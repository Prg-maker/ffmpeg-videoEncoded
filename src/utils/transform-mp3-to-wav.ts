import ffmpeg from "fluent-ffmpeg";

export function transform_mp3_to_wav(input_path: string) {
  return new Promise((reject, resolve) => {

    
    const name_file = input_path.split("/").filter((n) => {
      if (n.includes("mp3")) return n;
    })[0];


    ffmpeg(input_path)
      .toFormat("wav")
      .audioCodec("pcm_s16le")
      .audioFrequency(44100)
      .audioChannels(2)
      .on("end", () => {
        console.log("Conversão concluída!");
      })
      .on("error", (err) => {
        console.error("Erro na conversão:", err);
      })
      .save(`./assets/wav/${name_file}.wav`);
  });
}
