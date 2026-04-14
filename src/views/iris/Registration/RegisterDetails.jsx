
import { FormItem, Form } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import ApiService from '@/services/ApiService'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import Alert from '@/components/ui/Alert'
import { useNavigate, useLocation } from 'react-router'
import { useState } from 'react'
import DatePicker from '@/components/ui/DatePicker'
import dayjs from 'dayjs'
import { Select } from '@/components/ui'
import countries from './countries'

const validationSchema = z.object({
    // return_id: z.string(),
    name: z.string().min(4, 'Name Required'),
    email: z
        .string()
        .email({ required_error: 'Please enter valid email' })
        .min(1, { message: 'Please enter your email' }),
    phone: z
        .string().refine((value) => /^\d{10,10}$/.test(value), {
            message: "Invalid phone number",
        }),
    gender: z.string().min(4, 'Gender Required'),
    dob: z.string().min(4, 'Date of birth Required'),
    city: z.string().min(4, 'City Required'),
    state: z.string().min(4, 'State Required'),
    country: z.string().min(4, 'Country Required'),
    
})

async function pushData(data) {
    return ApiService.fetchDataWithAxios({
        url: '/iris-ai-register-all',
        method: 'post',
        data,
    })
}
const RegisterDetails = ({handleRedirect}) => {
    const navigate = useNavigate()
    const location = useLocation()
    const return_data = location.state

    const [loading, setLoading] = useState(false);

    const gender = [
        { label: 'Male', value: 'Male', }, 
        { label: 'Female', value: 'Female', },
    ]
    
    const {
        handleSubmit,
        setValue,
        formState: { errors },
        setError,
        control,
    } = useForm({
        defaultValues: {
            name: '',
            dob: '',
            email: return_data?.email,
            phone: return_data?.phone,
            city: '',
            state: '',
            country: '',
        },
        resolver: zodResolver(validationSchema),
    })

    const [message, setMessage] = useTimeOutMessage()

    const onSubmit = async (values) => {
        const finalValue = { ...values, return_id: return_data?.return_id }

        try{
            setLoading(true)
            const resp = await pushData(finalValue)
            if (resp) {
                setMessage?.({
                    text: resp?.message || 'Successfully Saved',
                    type: 'success'
                })
                handleRedirect(return_data)
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
        setLoading(false)
    }
    const setDateOfBirth = (date) => {
        setValue('dob', dayjs(date).format('YYYY-MM-DD'))
    }
    return (
        <>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                    {message && (
                        <Alert showIcon className="mb-4" type={message.type}>
                            <span className="break-all">{message.text}</span>
                        </Alert>
                    )}
                    <div className="grid lg:grid-cols-2 gap-4">
                        <div>
                            <FormItem
                                asterisk
                                label="Name"
                                invalid={Boolean(errors.name)}
                                errorMessage={errors.name?.message}
                            >
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="text"
                                            autoComplete="off"
                                            placeholder="Full Name"
                                            {...field}
                                        />
                                    )}
                                />
                            </FormItem>
                            <FormItem
                                asterisk
                                label="Gender"
                                invalid={Boolean(errors.gender)}
                                errorMessage={errors.gender?.message}
                            >
                                <Controller
                                    name="gender"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={gender}
                                            placeholder="Gender"
                                            {...field}
                                            value={gender.find(opt => opt.value === field.value) || null}
                                            onChange={(selected) => field.onChange(selected?.value)}
                                        />
                                    )}
                                />
                            </FormItem>
                            <FormItem
                                label="Date of Birth"
                                invalid={Boolean(errors.dob)}
                                errorMessage={errors.dob?.message}
                            >
                                    <DatePicker
                                        placeholder="YYYY-MM-DD"
                                        inputFormat="YYYY-MM-DD"
                                        inputtable
                                        onChange={setDateOfBirth}
                                    />
                            </FormItem>
                            <FormItem
                                label="Email"
                                invalid={Boolean(errors.email)}
                                errorMessage={errors.email?.message}
                            >
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="email"
                                            autoComplete="off"
                                            placeholder="e-mail"
                                            {...field}
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>
                        <div>
                            <FormItem
                                label="Phone"
                                invalid={Boolean(errors.phone)}
                                errorMessage={errors.phone?.message}
                            >
                                <Controller
                                    name="phone"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            autoComplete="off"
                                            placeholder="Phone Number"
                                            {...field}
                                        />
                                    )}
                                />
                            </FormItem>
                            <FormItem
                                label="City"
                                invalid={Boolean(errors.city)}
                                errorMessage={errors.city?.message}
                            >
                                <Controller
                                    name="city"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="text"
                                            autoComplete="off"
                                            placeholder="City Name"
                                            {...field}
                                        />
                                    )}
                                />
                            </FormItem>
                            <FormItem
                                label="State"
                                invalid={Boolean(errors.state)}
                                errorMessage={errors.state?.message}
                            >
                                <Controller
                                    name="state"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="text"
                                            autoComplete="off"
                                            placeholder="State Name"
                                            {...field}
                                        />
                                    )}
                                />
                            </FormItem>
                            <FormItem
                                label="Country"
                                invalid={Boolean(errors.country)}
                                errorMessage={errors.country?.message}
                            >
                                <Controller
                                    name="country"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={countries}
                                            placeholder="Country Name"
                                            {...field}
                                            value={countries.find(opt => opt.value === field.value) || null}
                                            onChange={(selected) => field.onChange(selected?.value)}
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>
                    </div>
                </Card>
                <div className="flex justify-end mt-4">
                <FormItem
                    className="mb-0"
                >
                    <Button loading={loading} variant="solid" type="submit" className="w-auto">
                        Preview
                    </Button>
                </FormItem>
                </div>
            </Form>
        </>
    )
}

export default RegisterDetails

