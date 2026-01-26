/* =====================================================
   METHODS + TEMPLATE REGISTRY
===================================================== */

const METHODS = new Map();
const TEMPLATES = [];

function addMethod(name, { enabled = true, blacklisted = false } = {}) {
  METHODS.set(name, { name, enabled, blacklisted });
}

function addTemplate(template) {
  TEMPLATES.push(template);
}

const TemplateIndex = new Map();

for (const t of TEMPLATES) {
  for (const m of t.methods) {
    if (!TemplateIndex.has(m)) TemplateIndex.set(m, []);
    TemplateIndex.get(m).push(t);
  }
}


const Methods = {
  POWER: { label: "Power rule" },
  EXP: { label: "Exponentials" },
  TRIG: { label: "Trigonometric functions" },
  LOG: { label: "Logarithms" },
  USUB: { label: "u-substitution" },
  IBP: { label: "Integration by parts" },
  ZERO: { label: "Zero substitution" }
};

const MethodState = Object.fromEntries(
  Object.keys(Methods).map(name => [
    name,
    { enabled: true, blacklisted: false }
  ])
);


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


addTemplate({

    methods:[Methods.POWER],
    difficulty: 1,

    generate: ({a,n}) => ({

        integral: `${a}*x^${n}`,
        solution: `${a}*x^${n+1}/${n+1}`

    })
});


addTemplate({

    methods:[Methods.EXP],
    difficulty: 1,

    generate: ({n}) => ({

        integral: `e^(${n}*x)`,
        solution: `e^(${n}*x) / ${n}`

    })
});


addTemplate({

    methods:[Methods.TRIG],
    difficulty: 1,

    generate: ({n}) => ({

        integral: `sin(${n}*x)`,
        solution: `-cos(${n}*x) / ${n}`

    })
});


addTemplate({

    methods:[Methods.TRIG],
    difficulty: 1,

    generate: ({n}) => ({

        integral: `cos(${n}*x)`,
        solution: `sin(${n}*x) / ${n}`

    })
});

addTemplate({

    methods:[Methods.USUB],
    difficulty: 2,

    generate: ({a,b,n}) => {
        const ninv = `(1/(${n}+1))`;
        const axb = `(${a}*x+${b})`;
        return {
            integral: `x*${axb}^${ninv}`,
            solution: `${axb}^(${ninv}+2)/((${a})^2*(${ninv}+2))-${axb}^(${ninv}+1)/((${a})^2*(${ninv}+1))`
        };
    }
});


addTemplate({

    methods:[Methods.IBP,Methods.EXP],
    difficulty: 2,

    generate: ({a,n}) => {

        return {
            integral: `${a}*x^${n}*exp(x)`,
            solution: `${a}*exp(x)*(${generateIBPPolynomial(n)})`
        };
    }
});


addTemplate({

    methods:[Methods.USUB,Methods.IBP,Methods.LOG,Methods.EXP],
    difficulty: 2,

    generate: ({a,n}) => {

        return {
            integral: `${a}*log(x)^${n}`,
            solution: `${a}*x*(${generateIBPPolynomial(n,"log(x)")})`
        };
    }
});


addTemplate({

    methods: [Methods.IBP,Methods.TRIG],
    difficulty: 2,

    generate: ({a, b, c, n}) => {

        return {
            integral: `${a}*x^${n}*sin(${b}*x+${c})`,
            solution: integrateAxnTrig(a, n, b, c, trig = "sin")
        };
    }
});

addTemplate({

    methods: [Methods.IBP,Methods.TRIG],
    difficulty: 2,

    generate: ({a, b, c, n}) => {

        return {
            integral: `${a}*x^${n}*cos(${b}*x+${c})`,
            solution: integrateAxnTrig(a, n, b, c, trig = "cos")
        };
    }
});

addTemplate({

    methods: [Methods.ZERO],
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
