import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET || "secret-access-key";

// Bloklangan tokenlarni xotirada (RAM) saqlash uchun Set
const blockedTokens = new Set<string>();

interface TokenPayload {
  userId?: number;
  email?: string;
  [key: string]: any;
}

export const generateAccessToken = (payload: TokenPayload, expiresIn: SignOptions["expiresIn"] = "15m"): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const generateRefreshToken = (payload: TokenPayload, expiresIn: SignOptions["expiresIn"] = "1d"): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyToken = (token: string): string | JwtPayload => {
  return jwt.verify(token, JWT_SECRET);
};

// Redissiz token bloklash (Xotirada saqlash)
export const blockUserAccessToken = async (accessToken: string, expiresAt: number = 3600): Promise<void> => {
  blockedTokens.add(accessToken);

  // Berilgan vaqt (sekund) tugagach, xotirani tozalash (RAM to'lib ketmasligi uchun)
  setTimeout(() => {
    blockedTokens.delete(accessToken);
  }, expiresAt * 1000);
};

// Bloklanganlikni tekshirish
export const getBlockedAccessToken = async (accessToken: string): Promise<boolean> => {
  return blockedTokens.has(accessToken); // Bor bo'lsa true, yo'q bo'lsa false qaytaradi
};