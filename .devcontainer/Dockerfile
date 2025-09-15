FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

WORKDIR /workspace

# Copy package files from repo root (requires context: ".." in devcontainer.json)
COPY package*.json ./

# Install dependencies during prebuild
RUN npm install

# Set working directory for when the codespace starts
