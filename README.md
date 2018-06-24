# vue-pictring

> 一个基于vue的移动端图片上传插件

* 多选／拍照
* 图片预览／删除

![image text](https://raw.githubusercontent.com/ChuckOu/vue-pictring/master/show.gif)

# npm安装
```js
npm install vue-pictring
```

# 使用插件:

* 引入
```js
import pictring form 'vue-pictring'
Vue.use(pictring, {
  type: 'base', // 上传文件的类型，如果选择'img'插件会将图片以blob储存到FormData里。 默认为'base'(图片数据为base64格式)
  max: 9,  // 允许上传图片的最大张数。  默认为9
  size: 80, // 容器尺寸，可选'px'固定数值，若填入数字则为屏幕百分比
  compress: 0.8, // 图片压缩质量， 0～1 ， 默认为0.8
})
```
* 声明组件
```js
<div id='app'>
  <!--组件使用时需要添加$refs标记用来调用组件内的方法-->
  <vue-pictring ref='$demo'></vue-pictring>
</div>
```

* 图片上传
> 由于上传图片方式的多样性，插件中上传方法只是将图片数据返回成数组或是FormData对象，再由用户自定义上传。
```js
this.$refs.$demo.up() // 根据用户使用插件时所选的type来返回FormData或是base64数组
```

* 清空图片
```js
this.$refs.$demo.empty() // 清空图片
```


# DEMO(Mobile)
- 朋友圈: [http://www.toofook.com/vue-fileup/index.html]

