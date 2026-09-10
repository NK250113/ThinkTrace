type ValidationResult = {
    valid: boolean;
    message: string;
};
export function validateEmail(email: string): ValidationResult {
    if (email.length === 0) {
        return {
            valid: false,
            message: "メールアドレスを入力してください"
        };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            valid: false,
            message: "メールアドレスの形式が正しくありません"
        };
    }
    return {
        valid: true,
        message: ""
    };
}
export function validatePassword(password: string): ValidationResult {
    if (password.length === 0) {
        return {
            valid: false,
            message: "パスワードを入力してください"
        };
    }
    if (8 > password.length || password.length > 64) {
        return {
            valid: false,
            message: "パスワードは8文字以上64文字以内で入力してください"
        };
    }
    return {
        valid: true,
        message: ""
    };
}

export function validateUsername(username: string): ValidationResult {
    if (username.length === 0) {
        return {
            valid: false,
            message: "ユーザー名を入力してください"
        };
    }
    if (username.length > 64) {
        return {
            valid: false,
            message: "ユーザー名は64文字以内で入力してください"
        };
    }
    return {
        valid: true,
        message: ""
    };
}