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
    } else {
        startTimer();
    }
}

function startTimer(){
    if(running) return;

    running=true;
    last=performance.now();

    raf=requestAnimationFrame(tick);
    toggleTimerText.textContent = 'Pause';
    toggleTimerIcon.classList.remove('fa-play');
    toggleTimerIcon.classList.add('fa-pause');
    toggleTimerBtn.classList.add("inactive");
}

function pauseTimer(){
    running=false;
    cancelAnimationFrame(raf);
    toggleTimerText.textContent = 'Start';
    toggleTimerIcon.classList.remove('fa-pause');
    toggleTimerIcon.classList.add('fa-play');
    toggleTimerBtn.classList.remove("inactive");
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


function buildTechPanel() {
  const list = document.getElementById("techList");
  list.innerHTML = "";

  for (const [key, meta] of Object.entries(Methods)) {
    const state = MethodState[key];

    const row = document.createElement("div");
    row.className = "list-item";

    const label = document.createElement("span");
    label.textContent = meta.label;

    const enable = document.createElement("input");
    enable.type = "checkbox";
    enable.checked = state.enabled;

    const block = document.createElement("input");
    block.type = "checkbox";
    block.className = "blacklist-item";
    block.title = "Blacklist";
    block.checked = state.blacklisted;

    function syncClasses() {
      row.classList.toggle("item-disabled", !state.enabled);
      row.classList.toggle("item-blacklisted", state.blacklisted);
    }

    enable.onchange = () => {
      state.enabled = enable.checked;
      if (state.enabled) state.blacklisted = false;
      block.checked = state.blacklisted;
      syncClasses();
    };

    block.onchange = () => {
      state.blacklisted = block.checked;
      if (state.blacklisted) state.enabled = false;
      enable.checked = state.enabled;
      syncClasses();
    };

    const controls = document.createElement("div");
    controls.style.display = "flex";
    controls.style.gap = "6px";

    controls.append(enable, block);
    row.append(label, controls);
    list.appendChild(row);

    syncClasses();
  }
}



window.addEventListener("load", ()=>{
    buildTechPanel();
 //   buildFuncPanel();
    mountPanelToTabs();   // default tab mode
    showTab("canvas");

    /* mobile default fullscreen */
    if(window.innerWidth < 900){
        toggleFocus();
    }
});



/* =========================================
   Tooltips
========================================= */


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

/* =========================================
   Problem and solution
========================================= */

let currentSolutionLatex="";
let currentMethod="";

const solution = $("solution");
const problem = $("problem");
const method = $("method");

function newProblem(){

    canvas.clear();
    problem.style.display = "block";
    solution.style.display = "none";
    method.innerHTML="";

    const p = generateProblem();
    if (!p) return;

    currentSolutionLatex = p.solutionLatex;
    currentMethod = p.method;

    katex.render(
        p.latex, problem, {
            displayMode: true,
        }
    );

    fitMath(problem);

    if(watchVisible){
        resetTimer();
        startTimer();
    }
}

function showSolution(){
    katex.render(currentSolutionLatex, solution, {
        displayMode: true,
    });
    fitMath(solution)
    method.innerHTML = currentMethod;
    solution.style.display = "block";
    if(watchVisible) pauseTimer();
}

function fitMath(el) {

    let size = isFocused ? 36 : 24; // start big
    let maxWidthPercent = isFocused ? 90 : 45; // start big
    const minSize = 14;

    // Read max-width from CSS
    let maxWidth = el.parentElement.clientWidth * (maxWidthPercent / 100);

    el.style.fontSize = size + "px";

    while (el.scrollWidth > maxWidth && size > minSize) {
        size--;
        el.style.fontSize = size + "px";
    }
}


/* =========================================
   Focus Mode
========================================= */

let isFocused = false;

function toggleFocus() {
    document.body.classList.toggle("focus");
    isFocused = !isFocused;

    if(isFocused){
        mountPanelInline();   // panel becomes inline
        document.getElementById("tabCanvasBtn").classList.add("inactive");
    } else {
        mountPanelToTabs();   // back to tab
        showTab("canvas");
    }
}

const techPanel = $("techPanel");

function mountPanelToTabs(){
    document.getElementById("techPanelMount").appendChild(techPanel);
    document.getElementById("qaOverlay").appendChild(problem);
    document.getElementById("qaOverlay").appendChild(solution);
}

function mountPanelInline(){
    document.getElementById("focusTechPanelMount").appendChild(techPanel);
    document.getElementById("focusProblemMount").appendChild(problem);
    document.getElementById("focusProblemMount").appendChild(solution);
}


/* =========================================
   Tabs
========================================= */

function showTab(name){

    document.querySelectorAll(".tabView").forEach(v=>{
        v.classList.add("is-hidden");
    });

    if(name==="canvas")
        document.getElementById("canvasTab").classList.remove("is-hidden");

    if(name==="tech")
        document.getElementById("techPanelTab").classList.remove("is-hidden");


    document.getElementById("tabCanvasBtn")
        .classList.toggle("inactive", name!=="canvas");

    document.getElementById("tabTechBtn")
        .classList.toggle("inactive", name!=="tech");
}