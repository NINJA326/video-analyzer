(() => {
const $=NINJA.$;

NINJA.Stopwatch={
  running:false,
  elapsedMs:0,
  startedAt:0,
  rafId:null,
  dragging:false,
  dragOffsetX:0,
  dragOffsetY:0,

  init(){
    const show=$('stopwatchShow');
    const start=$('stopwatchStart');
    const reset=$('stopwatchReset');
    const hide=$('stopwatchHide');
    const drag=$('stopwatchDrag');

    show.onclick=()=>this.show();
    start.onclick=()=>this.toggle();
    reset.onclick=()=>this.reset();
    hide.onclick=()=>this.hide();

    drag.addEventListener('pointerdown',e=>this.dragStart(e));
    document.addEventListener('pointermove',e=>this.dragMove(e));
    document.addEventListener('pointerup',()=>this.dragEnd());

    const saved=localStorage.getItem('ninjaStopwatchPosition');
    if(saved){
      try{
        const pos=JSON.parse(saved);
        $('stopwatchWidget').style.left=pos.left+'px';
        $('stopwatchWidget').style.top=pos.top+'px';
      }catch(e){}
    }

    this.render();
  },

  show(){
    $('stopwatchWidget').hidden=false;
    this.keepInside();
    NINJA.Utils.status('ストップウォッチを表示');
  },

  hide(){
    $('stopwatchWidget').hidden=true;
    NINJA.Utils.status('ストップウォッチを非表示');
  },

  toggle(){
    if(this.running) this.pause();
    else this.start();
  },

  start(){
    if(this.running) return;
    this.running=true;
    this.startedAt=performance.now()-this.elapsedMs;
    $('stopwatchStart').textContent='停止';
    this.tick();
  },

  pause(){
    if(!this.running) return;
    this.elapsedMs=performance.now()-this.startedAt;
    this.running=false;
    $('stopwatchStart').textContent='開始';
    cancelAnimationFrame(this.rafId);
    this.render();
  },

  reset(){
    this.running=false;
    this.elapsedMs=0;
    this.startedAt=0;
    cancelAnimationFrame(this.rafId);
    $('stopwatchStart').textContent='開始';
    this.render();
  },

  currentMs(){
    return this.running
      ? performance.now()-this.startedAt
      : this.elapsedMs;
  },

  format(ms){
    const totalTenths=Math.floor(ms/100);
    const tenths=totalTenths%10;
    const totalSeconds=Math.floor(totalTenths/10);
    const seconds=totalSeconds%60;
    const minutes=Math.floor(totalSeconds/60);
    return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}.${tenths}`;
  },

  render(){
    $('stopwatchTime').textContent=this.format(this.currentMs());
  },

  tick(){
    if(!this.running) return;
    this.render();
    this.rafId=requestAnimationFrame(()=>this.tick());
  },

  dragStart(e){
    if(e.target.closest('button')) return;
    const widget=$('stopwatchWidget');
    const rect=widget.getBoundingClientRect();
    this.dragging=true;
    this.dragOffsetX=e.clientX-rect.left;
    this.dragOffsetY=e.clientY-rect.top;
    $('stopwatchDrag').setPointerCapture?.(e.pointerId);
  },

  dragMove(e){
    if(!this.dragging) return;
    const box=$('videoBox').getBoundingClientRect();
    const widget=$('stopwatchWidget');
    const width=widget.offsetWidth;
    const height=widget.offsetHeight;

    let left=e.clientX-box.left-this.dragOffsetX;
    let top=e.clientY-box.top-this.dragOffsetY;

    left=Math.max(0,Math.min(box.width-width,left));
    top=Math.max(0,Math.min(box.height-height,top));

    widget.style.left=left+'px';
    widget.style.top=top+'px';
    widget.style.right='auto';
    widget.style.bottom='auto';
  },

  dragEnd(){
    if(!this.dragging) return;
    this.dragging=false;
    const widget=$('stopwatchWidget');
    localStorage.setItem('ninjaStopwatchPosition',JSON.stringify({
      left:parseFloat(widget.style.left)||0,
      top:parseFloat(widget.style.top)||0
    }));
  },

  keepInside(){
    const box=$('videoBox');
    const widget=$('stopwatchWidget');
    const maxLeft=Math.max(0,box.clientWidth-widget.offsetWidth);
    const maxTop=Math.max(0,box.clientHeight-widget.offsetHeight);
    const left=Math.max(0,Math.min(maxLeft,parseFloat(widget.style.left)||18));
    const top=Math.max(0,Math.min(maxTop,parseFloat(widget.style.top)||18));
    widget.style.left=left+'px';
    widget.style.top=top+'px';
  }
};
})();