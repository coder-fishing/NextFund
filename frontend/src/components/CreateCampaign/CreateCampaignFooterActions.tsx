import { PrimaryButton } from "@/components/Button/PrimaryButton";
import { SecondaryButton } from "@/components/Button/SecondaryButton";

type Props = {
  currentStep: number;
  reviewStep: number;
  submitting: boolean;
  uploadingImages: boolean;
  onBack: () => void;
  onContinue: () => void;
  onLaunchClick: () => void;
};

export function CreateCampaignFooterActions({
  currentStep,
  reviewStep,
  submitting,
  uploadingImages,
  onBack,
  onContinue,
  onLaunchClick,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-4">
      <SecondaryButton
        type="button"
        onClick={onBack}
        disabled={currentStep === 0 || submitting}
        className="h-12 min-w-24 rounded-xl"
      >
        Back
      </SecondaryButton>

      {currentStep < reviewStep ? (
        <PrimaryButton type="button" onClick={onContinue} className="h-12 min-w-40 rounded-full">
          Continue
        </PrimaryButton>
      ) : (
        <PrimaryButton
          type="submit"
          onClick={onLaunchClick}
          loading={submitting}
          className="h-12 min-w-52 rounded-full"
        >
          {uploadingImages ? "Uploading images..." : "Launch fundraiser"}
        </PrimaryButton>
      )}
    </div>
  );
}
