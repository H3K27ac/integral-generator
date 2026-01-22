/* =========================
   Canvas with undo/eraser
   ========================= */

const canvas=board;
const ctx=canvas.getContext("2d");

let strokes=[];
let current=null;
let tool="pen";

function resize(){
    canvas.width=canvas.offsetWidth;
    canvas.height=canvas.offsetHeight;
    redraw();
}
resize();
window.onresize=resize;

function setTool(t){
    tool=t;
    penBtn.className = t==="pen"?"":"secondary";
    eraserBtn.className = t==="eraser"?"":"secondary";
}

function start(e){
    const p=pos(e);
    current={
        tool,
        width:+width.value,
        points:[p]
    };
}

function move(e){
    if(!current) return;
    current.points.push(pos(e));
    redraw();
}

function end(){
    if(!current) return;
    strokes.push(current);
    current=null;
}

function pos(e){
    const r=canvas.getBoundingClientRect();
    let x=(e.touches?e.touches[0].clientX:e.clientX)-r.left;
    let y=(e.touches?e.touches[0].clientY:e.clientY)-r.top;
    return {x,y};
}

function redraw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    for(let s of strokes.concat(current? [current]:[])){
        ctx.lineWidth=s.width;
        ctx.lineCap="round";

        if(s.tool==="eraser"){
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

function undo(){
    strokes.pop();
    redraw();
}

function clearCanvas(){
    strokes=[];
    current=null;
    redraw();
}

canvas.onmousedown=start;
canvas.onmousemove=move;
canvas.onmouseup=end;

canvas.ontouchstart=start;
canvas.ontouchmove=move;
canvas.ontouchend=end;

/* =========================
   Stopwatch
   ========================= */

let watchVisible=false;
let running=false;
let elapsed=0;
let last=0;
let timer=null;

function toggleStopwatch(){
    watchVisible=!watchVisible;
    watch.style.display=watchVisible?"block":"none";
}

function startTimer(){
    if(running) return;
    running=true;
    last=performance.now();
    timer=requestAnimationFrame(tick);
}

function pauseTimer(){
    running=false;
    cancelAnimationFrame(timer);
}

function resetTimer(){
    running=false;
    cancelAnimationFrame(timer);
    elapsed=0;
    updateDisplay();
}

function tick(now){
    if(!running) return;
    elapsed+=now-last;
    last=now;
    updateDisplay();
    timer=requestAnimationFrame(tick);
}

function updateDisplay(){
    let t=elapsed/1000;
    let m=Math.floor(t/60);
    let s=(t%60).toFixed(1);
    time.textContent=
        String(m).padStart(2,"0")+":"+String(s).padStart(4,"0");
}

/* ========================= */

window.onload=newProblem;