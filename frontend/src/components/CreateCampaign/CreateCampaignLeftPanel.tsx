import { stepContent } from "@/const/stepContent";

type Props = {
  currentStep: number;
  isReviewStep: boolean;
};

export function CreateCampaignLeftPanel({ currentStep, isReviewStep }: Props) {
  const leftPanelData = stepContent[Math.min(currentStep, stepContent.length - 1)];

  return (
    <section className="h-full border-r border-slate-200 bg-[#efefef] px-8 py-8 sm:px-12 lg:px-14">
      <div className="mt-20 max-w-sm space-y-5">
        {!isReviewStep ? (
          <>
            <p className="text-3xl text-slate-700">{leftPanelData.heading}</p>
            <h1 className="text-5xl font-semibold leading-tight tracking-tight text-slate-900">
              {leftPanelData.title}
            </h1>
            <p className="text-lg leading-relaxed text-slate-700">{leftPanelData.description}</p>
          </>
        ) : (
          <>
            <h1 className="text-5xl font-semibold leading-tight tracking-tight text-slate-900">
              Review your fundraiser
            </h1>
            <p className="text-lg leading-relaxed text-slate-700">
              Check all details before launching your campaign.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
