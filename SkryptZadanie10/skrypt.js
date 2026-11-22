class Product
{
    constructor(id, name, price, image)
    {
        this.id = id;
        this.name = name;
        this.price = price;
        this.image = image;
    }
}

class ShoppingCart
{
    constructor()
    {
        this.items = [];
    }

    addProduct(product)
    {
        this.items.push(product);
    }

    totalCost()
    {
        const sumaCentow = this.items.reduce((suma, produkt) => suma + Math.round(produkt.price * 100), 0);
        return sumaCentow / 100;
    }

    clearCart()
    {
        this.items.length = 0;
    }
}

let products = [];
const koszyk = new ShoppingCart();
const listaProduktow = document.querySelector('#lista-produktow');
const pozycjeKoszyka = document.querySelector('#pozycje-koszyka');
const wartoscKoszyka = document.querySelector('#wartosc-koszyka');
const liczbaProduktow = document.querySelector('#liczba-produktow');
const przyciskWyczysc = document.querySelector('#wyczysc-koszyk');
const przyciskPonow = document.querySelector('#ponow-pobieranie');
const komunikat = document.querySelector('#komunikat');
const formatCeny = new Intl.NumberFormat('pl-PL',
{
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'code'
});

async function loadProducts()
{
    przyciskPonow.hidden = true;
    komunikat.textContent = 'Pobieranie produktów…';

    try
    {
        const odpowiedz = await fetch('https://dummyjson.com/products?limit=10');
        if (!odpowiedz.ok)
        {
            throw new Error('Błąd pobierania listy produktów.');
        }

        const dane = await odpowiedz.json();
        products = dane.products.map((produkt) =>
            new Product(produkt.id, produkt.title, produkt.price, produkt.thumbnail));

        wyswietlProdukty();
        komunikat.textContent = products.length === 0 ? 'Brak dostępnych produktów.' : '';
    }
    catch (blad)
    {
        komunikat.textContent = 'Nie udało się pobrać produktów. Spróbuj ponownie.';
        przyciskPonow.hidden = false;
    }
}

function wyswietlProdukty()
{
    listaProduktow.replaceChildren();

    products.forEach((produkt) =>
    {
        const karta = document.createElement('article');
        karta.className = 'karta-produktu';
        karta.innerHTML = `
            <img alt="" loading="lazy" width="220" height="180">
            <h2></h2>
            <p class="cena"></p>
            <button type="button">Dodaj do koszyka</button>`;

        karta.querySelector('img').src = produkt.image;
        karta.querySelector('h2').textContent = produkt.name;
        karta.querySelector('.cena').textContent = formatCeny.format(produkt.price);
        karta.querySelector('button').addEventListener('click', () =>
        {
            koszyk.addProduct(produkt);
            wyswietlKoszyk();
        });

        listaProduktow.append(karta);
    });
}

function wyswietlKoszyk()
{
    pozycjeKoszyka.replaceChildren();
    const pustyKoszyk = koszyk.items.length === 0;

    if (pustyKoszyk)
    {
        const komorka = pozycjeKoszyka.insertRow().insertCell();
        komorka.colSpan = 2;
        komorka.textContent = 'Koszyk jest pusty';
    }

    koszyk.items.forEach((produkt) =>
    {
        const wiersz = pozycjeKoszyka.insertRow();
        wiersz.insertCell().textContent = produkt.name;
        wiersz.insertCell().textContent = formatCeny.format(produkt.price);
    });

    wartoscKoszyka.textContent = formatCeny.format(koszyk.totalCost());
    liczbaProduktow.textContent = koszyk.items.length;
    przyciskWyczysc.disabled = pustyKoszyk;
}

przyciskWyczysc.addEventListener('click', () =>
{
    koszyk.clearCart();
    wyswietlKoszyk();
});

przyciskPonow.addEventListener('click', loadProducts);

wyswietlKoszyk();
loadProducts();
