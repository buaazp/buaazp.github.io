---
layout: page
title: Documents
permalink: /documents/
---

### Abstract

- The zimg is an image storage and processing server. You can get a compressed and scaled image from zimg with the parameters of URL.  
[http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=500&h=500&p=3&g=1](http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?w=500&h=500&p=3&g=1)

- The parameters contain width, height, proportion type, gray, crop postion (x, y), quality. And you can control the default type of images by configuration file.  
And you can get the information of image in zimg server like this:  
[http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?info=1](http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?info=1)

- If you want to customize the transform rule of image you can write a zimg-lua script. Use `t=type` parameter in your URL to get the special image:  
[http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?t=webp500](http://demo.buaa.us/5f189d8ec57f5a5a0d3dcba47fa797e2?t=webp500)

- The concurrency I/O, distributed storage and in time processing ability of zimg is excellent. You needn't nginx in your image server any more. In the benchmark test, zimg can deal with 1000+ image processing task per second and 30000+ HTTP echo request per second on a high concurrency level. The performance is higher than PHP or other image processing server. More infomation of zimg is in the documents below.


### Guidebook

- [Download and Install](/documents/install): Introduction to get and build zimg.
- [Get Started](/documents/guidebook/): The tutorials of how to use zimg.
- [API of zimg-lua scripts](/documents/api_of_zimg_lua/): Guide you how to build a custom image processing server by programming with zimg-lua.

### Benchmarks

- [Benchmark of zimg v3.0](/documents/benchmark_v3/): This benchmark test show you how fast zimg v3 is when we used webimg as image processing library.
- [Benchmark of zimg v2.0](/documents/benchmark_v2/): This benckmark test is aim to test the performance of different storage backends include disk, beansdb and SSDB.
- [Benchmark of zimg v1.0](/documents/benchmark_v1/): The first benchmark of zimg which tested concurrency processing ability of zimg and PHP.

### Design and Architecture

*These articles are written in Chinese.*

- [Design of zimg v3.0](/documents/design_of_zimg_new_generation/): Talk abount zimg new generation.	
- [Distributed Image Storage Server: zimg](/documents/Distributed_Image_Storage_Server_zimg/): Introduction to zimg's distributed storage architecture.
- [Architecture and Design of An Image Server](/documents/Architecture_Design_of_Image_Server/): Introduction to zimg's purpose of design and its function theory.

### Use cases

- Who is using zimg

If your company or product is using zimg. Please send an email to us `zp@buaa.us` and we will add you to the use cases list. Maybe you can provide informations below:

```bash
Company name
LOGO(as attachment)
Website link
Company/production description
How you use zimg, and how zimg helps you
```

### Sponsors

- The sponsors list

### License

- Project zimg is released under the three clause BSD license. You can find [additional information in our license page](/documents/license/).