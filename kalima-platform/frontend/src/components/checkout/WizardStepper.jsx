import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, CreditCard } from 'lucide-react';

export default function WizardStepper({ currentStep }) {
    const { t } = useTranslation('checkout');

    const steps = [
        { id: 1, label: t('wizard.cart', 'Cart'), icon: ShoppingCart },
        { id: 2, label: t('wizard.payment', 'Payment'), icon: CreditCard },
    ];

    return (
        <div className="w-full py-6 flex items-center justify-center bg-transparent mt-4 mb-8">
            <div className="flex items-center justify-center gap-0 w-full max-w-lg px-4 relative">
                {steps.map((step, index) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;
                    const Icon = step.icon;

                    return (
                        <React.Fragment key={step.id}>
                            {/* Step Marker */}
                            <div className={`relative z-10 flex flex-col items-center gap-2 transition-colors duration-300 ${isActive ? 'text-primary' : isCompleted ? 'text-primary' : 'text-gray-400'}`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive ? 'border-primary bg-primary/10 scale-110 shadow-sm' : isCompleted ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-gray-50'}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className={`absolute -bottom-7 w-24 text-center text-sm font-semibold tracking-wide ${isActive || isCompleted ? 'opacity-100' : 'opacity-70'}`}>
                                    {step.label}
                                </span>
                            </div>

                            {/* Line connector */}
                            {index < steps.length - 1 && (
                                <div className="flex-1 h-1 bg-gray-200 relative overflow-hidden mx-4 rounded" style={{ top: '-14px' }}>
                                    {isCompleted && (
                                        <div className="absolute top-0 left-0 h-full bg-primary w-full animate-in slide-in-from-left duration-500" />
                                    )}
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
