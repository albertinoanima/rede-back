export const palopCountries = [
  "Angola",
  "Cabo Verde",
  "Guine-Bissau",
  "Mocambique",
  "Sao Tome e Principe"
] as const;

export type PalopCountry = (typeof palopCountries)[number];
