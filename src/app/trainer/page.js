import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getPokemonList } from '@/lib/pokemon';
import TrainerClient from './TrainerClient';

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
