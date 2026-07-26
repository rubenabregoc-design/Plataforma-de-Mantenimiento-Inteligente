/**
 * Limpia profundamente un objeto para Firebase.
 * Elimina claves con valor 'undefined' y convierte nulos si es necesario.
 * Firebase NO acepta 'undefined' en ningún nivel de anidación.
 */
export const cleanForFirebase = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    return value === undefined ? null : value;
  }));
};
