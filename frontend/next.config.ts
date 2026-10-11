
import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  // In local development, basePath is not used so http://localhost:3000 works normally
  ...(isGithubPages ? {
    output: "export",
    basePath: "/Digital-Service-Management-Platform",
    trailingSlash: true,
  } : {}),
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['10.4.2.2', 'localhost', '127.0.0.1'],
};

export default nextConfig;
