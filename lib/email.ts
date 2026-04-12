import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "NexusAI <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://andybedford62aiabedfordrepo.vercel.app";

export async function sendInviteEmail({
  to,
  workspaceName,
  inviterName,
  token,
  role,
}: {
  to: string;
  workspaceName: string;
  inviterName: string;
  token: string;
  role: string;
}) {
  const link = `${APP_URL}/accept-invite/${token}`;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `You've been invited to join ${workspaceName} on NexusAI`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;">
        <div style="background:linear-gradient(135deg,#6272f5,#7c3aed);border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
          <h1 style="color:white;margin:0;font-size:24px;font-weight:800;">NexusAI</h1>
        </div>
        <h2 style="color:#111;font-size:20px;margin-bottom:8px;">You've been invited!</h2>
        <p style="color:#555;font-size:15px;line-height:1.6;">
          <strong>${inviterName}</strong> has invited you to join <strong>${workspaceName}</strong> on NexusAI as a <strong>${role.toLowerCase()}</strong>.
        </p>
        <a href="${link}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:linear-gradient(135deg,#6272f5,#7c3aed);color:white;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;">
          Accept Invitation
        </a>
        <p style="color:#999;font-size:13px;">This link expires in 7 days. If you didn't expect this, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function sendAddedToWorkspaceEmail({
  to,
  workspaceName,
  inviterName,
  role,
}: {
  to: string;
  workspaceName: string;
  inviterName: string;
  role: string;
}) {
  const link = `${APP_URL}/dashboard`;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `You've been added to ${workspaceName} on NexusAI`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;">
        <div style="background:linear-gradient(135deg,#6272f5,#7c3aed);border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
          <h1 style="color:white;margin:0;font-size:24px;font-weight:800;">NexusAI</h1>
        </div>
        <h2 style="color:#111;font-size:20px;margin-bottom:8px;">You've been added to a workspace</h2>
        <p style="color:#555;font-size:15px;line-height:1.6;">
          <strong>${inviterName}</strong> has added you to <strong>${workspaceName}</strong> as a <strong>${role.toLowerCase()}</strong>. You can access it now.
        </p>
        <a href="${link}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:linear-gradient(135deg,#6272f5,#7c3aed);color:white;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;">
          Open Workspace
        </a>
      </div>
    `,
  });
}
