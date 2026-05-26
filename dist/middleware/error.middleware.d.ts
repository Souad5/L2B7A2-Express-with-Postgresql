import type { Request, Response, NextFunction } from "express";
declare const globalErrorHandler: (err: any, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export default globalErrorHandler;
//# sourceMappingURL=error.middleware.d.ts.map