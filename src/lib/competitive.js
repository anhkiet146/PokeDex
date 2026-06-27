import { getReputableBuildSuggestions } from './competitive-sets';

export const MOVE_VERSION_GROUP_PRIORITY = [
  'scarlet-violet',
  'sword-shield',
  'ultra-sun-ultra-moon',
  'omega-ruby-alpha-sapphire',
  'x-y'
];

const MEGA_STONES = {
  'venusaur-mega': 'Venusaurite',
  'charizard-mega-x': 'Charizardite X',
  'charizard-mega-y': 'Charizardite Y',
  'blastoise-mega': 'Blastoisinite',
  'beedrill-mega': 'Beedrillite',
  'pidgeot-mega': 'Pidgeotite',
  'alakazam-mega': 'Alakazite',
  'slowbro-mega': 'Slowbronite',
  'gengar-mega': 'Gengarite',
  'kangaskhan-mega': 'Kangaskhanite',
  'pinsir-mega': 'Pinsirite',
  'gyarados-mega': 'Gyaradosite',
  'aerodactyl-mega': 'Aerodactylite',
  'mewtwo-mega-x': 'Mewtwonite X',
  'mewtwo-mega-y': 'Mewtwonite Y',
  'ampharos-mega': 'Ampharosite',
  'steelix-mega': 'Steelixite',
  'scizor-mega': 'Scizorite',
  'heracross-mega': 'Heracronite',
  'houndoom-mega': 'Houndoominite',
  'tyranitar-mega': 'Tyranitarite',
  'sceptile-mega': 'Sceptilite',
  'blaziken-mega': 'Blazikenite',
  'swampert-mega': 'Swampertite',
  'gardevoir-mega': 'Gardevoirite',
  'gallade-mega': 'Galladite',
  'mawile-mega': 'Mawilite',
  'aggron-mega': 'Aggronite',
  'medicham-mega': 'Medichamite',
  'manectric-mega': 'Manectite',
  'sharpedo-mega': 'Sharpedonite',
  'camerupt-mega': 'Cameruptite',
  'altaria-mega': 'Altarianite',
  'banette-mega': 'Banettite',
  'absol-mega': 'Absolite',
  'glalie-mega': 'Glalitite',
  'salamence-mega': 'Salamencite',
  'metagross-mega': 'Metagrossite',
  'latias-mega': 'Latiasite',
  'latios-mega': 'Latiosite',
  'rayquaza-mega': 'No Mega Stone - requires Dragon Ascent',
  'garchomp-mega': 'Garchompite',
  'lucario-mega': 'Lucarionite',
  'abomasnow-mega': 'Abomasite',
  'audino-mega': 'Audinite',
  'diancie-mega': 'Diancite'
};

const STRONG_MOVE_PRIORITY = [
  'protect', 'fake-out', 'spore', 'rage-powder', 'follow-me', 'tailwind', 'trick-room',
  'stealth-rock', 'defog', 'rapid-spin', 'roost', 'recover', 'will-o-wisp', 'thunder-wave',
  'swords-dance', 'nasty-plot', 'dragon-dance', 'calm-mind', 'bulk-up', 'quiver-dance',
  'u-turn', 'volt-switch', 'flip-turn', 'knock-off', 'earthquake', 'close-combat',
  'draco-meteor', 'outrage', 'dragon-ascent', 'moonblast', 'play-rough', 'thunderbolt',
  'thunder', 'ice-beam', 'flamethrower', 'fire-blast', 'hydro-pump', 'surf', 'scald',
  'leaf-storm', 'giga-drain', 'sludge-bomb', 'shadow-ball', 'psyshock', 'psychic',
  'stone-edge', 'rock-slide', 'iron-head', 'flash-cannon', 'bullet-punch', 'extreme-speed',
  'sucker-punch', 'shadow-sneak', 'mach-punch', 'aqua-jet', 'body-slam', 'return'
];

export function formatPokemonName(name) {
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

export function getBaseSpeciesName(name) {
  return name.replace(/-mega(?:-[xy])?$/, '');
}

export function groupPokemonWithMegaVariants(pokemonList) {
  const byName = new Map(pokemonList.map(pokemon => [pokemon.name, pokemon]));
  const variantsByBase = new Map();

  pokemonList.forEach(pokemon => {
    if (!pokemon.isMega) return;
    const baseName = getBaseSpeciesName(pokemon.name);
    if (!variantsByBase.has(baseName)) variantsByBase.set(baseName, []);
    variantsByBase.get(baseName).push(pokemon);
  });

  const ordered = [];
  const added = new Set();
  const basePokemon = pokemonList
    .filter(pokemon => !pokemon.isMega)
    .sort((a, b) => a.id - b.id || a.name.localeCompare(b.name));

  basePokemon.forEach(pokemon => {
    ordered.push(pokemon);
    added.add(pokemon.name);

    const variants = variantsByBase.get(pokemon.name) || [];
    variants
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(variant => {
        ordered.push(variant);
        added.add(variant.name);
      });
  });

  pokemonList.forEach(pokemon => {
    if (!added.has(pokemon.name) && !byName.has(getBaseSpeciesName(pokemon.name))) {
      ordered.push(pokemon);
    }
  });

  return ordered;
}

export function getMegaHeldItem(name) {
  const stone = MEGA_STONES[name];
  if (stone === 'No Mega Stone - requires Dragon Ascent') {
    return null;
  }
  return stone || null;
}

export function normalizeAbilities(abilities = []) {
  return abilities.map(ability => {
    if (typeof ability === 'string') {
      return { name: ability, isHidden: false };
    }

    return ability;
  });
}

export function getBattleRole(pokemon) {
  const stat = Object.fromEntries(pokemon.stats.map(item => [item.name, item.value]));
  const attack = stat.attack || 0;
  const specialAttack = stat['special-attack'] || 0;
  const defense = stat.defense || 0;
  const specialDefense = stat['special-defense'] || 0;
  const hp = stat.hp || 0;
  const speed = stat.speed || 0;

  if (hp + defense + specialDefense >= 275 && speed < 85) return 'Bulky Support';
  if (Math.abs(attack - specialAttack) <= 15 && Math.max(attack, specialAttack) >= 95) return 'Mixed Attacker';
  if (specialAttack > attack) return speed >= 90 ? 'Fast Special Attacker' : 'Special Attacker';
  return speed >= 90 ? 'Fast Physical Attacker' : 'Physical Attacker';
}

export function getSuggestedItem(pokemon) {
  const megaStone = getMegaHeldItem(pokemon.name);
  if (megaStone) return megaStone;

  // VGC Meta lookup table for popular competitive Pokémon
  const name = pokemon.name.toLowerCase();
  if (name.includes('miraidon')) return 'Choice Specs';
  if (name.includes('urshifu')) return 'Focus Sash';
  if (name.includes('farigiraf')) return 'Mental Herb';
  if (name.includes('iron-hands')) return 'Assault Vest';
  if (name.includes('whimsicott')) return 'Focus Sash';
  if (name.includes('chien-pao')) return 'Focus Sash';
  if (name.includes('dragonite')) return 'Choice Band';
  if (name.includes('flutter-mane')) return 'Booster Energy';
  if (name.includes('amoonguss')) return 'Rocky Helmet';
  if (name.includes('rillaboom')) return 'Assault Vest';
  if (name.includes('archaludon')) return 'Assault Vest';
  if (name.includes('pelipper')) return 'Focus Sash';
  if (name.includes('basculegion')) return 'Choice Band';
  if (name.includes('incineroar')) return 'Safety Goggles';
  if (name.includes('gholdengo')) return 'Choice Specs';
  if (name.includes('sneasler')) return 'Focus Sash';
  if (name.includes('primarina')) return 'Assault Vest';
  if (name.includes('ursaluna-bloodmoon')) return 'Life Orb';
  if (name.includes('ursaluna')) return 'Flame Orb';
  if (name.includes('torkoal')) return 'Charcoal';
  if (name.includes('gallade')) return 'Focus Sash';
  if (name.includes('kingambit')) return 'Black Glasses';
  if (name.includes('maushold')) return 'Wide Lens';
  if (name.includes('annihilape')) return 'Leftovers';
  if (name.includes('clefairy')) return 'Eviolite';
  if (name.includes('koraidon')) return 'Choice Band';
  if (name.includes('raging-bolt')) return 'Assault Vest';
  if (name.includes('chi-yu')) return 'Choice Specs';
  if (name.includes('calyrex')) return 'Choice Specs';
  if (name.includes('dragapult')) return 'Choice Band';
  if (name.includes('great-tusk')) return 'Booster Energy';
  if (name.includes('iron-valiant')) return 'Booster Energy';
  if (name.includes('corviknight')) return 'Leftovers';
  if (name.includes('ogerpon')) {
    if (name.includes('hearthflame')) return 'Hearthflame Mask';
    if (name.includes('wellspring')) return 'Wellspring Mask';
    if (name.includes('cornerstone')) return 'Cornerstone Mask';
    return 'Focus Sash';
  }

  // Fallback to single item based on role
  const role = getBattleRole(pokemon);
  if (role.includes('Bulky')) return 'Leftovers';
  if (role.includes('Fast')) return 'Focus Sash';
  if (role.includes('Special')) return 'Choice Specs';
  if (role.includes('Mixed')) return 'Life Orb';
  return 'Choice Band';
}

export function getSuggestedNature(pokemon) {
  const stat = Object.fromEntries(pokemon.stats.map(item => [item.name, item.value]));
  const attack = stat.attack || 0;
  const specialAttack = stat['special-attack'] || 0;
  const speed = stat.speed || 0;

  if (speed >= 90 && specialAttack >= attack) return 'Timid';
  if (speed >= 90) return 'Jolly';
  if (specialAttack > attack) return 'Modest';
  return 'Adamant';
}

export function getSuggestedEvSpread(pokemon) {
  const role = getBattleRole(pokemon);
  if (role.includes('Bulky')) return '252 HP / 4 Def / 252 SpD';
  if (role.includes('Special')) return '252 SpA / 4 SpD / 252 Spe';
  if (role.includes('Mixed')) return '252 Atk / 4 SpA / 252 Spe';
  return '252 Atk / 4 SpD / 252 Spe';
}

export function getMoveCandidates(pokeApiDetail) {
  const grouped = new Map();

  pokeApiDetail.moves.forEach(move => {
    move.version_group_details.forEach(detail => {
      const versionGroup = detail.version_group.name;
      if (!grouped.has(versionGroup)) grouped.set(versionGroup, []);
      grouped.get(versionGroup).push({
        name: move.move.name,
        url: move.move.url,
        method: detail.move_learn_method.name,
        level: detail.level_learned_at
      });
    });
  });

  const versionGroup = MOVE_VERSION_GROUP_PRIORITY.find(name => grouped.has(name)) ||
    Array.from(grouped.keys()).pop();

  return {
    versionGroup,
    moves: versionGroup ? dedupeMoves(grouped.get(versionGroup)) : []
  };
}

export async function getMoveDetails(candidates, limit = 32) {
  const priorityCandidates = candidates
    .map(candidate => ({
      ...candidate,
      priority: STRONG_MOVE_PRIORITY.indexOf(candidate.name)
    }))
    .sort((a, b) => {
      const aPriority = a.priority === -1 ? 999 : a.priority;
      const bPriority = b.priority === -1 ? 999 : b.priority;
      return aPriority - bPriority || a.name.localeCompare(b.name);
    })
    .slice(0, limit);

  const details = await Promise.all(
    priorityCandidates.map(async candidate => {
      try {
        const res = await fetch(candidate.url, { next: { revalidate: 60 * 60 * 24 * 7 } });
        if (!res.ok) return null;
        const detail = await res.json();
        const effect = detail.effect_entries.find(entry => entry.language.name === 'en');

        return {
          ...candidate,
          type: detail.type.name,
          category: detail.damage_class.name,
          power: detail.power,
          accuracy: detail.accuracy,
          desc: effect ? effect.short_effect.replace('$effect_chance%', `${detail.effect_chance || 0}%`) : 'Move data from PokeAPI.'
        };
      } catch {
        return null;
      }
    })
  );

  return details.filter(Boolean);
}

export function scoreMoveForRole(pokemon, move, role = getBattleRole(pokemon)) {
  const prefersSpecial = role.includes('Special');
  const prefersPhysical = role.includes('Physical');
  const pokemonTypes = new Set(pokemon.types);
  const priorityIndex = STRONG_MOVE_PRIORITY.indexOf(move.name);
  const stab = pokemonTypes.has(move.type) ? 35 : 0;
  const categoryFit =
    (prefersSpecial && move.category === 'special') ||
    (prefersPhysical && move.category === 'physical') ||
    role.includes('Mixed')
      ? 20
      : 0;
  const supportFit = role.includes('Support') && move.category === 'status' ? 30 : 0;
  const powerScore = move.power ? Math.min(move.power / 3, 45) : 12;
  const accuracyScore = move.accuracy ? Math.max((move.accuracy - 70) / 5, 0) : 5;
  const priorityScore = priorityIndex === -1 ? 0 : 50 - priorityIndex;

  return stab + categoryFit + supportFit + powerScore + accuracyScore + priorityScore;
}

export function selectRecommendedMoves(pokemon, moveDetails, role = getBattleRole(pokemon)) {
  return moveDetails
    .map(move => {
      return {
        ...move,
        score: scoreMoveForRole(pokemon, move, role)
      };
    })
    .sort((a, b) => b.score - a.score)
    .filter((move, index, all) => all.findIndex(item => item.name === move.name) === index)
    .slice(0, 4);
}

export function createBuildSuggestions(pokemon, moveDetails, abilities = []) {
  const rawSuggestions = getReputableBuildSuggestions(pokemon);
  
  return rawSuggestions.map(s => {
    // Resolve moves names to full PokeAPI move details objects (matching name or slug format)
    const resolvedMoves = s.moves.map(moveName => {
      const match = moveDetails.find(md => {
        const mdNameLower = md.name.toLowerCase().trim();
        const inputLower = moveName.toLowerCase().trim();
        return mdNameLower === inputLower || mdNameLower.replaceAll('-', ' ') === inputLower || mdNameLower.replaceAll(' ', '-') === inputLower;
      });

      if (match) {
        return {
          name: match.name,
          type: match.type,
          desc: match.desc
        };
      }

      // Fallback object structure if not in PokeAPI learnset cache
      return {
        name: moveName,
        type: 'normal',
        desc: 'Chiêu thức chiến thuật đặc trưng.'
      };
    });

    return {
      ...s,
      moves: resolvedMoves
    };
  });
}

function dedupeMoves(moves) {
  const seen = new Set();
  return moves.filter(move => {
    if (seen.has(move.name)) return false;
    seen.add(move.name);
    return true;
  });
}

export function getSuggestedItemsList(pokemon) {
  const name = pokemon.name.toLowerCase();
  const megaStone = getMegaHeldItem(pokemon.name);
  if (megaStone) return [megaStone];

  if (name.includes('miraidon')) return ['Choice Specs', 'Life Orb', 'Choice Scarf'];
  if (name.includes('koraidon')) return ['Choice Band', 'Clear Amulet', 'Life Orb'];
  if (name.includes('flutter-mane')) return ['Booster Energy', 'Focus Sash', 'Choice Specs'];
  if (name.includes('urshifu-rapid-strike') || name.includes('urshifu-water')) return ['Focus Sash', 'Choice Band', 'Mystic Water'];
  if (name.includes('urshifu-single-strike') || name.includes('urshifu-dark') || name.includes('urshifu')) return ['Focus Sash', 'Choice Band', 'Black Glasses'];
  if (name.includes('chien-pao')) return ['Focus Sash', 'Life Orb', 'Choice Band'];
  if (name.includes('chi-yu')) return ['Choice Specs', 'Focus Sash', 'Life Orb'];
  if (name.includes('ting-lu')) return ['Assault Vest', 'Leftovers', 'Sitrus Berry'];
  if (name.includes('amoonguss')) return ['Rocky Helmet', 'Mental Herb', 'Safety Goggles'];
  if (name.includes('incineroar')) return ['Safety Goggles', 'Sitrus Berry', 'Shuca Berry'];
  if (name.includes('rillaboom')) return ['Assault Vest', 'Miracle Seed', 'Choice Band'];
  if (name.includes('farigiraf')) return ['Mental Herb', 'Safety Goggles', 'Throat Spray'];
  if (name.includes('whimsicott')) return ['Focus Sash', 'Covert Cloak', 'Mental Herb'];
  if (name.includes('tornadus')) return ['Focus Sash', 'Mental Herb', 'Covert Cloak'];
  if (name.includes('raging-bolt')) return ['Assault Vest', 'Leftovers', 'Life Orb'];
  if (name.includes('iron-hands')) return ['Assault Vest', 'Clear Amulet', 'Sitrus Berry'];
  if (name.includes('iron-bundle')) return ['Focus Sash', 'Booster Energy', 'Life Orb'];
  if (name.includes('iron-valiant')) return ['Booster Energy', 'Focus Sash', 'Life Orb'];
  if (name.includes('iron-crown')) return ['Assault Vest', 'Booster Energy', 'Life Orb'];
  if (name.includes('gholdengo')) return ['Choice Specs', 'Life Orb', 'Covert Cloak'];
  if (name.includes('archaludon')) return ['Assault Vest', 'Power Herb', 'Leftovers'];
  if (name.includes('ursaluna-bloodmoon')) return ['Life Orb', 'Assault Vest', 'Throat Spray'];
  if (name.includes('ursaluna')) return ['Flame Orb', 'Leftovers', 'Assault Vest'];
  if (name.includes('torkoal')) return ['Charcoal', 'Choice Specs', 'Sitrus Berry'];
  if (name.includes('gallade')) return ['Focus Sash', 'Life Orb', 'Clear Amulet'];
  if (name.includes('kingambit')) return ['Black Glasses', 'Assault Vest', 'Safety Goggles'];
  if (name.includes('maushold')) return ['Wide Lens', 'Focus Sash', 'Safety Goggles'];
  if (name.includes('annihilape')) return ['Leftovers', 'Focus Sash', 'Choice Scarf'];
  if (name.includes('clefairy') || name.includes('porygon2') || name.includes('dusclops') || name.includes('duraludon')) return ['Eviolite'];
  if (name.includes('dragonite')) return ['Choice Band', 'Lum Berry', 'Assault Vest'];
  if (name.includes('garchomp')) return ['Clear Amulet', 'Life Orb', 'Focus Sash'];
  if (name.includes('landorus-therian')) return ['Choice Scarf', 'Assault Vest', 'Life Orb'];
  if (name.includes('landorus-incarnate')) return ['Life Orb', 'Focus Sash'];
  if (name.includes('thundurus')) return ['Mental Herb', 'Focus Sash', 'Safety Goggles'];
  if (name.includes('heatran')) return ['Leftovers', 'Assault Vest', 'Shuca Berry'];
  if (name.includes('cresselia')) return ['Mental Herb', 'Leftovers', 'Rocky Helmet'];
  if (name.includes('ogerpon')) {
    if (name.includes('hearthflame')) return ['Hearthflame Mask'];
    if (name.includes('wellspring')) return ['Wellspring Mask'];
    if (name.includes('cornerstone')) return ['Cornerstone Mask'];
    return ['Focus Sash', 'Miracle Seed', 'Clear Amulet'];
  }

  // Fallback lists based on role
  const role = getBattleRole(pokemon);
  if (role.includes('Bulky')) return ['Leftovers', 'Sitrus Berry', 'Rocky Helmet', 'Assault Vest'];
  if (role.includes('Fast Special')) return ['Focus Sash', 'Booster Energy', 'Choice Specs', 'Life Orb'];
  if (role.includes('Fast Physical')) return ['Focus Sash', 'Booster Energy', 'Choice Band', 'Life Orb'];
  if (role.includes('Special')) return ['Choice Specs', 'Life Orb', 'Assault Vest', 'Focus Sash'];
  if (role.includes('Mixed')) return ['Life Orb', 'Expert Belt', 'Assault Vest'];
  return ['Choice Band', 'Life Orb', 'Focus Sash', 'Clear Amulet'];
}
