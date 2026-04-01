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
    homeSameDayBody: 'Đặt online — nhận tại thư viện hoặc sảnh tòa. File PDF/DOC chuẩn bị sẵn giúp in nhanh hơn.',
    homePromoTitle1: 'Giảm 10% đơn đầu tiên',
    homePromoBody1: 'Nhập mã khi thanh toán tại quầy hoặc ghi chú trong đơn online.',
    homePromoCode1: 'FLASH10',
    homePromoTitle2: 'Ưu đãi sinh viên',
    homePromoBody2: 'Giảm thêm 5% cho hội nhóm / CLB (đơn từ 200k).',
    homePromoCode2: 'CLB5',
    homeFirstOrderTitle: 'Ưu đãi đơn hàng đầu tiên',
    homeFirstOrderBody: 'Miễn phí vận chuyển cho đơn hàng đầu tiên! Nhập mã này khi thanh toán.',
    reorder: 'Đặt Lại Đơn Hàng',
    reorderButton: 'Đặt lại',
    reorderAdded: 'Đã thêm sản phẩm vào giỏ hàng',
    trackOrder: 'Theo Dõi Đơn',
    add: 'Thêm',
    perPage: 'mỗii trang',
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
    deliverySpeed: 'Tốc Độ Giao Hàng',
    scheduleTime: 'Lên Lịch Giao',
    asap: 'Càng sớm càng tốt',
    saverDelivery: 'Tiết kiệm (10.000đ)',
    standardDelivery: 'Tiêu chuẩn (15.000đ)',
    priorityDelivery: 'Ưu tiên (30.000đ)',
    pickupOnlyWarning: 'Không khả dụng cho dịch vụ tại quầy',
    promoApplied: 'Đã áp dụng mã giảm giá!',
    promoInvalid: 'Mã giảm giá không hợp lệ',
    hasOrderPickupHint: 'Bấm để đến thanh toán →',
    myOrders: 'Đơn Hàng Của Tôi',
    noOrders: 'Chưa có đơn hàng',
    noOrdersDesc: 'Bạn chưa có đơn hàng nào',
    orderStatus: 'Trạng thái',
    pending: 'Chờ xử lý',
    processing_status: 'Đang xử lý',
    ready: 'Sẵn sàng',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
    reorderLabel: 'Đặt lại',
    cancelOrder: 'Hủy đơn hàng',
    cancelOrderHint: 'Chỉ hủy được khi đơn đang chờ hoặc đang xử lý.',
    orderCancelledOk: 'Đã hủy đơn hàng.',
    cannotCancelOrder: 'Không thể hủy đơn ở trạng thái này.',
    orderCancelReasonLabel: 'Lý do (tùy chọn)',
    orderDeclinedNote: 'Ghi chú từ cửa hàng',
    deleteOrderConfirm: 'Xóa vĩnh viễn đơn này khỏi hệ thống?',
    orderUpdatesFromStore: 'Cập nhật từ cửa hàng',
    orderStepPlaced: 'Đã đặt hàng',
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
    emailOrPhone: 'Email hoặc Số điện thoại',
    authFillAtLeastOne: 'Vui lòng nhập Email hoặc Số điện thoại.',
    optionalLabel: '(tùy chọn)',
    authPasswordMismatch: 'Mật khẩu xác nhận không khớp.',
    authFillFields: 'Vui lòng điền đầy đủ các ô.',
    authPhoneTaken: 'Số điện thoại này đã được sử dụng.',
    authInvalidEmail: 'Email không hợp lệ.',
    authNoAccount: 'Chưa có tài khoản?',
    authHasAccount: 'Đã có tài khoản?',
    authMustVanLangEmail: 'Email phải là tài khoản VLU (@vanlanguni.vn).',
    authStudentIdNumbersOnly: 'Mã số sinh viên chỉ được chứa chữ số.',
    loginRequiredCheckout: 'Vui lòng đăng nhập để đặt hàng.',
    forgotPassword: 'Quên mật khẩu?',
    resetPassword: 'Đặt lại mật khẩu',
    newPassword: 'Mật khẩu mới',
    confirmNewPassword: 'Xác nhận mật khẩu mới',
    sendResetLink: 'Gửi mã đặt lại',
    resetLinkSent: 'Mã đặt lại đã được gửi (kiểm tra console)',
    passwordChanged: 'Mật khẩu đã được thay đổi thành công.',
    oldPassword: 'Mật khẩu cũ',
    changePassword: 'Đổi mật khẩu',
    profileTitle: 'Hồ Sơ Của Tôi',
    personalInfo: 'Thông tin cá nhân',
    schoolEmailLabel: 'Email sinh viên',
    phone: 'Số điện thoại',
    signOut: 'Đăng xuất',
    profileSaved: 'Đã lưu hồ sơ.',
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
    rewardPoints: 'Điểm Tích Lũy',
    memberRank: 'Hạng Thành Viên',
    pointsLabel: 'điểm',
    totalOrders: 'Số đơn hàng',
    totalSpent: 'Tổng chi tiêu',
    pointsToNext: 'tới hạng tiếp theo',
    rankBenefits: 'Quyền Lợi Thành Viên',
    currentRank: 'Hạng hiện tại',
    rankBronze: 'Đồng',
    rankSilver: 'Bạc',
    rankGold: 'Vàng',
    rankPlatinum: 'Bạch km',
    benefits: 'Quyền lợi của bạn',
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
    helpDialogIntro: 'Liên hệ cửa hàng FlashNPrint tại campus VLU hoặc gửi email: support@flashnprint.vlu (demo). Giờ mở cửa: 8:00–18:00 các ngày trong tuần.',
    enablePushTitle: 'Bật Thông Báo',
    enablePushDesc: 'Nhận cập nhật liên tục về trạng thái đơn hàng.',
    enablePushBtn: 'Bật',
    skipBtn: 'Bỏ qua',
    chatSupport: 'Chat hỗ trợ',
    chatSupportDesc: 'Nhắn với cửa hàng (admin)',
    supportTypeMessage: 'Nhập tin nhắn…',
    supportSend: 'Gửi',
    noThreadsYet: 'Chưa có cuộc trò chuyện.',
    loadFailed: 'Không tải được dữ liệu. Kiểm tra máy chủ API hoặc mạng, rồi thử lại.',
    tryAgain: 'Thử lại',
    adminPanel: 'Quản trị đơn hàng',
    adminOrdersHint: 'Cập nhật trạng thái và gửi thông báo cho khách.',
    adminCustomer: 'Khách',
    adminNotifyPlaceholder: 'Thông báo cho khách (ví dụ: đơn đã sẵn sàng lấy tại quầy A)...',
    adminSendUpdate: 'Gửi thông báo',
    adminAccessDenied: 'Bạn không có quyền truy cập trang quản trị.',
    adminSignInAsAdmin: 'Đăng nhập bằng tài khoản admin.',
    adminTabOrders: 'Đơn hàng',
    adminTabUsers: 'Người dùng',
    adminTabChat: 'Hỗ trợ',
    adminDeleteOrder: 'Xóa đơn',
    adminEditUser: 'Sửa người dùng',
    adminDeliveryAddress: 'Địa chỉ giao hàng',
    adminPickupLocation: 'Điểm nhận hàng',
    adminPaymentMethod: 'Thanh toán',
    deleteNotification: 'Xóa thông báo',
    userRole: 'Vai trò',
    lastLogin: 'Đăng nhập gần nhất',
    adminViewOrders: 'Xem đơn hàng',
    adminFilteringByUser: 'Đang lọc theo người dùng',
    adminClearFilter: 'Xoá lọc',
    libraryA: 'Thư Viện Tòa A VLU',
    towerA: 'Tòa A - Sảnh',
    towerF: 'Tòa F - Sảnh',
    towerG: 'Tòa G - Tầng Trệt',
    towerJ: 'Tòa J - Tầng Trệt',
    towerI: 'Tòa I - Tầng Trệt',
    mainGate: 'Cổng trường Dương Quảng Hàm',
    continueAsGuest: 'Tiếp tục không cần đăng nhập',
    guestName: 'Tên của bạn',
    guestPhone: 'Số điện thoại',
    guestCheckoutTitle: 'Đặt hàng không cần tài khoản',
    guestCheckoutDesc: 'Chỉ cần tên và số điện thoại — không cần đăng ký.',
    guestOrderPromptTitle: 'Muốn lưu lịch sử đơn hàng?',
    guestOrderPromptBody: 'Tạo tài khoản miễn phí để theo dõi đơn hàng, tích điểm thưởng và nhận ưu đãi riêng.',
    createAccount: 'Tạo tài khoản',
    maybeLater: 'Để sau',
    guestProfileTitle: 'Đăng nhập để nhận thêm ưu đãi',
    guestProfileDesc: 'Đăng nhập hoặc tạo tài khoản để theo dõi đơn hàng, tích điểm và nhận khuyến mãi độc quyền.',
    signIn: 'Đăng nhập',
    guestPhoneInvalid: 'Vui lòng nhập số điện thoại hợp lệ.',
    guestNameInvalid: 'Vui lòng nhập tên của bạn.',
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
    homeSameDayBody: 'Order online — pick up at the library or tower lobby. PDF/DOC files ready to go speed things up.',
    homePromoTitle1: '10% off your first order',
    homePromoBody1: 'Enter the code at the counter or in your online order notes.',
    homePromoCode1: 'FLASH10',
    homePromoTitle2: 'Student clubs',
    homePromoBody2: 'Extra 5% off for club / group orders over 200.000đ.',
    homePromoCode2: 'CLB5',
    homeFirstOrderTitle: 'First Order Special',
    homeFirstOrderBody: 'Free shipping on your first order! Use this code at checkout.',
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
    deliverySpeed: 'Delivery Speed',
    scheduleTime: 'Schedule Time',
    asap: 'As soon as possible',
    saverDelivery: 'Saver Delivery (10,000đ)',
    standardDelivery: 'Standard Delivery (15,000đ)',
    priorityDelivery: 'Priority Delivery (30,000đ)',
    pickupOnlyWarning: 'Not available for strictly in-person services',
    promoApplied: 'Promo code applied!',
    promoInvalid: 'Invalid promo code',
    hasOrderPickupHint: 'Tap to go to checkout →',
    myOrders: 'My Orders',
    noOrders: 'No orders',
    noOrdersDesc: 'You haven\'t placed any orders yet',
    orderStatus: 'Status',
    pending: 'Pending',
    processing_status: 'Processing',
    ready: 'Ready',
    completed: 'Completed',
    cancelled: 'Cancelled',
    reorderLabel: 'Reorder',
    cancelOrder: 'Cancel order',
    cancelOrderHint: 'You can cancel while the order is pending or processing.',
    orderCancelledOk: 'Order cancelled.',
    cannotCancelOrder: 'This order cannot be cancelled now.',
    orderCancelReasonLabel: 'Reason (optional)',
    orderDeclinedNote: 'Note from store',
    deleteOrderConfirm: 'Permanently delete this order?',
    orderUpdatesFromStore: 'Updates from store',
    orderStepPlaced: 'Order placed',
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
    emailOrPhone: 'Email or Phone Number',
    authFillAtLeastOne: 'Please enter Email or Phone Number.',
    optionalLabel: '(optional)',
    authPasswordMismatch: 'Passwords do not match.',
    authFillFields: 'Please fill in all fields.',
    authPhoneTaken: 'This phone number is already taken.',
    authInvalidEmail: 'Please enter a valid email address.',
    authNoAccount: "Don't have an account?",
    authHasAccount: 'Already have an account?',
    authMustVanLangEmail: 'Email must be your VLU address (@vanlanguni.vn).',
    authStudentIdNumbersOnly: 'Student ID must contain only digits.',
    loginRequiredCheckout: 'Please sign in to place an order.',
    forgotPassword: 'Forgot password?',
    resetPassword: 'Reset Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    sendResetLink: 'Send Reset Code',
    resetLinkSent: 'Reset code sent (check console)',
    passwordChanged: 'Password changed successfully.',
    oldPassword: 'Old Password',
    changePassword: 'Change Password',
    profileTitle: 'My Profile',
    personalInfo: 'Personal Information',
    schoolEmailLabel: 'Student Email',
    phone: 'Phone Number',
    signOut: 'Sign Out',
    profileSaved: 'Profile saved.',
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
    rewardPoints: 'Reward Points',
    memberRank: 'Member Rank',
    pointsLabel: 'pts',
    totalOrders: 'Total Orders',
    totalSpent: 'Total Spent',
    pointsToNext: 'to next rank',
    rankBenefits: 'Member Benefits',
    currentRank: 'Current Rank',
    rankBronze: 'Bronze',
    rankSilver: 'Silver',
    rankGold: 'Gold',
    rankPlatinum: 'Platinum',
    benefits: 'Your Benefits',
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
    helpDialogIntro: 'Visit FlashNPrint on VLU campus or email support@flashnprint.vlu (demo). Hours: 8:00–18:00 weekdays.',
    enablePushTitle: 'Enable Notifications',
    enablePushDesc: 'Get real-time updates on your order status.',
    enablePushBtn: 'Enable',
    skipBtn: 'Skip',
    chatSupport: 'Support chat',
    chatSupportDesc: 'Message the store (admin)',
    supportTypeMessage: 'Type a message…',
    supportSend: 'Send',
    noThreadsYet: 'No conversations yet.',
    loadFailed: 'Could not load data. Check the API server or your connection, then try again.',
    tryAgain: 'Try again',
    adminPanel: 'Admin · Orders',
    adminOrdersHint: 'Update status and send notifications to customers.',
    adminCustomer: 'Customer',
    adminNotifyPlaceholder: 'Message to customer (e.g. ready for pickup at desk A)...',
    adminSendUpdate: 'Send notification',
    adminAccessDenied: 'You do not have access to the admin area.',
    adminSignInAsAdmin: 'Sign in with an admin account.',
    adminTabOrders: 'Orders',
    adminTabUsers: 'Users',
    adminTabChat: 'Support',
    adminDeleteOrder: 'Delete order',
    adminEditUser: 'Edit user',
    adminDeliveryAddress: 'Delivery address',
    adminPickupLocation: 'Pickup location',
    adminPaymentMethod: 'Payment',
    deleteNotification: 'Delete notification',
    userRole: 'Role',
    lastLogin: 'Last login',
    adminViewOrders: 'View orders',
    adminFilteringByUser: 'Filtering by user',
    adminClearFilter: 'Clear filter',
    libraryA: 'Library Tower A VLU',
    towerA: 'Tower A - Lobby',
    towerF: 'Tower F - Lobby',
    towerG: 'Tower G - Ground Floor',
    towerJ: 'Tower J - Ground Floor',
    towerI: 'Tower I - Ground Floor',
    mainGate: 'Duong Quang Ham Gate',
    continueAsGuest: 'Continue as Guest',
    guestName: 'Your Name',
    guestPhone: 'Phone Number',
    guestCheckoutTitle: 'Order without an account',
    guestCheckoutDesc: 'Just your name and phone number — no sign-up needed.',
    guestOrderPromptTitle: 'Want to save your order history?',
    guestOrderPromptBody: 'Create a free account to track orders, earn rewards, and get exclusive deals.',
    createAccount: 'Create Account',
    maybeLater: 'Maybe Later',
    guestProfileTitle: 'Sign in for more perks',
    guestProfileDesc: 'Sign in or create an account to track orders, earn rewards, and receive exclusive deals.',
    signIn: 'Sign In',
    guestPhoneInvalid: 'Please enter a valid phone number.',
    guestNameInvalid: 'Please enter your name.',
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
    guestOrderDetail: 'Your Order',
    guestOrderLookupTitle: 'Look up an order',
    guestOrderLookupDesc: 'Enter your order ID to check status',
    guestOrderLookupBtn: 'Look Up',
    guestOrderNotFound: 'Order not found.',
    deliveryDateLabel: 'Delivery Date',
    deliveryTimeLabel: 'Delivery Time',
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
    viewAllServices: 'View all our products/services here',
    storeAnnouncement: 'Happy Launching FlashNPrint! 🎉',
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
