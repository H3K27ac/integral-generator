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

    const enabledMethods = METHODS.filter(m=>m.enabled).map(m=>m.name);

    if(enabledMethods.length===0){
        alert("Select at least one method.");
        return null;
    }

    const blacklistedMethods = METHODS.filter(m=>m.blacklisted).map(m=>m.name);


    const valid = TEMPLATES.filter(t =>
        /* must match at least one enabled */
        t.methods.some(m => enabledMethods.includes(m)) &&

        /* must not contain any blacklisted */
        !t.methods.some(m => blacklistedMethods.includes(m))
    );


    if(valid.length===0){
        alert("No templates match selected methods.");
        return null;
    }

    const template = pick(valid);

    const constants = randomConstants();

    const { integral, solution } = template.generate(constants);
    
    return {
        method: JSON.stringify(template.methods),
        latex: `\\int ${toLaTeX(integral)}\\,dx`,
        solutionLatex: `= ${toLaTeX(solution)} +C`
    };
}

function toLaTeX(expression) {
    return nerdamer(expression).toTeX().replace(/\\cdot/g, "").replace(/log/g, "ln");
}







/* =========================
   New Problem Generator
   ========================= */

let currentSolutionLatex="";
let currentMethod="";

const solution = document.getElementById("solution");
const problem = document.getElementById("problem");
const method = document.getElementById("method");

function newProblem(){

    canvas.clear();
    problem.style.display = "block";
    solution.style.display = "none";
    method.innerHTML="";

    const p = generateProblem();
    if (!p) return;

    currentSolutionLatex = p.solutionLatex;
    currentMethod = p.method;

    katex.render(p.latex, problem);

    katex.render(
        p.latex, problem, {
            displayMode: true,
        }
    );

    if(watchVisible){
        resetTimer();
        startTimer();
    }
}

function showSolution(){
    katex.render(currentSolutionLatex, solution, {
        displayMode: true,
    });
    method.innerHTML = currentMethod;
    solution.style.display = "block";
    if(watchVisible) pauseTimer();
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