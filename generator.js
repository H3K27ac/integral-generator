/* =========================
   Utilities
========================= */

function rint(min, max, nonZero=false) {
    let val;
    do {
      val = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (nonZero && val === 0);
    return val;
}

function pick(arr){
    return arr[(Math.random() * arr.length) | 0];
}

/* =====================================================
   Constant replacement
   a,b,c,k,m,n - random integers
===================================================== */


function randomConstants(options={}){
    const {
        intRange = [-5, 5],      // range for a,b,c,d (excluding 0)
        posIntRange = [1, 5]     // range for m,n,k
        }= options;

    const constants = {
        a: null, b: null, c: null, d: null,
        m: null, n: null, k: null
    };

    for (const key of ["a", "b", "c", "d"]) {
        constants[key] = rint(intRange[0], intRange[1], true);
    }

    for (const key of ["m", "n", "k"]) {
        constants[key] = rint(posIntRange[0], posIntRange[1]);
    }


    return constants;
}


/* =====================================================
   Hybrid generator
===================================================== */

function generateProblem(){
    const valid = getTemplates();

    if (valid.length === 0) {
        alert("No templates match selected methods.");
        return null;
    }

    const template = pick(valid);

    const constants = randomConstants();

    const { integral, solution } = template.generate(constants);
    
    return {
        method: JSON.stringify(template.methods),
        latex: `\\int ${toLaTeX(integral)}\\,dx`,
        solutionLatex: `= \\boxed{${toLaTeX(solution)} +C}`
    };
}

function toLaTeX(expression) {
    return nerdamer(expression)
        .toTeX()
        .replace(/\\cdot/g, "")
        .replace(/log/g, "ln")
        .replace(/\\left\(\\left\|/g, "\\left\|")
        .replace(/\\right\|\\right\)/g, "\\right\|");
}










/* =========================
   Public generator
========================= 

function generateProblem(){
    
    const enabled = TECHNIQUES.filter(t=>t.enabled);

    if(enabled.length===0){
        alert("Select at least one technique.");
        return null;
    }

    const tech = pick(enabled);

    const prob = tech.fn();

    const integrand = nerdamer(prob.integrand);
    const solution  = nerdamer(prob.solution);

    return {
        integrand,
        solution,
        latex: `\\int ${nerdamer(integrand).toTeX().replace(/\\cdot/g, "")}\\,dx`,
        solutionLatex: `= ${nerdamer(solution).toTeX().replace(/\\cdot/g, "")} +C`
    };
}

*/