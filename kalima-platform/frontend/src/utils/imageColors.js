export function extractImageColors(imageUrl) {
    return new Promise((resolve) => {
        if (!imageUrl) {
            resolve(null);
            return;
        }

        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Scale down to 10x10 to average out noise and improve performance
                canvas.width = 10;
                canvas.height = 10;
                
                ctx.drawImage(img, 0, 0, 10, 10);
                const imageData = ctx.getImageData(0, 0, 10, 10).data;
                
                let r = 0, g = 0, b = 0;
                let count = 0;
                
                for (let i = 0; i < imageData.length; i += 4) {
                    // Ignore highly transparent pixels
                    if (imageData[i + 3] < 128) continue;
                    
                    r += imageData[i];
                    g += imageData[i + 1];
                    b += imageData[i + 2];
                    count++;
                }

                if (count === 0) {
                    resolve(null);
                    return;
                }
                
                r = Math.floor(r / count);
                g = Math.floor(g / count);
                b = Math.floor(b / count);
                
                // Enhance vibrancy for the gradient
                const r2 = Math.min(255, Math.floor(r * 1.2));
                const g2 = Math.min(255, Math.floor(g * 1.2));
                const b2 = Math.min(255, Math.floor(b * 1.2));

                resolve({
                    start: `rgba(${r2}, ${g2}, ${b2}, 0.25)`,
                    mid: `rgba(${r}, ${g}, ${b}, 0.1)`,
                    end: 'var(--background)' // Fades into the background cleanly
                });
            } catch (e) {
                console.warn('Could not extract image colors (CORS or other issue):', e);
                resolve(null);
            }
        };

        img.onerror = () => {
            resolve(null);
        };

        img.src = imageUrl;
    });
}
