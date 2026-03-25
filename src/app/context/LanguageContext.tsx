import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'vi' | 'en';

interface Translations {
  // Header & Navigation
  home: string;
  services: string;
  orders: string;
  cart: string;
  profile: string;
  
  // Home Page
  searchPlaceholder: string;
  limitedOffer: string;
  freeShipping: string;
  happyStudents: string;
  ourServices: string;
  quickActions: string;
  popularThisWeek: string;
  homeSuggestedTitle: string;
  homeSuggestedSubtitle: string;
  homeSearchNoResults: string;
  homeSameDayTitle: string;
  homeSameDayBody: string;
  homePromoTitle1: string;
  homePromoBody1: string;
  homePromoCode1: string;
  homePromoTitle2: string;
  homePromoBody2: string;
  homePromoCode2: string;
  reorder: string;
  reorderButton: string;
  reorderAdded: string;
  trackOrder: string;
  add: string;
  perPage: string;
  perBook: string;
  perSet: string;
  perPiece: string;
  
  // Services
  printingServices: string;
  printingDesc: string;
  paperProducts: string;
  paperDesc: string;
  officeSupplies: string;
  officeDesc: string;
  servicesCategory: string;
  servicesCategoryDesc: string;
  goodsCategory: string;
  goodsCategoryDesc: string;
  specifications: string;

  // Products
  bwPrint: string;
  bwPrintDesc: string;
  colorPrint: string;
  colorPrintDesc: string;
  binding: string;
  bindingDesc: string;
  laminate: string;
  laminateDesc: string;
  a4Paper: string;
  a4PaperDesc: string;
  coloredPaper: string;
  coloredPaperDesc: string;
  cardstock: string;
  cardstockDesc: string;
  stapler: string;
  staplerDesc: string;
  clips: string;
  clipsDesc: string;
  folders: string;
  foldersDesc: string;
  pens: string;
  pensDesc: string;
  highlighters: string;
  highlightersDesc: string;
  
  // Cart & Checkout
  myCart: string;
  emptyCart: string;
  emptyCartDesc: string;
  viewServices: string;
  addToCart: string;
  quantity: string;
  subtotal: string;
  shippingFee: string;
  total: string;
  free: string;
  checkout: string;
  placeOrder: string;
  promoCode: string;
  apply: string;
  orderSummary: string;
  itemTotal: string;
  
  // Checkout
  deliveryMethod: string;
  pickup: string;
  pickupDesc: string;
  delivery: string;
  deliveryDesc: string;
  estimatedTime: string;
  paymentMethod: string;
  cardPayment: string;
  cardPaymentDesc: string;
  cash: string;
  cashDesc: string;
  termsAgreement: string;
  processing: string;
  orderSuccess: string;
  orderError: string;
  enterAddress: string;
  addressPlaceholder: string;
  selectPickup: string;
  uploadFiles: string;
  uploadFilesDesc: string;
  uploadBtn: string;
  noFiles: string;
  
  // Orders
  myOrders: string;
  noOrders: string;
  noOrdersDesc: string;
  orderStatus: string;
  pending: string;
  processing_status: string;
  ready: string;
  completed: string;
  cancelled: string;
  
  // Auth (local device only)
  loginTitle: string;
  signupTitle: string;
  fullName: string;
  schoolEmail: string;
  studentIdLabel: string;
  password: string;
  confirmPassword: string;
  signInButton: string;
  signUpButton: string;
  authLocalNote: string;
  loginSuccess: string;
  signupSuccess: string;
  authInvalidLogin: string;
  authEmailTaken: string;
  authPasswordMismatch: string;
  authFillFields: string;
  authInvalidEmail: string;
  authNoAccount: string;
  authHasAccount: string;
  authMustVanLangEmail: string;
  authStudentIdNumbersOnly: string;
  loginRequiredCheckout: string;
  profileSaved: string;
  notifPrefOrders: string;
  notifPrefPromos: string;
  notifPrefSound: string;
  notifPrefPush: string;
  pushPermissionDenied: string;
  toastOrderUpdate: string;
  toastSupportReply: string;
  toastAdminActivity: string;
  settingsAppLanguageHint: string;
  settingsThemeHint: string;
  themeLight: string;
  themeDark: string;
  themeSystem: string;
  helpDialogIntro: string;
  enablePushTitle: string;
  enablePushDesc: string;
  enablePushBtn: string;
  skipBtn: string;

  // Admin
  adminPanel: string;
  adminOrdersHint: string;
  adminCustomer: string;
  adminNotifyPlaceholder: string;
  adminSendUpdate: string;
  adminAccessDenied: string;
  adminSignInAsAdmin: string;
  orderUpdatesFromStore: string;
  orderStepPlaced: string;
  adminTabOrders: string;
  adminTabUsers: string;
  adminTabChat: string;
  adminDeleteOrder: string;
  adminEditUser: string;
  adminDeliveryAddress: string;
  adminPickupLocation: string;
  adminPaymentMethod: string;
  deleteNotification: string;
  chatSupport: string;
  chatSupportDesc: string;
  cancelOrder: string;
  cancelOrderHint: string;
  orderCancelledOk: string;
  cannotCancelOrder: string;
  orderCancelReasonLabel: string;
  orderDeclinedNote: string;
  deleteOrderConfirm: string;
  userRole: string;
  lastLogin: string;
  supportTypeMessage: string;
  supportSend: string;
  noThreadsYet: string;
  loadFailed: string;
  tryAgain: string;
  adminViewOrders: string;
  adminFilteringByUser: string;
  adminClearFilter: string;

  // Profile
  account: string;
  editProfile: string;
  editProfileDesc: string;
  notifications: string;
  notificationsDesc: string;
  settings: string;
  settingsDesc: string;
  helpSupport: string;
  helpSupportDesc: string;
  logout: string;
  totalOrders: string;
  totalSpent: string;
  memberRank: string;
  rewardPoints: string;
  pointsToNext: string;
  
  // Member Ranks
  bronze: string;
  silver: string;
  gold: string;
  platinum: string;
  rankBenefits: string;
  currentRank: string;
  
  // Pickup Locations
  libraryA: string;
  towerA: string;
  towerF: string;
  towerG: string;
  towerJ: string;
  towerI: string;
  mainGate: string;
  
  // Common
  back: string;
  close: string;
  save: string;
  cancel: string;
  confirm: string;
  delete: string;
  edit: string;
}

const translations: Record<Language, Translations> = {
  vi: {
    home: 'Trang Chủ',
    services: 'Dịch Vụ',
    orders: 'Đơn Hàng',
    cart: 'Giỏ Hàng',
    profile: 'Tài Khoản',
    
    searchPlaceholder: 'Tìm kiếm dịch vụ hoặc sản phẩm...',
    limitedOffer: 'Ưu Đãi Có Hạn',
    freeShipping: 'Miễn phí ship trong phạm vi VLU Campus',
    happyStudents: 'Happy VLU-ers!!!',
    ourServices: 'Dịch Vụ Của Chúng Tôi',
    quickActions: 'Thao Tác Nhanh',
    popularThisWeek: 'Phổ Biến Tuần Này',
    homeSuggestedTitle: 'Gợi ý in ấn hôm nay',
    homeSuggestedSubtitle: 'Dịch vụ thường dùng tại quầy VLU',
    homeSearchNoResults: 'Không tìm thấy dịch vụ phù hợp',
    homeSameDayTitle: 'In lấy nhanh trong ngày',
    homeSameDayBody:
      'Đặt online — nhận tại thư viện hoặc sảnh tòa. File PDF/DOC chuẩn bị sẵn giúp in nhanh hơn.',
    homePromoTitle1: 'Giảm 10% đơn đầu tiên',
    homePromoBody1: 'Nhập mã khi thanh toán tại quầy hoặc ghi chú trong đơn online.',
    homePromoCode1: 'FLASH10',
    homePromoTitle2: 'Ưu đãi sinh viên',
    homePromoBody2: 'Giảm thêm 5% cho hội nhóm / CLB (đơn từ 200k).',
    homePromoCode2: 'CLB5',
    reorder: 'Đặt Lại Đơn Hàng',
    reorderButton: 'Đặt lại',
    reorderAdded: 'Đã thêm sản phẩm vào giỏ hàng',
    trackOrder: 'Theo Dõi Đơn',
    add: 'Thêm',
    perPage: 'mỗi trang',
    perBook: 'mỗi cuốn',
    perSet: 'mỗi bộ',
    perPiece: 'mỗi cái',
    
    printingServices: 'Dịch Vụ In Ấn',
    printingDesc: 'In Đen Trắng, In Màu, Đóng Tài Liệu',
    paperProducts: 'Giấy In',
    paperDesc: 'Giấy A4, Giấy Màu, Giấy Bìa',
    officeSupplies: 'Văn Phòng Phẩm',
    officeDesc: 'Bút, File, Kẹp',
    servicesCategory: 'Dịch vụ thêm',
    servicesCategoryDesc: 'Scan, ảnh thẻ, poster A2, hỗ trợ file',
    goodsCategory: 'Hàng & sự kiện',
    goodsCategoryDesc: 'Standee, banner, sticker, vé tay, quà tặng CLB',
    specifications: 'Chi tiết sản phẩm',

    bwPrint: 'In Đen Trắng',
    bwPrintDesc: 'In A4 đen trắng tiêu chuẩn, phù hợp cho tài liệu và ghi chú',
    colorPrint: 'In Màu',
    colorPrintDesc: 'In A4 màu chất lượng cao cho bài thuyết trình và dự án',
    binding: 'Đóng Tài Liệu',
    bindingDesc: 'Đóng tài liệu chuyên nghiệp dạng lò xo hoặc nhiệt',
    laminate: 'Ép Plastic',
    laminateDesc: 'Ép plastic A4 để bảo vệ tài liệu quan trọng',
    a4Paper: 'Giấy A4 (500 tờ)',
    a4PaperDesc: 'Giấy A4 chất lượng cao, 80gsm',
    coloredPaper: 'Giấy Màu',
    coloredPaperDesc: 'Bộ giấy màu đa dạng cho dự án sáng tạo',
    cardstock: 'Giấy Bìa Cứng',
    cardstockDesc: 'Giấy bìa dày cho bài thuyết trình và bìa tài liệu',
    stapler: 'Dập Ghim Loại',
    staplerDesc: 'Dập ghim chuyên nghiệp cho tài liệu dày',
    clips: 'Bộ Kẹp Bướm',
    clipsDesc: 'Kẹp bướm nhiều kích cỡ',
    folders: 'File Tài Liệu',
    foldersDesc: 'File nhựa trong suốt, bộ 10 cái',
    pens: 'Bộ Bút Bi',
    pensDesc: 'Bút bi xanh và đen, bộ 12 cây',
    highlighters: 'Bộ Bút Dạ Quang',
    highlightersDesc: 'Bút dạ quang nhiều màu cho học tập',
    
    myCart: 'Giỏ Hàng',
    emptyCart: 'Giỏ hàng trống',
    emptyCartDesc: 'Thêm sản phẩm để bắt đầu',
    viewServices: 'Xem Dịch Vụ',
    addToCart: 'Thêm Vào Giỏ',
    quantity: 'Số lượng',
    subtotal: 'Tạm tính',
    shippingFee: 'Phí giao hàng',
    total: 'Tổng cộng',
    free: 'Miễn phí',
    checkout: 'Thanh Toán',
    placeOrder: 'Đặt Hàng',
    promoCode: 'Nhập mã giảm giá',
    apply: 'Áp Dụng',
    orderSummary: 'Tóm Tắt Đơn Hàng',
    itemTotal: 'Tổng sản phẩm',
    
    deliveryMethod: 'Phương Thức Nhận Hàng',
    pickup: 'Nhận Tại Chỗ',
    pickupDesc: 'Miễn phí - Sẵn sàng sau 5-10 phút',
    delivery: 'Giao Hàng',
    deliveryDesc: 'Miễn Phí - 10-15 phút',
    estimatedTime: 'Thời Gian Ước Tính',
    paymentMethod: 'Phương Thức Thanh Toán',
    cardPayment: 'Thẻ Tín Dụng/Ghi Nợ',
    cardPaymentDesc: 'Thanh toán trực tuyến an toàn',
    cash: 'Tiền Mặt',
    cashDesc: 'Thanh toán khi nhận hàng',
    termsAgreement: 'Bằng việc đặt hàng, bạn đồng ý với Điều Khoản Dịch Vụ và Chính Sách Bảo Mật của chúng tôi',
    processing: 'Đang xử lý...',
    orderSuccess: 'Đặt hàng thành công!',
    orderError: 'Có lỗi xảy ra, vui lòng thử lại',
    enterAddress: 'Vui lòng nhập địa chỉ giao hàng',
    addressPlaceholder: 'Nhập địa chỉ giao hàng trong khuôn viên...',
    selectPickup: 'Chọn điểm nhận hàng',
    uploadFiles: 'Tải File Lên',
    uploadFilesDesc: 'Tải lên tài liệu cần in (PDF, DOC, DOCX)',
    uploadBtn: 'Chọn File',
    noFiles: 'Chưa có file nào',
    
    myOrders: 'Đơn Hàng Của Tôi',
    noOrders: 'Chưa có đơn hàng',
    noOrdersDesc: 'Bạn chưa có đơn hàng nào',
    orderStatus: 'Trạng thái',
    pending: 'Chờ xử lý',
    processing_status: 'Đang xử lý',
    ready: 'Sẵn sàng',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
    
    loginTitle: 'Đăng nhập',
    signupTitle: 'Đăng ký',
    fullName: 'Họ và tên',
    schoolEmail: 'Email trường',
    studentIdLabel: 'Mã số sinh viên',
    password: 'Mật khẩu',
    confirmPassword: 'Nhập lại mật khẩu',
    signInButton: 'Đăng nhập',
    signUpButton: 'Tạo tài khoản',
    authLocalNote: 'Tài khoản được lưu trên máy chủ. Đơn hàng đồng bộ với hệ thống cửa hàng.',
    loginSuccess: 'Đăng nhập thành công!',
    signupSuccess: 'Đăng ký thành công!',
    authInvalidLogin: 'Email hoặc mật khẩu không đúng.',
    authEmailTaken: 'Email này đã được đăng ký.',
    authPasswordMismatch: 'Mật khẩu xác nhận không khớp.',
    authFillFields: 'Vui lòng điền đầy đủ các ô.',
    authInvalidEmail: 'Email không hợp lệ.',
    authNoAccount: 'Chưa có tài khoản?',
    authHasAccount: 'Đã có tài khoản?',
    authMustVanLangEmail: 'Email phải là tài khoản VLU (@vanlanguni.vn).',
    authStudentIdNumbersOnly: 'Mã số sinh viên chỉ được chứa chữ số.',
    loginRequiredCheckout: 'Vui lòng đăng nhập để đặt hàng.',
    profileSaved: 'Đã lưu hồ sơ.',
    notifPrefOrders: 'Cập nhật trạng thái đơn hàng',
    notifPrefPromos: 'Ưu đãi và khuyến mãi',
    notifPrefSound: 'Âm thanh thông báo',
    notifPrefPush: 'Thông báo trình duyệt (push)',
    pushPermissionDenied: 'Trình duyệt đã từ chối quyền thông báo.',
    toastOrderUpdate: 'Cửa hàng vừa cập nhật đơn hàng của bạn. Mở mục Đơn hàng để xem chi tiết.',
    toastSupportReply: 'Bạn có tin nhắn mới từ cửa hàng trong Chat hỗ trợ.',
    toastAdminActivity: 'Có đơn hàng mới hoặc tin nhắn từ khách.',
    settingsAppLanguageHint: 'Ngôn ngữ hiển thị ứng dụng',
    settingsThemeHint: 'Giao diện sáng / tối',
    themeLight: 'Sáng',
    themeDark: 'Tối',
    themeSystem: 'Theo hệ thống',
    helpDialogIntro:
      'Liên hệ cửa hàng FlashNPrint tại campus VLU hoặc gửi email: support@flashnprint.vlu (demo). Giờ mở cửa: 8:00–18:00 các ngày trong tuần.',
    enablePushTitle: 'Bật Thông Báo',
    enablePushDesc: 'Nhận cập nhật liên tục về trạng thái đơn hàng.',
    enablePushBtn: 'Bật',
    skipBtn: 'Bỏ qua',
    adminPanel: 'Quản trị đơn hàng',
    adminOrdersHint: 'Cập nhật trạng thái và gửi thông báo cho khách.',
    adminCustomer: 'Khách',
    adminNotifyPlaceholder: 'Thông báo cho khách (ví dụ: đơn đã sẵn sàng lấy tại quầy A)...',
    adminSendUpdate: 'Gửi thông báo',
    adminAccessDenied: 'Bạn không có quyền truy cập trang quản trị.',
    adminSignInAsAdmin: 'Đăng nhập bằng tài khoản admin.',
    orderUpdatesFromStore: 'Cập nhật từ cửa hàng',
    orderStepPlaced: 'Đã đặt hàng',
    adminTabOrders: 'Đơn hàng',
    adminTabUsers: 'Người dùng',
    adminTabChat: 'Hỗ trợ',
    adminDeleteOrder: 'Xóa đơn',
    adminEditUser: 'Sửa người dùng',
    adminDeliveryAddress: 'Địa chỉ giao hàng',
    adminPickupLocation: 'Điểm nhận hàng',
    adminPaymentMethod: 'Thanh toán',
    deleteNotification: 'Xóa thông báo',
    chatSupport: 'Chat hỗ trợ',
    chatSupportDesc: 'Nhắn với cửa hàng (admin)',
    cancelOrder: 'Hủy đơn hàng',
    cancelOrderHint: 'Chỉ hủy được khi đơn đang chờ hoặc đang xử lý.',
    orderCancelledOk: 'Đã hủy đơn hàng.',
    cannotCancelOrder: 'Không thể hủy đơn ở trạng thái này.',
    orderCancelReasonLabel: 'Lý do (tùy chọn)',
    orderDeclinedNote: 'Ghi chú từ cửa hàng',
    deleteOrderConfirm: 'Xóa vĩnh viễn đơn này khỏi hệ thống?',
    userRole: 'Vai trò',
    lastLogin: 'Đăng nhập gần nhất',
    supportTypeMessage: 'Nhập tin nhắn…',
    supportSend: 'Gửi',
    noThreadsYet: 'Chưa có cuộc trò chuyện.',
    loadFailed: 'Không tải được dữ liệu. Kiểm tra máy chủ API hoặc mạng, rồi thử lại.',
    tryAgain: 'Thử lại',
    adminViewOrders: 'Xem đơn hàng',
    adminFilteringByUser: 'Đang lọc theo người dùng',
    adminClearFilter: 'Xoá lọc',
    account: 'Tài Khoản',
    editProfile: 'Chỉnh Sửa Hồ Sơ',
    editProfileDesc: 'Cập nhật thông tin cá nhân',
    notifications: 'Thông Báo',
    notificationsDesc: 'Quản lý tùy chọn thông báo',
    settings: 'Cài Đặt',
    settingsDesc: 'Cài đặt ứng dụng',
    helpSupport: 'Trợ Giúp & Hỗ Trợ',
    helpSupportDesc: 'Nhận trợ giúp hoặc liên hệ hỗ trợ',
    logout: 'Đăng Xuất',
    totalOrders: 'Đơn hàng',
    totalSpent: 'Chi tiêu',
    memberRank: 'Hạng',
    rewardPoints: 'Điểm Thưởng',
    pointsToNext: 'Còn',
    
    bronze: 'Đồng',
    silver: 'Bạc',
    gold: 'Vàng',
    platinum: 'Bạch Kim',
    rankBenefits: 'Quyền Lợi Hạng Thành Viên',
    currentRank: 'Hạng hiện tại',
    
    libraryA: 'Thư Viện Tòa A VLU',
    towerA: 'Tòa A - Sảnh',
    towerF: 'Tòa F - Sảnh',
    towerG: 'Tòa G - Tầng Trệt',
    towerJ: 'Tòa J - Tầng Trệt',
    towerI: 'Tòa I - Tầng Trệt',
    mainGate: 'Cổng trường Dương Quảng Hàm',
    
    back: 'Quay lại',
    close: 'Đóng',
    save: 'Lưu',
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    delete: 'Xóa',
    edit: 'Sửa',
  },
  en: {
    home: 'Home',
    services: 'Services',
    orders: 'Orders',
    cart: 'Cart',
    profile: 'Profile',
    
    searchPlaceholder: 'Search for services or products...',
    limitedOffer: 'Limited Offer',
    freeShipping: 'Free shipping within VLU Campus',
    happyStudents: 'Happy VLU-ers!!!',
    ourServices: 'Our Services',
    quickActions: 'Quick Actions',
    popularThisWeek: 'Popular This Week',
    homeSuggestedTitle: 'Suggested printing today',
    homeSuggestedSubtitle: 'What students order most at the VLU counter',
    homeSearchNoResults: 'No matching services',
    homeSameDayTitle: 'Same-day printing',
    homeSameDayBody:
      'Order online — pick up at the library or tower lobby. PDF/DOC files ready to go speed things up.',
    homePromoTitle1: '10% off your first order',
    homePromoBody1: 'Enter the code at the counter or in your online order notes.',
    homePromoCode1: 'FLASH10',
    homePromoTitle2: 'Student clubs',
    homePromoBody2: 'Extra 5% off for club / group orders over 200.000đ.',
    homePromoCode2: 'CLB5',
    reorder: 'Reorder',
    reorderButton: 'Reorder',
    reorderAdded: 'Items added to your cart',
    trackOrder: 'Track Order',
    add: 'Add',
    perPage: 'per page',
    perBook: 'per book',
    perSet: 'per set',
    perPiece: 'each',
    
    printingServices: 'Printing Services',
    printingDesc: 'B&W Print, Color Print, Binding',
    paperProducts: 'Paper',
    paperDesc: 'A4 Paper, Colored Paper, Cardstock',
    officeSupplies: 'Office Supplies',
    officeDesc: 'Pens, Folders, Clips',
    servicesCategory: 'Extra services',
    servicesCategoryDesc: 'Scanning, ID photos, A2 posters, file help',
    goodsCategory: 'Events & merch',
    goodsCategoryDesc: 'Standees, banners, stickers, tickets, club swag',
    specifications: 'Specifications',

    bwPrint: 'Black & White Print',
    bwPrintDesc: 'Standard A4 black and white printing for documents and notes',
    colorPrint: 'Color Print',
    colorPrintDesc: 'High-quality A4 color printing for presentations and projects',
    binding: 'Document Binding',
    bindingDesc: 'Professional spiral or thermal binding',
    laminate: 'Laminating',
    laminateDesc: 'A4 laminating to protect important documents',
    a4Paper: 'A4 Paper (500 sheets)',
    a4PaperDesc: 'High-quality A4 paper, 80gsm',
    coloredPaper: 'Colored Paper',
    coloredPaperDesc: 'Variety colored paper set for creative projects',
    cardstock: 'Cardstock',
    cardstockDesc: 'Thick cardstock for presentations and covers',
    stapler: 'Metal Stapler',
    staplerDesc: 'Professional stapler for thick documents',
    clips: 'Binder Clips Set',
    clipsDesc: 'Binder clips in various sizes',
    folders: 'Document Folders',
    foldersDesc: 'Clear plastic folders, set of 10',
    pens: 'Pen Set',
    pensDesc: 'Blue and black pens, set of 12',
    highlighters: 'Highlighter Set',
    highlightersDesc: 'Multi-color highlighters for studying',
    
    myCart: 'My Cart',
    emptyCart: 'Cart is empty',
    emptyCartDesc: 'Add products to get started',
    viewServices: 'View Services',
    addToCart: 'Add to Cart',
    quantity: 'Quantity',
    subtotal: 'Subtotal',
    shippingFee: 'Shipping Fee',
    total: 'Total',
    free: 'Free',
    checkout: 'Checkout',
    placeOrder: 'Place Order',
    promoCode: 'Enter promo code',
    apply: 'Apply',
    orderSummary: 'Order Summary',
    itemTotal: 'Item total',
    
    deliveryMethod: 'Delivery Method',
    pickup: 'Pickup',
    pickupDesc: 'Free - Ready in 5-10 minutes',
    delivery: 'Delivery',
    deliveryDesc: 'Free - 10-15 minutes',
    estimatedTime: 'Estimated Time',
    paymentMethod: 'Payment Method',
    cardPayment: 'Credit/Debit Card',
    cardPaymentDesc: 'Secure online payment',
    cash: 'Cash',
    cashDesc: 'Pay on delivery',
    termsAgreement: 'By placing an order, you agree to our Terms of Service and Privacy Policy',
    processing: 'Processing...',
    orderSuccess: 'Order placed successfully!',
    orderError: 'An error occurred, please try again',
    enterAddress: 'Please enter delivery address',
    addressPlaceholder: 'Enter delivery address on campus...',
    selectPickup: 'Select pickup location',
    uploadFiles: 'Upload Files',
    uploadFilesDesc: 'Upload documents to print (PDF, DOC, DOCX)',
    uploadBtn: 'Choose File',
    noFiles: 'No files uploaded',
    
    myOrders: 'My Orders',
    noOrders: 'No orders',
    noOrdersDesc: 'You haven\'t placed any orders yet',
    orderStatus: 'Status',
    pending: 'Pending',
    processing_status: 'Processing',
    ready: 'Ready',
    completed: 'Completed',
    cancelled: 'Cancelled',
    
    loginTitle: 'Sign in',
    signupTitle: 'Sign up',
    fullName: 'Full name',
    schoolEmail: 'School email',
    studentIdLabel: 'Student ID',
    password: 'Password',
    confirmPassword: 'Confirm password',
    signInButton: 'Sign in',
    signUpButton: 'Create account',
    authLocalNote: 'Accounts are stored on the server. Orders sync with the store system.',
    loginSuccess: 'Login successful!',
    signupSuccess: 'Signup successful!',
    authInvalidLogin: 'Invalid email or password.',
    authEmailTaken: 'This school email is already registered.',
    authPasswordMismatch: 'Passwords do not match.',
    authFillFields: 'Please fill in all fields.',
    authInvalidEmail: 'Please enter a valid email address.',
    authNoAccount: "Don't have an account?",
    authHasAccount: 'Already have an account?',
    authMustVanLangEmail: 'Email must be your VLU address (@vanlanguni.vn).',
    authStudentIdNumbersOnly: 'Student ID must contain only digits.',
    loginRequiredCheckout: 'Please sign in to place an order.',
    profileSaved: 'Profile saved.',
    notifPrefOrders: 'Order status updates',
    notifPrefPromos: 'Deals and promotions',
    notifPrefSound: 'Notification sounds',
    notifPrefPush: 'Browser push notifications',
    pushPermissionDenied: 'The browser denied notification permission.',
    toastOrderUpdate: 'The store updated your order. Open Orders for details.',
    toastSupportReply: 'You have a new message from the store in Support chat.',
    toastAdminActivity: 'New order or customer message.',
    settingsAppLanguageHint: 'App display language',
    settingsThemeHint: 'Light or dark appearance',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    helpDialogIntro:
      'Visit FlashNPrint on VLU campus or email support@flashnprint.vlu (demo). Hours: 8:00–18:00 weekdays.',
    enablePushTitle: 'Enable Notifications',
    enablePushDesc: 'Get real-time updates on your order status.',
    enablePushBtn: 'Enable',
    skipBtn: 'Skip',
    adminPanel: 'Admin · Orders',
    adminOrdersHint: 'Update status and send notifications to customers.',
    adminCustomer: 'Customer',
    adminNotifyPlaceholder: 'Message to customer (e.g. ready for pickup at desk A)...',
    adminSendUpdate: 'Send notification',
    adminAccessDenied: 'You do not have access to the admin area.',
    adminSignInAsAdmin: 'Sign in with an admin account.',
    orderUpdatesFromStore: 'Updates from store',
    orderStepPlaced: 'Order placed',
    adminTabOrders: 'Orders',
    adminTabUsers: 'Users',
    adminTabChat: 'Support',
    adminDeleteOrder: 'Delete order',
    adminEditUser: 'Edit user',
    adminDeliveryAddress: 'Delivery address',
    adminPickupLocation: 'Pickup location',
    adminPaymentMethod: 'Payment',
    deleteNotification: 'Delete notification',
    chatSupport: 'Support chat',
    chatSupportDesc: 'Message the store (admin)',
    cancelOrder: 'Cancel order',
    cancelOrderHint: 'You can cancel while the order is pending or processing.',
    orderCancelledOk: 'Order cancelled.',
    cannotCancelOrder: 'This order cannot be cancelled now.',
    orderCancelReasonLabel: 'Reason (optional)',
    orderDeclinedNote: 'Note from store',
    deleteOrderConfirm: 'Permanently delete this order?',
    userRole: 'Role',
    lastLogin: 'Last login',
    supportTypeMessage: 'Type a message…',
    supportSend: 'Send',
    noThreadsYet: 'No conversations yet.',
    loadFailed: 'Could not load data. Check the API server or your connection, then try again.',
    tryAgain: 'Try again',
    adminViewOrders: 'View orders',
    adminFilteringByUser: 'Filtering by user',
    adminClearFilter: 'Clear filter',
    account: 'Account',
    editProfile: 'Edit Profile',
    editProfileDesc: 'Update your personal information',
    notifications: 'Notifications',
    notificationsDesc: 'Manage notification preferences',
    settings: 'Settings',
    settingsDesc: 'App settings',
    helpSupport: 'Help & Support',
    helpSupportDesc: 'Get help or contact support',
    logout: 'Logout',
    totalOrders: 'Orders',
    totalSpent: 'Spent',
    memberRank: 'Rank',
    rewardPoints: 'Reward Points',
    pointsToNext: 'to',
    
    bronze: 'Bronze',
    silver: 'Silver',
    gold: 'Gold',
    platinum: 'Platinum',
    rankBenefits: 'Membership Benefits',
    currentRank: 'Current rank',
    
    libraryA: 'Library Tower A VLU',
    towerA: 'Tower A - Lobby',
    towerF: 'Tower F - Lobby',
    towerG: 'Tower G - Ground Floor',
    towerJ: 'Tower J - Ground Floor',
    towerI: 'Tower I - Ground Floor',
    mainGate: 'Duong Quang Ham Gate',
    
    back: 'Back',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('vi');

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
