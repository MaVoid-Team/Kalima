import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";

const ProductSection = ({ title, products, viewAllLink = "#" }) => {
  return (
    <section className="container py-16">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl  font-bold tracking-tight">
          {title}
        </h2>
        <Button variant="ghost" className="text-primary group gap-2" asChild>
          <Link to={viewAllLink}>
            View All{" "}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  );
};

export default ProductSection;
