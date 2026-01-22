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


