export const mapToUuid = (id: string | number | undefined | null): string => {
  if (!id) return "00000000-0000-0000-0000-000000000000";
  
  const idStr = String(id);
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (uuidRegex.test(idStr)) return idStr;
  
  // Deterministic mapping
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
      hash = ((hash << 5) - hash) + idStr.charCodeAt(i);
      hash |= 0;
  }
  
  // Prevent purely numeric hashes from being coerced into integers by SQLite
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex}-aaaa-4000-8000-a00000000000`;
};
