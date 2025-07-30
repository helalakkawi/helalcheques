/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export', // مهم لعمل export كملفات ثابتة
  basePath: '/cheque-system', // اسم الريبو
  assetPrefix: isProd ? '/cheque-system/' : '',
  trailingSlash: true, // يضيف / في نهاية الروابط
};

export default nextConfig;
