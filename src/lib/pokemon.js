let cachedPokemonList = null;

// Popular Mega Evolution form slugs supported by PokéAPI
const MEGA_SLUGS = [
  'charizard-mega-x', 'charizard-mega-y',
  'blastoise-mega', 'venusaur-mega',
  'gengar-mega', 'alakazam-mega',
  'mewtwo-mega-x', 'mewtwo-mega-y',
  'gyarados-mega', 'kangaskhan-mega',
  'pinsir-mega', 'scizor-mega',
  'heracross-mega', 'houndoom-mega',
];

async function fetchMegas() {
  const results = await Promise.allSettled(
    MEGA_SLUGS.map(async (slug) => {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${slug}`);
      if (!res.ok) throw new Error(`No data for ${slug}`);
      const detail = await res.json();
      return {
        id: detail.id,
        name: detail.name,
        image: detail.sprites.other['official-artwork'].front_default || detail.sprites.front_default,
        types: detail.types.map(t => t.type.name),
        height: detail.height,
        weight: detail.weight,
        abilities: detail.abilities.map(a => a.ability.name),
        stats: detail.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
        isMega: true,
      };
    })
  );
  return results.filter(r => r.status === 'fulfilled').map(r => r.value);
}

export async function getPokemonList() {
  if (cachedPokemonList) {
    console.log('Serving Pokemon list from Server Cache.');
    return cachedPokemonList;
  }

  console.log('Fetching Gen 1-3 Pokemon + Mega Evolutions from PokéAPI...');
  try {
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=386');
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
          height: detail.height,
          weight: detail.weight,
          abilities: detail.abilities.map(a => a.ability.name),
          stats: detail.stats.map(s => ({ name: s.stat.name, value: s.base_stat }))
        };
      } catch (e) {
        const id = poke.url.split('/').filter(Boolean).pop();
        return {
          id: parseInt(id),
          name: poke.name,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
          types: ['normal'],
          height: 10,
          weight: 100,
          abilities: ['overgrow'],
          stats: []
        };
      }
    });

    const [basePokemon, megas] = await Promise.all([
      Promise.all(detailedPromises),
      fetchMegas(),
    ]);

    cachedPokemonList = [...basePokemon, ...megas];
    return cachedPokemonList;
  } catch (error) {
    console.error('Error fetching fresh Pokemon list:', error);
    throw error;
  }
}
