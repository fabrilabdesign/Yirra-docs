// Currency utility for Australian business
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD'
  }).format(amount || 0);
};

export const formatCurrencyFromCents = (amountInCents) => {
  return formatCurrency(amountInCents / 100);
};

export const DEFAULT_CURRENCY = 'AUD';
export const DEFAULT_CURRENCY_SYMBOL = '$';