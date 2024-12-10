export type PontalTechSendRcsApiResponse = {
  validMessages: {
    id: string;
    number: string;
  }[];
  invalidMessages: {
    number: string;
    reason: string;
  }[];
};
