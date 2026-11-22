const formularz = document.querySelector('#formularz-nip');
const poleNip = document.querySelector('#numer-nip');
const komunikatFormalny = document.querySelector('#komunikat-formalny');
const komunikatApi = document.querySelector('#komunikat-api');
const przyciskSprawdz = document.querySelector('#przycisk-sprawdz');
const wyniki = document.querySelector('#wyniki');

const adresApi = 'https://wykazpodatnikowvat.mf.gov.pl/api/search/nip/';
let aktywneZapytanie = null;

function sprawdzNip(nip)
{
    if (nip.length !== 10 || !/^[0-9]{10}$/.test(nip))
    {
        return false;
    }

    const wagi = [6, 5, 7, 2, 3, 4, 5, 6, 7];
    let suma = 0;

    for (let i = 0; i < wagi.length; i++)
    {
        suma += Number(nip[i]) * wagi[i];
    }

    const cyfraKontrolna = suma % 11;
    return cyfraKontrolna !== 10 && cyfraKontrolna === Number(nip[9]);
}

function wyswietlPoprawnosc(nip)
{
    const poprawny = sprawdzNip(nip);
    komunikatFormalny.textContent = poprawny
        ? 'Numer NIP jest poprawny pod względem formalnym'
        : 'Niepoprawny numer NIP';
    komunikatFormalny.className = poprawny ? 'komunikat poprawny' : 'komunikat blad';
    poleNip.setAttribute('aria-invalid', String(!poprawny));
    return poprawny;
}

function pobierzDate()
{
    const formatDaty = new Intl.DateTimeFormat('en-CA',
    {
        timeZone: 'Europe/Warsaw',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    const czesci = formatDaty.formatToParts(new Date());
    const rok = czesci.find((czesc) => czesc.type === 'year').value;
    const miesiac = czesci.find((czesc) => czesc.type === 'month').value;
    const dzien = czesci.find((czesc) => czesc.type === 'day').value;
    return `${rok}-${miesiac}-${dzien}`;
}

function wyczyscWyniki()
{
    if(aktywneZapytanie)
    {
        aktywneZapytanie.abort();
        aktywneZapytanie = null;
    }

    wyniki.hidden = true;
    komunikatApi.textContent = '';
    komunikatApi.className = 'komunikat';
    przyciskSprawdz.disabled = false;
    formularz.removeAttribute('aria-busy');
}

async function pobierzPodmiot(nip, data, sygnal)
{
    const adres = `${adresApi}${nip}?date=${data}`;
    const odpowiedz = await fetch(adres, { signal: sygnal });

    if (!odpowiedz.ok)
    {
        throw new Error(`API Ministerstwa Finansów zwróciło błąd HTTP ${odpowiedz.status}. Spróbuj ponownie później.`);
    }

    const dane = await odpowiedz.json();

    if (!dane || typeof dane !== 'object')
    {
        throw new Error('API zwróciło odpowiedź w nieoczekiwanym formacie. Spróbuj ponownie później.');
    }

    if (dane.code)
    {
        throw new Error(`Błąd API: ${dane.message || dane.code}`);
    }

    if (!dane.result || dane.result.subject === undefined)
    {
        throw new Error('API zwróciło odpowiedź w nieoczekiwanym formacie. Spróbuj ponownie później.');
    }

    const podmiot = dane.result.subject;

    if (podmiot !== null && (podmiot.nip !== nip || typeof podmiot.name !== 'string'
        || typeof podmiot.statusVat !== 'string'))
    {
        throw new Error('API zwróciło niekompletne lub niezgodne dane podmiotu. Spróbuj ponownie później.');
    }

    return podmiot;
}

function wyswietlPodmiot(podmiot, data)
{
    document.querySelector('#nazwa-firmy').textContent = podmiot.name;
    document.querySelector('#nip-firmy').textContent = podmiot.nip;
    document.querySelector('#status-vat').textContent = podmiot.statusVat;
    document.querySelector('#data-sprawdzenia').textContent = data;
    wyniki.hidden = false;
}

poleNip.addEventListener('input', () =>
{
    wyczyscWyniki();
    wyswietlPoprawnosc(poleNip.value);
});

formularz.addEventListener('submit', async (e) =>
{
    e.preventDefault();
    wyczyscWyniki();

    const nip = poleNip.value;

    if (!wyswietlPoprawnosc(nip))
    {
        return;
    }

    const data = pobierzDate();
    const kontroler = new AbortController();
    aktywneZapytanie = kontroler;
    przyciskSprawdz.disabled = true;
    formularz.setAttribute('aria-busy', 'true');
    komunikatApi.textContent = 'Sprawdzanie w wykazie podatników VAT…';

    const limitCzasu = setTimeout(() => kontroler.abort(), 15000);

    try
    {
        const podmiot = await pobierzPodmiot(nip, data, kontroler.signal);

        if (aktywneZapytanie !== kontroler)
        {
            return;
        }

        if (podmiot === null)
        {
            komunikatApi.textContent = `Nie znaleziono podmiotu o podanym NIP w wykazie podatników VAT na dzień ${data}.`;
            return;
        }

        wyswietlPodmiot(podmiot, data);
        komunikatApi.textContent = 'Odnaleziono podmiot w wykazie podatników VAT.';
    }
    catch (blad)
    {
        if (aktywneZapytanie !== kontroler)
        {
            return;
        }

        komunikatApi.className = 'komunikat blad';

        if (blad.name === 'AbortError')
        {
            komunikatApi.textContent = 'Przekroczono czas oczekiwania na API. Spróbuj ponownie.';
        }
        else if (blad instanceof TypeError)
        {
            komunikatApi.textContent = 'Nie udało się połączyć z API Ministerstwa Finansów. Sprawdź połączenie z internetem i spróbuj ponownie.';
        }
        else if (blad instanceof SyntaxError)
        {
            komunikatApi.textContent = 'API zwróciło nieprawidłową odpowiedź. Spróbuj ponownie później.';
        }
        else
        {
            komunikatApi.textContent = blad.message;
        }
    }
    finally
    {
        clearTimeout(limitCzasu);

        if (aktywneZapytanie === kontroler)
        {
            aktywneZapytanie = null;
            przyciskSprawdz.disabled = false;
            formularz.removeAttribute('aria-busy');
        }
    }
});
