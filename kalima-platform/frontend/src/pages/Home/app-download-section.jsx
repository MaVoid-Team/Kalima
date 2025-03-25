export function AppDownloadSection() {
  return (
    <section className="border-primary border-2 rounded-full md:w-3/4 w-full mx-auto md:p-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
          {/* Image on the left */}
          <div className="flex justify-center md:order-1">
            <div className="relative">
              <img src="/qr-code.png" alt="Mobile App" className="h-80 object-contain hover:scale-125 transition-all duration-500" />
              <div className="absolute -top-4 -right-4 w-12 h-12 border-2 border-dashed border-primary rounded-full"></div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 border-2 border-dashed border-primary rounded-full"></div>
            </div>
          </div>
          
          {/* Text on the right */}
          <div className="text-right order-1 md:order-2">
            <h2 className="text-4xl font-bold mb-4">
              نزل تطبيقنا <span className="text-primary">دلوقتـــي</span>
            </h2>
            <br />
            <p className="mb-6 text-base-content/80 text-2xl">
              افضل تطبيق مجاني ونزل تطبيقنا دلوقتي على موبايلك
              <br />
              علشان تقدر تتعلم في <span className="text-primary">كل مكان</span>
            </p>
          </div>
        </div>
      </div>
      {/* Curved arrow */}
      <div className="relative h-24 w-24 ml-auto mt-4 animate-pulse">
        <img src="curved-arrow-services.png" alt="curved-arrow" className="translate-y-32 -translate-x-1/2" />
      </div>
    </section>
  )
}