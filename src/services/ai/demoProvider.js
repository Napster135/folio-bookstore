import { productModel } from '../../models/products.model.js';

// ── Real DB categories (from the catalog) ────────────────────────────────────
const DB_CAT = {
  FICCION:         ['Ficción', 'Ficción reciente', 'Ficción histórica', 'No ficción'],
  CIENCIA_FICCION: ['Ciencia ficción', 'Ciencia ficción reciente'],
  THRILLER:        ['Thriller', 'Thriller reciente', 'Thriller romántico'],
  FANTASIA:        ['Fantasía', 'Fantasía reciente'],
  ROMANCE:         ['Romance', 'Romance reciente', 'Romantasy', 'Romantasy reciente'],
  TERROR:          ['Terror'],
  POLICIAL:        ['Policial'],
  DISTOPIA:        ['Distopía'],
  CLASICOS:        ['Clásicos'],
  PSICOLOGIA:      ['Psicología'],
  DESARROLLO:      ['Desarrollo personal'],
  NEGOCIOS:        ['Negocios'],
  FINANZAS:        ['Finanzas'],
  PRODUCTIVIDAD:   ['Productividad'],
  MEMORIAS:        ['Memorias'],
};

// ORDER MATTERS: more specific entries first (ciencia ficcion before ficcion)
const INTENT_CATS = [
  [['ciencia ficcion', 'scifi', 'sci-fi', 'espacial', 'extraterrestre', 'robots', 'galaxia'],    'CIENCIA_FICCION', 'ciencia ficción'],
  [['ficcion', 'novela', 'cuento', 'narrativa', 'contemporanea', 'literaria', 'realista'],       'FICCION',         'ficción'],
  [['thriller', 'suspenso', 'accion', 'espionaje'],                                              'THRILLER',        'thriller'],
  [['terror', 'horror', 'miedo', 'sustos'],                                                      'TERROR',          'terror'],
  [['fantasia', 'magia', 'elfos', 'dragones', 'magico'],                                         'FANTASIA',        'fantasía'],
  [['romance', 'romantico', 'amor', 'pareja', 'romantasy'],                                      'ROMANCE',         'romance'],
  [['policial', 'detectiv', 'crimen', 'misterio', 'investigacion', 'asesino'],                  'POLICIAL',        'policial'],
  [['distopia', 'dystopia', 'futurista', 'apocalipsis'],                                         'DISTOPIA',        'distopía'],
  [['clasico', 'clasicos', 'literatura clasica', 'siglo xix', 'siglo xx'],                       'CLASICOS',        'clásicos'],
  [['psicologia', 'mente', 'conducta', 'emociones', 'terapia', 'ansiedad', 'habitos'],           'PSICOLOGIA',      'psicología'],
  [['desarrollo personal', 'autoayuda', 'motivacion', 'crecimiento personal', 'liderazgo'],      'DESARROLLO',      'desarrollo personal'],
  [['negocios', 'empresa', 'emprendimiento', 'marketing', 'management', 'startup'],              'NEGOCIOS',        'negocios'],
  [['finanzas', 'dinero', 'inversion', 'invertir', 'ahorro', 'economia'],                        'FINANZAS',        'finanzas'],
  [['productividad', 'organizacion', 'metodo', 'tiempo', 'eficiencia'],                          'PRODUCTIVIDAD',   'productividad'],
  [['memorias', 'autobiografia', 'biografia', 'memoir', 'vida real', 'historia real'],           'MEMORIAS',        'memorias'],
];

function strip(text) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function detectCategory(text) {
  const lower = strip(text);
  for (const [keywords, key, label] of INTENT_CATS) {
    if (keywords.some(kw => lower.includes(kw))) {
      return { key, label };
    }
  }
  return null;
}

const STOP_WORDS = new Set([
  // Filler / request words
  'quiero', 'busco', 'necesito', 'dame', 'recomienda', 'recomiendame',
  'libro', 'libros', 'algo', 'para', 'que', 'como', 'una', 'uno', 'unos', 'unas',
  'sobre', 'acerca', 'tipo', 'estilo', 'con', 'del', 'los', 'las', 'por', 'favor',
  'gracias', 'hola', 'buenas', 'buen', 'buena', 'tenes', 'tengo', 'leer', 'lectura',
  'empezar', 'desde', 'cero', 'muy', 'mas', 'manejar', 'entender', 'aprender',
  // Intent keywords — describe what the user wants, not what the book is about
  'regalo', 'regalar', 'obsequio', 'presente', 'cumpleanos',
  'barato', 'economico', 'accesible', 'presupuesto', 'dinero',
  'principiante', 'basico', 'inicio',
  'sorprendeme', 'aleatorio', 'sorpresa',
  'popular', 'populares', 'famoso', 'bestseller', 'recomendado',
]);

function analyzeMessage(text) {
  const lower = strip(text);

  const categoryResult = detectCategory(text);
  const category = categoryResult?.key   ?? null;
  const catLabel  = categoryResult?.label ?? null;

  const check = (kws) => kws.some(kw => lower.includes(strip(kw)));

  const wantsCheap    = check(['barato', 'economico', 'económico', 'bajo precio', 'presupuesto', 'accesible', 'poco dinero', 'no gastar']);
  const isGift        = check(['regalo', 'regalar', 'obsequio', 'presente', 'cumpleanos', 'cumpleaños']);
  const isBeginner    = check(['principiante', 'empezar', 'desde cero', 'inicio', 'basico', 'primer libro', 'nunca lei', 'no se por donde']);
  const wantsSurprise = check(['sorprendeme', 'sorpréndeme', 'aleatorio', 'cualquier', 'lo que sea', 'da igual', 'algo distinto']);
  const wantsPopular  = check(['popular', 'populares', 'famoso', 'bestseller', 'mas vendido', 'recomendado']);

  const words = lower
    .replace(/[¿?¡!.,;:'"]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w));
  const searchTerms = words.length > 0 ? words.slice(0, 4).join('|') : null;

  return { category, catLabel, searchTerms, wantsCheap, isGift, isBeginner, wantsSurprise, wantsPopular };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getFeaturedBook(books) {
  return books.length > 0 ? books[0] : null;
}

function getBookMention(book) {
  if (!book) return null;
  return book.author ? `${book.title}, de ${book.author}` : book.title;
}

function buildFollowUpQuestion(intent) {
  const { catLabel, isGift, isBeginner, wantsCheap, wantsPopular } = intent;
  if (isGift)    return '¿Sabés si la persona que lo recibe prefiere ficción o algo más práctico?';
  if (isBeginner) return '¿Tenés algún tema que te llame la atención, o preferís que elija yo?';
  if (wantsCheap) return '¿Tenés un precio máximo en mente?';
  if (catLabel === 'psicología' || catLabel === 'desarrollo personal')
    return '¿Buscás algo más teórico o con ejercicios prácticos?';
  if (catLabel === 'negocios' || catLabel === 'finanzas')
    return '¿Estás empezando en el tema o ya tenés algo de base?';
  if (catLabel === 'ficción' || catLabel === 'thriller' || catLabel === 'romance')
    return '¿Preferís algo corto o no importa el largo?';
  if (catLabel === 'ciencia ficción' || catLabel === 'fantasía' || catLabel === 'distopía')
    return '¿Querés algo más realista o que vaya a fondo con el mundo imaginado?';
  if (catLabel === 'clásicos') return '¿Preferís literatura en español o en traducción?';
  if (wantsPopular) return '¿De alguna categoría en particular?';
  return '¿Querés que busque por categoría, autor o presupuesto?';
}

// Enrich a very short follow-up message with the last user turn in history
function enrichWithHistory(message, history) {
  if (!Array.isArray(history) || history.length === 0) return message;
  const words = message.trim().split(/\s+/);
  if (words.length > 3) return message;
  const lastUser = [...history].reverse().find(h => h.role === 'user');
  if (!lastUser?.content) return message;
  return `${lastUser.content} ${message}`;
}

// ── DB search ─────────────────────────────────────────────────────────────────

async function searchBooks(intent, limit = 5) {
  const { category, searchTerms, wantsCheap, wantsSurprise } = intent;

  const baseQuery = { stock: { $gt: 0 }, status: true };
  let usedFallback = false;

  if (category && DB_CAT[category]) {
    baseQuery.category = { $in: DB_CAT[category] };
    if (searchTerms) {
      const pattern = searchTerms.split('|').slice(0, 3).join('|');
      baseQuery.$or = [
        { title:       { $regex: pattern, $options: 'i' } },
        { author:      { $regex: pattern, $options: 'i' } },
        { description: { $regex: pattern, $options: 'i' } },
      ];
    }
  } else if (searchTerms) {
    const pattern = searchTerms.split('|').slice(0, 4).join('|');
    baseQuery.$or = [
      { title:       { $regex: pattern, $options: 'i' } },
      { author:      { $regex: pattern, $options: 'i' } },
      { description: { $regex: pattern, $options: 'i' } },
    ];
  }

  if (wantsCheap) baseQuery.price = { $lte: 20 };
  const sort = wantsCheap ? { price: 1 } : {};

  let books = await productModel.find(baseQuery).sort(sort).limit(limit * 4).lean();

  // Retry with category only if combined filter returned nothing
  if (books.length === 0 && category && searchTerms) {
    const retryQuery = { stock: { $gt: 0 }, status: true, category: baseQuery.category };
    if (wantsCheap) retryQuery.price = { $lte: 20 };
    books = await productModel.find(retryQuery).sort(sort).limit(limit * 4).lean();
  }

  // True fallback: no relevant match — return random in-stock books
  if (books.length === 0) {
    usedFallback = true;
    books = await productModel
      .find({ stock: { $gt: 0 }, status: true })
      .limit(limit * 3)
      .lean();
  }

  if (wantsSurprise || books.length > limit) {
    books = books.sort(() => Math.random() - 0.5);
  }

  return {
    usedFallback,
    books: books.slice(0, limit).map(b => ({
      _id:         b._id,
      title:       b.title,
      author:      b.author || '',
      price:       b.price,
      thumbnail:   b.thumbnail,
      category:    b.category,
      stock:       b.stock,
      description: b.description
        ? b.description.slice(0, 120) + (b.description.length > 120 ? '…' : '')
        : '',
    })),
  };
}

// ── Reply builder ─────────────────────────────────────────────────────────────

function buildReply(intent, books, usedFallback) {
  const { catLabel, isGift, isBeginner, wantsCheap, wantsSurprise, wantsPopular } = intent;
  const n        = books.length;
  const p        = n > 1;
  const featured = getFeaturedBook(books);
  const mention  = getBookMention(featured);
  const followUp = buildFollowUpQuestion(intent);

  if (n === 0) {
    return pick([
      'En este momento no hay libros disponibles para lo que buscás. Podés explorar el catálogo completo desde la sección de productos.',
      'No encontré nada disponible con ese criterio. Vale la pena revisar el catálogo completo desde la sección de productos.',
    ]);
  }

  if (wantsSurprise) {
    return pick([
      `Me encanta esa actitud. Elegí ${p ? 'estos' : 'este'} con criterio propio — variados, sin predecir lo que me pedirías. Si querés afinar, contame más.`,
      `Un comodín — me gusta. ${p ? 'Acá van varios títulos que no son los más obvios' : 'Acá va uno que no es el más obvio'}. Contame si alguno te llama y busco más en esa línea.`,
      `Sin filtros. Armé una selección variada para que algo te llame la atención. ¿Qué estilo de lectura solés preferir?`,
    ]);
  }

  if (wantsPopular) {
    return pick([
      `${p ? 'Estos son' : 'Este es'} de los que más circulan — lecturas que la gente recomienda con entusiasmo.${mention ? ` Si tuviera que arrancar por uno, iría por ${mention}.` : ''}`,
      `Los bestsellers a veces son bestsellers con razón. ${p ? 'Estos títulos tienen' : 'Este título tiene'} muy buena recepción entre los lectores.`,
      `Para algo que ya probaron muchos lectores y no falla, ${p ? 'acá hay opciones' : 'acá hay uno'} que tienen muy buenas reseñas.${mention ? ` ${mention} en particular.` : ''}`,
    ]);
  }

  if (usedFallback) {
    return pick([
      `No encontré una coincidencia perfecta, pero elegí algunas opciones disponibles que podrían acercarse a lo que buscás. ${followUp}`,
      `Con ese criterio no hay match directo en el catálogo — pero no me fui con las manos vacías. ${p ? 'Acá hay algunas opciones' : 'Acá hay una opción'} que vale la pena mirar. ${followUp}`,
      `No hay una coincidencia exacta para eso. Te muestro ${p ? 'algunos títulos' : 'un título'} del catálogo que podrían ser útiles igual. ${followUp}`,
    ]);
  }

  if (isGift) {
    return pick([
      `Para regalo, lo importante es que se sienta pensado. ${p ? 'Estas opciones' : 'Esta opción'} funcionan bien incluso para alguien que no lee seguido.${mention ? ` Yo arrancaría con ${mention}.` : ''} ${followUp}`,
      `Un buen regalo de libro es el que el otro no se hubiera comprado solo. ${p ? 'Acá hay varias ideas' : 'Acá hay una idea'} que suelen caer muy bien. ${followUp}`,
      `Para regalar, priorizaría algo accesible y con historia. ${p ? 'Estos títulos' : 'Este título'} suelen gustar incluso a quienes "no leen mucho". ${followUp}`,
    ]);
  }

  if (isBeginner) {
    return pick([
      `El primer libro importa: tiene que enganchar rápido. ${p ? 'Estos títulos son' : 'Este título es'} accesible${p ? 's' : ''} sin ser simple${p ? 's' : ''} — el tipo de lectura que te hace querer el siguiente.${mention ? ` Particularmente, ${mention} es buen punto de entrada.` : ''}`,
      `Para empezar, yo elegiría algo que tenga ritmo y no te exija demasiado bagaje previo. ${p ? 'Estos títulos' : 'Este título'} cumplen eso. ${followUp}`,
      `Arrancar a leer es más fácil cuando el libro no te hace sentir que te perdiste algo. ${p ? 'Estos son' : 'Este es'} de entrada directa. ${followUp}`,
    ]);
  }

  if (wantsCheap) {
    return pick([
      `Busqué dentro de los precios más accesibles del catálogo. ${p ? 'Acá hay opciones' : 'Acá hay una opción'} que no ${p ? 'van' : 'va'} a pesar en el bolsillo.${mention ? ` ${mention} está entre los más económicos y vale la pena.` : ''}`,
      `Precio justo existe. ${p ? 'Estos títulos están' : 'Este título está'} dentro de los más accesibles y no sacrifican calidad. ${followUp}`,
      `Para leer bien y gastar poco, ${p ? 'estas opciones están ordenadas' : 'esta opción está ordenada'} por precio. Buena lectura a buen precio.`,
    ]);
  }

  if (catLabel) {
    const CAT_REPLIES = {
      'ficción': [
        `Si querés una historia que enganche sin complicarse demasiado, arrancaría por ${p ? 'estos títulos' : 'este título'}.${mention ? ` Especialmente ${mention} — entra solo desde la primera página.` : ''} ${followUp}`,
        `Ficción bien escrita es la que no se nota que está escrita. ${p ? 'Estas opciones tienen' : 'Esta opción tiene'} ese ritmo. ${followUp}`,
        `Para ficción del catálogo, ${p ? 'estos son los más sólidos del momento' : 'este me parece el más sólido'}. Bien construidos, sin páginas de relleno.`,
      ],
      'ciencia ficción': [
        `Acá iría por mundos imaginados, ideas grandes y ese toque de "qué pasaría si…". ${p ? 'Estos títulos tienen' : 'Este título tiene'} eso.${mention ? ` ${mention} en particular está muy bien armado.` : ''} ${followUp}`,
        `Ciencia ficción bien hecha no es solo tecnología — es sobre cómo vivimos ahora. ${p ? 'Estos lo entienden' : 'Este lo entiende'}. ${followUp}`,
        `Para los amantes del género, ${p ? 'estos títulos son imperdibles' : 'este título es imperdible'}. El tipo de lectura que te deja pensando días después.`,
      ],
      'thriller': [
        `Para suspenso, buscaría algo con ritmo y tensión desde temprano. ${p ? 'Estos títulos' : 'Este título'} no dan respiro.${mention ? ` ${mention} en especial — no lo cerrás hasta el final.` : ''} ${followUp}`,
        `Un buen thriller no te deja dormir. ${p ? 'Estos tienen' : 'Este tiene'} eso — tensión que sube página a página.`,
        `Para thriller, lo que importa es que las piezas encajen y el final no decepcione. ${p ? 'Estos títulos' : 'Este título'} lo logran.`,
      ],
      'terror': [
        `El terror que funciona no grita: incomoda. ${p ? 'Estos títulos construyen' : 'Este título construye'} una tensión que se queda con vos. ${followUp}`,
        `Si buscás algo que genere tensión de la buena, ${p ? 'estos son' : 'este es'} para leer con la luz encendida.${mention ? ` ${mention} especialmente.` : ''}`,
        `Para terror, lo mejor es cuando no sabés si lo que asusta es lo sobrenatural o el personaje. ${p ? 'Estos títulos' : 'Este título'} juegan con eso.`,
      ],
      'fantasía': [
        `Para fantasía, lo que busco es que el mundo se sienta real aunque no exista. ${p ? 'Estos títulos' : 'Este título'} lo logran.${mention ? ` Arrancá por ${mention}.` : ''} ${followUp}`,
        `Un buen libro de fantasía te hace querer el siguiente antes de terminar el primero. ${p ? 'Estos títulos tienen' : 'Este título tiene'} eso. ${followUp}`,
        `Para perderse en otra realidad, ${p ? 'estos son los más sólidos del catálogo' : 'este es el más sólido del catálogo'} en el género.`,
      ],
      'romance': [
        `Para romance, priorizaría personajes que se sientan reales y una historia que tenga corazón. ${p ? 'Estos títulos tienen' : 'Este título tiene'} eso.${mention ? ` ${mention} especialmente.` : ''} ${followUp}`,
        `El romance que vale la pena es el que tiene algo más que el romance. ${p ? 'Estos son' : 'Este es'} de esos. ${followUp}`,
        `Para una lectura que enganche por los personajes, ${p ? 'estos títulos son ideales' : 'este título es ideal'}. Con ritmo y sin fórmulas desgastadas.`,
      ],
      'policial': [
        `Para policial, lo que importa es que el misterio tenga lógica y el final no decepcione. ${p ? 'Estos títulos' : 'Este título'} cumplen las dos.${mention ? ` ${mention} en particular.` : ''} ${followUp}`,
        `Si te gusta resolver el caso antes que el protagonista, ${p ? 'estos son' : 'este es'} para vos.${mention ? ` ${mention} es especialmente ingenioso.` : ''}`,
        `Para los que disfrutan los misterios bien construidos, ${p ? 'estos títulos tienen' : 'este título tiene'} tramas que no se caen a pedazos al final.`,
      ],
      'distopía': [
        `La distopía bien hecha no es solo apocalipsis — habla del presente con otro nombre. ${p ? 'Estos títulos hacen' : 'Este título hace'} eso. ${followUp}`,
        `Para distopía, ${p ? 'estos títulos son' : 'este título es'} de los perturbadores de la buena manera.${mention ? ` Empezaría por ${mention}.` : ''} Difíciles de soltar.`,
        `Un buen relato distópico te hace incómodo y eso está bien. ${p ? 'Estos no decepcionan' : 'Este no decepciona'}.`,
      ],
      'clásicos': [
        `Los clásicos duran porque algo en ellos sigue siendo verdad. ${p ? 'Estos títulos son' : 'Este título es'} de los que vale la pena tener en la biblioteca.${mention ? ` ${mention} es buen punto de partida.` : ''} ${followUp}`,
        `Hay clásicos que envejecen mal y clásicos que envejecen mejor. ${p ? 'Estos son' : 'Este es'} del segundo grupo. ${followUp}`,
        `Para clásicos del catálogo, ${p ? 'estas obras son' : 'esta obra es'} de lectura obligada — no por deber, sino porque siguen siendo buenas.`,
      ],
      'psicología': [
        `Para entender cómo funciona la mente — la propia o la ajena — ${p ? 'estos libros son sólidos' : 'este libro es sólido'}. Basados en evidencia, sin autoayuda vacía. ${followUp}`,
        `Psicología bien escrita es la que te hace pensar "ah, eso lo vi en mí". ${p ? 'Estos títulos tienen' : 'Este título tiene'} eso.${mention ? ` ${mention} en particular.` : ''}`,
        `Para entender la conducta y las emociones, ${p ? 'estos libros son accesibles y rigurosos' : 'este libro es accesible y riguroso'}. Nada de frases motivacionales vacías. ${followUp}`,
      ],
      'desarrollo personal': [
        `Para crecer y mejorar hábitos, ${p ? 'estos títulos son prácticos y directos' : 'este título es práctico y directo'}. Sin teoría vacía — todo se puede aplicar.${mention ? ` ${mention} especialmente.` : ''} ${followUp}`,
        `Desarrollo personal tiene mucho ruido. ${p ? 'Estos libros son' : 'Este libro es'} de los que quedan — con ideas concretas, no solo inspiración. ${followUp}`,
        `Para mejorar algo concreto en tu vida, ${p ? 'estos títulos tienen sistemas probados' : 'este título tiene sistemas probados'}. No promesas — herramientas.`,
      ],
      'negocios': [
        `Para negocios, ${p ? 'estos títulos son referencias del área' : 'este título es referencia del área'}. Concretos, útiles y con ideas que se pueden aplicar desde mañana.${mention ? ` ${mention} especialmente.` : ''} ${followUp}`,
        `El mundo del negocio tiene mucha literatura genérica. ${p ? 'Estos libros no son' : 'Este libro no es'} de eso — ${p ? 'son' : 'es'} concreto${p ? 's' : ''} y relevante${p ? 's' : ''}. ${followUp}`,
        `Para entender mejor cómo funcionan las organizaciones o el mercado, ${p ? 'estas lecturas son buen punto de partida' : 'esta lectura es buen punto de partida'}.`,
      ],
      'finanzas': [
        `Si querés entender mejor el dinero sin que se vuelva pesado, ${p ? 'estas opciones son buen punto de partida' : 'esta opción es buen punto de partida'}. Claras y aplicables.${mention ? ` ${mention} en especial.` : ''} ${followUp}`,
        `Finanzas personales bien explicadas cambian cómo tomás decisiones. ${p ? 'Estos libros lo logran' : 'Este libro lo logra'} sin ponerse denso${p ? 's' : ''}. ${followUp}`,
        `Para entender el dinero desde cero o afilar lo que ya sabés, ${p ? 'estas lecturas son sólidas' : 'esta lectura es sólida'}.`,
      ],
      'productividad': [
        `Acá buscaría libros que no se queden en frases lindas, sino que te dejen sistemas aplicables. ${p ? 'Estos lo hacen' : 'Este lo hace'}.${mention ? ` ${mention} es especialmente práctico.` : ''} ${followUp}`,
        `Para mejorar cómo trabajás y organizás tu tiempo, ${p ? 'estos títulos tienen métodos reales' : 'este título tiene métodos reales'} — nada de "madrugá y meditá". ${followUp}`,
        `Productividad sin trampa: ${p ? 'estos libros tienen' : 'este libro tiene'} sistemas probados, no motivación vacía.`,
      ],
      'memorias': [
        `${p ? 'Estas memorias son' : 'Esta historia real es'} de las que recordás mucho después de terminarla${p ? 's' : ''}. La realidad supera a la ficción.${mention ? ` Empezá por ${mention}.` : ''} ${followUp}`,
        `Las memorias bien escritas hacen algo raro: te meten en la vida de otro y se quedan con vos. ${p ? 'Estos títulos son' : 'Este título es'} así. ${followUp}`,
        `Para leer historias reales que parecen inventadas (en el buen sentido), ${p ? 'estas memorias son' : 'esta memoria es'} lo que buscás.`,
      ],
    };

    const variants = CAT_REPLIES[catLabel];
    if (variants) return pick(variants).trim();
    return `Encontré ${p ? 'algunos títulos' : 'un título'} de ${catLabel} que podrían encajarte. ${followUp}`;
  }

  // Generic — no category, no strong intent, results found
  return pick([
    `Con lo que me contás, ${p ? 'estos títulos me parecen' : 'este título me parece'} un buen punto de partida. ${followUp}`,
    `Busqué en el catálogo y ${p ? 'estos resultados se acercan' : 'este resultado se acerca'} a lo que describís. ${followUp}`,
    `No hay una categoría clara para lo que pedís, pero encontré ${p ? 'estas opciones' : 'esta opción'} que podrían ajustarse. ${followUp}`,
  ]);
}

// ── Entry point ───────────────────────────────────────────────────────────────

export async function demoRespond(message, history) {
  const enriched = enrichWithHistory(message, history);
  const intent   = analyzeMessage(enriched);
  const { books, usedFallback } = await searchBooks(intent);
  const reply = buildReply(intent, books, usedFallback);
  return { reply, books };
}
