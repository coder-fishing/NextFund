"use client";

import { useParams } from "next/navigation";
import { CampaignEditorPage } from "@/components/CreateCampaign/CampaignEditorPage";

export default function EditCampaignPage() {
	const params = useParams<{ id: string }>();
	const campaignId = Array.isArray(params?.id) ? params.id[0] : params?.id;

	return (
		<CampaignEditorPage
			mode="edit"
			campaignId={campaignId}
			backHref="/campaigns/mycampaigns"
			backLabel="Back to my campaigns"
		/>
	);
}
