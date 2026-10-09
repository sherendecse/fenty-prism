# 首页头像素材

使用内置 imagegen 生成一次原创素材，随后按头像拆分并保存透明 WebP，用于首页自动轮换。没有使用参考截图中的人脸。

生成提示词：Six distinct photorealistic 3D adult head-and-neck cutouts, alternating men and women, diverse skin tones and face shapes, equal grid alignment, warm studio rimlight, transparent background, no clothing, jewelry, text, or decorative elements.

最终素材位置：

- /workspace/sites/fenty-face-finder/public/images/prism-head-1.webp
- /workspace/sites/fenty-face-finder/public/images/prism-head-2.webp
- /workspace/sites/fenty-face-finder/public/images/prism-head-3.webp
- /workspace/sites/fenty-face-finder/public/images/prism-head-4.webp
- /workspace/sites/fenty-face-finder/public/images/prism-head-5.webp
- /workspace/sites/fenty-face-finder/public/images/prism-head-6.webp

头像每六秒交叉淡入淡出，轻微浮动；轨道线、25% 透明度柔光与星星由网页动画绘制。遵循系统的减少动态效果设置。

2026-10-06 更新：首页改用新生成的亚洲女性与深肤色男性的左侧、正面、右侧透明头像。每人按左→正→右→正顺序柔和轮换，并横向轻移，纵向轨道小于头部。头像角度来自独立生成视图，不是镜像替代。

2026-10-06 第二次更新：新增亚洲男性与浅肤色女性五角度头像；与亚洲女性、深肤色男性组成四种面孔。通过多角度透明素材连续混合展示左→正→右。该效果是角度图像动画，不是真正的三维模型。装饰改为 X 形交叉椭圆和沿路线运行的小光点。新素材由 imagegen 一次生成并分格裁切。

2026-10-06 第三次更新：按最新要求改为六张不同面孔，每人仅展示一个固定角度，六秒轮换。包含亚洲男性、亚洲女性、深肤色男性、浅肤色女性、浅肤色男性与深肤色女性。X 形椭圆扩大到头像外围，仅轨道轻微上下浮动，沿线光点继续循环。
