<template>
  <div class="billiard-banner">
    <div class="billiard-track">
      <div class="step-item step-1">
        <div class="billiard-ball ball-1">
          <span class="ball-number">1</span>
        </div>
        <span class="step-label">Copier le oneliner</span>
      </div>
      <div class="step-item step-2">
        <div class="billiard-ball ball-2">
          <span class="ball-number">2</span>
        </div>
        <span class="step-label">Coller le json</span>
      </div>
      <div class="step-item step-3">
        <div class="billiard-ball ball-3">
          <div class="flame flame-1"></div>
          <div class="flame flame-2"></div>
          <div class="flame flame-3"></div>
          <div class="flame flame-4"></div>
          <div class="flame flame-5"></div>
          <div class="flame flame-6"></div>
          <div class="flame flame-7"></div>
          <div class="flame flame-8"></div>
          <span class="ball-number">3</span>
        </div>
        <span class="step-label">Admirer le graphe</span>
      </div>
      <div class="cue-stick"></div>
      <div class="cue-stick cue-stick-top"></div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.billiard-banner {
  background: linear-gradient(135deg, #0f3460 0%, #16213e 100%);
  border-radius: 16px;
  padding: 2rem 1rem;
  margin: 1rem 0 1.5rem 0;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.billiard-track {
  position: relative;
  height: 140px;
  overflow: hidden;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
}

.step-1 {
  left: 5.5rem;
  animation: stepOneRoll 3.8s linear infinite;
  will-change: left, opacity;
}

.step-2 {
  left: 5.5rem;
  top: -4rem;
  opacity: 0;
  animation: stepTwoDrop 3.8s linear infinite;
  will-change: top, opacity;
}

.step-3 {
  left: -10rem;
  opacity: 0;
  animation: stepThreeRoll 3.8s linear infinite;
  will-change: left, opacity;
}

.billiard-ball {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4), inset -2px -2px 5px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
  position: relative;
  animation: ballPulse 0.6s ease-in-out infinite;
}

.step-1 .billiard-ball {
  animation: ballPulse 0.6s ease-in-out infinite, ballSpin 0.6s linear infinite;
}

.step-2 .billiard-ball {
  animation: ballPulse 0.6s ease-in-out infinite, ballSpin 0.55s linear infinite;
}

.step-3 .billiard-ball {
  animation: ballDisappear 3.8s linear infinite;
  overflow: visible;
}

.ball-number {
  position: relative;
  z-index: 2;
  font-size: 2.7rem;
  font-weight: 800;
  line-height: 1;
  color: #111;
}

.billiard-ball.ball-1 {
  background: radial-gradient(circle at 30% 30%, #ffe777, #f4c20d 68%, #c99700);
}

.billiard-ball::before {
  content: '';
  position: absolute;
  width: 42px;
  height: 42px;
  background: white;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.12);
}

.billiard-ball.ball-2 {
  background: radial-gradient(circle at 30% 30%, #58a6ff, #1565c0 68%, #0d3d74);
}

.billiard-ball.ball-3 {
  background: radial-gradient(circle at 30% 30%, #ff7a7a, #e53935 68%, #8e1414);
}

@keyframes ballPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes ballSpin {
  0% {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4), inset -2px -2px 5px rgba(0, 0, 0, 0.3);
  }
  50% {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4), inset 2px -2px 5px rgba(0, 0, 0, 0.28);
  }
  100% {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4), inset -2px -2px 5px rgba(0, 0, 0, 0.3);
  }
}

@keyframes stepOneRoll {
  0%, 8% {
    opacity: 1;
    left: 5.5rem;
  }
  10% {
    opacity: 1;
    left: 6.9rem;
  }
  26% {
    opacity: 1;
    left: calc(100% + 14rem);
  }
  29%, 100% {
    opacity: 0;
    left: calc(100% + 14rem);
  }
}

@keyframes stepTwoDrop {
  0%, 32% {
    top: -4rem;
    opacity: 0;
  }
  36% {
    top: 50%;
    opacity: 1;
  }
  42% {
    top: 50%;
    opacity: 1;
  }
  54% {
    top: calc(100% + 5rem);
    opacity: 1;
  }
  57%, 100% {
    top: calc(100% + 5rem);
    opacity: 0;
  }
}

.step-label {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  white-space: nowrap;
  letter-spacing: 0.5px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

/* Cue stick animation */
.cue-stick {
  position: absolute;
  width: 260px;
  height: 8px;
  background: linear-gradient(90deg, #d4a373 0%, #8b6f47 50%, #d4a373 100%);
  border-radius: 4px;
  left: -280px;
  top: 50%;
  transform: translateY(-50%);
  animation: cueStrike 3.8s linear infinite;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.cue-stick::before {
  content: '';
  position: absolute;
  width: 14px;
  height: 10px;
  right: -2px;
  top: 50%;
  transform: translateY(-50%);
  background: #161616;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.cue-stick-top {
  width: 8px;
  height: 190px;
  left: 7.8rem;
  top: -220px;
  transform: none;
  animation: cueStrikeTop 3.8s linear infinite;
}

.cue-stick-top::before {
  width: 10px;
  height: 14px;
  right: 50%;
  top: auto;
  bottom: -2px;
  transform: translateX(50%);
}

@keyframes cueStrike {
  0%, 5% {
    left: -280px;
    transform: translateY(-50%);
    opacity: 1;
  }
  8% {
    left: calc(5.5rem - 272px);
    transform: translateY(-50%);
    opacity: 1;
  }
  10% {
    left: calc(5.5rem - 272px);
    transform: translateY(-50%);
    opacity: 1;
  }
  13% {
    left: -280px;
    transform: translateY(-50%);
    opacity: 1;
  }
  16%, 100% {
    left: -280px;
    transform: translateY(-50%);
    opacity: 0;
  }
}

@keyframes cueStrikeTop {
  0%, 32% {
    top: -200px;
    opacity: 0;
  }
  34% {
    top: -200px;
    opacity: 1;
  }
  37% {
    top: calc(50% - 230px);
    opacity: 1;
  }
  41% {
    top: calc(50% - 230px);
    opacity: 1;
  }
  44% {
    top: -200px;
    opacity: 1;
  }
  47%, 100% {
    top: -200px;
    opacity: 0;
  }
}

@keyframes stepThreeRoll {
  0%, 63% {
    left: -10rem;
    opacity: 0;
  }
  66% {
    left: -10rem;
    opacity: 1;
  }
  75% {
    left: 5.5rem;
    opacity: 1;
  }
  82% {
    left: 5.5rem;
    opacity: 1;
  }
  98% {
    left: 5.5rem;
    opacity: 0;
  }
  100% {
    left: -10rem;
    opacity: 0;
  }
}

@keyframes ballDisappear {
  0%, 82% { transform: scale(1); opacity: 1; }
  96% { transform: scale(0.2); opacity: 0; }
  100% { transform: scale(0); opacity: 0; }
}

.flame {
  position: absolute;
  left: 50%;
  bottom: 90%;
  transform-origin: bottom center;
  border-radius: 50% 50% 20% 20%;
  filter: blur(3px);
  pointer-events: none;
  z-index: 3;
  opacity: 0;
}

.flame-1 {
  width: 22px;
  height: 44px;
  background: linear-gradient(to top, #ff4400, #ffcc00, transparent);
  margin-left: -11px;
  animation: flameBurn1 3.8s linear infinite;
}

.flame-2 {
  width: 14px;
  height: 32px;
  background: linear-gradient(to top, #ff2200, #ff8800, transparent);
  margin-left: 4px;
  animation: flameBurn2 3.8s linear infinite;
}

.flame-3 {
  width: 18px;
  height: 38px;
  background: linear-gradient(to top, #ff6600, #ffee00, transparent);
  margin-left: -24px;
  animation: flameBurn3 3.8s linear infinite;
}

.flame-4 {
  width: 10px;
  height: 26px;
  background: linear-gradient(to top, #ff0000, #ffaa00, transparent);
  margin-left: 14px;
  bottom: 85%;
  animation: flameBurn4 3.8s linear infinite;
}

.flame-5 {
  width: 14px;
  height: 36px;
  background: linear-gradient(to top, #ff3300, #ff9900, transparent);
  margin-left: -33px;
  bottom: 72%;
  animation: flameBurn5 3.8s linear infinite;
}

.flame-6 {
  width: 12px;
  height: 28px;
  background: linear-gradient(to top, #ff1100, #ffbb00, transparent);
  margin-left: 24px;
  bottom: 72%;
  animation: flameBurn6 3.8s linear infinite;
}

.flame-7 {
  width: 30px;
  height: 58px;
  background: linear-gradient(to top, #ff5500, #ffdd00, #ffffff88, transparent);
  margin-left: -15px;
  filter: blur(5px);
  animation: flameBurn7 3.8s linear infinite;
}

.flame-8 {
  width: 8px;
  height: 20px;
  background: linear-gradient(to top, #ff0000, #ff8800, transparent);
  margin-left: -40px;
  bottom: 70%;
  animation: flameBurn8 3.8s linear infinite;
}

@keyframes flameBurn1 {
  0%, 63% { opacity: 0; }
  70% { opacity: 1; transform: scaleX(1) scaleY(1) rotate(-4deg); }
  78% { opacity: 1; transform: scaleX(1.1) scaleY(1.2) rotate(3deg); }
  85% { opacity: 1; transform: scaleX(0.9) scaleY(1.4) rotate(-5deg); }
  92% { opacity: 1; transform: scaleX(1.2) scaleY(1.1) rotate(4deg); }
  97% { opacity: 0; transform: scaleX(0.5) scaleY(0.3); }
  100% { opacity: 0; }
}

@keyframes flameBurn2 {
  0%, 63% { opacity: 0; }
  71% { opacity: 1; transform: scaleX(1) scaleY(1) rotate(6deg); }
  79% { opacity: 1; transform: scaleX(0.8) scaleY(1.3) rotate(-4deg); }
  86% { opacity: 1; transform: scaleX(1.2) scaleY(1) rotate(7deg); }
  93% { opacity: 1; transform: scaleX(0.7) scaleY(1.5) rotate(-3deg); }
  97% { opacity: 0; transform: scaleX(0.3) scaleY(0.2); }
  100% { opacity: 0; }
}

@keyframes flameBurn3 {
  0%, 63% { opacity: 0; }
  72% { opacity: 1; transform: scaleX(1) scaleY(1.1) rotate(2deg); }
  80% { opacity: 1; transform: scaleX(1.1) scaleY(0.9) rotate(-6deg); }
  87% { opacity: 1; transform: scaleX(0.9) scaleY(1.3) rotate(5deg); }
  94% { opacity: 1; transform: scaleX(1.3) scaleY(0.8) rotate(-2deg); }
  97% { opacity: 0; transform: scaleX(0.4) scaleY(0.2); }
  100% { opacity: 0; }
}

@keyframes flameBurn4 {
  0%, 63% { opacity: 0; }
  73% { opacity: 1; transform: scaleX(1) scaleY(1) rotate(-8deg); }
  81% { opacity: 1; transform: scaleX(1.2) scaleY(1.4) rotate(5deg); }
  88% { opacity: 1; transform: scaleX(0.8) scaleY(1.1) rotate(-6deg); }
  95% { opacity: 1; transform: scaleX(1.1) scaleY(1.3) rotate(4deg); }
  97% { opacity: 0; transform: scaleX(0.2) scaleY(0.1); }
  100% { opacity: 0; }
}

@keyframes flameBurn5 {
  0%, 63% { opacity: 0; }
  70% { opacity: 0.9; transform: scaleX(1) scaleY(1) rotate(5deg); }
  77% { opacity: 0.9; transform: scaleX(0.8) scaleY(1.3) rotate(-3deg); }
  84% { opacity: 0.9; transform: scaleX(1.2) scaleY(0.9) rotate(6deg); }
  91% { opacity: 0.9; transform: scaleX(0.9) scaleY(1.4) rotate(-4deg); }
  97% { opacity: 0; transform: scaleX(0.3) scaleY(0.2); }
  100% { opacity: 0; }
}

@keyframes flameBurn6 {
  0%, 63% { opacity: 0; }
  71% { opacity: 0.85; transform: scaleX(1) scaleY(1) rotate(-5deg); }
  79% { opacity: 0.85; transform: scaleX(1.3) scaleY(1.2) rotate(4deg); }
  86% { opacity: 0.85; transform: scaleX(0.7) scaleY(1.5) rotate(-7deg); }
  93% { opacity: 0.85; transform: scaleX(1.1) scaleY(0.9) rotate(3deg); }
  97% { opacity: 0; transform: scaleX(0.4) scaleY(0.15); }
  100% { opacity: 0; }
}

@keyframes flameBurn7 {
  0%, 63% { opacity: 0; }
  69% { opacity: 0.7; transform: scaleX(1) scaleY(1); }
  76% { opacity: 0.75; transform: scaleX(1.1) scaleY(1.15) rotate(2deg); }
  83% { opacity: 0.7; transform: scaleX(0.9) scaleY(1.3) rotate(-3deg); }
  90% { opacity: 0.75; transform: scaleX(1.2) scaleY(1.1) rotate(2deg); }
  97% { opacity: 0; transform: scaleX(0.6) scaleY(0.3); }
  100% { opacity: 0; }
}

@keyframes flameBurn8 {
  0%, 63% { opacity: 0; }
  74% { opacity: 0.8; transform: scaleX(1) scaleY(1) rotate(9deg); }
  82% { opacity: 0.8; transform: scaleX(0.9) scaleY(1.3) rotate(-5deg); }
  89% { opacity: 0.8; transform: scaleX(1.2) scaleY(0.8) rotate(7deg); }
  96% { opacity: 0.8; transform: scaleX(0.7) scaleY(1.2) rotate(-4deg); }
  97% { opacity: 0; transform: scaleX(0.3) scaleY(0.2); }
  100% { opacity: 0; }
}
</style>
