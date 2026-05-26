import type { NextFunction, Request, Response } from "express";
declare const roleMiddleware: (role: string) => (req: Request, res: Response, next: NextFunction) => void;
export default roleMiddleware;
//# sourceMappingURL=role.middleware.d.ts.map