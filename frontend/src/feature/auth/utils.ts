export function validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error("正しいメールアドレスを入力してください");
    }
};

export function validatePassword(password: string): void {
    if (8 > password.length || password.length > 64) {
        throw new Error("パスワードは8文字以上64文字以内で入力してください");
    }
};

export function validateUsername(username: string): void {
    if (username.length > 64) {
        throw new Error("ユーザー名は64文字以内で入力してください");
    }
};