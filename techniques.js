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
        solution: "a* x^(n+1) / (n+1)",
    },

    {
        integral: "e^(n*x)",
        solution: "e^(n*x) / n",
    },

    {
        integral: "sin(n*x)",
        solution: "-cos(n*x) / n",
    },

    {
        integral: "cos(n*x)",
        solution: "sin(n*x) / n",
    }
]);


addTechnique("u-substitution", [

    {
        integral: "x*sqrt(a*x+b)",
        solution: "(a*x+b)^(3/2)(6*a*x-4*b) / (15*a^2)",
    }

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
 //   buildFuncPanel();
});