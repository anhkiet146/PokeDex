import Link from 'next/link';
import dbConnect from '@/lib/db';
import Build from '@/lib/models/Build';
import { getSession } from '@/lib/auth';
import SubmitBuildForm from './SubmitBuildForm';

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
  return await res.json();
}

async function getPokemonSpecies(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
  if (!res.ok) throw new Error('Pokemon species not found');
  return await res.json();
}

export default async function PokemonDetailPage({ params }) {
  const { id } = await params;
  const pokemonId = Number(id);

  try {
    // Fetch parallel APIs
    const [pokemon, species, session] = await Promise.all([
      getPokemonDetail(pokemonId),
      getPokemonSpecies(pokemonId),
      getSession()
    ]);

    // Fetch database custom builds
    await dbConnect();
    const builds = await Build.find({ pokemonId }).sort({ createdAt: -1 });

    // Filter description
    let description = 'Không có mô tả chi tiết.';
    const engEntry = species.flavor_text_entries.find(entry => entry.language.name === 'en');
    if (engEntry) {
      description = engEntry.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ');
    }

    // Mock competitive info for visual matches
    const tier = pokemon.id <= 3 ? 'TIER: OU/Uber' : pokemon.id <= 15 ? 'TIER: UU/OU' : 'TIER: RU/NU';
    const primaryAbility = pokemon.abilities[0]?.ability.name || 'Inner Focus';
    const heldItem = pokemon.types.includes('fire') ? 'Life Orb' : 'Leftovers';
    const nature = pokemon.stats[5].base_stat > 90 ? 'Timid' : 'Adamant';
    const evSpread = pokemon.stats[1].base_stat > pokemon.stats[3].base_stat 
      ? '252 Atk / 4 SpD / 252 Spe' 
      : '252 SpA / 4 SpD / 252 Spe';

    // Mock competitive moves based on pokemon types
    const mockMoves = [
      { name: 'Nasty Plot', desc: 'Boosts Special Attack by 2 stages. Use on forced switches to setup for a sweep.', type: 'dark', category: 'status' },
      { name: 'Aura Sphere', desc: 'High-accuracy Fighting STAB. Never misses. Perfect for hitting Steel and Normal types.', type: 'fighting', category: 'special' },
      { name: 'Flash Cannon', desc: 'Secondary STAB. Coverage for Fairy and Ice types. 10% chance to lower SpD.', type: 'steel', category: 'special' },
      { name: 'Vacuum Wave', desc: 'Vital priority move. Clean up weakened faster threats before they can hit.', type: 'fighting', category: 'special' }
    ];

    // Mock synergistic teammates
    const mockTeammates = [
      { id: 149, name: 'Dragonite', role: 'Wall Breaker / Multi-Scale' },
      { id: 445, name: 'Garchomp', role: 'Stealth Rock Setter' },
      { id: 637, name: 'Volcarona', role: 'Quiver Dance Sweeper' }
    ];

    return (
      <main className="app-container">
        
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 700 }}>
            <i className="fa-solid fa-arrow-left"></i> Quay lại Trang chủ
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
              const trans = TYPE_TRANSLATIONS[t.type.name] || { name: t.type.name, color: '#999' };
              return (
                <span key={t.type.name} className="type-badge" style={{ backgroundColor: trans.color }}>
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
                  const statConfig = STATS_MAP_V3[s.stat.name] || { name: s.stat.name, color: '#6b7280' };
                  const percent = Math.min((s.base_stat / 150) * 100, 100);
                  return (
                    <div key={s.stat.name} className="stat-row-v3">
                      <span className="stat-name-v3">{statConfig.name}</span>
                      <span className="stat-value-v3">{s.base_stat}</span>
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
                src={pokemon.sprites.other['official-artwork'].front_default} 
                alt={pokemon.name} 
                className="detail-floating-image"
              />
            </div>

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
            <i className="fa-solid fa-shield-halved"></i> Đóng góp từ cộng đồng
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {builds.length > 0 ? (
              builds.map(build => (
                <div key={build._id.toString()} className="build-card" style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.2rem' }}>
                  <div className="build-header">
                    <div>
                      <h4 className="build-title" style={{ fontSize: '1.1rem' }}>{build.buildTitle}</h4>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginTop: '0.15rem' }}>
                        Ngày đăng: {new Date(build.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <span className="build-author" style={{ fontSize: '0.75rem' }}>Tác giả: {build.trainerName}</span>
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
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Chưa có bài build đóng góp nào.</p>
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
                  Hãy <Link href="/login" style={{ color: 'var(--primary-color)', fontWeight: 700, textDecoration: 'none' }}>đăng nhập</Link> để viết bài đóng góp kinh nghiệm chiến đấu cho Pokémon này.
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
          <h2>Không tìm thấy Pokémon</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Pokémon có mã ID #{id} không tồn tại hoặc lỗi tải dữ liệu.</p>
          <Link href="/" className="btn-login" style={{ display: 'inline-block', marginTop: '1.5rem' }}>Quay lại Trang chủ</Link>
        </div>
      </main>
    );
  }
}
