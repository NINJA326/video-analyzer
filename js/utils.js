window.NINJA = window.NINJA || {};
NINJA.$ = id => document.getElementById(id);
NINJA.Utils = {
  fmt(t){ if(!isFinite(t)) return '00:00.00'; const m=Math.floor(t/60), s=Math.floor(t%60), cs=Math.floor((t%1)*100); return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`; },
  status(msg){ NINJA.$('status').textContent='状態：'+msg; },
  esc(s){ return String(s||'').replace(/[&<>]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[ch])); },
  download(name,data){ const a=document.createElement('a'); a.download=name; a.href=typeof data==='string'?data:URL.createObjectURL(data); a.click(); if(typeof data!=='string') setTimeout(()=>URL.revokeObjectURL(a.href),5000); }
};
