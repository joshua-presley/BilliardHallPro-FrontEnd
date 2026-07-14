import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Paper, TextInput, PasswordInput, Button, Title, Alert, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../context/AuthContext';
import type { LoginCredentials } from '../types/auth';

/**
 * Screen for logging into the application. 
 */
function LoginScreen() { 
    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<LoginCredentials>({
        initialValues: { username: '', password: ''},
        validate: {
            username: (value) => (value.trim().length === 0 ? 'Username is required.': null),
            password: (value) => (value.length === 0 ? 'Password is required.' : null)
        }
    })

    const handleSubmit = async (values: LoginCredentials) => {
        setError(null)
        setIsSubmitting(true)

        try{ 
            await login(values.username, values.password)
            const redirectTo = (location.state as {from?: string})?.from ?? "/"
            navigate(redirectTo, {replace: true})
        }
        catch (err) {
            if(err.response.status === 401) {
                setError('Invalid username or password.')
            }
            else { 
                setError('Something went wrong, please try again.')
            }
        }
        finally { 
            setIsSubmitting(false)
        }
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Paper shadow="sm" p="xl" withBorder w={360}>
        <Title order={2} mb="md">BilliardHallPro</Title>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            {error && <Alert color="red">{error}</Alert>}
            <TextInput
              label="Username"
              placeholder="Enter your username"
              {...form.getInputProps('username')}
            />
            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              {...form.getInputProps('password')}
            />
            <Button type="submit" loading={isSubmitting} fullWidth>
              Log in
            </Button>
          </Stack>
        </form>
      </Paper>
    </div>
    )
}

export default LoginScreen