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


const canvas = new fabric.Canvas("canvas", {
    isDrawingMode: true,
});

canvas.upperCanvasEl.style.touchAction = 'none';

canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);

fabric.Object.prototype.transparentCorners = false;

const drawingModeEl = $('drawing-mode');
const drawingColorEl = $('drawing-color');
const drawingLineWidthEl = $('drawing-line-width');
const clearEl = $('clear-canvas');
const undoEl = $('undo'); // Add undo button in HTML
const redoEl = $('redo'); // Add redo button in HTML
const deleteEl = $('delete-selected'); // Add delete button in HTML

// State stack for undo/redo
let state = [];
let mods = 0; // pointer to current state

function saveState() {
    // Remove redo stack if new action occurs
    if (mods < state.length) {
        state = state.slice(0, mods);
    }
    state.push(JSON.stringify(canvas));
    mods = state.length; // set pointer to latest
}

function undo() {
    if (mods > 1) {
        mods -= 1;
        canvas.loadFromJSON(state[mods - 1], () => canvas.renderAll());
    }
}

function redo() {
    if (mods < state.length) {
        canvas.loadFromJSON(state[mods], () => canvas.renderAll());
        mods += 1;
    }
}

// Initialize first state
saveState();

clearEl.onclick = () => {
    canvas.clear();
    saveState();
};

drawingModeEl.onclick = function () {
    canvas.isDrawingMode = !canvas.isDrawingMode;
    this.classList.toggle("active", canvas.isDrawingMode);
    this.innerHTML = canvas.isDrawingMode
        ? 'Cancel drawing'
        : 'Draw';
};

canvas.freeDrawingBrush.color = drawingColorEl.value;
canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;

// Controls
drawingColorEl.onchange = function () {
    canvas.freeDrawingBrush.color = this.value;
};

drawingLineWidthEl.onchange = function () {
    canvas.freeDrawingBrush.width = parseInt(this.value, 10) || 1;
};

// Undo / Redo buttons
undoEl.onclick = undo;
redoEl.onclick = redo;

// Show delete button only when objects are selected
canvas.on('selection:created', () => {
    deleteEl.style.display = 'inline-block';
});
canvas.on('selection:updated', () => {
    deleteEl.style.display = 'inline-block';
});
canvas.on('selection:cleared', () => {
    deleteEl.style.display = 'none';
});


// Delete selected object function
function deleteSelected() {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
        activeObjects.forEach(obj => canvas.remove(obj));
        canvas.discardActiveObject();
        canvas.renderAll();
        saveState();
    }
}

// Delete button click
deleteEl.onclick = deleteSelected;

// Delete key support
document.addEventListener('keydown', (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && canvas.getActiveObjects().length) {
        e.preventDefault(); // prevent browser navigation
        deleteSelected();
    }
});

// Only after objects are added, modified, removed, or freehand stroke is finished
canvas.on('object:added', function (e) {
    if (!e.target.__corner) saveState(); // ignore during drawing?
});
canvas.on('object:modified', saveState);
canvas.on('object:removed', saveState);

// Freehand stroke finished
canvas.on('path:created', saveState);

function resizeCanvas() {
    const container = canvas.wrapperEl.parentNode;
    canvas.setWidth(container.clientWidth);
    canvas.setHeight(window.innerHeight);
    canvas.renderAll();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();



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