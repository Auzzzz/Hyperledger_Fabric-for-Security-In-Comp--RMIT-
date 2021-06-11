# Setup Hyperledger Fabric for Authority & Bank networks
this instructions are from the Hyperledger walkthrough of Hyperledger 2.2 (https://github.com/samlinux/htsc/tree/master/meetup-061020)
These steps describes a HLF 2.2.x installation on a DigitalOcean Droplet.

## Perparations
The following steps are required to prepare the Droplet.
```bash
# update the OS
apt update && apt upgrade -y

# install some useful helpers
apt install tree jq gcc make -y

# So we can tell the correct time and date as the server is in the cloud
timedatectl set-timezone Australia/Melbourne

# check the time
date
```

## Install Docker
The following steps are required to install docker on the Droplet. Reference: https://docs.docker.com/engine/install/ubuntu/

```bash
# set up the repository
sudo apt install \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg-agent \
  software-properties-common -y

# add Docker’s official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -


# set up the stable repository
sudo add-apt-repository \
  "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) \
  stable"

# install docker engine
apt update -y
apt install docker-ce docker-ce-cli containerd.io -y

# check the docker version
docker --version
```

## Install Docker-Compose

Reference https://docs.docker.com/compose/install/

```bash
# install docker-compose
curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# apply executable permissions to the binary
sudo chmod +x /usr/local/bin/docker-compose

# check the docker-compose version
docker-compose --version
```

## Install Go Programming Language
Hyperledger Fabric uses the Go Programming Language for many of its components. Go version 1.14.x is required.

```bash 
# download and extract go
# latest version 04.10.20 1.14.9
wget -c https://dl.google.com/go/go1.14.9.linux-amd64.tar.gz -O - | tar -xz -C /usr/local

# add the go binary to the path
echo 'export PATH="$PATH:/usr/local/go/bin:/root/fabric-samples/bin"' >> $HOME/.profile

# point the GOPATH env var to the base fabric workspace folder
echo 'export GOPATH="$HOME"' >> $HOME/.profile

# reload the profile
source $HOME/.profile

# check the go version
go version

# check the vars
printenv | grep PATH
```

## Install node.js

```bash
# add PPA from NodeSource
curl -sL https://deb.nodesource.com/setup_12.x -o nodesource_setup.sh

# call the install script
. nodesource_setup.sh

# install node.js
apt-get install -y nodejs

# check the version
node -v

sudo apt-get install build-essential -y
sudo npm install -g node-gyp
```

## Install Samples, Binaries and Docker Images

```bash
mkdir fabric
cd fabric

# install the latest production release from the 1.4.x branch
# curl -sSL http://bit.ly/2ysbOFE | bash -s -- <fabric_version> <fabric-ca_version> <thirdparty_version>

# curl -sSL http://bit.ly/2ysbOFE | bash -s -- 1.4.6 1.4.6 0.4.18

# latest production ready release, omit all version identifiers
curl -sSL https://bit.ly/2ysbOFE | bash -s

# we use 2.2 in our examples
#curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.2.1 1.4.9

# check downloaded images
docker images

# check the bin cmd
peer version

```

## Start the Authority chaincode
for the simplicty of using the folder structure allready provided by hyperledger fabric samples, place the 'authority' folder located in the chaincode folder into /root/fabric/fabric-samples/chaincode

Add the authority folder into /root/fabric/fabric-samples

```bash

cd fabric-samples/authority

chmod +rwx startFabric.sh 
chmod +rwx networkDown.sh 

./startFabric.sh

```

From here the application will build itself, load up all docker instences and go through a test run of the program

Install node, then run enrollAdmin & registerUser

```bash

cd javascript/
npm install
node enrollAdmin.js
node registerUser.js

```

To test eveything works 

```bash
node query.js
```

## Start the Bank chaincode
for the simplicty of using the folder structure all ready provided by hyperledger fabric samples, place the 'bank' folder located in the chaincode folder into /root/fabric/fabric-samples/chaincode

Add the authority folder into /root/fabric/fabric-samples

```bash

cd fabric/fabric-samples/bank

chmod +rwx startFabric.sh 
chmod +rwx networkDown.sh 

./startFabric.sh

```

From here the application will build itself, load up all docker instences and go through a test run of the program

Install node, then run enrollAdmin & registerUser

```bash

cd javascript/
npm install
node enrollAdmin.js
node registerUser.js

```

To test eveything works 

```bash
node query.js
```

## API Setup

To setup the API to connect to the Authority Ledger and allow access from outside of the network

```bash
cd ~
mkdir api && cd api/

```

We will need to copy some files from the Authority Ledger we just made
    - Our application identity (authority/javascript/wallet/appUser.js)
    - the node package (authority/javascript/package.json)
    - our connection file (test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json)

the api folder should look like
    |_apiserver.js
    |_connection-org1.json
    |_package.json
    |_/wallet
      |_appUser.js


With the IP of the server we need to add in the direction for api to find the peers

```bash

nano /etc/hosts

IP orderer.example.com
IP peer0.org1.example.com
IP peer0.org2.example.com

```


Install node requiremnets then create run the server

```bash

npm install
npm install express body-parser --save

node api_server

```




