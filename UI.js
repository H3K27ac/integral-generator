const $ = (id) => document.getElementById(id);

/* =========================
   Stopwatch
   ========================= */


const time = document.getElementById("time");

let watchVisible=false;
let running=false;
let elapsed=0;
let last=0;
let raf;

function toggleStopwatch(){
    watchVisible=!watchVisible;
    $("watch").style.display = watchVisible ? "block":"none";
    $("toggleWatchBtn").classList.toggle("active",watchVisible);
}

function startTimer(){
    if(running) return;

    running=true;
    last=performance.now();
    $("startBtn").classList.remove("active");
    $("pauseBtn").classList.add("active");

    raf=requestAnimationFrame(tick);
}

function pauseTimer(){
    running=false;
    cancelAnimationFrame(raf);

    $("startBtn").classList.add("active");
    $("pauseBtn").classList.remove("active");
}

function resetTimer(){
    pauseTimer();
    elapsed=0;
    updateDisplay();
}

function tick(now){
    if(!running) return;
    elapsed+=now-last;
    last=now;
    updateDisplay();
    raf=requestAnimationFrame(tick);
}

function updateDisplay(){
    let t=elapsed/1000;
    let m=Math.floor(t/60);
    let s=(t%60).toFixed(1);
    time.textContent=
        String(m).padStart(2,"0")+":"+String(s).padStart(4,"0");
}




/* =========================
   Canvas System
========================= */


const canvas = new fabric.Canvas(canvas, {
    isDrawingMode: true,
    selection: false,
});

canvas.upperCanvasEl.style.touchAction = 'none';

canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
canvas.freeDrawingBrush.decimate = 8;

fabric.Object.prototype.transparentCorners = false;

const drawingModeEl = $('drawing-mode');
const drawingColorEl = $('drawing-color');
const drawingLineWidthEl = $('drawing-line-width');
const clearEl = $('clear-canvas');

clearEl.onclick = () => canvas.clear();

drawingModeEl.onclick = function () {
    canvas.isDrawingMode = !canvas.isDrawingMode;
    this.innerHTML = canvas.isDrawingMode
        ? 'Cancel drawing'
        : 'Draw';
};

canvas.freeDrawingBrush.color = drawingColorEl.value;
canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 2;

// Controls
drawingColorEl.onchange = e => {
    canvas.freeDrawingBrush.color = e.target.value;
};

drawingLineWidthEl.onchange = e => {
    canvas.freeDrawingBrush.width = parseInt(e.target.value, 10) || 2;
};




/* =====================================================
   Selection Panel
===================================================== */


function buildTechPanel(){

    const list=document.getElementById("techList");
    list.innerHTML="";

    /* method rows */

    METHODS.forEach(m=>{

        const row=document.createElement("div");
        row.className="list-item";

        const label=document.createElement("span");
        label.textContent=`${m.name}`;

        const enable=document.createElement("input");
        enable.type="checkbox";
        enable.checked=m.enabled;

        const block=document.createElement("input");
        block.type="checkbox";
        block.className="blacklist-item";
        block.title="Blacklist";
        block.checked=m.blacklisted;

        enable.onchange=()=>{
            m.enabled=enable.checked;
            if (enable.checked) {
                m.blacklisted=false;
                block.checked=false;
            }
            row.classList.toggle("item-disabled",!m.enabled);
            row.classList.toggle("item-blacklisted",m.blacklisted);
        };

        block.onchange=()=>{
            m.blacklisted=block.checked;
            if (block.checked) {
                m.enabled=false;
                enable.checked=false;
            }
            row.classList.toggle("item-disabled",!m.enabled);
            row.classList.toggle("item-blacklisted",m.blacklisted);
        };

        row.appendChild(label);

        const controls=document.createElement("div");
        controls.style.display="flex";
        controls.style.gap="6px";

        controls.appendChild(enable);
        controls.appendChild(block);

        row.appendChild(controls);

        list.appendChild(row);
    });
}


function toggleTechPanel(){
    const p=document.getElementById("techPanel");
    const btn=document.getElementById("techToggleBtn");

    const show = p.style.display==="none";

    p.style.display = show ? "block":"none";
    btn.classList.toggle("active", show);
}

window.addEventListener("load", ()=>{
    buildTechPanel();
 //   buildFuncPanel();
});