/**
 * Konfiguracja URL dla autoryzacji Supabase
 */
export const supabaseAuthConfig = {
  /**
   * URL do przekierowania po potwierdzeniu adresu email
   */
  redirectUrls: {
    emailConfirmation: "/verify-email",
    emailVerification: "/verify-email",
    passwordReset: "/reset-password",
    invite: "/login",
  },
};
