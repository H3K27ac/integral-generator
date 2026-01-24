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


function replaceConstants(str1, str2, options = {}) {
  const {
    intRange = [-5, 5],      // range for a,b,c,d (excluding 0)
    posIntRange = [1, 5]     // range for m,n,k
  } = options;

  const constants = {
    a: null, b: null, c: null, d: null,
    m: null, n: null, k: null
  };

  // Assign values
  for (const key of ["a", "b", "c", "d"]) {
    constants[key] = rint(intRange[0], intRange[1], true);
  }

  for (const key of ["m", "n", "k"]) {
    constants[key] = rint(posIntRange[0], posIntRange[1]);
  }

  function replaceString(str) {
    let result = str;
    for (const [key, value] of Object.entries(constants)) {
      result = nerdamer(result, {[key]: value});
    }
    return result;
  }

  return {
    integrand: replaceString(str1).toString(),
    solution: replaceString(str2).toString(),
    values: constants
  };
}


/* =====================================================
   Template generator
===================================================== */

function generateProblem(){

    const enabled = TECHNIQUES.filter(t=>t.enabled);

    if(enabled.length===0){
        alert("Select at least one technique.");
        return null;
    }

    const tech = pick(enabled);
    const template = pick(tech.templates);

    const replaced = replaceConstants(template.integral,template.solution);
    
    return {
        method: tech.name,
        latex: `\\int ${toLaTeX(replaced.integrand)}\\,dx`,
        solutionLatex: `= ${toLaTeX(replaced.solution)} +C`
    };
}

function toLaTeX(expression) {
    console.log(expression);
    return nerdamer.convertToLaTeX(expression).replace(/\\cdot/g, "").replace(/log/g, "ln");
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








/* =========================
   New Problem Generator
   ========================= */

let currentSolutionLatex="";
let currentMethod="";

const solution = document.getElementById("solution");
const problem = document.getElementById("problem");
const method = document.getElementById("method");

function newProblem(){

    clearCanvas();
    solution.innerHTML="";

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
    if(watchVisible) pauseTimer();
}


