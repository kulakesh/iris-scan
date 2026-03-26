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
        component: lazy(() => import('@/views/iris/face/FaceLandmark')),
        authority: [],
    },
    {
        key: 'iris-scan-complete',
        path: 'iris-scan-complete/',
        component: lazy(() => import('@/views/iris/face/DetectionComplete')),
        authority: [],
    },
]

export default publicRoutes
