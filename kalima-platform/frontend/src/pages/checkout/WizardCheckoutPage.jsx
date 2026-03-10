import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '@/components/ui/loading-spinner';
import EmptyCartState from '@/components/cart/EmptyCartState';
import WizardStepper from '@/components/checkout/WizardStepper';
import CartStep from '@/components/checkout/steps/CartStep';
import PaymentStep from '@/components/checkout/steps/PaymentStep';

export default function WizardCheckoutPage() {
    const { cart, loading } = useCart();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Default to step 1 (Cart) unless step=2 is in URL query
    const initialStep = parseInt(searchParams.get('step')) === 2 ? 2 : 1;
    const [currentStep, setCurrentStep] = useState(initialStep);

    // Sync step state with URL to allow back button
    useEffect(() => {
        if (currentStep === 1) {
            setSearchParams({});
        } else {
            setSearchParams({ step: 2 });
        }
        window.scrollTo(0, 0);
    }, [currentStep, setSearchParams]);

    // Handle initial param check, if step=2 but cart is empty
    useEffect(() => {
        if (currentStep === 2 && cart && cart.cart_items?.length === 0) {
            setCurrentStep(1);
        }
    }, [cart, currentStep]);

    // Empty Cart State - Only show if we're on step 1 or if we lose the cart (edge case).
    if (!cart || cart.cart_items?.length === 0) {
        if (currentStep === 2) {
            setCurrentStep(1);
        }
        return <EmptyCartState onBrowseProducts={() => navigate('/market')} />;
    }

    return (
        <div className="relative min-h-screen bg-gray-50/50 flex flex-col overflow-x-hidden">
            {loading && (
                <div className="absolute inset-0 z-20 bg-white/70 flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            )}

            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4">
                <WizardStepper currentStep={currentStep} />
            </div>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 overflow-x-hidden p-2">
                <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="w-full"
                        >
                            <CartStep onProceed={() => setCurrentStep(2)} />
                        </motion.div>
                    )}
                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="w-full"
                        >
                            <PaymentStep onBack={() => setCurrentStep(1)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
