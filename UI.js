const $ = (id) => document.getElementById(id);

/* =========================
   Stopwatch
   ========================= */


const time = $("time");
const toggleTimerBtn = $("toggleTimerBtn");
const toggleTimerText = toggleTimerBtn.querySelector(".text");
const toggleTimerIcon = toggleTimerBtn.querySelector(".icon");

let watchVisible=false;
let running=false;
let elapsed=0;
let last=0;
let raf;

function toggleStopwatch(){
    watchVisible=!watchVisible;
    $("watch").style.display = watchVisible ? "flex":"none";
    $("toggleWatchBtn").classList.toggle("inactive",!watchVisible);
}

function toggleCompress() {
    const watch = document.getElementById('watch');
    watch.classList.toggle('compressed');
}

function toggleTimer() {
    if (running) {
        pauseTimer();
        toggleTimerText.textContent = 'Start';
        toggleTimerIcon.classList.remove('fa-pause');
        toggleTimerIcon.classList.add('fa-play');
        toggleTimerBtn.classList.remove("inactive");
    } else {
        startTimer();
        toggleTimerText.textContent = 'Pause';
        toggleTimerIcon.classList.remove('fa-play');
        toggleTimerIcon.classList.add('fa-pause');
        toggleTimerBtn.classList.add("inactive");
    }
}

function startTimer(){
    if(running) return;

    running=true;
    last=performance.now();

    raf=requestAnimationFrame(tick);
}

function pauseTimer(){
    running=false;
    cancelAnimationFrame(raf);
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
    btn.classList.toggle("inactive", !show);
}

window.addEventListener("load", ()=>{
    buildTechPanel();
 //   buildFuncPanel();
});






document.querySelectorAll('[data-tooltip]').forEach(el => {
  el.addEventListener('mouseenter', () => {
    const rect = el.getBoundingClientRect();
    const tooltipEstimate = 140; // px

    // If left tooltip would overflow viewport
    if (rect.left < tooltipEstimate) {
      el.setAttribute('data-tip', 'right');
    } else {
      el.removeAttribute('data-tip');
    }
  });
});

