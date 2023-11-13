export const posterConfig = {
  // 1vw代表的px宽度
  oneVW: window
    ? window.innerWidth / 100
    : wx.getSystemInfoSync().windowWidth / 100,
  // 整体缩放，一般不管
  scale: 1,
  dpr: window
    ? window.devicePixelRatio
    : wx.getSystemInfoSync().devicePixelRatio,
};

// 将vw单位转为绘制的像素
export function vw2px(vw, dpr2) {
  const { oneVW, dpr, scale } = posterConfig;
  const realDpr = dpr2 || dpr;
  return oneVW * realDpr * vw * scale;
}

export function createCanvas(width, height) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  return { canvas, ctx };
}

/**
 * 验证是否需要设置跨域
 * @param {String} url
 * @returns {Boolean}
 */
export function shouldCrossOrigin(url) {
  // iOS 10.0 不允许img不跨域时设置anonymous。否则onError触发。
  return (
    typeof url === "string" &&
    url.startsWith("http") &&
    !url.includes(location.origin)
  );
}

// 加载图片
export function loadImage(url, canvas = null) {
  let img;
  if (window) {
    img = new Image();
  } else {
    img = canvas.createImage();
  }
  return new Promise((resolve, reject) => {
    img.onload = () => {
      resolve(img);
    };
    img.onerror = (e) => {
      reject(e);
      console.log(e);
    };
    img.src = url;
    if (window) {
      if (shouldCrossOrigin(url)) {
        img.setAttribute("crossOrigin", "Anonymous");
      } else {
        img.removeAttribute("crossOrigin");
        delete img.crossOrigin;
      }
    }
  });
}

// 是否采用vw转成px
export function isVw2px(flag, dpr) {
  if (flag) {
    return (per) => {
      return vw2px(per, dpr);
    };
  } else {
    return (per) => {
      return per * dpr;
    };
  }
}

/**
 * 切割文字，用于自动换行
 * @param {CanvasRenderingContext2D} ctx:canvas上下文对象
 * @param {String} content:内容文字
 * @param {Number} maxWidth:一行的最大宽度
 * @returns {Array} 切割好的字符串数组
 */
export function getContents(ctx, content, maxWidth) {
  let width = 0;
  // 存储内容数组
  let contents = [];
  // 临时存储内容
  let tempContent = "";
  for (let i = 0; i < content.length; i++) {
    // 获取单个字
    const contentChar = content[i];
    // 获取单个字的宽度
    const _width = ctx.measureText(contentChar).width;
    // 判断宽度是否小于宽度
    if ((width < _width && !tempContent.length) || width + _width <= maxWidth) {
      // 宽度增加
      width += _width;
      // 拼接字符
      tempContent += contentChar;
    } else {
      // 插入到数组内
      contents.push(tempContent);
      // 重新设置内容
      tempContent = contentChar;
      // 重新设置宽度
      width = _width;
    }
    // 判断是否为最后一个字，则直接插入
    if (i === content.length - 1) contents.push(tempContent);
  }
  // 返回结果
  return contents;
}

/**
 * 用对象的方式来使用Promise.all
 * 在一次要加载很多素材的时候使用不用一个一个挨着数数组的索引
 *
 * @export
 * @param {Object} taskMap
 * @return {Object}
 */
export async function promiseAllAsObject(taskMap) {
  const keysAndTasks = Object.keys(taskMap).reduce(
    (acc, key) => {
      acc.keys.push(key);
      acc.tasks.push(taskMap[key]);
      return acc;
    },
    { keys: [], tasks: [] }
  );
  const res = await Promise.all(keysAndTasks.tasks);
  return res.reduce((acc, item, i) => {
    acc[keysAndTasks.keys[i]] = item;
    return acc;
  }, {});
}

/**
 * 绘制文本的方法
 * @param {CanvasRenderingContext2D} ctx - canvas上下文对象
 * @param {String} [drawArrayItem.color = "#000"] - 文本颜色
 * @param {Number} [drawArrayItem.fontSize = 3] - 文字大小
 * @param {String} [drawArrayItem.fontFamily= "sans-serif"] - 文字字体
 * @param {String} [drawArrayItem.fontWeight= "normal"] - 字重
 * @param {Boolean} [drawArrayItem.isCenter = false] - 文字是否居中显示
 * @param {String} [drawArrayItem.content = ""] - 文字内容
 * @param {Number} [drawArrayItem.left = 0] - 文字的Left值
 * @param {Number} [drawArrayItem.top = 0] - 文字的Top值
 * @param {Boolean} [drawArrayItem.isStroke = false] - 是否是描边文字
 * @param {Number | null} [drawArrayItem.maxWidth = null] - 一行字的最大宽度(超出会自动换行,不配置该属性则不会换行)
 * @param {Function} setUnit - 单位转换函数
 * @return {Void}
 */
export function drawText(
  ctx,
  {
    color = "#000",
    fontSize = 3,
    fontFamily = "sans-serif",
    fontWeight = "normal",
    isCenter = false,
    content = "",
    left = 0,
    top = 0,
    isStroke = false,
    maxWidth = null,
  },
  setUnit
) {
  // 字间距
  const fontGap = fontSize;
  // 字体颜色
  if (isStroke) {
    ctx.strokeStyle = color;
  } else {
    ctx.fillStyle = color;
  }
  // font
  ctx.font = `${fontWeight} ${setUnit(fontSize)}px ${fontFamily}`;

  // 是否居中
  if (isCenter) {
    ctx.textAlign = "center";
  } else {
    ctx.textAlign = "start";
  }

  // 字体left/top计算方式
  const textLeft = isCenter ? setUnit(100 / 2) : setUnit(left);
  const textTop = (i) => {
    return setUnit(top + (maxWidth ? fontGap * (i + 1) : fontGap));
  };

  // 绘制描边字体方法
  const strokeText = (c, i) => {
    ctx.strokeText(c, textLeft, textTop(i));
  };

  // 绘制填充字体方法
  const fillText = (c, i) => {
    ctx.fillText(c, textLeft, textTop(i));
  };

  if (isStroke) {
    //是否自动换行
    if (maxWidth) {
      const contents = getContents(ctx, content, setUnit(maxWidth));
      contents.forEach((c, i) => {
        strokeText(c, i);
      });
    } else {
      strokeText(content);
    }
  } else {
    if (maxWidth) {
      const contents = getContents(ctx, content, setUnit(maxWidth));
      contents.forEach((c, i) => {
        fillText(c, i);
      });
    } else {
      fillText(content);
    }
  }
}

/**
 * 绘制图片的方法
 * @param {CanvasRenderingContext2D} ctx - canvas上下文对象
 * @param {Number} [drawArrayItem.left = 0] - 图片的Left值
 * @param {Number} [drawArrayItem.top = 0] - 图片的Top值
 * @param {Boolean} [drawArrayItem.isClip = false] - 是否采用裁剪的方式,裁剪方式为aspectFill
 * @param {Number} [drawArrayItem.width = 0] - 图片宽度
 * @param {Number} [drawArrayItem.height = 0] - 图片高度
 * @param {HTMLImageElement} drawArrayItem.img - 要绘制的图片
 * @return {Void}
 */
export function drawImage(
  ctx,
  { left = 0, top = 0, width = 0, height = 0, isClip = false, img },
  setUnit
) {
  // 是否裁剪
  if (isClip) {
    const photoRatio = width / height;
    const photoNeedDrawWidth = img.width;
    const photoNeedDrawHeight = photoNeedDrawWidth / photoRatio;
    const sx = 0;
    const sy = (img.height - photoNeedDrawHeight) / 2;
    ctx.drawImage(
      img,
      sx,
      sy,
      img.width,
      photoNeedDrawHeight,
      setUnit(left),
      setUnit(top),
      setUnit(width),
      setUnit(height)
    );
  } else {
    ctx.drawImage(
      img,
      setUnit(left),
      setUnit(top),
      setUnit(width),
      setUnit(height)
    );
  }
}

/**
 * 小程序获取wxml中的节点
 * @param {String} selector - 选择器名称
 * @param {Object} [context] -  上下文对象,若组件中使用传递组件的this,page中不传
 * @returns {Promise} Promise对象,resolve后返回获取的节点信息
 */
export function getWxmlNode(selector, context) {
  return new Promise((resolve) => {
    const query = (context || wx).createSelectorQuery();
    query
      .select(selector)
      .fields({ node: true, size: true })
      .exec((res) => {
        resolve(res[0].node);
      });
  });
}

/**
 * 小程序输出图片路径
 * @param {HTMLCanvasElement} canvas - canvas对象
 * @param {Number} defaultWidth - 输出的宽度
 * @param {Number} defaultHeight - 输出的高度
 * @param {String} fileType - 输出的文件类型
 * @param {Number} quality - 输出的图片质量 0-1
 * @returns {Promise} Promise对象,resolve后返回生成的图片路径
 */
export function canvasToTempFilePath(
  canvas,
  defaultWidth,
  defaultHeight,
  fileType,
  quality
) {
  return new Promise((resolve, reject) => {
    wx.canvasToTempFilePath({
      canvas,
      x: 0,
      y: 0,
      width: defaultWidth,
      height: defaultHeight,
      destWidth: defaultWidth,
      destHeight: defaultHeight,
      fileType,
      quality,
      success: ({ tempFilePath }) => {
        if (tempFilePath) {
          resolve(tempFilePath);
        } else {
          reject(new Error("生成失败"));
        }
      },
      fail: (err) => {
        console.error(err);
        reject(err);
      },
    });
  });
}
