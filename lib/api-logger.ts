import { NextRequest, NextResponse } from "next/server";
import {
  logApiCall,
  getClientIp,
  getUserAgent,
  sanitizeRequestBody,
  sanitizeResponseBody,
} from "./logger";

export interface ApiHandlerContext {
  userId?: string;
  username?: string;
  function: string;
  params?: any;
}

export function withApiLogging<T = any>(
  handler: (
    request: NextRequest,
    context: ApiHandlerContext
  ) => Promise<NextResponse<T>>,
  functionName: string
) {
  return async (
    request: NextRequest,
    { params }: { params?: any } = {}
  ): Promise<NextResponse<T>> => {
    console.log(
      `🚀 API Logger: Starting ${functionName} for ${request.method} ${request.nextUrl.pathname}`
    );

    const startTime = Date.now();
    let statusCode = 500;
    let responseBody: any = null;
    let requestBody: any = null;
    let error: string | undefined = undefined;

    // Get user info from headers (set by middleware)
    const userId = request.headers.get("x-user-id") || undefined;
    const username = request.headers.get("x-username") || undefined;

    console.log(
      `👤 API Logger: User info - userId: ${userId}, username: ${username}`
    );

    const context: ApiHandlerContext = {
      userId,
      username,
      function: functionName,
      params,
    };

    try {
      // Clone request to read body if needed
      const clonedRequest = request.clone();

      // Try to get request body for POST/PUT requests
      if (["POST", "PUT", "PATCH"].includes(request.method)) {
        try {
          requestBody = await clonedRequest.json();
        } catch {
          // Body might not be JSON or might be empty
        }
      }

      // Execute the actual handler
      const response = await handler(request, context);
      statusCode = response.status;

      // Try to get response body
      try {
        const clonedResponse = response.clone();
        responseBody = await clonedResponse.json();
      } catch {
        // Response might not be JSON
      }

      console.log(
        `✅ API Logger: ${functionName} completed with status ${statusCode}`
      );
      return response;
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      console.error(`❌ API Logger: ${functionName} failed with error:`, error);
      throw err;
    } finally {
      const duration = Date.now() - startTime;

      console.log(`📝 API Logger: Logging ${functionName} call...`);

      // Log the API call - don't await to avoid blocking the response
      logApiCall({
        userId,
        username,
        method: request.method,
        path: request.nextUrl.pathname,
        function: functionName,
        statusCode,
        requestBody: sanitizeRequestBody(requestBody),
        responseBody: sanitizeResponseBody(responseBody),
        userAgent: getUserAgent(request),
        ipAddress: getClientIp(request),
        duration,
        error,
      }).catch((logError) => {
        console.error(
          `❌ API Logger: Failed to log ${functionName}:`,
          logError
        );
      });
    }
  };
}
