// 토스의 공개 송금 딥링크 — 계좌/금액이 미리 채워진 토스 송금 화면을 바로 연다 (PG 가맹점 계약 불필요)
export const BANK_OPTIONS = [
  'KB국민',
  '신한',
  '우리',
  'NH농협',
  '하나',
  'IBK기업',
  'SC제일',
  '카카오뱅크',
  '토스뱅크',
  '케이뱅크',
  '새마을금고',
  '신협',
  '우체국',
];

export function buildTossSendLink({ bankName, accountNumber, amount }) {
  if (!bankName || !accountNumber || !amount) return '';
  const params = new URLSearchParams({
    bank: bankName,
    accountNo: accountNumber,
    amount: String(Math.round(amount)),
  });
  return `supertoss://send?${params.toString()}`;
}
