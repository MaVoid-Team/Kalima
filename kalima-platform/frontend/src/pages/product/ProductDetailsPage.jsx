import { useParams, Link } from "react-router-dom";
import {
  AlertCircle,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useTranslation } from "react-i18next";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { motion } from "framer-motion";
import ImageGallery from "@/components/ProductDetails/ImageGallery";
import ProductInfo from "@/components/ProductDetails/ProductInfo";
import ProductActions from "@/components/ProductDetails/ProductActions";

import { useProducts } from "@/hooks/useProducts";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { t } = useTranslation("product");

  const { product: productProps, images, loading, notFound } = useProducts(id);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <LoadingSpinner className="h-10 w-10 text-primary" />
          <p className="text-sm">{t("loading")}</p>
        </div>
      </div>
    );
  }

  // ── Not found / error ────────────────────────────────────────────────────
  if (notFound || !productProps) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-bold">{t("notFound")}</h1>
          <Link
            to="/market"
            className="text-primary underline underline-offset-4 text-sm"
          >
            {t("breadcrumbs.digitalProducts")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-8 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">{t("breadcrumbs.home")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/market">{t("breadcrumbs.digitalProducts")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {productProps.category && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{productProps.category}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[200px] truncate">
                {productProps.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Gallery (7 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-7"
          >
            <ImageGallery images={images} />
          </motion.div>

          {/* Right Column: Product Info (5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="lg:sticky lg:top-24 flex flex-col gap-6">
              <ProductInfo product={productProps} />

              <ProductActions
                price={productProps.price_after_discount || productProps.price}
                productId={productProps.id}
                sampleUrl={productProps.sample_url}
              />

              {/* Description Text */}
              {productProps.description && (
                <div className="mt-4 prose max-w-none text-muted-foreground w-full">
                  <p className="text-base leading-relaxed text-balance wrap-break-word">
                    {productProps.description}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

