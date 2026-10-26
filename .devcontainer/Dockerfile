FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm@sha256:7c2e711a4f7b02f32d2da16192d5e05aa7c95279be4ce889cff5df316f251c1d

WORKDIR /workspace

# Copy package files from repo root (requires context: ".." in devcontainer.json)
COPY package*.json ./

# Install dependencies during prebuild
RUN npm install

# Set working directory for when the codespace starts
