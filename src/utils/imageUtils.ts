export const ensureBase64Prefix = (imageStr: string): string => {
  if (!imageStr) return '';
  const trimmed = imageStr.trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('http') ||
    lower.startsWith('data:image') ||
    lower.startsWith('/images') ||
    (lower.startsWith('/') && !lower.startsWith('/9j/')) ||
    lower.startsWith('blob:')
  ) {
    return trimmed;
  }
  return `data:image/jpeg;base64,${trimmed}`;
};

