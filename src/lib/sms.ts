// SMS abstraction — swap provider via SMS_PROVIDER env var
// Supported: "twilio" | "msg91" | "fast2sms"
// Development fallback: console.log (no key needed)

export async function sendOTP(phone: string, otp: string): Promise<void> {
  const provider = process.env.SMS_PROVIDER;
  const message = `${otp} is your FinanceAI OTP. Valid for 10 minutes. Do not share this with anyone.`;

  if (provider === "twilio") {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken  = process.env.TWILIO_AUTH_TOKEN!;
    const from       = process.env.TWILIO_PHONE_NUMBER!;

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: phone, From: from, Body: message }),
      }
    );
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message ?? "Twilio SMS failed");
    }
    return;
  }

  if (provider === "msg91") {
    const apiKey     = process.env.MSG91_API_KEY!;
    const templateId = process.env.MSG91_TEMPLATE_ID!;
    // MSG91 flow: uses DLT-approved template with {{otp}} variable
    const res = await fetch("https://api.msg91.com/api/v5/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authkey: apiKey,
        template_id: templateId,
        mobile: phone.replace("+", ""),
        otp,
      }),
    });
    if (!res.ok) throw new Error("MSG91 SMS failed");
    return;
  }

  if (provider === "fast2sms") {
    const apiKey = process.env.FAST2SMS_API_KEY!;
    const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: { authorization: apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        route: "otp",
        variables_values: otp,
        numbers: phone.replace("+91", ""),
      }),
    });
    if (!res.ok) throw new Error("Fast2SMS failed");
    return;
  }

  // Development fallback — no SMS_PROVIDER set
  console.log(`\n📱 OTP for ${phone}: ${otp}\n`);
}
