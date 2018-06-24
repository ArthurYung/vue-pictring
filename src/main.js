// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
// import pic from './components/index.js'
// Vue.config.productionTip = false
// Vue.use(pic,{
//   size: 84
// })
new Vue({
  el: '#app',
  data: {
    saysome:''
  },
  methods:{
    go(){
      let m = this.$refs.test.up()
      alert(this.saysome,m)
      console.log(this.saysome,m)
      this.$refs.test.empty()
      this.saysome = ''
    },
    empty () {
      this.saysome = ''
      this.$refs.test.empty()
    }
  }
})
