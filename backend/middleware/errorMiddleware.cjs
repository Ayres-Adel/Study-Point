const { Request, Response, NextFunction } = require('express');

// Error types for better handling
const ErrorType = {
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  DATABASE: 'DATABASE',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL: 'INTERNAL'
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode = 500, type = ErrorType.INTERNAL, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.isOperational = isOperational;
    this.correlationId = this.generateCorrelationId();
    
    Error.captureStackTrace(this, this.constructor);
  }

  generateCorrelationId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Global error handling middleware
const errorHandler = (error, req, res, next) => {
  let err = { ...error };
  err.message = error.message;

  // Log error with correlation ID
  console.error(`[${new Date().toISOString()}] Error ${err.correlationId || 'N/A'}:`, {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    ip: req.ip
  });

  // MySQL Duplicate entry
  if (error.code === 'ER_DUP_ENTRY') {
    const message = 'Duplicate field value entered';
    err = new AppError(message, 409, ErrorType.CONFLICT);
  }

  // MySQL Table not found
  if (error.code === 'ER_NO_SUCH_TABLE') {
    const message = 'Database table not found. Please ensure the database is initialized.';
    err = new AppError(message, 500, ErrorType.DATABASE);
  }

  // MySQL Connection refused or failed
  if (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR') {
    const message = 'Database connection failed. Please check database configuration.';
    err = new AppError(message, 503, ErrorType.DATABASE);
  }

  // Handle operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      type: err.type,
      message: err.message,
      correlationId: err.correlationId,
      timestamp: new Date().toISOString()
    });
  }

  // Default error
  const statusCode = 500;
  const message = 'Internal server error';
  
  res.status(statusCode).json({
    success: false,
    type: ErrorType.INTERNAL,
    message,
    correlationId: err.correlationId || 'N/A',
    timestamp: new Date().toISOString()
  });
};

// Async error catcher
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = { errorHandler, catchAsync, AppError, ErrorType };
