import { DIALECTS } from './dialectMeta';
import type { DialectId, Story } from '@/types';

export const STORIES: Story[] = [
  // ============================ EL OUED (flagship) ============================
  {
    id: 'story_market',
    title: 'Shopping for Dates in the Souf Market',
    titleArabic: 'شرا التّمر في سوق السّوف',
    description: 'Practice haggling and market vocabulary as you shop for dates in El Oued.',
    coverImage: 'market',
    dialectId: 'algerian_eloued',
    isPremium: false,
    startNodeId: 'n1',
    nodes: [
      {
        id: 'n1',
        speaker: 'Vendor',
        textArabic: 'مرحبا بيك! واش حاب تشري اليوم؟',
        textTransliteration: 'marhba bik! wash hab teshri lyoum?',
        textEnglish: 'Welcome! What would you like to buy today?',
        vocabHighlights: ['eloued_market_5'],
        choices: [
          { id: 'c1', textArabic: 'نحب نشري تمر', textEnglish: 'I want to buy dates', nextNodeId: 'n2', isCorrect: true },
          { id: 'c2', textArabic: 'نحب نبيع تمر', textEnglish: 'I want to sell dates', nextNodeId: 'n2_wrong' },
        ],
      },
      {
        id: 'n2',
        speaker: 'Vendor',
        textArabic: 'باهي! عندي أحسن تمر في الوادي. بشحال تحب؟',
        textTransliteration: 'bahi! ʿandi ahsen temr fi el-wadi. beshhal tehb?',
        textEnglish: 'Great! I have the best dates in El Oued. How much do you want?',
        vocabHighlights: ['eloued_market_4'],
        choices: [
          { id: 'c3', textArabic: 'كيلو وحدة، من فضلك', textEnglish: 'One kilo, please', nextNodeId: 'n3', isCorrect: true },
          { id: 'c3b', textArabic: 'برشا، عشر كيلو', textEnglish: 'A lot — ten kilos', nextNodeId: 'n3' },
        ],
      },
      {
        id: 'n2_wrong',
        speaker: 'Vendor',
        textArabic: 'هاها، ماكانش عندك تمر باش تبيع! جرّب مرّة أخرى.',
        textTransliteration: 'haha, makansh ʿandek temr bash tbiʿ! jarreb marra okhra.',
        textEnglish: "Haha, you don't have dates to sell! Try again.",
        choices: [{ id: 'c_retry', textArabic: 'نحب نشري تمر', textEnglish: 'I want to buy dates', nextNodeId: 'n2', isCorrect: true }],
      },
      {
        id: 'n3',
        speaker: 'Vendor',
        textArabic: 'هذا بخمسمية دينار.',
        textTransliteration: 'hada b-khamsmiya dinar.',
        textEnglish: 'That will be 500 dinars.',
        choices: [
          { id: 'c4', textArabic: 'غالي بزّاف، نقّصلي شوية', textEnglish: "That's expensive, give me a discount", nextNodeId: 'n4', isCorrect: true },
          { id: 'c5', textArabic: 'باهي، هاك الفلوس', textEnglish: "Okay, here's the money", nextNodeId: 'n_end_full_price' },
        ],
      },
      {
        id: 'n4',
        speaker: 'Vendor',
        textArabic: 'باهي، خاطرك زبون لطيف، نعطيك بأربعمية.',
        textTransliteration: 'bahi, khatrek zbun latif, naʿtik b-arbaʿmiya.',
        textEnglish: "Fine, since you're a nice customer, I'll give it to you for 400.",
        choices: [{ id: 'c6', textArabic: 'الله يعطيك الصحة!', textEnglish: 'Thank you (God give you health)!', nextNodeId: 'n_end_discount', isCorrect: true }],
      },
      {
        id: 'n_end_discount',
        speaker: 'Narrator',
        textArabic: 'اشتريت التّمر بسعر حسن، مبروك!',
        textTransliteration: "eshtreyt et-temr b-seʿr hasan, mabruk!",
        textEnglish: 'You bought the dates at a good price, congratulations!',
        isEnding: true,
      },
      {
        id: 'n_end_full_price',
        speaker: 'Narrator',
        textArabic: 'خلّصت الثّمن الكامل — في المرّة الجّاية حاول تفاوض!',
        textTransliteration: "khallast eth-thaman el-kamel — fi el-marra ej-jaya hawel tfawed!",
        textEnglish: 'You paid full price — next time try negotiating!',
        isEnding: true,
      },
    ],
  },
  {
    id: 'story_taxi',
    title: 'Taking a Taxi Across El Oued',
    titleArabic: 'الطّاكسي في الوادي',
    description: 'Order a taxi, give your destination, and chat with the driver.',
    coverImage: 'taxi',
    dialectId: 'algerian_eloued',
    isPremium: false,
    startNodeId: 't1',
    nodes: [
      {
        id: 't1',
        speaker: 'Driver',
        textArabic: 'أهلا، غادي لوين؟',
        textTransliteration: 'ahla, ghadi lwin?',
        textEnglish: 'Hi, where are you headed?',
        choices: [
          { id: 't_c1', textArabic: 'للسّوق من فضلك', textEnglish: 'To the market please', nextNodeId: 't2', isCorrect: true },
          { id: 't_c1b', textArabic: 'ما نعرفش، وينك رايح؟', textEnglish: "I don't know, where are you going?", nextNodeId: 't1_wrong' },
        ],
      },
      {
        id: 't1_wrong',
        speaker: 'Driver',
        textArabic: 'أنا نمشي وين تحب أنت! قوللي الوجهة.',
        textTransliteration: 'ana nemshi win theb enta! qulli el-wejha.',
        textEnglish: 'I go wherever you want! Tell me the destination.',
        choices: [{ id: 't_retry', textArabic: 'للسّوق من فضلك', textEnglish: 'To the market please', nextNodeId: 't2', isCorrect: true }],
      },
      {
        id: 't2',
        speaker: 'Driver',
        textArabic: 'باهي، اركب. بشحال معاك وقت؟',
        textTransliteration: 'bahi, erkeb. beshhal maʿak weqt?',
        textEnglish: 'Okay, hop in. How much time do you have?',
        choices: [
          { id: 't_c2', textArabic: 'عندي وقت بزّاف', textEnglish: 'I have plenty of time', nextNodeId: 't3', isCorrect: true },
          { id: 't_c2b', textArabic: 'راني مستعجل، يرحم والديك', textEnglish: "I'm in a hurry, please", nextNodeId: 't3' },
        ],
      },
      {
        id: 't3',
        speaker: 'Driver',
        textArabic: 'وصلنا! هذا بمية دينار.',
        textTransliteration: 'wselna! hada b-miya dinar.',
        textEnglish: "We've arrived! That's 100 dinars.",
        choices: [{ id: 't_c3', textArabic: 'شكرا، بالسّلامة', textEnglish: 'Thanks, goodbye', nextNodeId: 't_end', isCorrect: true }],
      },
      {
        id: 't_end',
        speaker: 'Narrator',
        textArabic: 'وصلت للسّوق بسلامة!',
        textTransliteration: 'wselt lessuq b-slama!',
        textEnglish: 'You arrived at the market safely!',
        isEnding: true,
      },
    ],
  },
  {
    id: 'story_eloued_cafe',
    title: 'Coffee at a Souf Café',
    titleArabic: 'قهوة في مقهى السّوف',
    description: 'Order a coffee, make small talk, and settle the bill like a local.',
    coverImage: 'cafe',
    dialectId: 'algerian_eloued',
    isPremium: false,
    startNodeId: 'k1',
    nodes: [
      {
        id: 'k1',
        speaker: 'Café owner',
        textArabic: 'صباح الخير! واش نجيبلك؟',
        textTransliteration: 'sbah el-khir! wash njiblek?',
        textEnglish: 'Good morning! What can I get you?',
        choices: [
          { id: 'k_c1', textArabic: 'قهوة قهوة، بلا سكر', textEnglish: 'A black coffee, no sugar', nextNodeId: 'k2', isCorrect: true },
          { id: 'k_c2', textArabic: 'ما نحبش القهوة', textEnglish: "I don't like coffee", nextNodeId: 'k2_tea' },
        ],
      },
      {
        id: 'k2',
        speaker: 'Café owner',
        textArabic: 'على راسي. حاب معاها كسرة؟',
        textTransliteration: 'ʿla rasi. hab mʿaha kesra?',
        textEnglish: 'With pleasure. Want some bread with it?',
        choices: [
          { id: 'k_c3', textArabic: 'إيه، برك شوية', textEnglish: 'Yes, just a little', nextNodeId: 'k3', isCorrect: true },
          { id: 'k_c4', textArabic: 'لا شكرا، القهوة برك', textEnglish: 'No thanks, just the coffee', nextNodeId: 'k3', isCorrect: true },
        ],
      },
      {
        id: 'k2_tea',
        speaker: 'Café owner',
        textArabic: 'ما عليش، نديرلك أتاي بالنّعناع؟',
        textTransliteration: 'ma ʿlish, ndirlek atay b-en-neʿnaʿ?',
        textEnglish: 'No problem, shall I make you mint tea?',
        choices: [{ id: 'k_c_tea', textArabic: 'إيه، أتاي يكون باهي', textEnglish: 'Yes, tea would be great', nextNodeId: 'k3', isCorrect: true }],
      },
      {
        id: 'k3',
        speaker: 'Café owner',
        textArabic: 'صحّة! هذا بأربعين دينار.',
        textTransliteration: 'saha! hada b-arbʿin dinar.',
        textEnglish: 'Enjoy! That will be 40 dinars.',
        choices: [{ id: 'k_c5', textArabic: 'هاك، الله يبارك فيك', textEnglish: 'Here you go, thank you', nextNodeId: 'k_end', isCorrect: true }],
      },
      {
        id: 'k_end',
        speaker: 'Narrator',
        textArabic: 'قعدت تشرب قهوتك وتتفرّج على النّاس في السّوق. يوم هادي!',
        textTransliteration: "gʿadt teshreb qahwtek w-tetfarrej ʿla en-nas fi es-suq. yum hadi!",
        textEnglish: 'You sat sipping your coffee, watching the market go by. A calm day!',
        isEnding: true,
      },
    ],
  },

  // ============================ ALGIERS ============================
  {
    id: 'story_algiers_directions',
    title: 'Finding Your Way in Algiers',
    titleArabic: 'نلقى الطّريق في الجزاير',
    description: 'Ask a passerby for directions to the Martyrs’ Memorial and get there.',
    coverImage: 'city',
    dialectId: 'algerian_algiers',
    isPremium: false,
    startNodeId: 'a1',
    nodes: [
      {
        id: 'a1',
        speaker: 'Passerby',
        textArabic: 'أهلا، تحوّس على واش؟',
        textTransliteration: 'ahla, thawwes ʿla wash?',
        textEnglish: 'Hi, what are you looking for?',
        choices: [
          { id: 'a_c1', textArabic: 'وين مقام الشّهيد من فضلك؟', textEnglish: "Where's the Martyrs' Memorial please?", nextNodeId: 'a2', isCorrect: true },
          { id: 'a_c2', textArabic: 'نحوّس على البحر', textEnglish: "I'm looking for the sea", nextNodeId: 'a2_sea' },
        ],
      },
      {
        id: 'a2',
        speaker: 'Passerby',
        textArabic: 'آه، قريب! امشي نيشان و دور على اليمين.',
        textTransliteration: 'ah, qrib! emshi nishan w dor ʿla el-imin.',
        textEnglish: 'Ah, close by! Go straight and turn right.',
        choices: [
          { id: 'a_c3', textArabic: 'نمشي بالكار ولا بالقدم؟', textEnglish: 'Should I take the bus or walk?', nextNodeId: 'a3', isCorrect: true },
          { id: 'a_c4', textArabic: 'شحال يبعد؟', textEnglish: 'How far is it?', nextNodeId: 'a3' },
        ],
      },
      {
        id: 'a2_sea',
        speaker: 'Passerby',
        textArabic: 'البحر لتحت، بصّح مقام الشّهيد أحسن للزّيارة اليوم!',
        textTransliteration: 'el-bhar l-teht, bsah maqam esh-shahid ahsen lezziyara lyoum!',
        textEnglish: "The sea is downhill, but the Memorial is better to visit today!",
        choices: [{ id: 'a_retry', textArabic: 'باهي، نمشي لمقام الشّهيد', textEnglish: "Okay, I'll go to the Memorial", nextNodeId: 'a2', isCorrect: true }],
      },
      {
        id: 'a3',
        speaker: 'Passerby',
        textArabic: 'بالقدم برك، خمس دقايق و توصل. تشوفو من بعيد.',
        textTransliteration: 'bel-qdem berk, khams dqayeq w twsel. tshufu men bʿid.',
        textEnglish: "On foot — five minutes and you're there. You'll see it from afar.",
        choices: [{ id: 'a_c5', textArabic: 'شكرا بزّاف، صحّيت', textEnglish: 'Thank you so much', nextNodeId: 'a_end', isCorrect: true }],
      },
      {
        id: 'a_end',
        speaker: 'Narrator',
        textArabic: 'لقيت مقام الشّهيد يطلّ على الجزاير العاصمة كلّها. منظر خلّاب!',
        textTransliteration: 'lqit maqam esh-shahid ytell ʿla el-jazayer el-ʿasima kamla. mender khellab!',
        textEnglish: 'You found the Memorial overlooking all of Algiers. A stunning view!',
        isEnding: true,
      },
    ],
  },

  // ============================ EGYPTIAN ============================
  {
    id: 'story_egypt_cafe',
    title: 'At a Cairo Ahwa',
    titleArabic: 'على قهوة بلدي في القاهرة',
    description: 'Order tea, chat, and pay at a traditional Cairo coffeehouse.',
    coverImage: 'cafe',
    dialectId: 'egyptian',
    isPremium: false,
    startNodeId: 'e1',
    nodes: [
      {
        id: 'e1',
        speaker: 'Waiter',
        textArabic: 'اتفضّل يا فندم، تشرب إيه؟',
        textTransliteration: 'etfaddal ya fandem, teshrab eh?',
        textEnglish: 'Welcome sir, what will you drink?',
        choices: [
          { id: 'e_c1', textArabic: 'شاي بالنّعناع، لو سمحت', textEnglish: 'Mint tea, please', nextNodeId: 'e2', isCorrect: true },
          { id: 'e_c2', textArabic: 'عايز أنام هنا', textEnglish: 'I want to sleep here', nextNodeId: 'e1_wrong' },
        ],
      },
      {
        id: 'e1_wrong',
        speaker: 'Waiter',
        textArabic: 'هههه، دي قهوة مش فندق يا باشا! تشرب إيه؟',
        textTransliteration: 'hahaha, di ahwa mesh fondoʼ ya basha! teshrab eh?',
        textEnglish: "Haha, this is a café not a hotel, boss! What will you drink?",
        choices: [{ id: 'e_retry', textArabic: 'شاي بالنّعناع، لو سمحت', textEnglish: 'Mint tea, please', nextNodeId: 'e2', isCorrect: true }],
      },
      {
        id: 'e2',
        speaker: 'Waiter',
        textArabic: 'حاضر. تحبّ معاه شيشة؟',
        textTransliteration: 'hader. tehebb maʿah shisha?',
        textEnglish: 'Right away. Would you like a shisha with it?',
        choices: [
          { id: 'e_c3', textArabic: 'لأ، شكرًا، الشّاي بس', textEnglish: 'No thanks, just the tea', nextNodeId: 'e3', isCorrect: true },
          { id: 'e_c4', textArabic: 'آه، لو سمحت', textEnglish: 'Yes, please', nextNodeId: 'e3', isCorrect: true },
        ],
      },
      {
        id: 'e3',
        speaker: 'Waiter',
        textArabic: 'اتفضّل، الحساب عشرة جنيه.',
        textTransliteration: 'etfaddal, el-hesab ʿashara gineh.',
        textEnglish: 'Here you are — the bill is ten pounds.',
        choices: [{ id: 'e_c5', textArabic: 'اتفضّل، متشكّر', textEnglish: 'Here you go, thank you', nextNodeId: 'e_end', isCorrect: true }],
      },
      {
        id: 'e_end',
        speaker: 'Narrator',
        textArabic: 'قعدت تتفرّج على شارع القاهرة المزدحم وانت بتشرب شايك. حلو أوي!',
        textTransliteration: "aʿadt tetfarrag ʿala shareʿ el-qahira el-muzdaham w-enta beteshrab shayak. helw awi!",
        textEnglish: 'You watched the busy Cairo street while sipping your tea. Lovely!',
        isEnding: true,
      },
    ],
  },

  // ============================ PALESTINIAN ============================
  {
    id: 'story_pal_market',
    title: 'At the Nablus Market',
    titleArabic: 'في سوق نابلس',
    description: 'Buy fresh knafeh and practice friendly Palestinian small talk.',
    coverImage: 'market',
    dialectId: 'palestinian',
    isPremium: false,
    startNodeId: 'p1',
    nodes: [
      {
        id: 'p1',
        speaker: 'Vendor',
        textArabic: 'أهلين! تفضّل، الكنافة سخنة لسّة.',
        textTransliteration: 'ahlein! tfaddal, el-knafeh sokhne lessa.',
        textEnglish: "Welcome! Come, the knafeh is still hot.",
        choices: [
          { id: 'p_c1', textArabic: 'بدّي صحن كنافة، لو سمحت', textEnglish: 'I want a plate of knafeh, please', nextNodeId: 'p2', isCorrect: true },
          { id: 'p_c2', textArabic: 'بدّي كيلو بندورة', textEnglish: 'I want a kilo of tomatoes', nextNodeId: 'p1_wrong' },
        ],
      },
      {
        id: 'p1_wrong',
        speaker: 'Vendor',
        textArabic: 'هاظ محل كنافة يا زلمة، مش خضرة! جرّب كمان مرّة.',
        textTransliteration: 'haz mahall knafeh ya zalame, mesh khodra! jarreb kaman marra.',
        textEnglish: "This is a knafeh shop, not a greengrocer! Try again.",
        choices: [{ id: 'p_retry', textArabic: 'بدّي صحن كنافة، لو سمحت', textEnglish: 'I want a plate of knafeh, please', nextNodeId: 'p2', isCorrect: true }],
      },
      {
        id: 'p2',
        speaker: 'Vendor',
        textArabic: 'تكرم عينك. بتحبّها زيادة قطر؟',
        textTransliteration: 'tekram ʿeinak. bethebbha ziyade ʼater?',
        textEnglish: 'My pleasure. Would you like extra syrup?',
        choices: [
          { id: 'p_c3', textArabic: 'آه، شويّة قطر زيادة', textEnglish: 'Yes, a little extra syrup', nextNodeId: 'p3', isCorrect: true },
          { id: 'p_c4', textArabic: 'لأ، هيك تمام', textEnglish: "No, it's perfect like this", nextNodeId: 'p3', isCorrect: true },
        ],
      },
      {
        id: 'p3',
        speaker: 'Vendor',
        textArabic: 'تفضّل. بصير معك خمس شواكل.',
        textTransliteration: 'tfaddal. bsir maʿak khams shawakel.',
        textEnglish: 'Here you go. That will be five shekels.',
        choices: [{ id: 'p_c5', textArabic: 'تفضّل، يعطيك العافية', textEnglish: 'Here you go, thank you', nextNodeId: 'p_end', isCorrect: true }],
      },
      {
        id: 'p_end',
        speaker: 'Narrator',
        textArabic: 'أكلت أطيب كنافة نابلسية بحياتك. صحتين!',
        textTransliteration: 'akalt atyab knafeh nabelsiyye b-hayatak. sahtein!',
        textEnglish: 'You ate the best Nabulsi knafeh of your life. Enjoy!',
        isEnding: true,
      },
    ],
  },

  // ============================ LEVANTINE ============================
  {
    id: 'story_lev_restaurant',
    title: 'Dinner in Beirut',
    titleArabic: 'عشا في بيروت',
    description: 'Order mezze at a Beirut restaurant and compliment the food.',
    coverImage: 'restaurant',
    dialectId: 'levantine',
    isPremium: true,
    startNodeId: 'l1',
    nodes: [
      {
        id: 'l1',
        speaker: 'Waiter',
        textArabic: 'مسا الخير، شو بتحبّوا تاكلوا؟',
        textTransliteration: 'masa el-kheir, shu bethebbou taklou?',
        textEnglish: 'Good evening, what would you like to eat?',
        choices: [
          { id: 'l_c1', textArabic: 'بدّنا مازة متنوّعة، لو سمحت', textEnglish: 'We want a mixed mezze, please', nextNodeId: 'l2', isCorrect: true },
          { id: 'l_c2', textArabic: 'شو بتنصحنا فيه؟', textEnglish: 'What do you recommend?', nextNodeId: 'l2', isCorrect: true },
        ],
      },
      {
        id: 'l2',
        speaker: 'Waiter',
        textArabic: 'اختيار موفّق! بتحبّوا حمّص وتبّولة وكبّة؟',
        textTransliteration: 'ekhtiyar mwaffaʼ! bethebbou hommos w-tabbouleh w-kebbe?',
        textEnglish: 'Great choice! Would you like hummus, tabbouleh and kibbeh?',
        choices: [
          { id: 'l_c3', textArabic: 'آه، وكمان بابا غنّوج', textEnglish: 'Yes, and baba ghanoush too', nextNodeId: 'l3', isCorrect: true },
          { id: 'l_c4', textArabic: 'بلا كبّة، شكرًا', textEnglish: 'Without kibbeh, thanks', nextNodeId: 'l3', isCorrect: true },
        ],
      },
      {
        id: 'l3',
        speaker: 'Waiter',
        textArabic: 'صحتين! كيف لقيتوا الأكل؟',
        textTransliteration: 'sahtein! kif laʼitou el-akel?',
        textEnglish: 'Enjoy! How did you find the food?',
        choices: [
          { id: 'l_c5', textArabic: 'كتير طيّب، يسلمو إيديك', textEnglish: 'Very delicious, bless your hands', nextNodeId: 'l_end', isCorrect: true },
          { id: 'l_c6', textArabic: 'ماشي الحال', textEnglish: "It's okay", nextNodeId: 'l_end' },
        ],
      },
      {
        id: 'l_end',
        speaker: 'Narrator',
        textArabic: 'انبسطت بأطيب عشا لبناني قدّام البحر. سهرة ما بتتنسى!',
        textTransliteration: 'enbasatt b-atyab ʿasha lebnani ʼeddam el-bahr. sahra ma btetnasa!',
        textEnglish: 'You enjoyed a wonderful Lebanese dinner by the sea. An unforgettable evening!',
        isEnding: true,
      },
    ],
  },
];

/** Stories set in a given dialect. Returns an empty list (not El Oued's) when a dialect has none yet. */
export function getStoriesForDialect(dialectId: DialectId): Story[] {
  return STORIES.filter((s) => s.dialectId === dialectId);
}

export function storyDialectName(dialectId: DialectId): string {
  return DIALECTS[dialectId]?.name ?? dialectId;
}
