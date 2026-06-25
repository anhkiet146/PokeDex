import { getPokemonList } from '@/lib/pokemon';
import PokemonListClient from './PokemonListClient';

export const revalidate = 86400; // Cache data for 24 hours on the server

export default async function Home() {
  try {
    const pokemon = await getPokemonList();

    return (
      <main className="app-container">
        <header className="app-header" style={{ textAlign: 'center', padding: '1rem 1rem 2rem' }}>
          <div className="logo-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '45px',
              height: '45px',
              background: 'linear-gradient(to bottom, #b8231c 50%, #ffffff 50%)',
              borderRadius: '50%',
              border: '4px solid var(--text-primary)',
              position: 'relative',
              boxShadow: '0 2px 10px rgba(184, 35, 28, 0.2)'
            }}>
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '4px',
                backgroundColor: 'var(--text-primary)',
                top: 'calc(50% - 2px)',
                left: 0
              }} />
              <div style={{
                position: 'absolute',
                width: '14px',
                height: '14px',
                backgroundColor: '#fff',
                border: '3px solid var(--text-primary)',
                borderRadius: '50%',
                top: 'calc(50% - 7px)',
                left: 'calc(50% - 7px)'
              }} />
            </div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '800', letterSpacing: '-1px', color: 'var(--text-primary)' }}>
              Poké<span style={{ color: 'var(--primary-color)' }}>dex</span>
            </h1>
          </div>
          <p className="subtitle" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Explore the magical world of Pokémon
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
          <h2>Failed to Connect to PokéAPI</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Please check your internet connection and try again.</p>
        </div>
      </main>
    );
  }
}
