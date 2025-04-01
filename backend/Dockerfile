# Use Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Expose Medusa's default port
EXPOSE 9000

# Use environment variables
ENV NODE_ENV=production
ENV REDIS_URL=redis://<user>:<pswd>@<host>:<port>
ENV DATABASE_URL=postgres://<user>@<host>/<database>
ENV STRIPE_API_KEY=<stripe-api-key>

ENV JWT_SECRET=<jwt-secret>
ENV COOKIE_SECRET=<cookie-secret>

ENV STORE_CORS=<store-cors>
ENV ADMIN_CORS=<admin-cors>
ENV AUTH_CORS=<auth-cors>

ENV DISABLE_MEDUSA_ADMIN=false
ENV MEDUSA_WORKER_MODE=shared
ENV PORT=9000

ENV MEDUSA_ADMIN_ONBOARDING_TYPE=<medusa-admin-onboarding-type>
ENV MEDUSA_ADMIN_ONBOARDING_NEXTJS_DIRECTORY=<medusa-admin-onboarding-nextjs-directory>

ENV SENDGRID_API_KEY=<sendgrid-api-key>
ENV SENDGRID_FROM=<sendgrid-from>
ENV SENDGRID_ORDER_PLACED_ID=<sendgrid-order-placed-id>

# Start Medusa
CMD ["npm", "run", "start"]
