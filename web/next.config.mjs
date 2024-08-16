/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/wikipedia-browser",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
