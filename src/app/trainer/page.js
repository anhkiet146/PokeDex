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
    role: trainer.role || 'user',
    dob: trainer.dob ? (typeof trainer.dob.toISOString === 'function' ? trainer.dob.toISOString() : new Date(trainer.dob).toISOString()) : null,
    ownedPokemon: trainer.ownedPokemon || [],
    teams: trainer.teams || [
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null]
    ],
    createdAt: trainer.createdAt ? (typeof trainer.createdAt.toISOString === 'function' ? trainer.createdAt.toISOString() : new Date(trainer.createdAt).toISOString()) : new Date().toISOString()
  };

  const allPkmn = await getPokemonList();
  const pokemon = allPkmn.filter(p => !p.name.toLowerCase().includes('-mega'));

  return (
    <main className="app-container" style={{ paddingTop: '2.5rem' }}>
      <TrainerClient initialTrainer={plainTrainer} allPokemon={pokemon} />
    </main>
  );
}
