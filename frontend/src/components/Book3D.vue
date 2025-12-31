<template>
  <figure class="book" :class="coverTypeClass">
    <!-- Front Hardcover -->
    <ul class="hardcover_front">
      <li>
        <div class="coverDesign" :style="coverStyle">
          <div class="cover-texture" :style="textureStyle"></div>
          <div class="cover-title">
            <h4>{{ title }}</h4>
            <p class="page-count">{{ pageCount }} pages</p>
          </div>
        </div>
      </li>
      <li></li>
    </ul>

    <!-- Pages -->
    <ul class="page">
      <li></li>
      <li>
        <div class="page-content">
          <div class="preview-slot"></div>
          <div class="preview-slot"></div>
          <div class="preview-text-lines">
            <div class="text-line"></div>
            <div class="text-line"></div>
            <div class="text-line"></div>
          </div>
        </div>
      </li>
      <li></li>
      <li></li>
      <li></li>
    </ul>

    <!-- Back Hardcover -->
    <ul class="hardcover_back">
      <li></li>
      <li></li>
    </ul>

    <!-- Spine -->
    <ul class="book_spine" :style="spineStyle">
      <li>
        <div class="spine-title">{{ title }}</div>
      </li>
      <li></li>
    </ul>
  </figure>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Untitled Zine'
  },
  pageCount: {
    type: Number,
    default: 0
  },
  coverType: {
    type: String,
    default: 'paperback',
    validator: (value) => ['paperback', 'hardcover'].includes(value)
  },
  coverStyle: {
    type: Object,
    default: () => ({})
  },
  spineStyle: {
    type: Object,
    default: () => ({})
  },
  textureStyle: {
    type: Object,
    default: () => ({})
  }
})

const coverTypeClass = computed(() => `cover-${props.coverType}`)
</script>

<style scoped>
/* Reset */
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* Book Container */
.book {
  position: relative;
  width: 160px;
  height: 220px;
  perspective: 1000px;
  transform-style: preserve-3d;
  margin: 0;
  transition: transform 0.8s ease;
}

/* Shift book to the right when opened to keep spine centered */
.book:hover {
  transform: translateX(60px);
}

/* Background & Color */
.hardcover_front li:first-child {
  backface-visibility: hidden;
}

.hardcover_front li:last-child {
  background: #fffbec;
}

.hardcover_back li:first-child {
  background: #fffbec;
}

.hardcover_back li:last-child {
  background: #fffbec;
}

.book_spine li:first-child {
  background: #eee;
}

.book_spine li:last-child {
  background: #333;
}

/* Thickness of cover */
.hardcover_front li:first-child:after,
.hardcover_front li:first-child:before,
.hardcover_front li:last-child:after,
.hardcover_front li:last-child:before,
.hardcover_back li:first-child:after,
.hardcover_back li:first-child:before,
.hardcover_back li:last-child:after,
.hardcover_back li:last-child:before,
.book_spine li:first-child:after,
.book_spine li:first-child:before,
.book_spine li:last-child:after,
.book_spine li:last-child:before {
  background: #999;
  content: '';
}

/* Page */
.page > li {
  background: linear-gradient(to right, #e1ddd8 0%, #fffbf6 100%);
  box-shadow: inset 0px -1px 2px rgba(50, 50, 50, 0.1), inset -1px 0px 1px rgba(150, 150, 150, 0.2);
  border-radius: 0px 5px 5px 0px;
}

/* Opening cover, back cover and pages */
.hardcover_front {
  transform: rotateY(-34deg) translateZ(8px);
  z-index: 100;
}

.hardcover_back {
  transform: rotateY(-15deg) translateZ(-8px);
}

/* Paperback - much thinner positioning */
.cover-paperback .hardcover_front {
  transform: rotateY(-34deg) translateZ(4px);
}

.cover-paperback .hardcover_back {
  transform: rotateY(-15deg) translateZ(-4px);
}

.page li:nth-child(1) {
  transform: rotateY(-28deg);
}

.page li:nth-child(2) {
  transform: rotateY(-30deg);
}

.page li:nth-child(3) {
  transform: rotateY(-32deg);
}

.page li:nth-child(4) {
  transform: rotateY(-34deg);
}

.page li:nth-child(5) {
  transform: rotateY(-36deg);
}

/* Position, transform & transition */
.hardcover_front,
.hardcover_back,
.book_spine,
.hardcover_front li,
.hardcover_back li,
.book_spine li {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.hardcover_front,
.hardcover_back {
  transform-origin: 0% 100%;
}

.hardcover_front {
  transition: all 0.8s ease, z-index 0.6s;
}

/* HARDCOVER front */
.hardcover_front li:first-child {
  cursor: default;
  user-select: none;
  transform: translateZ(2px);
}

.hardcover_front li:last-child {
  transform: rotateY(180deg) translateZ(2px);
}

/* HARDCOVER back */
.hardcover_back li:first-child {
  transform: translateZ(2px);
}

.hardcover_back li:last-child {
  transform: translateZ(-2px);
}

/* Paperback - thinner covers */
.cover-paperback .hardcover_front li:first-child {
  transform: translateZ(1px);
}

.cover-paperback .hardcover_front li:last-child {
  transform: rotateY(180deg) translateZ(1px);
}

.cover-paperback .hardcover_back li:first-child {
  transform: translateZ(1px);
}

.cover-paperback .hardcover_back li:last-child {
  transform: translateZ(-1px);
}

/* Thickness of cover */
.hardcover_front li:first-child:after,
.hardcover_front li:first-child:before,
.hardcover_front li:last-child:after,
.hardcover_front li:last-child:before,
.hardcover_back li:first-child:after,
.hardcover_back li:first-child:before,
.hardcover_back li:last-child:after,
.hardcover_back li:last-child:before,
.book_spine li:first-child:after,
.book_spine li:first-child:before,
.book_spine li:last-child:after,
.book_spine li:last-child:before {
  position: absolute;
  top: 0;
  left: 0;
}

/* HARDCOVER front */
.hardcover_front li:first-child:after,
.hardcover_front li:first-child:before {
  width: 4px;
  height: 100%;
}

.hardcover_front li:first-child:after {
  transform: rotateY(90deg) translateZ(-2px) translateX(2px);
}

.hardcover_front li:first-child:before {
  transform: rotateY(90deg) translateZ(158px) translateX(2px);
}

.hardcover_front li:last-child:after,
.hardcover_front li:last-child:before {
  width: 4px;
  height: 160px;
}

.hardcover_front li:last-child:after {
  transform: rotateX(90deg) rotateZ(90deg) translateZ(80px) translateX(-2px) translateY(-78px);
}

.hardcover_front li:last-child:before {
  box-shadow: 0px 0px 30px 5px #333;
  transform: rotateX(90deg) rotateZ(90deg) translateZ(-140px) translateX(-2px) translateY(-78px);
}

/* HARDCOVER back thickness */
.hardcover_back li:first-child:after,
.hardcover_back li:first-child:before {
  width: 4px;
  height: 100%;
}

.hardcover_back li:first-child:after {
  transform: rotateY(90deg) translateZ(-2px) translateX(2px);
}

.hardcover_back li:first-child:before {
  transform: rotateY(90deg) translateZ(158px) translateX(2px);
}

.hardcover_back li:last-child:after,
.hardcover_back li:last-child:before {
  width: 4px;
  height: 160px;
}

.hardcover_back li:last-child:after {
  transform: rotateX(90deg) rotateZ(90deg) translateZ(80px) translateX(2px) translateY(-78px);
}

.hardcover_back li:last-child:before {
  box-shadow: 10px -1px 80px 20px #666;
  transform: rotateX(90deg) rotateZ(90deg) translateZ(-140px) translateX(2px) translateY(-78px);
}

/* BOOK SPINE */
.book_spine {
  transform: rotateY(60deg) translateX(-5px) translateZ(-12px);
  width: 16px;
  z-index: 0;
}

.book_spine li:first-child {
  transform: translateZ(2px);
}

.book_spine li:last-child {
  transform: translateZ(-2px);
}

/* Paperback spine positioning */
.cover-paperback .book_spine {
  transform: rotateY(60deg) translateX(-5px) translateZ(-8px);
}

.cover-paperback .book_spine li:first-child {
  transform: translateZ(1px);
}

.cover-paperback .book_spine li:last-child {
  transform: translateZ(-1px);
}

/* Thickness of book spine */
.book_spine li:first-child:after,
.book_spine li:first-child:before {
  width: 4px;
  height: 100%;
}

.book_spine li:first-child:after {
  transform: rotateY(90deg) translateZ(-2px) translateX(2px);
}

.book_spine li:first-child:before {
  transform: rotateY(-90deg) translateZ(-12px);
}

.book_spine li:last-child:after,
.book_spine li:last-child:before {
  width: 4px;
  height: 16px;
}

.book_spine li:last-child:after {
  transform: rotateX(90deg) rotateZ(90deg) translateZ(8px) translateX(2px) translateY(-6px);
}

.book_spine li:last-child:before {
  box-shadow: 5px -1px 100px 40px rgba(0, 0, 0, 0.2);
  transform: rotateX(90deg) rotateZ(90deg) translateZ(-210px) translateX(2px) translateY(-6px);
}

/* Pages */
.page,
.page > li {
  position: absolute;
  top: 0;
  left: 0;
  transform-style: preserve-3d;
}

.page {
  width: 100%;
  height: 98%;
  top: 1%;
  left: 3%;
  z-index: 10;
}

.page > li {
  width: 100%;
  height: 100%;
  transform-origin: left center;
  transition-property: transform;
  transition-timing-function: ease;
}

.page > li:nth-child(1) {
  transition-duration: 0.6s;
}

.page > li:nth-child(2) {
  transition-duration: 0.6s;
}

.page > li:nth-child(3) {
  transition-duration: 0.4s;
}

.page > li:nth-child(4) {
  transition-duration: 0.5s;
}

.page > li:nth-child(5) {
  transition-duration: 0.6s;
}

/* Hover Events */
.book:hover > .hardcover_front {
  transform: rotateY(-145deg) translateZ(0);
  z-index: 0;
}

/* Paperback shifts less since it's thinner */
.cover-paperback:hover {
  transform: translateX(50px);
}

.book:hover > .page li:nth-child(1) {
  transform: rotateY(-30deg);
  transition-duration: 1.5s;
}

.book:hover > .page li:nth-child(2) {
  transform: rotateY(-35deg);
  transition-duration: 1.8s;
}

.book:hover > .page li:nth-child(3) {
  transform: rotateY(-118deg);
  transition-duration: 1.6s;
}

.book:hover > .page li:nth-child(4) {
  transform: rotateY(-130deg);
  transition-duration: 1.4s;
}

.book:hover > .page li:nth-child(5) {
  transform: rotateY(-140deg);
  transition-duration: 1.2s;
}

/* Cover Design */
.coverDesign {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  overflow: hidden;
  backface-visibility: hidden;
}

.coverDesign::after {
  content: '';
  background-image: linear-gradient(-135deg, rgba(255, 255, 255, 0.45) 0%, transparent 100%);
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

/* Cover Title */
.cover-title {
  position: absolute;
  bottom: 30px;
  left: 20px;
  right: 20px;
  z-index: 10;
  color: white;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
}

.cover-title h4 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.cover-title .page-count {
  font-size: 10px;
  font-weight: 500;
  margin: 0;
  opacity: 0.9;
}

/* Cover Texture */
.cover-texture {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0.8;
}

/* Spine Title */
.spine-title {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  letter-spacing: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 200px;
  padding: 10px 0;
}

/* Page Content */
.page-content {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.preview-slot {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #e8e8e8 0%, #f5f5f5 100%);
  border-radius: 4px;
  border: 1px solid rgba(0,0,0,0.08);
  position: relative;
  overflow: hidden;
}

.preview-slot::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  background: rgba(0,0,0,0.1);
  border-radius: 4px;
}

.preview-text-lines {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.text-line {
  height: 3px;
  background: rgba(0,0,0,0.15);
  border-radius: 2px;
}

.text-line:nth-child(1) { width: 90%; }
.text-line:nth-child(2) { width: 85%; }
.text-line:nth-child(3) { width: 70%; }

/* Paperback Styling */
.cover-paperback .cover-title {
  color: #2c2416;
  text-shadow: 0 1px 2px rgba(255,255,255,0.3);
}

.cover-paperback .spine-title {
  color: rgba(44, 36, 22, 0.9);
  text-shadow: 0 1px 1px rgba(255,255,255,0.2);
}

/* Paperback - much thinner (half of hardcover) */
.cover-paperback .book_spine {
  width: 8px;
}

.cover-paperback .book_spine li:first-child:before {
  transform: rotateY(-90deg) translateZ(-6px);
}

/* Paperback - thinner cover */
.cover-paperback .hardcover_front li:first-child:after,
.cover-paperback .hardcover_front li:first-child:before {
  width: 2px;
}

.cover-paperback .hardcover_front li:last-child:after,
.cover-paperback .hardcover_front li:last-child:before {
  width: 2px;
  height: 160px;
}

.cover-paperback .hardcover_back li:first-child:after,
.cover-paperback .hardcover_back li:first-child:before {
  width: 2px;
}

.cover-paperback .hardcover_back li:last-child:after,
.cover-paperback .hardcover_back li:last-child:before {
  width: 2px;
  height: 160px;
}

.cover-paperback .book_spine li:first-child:after,
.cover-paperback .book_spine li:first-child:before {
  width: 2px;
}

.cover-paperback .book_spine li:last-child:after,
.cover-paperback .book_spine li:last-child:before {
  width: 2px;
  height: 8px;
}
</style>
