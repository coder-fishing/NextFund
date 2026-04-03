import { useEffect, useRef, useState } from "react";

type InfoBlockProps = {
	eyebrow?: string;
	title: string;
	body: string;
	emphasis?: string;
	variant?: "light" | "dark";
};

export const InfoBlock = ({ eyebrow, title, body, emphasis, variant = "light" }: InfoBlockProps) => {
	const ref = useRef<HTMLDivElement | null>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setVisible(true);
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.2 }
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	const isDark = variant === "dark";

	return (
		<section
			ref={ref}
			className={`w-full py-16 md:py-20 transition-all duration-700 ease-out transform ${
				visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
			} ${isDark ? "bg-[#022C22] text-white" : "bg-[#F3FFE7] text-[#022C22]"}`}
		>
			<div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
				<div className="space-y-6 md:space-y-8">
					{eyebrow && (
						<p className={`text-sm md:text-base font-semibold ${isDark ? "text-white" : "text-[#022C22]"}`}>
							{eyebrow}
						</p>
					)}

					<h2 className="text-2xl md:text-4xl lg:text-[40px] font-semibold leading-tight md:leading-snug tracking-tight">
						{title.split("NextFund").map((part, index, arr) => (
							<span key={index}>
								{part}
								{index < arr.length - 1 && (
									<span className="text-[#00B37E]">NextFund</span>
								)}
							</span>
						))}
					</h2>

					<p className={`text-base md:text-lg leading-relaxed max-w-3xl ${isDark ? "text-white/80" : "text-[#022C22]"}`}>
						{body}
					</p>

					{emphasis && (
						<p className={`text-base md:text-lg font-medium ${isDark ? "text-white" : "text-[#022C22]"}`}>
							{emphasis}
						</p>
					)}
				</div>
			</div>
		</section>
	);
};