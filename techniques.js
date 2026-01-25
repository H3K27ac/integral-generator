/* =====================================================
   METHODS + TEMPLATE REGISTRY
===================================================== */

const METHODS = [];
const TEMPLATES = [];


/* ---------- methods ---------- */

function addMethod(name, enabled=true, blacklisted=false){
    METHODS.push({
        name,
        enabled,
        blacklisted
    });
}


/* ---------- templates ---------- */

function addTemplate({ generate, methods, difficulty=1}){

    TEMPLATES.push({
        generate,
        methods,   // array of method names
        difficulty
    });
}

/* =====================================================
   METHODS WITH DIFFICULTY
===================================================== */

addMethod("Power rule");
addMethod("Exponentials");
addMethod("Trigonometric functions");
addMethod("Logarithms");

addMethod("u-substitution");
addMethod("Integration by parts");


addTemplate({

    methods:["Power rule"],
    difficulty: 1,

    generate: ({a,n}) => ({

        integral: `${a}*x^${n}`,
        solution: `${a}*x^${n+1}/${n+1}`

    })
});


addTemplate({

    methods:["Exponentials"],
    difficulty: 1,

    generate: ({n}) => ({

        integral: `e^(${n}*x)`,
        solution: `e^(${n}*x) / ${n}`

    })
});


addTemplate({

    methods:["Trigonometric functions"],
    difficulty: 1,

    generate: ({n}) => ({

        integral: `sin(${n}*x)`,
        solution: `-cos(${n}*x) / ${n}`

    })
});


addTemplate({

    methods:["Trigonometric functions"],
    difficulty: 1,

    generate: ({n}) => ({

        integral: `cos(${n}*x)`,
        solution: `sin(${n}*x) / ${n}`

    })
});


addTemplate({

    methods:["u-substitution"],
    difficulty: 2,

    generate: ({a,b}) => ({

        integral: `x*sqrt(${a}*x+${b})`,
        solution: `(${a}*x+${b})^(3/2)*(6*${a}*x-4*${b}) / (15*${a}^2)`

    })
});


addTemplate({

    methods:["Integration by parts","Exponentials"],
    difficulty: 2,

    generate: ({a,n}) => {

        return {
            integral: `${a}*x^${n}*exp(x)`,
            solution: `${a}*exp(x)*(${generateIBPPolynomial(n)})`
        };
    }
});


addTemplate({

    methods:["u-substitution","Integration by parts","Logarithms","Exponentials"],
    difficulty: 2,

    generate: ({a,n}) => {

        return {
            integral: `${a}*log(x)^${n}`,
            solution: `${a}*x*(${generateIBPPolynomial(n,"log(x)")})`
        };
    }
});


addTemplate({

    methods: ["Integration by parts","Trigonometric functions"],
    difficulty: 2,

    generate: ({a, b, c, n}) => {

        return {
            integral: `${a}*x^${n}*sin(${b}*x+${c})`,
            solution: integrateAxnTrig(a, n, b, c, trig = "sin")
        };
    }
});

addTemplate({

    methods: ["Integration by parts","Trigonometric functions"],
    difficulty: 2,

    generate: ({a, b, c, n}) => {

        return {
            integral: `${a}*x^${n}*cos(${b}*x+${c})`,
            solution: integrateAxnTrig(a, n, b, c, trig = "cos")
        };
    }
});






function generateIBPPolynomial(n,variable="x") {
    /* build polynomial:
        x^n - n x^(n-1) + n(n-1)x^(n-2) ...
    */

    let terms = [];
    let coeff = 1;

    for(let k=0;k<=n;k++){

        const power = n-k;

        let sign = (k%2===0) ? 1 : -1;

        let c = sign * coeff;

        let term;

        if(power===0)
            term = `${c}`;
        else if(power===1)
            term = `${c}*${variable}`;
        else
            term = `${c}*${variable}^${power}`;

        terms.push(term);

        coeff *= (n-k);
    }

    return terms.join("+").replace(/\+\-/g,"-");
}

function integrateAxnTrig(a, n, b, c, trig = "sin") {
    let terms = [];
    let coeff = a;
    let currentPower = n;
    let currentTrig = trig;
    let sign = 1; // alternates each IBP step

    for (let k = 0; k <= n; k++) {
        // factorial part: n! / (n-k)!
        let factorialPart = 1;
        for (let i = 0; i < k; i++) {
            factorialPart *= (currentPower - i);
        }

        // b^(k+1) for trig integration
        let bPow = Math.pow(b, k + 1);

        // coefficient as fraction (unsimplified)
        let num = sign * coeff * factorialPart;
        let denom = bPow;

        // trig term
        let trigTerm = currentTrig === "sin"
            ? `sin(${b}*x+${c})`
            : `cos(${b}*x+${c})`;

        // x power
        let xPower = currentPower - k;
        let xPart = xPower > 0 ? `x^${xPower}` : "";

        // format as fraction without simplifying
        let frac = `${num}/${denom}`;

        terms.push(`${frac}${xPart ? "*" + xPart : ""}*${trigTerm}`);

        // prepare for next step
        currentTrig = currentTrig === "sin" ? "cos" : "sin";
        sign *= -1;
    }

    return terms.join(" + ").replace(/\+\-/g, "-");
}




