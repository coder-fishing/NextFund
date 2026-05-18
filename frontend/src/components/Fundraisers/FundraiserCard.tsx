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
        <div
            className={`
                group
                cursor-pointer
                overflow-hidden
                flex flex-col
                rounded-2xl
                transition-all
                duration-300

                bg-[#F9FAFB]
                dark:bg-[#252728]

                border
                border-transparent
                dark:border-zinc-800

                hover:shadow-md
                dark:hover:bg-zinc-800/80

                ${isLarge ? 'h-full' : ''}
            `}
        >
            {/* Image */}
            <div
                className={`
                    relative
                    overflow-hidden
                    rounded-xl

                    ${isLarge ? 'flex-1' : ''}
                `}
            >
                <img
                    src={image}
                    alt={title}

                    className={`
                        w-full
                        object-cover
                        transition-transform
                        duration-300
                        group-hover:scale-105

                        ${isLarge ? 'h-[160px] sm:h-[465px]' : 'h-[160px] sm:h-[180px]'}
                    `}
                />

                {time && (
                    <span
                        className="
                            absolute
                            bottom-3
                            left-3
                            text-xs
                            px-2
                            py-1
                            rounded-full

                            bg-black/60
                            text-white
                            backdrop-blur-sm
                        "
                    >
                        {time}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="px-4 pb-4 pt-3">
                <div className="flex flex-row justify-between gap-3">
                    <p
                        className={`
                            font-semibold
                            line-clamp-2

                            text-black
                            dark:text-white

                            ${isLarge ? 'text-base sm:text-lg' : 'text-sm'}
                        `}
                    >
                        {title}
                    </p>

                    <div
                        className={`
                            font-semibold
                            whitespace-nowrap

                            text-black
                            dark:text-zinc-100

                            ${isLarge ? 'text-base sm:text-lg' : 'text-sm'}
                        `}
                    >
                        {progress.toFixed(0)} %
                    </div>
                </div>

                {description && (
                    <p
                        className="
                            mt-2
                            line-clamp-2
                            text-sm

                            text-gray-600
                            dark:text-zinc-400
                        "
                    >
                        {description}
                    </p>
                )}

                {/* Progress */}
                <div className="mt-3">
                    <ProgressBar value={progress} />
                </div>

                <div
                    className="
                        mt-2
                        flex
                        items-center
                        justify-between
                        text-xs

                        text-gray-600
                        dark:text-zinc-400
                    "
                >
                    <span>
                        {amountUnit}
                        {currentAmount.toLocaleString()} raised of{' '}
                        {amountUnit}
                        {goalAmount.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
};