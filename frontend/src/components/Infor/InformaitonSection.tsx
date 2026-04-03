"use client";

import { StatsStrip } from "./StatsStrip";
import { InfoBlock } from "./InfoBlock";
import { info, info2 } from "@/const/info";

export const InformationSection = () => {
	return (
		<div className="w-full">
			<InfoBlock
                title={info.title}
                body={info.body}
                emphasis={info.emphasis}
                variant="light"
			/>

			<StatsStrip />

			<InfoBlock
                eyebrow={info2.eyebrow}
                title={info2.title}
                body={info2.body}
                emphasis={info2.emphasis}
                variant="dark"
			/>
		</div>
	);
};

export default InformationSection;

