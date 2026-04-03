"use client";

import Image from "next/image";
import Link from "next/link";

type TopicVariant = "hero" | "small";

type TopicCardProps = {
	title: string;
	description?: string;
	label?: string;
	imageSrc: string;
	variant?: TopicVariant;
};

const TopicBadge = ({ label }: { label?: string }) => {
	if (!label) return null;

	return (
		<span className="inline-flex items-center rounded-full bg-[#F3E8FF] px-3 py-1 text-xs font-semibold text-[#6B21A8]">
			{label}
		</span>
	);
};

export const TopicCard = ({
	title,
	description,
	label,
	imageSrc,
	variant = "small",
}: TopicCardProps) => {
	if (variant === "hero") {
		return (
			<article className="overflow-hidden rounded-lg bg-white shadow-sm flex flex-col md:flex-row">
				{/* Ảnh bên trái */}
				<div className="relative w-full md:w-1/2 h-[240px] md:h-[320px] bg-[#DCFCE7] rounded-lg overflow-hidden">
					<Image
						src={imageSrc}
						alt={title}
						fill
						className="object-cover"
					/>
					{label && (
						<span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#6B21A8] shadow-sm">
							{label}
						</span>
					)}
				</div>

				{/* Chữ bên phải */}
				<div className="flex-1 px-6 py-6 sm:px-10 sm:py-10 flex flex-col justify-center space-y-4">
					<h3 className="text-2xl sm:text-3xl font-semibold text-gray-900">
						{title}
					</h3>
					{description && (
						<p className="text-sm sm:text-base text-gray-600 max-w-xl">
							{description}
						</p>
					)}
					<Link
							href="/campaigns"
							className="inline-flex items-center text-sm font-semibold text-gray-900 hover:text-gray-700"
						>
							Learn more
							<span className="ml-1">›</span>
						</Link>
				</div>
			</article>
		);
	}

	return (
		<article className="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md flex flex-col">
			<div className="relative overflow-hidden bg-[#DCFCE7] aspect-[16/9]">
				<Image
					src={imageSrc}
					alt={title}
					fill
					className="object-cover transition-transform duration-300 group-hover:scale-105"
					// sizes="(min-width: 1024px) 320px, 100vw"
				/>
				{label && (
					<span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#6B21A8] shadow-sm">
						{label}
					</span>
				)}
			</div>

			<div className="p-4 flex-1 flex items-end">
				<h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2">
					{title}
				</h3>
			</div>
		</article>
	);
};
