/**
 * @file animation-utils.js
 * @description 动画工具库 - 封装常用动画效果
 */

function fadeIn(duration = 300, delay = 0) {
  return wx.createAnimation({ duration, delay, timingFunction: 'ease-out' })
}

function bounceIn(duration = 500) {
  const anim = wx.createAnimation({ duration, timingFunction: 'ease' })
  anim.scale(1).opacity(1).step()
  return anim.export()
}

function slideIn(direction = 'bottom', distance = 100, duration = 400) {
  return () => {
    const anim = wx.createAnimation({ duration, timingFunction: 'ease-out' })
    switch (direction) {
      case 'bottom': anim.translateY(distance).opacity(0).step({ duration: 0 }); anim.translateY(0).opacity(1).step(); break
      case 'top': anim.translateY(-distance).opacity(0).step({ duration: 0 }); anim.translateY(0).opacity(1).step(); break
      case 'left': anim.translateX(-distance).opacity(0).step({ duration: 0 }); anim.translateX(0).opacity(1).step(); break
      case 'right': anim.translateX(distance).opacity(0).step({ duration: 0 }); anim.translateX(0).opacity(1).step(); break
    }
    return anim.export()
  }
}

function countUp(from, to, duration = 800, onUpdate) {
  const startTime = Date.now()
  const diff = to - from
  function tick() {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 4)
    const current = Math.round(from + diff * eased)
    if (onUpdate) onUpdate(current, progress)
    if (progress < 1) setTimeout(tick, 16)
  }
  tick()
}

function staggerAnimation(count, staggerDelay = 50) {
  return Array.from({ length: count }, (_, i) => ({
    animationData: slideIn('bottom', 60, 300)(),
    delay: i * staggerDelay
  }))
}

module.exports = { fadeIn, bounceIn, slideIn, countUp, staggerAnimation }
