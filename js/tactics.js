(() => {
const $=NINJA.$;

NINJA.Tactics={
  visible:false,
  courtVisible:true,
  courtMode:'full',
  opacity:.72,
  pieces:[],
  dragging:null,
  dragOffsetX:0,
  dragOffsetY:0,

  init(){
    $('tacticsShow').onclick=()=>this.show();
    $('tacticsCornerClose').onclick=()=>this.hide();
    $('tacticsDelete').onclick=()=>this.deleteBoard();
    $('tacticsCourt').onclick=()=>this.toggleCourt();
    $('tacticsPlayers').onclick=()=>this.ensurePlayers();
    $('tacticsFullCourt').onclick=()=>this.setCourtMode('full');
    $('tacticsHalfCourt').onclick=()=>this.setCourtMode('half');
    $('tacticsReset').onclick=()=>this.reset();
    $('tacticsClear').onclick=()=>this.clear();
    $('tacticsOpacity').oninput=e=>this.setOpacity(Number(e.target.value)/100);

    document.addEventListener('pointermove',e=>this.dragMove(e));
    document.addEventListener('pointerup',()=>this.dragEnd());

    this.load();
    this.renderCourt();
  },

  show(){
    this.visible=true;
    $('tacticsOverlay').hidden=false;
    $('tacticsToolbar').hidden=false;
    this.ensurePlayers();
    this.render();
    NINJA.Utils.status('FIBA作戦ボード表示：選手とボールを配置できます');
  },

  hide(){
    this.visible=false;
    $('tacticsOverlay').hidden=true;
    $('tacticsToolbar').hidden=true;
    this.save();
    NINJA.Utils.status('作戦ボードを非表示');
  },

  deleteBoard(){
    this.visible=false;
    this.pieces=[];
    this.courtVisible=true;
    this.courtMode='full';
    this.opacity=.72;
    $('tacticsOverlay').hidden=true;
    $('tacticsToolbar').hidden=true;
    $('tacticsOpacity').value='72';
    localStorage.removeItem('ninjaTacticsState');
    this.render();
    NINJA.Utils.status('作戦ボードを削除しました');
  },

  toggleCourt(){
    this.courtVisible=!this.courtVisible;
    this.render();
    this.save();

    NINJA.Utils.status(
      this.courtVisible
        ? 'コート線を表示しました'
        : 'コート線だけ非表示：選手とボールは残っています'
    );
  },

  setCourtMode(mode){
    if(mode!== 'full' && mode!=='half') return;
    this.courtMode=mode;
    this.pieces=this.defaultPieces();
    this.render();
    this.save();
    NINJA.Utils.status(mode==='full'?'オールコート表示':'ハーフコート表示');
  },

  setOpacity(value){
    this.opacity=value;
    this.render();
    this.save();
  },

  defaultPieces(){
    const pieces=[];
    const offense=this.courtMode==='full'
      ? [[1,.20,.24],[2,.20,.40],[3,.20,.60],[4,.20,.76],[5,.36,.50]]
      : [[1,.22,.18],[2,.22,.38],[3,.22,.62],[4,.22,.82],[5,.48,.50]];
    const defense=this.courtMode==='full'
      ? [[1,.80,.24],[2,.80,.40],[3,.80,.60],[4,.80,.76],[5,.64,.50]]
      : [[1,.62,.18],[2,.62,.38],[3,.62,.62],[4,.62,.82],[5,.76,.50]];

    offense.forEach(([n,x,y])=>pieces.push({id:'o'+n,type:'offense',label:String(n),x,y}));
    defense.forEach(([n,x,y])=>pieces.push({id:'d'+n,type:'defense',label:String(n),x,y}));
    pieces.push({id:'ball',type:'ball',label:'●',x:this.courtMode==='full'?.28:.32,y:.50});
    return pieces;
  },

  ensurePlayers(){
    if(!Array.isArray(this.pieces)||this.pieces.length===0)this.pieces=this.defaultPieces();
    this.render();
    this.save();
  },

  reset(){
    this.pieces=this.defaultPieces();
    this.courtVisible=true;
    this.opacity=.72;
    $('tacticsOpacity').value='72';
    this.render();
    this.save();
    NINJA.Utils.status('作戦ボードを初期配置に戻しました');
  },

  clear(){
    this.pieces=[];
    this.render();
    this.save();
    NINJA.Utils.status('選手とボールを全消去しました');
  },

  svgEl(name,attrs={}){
    const el=document.createElementNS('http://www.w3.org/2000/svg',name);
    Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));
    return el;
  },

  addCourtEnd(svg,basketX,mirror=false){
    const line={fill:'none',stroke:'rgba(255,255,255,.96)','stroke-width':5,'vector-effect':'non-scaling-stroke'};
    const direction=mirror?-1:1;
    const freeThrowX=basketX+direction*422.5;
    const boardX=basketX-direction*37.5;
    const keyX=mirror?freeThrowX:0;
    const keyW=422.5;

    svg.appendChild(this.svgEl('line',{x1:boardX,y1:660,x2:boardX,y2:840,...line}));
    svg.appendChild(this.svgEl('circle',{cx:basketX,cy:750,r:22.5,...line}));

    svg.appendChild(this.svgEl('rect',{
      x:mirror?freeThrowX:0,y:505,width:keyW,height:490,...line
    }));
    svg.appendChild(this.svgEl('line',{x1:freeThrowX,y1:505,x2:freeThrowX,y2:995,...line}));
    svg.appendChild(this.svgEl('circle',{cx:freeThrowX,cy:750,r:180,...line}));

    const ncPath=mirror
      ? `M ${basketX} 625 A 125 125 0 0 0 ${basketX} 875`
      : `M ${basketX} 625 A 125 125 0 0 1 ${basketX} 875`;
    svg.appendChild(this.svgEl('path',{d:ncPath,...line}));

    const intersect=mirror?basketX-141.4:basketX+141.4;
    svg.appendChild(this.svgEl('line',{
      x1:mirror?2800:0,y1:90,x2:intersect,y2:90,...line
    }));
    svg.appendChild(this.svgEl('line',{
      x1:mirror?2800:0,y1:1410,x2:intersect,y2:1410,...line
    }));
    const arc=mirror
      ? `M ${intersect} 90 A 675 675 0 0 0 ${intersect} 1410`
      : `M ${intersect} 90 A 675 675 0 0 1 ${intersect} 1410`;
    svg.appendChild(this.svgEl('path',{d:arc,...line}));
  },

  renderCourt(){
    const svg=$('courtOverlay');
    if(!svg)return;
    svg.innerHTML='';
    const line={fill:'none',stroke:'rgba(255,255,255,.96)','stroke-width':5,'vector-effect':'non-scaling-stroke'};

    if(this.courtMode==='full'){
      svg.setAttribute('viewBox','0 0 2800 1500');
      svg.appendChild(this.svgEl('rect',{x:2.5,y:2.5,width:2795,height:1495,...line}));
      svg.appendChild(this.svgEl('line',{x1:1400,y1:0,x2:1400,y2:1500,...line}));
      svg.appendChild(this.svgEl('circle',{cx:1400,cy:750,r:180,...line}));
      this.addCourtEnd(svg,157.5,false);
      this.addCourtEnd(svg,2642.5,true);
      // Throw-in lines
      [832.5,1967.5].forEach(x=>{
        svg.appendChild(this.svgEl('line',{x1:x,y1:0,x2:x,y2:150,...line}));
        svg.appendChild(this.svgEl('line',{x1:x,y1:1350,x2:x,y2:1500,...line}));
      });
    }else{
      svg.setAttribute('viewBox','0 0 1400 1500');
      svg.appendChild(this.svgEl('rect',{x:2.5,y:2.5,width:1395,height:1495,...line}));
      svg.appendChild(this.svgEl('line',{x1:1400,y1:0,x2:1400,y2:1500,...line}));
      svg.appendChild(this.svgEl('path',{d:'M 1400 570 A 180 180 0 0 0 1400 930',...line}));
      this.addCourtEnd(svg,157.5,false);
      svg.appendChild(this.svgEl('line',{x1:832.5,y1:0,x2:832.5,y2:150,...line}));
      svg.appendChild(this.svgEl('line',{x1:832.5,y1:1350,x2:832.5,y2:1500,...line}));
    }
  },

  render(){
    const overlay=$('tacticsOverlay');
    const court=$('courtOverlay');
    const host=$('tacticsPieces');
    if(!overlay||!court||!host)return;

    overlay.style.opacity=String(this.opacity);
    court.style.display=this.courtVisible?'block':'none';

    const courtToggleButton=$('tacticsCourt');
    if(courtToggleButton){
      courtToggleButton.textContent=this.courtVisible
        ? 'コートだけ消す'
        : 'コートを表示';
      courtToggleButton.classList.toggle('active',!this.courtVisible);
    }

    const courtButton=$('tacticsCourt');
    if(courtButton){
      courtButton.textContent=this.courtVisible
        ? 'コートだけ消す'
        : 'コートを表示';
      courtButton.classList.toggle('active',!this.courtVisible);
    }

    $('tacticsFullCourt').classList.toggle('active',this.courtMode==='full');
    $('tacticsHalfCourt').classList.toggle('active',this.courtMode==='half');
    this.renderCourt();

    host.innerHTML='';
    this.pieces.forEach(piece=>{
      const el=document.createElement('div');
      el.className='tacticsPiece '+piece.type;
      el.dataset.id=piece.id;
      el.textContent=piece.label;
      el.style.left=(piece.x*100)+'%';
      el.style.top=(piece.y*100)+'%';
      el.addEventListener('pointerdown',e=>this.dragStart(e,piece.id));
      host.appendChild(el);
    });
  },

  dragStart(event,id){
    if(!this.visible)return;
    NINJA.Video.pause();
    const rect=$('videoBox').getBoundingClientRect();
    const piece=this.pieces.find(item=>item.id===id);
    if(!piece)return;
    this.dragging=id;
    this.dragOffsetX=event.clientX-(rect.left+piece.x*rect.width);
    this.dragOffsetY=event.clientY-(rect.top+piece.y*rect.height);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  },

  dragMove(event){
    if(!this.dragging)return;
    const rect=$('videoBox').getBoundingClientRect();
    const piece=this.pieces.find(item=>item.id===this.dragging);
    if(!piece)return;
    let x=(event.clientX-rect.left-this.dragOffsetX)/rect.width;
    let y=(event.clientY-rect.top-this.dragOffsetY)/rect.height;
    piece.x=Math.max(.025,Math.min(.975,x));
    piece.y=Math.max(.045,Math.min(.955,y));
    this.render();
  },

  dragEnd(){
    if(!this.dragging)return;
    this.dragging=null;
    this.save();
    NINJA.Utils.status('作戦ボード操作完了：録画は継続しています');
  },

  export(){
    return{
      visible:this.visible,
      courtVisible:this.courtVisible,
      courtMode:this.courtMode,
      opacity:this.opacity,
      pieces:JSON.parse(JSON.stringify(this.pieces))
    };
  },

  import(data){
    if(!data)return;
    this.visible=false;
    this.courtVisible=data.courtVisible!==false;
    this.courtMode=data.courtMode==='half'?'half':'full';
    this.opacity=Number(data.opacity||.72);
    this.pieces=JSON.parse(JSON.stringify(data.pieces||[]));
    $('tacticsOpacity').value=String(Math.round(this.opacity*100));
    $('tacticsOverlay').hidden=true;
    $('tacticsToolbar').hidden=true;
    this.render();
  },

  save(){
    localStorage.setItem('ninjaTacticsState',JSON.stringify(this.export()));
  },

  load(){
    try{
      const saved=localStorage.getItem('ninjaTacticsState');
      if(saved){
        const data=JSON.parse(saved);
        data.visible=false;
        this.import(data);
      }else{
        this.visible=false;
        this.pieces=[];
        $('tacticsOverlay').hidden=true;
        $('tacticsToolbar').hidden=true;
      }
    }catch(error){
      this.visible=false;
      this.pieces=[];
      $('tacticsOverlay').hidden=true;
      $('tacticsToolbar').hidden=true;
    }
  },

  drawCourtCanvas(ctx,w,h){
    const padX=w*.03,padY=h*.03;
    const cw=w*.94,ch=h*.94;
    ctx.strokeStyle='rgba(255,255,255,.96)';
    ctx.lineWidth=Math.max(2,w/560);
    ctx.fillStyle='transparent';

    const sx=this.courtMode==='full'?cw/2800:cw/1400;
    const sy=ch/1500;
    const X=x=>padX+x*sx;
    const Y=y=>padY+y*sy;
    const R=r=>r*Math.min(sx,sy);

    ctx.strokeRect(X(0),Y(0),this.courtMode==='full'?2800*sx:1400*sx,1500*sy);

    const drawEnd=(basketX,mirror=false)=>{
      const direction=mirror?-1:1;
      const ft=basketX+direction*422.5;
      const board=basketX-direction*37.5;
      ctx.beginPath();ctx.moveTo(X(board),Y(660));ctx.lineTo(X(board),Y(840));ctx.stroke();
      ctx.beginPath();ctx.arc(X(basketX),Y(750),R(22.5),0,Math.PI*2);ctx.stroke();
      ctx.strokeRect(X(mirror?ft:0),Y(505),422.5*sx,490*sy);
      ctx.beginPath();ctx.arc(X(ft),Y(750),R(180),0,Math.PI*2);ctx.stroke();
      ctx.beginPath();
      ctx.arc(X(basketX),Y(750),R(125),mirror?Math.PI/2:-Math.PI/2,mirror?Math.PI*1.5:Math.PI/2,!mirror);
      ctx.stroke();

      const intersect=mirror?basketX-141.4:basketX+141.4;
      ctx.beginPath();
      ctx.moveTo(X(mirror?(this.courtMode==='full'?2800:1400):0),Y(90));
      ctx.lineTo(X(intersect),Y(90));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(X(mirror?(this.courtMode==='full'?2800:1400):0),Y(1410));
      ctx.lineTo(X(intersect),Y(1410));
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(X(basketX),Y(750),R(675),Math.asin((90-750)/675),Math.asin((1410-750)/675),mirror);
      ctx.stroke();
    };

    if(this.courtMode==='full'){
      ctx.beginPath();ctx.moveTo(X(1400),Y(0));ctx.lineTo(X(1400),Y(1500));ctx.stroke();
      ctx.beginPath();ctx.arc(X(1400),Y(750),R(180),0,Math.PI*2);ctx.stroke();
      drawEnd(157.5,false);
      drawEnd(2642.5,true);
    }else{
      ctx.beginPath();ctx.moveTo(X(1400),Y(0));ctx.lineTo(X(1400),Y(1500));ctx.stroke();
      ctx.beginPath();ctx.arc(X(1400),Y(750),R(180),Math.PI/2,Math.PI*1.5);ctx.stroke();
      drawEnd(157.5,false);
    }
  },

  drawToCanvas(ctx,w,h){
    if(!this.visible)return;
    ctx.save();
    ctx.globalAlpha=this.opacity;
    if(this.courtVisible)this.drawCourtCanvas(ctx,w,h);

    this.pieces.forEach(piece=>{
      const px=piece.x*w,py=piece.y*h;
      const radius=piece.type==='ball'?15:21;
      ctx.beginPath();ctx.arc(px,py,radius,0,Math.PI*2);
      ctx.fillStyle=piece.type==='offense'?'#d40000':piece.type==='defense'?'#075985':'#f59e0b';
      ctx.fill();
      ctx.strokeStyle=piece.type==='ball'?'#111':'#fff';
      ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle=piece.type==='ball'?'#111':'#fff';
      ctx.font=`bold ${piece.type==='ball'?10:14}px sans-serif`;
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(piece.label,px,py);
    });
    ctx.restore();
    ctx.textBaseline='alphabetic';
  }
};
})();