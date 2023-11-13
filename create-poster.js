import {
  loadImage,
  createCanvas,
  isVw2px,
  drawText,
  drawImage,
  canvasToTempFilePath,
  getWxmlNode,
} from "./utils";

/**
 * 绘制海报并输出图片路径
 * @param {Object} posterParams - 海报配置信息对象
 * @param {Number} [posterParams.canvasWidth = 0] - canvas的宽度
 * @param {Number} [posterParams.canvasHeight = 0] - canvas的高度
 * @param {String} [posterParams.canvasBgColor = "#fff"] - canvas的背景色
 * @param {Number} [posterParams.dpr = window.devicePixelRatio] - 像素比
 * @param {String} [posterParams.imageType = "image/png" | "png"] - 输出的图片类型:"image/png" | "image/jpeg"、小程序中的类型为:"png" | "jpg"
 * @param {Number} [posterParams.quality = 0.92] - 输出的图片质量(0-1)
 * @param {Boolean} [posterParams.isVw = true] - 是否使用vw作为单位,否则使用像素作为单位
 * @param {Array}  [posterParams.drawArray = [] ] - 绘制的数组对象(根据下标顺序绘制)
 * 小程序
 * @param {String} posterParams.canvasId - 小程序canvas节点的id,必传
 * @param {Object} [posterParams.that] - 小程序获取节点要使用的this,当在小程序组件中使用时,请传递该this,否则组件中无法正确获取到canvas节点
 * type = text
 * @param {String} [posterParams.drawArray[].type] - 绘制的类型 "image" | "text"
 * @param {String} [posterParams.drawArray[].color = "#000"] - 文本颜色
 * @param {Number} [posterParams.drawArray[].fontSize = 3] - 文字大小
 * @param {String} [posterParams.drawArray[].fontFamily= "sans-serif"] - 文字字体
 * @param {String} [posterParams.drawArray[].fontWeight= "normal"] - 字重
 * @param {Boolean} [posterParams.drawArray[].isCenter = false] - 文字是否居中显示
 * @param {String} [posterParams.drawArray[].content = ""] - 文字内容
 * @param {Number} [posterParams.drawArray[].left = 0] - 图片或文字的Left值
 * @param {Number} [posterParams.drawArray[].top = 0] - 图片或文字的Top值
 * @param {Boolean} [posterParams.drawArray[].isStroke = false] - 是否是描边文字
 * @param {Number | null} [posterParams.drawArray[].maxWidth = null] - 一行字的最大宽度(超出会自动换行,不配置该属性则不会换行)
 * type = image
 * @param {String} [posterParams.drawArray[].src = ""] - 图片路径
 * @param {Boolean} [posterParams.drawArray[].isClip = false] - 是否采用裁剪的方式,裁剪方式为aspectFill
 * @param {Number} [posterParams.drawArray[].width = 0] - 图片宽度
 * @param {Number} [posterParams.drawArray[].height = 0] - 图片高度
 * @return {Promise} web端Promise的resolve返回canvas.toDataURL输出的图片路径。小程序端Promise的resolve返回canvasToTempFilePath生成的图片路径
 */
export async function createPoster(posterParams) {
  const {
    canvasWidth = 0,
    canvasHeight = 0,
    canvasBgColor = "#fff",
    dpr = window
      ? window.devicePixelRatio
      : wx.getSystemInfoSync().devicePixelRatio,
    imageType = window ? "image/png" : "png",
    quality = 0.92,
    isVw = true,
    drawArray = [],
    canvasId,
    that,
  } = posterParams;

  // 单位设置
  const setUnit = isVw2px(isVw, dpr);

  // 画布宽高
  const defaultWidth = setUnit(canvasWidth);
  const defaultHeight = setUnit(canvasHeight);

  // 创建canvas节点,设置宽高
  let canvas, ctx;
  if (window) {
    const res = createCanvas(defaultWidth, defaultHeight);
    canvas = res.canvas;
    ctx = res.ctx;
  } else {
    canvas = await getWxmlNode(`#${canvasId}`, that ? that : null);
    ctx = canvas.getContext("2d");
    canvas.width = defaultWidth;
    canvas.height = defaultHeight;
  }

  // 绘制背景
  ctx.fillStyle = canvasBgColor;
  ctx.fillRect(0, 0, defaultWidth, defaultHeight);

  // 取出图片src并加载
  const imageArr = [];
  drawArray.forEach((v) => {
    if (v.type === "image") {
      imageArr.push(loadImage(v.src, window ? null : canvas));
    } else {
      imageArr.push("");
    }
  });

  const imgs = await Promise.all(imageArr);
  imgs.forEach((v, i) => {
    if (v) {
      drawArray[i].img = v;
    }
  });

  drawArray.forEach((v) => {
    // 绘制文字
    if (v.type === "text") {
      drawText(ctx, v, setUnit);
    } // 绘制图片
    else if (v.type === "image") {
      drawImage(ctx, v, setUnit);
    } else {
      console.warn("暂无此类型的绘制方法");
    }
  });

  // 输出图片路径
  if (window) {
    return canvas.toDataURL(imageType, quality);
  } else {
    return {
      exportSrc: await canvasToTempFilePath(
        canvas,
        defaultWidth,
        defaultHeight,
        imageType,
        quality
      ),
      canvasWidth: defaultWidth,
      canvasHeight: defaultHeight,
    };
  }
}
