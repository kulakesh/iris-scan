import { lazy } from 'react'
import authRoute from './authRoute'
import othersRoute from './othersRoute'
import publicRoute from './publicRoute'

export const publicRoutes = [...authRoute, ...publicRoute]

export const protectedRoutes = [
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },
    
    ...othersRoute,
]
