/* =========================
   Symbolic Expression System
   ========================= */

class Expr{
    diff(){ throw "diff not implemented"; }
    tex(){ throw "tex not implemented"; }
}

/* ---- primitives ---- */

class Const extends Expr{
    constructor(c){ super(); this.c=c; }
    diff(){ return new Const(0); }
    tex(){ return this.c.toString(); }
}

class Var extends Expr{
    diff(){ return new Const(1); }
    tex(){ return "x"; }
}

const x = new Var();

/* ---- operations ---- */

class Add extends Expr{
    constructor(a,b){ super(); this.a=a; this.b=b; }
    diff(){ return new Add(this.a.diff(), this.b.diff()); }
    tex(){ return `${this.a.tex()}+${this.b.tex()}`; }
}

class Mul extends Expr{
    constructor(a,b){ super(); this.a=a; this.b=b; }
    diff(){
        return new Add(
            new Mul(this.a.diff(), this.b),
            new Mul(this.a, this.b.diff())
        );
    }
    tex(){ return `${this.a.tex()}\\cdot ${this.b.tex()}`; }
}

class Pow extends Expr{
    constructor(base,n){ super(); this.base=base; this.n=n; }
    diff(){
        return new Mul(
            new Mul(new Const(this.n), new Pow(this.base,this.n-1)),
            this.base.diff()
        );
    }
    tex(){
        if(this.n===1) return this.base.tex();
        return `${this.base.tex()}^{${this.n}}`;
    }
}

class Sin extends Expr{
    constructor(a){ super(); this.a=a; }
    diff(){ return new Mul(new Cos(this.a), this.a.diff()); }
    tex(){ return `\\sin(${this.a.tex()})`; }
}

class Cos extends Expr{
    constructor(a){ super(); this.a=a; }
    diff(){ return new Mul(new Const(-1), new Mul(new Sin(this.a), this.a.diff())); }
    tex(){ return `\\cos(${this.a.tex()})`; }
}

class Exp extends Expr{
    constructor(a){ super(); this.a=a; }
    diff(){ return new Mul(new Exp(this.a), this.a.diff()); }
    tex(){ return `e^{${this.a.tex()}}`; }
}


/* =========================
   Base Integrals
   ========================= */

function randomInt(a,b){
    return Math.floor(Math.random()*(b-a+1))+a;
}

function basePolynomial(){
    let n=randomInt(1,5);
    let F=new Pow(x,n+1);
    return {
        solution: F,
        integrand: F.diff()
    };
}

function baseTrig(){
    let choice=randomInt(0,1);

    if(choice===0){
        return {
            solution:new Sin(x),
            integrand:new Cos(x)
        };
    } else {
        return {
            solution:new Mul(new Const(-1), new Cos(x)),
            integrand:new Sin(x)
        };
    }
}

function baseExp(){
    return {
        solution:new Exp(x),
        integrand:new Exp(x)
    };
}

const BASES=[basePolynomial, baseTrig, baseExp];

function randomBase(){
    return BASES[randomInt(0,BASES.length-1)]();
}

