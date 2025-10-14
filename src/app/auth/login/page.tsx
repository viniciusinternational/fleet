'use client';
import React, { useEffect } from 'react'

function Login() {

    useEffect(() => {
        // Only redirect after permission is granted and token is loaded

        console.debug('[Login] Redirecting to auth with notification_id')
        const callbackUri = `${window.location.origin}/auth/callback`;
        window.location.href = `https://auth.viniciusint.com/api/v1/zitadel/auth/url?callback_uri=${encodeURIComponent(callbackUri)}&notification_id=123`;

    }, [])
    return (
      
        <></>
    )
}

export default Login