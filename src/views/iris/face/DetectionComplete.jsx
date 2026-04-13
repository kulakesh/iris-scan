import Container from '@/components/shared/Container'
import ScanComplete from '@/assets/svg/ScanComplete'
import Button from '@/components/ui/Button'
import { useEffect } from "react";

const DetectionComplete = () => {
    const return_id = 11
    let mainAppLink = import.meta.env.VITE_APP_API_URL
    mainAppLink = mainAppLink.replace("/api", "")
    const mainAppUrl = mainAppLink + "/member/iris-payment/" + return_id
    
    useEffect(() => {
        const handleMessage = (event) => {
          // VERY IMPORTANT: allow only mainAppLink origin
          if (event.origin !== mainAppLink) return;
    
      
          if (event.data.status === "OK") {
            // process success
          }
        };
      
        window.addEventListener("message", handleMessage);
      
        return () => window.removeEventListener("message", handleMessage);
    }, []);
    return (
        <Container className="h-full">
            <div className="h-full flex flex-col items-center justify-center">
                <ScanComplete height={200} width={200} />
                <div className="mt-10 text-center">
                    <h3 className="mb-2">Scan Complete</h3>
                    <p className="text-base">
                        We will send you an email when the analysis is complete
                    </p>
                    <Button
                        variant="solid"
                        className="w-full"
                        onClick={() => {
                            window.open(mainAppUrl)
                        }}
                    >
                        Go to Url
                    </Button>
                </div>
            </div>
        </Container>
    )
}

export default DetectionComplete
