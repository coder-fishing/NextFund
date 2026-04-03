"use client";

import Link from "next/link";
import { footerColumns, footerLegalLinks } from "@/const/footer";

export const Footer = () => {
	return (
		<footer className="border-t bg-white text-sm text-gray-700">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				{/* Top columns */}
				<div className="grid gap-8 md:grid-cols-4">
					{footerColumns.map((column) => (
						<div key={column.heading}>
							<h3 className="mb-3 text-base font-semibold text-gray-900">
								{column.heading}
							</h3>
							<ul className="space-y-2">
								{column.links.map((link) => (
									<li key={link.title}>
										<Link
											href={link.href}
											className="hover:underline hover:text-gray-900"
										>
											{link.title}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				{/* Separator */}
				<div className="mt-10 border-t border-gray-200" />

				{/* Bottom bar */}
				<div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<p className="text-xs text-gray-500">
						© {new Date().getFullYear()} NextFund. All rights reserved.
					</p>

					<div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
						{footerLegalLinks.map((link) => (
							<Link
								key={link.title}
								href={link.href}
								className="hover:underline hover:text-gray-900"
							>
								{link.title}
							</Link>
						))}
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;

