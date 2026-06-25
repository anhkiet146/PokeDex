'use client';

import { useState } from 'react';
import Link from 'next/link';

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

export default function PokemonListClient({ initialPokemon }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [currentSort, setCurrentSort] = useState('id-asc');
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Extract unique types present in list
  const uniqueTypes = Array.from(new Set(initialPokemon.flatMap(p => p.types))).sort();

  // Filter & Sort
  const filteredPokemon = initialPokemon.filter(poke => {
    const matchesSearch = poke.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          poke.id.toString().includes(searchQuery);
    const matchesType = selectedType === 'all' || poke.types.includes(selectedType);
    return matchesSearch && matchesType;
  });

  if (currentSort === 'id-asc') {
    filteredPokemon.sort((a, b) => a.id - b.id);
  } else if (currentSort === 'id-desc') {
    filteredPokemon.sort((a, b) => b.id - a.id);
  } else if (currentSort === 'name-asc') {
    filteredPokemon.sort((a, b) => a.name.localeCompare(b.name));
  } else if (currentSort === 'name-desc') {
    filteredPokemon.sort((a, b) => b.name.localeCompare(a.name));
  }

  const handleClearFilters = () => {
    setSelectedType('all');
  };

  const getSortLabel = () => {
    switch (currentSort) {
      case 'id-asc': return 'ID: Tăng dần';
      case 'id-desc': return 'ID: Giảm dần';
      case 'name-asc': return 'Tên: A - Z';
      case 'name-desc': return 'Tên: Z - A';
      default: return 'ID: Tăng dần';
    }
  };

  return (
    <>
      {/* Controls Section */}
      <section className="controls-section" onClick={() => { setShowTypeMenu(false); setShowSortMenu(false); }}>
        <div className="search-wrapper" onClick={(e) => e.stopPropagation()}>
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên hoặc ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-btn" style={{ display: 'block' }} onClick={() => setSearchQuery('')}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
        
        <div className="filters-wrapper" onClick={(e) => e.stopPropagation()}>
          {/* Type Dropdown */}
          <div className="dropdown-filter">
            <button className="filter-btn" onClick={() => { setShowSortMenu(false); setShowTypeMenu(!showTypeMenu); }}>
              <span>{selectedType === 'all' ? 'Tất cả hệ' : (TYPE_TRANSLATIONS[selectedType]?.name || selectedType)}</span>
              <i className="fa-solid fa-chevron-down"></i>
            </button>
            <div className={`dropdown-menu ${showTypeMenu ? 'show' : ''}`} style={{ gridTemplateColumns: 'repeat(2, 140px)', display: showTypeMenu ? 'grid' : 'none' }}>
              <div className={`dropdown-item ${selectedType === 'all' ? 'active' : ''}`} onClick={() => { setSelectedType('all'); setShowTypeMenu(false); }}>
                Tất cả hệ
              </div>
              {uniqueTypes.map(type => {
                const trans = TYPE_TRANSLATIONS[type] || { name: type, color: '#999' };
                return (
                  <div key={type} className={`dropdown-item ${selectedType === type ? 'active' : ''}`} onClick={() => { setSelectedType(type); setShowTypeMenu(false); }}>
                    <span className="type-pill" style={{ backgroundColor: trans.color }}>{trans.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="dropdown-filter">
            <button className="filter-btn" onClick={() => { setShowTypeMenu(false); setShowSortMenu(!showSortMenu); }}>
              <span>{getSortLabel()}</span>
              <i className="fa-solid fa-sort"></i>
            </button>
            <div className={`dropdown-menu ${showSortMenu ? 'show' : ''}`}>
              <div className={`dropdown-item ${currentSort === 'id-asc' ? 'active' : ''}`} onClick={() => { setCurrentSort('id-asc'); setShowSortMenu(false); }}>ID: Tăng dần</div>
              <div className={`dropdown-item ${currentSort === 'id-desc' ? 'active' : ''}`} onClick={() => { setCurrentSort('id-desc'); setShowSortMenu(false); }}>ID: Giảm dần</div>
              <div className={`dropdown-item ${currentSort === 'name-asc' ? 'active' : ''}`} onClick={() => { setCurrentSort('name-asc'); setShowSortMenu(false); }}>Tên: A - Z</div>
              <div className={`dropdown-item ${currentSort === 'name-desc' ? 'active' : ''}`} onClick={() => { setCurrentSort('name-desc'); setShowSortMenu(false); }}>Tên: Z - A</div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Filter Badges */}
      {selectedType !== 'all' && (
        <div className="active-filters-container">
          <div className="active-filter-badge">
            Hệ: {TYPE_TRANSLATIONS[selectedType]?.name || selectedType}
            <button onClick={handleClearFilters}><i class="fa-solid fa-xmark"></i></button>
          </div>
        </div>
      )}

      {/* Pokemon Grid */}
      <section className="pokemon-grid">
        {filteredPokemon.length > 0 ? (
          filteredPokemon.map(poke => {
            const primaryType = poke.types[0];
            const transColor = TYPE_TRANSLATIONS[primaryType]?.color || '#999';
            
            const cardStyle = {
              '--card-glow-color': `${transColor}10`,
              '--card-border-color': `${transColor}40`,
              '--card-shadow-color': `${transColor}1c`,
            };

            return (
              <Link 
                key={poke.id} 
                href={`/pokemon/${poke.id}`} 
                className="pokemon-card" 
                style={cardStyle}
              >
                <span className="card-pokemon-id">#{poke.id.toString().padStart(3, '0')}</span>
                <div className="card-image-container">
                  <div className="card-pokemon-bg"></div>
                  <img src={poke.image} alt={poke.name} />
                </div>
                <h3 className="card-pokemon-name">{poke.name}</h3>
                <div className="card-types">
                  {poke.types.map(type => {
                    const trans = TYPE_TRANSLATIONS[type] || { name: type, color: '#999' };
                    return (
                      <span key={type} className="type-badge" style={{ backgroundColor: trans.color }}>
                        {trans.name}
                      </span>
                    );
                  })}
                </div>
              </Link>
            );
          })
        ) : (
          <div className="no-results" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 1rem' }}>
            <i className="fa-regular fa-face-frown" style={{ fontSize: '3.5rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'block' }}></i>
            <h3 style={{ fontSize: '1.4rem' }}>Không tìm thấy Pokémon nào</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc.</p>
          </div>
        )}
      </section>
    </>
  );
}
