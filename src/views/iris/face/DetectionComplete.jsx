import Container from '@/components/shared/Container'
import ScanComplete from '@/assets/svg/ScanComplete'
import { useLocation } from 'react-router'

const DetectionComplete = () => {
    const location = useLocation()
    const return_data = location.state
    console.log('return_data on DetectionComplete', return_data);
    

    return (
        <Container className="h-full">
            <div className="h-full flex flex-col items-center justify-center">
                <ScanComplete height={200} width={200} />
                <div className="mt-10 text-center">
                    <h3 className="mb-2">Scan Complete</h3>
                    <p className="text-base">
                        We will send you an email when the analysis is complete
                    </p>
                </div>
            </div>
        </Container>
    )
}

export default DetectionComplete
