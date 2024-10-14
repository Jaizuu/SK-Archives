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

// Load legislations from local storage
function loadLegislations() {
    const legislationList = document.getElementById('legislationList');
    const filterYear = document.getElementById('filterYear');
    const filterCategory = document.getElementById('filterCategory');

    legislationList.innerHTML = ''; // Clear current list
    const legislations = JSON.parse(localStorage.getItem('legislations')) || [];

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
        const year = item.querySelector('p').innerText.match(/Year: (\d+)/)[1];
        const category = item.querySelector('p').innerText.match(/Category: (.+)/)[1];

        const matchesYear = filterYearValue === '' || year === filterYearValue;
        const matchesCategory = filterCategoryValue === '' || category === filterCategoryValue;

        if (matchesYear && matchesCategory) {
            item.style.display = ''; // Show item if it matches filters
        } else {
            item.style.display = 'none'; // Hide item if it doesn't match
        }
    });
}

// Add new legislation functionality
function addNewLegislation() {
    const title = document.getElementById('legislationTitle').value;
    const year = document.getElementById('legislationYear').value;
    const category = document.getElementById('legislationCategory').value;
    const link = document.getElementById('legislationLink').value;

    const legislations = JSON.parse(localStorage.getItem('legislations')) || [];

    // Create new legislation object
    const newLegislation = { title, year, category, link };
    legislations.push(newLegislation);
    
    // Save updated legislations to local storage
    localStorage.setItem('legislations', JSON.stringify(legislations));

    // Load updated legislations
    loadLegislations();

    // Clear form fields
    document.getElementById('legislationTitle').value = '';
    document.getElementById('legislationYear').value = '';
    document.getElementById('legislationCategory').value = '';
    document.getElementById('legislationLink').value = '';

    document.getElementById('addSuccessMessage').style.display = 'block';
    setTimeout(() => {
        document.getElementById('addSuccessMessage').style.display = 'none';
    }, 2000);

    return false; // Prevent form submission
}

// Delete legislation functionality
function deleteLegislation(title) {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
        let legislations = JSON.parse(localStorage.getItem('legislations')) || [];
        legislations = legislations.filter(leg => leg.title !== title);
        localStorage.setItem('legislations', JSON.stringify(legislations));
        loadLegislations(); // Refresh legislation list
    }
}

// Search legislation functionality
function searchLegislation() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const legislationItems = document.getElementsByClassName('legislation-item');

    Array.from(legislationItems).forEach(item => {
        const title = item.querySelector('h3').innerText.toLowerCase();
        if (title.includes(searchValue)) {
            item.style.display = ''; // Show item if it matches search
        } else {
            item.style.display = 'none'; // Hide item if it doesn't match
        }
    });
}

// Pagination functionality
let currentPage = 1;
const itemsPerPage = 5; // Adjust number of items per page

function changePage(direction) {
    const legislationItems = Array.from(document.getElementsByClassName('legislation-item'));
    const totalItems = legislationItems.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Update current page based on direction
    currentPage += direction;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;

    // Show only items for the current page
    legislationItems.forEach((item, index) => {
        if (index >= (currentPage - 1) * itemsPerPage && index < currentPage * itemsPerPage) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });

    document.getElementById('pageNumber').innerText = `Page ${currentPage}`;
}

// Initial load
loadLegislations();
