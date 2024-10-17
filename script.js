// Google Drive API variables
const API_KEY = 'YOUR_GOOGLE_DRIVE_API_KEY';
const FOLDER_ID = 'YOUR_GOOGLE_DRIVE_FOLDER_ID';

// Load legislations from Google Drive
async function loadLegislations() {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&key=${API_KEY}`);
    const data = await response.json();

    const legislationList = document.getElementById('legislation-list');
    legislationList.innerHTML = '';

    data.files.forEach(file => {
        const legislationCard = document.createElement('div');
        legislationCard.className = 'legislation-card';
        legislationCard.innerHTML = `
            <h2>${file.name}</h2>
            <a href="https://drive.google.com/file/d/${file.id}/view" target="_blank">View Legislation</a>
        `;
        legislationList.appendChild(legislationCard);
    });
}

// Search functionality
document.getElementById('search-input').addEventListener('input', (event) => {
    const query = event.target.value.toLowerCase();
    const cards = document.querySelectorAll('.legislation-card');

    cards.forEach(card => {
        const title = card.querySelector('h2').textContent.toLowerCase();
        card.style.display = title.includes(query) ? 'block' : 'none';
    });
});

// Initial load
loadLegislations();
