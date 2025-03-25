import { Clock, FileText, Users, Award } from "lucide-react";
import ServiceCard from "../../components/ServiceCard";

export function ServicesSection() {
  const services = [
    {
      icon: Clock,
      title: "متابعة الأداء",
      subtitle: "في أي وقت",
      description:
        "نقدم متابعة مستمرة لأداء الطلاب من خلال تقارير دورية توضح مستوى التقدم والنقاط التي تحتاج إلى تحسين",
    },
    {
      icon: FileText,
      title: "اختبارات ثابتة",
      subtitle: "في منصتنا",
      description: "نقدم اختبارات متنوعة لقياس مستوى الطلاب في كل مادة مع تصحيح فوري وشرح للإجابات الصحيحة",
    },
    {
      icon: Users,
      title: "معلمين على",
      subtitle: "أعلى مستوى",
      description: "نقدم فريق من المعلمين المتميزين ذوي الخبرة في شرح المناهج الدراسية بطريقة مبسطة وممتعة",
    },
    {
      icon: Award,
      title: "توفير كورسات",
      subtitle: "عالية الجودة",
      description:
        "نقدم كورسات تعليمية متكاملة تغطي جميع أجزاء المنهج مع شرح مفصل للمفاهيم الأساسية والتطبيقات العملية",
    },
  ];

  return (
    <section className="md:p-8">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl font-bold mb-2">خدماتنا</h2>
        <h3 className="text-center text-3xl font-bold mb-12">
          هدفنا هو تبسيط المواد لضمان
          <br />
          تفوقك <span className="text-primary border-b-4 border-primary pb-1">معانا</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              subtitle={service.subtitle}
              description={service.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

