import { useMemo, useState } from "react";

type Args = {
  totalSteps: number;
  validateStep: (step: number) => string | null;
  setErrorMessage: (message: string | null) => void;
};

export function useCreateCampaignWizard({ totalSteps, validateStep, setErrorMessage }: Args) {
  const [currentStep, setCurrentStep] = useState(0);

  const goNextStep = () => {
    setErrorMessage(null);

    if (currentStep < totalSteps) {
      const stepError = validateStep(currentStep);
      if (stepError) {
        setErrorMessage(stepError);
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const goPreviousStep = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const isReviewStep = useMemo(() => currentStep === totalSteps, [currentStep, totalSteps]);

  return {
    currentStep,
    setCurrentStep,
    isReviewStep,
    goNextStep,
    goPreviousStep,
  };
}
