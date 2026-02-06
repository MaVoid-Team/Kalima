import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function StepIndicator({ steps, currentStep = 3 }) {
    const { t } = useTranslation('checkout');

    return (
        <div className="flex justify-center items-center py-6 bg-card gap-2" dir="ltr">
            {steps.map((step, index) => (
                <div key={step.number} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold
            ${step.number < currentStep ? 'bg-success text-success-foreground' :
                            step.number === currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                    >
                        {step.number < currentStep ? (
                            <Check className="w-4 h-4" />
                        ) : (
                            step.number
                        )}
                    </div>
                    <span className={`text-sm ${step.number <= currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {t(`steps.${step.label.toLowerCase()}`)}
                    </span>
                    {index < steps.length - 1 && (
                        <div className={`w-16 h-0.5 mx-2 ${step.number < currentStep ? 'bg-success' : 'bg-border'}`} />
                    )}
                </div>
            ))}
        </div>
    );
}
