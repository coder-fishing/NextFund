type StepGuideProps = {
    step: number;
    title: string;
    description: string;
    isActive?: boolean;
    onClick?: () => void;
};

export const StepGuide: React.FC<StepGuideProps> = ({ step, title, description, isActive = false, onClick }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full gap-4 rounded-xl p-3 text-left transition-colors sm:p-4 ${
                isActive ? "bg-gray-100" : "hover:bg-gray-50"
            }`}
        >
            <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
                    isActive
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 bg-white text-gray-800"
                }`}
            >
                {step}
            </div>
            <div>
                <h3 className="text-base font-semibold text-gray-800 sm:text-lg">{title}</h3>
                <p className="mt-2 text-sm text-gray-600 sm:text-base">{description}</p>
            </div>
        </button>
    );
};
