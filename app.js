// Constants and Configurations
const POKEMON_LIMIT = 151; // Generation 1 Pokemon
const API_URL = 'https://pokeapi.co/api/v2';
const STORAGE_KEY = 'pokedex_cache_data';

// Vietnamese Type Translation & Colors Mapping
const TYPE_TRANSLATIONS = {
    normal: { name: 'Thường', color: '#A8A77A' },
    fire: { name: 'Lửa', color: '#EE8130' },
    water: { name: 'Nước', color: '#6390F0' },
    electric: { name: 'Điện', color: '#F7D02C' },
    grass: { name: 'Cỏ', color: '#7AC74C' },
    ice: { name: 'Băng', color: '#96D9D6' },
    fighting: { name: 'Đấu Sĩ', color: '#C22E28' },
    poison: { name: 'Độc', color: '#A33EA1' },
    ground: { name: 'Đất', color: '#E2BF65' },
    flying: { name: 'Bay', color: '#A98FF3' },
    psychic: { name: 'Siêu Linh', color: '#F95587' },
    bug: { name: 'Côn Trùng', color: '#A6B91A' },
    rock: { name: 'Đá', color: '#B6A136' },
    ghost: { name: 'Ma', color: '#735797' },
    dragon: { name: 'Rồng', color: '#6F35FC' },
    steel: { name: 'Thép', color: '#B7B7CE' },
    fairy: { name: 'Tiên', color: '#D685AD' },
    dark: { name: 'Bóng Tối', color: '#705746' }
};

// Application State
let pokemonList = [];      // Full list of loaded Pokemon data
let filteredList = [];     // Filtered and sorted list currently displayed
let selectedType = 'all';  // Selected filter type
let currentSort = 'id-asc';// Selected sorting option
let searchQuery = '';      // Active search text

// DOM Elements
const pokemonGrid = document.getElementById('pokemon-grid');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const typeFilterBtn = document.getElementById('type-filter-btn');
const selectedTypeText = document.getElementById('selected-type-text');
const typeDropdownMenu = document.getElementById('type-dropdown-menu');
const sortFilterBtn = document.getElementById('sort-filter-btn');
const selectedSortText = document.getElementById('selected-sort-text');
const sortDropdownMenu = document.getElementById('sort-dropdown-menu');
const activeFiltersContainer = document.getElementById('active-filters');
const pokemonModal = document.getElementById('pokemon-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalBody = document.querySelector('#pokemon-modal .modal-body');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initStars();
    loadPokemonData();
    setupEventListeners();
});

// Generate floating background dots
function initStars() {
    const container = document.querySelector('.stars-container');
    if (!container) return;
    for (let i = 0; i < 40; i++) {
        const star = document.createElement('div');
        star.style.position = 'absolute';
        star.style.width = Math.random() * 3 + 'px';
        star.style.height = star.style.width;
        star.style.background = 'rgba(255, 255, 255, ' + Math.random() * 0.7 + ')';
        star.style.top = Math.random() * 100 + '%';
        star.style.left = Math.random() * 100 + '%';
        star.style.borderRadius = '50%';
        container.appendChild(star);
    }
}

// Fetch or Load cached Pokemon details
async function loadPokemonData() {
    renderSkeletons();
    
    // Try to load from cache first
    const cachedData = localStorage.getItem(STORAGE_KEY);
    if (cachedData) {
        try {
            pokemonList = JSON.parse(cachedData);
            if (pokemonList.length === POKEMON_LIMIT) {
                console.log('Loaded Pokemon data from Cache.');
                populateTypeFilter();
                applyFiltersAndSort();
                return;
            }
        } catch (e) {
            console.error('Failed to parse cache, fetching fresh data...', e);
        }
    }

    // If cache not found, fetch from API
    try {
        console.log('Fetching fresh Pokemon data from PokeAPI...');
        const response = await fetch(`${API_URL}/pokemon?limit=${POKEMON_LIMIT}`);
        const data = await response.json();
        
        // Fetch detailed data for each Pokemon in parallel chunks
        const detailedPromises = data.results.map(async (poke) => {
            const detailRes = await fetch(poke.url);
            return await detailRes.json();
        });
        
        const details = await Promise.all(detailedPromises);
        
        // Format and clean up the dataset
        pokemonList = details.map(poke => ({
            id: poke.id,
            name: poke.name,
            image: poke.sprites.other['official-artwork'].front_default || poke.sprites.front_default,
            types: poke.types.map(t => t.type.name),
            stats: poke.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
            height: poke.height / 10, // decimeters to meters
            weight: poke.weight / 10, // hectograms to kg
            abilities: poke.abilities.map(a => a.ability.name),
            speciesUrl: poke.species.url
        }));

        // Cache the dataset
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pokemonList));
        
        populateTypeFilter();
        applyFiltersAndSort();
    } catch (error) {
        console.error('Error fetching Pokemon data:', error);
        pokemonGrid.innerHTML = `
            <div class="error-container" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 3rem; color: #ff4a5a; margin-bottom: 1rem;"></i>
                <h2>Không thể tải dữ liệu Pokémon</h2>
                <p style="color: var(--text-secondary); margin-top: 0.5rem;">Vui lòng kiểm tra kết nối internet và tải lại trang.</p>
                <button onclick="location.reload()" class="filter-btn" style="margin: 1.5rem auto 0; background: var(--primary-color);">Tải lại</button>
            </div>
        `;
    }
}

// Render Loading Skeletons
function renderSkeletons() {
    pokemonGrid.innerHTML = Array(12).fill(0).map(() => `
        <div class="skeleton-card">
            <div class="skeleton-id skeleton-shimmer"></div>
            <div class="skeleton-img skeleton-shimmer"></div>
            <div class="skeleton-name skeleton-shimmer"></div>
            <div class="skeleton-types">
                <div class="skeleton-type skeleton-shimmer"></div>
                <div class="skeleton-type skeleton-shimmer"></div>
            </div>
        </div>
    `).join('');
}

// Populate Type Dropdown
function populateTypeFilter() {
    // Extract all unique types present in the loaded list
    const types = new Set();
    pokemonList.forEach(poke => {
        poke.types.forEach(t => types.add(t));
    });

    const menuHtml = [];
    menuHtml.push('<div class="dropdown-item active" data-type="all">Tất cả hệ</div>');
    
    Array.from(types).sort().forEach(type => {
        const trans = TYPE_TRANSLATIONS[type] || { name: type, color: '#999' };
        menuHtml.push(`
            <div class="dropdown-item" data-type="${type}">
                <span class="type-pill" style="background-color: ${trans.color}">${trans.name}</span>
            </div>
        `);
    });

    typeDropdownMenu.innerHTML = menuHtml.join('');

    // Add click listener for type items
    typeDropdownMenu.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const target = e.currentTarget;
            selectedType = target.dataset.type;
            
            // UI active class toggle
            typeDropdownMenu.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
            target.classList.add('active');
            
            const trans = TYPE_TRANSLATIONS[selectedType];
            selectedTypeText.textContent = trans ? trans.name : 'Tất cả hệ';
            typeDropdownMenu.classList.remove('show');
            
            applyFiltersAndSort();
        });
    });
}

// Set up UI Event Listeners
function setupEventListeners() {
    // Search Input
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
        applyFiltersAndSort();
    });

    // Clear Search
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.style.display = 'none';
        applyFiltersAndSort();
    });

    // Toggle Dropdowns
    typeFilterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sortDropdownMenu.classList.remove('show');
        typeDropdownMenu.classList.toggle('show');
    });

    sortFilterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        typeDropdownMenu.classList.remove('show');
        sortDropdownMenu.classList.toggle('show');
    });

    // Close Dropdowns on outside click
    document.addEventListener('click', () => {
        typeDropdownMenu.classList.remove('show');
        sortDropdownMenu.classList.remove('show');
    });

    // Sorting Dropdown Click
    sortDropdownMenu.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const target = e.currentTarget;
            currentSort = target.dataset.sort;
            
            sortDropdownMenu.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
            target.classList.add('active');
            
            selectedSortText.textContent = target.textContent;
            sortDropdownMenu.classList.remove('show');
            
            applyFiltersAndSort();
        });
    });

    // Close Modal Events
    closeModalBtn.addEventListener('click', hideModal);
    pokemonModal.addEventListener('click', (e) => {
        if (e.target === pokemonModal) hideModal();
    });
}

// Filter and Sort Data
function applyFiltersAndSort() {
    filteredList = pokemonList.filter(poke => {
        // Search filter
        const matchSearch = poke.name.toLowerCase().includes(searchQuery) || 
                            poke.id.toString().includes(searchQuery);
        
        // Type filter
        const matchType = selectedType === 'all' || poke.types.includes(selectedType);
        
        return matchSearch && matchType;
    });

    // Apply Sorting
    if (currentSort === 'id-asc') {
        filteredList.sort((a, b) => a.id - b.id);
    } else if (currentSort === 'id-desc') {
        filteredList.sort((a, b) => b.id - a.id);
    } else if (currentSort === 'name-asc') {
        filteredList.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSort === 'name-desc') {
        filteredList.sort((a, b) => b.name.localeCompare(a.name));
    }

    renderActiveFilters();
    renderPokemonGrid();
}

// Render Active Filters Badge list
function renderActiveFilters() {
    activeFiltersContainer.innerHTML = '';
    
    if (selectedType !== 'all') {
        const trans = TYPE_TRANSLATIONS[selectedType];
        const badge = document.createElement('div');
        badge.className = 'active-filter-badge';
        badge.innerHTML = `
            Hệ: ${trans ? trans.name : selectedType}
            <button id="clear-type-badge"><i class="fa-solid fa-xmark"></i></button>
        `;
        activeFiltersContainer.appendChild(badge);

        badge.querySelector('#clear-type-badge').addEventListener('click', () => {
            selectedType = 'all';
            selectedTypeText.textContent = 'Tất cả hệ';
            typeDropdownMenu.querySelectorAll('.dropdown-item').forEach(i => {
                i.classList.remove('active');
                if (i.dataset.type === 'all') i.classList.add('active');
            });
            applyFiltersAndSort();
        });
    }
}

// Render Grid Cards
function renderPokemonGrid() {
    if (filteredList.length === 0) {
        pokemonGrid.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem;">
                <i class="fa-regular fa-face-frown" style="font-size: 3.5rem; color: var(--text-secondary); margin-bottom: 1rem; display: block;"></i>
                <h3 style="font-size: 1.4rem;">Không tìm thấy Pokémon nào</h3>
                <p style="color: var(--text-secondary); margin-top: 0.5rem;">Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc.</p>
            </div>
        `;
        return;
    }

    pokemonGrid.innerHTML = filteredList.map(poke => {
        const primaryType = poke.types[0];
        const transColor = TYPE_TRANSLATIONS[primaryType]?.color || '#999';
        
        // Inline styles for custom glow effects matching type color
        const cardStyle = `
            --card-glow-color: ${transColor}10;
            --card-border-color: ${transColor}40;
            --card-shadow-color: ${transColor}1c;
        `;
        
        const idStr = `#${poke.id.toString().padStart(3, '0')}`;
        
        const badgesHtml = poke.types.map(type => {
            const trans = TYPE_TRANSLATIONS[type] || { name: type, color: '#999' };
            return `<span class="type-badge" style="background-color: ${trans.color}">${trans.name}</span>`;
        }).join('');

        return `
            <div class="pokemon-card" style="${cardStyle}" onclick="showPokemonDetails(${poke.id})">
                <span class="card-pokemon-id">${idStr}</span>
                <div class="card-image-container">
                    <div class="card-pokemon-bg"></div>
                    <img src="${poke.image}" alt="${poke.name}" loading="lazy">
                </div>
                <h3 class="card-pokemon-name">${poke.name}</h3>
                <div class="card-types">
                    ${badgesHtml}
                </div>
            </div>
        `;
    }).join('');
}

// Show Detail Modal
async function showPokemonDetails(id) {
    const poke = pokemonList.find(p => p.id === id);
    if (!poke) return;

    // Show loading structure in modal first
    const primaryType = poke.types[0];
    const transColor = TYPE_TRANSLATIONS[primaryType]?.color || '#999';
    document.documentElement.style.setProperty('--modal-theme-color', transColor);
    document.documentElement.style.setProperty('--modal-header-color', `${transColor}20`);

    modalBody.innerHTML = `
        <div class="modal-loading" style="padding: 4rem 0; text-align: center;">
            <div class="loader-spinner"></div>
            <p style="margin-top: 1rem; color: var(--text-secondary);">Đang tải dữ liệu chi tiết...</p>
        </div>
    `;
    
    pokemonModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Disable scroll on body

    try {
        // Fetch species info (description and evolution chain URL)
        const speciesRes = await fetch(poke.speciesUrl);
        const speciesData = await speciesRes.json();
        
        // Find English or fallback description
        let description = 'Không có mô tả.';
        const engEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
        if (engEntry) {
            description = engEntry.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ');
        }

        // Fetch Evolution Chain details
        const evoChainUrl = speciesData.evolution_chain.url;
        const evoRes = await fetch(evoChainUrl);
        const evoData = await evoRes.json();
        const evolutionChainHtml = await renderEvolutionChain(evoData.chain);

        // Format Stats for UI
        const statsMap = {
            'hp': 'HP',
            'attack': 'ATK',
            'defense': 'DEF',
            'special-attack': 'SATK',
            'special-defense': 'SDEF',
            'speed': 'SPD'
        };

        const statsHtml = poke.stats.map(s => {
            const shortName = statsMap[s.name] || s.name;
            const percent = Math.min((s.value / 150) * 100, 100); // 150 base scale
            return `
                <div class="stat-row">
                    <span class="stat-name">${shortName}</span>
                    <span class="stat-value">${s.value}</span>
                    <div class="stat-bar-container">
                        <div class="stat-bar" data-width="${percent}%"></div>
                    </div>
                </div>
            `;
        }).join('');

        const idStr = `#${poke.id.toString().padStart(3, '0')}`;
        const badgesHtml = poke.types.map(type => {
            const trans = TYPE_TRANSLATIONS[type] || { name: type, color: '#999' };
            return `<span class="type-badge" style="background-color: ${trans.color}">${trans.name}</span>`;
        }).join('');

        // Generate Modal HTML
        modalBody.innerHTML = `
            <div class="modal-image-wrapper">
                <img src="${poke.image}" alt="${poke.name}">
            </div>
            
            <span class="modal-id">${idStr}</span>
            <h2 class="modal-name">${poke.name}</h2>
            
            <div class="modal-types">
                ${badgesHtml}
            </div>

            <div class="modal-stats-summary">
                <div class="stat-summary-item">
                    <span class="stat-summary-val">${poke.weight} kg</span>
                    <span class="stat-summary-label">Cân nặng</span>
                </div>
                <div class="stat-summary-item">
                    <span class="stat-summary-val">${poke.height} m</span>
                    <span class="stat-summary-label">Chiều cao</span>
                </div>
                <div class="stat-summary-item">
                    <span class="stat-summary-val" style="font-size: 0.95rem; line-height: 1.4; text-transform: capitalize;">
                        ${poke.abilities.slice(0, 2).join('<br>')}
                    </span>
                    <span class="stat-summary-label">Kỹ năng</span>
                </div>
            </div>

            <h3 class="modal-section-title">Mô tả</h3>
            <p class="pokemon-description" style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 2rem;">
                ${description}
            </p>

            <h3 class="modal-section-title">Chỉ số cơ bản</h3>
            <div class="stats-grid">
                ${statsHtml}
            </div>

            ${evolutionChainHtml ? `
                <h3 class="modal-section-title">Tiến hóa</h3>
                <div class="evolution-chain">
                    ${evolutionChainHtml}
                </div>
            ` : ''}
        `;

        // Animate stat bars in a micro-task to allow rendering
        setTimeout(() => {
            const bars = modalBody.querySelectorAll('.stat-bar');
            bars.forEach(bar => {
                bar.style.width = bar.dataset.width;
            });
        }, 100);

    } catch (err) {
        console.error('Error loading modal detail data:', err);
        modalBody.innerHTML = `
            <div style="text-align: center; padding: 2rem 0;">
                <p style="color: #ff4a5a;">Không thể tải thông tin tiến hóa và mô tả chi tiết.</p>
            </div>
        `;
    }
}

// Generate Evolution Chain elements dynamically
async function renderEvolutionChain(chain) {
    const evoList = [];
    let current = chain;

    // Traverse evolution tree nodes
    while (current) {
        const name = current.species.name;
        // Search in our pokemonList cache first to get cached artwork image
        const cacheMatch = pokemonList.find(p => p.name.toLowerCase() === name.toLowerCase());
        
        let imgUrl = '';
        let id = null;
        
        if (cacheMatch) {
            imgUrl = cacheMatch.image;
            id = cacheMatch.id;
        } else {
            // Fallback: fetch directly if outside first 151
            try {
                const res = await fetch(`${API_URL}/pokemon/${name}`);
                const data = await res.json();
                imgUrl = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
                id = data.id;
            } catch (e) {
                console.error(e);
            }
        }

        if (imgUrl && id) {
            evoList.push({ name, id, img: imgUrl });
        }
        
        // For simplicity, take the first child node of evolution paths (linear evolutions)
        current = current.evolves_to[0];
    }

    if (evoList.length <= 1) return '';

    return evoList.map((evo, index) => {
        const arrowHtml = index < evoList.length - 1 ? '<i class="fa-solid fa-arrow-right evo-arrow"></i>' : '';
        return `
            <div class="evo-pokemon" onclick="showPokemonDetails(${evo.id})">
                <div class="evo-img-wrapper">
                    <img src="${evo.img}" alt="${evo.name}">
                </div>
                <div class="evo-name">${evo.name}</div>
            </div>
            ${arrowHtml}
        `;
    }).join('');
}

function hideModal() {
    pokemonModal.classList.add('hidden');
    document.body.style.overflow = ''; // Re-enable scroll
}
