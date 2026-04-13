import NavigationBar from './Initiate/components/NavigationBar'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import { useEffect, useState } from 'react'
import ApiService from '@/services/ApiService'
import Spinner from '@/components/ui/Spinner'
import { ImSpinner3, ImCheckmark, ImDownload } from 'react-icons/im'
import { useLocation } from 'react-router'
import { IconText } from '@/components/shared'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'

async function apiGenerateLLM(id){
    return ApiService.fetchDataWithAxios({
        url: '/iris-ai?return_id='+id,
        method: 'get',
        timeout: 1000000,
    })
}
async function apiGenerateJson(id){
    return ApiService.fetchDataWithAxios({
        url: '/iris-ai-gen-json?return_id='+id,
        method: 'get',
        timeout: 1000000,
    })
}
async function apiGenerateReport(id){
    return ApiService.fetchDataWithAxios({
        url: '/iris-ai-report?return_id='+id,
        method: 'get',
        timeout: 1000000,
    })
}
const Initiate = () => {
    const location = useLocation()
    const return_data = location.state

    const [isDark, setMode] = useDarkMode()

    const mode = isDark ? MODE_DARK : MODE_LIGHT

    const [message, setMessage] = useTimeOutMessage()

    const [llmDone, setLlmDone] = useState(false)
    const [jsonDone, setJsonDone] = useState(false)
    const [reportDone, setReportDone] = useState(false)
    const [reportUrl, setReportUrl] = useState(null)
    
    useEffect(() => {
        const runProcess = async () => {
            try {
                const llmResponds = await apiGenerateLLM(return_data.return_id)
                console.log('llmResponds', llmResponds);
                
                if (llmResponds.status === 'OK') {
                    setLlmDone(true)
                    const jsonResponds = await apiGenerateJson(return_data.return_id)
                    console.log('jsonResponds', jsonResponds);
                    if(jsonResponds.status === 'OK'){
                        setJsonDone(true)
                        const reportResponds = await apiGenerateReport(return_data.return_id)
                        console.log('reportResponds', reportResponds);
                        if(reportResponds.status === 'OK'){
                            setReportUrl(reportResponds.url)
                            console.log('reportUrl', reportResponds.url);
                            setReportDone(true)
                        }
                    }
                }
            } catch (e) {
                setMessage?.({
                    text: e.message.toString() || e.toString(),
                    type: 'danger'
                })

            }
        }
        // const testProcess = async () => {
        //     try {
        //         const reportResponds = await apiGenerateReport('VtrMK0nD7aHd')
        //         console.log('reportResponds', reportResponds);
                
        //     } catch (error) {
        //         setApiError(error)
        //     }
        // }
        runProcess();
    }, [])

    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }
    return (
        <main className="px-4 lg:px-0 text-base">
            <NavigationBar toggleMode={toggleMode} mode={mode} />
            <div className="relative">
                <div
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='50' height='50' fill='none' stroke='${mode === MODE_LIGHT ? 'rgb(0 0 0 / 0.04)' : 'rgb(255 255 255 / 0.04)'}'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
                    }}
                    className="absolute inset-0 [mask-image:linear-gradient(to_bottom,white_5%,transparent_70%)] pointer-events-none select-none"
                ></div>
                <div className="p-2 lg:p-4 border border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-700 rounded-2xl lg:rounded-[32px] mt-20 relative lg:mx-10 sm:px-1 lg:px-50">
                    <div className="flex items-center justify-center">
                        <div className="grid grid-rows-1 gap-4">
                        {message && (
                            <Alert showIcon className="mb-4" type={message.type}>
                                <span className="break-all">{message.text}</span>
                            </Alert>
                        )}
                            <div>
                                <IconText
                                    className="text-emerald-500 text-sm font-semibold"
                                    icon={
                                        !llmDone ? ( <Spinner size={30} indicator={ImSpinner3} />)
                                        : ( <ImCheckmark size={30} className="text-lg" /> )
                                    }
                                >
                                    {
                                        !llmDone ? ('Processing data...')
                                        : ( 'Data process complete' )
                                    }
                                </IconText>
                            </div>
                            {llmDone &&
                            <div>
                                <IconText
                                    className="text-emerald-500 text-sm font-semibold"
                                    icon={
                                        !jsonDone ? ( <Spinner size={30} indicator={ImSpinner3} />)
                                        : ( <ImCheckmark size={30} className="text-lg" /> )
                                    }
                                >
                                    {
                                        !jsonDone ? ('Analyzing data...')
                                        : ( 'Data Analysis complete' )
                                    }
                                </IconText>
                            </div>
                            }
                            {llmDone && jsonDone &&
                            <div>
                                <IconText
                                    className="text-emerald-500 text-sm font-semibold"
                                    icon={
                                        !reportDone ? ( <Spinner size={30} indicator={ImSpinner3} />)
                                        : ( <ImCheckmark size={30} className="text-lg" /> )
                                    }
                                >
                                    {
                                        !reportDone ? ('Generating Report...')
                                        : ( 'Report generation complete' )
                                    }
                                </IconText>
                            </div>
                            }
                            {llmDone && reportDone && jsonDone && reportUrl &&
                            <div>
                                <Button
                                    icon={<ImDownload />}
                                    variant="solid"
                                    className="w-full"
                                    onClick={() => {
                                        window.open(reportUrl)
                                    }}
                                >
                                    Download Report
                                </Button>
                            </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
            
        </main>
    )
}

export default Initiate
