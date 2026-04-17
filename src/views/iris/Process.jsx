import NavigationBar from './Initiate/components/NavigationBar'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import { useEffect, useState } from 'react'
import ApiService from '@/services/ApiService'
import Spinner from '@/components/ui/Spinner'
import { ImSpinner3, ImCheckmark, ImMail , ImDownload } from 'react-icons/im'
import { useParams } from 'react-router'
import { IconText } from '@/components/shared'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'

async function apiGetStatusCode(id){
    return ApiService.fetchDataWithAxios({
        url: '/iris-ai-status/'+id,
        method: 'get',
    })
}
async function apiGenerateLLM(id){
    return ApiService.fetchDataWithAxios({
        url: '/iris-ai/'+id,
        method: 'get',
        timeout: 1000000,
    })
}
async function apiGenerateJson(id){
    return ApiService.fetchDataWithAxios({
        url: '/iris-ai-gen-json/'+id,
        method: 'get',
    })
}
async function apiGenerateReport(id){
    return ApiService.fetchDataWithAxios({
        url: '/iris-ai-report/'+id,
        method: 'get',
        timeout: 1000000,
    })
}
async function apiSendEmail(id){
    return ApiService.fetchDataWithAxios({
        url: '/iris-ai-email/'+id,
        method: 'get',
    })
}
const Initiate = () => {
    const { return_id } = useParams()

    const [isDark, setMode] = useDarkMode()

    const mode = isDark ? MODE_DARK : MODE_LIGHT

    const [message, setMessage] = useTimeOutMessage()

    const [statusCode, setStatusCode] = useState(null)
    const [llmDone, setLlmDone] = useState(false)
    const [jsonDone, setJsonDone] = useState(false)
    const [reportDone, setReportDone] = useState(false)
    const [reportUrl, setReportUrl] = useState(null)
    const [sentEmail, setSentEmail] = useState(false)

    useEffect(() => {
        const runProcess = async () => {
            const irisStatus = await apiGetStatusCode(return_id)
            if (irisStatus.status === 'OK') {
                if(irisStatus.status_code > 0)
                    setLlmDone(true)

                if(irisStatus.status_code > 1)
                    setJsonDone(true)

                if(irisStatus.status_code > 2){
                    setReportUrl(irisStatus.url)
                    setReportDone(true)
                }

                if(irisStatus.status_code > 3)
                    setSentEmail(true)

                // console.log('status code from server :' + irisStatus.status_code)
                setStatusCode(irisStatus.status_code)
            }
        }
        runProcess()
    }, [])
    useEffect(() => {
        const runProcess = async () => {
            try {
                console.log('status code', statusCode)
                if(statusCode === 0){
                    const llmResponds = await apiGenerateLLM(return_id)
                    if (llmResponds.status === 'OK') {
                        setStatusCode(1)
                        setLlmDone(true)
                    }
                }
                if(statusCode === 1){
                    const jsonResponds = await apiGenerateJson(return_id)
                    if (jsonResponds.status === 'OK') {
                        setStatusCode(2)
                        setJsonDone(true)
                    }
                }
                if(statusCode === 2){
                    const reportResponds = await apiGenerateReport(return_id)
                    if (reportResponds.status === 'OK') {
                        setStatusCode(3)
                        setReportUrl(reportResponds.url)
                        setReportDone(true)
                    }
                }
                if(statusCode === 3){
                    const emailResponds = await apiSendEmail(return_id)
                    if (emailResponds.status === 'OK') {
                        // setStatusCode(4)
                        setSentEmail(true)
                    }
                }

            } catch (e) {
                setMessage?.({
                    text: e.message.toString() || e.toString(),
                    type: 'danger'
                })
            }
        }
        runProcess()
    }, [statusCode])
    // useEffect(() => {
    //     const runProcess = async () => {
    //         try {
    //             const llmResponds = await apiGenerateLLM(return_data.return_id)
    //             if (llmResponds.status === 'OK') {
    //                 setLlmDone(true)
    //                 const jsonResponds = await apiGenerateJson(return_data.return_id)
    //                 if(jsonResponds.status === 'OK'){
    //                     setJsonDone(true)
    //                     const reportResponds = await apiGenerateReport(return_data.return_id)
    //                     if(reportResponds.status === 'OK'){
    //                         setReportUrl(reportResponds.url)
    //                         setReportDone(true)
    //                     }
    //                 }
    //             }
    //         } catch (e) {
    //             setMessage?.({
    //                 text: e.message.toString() || e.toString(),
    //                 type: 'danger'
    //             })

    //         }
    //     }
    //     runProcess()
    // }, [])

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
                            {llmDone && reportDone && jsonDone && reportUrl && sentEmail &&
                            <div>
                                <IconText
                                    className="text-gray-500 text-sm font-semibold"
                                    icon={<ImMail className="text-lg" />}
                                >
                                    Report sent to email
                                </IconText>
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
