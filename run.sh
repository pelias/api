#!/bin/bash

#workaround for azure DNS issue

if [ "$EUID" -eq 0 ]
  then echo "search marathon.l4lb.thisdcos.directory" >> /etc/resolv.conf
fi

#start pelias api
npm start
