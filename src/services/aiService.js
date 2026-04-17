// Thin client for the nivaran-ai FastAPI service.
// Calls POST {AI_SERVICE_URL}/route with the complaint text and returns the
// suggested department + confidence. Returns null on any failure so callers
// can fall back gracefully (AI should never block a citizen submission).

const DEFAULT_AI_SERVICE_URL = "http://localhost:8000";
const DEFAULT_TIMEOUT_MS = 10000;

const buildComplaintText = ({ title, description }) => {
  const parts = [];
  if (title && title.trim()) parts.push(title.trim());
  if (description && description.trim()) parts.push(description.trim());
  return parts.join(". ");
};

export const routeComplaint = async ({ title, description }) => {
  const complaint = buildComplaintText({ title, description });

  // nivaran-ai rejects complaints shorter than 10 chars; skip the round-trip.
  if (complaint.length < 10) {
    return null;
  }

  const baseUrl = process.env.AI_SERVICE_URL || DEFAULT_AI_SERVICE_URL;
  const timeoutMs = Number(process.env.AI_SERVICE_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;
  const url = `${baseUrl.replace(/\/+$/, "")}/route`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaint }),
      signal: controller.signal
    });

    if (!response.ok) {
      console.warn(
        `AI service returned ${response.status} for /route; proceeding without AI routing`
      );
      return null;
    }

    const data = await response.json();
    if (!data || typeof data.department !== "string") {
      console.warn("AI service returned unexpected payload; ignoring", data);
      return null;
    }

    // nivaran-ai returns confidence in [0, 1]. The complaints table stores
    // ai_confidence_score as DECIMAL(5,2), so we scale to a 0-100 percentage
    // to preserve precision instead of truncating 0.78xx to 0.78.
    const confidence =
      typeof data.confidence === "number"
        ? Math.round(data.confidence * 10000) / 100
        : null;

    return {
      department: data.department,
      confidence,
      alternative: data.alternative ?? null,
      status: data.status ?? null
    };
  } catch (error) {
    if (error.name === "AbortError") {
      console.warn(`AI service call timed out after ${timeoutMs}ms; proceeding without AI routing`);
    } else {
      console.warn("AI service call failed; proceeding without AI routing:", error.message);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
};
