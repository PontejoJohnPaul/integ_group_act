// ================================
// Landing Page (index.html) only
// ================================

function animate(id, target) {

    const el = document.getElementById(id);

    if (!el) {
        return;
    }

    let value = 0;
    const speed = target / 100;

    const counter = setInterval(() => {

        value += speed;

        if (value >= target) {
            value = target;
            clearInterval(counter);
        }

        el.innerHTML = Math.floor(value) + "+";

    }, 20);

}

animate("countries", 180);
animate("currenciesCount", 170);
animate("updates", 1440);
