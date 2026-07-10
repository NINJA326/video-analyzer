(() => {
const $=NINJA.$;

NINJA.Comments={
  expireAt:null,

  init(){
    $('memo').onfocus=()=>{
      NINJA.Video.pause();
      NINJA.Recorder.pause('コメント入力中');
    };

    $('memo').oninput=()=>{
      NINJA.Video.pause();
      NINJA.Recorder.pause('コメント入力中');
    };

    document.querySelectorAll('[data-tag]').forEach(b=>{
      b.onclick=()=>{
        NINJA.Video.pause();
        NINJA.Recorder.pause('コメント入力中');
        this.insert('['+b.dataset.tag+']');
      };
    });

    $('showText').onclick=()=>this.show(this.get());
  },

  insert(t){
    $('memo').value += ($('memo').value && !$('memo').value.endsWith('\n') ? ' ' : '') + t;
    $('memo').focus();
  },

  get(){
    return $('memo').value.trim();
  },

  clear(){
    $('memo').value='';
  },

  show(t){
    if(!t) return;

    NINJA.Video.pause();
    $('floatText').textContent=t;
    $('floatText').style.display='block';

    // 動画時間で3.5秒後に消える
    const sec=window.NINJA_SETTINGS?.commentSeconds||3.5;this.expireAt=NINJA.Video.currentTime()+sec;

    this.clear();

    // 録画・動画は実時間3.5秒後に再開
    NINJA.Recorder.resume((window.NINJA_SETTINGS?.commentSeconds||3.5)*1000);
  },

  tickText(){
    if(this.expireAt!==null && NINJA.Video.currentTime()>=this.expireAt){
      $('floatText').style.display='none';
      this.expireAt=null;
    }
  }
};
})();