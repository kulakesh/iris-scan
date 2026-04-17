import NavigationBar from './Initiate/components/NavigationBar'
import { useThemeStore } from '@/store/themeStore'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import { useLocation, useNavigate } from 'react-router'
import { ImCreditCard } from 'react-icons/im'
import Button from '@/components/ui/Button'
import { useEffect } from "react";

const Payment = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const return_data = location.state
    
    let mainAppLink = import.meta.env.VITE_APP_API_URL
    mainAppLink = mainAppLink.replace("/api", "")
    const mainAppUrl = mainAppLink + "/member/iris-payment/" + return_data.return_id


    const [isDark, setMode] = useDarkMode()

    const mode = isDark ? MODE_DARK : MODE_LIGHT

    const schema = useThemeStore((state) => state.themeSchema)
    const setSchema = useThemeStore((state) => state.setSchema)

    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }

    useEffect(() => {
        const handleMessage = (event) => {
            // VERY IMPORTANT: allow only mainAppLink origin
            if (event.origin !== mainAppLink) return;
    
        
            if (event.data.status === "OK") {
                navigate("/iris-process-data/" + return_data.return_id)
            }
        };
        
        window.addEventListener("message", handleMessage);
        
        return () => window.removeEventListener("message", handleMessage);
    }, []);

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
                <div className="h-full flex flex-col items-center justify-center">
                    <ImCreditCard size={200} className="text-lg" color="green" />
                    <div className="mt-5 text-center">
                        <h3 className="mb-2">Payment</h3>
                        <p className="text-base">
                            We will redirect you to the payment page
                        </p>
                        <Button
                            variant="solid"
                            className="w-full"
                            onClick={() => {
                                window.open(mainAppUrl)
                            }}
                        >
                            Pay from Wallet
                        </Button>
                    </div>
                </div>
                </div>
            </div>
            
        </main>
    )
}

export default Payment
