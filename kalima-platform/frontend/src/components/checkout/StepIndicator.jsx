import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function StepIndicator({ steps, currentStep = 3 }) {
    const { t } = useTranslation('checkout');

    return (
        <div className="flex justify-center items-center py-6 gap-2" dir="ltr">
            {steps.map((step, index) => {
                const isCompleted = step.number < currentStep;
                const isCurrent = step.number === currentStep;

                return (
                    <div key={step.number} className="flex items-center gap-2">
                        <div className="relative flex items-center justify-center">
                            <Badge
                                variant={isCompleted || isCurrent ? "default" : "secondary"}
                                className={`w-6 h-6 rounded-full p-0 flex items-center justify-center ${isCompleted ? 'bg-success hover:bg-success/90' : ''
                                    }`}
                            >
                                {isCompleted ? <Check className="w-3 h-3 text-white" /> : step.number}
                            </Badge>
                        </div>
                        <span className={`text-sm ${isCompleted || isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                            {t(`steps.${step.label.toLowerCase()}`)}
                        </span>
                        {index < steps.length - 1 && (
                            <Separator
                                orientation="horizontal"
                                className={`w-16 h-0.5 mx-2 ${isCompleted ? 'bg-success' : ''}`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
