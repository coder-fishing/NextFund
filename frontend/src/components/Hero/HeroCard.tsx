import { AmountSelector } from './AmountSelector';
import { ProgressBar } from './ProgressBar';

export function HeroCard() {
	return (
		<div className="flex-1">
			<div className="mx-auto w-full max-w-md rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.9)] backdrop-blur">
				<div className="mb-4 flex items-center justify-between gap-4">
					<div>
						<p className="text-xs font-medium uppercase tracking-wide text-slate-400">
							Raised so far
						</p>
						<p className="mt-1 text-2xl font-semibold text-slate-50">142.5 ETH</p>
					</div>
					<div className="rounded-2xl bg-slate-900/80 px-3 py-2 text-right">
						<p className="text-[10px] uppercase tracking-wide text-slate-500">Goal</p>
						<p className="text-sm font-semibold text-slate-100">200 ETH</p>
					</div>
				</div>

				<div className="mb-2">
					<ProgressBar value={71} />
					<div className="mt-2 flex items-center justify-between text-[11px] font-medium">
						<span className="text-emerald-300">71% FUNDED</span>
						<span className="text-slate-400">1,240 backers</span>
					</div>
				</div>

				<div className="mb-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-300">
					<p className="font-medium text-slate-100">PureStream: Water Access for Omo Valley</p>
					<p className="mt-1 text-[11px] text-slate-400">
						Xây dựng hệ thống lọc nước bền vững cho các cộng đồng khó khăn,
						mỗi giao dịch đều được ghi lại trên blockchain.
					</p>
				</div>

				<AmountSelector />
			</div>
		</div>
	);
}

