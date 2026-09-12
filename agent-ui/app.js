const $ = (id) => document.getElementById(id);

async function request(path, options) {
  const headers = { "Content-Type": "application/json" };
  const token = $("access-token").value.trim();
  if (token) headers["X-Agent-UI-Token"] = token;
  const response = await fetch(path, { ...options, headers: { ...headers, ...(options?.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

$("access-token").value = sessionStorage.getItem("agent-ui-token") || "";
$("access-token").addEventListener("input", () => {
  sessionStorage.setItem("agent-ui-token", $("access-token").value.trim());
});

function updateRecipientValidation() {
  $("email").required = $("email-enabled").checked;
  $("phone").required = $("sms-enabled").checked;
}
$("email-enabled").addEventListener("change", updateRecipientValidation);
$("sms-enabled").addEventListener("change", updateRecipientValidation);
updateRecipientValidation();

async function refreshStatus() {
  $("status-text").textContent = "Loading…";
  try {
    const data = await request("/api/status");
    $("status-text").textContent = data.status;
    const latest = data.latest;
    $("status-report").textContent = latest
      ? `Status: ${data.status}\nProgress: indeterminate (download the durable report for percentage)\nStage: workflow execution\nStarted: ${latest.startedAt || "n/a"}\nElapsed: ${latest.elapsedSeconds == null ? "n/a" : `${latest.elapsedSeconds.toFixed(1)}s`}\nLogs/artifacts: ${latest.artifactsUrl}\n\n${JSON.stringify(data, null, 2)}`
      : JSON.stringify(data, null, 2);
    const link = $("status-link");
    if (data.latest?.url) {
      link.href = data.latest.url;
      link.hidden = false;
    } else {
      link.hidden = true;
      link.removeAttribute("href");
    }
  } catch (error) {
    $("status-text").textContent = error.message;
  }
}

$("prompt-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  $("prompt-result").textContent = "Submitting…";
  try {
    const data = await request("/api/prompts", {
      method: "POST",
      body: JSON.stringify({ prompt: $("prompt").value })
    });
    $("prompt-result").textContent = `Accepted (${data.id})`;
    $("prompt").value = "";
    refreshStatus();
  } catch (error) { $("prompt-result").textContent = error.message; }
});

$("notification-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  $("notification-result").textContent = "Saving…";
  try {
    const data = await request("/api/notifications", {
      method: "POST",
      body: JSON.stringify({
        emailEnabled: $("email-enabled").checked,
        email: $("email").value,
        smsEnabled: $("sms-enabled").checked,
        phone: $("phone").value
      })
    });

    $("notification-result").textContent = `Saved (${data.channels.join(", ") || "none"})`;
  } catch (error) { $("notification-result").textContent = error.message; }
});

$("refresh-status").addEventListener("click", refreshStatus);
refreshStatus();
