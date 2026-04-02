interface ProgressBarProps {
	/** giá trị % từ 0 - 100 */
	value: number;
}

export function ProgressBar({ value }: ProgressBarProps) {
	const clamped = Math.max(0, Math.min(100, value));

	return (
		<div className="space-y-2">
			<div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5E5E5]">
				<div
					className="h-full rounded-full bg-gradient-to-r from-[#A9F56B] to-[#4B9E44]" 
					style={{ width: `${clamped}%` }}
				/>
			</div>
		</div>
	);
}

