'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubmitBuildForm({ pokemonId, trainer }) {
  const [buildTitle, setBuildTitle] = useState('');
  const [item, setItem] = useState('');
  const [nature, setNature] = useState('');
  const [moves, setMoves] = useState(['', '', '', '']);
  const [description, setDescription] = useState('');
  const [teamComps, setTeamComps] = useState(''); // Comma separated IDs
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleMoveChange = (index, value) => {
    const newMoves = [...moves];
    newMoves[index] = value;
    setMoves(newMoves);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!buildTitle || !description) {
      setError('Vui lòng điền đầy đủ Tiêu đề và Mô tả hướng dẫn');
      setLoading(false);
      return;
    }

    // Process team comps (comma separated IDs to list of numbers)
    const synergyIds = teamComps
      .split(',')
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id) && id > 0);

    try {
      const res = await fetch(`/api/pokemon/${pokemonId}/builds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildTitle,
          item,
          nature,
          moves: moves.filter(Boolean),
          description,
          teamComps: synergyIds
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Không thể đăng hướng build');
      }

      setSuccess('Đăng hướng build thành công!');
      setBuildTitle('');
      setItem('');
      setNature('');
      setMoves(['', '', '', '']);
      setDescription('');
      setTeamComps('');
      
      // Refresh page server data
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid var(--border-color)',
      borderRadius: '24px',
      padding: '2rem',
      marginTop: '2rem'
    }}>
      <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <i className="fa-solid fa-pen-to-square" style={{ color: 'var(--primary-color)' }}></i> Đóng góp hướng Build của bạn
      </h3>

      {error && (
        <div className="form-error" style={{ marginBottom: '1.2rem' }}>
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{
          background: 'rgba(74, 222, 128, 0.1)',
          border: '1px solid rgba(74, 222, 128, 0.3)',
          color: '#4ade80',
          padding: '0.8rem',
          borderRadius: '12px',
          fontSize: '0.85rem',
          marginBottom: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <i className="fa-solid fa-circle-check"></i>
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="buildTitle">Tên hướng build *</label>
          <input 
            type="text" 
            id="buildTitle"
            className="form-input"
            value={buildTitle}
            onChange={(e) => setBuildTitle(e.target.value)}
            placeholder="VD: Đấu Sĩ Cân Bằng, Sát Thủ Tốc Độ..."
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="item">Vật phẩm (Held Item)</label>
            <input 
              type="text" 
              id="item"
              className="form-input"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="VD: Leftovers, Choice Band"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="nature">Tính chất (Nature)</label>
            <input 
              type="text" 
              id="nature"
              className="form-input"
              value={nature}
              onChange={(e) => setNature(e.target.value)}
              placeholder="VD: Jolly, Adamant"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Bộ chiêu thức (4 Chiêu)</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {moves.map((move, index) => (
              <input 
                key={index}
                type="text"
                className="form-input"
                value={move}
                onChange={(e) => handleMoveChange(index, e.target.value)}
                placeholder={`Chiêu thức ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="teamComps">Pokémon đồng đội ăn ý (Nhập ID, phân cách bằng dấu phẩy)</label>
          <input 
            type="text" 
            id="teamComps"
            className="form-input"
            value={teamComps}
            onChange={(e) => setTeamComps(e.target.value)}
            placeholder="VD: 3, 9, 134 (Charizard, Blastoise, Vaporeon)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Hướng dẫn chi tiết & Lối chơi *</label>
          <textarea 
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows="4"
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '0.8rem 1rem',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              outline: 'none',
              resize: 'vertical'
            }}
            placeholder="Nêu cách vận hành chiêu thức, đồng đội đi cùng và mẹo khi chiến đấu..."
          />
        </div>

        <button 
          type="submit" 
          className="btn-submit"
          disabled={loading}
          style={{ width: 'auto', padding: '0 2rem' }}
        >
          {loading ? 'Đang gửi...' : 'Đăng hướng Build'}
        </button>
      </form>
    </div>
  );
}
