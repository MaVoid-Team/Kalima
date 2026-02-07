import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const ProductCard = ({ title, category, price, image, badge }) => {
  const { t } = useTranslation("market");

  return (
    <Card className="border-none shadow-none ">
      <CardContent className="p-0 relative overflow-hidden rounded-4xl mb-4">
        {badge && (
          <Badge className="absolute top-4 start-4 z-10 ">
            {t(`product.${badge}`)}
          </Badge>
        )}
        <img src={image} alt={title} className="object-cover w-full h-full" />
      </CardContent>
      <CardFooter className="p-0 flex flex-col items-start gap-1">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground">{category}</p>
        <p className="text-base font-semibold mt-1">
          {t("product.currency")} {price.toFixed(2)}
        </p>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
