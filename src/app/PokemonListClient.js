'use client';

import { useState } from 'react';
import Link from 'next/link';

const TYPE_TRANSLATIONS = {
  normal: { name: 'Thường', color: '#A8A77A', light: '#f6f6f1' },
  fire: { name: 'Lửa', color: '#EE8130', light: '#fdf3eb' },
  water: { name: 'Nước', color: '#6390F0', light: '#eff4fe' },
  electric: { name: 'Điện', color: '#F7D02C', light: '#fefaf0' },
  grass: { name: 'Cỏ', color: '#7AC74C', light: '#f2faf0' },
  ice: { name: 'Băng', color: '#96D9D6', light: '#f5fafb' },
  fighting: { name: 'Đấu Sĩ', color: '#C22E28', light: '#fcf0ef' },
  poison: { name: 'Độc', color: '#A33EA1', light: '#faf0fa' },
  ground: { name: 'Đất', color: '#E2BF65', light: '#faf8f0' },
  flying: { name: 'Bay', color: '#A98FF3', light: '#f6f4fe' },
  psychic: { name: 'Siêu Linh', color: '#F95587', light: '#fef0f4' },
  bug: { name: 'Côn Trùng', color: '#A6B91A', light: '#fafbf0' },
  rock: { name: 'Đá', color: '#B6A136', light: '#faf9f0' },
  ghost: { name: 'Ma', color: '#735797', light: '#f4eff7' },
  dragon: { name: 'Rồng', color: '#6F35FC', light: '#f3efff' },
  steel: { name: 'Thép', color: '#B7B7CE', light: '#f7f7fa' },
  fairy: { name: 'Tiên', color: '#D685AD', light: '#fef3f7' },
  dark: { name: 'Bóng Tối', color: '#705746', light: '#f4f1f0' }
};

const TYPE_ICONS = {
  normal: 'fa-circle-dot',
  fire: 'fa-fire',
  water: 'fa-droplet',
  grass: 'fa-leaf',
  electric: 'fa-bolt',
  psychic: 'fa-brain',
  ice: 'fa-snowflake',
  dragon: 'fa-wand-magic-sparkles',
  ghost: 'fa-ghost',
  steel: 'fa-shield-halved',
  bug: 'fa-bug',
  rock: 'fa-gem',
  ground: 'fa-mountain',
  poison: 'fa-skull-crossbones',
  flying: 'fa-wind',
  fairy: 'fa-heart',
  dark: 'fa-moon',
  fighting: 'fa-hand-fist'
};

export default function PokemonListClient({ initialPokemon }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [currentSort, setCurrentSort] = useState('id-asc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Extract all unique types present
  const uniqueTypes = Array.from(new Set(initialPokemon.flatMap(p => p.types))).sort();

  // Filter and Sort Pokemon
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
    <div onClick={() => setShowSortMenu(false)}>
      {/* 1. Large Red Hero Section (Screenshot 1) */}
      <section className="hero-banner">
        <h2>Find Your Perfect Team</h2>
        <p>
          Access detailed competitive data, move sets, and stats for over 1,000 Pokémon in our high-performance vanguard database.
        </p>
        <div className="hero-search-wrapper" onClick={(e) => e.stopPropagation()}>
          <div className="hero-input-container">
            <i className="fa-solid fa-mobile-screen-button"></i>
            <input 
              type="text" 
              className="hero-search-input"
              placeholder="Enter Pokémon Name or #ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-scan" onClick={() => alert('Quét thành công!')}>
            Scan Dex
          </button>
        </div>
      </section>

      {/* 2. Browse by Type circular scroll list (Screenshot 1) */}
      <section className="type-filter-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Browse by Type</h3>
          {selectedType !== 'all' && (
            <button 
              onClick={() => setSelectedType('all')} 
              style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Clear Filter
            </button>
          )}
        </div>
        
        <div className="type-circle-list">
          {uniqueTypes.map(type => {
            const trans = TYPE_TRANSLATIONS[type] || { name: type, color: '#999', light: '#f1f1f1' };
            const icon = TYPE_ICONS[type] || 'fa-circle';
            const isActive = selectedType === type;
            
            const circleStyle = {
              '--theme-type-color': trans.color,
              '--theme-type-light': trans.light
            };

            return (
              <div 
                key={type} 
                className={`type-circle-card ${isActive ? 'active' : ''}`}
                style={circleStyle}
                onClick={() => setSelectedType(isActive ? 'all' : type)}
              >
                <div className="type-circle-icon">
                  <i className={`fa-solid ${icon}`}></i>
                </div>
                <span className="type-circle-name">{trans.name}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Dashboard Layout - Split Columns */}
      <div className="home-layout">
        
        {/* Main Grid Column */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Discover Pokémon</h3>
            
            {/* Sorting Filter Dropdown */}
            <div className="dropdown-filter" onClick={(e) => e.stopPropagation()}>
              <button className="filter-btn" style={{ height: '40px', padding: '0 1rem', borderRadius: '10px' }} onClick={() => setShowSortMenu(!showSortMenu)}>
                <span>{getSortLabel()}</span>
                <i className="fa-solid fa-sort" style={{ marginLeft: '0.5rem' }}></i>
              </button>
              <div className={`dropdown-menu ${showSortMenu ? 'show' : ''}`} style={{ right: 0 }}>
                <div className={`dropdown-item ${currentSort === 'id-asc' ? 'active' : ''}`} onClick={() => { setCurrentSort('id-asc'); setShowSortMenu(false); }}>ID: Tăng dần</div>
                <div className={`dropdown-item ${currentSort === 'id-desc' ? 'active' : ''}`} onClick={() => { setCurrentSort('id-desc'); setShowSortMenu(false); }}>ID: Giảm dần</div>
                <div className={`dropdown-item ${currentSort === 'name-asc' ? 'active' : ''}`} onClick={() => { setCurrentSort('name-asc'); setShowSortMenu(false); }}>Tên: A - Z</div>
                <div className={`dropdown-item ${currentSort === 'name-desc' ? 'active' : ''}`} onClick={() => { setCurrentSort('name-desc'); setShowSortMenu(false); }}>Tên: Z - A</div>
              </div>
            </div>
          </div>

          <div className="pokemon-grid">
            {filteredPokemon.length > 0 ? (
              filteredPokemon.map(poke => {
                const primaryType = poke.types[0];
                const transColor = TYPE_TRANSLATIONS[primaryType]?.color || '#999';
                
                const cardStyle = {
                  '--card-border-color': `${transColor}25`,
                };

                return (
                  <Link 
                    key={poke.id} 
                    href={`/pokemon/${poke.id}`} 
                    className="pokemon-card" 
                    style={cardStyle}
                  >
                    <div className="card-image-container">
                      <span className="card-pokemon-id">#{poke.id.toString().padStart(4, '0')}</span>
                      <img src={poke.image} alt={poke.name} />
                    </div>
                    <div className="card-info">
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
                      <button className="btn-card-build">
                        <i className="fa-solid fa-chart-column"></i> Build Info
                      </button>
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
          </div>
        </div>

        {/* Sidebar Column */}
        <aside>
          
          {/* Weekly Meta (Screenshot 1) */}
          <div className="sidebar-panel">
            <h4 className="panel-title">
              <i className="fa-solid fa-arrow-trend-up"></i> Weekly Meta
            </h4>
            <div className="meta-list">
              <Link href="/pokemon/25" className="meta-item">
                <div className="meta-icon-wrapper">
                  <i className="fa-solid fa-bolt"></i>
                </div>
                <div className="meta-info">
                  <div className="meta-name">Speed Sweep Pikachu</div>
                  <div className="meta-rank">Master Rank #1</div>
                </div>
                <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}></i>
              </Link>

              <Link href="/pokemon/150" className="meta-item">
                <div className="meta-icon-wrapper" style={{ background: '#fdf2f8', color: '#db2777' }}>
                  <i className="fa-solid fa-eye"></i>
                </div>
                <div className="meta-info">
                  <div className="meta-name">Psystrike Dominance</div>
                  <div className="meta-rank">Ultra Rank #4</div>
                </div>
                <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}></i>
              </Link>

              <Link href="/pokemon/143" className="meta-item">
                <div className="meta-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  <i className="fa-solid fa-shield"></i>
                </div>
                <div className="meta-info">
                  <div className="meta-name">Rocky Helmet Tank</div>
                  <div className="meta-rank">Great Rank #12</div>
                </div>
                <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}></i>
              </Link>
            </div>
            <button className="btn-submit" style={{ background: '#ffffff', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', marginTop: '1.2rem', height: '40px', fontSize: '0.85rem' }} onClick={() => alert('Tính năng Meta Report sắp ra mắt!')}>
              View Full Meta Report
            </button>
          </div>

          {/* Team Builder Promotion (Screenshot 1) */}
          <div className="sidebar-panel" style={{ background: '#252120', color: '#ffffff', border: 'none' }}>
            <h4 className="panel-title" style={{ color: '#ffffff' }}>
              Team Builder
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              Create the ultimate competitive lineup with our AI-powered coverage analyzer.
            </p>
            <Link 
              href="/trainer" 
              className="btn-submit" 
              style={{ 
                background: 'var(--primary-color)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem', 
                textDecoration: 'none', 
                height: '42px', 
                fontSize: '0.9rem' 
              }}
            >
              <i className="fa-solid fa-sliders"></i> Start Building
            </Link>
          </div>

        </aside>

      </div>
    </div>
  );
}
