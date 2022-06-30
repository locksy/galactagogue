const isBrowser = () =>
  typeof window !== "undefined" && typeof window.document !== "undefined";
const isNumber = v => typeof v === "number";
const isString = v => typeof v === "string";
const isSupported = () => isBrowser() && "DeviceOrientationEvent" in window;

let createGyroGradient = () => {};

if (isSupported()) {
  const STRENGTH = 300;
  const PI_DIVIDED_BY_180 = Math.PI / 180;

  // 生成噪音
  const generateNoise = (width, height) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.random()})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    return canvas;
  };

  const state = {
    orientationInitial: null,
    orientation: {
      alpha: null,
      beta: null,
      gamma: null
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    origin: { x: 0, y: 0, z: STRENGTH },
    patterns: {
      noise: generateNoise(
        64 * window.devicePixelRatio,
        64 * window.devicePixelRatio
      )
    },
    drawers: []
  };

  // 创建渐变层
  createGyroGradient = (target, props) =>
    // target是选择器，将其转换成数组
    (typeof target === "string"
      ? Array.from(document.querySelectorAll(target))
      : Array.isArray(target)
      ? target
      : [target]
    ).map(element => state.drawers.push(create(element, props)));

  // 初始化和创建画布
  const create = (element, props = {}) => {
    const state = getStateFromProps(element, props);

    const init = () => {
      state.styles = getComputedStyle(element);
      const update = setup(state);
      drawer.write = (x, y) => {
        update(x, y);
      };
    };

    const drawer = {
      read: () => {
        if (!state.dirty) return;
        init();
        state.dirty = false;
      },
      write: () => {}
    };

    return drawer;
  };

  // 获取每个画布的属性值
  const getStateFromProps = (element, props) => {
    const { gradient = {}, pattern = {} } = props;

    const steps = sanitizeGradient(
      gradient.colors || [["#fff", 1], [0.5, "#fff", 0]]
    );

    const flip = {
      x: gradient.flip && gradient.flip.x ? -1 : 1,
      y: gradient.flip && gradient.flip.y ? -1 : 1
    };

    const patternOpacity = isNumber(pattern.opacity) ? pattern.opacity : 0.25;

    return {
      type: props.type || "background",
      dirty: true,
      styles: null,
      element,

      gradient: {
        type: gradient.type || "radial",
        flip,
        angle: gradient.angle || null,
        steps,
        scalar: gradient.scalar || { x: 1, y: 1 }
      },

      pattern: {
        type: pattern.type || "none",
        data: pattern.type
          ? getPatternWithOpacity(pattern.type, patternOpacity).toDataURL()
          : null,
        opacity: patternOpacity,
        size: { width: 64, height: 64 }
      }
    };
  };

  // 添加蒙版
  const getPatternWithOpacity = (pattern, opacity) => {
    const source = state.patterns[pattern];
    if (!source) return null;
    const canvas = document.createElement("canvas");
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = `rgba(0, 0, 0, ${1 - opacity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, 0, 0);
    return canvas;
  };

  // 处理输入的渐变属性
  const sanitizeGradient = gradient =>
    gradient
      // 确保输入是个数组
      .map(step => (isString(step) ? [step] : step))
      // 将数组item转格式为对象
      .map(step => ({
        color: isString(step[0]) ? step[0] : step[1],
        opacity: isNumber(step[step.length - 1]) ? step[step.length - 1] : null,
        stop: isNumber(step[0]) ? step[0] : null
      }))
      // 设置默认值
      .map((step, index, arr) => ({
        ...step,
        opacity: step.opacity === null ? 1 : step.opacity,
        stop: step.stop === null ? index * (1 / (arr.length - 1)) : step.stop
      }))
      // 添加RGBA属性
      .map(step => ({
        ...step,
        colorRGBA: toRGBA(step.color, step.opacity)
      }));

  // 将样式对象转换为实际样式
  const setup = state => {
    const { type, element, styles, pattern, gradient } = state;

    element.style.position =
      styles.position === "static" ? "relative" : styles.position;

    // 创建层来保持效果
    const wrapper = document.createElement("span");
    wrapper.className = "gradient--wrapper";

    // 创建效果叠加
    let overlayStyles =
      "position:absolute;pointer-events:none;user-select:none;background-attachment:fixed;";
    const overlay = document.createElement("span");
    const style = overlay.style;

    if (type === "border") {
      const borderTopWidth = parseFloat(styles.borderTopWidth);
      const borderLeftWidth = parseFloat(styles.borderLeftWidth);
      const borderRightWidth = parseFloat(styles.borderRightWidth);
      const borderBottomWidth = parseFloat(styles.borderBottomWidth);
      const borderTopLeftRadius = parseFloat(styles.borderTopLeftRadius);
      const backgroundColor = styles.backgroundColor;
      overlayStyles += `border-radius:${borderTopLeftRadius}px;
            left:${-borderLeftWidth}px;
            top:${-borderTopWidth}px;
            right:${-borderRightWidth}px;
            bottom:${-borderBottomWidth}px;`;

      const fill = document.createElement("div");
      fill.style.cssText = `position:absolute;border-radius:${borderTopLeftRadius -
        borderLeftWidth}px;background-color: ${backgroundColor} 
            left:${borderLeftWidth}px;
            top:${borderTopWidth}px;
            right:${borderRightWidth}px;
            bottom:${borderBottomWidth}px;`;
      overlay.appendChild(fill);
    } else if (type === "background") {
      const borderTopLeftRadius = parseFloat(styles.borderTopLeftRadius);
      overlayStyles += `left:0;top:0;width:100%;height:100%;border-radius:${borderTopLeftRadius}px;`;
    } else if (type === "text") {
      overlay.innerHTML = element.innerHTML;
      overlayStyles += `color:transparent;background-clip:text;-webkit-background-clip:text;-moz-background-clip:text;`;
    }

    // 添加蒙版
    if (pattern.data) {
      const mask = `url(${pattern.data}) 0 0 / ${pattern.size.width}px ${pattern.size.height}px;`;
      overlayStyles += `mask: ${mask}; -moz-mask: ${mask}; -webkit-mask: ${mask};`;
    }

    style.cssText = overlayStyles;

    wrapper.appendChild(overlay);
    element.insertAdjacentElement("afterbegin", wrapper);

    // 渐变绘制
    if (gradient.type === "linear") {
      return (x, y) => {
        const offset = x * gradient.flip.x + (y * gradient.flip.y) / 2;
        const gradientString = gradient.steps
          .map(value => `${value.colorRGBA} ${(offset + value.stop) * 100}%`)
          .join(", ");

        style.backgroundImage = `linear-gradient(${gradient.angle}, ${gradientString})`;
      };
    } else {
      const gradientString = gradient.steps
        .map(value => `${value.colorRGBA} ${value.stop * 100}%`)
        .join(", ");

      return (x, y) => {
        const position = {
          x: 0.5 + x * gradient.flip.x * gradient.scalar.x,
          y: 0.5 + y * gradient.flip.y * gradient.scalar.y
        };
        style.backgroundImage = `radial-gradient(100vmax 100vmax at ${position.x *
          100}% ${position.y * 100}%, ${gradientString})`;
      };
    }
  };

  // 转换成RGBA
  const toRGBA = (color, opacity) =>
    `rgba${toRGB(color).slice(3, -1)}, ${opacity})`;

  // 转换成RGB
  const toRGB = color => {
    if (/rgb\(/.test(color)) return color;
    const node = document.createElement("div");
    node.style.cssText = `display:none;color:${color}`;
    document.body.appendChild(node);
    const out = getComputedStyle(node).color;
    node.parentNode.removeChild(node);
    return out;
  };

  // 将度数转换为弧度
  const degToRad = degrees => degrees * PI_DIVIDED_BY_180;

  // 根据陀螺仪修改每个画布的样式
  const draw = () => {
    if (!state.orientationInitial) return;

    const { orientation, orientationInitial, origin, viewport } = state;

    const alpha = orientation.alpha - orientationInitial.alpha;
    const beta = orientation.beta - orientationInitial.beta;
    const gamma = orientation.gamma - orientationInitial.gamma;

    let { x, y, z } = origin;

    x = x * Math.cos(degToRad(alpha)) - y * Math.sin(degToRad(alpha));
    y = y * Math.cos(degToRad(alpha)) + x * Math.sin(degToRad(alpha));
    y = y * Math.cos(degToRad(beta)) - z * Math.sin(degToRad(beta));
    z = z * Math.cos(degToRad(beta)) + y * Math.sin(degToRad(beta));
    z = z * Math.cos(degToRad(gamma)) - x * Math.sin(degToRad(gamma));
    x = x * Math.cos(degToRad(gamma)) + z * Math.sin(degToRad(gamma));

    const viewportScaleFactor = viewport.width / viewport.height;
    const px = x / (STRENGTH * viewportScaleFactor);
    const py = y / (STRENGTH / viewportScaleFactor);

    state.drawers.forEach(drawer => drawer.read());

    state.drawers.forEach(drawer => drawer.write(px, py));
  };

  // 开始绘制循环
  const tick = () => {
    draw();
    requestAnimationFrame(tick);
  };

  // 添加事件监听函数
  const init = () => {
    // 当文档显示或隐藏时，重置初始化方向
    document.addEventListener("visibilitychange", e => {
      state.orientationInitial = null;
    });

    // 注册陀螺仪事件
    window.addEventListener("deviceorientation", e => {
      if (e.alpha === null) return;
      state.orientation.alpha = e.alpha;
      state.orientation.beta = e.beta;
      state.orientation.gamma = e.gamma;
      if (state.orientationInitial === null) {
        state.orientationInitial = {
          alpha: e.alpha,
          beta: e.beta,
          gamma: e.gamma
        };
        tick();
      }
    });
  };

  // 运行
  init();
}

export default createGyroGradient;
