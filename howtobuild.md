git clone https://github.com/kolins-cz/openstuder-gateway-webui.git
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 16
nvm use 16
npm run start
npm run build
copy build/* to /var/www
