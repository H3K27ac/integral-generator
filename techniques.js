/* =====================================================
   METHODS + TEMPLATE REGISTRY
===================================================== */

const METHODS = [];
const TEMPLATES = [];


/* ---------- methods ---------- */

function addMethod(name, difficulty=1, enabled=true){
    METHODS.push({
        name,
        difficulty,
        enabled,
        blacklisted:false
    });
}


/* ---------- templates ---------- */

function addTemplate({ integral, solution, methods }){

    TEMPLATES.push({
        integral,
        solution,
        methods   // array of method names
    });
}

/* =====================================================
   METHODS WITH DIFFICULTY
===================================================== */

addMethod("Polynomials", 1);
addMethod("Exponentials", 1);
addMethod("Trigonometric functions", 1);
addMethod("Logarithms", 1);

addMethod("u-substitution", 2);



addTemplate({
    integral: "a*x^n",
    solution: "a* x^(n+1) / (n+1)",
    methods: ["Polynomials"]
});

addTemplate({
    integral: "e^(n*x)",
    solution: "e^(n*x) / n",
    methods: ["Exponentials"]
});

addTemplate({
    integral: "sin(n*x)",
    solution: "-cos(n*x) / n",
    methods: ["Trigonometric functions"]
});

addTemplate({
    integral: "cos(n*x)",
    solution: "sin(n*x) / n",
    methods: ["Trigonometric functions"]
});

addTemplate({
    integral: "x*sqrt(a*x+b)",
    solution: "(a*x+b)^(3/2)*(6*a*x-4*b) / (15*a^2)",
    methods: ["u-substitution"]
});

addTemplate({
    integral: "(log(x))^3",
    solution: "x*((log(x))^3-3*(log(x))^2+6*log(x)-6)",
    methods: ["u-substitution","Logarithms"]
});


/* =====================================================
   Blacklist logic
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
        block.title="Blacklist";
        block.classList.add("blacklist-item");
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