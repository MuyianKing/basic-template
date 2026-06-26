import FluentVehicleCarParking32Filled from '~icons/fluent/vehicle-car-parking-32-filled'
import MaterialSymbolsBook from '~icons/material-symbols/book'

export default [
  {
    path: '/home',
    component: () => import('@/views/home/Index.vue'),
    meta: {
      title: '首页',
      icon: FluentVehicleCarParking32Filled,
    },
  },
  {
    path: '/form',
    component: () => import('@/views/form/Index.vue'),
    meta: {
      title: '表单查询',
      icon: FluentVehicleCarParking32Filled,
    },
  },
  {
    path: '/test',
    component: () => import('@/views/test/Index.vue'),
    meta: {
      title: '测试',
      icon: MaterialSymbolsBook,
    },
  },
  {
    path: '/test2',
    component: () => import('@/views/test/Index2.vue'),
    meta: {
      title: '测试2',
      icon: MaterialSymbolsBook,
    },
  },
]
