const ASSET_ROOT = './assets/';
const isCrazyGamesDomain = /(^|\.)crazygames\.com$/i.test(globalThis.location?.hostname || '');
const CRAZY_GAMES_SDK = isCrazyGamesDomain ? (globalThis.CrazyGames?.SDK ?? null) : null;
let crazyGamesSdkReady = false;
let crazyGamesGameplayRequested = false;

function callCrazyGames(target, method) {
  if (!target || typeof target[method] !== 'function') return;
  try {
    const result = target[method]();
    if (result && typeof result.catch === 'function') result.catch(() => {});
  } catch (_) { /* SDK remains optional outside CrazyGames. */ }
}

function notifyCrazyGamesGameplay(active) {
  crazyGamesGameplayRequested = active;
  if (!crazyGamesSdkReady || !CRAZY_GAMES_SDK?.game) return;
  callCrazyGames(CRAZY_GAMES_SDK.game, active ? 'gameplayStart' : 'gameplayStop');
}

async function initializeCrazyGamesSdk() {
  if (!CRAZY_GAMES_SDK) return;
  try {
    if (typeof CRAZY_GAMES_SDK.init === 'function') await CRAZY_GAMES_SDK.init();
    crazyGamesSdkReady = true;
  } catch (_) {
    return;
  }
  callCrazyGames(CRAZY_GAMES_SDK.game, 'sdkGameLoadingStart');
  callCrazyGames(CRAZY_GAMES_SDK.game, 'sdkGameLoadingStop');
  notifyCrazyGamesGameplay(crazyGamesGameplayRequested);
}

const clampVolume = (value) => Math.max(0, Math.min(1, value));
const savedMusicVolume = localStorage.getItem('castle-crush-music-volume');
const MUSIC_DEFAULT_VOLUME = 0.28;
const parsedMusicVolume = savedMusicVolume === null ? NaN : Number(savedMusicVolume);
const initialMusicVolume = Number.isFinite(parsedMusicVolume) ? clampVolume(parsedMusicVolume) : MUSIC_DEFAULT_VOLUME;
const BACKGROUND_MUSIC = new Audio(`${ASSET_ROOT}pirate_theme-mp3.mp3`);
BACKGROUND_MUSIC.loop = true;
BACKGROUND_MUSIC.preload = 'auto';
BACKGROUND_MUSIC.volume = localStorage.getItem('castle-crush-music-muted') === 'on' ? 0 : initialMusicVolume;
const INTRO_MUSIC = new Audio(`${ASSET_ROOT}audio/castle-crush-intro-theme.mp3`);
INTRO_MUSIC.preload = 'auto';
INTRO_MUSIC.autoplay = true;
INTRO_MUSIC.setAttribute('playsinline', '');
INTRO_MUSIC.volume = localStorage.getItem('castle-crush-music-muted') === 'on' ? 0 : 0.42;
const MATCH_SOUND = new Audio(`${ASSET_ROOT}audio/match-pop-chime.mp3`);
const SHAPE_MATCH_ALERT_SOUND = new Audio(`${ASSET_ROOT}audio/shape-match-alert.mp3`);
const INVALID_MATCH_SOUND = new Audio(`${ASSET_ROOT}audio/invalid-match-fail.mp3`);
const TRUMP_FOLLOW_ME_SOUND = new Audio(`${ASSET_ROOT}pirate_follow_me.mp3`);
const CHARACTER_ROUND_SOUNDS = [
  new Audio(`${ASSET_ROOT}audio/character-round-01-banana-slip.mp3`),
  new Audio(`${ASSET_ROOT}audio/character-round-02-parrot-squawk.mp3`),
  new Audio(`${ASSET_ROOT}audio/character-round-03-treasure-drum.mp3`),
  new Audio(`${ASSET_ROOT}audio/character-round-04-squeaky-boot.mp3`),
  new Audio(`${ASSET_ROOT}audio/character-round-05-cannon-pop.mp3`),
  new Audio(`${ASSET_ROOT}audio/character-round-06-sea-laugh.mp3`),
  new Audio(`${ASSET_ROOT}audio/character-round-07-map-confusion.mp3`),
  new Audio(`${ASSET_ROOT}audio/character-round-08-parrot-laugh.mp3`),
  new Audio(`${ASSET_ROOT}audio/character-round-09-rope-tangle.mp3`),
  new Audio(`${ASSET_ROOT}audio/character-round-10-grand-escape.mp3`)
];
const CHARACTER_STAGE_SOUNDS = {
  11: new Audio(`${ASSET_ROOT}audio/stage11-cabin-gold-rescue.mp3`),
  12: new Audio(`${ASSET_ROOT}audio/stage12-bosun-coral-rescue.mp3`),
  13: new Audio(`${ASSET_ROOT}audio/stage13-lookout-emerald-rescue.mp3`),
  14: new Audio(`${ASSET_ROOT}audio/stage14-chef-cobalt-rescue.mp3`),
  15: new Audio(`${ASSET_ROOT}audio/stage15-deckhand-rose-rescue.mp3`),
  16: new Audio(`${ASSET_ROOT}audio/stage16-cartographer-sand-rescue.mp3`),
  17: new Audio(`${ASSET_ROOT}audio/stage17-smuggler-indigo-rescue.mp3`),
  18: new Audio(`${ASSET_ROOT}audio/stage18-musician-aqua-rescue.mp3`),
  19: new Audio(`${ASSET_ROOT}audio/stage19-guard-silver-rescue.mp3`),
  20: new Audio(`${ASSET_ROOT}audio/stage20-diver-mint-rescue.mp3`)
};
MATCH_SOUND.preload = 'auto';
SHAPE_MATCH_ALERT_SOUND.preload = 'auto';
INVALID_MATCH_SOUND.preload = 'auto';
TRUMP_FOLLOW_ME_SOUND.preload = 'auto';
CHARACTER_ROUND_SOUNDS.forEach((sound) => { sound.preload = 'auto'; });
Object.values(CHARACTER_STAGE_SOUNDS).forEach((sound) => { sound.preload = 'auto'; });
const ROWS = 7;
const COLS = 8;
const STAGE_COUNT = 20;
const ROUNDS_PER_STAGE = 10;
const TYPES = ['blue', 'purple', 'red', 'green', 'yellow'];
const SPECIAL_MODE_START_STAGE = 11;
const SPECIAL_CHARACTER_GROUPS = [
  ['cabinGold', 'bosunCoral', 'lookoutEmerald', 'chefCobalt', 'deckhandRose'],
  ['cartographerSand', 'smugglerIndigo', 'musicianAqua', 'guardSilver', 'diverMint']
];
const SPECIAL_ICON_GOAL = 18;
const CHARACTER_CONFIG = {
  trump: { aide: 'President Trump', aideAr: 'الرئيس ترامب', image: 'pirate_trump_figure_new-2.webp', label: 'TRUMP FIGURES' },
  vance: { aide: 'Vance', aideAr: 'فانس', image: 'pirate_vance_figure_new.webp', label: 'VANCE FIGURES' },
  hegseth: { aide: 'Hegseth', aideAr: 'هيغسيث', image: 'pirate_hegseth_figure_new.webp', label: 'HEGSETH FIGURES' },
  rubio: { aide: 'Rubio', aideAr: 'روبيو', image: 'pirate_rubio_figure_new.webp', label: 'RUBIO FIGURES' },
  witkoff: { aide: 'Witkoff', aideAr: 'ويتكوف', image: 'pirate_witkopf_figure_new.webp', label: 'WITKOFF FIGURES' },
  kushner: { aide: 'Kushner', aideAr: 'كوشنر', image: 'pirate_kushner_figure_new.webp', label: 'KUSHNER FIGURES' },
  captainScarlet: { aide: 'Captain Scarlet', aideAr: 'القبطان سكارليت', image: 'pirate-captain-scarlet.webp', label: 'SCARLET CAPTAINS' },
  sailorTeal: { aide: 'Sailor Teal', aideAr: 'البحّار تيل', image: 'pirate-sailor-teal.webp', label: 'TEAL SAILORS' },
  navigatorViolet: { aide: 'Navigator Violet', aideAr: 'الملاح البنفسجي', image: 'pirate-navigator-violet.webp', label: 'VIOLET NAVIGATORS' },
  quartermasterOrange: { aide: 'Quartermaster Orange', aideAr: 'أمين البرتقالي', image: 'pirate-quartermaster-orange.webp', label: 'ORANGE QUARTERMASTERS' },
  cabinGold: { aide: 'Cabin Gold', aideAr: 'مساعد الذهب', image: 'pirate-cabin-gold.webp', label: 'GOLD CABIN CREW' },
  bosunCoral: { aide: 'Bosun Coral', aideAr: 'المشرف المرجاني', image: 'pirate-bosun-coral.webp', label: 'CORAL BOSUNS' },
  lookoutEmerald: { aide: 'Lookout Emerald', aideAr: 'الحارس الزمردي', image: 'pirate-lookout-emerald.webp', label: 'EMERALD LOOKOUTS' },
  chefCobalt: { aide: 'Chef Cobalt', aideAr: 'الطاهي كوبالت', image: 'pirate-chef-cobalt.webp', label: 'COBALT CHEFS' },
  deckhandRose: { aide: 'Deckhand Rose', aideAr: 'بحّار روز', image: 'pirate-deckhand-rose.webp', label: 'ROSE DECKHANDS' },
  cartographerSand: { aide: 'Cartographer Sand', aideAr: 'رسّام الخرائط الرملي', image: 'pirate-cartographer-sand.webp', label: 'SAND CARTOGRAPHERS' },
  smugglerIndigo: { aide: 'Smuggler Indigo', aideAr: 'المهرّب النيلي', image: 'pirate-smuggler-indigo.webp', label: 'INDIGO SMUGGLERS' },
  musicianAqua: { aide: 'Musician Aqua', aideAr: 'الموسيقي المائي', image: 'pirate-musician-aqua.webp', label: 'AQUA MUSICIANS' },
  guardSilver: { aide: 'Guard Silver', aideAr: 'الحارس الفضي', image: 'pirate-guard-silver.webp', label: 'SILVER GUARDS' },
  diverMint: { aide: 'Diver Mint', aideAr: 'الغوّاص النعناعي', image: 'pirate-diver-mint.webp', label: 'MINT DIVERS' }
};
const STAGE_TITLES = {
  1: {
    en: ['The Golden Harbor', 'Trump’s Map Mix-Up', 'The Blue Dock Dash', 'Purple Parrot Passage', 'The Red Rope Bridge', 'Green Gate Getaway', 'The Crowned Courtyard', 'Storm over the Castle', 'The Hidden Harbor Door', 'Trump’s Grand Escape'],
    ar: ['الميناء الذهبي', 'ارتباك خريطة ترامب', 'سباق الرصيف الأزرق', 'ممر الببغاء البنفسجي', 'جسر الحبل الأحمر', 'الهروب من البوابة الخضراء', 'ساحة التاج', 'العاصفة فوق القلعة', 'باب الميناء المخفي', 'هروب ترامب الكبير']
  },
  2: {
    en: ['Vance’s Velvet Voyage', 'The Blue Compass', 'Purple Port Peril', 'The Red Lantern Route', 'Green Gate Detour', 'The Golden Mast', 'The Echoing Courtyard', 'Vance’s Secret Passage', 'The Last Harbor Lock', 'Vance’s Victory Voyage'],
    ar: ['رحلة فانس المخملية', 'البوصلة الزرقاء', 'خطر الميناء البنفسجي', 'طريق الفانوس الأحمر', 'منعطف البوابة الخضراء', 'الصاري الذهبي', 'الساحة الصدى', 'ممر فانس السري', 'قفل الميناء الأخير', 'رحلة فانس المنتصرة']
  },
  3: {
    en: ['Hegseth’s Castle Charge', 'The Red Rampart', 'Blue Banner Breakout', 'The Purple Tower Turn', 'Green Moat Mission', 'The Golden Gear Room', 'The Crooked Catwalk', 'Echoes in the Dungeon', 'The Final Fortress Gate', 'Hegseth’s Heroic Exit'],
    ar: ['هجوم هيغسيث على القلعة', 'السور الأحمر', 'الهروب من الراية الزرقاء', 'منعطف البرج البنفسجي', 'مهمة الخندق الأخضر', 'غرفة التروس الذهبية', 'الممر المائل', 'أصداء الزنزانة', 'بوابة الحصن الأخيرة', 'خروج هيغسيث البطولي']
  },
  4: {
    en: ['Rubio’s Royal Route', 'The Blue Bridge Bluff', 'Purple Tower Trouble', 'The Red Carpet Run', 'Green Garden Gate', 'The Golden Key Chase', 'The Wobbly Drawbridge', 'The Quiet Castle Hall', 'Rubio’s Last Shortcut', 'Rubio’s Royal Escape'],
    ar: ['طريق روبيو الملكي', 'خدعة الجسر الأزرق', 'مشكلة البرج البنفسجي', 'سباق السجادة الحمراء', 'بوابة الحديقة الخضراء', 'مطاردة المفتاح الذهبي', 'الجسر المتحرك المتمايل', 'قاعة القلعة الهادئة', 'اختصار روبيو الأخير', 'هروب روبيو الملكي']
  },
  5: {
    en: ['Witkoff and Kushner’s Wharf', 'The Twin Maps', 'The Purple Parrot Detour', 'The Red Carpet Trap', 'The Green Gate Giggles', 'The Golden Key Mix-Up', 'Escape from Echo Hall', 'The Crooked Drawbridge', 'The Last Locked Room', 'The Grand Crew Escape'],
    ar: ['رصيف ويتكوف وكوشنر', 'الخريطتان التوأم', 'منعطف الببغاء البنفسجي', 'فخ السجادة الحمراء', 'ضحكات البوابة الخضراء', 'ارتباك المفتاح الذهبي', 'الهروب من قاعة الصدى', 'الجسر المتحرك المائل', 'الغرفة الأخيرة المغلقة', 'هروب الطاقم الكبير']
  }
};
const EXTRA_STAGE_THEMES = {
  6: { en: 'Kushner’s Compass Cove', ar: 'خليج بوصلة كوشنر' },
  7: { en: 'Scarlet Captain’s Signal', ar: 'إشارة القبطان سكارليت' },
  8: { en: 'Teal Sailor’s Tidal Run', ar: 'سباق البحّار تيل' },
  9: { en: 'Violet Navigator’s Maze', ar: 'متاهة الملاح البنفسجي' },
  10: { en: 'Orange Key Keep', ar: 'حصن المفاتيح البرتقالي' },
  11: { en: 'Gold Cabin Crew', ar: 'طاقم المقصورة الذهبية' },
  12: { en: 'Coral Rope Rampart', ar: 'سور الحبال المرجاني' },
  13: { en: 'Emerald Lookout Lighthouse', ar: 'منارة الحارس الزمردي' },
  14: { en: 'Cobalt Galley Shuffle', ar: 'مطبخ كوبالت المتحرك' },
  15: { en: 'Rose Deckhand Dock', ar: 'رصيف البحّار روز' },
  16: { en: 'Sandy Mapmaker’s Trail', ar: 'درب رسّام الخرائط الرملي' },
  17: { en: 'Indigo Secret Stash', ar: 'المخبأ السري النيلي' },
  18: { en: 'Aqua Accordion Arcade', ar: 'ممر الأكورديون المائي' },
  19: { en: 'Silver Guard Stronghold', ar: 'حصن الحارس الفضي' },
  20: { en: 'Mint Diver’s Grand Finale', ar: 'النهاية الكبرى للغوّاص النعناعي' }
};
Object.entries(EXTRA_STAGE_THEMES).forEach(([stage, theme]) => {
  STAGE_TITLES[stage] = {
    en: Array.from({ length: ROUNDS_PER_STAGE }, (_, index) => `${theme.en} · Round ${index + 1}`),
    ar: Array.from({ length: ROUNDS_PER_STAGE }, (_, index) => `${theme.ar} · الجولة ${index + 1}`)
  };
});
const STAGE_CHARACTERS = [
  ['trump'], ['vance'], ['hegseth'], ['rubio'], ['witkoff'], ['kushner'],
  ['captainScarlet'], ['sailorTeal'], ['navigatorViolet'], ['quartermasterOrange'],
  ['cabinGold'], ['bosunCoral'], ['lookoutEmerald'], ['chefCobalt'], ['deckhandRose'],
  ['cartographerSand'], ['smugglerIndigo'], ['musicianAqua'], ['guardSilver'], ['diverMint']
];
function createStageLevels(stage) {
  const characters = STAGE_CHARACTERS[stage - 1];
  return Array.from({ length: ROUNDS_PER_STAGE }, (_, index) => {
    const round = index + 1;
    const characterKey = characters[index % characters.length];
    const character = CHARACTER_CONFIG[characterKey];
    return {
      title: STAGE_TITLES[stage].en[index],
      titleAr: STAGE_TITLES[stage].ar[index],
      selection: `${character.aide} escape`,
      selectionAr: `هروب ${character.aideAr}`,
      goal: TYPES[(index + stage - 1) % TYPES.length],
      target: 100,
      moves: 24 + index + ((stage - 1) * 2),
      aide: character.aide,
      aideAr: character.aideAr,
      image: character.image,
      obstacle: characterKey,
      obstacleImage: character.image,
      obstacleLabel: character.label,
      stage,
      stageRound: round
    };
  });
}
const LEVELS = Array.from({ length: STAGE_COUNT }, (_, index) => createStageLevels(index + 1)).flat();
const CAMPAIGN_VERSION = 'twenty-stages-twenty-characters-v1';
if (localStorage.getItem('castle-crush-campaign-version') !== CAMPAIGN_VERSION) {
  localStorage.setItem('castle-crush-campaign-version', CAMPAIGN_VERSION);
  localStorage.setItem('castle-crush-level', '0');
  localStorage.removeItem('castle-crush-completed');
  localStorage.removeItem('castle-crush-start-screen-seen-v4');
  localStorage.removeItem('castle-crush-start-screen-seen-v5');
}

const state = {
  level: Math.min(Number(localStorage.getItem('castle-crush-level') || 0), LEVELS.length - 1),
  startSelection: 0,
  language: localStorage.getItem('castle-crush-language') === 'en' ? 'en' : 'ar',
  characterSounds: localStorage.getItem('castle-crush-character-sounds') !== 'off',
  musicVolume: initialMusicVolume,
  musicMuted: localStorage.getItem('castle-crush-music-muted') === 'on',
  board: [], selected: null, moves: 0, score: 0, busy: false, modalKind: null, iconCounts: {}, hintCells: new Set(), trophyVisible: false, trophyClaims: 0,
  completed: new Set(JSON.parse(localStorage.getItem('castle-crush-completed') || '[]'))
};

const UI = {
  en: {
    gameLabel: 'Castle Crush match three game', sceneLabel: 'Current castle level', boardLabel: 'Match three board',
    puzzleLabel: 'Puzzle tiles', chooseLevel: 'Choose round', restartLevel: 'Restart round', switchTo: 'Switch to Arabic',
    levels: 'ROUNDS', restart: 'RESTART', points: 'POINTS', moves: 'MOVES', mission: (target) => `SCORE ${target} POINTS`, specialMission: (target) => `COLLECT ${target} CHARACTER ICONS`, iconCount: 'ICONS',
    tip: 'Swap two adjacent tiles to make 3 or more', specialTip: 'Match 3 or more character icons', match: 'MATCH = +10 PTS', specialMatch: '3 ICONS = +10 PTS', castleMap: 'Castle map', chooseReplay: 'Choose a round to replay.',
    closeLevels: 'Close rounds', startKicker: 'CASTLE CRUSH', startTitle: 'Choose your rescue journey', startCopy: 'Choose a stage, then begin the escape from the castle.', cinematicKicker: 'A PIRATE RESCUE ADVENTURE', cinematicTagline: 'Match. Break the walls. Set them free.', skipIntro: 'SKIP', play: 'LET’S PLAY', selectedStage: (stage) => `Selected: ${stage}`,
    completeKicker: 'ROUND COMPLETE', gateOpen: 'The gate is open!', finalTitle: 'Stage 20 · Round 10 cleared!', finalMessage: 'The whole twenty-character crew is free! Start the campaign again for another escape.', rescuedMessage: (name) => `You cleared the blockade and rescued ${name}.`, nextRound: 'NEXT ROUND', startRound: 'START AGAIN',
    tryAgain: 'TRY AGAIN', gateLocked: 'The gate is still locked', movesMessage: 'Use a fresh set of moves and look for long chains.',
    restartAction: 'RESTART ROUND', cleared: 'CLEARED', pointsGoal: '100 PTS', help: 'Help me!', characterSoundsOn: 'Mute character sounds', characterSoundsOff: 'Turn on character sounds', musicVolume: 'Background music volume', musicMute: 'Mute background music', musicUnmute: 'Turn on background music', trophyReady: 'Claim the bonus trophy', trophyReward: (moves, points) => `BONUS TROPHY! +${moves} moves · +${points} points`, fullscreenOpen: 'Open full screen', fullscreenClose: 'Exit full screen'
  },
  ar: {
    gameLabel: 'لعبة مطابقة ثلاثية لإنقاذ الشخصيات من القلعة', sceneLabel: 'الجولة الحالية', boardLabel: 'لوحة المطابقة الثلاثية',
    puzzleLabel: 'قطع اللغز', chooseLevel: 'اختر الجولة', restartLevel: 'أعد الجولة', switchTo: 'التبديل إلى الإنكليزية',
    levels: 'الجولات', restart: 'إعادة', points: 'النقاط', moves: 'الحركات', mission: (target) => `اجمع ${target} نقطة`, specialMission: (target) => `اجمع ${target} أيقونة شخصية`, iconCount: 'الأيقونات',
    tip: 'بدّل قطعتين متجاورتين لتكوين 3 قطع أو أكثر', specialTip: 'طابق 3 أيقونات شخصيات أو أكثر', match: 'مطابقة = +10 نقاط', specialMatch: '3 أيقونات = +10 نقاط', castleMap: 'خريطة القلعة', chooseReplay: 'اختر جولة لإعادة اللعب.',
    closeLevels: 'إغلاق الجولات', startKicker: 'قلعة المطابقة', startTitle: 'اختر رحلة الإنقاذ', startCopy: 'اختر مرحلة، ثم ابدأ الهروب من القلعة.', cinematicKicker: 'مغامرة إنقاذ القراصنة', cinematicTagline: 'طابق. حطّم الجدران. حرّرهم.', skipIntro: 'تخطّي', play: 'هيا العب', selectedStage: (stage) => `المرحلة المختارة: ${stage}`,
    completeKicker: 'اكتملت الجولة', gateOpen: 'البوابة مفتوحة!', finalTitle: 'اكتملت المرحلة العشرون · الجولة 10!', finalMessage: 'تحررت الشخصيات العشرون كلها! ابدأ الحملة من جديد لخوض مغامرة أخرى.', rescuedMessage: (name) => `أزلت الحاجز وأنقذت ${name}.`, nextRound: 'الجولة التالية', startRound: 'ابدأ من جديد',
    tryAgain: 'حاول مرة أخرى', gateLocked: 'البوابة ما زالت مغلقة', movesMessage: 'استخدم حركات جديدة وابحث عن سلاسل طويلة.',
    restartAction: 'أعد الجولة', cleared: 'مكتملة', pointsGoal: '100 نقطة', help: 'أنقذوني!', characterSoundsOn: 'اكتم أصوات الشخصيات', characterSoundsOff: 'شغّل أصوات الشخصيات', musicVolume: 'مستوى صوت موسيقى الخلفية', musicMute: 'اكتم موسيقى الخلفية', musicUnmute: 'شغّل موسيقى الخلفية', trophyReady: 'اضغط لتحصل على كأس المكافأة', trophyReward: (moves, points) => `كأس المكافأة! +${moves} حركات و+${points} نقطة`, fullscreenOpen: 'فتح ملء الشاشة', fullscreenClose: 'الخروج من ملء الشاشة'
  }
};
const TYPE_LABELS = {
  en: { blue: 'BLUE SMILEYS', purple: 'PURPLE COOL FACES', red: 'RED HEART-EYES', green: 'GREEN SILLY FACES', yellow: 'GOLD WINKS' },
  ar: { blue: 'سمايلات زرقاء', purple: 'وجوه بنفسجية مرحة', red: 'وجوه حمراء بقلوب', green: 'وجوه خضراء مضحكة', yellow: 'غمزات ذهبية' }
};
const STAGE_NAMES = {
  en: Array.from({ length: STAGE_COUNT }, (_, index) => `Stage ${index + 1}`),
  ar: ['المرحلة الأولى', 'المرحلة الثانية', 'المرحلة الثالثة', 'المرحلة الرابعة', 'المرحلة الخامسة', 'المرحلة السادسة', 'المرحلة السابعة', 'المرحلة الثامنة', 'المرحلة التاسعة', 'المرحلة العاشرة', 'المرحلة الحادية عشرة', 'المرحلة الثانية عشرة', 'المرحلة الثالثة عشرة', 'المرحلة الرابعة عشرة', 'المرحلة الخامسة عشرة', 'المرحلة السادسة عشرة', 'المرحلة السابعة عشرة', 'المرحلة الثامنة عشرة', 'المرحلة التاسعة عشرة', 'المرحلة العشرون']
};
const OBSTACLE_NAMES = {
  en: {
    trump: 'TRUMP FIGURES', vance: 'VANCE FIGURES', hegseth: 'HEGSETH FIGURES', rubio: 'RUBIO FIGURES', witkoff: 'WITKOFF FIGURES', kushner: 'KUSHNER FIGURES',
    captainScarlet: 'SCARLET CAPTAINS', sailorTeal: 'TEAL SAILORS', navigatorViolet: 'VIOLET NAVIGATORS', quartermasterOrange: 'ORANGE QUARTERMASTERS',
    cabinGold: 'GOLD CABIN CREW', bosunCoral: 'CORAL BOSUNS', lookoutEmerald: 'EMERALD LOOKOUTS', chefCobalt: 'COBALT CHEFS', deckhandRose: 'ROSE DECKHANDS',
    cartographerSand: 'SAND CARTOGRAPHERS', smugglerIndigo: 'INDIGO SMUGGLERS', musicianAqua: 'AQUA MUSICIANS', guardSilver: 'SILVER GUARDS', diverMint: 'MINT DIVERS', 'wire-trap': 'WIRE TRAPS'
  },
  ar: {
    trump: 'عوائق ترامب', vance: 'عوائق فانس', hegseth: 'عوائق هيغسيث', rubio: 'عوائق روبيو', witkoff: 'عوائق ويتكوف', kushner: 'عوائق كوشنر',
    captainScarlet: 'عوائق القبطان سكارليت', sailorTeal: 'عوائق البحّار تيل', navigatorViolet: 'عوائق الملاح البنفسجي', quartermasterOrange: 'عوائق أمين البرتقالي',
    cabinGold: 'عوائق مساعد الذهب', bosunCoral: 'عوائق المشرف المرجاني', lookoutEmerald: 'عوائق الحارس الزمردي', chefCobalt: 'عوائق الطاهي كوبالت', deckhandRose: 'عوائق البحّار روز',
    cartographerSand: 'عوائق رسّام الخرائط الرملي', smugglerIndigo: 'عوائق المهرّب النيلي', musicianAqua: 'عوائق الموسيقي المائي', guardSilver: 'عوائق الحارس الفضي', diverMint: 'عوائق الغوّاص النعناعي', 'wire-trap': 'فخاخ الأسلاك'
  }
};
const stageLabel = (stage) => STAGE_NAMES[state.language][stage - 1];

const $ = (id) => document.getElementById(id);
const boardEl = $('board');
boardEl.addEventListener('pointerup', handleTilePointerUp, { passive: false });
boardEl.addEventListener('pointercancel', handleTilePointerCancel);
const level = () => LEVELS[state.level];
const isCharacterMatchMode = () => level().stage >= SPECIAL_MODE_START_STAGE;
const specialCharacterTypes = () => SPECIAL_CHARACTER_GROUPS[Math.floor((level().stage - SPECIAL_MODE_START_STAGE) / 5)] || SPECIAL_CHARACTER_GROUPS[0];
const boardTypes = () => isCharacterMatchMode() ? specialCharacterTypes() : TYPES;
const specialIconCount = () => Object.values(state.iconCounts).reduce((total, count) => total + count, 0);
const specialGoal = () => SPECIAL_ICON_GOAL;
const text = (key) => UI[state.language][key];
const roundLabel = (index) => {
  const item = LEVELS[index];
  if (!item) return '';
  return state.language === 'ar'
    ? `${stageLabel(item.stage)} • جولة ${item.stageRound}`
    : `${stageLabel(item.stage)} • Round ${item.stageRound}`;
};
const levelTitle = (index) => state.language === 'ar' ? LEVELS[index].titleAr : LEVELS[index].title;
const aideName = (index) => state.language === 'ar' ? LEVELS[index].aideAr : LEVELS[index].aide;
const obstacleLabel = (item) => OBSTACLE_NAMES[state.language][item.obstacle] || item.obstacleLabel;
const selectionName = (index) => state.language === 'ar' ? LEVELS[index].selectionAr : LEVELS[index].selection;

function randomType() {
  const types = boardTypes();
  return types[Math.floor(Math.random() * types.length)];
}
function key(r, c) { return `${r}:${c}`; }
function inBounds(r, c) { return r >= 0 && r < ROWS && c >= 0 && c < COLS; }
function adjacent(a, b) { return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1; }

let touchGesture = null;
let suppressTileClickUntil = 0;
let hintTimer = null;
const TOUCH_SWIPE_DISTANCE = 18;
const HINT_DELAY = 3600;
const TROPHY_FIRST_DELAY = 12000;
const TROPHY_REAPPEAR_DELAY = 22000;
const TROPHY_VISIBLE_DURATION = 7000;
const TROPHY_REWARD_MOVES = 3;
const TROPHY_REWARD_POINTS = 20;
let trophyTimer = null;
let trophyHideTimer = null;

function tileCellFromElement(element) {
  const tile = element?.closest?.('.tile');
  if (!tile || !boardEl.contains(tile)) return null;
  return { r: Number(tile.dataset.row), c: Number(tile.dataset.col) };
}

function tileCellAtPoint(x, y) {
  return tileCellFromElement(document.elementFromPoint(x, y));
}

function swipeTarget(start, dx, dy) {
  if (Math.hypot(dx, dy) < TOUCH_SWIPE_DISTANCE) return null;
  const target = { r: start.r, c: start.c };
  if (Math.abs(dx) > Math.abs(dy)) target.c += dx > 0 ? 1 : -1;
  else target.r += dy > 0 ? 1 : -1;
  return inBounds(target.r, target.c) ? target : null;
}

function clearHint() {
  if (hintTimer !== null) {
    window.clearTimeout(hintTimer);
    hintTimer = null;
  }
  state.hintCells.clear();
}

function clearTrophyTimers() {
  if (trophyTimer !== null) {
    window.clearTimeout(trophyTimer);
    trophyTimer = null;
  }
  if (trophyHideTimer !== null) {
    window.clearTimeout(trophyHideTimer);
    trophyHideTimer = null;
  }
}

function isGameplayVisible() {
  return $('startOverlay').classList.contains('hidden')
    && $('levelDrawer').classList.contains('hidden')
    && $('cinematicIntro').classList.contains('hidden')
    && state.modalKind === null;
}

function canShowTrophy() {
  return !state.busy && state.moves > 0 && !state.trophyVisible && isGameplayVisible();
}

function hideTrophy(reschedule = true) {
  if (trophyHideTimer !== null) {
    window.clearTimeout(trophyHideTimer);
    trophyHideTimer = null;
  }
  state.trophyVisible = false;
  $('trophyButton').classList.add('hidden');
  $('trophyButton').setAttribute('aria-hidden', 'true');
  if (reschedule) scheduleTrophy(TROPHY_REAPPEAR_DELAY);
}

function showTrophy() {
  if (!canShowTrophy()) {
    scheduleTrophy(5000);
    return;
  }
  state.trophyVisible = true;
  const button = $('trophyButton');
  button.classList.remove('hidden');
  button.classList.remove('is-claimed');
  button.setAttribute('aria-hidden', 'false');
  updateTrophyButton();
  trophyHideTimer = window.setTimeout(() => hideTrophy(true), TROPHY_VISIBLE_DURATION);
}

function scheduleTrophy(delay = TROPHY_FIRST_DELAY) {
  if (trophyTimer !== null) window.clearTimeout(trophyTimer);
  trophyTimer = window.setTimeout(() => {
    trophyTimer = null;
    showTrophy();
  }, delay);
}

function showTrophyRewardFeedback() {
  const feedback = document.createElement('div');
  feedback.className = 'trophy-feedback';
  feedback.textContent = text('trophyReward')(TROPHY_REWARD_MOVES, TROPHY_REWARD_POINTS);
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  $('gameShell').appendChild(feedback);
  window.setTimeout(() => feedback.remove(), 1900);
}

function claimTrophy() {
  if (!state.trophyVisible || state.busy || state.modalKind !== null) return;
  state.trophyClaims += 1;
  state.moves += TROPHY_REWARD_MOVES;
  state.score = Math.min(level().target, state.score + TROPHY_REWARD_POINTS);
  playSfx(SHAPE_MATCH_ALERT_SOUND, 0.72, 1.08);
  hideTrophy(true);
  updateHud();
  showTrophyRewardFeedback();
}

function findHintSwap() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const first = { r, c };
      const neighbors = [{ r, c: c + 1 }, { r: r + 1, c }];
      for (const second of neighbors) {
        if (!inBounds(second.r, second.c)) continue;
        swap(first, second);
        const matches = findMatches();
        swap(first, second);
        if (matches.has(key(first.r, first.c)) || matches.has(key(second.r, second.c))) return { first, second };
      }
    }
  }
  return null;
}

function scheduleHint() {
  clearHint();
  if (state.busy || state.moves <= 0 || state.selected || state.modalKind !== null) return;
  if (!$('startOverlay').classList.contains('hidden') || !$('levelDrawer').classList.contains('hidden') || !$('cinematicIntro').classList.contains('hidden')) return;
  hintTimer = window.setTimeout(() => {
    hintTimer = null;
    if (state.busy || state.moves <= 0 || state.selected || state.modalKind !== null) return;
    if (!$('startOverlay').classList.contains('hidden') || !$('levelDrawer').classList.contains('hidden') || !$('cinematicIntro').classList.contains('hidden')) return;
    const suggestion = findHintSwap();
    if (!suggestion) return;
    state.hintCells = new Set([key(suggestion.first.r, suggestion.first.c), key(suggestion.second.r, suggestion.second.c)]);
    renderBoard();
    playSfx(MATCH_SOUND, 0.38);
  }, HINT_DELAY);
}

function handleTilePointerDown(event, r, c) {
  if (event.pointerType !== 'touch' || state.busy || state.moves <= 0) return;
  touchGesture = { r, c, x: event.clientX, y: event.clientY, pointerId: event.pointerId };
  event.preventDefault();
}

function handleTilePointerUp(event) {
  if (event.pointerType !== 'touch' || !touchGesture || event.pointerId !== touchGesture.pointerId) return;
  const gesture = touchGesture;
  touchGesture = null;
  event.preventDefault();
  const dx = event.clientX - gesture.x;
  const dy = event.clientY - gesture.y;
  const start = { r: gesture.r, c: gesture.c };
  const end = swipeTarget(start, dx, dy) || tileCellFromElement(event.target) || tileCellAtPoint(event.clientX, event.clientY) || start;
  suppressTileClickUntil = performance.now() + 500;
  chooseTile(start.r, start.c);
  if (adjacent(start, end)) chooseTile(end.r, end.c);
}

function handleTilePointerCancel(event) {
  if (event.pointerType === 'touch' && touchGesture?.pointerId === event.pointerId) touchGesture = null;
}

function makeBoard() {
  const board = Array.from({ length: ROWS }, () => Array(COLS).fill(''));
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let options = TYPES.slice();
      if (c > 1 && board[r][c - 1] === board[r][c - 2]) options = options.filter((t) => t !== board[r][c - 1]);
      if (r > 1 && board[r - 1][c] === board[r - 2][c]) options = options.filter((t) => t !== board[r - 1][c]);
      board[r][c] = options[Math.floor(Math.random() * options.length)] || randomType();
    }
  }
  return board;
}

function tileContent(type) {
  const character = CHARACTER_CONFIG[type];
  if (character) {
    return `<img class="tile-character-image" src="${ASSET_ROOT + character.image}" alt="" loading="lazy" /><span class="tile-character-shine" aria-hidden="true">✦</span>`;
  }
  const emojis = {
    blue: '😀',
    purple: '😎',
    red: '😍',
    green: '🤪',
    yellow: '😉'
  };
  return `<span class="tile-emoji" aria-hidden="true">${emojis[type]}</span>`;
}

function tileLabel(type, row, col) {
  const character = CHARACTER_CONFIG[type];
  const name = character ? (state.language === 'ar' ? character.aideAr : character.aide) : TYPE_LABELS[state.language][type];
  return `${name}, ${state.language === 'ar' ? `الصف ${row + 1}، العمود ${col + 1}` : `row ${row + 1}, column ${col + 1}`}`;
}

function renderBoard(matchKeys = new Set(), falling = false) {
  boardEl.innerHTML = '';
  state.board.forEach((row, r) => row.forEach((type, c) => {
    const tile = document.createElement('button');
    const characterTile = Boolean(CHARACTER_CONFIG[type]);
    tile.className = `tile ${type}${characterTile ? ' character-tile' : ''}${matchKeys.has(key(r, c)) ? ' matching' : ''}${falling ? ' falling' : ''}${state.hintCells.has(key(r, c)) ? ' hint' : ''}`;
    tile.dataset.row = r;
    tile.dataset.col = c;
    tile.setAttribute('role', 'gridcell');
    tile.setAttribute('aria-label', tileLabel(type, r, c));
    tile.innerHTML = tileContent(type);
    if (state.selected && state.selected.r === r && state.selected.c === c) tile.classList.add('selected');
    tile.addEventListener('pointerdown', (event) => handleTilePointerDown(event, r, c), { passive: false });
    tile.addEventListener('pointerup', handleTilePointerUp, { passive: false });
    tile.addEventListener('pointercancel', handleTilePointerCancel);
    tile.addEventListener('click', (event) => {
      if (performance.now() < suppressTileClickUntil) {
        event.preventDefault();
        return;
      }
      chooseTile(r, c);
    });
    boardEl.appendChild(tile);
  }));
}

function findMatches() {
  const matches = new Set();
  for (let r = 0; r < ROWS; r++) {
    let start = 0;
    for (let c = 1; c <= COLS; c++) {
      if (c < COLS && state.board[r][c] === state.board[r][start]) continue;
      if (c - start >= 3) for (let x = start; x < c; x++) matches.add(key(r, x));
      start = c;
    }
  }
  for (let c = 0; c < COLS; c++) {
    let start = 0;
    for (let r = 1; r <= ROWS; r++) {
      if (r < ROWS && state.board[r][c] === state.board[start][c]) continue;
      if (r - start >= 3) for (let y = start; y < r; y++) matches.add(key(y, c));
      start = r;
    }
  }
  return matches;
}

function swap(a, b) { [state.board[a.r][a.c], state.board[b.r][b.c]] = [state.board[b.r][b.c], state.board[a.r][a.c]]; }

async function chooseTile(r, c) {
  // Completed levels remain replayable; the completion set is progress data, not an input lock.
  if (state.busy || state.moves <= 0) return;
  clearHint();
  if (!state.selected) { state.selected = { r, c }; renderBoard(); scheduleHint(); return; }
  const second = { r, c };
  if (state.selected.r === r && state.selected.c === c) { state.selected = null; renderBoard(); scheduleHint(); return; }
  if (!adjacent(state.selected, second)) { state.selected = second; renderBoard(); scheduleHint(); return; }
  const first = state.selected;
  state.selected = null;
  state.busy = true;
  swap(first, second);
  const matches = findMatches();
  state.moves -= 1;
  updateHud();
  if (!matches.size) {
    playSfx(INVALID_MATCH_SOUND, 0.72);
    renderBoard();
    await delay(190);
    swap(first, second);
    state.busy = false;
    renderBoard();
    scheduleHint();
    return;
  }
  await resolveMatches(matches);
  state.busy = false;
  if ((isCharacterMatchMode() && specialIconCount() >= specialGoal()) || (!isCharacterMatchMode() && state.score >= level().target)) {
    revealRescue();
    await delay(1250);
    showComplete();
  } else if (state.moves <= 0) showOutOfMoves();
  else scheduleHint();
}

async function resolveMatches(matches) {
  if (!matches.size) return;
  // Reward each valid match immediately and count character icons in the later-stage mode.
  const clearedBefore = Math.min(ROUNDS_PER_STAGE, Math.floor(state.score / 10));
  if (isCharacterMatchMode()) {
    matches.forEach((cell) => {
      const [r, c] = cell.split(':').map(Number);
      const type = state.board[r][c];
      if (type && state.iconCounts[type] !== undefined) state.iconCounts[type] += 1;
    });
  }
  state.score += 10;
  const clearedAfter = Math.min(ROUNDS_PER_STAGE, Math.floor(state.score / 10));
  playSfx(SHAPE_MATCH_ALERT_SOUND, 0.78);
  for (let obstacle = clearedBefore; obstacle < clearedAfter; obstacle += 1) {
    playRoundCharacterSfx(0.86);
  }
  updateHud();
  renderBoard(matches);
  await delay(230);
  matches.forEach((cell) => {
    const [r, c] = cell.split(':').map(Number);
    state.board[r][c] = null;
  });
  collapseBoard();
  renderBoard(new Set(), true);
  showScoreFeedback(matches, 10);
  await delay(230);
  const chain = findMatches();
  if (chain.size) await resolveMatches(chain);
  updateHud();
}

function collapseBoard() {
  for (let c = 0; c < COLS; c++) {
    const remaining = [];
    for (let r = ROWS - 1; r >= 0; r--) if (state.board[r][c]) remaining.push(state.board[r][c]);
    while (remaining.length < ROWS) remaining.push(randomType());
    for (let r = ROWS - 1, i = 0; r >= 0; r--, i++) state.board[r][c] = remaining[i];
  }
}

function delay(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
function startBackgroundMusic() {
  const playback = BACKGROUND_MUSIC.play();
  if (playback && typeof playback.catch === 'function') playback.catch(() => {});
}
function startIntroMusic(restart = false) {
  if (restart) INTRO_MUSIC.currentTime = 0;
  INTRO_MUSIC.volume = clampVolume(state.musicMuted ? 0 : state.musicVolume * 1.5);
  if (!INTRO_MUSIC.paused) return;
  INTRO_MUSIC.load();
  const playback = INTRO_MUSIC.play();
  if (playback && typeof playback.catch === 'function') playback.catch(() => {});
}
function stopIntroMusic() {
  INTRO_MUSIC.pause();
  INTRO_MUSIC.currentTime = 0;
}
function playSfx(sound, volume, playbackRate = 1) {
  const clip = sound.cloneNode();
  clip.volume = clampVolume(volume);
  clip.playbackRate = Math.max(0.78, Math.min(1.24, Number(playbackRate) || 1));
  if ('preservesPitch' in clip) clip.preservesPitch = false;
  const playback = clip.play();
  if (playback && typeof playback.catch === 'function') playback.catch(() => {});
}
function playCharacterSfx(sound, volume, playbackRate = 1) {
  if (state.characterSounds) playSfx(sound, volume, playbackRate);
}
function playRoundCharacterSfx(volume) {
  const currentLevel = level();
  const roundIndex = Math.max(0, Math.min(CHARACTER_ROUND_SOUNDS.length - 1, currentLevel.stageRound - 1));
  // Rotate the ten round cues per stage so a stage never repeats its cue across rounds.
  const soundIndex = (roundIndex + currentLevel.stage - 1) % CHARACTER_ROUND_SOUNDS.length;
  const roundSound = CHARACTER_ROUND_SOUNDS[soundIndex];
  const roundRate = 0.9 + roundIndex * 0.03;
  const stageSound = CHARACTER_STAGE_SOUNDS[currentLevel.stage];

  if (stageSound) {
    // Special characters keep their signature sound, while the round cue changes every round.
    playCharacterSfx(roundSound, volume * 0.62, roundRate);
    playCharacterSfx(stageSound, volume * 0.32, 0.86 + roundIndex * 0.035);
    return;
  }
  playCharacterSfx(roundSound, volume, roundRate);
}
function showScoreFeedback(matches, points) {
  if (!matches.size) return;
  const cells = [...matches].map((cell) => cell.split(':').map(Number));
  const row = cells.reduce((sum, [r]) => sum + r, 0) / cells.length;
  const col = cells.reduce((sum, [, c]) => sum + c, 0) / cells.length;
  const feedback = document.createElement('div');
  feedback.className = 'match-feedback';
  feedback.textContent = `+${points}`;
  feedback.setAttribute('aria-label', state.language === 'ar' ? `تم كسب ${points} نقطة` : `${points} points earned`);
  feedback.style.left = `${((col + 0.5) / COLS) * 100}%`;
  feedback.style.top = `${((row + 0.5) / ROWS) * 100}%`;
  boardEl.appendChild(feedback);
  window.setTimeout(() => feedback.remove(), 760);
}
function revealRescue() {
  if (!level().image) return;
  $('castleScene').classList.add('rescued');
  $('aideWalker').classList.add('revealed');
  $('rescueSpeech').setAttribute('aria-hidden', 'false');
  $('wallOpening').setAttribute('aria-hidden', 'false');
}

function resetRescueReveal() {
  $('castleScene').classList.remove('rescued');
  $('aideWalker').classList.remove('revealed');
  $('rescueSpeech').setAttribute('aria-hidden', 'true');
  $('wallOpening').setAttribute('aria-hidden', 'true');
}

function renderCompletedStageCharacters() {
  const container = $('completedStageCharacters');
  if (!container) return;
  const completedStages = Array.from({ length: STAGE_COUNT }, (_, stageIndex) => stageIndex + 1)
    .filter((stage) => {
      const firstRoundIndex = (stage - 1) * ROUNDS_PER_STAGE;
      return Array.from({ length: ROUNDS_PER_STAGE }, (_, roundIndex) => state.completed.has(firstRoundIndex + roundIndex)).every(Boolean);
    });
  container.innerHTML = completedStages.map((stage) => {
    const characters = STAGE_CHARACTERS[stage - 1].map((characterKey) => CHARACTER_CONFIG[characterKey]);
    const stageName = stageLabel(stage);
    const memberNames = characters.map((character) => state.language === 'ar' ? character.aideAr : character.aide);
    return `<div class="completed-stage-entry" title="${stageName}" aria-label="${stageName}: ${memberNames.join('، ')}"><span class="completed-stage-number">${stageName}</span><div class="completed-stage-members">${characters.map((character) => {
      const name = state.language === 'ar' ? character.aideAr : character.aide;
      return `<div class="completed-stage-member"><img src="${ASSET_ROOT + character.image}" alt="${name}" loading="lazy" /><span>${name}</span></div>`;
    }).join('')}</div></div>`;
  }).join('');
  container.classList.toggle('hidden', completedStages.length === 0);
  container.setAttribute('aria-label', state.language === 'ar'
    ? `شخصيات المراحل المكتملة: ${completedStages.map((stage) => stageLabel(stage)).join('، ') || 'لا توجد'}`
    : `Characters from completed stages: ${completedStages.map((stage) => stageLabel(stage)).join(', ') || 'none'}`);
}

function updateEscapePath() {
  const cleared = Math.min(ROUNDS_PER_STAGE, Math.floor(state.score / 10));
  const item = level();
  const currentObstacleLabel = obstacleLabel(item);
  document.querySelectorAll('.obstacle').forEach((block) => {
    const obstacleIndex = Number(block.dataset.block);
    const characterImage = block.querySelector('.trump-image');
    block.classList.toggle('character-obstacle', Boolean(item.image));
    block.classList.toggle('trump', item.obstacle === 'trump');
    block.classList.toggle('vance', item.obstacle === 'vance');
    block.classList.toggle('hegseth', item.obstacle === 'hegseth');
    block.classList.toggle('rubio', item.obstacle === 'rubio');
    block.classList.toggle('witkoff', item.obstacle === 'witkoff');
    block.classList.toggle('kushner', item.obstacle === 'kushner');
    block.classList.toggle('wire-trap', item.obstacle === 'wire-trap');
    block.classList.toggle('removed', obstacleIndex < cleared);
    block.setAttribute('aria-hidden', obstacleIndex < cleared ? 'true' : 'false');
    block.setAttribute('aria-label', state.language === 'ar'
      ? `${currentObstacleLabel} ${obstacleIndex + 1} من ${ROUNDS_PER_STAGE}`
      : `${currentObstacleLabel}, ${obstacleIndex + 1} of ${ROUNDS_PER_STAGE}`);
    if (characterImage) {
      characterImage.src = ASSET_ROOT + item.obstacleImage;
      characterImage.alt = `${currentObstacleLabel} ${obstacleIndex + 1}`;
    }
  });
  $('escapePath').setAttribute('aria-label', state.language === 'ar' ? `عشرة ${currentObstacleLabel} تحجب الجدار` : `Ten ${currentObstacleLabel.toLowerCase()} blocking the wall`);
  const walker = $('aideWalker');
  if (walker) {
    walker.style.setProperty('--walk-progress', String(cleared / ROUNDS_PER_STAGE));
    walker.setAttribute('aria-label', state.language === 'ar'
      ? `${aideName(state.level)} أزال ${cleared} من ${ROUNDS_PER_STAGE} ${currentObstacleLabel}`
      : `${aideName(state.level)} has cleared ${cleared} of ${ROUNDS_PER_STAGE} ${currentObstacleLabel.toLowerCase()}`);
  }
}
function updateHud() {
  const item = level();
  const name = aideName(state.level);
  const currentObstacleLabel = obstacleLabel(item);
  $('movesValue').textContent = state.moves;
  $('scoreValue').textContent = Math.min(state.score, item.target);
  $('missionText').textContent = isCharacterMatchMode() ? text('specialMission')(specialGoal()) : text('mission')(item.target);
  $('levelKicker').textContent = roundLabel(state.level);
  $('levelTitle').textContent = levelTitle(state.level);
  $('aideNumber').textContent = String(item.stageRound).padStart(2, '0');
  $('portraitPending').textContent = name.toUpperCase();
  $('aidePortrait').alt = name;
  const portrait = $('aidePortrait');
  if (item.image) { portrait.src = ASSET_ROOT + item.image; portrait.style.opacity = '1'; }
  else { portrait.removeAttribute('src'); portrait.style.opacity = '0'; }
  if (isCharacterMatchMode()) {
    const collected = specialIconCount();
    const counters = specialCharacterTypes().map((type) => {
      const character = CHARACTER_CONFIG[type];
      const name = state.language === 'ar' ? character.aideAr : character.aide;
      return `<div class="goal-pill character-goal-counter" title="${name}: ${state.iconCounts[type]}" aria-label="${name}: ${state.iconCounts[type]}"><img src="${ASSET_ROOT + character.image}" alt="" /><b>${state.iconCounts[type]}</b></div>`;
    }).join('');
    $('goalRow').innerHTML = `<div class="goal-pill special-goal-summary ${collected >= specialGoal() ? 'done' : ''}"><span class="goal-icon">✦</span><span>${collected}/${specialGoal()} ${text('iconCount')}</span></div>${counters}`;
  } else {
    const remainingObstacles = Math.max(0, ROUNDS_PER_STAGE - Math.floor(state.score / 10));
    const goalText = `${remainingObstacles} ${currentObstacleLabel}`;
    $('goalRow').innerHTML = `<div class="goal-pill ${state.score >= item.target ? 'done' : ''}"><span class="goal-icon score-icon">★</span><span>${Math.min(state.score, item.target)}/${item.target} ${state.language === 'ar' ? 'نقطة' : 'PTS'}</span></div><div class="goal-pill"><span class="goal-icon" style="color:#ffcb39">♛</span><span id="blocksValue">${goalText}</span></div>`;
  }
  updateEscapePath();
  renderCompletedStageCharacters();
  $('progressDots').innerHTML = Array.from({ length: STAGE_COUNT }, (_, stageIndex) => {
    const stage = stageIndex + 1;
    const stageLevels = LEVELS.filter((item) => item.stage === stage);
    const complete = stageLevels.every((_, i) => state.completed.has((stage - 1) * ROUNDS_PER_STAGE + i));
    return `<i class="${level().stage === stage ? 'current' : ''} ${complete ? 'done' : ''}" aria-label="${stageLabel(stage)}"></i>`;
  }).join('');
}

function startLevel(index = state.level, withMusic = false) {
  clearHint();
  clearTrophyTimers();
  hideTrophy(false);
  state.trophyClaims = 0;
  if (withMusic) startBackgroundMusic();
  state.level = Math.max(0, Math.min(LEVELS.length - 1, index));
  state.iconCounts = Object.fromEntries(specialCharacterTypes().map((type) => [type, 0]));
  state.board = makeBoard();
  state.selected = null;
  state.moves = level().moves;
  state.score = 0;
  state.busy = false;
  localStorage.setItem('castle-crush-level', state.level);
  resetRescueReveal();
  hideModal();
  $('levelDrawer').classList.add('hidden');
  updateHud();
  renderBoard();
  scheduleHint();
  scheduleTrophy();
}

function setCompleteModal() {
  const isFinalRound = state.level === LEVELS.length - 1;
  $('modalKicker').textContent = text('completeKicker');
  $('modalTitle').textContent = isFinalRound ? text('finalTitle') : text('gateOpen');
  $('modalMessage').textContent = isFinalRound ? text('finalMessage') : text('rescuedMessage')(aideName(state.level));
  $('modalAction').innerHTML = isFinalRound ? `${text('startRound')} <span>→</span>` : `${text('nextRound')} <span>→</span>`;
}
function setOutOfMovesModal() {
  $('modalKicker').textContent = text('tryAgain');
  $('modalTitle').textContent = text('gateLocked');
  $('modalMessage').textContent = text('movesMessage');
  $('modalAction').innerHTML = `${text('restartAction')} <span>↻</span>`;
}
function showComplete() {
  hideTrophy(false);
  notifyCrazyGamesGameplay(false);
  if (level().stage === 1 && level().stageRound === ROUNDS_PER_STAGE) {
    playCharacterSfx(TRUMP_FOLLOW_ME_SOUND, 0.96);
  }
  state.completed.add(state.level);
  localStorage.setItem('castle-crush-completed', JSON.stringify([...state.completed]));
  renderCompletedStageCharacters();
  state.modalKind = 'complete';
  setCompleteModal();
  $('modalBackdrop').classList.remove('hidden');
}
function showOutOfMoves() {
  hideTrophy(false);
  notifyCrazyGamesGameplay(false);
  state.modalKind = 'out';
  setOutOfMovesModal();
  $('modalBackdrop').classList.remove('hidden');
}
function hideModal() {
  state.modalKind = null;
  $('modalBackdrop').classList.add('hidden');
}
function resumeCrazyGamesGameplay() {
  if (state.moves > 0 && state.modalKind === null && $('startOverlay').classList.contains('hidden') && $('levelDrawer').classList.contains('hidden')) {
    notifyCrazyGamesGameplay(true);
  }
}
function updateCharacterSoundButton() {
  const button = $('characterSoundButton');
  const icon = $('characterSoundIcon');
  if (!button || !icon) return;
  const label = text(state.characterSounds ? 'characterSoundsOn' : 'characterSoundsOff');
  icon.textContent = state.characterSounds ? '🔊' : '🔇';
  button.setAttribute('aria-label', label);
  button.title = label;
  button.setAttribute('aria-pressed', String(!state.characterSounds));
}
function applyMusicVolume() {
  BACKGROUND_MUSIC.volume = clampVolume(state.musicMuted ? 0 : state.musicVolume);
  INTRO_MUSIC.volume = clampVolume(state.musicMuted ? 0 : state.musicVolume * 1.5);
}
function updateMusicControls() {
  const button = $('musicVolumeButton');
  const icon = $('musicVolumeIcon');
  const range = $('musicVolumeRange');
  if (!button || !icon || !range) return;
  const effectiveVolume = state.musicMuted ? 0 : state.musicVolume;
  icon.textContent = effectiveVolume === 0 ? '🔇' : effectiveVolume < 0.5 ? '🔉' : '🔊';
  range.value = String(state.musicVolume);
  range.setAttribute('aria-label', text('musicVolume'));
  button.setAttribute('aria-label', text(state.musicMuted ? 'musicUnmute' : 'musicMute'));
  button.title = text(state.musicMuted ? 'musicUnmute' : 'musicMute');
  button.setAttribute('aria-pressed', String(state.musicMuted));
}
function updateTrophyButton() {
  const button = $('trophyButton');
  const count = $('trophyCount');
  if (!button || !count) return;
  count.textContent = String(state.trophyClaims);
  button.setAttribute('aria-label', text('trophyReady'));
  button.title = text('trophyReady');
}
function getFullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || null;
}
function updateFullscreenControl() {
  const button = $('fullscreenButton');
  const icon = $('fullscreenIcon');
  if (!button || !icon) return;
  const active = Boolean(getFullscreenElement());
  icon.textContent = active ? '×' : '⛶';
  button.setAttribute('aria-label', text(active ? 'fullscreenClose' : 'fullscreenOpen'));
  button.title = text(active ? 'fullscreenClose' : 'fullscreenOpen');
  button.setAttribute('aria-pressed', String(active));
}
async function toggleFullscreen() {
  try {
    if (getFullscreenElement()) {
      if (typeof document.exitFullscreen === 'function') await document.exitFullscreen();
      else if (typeof document.webkitExitFullscreen === 'function') document.webkitExitFullscreen();
    } else {
      const shell = $('gameShell');
      if (typeof shell.requestFullscreen === 'function') await shell.requestFullscreen();
      else if (typeof shell.webkitRequestFullscreen === 'function') shell.webkitRequestFullscreen();
    }
  } catch (_) {
    // Fullscreen can be denied by browser or embedding policy; keep the game usable.
  }
  updateFullscreenControl();
}

$('musicVolumeButton').addEventListener('click', () => {
  state.musicMuted = !state.musicMuted;
  if (!state.musicMuted && state.musicVolume === 0) state.musicVolume = MUSIC_DEFAULT_VOLUME;
  localStorage.setItem('castle-crush-music-muted', state.musicMuted ? 'on' : 'off');
  localStorage.setItem('castle-crush-music-volume', String(state.musicVolume));
  applyMusicVolume();
  updateMusicControls();
});
$('musicVolumeRange').addEventListener('input', (event) => {
  state.musicVolume = clampVolume(Number(event.target.value));
  state.musicMuted = state.musicVolume === 0;
  localStorage.setItem('castle-crush-music-volume', String(state.musicVolume));
  localStorage.setItem('castle-crush-music-muted', state.musicMuted ? 'on' : 'off');
  applyMusicVolume();
  updateMusicControls();
});
$('characterSoundButton').addEventListener('click', () => {
  state.characterSounds = !state.characterSounds;
  localStorage.setItem('castle-crush-character-sounds', state.characterSounds ? 'on' : 'off');
  updateCharacterSoundButton();
});
$('trophyButton').addEventListener('click', claimTrophy);
$('fullscreenButton').addEventListener('click', toggleFullscreen);
document.addEventListener('fullscreenchange', updateFullscreenControl);
document.addEventListener('webkitfullscreenchange', updateFullscreenControl);
$('resetButton').addEventListener('click', () => startLevel(state.level, true));
$('languageButton').addEventListener('click', () => {
  state.language = state.language === 'ar' ? 'en' : 'ar';
  localStorage.setItem('castle-crush-language', state.language);
  applyLanguage();
});
$('modalClose').addEventListener('click', () => { hideModal(); resumeCrazyGamesGameplay(); });
$('modalAction').addEventListener('click', () => {
  if (state.moves <= 0 && !state.completed.has(state.level)) startLevel(state.level, true);
  else if (state.level === LEVELS.length - 1) startLevel(0, true);
  else startLevel((state.level + 1) % LEVELS.length, true);
  resumeCrazyGamesGameplay();
});
$('levelsButton').addEventListener('click', () => {
  hideTrophy(false);
  notifyCrazyGamesGameplay(false);
  renderLevelList();
  $('levelDrawer').classList.remove('hidden');
});
$('drawerClose').addEventListener('click', () => {
  $('levelDrawer').classList.add('hidden');
  resumeCrazyGamesGameplay();
});
$('modalBackdrop').addEventListener('click', (event) => {
  if (event.target === $('modalBackdrop')) { hideModal(); resumeCrazyGamesGameplay(); }
});
$('cinematicSkip').addEventListener('click', finishCinematicIntro);
$('startPlayButton').addEventListener('click', () => {
  startLevel(state.startSelection, true);
  $('startOverlay').classList.add('hidden');
  scheduleHint();
  notifyCrazyGamesGameplay(true);
});
document.addEventListener('pointerdown', handleIntroAudioUnlock, { passive: true });
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') finishCinematicIntro();
  else handleIntroAudioUnlock();
});

function renderLevelList() {
  $('levelList').innerHTML = Array.from({ length: STAGE_COUNT }, (_, stageIndex) => {
    const stage = stageIndex + 1;
    const cards = LEVELS.map((item, i) => item.stage === stage
      ? `<button class="level-card ${i === state.level ? 'current' : ''} ${state.completed.has(i) ? 'done' : ''}" data-level="${i}"><span class="level-round-label">${roundLabel(i)}</span><small>${levelTitle(i)}</small><em>${state.completed.has(i) ? text('cleared') : text('pointsGoal')}</em></button>`
      : '').join('');
    return `<div class="level-stage-label">${stageLabel(stage)} <small>${state.language === 'ar' ? `${ROUNDS_PER_STAGE} جولات` : `${ROUNDS_PER_STAGE} rounds`}</small></div>${cards}`;
  }).join('');
  $('levelList').querySelectorAll('[data-level]').forEach((button) => button.addEventListener('click', () => startLevel(Number(button.dataset.level), true)));
}

function updateStartSelection() {
  const item = LEVELS[state.startSelection];
  if (!item) return;
  $('startSelectedLabel').textContent = text('selectedStage')(stageLabel(item.stage));
  $('startPlayButton').innerHTML = `${text('play')} <span>→</span>`;
  $('startPlayButton').setAttribute('aria-label', text('play'));
}

function renderStartPicker() {
  $('startLevelList').innerHTML = Array.from({ length: STAGE_COUNT }, (_, stageIndex) => {
    const stage = stageIndex + 1;
    const firstRoundIndex = stageIndex * ROUNDS_PER_STAGE;
    const selected = firstRoundIndex === state.startSelection;
    return `<button class="start-level-button ${selected ? 'selected' : ''}" data-start-level="${firstRoundIndex}" aria-pressed="${selected}"><span class="start-stage-number">${String(stage).padStart(2, '0')}</span><span class="start-stage-name">${stageLabel(stage)}</span></button>`;
  }).join('');
  $('startLevelList').querySelectorAll('[data-start-level]').forEach((button) => button.addEventListener('click', () => {
    state.startSelection = Number(button.dataset.startLevel);
    renderStartPicker();
  }));
  updateStartSelection();
}

function showStartPicker() {
  state.startSelection = Math.floor(state.level / ROUNDS_PER_STAGE) * ROUNDS_PER_STAGE;
  renderStartPicker();
  $('startOverlay').classList.remove('hidden');
}

let cinematicTimer = null;
function finishCinematicIntro() {
  const intro = $('cinematicIntro');
  if (intro.classList.contains('hidden')) return;
  if (cinematicTimer !== null) {
    window.clearTimeout(cinematicTimer);
    cinematicTimer = null;
  }
  stopIntroMusic();
  intro.classList.add('is-exiting');
  window.setTimeout(() => {
    intro.classList.add('hidden');
    intro.classList.remove('is-exiting');
    showStartPicker();
  }, 540);
}
function showCinematicIntro() {
  renderStartPicker();
  $('startOverlay').classList.add('hidden');
  const intro = $('cinematicIntro');
  intro.classList.remove('hidden', 'is-exiting');
  startIntroMusic(true);
  cinematicTimer = window.setTimeout(finishCinematicIntro, 4300);
}
function handleIntroAudioUnlock() {
  if (!$('cinematicIntro').classList.contains('hidden')) startIntroMusic();
}

function applyLanguage() {
  const isArabic = state.language === 'ar';
  document.documentElement.lang = state.language;
  document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
  document.title = isArabic ? 'قلعة المطابقة: إنقاذ الشخصيات' : 'Castle Crush: Aide Escape';
  $('cinematicKicker').textContent = text('cinematicKicker');
  $('cinematicTitle').innerHTML = isArabic ? 'قلعة <span>المطابقة</span>' : 'CASTLE <span>CRUSH</span>';
  $('cinematicTagline').textContent = text('cinematicTagline');
  $('cinematicSkip').textContent = text('skipIntro');
  $('gameShell').setAttribute('aria-label', text('gameLabel'));
  $('castleScene').setAttribute('aria-label', text('sceneLabel'));
  $('boardSection').setAttribute('aria-label', text('boardLabel'));
  $('board').setAttribute('aria-label', text('puzzleLabel'));
  $('rescueSpeech').textContent = text('help');
  $('aideLabel').textContent = isArabic ? 'مساعد' : 'AIDE';
  $('pointsLabel').textContent = text('points');
  $('movesLabel').textContent = text('moves');
  $('boardTipText').textContent = isCharacterMatchMode() ? text('specialTip') : text('tip');
  $('boardMatchText').textContent = isCharacterMatchMode() ? text('specialMatch') : text('match');
  $('levelsLabel').textContent = text('levels');
  $('restartLabel').textContent = text('restart');
  $('levelsButton').setAttribute('aria-label', text('chooseLevel'));
  $('resetButton').setAttribute('aria-label', text('restartLevel'));
  $('languageIcon').textContent = isArabic ? 'EN' : 'ع';
  $('languageButton').setAttribute('aria-label', text('switchTo'));
  updateCharacterSoundButton();
  updateMusicControls();
  updateTrophyButton();
  updateFullscreenControl();
  $('musicControl').setAttribute('aria-label', text('musicVolume'));
  $('languageButton').title = text('switchTo');
  $('modalClose').setAttribute('aria-label', isArabic ? 'إغلاق' : 'Close');
  $('drawerTitle').textContent = text('castleMap');
  $('drawerCopy').textContent = text('chooseReplay');
  $('drawerClose').setAttribute('aria-label', text('closeLevels'));
  $('startKicker').textContent = text('startKicker');
  $('startTitle').textContent = text('startTitle');
  $('startCopy').textContent = text('startCopy');
  updateHud();
  updateStartSelection();
  renderLevelList();
  if (state.modalKind === 'complete') setCompleteModal();
  if (state.modalKind === 'out') setOutOfMovesModal();
  if (!$('startOverlay').classList.contains('hidden')) renderStartPicker();
}

startLevel();
applyLanguage();
showCinematicIntro();
initializeCrazyGamesSdk();
