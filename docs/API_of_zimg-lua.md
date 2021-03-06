---
layout: page
title: API of zimg-lua
permalink: /documents/api_of_zimg_lua/
---

## Synopsis

zimg-lua is a lua script parser module of zimg. Using zimg-lua allows users to write customzied functions for processing images. While zimg-lua has very high performance. It's as fast as zimg functions running in c. And it's easy to use for any programers.

## Simple Sample

There is a simple sample script only has one type `test`. It scales image to 100*100, 75% quality, grayscaled and changes its format to webp.

```lua
local type_list = {
	test = {
		cols                = 300,
		rows				= 300,
		quality			    = 75,
		rotate              = 90,
		gray			    = 1,
        format              = 'webp',
	},
}
local OK                    = 1

function f() --The main function must be named f() for zimg-lua
    local code = -1
    local rtype = zimg.type() --Get the request type from url argument

    local arg = type_list[rtype] --Find the type details
    if not arg then
        zimg.ret(code)
    end

    local ret = zimg.scale(arg.cols, arg.rows) --Scale image
    if ret ~= OK then
        zimg.ret(code)
    end

    if arg.rotate then
        ret = zimg.rotate(arg.rotate) --Rotate image
        if ret ~= OK then
            zimg.ret(code)
        end
    end

    if arg.gray and arg.gray == 1 then
        ret = zimg.gray() --Grayscale image
        if ret ~= OK then
            zimg.ret(code)
        end
    end

    if arg.quality and zimg.quality() > arg.quality then
        ret = zimg.set_quality(arg.quality) --Set quality of image
        if ret ~= OK then
            zimg.ret(code)
        end
    end

    if arg.format then
        ret = zimg.set_format(arg.format) --Set format
        if ret ~= OK then
            zimg.ret(code)
        end
    end

    code = OK
    zimg.ret(code) --Return the result to zimg
end
```

## API List

zimg-lua has some APIs for users to call the functions in zimg. All the APIs list below:


- `zimg.type()` - Get the type of request. Return a string value.
- `zimg.ret(result)` - Return the result to zimg. Parameter needs 0 for succ and -1 for failed. None return.
- `zimg.cols()` - Get the width of image. Return an integer value.
- `zimg.rows()` - Get the height of image. Return an integer value.
- `zimg.quality()` - Get the quality of image. Return an integer value.
- `zimg.format()` - Get the format of image. Return a string value.
- `zimg.scale(cols, rows)` - Scale an image with args coles and rows. Parameters need two integers. Return 1 for succ and -1 for failed.
- `zimg.crop(x, y, cols, rows)` - Crop an image with args x, y, cols and rows. Parameters need four integers. Return 1 for succ and -1 for failed.
- `zimg.rotate(angle)` - Rotates an image the specified number of degrees. Parameters need an angle. Return 1 for succ and -1 for failed.
- `zimg.gray()` - Grayscale an image. Return 1 for succ and -1 for failed.
- `zimg.set_quality(quality)` - Set the quality of image. Return 1 for succ and -1 for failed.
- `zimg.set_format(format)` - Set the format of image. Return 1 for succ and -1 for failed. Parameter needs format string.
- `log.print(loglevel, string)` - Record a log to zimg's log. None retrun. Parameters need an integer for loglevel as below and a string for message.

	```
	LOG_FATAL = 0
	LOG_ALERT = 1
	LOG_CRIT = 2
	LOG_ERROR = 3
	LOG_WARNING = 4
	LOG_NOTICE = 5
	LOG_INFO = 6
	LOG_DEBUG = 7
	```


