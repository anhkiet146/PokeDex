'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import metaTeams from '@/lib/meta-teams.json';

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

const AVATAR_PRESETS = [
  { name: 'Red', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png' }, // Charizard
  { name: 'Ash', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/658.png' }, // Greninja
  { name: 'Misty', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/121.png' }, // Starmie
  { name: 'Brock', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/95.png' }, // Onix
  { name: 'Pikachu', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' },
  { name: 'Eevee', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png' }
];

const NPC_OPPONENTS = [
  {
    name: "Champion Red",
    avatar: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
    role: "Kanto Champion",
    team: [25, 6, 9, 3, 143, 196] // Pikachu, Charizard, Blastoise, Venusaur, Snorlax, Espeon
  },
  {
    name: "Rival Gary Oak",
    avatar: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/103.png", // Exeggutor
    role: "Elite Rival",
    team: [9, 59, 65, 68, 18, 103] // Blastoise, Arcanine, Alakazam, Machamp, Pidgeot, Exeggutor
  },
  {
    name: "Gym Leader Misty",
    avatar: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/121.png",
    role: "Cerulean Leader",
    team: [121, 55, 195, 131, 186, 222] // Starmie, Golduck, Quagsire, Lapras, Politoed, Corsola
  },
  {
    name: "Champion Lance",
    avatar: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png", // Dragonite
    role: "Indigo Champion",
    team: [149, 130, 6, 142, 148, 208] // Dragonite, Gyarados, Charizard, Aerodactyl, Dragonair, Steelix
  }
];

const TYPE_CHART = {
  normal: { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 0.5, ghost: 0, dragon: 1, steel: 0.5, fairy: 1, dark: 1 },
  fire: { normal: 1, fire: 0.5, water: 0.5, electric: 1, grass: 2, ice: 2, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 2, rock: 0.5, ghost: 1, dragon: 0.5, steel: 2, fairy: 1, dark: 1 },
  water: { normal: 1, fire: 2, water: 0.5, electric: 1, grass: 0.5, ice: 1, fighting: 1, poison: 1, ground: 2, flying: 1, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 0.5, steel: 1, fairy: 1, dark: 1 },
  electric: { normal: 1, fire: 1, water: 2, electric: 0.5, grass: 0.5, ice: 1, fighting: 1, poison: 1, ground: 0, flying: 2, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 0.5, steel: 1, fairy: 1, dark: 1 },
  grass: { normal: 1, fire: 0.5, water: 2, electric: 1, grass: 0.5, ice: 1, fighting: 1, poison: 0.5, ground: 2, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 1, dragon: 0.5, steel: 0.5, fairy: 1, dark: 1 },
  ice: { normal: 1, fire: 0.5, water: 0.5, electric: 1, grass: 2, ice: 0.5, fighting: 1, poison: 1, ground: 2, flying: 2, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, steel: 0.5, fairy: 1, dark: 1 },
  fighting: { normal: 2, fire: 1, water: 1, electric: 1, grass: 1, ice: 2, fighting: 1, poison: 0.5, ground: 1, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dragon: 1, steel: 2, fairy: 0.5, dark: 2 },
  poison: { normal: 1, fire: 1, water: 1, electric: 1, grass: 2, ice: 1, fighting: 1, poison: 0.5, ground: 0.5, flying: 1, psychic: 1, bug: 1, rock: 0.5, ghost: 0.5, dragon: 1, steel: 0, fairy: 2, dark: 1 },
  ground: { normal: 1, fire: 2, water: 1, electric: 2, grass: 0.5, ice: 1, fighting: 1, poison: 2, ground: 1, flying: 0, psychic: 1, bug: 0.5, rock: 2, ghost: 1, dragon: 2, steel: 2, fairy: 1, dark: 1 },
  flying: { normal: 1, fire: 1, water: 1, electric: 0.5, grass: 2, ice: 1, fighting: 2, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 2, rock: 0.5, ghost: 1, dragon: 1, steel: 0.5, fairy: 1, dark: 1 },
  psychic: { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 2, poison: 2, ground: 1, flying: 1, psychic: 0.5, bug: 1, rock: 1, ghost: 1, dragon: 1, steel: 0.5, fairy: 1, dark: 0 },
  bug: { normal: 1, fire: 0.5, water: 1, electric: 1, grass: 2, ice: 1, fighting: 0.5, poison: 0.5, ground: 1, flying: 0.5, psychic: 2, bug: 1, rock: 1, ghost: 0.5, dragon: 1, steel: 0.5, fairy: 0.5, dark: 2 },
  rock: { normal: 1, fire: 2, water: 1, electric: 1, grass: 1, ice: 2, fighting: 0.5, poison: 1, ground: 0.5, flying: 2, psychic: 1, bug: 2, rock: 1, ghost: 1, dragon: 1, steel: 0.5, fairy: 1, dark: 1 },
  ghost: { normal: 0, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 2, bug: 1, rock: 1, ghost: 2, dragon: 1, steel: 1, fairy: 1, dark: 0.5 },
  dragon: { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, steel: 0.5, fairy: 0, dark: 1 },
  steel: { normal: 1, fire: 0.5, water: 0.5, electric: 0.5, grass: 1, ice: 2, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 1, steel: 0.5, fairy: 2, dark: 1 },
  fairy: { normal: 1, fire: 0.5, water: 1, electric: 1, grass: 1, ice: 1, fighting: 2, poison: 0.5, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, steel: 0.5, fairy: 1, dark: 2 },
  dark: { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 0.5, poison: 1, ground: 1, flying: 1, psychic: 2, bug: 1, rock: 1, ghost: 2, dragon: 1, steel: 1, fairy: 0.5, dark: 0.5 }
};

const getTeamSuggestions = (ownedIds, allPkmn, includeUnowned, format, archetype) => {
  let matchingTeams = metaTeams.filter(t => t.format === format && t.archetype === archetype);
  
  if (matchingTeams.length === 0) {
    matchingTeams = metaTeams.filter(t => t.format === format);
  }
  
  if (matchingTeams.length === 0) {
    return null;
  }

  let selectedTeam = matchingTeams[0];

  if (!includeUnowned && ownedIds.length > 0) {
    let bestTeam = matchingTeams[0];
    let maxOwnedCount = -1;
    
    for (const team of matchingTeams) {
      const ownedCount = team.pokemons.filter(p => ownedIds.includes(p.id)).length;
      if (ownedCount > maxOwnedCount) {
        maxOwnedCount = ownedCount;
        bestTeam = team;
      }
    }
    selectedTeam = bestTeam;
  }

  const getRoleIcon = (role) => {
    const r = role.toLowerCase();
    if (r.includes('tailwind') || r.includes('speed') || r.includes('pivot')) return 'fa-wind';
    if (r.includes('special') || r.includes('magic') || r.includes('special attacker')) return 'fa-wand-magic-sparkles';
    if (r.includes('physical') || r.includes('sweeper') || r.includes('attacker') || r.includes('strike')) return 'fa-hand-fist';
    if (r.includes('trick room') || r.includes('support') || r.includes('redirect') || r.includes('defensive') || r.includes('preventer') || r.includes('denial') || r.includes('redirector')) return 'fa-shield-halved';
    if (r.includes('weather') || r.includes('sun') || r.includes('rain') || r.includes('terrain') || r.includes('drizzle')) return 'fa-cloud-sun-rain';
    return 'fa-circle-nodes';
  };

  const detailedPokemons = selectedTeam.pokemons.map(tp => {
    const found = allPkmn.find(p => p.id === tp.id);
    if (found) {
      return {
        ...found,
        roleName: tp.role,
        roleIcon: getRoleIcon(tp.role),
        isOwned: ownedIds.includes(tp.id)
      };
    } else {
      return {
        id: tp.id,
        name: tp.name,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${tp.id}.png`,
        types: ['normal'],
        stats: [],
        roleName: tp.role,
        roleIcon: getRoleIcon(tp.role),
        isOwned: ownedIds.includes(tp.id)
      };
    }
  });

  return {
    teamName: selectedTeam.name,
    description: selectedTeam.description,
    source: selectedTeam.source,
    pokemons: detailedPokemons
  };
};

const analyzeSynergy = (squad) => {
  if (squad.length === 0) return null;
  
  let score = 50;
  const pros = [];
  const cons = [];
  const warnings = [];
  
  const types = squad.flatMap(p => p.types);
  const uniqueTypes = new Set(types);
  
  if (uniqueTypes.size >= 8) {
    score += 15;
    pros.push("Excellent type coverage (8+ unique types).");
  } else if (uniqueTypes.size >= 5) {
    score += 8;
    pros.push("Good type coverage.");
  } else {
    score -= 10;
    cons.push("Poor type coverage. Try adding diverse types.");
  }
  
  const hasFire = types.includes('fire');
  const hasWater = types.includes('water');
  const hasGrass = types.includes('grass');
  if (hasFire && hasWater && hasGrass) {
    score += 12;
    pros.push("Elemental Fire-Water-Grass Core active!");
  } else {
    const missing = [];
    if (!hasFire) missing.push("Fire");
    if (!hasWater) missing.push("Water");
    if (!hasGrass) missing.push("Grass");
    cons.push(`Missing elemental core. Consider: ${missing.join(', ')}.`);
  }

  const hasSteel = types.includes('steel');
  const hasDragon = types.includes('dragon');
  const hasFairy = types.includes('fairy');
  if (hasSteel && hasDragon && hasFairy) {
    score += 12;
    pros.push("Fantasy Core (Dragon-Fairy-Steel) active!");
  }

  const weaknesses = {};
  const typeWeaknessChart = {
    fire: ['water', 'ground', 'rock'],
    water: ['electric', 'grass'],
    grass: ['fire', 'ice', 'poison', 'flying', 'bug'],
    electric: ['ground'],
    normal: ['fighting'],
    ice: ['fire', 'fighting', 'rock', 'steel'],
    fighting: ['flying', 'psychic', 'fairy'],
    poison: ['ground', 'psychic'],
    ground: ['water', 'grass', 'ice'],
    flying: ['electric', 'ice', 'rock'],
    psychic: ['bug', 'ghost', 'dark'],
    bug: ['fire', 'flying', 'rock'],
    rock: ['water', 'grass', 'fighting', 'ground', 'steel'],
    ghost: ['ghost', 'dark'],
    dragon: ['ice', 'dragon', 'fairy'],
    steel: ['fire', 'fighting', 'ground'],
    fairy: ['poison', 'steel'],
    dark: ['fighting', 'bug', 'fairy']
  };

  squad.forEach(p => {
    p.types.forEach(t => {
      const weakList = typeWeaknessChart[t] || [];
      weakList.forEach(w => {
        weaknesses[w] = (weaknesses[w] || 0) + 1;
      });
    });
  });

  Object.keys(weaknesses).forEach(w => {
    if (weaknesses[w] >= 3) {
      score -= 8;
      warnings.push(`Weakness: ${w.toUpperCase()} x${weaknesses[w]} members.`);
    }
  });

  let totalHp = 0;
  let totalSpeed = 0;
  let totalAtkSpAtk = 0;
  
  squad.forEach(p => {
    const hpVal = p.stats.find(s => s.name === 'hp')?.value || 60;
    const speedVal = p.stats.find(s => s.name === 'speed')?.value || 60;
    const atk = p.stats.find(s => s.name === 'attack')?.value || 60;
    const spatk = p.stats.find(s => s.name === 'special-attack')?.value || 60;
    
    totalHp += hpVal;
    totalSpeed += speedVal;
    totalAtkSpAtk += Math.max(atk, spatk);
  });

  const avgHp = totalHp / squad.length;
  const avgSpeed = totalSpeed / squad.length;
  const avgOffense = totalAtkSpAtk / squad.length;

  if (avgHp >= 80) pros.push("High defensive bulk rating.");
  if (avgSpeed >= 80) pros.push("Excellent speed tiers.");
  if (avgOffense >= 85) pros.push("High offensive pressure.");

  score = Math.max(10, Math.min(100, score));

  let grade = 'D';
  if (score >= 90) grade = 'S';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 60) grade = 'C';

  return {
    score,
    grade,
    pros,
    cons: cons.slice(0, 3),
    warnings: warnings.slice(0, 3),
    stats: {
      hp: Math.min(100, Math.round(avgHp)),
      speed: Math.min(100, Math.round(avgSpeed)),
      offense: Math.min(100, Math.round(avgOffense)),
      coverage: Math.min(100, uniqueTypes.size * 5 + 10)
    }
  };
};

const calculateMatchup = (userSquad, npcTeamIds, allPkmn) => {
  if (userSquad.length === 0) return { winRate: 0, advice: "Assemble a team to simulate battle!" };

  const npcPkmn = allPkmn.filter(p => npcTeamIds.includes(p.id));
  let userPoints = 0;
  let npcPoints = 0;
  const counters = [];
  const threats = [];

  const typeChart = {
    fire: { water: 0.5, grass: 2, fire: 0.5, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    normal: { rock: 0.5, ghost: 0, steel: 0.5 },
    ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground: { fire: 2, grass: 0.5, electric: 2, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying: { grass: 2, electric: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
    dragon: { dragon: 2, steel: 0.5, fairy: 0 },
    steel: { fire: 0.5, water: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
    fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
    dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 }
  };

  userSquad.forEach(u => {
    npcPkmn.forEach(n => {
      let uMult = 1;
      let nMult = 1;
      u.types.forEach(ut => {
        n.types.forEach(nt => {
          if (typeChart[ut] && typeChart[ut][nt] !== undefined) uMult *= typeChart[ut][nt];
          if (typeChart[nt] && typeChart[nt][ut] !== undefined) nMult *= typeChart[nt][ut];
        });
      });

      if (uMult > 1) {
        userPoints += 5;
        if (uMult >= 2 && !counters.some(c => c.user === u.name && c.npc === n.name)) {
          counters.push({ user: u.name, npc: n.name });
        }
      }
      if (nMult > 1) {
        npcPoints += 5;
        if (nMult >= 2 && !threats.some(t => t.user === n.name && t.npc === u.name)) {
          threats.push({ user: n.name, npc: u.name });
        }
      }
    });
  });

  const diff = userPoints - npcPoints;
  let winRate = 50 + (diff * 2);
  winRate = Math.max(10, Math.min(99, winRate));

  let advice = "Your team is balanced. Play carefully and leverage element swaps.";
  if (winRate >= 75) advice = "Excellent matchup! You have heavy counters against their key sweepers. Lead with type advantages.";
  else if (winRate >= 60) advice = "Favorable match. Focus on taking down their principal threats before switching in your sweepers.";
  else if (winRate <= 35) advice = "Difficult match! Opponent has deep type advantages against your squad. Edit your active team.";
  else if (winRate < 50) advice = "Slightly unfavorable. Prepare screens or status conditions to offset their offensive threats.";

  return { winRate, advice, counters: counters.slice(0, 3), threats: threats.slice(0, 3) };
};

export default function TrainerClient({ initialTrainer, allPokemon }) {
  const [trainer, setTrainer] = useState(initialTrainer);
  const [activeTab, setActiveTab] = useState('profile'); // profile | collection | simulator | matchups | settings | admin
  
  // Profile edit settings
  const [displayName, setDisplayName] = useState(trainer.displayName);
  const [avatar, setAvatar] = useState(trainer.avatar);
  const [dob, setDob] = useState(trainer.dob ? new Date(trainer.dob).toISOString().split('T')[0] : '');
  const [editSuccess, setEditSuccess] = useState('');
  const [editError, setEditError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Search collection states
  const [pokeSearch, setPokeSearch] = useState('');
  const [collectionSearch, setCollectionSearch] = useState('');

  // Team suggester states
  const [suggestScope, setSuggestScope] = useState('owned'); // owned | all
  const [suggestFormat, setSuggestFormat] = useState('single'); // single | double
  const [suggestArchetype, setSuggestArchetype] = useState('balanced'); // balanced | offense | defense

  // Custom team builder states
  const [teams, setTeams] = useState([
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null]
  ]);
  const [activeTeamIdx, setActiveTeamIdx] = useState(0);
  const [showPokeSelector, setShowPokeSelector] = useState(false);
  const [activeSlotIdx, setActiveSlotIdx] = useState(null);
  
  // AI strategist coach states
  const [aiReport, setAiReport] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStep, setAiStep] = useState('');

  // Admin settings states
  const [adminTrainers, setAdminTrainers] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Type matchups graph states
  const [selectedGraphType, setSelectedGraphType] = useState('fire');
  const [matchupDirection, setMatchupDirection] = useState('offensive'); // offensive | defensive

  const router = useRouter();
  const isAdmin = trainer.username === 'admin' || trainer.role === 'admin';

  // Load saved custom teams from local storage on mount
  useEffect(() => {
    const trainerId = trainer.id || trainer._id;
    if (typeof window !== 'undefined' && trainerId) {
      const saved = localStorage.getItem(`trainer_teams_${trainerId}`);
      if (saved) {
        try {
          setTeams(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse trainer teams", e);
        }
      }
    }
  }, [trainer.id || trainer._id]);
  
  const handleSaveTeams = (newTeams) => {
    setTeams(newTeams);
    const trainerId = trainer.id || trainer._id;
    if (typeof window !== 'undefined' && trainerId) {
      localStorage.setItem(`trainer_teams_${trainerId}`, JSON.stringify(newTeams));
    }
    setAiReport(null); // Reset AI report when team changes
  };

  const handleAddPokemonToSlot = (pokemonId) => {
    const newTeams = [...teams];
    newTeams[activeTeamIdx][activeSlotIdx] = pokemonId;
    handleSaveTeams(newTeams);
    setShowPokeSelector(false);
    setActiveSlotIdx(null);
  };

  const handleRemovePokemonFromSlot = (slotIdx) => {
    const newTeams = [...teams];
    newTeams[activeTeamIdx][slotIdx] = null;
    handleSaveTeams(newTeams);
  };

  const handleRunAiAnalysis = () => {
    const activeTeam = teams[activeTeamIdx];
    const activeTeamPokemon = activeTeam.map(id => allPokemon.find(p => p.id === id)).filter(Boolean);
    if (activeTeamPokemon.length < 3) {
      alert("Add at least 3 Pokémon to your team before requesting AI analysis.");
      return;
    }

    setAiLoading(true);
    setAiReport(null);
    
    const steps = [
      "AI Professor Oak is analyzing team type coverage...",
      "Simulating offensive damage matchups against current VGC meta...",
      "Evaluating defensive bulk and team element synergy...",
      "Determining lead pairs and speed control options...",
      "Finalizing VGC doubles deployment guides..."
    ];
    
    let currentStep = 0;
    setAiStep(steps[0]);
    
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setAiStep(steps[currentStep]);
      } else {
        clearInterval(interval);
        
        const primaryTypes = activeTeamPokemon.flatMap(p => p.types);
        
        let ace = activeTeamPokemon[0];
        let maxOffVal = 0;
        activeTeamPokemon.forEach(p => {
          const atk = p.stats.find(s => s.name === 'attack')?.value || 60;
          const spatk = p.stats.find(s => s.name === 'special-attack')?.value || 60;
          const offVal = Math.max(atk, spatk);
          if (offVal > maxOffVal) {
            maxOffVal = offVal;
            ace = p;
          }
        });
        
        let leads = [];
        let backline = [];
        if (activeTeamPokemon.length >= 4) {
          const sortedBySpeed = [...activeTeamPokemon].sort((a,b) => {
            const spA = a.stats.find(s => s.name === 'speed')?.value || 60;
            const spB = b.stats.find(s => s.name === 'speed')?.value || 60;
            return spB - spA;
          });
          leads = [sortedBySpeed[0], sortedBySpeed[1]];
          backline = [sortedBySpeed[2], sortedBySpeed[3]];
        } else {
          leads = [activeTeamPokemon[0], activeTeamPokemon[1] || activeTeamPokemon[0]];
          backline = [activeTeamPokemon[2] || activeTeamPokemon[0]];
        }
        
        let opGuide = "";
        const hasWater = primaryTypes.includes('water');
        const hasFire = primaryTypes.includes('fire');
        const hasGrass = primaryTypes.includes('grass');
        const hasElectric = primaryTypes.includes('electric');
        const hasFlying = primaryTypes.includes('flying');
        const hasDragon = primaryTypes.includes('dragon');
        const hasSteel = primaryTypes.includes('steel');
        const hasFairy = primaryTypes.includes('fairy');
        
        // Determine team archetype and build a competitive guide
        const offensivePoke = [...activeTeamPokemon].sort((a, b) => {
          const getOff = p => Math.max(
            p.stats.find(s => s.name === 'attack')?.value || 0,
            p.stats.find(s => s.name === 'special-attack')?.value || 0
          );
          return getOff(b) - getOff(a);
        });
        const bulkyPoke = [...activeTeamPokemon].sort((a, b) => {
          const getDefBulk = p => (p.stats.find(s => s.name === 'hp')?.value || 0) + (p.stats.find(s => s.name === 'defense')?.value || 0);
          return getDefBulk(b) - getDefBulk(a);
        });
        const fastPoke = [...activeTeamPokemon].sort((a, b) => {
          return (b.stats.find(s => s.name === 'speed')?.value || 0) - (a.stats.find(s => s.name === 'speed')?.value || 0);
        });
        const slowPoke = [...activeTeamPokemon].sort((a, b) => {
          return (a.stats.find(s => s.name === 'speed')?.value || 0) - (b.stats.find(s => s.name === 'speed')?.value || 0);
        });

        const avgSpeed = activeTeamPokemon.reduce((acc, p) => acc + (p.stats.find(s => s.name === 'speed')?.value || 60), 0) / activeTeamPokemon.length;
        const avgHpDef = activeTeamPokemon.reduce((acc, p) => acc + (p.stats.find(s => s.name === 'hp')?.value || 60) + (p.stats.find(s => s.name === 'defense')?.value || 60), 0) / activeTeamPokemon.length;
        const isTrickRoomCandidate = avgSpeed < 55;
        const isTailwindCandidate = avgSpeed >= 55 && avgSpeed < 85;

        if (hasFire && hasWater && hasGrass) {
          opGuide = `Classic Fire-Water-Grass core detected. In VGC Doubles, open with ${leads[0]?.name || 'your lead'} and ${leads[1]?.name || 'your support'} to establish board control. The FWG core provides natural offensive and defensive cycling — switch into your Water-type to absorb Fire attacks, your Grass-type to absorb Water attacks, and your Fire-type to resist Grass-type moves. Use spread moves (e.g. Heat Wave, Surf) to pressure both opponents simultaneously. Protect your ace on turn 1 to scout opponent leads.`;
        } else if (hasDragon && hasSteel && hasFairy) {
          opGuide = `Dragon-Steel-Fairy core active ("Fantasy Core"). In VGC, your Steel-type provides Intimidate or redirection support (Follow Me / Rage Powder) to protect your Dragon sweeper. Lead with your Fairy or Steel support to defuse opposing Dragon-type threats. Your Dragon attacker should be brought in mid-game after screens or Tailwind are established. Use your Fairy's immunity to Dragon-type moves as a free switch-in pivot to reset board advantage.`;
        } else if (isTrickRoomCandidate) {
          opGuide = `Your team's low average Speed (${Math.round(avgSpeed)}) suits a Trick Room strategy. Lead with your bulkiest slow Pokémon to set Trick Room on Turn 1 while using Protect on your primary attacker to scout. Once Trick Room is active, your slowest members move first — pivot aggressively and use high-power low-PP moves (Close Combat, Draco Meteor) to close games fast. Trick Room typically lasts 5 turns; plan your win condition within that window.`;
        } else if (isTailwindCandidate) {
          opGuide = `Your team benefits from Tailwind speed control (avg Speed: ${Math.round(avgSpeed)}). Lead with a Flying-type or fast support Pokémon to establish Tailwind on Turn 1, doubling your team's Speed for 4 turns. With speed advantage secured, your offensive Pokémon (${offensivePoke[0]?.name || 'your attacker'}) can outspeed and KO threats before they move. Coordinate spread moves with your fast attacker to pressure both opponents simultaneously.`;
        } else {
          opGuide = `High-speed offensive team (avg Speed: ${Math.round(avgSpeed)}). Prioritize aggressive leads — ${leads[0]?.name || 'your lead'} can outspeed most opponents and apply immediate pressure. Use your fastest Pokémon to control the pace with priority moves or speed tie resolution. Protect on Turn 1 is standard VGC practice to scout opponent moves. Bring your bulkiest Pokémon (${bulkyPoke[0]?.name || 'your support'}) as a pivot to absorb super-effective hits and create safe switches for your primary attacker.`;
        }
        
        setAiReport({
          ace: ace,
          leads: leads,
          backline: backline,
          opGuide: opGuide
        });
        setAiLoading(false);
      }
    }, 500);
  };
  
  const ownedPokemonDetails = allPokemon.filter(p => trainer.ownedPokemon.includes(p.id));
  const suggestionResult = getTeamSuggestions(trainer.ownedPokemon, allPokemon, suggestScope === 'all', suggestFormat, suggestArchetype);
  const suggestedTeam = suggestionResult ? suggestionResult.pokemons : [];

  // Compute synergy for the currently active custom team
  const activeTeamMembers = (teams[activeTeamIdx] || [])
    .filter(Boolean)
    .map(id => allPokemon.find(p => p.id === id))
    .filter(Boolean);
  const activeTeamSynergy = analyzeSynergy(activeTeamMembers);

  // Fetch trainers for Admin
  const fetchAdminTrainers = async () => {
    setAdminLoading(true);
    setAdminError('');
    try {
      const res = await fetch('/api/admin/trainers');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch trainers');
      }
      setAdminTrainers(data.trainers || []);
    } catch (err) {
      setAdminError(err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'admin' && isAdmin) {
      fetchAdminTrainers();
    }
  }, [activeTab, isAdmin]);

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
        throw new Error(data.error || 'Failed to update profile');
      }

      setTrainer(data.trainer);
      setEditSuccess('Profile updated successfully!');
      router.refresh();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  // Toggle Owned Pokemon
  const handleTogglePokemon = async (pokemonId, isOwned) => {
    const action = isOwned ? 'remove' : 'add';
    try {
      const res = await fetch('/api/trainer/pokemon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pokemonId, action }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update collection');
      }

      setTrainer(data.trainer);
    } catch (err) {
      alert(err.message);
    }
  };



  // Delete Trainer Account
  const handleDeleteTrainer = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete trainer "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/trainers?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete trainer');
      }
      setAdminTrainers(prev => prev.filter(t => t._id !== id));
      router.refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  // Filter owned pokemon list for table search
  const filteredOwnedPokemon = ownedPokemonDetails.filter(p => 
    p.name.toLowerCase().includes(collectionSearch.toLowerCase()) || 
    p.id.toString().includes(collectionSearch)
  );

  // Search filter for collection select list
  const filteredSearchPokemon = allPokemon.filter(p => 
    p.name.toLowerCase().includes(pokeSearch.toLowerCase()) || 
    p.id.toString().includes(pokeSearch)
  );

  // Helper to calculate mock level based on pokemon id
  const getPokeLevel = (id) => {
    return Math.floor((id * 13) % 41) + 50; // Levels 50 to 90
  };

  return (
    <div className="trainer-layout">
      
      {/* 1. Left Navigation Menu (Screenshot 2) */}
      <aside className="trainer-sidebar-nav">
        <button 
          className={`trainer-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <i className="fa-solid fa-id-card"></i> Trainer Profile
        </button>
        
        {!isAdmin && (
          <button 
            className={`trainer-nav-item ${activeTab === 'collection' ? 'active' : ''}`}
            onClick={() => setActiveTab('collection')}
          >
            <i className="fa-solid fa-layer-group"></i> My Pokemon
          </button>
        )}



        {!isAdmin && (
          <button 
            className={`trainer-nav-item ${activeTab === 'matchups' ? 'active' : ''}`}
            onClick={() => setActiveTab('matchups')}
          >
            <i className="fa-solid fa-diagram-project"></i> Type Matchups
          </button>
        )}
        
        {!isAdmin && (
          <button 
            className={`trainer-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className="fa-solid fa-sliders"></i> Account Settings
          </button>
        )}

        {isAdmin && (
          <button 
            className={`trainer-nav-item ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <i className="fa-solid fa-users-gear"></i> Manage Accounts
          </button>
        )}
        
        <button 
          className="trainer-nav-item trainer-nav-item--logout"
          onClick={handleLogout}
        >
          <i className="fa-solid fa-right-from-bracket"></i> Logout
        </button>
      </aside>

      {/* 2. Main Content Dashboard */}
      <section>
        
        {activeTab === 'profile' && (
          <div>
            
            {/* Trainer Profile Card (Screenshot 2) */}
            <div className="trainer-profile-card">
              {isAdmin ? (
                <img src={trainer.avatar} alt={trainer.displayName} className="trainer-card-avatar" />
              ) : (
                <div className="avatar-container" onClick={() => setActiveTab('settings')}>
                  <img src={trainer.avatar} alt={trainer.displayName} className="trainer-card-avatar" />
                  <div className="avatar-overlay">
                    <i className="fa-solid fa-pen-to-square"></i>
                    <span>Change Avatar</span>
                  </div>
                </div>
              )}
              <div className="trainer-card-details">
                <h2>{trainer.displayName}</h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 800, marginTop: '0.15rem' }}>
                  ID: #{(trainer.id || trainer._id || '00000000').substring(0, 8).toUpperCase()}
                </div>
                <div className="trainer-card-meta">
                  <span><i className="fa-solid fa-calendar-days"></i> Joined {trainer.createdAt ? new Date(trainer.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'June 2026'}</span>
                  <span><i className="fa-solid fa-trophy"></i> {isAdmin ? 0 : Math.floor(trainer.ownedPokemon.length * 1.5)} Badges</span>
                  <span><i className="fa-solid fa-file-invoice"></i> {isAdmin ? 0 : trainer.ownedPokemon.length} Entries</span>
                </div>
              </div>
              {!isAdmin && (
                <button className="btn-login" style={{ background: '#ffffff', color: 'var(--text-primary)', border: '1px solid var(--border-color)', height: '40px', padding: '0 1.2rem' }} onClick={() => setActiveTab('settings')}>
                  Edit Profile
                </button>
              )}
            </div>

            {!isAdmin && (
              <>
                {/* 3 Custom Teams Builder */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', gap: '1rem' }}>
                    <h3 className="trainer-section-title" style={{ marginBottom: 0 }}>
                      <i className="fa-solid fa-users"></i> Tactical Team Builder
                    </h3>
                    
                    {/* Team index selectors */}
                    <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.2rem', borderRadius: '8px' }}>
                      {[0, 1, 2].map(idx => (
                        <button 
                          key={idx}
                          type="button"
                          style={{
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            background: activeTeamIdx === idx ? '#ffffff' : 'transparent',
                            color: activeTeamIdx === idx ? 'var(--text-primary)' : 'var(--text-secondary)',
                            boxShadow: activeTeamIdx === idx ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.15s'
                          }}
                          onClick={() => {
                            setActiveTeamIdx(idx);
                            setAiReport(null);
                          }}
                        >
                          Team {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3x2 Grid of slots */}
                  <div className="vanguard-grid">
                    {teams[activeTeamIdx].map((id, slotIdx) => {
                      const p = id ? allPokemon.find(item => item.id === id) : null;
                      if (p) {
                        return (
                          <div key={slotIdx} className="vanguard-card" style={{ position: 'relative' }}>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePokemonFromSlot(slotIdx);
                              }}
                              style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: 'none',
                                color: '#ef4444',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                zIndex: 10
                              }}
                              title="Remove Pokémon"
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                            <div className="vanguard-header">
                              <span className="vanguard-id">#{p.id.toString().padStart(4, '0')}</span>
                            </div>
                            <div className="vanguard-body" style={{ marginBottom: 0 }}>
                              <img src={p.image} alt={p.name} className="vanguard-img" />
                              <div className="vanguard-info">
                                <h4 className="vanguard-name">{p.name}</h4>
                                <div style={{ display: 'flex', gap: '0.3rem' }}>
                                  {p.types.map(t => (
                                    <span key={t} className="type-badge" style={{ backgroundColor: TYPE_TRANSLATIONS[t]?.color || '#999', fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                      {TYPE_TRANSLATIONS[t]?.name || t}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div 
                            key={slotIdx} 
                            onClick={() => {
                              setActiveSlotIdx(slotIdx);
                              setShowPokeSelector(true);
                            }}
                            style={{
                              height: '115px',
                              border: '2px dashed var(--border-color)',
                              borderRadius: '16px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: 'var(--text-secondary)',
                              background: '#fafafa',
                              transition: 'all 0.2s',
                            }}
                            className="empty-slot-card"
                          >
                            <i className="fa-solid fa-plus" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#cbd5e1' }}></i>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Empty Slot</span>
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>

                {/* Team Selector Modal */}
                {showPokeSelector && (
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                  }}>
                    <div style={{
                      background: '#ffffff',
                      borderRadius: '20px',
                      width: '100%',
                      maxWidth: '500px',
                      maxHeight: '80vh',
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '1.5rem',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Add Pokémon to Team {activeTeamIdx + 1} (Slot #{activeSlotIdx + 1})</h3>
                        <button 
                          onClick={() => {
                            setShowPokeSelector(false);
                            setActiveSlotIdx(null);
                          }}
                          style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                      
                      <div style={{ overflowY: 'auto', flexGrow: 1, paddingRight: '0.5rem' }}>
                        {ownedPokemonDetails.length > 0 ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.8rem' }}>
                            {ownedPokemonDetails.map(p => {
                              const isAlreadyInTeam = teams[activeTeamIdx].includes(p.id);
                              return (
                                <div 
                                  key={p.id}
                                  onClick={() => !isAlreadyInTeam && handleAddPokemonToSlot(p.id)}
                                  style={{
                                    padding: '0.8rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '12px',
                                    textAlign: 'center',
                                    cursor: isAlreadyInTeam ? 'not-allowed' : 'pointer',
                                    opacity: isAlreadyInTeam ? 0.5 : 1,
                                    background: isAlreadyInTeam ? '#f8fafc' : '#ffffff',
                                    transition: 'all 0.15s'
                                  }}
                                  className={isAlreadyInTeam ? '' : 'pokemon-select-option'}
                                >
                                  <img src={p.image} alt={p.name} style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
                                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize', display: 'block', marginTop: '0.3rem' }}>{p.name}</span>
                                  {isAlreadyInTeam && <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', display: 'block' }}>In Team</span>}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
                            <p style={{ fontSize: '0.9rem' }}>You don&apos;t own any Pokémon yet.</p>
                            <button 
                              onClick={() => {
                                setShowPokeSelector(false);
                                setActiveTab('collection');
                              }}
                              className="btn-login"
                              style={{ height: '32px', fontSize: '0.8rem', marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center' }}
                            >
                              Go to My Pokémon
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Team Assessment (If active team contains members) */}
                {teams[activeTeamIdx].filter(Boolean).length > 0 && activeTeamSynergy && (
                  <div className="collection-table-card" style={{ marginBottom: '2rem', borderLeft: '5px solid var(--primary-color)' }}>
                    <h3 className="trainer-section-title">
                      <i className="fa-solid fa-circle-nodes" style={{ color: 'var(--primary-color)' }}></i> Team Synergy Assessment
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                      Calculates element core synergies, defensive coverages, and weaknesses in your active team.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
                        <div className="synergy-grade-shield">
                          <span className="grade-title">GRADE</span>
                          <span className="grade-value">{activeTeamSynergy.grade}</span>
                        </div>
 
                        <div className="synergy-stats-grid">
                          <div className="synergy-stat-group">
                            <span className="stat-label">Offense Rating: {activeTeamSynergy.stats.offense}%</span>
                            <div className="hp-bar-container" style={{ height: '6px', marginTop: '0.25rem' }}>
                              <div className="hp-bar-fill" style={{ width: `${activeTeamSynergy.stats.offense}%`, background: '#ef4444' }}></div>
                            </div>
                          </div>
                          <div className="synergy-stat-group">
                            <span className="stat-label">Defense Bulk: {activeTeamSynergy.stats.hp}%</span>
                            <div className="hp-bar-container" style={{ height: '6px', marginTop: '0.25rem' }}>
                              <div className="hp-bar-fill" style={{ width: `${activeTeamSynergy.stats.hp}%`, background: '#10b981' }}></div>
                            </div>
                          </div>
                          <div className="synergy-stat-group">
                            <span className="stat-label">Speed Tier: {activeTeamSynergy.stats.speed}%</span>
                            <div className="hp-bar-container" style={{ height: '6px', marginTop: '0.25rem' }}>
                              <div className="hp-bar-fill" style={{ width: `${activeTeamSynergy.stats.speed}%`, background: '#6390f0' }}></div>
                            </div>
                          </div>
                          <div className="synergy-stat-group">
                            <span className="stat-label">Type Coverage: {activeTeamSynergy.stats.coverage}%</span>
                            <div className="hp-bar-container" style={{ height: '6px', marginTop: '0.25rem' }}>
                              <div className="hp-bar-fill" style={{ width: `${activeTeamSynergy.stats.coverage}%`, background: '#f59e0b' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
 
                      <div className="synergy-feedback-grid">
                        <div className="synergy-feedback-card pros">
                          <h4>
                            <i className="fa-solid fa-circle-check"></i> Strengths
                          </h4>
                          <ul>
                            {activeTeamSynergy.pros.map((p, i) => <li key={i}>{p}</li>)}
                          </ul>
                        </div>
 
                        <div className="synergy-feedback-card cons">
                          <h4>
                            <i className="fa-solid fa-triangle-exclamation"></i> Weaknesses & Risks
                          </h4>
                          {activeTeamSynergy.cons.length > 0 || activeTeamSynergy.warnings.length > 0 ? (
                            <ul>
                              {activeTeamSynergy.cons.map((c, i) => <li key={i}>{c}</li>)}
                              {activeTeamSynergy.warnings.map((w, i) => <li key={i} style={{ color: '#be185d', fontWeight: 600 }}>{w}</li>)}
                            </ul>
                          ) : (
                            <p style={{ fontSize: '0.75rem', color: '#92400e' }}>No structural flaws detected in core types.</p>
                          )}
                        </div>
 
                        <div className="synergy-feedback-card warnings">
                          <h4>
                            <i className="fa-solid fa-screwdriver-wrench"></i> How to Improve
                          </h4>
                          <div style={{ fontSize: '0.75rem', lineHeight: 1.6, color: '#334155' }}>
                            {(() => {
                              const activeTeamPokemon = teams[activeTeamIdx].map(id => allPokemon.find(p => p.id === id)).filter(Boolean);
                              const types = activeTeamPokemon.flatMap(p => p.types);
                              const hasFire = types.includes('fire');
                              const hasWater = types.includes('water');
                              const hasGrass = types.includes('grass');
                              const hasSteel = types.includes('steel');
                              const hasDragon = types.includes('dragon');
                              const hasFairy = types.includes('fairy');
                              
                              const recs = [];
                              
                              if (!(hasFire && hasWater && hasGrass)) {
                                const missing = [];
                                if (!hasFire) missing.push('Fire');
                                if (!hasWater) missing.push('Water');
                                if (!hasGrass) missing.push('Grass');
                                recs.push(`Add a ${missing.join(' or ')} type to complete the Fire-Water-Grass elemental core. This core is a foundational competitive strategy (per Smogon) providing natural offensive and defensive cycling.`);
                              }
                              
                              if (!(hasSteel && hasDragon && hasFairy)) {
                                const missing = [];
                                if (!hasSteel) missing.push('Steel');
                                if (!hasDragon) missing.push('Dragon');
                                if (!hasFairy) missing.push('Fairy');
                                recs.push(`Consider adding ${missing.join(' or ')} to activate the Dragon-Steel-Fairy core. This combination gives excellent mutual defensive coverage, with Steel resisting Fairy, Fairy beating Dragon, and Dragon providing raw offensive pressure.`);
                              }
                              
                              activeTeamSynergy.warnings.forEach(w => {
                                recs.push(`Address shared weakness: ${w} — consider adding a team member that resists this type, or carry a coverage move to deter switch-ins.`);
                              });
                              
                              if (recs.length === 0) {
                                return <p style={{ color: '#166534', fontWeight: 600, margin: 0 }}><i className="fa-solid fa-circle-check"></i> Your team composition is well-balanced and covers key competitive cores.</p>;
                              }
                              
                              return (
                                <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                                  {recs.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Team Strategy Coach */}
                <div className="collection-table-card" style={{ marginBottom: '2rem' }}>
                  <h3 className="trainer-section-title" style={{ fontSize: '1.25rem' }}>
                    <i className="fa-solid fa-brain" style={{ color: 'var(--primary-color)' }}></i> AI Team Strategy Coach
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                    Get expert competitive deployment, operational tips, and ace analysis from our strategic AI engine.
                  </p>

                  {teams[activeTeamIdx].filter(Boolean).length < 3 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#f8fafc', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
                      <i className="fa-solid fa-robot" style={{ fontSize: '2.5rem', color: '#cbd5e1', marginBottom: '0.8rem', display: 'block' }}></i>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                        Add at least 3 Pokémon to your team to enable AI Strategic Analysis.
                      </p>
                    </div>
                  ) : (
                    <div>
                      {!aiLoading && !aiReport && (
                        <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                          <button 
                            onClick={handleRunAiAnalysis}
                            className="btn-login"
                            style={{ height: '42px', padding: '0 2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                          >
                            <i className="fa-solid fa-microchip"></i> Consult AI Strategy Coach
                          </button>
                        </div>
                      )}

                      {aiLoading && (
                        <div style={{ textAlign: 'center', padding: '2.5rem', background: 'rgba(255,255,255,0.6)', border: '1px solid var(--border-color)', borderRadius: '16px' }} className="glowing-ai-loading">
                          <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2.5rem', color: 'var(--primary-color)', marginBottom: '1rem' }}></i>
                          <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>{aiStep}</p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AI Professor Oak is simulating VGC battle matchups...</span>
                        </div>
                      )}

                      {aiReport && (
                        <div style={{
                          background: 'rgba(255,255,255,0.8)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '16px',
                          padding: '1.5rem',
                          boxShadow: '0 4px 20px rgba(99, 144, 240, 0.05)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '4px',
                            height: '100%',
                            background: 'linear-gradient(to bottom, #6390f0, #ec4899)'
                          }}></div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <i className="fa-solid fa-chart-pie" style={{ color: '#6390f0' }}></i> AI Strategic Report
                            </h4>
                            <button 
                              onClick={handleRunAiAnalysis}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary-color)',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                              }}
                            >
                              Re-analyze
                            </button>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem' }}>
                            {/* Lead & Backline Deployment */}
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.02)' }}>
                              <h5 style={{ margin: '0 0 0.8rem 0', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                <i className="fa-solid fa-users-viewfinder" style={{ color: '#10b981', marginRight: '0.3rem' }}></i> Optimal VGC Lead & Backline
                              </h5>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                                <div>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>LEADS:</span>
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {aiReport.leads.map((p, idx) => (
                                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#fff', padding: '0.3rem 0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                        <img src={p.image} alt={p.name} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize' }}>{p.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>BACKLINE:</span>
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {aiReport.backline.map((p, idx) => (
                                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#fff', padding: '0.3rem 0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                        <img src={p.image} alt={p.name} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize' }}>{p.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Carry/Ace */}
                            <div style={{ background: '#fef3f7', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(236, 72, 153, 0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{ width: '60px', height: '60px', background: '#fff', borderRadius: '50%', border: '1.5px solid #ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src={aiReport.ace.image} alt={aiReport.ace.name} style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                              </div>
                              <div>
                                <h5 style={{ margin: '0 0 0.2rem 0', fontSize: '0.85rem', fontWeight: 800, color: '#be185d' }}>
                                  <i className="fa-solid fa-star" style={{ marginRight: '0.3rem' }}></i> Primary Carry (Ace)
                                </h5>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#9d174d' }}>
                                  <strong style={{ textTransform: 'capitalize' }}>{aiReport.ace.name}</strong> has been identified as your ace due to its high offensive stats. Focus on setting up Tailwind or screen support to maximize its damage.
                                </p>
                              </div>
                            </div>

                            {/* Operating Guide */}
                            <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(22, 163, 74, 0.05)' }}>
                              <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 800, color: '#166534' }}>
                                <i className="fa-solid fa-route" style={{ marginRight: '0.3rem' }}></i> Competitive Strategy Guide
                              </h5>
                              <p style={{ margin: 0, fontSize: '0.8rem', color: '#166534', lineHeight: 1.5 }}>
                                {aiReport.opGuide}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Smart Team Suggester (Moved to Profile Tab) */}
                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <i className="fa-solid fa-wand-magic-sparkles" style={{ color: 'var(--primary-color)' }}></i> Smart Team Suggester
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        Get recommendations for competitive singles or doubles layouts.
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                      <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.2rem', borderRadius: '8px' }}>
                        <button 
                          type="button"
                          style={{ 
                            padding: '0.4rem 0.8rem', 
                            fontSize: '0.75rem', 
                            fontWeight: 700, 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: 'pointer',
                            background: suggestScope === 'owned' ? '#ffffff' : 'transparent',
                            color: suggestScope === 'owned' ? 'var(--text-primary)' : 'var(--text-secondary)',
                            boxShadow: suggestScope === 'owned' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                          }}
                          onClick={() => setSuggestScope('owned')}
                        >
                          Only My Pokemon
                        </button>
                        <button 
                          type="button"
                          style={{ 
                            padding: '0.4rem 0.8rem', 
                            fontSize: '0.75rem', 
                            fontWeight: 700, 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: 'pointer',
                            background: suggestScope === 'all' ? '#ffffff' : 'transparent',
                            color: suggestScope === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)',
                            boxShadow: suggestScope === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                          }}
                          onClick={() => setSuggestScope('all')}
                        >
                          Include Unowned
                        </button>
                      </div>

                      <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.2rem', borderRadius: '8px' }}>
                        <button 
                          type="button"
                          style={{ 
                            padding: '0.4rem 0.8rem', 
                            fontSize: '0.75rem', 
                            fontWeight: 700, 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: 'pointer',
                            background: suggestFormat === 'single' ? '#ffffff' : 'transparent',
                            color: suggestFormat === 'single' ? 'var(--text-primary)' : 'var(--text-secondary)',
                            boxShadow: suggestFormat === 'single' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                          }}
                          onClick={() => setSuggestFormat('single')}
                        >
                          Singles
                        </button>
                        <button 
                          type="button"
                          style={{ 
                            padding: '0.4rem 0.8rem', 
                            fontSize: '0.75rem', 
                            fontWeight: 700, 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: 'pointer',
                            background: suggestFormat === 'double' ? '#ffffff' : 'transparent',
                            color: suggestFormat === 'double' ? 'var(--text-primary)' : 'var(--text-secondary)',
                            boxShadow: suggestFormat === 'double' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                          }}
                          onClick={() => setSuggestFormat('double')}
                        >
                          Doubles (VGC)
                        </button>
                      </div>

                      <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.2rem', borderRadius: '8px' }}>
                        {['balanced', 'offense', 'defense'].map(arch => (
                          <button 
                            key={arch}
                            type="button"
                            style={{ 
                              padding: '0.4rem 0.8rem', 
                              fontSize: '0.75rem', 
                              fontWeight: 700, 
                              border: 'none', 
                              borderRadius: '6px', 
                              cursor: 'pointer',
                              background: suggestArchetype === arch ? '#ffffff' : 'transparent',
                              color: suggestArchetype === arch ? 'var(--text-primary)' : 'var(--text-secondary)',
                              boxShadow: suggestArchetype === arch ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                              textTransform: 'capitalize'
                            }}
                            onClick={() => setSuggestArchetype(arch)}
                          >
                            {arch}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {suggestedTeam.length > 0 && (
                    <div className="collection-table-card" style={{ marginBottom: '1.5rem', padding: '1.2rem', borderLeft: '5px solid var(--primary-color)' }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                        {suggestionResult.teamName}
                      </h4>
                      <p style={{ margin: '0.4rem 0 0.6rem 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        {suggestionResult.description}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 700 }}>
                        <i className="fa-solid fa-square-rss" style={{ marginRight: '0.3rem' }}></i>Source: {suggestionResult.source}
                      </span>
                    </div>
                  )}

                  {suggestedTeam.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.2rem' }}>
                      {suggestedTeam.map(p => {
                        const lvl = getPokeLevel(p.id);
                        return (
                          <div 
                            key={p.id} 
                            className="vanguard-card" 
                            style={{ 
                              opacity: p.isOwned ? 1 : 0.75, 
                              border: p.isOwned ? '1px solid var(--border-color)' : '1px dashed var(--border-color)',
                              cursor: p.isOwned ? 'pointer' : 'default'
                            }}
                            onClick={() => {
                              if (p.isOwned) {
                                const emptyIdx = teams[activeTeamIdx].findIndex(id => id === null);
                                if (emptyIdx !== -1) {
                                  const newTeams = [...teams];
                                  newTeams[activeTeamIdx][emptyIdx] = p.id;
                                  handleSaveTeams(newTeams);
                                } else {
                                  alert("Active team is full! Remove a member first.");
                                }
                              }
                            }}
                          >
                            <div className="vanguard-header">
                              <span className="vanguard-id">#{p.id.toString().padStart(4, '0')}</span>
                              {!p.isOwned && <span style={{ fontSize: '0.65rem', background: '#e2e8f0', color: 'var(--text-secondary)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>Not Owned</span>}
                            </div>
                            <div className="vanguard-body">
                              <img src={p.image} alt={p.name} className="vanguard-img" />
                              <div className="vanguard-info">
                                <h4 className="vanguard-name">{p.name}</h4>
                                <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.4rem' }}>
                                  {p.types.map(t => (
                                    <span key={t} className="type-badge" style={{ backgroundColor: TYPE_TRANSLATIONS[t]?.color || '#999', fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                      {TYPE_TRANSLATIONS[t]?.name || t}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div 
                              style={{ 
                                marginTop: 'auto', 
                                paddingTop: '0.6rem', 
                                borderTop: '1px solid var(--border-color)', 
                                fontSize: '0.72rem', 
                                fontWeight: 700, 
                                color: 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              <i className={`fa-solid ${p.roleIcon}`}></i>
                              <span>{p.roleName}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
                      <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: '2rem', color: '#cbd5e1', marginBottom: '0.8rem', display: 'block' }}></i>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Add Pokémon to your collection in My Pokémon tab to receive smart team suggestions.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* MY POKEMON TAB */}
        {activeTab === 'collection' && (
          <div>
            {/* Section 1: My Owned Pokémon Collection */}
            <div className="profile-section" style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 className="profile-section-title" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                    <i className="fa-solid fa-star"></i> My Pokémon Collection
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                    {ownedPokemonDetails.length} Pokémon owned
                  </p>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 700, background: 'var(--primary-light)', padding: '0.4rem 1rem', borderRadius: '20px' }}>
                  <i className="fa-solid fa-database"></i> {ownedPokemonDetails.length} / 201
                </span>
              </div>

              {ownedPokemonDetails.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                  {ownedPokemonDetails.map(p => (
                    <div 
                      key={p.id} 
                      style={{
                        background: '#f8fafc',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        position: 'relative',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onClick={() => window.location.href = `/pokemon/${p.id}`}
                    >
                      <span style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 700 }}>#{p.id.toString().padStart(3, '0')}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleTogglePokemon(p.id, true); }}
                        title="Release Pokémon"
                        style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          background: 'rgba(239,68,68,0.1)',
                          border: 'none',
                          color: '#ef4444',
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '0.7rem'
                        }}
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                      <img src={p.image} alt={p.name} style={{ width: '60px', height: '60px', objectFit: 'contain', marginTop: '0.5rem' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'capitalize', color: 'var(--text-primary)' }}>{p.name}</span>
                      <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {p.types.map(t => (
                          <span key={t} className="type-badge" style={{ backgroundColor: TYPE_TRANSLATIONS[t]?.color || '#999', fontSize: '0.55rem', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>
                            {TYPE_TRANSLATIONS[t]?.name || t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
                  <i className="fa-solid fa-circle-plus" style={{ fontSize: '2.5rem', color: '#cbd5e1', marginBottom: '0.8rem', display: 'block' }}></i>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Your collection is empty.</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Use the panel below to add Pokémon.</p>
                </div>
              )}
            </div>

            {/* Section 2: Manage / Add Pokémon */}
            <div className="profile-section" style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem' }}>
              <h3 className="profile-section-title" style={{ fontSize: '1.25rem' }}>
                <i className="fa-solid fa-circle-nodes"></i> Manage Collection
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Click on any Pokémon to add or remove it from your collection. Highlighted ones are already owned.
              </p>

              <div className="hero-search-wrapper" style={{ margin: '0 0 1.5rem 0', maxWidth: '100%' }}>
                <div className="hero-input-container">
                  <i className="fa-solid fa-magnifying-glass search-icon"></i>
                  <input 
                    type="text" 
                    className="hero-search-input" 
                    style={{ height: '42px', padding: '0 1rem 0 2.5rem' }}
                    placeholder="Search Pokémon..."
                    value={pokeSearch}
                    onChange={(e) => setPokeSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="pokemon-select-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', padding: '0.8rem' }}>
                {filteredSearchPokemon.map(p => {
                  const isOwned = trainer.ownedPokemon.includes(p.id);
                  return (
                    <div 
                      key={p.id}
                      className={`pokemon-select-card ${isOwned ? 'selected' : ''}`}
                      onClick={() => handleTogglePokemon(p.id, isOwned)}
                      style={{ padding: '0.4rem', border: isOwned ? '2px solid var(--primary-color)' : '1px solid var(--border-color)' }}
                    >
                      <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                      <span style={{ fontSize: '0.7rem', textTransform: 'capitalize', fontWeight: 700, display: 'block', marginTop: '0.2rem' }}>{p.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}



        {/* TYPE MATCHUPS TAB */}
        {activeTab === 'matchups' && (
          <div className="profile-section" style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem' }}>
            <h3 className="profile-section-title" style={{ fontSize: '1.25rem' }}>
              <i className="fa-solid fa-circle-nodes"></i> Type Matchups Visualizer
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem', lineHeight: '1.5' }}>
              Interactive type effectiveness analyzer. Click any type node on the graph to analyze its strengths, weaknesses, and damage multipliers.
            </p>

            <div className="matchups-layout-grid">
              {/* 1. SVG Network Graph Card */}
              <div className="graph-card">
                {/* Toggle Attacking / Defending */}
                <div className="direction-toggle-container">
                  <button 
                    type="button"
                    className={`direction-toggle-btn ${matchupDirection === 'offensive' ? 'active' : ''}`}
                    onClick={() => setMatchupDirection('offensive')}
                  >
                    <i className="fa-solid fa-wand-magic-sparkles"></i> Offense (Deals Damage)
                  </button>
                  <button 
                    type="button"
                    className={`direction-toggle-btn ${matchupDirection === 'defensive' ? 'active' : ''}`}
                    onClick={() => setMatchupDirection('defensive')}
                  >
                    <i className="fa-solid fa-shield-halved"></i> Defense (Takes Damage)
                  </button>
                </div>

                <div className="graph-svg-wrapper">
                  <svg viewBox="0 0 520 520" className="graph-svg-element">
                    <defs>
                      <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
                      </marker>
                      <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
                      </marker>
                      <marker id="arrow-grey" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94a3b8" />
                      </marker>
                    </defs>

                    {/* Render Edge Lines first so they sit under the nodes */}
                    {Object.keys(TYPE_TRANSLATIONS).map(t => {
                      if (t === selectedGraphType) return null;

                      let multiplier = 1.0;
                      let lineClass = "";
                      let labelClass = "";
                      let labelText = "";
                      let isGreen = false;
                      let isRed = false;

                      if (matchupDirection === 'offensive') {
                        multiplier = TYPE_CHART[selectedGraphType][t];
                        if (multiplier === 2) {
                          lineClass = "offensive-2x";
                          labelClass = "x2";
                          labelText = "2x";
                          isGreen = true;
                        } else if (multiplier === 0.5) {
                          lineClass = "offensive-05x";
                          labelClass = "x05";
                          labelText = "0.5x";
                          isRed = true;
                        } else if (multiplier === 0) {
                          lineClass = "offensive-0x";
                          labelClass = "x0";
                          labelText = "0x";
                        }
                      } else {
                        multiplier = TYPE_CHART[t][selectedGraphType];
                        if (multiplier === 2) {
                          lineClass = "defensive-2x";
                          labelClass = "x05";
                          labelText = "2x";
                          isRed = true;
                        } else if (multiplier === 0.5) {
                          lineClass = "defensive-05x";
                          labelClass = "x2";
                          labelText = "0.5x";
                          isGreen = true;
                        } else if (multiplier === 0) {
                          lineClass = "defensive-0x";
                          labelClass = "x0";
                          labelText = "0x";
                        }
                      }

                      if (multiplier === 1.0) return null;

                      // Calculate coords
                      const types = Object.keys(TYPE_TRANSLATIONS);
                      const idx1 = types.indexOf(selectedGraphType);
                      const idx2 = types.indexOf(t);
                      const ang1 = (idx1 * 360 / 18) * Math.PI / 180;
                      const ang2 = (idx2 * 360 / 18) * Math.PI / 180;
                      const cx1 = 260 + 200 * Math.cos(ang1);
                      const cy1 = 260 + 200 * Math.sin(ang1);
                      const cx2 = 260 + 200 * Math.cos(ang2);
                      const cy2 = 260 + 200 * Math.sin(ang2);

                      const dx = cx2 - cx1;
                      const dy = cy2 - cy1;
                      const len = Math.sqrt(dx * dx + dy * dy);
                      const ux = dx / len;
                      const uy = dy / len;

                      const dStart = 42;
                      const dEnd = 45;

                      // Source to Target direction
                      let xS, yS, xT, yT;
                      if (matchupDirection === 'offensive') {
                        xS = cx1 + dStart * ux;
                        yS = cy1 + dStart * uy;
                        xT = cx2 - dEnd * ux;
                        yT = cy2 - dEnd * uy;
                      } else {
                        xS = cx2 - dStart * ux;
                        yS = cy2 - dStart * uy;
                        xT = cx1 + dEnd * ux;
                        yT = cy1 + dEnd * uy;
                      }

                      // Label midpoint
                      const mx = cx1 + len * 0.55 * ux;
                      const my = cy1 + len * 0.55 * uy;

                      const markerUrl = isGreen ? "url(#arrow-green)" : (isRed ? "url(#arrow-red)" : "url(#arrow-grey)");

                      return (
                        <g key={`edge-${t}`}>
                          <line 
                            x1={xS} 
                            y1={yS} 
                            x2={xT} 
                            y2={yT} 
                            className={`type-edge-line ${lineClass}`}
                            markerEnd={markerUrl}
                          />
                          {/* Label overlay */}
                          <g transform={`translate(${mx}, ${my})`} className="edge-multiplier-label">
                            <rect 
                              x={-15} 
                              y={-8} 
                              width={30} 
                              height={16} 
                              rx={4} 
                              className={`edge-multiplier-rect ${labelClass}`}
                            />
                            <text 
                              x={0} 
                              y={4} 
                              textAnchor="middle" 
                              className={`edge-multiplier-text ${labelClass}`}
                            >
                              {labelText}
                            </text>
                          </g>
                        </g>
                      );
                    })}

                    {/* Render Type Nodes */}
                    {Object.keys(TYPE_TRANSLATIONS).map((t, idx) => {
                      const ang = (idx * 360 / 18) * Math.PI / 180;
                      const nx = 260 + 200 * Math.cos(ang);
                      const ny = 260 + 200 * Math.sin(ang);
                      const isSelected = t === selectedGraphType;
                      const typeInfo = TYPE_TRANSLATIONS[t];

                      // Determine if faded
                      let isFaded = false;
                      if (selectedGraphType && !isSelected) {
                        const relOffensive = TYPE_CHART[selectedGraphType][t] !== 1.0;
                        const relDefensive = TYPE_CHART[t][selectedGraphType] !== 1.0;
                        const isConnected = matchupDirection === 'offensive' ? relOffensive : relDefensive;
                        isFaded = !isConnected;
                      }

                      return (
                        <g 
                          key={`node-${t}`} 
                          transform={`translate(${nx}, ${ny})`}
                          onClick={() => setSelectedGraphType(t)}
                          style={{ cursor: 'pointer' }}
                        >
                          <rect 
                            x={-38} 
                            y={-14} 
                            width={76} 
                            height={28} 
                            rx={14} 
                            fill={typeInfo.color}
                            className={`type-node-rect ${isSelected ? 'selected' : ''} ${isFaded ? 'faded' : ''}`}
                          />
                          <text 
                            x={0} 
                            y={4} 
                            textAnchor="middle" 
                            fill="#ffffff" 
                            fontSize="11" 
                            fontWeight="800" 
                            style={{ 
                              pointerEvents: 'none', 
                              textTransform: 'uppercase', 
                              letterSpacing: '0.03em',
                              opacity: isFaded ? 0.6 : 1 
                            }}
                          >
                            {typeInfo.name}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* 2. Detailed Breakdown Column */}
              <div className="matchup-details-column">
                <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className="type-pill-static" style={{ background: TYPE_TRANSLATIONS[selectedGraphType].color, fontSize: '1rem', padding: '0.5rem 1.2rem', borderRadius: '10px' }}>
                    {TYPE_TRANSLATIONS[selectedGraphType].name}
                  </span>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Selected Type Analysis</h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Click other nodes to switch selection</span>
                  </div>
                </div>

                {/* Offensive Strengths */}
                <div className="matchup-detail-card strengths">
                  <h4><i className="fa-solid fa-wand-magic-sparkles"></i> Deals 2x Damage To (Offensive Strengths)</h4>
                  <div className="matchup-badge-grid">
                    {Object.keys(TYPE_TRANSLATIONS).filter(t => TYPE_CHART[selectedGraphType][t] === 2).length > 0 ? (
                      Object.keys(TYPE_TRANSLATIONS).filter(t => TYPE_CHART[selectedGraphType][t] === 2).map(t => (
                        <span 
                          key={t} 
                          className="type-pill-static" 
                          onClick={() => setSelectedGraphType(t)} 
                          style={{ cursor: 'pointer', background: TYPE_TRANSLATIONS[t].color }}
                        >
                          {TYPE_TRANSLATIONS[t].name}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>None</span>
                    )}
                  </div>
                </div>

                {/* Defensive Weaknesses */}
                <div className="matchup-detail-card weaknesses">
                  <h4><i className="fa-solid fa-triangle-exclamation"></i> Takes 2x Damage From (Defensive Weaknesses)</h4>
                  <div className="matchup-badge-grid">
                    {Object.keys(TYPE_TRANSLATIONS).filter(t => TYPE_CHART[t][selectedGraphType] === 2).length > 0 ? (
                      Object.keys(TYPE_TRANSLATIONS).filter(t => TYPE_CHART[t][selectedGraphType] === 2).map(t => (
                        <span 
                          key={t} 
                          className="type-pill-static" 
                          onClick={() => setSelectedGraphType(t)} 
                          style={{ cursor: 'pointer', background: TYPE_TRANSLATIONS[t].color }}
                        >
                          {TYPE_TRANSLATIONS[t].name}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>None</span>
                    )}
                  </div>
                </div>

                {/* Defensive Resistances */}
                <div className="matchup-detail-card resistances">
                  <h4><i className="fa-solid fa-shield-halved"></i> Takes 0.5x Damage From (Defensive Resistances)</h4>
                  <div className="matchup-badge-grid">
                    {Object.keys(TYPE_TRANSLATIONS).filter(t => TYPE_CHART[t][selectedGraphType] === 0.5).length > 0 ? (
                      Object.keys(TYPE_TRANSLATIONS).filter(t => TYPE_CHART[t][selectedGraphType] === 0.5).map(t => (
                        <span 
                          key={t} 
                          className="type-pill-static" 
                          onClick={() => setSelectedGraphType(t)} 
                          style={{ cursor: 'pointer', background: TYPE_TRANSLATIONS[t].color }}
                        >
                          {TYPE_TRANSLATIONS[t].name}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>None</span>
                    )}
                  </div>
                </div>

                {/* Defensive Immunities */}
                <div className="matchup-detail-card immunities">
                  <h4><i className="fa-solid fa-ban"></i> Takes 0x Damage From (Defensive Immunities)</h4>
                  <div className="matchup-badge-grid">
                    {Object.keys(TYPE_TRANSLATIONS).filter(t => TYPE_CHART[t][selectedGraphType] === 0).length > 0 ? (
                      Object.keys(TYPE_TRANSLATIONS).filter(t => TYPE_CHART[t][selectedGraphType] === 0).map(t => (
                        <span 
                          key={t} 
                          className="type-pill-static" 
                          onClick={() => setSelectedGraphType(t)} 
                          style={{ cursor: 'pointer', background: TYPE_TRANSLATIONS[t].color }}
                        >
                          {TYPE_TRANSLATIONS[t].name}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>None</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACCOUNT SETTINGS EDIT TAB */}
        {activeTab === 'settings' && (
          <div className="profile-section" style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem' }}>
            <h3 className="profile-section-title" style={{ fontSize: '1.25rem' }}>
              <i className="fa-solid fa-user-gear"></i> Trainer Profile Settings
            </h3>

            {editSuccess && (
              <div style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.3)', color: '#4ade80', padding: '0.8rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                <label htmlFor="editDisplayName">Trainer Name</label>
                <input 
                  type="text" 
                  id="editDisplayName"
                  className="form-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>

              {/* Avatar Presets Grid */}
              <div className="form-group">
                <label>Choose Avatar Preset</label>
                <div className="avatar-presets-grid">
                  {AVATAR_PRESETS.map((preset) => (
                    <div 
                      key={preset.name}
                      className={`avatar-preset-item ${avatar === preset.url ? 'selected' : ''}`}
                      onClick={() => setAvatar(preset.url)}
                    >
                      <img src={preset.url} alt={preset.name} className="avatar-preset-img" />
                      <span className="avatar-preset-name">{preset.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="editAvatar">Or Custom Avatar Image URL</label>
                <input 
                  type="url" 
                  id="editAvatar"
                  className="form-input"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="Enter custom image URL..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="editDob">Date of Birth</label>
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
                {profileLoading ? 'Updating...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* ADMIN TAB */}
        {activeTab === 'admin' && isAdmin && (
          <div className="collection-table-card">
            <div style={{ marginBottom: '1rem' }}>
              <h3 className="trainer-section-title" style={{ marginBottom: '0.4rem' }}>
                <i className="fa-solid fa-users-gear"></i> Manage Trainer Accounts
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                As an administrator, you can view registered trainer accounts and delete inactive or non-compliant users.
              </p>
            </div>

            {adminLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}></i>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading accounts...</p>
              </div>
            ) : adminError ? (
              <div className="form-error" style={{ marginBottom: '1.2rem' }}>
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>{adminError}</span>
              </div>
            ) : adminTrainers.length > 0 ? (
              <div className="collection-table-wrapper">
                <table className="collection-table">
                  <thead>
                    <tr>
                      <th>Avatar</th>
                      <th>Username</th>
                      <th>Trainer Name</th>
                      <th>Role</th>
                      <th>Owned Pokemon</th>
                      <th>Joined Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminTrainers.map(t => (
                      <tr key={t._id}>
                        <td>
                          <img 
                            src={t.avatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60'} 
                            alt={t.displayName} 
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }} 
                          />
                        </td>
                        <td style={{ fontWeight: 700 }}>{t.username}</td>
                        <td>{t.displayName}</td>
                        <td>
                          <span 
                            style={{ 
                              fontSize: '0.75rem', 
                              padding: '0.2rem 0.5rem', 
                              borderRadius: '6px', 
                              fontWeight: 700, 
                              background: t.role === 'admin' ? 'var(--primary-light)' : '#f1f5f9', 
                              color: t.role === 'admin' ? 'var(--primary-color)' : 'var(--text-secondary)' 
                            }}
                          >
                            {t.role || 'user'}
                          </span>
                        </td>
                        <td>{t.ownedPokemon ? t.ownedPokemon.length : 0} Pokémon</td>
                        <td>{new Date(t.createdAt).toLocaleDateString('en-US')}</td>
                        <td>
                          <button
                            className="btn-delete-user"
                            onClick={() => handleDeleteTrainer(t._id, t.displayName)}
                            disabled={t.username === 'admin' || t.role === 'admin' || t.username === trainer.username}
                          >
                            <i className="fa-solid fa-trash-can"></i> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No trainer accounts found.</p>
              </div>
            )}
          </div>
        )}

      </section>
      
    </div>
  );
}
