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

const STATS_MAP = {
  'hp': 'HP',
  'attack': 'ATK',
  'defense': 'DEF',
  'special-attack': 'SATK',
  'special-defense': 'SDEF',
  'speed': 'SPD'
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
    // Fetch parallel APIs
    const [pokemon, species, session] = await Promise.all([
      getPokemonDetail(pokemonId),
      getPokemonSpecies(pokemonId),
      getSession()
    ]);

    // Fetch database custom builds
    await dbConnect();
    const builds = await Build.find({ pokemonId }).sort({ createdAt: -1 });

    // Fetch evolution details
    const evoData = await getEvolutionChain(species.evolution_chain.url);
    const evoChain = parseEvolutionChain(evoData.chain);

    // Filter description (English or Vietnamese if available)
    let description = 'Không có mô tả chi tiết bằng tiếng Anh.';
    const engEntry = species.flavor_text_entries.find(entry => entry.language.name === 'en');
    if (engEntry) {
      description = engEntry.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ');
    }

    const primaryType = pokemon.types[0].type.name;
    const transColor = TYPE_TRANSLATIONS[primaryType]?.color || '#999';
    const detailHeaderStyle = {
      '--modal-theme-color': transColor,
      '--modal-header-color': `${transColor}20`,
    };

    return (
      <main className="app-container" style={detailHeaderStyle}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <i className="fa-solid fa-arrow-left"></i> Quay lại Trang chủ
          </Link>
        </div>

        {/* Pokemon Main visual profile card */}
        <section className="profile-layout" style={{ marginBottom: '3rem' }}>
          {/* Visual Display */}
          <div className="profile-sidebar" style={{ background: 'rgba(13, 16, 32, 0.55)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="profile-avatar-wrapper" style={{ border: 'none', marginTop: '1rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
              <img 
                src={pokemon.sprites.other['official-artwork'].front_default} 
                alt={pokemon.name} 
                style={{ width: '200px', height: '200px', objectFit: 'contain', filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.4))' }} 
              />
            </div>
            
            <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-secondary)' }}>
              #{pokemon.id.toString().padStart(3, '0')}
            </span>
            <h2 className="profile-name" style={{ textTransform: 'capitalize', fontSize: '2rem', letterSpacing: '-0.5px' }}>
              {pokemon.name}
            </h2>
            
            <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0 1.5rem' }}>
              {pokemon.types.map(t => {
                const trans = TYPE_TRANSLATIONS[t.type.name] || { name: t.type.name, color: '#999' };
                return (
                  <span key={t.type.name} className="type-badge" style={{ backgroundColor: trans.color }}>
                    {trans.name}
                  </span>
                );
              })}
            </div>

            <div className="profile-info-list" style={{ borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: '1.2rem' }}>
              <div className="profile-info-item">
                <span className="profile-info-label">Cân nặng</span>
                <span className="profile-info-val">{pokemon.weight / 10} kg</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Chiều cao</span>
                <span className="profile-info-val">{pokemon.height / 10} m</span>
              </div>
              <div className="profile-info-item" style={{ marginBottom: 0 }}>
                <span className="profile-info-label">Kỹ năng</span>
                <span className="profile-info-val" style={{ textTransform: 'capitalize', textAlign: 'right' }}>
                  {pokemon.abilities.map(a => a.ability.name).join(', ')}
                </span>
              </div>
            </div>
          </div>

          {/* Stats, Description and Evolutions */}
          <div className="profile-content">
            <div className="profile-section" style={{ background: 'rgba(13, 16, 32, 0.35)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="profile-section-title">
                <i className="fa-solid fa-circle-info"></i> Mô tả
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '1.05rem' }}>
                {description}
              </p>
            </div>

            {/* Base Stats */}
            <div className="profile-section" style={{ background: 'rgba(13, 16, 32, 0.35)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="profile-section-title">
                <i className="fa-solid fa-chart-simple"></i> Chỉ số cơ bản
              </h3>
              <div className="stats-grid">
                {pokemon.stats.map(s => {
                  const shortName = STATS_MAP[s.stat.name] || s.stat.name;
                  const percent = Math.min((s.base_stat / 150) * 100, 100);
                  return (
                    <div key={s.stat.name} className="stat-row">
                      <span className="stat-name" style={{ width: '120px' }}>{shortName}</span>
                      <span className="stat-value" style={{ width: '40px' }}>{s.base_stat}</span>
                      <div className="stat-bar-container">
                        <div className="stat-bar" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Evolution Chain */}
            {evoChain.length > 1 && (
              <div className="profile-section" style={{ background: 'rgba(13, 16, 32, 0.35)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="profile-section-title">
                  <i className="fa-solid fa-dna"></i> Sơ đồ Tiến hóa
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                  {evoChain.map((evo, idx) => (
                    <div key={evo.id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <Link href={`/pokemon/${evo.id}`} style={{ textDecoration: 'none', color: 'inherit', textAlign: 'center' }}>
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 0.5rem'
                        }}>
                          <img src={evo.image} alt={evo.name} style={{ width: '65px', height: '65px', objectFit: 'contain' }} />
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'capitalize', display: 'block' }}>
                          {evo.name}
                        </span>
                      </Link>
                      {idx < evoChain.length - 1 && (
                        <i className="fa-solid fa-arrow-right" style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', animation: 'spin 10s infinite linear' }}></i>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Pokemon builds and strategy guides */}
        <section className="profile-section" style={{ background: 'rgba(13, 16, 32, 0.35)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '28px' }}>
          <h3 className="profile-section-title" style={{ fontSize: '1.6rem' }}>
            <i className="fa-solid fa-shield-halved"></i> Hướng dẫn Build & Đội hình
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
            {builds.length > 0 ? (
              builds.map(build => (
                <div key={build._id.toString()} className="build-card">
                  <div className="build-header">
                    <div>
                      <h4 className="build-title">{build.buildTitle}</h4>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', marginTop: '0.2rem' }}>
                        Cập nhật: {new Date(build.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <span className="build-author">Huấn luyện viên: {build.trainerName}</span>
                  </div>

                  <div className="build-meta-grid">
                    <div className="build-meta-item">
                      <span className="build-meta-label">Vật phẩm (Item)</span>
                      <span style={{ fontWeight: 600 }}>{build.item || 'Không có'}</span>
                    </div>
                    <div className="build-meta-item">
                      <span className="build-meta-label">Tính chất (Nature)</span>
                      <span style={{ fontWeight: 600 }}>{build.nature || 'Không có'}</span>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                    <span className="build-meta-label">Bộ kỹ năng (Moveset)</span>
                    <div className="build-moves">
                      {build.moves.map(move => (
                        <span key={move} className="build-move-badge">{move}</span>
                      ))}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                    <span className="build-meta-label">Hướng dẫn vận hành</span>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                      {build.description}
                    </p>
                  </div>

                  {build.teamComps.length > 0 && (
                    <div>
                      <span className="build-meta-label">Đội hình ăn ý gợi ý</span>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        {build.teamComps.map(teamId => (
                          <Link 
                            key={teamId} 
                            href={`/pokemon/${teamId}`} 
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', color: 'inherit', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.3rem 0.8rem', borderRadius: '10px' }}
                          >
                            <img 
                              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${teamId}.png`} 
                              alt={`pokemon-${teamId}`} 
                              style={{ width: '32px', height: '32px', objectFit: 'contain' }} 
                            />
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>#{teamId}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', borderRadius: '20px' }}>
                <i className="fa-regular fa-folder-open" style={{ fontSize: '2.5rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}></i>
                <p style={{ color: 'var(--text-secondary)' }}>Chưa có hướng build nào cho Pokémon này.</p>
              </div>
            )}

            {/* Render submit build form */}
            {session ? (
              <SubmitBuildForm pokemonId={pokemonId} trainer={session} />
            ) : (
              <div style={{
                background: 'rgba(255, 62, 108, 0.05)',
                border: '1px solid rgba(255, 62, 108, 0.15)',
                borderRadius: '20px',
                padding: '1.5rem',
                textAlign: 'center',
                marginTop: '1.5rem'
              }}>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Hãy <Link href="/login" style={{ color: 'var(--primary-color)', fontWeight: 700, textDecoration: 'none' }}>đăng nhập</Link> để đóng góp kinh nghiệm chiến đấu và hướng build Pokémon của bạn!
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
