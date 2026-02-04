import { Star } from "lucide-react";

const BOOKLET_IMAGES = {
  CALCULUS:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBU3631m9CH40eCOA5z6lAzTbZQq3zKWbewDlzobKgCkvitZYeyoXH9pxyOaV62Ozb31CcMfIuPbRJj1tFAI9Imq2Y9YGXSdjrV4eKtp8OrNsdNahXDlPnwoBnmjwHdpcLApdkinLngXJoQd5Q2JJMtYcGbEL86uO2JQBnTQeqetJiflGRgNDnUQwU2lfEiwZ87-uafN6ZsQc0mWVwHcqC4dWD5Fc__DnfGVNiHOSpn3CTk-sydWSk1l6vGF025CnnDhUSqsSqRWv8",
  PHYSICS:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCLUfOnHbk19VX8MKPpas5g2q4WPSSCfYqELOKTmEjMpYael6wzVq0-3GDf-smeR0TjKuVPaW86KeyxRNcv4ffKMpSkMsJ27hIZ7vPPsS48agrAiOjVRjNm012Wtr5axnEnJETzWw-OwfXZHsIfqNuJnJ7kiR8Lg9GtXVFSAQstYXZODzyZb9kQCyFTR9DTEgzUvuazKDPdhkza7oWAXdLqqTmwKtiIVjHOScv5GS2nFiTe9bOJSRXzozDMYWTBAxW1gihepE-nnrY",
  WRITING:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDRk8gkShnAD-jEywMj6SrZ4Dld6aFVWkYnz4G9Iq6t_f27p1a9eFOhSrjWptZ0U-zpIXq_d64v67nza86yClz_8YV1BqvpHBCoPurUSXpdApWeQRpYZKOFGcEM03ZnJ9xVEr7Z5DilwUvNjXhUvskkBdLvrLBE_smF6Rag4b9sksrkYlId4ztrheuw4liL8tBwwJm6S0XBEyQBkkmh_7QxBkFDgPuejK8YBuKlHNSpCSclMA52RVmjt5lJ9iwsIs1bfiz3uK5htpQ",
  ART: "https://lh3.googleusercontent.com/aida-public/AB6AXuDrAz_5catOtK1BuN2j8RHtyPphT2qrxojSqbv0RkmA9cXXuaL9vhgKRvBhfrTS3cBqLpbICuH_jOKzIGM7xzUUtCXm1LYoc_a3iflNQVQkg1qOBp_83Xvkb2fNsSrnvE6tmvYDpvdAZKz8SSCWyDk1EF2Glsby11XRKMG-p-j24DzntLSR-7ySPNMKAxHpvV6MOghG9HuGbLEENR2orrGfcJUlw2gK2LT9rSz78Ns6oxhcErAiA5shsEVk7GptiCS1EKzanTWYGMo",
};

const FEATURED_ITEMS = [
  {
    id: 1,
    title: "Calculus Made Easy",
    grade: "Grade 5-6",
    price: "$12.99",
    rating: 4.5,
    reviews: 45,
    image: BOOKLET_IMAGES.CALCULUS,
  },
  {
    id: 2,
    title: "Advanced Physics",
    grade: "Grade 9-12",
    price: "$18.50",
    rating: 4.8,
    reviews: 128,
    image: BOOKLET_IMAGES.PHYSICS,
  },
  {
    id: 3,
    title: "Writing Adventures",
    grade: "Grade 3-5",
    price: "$9.99",
    rating: 4.7,
    reviews: 32,
    image: BOOKLET_IMAGES.WRITING,
  },
  {
    id: 4,
    title: "Visual Art History",
    grade: "All Ages",
    price: "$15.00",
    rating: 4.9,
    reviews: 210,
    image: BOOKLET_IMAGES.ART,
  },
];

const FeaturedBooklets = () => {
  return (
    <section className="w-full bg-surface-gray py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-12 space-y-4">
          <h2 className="text-4xl font-extrabold tracking-tight text-text-main sm:text-5xl">
            Featured Booklets
          </h2>
          <p className="text-lg text-text-sub font-medium">
            Hand-picked premium resources getting top reviews this month.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_ITEMS.map((item) => (
            <div key={item.id} className="group flex flex-col gap-4">
              {/* Image Container */}
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                <div
                  className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url("${item.image}")` }}
                />
                <div className="absolute right-4 top-4 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-text-main shadow-md">
                  {item.grade}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-1 px-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-text-main line-clamp-1">
                    {item.title}
                  </h3>
                  <span className="text-lg font-bold text-brand">
                    {item.price}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex text-star">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(item.rating) ? "fill-current" : "text-gray-200 fill-gray-200"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-400">
                    ({item.reviews})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedBooklets;
