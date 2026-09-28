export const DECK_VALUES: Record<string, string[]> = {
  fibonacci: ['0', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?'],
  tshirt: ['XS', 'S', 'M', 'L', 'XL', '?'],
};

export const DECK_LABELS: Record<string, { name: string; preview: string }> = {
  fibonacci: { name: 'Fibonacci', preview: '1 · 2 · 3 · 5 · 8 · 13' },
  tshirt: { name: 'T-shirt', preview: 'XS · S · M · L · XL' },
};
