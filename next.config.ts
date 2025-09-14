// 优化 Next.js 配置
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: true, // 启用 CSS 优化
    optimizeServerReact: true, // 启用服务器 React 优化
    // 启用并行路由处理
    parallelServerBuildTraces: true,
    webpackBuildWorker: true,
    // 启用更快的页面切换
    scrollRestoration: true,
    // 启用预渲染优化
    ppr: false, // 部分预渲染
  },

  // 保留单一的turbopack配置
  turbopack: {
    rules: {
      "*.svg": ["@svgr/webpack"],
    },
  },

  // 生产环境路由优化
  ...(process.env.NODE_ENV === "production" && {
    // 启用更激进的静态优化
    trailingSlash: false,
    // 预编译常用路由
    async rewrites() {
      return [
        {
          source: "/:locale(en|zh|ja|ko)",
          destination: "/:locale",
        },
        {
          source: "/:locale(en|zh|ja|ko)/workshop",
          destination: "/:locale/workshop",
        },
        {
          source: "/:locale(en|zh|ja|ko)/pricing",
          destination: "/:locale/pricing",
        },
      ];
    },
  }),

  // 指定服务器专用包，防止打包到客户端 (新的配置位置)
  serverExternalPackages: [
    "openai",
    "@google-cloud/translate",
    "tsx",
    "@supabase/supabase-js",
  ],

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
          // 更精细的分离 TanStack Query
          tanstack: {
            test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
            name: "tanstack",
            priority: 25,
            reuseExistingChunk: true,
          },
          // 分离 Radix UI 组件
          radix: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: "radix",
            priority: 22,
            reuseExistingChunk: true,
          },
          // 分离 Supabase
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: "supabase",
            priority: 15,
            reuseExistingChunk: true,
          },
          // 分离图标库
          icons: {
            test: /[\\/]node_modules[\\/](lucide-react|react-icons)[\\/]/,
            name: "icons",
            priority: 18,
            reuseExistingChunk: true,
          },
          // 分离国际化
          intl: {
            test: /[\\/]node_modules[\\/]next-intl[\\/]/,
            name: "intl",
            priority: 12,
            reuseExistingChunk: true,
          },
          // React 相关
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: "react",
            priority: 30,
            reuseExistingChunk: true,
          },
          // 通用第三方库
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: 10,
            reuseExistingChunk: true,
          },
          // 分离 OpenAI (如果用在客户端)
          openai: {
            test: /[\\/]node_modules[\\/]openai[\\/]/,
            name: "openai",
            priority: 24,
            reuseExistingChunk: true,
          },

          // 分离工具库
          utils: {
            test: /[\\/]node_modules[\\/](clsx|class-variance-authority|tailwind-merge)[\\/]/,
            name: "utils",
            priority: 16,
            reuseExistingChunk: true,
          },

          // 分离 Next.js 相关
          next: {
            test: /[\\/]node_modules[\\/]next[\\/]/,
            name: "next",
            priority: 28,
            reuseExistingChunk: true,
          },
        },
      };

      // 添加性能预算警告
      config.performance = {
        maxAssetSize: 200000, // 200KB
        maxEntrypointSize: 400000, // 400KB
        hints: "warning",
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
