/* Catálogo de produtos — portado 1:1 de src/data/products.ts */

function parsePrice(p) {
  return parseFloat(p.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
}
function priceToNumber(p) {
  return parsePrice(p);
}
function formatBRL(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function getDiscount(product) {
  const price = parsePrice(product.price);
  const old = parsePrice(product.oldPrice);
  const pct = Math.round((1 - price / old) * 100);
  return `-${pct}%`;
}
function getSavings(product) {
  const price = parsePrice(product.price);
  const old = parsePrice(product.oldPrice);
  return formatBRL(old - price);
}

const products = [
  { id: 5, name: "Lavadora de Alta Pressão Vonder Leve LAV1300 Amarela e Preta 1200W", image: "assets/products/vonder-lavadora-lav1300.webp", price: "R$ 65,00", oldPrice: "R$ 225,00", rating: "4.8", sold: "16.946", brand: "Vonder", category: "lavadora",
    description: "Lavadora de alta pressão compacta da linha leve da Vonder, indicada para limpeza doméstica de carros, motos, calçadas, quintais e áreas externas. Motor universal de 1200 W com pressão máxima de 1300 lbf/pol² e mangueira de alta pressão para alcance prático no dia a dia.",
    specs: [
      { label: "Potência", value: "1200 W" },
      { label: "Pressão máxima", value: "1300 lbf/pol² (90 bar)" },
      { label: "Vazão de água", value: "5,5 L/min" },
      { label: "Mangueira", value: "3 metros" },
    ],
    variants: [{ label: "Voltagem", options: ["127V", "220V"] }] },
  { id: 14, name: "Lavadora De Alta Pressão 1200W 1300 Libras LAV1200 Vonder", image: "assets/products/vonder-lavadora-lav1200.webp", price: "R$ 60,00", oldPrice: "R$ 280,00", rating: "4.7", sold: "226", brand: "Vonder", category: "lavadora",
    description: "Lavadora de alta pressão Vonder LAV1200 com motor universal de 1200 W e bomba de pressão para limpeza intensa em ambientes residenciais. Acompanha pistola, lança e bico regulável para diferentes tipos de superfície e nível de sujeira.",
    specs: [
      { label: "Potência", value: "1200 W" },
      { label: "Pressão máxima", value: "1300 lbf/pol²" },
      { label: "Tipo de motor", value: "Universal" },
      { label: "Uso", value: "Doméstico" },
    ],
    variants: [{ label: "Voltagem", options: ["127V", "220V"] }] },
  { id: 15, name: "Lavadora De Alta Pressão Vonder 1400W LAV 1600 Amarelo", image: "assets/products/vonder-lavadora-lav1600.webp", price: "R$ 70,00", oldPrice: "R$ 245,00", rating: "4.8", sold: "15.382", brand: "Vonder", category: "lavadora",
    description: "Lavadora de alta pressão Vonder LAV 1600 com motor de 1400 W e sistema que gera mais pressão consumindo menos água. Indicada para limpeza eficiente de veículos, áreas externas, telhados e máquinas, com alta durabilidade para uso doméstico intensivo.",
    specs: [
      { label: "Potência", value: "1400 W" },
      { label: "Pressão máxima", value: "1600 lbf/pol²" },
      { label: "Vazão", value: "6 L/min" },
      { label: "Mangueira", value: "5 metros" },
    ],
    variants: [{ label: "Voltagem", options: ["127V", "220V"] }] },
  { id: 16, name: "Lavadora De Alta Pressão LAV 2000 Vonder Cor Amarelo", image: "assets/products/vonder-lavadora-lav2000.webp", price: "R$ 100,00", oldPrice: "R$ 358,00", rating: "4.8", sold: "1.553", brand: "Vonder", category: "lavadora",
    description: "Lavadora de alta pressão Vonder LAV 2000, modelo robusto com 2100 lbf/pol² (145 bar) de pressão máxima. Indicada para limpeza pesada em carros, motos, pisos, fachadas e quintais com sujeira incrustada. Bomba de alumínio com cabeçote reforçado para maior vida útil.",
    specs: [
      { label: "Potência", value: "1500 W" },
      { label: "Pressão máxima", value: "2100 lbf/pol² (145 bar)" },
      { label: "Vazão", value: "6,5 L/min" },
      { label: "Mangueira", value: "5 metros" },
    ],
    variants: [{ label: "Voltagem", options: ["127V", "220V"] }] },
  { id: 17, name: "Kit Lavadora Alta Pressão Potente 1200W Aspirador Pó Água Vonder", image: "assets/products/vonder-lavadora-aspirador-combo.webp", price: "R$ 120,00", oldPrice: "R$ 400,00", rating: "4.8", sold: "544", brand: "Vonder", category: "lavadora",
    description: "Kit completo Vonder com lavadora de alta pressão de 1200 W e aspirador de pó e água. Solução 2 em 1 para lavar e secar veículos, limpar quintais, garagens e ambientes internos. Ideal para quem precisa de versatilidade em uma única compra.",
    specs: [
      { label: "Lavadora", value: "1200 W / 1300 lbf/pol²" },
      { label: "Aspirador", value: "Pó e água" },
      { label: "Reservatório aspirador", value: "12 L" },
      { label: "Itens inclusos", value: "Lavadora + aspirador + acessórios" },
    ] },
  { id: 8, name: "Kit Jogo Ferramentas Maleta 128 Peças Soquetes Chaves Vonder", image: "assets/products/vonder-kit-ferramentas-128.webp", price: "R$ 68,00", oldPrice: "R$ 300,00", rating: "4.9", sold: "183", brand: "Vonder", category: "acessorio",
    description: "Jogo de ferramentas Vonder com 128 peças em maleta organizadora. Inclui soquetes em polegadas e milímetros, chaves combinadas, chaves Allen, alicates, chaves de fenda e bits. Indicado para mecânica em geral, manutenção residencial e profissional.",
    specs: [
      { label: "Quantidade de peças", value: "128" },
      { label: "Material", value: "Aço cromo vanádio" },
      { label: "Encaixe soquetes", value: '1/4" e 1/2"' },
      { label: "Embalagem", value: "Maleta organizadora" },
    ] },
  { id: 12, name: "Jogo De Ferramentas Com 163 Peças Vonder Reparos Geral", image: "assets/products/vonder-kit-ferramentas-163.webp", price: "R$ 60,00", oldPrice: "R$ 199,90", rating: "4.8", sold: "5", brand: "Vonder", category: "acessorio",
    description: "Jogo Vonder com 163 peças para reparos em geral, organizado em maleta resistente. Reúne soquetes, chaves combinadas, chaves de fenda, bits, alicate, martelo, fita métrica e diversos acessórios para mecânica leve, manutenção doméstica e pequenos consertos.",
    specs: [
      { label: "Quantidade de peças", value: "163" },
      { label: "Aplicação", value: "Reparos gerais e mecânica leve" },
      { label: "Material", value: "Aço cromo vanádio" },
      { label: "Embalagem", value: "Maleta plástica" },
    ] },
  { id: 1, name: "Esmerilhadeira Angular Vonder EAV 860N 860W + Acessório", image: "assets/products/vonder-esmerilhadeira-eav860.webp", price: "R$ 58,00", oldPrice: "R$ 244,00", rating: "4.8", sold: "4.426", brand: "Vonder", category: "acessorio",
    description: 'Esmerilhadeira angular Vonder EAV 860N com motor de 860 W e disco de 4.1/2", indicada para corte e desbaste em metais, alvenaria e cerâmica. Empunhadura auxiliar com duas posições de fixação para mais controle e segurança em diferentes ângulos de trabalho.',
    specs: [
      { label: "Potência", value: "860 W" },
      { label: "Disco", value: '4.1/2" (115 mm)' },
      { label: "Rotação", value: "11.000 rpm" },
      { label: "Aplicação", value: "Corte e desbaste" },
    ],
    variants: [{ label: "Voltagem", options: ["127V", "220V"] }] },
  { id: 2, name: "Inversor Para Solda Eletrodo e TIG Im125 C/ Máscara Escurecimento Automático Vonder", image: "assets/products/vonder-inversor-solda-im125.webp", price: "R$ 78,00", oldPrice: "R$ 399,00", rating: "4.9", sold: "770", brand: "Vonder", category: "acessorio",
    description: "Inversor de solda Vonder IM125 bivolt automático, compatível com processos eletrodo revestido (MMA) e TIG. Acompanha máscara de escurecimento automático para proteção dos olhos. Ideal para soldas leves em ferro, aço carbono e inox em manutenção e pequenos projetos.",
    specs: [
      { label: "Corrente máxima", value: "120 A" },
      { label: "Tensão", value: "Bivolt automático (127V/220V)" },
      { label: "Processos", value: "Eletrodo (MMA) e TIG" },
      { label: "Eletrodos compatíveis", value: "1,6 a 2,5 mm" },
    ] },
  { id: 4, name: "Furadeira Parafusadeira Impacto Bateria - Pfv238i Vonder", image: "assets/products/vonder-furadeira-pfv238i.webp", price: "R$ 54,00", oldPrice: "R$ 175,00", rating: "4.8", sold: "5.927", brand: "Vonder", category: "furadeira",
    description: "Parafusadeira/furadeira de impacto Vonder PFV 238i a bateria de 20 V, com função impacto para furar concreto e alvenaria. Velocidade variável, reversão de giro e mandril de aperto rápido. Acompanha maleta, brocas, bits, bateria e carregador bivolt automático.",
    specs: [
      { label: "Tensão da bateria", value: "20 V" },
      { label: "Funções", value: "Furar, parafusar e impacto" },
      { label: "Mandril", value: "10 mm aperto rápido" },
      { label: "Carregador", value: "Bivolt automático" },
    ],
    variants: [{ label: "Voltagem", options: ["127/220V"] }] },
  { id: 6, name: "Parafusadeira E Furadeira A Bateria Pfv 238 Completa Com Maleta De Transporte E Acessórios - Vonder", image: "assets/products/vonder-parafusadeira-pfv238.webp", price: "R$ 58,00", oldPrice: "R$ 149,99", rating: "4.8", sold: "3.193", brand: "Vonder", category: "furadeira",
    description: "Parafusadeira/furadeira a bateria Vonder PFV 238 de 20 V, com maleta de transporte e kit completo de acessórios. Inclui brocas de aço rápido, bits e soquetes para parafusar e furar madeira, metal e alvenaria leve. Ideal para uso doméstico e pequenos reparos.",
    specs: [
      { label: "Tensão da bateria", value: "20 V" },
      { label: "Funções", value: "Furar e parafusar" },
      { label: "Acessórios", value: "6 brocas + 6 bits + soquetes" },
      { label: "Carregador", value: "Bivolt automático" },
    ] },
  { id: 11, name: "Esmerilhadeira Angular Vonder EAV 650 50Hz/60Hz Cor Amarelo", image: "assets/products/vonder-esmerilhadeira-eav650.webp", price: "R$ 48,00", oldPrice: "R$ 117,00", rating: "4.8", sold: "3.844", brand: "Vonder", category: "acessorio",
    description: 'Esmerilhadeira angular Vonder EAV 650 com motor de 650 W e disco de 4.1/2" (115 mm), compacta e leve. Indicada para corte e desbaste de metais e alvenaria em obras, manutenção e marcenaria. Empunhadura lateral em duas posições para uso confortável.',
    specs: [
      { label: "Potência", value: "650 W" },
      { label: "Disco", value: '4.1/2" (115 mm)' },
      { label: "Rotação", value: "11.000 rpm" },
      { label: "Frequência", value: "50/60 Hz" },
    ],
    variants: [{ label: "Voltagem", options: ["127V", "220V"] }] },
  { id: 13, name: "Serra Mármore Profissional Vonder SMV1300s 1300W", image: "assets/products/vonder-serra-marmore-smv1300.webp", price: "R$ 60,00", oldPrice: "R$ 198,00", rating: "4.8", sold: "8.819", brand: "Vonder", category: "serra",
    description: 'Serra mármore profissional Vonder SMV1300S com motor de 1300 W e disco de 4.3/8". Realiza cortes precisos em mármore, granito, porcelanato, cerâmica e materiais cerâmicos em geral. Base de apoio regulável para ajuste de profundidade e cortes retos.',
    specs: [
      { label: "Potência", value: "1300 W" },
      { label: "Disco", value: '4.3/8" (110 mm)' },
      { label: "Rotação", value: "12.000 rpm" },
      { label: "Aplicação", value: "Mármore, granito e cerâmica" },
    ],
    variants: [{ label: "Voltagem", options: ["127V", "220V"] }] },
];

const orderBumpProducts = [
  { id: 95, name: "Bico Para Snow Foam Explosão De Espuma Banho P/ Lavador Vonder", image: "assets/products/vonder-bico-snow-foam.webp", price: "R$ 28,00", oldPrice: "R$ 99,00", rating: "4.7", sold: "617", brand: "Vonder", category: "acessorio" },
  { id: 94, name: "Aplicador De Espuma Snow Foam Com Shampoo Espumante Norton", image: "assets/products/vonder-snow-foam-shampoo.webp", price: "R$ 38,00", oldPrice: "R$ 156,80", rating: "4.8", sold: "892", brand: "Vonder", category: "acessorio" },
  { id: 98, name: "Trena Aço 5 mts X 19,0 mm Caixa com 12 Peças Vonder", image: "assets/products/vonder-trena-5m.webp", price: "R$ 18,00", oldPrice: "R$ 179,99", rating: "4.9", sold: "43", brand: "Vonder", category: "acessorio" },
  { id: 99, name: "Jogo De Chave Allen 1/16 A 3/8 Abaulada 12 Peças Vonder", image: "assets/products/vonder-chave-allen.webp", price: "R$ 14,00", oldPrice: "R$ 57,13", rating: "4.8", sold: "783", brand: "Vonder", category: "acessorio" },
  { id: 96, name: "Chave Catraca Reversível 1/4 Com Cabo Emborrachado Vonder", image: "assets/products/vonder-chave-catraca.webp", price: "R$ 18,00", oldPrice: "R$ 49,89", rating: "4.8", sold: "1.213", brand: "Vonder", category: "acessorio" },
];

const allProducts = [...products, ...orderBumpProducts];

function getProductById(id) {
  return allProducts.find((p) => p.id === id);
}

const categoryLabels = {
  lavadora: "Lavadoras de Alta Pressão",
  furadeira: "Furadeiras & Parafusadeiras",
  serra: "Serras",
  acessorio: "Ferramentas & Acessórios",
};
