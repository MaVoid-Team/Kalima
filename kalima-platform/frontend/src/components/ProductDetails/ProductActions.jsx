import { useState } from "react";
import { Minus, Plus, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

export default function ProductActions({ price }) {
  const { t } = useTranslation("product");
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));

  return (
    <div className="flex flex-col gap-4 mt-2">
      {/* Mobile Sticky Bar - Only visible on mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50 md:hidden shadow-lg flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">
            {t("info.totalPrice")}
          </span>
          <span className="text-xl font-black">${price}</span>
        </div>
        <Button className="flex-1 gap-2 h-12 text-lg font-bold" size="lg">
          <ShoppingCart className="h-5 w-5" />
          {t("actions.addToCart")}
        </Button>
      </div>

      {/* Desktop Layout - Hidden on Mobile */}
      <div className="hidden md:flex flex-col gap-4">
        <div className="flex gap-4">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handleDecrement}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="relative">
              <Input
                type="text"
                value={quantity}
                readOnly
                className="w-14 text-center font-bold shadow-none border-transparent  px-0"
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleIncrement}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Add to Cart */}
          <Button className=" gap-2 flex-1" size="lg">
            <ShoppingCart className="h-5 w-5" />
            {t("actions.addToCart")}
          </Button>
        </div>

        {/* Secondary Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" className=" text-sm flex-1  " size="lg">
            {t("actions.buyNow")}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsFavorite(!isFavorite)}
            className={
              isFavorite
                ? "text-destructive border-destructive hover:text-destructive "
                : "text-muted-foreground hover:text-destructive hover:border-destructive "
            }
          >
            <Heart
              className={`h-5 w-5 transition-all ${isFavorite ? "fill-current" : ""}`}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
