// ExchangeRate API Key

const apiKey = "f28e54cd1a7b7a09e2874900";

// Convert Currency Function

async function convertCurrency(){

const amount = parseFloat(document.getElementById("amount").value);

const from = document.getElementById("from").value;

const to = document.getElementById("to").value;

const result = document.getElementById("result");

const rateText = document.getElementById("rate");

const error = document.getElementById("error");

// Clear previous error

error.innerHTML="";

try{

// GET Request to ExchangeRate API

const response = await fetch(

`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${from}`

);

if(!response.ok){

throw new Error("Unable to connect to API");

}

const data = await response.json();

if(data.result!="success"){

throw new Error("API returned an error.");

}

// Get exchange rate

const rate = data.conversion_rates[to];

// Compute answer

const answer = amount * rate;

// Display answer

result.value = answer.toFixed(2);

// Display exchange rate

rateText.innerHTML =
`1 ${from} = ${rate.toFixed(2)} ${to}`;

}catch(err){

console.log(err);

error.innerHTML="Failed to retrieve exchange rates.";

}

}

// Automatically convert when page loads

convertCurrency();