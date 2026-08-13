const apiToken = process.env.TEXTLK_API_TOKEN;
const senderId = process.env.TEXTLK_SENDER_ID || "SamadhiRice";

export async function sendSMS(to: string, message: string) {
  if (!apiToken || !to) {
    console.log(
      `[sms] skipped to ${to || "no-recipient"} (TEXTLK_API_TOKEN ${apiToken ? "set" : "not set"})`,
    );
    return;
  }
  
  // Basic phone formatting for SL: assume 07X... -> 947X...
  let formattedTo = to.replace(/[^0-9+]/g, '');
  if (formattedTo.startsWith('0')) {
    formattedTo = '94' + formattedTo.slice(1);
  } else if (!formattedTo.startsWith('94') && !formattedTo.startsWith('+')) {
    formattedTo = '94' + formattedTo;
  }

  try {
    const res = await fetch("https://app.text.lk/api/v3/sms/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        recipient: formattedTo,
        sender_id: senderId,
        message: message,
      }),
    });
    if (!res.ok) {
      console.error("[sms] text.lk send failed:", await res.text());
    }
  } catch (e) {
    console.error("[sms] send failed:", e);
  }
}
