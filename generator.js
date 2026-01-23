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

    const integrand = nerdamer(prob.integrand);
    const solution  = nerdamer(prob.solution);

    return {
        integrand,
        solution,
        latex: `\\int ${nerdamer(integrand).toTeX().replace(/\\cdot/g, "")}\\,dx`,
        solutionLatex: `= ${nerdamer(solution).toTeX().replace(/\\cdot/g, "")} +C`
    };
}










/* =========================
   New Problem Generator
   ========================= */

let currentSolutionLatex="";

const solution = document.getElementById("solution");
const problem = document.getElementById("problem");

function newProblem(){

    clearCanvas();
    solution.innerHTML="";

    const p = generateProblem();
    if (!p) return;

    currentSolutionLatex = p.solutionLatex;

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
    if(watchVisible) pauseTimer();
}


