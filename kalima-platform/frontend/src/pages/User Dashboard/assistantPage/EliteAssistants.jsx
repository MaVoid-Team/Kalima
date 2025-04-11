import { useTranslation } from 'react-i18next';

const EliteAssistants = () => {
  const { t, i18n } = useTranslation('assistantPage');
  const isRTL = i18n.language === 'ar';

  const assistants = [
    {
      image: "https://via.placeholder.com/300x300",
      name: t('assistants.0.name'),
      bio: t('assistants.0.bio'),
    },
    {
      image: "https://via.placeholder.com/300x300",
      name: t('assistants.1.name'),
      bio: t('assistants.1.bio'),
    },
    {
      image: "https://via.placeholder.com/300x300",
      name: t('assistants.2.name'),
      bio: t('assistants.2.bio'),
    },
    {
      image: "https://via.placeholder.com/300x300",
      name: t('assistants.3.name'),
      bio: t('assistants.3.bio'),
    },
    {
      image: "https://via.placeholder.com/300x300",
      name: t('assistants.4.name'),
      bio: t('assistants.4.bio'),
    },
    {
      image: "https://via.placeholder.com/300x300",
      name: t('assistants.5.name'),
      bio: t('assistants.5.bio'),
    },
  ];

  return (
    <div className="mb-12 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className={`flex items-center mb-8 ${isRTL ? 'justify-between' : 'justify-between'}`}>
        <h2 className="text-2xl font-bold">{t('eliteAssistants.title')}</h2>
        <button className="text-teal-600 hover:underline font-medium">{t('eliteAssistants.viewAll')}</button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assistants.map((assistant, index) => (
          <div key={index} className="bg-white shadow-md rounded-md p-6 text-center">
            <img
              src={assistant.image}
              alt={assistant.name}
              className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold mb-1">{assistant.name}</h3>
            <p className="text-gray-600 text-sm">{assistant.bio}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EliteAssistants;
