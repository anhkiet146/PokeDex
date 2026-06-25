import Link from 'next/link';
import dbConnect from '@/lib/db';
import Build from '@/lib/models/Build';
import { getSession } from '@/lib/auth';
import { getPokemonList } from '@/lib/pokemon';
import SubmitBuildForm from './SubmitBuildForm';

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

const STATS_MAP_V3 = {
  'hp': { name: 'HP', color: '#ef4444' }, // Red
  'attack': { name: 'ATK', color: '#f59e0b' }, // Orange/Yellow
  'defense': { name: 'DEF', color: '#ef4444' }, // Red
  'special-attack': { name: 'SPA', color: '#10b981' }, // Green
  'special-defense': { name: 'SPD', color: '#ef4444' }, // Red
  'speed': { name: 'SPE', color: '#f59e0b' } // Orange/Yellow
};

async function getPokemonDetail(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!res.ok) throw new Error('Pokemon not found');
  const detail = await res.json();
  return {
    id: detail.id,
    name: detail.name,
    image: detail.sprites.other['official-artwork'].front_default || detail.sprites.front_default,
    types: detail.types.map(t => t.type.name),
    height: detail.height,
    weight: detail.weight,
    abilities: detail.abilities.map(a => a.ability.name),
    stats: detail.stats.map(s => ({ name: s.stat.name, value: s.base_stat }))
  };
}

async function getPokemonSpecies(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
  if (!res.ok) throw new Error('Pokemon species not found');
  return await res.json();
}

async function getEvolutionChain(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Evolution chain not found');
  return await res.json();
}

function parseEvolutionChain(chain) {
  const list = [];
  let current = chain;
  
  while (current) {
    const name = current.species.name;
    const urlParts = current.species.url.split('/').filter(Boolean);
    const id = parseInt(urlParts[urlParts.length - 1]);
    const image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    list.push({ id, name, image });
    current = current.evolves_to[0];
  }
  
  return list;
}

export default async function PokemonDetailPage({ params }) {
  const { id } = await params;
  const pokemonId = Number(id);

  try {
    // 1. Fetch cached list first to optimize speed (no API fetch needed for basic details!)
    const pokemonList = await getPokemonList();
    const cachedPoke = pokemonList.find(p => p.id === pokemonId);
    
    // Fetch parallel APIs
    const [pokemon, species, session] = await Promise.all([
      cachedPoke ? Promise.resolve(cachedPoke) : getPokemonDetail(pokemonId),
      getPokemonSpecies(pokemonId),
      getSession()
    ]);

    // Fetch database custom builds
    await dbConnect();
    const builds = await Build.find({ pokemonId }).sort({ createdAt: -1 });

    // Fetch evolution details
    const evoData = await getEvolutionChain(species.evolution_chain.url);
    const evoChain = parseEvolutionChain(evoData.chain);

    // Filter description (English flavor text)
    let description = 'No description available in English.';
    const engEntry = species.flavor_text_entries.find(entry => entry.language.name === 'en');
    if (engEntry) {
      description = engEntry.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ');
    }

    const primaryType = pokemon.types[0];
    const transColor = TYPE_TRANSLATIONS[primaryType]?.color || '#999';
    const detailHeaderStyle = {
      '--modal-theme-color': transColor,
      '--modal-header-color': `${transColor}20`,
    };

    // Mock competitive info for visual matches
    const tier = pokemon.id <= 3 ? 'TIER: OU/Uber' : pokemon.id <= 15 ? 'TIER: UU/OU' : 'TIER: RU/NU';
    const primaryAbility = pokemon.abilities[0] || 'Inner Focus';
    const heldItem = pokemon.types.includes('fire') ? 'Life Orb' : 'Leftovers';
    const nature = pokemon.stats[5]?.value > 90 ? 'Timid' : 'Adamant';
    const evSpread = pokemon.stats[1]?.value > pokemon.stats[3]?.value 
      ? '252 Atk / 4 SpD / 252 Spe' 
      : '252 SpA / 4 SpD / 252 Spe';

    const mockMoves = [
      { name: 'Nasty Plot', desc: 'Boosts Special Attack by 2 stages. Use on forced switches to setup for a sweep.', type: 'dark', category: 'status' },
      { name: 'Aura Sphere', desc: 'High-accuracy Fighting STAB. Never misses. Perfect for hitting Steel and Normal types.', type: 'fighting', category: 'special' },
      { name: 'Flash Cannon', desc: 'Secondary STAB. Coverage for Fairy and Ice types. 10% chance to lower SpD.', type: 'steel', category: 'special' },
      { name: 'Vacuum Wave', desc: 'Vital priority move. Clean up weakened faster threats before they can hit.', type: 'fighting', category: 'special' }
    ];

    const mockTeammates = [
      { id: 149, name: 'Dragonite', role: 'Wall Breaker / Multi-Scale' },
      { id: 445, name: 'Garchomp', role: 'Stealth Rock Setter' },
      { id: 637, name: 'Volcarona', role: 'Quiver Dance Sweeper' }
    ];

    return (
      <main className="app-container" style={detailHeaderStyle}>
        
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 700 }}>
            <i className="fa-solid fa-arrow-left"></i> Back to Homepage
          </Link>
        </div>

        {/* 1. Pokémon Name and tags header (Screenshot 3) */}
        <section className="detail-header-card">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
            National Dex #{pokemon.id.toString().padStart(4, '0')}
          </span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, textTransform: 'capitalize', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            {pokemon.name}
          </h2>
          <div className="detail-meta-tags">
            {pokemon.types.map(t => {
              const trans = TYPE_TRANSLATIONS[t] || { name: t, color: '#999' };
              return (
                <span key={t} className="type-badge" style={{ backgroundColor: trans.color }}>
                  {trans.name}
                </span>
              );
            })}
            <span className="detail-tier-badge">{tier}</span>
          </div>
        </section>

        {/* 2. Detail Two-Column Layout (Screenshot 3) */}
        <div className="detail-layout-grid">
          
          {/* Main Stats and Builds Column */}
          <div className="detail-main-info">
            
            {/* Description Card */}
            <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                {description}
              </p>
            </div>

            {/* Base Stats Analysis */}
            <div className="stats-card-v3">
              <h3 className="trainer-section-title" style={{ fontSize: '1.15rem', marginBottom: '1.2rem' }}>
                <i className="fa-solid fa-chart-column"></i> Base Stats Analysis
              </h3>
              <div className="stats-grid-v3">
                {pokemon.stats.map(s => {
                  const statConfig = STATS_MAP_V3[s.name] || { name: s.name, color: '#6b7280' };
                  const percent = Math.min((s.value / 150) * 100, 100);
                  return (
                    <div key={s.name} className="stat-row-v3">
                      <span className="stat-name-v3">{statConfig.name}</span>
                      <span className="stat-value-v3">{s.value}</span>
                      <div className="stat-bar-container-v3">
                        <div className="stat-bar-fill-v3" style={{ width: `${percent}%`, backgroundColor: statConfig.color }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Standard Build Panel (4 Grid Cards) */}
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Standard Special Attacker / Nasty Plot
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
                Current Meta Competitive Build - Gen 9
              </p>
              
              <div className="standard-build-grid">
                <div className="build-feature-card">
                  <i className="fa-solid fa-bolt build-feature-icon"></i>
                  <span className="build-feature-label">Ability</span>
                  <span className="build-feature-value" style={{ textTransform: 'capitalize' }}>
                    {primaryAbility.replace('-', ' ')}
                  </span>
                </div>
                <div className="build-feature-card">
                  <i className="fa-solid fa-bag-shopping build-feature-icon" style={{ color: '#ec4899' }}></i>
                  <span className="build-feature-label">Held Item</span>
                  <span className="build-feature-value">{heldItem}</span>
                </div>
                <div className="build-feature-card">
                  <i className="fa-solid fa-compass build-feature-icon" style={{ color: '#06b6d4' }}></i>
                  <span className="build-feature-label">Nature</span>
                  <span className="build-feature-value">{nature}</span>
                </div>
                <div className="build-feature-card">
                  <i className="fa-solid fa-chart-line build-feature-icon" style={{ color: '#10b981' }}></i>
                  <span className="build-feature-label">EV Spread</span>
                  <span className="build-feature-value" style={{ fontSize: '0.75rem' }}>{evSpread}</span>
                </div>
              </div>
            </div>

            {/* Moveset Grid (2x2 Grid) */}
            <div className="moveset-grid-v3">
              {mockMoves.map((m, idx) => {
                const typeColor = TYPE_TRANSLATIONS[m.type]?.color || '#999';
                return (
                  <div key={m.name} className="move-card-v3">
                    <div className="move-icon-indicator">
                      <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>M{idx + 1}</span>
                    </div>
                    <div className="move-body-v3">
                      <div className="move-header-v3">
                        <span className="move-name-v3">{m.name}</span>
                      </div>
                      <p className="move-desc-v3">{m.desc}</p>
                      <div className="move-badges-v3">
                        <span className="move-badge-v3" style={{ background: `${typeColor}15`, color: typeColor }}>
                          {m.type}
                        </span>
                        <span className="move-badge-v3" style={{ background: '#f3f4f6', color: 'var(--text-secondary)' }}>
                          {m.category}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column: Floating Artwork & Synergistic Teammates */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Image Card */}
            <div className="detail-floating-image-container">
              <img 
                src={pokemon.image} 
                alt={pokemon.name} 
                className="detail-floating-image"
              />
            </div>

            {/* Evolution Chain */}
            {evoChain.length > 1 && (
              <div className="stats-card-v3" style={{ padding: '1.2rem' }}>
                <h3 className="trainer-section-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                  <i className="fa-solid fa-dna"></i> Evolution Chain
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  {evoChain.map((evo, idx) => (
                    <div key={evo.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <Link href={`/pokemon/${evo.id}`} style={{ textDecoration: 'none', color: 'inherit', textAlign: 'center' }}>
                        <div style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          background: 'rgba(0,0,0,0.02)',
                          border: '1px solid rgba(0,0,0,0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 0.3rem'
                        }}>
                          <img src={evo.image} alt={evo.name} style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'capitalize', display: 'block' }}>
                          {evo.name}
                        </span>
                      </Link>
                      {idx < evoChain.length - 1 && (
                        <i className="fa-solid fa-arrow-right" style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}></i>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Synergistic Teammates */}
            <div className="synergy-section-v3" style={{ marginTop: '0.5rem' }}>
              <h3 className="trainer-section-title" style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>
                <i className="fa-solid fa-users-viewfinder"></i> Synergistic Teammates
              </h3>
              
              <div className="synergy-grid-v3" style={{ gridTemplateColumns: '1fr', marginTop: '0.5rem' }}>
                {mockTeammates.map(t => (
                  <Link 
                    key={t.id}
                    href={`/pokemon/${t.id}`}
                    className="synergy-card-v3"
                  >
                    <img 
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${t.id}.png`} 
                      alt={t.name} 
                      className="synergy-img-v3"
                    />
                    <div className="synergy-info-v3">
                      <div className="synergy-name-v3">{t.name}</div>
                      <span className="synergy-role-v3">{t.role}</span>
                    </div>
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}></i>
                  </Link>
                ))}
              </div>
            </div>

          </aside>

        </div>

        {/* 3. Community Builds & Submission Form */}
        <section className="profile-section" style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', marginTop: '3rem' }}>
          <h3 className="trainer-section-title" style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>
            <i className="fa-solid fa-shield-halved"></i> Community Contributions
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {builds.length > 0 ? (
              builds.map(build => (
                <div key={build._id.toString()} className="build-card" style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.2rem' }}>
                  <div className="build-header">
                    <div>
                      <h4 className="build-title" style={{ fontSize: '1.1rem' }}>{build.buildTitle}</h4>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginTop: '0.15rem' }}>
                        Posted: {new Date(build.createdAt).toLocaleDateString('en-US')}
                      </span>
                    </div>
                    <span className="build-author" style={{ fontSize: '0.75rem' }}>Author: {build.trainerName}</span>
                  </div>

                  <div className="build-meta-grid" style={{ background: '#ffffff', border: '1px solid var(--border-color)' }}>
                    <div className="build-meta-item">
                      <span className="build-meta-label">Held Item</span>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{build.item || 'None'}</span>
                    </div>
                    <div className="build-meta-item">
                      <span className="build-meta-label">Nature</span>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{build.nature || 'None'}</span>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <span className="build-meta-label">Moveset</span>
                    <div className="build-moves">
                      {build.moves.map(move => (
                        <span key={move} className="build-move-badge" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>{move}</span>
                      ))}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <span className="build-meta-label">Chi tiết & lối chơi</span>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
                      {build.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#f8fafc', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
                <i className="fa-regular fa-folder-open" style={{ fontSize: '2.2rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', display: 'block' }}></i>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>No community builds submitted yet.</p>
              </div>
            )}

            {/* Build submission container */}
            {session ? (
              <SubmitBuildForm pokemonId={pokemonId} trainer={session} />
            ) : (
              <div style={{
                background: 'var(--primary-light)',
                border: '1px solid rgba(184, 35, 28, 0.15)',
                borderRadius: '16px',
                padding: '1.2rem',
                textAlign: 'center',
                marginTop: '1rem'
              }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Please <Link href="/login" style={{ color: 'var(--primary-color)', fontWeight: 700, textDecoration: 'none' }}>log in</Link> to contribute your competitive build guides.
                </p>
              </div>
            )}

          </div>
        </section>

      </main>
    );

  } catch (error) {
    console.error('Pokemon Details Page Error:', error);
    return (
      <main className="app-container">
        <div className="error-container">
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '3rem', color: '#ff4a5a', marginBottom: '1rem' }}></i>
          <h2>Pokémon Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>The Pokémon with ID #{id} could not be found or loaded.</p>
          <Link href="/" className="btn-login" style={{ display: 'inline-block', marginTop: '1.5rem' }}>Back to Homepage</Link>
        </div>
      </main>
    );
  }
}
