// Funkcije koje manipuliraju s podatcima iz localstorage
import { is_email_or_username_registered, find_and_check_user } from "./loginAndRegistration.js"

export const change_current_user = (user) => { 
    const is_registered = is_email_or_username_registered(user.email, user.username);
    if (is_registered[0] === false && is_registered[1] === false) { // gleda je li email i korisničko ime registrirano
        register_user(user); // dodaje korisnika u listu registriranih korisnika
    } else {
        const registered_user = find_and_check_user(user);
        if (registered_user) {
            user.active_reservations = registered_user.active_reservations;
        }
    }
    localStorage.setItem("current_user", JSON.stringify(user)); // mijenja trenutačnog korisnika u registriranog
}

const register_user = (user) => { // registriranje korisnika (dodaje ga u listu registriranih korisnika)
    if (localStorage.getItem("registered_users") == undefined) {
        localStorage.setItem("registered_users", JSON.stringify([user]))
    } else {
        let registered_users = JSON.parse(localStorage.getItem("registered_users"));   
        registered_users.push(user);
        localStorage.setItem("registered_users", JSON.stringify(registered_users));
    }
}
