import { Resend } from 'resend';

// Initialize Resend Client
// Get FREE API Key: https://resend.com/
// Add RESEND_API_KEY to .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

// Default Sender Address
// Note: In Resend Free Tier, you can only send to your own email unless you verify a domain.
// For Hackathon demo: Use 'onboarding@resend.dev' as sender.
const SYSTEM_EMAIL = 'NitiNirmaan <onboarding@resend.dev>';

/**
 * Send an invitation email to a team member.
 * @param toEmail The recipient's email address
 * @param projectName The name of the project they are being invited to
 * @param inviteLink The URL to accept the invite (e.g., /dashboard?invite=xyz)
 */
export async function sendTeamInviteEmail(
  toEmail: string,
  projectName: string,
  inviteLink: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY is missing. Email simulation:');
    console.log(`[Email] To: ${toEmail}, Subject: Join ${projectName}, Link: ${inviteLink}`);
    return { success: true, simulated: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: SYSTEM_EMAIL,
      to: toEmail,
      subject: `Invite: Collaborate on "${projectName}"`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You've been invited to NitiNirmaan!</h2>
          <p>You have been invited to collaborate on the Logical Framework for the project: <strong>${projectName}</strong>.</p>
          <p>Click the button below to join the workspace and start building:</p>
          <div style="margin: 20px 0;">
            <a href="${inviteLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Accept Invitation
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">If you didn't expect this invite, you can ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend Email Error:', error);
      return { error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Unexpected Email Error:', err);
    return { error: 'Failed to send email' };
  }
}

/**
 * Send a notification when the PDF export is ready (for long-running tasks).
 */
export async function sendExportReadyEmail(
  toEmail: string,
  projectName: string,
  downloadUrl: string
) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: SYSTEM_EMAIL,
    to: toEmail,
    subject: `Export Ready: ${projectName}`,
    html: `
      <div style="font-family: sans-serif;">
        <h2>Your LFA Document is Ready</h2>
        <p>The Logical Framework for <strong>${projectName}</strong> has been successfully generated.</p>
        <a href="${downloadUrl}">Download PDF</a>
      </div>
    `,
  });
}