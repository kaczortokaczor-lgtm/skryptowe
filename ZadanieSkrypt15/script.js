const poleId = document.getElementById('idKlienta');
const poleImie = document.getElementById('imie');
const poleNazwisko = document.getElementById('nazwisko');
const lista = document.getElementById('lista');
const komunikat = document.getElementById('komunikat');

// Wysyła żądanie do PHP i odczytuje odpowiedź JSON.
async function wywolajApi(url, opcje) {
    const odpowiedz = await fetch(url, opcje);
    const dane = await odpowiedz.json();

    if (!odpowiedz.ok) {
        throw new Error(dane.error || `Błąd HTTP ${odpowiedz.status}`);
    }

    return dane;
}

// Pobiera klientów z bazy i wyświetla ich na stronie.
async function pokazOsoby() {
    const osoby = await wywolajApi('api.php');

    lista.replaceChildren();

    for (const osoba of osoby) {
        const wiersz = document.createElement('li');
        wiersz.value = osoba.autor_id;
        wiersz.textContent = `${osoba.imie} ${osoba.nazwisko}`;
        lista.appendChild(wiersz);
    }
}

// Przygotowuje adres oraz dane zależnie od wybranej operacji.
async function wykonajOperacje(metoda) {
    try {
        let url = 'api.php';
        const opcje = { method: metoda };

        if (metoda === 'PUT' || metoda === 'DELETE') {
            const id = poleId.valueAsNumber;

            if (!Number.isInteger(id) || id < 1) {
                throw new Error('Wpisz ID osoby widoczne na liście.');
            }

            url += `?autor_id=${id}`;
        }

        if (metoda === 'POST' || metoda === 'PUT') {
            const imie = poleImie.value.trim();
            const nazwisko = poleNazwisko.value.trim();

            if (imie === '' || nazwisko === '') {
                throw new Error('Uzupełnij imię i nazwisko.');
            }

            opcje.headers = { 'Content-Type': 'application/json' };
            opcje.body = JSON.stringify({ imie, nazwisko });
        }

        const wynik = await wywolajApi(url, opcje);
        komunikat.textContent = wynik.message;

        await pokazOsoby();
    } catch (error) {
        komunikat.textContent = error.message;
    }
}

document.getElementById('dodaj').addEventListener('click', () => {
    wykonajOperacje('POST');
});

document.getElementById('zmien').addEventListener('click', () => {
    wykonajOperacje('PUT');
});

document.getElementById('usun').addEventListener('click', () => {
    wykonajOperacje('DELETE');
});

// Pierwsze pobranie listy od razu po wejściu na stronę.
pokazOsoby().catch(error => {
    komunikat.textContent = error.message;
});