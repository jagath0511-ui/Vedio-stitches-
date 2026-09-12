const MAX_PROMPT_LENGTH = 4000;
const { json, repositoryConfig, requireAuth, requestBody } = require("./_shared");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "POST required" });
  }
  if (!requireAuth(req, res)) return;
  const body = requestBody(req);
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt || prompt.length > MAX_PROMPT_LENGTH) {
    return json(res, 400, { error: "prompt is required and must be 1-4000 characters" });
  }
  const config = repositoryConfig();
  if (!config) return json(res, 503, { error: "Agent queue is not configured on the server" });

  const id = `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  try {
    const response = await fetch("https://api.github.com/repos/" + config.repository + "/dispatches", {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + config.token,
        "Content-Type": "application/json",
        "User-Agent": "unattended-agent-control-panel"
      },
      body: JSON.stringify({ event_type: "agent-job", client_payload: { prompt, job_id: id, source: "web" } })
    });
    if (!response.ok) throw new Error(`GitHub dispatch failed (${response.status})`);
  } catch (error) {
    console.error("Prompt dispatch failed:", error);
    return json(res, 502, { error: "Unable to queue prompt" });
  }
  return json(res, 202, { id, status: "queued", acceptedAt: new Date().toISOString() });
};
