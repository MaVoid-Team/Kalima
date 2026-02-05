import { Star, BadgeCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";


const HERO_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDlw9H7wQQUgA8DXqQtNFrwnGBPuTz-1Ewo7aWF0iVtFBNSyYB4kPfW5AfmgGgfdvG2j3MW0DJEWoE5EVU1Q3ZStDaOa7DIhXqlAJY32DP1CL54HpLPsFd7ZFHnnrh6cdfPEtx2fC4tH3W-fefuLxrmJoztJSeHJXOst4PkCuTkUxnCFBDhHGqg2emL3ljLvpxU4GYNoFH-XoFuU3zgvrURKhNq7EK8Lqu5wPFFicjeTgWhdeAWtikKY1p4MsASZ9otVYaimDvQQVM";

const AVATAR_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBn8I_oKLn-hvwTs-Tu5VY0mHK3boizTbH0rbXrAHNxubk_3zTzz1wQnaLPPiJ0B5JKY9Em0YG3TdffbtbR37kCfQBQREfKE0ILFW3eG1lV0XhNAnWk-NEm-MJMNgK5ZmQvL2lsmvFNyjCwPW197ainYNLai3UDnGfhC377DqYOotNctqDhNhrEEZhpjigxFawGP8fLk8gvFI6rhD2_SOpSWtSisrv-UPc4ckNDiq2UPEchSsfMAtg2RahKx0Windd9ksZETyJ1lfo",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA9IFQlupIKpI0sdhqnpE39-Y77kMrwK5IW40_MftVPHc07yHYAyHrQ1NIRI-uhDnvkP3l1RGopWzYN0hVI_k8YqDmrHpw_ypKgRdqwDwxx7KvMjCg8QpqrwQyQWX5uKdXCCgJc6YwctsWopLosQ4ojQ3j9VsTgjXNSzSMKuVv0DVNyxdlmww9OH7UA9Bj29X15afqpw2kHDcDIiiFxPhVMCXvfd3csg_kKv0SDGy8AGstGNQ9Mmy4g3fhD5Wo5Zwhk78KfaQA-CCw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBlrdZZV3Gwj47GxMKr1vAzyjHuiVYeaRkDLif1Vhdtp4mzxuVgZb-7HVLapiHDiSxHZ2BWVlqRpHnSwWzhH9TXi2GiE-8Rjwwyj1y_vKKbsYVQObJFQ0SJgY4E360BkqXbc5pgB_qW2TuUjwKmL9Nnlrkwan4p5owJaU9U65Sc2pJ1o1eq6xtH7Wcpi_HsFZSwATTKQBP_n0hiJkPxVdUhAdtteMNZMZzKS1aFEAnaQJD6fc5z6CRqXxRf7y9c5yObFlkNzE_Cqeg",
];

export default function WelcomeSection() {
  const { t } = useTranslation("landing");

  return (
    <section className="w-full bg-background py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Content */}
          <div
            className={`flex flex-col justify-center space-y-8`}
          >
            <div className="space-y-6">
              <Badge
                variant="default"
                data-icon="inline-start"
              >
                <BadgeCheck className="h-4 w-4" />
                {t("welcome.badge")}
              </Badge>

              <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl xl:text-7xl leading-[1.05]">
                {t("welcome.title")}{" "}
                <span
                  className={`text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary`}
                >
                  {t("welcome.titleHighlight")}
                </span>{" "}
                {t("welcome.titleEnd")}
              </h1>

              <p className="max-w-[540px] text-muted-foreground leading-relaxed font-medium">
                {t("welcome.description")}
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder={t("welcome.searchPlaceholder")}
              />
              <Button
                size="lg"
                variant='default'
              >
                {t("welcome.searchButton")}
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button variant="default" className="w-fit">
                {t("welcome.browseCourses")}
              </Button>
              <Button
                variant="secondary"
                className="w-fit"
              >
                {t("welcome.teachers")}
              </Button>
            </div>

            {/* Trusted By */}
            <div className="flex items-center gap-4 pt-4">
              <AvatarGroup>
                {AVATAR_IMAGES.map((url, index) => (
                  <Avatar key={index} className="h-11 w-11">
                    <AvatarImage src={url} alt="User Avatar" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                ))}
                <AvatarGroupCount className="h-11 w-11 text-[10px] font-bold">
                  2k+
                </AvatarGroupCount>
              </AvatarGroup>
              <p className="text-sm text-muted-foreground font-semibold">
                {t("welcome.trustedBy")}
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="relative mx-auto w-full max-w-[600px] lg:max-w-none">
            <div className="relative h-[600px] w-full">
              <div
                className="h-full w-full rounded-[2.5rem] bg-cover bg-center transition-transform duration-700"
                style={{
                  backgroundImage: `url("${HERO_IMAGE_URL}")`,
                }}
              >
              </div>

              {/* Floating Badge */}
              <Card
                className={`absolute -bottom-8 z-20 flex flex-col gap-2 p-4`}
              >
                <div className="flex items-center gap-2.5">
                  <Star className="h-6 w-6 fill-secondary text-secondary" />
                  <span className="text-lg font-extrabold">
                    4.9/5 {t("welcome.rating")}
                  </span>
                </div>
                <p className="text-sm font-medium">
                  {t("welcome.ratingNote")}
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

