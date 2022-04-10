import { change_current_user } from "./localstorage.js"

const prijava_gumb = document.querySelector(".prijava"); // dohvačamo gumb koji mijenja formu u formu za prijavu
const registracija_gumb = document.querySelector(".registracija"); // također s registraijskim gumbom

prijava_gumb.addEventListener("click", switch_form);
registracija_gumb.addEventListener("click", switch_form);

let submit_buttons = document.getElementsByClassName("submit");

for (let submit_button of submit_buttons) { // za svaku od gumbova na formama dodaje event listener (reg. i prij.)
    submit_button.addEventListener("click", (e) => {
        e.preventDefault(); // da se ne osvježi stranica

        let enabled = document.querySelector(".display-flex").children; 
        if (enabled.length > 4) { // enabled označuje formu koju trenutačno gledamo, ako je duljina forme 4, to znači da se nalazimo na registraciji
            if (enabled[2].value == enabled[3].value) {
                console.log(enabled[2].value, enabled[3].value)
                if (enabled[2].classList.length == 2) {
                    remove_error_border(enabled[2], enabled[3]);
                    //enabled[2].classList.remove("error-border");
                    //enabled[3].classList.remove("error-border");
                }
                const user_info = {
                    email: enabled[0].value,
                    username: enabled[1].value,
                    password: enabled[2].value,
                    active_reservations: undefined,
                    ratings: undefined,
                };

                let check_email_and_username = is_email_or_username_registered(enabled[0].value, enabled[1].value); // ovo je niz koji sadrži 2 vrijednosti koje su true ili false, ako je e-pošta registrirana, prva vrijednost je true i isto tako za korisničko ime npr. [true, false] znači da je email već registriran
                if (check_email_and_username[0] || check_email_and_username[1]) {
                    // ako korisnikov email je već registriran (korišten), promjenjuje boju bordera u crveno
                    if (check_email_and_username[0]) {
                        let email_input = enabled[0]
                        email_input.classList.add("error-border"); 
                        email_input.value = ""; // upozorava korisnika da je e-pošta već registrirana
                        email_input.placeholder = "E-mail već registriran!"
                    } 

                    if (check_email_and_username[1]) {
                        let username_input = enabled[1]
                        username_input.classList.add("error-border");
                        username_input.value = ""; 
                        username_input.placeholder = "Korisničko ime već registrirano!"
                    }
                } else {
                    // ako korisnikov email nije već registriran, mijenja trenutačnog korisnika u registriranoga i stavlja ga u listu registriranih korisnika 
                    change_current_user(user_info);
                    remove_error_border(enabled[0], enabled[1]); // miče crveni border ako je korisnik napisao već iskorištenu e-poštu ili korisničko ime
                }

            } else {
                add_error_border(enabled[2], enabled[3]);
            }

        } else { // ako se korisnik prijavio, ne registrirao
            const user_info = {
                    email: enabled[0].value,
                    password: enabled[1].value,
                };

            const login_user = find_and_check_user(user_info); // true ako korisnik postoji, false ako ne

            if (login_user === false) {
                add_error_border(enabled[0], enabled[1]) // dodaje crveni border jer korisnik ne postoji
            } else {
                change_current_user(user_info); // mijenja trenutačnog korisnika u upravo prijavljenog
                remove_error_border(enabled[0], enabled[1]); // ako korisnik je prijašnji put falio, a ovaj put pogodio, miče crveni border
            }


        }
    })
}

const switch_form = () => { // mijenja trenutačnu formu (prijava ili registracija)
    let disabled = document.querySelector(".display-none");
    let enabled = document.querySelector(".display-flex");

    disabled.classList.remove("display-none"); // dodaje display-none neaktiviranom, a display-fle aktiviranom. također miče prijašnje display klase
    disabled.classList.add("display-flex");

    enabled.classList.remove("display-flex");
    enabled.classList.add("display-none");

    switch_button(); // mijanja aktivirani botun
};

const switch_button = () => { // dodaje svjetliju boju aktiviranome botunu i dodaje tamniju boju neaktiviraniom
    const activated = document.querySelector(".activated");
    const not_activated = document.querySelector(".notactivated");

    activated.classList.remove("activated");
    not_activated.classList.add("activated");

    not_activated.classList.remove("notactivated");
    activated.classList.add("notactivated");
}

export const is_email_or_username_registered = (target_email, target_username) => { // provjerava je li email koji je korisnik unjeo već registriran
    // try - catch je tu ako se dogodi da ne postoji niti jedan korisnik pa onda izbaci error i ostatak programa ne radi
    let return_values = [false, false]
    try {
        let registered_users = JSON.parse(localStorage.getItem("registered_users"));

        for (const registered of registered_users) {
            if (target_email === registered.email) {
                return_values[0] = true;
            }
            
            if (target_username === registered.username) {
                return_values[1] = true;
            }
        }

        return return_values;
    } catch (e) {
        return return_values;
    }
}

const find_and_check_user = (user) => { // funckija koja traži je li korisnik unjeo točnu e-poštu i lozinku, vraća false ako ne nađe, a user_info ako nađe
    const registered_users = JSON.parse(localStorage.getItem("registered_users")); 
    try { // try - catch je iz gore navedenog razloga (linija 103)
        for (const registered_user of registered_users) {
            if (user.email === registered_user.email && user.password === registered_user.password) {
                return registered_user;
            }
        }
    } catch (e) {
        return false;
    }

    return false;
}

const add_error_border = (...args) => { // dodaje error border (napomena, ...args je način kako možemo primati neodređeni broj argumenata u funkciji na način da sve argumente spremamo u listu zvanu args)
    for (const element of args) {
        element.classList.add("error-border");
    }
}

const remove_error_border = (...args) => {
    for (const element of args) {
        element.classList.remove("error-border");
    }
}