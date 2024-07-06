// script.js

document.addEventListener("DOMContentLoaded", () => {
    fetchCryptoData();
});

let cryptoData = [];
let filteredCryptoData = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentPage = 1;
const itemsPerPage = 15;
let totalPages = 1;
let sortDirection = ''; 

async function fetchCryptoData() {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        cryptoData = data;
        filteredCryptoData = cryptoData;
        totalPages = Math.ceil(filteredCryptoData.length / itemsPerPage);
        renderTable();
        renderPagination();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function renderTable() {
    const tableBody = document.getElementById('crypto-table-body');
    tableBody.innerHTML = '';

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = filteredCryptoData.slice(start, end);

    paginatedData.forEach((crypto, index) => {
        const isFavorite = favorites.some(fav => fav.id === crypto.id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${start + index + 1}</td>
            <td><img src="${crypto.image}" alt="${crypto.name}" width="20"></td>
            <td><a href="coin/coin.html?id=${crypto.id}" target="_blank">${crypto.name}</a></td>
            <td>$${crypto.current_price.toFixed(2)}</td>
            <td>${crypto.total_volume.toLocaleString()}</td>
            <td>${crypto.market_cap.toLocaleString()}</td>
            <td>
                <button class="favorite-btn ${isFavorite ? 'starred' : ''}" onclick="toggleFavorite('${crypto.id}')">
                    ★
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    if (paginatedData.length === 0) {
        const noDataMessage = document.createElement('tr');
        noDataMessage.innerHTML = `<td colspan="7">No cryptocurrencies found.</td>`;
        tableBody.appendChild(noDataMessage);
    }
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = i === currentPage ? 'active' : '';
        button.onclick = () => changePage(i);
        pagination.appendChild(button);
    }
}

function changePage(page) {
    currentPage = page;
    renderTable();
}

function toggleFavorite(id) {
    const crypto = cryptoData.find(c => c.id === id);
    const favoriteIndex = favorites.findIndex(fav => fav.id === id);
    if (favoriteIndex > -1) {
        favorites.splice(favoriteIndex, 1);
    } else {
        favorites.push(crypto);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderTable();
}

function sortTable(n) {
    let table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("crypto-table");
    switching = true;
    dir = sortDirection === 'asc' ? 'desc' : 'asc'; 
    sortDirection = dir; // Update global sorting direction

    // Remove arrows from all headers
    const headers = table.getElementsByTagName('th');
    Array.from(headers).forEach(header => {
        header.classList.remove('asc', 'desc');
    });

    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            if (dir == "asc") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }

    // Add arrow class to sorted header
    headers[n].classList.add(dir);
}

function searchCryptos() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    filteredCryptoData = cryptoData.filter(crypto => crypto.name.toLowerCase().includes(searchInput));
    totalPages = Math.ceil(filteredCryptoData.length / itemsPerPage);
    currentPage = 1; // Reset to the first page after a new search
    renderTable();
    renderPagination();
}
