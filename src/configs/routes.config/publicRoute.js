import { lazy } from 'react'

const publicRoutes = [
    {
        key: 'initiate',
        path: 'initiate/',
        component: lazy(() => import('@/views/iris/Initiate/Initiate')),
        authority: [],
    },
    {
        key: 'iris-scan',
        path: 'iris-scan/',
        component: lazy(() => import('@/views/iris/face/Scan')),
        authority: [],
    },
    {
        key: 'iris-scan-complete',
        path: 'iris-scan-complete/',
        component: lazy(() => import('@/views/iris/face/DetectionComplete')),
        authority: [],
    },
    {
        key: 'iris-registration',
        path: 'iris-registration/',
        component: lazy(() => import('@/views/iris/Registration/Registration')),
        authority: [],
    },
    {
        key: 'iris-process-data',
        path: 'iris-process-data/',
        component: lazy(() => import('@/views/iris/Process')),
        authority: [],
    }
]

export default publicRoutes
