---
layout: page
title: GuideBook 
permalink: /documents/guidebook/
---

### 运行

在运行zimg之前，你需要按照[ install ](/documents/install)文档的说明进行安装，zimg安装成功之后，如果需要启用缓存，你需要运行memcached；如果后端选择beansdb或SSDB，你需要按自己需要启动这些后端的一个或多个实例；如果需要使用twemproxy进行数据分片，可以使用以下配置文件启动：

```bash
beansdb:
  listen: 127.0.0.1:22121
  hash: fnv1a_64
  distribution: ketama
  timeout: 400
  backlog: 1024
  preconnect: true
  auto_eject_hosts: true
  server_retry_timeout: 2000
  server_failure_limit: 3
  servers:
   - 127.0.0.1:7900:1 beansdb1
   - 127.0.0.1:7901:1 beansdb2

ssdb:
  listen: 127.0.0.1:22122
  hash: fnv1a_64
  distribution: ketama
  redis: true
  timeout: 400
  backlog: 1024
  preconnect: true
  auto_eject_hosts: true
  server_retry_timeout: 2000
  server_failure_limit: 3
  servers:
   - 127.0.0.1:6380:1 ssdb1
   - 127.0.0.1:6381:1 ssdb2
```

zimg本身的所有选项都在配置文件中进行配置，你可以根据自己的需要修改配置文件：

```bash
--zimg server config

--server config
is_daemon=1
port=4869
thread_num=4
backlog_num=1024
max_keepalives=1
retry=3
system=io.popen("uname -s"):read("*l")

--localcache config
headers="Cache-Control:max-age=7776000"
etag=1

--access config
--support mask rules like "allow 10.1.121.138/24"
--NOTE: remove rule can improve performance
upload_rule="allow 127.0.0.1;deny all"
download_rule="allow all"

--cache config
cache=0
mc_ip='127.0.0.1'
mc_port=11211

--log config
log=1
log_name='./log/zimg.log'

--htdoc config
root_path='./www/index.html'

--storage config
--zimg support 3 ways for storage images
mode=1
save_new=1

--mode[1]: local disk mode
img_path='./img'

--mode[2]: beansdb mode
beansdb_ip='127.0.0.1'
beansdb_port='7900'

--mode[3]: ssdb mode
ssdb_ip='127.0.0.1'
ssdb_port='8888'
```

然后启动zimg：

```bash
cd bin  
./zimg conf/zimg.lua
```

### 使用

#### 上传

zimg启动之后就可以开始上传和下载图片了，上传方式有两种：

第一种是通过浏览器上传，启动zimg后的默认地址就是一个简单的图片上传页：

```bash
http://127.0.0.1:4869/
```

大约是这个样子的：

![index.html](http://ww4.sinaimg.cn/large/4c422e03gw1egm25nxf4yj20hg08lmxt.jpg)

上传成功之后会以HTML的格式返回该图片的MD5：

![upload_succ](http://ww2.sinaimg.cn/large/4c422e03gw1egm259ewj8j20qq08lmyp.jpg)

第二种是通过其他工具来发送POST请求上传图片，注意此上传请求是form表单类型，比如使用curl工具来上传时命令如下：

```bash
curl -F "blob=@testup.jpeg;type=image/jpeg" "http://127.0.0.1:4869/upload"
```

#### 下载

上传成功之后就可以通过不同的参数来获取图片了：

```bash
http://127.0.0.1:4869/1f08c55a7ca155565f638b5a61e99a3e
http://127.0.0.1:4869/1f08c55a7ca155565f638b5a61e99a3e?p=0
http://127.0.0.1:4869/1f08c55a7ca155565f638b5a61e99a3e?w=500
http://127.0.0.1:4869/1f08c55a7ca155565f638b5a61e99a3e?w=500&h=300
http://127.0.0.1:4869/1f08c55a7ca155565f638b5a61e99a3e?w=500&h=300&p=0
http://127.0.0.1:4869/1f08c55a7ca155565f638b5a61e99a3e?w=500&h=300&p=1&g=1
```

其组成格式为：
zimg服务器IP + 端口 / 图片MD5 （? + 长 + 宽 + 等比例 + 灰化）

**注意：**URL + MD5这种不加任何参数的裸请求，获取到的并非原始图片，而是经过压缩后体积大幅度缩小的图片，如果你想获取原始图片需要在这个请求之后专门加一个`p=0`参数，如下：

```bash
http://127.0.0.1:4869/1f08c55a7ca155565f638b5a61e99a3e?p=0
```

你可以在自己的APP或网页里嵌入自己需要的URL以获取不同的图片，不同分辨率的图片第一次拉取时会实时生成，之后就会从缓存或后端存储中获取，无需再次压缩。

为了满足更多用户的需求，zimg新增了一个`save_new`配置项来控制裁剪过的图片是否进行持久存储，默认开启。如果设置`save_new=1`开启了此功能，对于通过参数裁剪产生的新图片将存储于你选择的后端中，提高下次访问的速度，同时降低服务器的运算压力，但是会导致存储容量增大，这是一个典型的空间换时间的问题，是否启用可依据具体业务需求决定。

#### 权限控制

由于zimg目前没有基于帐号的权限控制体系，某些应用场景下，你可能希望通过IP来限制上传和下载，你可以通过修改配置文件中access config部分来实现该功能。  
为了提高性能，默认配置文件中将这两行注释掉了，去掉注释并修改为你需要的规则即可。  

```bash
download_rule="allow all"
upload_rule="allow 127.0.0.1;deny all"
```

如果你有用过Nginx，那么上面的配置规则就非常熟悉了，你可以添加任意条数的规则，也可以使用子网掩码来控制IP范围，例如：

```bash
download_rule="allow 10.77.121.137;allow 10.72.30.100/24;allow 127.0.0.1;deny all"
upload_rule="allow 127.0.0.1;deny all"
```

如果不是必须，请注释掉访问规则以提高系统性能。

#### 客户端缓存控制

为了减少网络流量的传输，提高图片加载速度，zimg在v2.3版本中引入了客户端缓存控制功能，目前支持两种方式的缓存配置：Cache-Control和Etag，并且这两种方式可同时生效，互相不冲突。

如果对于HTTP标准中规定的浏览器缓存策略的具体内容不是很熟悉，建议读者查询相关文档，此处仅展示zimg中如何进行设置。

在zimg的配置文件中新增了以下两个配置项：

```bash
--localcache config
headers="Cache-Control:max-age=7776000"
etag=1
```

其中headers的作用是zimg服务器返回给客户端时需要附带的HTTP header信息，此处设置了Cache-Control之后浏览器就可以依据此信息来达到缓存图片的目的，max-age的值是图片缓存期限，单位是秒，默认为90天，你可根据自己的需要进行配置。

同理，如果你有其他header需要发给客户端进行交互，也可在此进行设置，比如：

```bash
headers="Allow-Format:jpeg/png/gif;Client-Version:1.0"
```

header配置数量并无限制，用`;`进行分割，唯一需要注意的是，zimg根据`;`和`:`来截取header的key和value，所以自定义header的key和value中都不能有这两个字符。

第二个配置项etag决定是否启用Etag header来控制浏览器缓存，开启此功能后，zimg返回给浏览器的图片中附带了Etag信息，当下一次浏览器发来图片请求时，如果该图片内容没有发生变化，则直接返回`304 Not Modified`给客户端，包体内不含任何数据，浏览器/客户端中仍然可以正确地展示该图片。图片内容是否发生变化无需再由开发者写代码来判断，直接使用即可。

对于不同的浏览器，处理Cache-Control的策略不尽相同，配合使用Etag之后，将大幅度地降低传输流量，


### 尾声
需要提醒的是，zimg并没有经过大型线上应用的检验，更不是微博图床所采用的方案，它只适用于小型的图床服务，难免会有bug存在。不过源码并不复杂，如果你需要的功能zimg不支持，可以很轻易地进行修改使用。



