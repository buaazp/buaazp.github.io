---
layout: page
title: Install 
permalink: /documents/install/
---


There are several dependences of zimg you should build and install before using zimg. And the version of cmake should >= 2.8, libevent should >= 2.0, libmemcached should >= 1.0.18.

### Using Package Manage Tools

#### Mac OS X

If you are using Mac OS, building dependences through brew is easy.

```bash
brew install openssl cmake libevent libmemcached libjpeg giflib libpng
```

#### Linux

If you are using Ubuntu, CentOS or other Linux distributions, you can get the libraries through its package manage tool. 

*NOTE 1*: **But some of their packages are too old for zimg**. You may need to build them by source. 

For example, CentOS has low version of cmake, libevent and libmemcached.

*NOTE 2*: Because of the different naming rules, some of the Linux package manage tool use xxx-dev or xxx-devel as the development package name. You may need to install these packages to build zimg.

For example, in CentOS you need install:

```bash
sudo yum install openssl-devel cmake libevent-devel libmemcached-devel libjpeg-devel giflib-devel libpng-devel
```

While in Ubuntu you need install these packages:

```bash
sudo apt-get install openssl cmake libevent-dev libmemcached-dev libjpeg-dev libgif-dev libpng-dev
```

If you ensure the dependence packages are fit for zimg, goto [zimg build](/documents/install/#build-zimg) section.

### Build Dependences by Source Code

#### openssl

```bash
wget http://www.openssl.org/source/openssl-1.0.1g.tar.gz
tar zxvf  openssl-1.0.1g.tar.gz
./config shared --prefix=/usr/local --openssldir=/usr/ssl
make && make install 
```

#### cmake

```bash
wget http://www.cmake.org/files/v2.8/cmake-2.8.10.2.tar.gz
tar xzvf cmake-2.8.10.2.tar.gz 
cd cmake-2.8.10.2 
./bootstrap --prefix=/usr/local 
make && make install 
```

#### libevent

```bash
wget http://cloud.github.com/downloads/libevent/libevent/libevent-2.0.21-stable.tar.gz 
tar zxvf libevent-2.0.17-stable.tar.gz 
./configure --prefix=/usr/local 
make && make install 
```

#### libmemcached

```bash
wget https://launchpad.net/libmemcached/1.0/1.0.18/+download/libmemcached-1.0.18.tar.gz
tar zxvf libmemcached-1.0.18.tar.gz
cd libmemcached-1.0.18
./configure -prefix=/usr/local 
make &&　make install 
```

#### libjpeg-turbo ( recommend )

To build libjpeg-turbo you must install nasm first.

```bash
wget https://downloads.sourceforge.net/project/libjpeg-turbo/1.3.1/libjpeg-turbo-1.3.1.tar.gz
tar zxvf libjpeg-turbo-1.3.1.tar.gz
cd libjpeg-turbo-1.3.1
./configure --prefix=/usr/local --with-jpeg8
make && make install
```

#### libjpeg, giflib and libpng

Just using your system package. Source code build is unnecessary.

### Build zimg

#### zimg

Now you can build zimg itself. If you want to gdb zimg, you can use `make debug` option.

```bash
git clone https://github.com/buaazp/zimg -b master --depth=1
cd zimg   
make  
```

If you want to enable cache to improve performance, or you want to store the images to a distributed storage backend, the softwares below is optional.

### Build Optional Storage Backends

#### memcached ( optional )

```bash
wget http://www.memcached.org/files/memcached-1.4.19.tar.gz
tar zxvf memcached-1.4.19.tar.gz
cd memcached-1.4.19
./configure --prefix=/usr/local
make
make install
```

#### beansdb ( optional )

```bash
git clone https://github.com/douban/beansdb
cd beansdb
./configure --prefix=/usr/local
make
```

#### benseye ( optional )

```bash
git clone git@github.com:douban/beanseye.git
cd beanseye
make
```

#### SSDB ( optional )

```bash
wget --no-check-certificate https://github.com/ideawu/ssdb/archive/master.zip
unzip master
cd ssdb-master
make
```

#### twemproxy ( optional ) 

```bash
git clone git@github.com:twitter/twemproxy.git
cd twemproxy
autoreconf -fvi
./configure --enable-debug=log
make
src/nutcracker -h
```


