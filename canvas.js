
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



/* =====================================================
   MODE SYSTEM (draw / select / pan)
===================================================== */

let currentMode = "draw";
let allowDrawing = true;

function setMode(mode){

    currentMode = mode;

    if(mode === "draw"){
        canvas.isDrawingMode = true;
        canvas.selection = false;
    }

    if(mode === "select"){
        canvas.isDrawingMode = false;
        canvas.selection = true;
    }

    if(mode === "none"){
        canvas.isDrawingMode = false;
        canvas.selection = false;
    }
}




// State stack for undo/redo
let pathsStack = [];
let redoStack = []

// Save a path to stack
function savePath(path) {
    pathsStack.push(path);
    redoStack = []; // clear redo when new path is drawn
}

// Undo
function undo() {
    if (pathsStack.length > 0) {
        const last = pathsStack.pop();
        redoStack.push(last);
        redrawPaths();
    }
}

// Redo
function redo() {
    if (redoStack.length > 0) {
        const path = redoStack.pop();
        pathsStack.push(path);
        redrawPaths();
    }
}

// Redraw canvas from current pathsStack
function redrawPaths() {
    canvas.clear();
    pathsStack.forEach(p => canvas.add(p));
    canvas.renderAll();
}

// Delete last selected path
function deleteSelected() {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
        activeObjects.forEach(obj => {
            const index = pathsStack.indexOf(obj);
            if (index !== -1) pathsStack.splice(index, 1);
            canvas.remove(obj);
        });
        canvas.discardActiveObject();
        canvas.renderAll();
        redoStack = [];
    }
}

clearEl.onclick = () => { pathsStack = []; redoStack = []; canvas.clear(); };

drawingModeEl.onclick = function () {
    setMode(currentMode === "draw" ? "select" : "draw");
    this.classList.toggle("inactive", currentMode == "select");
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

// Delete button click
deleteEl.onclick = deleteSelected;

// Delete key support
document.addEventListener('keydown', (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && canvas.getActiveObjects().length) {
        e.preventDefault(); // prevent browser navigation
        deleteSelected();
    }
});

canvas.on('path:created', (e) => {
    if (!allowDrawing) {
        canvas.remove(e.path);
        canvas.requestRenderAll();
        // allowDrawing = true;
        return;
    }

    savePath(e.path);
});



function resizeCanvas(){

    const container = canvas.wrapperEl.parentNode;

    canvas.setWidth(container.clientWidth);
    canvas.setHeight(container.clientHeight);

    canvas.renderAll();
}


window.addEventListener('resize', resizeCanvas);
resizeCanvas();





/* =====================================================
   PAN + ZOOM
===================================================== */

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;

/* =====================================================
   DESKTOP PAN + ZOOM
===================================================== */

let isDragging = false;
let lastPosX, lastPosY;
let previousMode = "draw";


/* wheel zoom (correct anchor) */
canvas.on('mouse:wheel', function(opt){

    const e = opt.e;

    let zoom = canvas.getZoom();
    zoom *= 0.999 ** e.deltaY;

    zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));

    const point = canvas.getPointer(e);

    canvas.zoomToPoint(point, zoom);

    e.preventDefault();
    e.stopPropagation();
});


/* SHIFT + drag to pan */
canvas.on('mouse:down', function(opt){

    if(opt.e.shiftKey){
        previousMode = currentMode;
        setMode("none");

        isDragging = true;

        lastPosX = opt.e.clientX;
        lastPosY = opt.e.clientY;
    }
});


canvas.on('mouse:move', function(opt){

    if(!isDragging) return;

    const e = opt.e;

    const vpt = canvas.viewportTransform;

    vpt[4] += e.clientX - lastPosX;
    vpt[5] += e.clientY - lastPosY;

    canvas.requestRenderAll();

    lastPosX = e.clientX;
    lastPosY = e.clientY;
});


canvas.on('mouse:up', function(){

    if(isDragging){
        isDragging = false;

        setMode(previousMode);
    }
});



/* =====================================================
   MOBILE PINCH + PAN
===================================================== */

let lastDist = null;
let lastCenter = null;

canvas.upperCanvasEl.addEventListener("touchstart", (e)=>{

    if(e.touches.length === 2){
        previousMode = currentMode;
        setMode("none"); // disable drawing
        allowDrawing=false;

        const t1=e.touches[0];
        const t2=e.touches[1];

        lastDist = Math.hypot(
            t1.clientX - t2.clientX,
            t1.clientY - t2.clientY
        );

        lastCenter = {
            x:(t1.clientX+t2.clientX)/2,
            y:(t1.clientY+t2.clientY)/2
        };
    }
});


canvas.upperCanvasEl.addEventListener("touchmove", (e)=>{

    if (e.touches.length !== 2) return

    e.preventDefault();

    const t1=e.touches[0];
    const t2=e.touches[1];

    const dist = Math.hypot(
        t1.clientX - t2.clientX,
        t1.clientY - t2.clientY
    );

    const center = {
        x:(t1.clientX+t2.clientX)/2,
        y:(t1.clientY+t2.clientY)/2
    };

    /* zoom */
    let zoom = canvas.getZoom();
    zoom *= dist/lastDist;
    zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));

    canvas.zoomToPoint(center, zoom);


    /* pan */
    const vpt = canvas.viewportTransform;
    vpt[4] += center.x - lastCenter.x;
    vpt[5] += center.y - lastCenter.y;

    canvas.requestRenderAll();

    lastDist = dist;
    lastCenter = center;

});


canvas.upperCanvasEl.addEventListener("touchend", ()=>{
    lastDist = null;
    lastCenter = null;
    setMode(previousMode);
});

function resetView(){
    canvas.setViewportTransform([1,0,0,1,0,0]);
    canvas.setZoom(1);
}

