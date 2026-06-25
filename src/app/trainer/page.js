import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import TrainerClient from './TrainerClient';

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

export default async function TrainerPage() {
  const trainer = await getSession();
  
  if (!trainer) {
    redirect('/login');
  }

  // Convert Mongoose document into a plain JS object for client components serialization
  const plainTrainer = {
    id: trainer._id.toString(),
    username: trainer.username,
    displayName: trainer.displayName,
    avatar: trainer.avatar,
    dob: trainer.dob ? trainer.dob.toISOString() : null,
    ownedPokemon: trainer.ownedPokemon || [],
    createdAt: trainer.createdAt.toISOString()
  };

  const pokemon = await getPokemonList();

  return (
    <main className="app-container" style={{ paddingTop: '2.5rem' }}>
      <TrainerClient initialTrainer={plainTrainer} allPokemon={pokemon} />
    </main>
  );
}
