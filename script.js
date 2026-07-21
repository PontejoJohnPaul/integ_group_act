const apiKey = "f28e54cd1a7b7a09e2874900";
const EXCHANGE_API = "https://v6.exchangerate-api.com/v6";


const FRANKFURTER_API = "https://api.frankfurter.dev/v1";

const CACHE_TTL_MS = 5 * 60 * 1000;

const POLL_INTERVAL_MS = 10 * 60 * 1000;

let chart;
let latestCache = null; 
let historyCache = {};  
let changeCache = {};   

let trackerFrom = "USD";
let trackerTo = "PHP";
let trackerRange = "1D";

let pollTimer = null;



async function getLatestRates(base) {

    const isFresh =
        latestCache &&
        latestCache.base === base &&
        (Date.now() - latestCache.fetchedAt) < CACHE_TTL_MS;

    if (isFresh) {
        return latestCache;
    }

    const response = await fetch(`${EXCHANGE_API}/${apiKey}/latest/${base}`);
    const data = await response.json();

    if (data.result !== "success") {
        throw new Error("API Error");
    }

    latestCache = {
        base,
        rates: data.conversion_rates,
        fetchedAt: Date.now()
    };

    return latestCache;

}




async function populateCurrencyDropdowns() {

    try {

        const cached = await getLatestRates("USD");
        const currencies = Object.keys(cached.rates).sort();

        const fromSel = document.getElementById("from");
        const toSel = document.getElementById("to");

        const prevFrom = fromSel.value || "USD";
        const prevTo = toSel.value || "PHP";

        fromSel.innerHTML = "";
        toSel.innerHTML = "";

        currencies.forEach(code => {
            fromSel.innerHTML += `<option value="${code}"${code === prevFrom ? " selected" : ""}>${code}</option>`;
            toSel.innerHTML += `<option value="${code}"${code === prevTo ? " selected" : ""}>${code}</option>`;
        });

    } catch (err) {
        console.error("Could not populate currencies:", err);
        const errorEl = document.getElementById("error");
        if (errorEl) errorEl.innerHTML = "⚠ Could not load currency list. Please check your connection and refresh.";
    }

}

async function convertCurrency() {

    const amount = parseFloat(document.getElementById("amount").value) || 0;
    const from = document.getElementById("from").value;
    const to = document.getElementById("to").value;

    const result = document.getElementById("result");
    const rateText = document.getElementById("rate");
    const error = document.getElementById("error");

    error.innerHTML = "";
    result.value = "Converting...";
    rateText.innerHTML = "";

    try {

        const cached = await getLatestRates(from);
        const rate = cached.rates[to];
        const answer = amount * rate;

        result.value = answer.toFixed(2);
        rateText.innerHTML = `1 ${from} = ${rate.toFixed(4)} ${to}`;

        updateDashboard(cached.rates, from, to, rate);
        updateTable(cached.rates);
        updateTime();

        recordLivePoint(from, to, rate);

    } catch (err) {

        console.error("Conversion failed:", err);
        result.value = "";
        error.innerHTML = "⚠ Unable to retrieve exchange rate. Please check your connection.";

    }

}



async function updateDashboard(rates, from, to, rate) {

    document.getElementById("currentRate").innerHTML = rate.toFixed(4);
    document.getElementById("baseCurrency").innerHTML = from;
    document.getElementById("targetCurrency").innerHTML = to;

    const changeEl = document.getElementById("change24h");

    try {

        const prevRate = await getYesterdayRate(from, to);

        if (prevRate) {
            setChangeText(changeEl, rate, prevRate);
        } else {
            changeEl.className = "neutral";
            changeEl.innerHTML = "--";
        }

    } catch (err) {
        changeEl.className = "neutral";
        changeEl.innerHTML = "--";
    }

}

async function getYesterdayRate(from, to) {

    const dateISO = daysAgoISO(1);
    const cacheKey = `${from}_${to}_${dateISO}`;

    if (changeCache[cacheKey] !== undefined) {
        return changeCache[cacheKey];
    }

    const yesterday = await fetchFrankfurterDate(dateISO, from);
    const prevRate = yesterday?.rates?.[to] ?? null;

    changeCache[cacheKey] = prevRate;
    return prevRate;

}

function setChangeText(el, current, previous) {

    const diff = current - previous;
    const pct = (diff / previous) * 100;

    const sign = diff >= 0 ? "+" : "";
    el.innerHTML = `${sign}${pct.toFixed(2)}%`;
    el.className = diff > 0 ? "positive" : diff < 0 ? "negative" : "neutral";

}



function updateTable(rates) {

    const tbody = document.getElementById("rateTable");
    tbody.innerHTML = "";

    Object.entries(rates)
        .slice(0, 25)
        .forEach(([code, value]) => {

            tbody.innerHTML += `
            <tr>
                <td>${code}</td>
                <td>${value}</td>
            </tr>
            `;

        });

}



function initTracker() {

    document.querySelectorAll(".chip").forEach(chip => {
        chip.addEventListener("click", () => {
            setTrackerPair(chip.dataset.from, chip.dataset.to);
        });
    });

    document.querySelectorAll(".range-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".range-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            trackerRange = tab.dataset.range;
            loadTracker();
        });
    });

    document.getElementById("trackBtn").addEventListener("click", () => {
        const from = document.getElementById("from").value;
        const to = document.getElementById("to").value;
        setTrackerPair(from, to);
    });

    startPolling();
    loadTracker();

}

function setTrackerPair(from, to) {

    trackerFrom = from;
    trackerTo = to;

    document.getElementById("trackerPairLabel").innerHTML = `${from} &rarr; ${to}`;

    document.querySelectorAll(".chip").forEach(chip => {
        chip.classList.toggle(
            "active",
            chip.dataset.from === from && chip.dataset.to === to
        );
    });

    loadTracker();

}

async function loadTracker() {

    const note = document.getElementById("trackerNote");
    note.innerHTML = "";

    try {

        let labels, data;

        if (trackerRange === "1D") {
            ({ labels, data } = getLivePoints(trackerFrom, trackerTo));

            if (data.length < 2) {
                note.innerHTML =
                    "Building today's chart from live readings \u2014 keep the page open and it fills in over time.";
            }

        } else {
            ({ labels, data } = await getFrankfurterSeries(trackerFrom, trackerTo, trackerRange));
        }

        renderChart(labels, data, trackerTo);
        updateTrackerStats(data);

    } catch (err) {

        console.error("Tracker chart load failed:", err);
        note.innerHTML = "⚠ Unable to load chart data for this pair.";
        renderChart([], [], trackerTo);
        updateTrackerStats([]);

    }

}

function updateTrackerStats(data) {

    const rateEl = document.getElementById("trackerRate");
    const changeEl = document.getElementById("trackerChange");

    if (!data.length) {
        rateEl.innerHTML = "--";
        changeEl.innerHTML = "--";
        changeEl.className = "neutral";
        return;
    }

    const latest = data[data.length - 1];
    const first = data[0];

    rateEl.innerHTML = latest.toFixed(4);
    setChangeText(changeEl, latest, first);

}

function renderChart(labels, data, targetCode) {

    const ctx = document.getElementById("rateChart");

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {

        type: "line",

        data: {
            labels: labels,
            datasets: [{
                label: `Rate (${targetCode})`,
                data: data,
                borderColor: "#38bdf8",
                backgroundColor: "rgba(56,189,248,.15)",
                borderWidth: 3,
                tension: .35,
                fill: true,
                pointRadius: labels.length > 40 ? 0 : 4,
                pointBackgroundColor: "#38bdf8"
            }]
        },

        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: false }
            }
        }

    });

}


function livePointsKey(from, to) {
    return `liveRates_${from}_${to}`;
}

function recordLivePoint(from, to, rate) {

    const key = livePointsKey(from, to);
    const now = Date.now();
    const points = JSON.parse(localStorage.getItem(key) || "[]");

    
    const last = points[points.length - 1];
    if (last && (now - last.t) < 60 * 1000) {
        return;
    }

    points.push({ t: now, r: rate });

    const cutoff = now - (24 * 60 * 60 * 1000);
    const trimmed = points.filter(p => p.t >= cutoff);

    localStorage.setItem(key, JSON.stringify(trimmed));

    if (from === trackerFrom && to === trackerTo && trackerRange === "1D") {
        const { labels, data } = getLivePoints(from, to);
        renderChart(labels, data, to);
        updateTrackerStats(data);
    }

}

function getLivePoints(from, to) {

    const key = livePointsKey(from, to);
    const points = JSON.parse(localStorage.getItem(key) || "[]");

    const labels = points.map(p =>
        new Date(p.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );

    const data = points.map(p => p.r);

    return { labels, data };

}

function startPolling() {

    if (pollTimer) {
        clearInterval(pollTimer);
    }

    pollTimer = setInterval(async () => {

        try {
            const cached = await getLatestRates(trackerFrom);
            const rate = cached.rates[trackerTo];
            recordLivePoint(trackerFrom, trackerTo, rate);
        } catch (err) {
            console.warn("Auto-poll failed:", err);
        }

    }, POLL_INTERVAL_MS);

}



function daysAgoISO(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
}

async function fetchFrankfurterDate(dateISO, base) {

    const response = await fetch(`${FRANKFURTER_API}/${dateISO}?base=${base}`);

    if (!response.ok) {
        return null;
    }

    return response.json();

}

async function getFrankfurterSeries(from, to, range) {

    const cacheKey = `${from}_${to}_${range}`;

    if (historyCache[cacheKey]) {
        return historyCache[cacheKey];
    }

    const rangeDays = {
        "1M": 30,
        "1Y": 365,
        "5Y": 365 * 5
    };

    const start = daysAgoISO(rangeDays[range]);
    const end = daysAgoISO(0);

    const url = `${FRANKFURTER_API}/${start}..${end}?base=${from}&symbols=${to}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.rates) {
        throw new Error("No historical data");
    }


    // (weekly points for 1Y, monthly points for 5Y)
    const step = range === "1Y" ? 7 : range === "5Y" ? 30 : 1;
    const sortedDates = Object.keys(data.rates).sort()
        .filter((_, i, arr) => i % step === 0 || i === arr.length - 1);

    const labels = sortedDates.map(date => {
        const d = new Date(date);
        return range === "1M"
            ? d.toLocaleDateString([], { month: "short", day: "numeric" })
            : d.toLocaleDateString([], { month: "short", year: "2-digit" });
    });

    const values = sortedDates.map(date => data.rates[date][to]);

    const result = { labels, data: values };
    historyCache[cacheKey] = result;

    return result;

}




function updateTime() {

    const now = new Date();
    document.getElementById("lastUpdate").innerHTML =
        "Last Updated : " + now.toLocaleString();

}



document.getElementById("swapBtn").addEventListener("click", () => {

    const from = document.getElementById("from");
    const to = document.getElementById("to");

    const temp = from.value;
    from.value = to.value;
    to.value = temp;

    convertCurrency();

});




document.getElementById("amount").addEventListener("input", convertCurrency);
document.getElementById("from").addEventListener("change", convertCurrency);
document.getElementById("to").addEventListener("change", convertCurrency);



window.onload = async () => {
    await populateCurrencyDropdowns();
    convertCurrency();
    initTracker();
};
