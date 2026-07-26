/**
 * Comprime y redimensiona una imagen en el cliente antes de subirla.
 * Útil para evitar el límite de 1MB de Firestore Documents.
 */
export const compressImage = (file: File, maxWidth = 400, quality = 0.6): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo no es una imagen válida.'));
      return;
    }

    // Validar tamaño máximo de entrada (5MB para procesar)
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('La imagen original excede los 5MB. Por favor use una más pequeña.'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width *= maxWidth / height;
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Retornar como Base64 comprimido
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Error al procesar la imagen.'));
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
  });
};
