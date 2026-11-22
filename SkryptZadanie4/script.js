const formularz = document.querySelector('#formularz-studencki');
const studentLicznik = document.querySelector('#licznik-studentów');
const minPunkty = document.querySelector('#minumum-punkty');
const maxPunkty = document.querySelector('#maksimum-punkty');
const formError = document.querySelector('#form-error');
const wyniki = document.querySelector('#wyniki');
const studenciDB = document.querySelector('#studenci-tabela');
const punkt = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 2 });
const ocenaFormat = new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 1 });

function ocenaSilnik(punkty) 
{
    if (punkty >= 90) return 5;
    if (punkty >= 80) return 4.5;
    if (punkty >= 70) return 4;
    if (punkty >= 60) return 3.5;
    if (punkty >= 50) return 3;
    return 2;
}

function generatorStudentow(liczbaStudentow, minimum, maksimum) 
{
    const studenci = [];
    const zbior = maksimum - minimum + 1;

    for (let id = 1; id <= liczbaStudentow; id++) 
    {
        const punkty = Math.floor(Math.random() * zbior) + minimum;
        const student = { id, punkty, ocena: ocenaSilnik(punkty) };
        studenci.push(student);
    }

    return studenci;
}

function obliczSrednia(studenci) 
{
    let suma = 0;

    for (const student of studenci) {
        suma += student.punkty;
    }

    return suma / studenci.length;
}

function znajdzSkrajneWyniki(studenci) 
{
    let najlepszyStudent = studenci[0];
    let najslabszyStudent = studenci[0];

    for (const student of studenci) {
        if (student.punkty > najlepszyStudent.punkty) najlepszyStudent = student;
        if (student.punkty < najslabszyStudent.punkty) najslabszyStudent = student;
    }

    return { najlepszyStudent, najslabszyStudent };
}

function studentTab(studenci) 
{
    const wiersze = document.createDocumentFragment();

    studenci.forEach((student) => 
    {
        const wiersz = document.createElement('tr');
        const zdane = student.ocena >= 3;
        const status = zdane ? 'Zaliczył' : 'Nie zaliczył';

        if (!zdane) wiersz.classList.add('failed');

        wiersz.insertCell().textContent = `Student ${student.id}`;
        wiersz.insertCell().textContent = punkt.format(student.punkty);
        wiersz.insertCell().textContent = ocenaFormat.format(student.ocena);
        wiersz.insertCell().textContent = status;
        wiersze.append(wiersz);
    });

    studenciDB.replaceChildren(wiersze);
}

function sprawdzDane(liczbaStudentow, minimum, maksimum) 
{
    if (!Number.isSafeInteger(liczbaStudentow) || liczbaStudentow < 1) 
    {
        return 'Podaj dodatnią liczbę całkowitą studentów.';
    }
    if (!Number.isSafeInteger(minimum) || !Number.isSafeInteger(maksimum)) 
    {
        return 'Podaj minimalną i maksymalną liczbę punktów jako liczby całkowite.';
    }
    if (minimum >= maksimum) 
    {
        return 'Minimalna liczba punktów musi być mniejsza od maksymalnej.';
    }
    if (!Number.isSafeInteger(maksimum - minimum + 1)) 
    {
        return 'Podaj mniejszy zakres punktów.';
    }

    return '';
}

formularz.addEventListener('submit', (e) => 
{
    e.preventDefault();

    const liczbaStudentow = studentLicznik.valueAsNumber;
    const minimum = minPunkty.valueAsNumber;
    const maksimum = maxPunkty.valueAsNumber;
    const error = sprawdzDane(liczbaStudentow, minimum, maksimum);
    formError.textContent = error;

    if (error) 
    {
        wyniki.hidden = true;
        return;
    }

    const studenci = generatorStudentow(liczbaStudentow, minimum, maksimum);
    const zaliczeniStudenci = studenci.filter((student) => student.ocena >= 3);
    const { najlepszyStudent, najslabszyStudent } = znajdzSkrajneWyniki(studenci);

    document.querySelector('#średnia-punkty').textContent = `${punkt.format(obliczSrednia(studenci))} pkt`;
    document.querySelector('#licznik-zaliczen').textContent = zaliczeniStudenci.length;
    document.querySelector('#licznik-przegrywów').textContent = studenci.length - zaliczeniStudenci.length;
    document.querySelector('#najwyższy').textContent = `Student ${najlepszyStudent.id}, ${punkt.format(najlepszyStudent.punkty)} pkt`;
    document.querySelector('#najniższy').textContent = `Student ${najslabszyStudent.id}, ${punkt.format(najslabszyStudent.punkty)} pkt`;

    studentTab(studenci);
    wyniki.hidden = false;
});
