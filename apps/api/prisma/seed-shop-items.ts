import { PrismaClient, ShopItemCategory } from '@prisma/client';

const prisma = new PrismaClient();

const items = [
  {
    key: 'STREAK_FREEZE_1D',
    name: 'Protector de racha (1 día)',
    description:
      'Salta un día sin práctica para mantener tu racha de días consecutivos.',
    priceGems: 60,
    maxQuantity: 5,
    category: ShopItemCategory.CONSUMABLE,
    effectData: { days: 1 },
  },
  {
    key: 'ENERGY_REFILL_25',
    name: 'Recarga de energía',
    description: 'Restaura 25 puntos de energía al instante.',
    priceGems: 40,
    maxQuantity: null,
    category: ShopItemCategory.CONSUMABLE,
    effectData: { energy: 25 },
  },
  {
    key: 'GEM_BOOST_30MIN',
    name: 'Potenciador de gemas x2',
    description: 'Duplica las gemas que ganes durante 30 minutos.',
    priceGems: 100,
    maxQuantity: 2,
    category: ShopItemCategory.BOOST,
    effectData: { multiplier: 2, durationMinutes: 30 },
  },
  {
    key: 'RATING_SHIELD_50',
    name: 'Escudo de Rating',
    description:
      'Absorbe el 50% de la bajada de rating en tu próximo simulacro oficial.',
    priceGems: 100,
    maxQuantity: 3,
    category: ShopItemCategory.RATING,
    effectData: { reduceLossPercent: 50 },
  },
  {
    key: 'RATING_FREEZE',
    name: 'Congelador de Rating',
    description:
      'Evita que bajes de rating en tu próximo simulacro oficial.',
    priceGems: 250,
    maxQuantity: 1,
    category: ShopItemCategory.RATING,
    effectData: { freezeLoss: true },
  },
  {
    key: 'RATING_BOOSTER',
    name: 'Potenciador de Rating',
    description: 'Aumenta en 50% la subida de rating si rindes bien.',
    priceGems: 150,
    maxQuantity: 2,
    category: ShopItemCategory.RATING,
    effectData: { boostGainPercent: 50 },
  },
  {
    key: 'FRAME_GOLD',
    name: 'Marco dorado',
    description: 'Marco exclusivo dorado para tu avatar.',
    priceGems: 200,
    maxQuantity: 1,
    category: ShopItemCategory.COSMETIC,
    effectData: { type: 'frame' },
  },
  {
    key: 'FRAME_CACHIMBO',
    name: 'Marco Cachimbo',
    description: 'Marco especial para los más competitivos.',
    priceGems: 500,
    maxQuantity: 1,
    category: ShopItemCategory.COSMETIC,
    effectData: { type: 'frame' },
  },
  {
    key: 'THEME_DARK',
    name: 'Tema oscuro',
    description: 'Desbloquea el tema oscuro de la app.',
    priceGems: 150,
    maxQuantity: 1,
    category: ShopItemCategory.COSMETIC,
    effectData: { type: 'theme' },
  },
];

async function main() {
  for (const item of items) {
    await prisma.shopItem.upsert({
      where: { key: item.key },
      update: item,
      create: item,
    });
  }
  console.log(`✅ ${items.length} items de tienda sembrados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
