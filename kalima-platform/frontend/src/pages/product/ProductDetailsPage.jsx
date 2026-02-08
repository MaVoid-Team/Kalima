import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  Truck,
  RefreshCw,
  Package,
  Download,
  PackageOpen,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import ImageGallery from "@/components/ProductDetails/ImageGallery";
import ProductInfo from "@/components/ProductDetails/ProductInfo";
import ProductActions from "@/components/ProductDetails/ProductActions";
import ProductTabs from "@/components/ProductDetails/ProductTabs";
// Sample product data
const SAMPLE_PRODUCT = {
  id: "sci-g5-2024",
  sku: "SCI-G5-2024",
  title: "Grade 5 Science Classroom Kit - Comprehensive Edition",
  category: "Science & Nature",
  price: 49.99,
  originalPrice: 64.99,
  discount: 23,
  rating: 4.8,
  reviewCount: 124,
  inStock: true,
  badge: "Best Seller",
  images: {
    main: "https://lh3.googleusercontent.com/aida-public/AB6AXuATwJ0Cz21gfynFVWzWonvM3dNF_Y-V7Y1klHa-isqHnVu_-yuXGfSHZls0MSGa__5Oldok1QisI0pSCUW5AR1zUyfPO4VY8QLWmsYNbBom945iAvmQ-1zh8vagcdEYRToPyTnLjTXyyyRQIr_hm7l4C9bdu5rMBvMnlrCDIQ9ITPxtWog2AG3GAI-Bq4FPf6Clbx1HmaA0HJYlhRobAre8_9Jg0lLHySM6tfkOEqtb20fkttQ7ctPK-_LPlCpyVwDfGS-RDbP5qpg",
    thumbnails: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAo_OHgEObEMxq0kLGMCvPbxmIiddGIChJU2pD5QvjsdoIE9QRm2sUkgS_Geoch2_UrlWVSsN04n0kBTJ-Ox_h_pGSpNyHcZ_5dYNd_sxphG8LUqo0DmezOCUMnfVSpinJjRknEcIstWIEi3dM0bn_y2P3whmLIl9LCNilUXfovKtsnjy4SS9ACskEZpkg3e9C6yOXs6IXfwyaQ4B2TBdPN8fVdNnmRlptPTKV80YRKwCSwhXfp8_DK_AEXxoPvWTCdptGNeNzRFUI",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB7Vy_jrIf4DRSqHjxDsk9PDgkkcHtvR9czTCjMja0Quh1pG3S33uk7L1_SjGXJEKK1FlfG3SQRC-vTDkjdiuXetVsyn0mUh6DNFUc6Vd0UTVcH0ZJZYKi9b17lmGRDB-jWtQ16Ogk8RpcqgIUtzSC5C8udtbmqNbItQq6eLgUHbPnU9DqFj4LyG1y4S6duXQ_F1C0W0gmM_xBSXnKN126vSt034igd6BTYz_nZWdZdUGOWryVE8RfZdPPpY7v9wtJODYRsO3IO0jI",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAqrryvsDl8GeFaNjWqoY9qjok4PYjOOFvRaN32prgooXJApqYFPp-oWx0DiAP0r9QjUJqApJdW0IKShjz_OOznQM5QJQcsJ05penzHN0ic0H8HI5NdfSI_R8TxCqqG7flq-z1_Xk0VdACOFZbUnMhGyEFzhADdYGtAJvWc96dBMJR44yUDafyJisXtIpAgB2VLbed0Wpxke2QrUZh2u1CiNJdxrUfKNd_7UIYaKNoAqn3UNHk6vUSRvJgStO7fNJjdl2odAD_VMkk",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBcDpZCO4PGOLyYfvgsI6_HVvFrUbUewnVqvuQYMKeVXpSKOZH6K9VMZyRDvy7U7xl5jddpT-Awoh_iYoqXfoRPWHlcDkuovMhiSGRa0VBd_x13jdk9fkVwuyvbNH9tTl_7elhWMYQRZaufLvEkxVgj6AAV51F7RMC82Sk_wysXIlPKEc7SDOrbsyRh6HYXrPcsy2pGgHsIgsQAsG9SU-crCOT3Jh4EWBeOnCOpUgBrU-iolM9gcWxrDPIh8ijhRlZuGVNFejLoELA",
    ],
  },
  formats: [
    { id: "physical", icon: "menu_book" },
    { id: "digital", icon: "cloud_download" },
    { id: "bundle", icon: "inventory_2" },
  ],
  colors: [
    { id: "blue", color: "bg-blue-500", name: "Blue" },
    { id: "red", color: "bg-red-500", name: "Red" },
    { id: "green", color: "bg-green-500", name: "Green" },
  ],
  description: `The Grade 5 Science Classroom Kit is designed to align seamlessly with Next Generation Science Standards (NGSS). This comprehensive package brings hands-on learning to your students, covering key concepts in matter, energy, and ecosystems.`,
  included: [
    "30 Student Lab Manuals (Physical & Digital Copy)",
    "Teacher's Guide with Lesson Plans & Answer Keys",
    "Chemicals & Safety Gear for 5 Core Experiments",
    "Interactive Digital Access Code (1 Year License)",
  ],
  specs: {
    gradeLevel: "Grade 5-6",
    subject: "Physical Science",
    language: "English",
    isbn: "978-3-16-148410-0",
    publicationDate: "August 2023",
  },
  trustSignals: [
    { icon: "verified_user", label: "trustSignals.secureTransaction" },
    { icon: "school", label: "trustSignals.educationVerified" },
    { icon: "local_shipping", label: "trustSignals.freeShipping" },
    { icon: "published_with_changes", label: "trustSignals.thirtyDayReturns" },
  ],
};

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function ProductDetailsPage() {
  const { t } = useTranslation("product");
  const [selectedFormat, setSelectedFormat] = useState("physical");
  const [selectedColor, setSelectedColor] = useState("blue");

  const product = SAMPLE_PRODUCT;

  const formatIcons = {
    physical: Package,
    digital: Download,
    bundle: PackageOpen,
  };

  const trustIcons = {
    verified_user: ShieldCheck,
    school: GraduationCap,
    local_shipping: Truck,
    published_with_changes: RefreshCw,
  };

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
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/market/science">{t("breadcrumbs.scienceKits")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Gallery (7 cols) */}
          <div className="lg:col-span-7">
            <ImageGallery images={product.images} badge={product.badge} />
          </div>

          {/* Right Column: Product Info (5 cols) */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 flex flex-col gap-6">
              <ProductInfo product={product} />

              {/* Variants */}
              <div className="flex flex-col gap-4">
                {/* Format Selection */}
                <div>
                  <span className="text-sm font-bold text-foreground block mb-3">
                    {t("variants.format")}
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {product.formats.map((format) => {
                      const FormatIcon = formatIcons[format.id] || Package;
                      return (
                        <label key={format.id} className="cursor-pointer">
                          <input
                            type="radio"
                            name="format"
                            value={format.id}
                            checked={selectedFormat === format.id}
                            onChange={(e) => setSelectedFormat(e.target.value)}
                            className="peer sr-only"
                          />
                          <div
                            className={`px-4 py-2 rounded-lg  transition-all text-sm font-bold flex items-center gap-2 ${
                              selectedFormat === format.id
                                ? "border-primary bg-primary text-white"
                                : "border-border hover:border-muted bg-card"
                            }`}
                          >
                            <FormatIcon className="h-[18px] w-[18px]" />
                            {t(`formats.${format.id}`)}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Kit Color/Theme */}
                <div>
                  <span className="text-sm font-bold text-foreground block mb-3">
                    {t("variants.kitAccentColor")}
                  </span>
                  <div className="flex items-center gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(color.id)}
                        className={`w-8 h-8 rounded-full ${color.color} ${
                          selectedColor === color.id
                            ? "ring-2 ring-offset-2 ring-offset-background"
                            : "hover:ring-2 hover:ring-offset-2 hover:ring-offset-background"
                        } transition-all`}
                        style={{
                          ringColor:
                            selectedColor === color.id
                              ? color.color
                              : undefined,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <ProductActions price={product.price} />

              {/* Trust Signals */}
              <div className="grid grid-cols-2 gap-y-3 py-4 border-t">
                {product.trustSignals.map((signal, index) => {
                  const Icon = trustIcons[signal.icon] || ShieldCheck;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <Icon className="h-[18px] w-[18px] text-primary" />
                      {t(signal.label)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <ProductTabs product={product} />
      </div>
    </div>
  );
}
