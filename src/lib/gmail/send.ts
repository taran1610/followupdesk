const GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
const GMAIL_PROFILE_URL = "https://gmail.googleapis.com/gmail/v1/users/me/profile";

function encodeRawMessage(message: string): string {
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function buildRfc2822Message(args: {
  to: string;
  subject: string;
  body: string;
}): string {
  const { to, subject, body } = args;
  const normalizedBody = body.replace(/\r?\n/g, "\r\n");
  return [`To: ${to}`, `Subject: ${subject}`, "MIME-Version: 1.0", "Content-Type: text/plain; charset=UTF-8", "", normalizedBody].join("\r\n");
}

export async function fetchGmailProfileEmail(accessToken: string): Promise<string> {
  const res = await fetch(GMAIL_PROFILE_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = (await res.json()) as { emailAddress?: string; error?: { message?: string } };
  if (!res.ok || !data.emailAddress) {
    throw new Error(data.error?.message ?? "Could not read your Gmail address.");
  }
  return data.emailAddress;
}

export async function sendGmailMessage(args: {
  accessToken: string;
  to: string;
  subject: string;
  body: string;
}): Promise<{ id: string }> {
  const raw = encodeRawMessage(
    buildRfc2822Message({
      to: args.to,
      subject: args.subject,
      body: args.body,
    })
  );

  const res = await fetch(GMAIL_SEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${args.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });

  const data = (await res.json()) as { id?: string; error?: { message?: string } };
  if (!res.ok || !data.id) {
    throw new Error(data.error?.message ?? "Gmail could not send this message.");
  }
  return { id: data.id };
}
