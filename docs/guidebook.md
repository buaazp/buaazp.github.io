---
layout: page
title: GuideBook 
permalink: /documents/guidebook/
---

### 运行

在运行zimg之前，你需要按照[《Install文档》](/documents/install)的说明进行安装，zimg安装成功之后，如果需要启用缓存，你需要运行memcached；如果后端选择beansdb或SSDB，你需要按自己需要启动这些后端的一个或多个实例；如果需要使用twemproxy进行数据分片，可以使用以下配置文件启动：

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

```lua
--zimg server config

--server config
--是否后台运行
is_daemon=1
--绑定IP
ip='0.0.0.0'
--端口
port=4869
--运行线程数，默认值为服务器CPU数
--thread_num=4
backlog_num=1024
max_keepalives=1
retry=3
system=io.popen('uname -sn'):read('*l')
pwd=io.popen('pwd'):read('*l')

--header config
--返回所带的HTTP header
headers='Cache-Control:max-age=7776000'
--是否启用etag缓存
etag=1

--access config
--support mask rules like 'allow 10.1.121.138/24'
--NOTE: remove rule can improve performance
--上传接口的IP控制权限，将权限规则注释掉可以提升服务器处理能力，下同
--upload_rule='allow all'
--下载接口的IP控制权限
--download_rule='allow all'
--管理接口的IP控制权限
admin_rule='allow 127.0.0.1'

--cache config
--是否启用memcached缓存
cache=1
--缓存服务器IP
mc_ip='127.0.0.1'
--缓存服务器端口
mc_port=11211

--log config
--log_level output specified level of log to logfile
--[[
LOG_FATAL 0           System is unusable
LOG_ALERT 1           Action must be taken immediately
LOG_CRIT 2            Critical conditions
LOG_ERROR 3           Error conditions
LOG_WARNING 4         Warning conditions
LOG_NOTICE 5          Normal, but significant
LOG_INFO 6            Information
LOG_DEBUG 7           DEBUG message
]]
--输出log级别
log_level=6
--输出log路径
log_name= pwd .. '/log/zimg.log'

--htdoc config
--默认主页html文件路径
root_path= pwd .. '/www/index.html'
--admin页面html文件路径
admin_path= pwd .. '/www/admin.html'

--image process config
--禁用URL图片处理
disable_args=0
--禁用lua脚本图片处理
disable_type=0
--lua process script
--lua脚本文件路径
script_name= pwd .. '/script/process.lua'
--format value: 'none' for original or other format names
--默认保存新图的格式，字符串'none'表示以原有格式保存，或者是期望使用的格式名
format='jpeg'
--quality value: 1~100(default: 75)
--默认保存新图的质量
quality=75

--storage config
--zimg support 3 ways for storage images
--存储后端类型，1为本地存储，2为beansdb后端，3为SSDB后端
mode=1
--save_new value: 0.don't save any 1.save all 2.only save types in lua script
--新文件是否存储，0为不存储，1为全都存储，2为只存储lua脚本产生的新图
save_new=1
--上传图片大小限制，默认100MB
max_size=100*1024*1024

--mode[1]: local disk mode
--本地存储时的存储路径
img_path= pwd .. '/img'

--mode[2]: beansdb mode
--beansdb服务器IP
beansdb_ip='127.0.0.1'
--beansdb服务器端口
beansdb_port='7900'

--mode[3]: ssdb mode
--SSDB服务器IP
ssdb_ip='127.0.0.1'
--SSDB服务器端口
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

![](http://ww3.sinaimg.cn/large/4c422e03jw1ejoqiw2j25j20je0ddgmv.jpg)

上传成功之后会以HTML的格式返回该图片的MD5：

![](http://ww2.sinaimg.cn/large/4c422e03jw1ejoqm5ghm0j20nl0fb76x.jpg)

第二种是通过其他工具来发送POST请求上传图片，此上传请求分为form表单类型和raw-post类型，对于form表单上传，使用curl工具来上传时命令如下：

```bash
curl -F "blob=@testup.jpeg;type=image/jpeg" "http://127.0.0.1:4869/upload"
```
对于raw-post上传，使用curl工具命令如下：

```bash
curl -H "Content-Type:jpeg" --data-binary @testup.jpeg "http://127.0.0.1:4869/upload"
{"ret":true,"info":{"md5":"5f189d8ec57f5a5a0d3dcba47fa797e2","size":29615}}
```
可以看到，由于是直接上传raw-post，zimg要求客户端提供`Content-Type`这个Header，如果Content-Type不是以下四种图片类型上传请求将失败并返回错误：

```
{"jpeg", "gif", "png", "webp"}
```

目前返回结果将以json形式返回图片的MD5、size等信息，如果上传失败，结果中的`ret=false`，同时包含了具体的错误信息，客户端可根据错误原因进行统计和后续处理。

```json
{"ret":false,"error":{"code":0,"message":"Internal error."}}
{"ret":false,"error":{"code":1,"message":"File type not support."}}
{"ret":false,"error":{"code":2,"message":"Request method error."}}
{"ret":false,"error":{"code":3,"message":"Access error."}}
{"ret":false,"error":{"code":4,"message":"Request body parse error."}}
{"ret":false,"error":{"code":5,"message":"Content-Length error."}}
{"ret":false,"error":{"code":6,"message":"Content-Type error."}}
{"ret":false,"error":{"code":7,"message":"File too large."}}
```

#### 下载

上传成功之后就可以通过不同的参数来获取图片了：

```bash
http://127.0.0.1:4869/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300&h=300&g=1&x=0&y=0&r=45&q=85&f=jpeg
```

其组成格式为：
zimg服务器IP + 端口 / 图片MD5 （? + 长 + 宽 + 缩放方式 + 灰白化 + x + y + 旋转角度 + 压缩比 + 转换格式）

**注意：**URL + MD5这种不加任何参数的裸请求，获取到的并非原始图片，而是经过压缩后体积大幅度缩小的图片，如果你想获取原始图片需要在这个请求之后专门加一个`p=0`参数，如下：

```bash
http://127.0.0.1:4869/5f189d8ec57f5a5a0d3dcba47fa797e2?p=0
```

为了满足更加复杂的裁剪需求，上述参数可以更具你的需要进行组合，具体的作用可以参考以下这些示例。下面将以代码中附带的一张测试图片为例进行讲解，原图如下：

![](http://ww4.sinaimg.cn/large/4c422e03jw1ejk51hq0qzj208c0b5aad.jpg)

*注：此图已获得原作者檀琳娜本人授权作为zimg示例图片使用，除此之外任何人不得将此图进行修改和其他目的的传播，在此对她表示由衷的感谢*

地址：[http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2](http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2)

需求一：所有图片默认返回质量为75%，JPEG格式的压缩图片，这样肉眼无法识辨，但是体积减小

很简单，什么参数都不加的请求默认返回被压缩过的图片，大幅度降低流量。  
注意：有一些图片被这样处理过之后体积反而增大，这属于正常现象，这种现象更多出现在本身就很小的图片上，对于大部分用户产生的图片，默认的处理是会减小体积的。  
请求地址：http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2

需求二：获取宽度为300，被等比例缩放的图片

参数中只限定长或者宽其中一项，会隐式附带缩放参数`p=1`，图片会被等比例缩放，比如这个图片会被缩放为300*401像素。  
请求地址：http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300

需求三：获取大小为300*300的图片，由于与原图比例不同，尽可能展示最多的图片内容，缩放之后多余的部分需要裁掉

参数中同时提供长和宽，会隐式附带缩放参数`p=2`，此方式为对人类最舒适的定面积裁剪方式。处理过的图片如下：

![](http://ww4.sinaimg.cn/large/4c422e03jw1ejk50r088vj208c08c3yq.jpg)

请求地址：http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300&h=300

需求四：获取大小为300*300的图片，但是不需要缩放，只用展示图片核心内容即可

此需求其实是需要裁剪图片中央区域指定大小的内容，没有缩放过程，需要手动指定处理方式`p=3`，此方式为最能突出核心内容的定面积裁剪方式。处理过的图片如下：

![](http://ww1.sinaimg.cn/large/4c422e03jw1ejk58hof69j208c08ct93.jpg)

请求地址：http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300&h=300&p=3

需求五：获取大小为300*300的图片，要展示图片所有内容，因此图片会被拉伸到新的比例而变形

参数提供长和宽，同时手动指定处理方式`p=0`，此方式为最全图片内容的定面积裁剪方式，但是对人类来说最不友好，因此并不常用到。处理过的图片如下：

![](http://ww2.sinaimg.cn/large/4c422e03jw1ejk5cbakmjj208c08cweo.jpg)

请求地址：http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300&h=300&p=0

需求六：获取指定区域固定大小的图片

在某些应用场景下，你可能需要获取图片的指定区域内的内容，这时候需要在请求中指定该区域锚点的坐标`x=200&y=100`，同时指定所需区域大小`w=300&h=300`即可。处理过的图片如下：

![](http://ww2.sinaimg.cn/large/4c422e03jw1ejoqilrkblj208c08cglt.jpg)

请求地址：http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300&h=300&x=200&y=100

需求七：获取旋转后的图片

如果需要获得按指定角度旋转的图片，请求中增加`r=45`即可。处理过的图片如下：

![](http://ww2.sinaimg.cn/large/4c422e03jw1ek0yyg5f4uj20bu0bumxh.jpg)

请求地址：http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300&h=300&r=45

需求八：获取去除颜色的图片

如果需要获得灰白图片，请求中增加`g=1`即可。处理过的图片如下：

![](http://ww2.sinaimg.cn/large/4c422e03jw1ejk95omk1tj208c08cglq.jpg)

请求地址：http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300&h=300&g=1

需求九：获取指定压缩比的图片

默认75%的图片质量对于大多数图片来说没问题，但是少量图片来说可能会显得模糊，或者就是想要获取某个特定质量的图片，可以指定参数`q=80`，具体数值依实际情况而定。  
请求地址：http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300&h=300&q=80

需求十：获取指定格式的图片

如果需要转换为特定格式的图片，可以指定参数`f=webp`，具体的值为图片格式名，如jpeg, png, gif, webp等，不同格式的图片有不同的特性，其中jpeg格式浏览兼容性最好，webp格式图片体积最小。  
请求地址：http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300&h=300&f=jpeg

需求十一：获取图片信息

为了编程方便，你可能需要获取图片的部分信息，可以通过参数`info=1`来完成。  
请求地址：http://demo.buaa.us/info?md5=5f189d8ec57f5a5a0d3dcba47fa797e2

此接口获取到json格式的数据，内容如下：  

```json
{"ret":true,"info":{"size":29615,"width":640,"height":856,"quality":100,"format":"JPEG"}}
```

有了这个图片信息接口，你就可以通过计算来实现各种各样的处理需求，比如裁剪一半尺寸的图片，将图片切成九块等等等等，是不是很爽呢。

需求十二：删除指定图片

新增了图片管理接口admin页面，如下图所示：

![](http://ww2.sinaimg.cn/large/4c422e03jw1ejouwi75q7j20pi0fb3zo.jpg)

在admin接口下可以进行图片删除操作，具体的请求格式为：

http://127.0.0.1:4869/admin?md5=5f189d8ec57f5a5a0d3dcba47fa797e2&t=1

其中md5为要删除图片的md5，操作类型`t=1`为删除操作，目前的zimg admin中只有这一种管理接口，以后可能会加入统计、预览、审核等其他功能。删除操作成功之后如下所示：

![](http://ww3.sinaimg.cn/large/4c422e03jw1ejouwl4uejj20pi0fbq45.jpg)

为了安全起见，admin接口默认为限制只有本机可以访问，如果需要开放给公司内网中的某些IP访问，可以在配置文件中修改`admin_rule='allow 127.0.0.1'`的IP权限规则。

#### zimg-lua

zimg现在支持lua脚本来自定义请求处理方式，只要在配置文件里指定你自己的处理脚本，或者修改源码中自带的示例脚本，即可实现各种各样的处理需求。

为了支持zimg-lua，新增请求类型接口`t=mytype`，通过在请求中指定处理类型的名字，即可实现对应的处理操作。比如在自带的示例脚本`test.lua`中包括一个名叫test的处理方式，具体内容为：

```lua
    test = {
        cols                = 300,
        rows                = 300,
        quality             = 75,
        rotate              = 90,
        gray                = 1,
        format              = 'webp',
    },
```
它可以将图片转化为300*300，旋转90°，压缩率75%，灰白，格式为webp的图像。只需通过如下请求即可获得：  
http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?t=test

可以发现，lua脚本的支持对于已有固定处理方式的场景更加方便，比如你可以定义针对不同手机的格式ios7, android440, 或者不同尺寸的格式large, middle, square500 等等，随便你怎么设计，每种格式的处理方式都不同，你可以在lua中尽情发挥，就像在nginx里写ngx-lua一样爽。更多关于zimg-lua的使用方法请参考[《API of zimg-lua》](/documents/api_of_zimg_lua/)，相信你一看就会。

#### 图片存储规则

你可以在自己的APP或网页里嵌入自己需要的URL以获取不同的图片，不同分辨率的图片第一次拉取时会实时生成，之后就会从缓存或后端存储中获取，无需再次压缩。

为了满足更多用户的需求，zimg新增了一个`save_new`配置项来控制裁剪过的图片是否进行持久存储，默认开启。如果设置为1，则所有新计算生成的图片都会被存储下来以提高下次请求的速度；如果设置为2，则只有通过lua脚本处理生成的新图片会被存储；如果设置为0，则所有新图片都不会存储，每次都需要实时计算生成。

这样的设计是为了节约存储空间，避免大量没用的缩略图被存储而浪费空间。

#### 权限控制

由于zimg目前没有基于帐号的权限控制体系，某些应用场景下，你可能希望通过IP来限制上传和下载，你可以通过修改配置文件中access config部分来实现该功能。  
为了提高性能，默认配置文件中将这两行注释掉了，去掉注释并修改为你需要的规则即可。  

```lua
download_rule='allow all'
upload_rule='allow 127.0.0.1;deny all'
admin_rule='allow 127.0.0.1'
```

如果你有用过Nginx，那么上面的配置规则就非常熟悉了，你可以添加任意条数的规则，也可以使用子网掩码来控制IP范围，例如：

```lua
download_rule='allow 10.77.121.137;allow 10.72.30.100/24;allow 127.0.0.1;deny all'
upload_rule='allow 127.0.0.1;deny all'
```

如果不是必须，请注释掉访问规则以提高系统性能。

#### 客户端缓存控制

为了减少网络流量的传输，提高图片加载速度，zimg在v2.3版本中引入了客户端缓存控制功能，目前支持两种方式的缓存配置：Cache-Control和Etag，并且这两种方式可同时生效，互相不冲突。

如果对于HTTP标准中规定的浏览器缓存策略的具体内容不是很熟悉，建议读者查询相关文档，此处仅展示zimg中如何进行设置。

在zimg的配置文件中新增了以下两个配置项：

```lua
--localcache config
headers='Cache-Control:max-age=7776000'
etag=1
```

其中headers的作用是zimg服务器返回给客户端时需要附带的HTTP header信息，此处设置了Cache-Control之后浏览器就可以依据此信息来达到缓存图片的目的，max-age的值是图片缓存期限，单位是秒，默认为90天，你可根据自己的需要进行配置。

同理，如果你有其他header需要发给客户端进行交互，也可在此进行设置，比如：

```lua
headers='Allow-Format:jpeg/png/gif;Client-Version:1.0'
```

header配置数量并无限制，用`;`进行分割，唯一需要注意的是，zimg根据`;`和`:`来截取header的key和value，所以自定义header的key和value中都不能有这两个字符。

第二个配置项etag决定是否启用Etag header来控制浏览器缓存，开启此功能后，zimg返回给浏览器的图片中附带了Etag信息，当下一次浏览器发来图片请求时，如果该图片内容没有发生变化，则直接返回`304 Not Modified`给客户端，包体内不含任何数据，浏览器/客户端中仍然可以正确地展示该图片。图片内容是否发生变化无需再由开发者写代码来判断，直接使用即可。

对于不同的浏览器，处理Cache-Control的策略不尽相同，配合使用Etag之后，将大幅度地降低传输流量，

### 部署

zimg v3.0 的架构与 v2.0相比没有变化，由于加强了实时处理能力，大型图床服务可以采用同时启用多台zimg，前端引入LVS的方式来进行负载均衡，每一台zimg都是无状态的，它们可以同时配置相同的存储后端。具体的设计还要根据具体的需求和实际的压力情况进行调整，在此列出一个示意架构图作为示范：

![arch](http://ww2.sinaimg.cn/large/4c422e03jw1ejjdg5puouj20kf0modkf.jpg)


### 尾声
需要提醒的是，zimg并非稳定可靠的线上业务，它只适用于中小型的图床服务，由于众多新特性的引入，难免会有bug存在，如果你发现某些不符合预期的结果或者崩溃，请到github issue上进行提交，作者将会及时跟进解决。另外zimg源码并不复杂，如果你需要的功能zimg不支持，可以很轻易地进行修改使用。



