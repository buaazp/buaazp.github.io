---
layout: page
title: GuideBook 
permalink: /documents/guidebook/
---

[Guidebook in Chinese](/documents/guidebookcn/)

### Run

You should follow the [Install Guide](/documents/install) and install the dependences of zimg before using it. The config file of zimg is very simple. There are comments in the conf file. You can modify some of the items to fit your purpose:

```lua
--zimg server config

--server config
is_daemon       = 1
ip              = '0.0.0.0'
port            = 4869
thread_num      = 4
backlog_num     = 1024
max_keepalives  = 1
retry           = 3
system          = io.popen('uname -sn'):read('*l')
pwd             = io.popen('pwd'):read('*l')

--header config
headers         = 'Cache-Control:max-age=7776000'
etag            = 1

--access config
--support mask rules like 'allow 10.1.121.138/24'
--NOTE: remove rule can improve performance
--upload_rule   = 'allow all'
--download_rule = 'allow all'
admin_rule      = 'allow 127.0.0.1'

--cache config
cache           = 1
mc_ip           = '127.0.0.1'
mc_port         = 11211

--log config
--log_level output specified level of log to logfile
--[[
LOG_FATAL 0     System is unusable
LOG_ALERT 1     Action must be taken immediately
LOG_CRIT 2      Critical conditions
LOG_ERROR 3     Error conditions
LOG_WARNING 4   Warning conditions
LOG_NOTICE 5    Normal, but significant
LOG_INFO 6      Information
LOG_DEBUG 7     DEBUG message
]]
log_level       = 6
log_name        = pwd .. '/log/zimg.log'

--htdoc config
root_path       = pwd .. '/www/index.html'
admin_path      = pwd .. '/www/admin.html'

--image process config
disable_args    = 0
disable_type    = 0
--lua process script
script_name     = pwd .. '/script/process.lua'
--format value: 'none' for original or other format names
format          = 'jpeg'
--quality value: 1~100(default: 75)
quality         = 75

--storage config
--zimg support 3 ways for storage images
--value 1 is for local disk storage;
--value 2 is for memcached protocol storage like beansdb;
--value 3 is for redis protocol storage like SSDB.
mode            = 1
--save_new value: 0.don't save any 1.save all 2.only save types in lua script
save_new        = 1
max_size        = 100*1024*1024
allowed_type    = {'jpeg', 'jpg', 'png', 'gif', 'webp'}

--mode[1]: local disk mode
img_path        = pwd .. '/img'

--mode[2]: beansdb mode
beansdb_ip      = '127.0.0.1'
beansdb_port    = 7900

--mode[3]: ssdb mode
ssdb_ip         = '127.0.0.1'
ssdb_port       = 8888
```

Command to run zimg：

```bash
cd bin  
./zimg conf/zimg.lua
```

### Use

#### Upload

You have two ways to upload images to zimg:

The first one is using web broswer. The index page of zimg is an upload page:

```bash
http://127.0.0.1:4869/
```

Screenshot:

![](http://ww3.sinaimg.cn/large/4c422e03jw1ejoqiw2j25j20je0ddgmv.jpg)

Upload successfully:

![](http://ww2.sinaimg.cn/large/4c422e03jw1ejoqm5ghm0j20nl0fb76x.jpg)

Another way is using tools or HTTP libraries for programing. For example, if you use curl to post file, you can choose multitype/form way or raw-post way. If you use multitype/form way, do this:

```bash
curl -F "blob=@testup.jpeg;type=image/jpeg" "http://127.0.0.1:4869/upload"
```

The format of result is htlm when you using multipart/form way to upload images like using web broswer.

Or using raw-post way is like this:

```bash
curl -H "Content-Type:jpeg" --data-binary @testup.jpeg "http://127.0.0.1:4869/upload"
{"ret":true,"info":{"md5":"5f189d8ec57f5a5a0d3dcba47fa797e2","size":29615}}
```

The format of result is json when you using raw-post way. You need tell zimg the type of raw-post content by adding a header `Content-Type`. If the value of type is not in the config item `allowed_type` in config file, upload request will fail. Default value of `allowed_type` is:

```lua
allowed_type = {'jpeg', 'jpg', 'png', 'gif', 'webp'}
```

If upload failed, you will get `ret=false` and a message of error info:

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

#### Download

Download image through a URL with parameters like this:

```bash
http://127.0.0.1:4869/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300&h=300&g=1&x=0&y=0&r=45&q=85&f=jpeg
```

The format of URL is:  
IP + port / MD5 (? + width + height + resize_type + grayscale + x + y + rotate + quality + format)

**NOTE:**If your URL is just `IP:port/MD5`, you will get an compressed image to reduce the transfer size. If you want to get the original image you need add a parameter `p=0` in the URL:

```bash
http://127.0.0.1:4869/5f189d8ec57f5a5a0d3dcba47fa797e2?p=0
```

You can combine the parameters to get a different image. The examples below will show you the usages of zimg. The example image is:

![](http://ww4.sinaimg.cn/large/4c422e03jw1ejk51hq0qzj208c0b5aad.jpg)

*Note: This photo is copyrighted by Linna Tan. All rights reserved.*

Address：[http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2](http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2)

Example 1: Get the image with width=300, and equal proportion.
 
Just add one of the width or height of image into URL, the image will be resized with equal proportion:  
Address: http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300

Example 2: Get the image in 300\*300 and the redundant part will discard.

Add both width and height into URL, the image will be resized to the target resolution:

![](http://ww4.sinaimg.cn/large/4c422e03jw1ejk50r088vj208c08c3yq.jpg)

Address: http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300&h=300

Example 3: Get the center part of image in certain resolution

Add both width and height into URL, and use `p=2`, the image will be croped to the target resolution:

![](http://ww1.sinaimg.cn/large/4c422e03jw1ejk58hof69j208c08ct93.jpg)

Address: http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300&h=300&p=2

Example 4: Get the resized image with percent

Add `p=3` into the URL, and the width or height parameter should be `1 ~ 100`:

Address: http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=50&h=50&p=3

Example 5: Get 300\*300 image but the image will be stretched

Add the width and height into URL while using `p=0`:

![](http://ww2.sinaimg.cn/large/4c422e03jw1ejk5cbakmjj208c08cweo.jpg)

Address: http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300&h=300&p=0

Example 6: Get the certain part of the image

Add `x=200&y=100` into URL will crop the image from the position:

![](http://ww2.sinaimg.cn/large/4c422e03jw1ejoqilrkblj208c08cglt.jpg)

Address: http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300&h=300&x=200&y=100

需求八：获取旋转后的图片
Example 7: Get the rotated image

Add `r=45` into the URL:

![](http://ww2.sinaimg.cn/large/4c422e03jw1ek0yyg5f4uj20bu0bumxh.jpg)

Address: http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300&h=300&r=45

Example 8: Get the gray image

Add `g=1` into your URL:

![](http://ww2.sinaimg.cn/large/4c422e03jw1ejk95omk1tj208c08cglq.jpg)

Address: http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300&h=300&g=1

Example 9: Get the compressed image with a certain quality

Add `q=80` into the URL:  
请求地址：http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300&h=300&q=80

Example 10: Change the format of image

Add `f=webp` or other format name into your URL. The value should in [format list](http://www.imagemagick.org/script/formats.php).   
Maybe you need install the encode/decode libraries of some format.  
Address: http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=300&h=300&f=png

Example 11: Get the infomation of image

Using the interface `/info?md5=xxx` to get the json string of image's infomation:  
Address: http://demo.buaa.us/info?md5=5f189d8ec57f5a5a0d3dcba47fa797e2

The result content: 

```json
{"ret":true,"info":{"size":29615,"width":640,"height":856,"quality":100,"format":"JPEG"}}
```

Example 12: Delete an image

Goto the admin page of zimg like this:

![](http://ww2.sinaimg.cn/large/4c422e03jw1ejouwi75q7j20pi0fb3zo.jpg)

Using the URL below to delete an image:

http://127.0.0.1:4869/admin?md5=5f189d8ec57f5a5a0d3dcba47fa797e2&t=1

If delete success:

![](http://ww3.sinaimg.cn/large/4c422e03jw1ejouwl4uejj20pi0fbq45.jpg)

The admin page can visit only in localhost for security. Modify `admin_rule='allow 127.0.0.1'` to change the IP access of admin page.

#### zimg-lua

You can write a zimg-lua script to implement your own requirement of processing images.

Using `t=mytype` in URL to match the type designed in the zimg-lua script. For example there is a test type in `bin/script/test.lua`:

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
The test type will exchange the image to 300\*300, rotate 90 degree, 75% quality, gray and webp format. Just use the URL below to get it:  
http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?t=test

More infomation of zimg-lua is in [《API of zimg-lua》](/documents/api_of_zimg_lua/). And you can use the example `bin/script/process.lua` as reference. Write a zimg-lua script is very easy.

#### Visit Access Control

Modify the config file to use the visit access control:

```lua
download_rule='allow 10.77.121.137;allow 10.72.30.100/24;allow 127.0.0.1;deny all'
upload_rule='allow 127.0.0.1;deny all'
```




