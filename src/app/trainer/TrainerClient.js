'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import metaTeams from '@/lib/meta-teams.json';
import {
  getSuggestedNature,
  getSuggestedItem,
  getSuggestedEvSpread,
  formatPokemonName,
  getMegaHeldItem,
  getSuggestedItemsList
} from '@/lib/competitive';
import { getItemDesc, getMoveDesc } from '@/lib/competitive-descriptions';

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

const NON_SPECIES_PREFIXES = ['tapu', 'iron', 'great', 'scream', 'brute', 'flutter', 'slither', 'sandy', 'roaring', 'walking', 'gouging', 'raging'];

const getBaseSpeciesName = (name) => {
  const parts = name.toLowerCase().split('-');
  const first = parts[0];
  if (NON_SPECIES_PREFIXES.includes(first) && parts.length > 1) {
    return first + '-' + parts[1];
  }
  return first;
};

const EVOLUTION_FAMILIES = [
  ['bulbasaur', 'ivysaur', 'venusaur'],
  ['charmander', 'charmeleon', 'charizard'],
  ['squirtle', 'wartortle', 'blastoise'],
  ['caterpie', 'metapod', 'butterfree'],
  ['weedle', 'kakuna', 'beedrill'],
  ['pidgey', 'pidgeotto', 'pidgeot'],
  ['rattata', 'raticate'],
  ['spearow', 'fearow'],
  ['ekans', 'arbok'],
  ['pikachu', 'raichu', 'pichu'],
  ['sandshrew', 'sandslash'],
  ['nidoran-f', 'nidorina', 'nidoqueen'],
  ['nidoran-m', 'nidorino', 'nidoking'],
  ['clefairy', 'clefable', 'cleffa'],
  ['vulpix', 'ninetales'],
  ['jigglypuff', 'wigglytuff', 'igglybuff'],
  ['zubat', 'golbat', 'crobat'],
  ['oddish', 'gloom', 'vileplume', 'bellossom'],
  ['paras', 'parasect'],
  ['venonat', 'venomoth'],
  ['diglett', 'dugtrio'],
  ['meowth', 'persian', 'perrserker'],
  ['psyduck', 'golduck'],
  ['mankey', 'primeape', 'annihilape'],
  ['growlithe', 'arcanine'],
  ['poliwag', 'poliwhirl', 'poliwrath', 'politoed'],
  ['abra', 'kadabra', 'alakazam'],
  ['machop', 'machoke', 'machamp'],
  ['bellsprout', 'weepinbell', 'victreebel'],
  ['tentacool', 'tentacruel'],
  ['geodude', 'graveler', 'golem'],
  ['ponyta', 'rapidash'],
  ['slowpoke', 'slowbro', 'slowking'],
  ['magnemite', 'magneton', 'magnezone'],
  ['farfetchd', 'sirfetchd'],
  ['doduo', 'dodrio'],
  ['seel', 'dewgong'],
  ['grimer', 'muk'],
  ['shellder', 'cloyster'],
  ['gastly', 'haunter', 'gengar'],
  ['onix', 'steelix'],
  ['drowzee', 'hypno'],
  ['krabby', 'kingler'],
  ['voltorb', 'electrode'],
  ['exeggcute', 'exeggutor'],
  ['cubone', 'marowak'],
  ['tyrogue', 'hitmonlee', 'hitmonchan', 'hitmontop'],
  ['lickitung', 'lickilicky'],
  ['koffing', 'weezing'],
  ['rhyhorn', 'rhydon', 'rhyperior'],
  ['chansey', 'blissey', 'happiny'],
  ['tangela', 'tangrowth'],
  ['horsea', 'seadra', 'kingdra'],
  ['goldeen', 'seaking'],
  ['staryu', 'starmie'],
  ['mrmime', 'mimejr', 'mrrime', 'mr-mime', 'mime-jr', 'mr-rime'],
  ['scyther', 'scizor', 'kleavor'],
  ['jynx', 'smoochum'],
  ['electabuzz', 'electivire', 'elekid'],
  ['magmar', 'magmortar', 'magby'],
  ['magikarp', 'gyarados'],
  ['eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon'],
  ['porygon', 'porygon2', 'porygon-z'],
  ['omanyte', 'oma-star', 'omastar'],
  ['kabuto', 'kabutops'],
  ['snorlax', 'munchlax'],
  ['dratini', 'dragonair', 'dragonite'],
  ['sentret', 'furret'],
  ['hoothoot', 'noctowl'],
  ['ledyba', 'ledian'],
  ['spinarak', 'ariados'],
  ['chinchou', 'lanturn'],
  ['togepi', 'togetic', 'togekiss'],
  ['natu', 'xatu'],
  ['mareep', 'flaaffy', 'ampharos'],
  ['marill', 'azumarill', 'azurill'],
  ['sudowoodo', 'bonsly'],
  ['hoppip', 'skiploom', 'jumpluff'],
  ['aipom', 'ambipom'],
  ['sunkern', 'sunflora'],
  ['yanma', 'yanmega'],
  ['wooper', 'quagsire', 'clodsire'],
  ['murkrow', 'honchkrow'],
  ['misdreavus', 'mismagius'],
  ['pineco', 'forretress'],
  ['gligar', 'gliscor'],
  ['snubbull', 'granbull'],
  ['qwilfish', 'overqwil'],
  ['teddiursa', 'ursaring', 'ursaluna'],
  ['slugma', 'magcargo'],
  ['swinub', 'piloswine', 'mamoswine'],
  ['corsola', 'cursola'],
  ['remoraid', 'octillery'],
  ['mantine', 'mantyke'],
  ['houndour', 'houndoom'],
  ['phanpy', 'donphan'],
  ['stantler', 'wyrdeer'],
  ['larvitar', 'pupitar', 'tyranitar'],
  ['treecko', 'grovyle', 'sceptile'],
  ['torchic', 'combusken', 'blaziken'],
  ['mudkip', 'marshtomp', 'swampert'],
  ['poochyena', 'mightyena'],
  ['zigzagoon', 'linoone', 'obstagoon'],
  ['wurmple', 'silcoon', 'beautifly', 'cascoon', 'dustox'],
  ['lotad', 'lomibre', 'ludicolo'],
  ['seedot', 'nuzleaf', 'shiftry'],
  ['taillow', 'swellow'],
  ['wingull', 'pelipper'],
  ['ralts', 'kirlia', 'gardevoir', 'gallade'],
  ['surskit', 'masquerain'],
  ['shroomish', 'breloom'],
  ['slakoth', 'vigoroth', 'slaking'],
  ['nincada', 'ninjask', 'shedinja'],
  ['whismur', 'loudred', 'exploud'],
  ['makuhita', 'hariyama'],
  ['nosepass', 'probopass'],
  ['skitty', 'delcatty'],
  ['aron', 'lairon', 'aggron'],
  ['meditite', 'medicham'],
  ['electrike', 'manectric'],
  ['roselia', 'roserade', 'budew'],
  ['gulpin', 'swalot'],
  ['carvanha', 'sharpedo'],
  ['wailmer', 'wailord'],
  ['numel', 'camerupt'],
  ['spoink', 'grumpig'],
  ['trapinch', 'vibrava', 'flygon'],
  ['cacnea', 'cacturne'],
  ['swablu', 'altaria'],
  ['barboach', 'whiscash'],
  ['corphish', 'crawdaunt'],
  ['baltoy', 'claydol'],
  ['lileep', 'cradily'],
  ['anorith', 'armaldo'],
  ['feebas', 'milotic'],
  ['shuppet', 'banette'],
  ['duskull', 'dusclops', 'dusknoir'],
  ['chimecho', 'chingling'],
  ['snorunt', 'glalie', 'froslass'],
  ['spheal', 'sealeo', 'walrein'],
  ['clamperl', 'huntail', 'gorebyss'],
  ['bagon', 'shelgon', 'salamence'],
  ['beldum', 'metang', 'metagross'],
  ['turtwig', 'grotle', 'torterra'],
  ['chimchar', 'monferno', 'infernape'],
  ['piplup', 'prinplup', 'empoleon'],
  ['starly', 'staravia', 'staraptor'],
  ['bidoof', 'bibarel'],
  ['kricketot', 'kricketune'],
  ['shinx', 'luxio', 'luxray'],
  ['cranidos', 'rampardos'],
  ['shieldon', 'bastiodon'],
  ['burmy', 'wormadam', 'mothim'],
  ['combee', 'vespiquen'],
  ['buizel', 'floatzel'],
  ['cherubi', 'cherrim'],
  ['shellos', 'gastrodon'],
  ['drifloon', 'drifblim'],
  ['buneary', 'lopunny'],
  ['glameow', 'purugly'],
  ['stunky', 'skuntank'],
  ['bronzor', 'bronzong'],
  ['gible', 'gabite', 'garchomp'],
  ['riolu', 'lucario'],
  ['hippopotas', 'hippowdon'],
  ['skorupi', 'drapion'],
  ['croagunk', 'toxicroak'],
  ['finneon', 'lumineon'],
  ['snover', 'abomasnow'],
  ['snivy', 'servine', 'serperior'],
  ['tepig', 'pignite', 'emboar'],
  ['oshawott', 'dewott', 'samurott'],
  ['patrat', 'watchog'],
  ['lillipup', 'herdier', 'stoutland'],
  ['purrloin', 'liepard'],
  ['pansage', 'simisage'],
  ['pansear', 'simisear'],
  ['panpour', 'simipour'],
  ['munna', 'musharna'],
  ['pidove', 'tranquill', 'unfezant'],
  ['blitzle', 'zebstrika'],
  ['roggenrola', 'boldore', 'gigalith'],
  ['woobat', 'swoobat'],
  ['drilbur', 'excadrill'],
  ['timburr', 'gurdurr', 'conkeldurr'],
  ['tympole', 'palpitoad', 'seismitoad'],
  ['sewaddle', 'swadoon', 'leavanny'],
  ['venipede', 'whirlipede', 'scolipede'],
  ['cottonee', 'whimsicott'],
  ['petilil', 'lilligant'],
  ['basculin', 'basculegion'],
  ['sandile', 'krokorok', 'krookodile'],
  ['darumaka', 'darmanitan'],
  ['dwebble', 'crustle'],
  ['scraggy', 'scrafty'],
  ['yamask', 'cofagrigus', 'runerigus'],
  ['tirtouga', 'carracosta'],
  ['archen', 'archeops'],
  ['trubbish', 'garbodor'],
  ['zorua', 'zoroark'],
  ['minccino', 'cinccino'],
  ['gothita', 'gothorita', 'gothitelle'],
  ['solosis', 'duosion', 'reuniclus'],
  ['ducklett', 'swanna'],
  ['vanillite', 'vanillish', 'vanilluxe'],
  ['deerling', 'sawsbuck'],
  ['karrablast', 'escavalier'],
  ['foongus', 'amoonguss'],
  ['frillish', 'jellicent'],
  ['joltik', 'galvantula'],
  ['ferroseed', 'ferrothorn'],
  ['klink', 'klang', 'klinklang'],
  ['tynamo', 'eelektrik', 'eelektross'],
  ['elgyem', 'beheeyem'],
  ['litwick', 'lampent', 'chandelure'],
  ['axew', 'fraxure', 'haxorus'],
  ['cubchoo', 'beartic'],
  ['shelmet', 'accelgor'],
  ['mienfoo', 'mienshao'],
  ['golett', 'golurk'],
  ['pawniard', 'bisharp', 'kingambit'],
  ['rufflet', 'braviary'],
  ['vullaby', 'mandibuzz'],
  ['deino', 'zweilous', 'hydreigon'],
  ['larvesta', 'volcarona'],
  ['chespin', 'quilladin', 'chesnaught'],
  ['fennekin', 'braixen', 'delphox'],
  ['froakie', 'frogadier', 'greninja'],
  ['bunnelby', 'diggersby'],
  ['fletchling', 'fletchinder', 'talonflame'],
  ['scatterbug', 'spewpa', 'vivillon'],
  ['litleo', 'pyroar'],
  ['flabebe', 'floette', 'florges'],
  ['skiddo', 'gogoat'],
  ['pancham', 'pangoro'],
  ['espurr', 'meowstic'],
  ['honedge', 'doublade', 'aegislash'],
  ['spritzee', 'aromatisse'],
  ['swirlix', 'slurpuff'],
  ['inkay', 'malamar'],
  ['binacle', 'barbaracle'],
  ['skrelp', 'dragalge'],
  ['clauncher', 'clawitzer'],
  ['helioptile', 'heliolisk'],
  ['tyrunt', 'tyrantrum'],
  ['amaura', 'aurorus'],
  ['goomy', 'sliggoo', 'goodra'],
  ['phantump', 'trevenant'],
  ['pumpkaboo', 'gourgeist'],
  ['bergmite', 'avalugg'],
  ['noibat', 'noivern'],
  ['rowlet', 'dartrix', 'decidueye'],
  ['litten', 'torracat', 'incineroar'],
  ['popplio', 'brionne', 'primarina'],
  ['pikipek', 'trumbeak', 'toucannon'],
  ['yungoos', 'gumshoos'],
  ['grubbin', 'charjabug', 'vikavolt'],
  ['crabrawler', 'crabominable'],
  ['cutiefly', 'ribombee'],
  ['rockruff', 'lycanroc'],
  ['mareanie', 'toxapex'],
  ['mudbray', 'mudsdale'],
  ['dewpider', 'araquanid'],
  ['fomantis', 'lurantis'],
  ['morelull', 'shiinotic'],
  ['salandit', 'salazzle'],
  ['stufful', 'bewear'],
  ['bounsweet', 'steenee', 'tsareena'],
  ['wimpod', 'golisopod'],
  ['sandygast', 'palossand'],
  ['type-null', 'silvally'],
  ['jangmo-o', 'hakamo-o', 'kommo-o'],
  ['grookey', 'thwackey', 'rillaboom'],
  ['scorbunny', 'raboot', 'cinderace'],
  ['sobble', 'drizzile', 'inteleon'],
  ['rookidee', 'corvisquire', 'corviknight'],
  ['blipbug', 'dottler', 'orbeetle'],
  ['nickit', 'thievul'],
  ['gossifleur', 'eldegoss'],
  ['wooloo', 'dubwool'],
  ['chewtle', 'drednaw'],
  ['yamper', 'boltund'],
  ['rolycoly', 'carkol', 'coalossal'],
  ['applin', 'flapple', 'appletun', 'dipplin', 'hydrapple'],
  ['silicobra', 'sandaconda'],
  ['arrokuda', 'barraskewda'],
  ['toxel', 'toxtricity'],
  ['sizzlipede', 'centiskorch'],
  ['clobbopus', 'grapploct'],
  ['sinistea', 'polteageist', 'poltchageist', 'sinistcha'],
  ['hatenna', 'hattrem', 'hatterene'],
  ['impidimp', 'morgrem', 'grimmsnarl'],
  ['milcery', 'alcremie'],
  ['snom', 'frosmoth'],
  ['cufant', 'copperajah'],
  ['duraludon', 'archaludon'],
  ['dreepy', 'drakloak', 'dragapult'],
  ['sprigatito', 'floragato', 'meowscarada'],
  ['fuecoco', 'crocalor', 'skeledirge'],
  ['quaxly', 'quaxwell', 'quaquaval'],
  ['lechonk', 'oinkologne'],
  ['tarountula', 'spidops'],
  ['nymble', 'lokix'],
  ['pawmi', 'pawmo', 'pawmot'],
  ['tandemaus', 'maushold'],
  ['fidough', 'dachsbun'],
  ['smoliv', 'dolliv', 'arboliva'],
  ['nacli', 'naclstack', 'garganacl'],
  ['charcadet', 'armarouge', 'ceruledge'],
  ['tadbulb', 'bellibolt'],
  ['wattrel', 'kilowattrel'],
  ['maschiff', 'mabosstiff'],
  ['shroodle', 'grafaiai'],
  ['bramblin', 'brambleghast'],
  ['toedscool', 'toedscruel'],
  ['capsakid', 'scovillain'],
  ['rellor', 'rabsca'],
  ['flittle', 'espathra'],
  ['tinkatink', 'tinkatuff', 'tinkaton'],
  ['wiglett', 'wugtrio'],
  ['finizen', 'palafin'],
  ['varoom', 'revavroom'],
  ['glimmet', 'glimmora'],
  ['greavard', 'houndstone'],
  ['cetoddle', 'cetitan'],
  ['frigibax', 'arctibax', 'baxcalibur'],
  ['gimmighoul', 'gholdengo'],
  ['poltchageist', 'sinistcha']
];

const arePokemonRelated = (nameA, nameB) => {
  if (!nameA || !nameB) return false;
  
  const baseA = getBaseSpeciesName(nameA);
  const baseB = getBaseSpeciesName(nameB);
  
  if (baseA === baseB) return true;
  
  for (const family of EVOLUTION_FAMILIES) {
    const hasA = family.includes(baseA);
    const hasB = family.includes(baseB);
    if (hasA && hasB) {
      return true;
    }
  }
  
  return false;
};

const getTeamSuggestionsList = (ownedIds, allPkmn, includeUnowned, format, archetype) => {
  const getStat = (p, name) => p.stats?.find(s => s.name === name)?.value || 60;

  const getRoleIcon = (role) => {
    const r = role.toLowerCase();
    if (r.includes('tailwind') || r.includes('speed') || r.includes('pivot')) return 'fa-wind';
    if (r.includes('special') || r.includes('magic') || r.includes('special attacker')) return 'fa-wand-magic-sparkles';
    if (r.includes('physical') || r.includes('sweeper') || r.includes('attacker') || r.includes('strike')) return 'fa-hand-fist';
    if (r.includes('trick room') || r.includes('support') || r.includes('redirect') || r.includes('defensive') || r.includes('preventer') || r.includes('denial') || r.includes('redirector')) return 'fa-shield-halved';
    if (r.includes('weather') || r.includes('sun') || r.includes('rain') || r.includes('terrain') || r.includes('drizzle')) return 'fa-cloud-sun-rain';
    return 'fa-circle-nodes';
  };

  const getBalancedDynamicTeam = (arch) => {
    if (!ownedIds || ownedIds.length === 0) return null;
    const ownedPkmn = allPkmn.filter(p => ownedIds.includes(p.id));
    if (ownedPkmn.length === 0) return null;

    // Classify all owned candidates
    const candidates = ownedPkmn.map(p => {
      const atk = getStat(p, 'attack');
      const spa = getStat(p, 'special-attack');
      const spe = getStat(p, 'speed');
      const hp = getStat(p, 'hp');
      const def = getStat(p, 'defense');
      const spdef = getStat(p, 'special-defense');

      let sweeperScore = Math.max(atk, spa) * 1.5 + spe;
      let tankScore = hp * 1.2 + def + spdef;
      let supportScore = spe * 1.3 + hp + spdef;

      if (arch === 'offense') {
        sweeperScore += 50;
      } else if (arch === 'defense') {
        tankScore += 50;
      }

      let role = 'chủ lực';
      let bestScore = sweeperScore;
      if (tankScore > bestScore) {
        role = 'tank';
        bestScore = tankScore;
      }
      if (supportScore > bestScore && supportScore > tankScore) {
        role = 'support';
        bestScore = supportScore;
      }

      return { p, role, score: bestScore };
    });

    const sweepers = candidates.filter(c => c.role === 'chủ lực').map(c => c.p);
    const tanks = candidates.filter(c => c.role === 'tank').map(c => c.p);
    const supports = candidates.filter(c => c.role === 'support').map(c => c.p);

    const selected = [];
    const usedIds = new Set();

    const addFromPool = (pool, count) => {
      let added = 0;
      const sortedPool = [...pool].sort((a, b) => {
        const aVal = getStat(a, 'hp') + Math.max(getStat(a, 'attack'), getStat(a, 'special-attack')) + getStat(a, 'speed');
        const bVal = getStat(b, 'hp') + Math.max(getStat(b, 'attack'), getStat(b, 'special-attack')) + getStat(b, 'speed');
        return bVal - aVal;
      });
      for (const p of sortedPool) {
        if (added >= count) break;
        if (!usedIds.has(p.id)) {
          selected.push(p);
          usedIds.add(p.id);
          added++;
        }
      }
    };

    if (arch === 'offense') {
      addFromPool(sweepers, 3);
      addFromPool(supports, 2);
      addFromPool(tanks, 1);
    } else if (arch === 'defense') {
      addFromPool(tanks, 3);
      addFromPool(supports, 2);
      addFromPool(sweepers, 1);
    } else {
      addFromPool(sweepers, 2);
      addFromPool(tanks, 2);
      addFromPool(supports, 2);
    }

    const remainingCandidates = candidates.map(c => c.p).filter(p => !usedIds.has(p.id));
    const targetSize = Math.min(6, ownedPkmn.length);
    while (selected.length < targetSize && remainingCandidates.length > 0) {
      const next = remainingCandidates.shift();
      selected.push(next);
      usedIds.add(next.id);
    }

    const detailedPokemons = selected.map(p => {
      let roleLabel = 'Chủ lực (Sweeper)';
      let roleIcon = 'fa-hand-fist';

      if (sweepers.some(s => s.id === p.id)) {
        roleLabel = 'Chủ lực (Sweeper)';
        roleIcon = 'fa-hand-fist';
      } else if (tanks.some(t => t.id === p.id)) {
        roleLabel = 'Chống chịu (Tank)';
        roleIcon = 'fa-shield-halved';
      } else if (supports.some(s => s.id === p.id)) {
        roleLabel = 'Hỗ trợ (Support)';
        roleIcon = 'fa-wind';
      }

      return {
        ...p,
        roleName: roleLabel,
        roleIcon,
        isOwned: true
      };
    });

    const archLabel = arch.charAt(0).toUpperCase() + arch.slice(1);
    const formatLabel = format === 'single' ? 'Singles' : 'Doubles';

    return {
      teamName: `Your Custom ${archLabel} ${formatLabel} Core`,
      description: `Đội hình chiến thuật ${archLabel} được tối ưu hóa từ bộ sưu tập của bạn, đảm bảo cơ cấu VGC tiêu chuẩn: đầy đủ Chủ lực gây sát thương, Tank chống chịu và Support hỗ trợ hiệu ứng.`,
      operation: `Sử dụng các Pokémon Hỗ trợ (Support) để kiểm soát tốc độ trận đấu hoặc tạo hiệu ứng bất lợi cho đối thủ. Đưa các Pokémon Chống chịu (Tank) vào sân để đỡ đòn và kéo giãn đội hình địch, tạo cơ hội cho các Chủ lực (Sweeper) dồn sát thương dứt điểm trận đấu.`,
      source: 'Collection Balance Intelligence',
      pokemons: detailedPokemons,
      unownedCount: 0,
      archetype: arch
    };
  };

  // If includeUnowned is false, we try to see if they own any meta teams completely (0 unowned)
  // But if they don't, we suggest balanced role-based teams dynamically built from their own Pokémon collection!
  if (!includeUnowned) {
    const teamsList = [];
    const offenses = getBalancedDynamicTeam('offense');
    const defenses = getBalancedDynamicTeam('defense');
    const balanced = getBalancedDynamicTeam('balanced');
    if (offenses) teamsList.push(offenses);
    if (defenses) teamsList.push(defenses);
    if (balanced) teamsList.push(balanced);

    // Sort to boost the selected archetype to the front
    teamsList.sort((a, b) => {
      const aMatch = a.archetype === archetype ? 1 : 0;
      const bMatch = b.archetype === archetype ? 1 : 0;
      if (aMatch !== bMatch) return bMatch - aMatch;
      return 0;
    });

    return teamsList.slice(0, 3);
  }

  // Suggesting from Predefined META Teams (includeUnowned is true)
  const candidates = metaTeams.filter(t => t.format === format);

  const scoredTeams = candidates.map(team => {
    const detailedPokemons = team.pokemons.map(tp => {
      const found = allPkmn.find(p => p.id === tp.id);
      const isOwned = ownedIds.includes(tp.id);
      if (found) {
        return {
          ...found,
          roleName: tp.role,
          roleIcon: getRoleIcon(tp.role),
          isOwned
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
          isOwned
        };
      }
    });

    const unownedCount = detailedPokemons.filter(p => !p.isOwned).length;

    return {
      teamName: team.name,
      description: team.description,
      operation: team.operation,
      source: team.source,
      pokemons: detailedPokemons,
      unownedCount,
      archetype: team.archetype
    };
  });

  // Only include teams where the trainer owns at least 3 Pokémon (unownedCount <= 3)
  const validTeams = scoredTeams.filter(t => t.unownedCount <= 3);
  validTeams.sort((a, b) => a.unownedCount - b.unownedCount);

  // Boost teams matching selected archetype
  validTeams.sort((a, b) => {
    const aMatch = a.archetype === archetype ? 1 : 0;
    const bMatch = b.archetype === archetype ? 1 : 0;
    if (aMatch !== bMatch) return bMatch - aMatch;
    return 0;
  });

  let finalTeams = [...validTeams];

  // If we have fewer than 3 teams, append restTeams (which have >3 unowned) sorted by owned count
  if (finalTeams.length < 3) {
    const restTeams = scoredTeams.filter(t => t.unownedCount > 3);
    restTeams.sort((a, b) => a.unownedCount - b.unownedCount);
    finalTeams = [...finalTeams, ...restTeams];
  }

  return finalTeams.slice(0, 3);
};

const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison',
  'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark',
  'steel', 'fairy'
];

const getPokemonFeatureVector = (pokemon) => {
  const vec = new Array(30).fill(0);
  if (!pokemon) return vec;

  // 1-18: Types
  const types = pokemon.types || [];
  POKEMON_TYPES.forEach((type, idx) => {
    if (types.includes(type)) {
      vec[idx] = 1.0;
    }
  });

  // Helper to get stat value
  const getStatVal = (name) => {
    if (!pokemon.stats) return 50;
    const found = pokemon.stats.find(s => s.name === name);
    return found ? found.value : 50;
  };

  // 19-24: Stats normalized (divided by 150, capped at 1.0)
  const hp = getStatVal('hp');
  const atk = getStatVal('attack');
  const def = getStatVal('defense');
  const spatk = getStatVal('special-attack');
  const spdef = getStatVal('special-defense');
  const spe = getStatVal('speed');

  vec[18] = Math.min(hp / 150, 1.0);
  vec[19] = Math.min(atk / 150, 1.0);
  vec[20] = Math.min(def / 150, 1.0);
  vec[21] = Math.min(spatk / 150, 1.0);
  vec[22] = Math.min(spdef / 150, 1.0);
  vec[23] = Math.min(spe / 150, 1.0);

  // Abilities helper
  const abilities = (pokemon.abilities || []).map(a => a.toLowerCase().trim());
  const hasAbility = (list) => list.some(item => abilities.includes(item));

  // 25: Rain Synergy (Rain Setter or Swift Swim / Water-type benefits)
  const isRainSetter = hasAbility(['drizzle', 'primordial-sea']);
  const isRainAbuser = hasAbility(['swift-swim', 'rain-dish', 'hydration', 'dry-skin']);
  const isWater = types.includes('water');
  if (isRainSetter) vec[24] = 1.0;
  else if (isRainAbuser) vec[24] = 0.9;
  else if (isWater) vec[24] = 0.5;

  // 26: Sun Synergy (Sun Setter or Chlorophyll / Fire-type benefits)
  const isSunSetter = hasAbility(['drought', 'desolate-land']);
  const isSunAbuser = hasAbility(['chlorophyll', 'solar-power', 'harvest']);
  const isFire = types.includes('fire');
  if (isSunSetter) vec[25] = 1.0;
  else if (isSunAbuser) vec[25] = 0.9;
  else if (isFire) vec[25] = 0.5;

  // 27: Trick Room Synergy (Slow + Bulky)
  const isSlow = spe < 60;
  const isBulky = (hp + def + spdef) > 230;
  if (isSlow && isBulky) {
    vec[26] = 1.0;
  } else if (isSlow) {
    vec[26] = 0.5;
  }

  // 28: Tailwind / Fast Synergy
  const isFast = spe > 95;
  const isOffensive = (atk > 90 || spatk > 90);
  const isWindSetter = hasAbility(['prankster', 'gale-wings']) || (types.includes('flying') && spe > 90);
  if (isWindSetter) vec[27] = 1.0;
  else if (isFast && isOffensive) vec[27] = 0.8;
  else if (isFast) vec[27] = 0.5;

  // 29: Defensive Support & Intimidate
  const hasIntimidate = hasAbility(['intimidate', 'friend-guard', 'telepathy']);
  const isTank = hp > 85 && (def > 85 || spdef > 85);
  if (hasIntimidate) vec[28] = 1.0;
  else if (isTank) vec[28] = 0.6;

  // 30: Redirection / Typing Immunity Support (Lightning Rod, Storm Drain, etc.)
  const hasRedirection = hasAbility([
    'lightning-rod', 'storm-drain', 'flash-fire', 
    'volt-absorb', 'water-absorb', 'motor-drive', 
    'levitate', 'sap-sipper', 'herbivore'
  ]);
  if (hasRedirection) vec[29] = 1.0;

  return vec;
};

const getEmbeddingRecommendations = (activeTeamPokemonIds, allPkmn, ownedIds, filterOwnedOnly) => {
  if (!activeTeamPokemonIds || activeTeamPokemonIds.length === 0) return [];
  
  // 1. Get the vectors for all Pokémon currently in the team
  const activeVectors = activeTeamPokemonIds
    .map(id => {
      const p = allPkmn.find(pk => pk.id === id);
      return p ? getPokemonFeatureVector(p) : null;
    })
    .filter(Boolean);
    
  if (activeVectors.length === 0) return [];
  
  // 2. Average the vectors of the active team to create a "team context vector"
  const vectorDim = activeVectors[0].length;
  const teamVector = new Array(vectorDim).fill(0);
  for (let i = 0; i < vectorDim; i++) {
    let sum = 0;
    activeVectors.forEach(v => {
      sum += v[i];
    });
    teamVector[i] = sum / activeVectors.length;
  }
  
  // 3. Score all other Pokémon in the database against the team vector
  const recommendations = [];
  const activeTeamPokemons = activeTeamPokemonIds
    .map(id => allPkmn.find(pk => pk.id === id))
    .filter(Boolean);

  allPkmn.forEach(p => {
    // Avoid recommending Pokémon already on the team
    if (activeTeamPokemonIds.includes(p.id)) return;
    
    // Avoid recommending Pokémon related to any Pokémon already on the team
    const isRelated = activeTeamPokemons.some(teamP => arePokemonRelated(teamP.name, p.name));
    if (isRelated) return;
    
    // Check if we should only recommend from owned collection
    if (filterOwnedOnly && !ownedIds.includes(p.id)) return;
    
    const pVector = getPokemonFeatureVector(p);
    
    const score = cosineSimilarity(teamVector, pVector);
    recommendations.push({
      pokemon: p,
      score: score
    });
  });
  
  // 4. Sort by highest similarity score
  recommendations.sort((a, b) => b.score - a.score);
  
  // Return top 5 recommendations
  return recommendations.slice(0, 5);
};

const analyzeSynergy = (squad) => {
  if (!squad || squad.length === 0) return null;
  
  let score = 60;
  const pros = [];
  const cons = [];
  const warnings = [];
  
  const getStat = (p, name) => p.stats?.find(s => s.name === name)?.value || 60;
  
  // 1. Type coverage
  const types = squad.flatMap(p => p.types || []);
  const uniqueTypes = new Set(types);
  
  if (uniqueTypes.size >= 8) {
    score += 12;
    pros.push(`Excellent type diversity with ${uniqueTypes.size} unique types on the team.`);
  } else if (uniqueTypes.size >= 5) {
    score += 6;
    pros.push(`Good type diversity with ${uniqueTypes.size} unique types.`);
  } else {
    score -= 10;
    cons.push(`Low type diversity (${uniqueTypes.size} unique types). Consider adding different types to expand coverage.`);
  }
  
  const hasFire = types.includes('fire');
  const hasWater = types.includes('water');
  const hasGrass = types.includes('grass');
  if (hasFire && hasWater && hasGrass) {
    score += 12;
    pros.push("Elemental Core (Fire-Water-Grass) is fully active! Great defensive pivoting options.");
  } else {
    const missing = [];
    if (!hasFire) missing.push("Fire");
    if (!hasWater) missing.push("Water");
    if (!hasGrass) missing.push("Grass");
    if (squad.length >= 3) {
      cons.push(`Missing Elemental Core. Try adding a ${missing.join('/')} type for standard switching synergy.`);
    }
  }

  const hasSteel = types.includes('steel');
  const hasDragon = types.includes('dragon');
  const hasFairy = types.includes('fairy');
  if (hasSteel && hasDragon && hasFairy) {
    score += 12;
    pros.push("Fantasy Core (Dragon-Fairy-Steel) is fully active! Superb defensive resistances.");
  }

  // 2. True Defensive Weakness Check
  const sharedWeaknesses = [];
  const quadWeaknesses = [];

  const ALL_18_TYPES = Object.keys(TYPE_CHART);
  
  ALL_18_TYPES.forEach(attackingType => {
    let weakCount = 0;
    let resistCount = 0;
    
    squad.forEach(p => {
      const defenderTypes = p.types || [];
      const mult = defenderTypes.reduce((multiplier, defType) => {
        const row = TYPE_CHART[attackingType];
        const val = row ? row[defType] : 1.0;
        return multiplier * val;
      }, 1.0);
      
      if (mult >= 4.0) {
        quadWeaknesses.push({
          type: attackingType,
          pokemon: p.name,
          message: `Extreme Weakness: ${p.name} is double-weak (4x) to ${attackingType.toUpperCase()}`
        });
        weakCount += 2;
      } else if (mult > 1.0) {
        weakCount++;
      } else if (mult < 1.0) {
        resistCount++;
      }
    });
    
    if (weakCount >= 3 || (weakCount - resistCount >= 2)) {
      sharedWeaknesses.push({
        type: attackingType,
        count: Math.floor(weakCount),
        message: `Shared Weakness: Team has poor defense against ${attackingType.toUpperCase()} attacks (${Math.floor(weakCount)} members weak).`
      });
    }
  });

  if (quadWeaknesses.length > 0) {
    quadWeaknesses.slice(0, 2).forEach(qw => {
      score -= 5;
      warnings.push({
        type: qw.type,
        isQuad: true,
        message: qw.message
      });
    });
  }

  if (sharedWeaknesses.length > 0) {
    sharedWeaknesses.slice(0, 3).forEach(sw => {
      score -= 6;
      warnings.push({
        type: sw.type,
        isQuad: false,
        count: sw.count,
        message: sw.message
      });
    });
  }

  // 3. Stats & Offensive Balance
  let totalHp = 0;
  let totalSpeed = 0;
  let totalAtk = 0;
  let totalSpatk = 0;
  let physicalAttackers = 0;
  let specialAttackers = 0;
  let supports = 0;

  squad.forEach(p => {
    const hp = getStat(p, 'hp');
    const atk = getStat(p, 'attack');
    const def = getStat(p, 'defense');
    const spatk = getStat(p, 'special-attack');
    const spdef = getStat(p, 'special-defense');
    const spe = getStat(p, 'speed');

    totalHp += hp;
    totalSpeed += spe;
    totalAtk += atk;
    totalSpatk += spatk;

    if (atk > 95 && atk > spatk) physicalAttackers++;
    else if (spatk > 95 && spatk > atk) specialAttackers++;
    
    const abilities = (p.abilities || []).map(a => a.toLowerCase());
    const isSupportAbility = abilities.some(a => ['intimidate', 'friend-guard', 'follow-me', 'helper', 'prankster'].includes(a));
    if (isSupportAbility || (hp + def + spdef > 240 && Math.max(atk, spatk) < 85)) {
      supports++;
    }
  });

  const avgHp = totalHp / squad.length;
  const avgSpeed = totalSpeed / squad.length;
  const avgAtk = totalAtk / squad.length;
  const avgSpatk = totalSpatk / squad.length;
  const avgOffense = Math.max(avgAtk, avgSpatk);

  if (physicalAttackers > 0 && specialAttackers > 0) {
    score += 6;
    pros.push("Balanced offensive split (covers both physical and special sweepers).");
  } else if (squad.length >= 3) {
    if (physicalAttackers === 0 && specialAttackers > 0) {
      score -= 4;
      cons.push("Overly Special-biased. Walled by Special walls like Blissey.");
    } else if (specialAttackers === 0 && physicalAttackers > 0) {
      score -= 4;
      cons.push("Overly Physical-biased. Vulnerable to Intimidate and Burn.");
    }
  }

  if (avgHp >= 80) {
    pros.push("High defensive bulk rating across the team.");
  } else if (avgHp < 65 && squad.length >= 3) {
    score -= 4;
    cons.push("Team is relatively frail. Consider adding a bulky support or redirector.");
  }

  if (supports > 0) {
    pros.push(`Active Support/Disruptor role (${supports} members).`);
  } else if (squad.length >= 4) {
    score -= 4;
    cons.push("No dedicated support found (need Intimidate/redirection/prankster).");
  }

  // 4. VGC Core Synergies
  let hasRainSetter = false;
  let hasRainAbuser = false;
  let hasSunSetter = false;
  let hasSunAbuser = false;
  let hasTrickRoomSetter = false;
  let hasSlowAttacker = false;
  let hasTailwindSetter = false;

  squad.forEach(p => {
    const abs = (p.abilities || []).map(a => a.toLowerCase());
    const spe = getStat(p, 'speed');

    if (abs.includes('drizzle')) hasRainSetter = true;
    if (abs.some(a => ['swift-swim', 'rain-dish', 'hydration'].includes(a))) hasRainAbuser = true;

    if (abs.includes('drought')) hasSunSetter = true;
    if (abs.some(a => ['chlorophyll', 'solar-power'].includes(a))) hasSunAbuser = true;

    if (spe < 55) hasSlowAttacker = true;
    if (p.types.some(t => ['psychic', 'ghost'].includes(t)) && spe < 65 && (getStat(p, 'hp') + getStat(p, 'defense') + getStat(p, 'special-defense') > 220)) {
      hasTrickRoomSetter = true;
    }

    if (abs.includes('prankster') || (p.types.includes('flying') && spe > 95)) {
      hasTailwindSetter = true;
    }
  });

  if (hasRainSetter && hasRainAbuser) {
    score += 10;
    pros.push("Active Rain Core (Drizzle + Swift Swim)! High synergy.");
  }
  if (hasSunSetter && hasSunAbuser) {
    score += 10;
    pros.push("Active Sun Core (Drought + Chlorophyll)! High synergy.");
  }
  if (hasTrickRoomSetter && hasSlowAttacker) {
    score += 8;
    pros.push("Active Trick Room option (Bulky Setter + Slow Attackers).");
  } else if (hasSlowAttacker && !hasTrickRoomSetter && avgSpeed < 60 && squad.length >= 3) {
    cons.push("Slow team without Trick Room Setter. Suggest adding a Trick Room setter.");
  }
  if (hasTailwindSetter && avgSpeed > 85) {
    score += 6;
    pros.push("Active Tailwind Speed Control core.");
  }

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
      coverage: Math.min(100, Math.round(uniqueTypes.size * 5 + 10))
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

const MOVE_TYPES = {
  // Grass
  'energy ball': 'grass', 'giga drain': 'grass', 'leaf storm': 'grass', 'spore': 'grass', 'rage powder': 'grass', 'bullet seed': 'grass', 'wood hammer': 'grass', 'horn leech': 'grass', 'power whip': 'grass', 'grassy glide': 'grass', 'frenzy plant': 'grass', 'solar beam': 'grass', 'trailblaze': 'grass', 'giga-drain': 'grass', 'leaf-storm': 'grass', 'rage-powder': 'grass',
  // Fire
  'flamethrower': 'fire', 'fire blast': 'fire', 'will o wisp': 'fire', 'overheat': 'fire', 'flare blitz': 'fire', 'heat wave': 'fire', 'sunny day': 'fire', 'eruption': 'fire', 'fiery dance': 'fire', 'temper flare': 'fire', 'fire pledge': 'fire', 'blast burn': 'fire', 'will-o-wisp': 'fire', 'fire-blast': 'fire', 'flare-blitz': 'fire', 'heat-wave': 'fire',
  // Water
  'hydro pump': 'water', 'surf': 'water', 'scald': 'water', 'water spout': 'water', 'aqua jet': 'water', 'liquidation': 'water', 'muddy water': 'water', 'chilling water': 'water', 'flip turn': 'water', 'origin pulse': 'water', 'hydro cannon': 'water', 'water pledge': 'water', 'rain dance': 'water', 'hydro-pump': 'water', 'water-spout': 'water', 'aqua-jet': 'water', 'muddy-water': 'water', 'chilling-water': 'water', 'flip-turn': 'water',
  // Electric
  'thunderbolt': 'electric', 'thunder': 'electric', 'volt switch': 'electric', 'electroweb': 'electric', 'wild charge': 'electric', 'nuzzle': 'electric', 'thunder wave': 'electric', 'rising voltage': 'electric', 'parabolic charge': 'electric', 'discharge': 'electric', 'charge beam': 'electric', 'volt-switch': 'electric', 'wild-charge': 'electric', 'thunder-wave': 'electric',
  // Ice
  'ice beam': 'ice', 'blizzard': 'ice', 'haze': 'ice', 'icicle crash': 'ice', 'ice shard': 'ice', 'triple axel': 'ice', 'freeze dry': 'ice', 'snowscape': 'ice', 'aurora veil': 'ice', 'ice spinner': 'ice', 'ice-beam': 'ice', 'icicle-crash': 'ice', 'ice-shard': 'ice', 'freeze-dry': 'ice', 'aurora-veil': 'ice', 'ice-spinner': 'ice',
  // Fighting
  'close combat': 'fighting', 'drain punch': 'fighting', 'mach punch': 'fighting', 'sacred sword': 'fighting', 'body press': 'fighting', 'focus blast': 'fighting', 'aura sphere': 'fighting', 'superpower': 'fighting', 'low kick': 'fighting', 'detect': 'fighting', 'coaching': 'fighting', 'close-combat': 'fighting', 'drain-punch': 'fighting', 'mach-punch': 'fighting', 'body-press': 'fighting', 'focus-blast': 'fighting', 'aura-sphere': 'fighting',
  // Poison
  'sludge bomb': 'poison', 'sludge wave': 'poison', 'toxic': 'poison', 'gunk shot': 'poison', 'poison jab': 'poison', 'clear smog': 'poison', 'acid spray': 'poison', 'mortal spin': 'poison', 'toxic spikes': 'poison', 'sludge-bomb': 'poison', 'sludge-wave': 'poison', 'gunk-shot': 'poison', 'poison-jab': 'poison', 'clear-smog': 'poison',
  // Ground
  'earthquake': 'ground', 'earth power': 'ground', 'stomping tantrum': 'ground', 'high horse power': 'ground', 'scorch sands': 'ground', 'spikes': 'ground', 'sandstorm': 'ground', 'mud shot': 'ground', 'bulldoze': 'ground', 'earth-power': 'ground', 'stomping-tantrum': 'ground', 'high-horsepower': 'ground',
  // Flying
  'tailwind': 'flying', 'hurricane': 'flying', 'air slash': 'flying', 'brave bird': 'flying', 'roost': 'flying', 'dual wingbeat': 'flying', 'defog': 'flying', 'acrobatics': 'flying', 'dragon ascent': 'flying', 'bleakwind storm': 'flying', 'brave-bird': 'flying', 'dragon-ascent': 'flying',
  // Psychic
  'psychic': 'psychic', 'psyshock': 'psychic', 'trick room': 'psychic', 'expand force': 'psychic', 'calm mind': 'psychic', 'reflect': 'psychic', 'light screen': 'psychic', 'ally switch': 'psychic', 'imprison': 'psychic', 'lumina crash': 'psychic', 'psychic fangs': 'psychic', 'trick-room': 'psychic', 'calm-mind': 'psychic', 'light-screen': 'psychic',
  // Bug
  'u turn': 'bug', 'bug buzz': 'bug', 'struggle bug': 'bug', 'pounce': 'bug', 'lunge': 'bug', 'leech life': 'bug', 'quiver dance': 'bug', 'pollen puff': 'bug', 'u-turn': 'bug', 'bug-buzz': 'bug', 'struggle-bug': 'bug', 'leech-life': 'bug', 'quiver-dance': 'bug', 'pollen-puff': 'bug',
  // Rock
  'power gem': 'rock', 'rock slide': 'rock', 'stone edge': 'rock', 'stealth rock': 'rock', 'wide guard': 'rock', 'smack down': 'rock', 'rock tomb': 'rock', 'meteor beam': 'rock', 'rock-slide': 'rock', 'stone-edge': 'rock', 'stealth-rock': 'rock', 'wide-guard': 'rock',
  // Ghost
  'shadow ball': 'ghost', 'shadow sneak': 'ghost', 'astral barrage': 'ghost', 'night shade': 'ghost', 'destiny bond': 'ghost', 'curse': 'ghost', 'confuse ray': 'ghost', 'phantom force': 'ghost', 'poltergeist': 'ghost', 'hex': 'ghost', 'shadow-ball': 'ghost', 'shadow-sneak': 'ghost', 'night-shade': 'ghost', 'destiny-bond': 'ghost', 'phantom-force': 'ghost',
  // Dragon
  'draco meteor': 'dragon', 'dragon pulse': 'dragon', 'dragon dance': 'dragon', 'outrage': 'dragon', 'dragon claw': 'dragon', 'dragon tail': 'dragon', 'breaking swipe': 'dragon', 'scale shot': 'dragon', 'draco-meteor': 'dragon', 'dragon-pulse': 'dragon', 'dragon-dance': 'dragon', 'dragon-claw': 'dragon',
  // Steel
  'flash cannon': 'steel', 'iron head': 'steel', 'bullet punch': 'steel', 'make it rain': 'steel', 'steel beam': 'steel', 'heavy slam': 'steel', 'king shield': 'steel', 'gyro ball': 'steel', 'iron defense': 'steel', 'metal claw': 'steel', 'flash-cannon': 'steel', 'iron-head': 'steel', 'bullet-punch': 'steel', 'king-shield': 'steel',
  // Fairy
  'moonblast': 'fairy', 'dazzling gleam': 'fairy', 'play rough': 'fairy', 'spirit break': 'fairy', 'misty terrain': 'fairy', 'draining kiss': 'fairy', 'baby doll eyes': 'fairy', 'dazzling-gleam': 'fairy', 'play-rough': 'fairy', 'spirit-break': 'fairy',
  // Dark
  'snarl': 'dark', 'foul play': 'dark', 'dark pulse': 'dark', 'sucker punch': 'dark', 'knock off': 'dark', 'parting shot': 'dark', 'taunt': 'dark', 'lash out': 'dark', 'throat chop': 'dark', 'wicked blow': 'dark', 'ruination': 'dark', 'foul-play': 'dark', 'dark-pulse': 'dark', 'sucker-punch': 'dark', 'knock-off': 'dark', 'parting-shot': 'dark',
  // Normal
  'protect': 'normal', 'fake out': 'normal', 'extreme speed': 'normal', 'helping hand': 'normal', 'hyper voice': 'normal', 'yawn': 'normal', 'quick attack': 'normal', 'double edge': 'normal', 'facade': 'normal', 'slash': 'normal', 'tackle': 'normal', 'scratch': 'normal', 'growl': 'normal', 'tail whip': 'normal', 'swords dance': 'normal', 'recover': 'normal', 'whirlwind': 'normal', 'sing': 'normal', 'sonic boom': 'normal', 'disable': 'normal', 'pound': 'normal', 'fake-out': 'normal', 'extreme-speed': 'normal', 'helping-hand': 'normal', 'hyper-voice': 'normal', 'quick-attack': 'normal', 'double-edge': 'normal', 'swords-dance': 'normal'
};

const NATURES = [
  { name: 'Adamant', increased: 'attack', decreased: 'special-attack' },
  { name: 'Bashful', increased: null, decreased: null },
  { name: 'Bold', increased: 'defense', decreased: 'attack' },
  { name: 'Brave', increased: 'attack', decreased: 'speed' },
  { name: 'Calm', increased: 'special-defense', decreased: 'attack' },
  { name: 'Careful', increased: 'special-defense', decreased: 'special-attack' },
  { name: 'Docile', increased: null, decreased: null },
  { name: 'Gentle', increased: 'special-defense', decreased: 'defense' },
  { name: 'Hardy', increased: null, decreased: null },
  { name: 'Hasty', increased: 'speed', decreased: 'defense' },
  { name: 'Impish', increased: 'defense', decreased: 'special-attack' },
  { name: 'Jolly', increased: 'speed', decreased: 'special-attack' },
  { name: 'Lax', increased: 'defense', decreased: 'special-defense' },
  { name: 'Lonely', increased: 'attack', decreased: 'defense' },
  { name: 'Mild', increased: 'special-attack', decreased: 'defense' },
  { name: 'Modest', increased: 'special-attack', decreased: 'attack' },
  { name: 'Naive', increased: 'speed', decreased: 'special-defense' },
  { name: 'Naughty', increased: 'attack', decreased: 'special-defense' },
  { name: 'Quiet', increased: 'special-attack', decreased: 'speed' },
  { name: 'Quirky', increased: null, decreased: null },
  { name: 'Rash', increased: 'special-attack', decreased: 'special-defense' },
  { name: 'Relaxed', increased: 'defense', decreased: 'speed' },
  { name: 'Sassy', increased: 'special-defense', decreased: 'speed' },
  { name: 'Serious', increased: null, decreased: null },
  { name: 'Timid', increased: 'speed', decreased: 'attack' }
];

const STAT_DISPLAY_NAMES = {
  'hp': 'HP',
  'attack': 'ATK',
  'defense': 'DEF',
  'special-attack': 'SPA',
  'special-defense': 'SPD',
  'speed': 'SPE'
};

const calculateLevel50Stat = (statName, baseValue, ev, natureName, pokemonName) => {
  const evVal = parseInt(ev) || 0;
  if (statName === 'hp') {
    if (pokemonName && pokemonName.toLowerCase() === 'shedinja') {
      return 1;
    }
    return Math.floor((2 * baseValue + 31 + Math.floor(evVal / 4)) * 0.5) + 60;
  }

  const nature = NATURES.find(n => n.name.toLowerCase() === natureName.toLowerCase());
  let multiplier = 1.0;
  if (nature) {
    if (nature.increased === statName) multiplier = 1.1;
    else if (nature.decreased === statName) multiplier = 0.9;
  }

  const baseCalc = Math.floor((2 * baseValue + 31 + Math.floor(evVal / 4)) * 0.5) + 5;
  return Math.floor(baseCalc * multiplier);
};

const parseEvSpreadString = (spreadStr) => {
  const evs = { hp: 0, attack: 0, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 0 };
  if (!spreadStr) return evs;
  const parts = spreadStr.split('/');
  parts.forEach(part => {
    const match = part.trim().match(/^(\d+)\s+(.+)$/);
    if (match) {
      const val = parseInt(match[1]);
      const name = match[2].trim().toLowerCase();
      if (name === 'hp') evs.hp = val;
      else if (name === 'atk' || name === 'attack') evs.attack = val;
      else if (name === 'def' || name === 'defense') evs.defense = val;
      else if (name === 'spa' || name === 'special attack' || name === 'special-attack') evs['special-attack'] = val;
      else if (name === 'spd' || name === 'special defense' || name === 'special-defense') evs['special-defense'] = val;
      else if (name === 'spe' || name === 'speed') evs.speed = val;
    }
  });
  return evs;
};

const getItemImageUrl = (itemName) => {
  if (!itemName || itemName.toLowerCase() === 'none') return null;
  const normalized = itemName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${normalized}.png`;
};

const getTop4Moves = (movesList) => {
  if (!movesList || movesList.length === 0) return ['', '', '', ''];
  const PRIORITY = [
    'protect', 'fake out', 'spore', 'rage powder', 'follow me', 'tailwind', 'trick room',
    'stealth rock', 'defog', 'rapid spin', 'roost', 'recover', 'will o wisp', 'thunder wave',
    'swords dance', 'nasty plot', 'dragon dance', 'calm mind', 'bulk up', 'quiver dance',
    'u turn', 'volt switch', 'flip turn', 'knock off', 'earthquake', 'close combat',
    'draco meteor', 'outrage', 'dragon ascent', 'moonblast', 'play rough', 'thunderbolt',
    'thunder', 'ice beam', 'flamethrower', 'fire blast', 'hydro pump', 'surf', 'scald',
    'leaf storm', 'giga drain', 'sludge bomb', 'shadow ball', 'psyshock', 'psychic',
    'stone edge', 'rock slide', 'iron head', 'flash cannon', 'bullet punch', 'extreme speed',
    'sucker punch', 'shadow sneak', 'mach punch', 'aqua jet', 'body slam'
  ];
  
  const formattedMoves = movesList.map(m => m.move.name.replaceAll('-', ' '));
  const sorted = [...formattedMoves].sort((a, b) => {
    const aIdx = PRIORITY.indexOf(a);
    const bIdx = PRIORITY.indexOf(b);
    const aPriority = aIdx === -1 ? 999 : aIdx;
    const bPriority = bIdx === -1 ? 999 : bIdx;
    return aPriority - bPriority;
  });
  
  const selected = [];
  for (const m of sorted) {
    if (!selected.includes(m)) {
      selected.push(m);
    }
    if (selected.length === 4) break;
  }
  while (selected.length < 4) {
    selected.push('');
  }
  return selected;
};

const getHeldItemOptions = (pokemon) => {
  const options = ['None'];
  if (!pokemon) return options;

  // Add Mega Stone if applicable
  const megaStone = getMegaHeldItem ? getMegaHeldItem(pokemon.name) : null;
  if (megaStone) {
    options.push(megaStone);
  }
  
  // Add suggested item
  const suggested = getSuggestedItem ? getSuggestedItem(pokemon) : null;
  if (suggested) {
    suggested.split('/').forEach(item => {
      const trimmed = item.trim();
      if (trimmed && !options.includes(trimmed)) {
        options.push(trimmed);
      }
    });
  }
  
  // Add common VGC items
  const common = [
    'Leftovers', 'Life Orb', 'Focus Sash', 'Assault Vest',
    'Choice Band', 'Choice Specs', 'Choice Scarf',
    'Sitrus Berry', 'Lum Berry', 'Rocky Helmet',
    'Safety Goggles', 'Heavy-Duty Boots', 'Eviolite',
    'Weakness Policy', 'Expert Belt', 'Clear Amulet',
    'Covert Cloak', 'Booster Energy', 'Light Clay', 'Air Balloon'
  ];
  
  common.forEach(item => {
    if (!options.includes(item)) {
      options.push(item);
    }
  });
  
  return options;
};

export default function TrainerClient({ initialTrainer, allPokemon }) {
  const [trainer, setTrainer] = useState(initialTrainer);
  const [activeTab, setActiveTab] = useState('profile'); // profile | collection | simulator | matchups | settings | admin
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const enforceUniqueTeamItems = (teamIdx, currentBuilds, currentTeam) => {
    const updatedBuilds = { ...currentBuilds };
    const usedItems = new Set();

    const activeSlots = [];
    currentTeam.forEach((pokemonId, slotIdx) => {
      if (pokemonId) {
        const p = allPokemon.find(item => item.id === pokemonId);
        if (p) {
          activeSlots.push({ slotIdx, pokemon: p });
        }
      }
    });

    activeSlots.forEach(({ slotIdx, pokemon }) => {
      const key = `${teamIdx}_${slotIdx}`;
      const build = updatedBuilds[key];
      if (build) {
        let currentItem = build.heldItem || 'None';
        if (currentItem === 'None' || usedItems.has(currentItem)) {
          const preferences = getSuggestedItemsList ? getSuggestedItemsList(pokemon) : [getSuggestedItem(pokemon)];
          let assigned = false;

          for (const pref of preferences) {
            if (pref && pref !== 'None' && !usedItems.has(pref)) {
              build.heldItem = pref;
              usedItems.add(pref);
              assigned = true;
              break;
            }
          }

          if (!assigned) {
            const commonFallbacks = [
              'Safety Goggles', 'Focus Sash', 'Assault Vest', 'Choice Specs', 
              'Life Orb', 'Choice Band', 'Choice Scarf', 'Rocky Helmet', 
              'Sitrus Berry', 'Leftovers', 'Clear Amulet', 'Covert Cloak',
              'Booster Energy', 'Eviolite', 'Mental Herb'
            ];
            for (const fallback of commonFallbacks) {
              if (!usedItems.has(fallback)) {
                build.heldItem = fallback;
                usedItems.add(fallback);
                assigned = true;
                break;
              }
            }
          }

          if (!assigned) {
            build.heldItem = 'None';
          }
        } else {
          usedItems.add(currentItem);
        }
      }
    });

    return updatedBuilds;
  };
  
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
  const [suggestScope, setSuggestScope] = useState('all'); // owned | all
  const [suggestFormat, setSuggestFormat] = useState('double'); // single | double
  const [suggestArchetype, setSuggestArchetype] = useState('balanced'); // balanced | offense | defense
  const [activeSuggestTabIdx, setActiveSuggestTabIdx] = useState(0);

  // Custom team builder states
  const [teams, setTeams] = useState(initialTrainer.teams || [
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null]
  ]);
  const [activeTeamIdx, setActiveTeamIdx] = useState(0);
  const [showPokeSelector, setShowPokeSelector] = useState(false);
  const [activeSlotIdx, setActiveSlotIdx] = useState(null);
  
  // Custom builds states
  const [builds, setBuilds] = useState({});
  const [activeEditBuild, setActiveEditBuild] = useState(null); // { teamIdx, slotIdx, pokemon }
  const [localBuild, setLocalBuild] = useState(null);
  const [pokeApiDetail, setPokeApiDetail] = useState(null);
  const [loadingPokeApi, setLoadingPokeApi] = useState(false);
  const [focusedMoveIdx, setFocusedMoveIdx] = useState(null);
  const [moveSearchQuery, setMoveSearchQuery] = useState(['', '', '', '']);
  const [activeSelectMoveSlot, setActiveSelectMoveSlot] = useState(null);
  const [moveGroupSearchQuery, setMoveGroupSearchQuery] = useState('');
  const [customMoveTypes, setCustomMoveTypes] = useState({});
  
  // AI strategist coach states
  const [aiReport, setAiReport] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStep, setAiStep] = useState('');

  // Admin settings states
  const [adminTrainers, setAdminTrainers] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Friends list states
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

  // Type matchups graph states
  const [selectedGraphType, setSelectedGraphType] = useState('fire');
  const [matchupDirection, setMatchupDirection] = useState('offensive'); // offensive | defensive

  const router = useRouter();
  const isAdmin = trainer.username === 'admin' || trainer.role === 'admin';

  // Load saved custom teams from local storage on mount and sanitize them against owned collection
  useEffect(() => {
    const trainerId = trainer.id || trainer._id;
    if (typeof window !== 'undefined' && trainerId) {
      let loadedTeams = null;
      const saved = localStorage.getItem(`trainer_teams_${trainerId}`);
      if (saved) {
        try {
          loadedTeams = JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse trainer teams", e);
        }
      }
      
      if (!loadedTeams && trainer.teams) {
        loadedTeams = [...trainer.teams];
      }

      if (loadedTeams) {
        let changed = false;
        const ownedSet = new Set((trainer.ownedPokemon || []).map(id => Number(id)));
        const cleanedTeams = loadedTeams.map(team => {
          return team.map(slotId => {
            if (slotId !== null && !ownedSet.has(Number(slotId))) {
              changed = true;
              return null;
            }
            return slotId;
          });
        });

        if (changed) {
          const savedBuilds = localStorage.getItem(`trainer_builds_${trainerId}`);
          if (savedBuilds) {
            try {
              const parsed = JSON.parse(savedBuilds);
              let buildsChanged = false;
              loadedTeams.forEach((team, tIdx) => {
                team.forEach((slotId, sIdx) => {
                  if (slotId !== null && !ownedSet.has(Number(slotId))) {
                    const key = `${tIdx}_${sIdx}`;
                    if (parsed[key]) {
                      delete parsed[key];
                      buildsChanged = true;
                    }
                  }
                });
              });
              if (buildsChanged) {
                localStorage.setItem(`trainer_builds_${trainerId}`, JSON.stringify(parsed));
                setBuilds(parsed);
              }
            } catch (err) {
              console.error(err);
            }
          }
          handleSaveTeams(cleanedTeams);
        } else {
          setTeams(loadedTeams);
        }
      }
    }
  }, [trainer.id || trainer._id, trainer.ownedPokemon]);

  // Load saved custom builds from local storage on mount
  useEffect(() => {
    const trainerId = trainer.id || trainer._id;
    if (typeof window !== 'undefined' && trainerId) {
      const savedBuilds = localStorage.getItem(`trainer_builds_${trainerId}`);
      if (savedBuilds) {
        try {
          const parsed = JSON.parse(savedBuilds);
          Object.keys(parsed).forEach(key => {
            if (parsed[key] && parsed[key].heldItem && parsed[key].heldItem.includes('/')) {
              parsed[key].heldItem = parsed[key].heldItem.split('/')[0].trim();
            }
          });
          setBuilds(parsed);
        } catch (e) {
          console.error("Failed to parse trainer builds", e);
        }
      }
    }
  }, [trainer.id || trainer._id]);

  // Load build to local editing copy when activeEditBuild changes
  useEffect(() => {
    if (activeEditBuild) {
      const buildKey = `${activeEditBuild.teamIdx}_${activeEditBuild.slotIdx}`;
      const currentBuild = builds[buildKey] || {
        ability: activeEditBuild.pokemon.abilities[0] || '',
        heldItem: getSuggestedItem ? getSuggestedItem(activeEditBuild.pokemon) : 'None',
        nature: getSuggestedNature ? getSuggestedNature(activeEditBuild.pokemon) : 'Serious',
        evs: getSuggestedEvSpread && parseEvSpreadString ? parseEvSpreadString(getSuggestedEvSpread(activeEditBuild.pokemon)) : { hp: 0, attack: 0, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 0 },
        moves: ['', '', '', '']
      };
      const cleanBuild = JSON.parse(JSON.stringify(currentBuild));
      if (cleanBuild && cleanBuild.heldItem && cleanBuild.heldItem.includes('/')) {
        cleanBuild.heldItem = cleanBuild.heldItem.split('/')[0].trim();
      }
      setLocalBuild(cleanBuild);
      setMoveSearchQuery(cleanBuild.moves.map(m => m || ''));
    } else {
      setLocalBuild(null);
      setMoveSearchQuery(['', '', '', '']);
      setActiveSelectMoveSlot(null);
      setMoveGroupSearchQuery('');
    }
  }, [activeEditBuild, builds]);

  // Fetch detailed PokeAPI data when modal opens (for moves autocomplete)
  useEffect(() => {
    if (!activeEditBuild) {
      setPokeApiDetail(null);
      return;
    }

    const fetchPokeDetails = async () => {
      setLoadingPokeApi(true);
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${activeEditBuild.pokemon.id}`);
        if (res.ok) {
          const detail = await res.json();
          setPokeApiDetail(detail);

          // Pre-populate moves if they are all empty
          setLocalBuild(prev => {
            if (prev && prev.moves.every(m => !m)) {
              const suggestedMoves = getTop4Moves(detail.moves);
              setMoveSearchQuery(suggestedMoves);
              return {
                ...prev,
                moves: suggestedMoves
              };
            }
            return prev;
          });
        }
      } catch (e) {
        console.error("Failed to fetch PokeAPI details", e);
      } finally {
        setLoadingPokeApi(false);
      }
    };

    fetchPokeDetails();
  }, [activeEditBuild]);

  // Fetch unknown move types in background for element grouping
  useEffect(() => {
    if (!pokeApiDetail) return;
    
    const unknownMoves = pokeApiDetail.moves.filter(m => {
      const name = m.move.name.replaceAll('-', ' ');
      return !MOVE_TYPES[name] && !customMoveTypes[name];
    });
    
    if (unknownMoves.length === 0) return;
    
    const fetchUnknown = async () => {
      const newTypes = {};
      try {
        const batchSize = 15;
        for (let i = 0; i < unknownMoves.length; i += batchSize) {
          const batch = unknownMoves.slice(i, i + batchSize);
          await Promise.all(batch.map(async (m) => {
            try {
              const res = await fetch(m.move.url);
              if (res.ok) {
                const data = await res.json();
                const name = m.move.name.replaceAll('-', ' ');
                newTypes[name] = data.type.name;
              }
            } catch (e) {
              console.error("Failed to fetch move type in background", e);
            }
          }));
        }
      } finally {
        if (Object.keys(newTypes).length > 0) {
          setCustomMoveTypes(prev => ({ ...prev, ...newTypes }));
        }
      }
    };
    
    fetchUnknown();
  }, [pokeApiDetail]);

  // Fetch other trainers as friends when tab is active
  useEffect(() => {
    if (activeTab === 'friends') {
      const fetchFriends = async () => {
        setLoadingFriends(true);
        try {
          const res = await fetch('/api/trainer/list');
          const data = await res.json();
          if (res.ok) {
            setFriends(data.trainers || []);
          }
        } catch (e) {
          console.error("Failed to fetch friends list", e);
        } finally {
          setLoadingFriends(false);
        }
      };
      fetchFriends();
      setSelectedFriend(null);
    }
  }, [activeTab]);
  
  const handleSaveTeams = async (newTeams) => {
    setTeams(newTeams);
    const trainerId = trainer.id || trainer._id;
    if (typeof window !== 'undefined' && trainerId) {
      localStorage.setItem(`trainer_teams_${trainerId}`, JSON.stringify(newTeams));
    }
    setAiReport(null); // Reset AI report when team changes

    // Persist to database
    try {
      await fetch('/api/trainer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teams: newTeams }),
      });
    } catch (e) {
      console.error("Failed to save teams to database", e);
    }
  };

  const handleAddPokemonToSlot = (pokemonId) => {
    const newTeams = [...teams];
    newTeams[activeTeamIdx][activeSlotIdx] = pokemonId;
    handleSaveTeams(newTeams);

    // Initialize default build
    const p = allPokemon.find(item => item.id === pokemonId);
    if (p) {
      const trainerId = trainer.id || trainer._id;
      const key = `${activeTeamIdx}_${activeSlotIdx}`;
      const defaultBuild = {
        ability: p.abilities[0] || '',
        heldItem: getSuggestedItem ? getSuggestedItem(p) : '',
        nature: getSuggestedNature ? getSuggestedNature(p) : 'Serious',
        evs: getSuggestedEvSpread && parseEvSpreadString ? parseEvSpreadString(getSuggestedEvSpread(p)) : { hp: 0, attack: 0, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 0 },
        moves: ['', '', '', '']
      };
      let updatedBuilds = { ...builds, [key]: defaultBuild };
      
      // Enforce unique items across the active team
      updatedBuilds = enforceUniqueTeamItems(activeTeamIdx, updatedBuilds, newTeams[activeTeamIdx]);
      
      setBuilds(updatedBuilds);
      if (typeof window !== 'undefined' && trainerId) {
        localStorage.setItem(`trainer_builds_${trainerId}`, JSON.stringify(updatedBuilds));
      }
    }

    setShowPokeSelector(false);
    setActiveSlotIdx(null);
  };

  const handleRemovePokemonFromSlot = (slotIdx) => {
    const newTeams = [...teams];
    newTeams[activeTeamIdx][slotIdx] = null;
    handleSaveTeams(newTeams);

    // Clean up build for this slot
    const trainerId = trainer.id || trainer._id;
    const key = `${activeTeamIdx}_${slotIdx}`;
    const updatedBuilds = { ...builds };
    delete updatedBuilds[key];
    setBuilds(updatedBuilds);
    if (typeof window !== 'undefined' && trainerId) {
      localStorage.setItem(`trainer_builds_${trainerId}`, JSON.stringify(updatedBuilds));
    }
  };

  const handleDeploySuggestedTeam = async () => {
    if (!suggestionResult) return;
    const suggestedIds = suggestedTeam.map(p => p.id);
    const unownedIds = suggestedIds.filter(id => !trainer.ownedPokemon.includes(id));
    
    if (!window.confirm(`Do you want to deploy the entire "${suggestionResult.teamName}" to your active slot? (Missing Pokémon will be automatically added to your collection)`)) {
      return;
    }
    
    let currentTrainer = trainer;
    if (unownedIds.length > 0) {
      try {
        const res = await fetch('/api/trainer/pokemon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pokemonId: unownedIds, action: 'add' }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to update collection');
        }
        setTrainer(data.trainer);
        currentTrainer = data.trainer;
      } catch (err) {
        alert("Failed to auto-add Pokémon to your collection: " + err.message);
        return;
      }
    }

    const newTeams = [...teams];
    newTeams[activeTeamIdx] = [null, null, null, null, null, null];
    suggestedIds.forEach((id, idx) => {
      if (idx < 6) {
        newTeams[activeTeamIdx][idx] = id;
      }
    });

    await handleSaveTeams(newTeams);

    // Initialize default builds for these slots
    const trainerId = currentTrainer.id || currentTrainer._id;
    let updatedBuilds = { ...builds };
    suggestedIds.forEach((id, idx) => {
      if (idx >= 6) return;
      const key = `${activeTeamIdx}_${idx}`;
      if (!updatedBuilds[key]) {
        const p = allPokemon.find(item => item.id === id);
        if (p) {
          updatedBuilds[key] = {
            ability: p.abilities?.[0] || '',
            heldItem: getSuggestedItem ? getSuggestedItem(p) : '',
            nature: getSuggestedNature ? getSuggestedNature(p) : 'Serious',
            evs: getSuggestedEvSpread && parseEvSpreadString ? parseEvSpreadString(getSuggestedEvSpread(p)) : { hp: 0, attack: 0, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 0 },
            moves: ['', '', '', '']
          };
        }
      }
    });

    // Enforce unique items across the active team
    updatedBuilds = enforceUniqueTeamItems(activeTeamIdx, updatedBuilds, newTeams[activeTeamIdx]);

    setBuilds(updatedBuilds);
    if (typeof window !== 'undefined' && trainerId) {
      localStorage.setItem(`trainer_builds_${trainerId}`, JSON.stringify(updatedBuilds));
    }

    alert(`Successfully deployed "${suggestionResult.teamName}" to Team Slot ${activeTeamIdx + 1}!`);
  };

  const handleRunAiAnalysis = () => {
    const activeTeam = teams[activeTeamIdx];
    const activeTeamPokemon = [];
    activeTeam.forEach((id, slotIdx) => {
      if (id) {
        const found = allPokemon.find(p => p.id === id);
        if (found) {
          activeTeamPokemon.push({
            pokemon: found,
            slotIdx: slotIdx
          });
        }
      }
    });

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
        
        // Generate detailed stats & custom build analyses for each team member
        const memberAnalyses = activeTeamPokemon.map(({ pokemon: p, slotIdx }) => {
          const buildKey = `${activeTeamIdx}_${slotIdx}`;
          const customBuild = builds[buildKey] || {
            ability: p.abilities?.[0] || 'Unknown',
            heldItem: 'None',
            nature: 'Serious',
            evs: { hp: 0, attack: 0, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 0 },
            moves: ['', '', '', '']
          };

          const evs = customBuild.evs || { hp: 0, attack: 0, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 0 };
          const hpBase = p.stats?.find(s => s.name === 'hp')?.value || 60;
          const atkBase = p.stats?.find(s => s.name === 'attack')?.value || 60;
          const defBase = p.stats?.find(s => s.name === 'defense')?.value || 60;
          const spaBase = p.stats?.find(s => s.name === 'special-attack')?.value || 60;
          const spdBase = p.stats?.find(s => s.name === 'special-defense')?.value || 60;
          const speBase = p.stats?.find(s => s.name === 'speed')?.value || 60;

          const hpLv50 = calculateLevel50Stat('hp', hpBase, evs.hp, customBuild.nature, p.name);
          const atkLv50 = calculateLevel50Stat('attack', atkBase, evs.attack, customBuild.nature, p.name);
          const defLv50 = calculateLevel50Stat('defense', defBase, evs.defense, customBuild.nature, p.name);
          const spaLv50 = calculateLevel50Stat('special-attack', spaBase, evs['special-attack'], customBuild.nature, p.name);
          const spdLv50 = calculateLevel50Stat('special-defense', spdBase, evs['special-defense'], customBuild.nature, p.name);
          const speLv50 = calculateLevel50Stat('speed', speBase, evs.speed, customBuild.nature, p.name);

          const ability = customBuild.ability || p.abilities?.[0] || 'Unknown';
          const heldItem = customBuild.heldItem || 'None';
          const nature = customBuild.nature || 'Serious';
          const selectedMoves = customBuild.moves?.filter(Boolean) || [];

          // Determine role desc
          let roleDesc = "";
          if (speLv50 > 130 && Math.max(atkLv50, spaLv50) > 130) {
            roleDesc = "Fast Sweeper. High Speed and offensive power. Focus on securing early-game KOs.";
          } else if (hpLv50 + defLv50 + spdLv50 > 420) {
            roleDesc = "Bulky Pivot/Tank. Exceptional natural defenses. Great for safe switch-in cycles.";
          } else if (speLv50 > 120) {
            roleDesc = "Fast Disrupter/Support. Speed control and utility. Pivot using status moves.";
          } else if (Math.max(atkLv50, spaLv50) > 140) {
            roleDesc = "Bulky Attacker/Wallbreaker. Heavy hits with moderate bulk. Setup Trick Room to shine.";
          } else {
            roleDesc = "Balanced Combatant. Decent stats all-around. Adaptable to multiple strategies.";
          }

          // Coach Tips
          const coachTips = [];
          if (heldItem === 'None' || heldItem.toLowerCase() === 'none') {
            let suggested = "Leftovers";
            if (speLv50 > 120 && Math.max(atkLv50, spaLv50) > 120) suggested = "Focus Sash / Life Orb";
            else if (hpLv50 + defLv50 + spdLv50 > 400) suggested = "Assault Vest / Rocky Helmet";
            coachTips.push(`Held Item is missing. We suggest running ${suggested} to optimize utility.`);
          }
          const isNeutralNature = ['serious', 'docile', 'hardy', 'bashful', 'quirky'].includes(nature.toLowerCase());
          if (isNeutralNature) {
            let suggested = "Jolly / Timid";
            if (atkLv50 > spaLv50) suggested = "Jolly (+Speed, -SpA) or Adamant (+Atk, -SpA)";
            else if (spaLv50 > atkLv50) suggested = "Timid (+Speed, -Atk) or Modest (+SpA, -Atk)";
            coachTips.push(`Neutral nature (${nature}) detected. We suggest changing to ${suggested} for competitive benefit.`);
          }
          if (selectedMoves.length < 4) {
            coachTips.push(`Only ${selectedMoves.length}/4 moves set. Consider adding utility like 'Protect' or speed control.`);
          }
          const totalEvs = Object.values(evs).reduce((a, b) => a + b, 0);
          if (totalEvs === 0) {
            coachTips.push("EV spread is unallocated (0 EVs). Please allocate EVs in the custom build modal to boost performance.");
          }

          return {
            id: p.id,
            name: p.name,
            image: p.image,
            types: p.types,
            ability,
            heldItem,
            nature,
            roleDesc,
            selectedMoves,
            evs,
            coachTips,
            stats: { hp: hpLv50, attack: atkLv50, defense: defLv50, 'special-attack': spaLv50, 'special-defense': spdLv50, speed: speLv50 },
            baseStats: { hp: hpBase, attack: atkBase, defense: defBase, 'special-attack': spaBase, 'special-defense': spdBase, speed: speBase }
          };
        });

        const avgSpeed = Math.round(memberAnalyses.reduce((acc, m) => acc + m.stats.speed, 0) / memberAnalyses.length);
        const avgHp = Math.round(memberAnalyses.reduce((acc, m) => acc + m.stats.hp, 0) / memberAnalyses.length);
        const avgDef = Math.round(memberAnalyses.reduce((acc, m) => acc + m.stats.defense, 0) / memberAnalyses.length);
        const avgSpd = Math.round(memberAnalyses.reduce((acc, m) => acc + m.stats['special-defense'], 0) / memberAnalyses.length);
        const avgHpDef = Math.round(memberAnalyses.reduce((acc, m) => acc + m.baseStats.hp + m.baseStats.defense, 0) / memberAnalyses.length); // back-compat
        const avgPhysicalBulk = avgHp + avgDef;
        const avgSpecialBulk = avgHp + avgSpd;

        // Check Synergies
        const abilities = memberAnalyses.map(m => m.ability.toLowerCase());
        const moves = memberAnalyses.flatMap(m => m.selectedMoves.map(mv => mv.toLowerCase()));
        
        const hasSunSetter = abilities.some(a => ['drought', 'desolate-land'].includes(a));
        const hasRainSetter = abilities.some(a => ['drizzle', 'primordial-sea'].includes(a));
        const hasSandSetter = abilities.some(a => ['sand-stream'].includes(a));
        const hasSnowSetter = abilities.some(a => ['snow-warning'].includes(a));

        const hasTrickRoom = moves.includes('trick room');
        const hasTailwind = moves.includes('tailwind');
        const hasRedirection = moves.some(m => ['follow me', 'rage powder'].includes(m));
        const hasIntimidate = abilities.includes('intimidate');
        const hasProtect = moves.filter(m => m === 'protect').length;

        // Determine Archetype
        let archetype = "Standard Balanced Offense";
        if (hasTrickRoom && avgSpeed < 80) archetype = "Trick Room Bulky Offense";
        else if (hasTailwind) archetype = "Tailwind Speed Control";
        else if (hasSunSetter) archetype = "Sun Weather Offense";
        else if (hasRainSetter) archetype = "Rain Weather Offense";
        else if (hasSandSetter) archetype = "Sand Bulky Offense";
        else if (avgSpeed > 115) archetype = "Fast Hyper Offense";
        else if (avgPhysicalBulk + avgSpecialBulk > 520) archetype = "Bulky Balance / Defensive Pivot";

        // Synergy Score Calculation
        let synergyScore = 50;
        if (hasTrickRoom || hasTailwind) synergyScore += 15;
        if (hasRedirection || hasIntimidate) synergyScore += 15;
        if (hasProtect >= 2) synergyScore += 10;
        else if (hasProtect === 1) synergyScore += 5;
        
        const types = memberAnalyses.flatMap(m => m.types);
        const hasFWG = types.includes('fire') && types.includes('water') && types.includes('grass');
        const hasFantasy = types.includes('dragon') && types.includes('steel') && types.includes('fairy');
        if (hasFWG) synergyScore += 10;
        if (hasFantasy) synergyScore += 10;
        synergyScore = Math.min(100, Math.max(25, synergyScore));

        // Speed distribution tier tag
        let speedTier = "Medium Paced";
        if (avgSpeed > 115) speedTier = "Very Fast (Sweeper Heavy)";
        else if (avgSpeed > 90) speedTier = "Moderately Fast";
        else if (avgSpeed < 65) speedTier = "Very Slow (TR Optimized)";

        // Type Weakness Audit
        const getDamageMultiplier = (pkTypes, attackType) => {
          let mult = 1.0;
          pkTypes.forEach(pt => {
            const row = TYPE_CHART[attackType];
            if (row && row[pt] !== undefined) {
              mult *= row[pt];
            }
          });
          return mult;
        };

        const matrix = POKEMON_TYPES.map(t => {
          let weakCount = 0;
          let resistCount = 0;
          let immuneCount = 0;
          let neutralCount = 0;
          
          const mults = memberAnalyses.map(m => {
            const mult = getDamageMultiplier(m.types, t);
            if (mult > 1) weakCount++;
            else if (mult === 0) immuneCount++;
            else if (mult < 1) resistCount++;
            else neutralCount++;
            return { memberId: m.id, name: m.name, mult };
          });

          const isHazard = (weakCount >= 3) && (resistCount + immuneCount < 2);

          return {
            type: t,
            weakCount,
            resistCount,
            immuneCount,
            neutralCount,
            isHazard,
            mults
          };
        });

        const hazards = matrix.filter(m => m.isHazard).map(m => m.type);

        // Select physical & special carry
        const sortedByAtk = [...memberAnalyses].sort((a, b) => b.stats.attack - a.stats.attack);
        const physicalAce = sortedByAtk[0];

        const sortedBySpa = [...memberAnalyses].sort((a, b) => b.stats['special-attack'] - a.stats['special-attack']);
        const specialAce = sortedBySpa[0];

        const getAceAdvice = (ace, isSpecial) => {
          const typeList = ace.types.join(' & ');
          let advice = `Pair ${formatPokemonName(ace.name)} with redirection (Follow Me / Rage Powder) to allow safe setup turns. `;
          
          if (ace.heldItem.includes('Choice')) {
            advice += `Since they are holding a Choice item (${ace.heldItem}), use pivots (U-turn / Volt Switch) to reset locked moves. `;
          } else if (ace.heldItem.includes('Life Orb')) {
            advice += `Life Orb boosts offensive output but drains HP; support them with screens (Reflect/Light Screen) or healing to extend longevity. `;
          }

          if (isSpecial) {
            advice += `As a Special Attacker, watch out for opposing Snarl or Assault Vest pivots. Target physical defense cores instead.`;
          } else {
            advice += `As a Physical Attacker, watch out for Intimidate recycling. Pair with Defiant/Competitive teammates, or clear hazards to secure KOs.`;
          }
          return advice;
        };

        const physicalAceAdvice = getAceAdvice(physicalAce, false);
        const specialAceAdvice = getAceAdvice(specialAce, true);

        // Optimal Leads
        const sortedBySpeed = [...memberAnalyses].sort((a, b) => b.stats.speed - a.stats.speed);
        
        let lead1 = [sortedBySpeed[0], sortedBySpeed[1] || sortedBySpeed[0]];
        const tailwindUser = memberAnalyses.find(m => m.selectedMoves.map(mv => mv.toLowerCase()).includes('tailwind'));
        if (tailwindUser) {
          const bestAttacker = memberAnalyses.find(m => m.id !== tailwindUser.id && (m.stats.attack > 120 || m.stats['special-attack'] > 120)) || sortedBySpeed[0];
          lead1 = [tailwindUser, bestAttacker];
        }

        let lead2 = [memberAnalyses.find(m => m.ability.toLowerCase() === 'intimidate') || sortedBySpeed[sortedBySpeed.length - 1], sortedBySpeed[Math.floor(sortedBySpeed.length / 2)]];
        if (lead2[0].id === lead2[1].id && memberAnalyses.length > 2) {
          lead2[1] = memberAnalyses.find(m => m.id !== lead2[0].id) || lead2[1];
        }

        let lead3 = [sortedBySpeed[sortedBySpeed.length - 1], sortedBySpeed[sortedBySpeed.length - 2] || sortedBySpeed[sortedBySpeed.length - 1]];
        const trickRoomUser = memberAnalyses.find(m => m.selectedMoves.map(mv => mv.toLowerCase()).includes('trick room'));
        if (trickRoomUser) {
          const slowAttacker = memberAnalyses.find(m => m.id !== trickRoomUser.id && m.stats.speed < 80) || sortedBySpeed[sortedBySpeed.length - 1];
          lead3 = [trickRoomUser, slowAttacker];
        }

        const leads = [
          {
            title: tailwindUser ? "Tailwind Speed Setup" : "Fast Offensive Lead",
            p1: lead1[0],
            p2: lead1[1],
            desc: tailwindUser 
              ? `Lead with ${formatPokemonName(lead1[0].name)} to set up Tailwind on Turn 1, enabling ${formatPokemonName(lead1[1].name)} to outspeed and apply massive immediate pressure.`
              : `Lead with ${formatPokemonName(lead1[0].name)} and ${formatPokemonName(lead1[1].name)} to secure fast offensive momentum. Use Protect on Turn 1 to scout targets.`
          },
          {
            title: "Pivot & Disruptive Lead",
            p1: lead2[0],
            p2: lead2[1],
            desc: `Deploy ${formatPokemonName(lead2[0].name)} to disrupt opposing strategies (via Fake Out, Intimidate, or status) while ${formatPokemonName(lead2[1].name)} setups or chips away.`
          },
          {
            title: trickRoomUser ? "Trick Room Setup" : "Anti-Meta / Defensive Lead",
            p1: lead3[0],
            p2: lead3[1],
            desc: trickRoomUser
              ? `Establish Trick Room with ${formatPokemonName(lead3[0].name)} on Turn 1. Once active, swap or attack immediately with slow powerhouse ${formatPokemonName(lead3[1].name)}.`
              : `Slow defensive lead option. Excellent for matching against hyper-aggressive opponents or stall teams, playing standard pivot swaps.`
          }
        ];

        // Pivots list
        const pivots = [];
        memberAnalyses.forEach(m => {
          const pivotMoves = m.selectedMoves.filter(mv => ['u-turn', 'volt switch', 'parting shot', 'flip turn'].includes(mv.toLowerCase()));
          if (pivotMoves.length > 0) {
            pivots.push(`${formatPokemonName(m.name)} can pivot using ${pivotMoves.join(' / ')} to cycle abilities (like Intimidate) and escape bad matchups.`);
          }
        });

        const groundType = memberAnalyses.find(m => m.types.includes('ground'));
        const electricFly = memberAnalyses.some(m => m.types.includes('water') || m.types.includes('flying'));
        if (groundType && electricFly) {
          pivots.push(`Switch ${formatPokemonName(groundType.name)} in on expected Electric attacks targeting your Water/Flying types for a free immune turn.`);
        }

        const flyingOrLev = memberAnalyses.find(m => m.types.includes('flying') || m.ability.toLowerCase() === 'levitate');
        const weakToGround = memberAnalyses.some(m => m.types.includes('steel') || m.types.includes('fire') || m.types.includes('electric') || m.types.includes('poison') || m.types.includes('rock'));
        if (flyingOrLev && weakToGround) {
          pivots.push(`Pivoting to ${formatPokemonName(flyingOrLev.name)} is a safe switch on predicted Ground attacks (Earthquake/Stomping Tantrum).`);
        }

        if (pivots.length === 0) {
          pivots.push("No explicit pivot moves detected. Focus on manual hard switches using type resistances to absorb super-effective hits.");
        }

        // Playbook vs weather / trick room / tailwind
        let playbookVsTailwind = "To beat Tailwind teams, match their speed control using your own Tailwind, or set up Trick Room to reverse the speed brackets. Alternatively, lead defensively and use Protect to stall out their 4 turns of speed advantage.";
        if (hasTrickRoom) {
          playbookVsTailwind = "You have Trick Room! Match opposing Tailwind by setting up Trick Room on Turn 1. Their high speed will become their downfall, allowing your slower, heavier hitters to sweep.";
        }

        let playbookVsTrickRoom = "Against Trick Room, use Fake Out on their setter, or taunt them to deny the setup. If Trick Room is already active, pivot to your slowest Pokémon or use Protect to stall out the 5 turns of distortion.";
        if (hasTrickRoom) {
          playbookVsTrickRoom = "Since you have Trick Room, you can use Trick Room on the turn they set it to immediately reverse it, or simply play comfortably within their setup using your slow sweepers.";
        }

        let playbookVsWeather = "Weather teams (Rain/Sun) rely on weather setters. Deny their weather by leading with your own setter if you have one, or stall out their speed boost (Swift Swim/Chlorophyll) using Protect or pivoting.";
        if (hasSunSetter || hasRainSetter || hasSandSetter || hasSnowSetter) {
          playbookVsWeather = "You have your own weather setter! Lead with your backline setter or switch them in on Turn 1 to override their weather conditions, stripping them of speed and damage bonuses.";
        }

        setAiReport({
          avgSpeed,
          avgPhysicalBulk,
          avgSpecialBulk,
          avgHpDef, // back-compat
          synergyScore,
          speedTier,
          hazards,
          matrix,
          physicalAce,
          physicalAceAdvice,
          specialAce,
          specialAceAdvice,
          leads,
          pivots,
          playbook: {
            vsTailwind: playbookVsTailwind,
            vsTrickRoom: playbookVsTrickRoom,
            vsWeather: playbookVsWeather
          },
          archetype,
          members: memberAnalyses
        });
        setAiLoading(false);
      }
    }, 500);
  };
  
  const ownedPokemonDetails = allPokemon.filter(p => trainer.ownedPokemon.includes(p.id));
  const suggestionResults = getTeamSuggestionsList(trainer.ownedPokemon, allPokemon, suggestScope === 'all', suggestFormat, suggestArchetype) || [];
  const safeTabIdx = activeSuggestTabIdx >= suggestionResults.length ? 0 : activeSuggestTabIdx;
  const suggestionResult = suggestionResults[safeTabIdx] || null;
  const suggestedTeam = suggestionResult ? suggestionResult.pokemons : [];

  const activeTeamIdsForRec = (teams[activeTeamIdx] || []).filter(Boolean);
  const aiRecommendedPartners = getEmbeddingRecommendations(
    activeTeamIdsForRec, 
    allPokemon, 
    trainer.ownedPokemon, 
    true
  );

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
      alert('Profile updated successfully!');
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

      // If a Pokemon was removed, automatically remove it from any active team slots & delete their custom builds
      if (action === 'remove') {
        let teamChanged = false;
        const newTeams = teams.map((team) => {
          return team.map((slotId) => {
            if (slotId !== null && Number(slotId) === Number(pokemonId)) {
              teamChanged = true;
              return null;
            }
            return slotId;
          });
        });

        if (teamChanged) {
          const trainerId = data.trainer.id || data.trainer._id;
          const updatedBuilds = { ...builds };
          let buildsChanged = false;

          teams.forEach((team, tIdx) => {
            team.forEach((slotId, sIdx) => {
              if (slotId !== null && Number(slotId) === Number(pokemonId)) {
                const key = `${tIdx}_${sIdx}`;
                if (updatedBuilds[key]) {
                  delete updatedBuilds[key];
                  buildsChanged = true;
                }
              }
            });
          });

          if (buildsChanged) {
            setBuilds(updatedBuilds);
            if (typeof window !== 'undefined' && trainerId) {
              localStorage.setItem(`trainer_builds_${trainerId}`, JSON.stringify(updatedBuilds));
            }
          }

          // Persist the updated team configurations
          await handleSaveTeams(newTeams);
        }
      }
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

        {!isAdmin && (
          <button 
            className={`trainer-nav-item ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            <i className="fa-solid fa-user-group"></i> Friends
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
                          <div 
                            key={slotIdx} 
                            className="vanguard-card" 
                            style={{ position: 'relative', cursor: 'pointer' }}
                            onClick={() => {
                              setActiveSelectMoveSlot(null);
                              setMoveGroupSearchQuery('');
                              setActiveEditBuild({
                                teamIdx: activeTeamIdx,
                                slotIdx,
                                pokemon: p
                              });
                            }}
                          >
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
                            
                            {/* Custom Build badges */}
                            {(() => {
                              const buildKey = `${activeTeamIdx}_${slotIdx}`;
                              const b = builds[buildKey];
                              if (b) {
                                const activeMoves = b.moves.filter(Boolean);
                                return (
                                  <div className="slot-build-badges" onClick={(e) => e.stopPropagation()}>
                                    <div className="slot-badge-title-row">
                                      <span>Build Details</span>
                                      <span style={{ color: '#10b981', fontSize: '0.62rem' }}>Click card to edit</span>
                                    </div>
                                    <div className="slot-badge-list">
                                      {b.ability && <span className="slot-build-badge slot-badge-ability" title={`Ability: ${b.ability}`}>{b.ability}</span>}
                                      {b.heldItem && (
                                        <span className="slot-build-badge slot-badge-item" title={`Item: ${b.heldItem}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', flexWrap: 'wrap' }}>
                                          {b.heldItem.split('/').map((part, pIdx) => {
                                            const trimmed = part.trim();
                                            const imgUrl = getItemImageUrl(trimmed);
                                            return (
                                              <span key={pIdx} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.1rem' }}>
                                                {imgUrl && (
                                                  <img 
                                                    src={imgUrl} 
                                                    alt="" 
                                                    style={{ width: '12px', height: '12px', objectFit: 'contain' }}
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                  />
                                                )}
                                                {trimmed}
                                                {pIdx < b.heldItem.split('/').length - 1 && ' / '}
                                              </span>
                                            );
                                          })}
                                        </span>
                                      )}
                                      {b.nature && <span className="slot-build-badge slot-badge-nature" title={`Nature: ${b.nature}`}>{b.nature}</span>}
                                      {activeMoves.map((m, mIdx) => {
                                        const actualMoveIdx = b.moves.indexOf(m);
                                        return (
                                          <span 
                                            key={mIdx} 
                                            className="slot-build-badge slot-badge-move" 
                                            title={`Click to change: ${m}`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setActiveSelectMoveSlot(actualMoveIdx);
                                              setMoveGroupSearchQuery('');
                                              setActiveEditBuild({
                                                teamIdx: activeTeamIdx,
                                                slotIdx,
                                                pokemon: p
                                              });
                                            }}
                                            style={{ cursor: 'pointer' }}
                                          >
                                            {m}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              }
                              return (
                                <div className="slot-build-badges" style={{ borderTop: 'none', paddingColor: 'transparent', color: 'var(--text-secondary)', fontSize: '0.65rem', fontStyle: 'italic', marginTop: '0.3rem' }}>
                                  Click to customize build (ability, item, stats)
                                </div>
                              );
                            })()}
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
                        {/* AI Recommended Partners based on current team embeddings */}
                        {aiRecommendedPartners.length > 0 && (
                          <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <i className="fa-solid fa-wand-magic-sparkles" style={{ color: 'var(--primary-color)' }}></i> AI Recommended Partners
                            </h4>
                            <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.4rem', scrollbarWidth: 'thin' }}>
                              {aiRecommendedPartners.map(({ pokemon: p, score }) => {
                                const matchPercentage = Math.round(score * 100);
                                return (
                                  <div 
                                    key={`rec-${p.id}`}
                                    onClick={() => handleAddPokemonToSlot(p.id)}
                                    style={{
                                      padding: '0.6rem',
                                      border: '1.5px solid rgba(184, 35, 28, 0.25)',
                                      borderRadius: '12px',
                                      textAlign: 'center',
                                      cursor: 'pointer',
                                      background: '#ffffff',
                                      minWidth: '100px',
                                      flexShrink: 0,
                                      boxShadow: '0 2px 8px rgba(184, 35, 28, 0.04)',
                                      position: 'relative'
                                    }}
                                  >
                                    <span style={{ 
                                      position: 'absolute', 
                                      top: '5px', 
                                      right: '6px', 
                                      fontSize: '0.65rem', 
                                      fontWeight: 800, 
                                      background: 'var(--primary-light)', 
                                      color: 'var(--primary-color)',
                                      padding: '0.1rem 0.3rem',
                                      borderRadius: '4px'
                                    }}>
                                      {matchPercentage}%
                                    </span>
                                    <img 
                                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`}
                                      alt={p.name} 
                                      style={{ width: '40px', height: '40px', objectFit: 'contain', margin: '0.4rem auto 0.1rem' }} 
                                    />
                                    <h5 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {p.name}
                                    </h5>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

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

                {/* Build Editor Modal */}
                {activeEditBuild && localBuild && (
                  <div className="build-modal-overlay" onClick={() => setActiveEditBuild(null)}>
                    <div 
                      className="build-modal-container" 
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        '--header-theme-rgb': activeEditBuild.pokemon.types[0] === 'fire' ? '238, 129, 48' :
                                              activeEditBuild.pokemon.types[0] === 'water' ? '99, 144, 240' :
                                              activeEditBuild.pokemon.types[0] === 'grass' ? '122, 199, 76' :
                                              activeEditBuild.pokemon.types[0] === 'electric' ? '247, 208, 44' :
                                              activeEditBuild.pokemon.types[0] === 'ice' ? '150, 217, 214' :
                                              activeEditBuild.pokemon.types[0] === 'fighting' ? '194, 46, 40' :
                                              activeEditBuild.pokemon.types[0] === 'poison' ? '163, 62, 161' :
                                              activeEditBuild.pokemon.types[0] === 'ground' ? '226, 191, 101' :
                                              activeEditBuild.pokemon.types[0] === 'flying' ? '169, 143, 243' :
                                              activeEditBuild.pokemon.types[0] === 'psychic' ? '249, 85, 135' :
                                              activeEditBuild.pokemon.types[0] === 'bug' ? '166, 185, 26' :
                                              activeEditBuild.pokemon.types[0] === 'rock' ? '182, 161, 54' :
                                              activeEditBuild.pokemon.types[0] === 'ghost' ? '115, 87, 151' :
                                              activeEditBuild.pokemon.types[0] === 'dragon' ? '111, 53, 252' :
                                              activeEditBuild.pokemon.types[0] === 'steel' ? '183, 183, 206' :
                                              activeEditBuild.pokemon.types[0] === 'fairy' ? '214, 133, 173' :
                                              activeEditBuild.pokemon.types[0] === 'dark' ? '112, 87, 70' : '184, 35, 28'
                      }}
                    >
                      {/* Header */}
                      <div className="build-modal-header">
                        <div className="build-modal-header-info">
                          <img src={activeEditBuild.pokemon.image} alt={activeEditBuild.pokemon.name} className="build-modal-header-img" />
                          <div className="build-modal-header-title">
                            <h3 style={{ textTransform: 'capitalize' }}>{activeEditBuild.pokemon.name}</h3>
                            <p>Slot #{activeEditBuild.slotIdx + 1} &bull; Team {activeEditBuild.teamIdx + 1}</p>
                          </div>
                        </div>
                        <button className="build-modal-close-btn" onClick={() => setActiveEditBuild(null)}>
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>

                      {/* Content */}
                      <div className="build-modal-content">
                        <div className="build-modal-grid">
                          
                          {/* Left Column: Build details */}
                          <div>
                            <div className="build-section-title">
                              <span>Pokémon Setup</span>
                              <button 
                                type="button" 
                                className="build-suggest-btn"
                                onClick={() => {
                                  const p = activeEditBuild.pokemon;
                                  const suggestedItem = getSuggestedItem ? getSuggestedItem(p) : '';
                                  const suggestedNature = getSuggestedNature ? getSuggestedNature(p) : 'Serious';
                                  const parsedEvs = parseEvSpreadString(getSuggestedEvSpread ? getSuggestedEvSpread(p) : '');
                                  
                                  let suggestedMoves = ['', '', '', ''];
                                  if (pokeApiDetail && pokeApiDetail.moves) {
                                    suggestedMoves = getTop4Moves(pokeApiDetail.moves);
                                  }

                                  setLocalBuild({
                                    ...localBuild,
                                    ability: p.abilities[0] || '',
                                    heldItem: suggestedItem,
                                    nature: suggestedNature,
                                    evs: parsedEvs,
                                    moves: suggestedMoves
                                  });
                                  setMoveSearchQuery(suggestedMoves);
                                  setActiveSelectMoveSlot(null);
                                  setMoveGroupSearchQuery('');
                                }}
                              >
                                <i className="fa-solid fa-wand-magic-sparkles"></i> Load Recommended Build
                              </button>
                            </div>

                            {/* Ability Selector */}
                            <div className="build-field">
                              <label>Ability</label>
                              <select 
                                className="build-select"
                                value={localBuild.ability}
                                onChange={(e) => setLocalBuild({ ...localBuild, ability: e.target.value })}
                                style={{ textTransform: 'capitalize' }}
                              >
                                {activeEditBuild.pokemon.abilities.map(ab => (
                                  <option key={ab} value={ab} style={{ textTransform: 'capitalize' }}>
                                    {ab.replaceAll('-', ' ')}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Held Item Select Dropdown */}
                            <div className="build-field">
                              <label>Held Item</label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {localBuild.heldItem && localBuild.heldItem !== 'None' && (
                                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    {localBuild.heldItem.split('/').map((part, pIdx) => {
                                      const trimmed = part.trim();
                                      const imgUrl = getItemImageUrl(trimmed);
                                      if (!imgUrl) return null;
                                      return (
                                        <div key={pIdx} style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', flexShrink: 0 }}>
                                          <img 
                                            src={imgUrl} 
                                            alt={trimmed}
                                            title={trimmed}
                                            style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                                <select 
                                  className="build-select"
                                  style={{ flex: 1 }}
                                  value={localBuild.heldItem || 'None'}
                                  onChange={(e) => setLocalBuild({ ...localBuild, heldItem: e.target.value })}
                                >
                                  {(() => {
                                    const options = getHeldItemOptions(activeEditBuild.pokemon);
                                    if (localBuild.heldItem && !options.includes(localBuild.heldItem)) {
                                      options.push(localBuild.heldItem);
                                    }
                                    return options.map(item => (
                                      <option key={item} value={item}>
                                        {item}
                                      </option>
                                    ));
                                  })()}
                                </select>
                              </div>
                              {localBuild.heldItem && localBuild.heldItem !== 'None' && (
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.35rem', fontStyle: 'italic', lineHeight: '1.3' }}>
                                  <i className="fa-solid fa-circle-question" style={{ marginRight: '0.2rem', color: '#6390f0' }}></i>
                                  {localBuild.heldItem.split('/').map(part => {
                                    const trimmed = part.trim();
                                    return `${trimmed}: ${getItemDesc(trimmed)}`;
                                  }).join(' | ')}
                                </p>
                              )}
                            </div>

                            {/* 4 Moves Interactive Slots */}
                            <div className="build-field" style={{ marginBottom: 0 }}>
                              <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Moves Customization (Up to 4)</span>
                                {loadingPokeApi && <span style={{ textTransform: 'none', fontSize: '0.72rem', color: 'var(--text-secondary)' }}><i className="fa-solid fa-spinner fa-spin"></i> Loading learnset...</span>}
                              </label>
                              
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
                                {[0, 1, 2, 3].map((moveIdx) => {
                                  const moveName = localBuild.moves[moveIdx];
                                  const normalizedMoveName = moveName ? moveName.toLowerCase() : '';
                                  const moveType = MOVE_TYPES[normalizedMoveName] || customMoveTypes[normalizedMoveName] || 'normal';
                                  const typeColor = TYPE_TRANSLATIONS[moveType]?.color || '#999';
                                  const isSelected = activeSelectMoveSlot === moveIdx;

                                  return (
                                    <button
                                      key={moveIdx}
                                      type="button"
                                      onClick={() => {
                                        setActiveSelectMoveSlot(isSelected ? null : moveIdx);
                                      }}
                                      style={{
                                        padding: '0.8rem 1rem',
                                        borderRadius: '12px',
                                        border: isSelected ? '2px solid rgba(var(--header-theme-rgb, 184, 35, 28), 1)' : '1px solid var(--border-color)',
                                        background: moveName ? `${typeColor}15` : '#ffffff',
                                        color: moveName ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        transition: 'all 0.15s'
                                      }}
                                    >
                                      <span style={{ textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        {moveName ? (
                                          <>
                                            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: typeColor }}></span>
                                            {moveName}
                                          </>
                                        ) : (
                                          `Select Move ${moveIdx + 1}`
                                        )}
                                      </span>
                                      <i className={`fa-solid ${isSelected ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ fontSize: '0.75rem', opacity: 0.6 }}></i>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Grouped learnable moves panel */}
                              {activeSelectMoveSlot !== null && (
                                <div style={{
                                  background: '#f8fafc',
                                  borderRadius: '16px',
                                  padding: '1.2rem',
                                  border: '1px solid var(--border-color)',
                                  maxHeight: '320px',
                                  overflowY: 'auto',
                                  marginBottom: '1rem'
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                                      Select Move for Slot #{activeSelectMoveSlot + 1}
                                    </h4>
                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        setActiveSelectMoveSlot(null);
                                        setMoveGroupSearchQuery('');
                                      }}
                                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                                    >
                                      Close Panel
                                    </button>
                                  </div>
                                  
                                  {/* Filter Input with magnifying glass icon */}
                                  <div style={{ position: 'relative', marginBottom: '1rem' }}>
                                    <i className="fa-solid fa-magnifying-glass" style={{
                                      position: 'absolute',
                                      left: '12px',
                                      top: '50%',
                                      transform: 'translateY(-50%)',
                                      color: 'var(--text-secondary)',
                                      fontSize: '0.85rem',
                                      pointerEvents: 'none'
                                    }}></i>
                                    <input 
                                      type="text" 
                                      placeholder="Search learnable moves..."
                                      className="build-input"
                                      value={moveGroupSearchQuery}
                                      onChange={(e) => setMoveGroupSearchQuery(e.target.value)}
                                      style={{ padding: '0.5rem 0.8rem 0.5rem 2.2rem', fontSize: '0.85rem', width: '100%' }}
                                    />
                                  </div>

                                  {(() => {
                                    // Deduplicate learnable moves
                                    const uniqueLearnableMoves = [];
                                    if (pokeApiDetail && pokeApiDetail.moves) {
                                      const seen = new Set();
                                      pokeApiDetail.moves.forEach(m => {
                                        const name = m.move.name.replaceAll('-', ' ');
                                        if (!seen.has(name)) {
                                          seen.add(name);
                                          uniqueLearnableMoves.push(name);
                                        }
                                      });
                                    }
                                    
                                    // Group moves by type
                                    const groupedMoves = {};
                                    uniqueLearnableMoves.forEach(move => {
                                      const type = MOVE_TYPES[move.toLowerCase()] || customMoveTypes[move.toLowerCase()] || 'normal';
                                      if (!groupedMoves[type]) {
                                        groupedMoves[type] = [];
                                      }
                                      groupedMoves[type].push(move);
                                    });

                                    const sortedTypes = Object.keys(groupedMoves).sort();
                                    let hasResults = false;

                                    const typeSections = sortedTypes.map(type => {
                                      // Do not filter out the current move of the active slot, so the user can see it highlighted,
                                      // but filter out moves that are selected in OTHER slots.
                                      const filteredMoves = groupedMoves[type].filter(m => {
                                        const isMatch = !moveGroupSearchQuery || m.toLowerCase().includes(moveGroupSearchQuery.toLowerCase());
                                        const isSelectedElsewhere = localBuild.moves.some((selectedMove, idx) => 
                                          idx !== activeSelectMoveSlot && selectedMove.toLowerCase() === m.toLowerCase()
                                        );
                                        return isMatch && !isSelectedElsewhere;
                                      });
                                      
                                      if (filteredMoves.length === 0) return null;
                                      hasResults = true;
                                      
                                      const typeColor = TYPE_TRANSLATIONS[type]?.color || '#999';
                                      const typeName = TYPE_TRANSLATIONS[type]?.name || type;

                                      return (
                                        <div key={type} style={{ marginBottom: '1.2rem' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem', marginTop: '0.6rem' }}>
                                            <span style={{
                                              display: 'inline-block',
                                              padding: '0.2rem 0.6rem',
                                              borderRadius: '6px',
                                              backgroundColor: typeColor,
                                              color: '#fff',
                                              fontSize: '0.65rem',
                                              fontWeight: 800,
                                              textTransform: 'uppercase',
                                              letterSpacing: '0.05em',
                                              boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                                            }}>
                                              {typeName}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                              {filteredMoves.length} {filteredMoves.length === 1 ? 'move' : 'moves'}
                                            </span>
                                          </div>
                                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                                            {filteredMoves.sort().map(move => {
                                              const isCurrentMoveOfSlot = move.toLowerCase() === (localBuild.moves[activeSelectMoveSlot] || '').toLowerCase();
                                              const moveDesc = getMoveDesc(move);
                                              return (
                                                <button
                                                  key={move}
                                                  type="button"
                                                  onClick={() => {
                                                    const newMoves = [...localBuild.moves];
                                                    newMoves[activeSelectMoveSlot] = move;
                                                    setLocalBuild({ ...localBuild, moves: newMoves });
                                                    
                                                    const newQueries = [...moveSearchQuery];
                                                    newQueries[activeSelectMoveSlot] = move;
                                                    setMoveSearchQuery(newQueries);
                                                    
                                                    setActiveSelectMoveSlot(null);
                                                    setMoveGroupSearchQuery('');
                                                  }}
                                                  style={{
                                                    '--type-color': typeColor,
                                                    '--type-color-bg': isCurrentMoveOfSlot ? typeColor : `${typeColor}08`,
                                                    '--type-color-hover': isCurrentMoveOfSlot ? typeColor : `${typeColor}20`,
                                                    padding: '0.6rem 0.8rem',
                                                    borderRadius: '8px',
                                                    border: isCurrentMoveOfSlot ? `1px solid ${typeColor}` : `1px solid ${typeColor}30`,
                                                    background: isCurrentMoveOfSlot ? typeColor : `${typeColor}08`,
                                                    color: isCurrentMoveOfSlot ? '#ffffff' : 'var(--text-primary)',
                                                    fontSize: '0.82rem',
                                                    fontWeight: 700,
                                                    textTransform: 'capitalize',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start',
                                                    textAlign: 'left',
                                                    width: '100%',
                                                    gap: '0.15rem',
                                                    transition: 'all 0.15s'
                                                  }}
                                                  className={`move-option-button ${isCurrentMoveOfSlot ? 'active' : ''}`}
                                                >
                                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', width: '100%' }}>
                                                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isCurrentMoveOfSlot ? '#ffffff' : typeColor }}></span>
                                                    {move}
                                                    {isCurrentMoveOfSlot && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.15rem' }}><i className="fa-solid fa-check"></i> Selected</span>}
                                                  </span>
                                                  <span style={{ 
                                                    fontSize: '0.68rem', 
                                                    fontWeight: 500, 
                                                    color: isCurrentMoveOfSlot ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)',
                                                    fontStyle: 'italic',
                                                    lineHeight: '1.25'
                                                  }}>
                                                    {moveDesc}
                                                  </span>
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    });

                                    return hasResults ? typeSections : (
                                      <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        No matching moves found.
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Column: Stats & EVs */}
                          <div>
                            <div className="build-section-title">
                              <span>Stats & EVs Allocation</span>
                            </div>

                            {/* Nature Dropdown */}
                            <div className="build-field">
                              <label>Nature</label>
                              <select 
                                className="build-select"
                                value={localBuild.nature}
                                onChange={(e) => setLocalBuild({ ...localBuild, nature: e.target.value })}
                              >
                                {NATURES.map(n => {
                                  let modText = 'Neutral';
                                  if (n.increased) {
                                    const inc = STAT_DISPLAY_NAMES[n.increased];
                                    const dec = STAT_DISPLAY_NAMES[n.decreased];
                                    modText = `+${inc}, -${dec}`;
                                  }
                                  return (
                                    <option key={n.name} value={n.name}>
                                      {n.name} ({modText})
                                    </option>
                                  );
                                })}
                              </select>
                            </div>

                            {/* EV sliders and calculated stats */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                              {activeEditBuild.pokemon.stats.map(s => {
                                const statKey = s.name;
                                const baseVal = s.value;
                                const currentEv = localBuild.evs[statKey] || 0;

                                const otherEvSum = Object.keys(localBuild.evs)
                                  .filter(k => k !== statKey)
                                  .reduce((sum, k) => sum + (localBuild.evs[k] || 0), 0);

                                const handleEvUpdate = (val) => {
                                  let numericVal = parseInt(val) || 0;
                                  numericVal = Math.max(0, Math.min(252, numericVal));
                                  numericVal = Math.min(numericVal, 508 - otherEvSum);
                                  
                                  const updatedEvs = { ...localBuild.evs, [statKey]: numericVal };
                                  setLocalBuild({ ...localBuild, evs: updatedEvs });
                                };

                                const calculatedValue = calculateLevel50Stat(statKey, baseVal, currentEv, localBuild.nature, activeEditBuild.pokemon.name);

                                const nature = NATURES.find(n => n.name.toLowerCase() === localBuild.nature.toLowerCase());
                                let natureImpactStyle = { color: 'var(--text-primary)' };
                                let natureSymbol = '';
                                if (nature && statKey !== 'hp') {
                                  if (nature.increased === statKey) {
                                    natureImpactStyle = { color: '#10b981', fontWeight: 800 };
                                    natureSymbol = ' ▲';
                                  } else if (nature.decreased === statKey) {
                                    natureImpactStyle = { color: '#ef4444', fontWeight: 800 };
                                    natureSymbol = ' ▼';
                                  }
                                }

                                return (
                                  <div key={statKey} className="ev-row-container">
                                    <div className="ev-stat-label-row">
                                      <span className="ev-stat-name">{STAT_DISPLAY_NAMES[statKey] || statKey}</span>
                                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Base: {baseVal}</span>
                                      <span style={natureImpactStyle} className="calculated-stat-value">
                                        {calculatedValue}
                                        {natureSymbol}
                                      </span>
                                    </div>
                                    <div className="ev-control-group">
                                      <input 
                                        type="range"
                                        min="0"
                                        max="252"
                                        step="4"
                                        className="ev-slider"
                                        value={currentEv}
                                        onChange={(e) => handleEvUpdate(e.target.value)}
                                      />
                                      <input 
                                        type="number"
                                        min="0"
                                        max="252"
                                        step="4"
                                        className="ev-numeric-input"
                                        value={currentEv}
                                        onChange={(e) => handleEvUpdate(e.target.value)}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* EV Summary Progress Box */}
                            {(() => {
                              const totalEvs = Object.values(localBuild.evs).reduce((a, b) => a + b, 0);
                              const progressPct = (totalEvs / 508) * 100;
                              return (
                                <div className="ev-summary-box">
                                  <div className="ev-summary-header">
                                    <span>Total EVs Used</span>
                                    <span style={{ color: totalEvs === 508 ? '#10b981' : 'var(--text-primary)', fontWeight: 800 }}>
                                      {totalEvs} / 508
                                    </span>
                                  </div>
                                  <div className="ev-summary-bar-bg">
                                    <div 
                                      className="ev-summary-bar-fill" 
                                      style={{ 
                                        width: `${progressPct}%`,
                                        backgroundColor: totalEvs === 508 ? '#10b981' : 'rgba(var(--header-theme-rgb, 184, 35, 28), 1)'
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                        </div>
                      </div>

                      {/* Footer buttons */}
                      <div className="build-modal-footer">
                        <button 
                          className="build-btn build-btn-cancel" 
                          onClick={() => setActiveEditBuild(null)}
                        >
                          Cancel
                        </button>
                        <button 
                          className="build-btn build-btn-save"
                          onClick={() => {
                            const trainerId = trainer.id || trainer._id;
                            const buildKey = `${activeEditBuild.teamIdx}_${activeEditBuild.slotIdx}`;
                            const updatedBuilds = { ...builds, [buildKey]: localBuild };
                            setBuilds(updatedBuilds);
                            if (typeof window !== 'undefined' && trainerId) {
                              localStorage.setItem(`trainer_builds_${trainerId}`, JSON.stringify(updatedBuilds));
                            }
                            setAiReport(null);
                            setActiveEditBuild(null);
                          }}
                        >
                          Save Build
                        </button>
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
                          {(() => {
                            const itemCounts = {};
                            teams[activeTeamIdx].forEach((pokemonId, slotIdx) => {
                              if (pokemonId) {
                                const buildKey = `${activeTeamIdx}_${slotIdx}`;
                                const build = builds[buildKey];
                                if (build && build.heldItem && build.heldItem !== 'None') {
                                  const item = build.heldItem;
                                  itemCounts[item] = (itemCounts[item] || 0) + 1;
                                }
                              }
                            });
                            const duplicateItems = Object.keys(itemCounts).filter(item => itemCounts[item] > 1);
                            const hasConsOrWarnings = activeTeamSynergy.cons.length > 0 || activeTeamSynergy.warnings.length > 0 || duplicateItems.length > 0;
                            
                            if (!hasConsOrWarnings) {
                              return <p style={{ fontSize: '0.75rem', color: '#92400e' }}>No structural flaws detected in core types.</p>;
                            }

                            return (
                              <ul>
                                {duplicateItems.map((item, idx) => (
                                  <li key={`dup-${idx}`} style={{ color: '#be185d', fontWeight: 700, listStyleType: 'square' }}>
                                    <i className="fa-solid fa-ban" style={{ marginRight: '0.2rem' }}></i>
                                    Item Clause Violation: Đội hình sử dụng nhiều vật phẩm "{item}". Mỗi Pokémon bắt buộc phải mang một Held Item khác nhau theo luật thi đấu VGC!
                                  </li>
                                ))}
                                {activeTeamSynergy.cons.map((c, i) => <li key={`con-${i}`}>{c}</li>)}
                                {activeTeamSynergy.warnings.map((w, i) => <li key={`warn-${i}`} style={{ color: '#be185d', fontWeight: 600 }}>{w.message}</li>)}
                              </ul>
                            );
                          })()}
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
                              
                              const WEAKNESS_COUNTER_SUGGESTIONS = {
                                fire: { resists: ['Water', 'Dragon', 'Fire', 'Rock'], counters: ['Water', 'Ground', 'Rock'] },
                                water: { resists: ['Water', 'Grass', 'Dragon'], counters: ['Electric', 'Grass'] },
                                grass: { resists: ['Fire', 'Grass', 'Poison', 'Flying', 'Dragon', 'Steel', 'Bug'], counters: ['Fire', 'Flying', 'Ice', 'Poison', 'Bug'] },
                                electric: { resists: ['Electric', 'Grass', 'Dragon', 'Ground (Immune)'], counters: ['Ground'] },
                                normal: { resists: ['Rock', 'Steel', 'Ghost (Immune)'], counters: ['Fighting'] },
                                ice: { resists: ['Fire', 'Water', 'Ice', 'Steel'], counters: ['Fire', 'Fighting', 'Rock', 'Steel'] },
                                fighting: { resists: ['Poison', 'Flying', 'Psychic', 'Bug', 'Fairy', 'Ghost (Immune)'], counters: ['Flying', 'Psychic', 'Fairy'] },
                                poison: { resists: ['Poison', 'Ground', 'Rock', 'Ghost', 'Steel (Immune)'], counters: ['Ground', 'Psychic'] },
                                ground: { resists: ['Grass', 'Bug', 'Flying (Immune)'], counters: ['Water', 'Grass', 'Ice'] },
                                flying: { resists: ['Electric', 'Rock', 'Steel'], counters: ['Electric', 'Rock', 'Ice'] },
                                psychic: { resists: ['Psychic', 'Steel', 'Dark (Immune)'], counters: ['Bug', 'Ghost', 'Dark'] },
                                bug: { resists: ['Fire', 'Fighting', 'Poison', 'Flying', 'Ghost', 'Steel', 'Fairy'], counters: ['Fire', 'Flying', 'Rock'] },
                                rock: { resists: ['Fighting', 'Ground', 'Steel'], counters: ['Water', 'Grass', 'Fighting', 'Ground', 'Steel'] },
                                ghost: { resists: ['Dark', 'Normal (Immune)'], counters: ['Ghost', 'Dark'] },
                                dragon: { resists: ['Steel', 'Fairy (Immune)'], counters: ['Ice', 'Dragon', 'Fairy'] },
                                steel: { resists: ['Fire', 'Water', 'Electric', 'Steel'], counters: ['Fire', 'Fighting', 'Ground'] },
                                fairy: { resists: ['Fire', 'Poison', 'Steel'], counters: ['Poison', 'Steel'] },
                                dark: { resists: ['Fighting', 'Dark', 'Fairy'], counters: ['Fighting', 'Bug', 'Fairy'] }
                              };

                              activeTeamSynergy.warnings.forEach(w => {
                                if (w.isQuad) {
                                  const suggestions = WEAKNESS_COUNTER_SUGGESTIONS[w.type.toLowerCase()];
                                  if (suggestions) {
                                    recs.push(`Protect from double-weakness: Cover ${w.message.split('is double-weak')[0].replace('Extreme Weakness:', '').trim()}'s 4x weakness by switching in a ${suggestions.resists.join('/')} type, or knock out threat Pokémon with ${suggestions.counters.join('/')} moves.`);
                                  } else {
                                    recs.push(`Protect from double-weakness: Cover 4x weakness to ${w.type.toUpperCase()}.`);
                                  }
                                } else {
                                  const suggestions = WEAKNESS_COUNTER_SUGGESTIONS[w.type.toLowerCase()];
                                  if (suggestions) {
                                    recs.push(`To counter your shared ${w.type.toUpperCase()} weakness (${w.count} members weak), consider adding a ${suggestions.resists.join('/')} Pokémon for switch-ins, or carry ${suggestions.counters.join('/')} coverage moves.`);
                                  } else {
                                    recs.push(`Address shared weakness to ${w.type.toUpperCase()} (consider adding resistances or immunities).`);
                                  }
                                }
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
                          background: 'rgba(255,255,255,0.85)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '20px',
                          padding: '2rem',
                          boxShadow: '0 8px 30px rgba(99, 144, 240, 0.08)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          {/* Top Highlight strip */}
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '5px',
                            background: 'linear-gradient(to right, #6390f0, #8b5cf6, #ec4899)'
                          }}></div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <i className="fa-solid fa-brain" style={{ color: '#6390f0' }}></i> AI Strategic Coaching Board
                            </h4>
                            <button 
                              onClick={handleRunAiAnalysis}
                              className="build-suggest-btn"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                background: 'rgba(99,144,240,0.06)',
                                border: '1px solid rgba(99,144,240,0.15)',
                                color: '#2563eb',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              <i className="fa-solid fa-arrows-rotate"></i> Re-Analyze Team
                            </button>
                          </div>

                          {/* 1. Team Metrics & Archetype */}
                          <div className="coach-metrics-grid">
                            <div className="coach-metric-card">
                              <div className="coach-metric-icon coach-metric-icon--synergy">
                                <i className="fa-solid fa-bolt"></i>
                              </div>
                              <div>
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Synergy Score</span>
                                <strong style={{ fontSize: '1.1rem', color: aiReport.synergyScore >= 80 ? '#10b981' : (aiReport.synergyScore >= 50 ? '#f59e0b' : '#ef4444') }}>
                                  {aiReport.synergyScore}/100
                                </strong>
                              </div>
                            </div>
                            
                            <div className="coach-metric-card">
                              <div className="coach-metric-icon coach-metric-icon--speed">
                                <i className="fa-solid fa-gauge-high"></i>
                              </div>
                              <div>
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Avg Speed & Tier</span>
                                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginTop: '0.1rem' }}>
                                  {aiReport.avgSpeed} Spe ({aiReport.speedTier})
                                </strong>
                              </div>
                            </div>

                            <div className="coach-metric-card">
                              <div className="coach-metric-icon coach-metric-icon--bulk">
                                <i className="fa-solid fa-shield-halved"></i>
                              </div>
                              <div>
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Team Bulk Profile</span>
                                <strong style={{ fontSize: '0.75rem', color: 'var(--text-primary)', display: 'block', marginTop: '0.15rem' }}>
                                  Phys: {aiReport.avgPhysicalBulk} | Spec: {aiReport.avgSpecialBulk}
                                </strong>
                              </div>
                            </div>
                          </div>

                          <div style={{ background: 'rgba(99, 144, 240, 0.03)', border: '1px solid rgba(99, 144, 240, 0.1)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                            <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 800, display: 'inline-block', padding: '0.15rem 0.4rem', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '4px', marginBottom: '0.4rem' }}>
                              ARCHETYPE: {aiReport.archetype.toUpperCase()}
                            </span>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                              This custom layout functions as a <strong>{aiReport.archetype}</strong> core. It relies on coordinates of speed control, defensive pivots, and carrying elements to establish VGC board control.
                            </p>
                          </div>

                          {/* 2. Defensive Synergy Matrix */}
                          <div className="matrix-container">
                            <h5 style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <i className="fa-solid fa-table-cells" style={{ color: '#10b981' }}></i> Defensive Synergy Matrix
                            </h5>
                            <p style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              Analysis of incoming type multipliers against your team members. Highlighted red cells indicate <strong style={{ color: '#ef4444' }}>Hazard Zones</strong> where 3+ members are weak without adequate resistances.
                            </p>
                            
                            <div className="matrix-grid">
                              {aiReport.matrix.map((item) => (
                                <div 
                                  key={item.type} 
                                  className={`matrix-cell ${item.isHazard ? 'matrix-cell--hazard' : ''}`}
                                  title={`${item.weakCount} Weak, ${item.resistCount} Resist, ${item.immuneCount} Immune`}
                                >
                                  <span 
                                    className="matrix-type-badge" 
                                    style={{ backgroundColor: TYPE_TRANSLATIONS[item.type]?.color || '#999' }}
                                  >
                                    {TYPE_TRANSLATIONS[item.type]?.name || item.type}
                                  </span>
                                  <div className="matrix-score-row">
                                    {item.immuneCount > 0 && (
                                      <span className="matrix-score-badge matrix-score-badge--immune" title="Immune members">
                                        {item.immuneCount}x
                                      </span>
                                    )}
                                    {item.weakCount > 0 && (
                                      <span className={`matrix-score-badge ${item.isHazard ? 'matrix-score-badge--doubleweak' : 'matrix-score-badge--weak'}`} title="Weak members">
                                        -{item.weakCount}
                                      </span>
                                    )}
                                    {item.resistCount > 0 && (
                                      <span className="matrix-score-badge matrix-score-badge--resist" title="Resistant members">
                                        +{item.resistCount}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {aiReport.hazards.length > 0 && (
                              <div style={{ marginTop: '0.8rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px', padding: '0.6rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ef4444', fontSize: '0.85rem' }}></i>
                                <span style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 600 }}>
                                  Critical Weakness Warning: Your team shares a shared weakness to <strong>{aiReport.hazards.join(', ')}</strong>. Guard these members using Protect or immunities.
                                </span>
                              </div>
                            )}
                          </div>

                          {/* 3. Double Carry Spotlight */}
                          <div className="ace-spotlight-grid">
                            <div className="ace-card ace-card--physical">
                              <div className="ace-img-wrapper">
                                <img src={aiReport.physicalAce.image} alt={aiReport.physicalAce.name} style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <span className="ace-tag ace-tag--physical">Physical Carry / Ace</span>
                                <h6 style={{ margin: '0 0 0.2rem 0', fontSize: '0.9rem', fontWeight: 800, textTransform: 'capitalize', color: 'var(--text-primary)' }}>
                                  {formatPokemonName(aiReport.physicalAce.name)}
                                </h6>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                  <strong>ATK: {aiReport.physicalAce.stats.attack}</strong>. {aiReport.physicalAceAdvice}
                                </p>
                              </div>
                            </div>

                            <div className="ace-card ace-card--special">
                              <div className="ace-img-wrapper">
                                <img src={aiReport.specialAce.image} alt={aiReport.specialAce.name} style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <span className="ace-tag ace-tag--special">Special Carry / Ace</span>
                                <h6 style={{ margin: '0 0 0.2rem 0', fontSize: '0.9rem', fontWeight: 800, textTransform: 'capitalize', color: 'var(--text-primary)' }}>
                                  {formatPokemonName(aiReport.specialAce.name)}
                                </h6>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                  <strong>SPA: {aiReport.specialAce.stats['special-attack']}</strong>. {aiReport.specialAceAdvice}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* 4. Strategic Playbook & VGC Leads */}
                          <div className="playbook-card">
                            <h5 style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <i className="fa-solid fa-route" style={{ color: '#6390f0' }}></i> Tactical VGC Deployment Playbook
                            </h5>
                            <p style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              Optimized starting pairs (Leads) and pivot operations built around your builds and typing synergies.
                            </p>

                            <div className="playbook-leads-grid">
                              {aiReport.leads.map((lead, idx) => (
                                <div key={idx} className="playbook-lead-item">
                                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase' }}>
                                    {lead.title}
                                  </span>
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {lead.p1 && (
                                      <div className="playbook-pokemon-mini">
                                        <img src={lead.p1.image} alt="" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                                        <span>{formatPokemonName(lead.p1.name)}</span>
                                      </div>
                                    )}
                                    {lead.p2 && (
                                      <div className="playbook-pokemon-mini">
                                        <img src={lead.p2.image} alt="" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                                        <span>{formatPokemonName(lead.p2.name)}</span>
                                      </div>
                                    )}
                                  </div>
                                  <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                    {lead.desc}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {/* Pivots Flow section */}
                            <div className="playbook-pivot-flow">
                              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <i className="fa-solid fa-arrows-spin"></i> SWITCHING & PIVOTING SCHEMES (Cách luân chuyển)
                              </span>
                              {aiReport.pivots.map((pivot, idx) => (
                                <div key={idx} className="playbook-pivot-step">
                                  <span className="playbook-pivot-arrow"><i className="fa-solid fa-arrow-right-arrow-left"></i></span>
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{pivot}</span>
                                </div>
                              ))}
                            </div>

                            {/* Matchups guides */}
                            <div style={{ marginTop: '1.2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                              <div>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: '0.3rem' }}>VS. TAILWIND (Đấu Tốc độ)</span>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{aiReport.playbook.vsTailwind}</p>
                              </div>
                              <div>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: '0.3rem' }}>VS. TRICK ROOM (Đấu Không Gian)</span>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{aiReport.playbook.vsTrickRoom}</p>
                              </div>
                              <div>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: '0.3rem' }}>VS. WEATHER CORES (Đấu Thời Tiết)</span>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{aiReport.playbook.vsWeather}</p>
                              </div>
                            </div>
                          </div>

                          {/* 5. Individual Deep Dive Panel */}
                          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem' }}>
                            <h5 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <i className="fa-solid fa-address-card" style={{ color: 'var(--primary-color)' }}></i> Member Custom Builds & Stats Breakdown
                            </h5>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.2rem' }}>
                              {aiReport.members.map((member) => {
                                const totalStatVal = Object.values(member.stats).reduce((a, b) => a + b, 0);
                                const hasEvsSet = Object.values(member.evs).some(v => v > 0);
                                
                                // Format EV string for display
                                const evLabelArray = [];
                                if (member.evs.hp) evLabelArray.push(`${member.evs.hp} HP`);
                                if (member.evs.attack) evLabelArray.push(`${member.evs.attack} Atk`);
                                if (member.evs.defense) evLabelArray.push(`${member.evs.defense} Def`);
                                if (member.evs['special-attack']) evLabelArray.push(`${member.evs['special-attack']} SpA`);
                                if (member.evs['special-defense']) evLabelArray.push(`${member.evs['special-defense']} SpD`);
                                if (member.evs.speed) evLabelArray.push(`${member.evs.speed} Spe`);
                                const evDisplayString = evLabelArray.length > 0 ? evLabelArray.join(' / ') : '0 EVs';

                                return (
                                  <div key={member.id} className="member-card-wrapper" style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', boxShadow: '0 2px 10px rgba(0,0,0,0.015)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                      <div style={{ background: '#f1f5f9', borderRadius: '50%', width: '54px', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                                        <img src={member.image} alt={member.name} style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
                                      </div>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <h6 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, textTransform: 'capitalize', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                          {formatPokemonName(member.name)}
                                          {member.id === aiReport.physicalAce.id && (
                                            <span className="ace-tag ace-tag--physical" style={{ fontSize: '0.55rem', padding: '0.05rem 0.25rem', marginBottom: 0 }}>Phys Ace</span>
                                          )}
                                          {member.id === aiReport.specialAce.id && (
                                            <span className="ace-tag ace-tag--special" style={{ fontSize: '0.55rem', padding: '0.05rem 0.25rem', marginBottom: 0 }}>Spec Ace</span>
                                          )}
                                        </h6>
                                        <div style={{ display: 'flex', gap: '0.2rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                                          {member.types.map(t => (
                                            <span key={t} style={{ fontSize: '0.62rem', backgroundColor: TYPE_TRANSLATIONS[t]?.color || '#999', color: '#ffffff', padding: '0.05rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>
                                              {TYPE_TRANSLATIONS[t]?.name || t}
                                            </span>
                                          ))}
                                          {hasEvsSet && (
                                            <span className="member-ev-badge">CUSTOM EVs</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: '#f8fafc', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.02)', lineHeight: '1.4' }}>
                                      <strong>VGC Role:</strong> {member.roleDesc}
                                    </div>

                                    {/* Build details */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', fontSize: '0.72rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.8rem' }}>
                                      <div>
                                        <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.65rem' }}>ABILITY:</span>
                                        <strong style={{ display: 'block', textTransform: 'capitalize', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                          {member.ability.replaceAll('-', ' ')}
                                        </strong>
                                      </div>
                                      <div>
                                        <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.65rem' }}>HELD ITEM:</span>
                                        <strong style={{ display: 'block', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.2rem', flexWrap: 'wrap' }}>
                                          {member.heldItem !== 'None' && member.heldItem.split('/').map((part, pIdx) => {
                                            const trimmed = part.trim();
                                            const imgUrl = getItemImageUrl(trimmed);
                                            return (
                                              <span key={pIdx} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.1rem' }}>
                                                {imgUrl && (
                                                  <img src={imgUrl} alt="" style={{ width: '12px', height: '12px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                                                )}
                                                {trimmed}
                                                {pIdx < member.heldItem.split('/').length - 1 && ' / '}
                                              </span>
                                            );
                                          })}
                                        </strong>
                                        {member.heldItem !== 'None' && (
                                          <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.62rem', fontStyle: 'italic', marginTop: '0.1rem', lineHeight: '1.25' }}>
                                            {member.heldItem.split('/').map(part => {
                                              const trimmed = part.trim();
                                              return `${trimmed}: ${getItemDesc(trimmed)}`;
                                            }).join(' | ')}
                                          </span>
                                        )}
                                      </div>
                                      <div>
                                        <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.65rem' }}>NATURE:</span>
                                        <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{member.nature}</strong>
                                      </div>
                                      <div>
                                        <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.65rem' }}>EV SPREAD:</span>
                                        <strong style={{ display: 'block', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={evDisplayString}>
                                          {evDisplayString}
                                        </strong>
                                      </div>
                                      <div style={{ gridColumn: 'span 2', borderTop: '1px dashed #f1f5f9', paddingTop: '0.5rem', marginTop: '0.2rem' }}>
                                        <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.65rem', marginBottom: '0.3rem' }}>ACTIVE MOVES & DESCRIPTIONS:</span>
                                        {member.selectedMoves.length > 0 ? (
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            {member.selectedMoves.map(mv => {
                                              const normalizedMoveName = mv ? mv.toLowerCase() : '';
                                              const moveType = MOVE_TYPES[normalizedMoveName] || customMoveTypes[normalizedMoveName] || 'normal';
                                              const typeColor = TYPE_TRANSLATIONS[moveType]?.color || '#999';
                                              return (
                                                <div key={mv} style={{ fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '0.05rem' }}>
                                                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: typeColor }}></span>
                                                    {mv}
                                                  </span>
                                                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', fontStyle: 'italic', paddingLeft: '0.6rem', lineHeight: '1.25' }}>
                                                    {getMoveDesc(mv)}
                                                  </span>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        ) : (
                                          <strong style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.72rem' }}>None configured</strong>
                                        )}
                                      </div>
                                    </div>

                                    {/* Coach's Optimization Box for each member */}
                                    {member.coachTips.length > 0 && (
                                      <div className="coach-opt-box">
                                        <div className="coach-opt-title">
                                          <i className="fa-solid fa-circle-info"></i> Coach's Optimization Tips
                                        </div>
                                        {member.coachTips.map((tip, idx) => (
                                          <div key={idx} className="coach-opt-item">
                                            {tip}
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Stats Bars - showing Calculated stats at Level 50 */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.2rem' }}>
                                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', letterSpacing: '0.5px' }}>CALCULATED VGC STATS (LV 50):</span>
                                      {Object.entries(member.stats).map(([statName, statVal]) => {
                                        const label = statName === 'special-attack' ? 'SPA' : (statName === 'special-defense' ? 'SPD' : (statName === 'attack' ? 'ATK' : (statName === 'defense' ? 'DEF' : statName.toUpperCase())));
                                        const color = statName === 'hp' ? '#10b981' : 
                                                      statName === 'attack' ? '#f59e0b' : 
                                                      statName === 'defense' ? '#f97316' : 
                                                      statName === 'special-attack' ? '#8b5cf6' : 
                                                      statName === 'special-defense' ? '#3b82f6' : 
                                                      '#ec4899';
                                        
                                        const pct = Math.min((statVal / 250) * 100, 100);
                                        return (
                                          <div key={statName} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem' }}>
                                            <span style={{ width: '28px', color: 'var(--text-secondary)', fontWeight: 700 }}>{label}</span>
                                            <span style={{ width: '22px', textAlign: 'right', fontWeight: 800, color: 'var(--text-primary)' }}>{statVal}</span>
                                            <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                              <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px' }}></div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '0.2rem', borderTop: '1px dashed #f1f5f9', paddingTop: '0.3rem' }}>
                                        <span>STAT TOTAL</span>
                                        <span style={{ color: 'var(--primary-color)', fontWeight: 800 }}>{totalStatVal}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
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

                  {suggestionResults.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
                      {suggestionResults.map((team, idx) => {
                        const isActive = idx === safeTabIdx;
                        
                        let badgeText = "";
                        if (suggestScope === 'all') {
                          // Display unowned count range filter feedback: e.g. "1 Unowned"
                          badgeText = team.unownedCount === 0 ? "Fully Owned" : `${team.unownedCount} Unowned`;
                        } else {
                          badgeText = `Owned`;
                        }

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveSuggestTabIdx(idx)}
                            style={{
                              padding: '0.5rem 1rem',
                              borderRadius: '10px',
                              border: isActive ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                              background: isActive ? 'var(--primary-light)' : '#ffffff',
                              color: isActive ? 'var(--primary-color)' : 'var(--text-primary)',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                            }}
                          >
                            <span>Đội {idx + 1}: {team.teamName.replace("Worlds 2024 Champion Team", "Worlds 24").replace("Worlds 2023 Champion Team", "Worlds 23")}</span>
                            <span style={{
                              fontSize: '0.65rem',
                              background: isActive ? 'var(--primary-color)' : '#f1f5f9',
                              color: isActive ? '#ffffff' : '#64748b',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '8px',
                              fontWeight: 800
                            }}>
                              {badgeText}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {suggestedTeam.length > 0 && (
                    <div className="collection-table-card" style={{ marginBottom: '1.5rem', padding: '1.2rem', borderLeft: '5px solid var(--primary-color)' }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                        {suggestionResult.teamName}
                      </h4>
                      <p style={{ margin: '0.4rem 0 0.6rem 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        {suggestionResult.description}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 700 }}>
                          <i className="fa-solid fa-square-rss" style={{ marginRight: '0.3rem' }}></i>Source: {suggestionResult.source}
                        </span>
                        <button
                          type="button"
                          onClick={handleDeploySuggestedTeam}
                          style={{
                            padding: '0.4rem 1rem',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            borderRadius: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            cursor: 'pointer',
                            background: 'var(--primary-color)',
                            color: '#ffffff',
                            border: 'none',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
                          }}
                        >
                          <i className="fa-solid fa-cloud-arrow-down"></i> Deploy Entire Team (Lắp nhanh cả đội)
                        </button>
                      </div>
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
                              cursor: 'pointer'
                            }}
                            onClick={async () => {
                              if (p.isOwned) {
                                const emptyIdx = teams[activeTeamIdx].findIndex(id => id === null);
                                if (emptyIdx !== -1) {
                                  const newTeams = [...teams];
                                  newTeams[activeTeamIdx][emptyIdx] = p.id;
                                  handleSaveTeams(newTeams);
                                  
                                  // Initialize default build
                                  const key = `${activeTeamIdx}_${emptyIdx}`;
                                  if (!builds[key]) {
                                    const pDetails = allPokemon.find(item => item.id === p.id);
                                    if (pDetails) {
                                      const defaultBuild = {
                                        ability: pDetails.abilities?.[0] || '',
                                        heldItem: getSuggestedItem ? getSuggestedItem(pDetails) : '',
                                        nature: getSuggestedNature ? getSuggestedNature(pDetails) : 'Serious',
                                        evs: getSuggestedEvSpread && parseEvSpreadString ? parseEvSpreadString(getSuggestedEvSpread(pDetails)) : { hp: 0, attack: 0, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 0 },
                                        moves: ['', '', '', '']
                                      };
                                      const updatedBuilds = { ...builds, [key]: defaultBuild };
                                      setBuilds(updatedBuilds);
                                      const trainerId = trainer.id || trainer._id;
                                      if (typeof window !== 'undefined' && trainerId) {
                                        localStorage.setItem(`trainer_builds_${trainerId}`, JSON.stringify(updatedBuilds));
                                      }
                                    }
                                  }
                                } else {
                                  alert("Active team is full! Remove a member first.");
                                }
                              } else {
                                if (window.confirm(`This Pokémon is not in your collection yet. Add it and put it in your team?`)) {
                                  try {
                                    const res = await fetch('/api/trainer/pokemon', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ pokemonId: p.id, action: 'add' }),
                                    });
                                    const data = await res.json();
                                    if (!res.ok) throw new Error(data.error);
                                    setTrainer(data.trainer);
                                    
                                    // Add to team slot
                                    const emptyIdx = teams[activeTeamIdx].findIndex(id => id === null);
                                    if (emptyIdx !== -1) {
                                      const newTeams = [...teams];
                                      newTeams[activeTeamIdx][emptyIdx] = p.id;
                                      handleSaveTeams(newTeams);

                                      // Initialize default build
                                      const key = `${activeTeamIdx}_${emptyIdx}`;
                                      const pDetails = allPokemon.find(item => item.id === p.id);
                                      if (pDetails) {
                                        const defaultBuild = {
                                          ability: pDetails.abilities?.[0] || '',
                                          heldItem: getSuggestedItem ? getSuggestedItem(pDetails) : '',
                                          nature: getSuggestedNature ? getSuggestedNature(pDetails) : 'Serious',
                                          evs: getSuggestedEvSpread && parseEvSpreadString ? parseEvSpreadString(getSuggestedEvSpread(pDetails)) : { hp: 0, attack: 0, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 0 },
                                          moves: ['', '', '', '']
                                        };
                                        const updatedBuilds = { ...builds, [key]: defaultBuild };
                                        setBuilds(updatedBuilds);
                                        const trainerId = data.trainer.id || data.trainer._id;
                                        if (typeof window !== 'undefined' && trainerId) {
                                          localStorage.setItem(`trainer_builds_${trainerId}`, JSON.stringify(updatedBuilds));
                                        }
                                      }
                                    } else {
                                      alert("Active team is full! Remove a member first.");
                                    }
                                  } catch (err) {
                                    alert("Failed to add Pokémon: " + err.message);
                                  }
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

                  {suggestedTeam.length > 0 && (
                    <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '14px', border: '1px dashed #cbd5e1', boxShadow: '0 4px 15px rgba(0,0,0,0.015)' }}>
                      <h4 style={{ fontSize: '1.05rem', color: 'var(--primary-color)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.8rem' }}>
                        <i className="fa-solid fa-gamepad"></i> Hướng Dẫn Vận Hành & Chiến Thuật Đội Hình Chi Tiết
                      </h4>
                      
                      <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.65', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>Cách Vận Hành Tổng Quan:</strong>
                          <p style={{ margin: 0 }}>{suggestionResult.operation}</p>
                        </div>

                        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '1rem' }}>
                          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.6rem' }}>Chi Tiết Hướng Build Từng Thành Viên:</strong>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.8rem' }}>
                            {suggestedTeam.map((member, mIdx) => {
                              const suggestedItem = getSuggestedItem(member);
                              const suggestedAbility = member.abilities?.[0] || 'Unknown';
                              const suggestedNature = getSuggestedNature(member);
                              const suggestedEvs = getSuggestedEvSpread(member);
                              
                              let descText = "";
                              const nameLower = member.name.toLowerCase();
                              if (nameLower.includes('miraidon')) {
                                descText = "Sử dụng Electro Drift xả sát thương đặc biệt cực lớn trong sân điện. Trang bị Choice Specs tăng 50% Sp. Atk giúp dứt điểm nhanh.";
                              } else if (nameLower.includes('urshifu')) {
                                descText = "Chủ lực vật lý với Surging Strikes hoặc Wicked Blow luôn chí mạng bỏ qua mọi tầng buff thủ của đối thủ. Focus Sash giữ mạng khi solo.";
                              } else if (nameLower.includes('flutter-mane')) {
                                descText = "Sweeper đặc biệt tốc độ cao. Dùng Booster Energy tăng tốc độ để đi trước dọn sân bằng Moonblast/Shadow Ball.";
                              } else if (nameLower.includes('incineroar')) {
                                descText = "Support đảo sân số 1. Dùng Intimidate giảm công địch, Fake Out khống chế lượt 1 và Parting Shot để xoay tua.";
                              } else if (nameLower.includes('amoonguss')) {
                                descText = "Định hướng hút đòn bằng Rage Powder và ru ngủ bằng Spore. Rocky Helmet phạt sát thương các đòn tiếp xúc vật lý của đối thủ.";
                              } else if (nameLower.includes('rillaboom')) {
                                descText = "Thiết lập Grassy Terrain tăng HP cho team, đi đòn ưu tiên Grassy Glide cực nhanh và dùng Fake Out hỗ trợ.";
                              } else if (nameLower.includes('archaludon')) {
                                descText = "Tận dụng Stamina tăng thủ khi bị đánh. Sử dụng chiêu Electro Shot bắn ngay lập tức nếu đi cùng Pelipper gọi mưa.";
                              } else if (nameLower.includes('farigiraf')) {
                                descText = "Chặn các đòn ưu tiên của đối thủ nhờ Armor Tail, bảo vệ đồng đội dựng Trick Room hoặc hỗ trợ sát thương bằng Helping Hand.";
                              } else if (nameLower.includes('great-tusk')) {
                                descText = "Chiến binh vật lý phá giáp mạnh mẽ. Dùng Headlong Rush hoặc Close Combat xả sát thương, và Rapid Spin để dọn bẫy trên sân.";
                              } else if (nameLower.includes('gengar')) {
                                descText = "Gây áp lực khống chế cao với Shadow Ball/Sludge Bomb và Shadow Tag (nếu có). Có thể dùng Will-O-Wisp để phế vật lý đối thủ.";
                              } else if (nameLower.includes('volcarona')) {
                                descText = "Setup Quiver Dance tăng Sp. Atk, Sp. Def và Speed lên mức hủy diệt, sau đó quét sân bằng Fiery Dance/Bug Buzz.";
                              } else if (nameLower.includes('greninja')) {
                                descText = "Tối ưu hóa khả năng đổi thuộc tính linh hoạt với Protean/Battle Bond. Dùng Water Shuriken dứt điểm nhanh đối thủ.";
                              } else if (nameLower.includes('sylveon')) {
                                descText = "Dùng Pixilate chuyển Hyper Voice thành đòn hệ Fairy diện rộng cực mạnh, kết hợp Throat Spray tăng ngay 1 bậc Sp. Atk.";
                              } else if (nameLower.includes('kingambit')) {
                                descText = "Sức mạnh tăng tiến cuối trận nhờ Supreme Overlord. Dùng Sucker Punch đi trước để quét sạch tàn dư của địch.";
                              } else if (nameLower.includes('roaring-moon')) {
                                descText = "Chủ lực vật lý có tốc độ cực nhanh trong thời tiết Nắng. Sử dụng đòn Knock Off phá vật phẩm hoặc dựng Tailwind mở đường.";
                              } else if (nameLower.includes('iron-crown')) {
                                descText = "Sát thủ đặc biệt sử dụng Tachyon Cutter chém 2 phát liên tiếp chính xác tuyệt đối, sát thương tăng 30% trong sân điện/tâm linh.";
                              } else if (nameLower.includes('iron-hands')) {
                                descText = "Thùng sắt chống đỡ cực khỏe nhờ Assault Vest, xả sát thương vật lý tầm gần bằng Drain Punch/Wild Charge và dùng Fake Out mở màn.";
                              } else if (nameLower.includes('indeedee')) {
                                descText = "Hỗ trợ dựng sân tâm linh Psychic Terrain bảo vệ đồng đội khỏi Fake Out, và hút đòn đơn mục tiêu bằng Follow Me.";
                              } else {
                                descText = "Lắp đặt trang bị và hướng build cân bằng theo thuộc tính nguyên bản. Tập trung vào các chiêu thức khắc chế hệ và tăng lợi thế tốc độ.";
                              }

                              return (
                                <div key={member.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <strong style={{ fontSize: '0.82rem', textTransform: 'capitalize', color: 'var(--text-primary)' }}>
                                      {mIdx + 1}. {formatPokemonName(member.name)}
                                    </strong>
                                    <span style={{ fontSize: '0.7rem', color: member.isOwned ? '#10b981' : '#f59e0b', fontWeight: 800 }}>
                                      {member.isOwned ? '✓ Đã sở hữu' : '✗ Chưa sở hữu'}
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.74rem', color: 'var(--text-secondary)', flexWrap: 'wrap', marginTop: '0.15rem' }}>
                                    <span><strong>Item:</strong> {suggestedItem}</span>
                                    <span><strong>Ability:</strong> {formatPokemonName(suggestedAbility)}</span>
                                    <span><strong>Nature:</strong> {suggestedNature}</span>
                                    <span><strong>EVs:</strong> {suggestedEvs}</span>
                                  </div>
                                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.74rem', color: '#475569', fontStyle: 'italic', lineHeight: '1.5' }}>
                                    {descText}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
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
                  <i className="fa-solid fa-database"></i> {ownedPokemonDetails.length} / {allPokemon.length}
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

        {/* FRIENDS LIST & VIEW TEAM TAB */}
        {activeTab === 'friends' && (
          <div className="friends-section" style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem' }}>
            {selectedFriend ? (
              /* Selected Friend Team Details View */
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  <button 
                    onClick={() => setSelectedFriend(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}
                  >
                    <i className="fa-solid fa-arrow-left"></i> Back to Friends
                  </button>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Friend's Tactical Squads</h3>
                </div>

                {/* Friend profile summary */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '1.2rem', borderRadius: '16px', marginBottom: '2rem' }}>
                  <img src={selectedFriend.avatar} alt={selectedFriend.displayName} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ffffff', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} />
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedFriend.displayName}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Joined {selectedFriend.createdAt ? new Date(selectedFriend.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'June 2026'} · {selectedFriend.ownedPokemon?.length || 0} Pokémon Owned
                    </p>
                  </div>
                </div>

                {/* Friend Teams Display */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  {[0, 1, 2].map(teamIdx => {
                    const team = selectedFriend.teams?.[teamIdx] || [null, null, null, null, null, null];
                    const activeTeamPokemon = team.map(id => allPokemon.find(p => p.id === id)).filter(Boolean);
                    
                    return (
                      <div key={teamIdx} style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            <i className="fa-solid fa-users" style={{ color: 'var(--primary-color)', marginRight: '0.5rem' }}></i> Tactical Team {teamIdx + 1}
                          </h4>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'var(--primary-light)', color: 'var(--primary-color)', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                            {activeTeamPokemon.length} / 6 Active
                          </span>
                        </div>

                        {/* Team Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
                          {team.map((pokeId, slotIdx) => {
                            const poke = allPokemon.find(p => p.id === pokeId);
                            if (poke) {
                              const officialArtwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${poke.id}.png`;
                              return (
                                <div key={slotIdx} style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.8rem', textAlign: 'center', position: 'relative' }}>
                                  <span style={{ position: 'absolute', top: '5px', left: '8px', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                                    #{poke.id}
                                  </span>
                                  <img 
                                    src={officialArtwork} 
                                    alt={poke.name} 
                                    style={{ width: '60px', height: '60px', objectFit: 'contain', margin: '0.5rem auto 0.2rem' }} 
                                  />
                                  <h5 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {poke.name}
                                  </h5>
                                  <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', marginTop: '0.25rem' }}>
                                    {poke.types.slice(0, 1).map(type => (
                                      <span key={type} style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'var(--border-color)', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                                        {type}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              );
                            } else {
                              return (
                                <div key={slotIdx} style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '105px', background: 'rgba(248, 250, 252, 0.5)' }}>
                                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px dashed var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                                    <i className="fa-solid fa-plus" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}></i>
                                  </div>
                                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Empty Slot</span>
                                </div>
                              );
                            }
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Friends List View */
              <div>
                <h3 className="profile-section-title" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                  <i className="fa-solid fa-user-group"></i> Active Trainer Friends
                </h3>

                {loadingFriends ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary-color)' }}></i>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontSize: '0.9rem' }}>Searching for other trainers...</p>
                  </div>
                ) : friends.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {friends.map(friend => (
                      <div 
                        key={friend._id} 
                        className="friend-card"
                        style={{
                          background: '#ffffff',
                          border: '1px solid var(--border-color)',
                          borderRadius: '16px',
                          padding: '1.2rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedFriend(friend)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <img src={friend.avatar} alt={friend.displayName} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{friend.displayName}</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                              {friend.ownedPokemon?.length || 0} Pokémon Owned
                            </p>
                          </div>
                        </div>
                        <button 
                          style={{
                            background: 'var(--primary-light)',
                            color: 'var(--primary-color)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.5rem 0.8rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            transition: 'background-color 0.2s'
                          }}
                          onClick={(e) => { e.stopPropagation(); setSelectedFriend(friend); }}
                        >
                          <i className="fa-solid fa-users"></i> View Team
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
                    <i className="fa-solid fa-users-slash" style={{ fontSize: '2.5rem', color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.5 }}></i>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>No other trainers found</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>You are currently the only active trainer on this network.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </section>

      {/* Mobile Floating Pokéball Menu Button */}
      <button 
        className={`mobile-pokeball-fab ${showMobileMenu ? 'open' : ''}`}
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        aria-label="Toggle Navigation Menu"
      >
      </button>

      {/* Mobile Floating Navigation Menu */}
      {showMobileMenu && (
        <div className="mobile-trainer-menu-overlay" onClick={() => setShowMobileMenu(false)}>
          <div className="mobile-trainer-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h3>Trainer Hub</h3>
              <button className="mobile-menu-close" onClick={() => setShowMobileMenu(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="mobile-menu-items">
              <button 
                className={`trainer-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => { setActiveTab('profile'); setShowMobileMenu(false); }}
              >
                <i className="fa-solid fa-id-card"></i> Trainer Profile
              </button>
              
              {!isAdmin && (
                <button 
                  className={`trainer-nav-item ${activeTab === 'collection' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('collection'); setShowMobileMenu(false); }}
                >
                  <i className="fa-solid fa-layer-group"></i> My Pokemon
                </button>
              )}

              {!isAdmin && (
                <button 
                  className={`trainer-nav-item ${activeTab === 'matchups' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('matchups'); setShowMobileMenu(false); }}
                >
                  <i className="fa-solid fa-diagram-project"></i> Type Matchups
                </button>
              )}
              
              {!isAdmin && (
                <button 
                  className={`trainer-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('settings'); setShowMobileMenu(false); }}
                >
                  <i className="fa-solid fa-sliders"></i> Account Settings
                </button>
              )}

              {!isAdmin && (
                <button 
                  className={`trainer-nav-item ${activeTab === 'friends' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('friends'); setShowMobileMenu(false); }}
                >
                  <i className="fa-solid fa-user-group"></i> Friends
                </button>
              )}

              {isAdmin && (
                <button 
                  className={`trainer-nav-item ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('admin'); setShowMobileMenu(false); }}
                >
                  <i className="fa-solid fa-users-gear"></i> Manage Accounts
                </button>
              )}
              
              <button 
                className="trainer-nav-item trainer-nav-item--logout"
                onClick={() => { handleLogout(); setShowMobileMenu(false); }}
              >
                <i className="fa-solid fa-right-from-bracket"></i> Logout
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
