import { HttpStatus, HttpException, BadRequestException } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter Unit Tests', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: any;

  beforeEach(() => {
    filter = new AllExceptionsFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      url: '/api/v1/test-endpoint',
    };

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };
  });

  it('correctly catches and structures HttpException responses', () => {
    const exception = new BadRequestException('Validation failed');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        path: '/api/v1/test-endpoint',
      }),
    );
  });

  it('masks unexpected internal Error objects and hides stack traces', () => {
    const internalError = new Error('Database connection crashed: password=sensitive');

    filter.catch(internalError, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred in the CG Tourism Kernel.',
        path: '/api/v1/test-endpoint',
      }),
    );

    // Ensure raw error message or stack trace is NEVER leaked in JSON response
    const jsonCall = mockResponse.json.mock.calls[0][0];
    expect(jsonCall.message).not.toContain('Database connection crashed');
    expect(jsonCall.stack).toBeUndefined();
  });
});
