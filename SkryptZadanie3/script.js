const formularz = document.querySelector('#formularz');
const input = document.querySelector('#inp-form');
const error = document.querySelector('#err-form');
const wynik = document.querySelector('#wynik');

function slowaTablica(text)
{
    //rozdzielamy input na tablice złożoną ze stringów
    return text.normalize("NFC").match(/[\p{L}\p{Nd}]+/gu) ?? [];
}

function samoLicznik(text)
{
    //licznik samogłosek
    const samogloski = text.normalize("NFC").match(/[aąeęioóuy]/gi) ?? [];
    return samogloski.length;
}

function najdluszeSlwo(slowo)
{
    //pętla na najdłuższe słowo
    let najdluzsze = "";
    let najdluszeLenght = 0;
    for(const s of slowo)
    {
        const lenght = [...s].length;
        if(lenght > najdluszeLenght)
        {
            najdluzsze = s;
            najdluszeLenght = lenght;
        }
    }
    return najdluzsze;
}

function czyPalindrom(text)
{
    //przyrownanie slowa do jego odwróconej wersji
    const trim = text.replace(/\s/g, "").toLowerCase();
    const inverted = [...trim].reverse().join("");
    return trim === inverted;
}
formularz.addEventListener('submit', (e) => {
    e.preventDefault();
    const tekst = input.value;

    if (tekst.trim() === "") {
        error.textContent = "Wpisz tekst do analizy.";
        input.setAttribute("aria-invalid", "true");
        wynik.hidden = true;
        input.focus();
        return;
    }
    error.textContent = "";
    input.removeAttribute("aria-invalid");

    const slowa = slowaTablica(tekst);
    const tekstBezSpacji = tekst.replace(/\s/g, "");
    const znaki = tekst.match(/\p{Nd}/gu) ?? [];

    //licznik znaków
    document.querySelector("#licznik-z").textContent = [...tekst].length;
    //licznik bez spacji
    document.querySelector("#licznik-zbs").textContent = [...tekstBezSpacji].length;
    //licznik słów
    document.querySelector("#slow-l").textContent = slowa.length;
    //licznik samogłosek
    document.querySelector("#licznik-s").textContent = samoLicznik(tekst);
    //licznik cyfr
    document.querySelector("#licznik-l").textContent = znaki.length;
    //najdłuższe słowo
    document.querySelector("#najdluzsze").textContent = najdluszeSlwo(slowa) || "Brak";
    //sprawdzarka palindromu
    document.querySelector("#palindrom").textContent = czyPalindrom(tekst) ? "Tak" : "Nie";
    //Caps Lock
    document.querySelector("#wielkie-litery").textContent = tekst.toUpperCase();
    wynik.hidden = false;
});
