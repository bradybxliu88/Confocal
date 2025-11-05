import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const generateRefreshToken = async (userId: string): Promise<string> => {
  const token = jwt.sign({ userId, tokenId: uuidv4() }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });

  // Calculate expiration date
  const expiresInMs = ms(JWT_REFRESH_EXPIRES_IN);
  const expiresAt = new Date(Date.now() + expiresInMs);

  // Store refresh token in database
  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return token;
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export const verifyRefreshToken = async (token: string): Promise<string | null> => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };

    // Check if token exists in database and is not expired
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      return null;
    }

    return decoded.userId;
  } catch (error) {
    return null;
  }
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
  await prisma.refreshToken.delete({
    where: { token },
  }).catch(() => {
    // Token already deleted or doesn't exist
  });
};

// Helper function to parse time strings like "7d", "15m"
function ms(timeString: string): number {
  const units: { [key: string]: number } = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  };

  const match = timeString.match(/^(\d+)([a-z]+)$/);
  if (!match) return 0;

  const value = parseInt(match[1]);
  const unit = match[2];

  return value * (units[unit] || 0);
}
