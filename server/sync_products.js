import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to database
const DB_PATH = path.join(__dirname, '..', 'data', 'fnp.sqlite');
const db = new Database(DB_PATH);

console.log('--- FlashNPrint Product Sync (ESM) ---');
console.log('Target DB:', DB_PATH);

// Full product list
const allProducts = [
  {
    id: 'print-a4',
    name: 'In A4',
    nameEn: 'A4 print',
    description: 'In A4 tài liệu, tùy chọn đen trắng hoặc màu sắc',
    descriptionEn: 'A4 printing, optional B&W or Color.',
    price: 500,
    category: 'printing',
    image: 'https://insggiare.com/wp-content/uploads/2022/09/bao-gia-in-tai-lieu-a4-in-tai-lieu-mau-gia-re-1.jpg',
    unit: 'mỗi trang',
    minQuantity: 1,
    pickupOnly: 0,
    variants: [{ id: 'bw', name: 'Đen Trắng', price: 500 }, { id: 'color', name: 'In Màu', price: 2000 }]
  },
  {
    id: 'print-binding',
    name: 'Đóng Tài Liệu',
    nameEn: 'Document binding',
    description: 'Đóng tài liệu chuyên nghiệp dạng lò xo hoặc nhiệt',
    descriptionEn: 'Spiral or thermal binding.',
    price: 15000,
    category: 'printing',
    image: 'https://bizweb.dktcdn.net/thumb/1024x1024/100/044/539/products/in-tai-lieu-mau-01.jpg?v=1600677410183',
    unit: 'mỗi cuốn',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'print-laminate',
    name: 'Ép Plastic',
    nameEn: 'Lamination',
    description: 'Ép plastic A4 để bảo vệ tài liệu quan trọng',
    descriptionEn: 'A4 lamination to protect documents.',
    price: 5000,
    category: 'printing',
    image: 'https://mucinthanhdat.net/wp-content/uploads/2021/04/giay-ep-plastic-5.jpg',
    unit: 'mỗi trang',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'print-a3',
    name: 'In Khổ A3',
    nameEn: 'A3 print',
    description: 'In A3 chất lượng cao, tùy chọn đen trắng hoặc màu',
    descriptionEn: 'High-quality A3 printing.',
    price: 3000,
    category: 'printing',
    image: 'https://fact-depot.com/tmp/cache/images/_thumbs/720x720/media/product/14719/Giay-A3-Double-A-70-gsm.png',
    unit: 'mỗi trang',
    minQuantity: 1,
    pickupOnly: 0,
    variants: [{ id: 'bw', name: 'Đen Trắng', price: 3000 }, { id: 'color', name: 'In Màu', price: 8000 }]
  },
  {
    id: 'print-a2',
    name: 'In Khổ A2',
    nameEn: 'A2 print',
    description: 'In A2 cho bản vẽ hoặc dự án',
    descriptionEn: 'A2 printing for drawings or projects.',
    price: 15000,
    category: 'printing',
    image: 'https://fact-depot.com/tmp/cache/images/_thumbs/720x720/media/product/14719/Giay-A3-Double-A-70-gsm.png',
    unit: 'mỗi bản',
    minQuantity: 1,
    pickupOnly: 0,
    variants: [{ id: 'bw', name: 'Đen Trắng', price: 15000 }, { id: 'color', name: 'In Màu', price: 30000 }]
  },
  {
    id: 'print-a1',
    name: 'In Khổ Lớn A1',
    nameEn: 'A1 print',
    description: 'In A1 kỹ thuật, bản đồ, poster',
    descriptionEn: 'A1 large format printing.',
    price: 30000,
    category: 'printing',
    image: 'https://fact-depot.com/tmp/cache/images/_thumbs/720x720/media/product/14719/Giay-A3-Double-A-70-gsm.png',
    unit: 'mỗi bản',
    minQuantity: 1,
    pickupOnly: 0,
    variants: [{ id: 'bw', name: 'Đen Trắng', price: 30000 }, { id: 'color', name: 'In Màu', price: 60000 }]
  },
  {
    id: 'print-a0',
    name: 'In Khổ Lớn A0',
    nameEn: 'A0 print',
    description: 'In A0 khổ lớn chất lượng cao',
    descriptionEn: 'A0 extra large format printing.',
    price: 50000,
    category: 'printing',
    image: 'https://fact-depot.com/tmp/cache/images/_thumbs/720x720/media/product/14719/Giay-A3-Double-A-70-gsm.png',
    unit: 'mỗi bản',
    minQuantity: 1,
    pickupOnly: 0,
    variants: [{ id: 'bw', name: 'Đen Trắng', price: 50000 }, { id: 'color', name: 'In Màu', price: 100000 }]
  },
  {
    id: 'paper-a4',
    name: 'Giấy A4 (500 tờ)',
    nameEn: 'A4 paper (500 sheets)',
    description: 'Giấy A4 chất lượng cao, 80gsm',
    descriptionEn: 'Quality 80gsm A4 paper.',
    price: 70000,
    category: 'paper',
    image: 'https://muctim.vn/wp-content/uploads/2024/05/giay-in-a4-5.jpg',
    unit: 'mỗi ram',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'paper-a3',
    name: 'Giấy A3 (500 tờ)',
    nameEn: 'A3 paper (500 sheets)',
    description: 'Giấy A3 tiêu chuẩn 80gsm',
    descriptionEn: 'Quality 80gsm A3 paper.',
    price: 140000,
    category: 'paper',
    image: 'https://fact-depot.com/tmp/cache/images/_thumbs/720x720/media/product/14719/Giay-A3-Double-A-70-gsm.png',
    unit: 'mỗi ram',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'paper-a2',
    name: 'Giấy Khổ A2',
    nameEn: 'A2 paper',
    description: 'Giấy A2 cho bản vẽ kỹ thuật',
    descriptionEn: 'A2 paper for drafting.',
    price: 5000,
    category: 'paper',
    image: 'https://fact-depot.com/tmp/cache/images/_thumbs/720x720/media/product/14719/Giay-A3-Double-A-70-gsm.png',
    unit: 'mỗi tờ',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'paper-a1',
    name: 'Giấy Khổ A1',
    nameEn: 'A1 paper',
    description: 'Giấy A1 cỡ lớn',
    descriptionEn: 'A1 large format paper.',
    price: 10000,
    category: 'paper',
    image: 'https://fact-depot.com/tmp/cache/images/_thumbs/720x720/media/product/14719/Giay-A3-Double-A-70-gsm.png',
    unit: 'mỗi tờ',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'paper-a0',
    name: 'Giấy Khổ A0',
    nameEn: 'A0 paper',
    description: 'Giấy A0 siêu lớn',
    descriptionEn: 'A0 extra large format paper.',
    price: 20000,
    category: 'paper',
    image: 'https://fact-depot.com/tmp/cache/images/_thumbs/720x720/media/product/14719/Giay-A3-Double-A-70-gsm.png',
    unit: 'mỗi tờ',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'paper-colored',
    name: 'Giấy In Ảnh',
    nameEn: 'Photo paper',
    description: 'Giấy in ảnh bóng cao cấp A4',
    descriptionEn: 'Premium glossy A4 photo paper.',
    price: 60000,
    category: 'paper',
    image: 'https://giayincholon.com/pub/media/NHAP/1MA4/giay-in-anh-1-mat-a4-1.jpg',
    unit: 'mỗi xấp',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'paper-cardstock',
    name: 'Giấy Bìa Cứng',
    nameEn: 'Cardstock',
    description: 'Giấy bìa dày cho bài thuyết trình và bìa tài liệu',
    descriptionEn: 'Thick cover stock for reports.',
    price: 90000,
    category: 'paper',
    image: 'https://bizweb.dktcdn.net/100/236/638/products/giay-bia-cung-370cb57a-f148-488d-b564-d7b36258303c.jpg?v=1691405232363',
    unit: 'mỗi bộ',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'supply-stapler',
    name: 'Bấm Kim Mini',
    nameEn: 'Mini stapler',
    description: 'Bấm kim nhỏ gọn dễ mang theo',
    descriptionEn: 'Compact multi-use stapler.',
    price: 25000,
    category: 'supplies',
    image: 'https://thfvnext.bing.com/th/id/OIP.S8aTImA848_DdlL9A_ZxHwHaHa?cb=thfvnext&w=600&h=600&rs=1&pid=ImgDetMain&o=7&rm=3',
    unit: 'mỗi cái',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'supply-clips',
    name: 'Kẹp Giấy',
    nameEn: 'Paper clips',
    description: 'Hộp kẹp giấy kim loại',
    descriptionEn: 'Metal paper clips box.',
    price: 10000,
    category: 'supplies',
    image: 'https://down-vn.img.susercontent.com/file/vn-11134211-7qukw-lfxqek4kpg162f',
    unit: 'mỗi hộp',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'supply-folders',
    name: 'Bìa Trong Suốt',
    nameEn: 'Clear folders',
    description: 'Bìa lá nhựa trong suốt A4',
    descriptionEn: 'A4 clear plastic folders.',
    price: 8000,
    category: 'supplies',
    image: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-llnakcu2847j45',
    unit: 'xấp 10 cái',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'supply-pen',
    name: 'Bộ Bút Bi',
    nameEn: 'Ballpoint pens',
    description: 'Bút bi xanh và đen, bộ 12 cây',
    descriptionEn: 'Blue & black, pack of 12.',
    price: 20000,
    category: 'supplies',
    image: 'https://down-my.img.susercontent.com/file/557d12217b8a3f528320d8f9ad74b171',
    unit: 'mỗi bộ',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'supply-highlighter',
    name: 'Bộ Bút Dạ Quang',
    nameEn: 'Highlighters',
    description: 'Bút dạ quang nhiều màu cho học tập',
    descriptionEn: 'Multi-color highlighters.',
    price: 30000,
    category: 'supplies',
    image: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lm2nff1oc2cf08',
    unit: 'mỗi bộ',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'supply-ruler',
    name: 'Thước Kẻ Nhựa',
    nameEn: 'Plastic ruler',
    description: 'Thước kẻ nhựa trong 20cm',
    descriptionEn: '20cm clear plastic ruler.',
    price: 5000,
    category: 'supplies',
    image: 'https://lzd-img-global.slatic.net/g/p/2e7d4e14159ade467c038d1fb09e30dd.jpg_720x720q80.jpg',
    unit: 'mỗi cái',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'supply-eraser',
    name: 'Tẩy / Gôm',
    nameEn: 'Eraser',
    description: 'Gôm siêu sạch không vụn',
    descriptionEn: 'Dust-free clean eraser.',
    price: 4000,
    category: 'supplies',
    image: 'https://cdn.tgdd.vn/Products/Images/10338/251770/bhx/gom-tay-thien-long-e-06-202111121138488980.jpeg',
    unit: 'mỗi cục',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'supply-tape',
    name: 'Băng Keo Trong',
    nameEn: 'Clear tape',
    description: 'Cuộn băng keo trong cỡ từ nhỏ đến vừa',
    descriptionEn: 'Roll of clear adhesive tape.',
    price: 10000,
    category: 'supplies',
    image: 'https://thfvnext.bing.com/th/id/OIP.9zl4Sx1nmqFED_lnI4wY5AHaHa?cb=thfvnext&rs=1&pid=ImgDetMain&o=7&rm=3',
    unit: 'cuộn',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'svc-scan',
    name: 'Scan Tài Liệu',
    nameEn: 'Document scanning',
    description: 'Scan màu/đen trắng, xuất PDF hoặc JPG',
    descriptionEn: 'Color or B&W scanning to PDF/JPG.',
    price: 2000,
    category: 'services',
    image: 'https://phongvu.vn/cong-nghe/wp-content/uploads/2021/11/cach-scan-tai-lieu-bang-dien-thoai.jpg',
    unit: 'mỗi tập 10 trang',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'svc-photo-id',
    name: 'Chụp Ảnh Thẻ / Hộ Chiếu',
    nameEn: 'ID / passport photos',
    description: 'Chụp ảnh thẻ chuẩn khổ, in ngay tại quầy',
    descriptionEn: 'Standard ID photo prints.',
    price: 45000,
    category: 'services',
    image: 'https://www.zumi.media/wp-content/uploads/2019/10/ggggggggggggg.jpg',
    unit: 'mỗi bộ 6 ảnh',
    minQuantity: 1,
    pickupOnly: 1
  },
  {
    id: 'svc-design-simple',
    name: 'Hỗ Trợ Thiết Kế Đơn Giản',
    nameEn: 'Simple layout help',
    description: 'Chỉnh file banner, poster cơ bản (Canva / PDF)',
    descriptionEn: 'Basic layout fixes for banners/posters.',
    price: 50000,
    category: 'services',
    image: 'https://www.architecturelab.net/wp-content/uploads/2024/05/Photoshop-Should-you-buy-it-The-Architect-Verdict.jpg',
    unit: 'mỗi file',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'svc-translate',
    name: 'Dịch Thuật Văn Bản',
    nameEn: 'Document translation',
    description: 'Dịch thuật Anh - Việt cấp tốc cho tài liệu, báo cáo',
    descriptionEn: 'Fast EN-VI translation for reports.',
    price: 150000,
    category: 'services',
    image: 'https://cdn-media.sforum.vn/storage/app/media/Van%20Pham/3/3g/cong-cu-dich-thuat-ai-5.jpg',
    unit: 'mỗi trang',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'goods-standee',
    name: 'Standee Mô Hình',
    nameEn: 'Cut-out standee',
    description: 'Standee formex / foam board cho sự kiện, CLB',
    descriptionEn: 'Foam board standees for events & clubs.',
    price: 280000,
    category: 'goods',
    image: 'https://beaumontandco.ca/wp-content/uploads/2024/01/SIDEWALK-SIGN-9-1.jpg',
    unit: 'mỗi cái (khổ A2)',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'goods-roll-up',
    name: 'Standee Cuốn (Roll-up)',
    nameEn: 'Roll-up banner',
    description: 'Banner cuốn khung nhôm, in UV bền màu',
    descriptionEn: 'Aluminum roll-up with UV print.',
    price: 650000,
    category: 'goods',
    image: 'https://i.pinimg.com/736x/74/a7/b1/74a7b109ed5a2588f9164a62228a666e.jpg',
    unit: 'mỗi bộ 85x200cm',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'goods-billboard',
    name: 'In Pano / Billboard Khổ Lớn',
    nameEn: 'Large billboard print',
    description: 'In bạt khổ lớn cho sân khấu, cổng trường',
    descriptionEn: 'Large PVC mesh for outdoor display.',
    price: 120000,
    category: 'goods',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg2IX8LJ49widNFlLSH8HUjAGBt-b7WvfAmTXIlNfbg80aNEYFg5KQNkLIOh2Zq_xiHS5dHX_D0tABWmWgbrfj_4SreWREyQ4j2sdfGbv9Tt3iXYPEd0rgJyKgvHca6CFZfq4PHpQP6Uuo/w640-h480/in+pano+ch%25E1%25BA%25A5t+l%25C6%25B0%25E1%25BB%25A3ng+cao.jpg',
    unit: 'mỗi m²',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'goods-banner-pvc',
    name: 'Banner PVC / Hiflex',
    nameEn: 'PVC / flex banner',
    description: 'Banner sự kiện, leo rank, cổng game',
    descriptionEn: 'Event banners, stage backdrops.',
    price: 95000,
    category: 'goods',
    image: 'https://tienad.com/wp-content/uploads/Mau-in-banner-hiflex.webp',
    unit: 'mỗi m²',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'goods-keychain',
    name: 'Móc Khóa In UV',
    nameEn: 'UV-print keychains',
    description: 'Móc khóa mica in logo CLB, giveaway',
    descriptionEn: 'Acrylic keychains with UV print.',
    price: 35000,
    category: 'goods',
    image: 'https://sanxuatbangten.com.vn/wp-content/uploads/2022/11/Moc-khoa-mica-25-1059x1200.jpg',
    unit: 'mỗi cái (từ 10 cái)',
    minQuantity: 10,
    pickupOnly: 0
  },
  {
    id: 'goods-ticket',
    name: 'Vé Tay / Vé Sự Kiện',
    nameEn: 'Event hand tickets',
    description: 'In vé giấy có số, tem xé cho concert, workshop',
    descriptionEn: 'Numbered tear-off tickets.',
    price: 1500,
    category: 'goods',
    image: 'https://vietadv.vn/wp-content/uploads/2020/07/ve-moi-su-kien.jpg',
    unit: 'mỗi tờ',
    minQuantity: 50,
    pickupOnly: 0
  },
  {
    id: 'goods-sticker-die',
    name: 'Sticker Cắt Hình (Die-cut)',
    nameEn: 'Die-cut stickers',
    description: 'Sticker logo, hình mascot cắt theo viền',
    descriptionEn: 'Custom-shaped vinyl stickers.',
    price: 80000,
    category: 'goods',
    image: 'https://vietadv.vn/wp-content/uploads/2020/07/ve-moi-su-kien.jpg',
    unit: 'mỗi tờ A3',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'goods-sticker-sheet',
    name: 'Sticker Sheet A4',
    nameEn: 'A4 sticker sheets',
    description: 'In sticker lên giấy hoặc nhựa trong, cắt A4',
    descriptionEn: 'Full A4 sticker sheets.',
    price: 45000,
    category: 'goods',
    image: 'https://creatify.mx/wp-content/uploads/2024/01/Sticker-Sheets.png.webp',
    unit: 'mỗi tờ',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'goods-foam-board',
    name: 'Bảng Foam / Formex',
    nameEn: 'Foam board signs',
    description: 'Cắt khổ poster dày cho booth, hướng dẫn',
    descriptionEn: 'Thick foam signs for booths.',
    price: 110000,
    category: 'goods',
    image: 'https://saomai234.com/upload/products/thumb_630x0/z3546142173645-e6863d4a8cf9f4b0ec9aaa95839f81c0-1672211487.jpg',
    unit: 'mỗi tấm 60x90cm',
    minQuantity: 1,
    pickupOnly: 0
  },
  {
    id: 'goods-wristband',
    name: 'Vòng Tay Sự Kiện (Tyvek)',
    nameEn: 'Tyvek wristbands',
    description: 'Vòng tay một lần cho concert, teambuilding',
    descriptionEn: 'Single-use event wristbands.',
    price: 8000,
    category: 'goods',
    image: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ltq5knekqpsa50',
    unit: 'mỗi cái (lô 100)',
    minQuantity: 100,
    pickupOnly: 0
  }
];

const stmt = db.prepare(`
  INSERT INTO products (id, name, name_en, description, description_en, price, category, image, unit, min_quantity, pickup_only, variants_json)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    name=excluded.name,
    name_en=excluded.name_en,
    description=excluded.description,
    description_en=excluded.description_en,
    price=excluded.price,
    category=excluded.category,
    image=excluded.image,
    unit=excluded.unit,
    min_quantity=excluded.min_quantity,
    pickup_only=excluded.pickup_only,
    variants_json=excluded.variants_json
`);

let count = 0;
for (const p of allProducts) {
  stmt.run(
    p.id,
    p.name,
    p.nameEn || '',
    p.description || '',
    p.descriptionEn || '',
    p.price,
    p.category,
    p.image || '',
    p.unit || '',
    p.minQuantity || 1,
    p.pickupOnly ? 1 : 0,
    p.variants ? JSON.stringify(p.variants) : null
  );
  count++;
}

console.log(`Successfully synced ${count} products.`);
db.close();
