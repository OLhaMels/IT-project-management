import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { PostHogProvider } from '@posthog/react'

const options = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  person_profiles: 'identified_only',
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <PostHogProvider apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN} options={options}>
            <App />
        </PostHogProvider>
    </React.StrictMode>,
)
