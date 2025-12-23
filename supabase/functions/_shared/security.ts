// Shared security utilities for edge functions

// Allowed origins for CORS
export const ALLOWED_ORIGINS = [
  "https://dcjurgffzjpjxqpmqtkd.lovableproject.com",
  "https://seolovable.com",
  "https://www.seolovable.com",
  "https://seolovable.cloud",
  "https://www.seolovable.cloud",
];

// Generate dynamic CORS headers based on request origin
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.endsWith('.lovableproject.com')
  ) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

// URL validation for SSRF protection
export function validateUrlSafe(url: string): { valid: boolean; error?: string; url?: URL } {
  try {
    const parsedUrl = new URL(url);
    
    // Only allow HTTP and HTTPS protocols
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return { valid: false, error: "Only HTTP and HTTPS protocols are allowed" };
    }
    
    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Block localhost variants
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname.endsWith(".localhost")
    ) {
      return { valid: false, error: "Localhost URLs are not allowed" };
    }
    
    // Block private IP ranges (RFC 1918)
    const ipMatch = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipMatch) {
      const [, a, b, c, d] = ipMatch.map(Number);
      
      // 10.0.0.0/8
      if (a === 10) {
        return { valid: false, error: "Private IP addresses are not allowed" };
      }
      // 172.16.0.0/12
      if (a === 172 && b >= 16 && b <= 31) {
        return { valid: false, error: "Private IP addresses are not allowed" };
      }
      // 192.168.0.0/16
      if (a === 192 && b === 168) {
        return { valid: false, error: "Private IP addresses are not allowed" };
      }
      // 127.0.0.0/8 loopback
      if (a === 127) {
        return { valid: false, error: "Loopback addresses are not allowed" };
      }
      // 169.254.0.0/16 link-local (cloud metadata)
      if (a === 169 && b === 254) {
        return { valid: false, error: "Link-local addresses are not allowed" };
      }
      // 0.0.0.0/8
      if (a === 0) {
        return { valid: false, error: "Invalid IP address" };
      }
    }
    
    // Block cloud metadata endpoints
    if (
      hostname === "metadata.google.internal" ||
      hostname.includes("metadata.azure") ||
      hostname.includes("169.254.169.254")
    ) {
      return { valid: false, error: "Cloud metadata endpoints are not allowed" };
    }
    
    // URL length limit
    if (url.length > 2048) {
      return { valid: false, error: "URL is too long (max 2048 characters)" };
    }
    
    return { valid: true, url: parsedUrl };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

// Email validation with domain checks
export function validateEmail(email: string): { valid: boolean; error?: string } {
  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Invalid email format" };
  }
  
  // Length limit
  if (email.length > 320) {
    return { valid: false, error: "Email is too long" };
  }
  
  // Block disposable email domains (common ones)
  const domain = email.split("@")[1]?.toLowerCase();
  const disposableDomains = [
    "tempmail.com", "throwaway.email", "guerrillamail.com",
    "10minutemail.com", "mailinator.com", "yopmail.com",
    "temp-mail.org", "fakeinbox.com", "trashmail.com"
  ];
  
  if (disposableDomains.includes(domain)) {
    return { valid: false, error: "Disposable email addresses are not allowed" };
  }
  
  return { valid: true };
}
