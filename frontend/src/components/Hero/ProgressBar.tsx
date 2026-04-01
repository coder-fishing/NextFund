interface ProgressBarProps {
	/** giá trị % từ 0 - 100 */
	value: number;
}

export function ProgressBar({ value }: ProgressBarProps) {
	const clamped = Math.max(0, Math.min(100, value));

	return (
		<div className="space-y-2">
			<div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
				<div
					className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-blue-500"
					style={{ width: `${clamped}%` }}
				/>
			</div>
		</div>
	);
}

