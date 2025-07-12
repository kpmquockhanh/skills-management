# multiple-tool-vue

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Nginx config
```
server {
    listen      80;    
    server_name _;
    charset utf-8;
    root    /PATH;
    index   index.html;
    #Always serve index.html for any request
    location / {
        root /PATH;
        try_files $uri  /index.html;
    }    
    error_log  /var/log/nginx/vue-app-error.log;
    access_log /var/log/nginx/vue-app-access.log;
}


server {
    listen 443 ssl;
    server_name _;
    ssl_certificate PATH;
    ssl_certificate_key PATH;
    charset utf-8;
    root    /PATH;
    index   index.html;
    #Always serve index.html for any request
    location / {
        root /PATH;
        try_files $uri  /index.html;
    }
    error_log  /var/log/nginx/vue-app-error.log;
    access_log /var/log/nginx/vue-app-access.log;
}
```
# multiple-tool-vue3
