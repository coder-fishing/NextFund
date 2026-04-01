'use client';

import { useState } from 'react';

const PRESET_AMOUNTS = [0.05, 0.1, 0.5];

interface AmountSelectorProps {
	currency?: string;
}

export function AmountSelector({ currency = 'ETH' }: AmountSelectorProps) {
	const [selectedAmount, setSelectedAmount] = useState<number | null>(PRESET_AMOUNTS[1]);
	const [customAmount, setCustomAmount] = useState('');

	const handleCustomChange = (value: string) => {
		setCustomAmount(value);
		setSelectedAmount(null);
	};

	const displayAmount = selectedAmount ?? (customAmount ? Number(customAmount) : null);

	return (
		<div className="space-y-5">
			<div className="flex items-center justify-between text-xs font-medium text-slate-300">
				<span>SELECT AMOUNT</span>
				{displayAmount && !Number.isNaN(displayAmount) && (
					<span className="text-emerald-400">
						{displayAmount.toLocaleString('en-US', {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}{' '}
						{currency}
					</span>
				)}
			</div>

			<div className="grid grid-cols-3 gap-3">
				{PRESET_AMOUNTS.map((amount) => {
					const isActive = selectedAmount === amount;
					return (
						<button
							key={amount}
							type="button"
							onClick={() => {
								setSelectedAmount(amount);
								setCustomAmount('');
							}}
							className={`rounded-xl border text-sm font-semibold py-2.5 transition-all ${
								isActive
									? 'border-emerald-400 bg-emerald-500/10 text-emerald-100 shadow-[0_0_0_1px_rgba(16,185,129,0.4)]'
									: 'border-slate-700 bg-slate-900/40 text-slate-200 hover:border-slate-500 hover:bg-slate-800/70'
							}`}
						>
							{amount} {currency}
						</button>
					);
				})}

				<div className="col-span-3 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2.5">
					<input
						type="number"
						min="0"
						step="0.01"
						value={customAmount}
						onChange={(e) => handleCustomChange(e.target.value)}
						placeholder="Custom amount"
						className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
					/>
					<span className="text-xs font-medium text-slate-400">{currency}</span>
				</div>
			</div>

			<button
				type="button"
				className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/40 hover:from-sky-300 hover:via-blue-400 hover:to-indigo-400 transition-all"
			>
				<span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-lg">💧</span>
				Donate Now
			</button>

			<p className="flex items-center gap-2 text-[11px] text-slate-400">
				<span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] text-emerald-400">
					✓
				</span>
				Transactions secured by Ethereum smart contract.
			</p>
		</div>
	);
}

