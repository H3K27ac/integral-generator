/* =========================
   Polynomial helpers
   ========================= */

function rand(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }

function formatTerm(c,p){
    if(c===0) return "";

    let sign = c<0 ? "-" : "+";
    c = Math.abs(c);

    let coeff = "";
    if(!(c===1 && p!==0)) coeff = c;

    let variable = "";
    if(p>1) variable = `x^{${p}}`;
    else if(p===1) variable = "x";

    if(p===0) return sign + coeff;

    return sign + coeff + variable;
}

function tidy(expr){
    expr = expr.replace(/^\+/,"");
    expr = expr.replace(/\+\-/g,"-");
    return expr || "0";
}

function randomPolynomial(){
    let deg = rand(2,4);
    let s="";

    for(let p=deg;p>=0;p--){
        let c = rand(-5,5);
        if(c!==0) s += formatTerm(c,p);
    }
    return tidy(s);
}

function differentiate(poly){
    let terms = poly.match(/[+-]?[^+-]+/g);
    let out="";

    for(let t of terms){
        let m = t.match(/([+-]?)(\d*)x\^{(\d+)}/);
        if(m){
            let sign=m[1]==="-"?-1:1;
            let c=m[2]===""?1:+m[2];
            let p=+m[3];
            out+=formatTerm(sign*c*p,p-1);
            continue;
        }

        m = t.match(/([+-]?)(\d*)x$/);
        if(m){
            let sign=m[1]==="-"?-1:1;
            let c=m[2]===""?1:+m[2];
            out+=formatTerm(sign*c,0);
        }
    }
    return tidy(out);
}

/* =========================
   Problem
   ========================= */

let solutionLatex="";

function newProblem(){
    clearCanvas();
    document.getElementById("solution").innerHTML="";

    let F=randomPolynomial();
    let f=differentiate(F);

    solutionLatex=F;

    katex.render(`\\int ${f}\\,dx`, problem);

    if(watchVisible){
        resetTimer();
        startTimer();
    }
}

function showSolution(){
    katex.render(solutionLatex+"+C", solution);
}