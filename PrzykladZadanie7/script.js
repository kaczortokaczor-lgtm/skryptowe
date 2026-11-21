const formularz = document.querySelector('#formularz-macierzy');
const bladFormularza = document.querySelector('#blad-formularza');
const wyniki = document.querySelector('#wyniki');
const tabelaWynikowa = document.querySelector('#macierz-wynikowa');

function pobierzMacierz(nazwa) {
    // Tablica dwuwymiarowa to tablica zawierająca inne tablice.
    // Wewnętrzne tablice są wierszami macierzy, np. [[1, 2, 3], [4, 5, 6], [7, 8, 9]].
    // macierz[0][1] oznacza element pierwszego wiersza i drugiej kolumny.
    const macierz = [];

    for (let wiersz = 0; wiersz < 3; wiersz++) {
        macierz[wiersz] = [];

        for (let kolumna = 0; kolumna < 3; kolumna++) {
            const pole = document.querySelector(`#${nazwa}-${wiersz}-${kolumna}`);
            const wartosc = pole.valueAsNumber;

            if (pole.value.trim() === '' || !Number.isFinite(wartosc)) {
                pole.setAttribute('aria-invalid', 'true');
                pole.focus();
                throw new Error(`Macierz ${nazwa.toUpperCase()}, wiersz ${wiersz + 1}, kolumna ${kolumna + 1}: wpisz poprawną liczbę.`);
            }

            macierz[wiersz][kolumna] = wartosc;
        }
    }

    return macierz;
}

function multiplyMatrices(matrixA, matrixB) {
    const macierzWynikowa = [];

    // Pierwsza pętla wybiera wiersz wyniku, a druga jego kolumnę.
    // Trzecia pętla mnoży kolejne elementy wiersza A przez odpowiadające
    // im elementy kolumny B i dodaje iloczyny. Tak obliczamy jedną komórkę.
    // Pętle są zagnieżdżone, ponieważ dla każdej pary wiersz-kolumna
    // trzeba przejść przez wszystkie trzy składniki sumy.
    for (let wiersz = 0; wiersz < 3; wiersz++) {
        macierzWynikowa[wiersz] = [];

        for (let kolumna = 0; kolumna < 3; kolumna++) {
            let suma = 0;

            for (let k = 0; k < 3; k++) {
                suma += matrixA[wiersz][k] * matrixB[k][kolumna];
            }

            macierzWynikowa[wiersz][kolumna] = suma;
        }
    }

    return macierzWynikowa;
}

function analizujMacierz(macierz) {
    let suma = 0;
    let najmniejszy = macierz[0][0];
    let najwiekszy = macierz[0][0];

    for (let wiersz = 0; wiersz < 3; wiersz++) {
        for (let kolumna = 0; kolumna < 3; kolumna++) {
            const element = macierz[wiersz][kolumna];

            if (!Number.isFinite(element)) {
                throw new Error('Wynik przekracza zakres liczbowy JavaScript. Wpisz mniejsze liczby.');
            }

            suma += element;
            if (element < najmniejszy) najmniejszy = element;
            if (element > najwiekszy) najwiekszy = element;
        }
    }

    if (!Number.isFinite(suma)) {
        throw new Error('Suma przekracza zakres liczbowy JavaScript. Wpisz mniejsze liczby.');
    }

    return { suma, najmniejszy, najwiekszy };
}

function wyswietlMacierz(macierz) {
    const wiersze = document.createDocumentFragment();

    for (let wiersz = 0; wiersz < 3; wiersz++) {
        const nowyWiersz = document.createElement('tr');

        for (let kolumna = 0; kolumna < 3; kolumna++) {
            nowyWiersz.insertCell().textContent = macierz[wiersz][kolumna];
        }

        wiersze.append(nowyWiersz);
    }

    tabelaWynikowa.replaceChildren(wiersze);
}

formularz.addEventListener('submit', (e) => {
    e.preventDefault();
    bladFormularza.textContent = '';
    wyniki.hidden = true;

    formularz.querySelectorAll('input').forEach((pole) => {
        pole.removeAttribute('aria-invalid');
    });

    try {
        const macierzA = pobierzMacierz('a');
        const macierzB = pobierzMacierz('b');
        const macierzWynikowa = multiplyMatrices(macierzA, macierzB);
        const { suma, najmniejszy, najwiekszy } = analizujMacierz(macierzWynikowa);

        wyswietlMacierz(macierzWynikowa);
        document.querySelector('#suma-elementow').textContent = suma;
        document.querySelector('#najwiekszy-element').textContent = najwiekszy;
        document.querySelector('#najmniejszy-element').textContent = najmniejszy;
        wyniki.hidden = false;
    } catch (blad) {
        bladFormularza.textContent = blad.message;
    }
});
