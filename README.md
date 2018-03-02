# Faker Trader

Faker Treader is a toy investing tool created for amusement and exploration of technology.
It is not connected to any exchange, nor does it actually trade anything. It generates fake price for fake crypto currency **COIN** data. The fake data might change later, as algorithm for it is crude and plain bad.


## Installation
##### Via install script:
If you are using a recent Linux system, the install script should do everything.
You do - however - need basic development tools and some standard unix utilities. If you decide to run INSTALL.sh your python and all needed libraries will be downloaded and compiled for you in a virtual environment right inside this directory. If you decide to erase the project, everything will be contained in this directory.

I have purposefully left out all Node related stuff for client development. There is a preassembled version of client served right from the python app. No need to run node.

**TL;DR**

So basically you need:
- C compiler and related build utils (build-essential on Ubuntu)
- wget (for fetching the pyton)
- bash (standard shell)
- some time, as creating a virtual env takes some time

Then run:
```bash
./INSTALL.sh
```
...and have a coffee.

##### Manually:
Take a look at INSTALL.sh and feel free to execute any of the needed lines by hand.
If you have come this far, you know what you are doing.


## Running

This should be even simpler.
```bash
./FAKER.sh
```
Alternatively, you can always go to the app directory and run it manually:

```bash
source env/bin/activate
cd app_server
PYTHONPATH=./ python main.py

```

## Fine print

* SQLite3 is rather sub-optimal for this type of operation. A proper way would be to store generated price data into a key-value store
* The chart is missing. I have yet to implement it.
* There is no spread on trades.
* Margin calls are not accurate.
* Price can go into negative *(yes, that's how bad the algorithm is)
* there are quirks and kinks all over the place (4 days of work for the entire project)
* I am searching for a good job. (this was intentional).

##### Licencing information:
This software carries a [MIT](https://opensource.org/licenses/MIT) License.  
You can reach the author at *toni[at]formalibre.si*.