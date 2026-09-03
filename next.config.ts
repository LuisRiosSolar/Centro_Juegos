import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Generates a minimal self-contained server image for Docker.
	output: "standalone",
};

export default nextConfig;
