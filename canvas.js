
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
    canvas.isDrawingMode = !canvas.isDrawingMode;
    this.classList.toggle("inactive", canvas.isDrawingMode);
    // this.innerHTML = canvas.isDrawingMode
    //    ? 'Cancel drawing'
    //    : 'Draw';
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

let isPanning = false;
let lastPosX, lastPosY;

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;


/* =========================
   Mouse wheel zoom (desktop)
========================= */

canvas.on('mouse:wheel', function(opt){

    const delta = opt.e.deltaY;

    let zoom = canvas.getZoom();

    zoom *= 0.999 ** delta;

    zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));

    canvas.zoomToPoint(
        { x: opt.e.offsetX, y: opt.e.offsetY },
        zoom
    );

    opt.e.preventDefault();
    opt.e.stopPropagation();
});


/* =========================
   PAN (spacebar or middle mouse)
========================= */

canvas.on('mouse:down', function(opt){

    const evt = opt.e;

    const middleClick = evt.button === 1;
    const spaceHeld   = evt.code === 'Space' || evt.spaceKey;

    if(middleClick || evt.shiftKey){

        isPanning = true;

        canvas.isDrawingMode = false;

        lastPosX = evt.clientX;
        lastPosY = evt.clientY;

        canvas.setCursor('grab');
    }
});

canvas.on('mouse:move', function(opt){

    if(!isPanning) return;

    const e = opt.e;

    const vpt = canvas.viewportTransform;

    vpt[4] += e.clientX - lastPosX;
    vpt[5] += e.clientY - lastPosY;

    canvas.requestRenderAll();

    lastPosX = e.clientX;
    lastPosY = e.clientY;
});

canvas.on('mouse:up', function(){

    isPanning = false;

    canvas.setCursor('default');

    canvas.isDrawingMode = drawingModeEl.classList.contains("inactive") === false;
});

/* =====================================================
   TOUCH PINCH ZOOM + PAN
===================================================== */

let lastTouchDistance = null;

canvas.upperCanvasEl.addEventListener('touchmove', function(e){

    if(e.touches.length === 2){

        e.preventDefault();

        const t1 = e.touches[0];
        const t2 = e.touches[1];

        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;

        const dist = Math.sqrt(dx*dx + dy*dy);

        if(lastTouchDistance){

            let zoom = canvas.getZoom();

            zoom *= dist / lastTouchDistance;

            zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));

            canvas.setZoom(zoom);
        }

        lastTouchDistance = dist;
    }
});

canvas.upperCanvasEl.addEventListener('touchend', ()=>{
    lastTouchDistance = null;
});

function resetView(){
    canvas.setViewportTransform([1,0,0,1,0,0]);
    canvas.setZoom(1);
}

