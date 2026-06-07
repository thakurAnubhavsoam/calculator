/* ══════════════════════════════════════════════
   CALCULATOR JAVASCRIPT
   
   State variables — calculator ki current state.
   Ye variables hamesha current value track karte hain.
══════════════════════════════════════════════ */

let expression = ''; // Poora expression: "12 + 5 *"
let justEvaled = false; // Kya abhi = press hua? (Next digit pe reset ke liye)

/* DOM elements cache karo — baar baar querySelector
   nahi chalana padega. Ek baar dhoondho, store karo. */
const exprEl = document.getElementById('expression');
const resultEl = document.getElementById('result');

/* ── UPDATE DISPLAY ─────────────────────────────
   Dono display elements ko update karne ki helper function.
   Argument: current string aur result text.
─────────────────────────────────────────────── */
function updateDisplay(expr, res) {
    exprEl.innerText = expr;
    resultEl.innerText = res;

    /* Font size dynamically adjust karo long numbers ke liye */
    const len = String(res).length;
    resultEl.style.fontSize = len > 10 ? '1.5rem' : len > 7 ? '1.9rem' : '2.4rem';
}

/* ── LIVE PREVIEW ───────────────────────────────
   Jab expression type karo, neeche live result dikhao.
   try-catch: invalid expression pe error na aaye.
─────────────────────────────────────────────── */
function livePreview() {
    try {
        /* eval() — string ko JavaScript expression ki tarah evaluate karta hai. "12+5" → 17
           Warning: User input pe direct eval() avoid karo production mein,
           lekin calculator ke liye numbers only hain to safe hai. */
        const val = eval(expression);
        if (val !== undefined && !isNaN(val)) {
            resultEl.innerText = parseFloat(val.toFixed(10)); // Floating point fix
        }
    } catch (e) {
        /* Invalid expression (incomplete) — kuch mat dikhao */
    }
}

/* ── MAIN BUTTON HANDLER ────────────────────────
   Har button click yahan aata hai.
   val = data-val attribute se aaya value.
─────────────────────────────────────────────── */
function handleBtn(val) {

    /* -- AC: All Clear -- */
    if (val === 'AC') {
        expression = '';
        justEvaled = false;
        updateDisplay('', '0');
        return;
    }

    /* -- +/- : Positive to Negative toggle -- */
    if (val === '+/-') {
        if (expression === '' || expression === '0') return; /* Last number ko negate karo */
        try {
            const cur = eval(expression);
            expression = String(-cur);
            updateDisplay('', expression);
        } catch (e) {}
        return;
    }

    /* -- % : Percentage -- */
    if (val === '%') {
        try {
            const cur = eval(expression);
            expression = String(cur / 100);
            updateDisplay('', expression);
        } catch (e) {}
        return;
    }

    /* -- = : Calculate Final Result -- */
    if (val === '=') {
        if (expression === '') return;
        try {
            const res = eval(expression);
            const formatted = parseFloat(res.toFixed(10));
            updateDisplay(expression + ' =', formatted);
            expression = String(formatted); /* Result ko next calculation ke liye rakh lo */
            justEvaled = true;
        } catch (e) {
            updateDisplay(expression, 'Error');
            expression = '';
        }
        return;
    }

    /* -- Operator (+, -, *, /) -- */
    const isOperator = ['+', '-', '*', '/'].includes(val);
    /* Agar = abhi press hua tha aur ab operator press hua,
       to expression wahi rakho (result se continue karo) */
    if (justEvaled && isOperator) {
        justEvaled = false; /* expression already result hai — sirf operator add karo */
    } else if (justEvaled) {
        /* = ke baad number press kiya — fresh start */
        expression = '';
        justEvaled = false;
    }

    /* Consecutive operators avoid karo (e.g., "5++3") */
    if (isOperator) {
        const lastChar = expression.slice(-1);
        if (['+', '-', '*', '/'].includes(lastChar)) {
            expression = expression.slice(0, -1); /* Last operator replace karo */
        }
    }

    /* Dot se shuru nahi ho sakta — "0." bana do */
    if (val === '.' && expression === '') expression = '0';
    /* Same expression mein 2 dots nahi ho sakte */
    if (val === '.') {
        const parts = expression.split(/[\+\-\*\/]/);
        const lastPart = parts[parts.length - 1];
        if (lastPart.includes('.')) return;
    }

    /* Expression mein value add karo */
    expression += val;
    exprEl.innerText = expression;
    livePreview(); /* Live result dikhao */
}

/* ── RIPPLE EFFECT FUNCTION ─────────────────────
   Click pe button pe ek circle expand hota hai.
   Mouse ki position se circle start hota hai.
─────────────────────────────────────────────── */
function createRipple(btn, e) {
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    btn.appendChild(ripple);
    /* Animation khatam hone ke baad element remove karo — memory leak avoid */
    setTimeout(() => ripple.remove(), 500);
}

/* ── EVENT LISTENERS ────────────────────────────
   Event Delegation — har button pe alag listener
   lagane ki jagah, parent .buttons pe ek listener.
   e.target = actual clicked element
   .closest('.btn') = nearest .btn ancestor dhundho
─────────────────────────────────────────────── */
document.querySelector('.buttons').addEventListener('click', function(e) {
    const btn = e.target.closest('.btn'); /* Button element dhundho */
    if (!btn) return; /* Button ke bahar click = ignore */

    createRipple(btn, e); /* Visual feedback */
    handleBtn(btn.dataset.val); /* data-val attribute padho */
});

/* ── KEYBOARD SUPPORT ───────────────────────────
   Keyboard se bhi calculator use ho sake.
   keydown event = koi bhi key press.
─────────────────────────────────────────────── */
document.addEventListener('keydown', function(e) {
    const keyMap = {
        'Enter': '=',
        'Backspace': 'AC',
        'Escape': 'AC',
        '%': '%'
    };
    const key = keyMap[e.key] || e.key;
    /* Valid keys: digits, operators, dot, mapped keys */
    if ('0123456789+-*/.=%'.includes(key) || key === 'AC') {
        handleBtn(key);

        /* Visually highlight corresponding button */
        document.querySelectorAll('.btn').forEach(btn => {
            if (btn.dataset.val === key) {
                btn.style.background = 'rgba(255,255,255,0.35)';
                setTimeout(() => btn.style.background = '', 150);
            }
        });
    }
});