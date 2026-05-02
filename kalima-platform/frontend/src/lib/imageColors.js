export function extractImageColors(imageUrl) {
    return new Promise((resolve) => {
        if (!imageUrl) {
            resolve(null);
            return;
        }

        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.referrerPolicy = 'no-referrer';

        let attempt = 0;

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Scale down to 32x32 to get a good sampling of colors
                canvas.width = 32;
                canvas.height = 32;
                
                ctx.drawImage(img, 0, 0, 32, 32);
                const data = ctx.getImageData(0, 0, 32, 32).data;
                
                let maxScore = -1;
                let bestColor = [0, 0, 0];
                let rSum = 0, gSum = 0, bSum = 0, count = 0;
                
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
                    if (a < 128) continue;
                    
                    rSum += r; gSum += g; bSum += b; count++;

                    const max = Math.max(r, g, b);
                    const min = Math.min(r, g, b);
                    const saturation = max === 0 ? 0 : (max - min) / max;
                    const lightness = (max + min) / 2;
                    
                    // Filter out greys, pure whites, and pure blacks
                    if (lightness > 30 && lightness < 225) {
                        // Score based on how colorful and bright it is
                        const score = saturation * (max / 255);
                        if (score > maxScore) {
                            maxScore = score;
                            bestColor = [r, g, b];
                        }
                    }
                }

                if (count === 0) {
                    resolve(null);
                    return;
                }
                
                // If the image is entirely greyscale or muted, fallback to the average color
                if (maxScore < 0.1 && count > 0) {
                    bestColor = [Math.floor(rSum/count), Math.floor(gSum/count), Math.floor(bSum/count)];
                }
                
                const [r, g, b] = bestColor;

                resolve({
                    dominantRGB: `${r}, ${g}, ${b}`,
                    vibrantRGB: `${Math.min(255, Math.floor(r*1.3))}, ${Math.min(255, Math.floor(g*1.3))}, ${Math.min(255, Math.floor(b*1.3))}`
                });
            } catch (e) {
                if (attempt === 0) {
                    attempt++;
                    img.src = `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`;
                } else {
                    console.warn('Could not extract image colors:', e);
                    resolve(null);
                }
            }
        };

        img.onerror = () => {
            if (attempt === 0) {
                attempt++;
                img.src = `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`;
            } else {
                resolve(null);
            }
        };

        img.src = imageUrl;
    });
}
