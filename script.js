function updateClock() {

    const now = new Date();

    document.getElementById("clock").innerHTML =
        "Last Updated: " + now.toLocaleTimeString();

}

setInterval(updateClock, 1000);
updateClock();

function animate(id, target) {

    let value = 0;

    const speed = target / 100;

    const counter = setInterval(() => {

        value += speed;

        if (value >= target) {
            value = target;
            clearInterval(counter);
        }

        document.getElementById(id).innerHTML =
            Math.floor(value) + "+";

    }, 20);

}

animate("countries", 180);
animate("currenciesCount", 170);
animate("updates", 1440);