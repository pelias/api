#!/usr/bin/env bash

set -ex

sudo apt-get update -q
sudo apt-get install ruby-full
wget https://opscode-omnibus-packages.s3.amazonaws.com/ubuntu/12.04/x86_64/chefdk_0.6.2-1_amd64.deb
sudo dpkg -i chefdk_0.6.2-1_amd64.deb
sudo apt-get install -q virtualbox --fix-missing
wget https://dl.bintray.com/mitchellh/vagrant/vagrant_1.7.2_x86_64.deb
sudo dpkg -i vagrant_1.7.2_x86_64.deb
git clone https://github.com/pelias/vagrant.git
git clone https://github.com/pelias/acceptance-tests.git

ls
echo ${PWD}

export PELIAS_VAGRANT_CFG=${PWD}/ci/pelias_settings.rb
cd ./vagrant
vagrant up
cd ../acceptance-tests
node test -e local -t dev