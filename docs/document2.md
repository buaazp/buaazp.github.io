---
layout: page
title: Distributed_Image_Storage_Server_zimg
permalink: /documents/Distributed_Image_Storage_Server_zimg/
---

# zimg新版本发布，支持分布式存储

#### Distributed Image Storage Server: zimg

[@招牌疯子](http://weibo.com/buaazp)

## 关于zimg
[zimg](http://zimg.buaa.us/)是我去年开源的一个图片存储程序，主要的优点是可以根据请求实时处理图片，并且进行压缩和存储，一是方便前端用户，二来降低流量。zimg设计之初就是面向中小型应用，是存储量小于TB级别的单机存储方案。它的1.0版本主要竞争对手是基于Nginx+PHP的图片服务器，因为采用了特殊的策略，zimg会比PHP快出很多。  
然而由于移动设备普及等原因，对图片服务器的存储能力提出了更高的要求，不仅需要支持更大的容量，还要具备冗余备份等功能。我也一直在寻找解决办法，希望使zimg满足大家的需求。  

更新：增加介绍zimg使用手册  
[http://zimg.buaa.us/guidebook.html](http://zimg.buaa.us/guidebook.html)

## 分布式存储
无论硬盘多么廉价，单机存储容量总是会有上限的，现在可能连一个中小网站所需要的图片都存不下了。分布式存储将数据分布存储于多台服务器上，一台不够了再加一台，理论上讲存储容量是无上限的。而且提高了存储服务的可靠性，如果机器够多，存储都做了冗余，那么即使某些机器出现故障无法服务，也可以方便地切换到备用服务器上，保证整体服务可用。  
更高级别的分布式存储是跨IDC的，要实现这样的分布式，不是写一两个程序就可以完成的。像微博图床这种量级的存储，涉及服务器几千台，由多层架构组成，虽然看起来很是高大上，但其实并不适用于中小企业和开发者，或者说我们也不需要这样复杂的架构来存储几百GB的数据。  

## 战斗吧，新版本！
接下来介绍一下zimg 2.0的存储方案，看它有何新特性，以及是如何实现分布式存储的。  
### beansdb
在去年1.0刚发布之后，就有同学给我推荐支持豆瓣的[beansdb](https://github.com/douban/beansdb)，因为beansdb本身就是豆瓣用来存图片的，在线上服务中经过了检验，我也去调研了一番，但是发现他们的分布式策略是用一个又慢又简陋的python脚本来实现的，经过这层proxy之后处理能力只有可怜的几十QPS，这样的性能跟zimg上千的图片处理能力相比实在太鸡肋，于是一度将beansdb放在了考虑范围之外。  
后来机缘巧合，看到了采用go语言写的beansdb代理程序[beanseye](https://github.com/douban/beanseye)，虽然不具备分布式功能，但可以用来做replication，因为我个人对go语言的喜爱，立刻跑起来进行测试，发现这层代理性能还不错，值得一用。再加上beansdb底层所采用Bitcask引擎，确实是非常适合用来做图片的持久存储，这些原因促使我开始重新考虑是否采用beansdb来作为存储后端。  
> Bitcask最大的特点是将全部内容的索引存于内存中，数据存于硬盘上，而且数据只追加不删除，使得数据一直是顺序存储的，具有减少磁盘碎片，降低磁头寻址时间（大量写入时）等优点。  
> 而且beansdb对bitcask的key进行了改进，使得单机存储容量大幅度提高，即使是一台只有8G内存的服务器，也可以存储80TB的图片（平均大小200K）。关于bitcask的内容可以参阅beansdb作者的博文：[《beansdb 卷土重来》](http://www.douban.com/note/122507891/)  

zimg增加beansdb后端是很容易的，因为它采用的是memcached协议，而zimg第一版就支持memcached做cache。如果你希望采用beansdb做后端来存储图片，建议启用两台beansdb服务器做存储，再起一个beanseye做replication，这样数据会同时写入所有存储机上，实现了主从备份，即使一台挂掉beanseye也会自动从其他存储机上获取数据。  
### SSDB
[SSDB](https://github.com/ideawu/ssdb)也是一款能持久存储数据的NoSQL数据库，支持的是Redis协议，它的优点是既有丰富数据类型的支持，也能高效的存储（底层采用[LevelDB](https://code.google.com/p/leveldb/)甚至是[rocksdb](https://github.com/facebook/rocksdb)做存储引擎），对于zimg来说，其实只需要用到set和get两个命令，更多的是对它的存储和在线备份功能的期待。  
> 根据我的简单了解，与bitcask引擎不同，leveldb并不是将所有的key都放在内存中，而是采用多级level的方式进行存储，为了提高内存的利用率，部分热数据会存在内存里，也会极大地提高性能。  

在SSDB支持备份功能后我也曾引入到zimg上进行了简单的测试，发现读取性能跟硬盘存储相近，也是十分值得一用。  
### 如何选择
Beansdb和SSDB不仅分别代表了memcached协议和Redis协议，也代表了两种完全不同的底层存储方案，都能极大地利用内存和磁盘，都有主从备份功能，到底谁优谁劣实在难以分辨。于是我对他们进行了测试，希望通过数据来表现各自的能力，进行最终的抉择。  
> 关于测试工具  
> 要对图片服务器这种东西进行测试，一直也没有好用的工具，以前我一直使用ab进行性能测试，但是它的缺陷是请求单一，只能代表极限状态，不能很好地还原实际应用场景。  
> 为此我在Vegeta的基础上写了一个自己的压测工具[stress](https://github.com/buaazp/stress)，stress不仅可以像ab那样对单个请求进行高并发压力测试，也可以读取一个请求序列文件，随机选择其中的请求进行发送，它支持GET和POST方式，自定义header，设定并发和请求数等，同时结果输出也很nice。你可以在一个文件中写入类似下面这些格式的请求进行测试： 
>  
> ```
> GET http://127.0.0.1:4869/a87665d54a8c0dcaab04fa88b323eba1?w=200&g=1  
> ```  
> ```
> POST http://127.0.0.1:4869/upload form:5f189.jpeg  
> ```  
> 因此stress可以用来做功能、性能、压力和稳定性测试，目前还在开发中，本文中涉及的测试进行时尚未使用，后续增加更多好用的功能。

【第一次简陋的测试】测试在一台服务器上进行，由于图片服务是一种读请求远远大于写请求的特殊存储服务，我的测试就只进行高并发读取，测试结果如下图所示：  

![zimg_storage_mode_test](http://ww1.sinaimg.cn/large/4c422e03tw1efpkuhy2p0j20or0jmwg6.jpg)  

【第二次测试】由于第一次测试样本太小，毕竟选择后端这样重要的事情需要慎重，于是我又进行了一次更加详细的测试，这次测试光是ab执行次数就达到了330次之多，整理统计这些数据都花费了相当长的时间。测试详细情况见[测试报告](http://blog.buaa.us/benchmark-of-zimg-v2/)，此处只贴出关键数据图：  

![qps](http://ww1.sinaimg.cn/large/4c422e03tw1efvtggyr4pj216k0vitec.jpg)

根据上述测试结果显示，本地存储性能最好，SSDB略优于beansdb，但差别微乎其微，考虑到他们各有自己的优点，于是我最终决定：  
**zimg同时支持beansdb和SSDB**。   
同时支持多种存储模式的另一个优点是适用性广，因为同时支持了memcached协议和Redis协议，你可以采用其他任何用得顺手的存储后端，比如[Memcachedb](http://memcachedb.org/)、甚至是Redis本身，**以及谁能知道将来会不会又出现其他更加优秀的存储呢**。  
直接存取磁盘的模式也没有移除，方便那些只想用一台起了zimg的单机做图片服务器的朋友们。  
### 数据分片
确定了存储后端之后，其实已经拥有了replication的能力，zimg急需具备数据水平分片的功能。Memcached和Redis协议，数据分片，这些需求放在一起之后有没有觉得很眼熟，没错，如果你的服务中有用到过这两款NoSQL数据库，你肯定也曾想办法解决过它们的分片问题，那么最简单的方案就出来了：twemproxy。  
[Twemproxy](https://github.com/twitter/twemproxy)是Twitter出的memcached和redis代理，支持数据分片，而且还受到过redis作者本人的赞扬，可见其设计的独到之处。我觉得即使是自己在zimg里写一套分片逻辑，也肯定没有twemproxy性能好。twemproxy使用非常方便，参照zimg包内自带的[样例配置](https://github.com/buaazp/zimg/blob/master/test/zimg.yml)简单修改之后就可以使用。  
> 需要注意的是，twemproxy不支持memcached的binary protocol，[详情在此](https://github.com/twitter/twemproxy/blob/master/notes/memcache.txt)，因此zimg连接beansdb时默认不使用二进制协议，如果你不需要数据分片，可以简单修改源码来启用。  

由于引入了twemproxy，毕竟是多了一层代理，虽然有人说它最多只会比裸连慢20%，但本着实事求是的原则，我们还是要亲自测试一下才能知道，于是我又做了相关的测试，twemproxy后面各带两个beansdb和SSDB实例，测试结果如图所示：  

![twemproxy_test](http://ww4.sinaimg.cn/large/4c422e03tw1efpkuiq5dpj20lh0jigms.jpg)  

图中结果是三次测试的平均值，可以看到，无论是beansdb还是SSDB，加了twemproxy性能下降极小，直接可以忽略不计。因此我非常建议各位用户在zimg和后端存储之间引入twemproxy代理。
### 架构
zimg v2的部署力求简单，最佳的方案是zimg和后端存储分开在不同的机器上，因为zimg涉及压图，属于计算密集型，存储层无论是beansdb还是SSDB，都属于I/O密集型，而且由于zimg可以启用memcached做缓存，正好也可以充分利用机器上的内存，而存储机上的内存会被beansdb和SSDB用到，互不影响同时也不会浪费。那么一图胜千言，请看：  

![architecture_of_zimg_v2](http://ww2.sinaimg.cn/large/4c422e03gw1efpmngazc0j21ik1e6dnk.jpg)

### 其他改动
至此zimg新版本最重要的功能就介绍完毕了，这段时间零零散散还改了许多其他东西，也一并列在此处：  

```
New Features:
存储key生成规则调整，即使将来引入更多特性也可兼容旧数据
代码结构调整，用户无需安装libevhtp和hiredis
连接后端采用长连接提高性能
简化log输出内容
消除所有编译警告
采用lua做配置文件，主要是为以后支持压图脚本
修复一些遗留bug
```
## 别的什么
首先是后续计划。在存储稳定之后，更多的精力将向图片处理方向上转移，除了支持更多的图片处理功能，现在能想到的有以下几点：  

- 将图片处理的逻辑往lua脚本中转移，这样可以使zimg在无需重新编译甚至无需重启的情况下改变图片处理规则，或者增加新规则，用户也可以自定义自己的处理逻辑，满足不同的需求。  
- 大家可能已经有所耳闻，我们公司这边有自己开发的图片处理库webimg，性能好于imagemagick，而且不会内存泄露，使用起来也极其方便（webimg库支持c和PHP，最近我又给它增加了lua和go接口），一直有人呼吁开源出来给大家使用，我当然也非常希望，但这是公司的东西，可能需要老大们做决定。如果一旦webimg开源，zimg将果断抛弃imagemagick转向它。
- 还有一个是老问题了，zimg处理上传的逻辑写得非常搓，又笨又简陋，已经修复的BUG中有好几个与它相关，需要改进。
- 完善工具和文档，看着别人做的开源项目（比如SSDB）这也有那也有，感觉非常高端大气上档次，只能慢慢补充吧。

然后有人向我咨询zimg的license问题，问我是否可以商业化，答案是可以的，希望大家随便用随便改，如果你的公司或者APP采用了zimg，希望在此处留言告知，或者发邮件通知我一声，邮箱是```zp@buaa.us```。  
开源项目zimg是我利用业余时间无偿完成的，很多个深夜都在写代码中度过，作者并不指望靠它获利，只是诚惶诚恐。如果使用它可以给你带来一点便利，我已非常满足。  
大家五一假期快乐！  


