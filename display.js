/* =========================
   Canvas drawing (touch + mouse)
   ========================= */

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

function resize(){
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
}
resize();
window.onresize = resize;

let drawing=false;

function pos(e){
    const r=canvas.getBoundingClientRect();
    return {
        x:(e.touches?e.touches[0].clientX:e.clientX)-r.left,
        y:(e.touches?e.touches[0].clientY:e.clientY)-r.top
    };
}

function start(e){
    drawing=true;
    ctx.beginPath();
    let p=pos(e);
    ctx.moveTo(p.x,p.y);
}

function move(e){
    if(!drawing) return;
    let p=pos(e);
    ctx.lineTo(p.x,p.y);
    ctx.stroke();
}

function end(){ drawing=false; }

canvas.addEventListener("mousedown",start);
canvas.addEventListener("mousemove",move);
canvas.addEventListener("mouseup",end);

canvas.addEventListener("touchstart",start);
canvas.addEventListener("touchmove",move);
canvas.addEventListener("touchend",end);

function clearCanvas(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
}

/* =========================
   Stopwatch
   ========================= */

let running=false, startTime=0, elapsed=0, timer;

function toggleStopwatch(){
    let w=document.getElementById("watch");
    w.style.display = w.style.display==="none" ? "block" : "none";
}

function startTimer(){
    if(running) return;
    running=true;
    startTime=Date.now()-elapsed;
    timer=setInterval(update,50);
}

function pauseTimer(){
    running=false;
    clearInterval(timer);
}

function resetTimer(){
    pauseTimer();
    elapsed=0;
    update();
}

function update(){
    elapsed=Date.now()-startTime;
    let t=elapsed/1000;
    let m=Math.floor(t/60);
    let s=(t%60).toFixed(1);
    document.getElementById("time").textContent =
        String(m).padStart(2,'0')+":"+String(s).padStart(4,'0');
}

/* ========================= */

window.onload=newProblem;