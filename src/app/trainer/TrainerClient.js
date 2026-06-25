'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  { name: 'Red', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' }, // Pikachu
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
  if (ownedIds.length === 0 && !includeUnowned) return [];

  // Candidate pool: only owned vs all
  let pool = includeUnowned ? allPkmn : allPkmn.filter(p => ownedIds.includes(p.id));
  
  if (pool.length === 0) return [];

  const selected = [];
  let activeRoles = [];

  if (format === 'single') {
    if (archetype === 'offense') {
      activeRoles = [
        { name: 'Fast Lead', icon: 'fa-gauge-high', check: p => p.types.includes('flying') || p.types.includes('electric') || p.types.includes('fire') },
        { name: 'Physical Sweeper', icon: 'fa-hand-fist', check: p => p.types.includes('fighting') || p.types.includes('dragon') || p.types.includes('steel') },
        { name: 'Special Sweeper', icon: 'fa-wand-magic-sparkles', check: p => p.types.includes('fire') || p.types.includes('psychic') || p.types.includes('ghost') },
        { name: 'Aggressive Pivot', icon: 'fa-rotate', check: p => p.types.includes('electric') || p.types.includes('bug') },
        { name: 'Wallbreaker', icon: 'fa-burst', check: p => p.types.includes('ground') || p.types.includes('rock') || p.types.includes('dark') },
        { name: 'Clean-up Sweeper', icon: 'fa-bolt', check: p => true }
      ];
    } else if (archetype === 'defense') {
      activeRoles = [
        { name: 'Hazard Setter', icon: 'fa-flag', check: p => p.types.includes('rock') || p.types.includes('ground') || p.types.includes('steel') },
        { name: 'Defensive Wall', icon: 'fa-shield', check: p => p.types.includes('water') || p.types.includes('normal') },
        { name: 'Special Wall', icon: 'fa-gem', check: p => p.types.includes('normal') || p.types.includes('fairy') || p.types.includes('ice') },
        { name: 'Cleric / Support', icon: 'fa-heart-pulse', check: p => p.types.includes('fairy') || p.types.includes('grass') },
        { name: 'Status Inducer', icon: 'fa-skull', check: p => p.types.includes('poison') || p.types.includes('ghost') },
        { name: 'Stall Utility', icon: 'fa-anchor', check: p => true }
      ];
    } else { // balanced
      activeRoles = [
        { name: 'Lead / Hazard Setter', icon: 'fa-flag', check: p => p.types.includes('ground') || p.types.includes('rock') || p.types.includes('steel') },
        { name: 'Physical Sweeper', icon: 'fa-hand-fist', check: p => p.types.includes('fighting') || p.types.includes('dragon') || p.types.includes('bug') || p.types.includes('normal') },
        { name: 'Special Sweeper', icon: 'fa-wand-magic-sparkles', check: p => p.types.includes('psychic') || p.types.includes('fire') || p.types.includes('electric') || p.types.includes('ghost') },
        { name: 'Defensive Wall / Tank', icon: 'fa-shield', check: p => p.types.includes('normal') || p.types.includes('water') || p.types.includes('ice') },
        { name: 'Tactical Support', icon: 'fa-heart', check: p => p.types.includes('poison') || p.types.includes('grass') || p.types.includes('fairy') },
        { name: 'Versatile Utility', icon: 'fa-screwdriver-wrench', check: p => true }
      ];
    }
  } else { // double VGC
    if (archetype === 'offense') {
      activeRoles = [
        { name: 'Speed / Tailwind', icon: 'fa-wind', check: p => p.types.includes('flying') || p.types.includes('electric') },
        { name: 'Physical Attacker', icon: 'fa-hand-fist', check: p => p.types.includes('fighting') || p.types.includes('dragon') },
        { name: 'Special Sweeper', icon: 'fa-wand-magic-sparkles', check: p => p.types.includes('fire') || p.types.includes('psychic') },
        { name: 'Spread Sweeper', icon: 'fa-burst', check: p => p.types.includes('ground') || p.types.includes('rock') },
        { name: 'Fast Pivot / Attacker', icon: 'fa-bolt', check: p => p.types.includes('dark') || p.types.includes('bug') },
        { name: 'Closer Sweeper', icon: 'fa-gauge-high', check: p => true }
      ];
    } else if (archetype === 'defense') {
      activeRoles = [
        { name: 'Screen Setter', icon: 'fa-shield-halved', check: p => p.types.includes('psychic') || p.types.includes('fairy') },
        { name: 'Redirection / Support', icon: 'fa-circle-plus', check: p => p.types.includes('grass') || p.types.includes('normal') },
        { name: 'Bulky Water / Pivot', icon: 'fa-droplet', check: p => p.types.includes('water') },
        { name: 'Bulky Attacker', icon: 'fa-mountain', check: p => p.types.includes('ground') || p.types.includes('steel') || p.types.includes('ice') },
        { name: 'Debuffer / Cleric', icon: 'fa-heart', check: p => p.types.includes('poison') },
        { name: 'Counter Attacker', icon: 'fa-reply', check: p => true }
      ];
    } else { // balanced
      activeRoles = [
        { name: 'Synergy / Weather', icon: 'fa-cloud-sun-rain', check: p => p.types.includes('water') || p.types.includes('fire') || p.types.includes('rock') },
        { name: 'Tailwind Support', icon: 'fa-wind', check: p => p.types.includes('flying') || p.types.includes('electric') || p.types.includes('psychic') },
        { name: 'Physical Attacker', icon: 'fa-hand-fist', check: p => p.types.includes('fighting') || p.types.includes('dragon') || p.types.includes('steel') },
        { name: 'Special Sweeper', icon: 'fa-wand-magic-sparkles', check: p => p.types.includes('ghost') || p.types.includes('fire') || p.types.includes('ice') },
        { name: 'Redirection / Support', icon: 'fa-circle-plus', check: p => p.types.includes('fairy') || p.types.includes('grass') || p.types.includes('poison') },
        { name: 'Closer Sweeper', icon: 'fa-bolt', check: p => true }
      ];
    }
  }

  const usedIds = new Set();
  
  for (let i = 0; i < 6; i++) {
    const role = activeRoles[i];
    let match = pool.find(p => !usedIds.has(p.id) && role.check(p));
    
    if (!match) {
      match = pool.find(p => !usedIds.has(p.id));
    }
    
    if (match) {
      selected.push({
        ...match,
        roleName: role.name,
        roleIcon: role.icon,
        isOwned: ownedIds.includes(match.id)
      });
      usedIds.add(match.id);
    } else if (includeUnowned) {
      const backup = allPkmn.find(p => !usedIds.has(p.id));
      if (backup) {
        selected.push({
          ...backup,
          roleName: role.name,
          roleIcon: role.icon,
          isOwned: false
        });
        usedIds.add(backup.id);
      }
    }
  }

  return selected;
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

  // Simulator states
  const [selectedNpc, setSelectedNpc] = useState(NPC_OPPONENTS[0]);

  // Admin settings states
  const [adminTrainers, setAdminTrainers] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Type matchups graph states
  const [selectedGraphType, setSelectedGraphType] = useState('fire');
  const [matchupDirection, setMatchupDirection] = useState('offensive'); // offensive | defensive

  const router = useRouter();
  const isAdmin = trainer.username === 'admin' || trainer.role === 'admin';
  
  const ownedPokemonDetails = allPokemon.filter(p => trainer.ownedPokemon.includes(p.id));
  const vanguardSquad = ownedPokemonDetails.slice(0, 6);
  const suggestedTeam = getTeamSuggestions(trainer.ownedPokemon, allPokemon, suggestScope === 'all', suggestFormat, suggestArchetype);
  const synergyReport = analyzeSynergy(vanguardSquad);
  const battleSimReport = calculateMatchup(vanguardSquad, selectedNpc.team, allPokemon);

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
            <i className="fa-solid fa-circle-nodes"></i> My Pokemon
          </button>
        )}

        {!isAdmin && (
          <button 
            className={`trainer-nav-item ${activeTab === 'simulator' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulator')}
          >
            <i className="fa-solid fa-gamepad"></i> VGC Simulator
          </button>
        )}

        {!isAdmin && (
          <button 
            className={`trainer-nav-item ${activeTab === 'matchups' ? 'active' : ''}`}
            onClick={() => setActiveTab('matchups')}
          >
            <i className="fa-solid fa-circle-nodes"></i> Type Matchups
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
          className="trainer-nav-item"
          style={{ color: '#ef4444', marginTop: '1.5rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', width: '100%' }}
          onClick={handleLogout}
        >
          <i className="fa-solid fa-right-from-bracket"></i> Logout
        </button>
      </aside>

      {/* 2. Main Content Dashboard */}
      <section>
        
        {/* TRAINER VIEW TAB */}
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
                {/* Vanguard Squad (Screenshot 2) */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                    <h3 className="trainer-section-title" style={{ marginBottom: 0 }}>
                      <i className="fa-solid fa-users"></i> Vanguard Squad
                    </h3>
                    {ownedPokemonDetails.length > 6 && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>First 6 shown</span>
                    )}
                  </div>

                  {vanguardSquad.length > 0 ? (
                    <div className="vanguard-grid">
                      {vanguardSquad.map(p => {
                        const transColor = TYPE_TRANSLATIONS[p.types[0]]?.color || '#999';
                        const lvl = getPokeLevel(p.id);
                        return (
                          <div key={p.id} className="vanguard-card">
                            <div className="vanguard-header">
                              <span className="vanguard-id">#{p.id.toString().padStart(4, '0')}</span>
                              <span className="vanguard-lvl">Lv. {lvl}</span>
                            </div>
                            
                            <div className="vanguard-body">
                              <img src={p.image} alt={p.name} className="vanguard-img" />
                              <div className="vanguard-info">
                                <h4 className="vanguard-name">{p.name}</h4>
                                <div style={{ display: 'flex', gap: '0.3rem' }}>
                                  {p.types.map(t => {
                                    const trans = TYPE_TRANSLATIONS[t] || { name: t, color: '#999' };
                                    return (
                                      <span key={t} className="type-badge" style={{ backgroundColor: trans.color, fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                        {trans.name}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            <div className="hp-bar-wrapper">
                              <div className="hp-bar-label">
                                <span>HP</span>
                                <span>{lvl * 4} / {lvl * 4}</span>
                              </div>
                              <div className="hp-bar-container">
                                <div className="hp-bar-fill" style={{ width: '100%' }}></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#ffffff', border: '1px dashed var(--border-color)', borderRadius: '16px', marginBottom: '2.5rem' }}>
                      <i className="fa-solid fa-circle-question" style={{ fontSize: '2.5rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', display: 'block' }}></i>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Your active squad is empty. Add Pokémon from the &quot;My Pokemon&quot; tab.</p>
                    </div>
                  )}
                </div>

                {/* VANGUARD SYNERGY ANALYZER SECTION */}
                {vanguardSquad.length > 0 && synergyReport && (
                  <div className="collection-table-card" style={{ marginBottom: '2.5rem', borderLeft: '5px solid var(--primary-color)' }}>
                    <h3 className="trainer-section-title">
                      <i className="fa-solid fa-circle-nodes" style={{ color: 'var(--primary-color)' }}></i> Vanguard Synergy & Tactical Analyzer
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                      Calculates tactical core synergies, defensive coverages, and weaknesses in your active squad.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                      {/* Flex layout for Grades and Radar bar scores */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
                        {/* Grade Shield */}
                        <div className="synergy-grade-shield">
                          <span className="grade-title">GRADE</span>
                          <span className="grade-value">{synergyReport.grade}</span>
                        </div>
 
                        {/* Stats Breakdown */}
                        <div className="synergy-stats-grid">
                          <div className="synergy-stat-group">
                            <span className="stat-label">Offense Rating: {synergyReport.stats.offense}%</span>
                            <div className="hp-bar-container" style={{ height: '6px', marginTop: '0.25rem' }}>
                              <div className="hp-bar-fill" style={{ width: `${synergyReport.stats.offense}%`, background: '#ef4444' }}></div>
                            </div>
                          </div>
                          <div className="synergy-stat-group">
                            <span className="stat-label">Defense Bulk: {synergyReport.stats.hp}%</span>
                            <div className="hp-bar-container" style={{ height: '6px', marginTop: '0.25rem' }}>
                              <div className="hp-bar-fill" style={{ width: `${synergyReport.stats.hp}%`, background: '#10b981' }}></div>
                            </div>
                          </div>
                          <div className="synergy-stat-group">
                            <span className="stat-label">Speed Tier: {synergyReport.stats.speed}%</span>
                            <div className="hp-bar-container" style={{ height: '6px', marginTop: '0.25rem' }}>
                              <div className="hp-bar-fill" style={{ width: `${synergyReport.stats.speed}%`, background: '#6390f0' }}></div>
                            </div>
                          </div>
                          <div className="synergy-stat-group">
                            <span className="stat-label">Type Coverage: {synergyReport.stats.coverage}%</span>
                            <div className="hp-bar-container" style={{ height: '6px', marginTop: '0.25rem' }}>
                              <div className="hp-bar-fill" style={{ width: `${synergyReport.stats.coverage}%`, background: '#f59e0b' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
 
                      {/* Pros, Cons, and Warnings lists */}
                      <div className="synergy-feedback-grid">
                        {/* Pros */}
                        <div className="synergy-feedback-card pros">
                          <h4>
                            <i className="fa-solid fa-circle-check"></i> Tactical Strengths
                          </h4>
                          <ul>
                            {synergyReport.pros.map((p, i) => <li key={i}>{p}</li>)}
                          </ul>
                        </div>
 
                        {/* Cons */}
                        <div className="synergy-feedback-card cons">
                          <h4>
                            <i className="fa-solid fa-triangle-exclamation"></i> Strategy Recommendations
                          </h4>
                          {synergyReport.cons.length > 0 ? (
                            <ul>
                              {synergyReport.cons.map((c, i) => <li key={i}>{c}</li>)}
                            </ul>
                          ) : (
                            <p style={{ fontSize: '0.75rem', color: '#92400e' }}>No structural flaws detected in core types.</p>
                          )}
                        </div>
 
                        {/* Warnings */}
                        <div className="synergy-feedback-card warnings">
                          <h4>
                            <i className="fa-solid fa-circle-radiation"></i> Defensive Weaknesses
                          </h4>
                          {synergyReport.warnings.length > 0 ? (
                            <ul>
                              {synergyReport.warnings.map((w, i) => <li key={i}>{w}</li>)}
                            </ul>
                          ) : (
                            <p style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}><i className="fa-solid fa-circle-check"></i> Perfect! No shared triple type weaknesses.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Extended Collection Table (Screenshot 2) */}
                <div className="collection-table-card">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className="trainer-section-title" style={{ marginBottom: 0 }}>
                      <i className="fa-solid fa-boxes-stacked"></i> Extended Collection
                    </h3>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <div className="hero-search-wrapper" style={{ margin: 0, maxWidth: '200px' }}>
                        <input 
                          type="text" 
                          className="hero-search-input" 
                          style={{ height: '36px', fontSize: '0.8rem', borderRadius: '8px', padding: '0 0.8rem' }}
                          placeholder="Search collection..."
                          value={collectionSearch}
                          onChange={(e) => setCollectionSearch(e.target.value)}
                        />
                      </div>
                      <button className="filter-btn" style={{ height: '36px', borderRadius: '8px', fontSize: '0.8rem' }} onClick={() => alert('Sorting...')}>
                        Sort by Level
                      </button>
                    </div>
                  </div>

                  {filteredOwnedPokemon.length > 0 ? (
                    <div className="collection-table-wrapper">
                      <table className="collection-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Pokemon</th>
                            <th>Type</th>
                            <th>Level</th>
                            <th>Base Stats</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOwnedPokemon.map((p, idx) => {
                            const lvl = getPokeLevel(p.id);
                            const statSum = p.id * 3 + 400; // Mock stat total sum
                            const percent = Math.min((statSum / 700) * 100, 100);
                            const barColor = idx % 3 === 0 ? '#6390f0' : idx % 3 === 1 ? '#ec4899' : '#10b981'; // blue, pink, green matching screenshot 2
                            
                            return (
                              <tr key={p.id}>
                                <td style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>#{p.id.toString().padStart(4, '0')}</td>
                                <td>
                                  <Link href={`/pokemon/${p.id}`} className="table-pokemon-cell" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <img src={p.image} alt={p.name} className="table-pokemon-img" />
                                    <span className="table-pokemon-name">{p.name}</span>
                                  </Link>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '0.2rem' }}>
                                    {p.types.map(t => {
                                      const trans = TYPE_TRANSLATIONS[t] || { name: t, color: '#999' };
                                      return (
                                        <span key={t} className="type-badge" style={{ backgroundColor: trans.color, fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                          {trans.name}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </td>
                                <td className="table-lvl-cell">{lvl}</td>
                                <td>
                                  <div className="table-stats-bar-wrapper">
                                    <div className="hp-bar-container" style={{ flexGrow: 1, height: '5px' }}>
                                      <div className="hp-bar-fill" style={{ width: `${percent}%`, backgroundColor: barColor }}></div>
                                    </div>
                                    <span className="table-stats-val">{statSum} total</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#f8fafc', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No matching Pokémon in collection.</p>
                    </div>
                  )}
                </div>
              </>
            )}

          </div>
        )}

        {/* MY POKEMON TOGGLE SELECTION TAB */}
        {activeTab === 'collection' && (
          <div className="profile-section" style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem' }}>
            <h3 className="profile-section-title" style={{ fontSize: '1.25rem' }}>
              <i className="fa-solid fa-circle-nodes"></i> Manage Pokémon Collection
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Click on Pokémon to add or remove them from your trainer collection. Changes save automatically.
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

            {/* SMART TEAM SUGGESTER SECTION */}
            <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <i className="fa-solid fa-wand-magic-sparkles" style={{ color: 'var(--primary-color)' }}></i> Smart Team Suggester
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Get recommendations for competitive singles or doubles layouts.
                  </p>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                  {/* Pool Filter */}
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

                  {/* Battle Format */}
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
                      Single Battle (6v6)
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
                      Double Battle
                    </button>
                  </div>

                  {/* Team Archetype */}
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
                        background: suggestArchetype === 'balanced' ? '#ffffff' : 'transparent',
                        color: suggestArchetype === 'balanced' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        boxShadow: suggestArchetype === 'balanced' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                      onClick={() => setSuggestArchetype('balanced')}
                    >
                      Balanced
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
                        background: suggestArchetype === 'offense' ? '#ffffff' : 'transparent',
                        color: suggestArchetype === 'offense' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        boxShadow: suggestArchetype === 'offense' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                      onClick={() => setSuggestArchetype('offense')}
                    >
                      Offense
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
                        background: suggestArchetype === 'defense' ? '#ffffff' : 'transparent',
                        color: suggestArchetype === 'defense' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        boxShadow: suggestArchetype === 'defense' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                      onClick={() => setSuggestArchetype('defense')}
                    >
                      Defense
                    </button>
                  </div>
                </div>
              </div>

              {/* Suggestions Grid */}
              {suggestedTeam.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                  {suggestedTeam.map((p, idx) => {
                    const primaryType = p.types[0];
                    const transColor = TYPE_TRANSLATIONS[primaryType]?.color || '#999';
                    
                    return (
                      <div 
                        key={`${p.id}-${idx}`} 
                        style={{ 
                          background: p.isOwned ? '#ffffff' : '#f8fafc', 
                          border: `1px solid ${p.isOwned ? 'var(--border-color)' : '#e2e8f0'}`,
                          borderRadius: '16px',
                          padding: '1rem',
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          opacity: p.isOwned ? 1 : 0.7,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
                          transition: 'all 0.2s'
                        }}
                      >
                        {/* Owned / Suggestion badge */}
                        <span 
                          style={{ 
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            fontSize: '0.6rem',
                            padding: '0.15rem 0.4rem',
                            borderRadius: '4px',
                            fontWeight: 800,
                            background: p.isOwned ? '#dcfce7' : '#fee2e2',
                            color: p.isOwned ? '#15803d' : '#b91c1c'
                          }}
                        >
                          {p.isOwned ? 'Owned' : 'Catch Rec.'}
                        </span>

                        <img src={p.image} alt={p.name} style={{ width: '60px', height: '60px', objectFit: 'contain', marginBottom: '0.5rem' }} />
                        
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'capitalize', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                          {p.name}
                        </h4>

                        <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.6rem' }}>
                          {p.types.map(t => (
                            <span 
                              key={t} 
                              className="type-badge" 
                              style={{ 
                                backgroundColor: TYPE_TRANSLATIONS[t]?.color || '#999', 
                                fontSize: '0.55rem', 
                                padding: '0.05rem 0.25rem', 
                                borderRadius: '3px' 
                              }}
                            >
                              {TYPE_TRANSLATIONS[t]?.name || t}
                            </span>
                          ))}
                        </div>

                        {/* Assigned Role */}
                        <div 
                          style={{ 
                            marginTop: 'auto',
                            width: '100%',
                            background: '#f1f5f9',
                            borderRadius: '8px',
                            padding: '0.35rem',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
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
                    Add Pokémon to your collection above to receive smart team suggestions.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VGC MATCHUP SIMULATOR TAB */}
        {activeTab === 'simulator' && (
          <div className="profile-section" style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem' }}>
            <h3 className="profile-section-title" style={{ fontSize: '1.25rem' }}>
              <i className="fa-solid fa-gamepad"></i> VGC Matchup Simulator
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem' }}>
              Simulate element coverage battles against famous regional gym leaders and champions.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
              {/* Flex wrapper for NPC selection and match report */}
              <div className="sim-layout-wrapper">
                
                {/* 1. Opponent Selector */}
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>Choose Opponent</h4>
                  <div className="npc-selector-column">
                    {NPC_OPPONENTS.map(npc => (
                      <div 
                        key={npc.name}
                        onClick={() => setSelectedNpc(npc)}
                        className={`npc-selection-card ${selectedNpc.name === npc.name ? 'selected' : ''}`}
                      >
                        <img src={npc.avatar} alt={npc.name} className="npc-avatar" />
                        <div>
                          <h5 className="npc-name">{npc.name}</h5>
                          <span className="npc-role">{npc.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Simulation Stats View */}
                <div className="sim-analysis-report-card">
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.2rem' }}>Simulation Analysis</h4>
                  
                  {vanguardSquad.length === 0 ? (
                    <div style={{ margin: 'auto' }}>
                      <i className="fa-solid fa-shield-halved" style={{ fontSize: '2.5rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', display: 'block' }}></i>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Add Pokémon to your Vanguard Squad to activate VGC Matchup simulation.</p>
                    </div>
                  ) : (
                    <>
                      {/* Big Win Chance Gauge */}
                      <div className="win-rate-dial">
                        <span className="win-rate-number">{battleSimReport.winRate}%</span>
                        <span className="win-rate-label">WIN RATE</span>
                      </div>

                      {/* Tactical advice text */}
                      <p className="sim-tactical-advice">
                        &ldquo;{battleSimReport.advice}&rdquo;
                      </p>

                      {/* Counters and threats list */}
                      <div className="sim-advantage-list">
                        {/* Counters */}
                        <div className="sim-advantage-item counters">
                          <span className="badge-title"><i className="fa-solid fa-circle-check"></i> Key Counters</span>
                          {battleSimReport.counters.length > 0 ? (
                            <div className="sim-badges-container">
                              {battleSimReport.counters.map((c, i) => (
                                <span key={i} className="advantage-badge counter">
                                  {c.user} beats {c.npc}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>No direct element advantages found.</p>
                          )}
                        </div>

                        {/* Threats */}
                        <div className="sim-advantage-item threats">
                          <span className="badge-title"><i className="fa-solid fa-circle-exclamation"></i> Serious Threats</span>
                          {battleSimReport.threats.length > 0 ? (
                            <div className="sim-badges-container">
                              {battleSimReport.threats.map((t, i) => (
                                <span key={i} className="advantage-badge threat">
                                  {t.user} counters {t.npc}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600, marginTop: '0.15rem' }}><i className="fa-solid fa-circle-check"></i> Safe! No severe type counters faced.</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
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
