import { Resend } from 'resend' // أو SendGrid

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!resend) {
    console.log('Email not sent (no API key):', subject)
    return
  }

  try {
    await resend.emails.send({
      from: 'Edu Platform <noreply@yourdomain.com>',
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('Failed to send email:', error)
  }
}

export function getEmailTemplate(type: string, data: Record<string, string>) {
  const templates: Record<string, string> = {
    CODE_REDEEMED: `
      <div style="font-family: Cairo, sans-serif; padding: 20px; background: #f9fafb;">
        <h2 style="color: #2563eb;">تم تفعيل الكود بنجاح</h2>
        <p>عزيزي ${data.studentName}،</p>
        <p>لقد تم تفعيل كود الكورس "${data.courseTitle}" بنجاح.</p>
        <p>صلاحية الكورس: ${data.expiryDays} أيام</p>
        <a href="${data.courseUrl}" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px;">
          ابدأ الدراسة الآن
        </a>
      </div>
    `,
    QUESTION_REPLIED: `
      <div style="font-family: Cairo, sans-serif; padding: 20px; background: #f9fafb;">
        <h2 style="color: #2563eb;">تم الرد على سؤالك</h2>
        <p>عزيزي ${data.studentName}،</p>
        <p>قام المدرس بالرد على سؤالك في كورس "${data.courseTitle}".</p>
        <a href="${data.questionUrl}" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px;">
          عرض الرد
        </a>
      </div>
    `,
    ASSIGNMENT_GRADED: `
      <div style="font-family: Cairo, sans-serif; padding: 20px; background: #f9fafb;">
        <h2 style="color: #2563eb;">تم تصحيح واجبك</h2>
        <p>عزيزي ${data.studentName}،</p>
        <p>تم تصحيح واجب "${data.assignmentTitle}" في كورس "${data.courseTitle}".</p>
        <p>النتيجة: ${data.score}%</p>
      </div>
    `,
  }

  return templates[type] || ''
}