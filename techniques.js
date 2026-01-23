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

addTechnique("Base integral", baseProblem);


/* -------------------------------------------------
   Technique 2 - u-substitution
   int g(f(x)) f'(x) dx
------------------------------------------------- */

addTechnique("u-substitution", function(){

    const f = randomExpr(1);

    /* pick outer integral in variable u */
    let g = randomExpr(1);

    /* compose */
    const g_of_f = nerdamer(g, {x:f});

    const fprime = nerdamer.diff(f);

    const integrand = `(${g_of_f}) * (${fprime})`;

    console.log(fg)
    console.log(fprime)
    console.log(f)
    console.log(fprime)

    return {
        integrand: nerdamer.simplify(integrand),
        solution: nerdamer(nerdamer.integrate(g), {x:f})
    };
});






/* =========================
   Technique panel UI
========================= */

function buildTechPanel(){

    const list = document.getElementById("techList");
    list.innerHTML="";

    TECHNIQUES.forEach((t,i)=>{

        const row=document.createElement("div");
        row.className="tech-item";

        const label=document.createElement("span");
        label.textContent=t.name;

        const box=document.createElement("input");
        box.type="checkbox";
        box.checked=t.enabled;

        box.onchange=()=>{
            t.enabled=box.checked;
            row.classList.toggle("tech-disabled", !t.enabled);
        };

        if(!t.enabled) row.classList.add("tech-disabled");

        row.appendChild(label);
        row.appendChild(box);

        list.appendChild(row);
    });
}

function toggleTechPanel(){
    const p=document.getElementById("techPanel");
    const btn=document.getElementById("techToggleBtn");

    const show = p.style.display==="none";

    p.style.display = show ? "block":"none";
    btn.classList.toggle("active", show);
}

window.addEventListener("load", buildTechPanel);
