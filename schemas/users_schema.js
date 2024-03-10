/**
 * Модель данных `users`
 */
class Users{
    constructor(surname, name, patronymic, email_address, phone_number, password){
        this.surname = surname,
        this.name = name,
        this.patronymic = patronymic,
        this.email_address = email_address,
        this.phone_number = phone_number,
        this.password = password
    }

    hasNoEmptyField () {
        if(this.surname && this.name && this.patronymic && this.email_address && this.phone_number && this.password) return true
        else return false
    }

    hasValidFields () {
        if(this.FIOCheck() && typeof this.email_address === 'string' && /^[\w\.-]+@([\w-]+\.)+[\w-]{2,20}/.test(this.email_address) && typeof this.phone_number === 'string' && /^79\d{9}/.test(this.phone_number) && typeof this.password === 'string' && /^[A-Za-z0-9!@#$%^&*()=+_:;<>,.{}\|\/[\]-]{8,32}/.test(this.password)){
            return true
        }
        else{
            return false
        }
    }

    FIOCheck () {
        if(/^[А-ЯЁ][а-яё-]+/.test(this.surname) && /^[А-ЯЁ][а-яё-]+/.test(this.name) && /^[А-ЯЁ][а-яё-]+/.test(this.patronymic)){
            return true
        }
        else{
            return false
        }
    }

    middleware
}

module.exports = Users
