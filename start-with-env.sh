#!/bin/bash

# Environment variables for Next.js application
export DATABASE_URL="postgresql://uchi_user:uchi_secure_2025@localhost:5432/uchinokiroku?schema=public"
export NEXTAUTH_URL="https://uchinokiroku.com"
export NEXTAUTH_SECRET="nextauth_production_secret_2025_secure_key_uchi"
export GOOGLE_CLIENT_ID="[MASKED_FOR_SECURITY]"
export GOOGLE_CLIENT_SECRET="[MASKED_FOR_SECURITY]"
export LINE_CHANNEL_ID="2007898798"
export LINE_CHANNEL_SECRET="51b66feb55b7c3e1ab99c5e046957f59"
export EMAIL_SERVER_HOST="smtp.gmail.com"
export EMAIL_SERVER_PORT="587"
export EMAIL_SERVER_USER="belong2jazz@gmail.com"
export EMAIL_SERVER_PASSWORD="tnus etsj pbfh sqnv"
export EMAIL_FROM="belong2jazz@gmail.com"
export NEXT_PUBLIC_SITE_PASSWORD="きぼう"

echo "🚀 Starting Next.js with environment variables..."
echo "🔍 DATABASE_URL: ${DATABASE_URL}"
echo "🔗 NEXTAUTH_URL: ${NEXTAUTH_URL}"

# Change to application directory
cd /var/www/uchi

# Start Next.js production server (if build exists, otherwise dev)
if [ -d ".next" ]; then
  echo "🏭 Starting production server..."
  npm run start
else
  echo "📦 No build found, starting development server..."
  npm run dev
fi