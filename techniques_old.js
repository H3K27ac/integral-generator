/* =========================
   Technique registry system
========================= */

const TECHNIQUES = [];

function addTechnique(name, fn, enabled=true){
    TECHNIQUES.push({
        name,
        fn,
        enabled
    });
}



/* -------------------------------------------------
   Technique 1 - direct
------------------------------------------------- */

addTechnique("Base integral", function() {

    const integrand = randomExpr();

    return {
        integrand: nerdamer(integrand),
        solution: nerdamer.integrate(integrand)
    };
});


/* -------------------------------------------------
   Technique 2 - u-substitution
   int g(f(x)) f'(x) dx
------------------------------------------------- */

addTechnique("u-substitution", function(){

    const f = randomExpr({
        allowMultiply: true,
        allowCompose: true
    });
    

    /* pick outer integral in variable u */
    let g = randomExpr();

    /* compose */
    const g_of_f = nerdamer(g, {x:f});

    const fprime = nerdamer.diff(f);

    const integrand = `(${g_of_f}) * (${fprime})`;

    return {
        integrand: nerdamer(integrand),
        solution: nerdamer(nerdamer.integrate(g), {x:f})
    };
});

addTechnique("Integration by parts (Polynomial)", function(){
    const f = randomExpr({
        categories: ["Polynomials"],
        allowCombine: false
    });
    const g = randomExpr({
        categories: ["Polynomials","Trigonometric","Exponential"]
    });

    const integrand = `(${f}) * (${g})`;

    return {
        integrand: nerdamer(integrand),
        solution: nerdamer.integrate(integrand)
    };
});

addTechnique("Integration by parts (General)", function(){
    const f = randomExpr({
        categories: ["Polynomials","Logarithms","Inverse Trigonometric"],
        allowCombine: false
    });

    const fprime = nerdamer.diff(f);

    const expression = randomExpr()

    const g = nerdamer(`(${expression}) / (${fprime})`);

    const gprime = nerdamer.diff(g);

    const integrand = `(${f}) * (${gprime})`;

    return {
        integrand: nerdamer(integrand),
        solution: `(${f}) * (${g}) - (${nerdamer.integrate(expression)})`
    };
});




