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
animate("currenciesCount", 165);
// "24/7" is not a numeric value — animation removed (was targeting a non-existent id="updates")
