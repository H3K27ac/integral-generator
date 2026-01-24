/* =====================================================
   METHODS + TEMPLATE REGISTRY
===================================================== */

const METHODS = [];
const TEMPLATES = [];


/* ---------- methods ---------- */

function addMethod(name, enabled=true, blacklisted=false){
    METHODS.push({
        name,
        enabled,
        blacklisted
    });
}


/* ---------- templates ---------- */

function addTemplate({ generate, methods, difficulty=1}){

    TEMPLATES.push({
        generate,
        methods,   // array of method names
        difficulty
    });
}

/* =====================================================
   METHODS WITH DIFFICULTY
===================================================== */

addMethod("Power rule");
addMethod("Exponentials");
addMethod("Trigonometric functions");
addMethod("Logarithms");

addMethod("u-substitution");
addMethod("Integration by parts");


addTemplate({

    methods:["Power rule"],
    difficulty: 1,

    generate: ({a,n}) => ({

        integral: `${a}*x^${n}`,
        solution: `${a}*x^${n+1}/${n+1}`

    })
});


addTemplate({

    methods:["Exponentials"],
    difficulty: 1,

    generate: ({n}) => ({

        integral: `e^(${n}*x)`,
        solution: `e^(${n}*x) / ${n}`

    })
});


addTemplate({

    methods:["Trigonometric functions"],
    difficulty: 1,

    generate: ({n}) => ({

        integral: `sin(${n}*x)`,
        solution: `-cos(${n}*x) / ${n}`

    })
});


addTemplate({

    methods:["Trigonometric functions"],
    difficulty: 1,

    generate: ({n}) => ({

        integral: `cos(${n}*x)`,
        solution: `sin(${n}*x) / ${n}`

    })
});


addTemplate({

    methods:["u-substitution"],
    difficulty: 2,

    generate: ({a,b}) => ({

        integral: `x*sqrt(${a}*x+${b})`,
        solution: `(${a}*x+${b})^(3/2)*(6*${a}*x-4*${b}) / (15*${a}^2)`

    })
});


addTemplate({

    methods:["Integration by parts","Exponentials"],
    difficulty: 2,

    generate: ({a,n}) => {

        /* build polynomial:
           x^n - n x^(n-1) + n(n-1)x^(n-2) ...
        */

        let terms = [];
        let coeff = 1;

        for(let k=0;k<=n;k++){

            const power = n-k;

            let sign = (k%2===0) ? 1 : -1;

            let c = sign * coeff;

            let term;

            if(power===0)
                term = `${c}`;
            else if(power===1)
                term = `${c}*x`;
            else
                term = `${c}*x^${power}`;

            terms.push(term);

            coeff *= (n-k);
        }

        const poly = terms.join("+").replace(/\+\-/g,"-");

        return {

            integral: `${a}*x^${n}*exp(x)`,
            solution: `${a}*exp(x)*(${poly})`
        };
    }
});


/*

addTemplate({
    integral: "(log(x))^3",
    solution: "x*((log(x))^3-3*(log(x))^2+6*log(x)-6)",
    methods: ["u-substitution","Logarithms"],
    difficulty: 2
});

*/


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