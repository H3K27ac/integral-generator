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
addMethod("Zero substitution");


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

addTemplate({

    methods: ["Zero substitution"],
    difficulty: 2,

    generate: ({a, b}) => {

        return {
            integral: `x^2/(${a}*x+${b})`,
            solution: `${b}^2/${a}^3*log(abs(${a}*x+${b}))+x^2/(2*${a})-${b}*x/${a}^2`
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
    let currentTrig = trig;
    let bPow = b;

    // initial sign
    let sign = (trig === "sin") ? -1 : 1;

    for (let k=n; k>=0; k--) {
        const integratedTrig =
            currentTrig === "sin"
                ? `cos(${b}*x+${c})`
                : `sin(${b}*x+${c})`;

        terms.push(
            `${sign * coeff}/${bPow}*x^${k}*${integratedTrig}`
        );

        if (k === 0) break;

        currentTrig = currentTrig === "sin" ? "cos" : "sin";

        coeff *= k;
        bPow *= b;

        // flip trig and sign deterministically
        if (currentTrig == "sin") sign *= -1;
        sign *= -1;
    }

    return terms.join("+").replace(/\+\-/g, "-");
}
