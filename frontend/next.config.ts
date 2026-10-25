import type { NextConfig } from "next";

/**
 * En Vercel Services el enrutamiento público vive en `vercel.json`: `/api/*`
 * va directo al servicio `backend`, así que el frontend no necesita proxy.
 *
 * Este rewrite solo se activa en local/Replit, donde `BACKEND_URL` apunta al
 * API interno y el frontend es el único proceso publicado. No se debe usar un
 * binding de Vercel aquí: `next.config.ts` se evalúa en build time y los
 * bindings solo existen en runtime.
 */
const backendProxy = process.env.BACKEND_URL;

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    if (!backendProxy) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${backendProxy}/api/:path*`,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
