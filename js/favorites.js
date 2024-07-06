// favorites.js

document.addEventListener("DOMContentLoaded", () => {
    renderFavorites();
});

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

function renderFavorites() {
    const tableBody = document.querySelector('#favorites-table tbody');
    tableBody.innerHTML = '';
    favorites.forEach((crypto, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><img src="${crypto.image}" alt="${crypto.name}" width="20"></td>
            <td>${crypto.name}</td>
            <td>$${crypto.current_price.toFixed(2)}</td>
            <td>${crypto.total_volume.toLocaleString()}</td>
            <td>${crypto.market_cap.toLocaleString()}</td>
            <td>
                <button class="favorite-btn starred" onclick="toggleFavorite('${crypto.id}')">
                    ★
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function toggleFavorite(id) {
    const favoriteIndex = favorites.findIndex(fav => fav.id === id);
    if (favoriteIndex > -1) {
        favorites.splice(favoriteIndex, 1);
    } else {
        const crypto = cryptoData.find(c => c.id === id);
        favorites.push(crypto);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderFavorites();
}
