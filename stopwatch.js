/* =========================
   Stopwatch
   ========================= */

const watch = document.getElementById("watch");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const toggleWatchBtn = document.getElementById("toggleWatchBtn");
const time = document.getElementById("time");

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
    startBtn.classList.remove("active");
    pauseBtn.classList.add("active");

    raf=requestAnimationFrame(tick);
}

function pauseTimer(){
    running=false;
    cancelAnimationFrame(raf);

    startBtn.classList.add("active");
    pauseBtn.classList.remove("active");
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
