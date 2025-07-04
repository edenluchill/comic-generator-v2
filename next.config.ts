// 优化 Next.js 配置
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const nextConfig: NextConfig = {
  // 性能优化配置
  experimental: {
    optimizeServerReact: true,
  },

  // Turbopack 配置 (替代 experimental.turbo)
  turbopack: {
    rules: {
      "*.svg": ["@svgr/webpack"],
    },
  },

  // 编译优化
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // 静态优化
  trailingSlash: false,

  // 构建优化
  poweredByHeader: false,
  reactStrictMode: true,

  // 图片优化
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 性能预算
  webpack: (config, { dev, isServer }) => {
    // 生产环境优化
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: 10,
            reuseExistingChunk: true,
          },
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },

  // 启用 gzip 压缩
  compress: true,

  // 优化页面数据获取
  pageExtensions: ["tsx", "ts", "jsx", "js"],
};

export default withNextIntl(nextConfig);
