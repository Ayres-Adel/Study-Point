import { body, validationResult } from 'express-validator';

// Enhanced validation rules for registration
export const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters')
    .escape() // Sanitize to prevent XSS
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('Full name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail() // Normalize email format
    .isLength({ max: 255 })
    .withMessage('Email must be less than 255 characters'),
  
  body('phone')
    .trim()
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Phone number can only contain digits, +, spaces, hyphens and parentheses')
    .isLength({ min: 8, max: 20 })
    .withMessage('Phone number must be between 8 and 20 characters'),
  
  body('password')
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be between 6 and 100 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

// Validation rules for login
export const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Enhanced middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const fieldErrors = errors.array().reduce((acc, error) => {
      acc[error.param] = {
        message: error.msg,
        value: error.value,
        location: error.location
      };
      return acc;
    }, {});

    return res.status(400).json({
      success: false,
      type: 'VALIDATION',
      message: 'Validation failed',
      errors: fieldErrors,
      timestamp: new Date().toISOString()
    });
  }
  next();
};
