document.addEventListener("DOMContentLoaded", function () {
    const API_KEY = 'AIzaSyCwN6epkbxf69AvPD-SdPFrB0MONjFAI1Q';
    const FOLDER_ID = '1D-gIDGeHx2frRjH7j5wIScQDTJWzeW7e';

    const documentGrid = document.getElementById('documentGrid');
    const searchBar = document.getElementById('searchBar');
    const categoryFilter = document.getElementById('categoryFilter');
    const yearFilter = document.getElementById('yearFilter');
    const sortFilter = document.getElementById('sortFilter');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const paginationContainer = document.getElementById('pagination'); // Added pagination container

    let documents = []; // Store fetched documents here
    let currentPage = 1;
    const itemsPerPage = 10; // Number of documents to display per page

    // Fetch documents from Google Drive
    async function fetchDocuments() {
        loadingIndicator.style.display = 'block'; // Show loading indicator
        try {
            const response = await fetch(`https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&key=${API_KEY}`);
            if (!response.ok) throw new Error('Network response was not ok.');
            const data = await response.json();
            documents = data.files.map(file => {
                const { category, year } = extractMetadataFromFileName(file.name);
                return {
                    title: file.name,
                    link: `https://drive.google.com/file/d/${file.id}/view`,
                    category: category,
                    year: year
                };
            });

            renderDocuments(); // Render documents
            populateYearFilter(); // Populate year filter
        } catch (error) {
            console.error('Error fetching documents:', error);
            alert('Failed to load documents. Please try again later.');
        } finally {
            loadingIndicator.style.display = 'none'; // Hide loading indicator
        }
    }

    // Function to extract category and year from file name
    function extractMetadataFromFileName(fileName) {
        const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
        const parts = nameWithoutExtension.split('-');
        let year = null;
        let category = "Unknown";

        for (let part of parts) {
            const trimmedPart = part.trim();
            if (/^\d{4}$/.test(trimmedPart)) {
                year = trimmedPart;
            } else if (category === "Unknown") {
                category = trimmedPart;
            }
        }

        return { category, year: year || "Unknown" };
    }

    // Function to render documents with pagination
    function renderDocuments() {
        const searchQuery = searchBar.value.toLowerCase();
        const selectedCategory = categoryFilter.value;
        const selectedYear = yearFilter.value;
        const sortBy = sortFilter.value;

        const filteredDocuments = documents.filter(doc => {
            return (
                (selectedCategory === "" || doc.category === selectedCategory) &&
                (selectedYear === "" || doc.year === selectedYear) &&
                doc.title.toLowerCase().includes(searchQuery)
            );
        });

        // Sort documents
        if (sortBy === 'year') {
            filteredDocuments.sort((a, b) => b.year - a.year);
        } else {
            filteredDocuments.sort((a, b) => a.title.localeCompare(b.title));
        }

        // Calculate pagination
        const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

        documentGrid.innerHTML = "";
        paginatedDocuments.forEach(doc => {
            const card = document.createElement('div');
            card.className = 'document-card';

            // Enhanced card content
            card.innerHTML = `
                <h4>${doc.title}</h4>
                <div class="metadata">
                    <div>
                        <i class="fas fa-file-pdf document-icon"></i>
                        <span>${doc.category}</span>
                    </div>
                    <div>${doc.year}</div>
                </div>
                <a href="${doc.link}" class="view-button" target="_blank">View Document</a>
            `;

            documentGrid.appendChild(card);
        });

        // Retain selected year and category after filtering
        categoryFilter.value = selectedCategory;
        yearFilter.value = selectedYear;

        renderPagination(totalPages);
    }

    // Function to render pagination controls
    function renderPagination(totalPages) {
        paginationContainer.innerHTML = '';

        for (let page = 1; page <= totalPages; page++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = page;
            pageButton.className = 'pagination-button';
            if (page === currentPage) pageButton.classList.add('active');
            pageButton.addEventListener('click', () => {
                currentPage = page;
                renderDocuments();
            });
            paginationContainer.appendChild(pageButton);
        }
    }

    // Function to populate the year filter with unique years
    function populateYearFilter() {
        const years = new Set(documents.map(doc => doc.year));
        yearFilter.innerHTML = `<option value="">All Years</option>`;

        years.forEach(year => {
            yearFilter.innerHTML += `<option value="${year}">${year}</option>`;
        });
    }

    // Scroll to the Document Section when Search Bar is clicked
    searchBar.addEventListener('click', function () {
        const documentSection = document.getElementById('documentGrid');
        documentSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Event Listeners
    searchBar.addEventListener('input', () => {
        currentPage = 1; // Reset to first page on search
        renderDocuments();
    });
    categoryFilter.addEventListener('change', () => {
        currentPage = 1; // Reset to first page on category change
        renderDocuments();
    });
    yearFilter.addEventListener('change', () => {
        currentPage = 1; // Reset to first page on year change
        renderDocuments();
    });
    sortFilter.addEventListener('change', () => {
        currentPage = 1; // Reset to first page on sort change
        renderDocuments();
    });

    // Initial Fetch
    fetchDocuments();
});
