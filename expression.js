/* =====================================================
   CAS-BASED INTEGRAL GENERATION FRAMEWORK
===================================================== */

// import Algebrite from "algebrite";

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

        `${n}*x`,

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
        integrand: Algebrite.simplify(integrand),
        solution: Algebrite.integral(integrand)
    };
}


/* =========================
   Technique Registry
========================= */

const TECHNIQUES = [];


/* -------------------------------------------------
   Technique 1 - direct
------------------------------------------------- */

TECHNIQUES.push(baseProblem);


/* -------------------------------------------------
   Technique 2 - u-substitution
   int g(f(x)) f'(x) dx
------------------------------------------------- */

TECHNIQUES.push(function(){

    const f = randomExpr(1);

    /* pick outer integral in variable u */
    let g = randomExpr(1).replaceAll("x","u");

    /* compose */
    const g_of_f = Algebrite.subst(f,"x",g);

    const fprime = Algebrite.derivative(f);

    const integrand = `(${g_of_f}) * (${fprime})`;

    return {
        integrand: Algebrite.simplify(integrand),
        solution: Algebrite.integral(integrand)
    };
});



/* =========================
   Public generator
========================= */

function generateProblem(){

    const tech = pick(TECHNIQUES);

    const prob = tech();

    const integrand = Algebrite.simplify(prob.integrand);
    const solution  = Algebrite.simplify(prob.solution);

    return {
        integrand,
        solution,
        latex: `\\int ${Algebrite.run(`printlatex(${integrand})`)}\\,dx`,
        solutionLatex: Algebrite.run(`printlatex(${solution})`) + "+C"
    };
}
