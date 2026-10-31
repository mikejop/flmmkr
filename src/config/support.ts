/** Suporte por WhatsApp: usuário @mkeoliver (wa.me aceita o nome de usuário no lugar do número). */
export const supportWhatsAppUrl = (message: string) => `https://wa.me/mkeoliver?text=${encodeURIComponent(message)}`;
