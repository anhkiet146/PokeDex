let cachedPokemonList = null;

export async function getPokemonList() {
  if (cachedPokemonList) {
    console.log('Serving 151 Pokemon from Server Cache.');
    return cachedPokemonList;
  }

  console.log('Fetching 151 Pokemon details from PokéAPI...');
  try {
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

    cachedPokemonList = await Promise.all(detailedPromises);
    return cachedPokemonList;
  } catch (error) {
    console.error('Error fetching fresh Pokemon list:', error);
    throw error;
  }
}
