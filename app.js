
// Create a Map for inflation
const currencyNewsURLMap = new Map([
    ["USD", "https://tradingeconomics.com/united-states/inflation-cpi"],
    ["GBP", "https://tradingeconomics.com/united-kingdom/inflation-cpi"],
    ["CAD", "https://tradingeconomics.com/canada/inflation-cpi"],
    ["AUD", "https://tradingeconomics.com/australia/inflation-cpi"],
    ["JPY", "https://tradingeconomics.com/japan/inflation-cpi"],
    ["CNY", "https://tradingeconomics.com/china/inflation-cpi"],
    ["HKD", "https://tradingeconomics.com/hong-kong/inflation-cpi"]
]);

const currencyCPIVsInterestrateURLMap = new Map([
    ["USD", "https://d3fy651gv2fhd3.cloudfront.net/embed/?s=cpi+yoy&v=202303141300V20220312&title=false&url2=/united-states/interest-rate&h=300&w=600"],
    ["GBP", "https://d3fy651gv2fhd3.cloudfront.net/embed/?s=ukrpcjyr&v=202303220735V20220312&title=false&url2=/united-kingdom/interest-rate&h=300&w=600"],
    ["CAD", "https://d3fy651gv2fhd3.cloudfront.net/embed/?s=cacpiyoy&v=202303211408V20220312&title=false&url2=/canada/interest-rate&h=300&w=600"],
    ["AUD", "https://d3fy651gv2fhd3.cloudfront.net/embed/?s=aucpiyoy&v=202301251615V20220312&title=false&url2=/australia/interest-rate&h=300&w=600"],
    ["JPY", "https://d3fy651gv2fhd3.cloudfront.net/embed/?s=jncpiyoy&v=202303240124V20220312&title=false&url2=/japan/interest-rate&h=300&w=600"],
    ["CNY", "https://d3fy651gv2fhd3.cloudfront.net/embed/?s=cncpiyoy&v=202303091745V20220312&title=false&url2=/china/interest-rate&h=300&w=600"],
    ["HKD", "https://d3fy651gv2fhd3.cloudfront.net/embed/?s=hkcpiy&v=202303230850V20220312&title=false&url2=/hong-kong/interest-rate&h=300&w=600"]
]);

window.addEventListener('load', ()=>{
    // Get the current year and format it as a string in YYYY format
    const currentYear = new Date().getFullYear();
    const formattedYear = currentYear.toString().padStart(4, '0');

    // Set the default start-date to January 1st of the current year
    document.getElementById('start-date').value = `${formattedYear}-01-01`;

    // Create a new Date object with the current date in the local timezone
    const currentDate = new Date();

    // Subtract one day (in milliseconds) to get yesterday's date
    const yesterdayDate = new Date(currentDate.getTime() - (2 * 24 * 60 * 60 * 1000));

    // Get the year, month, and day components of the date
    const year = yesterdayDate.getFullYear();
    const month = (yesterdayDate.getMonth() + 1).toString().padStart(2, '0');
    const day = yesterdayDate.getDate().toString().padStart(2, '0');

    // Format the date as a string in the "YYYY-MM-DD" format
    document.getElementById('end-date').value = `${year}-${month}-${day}`;
});

const swapButton = document.getElementById('swap-button');
swapButton.addEventListener('click', () => {
    const ccy1 = document.getElementById('ccy1');
    const ccy2 = document.getElementById('ccy2');

    const baseCcy = ccy1.value;
    const symbolsList = ccy2.value;

    // Swap the values of the base currency and symbols list
    ccy1.value = symbolsList;
    ccy2.value = baseCcy;
});

let chart = null;
let ctx = null;

let ccy1URLEl = document.getElementById('news-ccy1');

const ccy2URLEl = document.getElementById('news-ccy2');

const errorMessageEl = document.getElementById('error-message');

const viewChartButton = document.getElementById('viewChart-button');
viewChartButton.addEventListener('click', () => {
    // Get the exchange rate data from api
    const myApiKey = "cr030qumtYKmSTGtt0bftxp0C63CRPwlaqK69If7";
    const header = new Headers();
    header.append("apikey", myApiKey);

    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    const ccy1Input = document.getElementById('ccy1');
    const ccy2Input = document.getElementById('ccy2');

    const ccy1 = ccy1Input.value;
    const ccy2 = ccy2Input.value;

    //console.log("start date:", startDate);
    //console.log("end date:", endDate);
    //console.log("Ccy1:", ccy1);
    //console.log("Ccy2:", ccy2);

    // Call currency API
    const fxAPIUrl = `https://api.freecurrencyapi.com/v1/historical?currencies=${ccy2}&base_currency=${ccy1}&date_from=${startDate}T20%3A00%3A00.000Z&date_to=${endDate}T20%3A00%3A00.000Z`;    
    //console.log(fxAPIUrl);

    // display the loading message when the viewChart Button is clicked to notify user
    displayLoadingMessage();

    // hide the errorMessageElement by default
    hideErrorMessage();

    // clear the context and chart before display the graph
    clearCanvas();

    // fetch exchange rate from API
    fetch(fxAPIUrl, {
        method : "GET",
        headers : header
    })
        .then(response => {
            return response.json();
        })
        .then(fxData => {
            const data = {
                labels: [], // An empty array for now
                datasets: [
                    {
                        label: `${ccy1} to ${ccy2}`,
                        data: [],
                        // point
                        pointBackgroundColor: 'green',
                        pointHoverBackgroundColor: 'blue',
                        // line
                        backgroundColor: '#5d8fcf',
                        borderColor: '#5d8fcf',
                        // area under the line
                        fill: false,
                    }
                ]
            };

            const options = {
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: 'black'
                        }
                    }
                },
                scales: {
                    x: {
                        title:{
                            display: false,
                            text: 'Date',
                            color: 'black'
                        },
                        ticks:{
                            //color: 'black',
                            autoSkip: true,
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        title:{
                            display: false,
                            text: 'Exchange rate',
                            color: 'black'
                        },
                        ticks:{
                            color: 'black'
                        }
                    }
                }
            }


            chart = new Chart(ctx, {
                type: 'line',
                data: data,
                options: options
            });

            //console.log(fxData);
            // Exception handling from API server, handle by the catch block below
            if(fxData.message !== undefined) {
                let errorMsg = "";
                if(!fxData.message.includes("Validation error")) {
                    errorMsg = fxData.message;
                }
                console.log(fxData);
                if(fxData.errors !== undefined) {
                    if(fxData.errors.date_to !== undefined && fxData.errors.date_to[0] !== undefined) {
                        errorMsg += fxData.errors.date_to[0].replace("date from", " Start Date").replace("date to", " End Date") + " ";
                    }
                    if(fxData.errors.date_from !== undefined && fxData.errors.date_from[0] !== undefined) {
                        errorMsg += fxData.errors.date_from[0].replace("date from", " Start Date").replace("date to", " End Date") + " ";
                    }
                }
                throw new Error(errorMsg);
            }

            for (let date in fxData.data) {
                // console.log("date:", date);
                // console.log("fxData.data[date]:", fxData.data[date]);
                // console.log("ccy2:",ccy2)
                // console.log("fxData.data[date][ccy2]:", fxData.sy[date][ccy2]);
                //data.labels.push(date.slice(-5)); // only push MM-DD into the labels and data, drop YYYY from the beginning
                data.labels.push(formatDate(date));
                data.datasets[0].data.push({
                    //x: date.slice(-5),
                    x: formatDate(date),
                    y: fxData.data[date][ccy2]
                });
            }

            displayCcyURL(ccy1, ccy2);
            setCompareURLCcy1(ccy1, ccy2);
            displayCompareDiv(ccy1, ccy2);
            chart.update(); // update the chart
            hideErrorMessage(); // hide the errorMessageElement
        })
        .catch(error => {
            //console.error("error !!!", error);
            displayErrorMessage(error);
            // clear the context and chart
            clearCanvas();
            hideCcy1URL();
            hideCcy2URL();
        })
        .finally(() => {
            // hide the loading message
            hideLoadingMessage();
        });
});

// Convert Date format from YYYY-MM-DD to mmm-DD
function formatDate(inputDate) {
    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
        "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const parts = inputDate.split("-");
    const monthIndex = parseInt(parts[1]) - 1;
    const monthName = monthNames[monthIndex];
    const day = parts[2].substr(0, 2);
    return `${monthName}-${day}`;
}

function clearCanvas() {
    // clear the context and chat
    ctx = document.getElementById('myChart').getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clear the canvas
    if (chart) {
        chart.destroy();
    }
}

function displayLoadingMessage() {
    // display the loading message
    const loadingEl = document.getElementById('loading');
    loadingEl.style.display = 'block';
}

function hideLoadingMessage() {
    // display the loading message
    const loadingEl = document.getElementById('loading');
    loadingEl.style.display = 'none';
}

function hideErrorMessage() {
    errorMessageEl.style.display = 'none';
}

function displayErrorMessage(error) {
    errorMessageEl.textContent = error;
    errorMessageEl.style.display = 'block';
}

function displayCcyURL(ccy1,ccy2) {
    //console.log("ccy1 for map:", ccy1);
    const ccy1URL = currencyNewsURLMap.get(ccy1);
    //console.log("url for ccy1:", ccy1URL);
    ccy1URLEl.innerHTML = "News related to\: " + ccy1 + ":<br/>  <a href=" + ccy1URL + " target=\"_blank\"\>" + ccy1URL + "</a>";
    displayCcy1URL();

    if(ccy1 !== ccy2) {
        //console.log("ccy2 for map:", ccy2);
        const ccy2URL = currencyNewsURLMap.get(ccy2);
        //console.log("url for ccy2:", ccy2URL);
        ccy2URLEl.innerHTML = "News related to\: " + ccy2 + ":<br/>  <a href=" + ccy2URL + " target=\"_blank\"\>" + ccy2URL + "</a>";
        displayCcy2URL();
    } else {
        hideCcy2URL();
    }
}

function displayCompareDiv(ccy1, ccy2) {
    const compareDiv1 = document.getElementById("compare-ccy1-div");
    compareDiv1.style.display = 'block';

    const compareDiv2 = document.getElementById("compare-ccy2-div");
    if(ccy1 !== ccy2) {
        compareDiv2.style.display = 'block';
    } else {
        compareDiv2.style.display = 'none';
    }
}

function displayCcy1URL() {
    ccy1URLEl.style.display = 'block';
}

function displayCcy2URL() {
    ccy2URLEl.style.display = 'block';
}
function hideCcy1URL() {
    ccy1URLEl.style.display = 'none';
}

function hideCcy2URL() {
    ccy2URLEl.style.display = 'none';
}

function setCompareURLCcy1(ccy1,ccy2) {
    const compareCcy1Frame = document.getElementById("compare-ccy1");
    compareCcy1Frame.src = currencyCPIVsInterestrateURLMap.get(ccy1);
    const compareCcy2Frame = document.getElementById("compare-ccy2");
    compareCcy2Frame.src = currencyCPIVsInterestrateURLMap.get(ccy2);
}

function toggleCompDivCcy1() {
    const checkbox = document.getElementById("compare-ccy1-checkbox");
    const compareCcyFrame = document.getElementById("compare-ccy1");

    if (checkbox.checked) {
        compareCcyFrame.style.display = "block";
    } else {
        compareCcyFrame.style.display = "none";
    }
}

function toggleCompDivCcy2() {
    const checkbox = document.getElementById("compare-ccy2-checkbox");
    const compareCcyFrame = document.getElementById("compare-ccy2");

    if (checkbox.checked) {
        compareCcyFrame.style.display = "block";
    } else {
        compareCcyFrame.style.display = "none";
    }
}