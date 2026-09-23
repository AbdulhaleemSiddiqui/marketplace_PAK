import {
    apiRequest,
  } from "./apiClient";
  
  export interface SendOtpResponse {
    message?: string;
    developmentOtp?: string | null;
  }
  
  
  export async function sendPhoneOtp(
    phone: string,
  ) {
    return apiRequest<SendOtpResponse>(
      "/api/auth/otp/send",
      {
        method: "POST",
        body: JSON.stringify({
          phone,
        }),
      },
    );
  }
  
  export async function verifyPhoneOtp(
    code: string,
  ) {
    return apiRequest<unknown>(
      "/api/auth/otp/verify",
      {
        method: "POST",
        body: JSON.stringify({
          code,
        }),
      },
    );
  }
  
