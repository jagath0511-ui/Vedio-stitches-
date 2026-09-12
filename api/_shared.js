function json(res, status, body) {
  res.status(status)
    .setHeader("Content-Type", "application/json")
    .setHeader("Cache-Control", "no-store")
    .end(JSON.stringify(body));
}

function repositoryConfig() {
  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  if (!token || !repository || !/^[^/\s]+\/[^/\s]+$/.test(repository)) return null;
  return { token, repository };
}

function requireAuth(req, res) {
  const expected = process.env.AGENT_UI_TOKEN;
  const supplied = req.headers?.["x-agent-ui-token"] || req.headers?.authorization || "";
  const valid = expected && (supplied === expected || supplied === "Bearer " + expected);
  if (valid) return true;
  json(res, expected ? 401 : 503, {
    error: expected ? "Agent control panel authentication required" : "Agent control panel is not configured on the server"
  });
  return false;
}

function requestBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch (_) { return {}; }
  }
  return {};
}

module.exports = { json, repositoryConfig, requireAuth, requestBody };
