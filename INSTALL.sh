

#!/bin/bash

# make temp dir
echo "Making temporary directory './tmp'. You can delete it after the installation."
mkdir -p tmp
cd ./tmp

# ------------------------------------------------------------------------------
# Python stuff
# ------------------------------------------------------------------------------
# Get python
echo "Getting the necessary serverside tools (Python et all)"
wget https://www.python.org/ftp/python/3.6.4/Python-3.6.4.tar.xz


# Build python
echo "Compiling python"
tar xf Python-3.6.4.tar.xz
cd ./Python-3.6.4
./configure --enable-optimizations --enable-loadable-sqlite-extensions
make -j

# Create virtual env
echo "Creating virtual environment"
./python -m venv ../../env
cd ../..
source ./env/bin/activate

# Install python modules
echo "Upgrading pip and setuptools"
pip install --upgrade pip setuptools
echo "Installing python modules"
pip install pyramid waitress peewee websocket-client git+https://github.com/dpallot/simple-websocket-server.git

# init db
echo "Initializing database"
cd ./app_server
mkdir db
touch db/data.db
rm db/data.db && python models.py


# ------------------------------------------------------------------------------
# Node stuff *(commented out, unless you need to rebuild the client)
# ------------------------------------------------------------------------------
# get nvm
# wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash

# #install node stuff
# echo "Installing node server"
# source ~/.nvm/nvm.sh
# nvm install 9
