export type ContactInput = {
  name: string;
  company: string;
  email: string;
  phone: string;
  area: string;
  message: string;
  website: string;
  startedAt: number;
  acknowledged: boolean;
};
const limits = {
  name: [2, 100],
  company: [2, 160],
  email: [5, 254],
  phone: [0, 40],
  area: [0, 80],
  message: [20, 5000],
} as const;
export function validateContact(
  value: unknown,
  now = Date.now(),
): { ok: true; data: ContactInput } | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return { ok: false, error: 'Geçersiz form verisi.' };
  const input = value as Record<string, unknown>;
  const data: Record<string, string> = {};
  for (const [field, [min, max]] of Object.entries(limits)) {
    if (typeof input[field] !== 'string')
      return { ok: false, error: 'Form alanlarını kontrol edin.' };
    const text = (input[field] as string).trim();
    if (
      text.length < min ||
      text.length > max ||
      Array.from(text).some((character) => {
        const code = character.charCodeAt(0);
        return code < 32 && code !== 9 && code !== 10 && code !== 13;
      })
    )
      return {
        ok: false,
        error: 'Alan uzunluklarını ve açıklamanızı kontrol edin.',
      };
    data[field] = text;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || /[\r\n]/.test(data.email))
    return { ok: false, error: 'Geçerli bir e-posta adresi girin.' };
  if (
    input.website !== '' ||
    input.acknowledged !== true ||
    typeof input.startedAt !== 'number' ||
    !Number.isFinite(input.startedAt) ||
    now - input.startedAt < 3000 ||
    now - input.startedAt > 86400000
  )
    return {
      ok: false,
      error: 'Form doğrulanamadı. Sayfayı yenileyip yeniden deneyin.',
    };
  return {
    ok: true,
    data: {
      ...data,
      website: '',
      startedAt: input.startedAt,
      acknowledged: true,
    } as ContactInput,
  };
}
