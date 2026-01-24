/* =====================================================
   FUNCTION CATEGORY SYSTEM
===================================================== */

const FUNCTION_CATEGORIES = [];


/* ---------- helper ---------- */

function addFunctionCategory(name, generator, enabled=true){
    FUNCTION_CATEGORIES.push({
        name,
        generator,
        enabled
    });
}

/* =====================================================
   CATEGORY DEFINITIONS
===================================================== */


/* ---------- POLYNOMIALS ---------- */

addFunctionCategory("Polynomials", function(){

    const degree=rint(1,2);
    let terms=[];

    for(let i=degree;i>=0;i--){
        let c=rint(-5,5);
        if(c===0) continue;

        if(i===0) terms.push(`${c}`);
        else if(i===1) terms.push(`${c}*x`);
        else terms.push(`${c}*x^${i}`);
    }

    return terms.join("+").replace(/\+\-/g,"-") || "x";
});


/* ---------- TRIG ---------- */

addFunctionCategory("Trigonometric", ()=>{
    const a=rint(1,5), b=rint(-5,5);
    const inner = `${a}*x${b>=0?"+":""}${b}`;

    return pick([
        `sin(${inner})`,
        `cos(${inner})`
    ]);
});

/* ---------- EXP ---------- */

addFunctionCategory("Exponential", ()=>{
    const a=rint(1,5);
    return `exp(${a}*x)`;
});


/* ---------- LOG ---------- */

addFunctionCategory("Logarithms", ()=>{
    const a=rint(1,5), b=rint(1,5);
    return `log(${a}*x+${b})`;
});

/* =====================================================
   STRUCTURED GENERATOR (NEW LOGIC)
===================================================== */


function enabledCategories(){
    return FUNCTION_CATEGORIES.filter(c=>c.enabled);
}


function randomBaseFunction(){

    const cats = enabledCategories();

    if(cats.length===0){
        alert("Enable at least one function type.");
        return "x";
    }

    return pick(cats).generator();
}


/*
   Main expression builder

   75% same category
   25% mixed
*/
function randomExpr(){

    const cats = enabledCategories();
    if(cats.length===0) return "x";

    const sameCategory = Math.random() < 0.75;

    let f,g;

    if(sameCategory){
        const cat = pick(cats);
        f = cat.generator();
        g = cat.generator();
    } else {
        f = randomBaseFunction();
        g = randomBaseFunction();
    }

    const a=rint(1,5);
    const b=rint(1,5);

    const mode=Math.random();

    if(mode < 0.7){
        return nerdamer(`${a}*(${f}) + ${b}*(${g})`);
    }
    else if(mode < 0.9){
        return nerdamer(`(${f})*(${g})`);
    }
    else{
        return nerdamer(f,{x: g});
    }
}



/* =====================================================
   Function panel UI
===================================================== */

function buildFuncPanel(){

    const list=document.getElementById("funcList");
    list.innerHTML="";

    FUNCTION_CATEGORIES.forEach(cat=>{

        const row=document.createElement("div");
        row.className="list-item";

        const label=document.createElement("span");
        label.textContent=cat.name;

        const box=document.createElement("input");
        box.type="checkbox";
        box.checked=cat.enabled;

        box.onchange=()=>{
            cat.enabled=box.checked;
            row.classList.toggle("item-disabled",!cat.enabled);
        };

        row.appendChild(label);
        row.appendChild(box);

        list.appendChild(row);
    });
}


function toggleFuncPanel(){
    const p=document.getElementById("funcPanel");
    const btn=document.getElementById("funcToggleBtn");

    const show = p.style.display==="none";

    p.style.display = show ? "block":"none";
    btn.classList.toggle("active",show);
}
