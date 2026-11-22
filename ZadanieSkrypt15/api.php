<?php

header('Content-Type: application/json; charset=UTF-8');

// Dane połączenia z MySQL
$host = '127.0.0.1';
$port = 3306;
$dbname = 'ksiazki';
$user = 'root';
$pass = 'Trissmerigold';

// Wysyła odpowiedź JSON i kończy wykonywanie skryptu.
function odpowiedz($dane, $kod = 200)
{
    http_response_code($kod);
    echo json_encode($dane, JSON_UNESCAPED_UNICODE);
    exit;
}

// Odczytuje imię i nazwisko wysłane przez JavaScript.
function pobierzDaneAutora()
{
    $tresc = file_get_contents('php://input');
    $dane = json_decode($tresc, true);

    if (!is_array($dane)
        || !is_string($dane['imie'] ?? null)
        || !is_string($dane['nazwisko'] ?? null)) {
        odpowiedz(['error' => 'Prześlij imię i nazwisko autora jako JSON.'], 400);
    }

    $imie = trim($dane['imie']);
    $nazwisko = trim($dane['nazwisko']);

    if ($imie === '' || $nazwisko === '') {
        odpowiedz(['error' => 'Imię i nazwisko nie mogą być puste.'], 400);
    }

    return [$imie, $nazwisko];
}

// Połączenie z bazą ksiazki
try {
    $pdo = new PDO(
        "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    odpowiedz(['error' => 'Nie udało się połączyć z bazą MySQL.'], 500);
}

$metoda = $_SERVER['REQUEST_METHOD'];

// Dla adresu api.php?autor_id=2 zmienna $autorId otrzyma wartość 2.
$autorId = filter_input(INPUT_GET, 'autor_id', FILTER_VALIDATE_INT);

if ($autorId === false || ($autorId !== null && $autorId < 1)) {
    odpowiedz(['error' => 'autor_id musi być dodatnią liczbą całkowitą.'], 400);
}

try {
    switch ($metoda) {
        case 'GET':
            // GET api.php – pobranie wszystkich autorów
            if ($autorId === null) {
                $stmt = $pdo->query(
                    'SELECT autor_id, imie, nazwisko
                     FROM autor
                     ORDER BY autor_id'
                );

                odpowiedz($stmt->fetchAll());
            }

            // GET api.php?autor_id=2 – pobranie jednego autora
            $stmt = $pdo->prepare(
                'SELECT autor_id, imie, nazwisko
                 FROM autor
                 WHERE autor_id = ?'
            );
            $stmt->execute([$autorId]);

            $autor = $stmt->fetch();

            if ($autor === false) {
                odpowiedz(['error' => 'Nie znaleziono autora o podanym ID.'], 404);
            }

            odpowiedz($autor);

        case 'POST':
            // Dodanie autora. MySQL nadaje mu autor_id.
            [$imie, $nazwisko] = pobierzDaneAutora();

            $stmt = $pdo->prepare(
                'INSERT INTO autor (imie, nazwisko)
                 VALUES (?, ?)'
            );
            $stmt->execute([$imie, $nazwisko]);

            odpowiedz([
                'message' => 'Dodano autora.',
                'autor_id' => (int) $pdo->lastInsertId()
            ], 201);

        case 'PUT':
            // Zmiana danych autora wskazanego w adresie
            if ($autorId === null) {
                odpowiedz(['error' => 'Podaj autor_id autora do edycji.'], 400);
            }

            [$imie, $nazwisko] = pobierzDaneAutora();

            $stmt = $pdo->prepare(
                'UPDATE autor
                 SET imie = ?, nazwisko = ?
                 WHERE autor_id = ?'
            );
            $stmt->execute([$imie, $nazwisko, $autorId]);

            // Przy wpisaniu tych samych danych MySQL może zgłosić 0 zmian.
            // Sprawdzamy wtedy, czy autor o takim ID istnieje.
            if ($stmt->rowCount() === 0) {
                $sprawdz = $pdo->prepare(
                    'SELECT autor_id FROM autor WHERE autor_id = ?'
                );
                $sprawdz->execute([$autorId]);

                if ($sprawdz->fetch() === false) {
                    odpowiedz(['error' => 'Nie znaleziono autora o podanym ID.'], 404);
                }
            }

            odpowiedz(['message' => 'Zapisano dane autora.']);

        case 'DELETE':
            // Usunięcie autora wskazanego w adresie
            if ($autorId === null) {
                odpowiedz(['error' => 'Podaj autor_id autora do usunięcia.'], 400);
            }

            $stmt = $pdo->prepare(
                'DELETE FROM autor WHERE autor_id = ?'
            );
            $stmt->execute([$autorId]);

            if ($stmt->rowCount() === 0) {
                odpowiedz(['error' => 'Nie znaleziono autora o podanym ID.'], 404);
            }

            odpowiedz(['message' => 'Usunięto autora.']);

        default:
            header('Allow: GET, POST, PUT, DELETE');
            odpowiedz(['error' => 'Nieobsługiwana metoda HTTP.'], 405);
    }
} catch (PDOException $e) {
    odpowiedz(['error' => 'Nie udało się wykonać zapytania SQL.'], 500);
}