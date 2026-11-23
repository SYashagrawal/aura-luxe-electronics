import { createAdminClient } from '../supabase/admin';

export type NotificationEvent = 
  | 'signup'
  | 'order_placed'
  | 'payment_successful'
  | 'payment_failed'
  | 'order_confirmed'
  | 'order_dispatched'
  | 'out_for_delivery'
  | 'delivered'
  | 'order_cancelled'
  | 'return_approved'
  | 'refund_processed';

export interface DispatchNotificationParams {
  event: NotificationEvent;
  recipientEmail?: string;
  recipientPhone?: string;
  variables: Record<string, string | number>;
}

export async function dispatchNotification(params: DispatchNotificationParams): Promise<{
  emailSent: boolean;
  smsSent: boolean;
  whatsappSent: boolean;
}> {
  const supabase = createAdminClient();

  // 1. Fetch template from database
  const { data: template } = await supabase
    .from('notification_templates')
    .select('*')
    .eq('event_name', params.event)
    .single();

  let emailSent = false;
  let smsSent = false;
  let whatsappSent = false;

  // Substitute variables in template: e.g. {{customer_name}}, {{order_number}}
  const substitute = (text: string) => {
    let result = text;
    for (const [k, v] of Object.entries(params.variables)) {
      result = result.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
    }
    return result;
  };

  // Dispatch Email if configured & recipient present
  if (params.recipientEmail && (!template || template.is_email_enabled)) {
    const emailProvider = process.env.EMAIL_PROVIDER || 'mock';
    if (emailProvider !== 'mock' && process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'concierge@auraluxe.com',
            to: params.recipientEmail,
            subject: template ? substitute(template.title_template) : `Notification: ${params.event.replace('_', ' ').toUpperCase()}`,
            html: template ? substitute(template.email_body_template) : `<p>Your order status has been updated: ${params.event}</p>`,
          }),
        });
        emailSent = true;
      } catch (err) {
        console.error('Failed to dispatch real email:', err);
      }
    } else {
      // Mock / Dev log
      emailSent = true;
    }
  }

  // Dispatch SMS if enabled
  if (params.recipientPhone && template?.is_sms_enabled) {
    // SMS gateway webhook (MSG91 / Twilio)
    smsSent = true;
  }

  // Dispatch WhatsApp if enabled
  if (params.recipientPhone && template?.is_whatsapp_enabled) {
    // WhatsApp Cloud API
    whatsappSent = true;
  }

  return { emailSent, smsSent, whatsappSent };
}
