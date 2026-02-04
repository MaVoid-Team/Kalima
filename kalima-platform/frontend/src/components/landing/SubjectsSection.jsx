import { Calculator, Beaker, BookOpen, ArrowRight } from "lucide-react";

const SUBJECT_IMAGES = {
  MATH: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQzMawP68MyKT0LhbQ4g7XXZPnav777yaFwrF3kpywECR7wxUpfqWV6u_F5Nj110Xj6g0hHg6bA7hfXWkVmlbUiD2JE5lS8g6AoqUYmVF_2IUqd1X12AM4ZoPcj7rkQ2w2aQaC4lH0QiGtDlrUL_Nazy-UDUYGyaHWnmdNC1-wJ25QAUUH_necUPf2OMPdTpIDpExCU3iFAiHoxeGgj6jonrvSbjnWaLlE15y4mOn_F1MO9ABQMDWu-SJ_vpOb_3r03OgI8woahfU",
  SCIENCE:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD0Ta8lXSFDFASpLhdr9MjTZV_koRH2l0R1QKq_SGws7vy78c-PqzesNgvojMj9sbDGrmx1HiSIshHuqItUxI5LqO7YR7E7V5a2MlHH4mRuqVng6nDbVlRb4c0PQ8HNeY3kw4yIdaW5lLQ-cFVwVSQP1tKZyA1JRyVlhQBcJ9jSkCSQPKo5T2uKUYymkJdyaWdloiIBa_H1Z7UC6UNqqNDxMf3_Yrlys6NUnEyG-W3rin2HTkP6_crTUCt2lBw0f7tYVbnEjqYDJ6Q",
  LANGUAGE:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCUdj9Uc-lg2-EG7g0ChmoyJDPX551b-PQ7fDkKYT53siDF8obqNnWLL6FA11qsGbhcIMOczRVS8O_nDJDZ-WKY9TrUzt2MwIghW4dTLizXc22fNMhCm00jnKiEyYBDYPDaFABmqVglfYkSavRUxEM0OYw_xCxjRXWzVwDz-Oz-wXj-jyTnGbJbV-zcKwF6D9DikatTOul_AtuYJU_HTOt64wSBxFPFdm0__F--oe2HhJk2ffBZRzj-bPCj0FYc6vxEj2lz17Fjfnk",
};

const SUBJECTS = [
  {
    id: "math",
    title: "Mathematics",
    description:
      "Comprehensive problem sets, geometry guides, and algebra workbooks.",
    image: SUBJECT_IMAGES.MATH,
    icon: Calculator,
    iconColor: "text-brand",
    iconBg: "bg-brand-light",
  },
  {
    id: "science",
    title: "Science",
    description:
      "Interactive experiments, biology diagrams, and theory breakdowns.",
    image: SUBJECT_IMAGES.SCIENCE,
    icon: Beaker,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50",
  },
  {
    id: "language",
    title: "Language Arts",
    description:
      "Grammar worksheets, creative writing prompts, and poetry modules.",
    image: SUBJECT_IMAGES.LANGUAGE,
    icon: BookOpen,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-50",
  },
];

const SubjectsSection = () => {
  return (
    <section className="w-full bg-surface-gray py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-4xl font-extrabold tracking-tight text-text-main sm:text-5xl">
              Explore by Subject
            </h2>
            <p className="text-lg text-text-sub font-medium max-w-[600px]">
              Find specialized materials tailored to your subject's curriculum
              standards.
            </p>
          </div>
          <a
            href="#"
            className="group inline-flex items-center text-[15px] font-bold text-brand hover:text-brand-dark transition-colors"
          >
            View All Subjects
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((subject) => (
            <div
              key={subject.id}
              className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-white border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
            >
              {/* Image Half */}
              <div
                className="h-56 w-full bg-cover bg-center"
                style={{ backgroundImage: `url("${subject.image}")` }}
              />

              {/* Content Half */}
              <div className="flex flex-col p-8 pt-8">
                <div
                  className={`mb-6 flex h-12 w-12 items-center justify-center rounded-full ${subject.iconBg}`}
                >
                  <subject.icon
                    className={`h-6 w-6 ${subject.iconColor}`}
                    strokeWidth={2.5}
                  />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-text-main">
                  {subject.title}
                </h3>
                <p className="text-base font-medium text-text-sub leading-relaxed">
                  {subject.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SubjectsSection;
