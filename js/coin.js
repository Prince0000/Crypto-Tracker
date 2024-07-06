document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const apiKey = 'c2a1c89da5mshfa5cfed69c9958ap130fc0jsn9093a5ff71fe'; // Replace with your CoinGecko API key
    const coinId = urlParams.get('id');
    const apiUrl = `https://api.coingecko.com/api/v3/coins/${coinId}`;
    let chart;

    // Function to fetch current data and update HTML
    function fetchCurrentData() {
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                // Extract relevant data from the API response
                const mark_cap_rank = data.market_cap_rank;
                const desc = data.description.en;
                const name = data.name;
                const price = data.market_data.current_price.usd;
                const marketCap = data.market_data.market_cap.usd;
                const image = data.image.large;

                // Update HTML with fetched data
                document.getElementById('mark-cap-rank').innerHTML = mark_cap_rank;
                document.querySelector('.coinname').textContent = name;
                document.getElementById('desc').innerHTML = desc;
                document.getElementById('image').setAttribute('src', image);
                document.getElementById('price').textContent = `Price: $${price.toFixed(2)}`;
                document.getElementById('market-cap').textContent = `Market Cap: $${marketCap.toLocaleString()}`;

                // Hide skeleton and show content
                document.getElementById('crypto-skeleton').style.display = 'none';
                document.getElementById('crypto-info').style.display = 'flex';
            })
            .catch(error => {
                console.error('Error fetching current data:', error);
            });
    }

    // Function to fetch historical data and update chart
    function fetchHistoricalDataAndUpdateChart(days) {
        const historicalApiUrl = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
        fetch(historicalApiUrl)
            .then(response => response.json())
            .then(data => {
                const prices = data.prices;

                const labels = prices.map(price => {
                    const date = new Date(price[0]);
                    return date.toLocaleDateString(); // Display full date
                });

                const priceData = prices.map(price => price[1]);

                if (chart) {
                    chart.data.labels = labels;
                    chart.data.datasets[0].data = priceData;
                    chart.update();
                } else {
                    // Create Chart.js chart
                    const ctx = document.getElementById('myChart').getContext('2d');
                    const chartConfig = {
                        type: 'line',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: `${coinId.toUpperCase()} Price`,
                                data: priceData,
                                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                borderColor: 'rgba(54, 162, 235, 1)',
                                borderWidth: 1,
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                xAxes: [{
                                    type: 'time',
                                    time: {
                                        unit: 'day', // Adjust as needed
                                        displayFormats: {
                                            day: 'MMM D' // Format: Month Abbreviation, Day (e.g., Jan 1)
                                        }
                                    },
                                    ticks: {
                                        maxTicksLimit: labels.length,
                                        autoSkip: false
                                    }
                                }],
                                yAxes: [{
                                    ticks: {
                                        beginAtZero: false,
                                        callback: function(value) { return '$' + value.toLocaleString(); }
                                    }
                                }]
                            }
                        }
                    };

                    chart = new Chart(ctx, chartConfig);
                }

                // Hide skeleton and show content
                document.getElementById('chart-skeleton').style.display = 'none';
                document.getElementById('price-chart').style.display = 'block';
            })
            .catch(error => {
                console.error('Error fetching historical data:', error);
            });
    }

    // Initial fetch and setup
    fetchCurrentData();
    fetchHistoricalDataAndUpdateChart(1); // Default to 24 hours chart

    // Set up periodic current data update (e.g., every 60 seconds)
    setInterval(fetchCurrentData, 60000);

    // Event listeners for buttons
    document.querySelectorAll('button[data-period]').forEach(button => {
        button.addEventListener('click', function() {
            const period = this.getAttribute('data-period');
            fetchHistoricalDataAndUpdateChart(period);

            // Update active button style
            document.querySelectorAll('button[data-period]').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
});
