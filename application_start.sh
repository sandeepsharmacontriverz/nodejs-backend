#!/bin/bash
set -e
export PATH="/root/.nvm/versions/node/v18.19.0/bin:$PATH"
cd /root/Rice-Backend

npm install
npm run build
pm2 delete 0 || true
pm2 start npm --name "backend" -- start

service apache2 restart
