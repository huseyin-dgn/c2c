export type PrivacyNotice = {
  version: string;
  title: string;
  paragraphs: string[];
};
// Replace null only with the reviewed disclosure containing the real controller,
// processing grounds, recipients/transfers, retention and rights/contact channel.
export const privacyNotice: PrivacyNotice | null = null;
