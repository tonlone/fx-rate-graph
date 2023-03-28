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
    const baseCcyInput = document.getElementById('base-ccy');
    const symbolsListInput = document.getElementById('symbols-list');

    const baseCcy = baseCcyInput.value;
    const symbolsList = symbolsListInput.value;

    // Swap the values of the base currency and symbols list
    baseCcyInput.value = symbolsList;
    symbolsListInput.value = baseCcy;
});

let chart = null;
let ctx = null;
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

    const baseCcyInput = document.getElementById('base-ccy');
    const symbolsListInput = document.getElementById('symbols-list');

    const baseCcy = baseCcyInput.value;
    const symbolsList = symbolsListInput.value;

    console.log("start date:", startDate);
    console.log("end date:", endDate);
    console.log("Ccy1:", baseCcy);
    console.log("Ccy2:", symbolsList);

    // Call currency API
    const fxAPIUrl = `https://api.freecurrencyapi.com/v1/historical?currencies=${symbolsList}&base_currency=${baseCcy}&date_from=${startDate}T20%3A00%3A00.000Z&date_to=${endDate}T20%3A00%3A00.000Z`;
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
                        label: `${baseCcy} to ${symbolsList}`,
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
                // console.log("symbolsList:",symbolsList)
                // console.log("fxData.data[date][symbolsList]:", fxData.data[date][symbolsList]);
                //data.labels.push(date.slice(-5)); // only push MM-DD into the labels and data, drop YYYY from the beginning
                data.labels.push(formatDate(date));
                data.datasets[0].data.push({
                    //x: date.slice(-5),
                    x: formatDate(date),
                    y: fxData.data[date][symbolsList]
                });
            }

            chart.update(); // update the chart
            hideErrorMessage(); // hide the errorMessageElement
        })
        .catch(error => {
            //console.error("error !!!", error);
            displayErrorMessage(error);
            // clear the context and chart
            clearCanvas();
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