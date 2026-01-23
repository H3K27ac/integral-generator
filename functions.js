/* =====================================================
   FUNCTION CATEGORY + SUBFUNCTION SYSTEM
===================================================== */

const FUNCTION_CATEGORIES = [];
const ENABLED_CATEGORIES = [];

function addCategory(name){
    const cat = {
        name,
        enabled: true,
        functions: [],
        enabledFunctions: []
    };
    FUNCTION_CATEGORIES.push(cat);
    ENABLED_CATEGORIES.push(cat);
    return cat;
}

function addFunction(cat, name, generator){
    const fn = {
        name,
        gen: generator,
        enabled: true
    };
    cat.functions.push(fn);
    cat.enabledFunctions.push(fn);
}

function updateCategoryState(cat){
    cat.enabledFunctions.length = 0;

    for(const fn of cat.functions){
        if(fn.enabled) cat.enabledFunctions.push(fn);
    }

    cat.enabled = cat.enabledFunctions.length > 0;

    const idx = ENABLED_CATEGORIES.indexOf(cat);
    if(cat.enabled && idx === -1) ENABLED_CATEGORIES.push(cat);
    else if(!cat.enabled && idx !== -1) ENABLED_CATEGORIES.splice(idx,1);
}


/* =====================================================
   CATEGORY DEFINITIONS
===================================================== */


/* ---------- POLYNOMIALS ---------- */

const polyCat = addCategory("Polynomials");

addFunction(polyCat,"Polynomial", ()=>{

    const degree = rint(1,3);
    const terms = [];

    for(let i = degree; i >= 0; i--){
        const c = rint(-5,5);
        if(!c) continue;

        if(i === 0) terms.push(c);
        else if(i === 1) terms.push(`${c}*x`);
        else terms.push(`${c}*x^${i}`);
    }

    return terms.length
        ? terms.join("+").replace("+-","-")
        : "x";
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
    if(ENABLED_CATEGORIES.length === 0) return "x";

    const cat = pickFast(ENABLED_CATEGORIES);
    const fns = cat.enabledFunctions;
    return fns.length ? pickFast(fns).gen() : "x";
}



/*
   Main expression builder

   75% same category
   25% mixed
*/
function randomExpr(allowMultiply=false, allowCompose=false){

    if(ENABLED_CATEGORIES.length === 0) return "x";

    let f, g;
    const sameCategory = Math.random() < 0.75;

    if(sameCategory){
        const cat = pickFast(ENABLED_CATEGORIES);
        const fns = cat.enabledFunctions;
        if(fns.length === 0) return "x";
        f = pickFast(fns).gen();
        g = pickFast(fns).gen();
    } else {
        f = randomBaseFunction();
        g = randomBaseFunction();
    }

    console.log(f);
    console.log(g);

    const a = rint(1,5);
    const b = rint(1,5);
    const mode = Math.random();

    if(mode < 0.7){
        return nerdamer(`${a}*(${f})+${b}*(${g})`);
    }
    if(mode < 0.9 && allowMultiply){
        return nerdamer(`(${f})*(${g})`);
    }
    if(allowCompose){
        return nerdamer(f, {x:`(${g})`});
    }

    return f;
}




/* =====================================================
   Function selector UI
===================================================== */

function buildFuncPanel(){

    const list = document.getElementById("funcList");
    list.textContent = "";

    for(const cat of FUNCTION_CATEGORIES){

        const block = document.createElement("div");
        cat._el = block;

        /* ---------- category header ---------- */

        const header = document.createElement("div");
        header.className = "list-item";

        const title = document.createElement("strong");
        title.textContent = cat.name;

        const catBox = document.createElement("input");
        catBox.type = "checkbox";
        catBox.checked = cat.enabled;
        cat._box = catBox;

        header.append(title, catBox);
        block.appendChild(header);

        /* ---------- functions ---------- */

        if(cat.functions.length > 1){
            for(const fn of cat.functions){

                const row = document.createElement("div");
                row.className = "list-item";
                row.style.paddingLeft = "22px";

                const label = document.createElement("span");
                label.textContent = fn.name;

                const box = document.createElement("input");
                box.type = "checkbox";
                box.checked = fn.enabled;

                fn._el = row;
                fn._box = box;

                row.append(label, box);
                block.appendChild(row);
            }
        }

        list.appendChild(block);
        syncCategoryUI(cat);
    }
}

function syncCategoryUI(cat){

    cat._box.checked = cat.enabled;
    cat._el
        .querySelector(".list-item")
        .classList.toggle("item-disabled", !cat.enabled);

    for(const fn of cat.functions){
        fn._box.checked = fn.enabled;
        fn._el?.classList.toggle("item-disabled", !fn.enabled);
    }
}

document.getElementById("funcList").addEventListener("change", e => {

    const input = e.target;
    if(input.type !== "checkbox") return;

    /* ---------- category toggle ---------- */
    for(const cat of FUNCTION_CATEGORIES){
        if(cat._box === input){

            cat.enabled = input.checked;
            for(const fn of cat.functions){
                fn.enabled = cat.enabled;
            }

            updateCategoryState(cat);
            syncCategoryUI(cat);
            return;
        }

        /* ---------- function toggle ---------- */
        for(const fn of cat.functions){
            if(fn._box === input){

                fn.enabled = input.checked;

                cat.enabled = cat.functions.some(f => f.enabled);
                updateCategoryState(cat);
                syncCategoryUI(cat);
                return;
            }
        }
    }
});


function toggleFuncPanel(){
    const p=document.getElementById("funcPanel");
    const btn=document.getElementById("funcToggleBtn");

    const show = p.style.display==="none";

    p.style.display = show ? "block":"none";
    btn.classList.toggle("active",show);
}