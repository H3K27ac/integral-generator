/* =========================
   Canvas
   ========================= */

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

let strokes=[];
let redoStack=[];
let current=null;
let tool="pen";

function resize(){
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    redraw();
}
resize();
window.addEventListener("resize",resize);

function setTool(t){
    tool=t;

    [penBtn,strokeEraseBtn,pixelEraseBtn].forEach(b=>b.classList.remove("active"));

    if(t==="pen") penBtn.classList.add("active");
    if(t==="stroke") strokeEraseBtn.classList.add("active");
    if(t==="pixel") pixelEraseBtn.classList.add("active");
}

setTool("pen");

function getPos(e){
    const r = canvas.getBoundingClientRect();
    return {
        x:e.clientX-r.left,
        y:e.clientY-r.top
    };
}

canvas.addEventListener("pointerdown",e=>{
    canvas.setPointerCapture(e.pointerId);

    if(tool==="stroke"){
        eraseStroke(getPos(e));
        return;
    }

    current={
        tool,
        width:+width.value,
        points:[getPos(e)]
    };
});

canvas.addEventListener("pointermove",e=>{
    if(!current) return;
    current.points.push(getPos(e));
    redraw();
});

canvas.addEventListener("pointerup",()=>{
    if(!current) return;
    strokes.push(current);
    redoStack=[];
    current=null;
});

function redraw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    for(let s of strokes.concat(current? [current]:[])){
        ctx.lineWidth=s.width;
        ctx.lineCap="round";

        if(s.tool==="pixel"){
            ctx.globalCompositeOperation="destination-out";
        } else {
            ctx.globalCompositeOperation="source-over";
        }

        ctx.beginPath();
        ctx.moveTo(s.points[0].x,s.points[0].y);
        for(let p of s.points) ctx.lineTo(p.x,p.y);
        ctx.stroke();
    }

    ctx.globalCompositeOperation="source-over";
}

function eraseStroke(p){
    strokes = strokes.filter(s=>{
        return !s.points.some(pt=>Math.hypot(pt.x-p.x,pt.y-p.y)<12);
    });
    redraw();
}

function undo(){
    if(!strokes.length) return;
    redoStack.push(strokes.pop());
    redraw();
}

function redo(){
    if(!redoStack.length) return;
    strokes.push(redoStack.pop());
    redraw();
}

function clearCanvas(){
    strokes=[];
    redoStack=[];
    redraw();
}

/* =========================
   Stopwatch
   ========================= */

let watchVisible=false;
let running=false;
let elapsed=0;
let last=0;
let raf;

function toggleStopwatch(){
    watchVisible=!watchVisible;
    watch.style.display = watchVisible ? "block":"none";
    toggleWatchBtn.classList.toggle("active",watchVisible);
}

function startTimer(){
    if(running) return;

    running=true;
    last=performance.now();
    startBtn.classList.add("active");
    pauseBtn.classList.remove("active");

    raf=requestAnimationFrame(tick);
}

function pauseTimer(){
    running=false;
    cancelAnimationFrame(raf);

    startBtn.classList.remove("active");
    pauseBtn.classList.add("active");
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
