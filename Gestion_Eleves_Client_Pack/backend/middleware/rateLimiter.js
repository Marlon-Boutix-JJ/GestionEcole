import rateLimit from 'express-rate-limit';

// Strict Rate Limiter for Authentication endpoints (login/register) to prevent Brute-Force & Credential Stuffing
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 login/register requests per 15 minutes
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: {
    message: 'Trop de tentatives de connexion/inscription depuis cette adresse IP. Veuillez réessayer après 15 minutes.'
  }
});

// General Rate Limiter for API endpoints to prevent DDoS & Automated Scrapers
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Trop de requêtes générées. Veuillez patienter quelques minutes.'
  }
});
