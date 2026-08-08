/** @type {import('next').NextConfig} */
const isDevelopment = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""} https://cloud.umami.is`,
  `connect-src 'self'${isDevelopment ? " ws: wss:" : ""} https://cloud.umami.is https://gateway.umami.is https://api-gateway.umami.dev`,
  "frame-src 'self' https://open.spotify.com",
  "form-action 'self' mailto:"
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  }
];

const runtimeFileRouteTraceExcludes = [
  "./AGENTS.md",
  "./Dockerfile",
  "./README.md",
  "./app/**/*",
  "./components/**/*",
  "./data/**/*",
  "./lib/**/*",
  "./public/**/*",
  "./*.config.*",
  "./package*.json",
  "./tailwind.config.js",
  "./tsconfig*"
];

const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["better-sqlite3"],
  outputFileTracingExcludes: {
    "/posters/\\[fileName\\]": runtimeFileRouteTraceExcludes,
    "/gallery-images/\\[fileName\\]": runtimeFileRouteTraceExcludes,
    "/video-thumbnails/\\[fileName\\]": runtimeFileRouteTraceExcludes
  },
  images: {
    formats: ["image/avif", "image/webp"]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ];
  }
};

module.exports = nextConfig;
