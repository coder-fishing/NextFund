
import { PrimaryButton } from "../Button/PrimaryButton";
import { SecondaryButton } from "../Button/SecondaryButton";
import { ImageRound } from "./ImageRound";
import { heroItems } from "@/const/imageRound";


export function HeroSection() {
	return (
		<section className="relative overflow-hidden bg-white px-4 py-20 text-slate-900 height-full">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-emerald-100/80 blur-3xl" />
				<div className="absolute bottom-[-10rem] right-[-6rem] h-[420px] w-[420px] rounded-full bg-emerald-50 blur-3xl" />
				<div className="absolute inset-0 opacity-40" style={{
					backgroundImage:
						'radial-gradient(circle at top, rgba(16,185,129,0.15), transparent 55%), radial-gradient(circle at bottom, rgba(34,197,94,0.08), transparent 55%)',
				}} />

				{/* Image Round */}
				<div className="relative mt-10 mx-auto h-[420px] max-w-5xl ">
				{heroItems.map((item) => (
					<ImageRound
						key={item.title}
						src={item.src}
						alt={item.alt}
						title={item.title}
						percent={item.percent}
						positionX={item.positionX}
						positionY={item.positionY}
					/>
				))}
				</div>
			</div>

			<div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 text-center">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
					#1 Community-Driven Crowdfunding Platform
				</p>
				<p className="max-w-3xl text-balance text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
					Successful campaigns
					<br />
					start with <span className="text-shine font-bold">NextFund</span>
				</p>
				<p className="max-w-2xl text-sm text-slate-600 sm:text-base">
					Create your own campaign in minutes – with intuitive tools, guided content, and step-by-step instructions to tell a story that resonates with everyone.
				</p>
				<div className="flex flex-wrap items-center justify-center gap-4">
					<PrimaryButton>Start Your Campaign</PrimaryButton>
					<SecondaryButton>Explore Stories</SecondaryButton>
				</div>
				<p className="text-xs text-slate-500">
					Over <span className="font-semibold text-slate-700">50 billion VND</span> is donated annually through NextFund.
				</p>

				 
			</div>

         
		</section>
		);
}

export default HeroSection;

