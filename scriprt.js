const BASE_URL = "https://openlibrary.org/search.json";
const AUTHORS_URL = "https://openlibrary.org/search/authors.json";

const TAG_MAP = {
    "Existence": "existentialism",
    "Ethique": "ethics",
    "Connaissance": "epistemology"
};
const searchInput = document.querySelector(".search-input input");
const searchBtn = document.querySelector(".search-btn");
const tags = document.querySelectorAll(".tag");
const cardsContainer = document.querySelector(".cards");

function debounce(fn, delay = 400) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
async function fetchBooks(query = "", subject = "") {
    try {
        let url = "";

        if (query) {
            url = `${BASE_URL}?q=${encodeURIComponent(query)}&limit=12`;
        } else if (subject) {
            url = `${BASE_URL}?subject=${encodeURIComponent(subject)}&limit=12`;
        } else {
            url = `${BASE_URL}?q=philosophy&limit=12`;
        }

        const res = await fetch(url);
        const data = await res.json();

        return data.docs || [];
    } catch (err) {
        console.error("API error:", err);
        return [];
    }
}
async function fetchAuthors(query) {
    try {
        const url = `${AUTHORS_URL}?q=${encodeURIComponent(query)}&limit=12`;
        const res = await fetch(url);
        const data = await res.json();
        return data.docs || [];
    } catch (err) {
        console.error("API error:", err);
        return [];
    }
}
function renderBooks(books) {
    cardsContainer.innerHTML = "";

    if (!books.length) {
        cardsContainer.innerHTML = "<p>Aucun résultat</p>";
        return;
    }

    books.forEach(book => {
        const title = book.title || "Sans titre";
        const coverId = book.cover_i;

        const coverURL = coverId
            ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
            : "https://via.placeholder.com/150x220?text=No+Cover";

        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <img src="${coverURL}" alt="${title}">
            <p class="book-title">${title}</p>
        `;

        cardsContainer.appendChild(card);
    });
}
function renderAuthors(authors) {
    cardsContainer.innerHTML = "";

    if (!authors.length) {
        cardsContainer.innerHTML = "<p>Aucun résultat</p>";
        return;
    }

    authors.forEach(author => {
        const name = author.name || "Sans nom";
        const birth = author.birth_date || "?";
        const death = author.death_date || "?";
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <img src="https://via.placeholder.com/150x220?text=Philosopher" alt="${name}">
            <p class="book-title">${name}</p>
            <p>${birth} - ${death}</p>
        `;

        cardsContainer.appendChild(card);
    });
}
async function performSearch() {
    const query = searchInput.value.trim();
    if (query) {
        const authors = await fetchAuthors(query);
        renderAuthors(authors);
    } else {
        const books = await fetchBooks("philosophy");
        renderBooks(books);
    }
}
const handleSearch = debounce(performSearch, 400);
tags.forEach(tag => {
    tag.addEventListener("click", async () => {
        tags.forEach(t => t.classList.remove("active"));
        tag.classList.add("active");

        const subject = TAG_MAP[tag.textContent];
        const books = await fetchBooks("", subject);

        renderBooks(books);
    });
});
searchInput.addEventListener("input", handleSearch);
searchBtn.addEventListener("click", performSearch);

(async function init() {
    const books = await fetchBooks("philosophy");
    renderBooks(books);
})();