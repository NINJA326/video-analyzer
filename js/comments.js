(() => {
const $=NINJA.$;

NINJA.Comments={
  hideTimer:null,

  init(){
    const savedDuration=localStorage.getItem(
      'ninjaCommentDuration'
    );

    if(savedDuration&&$('commentDuration')){
      $('commentDuration').value=savedDuration;
    }

    if($('commentDuration')){
      $('commentDuration').onchange=()=>{
        localStorage.setItem(
          'ninjaCommentDuration',
          $('commentDuration').value
        );
      };
    }

    // コメント入力中だけ録画を一時停止。
    $('memo').onfocus=()=>{
      NINJA.Video.pause();

      if(NINJA.Recorder.isRecording){
        NINJA.Recorder.pause('コメント入力中');
      }
    };

    $('memo').oninput=()=>{
      NINJA.Video.pause();

      if(NINJA.Recorder.isRecording){
        NINJA.Recorder.pause('コメント入力中');
      }
    };

    document.querySelectorAll('[data-tag]').forEach(button=>{
      button.onclick=()=>{
        NINJA.Video.pause();

        if(NINJA.Recorder.isRecording){
          NINJA.Recorder.pause('コメント入力中');
        }

        this.insert('['+button.dataset.tag+']');
      };
    });

    $('showText').onclick=()=>this.show(this.get());
  },

  insert(text){
    $('memo').value+=(
      $('memo').value&&
      !$('memo').value.endsWith('\n')
        ?' '
        :''
    )+text;

    $('memo').focus();
  },

  get(){
    return $('memo').value.trim();
  },

  clear(){
    $('memo').value='';
  },

  durationSeconds(){
    return Number(
      $('commentDuration')?.value||3.5
    );
  },

  show(text){
    if(!text)return;

    if(!$('video').src){
      alert('先にMP4を読み込んでください');
      return;
    }

    const seconds=this.durationSeconds();

    NINJA.Video.pause();

    // ボタンを押した瞬間に、コメント入力中に止めた録画を再開。
    if(NINJA.Recorder.isRecording&&NINJA.Recorder.isPaused){
      NINJA.Recorder.resume();
    }

    $('floatText').textContent=text;
    $('floatText').style.display='block';

    this.clear();
    clearTimeout(this.hideTimer);

    NINJA.Utils.status(
      `録画中：コメントを${seconds.toFixed(1)}秒表示`
    );

    this.hideTimer=setTimeout(()=>{
      $('floatText').style.display='none';

      // コメント表示後は動画を再生。録画は継続。
      NINJA.Video.play();

      NINJA.Utils.status(
        'コメント表示終了：動画再生・録画継続'
      );
    },seconds*1000);
  },

  tickText(){}
};
})();