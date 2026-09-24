// Middleware to sanitize request bodies and prevent stored XSS attacks
export const sanitizeInputs = (req, res, next) => {
  const sanitizeValue = (val) => {
    if (typeof val === 'string') {
      // Remove dangerous script tags, html injections, and javascript protocols
      return val
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    } else if (typeof val === 'object' && val !== null) {
      for (let key in val) {
        if (Object.prototype.hasOwnProperty.call(val, key)) {
          val[key] = sanitizeValue(val[key]);
        }
      }
    }
    return val;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }

  next();
};
