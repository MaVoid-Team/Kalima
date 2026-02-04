import { Star, BadgeCheck } from "lucide-react";

const HERO_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDlw9H7wQQUgA8DXqQtNFrwnGBPuTz-1Ewo7aWF0iVtFBNSyYB4kPfW5AfmgGgfdvG2j3MW0DJEWoE5EVU1Q3ZStDaOa7DIhXqlAJY32DP1CL54HpLPsFd7ZFHnnrh6cdfPEtx2fC4tH3W-fefuLxrmJoztJSeHJXOst4PkCuTkUxnCFBDhHGqg2emL3ljLvpxU4GYNoFH-XoFuU3zgvrURKhNq7EK8Lqu5wPFFicjeTgWhdeAWtikKY1p4MsASZ9otVYaimDvQQVM";

const AVATAR_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBn8I_oKLn-hvwTs-Tu5VY0mHK3boizTbH0rbXrAHNxubk_3zTzz1wQnaLPPiJ0B5JKY9Em0YG3TdffbtbR37kCfQBQREfKE0ILFW3eG1lV0XhNAnWk-NEm-MJMNgK5ZmQvL2lsmvFNyjCwPW197ainYNLai3UDnGfhC377DqYOotNctqDhNhrEEZhpjigxFawGP8fLk8gvFI6rhD2_SOpSWtSisrv-UPc4ckNDiq2UPEchSsfMAtg2RahKx0Windd9ksZETyJ1lfo",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA9IFQlupIKpI0sdhqnpE39-Y77kMrwK5IW40_MftVPHc07yHYAyHrQ1NIRI-uhDnvkP3l1RGopWzYN0hVI_k8YqDmrHpw_ypKgRdqwDwxx7KvMjCg8QpqrwQyQWX5uKdXCCgJc6YwctsWopLosQ4ojQ3j9VsTgjXNSzSMKuVv0DVNyxdlmww9OH7UA9Bj29X15afqpw2kHDcDIiiFxPhVMCXvfd3csg_kKv0SDGy8AGstGNQ9Mmy4g3fhD5Wo5Zwhk78KfaQA-CCw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBlrdZZV3Gwj47GxMKr1vAzyjHuiVYeaRkDLif1Vhdtp4mzxuVgZb-7HVLapiHDiSxHZ2BWVlqRpHnSwWzhH9TXi2GiE-8Rjwwyj1y_vKKbsYVQObJFQ0SJgY4E360BkqXbc5pgB_qW2TuUjwKmL9Nnlrkwan4p5owJaU9U65Sc2pJ1o1eq6xtH7Wcpi_HsFZSwATTKQBP_n0hiJkPxVdUhAdtteMNZMZzKS1aFEAnaQJD6fc5z6CRqXxRf7y9c5yObFlkNzE_Cqeg",
];

const WelcomeSection = () => {
  return (
    <section className="w-full bg-surface-gray py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Left Content */}
          <div className="flex flex-col justify-center space-y-8 animate-in slide-in-from-left duration-700">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-light px-4 py-1.5 text-xs font-bold text-brand uppercase tracking-widest w-fit">
                <BadgeCheck className="h-4 w-4" />
                PREMIUM RESOURCES
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-text-main sm:text-6xl xl:text-7xl leading-[1.05]">
                Elevate Your Classroom with Premium Teacher Resources
              </h1>
              <p className="max-w-[540px] text-text-sub text-lg leading-relaxed font-medium">
                Kalima Platform offers premium instructional booklets, lesson
                designs, and professional development tools trusted by educators
                worldwide.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-brand hover:bg-brand-dark px-10 py-4 text-base font-bold text-white transition-all cursor-pointer">
                Browse Booklets
              </button>
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-white hover:bg-gray-50 px-10 py-4 text-base font-bold text-text-main border border-gray-100 transition-all cursor-pointer">
                View Designs
              </button>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {AVATAR_IMAGES.map((url, index) => (
                  <div
                    key={index}
                    className="h-11 w-11 rounded-full border-[3px] border-white bg-cover bg-center"
                    style={{ backgroundImage: `url("${url}")` }}
                  />
                ))}
                <div className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white bg-gray-50 text-[10px] font-bold text-gray-600">
                  2k+
                </div>
              </div>
              <p className="text-sm text-text-sub font-semibold">
                Trusted by 2,000+ Educators
              </p>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative mx-auto w-full max-w-[600px] lg:max-w-none animate-in slide-in-from-right duration-700 delay-200">
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
              <div className="absolute -bottom-8 -left-8 z-20 flex flex-col gap-1 rounded-[2rem] bg-white px-8 py-5 shadow-[0_20px_50px_rgb(0,0,0,0.15)] md:bottom-12 md:-left-12">
                <div className="flex items-center gap-2.5">
                  <Star className="h-6 w-6 fill-star text-star" />
                  <span className="text-xl font-extrabold text-gray-900 tracking-tight">
                    4.9/5 Rating
                  </span>
                </div>
                <p className="text-[13px] font-medium text-gray-400 pl-0.5">
                  Based on verified teacher reviews
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
