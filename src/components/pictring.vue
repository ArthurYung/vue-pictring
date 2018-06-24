<template>
  <div>
    <div ref='$PicFloat' class='pic-this' :style = "{width: boxsize + 'px', fontSize: boxsize + 'px' }">
      <figure v-for='(i, index) in ifiles' v-pic-animate='i.fTo' :key='"lp" + index' @click='picShow($event, index)'>
        <img :src='i.url' :class = 'i.ls ? "pic-add-w" : "pic-add-h"' :style='i.imgStyle' v-pic-animate='i.iTo'>
      </figure>
      <transition name='bgFade'>
        <span class='pic-show-bg' v-if='imgShow'></span>
      </transition>
      <span class='add-pictures' v-if='ifiles.length < max' @click='trigger' >
        <input ref='$PicChoseIn' type='file' multiple="multiple" @change='upfies($event)'>
      </span>
    </div>
    <div ref='$PicView' class="pic-view-load" :style='{height: oh + "px", display:viewShow ? "block" : "none"}'>
      <transition name='slide'>
        <div v-if='slide' class="pic-view-revise">
          <span @click='back' class="pic-view-back">返回</span>
          <span @click='remove' class="pic-view-delet"></span>
        </div>
      </transition>
      <div @touchstart = 'touch($event)' @touchmove = 'touch($event)' @touchend = 'touch($event)' class="pic-view-scroll" :style='{width: scrollWidth + "px", transform: scrollIn, transition: duration}'>
        <figure v-for='(i, index) in ifiles' :key='"vp"+index'>
          <img :src='i.url' :class='i.vs ? "pic-view-w" : "pic-view-h"'>
        </figure>
      </div>
    </div>
  </div>
</template>

<script>
import EXIF from 'exif-js'
let ease = 'cubic-bezier(0.1, 0.57, 0.1, 1)'
let prefix = ''
let vendors = { Webkit: 'webkit', Moz: '', O: 'o' }
let wrapper
let transform
let testEl = document.createElement('div')
if (testEl.style.transform === undefined) {
  for (var i in vendors) {
    if (testEl.style[vendors[i] + 'TransitionProperty'] !== undefined) {
      prefix = '-' + vendors[i].toLowerCase() + '-'
      wrapper = vendors
      break
    }
  }
}
transform = prefix ? prefix + 'transform' : 'transform'

function toFormData (base) {
  let arr = base.split(',')
  let mime = arr[0].match(/:(.*?);/)[1]
  let bstr = atob(arr[1])
  let n = bstr.length
  let u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  let obj = new Blob([u8arr], { type: mime })
  return obj
}

// 调换数组顺序
function moved (index, tindex, arr) {
  if (index > tindex) {
    arr.splice(tindex, 0, arr[index])
    arr.splice(index + 1, 1)
  } else {
    arr.splice(tindex + 1, 0, arr[index])
    arr.splice(index, 1)
  }
}

export default {
  data: () => {
    return {
      index: 0,
      ifiles: [],
      ow: document.documentElement.clientWidth,
      oh: document.documentElement.clientHeight,
      viewShow: false,
      imgShow: false,
      slide: false,
      scorll: 0,
      range: {
        start: 0,
        startEnd: 0,
        move: 0,
        moveEnd: 0,
        end: 0,
        startTime: 0,
        endTime: 0,
        isMove: false,
        touchUp: true
      }
    }
  },
  computed: {
    boxsize () {
      return (isNaN(this.size) ? this.size : (this.ow / 100) * parseInt(this.size))
    },
    scrollWidth () {
      return this.ifiles.length * (this.ow + 16)
    },
    duration () {
      return transform + ' ' + (this.range.touchUp ? 0 : 300) + 'ms ' + ease
    },
    scrollMax () {
      return (1 - this.ifiles.length) * (this.ow + 16)
    },
    scrollIn () {
      return 'translate3d(' + this.scorll + 'px,0,0)'
    },
    touchMoving () {
      if (this.scorll >= 0) {
        return (this.range.moveEnd + 1) * 0.5
      } else if (this.range.moveEnd <= this.scrollMax) {
        return this.scrollMax - (Math.abs(this.range.start - this.range.move)) * 0.5
      } else {
        return this.range.moveEnd
      }
    }
  },
  methods: {
    showfiles () {
      let result = this.imgType === 'img' ? new FormData() : []
      for (let i = 0; i < this.ifiles.length; i++) {
        if (this.imgType === 'img') {
          let date = new Date().getTime()
          result.append('img-' + i, this.ifiles[i].data, date + '.png')
        } else {
          result.push(this.ifiles[i].data)
        }
      }
      return result
    },
    emptyfiles () {
      this.ifiles = []
    },
    figCenter (img) {
      let position = {
        x: this.ow / 2 - img.offsetWidth / 2 - img.getBoundingClientRect().left,
        y: this.oh / 2 - img.offsetHeight / 2 - img.getBoundingClientRect().top,
        n: ((this.ow / img.offsetWidth) * img.offsetHeight) > this.oh ? this.oh / img.offsetHeight : this.ow / img.offsetWidth
      }
      return position
    },
    trigger (e) {
      this.$refs.$PicChoseIn.click()
    },
    upfies (v) {
      let that = this;
      [].slice.call(v.target.files).forEach(function (file, i) {
          let rander = new FileReader()
          rander.onload = function () {
            let result = this.result
            let img = new Image()
            let canvas = document.createElement('canvas')
            let context = canvas.getContext('2d')
            let imgData = {}
            let Orientation = null
            img.onload = function () {
              canvas.width = 1080
              canvas.height = (this.height / this.width) * 1080
              context.clearRect(0, 0, canvas.width, canvas.height)
              context.drawImage(img, 0, 0, canvas.width, canvas.height)
              EXIF.getData(this, function () {
                EXIF.getAllTags(this)
                Orientation = EXIF.getTag(this, 'Orientation')
              })
              if (Orientation !== '' && Orientation !== 1) {
                alert('旋转处理' + Orientation)
                switch (Orientation) {
                  case 6:// 需要顺时针（向左）90度旋转
                    [canvas.width, canvas.height] = [canvas.height, canvas.width]
                    context.rotate(90 * Math.PI / 180)
                    context.drawImage(img, 0, -canvas.width, canvas.height, canvas.width)
                    break
                  case 8:// 需要逆时针（向右）90度旋转
                    [canvas.width, canvas.height] = [canvas.height, canvas.width]
                    context.rotate(-90 * Math.PI / 180)
                    context.drawImage(img, -canvas.height, 0, canvas.height, canvas.width)
                    break
                  case 3:// 需要180度旋转
                    context.rotate(180 * Math.PI / 180)
                    break
                }
              }
              imgData.data = canvas.toDataURL('image/jpeg', that.compress)
              imgData.url = imgData.data
              imgData.fTo = {}
              imgData.iTo = {}
              imgData.ls = canvas.width > canvas.height
              imgData.vs = (that.ow / canvas.width) * canvas.height < that.oh
              let margin = canvas.width < canvas.height ? ((that.boxsize - 8) / 3) * (canvas.height / canvas.width)
                : ((that.boxsize - 8) / 3) * (canvas.width / canvas.height)
              imgData.imgStyle = {
                marginTop: canvas.width < canvas.height ? -margin / 2 + 'px' : '',
                marginLeft: canvas.width > canvas.height ? -margin / 2 + 'px' : ''
              }
              if (that.ifiles.length < that.max) {
                if (that.compress) {
                  (that.imgType === 'img') && (imgData.data = toFormData(imgData.data))
                } else {
                  imgData.data = result
                }
                that.ifiles.push(imgData)
              }
            }
            img.src = result
          }
          rander.readAsDataURL(file)
      })
      v.target.value = ''
    },
    picShow (e, i) {
      let that = this
      let img = e.target.firstChild
      let position = this.figCenter(img)
      e.target.style.overflow = 'visible'
      e.target.style.zIndex = 720
      this.index = i
      this.imgShow = true
      this.scorll = -this.index * (this.ow + 16)
      this.ifiles[i].fTo = {
        to: {
          transform: prefix + 'translate3d(' + position.x + 'px,' + position.y + 'px,0)'
        },
        fn: function () {
          that.viewShow = true
          this.style = ''
          that.slide = true
        }
      }
      this.ifiles[i].iTo = {
        to: {
          transform: prefix + 'scale(' + position.n + ')'
        },
        fn: function () {
          this.style[transform] = ''
        }
      }
    },
    back () {
      let fig = this.$refs.$PicFloat.childNodes[this.index]
      let position = this.figCenter(fig.firstChild)
      let that = this
      this.imgShow = this.viewShow = this.slide = false
      fig.style[transform] = prefix + 'translate3d(' + position.x + 'px,' + position.y + 'px,0)'
      fig.style.zIndex = 720
      fig.style.overflow = 'visible'
      fig.firstChild.style[transform] = prefix + 'scale(' + position.n + ')'
      setTimeout(() => {
        that.ifiles[that.index].fTo = {
          to: {
            transform: prefix + 'translate3d(0,0,0)'
          },
          fn: function () {
            that.style = ''
          }
        }
        that.ifiles[that.index].iTo = {
          to: {
            transform: prefix + 'scale(1)'
          },
          fn: function () {
            this.parentNode.style = ''
          }
        }
      }, 0)
    },
    remove () {
      if (this.index === 0 && this.ifiles.length === 1) {
        this.imgShow = this.viewShow = this.slide = false 
        return this.$delete(this.ifiles, this.index)
      } else if (this.index === this.ifiles.length - 1) {
        this.scorll = this.scorll + this.ow + 16
        this.$delete(this.ifiles, this.index)
        return this.index--
      }
      this.$delete(this.ifiles, this.index)
    },
    touch (event) {
      event.preventDefault()
      if (event.type === 'touchstart') {
        this.range.startTime = new Date().getTime()
        this.range.start = Math.floor(event.touches[0].pageX)
        this.range.startEnd = Math.floor(event.touches[0].pageX) - this.scorll
        this.range.isMove = true
      } else if (event.type === 'touchmove') {
        this.range.move = Math.floor(event.touches[0].pageX)
        if (this.range.move !== this.range.start) this.range.isMove = this.slide = false
        this.range.moveEnd = this.range.move - this.range.startEnd
        this.range.touchUp = true
        this.scorll = this.touchMoving
      } else if (event.type === 'touchend' || event.type === 'touchcancel') {
        this.range.end = Math.floor(event.changedTouches[0].pageX)
        this.range.move = this.range.end - this.range.start
        this.range.endTime = new Date().getTime()
        if (((this.range.endTime - this.range.startTime) < 300 && Math.abs(this.range.move) > 30) || Math.abs(this.range.move) > this.ow * 0.6) {
          if (this.range.move < 0) {
            this.index === this.ifiles.length - 1 ? this.index : this.index++
          } else if (this.range.move > 0) {
            this.index === 0 ? this.index : this.index--
          }
        } else if ((this.range.endTime - this.range.startTime) < 300 && Math.abs(this.range.move) < 30) {
          this.slide = true
        }
        this.range.touchUp = false
        this.scorll = -this.index * (this.ow + 16)
      }
    }
  },
  directives: {
    picAnimate: {
      bind: (el, binding) => {
        el.addEventListener(prefix ? wrapper + 'TransitionEnd' : 'transitionend', function () {
          this.style[prefix + 'transition'] = ''
          this.$animate.call(el)
          this.$animate = function () { }
        })
      },
      update: (el, binding) => {
        if (binding.value === binding.oldValue) return
        let transitions = []
        for (let v in binding.value.to) {
          el.style[v] = binding.value.to[v]
          transitions.push(v)
        }
        el.style[prefix + 'transition'] = transitions + ' 300ms ' + ease
        el.$animate = binding.value.fn || function () {}
      }
    }
  },
  mounted: function () {
    document.body.appendChild(this.$refs.$PicView)
    console.log('vue-pictring @version:' + this.version)
  },
  props: ['max', 'imgType', 'compress', 'size', 'version']
}

// 添加tap事件
</script>
<style rel="stylesheet/css">
  body{margin:0}.pic-this{margin-left:auto;margin-right:auto}.pic-this:after{content:"";display:block;clear:both}.pic-this .pic-show-bg{position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:710;background-color:#000}.pic-this figure{width:calc((1em - 8px) / 3);height:calc((1em - 8px) / 3);margin:0 4px 4px 0;float:left;overflow:hidden;position:relative;z-index:700}.pic-this figure:nth-child(3),.pic-this figure:nth-child(6),.pic-this figure:nth-child(9){margin:0 0 4px}.pic-this figure img{position:absolute;display:block;pointer-events:none;-webkit-pointer-events:none;-ms-pointer-events:none;-moz-pointer-events:none}.pic-this figure img.pic-add-w{height:100%;left:50%;top:0}.pic-this figure img.pic-add-h{width:100%;left:0;top:50%}.add-pictures{width:calc((1em - 8px) / 3);height:calc((1em - 8px) / 3);float:left;overflow:hidden;position:relative;background-color:#e8e8e8}.add-pictures input{display:none}.add-pictures:before{width:40%;height:2%;left:30%;top:49%}.add-pictures:after,.add-pictures:before{content:"";position:absolute;display:block;background-color:#999}.add-pictures:after{width:2%;height:40%;left:49%;top:30%}.pic-view-load{position:fixed;left:0;top:0;display:none;width:100vw;z-index:990;background-color:#000;overflow:hidden}.pic-view-load .pic-view-revise{position:absolute;left:0;top:0;width:100%;z-index:920;line-height:3rem;color:#fff;font-size:1.2rem;background-color:rgba(0,0,0,.7);font-family:'"Microsoft YaHei","MicrosoftJhengHei","STHeiti","MingLiu","PingFangSC-Regular", sans-serif'}.pic-view-load .pic-view-revise .pic-view-back{float:left;margin-left:1.5em;width:3em}.pic-view-load .pic-view-revise .pic-view-back:before{content:"";display:block;background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFFmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDE4LTA1LTI5VDIxOjIzOjQ3KzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAxOC0wNS0yOVQyMToyNDozNyswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxOC0wNS0yOVQyMToyNDozNyswODowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowYTEzZjdhMy02YTdlLTRj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");width:1.2em;height:2.9rem;background-size:100%;background-repeat:no-repeat;background-position:50%;position:absolute;left:.3em;top:0}.pic-view-load .pic-view-revise .pic-view-delet{float:right;font-size:1.1em;width:2.3em;height:2.9rem;background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFFmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDE4LTA1LTI5VDIxOjE1OjE3KzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAxOC0wNS0yOVQyMToxNzoxNiswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxOC0wNS0yOVQyMToxNzoxNiswODowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo0OGQxNmJjYS1iN2IxLTQ4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");background-position:50%;background-repeat:no-repeat;background-size:46%}.pic-view-load .pic-view-scroll{position:absolute;left:0;top:0;height:100%;z-index:910}.pic-view-load .pic-view-scroll figure{width:100vw;height:100%;float:left;position:relative;margin:0 16px 0 0}.pic-view-load .pic-view-scroll figure img{position:absolute;display:block;pointer-events:none;-webkit-pointer-events:none;-ms-pointer-events:none;-moz-pointer-events:none}.pic-view-load .pic-view-scroll figure img.pic-view-h{transform:translate(-50%);-webkit-transform:translate(-50%);-o-transform:translate(-50%);height:100%;top:0;left:50%}.pic-view-load .pic-view-scroll figure img.pic-view-w{transform:translateY(-50%);-webkit-transform:translateY(-50%);-o-transform:translateY(-50%);width:100%;left:0;top:50%}.bgFade-enter-active,.bgFade-leave-active{transition:opacity .3s}.bgFade-enter,.bgFade-leave-to{opacity:0}.slide-enter-active,.slide-leave-active{transition:.3s ease-out}.slide-enter,.slide-leave-to{opacity:0;transform:translate3d(0,-100%,0)}
</style>
