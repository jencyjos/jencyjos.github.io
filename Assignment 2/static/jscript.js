// Function to initialize the page (hide tabs and clear error message)
function initializePage() {
    document.getElementById('page-container-2').classList.add('inactive');
    document.getElementById('page-container-2').classList.remove('active');
    clearAndHideTabs();
    document.getElementById('not-found-error').textContent = '';
}

// Call initializePage when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializePage);

// Function to activate #page-container-2
function activatePageContainer2() {
    document.getElementById('page-container-2').classList.remove('inactive');
    document.getElementById('page-container-2').classList.add('active');
    activateTabs(); // Assuming you want to activate the tabs at the same time
}

// Function to initially disable tab buttons
function clearAndHideTabs() {
    var tabcontents = document.getElementsByClassName("tabcontent");
    for (var i = 0; i < tabcontents.length; i++) {
        tabcontents[i].innerHTML = ''; // Clear the content
        tabcontents[i].style.display = 'none'; // Hide the tab content
    }
    var tablinks = document.getElementsByClassName("tablinks");
    for (var j = 0; j < tablinks.length; j++) {
        tablinks[j].classList.add('disabled'); // Disable the tab buttons
    }
}

document.getElementById('clear-button').addEventListener('click', function() {
    document.getElementById('stock-symbol-input').value = ''; // Clear the input field
    document.getElementById('not-found-error').innerHTML = ''; // Clear any error messages

    // Add the functionality to make #page-container-2 inactive again
    document.getElementById('page-container-2').classList.add('inactive');
    document.getElementById('page-container-2').classList.remove('active');

    // Optionally, you can also clear the content of the tabs or reset their state
    clearAndHideTabs();
});

// Function to activate tab buttons
function activateTabs() {
    var tablinks = document.getElementsByClassName("tablinks");
    for (var i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove('disabled'); // Activate the tab buttons
    }
}

// if company not found error message - MODIFY AND USE
function displayError(message) {
    var resultsDiv = document.getElementById('not-found-error');
    resultsDiv.innerHTML = `<div class="error-message">${message}</div>`;
}


// ---------------------------- SEARCH BUTTON -------------------------------------------

document.getElementById('search-button').addEventListener('click', async function(event) {
    event.preventDefault(); // Prevent the form from submitting via HTTP GET
    let stockSymbol = document.getElementById('stock-symbol-input').value.trim();
    // if (stockSymbol === '') {
    //     alert('Please fill out this field.');
    // } else {
    if(stockSymbol != '')
    {
        try {
            // Perform both fetch calls concurrently
            await Promise.all([
                fetchAndDisplayCompanyData(stockSymbol),
                fetchAndDisplayStockSummary(stockSymbol),
                fetchAndDisplayStockSummaryRecommendation(stockSymbol),
                fetchAndDisplayHighCharts(stockSymbol),
                fetchAndDisplayLatestNews(stockSymbol)
                // You can add additional fetch calls here for other APIs
            ]);
            activatePageContainer2(); // Activate the container only if all fetch calls are successful
            activateCompanyTab(); // Activate the "Company" tab by default
            
        } catch (error) {
            displayError(error.message); // Handle any errors from the fetch calls
        }
    }
});

// ---------------------------------- OPEN TAB -------------------------------------------

function openTab(evt, tabName) {
    // Hide all tab content by default
    var tabcontent = document.getElementsByClassName("tabcontent");
    for (var i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Remove the "active" class from all tabs
    var tablinks = document.getElementsByClassName("tablinks");
    for (var i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    // Show the content for the clicked tab and add "active" class
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");
}


// ---------------------------------- COMPANY DATA-------------------------------------------

// Simulate clicking the "Company" tab after successful data fetch
function activateCompanyTab() {
    document.querySelector('.tablinks:not(.disabled)').click(); // Click the first non-disabled tab, typically "Company"
}

// Async function to fetch and display company data
async function fetchAndDisplayCompanyData(symbol) {
    const response = await fetch(`/company?symbol=${encodeURIComponent(symbol)}`);
    const data = await response.json();
    if (Object.keys(data).length === 0) {
        throw new Error('Error: No record has been found, please enter a valid symbol'); // Use throw to jump to catch block
    } else {
        document.getElementById('not-found-error').textContent = '';
        displayCompanyData(data);
    }
}

function displayCompanyData(data) {
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
}



// --------------------------------------STOCK SUMMARY -------------------------------------------

// Async function to fetch and display stock summary data
async function fetchAndDisplayStockSummary(symbol) {
    const response = await fetch(`/stock_summary?symbol=${encodeURIComponent(symbol)}`);
    const data = await response.json();
    if (Object.keys(data).length === 0) {
        throw new Error('Error: No record has been found, please enter a valid symbol'); // Use throw to jump to catch block
    } else {
        document.getElementById('not-found-error').textContent = '';
        displayStockSummaryData(symbol,data);
    }
}

function displayStockSummaryData(symbol,data) {
    let stockSummaryContent = document.getElementById('StockSummary');
    let month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    let myDate = new Date(data.t * 1000); // If your epoch time is in seconds, multiply by 1000
    let dateStr = myDate.getUTCDate() + " " + month[(myDate.getUTCMonth())] + "," + myDate.getUTCFullYear();
    let arrow = ''
    if (data.d < 0){
        arrow_change = '../static/images/RedArrowDown.png'
    }else{
        arrow_change = '../static/images/GreenArrowUp.png'
    }

    if (data.dp < 0){
        arrow_percent = '../static/images/RedArrowDown.png'
    }else{
        arrow_percent = '../static/images/GreenArrowUp.png'
    }


    stockSummaryContent.innerHTML = `
    <table>
        <tr><td>Stock Ticker Symbol</td><td>${symbol}</td></tr>
        <tr><td>Trading Day</td><td>${dateStr}</td></tr>
        <tr><td>Previous Closing Price</td><td>${data.pc}</td></tr>
        <tr><td>Opening Price</td><td>${data.o}</td></tr>
        <tr><td>High Price</td><td>${data.h}</td></tr>
        <tr><td>Low Price</td><td>${data.l}</td></tr>
        <tr><td>Change</td><td>${data.d} <img src=${arrow_change} style="width:10px;height:10px"></td></tr>
        <tr><td>Change Percent</td><td>${data.dp}<img src=${arrow_percent} style="width:10px;height:10px"></td></tr>
    </table>
    `;
}



// ------------------------STOCK SUMMARY RECOMMENDATION-------------------------------------------

async function fetchAndDisplayStockSummaryRecommendation(symbol) {
    const response = await fetch(`/stock_summary/recommendation?symbol=${encodeURIComponent(symbol)}`);
    const data = await response.json();
    console.log(data)
    if (Object.keys(data).length === 0) {
        throw new Error('Error: No record has been found, please enter a valid symbol'); // Use throw to jump to catch block
    } else {
        document.getElementById('not-found-error').textContent = '';
        displayStockSummaryRecommendationData(data);
    }
}

function displayStockSummaryRecommendationData(data) {
    // Assuming that the latest recommendation is the first element of the array
    const recommendationsdiv = document.getElementById("StockSummary");
  data.sort((a, b) => new Date(b.period) - new Date(a.period));
  const latestRecommendation = data[0];

  //Create HTML for Indicator
  function createIndicator(value, label, color) {
    return `
      <div class="indicator" style="background-color: ${color};">
        <span class="value">${value}</span>
      </div>
    `;
  }

  // Assigning Colors
  const colors = {
    strongSell: "#ff4d4d",
    sell: "#ff9999",
    hold: "#99cc99",
    buy: "#66cc66",
    strongBuy: "#4dff4d",
  };

  // Container for the indicators
  const indicatorsContainer = document.createElement("div");
  indicatorsContainer.classList.add("indicators-container");

  // Create and append the "Strong Sell" label to the left
  const strongSellLabel = document.createElement("span");
  strongSellLabel.innerHTML = `Strong<br>Sell`;
  strongSellLabel.style.color = "#ff4d4d";
  strongSellLabel.style.marginRight = "10px"; // Adjust spacing as needed
  indicatorsContainer.appendChild(strongSellLabel);

  // Append each indicator to the container
  indicatorsContainer.innerHTML += createIndicator(
    latestRecommendation.strongSell,
    "",
    colors.strongSell
  );
  indicatorsContainer.innerHTML += createIndicator(
    latestRecommendation.sell,
    "",
    colors.sell
  );
  indicatorsContainer.innerHTML += createIndicator(
    latestRecommendation.hold,
    "",
    colors.hold
  );
  indicatorsContainer.innerHTML += createIndicator(
    latestRecommendation.buy,
    "",
    colors.buy
  );
  indicatorsContainer.innerHTML += createIndicator(
    latestRecommendation.strongBuy,
    "",
    colors.strongBuy
  );

  // Create and append the "Strong Buy" label to the right
  const strongBuyLabel = document.createElement("span");
  strongBuyLabel.innerHTML = `Strong<br>Buy`;
  strongBuyLabel.style.color = "#4dff4d";
  strongBuyLabel.style.marginLeft = "10px"; // Adjust spacing as needed
  indicatorsContainer.appendChild(strongBuyLabel);

  // Assuming you have a div with id="recommendationTrendsContainer" in your HTML
  document.getElementById("StockSummary").appendChild(indicatorsContainer);
}





// -----------------------------------------HIGH CHARTS-------------------------------------------

async function fetchAndDisplayHighCharts(symbol) {
    const response = await fetch(`/historydata?symbol=${encodeURIComponent(symbol)}`);
    const jsonData = await response.json();

    // const response = await fetch(`/history_data?symbol=${encodeURIComponent(symbol)}`);
    // const data = await response.json();
    // if (Object.keys(data).length === 0) {
    //     throw new Error('Error: No record has been found, please enter a valid symbol'); // Use throw to jump to catch block
    // } else {
    //     document.getElementById('not-found-error').textContent = '';
    //     displayHighCharts(data);
    // }
    if (jsonData.results && jsonData.results.length > 0) {
        // Extract the price and volume data
        const priceData = jsonData.results.map(point => [point.t, point.c]);
        const volumeData = jsonData.results.map(point => [point.t, point.v]);

        // Render the HighCharts stock chart
        Highcharts.stockChart('Charts', {
            chart: {
                alignTicks: false // This allows each y-axis to operate independently
            },
        
            rangeSelector: {
                buttons: [{
                    type: 'day',
                    count: 7,
                    text: '7d'
                }, {
                    type: 'day',
                    count: 15,
                    text: '15d'
                }, {
                    type: 'month',
                    count: 1,
                    text: '1m'
                }, {
                    type: 'month',
                    count: 3,
                    text: '3m'
                }, {
                    type: 'month',
                    count: 6,
                    text: '6m'
                }],
                selected: 4, // This will select the '6m' range by default
                inputEnabled: false // Disables the input text boxes
            },
        
            title: {
                text: `Stock Price ${symbol} ${new Date().toISOString().split('T')[0]}`
            },
        
            subtitle: {
                text: 'Source: Polygon.io',
                href: 'https://polygon.io/'
            },
        
            yAxis: [
                {
                  // This will be the primary (left) y-axis for the stock price
                  labels: {
                    align: "right",
                    x: -3,
                  },
                  title: {
                    text: "Stock Price",
                  },
                  startOnTick: false,
                  endOnTick: false,
                  // height: '60%',
                  lineWidth: 2,
                  resize: {
                    enabled: true,
                  },
                  opposite: false,
                },
                {
                  // This will be the secondary (right) y-axis for the volume
                  tickPixelInterval: 10,
                  labels: {
                    align: "right",
                    x: -3,
                  },
                  title: {
                    text: "Volume",
                  },
                  startOnTick: false,
                  endOnTick: false,
                  // height: '55%',
                  offset: 0,
                  lineWidth: 2,
                },
              ],
              tooltip: {
                split: true,
              },
        
            series: [{
                type: 'area',
                name: 'Stock Price',
                data: priceData,
                yAxis: 0,
                tooltip: {
                    valueDecimals: 2
                },
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                }
            }, {
                type: 'column',
                name: 'Volume',
                data: volumeData,
                yAxis: 1,
                tooltip: {
                    valueDecimals: 0
                }
            }]
        });
    } else {
        // document.getElementById('not-found-error').textContent = 'Error: No record has been found, please enter a valid symbol';
        throw new Error('Error: No record has been found, please enter a valid symbol');
    }
}


// -----------------------------LATEST NEWS-------------------------------------------

async function fetchAndDisplayLatestNews(symbol) {
    const response = await fetch(`/latest_news?symbol=${encodeURIComponent(symbol)}`);
    const data = await response.json();
    if (Object.keys(data).length === 0) {
        throw new Error('Error:No record has been found, please enter a valid symbol'); // Use throw to jump to catch block
    } else {
        document.getElementById('not-found-error').textContent = '';
        displayLatestNews(data);
    }
}

function displayLatestNews(data) {
    let latestNewsContent = document.getElementById('LatestNews');
    let month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    let count = 0;

    for (let i = data.length-1; i >0; i--) {
        if (count < 5 && data[i].image != ''){ 
            let myDate = new Date(data[i].datetime * 1000); // If your epoch time is in seconds, multiply by 1000
            let dateStr = myDate.getUTCDate() + " " + month[(myDate.getUTCMonth())] + "," + myDate.getUTCFullYear();
            latestNewsContent.innerHTML += `
            <div class="flex-container" style="display:flex;flex-direction: row">
                <div class="flex-item1">
                    <img src="${data[i].image}" style="width:100px;height:100px">
                </div>
                <div class="flex-item2">
                    <p style="font-weight:bold">${data[i].headline}</p>
                    <p>${dateStr}</p>
                    <a href="${data[i].url}">See Original Post</a>
                </div>
            </div>
            `;
            count++; //
        }

      }
    
}
