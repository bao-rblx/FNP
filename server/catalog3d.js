/**
 * Canonical PolyStore 3D catalog (single source of truth for DB seeding).
 * Mirrors src/app/data/polystoreProducts.ts. Categories are all 3D-model
 * categories; anything else in the products table is legacy printing data.
 */

export const MODEL_CATEGORIES = ['models', 'characters', 'vehicles', 'environments', 'props'];

const IMG = {
  jhin: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jhin_5.jpg',
  aurelionSol: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/AurelionSol_38.jpg',
  yasuo: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_55.jpg',
  garen: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Garen_44.jpg',
  zaahen: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Zaahen_1.jpg',
  missFortune: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/MissFortune_69.jpg',
  caitlyn: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Caitlyn_51.jpg',
  veigar: 'https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/characters/veigar/skins/skin67/images/veigar_splash_uncentered_67.skins_veigar_skin67.jpg',
  samira: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Samira_30.jpg',
  ahri: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_88.jpg',
  akali: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Akali_61.jpg',
  galio: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Galio_47.jpg',
};

function model(id, name, nameEn, image, sub, champ, reviewCount) {
  return {
    id,
    name,
    nameEn,
    description: `Mô hình 3D ${champ} sắc nét, chi tiết vật liệu cao cấp.`,
    descriptionEn: `Premium ${champ} 3D model with high-detail materials.`,
    price: 1450000,
    category: 'models',
    image,
    unit: 'mỗi model',
    minQuantity: 1,
    pickupOnly: false,
    isPromotion: false,
    stockLimit: 0,
    modelViewerUrl: `/polystore/models/${id}.glb`,
    subName: sub,
    rating: 4.9,
    reviewCount,
    polyCount: '50,000 Triangles',
    vertexCount: '25,000 Vertices',
    textures: '4K PBR Textures',
    rigged: true,
    animated: true,
    formats: ['GLTF', 'GLB'],
    accentColor: '#8b5cf6',
    tags: ['League of Legends', champ],
  };
}

export const catalog3d = [
  model('dark_cosmic_jhin', 'Model 3D Dark Cosmic Jhin', 'Dark Cosmic Jhin 3D Model', IMG.jhin, 'JHIN • LEAGUE OF LEGENDS', 'Jhin', 150),
  model('divine_architect_porcelain_aurelion_sol', 'Model 3D Divine Architect Porcelain Aurelion Sol', 'Divine Architect Porcelain Aurelion Sol 3D Model', IMG.aurelionSol, 'AURELION SOL • LEAGUE OF LEGENDS', 'Aurelion Sol', 162),
  model('dream_dragon_yasuo', 'Model 3D Dream Dragon Yasuo', 'Dream Dragon Yasuo 3D Model', IMG.yasuo, 'YASUO • LEAGUE OF LEGENDS', 'Yasuo', 174),
  model('fallen_god-king_garen', 'Model 3D Fallen God King Garen', 'Fallen God King Garen 3D Model', IMG.garen, 'GAREN • LEAGUE OF LEGENDS', 'Garen', 186),
  model('immortal_journey_zaahen', 'Model 3D Immortal Journey Zaahen', 'Immortal Journey Zaahen 3D Model', IMG.zaahen, 'AHRI • LEAGUE OF LEGENDS', 'Ahri', 198),
  model('mvp_t1_miss_fortune', 'Model 3D MVP T1 Miss Fortune', 'MVP T1 Miss Fortune 3D Model', IMG.missFortune, 'MISS FORTUNE • LEAGUE OF LEGENDS', 'Miss Fortune', 210),
  model('prestige_arcane_commander_caitlyn', 'Model 3D Prestige Arcane Commander Caitlyn', 'Prestige Arcane Commander Caitlyn 3D Model', IMG.caitlyn, 'CAITLYN • LEAGUE OF LEGENDS', 'Caitlyn', 222),
  model('prestige_magma_chamber_veigar', 'Model 3D Prestige Magma Chamber Veigar', 'Prestige Magma Chamber Veigar 3D Model', IMG.veigar, 'VEIGAR • LEAGUE OF LEGENDS', 'Veigar', 234),
  model('soul_fighter_samira', 'Model 3D Soul Fighter Samira', 'Soul Fighter Samira 3D Model', IMG.samira, 'SAMIRA • LEAGUE OF LEGENDS', 'Samira', 246),
  model('spirit_blossom_springs_ahri', 'Model 3D Spirit Blossom Springs Ahri', 'Spirit Blossom Springs Ahri 3D Model', IMG.ahri, 'AHRI • LEAGUE OF LEGENDS', 'Ahri', 258),
  model('star_guardian_akali', 'Model 3D Star Guardian Akali', 'Star Guardian Akali 3D Model', IMG.akali, 'AKALI • LEAGUE OF LEGENDS', 'Akali', 270),
  model('t1_galio', 'Model 3D T1 Galio', 'T1 Galio 3D Model', IMG.galio, 'GALIO • LEAGUE OF LEGENDS', 'Galio', 282),
];
