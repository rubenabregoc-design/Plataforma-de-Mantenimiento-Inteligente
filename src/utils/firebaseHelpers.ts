/**
 * Limpia recursivamente un objeto para que no contenga valores 'undefined',
 * los cuales Firebase rechaza. Convierte 'undefined' en 'null' o elimina la clave.
 */
export const cleanForFirebase = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj === undefined ? null : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cleanForFirebase(item));
  }

  const newObj: any = {};
  Object.keys(obj).forEach(key => {
    const val = obj[key];
    if (val !== undefined) {
      const cleaned = cleanForFirebase(val);
      if (cleaned !== undefined) {
        newObj[key] = cleaned;
      }
    }
  });
  return newObj;
};
