FROM debian:bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl git unzip xz-utils \
  && rm -rf /var/lib/apt/lists/*
# Pinned to the local SDK version; prebuilt Flutter images lag behind it.
RUN git clone --depth 1 -b 3.47.8 https://github.com/flutter/flutter.git /flutter
ENV PATH="/flutter/bin:$PATH"
RUN flutter config --no-analytics --enable-web && flutter precache --web

WORKDIR /app
COPY pubspec.yaml pubspec.lock ./
RUN flutter pub get
COPY . .
# Baked in at compile time; the browser calls the API directly.
ARG API_URL=http://localhost:4000/graphql
RUN flutter build web --release --dart-define=API_URL=$API_URL

FROM nginx:alpine
COPY --from=build /app/build/web /usr/share/nginx/html
