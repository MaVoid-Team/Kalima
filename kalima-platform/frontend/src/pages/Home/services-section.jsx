import { useTranslation } from 'react-i18next';
import { Clock, FileText, Users, Award } from "lucide-react";
import ServiceCard from "../../components/ServiceCard";

export function ServicesSection() {
  const { t, i18n } = useTranslation("home");
  const isRTL = i18n.language === 'ar';
  const icons = [Clock, FileText, Users, Award];

  const services = t('services.items', { returnObjects: true });

  return (
    <section className="md:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl font-bold mb-2">
          {t('services.title')}
        </h2>
        <h3 className="text-center text-3xl font-bold mb-12">
          {t('services.heading')}
            <span className="text-primary border-b-4 border-primary pb-1">
              {t('services.withUs')}
            </span>
          
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={icons[index]}
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