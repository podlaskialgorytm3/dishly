export function getReadableOrderCode(orderNumber: string): string {
  const digitsOnly = orderNumber.replace(/\D/g, "");

  if (digitsOnly.length > 0) {
    const lastTwoDigits = Number(digitsOnly.slice(-2));
    return lastTwoDigits.toString().padStart(2, "0");
  }

  let hash = 0;
  for (let i = 0; i < orderNumber.length; i++) {
    hash = (hash * 31 + orderNumber.charCodeAt(i)) % 100;
  }

  return hash.toString().padStart(2, "0");
}
