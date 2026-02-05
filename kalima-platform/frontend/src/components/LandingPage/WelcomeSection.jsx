import {
  Star,
  BadgeCheck,
  Users,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const HERO_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDlw9H7wQQUgA8DXqQtNFrwnGBPuTz-1Ewo7aWF0iVtFBNSyYB4kPfW5AfmgGgfdvG2j3MW0DJEWoE5EVU1Q3ZStDaOa7DIhXqlAJY32DP1CL54HpLPsFd7ZFHnnrh6cdfPEtx2fC4tH3W-fefuLxrmJoztJSeHJXOst4PkCuTkUxnCFBDhHGqg2emL3ljLvpxU4GYNoFH-XoFuU3zgvrURKhNq7EK8Lqu5wPFFicjeTgWhdeAWtikKY1p4MsASZ9otVYaimDvQQVM";

const AVATAR_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBn8I_oKLn-hvwTs-Tu5VY0mHK3boizTbH0rbXrAHNxubk_3zTzz1wQnaLPPiJ0B5JKY9Em0YG3TdffbtbR37kCfQBQREfKE0ILFW3eG1lV0XhNAnWk-NEm-MJMNgK5ZmQvL2lsmvFNyjCwPW197ainYNLai3UDnGfhC377DqYOotNctqDhNhrEEZhpjigxFawGP8fLk8gvFI6rhD2_SOpSWtSisrv-UPc4ckNDiq2UPEchSsfMAtg2RahKx0Windd9ksZETyJ1lfo",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA9IFQlupIKpI0sdhqnpE39-Y77kMrwK5IW40_MftVPHc07yHYAyHrQ1NIRI-uhDnvkP3l1RGopWzYN0hVI_k8YqDmrHpw_ypKgRdqwDwxx7KvMjCg8QpqrwQyQWX5uKdXCCgJc6YwctsWopLosQ4ojQ3j9VsTgjXNSzSMKuVv0DVNyxdlmww9OH7UA9Bj29X15afqpw2kHDcDIiiFxPhVMCXvfd3csg_kKv0SDGy8AGstGNQ9Mmy4g3fhD5Wo5Zwhk78KfaQA-CCw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBlrdZZV3Gwj47GxMKr1vAzyjHuiVYeaRkDLif1Vhdtp4mzxuVgZb-7HVLapiHDiSxHZ2BWVlqRpHnSwWzhH9TXi2GiE-8Rjwwyj1y_vKKbsYVQObJFQ0SJgY4E360BkqXbc5pgB_qW2TuUjwKmL9Nnlrkwan4p5owJaU9U65Sc2pJ1o1eq6xtH7Wcpi_HsFZSwATTKQBP_n0hiJkPxVdUhAdtteMNZMZzKS1aFEAnaQJD6fc5z6CRqXxRf7y9c5yObFlkNzE_Cqeg",
];

const WelcomeSection = () => {
  const { t, i18n } = useTranslation("landing");
  const isRTL = i18n.language === "ar";

  const stats = [
    {
      value: "5,200",
      label: t("welcome.stats.students"),
      icon: Users,
      color: "text-brand",
    },
    {
      value: "150",
      label: t("welcome.stats.teachers"),
      icon: GraduationCap,
      color: "text-purple-600",
    },
    {
      value: "500",
      label: t("welcome.stats.courses"),
      icon: BookOpen,
      color: "text-orange-600",
    },
  ];

  return (
    <section className="w-full bg-surface-gray py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8" dir={isRTL ? "rtl" : "ltr"}>
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Content */}
          <div className={`flex flex-col justify-center space-y-8 ${isRTL ? "text-right" : "text-left"}`}>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-light px-4 py-1.5 text-xs font-bold text-brand uppercase tracking-widest w-fit">
                <BadgeCheck className="h-4 w-4" />
                {t("welcome.badge")}
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-text-main sm:text-6xl xl:text-7xl leading-[1.05]">
                {t("welcome.title")}{" "}
                <span className={`text-transparent bg-clip-text ${isRTL ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-brand via-brand-dark to-orange-500`}>
                  {t("welcome.titleHighlight")}
                </span>{" "}
                {t("welcome.titleEnd")}
              </h1>
              <p className="max-w-[540px] text-text-sub text-lg leading-relaxed font-medium">
                {t("welcome.description")}
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder={t("welcome.searchPlaceholder")}
                className={`w-full h-14 bg-white border-2 border-gray-100 rounded-full shadow-sm focus:outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all text-base ${isRTL ? "pr-6 pl-28 text-right" : "pl-6 pr-28"}`}
              />
              <button
                className={`absolute top-1.5 bottom-1.5 px-6 bg-brand hover:bg-brand-dark text-white font-bold rounded-full shadow-lg transition-all cursor-pointer ${isRTL ? "left-1.5" : "right-1.5"}`}
              >
                {t("welcome.searchButton")}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-brand hover:bg-brand-dark px-10 py-4 text-base font-bold text-white transition-all cursor-pointer">
                {t("welcome.browseCourses")}
              </button>
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-white hover:bg-gray-50 px-10 py-4 text-base font-bold text-text-main border border-gray-100 transition-all cursor-pointer">
                {t("welcome.teachers")}
              </button>
            </div>

            {/* Trusted By */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex">
                {AVATAR_IMAGES.map((url, index) => (
                  <div
                    key={index}
                    className={`h-11 w-11 rounded-full border-[3px] border-white bg-cover bg-center ${index > 0 ? "-ms-3" : ""}`}
                    style={{ backgroundImage: `url("${url}")` }}
                  />
                ))}
                <div className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white bg-gray-50 text-[10px] font-bold text-gray-600 -ms-3">
                  2k+
                </div>
              </div>
              <p className="text-sm text-text-sub font-semibold">
                {t("welcome.trustedBy")}
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="relative mx-auto w-full max-w-[600px] lg:max-w-none">
            <div className="relative h-[600px] w-full">
              <div
                className="h-full w-full rounded-[2.5rem] bg-cover bg-center shadow-2xl transition-transform duration-700 hover:scale-[1.02]"
                style={{
                  backgroundImage: `url("${HERO_IMAGE_URL}")`,
                }}
              >
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-t from-black/10 to-transparent" />
              </div>

              {/* Floating Badge */}
              <div
                className={`absolute -bottom-8 z-20 flex flex-col gap-1 rounded-[2rem] bg-white px-8 py-5 shadow-[0_20px_50px_rgb(0,0,0,0.15)] md:bottom-12 ${isRTL ? "-right-8 md:-right-12 text-right" : "-left-8 md:-left-12"}`}
              >
                <div className="flex items-center gap-2.5">
                  <Star className="h-6 w-6 fill-star text-star" />
                  <span className="text-xl font-extrabold text-gray-900 tracking-tight">
                    4.9/5 {t("welcome.rating")}
                  </span>
                </div>
                <p className="text-[13px] font-medium text-gray-400">
                  {t("welcome.ratingNote")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
