type ExpenseFingerprintInput = {
  amountPaise: number;
  categoryKey: string;
  description: string;
  date: string;
};

export const createRequestFingerprint = (input: ExpenseFingerprintInput) =>
  JSON.stringify(input);
