(() => {
const $=NINJA.$,U=NINJA.Utils;

NINJA.Project={
 init(){
   $('saveProject').onclick=()=>this.save();
   $('loadProject').onclick=()=>$('projectFile').click();
   $('projectFile').onchange=e=>this.load(e.target.files[0]);
 },

 save(){
   const data={
     version:'v16.0.0',
     scenes:NINJA.Scenes.list,
     strokes:NINJA.Draw.export(),
     players:NINJA.Players.roster,
     tactics:NINJA.Tactics.export()
   };
   U.download(
     'ninja_work_data.json',
     new Blob([JSON.stringify(data,null,2)],{type:'application/json'})
   );
   U.status('作業データを保存しました');
 },

 load(file){
   if(!file)return;
   const reader=new FileReader();
   reader.onload=()=>{
     try{
       const data=JSON.parse(reader.result);
       NINJA.Scenes.list=data.scenes||[];
       NINJA.Draw.import(data.strokes||[]);
       if(data.players)NINJA.Players.roster=data.players;
       NINJA.Players.render();
       if(data.tactics)NINJA.Tactics.import(data.tactics);
       NINJA.Scenes.render();
       U.status('作業データを読み込みました');
     }catch(e){
       alert('作業データを読み込めませんでした');
     }
   };
   reader.readAsText(file);
 }
};
})();