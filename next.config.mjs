/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Çevre değişkenlerini burada tanımlayın
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_KEY,
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  },

  async redirects() {
    return [
      {
        source: '/settings',
        destination: '/settings/profile-settings',
        permanent: true,
      },
    ];
  },

  webpack: (config) => {
    // svgr
    config.module.rules.push({
      test: /\.svg$/i,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            typescript: true,
            icon: true,
            dimensions: false,
            // removeAttributes: {}
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig;
