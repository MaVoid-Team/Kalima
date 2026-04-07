import { useState, useEffect } from 'react';
import { formatFileSize, getFileSizeFromUrl } from '@/lib/storeUtils';

export default function RemoteFileSize({ url, fallbackSize }) {
    const [size, setSize] = useState(null);

    useEffect(() => {
        if (fallbackSize) return;
        if (!url) return;
        
        let isMounted = true;
        getFileSizeFromUrl(url).then(bytes => {
            if (isMounted) setSize(bytes);
        });
        return () => { isMounted = false; };
    }, [url, fallbackSize]);

    const displaySize = fallbackSize || size;
    return displaySize ? formatFileSize(displaySize) : '...';
}
