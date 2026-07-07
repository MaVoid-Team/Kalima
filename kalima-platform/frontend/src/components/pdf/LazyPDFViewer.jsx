import { lazy, Suspense } from 'react';

const PDFViewer = lazy(() =>
    import('@embedpdf/react-pdf-viewer').then((mod) => ({ default: mod.PDFViewer }))
);

export default function LazyPDFViewer(props) {
    return (
        <Suspense fallback={<div className="h-full w-full bg-muted/20" />}>
            <PDFViewer {...props} />
        </Suspense>
    );
}
