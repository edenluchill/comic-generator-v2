// 优化 Next.js 配置
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const nextConfig: NextConfig = {
  // 性能优化配置
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },

  // 指定服务器专用包，防止打包到客户端 (新的配置位置)
  serverExternalPackages: ["openai", "@google-cloud/translate", "tsx"],

  // Turbopack 配置
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
    // 添加Google头像域名
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/a/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/d/**",
      },
      {
        protocol: "https",
        hostname: "jtdhkrlmaaknbmisoxde.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // 性能预算和包分离
  webpack: (config, { dev, isServer }) => {
    // 客户端构建时忽略服务器专用包
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        os: false,
        path: false,
      };
    }

    // 生产环境优化
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          // 分离 Supabase 和其他大型库
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: "supabase",
            priority: 15,
            reuseExistingChunk: true,
          },
          // 分离 React 相关
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-redux|@reduxjs)[\\/]/,
            name: "react",
            priority: 20,
            reuseExistingChunk: true,
          },
          // 分离国际化相关
          intl: {
            test: /[\\/]node_modules[\\/](next-intl|@tanstack)[\\/]/,
            name: "intl",
            priority: 12,
            reuseExistingChunk: true,
          },
          // 通用第三方库
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: 10,
            reuseExistingChunk: true,
          },
          // 通用代码
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
