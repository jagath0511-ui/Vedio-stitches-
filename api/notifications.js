const { json, requireAuth, requestBody } = require("./_shared");

function validateDestinations(body) {
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string"
    ? body.phone.trim().replace(/[ ()-]/g, "") : "";
  if (body.emailEnabled &&
      (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return { error: "A valid email recipient is required" };
  }
  if (body.smsEnabled && !/^\+\d{7,15}$/.test(phone)) {
    return { error: "A valid SMS recipient is required in international format" };
  }
  return { email, phone };
}

module.exports = (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "POST required" });
  }
  if (!requireAuth(req, res)) return;
  const body = requestBody(req);
  const validated = validateDestinations(body);
  if (validated.error) return json(res, 400, { error: validated.error });
  const channels = [];
  if (body.emailEnabled) {
    channels.push("email");
  }
  if (body.smsEnabled) {
    channels.push("sms");
  }
  return json(res, 202, {
    status: "accepted",
    channels,
    destinations: {
      email: body.emailEnabled ? validated.email : null,
      phone: body.smsEnabled ? validated.phone : null
    }
  });
};
