import Link from 'next/link';
import { getPokemonList } from '@/lib/pokemon';
import {
  createBuildSuggestions,
  formatPokemonName,
  getBattleRole,
  getMoveCandidates,
  getMoveDetails,
  getSuggestedEvSpread,
  getSuggestedItem,
  getSuggestedNature,
  normalizeAbilities,
} from '@/lib/competitive';
import { getItemDesc } from '@/lib/competitive-descriptions';

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

const TYPE_CHART = {
  normal: { weak: ['fighting'], resist: [], immune: ['ghost'] },
  fire: { weak: ['water', 'ground', 'rock'], resist: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], immune: [] },
  water: { weak: ['electric', 'grass'], resist: ['fire', 'water', 'ice', 'steel'], immune: [] },
  electric: { weak: ['ground'], resist: ['electric', 'flying', 'steel'], immune: [] },
  grass: { weak: ['fire', 'ice', 'poison', 'flying', 'bug'], resist: ['water', 'electric', 'grass', 'ground'], immune: [] },
  ice: { weak: ['fire', 'fighting', 'rock', 'steel'], resist: ['ice'], immune: [] },
  fighting: { weak: ['flying', 'psychic', 'fairy'], resist: ['bug', 'rock', 'dark'], immune: [] },
  poison: { weak: ['ground', 'psychic'], resist: ['grass', 'fighting', 'poison', 'bug', 'fairy'], immune: [] },
  ground: { weak: ['water', 'grass', 'ice'], resist: ['poison', 'rock'], immune: ['electric'] },
  flying: { weak: ['electric', 'ice', 'rock'], resist: ['grass', 'fighting', 'bug'], immune: ['ground'] },
  psychic: { weak: ['bug', 'ghost', 'dark'], resist: ['fighting', 'psychic'], immune: [] },
  bug: { weak: ['fire', 'flying', 'rock'], resist: ['grass', 'fighting', 'ground'], immune: [] },
  rock: { weak: ['water', 'grass', 'fighting', 'ground', 'steel'], resist: ['normal', 'fire', 'poison', 'flying'], immune: [] },
  ghost: { weak: ['ghost', 'dark'], resist: ['poison', 'bug'], immune: ['normal', 'fighting'] },
  dragon: { weak: ['ice', 'dragon', 'fairy'], resist: ['fire', 'water', 'electric', 'grass'], immune: [] },
  dark: { weak: ['fighting', 'bug', 'fairy'], resist: ['ghost', 'dark'], immune: ['psychic'] },
  steel: { weak: ['fire', 'fighting', 'ground'], resist: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'], immune: ['poison'] },
  fairy: { weak: ['poison', 'steel'], resist: ['fighting', 'bug', 'dark'], immune: ['dragon'] }
};

async function getPokemonDetail(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, { next: { revalidate: 60 * 60 * 24 * 7 } });
  if (!res.ok) throw new Error('Pokemon not found');
  const detail = await res.json();
  return {
    id: detail.id,
    name: detail.name,
    image: detail.sprites.other['official-artwork'].front_default || detail.sprites.front_default,
    types: detail.types.map(t => t.type.name),
    height: detail.height,
    weight: detail.weight,
    abilities: detail.abilities.map(a => ({ name: a.ability.name, isHidden: a.is_hidden })),
    stats: detail.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
    heldItems: detail.held_items.map(item => item.item.name),
    raw: detail
  };
}

async function getPokemonSpecies(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`, { next: { revalidate: 60 * 60 * 24 * 7 } });
  if (!res.ok) throw new Error('Pokemon species not found');
  return await res.json();
}

async function getEvolutionChain(url) {
  const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 7 } });
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

function getTypeMatchups(types) {
  return Object.keys(TYPE_CHART)
    .map(attackType => {
      const multiplier = types.reduce((value, defendType) => {
        const chart = TYPE_CHART[defendType];
        if (chart.immune.includes(attackType)) return 0;
        if (chart.weak.includes(attackType)) return value * 2;
        if (chart.resist.includes(attackType)) return value * 0.5;
        return value;
      }, 1);

      return { type: attackType, multiplier };
    })
    .sort((a, b) => b.multiplier - a.multiplier || a.type.localeCompare(b.type));
}

function getDefensiveMultiplier(attackType, defenderTypes) {
  return defenderTypes.reduce((value, defendType) => {
    const chart = TYPE_CHART[defendType];
    if (chart.immune.includes(attackType)) return 0;
    if (chart.weak.includes(attackType)) return value * 2;
    if (chart.resist.includes(attackType)) return value * 0.5;
    return value;
  }, 1);
}

function getRelatedPokemon(currentPokemon, pokemonList, weaknesses) {
  const currentTypes = new Set(currentPokemon.types);
  const currentRole = getBattleRole(currentPokemon);
  const currentTotal = Object.values(currentPokemon.stats || {}).reduce((sum, value) => sum + value, 0);

  return pokemonList
    .filter(candidate => candidate.id !== currentPokemon.id && !candidate.isMega)
    .map(candidate => {
      const sharedTypes = candidate.types.filter(type => currentTypes.has(type));
      const coversWeaknesses = weaknesses.filter(weakness => (
        getDefensiveMultiplier(weakness.type, candidate.types) < 1
      ));
      const role = getBattleRole(candidate);
      const candidateTotal = Object.values(candidate.stats || {}).reduce((sum, value) => sum + value, 0);
      const statFitBonus = Math.abs(candidateTotal - currentTotal) <= 80 ? 1 : 0;
      const roleBonus = role !== currentRole ? 1 : 0;
      const score = sharedTypes.length * 4 + coversWeaknesses.length * 5 + roleBonus + statFitBonus;
      const reason = coversWeaknesses.length > 0
        ? `Resists ${coversWeaknesses.slice(0, 2).map(item => formatPokemonName(item.type)).join(' / ')}`
        : sharedTypes.length > 0
          ? `Same ${sharedTypes.map(formatPokemonName).join(' / ')} type`
          : role;

      return {
        ...candidate,
        role,
        reason,
        score
      };
    })
    .filter(candidate => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.id - b.id)
    .slice(0, 3);
}

function buildEvolutionChainWithMega(evoChain, pokemonList) {
  const expanded = [];

  evoChain.forEach((evo, index) => {
    expanded.push({
      ...evo,
      stage: index === 0 ? 'Basic' : index === 1 ? 'Stage 1' : 'Stage 2',
      isMega: false
    });

    const megaVariants = pokemonList
      .filter(p => p.isMega && p.name.replace(/-mega(?:-[xy])?$/, '') === evo.name)
      .sort((a, b) => a.name.localeCompare(b.name));

    megaVariants.forEach(mega => {
      expanded.push({
        id: mega.id,
        name: mega.name,
        image: mega.image,
        stage: 'Mega',
        isMega: true
      });
    });
  });

  return expanded;
}

function getItemImageUrl(itemName) {
  if (!itemName || itemName.toLowerCase() === 'none') return null;
  const normalized = itemName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${normalized}.png`;
}

async function getAbilityDetails(abilities) {
  return Promise.all(
    abilities.map(async (ability) => {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/ability/${ability.name}`, {
          next: { revalidate: 60 * 60 * 24 * 7 }
        });
        if (!res.ok) {
          return { ...ability, description: 'No description available.' };
        }
        const data = await res.json();
        
        // Find English effect entry
        const effectEntry = data.effect_entries.find(entry => entry.language.name === 'en')
          || data.flavor_text_entries.find(entry => entry.language.name === 'en');
          
        const description = effectEntry
          ? (effectEntry.short_effect || effectEntry.flavor_text || effectEntry.effect || '')
          : 'No description available.';
          
        return {
          ...ability,
          description: description.replace(/\f/g, ' ').replace(/\n/g, ' ')
        };
      } catch (error) {
        console.error(`Error fetching ability details for ${ability.name}:`, error);
        return { ...ability, description: 'No description available.' };
      }
    })
  );
}

export default async function PokemonDetailPage({ params }) {
  const { id } = await params;
  const pokemonId = Number(id);

  try {
    // 1. Fetch cached list first to optimize speed (no API fetch needed for basic details!)
    const pokemonList = await getPokemonList();
    const cachedPoke = pokemonList.find(p => p.id === pokemonId);
    
    let speciesIdOrName = pokemonId;
    if (pokemonId > 10000) {
      const megaName = cachedPoke ? cachedPoke.name : '';
      if (megaName.includes('-mega')) {
        speciesIdOrName = megaName.split('-mega')[0];
      }
    }

    // Fetch parallel APIs
    const [livePokemon, species] = await Promise.all([
      getPokemonDetail(pokemonId),
      getPokemonSpecies(speciesIdOrName)
    ]);
    const pokemon = {
      ...livePokemon,
      isMega: cachedPoke?.isMega || false
    };

    // Fetch evolution details
    const evoData = await getEvolutionChain(species.evolution_chain.url);
    const evoChain = parseEvolutionChain(evoData.chain);
    const displayEvolutionChain = buildEvolutionChainWithMega(evoChain, pokemonList);
    const baseEvolutionChain = displayEvolutionChain.filter(evo => !evo.isMega);
    const megaEvolutionBranches = displayEvolutionChain.filter(evo => evo.isMega);

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

    const abilities = normalizeAbilities(pokemon.abilities);
    const abilitiesWithDetails = await getAbilityDetails(abilities);
    const primaryAbility = abilities[0]?.name || 'unknown';
    const battleRole = getBattleRole(pokemon);
    const heldItem = getSuggestedItem(pokemon);
    const nature = getSuggestedNature(pokemon);
    const evSpread = getSuggestedEvSpread(pokemon);
    const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.value, 0);
    const typeMatchups = getTypeMatchups(pokemon.types);
    const matchupGroups = {
      weak: typeMatchups.filter(item => item.multiplier > 1),
      resist: typeMatchups.filter(item => item.multiplier > 0 && item.multiplier < 1),
      immune: typeMatchups.filter(item => item.multiplier === 0),
      neutral: typeMatchups.filter(item => item.multiplier === 1)
    };
    const relatedPokemon = getRelatedPokemon(pokemon, pokemonList, matchupGroups.weak);
    const learnset = getMoveCandidates(pokemon.raw);
    const moveDetails = await getMoveDetails(learnset.moves, Number.POSITIVE_INFINITY);
    const buildSuggestions = createBuildSuggestions(pokemon, moveDetails, abilities);

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
            {formatPokemonName(pokemon.name)}
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
            <span className="detail-tier-badge">{battleRole}</span>
          </div>
        </section>

        {/* 2. Detail Two-Column Layout (Screenshot 3) */}
        <div className="detail-layout-grid">
          
          {/* Main Stats and Builds Column */}
          <div className="detail-main-info">

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
                <div className="stat-row-v3 stat-total-row">
                  <span className="stat-name-v3">TOTAL</span>
                  <span className="stat-value-v3">{totalStats}</span>
                  <div className="stat-bar-container-v3">
                    <div
                      className="stat-bar-fill-v3"
                      style={{ width: `${Math.min((totalStats / 720) * 100, 100)}%`, backgroundColor: 'var(--primary-color)' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Battle data summary */}
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Battle Data
              </h3>
              <div className="standard-build-grid">
                <div className="build-feature-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
                  <i className="fa-solid fa-bolt build-feature-icon"></i>
                  <span className="build-feature-label">Abilities</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%', textAlign: 'left', marginTop: '0.5rem' }}>
                    {abilitiesWithDetails.map((ability, idx) => (
                      <div 
                        key={ability.name} 
                        style={{ 
                          borderTop: idx > 0 ? '1px solid var(--border-color)' : 'none', 
                          paddingTop: idx > 0 ? '0.5rem' : '0' 
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <strong style={{ textTransform: 'capitalize', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                            {formatPokemonName(ability.name)}
                          </strong>
                          {ability.isHidden && (
                            <span style={{ fontSize: '0.6rem', backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.05rem 0.25rem', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                              Hidden
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: '1.3' }}>
                          {ability.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>                 <div className="build-feature-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
                  <i className="fa-solid fa-bag-shopping build-feature-icon" style={{ color: '#ec4899' }}></i>
                  <span className="build-feature-label">Suggested Held Item</span>
                  <span className="build-feature-value" style={{ marginBottom: '0.4rem' }}>{heldItem}</span>
                  <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                    {heldItem.split('/').map(item => {
                      const trimmed = item.trim();
                      const imgUrl = getItemImageUrl(trimmed);
                      if (!imgUrl) return null;
                      return (
                        <img 
                          key={trimmed}
                          src={imgUrl} 
                          alt={trimmed} 
                          title={trimmed}
                          style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                        />
                      );
                    })}
                  </div>
                  {heldItem && heldItem !== 'None' && (
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '0.2rem', fontStyle: 'italic', lineHeight: '1.3' }}>
                      {heldItem.split('/').map(item => getItemDesc(item.trim())).join(' / ')}
                    </p>
                  )}
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

            {/* Suggested build directions */}
            <div>
              <h3 className="trainer-section-title" style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>
                <i className="fa-solid fa-layer-group"></i> Suggested Builds
              </h3>
              <div className="build-suggestion-grid">
                {buildSuggestions.map(build => (
                  <div key={build.title} className="build-suggestion-card">
                    <div className="build-suggestion-header">
                      <h4>{build.title}</h4>
                      <span>{build.nature}</span>
                    </div>
                    <div className="build-suggestion-meta">
                      <div>
                        <span>Ability</span>
                        <strong>{build.ability}</strong>
                      </div>                       <div>
                        <span>Item</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '0.85rem' }}>{build.item}</strong>
                          <div style={{ display: 'flex', gap: '0.2rem' }}>
                            {build.item.split('/').map(item => {
                              const trimmed = item.trim();
                              const imgUrl = getItemImageUrl(trimmed);
                              if (!imgUrl) return null;
                              return (
                                <img
                                  key={trimmed}
                                  src={imgUrl}
                                  alt={trimmed}
                                  title={trimmed}
                                  style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                                />
                              );
                            })}
                          </div>
                        </div>
                        {build.item && build.item !== 'None' && (
                          <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.68rem', fontStyle: 'italic', marginTop: '0.1rem', lineHeight: '1.25' }}>
                            {build.item.split('/').map(item => getItemDesc(item.trim())).join(' / ')}
                          </span>
                        )}
                      </div>
                      <div>
                        <span>EVs</span>
                        <strong>{build.evSpread}</strong>
                      </div>
                    </div>
                    <details className="build-move-dropdown">
                      <summary>
                        <span>Recommended moves</span>
                        <i className="fa-solid fa-chevron-down"></i>
                      </summary>
                      <div className="build-dropdown-move-list">
                        {build.moves.map(move => {
                          const typeColor = TYPE_TRANSLATIONS[move.type]?.color || '#999';
                          return (
                            <div key={move.name} className="build-dropdown-move">
                              <div>
                                <strong>{formatPokemonName(move.name)}</strong>
                                <p>{move.desc}</p>
                              </div>
                              <span style={{ '--move-type-color': typeColor }}>{formatPokemonName(move.type)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </div>

            {relatedPokemon.length > 0 && (
              <div className="related-pokemon-section">
                <h3 className="trainer-section-title" style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>
                  <i className="fa-solid fa-users-viewfinder"></i> Related Pokémon
                </h3>
                <div className="related-pokemon-list">
                  {relatedPokemon.map(candidate => (
                    <Link key={candidate.id} href={`/pokemon/${candidate.id}`} className="related-pokemon-card">
                      <img src={candidate.image} alt={candidate.name} />
                      <div className="related-pokemon-info">
                        <strong>{formatPokemonName(candidate.name)}</strong>
                        <span>{candidate.reason}</span>
                        <div className="related-type-list">
                          {candidate.types.map(type => {
                            const trans = TYPE_TRANSLATIONS[type] || { name: type, color: '#999' };
                            return (
                              <em key={type} style={{ '--related-type-color': trans.color }}>
                                {trans.name}
                              </em>
                            );
                          })}
                        </div>
                      </div>
                      <i className="fa-solid fa-chevron-right"></i>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Artwork, matchups and evolution */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Image Card */}
            <div className="detail-floating-image-container">
              <img 
                src={pokemon.image} 
                alt={pokemon.name} 
                className="detail-floating-image"
              />
            </div>

            {/* Description Card */}
            <div className="pokemon-description-card">
              <p>
                {description}
              </p>
            </div>

            {/* Type Matchups */}
            <div className="stats-card-v3 matchup-panel">
              <h3 className="trainer-section-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                <i className="fa-solid fa-shield-heart"></i> Type Matchups
              </h3>
              <div className="matchup-group-list">
                {[
                  { key: 'weak', title: 'Weak to', icon: 'fa-triangle-exclamation' },
                  { key: 'resist', title: 'Resists', icon: 'fa-shield' },
                  { key: 'immune', title: 'Immune', icon: 'fa-ban' },
                  { key: 'neutral', title: 'Neutral', icon: 'fa-circle' }
                ].map(group => (
                  matchupGroups[group.key].length > 0 && (
                    <div key={group.key} className={`matchup-group ${group.key}`}>
                      <div className="matchup-group-title">
                        <i className={`fa-solid ${group.icon}`}></i>
                        <span>{group.title}</span>
                      </div>
                      <div className="matchup-chip-list">
                        {matchupGroups[group.key].map(item => {
                          const trans = TYPE_TRANSLATIONS[item.type] || { name: item.type, color: '#999' };
                          return (
                            <div key={item.type} className={`matchup-chip ${group.key}`} style={{ '--matchup-type-color': trans.color }}>
                              <span>{trans.name}</span>
                              <strong>{item.multiplier === 0 ? '0x' : `${item.multiplier}x`}</strong>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* Evolution Chain */}
            {baseEvolutionChain.length > 1 && (
              <div className="stats-card-v3 evolution-panel">
                <h3 className="trainer-section-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                  <i className="fa-solid fa-dna"></i> Evolution Chain
                </h3>
                <div className="evolution-base-row">
                  {baseEvolutionChain.map((evo, idx) => (
                    <div key={`${evo.id}-${evo.name}`} className="evolution-node-wrap">
                      <Link href={`/pokemon/${evo.id}`} className="evolution-node">
                        <div className="evolution-image-shell">
                          <img src={evo.image} alt={evo.name} />
                        </div>
                        <span className="evolution-stage">{evo.stage}</span>
                        <span className="evolution-name">{formatPokemonName(evo.name)}</span>
                      </Link>
                    </div>
                  ))}
                </div>
                {megaEvolutionBranches.length > 0 && (
                  <div className="mega-branch-row">
                    {megaEvolutionBranches.map((mega, idx) => (
                      <div key={`${mega.id}-${mega.name}`} className="mega-branch-item">
                        <Link href={`/pokemon/${mega.id}`} className="evolution-node mega">
                          <div className="evolution-image-shell">
                            <img className="mega-symbol" src="/mega-symbol.png" alt="" aria-hidden="true" />
                            <img src={mega.image} alt={mega.name} />
                          </div>
                          <span className="evolution-stage">Mega</span>
                          <span className="evolution-name">{formatPokemonName(mega.name)}</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </aside>

        </div>

        <footer className="detail-page-footer">
          <div>
            <strong>Pokedex Battle Guide</strong>
            <span>Pokemon data, type matchups, moves and build suggestions are organized for quick team planning.</span>
          </div>
          <div className="detail-footer-links">
            <span>Data: PokeAPI</span>
            <span>Responsive UI</span>
            <span>Battle-focused details</span>
          </div>
        </footer>

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
