export type PontalTechSendRcsApiResponse = {
  campaign_id: string;
  messages: {
    id: string;
    number: string;
    session_id: string;
  }[];
};
