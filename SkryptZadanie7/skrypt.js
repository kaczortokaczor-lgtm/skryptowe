const formularz = document.querySelector('#formularz-macierzy');
const bladFormularza = document.querySelector('#blad-formularza');
const wyniki = document.querySelector('#wyniki');
const tabelaWynikowa = document.querySelector('#macierz-wynikowa');
function pobierzmacierz(nazwa)
{
    const macierz = [];

    for (let wiersz = 0; wiersz < 3; wiersz++) 
        {
            for (let kolumna = 0; kolumna < 3; kolumna++)
            {
                const pole = document.querySelector(`#${nazwa}-${wiersz}-${kolumna}`);
                const wartosc = pole.valueAsNumber;

                if (pole.value.trim() === '' || !Number.isFinite(wartosc))
                {
                    pole.setAttribute('aria-invalid', 'true');
                    pole.focus();
                    throw new Error(`Macierz ${nazwa.wartosc()}, wiersz ${wiersz + 1}, kolumna ${kolumna + 1} musi być liczbą.`);
                }
                macierz[wiersz][kolumna] = wartosc;
            }
        }
    return macierz;
}