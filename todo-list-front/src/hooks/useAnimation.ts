import gsap from 'gsap';

export function useAnimation() {
  // 进入动画
  const enterAnimation = (el: Element, done: () => void) => {
    const tl = gsap.timeline({
      onComplete: done,
    });

    tl.fromTo(
      el,
      { opacity: 0, x: 12 }, // 起始位置：右边10px，透明
      {
        opacity: 0.8,
        x: -3, // 移动到左边-10px，半透明
        duration: 0.5,
        ease: 'power2.inOut',
      }
    ).to(el, {
      opacity: 1, // 回到原点，完全不透明
      x: 0,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  // 离开动画
  const leaveAnimation = (el: Element, done: () => void) => {
    const tl = gsap.timeline({
      onComplete: done,
    });

    tl.to(el, {
      opacity: 0, // 从100%变为0%，透明
      x: 10, // 从原点移动到右边10px
      duration: 0.2,
      ease: 'power2.out',
      onComplete: done,
    });
  };

  // 初始化错误页面动画
  const initErrorPageAnimation = (errorCode: string) => {
    // 创建动画时间线
    const tl = gsap.timeline({
      defaults: {
        ease: 'power2.out',
      },
    });

    // 容器动画
    tl.from('.error-content', {
      opacity: 0,
      y: 50,
      duration: 0.8,
    })
      // 左侧动画
      .from('.error-illustration', {
        opacity: 0,
        x: -50,
        duration: 1,
      })
      // 右侧动画
      .from(
        '.error-info',
        {
          opacity: 0,
          x: 50,
          duration: 1,
        },
        '-=0.5'
      )
      // 数字动画
      .from('.error-code', {
        scale: 0,
        rotation: errorCode === '404' ? -180 : 180,
        duration: 1,
        ease: 'back.out(1.7)',
      })
      // 标题动画
      .from(
        '.error-title',
        {
          opacity: 0,
          y: 20,
          duration: 0.5,
        },
        '-=0.5'
      )
      // 描述动画
      .from('.error-description', {
        opacity: 0,
        y: 20,
        duration: 0.5,
      })
      // 按钮动画
      .from('.error-info .home-button', {
        opacity: 0,
        y: 20,
        duration: 0.5,
      });

    // 为数字添加动画效果
    if (errorCode === '404' || errorCode === '403') {
      // 404 和 403 页面：上下浮动效果
      gsap.to('.error-code', {
        y: -10,
        duration: 1,
        yoyo: true,
        repeat: -1,
        repeatDelay: 2,
        ease: 'power1.inOut',
      });
    }
  };

  return {
    enterAnimation,
    leaveAnimation,
    initErrorPageAnimation,
  };
}
