import type { IJwtPayload } from "../interfaces/auth.interface";
export declare const generateToken: (payload: IJwtPayload) => string;
export declare const verifyToken: (token: string) => IJwtPayload;
//# sourceMappingURL=jwt.d.ts.map