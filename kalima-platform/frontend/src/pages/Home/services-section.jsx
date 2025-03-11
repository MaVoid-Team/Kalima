import { Clock, FileText, Users, Award } from "lucide-react"

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
  ]

  return (
    <section className="p-8">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl font-bold mb-2">خدماتنا</h2>
        <h3 className="text-center text-3xl font-bold mb-12">
          هدفنا هو تبسيط المواد لضمان
          <br />
          تفوقك <span className="text-primary border-b-2 border-primary pb-1">مجانـــا</span>
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
  )
}

function ServiceCard({ icon: Icon, title, subtitle, description }) {
  return (
    <div className="text-center hover:scale-105 hover:shadow-xl shadow-lg duration-500">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-base-200">
          <Icon className="h-8 w-8 text-primary hover:animate-spin" />
        </div>
      </div>
      <h4 className="font-bold mb-2 text-lg">{title}</h4>
      <br></br>
      <h5 className="text-primary font-medium mb-2 text-lg">{subtitle}</h5>
      <br></br>
      <p className="text-lg text-base-content/70">{description}</p>
      <br></br>
      <div className="border-b-4 border-primary"></div>
    </div>
  )
}

