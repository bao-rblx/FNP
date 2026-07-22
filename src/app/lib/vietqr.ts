// Shared VietQR helper.
// Defaults target the store's TPBank account; override via VITE_VIETQR_* env vars.

// TPBank VietQR BIN is 970423. The img.vietqr.io API also accepts the short code "TPB".
const DEFAULT_BANK_ID = 'TPB';
const DEFAULT_ACCOUNT_NO = '0947509920';
const DEFAULT_ACCOUNT_NAME = 'LUU GIA BAO';

export interface VietQrInfo {
  bankId: string;
  accountNo: string;
  accountName: string;
  amount: number;
  addInfo: string;
}

export function getVietQrConfig() {
  return {
    bankId: import.meta.env.VITE_VIETQR_BANK_ID || DEFAULT_BANK_ID,
    accountNo: import.meta.env.VITE_VIETQR_ACCOUNT_NO || DEFAULT_ACCOUNT_NO,
    accountName: import.meta.env.VITE_VIETQR_ACCOUNT_NAME || DEFAULT_ACCOUNT_NAME,
  };
}

/** Transfer memo used both on the QR and shown to the customer. */
export function buildTransferInfo(orderId: string): string {
  return `POLYSTORE ${orderId}`;
}

/** Build the img.vietqr.io image URL for a given order + amount. */
export function buildVietQrUrl(orderId: string, amount: number): string {
  const { bankId, accountNo, accountName } = getVietQrConfig();
  const info = buildTransferInfo(orderId);
  const params = new URLSearchParams({
    amount: String(Math.round(amount)),
    addInfo: info,
    accountName,
  });
  return `https://img.vietqr.io/image/${encodeURIComponent(bankId)}-${encodeURIComponent(
    accountNo,
  )}-compact2.png?${params.toString()}`;
}
