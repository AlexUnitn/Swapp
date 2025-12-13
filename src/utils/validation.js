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

module.exports = {
    isValidEmail,
    isValidPhoneNumber, 
    isValidPassword
}
