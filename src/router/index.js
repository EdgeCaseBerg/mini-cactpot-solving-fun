import Vue from 'vue'
import VueRouter from 'vue-router'
import Cactpot from '../view/Cactpot.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        component: Cactpot
    }
]

const router = new VueRouter({
    routes,
})

export default router;