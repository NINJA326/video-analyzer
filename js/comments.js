(() => {
const $=NINJA.$;
NINJA.Comments={expireAt:null,
 init(){$('memo').onfocus=()=>{NINJA.Video.pause();NINJA.Recorder.pause('コメント入力中')};$('memo').oninput=()=>{NINJA.Video.pause();NINJA.Recorder.pause('コメント入力中')};document.querySelectorAll('[data-tag]').forEach(b=>b.onclick=()=>this.insert('['+b.dataset.tag+']'));$('showText').onclick=()=>this.show(this.get())},
 insert(t){$('memo').value+=($('memo').value&&!$('memo').value.endsWith('\n')?' ':'')+t;$('memo').focus()},get(){return $('memo').value.trim()},clear(){$('memo').value=''},show(t){if(!t)return;NINJA.Video.pause();$('floatText').textContent=t;$('floatText').style.display='block';this.expireAt=NINJA.Video.currentTime()+3.5;this.clear();NINJA.Recorder.resume(3500)},tickText(){if(this.expireAt!==null&&NINJA.Video.currentTime()>=this.expireAt){$('floatText').style.display='none';this.expireAt=null}}
};
})();