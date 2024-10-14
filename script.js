// Sample hardcoded admin credentials
const adminCredentials = {
    username: "admin",
    password: "password123"
};

let isAdmin = false; // Track admin login status

// Show sign-in form
function showSignIn() {
    document.getElementById('signInSection').style.display = 'block';
}

// Admin sign-in simulation
function signInAdmin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === adminCredentials.username && password === adminCredentials.password) {
        document.getElementById('signInError').style.display = 'none';
        isAdmin = true; // Set admin login status
        document.getElementById('signInSection').style.display = 'none';
        document.getElementById('addLegislationSection').style.display = 'block';
        document.getElementById('adminSignInButton').style.display = 'none';
        document.getElementById('adminSignOutButton').style.display = 'block'; // Show sign-out button
        loadLegislations(); // Load legislations after signing in
    } else {
        document.getElementById('signInError').style.display = 'block';
    }

    return false; // Prevent form submission
}

// Sign out admin
function signOutAdmin() {
    isAdmin = false; // Reset admin login status
    document.getElementById('adminSignOutButton').style.display = 'none';
    document.getElementById('adminSignInButton').style.display = 'block';
    document.getElementById('addLegislationSection').style.display = 'none';
    loadLegislations(); // Reload legislations to hide delete buttons
}

// Load legislations from JSON file
function loadLegislations() {
    const legislationList = document.getElementById('legislationList');
    const filterYear = document.getElementById('filterYear');
    const filterCategory = document.getElementById('filterCategory');

    legislationList.innerHTML = ''; // Clear current list

    // Fetch legislations from a JSON file (assume it's hosted on the same domain)
    fetch('legislations.json')
        .then(response => response.json())
        .then(legislations => {
            // Populate filter options
            populateFilters(legislations);

            // Sort legislations by year (latest first)
            legislations.sort((a, b) => b.year - a.year);

            legislations.forEach((legislation, index) => {
                const newLegislationItem = document.createElement('div');
                newLegislationItem.classList.add('legislation-item');
                newLegislationItem.innerHTML = `
                    <h3>${legislation.title}</h3>
                    <p>Year: ${legislation.year} | Category: ${legislation.category}</p>
                    <a href="${legislation.link}" target="_blank">View PDF</a>
                    ${isAdmin ? `<button onclick="deleteLegislation('${legislation.title}')">Delete</button>` : ''}
                `;
                legislationList.appendChild(newLegislationItem);
            });

            // Reset pagination
            currentPage = 1;
            changePage(0); // Refresh to show first page
        })
        .catch(error => console.error('Error loading legislations:', error));
}

// Populate filter options
function populateFilters(legislations) {
    const years = [...new Set(legislations.map(leg => leg.year))];
    const categories = [...new Set(legislations.map(leg => leg.category))];

    const filterYear = document.getElementById('filterYear');
    const filterCategory = document.getElementById('filterCategory');

    // Clear previous options
    filterYear.innerHTML = '<option value="">Select Year</option>';
    filterCategory.innerHTML = '<option value="">Select Category</option>';

    // Populate year options
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        filterYear.appendChild(option);
    });

    // Populate category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filterCategory.appendChild(option);
    });
}

// Filter legislation functionality
function filterLegislation() {
    const filterYearValue = document.getElementById('filterYear').value;
    const filterCategoryValue = document.getElementById('filterCategory').value;
    const legislationItems = document.getElementsByClassName('legislation-item');

    Array.from(legislationItems).forEach(item => {
        const year = item.querySelector('p').textContent.match(/Year: (\d+)/)[1];
        const category = item.querySelector('p').textContent.match(/Category: (.+)/)[1];

        const matchesYear = filterYearValue ? year === filterYearValue : true;
        const matchesCategory = filterCategoryValue ? category === filterCategoryValue : true;

        item.style.display = (matchesYear && matchesCategory) ? 'block' : 'none';
    });
}

// Search legislation functionality
function searchLegislation() {
    const searchInputValue = document.getElementById('searchInput').value.toLowerCase();
    const legislationItems = document.getElementsByClassName('legislation-item');

    Array.from(legislationItems).forEach(item => {
        const title = item.querySelector('h3').textContent.toLowerCase();
        item.style.display = title.includes(searchInputValue) ? 'block' : 'none';
    });
}

// Add new legislation functionality
function addNewLegislation() {
    const title = document.getElementById('legislationTitle').value;
    const year = document.getElementById('legislationYear').value;
    const category = document.getElementById('legislationCategory').value;
    const link = document.getElementById('legislationLink').value;

    // Assume we POST to a server
    fetch('legislations.json', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, year, category, link })
    })
    .then(response => {
        if (response.ok) {
            document.getElementById('addSuccessMessage').style.display = 'block';
            document.getElementById('legislationTitle').value = '';
            document.getElementById('legislationYear').value = '';
            document.getElementById('legislationCategory').value = '';
            document.getElementById('legislationLink').value = '';
            loadLegislations(); // Reload legislations after adding
        }
    })
    .catch(error => console.error('Error adding legislation:', error));

    return false; // Prevent form submission
}

// Delete legislation functionality
function deleteLegislation(title) {
    // Here you would send a DELETE request to the server
    console.log(`Delete legislation: ${title}`);
    loadLegislations(); // Reload legislations after deletion
}

// Pagination variables
let currentPage = 1;
const itemsPerPage = 5; // Set how many items to show per page

function changePage(direction) {
    const legislationItems = document.getElementsByClassName('legislation-item');
    const totalItems = legislationItems.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    currentPage += direction;

    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;

    document.getElementById('pageNumber').textContent = `Page ${currentPage}`;

    Array.from(legislationItems).forEach((item, index) => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        item.style.display = (index >= start && index < end) ? 'block' : 'none';
    });
}

// Initial load
loadLegislations();
