export {};

declare global {
  namespace Express {
    export interface Request {
      user?: {
        companyToken: string;
      };
    }
  }
}
