server {
    server_name realnexor.com www.realnexor.com;

    root /var/www/realnexor.com;
    index index.html;

    location /uploads/ {
    alias /var/www/realnexor-backend/uploads/;
    }

    location / {
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000; # Aquí corre tu backend
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/realnexor.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/realnexor.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot


}
server {
    if ($host = www.realnexor.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = realnexor.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name realnexor.com www.realnexor.com;
    return 404; # managed by Certbot




}


