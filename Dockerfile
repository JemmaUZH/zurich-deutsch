# 阶段一：构建前端
FROM node:22-slim AS client-build
WORKDIR /app
COPY client/package.json client/package-lock.json ./client/
RUN cd client && npm ci
COPY client/ ./client/
RUN cd client && npm run build

# 阶段二：运行后端（同时托管前端构建产物）
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev
COPY server/ ./server/
COPY --from=client-build /app/client/dist ./client/dist
WORKDIR /app/server
EXPOSE 4000
CMD ["node", "src/index.js"]
