/* =====================================================
   TEMPLATE-BASED TECHNIQUE SYSTEM
===================================================== */

const TECHNIQUES = [];


/* ---------- registry ---------- */

function addTechnique(name, templates, enabled=true){
    TECHNIQUES.push({
        name,
        templates,
        enabled
    });
}


addTechnique("Basic Integrals", [

    {
        integral: "a*x^n",
        solution: "a*x^(n+1)/(n+1)",
    },

    {
        integral: "sin(n*x)",
        solution: "-cos(n*x) / n",
    },
]);



/* =========================
   Technique panel UI
========================= */

function buildTechPanel(){

    const list = document.getElementById("techList");
    list.innerHTML="";

    TECHNIQUES.forEach((t,i)=>{

        const row=document.createElement("div");
        row.className="list-item";

        const label=document.createElement("span");
        label.textContent=t.name;

        const box=document.createElement("input");
        box.type="checkbox";
        box.checked=t.enabled;

        box.onchange=()=>{
            t.enabled=box.checked;
            row.classList.toggle("item-disabled", !t.enabled);
        };

        if(!t.enabled) row.classList.add("item-disabled");

        row.appendChild(label);
        row.appendChild(box);

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
    buildFuncPanel();
});