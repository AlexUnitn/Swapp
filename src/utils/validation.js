const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhoneNumber = (phoneNumber) => {
    return /^(\+39)?[0-9]{10,15}$/.test(phoneNumber); 
};

const isValidPassword = (password) => {
    // la password deve essere lunga almeno 8 caratteri e contenere:
    // almeno una lettera maiuscola, 
    // una lettera minuscola, 
    // un numero,
    // uno dei seguenti caratteri speciali: @$!%*?&
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
}

const generateCF = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const digits = '0123456789'
    const rand = (str, len) => Array(len).fill(0).map(() => str[Math.floor(Math.random() * str.length)]).join('')
    return rand(letters, 6) + rand(digits, 2) + rand(letters, 1) + rand(digits, 2) + rand(letters, 1) + rand(digits, 3) + rand(letters, 1)
}

module.exports = {
    isValidEmail,
    isValidPhoneNumber, 
    isValidPassword,
    generateCF
}
