---
layout: page
title: Install 
permalink: /documents/install/
---


There are several dependences of zimg you should build before using zimg. And the version of cmake should >= 2.8, libevent should >= 2.0, libmemcached should >= 1.0.18.

#### openssl

{% highlight Bash shell scripts %}
wget http://www.openssl.org/source/openssl-1.0.1g.tar.gz
tar zxvf  openssl-1.0.1g.tar.gz
./config shared --prefix=/usr/local --openssldir=/usr/ssl
make && make install 
{% endhighlight %}

#### cmake

{% highlight Bash shell scripts %}
wget http://www.cmake.org/files/v2.8/cmake-2.8.10.2.tar.gz
tar xzvf cmake-2.8.10.2.tar.gz 
cd cmake-2.8.10.2 
./bootstrap --prefix=/usr/local 
make && make install 
{% endhighlight %}

#### libevent

{% highlight Bash shell scripts %}
wget http://cloud.github.com/downloads/libevent/libevent/libevent-2.0.21-stable.tar.gz 
tar zxvf libevent-2.0.17-stable.tar.gz 
./configure --prefix=/usr/local 
make && make install 
{% endhighlight %}


#### libmemcached

{% highlight Bash shell scripts %}
wget https://launchpad.net/libmemcached/1.0/1.0.18/+download/libmemcached-1.0.18.tar.gz
tar zxvf libmemcached-1.0.18.tar.gz
cd libmemcached-1.0.18
./configure -prefix=/usr/local 
make &&　make install 
{% endhighlight %}

#### libjpeg

{% highlight Bash shell scripts %}
wget
{% endhighlight %}

#### libgif

{% highlight Bash shell scripts %}
wget
{% endhighlight %}

#### libpng

{% highlight Bash shell scripts %}
wget
{% endhighlight %}

#### memcached（optional）

{% highlight Bash shell scripts %}
wget http://www.memcached.org/files/memcached-1.4.19.tar.gz
tar zxvf memcached-1.4.19.tar.gz
cd memcached-1.4.19
./configure --prefix=/usr/local
make
make install
{% endhighlight %}

#### beansdb（optional）

{% highlight Bash shell scripts %}
git clone https://github.com/douban/beansdb
cd beansdb
./configure --prefix=/usr/local
make
{% endhighlight %}

#### benseye (optional)

{% highlight Bash shell scripts %}
git clone git@github.com:douban/beanseye.git
cd beanseye
make
{% endhighlight %}

#### SSDB（optional）

{% highlight Bash shell scripts %}
wget --no-check-certificate https://github.com/ideawu/ssdb/archive/master.zip
unzip master
cd ssdb-master
make
{% endhighlight %}

#### twemproxy（optional）

{% highlight Bash shell scripts %}
git clone git@github.com:twitter/twemproxy.git
cd twemproxy
autoreconf -fvi
./configure --enable-debug=log
make
src/nutcracker -h
{% endhighlight %}

#### zimg

Now you can build zimg itself. If you want to gdb zimg, you can use `make debug` option.

{% highlight Bash shell scripts %}
git clone https://github.com/buaazp/zimg -b master --depth=1
cd zimg   
make  
{% endhighlight %}
