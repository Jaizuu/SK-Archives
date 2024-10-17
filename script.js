// Google Drive API variables
const API_KEY = 'AIzaSyCwN6epkbxf69AvPD-SdPFrB0MONjFAI1Q';
const FOLDER_ID = '1D-gIDGeHx2frRjH7j5wIScQDTJWzeW7e';

// Store legislations to facilitate filtering
let legislations = [];

// Load legislations from Google Drive
async function loadLegislations() {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&key=${API_KEY}`);
    const data = await response.json();

    const legislationList = document.getElementById('legislation-list');
    legislationList.innerHTML = '';

    // Clear existing years
    const yearFilter = document.getElementById('year-filter');
    yearFilter.innerHTML = '<option value="">Select Year</option>';

    data.files.forEach(file => {
        // Assume the year is part of the file name (you can adjust this based on your actual file naming convention)
        const fileYear = new Date(file.createdTime).getFullYear();
        const fileCategory = categorizeFile(file.name); // Function to categorize based on file name or other logic
        
        // Store legislation information
        legislations.push({ id: file.id, name: file.name, year: fileYear, category: fileCategory });

        // Add unique years to the year filter
        if (![...yearFilter.options].some(option => option.value == fileYear)) {
            const yearOption = document.createElement('option');
            yearOption.value = fileYear;
            yearOption.textContent = fileYear;
            yearFilter.appendChild(yearOption);
        }

        // Create a legislation card
        const legislationCard = document.createElement('div');
        legislationCard.className = 'legislation-card';
        legislationCard.innerHTML = `
            <h2>${file.name}</h2>
            <p>Year: ${fileYear}</p>
            <p>Category: ${fileCategory}</p>
            <a href="https://drive.google.com/file/d/${file.id}/view" target="_blank">View Legislation</a>
        `;
        legislationList.appendChild(legislationCard);
    });
}

// Categorize file based on its name
function categorizeFile(fileName) {
    if (fileName.includes('Resolution')) return 'Resolution';
    if (fileName.includes('Ordinance')) return 'Ordinance';
    if (fileName.includes('Appropriation Ordinance')) return 'Appropriation Ordinance';
    return 'Other'; // Default category if none matches
}

// Filter functionalities
function applyFilters() {
    const year = document.getElementById('year-filter').value;
    const category = document.getElementById('category-filter').value;

    const cards = document.querySelectorAll('.legislation-card');
    cards.forEach(card => {
        const title = card.querySelector('h2').textContent.toLowerCase();
        const yearMatch = year ? card.querySelector('p').textContent.includes(year) : true;
        const categoryMatch = category ? card.querySelector('p:nth-child(2)').textContent.includes(category) : true;
        
        card.style.display = yearMatch && categoryMatch ? 'block' : 'none';
    });
}

// Event listeners for filters
document.getElementById('year-filter').addEventListener('change', applyFilters);
document.getElementById('category-filter').addEventListener('change', applyFilters);

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