import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function BookletStickyFooter({ price, onAddToCart }) {
  const { t } = useTranslation("product");

  return (
    <Card className="fixed bottom-0 left-0 right-0 rounded-none border-x-0 border-b-0 p-4 z-50 md:sticky md:bottom-4 md:rounded-2xl md:shadow-xl md:border md:m-4 md:mb-6 bg-background">
      <div className="container max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* Add to Cart (Secondary) */}
        <Button
          variant="outline"
          className="flex-1 gap-2 font-bold border-primary text-primary hover:bg-primary/10"
          size="lg"
          onClick={onAddToCart}
        >
          <ShoppingCart className="w-5 h-5" />
          {t("actions.addToCart", "Add to Cart")}
        </Button>

        {/* Buy Now (Primary) */}
        <Button
          className="flex-[2] gap-2 font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
          size="lg"
          onClick={() => console.log("Buy Now Clicked")}
        >
          {t("actions.buyNow", "Buy Now")}
        </Button>
      </div>
    </Card>
  );
}
