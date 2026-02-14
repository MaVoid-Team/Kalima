import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";

const PRODUCT_IMAGES = {
  CALCULUS:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBWZw1tvNFNTnPRazZVr9lnaQN7Q259AtGXgH18ByceKK9S2x0J6eMCmBcSbvr87ikuNCkhAG5p_Bo0HMQKN0jJO0Tiz5SL54bkYtmaj_yMyuryk3FGLbXwlncmbuuv18HFFgUbYXgq4bDq4umL6xdnTONm2pzYruiMBa59Dak2qZhWSt1iBafTxUl6XBBnSPbhVsmga4OkPJIAuqtPRVzpob2JtWcUfuveiE-RVzwZ2wtZQO09DAL3znrc6gUgYXzO2Yz5nh14ipY",
  PENS: "https://lh3.googleusercontent.com/aida-public/AB6AXuDaTYah6wO7skRz5E3F1DJ0yKo_De9oLjiEGw5c2X3UuAgFFiyPufc44t_FOCQ_lgGxidVcDeUOXwD98s0ieRBU6b2VSpHsyLi17Ao8aelYGtU7rabH2ngWLHJHXO-Ntdz-rvCXBimLRmMP2awi2A4tEWUt2amY_8XHVMAIMUojDkMcU6kTjkN7NPEZcvcKl19TRrInhPpKc32wmP3NydEAJaLHhRSzzQaGhkoWmWXaKsh28FJvpF8ge9FHxAR1kfM6LL8M-NyKyBM",
  NOTEBOOK:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCVeHw3EIjfGp7n8k8NWUIQFQfWQcy7lx7BYPkM363ST1PNVo_6cYkjiZKk6X73aVrrVX2cCWhu9Fe7eAbzMwUoi-mdl8CGfp4OrWPASN0rqDVZKmbOKR6GYF8rFQS7pSnWyaJub61D_SnTKIFPiofKDDOAgkgiiTR6Sr4aXGW3Yr0Vy_5tLM7WVcPRI9JQZAxcGeh5kYFmPW_X6eSvluLJGjRdHOj_fug2v7diw47tH-PPSldcjyjADEeRMnJ0hZ02wS0kikSYLD0",
  LAMP: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmByhQvL8w1mVJFf6r82E2IJb7enJ4QasIzUOS9mJ3C7QoKSM4yVAOp-Dz58SG7ROGowGCcddaDsCo8a-G3nKjPilEbQOm5dPUez-YM2l5wgk_YGIZIJzWntRr3g4-ml-JRWrWm3yNzkWVhCL8PmukOK0cHN3fKOT8_WQr1yQ8TEN51MCCnU9Z1KcbO3ctPDMG4n5te71fPukDoFvh44KFTAd5f-GaqlFx5LRH4083W6IqtJy2ibU7ykR3bSdnXf8I4_LdgPXKBAo",
};

const TrendingSection = () => {
  const { t } = useTranslation("market");

  const products = [
    {
      id: 1,
      title: t("products.trending.calculus.title"),
      category: t("products.trending.calculus.category"),
      price: 15.0,
      image: PRODUCT_IMAGES.CALCULUS,
      badge: null,
    },
    {
      id: 2,
      title: t("products.trending.pens.title"),
      category: t("products.trending.pens.category"),
      price: 24.99,
      image: PRODUCT_IMAGES.PENS,
      badge: null,
    },
    {
      id: 3,
      title: t("products.trending.notebook.title"),
      category: t("products.trending.notebook.category"),
      price: 8.5,
      image: PRODUCT_IMAGES.NOTEBOOK,
      badge: null,
    },
    {
      id: 4,
      title: t("products.trending.lamp.title"),
      category: t("products.trending.lamp.category"),
      price: 32.0,
      image: PRODUCT_IMAGES.LAMP,
      badge: null,
    },
  ];

  return (
    <section className="container py-8 md:py-16">
      <div className="flex items-center justify-between mb-6 md:mb-10">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          {t("sections.trending.title")}
        </h2>
        <Button
          variant="ghost"
          className="text-primary hover:bg-transparent px-0 md:px-4"
          asChild
        >
          <Link to="#" className="inline-flex items-center gap-2 group text-sm md:text-base">
            {t("sections.trending.viewAll")}{" "}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-12">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  );
};

export default TrendingSection;
