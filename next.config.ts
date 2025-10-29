import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/?initial=login",
        permanent: false,
      },
      {
        source: "/register",
        destination: "/?initial=register",
        permanent: false,
      },
      {
        source: "/dashboard",
        destination: "/?initial=dashboard",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
