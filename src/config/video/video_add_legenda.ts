
import ffmpeg from "fluent-ffmpeg";


class AddLegenda{

    private legendapath:string
    private videopath:string
    
    constructor(legendaPath:string , videoPath:string){
        this.legendapath = legendaPath
        this.videopath = videoPath
    }

    public async add_legenda(){
        const legenda = "./assets/legendas/srt/audio_extracted.srt"
        const video = "./video1.mp4"
        ffmpeg(video)
    .videoFilters([
        {
            filter: 'subtitles',
            options: {
                filename: legenda,
                // Opções de estilo (opcional)
                   force_style: 'FontName=Trebuchet MS,FontSize=24,PrimaryColour=&H00FFFFFF&,OutlineColour=&H00000000&,BorderStyle=1,Outline=1'
            }
        }
    ])
    .on('start', (commandLine) => {
        console.log('Comando executado:', commandLine);
    })
    .on('progress', (progress) => {
        console.log(`Processando: ${progress.percent?.toFixed(0)}%`);
    })
    .on('end', () => {
        console.log('✅ Vídeo processado com sucesso!');
    })
    .on('error', (err) => {
        console.error('❌ Erro:', err.message);
    })
    .save("videocomlegenda.mp4");
    } 
}


export default AddLegenda