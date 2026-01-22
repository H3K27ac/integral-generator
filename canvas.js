/* =========================
   Canvas System
   ========================= */

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const deleteSelectionBtn = document.getElementById("deleteSelectionBtn");

let strokes=[];
let redoStack=[];

let current = null;
let tool = "pen";

let selection = null; // {x,y,w,h, indices[]}
let selecting = false;     // currently drawing a selection box
let selectionConfirmed = false;
let isMovingSelection = false;
let dragStart = null;

let strokeErasing = false;

function resize(){
    canvas.width=canvas.offsetWidth;
    canvas.height=canvas.offsetHeight;
    redraw();
}
resize();
window.addEventListener("resize",resize);

/* ---------- Tool switching ---------- */

function setTool(t){
    tool=t;
    selection=null;

    [penBtn,pixelEraseBtn,strokeEraseBtn,selectBtn]
        .forEach(b=>b.classList.remove("active"));

    if(t==="pen") penBtn.classList.add("active");
    if(t==="pixel") pixelEraseBtn.classList.add("active");
    if(t==="stroke") strokeEraseBtn.classList.add("active");
    if(t==="select") selectBtn.classList.add("active");

    redraw();
}
setTool("pen");

/* ---------- helpers ---------- */

function getPos(e){
    const r=canvas.getBoundingClientRect();
    return {x:e.clientX-r.left,y:e.clientY-r.top};
}

function dist(a,b){
    return Math.hypot(a.x-b.x,a.y-b.y);
}

/* ---------- pointer events ---------- */

canvas.addEventListener("pointerdown",e=>{
    canvas.setPointerCapture(e.pointerId);
    const p=getPos(e);

    /* stroke eraser */
    if (tool === "stroke") {
        strokeErasing = true;
        eraseStrokeAt(p);
        return;
    }

    /* selection tool */
    if (tool === "select") {

        // Click inside confirmed selection, start dragging
        if (selectionConfirmed && selection && pointInRect(p, selection)) {
            isMovingSelection = true;
            dragStart = p;
            return;
        }

        // Start new selection
        selection = { x: p.x, y: p.y, w: 0, h: 0, indices: [] };
        selecting = true;
        selectionConfirmed = false;
        isMovingSelection = false;
        redraw();
        return;
    }

    /* pen / pixel */
    current={
        tool,
        width:+width.value,
        points:[p]
    };
});

canvas.addEventListener("pointermove",e=>{
    const p=getPos(e);

    if (tool === "stroke" && strokeErasing) {
        eraseStrokeAt(p);
        return;
    }

    if (tool === "select" && selection) {

        if (isMovingSelection) {
            const dx = p.x - dragStart.x;
            const dy = p.y - dragStart.y;

            for (let i of selection.indices) {
                for (let pt of strokes[i].points) {
                    pt.x += dx;
                    pt.y += dy;
                }
            }

            selection.x += dx;
            selection.y += dy;

            dragStart = p;
        }
        else if (selecting) {
            selection.w = p.x - selection.x;
            selection.h = p.y - selection.y;
        }

        redraw();
        return;
    }

    if(!current) return;

    current.points.push(p);
    redraw();
});

canvas.addEventListener("pointerup",()=>{
    if(current){
        strokes.push(current);
        redoStack=[];
        current=null;
    }

    strokeErasing = false;

    if (tool === "select") {

        // Finish selection on release (desktop + mobile)
        if (selecting) {
            selecting = false;
            selectionConfirmed = true;
            computeSelection();
            updateSelectionUI();
        }

        isMovingSelection = false;
    }

    redraw();
});

/* ---------- stroke erase ---------- */

function eraseStrokeAt(p){
    for(let i=strokes.length-1;i>=0;i--){
        for(let pt of strokes[i].points){
            if(dist(pt,p)<10){
                redoStack.push(strokes.splice(i,1)[0]);
                redraw();
                return;
            }
        }
    }
}

/* ---------- selection ---------- */

function computeSelection(){
    let minX=Math.min(selection.x,selection.x+selection.w);
    let maxX=Math.max(selection.x,selection.x+selection.w);
    let minY=Math.min(selection.y,selection.y+selection.h);
    let maxY=Math.max(selection.y,selection.y+selection.h);

    selection.indices=[];

    strokes.forEach((s,i)=>{
        if(s.points.some(pt=>pt.x>=minX&&pt.x<=maxX&&pt.y>=minY&&pt.y<=maxY)){
            selection.indices.push(i);
        }
    });
}

function deleteSelection(){
    if(!selection) return;

    selection.indices.sort((a,b)=>b-a).forEach(i=>{
        redoStack.push(strokes.splice(i,1)[0]);
    });

    selection=null;
    redraw();
}

function pointInRect(p,r){
    let minX=Math.min(r.x,r.x+r.w);
    let maxX=Math.max(r.x,r.x+r.w);
    let minY=Math.min(r.y,r.y+r.h);
    let maxY=Math.max(r.y,r.y+r.h);
    return p.x>=minX&&p.x<=maxX&&p.y>=minY&&p.y<=maxY;
}

function updateSelectionUI() {
    const show =
        tool === "select" &&
        selection &&
        selectionConfirmed &&
        selection.indices.length > 0;

    deleteSelectionBtn.style.display = show ? "block" : "none";
}


/* ---------- undo/redo ---------- */

function undo(){
    if(!strokes.length) return;
    redoStack.push(strokes.pop());
    selection=null;
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
    selection=null;
    redraw();
}

/* ---------- redraw ---------- */

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
        for(let pt of s.points) ctx.lineTo(pt.x,pt.y);
        ctx.stroke();
    }

    ctx.globalCompositeOperation="source-over";

    /* draw selection box */
    if(selection){
        ctx.save();
        ctx.lineWidth = 1; 
        ctx.setLineDash([4,4]);
        ctx.strokeRect(selection.x,selection.y,selection.w,selection.h);
        ctx.setLineDash([]);
        ctx.restore();
    }
}
