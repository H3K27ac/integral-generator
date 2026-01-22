/* =========================
   New Problem Generator
   ========================= */

let solutionExpr=null;

function newProblem(){

    clearCanvas();
    document.getElementById("solution").innerHTML="";

    let t = TECHNIQUES[randomInt(0,TECHNIQUES.length-1)];

    let prob = t();

    let integrand = prob.integrand.simplify();
    solutionExpr = prob.solution.simplify();

    katex.render(
        `\\int ${integrand.tex()}\\,dx`,
        problem
    );

    if(watchVisible){
        resetTimer();
        startTimer();
    }
}

function showSolution(){
    katex.render(solutionExpr.tex()+"+C", solution);
    if(watchVisible) pauseTimer();
}
