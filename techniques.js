/* =====================================================
   METHODS + TEMPLATE REGISTRY
===================================================== */

const Templates = new Map(); // id -> template
const TemplateIndex = new Map();

function validateTemplate(t) {
    if (!t.id) throw "Missing id";
    if (!Array.isArray(t.methods)) throw "methods must be array";
    if (typeof t.generate !== "function") throw "generate must be function";
}


function addTemplate(template) {
    validateTemplate(template);

    Templates.set(template.id, template);

    for (const method of template.methods) {
        if (!TemplateIndex.has(method)) {
        TemplateIndex.set(method, new Set());
        }
        TemplateIndex.get(method).add(template.id);
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
    Object.keys(Methods).map(key => [
        key,
        { enabled: true, blacklisted: false }
    ])
);


function getTemplates({
    methods = null,
    minDifficulty = 1,
    maxDifficulty = Infinity
} = {}) {

    // If no methods explicitly provided, use enabled ones
    const activeMethods = methods ?? Object.entries(MethodState)
        .filter(([, s]) => s.enabled)
        .map(([key]) => key);

    if (activeMethods.length === 0) {
        alert("Select at least one method.");
        return [];
    }

    // Collect candidate template IDs
    let ids = new Set();

    for (const method of activeMethods) {
        const bucket = TemplateIndex.get(method);
        if (!bucket) continue;
        for (const id of bucket) ids.add(id);
    }

    const results = [...ids]
        .map(id => Templates.get(id))
        .filter(t =>
        // difficulty filter
        t.difficulty >= minDifficulty &&
        t.difficulty <= maxDifficulty &&

        // must not use any blacklisted methods
        !t.methods.some(m => MethodState[m].blacklisted)
        );

    return results;
}



/* =====================================================
   METHODS WITH DIFFICULTY
===================================================== */


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


const TEMPLATE_DEFS = [
    {
        id: "power_rule_basic",
        methods: ["POWER"],
        difficulty: 1,
        params: ["a","n"],
        generate: ({a,n}) => ({
            integral: `${a}*x^${n}`,
            solution: `${a}*x^${n+1}/${n+1}`
        })
    },

    {
        id: "exp_basic",
        methods: ["EXP"],
        difficulty: 1,
        params: ["n"],
        generate: ({n}) => ({
            integral: `e^(${n}*x)`,
            solution: `e^(${n}*x) / ${n}`
        })
    },

    {
        id: "sin_basic",
        methods: ["TRIG"],
        difficulty: 1,
        params: ["a","b","c"],
        generate: ({a,b,c}) => ({
            integral: `${a}*sin(${b}*x+${c})`,
            solution: `-${a}/${b}*cos(${b}*x+${c})`
        })
    },

    {
        id: "cos_basic",
        methods: ["TRIG"],
        difficulty: 1,
        params: ["a","b","c"],
        generate: ({a,b,c}) => ({
            integral: `${a}*cos(${b}*x+${c})`,
            solution: `${a}/${b}*sin(${b}*x+${c})`
        })
    },

    {
        id: "u_sub_ax+b",
        methods: ["USUB"],
        difficulty: 2,
        params: ["a","b","n"],
        generate: ({a,b,n}) => {
            const ninv = `(1/(${n}+1))`;
            const axb = `(${a}*x+${b})`;
            return {
                integral: `x*${axb}^${ninv}`,
                solution: `${axb}^(${ninv}+2)/((${a})^2*(${ninv}+2))-${axb}^(${ninv}+1)/((${a})^2*(${ninv}+1))`
            };
        }
    },

    {
        id: "ibp_with_exp",
        methods: ["IBP","EXP"],
        difficulty: 2,
        params: ["a","n"],
        generate: ({a,n}) => {
        
        return {
            integral: `${a}*x^${n}*exp(x)`,
            solution: `${a}*exp(x)*(${generateIBPPolynomial(n)})`
        };
        }
    },

    {
        id: "u_sub_logn",
        methods: ["USUB","IBP","LOG","EXP"],
        difficulty: 2,
        params: ["a","n"],
        generate: ({a,n}) => {
        
        return {
            integral: `${a}*log(x)^${n}`,
            solution: `${a}*x*(${generateIBPPolynomial(n,"log(x)")})`
        };
        }
    },

    {
        id: "ibp_x_sin",
        methods: ["IBP","TRIG"],
        difficulty: 2,
        params: ["a","b","c","n"],
        generate: ({a,b,c,n}) => {
        
        return {
            integral: `${a}*x^${n}*sin(${b}*x+${c})`,
            solution: integrateAxnTrig(a, n, b, c, trig = "sin")
        };
        }
    },

    {
        id: "ibp_x_cos",
        methods: ["IBP","TRIG"],
        difficulty: 2,
        params: ["a","b","c","n"],
        generate: ({a,b,c,n}) => {
        
        return {
            integral: `${a}*x^${n}*cos(${b}*x+${c})`,
            solution: integrateAxnTrig(a, n, b, c, trig = "cos")
        };
        }
    },

    {
        id: "zero_sub_basic",
        methods: ["ZERO"],
        difficulty: 2,
        params: ["a","b"],
        generate: ({a,b}) => {
        
        return {
            integral: `x^2/(${a}*x+${b})`,
            solution: `${b}^2/${a}^3*log(abs(${a}*x+${b}))+x^2/(2*${a})-${b}*x/${a}^2`
        };
        }
    },
];

TEMPLATE_DEFS.forEach(addTemplate)



