const AMOUNT_PATTERN = /^\d+(?:\.\d{1,2})?$/;

export const isValidAmountInput = (value: string) => AMOUNT_PATTERN.test(value);

export const parseAmountToPaise = (value: string): number => {
  if (!isValidAmountInput(value)) {
    throw new Error("Amount must be a positive number with up to 2 decimal places.");
  }

  const [rupeesPart, paisePart = ""] = value.split(".");
  const normalizedPaise = `${paisePart}00`.slice(0, 2);
  const amountPaise = Number(rupeesPart) * 100 + Number(normalizedPaise);

  if (!Number.isSafeInteger(amountPaise) || amountPaise <= 0) {
    throw new Error("Amount must be greater than zero.");
  }

  return amountPaise;
};

export const formatPaiseToAmount = (amountPaise: number): string => {
  const sign = amountPaise < 0 ? "-" : "";
  const absolute = Math.abs(amountPaise);
  const rupees = Math.floor(absolute / 100);
  const paise = `${absolute % 100}`.padStart(2, "0");

  return `${sign}${rupees}.${paise}`;
};
