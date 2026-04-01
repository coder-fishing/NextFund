import { HeroContent } from '../Hero/HeroContent';
import { HeroCard } from '../Hero/HeroCard';

export function ETHSection() {
	return (
		<section className="relative overflow-hidden bg-slate-950 px-4 py-16 text-slate-50">
			<div className="pointer-events-none absolute inset-0 opacity-60">
				<div className="absolute -left-40 top-0 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
				<div className="absolute bottom-[-8rem] right-[-6rem] h-96 w-96 rounded-full bg-sky-500/25 blur-3xl" />
			</div>

			<div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 md:flex-row md:items-stretch">
				<HeroContent />
				<HeroCard />
			</div>
		</section>
	);
}

export default ETHSection;
