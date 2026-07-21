export interface SampleConversation {
  id: string;
  title: string;
  lines: { speaker: string; arabic: string; transliteration: string; english: string }[];
}

/** Native-style example conversations used for listening practice in the El Oued track. */
export const ELOUED_CONVERSATIONS: SampleConversation[] = [
  {
    id: 'eloued_conv_market',
    title: 'At the date market',
    lines: [
      { speaker: 'Buyer', arabic: 'السلام عليكم، بشحال هذا التمر؟', transliteration: 'es-salamu εlaykum, beshhal hada et-temr?', english: 'Peace be with you, how much are these dates?' },
      { speaker: 'Seller', arabic: 'وعليكم السلام، هذا بخمسمية دينار الكيلو.', transliteration: 'w-εlaykum es-salam, hada b-khamsmiya dinar el-kilo.', english: 'And peace with you, this is 500 dinars a kilo.' },
      { speaker: 'Buyer', arabic: 'غالي بزّاف، نقّصلي شوية.', transliteration: 'ghali bezzaf, naqqasli shwiya.', english: "That's very expensive, give me a discount." },
      { speaker: 'Seller', arabic: 'باهي، نعطيك بأربعمية، خاطر نتا زبون قديم.', transliteration: 'bahi, naʿtik b-arbaʿmiya, khater nta zbun qadim.', english: "Okay, I'll give it to you for 400, since you're an old customer." },
      { speaker: 'Buyer', arabic: 'الله يعطيك الصحة.', transliteration: 'allah yaʿtik es-saha.', english: 'God give you health (thank you).' },
    ],
  },
  {
    id: 'eloued_conv_family',
    title: 'Calling grandmother',
    lines: [
      { speaker: 'Grandchild', arabic: 'السلام عليكم يا يمّا الجدّة، كيراكي؟', transliteration: 'es-salamu εlaykum ya yemma el-jedda, kiraki?', english: 'Peace be with you grandmother, how are you?' },
      { speaker: 'Grandmother', arabic: 'لاباس يا الغالي، الحمد لله. وينك ما جيتش من زمان.', transliteration: 'labas ya l-ghali, el-hamdulillah. winek ma jitsh min zman.', english: "I'm fine dear, thank God. Where have you been, you haven't visited in a long time." },
      { speaker: 'Grandchild', arabic: 'سامحيني، راني في الخدمة بزّاف. غادي نجي هذا الويكاند إن شاء الله.', transliteration: 'samhini, rani fi el-khedma bezzaf. ghadi neji hada el-weekend in sha allah.', english: "Forgive me, I've been very busy with work. I'll come this weekend, God willing." },
      { speaker: 'Grandmother', arabic: 'باهي يا ولدي، راني نستناك.', transliteration: 'bahi ya weldi, rani nastanak.', english: "Good my son, I'll be waiting for you." },
    ],
  },
  {
    id: 'eloued_conv_ramadan',
    title: 'Breaking the fast together',
    lines: [
      { speaker: 'Host', arabic: 'مرحبا بيك، رمضان مبارك! اقعد نتفطرو مع بعض.', transliteration: 'marhba bik, ramadan mubarak! eqεad natftaru maε baεd.', english: "Welcome, blessed Ramadan! Sit, let's break the fast together." },
      { speaker: 'Guest', arabic: 'الله يبارك فيك. شكون طيّب الشّهرية؟ ريحتها بنينة.', transliteration: 'allah ybarek fik. shkun tayyeb esh-shhriya? rihetha bnina.', english: 'God bless you. Who cooked the soup? It smells delicious.' },
      { speaker: 'Host', arabic: 'يمّا هي اللي طيّبتها، صحّيت.', transliteration: 'yemma hi elli tayyebtha, sahhit.', english: 'My mother cooked it, bon appétit.' },
    ],
  },
];
