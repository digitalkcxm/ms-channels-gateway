export type PontalTechSendRcsApiResponse = {
  validMessages: {
    id: string;
    session_id?: string;
    number: string;
  }[];
  invalidMessages: {
    number: string;
    reason: string;
  }[];
};
