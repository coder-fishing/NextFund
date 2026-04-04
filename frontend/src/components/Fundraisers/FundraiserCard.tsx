'use client';

import { ProgressBar } from "../Hero/ProgressBar";

type Props = {
    title: string;
    image: string;
    description?: string;
    goalAmount: number;
    currentAmount: number;
    time?: string;
    amountUnit?: string;
    variant?: 'large' | 'small';
}

export const FundraiserCard = ({
    title,
    image,
    description,
    goalAmount,
    currentAmount,
    time,
    amountUnit = '$',
    variant = 'small'
}: Props) => {
    const isLarge = variant === 'large';
    const progress =
        goalAmount > 0
            ? Math.min(100, Math.max(0, (currentAmount / goalAmount) * 100))
            : 0;

    return (
        <div className={`group cursor-pointer bg-[#F9FAFB] transition-shadow duration-200 overflow-hidden flex flex-col ${isLarge ? 'h-full' : ''}`}>
            {/* Image */}
            <div className={`relative overflow-hidden ${isLarge ? 'flex-1' : ''} rounded-xl`}>
                <img
                    src={image}
                    alt={title}
                    className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                        isLarge ? 'h-full' : 'h-[160px] sm:h-[180px]'
                    }`}
                />

                {time && (
                    <span className="absolute bottom-3 left-3 text-xs bg-black/60 text-white px-2 py-1 rounded-full">
                        {time}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="px-4 pb-4 pt-3">         
                <div className="flex flex-row justify-between ">
                    <p className={`font-semibold line-clamp-2 ${isLarge ? 'text-base sm:text-lg' : 'text-sm'}`}>
                    {title}
                    </p>

                    <div className={`font-semibold line-clamp-2 ${isLarge ? 'text-base sm:text-lg' : 'text-sm'}`}>
                        {progress.toFixed(0)} %
                    </div>
                </div>

                {description && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                        {description}
                    </p>
                )}

                {/* Progress */}
                <div className="mt-2">
                    <ProgressBar value={progress} />
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                    <span>
                        {amountUnit}{currentAmount.toLocaleString()} raised of {amountUnit}{goalAmount.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
};
