# 📝 Lab Activity — Code Critique & Bug Fix Record

**Project:** Currency Exchange Tracker  
**Activity:** Fork, Critique, and Improve  
**Date:** 2026-07-21  

---

## 🔍 Critique Summary

After forking and analyzing the original project, the following issues were identified and documented. Each entry includes the **issue description**, **affected file**, **exact line numbers**, and the **fix applied**.

---

## 🐛 Bug Fixes

---

### Bug #1 — Counter Animation Never Fires (Silent Failure)

| Field | Details |
|---|---|
| **Type** | Logic Bug / ID Mismatch |
| **Severity** | Medium — Feature completely non-functional |
| **Files Affected** | `index.html`, `home.js` |

**Problem:**  
`home.js` calls `animate()` using specific element IDs (`"countries"`, `"currenciesCount"`, `"updates"`), but the `<h2>` elements in `index.html` had **no `id` attributes at all**. The `animate()` function has a guard `if (!el) return` — so it silently does nothing. The counter numbers on the landing page appear as static hardcoded text and never animate.

**index.html — Before (Lines 57–70):**
```html
<!-- Line 58 -->
<h2>180+</h2>

<!-- Line 63 -->
<h2>165+</h2>

<!-- Line 68 -->
<h2>24/7</h2>
```

**index.html — After:**
```html
<!-- Line 58 — Added id="countries", reset to "0+" so animation starts from zero -->
<h2 id="countries">0+</h2>

<!-- Line 63 — Added id="currenciesCount", reset to "0+" -->
<h2 id="currenciesCount">0+</h2>

<!-- Line 68 — Left unchanged; "24/7" is not a number and cannot be animated -->
<h2>24/7</h2>
```

---

### Bug #2 — Wrong Count Value + Broken Animation Call for "24/7"

| Field | Details |
|---|---|
| **Type** | Logic Bug / Wrong Value |
| **Severity** | Low–Medium |
| **File Affected** | `home.js` |

**Problem:**  
Two sub-issues in `home.js` lines 31–33:
1. `animate("currenciesCount", 170)` — the target value was `170` but the HTML displayed `165+`. The animation was counting to the wrong number.
2. `animate("updates", 1440)` — this tried to animate an element with `id="updates"` (which did not exist) up to the number `1440`. The stat it was supposed to target shows `"24/7"` — a non-numeric string that can never be meaningfully animated as a counter.

**home.js — Before (Lines 31–33):**
```js
animate("countries", 180);
animate("currenciesCount", 170);   // Wrong: should be 165
animate("updates", 1440);          // Wrong: "24/7" is not a number; id doesn't exist
```

**home.js — After (Lines 31–33):**
```js
animate("countries", 180);
animate("currenciesCount", 165);   // Fixed: corrected to match the displayed label
// "24/7" is not a numeric value — animation removed (was targeting a non-existent id="updates")
```

---

### Bug #3 — Silent Error Swallowing in `populateCurrencyDropdowns()`

| Field | Details |
|---|---|
| **Type** | Error Handling |
| **Severity** | Medium — Errors invisible to users and hard to debug |
| **File Affected** | `script.js` |

**Problem:**  
The `catch` block at line 76–78 used `console.log()` to handle a critical error. If the API fails here, the currency dropdowns are empty and the app is completely broken, but the user sees **nothing** indicating a problem.

**script.js — Before (Lines 76–78):**
```js
} catch (err) {
    console.log("Could not populate currencies:", err);
}
```

**script.js — After (Lines 76–79):**
```js
} catch (err) {
    console.error("Could not populate currencies:", err);
    const errorEl = document.getElementById("error");
    if (errorEl) errorEl.innerHTML = "⚠ Could not load currency list. Please check your connection and refresh.";
}
```

**What changed:**
- `console.log` → `console.error` (correct severity level)
- Added a visible user-facing error message in the UI

---

### Bug #4 — No Loading State During API Fetch in `convertCurrency()`

| Field | Details |
|---|---|
| **Type** | UX Bug / Missing Feedback |
| **Severity** | Medium — User has no indication the app is working |
| **File Affected** | `script.js` |

**Problem:**  
The result field showed its previous value (or was blank) while waiting for the API response. There was no loading indicator, so users might think the app froze or click multiple times. The error was also vague with no guidance.

**script.js — Before (Lines 92–113):**
```js
error.innerHTML = "";

try {
    const cached = await getLatestRates(from);
    ...
} catch (err) {
    console.log(err);
    error.innerHTML = "Unable to retrieve exchange rate.";
}
```

**script.js — After (Lines 92–116):**
```js
error.innerHTML = "";
result.value = "Converting...";    // Added: loading state
rateText.innerHTML = "";           // Added: clear previous rate text

try {
    const cached = await getLatestRates(from);
    ...
} catch (err) {
    console.error("Conversion failed:", err);   // Fixed: correct severity
    result.value = "";                          // Added: clear loading state on error
    error.innerHTML = "⚠ Unable to retrieve exchange rate. Please check your connection.";
}
```

**What changed:**
- Added `result.value = "Converting..."` before the async call as a loading state
- Clears the loading state on error (`result.value = ""`)
- `console.log` → `console.error` (correct severity)
- Improved error message with warning icon and actionable text

---

### Bug #5 — Silent Error in `loadTracker()` Chart Load

| Field | Details |
|---|---|
| **Type** | Error Handling |
| **Severity** | Low |
| **File Affected** | `script.js` |

**Problem:**  
At line 270, a `console.log(err)` was used inside a `catch` block. While the UI already shows a message, using `console.log` for errors is incorrect — it misrepresents severity and won't be filtered properly in any logging tools.

**script.js — Before (Lines 268–271):**
```js
} catch (err) {
    console.log(err);
    note.innerHTML = "Unable to load chart data for this pair.";
```

**script.js — After (Lines 268–271):**
```js
} catch (err) {
    console.error("Tracker chart load failed:", err);
    note.innerHTML = "⚠ Unable to load chart data for this pair.";
```

**What changed:**
- `console.log` → `console.error` with a descriptive message prefix
- Added warning icon to the user-facing message for visual consistency

---

### Bug #6 — Silent Error in Auto-Poll Timer

| Field | Details |
|---|---|
| **Type** | Error Handling |
| **Severity** | Low |
| **File Affected** | `script.js` |

**Problem:**  
The background polling `setInterval` at line 399–401 catches errors with `console.log`. Since polling is a background/automatic task, using `console.warn` is more appropriate — it signals a recoverable background issue without implying a crash.

**script.js — Before (Lines 399–401):**
```js
} catch (err) {
    console.log(err);
}
```

**script.js — After (Lines 399–401):**
```js
} catch (err) {
    console.warn("Auto-poll failed:", err);
}
```

---

## 🔐 Security Observation (Noted — Not Fixed)

| Field | Details |
|---|---|
| **Type** | Security / Exposed Secret |
| **Severity** | High (in a real production context) |
| **File Affected** | `script.js` |

**Observation:**  
The ExchangeRate-API key is hardcoded directly in client-side JavaScript at **`script.js` Line 1**:

```js
const apiKey = "f28e54cd1a7b7a09e2874900";
```

Anyone can view the page source or open DevTools and steal this key. Since the repository is public on GitHub, it is also permanently searchable online.

**Why not fixed:**  
Properly securing an API key requires a **server-side proxy** (e.g., Node.js or PHP backend), which is outside the scope of this frontend-only project. This is noted as a **known architectural limitation**.

**Recommended fix (future):**  
Route API calls through a backend endpoint (e.g., `/api/rates?base=USD`) that makes the ExchangeRate-API call server-side — the key never reaches the browser.

---

## 📋 Change Summary Table

| # | Issue | File | Lines (Before) | Fixed? |
|---|---|---|---|---|
| 1 | Counter animation IDs missing — `animate()` targets non-existent elements | `index.html` | 58, 63 | ✅ Fixed |
| 2 | Wrong count value `170` (should be `165`) + broken `animate("updates", 1440)` | `home.js` | 32–33 | ✅ Fixed |
| 3 | `console.log` silently swallows API error in `populateCurrencyDropdowns` | `script.js` | 77 | ✅ Fixed |
| 4 | No loading state + poor error message in `convertCurrency` | `script.js` | 92, 111–112 | ✅ Fixed |
| 5 | `console.log` used for error in `loadTracker` chart load | `script.js` | 270 | ✅ Fixed |
| 6 | `console.log` used in background auto-poll error | `script.js` | 400 | ✅ Fixed |
| 7 | API key hardcoded and exposed in client-side JavaScript | `script.js` | 1 | ⚠ Noted only |

---

## 💬 Code Review — 3-Part Comment

---

### ✅ Positive

The original project demonstrates a **thoughtful dual-API architecture**. Using ExchangeRate-API for live rates and Frankfurter API for historical data is a smart engineering choice — Frankfurter is free and open with no key required, which offloads the rate-limited and cost-sensitive historical queries away from the paid API. On top of that, the caching system (`CACHE_TTL_MS`, `latestCache`, `historyCache`, `changeCache`) shows the authors understood performance implications and actively designed against redundant API calls. For a student project, this level of architectural thinking is commendable.

---

### 🐛 Bug / Optimization

The most critical issue found is that **the counter animation in `home.js` is completely non-functional** due to a mismatch between the element IDs used in the JavaScript and the actual HTML elements in `index.html`. The `animate()` function was called with IDs `"countries"`, `"currenciesCount"`, and `"updates"` — but none of the `<h2>` stat elements in `index.html` had any `id` attribute. The function silently exits early (`if (!el) return`) with no error thrown, making this bug invisible at runtime. Additionally, `animate("updates", 1440)` attempts to count a non-numeric stat (`"24/7"`) up to `1440`, which is semantically incorrect regardless of the ID issue. This represents a case where a feature was written in JavaScript but never connected to the HTML — likely a result of the two parts being developed separately without final integration testing.

---

### 🏁 Verdict — `REVISE` before Merge

> **Revise** — The core functionality (conversion, chart, rate table) works well and the API integration is solid. However, the dead counter animation and the pattern of using `console.log` for all error levels (including critical failures) indicate that the project was not fully tested end-to-end before submission. These are not cosmetic issues — one is a broken feature on the landing page, and the others leave users with no feedback when the app fails. The fixes are straightforward and have already been applied in this fork, but the original would need those corrections before it is considered production-ready or merge-worthy.

---

## 👥 Contributors

- **Group (Forked)** — Critique, Bug Analysis, and Fix Implementation  
- **Original Authors** — John Paul S. Pontejo, Kowein C. Lumapaz, John Vincent Losa
