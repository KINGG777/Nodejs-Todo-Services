# === STAGE 1: Build Stage ===
FROM node:20-alpine AS builder

# 1. Define the build argument for the commit SHA (passed from CI/CD pipeline)
ARG COMMIT_SHA=unknown

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
# Install ALL dependencies (prod + dev) for testing
RUN npm install

# Copy all source code
COPY . .
# Run tests for build-time validation
RUN npm test

# === STAGE 2: Runtime Stage ===
FROM node:20-alpine AS runner

# Create a non-root user (using 1001 to avoid common conflicts)
RUN addgroup -g 1001 appgroup && adduser -u 1001 -G appgroup -s /bin/sh -D appuser
USER appuser
WORKDIR /app

# Copy production dependencies and source from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json .

# Set environment variables for the application
ENV NODE_ENV=production
ENV PORT=3000
# 2. Inject the COMMIT_SHA from the build argument into a runtime ENV variable
ENV COMMIT_SHA=${COMMIT_SHA}

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD [ "node", "src/index.js" ]
