import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

export default function ImageGallery({ images, badge }) {
  const { t, i18n } = useTranslation("product");
  const [thumbApi, setThumbApi] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const imagesList = useMemo(
    () => {
      if (!images) return [];
      const list = [images.main, ...(images.thumbnails ?? [])].filter(Boolean);
      return list;
    },
    [images],
  );

  useEffect(() => {
    if (!imagesList.length) {
      setSelectedIndex(0);
      return;
    }

    setSelectedIndex((previousIndex) =>
      Math.min(previousIndex, imagesList.length - 1),
    );
  }, [imagesList]);

  useEffect(() => {
    if (!thumbApi || imagesList.length < 2) return;
    thumbApi.scrollTo(selectedIndex);
  }, [thumbApi, selectedIndex, imagesList.length]);

  const onThumbClick = useCallback(
    (index) => {
      setSelectedIndex(index);
    },
    [],
  );

  const showPrevious = useCallback(() => {
    if (imagesList.length < 2) return;
    setSelectedIndex((previous) =>
      previous === 0 ? imagesList.length - 1 : previous - 1,
    );
  }, [imagesList.length]);

  const showNext = useCallback(() => {
    if (imagesList.length < 2) return;
    setSelectedIndex((previous) => (previous + 1) % imagesList.length);
  }, [imagesList.length]);

  const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";

  if (!imagesList.length) {
    return (
      <div className="flex flex-col gap-4">
        <div className="relative w-full aspect-square md:aspect-4/3 rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
          <img src={fallbackImage} alt="No image available" className="w-full h-full object-cover opacity-50" />
        </div>
      </div>
    );
  }

  const renderMedia = (mediaItem, isThumbnail = false) => {
    // Legacy support for plain strings
    if (typeof mediaItem === 'string') {
      return (
        <img
          src={mediaItem}
          alt={isThumbnail ? t("info.thumbnail") : t("info.view")}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImage;
          }}
        />
      );
    }

    const { type, url, thumbnail, source_type } = mediaItem;
    const isVideo = type === 'video';
    const isExternalVideoUrl = typeof url === "string" && (url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com"));
    const isExternal = isVideo && (source_type === 'external' || isExternalVideoUrl);

    // Thumbnail specific rendering
    if (isThumbnail) {
      if (isVideo) {
        if (thumbnail) {
          return (
            <div className="relative w-full h-full">
              <img src={thumbnail} alt="Video thumbnail" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Video className="h-6 w-6 text-white drop-shadow-md" />
              </div>
            </div>
          );
        }
        return (
          <div className="w-full h-full bg-muted flex flex-col items-center justify-center text-muted-foreground border-border">
            <Video className="h-6 w-6 opacity-60 mb-1" />
            <span className="text-[10px] font-medium leading-tight px-1 text-center">Video</span>
          </div>
        );
      }

      return (
        <img
          src={url}
          alt={t("info.thumbnail")}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImage;
          }}
        />
      );
    }

    // Main view rendering
    if (isVideo) {
      if (isExternal) {
        // Embed Youtube / Vimeo
        const isYoutube = url?.includes('youtube.com') || url?.includes('youtu.be');
        let embedUrl = url;
        if (isYoutube) {
          let videoId = '';
          try {
            if (url.includes('youtube.com/watch')) {
              videoId = new URL(url).searchParams.get('v');
            } else if (url.includes('youtu.be/')) {
              videoId = url.split('youtu.be/')[1].split(/[?#]/)[0];
            }
          } catch (_) {
            videoId = '';
          }
          if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0`;
        }
        return (
          <iframe
            src={embedUrl}
            className="w-full h-full border-0 absolute inset-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="External Video"
          />
        );
      }
      return (
        <video
          src={url}
          className="w-full h-full object-contain bg-black"
          controls
          playsInline
        />
      );
    }

    return (
      <img
        src={url}
        alt={t("info.view")}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = fallbackImage;
        }}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Slider */}
      <div className="relative w-full aspect-square md:aspect-4/3 rounded-2xl overflow-hidden bg-muted group">
        {renderMedia(imagesList[selectedIndex], false)}

        {imagesList.length > 1 && (
          <>
            <div className="hidden md:block">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={showPrevious}
                className="absolute start-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background"
                data-testid="product-gallery-prev-button"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Previous slide</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={showNext}
                className="absolute end-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background"
                data-testid="product-gallery-next-button"
              >
                <ArrowRight className="h-4 w-4" />
                <span className="sr-only">Next slide</span>
              </Button>
            </div>

            {/* Mobile Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 md:hidden">
              {imagesList.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === selectedIndex ? "bg-primary w-4" : "bg-primary/30",
                  )}
                  onClick={() => setSelectedIndex(index)}
                  data-testid={`product-gallery-dot-${index}-button`}
                />
              ))}
            </div>
          </>
        )}

        {badge && (
          <div className="absolute top-4 start-4 z-10 pointer-events-none">
            <Badge className="rounded-full px-3">{badge}</Badge>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {imagesList.length > 1 && (
        <div className="hidden md:block">
          <Carousel
            setApi={setThumbApi}
            opts={{
              align: "start",
              containScroll: "keepSnaps",
              dragFree: true,
              direction: i18n.dir(),
            }}
            className="w-full"
          >
          <CarouselContent className="-ms-2">
              {imagesList.map((thumb, index) => (
                <CarouselItem
                  key={index}
                  className="ps-2 basis-1/4 sm:basis-1/5 md:basis-1/6"
                >
                  <div
                    className={cn(
                      "cursor-pointer rounded-lg overflow-hidden border-2 transition-all aspect-square",
                      selectedIndex === index
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent hover:border-border",
                    )}
                    onClick={() => onThumbClick(index)}
                    data-testid={`product-gallery-thumb-${index}-button`}
                  >
                    {renderMedia(thumb, true)}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      )}
    </div>
  );
}
