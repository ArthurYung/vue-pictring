 /* vue-pictring v1.0.0
 * By Arthur Yang http://www.vanoc.top/
 * Github: https://github.com/
 * MIT Licensed.
 */     
import picUp from './pictring.vue'
let vuePic = {
    install : function (Vue, opt) {
    let options = {}
    if(opt) options = opt
    Vue.component('vuePictring', {
      template: '<pic-up ref=vueupfile :max=max :imgType=type :compress=compress :version=version :size=size></pic-up>',
      components: {
        picUp
      },
      data: () => {
        return {
          max: options.max || 9,
          type: options.img || 'img',
          compress: options.compress ? options.compress :  options.compress ===0 ? 0 : '0.8',
          size: options.size || '80',
          version: 'v1.0.0'
        }
      },
      methods: {
        up () {
          return this.$refs.vueupfile.showfiles()
        },
        empty () {
          this.$refs.vueupfile.emptyfiles()
        }
      }
    })
  }
}
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(vuePic)
}
export default vuePic