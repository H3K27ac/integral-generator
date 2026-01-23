/* =====================================================
   FUNCTION CATEGORY + SUBFUNCTION SYSTEM
===================================================== */

const FUNCTION_CATEGORIES = [];


/* ---------- registry helpers ---------- */

function addCategory(name){
    const cat = {
        name,
        enabled:true,
        functions:[]
    };
    FUNCTION_CATEGORIES.push(cat);
    return cat;
}

function addFunction(cat, name, generator){
    cat.functions.push({
        name,
        gen: generator,
        enabled:true
    });
}



/* =====================================================
   CATEGORY DEFINITIONS
===================================================== */


/* ---------- POLYNOMIALS ---------- */

const polyCat = addCategory("Polynomials");

addFunction(polyCat,"Polynomial", function(){

    const degree=rint(1,3);
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

const trigCat = addCategory("Trigonometric");

addFunction(trigCat,"sin", ()=>{
    const a=rint(1,5), b=rint(-5,5);
    return `sin(${a}*x${b>=0?"+":""}${b})`;
});

addFunction(trigCat,"cos", ()=>{
    const a=rint(1,5), b=rint(-5,5);
    return `cos(${a}*x${b>=0?"+":""}${b})`;
});


/* ---------- EXP ---------- */

const expCat = addCategory("Exponential");

addFunction(expCat,"exp", ()=>{
    const a=rint(1,5);
    return `exp(${a}*x)`;
});


/* ---------- LOG ---------- */

const logCat = addCategory("Logarithmic");

addFunction(logCat,"log", ()=>{
    const a=rint(1,5), b=rint(1,5);
    return `log(${a}*x+${b})`;
});



/* =====================================================
   STRUCTURED GENERATOR
===================================================== */


function enabledCategories(){
    return FUNCTION_CATEGORIES.filter(c=>c.enabled);
}

function enabledFunctions(cat){
    return cat.functions.filter(f=>f.enabled);
}

function randomFunctionFromCategory(cat){
    const fns = enabledFunctions(cat);
    if(fns.length===0) return "x";
    return pick(fns).gen();
}


/*
   Build a single base function
*/
function randomBaseFunction(){

    const cats = enabledCategories();

    if(cats.length===0){
        alert("Enable at least one function category.");
        return "x";
    }

    const cat = pick(cats);
    return randomFunctionFromCategory(cat);
}


/*
   Main expression builder

   75% same category
   25% mixed
*/
function randomExpr(allowMultiply=false, allowCompose=false){

    const cats = enabledCategories();
    if(cats.length===0) return "x";

    const sameCategory = Math.random() < 0.75;

    let f,g;

    if(sameCategory){
        const cat = pick(cats);
        f = randomFunctionFromCategory(cat);
        g = randomFunctionFromCategory(cat);
    } else {
        f = randomBaseFunction();
        g = randomBaseFunction();
    }

    const a=rint(1,5);
    const b=rint(1,5);

    const mode=Math.random();

    if(mode < 0.7){
        return `${a}*(${f}) + ${b}*(${g})`;
    }
    else if(mode < 0.9 && allowMultiply){
        return `(${f})*(${g})`;
    }
    else if(allowCompose){
        return f.replaceAll("x",`(${g})`);
    }
}



/* =====================================================
   Function selector UI
===================================================== */

function buildFuncPanel(){

    const list=document.getElementById("funcList");
    list.innerHTML="";

    FUNCTION_CATEGORIES.forEach(cat=>{

        const block=document.createElement("div");

        const enabledFns = cat.functions.filter(f=>f.enabled);
        cat.enabled = enabledFns.length>0;


        const header=document.createElement("div");
        header.className="list-item";

        if(!cat.enabled) header.classList.add("item-disabled");

        const title=document.createElement("span");
        title.textContent=cat.name;

        const catBox=document.createElement("input");
        catBox.type="checkbox";
        catBox.checked=cat.enabled;

        header.appendChild(title);
        header.appendChild(catBox);
        block.appendChild(header);

        catBox.onchange=()=>{

            cat.enabled=catBox.checked;

            cat.functions.forEach(fn=>fn.enabled=cat.enabled);

            buildFuncPanel(); // rebuild for sync
        };


        if(cat.functions.length>1){

            cat.functions.forEach(fn=>{

                const row=document.createElement("div");
                row.className="list-item";
                row.style.paddingLeft="22px";

                if(!fn.enabled) row.classList.add("item-disabled");

                const label=document.createElement("span");
                label.textContent=fn.name;

                const box=document.createElement("input");
                box.type="checkbox";
                box.checked=fn.enabled;

                /* child toggle */
                box.onchange=()=>{

                    fn.enabled=box.checked;

                    /* update category state */
                    const anyEnabled =
                        cat.functions.some(f=>f.enabled);

                    cat.enabled = anyEnabled;

                    buildFuncPanel();
                };

                row.appendChild(label);
                row.appendChild(box);

                block.appendChild(row);
            });
        }

        list.appendChild(block);
    });
}


function toggleFuncPanel(){
    const p=document.getElementById("funcPanel");
    const btn=document.getElementById("funcToggleBtn");

    const show = p.style.display==="none";

    p.style.display = show ? "block":"none";
    btn.classList.toggle("active",show);
}