/* =========================
   Techniques
   ========================= */

const TECHNIQUES=[];

/* ---- identity (base case) ---- */
TECHNIQUES.push(function(){
    return randomBase();
});

/* ---- u-substitution ---- */
TECHNIQUES.push(function(){

    const inner=randomBase(); // gives g(u)

    let a=randomInt(2,4);
    let f=new Add(new Pow(x,a), new Const(randomInt(1,5)));

    let g = inner.integrand;      // g(u)
    let G = inner.solution;       // G(u)

    function substitute(expr){
        if(expr instanceof Var) return f;
        if(expr instanceof Const) return expr;
        if(expr instanceof Sin) return new Sin(substitute(expr.a));
        if(expr instanceof Cos) return new Cos(substitute(expr.a));
        if(expr instanceof Exp) return new Exp(substitute(expr.a));
        if(expr instanceof Pow) return new Pow(substitute(expr.base),expr.n);
        if(expr instanceof Add) return new Add(substitute(expr.a),substitute(expr.b));
        if(expr instanceof Mul) return new Mul(substitute(expr.a),substitute(expr.b));
    }

    let integrand = new Mul(substitute(g), f.diff());
    let solution = substitute(G);

    return {integrand, solution};
});
