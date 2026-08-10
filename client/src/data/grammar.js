// 语法参考内容：中英双语，{ zh, en } 结构

export const GRAMMAR = [
  {
    id: 'articles',
    title: {
      zh: '定冠词与四个格',
      en: 'Definite articles & the four cases',
    },
    desc: {
      zh: '德语名词有阳、阴、中、复四种形式，冠词随格变化。故事里「an der Haltestelle」就是第三格（表示“在车站那里”）。',
      en: 'German nouns are masculine, feminine, neuter or plural, and the article changes with the case. In “an der Haltestelle” (at the tram stop), the article is dative.',
    },
    table: {
      headers: {
        zh: ['格', '阳性 der', '阴性 die', '中性 das', '复数 die'],
        en: ['Case', 'Masculine der', 'Feminine die', 'Neuter das', 'Plural die'],
      },
      rows: [
        {
          zh: ['主格 (N)', 'der', 'die', 'das', 'die'],
          en: ['Nominative (N)', 'der', 'die', 'das', 'die'],
        },
        {
          zh: ['宾格 (A)', 'den', 'die', 'das', 'die'],
          en: ['Accusative (A)', 'den', 'die', 'das', 'die'],
        },
        {
          zh: ['与格 (D)', 'dem', 'der', 'dem', 'den'],
          en: ['Dative (D)', 'dem', 'der', 'dem', 'den'],
        },
        {
          zh: ['属格 (G)', 'des', 'der', 'des', 'der'],
          en: ['Genitive (G)', 'des', 'der', 'des', 'der'],
        },
      ],
    },
    examples: [
      {
        de: 'Die Straßenbahn kommt pünktlich.',
        zh: '电车准时到达。（主格）',
        en: 'The tram arrives on time. (nominative)',
      },
      {
        de: 'Ich sehe den Fluss Limmat.',
        zh: '我看见利马特河。（宾格）',
        en: 'I see the river Limmat. (accusative)',
      },
      {
        de: 'Wir sitzen am See.',
        zh: '我们坐在湖边。（am = an dem，与格）',
        en: 'We sit by the lake. (am = an dem, dative)',
      },
    ],
  },
  {
    id: 'indefinite',
    title: {
      zh: '不定冠词 ein / eine',
      en: 'Indefinite articles ein / eine',
    },
    desc: {
      zh: 'ein 用于阳性和中性名词，eine 用于阴性名词；复数没有不定冠词。',
      en: '“ein” goes with masculine and neuter nouns, “eine” with feminine nouns; there is no indefinite article in the plural.',
    },
    table: {
      headers: {
        zh: ['格', '阳性 ein', '阴性 eine', '中性 ein'],
        en: ['Case', 'Masculine ein', 'Feminine eine', 'Neuter ein'],
      },
      rows: [
        { zh: ['主格 (N)', 'ein', 'eine', 'ein'], en: ['Nominative (N)', 'ein', 'eine', 'ein'] },
        { zh: ['宾格 (A)', 'einen', 'eine', 'ein'], en: ['Accusative (A)', 'einen', 'eine', 'ein'] },
        { zh: ['与格 (D)', 'einem', 'einer', 'einem'], en: ['Dative (D)', 'einem', 'einer', 'einem'] },
        { zh: ['属格 (G)', 'eines', 'einer', 'eines'], en: ['Genitive (G)', 'eines', 'einer', 'eines'] },
      ],
    },
    examples: [
      {
        de: 'Ich kaufe einen Käse, eine Tomate und ein Brötchen.',
        zh: '我买一块奶酪、一个番茄和一个面包。（宾格）',
        en: 'I buy a cheese, a tomato and a roll. (accusative)',
      },
      {
        de: 'Wir trinken einen Kaffee am See.',
        zh: '我们在湖边喝一杯咖啡。',
        en: 'We drink a coffee by the lake.',
      },
    ],
  },
  {
    id: 'pronouns',
    title: {
      zh: '人称代词四格',
      en: 'Personal pronouns',
    },
    desc: {
      zh: '代词在句子里的格随功能变化：作主语用主格，作宾语用宾格/与格。',
      en: 'Pronouns change with their role in the sentence: nominative as subject, accusative/dative as object.',
    },
    table: {
      headers: {
        zh: ['格', 'ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'],
        en: ['Case', 'ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'],
      },
      rows: [
        {
          zh: ['主格 (N)', 'ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'],
          en: ['Nominative (N)', 'ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'],
        },
        {
          zh: ['宾格 (A)', 'mich', 'dich', 'ihn/sie/es', 'uns', 'euch', 'sie/Sie'],
          en: ['Accusative (A)', 'mich', 'dich', 'ihn/sie/es', 'uns', 'euch', 'sie/Sie'],
        },
        {
          zh: ['与格 (D)', 'mir', 'dir', 'ihm/ihr/ihm', 'uns', 'euch', 'ihnen/Ihnen'],
          en: ['Dative (D)', 'mir', 'dir', 'ihm/ihr/ihm', 'uns', 'euch', 'ihnen/Ihnen'],
        },
      ],
    },
    examples: [
      {
        de: 'Er schickt mir ein Foto.',
        zh: '他给我发了一张照片。（mir = 与格）',
        en: 'He sends me a photo. (mir = dative)',
      },
      {
        de: 'Ich sehe sie am See.',
        zh: '我在湖边看到她。',
        en: 'I see her by the lake.',
      },
    ],
  },
  {
    id: 'verbs',
    title: {
      zh: '现在时动词变位',
      en: 'Present tense conjugation',
    },
    desc: {
      zh: 'A2 阶段最常用的四个动词：sein（是）、haben（有）、wohnen（住）、fahren（乘坐/行驶）。注意 fahren 在 du/er 时会变音。',
      en: 'The four most useful verbs at A2: sein (to be), haben (to have), wohnen (to live), fahren (to ride/drive). Note the vowel change in “fahren” for du/er.',
    },
    table: {
      headers: {
        zh: ['人称', 'sein', 'haben', 'wohnen', 'fahren'],
        en: ['Person', 'sein', 'haben', 'wohnen', 'fahren'],
      },
      rows: [
        { zh: ['ich', 'bin', 'habe', 'wohne', 'fahre'], en: ['ich', 'bin', 'habe', 'wohne', 'fahre'] },
        { zh: ['du', 'bist', 'hast', 'wohnst', 'fährst'], en: ['du', 'bist', 'hast', 'wohnst', 'fährst'] },
        { zh: ['er/sie/es', 'ist', 'hat', 'wohnt', 'fährt'], en: ['er/sie/es', 'ist', 'hat', 'wohnt', 'fährt'] },
        { zh: ['wir', 'sind', 'haben', 'wohnen', 'fahren'], en: ['wir', 'sind', 'haben', 'wohnen', 'fahren'] },
        { zh: ['ihr', 'seid', 'habt', 'wohnt', 'fahrt'], en: ['ihr', 'seid', 'habt', 'wohnt', 'fahrt'] },
        { zh: ['sie/Sie', 'sind', 'haben', 'wohnen', 'fahren'], en: ['sie/Sie', 'sind', 'haben', 'wohnen', 'fahren'] },
      ],
    },
    examples: [
      { de: 'Anna wohnt in Zürich.', zh: '安娜住在苏黎世。', en: 'Anna lives in Zurich.' },
      {
        de: 'Sie fährt jeden Morgen mit der Straßenbahn.',
        zh: '她每天早上坐电车。',
        en: 'She takes the tram every morning.',
      },
    ],
  },
  {
    id: 'separable',
    title: {
      zh: '可分动词',
      en: 'Separable verbs',
    },
    desc: {
      zh: '可分动词的前缀在现在时和过去时中会移到句尾（不定式和从句中不拆）。',
      en: 'The prefix of a separable verb moves to the end of the sentence in the present and past tenses (it stays attached in the infinitive and in subordinate clauses).',
    },
    examples: [
      { de: 'Ich stehe um 7 Uhr auf.', zh: '我七点起床。（aufstehen）', en: 'I get up at 7. (aufstehen)' },
      {
        de: 'Anna steigt an der Haltestelle ein.',
        zh: '安娜在车站上车。（einsteigen）',
        en: 'Anna gets on at the stop. (einsteigen)',
      },
      {
        de: 'Wir steigen am Bahnhof aus.',
        zh: '我们在火车站下车。（aussteigen）',
        en: 'We get off at the station. (aussteigen)',
      },
      { de: 'Ich rufe dich morgen an.', zh: '我明天给你打电话。（anrufen）', en: 'I will call you tomorrow. (anrufen)' },
      {
        de: 'Nimmst du eine Decke mit?',
        zh: '你带一条毯子吗？（mitnehmen）',
        en: 'Are you bringing a blanket? (mitnehmen)',
      },
    ],
  },
  {
    id: 'prepositions',
    title: {
      zh: '两可介词：静三动四',
      en: 'Two-way prepositions',
    },
    desc: {
      zh: 'in、an、auf、über 等介词回答「在哪里（Wo?）」用第三格，回答「去哪里（Wohin?）」用第四格。',
      en: 'Prepositions like in, an, auf and über take the dative when answering “where (at)?” and the accusative when answering “where to?”.',
    },
    table: {
      headers: {
        zh: ['介词', 'Wo?（第三格）', 'Wohin?（第四格）'],
        en: ['Preposition', 'Wo? (dative)', 'Wohin? (accusative)'],
      },
      rows: [
        {
          zh: ['in', 'in der Stadt 在城市里', 'in die Stadt 进城'],
          en: ['in', 'in der Stadt — in the city', 'in die Stadt — into the city'],
        },
        {
          zh: ['an', 'am See 在湖边', 'an den See 到湖边'],
          en: ['an', 'am See — at the lake', 'an den See — to the lake'],
        },
        {
          zh: ['auf', 'auf der Wiese 在草地上', 'auf die Wiese 到草地上'],
          en: ['auf', 'auf der Wiese — on the lawn', 'auf die Wiese — onto the lawn'],
        },
        {
          zh: ['über', 'über den Alpen 在阿尔卑斯山上空', 'über die Alpen 越过阿尔卑斯山'],
          en: ['über', 'über den Alpen — above the Alps', 'über die Alpen — across the Alps'],
        },
      ],
    },
    examples: [
      {
        de: 'Sie sehen den Sonnenuntergang über den Alpen.',
        zh: '她们看见阿尔卑斯山上空的日落。（Wo? 第三格）',
        en: 'They watch the sunset above the Alps. (where? dative)',
      },
      {
        de: 'Nach der Arbeit gehen sie ans Wasser.',
        zh: '下班后她们到水边去。（ans = an das，Wohin? 第四格）',
        en: 'After work they go down to the water. (ans = an das, where to? accusative)',
      },
    ],
  },
  {
    id: 'weil',
    title: {
      zh: 'weil 与 denn：两个「因为」',
      en: 'weil vs. denn: two ways to say “because”',
    },
    desc: {
      zh: 'weil 引导从句，动词要放到句尾；denn 后面的句子语序保持不变。两者意思相近。',
      en: '“weil” introduces a subordinate clause with the verb at the end; “denn” keeps normal word order. They mean roughly the same thing.',
    },
    examples: [
      {
        de: 'Clara bezahlt mit Karte, weil sie kein Bargeld dabeihat.',
        zh: '克拉拉刷卡付款，因为她没带现金。（weil 从句动词在句尾）',
        en: 'Clara pays by card because she has no cash on her. (verb at the end after weil)',
      },
      {
        de: 'Sie geht schnell zur Arbeit, denn ihr Meeting beginnt um acht.',
        zh: '她快步去上班，因为会议八点开始。（denn 语序不变）',
        en: 'She hurries to work because her meeting starts at eight. (normal word order after denn)',
      },
    ],
  },
  {
    id: 'zurich',
    title: {
      zh: '苏黎世实用小词（瑞士德语）',
      en: 'Zurich essentials (Swiss German)',
    },
    desc: {
      zh: '在苏黎世生活，当地人常用这些词，和标准德语不太一样。',
      en: 'Locals in Zurich use these words every day — they differ from standard German.',
    },
    examples: [
      { de: 'Grüezi!', zh: '你好！（正式问候）', en: 'Hello! (formal greeting)' },
      { de: 'Hoi!', zh: '嗨！（熟人之间）', en: 'Hi! (informal)' },
      { de: 'Merci!', zh: '谢谢！（法语借词，瑞士通用）', en: 'Thanks! (French loanword, common in Switzerland)' },
      { de: 'die Badi', zh: '露天泳池/湖边浴场', en: 'open-air lido / lakeside pool' },
      { de: 'das Velo', zh: '自行车（标准德语 das Fahrrad）', en: 'bicycle (standard German: das Fahrrad)' },
      { de: 'der Zmorge', zh: '早餐', en: 'breakfast' },
      { de: 'das Znüni', zh: '上午茶点', en: 'mid-morning snack' },
      { de: 'Uf Wiederluege!', zh: '再见！', en: 'See you later!' },
    ],
  },
];
