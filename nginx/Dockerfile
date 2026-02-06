FROM nginx:1.25-alpine

# Instalar dependencias para compilar ModSecurity v3
RUN apk add --no-cache --virtual .build-deps \
    g++ \
    gcc \
    make \
    libc-dev \
    pcre-dev \
    zlib-dev \
    curl-dev \
    libxml2-dev \
    libtool \
    autoconf \
    automake \
    git \
    linux-headers \
    yajl-dev \
    geoip-dev \
    libmaxminddb-dev \
    libstdc++ \
    openssl-dev \
    pkgconf \
    && apk add --no-cache \
    pcre \
    zlib \
    curl \
    libxml2 \
    yajl \
    geoip \
    libmaxminddb \
    openssl \
    pkgconf \
    libstdc++

# Compilar ModSecurity v3
WORKDIR /tmp
RUN git clone --depth 1 -b v3.0.11 --single-branch https://github.com/SpiderLabs/ModSecurity.git modsecurity \
    && cd modsecurity \
    && git submodule update --init --recursive \
    && ./build.sh \
    && ./configure \
    && make -j$(nproc) \
    && make install

# Compilar ModSecurity-Nginx connector
RUN git clone --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git modsecurity-nginx \
    && cd modsecurity-nginx \
    && git submodule update --init

# Descargar y compilar Nginx con módulo ModSecurity
RUN NGINX_VERSION=$(nginx -v 2>&1 | sed -n 's/.*nginx version: nginx\///p') \
    && wget http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz \
    && tar -xzf nginx-${NGINX_VERSION}.tar.gz \
    && cd nginx-${NGINX_VERSION} \
    && ./configure --with-compat --add-dynamic-module=../modsecurity-nginx \
    && make modules \
    && cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules/ \
    && cd .. \
    && rm -rf nginx-${NGINX_VERSION}* modsecurity modsecurity-nginx

# Descargar OWASP Core Rule Set
RUN mkdir -p /etc/nginx/crs /etc/nginx/modsecurity \
    && git clone --depth 1 -b v3.3.5 https://github.com/coreruleset/coreruleset.git /tmp/crs \
    && cp -r /tmp/crs/rules /etc/nginx/crs/ \
    && cp /tmp/crs/crs-setup.conf.example /etc/nginx/crs/crs-setup.conf \
    && find /etc/nginx/crs/rules -type f -name "*.conf" | sort | sed 's#^#Include #' > /etc/nginx/modsecurity/crs-rules.conf \
    && rm -rf /tmp/crs

# Limpiar dependencias de compilación
RUN apk del .build-deps

# Crear directorios necesarios
RUN mkdir -p /var/log/nginx \
    /var/log/nginx/modsec \
    /etc/nginx/modsecurity \
    /etc/nginx/ssl

WORKDIR /etc/nginx

# Copiar configuración
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/
COPY modsecurity/ /etc/nginx/modsecurity/

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
