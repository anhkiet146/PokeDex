'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPokemonName, groupPokemonWithMegaVariants } from '@/lib/competitive';

const TYPE_TRANSLATIONS = {
  normal: { name: 'Normal', color: '#A8A77A', light: '#f6f6f1' },
  fire: { name: 'Fire', color: '#EE8130', light: '#fdf3eb' },
  water: { name: 'Water', color: '#6390F0', light: '#eff4fe' },
  electric: { name: 'Electric', color: '#F7D02C', light: '#fefaf0' },
  grass: { name: 'Grass', color: '#7AC74C', light: '#f2faf0' },
  ice: { name: 'Ice', color: '#96D9D6', light: '#f5fafb' },
  fighting: { name: 'Fighting', color: '#C22E28', light: '#fcf0ef' },
  poison: { name: 'Poison', color: '#A33EA1', light: '#faf0fa' },
  ground: { name: 'Ground', color: '#E2BF65', light: '#faf8f0' },
  flying: { name: 'Flying', color: '#A98FF3', light: '#f6f4fe' },
  psychic: { name: 'Psychic', color: '#F95587', light: '#fef0f4' },
  bug: { name: 'Bug', color: '#A6B91A', light: '#fafbf0' },
  rock: { name: 'Rock', color: '#B6A136', light: '#faf9f0' },
  ghost: { name: 'Ghost', color: '#735797', light: '#f4eff7' },
  dragon: { name: 'Dragon', color: '#6F35FC', light: '#f3efff' },
  steel: { name: 'Steel', color: '#B7B7CE', light: '#f7f7fa' },
  fairy: { name: 'Fairy', color: '#D685AD', light: '#fef3f7' },
  dark: { name: 'Dark', color: '#705746', light: '#f4f1f0' }
};

const TYPE_ICONS = {
  normal: 'fa-circle-dot',
  fire: 'fa-fire',
  water: 'fa-droplet',
  grass: 'fa-leaf',
  electric: 'fa-bolt',
  psychic: 'fa-brain',
  ice: 'fa-snowflake',
  dragon: 'fa-dragon',
  ghost: 'fa-ghost',
  steel: 'fa-shield-halved',
  bug: 'fa-bug',
  rock: 'fa-gem',
  ground: 'fa-mountain',
  poison: 'fa-skull-crossbones',
  flying: 'fa-wind',
  fairy: 'fa-wand-magic-sparkles',
  dark: 'fa-moon',
  fighting: 'fa-hand-fist'
};

const PAGE_SIZE = 9;

export default function PokemonListClient({ initialPokemon }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [currentSort, setCurrentSort] = useState('id-asc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [page, setPage] = useState(1);

  // Reset to page 1 when search/type/sort changes
  useEffect(() => { setPage(1); }, [searchQuery, selectedType, currentSort]);

  const orderedPokemon = groupPokemonWithMegaVariants(initialPokemon);
  const uniqueTypes = Array.from(new Set(orderedPokemon.flatMap(p => p.types))).sort();

  const filteredPokemon = orderedPokemon.filter(poke => {
    const displayName = formatPokemonName(poke.name).toLowerCase();
    const normalizedSearch = searchQuery.toLowerCase();
    const matchesSearch = poke.name.toLowerCase().includes(normalizedSearch) ||
                          displayName.includes(normalizedSearch) ||
                          poke.id.toString().includes(searchQuery);
    const matchesType = selectedType === 'all' || poke.types.includes(selectedType);
    return matchesSearch && matchesType;
  });

  if (currentSort === 'id-asc') {
    filteredPokemon.sort((a, b) => {
      const indexA = orderedPokemon.findIndex(p => p.name === a.name);
      const indexB = orderedPokemon.findIndex(p => p.name === b.name);
      return indexA - indexB;
    });
  }
  else if (currentSort === 'id-desc') filteredPokemon.sort((a, b) => b.id - a.id);
  else if (currentSort === 'name-asc') filteredPokemon.sort((a, b) => formatPokemonName(a.name).localeCompare(formatPokemonName(b.name)));
  else if (currentSort === 'name-desc') filteredPokemon.sort((a, b) => formatPokemonName(b.name).localeCompare(formatPokemonName(a.name)));

  const totalPages = Math.max(1, Math.ceil(filteredPokemon.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagePokemon = filteredPokemon.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const getSortLabel = () => {
    switch (currentSort) {
      case 'id-asc': return 'ID: Ascending';
      case 'id-desc': return 'ID: Descending';
      case 'name-asc': return 'Name: A → Z';
      case 'name-desc': return 'Name: Z → A';
      default: return 'ID: Ascending';
    }
  };

  return (
    <div onClick={() => setShowSortMenu(false)}>
      {/* Hero Banner */}
      <section className="hero-banner">
        <h2>Find Your Perfect Team</h2>
        <p>
          Access detailed competitive data, move sets, and stats for {initialPokemon.length}+ Pokémon including Mega Evolutions.
        </p>
        <div className="hero-search-wrapper" onClick={(e) => e.stopPropagation()}>
          <div className="hero-input-container">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              className="hero-search-input"
              placeholder="Enter Pokémon Name or #ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-scan" onClick={() => setSearchQuery('')}>
            Clear
          </button>
        </div>
      </section>

      {/* Browse by Type */}
      <section className="type-filter-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
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
            return (
              <div
                key={type}
                className={`type-circle-card ${isActive ? 'active' : ''}`}
                style={{ '--theme-type-color': trans.color, '--theme-type-light': trans.light }}
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

      {/* Main layout */}
      <div className="home-layout">
        <div>
          {/* Title + Sort */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Discover Pokémon</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                {filteredPokemon.length} results · Page {safePage} of {totalPages}
              </p>
            </div>
            <div className="dropdown-filter" onClick={(e) => e.stopPropagation()}>
              <button className="filter-btn" onClick={() => setShowSortMenu(!showSortMenu)}>
                <span>{getSortLabel()}</span>
                <i className="fa-solid fa-sort" style={{ marginLeft: '0.25rem' }}></i>
              </button>
              <div className={`dropdown-menu ${showSortMenu ? 'show' : ''}`} style={{ right: 0 }}>
                {['id-asc', 'id-desc', 'name-asc', 'name-desc'].map(s => (
                  <div
                    key={s}
                    className={`dropdown-item ${currentSort === s ? 'active' : ''}`}
                    onClick={() => { setCurrentSort(s); setShowSortMenu(false); }}
                  >
                    {{ 'id-asc': 'ID: Ascending', 'id-desc': 'ID: Descending', 'name-asc': 'Name: A → Z', 'name-desc': 'Name: Z → A' }[s]}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pokemon Grid */}
          <div className="pokemon-grid">
            {pagePokemon.length > 0 ? (
              pagePokemon.map(poke => {
                const primaryType = poke.types[0];
                const transColor = TYPE_TRANSLATIONS[primaryType]?.color || '#999';
                return (
                  <Link
                    key={`${poke.id}-${poke.name}`}
                    href={`/pokemon/${poke.id}`}
                    className="pokemon-card"
                    style={{ '--card-border-color': `${transColor}25` }}
                  >
                    <div className="card-image-container">
                      <span className="card-pokemon-id">#{poke.id.toString().padStart(4, '0')}</span>
                      {poke.isMega && (
                        <span style={{
                          position: 'absolute', top: '0.4rem', right: '0.4rem',
                          background: 'linear-gradient(135deg, #6F35FC, #ec4899)',
                          color: '#fff', fontSize: '0.55rem', fontWeight: 800,
                          padding: '0.15rem 0.4rem', borderRadius: '6px', letterSpacing: '0.05em'
                        }}>MEGA</span>
                      )}
                      <img src={poke.image} alt={poke.name} />
                    </div>
                    <div className="card-info">
                      <h3 className="card-pokemon-name">{formatPokemonName(poke.name)}</h3>
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
                <h3 style={{ fontSize: '1.4rem' }}>No Pokémon Found</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Try searching with a different keyword or adjusting the filters.</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.5rem', marginTop: '2rem', flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setPage(1)}
                disabled={safePage === 1}
                style={{
                  padding: '0.45rem 0.8rem', border: '1px solid var(--border-color)',
                  borderRadius: '8px', background: safePage === 1 ? '#f1f5f9' : '#fff',
                  color: safePage === 1 ? '#94a3b8' : 'var(--text-primary)',
                  cursor: safePage === 1 ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.8rem'
                }}
              >
                «
              </button>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                style={{
                  padding: '0.45rem 1rem', border: '1px solid var(--border-color)',
                  borderRadius: '8px', background: safePage === 1 ? '#f1f5f9' : '#fff',
                  color: safePage === 1 ? '#94a3b8' : 'var(--text-primary)',
                  cursor: safePage === 1 ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.85rem'
                }}
              >
                ‹ Prev
              </button>

              {/* Page number bubbles */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 2)
                .reduce((acc, n, idx, arr) => {
                  if (idx > 0 && n - arr[idx - 1] > 1) acc.push('...');
                  acc.push(n);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === '...' ? (
                    <span key={`dots-${idx}`} style={{ padding: '0 0.3rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      style={{
                        width: '36px', height: '36px', border: '1px solid',
                        borderColor: safePage === item ? 'var(--primary-color)' : 'var(--border-color)',
                        borderRadius: '8px',
                        background: safePage === item ? 'var(--primary-color)' : '#fff',
                        color: safePage === item ? '#fff' : 'var(--text-primary)',
                        fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                style={{
                  padding: '0.45rem 1rem', border: '1px solid var(--border-color)',
                  borderRadius: '8px', background: safePage === totalPages ? '#f1f5f9' : '#fff',
                  color: safePage === totalPages ? '#94a3b8' : 'var(--text-primary)',
                  cursor: safePage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.85rem'
                }}
              >
                Next ›
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={safePage === totalPages}
                style={{
                  padding: '0.45rem 0.8rem', border: '1px solid var(--border-color)',
                  borderRadius: '8px', background: safePage === totalPages ? '#f1f5f9' : '#fff',
                  color: safePage === totalPages ? '#94a3b8' : 'var(--text-primary)',
                  cursor: safePage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.8rem'
                }}
              >
                »
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside>
          <div className="sidebar-panel">
            <h4 className="panel-title">
              <i className="fa-solid fa-arrow-trend-up"></i> Weekly Meta
            </h4>
            <div className="meta-list">
              <Link href="/pokemon/25" className="meta-item">
                <div className="meta-icon-wrapper"><i className="fa-solid fa-bolt"></i></div>
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
            <button className="btn-submit" style={{ background: '#ffffff', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', marginTop: '1.2rem', height: '40px', fontSize: '0.85rem' }} onClick={() => alert('Meta Report feature coming soon!')}>
              View Full Meta Report
            </button>
          </div>

          <div className="sidebar-panel" style={{ background: '#252120', color: '#ffffff', border: 'none' }}>
            <h4 className="panel-title" style={{ color: '#ffffff' }}>Team Builder</h4>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              Create the ultimate competitive lineup with our AI-powered coverage analyzer.
            </p>
            <Link
              href="/trainer"
              className="btn-submit"
              style={{ background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none', height: '42px', fontSize: '0.9rem' }}
            >
              <i className="fa-solid fa-sliders"></i> Start Building
            </Link>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer style={{
        marginTop: '4rem',
        borderTop: '1px solid var(--border-color)',
        padding: '2.5rem 1rem',
        textAlign: 'center',
        background: '#fafbfc'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
          <div style={{
            width: '28px', height: '28px',
            background: 'linear-gradient(to bottom, var(--primary-color) 50%, #fff 50%)',
            borderRadius: '50%', border: '2.5px solid var(--text-primary)'
          }}></div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            Poké<span style={{ color: 'var(--primary-color)' }}>dex</span>
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
          Pokémon data sourced from <a href="https://pokeapi.co" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>PokéAPI</a> and referenced from <a href="https://www.smogon.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Smogon University</a>.
        </p>
        <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          © {new Date().getFullYear()} Pokédex. Pokémon and all related names are trademarks of Nintendo / Game Freak. This is a fan-made project, not affiliated with or endorsed by The Pokémon Company.
        </p>
      </footer>
    </div>
  );
}
