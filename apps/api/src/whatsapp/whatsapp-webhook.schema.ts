import { z } from 'zod';

const messageSchema = z.object({
  from: z.string(),
  id: z.string(),
  timestamp: z.string(),
  type: z.string(),
  text: z.object({ body: z.string() }).optional(),
});

export const whatsappWebhookSchema = z.object({
  object: z.string(),
  entry: z.array(
    z.object({
      changes: z.array(
        z.object({
          value: z.object({
            metadata: z.object({
              phone_number_id: z.string(),
            }),
            contacts: z
              .array(
                z.object({
                  wa_id: z.string(),
                  profile: z.object({ name: z.string().optional() }).optional(),
                }),
              )
              .optional(),
            messages: z.array(messageSchema).optional(),
          }),
        }),
      ),
    }),
  ),
});

export type WhatsAppWebhookPayload = z.infer<typeof whatsappWebhookSchema>;
