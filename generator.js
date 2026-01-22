/* =========================
   New Problem Generator
   ========================= */

let solutionExpr=null;

function newProblem(){

    clearCanvas();
    document.getElementById("solution").innerHTML="";

    let t = TECHNIQUES[randomInt(0,TECHNIQUES.length-1)];
    let prob = t();

    solutionExpr = prob.solution;

    katex.render(
        `\\int ${prob.integrand.tex()}\\,dx`,
        document.getElementById("problem")
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
