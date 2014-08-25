---
layout: page
title: Design of zimg New Generation 
permalink: /documents/design_of_zimg_new_generation/
---

## 综述

经过几个月的开发，zimg的新版本终于要发布了。在1.0解决了理念问题，2.0解决了存储问题之后，3.0版本里将要解决的是计算问题。可以说这次升级对全部已有的核心业务分支进行了重写，同时增加了新的业务分支，无论是功能上还是性能上都是巨大的提升。如果以前的zimg只能算是一个玩具的话，那么从3.0开始，它终于算是完整可用了。

在开始之前我要介绍一下zimg是做什么的，方便之前没有听说过的朋友理解。一句话说，**zimg是一个具有图片处理功能的图片存储服务**，你可以上传图片到zimg服务器，然后通过带有参数的URL来获取被处理过的图片。比如下面的连接获取到一张被缩放到500*500，颜色变成灰白，图片质量为75%，格式转化成jpeg的图片：

[http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=500&h=500&p=2&g=1&q=75](
http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=500&h=500&p=2&g=1&q=75)

如果你有多个客户端，或者在网站上有多个位置需要展示不同分辨率，不同质量的图片，那么这样的图片存储服务器对于前端来说将是非常方便的，不仅减少工作量，更重要的是可以降低网络传输的流量，提高页面加载速度。通常，图片的存储和处理是分开的，裁剪和压缩部分一般由PHP调用图片处理库来完成，一个字形容就是慢。zimg从网络I/O、HTTP解析、图片压缩到数据存储，全部用c完成，而且在这个过程中尽可能的避免文件操作和内存拷贝，使得整体处理能力极高。更加详细的内容可以参考我之前写的文档：[《高性能图片服务器浅谈》](http://127.0.0.1:4000/documents/Architecture_Design_of_Image_Server/)。

## 新功能

新版本带来了大量的新特性，下面将一一进行介绍。

### 更全面的处理接口

之前的版本里，参数只有图片长、宽和颜色，而且同时指定长宽之后图片会被拉伸变形，这些问题在新版本中全部得到解决。下面将以代码中附带的一张测试图片为例进行讲解，原图如下：

![](http://ww4.sinaimg.cn/large/4c422e03jw1ejk51hq0qzj208c0b5aad.jpg)

*注：此图已获得原作者檀琳娜本人授权作为zimg示例图片使用，除此之外任何人不得将此图进行修改和其他目的的传播，在此对她表示由衷的感谢*

地址：[http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2](http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2)

#### 需求一：所有图片默认返回质量为75%，JPEG格式的压缩图片，这样肉眼无法识辨，但是体积减小

很简单，什么参数都不加的请求默认返回被压缩过的图片，大幅度降低流量。  
注意：有一些图片被这样处理过之后体积反而增大，这属于正常现象，这种现象更多出现在本身就很小的图片上，对于大部分用户产生的图片，默认的处理是会减小体积的。  
请求地址：http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2

#### 需求二：获取宽度为300，被等比例缩放的图片

参数中限定长或者宽其中一项，图片会被等比例缩放，比如这个图片会被缩放为300*401像素。  
请求地址：http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300

#### 需求三：获取大小为300*300的图片，由于与原图比例不同，尽可能展示最多的图片内容，缩放之后多余的部分需要裁掉

参数中提供长和宽，同时指定处理方式`p=2`，此方式为对人类最舒适的定面积裁剪方式。处理过的图片如下：

![](http://ww4.sinaimg.cn/large/4c422e03jw1ejk50r088vj208c08c3yq.jpg)

请求地址：http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300&h=300&p=2

#### 需求四：获取大小为300*300的图片，但是不需要缩放，只用展示图片核心内容即可

此需求其实是需要裁剪图片中央区域指定大小的内容，没有缩放过程，需要指定处理方式`p=3`，此方式为最能突出核心内容的定面积裁剪方式。处理过的图片如下：

![](http://ww1.sinaimg.cn/large/4c422e03jw1ejk58hof69j208c08ct93.jpg)

请求地址：http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300&h=300&p=3

#### 需求五：获取大小为300*300的图片，要展示图片所有内容，因此图片会被拉伸到新的比例而变形

参数提供长和宽，同时指定处理方式`p=0`，此方式为最全图片内容的定面积裁剪方式，但是对人类来说最不友好，因此并不常用到。处理过的图片如下：

![](http://ww2.sinaimg.cn/large/4c422e03jw1ejk5cbakmjj208c08cweo.jpg)

请求地址：http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300&h=300&p=0

#### 需求六：获取指定区域固定大小的图片

在某些应用场景下，你可能需要获取图片的指定区域内的内容，这时候需要在请求中指定该区域锚点的坐标`x=200&y=100`，同时指定所需区域大小`w=300&h=300`即可。处理过的图片如下：

![](http://ww2.sinaimg.cn/large/4c422e03jw1ejoqilrkblj208c08cglt.jpg)

请求地址：http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300&h=300&x=200&y=100

#### 需求七：获取去除颜色的图片

如果需要获得灰白图片，请求中增加`g=1`即可。处理过的图片如下：

![](http://ww2.sinaimg.cn/large/4c422e03jw1ejk95omk1tj208c08cglq.jpg)

请求地址：http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300&h=300&p=2&g=1

#### 需求八：获取指定压缩比的图片

默认75%的图片质量对于大多数图片来说没问题，但是少量图片来说可能会显得模糊，或者就是想要获取某个特定质量的图片，可以指定参数`q=80`，具体数值依实际情况而定。  
请求地址：http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=500&h=500&p=2&q=80

#### 需求九：获取图片信息

为了编程方便，你可能需要获取图片的部分信息，可以通过参数`info=1`来完成。  
请求地址：http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?info=1

此接口获取到json格式的数据，内容如下：  

```json
{"ret":true,"info":{"size":29615,"width":640,"height":856,"quality":100,"format":"JPEG"}}
```

有了这个图片信息接口，你就可以通过计算来实现各种各样的处理需求，比如裁剪一半尺寸的图片，将图片切成九块等等等等，是不是很爽呢。

#### 需求十：删除指定图片

新增了图片管理接口admin页面，如下图所示：

![](http://ww2.sinaimg.cn/large/4c422e03jw1ejouwi75q7j20pi0fb3zo.jpg)

在admin接口下可以进行图片删除操作，具体的请求格式为：

http://127.0.0.1:4869/admin?md5=5f189d8ec57f5a5a0d3dcba47fa797e2&t=1

其中md5为要删除图片的md5，操作类型`t=1`为删除操作，目前的zimg admin中只有这一种管理接口，以后可能会加入统计、预览、审核等其他功能。删除操作成功之后如下所示：

![](http://ww3.sinaimg.cn/large/4c422e03jw1ejouwl4uejj20pi0fbq45.jpg)

为了安全起见，admin接口默认为限制只有本机可以访问，如果需要开放给公司内网中的某些IP访问，可以在配置文件中修改`admin_rule='allow 127.0.0.1'`的IP权限规则。

#### 总结

以上就是新版本改进的请求接口，目前的设计已经可以满足大部分需求，如果您在使用中，或者在随后的统计中发现某些别的需求，也可以通知我进行增加。但是，如果继续阅读下面的部分，我相信你的自定义需求都可以自己实现。


### 杀手锏！zimg-lua

这是3.0版本第二个重大改进，zimg现在支持lua脚本来自定义请求处理方式，只要在配置文件里指定你自己的处理脚本，或者修改源码中自带的示例脚本，即可实现无限的可能。

为了支持zimg-lua，新增请求类型接口`t=mytype`，通过在请求中指定处理类型的名字，即可实现对应的处理操作。比如在自带的示例脚本`test.lua`中包括一个名叫test的处理方式，具体内容为：

```lua
    test100 = {
        cols                = 100,
        rows                = 100,
        quality             = 75,
        gray                = 1,
        format              = 'WEBP',
    },
```
它可以将图片转化为100*100，压缩比75%，灰白，格式为webp的图像。只需通过如下请求即可获得：  
http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?t=test

可以发现，lua脚本的支持对于已有固定处理方式的场景更加方便，比如你可以定义针对不同手机的格式ios7, android440, 或者不同尺寸的格式large, middle, square500 等等，随便你怎么设计，每种格式的处理方式都不同，你可以在lua中尽情发挥，就像在nginx里写ngx-lua一样爽。更多关于zimg-lua的使用方法请参考[《API of zimg-lua》](/documents/api_of_zimg_lua/)，相信你一看就会。

这时候有的同学可能会问了，你这zimg本来不就是为了更快才做的吗，你用lua肯定会慢啊，那我何不直接采用ngx-lua来实现呢？  
答案是，一点都不慢。  
zimg-lua的设计有以下特点：  
第一，所有zimg接口都是由c模块实现的，在zimg-lua中调用相应的操作实际上还是由编译好的c代码来执行的，仅仅会增加**调用和lua运算**这个过程的消耗而已。  
第二，zimg-lua中关于lua解析和编译的部分用的是LuaJIT，它可以将脚本中lua运算部分进行编译，提高速度。  
第三，zimg-lua是多线程，每个zimg线程中维护一个lua栈，避免相应的锁操作。  
第四，也是最核心的一点，跟ngx-lua完全不同的地方在于，zimg-lua中**不存在大数据拷贝过程**，所有进入zimg-lua处理阶段的请求，图片数据本身是不需要拷贝给lua层的，仅有的数据通信是图片信息如长宽、格式等，这种通信只需要传递若干个数字或者字符串而已，消耗极小。

总而言之，zimg-lua使用起来和zimg几乎是一样快的，在后面的测试中你将会看到，这种差距在 1% 左右。  
由于是新增的功能，难免会有一些不足之处，希望大家广泛试用并进行反馈。


### 核武器！webimg

想必在图片处理领域，imagemagick之类的开源处理库是占据了绝对的统治地位，在之前的版本中，zimg也一直依靠imagemagick来进行图片处理，但是这个库有很多问题，用过的人都说不好。最大的问题在于它并不是面向web应用而设计的，更多是用于桌面软件使用，在并发、I/O和内存等方面捉襟见肘。新浪微博的图片处理以前也用的是imagemagick，在踩过一系列奇葩的坑之后，我们实在无法忍受，切换到了自主研发的网络图片处理库webimg。

webimg是新浪公司开发的轻量级web图片处理库，由我的领导[@马健将](http://weibo.com/stupid)大牛开发完成，目前用于处理新浪微博产生的海量图片，相比于imagemagick它更小，更快，更高效。zimg获得授权使用webimg某个旧版本的部分代码，仅包括了一些基础的功能，更多关于webimg的信息和最新的代码还要等webimg开源之后才能获得。下面将结合测试数据进行介绍。

分别对zimg v2.2和v3.0进行测试，测试的主要目的是对比imagemagick和webimg在纯粹图片处理方面的性能。由于zimg v2.2版本的设计思路是**用存储来减少运算**，所以新产生的图片会存储下来，我改动了其中关于保存图片部分的代码，使得两个版本的zimg对所有请求都不进行存储，强制实时计算生成。

测试依然是对上面的示例图片进行，测试设备为我自己的台式机（2011年的配置，4核心8线程），采用的工具是wrk，测试命令如下：

```bash
wrk -v -c10 -t8 -d30s "http://127.0.0.1:4869/5f189d8ec57f5a5a0d3dcba47fa797e2?w=100&h=100&g=1"
```

经过多次测试之后，采用webimg的zimg v3.0成绩远远超过使用imagemagick的zimg v2.2版本，每秒处理图片数达到旧版本的1700%，提升幅度之大让人大跌眼镜：

![](http://ww1.sinaimg.cn/large/4c422e03jw1ejk9vqmt5ej20f0061mxp.jpg)

同时从第三行的数据也可以看出，使用zimg-lua来处理图片与原始处理旗鼓相当，同样遥遥领先于基于imagemagick的版本。更详细的测试数据请参考[《Benchmark of zimg v3.0》](/documents/benchmark_v3/)。


虽然这个测试针对的是一幅并不复杂的jpeg图片，也不能代表线上业务的实际处理水平，但是不管怎么说，上千张每秒的成绩已经非常之高了，这应该是业界第一个单机秒处理能力上千的图片服务器了吧。信息来源有限，如果你们公司或你所用的类似服务能够超过这个测试数据，还请留言告知我删除本段。

除了处理速度大幅度提升之外，内存占用也显著下降。另一个特点是使用imagemagick时CPU无法打满，应该是这个库自己有很多阻塞操作导致，而使用webimg时CPU可以用到80%左右，这也是新版本速度快的根本原因。纯压图过程是CPU密集型任务，更高的CPU主频和更多的物理核心将会带来线性的性能提升，你可以通过手动指定zimg线程数来测试具体的数据。

### 全新的上传逻辑

之前的版本中，上传图片一直是用`multipart/form`的形式由浏览器进行上传，而且这个form 表单的解析逻辑是我参考PHP源码自行实现的，代码丑陋，兼容性差，而且每次只能支持一个文件的上传。这个历史遗留问题一直是我心头的痛，在3.0版本中，终于彻底解决了它。

![](http://ww3.sinaimg.cn/large/4c422e03jw1ejoqiw2j25j20je0ddgmv.jpg)

如上图所示，新的上传界面中你可以一次选择任意多个文件进行上传，每个文件都会被单独处理并存储。全新的解析模块采用了回调函数式的处理方式，整个body解析过程中不再有字符串查找这种落后的方式，解析过程大幅度提速，如果想深入了解可以参考代码中的相关实现。多个文件上传成功之后的结果页面如下：

![](http://ww2.sinaimg.cn/large/4c422e03jw1ejoqm5ghm0j20nl0fb76x.jpg)

当然了，这个默认的上传和结果页仅仅是为了展示作用，对于编程来说非常不友好，你在自己的产品中基本用不到而且更多是感觉不方便，已经有很多朋友反馈说从结果中提取出MD5非常麻烦，那么，今天我要很高兴的告诉大家，上传图片支持json格式返回了。

对编程更加方便的上传方式是`HTTP binary POST`而非`HTTP form POST`，因此你将可以使用更加轻松的HTTP POST库来完成上传操作，在此我将使用curl来进行演示：

```bash
curl -H "Content-Type:jpeg" --data-binary @testup.jpeg "http://127.0.0.1:4869/upload"

{"ret":true,"info":{"md5":"5f189d8ec57f5a5a0d3dcba47fa797e2","size":29615}}
```

可以看到，由于是直接上传binary-data，zimg要求客户端提供`Content-Type`这个Header，如果Content-Type不是以下四种图片类型上传请求将失败并返回错误：

```
{"jpeg", "gif", "png", "webp"}
```

目前返回结果将以json形式返回图片的MD5、size等信息，如果上传失败，结果中的`ret=false`，同时包含了具体的错误信息，客户端可根据错误原因进行统计和后续处理。

```
{"ret":false,"error":{"code":0,"message":"Internal error."}}
{"ret":false,"error":{"code":1,"message":"File type not support."}}
{"ret":false,"error":{"code":2,"message":"Request method error."}}
{"ret":false,"error":{"code":3,"message":"Access error."}}
{"ret":false,"error":{"code":4,"message":"Request body parse error."}}
{"ret":false,"error":{"code":5,"message":"Content-Length error."}}
{"ret":false,"error":{"code":6,"message":"Content-Type error."}}
{"ret":false,"error":{"code":7,"message":"File too large."}}
```

### 缓存控制

为了减少网络流量的传输，提高图片加载速度，zimg在新版本中引入了客户端缓存控制功能，目前支持两种方式的缓存配置：Cache-Control和Etag，并且这两种方式可同时生效，互相不冲突。

如果对于HTTP标准中规定的浏览器缓存策略的具体内容不是很熟悉，建议读者查询相关文档，此处仅展示zimg中如何进行设置。

在zimg的配置文件中新增了以下两个配置项：

```
--localcache config
headers='Cache-Control:max-age=7776000'
etag=1
```

其中headers的作用是zimg服务器返回给客户端时需要附带的HTTP header信息，此处设置了Cache-Control之后浏览器就可以依据此信息来达到缓存图片的目的，max-age的值是图片缓存期限，单位是秒，默认为90天，你可根据自己的需要进行配置。

同理，如果你有其他header需要发给客户端进行交互，也可在此进行设置，比如：

```
headers='Allowed-Format:jpeg/png/gif;Client-Version:1.0'
```
header配置数量并无限制，用`;`进行分割，唯一需要注意的是，zimg根据`;`和`:`来截取header的key和value，所以自定义header的key和value中都不能有这两个字符。

第二个配置项etag决定是否启用Etag header来控制浏览器缓存，开启此功能后，zimg返回给浏览器的图片中附带了Etag信息，当下一次浏览器发来图片请求时，如果该图片内容没有发生变化，则直接返回`304 Not Modified`给客户端，包体内不含任何数据，浏览器/客户端中仍然可以正确地展示该图片。图片内容是否发生变化无需再由开发者写代码来判断，直接使用即可。

对于不同的浏览器，处理Cache-Control的策略不尽相同，配合使用Etag之后，将大幅度地降低传输流量。

### 更加完善的配置选项

结合之前的用户反馈和我自己的想法，在新版本中配置文件可配置的选项更加丰富，使用起来也将更加顺手。完整的配置文件如下：

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
--format value: 0.keep intact 1.JPEG 2.webp
--默认保存新图的格式，0为原始格式，1为jpeg格式，2为webp格式
format=1
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

#### save\_new

如果说2.0版本的思想是**用存储换时间**的话，那么3.0版本变成了**用计算换时间**，当然这一切的基础是webimg强大的计算能力。基于这样的思路，新的配置项中引入了`save_new`选项，如果设置为1，则所有新计算生成的图片都会被存储下来以提高下次请求的速度；如果设置为2，则只有通过lua脚本处理生成的新图片会被存储；如果设置为0，则所有新图片都不会存储，每次都需要实时计算生成。

这样的设计是为了节约存储空间，避免大量没用的缩略图被存储而浪费空间。

#### ip

允许配置`ip`来指定zimg所绑定的IP，用于某些内网流量控制。

#### log\_level

通过设置`log_level`的值可以控制日志文件中要记录的日志级别，具体级别的意义见配置文件的注释。

#### script\_name

配置用户自定义的zimg-lua脚本路径。

#### disable\_args && disable\_type

在某些特殊情况下，你可能希望禁止用户直接通过URL参数来调用图片处理接口，而只想要开放`t=type`这种接口来提供已经定义好的几种处理类型，从而避免被恶意发送请求导致服务器负载过高，正常请求响应过慢的攻击行为。设置`disable_args=1`将实现这个需求，同理，设置`disable_type=1`将禁止通过zimg-lua来处理图片。

#### format

`format`选项用来设置默认返回的图片格式，其值设为0则保存为原始格式，设为1则默认保存为jpeg，设置为2则默认保存为webp。

***需要特别注意的是***：webimg目前无法转换图片格式为png图片，如果原图为png格式，同时你设置了`format=0`的话，那么事实上你获得的被裁剪过的图片为jpeg格式，而不是所期望的png格式。这个问题需要等待webimg后续升级之后来解决。

#### quality

图片质量选项`quality`用来设置默认转换后的图片质量，这个只是个普遍设置，针对特别图片的质量也可以用URL中的参数来控制，而且参数的优先级高于默认选项。

#### max\_size

`max_size`选项用来定义上传文件的最大体积，默认100M，如果上传请求中的`Content-Length`大于这个值，则会返回上传失败给客户端。

### 架构图

zimg v3.0 的架构与 v2.0相比没有变化，由于加强了实时处理能力，大型图床服务可以采用同时启用多台zimg，前端引入LVS的方式来进行负载均衡，每一台zimg都是无状态的，它们可以同时配置相同的存储后端。具体的设计还要根据具体的需求和实际的压力情况进行调整，在此列出一个示意架构图作为示范：

![arch](http://ww2.sinaimg.cn/large/4c422e03jw1ejjdg5puouj20kf0modkf.jpg)

## 后续计划

目前zimg所用到的设计思路基本上是我们新浪微博图床用过的，过时的思路，也就是说，微博图床的设计是大幅度领先于zimg的，将来在微博图床上实验过了的功能，将有可能加入到zimg中来，供中小型用户使用。目前来看可能会包括以下内容：

- 任务队列：目前的图片处理是同步的，请求来了才进行处理，这个过程可以改为后台自动进行，图片上传之后就进入处理队列，处理的目标是lua脚本中设定好的那些，等请求到来时，新图片已经是处理好的。
- GPU压图：从我们目前的测试成绩来看，GPU压图明显快于CPU，如果压图是瓶颈，还是希望通过显卡来处理这些任务，但是这一块要做的事情还很多。
- 更好的webimg：由于webimg暂时没有开源，zimg中使用的webimg只是其相对落后的版本，特性也很少，后续可以加强这一块的功能。

## 其他

去年8月1号下午zimg发布，所以我非常希望新版本能在一周年的时候发出来，而且代码也确实在7月底就基本写完了，谁知道刚好赶上了我们上线微博视频项目，连续干了一周多，写代码写得我想吐，根本没有精力来完成新版本的文档，结果就搁置了。

后来又看到项目主页简陋不堪，索性重做了主页并完善文档，不知不觉竟用了一个月的时间。现在想来这几个月真是不堪回首，经常是十点回到先躺一会，十二点起来开始搞一直搞到三四点，头发都要掉光了简直。不过好在也都完成了，之前挖的坑，现在已经一一填上；github issue上提的需求，现在已全部实现。