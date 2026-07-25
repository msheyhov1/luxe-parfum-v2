// ════════════════════════════════════════
// DATA — product catalogue + category metadata
//
// Each product:
//   id, brand, name, vol, price (₽, integer)
//   cat[]      — any of: hits | him | her | unisex
//   badge?     — optional ribbon label
//   rating, reviews
//   notes[]    — fragrance notes (first 3 used as pyramid)
//   desc, descExtra, ingredients
//   imgs[]     — gallery images (first is the cover)
// ════════════════════════════════════════
const DEFAULT_PRODUCTS = [
  {id:1,brand:'CREED',name:'Millésime Impérial',vol:'100 мл',price:43500,cat:['hits','him','toilette'],badge:'Хит',rating:4.9,reviews:214,
   notes:['Морской бриз','Арбуз','Ирис','Мускус','Амбра'],
   desc:'Морской аромат с нотами морского бриза, арбуза и ириса. Классика парфюмерного дома Creed, созданная для настоящих знатоков элегантности. Идеален для тёплых летних дней и вечерних выходов.',
   descExtra:'Парфюм создан в традициях ручного производства, которому уже более 260 лет. Каждый флакон наполнен вручную и прошёл строгий контроль качества.',
   ingredients:'ALCOHOL DENAT., PARFUM (FRAGRANCE), AQUA (WATER), ETHYLHEXYL METHOXYCINNAMATE, BUTYL METHOXYDIBENZOYLMETHANE, BENZYL SALICYLATE, LINALOOL, CITRONELLOL, LIMONENE, COUMARIN, GERANIOL, CITRAL, EUGENOL, ISO EUGENOL, AMYL CINNAMAL.',
   imgs:['assets/img/p01.jpg','assets/img/p02.jpg','assets/img/p07.jpg','assets/img/p19.jpg']},
  {id:2,brand:'TOM FORD',name:'Oud Wood',vol:'100 мл',price:28000,cat:['hits','unisex','toilette','sale'],badge:'−15%',rating:4.7,reviews:189,
   notes:['Уд-дерево','Розовый перец','Сандал','Ваниль','Тобакко'],
   desc:'Редкое уд-дерево, розовый перец и ваниль создают чувственный и загадочный аромат, который невозможно забыть.',
   descExtra:'Один из самых узнаваемых ароматов Tom Ford, воплощающий восточную роскошь в современном прочтении.',
   ingredients:'ALCOHOL DENAT., PARFUM (FRAGRANCE), AQUA (WATER), AGARWOOD OIL, SANDALWOOD OIL, VANILLA PLANIFOLIA FRUIT EXTRACT, ROSA DAMASCENA FLOWER OIL, PIPER NIGRUM FRUIT OIL, COUMARIN, BENZYL BENZOATE, LINALOOL, LIMONENE.',
   imgs:['assets/img/p02.jpg','assets/img/p03.jpg','assets/img/p13.jpg','assets/img/p20.jpg']},
  {id:3,brand:'AMOUAGE',name:'Gold Man',vol:'100 мл',price:61000,cat:['him','oil'],badge:'Люкс',rating:4.8,reviews:97,
   notes:['Ладан','Мирра','Роза','Сандал','Пачули'],
   desc:'Опустошительно богатый ориентальный аромат из Омана. Ладан, мирра, роза и сандал в идеальном балансе.',
   descExtra:'Gold Man считается одним из самых дорогостоящих и сложных ароматов в мире. Его создание занимает несколько лет.',
   ingredients:'ALCOHOL DENAT., PARFUM (FRAGRANCE), AQUA (WATER), BOSWELLIA SACRA RESIN EXTRACT, COMMIPHORA MYRRHA RESIN, ROSA DAMASCENA FLOWER OIL, SANTALUM ALBUM WOOD OIL, POGOSTEMON CABLIN LEAF OIL, BENZYL BENZOATE, EUGENOL, LINALOOL.',
   imgs:['assets/img/p03.jpg','assets/img/p05.jpg','assets/img/p14.jpg','assets/img/p21.jpg']},
  {id:4,brand:'DIOR',name:'Sauvage Elixir',vol:'60 мл',price:31000,cat:['hits','him','toilette'],rating:4.9,reviews:341,
   notes:['Гвоздика','Лаванда','Сандал','Ветивер','Амбра'],
   desc:'Концентрированный элексир Sauvage — пряные ноты гвоздики, лаванды и сандала в мощном долгостойком флаконе.',
   descExtra:'Elixir — самая мощная и концентрированная версия легендарного Sauvage. Один флакон держится более 12 часов.',
   ingredients:'ALCOHOL DENAT., PARFUM (FRAGRANCE), AQUA (WATER), SYZYGIUM AROMATICUM FLOWER OIL, LAVANDULA ANGUSTIFOLIA OIL, SANTALUM SPICATUM WOOD OIL, VETIVERIA ZIZANOIDES ROOT OIL, AMBROXAN, COUMARIN, LINALOOL, LIMONENE, GERANIOL.',
   imgs:['assets/img/p05.jpg','assets/img/p06.jpg','assets/img/p15.jpg','assets/img/p24.jpg']},
  {id:5,brand:'CHANEL',name:"No. 5 L'Eau",vol:'100 мл',price:19500,cat:['hits','her','toilette','new'],badge:'Новинка',rating:4.6,reviews:528,
   notes:['Нероли','Роза','Жасмин','Иланг-иланг','Белый мускус'],
   desc:"Свежая интерпретация легендарного Chanel No. 5 — цитрусовые и цветочные ноты для современной женщины.",
   descExtra:"L'Eau — лёгкая, воздушная версия классики, переосмысленная Оливье Польжем для нового поколения.",
   ingredients:'ALCOHOL DENAT., PARFUM (FRAGRANCE), AQUA (WATER), CITRUS AURANTIUM AMARA FLOWER OIL, ROSA CENTIFOLIA FLOWER OIL, JASMINUM GRANDIFLORUM FLOWER OIL, CANANGA ODORATA FLOWER OIL, MUSK, LINALOOL, LIMONENE, BENZYL SALICYLATE, CITRONELLOL, GERANIOL.',
   imgs:['assets/img/p06.jpg','assets/img/p07.jpg','assets/img/p19.jpg','assets/img/p04.jpg']},
  {id:6,brand:'XERJOFF',name:'Naxos',vol:'100 мл',price:52000,cat:['unisex','oil','new'],badge:'Новинка',rating:4.9,reviews:76,
   notes:['Лаванда','Мёд','Табак','Ваниль','Тонка'],
   desc:'Итальянская роскошь: лаванда, мёд, табак и ваниль в непревзойдённом балансе.',
   descExtra:'Naxos назван в честь острова в Эгейском море. Воплощает средиземноморскую чувственность и итальянское мастерство.',
   ingredients:'ALCOHOL DENAT., PARFUM (FRAGRANCE), AQUA (WATER), LAVANDULA ANGUSTIFOLIA OIL, MEL (HONEY) EXTRACT, NICOTIANA TABACUM LEAF EXTRACT, VANILLA PLANIFOLIA FRUIT EXTRACT, DIPTERYX ODORATA SEED EXTRACT, COUMARIN, LINALOOL, LIMONENE.',
   imgs:['assets/img/p07.jpg','assets/img/p13.jpg','assets/img/p20.jpg','assets/img/p10.jpg']},
  {id:7,brand:'PARFUMS DE MARLY',name:'Pegasus',vol:'125 мл',price:35000,cat:['him','toilette','sale'],badge:'−10%',rating:4.7,reviews:163,
   notes:['Бергамот','Жасмин','Сандал','Ваниль','Амбра'],
   desc:'Элегантный фужерный аромат с нотами бергамота, жасмина и сандала. Воплощение аристократического французского шика.',
   descExtra:'Pegasus вдохновлён лошадьми французских королей. Аромат сочетает свежесть, теплоту и благородство.',
   ingredients:'ALCOHOL DENAT., PARFUM (FRAGRANCE), AQUA (WATER), CITRUS BERGAMIA FRUIT OIL, JASMINUM OFFICINALE FLOWER OIL, SANTALUM ALBUM WOOD OIL, VANILLA PLANIFOLIA FRUIT EXTRACT, AMBROXAN, COUMARIN, BENZYL BENZOATE, LINALOOL.',
   imgs:['assets/img/p13.jpg','assets/img/p14.jpg','assets/img/p21.jpg','assets/img/p22.jpg']},
  {id:8,brand:'ROJA DOVE',name:'Elysium',vol:'100 мл',price:78000,cat:['him','toilette'],badge:'Эксклюзив',rating:4.8,reviews:54,
   notes:['Грейпфрут','Кориандр','Жасмин','Белый мускус','Кашмир'],
   desc:'Аромат чистоты и свободы от мастера британской парфюмерии. Свежие цитрусовые ноты и белый мускус.',
   descExtra:'Roja Dove — один из немногих живых легенд мировой парфюмерии. Каждый его аромат является произведением искусства.',
   ingredients:'ALCOHOL DENAT., PARFUM (FRAGRANCE), AQUA (WATER), CITRUS PARADISI FRUIT OIL, CORIANDRUM SATIVUM SEED OIL, JASMINUM SAMBAC FLOWER OIL, MUSK, CASHMERAN, BENZYL BENZOATE, LINALOOL, LIMONENE, CITRAL.',
   imgs:['assets/img/p14.jpg','assets/img/p15.jpg','assets/img/p24.jpg','assets/img/p01.jpg']},
  {id:9,brand:'MAISON FRANCIS',name:'Aqua Universalis',vol:'70 мл',price:24500,cat:['unisex','home','new','sale'],badge:'−12%',rating:4.5,reviews:202,
   notes:['Лимон','Белые цветы','Мускус','Кедр','Амбретта'],
   desc:'Свежий и чистый аромат белых цветов и нот утренней свежести. Универсальный для любого времени года.',
   descExtra:'Aqua Universalis — квинтэссенция чистоты. Лёгкий и воздушный, подходит как мужчинам, так и женщинам.',
   ingredients:'ALCOHOL DENAT., PARFUM (FRAGRANCE), AQUA (WATER), CITRUS LIMON PEEL OIL, CITRUS AURANTIUM AMARA FLOWER OIL, MUSK, CEDRUS ATLANTICA BARK OIL, ABELMOSCHUS MOSCHATUS SEED OIL, LINALOOL, LIMONENE, CITRAL, BENZYL SALICYLATE.',
   imgs:['assets/img/p15.jpg','assets/img/p19.jpg','assets/img/p04.jpg','assets/img/p02.jpg']},
  {id:10,brand:'INITIO',name:'Oud for Greatness',vol:'90 мл',price:55000,cat:['him','unisex','oil'],badge:'Хит',rating:4.9,reviews:131,
   notes:['Уд','Шафран','Мускус','Амбра','Ладан'],
   desc:'Уд с нотами острых специй, шафрана и мускуса. Мощный заявочный аромат для смелых духом.',
   descExtra:'Один из самых ярких ароматов дома INITIO. Интенсивность и стойкость делают его настоящим заявлением.',
   ingredients:'ALCOHOL DENAT., PARFUM (FRAGRANCE), AQUA (WATER), AGARWOOD OIL, CROCUS SATIVUS STIGMA EXTRACT, MUSK, AMBROXAN, BOSWELLIA SACRA RESIN EXTRACT, BENZYL BENZOATE, LINALOOL, EUGENOL, ISO EUGENOL.',
   imgs:['assets/img/p19.jpg','assets/img/p20.jpg','assets/img/p10.jpg','assets/img/p03.jpg']},
  {id:11,brand:'MEMO PARIS',name:'African Leather',vol:'75 мл',price:42000,cat:['unisex','home','sale'],badge:'−20%',rating:4.6,reviews:88,
   notes:['Кожа','Специи','Ветивер','Ладан','Смола'],
   desc:'Путешествие в сердце Африки — кожа, специи и земляные ноты ветивера в смелой интерпретации.',
   descExtra:'African Leather вдохновлён путешествиями по Африке, её запахами, цветами и бесконечным небом.',
   ingredients:'ALCOHOL DENAT., PARFUM (FRAGRANCE), AQUA (WATER), LEATHER ACCORD, SPICE BLEND, VETIVERIA ZIZANOIDES ROOT OIL, BOSWELLIA SACRA RESIN EXTRACT, BENZYL BENZOATE, COUMARIN, LINALOOL, LIMONENE, EUGENOL.',
   imgs:['assets/img/p20.jpg','assets/img/p21.jpg','assets/img/p22.jpg','assets/img/p05.jpg']},
  {id:12,brand:'BYREDO',name:"Bal d'Afrique",vol:'100 мл',price:29000,cat:['unisex','hits','home','new'],badge:'Новинка',rating:4.7,reviews:177,
   notes:['Нероли','Ветивер','Мускус','Виолетта','Бергамот'],
   desc:'Солнечный аромат, вдохновлённый африканским искусством. Нероли, ветивер и мускус в лёгком исполнении.',
   descExtra:"Bal d'Afrique — гимн африканской культуре и искусству 1920-х годов.",
   ingredients:'ALCOHOL DENAT., PARFUM (FRAGRANCE), AQUA (WATER), CITRUS AURANTIUM AMARA FLOWER OIL, VETIVERIA ZIZANOIDES ROOT OIL, MUSK, VIOLA ODORATA LEAF EXTRACT, CITRUS BERGAMIA FRUIT OIL, LINALOOL, LIMONENE, CITRAL, GERANIOL.',
   imgs:['assets/img/p21.jpg','assets/img/p24.jpg','assets/img/p01.jpg','assets/img/p06.jpg']},
];

// Category hero metadata (catalog page banners)
const DEFAULT_CAT_META = {
  all:    {title:'Весь ассортимент', sub:'Все ароматы LUXE Парфюмерия',             img:'assets/img/p09.jpg'},
  hits:   {title:'Хиты продаж',     sub:'Самые любимые ароматы наших клиентов',   img:'assets/img/p23.jpg'},
  him:    {title:'Для него',        sub:'Мужская парфюмерия — сила и элегантность',img:'assets/img/p11.jpg'},
  her:    {title:'Для неё',         sub:'Женская парфюмерия — нежность и соблазн', img:'assets/img/p12.jpg'},
  unisex: {title:'Унисекс',         sub:'Ароматы вне границ и стереотипов',        img:'assets/img/p16.jpg'},
  toilette:{title:'Туалетная вода', sub:'Лёгкие и выразительные композиции на каждый день',img:'assets/img/p05.jpg'},
  oil:    {title:'Масляные духи',   sub:'Глубокие концентрированные ароматы',       img:'assets/img/p03.jpg'},
  home:   {title:'Ароматы для дома',sub:'Атмосфера, которая начинается с аромата', img:'assets/img/p22.jpg'},
};

// Category labels used by sidebar / catalog tabs
const DEFAULT_CAT_LABELS = { all:'Все', hits:'Хиты', him:'Для него', her:'Для неё', unisex:'Унисекс', toilette:'Туалетная вода', oil:'Масляные духи', home:'Для дома' };

// ── Editable content layer ───────────────────────────────────────────────
// The storefront reads PRODUCTS / CAT_META / CAT_LABELS as live globals.
// The admin panel (js/admin.js) rewrites them and persists to localStorage,
// so a shop owner can change catalogue, prices, photos and banners without
// touching the code. This file loads first (before state.js/utils.js), so
// hydration here is self-contained — no dependency on other modules.
const CONTENT_KEYS = {
  products:  'luxeProducts',
  catMeta:   'luxeCatMeta',
  catLabels: 'luxeCatLabels',
  hero:      'luxeHero',
  texts:     'luxeTexts',
};

function _contentClone(value) { return JSON.parse(JSON.stringify(value)); }

function _contentLoad(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? _contentClone(fallback) : JSON.parse(raw);
  } catch (e) {
    return _contentClone(fallback);
  }
}

let PRODUCTS   = _contentLoad(CONTENT_KEYS.products,  DEFAULT_PRODUCTS);
let CAT_META   = _contentLoad(CONTENT_KEYS.catMeta,   DEFAULT_CAT_META);
let CAT_LABELS = _contentLoad(CONTENT_KEYS.catLabels, DEFAULT_CAT_LABELS);
