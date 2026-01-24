/* =========================
   Utilities
========================= */

function rint(a,b){
    return Math.floor(Math.random()*(b-a+1))+a;
}

function pick(arr){
    return arr[(Math.random() * arr.length) | 0];
}

/* =====================================================
   Constant replacement
   a,b,c,k,m,n - random integers
===================================================== */


function substituteConstants(expr){

    const map = {};

    return expr.replace(/[a-z]/g, letter=>{

        if("x".includes(letter)) return letter;

        if(!map[letter]){
            map[letter] = rint(-5,5);
        }

        return map[letter];
    });
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

    const integrand = substituteConstants(template.integral);
    const solution  = substituteConstants(template.solution);

    console.log(integrand);
    console.log(solution);

    return {
        integrand,
        solution,
        method: tech.name,
        latex: `\\int ${toLaTeX(integrand)}\\,dx`,
        solutionLatex: `= ${toLaTeX(solution)} +C`
    };
}

function toLaTeX(expression) {
    return nerdamer(expression).toTeX().replace(/\\cdot/g, "").replace(/log/g, "ln");
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


