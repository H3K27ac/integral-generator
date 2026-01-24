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

let AUTO_BLACKLIST = true;

function computeBlacklist(){

    /* clear manual blacklists remain untouched */
    METHODS.forEach(m => {
        if(m.autoBlacklisted) {
            m.blacklisted = false;
            m.autoBlacklisted = false;
        }
    });

    if(!AUTO_BLACKLIST) return;

    const enabled = METHODS.filter(m=>m.enabled);

    if(enabled.length===0) return;

    const maxDifficulty = Math.max(...enabled.map(m=>m.difficulty));

    METHODS.forEach(m=>{
        if(m.difficulty > maxDifficulty){
            m.blacklisted = true;
            m.autoBlacklisted = true;
        }
    });
}


function buildTechPanel(){

    const list=document.getElementById("techList");
    list.innerHTML="";

    /* auto toggle */

    const autoRow=document.createElement("div");
    autoRow.className="list-item";

    const autoLabel=document.createElement("span");
    autoLabel.textContent="Auto blacklist by difficulty";

    const autoBox=document.createElement("input");
    autoBox.type="checkbox";
    autoBox.checked=AUTO_BLACKLIST;

    autoBox.onchange=()=>{
        AUTO_BLACKLIST=autoBox.checked;
        buildTechPanel();
    };

    autoRow.appendChild(autoLabel);
    autoRow.appendChild(autoBox);

    list.appendChild(autoRow);


    /* method rows */

    METHODS.forEach(m=>{

        const row=document.createElement("div");
        row.className="list-item";

        const label=document.createElement("span");
        label.textContent=`${m.name}  (d${m.difficulty})`;

        const enable=document.createElement("input");
        enable.type="checkbox";
        enable.checked=m.enabled;

        const block=document.createElement("input");
        block.type="checkbox";
        block.title="Blacklist";
        block.checked=m.blacklisted && !m.autoBlacklisted;

        enable.onchange=()=>{
            m.enabled=enable.checked;
            if (enable.checked) {
                m.blacklisted=false;
                block.checked=false;
            }
        };

        block.onchange=()=>{
            m.blacklisted=block.checked;
            if (block.checked) {
                m.enabled=false;
                enable.checked=false;
            }
        };

        row.appendChild(label);

        const controls=document.createElement("div");
        controls.style.display="flex";
        controls.style.gap="6px";

        controls.appendChild(enable);
        controls.appendChild(block);

        row.appendChild(controls);

        if(m.blacklisted) row.classList.add("item-disabled");

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