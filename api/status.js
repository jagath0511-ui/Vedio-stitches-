const { json, repositoryConfig, requireAuth } = require("./_shared");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { error: "GET required" });
  }
  if (!requireAuth(req, res)) return;
  const config = repositoryConfig();
  if (!config) return json(res, 503, { error: "Agent status is not configured on the server" });
  try {
    const response = await fetch("https://api.github.com/repos/" + config.repository + "/actions/workflows/agent-runner.yml/runs?per_page=10", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + config.token,
        "User-Agent": "unattended-agent-control-panel"
      }
    });
    if (!response.ok) throw new Error(`GitHub status lookup failed (${response.status})`);
    const data = await response.json();
    const runs = Array.isArray(data.workflow_runs) ? data.workflow_runs : [];
    const mapRun = (run) => ({
      id: run.id, name: run.name, status: run.status, conclusion: run.conclusion,
      url: run.html_url,
      issueUrl: run.event === "issues" && run.display_title ? `https://github.com/${config.repository}/issues/${run.display_title.match(/#(\\d+)/)?.[1] || ""}` : null,
      artifactsUrl: `https://github.com/${config.repository}/actions/runs/${run.id}/artifacts`,
      startedAt: run.run_started_at,
      elapsedSeconds: run.run_started_at && run.updated_at
        ? Math.max(0, (Date.parse(run.updated_at) - Date.parse(run.run_started_at)) / 1000) : null,
      updatedAt: run.updated_at
    });
    return json(res, 200, {
      status: runs[0] ? (runs[0].status === "completed" ? (runs[0].conclusion || "completed") : runs[0].status) : "idle",
      latest: runs[0] ? mapRun(runs[0]) : null,
      runs: runs.map(mapRun),
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Status lookup failed:", error);
    return json(res, 502, { error: "Unable to read agent status" });
  }
};
