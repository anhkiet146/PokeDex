'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const TYPE_TRANSLATIONS = {
  normal: { name: 'Normal', color: '#A8A77A' },
  fire: { name: 'Fire', color: '#EE8130' },
  water: { name: 'Water', color: '#6390F0' },
  electric: { name: 'Electric', color: '#F7D02C' },
  grass: { name: 'Grass', color: '#7AC74C' },
  ice: { name: 'Ice', color: '#96D9D6' },
  fighting: { name: 'Fighting', color: '#C22E28' },
  poison: { name: 'Poison', color: '#A33EA1' },
  ground: { name: 'Ground', color: '#E2BF65' },
  flying: { name: 'Flying', color: '#A98FF3' },
  psychic: { name: 'Psychic', color: '#F95587' },
  bug: { name: 'Bug', color: '#A6B91A' },
  rock: { name: 'Rock', color: '#B6A136' },
  ghost: { name: 'Ghost', color: '#735797' },
  dragon: { name: 'Dragon', color: '#6F35FC' },
  steel: { name: 'Steel', color: '#B7B7CE' },
  fairy: { name: 'Fairy', color: '#D685AD' },
  dark: { name: 'Dark', color: '#705746' }
};

const AVATAR_PRESETS = [
  { name: 'Red', url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=60' },
  { name: 'Ash', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60' },
  { name: 'Misty', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60' },
  { name: 'Brock', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60' },
  { name: 'Pikachu', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' },
  { name: 'Eevee', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png' }
];

const getTeamSuggestions = (ownedIds, allPkmn, includeUnowned, format) => {
  if (ownedIds.length === 0 && !includeUnowned) return [];

  // Candidate pool: only owned vs all
  let pool = includeUnowned ? allPkmn : allPkmn.filter(p => ownedIds.includes(p.id));
  
  if (pool.length === 0) return [];

  const selected = [];
  
  // Heuristic roles for battle configurations
  const roles = [
    { name: 'Lead / Hazard Setter', icon: 'fa-flag', check: p => p.types.includes('ground') || p.types.includes('rock') || p.types.includes('steel') },
    { name: 'Physical Sweeper', icon: 'fa-hand-fist', check: p => p.types.includes('fighting') || p.types.includes('dragon') || p.types.includes('bug') || p.types.includes('normal') },
    { name: 'Special Sweeper', icon: 'fa-wand-magic-sparkles', check: p => p.types.includes('psychic') || p.types.includes('fire') || p.types.includes('electric') || p.types.includes('ghost') },
    { name: 'Defensive Wall / Tank', icon: 'fa-shield', check: p => p.types.includes('normal') || p.types.includes('water') || p.types.includes('ice') },
    { name: 'Tactical Support', icon: 'fa-heart', check: p => p.types.includes('poison') || p.types.includes('grass') || p.types.includes('fairy') },
    { name: 'Versatile Utility', icon: 'fa-screwdriver-wrench', check: p => true }
  ];

  const doubleRoles = [
    { name: 'Synergy / Weather', icon: 'fa-cloud-sun-rain', check: p => p.types.includes('water') || p.types.includes('fire') || p.types.includes('rock') },
    { name: 'Tailwind Support', icon: 'fa-wind', check: p => p.types.includes('flying') || p.types.includes('electric') || p.types.includes('psychic') },
    { name: 'Physical Attacker', icon: 'fa-hand-fist', check: p => p.types.includes('fighting') || p.types.includes('dragon') || p.types.includes('steel') },
    { name: 'Special Sweeper', icon: 'fa-wand-magic-sparkles', check: p => p.types.includes('ghost') || p.types.includes('fire') || p.types.includes('ice') },
    { name: 'Redirection / Support', icon: 'fa-circle-plus', check: p => p.types.includes('fairy') || p.types.includes('grass') || p.types.includes('poison') },
    { name: 'Closer Sweeper', icon: 'fa-bolt', check: p => true }
  ];

  const activeRoles = format === 'double' ? doubleRoles : roles;
  const usedIds = new Set();
  
  for (let i = 0; i < 6; i++) {
    const role = activeRoles[i];
    let match = pool.find(p => !usedIds.has(p.id) && role.check(p));
    
    if (!match) {
      match = pool.find(p => !usedIds.has(p.id));
    }
    
    if (match) {
      selected.push({
        ...match,
        roleName: role.name,
        roleIcon: role.icon,
        isOwned: ownedIds.includes(match.id)
      });
      usedIds.add(match.id);
    } else if (includeUnowned) {
      const backup = allPkmn.find(p => !usedIds.has(p.id));
      if (backup) {
        selected.push({
          ...backup,
          roleName: role.name,
          roleIcon: role.icon,
          isOwned: false
        });
        usedIds.add(backup.id);
      }
    }
  }

  return selected;
};

export default function TrainerClient({ initialTrainer, allPokemon }) {
  const [trainer, setTrainer] = useState(initialTrainer);
  const [activeTab, setActiveTab] = useState('profile'); // profile | collection | settings | admin
  
  // Profile edit settings
  const [displayName, setDisplayName] = useState(trainer.displayName);
  const [avatar, setAvatar] = useState(trainer.avatar);
  const [dob, setDob] = useState(trainer.dob ? new Date(trainer.dob).toISOString().split('T')[0] : '');
  const [editSuccess, setEditSuccess] = useState('');
  const [editError, setEditError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Search collection states
  const [pokeSearch, setPokeSearch] = useState('');
  const [collectionSearch, setCollectionSearch] = useState('');

  // Team suggester states
  const [suggestScope, setSuggestScope] = useState('owned'); // owned | all
  const [suggestFormat, setSuggestFormat] = useState('single'); // single | double

  // Admin settings states
  const [adminTrainers, setAdminTrainers] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  const router = useRouter();
  const isAdmin = trainer.username === 'admin' || trainer.role === 'admin';
  const suggestedTeam = getTeamSuggestions(trainer.ownedPokemon, allPokemon, suggestScope === 'all', suggestFormat);

  // Fetch trainers for Admin
  const fetchAdminTrainers = async () => {
    setAdminLoading(true);
    setAdminError('');
    try {
      const res = await fetch('/api/admin/trainers');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch trainers');
      }
      setAdminTrainers(data.trainers || []);
    } catch (err) {
      setAdminError(err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'admin' && isAdmin) {
      fetchAdminTrainers();
    }
  }, [activeTab, isAdmin]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setEditSuccess('');
    setEditError('');
    setProfileLoading(true);

    try {
      const res = await fetch('/api/trainer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, dob, avatar }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setTrainer(data.trainer);
      setEditSuccess('Profile updated successfully!');
      router.refresh();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  // Toggle Owned Pokemon
  const handleTogglePokemon = async (pokemonId, isOwned) => {
    const action = isOwned ? 'remove' : 'add';
    try {
      const res = await fetch('/api/trainer/pokemon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pokemonId, action }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update collection');
      }

      setTrainer(data.trainer);
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete Trainer Account
  const handleDeleteTrainer = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete trainer "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/trainers?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete trainer');
      }
      setAdminTrainers(prev => prev.filter(t => t._id !== id));
      router.refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  // Get Owned Pokemon Detailed Objects
  const ownedPokemonDetails = allPokemon.filter(p => trainer.ownedPokemon.includes(p.id));

  // Filter owned pokemon list for table search
  const filteredOwnedPokemon = ownedPokemonDetails.filter(p => 
    p.name.toLowerCase().includes(collectionSearch.toLowerCase()) || 
    p.id.toString().includes(collectionSearch)
  );

  // Search filter for collection select list
  const filteredSearchPokemon = allPokemon.filter(p => 
    p.name.toLowerCase().includes(pokeSearch.toLowerCase()) || 
    p.id.toString().includes(pokeSearch)
  );

  // Split owned pokemon: First 6 go to active Vanguard Squad, rest in extended collection
  const vanguardSquad = ownedPokemonDetails.slice(0, 6);

  // Helper to calculate mock level based on pokemon id
  const getPokeLevel = (id) => {
    return Math.floor((id * 13) % 41) + 50; // Levels 50 to 90
  };

  return (
    <div className="trainer-layout">
      
      {/* 1. Left Navigation Menu (Screenshot 2) */}
      <aside className="trainer-sidebar-nav">
        <button 
          className={`trainer-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <i className="fa-solid fa-id-card"></i> Trainer Profile
        </button>
        
        {!isAdmin && (
          <button 
            className={`trainer-nav-item ${activeTab === 'collection' ? 'active' : ''}`}
            onClick={() => setActiveTab('collection')}
          >
            <i className="fa-solid fa-circle-nodes"></i> My Pokemon
          </button>
        )}
        
        {!isAdmin && (
          <button 
            className={`trainer-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className="fa-solid fa-sliders"></i> Account Settings
          </button>
        )}

        {isAdmin && (
          <button 
            className={`trainer-nav-item ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <i className="fa-solid fa-users-gear"></i> Manage Accounts
          </button>
        )}
        
        <button 
          className="trainer-nav-item"
          style={{ color: '#ef4444', marginTop: '1.5rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', width: '100%' }}
          onClick={handleLogout}
        >
          <i className="fa-solid fa-right-from-bracket"></i> Logout
        </button>
      </aside>

      {/* 2. Main Content Dashboard */}
      <section>
        
        {/* TRAINER VIEW TAB */}
        {activeTab === 'profile' && (
          <div>
            
            {/* Trainer Profile Card (Screenshot 2) */}
            <div className="trainer-profile-card">
              {isAdmin ? (
                <img src={trainer.avatar} alt={trainer.displayName} className="trainer-card-avatar" />
              ) : (
                <div className="avatar-container" onClick={() => setActiveTab('settings')}>
                  <img src={trainer.avatar} alt={trainer.displayName} className="trainer-card-avatar" />
                  <div className="avatar-overlay">
                    <i className="fa-solid fa-pen-to-square"></i>
                    <span>Change Avatar</span>
                  </div>
                </div>
              )}
              <div className="trainer-card-details">
                <h2>{trainer.displayName}</h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 800, marginTop: '0.15rem' }}>
                  ID: #{(trainer.id || trainer._id || '00000000').substring(0, 8).toUpperCase()}
                </div>
                <div className="trainer-card-meta">
                  <span><i className="fa-solid fa-calendar-days"></i> Joined {trainer.createdAt ? new Date(trainer.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'June 2026'}</span>
                  <span><i className="fa-solid fa-trophy"></i> {isAdmin ? 0 : Math.floor(trainer.ownedPokemon.length * 1.5)} Badges</span>
                  <span><i className="fa-solid fa-file-invoice"></i> {isAdmin ? 0 : trainer.ownedPokemon.length} Entries</span>
                </div>
              </div>
              {!isAdmin && (
                <button className="btn-login" style={{ background: '#ffffff', color: 'var(--text-primary)', border: '1px solid var(--border-color)', height: '40px', padding: '0 1.2rem' }} onClick={() => setActiveTab('settings')}>
                  Edit Profile
                </button>
              )}
            </div>

            {!isAdmin && (
              <>
                {/* Vanguard Squad (Screenshot 2) */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                    <h3 className="trainer-section-title" style={{ marginBottom: 0 }}>
                      <i className="fa-solid fa-users"></i> Vanguard Squad
                    </h3>
                    {ownedPokemonDetails.length > 6 && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>First 6 shown</span>
                    )}
                  </div>

                  {vanguardSquad.length > 0 ? (
                    <div className="vanguard-grid">
                      {vanguardSquad.map(p => {
                        const transColor = TYPE_TRANSLATIONS[p.types[0]]?.color || '#999';
                        const lvl = getPokeLevel(p.id);
                        return (
                          <div key={p.id} className="vanguard-card">
                            <div className="vanguard-header">
                              <span className="vanguard-id">#{p.id.toString().padStart(4, '0')}</span>
                              <span className="vanguard-lvl">Lv. {lvl}</span>
                            </div>
                            
                            <div className="vanguard-body">
                              <img src={p.image} alt={p.name} className="vanguard-img" />
                              <div className="vanguard-info">
                                <h4 className="vanguard-name">{p.name}</h4>
                                <div style={{ display: 'flex', gap: '0.3rem' }}>
                                  {p.types.map(t => {
                                    const trans = TYPE_TRANSLATIONS[t] || { name: t, color: '#999' };
                                    return (
                                      <span key={t} className="type-badge" style={{ backgroundColor: trans.color, fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                        {trans.name}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            <div className="hp-bar-wrapper">
                              <div className="hp-bar-label">
                                <span>HP</span>
                                <span>{lvl * 4} / {lvl * 4}</span>
                              </div>
                              <div className="hp-bar-container">
                                <div className="hp-bar-fill" style={{ width: '100%' }}></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#ffffff', border: '1px dashed var(--border-color)', borderRadius: '16px', marginBottom: '2.5rem' }}>
                      <i className="fa-solid fa-circle-question" style={{ fontSize: '2.5rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', display: 'block' }}></i>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Your active squad is empty. Add Pokémon from the &quot;My Pokemon&quot; tab.</p>
                    </div>
                  )}
                </div>

                {/* Extended Collection Table (Screenshot 2) */}
                <div className="collection-table-card">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className="trainer-section-title" style={{ marginBottom: 0 }}>
                      <i className="fa-solid fa-boxes-stacked"></i> Extended Collection
                    </h3>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <div className="hero-search-wrapper" style={{ margin: 0, maxWidth: '200px' }}>
                        <input 
                          type="text" 
                          className="hero-search-input" 
                          style={{ height: '36px', fontSize: '0.8rem', borderRadius: '8px', padding: '0 0.8rem' }}
                          placeholder="Search collection..."
                          value={collectionSearch}
                          onChange={(e) => setCollectionSearch(e.target.value)}
                        />
                      </div>
                      <button className="filter-btn" style={{ height: '36px', borderRadius: '8px', fontSize: '0.8rem' }} onClick={() => alert('Sorting...')}>
                        Sort by Level
                      </button>
                    </div>
                  </div>

                  {filteredOwnedPokemon.length > 0 ? (
                    <div className="collection-table-wrapper">
                      <table className="collection-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Pokemon</th>
                            <th>Type</th>
                            <th>Level</th>
                            <th>Base Stats</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOwnedPokemon.map((p, idx) => {
                            const lvl = getPokeLevel(p.id);
                            const statSum = p.id * 3 + 400; // Mock stat total sum
                            const percent = Math.min((statSum / 700) * 100, 100);
                            const barColor = idx % 3 === 0 ? '#6390f0' : idx % 3 === 1 ? '#ec4899' : '#10b981'; // blue, pink, green matching screenshot 2
                            
                            return (
                              <tr key={p.id}>
                                <td style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>#{p.id.toString().padStart(4, '0')}</td>
                                <td>
                                  <Link href={`/pokemon/${p.id}`} className="table-pokemon-cell" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <img src={p.image} alt={p.name} className="table-pokemon-img" />
                                    <span className="table-pokemon-name">{p.name}</span>
                                  </Link>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '0.2rem' }}>
                                    {p.types.map(t => {
                                      const trans = TYPE_TRANSLATIONS[t] || { name: t, color: '#999' };
                                      return (
                                        <span key={t} className="type-badge" style={{ backgroundColor: trans.color, fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                          {trans.name}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </td>
                                <td className="table-lvl-cell">{lvl}</td>
                                <td>
                                  <div className="table-stats-bar-wrapper">
                                    <div className="hp-bar-container" style={{ flexGrow: 1, height: '5px' }}>
                                      <div className="hp-bar-fill" style={{ width: `${percent}%`, backgroundColor: barColor }}></div>
                                    </div>
                                    <span className="table-stats-val">{statSum} total</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#f8fafc', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No matching Pokémon in collection.</p>
                    </div>
                  )}
                </div>
              </>
            )}

          </div>
        )}

        {/* MY POKEMON TOGGLE SELECTION TAB */}
        {activeTab === 'collection' && (
          <div className="profile-section" style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem' }}>
            <h3 className="profile-section-title" style={{ fontSize: '1.25rem' }}>
              <i className="fa-solid fa-circle-nodes"></i> Manage Pokémon Collection
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Click on Pokémon to add or remove them from your trainer collection. Changes save automatically.
            </p>

            <div className="hero-search-wrapper" style={{ margin: '0 0 1.5rem 0', maxWidth: '100%' }}>
              <div className="hero-input-container">
                <i className="fa-solid fa-magnifying-glass search-icon"></i>
                <input 
                  type="text" 
                  className="hero-search-input" 
                  style={{ height: '42px', padding: '0 1rem 0 2.5rem' }}
                  placeholder="Search Pokémon..."
                  value={pokeSearch}
                  onChange={(e) => setPokeSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="pokemon-select-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', padding: '0.8rem' }}>
              {filteredSearchPokemon.map(p => {
                const isOwned = trainer.ownedPokemon.includes(p.id);
                return (
                  <div 
                    key={p.id}
                    className={`pokemon-select-card ${isOwned ? 'selected' : ''}`}
                    onClick={() => handleTogglePokemon(p.id, isOwned)}
                    style={{ padding: '0.4rem', border: isOwned ? '2px solid var(--primary-color)' : '1px solid var(--border-color)' }}
                  >
                    <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    <span style={{ fontSize: '0.7rem', textTransform: 'capitalize', fontWeight: 700, display: 'block', marginTop: '0.2rem' }}>{p.name}</span>
                  </div>
                );
              })}
            </div>

            {/* SMART TEAM SUGGESTER SECTION */}
            <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <i className="fa-solid fa-wand-magic-sparkles" style={{ color: 'var(--primary-color)' }}></i> Smart Team Suggester
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Get recommendations for competitive singles or doubles layouts.
                  </p>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                  {/* Pool Filter */}
                  <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.2rem', borderRadius: '8px' }}>
                    <button 
                      type="button"
                      style={{ 
                        padding: '0.4rem 0.8rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        background: suggestScope === 'owned' ? '#ffffff' : 'transparent',
                        color: suggestScope === 'owned' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        boxShadow: suggestScope === 'owned' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                      onClick={() => setSuggestScope('owned')}
                    >
                      Only My Pokemon
                    </button>
                    <button 
                      type="button"
                      style={{ 
                        padding: '0.4rem 0.8rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        background: suggestScope === 'all' ? '#ffffff' : 'transparent',
                        color: suggestScope === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        boxShadow: suggestScope === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                      onClick={() => setSuggestScope('all')}
                    >
                      Include Unowned
                    </button>
                  </div>

                  {/* Battle Format */}
                  <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.2rem', borderRadius: '8px' }}>
                    <button 
                      type="button"
                      style={{ 
                        padding: '0.4rem 0.8rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        background: suggestFormat === 'single' ? '#ffffff' : 'transparent',
                        color: suggestFormat === 'single' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        boxShadow: suggestFormat === 'single' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                      onClick={() => setSuggestFormat('single')}
                    >
                      Single Battle (6v6)
                    </button>
                    <button 
                      type="button"
                      style={{ 
                        padding: '0.4rem 0.8rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        background: suggestFormat === 'double' ? '#ffffff' : 'transparent',
                        color: suggestFormat === 'double' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        boxShadow: suggestFormat === 'double' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                      onClick={() => setSuggestFormat('double')}
                    >
                      Double Battle
                    </button>
                  </div>
                </div>
              </div>

              {/* Suggestions Grid */}
              {suggestedTeam.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                  {suggestedTeam.map((p, idx) => {
                    const primaryType = p.types[0];
                    const transColor = TYPE_TRANSLATIONS[primaryType]?.color || '#999';
                    
                    return (
                      <div 
                        key={`${p.id}-${idx}`} 
                        style={{ 
                          background: p.isOwned ? '#ffffff' : '#f8fafc', 
                          border: `1px solid ${p.isOwned ? 'var(--border-color)' : '#e2e8f0'}`,
                          borderRadius: '16px',
                          padding: '1rem',
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          opacity: p.isOwned ? 1 : 0.7,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
                          transition: 'all 0.2s'
                        }}
                      >
                        {/* Owned / Suggestion badge */}
                        <span 
                          style={{ 
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            fontSize: '0.6rem',
                            padding: '0.15rem 0.4rem',
                            borderRadius: '4px',
                            fontWeight: 800,
                            background: p.isOwned ? '#dcfce7' : '#fee2e2',
                            color: p.isOwned ? '#15803d' : '#b91c1c'
                          }}
                        >
                          {p.isOwned ? 'Owned' : 'Catch Rec.'}
                        </span>

                        <img src={p.image} alt={p.name} style={{ width: '60px', height: '60px', objectFit: 'contain', marginBottom: '0.5rem' }} />
                        
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'capitalize', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                          {p.name}
                        </h4>

                        <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.6rem' }}>
                          {p.types.map(t => (
                            <span 
                              key={t} 
                              className="type-badge" 
                              style={{ 
                                backgroundColor: TYPE_TRANSLATIONS[t]?.color || '#999', 
                                fontSize: '0.55rem', 
                                padding: '0.05rem 0.25rem', 
                                borderRadius: '3px' 
                              }}
                            >
                              {TYPE_TRANSLATIONS[t]?.name || t}
                            </span>
                          ))}
                        </div>

                        {/* Assigned Role */}
                        <div 
                          style={{ 
                            marginTop: 'auto',
                            width: '100%',
                            background: '#f1f5f9',
                            borderRadius: '8px',
                            padding: '0.35rem',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <i className={`fa-solid ${p.roleIcon}`}></i>
                          <span>{p.roleName}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
                  <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: '2rem', color: '#cbd5e1', marginBottom: '0.8rem', display: 'block' }}></i>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Add Pokémon to your collection above to receive smart team suggestions.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACCOUNT SETTINGS EDIT TAB */}
        {activeTab === 'settings' && (
          <div className="profile-section" style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem' }}>
            <h3 className="profile-section-title" style={{ fontSize: '1.25rem' }}>
              <i className="fa-solid fa-user-gear"></i> Trainer Profile Settings
            </h3>

            {editSuccess && (
              <div style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.3)', color: '#4ade80', padding: '0.8rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa-solid fa-circle-check"></i>
                <span>{editSuccess}</span>
              </div>
            )}

            {editError && (
              <div className="form-error" style={{ marginBottom: '1.2rem' }}>
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label htmlFor="editDisplayName">Trainer Name</label>
                <input 
                  type="text" 
                  id="editDisplayName"
                  className="form-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>

              {/* Avatar Presets Grid */}
              <div className="form-group">
                <label>Choose Avatar Preset</label>
                <div className="avatar-presets-grid">
                  {AVATAR_PRESETS.map((preset) => (
                    <div 
                      key={preset.name}
                      className={`avatar-preset-item ${avatar === preset.url ? 'selected' : ''}`}
                      onClick={() => setAvatar(preset.url)}
                    >
                      <img src={preset.url} alt={preset.name} className="avatar-preset-img" />
                      <span className="avatar-preset-name">{preset.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="editAvatar">Or Custom Avatar Image URL</label>
                <input 
                  type="url" 
                  id="editAvatar"
                  className="form-input"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="Enter custom image URL..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="editDob">Date of Birth</label>
                <input 
                  type="date" 
                  id="editDob"
                  className="form-input"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn-submit"
                disabled={profileLoading}
                style={{ width: 'auto', padding: '0 2rem' }}
              >
                {profileLoading ? 'Updating...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* ADMIN TAB */}
        {activeTab === 'admin' && isAdmin && (
          <div className="collection-table-card">
            <div style={{ marginBottom: '1rem' }}>
              <h3 className="trainer-section-title" style={{ marginBottom: '0.4rem' }}>
                <i className="fa-solid fa-users-gear"></i> Manage Trainer Accounts
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                As an administrator, you can view registered trainer accounts and delete inactive or non-compliant users.
              </p>
            </div>

            {adminLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}></i>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading accounts...</p>
              </div>
            ) : adminError ? (
              <div className="form-error" style={{ marginBottom: '1.2rem' }}>
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>{adminError}</span>
              </div>
            ) : adminTrainers.length > 0 ? (
              <div className="collection-table-wrapper">
                <table className="collection-table">
                  <thead>
                    <tr>
                      <th>Avatar</th>
                      <th>Username</th>
                      <th>Trainer Name</th>
                      <th>Role</th>
                      <th>Owned Pokemon</th>
                      <th>Joined Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminTrainers.map(t => (
                      <tr key={t._id}>
                        <td>
                          <img 
                            src={t.avatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60'} 
                            alt={t.displayName} 
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }} 
                          />
                        </td>
                        <td style={{ fontWeight: 700 }}>{t.username}</td>
                        <td>{t.displayName}</td>
                        <td>
                          <span 
                            style={{ 
                              fontSize: '0.75rem', 
                              padding: '0.2rem 0.5rem', 
                              borderRadius: '6px', 
                              fontWeight: 700, 
                              background: t.role === 'admin' ? 'var(--primary-light)' : '#f1f5f9', 
                              color: t.role === 'admin' ? 'var(--primary-color)' : 'var(--text-secondary)' 
                            }}
                          >
                            {t.role || 'user'}
                          </span>
                        </td>
                        <td>{t.ownedPokemon ? t.ownedPokemon.length : 0} Pokémon</td>
                        <td>{new Date(t.createdAt).toLocaleDateString('en-US')}</td>
                        <td>
                          <button
                            className="btn-delete-user"
                            onClick={() => handleDeleteTrainer(t._id, t.displayName)}
                            disabled={t.username === 'admin' || t.role === 'admin' || t.username === trainer.username}
                          >
                            <i className="fa-solid fa-trash-can"></i> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No trainer accounts found.</p>
              </div>
            )}
          </div>
        )}

      </section>
      
    </div>
  );
}

