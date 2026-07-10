(() => {
const $=NINJA.$,U=NINJA.Utils;
NINJA.Scenes={list:[],
 init(){$('saveScene').onclick=()=>this.save()},
 save(){this.list.unshift({time:NINJA.Video.currentTime(),memo:NINJA.Comments.get(),players:[...NINJA.Players.selected],strokes:NINJA.Draw.export()});NINJA.Comments.clear();NINJA.Players.selected=[];NINJA.Players.render();this.render();U.status('場面保存しました')},
 render(){const el=$('scenes');el.innerHTML='';this.list.forEach((s,i)=>{const d=document.createElement('div');d.className='scene';const ps=s.players.length?`<div class="small">選手：${s.players.join('・')}</div>`:'';d.innerHTML=`<b>${U.fmt(s.time)}</b>${ps}<br>${U.esc(s.memo||'コメントなし')}<div class="actions"><button data-go="${i}">移動</button><button data-load="${i}">書込復元</button><button data-del="${i}">削除</button></div>`;el.appendChild(d)});el.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{NINJA.Video.pause();NINJA.Video.seek(this.list[b.dataset.go].time)});el.querySelectorAll('[data-load]').forEach(b=>b.onclick=()=>NINJA.Draw.import(this.list[b.dataset.load].strokes));el.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{this.list.splice(b.dataset.del,1);this.render()})}
};
})();