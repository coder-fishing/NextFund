/**
 * AI Moderation Service
 * Calls external AI API: https://nextfund-ai.onrender.com/predict
 */

export const moderateCampaign = async (
  title: string,
  description: string,
  goalAmount: number
): Promise<{ status: string; aiPrediction: string; aiTrustScore: number | null; aiReasons: string[] }> => {
  try {
    const response = await fetch("https://nextfund-ai.onrender.com/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        goal: Number(goalAmount),
      }),
    });

    if (!response.ok) {
      console.error("AI Moderation API failed with status:", response.status);
      return { status: "pending", aiPrediction: "error", aiTrustScore: null, aiReasons: [] };
    }

    const data = await response.json();
    console.log(`[AI Response Data]`, data);

    const prediction = (data.prediction || "pending").toLowerCase();
    const trustScore = data.trust_score || null;
    const reasons = data.reasons || [];

    if (["approved", "rejected", "pending"].includes(prediction)) {
      return {
        // AI approved -> approved, AI rejected or pending -> manual (needs human review)
        status: prediction === "approved" ? "approved" : "manual",
        aiPrediction: prediction,
        aiTrustScore: trustScore,
        aiReasons: reasons,
      };
    }

    return { status: "manual", aiPrediction: "unknown", aiTrustScore: trustScore, aiReasons: reasons };
  } catch (error) {
    console.error("AI Moderation API error:", error);
    return { status: "pending", aiPrediction: "error", aiTrustScore: null, aiReasons: [] };
  }
};
