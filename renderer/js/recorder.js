(() => {
const $=NINJA.$, U=NINJA.Utils;

NINJA.Recorder={
 media:null,
 chunks:[],
 canvas:null,
 ctx:null,
 timer:null,
 isRecording:false,
 isPaused:false,
 mode:null,
 displayStream:null,

 init(){
   $('recStart').onclick=()=>this.startCanvasRecord();
   $('ytScreenRec').onclick=()=>this.startScreenRecord();
   $('recStop').onclick=()=>this.stop();
   $('shot').onclick=()=>this.saveImage();
 },

 setButtons(recording, label='● 録画中'){
   $('recStart').classList.toggle('disabled', recording);
   $('ytScreenRec').classList.toggle('disabled', recording);
   $('recStop').classList.toggle('disabled', !recording);
   if(recording){
     if(this.mode==='screen') $('ytScreenRec').textContent=label;
     else $('recStart').textContent=label;
   }else{
     $('recStart').textContent='● 録画開始';
     $('ytScreenRec').textContent='● YouTube解説録画';
   }
 },

 pause(reason='編集中'){
   if(!this.isRecording || this.isPaused || !this.media) return;
   if(this.mode==='screen'){
     // 画面録画ではブラウザ仕様上、編集操作もそのまま録画されます。
     // 動画だけを止めて、編集の様子を見せる運用にします。
     NINJA.Video.pause();
     U.status('画面録画中：'+reason);
     return;
   }
   if(this.media.state==='recording'){
     try{ this.media.pause(); }catch(e){}
   }
   this.isPaused=true;
   this.setButtons(true,'● 録画一時停止中');
   U.status('録画一時停止：'+reason);
 },

 resume(delay=0){
   if(!this.isRecording || !this.media) return;
   setTimeout(()=>{
     if(this.mode==='screen'){
       NINJA.Video.play();
       U.status('YouTube解説録画中');
       return;
     }
     if(this.isPaused && this.media.state==='paused'){
       try{ this.media.resume(); }catch(e){}
     }
     this.isPaused=false;
     this.setButtons(true,'● 録画中');
     U.status('録画再開');
     NINJA.Video.play();
   },delay);
 },

 size(){
   const q=$('quality').value;
   const sw=$('video').videoWidth||1280, sh=$('video').videoHeight||720;
   if(q==='light'){
     const s=Math.min(1,1280/sw);
     return {w:Math.round(sw*s),h:Math.round(sh*s),fps:30,bitrate:6000000};
   }
   if(q==='max') return {w:sw,h:sh,fps:60,bitrate:28000000};
   return {w:sw,h:sh,fps:30,bitrate:16000000};
 },

 drawComposite(ctx,w,h){
   ctx.imageSmoothingEnabled=true;
   ctx.imageSmoothingQuality='high';
   ctx.fillStyle='#000';
   ctx.fillRect(0,0,w,h);
   const v=$('video');
   if(v.videoWidth) ctx.drawImage(v,0,0,w,h);
   NINJA.Draw.drawAll(ctx,w/$('draw').width,h/$('draw').height);

   const f=$('floatText');
   if(f.style.display!=='none'&&f.textContent){
     const text=f.textContent;
     ctx.font='bold 42px sans-serif';
     ctx.textAlign='center';
     const tw=Math.min(ctx.measureText(text).width+70,w*.86);
     const x=w/2-tw/2,y=h*.82;
     ctx.fillStyle='rgba(0,0,0,.72)';
     ctx.fillRect(x,y,tw,74);
     ctx.fillStyle='#fff';
     ctx.fillText(text,w/2,y+50,tw-30);
   }
 },

 createRecorder(stream, bitrate=16000000){
   const types=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
   const mimeType=types.find(t=>window.MediaRecorder && MediaRecorder.isTypeSupported(t))||'';
   const options=mimeType?{mimeType,videoBitsPerSecond:bitrate}:{videoBitsPerSecond:bitrate};
   return new MediaRecorder(stream,options);
 },

 bindRecorder(filename){
   this.chunks=[];
   this.media.ondataavailable=e=>{if(e.data.size)this.chunks.push(e.data)};
   this.media.onstop=()=>{
     clearInterval(this.timer);
     this.isRecording=false;
     this.isPaused=false;
     this.setButtons(false);
     const type=this.media.mimeType||'video/webm';
     U.download(filename,new Blob(this.chunks,{type}));
     U.status('録画を保存しました');
     if(this.displayStream){
       this.displayStream.getTracks().forEach(t=>t.stop());
       this.displayStream=null;
     }
   };
   this.media.start(1000);
   this.isRecording=true;
   this.isPaused=false;
   this.setButtons(true,'● 録画中');
 },

 startCanvasRecord(){
   if(this.isRecording) return;
   if(NINJA.Video.mode!=='mp4'){
     alert('YouTubeモードでは「YouTube解説録画」を使用してください。');
     return;
   }
   if(!$('video').src){
     alert('先にMP4を読み込んでください');
     return;
   }

   const q=this.size();
   this.canvas=document.createElement('canvas');
   this.canvas.width=q.w;
   this.canvas.height=q.h;
   this.ctx=this.canvas.getContext('2d',{alpha:false,desynchronized:true});

   const stream=this.canvas.captureStream(q.fps);
   if($('video').captureStream){
     try{$('video').captureStream().getAudioTracks().forEach(t=>stream.addTrack(t))}catch(e){}
   }

   try{
     this.media=this.createRecorder(stream,q.bitrate);
   }catch(e){
     alert('録画を開始できません。Chromeで試してください。');
     return;
   }

   this.mode='canvas';
   this.timer=setInterval(()=>this.drawComposite(this.ctx,this.canvas.width,this.canvas.height),1000/q.fps);
   this.bindRecorder('ninja_analysis_record.webm');
   U.status('MP4録画中');
 },

 async startScreenRecord(){
   if(this.isRecording) return;
   if(!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia){
     alert('このブラウザは画面録画に対応していません。Chromeを使用してください。');
     return;
   }

   try{
     this.displayStream=await navigator.mediaDevices.getDisplayMedia({
       video:{
         frameRate:{ideal:30,max:60},
         width:{ideal:1920},
         height:{ideal:1080}
       },
       audio:true,
       preferCurrentTab:true,
       selfBrowserSurface:'include',
       systemAudio:'include'
     });

     const track=this.displayStream.getVideoTracks()[0];
     track.addEventListener('ended',()=>this.stop());

     this.media=this.createRecorder(this.displayStream,18000000);
     this.mode='screen';
     this.bindRecorder('ninja_youtube_commentary.webm');
     U.status('YouTube解説録画中：このタブを共有しています');
   }catch(e){
     console.error(e);
     U.status('画面録画をキャンセルしました');
   }
 },

 stop(){
   if(this.media && (this.media.state==='recording'||this.media.state==='paused')){
     this.media.stop();
   }
 },

 saveImage(){
   if(NINJA.Video.mode!=='mp4'){
     alert('YouTubeモードでは映像込み画像保存はできません。');
     return;
   }
   const v=$('video'),c=document.createElement('canvas'),ctx=c.getContext('2d');
   c.width=v.videoWidth||1280;
   c.height=v.videoHeight||720;
   this.drawComposite(ctx,c.width,c.height);
   U.download('ninja_scene.png',c.toDataURL('image/png'));
 }
};
})();