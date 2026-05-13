export const PASSWORD_POLICY_MESSAGE = 'La contrasena debe tener minimo 8 caracteres, una mayuscula, una minuscula y un numero';
export const isPasswordValid = (password) => {
    return (password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /\d/.test(password));
};
//# sourceMappingURL=passwordPolicy.js.map