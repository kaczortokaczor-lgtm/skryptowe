const formularz = document.querySelector('#formularz-samochodu');
const poleMarka = document.querySelector('#marka');
const poleModel = document.querySelector('#model');
const poleRok = document.querySelector('#rok-produkcji');
const bladFormularza = document.querySelector('#blad-formularza');
const wyniki = document.querySelector('#wyniki');

class Car
{
    constructor(brand, model, year)
    {
        this.brand = brand;
        this.model = model;
        this.year = year;
    }

    displayInfo()
    {
        const opis = document.createElement('span');
        opis.textContent = `Car: ${this.brand} ${this.model}, Year: ${this.year}`;

        wyniki.innerHTML = opis.innerHTML;
        wyniki.hidden = false;
    }
}

function sprawdzDane(marka, model, rok)
{
    if (marka === '' || model === '' || poleRok.value.trim() === '')
    {
        return 'Wypełnij wszystkie pola formularza.';
    }

    if (!Number.isSafeInteger(rok) || rok < 1)
    {
        return 'Podaj rok produkcji jako dodatnią liczbę całkowitą.';
    }

    return '';
}

formularz.addEventListener('submit', (e) =>
{
    e.preventDefault();
    wyniki.hidden = true;

    const marka = poleMarka.value.trim();
    const model = poleModel.value.trim();
    const rok = poleRok.valueAsNumber;
    const blad = sprawdzDane(marka, model, rok);
    bladFormularza.textContent = blad;

    if (blad)
    {
        return;
    }

    const samochod = new Car(marka, model, rok);
    samochod.displayInfo();
});
