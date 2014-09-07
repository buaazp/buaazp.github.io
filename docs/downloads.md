---
layout: page
title: Downloads
permalink: /downloads/
---

### Source

[![Build Status](https://travis-ci.org/buaazp/zimg.svg?branch=master)](https://travis-ci.org/buaazp/zimg)
[![Build Status](https://drone.io/github.com/buaazp/zimg/status.png)](https://drone.io/github.com/buaazp/zimg/latest)  

Project zimg is an open source software in [the three clause BSD license](/documents/license/). The newest version of zimg can be get from github:

```bash
git clone https://github.com/buaazp/zimg -b master --depth=1
cd zimg   
make  
```

Or you can download all the old versions from the release page: [All Releases](https://github.com/buaazp/zimg/releases)

### Binary

Source build is our recommended way to get zimg. If you are skilled in your operating system, you can build a binary package like RPM or DEB for it. We will appreciate your work and list your packages here to make others use zimg easily.

### ChangeLog

##### 09/09/2014 - zimg v3.1.0

- More parameters in url to processing image.
- Support lua scripts to deal with customize compress strategy.
- Broswer and client cache control.  
- Admin page and delete image function.  
- Best parser for multipart/form uploads.  
- Support binary upload and json result.  
- More config options for operation and maintenance.  

##### 06/10/2014 - zimg v2.2.0

Enhancement:

- Fixed memory leak in imagemagick.
- Bug fixed.

##### 05/18/2014 - zimg v2.1.0

New features:

- IP access control module.
- Return compressed image for none arg request.

Bug fixed:

- Storage path doesn't work and mk_dirs error.
- Remove unsafe function sprintf().
- 404 when p=0 and width or height is zero.

##### 04/26/2014 - zimg v2.0.0

- Support beansdb/SSDB mode to save images into distributed storage backend.
- New rules of storage key.
- Use keepalive-connection to improve performance.
- Use lua for conf and other functions.
- Clear log format.
- New source code struct.

##### 03/10/2014 - zimg v1.1.0

- Supported SSDB storage backend.

##### 08/01/2013 - zimg v1.0.0

- Receive and storage users' upload images.
- Transfer image through HTTP protocol.
- Process resized and grayed image by request parameter.
- Use memcached to improve performance.
- Multi-thread support for multi-core processor server.