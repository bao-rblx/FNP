export type ProductCategory = 'models' | 'characters' | 'vehicles' | 'environments' | 'props';

export interface ProductVariant {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  price: number;
  variants?: ProductVariant[];
  category: ProductCategory;
  image: string;
  unit: string;
  minQuantity?: number;
  pickupOnly?: boolean;
  stockLimit?: number;
  isPromotion?: boolean;

  // 3D Model Metadata & Download Access
  modelViewerUrl?: string;
  downloadUrl?: string;
  subName?: string;
  rating?: number;
  reviewCount?: number;
  polyCount?: string;
  vertexCount?: string;
  textures?: string;
  rigged?: boolean;
  animated?: boolean;
  formats?: string[];
  accentColor?: string;
  tags?: string[];
}

export const products: Product[] = [
  {
    id: 'dark_cosmic_jhin',
    name: 'Model 3D Dark Cosmic Jhin',
    nameEn: 'Dark Cosmic Jhin 3D Model',
    description: 'Mô hình 3D Dark Cosmic Jhin sắc nét, chi tiết vật liệu 4K PBR cao cấp, đầy đủ râu và xương chuyển động.',
    descriptionEn: 'Premium Dark Cosmic Jhin 3D model with 4K PBR materials and full skeletal rigging.',
    price: 1450000,
    category: 'characters',
    image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jhin_5.jpg',
    unit: 'mỗi model',
    minQuantity: 1,
    pickupOnly: false,
    isPromotion: false,
    stockLimit: 0,
    modelViewerUrl: '/polystore/models/dark_cosmic_jhin.glb',
    downloadUrl: 'https://poly.store/dl/dark_cosmic_jhin_asset_v2.zip',
    subName: 'JHIN • LEAGUE OF LEGENDS',
    rating: 4.9,
    reviewCount: 150,
    polyCount: '50,000 Triangles',
    vertexCount: '25,000 Vertices',
    textures: '4K PBR Textures',
    rigged: true,
    animated: true,
    formats: ['GLTF', 'GLB', 'FBX', 'OBJ'],
    accentColor: '#8b5cf6',
    tags: ['League of Legends', 'Jhin', 'Character'],
  },
  {
    id: 'divine_architect_porcelain_aurelion_sol',
    name: 'Model 3D Divine Architect Porcelain Aurelion Sol',
    nameEn: 'Divine Architect Porcelain Aurelion Sol 3D Model',
    description: 'Mô hình 3D Divine Architect Porcelain Aurelion Sol rồng vũ trụ hoa văn gốm sứ tinh xảo.',
    descriptionEn: 'Premium Divine Architect Porcelain Aurelion Sol cosmic dragon 3D model.',
    price: 1450000,
    category: 'characters',
    image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/AurelionSol_38.jpg',
    unit: 'mỗi model',
    minQuantity: 1,
    pickupOnly: false,
    isPromotion: false,
    stockLimit: 0,
    modelViewerUrl: '/polystore/models/divine_architect_porcelain_aurelion_sol.glb',
    downloadUrl: 'https://poly.store/dl/aurelion_sol_porcelain.zip',
    subName: 'AURELION SOL • LEAGUE OF LEGENDS',
    rating: 4.9,
    reviewCount: 162,
    polyCount: '65,000 Triangles',
    vertexCount: '32,000 Vertices',
    textures: '4K PBR Textures',
    rigged: true,
    animated: true,
    formats: ['GLTF', 'GLB', 'FBX'],
    accentColor: '#06b6d4',
    tags: ['League of Legends', 'Aurelion Sol', 'Dragon'],
  },
  {
    id: 'dream_dragon_yasuo',
    name: 'Model 3D Dream Dragon Yasuo',
    nameEn: 'Dream Dragon Yasuo 3D Model',
    description: 'Mô hình 3D Dream Dragon Yasuo kiếm sĩ rồng mộng mơ với hiệu ứng ánh sáng rực rỡ.',
    descriptionEn: 'Premium Dream Dragon Yasuo 3D model with glowing dragon FX.',
    price: 1450000,
    category: 'characters',
    image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_55.jpg',
    unit: 'mỗi model',
    minQuantity: 1,
    pickupOnly: false,
    isPromotion: false,
    stockLimit: 0,
    modelViewerUrl: '/polystore/models/dream_dragon_yasuo.glb',
    downloadUrl: 'https://poly.store/dl/dream_dragon_yasuo.zip',
    subName: 'YASUO • LEAGUE OF LEGENDS',
    rating: 4.9,
    reviewCount: 174,
    polyCount: '48,000 Triangles',
    vertexCount: '24,000 Vertices',
    textures: '4K PBR Textures',
    rigged: true,
    animated: true,
    formats: ['GLTF', 'GLB', 'FBX', 'BLEND'],
    accentColor: '#6366f1',
    tags: ['League of Legends', 'Yasuo', 'Warrior'],
  },
  {
    id: 'fallen_god-king_garen',
    name: 'Model 3D Fallen God King Garen',
    nameEn: 'Fallen God King Garen 3D Model',
    description: 'Mô hình 3D Fallen God King Garen chiến thần giáp trụ mạnh mẽ.',
    descriptionEn: 'Premium Fallen God King Garen armored warrior 3D model.',
    price: 1450000,
    category: 'characters',
    image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Garen_44.jpg',
    unit: 'mỗi model',
    minQuantity: 1,
    pickupOnly: false,
    isPromotion: false,
    stockLimit: 0,
    modelViewerUrl: '/polystore/models/fallen_god-king_garen.glb',
    downloadUrl: 'https://poly.store/dl/god_king_garen.zip',
    subName: 'GAREN • LEAGUE OF LEGENDS',
    rating: 4.8,
    reviewCount: 140,
    polyCount: '52,000 Triangles',
    vertexCount: '26,000 Vertices',
    textures: '4K PBR Textures',
    rigged: true,
    animated: true,
    formats: ['GLTF', 'GLB', 'FBX'],
    accentColor: '#ef4444',
    tags: ['League of Legends', 'Garen', 'Armor'],
  },
  {
    id: 'mech_warrior_v1',
    name: 'Model 3D Sci-Fi Mech Warrior V1',
    nameEn: 'Sci-Fi Mech Warrior V1 3D Model',
    description: 'Mô hình robot mech viễn tưởng chi tiết cao, thích hợp cho game Unreal Engine và Unity.',
    descriptionEn: 'High-detail Sci-Fi mech warrior model ready for UE & Unity game engines.',
    price: 850000,
    category: 'vehicles',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop',
    unit: 'mỗi model',
    minQuantity: 1,
    modelViewerUrl: '',
    downloadUrl: 'https://poly.store/dl/mech_warrior_v1.zip',
    subName: 'SCI-FI MECH • GAME ASSET',
    rating: 4.7,
    reviewCount: 88,
    polyCount: '38,000 Triangles',
    vertexCount: '19,000 Vertices',
    textures: '4K PBR Textures',
    rigged: true,
    animated: true,
    formats: ['FBX', 'OBJ', 'BLEND'],
    accentColor: '#06b6d4',
    tags: ['Sci-Fi', 'Mech', 'Robot'],
  },
  {
    id: 'cyberpunk_city_kit',
    name: 'Bộ 3D Asset Cyberpunk Environment',
    nameEn: 'Cyberpunk Environment Modular 3D Kit',
    description: 'Bộ Modular City Kit xây dựng thành phố tương lai đầy đủ biển hiệu Neon và tòa nhà 3D.',
    descriptionEn: 'Modular 3D cyberpunk city assets with neon signs and futuristic buildings.',
    price: 1200000,
    category: 'environments',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop',
    unit: 'mỗi bộ',
    minQuantity: 1,
    downloadUrl: 'https://poly.store/dl/cyberpunk_city_pack.zip',
    subName: 'ENVIRONMENT PACK • MODULAR',
    rating: 4.9,
    reviewCount: 210,
    polyCount: '120,000 Triangles',
    vertexCount: '75,000 Vertices',
    textures: '4K PBR Textures',
    rigged: false,
    animated: false,
    formats: ['FBX', 'OBJ', 'BLEND', 'MAX'],
    accentColor: '#a855f7',
    tags: ['Environment', 'Cyberpunk', 'City'],
  },
  {
    id: 'sci_fi_weapons_pack',
    name: 'Bộ 3D Sci-Fi Weapons Pack',
    nameEn: 'Sci-Fi Weapons 3D Pack',
    description: 'Bộ 10 loại vũ khí năng lượng viễn tưởng sẵn sàng gắn khung xương nhân vật.',
    descriptionEn: 'Pack of 10 Sci-Fi energy weapons optimized for first-person shooters.',
    price: 650000,
    category: 'props',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop',
    unit: 'mỗi bộ',
    minQuantity: 1,
    downloadUrl: 'https://poly.store/dl/scifi_weapons_pack.zip',
    subName: 'PROPS PACK • WEAPONS',
    rating: 4.8,
    reviewCount: 95,
    polyCount: '25,000 Triangles',
    vertexCount: '13,000 Vertices',
    textures: '2K & 4K PBR',
    rigged: true,
    animated: true,
    formats: ['FBX', 'OBJ'],
    accentColor: '#3b82f6',
    tags: ['Weapons', 'Sci-Fi', 'Props'],
  }
];

const unitTranslations: Record<string, string> = {
  'mỗi model': 'per model',
  'mỗi bộ': 'per kit',
  'mỗi asset': 'per asset',
  'mỗi trang': 'per asset',
  'mỗi cái': 'per item',
};

export function translateUnit(unit: string, language: 'vi' | 'en'): string {
  if (language === 'vi') return unit;
  return unitTranslations[unit] ?? unit;
}

export interface CartItem extends Product {
  quantity: number;
  files?: File[];
}

export interface OrderNotificationRow {
  id: number;
  message: string;
  createdAt: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled';
  createdAt: Date;
  estimatedTime?: string;
  deliveryAddress?: string;
  pickupLocation?: string;
  paymentMethod?: string;
  paymentStatus?: 'unpaid' | 'pending_verification' | 'paid';
  deliveryDate?: string;
  deliveryTime?: string;
  receivedPoints?: number;
  cancelReason?: string;
  notifications?: OrderNotificationRow[];
  guestName?: string;
  guestPhone?: string;
}
