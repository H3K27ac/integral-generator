/* =========================
   Random expression generator
   ========================= */

function rand(a,b){
    return Math.floor(Math.random()*(b-a+1))+a;
}

function randomPolynomial(){
    let degree = rand(2,4);
    let terms = [];

    for(let i=degree;i>=0;i--){
        let c = rand(-5,5);
        if(c===0) continue;

        if(i===0) terms.push(`${c}`);
        else if(i===1) terms.push(`${c}x`);
        else terms.push(`${c}x^{${i}}`);
    }

    return terms.join("+").replace(/\+\-/g,"-");
}

function differentiate(poly){
    let parts = poly.match(/[+-]?[^+-]+/g);
    let result=[];

    for(let t of parts){
        let match = t.match(/([+-]?\d*)x\^{(\d+)}/);
        if(match){
            let c = match[1]===""||match[1]==="+"?1:match[1]==="-"?-1:+match[1];
            let p = +match[2];
            result.push(`${c*p}x^{${p-1}}`);
            continue;
        }

        match = t.match(/([+-]?\d*)x$/);
        if(match){
            let c = match[1]===""||match[1]==="+"?1:match[1]==="-"?-1:+match[1];
            result.push(`${c}`);
        }
    }

    return result.join("+").replace(/\+\-/g,"-") || "0";
}

/* =========================
   Problem logic
   ========================= */

let solutionLatex="";

function newProblem(){
    clearCanvas();
    document.getElementById("solution").innerHTML="";

    let F = randomPolynomial();
    let f = differentiate(F);

    solutionLatex = F;

    let latex = `\\int ${f}\\, dx`;

    katex.render(latex, document.getElementById("problem"));
}

function showSolution(){
    katex.render(solutionLatex + " + C", document.getElementById("solution"));
}