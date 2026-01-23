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
   CATEGORY GENERATORS
===================================================== */


/* ---------- polynomial ---------- */
/* ax^n + bx^(n-1) + ... */

function polyGenerator(maxDegree=3){

    const degree = rint(1,maxDegree);
    let terms=[];

    for(let i=degree;i>=0;i--){
        let c=rint(-5,5);
        if(c===0) continue;

        if(i===0) terms.push(`${c}`);
        else if(i===1) terms.push(`${c}*x`);
        else terms.push(`${c}*x^${i}`);
    }

    return terms.join("+").replace(/\+\-/g,"-") || "x";
}


/* ---------- trig ---------- */

function trigGenerator(){

    const a=rint(1,5);
    const b=rint(-5,5);

    const inner = `${a}*x${b>=0?"+":""}${b}`;

    return pick([
        `sin(${inner})`,
        `cos(${inner})`
    ]);
}


/* ---------- exponential ---------- */

function expGenerator(){

    const a=rint(1,5);

    return `exp(${a}*x)`;
}


/* ---------- logarithmic ---------- */

function logGenerator(){

    const a=rint(1,5);
    const b=rint(1,5);

    return `log(${a}*x+${b})`;
}


/* =====================================================
   Register categories
===================================================== */

addFunctionCategory("Polynomials", polyGenerator);
addFunctionCategory("Trig", trigGenerator);
addFunctionCategory("Exponentials", expGenerator);
addFunctionCategory("Logarithms", logGenerator);



/* =====================================================
   Structured function generator
===================================================== */

function enabledCategories(){
    return FUNCTION_CATEGORIES.filter(c=>c.enabled);
}


function randomBaseFunction(){

    const categories = enabledCategories();

    if(categories.length===0){
        alert("Enable at least one function type.");
        return "x";
    }

    return pick(categories).generator();
}


/*
   Controlled combining
*/

function randomExpr(allowMultiply=false, allowCompose=false){

    let f = randomBaseFunction();

    /* 50% chance combine with another */
    if(Math.random()<0.5){

        let g = randomBaseFunction();

        let a=rint(1,5);
        let b=rint(1,5);

        const mode = Math.random();

        if(mode < 0.7){
            /* linear combo */
            return `${a}*(${f}) + ${b}*(${g})`;
        }
        else if(mode < 0.9 && allowMultiply){
            /* multiply */
            return `(${f})*(${g})`;
        }
        else if (allowCompose){
            /* composition */
            return f.replaceAll("x",`(${g})`);
        }
    }

    return f;
}
