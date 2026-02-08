import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function ImageGallery({ images, badge }) {
  const { t, i18n } = useTranslation();
  const [mainApi, setMainApi] = useState(null);
  const [thumbApi, setThumbApi] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const imagesList = [images?.main, ...(images?.thumbnails ?? [])].filter(
    Boolean,
  );

  useEffect(() => {
    if (!mainApi) return;

    const handleSelect = () => {
      setSelectedIndex(mainApi.selectedScrollSnap());
      if (thumbApi) thumbApi.scrollTo(mainApi.selectedScrollSnap());
    };

    setScrollSnaps(mainApi.scrollSnapList());

    mainApi.on("select", handleSelect);
    mainApi.on("reInit", handleSelect);

    return () => {
      mainApi.off("select", handleSelect);
      mainApi.off("reInit", handleSelect);
    };
  }, [mainApi, thumbApi]);

  const onThumbClick = useCallback(
    (index) => {
      if (!mainApi) return;
      mainApi.scrollTo(index);
    },
    [mainApi],
  );

  if (!imagesList.length) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Slider */}
      <div className="relative w-full aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-muted group">
        <Carousel
          setApi={setMainApi}
          opts={{
            loop: true,
            direction: i18n.dir(),
          }}
          className="w-full h-full"
        >
          <CarouselContent>
            {imagesList.map((img, index) => (
              <CarouselItem key={index} className="h-full">
                <img
                  src={img}
                  alt={`${t("info.view")} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {imagesList.length > 1 && (
            <>
              <div className="hidden md:block">
                <CarouselPrevious className="start-4 bg-background/80 hover:bg-background" />
                <CarouselNext className="end-4 bg-background/80 hover:bg-background" />
              </div>
              {/* Mobile Dots */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 md:hidden">
                {scrollSnaps.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      index === selectedIndex
                        ? "bg-primary w-4"
                        : "bg-primary/30",
                    )}
                    onClick={() => mainApi?.scrollTo(index)}
                  />
                ))}
              </div>
            </>
          )}
        </Carousel>
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
                  >
                    <img
                      src={thumb}
                      alt={`${t("info.thumbnail")} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
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
