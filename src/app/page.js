import PokemonListClient from './PokemonListClient';

export const revalidate = 86400; // Cache data for 24 hours

async function getPokemonList() {
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
  if (!res.ok) {
    throw new Error('Failed to fetch Pokemon list');
  }
  const data = await res.json();

  const detailedPromises = data.results.map(async (poke) => {
    try {
      const detailRes = await fetch(poke.url);
      if (!detailRes.ok) throw new Error();
      const detail = await detailRes.json();
      return {
        id: detail.id,
        name: detail.name,
        image: detail.sprites.other['official-artwork'].front_default || detail.sprites.front_default,
        types: detail.types.map(t => t.type.name),
      };
    } catch (e) {
      const id = poke.url.split('/').filter(Boolean).pop();
      return {
        id: parseInt(id),
        name: poke.name,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
        types: ['normal']
      };
    }
  });

  return await Promise.all(detailedPromises);
}

export default async function Home() {
  try {
    const pokemon = await getPokemonList();

    return (
      <main className="app-container">
        <header className="app-header" style={{ textAlign: 'center', padding: '2rem 1rem 3rem' }}>
          <div className="logo-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '45px',
              height: '45px',
              background: 'linear-gradient(to bottom, #ff3e6c 50%, #ffffff 50%)',
              borderRadius: '50%',
              border: '4px solid var(--bg-darker)',
              position: 'relative',
              boxShadow: '0 0 20px rgba(255, 62, 108, 0.4)',
              animation: 'spin 6s infinite linear'
            }}>
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '4px',
                backgroundColor: 'var(--bg-darker)',
                top: 'calc(50% - 2px)',
                left: 0
              }} />
              <div style={{
                position: 'absolute',
                width: '14px',
                height: '14px',
                backgroundColor: '#fff',
                border: '3px solid var(--bg-darker)',
                borderRadius: '50%',
                top: 'calc(50% - 7px)',
                left: 'calc(50% - 7px)'
              }} />
            </div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '800', letterSpacing: '-1px' }}>
              Poké<span style={{ color: 'var(--primary-color)' }}>dex</span>
            </h1>
          </div>
          <p className="subtitle" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Khám phá thế giới Pokémon kỳ diệu
          </p>
        </header>

        <PokemonListClient initialPokemon={pokemon} />
      </main>
    );
  } catch (error) {
    console.error('Home Page Error:', error);
    return (
      <main className="app-container">
        <div className="error-container">
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '3rem', color: '#ff4a5a', marginBottom: '1rem' }}></i>
          <h2>Không thể kết nối đến PokéAPI</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Vui lòng kiểm tra kết nối mạng của bạn và thử lại.</p>
        </div>
      </main>
    );
  }
}
