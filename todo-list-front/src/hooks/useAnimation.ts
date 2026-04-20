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
      opacity: 0, // 从100%变为0%
      x: 10, // 从原点移动到右边10px
      duration: 0.2,
      ease: 'power2.out',
      onComplete: done,
    });
  };

  return {
    enterAnimation,
    leaveAnimation,
  };
}
