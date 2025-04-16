#!/bin/bash
cd /Users/juphy/Desktop/guthubpricesmilation
cat src/ExcelLikeApp.vue | head -n 2789 > temp.vue
cat << 'EOF' >> temp.vue

/* Theme-specific pulse animations */
.theme-hacker .online-dot {
  animation: pulse-hacker 1.5s infinite;
}

@keyframes pulse-hacker {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 255, 0, 0.7);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(0, 255, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 255, 0, 0);
  }
}

.theme-terminal .online-dot {
  animation: pulse-terminal 1.5s infinite;
}

@keyframes pulse-terminal {
  0% {
    box-shadow: 0 0 0 0 rgba(168, 168, 168, 0.7);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(168, 168, 168, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(168, 168, 168, 0);
  }
}

.theme-amber .online-dot {
  animation: pulse-amber 1.5s infinite;
}

@keyframes pulse-amber {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 176, 0, 0.7);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(255, 176, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 176, 0, 0);
  }
}
EOF
echo "</style>" >> temp.vue
mv temp.vue src/ExcelLikeApp.vue 