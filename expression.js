/* =====================================================
   CAS-BASED INTEGRAL GENERATION FRAMEWORK
===================================================== */

nerdamer.set('USE_LN', true);

/* =========================
   Utilities
========================= */

function rint(a,b){
    return Math.floor(Math.random()*(b-a+1))+a;
}

function pick(a){
    return a[rint(0,a.length-1)];
}


/* =========================
   Random Expression Generator
========================= */

/*
   Produces MANY different forms:

   polynomials
   trig
   exp
   log
   products
   compositions
   powers

   depth controls complexity
*/

function randomExpr(depth=0){

    if(depth > 2){
        return randomPrimitive();
    }

    const gens = [

        () => randomPrimitive(),

        () => `(${randomExpr(depth+1)} + ${randomExpr(depth+1)})`,

        /*

        () => `(${randomExpr(depth+1)} * ${randomExpr(depth+1)})`,

        () => `(${randomExpr(depth+1)})^${rint(2,5)}`,

        () => `sin(${randomExpr(depth+1)})`,

        () => `cos(${randomExpr(depth+1)})`,

        () => `exp(${randomExpr(depth+1)})`,

        () => `log(${randomExpr(depth+1)})`,

        */

        () => `${rint(2,6)}*(${randomExpr(depth+1)})`
    ];

    return pick(gens)();
}


/* =========================
   Primitive building blocks
========================= */

function randomPrimitive(){

    const n = rint(1,5);

    const primitives = [

        "x",

        `x^${n}`,

        `sin(x)`,

        `cos(x)`,

        `exp(x)`,

        `1/x`
    ];

    return pick(primitives);
}


/* =========================
   Base problems
========================= */

function baseProblem(){

    const integrand = randomExpr(1);

    return {
        integrand: nerdamer.simplify(integrand),
        solution: nerdamer.integrate(integrand)
    };
}


/* =========================
   Public generator
========================= */

function generateProblem(){
    
    const enabled = TECHNIQUES.filter(t=>t.enabled);

    if(enabled.length===0){
        alert("Select at least one technique.");
        return null;
    }

    const tech = pick(enabled);

    const prob = tech.fn();

    const integrand = nerdamer.simplify(prob.integrand);
    const solution  = nerdamer.simplify(prob.solution);

    return {
        integrand,
        solution,
        latex: `\\int ${nerdamer(integrand).toTeX().replace(/\\cdot/g, "")}\\,dx`,
        solutionLatex: nerdamer(solution).toTeX().replace(/\\cdot/g, "") + "+C"
    };
}


