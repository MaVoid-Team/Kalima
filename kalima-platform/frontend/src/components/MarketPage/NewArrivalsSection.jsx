import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";

const PRODUCT_IMAGES = {
  AGENDA:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuABGkT3F_pwyRNJTQZT7MeSiQ7VWu2WoOz_n6dN61UvsbgMS3fFGsnQN6fvfqkmlfMmZ2RA0q-HJWsfdm_dy1LXimd3bWHU7iS4EJaykUI-zJjhCqNIbcD3-rUVVKZ441bwagLCFN-GeaBML1jS-8GkwLHUFlSLP3re4GLcj33z5ULv4d1w0ISDhjm38CkGYbJisT1NzFITNk_aQS6TxDWDVpxONW5wnluJAKeC-SSkb-BSu1zPPGes63VAcCcLr6qoRsKmG62IQ1I",
  CHEMISTRY:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCozdsahdXqLALQtT52t0y31eMMIMbGuR-K-0K0ifW2qCPXNNpMLhwl1-qplwHuVd8es-5KvV8FIlVN33zDnosO_Mfmj7lpzXx1FVAqjMqKtp3tMlJuFUMOJDJqARAeL8i3o3kc9T_0UgeKwZ7s2AEkgNe81HviU8L7-wO468Nvw-d3K9NHdAmUJnDK3oHgbj9fQ9W6WnzUOWrgAFN6yT0J-g7txjj8QDU1V_DZI6TdXIgeHS8zSXA7hFeW7fJ9Tla-fieAVpoyX_U",
  BOOKS:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC3bzGki1Xq2qZ9GGhj543G5F1DwuTHGITUxbK2NzOMs5tqA6qghEn8UFNPbIMV1pBY1FKxyECDUYqr_dSAISTFvoC32dJ22dkW9fDL69yDKynSXwPcgswQxlyIdzLczVYcA-Fvo-hZ5nn_32YawzMppqQzGD-_MXnixrmZPYywUAt7cmmj6b4lMh_ogs2xix_XKPF2BKDq1WpeB02LvGZ0jhSgKH43USH1u_OCxxblpTib4z9-EB7qKEwqiiibQKKpWsuo8Jd2IRo",
  MARKERS:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCt8h-bzNddKuJ7gMcoJkY5M358x3EzEK72CkaP9tDGygxp2FITqxo6Ekdj_q4XCDGkk8N5peEiFo-PNs5J4nuEevah6Rivkkvh2omnZVkUHn4p3mEgDSdkUZ-6e95WgfiXzFGn6tBgEUjJo8HZIycWJauOdGGhO63T6e_QiMY2r05Wq1UCjimjMI-XK5utIksjLFNhgKDCvzdfEvSvJ5gEijpGQXj2vZoCzEFaXdgI5tpKpaQIsVlnAjYCx8GoKZ6VuirMKWejywY",
};

const NewArrivalsSection = () => {
  const { t } = useTranslation("market");

  const products = [
    {
      id: 5,
      title: t("products.newArrivals.agenda.title"),
      category: t("products.newArrivals.agenda.category"),
      price: 10.0,
      image: PRODUCT_IMAGES.AGENDA,
      badge: "newBadge",
    },
    {
      id: 6,
      title: t("products.newArrivals.chemistry.title"),
      category: t("products.newArrivals.chemistry.category"),
      price: 45.0,
      image: PRODUCT_IMAGES.CHEMISTRY,
      badge: "newBadge",
    },
    {
      id: 7,
      title: t("products.newArrivals.books.title"),
      category: t("products.newArrivals.books.category"),
      price: 35.0,
      image: PRODUCT_IMAGES.BOOKS,
      badge: "newBadge",
    },
    {
      id: 8,
      title: t("products.newArrivals.markers.title"),
      category: t("products.newArrivals.markers.category"),
      price: 18.99,
      image: PRODUCT_IMAGES.MARKERS,
      badge: "newBadge",
    },
  ];

  return (
    <section className="container py-16">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-bold tracking-tight">
          {t("sections.newArrivals.title")}
        </h2>
        <Button
          variant="ghost"
          className="text-primary hover:bg-transparent group"
          asChild
        >
          <Link to="#">
            {t("sections.newArrivals.viewAll")}
            <ArrowRight className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
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

export default NewArrivalsSection;
