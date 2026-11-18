import { layerToCss, type FoilLayer } from "./foil";

export interface Viewer3DOptions {
  /** Judul halaman (nama kartu). */
  title: string;
  /** Gambar depan tanpa foil (data URL PNG). Foil digerakkan oleh viewer. */
  frontSrc: string;
  /** Gambar belakang (data URL PNG). */
  backSrc: string;
  /** Lapisan foil. Kosongkan untuk kartu Basic. */
  foil: FoilLayer[];
}

/**
 * escapeHtml — amankan teks sebelum dimasukkan ke HTML.
 * Task:
 * 1. Ganti karakter & < > " ' dengan entitas HTML
 * 2. Kembalikan teks aman untuk atribut maupun isi elemen
 */
function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

const VIEWER_CSS = `
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html,body{height:100%;overflow:hidden;background:radial-gradient(1200px 700px at 80% -10%,rgba(99,102,241,.28),transparent 60%),radial-gradient(900px 600px at -10% 110%,rgba(236,72,153,.18),transparent 60%),#0a0b14;color:#e8e9f3;font-family:ui-rounded,system-ui,-apple-system,"Segoe UI",sans-serif;touch-action:none;user-select:none;-webkit-user-select:none}
main{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:16px 16px calc(16px + env(safe-area-inset-bottom))}
.scene{width:min(86vw,calc((100vh - 150px) * 390 / 545),420px);aspect-ratio:390/545;perspective:1100px;position:relative;cursor:grab}
.scene:active{cursor:grabbing}
.shadow{position:absolute;left:8%;right:8%;bottom:-6%;height:10%;background:radial-gradient(ellipse at center,rgba(0,0,0,.55),transparent 70%);filter:blur(10px)}
.card{position:absolute;inset:0;transform-style:preserve-3d;will-change:transform}
.face{position:absolute;inset:0;border-radius:5.64%/4.04%;overflow:hidden;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.face img{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;-webkit-user-drag:none}
.back{transform:rotateY(180deg)}
.front{isolation:isolate;--mx:50%;--my:50%}
.foil{position:absolute;inset:0;pointer-events:none}
.bar{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
button{font:inherit;font-weight:700;font-size:14px;color:#fff;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:10px 18px;cursor:pointer;touch-action:manipulation}
button:active{transform:scale(.97)}
button[hidden]{display:none}
.hint{font-size:12px;opacity:.55;text-align:center}
`;

const VIEWER_JS = `
(function(){
  var scene=document.getElementById('scene'),card=document.getElementById('card'),front=document.getElementById('front'),shadow=document.getElementById('shadow');
  var flipBtn=document.getElementById('flip'),gyroBtn=document.getElementById('gyro');
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var s={ry:0,rx:0,tRy:0,tRx:0,face:0,drag:false,lx:0,ly:0,vx:0,idleAt:performance.now()+1500,gyro:false,gy:0,gx:0};
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function touch(){s.idleAt=performance.now()+4000;}
  scene.addEventListener('pointerdown',function(e){s.drag=true;s.lx=e.clientX;s.ly=e.clientY;s.vx=0;touch();try{scene.setPointerCapture(e.pointerId);}catch(_){}});
  scene.addEventListener('pointermove',function(e){
    if(s.drag){
      var dx=e.clientX-s.lx,dy=e.clientY-s.ly;s.lx=e.clientX;s.ly=e.clientY;
      s.tRy+=dx*0.6;s.vx=dx*0.6;s.tRx=clamp(s.tRx-dy*0.35,-35,35);touch();
    }else if(e.pointerType==='mouse'&&!s.gyro){
      var r=scene.getBoundingClientRect();
      var px=(e.clientX-r.left)/r.width-0.5,py=(e.clientY-r.top)/r.height-0.5;
      s.tRy=s.face*180+px*28;s.tRx=-py*28;touch();
    }
  });
  function end(){if(!s.drag)return;s.drag=false;s.face=Math.round((s.tRy+s.vx*10)/180);s.tRy=s.face*180;s.tRx=0;touch();}
  scene.addEventListener('pointerup',end);
  scene.addEventListener('pointercancel',end);
  scene.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse'&&!s.drag&&!s.gyro){s.tRy=s.face*180;s.tRx=0;}});
  function go(d){s.face+=d;s.tRy=s.face*180;s.tRx=0;touch();}
  flipBtn.addEventListener('click',function(){go(1);});
  window.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')go(-1);else if(e.key==='ArrowRight')go(1);});
  if(window.DeviceOrientationEvent&&(('ontouchstart' in window)||navigator.maxTouchPoints>0)){gyroBtn.hidden=false;}
  gyroBtn.addEventListener('click',function(){
    var D=window.DeviceOrientationEvent;
    var ask=(D&&typeof D.requestPermission==='function')?D.requestPermission():Promise.resolve('granted');
    ask.then(function(r){
      if(r!=='granted')return;
      s.gyro=true;gyroBtn.hidden=true;
      window.addEventListener('deviceorientation',function(e){if(e.gamma==null)return;s.gy=clamp(e.gamma,-35,35);s.gx=clamp((e.beta||0)-45,-35,35);});
    }).catch(function(){});
  });
  function tick(now){
    if(s.gyro&&!s.drag){s.tRy=s.face*180+s.gy*0.9;s.tRx=-s.gx*0.7;}
    else if(!reduce&&!s.drag&&now>s.idleAt){s.tRy=s.face*180+Math.sin(now/900)*14;s.tRx=Math.sin(now/1300)*6;}
    s.ry+=(s.tRy-s.ry)*0.12;s.rx+=(s.tRx-s.rx)*0.12;
    card.style.transform='rotateX('+s.rx.toFixed(2)+'deg) rotateY('+s.ry.toFixed(2)+'deg)';
    var rel=((s.ry%360)+540)%360-180;
    front.style.setProperty('--mx',(50+clamp(rel,-60,60)*0.9).toFixed(1)+'%');
    front.style.setProperty('--my',clamp(50-s.rx*1.1,-20,120).toFixed(1)+'%');
    shadow.style.opacity=(0.35+0.65*Math.abs(Math.cos(s.ry*Math.PI/180))).toFixed(2);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
`;

/**
 * buildViewerHtml — buat halaman HTML mandiri berisi kartu 3D yang bisa digerakkan.
 * Task:
 * 1. Sematkan gambar depan dan belakang sebagai data URL (tanpa file luar)
 * 2. Pasang lapisan foil di sisi depan, posisinya mengikuti sudut kartu (--mx / --my)
 * 3. Sertakan kontrol: seret untuk memutar, hover tilt di desktop, tombol balik, panah keyboard
 * 4. Sertakan sensor gerak (gyroscope) di HP, termasuk izin iOS
 * 5. Kembalikan string HTML lengkap yang bisa dibuka di browser mana pun
 */
export function buildViewerHtml({ title, frontSrc, backSrc, foil }: Viewer3DOptions): string {
  const foilHtml = foil.map((layer) => `<div class="foil" style="${layerToCss(layer)}"></div>`).join("");
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<title>${escapeHtml(title)} — Kartu 3D</title>
<style>${VIEWER_CSS}</style>
</head>
<body>
<main>
  <div class="scene" id="scene">
    <div class="shadow" id="shadow"></div>
    <div class="card" id="card">
      <div class="face front" id="front"><img src="${frontSrc}" alt="Depan kartu">${foilHtml}</div>
      <div class="face back"><img src="${backSrc}" alt="Belakang kartu"></div>
    </div>
  </div>
  <div class="bar">
    <button id="flip" type="button">Balik kartu</button>
    <button id="gyro" type="button" hidden>Aktifkan sensor gerak</button>
  </div>
  <p class="hint">Seret untuk memutar kartu · di HP, aktifkan sensor gerak untuk memiringkan</p>
</main>
<script>${VIEWER_JS}</script>
</body>
</html>`;
}

/**
 * viewerToFile — bungkus HTML viewer menjadi File siap unduh.
 * Task:
 * 1. Buat Blob bertipe text/html dari string HTML
 * 2. Bungkus sebagai File dengan nama yang diberikan
 */
export function viewerToFile(html: string, fileName: string): File {
  return new File([html], fileName, { type: "text/html" });
}
