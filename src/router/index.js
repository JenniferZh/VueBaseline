import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
// import home from '@/pages/home'
// import showjson from '@/pages/showjson'

import layout from '@/pages/layout'
import index from '@/pages/index'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
<<<<<<< HEAD
      name: 'index',
      component: index
    },
    {
      path:'/data',
      name: 'layout',
      component: layout
=======
      name: 'layout',
      component: layout
    },
    {
      path:'/index',
      name:'test',
      component:index
>>>>>>> 87cadcf503a23a7d1d144e0f302993586ce29a16
    }
  ]
})
