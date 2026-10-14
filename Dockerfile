# ==========================================
# Stage 1: Build the Vite Frontend Client
# ==========================================
FROM node:20-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# ==========================================
# Stage 2: Production Server Runner
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

# Install server dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production

# Copy server application files
COPY server/ ./

# Copy compiled frontend client from Stage 1 into /app/client/dist
COPY --from=client-builder /app/client/dist /app/client/dist

EXPOSE 8000

CMD ["node", "index.js"]
