#!/bin/bash
cd app_client
yarn build
rsync -rav --progress www/assets ../app_server/.
cp www/index.html ../app_server/assets/.
echo 'Done!'
