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


/* =====================================================
   Template-aware constant replacement
===================================================== */

const DEFAULT_CONSTANTS = {
    a: { range: [-5, 5], nonZero: true },
    b: { range: [-5, 5], nonZero: true },
    c: { range: [-5, 5], nonZero: true },
    d: { range: [-5, 5], nonZero: true },
    m: { range: [1, 5] },
    n: { range: [1, 5] },
    k: { range: [1, 5] }
};

function randomConstants(template) {
    const spec = {
        ...DEFAULT_CONSTANTS,
        ...(template.constants ?? {})
    };

    const params = template.params ?? Object.keys(spec);
    const result = {};

    for (const key of params) {
        const { range, nonZero = false } = spec[key];
        result[key] = rint(range[0], range[1], nonZero);
    }

    return result;
}



/* =====================================================
   Hybrid generator
===================================================== */

function generateProblem() {
    const valid = getTemplates();

    if (valid.length === 0) {
        alert("No templates match selected methods.");
        return null;
    }

    const template = pick(valid);
    const constants = randomConstants(template);

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