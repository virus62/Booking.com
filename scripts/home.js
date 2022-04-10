// Dio koda zadužen za "home" stranicu

const change_selected_item = (event) => {
    const target = event.target;
    const target_parent = target.parentElement;
    const job_name = find_job_by_job_name(target_parent.children[1].innerHTML);
    if (job_name) {
        const element_div = document.createElement("div");
        element_div.classList.add("selected-item-div");
        let element_h2 = document.createElement("h2");
        if (job_name.ime.length > 33) {
            element_h2 = document.createElement("h3");
        }
        const element_p = document.createElement("p");
        const element_h5 = document.createElement("h5");
        const element_h52 = document.createElement("h5");
        const element_h42 = document.createElement("h4");
        const element_h53 = document.createElement("h5");
        element_h53.innerHTML = `Kontakt: ${job_name.kontakt}`
        const button_x = document.createElement("button");
        button_x.innerHTML = "X";
        button_x.classList.add("button-x");
        button_x.addEventListener("click", hide_selected);
        const days = document.createElement("div");
        element_h2.innerHTML = job_name.ime;
        element_p.innerHTML = job_name.opis;
        element_h5.innerHTML = "Cjena: " + job_name.cijena + " kn"
        let starting_minutes = JSON.stringify((job_name.radno_vrijeme[0] - Math.floor(job_name.radno_vrijeme[0]))*60);
        let ending_minutes = JSON.stringify((job_name.radno_vrijeme[1] - Math.floor(job_name.radno_vrijeme[1]))*60);
        if (starting_minutes.length == 1) {
            starting_minutes = "0" + starting_minutes;
        } 

        if (ending_minutes.length == 1) {
            ending_minutes = "0" + ending_minutes;
        }
        element_h52.innerHTML = "Radno vrijeme: od " + Math.floor(job_name.radno_vrijeme[0])+ ":" + starting_minutes + " do " +  Math.floor(job_name.radno_vrijeme[1]) + ":" + ending_minutes
        element_h42.innerHTML = "Odaberi željeni dan:"
        days.classList.add("days")
        let current_weekday = new Date();
        current_weekday = current_weekday.getDay();

        let date_table = {
            0: "Ned",
            1: "Pon",
            2: "Uto",
            3: "Sri",
            4: "Čet",
            5: "Pet",
            6: "Sub",
            7: "Ned",
            8: "Pon",
            9: "Uto",
            10: "Sri",
            11: "Čet",
            12: "Pet",
            13: "Sub",
            14: "Ned"
        }

        for (let i = current_weekday; i < current_weekday + 7; i++) {
            let weekday = document.createElement("div");
            weekday.classList.add("weekday");
            if (i == current_weekday) {
                weekday.classList.add("weekday-activated");
            }
            weekday.innerHTML = date_table[i]
            weekday.addEventListener("click", change_selected_weekday)
            days.appendChild(weekday);
        }

        element_div.appendChild(button_x); element_div.appendChild(element_h2); element_div.appendChild(element_p); element_div.appendChild(element_h5); element_div.appendChild(element_h52); element_div.appendChild(element_h53); element_div.appendChild(days);

        const selected_item = document.querySelector(".selected-item");
        if (selected_item.children.length !== 1) {
            selected_item.children[0].classList.add("display-none");   
        }
        selected_item.children[selected_item.children.length - 1].classList.remove("display-none"); 
        selected_item.insertBefore(element_div, selected_item.firstChild);
        const success_messages = document.querySelectorAll(".success_message");
        for (const success_message of success_messages) {
            success_message.classList.add("display-none");
        }
        display_unavalible_times();

        let comments_div = document.querySelector(".comments")
        for (const comment of comments_div.children) {
            comment.classList.add("display-none");
        }
        const comments = job_name.komentari;

        for (const comment of comments) {
            let comment_data = document.createElement("p");
            comment_data.innerHTML = `<strong style="color: #515151;">${comment.from}</strong>: ${comment.data}`
            comments_div.appendChild(comment_data);
        }

        const comment_button = document.querySelector(".comment-button");
        comment_button.addEventListener("click", add_comment);
    }  
}

const is_reservation_valid = (event) => {
    let target = event.target;
    let from_minutes = parseInt(target.parentElement.parentElement.children[1].children[0].children[1].children[0].value) * 60 + parseInt(target.parentElement.parentElement.children[1].children[0].children[1].children[2].value)
    let to_minutes = parseInt(target.parentElement.parentElement.children[1].children[1].children[1].children[0].value) * 60 + parseInt(target.parentElement.parentElement.children[1].children[1].children[1].children[2].value);
    let element = target.parentElement.parentElement.parentElement.children[0].children[1];
    const job = find_job_by_job_name(element.innerHTML);
    let selected_day = document.querySelector(".weekday-activated");
    const maximum_length = job.max_duljina_termina;
    let date_table = {
        "Pon": "Ponedjeljak",
        "Uto": "Utorak",
        "Sri": "Srijeda",
        "Čet": "Četvrtak",
        "Pet": "Petak",
        "Sub": "Subota",
        "Ned": "Nedjelja"
    }
    if (from_minutes >= to_minutes) {
        if (from_minutes >= (23*60) || to_minutes > 0 || to_minutes < (23*60)) {
            if (24*60 - from_minutes + to_minutes >  maximum_length) {
                make_reservation_invalid("Maksimalna duljina termina u " + job.ime + " je " + maximum_length);
                return
            }
        } else {
            make_reservation_invalid("Od vrijednost ne može biti veća ili jednaka od do vrijednosti");
            return;
        }
    } 
    if (isNaN(from_minutes) || isNaN(to_minutes)) {
        make_reservation_invalid("Molimo unesite od i/ili do vrijednost");
        return;
    } 

    if (to_minutes - from_minutes > maximum_length) {
        make_reservation_invalid("Maksimalna duljina termina u " + job.ime + " je " + maximum_length);
        return
    }
    if (from_minutes >= (24 * 60) || to_minutes >= (24 * 60) || to_minutes < 0 || from_minutes < 0) {
        make_reservation_invalid("Od ili do vrijednost ne smije biti veća od 23:59 ili manja od 00:00")
        return
    }

    if (find_reserved_times(from_minutes, to_minutes, date_table[selected_day.innerHTML])) {
        make_reservation_invalid("Termin je već rezerviran u odabranome vremenskom razdoblju")
        return
    }

    if (from_minutes >= (job.radno_vrijeme[0] * 60) === false || to_minutes <= (job.radno_vrijeme[1] * 60) === false) {
        make_reservation_invalid('Termin nije unutar radnog vremena usluge "' + job.ime + '"')
        return
    }

    let day = selected_day.innerHTML
    day = date_table[day];
    reserve_reservation(job, [from_minutes, to_minutes], day)
    return
};

const hide_selected = (event) => {
    const selected_item = document.querySelector(".selected-item");
    for (let item of selected_item.children) {
        item.classList.add("display-none");
    }
}

const make_reservation_invalid = (reason) => {
    const div_termin = document.querySelector(".termin");
    if (div_termin.children.length > 2) {
        div_termin.children[div_termin.children.length - 1].classList.remove("error_message");
        div_termin.children[div_termin.children.length - 1].classList.remove("success_message");
        div_termin.children[div_termin.children.length - 1].classList.add("display-none");
    }
    let error_message = document.createElement("div");
    error_message.classList.add("error_message")
    let error_text = document.createElement("p")
    error_text.textContent = reason
    error_message.appendChild(error_text)
    div_termin.appendChild(error_message);
}

async function reserve_reservation (job, time1, day) {
    const div_termin = document.querySelector(".termin");
    if (div_termin.children.length > 2) {
        div_termin.children[div_termin.children.length - 1].classList.remove("error_message");
        div_termin.children[div_termin.children.length - 1].classList.add("display-none");
    }
    let success_message = document.createElement("div");
    success_message.classList.add("success_message")
    let success_text = document.createElement("p")
    success_text.textContent = '"' + job.ime + '" je uspješno rezerviran!'
    success_message.appendChild(success_text)
    div_termin.appendChild(success_message);

    let current_user = JSON.parse(localStorage.getItem("current_user"));
    current_user.active_reservations.push([job, time1, day]);
    localStorage.setItem("current_user", JSON.stringify(current_user));

    let registered_users = JSON.parse(localStorage.getItem("registered_users"));
    for (const registered_user of registered_users) {
        if (registered_user.email == current_user.email) {
            registered_user.active_reservations.push([job, time1, day]);
        }
    }
    localStorage.setItem("registered_users", JSON.stringify(registered_users));
    const time = find_time();

    let date_table = {
        "Pon": "Ponedjeljak",
        "Uto": "Utorak",
        "Sri": "Srijeda",
        "Čet": "Četvrtak",
        "Pet": "Petak",
        "Sub": "Subota",
        "Ned": "Nedjelja"
    }

    const moji_termini = document.querySelector("#cool-text2");
    const reserved_job = document.createElement("div");
    reserved_job.classList.add("reserved-card")
    reserved_job.style.background = `linear-gradient(to right, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.2)), url("${job.background}") center`;
    const reserved_job_text = document.createElement("h3");
    const reserved_job_time = document.createElement("h4");
    const reserved_job_weekday = document.createElement("h4");
    reserved_job_time.textContent = time[0] + ":" + time[1] + " do " + time[2] + ":" + time[3];
    reserved_job_text.textContent = job.ime;
    let weekday_name = document.querySelector(".weekday-activated").innerHTML;
    weekday_name = date_table[weekday_name];
    reserved_job_weekday.textContent = weekday_name;
    reserved_job.appendChild(reserved_job_text);
    reserved_job.appendChild(reserved_job_weekday);
    reserved_job.appendChild(reserved_job_time);
    moji_termini.appendChild(reserved_job);
    const fof = document.querySelector(".fof2");
    fof.classList.add("display-none");
    /*
    const card_container = document.querySelector(".card-container");
    for (const card of card_container.children) {
        if (card.children[0].innerHTML == job.ime) {
            card.classList.add("display-none")
            card.classList.remove("card")
        }
    }
    */
    await sleep(3500);
    hide_selected()
}

const find_selected_job = () => {
    const jobs = document.querySelectorAll(".selected-item-div");
    for (const job of jobs) {
        if (job.classList.contains(".display-none") === false) {
            return job.children[1].innerHTML;
        }
    }
    return false;
}

const find_time = () => {
    const div_termin = document.querySelector(".termin");
    let div_od1 = div_termin.children[0].children[1].children[0].value;
    let div_od2 = div_termin.children[0].children[1].children[2].value;
    let div_do1 =  div_termin.children[1].children[1].children[0].value;
    let div_do2 = div_termin.children[1].children[1].children[2].value;
    let whole_time = [div_od1, div_od2, div_do1, div_do2]
    for (let i = 0; i < whole_time.length; i++) {
        if ([...whole_time[i].toString()].length == 0) {
            whole_time[i] = "00"
        }
        else if ([...whole_time[i].toString()][0] !== "0" && [...whole_time[i].toString()].length == 1) {
            whole_time[i] = "0" + whole_time[i].toString();
        }
    }
    return whole_time;
}

const find_reserved_times = (starting_time, ending_time, weekday) => {
    let length1 = 0
     if (starting_time >= (23*60) || ending_time <= 120) {
        length1 = 24 * 60 - starting_time + ending_time
    } else {
        length1 = ending_time - starting_time
    }
    const reserved_cards = document.getElementsByClassName("reserved-card");
    for (let i = 0; i < reserved_cards.length; i++) {
        let reserved_card = reserved_cards[i]
        let h4 = reserved_card.children[2].innerHTML;
        let time1 = (parseInt(h4.split("")[0] + h4.split("")[1]) )* 60
        time1 += parseInt(h4.split("")[3]) + parseInt(h4.split("")[4])
        let time2 = parseInt(h4.split("")[9] + h4.split("")[10]);
        time2 = time2 * 60
        let time3 = parseInt(h4.split("")[12]) + parseInt(h4.split("")[13])
        time2 += time3
        let weekday2 = reserved_card.children[1].innerHTML;
        let cond_1 = (ending_time <= time2) && (ending_time >= time1)
        let cond_2 = (starting_time <= time2) && (starting_time >= time1)
        let length2 = 0
        if (time1 >= (23*60) || time2 <= 120) {
            length2 = 24 * 60 - time1 + time2
        } else {
            length2 = time2 - time1
        }
        let cond_3 = (ending_time > time2) && (starting_time < time1) && (length2 < length1)
        if ((cond_1 || cond_2 || cond_3) && weekday === weekday2) {
            return true;
        }
    }
    return false;
}

const return_reserved_times = (weekday) => {
    const reserved_cards = document.getElementsByClassName("reserved-card");
    const reserved_times = [];
    for (let i = 0; i < reserved_cards.length; i++) {
        let reserved_card = reserved_cards[i]
        let h4 = reserved_card.children[2].innerHTML;
        let weekday2 = reserved_card.children[1].innerHTML;
        if (weekday2 === weekday) {
            reserved_times.push(h4);
        }
    }
    return reserved_times;
}

const display_unavalible_times = () => {
        let date_table = {
            "Pon": "Ponedjeljak",
            "Uto": "Utorak",
            "Sri": "Srijeda",
            "Čet": "Četvrtak",
            "Pet": "Petak",
            "Sub": "Subota",
            "Ned": "Nedjelja"
        }   
        let current_weekday = document.querySelector(".weekday-activated").innerHTML;
        current_weekday = date_table[current_weekday];
        const nedostupni_termini_div = document.querySelector(".nedostupni-termini-div");
        const nedostupni_termini = return_reserved_times(current_weekday);
        const nema_nedostupnih_termina = document.querySelector(".nema-nedostupnih-termina");
        if (nedostupni_termini.length > 0) {
            for (let element of nedostupni_termini_div.children) {
                element.classList.add("display-none");
            }
            let h3 = document.createElement("h3");
            h3.innerHTML = current_weekday;
            let line = document.createElement("hr");
            line.classList.add("termin-hr")
            nedostupni_termini_div.appendChild(h3); nedostupni_termini_div.appendChild(line);
            for (let nedostupni_termin of nedostupni_termini) {
                let h4 = document.createElement("h4");
                h4.innerHTML = nedostupni_termin;
                h4.classList.add("unavalible-time")
                nedostupni_termini_div.appendChild(h4);

            }
        } else {
            for (let element of nedostupni_termini_div.children) {
                element.classList.add("display-none");
            }
            nema_nedostupnih_termina.classList.remove("display-none")
        }
}

const add_comment = (event) => {
    event.preventDefault();
    const input = event.target.parentElement.children[0].value;
    if (input == undefined || input == null || input == "") { return; }
    const comments_div = document.querySelector(".comments");
    const comment = document.createElement("p");
    const user = JSON.parse(localStorage.getItem("current_user"));
    comment.innerHTML =  `<strong style="color: #515151;">${user.username}</strong>: ${input}`;
    comments_div.appendChild(comment);
    const name = find_selected_job();
    if (name) {
        const job = find_job_by_job_name(name);
        if (job) {
            let all_jobs = JSON.parse(localStorage.getItem("usluge"));
            for (let all_job of all_jobs) {
                if (all_job.ime === job.ime) {
                    all_job.komentari.push({from: user.username, data: input});
                }
            }
            localStorage.setItem("usluge", JSON.stringify(all_jobs))
            let test = JSON.parse(localStorage.getItem("usluge"))[0];
        }   
    }
}

const convert_time = (val1, val2) => {
    let time = [Math.floor(val1 / 60), (val1 % 60), Math.floor(val2 / 60), (val2 % 60)]
    for (let i = 0; i < time.length; i++) {
        if ([...time[i].toString()][0] == "0") {
            time[i] = "00"
        }
        else if ([...time[i].toString()][0] !== "0" && [...time[i].toString()].length == 1) {
            time[i] = "0" + time[i].toString();
        }
    }
    return time;
}

const change_selected_weekday = (event) => {
    const target = event.target;
    if (target.classList.contains("weekday-activated") === false ) {
        for (const element of target.parentElement.children) {
            if (element.classList.contains("weekday-activated")) {
                element.classList.remove("weekday-activated");
            }
        }
        target.classList.add("weekday-activated");
    } 
    display_unavalible_times();
}

const find_job_by_job_name = (job_name) => {
    const usluge = JSON.parse(localStorage.getItem("usluge"));
    for (const usluga of usluge) {
        if (usluga.ime == job_name) {
            return usluga;
        }
    }
    return false;
}

const add_to_favourites = (event) => {
    const target = event.target;
    const title = target.parentElement.children[1].innerHTML;
    const job = find_job_by_job_name(title);
    if (job && is_favourited(title) == false) {
        const card_div = document.createElement("div");
        card_div.style.background = `linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.2)), url("${job.background}") center`;
        card_div.classList.add("card2");
        card_div.classList.add("favourite-card");
        const card_title = document.createElement("h2");
        if (title.length > 30) {
            const card_title = document.createElement("h3")
        }
        card_title.innerHTML = title;
        const card_button = document.createElement("button");
        card_button.classList.add("card-button3")
        card_button.innerHTML = "Rezerviraj"
        const card_remove_from_favourites = document.createElement("img");
        card_remove_from_favourites.src = "../assets/star-64.png"
        card_remove_from_favourites.style.width = "30px"
        card_remove_from_favourites.style.marginBottom = "3px"
        card_remove_from_favourites.classList.add("star-button")
        card_button.addEventListener("click", change_selected_item);
        card_remove_from_favourites.addEventListener("click", remove_from_favourites);
        const moji_favoriti = document.querySelector("#cool-text");
        const fof = document.querySelector(".fof");
        fof.classList.add("display-none");
        card_div.appendChild(card_remove_from_favourites); card_div.appendChild(card_title); card_div.appendChild(card_button);
        moji_favoriti.appendChild(card_div);

        const current_user = JSON.parse(localStorage.getItem("current_user"));
        current_user.ratings.push(job);

        localStorage.setItem("current_user", JSON.stringify(current_user));
        sync_favourites(current_user);
    }
}

const is_favourited = (title) => {
    const moji_favoriti = document.querySelector("#cool-text");
    for (const favorit of moji_favoriti.children) {
        try {
        if (favorit.children[1].innerHTML == title && favorit.classList.contains("display-none") == false) {
            return true;
        }
        } catch (e) {
            continue
        }
    }
    return false;
}

const remove_from_favourites = (event) => {
    const target = event.target;
    const parent = target.parentElement;
    parent.classList.add("display-none");
    const favoruites_list = parent.parentElement;
    let are_all_display_none = true;
    for (const favourite of favoruites_list.children) {
        if (favourite.classList.contains("display-none") == false) {
            are_all_display_none = false;
        }
    }
    if (are_all_display_none) {
        const fof = document.querySelector(".fof");
        fof.classList.remove("display-none");
    }

    const current_user = JSON.parse(localStorage.getItem("current_user"));
    for (let i = 0; i < current_user.ratings.length; i++) {
        if (current_user.ratings[i].ime === parent.children[1].innerHTML) {
            current_user.ratings.splice(i, 1);
        }
    }
    localStorage.setItem("current_user", JSON.stringify(current_user))
    sync_favourites(current_user);
}

const sync_favourites = (user) => {
    const registered_users = JSON.parse(localStorage.getItem("registered_users"));
    for (let i = 0; i < registered_users.length; i++) {
        if (registered_users[i].email === user.email && registered_users[i].password === user.password) {
            registered_users[i] = user;
            let aaa =  JSON.stringify(registered_users);
            localStorage.setItem("registered_users", aaa)
            return
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let user = JSON.parse(localStorage.getItem("current_user"));
const userButton = document.querySelector(".kor-ime");
const prijavaButton = document.querySelector(".prijava");

try {
    userButton.innerHTML = "Pozdrav, " + user.username;
} catch (e) {
    prijavaButton.innerHTML = "Prijavi se"
    userButton.classList.add("display-none");
}

prijavaButton.addEventListener("click", (event) => {
    localStorage.removeItem("current_user");
    location.href = "../../index.html"
})

let usluge = [];
if (JSON.parse(localStorage.getItem("usluge")) === undefined || JSON.parse(localStorage.getItem("usluge")) === null) {
    console.log("hello")
    const frizer = {
        ime: "Tončev Frizerski Salon",
        opis: "Tončev Frizerski Salon je frizerski salon koji nudi najbolje frizure za djecu i tinejdžere u gradu Zadru. Tončev Frizerski Salon operira zadnjih 30 g. i to s dobrim razlogom. Kroz naše 30 g. operiranja mi smo šišali djecu na razno-razne populrane stilove. Cijena šišanja djeteta u Tončevom Frizerskom Salonu je samo 30kn. Nadamo se da ćete i vi ošišati vaše djete u Tončevom Frizerskome Salonu!",
        cijena: 30,
        radno_vrijeme: [6.5, 15.5],
        max_duljina_termina: 120,
        komentari: [{from: "Tonči Crljen", data: "Ovo mjesto je grozno! 0/5! Želim povratak novca!"}],
        kontakt: "099 721 0727",
        background: '../assets/barber.png',
    }

    const pizzerija = {
        ime: "Karlova Pizzeria",
        opis: "Karlova Pizzerija je jedan od najboljih pizzerija u gradu Splitu. Karlova Pizzerija utemeljena je 2000.g. i do dan danas proizvodi ukusne pizze za sve svoje korisnike. Vrste pizza koje se mogu naručiti su: miješana, vegetarijanska, quattro formaggi, seljačka i pleća u veličinama mala, srednja, velika i jumbo. Cijene za navedene pizze ovise o veličini: mala - 25kn, srednja - 50kn, velika - 70kn i jumbo - 100kn. Nadamo se da ćete uživati u našoj prekrasnoj pizzi!",
        cijena: "25 - 100",
        radno_vrijeme: [9.25, 22.5],
        max_duljina_termina: 60,
        komentari: [{from: "Viktor Viljac", data: "Pizza je bila supp!!"}],
        kontakt: "092 754 0153",
        background: 'https://media-cdn.tripadvisor.com/media/photo-s/1a/b8/46/6d/london-stock.jpg',
    }

    const popravak_računala = {
        ime: 'Popravak Računala "Viktor"', 
        opis: 'Popravak Računala "Viktor" popravlja digitalne uređaje i računala zadnjih 20 g. operacije. Ima li tvoj mobitel pukotine na ekranu? Jesi li slučajno prolio kavu preko svog novog MacBook-a? Jesi li udario monitor nakon što si izgubio u videoigrici i sad ne možeš koristiti računalo? Ako ste na ikojih od navedenih pitanja odgovorili da, slobodno pošaljite uređaj na popravak Viktoru. Cijena nije fiksna i ovisi o veličini štete i teškoći popravka. Neka ti uređaj bude kao nov s Viktorom!',
        cijena: "-",
        radno_vrijeme: [10, 16.5],
        max_duljina_termina: 30,
        komentari: [{from: "Karlo Grgić", data: "3/5, uređaj mi radi predivno nakon što sam ga poslao na popravak, ali popravak je trajao 3 mjeseca. Malo previše dugo vremena za čekati bez mobitela."}],
        kontakt: "095 829 6432",
        background: '../assets/pc-repair.png',
    }

    const satovi_pjevanja = {
        ime: 'Satovi pjevanja "Bariton"', 
        opis: 'Satovi pjevanja "Bariton" uče osobe sviju dobi u pjevajnu i ojačanju svojih vokalnih sposobnosti. Neki od najuspješnijih osoba koji su naučili lijepše pjevati kroz naše satove su: Tony Cetinski, Jacques Houdek, Nina Bardić... Nadamo se da češ i ti jednog dana početi lijepše pjevati s nama!',
        cijena: "150",
        radno_vrijeme: [12, 17.5],
        max_duljina_termina: 200,
        komentari: [{from: "Tony Cetinski", data: "👍"}],
        kontakt: "097 529 4536",
        background: '../assets/pjevanje.png',
    }

    const sportska_dvorana = {
        ime: 'Sportska Dvorana "Sokolana"', 
        opis: 'Sportska Dvorana "Sokolana" je najveća sportska dvorana u cijelom gradu Kaštela. U sportskoj dvorani se mogu nači rekviziti, oprema i sastavni dijelovi najigranijih sportova uključujući: košarku, nogomet, rukomet, odbojku... Sportska dvorana "Sokolana" želi ti zabavno vrijeme igrajući svoje najdraže sportove!',
        cijena: "50",
        radno_vrijeme: [8, 22.5],
        max_duljina_termina: 360,
        komentari: [{from: "LeBron James", data: "Dobar teren :)"}],
        kontakt: "099 1129 4302",
        background: '../assets/dvorana.jpg',
    }
    usluge = [frizer, pizzerija, popravak_računala, satovi_pjevanja, sportska_dvorana]
} else {
    usluge = JSON.parse(localStorage.getItem("usluge"));
}


localStorage.setItem("usluge", JSON.stringify(usluge));

const cardContainer = document.querySelector(".card-container");

for (const usluga of usluge) {
    let card_div = document.createElement("div");
    card_div.classList.add("card")
    //console.log(usluga.background)
    card_div.style.background = `linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.2)), url("${usluga.background}") center`;
    let card_h2 = document.createElement("h2");
    if (usluga.ime.length > 33) {
        card_h2 = document.createElement("h3");
    }
    let card_button = document.createElement("button");
    card_button.classList.add("card-button")
    let star_button = document.createElement("img");
    star_button.src = "../assets/star-64.png";
    star_button.classList.add("star-button")
    star_button.width = 30
    star_button.style.marginBottom = "3px"
    star_button.addEventListener("click", add_to_favourites);
    card_div.appendChild(star_button)
    card_div.appendChild(card_h2); card_div.appendChild(card_button); 
    card_h2.innerHTML = usluga.ime; card_button.innerHTML = "Rezerviraj";
    card_button.addEventListener("click", change_selected_item);
    cardContainer.appendChild(card_div);
}

const reserve_button = document.querySelector(".rezerviraj-termin");

reserve_button.addEventListener("click", is_reservation_valid);

if (user.ratings.length > 0) {
    const fof = document.querySelector(".fof");
    fof.classList.add("display-none");
    const favourites = document.querySelector("#cool-text");
    for (let favourite of user.ratings) {
        const card_div = document.createElement("div");
        card_div.style.background = `linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.2)), url("${favourite.background}") center`;
        card_div.classList.add("card2");
        card_div.classList.add("favourite-card");
        const card_title = document.createElement("h2");
        if (favourite.ime.length > 30) {
            const card_title = document.createElement("h3")
        }
        card_title.innerHTML = favourite.ime;
        const card_button = document.createElement("button");
        card_button.classList.add("card-button3")
        card_button.innerHTML = "Rezerviraj"
        const card_remove_from_favourites = document.createElement("img");
        card_remove_from_favourites.src = "../assets/star-64.png"
        card_remove_from_favourites.style.width = "30px"
        card_remove_from_favourites.style.marginBottom = "3px"
        card_remove_from_favourites.classList.add("star-button")
        card_button.addEventListener("click", change_selected_item);
        card_remove_from_favourites.addEventListener("click", remove_from_favourites);
        card_div.appendChild(card_remove_from_favourites); card_div.appendChild(card_title); card_div.appendChild(card_button);
        favourites.appendChild(card_div);
    }
}
if (user.active_reservations.length > 0) {
    const fof = document.querySelector(".fof2");
    fof.classList.add("display-none");
    const reserved_jobs = document.querySelector("#cool-text2");
    for (let i = 0; i < user.active_reservations.length; i++) {
        let reserved_job = user.active_reservations[i][0]
        console.log(reserved_job)
        const reserved_job1 = document.createElement("div");
        reserved_job1.classList.add("reserved-card")
        reserved_job1.style.background = `linear-gradient(to right, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.2)), url("${reserved_job.background}") center`;
        const reserved_job_text = document.createElement("h3");
        const reserved_job_weekday = document.createElement("h4");
        let reserved_job_time = document.createElement("h4");
        reserved_job_text.textContent = reserved_job.ime;
        let job_time = convert_time(user.active_reservations[i][1][0], user.active_reservations[i][1][1]);
        reserved_job_time.innerHTML = job_time[0] + ":" + job_time[1] + " do " + job_time[2] + ":" + job_time[3]
        reserved_job_weekday.innerHTML = user.active_reservations[i][2]
        reserved_job1.appendChild(reserved_job_text);
        reserved_job1.appendChild(reserved_job_weekday);
        reserved_job1.appendChild(reserved_job_time);
        reserved_jobs.appendChild(reserved_job1);
        /*
        const card_container = document.querySelector(".card-container");
        for (const card of card_container.children) {
            if (card.children[0].innerHTML == reserved_job.ime) {
                card.classList.add("display-none")
                card.classList.remove("card")
            }
        }
        */
    }
}