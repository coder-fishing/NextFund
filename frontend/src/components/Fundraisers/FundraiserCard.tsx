'use client';

import { ProgressBar } from "../Hero/ProgressBar";

type Props = {
    title: string;
    image: string;
    goalAmount: number;
    currentAmount: number;
    time?: string;
    variant?: 'large' | 'small';
}

export const FundraiserCard = ({ title, image, goalAmount, currentAmount, time, variant = 'small' }: Props) => {
    const isLarge = variant === 'large';
    const progress = (currentAmount / goalAmount) * 100;

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

                {/* Progress */}
                <div className="mt-2">
                    <ProgressBar value={(currentAmount / goalAmount) * 100} />
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                    <span>
                        ${currentAmount.toLocaleString()} raised of ${goalAmount.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
};
