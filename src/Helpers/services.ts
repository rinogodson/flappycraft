async function compressImageToWebp(file: File, targetKB: number) {
  return new Promise<string>((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("File is not an image"));
      return;
    }

    const maxBytes = targetKB * 1024;
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target) return;
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;

        if (!ctx) return;
        ctx.drawImage(img, 0, 0);

        let quality = 0.92;
        let dataUrl = canvas.toDataURL("image/webp", quality);

        const getBytes = (dataURL: string) =>
          Math.ceil((dataURL.length * 3) / 4) -
          (dataURL.endsWith("==") ? 2 : dataURL.endsWith("=") ? 1 : 0);

        while (getBytes(dataUrl) > maxBytes && quality > 0.1) {
          quality -= 0.05;
          dataUrl = canvas.toDataURL("image/webp", quality);
        }

        if (getBytes(dataUrl) > maxBytes) {
          let scale = 0.9;

          while (scale > 0.3) {
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            quality = 0.92;
            dataUrl = canvas.toDataURL("image/webp", quality);

            while (getBytes(dataUrl) > maxBytes && quality > 0.1) {
              quality -= 0.05;
              dataUrl = canvas.toDataURL("image/webp", quality);
            }

            if (getBytes(dataUrl) <= maxBytes) break;
            scale -= 0.1;
          }
        }

        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error("Invalid image"));
      img.src = String(e.target.result);
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export { compressImageToWebp };
