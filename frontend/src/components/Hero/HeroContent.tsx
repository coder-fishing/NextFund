import Link from 'next/link';
import { SocialProof } from './SocialProof';

export function HeroContent() {
	return (
		<div className="flex-1 space-y-8">
			<div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200 shadow-sm shadow-emerald-500/30">
				<span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
				Live impact from real campaigns
			</div>

			<div className="space-y-4">
				<h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
					NextFund giúp bạn
					<span className="bg-gradient-to-r from-emerald-300 via-sky-300 to-blue-300 bg-clip-text text-transparent">
						{' '}
						gây quỹ minh bạch
					</span>
					{' '}cho mọi hoàn cảnh.
				</h1>
				<p className="max-w-xl text-sm text-slate-300 sm:text-base">
					Kết nối mạnh thường quân với các chiến dịch cộng đồng, từ y tế khẩn cấp
					đến môi trường và giáo dục. Mỗi khoản đóng góp đều được theo dõi rõ ràng,
					bảo đảm số tiền đến đúng nơi cần.
				</p>
			</div>

			<div className="flex flex-wrap items-center gap-4">
				<Link
					href="/campaigns"
					className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-7 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 transition-colors"
				>
					Bắt đầu ủng hộ
				</Link>
				<Link
					href="/about"
					className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/40 px-7 py-2.5 text-sm font-semibold text-slate-100 hover:border-slate-500 hover:bg-slate-800/80 transition-colors"
				>
					Tìm hiểu thêm
				</Link>
			</div>

			<SocialProof />
		</div>
	);
}

