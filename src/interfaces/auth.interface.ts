export interface IJwtPayload {
  id: number;
  name: string;
  role: "contributor" | "maintainer";
}
