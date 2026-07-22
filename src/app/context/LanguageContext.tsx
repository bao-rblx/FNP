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
  homeFirstOrderTitle: string;
  homeFirstOrderBody: string;
  reorder: string;
  reorderButton: string;
  reorderAdded: string;
  trackOrder: string;
  add: string;
  perPage: string;
  perBook: string;
  perSet: string;
  perPiece: string;
  
  // Categories & Specifications
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

  // Products Examples
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
  
  // Cart
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
  deliverySpeed: string;
  scheduleTime: string;
  asap: string;
  saverDelivery: string;
  standardDelivery: string;
  priorityDelivery: string;
  pickupOnlyWarning: string;
  promoApplied: string;
  promoInvalid: string;
  hasOrderPickupHint: string;
  deliveryDateLabel: string;
  deliveryTimeLabel: string;
  
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
  reorderLabel: string;
  cancelOrder: string;
  cancelOrderHint: string;
  orderCancelledOk: string;
  cannotCancelOrder: string;
  orderCancelReasonLabel: string;
  orderDeclinedNote: string;
  deleteOrderConfirm: string;
  orderUpdatesFromStore: string;
  orderStepPlaced: string;
  
  // Auth
  loginTitle: string;
  signupTitle: string;
  fullName: string;
  username: string;
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
  emailOrPhone: string;
  authFillAtLeastOne: string;
  optionalLabel: string;
  authPasswordMismatch: string;
  authFillFields: string;
  authPhoneTaken: string;
  authInvalidEmail: string;
  authNoAccount: string;
  authHasAccount: string;
  authMustVanLangEmail: string;
  authStudentIdNumbersOnly: string;
  loginRequiredCheckout: string;
  forgotPassword: string;
  resetPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  sendResetLink: string;
  resetLinkSent: string;
  passwordChanged: string;
  oldPassword: string;
  changePassword: string;

  // Profile
  profileTitle: string;
  personalInfo: string;
  schoolEmailLabel: string;
  phone: string;
  signOut: string;
  profileSaved: string;
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
  
  // Rewards & Ranks
  rewardPoints: string;
  memberRank: string;
  pointsLabel: string;
  totalOrders: string;
  totalSpent: string;
  pointsToNext: string;
  rankBenefits: string;
  currentRank: string;
  rankBronze: string;
  rankSilver: string;
  rankGold: string;
  rankPlatinum: string;
  benefits: string;

  // Notification Prefs
  notifPrefOrders: string;
  notifPrefPromos: string;
  notifPrefSound: string;
  notifPrefPush: string;
  pushPermissionDenied: string;
  toastOrderUpdate: string;
  toastSupportReply: string;
  toastAdminActivity: string;
  
  // Settings
  settingsAppLanguageHint: string;
  settingsThemeHint: string;
  themeLight: string;
  themeDark: string;
  themeSystem: string;

  // Help & Support
  helpDialogIntro: string;
  enablePushTitle: string;
  enablePushDesc: string;
  enablePushBtn: string;
  skipBtn: string;
  chatSupport: string;
  chatSupportDesc: string;
  supportTypeMessage: string;
  supportSend: string;
  noThreadsYet: string;
  loadFailed: string;
  tryAgain: string;

  // Admin
  adminPanel: string;
  adminOrdersHint: string;
  adminCustomer: string;
  adminNotifyPlaceholder: string;
  adminSendUpdate: string;
  adminAccessDenied: string;
  adminSignInAsAdmin: string;
  adminTabOrders: string;
  adminTabUsers: string;
  adminTabChat: string;
  adminDeleteOrder: string;
  adminEditUser: string;
  adminDeliveryAddress: string;
  adminPickupLocation: string;
  adminPaymentMethod: string;
  deleteNotification: string;
  userRole: string;
  lastLogin: string;
  adminViewOrders: string;
  adminFilteringByUser: string;
  adminClearFilter: string;
  adminTabDashboard: string;
  adminStatRevenue: string;
  adminStatOrders: string;
  adminStatUsers: string;
  adminStatProducts: string;
  adminStatPendingPayments: string;
  adminStatAvgOrder: string;
  adminStatRevenue30: string;
  adminStatToday: string;
  adminRevenueTrend: string;
  adminTopProducts: string;
  adminRecentOrders: string;
  adminOrdersByStatus: string;
  adminSearchPlaceholder: string;
  adminFilterAll: string;
  adminNoResults: string;
  adminEditProduct: string;
  adminEditCoupon: string;
  adminProductPromotion: string;
  adminProductPickupOnly: string;
  adminUserPoints: string;
  adminUserRank: string;
  adminUserOrders: string;
  adminUserSpent: string;
  adminSaved: string;
  adminSaveFailed: string;
  adminNoData: string;
  adminUsedCount: string;

  // Pickup Locations
  libraryA: string;
  towerA: string;
  towerF: string;
  towerG: string;
  towerJ: string;
  towerI: string;
  mainGate: string;

  // Guest checkout
  continueAsGuest: string;
  guestName: string;
  guestPhone: string;
  guestCheckoutTitle: string;
  guestCheckoutDesc: string;
  guestOrderPromptTitle: string;
  guestOrderPromptBody: string;
  createAccount: string;
  maybeLater: string;
  guestProfileTitle: string;
  guestProfileDesc: string;
  signIn: string;
  guestPhoneInvalid: string;
  guestNameInvalid: string;
  guestEmail: string;
  guestEmailInvalid: string;
  customerInfo: string;
  
  // Common
  back: string;
  close: string;
  save: string;
  cancel: string;
  confirm: string;
  delete: string;
  edit: string;
  copyOrderId: string;
  copiedToClipboard: string;
  guestOrderDetail: string;
  guestOrderLookupTitle: string;
  guestOrderLookupDesc: string;
  guestOrderLookupBtn: string;
  guestOrderNotFound: string;
  adminTabProducts: string;
  adminTabCoupons: string;
  adminAddProduct: string;
  adminAddCoupon: string;
  adminProductName: string;
  adminProductPrice: string;
  adminProductCategory: string;
  adminProductImage: string;
  adminProductStock: string;
  adminCouponCode: string;
  adminCouponDiscount: string;
  adminCouponMaxUses: string;
  adminCouponExpires: string;
  adminCouponMinSpent: string;
  authSuccess: string;
  promoCodePlaceholder: string;
  applyPromo: string;
  viewAllServices: string;
  storeAnnouncement: string;
}

const translations: Record<Language, Translations> = {
  vi: {
    home: 'Trang Chủ',
    services: '3D Models',
    orders: 'Đơn Hàng',
    cart: 'Giỏ Hàng',
    profile: 'Tài Khoản',
    searchPlaceholder: 'Tìm kiếm mô hình 3D, vật liệu hoặc nhân vật...',
    limitedOffer: 'Ưu Đãi Đặc Biệt',
    freeShipping: 'Tải Xử Lý Tải Xuống Tức Thì',
    happyStudents: '100% Asset 3D Đã Kiểm Duyệt',
    ourServices: 'Kho Asset 3D Của Chúng Tôi',
    quickActions: 'Thao Tác Nhanh',
    popularThisWeek: 'Phổ Biến Tuần Này',
    homeSuggestedTitle: 'Mô hình 3D Nổi Bật',
    homeSuggestedSubtitle: 'Asset 3D chất lượng cao sẵn sàng cho Game Engine',
    homeSearchNoResults: 'Không tìm thấy mô hình 3D phù hợp',
    homeSameDayTitle: 'Tải Xuống Tức Thì 24/7',
    homeSameDayBody: 'Thanh toán trực tuyến — nhận link tải file 3D (.GLB, .FBX, .OBJ) và 4K PBR Textures ngay lập tức.',
    homePromoTitle1: 'Giảm 10% đơn hàng đầu tiên',
    homePromoBody1: 'Nhập mã POLY100 khi thanh toán để nhận ưu đãi.',
    homePromoCode1: 'POLY100',
    homePromoTitle2: 'Ưu đãi Creator & Studio',
    homePromoBody2: 'Giảm thêm 15% cho các dự án game & phim hoạt hình.',
    homePromoCode2: 'CREATOR15',
    homeFirstOrderTitle: 'Ưu đãi tài khoản mới',
    homeFirstOrderBody: 'Nhận ngay mã giảm giá cho mô hình 3D đầu tiên!',
    reorder: 'Đặt Lại Asset',
    reorderButton: 'Tải lại',
    reorderAdded: 'Đã thêm asset vào giỏ hàng',
    trackOrder: 'Kiểm Tra Quyền Tải',
    add: 'Thêm',
    perPage: 'mỗi asset',
    perBook: 'mỗi kit',
    perSet: 'mỗi bộ',
    perPiece: 'mỗi model',
    printingServices: 'Mô Hình 3D',
    printingDesc: 'Nhân Vật, Vũ Khí, Môi Trường, Xe Cộ',
    paperProducts: 'Môi Trường & Cảnh',
    paperDesc: 'Modular City, Sci-Fi, Fantasy',
    officeSupplies: 'Vũ Khí & Props',
    officeDesc: 'Súng, Kiếm, Vật Dụng Game',
    servicesCategory: 'Vật Liệu & Textures',
    servicesCategoryDesc: '4K PBR, Shaders, Material Packs',
    goodsCategory: 'Gói Asset Đặc Biệt',
    goodsCategoryDesc: 'Trọn bộ Game Asset Pack, Full Rigged',
    specifications: 'Thông số kĩ thuật 3D',
    bwPrint: 'Mô hình 3D Low-Poly',
    bwPrintDesc: 'Tối ưu cho mobile game và real-time rendering',
    colorPrint: 'Mô hình 3D High-Poly',
    colorPrintDesc: 'Chi tiết cao cho phim 3D và VFX',
    binding: 'Bản Quyền Thương Mại',
    bindingDesc: 'Giấy phép sử dụng cho sản phẩm thương mại',
    laminate: 'Full Rigged & Animated',
    laminateDesc: 'Đầy đủ khung xương và chuyển động sẵn',
    a4Paper: 'Bộ Môi Trường Cyberpunk',
    a4PaperDesc: 'Full 3D modular city environment',
    coloredPaper: 'Bộ Vũ Khí Sci-Fi',
    coloredPaperDesc: 'PBR Textures 4K ready',
    cardstock: 'Nhân Vật Game',
    cardstockDesc: 'High detail 3D Character models',
    stapler: 'Model 3D Jhin',
    staplerDesc: 'League of Legends Dark Cosmic Jhin',
    clips: 'Model 3D Aurelion Sol',
    clipsDesc: 'Porcelain Aurelion Sol 3D Asset',
    folders: 'Model 3D Yasuo',
    foldersDesc: 'Dream Dragon Yasuo 3D Model',
    pens: 'Model 3D Garen',
    pensDesc: 'God King Garen 3D Model',
    highlighters: 'Mech Warrior 3D',
    highlightersDesc: 'Sci-Fi Mech 3D model fully rigged',
    myCart: 'Giỏ Hàng Asset',
    emptyCart: 'Giỏ hàng trống',
    emptyCartDesc: 'Khám phá thư viện 3D để bắt đầu',
    viewServices: 'Xem Kho Asset',
    addToCart: 'Thêm Vào Giỏ',
    quantity: 'Số lượng',
    subtotal: 'Tạm tính',
    shippingFee: 'Phí bản quyền',
    total: 'Tổng cộng',
    free: 'Miễn phí',
    checkout: 'Thanh Toán',
    placeOrder: 'Xác Nhận Thanh Toán',
    promoCode: 'Nhập mã giảm giá',
    apply: 'Áp Dụng',
    orderSummary: 'Tóm Tắt Đơn Hàng',
    itemTotal: 'Tổng số asset',
    deliveryMethod: 'Phương Thức Nhận Asset',
    pickup: 'Tải Xuống Trực Tiếp',
    pickupDesc: 'Miễn phí - Link tải ngay sau khi thanh toán',
    delivery: 'Tải Trực Tiếp',
    deliveryDesc: 'Miễn Phí - Nhận link ngay',
    estimatedTime: 'Thời Gian Nhận File',
    paymentMethod: 'Phương Thức Thanh Toán',
    cardPayment: 'Thẻ Tín Dụng / QR Code',
    cardPaymentDesc: 'Thanh toán trực tuyến an toàn',
    cash: 'Ví Điện Tử / Chuyển Khoản',
    cashDesc: 'Xác thực thanh toán tự động',
    termsAgreement: 'Bằng việc đặt hàng, bạn đồng ý với Điều Khoản Sử Dụng Bản Quyền Asset 3D của PolyStore',
    processing: 'Đang xử lý...',
    orderSuccess: 'Thanh toán thành công! Link tải file đã sẵn sàng.',
    orderError: 'Có lỗi xảy ra, vui lòng thử lại',
    enterAddress: 'Vui lòng điền thông tin',
    addressPlaceholder: 'Tự động gửi link về email tài khoản...',
    selectPickup: 'Tải xuống trực tiếp',
    uploadFiles: 'File Định Dạng 3D',
    uploadFilesDesc: 'Hỗ trợ .GLTF, .GLB, .FBX, .OBJ, .BLEND',
    uploadBtn: 'Chọn File',
    noFiles: 'Chưa chọn file',
    deliverySpeed: 'Tải Về',
    scheduleTime: 'Thời Gian',
    asap: 'Tải về ngay',
    saverDelivery: 'Tải về tiêu chuẩn',
    standardDelivery: 'Tải về tiêu chuẩn',
    priorityDelivery: 'Tải về tốc độ cao',
    pickupOnlyWarning: 'Vui lòng kiểm tra định dạng file 3D',
    promoApplied: 'Đã áp dụng mã giảm giá!',
    promoInvalid: 'Mã giảm giá không hợp lệ',
    hasOrderPickupHint: 'Bấm để xem link tải file →',
    myOrders: 'Asset Đã Mua',
    noOrders: 'Chưa mua asset nào',
    noOrdersDesc: 'Bạn chưa có đơn hàng asset 3D nào',
    orderStatus: 'Trạng thái',
    pending: 'Chờ thanh toán',
    processing_status: 'Đang khởi tạo link',
    ready: 'Sẵn sàng tải',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy',
    reorderLabel: 'Tải lại',
    cancelOrder: 'Hủy giao dịch',
    cancelOrderHint: 'Chỉ hủy được khi đơn chưa hoàn tất thanh toán.',
    orderCancelledOk: 'Đã hủy giao dịch.',
    cannotCancelOrder: 'Không thể hủy đơn ở trạng thái này.',
    orderCancelReasonLabel: 'Lý do (tùy chọn)',
    orderDeclinedNote: 'Ghi chú từ hệ thống',
    deleteOrderConfirm: 'Xóa đơn hàng này khỏi lịch sử?',
    orderUpdatesFromStore: 'Thông báo bản quyền',
    orderStepPlaced: 'Khởi tạo đơn',
    loginTitle: 'Đăng nhập',
    signupTitle: 'Đăng ký',
    fullName: 'Họ và tên',
    username: 'Tên người dùng',
    schoolEmail: 'Email',
    studentIdLabel: 'Mã định danh (ID)',
    password: 'Mật khẩu',
    confirmPassword: 'Nhập lại mật khẩu',
    signInButton: 'Đăng nhập',
    signUpButton: 'Tạo tài khoản PolyStore',
    authLocalNote: 'Tài khoản được bảo mật trên PolyStore Cloud.',
    loginSuccess: 'Đăng nhập thành công!',
    signupSuccess: 'Đăng ký thành công!',
    authInvalidLogin: 'Email hoặc mật khẩu không đúng.',
    authEmailTaken: 'Email này đã được đăng ký.',
    emailOrPhone: 'Email hoặc Số điện thoại',
    authFillAtLeastOne: 'Vui lòng nhập Email hoặc Số điện thoại.',
    optionalLabel: '(tùy chọn)',
    authPasswordMismatch: 'Mật khẩu xác nhận không khớp.',
    authFillFields: 'Vui lòng điền đầy đủ các ô.',
    authPhoneTaken: 'Số điện thoại này đã được sử dụng.',
    authInvalidEmail: 'Email không hợp lệ.',
    authNoAccount: 'Chưa có tài khoản?',
    authHasAccount: 'Đã có tài khoản?',
    authMustVanLangEmail: 'Vui lòng nhập email hợp lệ.',
    authStudentIdNumbersOnly: 'Mã ID chỉ được chứa chữ số.',
    loginRequiredCheckout: 'Vui lòng đăng nhập để thanh toán asset.',
    forgotPassword: 'Quên mật khẩu?',
    resetPassword: 'Đặt lại mật khẩu',
    newPassword: 'Mật khẩu mới',
    confirmNewPassword: 'Xác nhận mật khẩu mới',
    sendResetLink: 'Gửi mã đặt lại',
    resetLinkSent: 'Mã đặt lại đã được gửi',
    passwordChanged: 'Mật khẩu đã được thay đổi thành công.',
    oldPassword: 'Mật khẩu cũ',
    changePassword: 'Đổi mật khẩu',
    profileTitle: 'Tài Khoản PolyStore',
    personalInfo: 'Thông tin cá nhân',
    schoolEmailLabel: 'Email',
    phone: 'Số điện thoại',
    signOut: 'Đăng xuất',
    profileSaved: 'Đã lưu hồ sơ.',
    account: 'Tài Khoản',
    editProfile: 'Chỉnh Sửa Hồ Sơ',
    editProfileDesc: 'Cập nhật thông tin tài khoản',
    notifications: 'Thông Báo',
    notificationsDesc: 'Quản lý thông báo bản quyền & cập nhật',
    settings: 'Cài Đặt',
    settingsDesc: 'Cài đặt giao diện & ứng dụng',
    helpSupport: 'Trợ Giúp & Hỗ Trợ',
    helpSupportDesc: 'Liên hệ tư vấn asset & hỗ trợ 3D',
    logout: 'Đăng Xuất',
    rewardPoints: 'Điểm Thưởng Creator',
    memberRank: 'Hạng Thành Viên',
    pointsLabel: 'điểm',
    totalOrders: 'Số asset đã mua',
    totalSpent: 'Tổng đầu tư',
    pointsToNext: 'tới hạng tiếp theo',
    rankBenefits: 'Quyền Lợi Thành Viên',
    currentRank: 'Hạng hiện tại',
    rankBronze: 'Bronze Creator',
    rankSilver: 'Silver Creator',
    rankGold: 'Gold Creator',
    rankPlatinum: 'Platinum Studio',
    benefits: 'Quyền lợi của bạn',
    notifPrefOrders: 'Cập nhật link tải & file mới',
    notifPrefPromos: 'Thông báo asset 3D mới & sale',
    notifPrefSound: 'Âm thanh thông báo',
    notifPrefPush: 'Thông báo trình duyệt (push)',
    pushPermissionDenied: 'Trình duyệt đã từ chối quyền thông báo.',
    toastOrderUpdate: 'Hệ thống đã cập nhật quyền truy cập file 3D của bạn.',
    toastSupportReply: 'Bạn có tin nhắn mới từ bộ phận kỹ thuật 3D.',
    toastAdminActivity: 'Có giao dịch asset mới.',
    settingsAppLanguageHint: 'Ngôn ngữ hiển thị ứng dụng',
    settingsThemeHint: 'Giao diện tối / sáng',
    themeLight: 'Sáng',
    themeDark: 'Tối (Khuyên dùng)',
    themeSystem: 'Theo hệ thống',
    helpDialogIntro: 'Hỗ trợ kỹ thuật PolyStore 3D. Email: support@polystore.com. Hỗ trợ tải file 24/7.',
    enablePushTitle: 'Bật Thông Báo',
    enablePushDesc: 'Nhận thông báo khi file 3D mới hoàn tất tải lên.',
    enablePushBtn: 'Bật',
    skipBtn: 'Bỏ qua',
    chatSupport: 'Hỗ trợ 3D',
    chatSupportDesc: 'Nhắn tin trực tiếp với Admin PolyStore',
    supportTypeMessage: 'Nhập câu hỏi về asset 3D…',
    supportSend: 'Gửi',
    noThreadsYet: 'Chưa có cuộc trò chuyện.',
    loadFailed: 'Không tải được dữ liệu. Kiểm tra máy chủ PolyStore.',
    tryAgain: 'Thử lại',
    adminPanel: 'Quản trị PolyStore 3D',
    adminOrdersHint: 'Quản lý giao dịch và link tải file 3D.',
    adminCustomer: 'Khách hàng',
    adminNotifyPlaceholder: 'Thông báo cho khách (ví dụ: File .FBX đã cập nhật phiên bản v2.0)...',
    adminSendUpdate: 'Gửi thông báo',
    adminAccessDenied: 'Bạn không có quyền truy cập trang quản trị PolyStore.',
    adminSignInAsAdmin: 'Đăng nhập tài khoản admin (admin@polystore.com).',
    adminTabOrders: 'Giao dịch',
    adminTabUsers: 'Người dùng',
    adminTabChat: 'Hỗ trợ 3D',
    adminDeleteOrder: 'Xóa giao dịch',
    adminEditUser: 'Sửa người dùng',
    adminDeliveryAddress: 'Phương thức nhận',
    adminPickupLocation: 'File 3D',
    adminPaymentMethod: 'Thanh toán',
    deleteNotification: 'Xóa thông báo',
    userRole: 'Vai trò',
    lastLogin: 'Đăng nhập gần nhất',
    adminViewOrders: 'Xem lịch sử',
    adminFilteringByUser: 'Đang lọc theo người dùng',
    adminClearFilter: 'Xoá lọc',
    adminTabDashboard: 'Tổng quan',
    adminStatRevenue: 'Doanh thu',
    adminStatOrders: 'Đơn hàng',
    adminStatUsers: 'Người dùng',
    adminStatProducts: 'Sản phẩm',
    adminStatPendingPayments: 'Chờ xác nhận TT',
    adminStatAvgOrder: 'Giá trị đơn TB',
    adminStatRevenue30: 'Doanh thu 30 ngày',
    adminStatToday: 'Hôm nay',
    adminRevenueTrend: 'Doanh thu 14 ngày qua',
    adminTopProducts: 'Sản phẩm bán chạy',
    adminRecentOrders: 'Đơn hàng gần đây',
    adminOrdersByStatus: 'Đơn theo trạng thái',
    adminSearchPlaceholder: 'Tìm kiếm...',
    adminFilterAll: 'Tất cả',
    adminNoResults: 'Không có kết quả phù hợp.',
    adminEditProduct: 'Sửa sản phẩm',
    adminEditCoupon: 'Sửa mã giảm giá',
    adminProductPromotion: 'Đang khuyến mãi',
    adminProductPickupOnly: 'Chỉ nhận trực tiếp',
    adminUserPoints: 'Điểm',
    adminUserRank: 'Hạng',
    adminUserOrders: 'Đơn hàng',
    adminUserSpent: 'Đã chi',
    adminSaved: 'Đã lưu thay đổi',
    adminSaveFailed: 'Lưu thất bại',
    adminNoData: 'Chưa có dữ liệu',
    libraryA: 'PolyStore Digital Cloud',
    towerA: 'Server 1 - US East',
    towerF: 'Server 2 - EU Central',
    towerG: 'Server 3 - AP Singapore',
    towerJ: 'Server 4 - JP Tokyo',
    towerI: 'Server 5 - Global CDN',
    mainGate: 'Trực tiếp qua Web Portal',
    continueAsGuest: 'Mua nhanh không cần tạo tài khoản',
    guestName: 'Tên người nhận',
    guestPhone: 'Số điện thoại',
    guestCheckoutTitle: 'Đặt hàng không cần tài khoản',
    guestCheckoutDesc: 'Chỉ cần tên và số điện thoại — không cần đăng ký.',
    guestOrderPromptTitle: 'Muốn lưu lịch sử đơn hàng?',
    guestOrderPromptBody: 'Tạo tài khoản miễn phí để theo dõi đơn hàng và nhận ưu đãi riêng.',
    createAccount: 'Tạo tài khoản',
    maybeLater: 'Để sau',
    guestProfileTitle: 'Đăng nhập để nhận thêm ưu đãi',
    guestProfileDesc: 'Đăng nhập hoặc tạo tài khoản để theo dõi đơn hàng và nhận khuyến mãi độc quyền.',
    signIn: 'Đăng nhập',
    guestPhoneInvalid: 'Vui lòng nhập số điện thoại hợp lệ.',
    guestNameInvalid: 'Vui lòng nhập tên của bạn.',
    guestEmail: 'Email',
    guestEmailInvalid: 'Vui lòng nhập email hợp lệ để nhận link tải.',
    customerInfo: 'Thông tin khách hàng',
    back: 'Quay lại',
    close: 'Đóng',
    save: 'Lưu',
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    delete: 'Xóa',
    edit: 'Sửa',
    copyOrderId: 'Sao chép mã',
    copiedToClipboard: 'Đã sao chép!',
    guestOrderDetail: 'Đơn hàng của bạn',
    guestOrderLookupTitle: 'Tra cứu đơn hàng',
    guestOrderLookupDesc: 'Nhập mã đơn hàng để kiểm tra trạng thái',
    guestOrderLookupBtn: 'Tra cứu',
    guestOrderNotFound: 'Không tìm thấy đơn hàng.',
    deliveryDateLabel: 'Ngày nhận hàng',
    deliveryTimeLabel: 'Giờ nhận hàng',
    adminTabProducts: 'Sản phẩm',
    adminTabCoupons: 'Mã giảm giá',
    adminAddProduct: 'Thêm sản phẩm',
    adminAddCoupon: 'Thêm mã giảm',
    adminProductName: 'Tên sản phẩm',
    adminProductPrice: 'Giá',
    adminProductCategory: 'Danh mục',
    adminProductImage: 'Link hình ảnh',
    adminProductStock: 'Giới hạn số lượng',
    adminCouponCode: 'Mã giảm giá',
    adminCouponDiscount: 'Phần trăm giảm (%)',
    adminCouponMaxUses: 'Số lượt dùng tối đa',
    adminCouponExpires: 'Ngày hết hạn',
    adminCouponMinSpent: 'Đơn hàng tối thiểu',
    authSuccess: 'Thành công!',
    promoCodePlaceholder: 'Nhập mã giảm giá',
    applyPromo: 'Áp dụng',
    viewAllServices: 'Xem tất cả sản phẩm & dịch vụ tại đây',
    storeAnnouncement: 'Chào mừng khai trương FlashNPrint! 🎉',
  },
  en: {
    home: 'Home',
    services: '3D Models',
    orders: 'Orders',
    cart: 'Cart',
    profile: 'Profile',
    searchPlaceholder: 'Search 3D models, textures, or characters...',
    limitedOffer: 'Special Offer',
    freeShipping: 'Instant Digital Download',
    happyStudents: '100% Verified 3D Assets',
    ourServices: 'Our 3D Asset Library',
    quickActions: 'Quick Actions',
    popularThisWeek: 'Popular This Week',
    homeSuggestedTitle: 'Trending 3D Models',
    homeSuggestedSubtitle: 'High quality 3D assets ready for game engines',
    homeSearchNoResults: 'No matching 3D models',
    homeSameDayTitle: '24/7 Instant Download',
    homeSameDayBody: 'Order online — get direct download links for .GLB, .FBX, .OBJ, and 4K PBR textures instantly.',
    homePromoTitle1: '10% off your first order',
    homePromoBody1: 'Use code POLY100 at checkout.',
    homePromoCode1: 'POLY100',
    homePromoTitle2: 'Creator & Studio Special',
    homePromoBody2: 'Extra 15% off for indie game projects & animation studios.',
    homePromoCode2: 'CREATOR15',
    homeFirstOrderTitle: 'New Account Perk',
    homeFirstOrderBody: 'Get a instant discount code for your first 3D asset download!',
    reorder: 'Re-download Asset',
    reorderButton: 'Re-download',
    reorderAdded: 'Items added to cart',
    trackOrder: 'Check Asset License',
    add: 'Add',
    perPage: 'per asset',
    perBook: 'per kit',
    perSet: 'per set',
    perPiece: 'each model',
    printingServices: '3D Models',
    printingDesc: 'Characters, Weapons, Environments, Vehicles',
    paperProducts: 'Environments & Scenes',
    paperDesc: 'Modular City, Sci-Fi, Fantasy',
    officeSupplies: 'Weapons & Props',
    officeDesc: 'Guns, Swords, Game Props',
    servicesCategory: 'Materials & Textures',
    servicesCategoryDesc: '4K PBR, Shaders, Material Packs',
    goodsCategory: 'Special Asset Packs',
    goodsCategoryDesc: 'Complete Game Asset Packs, Full Rigged',
    specifications: '3D Specifications',
    bwPrint: 'Low-Poly 3D Model',
    bwPrintDesc: 'Optimized for mobile games and real-time rendering',
    colorPrint: 'High-Poly 3D Model',
    colorPrintDesc: 'High detail for 3D films and VFX',
    binding: 'Commercial License',
    bindingDesc: 'Royalty-free commercial usage license',
    laminate: 'Full Rigged & Animated',
    laminateDesc: 'Skeletal rig with pre-built animations',
    a4Paper: 'Cyberpunk Environment Kit',
    a4PaperDesc: 'Full 3D modular city environment',
    coloredPaper: 'Sci-Fi Weapons Pack',
    coloredPaperDesc: '4K PBR textures ready',
    cardstock: 'Game Characters',
    cardstockDesc: 'High detail 3D character models',
    stapler: 'Jhin 3D Model',
    staplerDesc: 'League of Legends Dark Cosmic Jhin',
    clips: 'Aurelion Sol 3D Model',
    clipsDesc: 'Porcelain Aurelion Sol 3D Asset',
    folders: 'Yasuo 3D Model',
    foldersDesc: 'Dream Dragon Yasuo 3D Model',
    pens: 'Garen 3D Model',
    pensDesc: 'God King Garen 3D Model',
    highlighters: 'Mech Warrior 3D',
    highlightersDesc: 'Sci-Fi Mech 3D model fully rigged',
    myCart: 'Asset Cart',
    emptyCart: 'Cart is empty',
    emptyCartDesc: 'Explore our 3D library to get started',
    viewServices: 'View Asset Library',
    addToCart: 'Add to Cart',
    quantity: 'Quantity',
    subtotal: 'Subtotal',
    shippingFee: 'License Fee',
    total: 'Total',
    free: 'Free',
    checkout: 'Checkout',
    placeOrder: 'Confirm Payment',
    promoCode: 'Enter promo code',
    apply: 'Apply',
    orderSummary: 'Order Summary',
    itemTotal: 'Total assets',
    deliveryMethod: 'Asset Delivery Method',
    pickup: 'Direct Download',
    pickupDesc: 'Free - Instant download link after payment',
    delivery: 'Direct Download',
    deliveryDesc: 'Free - Access link immediately',
    estimatedTime: 'Delivery Time',
    paymentMethod: 'Payment Method',
    cardPayment: 'Credit Card / QR Code',
    cardPaymentDesc: 'Secure online digital checkout',
    cash: 'E-Wallet / Bank Transfer',
    cashDesc: 'Automatic instant verification',
    termsAgreement: 'By placing an order, you agree to PolyStore 3D Asset Royalty-Free License Terms.',
    processing: 'Processing...',
    orderSuccess: 'Payment successful! Download links are ready.',
    orderError: 'An error occurred, please try again',
    enterAddress: 'Please enter details',
    addressPlaceholder: 'Download link will be sent to account email...',
    selectPickup: 'Direct Download Portal',
    uploadFiles: '3D File Formats',
    uploadFilesDesc: 'Supports .GLTF, .GLB, .FBX, .OBJ, .BLEND',
    uploadBtn: 'Choose File',
    noFiles: 'No file selected',
    deliverySpeed: 'Download Speed',
    scheduleTime: 'Time',
    asap: 'Instant Download',
    saverDelivery: 'Standard Speed',
    standardDelivery: 'Standard Speed',
    priorityDelivery: 'High-Speed CDN',
    pickupOnlyWarning: 'Please check 3D file compatibility',
    promoApplied: 'Promo code applied!',
    promoInvalid: 'Invalid promo code',
    hasOrderPickupHint: 'Click to access download link →',
    myOrders: 'Purchased Assets',
    noOrders: 'No purchased assets',
    noOrdersDesc: 'You haven\'t purchased any 3D models yet',
    orderStatus: 'Status',
    pending: 'Payment Pending',
    processing_status: 'Generating Link',
    ready: 'Ready to Download',
    completed: 'Completed',
    cancelled: 'Cancelled',
    reorderLabel: 'Re-download',
    cancelOrder: 'Cancel order',
    cancelOrderHint: 'You can cancel while payment is pending.',
    orderCancelledOk: 'Order cancelled.',
    cannotCancelOrder: 'This order cannot be cancelled now.',
    orderCancelReasonLabel: 'Reason (optional)',
    orderDeclinedNote: 'Note from system',
    deleteOrderConfirm: 'Permanently delete this order from history?',
    orderUpdatesFromStore: 'License & System updates',
    orderStepPlaced: 'Order initialized',
    loginTitle: 'Sign in',
    signupTitle: 'Sign up',
    fullName: 'Full name',
    username: 'Username',
    schoolEmail: 'Email',
    studentIdLabel: 'Account ID',
    password: 'Password',
    confirmPassword: 'Confirm password',
    signInButton: 'Sign in',
    signUpButton: 'Create PolyStore Account',
    authLocalNote: 'Accounts are securely stored on PolyStore Cloud.',
    loginSuccess: 'Login successful!',
    signupSuccess: 'Signup successful!',
    authInvalidLogin: 'Invalid email or password.',
    authEmailTaken: 'This email is already registered.',
    emailOrPhone: 'Email or Phone Number',
    authFillAtLeastOne: 'Please enter Email or Phone Number.',
    optionalLabel: '(optional)',
    authPasswordMismatch: 'Passwords do not match.',
    authFillFields: 'Please fill in all fields.',
    authPhoneTaken: 'This phone number is already taken.',
    authInvalidEmail: 'Please enter a valid email address.',
    authNoAccount: "Don't have an account?",
    authHasAccount: 'Already have an account?',
    authMustVanLangEmail: 'Please enter a valid email address.',
    authStudentIdNumbersOnly: 'Account ID must contain only digits.',
    loginRequiredCheckout: 'Please sign in to complete checkout.',
    forgotPassword: 'Forgot password?',
    resetPassword: 'Reset Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    sendResetLink: 'Send Reset Code',
    resetLinkSent: 'Reset code sent',
    passwordChanged: 'Password changed successfully.',
    oldPassword: 'Old Password',
    changePassword: 'Change Password',
    profileTitle: 'PolyStore Account',
    personalInfo: 'Personal Information',
    schoolEmailLabel: 'Email',
    phone: 'Phone Number',
    signOut: 'Sign Out',
    profileSaved: 'Profile saved.',
    account: 'Account',
    editProfile: 'Edit Profile',
    editProfileDesc: 'Update your account information',
    notifications: 'Notifications',
    notificationsDesc: 'Manage asset updates & license notifications',
    settings: 'Settings',
    settingsDesc: 'App & appearance settings',
    helpSupport: 'Help & Support',
    helpSupportDesc: 'Contact 3D asset support & tech help',
    logout: 'Logout',
    rewardPoints: 'Creator Reward Points',
    memberRank: 'Member Rank',
    pointsLabel: 'pts',
    totalOrders: 'Purchased Assets',
    totalSpent: 'Total Spent',
    pointsToNext: 'to next rank',
    rankBenefits: 'Member Benefits',
    currentRank: 'Current Rank',
    rankBronze: 'Bronze Creator',
    rankSilver: 'Silver Creator',
    rankGold: 'Gold Creator',
    rankPlatinum: 'Platinum Studio',
    benefits: 'Your Benefits',
    notifPrefOrders: 'Asset updates & download links',
    notifPrefPromos: 'New 3D releases & sales',
    notifPrefSound: 'Notification sounds',
    notifPrefPush: 'Browser push notifications',
    pushPermissionDenied: 'The browser denied notification permission.',
    toastOrderUpdate: 'System updated your 3D asset access rights.',
    toastSupportReply: 'New response from PolyStore 3D tech support.',
    toastAdminActivity: 'New order or customer message.',
    settingsAppLanguageHint: 'App display language',
    settingsThemeHint: 'Dark or light appearance',
    themeLight: 'Light',
    themeDark: 'Dark (Recommended)',
    themeSystem: 'System',
    helpDialogIntro: 'PolyStore 3D Technical Support. Email: support@polystore.com. 24/7 instant download access.',
    enablePushTitle: 'Enable Notifications',
    enablePushDesc: 'Get real-time updates when new 3D model files are released.',
    enablePushBtn: 'Enable',
    skipBtn: 'Skip',
    chatSupport: '3D Support',
    chatSupportDesc: 'Message PolyStore Admin directly',
    supportTypeMessage: 'Type a question about 3D models…',
    supportSend: 'Send',
    noThreadsYet: 'No conversations yet.',
    loadFailed: 'Could not load data. Check PolyStore server connection.',
    tryAgain: 'Try again',
    adminPanel: 'PolyStore 3D Admin',
    adminOrdersHint: 'Manage orders and 3D asset download access.',
    adminCustomer: 'Customer',
    adminNotifyPlaceholder: 'Message to customer (e.g. .FBX model updated to v2.0)...',
    adminSendUpdate: 'Send notification',
    adminAccessDenied: 'You do not have access to the PolyStore admin area.',
    adminSignInAsAdmin: 'Sign in with an admin account (admin@polystore.com).',
    adminTabOrders: 'Orders',
    adminTabUsers: 'Users',
    adminTabChat: '3D Support',
    adminDeleteOrder: 'Delete order',
    adminEditUser: 'Edit user',
    adminDeliveryAddress: 'Delivery Method',
    adminPickupLocation: '3D File',
    adminPaymentMethod: 'Payment',
    deleteNotification: 'Delete notification',
    userRole: 'Role',
    lastLogin: 'Last login',
    adminViewOrders: 'View orders',
    adminFilteringByUser: 'Filtering by user',
    adminClearFilter: 'Clear filter',
    adminTabDashboard: 'Dashboard',
    adminStatRevenue: 'Revenue',
    adminStatOrders: 'Orders',
    adminStatUsers: 'Users',
    adminStatProducts: 'Products',
    adminStatPendingPayments: 'Pending payments',
    adminStatAvgOrder: 'Avg. order value',
    adminStatRevenue30: 'Revenue (30 days)',
    adminStatToday: 'Today',
    adminRevenueTrend: 'Revenue trend (14 days)',
    adminTopProducts: 'Top products',
    adminRecentOrders: 'Recent orders',
    adminOrdersByStatus: 'Orders by status',
    adminSearchPlaceholder: 'Search...',
    adminFilterAll: 'All',
    adminNoResults: 'No matching results.',
    adminEditProduct: 'Edit product',
    adminEditCoupon: 'Edit coupon',
    adminProductPromotion: 'Promotion',
    adminProductPickupOnly: 'Pickup only',
    adminUserPoints: 'Points',
    adminUserRank: 'Rank',
    adminUserOrders: 'Orders',
    adminUserSpent: 'Total spent',
    adminSaved: 'Saved successfully',
    adminSaveFailed: 'Save failed',
    adminNoData: 'No data yet',
    libraryA: 'PolyStore Digital Cloud',
    towerA: 'Server 1 - US East',
    towerF: 'Server 2 - EU Central',
    towerG: 'Server 3 - AP Singapore',
    towerJ: 'Server 4 - JP Tokyo',
    towerI: 'Server 5 - Global CDN',
    mainGate: 'Web Portal Direct Access',
    continueAsGuest: 'Continue as Guest',
    guestName: 'Your Name',
    guestPhone: 'Phone Number',
    guestCheckoutTitle: 'Quick Checkout',
    guestCheckoutDesc: 'Instant download access — name and email only.',
    guestOrderPromptTitle: 'Want to save your asset library?',
    guestOrderPromptBody: 'Create a free PolyStore account to manage all your 3D downloads and order history.',
    createAccount: 'Create Account',
    maybeLater: 'Maybe Later',
    guestProfileTitle: 'Sign in for more perks',
    guestProfileDesc: 'Sign in or create an account to access your 3D assets anytime.',
    signIn: 'Sign In',
    guestPhoneInvalid: 'Please enter a valid phone number.',
    guestNameInvalid: 'Please enter your name.',
    guestEmail: 'Email',
    guestEmailInvalid: 'Please enter a valid email to receive your download link.',
    customerInfo: 'Customer Information',
    back: 'Back',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    copyOrderId: 'Copy ID',
    copiedToClipboard: 'Copied!',
    guestOrderDetail: 'Your Purchased Assets',
    guestOrderLookupTitle: 'Look up an order',
    guestOrderLookupDesc: 'Enter your order ID to check status & access download links',
    guestOrderLookupBtn: 'Look Up',
    guestOrderNotFound: 'Order not found.',
    deliveryDateLabel: 'Order Date',
    deliveryTimeLabel: 'Order Time',
    adminTabProducts: 'Products',
    adminTabCoupons: 'Coupons',
    adminAddProduct: 'Add Product',
    adminAddCoupon: 'Add Coupon',
    adminProductName: 'Product Name',
    adminProductPrice: 'Price',
    adminProductCategory: 'Category',
    adminProductImage: 'Image URL',
    adminProductStock: 'Stock Limit',
    adminCouponCode: 'Coupon Code',
    adminCouponDiscount: 'Discount (%)',
    adminCouponMaxUses: 'Max Uses',
    adminCouponExpires: 'Expiry Date',
    adminCouponMinSpent: 'Min Spent',
    authSuccess: 'Success!',
    promoCodePlaceholder: 'Enter promo code',
    applyPromo: 'Apply',
    viewAllServices: 'View all 3D products & assets here',
    storeAnnouncement: 'Welcome to PolyStore 3D Assets Marketplace! 🚀',
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
