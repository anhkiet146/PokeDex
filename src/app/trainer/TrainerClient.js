'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TrainerClient({ initialTrainer, allPokemon }) {
  const [trainer, setTrainer] = useState(initialTrainer);
  const [activeTab, setActiveTab] = useState('profile'); // profile | collection | team
  
  // Profile edit states
  const [displayName, setDisplayName] = useState(trainer.displayName);
  const [avatar, setAvatar] = useState(trainer.avatar);
  const [dob, setDob] = useState(trainer.dob ? new Date(trainer.dob).toISOString().split('T')[0] : '');
  const [editSuccess, setEditSuccess] = useState('');
  const [editError, setEditError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Search & add pokemon states
  const [pokeSearch, setPokeSearch] = useState('');
  const [collectionLoading, setCollectionLoading] = useState(false);

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
        throw new Error(data.error || 'Cập nhật thất bại');
      }

      setTrainer(data.trainer);
      setEditSuccess('Cập nhật hồ sơ nhà huấn luyện thành công!');
      router.refresh();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  // Toggle Owned Pokemon
  const handleTogglePokemon = async (pokemonId, isOwned) => {
    setCollectionLoading(true);
    const action = isOwned ? 'remove' : 'add';

    try {
      const res = await fetch('/api/trainer/pokemon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pokemonId, action }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Cập nhật bộ sưu tập thất bại');
      }

      setTrainer(data.trainer);
    } catch (err) {
      alert(err.message);
    } finally {
      setCollectionLoading(false);
    }
  };

  // Get Owned Pokemon Detailed Objects
  const ownedPokemonDetails = allPokemon.filter(p => trainer.ownedPokemon.includes(p.id));

  // Generate Suggested Team Composition (Rule-based synergy engine)
  const getTeamRecommendations = () => {
    if (trainer.ownedPokemon.length === 0) {
      return {
        type: 'none',
        title: 'Chưa có gợi ý',
        description: 'Hãy thêm Pokémon vào bộ sưu tập của bạn để mở khóa các phân tích đội hình tối ưu!',
        team: []
      };
    }

    const ownedTypes = Array.from(new Set(ownedPokemonDetails.flatMap(p => p.types)));
    const ownedIds = trainer.ownedPokemon;

    // Helper to find pokemon in Gen 1
    const findPoke = (id) => allPokemon.find(p => p.id === id);

    // Rule 1: Sun Team Core (Fire presence)
    if (ownedTypes.includes('fire')) {
      const core = ownedPokemonDetails.find(p => p.types.includes('fire'));
      // Synergies: Chlorophyll Grass (Venusaur), Sun setters/attackers (Charizard, Ninetales, Arcanine, Exeggutor)
      const suggestions = [3, 6, 38, 59, 103, 136]; // Venusaur, Charizard, Ninetales, Arcanine, Exeggutor, Flareon
      const team = Array.from(new Set([core.id, ...suggestions])).slice(0, 6).map(findPoke).filter(Boolean);
      return {
        type: 'sun',
        title: 'Đội hình Rực Nắng (Sunny Synergy)',
        description: 'Tận dụng lượng sát thương hệ Lửa khổng lồ. Kết hợp hệ Cỏ (như Venusaur hoặc Exeggutor) để sử dụng đòn Solar Beam bắn ngay lập tức dưới ánh nắng gắt, che chở điểm yếu nước.',
        team
      };
    }

    // Rule 2: Rain Team Core (Water presence)
    if (ownedTypes.includes('water')) {
      const core = ownedPokemonDetails.find(p => p.types.includes('water'));
      // Synergies: Rain Sweepers / Thunder users (Blastoise, Gyarados, Lapras, Jolteon, Dragonite)
      const suggestions = [9, 130, 131, 135, 149, 55]; // Blastoise, Gyarados, Lapras, Jolteon, Dragonite, Golduck
      const team = Array.from(new Set([core.id, ...suggestions])).slice(0, 6).map(findPoke).filter(Boolean);
      return {
        type: 'rain',
        title: 'Đội hình Vũ Điệu Mưa (Rain Synergy)',
        description: 'Mưa lớn giúp tăng sát thương kỹ năng hệ Nước. Jolteon sẽ được hưởng lợi với chiêu Thunder (Sấm Sét) chính xác 100% khi trời mưa. Lapras bổ sung lượng hồi phục tốt.',
        team
      };
    }

    // Rule 3: Electric/Volt Core
    if (ownedTypes.includes('electric')) {
      const core = ownedPokemonDetails.find(p => p.id === 25 || p.types.includes('electric'));
      // Synergies: Volt Core, Ground immunity covers electric weakness (Pikachu/Jolteon, Dugtrio/Nidoking, Gyarados/Zapdos)
      const suggestions = [26, 135, 51, 34, 130, 145]; // Raichu, Jolteon, Dugtrio, Nidoking, Gyarados, Zapdos
      const team = Array.from(new Set([core.id, ...suggestions])).slice(0, 6).map(findPoke).filter(Boolean);
      return {
        type: 'volt',
        title: 'Đội hình Bán dẫn Tốc độ (Volt-Turn Core)',
        description: 'Lực lượng Điện mạnh mẽ khắc chế Thủy và Bay. Nidoking hoặc Dugtrio hệ Đất miễn nhiễm các luồng điện dư thừa và đe dọa các Pokémon hệ đá, tạo bọc lót hoàn hảo.',
        team
      };
    }

    // Fallback: Balanced Core (Fire - Water - Grass core)
    const suggestions = [3, 6, 9, 25, 143, 65]; // Venusaur, Charizard, Blastoise, Pikachu, Snorlax, Alakazam
    const team = Array.from(new Set([...ownedIds, ...suggestions])).slice(0, 6).map(findPoke).filter(Boolean);
    return {
      type: 'balanced',
      title: 'Đội hình Cân bằng Truyền thống (F-W-G Core)',
      description: 'Lõi cốt lõi kết hợp giữa Lửa, Nước và Cỏ tạo thành thế kiềng ba chân tự khắc chế lẫn nhau, bọc lót điểm yếu hệ cực tốt. Thêm Snorlax (Đỡ đòn) và Alakazam (Sát thương phép).',
      team
    };
  };

  const recommendation = getTeamRecommendations();

  // Search filter for list of pokemon to add
  const filteredSearchPokemon = allPokemon.filter(p => 
    p.name.toLowerCase().includes(pokeSearch.toLowerCase()) || 
    p.id.toString().includes(pokeSearch)
  );

  return (
    <main className="app-container">
      <div className="profile-layout">
        
        {/* Sidebar details */}
        <section className="profile-sidebar">
          <div className="profile-avatar-wrapper">
            <img src={trainer.avatar} alt={trainer.displayName} className="profile-avatar" />
          </div>
          
          <h2 className="profile-name">{trainer.displayName}</h2>
          <span className="profile-username">@{trainer.username}</span>

          <div className="profile-info-list">
            <div className="profile-info-item">
              <span className="profile-info-label">Ngày sinh</span>
              <span className="profile-info-val">
                {trainer.dob ? new Date(trainer.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
              </span>
            </div>
            <div className="profile-info-item">
              <span className="profile-info-label">Gia nhập</span>
              <span className="profile-info-val">
                {new Date(trainer.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className="profile-info-item" style={{ marginBottom: 0 }}>
              <span className="profile-info-label">Sở hữu</span>
              <span className="profile-info-val">{trainer.ownedPokemon.length} Pokémon</span>
            </div>
          </div>

          {/* Navigation Controls inside profile */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' }}>
            <button 
              className={`filter-btn ${activeTab === 'profile' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start', border: activeTab === 'profile' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)' }}
              onClick={() => setActiveTab('profile')}
            >
              <i className="fa-solid fa-user-gear"></i> Cấu hình hồ sơ
            </button>
            <button 
              className={`filter-btn ${activeTab === 'collection' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start', border: activeTab === 'collection' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)' }}
              onClick={() => setActiveTab('collection')}
            >
              <i className="fa-solid fa-folder-open"></i> Bộ sưu tập Pokémon
            </button>
            <button 
              className={`filter-btn ${activeTab === 'team' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start', border: activeTab === 'team' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)' }}
              onClick={() => setActiveTab('team')}
            >
              <i className="fa-solid fa-users-viewfinder"></i> Đội hình gợi ý
            </button>
            
            <button 
              className="btn-submit"
              style={{ background: 'rgba(255, 62, 108, 0.1)', border: '1px solid rgba(255, 62, 108, 0.3)', color: 'var(--primary-color)', marginTop: '1rem', height: '44px' }}
              onClick={handleLogout}
            >
              <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
            </button>
          </div>
        </section>

        {/* Dynamic content pages based on activeTab */}
        <section className="profile-content">
          
          {/* PROFILE EDIT TAB */}
          {activeTab === 'profile' && (
            <div className="profile-section" style={{ background: 'rgba(13, 16, 32, 0.45)' }}>
              <h3 className="profile-section-title">
                <i className="fa-solid fa-user-gear"></i> Cập nhật thông tin Nhà huấn luyện
              </h3>

              {editSuccess && (
                <div style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.3)', color: '#4ade80', padding: '0.8rem', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                  <label htmlFor="editDisplayName">Tên nhà huấn luyện</label>
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
                  <label htmlFor="editAvatar">URL Ảnh đại diện (Avatar)</label>
                  <input 
                    type="url" 
                    id="editAvatar"
                    className="form-input"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="Nhập liên kết hình ảnh..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editDob">Ngày sinh (Date of Birth)</label>
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
                  {profileLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </form>
            </div>
          )}

          {/* COLLECTION MANAGE TAB */}
          {activeTab === 'collection' && (
            <div className="profile-section" style={{ background: 'rgba(13, 16, 32, 0.45)' }}>
              <h3 className="profile-section-title">
                <i className="fa-solid fa-folder-open"></i> Quản lý bộ sưu tập Pokémon sở hữu
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Chọn những Pokémon bạn đang sở hữu ngoài thực tế (hoặc trong game) để hệ thống bắt đầu phân tích và đưa ra gợi ý đội hình chiến thuật ăn ý nhất.
              </p>

              {/* Selector Search */}
              <div className="search-wrapper" style={{ maxWidth: '100%', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
                <i className="fa-solid fa-magnifying-glass search-icon"></i>
                <input 
                  type="text" 
                  placeholder="Tìm Pokémon theo tên hoặc ID cần chọn..." 
                  value={pokeSearch}
                  onChange={(e) => setPokeSearch(e.target.value)}
                />
              </div>

              {/* Selection list */}
              <div className="pokemon-select-grid">
                {filteredSearchPokemon.map(p => {
                  const isOwned = trainer.ownedPokemon.includes(p.id);
                  return (
                    <div 
                      key={p.id}
                      className={`pokemon-select-card ${isOwned ? 'selected' : ''}`}
                      onClick={() => handleTogglePokemon(p.id, isOwned)}
                    >
                      <img src={p.image} alt={p.name} />
                      <span style={{ fontSize: '0.8rem', textTransform: 'capitalize', display: 'block', fontWeight: 600 }}>
                        {p.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* List of currently owned */}
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '2rem 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa-solid fa-star" style={{ color: '#f59e0b' }}></i> Pokémon đang sở hữu ({ownedPokemonDetails.length})
              </h4>
              
              {ownedPokemonDetails.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.8rem' }}>
                  {ownedPokemonDetails.map(p => (
                    <Link 
                      key={p.id} 
                      href={`/pokemon/${p.id}`}
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '16px',
                        padding: '0.6rem',
                        textAlign: 'center',
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'block'
                      }}
                    >
                      <img src={p.image} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.name}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Bạn chưa thêm Pokémon nào vào bộ sưu tập.</p>
                </div>
              )}
            </div>
          )}

          {/* TEAM RECOMMENDATION TAB */}
          {activeTab === 'team' && (
            <div className="profile-section" style={{ background: 'rgba(13, 16, 32, 0.45)' }}>
              <h3 className="profile-section-title">
                <i className="fa-solid fa-users-viewfinder"></i> Đội hình gợi ý dựa trên Pokémon sở hữu
              </h3>

              {recommendation.type !== 'none' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Strategy Description */}
                  <div style={{
                    background: 'rgba(255, 62, 108, 0.03)',
                    border: '1px solid rgba(255, 62, 108, 0.1)',
                    padding: '1.5rem',
                    borderRadius: '20px'
                  }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                      {recommendation.title}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                      {recommendation.description}
                    </p>
                  </div>

                  {/* Team Grid Visualizer */}
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
                    Đội hình chiến đấu tối ưu (6 Pokémon)
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {recommendation.team.map((p, idx) => (
                      <Link 
                        key={p.id}
                        href={`/pokemon/${p.id}`}
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: trainer.ownedPokemon.includes(p.id) ? '1px solid rgba(255, 62, 108, 0.25)' : '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '20px',
                          padding: '1rem',
                          textAlign: 'center',
                          textDecoration: 'none',
                          color: 'inherit',
                          position: 'relative'
                        }}
                      >
                        {trainer.ownedPokemon.includes(p.id) && (
                          <span style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            background: 'rgba(255, 62, 108, 0.15)',
                            color: 'var(--primary-color)',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            textTransform: 'uppercase'
                          }}>
                            Bạn sở hữu
                          </span>
                        )}
                        <img src={p.image} alt={p.name} style={{ width: '70px', height: '70px', objectFit: 'contain', margin: '0.5rem auto' }} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'capitalize', display: 'block' }}>
                          {p.name}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.2rem' }}>
                          Thành viên {idx + 1}
                        </span>
                      </Link>
                    ))}
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>
                    * Đội hình được tối ưu hoá theo lý thuyết khắc chế hệ và hiệu ứng thời tiết cơ bản của thế hệ Pokémon đầu tiên.
                  </p>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', borderRadius: '20px' }}>
                  <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: '3rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}></i>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Đang chờ mở khoá phân tích</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto 1.5rem' }}>
                    {recommendation.description}
                  </p>
                  <button 
                    className="filter-btn" 
                    style={{ margin: '0 auto', background: 'var(--primary-color)', color: '#fff', border: 'none' }}
                    onClick={() => setActiveTab('collection')}
                  >
                    Chọn Pokémon ngay
                  </button>
                </div>
              )}
            </div>
          )}

        </section>

      </div>
    </main>
  );
}
