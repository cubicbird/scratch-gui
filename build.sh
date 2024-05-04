set NODE_ENV=production
export NODE_ENV=production
export NODE_OPTIONS=--openssl-legacy-provider
npm run build
rm build.zip
zip -r build.zip build

