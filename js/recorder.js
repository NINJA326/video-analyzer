(() => {
const $=NINJA.$,U=NINJA.Utils;

NINJA.Recorder={
 media:null,
 chunks:[],
 canvas:null,
 ctx:null,
 timer:null,
 isRecording:false,
 isPaused:false,

 init(){
   $('recStart').onclick=()=>this.start();
   $('recStop').onclick=()=>this.stop();
   $('shot').onclick=()=>this.saveImage();
   this.updateUI();
 },

 updateUI(){
   const indicator=$('recIndicator');
   const start=$('recStart');
   const stop=$('recStop');

   if(indicator) indicator.hidden=!this.isRecording;

   if(start){
     start.classList.toggle('disabled',this.isRecording);
     start.textContent=this.isRecording
       ? (this.isPaused?'● 一時停止中':'● 録画中')
       : '● 録画開始';
   }

   if(stop){
     stop.classList.toggle('disabled',!this.isRecording);
   }
 },

 pause(reason='編集中'){
   if(!this.isRecording||this.isPaused||!this.media)return;

   if(this.media.state==='recording'){
     try{this.media.pause()}catch(e){}
   }

   this.isPaused=true;
   this.updateUI();
   U.status('録画一時停止：'+reason);
 },

 resume(){
   if(!this.isRecording||!this.media)return;

   if(this.isPaused&&this.media.state==='paused'){
     try{this.media.resume()}catch(e){}
   }

   this.isPaused=false;
   this.updateUI();
   U.status('録画再開');
 },

 size(){
   const q=$('quality').value;
   const sw=$('video').videoWidth||1280;
   const sh=$('video').videoHeight||720;

   if(q==='light'){
     const s=Math.min(1,1280/sw);
     return{
       w:Math.round(sw*s),
       h:Math.round(sh*s),
       fps:30,
       bitrate:6000000
     };
   }

   if(q==='max'){
     return{w:sw,h:sh,fps:60,bitrate:28000000};
   }

   return{w:sw,h:sh,fps:30,bitrate:16000000};
 },

 drawComposite(ctx,w,h){
   ctx.imageSmoothingEnabled=true;
   ctx.imageSmoothingQuality='high';
   ctx.fillStyle='#000';
   ctx.fillRect(0,0,w,h);

   const video=$('video');
   if(video.videoWidth){
     ctx.drawImage(video,0,0,w,h);
   }

   NINJA.Draw.drawAll(
     ctx,
     w/$('draw').width,
     h/$('draw').height
   );

   const text=$('floatText');
   if(text.style.display!=='none'&&text.textContent){
     const value=text.textContent;
     ctx.font='bold 42px sans-serif';
     ctx.textAlign='center';

     const textWidth=Math.min(
       ctx.measureText(value).width+70,
       w*.86
     );

     const x=w/2-textWidth/2;
     const y=h*.82;

     ctx.fillStyle='rgba(0,0,0,.74)';
     ctx.fillRect(x,y,textWidth,74);

     ctx.fillStyle='#fff';
     ctx.fillText(
       value,
       w/2,
       y+50,
       textWidth-30
     );
   }

   if(window.NINJA?.Tactics){
     NINJA.Tactics.drawToCanvas(ctx,w,h);
   }

   const stopwatch=$('stopwatchWidget');
   if(stopwatch && !stopwatch.hidden){
     const videoBox=$('videoBox');
     const sx=w/videoBox.clientWidth;
     const sy=h/videoBox.clientHeight;
     const left=(parseFloat(stopwatch.style.left)||18)*sx;
     const top=(parseFloat(stopwatch.style.top)||18)*sy;
     const boxW=stopwatch.offsetWidth*sx;
     const boxH=stopwatch.offsetHeight*sy;
     const timeText=$('stopwatchTime').textContent;

     ctx.fillStyle='rgba(0,0,0,.78)';
     ctx.strokeStyle='rgba(255,255,255,.34)';
     ctx.lineWidth=2;
     ctx.fillRect(left,top,boxW,boxH);
     ctx.strokeRect(left,top,boxW,boxH);

     ctx.fillStyle='#fff';
     ctx.font=`bold ${Math.max(24,28*sx)}px sans-serif`;
     ctx.textAlign='center';
     ctx.textBaseline='middle';
     ctx.fillText(timeText,left+boxW/2,top+boxH*.42,boxW-20);
     ctx.textBaseline='alphabetic';
   }
 },

 createRecorder(stream,bitrate){
   const types=[
     'video/webm;codecs=vp9,opus',
     'video/webm;codecs=vp8,opus',
     'video/webm'
   ];

   const mimeType=types.find(
     type=>MediaRecorder.isTypeSupported(type)
   )||'';

   return new MediaRecorder(
     stream,
     mimeType
       ?{mimeType,videoBitsPerSecond:bitrate}
       :{videoBitsPerSecond:bitrate}
   );
 },

 start(){
   if(this.isRecording)return true;

   if(!$('video').src){
     alert('先にMP4を読み込んでください');
     $('file').click();
     return false;
   }

   const quality=this.size();

   this.canvas=document.createElement('canvas');
   this.canvas.width=quality.w;
   this.canvas.height=quality.h;
   this.ctx=this.canvas.getContext(
     '2d',
     {alpha:false,desynchronized:true}
   );

   const stream=this.canvas.captureStream(quality.fps);

   if($('video').captureStream){
     try{
       $('video')
         .captureStream()
         .getAudioTracks()
         .forEach(track=>stream.addTrack(track));
     }catch(e){}
   }

   try{
     this.media=this.createRecorder(
       stream,
       quality.bitrate
     );
   }catch(e){
     alert('録画を開始できません。Chromeで試してください。');
     return false;
   }

   this.chunks=[];

   this.media.ondataavailable=event=>{
     if(event.data.size){
       this.chunks.push(event.data);
     }
   };

   this.media.onstop=()=>{
     clearInterval(this.timer);

     this.isRecording=false;
     this.isPaused=false;
     this.updateUI();

     U.download(
       'ninja_analysis_record.webm',
       new Blob(
         this.chunks,
         {type:this.media.mimeType||'video/webm'}
       )
     );

     U.status('録画を保存しました');
   };

   this.timer=setInterval(
     ()=>this.drawComposite(
       this.ctx,
       this.canvas.width,
       this.canvas.height
     ),
     1000/quality.fps
   );

   this.media.start(1000);
   this.isRecording=true;
   this.isPaused=false;
   this.updateUI();

   U.status('録画開始');
   return true;
 },

 stop(){
   if(
     this.media&&
     (
       this.media.state==='recording'||
       this.media.state==='paused'
     )
   ){
     this.media.stop();
   }
 },

 saveImage(){
   if(!$('video').src){
     alert('先にMP4を読み込んでください');
     return;
   }

   const video=$('video');
   const canvas=document.createElement('canvas');
   const context=canvas.getContext('2d');

   canvas.width=video.videoWidth||1280;
   canvas.height=video.videoHeight||720;

   this.drawComposite(
     context,
     canvas.width,
     canvas.height
   );

   U.download(
     'ninja_scene.png',
     canvas.toDataURL('image/png')
   );
 }
};
})();