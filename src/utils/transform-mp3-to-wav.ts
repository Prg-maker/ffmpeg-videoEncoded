import ffmpeg from "fluent-ffmpeg";

export function transform_mp3_to_wav(input_path: string) {
  return new Promise((resolve, reject) => {

    const name = input_path.split("/").pop()?.split(".")[0]

    ffmpeg(input_path)
      .toFormat("wav")
      .audioCodec("pcm_s16le")
      .audioFrequency(44100)
      .audioChannels(2)
      .on("end", () => {
        console.log("Conversão concluída!");
        resolve()
      })
      .on("error", (err) => {
        console.error("Erro na conversão:", err);
        reject()
      })
      .save(`./assets/wav/${name}.wav`);
  });
}
