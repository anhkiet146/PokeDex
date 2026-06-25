'use client';

import { useState } from 'react';
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

export default function TrainerClient({ initialTrainer, allPokemon }) {
  const [trainer, setTrainer] = useState(initialTrainer);
  const [activeTab, setActiveTab] = useState('profile'); // profile | collection | settings
  
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

  const router = useRouter();

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
        <button 
          className={`trainer-nav-item ${activeTab === 'collection' ? 'active' : ''}`}
          onClick={() => setActiveTab('collection')}
        >
          <i className="fa-solid fa-circle-nodes"></i> My Pokemon
        </button>
        <button 
          className={`trainer-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <i className="fa-solid fa-sliders"></i> Account Settings
        </button>
        
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
              <img src={trainer.avatar} alt={trainer.displayName} className="trainer-card-avatar" />
              <div className="trainer-card-details">
                <h2>{trainer.displayName}</h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 800, marginTop: '0.15rem' }}>
                  ID: #{(trainer.id || '0000').substring(0, 8).toUpperCase()}
                </div>
                <div className="trainer-card-meta">
                  <span><i className="fa-solid fa-calendar-days"></i> Joined {trainer.createdAt ? new Date(trainer.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'June 2026'}</span>
                  <span><i className="fa-solid fa-trophy"></i> {Math.floor(trainer.ownedPokemon.length * 1.5)} Badges</span>
                  <span><i className="fa-solid fa-file-invoice"></i> {trainer.ownedPokemon.length} Entries</span>
                </div>
              </div>
              <button className="btn-login" style={{ background: '#ffffff', color: 'var(--text-primary)', border: '1px solid var(--border-color)', height: '40px', padding: '0 1.2rem' }} onClick={() => setActiveTab('settings')}>
                Edit Profile
              </button>
            </div>

            {/* Vanguard Squad (Screenshot 2) */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifycontent: 'space-between', alignitems: 'center', marginBottom: '1.2rem' }}>
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
                    const primaryType = p.types[0];
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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifycontent: 'space-between', alignitems: 'center', marginBottom: '1rem' }}>
                <h3 className="trainer-section-title" style={{ marginBottom: 0 }}>
                  <i className="fa-solid fa-boxes-stacked"></i> Extended Collection
                </h3>
                
                <div style={{ display: 'flex', gap: '0.5rem', alignitems: 'center' }}>
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

            <div className="pokemon-select-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', maxHeight: '420px', background: '#f8fafc', padding: '1rem' }}>
              {filteredSearchPokemon.map(p => {
                const isOwned = trainer.ownedPokemon.includes(p.id);
                return (
                  <div 
                    key={p.id}
                    className={`pokemon-select-card ${isOwned ? 'selected' : ''}`}
                    onClick={() => handleTogglePokemon(p.id, isOwned)}
                    style={{ background: '#ffffff', borderRadius: '12px', border: isOwned ? '2px solid var(--primary-color)' : '1px solid var(--border-color)' }}
                  >
                    <img src={p.image} alt={p.name} style={{ width: '50px', height: '50px' }} />
                    <span style={{ fontSize: '0.75rem', textTransform: 'capitalize', fontWeight: 700, display: 'block' }}>{p.name}</span>
                  </div>
                );
              })}
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

              <div className="form-group">
                <label htmlFor="editAvatar">Avatar Image URL</label>
                <input 
                  type="url" 
                  id="editAvatar"
                  className="form-input"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="Enter avatar image URL..."
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

      </section>
      
    </div>
  );
}
