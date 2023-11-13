# poster-helper
web和小程序快速绘制海报的工具

### 小程序示例
```js
// HTML
<!-- ios中必须指定canvas的宽高，否则导出的图片会糊 -->
<canvas type="2d" id="kivi-poster-canvas" class="kivi-poster-canvas" style="width:{{canvasWidth}}vw;height:{{canvasHeight}}vw" />
```

```js
// js
import { createPoster } from "../../utils/poster/index";


const posterParams = {
        canvasWidth: this.data.canvasWidth,
        canvasHeight: this.data.canvasHeight,
        canvasBgColor: "#fff",
        imageType: "png",
        quality: 1,
        isVw: true,
        canvasId: "kivi-poster-canvas",
        drawArray: [
          {
            type: "image",
            src: photo,
            isClip: true,
            left: 0,
            top: 0,
            width: 100,
            height: 134.93,
          },
          {
            type: "image",
            src: resUrl("images/poster/qr-code.png"),
            isClip: false,
            left: 78.63,
            top: 3.23,
            width: 20,
            height: 20,
          },
          {
            type: "text",
            color: "#000",
            fontSize: 3.88,
            fontFamily: "Microsoft YaHei",
            fontWeight: "500",
            isCenter: false,
            content: "色彩缤纷,极尽美丽娇艳",
            left: 3.24,
            top: 141.73 + 3.88 * 2,
          },
          {
            type: "text",
            color: "#4D4D4D",
            fontSize: 3.88,
            fontFamily: "Microsoft YaHei",
            fontWeight: "400",
            isCenter: false,
            content: "邀您一起体验独特的AR黄龙景区",
            left: 3.24,
            top: 141.73 + 3.88 * 4,
          },
          {
            type: "image",
            src: resUrl("images/poster/save.png"),
            isClip: false,
            left: 62.13,
            top: 151,
            width: 33.36,
            height: 10.326,
          },
        ],
        that: this,
      };
      const { exportSrc } = await createPoster(posterParams);
```

### web端示例

```js
import { createPoster } from "../../utils/poster/index";

const posterParams = {
    canvasWidth: 100,
    canvasHeight: 170,
    canvasBgColor: "#fff",
    imageType: "png",
    quality: 1,
    isVw: true,
    drawArray: [
      {
        type: "image",
        src: img,
        isClip: true,
        left: 0,
        top: 0,
        width: 100,
        height: 134.93
      },
      {
        type: "text",
        color: "#000",
        fontSize: 3.88,
        fontFamily: "Microsoft YaHei",
        fontWeight: "500",
        isCenter: false,
        content: "色彩缤纷,极尽美丽娇艳",
        left: 3.24,
        top: 141.73 + 3.88 * 2
      },
      {
        type: "text",
        color: "#4D4D4D",
        fontSize: 3.88,
        fontFamily: "Microsoft YaHei",
        fontWeight: "400",
        isCenter: false,
        content: "邀您一起体验独特的AR黄龙景区",
        left: 3.24,
        top: 141.73 + 3.88 * 4
      }
    ],
  }
  const res = await createPoster(posterParams)
```