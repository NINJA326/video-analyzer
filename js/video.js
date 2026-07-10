(() => {
const $=NINJA.$,U=NINJA.Utils;

NINJA.Video={
 url:null,
 fps:30,
 mode:'mp4',

 init(){
   const v=$('video');

   $('file').onchange=e=>this.load(e.target.files[0]);

   $('videoBox').ondragover=e=>{
     e.preventDefault();
     $('videoBox').classList.add('dragging');
   };
   $('videoBox').ondragleave=()=> $('videoBox').classList.remove('dragging');
   $('videoBox').ondrop=e=>{
     e.preventDefault();
     $('videoBox').classList.remove('dragging');
     this.load(e.dataTransfer.files[0]);
   };

   v.onloadedmetadata=()=>{
     $('dur').textContent=U.fmt(v.duration);
     NINJA.Draw.resize();
     this.setStatus('MP4読込完了：編集・録画できます');
     U.status('動画読込完了');
   };

   v.ontimeupdate=()=>{
     this.updateUI();
     NINJA.Comments.tickText();
   };

   v.onerror=()=>{
     this.setStatus('MP4読込エラー',true);
     U.status('動画読込エラー');
   };

   $('play').onclick=()=>this.toggle();
   $('back5').onclick=()=>this.jump(-5);
   $('fwd5').onclick=()=>this.jump(5);
   $('frameBack').onclick=()=>this.step(-1);
   $('frameNext').onclick=()=>this.step(1);

   $('seek').oninput=()=>{
     this.pause();
     const d=this.duration();
     if(d) this.seek(($('seek').value/1000)*d);
   };

   document.querySelectorAll('[data-rate]').forEach(b=>{
     b.onclick=()=>{
       document.querySelectorAll('[data-rate]').forEach(x=>x.classList.remove('rateActive'));
       b.classList.add('rateActive');
       this.setRate(parseFloat(b.dataset.rate));
     };
   });

   this.setStatus('MP4を読み込んでください');
 },

 setStatus(text,loading=false){
   const box=$('sourceStatus');
   box?.classList.toggle('loading',loading);
   if($('sourceStatusText')) $('sourceStatusText').textContent=text;
 },

 load(file){
   if(!file) return;
   if(!file.type.startsWith('video/')){
     alert('動画ファイルを選択してください');
     return;
   }

   this.setStatus('MP4を読み込み中…',true);

   if(this.url) URL.revokeObjectURL(this.url);
   this.url=URL.createObjectURL(file);

   const v=$('video');
   v.pause();
   v.removeAttribute('src');
   v.load();
   v.src=this.url;
   v.controls=false;
   v.load();

   $('dropHint').style.display='none';
   U.status('MP4読込中：'+file.name);
   setTimeout(()=>NINJA.Draw.resize(),100);
 },

 toggle(){
   if(!$('video').src){
     $('file').click();
     return;
   }
   $('video').paused ? $('video').play().catch(()=>{}) : $('video').pause();
 },

 play(){
   if($('video').src) $('video').play().catch(()=>{});
 },

 pause(){
   $('video').pause();
 },

 currentTime(){
   return $('video').currentTime||0;
 },

 duration(){
   return $('video').duration||0;
 },

 seek(t){
   const d=this.duration();
   $('video').currentTime=Math.max(0,Math.min(d||999999,t));
 },

 jump(s){
   this.seek(this.currentTime()+s);
 },

 step(dir){
   this.pause();
   this.jump(dir/this.fps);
 },

 setRate(r){
   $('video').playbackRate=r;
 },

 updateUI(){
   const t=this.currentTime(),d=this.duration();
   $('cur').textContent=U.fmt(t);
   $('dur').textContent=U.fmt(d);
   if(d) $('seek').value=(t/d)*1000;
 }
};
})();