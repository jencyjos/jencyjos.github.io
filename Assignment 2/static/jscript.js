document.getElementById('search-button').addEventListener('click', function() {
    var stockSymbol = document.getElementById('stock-symbol').value.trim();
    if (stockSymbol === '') {
        alert('Please fill out this field.');
    } else {
        // Make a GET request to your Flask server
        window.location.href = `/search?symbol=${encodeURIComponent(stockSymbol)}`;
    }
});

document.getElementById('clear-button').addEventListener('click', function() {
    document.getElementById('stock-symbol').value = '';
    document.getElementById('results').innerHTML = '';
});

// This function could be called after the API response is received
function displayError(message) {
    var resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `<div class="error-message">${message}</div>`;
}

// You would call this function if the API response indicates no data was found
displayError('Error: No record has been found, please enter a valid symbol'); // Function to fetch and display company data
function fetchAndDisplayCompanyData(symbol) {
    fetch(`/company?symbol=${encodeURIComponent(symbol)}`)
        .then(response => response.json())
        .then(data => {
            // Assuming 'company' is the id of the div where you want to display the company data
            let companyContent = document.getElementById('Company');
            companyContent.innerHTML = `
            <img src="${data.logo}" alt="${data.name} Logo" style="width: 100px; height: auto;">
            <table>
                <tr><td>Company Name</td><td>${data.name}</td></tr>
                <tr><td>Stock Ticker Symbol</td><td>${data.ticker}</td></tr>
                <tr><td>Stock Exchange Code</td><td>${data.exchange}</td></tr>
                <tr><td>Company Start Date</td><td>${data.ipo}</td></tr>
                <tr><td>Category</td><td>${data.finnhubIndustry}</td></tr>
            </table>
        `;
        })
        .catch(error => {
            console.error('Error fetching company data:', error);
        });
}

// Add event listener to the search button
document.getElementById('search-button').addEventListener('click', function() {
    var stockSymbol = document.getElementById('stock-symbol').value.trim();
    if (stockSymbol === '') {
        alert('Please fill out this field.');
    } else {
        // Call the function to fetch and display company data
        fetchAndDisplayCompanyData(stockSymbol);
    }
});

// Function to open a tab and fetch data if necessary
function openTab(evt, tabName) {
    // Same tab opening code as provided earlier
    // ...

    // After opening the Company tab, fetch and display the data
    if (tabName === 'Company') {
        let stockSymbol = document.getElementById('stock-symbol').value.trim();
        if (stockSymbol) {
            fetchAndDisplayCompanyData(stockSymbol);
        }
    }
}

// Call this function to open the default tab on page load
openTab(null, 'Company');