import Button from '@/components/ui/Button'
import { motion } from 'framer-motion'
import TextGenerateEffect from './TextGenerateEffect'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import { Form, FormItem, Input } from '@/components/ui'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import ApiService from '@/services/ApiService'

async function pushData(data) {
    return ApiService.fetchDataWithAxios({
        url: '/iris-ai-register',
        method: 'post',
        data,
    })
}
const validationSchema = z.object({
    email: z
        .string()
        .email({ required_error: 'Please enter valid email' })
        .min(1, { message: 'Please enter your email' }),
    phone: z
        .string().refine((value) => /^\d{10,10}$/.test(value), {
            message: "Invalid phone number",
        }),
})

const HeroContent = ({ mode }) => {
    const navigate = useNavigate()
    const {
        handleSubmit,
        reset,
        formState: { errors },
        setError,
        control,
    } = useForm({
        defaultValues: {
            email: '',
            phone: '',
        },
        resolver: zodResolver(validationSchema),
    })
    
    const [message, setMessage] = useTimeOutMessage()
    const onSubmit = async (values) => {
        const{ email, phone } = values
        try{
            const resp = await pushData(values)
            if (resp) {
                console.log('resp in Initiate', resp);
                
                navigate(`/iris-scan`, {
                    state: {
                        email,
                        phone,
                        return_id: resp?.return_id
                    },
                })
            }
        }catch (e) {
            setMessage?.({
                text: e?.response?.data?.message || e.message.toString() || e.toString(),
                type: 'danger'
            })
            for (var key in e?.response?.data?.errors) {
                setError(key, {
                    type: 'manual',
                    message: e?.response?.data?.errors[key],
                })
            }
        }
    }
    return (
        <div className="max-w-7xl mx-auto px-4 flex min-h-screen flex-col items-center justify-between">
            <div className="flex flex-col min-h-screen pt-20 md:pt-40 relative overflow-hidden">
                <div>
                    <TextGenerateEffect
                        wordClassName="text-2xl md:text-4xl lg:text-8xl font-bold max-w-7xl mx-auto text-center mt-6 relative z-10"
                        words="Enter Iris Analysis World Fueled by AI ML"
                        wordsCallbackClass={({ word }) => {
                            if (word === 'Iris') {
                                return 'bg-gradient-to-r from-indigo-600 to-[#be598a] bg-clip-text text-transparent'
                            }

                            if (word === 'Analysis') {
                                return 'bg-gradient-to-r from-[#be598a] to-[#ff6a55] bg-clip-text text-transparent'
                            }

                            return ''
                        }}
                    />
                    <motion.p
                        initial={{ opacity: 0, translateY: 40 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                        className="text-center mt-6 text-base md:text-xl text-muted dark:text-muted-dark max-w-5xl mx-auto relative z-10 font-normal"
                    >
                        Unrivaled precision and speed in precisely 
                        analyzing and unlocking your true Brain 
                        Potential through advanced Iris Analysis 
                        technology!
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, translateY: 40 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ duration: 0.3, delay: 0.6 }}
                        className="flex items-center gap-4 justify-center mt-10 relative z-10"
                    >
                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <div className="flex flex-col md:flex-row gap-4 items-center md:gap-2">
                                <FormItem
                                    invalid={Boolean(errors.email)}
                                    errorMessage={errors.email?.message}
                                    className="mb-0"
                                >
                                    <Controller
                                        name="email"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                type="text"
                                                autoComplete="off"
                                                placeholder="Email"
                                                className={mode === MODE_LIGHT ? 'border-primary' : ''}
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>
                                <FormItem
                                    invalid={Boolean(errors.phone)}
                                    errorMessage={errors.phone?.message}
                                    className="mb-0"
                                >
                                    <Controller
                                        name="phone"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                type="string"
                                                autoComplete="off"
                                                placeholder="Phone"
                                                className={mode === MODE_LIGHT ? 'border-primary' : ''}
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>
                                <FormItem
                                     className="mb-0"
                                >
                                <Button variant="solid" type="submit" className="w-auto">
                                    Preview
                                </Button>
                                </FormItem>
                                    
                            </div>
                        </Form>
                    </motion.div>
                </div>
                <div className="p-2 lg:p-4 border border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-700 rounded-2xl lg:rounded-[32px] mt-20 relative">
                    <div className="absolute inset-x-0 bottom-0 h-40 w-full bg-gradient-to-b from-transparent via-white to-white dark:via-black/50 dark:to-black scale-[1.1] pointer-events-none" />
                    <div className="bg-white dark:bg-black dark:border-gray-700 border border-gray-200 rounded-[24px]">
                        {mode === MODE_LIGHT && (
                            <img
                                className="rounded-2xl lg:rounded-[24px]"
                                src="/img/landing-iris.png"
                                width={1920}
                                height={1040}
                                alt="Ecme homepage"
                            />
                        )}
                        {mode === MODE_DARK && (
                            <img
                                className="rounded-2xl lg:rounded-[24px]"
                                src="/img/landing-iris.png"
                                width={1920}
                                height={1040}
                                alt="Ecme homepage"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeroContent
