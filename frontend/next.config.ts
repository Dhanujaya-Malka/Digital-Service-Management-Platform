
import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  ...(isGithubPages ? {
    basePath: "/Digital-Service-Management-Platform",
  } : {}),
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['10.4.2.2', 'localhost', '127.0.0.1'],
};

export default nextConfig;
