"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { checkEmail, login, signup } from "./services";

import { validateEmail, validatePassword, validateUsername } from "./utils";

export function useLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const isFormValid = isEmailValid && isPasswordValid;

    const emailHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        const validateResult = validateEmail(e.target.value);
        if (validateResult.valid) {
            setIsEmailValid(true);
            setError("");
        } else {
            setIsEmailValid(false);
            setError(validateResult.message);
        }
    }
    const passwordHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        const validateResult = validatePassword(e.target.value);
        if (validateResult.valid) {
            setIsPasswordValid(true);
            setError("");
        } else {
            setError(validateResult.message);
            setIsPasswordValid(false);
        }
    }

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!isFormValid) {
            return;
        }
        const token = await login({email, password}).catch((err) => {
            setError(err.message);
        });
        if (token) {
            const navigate = useNavigate();
            navigate("/think");
        }
        // いずれはRoute Handlerを利用してHttpOnly Cookieでトークンを管理するように
    };

    return {
        email,
        password,
        error,
        isFormValid,
        emailHandler,
        passwordHandler,
        submit,
    };
}


export function useSignup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [isUsernameValid, setIsUsernameValid] = useState(false);
    const isFormValid = isEmailValid && isPasswordValid && isUsernameValid;

    const emailHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        const validateResult = validateEmail(e.target.value);
        if (validateResult.valid) {
            setIsEmailValid(true);
            setError("");
        } else {
            setIsEmailValid(false);
            setError(validateResult.message);
        }
    }
    const passwordHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        const validateResult = validatePassword(e.target.value);
        if (validateResult.valid) {
            setIsPasswordValid(true);
            setError("");
        } else {
            setError(validateResult.message);
            setIsPasswordValid(false);
        }
    }
    const usernameHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
        const validateResult = validateUsername(e.target.value);
        if (validateResult.valid) {
            setIsUsernameValid(true);
            setError("");
        } else {
            setIsUsernameValid(false);
            setError(validateResult.message);
        }
    }

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();

        const token = await signup({email, password, username}).catch((err) => {
            setError(err.message);
        });
        const navigate = useNavigate();
        if (token) {
            navigate("/think");
        }
    };

    return {
        email,
        password,
        username,
        error,
        isFormValid,
        emailHandler,
        passwordHandler,
        usernameHandler,
        submit,
    };
}

export function useCheckEmail() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isEmailValid, setIsEmailValid] = useState(false);
    const isFormValid = isEmailValid;

    const emailHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        const validateResult = validateEmail(e.target.value);
        if (validateResult.valid) {
            setIsEmailValid(true);
            setError("");
        } else {
            setIsEmailValid(false);
            setError(validateResult.message);
        }
    }

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!isFormValid) {
            return;
        }
        const token = await checkEmail({email}).catch((err) => {
            setError(err.message);
        });
        if (token) {
            const navigate = useNavigate();
            navigate("/check-email");
        }
    };

    return {
        email,
        error,
        isFormValid,
        emailHandler,
        submit,
    };
}