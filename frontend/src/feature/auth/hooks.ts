"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "./services";

import { validateEmail, validatePassword } from "./utils";

export function useLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);

    const emailHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        try {
            validateEmail(e.target.value);
            setIsEmailValid(true);
            setError("");
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
                setIsEmailValid(false);
            }
        }
    }
    const passwordHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        try {
            validatePassword(e.target.value);
            setIsPasswordValid(true);
            setError("");
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
                setIsPasswordValid(false);
            }
        }
    }

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();

        const token = await login({email, password}).catch((err) => {
            setError(err.message);
        });
        if (token) {
            const navigate = useNavigate();
            navigate("/think");
        }
        // いずれはRoute Handlerを利用してHttpOnly Cookieでトークンを管理するように
    };

    const isFormValid = isEmailValid && isPasswordValid;
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